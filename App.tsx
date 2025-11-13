import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainScreen } from './src/screens/MainScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { CropModalScreen } from './src/screens/CropModalScreen';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen
              name="CropModal"
              component={CropModalScreen}
              options={{
                presentation: 'modal',
              }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
