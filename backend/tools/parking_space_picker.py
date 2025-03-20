import cv2
import numpy as np
import yaml
import os

#  C:\DexDev\my_Small_projects\2025\working_parking_lot\parking_system> python -m backend.tools.parking_space_picker
class ParkingSpacePicker:
    def __init__(self, image_path):
        self.image = cv2.imread(image_path)
        if self.image is None:
            raise Exception("Could not load image")
            
        self.points = []
        self.current_points = []
        self.parking_spots = []
        self.spot_id = 0
        
        # Create window and set mouse callback
        cv2.namedWindow('Parking Space Picker')
        cv2.setMouseCallback('Parking Space Picker', self.mouse_callback)
        
    def mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            self.current_points.append([x, y])
            
            # Draw point
            cv2.circle(self.image, (x, y), 3, (0, 255, 0), -1)
            
            # If we have 4 points, create a parking spot
            if len(self.current_points) == 4:
                # Ensure points are in clockwise order starting from top-left
                rect = np.array(self.current_points, dtype=np.float32)
                # Sort points by Y coordinate first (top to bottom)
                sorted_idx = np.argsort(rect[:, 1])
                top_points = rect[sorted_idx[:2]]
                bottom_points = rect[sorted_idx[2:]]
                
                # Sort top points by X coordinate (left to right)
                top_sorted_idx = np.argsort(top_points[:, 0])
                top_left = top_points[top_sorted_idx[0]]
                top_right = top_points[top_sorted_idx[1]]
                
                # Sort bottom points by X coordinate (left to right)
                bottom_sorted_idx = np.argsort(bottom_points[:, 0])
                bottom_left = bottom_points[bottom_sorted_idx[0]]
                bottom_right = bottom_points[bottom_sorted_idx[1]]
                
                # Store points in clockwise order: top-left, top-right, bottom-right, bottom-left
                ordered_points = [
                    top_left.tolist(),
                    top_right.tolist(),
                    bottom_right.tolist(),
                    bottom_left.tolist()
                ]
                
                spot = {
                    "id": self.spot_id,
                    "coordinates": ordered_points
                }
                self.parking_spots.append(spot)
                
                # Draw the parking spot
                points = np.array(self.current_points, np.int32)
                cv2.polylines(self.image, [points], True, (0, 255, 0), 2)
                
                # Add spot number
                center = np.mean(points, axis=0, dtype=np.int32)
                cv2.putText(
                    self.image,
                    str(self.spot_id),  # Changed to match 0-based indexing
                    tuple(center),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    2
                )
                
                # Reset for next parking spot
                self.current_points = []
                self.spot_id += 1
            
            cv2.imshow('Parking Space Picker', self.image)

    def run(self):
        print("Instructions:")
        print("1. Click 4 points to define each parking space (clockwise)")
        print("2. Press 'S' to save the coordinates")
        print("3. Press 'Q' to quit without saving")
        print("4. Press 'Z' to undo last point")
        print("5. Press 'R' to reset all")
        
        while True:
            cv2.imshow('Parking Space Picker', self.image)
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('s'):
                # Save coordinates to YAML file
                if self.parking_spots:
                    self.save_coordinates()
                    print(f"Saved {len(self.parking_spots)} parking spots")
                break
            
            elif key == ord('q'):
                break
                
            elif key == ord('z'):
                # Undo last point
                if self.current_points:
                    self.current_points.pop()
                    # Redraw image
                    self.redraw()
                    
            elif key == ord('r'):
                # Reset everything
                self.image = cv2.imread(image_path)
                self.current_points = []
                self.parking_spots = []
                self.spot_id = 0
                cv2.imshow('Parking Space Picker', self.image)
        
        cv2.destroyAllWindows()

    def redraw(self):
        # Redraw image and all parking spots
        self.image = cv2.imread(image_path)
        
        # Redraw all completed parking spots
        for spot in self.parking_spots:
            points = np.array(spot['coordinates'], np.int32)  # Updated to match new format
            cv2.polylines(self.image, [points], True, (0, 255, 0), 2)
            center = np.mean(points, axis=0, dtype=np.int32)
            cv2.putText(
                self.image,
                str(spot['id']),  # Changed to match 0-based indexing
                tuple(center),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                2
            )
        
        # Redraw current points
        for x, y in self.current_points:
            cv2.circle(self.image, (x, y), 3, (0, 255, 0), -1)
            
        cv2.imshow('Parking Space Picker', self.image)

    def save_coordinates(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        save_path = os.path.join(base_dir, 'data', 'coordinates_1.yml')
        
        # Get original frame dimensions
        height, width = self.image.shape[:2]
        
        # Save both coordinates and frame dimensions
        data = {
            'frame_dimensions': {
                'width': width,
                'height': height
            },
            'spots': self.parking_spots
        }
        
        with open(save_path, 'w') as f:
            yaml.dump(data, f, default_flow_style=None)
        print(f"Coordinates saved to {save_path}")

        # Generate verification image
        self.generate_verification_image(self.parking_spots)

    def generate_verification_image(self, spots):
        """Generate an image showing the saved coordinates for verification"""
        # Create a copy of the original image
        verification_img = self.image.copy()
        
        # Draw all spots with their IDs
        for spot in spots:
            # Convert coordinates to numpy array
            points = np.array(spot['coordinates'], np.int32)
            
            # Draw the polygon
            cv2.polylines(verification_img, [points], True, (0, 255, 0), 2)
            
            # Calculate center for text
            center = np.mean(points, axis=0, dtype=np.int32)
            
            # Draw spot ID
            cv2.putText(
                verification_img,
                f"Spot {spot['id']}",
                tuple(center),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            # Draw corner numbers (0,1,2,3) to show order
            for i, coord in enumerate(spot['coordinates']):
                # Convert coordinates to integers and tuple
                x, y = int(coord[0]), int(coord[1])
                cv2.circle(verification_img, (x, y), 4, (0, 0, 255), -1)
                cv2.putText(
                    verification_img,
                    str(i),
                    (x + 5, y + 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 0, 255),
                    2
                )

        # Save verification image
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        verify_path = os.path.join(base_dir, 'data', 'parking_spots_verification.jpg')
        cv2.imwrite(verify_path, verification_img)
        
        # Show the verification image
        cv2.imshow('Verification', verification_img)
        cv2.waitKey(0)
        cv2.destroyWindow('Verification')
        
        print(f"\nVerification image saved to: {verify_path}")
        print("\nCoordinates format in coordinates_1.yml:")
        for spot in spots:
            print(f"\nSpot {spot['id']}:")
            print("Corner points (clockwise):")
            for i, (x, y) in enumerate(spot['coordinates']):
                print(f"  Point {i}: ({x}, {y})")

if __name__ == "__main__":
    # Get first frame from video/RTSP stream
    video_source = "rtsp://MirandaFam@123:MirandaFam@123@192.168.1.4:554/stream1"
    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print("Error: Could not open video source")
        exit()
    
    print("\nInstructions for marking parking spots:")
    print("1. Click points in CLOCKWISE order:")
    print("   - First point (0): Top-left")
    print("   - Second point (1): Top-right")
    print("   - Third point (2): Bottom-right")
    print("   - Fourth point (3): Bottom-left")
    print("\n2. Each spot should be marked consistently")
    print("3. The verification image will show point numbers")
    print("4. Check the order in the saved image\n")
    
    # Read first frame
    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame")
        exit()
    
    # Save frame as image
    image_path = "parking_lot_frame.jpg"
    cv2.imwrite(image_path, frame)
    cap.release()
    
    # Create and run the parking space picker
    picker = ParkingSpacePicker(image_path)
    picker.run() 