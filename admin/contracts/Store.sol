// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Store
 * @dev Gas-optimized contract for managing digital stores with gasless transactions
 */
contract Store is Context, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _storeIds;

    struct StoreData {
        uint256 id;
        address owner;
        string ipfsHash;  // Only store the IPFS hash, full data in database
        bool isActive;
        uint256 updatedAt;
    }

    address private _trustedForwarder;

    // Mapping optimizations
    mapping(uint256 => StoreData) private stores;
    mapping(address => uint256[]) private ownerStores;
    mapping(address => uint256) private storeCount;

    // Events
    event StoreCreated(uint256 indexed storeId, address indexed owner, string ipfsHash);
    event StoreUpdated(uint256 indexed storeId, string ipfsHash);
    event StoreStatusChanged(uint256 indexed storeId, bool isActive);
    event TrustedForwarderUpdated(address indexed oldForwarder, address indexed newForwarder);

    error InvalidForwarderAddress();

    constructor(address trustedForwarder) {
        if (trustedForwarder == address(0)) revert InvalidForwarderAddress();
        _trustedForwarder = trustedForwarder;
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
            // The assembly block below reads the original sender from the calldata.
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

    /**
     * @dev Creates a new store with IPFS hash from database
     * @param ipfsHash IPFS hash of store metadata from database
     * @return storeId The ID of the created store
     */
    function createStore(string memory ipfsHash) external returns (uint256) {
        address owner = _msgSender();
        require(storeCount[owner] < 3, "Maximum stores limit reached");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");

        _storeIds.increment();
        uint256 newStoreId = _storeIds.current();

        stores[newStoreId] = StoreData({
            id: newStoreId,
            owner: owner,
            ipfsHash: ipfsHash,
            isActive: true,
            updatedAt: block.timestamp
        });

        ownerStores[owner].push(newStoreId);
        storeCount[owner]++;

        emit StoreCreated(newStoreId, owner, ipfsHash);
        return newStoreId;
    }

    /**
     * @dev Updates store IPFS hash
     * @param storeId Store ID to update
     * @param ipfsHash New IPFS hash from database
     */
    function updateStore(uint256 storeId, string memory ipfsHash) external {
        require(_isStoreOwner(storeId), "Not store owner");
        require(stores[storeId].isActive, "Store is not active");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");

        stores[storeId].ipfsHash = ipfsHash;
        stores[storeId].updatedAt = block.timestamp;

        emit StoreUpdated(storeId, ipfsHash);
    }

    /**
     * @dev Changes store active status
     * @param storeId Store ID to update
     * @param isActive New active status
     */
    function setStoreStatus(uint256 storeId, bool isActive) external {
        require(_isStoreOwner(storeId), "Not store owner");
        stores[storeId].isActive = isActive;
        stores[storeId].updatedAt = block.timestamp;
        emit StoreStatusChanged(storeId, isActive);
    }

    /**
     * @dev Gets store data
     * @param storeId Store ID to query
     */
    function getStore(uint256 storeId) external view returns (StoreData memory) {
        require(stores[storeId].owner != address(0), "Store does not exist");
        return stores[storeId];
    }

    /**
     * @dev Gets stores owned by an address
     * @param owner Address to query
     */
    function getStoresByOwner(address owner) external view returns (uint256[] memory) {
        return ownerStores[owner];
    }

    /**
     * @dev Checks if caller is store owner
     */
    function _isStoreOwner(uint256 storeId) internal view returns (bool) {
        return stores[storeId].owner == _msgSender();
    }
} 