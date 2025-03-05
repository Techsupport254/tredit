// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract UserProfile is Context, Ownable {
    struct ProfileData {
        address walletAddress;
        string ipfsUri;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }

    address private _trustedForwarder;

    mapping(address => ProfileData) private profiles;

    event ProfileCreated(address indexed walletAddress, string ipfsUri);
    event ProfileUpdated(address indexed walletAddress, string ipfsUri);
    event ProfileStatusChanged(address indexed walletAddress, bool isActive);
    event TrustedForwarderUpdated(
        address indexed oldForwarder,
        address indexed newForwarder
    );

    error ProfileNotFound();
    error InvalidForwarderAddress();
    error InvalidIpfsUri();

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

    function _msgSender()
        internal
        view
        virtual
        override
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly block below reads the original sender from the calldata.
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
     * @dev Modifier to check if a profile exists
     */
    modifier profileExists() {
        if (profiles[_msgSender()].walletAddress == address(0))
            revert ProfileNotFound();
        _;
    }

    /**
     * @dev Creates or updates a user profile with IPFS URI
     */
    function createOrUpdateProfile(string calldata ipfsUri) external {
        if (bytes(ipfsUri).length == 0) revert InvalidIpfsUri();

        bool isNewProfile = profiles[_msgSender()].walletAddress == address(0);

        profiles[_msgSender()] = ProfileData({
            walletAddress: _msgSender(),
            ipfsUri: ipfsUri,
            createdAt: isNewProfile
                ? block.timestamp
                : profiles[_msgSender()].createdAt,
            updatedAt: block.timestamp,
            isActive: true
        });

        if (isNewProfile) {
            emit ProfileCreated(_msgSender(), ipfsUri);
        } else {
            emit ProfileUpdated(_msgSender(), ipfsUri);
        }
    }

    /**
     * @dev Updates profile active status
     */
    function setProfileStatus(bool isActive) external profileExists {
        profiles[_msgSender()].isActive = isActive;
        profiles[_msgSender()].updatedAt = block.timestamp;
        emit ProfileStatusChanged(_msgSender(), isActive);
    }

    /**
     * @dev Gets a user's profile
     */
    function getProfile(
        address walletAddress
    ) external view returns (ProfileData memory) {
        if (profiles[walletAddress].walletAddress == address(0))
            revert ProfileNotFound();
        return profiles[walletAddress];
    }
}
