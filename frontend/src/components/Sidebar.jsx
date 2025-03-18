import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutDashboard, FileText, Users, Info, Menu, X, Search, Bell, Sun, Moon, Car } from 'lucide-react';
import UserProfile from './UserProfile';

const Sidebar = ({ activePage, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Car, label: 'Vehicle Entry', id: 'vehicle-entry' },
    // { icon: FileText, label: 'Reports', id: 'reports' },
    { icon: Info, label: 'About', id: 'about' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary md:hidden hover:bg-primary-dark text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {(isOpen || window.innerWidth > 768) && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            className={`fixed left-0 top-0 h-full bg-primary text-white 
              ${isExpanded ? 'w-64' : 'w-20'} md:w-64 flex flex-col 
              transition-all duration-300 z-40`}
          >
            <div className="p-4">
              <UserProfile isExpanded={isExpanded} />
            </div>

            {/* <div className={`px-4 mb-4 ${!isExpanded && 'hidden md:block'}`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-primary-dark/30 text-white placeholder-white/50 rounded-lg py-2
                    ${isExpanded ? 'pl-10 pr-4' : 'p-2'}`}
                />
                <Search size={16} className={`absolute ${isExpanded ? 'left-3' : 'left-1/2 -translate-x-1/2'} top-1/2 -translate-y-1/2 text-white/70`} />
              </div>
            </div> */}

            <div className="flex-1 px-2">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-4 rounded-lg
                      hover:bg-primary-dark transition-colors
                      ${activePage === item.id ? 'bg-primary-dark' : ''}`}
                  >
                    <item.icon size={20} />
                    <span className={`text-sm ${!isExpanded && 'hidden md:block'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-primary-dark/30">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-primary-dark/30 rounded-lg"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="p-2 hover:bg-primary-dark/30 rounded-lg relative">
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`p-2 flex flex-col items-center justify-center rounded-lg
                ${activePage === item.id ? 'text-primary bg-primary-light' : 'text-gray-600'}`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
