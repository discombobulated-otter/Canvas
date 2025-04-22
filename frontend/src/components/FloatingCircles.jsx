import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const FloatingDot = () => {
  const controls = useAnimation();

  const animateRandomly = () => {
    const randomSize = 20 + Math.random() * 80; // size: 20–100px
    const randomX = Math.min( window.innerWidth - randomSize,Math.random() * (window.innerWidth - randomSize));
    const randomY = Math.random() * (window.innerHeight - randomSize);
    const randomDuration = 3 + Math.random() * 6; // 3–5 seconds

    controls.start({
      x: randomX,
      y: randomY,
      width: randomSize,
      height: randomSize,
      transition: {
        duration: randomDuration,
        ease: "easeInOut", // smooth start/end
      },
    }).then(() => {
      animateRandomly(); // loop for continuous motion
    });
  };

  useEffect(() => {
    animateRandomly();
  }, []);

  return (
    <motion.div
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        width: 50,
        height: 50,
      }}  cl={{ shadow:3 }}
      animate={controls}
      className="rounded-full bg-red-600 "
    />
  );
};

export default FloatingDot;
