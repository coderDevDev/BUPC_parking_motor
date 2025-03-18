import React from 'react';
import {
  Car,
  Users,
  ParkingSquare,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatusPanel = ({ total, available, occupied }) => {
  const stats = [
    {
      label: 'Total Parking Slots',
      value: total || 0,
      icon: ParkingSquare,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      trend: '+2.5%',
      trendUp: true,
      subtitle: 'Total capacity of parking spaces'
    },
    {
      label: 'Currently Occupied',
      value: occupied || 0,
      icon: Car,
      color: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-600',
      trend: '+5.2%',
      trendUp: true,
      subtitle: 'Vehicles currently parked'
    },
    {
      label: 'Available Spaces',
      value: available || 0,
      icon: ParkingSquare,
      color: 'bg-gradient-to-br from-green-50 to-green-100',
      iconColor: 'text-green-600',
      trend: '-8.1%',
      trendUp: false,
      subtitle: 'Free parking spaces'
    },
    // {
    //   label: 'Average Duration',
    //   value: '2.5h',
    //   icon: Clock,
    //   color: 'bg-gradient-to-br from-purple-50 to-purple-100',
    //   iconColor: 'text-purple-600',
    //   trend: '+1.2%',
    //   trendUp: true,
    //   subtitle: 'Average parking duration'
    // },
    // {
    //   label: 'Peak Occupancy',
    //   value: '85%',
    //   icon: Activity,
    //   color: 'bg-gradient-to-br from-pink-50 to-pink-100',
    //   iconColor: 'text-pink-600',
    //   trend: '+3.7%',
    //   trendUp: true,
    //   subtitle: 'Highest daily occupancy'
    // },
    // {
    //   label: 'Registered Users',
    //   value: '156',
    //   icon: Users,
    //   color: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    //   iconColor: 'text-indigo-600',
    //   trend: '+12.4%',
    //   trendUp: true,
    //   subtitle: 'Total registered users'
    // }
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          key={index}
          className={`${stat.color} rounded-2xl p-5 shadow-sm hover:shadow-md 
            transition-all duration-300 border border-white/50 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/80 ${stat.iconColor} shadow-sm`}>
                <stat.icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                  {/* <div className={`flex items-center text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                    <TrendingUp size={12} className={!stat.trendUp ? 'rotate-180' : ''} />
                    <span>{stat.trend}</span>
                  </div> */}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                  <span className="text-xs text-gray-500">{stat.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatusPanel; 