import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Share2, Copy, Check, Smartphone, Download, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useSettings } from '@/context/SettingsContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

type DeviceType = 'ios' | 'android' | 'desktop';

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const { playSound, vibrate } = useSettings();

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('تم نسخ الرابط!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('فشل النسخ');
    }
  };

  const handleShare = async () => {
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IMPOSTER - لعبة الإمبوستر',
          text: 'العب معنا لعبة الإمبوستر! 😈',
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled - that's fine, don't fallback
        if ((err as Error).name === 'AbortError') {
          return;
        }
        console.error('Share failed, falling back to copy:', err);
      }
    }
    
    // Fallback: copy to clipboard
    await handleCopy();
  };

  if (!isOpen) return null;

  const iosSteps = [
    { step: 1, icon: '🧭', text: 'افتح الرابط في Safari' },
    { step: 2, icon: '📤', text: 'اضغط على زر المشاركة (أسفل الشاشة)' },
    { step: 3, icon: '➕', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
    { step: 4, icon: '✅', text: 'اضغط "إضافة" للتأكيد' },
  ];

  const androidSteps = [
    { step: 1, icon: '🌐', text: 'افتح الرابط في Chrome' },
    { step: 2, icon: '⋮', text: 'اضغط على القائمة (ثلاث نقاط)' },
    { step: 3, icon: '📲', text: 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' },
    { step: 4, icon: '✅', text: 'اضغط "تثبيت" للتأكيد' },
  ];

  const desktopSteps = [
    { step: 1, icon: '🌐', text: 'افتح الرابط في Chrome أو Edge' },
    { step: 2, icon: '📥', text: 'ابحث عن أيقونة التثبيت في شريط العنوان' },
    { step: 3, icon: '✅', text: 'اضغط "تثبيت" للتأكيد' },
  ];

  const getSteps = () => {
    if (deviceType === 'ios') return iosSteps;
    if (deviceType === 'android') return androidSteps;
    return desktopSteps;
  };

  const getDeviceLabel = () => {
    if (deviceType === 'ios') return 'التثبيت على iPhone';
    if (deviceType === 'android') return 'التثبيت على Android';
    return 'التثبيت على الكمبيوتر';
  };

  const steps = getSteps();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {!showInstallSteps ? (
          <>
            {/* Header */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <span className="text-4xl">📱</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">شارك اللعبة</h2>
              <p className="text-sm text-muted-foreground mt-1">
                امسح الكود للعب مع أصدقائك
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={url}
                  size={160}
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
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-3 rounded-xl bg-secondary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-safe" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    نسخ الرابط
                  </>
                )}
              </button>
              
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm"
              >
                <Share2 size={16} />
                مشاركة
              </button>
            </div>

            {/* Quick Install Button - Show directly when browser supports it */}
            {isInstallable && !isInstalled && (
              <button
                onClick={async () => {
                  playSound('click');
                  vibrate();
                  const success = await installApp();
                  if (success) {
                    playSound('win');
                    vibrate([100, 50, 100]);
                    toast.success('تم تثبيت التطبيق بنجاح! 🎉');
                  }
                }}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-safe to-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity mb-3 animate-pulse"
              >
                <Zap size={20} />
                ثبّت التطبيق الآن!
              </button>
            )}

            {/* Already Installed Message */}
            {isInstalled && (
              <div className="w-full py-3 px-4 rounded-xl bg-safe/20 border border-safe/30 text-safe font-bold flex items-center justify-center gap-2 mb-3">
                <Check size={18} />
                التطبيق مثبت بالفعل!
              </div>
            )}

            {/* Install to Home Screen button - for manual steps */}
            {!isInstalled && (
              <button
                onClick={() => setShowInstallSteps(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent to-primary/80 text-accent-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Download size={18} />
                {isInstallable ? 'أو شاهد خطوات التثبيت اليدوي' : 'كيف أضيف التطبيق للشاشة الرئيسية؟'}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Install Steps Header */}
            <div className="text-center mb-5 mt-2">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Smartphone size={28} className="text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {getDeviceLabel()}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isInstalled ? 'التطبيق مثبت بالفعل! 🎉' : isInstallable ? 'اضغط الزر للتثبيت مباشرة' : 'اتبع الخطوات التالية'}
              </p>
            </div>

            {/* Quick Install Button - Only show when installable */}
            {isInstallable && !isInstalled && (
              <button
                onClick={async () => {
                  playSound('click');
                  vibrate();
                  const success = await installApp();
                  if (success) {
                    playSound('win');
                    vibrate([100, 50, 100]);
                    toast.success('تم تثبيت التطبيق بنجاح! 🎉');
                  }
                }}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-safe to-primary text-primary-foreground font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity mb-4 animate-pulse"
              >
                <Zap size={22} />
                ثبّت الآن بضغطة واحدة!
              </button>
            )}

            {/* Already Installed Message */}
            {isInstalled && (
              <div className="w-full py-4 px-4 rounded-xl bg-safe/20 border border-safe/30 text-safe font-bold flex items-center justify-center gap-3 mb-4">
                <Check size={22} />
                التطبيق مثبت بالفعل!
              </div>
            )}

            {/* Manual Steps - Show when not installable or as fallback */}
            {!isInstalled && (
              <>
                {isInstallable && (
                  <p className="text-center text-xs text-muted-foreground mb-3">أو اتبع الخطوات اليدوية:</p>
                )}
                <div className="space-y-3 mb-5">
                  {steps.map((item) => (
                    <div 
                      key={item.step}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">الخطوة {item.step}</p>
                        <p className="text-sm font-medium text-foreground">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Back button */}
            <button
              onClick={() => {
                playSound('click');
                vibrate();
                setShowInstallSteps(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors"
            >
              رجوع للمشاركة
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;
