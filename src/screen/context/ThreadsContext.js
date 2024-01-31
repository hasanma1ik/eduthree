import React, { createContext, useContext, useState } from 'react';

const ThreadsContext = createContext();

export const useThreads = () => useContext(ThreadsContext);

export const ThreadsProvider = ({ children }) => {
  const [threads, setThreads] = useState([]);

  const refreshThreads = async () => {
    // Implement your logic to fetch and update threads
    const updatedThreads = []; // Fetch threads from your backend
    setThreads(updatedThreads);
  };

  return (
    <ThreadsContext.Provider value={{ threads, refreshThreads }}>
      {children}
    </ThreadsContext.Provider>
  );
};
