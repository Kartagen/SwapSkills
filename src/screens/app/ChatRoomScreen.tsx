import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { getChatId, unmatchUser } from '../../services/userService';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, IconButton, Avatar, Menu } from 'react-native-paper';
import { usePalette } from '../../theme/ThemeProvider';
import { Palette, spacing } from '../../theme';

export default function ChatRoomScreen({ route, navigation }: any) {
    const { recipient } = route.params;
    const [messages, setMessages] = useState<IMessage[]>([]);
    const currentUser = auth.currentUser;
    const palette = usePalette();
    const styles = useMemo(() => makeStyles(palette), [palette]);
    const [menuVisible, setMenuVisible] = useState(false);

    const handleUnmatch = () => {
        setMenuVisible(false);
        Alert.alert(
            "Unmatch",
            `Are you sure you want to unmatch with ${recipient.name}? You won't be able to chat with them anymore.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unmatch",
                    style: "destructive",
                    onPress: async () => {
                        if (currentUser) {
                            try {
                                await unmatchUser(currentUser.uid, recipient.uid);
                                navigation.navigate('MainTabs', { screen: 'Chat' });
                            } catch (e) {
                                Alert.alert("Error", "Could not unmatch. Please try again.");
                            }
                        }
                    }
                }
            ]
        );
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitle}>
                    {recipient.photoURL ? (
                        <Avatar.Image size={32} source={{ uri: recipient.photoURL }} />
                    ) : (
                        <Avatar.Text size={32} label={recipient.name.substring(0, 2).toUpperCase()} />
                    )}
                    <Text variant="titleMedium" style={styles.headerText}>{recipient.name}</Text>
                </View>
            ),
            headerRight: () => (
                <View style={{ marginRight: spacing.sm }}>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={<IconButton icon="dots-vertical" accessibilityLabel="Chat options" onPress={() => setMenuVisible(true)} />}
                    >
                        <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('MainTabs', { screen: 'Profile', params: { user: recipient } }); }} title="View Profile" leadingIcon="account" />
                        <Menu.Item onPress={handleUnmatch} title="Unmatch" leadingIcon="account-remove" titleStyle={{ color: palette.error }} />
                    </Menu>
                </View>
            ),
            headerShown: true,
        });
    }, [navigation, recipient, menuVisible]);

    useEffect(() => {
        if (!currentUser || !recipient) return;

        const chatId = getChatId(currentUser.uid, recipient.uid);
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        _id: doc.id,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        text: data.text,
                        user: data.user,
                    };
                })
            );
        });

        return () => unsubscribe();
    }, [currentUser, recipient]);

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        const { _id, text } = newMessages[0];
        if (!currentUser || !recipient) return;

        const chatId = getChatId(currentUser.uid, recipient.uid);

        try {
            const cleanUser = {
                _id: currentUser.uid,
                name: currentUser.displayName || 'Me',
                avatar: currentUser.photoURL || '',
            };

            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                _id,
                createdAt: serverTimestamp(),
                text,
                user: cleanUser,
            });
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }, [currentUser, recipient]);

    const renderBubble = (props: any) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: palette.primary,
                    borderRadius: 15,
                    padding: 2,
                },
                left: {
                    backgroundColor: palette.slate200,
                    borderRadius: 15,
                    padding: 2,
                },
            }}
            textStyle={{
                right: { color: palette.onMedia },
                left: { color: palette.slate800 },
            }}
        />
    );

    const renderSend = (props: any) => (
        <Send {...props} containerStyle={styles.sendContainer}>
            <IconButton icon="send" accessibilityLabel="Send message" iconColor={palette.primary} size={24} />
        </Send>
    );

    const renderInputToolbar = (props: any) => (
        <InputToolbar
            {...props}
            containerStyle={styles.inputToolbar}
            primaryStyle={{ alignItems: 'center' }}
        />
    );

    if (!currentUser) return null;

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={newMessages => onSend(newMessages)}
                user={{
                    _id: currentUser.uid,
                }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={renderInputToolbar}
                isScrollToBottomEnabled
            />
        </View>
    );
}

const makeStyles = (palette: Palette) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        headerTitle: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerText: {
            marginLeft: spacing.sm,
            fontWeight: 'bold',
        },
        sendContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginRight: spacing.sm,
        },
        inputToolbar: {
            backgroundColor: palette.surface,
            borderTopWidth: 1,
            borderTopColor: palette.slate100,
            paddingVertical: spacing.xs,
        },
    });
