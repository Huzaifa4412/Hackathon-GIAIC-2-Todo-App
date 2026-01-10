/**
 * Premium Landing Page
 *
 * Modern dark brutalist design with typewriter effect, bento grids, and smooth animations.
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Users,
  Star,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Target,
  LayoutGrid,
  Smartphone,
  Globe,
  Activity,
  Rocket,
} from 'lucide-react'
import { PageReveal } from '@/components/page-reveal'

// Count-up animation component
function CountUpStat({
  value,
  suffix = '',
  divideBy = 1,
  isDecimal = false,
  duration = 2000,
}: {
  value: number
  suffix?: string
  divideBy?: number
  isDecimal?: boolean
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const animateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out expo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      const currentCount = easedProgress * value

      if (isDecimal) {
        setCount(parseFloat(currentCount.toFixed(1)))
      } else {
        setCount(Math.floor(currentCount))
      }

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }

    requestAnimationFrame(animateCount)
  }, [isVisible, value, isDecimal, duration])

  const displayValue = divideBy > 1 ? (count / divideBy).toFixed(isDecimal ? 1 : 0) : count.toFixed(isDecimal ? 1 : 0)

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  )
}

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ['start start', 'end start']
  })

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8])
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -10])

  // Typewriter effect
  const typewriterWords = ['Simplify', 'Organize', 'Conquer']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = typewriterWords[currentWordIndex]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < word.length) {
            setCurrentText(word.slice(0, currentText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), 1500)
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(word.slice(0, currentText.length - 1))
          } else {
            setIsDeleting(false)
            setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length)
          }
        }
      },
      isDeleting ? 50 : 100
    )

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, typewriterWords])

  // Stats counter animation with count-up
  const [statsVisible, setStatsVisible] = useState(false)
  const stats = [
    { value: 10000, label: 'Active Users', icon: Users, suffix: 'K+', divideBy: 1000 },
    { value: 1000000, label: 'Tasks Completed', icon: CheckCircle2, suffix: 'M+', divideBy: 1000000 },
    { value: 99.9, label: 'Uptime', icon: Shield, suffix: '%', isDecimal: true },
    { value: 4.9, label: 'User Rating', icon: Star, suffix: '★', isDecimal: true },
  ]

  // Bento grid features
  const bentoFeatures = [
    {
      title: 'Lightning Fast',
      description: 'Instant task creation and updates with optimized performance',
      icon: Zap,
      color: '#ff4d00',
      size: 'large',
      delay: 0,
    },
    {
      title: 'Smart Organization',
      description: 'AI-powered categorization and prioritization',
      icon: Target,
      color: '#00ff88',
      size: 'medium',
      delay: 0.1,
    },
    {
      title: 'Real-time Sync',
      description: 'Seamless synchronization across all your devices',
      icon: Smartphone,
      color: '#00aaff',
      size: 'medium',
      delay: 0.15,
    },
    {
      title: 'Team Collaboration',
      description: 'Work together with shared workspaces',
      icon: Users,
      color: '#8b5cf6',
      size: 'small',
      delay: 0.2,
    },
    {
      title: 'Advanced Analytics',
      description: 'Track productivity with detailed insights',
      icon: BarChart3,
      color: '#ffaa00',
      size: 'small',
      delay: 0.25,
    },
    {
      title: 'Global Access',
      description: 'Access from anywhere in the world',
      icon: Globe,
      color: '#ff4444',
      size: 'medium',
      delay: 0.3,
    },
  ]

  // Testimonials
  const testimonials = [
    {
      quote: 'This app completely transformed how I manage my daily tasks. The interface is beautiful and intuitive.',
      author: 'Sarah Chen',
      role: 'Product Manager',
      rating: 5,
    },
    {
      quote: 'The bento grid layout is genius. Everything I need is exactly where I expect it to be.',
      author: 'Marcus Johnson',
      role: 'Software Engineer',
      rating: 5,
    },
    {
      quote: 'Finally, a todo app that respects my intelligence and doesn\'t get in the way.',
      author: 'Emily Rodriguez',
      role: 'Designer',
      rating: 5,
    },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <PageReveal>
      <div ref={containerRef} className="relative overflow-hidden ">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 geometric-pattern opacity-30" />
        {/* <div className="floating-square" />
        <div className="floating-square" />
        <div className="floating-square" />
        <div className="floating-square" /> */}
      </div>

      {/* Navigation */}
      <motion.header
        style={{ opacity: headerOpacity, y: headerY }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/10 backdrop-blur-xl border-b border-[#222222]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff4d00]/30">
                <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TodoApp</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-[#a0a0a0] hover:text-white transition-colors duration-150 font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-[#a0a0a0] hover:text-white transition-colors duration-150 font-medium">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-[#a0a0a0] hover:text-white transition-colors duration-150 font-medium">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-[#a0a0a0] hover:text-white transition-colors duration-150 font-medium">
                Pricing
              </button>
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/signin" className="hidden sm:inline-flex px-8 py-4 bg-[#111111] border border-[#333333] text-white rounded-lg font-semibold hover:bg-[#1a1a1a] hover:border-[#444444] transition-all duration-150 items-center justify-center text-sm">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#ff6a2c] transition-colors duration-150 inline-flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Free</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 bg-[#ff4d00] text-white rounded-lg hover:bg-[#ff6a2c] transition-colors duration-150"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-[#222222] overflow-hidden"
              >
                <div className="py-4 space-y-3">
                  <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-[#a0a0a0] hover:text-white hover:bg-[#111111] rounded-lg transition-colors duration-150">
                    Features
                  </button>
                  <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 text-[#a0a0a0] hover:text-white hover:bg-[#111111] rounded-lg transition-colors duration-150">
                    How It Works
                  </button>
                  <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left px-4 py-2 text-[#a0a0a0] hover:text-white hover:bg-[#111111] rounded-lg transition-colors duration-150">
                    Testimonials
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 text-[#a0a0a0] hover:text-white hover:bg-[#111111] rounded-lg transition-colors duration-150">
                    Pricing
                  </button>
                  <div className="pt-3 border-t border-[#222222]">
                    <Link href="/signin" className="block px-4 py-2 text-[#a0a0a0] hover:text-white">
                      Sign In
                    </Link>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#333333] rounded-full text-sm text-[#a0a0a0] mb-8">
              <Sparkles className="h-4 w-4 text-[#ff4d00]" />
              <span className="font-medium">New: Smart Task Prioritization</span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6">
              <span className="inline-block min-w-[280px]">
                {currentText}
                <span className="text-[#ff4d00]">|</span>
              </span>
              <br />
              <span className="text-[#a0a0a0]">Your Tasks</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#a0a0a0] max-w-2xl mx-auto mb-12 leading-relaxed">
              The premium task management solution for professionals who demand excellence.
              Brutal simplicity meets powerful functionality.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link
                href="/signup"
                className="px-10 py-5 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#ff6a2c] transition-all duration-150 inline-flex items-center gap-3 text-base cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="px-10 py-5 bg-[#111111] border border-[#333333] text-white rounded-lg font-bold hover:bg-[#1a1a1a] hover:border-[#444444] transition-all duration-150 inline-flex items-center gap-3 text-base cursor-pointer"
              >
                Learn More
                <ChevronDown className="h-5 w-5" strokeWidth={2} />
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Floating Task Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative max-w-4xl mx-auto mt-16"
          >
            <div className="relative bg-[#0a0a0a] border border-[#222222] rounded-2xl p-6 shadow-2xl">
              {/* Task Card Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-4 border-b border-[#222222]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4d00] to-[#ff6a2c]" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#222222] rounded w-32 mb-2"></div>
                    <div className="h-2 bg-[#1a1a1a] rounded w-24"></div>
                  </div>
                </div>

                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 p-3 bg-[#111111] border border-[#222222] rounded-lg hover:border-[#333333] transition-colors duration-150"
                  >
                    <div className="w-5 h-5 rounded border-2 border-[#ff4d00]" />
                    <div className="flex-1">
                      <div className="h-2.5 bg-white rounded w-48 mb-1.5"></div>
                      <div className="h-2 bg-[#333333] rounded w-32"></div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-[#00ff88] text-black rounded font-semibold">
                      DONE
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 px-4 py-2 bg-[#00ff88] text-black rounded-lg text-sm font-bold shadow-lg inline-flex items-center gap-2"
              >
                <Shield className="h-4 w-4" strokeWidth={2.5} />
                99% Uptime
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 px-4 py-2 bg-[#ff4d00] text-white rounded-lg text-sm font-bold shadow-lg inline-flex items-center gap-2"
              >
                <Zap className="h-4 w-4" strokeWidth={2.5} />
                Lightning Fast
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#505050]"
          >
            <ChevronDown className="h-6 w-6" strokeWidth={2} />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-t border-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#111111] border border-[#333333] mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <stat.icon className="h-6 w-6 text-[#ff4d00]" strokeWidth={2} />
                </motion.div>
                <div className="text-4xl font-bold text-white mb-2">
                  <CountUpStat
                    value={stat.value}
                    suffix={stat.suffix}
                    divideBy={stat.divideBy}
                    isDecimal={stat.isDecimal}
                    duration={2000}
                  />
                </div>
                <div className="text-sm text-[#a0a0a0] font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-[#a0a0a0] max-w-2xl mx-auto">
              Powerful features designed for productivity enthusiasts
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {bentoFeatures.map((feature, index) => {
              const Icon = feature.icon
              const sizeClasses: Record<string, string> = {
                large: 'md:col-span-2 md:row-span-2',
                medium: 'md:col-span-1',
                small: 'md:col-span-1',
              }

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`${sizeClasses[feature.size]} relative bg-[#0a0a0a] border border-[#222222] rounded-2xl p-8 hover:border-[#333333] transition-all duration-300 group overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(255,77,0,0.03)] group-hover:from-transparent group-hover:to-[rgba(255,77,0,0.08)] transition-colors duration-300" />

                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6`} style={{ backgroundColor: feature.color }}>
                      <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-[#a0a0a0] leading-relaxed">{feature.description}</p>
                  </div>

                  {feature.size === 'large' && (
                    <div className="absolute bottom-8 right-8 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                      <LayoutGrid className="h-24 w-24 text-white" strokeWidth={1} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 border-t border-[#111111]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#a0a0a0] max-w-2xl mx-auto">
              Get started in seconds, not hours
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up in seconds with email or Google OAuth',
                icon: Users,
              },
              {
                step: '02',
                title: 'Add Tasks',
                description: 'Quickly add tasks with our intuitive interface',
                icon: Target,
              },
              {
                step: '03',
                title: 'Stay Productive',
                description: 'Track progress and achieve your goals',
                icon: BarChart3,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-[#222222] mb-4">{item.step}</div>
                <div className="absolute top-0 left-0 pt-2 pl-4">
                  <div className="w-12 h-12 bg-[#111111] border border-[#333333] rounded-lg flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-[#ff4d00]" strokeWidth={2} />
                  </div>
                </div>
                <div className="pt-8">
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[#a0a0a0] leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 border-t border-[#111111]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Loved by Thousands
            </h2>
            <p className="text-lg text-[#a0a0a0] max-w-2xl mx-auto">
              Join professionals who trust TodoApp for their productivity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-8 hover:border-[#333333] transition-colors duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#ffaa00] fill-[#ffaa00]" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-white mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-white mb-1">{testimonial.author}</div>
                  <div className="text-sm text-[#a0a0a0]">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-24 px-4 border-t border-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-[#a0a0a0] mb-12">
              Join thousands of professionals who trust TodoApp
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-10 py-5 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#ff6a2c] transition-all duration-150 inline-flex items-center justify-center gap-3 text-base cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </Link>
              <Link
                href="/signin"
                className="px-10 py-5 bg-[#111111] border border-[#333333] text-white rounded-lg font-bold hover:bg-[#1a1a1a] hover:border-[#444444] transition-all duration-150 inline-flex items-center justify-center text-base cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff4d00]/30">
                <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">TodoApp</span>
            </div>

            <div className="text-[#505050] text-sm">
              © 2025 TodoApp. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors duration-150 text-sm">
                Privacy
              </a>
              <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors duration-150 text-sm">
                Terms
              </a>
              <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors duration-150 text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </PageReveal>
  )
}
