import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Plus, 
  History, 
  Download,
  Search,
  Filter
} from 'lucide-react';

import BalanceCard from '../components/Dashboard/BalanceCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import { useApi } from '../hooks';
import { balanceApi } from '../services/api';

const Balance = () => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: balanceData, isLoading: balanceLoading } = useApi(balanceApi.getBalance);
  const { data: transactionsData, isLoading: transactionsLoading } = useApi(
    () => balanceApi.getTransactions({ limit: 50 }),
    []
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Balance Management</h1>
          <p className="text-gray-600">Manage your account balance and view transaction history</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button 
            onClick={() => setShowRechargeModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Recharge</span>
          </button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BalanceCard 
            data={balanceData?.data || balanceData}
            isLoading={balanceLoading}
          />
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Recharged</span>
                <span className="font-semibold text-green-600">₹500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Consumed</span>
                <span className="font-semibold text-red-600">₹375.50</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Net Balance</span>
                <span className="font-semibold text-blue-600">₹124.50</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recharge Options</h3>
            <div className="grid grid-cols-2 gap-2">
              {[50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setShowRechargeModal(true)}
                  className="p-3 text-center border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm font-medium"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <button className="btn-secondary flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Enhanced transaction list would go here */}
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Enhanced transaction history coming soon</p>
              <p className="text-sm">View detailed transaction analytics, filters, and export options</p>
            </div>
          </div>
        </div>

        <div>
          <RecentTransactions />
        </div>
      </div>
    </motion.div>
  );
};

export default Balance;
