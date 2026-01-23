import React from 'react';
import { useGame } from '@/context/GameContext';
import { ArrowRight, Users, Eye, MessageCircle, Vote, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: 'اختر عدد اللاعبين',
    description: 'من 3 إلى 10 لاعبين يجلسون مع بعض',
  },
  {
    icon: Eye,
    title: 'شوف دورك',
    description: 'كل لاعب يمرر الهاتف ويشوف دوره سراً',
  },
  {
    icon: MessageCircle,
    title: 'تلميحات ذكية',
    description: 'كل لاعب يعطي تلميح عن الكلمة بدون ما يقولها',
  },
  {
    icon: Vote,
    title: 'صوّت!',
    description: 'حاولوا تكتشفون مين الإمبوستر',
  },
  {
    icon: Trophy,
    title: 'اكشف النتيجة',
    description: 'هل الإمبوستر خدع الجميع؟',
  },
];

const HowToPlayScreen: React.FC = () => {
  const { setScreen } = useGame();

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
      
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('home')}
            className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ArrowRight size={24} />
          </button>
          <h1 className="text-2xl font-bold">طريقة اللعب</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 overflow-auto">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="card-game flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <step.icon className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
              <span className="text-3xl font-black text-primary/30 mr-auto">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
        
        {/* Tips */}
        <div className="mt-8 card-game bg-primary/10 border-primary/30">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>💡</span> نصائح للإمبوستر
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• راقب تلميحات الآخرين واستنتج الكلمة</li>
            <li>• لا تكن أول من يعطي تلميح</li>
            <li>• اعطِ تلميحات عامة لكن ذكية</li>
            <li>• حافظ على هدوئك!</li>
          </ul>
        </div>
      </div>
      
      {/* Start Button */}
      <div className="relative z-10 mt-6">
        <button
          onClick={() => setScreen('setup')}
          className="w-full btn-primary-game"
        >
          يلا نلعب! 🎮
        </button>
      </div>
    </div>
  );
};

export default HowToPlayScreen;
