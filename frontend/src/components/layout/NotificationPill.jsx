import { CheckCircle2, AlertCircle } from "lucide-react";

const NotificationPill = ({ notification }) => {
  if (!notification?.show) return null;

  return (
    <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-[100] transition-all duration-300 animate-in slide-in-from-bottom-5 ${
      notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#173F3A] text-white'
    }`}>
      {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span className="text-sm font-medium tracking-wide">{notification.message}</span>
    </div>
  );
};

export default NotificationPill;