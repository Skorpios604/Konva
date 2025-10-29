import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle, Rect } from "react-konva";

const GRID_SIZE = 25;

// Helper: snap value to grid
const snap = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

export default function CountertopDesigner() {
  const [points, setPoints] = useState([]);
  const [area, setArea] = useState(0);
  const layerRef = useRef();

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

  // Handle canvas click to add points
  const handleStageClick = (e) => {
    // Only add point if clicking on the stage/background, not on existing elements
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Rect') {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      const x = snap(pointerPos.x);
      const y = snap(pointerPos.y);
      setPoints([...points, x, y]);
    }
  };

  // Clear all points
  const handleClear = () => {
    setPoints([]);
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Countertop Designer</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <Stage 
          width={800} 
          height={600} 
          onClick={handleStageClick}
          style={{ border: '2px solid #9ca3af', borderRadius: '4px' }}
        >
          <Layer ref={layerRef}>
            {/* White background */}
            <Rect
              x={0}
              y={0}
              width={800}
              height={600}
              fill="white"
            />

            {/* Countertop shape */}
            {points.length > 0 && (
              <Line
                points={points}
                closed
                fill="#b3e5fc"
                stroke="#0288d1"
                strokeWidth={2}
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
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Clear
        </button>
      </div>
      
      <div className="mt-4 text-gray-600 text-sm">
        Click on the canvas to add points. Drag points to adjust shape.
      </div>
    </div>
  );
}