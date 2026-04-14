import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, EFFORT_COLORS, EFFORT_LABELS } from '@/constants/cards';
import { useCards } from '@/hooks/use-cards';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.5;

export default function HomeScreen() {
  const { cards } = useCards();
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [doneCards, setDoneCards] = useState<number[]>([]);

  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentCard = cards[cardIndex % Math.max(cards.length, 1)];
  const cardColor = currentCard ? COLORS[currentCard.category] || '#A78BFA' : '#A78BFA';

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      const isTap = Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5;
      if (isTap) {
        flipCard();
      } else if (gesture.dx > 100) {
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
    Animated.timing(pan, { toValue: { x: direction, y: 0 }, duration: 300, useNativeDriver: false }).start(() => {
      if (action === 'yes' && currentCard) setDoneCards(prev => [...prev, currentCard.id]);
      pan.setValue({ x: 0, y: 0 });
      setFlipped(false);
      fadeAnim.setValue(1);
      setCardIndex(prev => prev + 1);
    });
  };

  const flipCard = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setFlipped(f => !f), 120);
  };

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });
  const likeOpacity = pan.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1] });
  const nopeOpacity = pan.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0] });

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No cards yet! Add some in the Cards tab.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>intention</Text>
        <Text style={styles.headerSub}>{doneCards.length} completed today</Text>
      </View>

      <View style={styles.cardArea}>
        <View style={styles.cardCenter}>
        <Animated.View
          style={[styles.cardWrapper, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
          {...panResponder.panHandlers}
        >
          {/* Swipe labels */}
          <Animated.View style={[styles.label, styles.likeLabel, { opacity: likeOpacity }]}>
            <Text style={styles.labelText}>LET'S GO</Text>
          </Animated.View>
          <Animated.View style={[styles.label, styles.nopeLabel, { opacity: nopeOpacity }]}>
            <Text style={styles.labelText}>SKIP</Text>
          </Animated.View>

          {/* Card — single view, content swaps on flip */}
          <Animated.View style={[styles.card, { backgroundColor: cardColor, opacity: fadeAnim }]}>
            {!flipped ? (
              <>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardCategory}>{currentCard.category}</Text>
                  <View style={[styles.effortBadge, { backgroundColor: EFFORT_COLORS[currentCard.effort] + '33' }]}>
                    <Text style={[styles.effortText, { color: EFFORT_COLORS[currentCard.effort] }]}>
                      {EFFORT_LABELS[currentCard.effort]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{currentCard.title}</Text>
                <Text style={styles.tapHint}>tap to see steps →</Text>
              </>
            ) : (
              <>
                <View style={styles.cardTopRow}>
                  <Text style={styles.stepsTitle}>Your steps</Text>
                  <View style={[styles.effortBadge, { backgroundColor: EFFORT_COLORS[currentCard.effort] + '33' }]}>
                    <Text style={[styles.effortText, { color: EFFORT_COLORS[currentCard.effort] }]}>
                      {EFFORT_LABELS[currentCard.effort]}
                    </Text>
                  </View>
                </View>
                {currentCard.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
                <Text style={styles.tapHint}>tap to flip back ←</Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
        </View>
      </View>

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
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  emptyText: { color: '#666', fontSize: 16, marginTop: 200, textAlign: 'center', paddingHorizontal: 40 },

  header: { paddingTop: 16, alignItems: 'center', marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  headerSub: { color: '#666', fontSize: 13, marginTop: 2 },

  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardCenter: { width: CARD_WIDTH, height: CARD_HEIGHT },

  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    padding: 32,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },

  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardCategory: { fontSize: 16, fontWeight: '700', color: 'rgba(0,0,0,0.45)' },
  effortBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  effortText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', lineHeight: 34 },
  tapHint: { position: 'absolute', bottom: 24, right: 28, color: 'rgba(0,0,0,0.3)', fontSize: 13 },

  stepsTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(0,0,0,0.45)' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.15)', textAlign: 'center', lineHeight: 24, fontWeight: '800', fontSize: 12, color: '#1a1a1a', marginRight: 12, marginTop: 1 },
  stepText: { flex: 1, fontSize: 15, color: '#1a1a1a', lineHeight: 22 },

  label: { position: 'absolute', top: 20, zIndex: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 3 },
  likeLabel: { right: 20, borderColor: '#34D399', transform: [{ rotate: '15deg' }] },
  nopeLabel: { left: 20, borderColor: '#FF6B6B', transform: [{ rotate: '-15deg' }] },
  labelText: { fontSize: 20, fontWeight: '900', color: '#fff' },

  buttons: { flexDirection: 'row', gap: 16, marginBottom: 32, alignSelf: 'stretch' },
  btn: { flex: 1, marginHorizontal: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  skipBtn: { backgroundColor: '#1f1f1f' },
  yesBtn: { backgroundColor: '#34D399' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
