import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import PageContainer from './components/PageContainer';
import ParkingLot from './components/ParkingLot';
import StatusPanel from './components/StatusPanel';
import About from './components/About';
import VehicleEntry from './components/VehicleEntry';

function App() {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0
  });
  const [activePage, setActivePage] = useState('home');

  const handleStatusUpdate = newStats => {
    setStats(newStats);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <PageContainer
            title="Hi, Admin!"
            subtitle="Here's what's happening in your parking lots"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content - Parking Lot */}
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm p-6">
                  <ParkingLot onStatusUpdate={handleStatusUpdate} />
                </div>
              </div>

              {/* Side Panel - Stats */}
              <div className="lg:col-span-4">
                <StatusPanel {...stats} />
              </div>
            </div>
          </PageContainer>
        );
      case 'dashboard':
        return (
          <PageContainer
            title="Dashboard"
            subtitle="Detailed analytics and statistics"
          >
            {/* Dashboard content */}
          </PageContainer>
        );
      case 'vehicle-entry':
        return (
          <PageContainer
            title="Vehicle Entry"
            subtitle="Record new vehicle entries and manage parking details"
          >
            <VehicleEntry parkingStats={stats} />
          </PageContainer>
        );
      case 'about':
        return (
          <PageContainer
            title="About the System"
            subtitle="Learn how our parking monitoring system works"
          >
            <About />
          </PageContainer>
        );

      // Add other pages...
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-background dark:bg-dark-background">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="transition-all duration-300">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App; 