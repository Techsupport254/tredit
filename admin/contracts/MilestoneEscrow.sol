// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MilestoneEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_APPROVAL, COMPLETE, DISPUTE }
    State public state;

    address public immutable client;
    address public immutable freelancer;
    address public immutable arbitrator;
    uint256 public immutable totalAmount;
    uint256 public immutable disputeTimeLimit;
    uint256 public currentMilestone;
    uint256 public milestoneCount;
    uint256 public lastInteraction;

    struct Milestone {
        uint256 amount;
        bool isPaid;
    }

    mapping(uint256 => Milestone) public milestones;

    event MilestoneFunded(uint256 indexed milestoneIndex, uint256 amount);
    event MilestoneApproved(uint256 indexed milestoneIndex);
    event PaymentReleased(uint256 indexed milestoneIndex, uint256 amount);
    event DisputeRaised(uint256 indexed milestoneIndex);
    event DisputeResolved(uint256 indexed milestoneIndex, address winner);
    event RefundIssued(uint256 indexed milestoneIndex, uint256 amount);

    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this function");
        _;
    }

    modifier onlyFreelancer() {
        require(msg.sender == freelancer, "Only freelancer can call this function");
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
        address _freelancer,
        address _arbitrator,
        uint256[] memory _milestoneAmounts,
        uint256 _disputeTimeLimit
    ) payable {
        require(msg.value > 0, "Total payment must be greater than zero");
        require(_milestoneAmounts.length > 0, "At least one milestone required");

        client = msg.sender;
        freelancer = _freelancer;
        arbitrator = _arbitrator;
        totalAmount = msg.value;
        disputeTimeLimit = _disputeTimeLimit;
        lastInteraction = block.timestamp;

        uint256 sum = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            milestones[i] = Milestone({
                amount: _milestoneAmounts[i],
                isPaid: false
            });
            sum += _milestoneAmounts[i];
        }
        require(sum == totalAmount, "Sum of milestones must equal total payment");
        milestoneCount = _milestoneAmounts.length;
        currentMilestone = 0;
        state = State.AWAITING_PAYMENT;
    }

    function fundMilestone() external onlyClient inState(State.AWAITING_PAYMENT) {
        require(currentMilestone < milestoneCount, "All milestones funded");
        state = State.AWAITING_APPROVAL;
        emit MilestoneFunded(currentMilestone, milestones[currentMilestone].amount);
    }

    function approveMilestone() external onlyClient inState(State.AWAITING_APPROVAL) {
        require(currentMilestone < milestoneCount, "All milestones completed");
        Milestone storage milestone = milestones[currentMilestone];
        require(!milestone.isPaid, "Milestone already paid");

        milestone.isPaid = true;
        state = State.AWAITING_PAYMENT;
        lastInteraction = block.timestamp;

        (bool success, ) = freelancer.call{value: milestone.amount}("");
        require(success, "Transfer to freelancer failed");

        emit MilestoneApproved(currentMilestone);
        emit PaymentReleased(currentMilestone, milestone.amount);

        currentMilestone++;
        if (currentMilestone == milestoneCount) {
            state = State.COMPLETE;
        }
    }

    function raiseDispute() external {
        require(
            msg.sender == client || msg.sender == freelancer,
            "Only client or freelancer can raise a dispute"
        );
        require(state == State.AWAITING_APPROVAL, "No active milestone to dispute");
        require(
            block.timestamp <= lastInteraction + disputeTimeLimit,
            "Dispute period has expired"
        );

        state = State.DISPUTE;
        emit DisputeRaised(currentMilestone);
    }

    function resolveDispute(address winner) external onlyArbitrator inState(State.DISPUTE) {
        require(
            winner == client || winner == freelancer,
            "Winner must be client or freelancer"
        );

        Milestone storage milestone = milestones[currentMilestone];
        if (winner == client) {
            state = State.AWAITING_PAYMENT;
            lastInteraction = block.timestamp;
        } else {
            milestone.isPaid = true;
            state = State.AWAITING_PAYMENT;
            lastInteraction = block.timestamp;

            (bool success, ) = freelancer.call{value: milestone.amount}("");
            require(success, "Transfer to freelancer failed");

            emit PaymentReleased(currentMilestone, milestone.amount);
            currentMilestone++;
            if (currentMilestone == milestoneCount) {
                state = State.COMPLETE;
            }
        }
        emit DisputeResolved(currentMilestone, winner);
    }

    function refundClient() external onlyClient {
        require(state != State.COMPLETE, "Contract already completed");
        require(
            block.timestamp > lastInteraction + disputeTimeLimit,
            "Dispute period not yet expired"
        );

        uint256 refundAmount = 0;
        for (uint256 i = currentMilestone; i < milestoneCount; i++) {
            if (!milestones[i].isPaid) {
                refundAmount += milestones[i].amount;
                milestones[i].isPaid = true;
            }
        }
        state = State.COMPLETE;

        (bool success, ) = client.call{value: refundAmount}("");
        require(success, "Refund to client failed");

        emit RefundIssued(currentMilestone, refundAmount);
    }
}
