import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { getChatId, unmatchUser } from '../../services/userService';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, useTheme, IconButton, Avatar, Menu } from 'react-native-paper';

export default function ChatRoomScreen({ route, navigation }: any) {
    const { recipient } = route.params;
    const [messages, setMessages] = useState<IMessage[]>([]);
    const currentUser = auth.currentUser;
    const theme = useTheme();
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
                <View style={{ marginRight: 10 }}>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
                    >
                        <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('MainTabs', { screen: 'Profile', params: { user: recipient } }); }} title="View Profile" leadingIcon="account" />
                        <Menu.Item onPress={handleUnmatch} title="Unmatch" leadingIcon="account-remove" titleStyle={{ color: 'red' }} />
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
                    backgroundColor: theme.colors.primary,
                    borderRadius: 15,
                    padding: 2,
                },
                left: {
                    backgroundColor: '#E2E8F0',
                    borderRadius: 15,
                    padding: 2,
                },
            }}
            textStyle={{
                right: { color: '#fff' },
                left: { color: '#1e293b' },
            }}
        />
    );

    const renderSend = (props: any) => (
        <Send {...props} containerStyle={styles.sendContainer}>
            <IconButton icon="send" iconColor={theme.colors.primary} size={24} />
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
            {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingBottom: 20,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 10,
        fontWeight: 'bold',
    },
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginRight: 10,
    },
    inputToolbar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f1f1',
        paddingVertical: 5,
    },
});
