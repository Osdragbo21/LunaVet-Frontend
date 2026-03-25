import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

// 1. Apuntamos al endpoint del Backend
const httpLink = createHttpLink({
    uri: 'http://localhost:3000/graphql',
});

// 2. Preparamos el inyector del Token (Aunque ahora esté abierto, ya queda listo)
const authLink = setContext((_, { headers }) => {
  // En el futuro, aquí leeremos el token del localStorage o Zustand/Redux
    const token = localStorage.getItem('lunavet_token'); 
    return {
        headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        }
    }
});

// 3. Exportamos el cliente instanciado
export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
});