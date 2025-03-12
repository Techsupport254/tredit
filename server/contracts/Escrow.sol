// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GoodsEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED, DISPUTE }
    State public state;

    address public immutable buyer;
    address public immutable seller;
    address public immutable arbitrator;
    uint256 public immutable amount;
    uint256 public immutable disputeTimeLimit;
    uint256 public deliveryDeadline;
    uint256 public lastInteraction;

    event PaymentDeposited(address indexed buyer, uint256 amount);
    event DeliveryConfirmed(address indexed buyer);
    event PaymentReleased(address indexed seller, uint256 amount);
    event RefundIssued(address indexed buyer, uint256 amount);
    event DisputeRaised(address indexed party);
    event DisputeResolved(address indexed arbitrator, address winner);

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only arbitrator can call this function");
        _;
    }

    modifier inState(State expectedState) {
        require(state == expectedState, "Invalid state");
        _;
    }

    constructor(
        address _seller,
        address _arbitrator,
        uint256 _deliveryTimeframe,
        uint256 _disputeTimeLimit
    ) payable {
        require(msg.value > 0, "Payment must be greater than zero");

        buyer = msg.sender;
        seller = _seller;
        arbitrator = _arbitrator;
        amount = msg.value;
        disputeTimeLimit = _disputeTimeLimit;
        deliveryDeadline = block.timestamp + _deliveryTimeframe;
        lastInteraction = block.timestamp;
        state = State.AWAITING_DELIVERY;

        emit PaymentDeposited(buyer, amount);
    }

    function confirmDelivery() external onlyBuyer inState(State.AWAITING_DELIVERY) {
        require(block.timestamp <= deliveryDeadline, "Delivery confirmation period expired");

        state = State.COMPLETE;
        (bool success, ) = seller.call{value: amount}("");
        require(success, "Transfer to seller failed");

        emit DeliveryConfirmed(buyer);
        emit PaymentReleased(seller, amount);
    }

    function requestRefund() external onlyBuyer inState(State.AWAITING_DELIVERY) {
        require(block.timestamp > deliveryDeadline, "Delivery period has not expired");

        state = State.REFUNDED;
        (bool success, ) = buyer.call{value: amount}("");
        require(success, "Refund to buyer failed");

        emit RefundIssued(buyer, amount);
    }

    function raiseDispute() external {
        require(msg.sender == buyer || msg.sender == seller, "Only buyer or seller can raise a dispute");
        require(state == State.AWAITING_DELIVERY, "No active transaction to dispute");
        require(block.timestamp <= deliveryDeadline + disputeTimeLimit, "Dispute period expired");

        state = State.DISPUTE;
        emit DisputeRaised(msg.sender);
    }

    function resolveDispute(address winner) external onlyArbitrator inState(State.DISPUTE) {
        require(winner == buyer || winner == seller, "Winner must be buyer or seller");

        state = (winner == buyer) ? State.REFUNDED : State.COMPLETE;
        (bool success, ) = winner.call{value: amount}("");
        require(success, "Transfer failed");

        emit DisputeResolved(arbitrator, winner);
        if (winner == buyer) {
            emit RefundIssued(buyer, amount);
        } else {
            emit PaymentReleased(seller, amount);
        }
    }
}
