'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useInView, useAnimation } from 'framer-motion'
import { BookOpen, Brain, Calendar, FileText, MessageSquare, ChevronDown } from 'lucide-react'

// Define the props for the FeatureCard component
interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  index: number;
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-md">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold">PrepPal</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex space-x-4"
          >
            <Link href="#login" className="px-4 py-2 bg-cyan-600 rounded-full hover:bg-cyan-700 transition-colors">
              Login
            </Link>
          </motion.div>
        </nav>
        <motion.div
          className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ scaleX, transformOrigin: "0%" }}
        />
      </header>

      <main className="pt-24">
        <HeroSection />
        <HorizontalScrollSection />
        <CubeToFeaturesSection />
        <FeaturesSection />
        <DemoSection />
        <TestimonialSection />
        <CTASection />
      </main>

      <footer className="bg-gray-900 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-400">
          © 2024 PrepPal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  return (
    <motion.section 
      ref={ref}
      style={{ opacity, scale }}
      className="min-h-screen flex flex-col justify-center items-center text-center px-4"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
      >
        Revolutionize Your<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Productivity
        </span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl mb-12 max-w-3xl"
      >
        Harness the power of AI to streamline your workflow and boost efficiency.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full text-lg font-semibold hover:from-cyan-300 hover:to-blue-400 transition-all"
      >
        Get Started
      </motion.button>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-8"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </motion.section>
  )
}

function HorizontalScrollSection() {
  const targetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    const content = contentRef.current

    if (!target || !content) return

    const updateScroll = () => {
      const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight)
      const moveDistance = content.scrollWidth - target.clientWidth
      content.style.transform = `translateX(-${scrollPercentage * moveDistance}px)`
    }

    target.addEventListener('scroll', updateScroll)
    return () => target.removeEventListener('scroll', updateScroll)
  }, [])

  return (
    <div 
      ref={targetRef} 
      className="h-screen overflow-y-scroll overflow-x-hidden"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      <div className="h-screen flex items-center sticky top-0">
        <div 
          ref={contentRef} 
          className="flex whitespace-nowrap will-change-transform"
        >
          <h2 className="text-6xl md:text-8xl font-bold px-4">
            Optimize Your Time • Boost Productivity • Achieve More • PrepPal • AI-Powered • Efficiency • Success •&nbsp;
          </h2>
          <h2 className="text-6xl md:text-8xl font-bold px-4">
            Optimize Your Time • Boost Productivity • Achieve More • PrepPal • AI-Powered • Efficiency • Success •&nbsp;
          </h2>
        </div>
      </div>
      <div className="h-screen"></div>
    </div>
  )
}

function CubeToFeaturesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Define the transitions for cube animation and transformation
  const cubeRotate = useTransform(scrollYProgress, [0, 0.5], [0, 180]); // Cube rotates
  const cubeScale = useTransform(scrollYProgress, [0, 0.5], [1, 10]); // Cube scales up
  const cubeOpacity = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]); // Cube fades out
  const featuresOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]); // Features fade in

  const features = [
    { icon: <FileText className="w-12 h-12 text-cyan-400" />, title: "Smart Analysis", description: "AI-powered insights to optimize your workflow." },
    { icon: <Brain className="w-12 h-12 text-pink-400" />, title: "Adaptive Learning", description: "Personalized suggestions that evolve with your needs." },
    { icon: <Calendar className="w-12 h-12 text-purple-400" />, title: "Time Management", description: "Efficient scheduling to maximize productivity." },
    { icon: <MessageSquare className="w-12 h-12 text-green-400" />, title: "Collaborative Tools", description: "Seamless integration with your team's workflow." },
  ];

  return (
    <section ref={containerRef} className="min-h-[200vh] relative">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        {/* Cube Animation */}
        <motion.div
          style={{
            rotateY: cubeRotate,
            scale: cubeScale,
            opacity: cubeOpacity,
          }}
          className="w-40 h-40 relative"
        >
          {/* This creates a cube effect */}
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-full h-full bg-cyan-400 opacity-80"
              style={{
                rotateX: index < 2 ? index * 180 : 0,
                rotateY: index >= 2 && index < 4 ? (index - 2) * 180 : 0,
                rotateZ: index >= 4 ? (index - 4) * 180 : 0,
                translateZ: '80px',
              }}
            />
          ))}
        </motion.div>

        {/* Feature Cards that fade in after the cube transforms */}
        <motion.div
          style={{ opacity: featuresOpacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["20%", "0%"])

  const features = [
    { icon: <FileText className="w-12 h-12 text-cyan-400" />, title: "Smart Analysis", description: "AI-powered insights to optimize your workflow." },
    { icon: <Brain className="w-12 h-12 text-pink-400" />, title: "Adaptive Learning", description: "Personalized suggestions that evolve with your needs." },
    { icon: <Calendar className="w-12 h-12 text-purple-400" />, title: "Time Management", description: "Efficient scheduling to maximize productivity." },
    { icon: <MessageSquare className="w-12 h-12 text-green-400" />, title: "Collaborative Tools", description: "Seamless integration with your team's workflow." },
  ]

  return (
    <motion.section 
      ref={ref}
      style={{ y }}
      className="py-20 px-4"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold mb-12 text-center"
      >
        Powerful Features
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  )
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
    </motion.div>
  )
}

function DemoSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-b from-cyan-500 to-blue-600 opacity-10"
      />
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold mb-12 text-center relative z-10"
      >
        See PrepPal in Action
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <Image
          src="/placeholder.svg?height=600&width=800"
          width={800}
          height={600}
          alt="PrepPal Demo"
          className="rounded-lg shadow-2xl mx-auto"
        />
      </motion.div>
    </section>
  )
}

function TestimonialSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  const testimonials = [
    { name: "Alex Johnson", role: "Project Manager", quote: "PrepPal has transformed how our team collaborates and manages tasks." },
    { name: "Sarah Lee", role: "Freelance Designer", quote: "The AI-powered insights have helped me optimize my workflow and take on more clients." },
    { name: "Michael Chen", role: "Software Engineer", quote: "I can't imagine going back to my old productivity tools after using PrepPal." },
  ]

  return (
    <motion.section 
      ref={ref}
      style={{ opacity }}
      className="py-20 px-4"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold mb-12 text-center"
      >
        What Our Users Say
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} index={index} />
        ))}
      </div>
    </motion.section>
  )
}

function TestimonialCard({ name, role, quote, index }: { name: string; role: string; quote: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <p className="text-gray-300 mb-4">"{quote}"</p>
      <p className="font-semibold">{name}</p>
      <p className="text-gray-400">{role}</p>
    </motion.div>
  )
}

function CTASection() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="py-20 px-4"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-6"
        >
          Ready to Boost Your Productivity?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl mb-8"
        >
          Join thousands of professionals who have already transformed their workflow with PrepPal.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-full text-lg font-semibold hover:from-cyan-300 hover:to-blue-400 transition-all"
        >
          Start Your Free Trial
        </motion.button>
      </div>
    </motion.section>
  )
}
