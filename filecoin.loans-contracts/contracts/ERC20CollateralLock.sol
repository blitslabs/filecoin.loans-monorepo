// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./AssetTypes.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IPriceAggregator.sol";
import "./interfaces/IBLAKE2b.sol";

contract ERC20CollateralLock is ReentrancyGuard, AssetTypes {
    using SafeMath for uint256;

    // --- Loans Data ---
    mapping(uint256 => Loan) loans;
    uint256 public loanIdCounter;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256) public userLoansCount;

    // Global params
    uint256 minCollateralizationRatio = 1.1e18; // 110%
    uint256 minLoanExpirationPeriod = 2851200; // 33 days

    enum State {Funded, Locked, Seized, Closed}

    struct Loan {
        // Actors
        address payable borrower;
        address payable lender;
        bytes32 bCoinBorrower;
        bytes32 bCoinLender;
        // Hashes
        bytes32 secretHashA1;
        bytes32 secretHashB1;
        // Secrets
        bytes secretA1;
        bytes secretB1;
        // Expirations
        uint256 loanExpiration;
        uint256 loanExpirationPeriod;
        uint256 createdAt;
        // Collateral
        uint256 collateralAmount;
        IERC20 token;
        // Loan Details
        bytes32 paymentChannelId;
        uint256 principalAmount;
        // Prices
        uint256 lockPrice;
        uint256 liquidationPrice;
        // Loan State
        State state;
    }

    // Oracle
    IPriceAggregator internal priceFeed;

    // Blake2b
    IBLAKE2b blake2b;

    // --- Init ---
    constructor(address _blake2b) {
        blake2b = IBLAKE2b(_blake2b);
        contractEnabled = 1;
        authorizedAccounts[msg.sender] = 1;
        emit AddAuthorization(msg.sender);
    }

    /**
     * @notice Create a FIL borrow request
     * @param _secretHashA1 secretA1's hash
     * @param _bCoinBorrower Borrower's FIL address
     * @param _collateralAmount The amount of collateral to lock
     * @param _contractAddress The contract address of the token to lock
     * @param _loanExpirationPeriod Loan length
     */
    function createBorrowRequest(
        bytes32 _secretHashA1,
        bytes32 _bCoinBorrower,
        uint256 _collateralAmount,
        address _contractAddress,
        uint256 _loanExpirationPeriod
    ) public nonReentrant contractIsEnabled returns (bool, uint256) {
        require(
            _collateralAmount > 0,
            "ERC20CollateralLock/invalid-collateral-amount"
        );
        require(
            _contractAddress != address(0),
            "ERC20CollateralLock/invalid-token-address"
        );
        require(
            assetTypes[_contractAddress].enabled == true,
            "ERC20CollateralLock/asset-not-enabled"
        );
        require(
            _loanExpirationPeriod > minLoanExpirationPeriod,
            "ERC20CollateralLock/invalid-expiration-period"
        );

        // Check Allowance
        IERC20 token = IERC20(_contractAddress);
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(
            allowance >= _collateralAmount,
            "ERC20CollateralLock/insufficient-token-allowance"
        );

        // Transfer in token amount
        require(
            token.transferFrom(msg.sender, address(this), _collateralAmount),
            "ERC20CollateralLock/token-transfer-failed"
        );

        // Increment loanIdCounter1
        loanIdCounter = loanIdCounter + 1;

        // Add Loan to mapping
        loans[loanIdCounter] = Loan({
            borrower: msg.sender,
            lender: address(0),
            bCoinBorrower: _bCoinBorrower,
            bCoinLender: "",
            secretHashA1: _secretHashA1,
            secretHashB1: "",
            secretA1: "",
            secretB1: "",
            loanExpiration: 0,
            loanExpirationPeriod: _loanExpirationPeriod,
            createdAt: 0,
            collateralAmount: _collateralAmount,
            token: token,
            paymentChannelId: "",
            principalAmount: 0,
            lockPrice: 0,
            liquidationPrice: 0,
            state: State.Funded
        });

        // Add LoanId to user
        userLoans[msg.sender].push(loanIdCounter);

        // Increase userLoansCount
        userLoansCount[msg.sender] = userLoansCount[msg.sender] + 1;

        emit CreateBorrowRequest(
            loanIdCounter,
            msg.sender,
            _collateralAmount,
            address(token)
        );

        return (true, loanIdCounter);
    }

    /**
     * @notice Cancel a FIL borrow request
     * @param _loanId The ID of the loan to cancel
     */
    function cancelBorrowRequest(uint256 _loanId)
        public
        nonReentrant
        returns (bool)
    {
        require(
            loans[_loanId].state == State.Funded,
            "ERC20CollateralLock/invalid-request-state"
        );
        require(
            loans[_loanId].borrower == msg.sender,
            "ERC20CollateralLock/account-not-authorized"
        );

        // Update loan state
        loans[_loanId].state = State.Closed;

        // Zero amount
        uint256 collateralAmount = loans[_loanId].collateralAmount;
        loans[_loanId].collateralAmount = 0;

        // Refund collateral
        require(
            loans[_loanId].token.transfer(
                loans[_loanId].lender,
                collateralAmount
            ),
            "ERC20CollateralLock/token-transfer-failed"
        );
        return true;
    }

    /**
     * @notice Set Lender and accept FIL loan offer
     * @param _loanId The ID of the loan
     * @param _lender The address of the lender
     * @param _bCoinLender The lender's FIL address
     * @param _secretHashB1 The lender's hashed secretB1
     * @param _paymentChannelId The ID of the FIL Payment Channel
     * @param _principalAmount The FIL amount to borrow
     */
    function acceptOffer(
        uint256 _loanId,
        address payable _lender,
        bytes32 _bCoinLender,
        bytes32 _secretHashB1,
        bytes32 _paymentChannelId,
        uint256 _principalAmount
    ) public nonReentrant contractIsEnabled returns (bool) {
        require(
            loans[_loanId].state == State.Funded,
            "ERC20CollateralLock/collateral-not-locked"
        );
        require(
            msg.sender == loans[_loanId].borrower,
            "ERC20CollateralLock/account-not-authorized"
        );
        require(_lender != address(0), "ERC20CollateralLock/invalid-lender");
        require(_principalAmount > 0, "ERC20CollateralLock/invalid-principal");

        // Get FIL price
        int256 latestAnswer = priceFeed.latestAnswer();
        require(latestAnswer > 0, "ERC20CollateralLock/invalid-oracle-price");

        uint256 latestPrice = uint256(latestAnswer).mul(1e10);
        uint256 principalValue = _principalAmount.mul(latestPrice);

        // Check min collateralization ratio
        uint256 minCollateral = principalValue.mul(minCollateralizationRatio);
        require(
            loans[_loanId].collateralAmount > minCollateral,
            "ERC20CollateralLock/insufficient-collateral"
        );

        // Add LoanId to lender
        userLoans[_lender].push(_loanId);

        // Increase userLoanCount
        userLoansCount[_lender] = userLoansCount[_lender] + 1;

        // Update Loan Details
        loans[_loanId].state = State.Locked;
        loans[_loanId].lender = _lender;
        loans[_loanId].bCoinLender = _bCoinLender;
        loans[_loanId].secretHashB1 = _secretHashB1;
        loans[_loanId].paymentChannelId = _paymentChannelId;
        loans[_loanId].principalAmount = _principalAmount;
        loans[_loanId].lockPrice = latestPrice;

        // Set loan expirations
        loans[_loanId].loanExpiration = block.timestamp.add(
            loans[_loanId].loanExpirationPeriod
        );
        loans[_loanId].createdAt = block.timestamp;

        emit AcceptOffer(
            _loanId,
            _lender,
            _bCoinLender,
            _secretHashB1,
            _paymentChannelId,
            _principalAmount
        );

        return true;
    }

    /**
     * @notice Used when the Lender accepts the payback or cancels the loan
     * @param _loanId The ID of the loan
     * @param _secretB1 Lender's secretB1
     */
    function unlockCollateral(uint256 _loanId, bytes memory _secretB1)
        public
        nonReentrant
        returns (bool)
    {
        require(
            loans[_loanId].state == State.Locked,
            "ERC20CollateralLock/collateral-not-locked"
        );
        require(
            block.timestamp <= loans[_loanId].loanExpiration,
            "ERC20CollateralLock/loan-period-expired"
        );
        require(
            blake2b.blake2b_256(_secretB1) == loans[_loanId].secretHashB1,
            "ERC20CollateralLock/invalid-secretb1"
        );
        require(
            loans[_loanId].collateralAmount > 0,
            "ERC20CollateralLock/invalid-collateral-amount"
        );

        // Change the loan's state
        loans[_loanId].state = State.Closed;
        loans[_loanId].secretB1 = _secretB1;

        // Update collateralAmount
        uint256 collateralAmount = loans[_loanId].collateralAmount;
        loans[_loanId].collateralAmount = 0;

        // Refund total collateral amount to the borrower
        loans[_loanId].token.transfer(
            loans[_loanId].borrower,
            collateralAmount
        );

        emit UnlockCollateral(
            _loanId,
            loans[_loanId].borrower,
            collateralAmount,
            address(loans[_loanId].token)
        );

        return true;
    }

    /**
     * @notice Can be used after the loan expiration to seize part of the collateral (lender) and return the remainder to the borrower
     * @param _loanId The ID of the loan
     * @param _secretA1 Borrower's secretA1
     */
    function seizeCollateral(uint256 _loanId, bytes memory _secretA1)
        public
        nonReentrant
        returns (bool)
    {
        require(
            blake2b.blake2b_256(_secretA1) == loans[_loanId].secretHashA1,
            "ERC20CollateralLock/invalid-secretA1"
        );
        require(
            block.timestamp > loans[_loanId].loanExpiration,
            "ERC20CollateralLock/loan-period-active"
        );
        require(
            loans[_loanId].state == State.Locked,
            "ERC20CollateralLock/collateral-not-locked"
        );
        require(
            loans[_loanId].collateralAmount > 0,
            "ERC20CollateralLock/invalid-collateral-amount"
        );

        // Get latestPrice
        uint256 latestPrice = uint256(priceFeed.latestAnswer()).mul(1e10);
        require(latestPrice > 0, "ERC20CollateralLock/invalid-price");

        uint256 principalValue =
            loans[_loanId].principalAmount.mul(latestPrice);

        uint256 seizableCollateral;

        if (loans[_loanId].collateralAmount < principalValue) {
            seizableCollateral = loans[_loanId].collateralAmount;
        } else {
            seizableCollateral = loans[_loanId].collateralAmount.sub(
                principalValue
            );
        }

        uint256 refundableCollateral =
            loans[_loanId].collateralAmount.sub(seizableCollateral);

        // Zero collater amount
        loans[_loanId].collateralAmount = 0;

        // Update loan's state
        loans[_loanId].state = State.Seized;
        loans[_loanId].secretA1 = _secretA1;
        loans[_loanId].liquidationPrice = latestPrice;

        // Refund seized collateral to lender
        require(
            loans[_loanId].token.transfer(
                loans[_loanId].lender,
                seizableCollateral
            ),
            "ERC20CollateralLock/token-transfer-failed"
        );

        // Refund refundable collateral to borrower
        if (refundableCollateral > 0) {
            loans[_loanId].token.transfer(
                loans[_loanId].borrower,
                refundableCollateral
            );
        }

        // Emit Events
        emit SeizeCollateral(
            _loanId,
            loans[_loanId].lender,
            seizableCollateral,
            address(loans[_loanId].token)
        );

        emit UnlockRefundableCollateral(
            _loanId,
            loans[_loanId].borrower,
            refundableCollateral,
            address(loans[_loanId].token)
        );

        return true;
    }

    /**
     * @notice Get information about a loan
     * @param _loanId The ID of the loan
     */
    function fetchLoan(uint256 _loanId)
        public
        view
        returns (
            address[2] memory actors,
            bytes32[2] memory bCoinAddresses,
            bytes32[2] memory secretHashes,
            bytes[2] memory secrets,
            uint256[2] memory expirations,
            uint256[4] memory details,
            bytes32 paymentChannelId,
            address token,
            State state
        )
    {
        actors = [
            address(loans[_loanId].borrower),
            address(loans[_loanId].lender)
        ];

        bCoinAddresses = [
            loans[_loanId].bCoinBorrower,
            loans[_loanId].bCoinLender
        ];

        secretHashes = [
            loans[_loanId].secretHashA1,
            loans[_loanId].secretHashB1
        ];

        secrets = [loans[_loanId].secretA1, loans[_loanId].secretB1];

        expirations = [loans[_loanId].loanExpiration, loans[_loanId].createdAt];

        details = [
            loans[_loanId].collateralAmount,
            loans[_loanId].principalAmount,
            loans[_loanId].lockPrice,
            loans[_loanId].liquidationPrice
        ];

        paymentChannelId = loans[_loanId].paymentChannelId;
        token = address(loans[_loanId].token);
        state = loans[_loanId].state;
    }

    /**
     * @notice Get Account loans
     * @param _account User account
     */
    function getAccountLoans(address _account)
        public
        view
        returns (uint256[] memory)
    {
        return userLoans[_account];
    }

    // --- Events ---
    event CreateBorrowRequest(
        uint256 loanId,
        address borrower,
        uint256 collateralAmount,
        address token
    );

    event AcceptOffer(
        uint256 loanId,
        address lender,
        bytes32 bCoinLender,
        bytes32 secretHashB1,
        bytes32 paymentChannelId,
        uint256 principalAmount
    );

    event UnlockCollateral(
        uint256 loanId,
        address borrower,
        uint256 collateralAmount,
        address token
    );

    event SeizeCollateral(
        uint256 loanId,
        address lender,
        uint256 amount,
        address token
    );

    event UnlockRefundableCollateral(
        uint256 loanId,
        address borrower,
        uint256 amount,
        address token
    );
}
