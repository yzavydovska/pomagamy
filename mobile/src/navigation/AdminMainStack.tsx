import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AdminMainStackParamList } from './types'
import { AdminTabs } from './AdminTabs'
import { AdminComplaintDetailScreen } from '../screens/admin/AdminComplaintDetailScreen'

const Stack = createNativeStackNavigator<AdminMainStackParamList>()

export function AdminMainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabsHome" component={AdminTabs} />
      <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} />
    </Stack.Navigator>
  )
}
