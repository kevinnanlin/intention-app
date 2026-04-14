import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const CARDS = [
  { id: 1, category: '🍳 Cook', title: "Make a dish from a country you've never cooked from", steps: ['Pick a country', 'Find one recipe online', 'Buy 3 ingredients you don\'t already have', 'Cook it tonight'] },
  { id: 2, category: '🌆 Explore', title: "Walk somewhere you've never been in your city", steps: ['Pick a neighborhood you always pass but never enter', 'Leave your headphones at home', 'Walk for 30 minutes', 'Find one thing that surprises you'] },
  { id: 3, category: '🎨 Create', title: 'Draw something in 10 minutes — no erasing', steps: ['Grab any pen and paper', 'Set a 10 minute timer', 'Draw whatever is in front of you', 'No erasing allowed'] },
  { id: 4, category: '📚 Learn', title: 'Learn one magic trick', steps: ['Search "easy card trick for beginners"', 'Watch the tutorial once', 'Practice it 5 times', 'Show someone today'] },
  { id: 5, category: '🤝 Connect', title: "Text someone you haven't talked to in 6+ months", steps: ['Think of someone you miss', 'Send a message — keep it simple', 'No overthinking it', 'Just say you were thinking of them'] },
  { id: 6, category: '🏃 Move', title: "Do something physical you've never tried", steps: ['Pick: yoga, bouldering, a dance video, or a sport', 'Find a beginner YouTube video or nearby gym', 'Just show up or press play', 'Do it for at least 20 minutes'] },
  { id: 7, category: '🍳 Cook', title: "Cook a meal using only what's already in your kitchen", steps: ['No grocery runs allowed', 'Open your fridge and pantry', 'Find a recipe using those ingredients', 'Make it work'] },
  { id: 8, category: '🌆 Explore', title: 'Find the highest point near you and go there', steps: ['Look up the nearest hill, rooftop, or viewpoint', 'Go at sunrise or sunset', 'Bring nothing to do', 'Just look around'] },
  { id: 9, category: '🎨 Create', title: 'Write a 6-word story about your week', steps: ['Think about this week', 'Summarize it in exactly 6 words', 'Write it down', 'Share it with someone or keep it'] },
  { id: 10, category: '📚 Learn', title: "Learn 5 words in a new language", steps: ['Pick any language', 'Learn: hello, thank you, delicious, where is, and beautiful', 'Practice saying them out loud', 'Use one today somehow'] },
];

const COLORS: Record<string, string> = {
  '🍳 Cook': '#FF6B6B',
  '🌆 Explore': '#4ECDC4',
  '🎨 Create': '#FFE66D',
  '📚 Learn': '#A78BFA',
  '🤝 Connect': '#F97316',
  '🏃 Move': '#34D399',
};

