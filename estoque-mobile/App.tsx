import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import Login from './src/pages/login';
import Home from './src/pages/home';
import RetiradaPecasScreen from './src/pages/SelecionarPecasScreen';
import SelecionarPecasRetirada from './src/pages/SelecionarPecasRetirada';
import InserirQuantidadeScreen from './src/pages/InserirQuantidadeScreen';
import InserirQuantidadeRetirada from './src/pages/InserirQuantidadeRetirada';
import Header from './src/components/Header'; // Importa o header
import Footer from './src/components/Footer';
import Produzindo from './src/pages/produzindo';
import Retirada from './src/pages/retirada';
import CarrinhoScreen from './src/carrinhoScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        {/* Stack Navigator */}
        <View style={styles.content}>
          <Stack.Navigator
            screenOptions={({ route }) => ({
              headerShown: route.name !== 'Login', // Esconde o header na tela de login
              header: ({ navigation }) =>
                route.name !== 'Login' ? <Header title={route.name} /> : null,
            })}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Projetos" component={Home} />
            <Stack.Screen name="Escolher Peças Para Produção" component={RetiradaPecasScreen} />
            <Stack.Screen name="Escolher Peças Para Retirada" component={SelecionarPecasRetirada} />
            <Stack.Screen name="Inserir Quantidade" component={InserirQuantidadeScreen} />
            <Stack.Screen name="Confirmar Retirada de Peças" component={InserirQuantidadeRetirada} />
            <Stack.Screen name="Produzindo" component={Produzindo} />
            <Stack.Screen name="Retirada" component={Retirada} />
            <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
          </Stack.Navigator>
        </View>

        {/* Footer fixo */}
        <Footer />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginBottom: 60, // Espaço reservado para o Footer
  },
});
