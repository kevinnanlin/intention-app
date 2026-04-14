import { useState } from 'react';
import { Card, DEFAULT_CARDS } from '@/constants/cards';

// Simple in-memory store shared across the app
let globalCards: Card[] = [...DEFAULT_CARDS];
let listeners: (() => void)[] = [];

function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notify() {
  listeners.forEach(fn => fn());
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>(globalCards);

  const addCard = (card: Omit<Card, 'id'>) => {
    const newCard: Card = { ...card, id: Date.now() };
    globalCards = [...globalCards, newCard];
    setCards(globalCards);
    notify();
  };

  const deleteCard = (id: number) => {
    globalCards = globalCards.filter(c => c.id !== id);
    setCards(globalCards);
    notify();
  };

  return { cards, addCard, deleteCard };
}
