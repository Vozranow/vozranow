import { X } from "lucide-react";

const ActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  subtitle, 
  description, 
  icon: Icon, 
  confirmText = "Confirm", 
  confirmColor = "bg-[#173F3A] hover:bg-[#112F2A]", 
  iconColor = "bg-[#E8F4F1] text-[#173F3A]",
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D2A26]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className={`p-3 rounded-full ${iconColor}`}>
                <Icon size={24} />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-[#2D2A26]">{title}</h3>
              {subtitle && <p className="text-sm font-medium text-[#8C877D] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="text-[#8C877D] hover:text-[#2D2A26] transition-colors p-1">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-[#5C5954] text-sm leading-relaxed mb-8">
          {description}
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#5C5954] bg-[#F1F0EC] hover:bg-[#E8E6E1] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-md flex items-center gap-2 ${confirmColor} disabled:opacity-70`}
          >
            {isProcessing ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;