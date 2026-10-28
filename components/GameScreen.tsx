import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthorWorkPair, CardItem, GameMode, Theme } from '../types';
import { fetchGameData } from '../services/geminiService';
import { Card } from './Card';
import { ArrowLeft, Check, X, Award, HelpCircle, SkipForward } from 'lucide-react';
import { FALLBACK_DATA } from '../constants';

const playSound = (type: 'correct' | 'wrong', isSoundEnabled: boolean) => {
  if (!isSoundEnabled) return; 
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); 
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Ses çalınamadı:", e);
  }
};

const triggerVibration = (type: 'correct' | 'wrong', isVibrationEnabled: boolean) => {
  if (!isVibrationEnabled) return; 
  if (navigator.vibrate) {
    if (type === 'wrong') {
      navigator.vibrate([150, 80, 150]);
    } else {
      navigator.vibrate(60);
    }
  }
};

interface GameScreenProps {
  mode: GameMode;
  theme: Theme;
  useFavorites: boolean;
  favoritesList: string[];
  settings: { sound: boolean; music: boolean; vibration: boolean }; 
  onBack: () => void;
  onGameEnd: (score: number, history?: any) => void; 
}

export const GameScreen: React.FC<GameScreenProps> = ({ mode, theme, useFavorites, favoritesList, settings, onBack, onGameEnd }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AuthorWorkPair[]>([]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameAnalysis, setGameAnalysis] = useState<any[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const count = mode === GameMode.MATCHING ? 6 : 12; 

    let sourcePool = FALLBACK_DATA;
    if (useFavorites && favoritesList.length >= 4) {
        sourcePool = FALLBACK_DATA.filter(item => favoritesList.includes(item.work));
    }

    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
    setData(shuffled.slice(0, count));
    setLoading(false);
  }, [mode, useFavorites, favoritesList]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerResult = useCallback((isCorrect: boolean) => {
      if (isCorrect) {
          playSound('correct', settings.sound);
          triggerVibration('correct', settings.vibration);
      } else {
          playSound('wrong', settings.sound);
          triggerVibration('wrong', settings.vibration);
      }
  }, [settings.sound, settings.vibration]);

  const handleAddHistory = useCallback((question: string, userAnswer: string, correctAnswer: string, isCorrect: boolean, scoreEarned: number) => {
      setGameAnalysis(prev => [...prev, { question, userAnswer, correctAnswer, isCorrect, scoreEarned }]);
      handleAnswerResult(isCorrect);
  }, [handleAnswerResult]);

  const handleAddScore = useCallback((s: number) => {
      setScore(prev => prev + s);
  }, []);

  const handleMinusLife = useCallback(() => {
      setHearts(prev => {
          const nextLife = prev - 1;
          if (nextLife <= 0) {
              setGameOver(true);
          }
          return nextLife;
      });
  }, []);

  const handleGameEndTrigger = useCallback(() => {
      setGameOver(true);
  }, []);

  const handleReplay = () => {
      setScore(0);
      setHearts(3);
      setGameAnalysis([]);
      setGameOver(false);
      loadQuestions(); 
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center z-20 relative animate-fade-in p-6">
        <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${theme.colors.text} mb-4 opacity-80`}></div>
        <p className={`text-lg font-bold ${theme.colors.text} animate-pulse`}>Sınav Hazırlanıyor...</p>
        <p className={`text-xs mt-1 ${theme.colors.textSecondary}`}>Seçilen eserler yükleniyor...</p>
      </div>
    );
  }

  if (gameOver) {
    const corrects = gameAnalysis.filter(a => a.isCorrect).length;
    const wrongs = gameAnalysis.filter(a => !a.isCorrect).length;

    return (
      <div className="flex flex-col h-full w-full p-4 animate-fade-in z-20 relative overflow-y-auto max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6 pt-4 shrink-0">
            <div className={`p-5 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20 shadow-2xl`}>
                <Award size={48} className="text-yellow-400" />
            </div>
            <h2 className={`text-2xl font-black mb-1 ${theme.colors.text} drop-shadow-md`}>Oyun Sonu Analizi</h2>
            <div className={`text-4xl font-black mb-4 ${theme.colors.accent}`}>{score} Puan</div>
            
            <div className="flex gap-4 mb-6">
                <span className="text-xs font-bold px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full">✔️ {corrects} Doğru</span>
                <span className="text-xs font-bold px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full">❌ {wrongs} Yanlış</span>
            </div>

            <div className="w-full space-y-3">
                <button 
                  onClick={() => onGameEnd(score, gameAnalysis)} 
                  className={`w-full py-3.5 rounded-2xl shadow-md font-bold text-md ${theme.colors.button} transform transition hover:scale-102 active:scale-95`}
                >
                  Cüzdanına Aktar ve Dön
                </button>
                
                <button 
                  onClick={handleReplay}
                  className="w-full py-3.5 rounded-2xl shadow-md font-black text-md bg-sky-500 border-b-4 border-sky-700 hover:bg-sky-600 active:border-b-0 active:mt-1 active:mb-[-4px] text-white transform transition duration-75"
                >
                  🔄 Yeniden Oyna
                </button>
            </div>
        </div>

        {gameAnalysis.length > 0 && (
            <div className={`w-full rounded-2xl ${theme.colors.surface} border ${theme.colors.surfaceBorder} p-4 mb-6 shrink-0`}>
                <h3 className={`text-sm font-black mb-3 ${theme.colors.text} flex items-center`}>
                    📋 Hangi Sorulardan Puan Aldın?
                </h3>
                <div className="space-y-2">
                    {gameAnalysis.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-black/15 border border-white/5 flex justify-between items-center text-xs">
                            <div className="flex-1 mr-2">
                                <div className={`font-bold ${theme.colors.text}`}>{item.question}</div>
                                <div className="text-[10px] text-white/50 mt-1">Senin Cevabın: <b>{item.userAnswer}</b></div>
                                {!item.isCorrect && (
                                     <div className="text-[10px] text-green-400 font-bold mt-0.5">Doğrusu: {item.correctAnswer}</div>
                                )}
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                {item.isCorrect ? (
                                    <span className="text-green-400 font-bold">+{item.scoreEarned} Puan</span>
                                ) : (
                                    <span className="text-red-400 font-bold">0 Puan</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative z-20 overflow-hidden">
       {/* Top Bar */}
       <div className={`flex justify-between items-center p-3 shrink-0`}>
          <button onClick={() => setShowExitConfirm(true)} className={`p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition ${theme.colors.text}`}>
              <ArrowLeft size={20} />
          </button>
          
          <div className={`px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10`}>
              <span className={`font-bold ${theme.colors.accent} text-sm`}>{score} Puan</span>
          </div>
      </div>

      <div className="flex-1 overflow-hidden relative p-3 flex flex-col justify-center">
        
        {isConditionBasedEndMode(mode) && (
            <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={`text-xl transition-all duration-300 ${i < hearts ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'opacity-20'}`}>
                        ❤️
                    </span>
                ))}
            </div>
        )}

        {mode === GameMode.MATCHING && (
          <MatchingGame data={data} theme={theme} onAddScore={handleAddScore} onEnd={handleGameEndTrigger} onRecord={handleAddHistory} />
        )}
        {mode === GameMode.TRUE_FALSE && (
          <TrueFalseGame data={data} theme={theme} onAddScore={handleAddScore} onEnd={handleGameEndTrigger} onRecord={handleAddHistory} onMinusLife={handleMinusLife} />
        )}
        {mode === GameMode.WORD_HUNT && (
          <ScrambleGame data={data} theme={theme} onAddScore={handleAddScore} onEnd={handleGameEndTrigger} onRecord={handleAddHistory} />
        )}
        {mode === GameMode.PERIOD_QUIZ && (
          <PeriodGame data={data} theme={theme} onAddScore={handleAddScore} onEnd={handleGameEndTrigger} onRecord={handleAddHistory} onMinusLife={handleMinusLife} />
        )}
        {mode === GameMode.SPY_CARD && (
          <SpyCardGame data={data} theme={theme} onAddScore={handleAddScore} onEnd={handleGameEndTrigger} onRecord={handleAddHistory} onMinusLife={handleMinusLife} />
        )}
        {mode === GameMode.INK_BLOT && (
          <InkBlotGame data={data} theme={theme} onAddScore={handleAddScore} onEnd={handleGameEndTrigger} onRecord={handleAddHistory} onMinusLife={handleMinusLife} />
        )}
      </div>

      {showExitConfirm && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
              <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center">
                  <span className="text-4xl mb-2 block animate-pulse">⚠️</span>
                  <h3 className="text-lg font-black text-white mb-2">Oyundan Çıkılsın mı?</h3>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">
                      Eğer şimdi çıkarsanız bu oyundaki tüm ilerlemeniz ve puanlarınız cüzdanınıza aktarılmayacak!
                  </p>
                  
                  <div className="space-y-3">
                      <button 
                         onClick={onBack} 
                         className="w-full py-3 rounded-xl bg-red-500 border-b-4 border-red-700 hover:bg-red-600 active:border-b-0 active:mt-1 active:mb-[-4px] text-white font-black text-sm transition"
                      >
                          Evet, Oyundan Çık
                      </button>

                      <button 
                         onClick={() => setShowExitConfirm(false)}
                         className="w-full py-3 rounded-xl bg-green-500 border-b-4 border-green-700 hover:bg-green-600 active:border-b-0 active:mt-1 active:mb-[-4px] text-white font-black text-sm transition"
                      >
                          Çalışmaya Devam Et!
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const isConditionBasedEndMode = (mode: GameMode) => {
    return mode !== GameMode.MATCHING && mode !== GameMode.WORD_HUNT;
};

/* --- SUB-GAME COMPONENTS --- */

// 1. MATCHING GAME
const MatchingGame = ({ data, theme, onAddScore, onEnd, onRecord }: { data: AuthorWorkPair[], theme: Theme, onAddScore: (s: number) => void, onEnd: () => void, onRecord: (q:string, a:string, c:string, ok:boolean, pts:number) => void }) => {
    const [cards, setCards] = useState<CardItem[]>([]);
    const [flipped, setFlipped] = useState<CardItem[]>([]);
    const [matches, setMatches] = useState(0);
    const processingRef = useRef(false);

    useEffect(() => {
        const gameCards: CardItem[] = [];
        data.forEach((pair, index) => {
            const pairId = `pair-${index}`;
            gameCards.push({ id: `a-${index}`, content: pair.author, type: 'AUTHOR', pairId, isFlipped: false, isMatched: false });
            gameCards.push({ id: `w-${index}`, content: pair.work, type: 'WORK', pairId, isFlipped: false, isMatched: false });
        });
        setCards(gameCards.sort(() => Math.random() - 0.5));
    }, [data]);

    const handleClick = useCallback((card: CardItem) => {
        if (processingRef.current || card.isMatched || card.isFlipped) return;
        
        setFlipped(prevFlipped => {
             if (prevFlipped.length >= 2) return prevFlipped;
             const newFlipped = [...prevFlipped, card];
             setCards(prevCards => prevCards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));

             if (newFlipped.length === 2) {
                processingRef.current = true;
                
                if (newFlipped[0].pairId === newFlipped[1].pairId) {
                    onAddScore(30);
                    setMatches(prev => {
                        const newMatches = prev + 1;
                        if (newMatches === data.length) setTimeout(onEnd, 500);
                        return newMatches;
                    });
                    
                    const pairContent = `${newFlipped[0].content} - ${newFlipped[1].content}`;
                    onRecord("Eşleştirme", pairContent, pairContent, true, 30);

                    setTimeout(() => {
                        setCards(prev => prev.map(c => (c.id === newFlipped[0].id || c.id === newFlipped[1].id) ? { ...c, isMatched: true } : c));
                        setFlipped([]);
                        processingRef.current = false;
                    }, 500);
                } else {
                    setTimeout(() => {
                        setCards(prev => prev.map(c => (c.id === newFlipped[0].id || c.id === newFlipped[1].id) ? { ...c, isFlipped: false } : c));
                        setFlipped([]);
                        processingRef.current = false;
                    }, 1000);
                }
             }
             return newFlipped;
        });
    }, [data.length, onAddScore, onEnd, onRecord]);

    return (
        <div className="grid grid-cols-3 gap-2.5 h-full content-center overflow-y-auto pb-4 max-h-[75vh]">
            {cards.map(card => <Card key={card.id} item={card} theme={theme} onClick={handleClick} />)}
        </div>
    );
};

// 2. TRUE / FALSE GAME
const TrueFalseGame = ({ data, theme, onAddScore, onEnd, onRecord, onMinusLife }: { data: AuthorWorkPair[], theme: Theme, onAddScore: (s: number) => void, onEnd: () => void, onRecord: (q:string, a:string, c:string, ok:boolean, pts:number) => void, onMinusLife: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<{author: string, work: string, isCorrect: boolean} | null>(null);
    const [timeLeft, setTimeLeft] = useState(5); 
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
    const answeredRef = useRef(false);

    useEffect(() => {
        generateQuestion();
    }, [currentIndex]);

    useEffect(() => {
        if (feedback || answeredRef.current) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswer(false); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [feedback, currentIndex]);

    const generateQuestion = () => {
        if (currentIndex >= data.length) {
            setCurrentIndex(0);
            return;
        }
        const correctPair = data[currentIndex];
        const shouldBeCorrect = Math.random() > 0.5;
        
        if (shouldBeCorrect) {
            setCurrentQuestion({ author: correctPair.author, work: correctPair.work, isCorrect: true });
        } else {
            let wrongWork = FALLBACK_DATA[Math.floor(Math.random() * FALLBACK_DATA.length)].work;
            while (wrongWork === correctPair.work && FALLBACK_DATA.length > 1) {
                 wrongWork = FALLBACK_DATA[Math.floor(Math.random() * FALLBACK_DATA.length)].work;
            }
            setCurrentQuestion({ author: correctPair.author, work: wrongWork, isCorrect: false });
        }
        setTimeLeft(5); 
        setFeedback(null);
        answeredRef.current = false;
    };

    const handleAnswer = (userSaysTrue: boolean) => {
        if (answeredRef.current) return;
        answeredRef.current = true;

        if (!currentQuestion) return;

        const isActuallyCorrect = currentQuestion.isCorrect === userSaysTrue;
        const finalResult = isActuallyCorrect && timeLeft > 0;

        const correctAnswerText = currentQuestion.isCorrect ? "Doğru" : "Yanlış";
        const userAnswerText = userSaysTrue ? "Doğru" : "Yanlış";
        const questionText = `${currentQuestion.author} - ${currentQuestion.work}`;

        onRecord(questionText, userAnswerText, correctAnswerText, finalResult, finalResult ? 15 : 0);
        
        if (finalResult) {
            setFeedback('CORRECT');
            onAddScore(15);
        } else {
            setFeedback('WRONG');
            onMinusLife();
        }

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 1200);
    };

    if (!currentQuestion) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 max-h-[75vh]">
            <div className="w-full h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-green-400 transition-all duration-1000 ease-linear" 
                    style={{ width: `${(timeLeft / 5) * 100}%` }}
                ></div>
            </div>

            <div className={`w-full p-6 rounded-3xl ${theme.colors.surface} border ${theme.colors.surfaceBorder} shadow-xl text-center relative overflow-hidden`}>
                {feedback && (
                     <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 ${feedback === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'}`}>
                         {feedback === 'CORRECT' ? <Check size={48} className="text-white animate-bounce" /> : <X size={48} className="text-white" />}
                     </div>
                )}
                
                <div className="space-y-4">
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Yazar</div>
                        <div className={`text-xl font-bold ${theme.colors.text}`}>{currentQuestion.author}</div>
                    </div>
                    <div className="w-8 h-0.5 mx-auto bg-white/20 rounded-full"></div>
                    <div>
                         <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Eser</div>
                         <div className={`text-2xl font-black ${theme.colors.accent}`}>{currentQuestion.work}</div>
                    </div>
                </div>
            </div>

            <div className="flex w-full gap-3 shrink-0">
                <button 
                    onClick={() => handleAnswer(false)}
                    className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold text-md shadow active:scale-95 transition"
                >
                    YANLIŞ
                </button>
                <button 
                    onClick={() => handleAnswer(true)}
                    className="flex-1 py-4 rounded-xl bg-green-500 text-white font-bold text-md shadow active:scale-95 transition"
                >
                    DOĞRU
                </button>
            </div>
        </div>
    );
};

