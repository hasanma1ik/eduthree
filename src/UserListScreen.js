// UserListScreen.js

import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const UserListScreen = ({ navigation }) => {
  const users = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    // Add more user objects as needed
  ];

  const handleUserPress = (user) => {
    // Navigate to the chat screen with the selected user
    navigation.navigate('Chat', { user });
  };

  return (
    <View>
      <FlatList
        data={users}
        keyExtractor={(user) => user.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserPress(item)}>
            <View>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default UserListScreen;
