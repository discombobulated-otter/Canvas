import React, { useEffect, useRef, useState } from "react";
import { Canvas, Rect, Circle, Triangle, Line, Textbox, PencilBrush, ActiveSelection } from "fabric";
import { CiPen, CiText } from "react-icons/ci";
import { FaCircle, FaShapes, FaSquare, FaHandPaper, FaDownload, FaTrash, FaSave, FaTimes, FaBars } from "react-icons/fa";
import { IoTriangle } from "react-icons/io5";
import { PiLineSegmentFill } from "react-icons/pi";
import { SketchPicker } from "react-color";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import SaveCanvas from "./SaveCanvas.jsx";
import { useSocket } from "../contextProvider/SocketProvider.jsx";

const JoinCanvas = ({ save, setSave }) => {
  const socket = useSocket();
  const { userId, projectId } = useParams();
  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [loadingCanvas, setloadingCanvas] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [selectedShape, setSelectedShape] = useState(null);
  const [open, setopen] = useState(false)
  const [isMoving, setIsMoving] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();
   const toggleMoveMode = () => {
       const canvas = canvasRef.current;
       setIsMoving(!isMoving);
       if (!isMoving) {
         canvas.isDrawingMode = false;
         canvas.selection = false;
         canvas.defaultCursor = "move";
         canvas.hoverCursor = "move";
       } else {
         canvas.selection = true;
         canvas.defaultCursor = "default";
         canvas.hoverCursor = "default";
       }
     };
   
     const toggleTool = (tool) => {
       const canvas = canvasRef.current;
       const isSame = activeTool === tool;
       setActiveTool(isSame ? null : tool);
       if (tool === "pen") {
         canvas.isDrawingMode = !isSame;
         if (!isSame) {
           const brush = new PencilBrush(canvas);
           brush.color = selectedColor;
           brush.width = 3;
           canvas.freeDrawingBrush = brush;
         }
       } else {
         canvas.isDrawingMode = false;
       }
     };
   
     const addRect = () => {
       const canvas = canvasRef.current;
       const rect = new Rect({
         width: canvas.width / 4,
         height: canvas.height / 4,
         left: Math.random() * (canvas.width - canvas.width / 4),
         top: Math.random() * (canvas.height - canvas.height / 4),
         fill: selectedColor,
       });
       rect.on("mousedown", (e) => setSelectedShape(e.target));
       canvas.add(rect);
     };
   
     const addCircle = () => {
       const canvas = canvasRef.current;
       const circle = new Circle({
         radius: 50,
         left: Math.random() * (canvas.width - 100),
         top: Math.random() * (canvas.height - 100),
         fill: selectedColor,
       });
       circle.on("mousedown", (e) => setSelectedShape(e.target));
       canvas.add(circle);
     };
   
     const addTriangle = () => {
       const canvas = canvasRef.current;
       const tri = new Triangle({
         width: 100,
         height: 100,
         left: Math.random() * (canvas.width - 100),
         top: Math.random() * (canvas.height - 100),
         fill: selectedColor,
       });
       tri.on("mousedown", (e) => setSelectedShape(e.target));
       canvas.add(tri);
     };
   
     const addLine = () => {
       const canvas = canvasRef.current;
       const line = new Line([50, 50, 200, 200], { stroke: selectedColor, strokeWidth: 3 });
       line.on("mousedown", (e) => setSelectedShape(e.target));
       canvas.add(line);
       canvas.setActiveObject(line);
     };
   
     const addText = () => {
       const canvas = canvasRef.current;
       const text = new Textbox("Type here", {
         left: canvas.width / 2 - 100,
         top: canvas.height / 2 - 50,
         width: 200,
         fontSize: 24,
         fill: selectedColor,
       });
       text.on("mousedown", (e) => setSelectedShape(e.target));
       text.on("mousedblclick", () => { text.enterEditing(); text.selectAll(); });
       canvas.add(text);
       canvas.setActiveObject(text);
     };
   
     const deleteSelectedObject = () => {
       const canvas = canvasRef.current;
       if (!selectedShape || selectedShape === "canvas") return;
       if (selectedShape.type === "activeSelection") {
         selectedShape.getObjects().forEach(obj => canvas.remove(obj));
       } else {
         canvas.remove(selectedShape);
       }
       canvas.discardActiveObject();
       canvas.requestRenderAll();
       setSelectedShape(null);
       setShowDeleteButton(false);
     };
   
     const handleDownload = () => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
       const link = document.createElement("a");
       link.href = dataURL;
       link.download = "canvas.png";
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     };
const onCanvasEdit = async () => {
      if (!canvasRef.current) return;
      const jsonData = canvasRef.current.toJSON();
      socket?.emit("canvas-edit", {
        projectId,
        canvasData: jsonData,
      });
    };
  // Initialize canvas only once
   useEffect(() => {
    if (!boxRef.current) return;

    const boxW = boxRef.current.clientWidth;
    const boxH = boxRef.current.clientHeight;
    const width = boxW * 0.6;
    const height = boxH * 0.9;

    const canvas = new Canvas("main-canvas", {
      width,
      height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
      isDrawingMode: false,
    });
    canvasRef.current = canvas;

    // Set up canvas event listeners
    

    ["object:added", "object:modified", "object:removed", "object:scaled", "object:moved", "object:rotated"].forEach(eventName => {
      canvas.on(eventName, onCanvasEdit);
    });

    canvas.on("mouse:down", function (options) {
      if (options.target) {
        const activeObject = canvas.getActiveObject();
        if (options.e.shiftKey) {
          if (activeObject) {
            if (activeObject.type === 'activeSelection') {
              activeObject.addWithUpdate(options.target);
            } else {
              const sel = new ActiveSelection([activeObject, options.target], {
                canvas: canvas
              });
              canvas.setActiveObject(sel);
            }
          } else {
            canvas.setActiveObject(options.target);
          }
        } else {
          canvas.setActiveObject(options.target);
        }
        setSelectedShape(canvas.getActiveObject());
        setShowDeleteButton(true);
      } else {
        canvas.discardActiveObject();
        setSelectedShape(null);
        setShowDeleteButton(false);
      }
      canvas.requestRenderAll();
    });

    canvas.on("selection:cleared", () => {
      setSelectedShape(null);
      setShowDeleteButton(false);
    });

    canvas.on("selection:created", (e) => {
      setSelectedShape(e.target);
      setShowDeleteButton(true);
    });

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

    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShape) {
        deleteSelectedObject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
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

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [projectId]);

  // Fetch initial canvas data
  useEffect(() => {
    if (!userId || !projectId || !user) return;

    const fetchCanvas = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/canvas/${userId}/${projectId}/join`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (res.data.success && res.data.canvas.canvasData) {
          const parsed = JSON.parse(res.data.canvas.canvasData);
          if (canvasRef.current) {
            canvasRef.current.loadFromJSON(parsed, () => {
              canvasRef.current.requestRenderAll();
            });
          }
          setloadingCanvas(true)
        }
      } catch (err) {
        console.error("Error fetching canvas:", err);
      }
    };
    fetchCanvas();
  }, [user, userId, projectId, getToken]);

  // Handle real-time canvas updates
useEffect(() => {
  if (!socket) return;

  const handleCanvasUpdate = (data) => {
    if (!canvasRef.current) return;
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      canvasRef.current.loadFromJSON(parsed, () => {
        canvasRef.current.requestRenderAll();
      });
    } catch (err) {
      console.error("Failed to parse canvas update:", err);
    }
  };

  socket.on("receive-canvas-update", handleCanvasUpdate);

  return () => {
    socket.off("receive-canvas-update", handleCanvasUpdate);
  };
}, [socket]);
 

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedShape) {
        deleteSelectedObject();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedShape]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !boxRef.current) return;
      const boxW = boxRef.current.clientWidth;
      const boxH = boxRef.current.clientHeight;
      canvasRef.current.setDimensions({ width: boxW * 0.6, height: boxH * 0.9 });
      canvasRef.current.requestRenderAll();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  

  return (
      <div className="w-screen h-screen relative flex bg-gray-100">
     {!open &&<FaBars onClick={()=>{
      setopen(true)
     }} className="absolute left-2 top-1 z-50" size={24} style={{ cursor: "pointer" }} />}
     {open && <FaTimes
      size={24}
      onClick={()=>{
      setopen(false)
     }} className="absolute   z-50"
    />}
      {/* Left Sidebar */}
     {open&& <div className="w-[20vw] z-30 absolute h-full flex flex-col sm:relative justify-between items-center py-6 bg-gradient-to-b from-[#9491E2] to-[#A6D2DB] text-white shadow-lg">
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

      {/* Shapes Panel */}
      {activeTool === "shapes" && (
        <div className="w-20 z-50 right-0 absolute h-full sm:relative flex flex-col items-center justify-center gap-3 py-6 bg-gradient-to-b from-[#9491E2] to-[#A6D2DB] text-white ">
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
        className="flex-1 w-[80vw] h-full flex relative justify-center items-end  bg-radial from-[#A2C2DD] to-[#9DB1DF] p-2"
      >
       
          <canvas id="main-canvas" className=" rounded-xl md:scale-x-130 scale-y-100 scale-x-150 z-20 sm:relative  absolute right-0" />
     
      {save&&<SaveCanvas save={save} setSave={setSave} canvasData={ canvasRef.current?.toJSON()}/>}
      </div>
       
    </div>
  );
};

export default JoinCanvas;