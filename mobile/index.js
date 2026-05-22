import { registerRootComponent } from 'expo'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PomagaMYProvider } from './src/context/PomagaMYContext'
import App from './App'

function Root() {
  return (
    <SafeAreaProvider>
      <PomagaMYProvider>
        <App />
      </PomagaMYProvider>
    </SafeAreaProvider>
  )
}

registerRootComponent(Root)
