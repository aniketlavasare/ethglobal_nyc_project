// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AstraVault.sol";

contract VaultRegistry {
    AstraVaultUserOwned public immutable astraVault;
    
    // Mapping from user address to their vault address
    mapping(address => address) public userVaults;
    
    // Array of all registered vault addresses
    address[] public allVaults;
    
    // Mapping from vault address to user address
    mapping(address => address) public vaultOwners;
    
    // Events
    event VaultRegistered(address indexed user, address indexed vaultAddress, uint256 timestamp);
    event VaultUnregistered(address indexed user, address indexed vaultAddress, uint256 timestamp);
    
    constructor(address _astraVault) {
        astraVault = AstraVaultUserOwned(_astraVault);
    }
    
    /// @notice Register a new vault for a user
    /// @param user The user address
    /// @param vaultAddress The vault contract address
    function registerVault(address user, address vaultAddress) external {
        require(msg.sender == address(astraVault), "Only AstraVault can register");
        require(userVaults[user] == address(0), "User already has a vault");
        require(vaultOwners[vaultAddress] == address(0), "Vault already registered");
        
        userVaults[user] = vaultAddress;
        vaultOwners[vaultAddress] = user;
        allVaults.push(vaultAddress);
        
        emit VaultRegistered(user, vaultAddress, block.timestamp);
    }
    
    /// @notice Get all vault addresses
    /// @return Array of all vault addresses
    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }
    
    /// @notice Get vault address for a user
    /// @param user The user address
    /// @return The vault address for the user
    function getVaultForUser(address user) external view returns (address) {
        return userVaults[user];
    }
    
    /// @notice Get user address for a vault
    /// @param vaultAddress The vault address
    /// @return The user address that owns the vault
    function getUserForVault(address vaultAddress) external view returns (address) {
        return vaultOwners[vaultAddress];
    }
    
    /// @notice Check if a user has a registered vault
    /// @param user The user address
    /// @return True if user has a vault
    function hasVault(address user) external view returns (bool) {
        return userVaults[user] != address(0);
    }
    
    /// @notice Get total number of vaults
    /// @return Total number of registered vaults
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
    
    /// @notice Get vaults by index range (for pagination)
    /// @param startIndex Starting index
    /// @param endIndex Ending index
    /// @return Array of vault addresses in the range
    function getVaultsByRange(uint256 startIndex, uint256 endIndex) external view returns (address[] memory) {
        require(startIndex < allVaults.length, "Start index out of bounds");
        require(endIndex <= allVaults.length, "End index out of bounds");
        require(startIndex <= endIndex, "Invalid range");
        
        uint256 length = endIndex - startIndex;
        address[] memory vaults = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            vaults[i] = allVaults[startIndex + i];
        }
        
        return vaults;
    }
}
