// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title Business
 * @dev Gas-optimized contract for managing businesses with gasless transactions and UUID-based IDs
 */
contract Business is Context, Ownable {
    // Pack related storage variables together to optimize storage slots
    struct BusinessData {
        address owner; // 20 bytes
        bytes32 ipfsHash; // 32 bytes
        bytes16 id; // 16 bytes (UUID)
        bool isActive; // 1 byte
        uint40 updatedAt; // 5 bytes (enough for timestamps until year 2078)
    } // Total: 74 bytes (fits in 3 storage slots)

    address private _trustedForwarder;
    uint256 private _nonce; // For UUID generation

    // Storage optimizations
    mapping(bytes16 => BusinessData) private businesses;
    mapping(address => bytes16[]) private ownerBusinesses;
    mapping(address => uint96) private businessCount;

    // Events with packed parameters
    event BusinessCreated(
        bytes16 indexed businessId,
        address indexed owner,
        bytes32 ipfsHash,
        uint40 timestamp
    );
    event BusinessUpdated(
        bytes16 indexed businessId,
        bytes32 ipfsHash,
        uint40 timestamp
    );
    event BusinessStatusChanged(
        bytes16 indexed businessId,
        bool isActive,
        uint40 timestamp
    );
    event BusinessDeleted(
        bytes16 indexed businessId,
        address indexed owner,
        uint40 timestamp
    );
    event TrustedForwarderUpdated(
        address indexed oldForwarder,
        address indexed newForwarder,
        uint40 timestamp
    );

    // Custom errors
    error InvalidForwarderAddress();
    error EmptyIPFSHash();
    error BusinessNotFound(bytes16 businessId);
    error UnauthorizedAccess(address caller, bytes16 businessId);
    error InvalidBusinessData();
    error BusinessAlreadyDeleted(bytes16 businessId);
    error DuplicateUUID();

    constructor() {
        _nonce = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
    }

    /**
     * @dev Generates a UUID using block information, sender, and nonce
     * @return uuid The generated UUID as bytes16
     */
    function _generateUUID() private returns (bytes16) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                _nonce++
            )
        );
        return bytes16(hash);
    }

    function getTrustedForwarder() public view returns (address) {
        return _trustedForwarder;
    }

    function setTrustedForwarder(address newForwarder) external onlyOwner {
        if (newForwarder == address(0)) revert InvalidForwarderAddress();
        address oldForwarder = _trustedForwarder;
        _trustedForwarder = newForwarder;
        emit TrustedForwarderUpdated(
            oldForwarder,
            newForwarder,
            uint40(block.timestamp)
        );
    }

    function isTrustedForwarder(address forwarder) public view returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender()
        internal
        view
        virtual
        override
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
            return sender;
        }
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        }
        return super._msgData();
    }

    /**
     * @dev Creates a new business with IPFS hash
     * @param ipfsHash IPFS hash of business metadata
     * @return businessId The UUID of the created business
     */
    function createBusiness(
        string calldata ipfsHash
    ) external returns (bytes16) {
        if (bytes(ipfsHash).length == 0) revert EmptyIPFSHash();

        address owner = _msgSender();
        bytes16 newBusinessId = _generateUUID();

        // Ensure UUID is unique (extremely unlikely but check anyway)
        if (businesses[newBusinessId].owner != address(0))
            revert DuplicateUUID();

        // Convert string to bytes32 for storage efficiency
        bytes32 ipfsHashBytes = keccak256(bytes(ipfsHash));

        businesses[newBusinessId] = BusinessData({
            id: newBusinessId,
            owner: owner,
            ipfsHash: ipfsHashBytes,
            isActive: true,
            updatedAt: uint40(block.timestamp)
        });

        ownerBusinesses[owner].push(newBusinessId);
        unchecked {
            // Safe because one address can't create enough businesses to overflow uint96
            businessCount[owner]++;
        }

        emit BusinessCreated(
            newBusinessId,
            owner,
            ipfsHashBytes,
            uint40(block.timestamp)
        );
        return newBusinessId;
    }

    /**
     * @dev Updates business IPFS hash
     */
    function updateBusiness(
        bytes16 businessId,
        string calldata ipfsHash
    ) external {
        BusinessData storage business = businesses[businessId];
        if (business.owner == address(0)) revert BusinessNotFound(businessId);
        if (business.owner != _msgSender())
            revert UnauthorizedAccess(_msgSender(), businessId);
        if (bytes(ipfsHash).length == 0) revert EmptyIPFSHash();
        if (!business.isActive) revert BusinessAlreadyDeleted(businessId);

        bytes32 ipfsHashBytes = keccak256(bytes(ipfsHash));
        business.ipfsHash = ipfsHashBytes;
        business.updatedAt = uint40(block.timestamp);

        emit BusinessUpdated(
            businessId,
            ipfsHashBytes,
            uint40(block.timestamp)
        );
    }

    /**
     * @dev Sets business active status
     */
    function setBusinessStatus(bytes16 businessId, bool isActive) external {
        BusinessData storage business = businesses[businessId];
        if (business.owner == address(0)) revert BusinessNotFound(businessId);
        if (business.owner != _msgSender())
            revert UnauthorizedAccess(_msgSender(), businessId);

        business.isActive = isActive;
        business.updatedAt = uint40(block.timestamp);

        emit BusinessStatusChanged(
            businessId,
            isActive,
            uint40(block.timestamp)
        );
    }

    /**
     * @dev Gets business data
     */
    function getBusiness(
        bytes16 businessId
    ) external view returns (BusinessData memory) {
        BusinessData memory business = businesses[businessId];
        if (business.owner == address(0)) revert BusinessNotFound(businessId);
        return business;
    }

    /**
     * @dev Gets all business IDs owned by an address
     */
    function getBusinessesByOwner(
        address owner
    ) external view returns (bytes16[] memory) {
        return ownerBusinesses[owner];
    }

    /**
     * @dev Deletes a business and updates the owner's business count
     */
    function deleteBusiness(bytes16 businessId) external {
        BusinessData storage business = businesses[businessId];
        if (business.owner == address(0)) revert BusinessNotFound(businessId);
        if (business.owner != _msgSender())
            revert UnauthorizedAccess(_msgSender(), businessId);
        if (!business.isActive) revert BusinessAlreadyDeleted(businessId);

        address owner = business.owner;
        bytes16[] storage ownerBusinessList = ownerBusinesses[owner];
        uint256 lastIndex = ownerBusinessList.length - 1;

        // Gas-efficient array element removal
        for (uint256 i = 0; i <= lastIndex; ) {
            if (ownerBusinessList[i] == businessId) {
                if (i != lastIndex) {
                    ownerBusinessList[i] = ownerBusinessList[lastIndex];
                }
                ownerBusinessList.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }

        unchecked {
            // Safe because we only decrement if there was a business
            businessCount[owner]--;
        }

        delete businesses[businessId];
        emit BusinessDeleted(businessId, owner, uint40(block.timestamp));
    }
}
