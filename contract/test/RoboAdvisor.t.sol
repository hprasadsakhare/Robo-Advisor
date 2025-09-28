// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {ValidationRegistry} from "../src/ValidationRegistry.sol";
import {RoboAdvisor} from "../src/RoboAdvisor.sol";
import {TEESimulation} from "../src/TEESimulation.sol";
import {WalrusIntegration} from "../src/WalrusIntegration.sol";

/**
 * @title RoboAdvisorTest
 * @dev Comprehensive test suite for the Trustless Robo-Advisor system
 */
contract RoboAdvisorTest is Test {
    
    // Contract instances
    IdentityRegistry public identityRegistry;
    ValidationRegistry public validationRegistry;
    RoboAdvisor public roboAdvisor;
    TEESimulation public teeSimulation;
    WalrusIntegration public walrusIntegration;
    
    // Test addresses
    address public deployer;
    address public agentCreator;
    address public user;
    
    // Mock token addresses
    address public constant MOCK_AAVE_TOKEN = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9;
    address public constant MOCK_UNISWAP_TOKEN = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984;
    
    // Test constants
    uint256 public constant AAVE_THRESHOLD_APY = 500; // 5%
    bytes32 public agentId;
    
    function setUp() public {
        // Set up test addresses
        deployer = address(this);
        agentCreator = makeAddr("agentCreator");
        user = makeAddr("user");
        
        // Deploy contracts
        identityRegistry = new IdentityRegistry();
        validationRegistry = new ValidationRegistry();
        teeSimulation = new TEESimulation();
        walrusIntegration = new WalrusIntegration();
        
        roboAdvisor = new RoboAdvisor(
            address(identityRegistry),
            address(validationRegistry),
            AAVE_THRESHOLD_APY,
            MOCK_AAVE_TOKEN,
            MOCK_UNISWAP_TOKEN
        );
        
        // Create test agent
        agentId = keccak256(abi.encodePacked("TestAgent", block.timestamp));
        
        vm.prank(agentCreator);
        identityRegistry.registerAgent(
            agentId,
            "Test Robo-Advisor",
            "Move to Aave if APY > 5%, else move to Uniswap"
        );
    }
    
    function testAgentRegistration() public view {
        // Test agent registration
        assertTrue(identityRegistry.isAgentActive(agentId));
        
        IdentityRegistry.AgentCard memory agentCard = identityRegistry.getAgentCard(agentId);
        assertEq(agentCard.name, "Test Robo-Advisor");
        assertEq(agentCard.creator, agentCreator);
        assertTrue(agentCard.isActive);
    }
    
    function testTEEProofGeneration() public {
        // Test TEE proof generation
        string memory strategyResult = "Moved to Aave - APY 6% > threshold 5%";
        bytes memory transactionData = abi.encodePacked("test transaction data");
        
        (bytes32 proofId, bytes32 proofHash, bytes memory signature) = teeSimulation.generateProof(
            agentId,
            strategyResult,
            transactionData
        );
        
        assertTrue(proofId != bytes32(0));
        assertTrue(proofHash != bytes32(0));
        assertTrue(signature.length > 0);
        assertTrue(teeSimulation.validateProof(proofId));
    }
    
    function testWalrusStorage() public {
        // Test Walrus storage
        bytes memory proofData = abi.encodePacked("test proof data");
        
        (string memory walrusId, bytes32 proofHash) = walrusIntegration.storeProof(
            proofData,
            agentId
        );
        
        assertTrue(bytes(walrusId).length > 0);
        assertTrue(proofHash != bytes32(0));
        assertTrue(walrusIntegration.proofExists(proofHash));
        
        // Test retrieval
        (bytes32 retrievedHash, bytes32 retrievedAgentId, uint256 storedAt, uint256 size) = 
            walrusIntegration.retrieveProof(walrusId);
        
        assertEq(retrievedHash, proofHash);
        assertEq(retrievedAgentId, agentId);
        assertTrue(storedAt > 0);
        assertEq(size, proofData.length);
    }
    
    function testValidationRegistry() public {
        // Generate TEE proof
        string memory strategyResult = "Moved to Aave - APY 6% > threshold 5%";
        bytes memory transactionData = abi.encodePacked("test transaction data");
        
        (bytes32 proofId, bytes32 proofHash, bytes memory signature) = teeSimulation.generateProof(
            agentId,
            strategyResult,
            transactionData
        );
        
        // Store in Walrus
        bytes memory proofData = abi.encode(proofId, proofHash, agentId, strategyResult, signature);
        (string memory walrusId, bytes32 walrusProofHash) = walrusIntegration.storeProof(
            proofData,
            agentId
        );
        
        // Submit to Validation Registry
        vm.prank(agentCreator);
        validationRegistry.submitProof(
            proofId,
            agentId,
            walrusProofHash,
            walrusId,
            signature
        );
        
        // Verify submission
        assertTrue(validationRegistry.isProofValid(proofId));
        
        ValidationRegistry.ValidationProof memory validationProof = validationRegistry.getValidationProof(proofId);
        assertEq(validationProof.proofHash, walrusProofHash);
        assertEq(validationProof.agentId, agentId);
        assertEq(validationProof.validator, agentCreator);
        assertTrue(validationProof.isValid);
    }
    
    function testStrategyExecution() public {
        // Set up proof
        string memory strategyResult = "Moved to Aave - APY 6% > threshold 5%";
        bytes memory transactionData = abi.encodePacked("test transaction data");
        
        (bytes32 proofId, bytes32 proofHash, bytes memory signature) = teeSimulation.generateProof(
            agentId,
            strategyResult,
            transactionData
        );
        
        bytes memory proofData = abi.encode(proofId, proofHash, agentId, strategyResult, signature);
        (string memory walrusId, bytes32 walrusProofHash) = walrusIntegration.storeProof(
            proofData,
            agentId
        );
        
        vm.prank(agentCreator);
        validationRegistry.submitProof(
            proofId,
            agentId,
            walrusProofHash,
            walrusId,
            signature
        );
        
        // Execute strategy
        uint256 amount = 1000 * 10**18;
        
        vm.prank(agentCreator);
        roboAdvisor.executeStrategy(agentId, amount, proofId);
        
        // Verify execution
        RoboAdvisor.StrategyExecution memory execution = roboAdvisor.getLatestExecution(agentId);
        assertEq(execution.agentId, agentId);
        assertEq(execution.amount, amount);
        assertEq(execution.proofId, proofId);
        assertTrue(execution.timestamp > 0);
    }
    
    function testStrategyDecision() public {
        // Test strategy decision logic
        bool shouldMoveToAave = roboAdvisor.getCurrentStrategyDecision();
        
        // With mock APY of 6% and threshold of 5%, should move to Aave
        assertTrue(shouldMoveToAave);
        
        // Update mock APY to 3% (below threshold)
        roboAdvisor.updateMockApy(300, 300);
        
        shouldMoveToAave = roboAdvisor.getCurrentStrategyDecision();
        assertFalse(shouldMoveToAave);
    }
    
    function testAPYInfo() public view{
        // Test APY information retrieval
        (uint256 aaveApy, uint256 uniswapApy, uint256 thresholdApy) = roboAdvisor.getCurrentApyInfo();
        
        assertEq(aaveApy, 600); // 6%
        assertEq(uniswapApy, 300); // 3%
        assertEq(thresholdApy, AAVE_THRESHOLD_APY); // 5%
    }
    
    function testAgentDeactivation() public {
        // Test agent deactivation
        vm.prank(agentCreator);
        identityRegistry.deactivateAgent(agentId);
        
        assertFalse(identityRegistry.isAgentActive(agentId));
        
        // Try to execute strategy with deactivated agent (should fail)
        bytes32 proofId = keccak256(abi.encodePacked("test proof"));
        
        vm.prank(agentCreator);
        vm.expectRevert("Agent is not active");
        roboAdvisor.executeStrategy(agentId, 1000, proofId);
    }
    
    function testInvalidProof() public {
        // Test strategy execution with invalid proof
        bytes32 invalidProofId = keccak256(abi.encodePacked("invalid proof"));
        
        vm.prank(agentCreator);
        vm.expectRevert("Proof is not valid");
        roboAdvisor.executeStrategy(agentId, 1000, invalidProofId);
    }
    
    function testStrategyConfiguration() public {
        // Test strategy configuration update
        uint256 newThreshold = 700; // 7%
        address newAaveToken = makeAddr("newAaveToken");
        address newUniswapToken = makeAddr("newUniswapToken");
        
        roboAdvisor.updateStrategyConfig(newThreshold, newAaveToken, newUniswapToken);
        
        (uint256 aaveThresholdApy, address aaveToken, address uniswapToken, ) = roboAdvisor.strategyConfig();
        assertEq(aaveThresholdApy, newThreshold);
        assertEq(aaveToken, newAaveToken);
        assertEq(uniswapToken, newUniswapToken);
    }
    
    function testStrategyToggle() public {
        // Test strategy activation/deactivation
        (,,, bool isActive) = roboAdvisor.strategyConfig();
        assertTrue(isActive);
        
        roboAdvisor.toggleStrategyActive();
        (,,, isActive) = roboAdvisor.strategyConfig();
        assertFalse(isActive);
        
        // Try to execute strategy when inactive (should fail)
        bytes32 proofId = keccak256(abi.encodePacked("test proof"));
        
        vm.prank(agentCreator);
        vm.expectRevert("Strategy is not active");
        roboAdvisor.executeStrategy(agentId, 1000, proofId);
    }
    
    function testFullWorkflow() public {
        // Test complete workflow from agent registration to strategy execution
        
        // 1. Register agent (already done in setUp)
        assertTrue(identityRegistry.isAgentActive(agentId));
        
        // 2. Generate TEE proof
        string memory strategyResult = "Moved to Aave - APY 6% > threshold 5%";
        bytes memory transactionData = abi.encodePacked("full workflow test");
        
        (bytes32 proofId, bytes32 proofHash, bytes memory signature) = teeSimulation.generateProof(
            agentId,
            strategyResult,
            transactionData
        );
        
        // 3. Store in Walrus
        bytes memory proofData = abi.encode(proofId, proofHash, agentId, strategyResult, signature);
        (string memory walrusId, bytes32 walrusProofHash) = walrusIntegration.storeProof(
            proofData,
            agentId
        );
        
        // 4. Submit to Validation Registry
        vm.prank(agentCreator);
        validationRegistry.submitProof(
            proofId,
            agentId,
            walrusProofHash,
            walrusId,
            signature
        );
        
        // 5. Execute strategy
        uint256 amount = 5000 * 10**18;
        
        vm.prank(agentCreator);
        roboAdvisor.executeStrategy(agentId, amount, proofId);
        
        // 6. Verify execution
        RoboAdvisor.StrategyExecution memory execution = roboAdvisor.getLatestExecution(agentId);
        assertEq(execution.agentId, agentId);
        assertEq(execution.amount, amount);
        assertEq(execution.proofId, proofId);
        assertTrue(execution.movedToAave); // Should move to Aave with 6% APY > 5% threshold
        
        // 7. Verify execution history
        RoboAdvisor.StrategyExecution[] memory executions = roboAdvisor.getAgentExecutions(agentId);
        assertEq(executions.length, 1);
        assertEq(executions[0].amount, amount);
        
        console.log("Full workflow test completed successfully!");
    }
}
