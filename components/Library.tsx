import React, { useState } from 'react';
import { Theme, UserState } from '../types';
import { FALLBACK_DATA } from '../constants';
import { ArrowLeft, Star, Search, BookOpen } from 'lucide-react';

interface LibraryProps {
  theme: Theme;
  userState: UserState;
  onToggleFavorite: (workTitle: string) => void;
  onBack: () => void;
}

export const Library: React.FC<LibraryProps> = ({ theme, userState, onToggleFavorite, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const filteredData = FALLBACK_DATA.filter(item => 
    item.work.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.period.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(item => showOnlyFavorites ? userState.favorites.includes(item.work) : true);

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-hidden animate-fade-in z-20 relative max-w-md mx-auto">
      
      {/* Üst Header */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <button onClick={onBack} className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition ${theme.colors.text}`}>
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
            <h2 className="text-lg font-black text-white">Edebiyat Kütüphanesi</h2>
            <p className="text-[10px] text-white/50">{FALLBACK_DATA.length} Eser (Favoriler: {userState.favorites.length})</p>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Arama Çubuğu */}
      <div className={`flex items-center gap-2 p-3 rounded-2xl bg-white/5 border ${theme.colors.surfaceBorder} mb-4 shrink-0`}>
         <Search size={16} className="opacity-60 text-white" />
         <input 
            type="text" 
            placeholder="Eser, Yazar veya Dönem ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full placeholder-white/30 text-xs"
         />
      </div>

      {/* Filtre Sekmesi */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-black/25 rounded-2xl mb-4 shrink-0 border border-white/5">
          <button
             onClick={() => setShowOnlyFavorites(false)}
             className={`py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${!showOnlyFavorites ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
          >
              <BookOpen size={13} />
              <span>Tüm Eserler</span>
          </button>
          <button
             onClick={() => setShowOnlyFavorites(true)}
             className={`py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${showOnlyFavorites ? 'bg-yellow-500/20 text-yellow-300' : 'text-white/40'}`}
          >
              <Star size={13} fill={showOnlyFavorites ? "currentColor" : "none"} />
              <span>Favorilerim ({userState.favorites.length})</span>
          </button>
      </div>

      {/* RE-DESIGNED: YATAYDA DİKTÖRTGEN, ALTIN YAZARLI VE NEFES ALAN YENİ KÜTÜPHANE LİSTESİ */}
      <div className="flex-grow overflow-y-auto space-y-3 pb-8 pr-1">
          {filteredData.map((item, idx) => {
              const isFav = userState.favorites.includes(item.work);
              return (
                  <div key={idx} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex justify-between items-center gap-3 relative shadow-sm min-h-[92px] transition active:scale-99">
                      {/* Sol Taraf (Yazı Grubu) */}
                      <div className="flex-1 text-left overflow-hidden pr-2">
                          <h3 className="font-extrabold text-base text-zinc-100 leading-tight truncate">{item.work}</h3>
                          {/* OKUNABİLİR ALTIN SARISI YAZAR ADI */}
                          <p className="text-xs font-bold text-yellow-400 mt-1 truncate">✍️ {item.author}</p>
                          {/* İÇ KUTUSUZ SADE ŞIK AÇIKLAMA */}
                          <p className="text-[10px] text-zinc-400 mt-2 leading-normal line-clamp-2">{item.clue}</p>
                      </div>
                      
                      {/* Sağ Taraf (Dönem Rozeti & Yıldız) */}
                      <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0 self-stretch">
                          <span className="text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-950/30 px-2 py-0.5 rounded-full border border-violet-900/30">
                              {item.period}
                          </span>
                          
                          <button 
                             onClick={() => onToggleFavorite(item.work)}
                             className={`p-2 rounded-xl transition ${isFav ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/30 hover:text-white/70'}`}
                          >
                              <Star size={16} fill={isFav ? "currentColor" : "none"} />
                          </button>
                      </div>
                  </div>
              );
          })}
          {filteredData.length === 0 && (
              <div className="text-center py-12 opacity-50 text-xs">
                  {showOnlyFavorites ? "Henüz favori eser seçmediniz." : "Sonuç bulunamadı."}
              </div>
          )}
      </div>
    </div>
  );
};