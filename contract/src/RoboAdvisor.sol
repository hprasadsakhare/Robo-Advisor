// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IdentityRegistry} from "./IdentityRegistry.sol";
import {ValidationRegistry} from "./ValidationRegistry.sol";

/**
 * @title RoboAdvisor
 * @dev Trustless Robo-Advisor with simple rule-based strategy
 * Strategy: Move to Aave if APY > X, else move to Uniswap
 */
contract RoboAdvisor is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Strategy configuration
    struct StrategyConfig {
        uint256 aaveThresholdApy;       // APY threshold for Aave (in basis points, e.g., 500 = 5%)
        address aaveToken;              // Aave token address
        address uniswapToken;           // Uniswap token address
        bool isActive;                  // Whether strategy is active
    }
    
    // Strategy execution record
    struct StrategyExecution {
        bytes32 agentId;                // Agent that executed the strategy
        uint256 timestamp;              // Execution timestamp
        uint256 aaveApy;                // Aave APY at time of execution
        bool movedToAave;               // Whether funds were moved to Aave
        uint256 amount;                 // Amount moved
        bytes32 proofId;                // Associated proof ID
    }
    
    // Contract references
    IdentityRegistry public immutable IDENTITY_REGISTRY;
    ValidationRegistry public immutable VALIDATION_REGISTRY;
    
    // Strategy configuration
    StrategyConfig public strategyConfig;
    
    // Execution history
    mapping(bytes32 => StrategyExecution[]) public agentExecutions;
    StrategyExecution[] public allExecutions;
    
    // Mock APY data (in a real implementation, this would come from oracles)
    uint256 public mockAaveApy = 600; // 6% APY in basis points
    uint256 public mockUniswapApy = 300; // 3% APY in basis points
    
    // Events
    event StrategyExecuted(
        bytes32 indexed agentId,
        uint256 aaveApy,
        bool movedToAave,
        uint256 amount,
        bytes32 indexed proofId
    );
    
    event StrategyConfigUpdated(
        uint256 aaveThresholdApy,
        address aaveToken,
        address uniswapToken
    );
    
    event MockAPYUpdated(
        uint256 aaveApy,
        uint256 uniswapApy
    );
    
    /**
     * @dev Constructor
     * @param _identityRegistry Address of the Identity Registry
     * @param _validationRegistry Address of the Validation Registry
     * @param _aaveThresholdApy APY threshold for Aave (in basis points)
     * @param _aaveToken Aave token address
     * @param _uniswapToken Uniswap token address
     */
    constructor(
        address _identityRegistry,
        address _validationRegistry,
        uint256 _aaveThresholdApy,
        address _aaveToken,
        address _uniswapToken
    ) Ownable(msg.sender) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        require(_validationRegistry != address(0), "Invalid validation registry");
        require(_aaveToken != address(0), "Invalid Aave token");
        require(_uniswapToken != address(0), "Invalid Uniswap token");
        
        IDENTITY_REGISTRY = IdentityRegistry(_identityRegistry);
        VALIDATION_REGISTRY = ValidationRegistry(_validationRegistry);
        
        strategyConfig = StrategyConfig({
            aaveThresholdApy: _aaveThresholdApy,
            aaveToken: _aaveToken,
            uniswapToken: _uniswapToken,
            isActive: true
        });
    }
    
    /**
     * @dev Execute the robo-advisor strategy
     * @param agentId Agent identifier
     * @param amount Amount to move (in wei)
     * @param proofId Proof ID for validation
     */
    function executeStrategy(
        bytes32 agentId,
        uint256 amount,
        bytes32 proofId
    ) external nonReentrant {
        require(strategyConfig.isActive, "Strategy is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(IDENTITY_REGISTRY.isAgentActive(agentId), "Agent is not active");
        require(VALIDATION_REGISTRY.isProofValid(proofId), "Proof is not valid");
        
        // Get current APY (in a real implementation, this would come from oracles)
        uint256 currentAaveApy = mockAaveApy;
        
        // Determine strategy decision
        bool moveToAave = currentAaveApy > strategyConfig.aaveThresholdApy;
        
        // Create execution record
        StrategyExecution memory execution = StrategyExecution({
            agentId: agentId,
            timestamp: block.timestamp,
            aaveApy: currentAaveApy,
            movedToAave: moveToAave,
            amount: amount,
            proofId: proofId
        });
        
        // Store execution
        agentExecutions[agentId].push(execution);
        allExecutions.push(execution);
        
        // Execute the strategy (simplified - in reality this would interact with Aave/Uniswap)
        if (moveToAave) {
            // Move to Aave (simplified - just emit event)
            emit StrategyExecuted(agentId, currentAaveApy, true, amount, proofId);
        } else {
            // Move to Uniswap (simplified - just emit event)
            emit StrategyExecuted(agentId, currentAaveApy, false, amount, proofId);
        }
    }
    
    /**
     * @dev Update strategy configuration (only owner)
     * @param _aaveThresholdApy New APY threshold
     * @param _aaveToken New Aave token address
     * @param _uniswapToken New Uniswap token address
     */
    function updateStrategyConfig(
        uint256 _aaveThresholdApy,
        address _aaveToken,
        address _uniswapToken
    ) external onlyOwner {
        require(_aaveToken != address(0), "Invalid Aave token");
        require(_uniswapToken != address(0), "Invalid Uniswap token");
        
        strategyConfig.aaveThresholdApy = _aaveThresholdApy;
        strategyConfig.aaveToken = _aaveToken;
        strategyConfig.uniswapToken = _uniswapToken;
        
        emit StrategyConfigUpdated(_aaveThresholdApy, _aaveToken, _uniswapToken);
    }
    
    /**
     * @dev Toggle strategy active status (only owner)
     */
    function toggleStrategyActive() external onlyOwner {
        strategyConfig.isActive = !strategyConfig.isActive;
    }
    
    /**
     * @dev Update mock APY data (only owner - for testing)
     * @param _aaveApy New Aave APY
     * @param _uniswapApy New Uniswap APY
     */
    function updateMockApy(
        uint256 _aaveApy,
        uint256 _uniswapApy
    ) external onlyOwner {
        mockAaveApy = _aaveApy;
        mockUniswapApy = _uniswapApy;
        
        emit MockAPYUpdated(_aaveApy, _uniswapApy);
    }
    
    /**
     * @dev Get execution history for an agent
     * @param agentId Agent identifier
     * @return Array of StrategyExecution structs
     */
    function getAgentExecutions(bytes32 agentId) external view returns (StrategyExecution[] memory) {
        return agentExecutions[agentId];
    }
    
    /**
     * @dev Get total number of executions
     * @return Total count
     */
    function getTotalExecutions() external view returns (uint256) {
        return allExecutions.length;
    }
    
    /**
     * @dev Get execution by index
     * @param index Index in the array
     * @return StrategyExecution struct
     */
    function getExecutionByIndex(uint256 index) external view returns (StrategyExecution memory) {
        require(index < allExecutions.length, "Index out of bounds");
        return allExecutions[index];
    }
    
    /**
     * @dev Get the latest execution for an agent
     * @param agentId Agent identifier
     * @return Latest StrategyExecution struct, or empty struct if none found
     */
    function getLatestExecution(bytes32 agentId) external view returns (StrategyExecution memory) {
        StrategyExecution[] memory executions = agentExecutions[agentId];
        if (executions.length == 0) {
            return StrategyExecution({
                agentId: bytes32(0),
                timestamp: 0,
                aaveApy: 0,
                movedToAave: false,
                amount: 0,
                proofId: bytes32(0)
            });
        }
        return executions[executions.length - 1];
    }
    
    /**
     * @dev Get strategy decision for current conditions
     * @return True if should move to Aave, false for Uniswap
     */
    function getCurrentStrategyDecision() external view returns (bool) {
        return mockAaveApy > strategyConfig.aaveThresholdApy;
    }
    
    /**
     * @dev Get current APY information
     * @return aaveApy Current Aave APY
     * @return uniswapApy Current Uniswap APY
     * @return thresholdApy Strategy threshold APY
     */
    function getCurrentApyInfo() external view returns (
        uint256 aaveApy,
        uint256 uniswapApy,
        uint256 thresholdApy
    ) {
        return (mockAaveApy, mockUniswapApy, strategyConfig.aaveThresholdApy);
    }
}
