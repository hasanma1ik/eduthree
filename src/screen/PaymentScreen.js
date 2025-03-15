import React, {useContext} from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { WebView } from 'react-native-webview';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './context/authContext';
const PaymentScreen = () => {
  const navigation = useNavigation();
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

    // Profile Picture
    const profilePicture = currentUser?.profilePicture ||
    'https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png';

    const paymentFormHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #F9F9F9;
          font-family: 'Ubuntu', Arial, sans-serif;
          font-weight: 700;
          margin: 0;
        }
        .payform {
          background-color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 30px;
          width: 90%;
          max-width: 450px;
          color: #34495E;
        }
        .payform input, .payform button {
          width: 100%;
          padding: 15px;
          margin-top: 15px;
          box-sizing: border-box;
          border-radius: 8px;
          border: 1px solid #CCC;
          font-size: 16px;
          background-color: #F3F4F6;
          color: #34495E;
          transition: border-color 0.3s, background-color 0.3s;
          font-family: 'Ubuntu', Arial, sans-serif;
          font-weight: 700;
        }
        .payform input::placeholder {
          color: #7F8C8D;
          font-style: italic;
        }
        .payform input:focus, .payform button:focus {
          outline: none;
          border-color: #2ECC71;
          background-color: #E8F5E9;
        }
        .payform button {
          background: #006446;
          border: none;
          cursor: pointer;
          font-weight: bold;
          text-transform: uppercase;
          transition: background 0.3s;
          font-family: 'Ubuntu', Arial, sans-serif;
          color: #FFFFFF;
        }
        .payform button:hover {
          background: #006446;
        }
        @media (max-width: 500px) {
          .payform {
            padding: 20px;
          }
          .payform input, .payform button {
            padding: 12px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <form action="https://ipg.blinq.pk/Home/PayInvoice" method="get" target="_blank" class="payform">
        <input type="text" id="order_id" name="order_id" placeholder="Enter your INVOICE ID" />
        <input type="hidden" name="pcode" id="pcode" />
        <button type="submit">Pay Now</button>
      </form>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      <script>
        jQuery(document).ready(function(){
          jQuery("#order_id").on("change paste keyup", function(){
            var value1 = jQuery.trim(jQuery("#order_id").val().replaceAll(' ', ''));
            var value1_updated = value1.indexOf("100333") >= 0 ? value1.substr(6) : value1;
            jQuery("#pcode").val(value1_updated);
          });
        });
      </script>
    </body>
    </html>
  `;
  
  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
         <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Account')}>
                  <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                </TouchableOpacity>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{ html: paymentFormHTML }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Payment Form...</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    width: '100%',
    height: 128,
    backgroundColor: '#006446',
    alignSelf: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 30,
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  profileContainer: {
    position: 'absolute',
    top: 57,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    color: '#34495E',
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default PaymentScreen;




// import React from 'react';
// import { WebView } from 'react-native-webview';

// const PaymentScreen = () => {
//   const paymentFormHTML = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Payment</title>
//     <style>
//       body {
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         height: 100vh;
//         background-color: #f4f7fa;
//         font-family: Arial, sans-serif;
//         margin: 0;
//       }
//       .payform {
//         background-color: white;
//         box-shadow: 0 4px 8px rgba(0,0,0,0.1);
//         border-radius: 8px;
//         padding: 20px;
//         width: 90%;
//         max-width: 400px;
//       }
//       .payform input, .payform button {
//         width: 100%;
//         padding: 15px;
//         margin-top: 10px;
//         box-sizing: border-box;
//         border-radius: 5px;
//         border: 1px solid #ccc;
//         font-size: 16px;
//       }
//       .payform input:focus, .payform button:focus {
//         outline: none;
//         border-color: #66afe9;
//       }
//       .payform button {
//         color: white;
//         background-color: #4CAF50;
//         border: none;
//         cursor: pointer;
//         font-weight: bold;
//         text-transform: uppercase;
//       }
//       .payform button:hover {
//         background-color: #45a049;
//       }
//     </style>
//   </head>
//   <body>
//     <form action="https://ipg.blinq.pk/Home/PayInvoice" method="get" target="_blank" class="payform">
//       <input type="text" id="order_id" name="order_id" placeholder="Enter your INVOICE ID" />
//       <input type="hidden" name="pcode" id="pcode" />
//       <button type="submit">Pay Now</button>
//     </form>
//     <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
//     <script>
//       jQuery(document).ready(function(){
//         jQuery("#order_id").on("change paste keyup", function(){
//           var value1 = jQuery.trim(jQuery("#order_id").val().replaceAll(' ', ''));
//           var value1_updated = value1.indexOf("100333") >= 0 ? value1.substr(6) : value1;
//           jQuery("#pcode").val(value1_updated);
//         });
//       });
//     </script>
//   </body>
//   </html>
//   `; // Your HTML code goes here, ensure it's properly escaped or loaded

//   return (
//     <WebView
//       originWhitelist={['*']}
//       source={{ html: paymentFormHTML }}
//       style={{ marginTop: 20, flex: 1 }}
//     />
//   );
// };

// export default PaymentScreen;
