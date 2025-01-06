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

  const renderPosts = (posts, isAdmin = false) => {
    return posts.length > 0 ? (
      posts.map((post, index) => (
        <PostCard key={index} post={post} /> // Pass post to PostCard
      ))
    ) : (
      <Text style={styles.noPostsText}>
        No {isAdmin ? "Admin" : "Teacher"} announcements available.
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {(currentUser.role === "teacher" || currentUser.role === "student") && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Admin" && styles.activeTab]}
            onPress={() => setActiveTab("Admin")}
          >
            <Text style={[styles.tabText, activeTab === "Admin" && styles.activeTabText]}>
              Admin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Teacher" && styles.activeTab]}
            onPress={() => setActiveTab("Teacher")}
          >
            <Text style={[styles.tabText, activeTab === "Teacher" && styles.activeTabText]}>
              Teacher
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView>
        {activeTab === "Admin" && renderPosts(adminPosts, true)}
        {activeTab === "Teacher" && renderPosts(teacherPosts, false)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  loaderText: {
    fontSize: 18,
    color: "#3498DB",
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ECF0F1",
    borderRadius: 10,
    marginBottom: 20,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#D5D8DC",
    marginHorizontal: 5,
    borderRadius: 10,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: "maroon",
  },
  tabText: {
    fontSize: 16,
    color: "#7B7D7D",
    // fontWeight: "bold",
    fontFamily: 'Kanit-Medium'
  },
  activeTabText: {
    color: "#FFFFFF",
    // fontWeight: "bold",
    fontFamily: 'Kanit-Medium'


  },
  noPostsText: {
    fontSize: 16,
    color: "#7B7D7D",
    textAlign: "center",
    marginTop: 10,
  },
});

export default Announcements;
