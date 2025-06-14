import React, { PropsWithChildren } from 'react';
import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { FutureverseAuthProvider, FutureverseWagmiProvider } from '@futureverse/auth-react';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { root } from 'wagmi/chains';

const clientId = process.env.NEXT_PUBLIC_FUTUREVERSE_CLIENT_ID || '2qC_LOMj3oHhri4XpJL2X';
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-wallet-connect-project-id';
const xamanAPIKey = process.env.NEXT_PUBLIC_XAMAN_API_KEY || 'your-xaman-application-key';

export const authClient = new FutureverseAuthClient({
  clientId,
  environment: 'development',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/` : 'http://astra-trn.vercel.app/dashboard/',
  responseType: 'code'
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

// Provider component that combines all necessary providers
export const FutureverseProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      FutureverseAuthProvider,
      { authClient },
      React.createElement(
        FutureverseWagmiProvider,
        { getWagmiConfig },
        children
      )
    )
  );
};