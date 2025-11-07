'use client';

import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Brand } from '@/components/ui/Brand';

export default function LandingPage() {
  const router = useRouter();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
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
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[50rem] h-[50rem] bg-gray-500/5 dark:bg-gray-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-[50rem] h-[50rem] bg-gray-600/5 dark:bg-gray-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
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
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-[1.1]">
              <span className="bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Measure. Improve.
              </span>
              <br />
              <span className="bg-gradient-to-b from-gray-600 to-gray-900 dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                Empower Developers.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-4 max-w-3xl mx-auto font-medium"
          >
            Track commits, issues, deployments & productivity — effortlessly.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base sm:text-lg text-gray-500 dark:text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            The all-in-one developer productivity dashboard that brings clarity to your team's performance with real-time insights and actionable metrics.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              className="group relative overflow-hidden shadow-lg hover:shadow-2xl w-full sm:w-auto transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
              className="w-full sm:w-auto border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
            >
              <span className="font-semibold">Learn More</span>
            </Button>
          </motion.div>

          {/* Stats preview */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
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
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black border-y border-gray-200 dark:border-gray-900">
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
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
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
            >
              <div className="inline-block mb-6">
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-full">
                  Why DevPulseX
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                Built for modern development teams
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                DevPulseX adapts to your workflow, whether you're a solo developer or managing multiple teams across different projects.
              </p>
              <div className="space-y-5">
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
                    className="flex items-center gap-4 text-gray-700 dark:text-gray-300 group"
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
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative aspect-video rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-2xl">
                <div className="text-center p-8">
                  <BarChart3 className="w-20 h-20 mx-auto mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold tracking-wide">
                    Dashboard Preview
                  </p>
                </div>
                {/* Decorative grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-900">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-3xl blur-3xl opacity-20" />
            <div className="relative">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
                Ready to transform<br />your workflow?
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of developers already using DevPulseX to ship better code, faster.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-8 py-4"
              >
                <span className="relative z-10 flex items-center gap-3 text-lg font-semibold">
                  Start Free Today
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-900 py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Brand size="md" accent="none" href="/" interactive={false} />
              <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                © {new Date().getFullYear()} DevPulseX. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex gap-6 text-sm font-medium">
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Documentation
                </a>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-110 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-900">
            <p className="text-center text-xs text-gray-500 dark:text-gray-600 leading-relaxed">
              Built with precision for developer teams worldwide. Empowering productivity through intelligent analytics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
