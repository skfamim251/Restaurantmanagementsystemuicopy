import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChefHat, 
  Users, 
  QrCode, 
  BarChart3, 
  Smartphone, 
  Zap,
  Check,
  ArrowRight,
  Menu,
  X,
  Globe,
  Lock,
  RefreshCw,
  Clock,
  CreditCard,
  FileText,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <QrCode className="w-8 h-8 text-terracotta" />,
      title: "QR Code Ordering",
      description: "Contactless menu browsing and ordering with instant QR code generation for each table"
    },
    {
      icon: <ChefHat className="w-8 h-8 text-terracotta" />,
      title: "Kitchen Dashboard",
      description: "Real-time order management with prep time tracking and status updates"
    },
    {
      icon: <Users className="w-8 h-8 text-terracotta" />,
      title: "Host Management",
      description: "Intelligent seating and waitlist management with automated wait time estimation"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-terracotta" />,
      title: "Analytics & Insights",
      description: "Comprehensive analytics on occupancy, popular dishes, and revenue trends"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-terracotta" />,
      title: "Payment Integration",
      description: "Stripe integration for seamless payments with split bill support"
    },
    {
      icon: <Bell className="w-8 h-8 text-terracotta" />,
      title: "Real-time Notifications",
      description: "Instant updates for orders, table status changes, and customer requests"
    },
    {
      icon: <Globe className="w-8 h-8 text-terracotta" />,
      title: "Multi-tenant SaaS",
      description: "Each restaurant gets their own customized instance with branded menus"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-terracotta" />,
      title: "Mobile Responsive",
      description: "Works perfectly on any device - phones, tablets, and desktops"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-terracotta" />,
      title: "Offline Support",
      description: "Continue operations even without internet with automatic sync"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small cafes and food trucks",
      features: [
        "Up to 10 tables",
        "QR code ordering",
        "Basic kitchen dashboard",
        "Menu management",
        "Email support",
        "1 restaurant location"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Ideal for growing restaurants",
      features: [
        "Up to 50 tables",
        "Everything in Starter",
        "Advanced analytics",
        "Waitlist management",
        "Payment integration",
        "Priority support",
        "Up to 3 locations",
        "Custom branding"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For restaurant chains and franchises",
      features: [
        "Unlimited tables",
        "Everything in Professional",
        "Multi-location management",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "White-label option"
      ],
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Owner, The Green Table",
      content: "RestaurantOS transformed how we manage orders. Our table turnover increased by 30% and customer satisfaction is at an all-time high.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Manager, Fusion Kitchen",
      content: "The QR code ordering system is a game-changer. Customers love the convenience, and our staff can focus on providing excellent service.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Chef & Owner, Bella Cucina",
      content: "The kitchen dashboard keeps everything organized. We've reduced prep time errors by 80% and our kitchen runs like clockwork.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-8 h-8 text-terracotta" />
              <span className="text-xl font-bold bg-gradient-to-r from-terracotta to-terracotta-dark bg-clip-text text-transparent">
                RestaurantOS
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-terracotta transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-terracotta transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-terracotta transition-colors">
                Testimonials
              </a>
              <Button variant="outline" onClick={onLogin} className="border-terracotta text-terracotta hover:bg-terracotta hover:text-white">
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="bg-terracotta hover:bg-terracotta-dark">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <a href="#features" className="block py-2 text-gray-700 dark:text-gray-300">
                Features
              </a>
              <a href="#pricing" className="block py-2 text-gray-700 dark:text-gray-300">
                Pricing
              </a>
              <a href="#testimonials" className="block py-2 text-gray-700 dark:text-gray-300">
                Testimonials
              </a>
              <div className="space-y-2 pt-4 border-t">
                <Button variant="outline" onClick={onLogin} className="w-full">
                  Sign In
                </Button>
                <Button onClick={onGetStarted} className="w-full bg-terracotta hover:bg-terracotta-dark">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-terracotta/10 text-terracotta border-terracotta/20">
                <Zap className="w-3 h-3 mr-1" />
                Modern Restaurant Management
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-terracotta to-terracotta-dark dark:from-white dark:via-terracotta-light dark:to-terracotta bg-clip-text text-transparent">
                Transform Your Restaurant Operations
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                The all-in-one platform for modern restaurants. QR ordering, kitchen management, analytics, and more - all in one beautiful interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="bg-terracotta hover:bg-terracotta-dark text-lg px-8"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={onLogin}
                  className="text-lg px-8 border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
                >
                  View Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  14-day free trial
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-6 bg-gradient-to-br from-terracotta/10 to-amber-50 dark:from-terracotta/20 dark:to-gray-700">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Quick Stats</h3>
                      <Badge className="bg-green-100 text-green-700">Live</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-terracotta/10 rounded-lg">
                        <div className="text-2xl font-bold text-terracotta">87%</div>
                        <div className="text-xs text-gray-600">Occupancy</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-xs text-gray-600">Active Orders</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">4</div>
                        <div className="text-xs text-gray-600">Waitlist</div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">15m</div>
                        <div className="text-xs text-gray-600">Avg Wait</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-terracotta/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-terracotta/10 text-terracotta border-terracotta/20">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive restaurant management tools designed for modern operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-terracotta/10 text-terracotta border-terracotta/20">
              Pricing
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your restaurant. All plans include 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full ${plan.highlighted ? 'border-terracotta border-2 shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
                  <CardHeader>
                    {plan.highlighted && (
                      <Badge className="mb-2 bg-terracotta text-white w-fit">Most Popular</Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className={`w-full mb-6 ${plan.highlighted ? 'bg-terracotta hover:bg-terracotta-dark' : ''}`}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      onClick={onGetStarted}
                    >
                      Get Started
                    </Button>
                    <Separator className="mb-6" />
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-terracotta/10 text-terracotta border-terracotta/20">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Loved by Restaurant Owners</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what our customers have to say about RestaurantOS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Restaurant?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of restaurants already using RestaurantOS to streamline their operations and delight their customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-terracotta hover:bg-terracotta-dark text-lg px-8"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onLogin}
                className="text-lg px-8"
              >
                Schedule a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="w-6 h-6 text-terracotta" />
                <span className="font-bold text-xl">RestaurantOS</span>
              </div>
              <p className="text-gray-400 text-sm">
                Modern restaurant management made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-sm text-gray-400">
            © 2025 RestaurantOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
