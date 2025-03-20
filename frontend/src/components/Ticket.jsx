import React from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, QrCode } from 'lucide-react';

const Ticket = ({ ticketData, onPrint, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Ticket Preview */}



        <div className="p-6 space-y-6">

          <div className="text-center border-b pb-6">
            <h2 className="text-2xl font-bold">Parking Ticket</h2>
            <p className="text-gray-500">#{ticketData.ticketNumber}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Entry Time:</span>
              <span className="font-medium">{ticketData.entryTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{ticketData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plate Number:</span>
              <span className="font-medium">{ticketData.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vehicle Type:</span>
              <span className="font-medium">{ticketData.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned Slot:</span>
              <span className="font-medium">{ticketData.parkingSlot}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <QrCode size={120} />
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Please keep this ticket safe</p>
            <p>Required for vehicle exit</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t p-4 flex gap-4">
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
          >
            <Printer size={18} />
            Print Ticket
          </button>
          <button
            onClick={() => onClose()}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-2 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Ticket; 