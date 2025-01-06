import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from 'react-native';

const ContactUs = () => {
  const handleCall = () => {
    Linking.openURL('tel:+923181142457');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@learnschoolacademy.com');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('./../../assets/lalogo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.heading}>Get in Touch</Text>

      {/* Contact Information */}
      <View style={styles.contactInfoContainer}>
        <Text style={styles.label}>Phone</Text>
        <TouchableOpacity onPress={handleCall}>
          <Text style={styles.linkText}>+92 318 1142457</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Email</Text>
        <TouchableOpacity onPress={handleEmail}>
          <Text style={styles.linkText}>info@learnschoolacademy.com</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Office Hours</Text>
        <Text style={styles.infoText}>9:30 AM - 6:30 PM, Monday - Saturday</Text>
        <Text style={styles.infoText}>Sunday Closed</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
    marginTop: 40,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  },
  heading: {
    fontSize: 28,
    // fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Kanit-Medium',
  },
  contactInfoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    // fontWeight: 'bold'
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Kanit-Medium',
  },
  linkText: {
    fontSize: 18,
    color: '#1E90FF',
    marginBottom: 20,
    textDecorationLine: 'underline',
    fontFamily: 'Kanit-Medium'
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Kanit-Medium',
  },
});

export default ContactUs;
