import React, { useState } from 'react';
import { Theme, UserState, ShopItem } from '../types';
import { THEMES, AVATARS, TITLES } from '../constants';
import { ArrowLeft, Check, Lock, ShoppingCart, Palette, User, Award, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ShopProps {
  userState: UserState;
  currentTheme: Theme;
  onBuyTheme: (item: ShopItem) => void;
  onSelectTheme: (item: ShopItem) => void;
  onBuyFreeze: () => void; // Yeni prop eklendi
  onBack: () => void;
}

type TabType = 'THEMES' | 'AVATARS' | 'TITLES';

export const Shop: React.FC<ShopProps> = ({ userState, currentTheme, onBuyTheme, onSelectTheme, onBuyFreeze, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('THEMES');

  const renderItemButton = (item: any, isOwned: boolean, isEquipped: boolean, canAfford: boolean) => {
    if (isOwned) {
        if (isEquipped) {
            return (
                <button 
                    disabled
                    className="w-full py-2.5 rounded-xl font-black text-xs bg-slate-800 text-white/30 border border-white/5 cursor-default flex items-center justify-center gap-1"
                >
                    <Check size={12} /> Seçili
                </button>
            );
        } else {
            return (
                <button 
                    onClick={() => onSelectTheme(item)}
                    className="w-full py-2.5 rounded-xl font-black text-xs text-slate-900 bg-white border-b-4 border-gray-300 hover:bg-gray-100 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all duration-75"
                >
                    Kullan
                </button>
            );
        }
    } else {
        if (canAfford) {
            return (
                <button 
                    onClick={() => onBuyTheme(item)}
                    className="w-full py-2.5 rounded-xl font-black text-xs text-white bg-green-500 border-b-4 border-green-700 hover:bg-green-600 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all duration-75 flex items-center justify-center gap-1 shadow-sm"
                >
                    <ShoppingCart size={12} /> {item.cost}
                </button>
            );
        } else {
            return (
                <button 
                    disabled
                    className="w-full py-2.5 rounded-xl font-black text-xs text-white/35 bg-white/5 border-b-4 border-white/10 flex items-center justify-center gap-1 cursor-not-allowed"
                >
                    <Lock size={12} /> {item.cost}
                </button>
            );
        }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 justify-between animate-fade-in z-20 relative overflow-hidden">
      
      {/* Üst Header */}
      <div className="flex items-center mb-6 shrink-0 justify-between bg-white/5 border border-white/10 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition ${currentTheme.colors.text}`}>
              <ArrowLeft size={18} />
          </button>
          <div className="text-left">
              <h1 className={`text-md font-black ${currentTheme.colors.text} leading-none mb-1`}>Mağaza</h1>
              <p className="text-[10px] font-bold text-white/50 leading-none">Özel Eşyalar ve Unvanlar</p>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full bg-white/10 border border-white/10 shadow-sm`}>
            <span className={`font-black ${currentTheme.colors.accent} text-xs flex items-center gap-1`}>⭐ {userState.points}</span>
        </div>
      </div>

      {/* YENİ GELDİ: SERİ DONDURMA SATIN ALMA REYONU */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 to-slate-900/40 border border-blue-500/20 mb-6 shrink-0 shadow flex justify-between items-center gap-4 animate-fade-in">
          <div className="text-left overflow-hidden">
              <span className="text-[8px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Kalkan Koruması</span>
              <h3 className="text-sm font-black text-white mt-1.5 flex items-center gap-1">Seri Dondurucu ❄️</h3>
              <p className="text-[10px] text-white/50 leading-tight mt-1">Oynamayı unuttuğun bir gün serini otomatik korur.</p>
              <span className="text-[10px] font-bold text-cyan-300 block mt-1">Mevcut Hakkın: {userState.freezeCount} adet</span>
          </div>
          <button 
             onClick={onBuyFreeze}
             className="px-4 py-2.5 rounded-xl font-black text-xs text-white bg-cyan-600 border-b-4 border-cyan-800 hover:bg-cyan-500 active:border-b-0 active:mt-1 active:mb-[-4px] transition-all duration-75 flex items-center gap-1 shrink-0"
          >
              <ShoppingCart size={11} /> 800
          </button>
      </div>

      {/* TABS */}
      <div className={`flex p-1 rounded-2xl bg-black/20 border border-white/5 mb-6 shrink-0`}>
          <button 
            onClick={() => setActiveTab('THEMES')} 
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'THEMES' ? 'bg-violet-600 text-white shadow' : 'text-white/50 hover:text-white'}`}
          >
            <Palette size={14} className="mr-1.5" /> Tema
          </button>
          <button 
            onClick={() => setActiveTab('AVATARS')} 
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'AVATARS' ? 'bg-violet-600 text-white shadow' : 'text-white/50 hover:text-white'}`}
          >
            <User size={14} className="mr-1.5" /> Avatar
          </button>
          <button 
            onClick={() => setActiveTab('TITLES')} 
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'TITLES' ? 'bg-violet-600 text-white shadow' : 'text-white/50 hover:text-white'}`}
          >
            <Award size={14} className="mr-1.5" /> Unvan
          </button>
      </div>

      {/* LIST CONTENT */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-8 pr-1">
        {activeTab === 'THEMES' && (
             <div className="space-y-4">
                {THEMES.map(themeItem => {
                    const isOwned = userState.ownedThemes.includes(themeItem.id);
                    const isSelected = userState.currentThemeId === themeItem.id;
                    const canAfford = userState.points >= themeItem.cost;

                    return (
                        <div key={themeItem.id} className={`overflow-hidden rounded-3xl border transition-all ${isSelected ? 'border-yellow-400 shadow-lg shadow-yellow-500/10' : 'border-white/10'} ${currentTheme.colors.surface}`}>
                            <div className={`h-24 w-full ${themeItem.colors.bgGradient} relative flex flex-col justify-end p-4`}>
                                <div className="text-white font-black text-lg drop-shadow-md">{themeItem.name}</div>
                                {isSelected && <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center"><Check size={8} className="mr-1"/> SEÇİLİ</div>}
                            </div>
                            <div className="p-4 flex justify-between items-center gap-4">
                                <div className={`text-xs opacity-70 w-2/3 ${currentTheme.colors.textSecondary}`}>{themeItem.description}</div>
                                <div className="w-24 shrink-0">
                                    {renderItemButton(themeItem, isOwned, isSelected, canAfford)}
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>
        )}

        {activeTab === 'AVATARS' && (
            <div className="grid grid-cols-2 gap-4">
                {AVATARS.map(avatar => {
                     const isOwned = userState.ownedAvatars.includes(avatar.id);
                     const isSelected = userState.currentAvatarId === avatar.id;
                     const canAfford = userState.points >= avatar.cost;
                     const IconComponent = (Icons as any)[avatar.iconName] || User;

                     return (
                        <div key={avatar.id} className={`p-4 rounded-3xl border flex flex-col items-center text-center transition-all ${isSelected ? 'border-yellow-400 bg-white/5' : `border-white/10 ${currentTheme.colors.surface}`}`}>
                            <div className={`w-14 h-14 rounded-full mb-3 flex items-center justify-center ${isOwned ? 'bg-white/10' : 'bg-black/30'}`}>
                                <IconComponent size={24} className={isOwned ? currentTheme.colors.text : 'text-gray-500'} />
                            </div>
                            <div className={`font-black text-xs mb-3 truncate w-full ${currentTheme.colors.text}`}>{avatar.name}</div>
                            <div className="w-full shrink-0">
                                {renderItemButton(avatar, isOwned, isSelected, canAfford)}
                            </div>
                        </div>
                     );
                })}
            </div>
        )}

        {activeTab === 'TITLES' && (
            <div className="space-y-3">
                {TITLES.map(title => {
                     const isOwned = userState.ownedTitles.includes(title.id);
                     const isSelected = userState.currentTitleId === title.id;
                     const canAfford = userState.points >= title.cost;

                     return (
                        <div key={title.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${isSelected ? 'border-yellow-400 bg-white/5 shadow-md shadow-yellow-500/5' : `border-white/10 ${currentTheme.colors.surface}`}`}>
                             <div className="flex items-center gap-2 overflow-hidden mr-2">
                                <Award size={18} className={isOwned ? 'text-yellow-400' : 'text-gray-500'} />
                                <div className={`font-black text-sm truncate ${currentTheme.colors.text}`}>{title.name}</div>
                             </div>
                             <div className="w-24 shrink-0">
                                {renderItemButton(title, isOwned, isSelected, canAfford)}
                             </div>
                        </div>
                     );
                })}
            </div>
        )}
      </div>
    </div>
  );
};