import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { List, Text, Avatar, Divider, Searchbar } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { auth } from '../../config/firebase';
import { fetchMatchesWithChats, MatchSummary } from '../../services/userService';
import { usePalette } from '../../theme/ThemeProvider';
import { Palette, spacing, radius } from '../../theme';
import { formatRelativeTime } from '../../utils/time';

export default function ChatScreen({ navigation }: any) {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const isFocused = useIsFocused();

  const loadMatches = async () => {
    if (auth.currentUser) {
      setLoading(true);
      const data = await fetchMatchesWithChats(auth.currentUser.uid);
      setMatches(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadMatches();
  }, [isFocused]);

  // New matches = matched but no conversation yet. Active chats = has messages.
  const newMatches = useMemo(() => matches.filter(m => !m.lastMessageAt), [matches]);
  const activeChats = useMemo(
    () =>
      matches
        .filter(m => m.lastMessageAt)
        .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0)),
    [matches]
  );

  const filteredChats = useMemo(
    () => activeChats.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [activeChats, searchQuery]
  );

  const renderMatchStory = ({ item }: { item: MatchSummary }) => (
    <TouchableOpacity
      style={styles.storyContainer}
      onPress={() => navigation.navigate('ChatRoom', { recipient: item })}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${item.name}`}
    >
      <View style={styles.storyRing}>
        {item.photoURL ? (
          <Avatar.Image size={60} source={{ uri: item.photoURL }} />
        ) : (
          <Avatar.Text size={60} label={item.name.substring(0, 2).toUpperCase()} />
        )}
      </View>
      <Text variant="labelMedium" style={styles.storyName} numberOfLines={1}>
        {item.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );

  const renderChatItem = (item: MatchSummary) => (
    <TouchableOpacity
      key={item.uid}
      onPress={() => navigation.navigate('ChatRoom', { recipient: item })}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${item.name}`}
    >
      <List.Item
        title={item.name}
        titleStyle={styles.chatTitle}
        description={item.lastMessage || 'Say hi 👋'}
        descriptionStyle={styles.chatDesc}
        descriptionNumberOfLines={1}
        left={() =>
          item.photoURL ? (
            <Avatar.Image size={50} source={{ uri: item.photoURL }} style={styles.chatAvatar} />
          ) : (
            <Avatar.Text size={50} label={item.name.substring(0, 2).toUpperCase()} style={styles.chatAvatar} />
          )
        }
        right={props => (
          <View style={styles.chatRight}>
            <Text variant="bodySmall" style={styles.chatTime}>
              {formatRelativeTime(item.lastMessageAt)}
            </Text>
            <List.Icon {...props} icon="chevron-right" color={palette.slate300} />
          </View>
        )}
      />
      <Divider style={styles.divider} />
    </TouchableOpacity>
  );

  if (loading && matches.length === 0) {
    return (
      <ScreenWrapper>
        <LoadingView label="Loading your matches…" />
      </ScreenWrapper>
    );
  }

  if (matches.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>Messages</Text>
        </View>
        <EmptyState
          icon="chat-outline"
          title="No matches yet"
          subtitle="When you and someone like each other, they'll show up here to chat."
          actionLabel="Start discovering"
          onAction={() => navigation.navigate('Home')}
        />
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMatches} tintColor={palette.primary} />}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {newMatches.length > 0 && !searchQuery && (
          <View style={styles.storiesSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>New Matches</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={newMatches}
              renderItem={renderMatchStory}
              keyExtractor={item => `story-${item.uid}`}
              contentContainerStyle={styles.storiesList}
            />
          </View>
        )}

        <View style={styles.chatsSection}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Recent Chats</Text>
          {filteredChats.length === 0 ? (
            <EmptyState
              icon={searchQuery ? 'magnify' : 'message-text-outline'}
              title={searchQuery ? 'No conversations found' : 'No conversations yet'}
              subtitle={
                searchQuery
                  ? 'Try a different name.'
                  : 'Tap a new match above to start chatting.'
              }
            />
          ) : (
            filteredChats.map(renderChatItem)
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    header: {
      padding: spacing.xl,
      paddingBottom: spacing.sm,
      backgroundColor: palette.background,
    },
    headerTitle: {
      fontWeight: 'bold',
      marginBottom: spacing.md,
      color: palette.slate800,
    },
    searchBar: {
      backgroundColor: palette.slate100,
      elevation: 0,
      borderRadius: radius.md,
    },
    searchInput: {
      fontSize: 16,
    },
    storiesSection: {
      paddingVertical: spacing.sm,
    },
    sectionTitle: {
      paddingHorizontal: spacing.xl,
      color: palette.slate500,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    storiesList: {
      paddingHorizontal: spacing.md,
    },
    storyContainer: {
      alignItems: 'center',
      marginHorizontal: spacing.sm,
      width: 70,
    },
    storyRing: {
      padding: 3,
      borderRadius: 35,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    storyName: {
      marginTop: spacing.xs,
      color: palette.slate800,
    },
    chatsSection: {
      flex: 1,
      marginTop: spacing.sm,
    },
    chatAvatar: {
      marginRight: spacing.sm,
    },
    chatTitle: {
      fontWeight: 'bold',
      color: palette.slate800,
    },
    chatDesc: {
      color: palette.slate500,
    },
    chatRight: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    chatTime: {
      color: palette.slate400,
      marginBottom: spacing.xs,
    },
    divider: {
      marginLeft: 80,
      backgroundColor: palette.slate100,
    },
  });
