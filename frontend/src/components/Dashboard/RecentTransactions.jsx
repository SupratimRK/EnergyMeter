import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

import { useApi } from '../../hooks';
import { balanceApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils';

const RecentTransactions = () => {
  const { data: transactionsData, isLoading } = useApi(
    () => balanceApi.getTransactions({ limit: 10 }),
    []
  );

  const transactions = transactionsData?.data || [];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'recharge':
        return ArrowUpRight;
      case 'consumption':
        return ArrowDownRight;
      default:
        return CreditCard;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'recharge':
        return 'text-green-600 bg-green-50';
      case 'consumption':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-sm text-gray-600">Last 10 transactions</p>
          </div>
        </div>
        
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <div className="text-gray-500">No transactions found</div>
            <div className="text-sm text-gray-400">Your transaction history will appear here</div>
          </div>
        ) : (
          transactions.map((transaction, index) => {
            const Icon = getTransactionIcon(transaction.type);
            const colorClass = getTransactionColor(transaction.type);
            
            return (
              <motion.div
                key={transaction.transaction_id || index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {/* Transaction Icon */}
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {transaction.type === 'recharge' ? 'Account Recharge' : 'Energy Consumption'}
                    </h4>
                    <span className={`text-sm font-semibold ${
                      transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'recharge' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {transaction.description || 'No description'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDateTime(transaction.timestamp)}
                    </span>
                  </div>
                  
                  {/* Balance Change */}
                  {transaction.balance_after && (
                    <div className="mt-1 text-xs text-gray-600">
                      Balance: {formatCurrency(transaction.balance_before)} → {formatCurrency(transaction.balance_after)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            {/* Total Recharges */}
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">Recharges</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'recharge')
                    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^\d.-]/g, '') || 0), 0)
                )}
              </div>
            </div>

            {/* Total Consumption */}
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm font-medium text-red-600">Consumption</span>
              </div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'consumption')
                    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^\d.-]/g, '') || 0), 0)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="btn-primary flex-1 text-sm py-2">
            New Recharge
          </button>
          <button className="btn-secondary px-4 text-sm py-2">
            Export
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentTransactions;
