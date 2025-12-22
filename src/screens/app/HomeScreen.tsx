import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import Swiper from 'react-native-deck-swiper';
import ScreenWrapper from '../../components/ScreenWrapper';
import SwipeCard from '../../components/SwipeCard';
import MatchModal from '../../components/MatchModal';
import { auth } from '../../config/firebase';
import { getUserProfile, fetchCandidates, recordSwipe, checkForMatch, UserProfile } from '../../services/userService';

const DeckSwiper = Swiper as any;

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  const swiperRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (!profile) {
        navigation.navigate('Onboarding');
        return;
      }
      console.log(profile);

      const users = await fetchCandidates(auth.currentUser.uid);
      setCandidates(users);
    }
    setLoading(false);
  };

  const handleSwipeLeft = async (cardIndex: number) => {
    const candidate = candidates[cardIndex];
    if (!candidate || !auth.currentUser) return;
    await recordSwipe(auth.currentUser.uid, candidate.uid, 'pass');
  };

  const handleSwipeRight = async (cardIndex: number) => {
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
      <ScreenWrapper style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Discover</Text>
        <IconButton icon="refresh" onPress={loadData} />
      </View>

      <View style={styles.swiperContainer}>
        {candidates.length > 0 ? (
           <DeckSwiper
            ref={swiperRef}
            cards={candidates}
            renderCard={(card: UserProfile) => <SwipeCard card={card} />}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            onSwipedAll={() => setCandidates([])}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
            containerStyle={styles.deck}
             overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: {
                    borderColor: 'red',
                    color: 'red',
                    borderWidth: 1,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    borderColor: 'green',
                    color: 'green',
                    borderWidth: 1,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text variant="titleMedium">No more profiles to show.</Text>
            <Button onPress={loadData} mode="outlined" style={{ marginTop: 20 }}>Refresh</Button>
          </View>
        )}
      </View>

      {/* Action Buttons (Bottom) */}
      {candidates.length > 0 && (
         <View style={styles.actions}>
            <IconButton
                icon="close"
                mode="contained"
                containerColor="white"
                iconColor="red"
                size={40}
                onPress={() => swiperRef.current?.swipeLeft()}
            />
            <IconButton
                icon="heart"
                mode="contained"
                containerColor="white"
                iconColor="green"
                size={40}
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
            navigation.navigate('MainTabs', { screen: 'Chat' });
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 100,
  },
  title: {
    fontWeight: 'bold',
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    zIndex: 1,
  },
  deck: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 10,
    zIndex: 100,
  }
});
