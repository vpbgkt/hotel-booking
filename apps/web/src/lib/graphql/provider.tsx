'use client';

/**
 * Apollo Provider for Client Components
 * Wraps the app to enable GraphQL queries in client components
 */

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { ApolloProvider } from '@apollo/client/react';
import { useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    return new ApolloClient({
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              hotels: {
                keyArgs: ['filters', 'pagination'],
                merge(existing, incoming, { args }) {
                  if (!args?.pagination?.page || args.pagination.page === 1) {
                    return incoming;
                  }
                  return {
                    ...incoming,
                    hotels: [...(existing?.hotels || []), ...incoming.hotels],
                  };
                },
              },
            },
          },
          Hotel: { keyFields: ['id'] },
          RoomType: { keyFields: ['id'] },
          Booking: { keyFields: ['id'] },
        },
      }),
      link: new HttpLink({
        uri: API_URL,
      }),
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
