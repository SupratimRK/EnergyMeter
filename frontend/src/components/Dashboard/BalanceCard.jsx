import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';

import { formatCurrency, parseNumericValue } from '../../utils';
import { balanceApi } from '../../services/api';

const BalanceCard = ({ data, isLoading }) => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);

  const balance = data?.current_balance 
    ? parseNumericValue(data.current_balance) 
    : 0;

  const getBalanceStatus = () => {
    if (balance <= 50) return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (balance <= 100) return { status: 'low', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const balanceStatus = getBalanceStatus();

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsRecharging(true);
    try {
      const response = await balanceApi.recharge(parseFloat(rechargeAmount));
      if (response.data.success) {
        toast.success(`Successfully recharged ${formatCurrency(rechargeAmount)}`);
        setShowRechargeModal(false);
        setRechargeAmount('');
        // Trigger a refresh of the balance data
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to recharge. Please try again.');
      console.error('Recharge error:', error);
    } finally {
      setIsRecharging(false);
    }
  };

  const quickRechargeAmounts = [50, 100, 200, 500];

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-32 h-8 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="card group hover:shadow-soft-lg transition-all duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${balanceStatus.bgColor}`}>
              <CreditCard className={`w-6 h-6 ${balanceStatus.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Balance</h3>
              <p className="text-sm text-gray-600">Prepaid Energy Meter</p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={`status-indicator ${
            balanceStatus.status === 'critical' ? 'status-danger' :
            balanceStatus.status === 'low' ? 'status-warning' : 'status-active'
          }`}>
            {balanceStatus.status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {balanceStatus.status === 'low' && <TrendingUp className="w-3 h-3 mr-1" />}
            {balanceStatus.status === 'good' && <CheckCircle className="w-3 h-3 mr-1" />}
            {balanceStatus.status.charAt(0).toUpperCase() + balanceStatus.status.slice(1)}
          </div>
        </div>

        {/* Balance Amount */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(balance)}
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {data?.last_updated 
              ? new Date(data.last_updated).toLocaleString() 
              : 'Unknown'
            }
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Balance Level</span>
            <span>{Math.min((balance / 500) * 100, 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                balanceStatus.status === 'critical' ? 'bg-red-500' :
                balanceStatus.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((balance / 500) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRechargeModal(true)}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Recharge</span>
          </button>
          <button className="btn-secondary px-4">
            <DollarSign className="w-4 h-4" />
          </button>
        </div>

        {/* Warning for low balance */}
        {balanceStatus.status !== 'good' && (
          <motion.div 
            className={`mt-4 p-3 rounded-lg ${balanceStatus.bgColor} border ${
              balanceStatus.status === 'critical' ? 'border-red-200' : 'border-yellow-200'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`w-4 h-4 ${balanceStatus.color}`} />
              <span className={`text-sm font-medium ${balanceStatus.color}`}>
                {balanceStatus.status === 'critical' 
                  ? 'Critical: Your balance is very low. Please recharge soon to avoid disconnection.'
                  : 'Warning: Your balance is getting low. Consider recharging soon.'
                }
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recharge Your Account
            </h3>

            {/* Current Balance */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600">Current Balance</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(balance)}
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Quick Amount</div>
              <div className="grid grid-cols-2 gap-2">
                {quickRechargeAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRechargeAmount(amount.toString())}
                    className="p-3 text-center border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="btn-secondary flex-1"
                disabled={isRecharging}
              >
                Cancel
              </button>
              <button
                onClick={handleRecharge}
                disabled={isRecharging || !rechargeAmount}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {isRecharging ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Recharge</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default BalanceCard;
