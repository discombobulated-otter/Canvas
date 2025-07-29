import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { RedirectToSignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const Projects = () => {
  // const { isSignedIn, user, session, isLoaded: isSessionLoaded, getToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const syncUser = async () => {
  //     if (!isSignedIn || !user || !isSessionLoaded || !session) return;

  //     try {
  //       const token = await getToken();

  //       const payload = {
  //         id: user.id,
  //         name: user.fullName,
  //         email: user.primaryEmailAddress?.emailAddress,
  //         imageUrl: user.imageUrl,
  //       };

  //       // Sync user info
  //       await axios.post(`${import.meta.env.VITE_API_URL}/api/user/sign`, payload, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       // Fetch user projects
  //       const projectRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       setProjects(projectRes.data);
  //       setLoading(false);
  //     } catch (err) {
  //       console.error("Failed to sync user or fetch projects:", err);
  //       setLoading(false);
  //     }
  //   };

  //   syncUser();
  // }, [isSignedIn, user, session, isSessionLoaded, getToken]);

  // if (!isSignedIn) return <RedirectToSignIn />;

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#121212] flex items-center justify-center text-white text-2xl">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Your Projects</h1>

      {projects.length === 0 ? (
        <p className="text-gray-400">No projects found. Start by creating one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project._id || i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1e1e1e] p-6 rounded-xl shadow-md border border-[#2e2e2e] hover:border-[#7EA5F6]"
            >
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              <p className="text-sm text-gray-400 mb-2">{project.description || 'No description provided.'}</p>
              <p className="text-xs text-gray-500">Last updated: {new Date(project.updatedAt).toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
