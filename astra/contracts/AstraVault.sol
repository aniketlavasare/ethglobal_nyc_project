// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AstraVault {
    mapping(address => string[]) private userData;
    event VaultUpdated(address indexed user, string[] tags);

    function createOrUpdateVault(string[] calldata _tags) external {
        // reset existing tags
        delete userData[msg.sender];
        // store new tags
        for (uint256 i = 0; i < _tags.length; i++) {
            userData[msg.sender].push(_tags[i]);
        }
        emit VaultUpdated(msg.sender, _tags);
    }

    function getUserTags(address user) external view returns (string[] memory) {
        return userData[user];
    }
}