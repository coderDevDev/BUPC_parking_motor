import cv2
import numpy as np
import logging
from .drawing_utils import draw_contours
from .colors import COLOR_GREEN, COLOR_WHITE, COLOR_BLUE, COLOR_RED
import yaml
import os


class MotionDetector:
    LAPLACIAN = 1.4
    DETECT_DELAY = 1

    def __init__(self, video_source, coordinates_data, start_frame):
        self.video_source = video_source
        self.start_frame = start_frame
        
        # Extract spots and original dimensions from coordinates data
        self.original_dimensions = coordinates_data['frame_dimensions']
        self.coordinates_data = coordinates_data['spots']
        
        # Initialize statuses
        self.total_spaces = len(self.coordinates_data)
        self.statuses = [False] * self.total_spaces
        self.free_spaces = self.total_spaces
        self.occupied_spaces = 0

        # Create background subtractor with optimized parameters
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
            history=500,
            varThreshold=16,
            detectShadows=True
        )

    def _coordinates(self, p):
        """Convert coordinates from YAML format to contour format"""
        return np.array(p["coordinates"], np.int32).reshape((-1, 1, 2))

    def _check_parking_space(self, frame, contour):
        """Check if a parking space is occupied by a motorcycle"""
        # Create mask for the parking space
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        cv2.drawContours(mask, [contour], -1, (255), -1)
        
        # Get ROI
        x, y, w, h = cv2.boundingRect(contour)
        roi = frame[y:y+h, x:x+w]
        roi_mask = mask[y:y+h, x:x+w]
        
        # Apply mask to ROI
        masked_roi = cv2.bitwise_and(roi, roi, mask=roi_mask)
        
        # Convert to grayscale
        gray_roi = cv2.cvtColor(masked_roi, cv2.COLOR_BGR2GRAY)
        
        # Apply background subtraction
        fg_mask = self.bg_subtractor.apply(gray_roi)
        
        # Calculate motion metrics
        pixels = cv2.countNonZero(fg_mask)
        area = cv2.contourArea(contour)
        occupation = pixels / area if area > 0 else 0

        # If there's significant motion/occupation
        if occupation > 0.15:
            # Motorcycle-specific checks
            
            # 1. Edge Detection (motorcycles have strong edges)
            edges = cv2.Canny(gray_roi, 50, 150)
            edge_density = cv2.countNonZero(edges) / (w * h)
            
            # 2. Shape Analysis
            aspect_ratio = w / h if h > 0 else 0
            motorcycle_ratio = 0.6  # Typical motorcycle aspect ratio
            ratio_tolerance = 0.2
            
            # 3. Contour Analysis
            contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                _, _, cont_w, cont_h = cv2.boundingRect(largest_contour)
                contour_ratio = cont_w / cont_h if cont_h > 0 else 0
            else:
                contour_ratio = 0
            
            # Combined decision for motorcycle detection
            is_motorcycle = (
                edge_density > 0.1 and  # Strong edges present
                abs(aspect_ratio - motorcycle_ratio) < ratio_tolerance and  # Right shape
                abs(contour_ratio - motorcycle_ratio) < ratio_tolerance and  # Motion shape matches
                occupation > 0.2  # Sufficient occupation
            )
            
            return not is_motorcycle  # False if motorcycle detected
            
        return True  # Space is available

    def process_frame(self, frame):
        """Process a frame and update parking space statuses"""
        if frame is None:
            return []

        # Update statuses
        self.statuses = []
        occupied_count = 0
        
        for p in self.coordinates_data:
            coordinates = self._coordinates(p)
            status = self._check_parking_space(frame, coordinates)
            self.statuses.append(status)
            if not status:  # If space is occupied by motorcycle
                occupied_count += 1

        # Update counts
        self.occupied_spaces = occupied_count
        self.free_spaces = self.total_spaces - occupied_count

        # Ensure counts are valid
        assert self.occupied_spaces >= 0, "Occupied spaces cannot be negative"
        assert self.free_spaces >= 0, "Free spaces cannot be negative"
        assert self.occupied_spaces + self.free_spaces == self.total_spaces, "Total spaces mismatch"
        
        return self.statuses

    def detect_motion(self):
        capture = cv2.VideoCapture(self.video_source)
        capture.set(cv2.CAP_PROP_POS_FRAMES, self.start_frame)
        fps = capture.get(cv2.CAP_PROP_FPS)
        logging.debug("FPS: %s", fps)

        coordinates_data = self.coordinates_data
        logging.debug("coordinates data: %s", coordinates_data)

        for p in coordinates_data:
            coordinates = self._coordinates(p)
            logging.debug("coordinates: %s", coordinates)

            rect = cv2.boundingRect(coordinates)
            logging.debug("rect: %s", rect)

            new_coordinates = coordinates.copy()
            new_coordinates[:, 0] = coordinates[:, 0] - rect[0]
            new_coordinates[:, 1] = coordinates[:, 1] - rect[1]
            logging.debug("new_coordinates: %s", new_coordinates)

            self.contours.append(coordinates)
            self.bounds.append(rect)

            mask = cv2.drawContours(
                np.zeros((rect[3], rect[2]), dtype=np.uint8),
                [new_coordinates],
                contourIdx=-1,
                color=255,
                thickness=-1,
                lineType=cv2.LINE_8)

            mask = mask == 255
            self.mask.append(mask)
            logging.debug("mask: %s", self.mask)

        statuses = [False] * len(coordinates_data)
        times = [None] * len(coordinates_data)

        while capture.isOpened():
            result, frame = capture.read()
            if frame is None:
                break

            if not result:
                raise CaptureReadError("Error reading video capture on frame %s" % str(frame))

            blurred = cv2.GaussianBlur(frame.copy(), (5, 5), 3)
            grayed = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
            new_frame = frame.copy()
            
            position_in_seconds = capture.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

            # Process each parking space
            for index, c in enumerate(coordinates_data):
                status = self.__apply(grayed, index, c)

                if times[index] is not None and self.same_status(statuses, index, status):
                    times[index] = None
                    continue

                if times[index] is not None and self.status_changed(statuses, index, status):
                    if position_in_seconds - times[index] >= MotionDetector.DETECT_DELAY:
                        statuses[index] = status
                        times[index] = None
                    continue

                if times[index] is None and self.status_changed(statuses, index, status):
                    times[index] = position_in_seconds

            # Draw parking space markers
            for index, p in enumerate(coordinates_data):
                coordinates = self._coordinates(p)
                color = COLOR_GREEN if statuses[index] else COLOR_RED
                draw_contours(new_frame, coordinates, str(p["id"] + 1), COLOR_WHITE, color)

            # Calculate statistics
            total_spaces = len(coordinates_data)
            free_spaces = sum(1 for status in statuses if status)
            occupied_spaces = total_spaces - free_spaces

            # Create info panel
            self.__draw_info_panel(new_frame, total_spaces, free_spaces, occupied_spaces)
            
            # Draw free space locations
            self.__draw_free_space_locations(new_frame, statuses, coordinates_data)

            cv2.imshow(str(self.video_source), new_frame)
            k = cv2.waitKey(int(700 / fps))
            if k == ord("q"):
                break
        
        capture.release()
        cv2.destroyAllWindows()

    def __draw_info_panel(self, frame, total, free, occupied):
        # Create semi-transparent overlay for info panel
        overlay = frame.copy()
        panel_height = 120
        cv2.rectangle(overlay, (10, 10), (250, panel_height), (0, 0, 0), -1)
        
        # Add text
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(overlay, f'Total Spaces: {total}', (20, 35), font, 0.6, COLOR_WHITE, 2)
        cv2.putText(overlay, f'Free Spaces: {free}', (20, 65), font, 0.6, COLOR_GREEN, 2)
        cv2.putText(overlay, f'Occupied Spaces: {occupied}', (20, 95), font, 0.6, COLOR_RED, 2)
        
        # Apply overlay with transparency
        alpha = 0.7
        frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)

    def __draw_free_space_locations(self, frame, statuses, coordinates_data):
        free_spaces = []
        for idx, status in enumerate(statuses):
            if status:  # If space is free
                space_id = coordinates_data[idx]["id"] + 1
                free_spaces.append(str(space_id))

        if free_spaces:
            message = "Free Spaces at: " + ", ".join(free_spaces)
            # Draw at bottom of frame
            font = cv2.FONT_HERSHEY_SIMPLEX
            y_position = frame.shape[0] - 30  # 30 pixels from bottom
            cv2.putText(frame, message, (10, y_position), font, 0.6, COLOR_WHITE, 2)

    def __apply(self, grayed, index, p):
        rect = self.bounds[index]
        roi_gray = grayed[rect[1]:(rect[1] + rect[3]), rect[0]:(rect[0] + rect[2])]
        laplacian = cv2.Laplacian(roi_gray, cv2.CV_64F, ksize=1)
        
        return np.mean(np.abs(laplacian * self.mask[index])) < self.LAPLACIAN

    @staticmethod
    def same_status(coordinates_status, index, status):
        return status == coordinates_status[index]

    @staticmethod
    def status_changed(coordinates_status, index, status):
        return status != coordinates_status[index]

    def get_current_status(self):
        """Get the current status of all parking spaces"""
        return {
            'total_spaces': self.total_spaces,
            'available_spaces': self.free_spaces,
            'occupied_spaces': self.occupied_spaces,
            'spaces': self.statuses,
            'coordinates_data': self.coordinates_data,
            'dimensions': self.original_dimensions,
            'vehicle_types': ['motorcycle'] * self.occupied_spaces
        }


class CaptureReadError(Exception):
    pass
