import React from 'react';
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./router/app.router";
// IMPORTAMOS APOLLO
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './config/apollo';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={appRouter} />
    </ApolloProvider>
  );
}