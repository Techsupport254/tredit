// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    struct EscrowTransaction {
        string id;
        uint256 amount;
        string status;
        address buyer;
        address seller;
        uint256 createdAt;
        uint256 updatedAt;
        string conditions;
    }

    EscrowTransaction[] public transactions;
    mapping(string => uint256) private transactionIndexById;

    event EscrowCreated(string id, address buyer, address seller, uint256 amount);
    event EscrowReleased(string id);
    event EscrowRefunded(string id);
    event EscrowDisputed(string id);

    function createEscrow(
        string memory id,
        address seller,
        string memory conditions
    ) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(transactionIndexById[id] == 0, "Transaction ID already exists");

        EscrowTransaction memory newTx = EscrowTransaction({
            id: id,
            amount: msg.value,
            status: "PENDING",
            buyer: msg.sender,
            seller: seller,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            conditions: conditions
        });

        transactions.push(newTx);
        transactionIndexById[id] = transactions.length;

        emit EscrowCreated(id, msg.sender, seller, msg.value);
    }

    function releaseEscrow(string memory id) external {
        uint256 index = transactionIndexById[id] - 1;
        require(index < transactions.length, "Transaction not found");
        EscrowTransaction storage tx = transactions[index];
        
        require(msg.sender == tx.buyer, "Only buyer can release");
        require(keccak256(bytes(tx.status)) == keccak256(bytes("PENDING")), "Invalid status");

        tx.status = "RELEASED";
        tx.updatedAt = block.timestamp;
        
        (bool success, ) = tx.seller.call{value: tx.amount}("");
        require(success, "Transfer failed");

        emit EscrowReleased(id);
    }

    function refundEscrow(string memory id) external {
        uint256 index = transactionIndexById[id] - 1;
        require(index < transactions.length, "Transaction not found");
        EscrowTransaction storage tx = transactions[index];
        
        require(msg.sender == tx.buyer, "Only buyer can refund");
        require(keccak256(bytes(tx.status)) == keccak256(bytes("PENDING")), "Invalid status");

        tx.status = "REFUNDED";
        tx.updatedAt = block.timestamp;
        
        (bool success, ) = tx.buyer.call{value: tx.amount}("");
        require(success, "Transfer failed");

        emit EscrowRefunded(id);
    }

    function disputeEscrow(string memory id) external {
        uint256 index = transactionIndexById[id] - 1;
        require(index < transactions.length, "Transaction not found");
        EscrowTransaction storage tx = transactions[index];
        
        require(msg.sender == tx.buyer || msg.sender == tx.seller, "Only buyer or seller can dispute");
        require(keccak256(bytes(tx.status)) == keccak256(bytes("PENDING")), "Invalid status");

        tx.status = "DISPUTED";
        tx.updatedAt = block.timestamp;

        emit EscrowDisputed(id);
    }

    function getEscrowTransactions() external view returns (EscrowTransaction[] memory) {
        return transactions;
    }

    function getEscrowTransaction(string memory id) external view returns (EscrowTransaction memory) {
        uint256 index = transactionIndexById[id] - 1;
        require(index < transactions.length, "Transaction not found");
        return transactions[index];
    }
}
