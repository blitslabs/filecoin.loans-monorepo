// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;
import "hardhat/console.sol";

contract VerifySignatureTest {
    bytes32 message =
        hex"56f49dcf89699a215f496779675cf37680ea806eb27d67e672b105395b8b6e05";
    address lender = address(0xB617A64f816DE66Be3deFd362AD898877735f6c9);

    function verifySignature(bytes memory _signature) public view returns (bool) {
        console.log(recover(message, _signature));
        require(recover(message, _signature) == lender, "invalid-signature");
        return true;
    }

    function recover(bytes32 _hash, bytes memory _sig)
        public
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;

        // Check the signature length
        if (_sig.length != 65) {
            return (address(0));
        }

        // Divide the signature in r, s and v variables
        // ecrecover takes the signature parameters, and the only way to get them currently is to use assembly
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        // Version of signature should be 27 or 28, but 0 and 1 are also possible
        if (v < 27) {
            v += 27;
        }

        // If the version is correct return the signer address
        if (v != 27 && v != 28) {
            return (address(0));
        } else {
            // solium-disable-next-line arg-overflow
            return ecrecover(_hash, v, r, s);
        }
    }
}
