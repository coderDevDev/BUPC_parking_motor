import cv2 as open_cv
import numpy as np
import logging
from .drawing_utils import draw_contours
from .colors import COLOR_GREEN, COLOR_WHITE, COLOR_BLUE, COLOR_RED


class MotionDetector:
    LAPLACIAN = 1.4
    DETECT_DELAY = 1

    def __init__(self, video, coordinates, start_frame):
        self.video = video
        self.coordinates_data = coordinates
        self.start_frame = start_frame
        self.contours = []
        self.bounds = []
        self.mask = []
        self.statuses = [False] * len(coordinates)
        self.total_spaces = len(coordinates)
        self.free_spaces = 0
        self.occupied_spaces = self.total_spaces
        
        # Initialize bounds and masks
        self._initialize_bounds_and_masks()

    def _initialize_bounds_and_masks(self):
        for p in self.coordinates_data:
            coordinates = self._coordinates(p)
            rect = open_cv.boundingRect(coordinates)
            
            self.contours.append(coordinates)
            self.bounds.append(rect)

            # Create mask for the space
            new_coordinates = coordinates.copy()
            new_coordinates[:, 0] = coordinates[:, 0] - rect[0]
            new_coordinates[:, 1] = coordinates[:, 1] - rect[1]
            
            mask = open_cv.drawContours(
                np.zeros((rect[3], rect[2]), dtype=np.uint8),
                [new_coordinates],
                contourIdx=-1,
                color=255,
                thickness=-1,
                lineType=open_cv.LINE_8)

            mask = mask == 255
            self.mask.append(mask)

    def detect_motion(self):
        capture = open_cv.VideoCapture(self.video)
        capture.set(open_cv.CAP_PROP_POS_FRAMES, self.start_frame)
        fps = capture.get(open_cv.CAP_PROP_FPS)
        logging.debug("FPS: %s", fps)

        coordinates_data = self.coordinates_data
        logging.debug("coordinates data: %s", coordinates_data)

        for p in coordinates_data:
            coordinates = self._coordinates(p)
            logging.debug("coordinates: %s", coordinates)

            rect = open_cv.boundingRect(coordinates)
            logging.debug("rect: %s", rect)

            new_coordinates = coordinates.copy()
            new_coordinates[:, 0] = coordinates[:, 0] - rect[0]
            new_coordinates[:, 1] = coordinates[:, 1] - rect[1]
            logging.debug("new_coordinates: %s", new_coordinates)

            self.contours.append(coordinates)
            self.bounds.append(rect)

            mask = open_cv.drawContours(
                np.zeros((rect[3], rect[2]), dtype=np.uint8),
                [new_coordinates],
                contourIdx=-1,
                color=255,
                thickness=-1,
                lineType=open_cv.LINE_8)

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

            blurred = open_cv.GaussianBlur(frame.copy(), (5, 5), 3)
            grayed = open_cv.cvtColor(blurred, open_cv.COLOR_BGR2GRAY)
            new_frame = frame.copy()
            
            position_in_seconds = capture.get(open_cv.CAP_PROP_POS_MSEC) / 1000.0

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

            open_cv.imshow(str(self.video), new_frame)
            k = open_cv.waitKey(int(700 / fps))
            if k == ord("q"):
                break
        
        capture.release()
        open_cv.destroyAllWindows()

    def __draw_info_panel(self, frame, total, free, occupied):
        # Create semi-transparent overlay for info panel
        overlay = frame.copy()
        panel_height = 120
        open_cv.rectangle(overlay, (10, 10), (250, panel_height), (0, 0, 0), -1)
        
        # Add text
        font = open_cv.FONT_HERSHEY_SIMPLEX
        open_cv.putText(overlay, f'Total Spaces: {total}', (20, 35), font, 0.6, COLOR_WHITE, 2)
        open_cv.putText(overlay, f'Free Spaces: {free}', (20, 65), font, 0.6, COLOR_GREEN, 2)
        open_cv.putText(overlay, f'Occupied Spaces: {occupied}', (20, 95), font, 0.6, COLOR_RED, 2)
        
        # Apply overlay with transparency
        alpha = 0.7
        frame = open_cv.addWeighted(overlay, alpha, frame, 1 - alpha, 0)

    def __draw_free_space_locations(self, frame, statuses, coordinates_data):
        free_spaces = []
        for idx, status in enumerate(statuses):
            if status:  # If space is free
                space_id = coordinates_data[idx]["id"] + 1
                free_spaces.append(str(space_id))

        if free_spaces:
            message = "Free Spaces at: " + ", ".join(free_spaces)
            # Draw at bottom of frame
            font = open_cv.FONT_HERSHEY_SIMPLEX
            y_position = frame.shape[0] - 30  # 30 pixels from bottom
            open_cv.putText(frame, message, (10, y_position), font, 0.6, COLOR_WHITE, 2)

    def __apply(self, grayed, index, p):
        rect = self.bounds[index]
        roi_gray = grayed[rect[1]:(rect[1] + rect[3]), rect[0]:(rect[0] + rect[2])]
        laplacian = open_cv.Laplacian(roi_gray, open_cv.CV_64F, ksize=1)
        
        return np.mean(np.abs(laplacian * self.mask[index])) < self.LAPLACIAN

    @staticmethod
    def _coordinates(p):
        return np.array(p["coordinates"])

    @staticmethod
    def same_status(coordinates_status, index, status):
        return status == coordinates_status[index]

    @staticmethod
    def status_changed(coordinates_status, index, status):
        return status != coordinates_status[index]

    def process_frame(self, frame):
        if not self.bounds:
            self._initialize_bounds_and_masks()
            
        # Process a single frame and return parking space statuses
        blurred = open_cv.GaussianBlur(frame, (5, 5), 3)  # Removed copy()
        grayed = open_cv.cvtColor(blurred, open_cv.COLOR_BGR2GRAY)
        
        # Process all spaces in one go using numpy operations
        statuses = []
        status_changed = False
        
        for index, p in enumerate(self.coordinates_data):
            status = self.__apply(grayed, index, p)
            statuses.append(status)
            
            # Only redraw if status changed
            if not hasattr(self, 'previous_statuses') or self.previous_statuses[index] != status:
                status_changed = True
                coordinates = self._coordinates(p)
                color = COLOR_GREEN if status else COLOR_RED
                draw_contours(frame, coordinates, str(p["id"] + 1), COLOR_WHITE, color)
        
        # Update status only if changed
        if status_changed:
            self.previous_statuses = statuses.copy()  # Use copy to avoid reference issues
            self.statuses = statuses
            self.free_spaces = sum(1 for status in statuses if status)
            self.occupied_spaces = self.total_spaces - self.free_spaces
        
        return {
            str(i+1): {
                "status": "available" if status else "occupied",
                "id": i+1
            }
            for i, status in enumerate(statuses)
        }

    def get_current_status(self):
        if not self.statuses:  # If no statuses yet
            return {
                str(i+1): {
                    "status": "unknown",
                    "id": i+1
                }
                for i in range(len(self.coordinates_data))
            }
            
        return {
            str(i+1): {
                "status": "available" if status else "occupied",
                "id": i+1
            }
            for i, status in enumerate(self.statuses)
        }


class CaptureReadError(Exception):
    pass
