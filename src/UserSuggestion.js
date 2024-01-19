import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const UserSuggestion = ({ user, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
    <View style={styles.container}>
      {/* Add an image/icon component here */}
      <Image source= {{ uri:'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png'
      }}  style={styles.icon} />

      <View style={styles.userInfo}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    // Add any additional styling for the icon/image
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    // Add any additional styling for the name
  },
  email: {
    fontSize: 14,
    // Add any additional styling for the email
  },
});

export default UserSuggestion;
