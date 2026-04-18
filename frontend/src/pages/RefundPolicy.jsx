import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCcw, ShieldCheck, ChevronRight } from "lucide-react";

// 🟢 Advanced Data Structure to handle text + sub-bullets
const REFUND_DATA = [
  {
    text: "A full refund will be issued if the session cannot be successfully conducted due to reasons attributable to Platform, including:",
    bullets: [
      "Failure of the assigned listener to join the session",
      "Incorrect session assignment",
      "Technical issues such as server downtime or video system failure",
      "Session not initiated due to platform malfunction",
      "Listener is unable to complete the session"
    ]
  },
  {
    text: "Refund eligibility for cancellations depends on timing:",
    bullets: [
      "Cancellation made 1 day prior to the scheduled session → Full Refund",
      "Cancellation made within 2–4 hours of the session → Partial Refund (50%)",
      "Failure to attend the session (no-show) → No refund"
    ]
  },
  {
    text: "In cases where a session is interrupted you can reschedule."
  },
  {
    text: "Refunds will not be issued under the following circumstances:",
    bullets: [
      "User fails to join the session at the scheduled time",
      "Technical or connectivity issues from the user’s side",
      "Dissatisfaction without a valid operational or technical reason",
      "Violation of Vozranow policies or terms of use"
    ]
  },
  {
    text: "All approved refunds will be credited to the user’s platform wallet within 3 working days."
  },
  {
    text: "If a user believes a refund has been unfairly denied, they may raise a dispute."
  },
  {
    text: "We reserve the right to:",
    bullets: [
      "Deny refund requests in cases of suspected misuse",
      "Suspend or restrict accounts involved in repeated false claims",
      "Audit user activity to prevent fraudulent behavior"
    ]
  },
  {
    text: "The platform reserves the right to modify this Refund Policy at any time. Continued use of the platform constitutes acceptance of the updated policy."
  }
];

const RefundPolicy = () => {
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
            <RefreshCcw size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#173F3A] tracking-tight">
            Refund Policy
          </h1>
          <p className="text-[#8C877D] font-medium tracking-wide uppercase text-sm flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Last Updated: April 2026
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#E8E6E1] space-y-12">
          
          {/* 🟢 Overview Callout Box */}
          <div className="bg-[#F0F7F5] border border-[#A3C6C0]/30 rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-xl font-bold text-[#173F3A] mb-3">Overview</h2>
            <p className="text-[15px] md:text-base text-[#5C5954] leading-relaxed">
              Welcome to Vozranow. This Refund Policy outlines the terms under which refunds are processed for session bookings made through our platform. Vozranow operates on a prepaid wallet-based system. Users are required to add funds to their in-platform wallet before booking any session. All refunds, if applicable, are processed back to the Vozranow wallet.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2D2A26] mb-8 border-b border-[#E8E6E1] pb-4">
              Eligibility for Refunds
            </h2>

            {/* The Rules List */}
            <div className="space-y-10">
              {REFUND_DATA.map((policy, index) => (
                <div key={index} className="flex gap-6 group">
                  
                  {/* Custom Number Styling */}
                  <div className="shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-[#F4F7F6] border border-[#E8E6E1] text-[#173F3A] flex items-center justify-center text-sm font-bold group-hover:bg-[#173F3A] group-hover:text-white group-hover:border-[#173F3A] transition-all duration-300">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Policy Text & Sub-bullets */}
                  <div className="pt-1">
                    <p className="text-[15px] md:text-base text-[#2D2A26] font-medium leading-relaxed">
                      {policy.text}
                    </p>
                    
                    {/* Render bullets if they exist for this specific rule */}
                    {policy.bullets && (
                      <ul className="mt-4 space-y-3">
                        {policy.bullets.map((bullet, bIndex) => (
                          <li key={bIndex} className="flex items-start gap-3 text-[15px] text-[#5C5954] leading-relaxed">
                            <ChevronRight size={16} className="text-[#A3C6C0] shrink-0 mt-1" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Contact / Acknowledgment */}
        <div className="mt-12 text-center text-sm text-[#8C877D] bg-white rounded-2xl p-6 border border-[#E8E6E1] shadow-sm">
          <h3 className="font-bold text-[#2D2A26] text-base mb-2">Contact Us</h3>
          <p>For any refund-related queries or support, please contact our support team at:</p>
          <a href="mailto:support@vozranow.com" className="inline-block mt-2 text-[#173F3A] font-bold hover:underline text-base">
            support@vozranow.com
          </a>
        </div>

      </main>
    </div>
  );
};

export default RefundPolicy;