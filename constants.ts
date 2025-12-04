import { Listing, Notification, User } from './types';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Você',
  avatar: 'https://picsum.photos/seed/me/100/100',
  credits: 50, // Welcome bonus
  streak: 1,
  location: 'Vila Mariana, SP',
  reputation: 4.8
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', text: 'Alguém perto de você quer o que você tem: Violão', type: 'OPPORTUNITY', read: false },
  { id: '2', text: 'Ganhe 7 créditos agora completando seu perfil', type: 'GAIN', read: false },
  { id: '3', text: 'Nova troca disponível no seu bairro: Furadeira', type: 'ALERT', read: false },
];

export const RECENT_ACTIVITIES = [
  "🔥 Marcos trocou uma furadeira por 15 créditos",
  "⭐ Julia ganhou 8 créditos ajudando uma vizinha",
  "🚲 Pedro trocou uma bike parada por aulas de violão",
  "📦 Ana desapegou de livros e ganhou 20 créditos",
  "🛠️ Roberto consertou uma torneira e ganhou 30 créditos"
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: '101',
    userId: 'user2',
    userName: 'Ana Silva',
    userAvatar: 'https://picsum.photos/seed/ana/100/100',
    type: 'REQUEST',
    category: 'OBJECT',
    title: 'Preciso de uma Furadeira',
    description: 'Alguém tem uma furadeira para emprestar por 2 horas? Pago bem em créditos!',
    value: 15,
    distance: '200m',
    createdAt: Date.now() - 1000 * 60 * 5 // 5 mins ago
  },
  {
    id: '102',
    userId: 'user3',
    userName: 'Carlos Moto',
    userAvatar: 'https://picsum.photos/seed/carlos/100/100',
    type: 'OFFER',
    category: 'SERVICE',
    title: 'Levo encomendas no bairro',
    description: 'Estou de moto e livre agora a tarde. Faço entregas rápidas.',
    value: 20,
    distance: '500m',
    createdAt: Date.now() - 1000 * 60 * 30
  },
  {
    id: '103',
    userId: 'user4',
    userName: 'Beatriz Yoga',
    userAvatar: 'https://picsum.photos/seed/bia/100/100',
    type: 'OFFER',
    category: 'SKILL',
    title: 'Aula rápida de Yoga',
    description: '30min de yoga no parque ou online para relaxar.',
    value: 25,
    distance: '800m',
    createdAt: Date.now() - 1000 * 60 * 60
  },
  {
    id: '104',
    userId: 'user5',
    userName: 'João Dev',
    userAvatar: 'https://picsum.photos/seed/joao/100/100',
    type: 'REQUEST',
    category: 'OBJECT',
    title: 'Cabo HDMI',
    description: 'O meu estragou e preciso apresentar um trabalho HOJE.',
    value: 10,
    distance: '100m',
    createdAt: Date.now() - 1000 * 60 * 120
  },
  {
    id: '105',
    userId: 'user6',
    userName: 'Mariana Plants',
    userAvatar: 'https://picsum.photos/seed/mari/100/100',
    type: 'OFFER',
    category: 'OBJECT',
    title: 'Mudas de Hortelã',
    description: 'Minha horta explodiu. Quem quer mudinhas frescas?',
    value: 5,
    distance: '350m',
    createdAt: Date.now() - 1000 * 60 * 10
  }
];