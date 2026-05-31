import cv2
import numpy as np
from PIL import Image

class ImagePreprocessor:
    @staticmethod
    def preprocess_for_ocr(image: Image.Image) -> Image.Image:
        """
        Enhances an image for Tesseract OCR using OpenCV.
        Applies grayscale, resizing, denoising, and thresholding.
        """
        # Convert PIL Image to OpenCV format (numpy array)
        open_cv_image = np.array(image) 
        
        # Convert RGB to BGR 
        if len(open_cv_image.shape) == 3 and open_cv_image.shape[2] == 3:
            open_cv_image = open_cv_image[:, :, ::-1].copy() 

        # 1. Convert to grayscale
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
        
        # 2. Contrast Limited Adaptive Histogram Equalization (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)
        
        # 3. Resize image (scaling up by 2x helps Tesseract recognize small text)
        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

        # 4. Sharpening filter to enhance blurry text
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        gray = cv2.filter2D(gray, -1, kernel)

        # 5. Denoising (removes artifacts)
        gray = cv2.fastNlMeansDenoising(gray, h=10, searchWindowSize=21, templateWindowSize=7)

        # 6. Adaptive Thresholding (Binarize image)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2)

        # Convert back to PIL Image
        return Image.fromarray(thresh)

preprocessor = ImagePreprocessor()
