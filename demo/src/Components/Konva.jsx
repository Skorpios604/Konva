import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle, Rect } from "react-konva";

const GRID_SIZE = 25;
const snap = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

export default function CountertopDesigner() {
  const [points, setPoints] = useState([]); // flat array [x1, y1, x2, y2, ...]
  const [area, setArea] = useState(0);
  const [tempPoint, setTempPoint] = useState(null); // for preview while dragging
  const layerRef = useRef();
  const stageRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);

  // Compute polygon area
  useEffect(() => {
    const calcArea = (pts) => {
      if (pts.length < 6) return 0;
      let a = 0;
      for (let i = 0; i < pts.length; i += 2) {
        const j = (i + 2) % pts.length;
        a += pts[i] * pts[j + 1] - pts[j] * pts[i + 1];
      }
      return Math.abs(a / 2);
    };
    setArea(calcArea(points));
  }, [points]);

  // Handle point drag
  const handleDragMove = (index, e) => {
    const newPoints = [...points];
    newPoints[index * 2] = snap(e.target.x());
    newPoints[index * 2 + 1] = snap(e.target.y());
    setPoints(newPoints);
  };

  // Start line on mouse down
  const handleMouseDown = (e) => {
    if (e.target !== e.target.getStage() && e.target.getClassName() !== 'Rect') return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = snap(pos.x);
    const y = snap(pos.y);

    setTempPoint([x, y]); // start point
    setIsDrawing(true);
  };

  // Update temporary line as we drag
  const handleMouseMove = (e) => {
    if (!isDrawing || !tempPoint) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = snap(pos.x);
    const y = snap(pos.y);

    setTempPoint([tempPoint[0], tempPoint[1], x, y]); // preview line
  };

  // Finish line on mouse up
  const handleMouseUp = (e) => {
    if (!isDrawing || !tempPoint) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = snap(pos.x);
    const y = snap(pos.y);

    // Add start and end point to flat array
    setPoints([...points, tempPoint[0], tempPoint[1], x, y]);

    setTempPoint(null);
    setIsDrawing(false);
  };

  // Clear all points
  const handleClear = () => setPoints([]);

  // Undo last line (last 2 points)
  const handleUndo = () => setPoints(points.slice(0, -4));

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Countertop Designer</h1>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <Stage
          width={800}
          height={600}
          ref={stageRef}
          style={{ border: '2px solid #9ca3af', borderRadius: '4px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer ref={layerRef}>
            <Rect x={0} y={0} width={800} height={600} fill="white" />

            {/* Draw finalized lines */}
            {points.length > 0 && (
              <Line
                points={points}
                closed
                fill="#b3e5fc"
                stroke="#0288d1"
                strokeWidth={2}
              />
            )}

            {/* Draw temporary line while dragging */}
            {isDrawing && tempPoint && tempPoint.length === 4 && (
              <Line
                points={tempPoint}
                stroke="#0288d1"
                strokeWidth={2}
                dash={[4, 4]}
              />
            )}

            {/* Drag handles */}
            {points.reduce((acc, _, i) => {
              if (i % 2 === 0) {
                acc.push(
                  <Circle
                    key={i}
                    x={points[i]}
                    y={points[i + 1]}
                    radius={8}
                    fill="#0288d1"
                    stroke="#fff"
                    strokeWidth={2}
                    draggable
                    onDragMove={(e) => handleDragMove(i / 2, e)}
                  />
                );
              }
              return acc;
            }, [])}
          </Layer>
        </Stage>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-4 items-center">
        <div className="text-gray-700 font-medium text-lg">
          📐 Area: {Math.round(area)} sq px
        </div>
        <button
          onClick={handleUndo}
          disabled={points.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Undo
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 text-gray-600 text-sm">
        Click to start a line, drag to the next point, release to finish. Drag points to adjust shape.
      </div>
    </div>
  );
}
