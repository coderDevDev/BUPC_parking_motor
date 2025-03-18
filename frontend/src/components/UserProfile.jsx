import React, { useState } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfile = ({ isExpanded }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        // onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex flex-col items-center gap-3 p-2 w-full hover:bg-primary-dark/50 rounded-lg transition-colors
          ${isExpanded ? 'px-4' : 'justify-center'}`}
      >
        {/* Logo */}
        <div className="w-16 h-16 rounded-full bg-primary-dark flex items-center justify-center flex-shrink-0">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKrurZwJOzNqy_VObWsmiPOHgih6rK7IVTyw&s" alt="User" className="w-16 h-16 rounded-full" />
        </div>

        {/* Text Below Logo */}
        {isExpanded && (
          <div className="text-center">
            <p className="text-lg font-medium text-white">Parking Slot Monitoring System</p>
            <p className="text-xs text-white/70">Admin</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute ${isExpanded ? 'w-[calc(100%-1rem)]' : 'left-full ml-2'} 
              bg-white rounded-lg shadow-lg py-2 z-50 min-w-[200px]`}
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">John Dosse</p>
              <p className="text-xs text-gray-500">john.doe@example.com</p>
            </div>
            <div className="py-1">
              <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <User size={16} />
                Profile
              </button>
              <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <Settings size={16} />
                Settings
              </button>
              <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
