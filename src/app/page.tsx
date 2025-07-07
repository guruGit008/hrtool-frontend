'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, FileText, Presentation, Users, Building, Database, Store, UserCheck, DollarSign,
  ArrowRight, Menu, X, Phone, Mail, MapPin, Award, Target, TrendingUp, Shield, CheckCircle, Star,
   Globe, Zap,
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRoleLogin = (role: string) => {

    console.log(`Selected role: ${role}`);
    router.push("/login");
  };

  const downloadFile = (type: 'pdf' | 'ppt') => {
    const fileName = type === 'pdf' ? 'company-profile.pdf' : 'company-presentation.pptx';
    console.log(`Downloading ${fileName}`);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

 

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Supercharged performance with blazing response times'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with foolproof encryption'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Designed to grow with your organization, worldwide'
    }
  ];

  // Example of a modern, colorful gradient palette
  const gradientColors = [
    'bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600',
    'bg-gradient-to-r from-green-400 via-yellow-400 to-red-500',
    'bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400'
  ];

  return (     
    <div className="min-h-screen font-sans text-gray-900 bg-gradient-to-br from-white via-gray-50 to-gray-100 transition-all duration-300">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-shadow duration-300 ${scrollY > 50 ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer">
           
            <span className="ml-2 font-bold text-xl tracking-wide text-gray-800">
            <Image src="https://www.tirangaaerospace.com/assets/images/logo/logo.png" alt="Tiranga Aerospace Logo" width={132} height={132} />
            </span>
          </div>
          {/* Desktop Menu */}

          <div className="hidden md:flex space-x-8 items-center">
            {['home', 'about', 'services', 'resources', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`relative text-lg font-medium transition-colors hover:text-gradient ${
                  activeSection === section ? 'text-gradient' : 'text-gray-700'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
                {activeSection === section && (
                  <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
           
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-gradient transition"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg py-4">
            <div className="flex flex-col space-y-4 px-6">
              {['home', 'about', 'services', 'resources', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-gray-700 hover:text-gradient text-lg font-medium py-2"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('login')}
                className="mt-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:scale-105 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero / Main Banner */}
      <section
        id="home"
        className="relative flex items-center min-h-[70vh] bg-gradient-to-br from-pink-100 via-purple-200 to-blue-200 overflow-hidden pt-8 pb-8"
      >
        {/* Animated Backgrounds */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-12 left-12 w-72 h-72 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-gradient-to-br from-purple-300 to-blue-400 rounded-full filter blur-3xl animate-pulse delay-200"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-blue-300 to-pink-400 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-400"></div>
        </div>
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 text-center z-20">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600 text-white rounded-full mb-2 font-semibold text-sm shadow-lg">
            <Star className="w-4 h-4 mr-2" /> Trusted by  Organizations
          </div>
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight text-gray-900">
            Transform Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600">Workplace</span>
          </h1>
          {/* Subtext */}
          <p className="max-w-2xl mx-auto mb-4 text-lg md:text-xl text-gray-700">
            All-in-one platform that empowers teams to collaborate, innovate, and succeed with automation & insights.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => scrollToSection('login')}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold shadow-xl hover:scale-105 transition text-lg"
            >
              Get Started
            </button>
          </div>
          {/* Call-to-Action Buttons */}
          {/* <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => scrollToSection('login')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold shadow-xl hover:scale-105 transition"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="px-6 py-3 border border-gray-300 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              <Play className="w-5 h-5 mr-2 inline-block" /> Watch Demo
            </button>
          </div> */}
          {/* Stats */}
       
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Why Choose <span className="text-gradient">WorkManagement</span>
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-gray-700">
            We&apos;re your strategic partner in digital transformation, building the future of work.
          </p>
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow hover:shadow-2xl transition-transform hover:scale-105 border-gradient"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-white shadow-lg">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                desc: 'Democratize enterprise tools for all organizations, big or small.',
              },
              {
                icon: Award,
                title: 'Our Vision',
                desc: 'Create a world where every team has the tools to create impact.',
              },
              {
                icon: TrendingUp,
                title: 'Our Values',
                desc: 'Innovation, transparency, customer focus, sustainable growth.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-xl shadow hover:shadow-2xl transition-transform hover:scale-105"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SVG Divider Example (between About and Services) */}
      <div className="overflow-hidden -mb-1">
        <svg viewBox="0 0 1440 100" className="w-full h-12" preserveAspectRatio="none">
          <path fill="#f3f4f6" d="M0,0 C480,100 960,0 1440,100 L1440,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* Services */}
      <section id="services" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-4xl md:text-5xl font-bold  mb-4 text-gray-900">
           Tiranga IDMS <span className="text-gradient text-xl mb-12 max-w-3xl font-bold mx-auto text-gray-900"><br/>(Internal Data Management System)</span>
          </h2>
          <p className="text-4xl md:text-5xl  mb-5 text-gray-900">
            All-in-One <span className="text-gradient">Solutions</span>
          </p>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-gray-700">
            Manage your workplace seamlessly with our powerful platform.
          </p>
          {/* Solution Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Employee Management', desc: 'Complete lifecycle management with AI insights', color: 'pink' },
              { icon: Database, title: 'Data Intelligence', desc: 'Transform data into actionable insights', color: 'purple' },
              { icon: Store, title: 'Operations Hub', desc: 'Streamline inventory & performance', color: 'blue' },
              { icon: UserCheck, title: 'HR Excellence', desc: 'Recruitment, engagement, development', color: 'pink' },
              { icon: DollarSign, title: 'Finance Control', desc: 'Budgeting & expense automation', color: 'green' },
              { icon: Shield, title: 'Security & Compliance', desc: 'Enterprise-grade security', color: 'red' },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow hover:shadow-2xl transition-transform hover:scale-105 border-gradient"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 ${gradientColors[index % gradientColors.length]} rounded-full flex items-center justify-center text-white`}
                >
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <div className="text-blue-600 font-semibold flex items-center justify-center hover:text-blue-800 transition cursor-pointer">
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="py-20 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Resource <span className="text-gradient">Center</span>
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-gray-700">
            Explore our docs, case studies, and presentations to accelerate your success.
          </p>
          {/* Download Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* PDF */}
            <motion.div className="bg-white p-8 rounded-xl border border-gray-300 hover:shadow-2xl transition transform hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="w-10 h-10 text-gradient" />
              </div>
              <h3 className="text-3xl font-semibold mb-4">Company Profile</h3>
              <p className="text-gray-600 mb-6">
                Our detailed PDF covering our story, capabilities, and success stories.
              </p>
              <button
                onClick={() => downloadFile('pdf')}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition"
              >
                <Download className="w-5 h-5 mr-2 inline-block" /> Download PDF
              </button>
            </motion.div>
            {/* PPT */}
            <motion.div className="bg-white p-8 rounded-xl border border-gray-300 hover:shadow-2xl transition transform hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <Presentation className="w-10 h-10 text-gradient" />
              </div>
              <h3 className="text-3xl font-semibold mb-4">Executive Presentation</h3>
              <p className="text-gray-600 mb-6">
                Showcase our solutions, metrics, and strategic advantages.
              </p>
              <button
                onClick={() => downloadFile('ppt')}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition"
              >
                <Download className="w-5 h-5 mr-2 inline-block" /> Download PPT
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Role-based Dashboard */}
      <section id="login" className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Choose Your <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-gray-700">
            Role-specific tools and insights designed for your responsibilities.
          </p>
          {/* Roles */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, role: 'Admin', desc: 'Full system control', color: 'blue' },
              { icon: UserCheck, role: 'Employee', desc: 'Self-service & personal dashboard', color: 'green' },
              { icon: Database, role: 'Data Manager', desc: 'Analytics & BI', color: 'purple' },
              { icon: Store, role: 'Store Manager', desc: 'Inventory & operations', color: 'pink' },
              { icon: UserCheck, role: 'HR Manager', desc: 'HR & talent', color: 'pink' },
              { icon: DollarSign, role: 'Finance', desc: 'Financial oversight', color: 'green' },
            ].map((role, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow hover:shadow-2xl transition-transform hover:scale-105 border-gradient"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 ${gradientColors[index % gradientColors.length]} rounded-full flex items-center justify-center text-white`}
                >
                  <role.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{role.role}</h3>
                <p className="text-gray-600 mb-4">{role.desc}</p>
                <button
                  onClick={() => handleRoleLogin(role.role.toLowerCase().replace(' ', '-'))}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-semibold hover:scale-105 transition"
                >
                  Access {role.role}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-900">
            Let&apos;s <span className="text-gradient">Connect</span>
          </h2>
          <p className="text-xl mb-12 text-center max-w-3xl mx-auto text-gray-700">
            Ready to level up? Reach out to us.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-8">
              {/* Phone */}
              <div className="flex items-center group">
                <div className="w-14 h-14 bg-pink-200 flex items-center justify-center rounded-xl mr-4 transition group-hover:bg-pink-300">
                  <Phone className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-600">+91 80489 05416</div>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-center group">
                <div className="w-14 h-14 bg-green-200 flex items-center justify-center rounded-xl mr-4 transition group-hover:bg-green-300">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-600">support@tirangaaerospace.com</div>
                </div>
              </div>
              {/* Address */}
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-purple-200 flex items-center justify-center rounded-xl mr-4 transition group-hover:bg-purple-300">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-gray-600 text-sm">
                    1st Floor Hillside Meadows Layout,<br />Adityanagar, Vidyaranyapura,<br />Bengaluru - 560097
                  </div>
                </div>
              </div>
            </div>
            {/* Business Hours & Support */}
            <div>
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-8 rounded-xl border border-gray-300 mb-6 shadow hover:shadow-2xl transition-transform hover:scale-105">
                <h3 className="text-3xl font-bold mb-4 text-gray-900">Business Hours</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-semibold">Monday - Saturday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Sunday</span>
                    <span className="text-gray-500 font-medium">Closed</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold">24/7 Emergency Support</span>
                  </div>
                  <p className="text-gray-600 text-sm">Critical issues? Our emergency team is always ready.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-pink-900/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 space-y-8">
          {/* Footer Top */}
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & About */}
            <div>
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 text-gradient" />
                <span className="ml-2 font-bold text-xl text-white">Work<span className="text-gradient">Management</span></span>
              </div>
              <p className="text-gray-400 mb-4">
                Powering organizations with innovative work management solutions for productivity & growth.
              </p>
              <div className="flex space-x-4">
                <a href="https://yourwebsite.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition cursor-pointer">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="mailto:support@tirangaaerospace.com" className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition cursor-pointer">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:+918048905416" className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition cursor-pointer">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
            {/* Solutions */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">Solutions</h4>
              <ul className="space-y-3">
                {['Employee Management', 'Data Intelligence', 'Operations Hub', 'HR Excellence', 'Finance Control', 'Security & Compliance'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Leadership', 'Careers', 'News & Events', 'Partner Program', 'Case Studies'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Documentation', 'API Reference', 'System Status', 'Training', 'Community'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Bottom Legal */}
          <div className="border-t border-gray-800 pt-4 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© 2025 WorkManagement. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
              <a href="#" className="hover:text-white transition">GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}