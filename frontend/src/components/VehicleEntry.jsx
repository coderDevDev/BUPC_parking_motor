import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  Clock,
  Calendar,
  User,
  Tag,
  AlertCircle,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  ParkingSquare
} from 'lucide-react';
import Ticket from './Ticket';

const VehicleEntry = ({ parkingStats }) => {

  console.log({ parkingStats })
  const [vehicleData, setVehicleData] = useState({
    plateNumber: '',
    vehicleType: 'motorcycle',
    entryTime: '',
    date: '',
    driverName: '',
    contactNumber: ''
  });

  const [entries, setEntries] = useState([]);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update available slots when parkingStats changes
  useEffect(() => {
    // Get all occupied slots from current entries
    const occupiedSlots = new Set(entries.map(entry => entry.parkingSlot));

    // Generate array of all slots (1 to total)
    const allSlots = Array.from({ length: parkingStats.total }, (_, i) => i + 1);

    // Filter out occupied slots to get available ones
    const availableSlotNumbers = allSlots.filter(slot => !occupiedSlots.has(slot));

    setAvailableSlots(availableSlotNumbers);
  }, [parkingStats, entries]);

  // Fetch entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/vehicle-entries');
      const data = await response.json();
      setEntries(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch entries');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parkingStats.available === 0) {
      alert('No parking slots available!');
      return;
    }

    const ticketNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
    const assignedSlot = availableSlots[0];
    const currentDate = new Date();

    const newTicket = {
      ticketNumber,
      ...vehicleData,
      parkingSlot: assignedSlot,
      entryTime: currentDate.toLocaleTimeString(),
      date: currentDate.toLocaleDateString(),
    };

    try {
      const response = await fetch('/api/vehicle-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      const data = await response.json();
      setEntries([data.entry, ...entries]);
      setTicketData(newTicket);
      setShowTicket(true);

      // Reset form
      setVehicleData({
        plateNumber: '',
        vehicleType: 'motorcycle',
        entryTime: '',
        date: '',
        driverName: '',
        contactNumber: ''
      });
    } catch (err) {
      alert('Failed to create entry: ' + err.message);
    }
  };

  const handleDelete = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicle-entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      setEntries(entries.filter(entry => entry.id !== entryId));
    } catch (err) {
      alert('Failed to delete entry: ' + err.message);
    }
  };

  const handleStatusUpdate = async (entryId, newStatus) => {
    try {
      const response = await fetch(`/api/vehicle-entries/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      setEntries(entries.map(entry =>
        entry.id === entryId
          ? { ...entry, status: newStatus }
          : entry
      ));
    } catch (err) {
      alert('Failed to update entry: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrintTicket = () => {
    // Implementation for thermal printer
    // You'll need to use a library like node-thermal-printer
    // or communicate with a backend service that handles printing
    console.log('Printing ticket:', ticketData);
  };

  return (
    <div className="space-y-8">
      {/* Parking Status Alert */}
      {parkingStats.available === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" />
            <p className="text-red-700">Parking lot is full! No slots available.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="text-green-600">
              <ParkingSquare size={20} />
            </div>
            <div>
              <p className="text-green-700">
                {parkingStats.available} parking {parkingStats.available === 1 ? 'slot' : 'slots'} available
              </p>
              <p className="text-sm text-green-600">
                Total: {parkingStats.total} | Occupied: {parkingStats.occupied}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Entry Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Vehicle Entry Details</h2>
              <div className="text-sm text-gray-500">
                Next Available Slot: {availableSlots[0] || 'None'}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plate Number
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="plateNumber"
                      value={vehicleData.plateNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
                      placeholder="Enter plate number"
                      required
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Type
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      name="vehicleType"
                      value={vehicleData.vehicleType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
                      required
                    >
                      {/* <option value="car">Car</option> */}
                      <option value="motorcycle">Motorcycle</option>
                      {/* <option value="truck">Truck</option> */}
                    </select>
                  </div>
                </div>

                {/* Entry Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entry Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="time"
                      name="entryTime"
                      value={vehicleData.entryTime}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      name="date"
                      value={vehicleData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Driver Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="driverName"
                      value={vehicleData.driverName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
                      placeholder="Enter driver name"
                      required
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Number
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={vehicleData.contactNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Guidelines with Slot Info */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-6"
          >
            {/* Slot Status */}
            <div>
              <h3 className="font-semibold mb-4">Parking Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Slots:</span>
                  <span className="font-medium">{parkingStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium text-orange-600">{parkingStats.occupied}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">{parkingStats.available}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertCircle className="text-primary" size={24} />
                </div>
                <h2 className="text-lg font-semibold">Entry Guidelines</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                  <span>Ensure all fields are filled accurately</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                  <span>Verify plate number format</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                  <span>Check vehicle type selection</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                  <span>Confirm contact information</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Entries Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Recent Entries</h2>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search entries..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-dark-card dark:border-gray-700"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              Filter
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Plate Number</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Vehicle Type</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Entry Time</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Driver</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Tag size={16} className="text-gray-400" />
                      <span className="font-medium">{entry.plateNumber}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{entry.vehicleType}</td>
                  <td className="py-4 px-4">{entry.entryTime}</td>
                  <td className="py-4 px-4">{entry.date}</td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">{entry.driverName}</div>
                      <div className="text-sm text-gray-500">{entry.contactNumber}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${entry.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(entry.id, entry.status === 'Active' ? 'Completed' : 'Active')}
                        className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800"
                      >
                        <Edit size={16} className="text-gray-500 hover:text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800"
                      >
                        <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Showing 1 to {entries.length} of {entries.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ticket Modal */}
      {showTicket && ticketData && (
        <Ticket
          ticketData={ticketData}
          onPrint={handlePrintTicket}
          onClose={() => setShowTicket(false)}
        />
      )}
    </div>
  );
};

export default VehicleEntry; 