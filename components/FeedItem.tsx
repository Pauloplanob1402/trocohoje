import React from 'react';
import { Listing } from '../types';
import { MapPin, Clock, Star, Share2 } from 'lucide-react';

interface FeedItemProps {
  item: Listing;
  onTrade: (item: Listing) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, onTrade }) => {
  const isRequest = item.type === 'REQUEST';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = isRequest 
      ? `Alguém no TROCOHOJE precisa de: ${item.title}. Ajude e ganhe ${item.value} créditos!`
      : `Olha o que encontrei no TROCOHOJE: ${item.title} por ${item.value} créditos!`;
      
    if (navigator.share) {
      navigator.share({
        title: 'TROCOHOJE',
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
            <img src={item.userAvatar} alt={item.userName} className="w-8 h-8 rounded-full border border-gray-200" />
            <div>
                <p className="text-xs font-bold text-gray-700">{item.userName}</p>
                <div className="flex items-center text-[10px] text-gray-400">
                    <Star size={10} className="text-yellow-400 fill-yellow-400 mr-1" />
                    <span>4.8</span>
                </div>
            </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isRequest ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isRequest ? 'QUER' : 'TEM'}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{item.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1"><MapPin size={12} /> {item.distance}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> Agora</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2 text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all active:scale-95"
            aria-label="Compartilhar"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => onTrade(item)}
            className="bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md active:bg-emerald-600 transition-colors"
          >
            {item.value} 🟡
          </button>
        </div>
      </div>
    </div>
  );
};