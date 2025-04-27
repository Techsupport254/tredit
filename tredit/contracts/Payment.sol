// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Payment is Ownable, ReentrancyGuard {
    struct PaymentInfo {
        address payer;
        address payee;
        uint256 amount;
        bytes32 paymentId;
        address token;
        bool isFiat;
        bool isCompleted;
        uint256 timestamp;
    }

    // Mapping to store payment information
    mapping(bytes32 => PaymentInfo) public payments;
    
    // Supported payment tokens
    mapping(address => bool) public supportedTokens;
    
    // Events
    event PaymentInitiated(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        bool isFiat
    );
    
    event PaymentCompleted(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    // Add supported token
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }
    
    // Remove supported token
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }
    
    // Initiate blockchain payment
    function initiateBlockchainPayment(
        address payee,
        uint256 amount,
        address token
    ) external nonReentrant returns (bytes32) {
        require(payee != address(0), "Invalid payee address");
        require(amount > 0, "Amount must be greater than 0");
        require(supportedTokens[token], "Unsupported token");
        
        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                payee,
                amount,
                block.timestamp,
                block.prevrandao
            )
        );
        
        // Transfer tokens from payer to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        payments[paymentId] = PaymentInfo({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            paymentId: paymentId,
            token: token,
            isFiat: false,
            isCompleted: false,
            timestamp: block.timestamp
        });
        
        emit PaymentInitiated(paymentId, msg.sender, payee, amount, false);
        return paymentId;
    }
    
    // Record fiat payment (called by backend after Paystack verification)
    function recordFiatPayment(
        address payer,
        address payee,
        uint256 amount,
        bytes32 paymentId
    ) external onlyOwner {
        require(payer != address(0), "Invalid payer address");
        require(payee != address(0), "Invalid payee address");
        require(amount > 0, "Amount must be greater than 0");
        require(payments[paymentId].payer == address(0), "Payment ID already exists");
        
        payments[paymentId] = PaymentInfo({
            payer: payer,
            payee: payee,
            amount: amount,
            paymentId: paymentId,
            token: address(0),
            isFiat: true,
            isCompleted: false,
            timestamp: block.timestamp
        });
        
        emit PaymentInitiated(paymentId, payer, payee, amount, true);
    }
    
    // Complete payment (release funds to payee)
    function completePayment(bytes32 paymentId) external nonReentrant {
        PaymentInfo storage payment = payments[paymentId];
        require(payment.payer != address(0), "Payment not found");
        require(!payment.isCompleted, "Payment already completed");
        require(msg.sender == payment.payee || msg.sender == owner(), "Unauthorized");
        
        payment.isCompleted = true;
        
        if (!payment.isFiat) {
            // For blockchain payments, transfer tokens to payee
            IERC20(payment.token).transfer(payment.payee, payment.amount);
        }
        
        emit PaymentCompleted(
            paymentId,
            payment.payer,
            payment.payee,
            payment.amount
        );
    }
    
    // Get payment information
    function getPayment(bytes32 paymentId) external view returns (PaymentInfo memory) {
        return payments[paymentId];
    }
} 