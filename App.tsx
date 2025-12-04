import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  MapPin, 
  Zap, 
  User as UserIcon, 
  MessageCircle,
  Home,
  X,
  Send,
  Loader2,
  Flame,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { BigButton } from './components/BigButton';
import { FeedItem } from './components/FeedItem';
import { CURRENT_USER, INITIAL_LISTINGS, RECENT_ACTIVITIES } from './constants';
import { Listing, ListingType } from './types';
import { enhanceListing } from './services/geminiService';

enum Screen {
  HOME,
  POSTING,
  CHATS_LIST,
  CHAT_DETAIL,
  PROFILE,
  SPLASH
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [user, setUser] = useState(CURRENT_USER);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [postType, setPostType] = useState<ListingType>('OFFER');
  
  // Posting Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(10);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Chat State
  const [activeChatListing, setActiveChatListing] = useState<Listing | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: string, text: string}[]>([]);

  // Refs
  const feedRef = useRef<HTMLDivElement>(null);

  // Splash Screen Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen(Screen.HOME);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePostStart = (type: ListingType) => {
    setPostType(type);
    setTitle('');
    setDescription('');
    setCredits(10);
    setScreen(Screen.POSTING);
  };

  const handleOptimize = async () => {
    if (!title) return;
    setIsOptimizing(true);
    const result = await enhanceListing(title, postType);
    setDescription(result.description);
    setCredits(result.suggestedCredits);
    setIsOptimizing(false);
  };

  const handleShareApp = () => {
    const text = "Venha para o TROCOHOJE e ganhe créditos trocando coisas no seu bairro! 🟡";
    if (navigator.share) {
        navigator.share({
            title: 'TROCOHOJE',
            text: text,
            url: window.location.href
        }).catch(console.error);
    } else {
        alert("Link do app copiado!");
    }
  };

  const handleSubmitPost = () => {
    const newListing: Listing = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type: postType,
      category: 'OBJECT', // Simplified for demo
      title,
      description,
      value: credits,
      distance: '0m',
      createdAt: Date.now()
    };
    
    setListings([newListing, ...listings]);
    setUser(prev => ({ ...prev, credits: prev.credits + 5 })); // Instant reward for posting
    setScreen(Screen.HOME);
    
    // Add fake notification
    setTimeout(() => {
      alert("🎉 Você ganhou 5 créditos por participar da comunidade!");
    }, 500);
  };

  const handleStartTrade = (item: Listing) => {
    setActiveChatListing(item);
    setChatHistory([
        { sender: item.userName, text: `Oi! Vi que você tem interesse em: ${item.title}. Como posso ajudar?` }
    ]);
    setScreen(Screen.CHAT_DETAIL);
  };

  const handleSendMessage = () => {
    if(!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { sender: 'me', text: chatMessage }]);
    setChatMessage('');
    // Mock reply
    setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: activeChatListing?.userName || 'User', text: 'Combinado! Aceita trocar agora?' }]);
    }, 1500);
  };

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (screen === Screen.SPLASH) {
    return (
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-5xl font-black tracking-tighter mb-4">TROCO<span className="text-yellow-300">HOJE</span></h1>
        <p className="text-xl font-medium text-emerald-100 text-center mb-8">O marketplace onde você ganha todo dia.</p>
        <div className="animate-spin">
          <RefreshCw size={48} className="text-white opacity-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      
      {/* Header */}
      {screen !== Screen.CHAT_DETAIL && (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
            <MapPin className="text-emerald-500" size={20} />
            <span className="font-bold text-emerald-900 text-sm truncate max-w-[120px]">{user.location}</span>
            </div>
            
            <div className="flex items-center gap-3">
            <button 
                onClick={handleShareApp} 
                className="text-emerald-600 bg-emerald-50 p-2 rounded-full active:scale-95 transition-transform hover:bg-emerald-100"
                aria-label="Convidar amigos"
            >
                <Share2 size={18} />
            </button>

            <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-orange-600 font-bold text-sm">
                <Flame size={14} fill="currentColor" />
                <span>{user.streak} dias</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-black text-sm border border-yellow-200">
                <span>{user.credits}</span>
                <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-500"></div>
            </div>
            </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {screen === Screen.HOME && (
          <div className="animate-fade-in p-4 space-y-6">
            
            {/* Notifications / Hooks */}
            <div className="bg-emerald-900 text-emerald-50 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">Ganhe 7 créditos agora!</h3>
                <p className="text-sm text-emerald-200 mb-2">3 pessoas no seu bairro precisam de ajuda simples.</p>
                <div className="text-xs font-bold bg-white/20 inline-block px-2 py-1 rounded">Ver tarefas</div>
              </div>
              <Zap className="absolute -right-4 -bottom-4 text-emerald-800 opacity-50" size={100} />
            </div>

            {/* BIG BUTTONS */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <BigButton 
                  icon={ArrowUpCircle} 
                  label="Eu tenho" 
                  colorClass="bg-white" 
                  textColorClass="text-emerald-600"
                  onClick={() => handlePostStart('OFFER')}
                />
                <BigButton 
                  icon={ArrowDownCircle} 
                  label="Eu quero" 
                  colorClass="bg-white" 
                  textColorClass="text-orange-500"
                  onClick={() => handlePostStart('REQUEST')}
                />
              </div>
              <BigButton 
                icon={RefreshCw} 
                label="Trocar Agora" 
                subLabel="Ver feed ao vivo"
                colorClass="bg-emerald-500" 
                textColorClass="text-white"
                onClick={scrollToFeed}
              />
            </div>

            {/* Social Proof Ticker */}
            <div className="bg-emerald-100/50 rounded-xl p-3 overflow-hidden">
                <div className="flex animate-scroll gap-8 whitespace-nowrap">
                   {[...RECENT_ACTIVITIES, ...RECENT_ACTIVITIES].map((activity, i) => (
                       <span key={i} className="text-xs font-medium text-emerald-800 flex items-center gap-1">
                           {activity}
                       </span>
                   ))}
                </div>
            </div>

            {/* LIVE FEED TITLE */}
            <div ref={feedRef} className="flex items-center justify-between mt-8 mb-2 px-1">
              <h2 className="font-black text-gray-800 text-xl">Acontecendo perto</h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full animate-pulse">
                Ao vivo
              </span>
            </div>

            {/* FEED ITEMS */}
            <div className="space-y-4">
              {listings.map(item => (
                <FeedItem 
                  key={item.id} 
                  item={item} 
                  onTrade={handleStartTrade} 
                />
              ))}
            </div>
          </div>
        )}

        {screen === Screen.POSTING && (
          <div className="animate-slide-up bg-white min-h-full rounded-t-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">
                {postType === 'OFFER' ? 'O que você tem?' : 'O que você quer?'}
              </h2>
              <button onClick={() => setScreen(Screen.HOME)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Nome do item/serviço</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Furadeira, Aula de Inglês..."
                  className="w-full text-lg font-bold p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-emerald-400 outline-none transition-colors"
                />
              </div>

              {title.length > 3 && (
                <button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  {isOptimizing ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                  {isOptimizing ? 'Otimizando...' : 'Usar IA para Valorizar'}
                </button>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes rápidos..."
                  rows={3}
                  className="w-full p-4 bg-gray-50 rounded-xl outline-none resize-none text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Valor (Créditos)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="bg-yellow-400 text-yellow-900 font-black px-4 py-2 rounded-xl min-w-[60px] text-center">
                    {credits}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmitPost}
                disabled={!title}
                className={`w-full py-4 mt-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 ${title ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-200 text-gray-400'}`}
              >
                <Send size={20} />
                Publicar Agora
              </button>
            </div>
          </div>
        )}

        {screen === Screen.CHATS_LIST && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <MessageCircle size={48} className="mb-2 opacity-50"/>
                <p className="font-bold">Seus chats aparecerão aqui.</p>
                <p className="text-sm text-center mt-2">Inicie uma troca no feed para conversar.</p>
                <button 
                    onClick={() => setScreen(Screen.HOME)} 
                    className="mt-6 text-emerald-600 font-bold text-sm border border-emerald-200 px-4 py-2 rounded-full"
                >Voltar ao início</button>
            </div>
        )}

        {screen === Screen.CHAT_DETAIL && activeChatListing && (
            <div className="flex flex-col h-screen bg-white">
                <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm sticky top-0 z-20">
                    <button onClick={() => setScreen(Screen.HOME)} className="text-gray-500">
                        <ChevronLeft size={24} />
                    </button>
                    <img src={activeChatListing.userAvatar} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 leading-tight">{activeChatListing.userName}</h3>
                        <p className="text-xs text-gray-500">Negociando: {activeChatListing.title}</p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 font-bold text-xs px-2 py-1 rounded">
                        {activeChatListing.value} 🟡
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/50">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 mb-safe">
                    <div className="flex gap-2">
                        <input 
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Escreva uma mensagem..."
                            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className={`p-3 rounded-full transition-all ${chatMessage.trim() ? 'bg-emerald-500 text-white rotate-0' : 'bg-gray-200 text-gray-400 -rotate-45'}`}
                        >
                            <Send size={20} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Sticky Bottom Navigation - Hide in Chat Detail */}
      {screen !== Screen.CHAT_DETAIL && (
        <nav className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl shadow-2xl p-2 flex justify-around items-center z-20 border border-gray-100">
            <button 
            onClick={() => setScreen(Screen.HOME)}
            className={`p-3 rounded-xl transition-colors ${screen === Screen.HOME || screen === Screen.POSTING ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
            >
            <Home size={24} strokeWidth={2.5} />
            </button>
            <button 
            onClick={() => setScreen(Screen.CHATS_LIST)}
            className={`p-3 rounded-xl transition-colors ${screen === Screen.CHATS_LIST ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
            >
            <MessageCircle size={24} strokeWidth={2.5} />
            </button>
            <button 
            onClick={() => alert("Perfil em construção!")}
            className={`p-3 rounded-xl transition-colors ${screen === Screen.PROFILE ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
            >
            <UserIcon size={24} strokeWidth={2.5} />
            </button>
        </nav>
      )}

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .mb-safe {
            margin-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}