import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation} from '@react-navigation/native'
import UserSuggestion from '../UserSuggestion';


const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [suggestions, setSuggestions] = useState([])
  const [messageThreads, setMessageThreads] = useState([]);

  const navigation = useNavigation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/auth/all-users'); // Modify the endpoint to fetch all users
        setData(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMessageThreads = async () => {
      try {
        const response = await axios.get('/auth/threads');
        setMessageThreads(response.data.threads);
      } catch (error) {
        console.error('Error fetching message threads:', error);
      }
    };

    fetchMessageThreads();
  }, []);

  const handleCreateThread = async (userId) => {
    try {
      // Create a new message thread using the threadController
      const response = await axios.post('/auth/threads', { userId });
      const newThread = response.data.thread;
      setMessageThreads([...messageThreads, newThread]);
      // Navigate to the ChatScreen with the new thread
      navigation.navigate('ChatScreen', { threadId: newThread.id });
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };




  const handleThreadPress = (thread) => {
    navigation.navigate('ChatScreen', { threadId: thread.id });
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

  

  const handleUserPress = (user) => {
    // Navigate to the ChatScreen with the selected user
    navigation.navigate('ChatScreen', { user });
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
        data={messageThreads}
        keyExtractor={(thread) => thread.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleThreadPress(item)}>
            <View style={styles.threadContainer}>
              <Text>{item.user?.name}</Text>
              <Text>Last Message: {item.lastMessage?.text}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Add a button or UI element to trigger the creation of a new thread */}
      <Button title="Create Thread" onPress={() => handleCreateThread(selectedUserId)} />
    
  </View>
);
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
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
