import React, { useState } from "react";
import { Stage, Layer, Line, Circle, Rect } from "react-konva";

export default function ContinuousPointConnections() {
  const [circles, setCircles] = useState([]);
  const [lines, setLines] = useState([]);
  const [tempLine, setTempLine] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCircle, setCurrentCircle] = useState(null);

  // helper: create a new circle object
  const createCircle = (x, y, color) => ({
    x,
    y,
    radius: 12,
    fill: color,
  });

  // handle stage mouse down (first point)
  const handleStageMouseDown = (e) => {
    // only trigger if clicked directly on the stage (not on a shape)
    if (e.target !== e.target.getStage()) return;

    if (!currentCircle) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      const newCircle = createCircle(pos.x, pos.y, "dodgerblue");
      setCircles([newCircle]);
      setCurrentCircle(newCircle);
    }
  };

  // handle circle click (start drawing from that circle)
  const handleCircleMouseDown = (circle) => {
    setIsDrawing(true);
    const p = circle;
    setTempLine({
      points: [p.x, p.y, p.x, p.y],
    });
    setCurrentCircle(circle);
  };

  // handle mouse move
  const handleMouseMove = (e) => {
    if (!isDrawing || !tempLine || !currentCircle) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setTempLine({
      points: [currentCircle.x, currentCircle.y, pos.x, pos.y],
    });
  };

  // handle mouse up (finish line)
  const handleMouseUp = (e) => {
    if (!isDrawing || !tempLine) return;
    setIsDrawing(false);

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    const newCircle = createCircle(pos.x, pos.y, "orange");
    const newLine = {
      points: [currentCircle.x, currentCircle.y, newCircle.x, newCircle.y],
    };

    setLines((prev) => [...prev, newLine]);
    setCircles((prev) => [...prev, newCircle]);
    setCurrentCircle(newCircle);
    setTempLine(null);
  };

  // handle undo (remove last point)
  const handleUndo = () => {
    if (circles.length === 0) return;

    setCircles((prev) => {
      const updated = [...prev];
      updated.pop();
      return updated;
    });

    setLines((prev) => {
      const updated = [...prev];
      updated.pop();
      return updated;
    });

    if (circles.length > 1) {
      setCurrentCircle(circles[circles.length - 2]);
    } else {
      setCurrentCircle(null);
    }
  };

  // handle clear (remove all points)
  const handleClear = () => {
    setCircles([]);
    setLines([]);
    setTempLine(null);
    setIsDrawing(false);
    setCurrentCircle(null);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white min-h-screen">
      <div className="flex gap-4 items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Continuous Point Connections
        </h1>
        <button
          onClick={handleUndo}
          disabled={circles.length === 0}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Undo
        </button>
        <button
          onClick={handleClear}
          disabled={circles.length === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Clear
        </button>
      </div>

      <Stage
        width={800}
        height={600}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ background: "white", border: "2px solid #ccc", borderRadius: "4px" }}
      >
        <Layer>
          {/* background rect so canvas is always white */}
          <Rect x={0} y={0} width={800} height={600} fill="white" listening={false} />
          {/* Draw lines */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {/* Temporary line */}
          {isDrawing && tempLine && (
            <Line
              points={tempLine.points}
              stroke="black"
              strokeWidth={2}
              dash={[4, 4]}
            />
          )}

          {/* Circles */}
          {circles.map((c, i) => (
            <Circle
              key={i}
              x={c.x}
              y={c.y}
              radius={c.radius}
              fill={c.fill}
              onMouseDown={() => handleCircleMouseDown(c)}
            />
          ))}
        </Layer>
      </Stage>

      <div className="mt-4 text-gray-600 text-sm">
        {circles.length === 0
          ? "Click anywhere to place the first point."
          : "Click the last point to continue drawing."}
      </div>
    </div>
  );
}
