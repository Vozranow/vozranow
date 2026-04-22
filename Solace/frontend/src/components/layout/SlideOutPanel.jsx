import { X } from "lucide-react";

const SlideOutPanel = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-end bg-[#2D2A26]/20 backdrop-blur-sm transition-opacity">
      {/* Background click handler to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white h-full w-full max-w-md shadow-2xl animate-in slide-in-from-right overflow-y-auto relative z-10">
        <div className="p-6 border-b border-[#E8E6E1] flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <h3 className="text-lg font-bold text-[#173F3A] font-serif">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F1F0EC] rounded-full text-[#8C877D] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* The dynamic content gets injected here */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SlideOutPanel;