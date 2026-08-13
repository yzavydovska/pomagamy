import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AdminOrgVerificationStackParamList } from './types'
import { AdminOrganizationListScreen } from '../screens/admin/AdminOrganizationListScreen'
import { AdminOrganizationDetailScreen } from '../screens/admin/AdminOrganizationDetailScreen'

const Stack = createNativeStackNavigator<AdminOrgVerificationStackParamList>()

export function AdminOrgVerificationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminOrgList" component={AdminOrganizationListScreen} />
      <Stack.Screen name="AdminOrgDetail" component={AdminOrganizationDetailScreen} />
    </Stack.Navigator>
  )
}
