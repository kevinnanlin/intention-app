export type Effort = 'low' | 'medium' | 'high';

export interface Card {
  id: number;
  category: string;
  effort: Effort;
  time: string;
  title: string;
  steps: string[];
}

export const COLORS: Record<string, string> = {
  '🍳 Cook': '#FF6B6B',
  '🌆 Explore': '#4ECDC4',
  '🎨 Create': '#FFE66D',
  '📚 Learn': '#A78BFA',
  '🤝 Connect': '#F97316',
  '🏃 Move': '#34D399',
};

export const EFFORT_COLORS: Record<string, string> = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#F87171',
};

export const EFFORT_LABELS: Record<string, string> = {
  low: '🟢 Low',
  medium: '🟡 Medium',
  high: '🔴 High',
};

export const CATEGORIES = Object.keys(COLORS);

export const DEFAULT_CARDS: Card[] = [
  { id: 1, category: '🍳 Cook', effort: 'medium', time: '~45 min', title: "Make a dish from a country you've never cooked from", steps: ['Pick a country', 'Find one recipe online', "Buy 3 ingredients you don't already have", 'Cook it tonight'] },
  { id: 2, category: '🌆 Explore', effort: 'low', time: '~30 min', title: "Walk somewhere you've never been in your city", steps: ['Pick a neighborhood you always pass but never enter', 'Leave your headphones at home', 'Walk for 30 minutes', 'Find one thing that surprises you'] },
  { id: 3, category: '🎨 Create', effort: 'low', time: '~10 min', title: 'Draw something in 10 minutes — no erasing', steps: ['Grab any pen and paper', 'Set a 10 minute timer', 'Draw whatever is in front of you', 'No erasing allowed'] },
  { id: 4, category: '📚 Learn', effort: 'low', time: '~20 min', title: 'Learn one magic trick', steps: ['Search "easy card trick for beginners"', 'Watch the tutorial once', 'Practice it 5 times', 'Show someone today'] },
  { id: 5, category: '🤝 Connect', effort: 'low', time: '~5 min', title: "Text someone you haven't talked to in 6+ months", steps: ['Think of someone you miss', 'Send a message — keep it simple', 'No overthinking it', 'Just say you were thinking of them'] },
  { id: 6, category: '🏃 Move', effort: 'high', time: '~2 hrs', title: "Do something physical you've never tried", steps: ['Pick: yoga, bouldering, a dance video, or a sport', 'Find a beginner YouTube video or nearby gym', 'Just show up or press play', 'Do it for at least 20 minutes'] },
  { id: 7, category: '🍳 Cook', effort: 'medium', time: '~30 min', title: "Cook a meal using only what's already in your kitchen", steps: ['No grocery runs allowed', 'Open your fridge and pantry', 'Find a recipe using those ingredients', 'Make it work'] },
  { id: 8, category: '🌆 Explore', effort: 'medium', time: '~1 hr', title: 'Find the highest point near you and go there', steps: ['Look up the nearest hill, rooftop, or viewpoint', 'Go at sunrise or sunset', 'Bring nothing to do', 'Just look around'] },
  { id: 9, category: '🎨 Create', effort: 'low', time: '~10 min', title: 'Write a 6-word story about your week', steps: ['Think about this week', 'Summarize it in exactly 6 words', 'Write it down', 'Share it with someone or keep it'] },
  { id: 10, category: '📚 Learn', effort: 'high', time: '~1 hr', title: "Learn 5 words in a new language", steps: ['Pick any language', 'Learn: hello, thank you, delicious, where is, and beautiful', 'Practice saying them out loud', 'Use one today somehow'] },
];
