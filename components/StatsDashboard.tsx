import React, { useState, useEffect } from 'react';
import { Theme, UserState } from '../types';
import { ArrowLeft, Calendar, Award, Check, X } from 'lucide-react';
import { FALLBACK_DATA } from '../constants';

interface StatsProps {
  theme: Theme;
  userState: UserState;
  onBack: () => void;
}

export const StatsDashboard: React.FC<StatsProps> = ({ theme, userState, onBack }) => {
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [pinnedBadges, setPinnedBadges] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edebiyat_showcase_badges_v3');
    if (saved) {
      setPinnedBadges(JSON.parse(saved));
    }
  }, []);

  const totalGames = userState.gameHistory.length;
  const correctAnswers = userState.gameHistory.filter(item => item.isCorrect).length;
  const wrongAnswers = userState.gameHistory.filter(item => !item.isCorrect).length;
  const successRate = totalGames > 0 ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100) : 0;

  const monthlyArchives = [
    { id: 'july_2026', date: 'Temmuz 2026 (Aktif)', correct: correctAnswers, wrong: wrongAnswers, rate: successRate }
  ];

  // 33 ADET BAŞARIM LİSTESİ
  const achievements = [
    { id: 'novice', name: 'İlk Adım', desc: 'İlk oyunu oyna.', icon: '👣', isUnlocked: totalGames > 0 },
    { id: 'tanz_easy', name: 'Tanzimat Çırağı', desc: 'Dönem Dedektifi modunda ilk puanını al.', icon: '📜', isUnlocked: userState.highScores.PERIOD_QUIZ > 0 },
    { id: 'tf_easy', name: 'Doğrucu Davut', desc: 'Doğru/Yanlış modunda ilk puanını al.', icon: '✅', isUnlocked: userState.highScores.TRUE_FALSE > 0 },
    { id: 'spy_easy', name: 'Casus Avcısı', desc: 'Casus Kart modunda ilk puanını al.', icon: '🕵️', isUnlocked: userState.highScores.SPY_CARD > 0 },
    { id: 'word_easy', name: 'Harf Avcısı', desc: 'Harf Avcısı modunda ilk puanını al.', icon: '🆎', isUnlocked: userState.highScores.WORD_HUNT > 0 },
    { id: 'blot_easy', name: 'Mürekkep Lekesi', desc: 'Mürekkep Lekesi modunda ilk puanını al.', icon: '✒️', isUnlocked: userState.highScores.INK_BLOT > 0 },
    { id: 'fav_easy', name: 'Kitap Dostu', desc: 'Kütüphaneden ilk favori eserini seç.', icon: '📚', isUnlocked: userState.favorites.length >= 1 },
    { id: 'streak_easy', name: 'Kıvılcım', desc: '2 günlük bir giriş serisi yakala.', icon: '⚡', isUnlocked: userState.loginStreak >= 2 },
    { id: 'points_easy', name: 'Kumbara', desc: 'İlk 100 puanını biriktir.', icon: '🪙', isUnlocked: userState.points >= 100 },
    { id: 'shop_easy', name: 'Tasarım Meraklısı', desc: 'İlk yeni temanı mağazadan satın al.', icon: '🎨', isUnlocked: userState.ownedThemes.length >= 2 },
    { id: 'games_medium', name: 'Hırslı Okur', desc: 'Toplamda 10 oyun tamamla.', icon: '📈', isUnlocked: totalGames >= 10 },
    { id: 'tanz_medium', name: 'Tanzimat Muhafızı', desc: 'Dönem Dedektifi modunda 60 puan barajını aş.', icon: '🛡️', isUnlocked: userState.highScores.PERIOD_QUIZ >= 60 },
    { id: 'tf_medium', name: 'Hakikat Bekçisi', desc: 'Doğru/Yanlış modunda 60 puan barajını aş.', icon: '🔍', isUnlocked: userState.highScores.TRUE_FALSE >= 60 },
    { id: 'spy_medium', name: 'Dedektif Gözü', desc: 'Casus Kart modunda 60 puan barajını aş.', icon: '👁️', isUnlocked: userState.highScores.SPY_CARD >= 60 },
    { id: 'scramble_master', name: 'Sözlük Bükücü', desc: 'Harf Avcısı modunda 50 puanı aş.', icon: '🆎', isUnlocked: userState.highScores.WORD_HUNT >= 50 },
    { id: 'shadow_det', name: 'Sır Katibi', desc: 'Gölge Yazar modunda 50 puanı aş.', icon: '🕶️', isUnlocked: userState.highScores.SHADOW_AUTHOR >= 50 },
    { id: 'blot_master', name: 'Mürekkep Ustası', desc: 'Mürekkep Lekesi modunda 50 puanı aş.', icon: '✒️', isUnlocked: userState.highScores.INK_BLOT >= 50 },
    { id: 'collector_1', name: 'Koleksiyoncu', desc: 'En az 2 tema satın al.', icon: '🎨', isUnlocked: userState.ownedThemes.length >= 2 },
    { id: 'collector_2', name: 'Maskeli Balo', desc: 'En az 3 farklı avatar satın al.', icon: '🎭', isUnlocked: userState.ownedAvatars.length >= 3 },
    { id: 'collector_3', name: 'Unvan Canavarı', desc: 'En az 3 farklı unvan satın al.', icon: '🔍', isUnlocked: userState.ownedTitles.length >= 3 },
    { id: 'legend_title', name: 'Yaşayan Efsane', desc: 'Son unvan olan Yaşayan Efsane unvanını kuşan.', icon: '🕊️', isUnlocked: userState.currentTitleId === 'legend' },
    { id: 'perfect', name: 'Kusursuz Deha', desc: 'Herhangi bir oyunu tam puanla bitir.', icon: '🎓', isUnlocked: Object.values(userState.highScores).some(s => s >= 100) },
    { id: 'tf_god', name: 'Hızlı Silahşör', desc: 'Doğru/Yanlış modunda 120 puanı aş.', icon: '⚡', isUnlocked: userState.highScores.TRUE_FALSE >= 120 },
    { id: 'period_god', name: 'Cumhuriyet Fatihi', desc: 'Dönem Dedektifi modunda 100 puanı aş.', icon: '🏛️', isUnlocked: userState.highScores.PERIOD_QUIZ >= 100 },
    { id: 'fav_hard', name: 'Edebiyat Oburu', desc: 'Kütüphaneden tam 15 eseri favorile.', icon: '🦁', isUnlocked: userState.favorites.length >= 15 },
    { id: 'streak_hard', name: 'Haftalık Muhafız', desc: 'Giriş serisini tam 7 güne ulaştır.', icon: '🏰', isUnlocked: userState.loginStreak >= 7 },
    { id: 'points_hard', name: 'Altın Kesesi', desc: 'Toplamda 2000 puana ulaş.', icon: '💰', isUnlocked: userState.points >= 2000 },
    { id: 'theme_hard', name: 'Müze Müdürü', desc: 'Mağazadaki tüm temaları satın al.', icon: '🎨', isUnlocked: userState.ownedThemes.length >= 4 },
    { id: 'avatar_hard', name: 'Bin Yüzlü Kahraman', desc: 'Mağazadaki tüm avatarları satın al.', icon: '👤', isUnlocked: userState.ownedAvatars.length >= 7 },
    { id: 'games_hard', name: 'Sınav Canavarı', desc: 'Toplamda 50 oyun tamamla.', icon: '🐉', isUnlocked: totalGames >= 50 },
    { id: 'night_owl', name: 'Gece Kuşu', desc: 'Gece yarısından sonra oyun oyna.', icon: '🦉', isUnlocked: new Date().getHours() < 4 },
    { id: 'freeze_master', name: 'Buz Muhafızı', desc: 'En az bir kez seri dondurucu kullan.', icon: '❄️', isUnlocked: userState.freezeCount < 2 },
    { id: 'divan_master', name: 'Divan Şairi', desc: 'Tüm oyun modlarında toplam 300 puan barajını aş.', icon: '✍️', isUnlocked: Object.values(userState.highScores).reduce((a, b) => a + b, 0) >= 300 }
  ];

  // AÇIK OLAN BAŞARIMLARI OTOMATİK OLARAK EN ÜSTE TAŞIYAN AKILLI SIRALAMA
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return 0;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const handleTogglePin = (badgeIcon: string) => {
      let newPinned = [...pinnedBadges];
      if (pinnedBadges.includes(badgeIcon)) {
          newPinned = pinnedBadges.filter(icon => icon !== badgeIcon);
      } else {
          if (pinnedBadges.length >= 5) {
              alert("Vitrinde en fazla 5 adet rozet sergileyebilirsiniz!");
              return;
          }
          newPinned.push(badgeIcon);
      }
      setPinnedBadges(newPinned);
      localStorage.setItem('edebiyat_showcase_badges_v3', JSON.stringify(newPinned));
  };

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-hidden animate-fade-in z-20 relative max-w-md mx-auto">
      
      {/* Üst Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button onClick={onBack} className={`p-2 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm transition ${theme.colors.text}`}>
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
            <h2 className="text-xl font-black text-white">Nakkaşhane 🎨</h2>
            <p className="text-xs text-white/50">Karne Arşivi ve 33 Rozet</p>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pb-8 pr-1">
          
          {/* EDEBİ KARNE */}
          <div className={`p-5 rounded-3xl bg-white/5 border ${theme.colors.surfaceBorder} text-center`}>
              <h3 className="text-sm font-black text-white/70 uppercase tracking-widest mb-4">Edebi Başarı Oranı</h3>
              
              <div className="w-28 h-28 rounded-full border-4 border-violet-500/30 flex flex-col items-center justify-center mx-auto mb-3 shadow-inner bg-black/20">
                  <span className="text-3xl font-black text-yellow-400">%{successRate}</span>
                  <span className="text-[10px] font-bold text-white/40">Başarı Oranı</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 border-t border-white/5 pt-4 text-xs font-semibold">
                  <div className="text-left bg-black/10 p-2.5 rounded-xl border border-white/5">
                      <span className="text-white/40 block text-[10px] uppercase">Toplam Doğru</span>
                      <span className="text-green-400 text-lg font-black">{correctAnswers} Soru</span>
                  </div>
                  <div className="text-left bg-black/10 p-2.5 rounded-xl border border-white/5">
                      <span className="text-white/40 block text-[10px] uppercase">Toplam Yanlış</span>
                      <span className="text-red-400 text-lg font-black">{wrongAnswers} Soru</span>
                  </div>
              </div>
          </div>

          {/* BAŞARIM ROZETLERİ (AÇIKLAR EN ÜSTTE) */}
          <div className="space-y-3">
              <div className="flex flex-col text-left px-1 mb-2">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest">Rozet Koleksiyonu ({unlockedCount}/33)</h3>
                  <p className="text-[9px] text-white/40 mt-0.5">Kilidi açılan rozetleri vitrine eklemek için üzerine dokunun.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {sortedAchievements.map((a) => {
                      const isPinned = pinnedBadges.includes(a.icon);
                      return (
                          <div 
                             key={a.id} 
                             onClick={() => a.isUnlocked && handleTogglePin(a.icon)}
                             className={`p-4 rounded-3xl border flex items-center gap-4 transition-all duration-300 relative cursor-pointer
                                 ${a.isUnlocked 
                                     ? 'bg-gradient-to-r from-violet-950/40 to-slate-900/40 border-violet-500/30 opacity-100 shadow-md active:scale-98' 
                                     : 'bg-black/30 border-white/5 opacity-40 cursor-not-allowed'
                                 }
                             `}
                          >
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0
                                  ${a.isUnlocked ? 'bg-violet-500/20 border border-violet-500/25' : 'bg-white/5 border border-white/5 grayscale'}
                              `}>
                                  {a.icon}
                              </div>
                              
                              <div className="flex-1 text-left flex flex-col justify-center overflow-hidden pr-6">
                                  <div className="flex items-center gap-1.5 truncate">
                                      <span className={`text-sm font-black truncate ${a.isUnlocked ? 'text-white' : 'text-white/40'}`}>{a.name}</span>
                                      {a.isUnlocked && <span className="text-[8px] bg-green-500/20 text-green-400 font-black px-1.5 py-0.5 rounded-full uppercase scale-90 shrink-0">Açık</span>}
                                  </div>
                                  <span className="text-[10px] text-white/50 leading-tight mt-0.5 break-words">{a.desc}</span>
                              </div>

                              {isPinned && (
                                  <div className="absolute top-2.5 right-3 text-xs animate-pulse text-yellow-400">
                                      ⭐
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* AYLIK ARŞİV */}
          <div className="space-y-3 shrink-0">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest px-1">Aylık Karne Arşivi</h3>
              <div className="space-y-2">
                  {monthlyArchives.map((archive) => (
                      <div 
                         key={archive.id}
                         onClick={() => setSelectedArchive(selectedArchive === archive.id ? null : archive.id)}
                         className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/10 active:scale-99 transition"
                      >
                          <div className="flex items-center gap-3">
                              <span className="text-xl">📅</span>
                              <div className="text-left">
                                  <div className="text-sm font-black text-white">{archive.date}</div>
                                  <div className="text-[10px] text-white/50">Başarı Oranı: %{archive.rate}</div>
                              </div>
                          </div>
                          <span className="text-xs text-yellow-400 font-black">Detay Göster</span>
                      </div>
                  ))}
              </div>
          </div>

      </div>

      {selectedArchive && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
              {(() => {
                  const currentArchive = monthlyArchives.find(a => a.id === selectedArchive);
                  if (!currentArchive) return null;
                  return (
                      <div className={`w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center relative`}>
                          <button 
                             onClick={() => setSelectedArchive(null)}
                             className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 z-50 shadow-md"
                          >
                              <XIcon />
                          </button>

                          <span className="text-4xl mb-2 block animate-bounce">🎓</span>
                          <h3 className="text-xl font-black text-white mb-1">{currentArchive.date} Karnesi</h3>
                          <p className="text-xs text-white/50 mb-6">Geçmiş Başarı Analiziniz</p>
                          
                          <div className="p-4 bg-black/20 rounded-2xl mb-6 text-sm font-bold flex flex-col items-center justify-center gap-2">
                              <span className="text-yellow-400 text-3xl">%{currentArchive.rate}</span>
                              <span className="text-xs text-white/40">Ortalama Başarı Oranı</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-bold text-left">
                              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300">
                                  <span className="block text-[10px] text-green-500">Doğru Sayısı</span>
                                  <span>{currentArchive.correct} Soru</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                                  <span className="block text-[10px] text-red-500">Yanlış Sayısı</span>
                                  <span>{currentArchive.wrong} Soru</span>
                              </div>
                          </div>

                          <button 
                             onClick={() => setSelectedArchive(null)}
                             className={`w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition active:scale-95`}
                          >
                              Kapat
                          </button>
                      </div>
                  );
              })()}
          </div>
      )}

    </div>
  );
};

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);