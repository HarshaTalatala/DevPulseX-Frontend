'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  GitBranch,
  Users,
  Zap,
  Github,
  Activity,
  TrendingUp,
  Shield,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Brand } from '@/components/ui/Brand';

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-x-clip">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <Brand size="md" accent="none" href="/" />
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetStarted}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
  <section className="relative min-h-screen sm:min-h-0 flex items-center pt-32 sm:pt-36 md:pt-40 pb-24 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[36rem] h-[36rem] sm:w-[48rem] sm:h-[48rem] lg:w-[60rem] lg:h-[60rem] bg-gray-500/5 dark:bg-gray-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-[36rem] h-[36rem] sm:w-[48rem] sm:h-[48rem] lg:w-[60rem] lg:h-[60rem] bg-gray-600/5 dark:bg-gray-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-6xl mx-auto text-center w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-block mb-4">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full">
                Developer Analytics Platform
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight break-words">
              {/* Desktop: side-by-side layout */}
              <span className="hidden sm:inline">
                <span className="bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Measure. Improve.
                </span>
                <br />
                <span className="bg-gradient-to-b from-gray-600 to-gray-900 dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                  Empower Developers.
                </span>
              </span>
              
              {/* Mobile: zigzag alternating layout */}
              <span className="sm:hidden flex flex-col items-start gap-0.5 text-left max-w-xs mx-auto text-6xl">
                <span className="self-start bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Measure
                </span>
                <span className="self-start pl-12 bg-gradient-to-b from-gray-600 to-gray-900 dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                  Improve.
                </span>
                <span className="self-start bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Empower
                </span>
                <span className="self-start pl-12 bg-gradient-to-b from-gray-600 to-gray-900 dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                  Developers.
                </span>
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 max-w-2xl sm:max-w-3xl mx-auto font-medium px-4"
          >
            Track commits, issues, deployments & productivity — effortlessly.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-500 mb-8 sm:mb-10 md:mb-12 max-w-lg sm:max-w-2xl mx-auto leading-relaxed px-4"
          >
            The all-in-one developer productivity dashboard that brings clarity to your team's performance with real-time insights and actionable metrics.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl mx-auto"
          >
            <Button
              variant="primary"
              size="md"
              onClick={handleGetStarted}
              className="group relative overflow-hidden min-w-[180px] sm:min-w-[156px] text-base py-3 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={scrollToFeatures}
              className="group relative overflow-hidden min-w-[140px] sm:min-w-[156px] border-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <span className="flex items-center gap-2 font-semibold">
                Learn More
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats preview section - separate for mobile scroll */}
      <section className="py-12 sm:py-0 px-4 sm:px-6 lg:px-8 sm:-mt-16 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Stats preview */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto"
          >
            {[
              { label: 'Active Teams', value: '500+' },
              { label: 'Commits Tracked', value: '1M+' },
              { label: 'Deployments', value: '50K+' },
              { label: 'Time Saved', value: '10K hrs' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group p-8 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-4">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full">
                Features
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to give your team complete visibility into development workflows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description:
                  'Deep insights into code quality, velocity, and team performance with beautiful visualizations.',
              },
              {
                icon: GitBranch,
                title: 'GitHub Insights',
                description:
                  'Seamless integration with GitHub to track commits, pull requests, and repository activity.',
              },
              {
                icon: Users,
                title: 'Team Metrics',
                description:
                  'Monitor individual and team contributions, identify bottlenecks, and optimize workflows.',
              },
              {
                icon: Zap,
                title: 'Smart Automation',
                description:
                  'Automate routine tasks, set up alerts, and get notified about critical events instantly.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group relative p-8 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div className="absolute inset-0 rounded-2xl bg-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="inline-block mb-6">
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full">
                  Why DevPulseX
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
                Built for modern development teams
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                DevPulseX adapts to your workflow, whether you're a solo developer or managing multiple teams across different projects.
              </p>
              <div className="space-y-5 max-w-xl mx-auto lg:mx-0">
                {[
                  { icon: Activity, text: 'Real-time activity monitoring' },
                  { icon: TrendingUp, text: 'Predictive analytics and trends' },
                  { icon: Shield, text: 'Enterprise-grade security' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 text-gray-700 dark:text-gray-300 group justify-center lg:justify-start"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Subtle outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-gray-300/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-600/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative rounded-3xl bg-transparent border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 backdrop-blur-xl">
                {/* Sophisticated gradient background with transparency */}
                  <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl" />
                
                {/* Refined radial gradient accents */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-radial from-gray-200/10 via-gray-100/5 to-transparent dark:from-gray-800/10 dark:via-gray-900/5 blur-3xl opacity-40" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-radial from-gray-300/8 via-gray-200/4 to-transparent dark:from-gray-700/8 dark:via-gray-800/4 blur-3xl opacity-40" />
                
                {/* Content */}
                <div className="relative p-5 sm:p-6 space-y-4 sm:space-y-5">
                  {/* Header with enhanced typography */}
                  <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800/60 pb-3">
                    <div>
                      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                        Live Analytics Dashboard
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 font-medium">
                        Real-time performance metrics
                      </p>
                    </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500/40 animate-ping" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Live</span>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid with better hierarchy */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {[
                      { label: 'Total Commits', value: '847', sublabel: 'this week', trend: '+12%' },
                      { label: 'Open Issues', value: '23', sublabel: 'active', trend: '-8%' },
                      { label: 'Pull Requests', value: '142', sublabel: 'merged', trend: '+24%' },
                      { label: 'Deployments', value: '98', sublabel: 'successful', trend: '+5%' },
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        viewport={{ once: true }}
                        whileHover={{ y: -2, scale: 1.02 }}
                          className="relative group/stat p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-200/60 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        {/* Hover gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200/0 via-gray-100/0 to-gray-200/0 dark:from-gray-800/0 dark:via-gray-700/0 dark:to-gray-800/0 group-hover/stat:from-gray-200/10 group-hover/stat:via-gray-100/5 group-hover/stat:to-gray-200/10 dark:group-hover/stat:from-gray-800/10 dark:group-hover/stat:via-gray-700/5 dark:group-hover/stat:to-gray-800/10 transition-all duration-500" />
                        
                        <div className="relative">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 uppercase tracking-widest font-bold">
                              {stat.label}
                            </div>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                              {stat.trend}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
                              {stat.value}
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-600 font-medium mt-0.5">
                            {stat.sublabel}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Premium Activity Chart */}
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                      className="relative rounded-xl bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-200/60 dark:border-gray-800/60 p-3 sm:p-4 overflow-hidden group/chart"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                          Activity Overview
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-600 font-medium mt-0.5">
                          Last 7 days
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] sm:text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-200" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Commits</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative h-24 sm:h-28">
                      <div className="absolute inset-0 flex items-end justify-between gap-1.5 sm:gap-2.5 pb-5">
                        {[
                          { height: 45, label: 'Mon', value: 54 },
                          { height: 70, label: 'Tue', value: 84 },
                          { height: 52, label: 'Wed', value: 62 },
                          { height: 85, label: 'Thu', value: 102 },
                          { height: 60, label: 'Fri', value: 72 },
                          { height: 95, label: 'Sat', value: 114 },
                          { height: 75, label: 'Sun', value: 90 },
                          { height: 88, label: 'Today', value: 106 },
                        ].map((bar, idx) => (
                          <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              whileInView={{ height: `${bar.height}%`, opacity: 1 }}
                              transition={{ duration: 0.4, delay: 0.5 + idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                              viewport={{ once: true }}
                              whileHover={{ scale: 1.05 }}
                              className="relative w-full rounded-t-md bg-gradient-to-t from-gray-700 via-gray-800 to-gray-900 dark:from-gray-300 dark:via-gray-200 dark:to-gray-100 hover:from-gray-800 hover:via-gray-900 hover:to-black dark:hover:from-gray-400 dark:hover:via-gray-300 dark:hover:to-gray-200 transition-all duration-300 cursor-pointer group/bar shadow-sm"
                              style={{ minHeight: '6px' }}
                            >
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/0 to-white/20 dark:from-transparent dark:via-black/0 dark:to-black/30 rounded-t-md opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
                              
                              {/* Value tooltip on hover */}
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                                {bar.value}
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Day labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between gap-1.5 sm:gap-2.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'].map((label, idx) => (
                          <div key={idx} className="flex-1 text-center text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-600 font-semibold uppercase tracking-wider">
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-900">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <div className="relative">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100/20 via-gray-50/10 to-gray-100/20 dark:from-gray-900/20 dark:via-gray-950/10 dark:to-gray-900/20 rounded-3xl blur-3xl opacity-50" />
            
            <div className="relative">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-block mb-6"
              >
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                  Start Your Journey
                </span>
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
              >
                Ready to transform<br />your workflow?
              </motion.h2>
              
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                Join thousands of developers already using DevPulseX to ship better code, faster.
              </motion.p>

              {/* Trust indicators */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-gray-500 dark:text-gray-600"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span className="font-medium">Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span className="font-medium">Setup in minutes</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleGetStarted}
                  className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    Start Free Today
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Platform */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                  Platform
                </h3>
                <ul className="space-y-3">
                  {['Dashboard', 'Analytics', 'Teams', 'Integrations'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                  Features
                </h3>
                <ul className="space-y-3">
                  {['Commit Tracking', 'Issue Management', 'Deployments', 'Reports'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {['Documentation', 'API Reference', 'GitHub', 'Support'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                  Company
                </h3>
                <ul className="space-y-3">
                  {['About', 'Privacy', 'Terms', 'Contact'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 border-t border-gray-200 dark:border-gray-900">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Brand size="sm" accent="none" href="/" interactive={false} />
                <span className="text-xs text-gray-500 dark:text-gray-600">
                  © {new Date().getFullYear()} DevPulseX, Inc.
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
