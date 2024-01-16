import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Autocomplete from 'react-native-autocomplete-input';
import { useNavigation, useRoute } from '@react-navigation/native'




const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const navigation = useNavigation()
  const route = useRoute()

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
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
      <View>
        <Text>{item.name}</Text>
        <Text>{item.email}</Text>
        {/* Add any other user information you want to display */}
      </View>
    </TouchableOpacity>
  );


return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}></Text>
      <View style={{ marginHorizontal: 20 }}>
        <Autocomplete
          data={searchResults}
          defaultValue={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          renderItem={renderItem}
          placeholder="Search users..."
          keyExtractor={(item) => item._id}
          flatListProps={{
            keyExtractor: (item) => item._id,
            renderItem,
          }}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
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
    marginTop: 10,
    paddingLeft: 10,
    color: '#af9f85',
  },
});

export default MessagesScreen;

