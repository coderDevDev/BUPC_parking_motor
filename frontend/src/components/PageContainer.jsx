import React from 'react';
import { motion } from 'framer-motion';

const PageContainer = ({ children, title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 md:p-8 ml-20 dark:bg-dark-background min-h-screen pl-16" // Ensure content isn't overlapped by the sidebar
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-dark-text">
            {title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </motion.div>
  );
};

export default PageContainer;
