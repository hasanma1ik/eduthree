// userApi.js
const searchUsers = async (query) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/search/${query}`);
      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };
  
  export { searchUsers };
  