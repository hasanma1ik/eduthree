import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

//context
const PostContext = createContext();

const PostProvider = ({ children }) => {
  //state
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  //get posts
  const getAllPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/post/get-all-post", {
        params: {
          populate: "postedBy", // Ensure this is sent or handled in the backend
        },
      });
      setLoading(false);
      setPosts(data?.posts);
    } catch (error) {
      console.log("Error fetching posts:", error);
      setLoading(false);
    }
  };
  

  // inintal  posts
  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <PostContext.Provider value={[posts, setPosts, getAllPosts]}>
      {children}
    </PostContext.Provider>
  );
};

export { PostContext, PostProvider };