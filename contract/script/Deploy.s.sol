// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {ValidationRegistry} from "../src/ValidationRegistry.sol";
import {RoboAdvisor} from "../src/RoboAdvisor.sol";
import {TEESimulation} from "../src/TEESimulation.sol";
import {WalrusIntegration} from "../src/WalrusIntegration.sol";

/**
 * @title Deploy
 * @dev Deployment script for the Trustless Robo-Advisor system
 * This script deploys all contracts in the correct order with proper initialization
 */
contract Deploy is Script {
    
    // Contract instances
    IdentityRegistry public identityRegistry;
    ValidationRegistry public validationRegistry;
    RoboAdvisor public roboAdvisor;
    TEESimulation public teeSimulation;
    WalrusIntegration public walrusIntegration;
    
    // Mock token addresses (for testing)
    address public constant MOCK_AAVE_TOKEN = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9; // AAVE token
    address public constant MOCK_UNISWAP_TOKEN = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984; // UNI token
    
    // Strategy configuration
    uint256 public constant AAVE_THRESHOLD_APY = 500; // 5% in basis points
    
    function run() external {
        deployContracts();
    }
    
    function deployContracts() internal {
        // Get deployer private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Starting deployment of Trustless Robo-Advisor system...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // Deploy contracts in order
        deployIdentityRegistry();
        deployValidationRegistry();
        deployTeeSimulation();
        deployWalrusIntegration();
        deployRoboAdvisor();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log deployment summary
        logDeploymentSummary();
    }
    
    /**
     * @dev Deploy Identity Registry contract
     */
    function deployIdentityRegistry() internal {
        console.log("Deploying IdentityRegistry...");
        
        identityRegistry = new IdentityRegistry();
        
        console.log("IdentityRegistry deployed at:", address(identityRegistry));
    }
    
    /**
     * @dev Deploy Validation Registry contract
     */
    function deployValidationRegistry() internal {
        console.log("Deploying ValidationRegistry...");
        
        validationRegistry = new ValidationRegistry();
        
        console.log("ValidationRegistry deployed at:", address(validationRegistry));
    }
    
    /**
     * @dev Deploy TEE Simulation contract
     */
    function deployTeeSimulation() internal {
        console.log("Deploying TEESimulation...");
        
        teeSimulation = new TEESimulation();
        
        console.log("TEESimulation deployed at:", address(teeSimulation));
    }
    
    /**
     * @dev Deploy Walrus Integration contract
     */
    function deployWalrusIntegration() internal {
        console.log("Deploying WalrusIntegration...");
        
        walrusIntegration = new WalrusIntegration();
        
        console.log("WalrusIntegration deployed at:", address(walrusIntegration));
    }
    
    /**
     * @dev Deploy Robo-Advisor contract
     */
    function deployRoboAdvisor() internal {
        console.log("Deploying RoboAdvisor...");
        
        roboAdvisor = new RoboAdvisor(
            address(identityRegistry),
            address(validationRegistry),
            AAVE_THRESHOLD_APY,
            MOCK_AAVE_TOKEN,
            MOCK_UNISWAP_TOKEN
        );
        
        console.log("RoboAdvisor deployed at:", address(roboAdvisor));
    }
    

    
    /**
     * @dev Log deployment summary
     */
    function logDeploymentSummary() internal view {
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("IdentityRegistry:", address(identityRegistry));
        console.log("ValidationRegistry:", address(validationRegistry));
        console.log("TEESimulation:", address(teeSimulation));
        console.log("WalrusIntegration:", address(walrusIntegration));
        console.log("RoboAdvisor:", address(roboAdvisor));
        console.log("========================\n");
        
        console.log("=== CONFIGURATION ===");
        console.log("AAVE Threshold APY:", AAVE_THRESHOLD_APY, "basis points (5%)");
        console.log("Mock Aave Token:", MOCK_AAVE_TOKEN);
        console.log("Mock Uniswap Token:", MOCK_UNISWAP_TOKEN);
        console.log("====================\n");
        
        console.log("=== NEXT STEPS ===");
        console.log("1. Register an agent using IdentityRegistry");
        console.log("2. Generate a TEE proof using TEESimulation");
        console.log("3. Store proof in Walrus using WalrusIntegration");
        console.log("4. Submit proof to ValidationRegistry");
        console.log("5. Execute strategy using RoboAdvisor");
        console.log("==================\n");
    }
    
    /**
     * @dev Deploy and test the system with sample data
     */
    function deployAndTest() external {
        // Deploy contracts
        deployContracts();
        
        // Get deployer private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting for testing
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("\n=== RUNNING SAMPLE TEST ===");
        
        // Create sample agent
        bytes32 agentId = keccak256(abi.encodePacked("SampleAgent", block.timestamp));
        string memory agentName = "Sample Robo-Advisor";
        string memory strategyDesc = "Move to Aave if APY > 5%, else move to Uniswap";
        
        // Register agent
        identityRegistry.registerAgent(agentId, agentName, strategyDesc);
        console.log("Registered agent:", agentName);
        
        // Generate TEE proof
        string memory strategyResult = "Moved to Aave - APY 6% > threshold 5%";
        bytes memory transactionData = abi.encodePacked("sample transaction data");
        
        (bytes32 proofId, bytes32 proofHash, bytes memory signature) = teeSimulation.generateProof(
            agentId,
            strategyResult,
            transactionData
        );
        console.log("Generated TEE proof: %s", vm.toString(proofId));
        
        // Store in Walrus
        bytes memory proofData = abi.encode(proofId, proofHash, agentId, strategyResult, signature);
        (string memory walrusId, bytes32 walrusProofHash) = walrusIntegration.storeProof(
            proofData,
            agentId
        );
        console.log("Stored in Walrus: %s", walrusId);
        
        // Submit to Validation Registry
        validationRegistry.submitProof(
            proofId,
            agentId,
            walrusProofHash,
            walrusId,
            signature
        );
        console.log("Submitted to Validation Registry");
        
        // Execute strategy
        uint256 amount = 1000 * 10**18; // 1000 tokens
        roboAdvisor.executeStrategy(agentId, amount, proofId);
        console.log("Executed strategy with amount: %d", amount);
        
        vm.stopBroadcast();
        
        console.log("=== SAMPLE TEST COMPLETED ===\n");
    }
}
