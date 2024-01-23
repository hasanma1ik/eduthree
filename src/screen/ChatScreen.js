import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const ChatScreen = ({ route }) => {
  const { threadId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  
  // Fetch messages for a specific thread
    const fetchMessages = async () => {
    try {
      const response = await axios.get(`/auth/threads/${threadId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }
  useEffect(() => {
      fetchMessages();
    }, [threadId]);

  
  // Function to send a new message
  const sendMessage = async () => {
    console.log("Thread ID:", threadId); // Log the threadId to the console
  
    if (!threadId) {
      console.error('Thread ID is undefined');
      // Optionally, show an alert or handle the undefined threadId case
      Alert.alert("Error", "No conversation selected.");
      return; // Exit the function if threadId is undefined
    }
  
    try {
      if (newMessage.trim() === '') {
        return; // Don't send empty messages
      }
  
      await axios.post(`/auth/threads/${threadId}/messages`, { text: newMessage });
      setNewMessage('');
      fetchMessages(threadId); // Fetch updated messages after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  


  // Render each message item
  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

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
    backgroundColor: '#f2f2f2',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3f8ae0',
    padding: 8,
    margin: 5,
    borderRadius: 8,
    maxWidth: '70%',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcdcdc',
    padding: 8,
    margin: 5,
    borderRadius: 8,
    maxWidth: '70%',
  },
  messageText: {
    color: 'white', // Adjust text color based on the background
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
