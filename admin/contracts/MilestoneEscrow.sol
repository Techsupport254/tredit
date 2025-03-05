// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./UserProfile.sol";

contract MilestoneEscrow is Context, Ownable, ReentrancyGuard {
    UserProfile private immutable userProfile;
    address private _trustedForwarder;

    struct Milestone {
        uint256 amount;
        bool isCompleted;
        bool isFunded;
        bool isReleased;
        uint256 completedAt;
        uint256 releasedAt;
    }

    struct Project {
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 totalMilestones;
        uint256 completedMilestones;
        uint256 releasedMilestones;
        bool isActive;
        mapping(uint256 => Milestone) milestones;
    }

    mapping(uint256 => Project) private projects;
    uint256 private nextProjectId;

    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer);
    event MilestoneCompleted(uint256 indexed projectId, uint256 milestoneIndex);
    event MilestoneReleased(uint256 indexed projectId, uint256 milestoneIndex, uint256 amount);
    event ProjectCancelled(uint256 indexed projectId);
    event TrustedForwarderUpdated(address indexed oldForwarder, address indexed newForwarder);

    error InvalidForwarderAddress();
    error InvalidUserProfileAddress();
    error UnauthorizedAccess();
    error InvalidMilestone();
    error InsufficientFunds();
    error ProjectNotActive();
    error MilestoneAlreadyCompleted();
    error MilestoneNotCompleted();
    error MilestoneAlreadyReleased();
    error MilestoneNotFunded();

    constructor(address _userProfile) {
        if (_userProfile == address(0)) revert InvalidUserProfileAddress();
        userProfile = UserProfile(_userProfile);
    }

    function getTrustedForwarder() public view returns (address) {
        return _trustedForwarder;
    }

    function setTrustedForwarder(address newForwarder) external onlyOwner {
        if (newForwarder == address(0)) revert InvalidForwarderAddress();
        address oldForwarder = _trustedForwarder;
        _trustedForwarder = newForwarder;
        emit TrustedForwarderUpdated(oldForwarder, newForwarder);
    }

    function isTrustedForwarder(address forwarder) public view returns (bool) {
        return forwarder == getTrustedForwarder();
    }

    function _msgSender() internal view virtual override returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
            return sender;
        }
        return super._msgSender();
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        }
        return super._msgData();
    }

    function createProject(
        address freelancer,
        uint256[] calldata amounts
    ) external payable returns (uint256) {
        if (amounts.length == 0) revert InvalidMilestone();
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        if (msg.value < totalAmount) revert InsufficientFunds();

        uint256 projectId = nextProjectId++;
        Project storage project = projects[projectId];
        project.client = _msgSender();
        project.freelancer = freelancer;
        project.totalAmount = totalAmount;
        project.totalMilestones = amounts.length;
        project.isActive = true;

        for (uint256 i = 0; i < amounts.length; i++) {
            project.milestones[i] = Milestone({
                amount: amounts[i],
                isCompleted: false,
                isFunded: true,
                isReleased: false,
                completedAt: 0,
                releasedAt: 0
            });
        }

        emit ProjectCreated(projectId, _msgSender(), freelancer);
        return projectId;
    }

    function completeMilestone(uint256 projectId, uint256 milestoneIndex) external {
        Project storage project = projects[projectId];
        if (!project.isActive) revert ProjectNotActive();
        if (_msgSender() != project.freelancer) revert UnauthorizedAccess();
        if (milestoneIndex >= project.totalMilestones) revert InvalidMilestone();

        Milestone storage milestone = project.milestones[milestoneIndex];
        if (milestone.isCompleted) revert MilestoneAlreadyCompleted();

        milestone.isCompleted = true;
        milestone.completedAt = block.timestamp;
        project.completedMilestones++;

        emit MilestoneCompleted(projectId, milestoneIndex);
    }

    function releaseMilestone(uint256 projectId, uint256 milestoneIndex) external nonReentrant {
        Project storage project = projects[projectId];
        if (!project.isActive) revert ProjectNotActive();
        if (_msgSender() != project.client) revert UnauthorizedAccess();
        if (milestoneIndex >= project.totalMilestones) revert InvalidMilestone();

        Milestone storage milestone = project.milestones[milestoneIndex];
        if (!milestone.isCompleted) revert MilestoneNotCompleted();
        if (!milestone.isFunded) revert MilestoneNotFunded();
        if (milestone.isReleased) revert MilestoneAlreadyReleased();

        milestone.isReleased = true;
        milestone.releasedAt = block.timestamp;
        project.releasedMilestones++;

        (bool success, ) = project.freelancer.call{value: milestone.amount}("");
        require(success, "Transfer failed");

        emit MilestoneReleased(projectId, milestoneIndex, milestone.amount);
    }

    function cancelProject(uint256 projectId) external {
        Project storage project = projects[projectId];
        if (!project.isActive) revert ProjectNotActive();
        if (_msgSender() != project.client) revert UnauthorizedAccess();

        uint256 remainingAmount = 0;
        for (uint256 i = 0; i < project.totalMilestones; i++) {
            Milestone storage milestone = project.milestones[i];
            if (milestone.isFunded && !milestone.isReleased) {
                remainingAmount += milestone.amount;
                milestone.isFunded = false;
            }
        }

        project.isActive = false;

        if (remainingAmount > 0) {
            (bool success, ) = project.client.call{value: remainingAmount}("");
            require(success, "Refund failed");
        }

        emit ProjectCancelled(projectId);
    }

    function getProject(uint256 projectId) external view returns (
        address client,
        address freelancer,
        uint256 totalAmount,
        uint256 totalMilestones,
        uint256 completedMilestones,
        uint256 releasedMilestones,
        bool isActive
    ) {
        Project storage project = projects[projectId];
        return (
            project.client,
            project.freelancer,
            project.totalAmount,
            project.totalMilestones,
            project.completedMilestones,
            project.releasedMilestones,
            project.isActive
        );
    }

    function getMilestone(uint256 projectId, uint256 milestoneIndex) external view returns (
        uint256 amount,
        bool isCompleted,
        bool isFunded,
        bool isReleased,
        uint256 completedAt,
        uint256 releasedAt
    ) {
        Project storage project = projects[projectId];
        require(milestoneIndex < project.totalMilestones, "Invalid milestone index");
        Milestone storage milestone = project.milestones[milestoneIndex];
        return (
            milestone.amount,
            milestone.isCompleted,
            milestone.isFunded,
            milestone.isReleased,
            milestone.completedAt,
            milestone.releasedAt
        );
    }
}
