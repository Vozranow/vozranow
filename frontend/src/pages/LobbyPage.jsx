'use client';
import axios from "axios";
import fixWebmDuration from 'fix-webm-duration';
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { 
  Send, Video, ArrowLeft, MoreVertical, 
  Clock, CheckCheck, AlertCircle, ArrowRight,
  Mic, StopCircle, UploadCloud
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useScreenRecorder } from "../hooks/useScreenRecorder"; 
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths"; 
import { ENV } from "../utils/env";

// 🟢 NEW REUSABLE COMPONENTS
import NotificationPill from "../components/layout/NotificationPill";
import ActionModal from "../components/layout/ActionModal";

// --- TYPING INDICATOR COMPONENT ---
const TypingIndicator = () => (
  <div className="flex items-center gap-1 bg-gray-100 py-2 px-4 rounded-full w-fit mb-2 animate-in fade-in zoom-in duration-300">
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

// Helper: Format Seconds
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const LobbyPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef(null);
  
  // --- UI STATE ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [meetLink, setMeetLink] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  
  // 🟢 NEW: GLOBAL UI STATE
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  
  // --- LOGIC STATE (Session & Recording) ---
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("verifying"); 
  const [pageError, setPageError] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("pending");
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sessionData, setSessionData] = useState(null);
  const recordingStartTimeRef = useRef(null);

  const isListener = user?.role === "listener";
  const isPeerOnline = Array.from(onlineUsers).some(id => id !== user?._id);

  // 🎥 RECORDER HOOK
  const { 
    startRecording, stopRecording, isRecording, recordingBlob , error: recorderError
  } = useScreenRecorder();

  // 🛡️ 1. PREVENT ACCIDENTAL REFRESH
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isRecording || sessionStatus === "ongoing") {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRecording, sessionStatus]);

  // 🟢 HELPER: Show Notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  // 1️⃣ INITIAL SETUP
  useEffect(() => {
    let newSocket = null;

    const initLobby = async () => {
      try {
        setStatus("verifying");
        const { data } = await axiosInstance.get(API_PATHS.SESSION.CAN_JOIN(sessionId));
        setSessionData(data.session);
        
        setStatus("connecting");
        const historyRes = await axiosInstance.get(API_PATHS.SESSION.GET_MESSAGES(sessionId));
        setMessages(historyRes.data);
        
        const lastLinkMsg = historyRes.data.findLast(m => m.type === 'link');
        if (lastLinkMsg) setMeetLink(lastLinkMsg.content);

        newSocket = io(ENV.BACKEND_URL, {
          withCredentials: true,
          transports: ['websocket'],
          query: { sessionId }
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
          setStatus("connected");
          newSocket.emit("join_lobby", { sessionId });
        });

        newSocket.on("presence_update", ({ onlineUsers }) => {
           setOnlineUsers(new Set(onlineUsers));
        });

        newSocket.on("session_sync", (data) => {
          setSessionStatus(data.status);
          if (data.meetLink) setMeetLink(data.meetLink);
          if (data.status === "ongoing" && data.startedAt) {
             const startTime = new Date(data.startedAt).getTime();
             const now = Date.now();
             setSessionTimer(Math.floor((now - startTime) / 1000));
          }
        });

        newSocket.on("session_started", () => {
          setSessionStatus("ongoing");
          setSessionTimer(0);
        });

        newSocket.on("session_ended", () => {
          setSessionStatus("ended");
          if (!isListener) {
             setTimeout(() => navigate(`/session/${sessionId}/feedback`), 1500); 
          }
        });

        newSocket.on("receive_message", (msg) => {
          setMessages((prev) => [...prev, msg]);
          if (msg.type === 'link') setMeetLink(msg.content);
        });

        newSocket.on("link_shared", (data) => setMeetLink(data.link));

        newSocket.on("user_typing", ({ user: typingUser }) => {
          if (typingUser !== user.username) {
            setTypingUsers((prev) => new Set(prev).add(typingUser));
          }
        });

        newSocket.on("user_stop_typing", () => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.clear(); 
            return newSet;
          });
        });

      } catch (err) {
        console.error("Lobby Access Denied:", err);
        setPageError(err.response?.data?.message || "Access denied.");
        setStatus("error");
      }
    };

    if (user && sessionId) {
        initLobby();
    }

    return () => {
      if (newSocket) {
        newSocket.emit("leave_lobby", { sessionId }); 
        newSocket.disconnect();
      }
    };
  }, [sessionId, user]);
   
  useEffect(() => {
    if (sessionStatus === "ongoing" && !isRecording && recordingBlob) {
       socket.emit("end_session", { sessionId });
    }
  }, [isRecording, sessionStatus, recordingBlob]);
  
  // 2️⃣ TIMER & SCROLL
  useEffect(() => {
    let interval;
    if (sessionStatus === "ongoing") {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        document.title = `🔴 ${formatTime(sessionTimer)} - Solance`;
      }, 1000);
    } else {
      document.title = "Solance Session";
    }
    return () => clearInterval(interval);
  }, [sessionStatus, sessionTimer]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // 3️⃣ UPLOAD LOGIC
  useEffect(() => {
    if (recordingBlob && isListener) {
      handleUploadRecording();
    }
  }, [recordingBlob]);

  const handleUploadRecording = async () => {
  setIsUploading(true);
  try {
    const { data: presignedData } = await axiosInstance.post(API_PATHS.LISTENER.UPLOAD_URL, {
      sessionId,
      fileType: 'video/webm'
    });

    if (!recordingStartTimeRef.current) {
        throw new Error("Recording start time was lost!");
    }
    const durationMs = Date.now() - recordingStartTimeRef.current; 

    const fixedBlob = await new Promise((resolve, reject) => {
      try {
        fixWebmDuration(recordingBlob, durationMs, (fixed) => {
          resolve(fixed);
        });
      } catch (e) {
        reject(e);
      }
    });

    await axios.put(presignedData.uploadUrl, fixedBlob, { 
      headers: { 'Content-Type': 'video/webm' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      },
      withCredentials: false, 
    });

    await axiosInstance.post(API_PATHS.SESSION.COMPLETE, {
      sessionId,
      recordingUrl: presignedData.publicUrl
    });

    showNotification("Upload successful!", "success");
    navigate('/listener/dashboard');
  } catch (err) {
    // 🟢 REPLACED ALERT WITH NOTIFICATION
    showNotification("Upload failed! Backup downloaded.", "error");
    setIsUploading(false);
    console.error("Upload Error:", err);
    navigate('/listener/dashboard');
  }
};

  // 4️⃣ HANDLERS
  const handleStartSession = async () => {
    if (!isListener) return;
    try {
      await startRecording(); 
      recordingStartTimeRef.current = Date.now();
      socket.emit("start_session", { sessionId });
    } catch (e) {
      showNotification("Please allow screen recording permissions.", "error");
    }
  };

  const handleEndSession = async () => {
    if (!isListener) return;

    // 🟢 REPLACED WINDOW.CONFIRM WITH ACTION MODAL (Recovery Mode)
    if (sessionStatus === "ongoing" && !isRecording) {
      setModalConfig({
        isOpen: true,
        title: "Recording Lost",
        description: "Recording was lost due to an unexpected refresh. Do you want to force end the session anyway?",
        confirmText: "Force End",
        confirmColor: "bg-red-600 hover:bg-red-700",
        icon: AlertCircle,
        iconColor: "bg-red-50 text-red-600",
        onConfirm: () => {
          socket.emit("end_session", { sessionId });
          setModalConfig({ isOpen: false });
          navigate('/listener/dashboard');
        }
      });
      return;
    }

    // 🟢 REPLACED WINDOW.CONFIRM WITH ACTION MODAL (Normal End)
    setModalConfig({
      isOpen: true,
      title: "End Session",
      description: "Are you sure you want to end the session? This will finalize the meeting and securely upload the recording.",
      confirmText: "End Session",
      confirmColor: "bg-red-600 hover:bg-red-700",
      icon: StopCircle,
      iconColor: "bg-red-50 text-red-600",
      onConfirm: () => {
        stopRecording(); // Triggers upload effect
        socket.emit("end_session", { sessionId });
        setModalConfig({ isOpen: false });
      }
    });
  };

  const handleLeaveSession = () => {
    if (socket) {
      socket.emit("leave_lobby", { sessionId });
      socket.disconnect();
    }
    navigate(isListener ? '/listener/dashboard' : '/dashboard');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    socket.emit("send_message", { sessionId, content: newMessage, type: "text" });
    socket.emit("stop_typing", { sessionId });
    setNewMessage("");
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    if (e.target.value.length > 0) socket.emit("typing", { sessionId });
    else socket.emit("stop_typing", { sessionId });
  };

  const handleShareLink = () => {
    setLinkError(""); 
    if (!socket) return;
    const cleanLink = linkInput.trim();
    if (!cleanLink.includes("meet.google.com") && !cleanLink.includes("google.com/meet")) {
      setLinkError("Only Google Meet links are supported");
      return; 
    }
    socket.emit("send_message", { sessionId, content: cleanLink, type: "link" });
    setIsLinkInputOpen(false);
    setLinkInput("");
  };

  const openVideoCall = () => {
    if (meetLink) window.open(meetLink, "_blank");
  };

  // --- RENDERING ---

  // Upload Modal
  if (isUploading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#173F3A] flex flex-col items-center justify-center text-white font-sans">
        <UploadCloud size={64} className="animate-bounce mb-6 text-teal-400" />
        <h2 className="text-2xl font-serif font-bold mb-2">Saving Session...</h2>
        <p className="text-gray-300 mb-8 max-w-md text-center">
          Please do not close this tab. The recording is being securely uploaded.
        </p>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-teal-400 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
        </div>
        <p className="mt-2 font-mono">{uploadProgress}%</p>
      </div>
    );
  }

  // Error State
  if (status === "error") {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-[#2D2A26] gap-4 bg-[#FDFCF8] px-6 text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-500 mb-2">
           <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#173F3A]">Unable to Join</h2>
        <p className="text-gray-500 max-w-md">{pageError}</p>
        <button 
          onClick={() => navigate(isListener ? '/listener/dashboard' : '/dashboard')}
          className="mt-4 px-6 py-2 bg-[#173F3A] text-white rounded-lg hover:bg-[#0F2926]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Loading State
  if (status === "verifying" || status === "connecting") {
     return (
       <div className="h-screen flex flex-col items-center justify-center text-[#173F3A] gap-4 bg-[#FDFCF8]">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173F3A]"></div>
         <p className="animate-pulse font-medium text-sm text-gray-400">
            {status === "verifying" ? "Verifying access..." : "Entering secure lobby..."}
         </p>
       </div>
     );
  }

  // Main UI
  return (
    <div className="flex flex-col h-screen bg-[#FDFCF8] text-[#2D2A26] font-sans">
      
      {/* 🟢 GLOBAL UI COMPONENTS */}
      <NotificationPill notification={notification} />
      <ActionModal {...modalConfig} onClose={() => setModalConfig({ isOpen: false })} />

      {/* 🟢 HEADER */}
      <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={handleLeaveSession} className="p-2 hover:bg-gray-50 rounded-full transition-colors group">
            <ArrowLeft size={20} className="text-[#5C5954] group-hover:text-[#173F3A]" />
          </button>
          <div>
            <h2 className="font-serif text-lg md:text-xl text-[#173F3A] font-bold">Session Room</h2>
            <div className={`flex items-center gap-1.5 text-[10px] md:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isPeerOnline ? "text-green-600" : "text-gray-400"}`}>
              <span className="relative flex h-2 w-2">
                {isPeerOnline && (
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPeerOnline ? "bg-green-500" : "bg-gray-300"}`}></span>
              </span>
              {isPeerOnline ? "Online" : "Waiting for peer..."}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* ⏱️ TIMER (If Ongoing) */}
          {sessionStatus === "ongoing" && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-red-600 shadow-sm animate-in fade-in">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="font-mono font-medium text-xs md:text-sm">{formatTime(sessionTimer)}</span>
             </div>
          )}

          {/* 🎛️ LISTENER CONTROLS (Start/End) */}
          {isListener && (
            <div className="flex flex-col items-end gap-1">
              {sessionStatus === "pending" && (
                <button 
                  onClick={handleStartSession}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-700 shadow-md shadow-green-900/20 transition-all text-xs md:text-sm font-medium"
                >
                  <Mic size={16} /> <span className="hidden md:inline">Start Session</span>
                </button>
              )}
              {recorderError && (
                 <span className="text-xs text-red-500 font-medium animate-in fade-in">
                   {recorderError}
                 </span>
              )}
              {sessionStatus === "ongoing" && (
                <button 
                  onClick={handleEndSession}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-red-700 shadow-md transition-all text-xs md:text-sm font-medium animate-pulse hover:animate-none"
                >
                  <StopCircle size={16} /> 
                  <span className="hidden md:inline">{isRecording ? "End Session" : "Force End"}</span>
                </button>
              )}
            </div>
          )}

          {/* Join Call Button */}
          {meetLink && (
            <button 
              onClick={openVideoCall}
              className="flex items-center gap-2 bg-[#173F3A] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#0F2926] transition-all shadow-md shadow-teal-900/10 animate-[pulse_3s_infinite]"
            >
              <Video size={16} /> <span className="hidden md:inline font-medium text-sm">Join Call</span>
            </button>
          )}
          
          <button className="p-2 text-gray-400 hover:text-[#173F3A]">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* 💬 CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#FDFCF8] scrollbar-thin scrollbar-thumb-gray-200">
        <div className="flex flex-col items-center justify-center py-6 text-center opacity-60">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
             <Clock size={20} className="text-[#173F3A]"/>
          </div>
          <p className="text-xs text-gray-500 max-w-xs">
             This is a secure space. Messages are encrypted and stored for safety purposes.
          </p>
        </div>

        {messages.map((msg, index) => {
          const myId = (user?._id || user?.id)?.toString();

          let rawSenderId = msg.senderId;
          if (typeof msg.senderId === 'object' && msg.senderId !== null) {
            rawSenderId = msg.senderId._id || msg.senderId.id;
          }
          const senderId = rawSenderId?.toString();

          const isMe = myId === senderId;
          const senderName = typeof msg.senderId === 'object' ? msg.senderId.username : "User";
          const isSystem = msg.type === "system";
          const isLink = msg.type === "link";

          if (isSystem) {
             const isJoin = msg.content.includes("joined");
             return (
               <div key={index} className="flex justify-center my-6 animate-in fade-in zoom-in duration-300">
                 <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-gray-100">
                   <div className={`w-2 h-2 rounded-full ${isJoin ? "bg-green-400" : "bg-orange-400"}`}></div>
                   <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                     {msg.content}
                   </span>
                 </div>
               </div>
             );
          }

          return (
            <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div 
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl text-sm leading-relaxed shadow-sm relative transition-all overflow-hidden w-fit
                  ${isMe 
                    ? "bg-[#173F3A] text-white rounded-br-none" 
                    : "bg-white border border-gray-100 text-[#2D2A26] rounded-bl-none"
                  }
                  ${isLink ? "p-0 border-0 bg-transparent shadow-none" : "px-4 py-3"}
                `}
              >
                {!isMe && !isLink && (
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                    {senderName}
                  </p>
                )}

                {isLink ? (
                  <div 
                    onClick={() => window.open(msg.content, "_blank")}
                    className="cursor-pointer group relative overflow-hidden bg-[#E8F4F1] border border-[#173F3A]/10 rounded-2xl p-4 w-64 hover:shadow-md transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#173F3A]/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-white p-3 rounded-full text-[#173F3A] shadow-sm group-hover:bg-[#173F3A] group-hover:text-white transition-colors">
                          <Video size={20} />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-[#173F3A] text-base">Video Session</p>
                          <p className="text-xs text-[#5C5954] mt-1 mb-3 leading-relaxed">
                            A secure video room has been created for this session.
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#173F3A] group-hover:gap-2 transition-all">
                            Join Meeting <ArrowRight size={12}/>
                          </span>
                        </div>
                    </div>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              
              {!isLink && (
                <div className={`text-[10px] text-gray-300 mt-1 px-1 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   {isMe && <CheckCheck size={12} className="text-teal-600"/>}
                </div>
              )}
            </div>
          );
        })}

        {typingUsers.size > 0 && (
          <div className="flex justify-start">
             <TypingIndicator />
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* ⌨️ INPUT AREA */}
      <div className="bg-white p-3 md:p-4 border-t border-gray-100">
        {isListener && isLinkInputOpen && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2 animate-in slide-in-from-bottom-2 shadow-lg z-20">
            <div className="flex items-center gap-2">
                <Video size={18} className="text-gray-400"/>
                <input 
                   type="text" 
                   placeholder="Paste Google Meet link here..."
                   className="flex-1 bg-transparent text-sm outline-none text-[#2D2A26]"
                   value={linkInput}
                   onChange={(e) => {
                      setLinkInput(e.target.value);
                      if(linkError) setLinkError(""); 
                   }}
                   autoFocus
                />
                <button 
                  onClick={handleShareLink}
                  className="text-xs bg-[#173F3A] text-white px-3 py-1.5 rounded-md hover:bg-[#0F2926]"
                >
                  Share
                </button>
                <button onClick={() => setIsLinkInputOpen(false)} className="text-gray-400 hover:text-red-500 p-1">×</button>
            </div>
            {linkError && (
                <p className="text-xs text-red-500 pl-7">{linkError}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3">
          {isListener && (
            <button 
              type="button"
              onClick={() => setIsLinkInputOpen(!isLinkInputOpen)}
              className={`p-3 rounded-full transition-all duration-200 flex-shrink-0
                ${isLinkInputOpen ? "bg-teal-50 text-[#173F3A] rotate-90" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-[#173F3A]"}
              `}
              title="Share Video Link"
            >
              <Video size={20} />
            </button>
          )}

          <div className="flex-1 bg-gray-50 rounded-full border border-gray-200 px-4 py-3 focus-within:border-[#173F3A] focus-within:ring-1 focus-within:ring-[#173F3A]/20 transition-all flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm text-[#2D2A26] placeholder-gray-400"
            />
          </div>

          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-[#173F3A] text-white rounded-full hover:bg-[#0F2926] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-[#173F3A]/20"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default LobbyPage;