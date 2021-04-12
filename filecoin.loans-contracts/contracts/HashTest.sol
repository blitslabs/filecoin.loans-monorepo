// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.3;

import "./BLAKE2b.sol";
// import "hardhat/console.sol";

contract HashTest is BLAKE2b {
    function compareHash(bytes memory preimage, bytes32 secretHash) public view returns (bool){
        require(blake2b_256(preimage) == secretHash, "invalid-preimage");
        return true;
    }
}
