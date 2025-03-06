import argparse
import yaml
from coordinates_generator import CoordinatesGenerator
from motion_detector import MotionDetector
from colors import *
import logging
import os


def main():
    logging.basicConfig(level=logging.INFO)

    args = parse_args()

    image_file = args.image_file
    data_file = args.data_file
    start_frame = args.start_frame

    # Only generate coordinates if data_file doesn't exist
    if not os.path.exists(data_file):
        if image_file is not None:
            with open(data_file, "w+") as points:
                generator = CoordinatesGenerator(image_file, points, COLOR_RED)
                generator.generate()
        else:
            raise FileNotFoundError(f"Coordinates file {data_file} not found and no image provided to generate it")

    # Read existing coordinates and start motion detection
    with open(data_file, "r") as data:
        points = yaml.load(data, Loader=yaml.SafeLoader)
        detector = MotionDetector(args.video_file, points, int(start_frame))
        detector.detect_motion()


def parse_args():
    parser = argparse.ArgumentParser(description='Parking Space Motion Detector')

    parser.add_argument("--image",
                        dest="image_file",
                        required=False,
                        default="images/parking_lot_3.png",
                        help="Image file to generate coordinates on")

    parser.add_argument("--video",
                        dest="video_file",
                        required=False,
                        default="videos/parking_lot_4.mp4",
                        help="Video file to detect motion on")

    parser.add_argument("--data",
                        dest="data_file",
                        required=False,
                        default="data/coordinates_1.yml",
                        help="Data file to be used with OpenCV")

    parser.add_argument("--start-frame",
                        dest="start_frame",
                        required=False,
                        default=400,
                        help="Starting frame on the video")

    return parser.parse_args()


if __name__ == '__main__':
    main()
