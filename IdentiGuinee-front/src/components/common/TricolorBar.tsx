import React from 'react';

const TricolorBar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-2 flex z-[100]">
      <div className="h-full flex-1 bg-[#ce1126]"></div>
      <div className="h-full flex-1 bg-[#fcd116]"></div>
      <div className="h-full flex-1 bg-[#009460]"></div>
    </div>
  );
};

export default TricolorBar;
