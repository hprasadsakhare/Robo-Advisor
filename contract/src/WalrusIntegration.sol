// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WalrusIntegration
 * @dev Mock Walrus integration for off-chain proof storage
 * This contract simulates storing full proof objects in Walrus (off-chain storage)
 * and only stores references/hashes on-chain
 */
contract WalrusIntegration is Ownable, ReentrancyGuard {
    
    // Walrus storage entry
    struct WalrusEntry {
        string walrusId;                // Unique Walrus storage ID
        bytes32 proofHash;              // Hash of the stored proof
        bytes32 agentId;                // Associated agent ID
        uint256 storedAt;               // Timestamp when stored
        uint256 size;                   // Size of the stored data
        bool isActive;                  // Whether entry is active
    }
    
    // Mapping from Walrus ID to entry
    mapping(string => WalrusEntry) public walrusEntries;
    
    // Mapping from proof hash to Walrus ID
    mapping(bytes32 => string) public proofHashToWalrusId;
    
    // Array of all Walrus IDs for enumeration
    string[] public allWalrusIds;
    
    // Mock Walrus API endpoint (for simulation)
    string public constant MOCK_WALRUS_ENDPOINT = "https://mock-walrus.example.com/api/v1";
    
    // Events
    event ProofStored(
        string indexed walrusId,
        bytes32 indexed proofHash,
        bytes32 indexed agentId,
        uint256 size
    );
    
    event ProofRetrieved(
        string indexed walrusId,
        bytes32 indexed proofHash
    );
    
    event ProofDeleted(
        string indexed walrusId,
        bytes32 indexed proofHash
    );
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Store a proof object in Walrus (simulated)
     * @param proofData Full proof data to store
     * @param agentId Associated agent ID
     * @return walrusId Unique Walrus storage ID
     * @return proofHash Hash of the stored proof
     */
    function storeProof(
        bytes calldata proofData,
        bytes32 agentId
    ) external nonReentrant returns (string memory walrusId, bytes32 proofHash) {
        require(proofData.length > 0, "Proof data cannot be empty");
        require(agentId != bytes32(0), "Invalid agent ID");
        
        // Generate proof hash
        proofHash = keccak256(proofData);
        
        // Check if proof already exists
        require(bytes(proofHashToWalrusId[proofHash]).length == 0, "Proof already stored");
        
        // Generate unique Walrus ID
        walrusId = generateWalrusId(proofHash, agentId);
        
        // Check if Walrus ID already exists
        require(bytes(walrusEntries[walrusId].walrusId).length == 0, "Walrus ID already exists");
        
        // Create Walrus entry
        walrusEntries[walrusId] = WalrusEntry({
            walrusId: walrusId,
            proofHash: proofHash,
            agentId: agentId,
            storedAt: block.timestamp,
            size: proofData.length,
            isActive: true
        });
        
        // Map proof hash to Walrus ID
        proofHashToWalrusId[proofHash] = walrusId;
        
        // Add to global list
        allWalrusIds.push(walrusId);
        
        emit ProofStored(walrusId, proofHash, agentId, proofData.length);
        
        return (walrusId, proofHash);
    }
    
    /**
     * @dev Retrieve proof data from Walrus (simulated)
     * @param walrusId Walrus storage ID
     * @return proofHash Hash of the proof
     * @return agentId Associated agent ID
     * @return storedAt Timestamp when stored
     * @return size Size of the stored data
     */
    function retrieveProof(
        string calldata walrusId
    ) external view returns (
        bytes32 proofHash,
        bytes32 agentId,
        uint256 storedAt,
        uint256 size
    ) {
        require(bytes(walrusId).length > 0, "Walrus ID cannot be empty");
        require(walrusEntries[walrusId].isActive, "Proof not found or inactive");
        
        WalrusEntry memory entry = walrusEntries[walrusId];
        
        return (entry.proofHash, entry.agentId, entry.storedAt, entry.size);
    }
    
    /**
     * @dev Get Walrus ID by proof hash
     * @param proofHash Hash of the proof
     * @return walrusId Walrus storage ID
     */
    function getWalrusIdByProofHash(bytes32 proofHash) external view returns (string memory walrusId) {
        walrusId = proofHashToWalrusId[proofHash];
        require(bytes(walrusId).length > 0, "Proof not found in Walrus");
        return walrusId;
    }
    
    /**
     * @dev Delete proof from Walrus (only owner)
     * @param walrusId Walrus storage ID
     */
    function deleteProof(string calldata walrusId) external onlyOwner nonReentrant {
        require(bytes(walrusId).length > 0, "Walrus ID cannot be empty");
        require(walrusEntries[walrusId].isActive, "Proof not found or already deleted");
        
        bytes32 proofHash = walrusEntries[walrusId].proofHash;
        
        // Mark as inactive
        walrusEntries[walrusId].isActive = false;
        
        // Remove from proof hash mapping
        delete proofHashToWalrusId[proofHash];
        
        emit ProofDeleted(walrusId, proofHash);
    }
    
    /**
     * @dev Get Walrus entry information
     * @param walrusId Walrus storage ID
     * @return WalrusEntry struct
     */
    function getWalrusEntry(string calldata walrusId) external view returns (WalrusEntry memory) {
        require(bytes(walrusId).length > 0, "Walrus ID cannot be empty");
        require(walrusEntries[walrusId].isActive, "Proof not found or inactive");
        return walrusEntries[walrusId];
    }
    
    /**
     * @dev Get total number of stored proofs
     * @return Total count
     */
    function getTotalProofs() external view returns (uint256) {
        return allWalrusIds.length;
    }
    
    /**
     * @dev Get Walrus ID by index
     * @param index Index in the array
     * @return Walrus ID
     */
    function getWalrusIdByIndex(uint256 index) external view returns (string memory) {
        require(index < allWalrusIds.length, "Index out of bounds");
        return allWalrusIds[index];
    }
    
    /**
     * @dev Check if proof exists in Walrus
     * @param proofHash Hash of the proof
     * @return True if proof exists and is active
     */
    function proofExists(bytes32 proofHash) external view returns (bool) {
        string memory walrusId = proofHashToWalrusId[proofHash];
        return bytes(walrusId).length > 0 && walrusEntries[walrusId].isActive;
    }
    
    /**
     * @dev Generate mock Walrus ID
     * @param proofHash Hash of the proof
     * @param agentId Agent ID
     * @return Generated Walrus ID
     */
    function generateWalrusId(
        bytes32 proofHash,
        bytes32 agentId
    ) internal view returns (string memory) {
        // Generate a mock Walrus ID (in reality, this would be returned by Walrus API)
        return string(abi.encodePacked(
            "walrus://",
            toHexString(proofHash),
            "/",
            toHexString(agentId),
            "/",
            toString(block.timestamp)
        ));
    }
    
    /**
     * @dev Convert bytes32 to hex string
     * @param value Bytes32 value
     * @return Hex string
     */
    function toHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory buffer = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            buffer[i * 2] = toHexChar(uint8(value[i]) >> 4);
            buffer[i * 2 + 1] = toHexChar(uint8(value[i]) & 0x0f);
        }
        return string(buffer);
    }
    
    /**
     * @dev Convert uint8 to hex character
     * @param value Uint8 value
     * @return Hex character
     */
    function toHexChar(uint8 value) internal pure returns (bytes1) {
        if (value < 10) {
            return bytes1(uint8(bytes1('0')) + value);
        } else {
            return bytes1(uint8(bytes1('a')) + value - 10);
        }
    }
    
    /**
     * @dev Convert uint256 to string
     * @param value Uint256 value
     * @return String representation
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @dev Get mock Walrus endpoint
     * @return Walrus API endpoint
     */
    function getWalrusEndpoint() external pure returns (string memory) {
        return MOCK_WALRUS_ENDPOINT;
    }
}