export default function HomeScreen() {
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [doneCards, setDoneCards] = useState<number[]>([]);

  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const currentCard = CARDS[cardIndex % CARDS.length];
  const nextCard = CARDS[(cardIndex + 1) % CARDS.length];
  const cardColor = COLORS[currentCard.category] || '#A78BFA';

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !flipped,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 100) {
        swipeCard('yes');
      } else if (gesture.dx < -100) {
        swipeCard('skip');
      } else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    },
  });

  const swipeCard = (action: 'yes' | 'skip') => {
    const direction = action === 'yes' ? width * 1.5 : -width * 1.5;
    Animated.timing(pan, {
      toValue: { x: direction, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (action === 'yes') setDoneCards(prev => [...prev, currentCard.id]);
      pan.setValue({ x: 0, y: 0 });
      setFlipped(false);
      flipAnim.setValue(0);
      setCardIndex(prev => prev + 1);
    });
  };

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const likeOpacity = pan.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1] });
  const nopeOpacity = pan.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0] });

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>intention</Text>
        <Text style={styles.headerSub}>{doneCards.length} completed today</Text>
      </View>

      <View style={styles.cardArea}>
        {/* Next card peeking behind */}
        <View style={[styles.card, { backgroundColor: COLORS[nextCard.category] || '#A78BFA', opacity: 0.6, transform: [{ scale: 0.95 }] }]}>
          <Text style={styles.cardCategory}>{nextCard.category}</Text>
          <Text style={styles.cardTitle}>{nextCard.title}</Text>
        </View>

        {/* Current card */}
        <Animated.View
          style={[{ transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }, styles.cardWrapper]}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.label, styles.likeLabel, { opacity: likeOpacity }]}>
            <Text style={styles.labelText}>LET'S GO</Text>
          </Animated.View>
          <Animated.View style={[styles.label, styles.nopeLabel, { opacity: nopeOpacity }]}>
            <Text style={styles.labelText}>SKIP</Text>
          </Animated.View>

          {/* Front */}
          <Animated.View style={[styles.card, { backgroundColor: cardColor, backfaceVisibility: 'hidden', transform: [{ rotateY: frontInterpolate }] }]}>
            <Text style={styles.cardCategory}>{currentCard.category}</Text>
            <Text style={styles.cardTitle}>{currentCard.title}</Text>
            <Text style={styles.tapHint}>tap to see steps →</Text>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.card, styles.cardBack, { backgroundColor: cardColor, backfaceVisibility: 'hidden', transform: [{ rotateY: backInterpolate }] }]}>
            <Text style={styles.stepsTitle}>Your steps:</Text>
            {currentCard.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNum}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </View>

      {/* Flip button */}
      <TouchableOpacity style={styles.flipBtn} onPress={flipCard}>
        <Text style={styles.flipBtnText}>{flipped ? '← Back' : 'See Steps'}</Text>
      </TouchableOpacity>

      {/* Action buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.skipBtn]} onPress={() => swipeCard('skip')}>
          <Text style={styles.btnText}>✕  Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.yesBtn]} onPress={() => swipeCard('yes')}>
          <Text style={styles.btnText}>Let's Go  ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center' },
  header: { paddingTop: 16, alignItems: 'center', marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  headerSub: { color: '#666', fontSize: 13, marginTop: 2 },

  cardArea: { flex: 1, width, alignItems: 'center', justifyContent: 'center' },
  cardWrapper: { position: 'absolute' },

  card: {
    width: width * 0.85,
    height: height * 0.48,
    borderRadius: 24,
    padding: 32,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  cardBack: { backfaceVisibility: 'hidden', justifyContent: 'flex-start', paddingTop: 36 },
  cardCategory: { fontSize: 18, fontWeight: '700', color: 'rgba(0,0,0,0.5)', marginBottom: 16 },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', lineHeight: 34 },
  tapHint: { position: 'absolute', bottom: 24, right: 28, color: 'rgba(0,0,0,0.35)', fontSize: 13 },

  stepsTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(0,0,0,0.45)', marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.15)', textAlign: 'center', lineHeight: 24, fontWeight: '800', fontSize: 12, color: '#1a1a1a', marginRight: 12, marginTop: 1 },
  stepText: { flex: 1, fontSize: 15, color: '#1a1a1a', lineHeight: 22 },

  label: { position: 'absolute', top: 32, zIndex: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 3 },
  likeLabel: { right: 24, borderColor: '#34D399', transform: [{ rotate: '15deg' }] },
  nopeLabel: { left: 24, borderColor: '#FF6B6B', transform: [{ rotate: '-15deg' }] },
  labelText: { fontSize: 20, fontWeight: '900', color: '#fff' },

  flipBtn: { marginBottom: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#1f1f1f', borderRadius: 20 },
  flipBtnText: { color: '#aaa', fontSize: 14, fontWeight: '600' },

  buttons: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  btn: { flex: 1, marginHorizontal: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  skipBtn: { backgroundColor: '#1f1f1f' },
  yesBtn: { backgroundColor: '#34D399' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
