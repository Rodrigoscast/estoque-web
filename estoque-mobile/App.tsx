import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/pages/login';
import Home from './src/pages/home';
import RetiradaPecasScreen from './src/pages/SelecionarPecasScreen';
import InserirQuantidadeScreen from './src/pages/InserirQuantidadeScreen';
import Header from './src/components/Header'; // Importe o header

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route }) => ({
          headerShown: route.name !== "Login", // Esconde o header na tela de login
          header: ({ navigation }) =>
            route.name !== "Login" ? <Header title={route.name} /> : null,
        })}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Projetos" component={Home} />
        <Stack.Screen name="Escolher Peças" component={RetiradaPecasScreen} />
        <Stack.Screen name="Inserir Quantidade" component={InserirQuantidadeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
