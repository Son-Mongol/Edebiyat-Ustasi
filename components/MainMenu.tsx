import React, { useState, useEffect } from 'react';
import { UserState, Theme } from '../types';
import { Settings, BookOpen, ShoppingBag, Calendar, Play, Star, Feather, Coffee, Crown, Bird, Book, Heart, Glasses, BarChart2, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TITLES, FALLBACK_DATA } from '../constants';

interface MainMenuProps {
  userState: UserState;
  theme: Theme;
  onStart: () => void;
  onOpenShop: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  userState,
  theme,
  onStart,
  onOpenShop,
  onOpenLibrary,
  onOpenSettings,
  onOpenStats
}) => {
  const activeTitle = TITLES.find(t => t.id === userState.currentTitleId) || TITLES[0];
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [pinnedBadges, setPinnedBadges] = useState<string[]>([]);
  
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('edebiyat_showcase_badges_v3');
    if (saved) {
      setPinnedBadges(JSON.parse(saved));
    } else {
      const defaultUnlocked = [
        { id: 'novice', icon: '👣', active: userState.gameHistory.length > 0 }, 
        { id: 'book_worm_badge', icon: '📚', active: userState.favorites.length >= 4 },
        { id: 'streak_3', icon: '🔥', active: userState.loginStreak >= 3 },
        { id: 'wealthy_scholar', icon: '🪙', active: userState.points >= 500 }
      ].filter(b => b.active).map(b => b.icon);
      setPinnedBadges(defaultUnlocked);
    }
  }, [userState, showStreakModal]);

  const [quoteObj] = useState(() => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_DATA.length);
    const picked = FALLBACK_DATA[randomIndex];
    return {
      quote: picked.clue,
      author: picked.author,
      work: picked.work
    };
  });

  const todayDate = new Date();

  const renderAvatarIcon = () => {
    const iconProps = { size: 28, className: "text-violet-400 animate-pulse-slow" };
    switch(userState.currentAvatarId) {
        case 'default_pen': return <Feather {...iconProps} />;
        case 'book_worm': return <BookOpen {...iconProps} />;
        case 'glasses': return <Glasses {...iconProps} />;
        case 'coffee': return <Coffee {...iconProps} />;
        case 'yunus_emre': return <Heart {...iconProps} className="text-red-400 animate-pulse" />;
        case 'crown': return <Crown {...iconProps} className="text-yellow-400" />;
        case 'owl_mascot': return <Bird {...iconProps} className="text-violet-400" />;
        case 'dictionary': return <Book {...iconProps} className="text-cyan-400" />;
        default: return <Feather {...iconProps} />;
    }
  };

  const handlePrevMonth = () => {
    setCalendarDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => {
      if (prev.getFullYear() >= 2045 && prev.getMonth() >= 11) return prev;
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const renderMonthlyCalendar = () => {
    const year = calendarDate.getFullYear();
    const monthIdx = calendarDate.getMonth();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    
    let startOffset = new Date(year, monthIdx, 1).getDay(); 
    startOffset = startOffset === 0 ? 6 : startOffset - 1;

    const calendarDays = [];

    for (let i = 0; i < startOffset; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="w-7 h-7"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedMonth = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : monthIdx + 1;
      const formattedDay = day < 10 ? `0${day}` : day;
      const dateString = `${year}-${formattedMonth}-${formattedDay}`;

      const isFrozen = userState.frozenDates.includes(dateString);
      const isToday = day === todayDate.getDate() && monthIdx === todayDate.getMonth() && year === todayDate.getFullYear();
      
      const isActive = year === todayDate.getFullYear() && 
                       monthIdx === todayDate.getMonth() && 
                       day <= todayDate.getDate() && 
                       (todayDate.getDate() - day < userState.loginStreak);

      calendarDays.push(
        <div 
          key={day} 
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300
            ${isFrozen
              ? 'bg-gradient-to-t from-cyan-600 to-blue-400 text-white scale-110 shadow-lg shadow-cyan-500/20 border border-cyan-300/30'
              : isActive 
                ? 'bg-gradient-to-t from-orange-600 to-yellow-400 text-white scale-110 shadow-md shadow-orange-500/20 border border-yellow-300/30' 
                : isToday 
                  ? 'border-2 border-dashed border-yellow-400 text-yellow-400' 
                  : 'bg-white/5 text-white/40'
            }
          `}
        >
          {isFrozen ? "❄️" : isActive ? "🔥" : day}
        </div>
      );
    }
    return calendarDays;
  };

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const currentMonthName = monthNames[calendarDate.getMonth()];
  const currentYear = calendarDate.getFullYear();

  const renderShowcaseSlots = () => {
    const slots = [];
    for (let i = 0; i < 5; i++) {
      const badgeIcon = pinnedBadges[i];
      if (badgeIcon) {
        slots.push(
          <div key={i} onClick={onOpenStats} className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl shadow-inner hover:scale-110 transition duration-300 cursor-pointer">
            {badgeIcon}
          </div>
        );
      } else {
        slots.push(
          <div key={i} onClick={onOpenStats} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/60 transition duration-300 cursor-pointer shadow-inner">
            <Plus size={18} />
          </div>
        );
      }
    }
    return slots;
  };

  return (
    <div className="flex flex-col h-full w-full p-6 justify-between animate-fade-in z-20 relative max-w-md mx-auto overflow-y-auto">
      
      {/* Üst Header */}
      <div className="flex justify-between items-center shrink-0 mb-4 bg-white/5 border border-white/10 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden mr-2">
          <div className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center shadow-inner shrink-0">
             {renderAvatarIcon()}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
             <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 leading-tight break-words max-w-[125px]">{activeTitle.name}</span>
             <span className="text-xs font-bold text-white/90 leading-none mt-1 flex items-center gap-1">⭐ {userState.points}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => { setCalendarDate(new Date()); setShowStreakModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 shadow transition active:scale-95"
            >
              <span className="text-orange-500 text-sm">🔥</span>
              <span className={`font-black text-xs ${theme.colors.text}`}>{userState.loginStreak}</span>
            </button>
            <button onClick={onOpenStats} className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition ${theme.colors.text}`}>
              <BarChart2 size={18} />
            </button>
            <button onClick={onOpenSettings} className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition ${theme.colors.text}`}>
              <Settings size={18} />
            </button>
        </div>
      </div>

      {/* GÜNÜN EDEBİ SÖZÜ */}
      <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl my-auto py-6 shrink-0 text-center relative overflow-hidden h-auto min-h-[160px] flex flex-col justify-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-violet-400 block mb-1">Günün Alıntısı</span>
          <p className="text-sm italic font-semibold leading-relaxed text-zinc-100 px-1 font-serif">
              {quoteObj.quote}
          </p>
          <p className="text-[10px] font-black text-yellow-400 mt-1">
              {quoteObj.author} / {quoteObj.work}
          </p>
      </div>

      {/* ROZET VİTRİNİ ("DÜZENLE" YAZISI KALDIRILDI) */}
      <div className={`p-4 rounded-3xl bg-white/5 border ${theme.colors.surfaceBorder} mb-6 shrink-0`}>
          <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-sm">🏆</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/65">Rozet Vitrini (5)</span>
              </div>
          </div>
          
          <div className="flex justify-center gap-3.5 py-1">
              {renderShowcaseSlots()}
          </div>
      </div>

      {/* BUTONLAR */}
      <div className="flex flex-col gap-3 shrink-0">
          <button 
             onClick={onStart}
             className="w-full py-4 rounded-2xl text-md font-black uppercase tracking-wide flex justify-center items-center gap-2 btn-duo-main text-white"
          >
              <PlayIcon /> OYUNA BAŞLA
          </button>
          
          <div className="grid grid-cols-2 gap-3">
              <button 
                 onClick={onOpenLibrary}
                 className="py-3 rounded-xl text-white font-bold text-xs flex justify-center items-center gap-1.5 btn-duo-sec"
              >
                  <BookOpen size={16} /> Kütüphane
              </button>
              <button 
                 onClick={onOpenShop}
                 className="py-3 rounded-xl text-white font-bold text-xs flex justify-center items-center gap-1.5 btn-duo-sec"
              >
                  <ShoppingBag size={16} /> Mağaza
              </button>
          </div>
      </div>

      {/* STREAK MODALI */}
      {showStreakModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
              <div className={`w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center relative`}>
                  
                  <button 
                     onClick={() => setShowStreakModal(false)}
                     className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 z-50 shadow-md"
                  >
                      <X size={16} className="text-white opacity-90" />
                  </button>

                  <div className="text-5xl mb-2">🔥</div>
                  <h3 className="text-2xl font-black text-white mb-1">{userState.loginStreak} Günlük Seri!</h3>
                  <p className="text-xs text-orange-300 font-bold mb-5">Serinin sıfırlanmasına son birkaç saat kaldı!</p>
                  
                  <div className="flex justify-between items-center px-1 mb-4 bg-black/20 py-2.5 rounded-2xl border border-white/5">
                      <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition">
                          <ChevronLeft size={18} />
                      </button>
                      <span className="text-xs font-black text-white tracking-wide">{currentMonthName} {currentYear}</span>
                      <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition">
                          <ChevronRight size={18} />
                      </button>
                  </div>

                  <div className="flex justify-between items-center px-2 mb-3">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Takvim Görünümü</span>
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">❄️ Kalkan Sınırı: {userState.freezeCount}</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-bold text-white/30 mb-2">
                      <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Pz</span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center p-3 bg-black/30 rounded-2xl mb-5 border border-white/5">
                      {renderMonthlyCalendar()}
                  </div>

                  <button 
                     onClick={() => setShowStreakModal(false)}
                     className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition active:scale-95 shadow-md shadow-orange-500/20"
                  >
                      Çalışmaya Başla!
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
);