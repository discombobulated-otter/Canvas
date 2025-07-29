import { useEffect, useState } from "react";
import {
  FaSquare,
  FaRegSquare,
  FaFillDrip,
  FaSlash,
  FaBorderStyle,
  FaFont,
  FaEyeDropper,
  FaCopy,
  FaTrash,
  FaLock,
  FaUnlock,
  FaLayerGroup,
  FaArrowUp,
  FaArrowDown,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaRedo,
  FaUndo,
  FaGripLines
} from "react-icons/fa";

const ShapeMenu = ({ canvasRef, selectedShape, onUndo, onRedo, canUndo, canRedo }) => {
  const [fillColor, setFillColor] = useState("#000");
  const [strokeColor, setStrokeColor] = useState("#000");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [opacityPct, setOpacityPct] = useState(100);
  const [label, setLabel] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [isLocked, setIsLocked] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowColor, setShadowColor] = useState("#000000");

  useEffect(() => {
    if (!selectedShape || selectedShape === "canvas") return;
    setFillColor(selectedShape.fill ?? "#3B82F6");
    setStrokeColor(selectedShape.stroke ?? "#1E293B");
    setStrokeWidth(selectedShape.strokeWidth ?? 2);
    setOpacityPct((selectedShape.opacity ?? 1) * 100);
    setLabel(selectedShape.customLabel || "");
    setIsLocked(selectedShape.lockMovementX || false);
    setCornerRadius(selectedShape.rx || 0);
    setShadowBlur(selectedShape.shadow?.blur || 0);
    setShadowColor(selectedShape.shadow?.color || "#000000");
  }, [selectedShape]);

  const update = (prop, val) => {
    if (!selectedShape || selectedShape === "canvas") return;
    selectedShape.set(prop, val);
    canvasRef.current.renderAll();
  };

  const toggleFill = () => {
    update("fill", selectedShape.fill ? null : fillColor);
  };

  const toggleLock = () => {
    const locked = !isLocked;
    setIsLocked(locked);
    selectedShape.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      selectable: !locked
    });
    canvasRef.current.renderAll();
  };

  const duplicateShape = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    selectedShape.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      canvasRef.current.add(cloned);
      canvasRef.current.setActiveObject(cloned);
      canvasRef.current.renderAll();
    });
  };

  const deleteShape = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    canvasRef.current.remove(selectedShape);
    if (selectedShape.labelText) {
      canvasRef.current.remove(selectedShape.labelText);
    }
    canvasRef.current.renderAll();
  };

  const bringToFront = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    canvasRef.current.bringToFront(selectedShape);
    canvasRef.current.renderAll();
  };

  const sendToBack = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    canvasRef.current.sendToBack(selectedShape);
    canvasRef.current.renderAll();
  };

  const alignLeft = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    update("left", 0);
  };

  const alignCenter = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    const canvasWidth = canvasRef.current.getWidth();
    update("left", (canvasWidth - selectedShape.getScaledWidth()) / 2);
  };

  const alignRight = () => {
    if (!selectedShape || selectedShape === "canvas") return;
    const canvasWidth = canvasRef.current.getWidth();
    update("left", canvasWidth - selectedShape.getScaledWidth());
  };

  const onOpacityChange = (pct) => {
    setOpacityPct(pct);
    update("opacity", pct / 100);
  };

  const onCornerRadiusChange = (radius) => {
    setCornerRadius(radius);
    if (selectedShape.type === 'rect') {
      update("rx", radius);
      update("ry", radius);
    }
  };

  const onShadowChange = (blur, color) => {
    setShadowBlur(blur);
    setShadowColor(color);
    update("shadow", blur > 0 ? {
      color: color,
      blur: blur,
      offsetX: 2,
      offsetY: 2
    } : null);
  };

  const onLabelChange = (txt) => {
    selectedShape.customLabel = txt;
    setLabel(txt);
    const canvas = canvasRef.current;
    const fabric = window.fabric;
    
    if (!selectedShape.labelText && txt) {
      const lbl = new fabric.Text(txt, {
        fontSize: fontSize,
        fill: "#334155",
        fontFamily: "Inter, system-ui, sans-serif",
        top: selectedShape.top + selectedShape.height + 10,
        left: selectedShape.left + (selectedShape.width || 0) / 2,
        originX: "center",
        selectable: false,
        evented: false,
      });
      selectedShape.labelText = lbl;
      canvas.add(lbl);
    } else if (selectedShape.labelText) {
      if (txt) {
        selectedShape.labelText.set("text", txt);
      } else {
        canvas.remove(selectedShape.labelText);
        selectedShape.labelText = null;
      }
    }
    canvas.renderAll();
  };

  if (!selectedShape || selectedShape === "canvas") {
    // Show minimal toolbar when no shape is selected
    return (
      <div className="
        absolute bottom-6 left-1/2 -translate-x-1/2
        bg-white/95 backdrop-blur-md
        flex items-center gap-2 px-4 py-2 rounded-xl
        border border-gray-200 shadow-lg z-50
      ">
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <FaUndo size={16} className="text-gray-600" />
        </button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <FaRedo size={16} className="text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="
      absolute bottom-6 left-1/2 -translate-x-1/2
      bg-white/95 backdrop-blur-md
      flex items-center gap-1 px-3 py-2 rounded-xl
      border border-gray-200 shadow-lg z-50
      max-w-6xl overflow-x-auto
    ">
      {/* Drag Handle */}
      <div className="flex items-center pr-2 border-r border-gray-200">
        <FaGripLines size={14} className="text-gray-400" />
      </div>

      {/* Fill Controls */}
      <div className="flex items-center gap-1">
        <button 
          title="Toggle Fill" 
          onClick={toggleFill}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {selectedShape.fill ? (
            <FaSquare size={16} style={{ color: fillColor }} />
          ) : (
            <FaRegSquare size={16} className="text-gray-600" />
          )}
        </button>

        <label title="Fill Color" className="flex items-center">
          <input
            type="color"
            disabled={!selectedShape.fill}
            value={fillColor}
            onChange={e => { 
              setFillColor(e.target.value); 
              update("fill", e.target.value); 
            }}
            className="w-6 h-6 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
          />
        </label>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Stroke Controls */}
      <div className="flex items-center gap-1">
        <FaSlash size={14} className="text-gray-600" />
        <input
          type="color"
          value={strokeColor}
          onChange={e => { 
            setStrokeColor(e.target.value); 
            update("stroke", e.target.value); 
          }}
          className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
        />
        <div className="flex items-center gap-1">
          <FaBorderStyle size={14} className="text-gray-600" />
          <input
            type="range"
            min="0" max="10"
            value={strokeWidth}
            onChange={e => {
              const v = parseInt(e.target.value);
              setStrokeWidth(v);
              update("strokeWidth", v);
            }}
            className="w-12 h-2"
          />
          <span className="text-xs text-gray-500 w-6">{strokeWidth}</span>
        </div>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Corner Radius (for rectangles) */}
      {selectedShape.type === 'rect' && (
        <>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">R</span>
            <input
              type="range"
              min="0" max="50"
              value={cornerRadius}
              onChange={e => onCornerRadiusChange(parseInt(e.target.value))}
              className="w-12 h-2"
            />
            <span className="text-xs text-gray-500 w-6">{cornerRadius}</span>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-1" />
        </>
      )}

      {/* Opacity */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600">α</span>
        <input
          type="range"
          min="0" max="100"
          value={opacityPct}
          onChange={e => onOpacityChange(parseInt(e.target.value))}
          className="w-12 h-2"
        />
        <span className="text-xs text-gray-500 w-8">{opacityPct}%</span>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Shadow */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600">Shadow</span>
        <input
          type="range"
          min="0" max="20"
          value={shadowBlur}
          onChange={e => onShadowChange(parseInt(e.target.value), shadowColor)}
          className="w-12 h-2"
        />
        <input
          type="color"
          value={shadowColor}
          onChange={e => onShadowChange(shadowBlur, e.target.value)}
          className="w-5 h-5 rounded border border-gray-300 cursor-pointer"
        />
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Label */}
      <div className="flex items-center gap-1">
        <FaFont size={14} className="text-gray-600" />
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={e => onLabelChange(e.target.value)}
          className="bg-white text-gray-800 text-xs rounded px-2 py-1 w-20 border border-gray-300 outline-none focus:border-blue-400"
        />
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <button 
          onClick={alignLeft}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Align Left"
        >
          <FaAlignLeft size={12} className="text-gray-600" />
        </button>
        <button 
          onClick={alignCenter}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Align Center"
        >
          <FaAlignCenter size={12} className="text-gray-600" />
        </button>
        <button 
          onClick={alignRight}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Align Right"
        >
          <FaAlignRight size={12} className="text-gray-600" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Layer Controls */}
      <div className="flex items-center gap-1">
        <button 
          onClick={bringToFront}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Bring to Front"
        >
          <FaArrowUp size={12} className="text-gray-600" />
        </button>
        <button 
          onClick={sendToBack}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Send to Back"
        >
          <FaArrowDown size={12} className="text-gray-600" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={toggleLock}
          className="p-1.5 hover:bg-gray-100 rounded"
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? (
            <FaLock size={12} className="text-orange-500" />
          ) : (
            <FaUnlock size={12} className="text-gray-600" />
          )}
        </button>
        <button 
          onClick={duplicateShape}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Duplicate"
        >
          <FaCopy size={12} className="text-gray-600" />
        </button>
        <button 
          onClick={deleteShape}
          className="p-1.5 hover:bg-red-100 rounded"
          title="Delete"
        >
          <FaTrash size={12} className="text-red-500" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* History */}
      <div className="flex items-center gap-1">
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <FaUndo size={12} className="text-gray-600" />
        </button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <FaRedo size={12} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ShapeMenu;