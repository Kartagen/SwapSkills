import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';

interface MatchModalProps {
  visible: boolean;
  matchedUser: { name: string; photoURL?: string } | null;
  onClose: () => void;
  onSendMessage: () => void;
}

export default function MatchModal({ visible, matchedUser, onClose, onSendMessage }: MatchModalProps) {
  if (!matchedUser) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text variant="displaySmall" style={styles.title}>It's a Match!</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>You and {matchedUser.name} liked each other.</Text>

          <View style={styles.avatars}>
            {matchedUser.photoURL ? (
              <Avatar.Image size={100} source={{ uri: matchedUser.photoURL }} />
            ) : (
              <Avatar.Text size={100} label={matchedUser.name.substring(0, 2).toUpperCase()} />
            )}
          </View>

          <View style={styles.buttons}>
            <Button mode="contained" onPress={onSendMessage} style={styles.button}>
                Send a Message
            </Button>
            <Button mode="outlined" onPress={onClose} style={styles.button} textColor="white" buttonColor="transparent">
                Keep Swiping
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    color: '#10b981', // Emerald 500
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
  },
  avatars: {
    marginVertical: 30,
  },
  buttons: {
    width: '100%',
    gap: 15,
  },
  button: {
    borderColor: 'white',
  }
});
