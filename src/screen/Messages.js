import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation} from '@react-navigation/native'
import UserSuggestion from '../UserSuggestion';
import { useUser } from './context/userContext';



const MessagesScreen = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [suggestions, setSuggestions] = useState([])
  const [threads, setThreads] = useState([]);
  const navigation = useNavigation()
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser && currentUser._id) {
      console.log("Current User:", currentUser);
      fetchData();
      fetchThreads();
    } else {
      console.log('Current user is not available for fetching data.');
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/auth/all-users');
      setData(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      const response = await axios.get('/auth/threads');
      setThreads(response.data.threads);
    } catch (error) {
      console.error('Error fetching message threads:', error);
    }
  };


  const handleUserPress = async (otherUserId) => {
    if (!currentUser || !currentUser._id) {
      console.error('Current user data is not available');
      return;
    }
  
    try {
      const response = await axios.post('/auth/threads', {
        userId: currentUser._id, // Current user's ID
        otherUserId             // ID of the user to start a thread with
      });

      const newThread = response.data.thread;
      if (newThread && newThread._id) {
        setThreads([...threads, newThread]);
        navigation.navigate('ChatScreen', { threadId: newThread._id }); // Use _id here
      } else {
        console.error('Thread data is missing or does not have an _id');
      }
    } catch (error) {
      console.error('Error in handleUserPress:', error);
    }
  };
  


  const handleThreadPress = (thread) => {
    if (thread && thread._id) {
      navigation.navigate('ChatScreen', { threadId: thread._id }); // Use _id here
    } else {
      console.error('Thread data is missing or does not have an _id');
    }
  };
  

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (!searchQuery.trim()) {
        Alert.alert('Please enter a search query');
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/search');
      setSearchResults(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setLoading(false);
    }
  };

  const filterUsers = (text) => {
    const filteredUsers = data.filter((user) =>
      user.name.toLowerCase().includes(text.toLowerCase())
    );
  
    // Check if the search query is empty
    if (text.trim() === '') {
      setSuggestions([]);
    } else {
      setSuggestions(filteredUsers);
    }
  };
  const renderThread = ({ item }) => {
    console.log("Thread Data:", item); // Log the thread data for inspection
  
    if (!currentUser || !currentUser._id) {
      console.error('Current user data is not available');
      return null;
    }
    
  
    const otherUser = item.users.find(user => user._id !== currentUser._id) || {};
    const lastMessageText = item.messages[0]?.text || 'No messages';
  
    // Debug logs
    console.log("Other User in Thread:", otherUser.name);
    console.log("Last Message Text:", lastMessageText);
  
    return (
      <TouchableOpacity onPress={() => handleThreadPress(item)}>
        <View style={styles.threadContainer}>
          <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
          <Text style={styles.lastMessage}>{lastMessageText}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  


  

  return (
    <View style={styles.container}>
    <Text style={styles.pageTitle}></Text>
    <View style={{ marginHorizontal: 20 }}>
      <TextInput
        style={styles.inputBox}
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={(text) => {setSearchQuery(text); 
          filterUsers(text) 
        }}
      />

         <FlatList
          data={suggestions}
          keyExtractor={(item)=> item._id}
          renderItem={({ item }) => (
            
            <UserSuggestion user={item} onPress={() => handleUserPress(item)} />
          )}
        />
          <FlatList
        data={threads}
        keyExtractor={(thread) => thread._id?.toString()}
        renderItem={renderThread}
      />

        {/* <Button title="Search" onPress={handleSearch} /> */}
      </View>
      
        <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserPress(item)}>
            <View>
              <Text>{item.name}</Text>
              <Text>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
       <FlatList
        data={threads}
        keyExtractor={(thread) => thread._id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleThreadPress(item)}>
            <View style={styles.threadContainer}>
            <Text style={styles.userName}>{item.user?.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage?.text}</Text>

            </View>
          </TouchableOpacity>
        )}
      />
      {/* Add a button or UI element to trigger the creation of a new thread */}
      
    
  </View>
);
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from 'center' to 'flex-start'
    backgroundColor: 'white',
  },
  
  threadContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  lastMessage: {
    fontSize: 14,
    color: 'red',
  },
  
  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e2225',
  },
  inputBox: {
    height: 40,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginTop: -30,
    paddingLeft: 10,
    color: '#af9f85',
    borderColor: 'blue',  // Set the border color to blue
    borderWidth: 1, 
  },
});

export default MessagesScreen;






// const response = await axios.get('/auth/search');


  // const handleCreateThread = async (userId) => {
  //   try {
  //     // Create a new message thread using the threadController
  //     const response = await axios.post('/auth/threads', { userId });
  //     const newThread = response.data.thread;
  //     setThreads([...threads, newThread]);
  //     // Navigate to the ChatScreen with the new thread
  //     navigation.navigate('ChatScreen', { threadId: newThread.id });
  //   } catch (error) {
  //     console.error('Error creating thread:', error);
  //   }
  // };

  // <Button title="Create Thread" onPress={() => handleCreateThread()} />