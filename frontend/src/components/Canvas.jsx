import { useEffect, useRef, useState } from "react";
import { Canvas, Rect, Circle, Triangle, Line, Textbox, PencilBrush, ActiveSelection } from "fabric";
import { CiPen, CiText } from "react-icons/ci";
import { FaCircle, FaShapes, FaSquare, FaHandPaper, FaDownload, FaTrash, FaSave, FaTimes, FaBars } from "react-icons/fa";
import { IoTriangle } from "react-icons/io5";
import { PiLineSegmentFill } from "react-icons/pi";
import { SketchPicker } from "react-color";
import {  useSession, useUser } from "@clerk/clerk-react"
import SaveCanvas from "./SaveCanvas.jsx";
import { useNavigate } from "react-router-dom";

import { motion } from 'framer-motion';
const CanvasComp = ({ save, setSave }) => {
  const canvasRef = useRef(null);
  const [open, setopen] = useState(false)
  const [activeTool, setActiveTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [selectedShape, setSelectedShape] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const boxRef = useRef();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
 
  const { user } = useUser();  


  console.log(user)
  useEffect(() => {
    const boxWidth = boxRef.current.clientWidth;
    const boxHeight = boxRef.current.clientHeight;
    const canvasWidth = boxWidth * 0.6;
    const canvasHeight = boxHeight * 0.9;

    const canvas = new Canvas("my-canvas", {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
      isDrawingMode: false,
      preserveObjectStacking: true,
      selection: true,
    });

    // Default shape (rectangle)
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: selectedColor,
      width: 200,
      height: 100,
    });

    canvas.add(rect);
    canvasRef.current = canvas;

    // Event handlers for selection
    canvas.on("mouse:down", function (options) {
      if (options.target) {
        const activeObject = canvas.getActiveObject();

        if (options.e.shiftKey) {
          if (activeObject) {
            if (activeObject.type === 'activeSelection') {
              // Add to existing selection
              activeObject.addWithUpdate(options.target);
            } else {
              // Create new selection with both objects
              const sel = new ActiveSelection([activeObject, options.target], {
                canvas: canvas
              });
              canvas.setActiveObject(sel);
            }
          } else {
            // First object in selection
            canvas.setActiveObject(options.target);
          }
        } else {
          // Normal single selection
          canvas.setActiveObject(options.target);
        }
        setSelectedShape(canvas.getActiveObject());
        setShowDeleteButton(true);
      } else {
        // Click on empty space
        canvas.discardActiveObject();
        setSelectedShape(null);
        setShowDeleteButton(false);
      }
      canvas.requestRenderAll();
    });

    // Handle selection clearing
    canvas.on("selection:cleared", () => {
      setSelectedShape(null);
      setShowDeleteButton(false);
    });

    // Handle selection created
    canvas.on("selection:created", (e) => {
      setSelectedShape(e.target);
      setShowDeleteButton(true);
    });

    // Handle selection updated
    canvas.on("selection:updated", (e) => {
      setSelectedShape(e.target);
      setShowDeleteButton(true);
    });

    canvas.on("mouse:dblclick", (e) => {
      if (!e.target) {
        setSelectedShape("canvas");
        setShowDeleteButton(false);
      }
    });

    canvas.on("object:modified", () => {
      canvas.renderAll();
    });

    // Handle keyboard events
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShape) {
        deleteSelectedObject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Handle window resize
    const handleResize = () => {
  if (canvasRef.current && boxRef.current) {
    const canvas = canvasRef.current;

    // old size
    const oldWidth = canvas.getWidth();
    const oldHeight = canvas.getHeight();

    // new size based on container
    const newWidth = boxRef.current.clientWidth * 0.6;
    const newHeight = boxRef.current.clientHeight * 0.9;

    // scale ratios
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;

    // resize canvas first
    canvas.setDimensions({ width: newWidth, height: newHeight });

    // scale all objects
    canvas.getObjects().forEach(obj => {
      // scale size
      obj.scaleX *= scaleX;
      obj.scaleY *= scaleY;

      // scale position
      obj.left *= scaleX;
      obj.top *= scaleY;

      obj.setCoords();
    });

    canvas.renderAll();
  }
};


    window.addEventListener('resize', handleResize);

    return () => {
      if (canvasRef.current) {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResize);
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  const toggleMoveMode = () => {
    const canvas = canvasRef.current;
    setIsMoving(!isMoving);

    if (!isMoving) {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'move';
      canvas.hoverCursor = 'move';
    } else {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'default';
    }
  };

  const toggleTool = (tool) => {
    const canvas = canvasRef.current;
    const isSameTool = activeTool === tool;

    setActiveTool(isSameTool ? null : tool);

    if (tool === "pen") {
      canvas.isDrawingMode = !isSameTool;
      if (!isSameTool) {
        const pen = new PencilBrush(canvas);
        pen.color = selectedColor;
        pen.width = 3;
        canvas.freeDrawingBrush = pen;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  };

  const addRect = () => {
    const canvas = canvasRef.current;
    const rect = new Rect({
      height: canvas.height / 4,
      width: canvas.width / 4,
      top: canvas.height * Math.random() - 40 > 0 ? canvas.height * Math.random() - 40 : canvas.height * Math.random(),
      left: canvas.width * Math.random() - 40 > 0 ? canvas.width * Math.random() - 40 : canvas.width * Math.random(),
      fill: "#000000",
    });

    rect.on("mousedown", (e) => {
      setSelectedShape(e.target);
    });
    canvas.add(rect);
  };

  const addCircle = () => {
    const canvas = canvasRef.current;
    const circle = new Circle({
      radius: 50,
      fill: "#000000",
      top: canvas.height * Math.random() - 40 > 0 ? canvas.height * Math.random() - 40 : canvas.height * Math.random(),
      left: canvas.width * Math.random() - 40 > 0 ? canvas.width * Math.random() - 40 : canvas.width * Math.random(),
    });
    circle.on("mousedown", (e) => {
      setSelectedShape(e.target);
    });
    canvas.add(circle);
  };

  const addTriangle = () => {
    const canvas = canvasRef.current;
    const triangle = new Triangle({
      width: 100,
      height: 100,
      fill: "#000000",
      top: canvas.height * Math.random() - 40 > 0 ? canvas.height * Math.random() - 40 : canvas.height * Math.random(),
      left: canvas.width * Math.random() - 40 > 0 ? canvas.width * Math.random() - 40 : canvas.width * Math.random(),
    });
    triangle.on("mousedown", (e) => {
      setSelectedShape(e.target);
    });
    canvas.add(triangle);
  };

  const addLine = () => {
    const canvas = canvasRef.current;
    const line = new Line([50, 50, 200, 200], {
      stroke: selectedColor,
      strokeWidth: 3,
      selectable: true,
      evented: true,
    });

    line.on("mousedown", (e) => {
      setSelectedShape(e.target);
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  };

  const addText = () => {
    const canvas = canvasRef.current;
    const text = new Textbox("Type here", {
      width: 200,
      fontSize: 24,
      fill: "#000000",
      left: canvas.width / 2 - 100,
      top: canvas.height / 2 - 50,
      selectable: true,        
      hasControls: true,   
    });

    text.on("mousedown", (e) => {
      setSelectedShape(e.target);
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.on("mousedblclick", () => {
      text.enterEditing();
      text.selectAll();
    });

    canvas.renderAll();
  };

  const deleteSelectedObject = () => {
    if (selectedShape && selectedShape !== "canvas") {
      const canvas = canvasRef.current;

      if (selectedShape.type === 'activeSelection') {
        // Delete all objects in the selection
        selectedShape.getObjects().forEach(obj => {
          canvas.remove(obj);
        });
      } else {
        // Delete single object
        canvas.remove(selectedShape);
      }

      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedShape(null);
      setShowDeleteButton(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) {
      return;
    }
    const dataURL = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  return (
    <motion.div initial={{ x: 1000 }} animate={{ x: 0, transition: { type: "easeInOut", duration:0.5 } }} className="w-screen h-screen relative flex ">
       {!open &&<FaBars onClick={()=>{
            setopen(true)
           }} className="absolute left-2 top-1 z-50" size={24} style={{ cursor: "pointer" }} />}
           
      {/* Left Sidebar */}
      {open&& <div className="w-[20vw] z-50 absolute h-full flex flex-col sm:relative justify-between items-center py-6 bg-gradient-to-b from-[#9491E2] to-[#A6D2DB] text-white shadow-lg">
             {/* Main Tools */}
             <div className="flex flex-col h-[45vh] items-center justify-evenly">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleMoveMode();
                 }}
                 className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${isMoving ? "bg-blue-600" : "bg-gray-800"
                   } shadow-md`}
               >
                 <FaHandPaper
                   className={`text-xl ${isMoving ? "text-white" : "text-gray-300"}`}
                 />
               </button>
     
               {/* Delete Button - Only show when an object is selected */}
               {showDeleteButton && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     deleteSelectedObject();
                   }}
                   className="p-3 rounded-xl transition-all duration-200 hover:bg-red-600 hover:scale-110 bg-gray-800 shadow-md"
                 >
                   <FaTrash className="text-xl text-gray-300" />
                 </button>
               )}
     
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleTool("shapes");
                 }}
                 className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${activeTool === "shapes" ? "bg-blue-600" : "bg-gray-800"
                   } shadow-md`}
               >
                 <FaShapes
                   className={`text-xl ${activeTool === "shapes" ? "text-white" : "text-gray-300"
                     }`}
                 />
               </button>
     
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleTool("pen");
                 }}
                 className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${activeTool === "pen" ? "bg-blue-600" : "bg-gray-800"
                   } shadow-md`}
               >
                 <CiPen
                   className={`text-xl ${activeTool === "pen" ? "text-white" : "text-gray-300"
                     }`}
                 />
               </button>
     
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   if (activeTool !== "text") {
                     setActiveTool("text");
                     addText();
                   } else {
                     setActiveTool(null);
                   }
                 }}
                 className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${activeTool === "text" ? "bg-blue-600" : "bg-gray-800"
                   } shadow-md`}
               >
                 <CiText
                   className={`text-xl ${activeTool === "text" ? "text-white" : "text-gray-300"
                     }`}
                 />
               </button>
     
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   handleDownload();
                 }}
                 className="p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 bg-gray-800 shadow-md"
               >
                 <FaDownload className="text-xl text-gray-300" />
               </button>
     
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                  setSave(true);
                 }}
                 className="p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 bg-gray-800 shadow-md"
               >
                 <FaSave className="text-xl text-gray-300" />
               </button>
             </div>
     
             {/* Color Picker */}
             <div className="  w-full h-[50vh] flex  justify-between ">
               <div className="w-full h-full flex justify-center  rounded-lg  overflow-visible">
                 <SketchPicker
                   className="w-full h-full "
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
                         canvas.renderAll();
                       } else {
                         selectedShape.set("fill", color.hex);
                       }
                       canvas.renderAll();
                     }
                   }}
                 />
               </div>
             </div>
           </div>}
{open && <FaTimes
            size={24}
            color="red"
            onClick={()=>{
            setopen(false)
            toggleTool(null)
           }} className="absolute  left-1 top-0.5 z-50"
            style={{ cursor: "pointer", position: "absolute", top: 10, right: 10 }}
          />}
      {/* Shapes Panel */}
      {activeTool === "shapes" && (
        <div className="w-20 h-full absolute right-0 z-50 sm:relative flex flex-col items-center justify-center gap-3 py-6 bg-gradient-to-b from-[#9491E2] to-[#A6D2DB] text-white ">
          <button
            onClick={addRect}
            className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${selectedShape?.type === "rect" ? "bg-blue-600" : "bg-gray-800"
              } shadow-md`}
          >
            <FaSquare
              className={`text-xl ${selectedShape?.type === "rect" ? "text-white" : "text-gray-300"
                }`}
            />
          </button>

          <button
            onClick={addCircle}
            className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${selectedShape?.type === "circle" ? "bg-blue-600" : "bg-gray-800"
              } shadow-md`}
          >
            <FaCircle
              className={`text-xl ${selectedShape?.type === "circle" ? "text-white" : "text-gray-300"
                }`}
            />
          </button>

          <button
            onClick={addTriangle}
            className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${selectedShape?.type === "triangle" ? "bg-blue-600" : "bg-gray-800"
              } shadow-md`}
          >
            <IoTriangle
              className={`text-xl ${selectedShape?.type === "triangle" ? "text-white" : "text-gray-300"
                }`}
            />
          </button>

          <button
            onClick={addLine}
            className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${selectedShape?.type === "line" ? "bg-blue-600" : "bg-gray-800"
              } shadow-md`}
          >
            <PiLineSegmentFill
              className={`text-xl ${selectedShape?.type === "line" ? "text-white" : "text-gray-300"
                }`}
            />
          </button>
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={boxRef}
        className="flex-1 w-[80vw] h-full flex relative justify-center items-end  bg-radial from-[#A2C2DD] to-[#9DB1DF]  p-2"
      >

        <motion.canvas initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="my-canvas" className="w-full md:scale-x-130 scale-y-100 scale-x-150  border-2 shadow-2xl rounded-xl" />

        {save && <SaveCanvas save={save} setSave={setSave} canvasData={canvasRef.current?.toJSON()} />}
      </div>
    </motion.div>
  )
}

export default CanvasComp
