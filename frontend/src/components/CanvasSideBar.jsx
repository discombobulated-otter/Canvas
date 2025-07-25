import {
  FaHandPaper,
  FaTrash,
  FaSave,
  FaDownload,
  FaSquare,
  FaCircle,
} from "react-icons/fa";
import { CiPen, CiText } from "react-icons/ci";
import { IoTriangle } from "react-icons/io5";
import { PiLineSegmentFill } from "react-icons/pi";
import { SketchPicker } from "react-color";
import { Tooltip } from "react-tooltip"; // If using tooltips

const CanvasSidebar = ({
  canvasRef,
  selectedShape,
  setSelectedShape,
  setActiveTool,
  activeTool,
  isMoving,
  toggleMoveMode,
  handleDownload,
  setSave,
  deleteSelectedObject,
  selectedColor,
  setSelectedColor,
  showDeleteButton,
  addRect,
  addCircle,
  addTriangle,
  addLine,
  addText,
}) => {
  const buttonStyle = (active) =>
    `w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#ffffff25] ${
      active ? "bg-white/20 backdrop-blur text-white" : "text-white"
    }`;

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 p-3 bg-[#1E1E2F]/70 backdrop-blur-xl rounded-2xl shadow-xl">
      {/* Tools */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMoveMode();
        }}
        className={buttonStyle(isMoving)}
        title="Move Tool"
      >
        <FaHandPaper size={18} />
      </button>

      {showDeleteButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteSelectedObject();
          }}
          className={buttonStyle(false)}
          title="Delete"
        >
          <FaTrash size={18} />
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveTool("pen");
        }}
        className={buttonStyle(activeTool === "pen")}
        title="Pen Tool"
      >
        <CiPen size={22} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveTool("text");
          addText();
        }}
        className={buttonStyle(activeTool === "text")}
        title="Text Tool"
      >
        <CiText size={22} />
      </button>

      {/* Shapes */}
      <div className="flex flex-col gap-3 pt-2 border-t border-white/20">
        <button
          onClick={addRect}
          className={buttonStyle(selectedShape?.type === "rect")}
          title="Rectangle"
        >
          <FaSquare size={18} />
        </button>
        <button
          onClick={addCircle}
          className={buttonStyle(selectedShape?.type === "circle")}
          title="Circle"
        >
          <FaCircle size={18} />
        </button>
        <button
          onClick={addTriangle}
          className={buttonStyle(selectedShape?.type === "triangle")}
          title="Triangle"
        >
          <IoTriangle size={20} />
        </button>
        <button
          onClick={addLine}
          className={buttonStyle(selectedShape?.type === "line")}
          title="Line"
        >
          <PiLineSegmentFill size={20} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2 border-t border-white/20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSave(true);
          }}
          className={buttonStyle(false)}
          title="Save"
        >
          <FaSave size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className={buttonStyle(false)}
          title="Download"
        >
          <FaDownload size={18} />
        </button>
      </div>

      {/* Color Picker */}
      {/* <div className="pt-4 border-t border-white/20">
        <SketchPicker
          color={selectedColor}
          onChange={(color) => {
            setSelectedColor(color.hex);
            const canvas = canvasRef.current;
            if (canvas.isDrawingMode) {
              canvas.freeDrawingBrush.color = color.hex;
            }
            if (selectedShape != null) {
              if (selectedShape.type === "line") {
                selectedShape.set("stroke", color.hex);
              } else if (selectedShape === "canvas") {
                canvas.backgroundColor = color.hex;
              } else {
                selectedShape.set("fill", color.hex);
              }
              canvas.renderAll();
            }
          }}
        />
      </div> */}
    </div>
  );
};

export default CanvasSidebar;
