import { View, Text } from 'react-native'
import React from 'react'
import { AuthProvider } from './src/screen/context/authContext'
import MainTab from './src/tabs/MainTab'
import { PostProvider } from './src/screen/context/postContext'

const RootNavigation = () => {
  return (
    
      <AuthProvider>
        <PostProvider >
        <MainTab />
        </PostProvider>
       
      </AuthProvider>
    
  )
}

export default RootNavigation;