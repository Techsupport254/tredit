// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfileRegistry {
    struct UserProfile {
        string profileURI;    // IPFS Hash (off-chain data storage)
        uint reputationScore; // Blockchain-tracked reputation
        bool exists;          // Ensures user existence
    }

    mapping(address => UserProfile) public users;
    address public immutable owner;

    event ProfileCreated(address indexed user, string profileURI);
    event ProfileUpdated(address indexed user, string profileURI);
    event ReputationUpdated(address indexed user, uint newScore);

    modifier onlyUser() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can update reputation");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * Registers a new user profile on-chain using wallet address as the DID.
     * Uses calldata for string parameters to save gas.
     */
    function registerUser(string calldata _profileURI) external {
        require(!users[msg.sender].exists, "User already registered");

        users[msg.sender] = UserProfile({
            profileURI: _profileURI,
            reputationScore: 0,
            exists: true
        });

        emit ProfileCreated(msg.sender, _profileURI);
    }

    /**
     * Updates the profile URI for the calling user.
     */
    function updateProfileURI(string calldata _profileURI) external onlyUser {
        users[msg.sender].profileURI = _profileURI;
        emit ProfileUpdated(msg.sender, _profileURI);
    }

    /**
     * Updates the reputation of a given user.
     * Only callable by the contract owner.
     */
    function updateReputation(address _user, uint _newScore) external onlyOwner {
        require(users[_user].exists, "User not found");
        users[_user].reputationScore = _newScore;
        emit ReputationUpdated(_user, _newScore);
    }

    /**
     * Retrieves the user profile for a given address.
     */
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return users[_user];
    }
}
