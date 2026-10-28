import React from 'react';
import { CardItem, Theme } from '../types';

interface CardProps {
  item: CardItem;
  theme: Theme;
  onClick: (card: CardItem) => void;
}

export const Card: React.FC<CardProps> = ({ item, theme, onClick }) => {
  const isShown = item.isFlipped || item.isMatched;

  return (
    <button 
      onClick={() => onClick(item)}
      className={`h-28 w-full rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center p-3 text-center active:scale-95 tap-highlight-transparent relative overflow-hidden shadow-sm
        ${isShown 
          ? 'bg-white border-yellow-400 text-slate-900 shadow-md' 
          : `${theme.colors.cardBack} ${theme.colors.surfaceBorder} text-white`
        }
      `}
    >
      {isShown ? (
        <div className="flex flex-col items-center justify-center animate-fade-in w-full h-full">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {item.type === 'AUTHOR' ? 'YAZAR' : 'ESER'}
          </span>
          <div className="font-extrabold text-[11px] leading-tight text-slate-900 max-h-[64px] overflow-hidden text-ellipsis">
            {item.content}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl">🖋️</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Edebiyat</span>
        </div>
      )}
    </button>
  );
};