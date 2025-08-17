// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VaultRegistry.sol";

contract AstraVaultUserOwned {
    VaultRegistry public immutable vaultRegistry;
    
    // user => tags
    mapping(address => string[]) private _userTags;
    mapping(address => bool) private _hasVault;

    uint8 public constant MAX_TAGS = 10;
    uint8 public constant MAX_TAG_LEN = 31;

    event VaultCreated(address indexed user, string[] tags, uint256 timestamp);
    event TagAdded(address indexed user, string tag, uint256 timestamp);
    event TagRemoved(address indexed user, string tag, uint256 timestamp);
    event VaultCleared(address indexed user, uint256 timestamp);

    constructor(address _vaultRegistry) {
        vaultRegistry = VaultRegistry(_vaultRegistry);
    }

    // -------- user actions --------

    /// @notice Create your vault (only once) with initial tags.
    function createVault(string[] calldata tags) external {
        require(!_hasVault[msg.sender], "vault already exists");
        require(tags.length <= MAX_TAGS, "too many tags");

        for (uint256 i = 0; i < tags.length; i++) {
            bytes memory b = bytes(tags[i]);
            require(b.length > 0 && b.length <= MAX_TAG_LEN, "bad tag length");
            _requireNotDuplicate(msg.sender, tags[i]);
            _userTags[msg.sender].push(tags[i]);
        }

        _hasVault[msg.sender] = true;
        
        // Register this vault in the registry
        vaultRegistry.registerVault(msg.sender, address(this));
        
        emit VaultCreated(msg.sender, _userTags[msg.sender], block.timestamp);
    }

    /// @notice Add a tag to your existing vault.
    function addTag(string calldata tag) external {
        require(_hasVault[msg.sender], "no vault");
        require(bytes(tag).length > 0 && bytes(tag).length <= MAX_TAG_LEN, "bad tag length");
        require(_userTags[msg.sender].length < MAX_TAGS, "max tags reached");
        _requireNotDuplicate(msg.sender, tag);

        _userTags[msg.sender].push(tag);
        emit TagAdded(msg.sender, tag, block.timestamp);
    }

    /// @notice Remove a tag from your vault.
    function removeTag(string calldata tag) external {
        require(_hasVault[msg.sender], "no vault");
        string[] storage tags = _userTags[msg.sender];

        for (uint256 i = 0; i < tags.length; i++) {
            if (_eq(tags[i], tag)) {
                tags[i] = tags[tags.length - 1];
                tags.pop();
                emit TagRemoved(msg.sender, tag, block.timestamp);
                return;
            }
        }
        revert("tag not found");
    }

    /// @notice Clear all tags in your vault (vault remains owned by you).
    function clearVault() external {
        require(_hasVault[msg.sender], "no vault");
        delete _userTags[msg.sender];
        emit VaultCleared(msg.sender, block.timestamp);
    }

    // -------- views --------

    /// @notice Get your tags.
    function getMyTags() external view returns (string[] memory) {
        return _userTags[msg.sender];
    }

    /// @notice Read any user's tags (public registry).
    function getUserTags(address user) external view returns (string[] memory) {
        return _userTags[user];
    }

    /// @notice Has this user created a vault?
    function hasVault(address user) external view returns (bool) {
        return _hasVault[user];
    }

    /// @notice Get all users with vaults (for search functionality)
    function getAllUsersWithVaults() external view returns (address[] memory) {
        address[] memory allVaults = vaultRegistry.getAllVaults();
        address[] memory users = new address[](allVaults.length);
        
        for (uint256 i = 0; i < allVaults.length; i++) {
            users[i] = vaultRegistry.getUserForVault(allVaults[i]);
        }
        
        return users;
    }

    /// @notice Get users by tags (for search functionality)
    function getUsersByTags(string[] calldata searchTags) external view returns (address[] memory) {
        address[] memory allVaults = vaultRegistry.getAllVaults();
        address[] memory matchingUsers = new address[](allVaults.length);
        uint256 matchCount = 0;
        
        for (uint256 i = 0; i < allVaults.length; i++) {
            address user = vaultRegistry.getUserForVault(allVaults[i]);
            string[] memory userTags = _userTags[user];
            
            // Check if user has any of the search tags
            bool hasMatchingTag = false;
            for (uint256 j = 0; j < searchTags.length; j++) {
                for (uint256 k = 0; k < userTags.length; k++) {
                    if (_eq(userTags[k], searchTags[j])) {
                        hasMatchingTag = true;
                        break;
                    }
                }
                if (hasMatchingTag) break;
            }
            
            if (hasMatchingTag) {
                matchingUsers[matchCount] = user;
                matchCount++;
            }
        }
        
        // Resize array to actual match count
        assembly {
            mstore(matchingUsers, matchCount)
        }
        
        return matchingUsers;
    }

    // -------- internals --------

    function _requireNotDuplicate(address user, string calldata tag) internal view {
        string[] storage tags = _userTags[user];
        for (uint256 i = 0; i < tags.length; i++) {
            if (_eq(tags[i], tag)) revert("duplicate tag");
        }
    }

    function _eq(string storage a, string calldata b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
