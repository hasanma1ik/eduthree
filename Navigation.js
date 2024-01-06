import { View, Text } from 'react-native'
import React from 'react'
import { AuthProvider } from './src/screen/context/authContext'
import MainTab from './src/tabs/MainTab'

const RootNavigation = () => {
  return (
    
      <AuthProvider>
        <MainTab />
      </AuthProvider>
    
  )
}

export default RootNavigation;