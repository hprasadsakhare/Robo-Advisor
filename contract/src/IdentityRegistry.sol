// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IdentityRegistry
 * @dev ERC-8004 Identity Registry implementation for storing agent metadata
 * This contract stores AgentCard information for robo-advisors
 */
contract IdentityRegistry is Ownable, ReentrancyGuard {
    
    // Struct to store agent metadata
    struct AgentCard {
        string name;                    // Agent name
        string strategyDescription;     // Description of the strategy
        address creator;                // Address of the agent creator
        uint256 createdAt;             // Timestamp when agent was created
        bool isActive;                 // Whether the agent is active
    }
    
    // Mapping from agent ID to AgentCard
    mapping(bytes32 => AgentCard) public agentCards;
    
    // Mapping from creator address to list of agent IDs they created
    mapping(address => bytes32[]) public creatorAgents;
    
    // Array of all agent IDs for enumeration
    bytes32[] public allAgentIds;
    
    // Events
    event AgentRegistered(
        bytes32 indexed agentId,
        string name,
        string strategyDescription,
        address indexed creator
    );
    
    event AgentUpdated(
        bytes32 indexed agentId,
        string name,
        string strategyDescription
    );
    
    event AgentDeactivated(bytes32 indexed agentId);
    
    /**
     * @dev Constructor sets the initial owner
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new agent with metadata
     * @param agentId Unique identifier for the agent
     * @param name Human-readable name for the agent
     * @param strategyDescription Description of the agent's strategy
     */
    function registerAgent(
        bytes32 agentId,
        string calldata name,
        string calldata strategyDescription
    ) external nonReentrant {
        require(agentId != bytes32(0), "Invalid agent ID");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(strategyDescription).length > 0, "Strategy description cannot be empty");
        require(agentCards[agentId].creator == address(0), "Agent already exists");
        
        // Create new agent card
        agentCards[agentId] = AgentCard({
            name: name,
            strategyDescription: strategyDescription,
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Add to creator's agent list
        creatorAgents[msg.sender].push(agentId);
        
        // Add to global list
        allAgentIds.push(agentId);
        
        emit AgentRegistered(agentId, name, strategyDescription, msg.sender);
    }
    
    /**
     * @dev Update agent metadata (only by creator)
     * @param agentId Agent identifier
     * @param name New name
     * @param strategyDescription New strategy description
     */
    function updateAgent(
        bytes32 agentId,
        string calldata name,
        string calldata strategyDescription
    ) external nonReentrant {
        require(agentCards[agentId].creator == msg.sender, "Not the agent creator");
        require(agentCards[agentId].isActive, "Agent is not active");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(strategyDescription).length > 0, "Strategy description cannot be empty");
        
        agentCards[agentId].name = name;
        agentCards[agentId].strategyDescription = strategyDescription;
        
        emit AgentUpdated(agentId, name, strategyDescription);
    }
    
    /**
     * @dev Deactivate an agent (only by creator)
     * @param agentId Agent identifier
     */
    function deactivateAgent(bytes32 agentId) external nonReentrant {
        require(agentCards[agentId].creator == msg.sender, "Not the agent creator");
        require(agentCards[agentId].isActive, "Agent is already inactive");
        
        agentCards[agentId].isActive = false;
        
        emit AgentDeactivated(agentId);
    }
    
    /**
     * @dev Get agent card information
     * @param agentId Agent identifier
     * @return AgentCard struct with all metadata
     */
    function getAgentCard(bytes32 agentId) external view returns (AgentCard memory) {
        require(agentCards[agentId].creator != address(0), "Agent does not exist");
        return agentCards[agentId];
    }
    
    /**
     * @dev Get all agent IDs created by a specific address
     * @param creator Creator address
     * @return Array of agent IDs
     */
    function getAgentsByCreator(address creator) external view returns (bytes32[] memory) {
        return creatorAgents[creator];
    }
    
    /**
     * @dev Get total number of registered agents
     * @return Total count
     */
    function getTotalAgents() external view returns (uint256) {
        return allAgentIds.length;
    }
    
    /**
     * @dev Get agent ID by index (for enumeration)
     * @param index Index in the array
     * @return Agent ID
     */
    function getAgentIdByIndex(uint256 index) external view returns (bytes32) {
        require(index < allAgentIds.length, "Index out of bounds");
        return allAgentIds[index];
    }
    
    /**
     * @dev Check if an agent exists and is active
     * @param agentId Agent identifier
     * @return True if agent exists and is active
     */
    function isAgentActive(bytes32 agentId) external view returns (bool) {
        return agentCards[agentId].creator != address(0) && agentCards[agentId].isActive;
    }
}
