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
  ScrollView,
} from 'react-native';
import { COLORS, EFFORT_LABELS, Card } from '@/constants/cards';
import { useCards } from '@/hooks/use-cards';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.46;

const EFFORT_OPTIONS = ['All', 'Low', 'Medium', 'High'];
const TIME_OPTIONS = ['All', '< 15 min', '< 30 min', '< 1 hr', '1 hr+'];

function matchesTime(time: string, filter: string) {
  if (filter === 'All') return true;
  const mins = time.includes('hr') ? (parseFloat(time) * 60) : parseFloat(time);
  if (filter === '< 15 min') return mins < 15;
  if (filter === '< 30 min') return mins < 30;
  if (filter === '< 1 hr') return mins < 60;
  if (filter === '1 hr+') return mins >= 60;
  return true;
}

export default function HomeScreen() {
  const { cards } = useCards();
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [savedCards, setSavedCards] = useState<Card[]>([]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [effortFilter, setEffortFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const categories = ['All', ...Array.from(new Set(cards.map(c => c.category)))];

  const filteredCards = cards.filter(c => {
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (effortFilter !== 'All' && c.effort.toLowerCase() !== effortFilter.toLowerCase()) return false;
    if (!matchesTime(c.time, timeFilter)) return false;
    return true;
  });

  const currentCard = filteredCards[cardIndex % Math.max(filteredCards.length, 1)];
  const cardColor = currentCard ? COLORS[currentCard.category] || '#A78BFA' : '#A78BFA';

  const activeFilterCount = [categoryFilter, effortFilter, timeFilter].filter(f => f !== 'All').length;

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
    Animated.timing(pan, { toValue: { x: direction, y: 0 }, duration: 280, useNativeDriver: false }).start(() => {
      if (action === 'yes' && currentCard) setSavedCards(prev => [...prev, currentCard]);
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

  const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>intention</Text>
          <Text style={styles.headerSub}>what will you do today?</Text>
        </View>
        <TouchableOpacity style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} onPress={() => setShowFilters(f => !f)}>
          <Text style={styles.filterBtnIcon}>⚡</Text>
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── FILTERS ── */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterGroupLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {categories.map(cat => (
              <FilterChip key={cat} label={cat} active={categoryFilter === cat} onPress={() => setCategoryFilter(cat)} />
            ))}
          </ScrollView>

          <Text style={styles.filterGroupLabel}>Effort</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {EFFORT_OPTIONS.map(e => (
              <FilterChip key={e} label={e} active={effortFilter === e} onPress={() => setEffortFilter(e)} />
            ))}
          </ScrollView>

          <Text style={styles.filterGroupLabel}>Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {TIME_OPTIONS.map(t => (
              <FilterChip key={t} label={t} active={timeFilter === t} onPress={() => setTimeFilter(t)} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── SAVED COUNTER ── */}
      {savedCards.length > 0 && (
        <View style={styles.counterRow}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>✓ {savedCards.length} saved</Text>
          </View>
          {savedCards.length >= 2 && (
            <TouchableOpacity style={styles.readyBtn}>
              <Text style={styles.readyBtnText}>Ready to pick →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── CARD AREA ── */}
      {!currentCard ? (
        <View style={styles.cardArea}>
          <Text style={styles.emptyText}>No cards match your filters.</Text>
        </View>
      ) : (
        <View style={styles.cardArea}>
          <View style={styles.cardCenter}>
            <Animated.View
              style={[styles.cardWrapper, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
              {...panResponder.panHandlers}
            >
              <Animated.View style={[styles.label, styles.likeLabel, { opacity: likeOpacity }]}>
                <Text style={styles.labelText}>SAVE</Text>
              </Animated.View>
              <Animated.View style={[styles.label, styles.nopeLabel, { opacity: nopeOpacity }]}>
                <Text style={styles.labelText}>SKIP</Text>
              </Animated.View>

              <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                <View style={[styles.cardHeader, { backgroundColor: cardColor }]}>
                  <Text style={styles.cardCategory}>{currentCard.category}</Text>
                  <View style={styles.comboBadge}>
                    <Text style={styles.comboBadgeText}>{EFFORT_LABELS[currentCard.effort]}</Text>
                    <View style={styles.comboDivider} />
                    <Text style={styles.comboBadgeText}>{currentCard.time}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {!flipped ? (
                    <>
                      <Text style={styles.cardTitle}>{currentCard.title}</Text>
                      <Text style={styles.tapHint}>tap to see steps →</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.stepsTitle}>Your steps</Text>
                      {currentCard.steps.map((step, i) => (
                        <View key={i} style={styles.stepRow}>
                          <Text style={styles.stepNum}>{i + 1}</Text>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                      <Text style={styles.tapHint}>tap to flip back ←</Text>
                    </>
                  )}
                </View>
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      )}

      {/* ── BUTTONS ── */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => swipeCard('skip')}>
          <Text style={styles.skipIcon}>✕</Text>
          <Text style={styles.skipLabel}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={() => swipeCard('yes')}>
          <Text style={styles.saveIcon}>♡</Text>
          <Text style={styles.saveLabel}>Save</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {},
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  headerSub: { color: '#555', fontSize: 12, marginTop: 2 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterBtnActive: { borderColor: '#34D399', backgroundColor: '#0d2b1f' },
  filterBtnIcon: { fontSize: 13 },
  filterBtnText: { color: '#666', fontSize: 13, fontWeight: '700' },
  filterBtnTextActive: { color: '#34D399' },

  // Filters panel
  filtersPanel: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  filterGroupLabel: { color: '#444', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 12, marginBottom: 8 },
  filterRow: { flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  filterChipText: { color: '#555', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#000', fontWeight: '700' },

  // Counter
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  counterBadge: {
    backgroundColor: '#0d2b1f',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  counterText: { color: '#34D399', fontSize: 13, fontWeight: '700' },
  readyBtn: {
    backgroundColor: '#34D399',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  readyBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },

  // Card area
  emptyText: { color: '#555', fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardCenter: { width: CARD_WIDTH, height: CARD_HEIGHT },
  cardWrapper: { width: CARD_WIDTH, height: CARD_HEIGHT },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: { fontSize: 20, fontWeight: '900', color: '#fff' },
  comboBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  comboBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  comboDivider: { width: 1, height: 11, backgroundColor: 'rgba(255,255,255,0.35)' },
  cardBody: { flex: 1, backgroundColor: '#fff', padding: 28, justifyContent: 'center' },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#111', lineHeight: 34 },
  tapHint: { position: 'absolute', bottom: 22, right: 24, color: 'rgba(0,0,0,0.25)', fontSize: 13 },
  stepsTitle: { fontSize: 12, fontWeight: '700', color: '#bbb', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#f0f0f0', textAlign: 'center', lineHeight: 22, fontWeight: '800', fontSize: 11, color: '#999', marginRight: 12, marginTop: 1 },
  stepText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 21 },

  label: { position: 'absolute', top: 20, zIndex: 10, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 3 },
  likeLabel: { right: 16, borderColor: '#34D399', transform: [{ rotate: '15deg' }] },
  nopeLabel: { left: 16, borderColor: '#FF6B6B', transform: [{ rotate: '-15deg' }] },
  labelText: { fontSize: 18, fontWeight: '900', color: '#fff' },

  // Buttons
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 36,
    paddingTop: 8,
  },
  skipBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  skipIcon: { fontSize: 22, color: '#FF6B6B' },
  skipLabel: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 0.5 },

  saveBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  saveIcon: { fontSize: 28, color: '#fff' },
  saveLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 0.5 },
});
