# 🌟 Astra TRN - Advanced Blockchain Portfolio Analytics

<div align="center">
  <img src="/hero.png" alt="Astra TRN Hero" width="600" height="300" />
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC)](https://tailwindcss.com/)
  [![Futureverse](https://img.shields.io/badge/Futureverse-Auth-purple)](https://www.futureverse.com/)
  
  **A next-generation blockchain portfolio analytics platform for The Root Network (TRN)**
  
  [🚀 Live Demo](https://astra-trn.vercel.app) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)
</div>

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔧 How It Works](#-how-it-works)
- [👥 Target Audience](#-target-audience)
- [🚀 Getting Started](#-getting-started)
- [📱 Live Demo](#-live-demo)
- [🤝 Contributing](#-contributing)
- [📞 Connect With Us](#-connect-with-us)

## 🎯 Project Overview

**Astra TRN** is a comprehensive blockchain portfolio analytics platform designed specifically for **The Root Network (TRN)**. It provides users with real-time insights into their blockchain assets, transaction history, and portfolio performance through an intuitive, modern interface.

Our platform bridges the gap between complex blockchain data and user-friendly analytics, making it easier for both beginners and experts to track, analyze, and manage their digital assets on The Root Network.

### 🎪 What Makes Astra TRN Special?

- **🔄 Dynamic Address System**: Seamlessly switches between connected wallet data and demo mode
- **🤖 AI-Powered Analytics**: Built-in AI chat assistant for blockchain queries and insights
- **📊 Real-Time Data**: Live portfolio tracking with RootScan API integration
- **🎨 Modern UI/UX**: Beautiful, responsive design with neon-themed aesthetics
- **🔐 Secure Wallet Integration**: Futureverse authentication for seamless wallet connections

## ✨ Features

### 📈 Portfolio Analytics
- **Real-time portfolio value tracking** with interactive charts
- **Token balance overview** with price change indicators
- **Transaction history** with detailed analysis
- **NFT holdings** visualization and management
- **Free balance monitoring** for ROOT tokens

### 🔍 Blockchain Explorer
- **EVM transaction explorer** with advanced filtering
- **Block details** and event tracking  
- **Extrinsic analysis** with success/failure indicators
- **Gas usage analytics** and optimization insights
- **Smart contract interaction** history

### 🤖 AI Assistant
- **Intelligent blockchain queries** powered by Google Gemini
- **Portfolio analysis** and recommendations
- **Market insights** and trend analysis
- **Natural language** blockchain data interpretation
- **Contextual help** and guidance

### 🔄 Cross-Chain Features
- **Multi-chain support** (future roadmap)
- **Asset bridging** capabilities
- **Cross-chain transaction** tracking
- **Unified portfolio** view across networks

### 🎨 User Experience
- **Responsive design** for all devices
- **Dark theme** with neon accents
- **Real-time updates** and notifications
- **Export functionality** for data portability
- **Customizable dashboard** layouts

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.3.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.0.0](https://reactjs.org/)** - UI library with latest features
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4.x](https://tailwindcss.com/)** - Utility-first styling

### Blockchain Integration
- **[Futureverse Auth](https://www.futureverse.com/)** - Wallet authentication
- **[Viem 2.30.6](https://viem.sh/)** - Ethereum client library
- **[WAGMI 2.15.4](https://wagmi.sh/)** - React hooks for Ethereum
- **[RootScan API](https://api.rootscan.io/)** - The Root Network data

### AI & Analytics
- **[Google Gemini](https://ai.google.dev/)** - AI-powered insights
- **[Recharts 2.15.3](https://recharts.org/)** - Data visualization
- **[Tanstack Query 5.80.1](https://tanstack.com/query)** - Data fetching

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[Class Variance Authority](https://cva.style/)** - Component variants

## 🔧 How It Works

### 1. **Smart Address Management**
```typescript
// Dynamic address system that adapts to wallet connection status
const getDisplayAddress = (): string => {
  // Connected wallet takes priority
  if (connected && publicKey) return publicKey
  // Futureverse session fallback
  if (userSession?.eoa) return userSession.eoa
  // Demo mode with dummy address
  return DUMMY_ADDRESS
}
```

### 2. **Real-Time Data Fetching**
- Integrates with **RootScan API** for live blockchain data
- **Rate limiting** and **error handling** for reliable performance
- **Caching strategies** to optimize API calls
- **Progressive loading** with user feedback

### 3. **AI-Powered Analytics**
- **Natural language processing** for blockchain queries
- **Contextual responses** based on user's portfolio
- **Smart recommendations** for portfolio optimization
- **Market analysis** and trend predictions

### 4. **Responsive Dashboard**
- **Modular components** for flexible layouts
- **Real-time updates** without page refreshes
- **Interactive charts** and visualizations
- **Export capabilities** for data portability

## 👥 Target Audience

### 🎯 Primary Users
- **Crypto Enthusiasts** exploring The Root Network ecosystem
- **DeFi Investors** managing multi-token portfolios
- **Blockchain Developers** building on TRN
- **Financial Analysts** researching blockchain assets

### 💼 Use Cases
- **Portfolio Management**: Track and analyze digital asset performance
- **Transaction Analysis**: Deep dive into blockchain transaction history
- **Market Research**: Understand token trends and market movements
- **Developer Tools**: API exploration and blockchain data analysis
- **Educational**: Learn about blockchain technology through interactive exploration

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** or **Bun runtime**
- **Git** for version control
- **The Root Network** wallet (optional for demo mode)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/astra-trn.git
cd astra-trn
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your API keys:
```env
NEXT_PUBLIC_API_KEY=your_rootscan_api_key
NEXT_PUBLIC_FUTUREVERSE_CLIENT_ID=your_futureverse_client_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### 🔧 Build for Production
```bash
npm run build
npm run start
```

## 📱 Live Demo

🌐 **[Try Astra TRN Live](https://astra-trn.vercel.app)**

### Demo Features
- ✅ **No wallet required** - Experience the platform with demo data
- ✅ **Full functionality** - All features available in demo mode  
- ✅ **Real API integration** - Live data from The Root Network
- ✅ **Interactive AI chat** - Ask questions about blockchain data
- ✅ **Portfolio analytics** - Explore comprehensive dashboard features

### Demo Credentials
- **Demo Address**: `0x718E2030e82B945b9E39546278a7a30221fC2650`
- **Network**: The Root Network (TRN)
- **Features**: All platform features accessible without wallet connection

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Provide browser and system information

### 💡 Feature Requests
- Discuss new features in GitHub Discussions
- Follow our feature request template
- Consider contributing the implementation

### 🔧 Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📜 Code Style
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📞 Connect With Us

<div align="center">

### 🌐 Social Media & Links

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/astra_trn)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/astra-trn)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/astra_trn)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/astra-trn)

### 💼 Professional

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/astra-trn)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@astra-trn)

### 📧 Contact

**Email**: [hello@astra-trn.com](mailto:hello@astra-trn.com)  
**Website**: [https://astra-trn.vercel.app](https://astra-trn.vercel.app)

</div>

---

<div align="center">

### 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/astra-trn&type=Date)](https://star-history.com/#yourusername/astra-trn&Date)

**Made with ❤️ for The Root Network community**

*Astra TRN - Illuminating the blockchain universe, one transaction at a time.*

</div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with Next.js, TypeScript, and The Root Network • Deployed on Vercel</sub>
</div>
