import { useRef, useEffect } from "react";
import { useLabeling } from "../hooks/useLabeling";
import { useLabelStore } from "../hooks/useLabelStore";

const ImageLabeler = ({ image, imageId, labelStore, className }) => {
  const canvasRef = useRef(null);
  const {
    isDrawing,
    currentBox,
    startDrawing,
    updateDrawing,
    finishDrawing,
    getResizeHandle,
  } = useLabeling();

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get labels for current image
      const currentLabels = labelStore.getLabelsForImage(imageId);
      drawLabels(ctx, currentLabels);

      // Draw current box if we're drawing
      if (isDrawing && currentBox) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentBox.x,
          currentBox.y,
          currentBox.width,
          currentBox.height
        );
      }
    };

    img.src = image;
  }, [image, imageId, labelStore, isDrawing, currentBox]);

  const drawLabels = (ctx, labels) => {
    labels.forEach((label) => {
      // Draw the bounding box
      ctx.strokeStyle = label.verified ? "green" : "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        label.box.x,
        label.box.y,
        label.box.width,
        label.box.height
      );

      // Draw the label text above the box
      ctx.font = "14px Arial";
      ctx.fillStyle = label.verified ? "green" : "#b7a429";
      ctx.fillText(
        label.text || "Unlabeled",
        label.box.x,
        label.box.y - 5 // Position text 5 pixels above the box
      );
    });
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    startDrawing(point);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    updateDrawing(point);

    // Redraw the canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    ctx.drawImage(img, 0, 0);
    drawLabels(ctx);

    // Draw current box
    if (currentBox) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );
    }
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;

    const box = await finishDrawing();
    if (box) {
      const newLabel = {
        id: Date.now(),
        box,
        text: "", // This would come from OCR API
        verified: false,
      };
      labelStore.addLabelToImage(imageId, newLabel);
    }
  };

  const getCursorStyle = (e) => {
    if (isDrawing) return "crosshair";

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    const handle = getResizeHandle(point, currentBox);
    switch (handle) {
      case "nw":
      case "se":
        return "nwse-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      default:
        return "default";
    }
  };

  const drawBox = (ctx, box, isActive = false) => {
    // Draw the main box
    ctx.strokeStyle = isActive ? "blue" : "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Draw resize handles if box is active
    if (isActive) {
      const handleSize = 8;
      const handles = [
        { x: box.x, y: box.y }, // nw
        { x: box.x + box.width, y: box.y }, // ne
        { x: box.x + box.width, y: box.y + box.height }, // se
        { x: box.x, y: box.y + box.height }, // sw
        { x: box.x + box.width / 2, y: box.y }, // n
        { x: box.x + box.width, y: box.y + box.height / 2 }, // e
        { x: box.x + box.width / 2, y: box.y + box.height }, // s
        { x: box.x, y: box.y + box.height / 2 }, // w
      ];

      ctx.fillStyle = "white";
      ctx.strokeStyle = "blue";
      handles.forEach((point) => {
        ctx.beginPath();
        ctx.rect(
          point.x - handleSize / 2,
          point.y - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fill();
        ctx.stroke();
      });
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
        style={{ cursor: getCursorStyle }}
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default ImageLabeler;
