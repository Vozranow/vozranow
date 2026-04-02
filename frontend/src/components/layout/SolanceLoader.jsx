import { Loader2 } from "lucide-react";

const SolanceLoader = ({ text }) => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[#FDFCF8] gap-3">
      <Loader2 size={40} className="animate-spin text-[#173F3A]" />
      {/* Optional text that pulses beautifully underneath the spinner */}
      {text && (
        <p className="text-[#173F3A] font-medium text-sm animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};

export default SolanceLoader;