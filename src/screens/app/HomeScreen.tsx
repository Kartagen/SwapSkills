import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Swiper from 'react-native-deck-swiper';
import ScreenWrapper from '../../components/ScreenWrapper';
import SwipeCard from '../../components/SwipeCard';
import MatchModal from '../../components/MatchModal';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { auth } from '../../config/firebase';
import { getUserProfile, fetchCandidates, recordSwipe, checkForMatch, UserProfile } from '../../services/userService';
import { usePalette } from '../../theme/ThemeProvider';
import { Palette, spacing } from '../../theme';

const DeckSwiper = Swiper as any;

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [canRewind, setCanRewind] = useState(false);

  const swiperRef = useRef<any>(null);
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setCanRewind(false);
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (!profile) {
        navigation.navigate('Onboarding');
        return;
      }
      const users = await fetchCandidates(auth.currentUser.uid);
      setCandidates(users);
    }
    setLoading(false);
  };

  const handleSwipeLeft = async (cardIndex: number) => {
    setCanRewind(true);
    const candidate = candidates[cardIndex];
    if (!candidate || !auth.currentUser) return;
    await recordSwipe(auth.currentUser.uid, candidate.uid, 'pass');
  };

  const handleSwipeRight = async (cardIndex: number) => {
    setCanRewind(true);
    const candidate = candidates[cardIndex];
    if (!candidate || !auth.currentUser) return;

    await recordSwipe(auth.currentUser.uid, candidate.uid, 'like');

    const isMatch = await checkForMatch(auth.currentUser.uid, candidate.uid);
    if (isMatch) {
      setMatchedUser(candidate);
      setMatchModalVisible(true);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LoadingView label="Finding people for you…" />
      </ScreenWrapper>
    );
  }

  const overlayLabel = (title: string, color: string, align: 'flex-start' | 'flex-end') => ({
    title,
    style: {
      label: { borderColor: color, color, borderWidth: 1 },
      wrapper: {
        flexDirection: 'column' as const,
        alignItems: align,
        justifyContent: 'flex-start' as const,
        marginTop: 30,
        marginLeft: align === 'flex-end' ? -30 : 30,
      },
    },
  });

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Discover</Text>
        <IconButton icon="refresh" accessibilityLabel="Refresh" onPress={loadData} />
      </View>

      <View style={styles.swiperContainer}>
        {candidates.length > 0 ? (
          <DeckSwiper
            ref={swiperRef}
            cards={candidates}
            renderCard={(card: UserProfile) => <SwipeCard card={card} />}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            onTapCard={(index: number) => {
              const card = candidates[index];
              if (card) navigation.navigate('MainTabs', { screen: 'Profile', params: { user: card } });
            }}
            onSwipedAll={() => setCandidates([])}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
            containerStyle={styles.deck}
            overlayLabels={{
              left: overlayLabel('PASS', palette.pass, 'flex-end'),
              right: overlayLabel('LIKE', palette.like, 'flex-start'),
            }}
          />
        ) : (
          <EmptyState
            icon="cards-outline"
            title="You're all caught up"
            subtitle="There's no one new to show right now. Check back soon!"
            actionLabel="Refresh"
            onAction={loadData}
          />
        )}
      </View>

      {candidates.length > 0 && (
        <View style={styles.actions}>
          <IconButton
            icon="close"
            mode="contained"
            accessibilityLabel="Pass"
            containerColor={palette.surface}
            iconColor={palette.pass}
            size={36}
            onPress={() => swiperRef.current?.swipeLeft()}
          />
          <IconButton
            icon="undo-variant"
            mode="contained"
            accessibilityLabel="Undo last swipe"
            disabled={!canRewind}
            containerColor={palette.surface}
            iconColor={palette.primary}
            size={28}
            onPress={() => {
              swiperRef.current?.swipeBack();
              setCanRewind(false);
            }}
          />
          <IconButton
            icon="heart"
            mode="contained"
            accessibilityLabel="Like"
            containerColor={palette.surface}
            iconColor={palette.like}
            size={36}
            onPress={() => swiperRef.current?.swipeRight()}
          />
        </View>
      )}

      <MatchModal
        visible={matchModalVisible}
        matchedUser={matchedUser}
        onClose={() => setMatchModalVisible(false)}
        onSendMessage={() => {
          setMatchModalVisible(false);
          if (matchedUser) navigation.navigate('ChatRoom', { recipient: matchedUser });
        }}
      />
    </ScreenWrapper>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      zIndex: 100,
    },
    title: {
      fontWeight: 'bold',
      color: palette.slate800,
    },
    swiperContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      marginTop: spacing.sm,
      zIndex: 1,
    },
    deck: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingBottom: spacing.sm,
      zIndex: 100,
    },
  });
