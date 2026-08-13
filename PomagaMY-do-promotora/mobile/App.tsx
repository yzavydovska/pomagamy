import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import Ionicons from '@expo/vector-icons/Ionicons'
import { NavigationContainer } from '@react-navigation/native'
import { RootNavigator } from './src/navigation/RootNavigator'

export default function App() {
  const [fontsLoaded, fontError] = useFonts(Ionicons.font)

  useEffect(() => {
    if (fontError) {
      console.warn('[fonts]', fontError)
    }
  }, [fontError])

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  )
}
