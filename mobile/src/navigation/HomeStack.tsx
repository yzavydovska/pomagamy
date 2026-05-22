import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { HomeStackParamList } from './types'
import { OgloszeniaScreen } from '../screens/OgloszeniaScreen'
import { OgloszenieDetailScreen } from '../screens/OgloszenieDetailScreen'

const Stack = createNativeStackNavigator<HomeStackParamList>()

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OgloszeniaList" component={OgloszeniaScreen} />
      <Stack.Screen name="OgloszenieDetail" component={OgloszenieDetailScreen} />
    </Stack.Navigator>
  )
}
