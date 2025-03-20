import cv2
import numpy as np
import yaml
import os

def load_coordinates():
    """Load coordinates from YAML file"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    yaml_path = os.path.join(base_dir, 'data', 'coordinates_1.yml')
    
    with open(yaml_path, 'r') as f:
        return yaml.safe_load(f)

def draw_parking_spots(image, spots):
    """Draw parking spots with coordinates on image"""
    # Create a copy for drawing
    vis_image = image.copy()
    
    for spot in spots:
        # Get coordinates
        points = np.array(spot['coordinates'], np.int32)
        
        # Draw polygon
        cv2.polylines(vis_image, [points], True, (0, 255, 0), 2)
        
        # Calculate center
        center = np.mean(points, axis=0, dtype=np.int32)
        
        # Draw spot ID
        cv2.putText(
            vis_image,
            f"Spot {spot['id']}",
            tuple(center),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )
        
        # Draw corner points and their coordinates
        for i, (x, y) in enumerate(spot['coordinates']):
            # Draw point
            cv2.circle(vis_image, (x, y), 4, (0, 0, 255), -1)
            
            # Draw point number
            cv2.putText(
                vis_image,
                f"{i}",
                (x + 5, y + 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 255),
                2
            )
            
            # Draw coordinates
            cv2.putText(
                vis_image,
                f"({x},{y})",
                (x + 15, y + 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.4,
                (255, 255, 0),
                1
            )
    
    return vis_image

def main():
    # Get video frame
    video_source = "rtsp://MirandaFam@123:MirandaFam@123@192.168.1.4:554/stream1"
    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print("Error: Could not open video source")
        return
    
    # Read frame
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("Error: Could not read frame")
        return
    
    # Load coordinates
    try:
        spots = load_coordinates()
        print(f"Loaded {len(spots)} parking spots")
        
        # Draw spots on frame
        result = draw_parking_spots(frame, spots)
        
        # Save visualization
        output_path = os.path.join(os.path.dirname(__file__), 'parking_spots_with_coordinates.jpg')
        cv2.imwrite(output_path, result)
        
        # Display image
        cv2.imshow('Parking Spots with Coordinates', result)
        print("\nVisualization saved to:", output_path)
        print("\nPress any key to close the window")
        
        # Print coordinates
        print("\nParking Spot Coordinates:")
        for spot in spots:
            print(f"\nSpot {spot['id']}:")
            for i, (x, y) in enumerate(spot['coordinates']):
                print(f"  Point {i}: ({x}, {y})")
        
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 