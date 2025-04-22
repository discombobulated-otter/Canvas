import React, { useEffect, useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
const JoinCanvas = () => {
  const [canvasId, setCanvasId] = useState("");
  const navigate = useNavigate();

  // Simulate getting current user (adjust to your actual auth logic)
  const {user} = useUser(); // or get from Context/Redux

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true }); // Redirect to login if not logged in
    }
  }, [user, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (canvasId.trim()) {
      navigate(`/backendcanvas/${canvasId.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Join a Canvas</h1>
      <form onSubmit={handleJoin} className="flex flex-col space-y-4 w-80">
        <input
          type="text"
          placeholder="Enter Canvas ID"
          value={canvasId}
          onChange={(e) => setCanvasId(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default JoinCanvas;
