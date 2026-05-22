import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import type { MainTabParamList } from './types'
import { HomeStack } from './HomeStack'
import { OrgHomeStack } from './OrgHomeStack'
import { WiadomosciScreen } from '../screens/WiadomosciScreen'
import { ProfilVolunteerScreen } from '../screens/ProfilVolunteerScreen'
import { ProfilOrgScreen } from '../screens/ProfilOrgScreen'
import { usePomagaMY } from '../context/PomagaMYContext'
import { colors } from '../theme/colors'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTabs() {
  const { session } = usePomagaMY()
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 12)
  const tabBarHeight = (Platform.OS === 'android' ? 56 : 52) + bottomPad
  const isOrg = session?.role === 'organization'
  const HomeComponent = isOrg ? OrgHomeStack : HomeStack
  const ProfilComponent = isOrg ? ProfilOrgScreen : ProfilVolunteerScreen

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
          if (route.name === 'OgloszeniaTab') {
            return focused ? (
              <View style={activeWrap}>
                {/* Wypełnione „home” bywa uszkodzone w niektórych wersjach fontu — outline jest stabilne. */}
                <Ionicons name="home-outline" size={iconSize} color="#fff" />
              </View>
            ) : (
              <Ionicons name="home-outline" size={26} color={color} />
            )
          }
          if (route.name === 'Wiadomosci') {
            return focused ? (
              <View style={activeWrap}>
                <Ionicons name="mail-outline" size={iconSize} color="#fff" />
              </View>
            ) : (
              <Ionicons name="mail-outline" size={26} color={color} />
            )
          }
          return focused ? (
            <View style={activeWrap}>
              <Ionicons name="person-outline" size={iconSize} color="#fff" />
            </View>
          ) : (
            <Ionicons name="person-outline" size={26} color={color} />
          )
        },
      })}
    >
      <Tab.Screen
        name="OgloszeniaTab"
        component={HomeComponent}
        options={{ title: isOrg ? 'Organizacja' : 'Główna' }}
      />
      <Tab.Screen name="Wiadomosci" component={WiadomosciScreen} options={{ title: 'Wiadomości' }} />
      <Tab.Screen name="Profil" component={ProfilComponent} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  )
}
