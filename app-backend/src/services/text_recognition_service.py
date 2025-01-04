from functools import lru_cache
from typing import Literal

class TextRecognitionService:
    def __init__(self, engine: Literal["easyocr", "paddle"] = "easyocr"):
        self.engine = engine
        self._reader = None
        self._detector = None
        self._recognizer = None

    @lru_cache(maxsize=1)
    def _get_easyocr(self):
        import easyocr
        return easyocr.Reader(['vi'])

    @lru_cache(maxsize=1)
    def _get_paddle_detector(self):
        from paddlex import create_model
        return create_model("PP-OCRv4_server_det")

    @lru_cache(maxsize=1)
    def _get_vietocr_recognizer(self):
        import torch
        from vietocr.tool.predictor import Predictor
        from vietocr.tool.config import Cfg
        
        config = Cfg.load_config_from_name('vgg_transformer')
        config['device'] = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        config['cnn']['pretrained'] = False
        return Predictor(config)

    def _convert_paddle_bbox(self, bbox):
        # Convert [x1, y1, x2, y2] to [x, y, width, height]
        x = bbox[0]
        y = bbox[1]
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        return x, y, width, height

    def _convert_easyocr_bbox(self, bbox):
        # Convert [[x1,y1], [x2,y1], [x2,y2], [x1,y2]] to [x, y, width, height]
        x = min(bbox[0][0], bbox[3][0])
        y = min(bbox[0][1], bbox[1][1])
        width = max(bbox[1][0], bbox[2][0]) - x
        height = max(bbox[2][1], bbox[3][1]) - y
        return x, y, width, height

    def process_image(self, image_path: str):
        if self.engine == "easyocr":
            return self._process_with_easyocr(image_path)
        elif self.engine == "paddle":
            return self._process_with_paddle(image_path)
        else:
            raise ValueError(f"Unsupported engine: {self.engine}")

    def _process_with_easyocr(self, image_path: str):
        reader = self._get_easyocr()
        results = reader.readtext(image_path)
        
        labels = []
        for bbox, text, confidence in results:
            x, y, width, height = self._convert_easyocr_bbox(bbox)
            labels.append({
                'x': float(x),
                'y': float(y),
                'width': float(width),
                'height': float(height),
                'text': text,
            })
        return labels

    def _process_with_paddle(self, image_path: str):
        from PIL import Image
        
        # Lazy load models
        if not self._detector:
            self._detector = self._get_paddle_detector()
        if not self._recognizer:
            self._recognizer = self._get_vietocr_recognizer()

        # Detect text regions
        detection_results = self._detector.predict(image_path)
        
        # Load image for recognition
        img = Image.open(image_path)
        
        labels = []
        for bbox in detection_results:
            # Extract and convert coordinates
            x, y, width, height = self._convert_paddle_bbox(bbox['bbox'])
            
            # Crop text region
            text_region = img.crop((x, y, x + width, y + height))
            
            # Recognize text
            text = self._recognizer.predict(text_region)
            
            labels.append({
                'x': float(x),
                'y': float(y),
                'width': float(width),
                'height': float(height),
                'text': text,
            })
        return labels 