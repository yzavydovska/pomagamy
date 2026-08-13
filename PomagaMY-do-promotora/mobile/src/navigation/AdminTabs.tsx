import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { AdminTabParamList } from './types'
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen'
import { AdminOrgVerificationStack } from './AdminOrgVerificationStack'
import { AdminComplaintsScreen } from '../screens/admin/AdminComplaintsScreen'
import { colors } from '../theme/colors'

const Tab = createBottomTabNavigator<AdminTabParamList>()

export function AdminTabs() {
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 12)
  const tabBarHeight = (Platform.OS === 'android' ? 56 : 52) + bottomPad

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#333',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: tabBarHeight,
          paddingBottom: bottomPad,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const iconSize = 24
          const activeWrap = {
            width: 40,
            height: 40,
            borderRadius: 999,
            backgroundColor: colors.primary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
          }
          if (route.name === 'AdminDashboard') {
            return focused ? (
              <View style={activeWrap}>
                <Ionicons name="home-outline" size={iconSize} color="#fff" />
              </View>
            ) : (
              <Ionicons name="home-outline" size={26} color={color} />
            )
          }
          if (route.name === 'AdminWeryfikacjaOrg') {
            return focused ? (
              <View style={activeWrap}>
                <Ionicons name="business-outline" size={iconSize} color="#fff" />
              </View>
            ) : (
              <Ionicons name="business-outline" size={26} color={color} />
            )
          }
          return focused ? (
            <View style={activeWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={iconSize} color="#fff" />
            </View>
          ) : (
            <Ionicons name="chatbubble-ellipses-outline" size={26} color={color} />
          )
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Panel' }} />
      <Tab.Screen
        name="AdminWeryfikacjaOrg"
        component={AdminOrgVerificationStack}
        options={{ title: 'Organizacje' }}
      />
      <Tab.Screen name="AdminSkargi" component={AdminComplaintsScreen} options={{ title: 'Skargi' }} />
    </Tab.Navigator>
  )
}
