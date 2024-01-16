// ChatScreen.js

import React from 'react';
import { View, Text } from 'react-native';

const ChatScreen = ({ route }) => {
  const { user } = route.params;

  // Implement your chat UI and logic here

  return (
    <View>
      <Text>Chat with {user.name}</Text>
      {/* Add chat messages and input components */}
    </View>
  );
};

export default ChatScreen;
