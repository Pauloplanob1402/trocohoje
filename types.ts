export type ListingType = 'OFFER' | 'REQUEST'; // Eu tenho vs Eu quero
export type Category = 'OBJECT' | 'SERVICE' | 'SKILL';

export interface User {
  id: string;
  name: string;
  avatar: string;
  credits: number;
  streak: number;
  location: string;
  reputation: number;
}

export interface Listing {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: ListingType;
  category: Category;
  title: string;
  description: string;
  value: number; // in credits
  distance: string; // pre-calculated for display
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  text: string;
  type: 'OPPORTUNITY' | 'GAIN' | 'ALERT';
  read: boolean;
}