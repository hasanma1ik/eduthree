
// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const ThreadsContext = createContext();

// export const ThreadsProvider = ({ children }) => {
//   const [threads, setThreads] = useState([]);

//   const refreshThreads = async () => {
//     try {
//       const response = await axios.get('/auth/threads');
//       setThreads(response.data.threads);
//     } catch (error) {
//       console.error('Error refreshing threads:', error);
//     }
//   };

//   useEffect(() => {
//     refreshThreads();
//   }, []);

//   return (
//     <ThreadsContext.Provider value={{ threads, refreshThreads }}>
//       {children}
//     </ThreadsContext.Provider>
//   );
// };

// export const useThreads = () => useContext(ThreadsContext);
