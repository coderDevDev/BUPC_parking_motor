import cv2 as open_cv


def draw_contours(image,
                  coordinates,
                  label,
                  font_color,
                  border_color=None,
                  line_thickness=1,
                  font=open_cv.FONT_HERSHEY_SIMPLEX,
                  font_scale=0.5):
    """
    Draw contours on the image
    """
    if border_color is None:
        border_color = font_color

    coordinates = coordinates.reshape((-1, 1, 2))
    open_cv.drawContours(image, [coordinates], -1, border_color, line_thickness)
    moment = open_cv.moments(coordinates)

    center = (int(moment["m10"] / moment["m00"]) - 3,
             int(moment["m01"] / moment["m00"]) + 3)

    open_cv.putText(image, label, center, font, font_scale, font_color, line_thickness)
