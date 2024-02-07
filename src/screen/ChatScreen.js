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

  
  const sendMessage = async () => {
    if (!threadId || newMessage.trim() === '') return;

    const newMessageObj = {
      // Construct a temporary new message object
      text: newMessage,
      // Add any other required properties
    };

    setMessages([...messages, newMessageObj]); // Optimistically update the UI
    setNewMessage('');

    try {
      await axios.post(`/auth/threads/${threadId}/messages`, { text: newMessage });
      fetchMessages(); // Refresh messages to get the updated list from the server
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, handle failed message sending (e.g., remove the optimistic message)
    }
};


  // Render each message item
  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  useEffect(() => {
    fetchMessages();
  }, [threadId]);

  
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
    color: 'black', // Adjust text color based on the background
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