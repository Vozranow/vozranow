import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] selection:bg-[#173F3A] selection:text-white relative overflow-hidden flex flex-col">
      
      {/* Background Ambient Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#173F3A]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#A3C6C0]/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-[60px] pointer-events-none"></div>

      {/* Minimal Header */}
      <header className="relative z-10 w-full px-6 md:px-12 h-20 flex items-center">
        <div className="font-serif text-2xl font-bold text-[#173F3A] tracking-tight">
          Vozranow.
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center -mt-16">
        
        {/* Icon with subtle pulse */}
        <div className="w-24 h-24 bg-white border-2 border-[#E8E6E1] text-[#173F3A] rounded-2xl flex items-center justify-center shadow-sm mb-10 animate-pulse">
          <AlertCircle size={48} strokeWidth={1.5} />
        </div>

        {/* 404 Typography */}
        <div className="mb-8">
          <h1 className="font-serif text-[7rem] md:text-[9rem] leading-none font-bold text-[#173F3A] mb-2">
            404
          </h1>
          <div className="h-[2px] w-24 bg-[#173F3A]/20 mx-auto"></div>
        </div>
        
        {/* Message Content */}
        <div className="space-y-4 max-w-lg mx-auto mb-12">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#2D2A26]">
            Page Not Found
          </h2>
          <p className="text-[#8C877D] leading-relaxed text-base max-w-md mx-auto">
            We couldn't find the page you're looking for. It may have been moved or no longer exists.
          </p>
        </div>

        {/* Action Button */}
        <Link 
          to="/"
          className="group inline-flex items-center gap-2.5 rounded-full bg-[#173F3A] px-8 py-3.5 text-white shadow-lg shadow-[#173F3A]/15 transition-all duration-200 hover:bg-[#0F2926] hover:shadow-xl hover:shadow-[#173F3A]/25 active:scale-95"
        >
          <Home size={18} strokeWidth={2} className="transition-transform group-hover:scale-110" />
          <span className="font-semibold text-sm tracking-wide">
            Return Home
          </span>
        </Link>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 md:px-12 h-16 flex items-center justify-center text-sm text-[#8C877D]">
        Error 404 • Page Not Found
      </footer>
      
    </div>
  );
};

export default NotFoundPage;