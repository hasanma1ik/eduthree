import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "./context/authContext";
import PostCard from "../PostCard";

const Announcements = () => {
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Loading Announcements...</Text>
      </View>
    );
  }

  const renderPosts = (posts) => {
    return posts.length > 0 ? (
      posts.map((post, index) => (
        <PostCard key={index} post={post} />
      ))
    ) : (
      <Text style={styles.noPostsText}>
        No {activeTab} announcements available.
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Admin" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Admin")}
        >
          <Text style={[styles.tabText, activeTab === "Admin" && styles.activeTabText]}>
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
          <Text style={[styles.tabText, activeTab === "Teacher" && styles.activeTabText]}>
            Teacher 
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Section */}
      <ScrollView>
        {activeTab === "Admin" && renderPosts(adminPosts)}
        {activeTab === "Teacher" && renderPosts(teacherPosts)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loaderText: {
    fontSize: 18,
    color: "#018749",
    fontWeight: "bold",
    fontFamily: "Kanit-Medium",
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
    marginHorizontal: 0,
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
  noPostsText: {
    fontSize: 16,
    color: "#7B7D7D",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Kanit-Medium",
  },
});

export default Announcements;

