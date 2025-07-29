import React, { useEffect, useState, useRef,useNavigate } from 'react';
import { motion } from 'framer-motion';

const Home = () => {
  const [hoveredBox, setHoveredBox] = useState(null);
  const navigate = useNavigate();
  const boxVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.6, ease: 'easeOut' },
    }),
  };

   const boxes = [
    {
      title: 'Create Canvas',
      description: 'Start a new project and bring your ideas to life.',
      url: '/create-canvas',
    },
    {
      title: 'Join Project',
      description: 'Collaborate with others in real-time.',
      url: '/canvas',
    },
    {
      title: 'Your Canvases',
      description: 'View and manage all your created canvases.',
      url: '/projects',
    },
  ];

  return (
    <div className="w-screen h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-5xl md:text-6xl font-bold mb-12"
      >
        Welcome to CollabCanvas
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {boxes.map((box, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={boxVariants}
             onClick={() => navigate(box.url)}
            className={`bg-[#1e1e1e] p-6 rounded-2xl shadow-lg border border-[#2e2e2e] transition-all duration-300 transform hover:scale-105 hover:border-[#7EA5F6] cursor-pointer ${hoveredBox === index ? 'bg-[#2a2a2a]' : ''}`}
            onMouseEnter={() => setHoveredBox(index)}
            onMouseLeave={() => setHoveredBox(null)}
          >
            <h2 className="text-2xl font-semibold mb-2">{box.title}</h2>
            <p className="text-gray-400">{box.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
