// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Dispute is Ownable {
    uint256 private _disputeIds;

    // Dispute status enum
    enum DisputeStatus {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }

    // Dispute reason enum
    enum DisputeReason {
        DAMAGED_ITEM,
        WRONG_ITEM,
        MISSING_ITEM,
        LATE_DELIVERY,
        QUALITY_ISSUE,
        OTHER
    }

    // Evidence type enum
    enum EvidenceType {
        IMAGE,
        VIDEO,
        CHAT_HISTORY,
        ORDER_DETAILS,
        PRODUCT_DETAILS,
        SHIPPING_DETAILS,
        PAYMENT_DETAILS,
        OTHER
    }

    // Resolution type enum
    enum ResolutionType {
        REFUND,
        REPLACEMENT,
        PARTIAL_REFUND,
        STORE_CREDIT,
        OTHER
    }

    // Evidence struct - optimized for gas
    struct Evidence {
        string pinataCid; // Using Pinata CID instead of IPFS CID
        EvidenceType evidenceType;
        uint256 timestamp;
    }

    // Resolution struct - optimized for gas
    struct Resolution {
        ResolutionType resolutionType;
        uint256 amount;
        string pinataCid; // Store resolution details on Pinata
        uint256 timestamp;
    }

    // Dispute struct - optimized for gas
    struct DisputeData {
        bytes32 id;
        bytes32 orderId;
        address buyer;
        address business;
        DisputeReason reason;
        string pinataCid; // Store dispute details on Pinata
        DisputeStatus status;
        Resolution resolution;
        uint256 evidenceCount;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Events
    event DisputeCreated(
        bytes32 indexed disputeId,
        bytes32 indexed orderId,
        address indexed buyer,
        address business,
        DisputeReason reason,
        string pinataCid
    );

    event EvidenceAdded(
        bytes32 indexed disputeId,
        string pinataCid,
        EvidenceType evidenceType
    );

    event DisputeResolved(
        bytes32 indexed disputeId,
        ResolutionType resolutionType,
        uint256 amount,
        string pinataCid
    );

    // Mapping of dispute ID to dispute data
    mapping(bytes32 => DisputeData) private disputes;

    // Mapping of dispute ID to evidence array
    mapping(bytes32 => Evidence[]) private disputeEvidence;

    // Mapping of order ID to dispute ID
    mapping(bytes32 => bytes32) private orderToDispute;

    // Mapping of user address to their disputes
    mapping(address => bytes32[]) private userDisputes;

    // Mapping of business address to their disputes
    mapping(address => bytes32[]) private businessDisputes;

    // Constructor
    constructor(address initialOwner) Ownable(initialOwner) {}

    // Create a new dispute
    function createDispute(
        bytes32 _disputeId,
        bytes32 _orderId,
        address _buyer,
        address _business,
        DisputeReason _reason,
        string memory _pinataCid
    ) external onlyOwner {
        // Check if dispute already exists for this order
        require(
            orderToDispute[_orderId] == bytes32(0),
            "Dispute already exists for this order"
        );

        // Create new dispute
        DisputeData memory newDispute = DisputeData({
            id: _disputeId,
            orderId: _orderId,
            buyer: _buyer,
            business: _business,
            reason: _reason,
            pinataCid: _pinataCid,
            status: DisputeStatus.OPEN,
            resolution: Resolution({
                resolutionType: ResolutionType.OTHER,
                amount: 0,
                pinataCid: "",
                timestamp: 0
            }),
            evidenceCount: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        // Store dispute
        disputes[_disputeId] = newDispute;
        orderToDispute[_orderId] = _disputeId;
        userDisputes[_buyer].push(_disputeId);
        businessDisputes[_business].push(_disputeId);

        // Emit event
        emit DisputeCreated(
            _disputeId,
            _orderId,
            _buyer,
            _business,
            _reason,
            _pinataCid
        );
    }

    // Add evidence to dispute
    function addEvidence(
        bytes32 _disputeId,
        string memory _pinataCid,
        EvidenceType _evidenceType
    ) external onlyOwner {
        DisputeData storage dispute = disputes[_disputeId];
        require(dispute.id != bytes32(0), "Dispute not found");

        Evidence memory newEvidence = Evidence({
            pinataCid: _pinataCid,
            evidenceType: _evidenceType,
            timestamp: block.timestamp
        });

        disputeEvidence[_disputeId].push(newEvidence);
        dispute.evidenceCount++;
        dispute.updatedAt = block.timestamp;

        emit EvidenceAdded(_disputeId, _pinataCid, _evidenceType);
    }

    // Resolve dispute
    function resolveDispute(
        bytes32 _disputeId,
        ResolutionType _resolutionType,
        uint256 _amount,
        string memory _pinataCid
    ) external onlyOwner {
        DisputeData storage dispute = disputes[_disputeId];
        require(dispute.id != bytes32(0), "Dispute not found");
        require(dispute.status != DisputeStatus.CLOSED, "Dispute is closed");

        // Update dispute
        dispute.status = DisputeStatus.RESOLVED;
        dispute.resolution = Resolution({
            resolutionType: _resolutionType,
            amount: _amount,
            pinataCid: _pinataCid,
            timestamp: block.timestamp
        });
        dispute.updatedAt = block.timestamp;

        emit DisputeResolved(_disputeId, _resolutionType, _amount, _pinataCid);
    }

    // Close dispute
    function closeDispute(bytes32 _disputeId) external onlyOwner {
        DisputeData storage dispute = disputes[_disputeId];
        require(dispute.id != bytes32(0), "Dispute not found");
        require(dispute.status == DisputeStatus.RESOLVED, "Dispute must be resolved first");

        dispute.status = DisputeStatus.CLOSED;
        dispute.updatedAt = block.timestamp;
    }

    // Get dispute by ID
    function getDispute(bytes32 _disputeId)
        external
        view
        returns (DisputeData memory)
    {
        return disputes[_disputeId];
    }

    // Get dispute by order ID
    function getDisputeByOrder(bytes32 _orderId)
        external
        view
        returns (DisputeData memory)
    {
        bytes32 disputeId = orderToDispute[_orderId];
        return disputes[disputeId];
    }

    // Get user disputes
    function getUserDisputes(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userDisputes[_user];
    }

    // Get business disputes
    function getBusinessDisputes(address _business)
        external
        view
        returns (bytes32[] memory)
    {
        return businessDisputes[_business];
    }

    // Get evidence for a dispute
    function getEvidence(bytes32 _disputeId)
        external
        view
        returns (Evidence[] memory)
    {
        return disputeEvidence[_disputeId];
    }

    // Check if dispute exists
    function disputeExists(bytes32 _disputeId) external view returns (bool) {
        return disputes[_disputeId].id != bytes32(0);
    }

    // Check if order has dispute
    function orderHasDispute(bytes32 _orderId) external view returns (bool) {
        return orderToDispute[_orderId] != bytes32(0);
    }
} 