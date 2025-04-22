import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const SaveCanvas = ({ canvasData, setSave }) => {
  const { getToken } = useAuth();
  const [name, setName] = useState("");

  const handleSave = async () => {
    try {
      const token = await getToken();
      console.log(token)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/add-canvas`,
        {
          canvasData,
          name, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        console.log('Canvas saved:', response.data);
      }
    } catch (error) {
      console.error('Error saving canvas:', error);
    } finally {
      setSave(false);
    }
  };

  return (
    <div className='h-full w-full  absolute backdrop-blur-3xl  bg-gray-300'>
<div className='w-[40%] h-[40%] bg-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-4 p-4 rounded-md'>
      <h1 className="text-white text-xl font-semibold">Save Canvas</h1>
      <input
        type="text"
        placeholder='Enter project name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 rounded-md active:bg-white"
        
      />
      <div className='w-full flex justify-between gap-4'>
        <button
          className='bg-red-500 text-white px-4 py-2 rounded-md'
          onClick={() => setSave(false)}
        >
          Cancel
        </button>
        <button
          className='bg-green-500 text-white px-4 py-2 rounded-md'
          onClick={handleSave}
          disabled={!name.trim()}
        >
          Save
        </button>
      </div>
    </div>
    </div>
  );
};

export default SaveCanvas;
