import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS, EFFORT_COLORS, EFFORT_LABELS, CATEGORIES, Effort } from '@/constants/cards';
import { useCards } from '@/hooks/use-cards';

export default function CardsScreen() {
  const { cards, addCard, deleteCard } = useCards();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // New card form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newEffort, setNewEffort] = useState<Effort>('low');
  const [newSteps, setNewSteps] = useState(['', '', '']);

  const filteredCards = selectedCategory
    ? cards.filter(c => c.category === selectedCategory)
    : cards;

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cards.filter(c => c.category === cat);
    return acc;
  }, {} as Record<string, typeof cards>);

  const handleAddCard = () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing title', 'Please enter a title for your card.');
      return;
    }
    addCard({
      category: newCategory,
      effort: newEffort,
      title: newTitle.trim(),
      steps: newSteps.filter(s => s.trim() !== ''),
    });
    setNewTitle('');
    setNewSteps(['', '', '']);
    setNewCategory(CATEGORIES[0]);
    setNewEffort('low');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>my cards</Text>
        <Text style={styles.headerSub}>{cards.length} total</Text>
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive, { borderColor: COLORS[cat] }]}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cards list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredCards.map(card => (
          <View key={card.id} style={[styles.cardRow, { borderLeftColor: COLORS[card.category] || '#A78BFA' }]}>
            <View style={styles.cardRowInfo}>
              <View style={styles.cardRowTop}>
                <Text style={styles.cardRowCategory}>{card.category}</Text>
                <View style={[styles.effortBadge, { backgroundColor: EFFORT_COLORS[card.effort] + '22' }]}>
                  <Text style={[styles.effortText, { color: EFFORT_COLORS[card.effort] }]}>{EFFORT_LABELS[card.effort]}</Text>
                </View>
              </View>
              <Text style={styles.cardRowTitle}>{card.title}</Text>
              {card.steps.length > 0 && (
                <Text style={styles.cardRowSteps}>{card.steps.length} steps</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Delete card?', card.title, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteCard(card.id) },
            ])}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Add button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Add Card</Text>
      </TouchableOpacity>

      {/* Add Card Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Card</Text>
            <TouchableOpacity onPress={handleAddCard}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Title */}
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What's the intention?"
              placeholderTextColor="#555"
              value={newTitle}
              onChangeText={setNewTitle}
              multiline
            />

            {/* Category */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.optionChip, newCategory === cat && { backgroundColor: COLORS[cat] }]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.optionChipText, newCategory === cat && styles.optionChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Effort */}
            <Text style={styles.fieldLabel}>Effort</Text>
            <View style={styles.effortRow}>
              {(['low', 'medium', 'high'] as Effort[]).map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.effortChip, newEffort === e && { backgroundColor: EFFORT_COLORS[e] }]}
                  onPress={() => setNewEffort(e)}
                >
                  <Text style={[styles.effortChipText, newEffort === e && styles.effortChipTextActive]}>
                    {EFFORT_LABELS[e]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Steps */}
            <Text style={styles.fieldLabel}>Steps (optional)</Text>
            {newSteps.map((step, i) => (
              <TextInput
                key={i}
                style={styles.input}
                placeholder={`Step ${i + 1}`}
                placeholderTextColor="#555"
                value={step}
                onChangeText={val => {
                  const updated = [...newSteps];
                  updated[i] = val;
                  setNewSteps(updated);
                }}
              />
            ))}
            <TouchableOpacity onPress={() => setNewSteps([...newSteps, ''])}>
              <Text style={styles.addStepBtn}>+ Add another step</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { paddingTop: 16, alignItems: 'center', marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  headerSub: { color: '#666', fontSize: 13, marginTop: 2 },

  filterRow: { maxHeight: 48, marginBottom: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#333' },
  filterChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  filterChipText: { color: '#666', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#000' },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },

  cardRow: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' },
  cardRowInfo: { flex: 1 },
  cardRowTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardRowCategory: { color: '#666', fontSize: 12, fontWeight: '700' },
  cardRowTitle: { color: '#fff', fontSize: 15, fontWeight: '600', lineHeight: 21 },
  cardRowSteps: { color: '#555', fontSize: 12, marginTop: 4 },
  deleteBtn: { color: '#555', fontSize: 18, paddingLeft: 12 },

  effortBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  effortText: { fontSize: 11, fontWeight: '700' },

  fab: { position: 'absolute', bottom: 32, right: 24, left: 24, backgroundColor: '#34D399', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  fabText: { color: '#000', fontSize: 16, fontWeight: '800' },

  // Modal
  modal: { flex: 1, backgroundColor: '#0f0f0f' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalCancel: { color: '#666', fontSize: 16 },
  modalSave: { color: '#34D399', fontSize: 16, fontWeight: '700' },

  modalBody: { flex: 1, padding: 20 },
  fieldLabel: { color: '#666', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, marginBottom: 10 },

  optionRow: { marginBottom: 4 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', marginRight: 8 },
  optionChipText: { color: '#666', fontSize: 13, fontWeight: '600' },
  optionChipTextActive: { color: '#000', fontWeight: '800' },

  effortRow: { flexDirection: 'row', gap: 10 },
  effortChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1a1a1a', alignItems: 'center' },
  effortChipText: { color: '#666', fontSize: 13, fontWeight: '600' },
  effortChipTextActive: { color: '#000', fontWeight: '800' },

  addStepBtn: { color: '#34D399', fontSize: 14, fontWeight: '600', marginTop: 4 },
});
