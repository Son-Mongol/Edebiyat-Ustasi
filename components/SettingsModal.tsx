import React from 'react';
import { Theme, UserSettings } from '../types';
import { X, Volume2, Music, Smartphone, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  theme: Theme;
  settings: UserSettings;
  onClose: () => void;
  onToggleSetting: (key: keyof UserSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  settings,
  onClose,
  onToggleSetting,
  onResetData
}) => {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className={`w-full max-w-sm rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl relative`}>
        
        {/* Kapatma Çarpısı */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 z-50"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-black text-white mb-6 text-left">Ayarlar</h2>

        <div className="space-y-4">
          
          {/* SES EFEKTLERİ TERCİHİ */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
                <Volume2 size={18} />
              </div>
              <span className="text-sm font-bold text-white">Ses Efektleri</span>
            </div>
            <button 
              onClick={() => onToggleSetting('sound')}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                ${settings.sound ? 'bg-green-500' : 'bg-slate-700'}
              `}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200
                ${settings.sound ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>

          {/* MÜZİK TERCİHİ */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
                <Music size={18} />
              </div>
              <span className="text-sm font-bold text-white">Müzik</span>
            </div>
            <button 
              onClick={() => onToggleSetting('music')}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                ${settings.music ? 'bg-green-500' : 'bg-slate-700'}
              `}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200
                ${settings.music ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>

          {/* TİTREŞİM TERCİHİ */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
                <Smartphone size={18} />
              </div>
              <span className="text-sm font-bold text-white">Titreşim</span>
            </div>
            <button 
              onClick={() => onToggleSetting('vibration')}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
                ${settings.vibration ? 'bg-green-500' : 'bg-slate-700'}
              `}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200
                ${settings.vibration ? 'translate-x-6' : 'translate-x-0'}
              `} />
            </button>
          </div>

          {/* VERİLERİ SIFIRLA BUTONU */}
          <button
            onClick={() => {
              if (window.confirm("Tüm başarımların, favorilerin ve puanların kalıcı olarak sıfırlanacak. Emin misin? ⚠️")) {
                onResetData();
              }
            }}
            className="w-full py-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition flex items-center justify-center gap-2 mt-6 active:scale-95"
          >
            <Trash2 size={16} />
            <span>Verileri Sıfırla</span>
          </button>

        </div>

        <div className="text-[10px] text-white/30 text-center mt-6">
          Edebiyat Ustası v1.2.0
        </div>

      </div>
    </div>
  );
};