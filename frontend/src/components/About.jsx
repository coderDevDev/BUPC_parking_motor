import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Cpu,
  Database,
  Network,
  Shield,
  MonitorSmartphone,
  Cog,
  AlertCircle,
  Terminal,
  Code,
  PackageOpen,
  GitBranch,
  Play
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Camera,
      title: 'Computer Vision Detection',
      description: 'Uses advanced computer vision algorithms to detect and monitor parking spaces in real-time through camera feeds.'
    },

    {
      icon: Network,
      title: 'Real-time Monitoring',
      description: 'Provides instant updates on parking space availability with live video feed and status indicators.'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Stores and manages historical parking data, user information, and system analytics securely.'
    },
    {
      icon: Shield,
      title: 'Security Features',
      description: 'Implements robust security measures to protect user data and system access.'
    },
    {
      icon: MonitorSmartphone,
      title: 'Responsive Interface',
      description: 'Offers a user-friendly dashboard accessible from any device with real-time updates.'
    }
  ];

  const systemSpecs = [
    {
      icon: Cog,
      title: 'Technical Specifications',
      items: [
        'Python-based backend with Flask framework',
        'React.js frontend with real-time updates',
        'OpenCV for image processing',
        'TensorFlow for machine learning models',
        'WebSocket for live data streaming'
      ]
    },
    {
      icon: AlertCircle,
      title: 'System Requirements',
      items: [
        'HD Camera with clear view of parking area',
        'Stable internet connection (min 5Mbps)',
        'Server with min 8GB RAM',
        'Modern web browser for dashboard access',
        'Proper lighting in parking area'
      ]
    }
  ];

  const setupInstructions = [
    {
      icon: GitBranch,
      title: 'Prerequisites',
      items: [
        'Python 3.8 or higher',
        'Node.js and npm',
        'MySQL Database',
        'Git (for cloning the repository)',
        'Conda (recommended for environment management)'
      ]
    },
    {
      icon: Terminal,
      title: 'Backend Setup',
      items: [
        '1. Create conda environment: conda create -n parking-env python=3.8',
        '2. Activate environment: conda activate parking-env',
        '3. Install dependencies: conda install flask flask-cors flask-socketio opencv numpy pyyaml',
        '4. Additional dependencies: pip install python-engineio==4.2.1 python-socketio==5.4.0',
        '5. Install MySQL connector: pip install mysqlclient flask-sqlalchemy',
        '6. Create MySQL database: CREATE DATABASE parking_system',
        '7. Start backend: python -m backend.app'
      ]
    },
    {
      icon: Code,
      title: 'Frontend Setup',
      items: [
        '1. Navigate to frontend directory: cd parking_system/frontend',
        '2. Install dependencies: npm install',
        '3. Start development server: npm run dev',
        '4. Access application at: http://localhost:5173'
      ]
    },
    {
      icon: PackageOpen,
      title: 'System Requirements',
      items: [
        'Operating System: Windows/Linux/MacOS',
        'RAM: 4GB minimum (8GB recommended)',
        'Storage: 1GB free space',
        'Webcam or Video input device',
        'Internet connection for dependencies'
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* System Overview */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          System Overview
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Installation & Setup Guide */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-6"
        >
          Installation & Setup Guide
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {setupInstructions.map((instruction, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              key={index}
              className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <instruction.icon size={24} />
                </div>
                <h3 className="font-semibold">{instruction.title}</h3>
              </div>
              <ul className="space-y-2">
                {instruction.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                    <span className="text-sm font-mono">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Play size={24} />
            </div>
            <h3 className="text-xl font-semibold">Quick Start</h3>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p>After completing the installation steps:</p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>Start the backend server first</li>
              <li>Launch the frontend development server</li>
              <li>Access the application through your web browser</li>
              <li>The system will automatically detect parking spaces</li>
              <li>Begin monitoring and managing parking entries</li>
            </ol>
            <p className="mt-4 text-sm text-gray-500">
              Note: Make sure both backend and frontend servers are running simultaneously for the system to work properly.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Technical Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemSpecs.map((spec, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
            key={index}
            className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <spec.icon size={24} />
              </div>
              <h3 className="font-semibold">{spec.title}</h3>
            </div>
            <ul className="space-y-2">
              {spec.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default About; 