// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

contract Administration {
    // --- Data ---
    uint256 public contractEnabled = 0;

    // --- Auth ---
    mapping(address => uint256) public authorizedAccounts;

    /**
     * @notice Add auth to an account
     * @param account Account to add auth to
     */
    function addAuthorization(address account)
        external
        isAuthorized
        contractIsEnabled
    {
        authorizedAccounts[account] = 1;
        emit AddAuthorization(account);
    }

    /**
     * @notice Remove auth from an account
     * @param account Account to add auth to
     */
    function removeAuthorization(address account)
        external
        isAuthorized
        contractIsEnabled
    {
        authorizedAccounts[account] = 0;
        emit RemoveAuthorization(account);
    }

    /**
     * @notice Checks whether msg.sender can call an authed function
     */
    modifier isAuthorized {
        require(
            authorizedAccounts[msg.sender] == 1,
            "CollateralLock/account-not-authorized"
        );
        _;
    }

    /**
     * @notice Checks whether the contract is enabled
     */
    modifier contractIsEnabled {
        require(contractEnabled == 1, "CollateralLock/contract-not-enabled");
        _;
    }

    // --- Administration ---

    function enableContract() external isAuthorized {
        contractEnabled = 1;
        emit EnableContract();
    }

    /**
     * @notice Disable this contract
     */
    function disableContract() external isAuthorized {
        contractEnabled = 0;
        emit DisableContract();
    }

    // --- Events ---
    event AddAuthorization(address account);
    event RemoveAuthorization(address account);
    event EnableContract();
    event DisableContract();
}