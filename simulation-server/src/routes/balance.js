const express = require('express');
const router = express.Router();
const { BalanceModel, TransactionModel } = require('../models');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// Get current balance
router.get('/', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        
        const balanceData = await BalanceModel.getBalance(meterId);
        
        if (!balanceData) {
            return res.status(404).json({
                success: false,
                message: 'Balance data not found for this meter'
            });
        }

        res.json({
            success: true,
            data: {
                meter_id: balanceData.meter_id,
                current_balance: `₹${balanceData.current_balance.toFixed(2)}`,
                last_updated: balanceData.last_updated,
                status: balanceData.current_balance > config.ALERTS.CRITICAL_BALANCE_THRESHOLD ? 'active' : 'low_balance'
            }
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Add balance (recharge)
router.post('/recharge', async (req, res) => {
    try {
        // Validate request body
        const schema = Joi.object({
            meter_id: Joi.string().optional(),
            amount: Joi.number().positive().required(),
            description: Joi.string().optional(),
            payment_method: Joi.string().optional(),
            transaction_ref: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const meterId = value.meter_id || config.DEFAULT_METER.METER_ID;
        const amount = value.amount;
        const description = value.description || `Balance recharge of ₹${amount}`;

        // Process recharge
        const result = await BalanceModel.recharge(meterId, amount, description);

        // Trigger webhook
        const WebhookService = require('../services/webhookService');
        await WebhookService.triggerWebhooks('recharge_completed', {
            meter_id: meterId,
            amount: amount,
            balance_before: result.balance_before,
            balance_after: result.balance_after,
            transaction_id: result.transaction_id
        });

        res.json({
            success: true,
            message: 'Recharge completed successfully',
            data: {
                transaction_id: result.transaction_id,
                meter_id: meterId,
                amount_added: `₹${amount.toFixed(2)}`,
                balance_before: `₹${result.balance_before.toFixed(2)}`,
                balance_after: `₹${result.balance_after.toFixed(2)}`,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error processing recharge:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const limit = parseInt(req.query.limit) || 50;
        const type = req.query.type; // 'recharge' or 'consumption'

        let transactions;
        if (type) {
            transactions = await TransactionModel.getTransactionsByType(meterId, type, limit);
        } else {
            transactions = await TransactionModel.getTransactions(meterId, limit);
        }

        const formattedTransactions = transactions.map(transaction => ({
            transaction_id: transaction.transaction_id,
            type: transaction.type,
            amount: transaction.type === 'recharge' ? 
                `+₹${transaction.amount.toFixed(2)}` : 
                `-₹${Math.abs(transaction.amount).toFixed(2)}`,
            balance_before: `₹${transaction.balance_before.toFixed(2)}`,
            balance_after: `₹${transaction.balance_after.toFixed(2)}`,
            description: transaction.description,
            timestamp: transaction.timestamp
        }));

        res.json({
            success: true,
            data: formattedTransactions,
            count: formattedTransactions.length,
            filter: type || 'all'
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get transaction summary
router.get('/summary', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const days = parseInt(req.query.days) || 30;

        const summary = await TransactionModel.getTransactionsSummary(meterId, days);
        const currentBalance = await BalanceModel.getBalance(meterId);

        res.json({
            success: true,
            data: {
                period: `Last ${days} days`,
                current_balance: `₹${(currentBalance?.current_balance || 0).toFixed(2)}`,
                total_transactions: summary.total_transactions,
                total_recharges: `₹${summary.total_recharges.toFixed(2)}`,
                total_consumption: `₹${summary.total_consumption.toFixed(2)}`,
                net_change: `₹${(summary.total_recharges - summary.total_consumption).toFixed(2)}`,
                balance_status: currentBalance?.current_balance > config.ALERTS.LOW_BALANCE_THRESHOLD ? 'good' : 'low'
            }
        });
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
