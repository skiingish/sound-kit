import React, { useState } from 'react';
import * as motion from 'motion/react-client';

const ButtonPad = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <div className='flex justify-around items-center h-screen m-0 bg-gradient-to-r from-[#2e2c2d] to-[#424043]'>
      <motion.button
        className={`relative w-40 h-40 rounded-[15%] outline-none border-4 border-[#090909] text-[#a6a6a6] 
        bg-gradient-to-br from-[#171717] to-[#444245]`}
        onClick={handleClick}
        animate={{
          boxShadow: isClicked
            ? 'inset -2px -2px 0px #5e5e5e, inset 2px 2px 0px #1c1c1c'
            : 'inset 2px 2px 0px #7d7c7e, inset -2px -2px 0px #1c1c1c',
          backgroundImage: isClicked
            ? 'linear-gradient(to bottom right, #131313, #444245)'
            : 'linear-gradient(to bottom right, #171717, #444245)',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        <motion.span
          className='text-lg relative z-10'
          animate={{ scale: isClicked ? 0.95 : 1 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 15,
          }}
        >
          {isClicked ? 'Clicked!!' : 'Click Me'}
        </motion.span>
        <motion.div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          w-[7.25em] h-[7.25em] bg-gradient-to-br from-[#262626] to-[#606060] 
          rounded-[inherit] -z-10'
          animate={{
            boxShadow: isClicked
              ? '5px 5px 15px #141414, -5px -5px 15px #525252'
              : '11px 11px 22px #141414, -11px -11px 22px #525252',
            scale: isClicked ? 0.97 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        ></motion.div>
      </motion.button>
    </div>
  );
};

export default ButtonPad;
