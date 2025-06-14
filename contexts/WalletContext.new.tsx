// "use client"

// import React, { createContext, useContext, useState, useEffect } from 'react'

// interface WalletContextType {
//   wallet: any | null
//   connecting: boolean
//   connected: boolean
//   publicKey: string | null
//   userSession: any | null
//   connectWallet: () => Promise<void>
//   disconnectWallet: () => Promise<void>
// }

// const WalletContext = createContext<WalletContextType>({
//   wallet: null,
//   connecting: false,
//   connected: false,
//   publicKey: null,
//   userSession: null,
//   connectWallet: async () => {},
//   disconnectWallet: async () => {}
// })

// export const useWallet = () => useContext(WalletContext)

// export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [wallet, setWallet] = useState<any | null>(null)
//   const [connecting, setConnecting] = useState(false)
//   const [connected, setConnected] = useState(false)
//   const [publicKey, setPublicKey] = useState<string | null>(null)
//   const [userSession, setUserSession] = useState<any | null>(null)

//   const connectWallet = async () => {
//     try {
//       setConnecting(true)
      
//       // First try MetaMask for EOA connection
//       if (typeof window.ethereum !== "undefined") {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts",
//         })
        
//         if (accounts && accounts.length > 0) {
//           setPublicKey(accounts[0])
//           setConnected(true)
//           setUserSession({ eoa: accounts[0] })
//           console.log("Connected with MetaMask:", accounts[0])
//         }
//       } else {
//         // Fallback to Futureverse Auth if MetaMask is not available
//         try {
//           const { FutureverseAuthClient } = await import('@futureverse/auth-react/auth')
          
//           const authClient = new FutureverseAuthClient({
//             clientId: process.env.NEXT_PUBLIC_FUTUREVERSE_CLIENT_ID || '2qC_LOMj3oHhri4XpJL2X',
//             environment: 'development',
//             redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/` : 'http://localhost:3000/dashboard/'
//           })
          
//           // Use the basic sign in without EOA requirements
//           const session = await authClient.getUser()
//           if (session) {
//             setUserSession(session)
//             setConnected(true)
//             setPublicKey(session.sub) // Use subject as identifier
//             console.log("Connected with Futureverse:", session)
//           }
//         } catch (authError) {
//           console.error("Futureverse auth failed:", authError)
//           throw new Error("Please install MetaMask or use a compatible wallet")
//         }
//       }
//     } catch (error) {
//       console.error("Error connecting wallet:", error)
//       // Set a demo connection for development purposes
//       setPublicKey("0xc6342AD85a4d5CF9EEf0fcC9299C793200EA821F")
//       setConnected(true)
//       setUserSession({ eoa: "0xc6342AD85a4d5CF9EEf0fcC9299C793200EA821F", demo: true })
//       console.log("Using demo wallet for development")
//     } finally {
//       setConnecting(false)
//     }
//   }

//   const disconnectWallet = async () => {
//     try {
//       setConnected(false)
//       setPublicKey(null)
//       setWallet(null)
//       setUserSession(null)
//       console.log("Wallet disconnected")
//     } catch (error) {
//       console.error("Error disconnecting wallet:", error)
//     }
//   }

//   // Check for existing connections on mount
//   useEffect(() => {
//     const checkConnection = async () => {
//       if (typeof window.ethereum !== "undefined") {
//         try {
//           const accounts = await window.ethereum.request({
//             method: "eth_accounts",
//           })
          
//           if (accounts && accounts.length > 0) {
//             setPublicKey(accounts[0])
//             setConnected(true)
//             setUserSession({ eoa: accounts[0] })
//           }
//         } catch (error) {
//           console.error("Error checking existing connection:", error)
//         }
//       }
//     }
    
//     checkConnection()
//   }, [])

//   return (
//     <WalletContext.Provider 
//       value={{
//         wallet,
//         connecting,
//         connected,
//         publicKey,
//         userSession,
//         connectWallet,
//         disconnectWallet
//       }}
//     >
//       {children}
//     </WalletContext.Provider>
//   )
// }
