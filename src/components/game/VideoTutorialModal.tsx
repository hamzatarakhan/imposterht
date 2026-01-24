import React from "react";
import { X } from "lucide-react";

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <span className="text-4xl">🎬</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">شرح طريقة اللعب</h2>
        </div>
        
        {/* Video */}
        <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[60vh]">
          <video
            src="/videos/how-to-play.mp4"
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 px-4 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default VideoTutorialModal;
