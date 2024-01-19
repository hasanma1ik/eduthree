// ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const ChatScreen = ({ route }) => {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Function to send a new message
  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      // Here, you can implement the logic to send a message to the backend or handle it according to your setup
      const updatedMessages = [...messages, { text: newMessage, sender: 'user' }];
      setMessages(updatedMessages);
      setNewMessage('');
    }
  };

  // Use useEffect to simulate fetching messages when the component mounts
  useEffect(() => {
    // Here, you can implement the logic to fetch messages from the backend
    const fetchedMessages = [
      { text: 'Hello!', sender: 'user' },
      { text: 'Hi there!', sender: 'otherUser' },
      // Add more messages as needed
    ];
    setMessages(fetchedMessages);
  }, []);

  // Render each message item
  const renderMessage = ({ item }) => (
    <View style={item.sender === 'user' ? styles.userMessage : styles.otherUserMessage}>
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
          onChangeText={(text) => setNewMessage(text)}
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