// 3. SCRAMBLE GAME
const ScrambleGame = ({ data, theme, onAddScore, onEnd, onRecord }: { data: AuthorWorkPair[], theme: Theme, onAddScore: (s: number) => void, onEnd: () => void, onRecord: (q:string, a:string, c:string, ok:boolean, pts:number) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [targetName, setTargetName] = useState("");
    const [shuffledLetters, setShuffledLetters] = useState<{char: string, id: number}[]>([]);
    const [selectedLetters, setSelectedLetters] = useState<{char: string, id: number}[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (currentIndex >= data.length) {
            onEnd();
            return;
        }
        setupLevel();
    }, [currentIndex]);

    const setupLevel = () => {
        const rawName = data[currentIndex].author.toLocaleUpperCase('tr-TR');
        const letters = rawName.split('').filter(c => c.trim() !== '');
        const letterObj = letters.map((char, i) => ({ char, id: i }));
        
        setTargetName(letters.join(''));
        setShuffledLetters(letterObj.sort(() => Math.random() - 0.5));
        setSelectedLetters([]);
        setIsCorrect(false);
    };

    const handleLetterClick = (letter: {char: string, id: number}, isSelecting: boolean) => {
        if (isCorrect) return;

        if (isSelecting) {
            setSelectedLetters([...selectedLetters, letter]);
            setShuffledLetters(shuffledLetters.filter(l => l.id !== letter.id));
        } else {
            setShuffledLetters([...shuffledLetters, letter]);
            setSelectedLetters(selectedLetters.filter(l => l.id !== letter.id));
        }
    };

    const handlePass = () => {
        if (isCorrect) return;
        const currentPair = data[currentIndex];
        onRecord(currentPair.work, "PAS", currentPair.author, false, 0);

        const rawName = currentPair.author.toLocaleUpperCase('tr-TR');
        const letters = rawName.split('').filter(c => c.trim() !== '');
        const visualCompletion = letters.map((char, i) => ({ char, id: -i })); 

        setSelectedLetters(visualCompletion);
        setShuffledLetters([]);
        setIsCorrect(true);

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 1200);
    };

    useEffect(() => {
        const currentString = selectedLetters.map(l => l.char).join('');
        if (currentString === targetName && targetName.length > 0 && !isCorrect) {
            const isUserAction = selectedLetters.every(l => l.id >= 0);
            const currentPair = data[currentIndex];
            
            onRecord(currentPair.work, currentPair.author, currentPair.author, true, 25);

            setIsCorrect(true);
            if (isUserAction) {
                onAddScore(25);
            }
            
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 1200);
        }
    }, [selectedLetters, targetName, isCorrect, data, currentIndex, onAddScore, onRecord]);

    const currentPair = data[currentIndex];
    if (!currentPair) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 max-h-[75vh]">
            <div className="text-center">
                <p className="text-[10px] uppercase font-bold opacity-60">Bu eserin yazarı kim?</p>
                <h3 className={`text-xl font-black ${theme.colors.accent}`}>{currentPair.work}</h3>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 min-h-[44px]">
                {selectedLetters.map((l) => (
                    <button
                        type="button"
                        key={l.id}
                        onClick={() => handleLetterClick(l, false)}
                        className={`w-9 h-9 rounded-lg font-bold text-md shadow transition-all
                             ${isCorrect ? 'bg-green-500 text-white' : `${theme.colors.button}`}
                        `}
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 p-4 rounded-2xl bg-black/20 backdrop-blur-md max-w-sm border border-white/10 min-h-[80px]">
                {shuffledLetters.map((l) => (
                     <button
                        type="button"
                        key={l.id}
                        onClick={() => handleLetterClick(l, true)}
                        className="w-8 h-8 rounded-md bg-white text-gray-900 font-bold text-md hover:scale-105 transition"
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            <button 
                onClick={handlePass}
                disabled={isCorrect}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"
            >
                <SkipForward size={12} />
                <span>Geç</span>
            </button>
        </div>
    );
};

// 4. PERIOD GAME
const PeriodGame = ({ data, theme, onAddScore, onEnd, onRecord, onMinusLife }: { data: AuthorWorkPair[], theme: Theme, onAddScore: (s: number) => void, onEnd: () => void, onRecord: (q:string, a:string, c:string, ok:boolean, pts:number) => void, onMinusLife: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
    const processingRef = useRef(false);
    const periods = ["Tanzimat", "Servet-i Fünun", "Milli Edebiyat", "Cumhuriyet"];
    
    const handleGuess = (period: string) => {
        if (feedback || processingRef.current) return;
        processingRef.current = true;
        
        const correctPeriod = data[currentIndex].period || "Cumhuriyet";
        const normCorrect = correctPeriod.toLowerCase();
        const normGuess = period.toLowerCase();
        const isMatch = normCorrect.includes(normGuess) || normGuess.includes(normCorrect);
        
        onRecord(data[currentIndex].work, period, correctPeriod, isMatch, isMatch ? 20 : 0);

        if (isMatch) {
            setFeedback('CORRECT');
            onAddScore(20);
        } else {
            setFeedback('WRONG');
            onMinusLife();
        }

        setTimeout(() => {
            if (currentIndex < data.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setFeedback(null);
                processingRef.current = false;
            } else {
                setCurrentIndex(0);
                setFeedback(null);
                processingRef.current = false;
            }
        }, 1200);
    };

    const currentPair = data[currentIndex];
    if (!currentPair) return null;

    let activeButtons = periods;
    if (currentPair.period === "Divan Edebiyatı" || currentPair.period === "Halk Edebiyatı" || currentPair.period === "İslamiyet Öncesi") {
        activeButtons = ["Divan Edebiyatı", "Halk Edebiyatı", "İslamiyet Öncesi", "Tanzimat"];
    }

    return (
        <div className="flex flex-col h-full items-center justify-center max-h-[75vh]">
            <div className={`w-full p-6 rounded-3xl ${theme.colors.surface} border ${theme.colors.surfaceBorder} shadow-xl text-center mb-6 relative overflow-hidden`}>
                 {feedback && (
                     <div className={`absolute inset-0 flex items-center justify-center z-20 ${feedback === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'}`}>
                         {feedback === 'CORRECT' ? <Check size={48} className="text-white animate-bounce" /> : <X size={48} className="text-white" />}
                     </div>
                )}
                <h3 className="text-[10px] opacity-70 uppercase tracking-widest mb-1">Dönem Dedektifi</h3>
                <h2 className={`text-2xl font-black ${theme.colors.text} leading-tight`}>{currentPair.work}</h2>
                <p className={`text-md ${theme.colors.accent} font-bold mt-1`}>{currentPair.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full shrink-0">
                {activeButtons.map((p) => (
                    <button
                        type="button"
                        key={p}
                        onClick={() => handleGuess(p)}
                        className="p-4 rounded-xl font-bold text-sm bg-white text-gray-800 hover:bg-gray-50 transition active:scale-95"
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    )
};

// 5. CASUS KART
const SpyCardGame = ({ data, theme, onAddScore, onEnd, onRecord, onMinusLife }: { data: AuthorWorkPair[], theme: Theme, onAddScore: (s: number) => void, onEnd: () => void, onRecord: (q:string, a:string, c:string, ok:boolean, pts:number) => void, onMinusLife: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cards, setCards] = useState<{work: string, author: string, isSpy: boolean}[]>([]);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
    const [targetGroupText, setTargetGroupText] = useState("");
    const processingRef = useRef(false);

    useEffect(() => {
        if (currentIndex >= data.length) {
            onEnd();
            return;
        }
        generateSpyRound();
    }, [currentIndex]);

    const generateSpyRound = () => {
        const correctPair = data[currentIndex];
        const samePeriodWorks = FALLBACK_DATA.filter(item => item.period === correctPair.period && item.work !== correctPair.work);
        
        let allies: AuthorWorkPair[] = [];
        if (samePeriodWorks.length >= 3) {
            allies = samePeriodWorks.sort(() => Math.random() - 0.5).slice(0, 3);
        } else {
            allies = FALLBACK_DATA.filter(item => item.author === correctPair.author && item.work !== correctPair.work).slice(0, 3);
        }

        while (allies.length < 3) {
            const rand = FALLBACK_DATA[Math.floor(Math.random() * FALLBACK_DATA.length)];
            if (!allies.some(a => a.work === rand.work) && rand.work !== correctPair.work) {
                allies.push(rand);
            }
        }

        const spyCandidates = FALLBACK_DATA.filter(item => item.period !== correctPair.period && item.author !== correctPair.author);
        const spy = spyCandidates[Math.floor(Math.random() * spyCandidates.length)];

        setTargetGroupText(`${correctPair.period || "Aynı"} Dönemi Eserleri`);

        const roundCards = [
            { work: correctPair.work, author: correctPair.author, isSpy: false },
            { work: allies[0].work, author: allies[0].author, isSpy: false },
            { work: allies[1].work, author: allies[1].author, isSpy: false },
            { work: spy.work, author: spy.author, isSpy: true }
        ].sort(() => Math.random() - 0.5);

        setCards(roundCards);
        setFeedback(null);
        processingRef.current = false;
    };

    const handleCardClick = (card: {work: string, author: string, isSpy: boolean}) => {
        if (feedback || processingRef.current) return;
        processingRef.current = true;

        const actualSpyCard = cards.find(c => c.isSpy);
        const correctSpyTitle = actualSpyCard ? actualSpyCard.work : "Casus";

        onRecord(`Grup: ${targetGroupText}`, card.work, correctSpyTitle, card.isSpy, card.isSpy ? 30 : 0);

        if (card.isSpy) {
            setFeedback('CORRECT');
            onAddScore(30);
        } else {
            setFeedback('WRONG');
            onMinusLife();
        }

        setTimeout(() => {
            if (currentIndex < data.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setCurrentIndex(0);
            }
        }, 1500);
    };

    const currentPair = data[currentIndex];
    if (!currentPair) return null;

    return (
        <div className="flex flex-col h-full items-center justify-center max-h-[75vh]">
            <div className="text-center mb-4">
                <h2 className={`text-xl font-black ${theme.colors.text}`}>Casusu Yok Et!</h2>
                <p className={`text-[11px] opacity-80 mt-1 ${theme.colors.textSecondary}`}>3 tanesi <b>{targetGroupText}</b> grubundan, 1 tanesi sızma! Casusu bulun.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full relative shrink-0">
                {feedback && (
                     <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 rounded-3xl ${feedback === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'}`}>
                         {feedback === 'CORRECT' ? <Check size={48} className="text-white animate-bounce" /> : <X size={48} className="text-white" />}
                     </div>
                )}

                {cards.map((c, idx) => (
                    <button
                        type="button"
                        key={idx}
                        onClick={() => handleCardClick(c)}
                        className={`p-3 rounded-2xl border text-center flex flex-col justify-center items-center gap-2 h-28 ${theme.colors.surface} ${theme.colors.surfaceBorder} active:scale-95 transition whitespace-normal`}
                    >
                        <div className={`font-black text-sm leading-tight ${theme.colors.text}`}>{c.work}</div>
                        <div className={`text-[10px] opacity-70 ${theme.colors.textSecondary}`}>{c.author}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// 5. MÜREKKEP LEKESİ
const InkBlotGame = ({ data, theme, onAddScore, onEnd, onRecord, onMinusLife }: { data: AuthorWorkPair[], theme: Theme, onAddScore: (s: number) => void, onEnd: () => void, onRecord: (q:string, a:string, c:string, ok:boolean, pts:number) => void, onMinusLife: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
    const processingRef = useRef(false);

    useEffect(() => {
        if (currentIndex >= data.length) {
            onEnd();
            return;
        }
        generateInkRound();
    }, [currentIndex]);

    const generateInkRound = () => {
        const correct = data[currentIndex];
        const distractors = FALLBACK_DATA.filter(item => item.author !== correct.author)
                                          .map(item => item.author);
        const uniqueDistractors = Array.from(new Set(distractors)).sort(() => Math.random() - 0.5).slice(0, 3);
        const opts = [...uniqueDistractors, correct.author].sort(() => Math.random() - 0.5);

        setOptions(opts);
        setFeedback(null);
        processingRef.current = false;
    };

    const handleGuess = (authorName: string) => {
        if (feedback || processingRef.current) return;
        processingRef.current = true;

        const correctAuthor = data[currentIndex].author;
        const isMatch = authorName === correctAuthor;

        onRecord(`"${data[currentIndex].work}" yazarı kimdir?`, authorName, correctAuthor, isMatch, isMatch ? 25 : 0);

        if (isMatch) {
            setFeedback('CORRECT');
            onAddScore(25);
        } else {
            setFeedback('WRONG');
            onMinusLife();
        }

        setTimeout(() => {
            if (currentIndex < data.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setCurrentIndex(0);
            }
        }, 1500);
    };

    const currentPair = data[currentIndex];
    if (!currentPair) return null;

    return (
        <div className="flex flex-col h-full items-center justify-center max-h-[75vh]">
            <div className={`w-full p-5 rounded-3xl ${theme.colors.surface} border ${theme.colors.surfaceBorder} shadow-xl text-center mb-5 relative overflow-hidden min-h-[160px] flex flex-col justify-center`}>
                 {feedback && (
                     <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 ${feedback === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'}`}>
                         {feedback === 'CORRECT' ? <Check size={48} className="text-white animate-bounce" /> : <X size={48} className="text-white" />}
                     </div>
                )}
                <h3 className="text-[10px] uppercase font-bold opacity-60 mb-2">Tarihi Parşömeni Tamamla</h3>
                <p className={`text-md font-bold leading-relaxed px-2 ${theme.colors.text}`}>
                    Türk edebiyatında önemli bir yere sahip olan <span className={`text-lg font-black ${theme.colors.accent}`}>"{currentPair.work}"</span> adlı güzide eser, 
                    <span className="inline-block px-3 py-0.5 mx-1 bg-black/40 rounded border border-dashed border-white/20 text-yellow-400 font-extrabold shadow-inner animate-pulse text-xs">■ Mürekkep Lekesi ■</span> 
                    tarafından kaleme alınmıştır.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full shrink-0">
                {options.map((name) => (
                    <button
                        type="button"
                        key={name}
                        onClick={() => handleGuess(name)}
                        className="p-3.5 rounded-xl font-bold text-xs bg-white text-gray-800 hover:bg-gray-100 transition whitespace-normal"
                    >
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
};