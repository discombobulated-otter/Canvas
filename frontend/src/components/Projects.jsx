import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";

const Projects = ({ setShowProjects }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);  // to show a loading state
  const [error, setError] = useState(null);      // for error messages
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Fetch the projects once the user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });  // Redirect if no user
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      const token = await getToken(); // Fetch token
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/canvas/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,  // or use Clerk's token
          },
          withCredentials: true,
        });
        
        if (response.data.success) {
          setProjects(response.data.canvases);  // Set projects data
        } else {
          setError("No canvases found");  // Handle no canvases response
        }
      } catch (err) {
        setError("Error fetching projects: " + err.message);  // Handle errors
      } finally {
        setLoading(false);  // Stop loading
      }
    };

    fetchProjects();  // Trigger fetching
  }, [user, getToken, navigate]);

  return (
    <div className="absolute top-3 right-8 mt-2 bg-[#DCE4C9] sm:left-0 sm:bottom-0 sm:top-10  opacity-85 md:h-[50vh] overflow-y-scroll  text-xs md:text-lg font-[boldonse] text-white px-2 pt-1 rounded-md  shadow-lg w-[20vw] h-[30vh] ">
      {loading && <p className=" text-xs md:text-lg px-2 text-zinc-800">Loading...</p>}
      {error && <p className=" text-xs md:text-lgpx-2 text-red-500">{error}</p>}
      {projects.length > 0 ? (
        projects.map((project) => (
          <NavLink
            key={project._id}
            to={`/project/${project._id}`}
            className="block mt-2 hover:bg-[#54B6CA] text-zinc-800 px-2"
            onClick={() => setShowProjects(false)}>
            {project.name}
          </NavLink>
        ))
      ) : (
        !loading && <p className="text-sm px-2 text-zinc-700">No projects found</p>
      )}
    </div>
  );
};

export default Projects;
