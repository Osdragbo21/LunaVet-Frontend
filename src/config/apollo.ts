import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

// 1. Apuntamos al endpoint del Backend usando HttpLink
const httpLink = new HttpLink({
  uri: 'https://api-lunavet.utvt.cloud/graphql',
});

// 2. Puente de autenticación (Forma moderna sin warnings)
const authLink = new SetContextLink((prevContext) => {
  let token = localStorage.getItem('token');
  token = token ? token.replace(/['"]+/g, '') : '';
  
  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// 3. Exportamos el cliente instanciado
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});