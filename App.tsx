import React, { useState, useEffect } from 'react';
import { UserState, GameMode, Theme, ShopItem, UserSettings } from './types';
import { THEMES, AVATARS, TITLES } from './constants';
import { MainMenu } from './components/MainMenu';
import { GameModeSelector } from './components/GameModeSelector';
import { GameScreen } from './components/GameScreen';
import { Shop } from './components/Shop';
import { Library } from './components/Library';
import { SettingsModal } from './components/SettingsModal';
import { StatsDashboard } from './components/StatsDashboard';
import { LocalNotifications } from '@capacitor/local-notifications';

const getDefaultState = (): UserState => ({
    points: 0,
    ownedThemes: ['modern_violet'],
    ownedAvatars: ['default_pen'],
    ownedTitles: ['novice'],
    currentThemeId: 'modern_violet',
    currentAvatarId: 'default_pen',
    currentTitleId: 'novice',
    settings: { sound: true, music: false, vibration: true },
    lastLoginDate: new Date().toISOString().split('T')[0],
    loginStreak: 1,
    freezeCount: 2,
    frozenDates: [],
    favorites: [],
    gameHistory: [],
    highScores: {
      MATCHING: 0, TRUE_FALSE: 0, WORD_HUNT: 0, PERIOD_QUIZ: 0, SPY_CARD: 0, INK_BLOT: 0
    }
});

const getInitialState = (): UserState => {
  const saved = localStorage.getItem('edebiyat_ustasi_save_v3');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.ownedAvatars) parsed.ownedAvatars = ['default_pen'];
      if (!parsed.ownedTitles) parsed.ownedTitles = ['novice'];
      if (!parsed.currentAvatarId) parsed.currentAvatarId = 'default_pen';
      if (!parsed.currentTitleId) parsed.currentTitleId = 'novice';
      if (!parsed.gameHistory) parsed.gameHistory = [];
      if (!parsed.settings) parsed.settings = { sound: true, music: false, vibration: true };
      if (!parsed.favorites) parsed.favorites = [];
      if (parsed.freezeCount === undefined) parsed.freezeCount = 2;
      if (!parsed.frozenDates) parsed.frozenDates = [];
      if (!parsed.highScores) parsed.highScores = getDefaultState().highScores;
      return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  return getDefaultState();
};

enum AppView {
  MENU,
  MODE_SELECT,
  GAME,
  SHOP,
  LIBRARY,
  STATS
}

let ambientInterval: any = null;
let ambientAudioCtx: AudioContext | null = null;

const startAmbientMusic = (isEnabled: boolean) => {
    if (!isEnabled) {
        stopAmbientMusic();
        return;
    }
    if (ambientInterval) return;

    try {
        ambientAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const progressions = [
            [220.00, 261.63, 329.63, 392.00], 
            [174.61, 220.00, 261.63, 349.23], 
            [261.63, 329.63, 392.00, 523.25], 
            [196.00, 246.94, 293.66, 392.00], 
            [220.00, 261.63, 329.63, 440.00], 
            [146.83, 174.61, 220.00, 293.66], 
            [164.81, 207.65, 246.94, 329.63], 
            [196.00, 246.94, 293.66, 349.23]  
        ];
        let beat = 0;
        let chordIdx = 0;

        ambientInterval = setInterval(() => {
            if (!ambientAudioCtx) return;
            if (ambientAudioCtx.state === 'suspended') {
                ambientAudioCtx.resume();
            }

            const currentChord = progressions[chordIdx];
            if (beat % 8 === 0) {
                chordIdx = (chordIdx + 1) % progressions.length;
            }

            const isFirstBeat = beat % 8 === 0;
            const isArpeggioBeat = beat % 2 === 0;
            const isMelodyBeat = Math.random() > 0.45;

            let notesToPlay: number[] = [];
            let volume = 0.008;

            if (isFirstBeat) {
                notesToPlay = [currentChord[0] / 2, ...currentChord];
                volume = 0.012;
            } else if (isArpeggioBeat) {
                notesToPlay = [currentChord[beat % 4]];
                volume = 0.009;
            } else if (isMelodyBeat) {
                const melodyNote = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
                notesToPlay = [melodyNote];
                volume = 0.011;
            }

            notesToPlay.forEach((freq) => {
                if (!ambientAudioCtx) return;
                const osc = ambientAudioCtx.createOscillator();
                const filter = ambientAudioCtx.createBiquadFilter();
                const gain = ambientAudioCtx.createGain();

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ambientAudioCtx.destination);

                osc.type = 'triangle'; 
                osc.frequency.setValueAtTime(freq, ambientAudioCtx.currentTime);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(700, ambientAudioCtx.currentTime);

                gain.gain.setValueAtTime(0, ambientAudioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(volume, ambientAudioCtx.currentTime + 0.12);
                gain.gain.exponentialRampToValueAtTime(0.0001, ambientAudioCtx.currentTime + 2.0);

                osc.start();
                osc.stop(ambientAudioCtx.currentTime + 2.0);

                setTimeout(() => {
                    try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e){}
                }, 2200);
            });

            beat = (beat + 1) % 512;
        }, 550);
    } catch (e) {
        console.error("Melodik müzik başlatılamadı:", e);
    }
};

