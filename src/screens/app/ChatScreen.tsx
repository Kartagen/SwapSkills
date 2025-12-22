import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { List, Text, Avatar, Divider, ActivityIndicator, useTheme, Searchbar } from 'react-native-paper';
import ScreenWrapper from '../../components/ScreenWrapper';
import { auth } from '../../config/firebase';
import { fetchMatches, UserProfile } from '../../services/userService';

export default function ChatScreen({ navigation }: any) {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const loadMatches = async () => {
    if (auth.currentUser) {
      setLoading(true);
      const data = await fetchMatches(auth.currentUser.uid);
      setMatches(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const filteredMatches = matches.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMatchStory = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
        style={styles.storyContainer}
        onPress={() => navigation.navigate('ChatRoom', { recipient: item })}
    >
        <View style={styles.storyRing}>
            {item.photoURL ? (
                <Avatar.Image size={60} source={{ uri: item.photoURL }} />
            ) : (
                <Avatar.Text size={60} label={item.name.substring(0, 2).toUpperCase()} />
            )}
        </View>
        <Text variant="labelMedium" style={styles.storyName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { recipient: item })}>
      <List.Item
        title={item.name}
        titleStyle={styles.chatTitle}
        description={`Skills: ${item.skills.slice(0, 2).join(', ')}`}
        descriptionStyle={styles.chatDesc}
        left={() => item.photoURL ? (
            <Avatar.Image size={50} source={{ uri: item.photoURL }} style={styles.chatAvatar} />
        ) : (
            <Avatar.Text size={50} label={item.name.substring(0,2).toUpperCase()} style={styles.chatAvatar} />
        )}
        right={props => (
            <View style={styles.chatRight}>
                <Text variant="bodySmall" style={styles.chatTime}>Just now</Text>
                <List.Icon {...props} icon="chevron-right" color="#CBD5E1" />
            </View>
        )}
      />
      <Divider style={styles.divider} />
    </TouchableOpacity>
  );

  if (loading && matches.length === 0) {
     return (
        <ScreenWrapper style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </ScreenWrapper>
     );
  }

  return (
    <ScreenWrapper>
     <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Messages</Text>
        <Searchbar
            placeholder="Search conversations"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
        />
     </View>

     <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMatches} />}
        contentContainerStyle={{ paddingBottom: 20 }}
     >
        {matches.length > 0 && (
            <View style={styles.storiesSection}>
                <Text variant="titleSmall" style={styles.sectionTitle}>New Matches</Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={matches.slice(0, 5)} // Showing first few as "new"
                    renderItem={renderMatchStory}
                    keyExtractor={item => `story-${item.uid}`}
                    contentContainerStyle={styles.storiesList}
                />
            </View>
        )}

        <View style={styles.chatsSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Recent Chats</Text>
            {filteredMatches.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge">No conversations found</Text>
                    <Text variant="bodyMedium" style={styles.emptySub}>Matches will appear here once you both like each other.</Text>
                </View>
            ) : (
                filteredMatches.map(item => (
                    <View
                        style={styles.storiesList}
                        key={item.uid}
                    >
                        {renderChatItem({ item })}
                    </View>
                ))
            )}
        </View>
     </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchBar: {
    backgroundColor: '#F1F5F9',
    elevation: 0,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  storiesSection: {
    paddingVertical: 10,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  storiesList: {
    paddingHorizontal: 15,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  storyRing: {
    padding: 3,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  storyName: {
    marginTop: 5,
    color: '#1e293b',
  },
  chatsSection: {
    flex: 1,
    marginTop: 10,
  },
  chatAvatar: {
    marginRight: 10,
  },
  chatTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  chatDesc: {
    color: '#64748B',
  },
  chatRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chatTime: {
    color: '#94A3B8',
    marginBottom: 5,
  },
  divider: {
    marginLeft: 80,
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySub: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 10,
  }
});
