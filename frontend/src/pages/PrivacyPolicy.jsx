import { Link } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

const PRIVACY_DATA = [
  "Vozranow collects user information such as name, email, contact details, and account activity during registration and platform usage.",
  "The platform collects transactional data including wallet activity, payments, and session bookings for operational and record-keeping purposes.",
  "Vozranow may collect technical data such as IP address, device information, and usage logs to improve platform performance and security.",
  "User information is used to provide services, manage sessions, process payments, and ensure smooth platform functionality.",
  "Vozranow does not sell or rent user personal data to third parties.",
  "User data may be shared with trusted third-party services such as payment gateways only for transaction processing and system operations.",
  "The platform may monitor or store session-related data, including logs or recordings, for quality control, safety, and dispute resolution.",
  "Vozranow implements reasonable security measures to protect user data from unauthorized access, misuse, or disclosure.",
  "Users have the right to access, update, or request deletion of their personal data, subject to legal and operational requirements.",
  "Vozranow reserves the right to update this Privacy Policy at any time, and continued use of the platform implies acceptance of the updated policy."
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] selection:bg-[#173F3A] selection:text-white">
      
      {/* 🟢 WIDENED HEADER: Pinned strictly to Left and Right edges */}
      <header className="sticky top-0 z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-[#E8E6E1]">
        <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E6E1] hover:bg-gray-50 rounded-full text-[#5C5954] hover:text-[#173F3A] transition-all font-medium text-sm shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="font-serif text-2xl font-bold text-[#173F3A] tracking-tight">
            Vozranow.
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        
        {/* Title Area */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
          <div className="w-16 h-16 bg-[#E8F4F1] text-[#173F3A] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#173F3A] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[#8C877D] font-medium tracking-wide uppercase text-sm flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Last Updated: April 2026
          </p>
        </div>

        {/* The Rules List */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#E8E6E1]">
          <div className="space-y-8">
            {PRIVACY_DATA.map((policy, index) => (
              <div key={index} className="flex gap-6 group">
                
                {/* Custom Number Styling */}
                <div className="shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#F4F7F6] border border-[#E8E6E1] text-[#173F3A] flex items-center justify-center text-sm font-bold group-hover:bg-[#173F3A] group-hover:text-white group-hover:border-[#173F3A] transition-all duration-300">
                    {index + 1}
                  </div>
                </div>
                
                {/* Policy Text */}
                <p className="text-[15px] md:text-base text-[#5C5954] leading-relaxed pt-1">
                  {policy}
                </p>
                
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Contact / Acknowledgment */}
        <div className="mt-12 text-center text-sm text-[#8C877D]">
          <p>By using Vozranow, you acknowledge that you have read and understood how we handle your data.</p>
          <p className="mt-2">
            For data deletion requests or privacy inquiries, contact <a href="mailto:privacy@vozranow.com" className="text-[#173F3A] font-bold hover:underline">privacy@vozranow.com</a>.
          </p>
        </div>

      </main>
    </div>
  );
};

export default PrivacyPolicy;