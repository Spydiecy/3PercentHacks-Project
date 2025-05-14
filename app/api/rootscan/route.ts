// API route to proxy RootScan requests and avoid CORS issues
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body and extract endpoint
    const body = await request.json()
    const { endpoint } = body
    
    console.log(`Processing RootScan API request for endpoint: ${endpoint}`)
    
    // Generate appropriate dummy data based on endpoint
    const dummyData = generateDummyData(endpoint, body)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return NextResponse.json(dummyData)
  } catch (error: any) {
    console.error('RootScan API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to generate realistic dummy data that matches RootScan API structure
function generateDummyData(endpoint: string, requestParams: any) {
  // Default response structure used by RootScan
  const baseResponse = {
    success: true,
    timestamp: Math.floor(Date.now() / 1000),
    data: null
  }
  
  // Generate data based on endpoint
  switch(endpoint) {
    case 'address': {
      // Address details with balance information
      const address = requestParams.address || '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP'
      baseResponse.data = {
        address,
        balance: {
          free: '100000000000',
          freeFormatted: '100.00',
          reserved: '0',
          reservedFormatted: '0.00'
        },
        balances: [
          {
            token: {
              symbol: 'ROOT',
              name: 'Root Network Token',
              decimals: 12,
              priceData: {
                price: 1.45,
                percent_change_24h: 2.35,
                percent_change_7d: 5.78,
                volume_24h: 1500000
              }
            },
            balance: '100000000000',
            balanceFormatted: '100.00'
          },
          {
            token: {
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              priceData: {
                price: 2850.75,
                percent_change_24h: -1.25,
                percent_change_7d: 3.64,
                volume_24h: 25000000
              }
            },
            balance: '350000000000000000',
            balanceFormatted: '0.35'
          },
          {
            token: {
              symbol: 'USDT',
              name: 'Tether USD',
              decimals: 6,
              priceData: {
                price: 1.00,
                percent_change_24h: 0.01,
                percent_change_7d: 0.05,
                volume_24h: 45000000
              }
            },
            balance: '750000000',
            balanceFormatted: '750.00'
          }
        ]
      }
      break
    }
    
    case 'address-token-balances': {
      // Token balances for an address
      baseResponse.data = [
        {
          token: {
            symbol: 'ROOT',
            name: 'Root Network Token',
            decimals: 12,
            priceData: {
              price: 1.45,
              percent_change_24h: 2.35,
              percent_change_7d: 5.78,
              volume_24h: 1500000
            }
          },
          balance: '100000000000',
          balanceFormatted: '100.00'
        },
        {
          token: {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            priceData: {
              price: 2850.75,
              percent_change_24h: -1.25,
              percent_change_7d: 3.64,
              volume_24h: 25000000
            }
          },
          balance: '350000000000000000',
          balanceFormatted: '0.35'
        },
        {
          token: {
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            priceData: {
              price: 1.00,
              percent_change_24h: 0.01,
              percent_change_7d: 0.05,
              volume_24h: 45000000
            }
          },
          balance: '750000000',
          balanceFormatted: '750.00'
        },
        {
          token: {
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            priceData: {
              price: 1.00,
              percent_change_24h: -0.01,
              percent_change_7d: 0.02,
              volume_24h: 40000000
            }
          },
          balance: '500000000',
          balanceFormatted: '500.00'
        },
        {
          token: {
            symbol: 'BTC',
            name: 'Bitcoin',
            decimals: 8,
            priceData: {
              price: 57250.50,
              percent_change_24h: 2.75,
              percent_change_7d: 8.25,
              volume_24h: 35000000
            }
          },
          balance: '2500000',
          balanceFormatted: '0.025'
        }
      ]
      break
    }
    
    case 'address-nft-balances': {
      // NFT balances for an address
      baseResponse.data = [
        {
          nft: {
            name: 'RootPunks',
            symbol: 'RPUNK',
            tokenId: '42',
            imageUrl: 'https://example.com/nft/image1.png'
          },
          amount: '1'
        },
        {
          nft: {
            name: 'Root Art Collection',
            symbol: 'RAC',
            tokenId: '87',
            imageUrl: 'https://example.com/nft/image2.png'
          },
          amount: '1'
        }
      ]
      break
    }
    
    case 'native-transfers': {
      // Native token transfers
      const address = requestParams.address || '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP'
      baseResponse.data = Array(10).fill(0).map((_, i) => ({
        blockNumber: 20959992 - i * 100,
        timestamp: Math.floor(Date.now() / 1000) - i * 86400,
        hash: `0x${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`,
        section: 'balances',
        method: 'Transfer',
        args: {
          from: i % 2 === 0 ? address : `5F${i}LKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdX`,
          to: i % 2 === 0 ? `5F${i}LKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdX` : address,
          amount: (10000000000 + i * 1000000000).toString() // 10-20 ROOT in small units
        }
      }))
      break
    }
    
    case 'evm-transfers': {
      // EVM token transfers
      baseResponse.data = Array(8).fill(0).map((_, i) => ({
        blockNumber: 20959992 - i * 100,
        timestamp: Math.floor(Date.now() / 1000) - i * 86400,
        hash: `0x${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`,
        type: i % 2 === 0 ? 'ERC20' : 'ERC721',
        token: {
          symbol: i % 2 === 0 ? 'USDT' : 'NFT',
          name: i % 2 === 0 ? 'Tether USD' : 'Root NFT Collection',
          decimals: i % 2 === 0 ? 6 : 0
        },
        amount: i % 2 === 0 ? (100000000 + i * 10000000).toString() : '1'
      }))
      break
    }
    
    case 'evm-transactions': {
      // EVM transactions
      baseResponse.data = Array(10).fill(0).map((_, i) => ({
        hash: `0x${i}259c61a30584e005cb645aa51f61e9e7968b836997015e03864f3310310a6c78`,
        blockNumber: 20959992 - i * 100,
        timestamp: Math.floor(Date.now() / 1000) - i * 86400,
        from: '0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
        to: `0x${i}497668Fb12BA21E6A132de7168D0Ecc69cDF7d`,
        value: (100000000000 + i * 10000000000).toString(),
        gasUsed: 21000 + i * 1000,
        gasPrice: '20000000000',
        status: i % 5 === 0 ? 'failed' : 'success',
        functionName: i % 3 === 0 ? 'transfer' : i % 3 === 1 ? 'swap' : 'approve',
        transactionFee: (0.00021 + i * 0.00002).toString()
      }))
      break
    }
    
    case 'evm-transaction': {
      // EVM transaction detail
      const txHash = requestParams.hash || '0x259c61a30584e005cb645aa51f61e9e7968b836997015e03864f3310310a6c78'
      baseResponse.data = {
        hash: txHash,
        blockNumber: 20959992,
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        from: '0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
        to: '0x1234497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
        value: '100000000000',
        gasUsed: 21000,
        gasPrice: '20000000000',
        status: 'success',
        functionName: 'transfer',
        transactionFee: '0.00021',
        events: [
          {
            eventName: 'Transfer',
            name: 'Tether USD',
            symbol: 'USDT',
            formattedAmount: '100.00'
          }
        ],
        logs: [
          {
            address: '0x1234497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
            eventName: 'Transfer',
            logIndex: 0
          }
        ],
        fromAddress: {
          address: '0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
          balance: {
            freeFormatted: '120.45'
          }
        },
        toAddress: {
          address: '0x1234497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
          balance: {
            freeFormatted: '352.78'
          },
          isContract: false
        }
      }
      break
    }
    
    case 'extrinsics': {
      // Extrinsics
      baseResponse.data = Array(10).fill(0).map((_, i) => ({
        hash: `0x${i}47db11dd86cd6661c022940b046fabe0b3dd250d6ea2edf9618cc47588c16ac6`,
        blockNumber: 20959992 - i * 100,
        timestamp: Math.floor(Date.now() / 1000) - i * 86400,
        section: i % 2 === 0 ? 'balances' : 'system',
        method: i % 2 === 0 ? 'transfer' : 'remark',
        signer: '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP',
        success: i % 7 !== 0
      }))
      break
    }
    
    case 'extrinsic': {
      // Extrinsic detail
      const hash = requestParams.hash || '0x47db11dd86cd6661c022940b046fabe0b3dd250d6ea2edf9618cc47588c16ac6'
      baseResponse.data = {
        hash,
        blockNumber: 20959992,
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        section: 'balances',
        method: 'transfer',
        signer: '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP',
        success: true,
        fee: '0.0001',
        events: [
          {
            section: 'balances',
            method: 'Transfer',
            data: {
              from: '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP',
              to: '5F3LKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdX',
              amount: '10000000000'
            }
          }
        ],
        args: {
          dest: '5F3LKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdX',
          value: '10000000000'
        }
      }
      break
    }
    
    case 'blocks': {
      // Blocks list
      baseResponse.data = Array(10).fill(0).map((_, i) => ({
        number: 20959992 - i,
        hash: `0x${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`,
        timestamp: Math.floor(Date.now() / 1000) - i * 6, // 6 seconds per block
        transactionsCount: 10 + i * 2,
        eventsCount: 25 + i * 5,
        extrinsicsCount: 15 + i * 2,
        isFinalized: i > 2,
        evmBlock: {
          hash: `0x${i}fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321`,
          miner: '0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
          stateRoot: `0x${i}aaabbb1234567890abcdef1234567890abcdef1234567890abcdef1234567890`
        },
        spec: 'TRN (Root Network) v1.0.0'
      }))
      break
    }
    
    case 'block': {
      // Block detail
      const blockNumber = requestParams.blockNumber || 20959992
      baseResponse.data = {
        number: blockNumber,
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        transactionsCount: 15,
        eventsCount: 35,
        extrinsicsCount: 20,
        isFinalized: true,
        evmBlock: {
          hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
          miner: '0x22497668Fb12BA21E6A132de7168D0Ecc69cDF7d',
          stateRoot: '0xaaabbb1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        },
        spec: 'TRN (Root Network) v1.0.0',
        parentHash: '0xdddcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
      }
      break
    }
    
    case 'events': {
      // Events list for a block
      const blockNumber = requestParams.blockNumber || 20959992
      baseResponse.data = Array(10).fill(0).map((_, i) => ({
        eventId: `${blockNumber}-${i}`,
        blockNumber: blockNumber,
        method: i % 3 === 0 ? 'Transfer' : i % 3 === 1 ? 'Reserved' : 'Withdraw',
        section: i % 2 === 0 ? 'balances' : 'treasury',
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        args: {
          from: '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP',
          to: '5F3LKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdX',
          amount: (10000000000 + i * 1000000000).toString()
        },
        doc: `Event documentation for ${i % 3 === 0 ? 'Transfer' : i % 3 === 1 ? 'Reserved' : 'Withdraw'}`,
        hash: `0x${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`,
        extrinsicId: `${blockNumber}-${Math.floor(i/2)}`
      }))
      break
    }
    
    case 'event': {
      // Event detail
      const eventId = requestParams.eventId || '20959992-3'
      const [blockNumber, eventIndex] = eventId.split('-').map(Number)
      baseResponse.data = {
        eventId,
        blockNumber,
        method: 'Transfer',
        section: 'balances',
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        args: {
          from: '5GxLKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdP',
          to: '5F3LKnPFaFCGFsJT9VzCTPTMH8Qm8kfnLBCdGXUf2WW7UZdX',
          amount: '10000000000'
        },
        doc: 'Transfer event that happens when funds are transferred.',
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        extrinsicId: `${blockNumber}-${Math.floor(eventIndex/2)}`,
        extrinsic: {
          hash: '0x47db11dd86cd6661c022940b046fabe0b3dd250d6ea2edf9618cc47588c16ac6',
          section: 'balances',
          method: 'transfer'
        },
        block: {
          number: blockNumber,
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        }
      }
      break
    }
    
    default:
      // Default response if endpoint doesn't match
      baseResponse.data = {
        message: `Mock data not implemented for endpoint: ${endpoint}`,
        requestParams
      }
  }
  
  return baseResponse
}
