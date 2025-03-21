from openai import OpenAI
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

class VisionDetector:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)
        
    def detect_motorcycle(self, frame, roi):
        """
        Detect if there's a motorcycle in the given region of interest
        """
        try:
            # Convert ROI to base64
            _, buffer = cv2.imencode('.jpg', roi)
            roi_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Prepare the prompt
            prompt = """Analyze this parking space image and determine if there's a motorcycle present.
            Only respond with either 'motorcycle' or 'empty'. Consider:
            - Motorcycles can be at different angles
            - May be partially visible
            - Could be covered
            - Different types/sizes of motorcycles
            """
            
            # Make API call to OpenAI Vision
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{roi_base64}",
                                }
                            }
                        ]
                    }
                ],
                max_tokens=10
            )
            
            # Process response
            result = response.choices[0].message.content.strip().lower()
            return result == 'motorcycle'
            
        except Exception as e:
            print(f"Error in OpenAI Vision detection: {str(e)}")
            return False 