import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const EditModal = ({ modalVisible, setModalVisible, post }) => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

    const updatePostHandler = async (id) =>{
        try {
            setLoading(true)
            const {data} = await axios.put(`/post/update-post/${id}`,{title},{title, description})
            setLoading(false)
            alert(data?.message)
            navigation.navigate('Home')
        } catch (error) {
            setLoading(false)
            console.log(error)
            alert(error)
            
        }
    }


//initial post data
useEffect(()=>{
    setTitle([post?.title])
    setDescription(post?.description)
}, [post])
    
  return (
    <View style={styles.centeredView}>
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Update your Post!</Text>
          <Text>Title</Text>
          <TextInput
              style={styles.inputBox}
              value={title} onChangeText={(text)=>{setTitle(text)}} />
          <Text>Description</Text>
          <TextInput
              style={styles.inputBox}
              multiline={true}
              numberOfLines={4}
              value={description}
              onChangeText={(text)=>{
                setDescription(text)
              }}
              />
          
          <View style={styles.btnContainer}>
          <Pressable
            style={styles.button}
            onPress={() => {
                updatePostHandler(post && post._id),
                  setModalVisible(!modalVisible);
              }}>
            <Text style={styles.textStyle}>{loading ? "Please Wait" : "Update"}</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.textStyle}>Cancel</Text>
          </Pressable>
          </View>
          
        
        </View>
      </View>
    </Modal>
    <Pressable
      style={[styles.button, styles.buttonOpen]}
      onPress={() => setModalVisible(true)}>
      <Text style={styles.textStyle}>Show Modal</Text>
    </Pressable>
  </View>
);
};
const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 35,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    inputBox:{
        marginBottom:20,
        paddingTop: 10,
        textAlignVertical: "top",
        backgroundColor: 'lightgray',
        borderRadius: 10,
        marginTop: 10,
        paddingLeft: 10,
    },
    btnContainer:{
        flexDirection: "row",
    },
    button: {
      borderRadius: 20,
      padding: 10,
      backgroundColor: "black",
      elevation: 2,
      width: 100,
      margin: 10,
    },
    // buttonOpen: {
    //   backgroundColor: '#F194FF',
    // },
    buttonClose: {
      backgroundColor: 'red',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
  });


export default EditModal