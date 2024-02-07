import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation} from '@react-navigation/native'
import UserSuggestion from '../UserSuggestion';
import { useUser } from './context/userContext';
import { useIsFocused } from '@react-navigation/native';
import { Menu, IconButton, Provider as PaperProvider } from 'react-native-paper';
import { Entypo } from '@expo/vector-icons';


const MessagesScreen = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [suggestions, setSuggestions] = useState([])
  // const [threads, setThreads] = useState([]);
  const navigation = useNavigation()
  const [threads, setThreads] = useState([]);
  const { currentUser } = useUser();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (currentUser && currentUser._id && isFocused) {
      fetchData(); // Fetch other required data
      refreshThreads(); // Fetch or refresh threads
    }
  }, [currentUser, isFocused]); 

  
  const refreshThreads = async () => {
    try {
      // Ensure you have the correct endpoint and authentication (if required)
      const response = await axios.get('/auth/threads');
      console.log("Fetched threads:", response.data.threads);
      setThreads(response.data.threads);
    } catch (error) {
      console.error('Error refreshing threads:', error);
    }
  };
  
  
  

  const fetchData = async () => {
    try {
      const response = await axios.get('/auth/all-users');
      setData(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteConversation = async (threadId) => {
    try {
      // Assuming your threads are managed at a backend server
      await axios.delete(`/auth/threads/${threadId}`); // Make sure the endpoint matches your backend
      // Filter out the deleted thread from the local state
      setThreads(threads.filter(thread => thread._id !== threadId));
      Alert.alert("Success", "Conversation deleted");
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert("Error", "Failed to delete conversation");
    }
  };
  

  const handleMuteConversation = async (threadId) => {
    try {
      // Send a request to the backend to mute the conversation
      await axios.patch(`/auth/threads/mute/${threadId}`, { muted: true }); // Adjust based on your backend API
      // Update local state to reflect the mute status
      const updatedThreads = threads.map(thread => thread._id === threadId ? { ...thread, isMuted: true } : thread);
      setThreads(updatedThreads);
      Alert.alert("Success", "Conversation muted");
    } catch (error) {
      console.error('Error muting conversation:', error);
      Alert.alert("Error", "Failed to mute conversation");
    }
  };
  


  const handleUserPress = async (otherUserId) => {
    if (!currentUser || !currentUser._id) {
      console.error('Current user data is not available');
      return;
    }
    try {
      const response = await axios.post('/auth/threads', {
        userId: currentUser._id,
        otherUserId
      });
      const threadId = response.data.thread._id
      await refreshThreads();
      navigation.navigate('ChatScreen', { threadId:threadId})
    } catch (error) {
      console.error('Error in handleUserPress:', error);
    }
  };




  const handleThreadPress = (thread) => {
    if (thread && thread._id) {
      // Pass refreshThreads function along with threadId
      navigation.navigate('ChatScreen', { threadId: thread._id });
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
  
  console.log("Thread item:", item);
    if (!currentUser || !currentUser._id) {
        console.error('Current user data is not available');
        return null;
    }

    const otherUser = item.users.find(user => user._id !== currentUser._id) || {};
    const lastMessageText = item.messages[0]?.text || 'No messages';

    console.log("Other User in Thread:", otherUser.name);
    console.log("Last Message Text:", lastMessageText);

    return (
      
        <TouchableOpacity onPress={() => handleThreadPress(item)}>
            <View style={styles.threadContainer}>
           
            <Text>{item.name}</Text>
            <View style={{ }}> 
            <Entypo name="dots-three-horizontal" size={20} color="black" marginLeft={280} marginTop={-23}
        
        
          onPress={() => {
            
            Alert.alert(
              "Manage Conversation",
              "",
              [
                { text: "Delete Conversation", onPress: () => handleDeleteConversation(item._id) },
                { text: "Mute Conversation", onPress: () => handleMuteConversation(item._id) },
                { text: "Cancel", style: "cancel" }
              ],
              { cancelable: true }
            );
          }}
        />
        </View>
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
        <PaperProvider>
      <View style={styles.container}>
        {/* Your UI elements */}
        <FlatList
          data={threads}
          keyExtractor={(thread) => thread._id.toString()}
          renderItem={renderThread}
        />
      </View>
    </PaperProvider>

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