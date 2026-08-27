const fs = require('fs');
let code = fs.readFileSync('src/app/client/JarvisAssistant.tsx', 'utf8');

// 1. Add position state and drag handlers
if (!code.includes('const [position, setPosition]')) {
  code = code.replace(
    'const [isTerminalOpen, setIsTerminalOpen] = useState(false);',
    'const [isTerminalOpen, setIsTerminalOpen] = useState(false);\n  const [position, setPosition] = useState({ x: window.innerWidth - 90, y: 20 });\n  const [isDragging, setIsDragging] = useState(false);\n  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });'
  );
  
  // Use a ref for position to avoid stale closures in listeners
  code = code.replace(
    'const [pulseScale, setPulseScale] = useState(1);',
    'const [pulseScale, setPulseScale] = useState(1);\n  const positionRef = useRef(position);\n  useEffect(() => { positionRef.current = position; }, [position]);'
  );
  
  // Update orb style from fixed top/right to position based
  code = code.replace(
    "position: 'fixed', top: '20px', right: '30px',",
    "position: 'fixed', top: `${position.y}px`, left: `${position.x}px`,"
  );

  // Update terminal overlay style to follow orb or stay fixed
  code = code.replace(
    "top: '90px',",
    "top: `${Math.min(position.y + 70, window.innerHeight - 300)}px`,"
  );
  code = code.replace(
    "right: isTerminalOpen ? '30px' : '-400px',",
    "left: isTerminalOpen ? `${Math.min(position.x - 360 > 0 ? position.x - 360 : position.x + 70, window.innerWidth - 380)}px` : '-1000px',"
  );

  // Add drag handlers to orb
  const orbJSXStart = "onClick={toggleListening}";
  const dragHandlers = `
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
          e.stopPropagation();
        }}
        onClick={(e) => {
          if (!isDragging) toggleListening();
        }}
  `;
  code = code.replace(orbJSXStart, dragHandlers);

  // Add global mousemove/mouseup listeners when dragging
  code = code.replace(
    'return () => {',
    `useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({ 
        x: Math.max(0, Math.min(newX, window.innerWidth - 60)), 
        y: Math.max(0, Math.min(newY, window.innerHeight - 60)) 
      });
    };
    const handleMouseUp = () => {
      if (isDragging) {
        setTimeout(() => setIsDragging(false), 100); // prevent click trigger
      }
    };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);\n\n  return () => {`
  );
  
  // Make sure we import useRef
  if (!code.includes('useRef')) {
    code = code.replace(
      'import { useState, useEffect, useCallback } from "react";',
      'import { useState, useEffect, useCallback, useRef } from "react";'
    );
  }

  fs.writeFileSync('src/app/client/JarvisAssistant.tsx', code, 'utf8');
  console.log("Patched JarvisAssistant with dragging");
} else {
  console.log("Already patched");
}
