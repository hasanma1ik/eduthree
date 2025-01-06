import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentScreen = () => {
  const paymentFormHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment</title>
    <style>
      /* Import Kanit-Medium font from Google Fonts */
      @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@500&display=swap');

      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #F9F9F9; /* Light background */
        font-family: 'Kanit', Arial, sans-serif;
        margin: 0;
      }
      .payform {
        background-color: #FFFFFF; /* White background */
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-radius: 12px;
        padding: 30px;
        width: 90%;
        max-width: 450px;
        color: #34495E; /* Dark text */
      }
      .payform input, .payform button {
        width: 100%;
        padding: 15px;
        margin-top: 15px;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid #CCC; /* Light border */
        font-size: 16px;
        background-color: #F3F4F6; /* Light input background */
        color: #34495E; /* Dark text */
        transition: border-color 0.3s, background-color 0.3s;
        font-family: 'Kanit', Arial, sans-serif; /* Apply Kanit font */
      }
      .payform input::placeholder {
        color: #7F8C8D; /* Neutral placeholder */
        font-style: italic;
      }
      .payform input:focus, .payform button:focus {
        outline: none;
        border-color: #2ECC71; /* Green accent color on focus */
        background-color: #E8F5E9; /* Slightly lighter background on focus */
      }
      .payform button {
        background: #2ECC71; /* Green button */
        border: none;
        cursor: pointer;
        font-weight: bold;
        text-transform: uppercase;
        transition: background 0.3s;
        font-family: 'Kanit', Arial, sans-serif; /* Apply Kanit font */
        color: #FFFFFF; /* White text */
      }
      .payform button:hover {
        background: #27AE60; /* Darker green on hover */
      }
      /* Responsive adjustments */
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
  `; // Ensure proper escaping or use template literals

  return (
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
  );
};

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9', /* Match the light background */
  },
  loadingText: {
    color: '#34495E', /* Dark text */
    fontSize: 18,
    fontFamily: 'Kanit-Medium', /* Use Kanit font for loading text */
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
