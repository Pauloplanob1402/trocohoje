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
  ChevronLeft,
  Mail,
  Bell,
  BellOff,
  Map as MapIcon
} from 'lucide-react';
import { BigButton } from './components/BigButton';
import { FeedItem } from './components/FeedItem';
import { CURRENT_USER, INITIAL_LISTINGS, RECENT_ACTIVITIES } from './constants';
import { Listing, ListingType } from './types';
import { enhanceListing } from './services/geminiService';
import { getCurrentLocation } from './services/locationService';
import { initOneSignal, requestNotificationPermission, checkPermission } from './services/notificationService';

enum Screen {
  SPLASH,
  LOGIN,
  HOME,
  POSTING,
  CHATS_LIST,
  CHAT_DETAIL,
  PROFILE,
  MAP_VIEW
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [user, setUser] = useState(CURRENT_USER);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [postType, setPostType] = useState<ListingType>('OFFER');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Posting Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(10);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Chat State
  const [activeChatListing, setActiveChatListing] = useState<Listing | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: string, text: string}[]>([]);

  // Map State
  const [mapListing, setMapListing] = useState<Listing | null>(null);

  // Refs
  const feedRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Splash Screen Effect & OneSignal Init
  useEffect(() => {
    // Init Notifications safely
    try {
        initOneSignal();
    } catch (e) {
        console.warn("Notification init failed, continuing app flow.");
    }

    // Reduced duration to 3.5s - just enough to read the quote
    const timer = setTimeout(() => {
      setScreen(Screen.LOGIN); 
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Check notification status periodically or on mount
  useEffect(() => {
    const check = async () => {
        try {
            const enabled = await checkPermission();
            setNotificationsEnabled(enabled);
        } catch (e) {
            console.log("Notification permission check skipped");
        }
    };
    // Small delay to ensure OneSignal loaded
    const t = setTimeout(check, 1000);
    return () => clearTimeout(t);
  }, [screen]);

  // Map Initialization Effect
  useEffect(() => {
    if (screen === Screen.MAP_VIEW && mapContainerRef.current && window.L && mapListing) {
      // Clean up previous map if exists
      const container = mapContainerRef.current;
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
        container.innerHTML = '';
      }

      // Mock coordinates near the user (randomize slightly)
      const lat = -23.58 + (Math.random() * 0.01 - 0.005);
      const lng = -46.63 + (Math.random() * 0.01 - 0.005);

      const map = window.L.map(container).setView([lat, lng], 15);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom Icon
      const icon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      window.L.marker([lat, lng], { icon }).addTo(map)
        .bindPopup(`<b>${mapListing.title}</b><br>Aprox. ${mapListing.distance}`)
        .openPopup();
      
      // Add circle to show "zone" instead of exact location for privacy
      window.L.circle([lat, lng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        radius: 300
      }).addTo(map);
    }
  }, [screen, mapListing]);

  const handleLogin = async () => {
    setIsLoadingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      setUser(prev => ({
        ...prev,
        location: locationData.address || prev.location
      }));
    } catch (e) {
      // Fallback location already set
    } finally {
      setIsLoadingLocation(false);
      setScreen(Screen.HOME);
    }
  };

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

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
            alert("Notificações ativadas! Você será avisado de novas trocas.");
            setNotificationsEnabled(true);
        }
    } else {
        alert("As notificações já estão ativas.");
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
      distance: '0m', // User is here
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

  const handleViewMap = (item: Listing) => {
    setMapListing(item);
    setScreen(Screen.MAP_VIEW);
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

  // SCREENS
  if (screen === Screen.SPLASH) {
    return (
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center text-white p-8 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Enchanting Content */}
        <div className="z-10 animate-fade-in flex flex-col items-center justify-center h-full max-w-sm mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif font-medium leading-relaxed italic mb-8 drop-shadow-sm opacity-95">
                "Tudo o que você precisa está mais perto do que imagina."
            </h1>
            
            <div className="h-1 w-16 bg-yellow-300 rounded-full mb-8 shadow-sm"></div>
            
            <div className="flex items-center gap-2 opacity-80 animate-pulse">
                <RefreshCw size={20} />
                <span className="text-sm font-bold tracking-[0.2em] uppercase">TrocoHoje</span>
            </div>
        </div>
      </div>
    );
  }

  if (screen === Screen.LOGIN) {
    return (
        <div className="min-h-screen bg-white flex flex-col p-8 animate-fade-in">
            {/* Main Content Centered */}
            <div className="flex-1 flex flex-col justify-center items-center">
                
                {/* User Icon - Soft Green Box */}
                <div className="w-24 h-24 bg-emerald-100/70 rounded-[32px] flex items-center justify-center mb-8 text-emerald-600 shadow-sm animate-slide-up">
                    <UserIcon size={48} strokeWidth={2} />
                </div>
                
                {/* Title & Subtitle */}
                <div className="text-center mb-10 space-y-3 animate-slide-up" style={{animationDelay: '0.1s'}}>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Entre para a <br/>comunidade
                    </h2>
                    <p className="text-slate-500 font-medium text-base leading-relaxed max-w-[260px] mx-auto">
                        Encontre vizinhos, troque itens e acumule créditos hoje mesmo.
                    </p>
                </div>
                
                {/* Buttons */}
                <div className="w-full space-y-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                    {/* Google Button - Black */}
                    <button 
                        onClick={handleLogin}
                        disabled={isLoadingLocation}
                        className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
                    >
                        {isLoadingLocation ? <Loader2 className="animate-spin" /> : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                        )}
                        {isLoadingLocation ? 'Localizando...' : 'Continuar com Google'}
                    </button>
                    
                    {/* Email Button - Light Gray */}
                    <button 
                        onClick={handleLogin}
                        disabled={isLoadingLocation}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <Mail size={22} className="text-slate-600" />
                        Entrar com Email
                    </button>
                </div>
            </div>

            {/* Footer Text */}
            <p className="text-[11px] text-gray-400 text-center leading-tight max-w-xs mx-auto animate-fade-in" style={{animationDelay: '0.5s'}}>
                Ao continuar, você aceita nossos Termos de Troca e Política de Comunidade.
            </p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      
      {/* Header */}
      {screen !== Screen.CHAT_DETAIL && screen !== Screen.MAP_VIEW && (
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm border-b border-gray-100">
            <div className="flex items-center gap-2 max-w-[50%]">
                <div className="bg-emerald-100 p-1.5 rounded-full">
                    <MapPin className="text-emerald-600" size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 leading-none">Você está em</span>
                    <span className="font-bold text-emerald-900 text-sm truncate">{user.location}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleNotificationToggle}
                    className={`p-2 rounded-full active:scale-95 transition-transform ${notificationsEnabled ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'}`}
                    aria-label="Notificações"
                >
                    {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                </button>

                <button 
                    onClick={handleShareApp} 
                    className="text-emerald-600 bg-emerald-50 p-2 rounded-full active:scale-95 transition-transform hover:bg-emerald-100"
                    aria-label="Convidar amigos"
                >
                    <Share2 size={18} />
                </button>

                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                    <span className="font-black text-emerald-900 text-sm">{user.credits}</span>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500 shadow-sm"></div>
                </div>
            </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        
        {screen === Screen.HOME && (
          <div className="animate-fade-in p-4 space-y-6">
            
            {/* Banner Notifications */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-emerald-50 p-5 rounded-3xl shadow-xl relative overflow-hidden transform transition-all hover:scale-[1.01]">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-md text-white">Missão Diária</span>
                </div>
                <h3 className="font-black text-xl leading-tight mb-1">3 vizinhos precisam de ajuda hoje.</h3>
                <p className="text-sm text-emerald-200 mb-3 font-medium">Você pode ganhar até 45 créditos.</p>
                <button className="bg-white text-emerald-900 text-xs font-bold px-4 py-2 rounded-full shadow-md active:bg-gray-100">
                    Ver oportunidades
                </button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                  <Flame size={120} />
              </div>
            </div>

            {/* BIG BUTTONS */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <BigButton 
                  icon={ArrowUpCircle} 
                  label="Eu tenho" 
                  colorClass="bg-white hover:bg-emerald-50/50" 
                  textColorClass="text-emerald-600"
                  onClick={() => handlePostStart('OFFER')}
                />
                <BigButton 
                  icon={ArrowDownCircle} 
                  label="Eu quero" 
                  colorClass="bg-white hover:bg-orange-50/50" 
                  textColorClass="text-orange-500"
                  onClick={() => handlePostStart('REQUEST')}
                />
              </div>
              <BigButton 
                icon={RefreshCw} 
                label="Trocar Agora" 
                subLabel="Ver feed ao vivo"
                colorClass="bg-emerald-500 active:bg-emerald-600" 
                textColorClass="text-white"
                onClick={scrollToFeed}
              />
            </div>

            {/* Social Proof Ticker */}
            <div className="bg-emerald-50 rounded-xl p-3 overflow-hidden border border-emerald-100/50">
                <div className="flex animate-scroll gap-8 whitespace-nowrap">
                   {[...RECENT_ACTIVITIES, ...RECENT_ACTIVITIES].map((activity, i) => (
                       <div key={i} className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                           <span className="text-xs font-semibold text-emerald-800">
                               {activity}
                           </span>
                       </div>
                   ))}
                </div>
            </div>

            {/* LIVE FEED TITLE */}
            <div ref={feedRef} className="flex items-center justify-between mt-8 mb-2 px-1">
              <h2 className="font-black text-gray-800 text-xl">Acontecendo perto</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                AO VIVO
              </span>
            </div>

            {/* FEED ITEMS */}
            <div className="space-y-4">
              {listings.map(item => (
                <FeedItem 
                  key={item.id} 
                  item={item} 
                  onTrade={handleStartTrade}
                  onViewMap={handleViewMap}
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
              <button onClick={() => setScreen(Screen.HOME)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título do Anúncio</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Furadeira, Aula de Inglês..."
                  className="w-full text-xl font-bold p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none transition-all"
                />
              </div>

              {title.length > 3 && (
                <button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                >
                  {isOptimizing ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                  {isOptimizing ? 'Criando descrição...' : 'Turbinar com IA'}
                </button>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes rápidos ajudam a trocar mais rápido..."
                  rows={4}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none resize-none text-gray-700 border-2 border-transparent focus:border-gray-200 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Valor Sugerido</label>
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="bg-yellow-400 text-yellow-900 font-black px-4 py-2 rounded-xl min-w-[70px] text-center text-lg shadow-sm">
                    {credits}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmitPost}
                disabled={!title}
                className={`w-full py-4 mt-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${title ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200' : 'bg-gray-100 text-gray-300'}`}
              >
                <Send size={20} />
                Publicar Agora
              </button>
            </div>
          </div>
        )}

        {screen === Screen.MAP_VIEW && mapListing && (
          <div className="animate-fade-in absolute inset-0 bg-white z-50 flex flex-col">
             <div className="absolute top-4 left-4 z-[400]">
                <button onClick={() => setScreen(Screen.HOME)} className="bg-white text-gray-800 p-3 rounded-full shadow-lg font-bold">
                    <X size={24} />
                </button>
             </div>
             <div ref={mapContainerRef} className="flex-1 w-full h-full bg-gray-200" />
             <div className="bg-white p-6 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 z-[400] relative">
                 <div className="flex items-center gap-4 mb-4">
                    <img src={mapListing.userAvatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <div>
                        <h2 className="font-bold text-lg leading-none">{mapListing.title}</h2>
                        <p className="text-gray-500 text-sm">Oferecido por {mapListing.userName}</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => handleStartTrade(mapListing)}
                    className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                 >
                     <MessageCircle />
                     Tenho Interesse ({mapListing.value} créditos)
                 </button>
             </div>
          </div>
        )}

        {screen === Screen.CHATS_LIST && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <MessageCircle size={48} className="opacity-30 text-gray-500"/>
                </div>
                <p className="font-bold text-lg text-gray-600">Nenhuma conversa ainda</p>
                <p className="text-sm text-center mt-2 max-w-[200px]">Inicie uma troca no feed para conversar com seus vizinhos.</p>
                <button 
                    onClick={() => setScreen(Screen.HOME)} 
                    className="mt-8 text-white bg-emerald-500 font-bold px-6 py-3 rounded-xl shadow-md active:scale-95 transition-transform"
                >Explorar Feed</button>
            </div>
        )}

        {screen === Screen.CHAT_DETAIL && activeChatListing && (
            <div className="flex flex-col h-screen bg-white">
                <div className="bg-white/90 backdrop-blur border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm sticky top-0 z-20">
                    <button onClick={() => setScreen(Screen.HOME)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <img src={activeChatListing.userAvatar} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 leading-tight">{activeChatListing.userName}</h3>
                        <p className="text-xs text-gray-500 truncate w-32">{activeChatListing.title}</p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 font-bold text-xs px-2 py-1 rounded">
                        {activeChatListing.value} 🟡
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'me' ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
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
                            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className={`p-3 rounded-full transition-all shadow-md ${chatMessage.trim() ? 'bg-emerald-500 text-white rotate-0 scale-100' : 'bg-gray-200 text-gray-400 -rotate-45 scale-90'}`}
                        >
                            <Send size={20} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Sticky Bottom Navigation - Hide in Chat Detail or Map View */}
      {screen !== Screen.CHAT_DETAIL && screen !== Screen.MAP_VIEW && (
        <nav className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 flex justify-around items-center z-20 border border-gray-100/50">
            <button 
            onClick={() => setScreen(Screen.HOME)}
            className={`p-3 rounded-xl transition-all duration-300 ${screen === Screen.HOME || screen === Screen.POSTING ? 'bg-emerald-100 text-emerald-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
            <Home size={24} strokeWidth={screen === Screen.HOME ? 3 : 2.5} />
            </button>
            <button 
            onClick={() => setScreen(Screen.CHATS_LIST)}
            className={`p-3 rounded-xl transition-all duration-300 ${screen === Screen.CHATS_LIST ? 'bg-emerald-100 text-emerald-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
            <MessageCircle size={24} strokeWidth={screen === Screen.CHATS_LIST ? 3 : 2.5} />
            </button>
            <button 
            onClick={() => alert("Perfil em construção! Em breve com conquistas e histórico.")}
            className={`p-3 rounded-xl transition-all duration-300 ${screen === Screen.PROFILE ? 'bg-emerald-100 text-emerald-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
            <UserIcon size={24} strokeWidth={screen === Screen.PROFILE ? 3 : 2.5} />
            </button>
        </nav>
      )}

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .mb-safe {
            margin-bottom: env(safe-area-inset-bottom);
        }
        /* Custom Leaflet overrides */
        .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            font-family: 'Inter', sans-serif;
            font-size: 12px;
        }
        .leaflet-popup-tip {
            background: white;
        }
      `}</style>
    </div>
  );
}