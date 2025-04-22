import React, { useEffect, useState, useRef } from 'react';
import { easeInOut, motion } from 'framer-motion';

const Home = () => {
  const createVariants = {
    hidden: { y: 1000, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
  };

  const builtVariants = {
    hidden: { y: 1000, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, ease: 'easeOut', delay: 1 } },
  };

  const shareVariants = {
    hidden: { y: 1000, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, ease: 'easeOut', delay: 2 } },
  };

  // State to manage text colors
  const [textColors, setTextColors] = useState({
    create: 'white',
    built: 'white',
    share: 'white',
  });

  // Refs for text elements, circle, and rectangle
  const createRef = useRef(null);
  const builtRef = useRef(null);
  const shareRef = useRef(null);
  const circleRef = useRef(null);
  const rectangleRef = useRef(null);

  // Function to check if an element overlaps with a text element
  const checkOverlap = () => {
    const newColors = { create: 'white', built: 'white', share: 'white' };

    // Check overlap for circle (black) and rectangle (red)
    [createRef, builtRef, shareRef].forEach((ref, index) => {
      if (ref.current) {
        const textRect = ref.current.getBoundingClientRect();
        const key = ['create', 'built', 'share'][index];

        // Check circle overlap
        if (circleRef.current) {
          const circleRect = circleRef.current.getBoundingClientRect();
          const circleOverlapping =
            circleRect.left < textRect.right &&
            circleRect.right > textRect.left &&
            circleRect.top < textRect.bottom &&
            circleRect.bottom > textRect.top;

          if (circleOverlapping) {
            newColors[key] = 'black';
          }
        }

        // Check rectangle overlap (prioritizes red if both overlap)
        if (rectangleRef.current) {
          const rectangleRect = rectangleRef.current.getBoundingClientRect();
          const rectangleOverlapping =
            rectangleRect.left < textRect.right &&
            rectangleRect.right > textRect.left &&
            rectangleRect.top < textRect.bottom &&
            rectangleRect.bottom > textRect.top;

          if (rectangleOverlapping) {
            newColors[key] = 'red';
          }
        }
      }
    });

    setTextColors(newColors);
  };

  // Run overlap check on animation frame
  useEffect(() => {
    const handleAnimationFrame = () => {
      checkOverlap();
      requestAnimationFrame(handleAnimationFrame);
    };
    const animationFrameId = requestAnimationFrame(handleAnimationFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <motion.div
    initial={{ x: 0, opacity: 1 }}
    exit={{ x: -1000 }}
    transition={{ duration: 0.5, type: 'easeInOut' }}
      className="w-screen h-screen relative flex items-center overflow-hidden bg-gradient-to-r from-[#7EA5F6] to-[#8CCEF5] font-[boldonse]"
    >
      <motion.div
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
        className="flex absolute z-20 flex-col gap-10 w-1/2 pl-28 py-10 font-bold text-7xl"
      >
        <motion.div
          ref={createRef}
          className="text-white"
          style={{ color: textColors.create }}
          initial="hidden"
          animate="visible"
          variants={createVariants}
        >
          create
        </motion.div>
        <motion.div
          ref={builtRef}
          className="text-white"
          style={{ color: textColors.built }}
          initial="hidden"
          animate="visible"
          variants={builtVariants}
        >
          built
        </motion.div>
        <motion.div
          ref={shareRef}
          className="text-white"
          style={{ color: textColors.share }}
          initial="hidden"
          animate="visible"
          variants={shareVariants}
        >
          share
        </motion.div>
      </motion.div>

      {/* Animated Circle (Black Text Effect) */}
      <motion.div
        ref={circleRef}
        initial={{ x: 0, y: 100 }}
        animate={{
          x: ['0%', '200%', '700%', '500%', '0%'],
          y: ['0%', '200%', '300%', '200%', '0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="w-20 h-20 rounded-full overflow-hidden absolute justify-end items-center bg-[#D9EDBF] z-10"
      />

      {/* Animated Rectangle (Red Text Effect) */}
      <motion.div
        ref={rectangleRef}
        initial={{ x: 0, y: 0 }}
        animate={{
          x: ['0%', '200%', '700%', '500%', '0%'],
          y: ['0%', '-500%', '-300%', '-200%', '0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="w-20 h-20 rounded-full overflow-hidden absolute justify-end items-center bg-[#FF6347] z-10 opacity-50"
      />
    </motion.div>
  );
};

export default Home;