import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from "react-native";
import axios from "axios";
import { AuthContext } from "./context/authContext";
import PostCard from "../PostCard";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const Announcements = ({ navigation }) => {
  const [state] = useContext(AuthContext);
  const currentUser = state.user;

  const [adminPosts, setAdminPosts] = useState([]);
  const [teacherPosts, setTeacherPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Admin");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get("/post/get-announcements", {
          params: {
            role: currentUser.role,
            userId: currentUser._id,
            grade: currentUser.grade,
            subjects: currentUser.subjects,
          },
        });
        setAdminPosts(response.data.adminPosts || []);
        setTeacherPosts(response.data.teacherPosts || []);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        Alert.alert("Error", "Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [currentUser]);

  const renderPosts = (posts) => {
    return posts.length > 0 ? (
      posts.map((post, index) => <PostCard key={index} post={post} />)
    ) : (
      <Text style={styles.noPostsText}>
        No {activeTab} announcements available.
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header Styled Like StudentAssignments Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => navigation.navigate("Account")}
        >
          <Image
            source={{
              uri:
                currentUser?.profilePicture ||
                "https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Admin" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Admin")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Admin" && styles.activeTabText,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Teacher" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Teacher")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Teacher" && styles.activeTabText,
              ]}
            >
              Teacher
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Section */}
        <ScrollView style={styles.postsContainer}>
          {activeTab === "Admin" && renderPosts(adminPosts)}
          {activeTab === "Teacher" && renderPosts(teacherPosts)}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  // Header styled like StudentAssignments topHalf
  header: {
    width: 393,
    height: 128,
    backgroundColor: "#006446",
    alignSelf: "center",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 59,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  profileContainer: {
    position: "absolute",
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
    borderColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "Ubuntu-Bold",
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  tabButton: {
    width: "52%",
    alignItems: "center",
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#006A4E",
  },
  activeTab: {
    backgroundColor: "#006A4E",
  },
  tabText: {
    fontSize: 14,
    color: "#006A4E",
    fontFamily: "Ubuntu-Bold",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontFamily: "Ubuntu-Bold",
  },
  postsContainer: {
    flex: 1,
  },
  noPostsText: {
    fontSize: 16,
    color: "#7B7D7D",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Kanit-Medium",
  },
});

export default Announcements;
