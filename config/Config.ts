import React, { PropsWithChildren } from 'react';
import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { FutureverseAuthProvider, FutureverseWagmiProvider } from '@futureverse/auth-react';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { root } from 'wagmi/chains';

const clientId = '<your-futureverse-client-id>';
const walletConnectProjectId = '<your-wallet-connect-project-id>';
const xamanAPIKey = '<your-xaman-application->';

export const authClient = new FutureverseAuthClient({
  clientId,
  environment: 'development',
  redirectUri: 'http://localhost:3000/dashboard',
});
const queryClient = new QueryClient();

export const getWagmiConfig = async () => {
  return createWagmiConfig({
    walletConnectProjectId,
    xamanAPIKey,
    authClient,
    // Optional if supporting SSR
    ssr: true,
    // Optional chains you wish to support
    chains: [root],
    // Optional if supporting SSR
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
};