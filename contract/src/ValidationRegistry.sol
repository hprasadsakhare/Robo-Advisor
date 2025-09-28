// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ValidationRegistry
 * @dev ERC-8004 Validation Registry implementation for storing proof hashes
 * This contract stores hashes of TEE proofs and Walrus storage references
 */
contract ValidationRegistry is Ownable, ReentrancyGuard {
    
    // Struct to store validation proof information
    struct ValidationProof {
        bytes32 proofHash;              // Hash of the TEE proof
        string walrusReference;         // Reference to Walrus storage
        address validator;              // Address that submitted the proof
        uint256 submittedAt;            // Timestamp when proof was submitted
        bool isValid;                   // Whether the proof is valid
        bytes32 agentId;                // Associated agent ID
    }
    
    // Mapping from proof ID to ValidationProof
    mapping(bytes32 => ValidationProof) public validationProofs;
    
    // Mapping from agent ID to list of proof IDs
    mapping(bytes32 => bytes32[]) public agentProofs;
    
    // Array of all proof IDs for enumeration
    bytes32[] public allProofIds;
    
    // Mock TEE public key for signature verification (hardcoded for simulation)
    address public constant MOCK_TEE_PUBLIC_KEY = 0x742d35Cc6634C0532925A3B8D4C9dB96C4B4d8B6;
    
    // Events
    event ProofSubmitted(
        bytes32 indexed proofId,
        bytes32 indexed agentId,
        bytes32 proofHash,
        string walrusReference,
        address indexed validator
    );
    
    event ProofValidated(
        bytes32 indexed proofId,
        bool isValid
    );
    
    event ProofInvalidated(
        bytes32 indexed proofId,
        string reason
    );
    
    /**
     * @dev Constructor sets the initial owner
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Submit a validation proof for an agent
     * @param proofId Unique identifier for this proof
     * @param agentId Associated agent ID
     * @param proofHash Hash of the TEE proof
     * @param walrusReference Reference to Walrus storage
     * @param signature Signature from mock TEE (for simulation)
     */
    function submitProof(
        bytes32 proofId,
        bytes32 agentId,
        bytes32 proofHash,
        string calldata walrusReference,
        bytes calldata signature
    ) external nonReentrant {
        require(proofId != bytes32(0), "Invalid proof ID");
        require(agentId != bytes32(0), "Invalid agent ID");
        require(proofHash != bytes32(0), "Invalid proof hash");
        require(bytes(walrusReference).length > 0, "Walrus reference cannot be empty");
        require(validationProofs[proofId].validator == address(0), "Proof already exists");
        
        // Verify the signature (mock TEE verification)
        require(verifyTeeSignature(proofHash, signature), "Invalid TEE signature");
        
        // Create validation proof
        validationProofs[proofId] = ValidationProof({
            proofHash: proofHash,
            walrusReference: walrusReference,
            validator: msg.sender,
            submittedAt: block.timestamp,
            isValid: true,
            agentId: agentId
        });
        
        // Add to agent's proof list
        agentProofs[agentId].push(proofId);
        
        // Add to global list
        allProofIds.push(proofId);
        
        emit ProofSubmitted(proofId, agentId, proofHash, walrusReference, msg.sender);
        emit ProofValidated(proofId, true);
    }
    
    /**
     * @dev Invalidate a proof (only by owner for admin purposes)
     * @param proofId Proof identifier
     * @param reason Reason for invalidation
     */
    function invalidateProof(
        bytes32 proofId,
        string calldata reason
    ) external onlyOwner nonReentrant {
        require(validationProofs[proofId].validator != address(0), "Proof does not exist");
        require(validationProofs[proofId].isValid, "Proof already invalid");
        
        validationProofs[proofId].isValid = false;
        
        emit ProofInvalidated(proofId, reason);
    }
    
    /**
     * @dev Get validation proof information
     * @param proofId Proof identifier
     * @return ValidationProof struct with all information
     */
    function getValidationProof(bytes32 proofId) external view returns (ValidationProof memory) {
        require(validationProofs[proofId].validator != address(0), "Proof does not exist");
        return validationProofs[proofId];
    }
    
    /**
     * @dev Get all proof IDs for a specific agent
     * @param agentId Agent identifier
     * @return Array of proof IDs
     */
    function getProofsByAgent(bytes32 agentId) external view returns (bytes32[] memory) {
        return agentProofs[agentId];
    }
    
    /**
     * @dev Get total number of submitted proofs
     * @return Total count
     */
    function getTotalProofs() external view returns (uint256) {
        return allProofIds.length;
    }
    
    /**
     * @dev Get proof ID by index (for enumeration)
     * @param index Index in the array
     * @return Proof ID
     */
    function getProofIdByIndex(uint256 index) external view returns (bytes32) {
        require(index < allProofIds.length, "Index out of bounds");
        return allProofIds[index];
    }
    
    /**
     * @dev Check if a proof exists and is valid
     * @param proofId Proof identifier
     * @return True if proof exists and is valid
     */
    function isProofValid(bytes32 proofId) external view returns (bool) {
        return validationProofs[proofId].validator != address(0) && validationProofs[proofId].isValid;
    }
    
    /**
     * @dev Get the latest valid proof for an agent
     * @param agentId Agent identifier
     * @return proofId Latest valid proof ID, or bytes32(0) if none found
     */
    function getLatestValidProof(bytes32 agentId) external view returns (bytes32) {
        bytes32[] memory proofs = agentProofs[agentId];
        
        // Iterate from the end to find the latest valid proof
        for (uint256 i = proofs.length; i > 0; i--) {
            bytes32 proofId = proofs[i - 1];
            if (validationProofs[proofId].isValid) {
                return proofId;
            }
        }
        
        return bytes32(0);
    }
    
    /**
     * @dev Mock TEE signature verification (for simulation)
     * In a real implementation, this would verify against actual TEE attestation
     * @param signature Signature to verify
     * @return True if signature is valid
     */
    function verifyTeeSignature(
        bytes32 /* messageHash */,
        bytes calldata signature
    ) internal pure returns (bool) {
        // For simulation purposes, we'll accept any non-empty signature
        // In a real implementation, this would use ecrecover or similar
        // to verify against the TEE's public key
        return signature.length > 0;
    }
    
    /**
     * @dev Generate a mock proof hash (for testing/simulation)
     * @param agentId Agent identifier
     * @param strategyResult Result of strategy execution
     * @param timestamp Execution timestamp
     * @return Proof hash
     */
    function generateMockProofHash(
        bytes32 agentId,
        string memory strategyResult,
        uint256 timestamp
    ) external pure returns (bytes32) {
        // Use inline assembly for more efficient hashing
        bytes memory data = abi.encode(agentId, strategyResult, timestamp);
        bytes32 hash;
        assembly {
            hash := keccak256(add(data, 0x20), mload(data))
        }
        return hash;
    }
}
