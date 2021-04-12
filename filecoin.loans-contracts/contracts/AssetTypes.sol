// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Administration.sol";

contract AssetTypes is Administration {
    using SafeMath for uint256;

    // --- Data ---
    struct AssetType {
        address contractAddress;
        uint256 minLoanAmount;
        uint256 maxLoanAmount;
        bool enabled;
    }

    // Asset Types mapping
    mapping(address => AssetType) public assetTypes;

    /**
     * @notice Get information about an Asset Type
     * @param _contractAddress The contract address of the given asset
     */
    function getAssetType(address _contractAddress)
        public
        view
        returns (
            uint256 minLoanAmount,
            uint256 maxLoanAmount,
            bool enabled
        )
    {
        minLoanAmount = assetTypes[_contractAddress].minLoanAmount;
        maxLoanAmount = assetTypes[_contractAddress].maxLoanAmount;
        enabled = assetTypes[_contractAddress].enabled;
    }

    /**
     * @notice Add AssetType
     * @param _contractAddress The contract address of the asset
     * @param _minLoanAmount The minimum allowed amount to be used
     * @param _maxLoanAmount The maximum allowed amount to be used
     */
    function addAssetType(
        address _contractAddress,
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount
    ) external isAuthorized contractIsEnabled {
        require(
            _contractAddress != address(0),
            "AssetTypes/invalid-contract-address"
        );
        require(_minLoanAmount > 0, "AssetTypes/invalid-minLoanAmount");
        require(_maxLoanAmount > 0, "AssetTypes/invalid-maxLoanAmount");
        require(
            assetTypes[_contractAddress].minLoanAmount == 0,
            "AssetTypes/assetType-already-exists"
        );

        assetTypes[_contractAddress] = AssetType({
            contractAddress: _contractAddress,
            minLoanAmount: _minLoanAmount,
            maxLoanAmount: _maxLoanAmount,
            enabled: true
        });

        emit AddAssetType(_contractAddress, _minLoanAmount, _maxLoanAmount);
    }

    /**
     * @notice Modify AssetType related parameters
     * @param _contractAddress The contract address of the ERC20 token
     * @param _parameter The name of the parameter modified
     * @param _data The new value for the parameter
     */
    function modifyAssetTypeParams(
        address _contractAddress,
        bytes32 _parameter,
        uint256 _data
    ) external isAuthorized contractIsEnabled {
        require(_data > 0, "AssetTypes/null-data");
        require(_contractAddress != address(0), "AssetTypes/invalid-assetType");
        if (_parameter == "maxLoanAmount")
            assetTypes[_contractAddress].maxLoanAmount = _data;
        else if (_parameter == "minLoanAmount")
            assetTypes[_contractAddress].minLoanAmount = _data;
        else revert("AssetTypes/modify-unrecognized-param");
        emit ModifyAssetTypeParams(_contractAddress, _parameter, _data);
    }

    /**
     * @notice Enable / Disable Asset Type
     * @param _contractAddress The address of the ERC20 token
     * @param _value The boolean value
     */
    function toggleAssetTypeState(address _contractAddress, bool _value)
        external
        isAuthorized
        contractIsEnabled
    {
        require(_contractAddress != address(0), "AssetTypes/invalid-assetType");
        assetTypes[_contractAddress].enabled = _value;
        emit ToggleAssetTypeState(_contractAddress, _value);
    }

    // --- Events ---
    event AddAssetType(
        address contractAddress,
        uint256 minLoanAmount,
        uint256 maxLoanAmount
    );

    event ModifyAssetTypeParams(
        address contractAddress,
        bytes32 parameter,
        uint256 data
    );
    event ToggleAssetTypeState(address contractAddress, bool value);
}
