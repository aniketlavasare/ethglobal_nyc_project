// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CompanyPayoutMVP {
    mapping(address => uint256) public pendingRewards;

    event AccessPurchased(address indexed company, string tag, uint256 perUser, uint256 count);
    event RewardsClaimed(address indexed user, uint256 amount);

    /// @notice Company pays once to buy access for a set of addresses
    function buyAccess(string calldata tag, address[] calldata users) external payable {
        require(users.length > 0, "no users");
        require(msg.value > 0, "no value");

        uint256 perUser = msg.value / users.length;

        for (uint256 i = 0; i < users.length; i++) {
            pendingRewards[users[i]] += perUser;
        }

        emit AccessPurchased(msg.sender, tag, perUser, users.length);
    }

    /// @notice User claims their pending ETH
    function claimRewards() external {
        uint256 amt = pendingRewards[msg.sender];
        require(amt > 0, "nothing to claim");
        pendingRewards[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: amt}("");
        require(ok, "transfer failed");

        emit RewardsClaimed(msg.sender, amt);
    }
}
