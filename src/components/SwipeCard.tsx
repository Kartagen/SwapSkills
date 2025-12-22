import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile } from '../services/userService';

interface SwipeCardProps {
  card: UserProfile;
}

export default function SwipeCard({ card }: SwipeCardProps) {
  return (
    <Surface style={styles.card} elevation={5}>
      <View style={styles.imageWrapper}>
        <Image
          source={
            card.photoURL
              ? { uri: card.photoURL }
              : { uri: 'https://placehold.co/400x500.png?text=No+Image' }
          }
          style={styles.image}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        <View style={styles.imageHeader}>
          <Text style={styles.name}>
            {card.name}
            {card.age ? <Text style={styles.age}>, {card.age}</Text> : null}
          </Text>
          {card.city ? <Text style={styles.city}>{card.city}</Text> : null}
        </View>
      </View>

      <View style={styles.content}>
        <Section title="CAN TEACH" chips={card.skills} chipStyle={styles.teachChip} />
        <Section title="WANTS TO LEARN" chips={card.learning} chipStyle={styles.learnChip} />
      </View>
    </Surface>
  );
}

function Section({ title, chips = [], chipStyle }: { title: string; chips: string[]; chipStyle: any }) {
  if (!chips.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.chips}>
        {chips.slice(0, 4).map((item, index) => (
          <Chip
            key={index}
            compact
            style={chipStyle}
            textStyle={styles.chipText}
          >
            {item}
          </Chip>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    height: '72%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  imageWrapper: {
    height: '60%',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },

  imageHeader: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  age: {
    fontWeight: '400',
    opacity: 0.85,
    color: '#FFFFFF',
  },

  city: {
    marginTop: 4,
    fontSize: 14,
    color: '#E5E7EB',
  },

  content: {
    padding: 16,
  },

  section: {
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    marginBottom: 6,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  teachChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
  },

  learnChip: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
  },

  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
