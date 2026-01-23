import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl p-0 rounded-2xl overflow-hidden bg-card border-border/50">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-center text-lg flex items-center justify-center gap-2">
            🎬 شرح طريقة اللعب
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 pt-3">
          <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[70vh]">
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
          
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors"
          >
            إغلاق ✕
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoTutorialModal;
