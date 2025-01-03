import { useRef, useEffect } from "react";
import { useLabeling } from "../hooks/useLabeling";

const ImageLabeler = ({ image, labels, setLabels, className }) => {
  const canvasRef = useRef(null);
  const { isDrawing, currentBox, startDrawing, updateDrawing, finishDrawing } =
    useLabeling();

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      drawLabels(ctx);
    };

    img.src = image;
  }, [image, labels]);

  const drawLabels = (ctx) => {
    labels.forEach((label) => {
      ctx.strokeStyle = label.verified ? "green" : "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        label.box.x,
        label.box.y,
        label.box.width,
        label.box.height
      );
    });
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    startDrawing(point);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    updateDrawing(point);
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;

    const box = await finishDrawing();
    if (box) {
      // Here you would typically call your OCR API
      const newLabel = {
        id: Date.now(),
        box,
        text: "", // This would come from OCR API
        verified: false,
      };
      setLabels((prev) => [...prev, newLabel]);
    }
  };

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-4`}>
      {!image && (
        <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Upload an image to start labeling</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDrawing ? "crosshair" : "default" }}
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default ImageLabeler;
