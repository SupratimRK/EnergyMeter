import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X,
  Clock,
  Battery,
  Zap
} from 'lucide-react';

import { formatDateTime } from '../../utils';

const AlertsPanel = () => {
  // Mock alerts data - in real app, this would come from an API
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Low Balance Warning',
      message: 'Your account balance is below ₹100. Consider recharging soon.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      acknowledged: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance is scheduled for tomorrow at 2:00 AM.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      acknowledged: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Recharge Successful',
      message: 'Your account has been recharged with ₹200.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      acknowledged: true,
    },
    {
      id: 4,
      type: 'error',
      title: 'High Consumption Detected',
      message: 'Power consumption is 15% higher than usual for this time of day.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      acknowledged: false,
    },
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return X;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertTypeIcon = (title) => {
    if (title.toLowerCase().includes('balance')) return Battery;
    if (title.toLowerCase().includes('consumption')) return Zap;
    return Clock;
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

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
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <p className="text-sm text-gray-600">
              {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {unacknowledgedAlerts.length > 0 && (
          <div className="status-indicator status-danger">
            {unacknowledgedAlerts.length}
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <div className="text-gray-500">No alerts at this time</div>
            <div className="text-sm text-gray-400">All systems are running normally</div>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type);
            const TypeIcon = getAlertTypeIcon(alert.title);
            
            return (
              <motion.div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  alert.acknowledged 
                    ? 'bg-gray-50 border-gray-200 opacity-75' 
                    : getAlertColor(alert.type)
                } hover:shadow-sm`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  {/* Alert Icon */}
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <TypeIcon className="w-4 h-4 opacity-60" />
                  </div>
                  
                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </h4>
                      {!alert.acknowledged && (
                        <button className="text-xs text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0">
                          Dismiss
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDateTime(alert.timestamp)}
                      </span>
                      
                      {alert.acknowledged && (
                        <span className="text-xs text-green-600 font-medium">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Alerts
            </button>
            {unacknowledgedAlerts.length > 0 && (
              <button className="text-sm text-gray-600 hover:text-gray-700">
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alert Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {alerts.filter(a => a.type === 'error').length}
            </div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {alerts.filter(a => a.type === 'warning').length}
            </div>
            <div className="text-xs text-gray-600">Warnings</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {alerts.filter(a => a.type === 'info').length}
            </div>
            <div className="text-xs text-gray-600">Info</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {alerts.filter(a => a.type === 'success').length}
            </div>
            <div className="text-xs text-gray-600">Success</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertsPanel;
