// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AstraVault (hashed tags, allowlist, revocation)
contract AstraVault {
    // allow-listed tag hashes (keccak256 of normalized tag strings)
    mapping(bytes32 => bool) public allowedTags;

    // per-user hashed tags + active flag
    mapping(address => bytes32[]) private userTagsHashed;
    mapping(address => bool) public active;

    event VaultUpdated(address indexed user, bytes32[] tagsHashed, bool active);

    /// @notice constructor takes an initial allowlist of tag hashes
    constructor(bytes32[] memory initialAllowed) {
        for (uint256 i = 0; i < initialAllowed.length; i++) {
            allowedTags[initialAllowed[i]] = true;
        }
    }

    /// @notice create or replace the caller's tag set (hashed)
    function createOrUpdateVault(bytes32[] calldata _tagsHashed) external {
        require(_tagsHashed.length <= 10, "Too many tags");
        delete userTagsHashed[msg.sender];

        for (uint256 i = 0; i < _tagsHashed.length; i++) {
            require(allowedTags[_tagsHashed[i]], "Tag not allowed");
            userTagsHashed[msg.sender].push(_tagsHashed[i]);
        }

        active[msg.sender] = true;
        emit VaultUpdated(msg.sender, _tagsHashed, true);
    }

    /// @notice mark caller's vault as inactive (tombstone)
    function revokeVault() external {
        active[msg.sender] = false;
        emit VaultUpdated(msg.sender, userTagsHashed[msg.sender], false);
    }

    /// @notice read hashed tags for a user
    function getUserTagsHashed(address user) external view returns (bytes32[] memory) {
        return userTagsHashed[user];
    }
}
