// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

contract Ownable {
    address _owner;

    function owner() public view returns (address) {
        return _owner;
    }

    constructor() {
        _owner = msg.sender;
    }

    modifier onlyOwner {
        require(
            msg.sender == _owner,
            "Ownable: Only the owner can access this feature"
        );
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: Invalid address");
        _owner = newOwner;
        emit OwnershipTransferred(newOwner);
    }

    event OwnershipTransferred(address newOwner);
}

contract AggregatorTest is Ownable {
    mapping(uint256 => Round) rounds;

    struct Round {
        uint256 roundId;
        int256 price;
        uint256 timestamp;
    }

    uint256 private answerCounter = 0;

    function latestAnswer() external view returns (int256) {
        return rounds[answerCounter].price;
    }

    function latestTimestamp() external view returns (uint256) {
        return rounds[answerCounter].timestamp;
    }

    function latestRound() external view returns (uint256) {
        return answerCounter;
    }

    function getAnswer(uint256 roundId) external view returns (int256) {
        return rounds[roundId].price;
    }

    function getTimestamp(uint256 roundId) external view returns (uint256) {
        return rounds[roundId].timestamp;
    }

    function updateAnswer(int256 price) public onlyOwner returns (bool) {
        answerCounter = answerCounter + 1;
        rounds[answerCounter] = Round({
            roundId: answerCounter,
            price: price,
            timestamp: block.timestamp
        });
        emit AnswerUpdated(price, answerCounter, block.timestamp);
        return true;
    }

    event AnswerUpdated(
        int256 indexed current,
        uint256 indexed roundId,
        uint256 timestamp
    );
    event NewRound(
        uint256 indexed roundId,
        address indexed startedBy,
        uint256 startedAt
    );
}
