import React, { useContext, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert 
} from "react-native";
import moment from "moment";
import axios from 'axios';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { AuthContext } from "./screen/context/authContext";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

const PostCard = ({ post, myPostScreen }) => {
  const [state] = useContext(AuthContext);
  const { user } = state;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleDeletePrompt = (id) => {
    Alert.alert(
      "Attention!",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDeletePost(id) }
      ]
    );
  };

  const handleDeletePost = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.delete(`/post/delete-post/${id}`);
      setLoading(false);
      alert(data?.message);
      navigation.push('Home');
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert(error);
    }
  };

  const canDelete = () => {
    if (user.role === "admin") return true;
    if (user.role === "teacher" && post?.postedBy?._id === user._id) return true;
    return false;
  };

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate("PostDetail", { post })}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Image
            source={{
              uri:
                post?.postedBy?.profilePicture ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            }}
            style={styles.profilePicture}
          />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{post?.postedBy?.name}</Text>
            <Text style={styles.postDate}>
              {moment(post?.createdAt).format("DD MMM YYYY")}
            </Text>
          </View>

          {(canDelete() || myPostScreen) && (
  <TouchableOpacity
    onPress={() =>
      Alert.alert("Delete Post", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => handleDeletePrompt(post?._id),
        },
      ])
    }
  >
    <FontAwesome5 name="ellipsis-h" size={22} color={"#7B7D7D"} />
  </TouchableOpacity>
)}

        </View>

        {/* Description container with fixed height and gradient overlay */}
        {post?.description && post.description.length > 100 ? (
  <View style={styles.descContainer}>
    <Text style={styles.desc} numberOfLines={4} ellipsizeMode="tail">
      {post?.description}
    </Text>
    <LinearGradient
      colors={["transparent", "white"]}
      style={styles.gradientOverlay}
    />
  </View>
) : (
  <Text style={styles.desc}>
    {post?.description}
  </Text>
)}

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    // borderTopLeftRadius: 12,
    // borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 15,
    // marginBottom: 15,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    
  },
  userName: {
    fontSize: 16,
    // fontWeight: "bold",
    color: "#006A4E",
    fontFamily: "Ubuntu-Bold",
  },
  postDate: {
    fontSize: 12,
    color: "#7B7D7D",
    marginBottom: 5,
    fontFamily: "Ubuntu-Regular",
  },
  descContainer: {
    height: 70, // Adjust this height as needed to display 3 full lines plus a faded fourth
    overflow: "hidden",
    position: "relative",
  },
  desc: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Ubuntu-Regular",
    lineHeight: 18,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, // Height of the fade effect
  },
});

export default PostCard;
