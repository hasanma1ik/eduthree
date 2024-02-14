import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useUser } from './context/userContext';

const ChatScreen = ({ route }) => {
  const { threadId } = route.params;
  const { currentUser } = useUser(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [threadId]);

  // Fetch messages for a specific thread
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/auth/threads/${threadId}`);
      const fetchedMessages = response.data.messages.map(message => ({
        ...message,
        // Compare message.sender with currentUser.id, adjust the property names as necessary
        sentByMe: message.sender === currentUser?._id,
        
      }));
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  

  const sendMessage = async () => {
    if (!threadId || newMessage.trim() === '') return;

    // Include sentByMe in the optimistic UI update
    const newMessageObj = {
      text: newMessage,
      sentByMe: true, // Assume the new message is sent by the current user
    };

    setMessages([...messages, newMessageObj]); // Optimistically update the UI
    setNewMessage('');

    try {
      await axios.post(`/auth/threads/${threadId}/messages`, { text: newMessage });
      fetchMessages(); // Refresh messages to get the updated list from the server
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Render each message item
  const renderMessage = ({ item }) => {
    const isSentByMe = item.sentByMe;
    return (
      <View style={[styles.messageContainer, isSentByMe? styles.userMessage : styles.otherUserMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 10,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3f8ae0',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcdcdc',
  },
  messageText: {
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  inputBox: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3f8ae0',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
