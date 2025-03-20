const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

class PrinterService {
  constructor() {
    this.printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: 'printer:XP-80C', // Printer interface
      characterSet: 'PC437_USA', // Printer character set
      removeSpecialCharacters: false,
      lineCharacter: '=',
      options: {
        timeout: 5000
      }
    });
  }

  async printReceipt(data) {
    try {
      let isConnected = await this.printer.isPrinterConnected();
      if (!isConnected) {
        throw new Error('Printer not connected');
      }

      // Set alignment to center
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.setTextSize(1, 1);
      this.printer.println('PARKING RECEIPT');
      this.printer.bold(false);
      this.printer.drawLine();

      // Reset alignment to left for details
      this.printer.alignLeft();
      this.printer.println(`Ticket #: ${data.ticketNumber}`);
      this.printer.println(`Date: ${data.date}`);
      this.printer.println(`Time: ${data.entryTime}`);
      this.printer.println(`Plate Number: ${data.plateNumber}`);
      this.printer.println(`Vehicle Type: ${data.vehicleType}`);
      this.printer.println(`Parking Slot: ${data.parkingSlot}`);
      this.printer.println(`Driver: ${data.driverName || 'N/A'}`);
      this.printer.println(`Contact: ${data.contactNumber || 'N/A'}`);

      // Footer
      this.printer.drawLine();
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.println('Thank you for parking with us!');
      this.printer.bold(false);
      this.printer.drawLine();

      // Cut paper
      this.printer.cut();

      await this.printer.execute();
      return { success: true, message: 'Receipt printed successfully' };
    } catch (error) {
      console.error('Printer error:', error);
      throw error;
    }
  }
}

module.exports = new PrinterService();
