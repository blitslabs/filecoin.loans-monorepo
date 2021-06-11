[![Twitter](https://img.shields.io/twitter/follow/blitslabs?style=social)](https://twitter.com/blitslabs)

# Filecoin.loans Protocol
Monorepo containing the implementation of the Filecoin Loans protocol.

## Project Structure

## System Overview
Filecoin Loans is the first decentralized, non-custodial and trustless DeFi protocol developed natively on Filecoin's blockchain. The protocol provides a mechanism for creating cross-chain collateralized loans between Filecoin and EVM-compatible blockchains. Specifically, the system leverages Filecoin's built-in Payment Channel actor to make it work as a Hash Time Locked Contract, and enable users to borrow ERC20-based stablecoins by locking native FIL as collateral, or to borrow native FIL by locking ERC20-based stablecoins as collateral. The protocol is based on the [Atomic Loans](https://arxiv.org/pdf/1901.05117.pdf) paper (conceptualized for Bitcoin and Ethereum), and adapted for Filecoin, to enable the creation of p2p cross-chain collateralized debt instruments without intermediaries, bridges or validators on Filecoin.

## Motivation
At the moment of the protocol's conceptualization (November, 2020), Filecoin's circulating supply is around 2%, so liquidity is scarce and limited. This lack of liquidity is exacerbated due to FIL miners requiring collateral in order to complete storage deals to offer decentralized storage to the network's users. Likewise, FIL holders do not have mechanisms to trade the time-value of their holdings. As a consequence, centralized lending solutions have emerged to provide liquidity to the market; however, these lending services are centralized entities that are not accesible to everyone, and can seize or steal the funds of its users. On the other hand, Filecoin's blockchain does not currently have a Virtual Machine that accepts externally created smart contracts, so only a few built-in smart contracts (actors) are available to develop DeFi protocols, like the Payment Channel Actor. For these reasons, Filecoin Loans was created to enable debt creation and repayment between Filecoin's blockchain and EVM-compatible blockchains without intermediaries or the users having to give up custody of their assets. Thus, the first decentralized, non-custodial and trustless DeFi protocol on Filecoin was born.

## Value
deThe Filecoin ecosystem and tools are in early stages of development, so the completion of the Filecoin Loans protocol entailed multiple challenges that resulted in the creation of several valuable libraries and tools that can be reused by other developers and projects to keep building and expanding Filecoin's ecosystem. Furthermore, Filecoin Loans represents the first decentralized, non-custodial and trustless DeFi protocol on Filecoin, and a reference of how it can be possible to develop other types of decentralized applications without users having to give up custody of their assets on Filecoin.

## Contributions to the ecosystem

### Filecoin JS Signer
[Filecoin JS Signer](https://github.com/blitslabs/filecoin-js-signer) was developed as part of the Filecoin Loans project to  interact with Filecoin's built-in actors, specially the Payment Channel actor. It is a pure Typescript / Javascript signing library that enables the creation and signing of messages to send FIL and interact with Filecoin's built-in actors. This pure JS library can be easily loaded from React Native or Web environments to interact with the Filecoin network in a non-custodial manner without having to load WASM binaries.

### Filecoin Loans Solidity Contracts

### Filecoin Loans (Web dApp)

### Filecoin Loans (Mobile Wallet)


### Blake2b-256 Solidity
[Blake2b-256 Solidity](https://github.com/blitslabs/filecoin-blake2b-solidity) is an implementation of the Blake2b hash function in Solidity, developed by ConsenSys' Project Alchemy as part of the [EIP-152](https://eips.ethereum.org/EIPS/eip-152) in 2016. The library was updated to Solidity 0.7.3 and modified to output the Blake2b-256 variation of the hash function, used by Filecoin. This implementation can be used to create interoperability between Filecoin and EVM-compatible blockchains through HTLCs, for example.

### Filecoin Signing Tools
Zondax's [Filecoin Signing Tools](https://github.com/zondax/filecoin-signing-tools) library, written in Rust and WASM, was forked and modified to support the inclussion of preimages and secret hashes in the creation and redemption of Payment Channel vouchers. On the other hand, at the time of development of Filecoin Loans, this library's pure Javascript version was still under development and missing functional methods to interact with Filecoin's buit-in actors. Furtheremore, we considered loading the WASM version of the library on web environments and React Native added additional complexity to applications. For these reasons, we decided to develop [Filecoin JS Signer](https://github.com/blitslabs/filecoin-js-signer) in Typescript.


## Protocol Design