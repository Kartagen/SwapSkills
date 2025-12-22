import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Location from 'expo-location';
import {ActivityIndicator, Button, IconButton, Surface, Text} from 'react-native-paper';
import {auth} from '../../config/firebase';
import {checkForMatch, fetchCandidates, recordSwipe, updateUserLocation, UserProfile} from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function MapScreen({navigation}: any) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      if (auth.currentUser) {
        await updateUserLocation(auth.currentUser.uid, {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
        const users = await fetchCandidates(auth.currentUser.uid);
        setCandidates(users);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <ScreenWrapper style={[styles.container, styles.center]}>
        <ActivityIndicator size="large"/>
        <Text style={{marginTop: 10}}>Locating you...</Text>
      </ScreenWrapper>
    );
  }

  if (errorMsg) {
    return (
      <ScreenWrapper style={[styles.container, styles.center]}>
        <Text>{errorMsg}</Text>
      </ScreenWrapper>
    );
  }

  const handleConnect = async () => {
    if (!selectedUser || !auth.currentUser) return;

    await recordSwipe(auth.currentUser.uid, selectedUser.uid, 'like');

    const isMatch = await checkForMatch(auth.currentUser.uid, selectedUser.uid);

    if (isMatch) {
      Alert.alert("It's a Match!", `You and ${selectedUser.name} can now chat!`, [
        {
          text: "Chat Now",
          onPress: () => navigation.navigate('MainTabs', {screen: 'Chat', params: {recipient: selectedUser}})
        },
        {text: "OK"}
      ]);
    } else {
      Alert.alert("Request Sent", `You liked ${selectedUser.name}. If they like you back, it's a match!`);
    }
    setSelectedUser(null);
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        >
          {candidates.map((user) => (
            user.location ? (
              <Marker
                key={user.uid}
                coordinate={{
                  latitude: user.location.latitude,
                  longitude: user.location.longitude
                }}
                onPress={() => setSelectedUser(user)}
              />
            ) : null
          ))}
        </MapView>
      )}

      {selectedUser && (
        <Surface style={styles.bottomSheet} elevation={4}>
          <View style={styles.sheetHeader}>
            <View>
              <Text variant="titleMedium" style={styles.sheetTitle}>{selectedUser.name}</Text>
              <Text variant="bodyMedium" style={{color: '#666'}}>Skills: {selectedUser.skills.join(', ')}</Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setSelectedUser(null)}
              style={{margin: 0}}
            />
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('MainTabs', {screen: 'Profile', params: {user: selectedUser}})}
            style={{marginTop: 10}}
          >
            View Profile
          </Button>
          <Button
            mode="outlined"
            onPress={handleConnect}
            style={{marginTop: 10}}
            icon="heart"
          >
            Connect
          </Button>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    marginTop: 32
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetTitle: {
    fontWeight: 'bold',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 10,
  }
});
