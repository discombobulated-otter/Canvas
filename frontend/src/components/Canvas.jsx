import { useEffect, useRef, useState } from "react";
import {
    Canvas,
    Rect,
    Circle,
    Triangle,
    Line,
    Textbox,
    PencilBrush,
    ActiveSelection,
} from "fabric";
import SaveCanvas from "./SaveCanvas.jsx";
import { motion } from "framer-motion";
import CanvasSidebar from "./CanvasSideBar.jsx";
import ShapeMenu from "./ShapeMenu.jsx";

const CanvasComp = ({ save, setSave }) => {
    const canvasRef = useRef(null);
    const miniMapRef = useRef(null);
    const [activeTool, setActiveTool] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [selectedShape, setSelectedShape] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const boxRef = useRef();
    const defaultColor = "#ffffff"; // White for black background

    const updateMiniMap = () => {
        const canvas = canvasRef.current;
        const miniCanvas = miniMapRef.current;
        if (!canvas || !miniCanvas) return;

        const miniCtx = miniCanvas.getContext("2d");
        const scale = 0.15;
        miniCanvas.width = canvas.width * scale;
        miniCanvas.height = canvas.height * scale;

        const dataURL = canvas.toDataURL({
            format: "png",
            quality: 0.5,
            multiplier: scale,
        });

        const img = new Image();
        img.onload = () => {
            miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
            miniCtx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    };

    useEffect(() => {
        const box = boxRef.current;
        const canvasWidth = box.clientWidth;
        const canvasHeight = box.clientHeight;

        const canvas = new Canvas("my-canvas", {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: "rgb(26, 26, 26)",
            isDrawingMode: false,
            preserveObjectStacking: true,
            selection: true,
        });

        canvasRef.current = canvas;

        canvas.on("mouse:wheel", function (opt) {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            zoom = Math.min(Math.max(zoom, 0.2), 5);
            const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
            canvas.zoomToPoint(point, zoom);
            setZoomLevel(zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            updateMiniMap();
        });

        let isDragging = false;
        let lastPosX, lastPosY;

        canvas.on("mouse:down", function (opt) {
            if (opt.e.ctrlKey === true) {
                isDragging = true;
                canvas.selection = false;
                lastPosX = opt.e.clientX;
                lastPosY = opt.e.clientY;
            }
        });

        canvas.on("mouse:move", function (opt) {
            if (isDragging) {
                const e = opt.e;
                const vpt = canvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
                updateMiniMap();
            }
        });

        canvas.on("mouse:up", function () {
            isDragging = false;
            canvas.selection = true;
        });

        canvas.on("mouse:down", (options) => {
            // If in drawing mode, don't interfere with drawing
            if (canvas.isDrawingMode) {
                return;
            }

            if (options.target) {
                const activeObject = canvas.getActiveObject();

                if (options.e.shiftKey) {
                    if (activeObject) {
                        if (activeObject.type === "activeSelection") {
                            activeObject.addWithUpdate(options.target);
                        } else {
                            const sel = new ActiveSelection(
                                [activeObject, options.target],
                                { canvas }
                            );
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
            updateMiniMap();
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
            updateMiniMap();
        });

        // Add event listener for when drawing paths are completed
        canvas.on("path:created", (e) => {
            const path = e.path;
            path.set({
                stroke: "#ffffff", // Ensure drawn paths are white
                strokeWidth: 3,
            });
            canvas.renderAll();
            updateMiniMap();
        });

        const handleKeyDown = (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && selectedShape) {
                deleteSelectedObject();
            }
            if (e.key === "r") {
                resetZoom();
            }
            if (e.key === "Escape" && canvas.isDrawingMode) {
                exitDrawingMode();
            }
        };

        const handleResize = () => {
            if (canvasRef.current && boxRef.current) {
                const canvas = canvasRef.current;
                const newWidth = boxRef.current.clientWidth;
                const newHeight = boxRef.current.clientHeight;
                const scaleX = newWidth / canvas.getWidth();
                const scaleY = newHeight / canvas.getHeight();
                canvas.setDimensions({ width: newWidth, height: newHeight });

                canvas.getObjects().forEach((obj) => {
                    obj.scaleX *= scaleX;
                    obj.scaleY *= scaleY;
                    obj.left *= scaleX;
                    obj.top *= scaleY;
                    obj.setCoords();
                });

                canvas.renderAll();
                updateMiniMap();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleResize);

        updateMiniMap();

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleResize);
            canvas.dispose();
            canvasRef.current = null;
        };
    }, []);

    const toggleMoveMode = () => {
        const canvas = canvasRef.current;
        setIsMoving(!isMoving);

        if (!isMoving) {
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = "move";
            canvas.hoverCursor = "move";
            setActiveTool("move");
        } else {
            canvas.selection = true;
            canvas.defaultCursor = "default";
            canvas.hoverCursor = "default";
            setActiveTool(null);
        }
    };

    const handlePenTool = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setActiveTool("pen");
        canvas.isDrawingMode = true;
        canvas.selection = false; // Disable selection while drawing
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.color = "#ffffff"; // White color for black background
        canvas.freeDrawingBrush.width = 3; // Slightly thicker for better visibility
        
        // Update cursor
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
    };

    const exitDrawingMode = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "default";
        setActiveTool(null);
    };

    const resetZoom = () => {
        const canvas = canvasRef.current;
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.setZoom(1);
        setZoomLevel(1);
        canvas.renderAll();
        updateMiniMap();
    };

    const addRect = () => {
        const canvas = canvasRef.current;
        const rect = new Rect({
            height: 150,
            width: 200,
            top: canvas.height * Math.random(),
            left: canvas.width * Math.random(),
            fill: defaultColor,
        });
        rect.on("mousedown", (e) => setSelectedShape(e.target));
        canvas.add(rect);
        updateMiniMap();
    };

    const addCircle = () => {
        const canvas = canvasRef.current;
        const circle = new Circle({
            radius: 50,
            fill: defaultColor,
            top: canvas.height * Math.random(),
            left: canvas.width * Math.random(),
        });
        circle.on("mousedown", (e) => setSelectedShape(e.target));
        canvas.add(circle);
        updateMiniMap();
    };

    const addTriangle = () => {
        const canvas = canvasRef.current;
        const triangle = new Triangle({
            width: 100,
            height: 100,
            fill: defaultColor,
            top: canvas.height * Math.random(),
            left: canvas.width * Math.random(),
        });
        triangle.on("mousedown", (e) => setSelectedShape(e.target));
        canvas.add(triangle);
        updateMiniMap();
    };

    const addLine = () => {
        const canvas = canvasRef.current;
        const line = new Line([50, 50, 200, 200], {
            stroke: "#ffffff", // White line for black background
            strokeWidth: 3,
            selectable: true,
            evented: true,
        });
        line.on("mousedown", (e) => setSelectedShape(e.target));
        canvas.add(line);
        canvas.setActiveObject(line);
        canvas.renderAll();
        updateMiniMap();
    };

    const addText = () => {
        const canvas = canvasRef.current;
        const text = new Textbox("Type here", {
            width: 200,
            fontSize: 24,
            fill: "#ffffff", // White text for black background
            left: canvas.width / 2 - 100,
            top: canvas.height / 2 - 50,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            borderColor: "#ffffff",
            cornerColor: "#ffffff",
            cornerSize: 6,
            transparentCorners: false,
        });

        text.on("mousedown", (e) => setSelectedShape(e.target));
        text.on("mousedblclick", () => {
            text.enterEditing();
            text.selectAll();
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        updateMiniMap();
    };

    const deleteSelectedObject = () => {
        const canvas = canvasRef.current;
        if (selectedShape && selectedShape !== "canvas") {
            if (selectedShape.type === "activeSelection") {
                selectedShape.getObjects().forEach((obj) => canvas.remove(obj));
            } else {
                canvas.remove(selectedShape);
            }
            canvas.discardActiveObject();
            canvas.renderAll();
            setSelectedShape(null);
            setShowDeleteButton(false);
            updateMiniMap();
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: "png",
            quality: 1,
        });
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "canvas.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-screen h-screen flex overflow-hidden bg-gray-900 relative">
            <CanvasSidebar
                canvasRef={canvasRef}
                selectedShape={selectedShape}
                setSelectedShape={setSelectedShape}
                setActiveTool={setActiveTool}
                activeTool={activeTool}
                isMoving={isMoving}
                toggleMoveMode={toggleMoveMode}
                handleDownload={handleDownload}
                setSave={setSave}
                deleteSelectedObject={deleteSelectedObject}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                showDeleteButton={showDeleteButton}
                addRect={addRect}
                addCircle={addCircle}
                addTriangle={addTriangle}
                addLine={addLine}
                addText={addText}
                handlePenTool={handlePenTool}
                exitDrawingMode={exitDrawingMode}
            />

            <div ref={boxRef} className="flex-1 relative bg-gray-800">
                <motion.canvas
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    id="my-canvas"
                    className="absolute top-0 left-0 w-full h-full"
                />

                {selectedShape && (
                    <ShapeMenu
                        canvasRef={canvasRef}
                        selectedShape={selectedShape}
                    />
                )}

                <canvas
                    ref={miniMapRef}
                    className="absolute bottom-4 right-4 w-40 h-40 border border-gray-400 bg-gray shadow-md rounded"
                />

                {save && (
                    <SaveCanvas
                        save={save}
                        setSave={setSave}
                        canvasData={canvasRef.current?.toJSON()}
                    />
                )}
            </div>
        </div>
    );
};

export default CanvasComp;