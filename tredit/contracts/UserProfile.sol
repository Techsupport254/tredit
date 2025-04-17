// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./Business.sol";

contract UserProfile is Context, Ownable {
    struct ProfileData {
        address walletAddress;
        bytes32 ipfsUri;
        bytes16[] businessIds;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }

    address private _trustedForwarder;
    address private _businessContract;

    mapping(address => ProfileData) private profiles;

    event ProfileCreated(address indexed walletAddress, bytes32 ipfsUri);
    event ProfileUpdated(address indexed walletAddress, bytes32 ipfsUri);
    event ProfileStatusChanged(address indexed walletAddress, bool isActive);
    event BusinessContractUpdated(
        address indexed oldContract,
        address indexed newContract
    );
    event TrustedForwarderUpdated(
        address indexed oldForwarder,
        address indexed newForwarder
    );

    error ProfileNotFound();
    error InvalidForwarderAddress();
    error InvalidIpfsUri();
    error InvalidBusinessContract();

    constructor(address trustedForwarder, address businessContract, address initialOwner) Ownable(initialOwner) {
        if (trustedForwarder == address(0)) revert InvalidForwarderAddress();
        if (businessContract == address(0)) revert InvalidBusinessContract();
        _trustedForwarder = trustedForwarder;
        _businessContract = businessContract;
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

    function setBusinessContract(address newContract) external onlyOwner {
        if (newContract == address(0)) revert InvalidBusinessContract();
        address oldContract = _businessContract;
        _businessContract = newContract;
        emit BusinessContractUpdated(oldContract, newContract);
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
     * @dev Creates or updates a user profile
     * @param ipfsUri IPFS URI containing profile data
     */
    function createOrUpdateProfile(string calldata ipfsUri) external {
        if (bytes(ipfsUri).length == 0) revert InvalidIpfsUri();

        address walletAddress = _msgSender();
        bool isNewProfile = profiles[walletAddress].createdAt == 0;

        bytes32 ipfsUriBytes = keccak256(bytes(ipfsUri));

        if (isNewProfile) {
            profiles[walletAddress] = ProfileData({
                walletAddress: walletAddress,
                ipfsUri: ipfsUriBytes,
                businessIds: new bytes16[](0),
                createdAt: block.timestamp,
                updatedAt: block.timestamp,
                isActive: true
            });
            emit ProfileCreated(walletAddress, ipfsUriBytes);
        } else {
            profiles[walletAddress].ipfsUri = ipfsUriBytes;
            profiles[walletAddress].updatedAt = block.timestamp;
            emit ProfileUpdated(walletAddress, ipfsUriBytes);
        }
    }

    /**
     * @dev Gets profile data for a wallet address
     * @param walletAddress Address to query
     * @return ProfileData struct
     */
    function getProfile(
        address walletAddress
    ) external view returns (ProfileData memory) {
        ProfileData memory profile = profiles[walletAddress];
        if (profile.createdAt == 0) revert ProfileNotFound();
        return profile;
    }

    /**
     * @dev Sets profile active status
     * @param isActive New active status
     */
    function setProfileStatus(bool isActive) external {
        address walletAddress = _msgSender();
        if (profiles[walletAddress].createdAt == 0) revert ProfileNotFound();

        profiles[walletAddress].isActive = isActive;
        profiles[walletAddress].updatedAt = block.timestamp;

        emit ProfileStatusChanged(walletAddress, isActive);
    }

    /**
     * @dev Adds a business ID to the user's profile
     * @param businessId Business ID to add
     */
    function addBusiness(bytes16 businessId) external {
        address walletAddress = _msgSender();
        if (profiles[walletAddress].createdAt == 0) revert ProfileNotFound();

        Business businessContract = Business(_businessContract);
        Business.BusinessData memory business = businessContract.getBusiness(
            businessId
        );
        require(
            business.owner == walletAddress,
            "Operation failed: Unauthorized access"
        );

        bytes16[] storage businessIds = profiles[walletAddress].businessIds;
        uint256 length = businessIds.length;

        for (uint256 i = 0; i < length; i++) {
            if (businessIds[i] == businessId) return;
        }
        businessIds.push(businessId);
    }

    /**
     * @dev Removes a business ID from the user's profile
     * @param businessId Business ID to remove
     */
    function removeBusiness(bytes16 businessId) external {
        address walletAddress = _msgSender();
        if (profiles[walletAddress].createdAt == 0) revert ProfileNotFound();

        Business businessContract = Business(_businessContract);
        Business.BusinessData memory business = businessContract.getBusiness(
            businessId
        );
        require(
            business.owner == walletAddress,
            "Operation failed: Unauthorized access"
        );

        bytes16[] storage businessIds = profiles[walletAddress].businessIds;
        uint256 lastIndex = businessIds.length - 1;

        for (uint256 i = 0; i <= lastIndex; i++) {
            if (businessIds[i] == businessId) {
                if (i != lastIndex) {
                    businessIds[i] = businessIds[lastIndex];
                }
                businessIds.pop();
                return;
            }
        }
    }
}
