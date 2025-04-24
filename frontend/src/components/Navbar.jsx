import React, { useEffect, useState } from 'react';
import {
  RedirectToSignIn,
  SignedIn, SignedOut, SignInButton,
  useAuth, UserButton, useSession, useUser
} from "@clerk/clerk-react";
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import {  AnimatePresence } from 'framer-motion';
import Projects from './Projects';
import { motion } from 'framer-motion';
const NavBar = ({ save, setSave }) => {
  const { isSignedIn, getToken } = useAuth();
  const [showProjects, setShowProjects] = useState(false);
  const { user } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !user || !isSessionLoaded || !session) {
        return; // Don't proceed if user is not signed in
      }

      try {
        const token = await getToken(); // Use getToken() from useAuth()

        const payload = {
          id: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
        };
  
        const response=await axios.post(`${import.meta.env.VITE_API_URL}/api/user/sign`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response);
      } catch (err) {
        console.error("Failed to sync user:", err);
      }
    };

    syncUser();
  }, [isSignedIn, user, session, isSessionLoaded, getToken]);

  // Render the navbar with redirect if not signed in
  if (!isSignedIn) {
    return <RedirectToSignIn />; // Redirect user to sign-in if not signed in
  }

  return (
    <div className="fixed w-screen z-50 flex flex-col items-center">
      {/* Circle Button */}
      {!isOpen && (
        <button
          onClick={() => { 
            setIsOpen(true);
            setSave(false); 
          }}
          className="w-14 h-14 top-2 rounded-full bg-[#57B4BA] right-3 hover:bg-zinc-600 flex items-center justify-center absolute text-white shadow-lg"
        >
          ☰
        </button>
      )}

      {/* Expanding Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ width: 56, height: 56, borderRadius: '9999px', opacity: 0 }}
            animate={{
              width: '70vw',
              height: 'fit-content',
              borderRadius: '1rem',
              opacity: 1
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            dragElastic={0.2}
            exit={{
              width: 56,
              height: 56,
              borderRadius: '9999px',
              opacity: 0
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="mt-1 flex justify-between items-center bg-gradient-to-r from-[#486a87] via-[#2f5376] to-[#486a87] text-gray-200 text-2xl px-6 py-2 font-sans shadow-xl rounded-2xl max-w-[70vw] w-full"
          >
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} transition={{
              duration: 2
            }} className="flex gap-10 px-4 py-1">
              <NavLink to="/" onClick={() => { setShowProjects(false) }} className='hover:text-gray-200'>Home</NavLink>
              <div className="relative">
                <button
                  onClick={() => setShowProjects(!showProjects)} // Toggle dropdown visibility
                  className="hover:text-gray-200"
                >
                  Projects
                </button>
                {showProjects && (
                  <Projects setShowProjects={setShowProjects} />
                )}
              </div>
              <NavLink to='/canvas' onClick={() => { setShowProjects(false) }} className='hover:text-gray-200'>New Canvas</NavLink>
              <NavLink to='/joinCanvas' onClick={() => { setShowProjects(false) }} className='hover:text-gray-200'>Join Canvas</NavLink>
            </motion.div>
            <div className='flex items-center gap-4 px-4'>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSave(false);
                  setShowProjects(false);
                }}
                className="text-white text-xl hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavBar;
