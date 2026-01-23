import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IMPOSTER - لعبة الإمبوستر',
          text: 'العب معنا لعبة الإمبوستر! 😈',
          url: url,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <span className="text-4xl">📱</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">شارك اللعبة</h2>
          <p className="text-sm text-muted-foreground mt-1">
            امسح الكود للعب مع أصدقائك
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-inner">
            <QRCodeSVG
              value={url}
              size={180}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        </div>

        {/* URL display */}
        <div className="bg-secondary/50 rounded-xl p-3 mb-4">
          <p className="text-xs text-muted-foreground text-center break-all font-mono">
            {url}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-secondary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            {copied ? (
              <>
                <Check size={18} className="text-safe" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy size={18} />
                نسخ الرابط
              </>
            )}
          </button>
          
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Share2 size={18} />
              مشاركة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
