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
  AlertCircle
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

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <section className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          The Parking Slot Monitoring System is an intelligent solution that combines computer vision,
          artificial intelligence, and real-time monitoring to efficiently manage parking spaces.
          The system provides accurate occupancy detection, instant status updates, and comprehensive
          analytics to optimize parking space utilization.
        </p>
      </section>

      {/* Key Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <feature.icon size={24} />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
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