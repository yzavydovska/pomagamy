import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { OrgStackParamList } from './types'
import { OrgOgloszeniaListScreen } from '../screens/org/OrgOgloszeniaListScreen'
import { OrgOgloszenieApplicantsScreen } from '../screens/org/OrgOgloszenieApplicantsScreen'
import { OrgNewOgloszenieScreen } from '../screens/org/OrgNewOgloszenieScreen'

const Stack = createNativeStackNavigator<OrgStackParamList>()

export function OrgHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrgOgloszeniaList" component={OrgOgloszeniaListScreen} />
      <Stack.Screen name="OrgOgloszenieApplicants" component={OrgOgloszenieApplicantsScreen} />
      <Stack.Screen name="OrgNewOgloszenie" component={OrgNewOgloszenieScreen} />
    </Stack.Navigator>
  )
}
