import { Link } from "react-router-dom";
import { ArrowLeft, Scale, ShieldCheck } from "lucide-react";

const TERMS_DATA = [
  "By accessing or using Vozranow, you agree to comply with and be legally bound by these Terms and Conditions.",
  "You must be at least 18 years old to use the platform and must provide accurate and complete registration information.",
  "Vozranow is a platform that enables users to connect with listeners for one-on-one conversational sessions intended for general sharing purposes only.",
  "Vozranow does not provide any professional, legal, medical, or advisory services, and users are responsible for their own decisions and actions.",
  "Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted under their account.",
  "All payments are processed through a third-party payment gateway and are stored in the Vozranow wallet for session bookings.",
  "Session fees are deducted from the wallet at the time of booking and are subject to the applicable Refund Policy.",
  "Users are required to join sessions on time and behave respectfully during interactions with listeners.",
  "Any misuse of the platform, including harassment, abuse, or inappropriate behavior, may result in suspension or permanent termination of the account.",
  "Listeners are expected to maintain professional and respectful conduct, and Vozranow may take action in case of violations.",
  "Vozranow reserves the right to assign, reassign, or replace listeners and modify session schedules as necessary.",
  "The platform may monitor, log, or record sessions and user activity to ensure safety, compliance, and service quality.",
  "Vozranow shall not be held liable for any direct or indirect outcomes resulting from user interactions or use of the platform.",
  "Vozranow reserves the right to suspend, restrict, or terminate accounts and services at its sole discretion in case of policy violations or suspicious activity.",
  "Vozranow may update these Terms and Conditions at any time, and continued use of the platform constitutes acceptance of the updated terms."
];

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] selection:bg-[#173F3A] selection:text-white">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-[#E8E6E1]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-[#8C877D] hover:text-[#173F3A] transition-colors font-medium text-sm"
          >
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="font-serif text-xl font-bold text-[#173F3A] tracking-tight">
            Vozranow.
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        
        {/* Title Area */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
          <div className="w-16 h-16 bg-[#E8F4F1] text-[#173F3A] rounded-2xl flex items-center justify-center mx-auto shadow-sm transform -rotate-3">
            <Scale size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#173F3A] tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-[#8C877D] font-medium tracking-wide uppercase text-sm flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Last Updated: April 2026
          </p>
        </div>

        {/* The Rules List */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#E8E6E1]">
          <div className="space-y-8">
            {TERMS_DATA.map((term, index) => (
              <div key={index} className="flex gap-6 group">
                
                {/* Custom Number Styling */}
                <div className="shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#F4F7F6] border border-[#E8E6E1] text-[#173F3A] flex items-center justify-center text-sm font-bold group-hover:bg-[#173F3A] group-hover:text-white group-hover:border-[#173F3A] transition-all duration-300">
                    {index + 1}
                  </div>
                </div>
                
                {/* Rule Text */}
                <p className="text-[15px] md:text-base text-[#5C5954] leading-relaxed pt-1">
                  {term}
                </p>
                
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Contact / Acknowledgment */}
        <div className="mt-12 text-center text-sm text-[#8C877D]">
          <p>By using Vozranow, you acknowledge that you have read and understood these terms.</p>
          <p className="mt-2">
            If you have any questions, please contact us at <a href="mailto:support@vozranow.com" className="text-[#173F3A] font-bold hover:underline">support@vozranow.com</a>.
          </p>
        </div>

      </main>
    </div>
  );
};

export default TermsAndConditions;