const stopAmbientMusic = () => {
    if (ambientInterval) {
        clearInterval(ambientInterval);
        ambientInterval = null;
    }
    if (ambientAudioCtx) {
        ambientAudioCtx.close();
        ambientAudioCtx = null;
    }
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(getInitialState);
  const [currentView, setCurrentView] = useState<AppView>(AppView.MENU);
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.MATCHING);
  const [useFavorites, setUseFavorites] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              stopAmbientMusic();
          } else {
              if (userState.settings.music) {
                  startAmbientMusic(true);
              }
          }
      };

      if (userState.settings.music && !document.hidden) {
          startAmbientMusic(true);
      } else {
          startAmbientMusic(false);
      }

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          stopAmbientMusic();
      };
  }, [userState.settings.music]); 

  // ANDROID NATIVE BİLDİRİM PLANLAYICISI
  useEffect(() => {
    const setupAndroidNotifications = async () => {
      try {
        const permission = await LocalNotifications.requestPermissions();
        
        if (permission.display === 'granted') {
          const hasNotifiedWelcome = localStorage.getItem('edebiyat_welcome_notified_v3');
          
          if (!hasNotifiedWelcome) {
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: "Edebiyat Ustası 📚",
                  body: "Edebiyat dünyasına hoş geldiniz! Serinizi korumak için her gün bir test çözün. 🛡️❄️",
                  id: 1,
                  schedule: { at: new Date(Date.now() + 1000) }
                }
              ]
            });
            localStorage.setItem('edebiyat_welcome_notified_v3', 'true');
          }

          await LocalNotifications.cancel({ notifications: [{ id: 22 }] });

          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Edebiyat Ustası ⏱️",
                body: "Dostum! Son 2 saatin kaldı, hemen girip bir oyun oynamazsan serin yanıp kül olacak! Acele et! 🔥",
                id: 22,
                schedule: {
                  on: {
                    hour: 22,
                    minute: 0
                  },
                  repeats: true
                }
              }
            ]
          });
        }
      } catch (e) {
        console.error("Android yerel bildirim hatası:", e);
      }
    };

    setupAndroidNotifications();
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view !== undefined) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView(AppView.MENU);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.history.pushState({ view }, '');
  };

  // -------------------------------------------------------------
  // GELİŞTİRİLMİŞ GÜN / SERİ KONTROL SİSTEMİ (UYGULAMA AÇILINCA KONTROL EDER)
  // -------------------------------------------------------------
  useEffect(() => {
    setUserState(prev => {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastLogin = prev.lastLoginDate;

        if (todayStr === lastLogin) return prev; // Bugün zaten giriş yapılmış

        const today = new Date(todayStr);
        const lastDate = new Date(lastLogin);
        
        // Geçen gün farkını hesapla (milisaniyeyi güne çevir)
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        if (diffDays <= 1) {
            // Tam 1 gün geçmiş (Dün girmiş), seri 1 artar
            return {
                ...prev,
                lastLoginDate: todayStr,
                loginStreak: prev.loginStreak + 1
            };
        } else {
            // Birden fazla gün kaçırılmış! (Örn: 2 gün veya daha fazla girilmemiş)
            // Dondurma hakkı var mı kontrol et
            let newFreezeCount = prev.freezeCount;
            let newStreak = prev.loginStreak;

            if (newFreezeCount > 0) {
                // Dondurma hakkı varsa 1 tanesini düş ve seriyi koru
                newFreezeCount -= 1;
                newStreak = prev.loginStreak + 1; 
            } else {
                // HİÇ DONDURMA HAKKI YOK -> SERİ DİREKT SIFIRLANIYOR!
                newStreak = 1;
            }

            return {
                ...prev,
                lastLoginDate: todayStr,
                loginStreak: newStreak,
                freezeCount: newFreezeCount
            };
        }
    });
  }, []); 

  useEffect(() => {
    localStorage.setItem('edebiyat_ustasi_save_v3', JSON.stringify(userState));
  }, [userState]);

  const currentTheme = THEMES.find(t => t.id === userState.currentThemeId) || THEMES[0];

  const handleStartGame = () => {
    navigateTo(AppView.MODE_SELECT);
  };

  const handleModeSelect = (mode: GameMode, selectUseFavorites: boolean) => {
    setSelectedMode(mode);
    setUseFavorites(selectUseFavorites);
    navigateTo(AppView.GAME);
  };

  const handleGameEnd = (score: number, historyItem?: any) => {
    setUserState(prev => {
        const newHistory = historyItem ? [...prev.gameHistory, ...historyItem].slice(-50) : prev.gameHistory;
        const balancedPoints = score * 3; 
        return {
            ...prev,
            points: prev.points + balancedPoints,
            gameHistory: newHistory,
            highScores: {
                ...prev.highScores,
                [selectedMode]: Math.max(prev.highScores[selectedMode], score)
            }
        };
    });
    navigateTo(AppView.MENU);
  };

  const handleToggleFavorite = (workTitle: string) => {
      setUserState(prev => {
          const isFav = prev.favorites.includes(workTitle);
          const newFavs = isFav 
              ? prev.favorites.filter(title => title !== workTitle)
              : [...prev.favorites, workTitle];
          return { ...prev, favorites: newFavs };
      });
  };

  const handleBuyItem = (item: ShopItem) => {
    if (userState.points >= item.cost) {
      setUserState(prev => {
         const newState = { ...prev, points: prev.points - item.cost };
         if (item.type === 'THEME') {
             if (!newState.ownedThemes.includes(item.id)) {
                 newState.ownedThemes = [...newState.ownedThemes, item.id];
                 newState.currentThemeId = item.id;
             }
         } else if (item.type === 'AVATAR') {
             if (!newState.ownedAvatars.includes(item.id)) {
                 newState.ownedAvatars = [...newState.ownedAvatars, item.id];
                 newState.currentAvatarId = item.id;
             }
         } else if (item.type === 'TITLE') {
             if (!newState.ownedTitles.includes(item.id)) {
                 newState.ownedTitles = [...newState.ownedTitles, item.id];
                 newState.currentTitleId = item.id;
             }
         }
         return newState;
      });
    }
  };

  const handleEquipItem = (item: ShopItem) => {
      setUserState(prev => {
          const newState = { ...prev };
          if (item.type === 'THEME' && prev.ownedThemes.includes(item.id)) {
              newState.currentThemeId = item.id;
          } else if (item.type === 'AVATAR' && prev.ownedAvatars.includes(item.id)) {
              newState.currentAvatarId = item.id;
          } else if (item.type === 'TITLE' && prev.ownedTitles.includes(item.id)) {
              newState.currentTitleId = item.id;
          }
          return newState;
      });
  };

  const handleToggleSetting = (key: keyof UserSettings) => {
      setUserState(prev => ({
          ...prev,
          settings: { ...prev.settings, [key]: !prev.settings[key] }
      }));
  };

  const handleResetData = () => {
      const cleanState = getDefaultState();
      setUserState(cleanState);
      localStorage.setItem('edebiyat_ustasi_save_v3', JSON.stringify(cleanState));
      localStorage.removeItem('edebiyat_showcase_badges_v3');
      localStorage.removeItem('edebiyat_asked_history_v3');
      localStorage.removeItem('edebiyat_welcome_notified_v3');
      setIsSettingsOpen(false);
      navigateTo(AppView.MENU);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ${currentTheme.colors.bgGradient} overflow-hidden font-sans relative selection:bg-white/30 selection:text-white`}>
      <div className="relative h-screen flex flex-col overflow-hidden z-10">
        {isSettingsOpen && (
            <SettingsModal 
                theme={currentTheme}
                settings={userState.settings}
                onClose={() => setIsSettingsOpen(false)}
                onToggleSetting={handleToggleSetting}
                onResetData={handleResetData}
            />
        )}

        {currentView === AppView.MENU && (
          <MainMenu 
            userState={userState} 
            theme={currentTheme}
            onStart={handleStartGame}
            onOpenShop={() => navigateTo(AppView.SHOP)}
            onOpenLibrary={() => navigateTo(AppView.LIBRARY)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenStats={() => navigateTo(AppView.STATS)}
          />
        )}

        {currentView === AppView.MODE_SELECT && (
          <GameModeSelector 
            theme={currentTheme}
            userState={userState}
            onSelectMode={handleModeSelect}
            onBack={() => navigateTo(AppView.MENU)}
          />
        )}

        {currentView === AppView.GAME && (
          <GameScreen 
            mode={selectedMode}
            theme={currentTheme}
            useFavorites={useFavorites}
            favoritesList={userState.favorites}
            settings={userState.settings} 
            onBack={() => navigateTo(AppView.MODE_SELECT)} 
            onGameEnd={handleGameEnd}
          />
        )}

        {currentView === AppView.SHOP && (
          <Shop 
            userState={userState}
            currentTheme={currentTheme}
            onBuyTheme={handleBuyItem}
            onSelectTheme={handleEquipItem}
            onBuyFreeze={() => {
                const COST = 150;
                if (userState.points >= COST) {
                    setUserState(prev => ({
                        ...prev,
                        points: prev.points - COST,
                        freezeCount: prev.freezeCount + 1
                    }));
                } else {
                    alert(`Yetersiz Puan! Seri dondurucu satın almak için en az ${COST} puana sahip olmalısınız.`);
                }
            }}
            onBack={() => navigateTo(AppView.MENU)}
          />
        )}

        {currentView === AppView.LIBRARY && (
            <Library 
                theme={currentTheme}
                userState={userState}
                onToggleFavorite={handleToggleFavorite}
                onBack={() => navigateTo(AppView.MENU)}
            />
        )}

        {currentView === AppView.STATS && (
            <StatsDashboard 
                theme={currentTheme}
                userState={userState}
                onBack={() => navigateTo(AppView.MENU)}
            />
        )}
      </div>
    </div>
  );
}