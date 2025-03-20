class PrinterService {
  constructor() {
    this.port = null;
    this.writer = null;
    // ESC/POS commands
    this.ESC = 0x1b;
    this.LF = 0x0a;
    this.commands = {
      ESC: 0x1b,
      GS: 0x1d,
      INIT: [0x1b, 0x40],
      CUT: [0x1d, 0x56, 0x41],
      CENTER: [0x1b, 0x61, 0x01],
      LEFT: [0x1b, 0x61, 0x00],
      RIGHT: [0x1b, 0x61, 0x02],
      BOLD_ON: [0x1b, 0x45, 0x01],
      BOLD_OFF: [0x1b, 0x45, 0x00],
      TEXT_SIZE: [0x1d, 0x21, 0x11]
    };
  }

  async connect() {
    try {
      // Request port access
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      console.log('Printer connected successfully');
      return true;
    } catch (error) {
      console.error('Printer connection error:', error);
      throw new Error('Failed to connect to printer');
    }
  }

  async writeCommand(command) {
    const data = new Uint8Array(command);
    await this.writer.write(data);
  }

  async writeText(text) {
    const encoder = new TextEncoder();
    await this.writer.write(encoder.encode(text));
  }

  async printLine(text, align = 'left', bold = false) {
    if (align === 'center') {
      await this.writeCommand(this.commands.CENTER);
    } else if (align === 'right') {
      await this.writeCommand(this.commands.RIGHT);
    } else {
      await this.writeCommand(this.commands.LEFT);
    }

    if (bold) {
      await this.writeCommand(this.commands.BOLD_ON);
    }

    await this.writeText(text);
    await this.writeCommand([this.LF]);

    if (bold) {
      await this.writeCommand(this.commands.BOLD_OFF);
    }
  }

  async printReceipt(entryData) {
    try {
      if (!this.port) {
        await this.connect();
      }

      // Initialize printer
      await this.writeCommand(this.commands.INIT);

      // Set text size
      await this.writeCommand(this.commands.TEXT_SIZE);

      // Print header
      await this.printLine('PARKING RECEIPT', 'center', true);
      await this.printLine('================================', 'center');

      // Print details
      await this.printLine(`Ticket #: ${entryData.ticketNumber}`);
      await this.printLine(`Date: ${new Date().toLocaleString()}`);
      await this.printLine(`Plate Number: ${entryData.plateNumber}`);
      await this.printLine(`Vehicle Type: ${entryData.vehicleType}`);
      await this.printLine(`Entry Time: ${entryData.entryTime}`);
      await this.printLine(`Parking Slot: ${entryData.parkingSlot || 'N/A'}`);
      await this.printLine(`Driver: ${entryData.driverName || 'N/A'}`);
      await this.printLine(`Contact: ${entryData.contactNumber || 'N/A'}`);

      // Print footer
      await this.printLine('================================', 'center');
      await this.printLine('Thank you for parking with us!', 'center', true);
      await this.printLine('================================', 'center');

      // Cut paper
      await this.writeCommand(this.commands.CUT);

      // Close the writer
      this.writer.releaseLock();
      await this.port.close();
      this.port = null;

      return { success: true, message: 'Receipt printed successfully' };
    } catch (error) {
      console.error('Printing error:', error);
      if (this.writer) {
        this.writer.releaseLock();
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      throw new Error(`Failed to print receipt: ${error.message}`);
    }
  }
}

export default new PrinterService();
