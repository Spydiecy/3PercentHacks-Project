"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop&h=4095"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">Introducing Support for Solana</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                        
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        Your AI-powered copilot for DeFi trading
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        Astra harnesses the power of artificial intelligence and Solana's high-performance blockchain to transform your DeFi experience.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <Link href="#link">
                                                <span className="text-nowrap">Get Started</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href="#link">
                                            <span className="text-nowrap">Watch Video</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <img
                                        className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                                        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                                        alt="app screen"
                                        width="2700"
                                        height="1440"
                                    />
                                    <img
                                        className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                                        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                                        alt="app screen"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="features" className="bg-background pb-16 pt-32">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Core Features</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Powerful capabilities that elevate your DeFi trading experience
                            </p>
                        </div>
                        
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="group rounded-xl border p-6 hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                        <path d="M12 20v-6M6 20V10M18 20V4"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">AI-Powered Trading Intelligence</h3>
                                <p className="text-muted-foreground">Advanced algorithms provide data-driven suggestions for optimal trade entry and exit points.</p>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="group rounded-xl border p-6 hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                        <path d="m8 6 4-4 4 4"/>
                                        <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/>
                                        <path d="m20 22-5-5"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">Seamless Multi-DEX Execution</h3>
                                <p className="text-muted-foreground">Execute token swaps across multiple decentralized exchanges with minimal friction.</p>
                            </div>
                            
                            {/* Feature 3 */}
                            <div className="group rounded-xl border p-6 hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                        <path d="M4 22h16"/>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">Comprehensive Portfolio Analysis</h3>
                                <p className="text-muted-foreground">Gain powerful insights about your holdings, performance metrics, and risk exposure.</p>
                            </div>
                            
                            {/* Feature 4 */}
                            <div className="group rounded-xl border p-6 hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                        <path d="M2 22h20"/>
                                        <path d="M10 7H5a2 2 0 0 0-2 2v11h7V7Z"/>
                                        <path d="M10 18h7V5a2 2 0 0 0-2-2h-3v15Z"/>
                                        <path d="M17 18h2a2 2 0 0 0 2-2V9h-4v9Z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">Intelligent Gas Optimization</h3>
                                <p className="text-muted-foreground">Sophisticated timing mechanisms determine optimal transaction execution to minimize fees.</p>
                            </div>
                            
                            {/* Feature 5 */}
                            <div className="group rounded-xl border p-6 hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">Real-time Market Sentiment Analysis</h3>
                                <p className="text-muted-foreground">Leverage cutting-edge NLP to analyze market trends and sentiment indicators.</p>
                            </div>
                            
                            {/* Feature 6 */}
                            <div className="group rounded-xl border p-6 hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                                        <line x1="8" y1="21" x2="16" y2="21"/>
                                        <line x1="12" y1="17" x2="12" y2="21"/>
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">Intuitive Interface</h3>
                                <p className="text-muted-foreground">Clean, professional dashboard suitable for both novice and sophisticated traders.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* About Section */}
                <section id="about" className="bg-background/50 pb-32 pt-32">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <h2 className="mb-4 text-4xl font-bold md:text-5xl">Technical Architecture</h2>
                                <p className="mb-6 text-muted-foreground">
                                    Astra employs a robust technical foundation designed for performance, security, and exceptional user experience.
                                </p>
                                
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-2">
                                        <div className="flex-shrink-0 text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                        </div>
                                        <span><strong>Frontend:</strong> React.js with Tailwind CSS for responsive design</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="flex-shrink-0 text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                        </div>
                                        <span><strong>AI Engine:</strong> Custom-trained TensorFlow models with specialized trading algorithms</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="flex-shrink-0 text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                        </div>
                                        <span><strong>Blockchain Layer:</strong> Solana Web3.js for high-throughput transaction processing</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="flex-shrink-0 text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                        </div>
                                        <span><strong>Integration Layer:</strong> OKX DEX API for liquidity access and trade execution</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="flex-shrink-0 text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                        </div>
                                        <span><strong>Data Services:</strong> Pyth Network for reliable, low-latency price oracle data</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="rounded-xl border p-4">
                                <img 
                                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
                                    alt="Blockchain Technology" 
                                    className="rounded-lg object-cover h-96 w-full" 
                                />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Pricing Section */}
                <section id="pricing" className="bg-background pb-32 pt-32">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Simple, Transparent Pricing</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Choose the plan that best suits your trading needs
                            </p>
                        </div>
                        
                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Basic Plan */}
                            <div className="flex flex-col rounded-xl border bg-card p-8">
                                <div className="mb-6">
                                    <h3 className="mb-2 text-xl font-medium">Basic</h3>
                                    <div className="mb-2 flex items-baseline">
                                        <span className="text-4xl font-bold">Free</span>
                                    </div>
                                    <p className="text-muted-foreground">Perfect for beginners exploring DeFi</p>
                                </div>
                                
                                <ul className="mb-8 space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Basic portfolio analytics</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Single DEX trading</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Market data dashboard</span>
                                    </li>
                                </ul>
                                
                                <div className="mt-auto">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="#">Get Started</Link>
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Pro Plan */}
                            <div className="flex flex-col rounded-xl border border-primary bg-card p-8 relative">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                                    Popular
                                </div>
                                
                                <div className="mb-6">
                                    <h3 className="mb-2 text-xl font-medium">Pro</h3>
                                    <div className="mb-2 flex items-baseline">
                                        <span className="text-4xl font-bold">$39</span>
                                        <span className="text-muted-foreground">/month</span>
                                    </div>
                                    <p className="text-muted-foreground">For active traders seeking an edge</p>
                                </div>
                                
                                <ul className="mb-8 space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Everything in Basic</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>AI-powered trading insights</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Multi-DEX trading</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Gas optimization</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Advanced portfolio analytics</span>
                                    </li>
                                </ul>
                                
                                <div className="mt-auto">
                                    <Button asChild className="w-full">
                                        <Link href="#">Get Started</Link>
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enterprise Plan */}
                            <div className="flex flex-col rounded-xl border bg-card p-8">
                                <div className="mb-6">
                                    <h3 className="mb-2 text-xl font-medium">Enterprise</h3>
                                    <div className="mb-2 flex items-baseline">
                                        <span className="text-4xl font-bold">$99</span>
                                        <span className="text-muted-foreground">/month</span>
                                    </div>
                                    <p className="text-muted-foreground">For professional traders and institutions</p>
                                </div>
                                
                                <ul className="mb-8 space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Everything in Pro</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Algorithmic trading strategies</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Flash loan implementation</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Custom API integrations</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Dedicated account manager</span>
                                    </li>
                                </ul>
                                
                                <div className="mt-auto">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="#">Contact Sales</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span> Meet Our Customers</span>

                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                    alt="Nvidia Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/column.svg"
                                    alt="Column Logo"
                                    height="16"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/github.svg"
                                    alt="GitHub Logo"
                                    height="16"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nike.svg"
                                    alt="Nike Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                                    alt="Lemon Squeezy Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                                    alt="Laravel Logo"
                                    height="16"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                                    alt="Lilly Logo"
                                    height="28"
                                    width="auto"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/openai.svg"
                                    alt="OpenAI Logo"
                                    height="24"
                                    width="auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    size="sm">
                                    <Link href="#">
                                        <span>Launch Dashboard</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 78 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('h-5 w-auto', className)}>
            <path
                d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
                fill="url(#logo-gradient)"
            />
            <path
                d="M27.06 7.054V12.239C27.06 12.5903 27.1393 12.8453 27.298 13.004C27.468 13.1513 27.7513 13.225 28.148 13.225H29.338V14.84H27.808C26.9353 14.84 26.2667 14.636 25.802 14.228C25.3373 13.82 25.105 13.157 25.105 12.239V7.054H24V5.473H25.105V3.144H27.06V5.473H29.338V7.054H27.06ZM30.4782 10.114C30.4782 9.17333 30.7322 8.34033 31.2402 7.615C31.7482 6.88967 32.3942 6.32867 33.1782 5.932C33.9622 5.524 34.8142 5.32 35.7342 5.32C36.9262 5.32 37.9252 5.626 38.7312 6.238C39.5482 6.85 40.0562 7.70133 40.2552 8.793H38.1452C38.0252 8.26167 37.7642 7.836 37.3622 7.513C36.9602 7.17867 36.4182 7.003 35.7362 7.003C34.8162 7.003 34.0662 7.32133 33.4862 7.957C32.9062 8.58133 32.6162 9.43 32.6162 10.503C32.6162 11.5647 32.9062 12.4077 33.4862 13.032C34.0662 13.6563 34.8162 13.969 35.7362 13.969C36.4182 13.969 36.9602 13.7933 37.3622 13.459C37.7756 13.1247 38.0366 12.6753 38.1452 12.121H40.2552C40.0562 13.1357 39.5482 13.9527 38.7312 14.568C37.9142 15.1833 36.9152 15.491 35.7342 15.491C34.8142 15.491 33.9622 15.287 33.1782 14.879C32.3942 14.471 31.7482 13.8987 31.2402 13.165C30.7322 12.4313 30.4782 11.5533 30.4782 10.5795V10.114ZM41.9071 10.114C41.9071 9.17333 42.0998 8.34033 42.4851 7.615C42.8818 6.88967 43.4144 6.32867 44.0831 5.932C44.7631 5.524 45.5111 5.32 46.3271 5.32C47.0638 5.32 47.7041 5.46733 48.2481 5.762C48.8034 6.04533 49.2454 6.40233 49.5741 6.833V5.473H51.5291V14.84H49.5741V13.446C49.2454 13.888 48.7978 14.2563 48.2311 14.551C47.6644 14.8457 47.0184 14.993 46.2931 14.993C45.4884 14.993 44.7518 14.789 44.0831 14.381C43.4144 13.9617 42.8818 13.3837 42.4851 12.647C42.0998 11.899 41.9071 11.0547 41.9071 10.114ZM49.5741 10.148C49.5741 9.502 49.4381 8.941 49.1661 8.465C48.9054 7.989 48.5598 7.62633 48.1291 7.377C47.6984 7.12767 47.2338 7.003 46.7351 7.003C46.2364 7.003 45.7718 7.12767 45.3411 7.377C44.9104 7.615 44.5591 7.972 44.2871 8.448C44.0264 8.91267 43.8961 9.468 43.8961 10.114C43.8961 10.76 44.0264 11.3267 44.2871 11.814C44.5591 12.3013 44.9104 12.6753 45.3411 12.936C45.7831 13.1853 46.2478 13.31 46.7351 13.31C47.2338 13.31 47.6984 13.1853 48.1291 12.936C48.5598 12.6867 48.9054 12.324 49.1661 11.848C49.4381 11.3607 49.5741 10.794 49.5741 10.148ZM59.1156 5.728C59.7046 6.088 60.1066 6.57433 60.3216 7.174H60.3556V5.473H62.3106V14.84H60.3556V9.57C60.3556 8.82467 60.1973 8.25233 59.8806 7.853C59.5639 7.45367 59.0936 7.254 58.4696 7.254C57.8456 7.254 57.3696 7.45367 57.0416 7.853C56.7249 8.25233 56.5666 8.82467 56.5666 9.57V14.84H54.6116V5.473H56.5666V6.68C56.7703 6.26667 57.0699 5.94233 57.4666 5.711C57.8746 5.47967 58.3676 5.354 58.9576 5.32C59.0323 5.32 59.0746 5.32 59.0846 5.32C59.0946 5.32 59.1056 5.32 59.1156 5.32V5.728ZM68.3864 15.491C67.5704 15.491 66.8338 15.287 66.1764 14.879C65.5191 14.4597 65.0034 13.871 64.6294 13.114C64.2554 12.3457 64.0684 11.4673 64.0684 10.478C64.0684 9.48867 64.2554 8.61033 64.6294 7.836C65.0034 7.062 65.5191 6.46767 66.1764 6.053C66.8451 5.626 67.5931 5.422 68.4204 5.422C68.9984 5.422 69.5311 5.51233 70.0184 5.694C70.5171 5.86433 70.9534 6.12633 71.3274 6.476C71.7128 6.82567 72.0181 7.25033 72.2434 7.751C72.4801 8.25167 72.5984 8.82967 72.5984 9.485V10.165H65.4294V10.267C65.4634 10.777 65.5988 11.236 65.8368 11.644C66.0748 12.0407 66.3858 12.3523 66.7714 12.579C67.1684 12.8057 67.6048 12.919 68.0804 12.919C68.6024 12.919 69.0784 12.802 69.5084 12.563C69.9504 12.3127 70.2614 11.9557 70.4424 11.491H72.3974C72.1708 12.443 71.6608 13.2033 70.8774 13.769C70.1068 14.3233 69.1531 14.6123 68.0124 14.652C67.9944 14.6633 67.9374 14.6747 67.8404 14.686C67.7548 14.686 67.6331 14.686 67.4748 14.686C67.3278 14.6973 67.1911 14.7143 67.0668 14.737C66.9538 14.7597 66.8621 14.7823 66.7884 14.805L65.3431 15.491H68.3864Z"
                fill="currentColor"
            />
            <defs>
                <linearGradient
                    id="logo-gradient"
                    x1="10"
                    y1="0"
                    x2="10"
                    y2="20"
                    gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9B99FE" />
                    <stop
                        offset="1"
                        stopColor="#2BC8B7"
                    />
                </linearGradient>
            </defs>
        </svg>
    )
}