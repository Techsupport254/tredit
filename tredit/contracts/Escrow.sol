// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Payment.sol";

contract GoodsEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED, DISPUTE }
    State public state;

    address public immutable buyer;
    address public immutable seller;
    address public immutable arbitrator;
    uint256 public amount;
    uint256 public immutable disputeTimeLimit;
    uint256 public deliveryDeadline;
    uint256 public lastInteraction;
    bytes32 public paymentId;
    bool public isFiatPayment;

    Payment public paymentContract;

    event PaymentDeposited(address indexed buyer, uint256 amount, bool isFiat);
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
        uint256 _disputeTimeLimit,
        address _paymentContract
    ) {
        buyer = msg.sender;
        seller = _seller;
        arbitrator = _arbitrator;
        disputeTimeLimit = _disputeTimeLimit;
        deliveryDeadline = block.timestamp + _deliveryTimeframe;
        lastInteraction = block.timestamp;
        state = State.AWAITING_PAYMENT;
        paymentContract = Payment(_paymentContract);
    }

    function initiatePayment(
        uint256 _amount,
        address token,
        bool _isFiat
    ) external onlyBuyer inState(State.AWAITING_PAYMENT) {
        amount = _amount;
        isFiatPayment = _isFiat;

        if (_isFiat) {
            // For fiat payments, the backend will call recordFiatPayment
            // after Paystack verification
            state = State.AWAITING_DELIVERY;
            emit PaymentDeposited(buyer, amount, true);
        } else {
            // For blockchain payments, initiate through Payment contract
            paymentId = paymentContract.initiateBlockchainPayment(
                address(this),
                amount,
                token
            );
            state = State.AWAITING_DELIVERY;
            emit PaymentDeposited(buyer, amount, false);
        }
    }

    function confirmDelivery() external onlyBuyer inState(State.AWAITING_DELIVERY) {
        require(block.timestamp <= deliveryDeadline, "Delivery confirmation period expired");

        state = State.COMPLETE;
        paymentContract.completePayment(paymentId);

        emit DeliveryConfirmed(buyer);
        emit PaymentReleased(seller, amount);
    }

    function requestRefund() external onlyBuyer inState(State.AWAITING_DELIVERY) {
        require(block.timestamp > deliveryDeadline, "Delivery period has not expired");

        state = State.REFUNDED;
        if (!isFiatPayment) {
            paymentContract.completePayment(paymentId);
        }

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
        if (!isFiatPayment) {
            paymentContract.completePayment(paymentId);
        }

        emit DisputeResolved(arbitrator, winner);
        if (winner == buyer) {
            emit RefundIssued(buyer, amount);
        } else {
            emit PaymentReleased(seller, amount);
        }
    }
}
