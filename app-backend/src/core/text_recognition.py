from easyocr import Reader

def text_recognition(image_path):
    reader = Reader(['en'], gpu=False)
    result = reader.readtext(image_path)
    return result


print(text_recognition("/home/bachcorn/Desktop/code/Auto-OCR-Labeller/app-backend/uploads/Screenshot_20241207_090853.png"))