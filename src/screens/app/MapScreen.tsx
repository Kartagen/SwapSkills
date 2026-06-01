import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button, IconButton, Snackbar, Surface, Text } from 'react-native-paper';
import { auth } from '../../config/firebase';
import { checkForMatch, fetchCandidates, recordSwipe, updateUserLocation, UserProfile } from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import MatchModal from '../../components/MatchModal';
import { usePalette } from '../../theme/ThemeProvider';
import { Palette, radius, spacing } from '../../theme';

export default function MapScreen({ navigation }: any) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [denied, setDenied] = useState(false);
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<MapView>(null);
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const load = async () => {
    setLoading(true);
    setDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDenied(true);
        return;
      }
      const currentLocation =
        (await Location.getLastKnownPositionAsync()) ??
        (await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<Location.LocationObject | null>(resolve => setTimeout(() => resolve(null), 15000)),
        ]));

      if (!currentLocation) {
        setDenied(true);
        return;
      }

      setLocation(currentLocation);

      if (auth.currentUser) {
        await updateUserLocation(auth.currentUser.uid, {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        const users = await fetchCandidates(auth.currentUser.uid);
        setCandidates(users);
      }
    } catch (error) {
      console.error('Error loading map location:', error);
      setDenied(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const recenter = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleConnect = async () => {
    if (!selectedUser || !auth.currentUser) return;
    const target = selectedUser;
    setSelectedUser(null);

    await recordSwipe(auth.currentUser.uid, target.uid, 'like');
    const isMatch = await checkForMatch(auth.currentUser.uid, target.uid);

    if (isMatch) {
      setMatchedUser(target);
    } else {
      setSnackbar(`You liked ${target.name.split(' ')[0]}. If they like you back, it's a match!`);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LoadingView label="Locating you…" />
      </ScreenWrapper>
    );
  }

  if (denied) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="map-marker-off-outline"
          title="Location is off"
          subtitle="SwapSkill needs your location to show people swapping skills nearby."
          actionLabel="Open settings"
          onAction={() => Linking.openSettings()}
        />
        <View style={styles.retryRow}>
          <Button onPress={load}>Try again</Button>
        </View>
      </ScreenWrapper>
    );
  }

  const region: Region | undefined = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {candidates.map(user =>
            user.location ? (
              <Marker
                key={user.uid}
                coordinate={{ latitude: user.location.latitude, longitude: user.location.longitude }}
                onPress={() => setSelectedUser(user)}
                tracksViewChanges={false}
              >
                <View style={styles.marker}>
                  {user.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.markerImage} />
                  ) : (
                    <View style={styles.markerFallback}>
                      <Text style={styles.markerInitials}>{user.name.substring(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </Marker>
            ) : null
          )}
        </MapView>
      )}

      <Surface style={styles.recenter} elevation={3}>
        <IconButton icon="crosshairs-gps" accessibilityLabel="Recenter map" onPress={recenter} />
      </Surface>

      {selectedUser && (
        <Surface style={styles.bottomSheet} elevation={4}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetInfo}>
              <Text variant="titleMedium" style={styles.sheetTitle}>{selectedUser.name}</Text>
              <Text variant="bodyMedium" style={styles.sheetSub} numberOfLines={1}>
                Skills: {selectedUser.skills.join(', ')}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              accessibilityLabel="Dismiss"
              onPress={() => setSelectedUser(null)}
              style={styles.sheetClose}
            />
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Profile', params: { user: selectedUser } })}
            style={styles.sheetButton}
          >
            View Profile
          </Button>
          <Button mode="outlined" onPress={handleConnect} style={styles.sheetButton} icon="heart">
            Connect
          </Button>
        </Surface>
      )}

      <MatchModal
        visible={!!matchedUser}
        matchedUser={matchedUser}
        onClose={() => setMatchedUser(null)}
        onSendMessage={() => {
          const target = matchedUser;
          setMatchedUser(null);
          navigation.navigate('ChatRoom', { recipient: target });
        }}
      />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    retryRow: {
      alignItems: 'center',
      paddingBottom: spacing.xxl,
    },
    marker: {
      padding: 2,
      backgroundColor: palette.surface,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    markerImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    markerFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerInitials: {
      color: palette.onMedia,
      fontWeight: '700',
    },
    recenter: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: palette.surface,
    },
    bottomSheet: {
      position: 'absolute',
      bottom: spacing.xxl,
      left: spacing.xl,
      right: spacing.xl,
      borderRadius: radius.lg,
      padding: spacing.lg,
      backgroundColor: palette.surface,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    sheetInfo: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    sheetTitle: {
      fontWeight: 'bold',
      color: palette.slate800,
    },
    sheetSub: {
      color: palette.slate500,
    },
    sheetClose: {
      margin: 0,
    },
    sheetButton: {
      marginTop: spacing.sm,
    },
  });
