import React, { useState } from 'react';
import { GameMode, Theme, UserState } from '../types';
import { ArrowLeft, Grid, CheckCircle2, Type, Compass, Eye, PenTool, Star, Play, X } from 'lucide-react';

interface GameModeSelectorProps {
  theme: Theme;
  userState: UserState;
  onSelectMode: (mode: GameMode, useFavorites: boolean) => void;
  onBack: () => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ theme, userState, onSelectMode, onBack }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  // GÖLGE YAZAR VE EDEBİYAT DEDEKTİFİ BUTONLARI LİSTEDEN TAMAMEN SİLİNDİ!
  const modes = [
    {
      id: GameMode.MATCHING,
      name: 'Eşleştirme',
      desc: 'Klasik kart hafıza oyunu.',
      icon: <Grid size={22} />,
      color: 'bg-blue-500'
    },
    {
      id: GameMode.TRUE_FALSE,
      name: 'Doğru / Yanlış',
      desc: 'Bilgilerini hızlıca test et.',
      icon: <CheckCircle2 size={22} />,
      color: 'bg-green-500'
    },
    {
      id: GameMode.WORD_HUNT,
      name: 'Harf Avcısı',
      desc: 'Harfleri birleştir, yazarı bul.',
      icon: <Type size={22} />,
      color: 'bg-purple-500'
    },
    {
      id: GameMode.PERIOD_QUIZ,
      name: 'Dönem Dedektifi',
      desc: 'Eser hangi edebiyat dönemine ait?',
      icon: <Compass size={22} />,
      color: 'bg-orange-500'
    },
    {
      id: GameMode.SPY_CARD,
      name: 'Casus Kart',
      desc: 'Gruptaki sızan yabancı eseri tespit et!',
      icon: <Eye size={22} />,
      color: 'bg-red-500'
    },
    {
      id: GameMode.INK_BLOT,
      name: 'Mürekkep Lekesi',
      desc: 'Mürekkep bulaşmış tarihi parşömeni onar.',
      icon: <PenTool size={22} />,
      color: 'bg-violet-600'
    }
  ];

  const handleModeClick = (mode: GameMode) => {
      setSelectedMode(mode);
      setShowPreferenceModal(true);
  };

  const handleChooseMode = (useFavorites: boolean) => {
      if (useFavorites && userState.favorites.length < 4) {
          alert("Favorilerle oynamak için kütüphaneden en az 4 eseri favori (yıldızlı) yapmalısınız!");
          return;
      }
      if (selectedMode) {
          onSelectMode(selectedMode, useFavorites);
      }
      setShowPreferenceModal(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-hidden animate-fade-in z-20 relative max-w-md mx-auto">
      
      {/* Üst Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button onClick={onBack} className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition ${theme.colors.text}`}>
          <ArrowLeft size={20} />
        </button>
        <h2 className={`text-xl font-black ${theme.colors.text}`}>Oyun Modu</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-8 pr-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeClick(m.id)}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left border ${theme.colors.surfaceBorder} ${theme.colors.surface} btn-duo-sec text-white`}
          >
            <div className={`p-2.5 rounded-xl text-white ${m.color} shrink-0 shadow-md`}>
              {m.icon}
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-md ${theme.colors.text}`}>{m.name}</span>
              <span className={`text-[11px] opacity-70 ${theme.colors.textSecondary}`}>{m.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ÇALIŞMA TERCİHİ MODALI */}
      {showPreferenceModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
              <div className={`w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center relative`}>
                  
                  <button 
                     onClick={() => setShowPreferenceModal(false)}
                     className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 z-50 shadow-md"
                  >
                      <X size={16} className="text-white opacity-90" />
                  </button>

                  <div className="text-5xl mb-2">📚</div>
                  <h3 className="text-xl font-black text-white mb-1">Çalışma Tercihi</h3>
                  <p className="text-xs text-white/50 mb-6">Bu oyunda hangi eserler sorulsun?</p>
                  
                  <div className="space-y-4">
                      <button 
                         onClick={() => handleChooseMode(false)}
                         className={`w-full p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-3 justify-center transition active:scale-95`}
                      >
                          <Play size={16} />
                          <span>Tüm Eserlerle Oyna (110 Eser)</span>
                      </button>

                      <button 
                         onClick={() => handleChooseMode(true)}
                         className={`w-full p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 font-bold flex items-center gap-3 justify-center transition active:scale-95`}
                      >
                          <Star size={16} fill="currentColor" />
                          <span>Sadece Favorilerimle Oyna ({userState.favorites.length})</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};