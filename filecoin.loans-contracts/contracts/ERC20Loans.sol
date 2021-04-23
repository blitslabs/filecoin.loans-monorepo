// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./AssetTypes.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IPriceAggregator.sol";
import "./interfaces/IBLAKE2b.sol";

contract ERC20Loans is ReentrancyGuard, AssetTypes {
    using SafeMath for uint256;

    // --- Loans Data ---
    mapping(uint256 => Loan) loans;
    uint256 public loanIdCounter;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256) public userLoansCount;
    uint256 public acceptExpirationPeriod = 10872; // 3 days

    enum State {
        Funded,
        Approved,
        Withdrawn,
        Repaid,
        PaybackRefunded,
        Closed,
        Canceled
    }

    struct Loan {
        // Actors
        address payable borrower;
        address payable lender;
        // FIL Addresses
        bytes filBorrower;
        bytes filLender;
        // Hashes
        bytes32 secretHashA1;
        bytes32 secretHashB1;
        // Secrets
        bytes secretA1;
        bytes secretB1;
        // Expiration Dates
        uint256 loanExpiration;
        uint256 acceptExpiration;
        uint256 createdAt;
        uint256 loanExpirationPeriod;
        // Loan Details
        uint256 principal;
        uint256 interest;
        uint256 collateral;
        // FIL
        bytes32 paymentChannelId;        
        // Loan State
        State state;
        // token
        IERC20 token;
    }

    // Blake2b
    IBLAKE2b blake2b;

    constructor(address _blake2b) {
        blake2b = IBLAKE2b(_blake2b);
        contractEnabled = 1;
        authorizedAccounts[msg.sender] = 1;
        emit AddAuthorization(msg.sender);
    }

    /**
     * @notice Create a loan offer
     * @param _secretHashB1 The hash of secretB1
     * @param _filLender Lender's FIL address
     * @param _principal The principal (amount) of the loan
     * @param _contractAddress The contract address of the ERC20 token
     * @param _loanExpirationPeriod Loan length
     */
    function createLoanOffer(
        bytes32 _secretHashB1,
        bytes memory _filLender,
        uint256 _principal,
        uint256 _interest,
        address _contractAddress,
        uint256 _loanExpirationPeriod
    ) public nonReentrant contractIsEnabled returns (bool, uint256) {
        require(_principal > 0, "ERC20Loans/invalid-principal-amount");
        require(
            assetTypes[_contractAddress].enabled == true,
            "ERC20Loans/asset-type-disabled"
        );
        require(
            _principal <= assetTypes[_contractAddress].maxLoanAmount &&
                _principal >= assetTypes[_contractAddress].minLoanAmount,
            "ERC20Loans/invalid-principal-range"
        );

        // Check allowance
        IERC20 token = IERC20(_contractAddress);
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(
            allowance >= _principal,
            "ERC20Loans/insufficient-token-allowance"
        );

        // Transfer in tokens
        require(
            token.transferFrom(msg.sender, address(this), _principal),
            "ERC20Loans/token-transfer-failed"
        );

        // Increment loanIdCounter
        loanIdCounter = loanIdCounter + 1;

        // Add Loan to mapping
        loans[loanIdCounter] = Loan({
            borrower: address(0),
            lender: msg.sender,
            filBorrower: "",
            filLender: _filLender,
            secretHashA1: "",
            secretHashB1: _secretHashB1,
            secretA1: "",
            secretB1: "",
            loanExpiration: 0,
            acceptExpiration: 0,
            loanExpirationPeriod: _loanExpirationPeriod,
            createdAt: 0,
            principal: _principal,
            interest: _interest,
            collateral: 0,
            paymentChannelId: "",            
            token: token,
            state: State.Funded
        });

        // Add LoanId to user
        userLoans[msg.sender].push(loanIdCounter);

        // Increase userLoansCount
        userLoansCount[msg.sender] = userLoansCount[msg.sender] + 1;

        emit CreateLoanOffer(
            loanIdCounter,
            msg.sender,
            _principal,
            address(token)
        );
    }

    /**
     * @notice Set Borrower and accept FIL collateral offer
     * @param _loanId The ID of the loan
     * @param _borrower The address of the borrower
     * @param _filBorrower The borrower's FIL address
     * @param _secretHashA1 The lender's hashed secretA1
     * @param _paymentChannelId The ID of the FIL Payment Channel
     * @param _collateralAmount The FIL amount used as collateral     
     */
    function approveRequest(
        uint256 _loanId,
        address payable _borrower,
        bytes memory _filBorrower,
        bytes32 _secretHashA1,
        bytes32 _paymentChannelId,
        uint256 _collateralAmount
    ) public nonReentrant contractIsEnabled returns (bool) {
        require(
            loans[_loanId].state == State.Funded,
            "ERC20Loans/loan-not-funded"
        );
        require(
            msg.sender == loans[_loanId].lender,
            "ERC20Loans/account-not-authorized"
        );
        require(_borrower != address(0), "ERC20Loans/invalid-borrower");
        require(_collateralAmount > 0, "ERC20Loans/invalid-collateral-amount");

        // Add LoanId to user
        userLoans[_borrower].push(_loanId);

        // Increase userLoanCount
        userLoansCount[_borrower] = userLoansCount[_borrower] + 1;

        // Update loan details
        loans[_loanId].state = State.Approved;
        loans[_loanId].borrower = _borrower;
        loans[_loanId].secretHashA1 = _secretHashA1;
        loans[_loanId].loanExpiration = block.timestamp.add(
            loans[_loanId].loanExpirationPeriod
        );
        loans[_loanId].acceptExpiration = block
            .timestamp
            .add(loans[_loanId].loanExpirationPeriod)
            .add(acceptExpirationPeriod);
        loans[_loanId].createdAt = block.timestamp;

        // FIL collateral details
        loans[_loanId].collateral = _collateralAmount;
        loans[_loanId].filBorrower = _filBorrower;
        loans[_loanId].paymentChannelId = _paymentChannelId;

        emit ApproveRequest(
            _loanId,
            _borrower,
            _filBorrower,
            _secretHashA1,
            _paymentChannelId,
            _collateralAmount
        );
        return true;
    }

    /**
     * @notice Withdraw the loan's principal
     * @param _loanId The ID of the loan
     * @param _secretA1 Borrower's secretA1
     */
    function withdraw(uint256 _loanId, bytes memory _secretA1)
        public
        nonReentrant
        contractIsEnabled
    {
        require(
            loans[_loanId].state == State.Approved,
            "ERC20Loans/loan-not-approved"
        );
        require(
            blake2b.blake2b_256(_secretA1) == loans[_loanId].secretHashA1,
            "ERC20Loans/invalid-secretA1"
        );
        require(
            block.timestamp <= loans[_loanId].loanExpiration,
            "ERC20Loans/loan-expired"
        );

        loans[_loanId].state = State.Withdrawn;
        loans[_loanId].secretA1 = _secretA1;

        require(
            loans[_loanId].token.transfer(
                loans[_loanId].borrower,
                loans[_loanId].principal
            ),
            "ERC20Loans/token-transfer-failed"
        );
        emit Withdraw(
            _loanId,
            loans[_loanId].borrower,
            loans[_loanId].principal,
            address(loans[_loanId].token),
            loans[_loanId].secretA1
        );
    }

    /**
     * @notice Payback loan's principal + interests
     * @param _loanId The ID of the loan
     */
    function payback(uint256 _loanId) public contractIsEnabled nonReentrant {
        require(
            loans[_loanId].state == State.Withdrawn,
            "ERC20Loans/invalid-loan-state"
        );
        require(
            block.timestamp <= loans[_loanId].loanExpiration,
            "ERC20Loans/loan-expired"
        );
        uint256 repayment =
            loans[_loanId].principal.add(loans[_loanId].interest);

        // Check allowance
        uint256 allowance =
            loans[_loanId].token.allowance(msg.sender, address(this));
        require(
            allowance >= repayment,
            "ERC20Loans/insufficiente-token-allowance"
        );

        loans[_loanId].state = State.Repaid;
        require(
            loans[_loanId].token.transferFrom(
                msg.sender,
                address(this),
                repayment
            ),
            "ERC20Loans/token-transfer-failed"
        );
        emit Payback(
            _loanId,
            loans[_loanId].borrower,
            repayment,
            address(loans[_loanId].token)
        );
    }

    /**
     * @notice Accept the borrower's repayment of the principal
     * @param _loanId The ID of the loan
     * @param _secretB1 Lender's secretB1 (signature to allow multisig wallet to unlock FIL collateral)
     */
    function acceptRepayment(uint256 _loanId, bytes memory _secretB1)
        public
        contractIsEnabled
        nonReentrant
    {
        require(
            blake2b.blake2b_256(_secretB1) == loans[_loanId].secretHashB1,
            "ERC20Loans/invalid-secretB1"
        );
        require(
            block.timestamp <= loans[_loanId].acceptExpiration,
            "ERC20Loans/accept-period-expired"
        );
        loans[_loanId].state = State.Closed;
        loans[_loanId].secretB1 = _secretB1;
        uint256 repayment =
            loans[_loanId].principal.add(loans[_loanId].interest);
        require(
            loans[_loanId].token.transfer(loans[_loanId].lender, repayment),
            "ERC20Loans/token-transfer-failed"
        );
        emit AcceptRepayment(
            _loanId,
            repayment,
            address(loans[_loanId].token),
            _secretB1
        );
    }

    /**
     * @notice Refund the payback amount
     * @param _loanId The ID of the loan
     */
    function refundPayback(uint256 _loanId)
        public
        contractIsEnabled
        nonReentrant
    {
        require(
            block.timestamp > loans[_loanId].acceptExpiration,
            "ERC20Loans/accept-period-expired"
        );
        require(
            loans[_loanId].state == State.Repaid,
            "ERC20Loans/loan-not-repaid"
        );
        loans[_loanId].state = State.PaybackRefunded;
        uint256 refund = loans[_loanId].principal.add(loans[_loanId].interest);
        loans[_loanId].principal = 0;
        loans[_loanId].interest = 0;
        require(
            loans[_loanId].token.transfer(loans[_loanId].borrower, refund),
            "ERC20Loans/token-transfer-failed"
        );
        emit RefundPayback(
            _loanId,
            loans[_loanId].borrower,
            refund,
            address(loans[_loanId].token)
        );
    }

    /**
     * @notice Cancel the loan before the borrower withdraws the loan's principal
     * @param _loanId The ID of the loan
     * @param _secretB1 Lender's secretB1
     */
    function cancelLoan(uint256 _loanId, bytes memory _secretB1)
        public
        contractIsEnabled
        nonReentrant
    {
        require(
            blake2b.blake2b_256(_secretB1) == loans[_loanId].secretHashB1,
            "ERC20Loans/invalid-secretB1"
        );
        require(
            loans[_loanId].state == State.Funded ||
                loans[_loanId].state == State.Approved
        );
        loans[_loanId].state = State.Canceled;
        uint256 principal = loans[_loanId].principal;
        loans[_loanId].principal = 0;
        loans[_loanId].secretB1 = _secretB1;
        require(
            loans[_loanId].token.transfer(loans[_loanId].lender, principal),
            "ERC20Loans/token-transfer-failed"
        );
        emit CancelLoan(
            _loanId,
            principal,
            address(loans[_loanId].token),
            _secretB1
        );
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
            bytes[2] memory filAddresses,
            bytes32[2] memory secretHashes,
            bytes[2] memory secrets,
            uint256[3] memory expirations,
            uint256[3] memory details,
            bytes32 paymentChannelId,
            address token,
            State state
        )
    {
        actors = [
            address(loans[_loanId].borrower),
            address(loans[_loanId].lender)
        ];
        filAddresses = [loans[_loanId].filBorrower, loans[_loanId].filLender];
        secretHashes = [
            loans[_loanId].secretHashA1,
            loans[_loanId].secretHashB1
        ];
        secrets = [loans[_loanId].secretA1, loans[_loanId].secretB1];
        expirations = [
            loans[_loanId].loanExpiration,
            loans[_loanId].acceptExpiration,
            loans[_loanId].loanExpirationPeriod
        ];
        details = [
            loans[_loanId].principal,
            loans[_loanId].interest,
            loans[_loanId].collateral
        ];
        paymentChannelId =  loans[_loanId].paymentChannelId;
        token = address(loans[_loanId].token);
        state = loans[_loanId].state;
    }

    /**
     * @notice Get account loans
     * @param _account User account
     */
    function getAccountLoans(address _account)
        public
        view
        returns (uint256[] memory)
    {
        return userLoans[_account];
    }

    /**
     * @notice Change accept expiration period
     * @param _data The new accept expiration period
     */
    function modifyAcceptExpirationPeriod(uint256 _data)
        external
        isAuthorized
        contractIsEnabled
        returns (bool)
    {
        require(
            acceptExpirationPeriod > 0,
            "ERC20Loans/invalid-acceptExpirationPeriod"
        );
        acceptExpirationPeriod = _data;
        return true;
    }

    // --- Events ---
    event CreateLoanOffer(
        uint256 loanId,
        address lender,
        uint256 principal,
        address token
    );

    event ApproveRequest(
        uint256 loanId,
        address borrower,
        bytes filBorrower,
        bytes32 secretHashA1,
        bytes32 paymentChannelId,
        uint256 collateralAmount
    );

    event Withdraw(
        uint256 loanId,
        address borrower,
        uint256 amount,
        address token,
        bytes secretA1
    );
    event Payback(
        uint256 loanId,
        address borrower,
        uint256 amount,
        address token
    );
    event AcceptRepayment(
        uint256 loanId,
        uint256 amount,
        address token,
        bytes secretB1
    );
    event RefundPayback(
        uint256 loanId,
        address borrower,
        uint256 amount,
        address token
    );
    event CancelLoan(
        uint256 loanId,
        uint256 amount,
        address token,
        bytes secretB1
    );
}
