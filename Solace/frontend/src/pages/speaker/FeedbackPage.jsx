'use client';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, MessageSquare, CheckCircle2, Loader2, ArrowRight, Heart } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDecompressing, setIsDecompressing] = useState(true);
  const [listenerName, setListenerName] = useState("your Listener");


  useEffect(() => {
    let isMounted = true;
    const fetchSessionData = async () => {
      try {
        // Replace with your actual GET session route
        const res = await axiosInstance.get(`/api/session/${sessionId}`); 
        if (isMounted && res.data?.session?.listenerId?.username) {
          setListenerName(res.data.session.listenerId.username);
        }
      } catch (err) {
        console.error("Failed to fetch session details", err);
      }
    };

    fetchSessionData();

    // B. Start the 3-second decompression timer
    const timer = setTimeout(() => {
      if (isMounted) setIsDecompressing(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sessionId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = API_PATHS.USER.SUBMIT_FEEDBACK(sessionId);
      
      await axiosInstance.post(url, {
        rating,
        comment
      });

      setSuccess(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (isDecompressing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#173F3A] text-[#E5F0EE] animate-in fade-in duration-1000">
        <Heart size={48} className="mb-6 text-[#3A6B48] animate-pulse" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wide text-center px-4">
          Take a deep breath.
        </h2>
        <p className="mt-4 text-[#E5F0EE]/70 text-lg text-center px-4 max-w-md">
          We hope this session brought you a sense of clarity and peace.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-[#173F3A] animate-in fade-in duration-700">
        <CheckCircle2 size={64} className="mb-4 text-[#3A6B48]" />
        <h2 className="font-serif text-3xl font-bold">Thank you.</h2>
        <p className="mt-2 text-[#5C5954]">Your reflection has been saved.</p>
        <div className="mt-8 flex items-center gap-2 text-sm text-[#8C877D] animate-pulse">
           Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-[#FDFCF8]">
      
      {/* --- LEFT SIDE: Session Context (Decompression) --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#173F3A]">
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#173F3A]/40 to-[#173F3A]/90" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-[#E5F0EE]">
           <div>
             <div className="font-serif text-3xl font-bold tracking-tight mb-2">Vozranow.</div>
             {/* Changed from Gray to Soft White with opacity */}
             <p className="text-[#E5F0EE]/60 text-sm uppercase tracking-widest">Session Complete</p>
           </div>
           
           <div className="space-y-6 max-w-md">
              <h2 className="font-serif text-4xl leading-tight">
                "Healing takes time, and asking for help is a courageous step."
              </h2>
              
              <div className="pt-8 border-t border-[#E5F0EE]/10">
                <p className="text-sm text-[#E5F0EE]/70 uppercase tracking-wider mb-2">You just spoke with</p>
                <div className="text-3xl font-medium text-white">
                  {listenerName}
                </div>
              </div>
           </div>

           <div className="text-sm text-[#E5F0EE]/40">
              Your feedback helps us create a safer space.
           </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: The Reflection Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 font-serif text-2xl font-bold text-[#173F3A]">
           Vozranow.
        </div>

        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2D2A26]">How are you feeling?</h1>
            <p className="text-[#5C5954]">
              Your session has ended. Please take a moment to reflect on your experience with {listenerName}.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Rating Section (Mandatory) */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-[#2D2A26] block">
                Rate your experience <span className="text-red-400">*</span>
              </label>
              
              <div className="flex gap-2 group">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      size={32} 
                      className={`transition-colors duration-200 ${
                        star <= (hoverRating || rating) 
                          ? "fill-[#3A6B48] text-[#3A6B48]" // Filled Green
                          : "fill-transparent text-[#E8E6E1]" // Empty Cream/Gray
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="h-4">
                {rating > 0 && (
                   <span className="text-sm font-medium text-[#3A6B48] animate-in fade-in slide-in-from-left-2">
                     {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                   </span>
                )}
              </div>
            </div>

            {/* Comment Section (Optional but encouraged) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D2A26]" htmlFor="comment">
                Private Note (Optional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-[#8C877D]">
                  <MessageSquare size={18} />
                </div>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  placeholder="Share your thoughts... (This is kept private)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-4 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                 <span className="block h-1.5 w-1.5 rounded-full bg-red-600"/> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-white shadow-lg transition-all 
                ${rating === 0 
                  ? "bg-[#8C877D] cursor-not-allowed opacity-50" 
                  : "bg-[#173F3A] shadow-[#173F3A]/20 hover:bg-[#0F2926] hover:shadow-xl hover:-translate-y-0.5"
                }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Review <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;