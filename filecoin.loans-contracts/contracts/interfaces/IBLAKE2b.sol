// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

interface IBLAKE2b {
    function blake2b_256(bytes memory input) external view returns (bytes32);
}