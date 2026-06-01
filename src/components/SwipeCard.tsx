import React, { useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile } from '../services/userService';
import { usePalette } from '../theme/ThemeProvider';
import { Palette, spacing, radius } from '../theme';

interface SwipeCardProps {
  card: UserProfile;
}

export default function SwipeCard({ card }: SwipeCardProps) {
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

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
        <Section title="CAN TEACH" chips={card.skills} chipStyle={styles.teachChip} styles={styles} />
        <Section title="WANTS TO LEARN" chips={card.learning} chipStyle={styles.learnChip} styles={styles} />
      </View>
    </Surface>
  );
}

function Section({
  title,
  chips = [],
  chipStyle,
  styles,
}: {
  title: string;
  chips: string[];
  chipStyle: any;
  styles: any;
}) {
  if (!chips.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.chips}>
        {chips.slice(0, 4).map(item => (
          <Chip
            key={item}
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

const makeStyles = (palette: Palette) => StyleSheet.create({
  card: {
    height: '72%',
    borderRadius: radius.xl,
    backgroundColor: palette.surface,
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
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.onMedia,
  },

  age: {
    fontWeight: '400',
    opacity: 0.85,
    color: palette.onMedia,
  },

  city: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: palette.onMediaMuted,
  },

  content: {
    padding: spacing.lg,
  },

  section: {
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: palette.slate500,
    marginBottom: 6,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  teachChip: {
    backgroundColor: palette.teachTint,
    borderRadius: radius.md,
  },

  learnChip: {
    backgroundColor: palette.learnTint,
    borderRadius: radius.md,
  },

  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
