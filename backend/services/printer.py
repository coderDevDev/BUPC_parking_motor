import win32print
import win32ui
from datetime import datetime

class PrinterService:
    def __init__(self):
        # Get the default printer name
        self.printer_name = win32print.GetDefaultPrinter()
        # ESC/POS Commands
        self.ESC = b'\x1B'
        self.GS = b'\x1D'
        self.INIT = self.ESC + b'@'          # Initialize printer
        self.CUT = self.GS + b'V\x41'        # Full cut
        self.FEED = self.ESC + b'd'          # Feed n lines
        self.CENTER = self.ESC + b'\x61\x01' # Center alignment
        self.LEFT = self.ESC + b'\x61\x00'   # Left alignment
        self.BOLD_ON = self.ESC + b'\x45\x01'
        self.BOLD_OFF = self.ESC + b'\x45\x00'
        self.DOUBLE_ON = self.GS + b'!\x11'  # Double height & width
        self.DOUBLE_OFF = self.GS + b'!\x00' # Normal size
        self.LINESPACE_TIGHT = self.ESC + b'3\x12'  # Set line spacing tight
        self.LINESPACE_DEFAULT = self.ESC + b'2'    # Default line spacing
        self.PAGE_MODE = self.ESC + b'L'     # Enter page mode
        self.SET_AREA = self.ESC + b'W'      # Set print area

    def connect_printer(self):
        try:
            # Test printer connection
            printer = win32print.OpenPrinter(self.printer_name)
            win32print.ClosePrinter(printer)
            return True
        except Exception as e:
            print(f"Failed to connect to printer: {str(e)}")
            raise

    def print_receipt(self, data):
        try:
            # Format receipt content with ESC/POS commands and proper spacing
            receipt_content = (
                self.INIT +                    # Initialize printer
                self.LINESPACE_TIGHT +         # Set tight line spacing
                b'\n' +                        # Initial spacing
                self.CENTER +                  # Center align
                self.DOUBLE_ON +               # Double size
                b"PARKING RECEIPT\n\n" +       # Add extra line after title
                self.DOUBLE_OFF +              # Normal size
                b"================================\n" +
                b'\n' +                        # Extra spacing
                self.LEFT +                    # Left align
                b'  ' + f"Ticket #: {data['ticketNumber']}\n".encode() +
                b'\n' +                        # Extra spacing
                b'  ' + f"Date: {data['date']}\n".encode() +
                b'  ' + f"Time: {data['entryTime']}\n".encode() +
                b'\n' +                        # Extra spacing
                b'  ' + f"Plate Number: {data['plateNumber']}\n".encode() +
                b'  ' + f"Vehicle Type: {data['vehicleType']}\n".encode() +
                b'  ' + f"Parking Slot: {data['parkingSlot']}\n".encode() +
                b'\n' +                        # Extra spacing
                b'  ' + f"Driver: {data.get('driverName', 'N/A')}\n".encode() +
                b'  ' + f"Contact: {data.get('contactNumber', 'N/A')}\n".encode() +
                b'\n' +                        # Extra spacing
                self.CENTER +                  # Center align
                b"================================\n" +
                b'\n' +                        # Extra spacing
                self.BOLD_ON +                 # Bold text
                b"Thank you for parking with us!\n" +
                self.BOLD_OFF +                # Normal text
                b"================================\n" +
                self.LINESPACE_DEFAULT +       # Reset line spacing
                self.FEED + b'\x05' +          # Feed 5 lines
                self.CUT                       # Cut paper
            )

            # Open printer
            hprinter = win32print.OpenPrinter(self.printer_name)

            try:
                # Start print job
                hJob = win32print.StartDocPrinter(hprinter, 1, ("Parking Receipt", None, "RAW"))
                try:
                    win32print.StartPagePrinter(hprinter)
                    win32print.WritePrinter(hprinter, receipt_content)
                    win32print.EndPagePrinter(hprinter)
                finally:
                    win32print.EndDocPrinter(hprinter)
            finally:
                win32print.ClosePrinter(hprinter)

            return {"success": True, "message": "Receipt printed successfully"}

        except Exception as e:
            print(f"Printing error: {str(e)}")
            return {"success": False, "message": f"Failed to print receipt: {str(e)}"} 