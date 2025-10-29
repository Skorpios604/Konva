import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Text, Circle } from "react-konva";

const GRID_SIZE = 25;

// Helper: snap value to grid
const snap = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

export default function CountertopDesigner() {
  const [points, setPoints] = useState([
    100, 100,
    300, 100,
    300, 200,
    200, 200,
    200, 300,
    100, 300
  ]);

  const [area, setArea] = useState(0);
  const layerRef = useRef();

  // Compute polygon area
  useEffect(() => {
    const calcArea = (pts) => {
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

  return (
    <div className="flex flex-col items-center">
      <Stage width={800} height={600} className="border rounded shadow">
        <Layer ref={layerRef}>
          {/* Draw grid */}
          {Array.from({ length: 800 / GRID_SIZE }).map((_, i) => (
            <Line
              key={`v-${i}`}
              points={[i * GRID_SIZE, 0, i * GRID_SIZE, 600]}
              stroke="#eee"
            />
          ))}
          {Array.from({ length: 600 / GRID_SIZE }).map((_, i) => (
            <Line
              key={`h-${i}`}
              points={[0, i * GRID_SIZE, 800, i * GRID_SIZE]}
              stroke="#eee"
            />
          ))}

          {/* Countertop shape */}
          <Line
            points={points}
            closed
            fill="#b3e5fc"
            stroke="#0288d1"
            strokeWidth={2}
          />

          {/* Drag handles */}
          {points.reduce((acc, _, i) => {
            if (i % 2 === 0) {
              acc.push(
                <Circle
                  key={i}
                  x={points[i]}
                  y={points[i + 1]}
                  radius={6}
                  fill="#0288d1"
                  draggable
                  onDragMove={(e) => handleDragMove(i / 2, e)}
                />
              );
            }
            return acc;
          }, [])}
        </Layer>
      </Stage>

      {/* Area display */}
      <div className="mt-4 text-gray-700 font-medium">
        📐 Area: {Math.round(area)} sq px
      </div>
    </div>
  );
}
