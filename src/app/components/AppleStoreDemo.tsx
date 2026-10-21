import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Smartphone, Tablet, Laptop, Watch, Headphones, CreditCard } from 'lucide-react';

/**
 * AppleStoreDemo - Showcases the Apple Store theme
 * Demonstrates Apple.com-style product showcase design
 */
export function AppleStoreDemo() {
  const products = [
    {
      name: 'iPhone 16',
      tagline: 'See the latest generation of iPhone',
      price: 'From $799',
      icon: Smartphone,
      gradient: 'from-blue-400 to-blue-600',
      badge: 'New'
    },
    {
      name: 'iPad Air',
      tagline: 'Light. Bright. Full of might.',
      price: 'From $599',
      icon: Tablet,
      gradient: 'from-sky-300 to-blue-400',
      badge: null
    },
    {
      name: 'MacBook Pro',
      tagline: 'Mind-blowing. Head-turning.',
      price: 'From $1,999',
      icon: Laptop,
      gradient: 'from-gray-800 to-black',
      badge: null
    },
    {
      name: 'Apple Watch',
      tagline: 'A healthy leap ahead.',
      price: 'From $399',
      icon: Watch,
      gradient: 'from-green-400 to-teal-500',
      badge: null
    },
    {
      name: 'AirPods Pro',
      tagline: 'Adaptive Audio. Now playing.',
      price: '$249',
      icon: Headphones,
      gradient: 'from-purple-400 to-pink-500',
      badge: null
    },
    {
      name: 'Apple Card',
      tagline: 'Get up to 3% Daily Cash back',
      price: 'Learn more',
      icon: CreditCard,
      gradient: 'from-gray-100 to-white',
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="apple-hero">
        <div className="apple-container">
          {/* Badge */}
          <div className="mb-4">
            <Badge className="apple-badge">BIBFRAME Moon Catalog</Badge>
          </div>
          
          {/* Main Heading */}
          <h1 className="apple-hero-title">
            Welcome to Moon
          </h1>
          
          {/* Subtitle */}
          <p className="apple-hero-subtitle">
            Experience cataloging like never before
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="apple-cta">
              Get Started
            </Button>
            <Button className="apple-button-secondary">
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* Gradient Section (iPad Air style) */}
      <section className="apple-gradient-section">
        <div className="apple-container">
          <h2 className="text-5xl font-bold mb-4">iPad Air</h2>
          <p className="text-2xl text-gray-600 mb-8">Two sizes. Faster chip. Does it all.</p>
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="aspect-[16/10] bg-gradient-to-br from-blue-200/30 to-transparent rounded-3xl flex items-center justify-center">
              <Tablet className="w-64 h-64 text-blue-500/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* Dark Section (MacBook Pro style) */}
      <section className="apple-dark-section apple-glow">
        <div className="apple-container">
          <h2 className="apple-product-title text-white">MacBook Pro 16"</h2>
          <p className="apple-product-description">
            Mover. Maker. Boundary breaker.
          </p>
          <div className="relative w-full max-w-3xl mx-auto mt-12">
            <div className="aspect-[16/10] flex items-center justify-center">
              <Laptop className="w-96 h-96 text-white/20" strokeWidth={0.5} />
            </div>
          </div>
          <div className="mt-8">
            <Button className="apple-cta">
              Buy
            </Button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="apple-container">
          <h2 className="text-4xl font-bold text-center mb-4">Explore the lineup</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12">
            Choose the best way to catalog
          </p>
          
          <div className="apple-grid">
            {products.map((product, idx) => {
              const Icon = product.icon;
              const isDark = product.name === 'MacBook Pro';
              
              return (
                <Card 
                  key={idx}
                  className={`apple-product-card cursor-pointer group ${
                    isDark ? 'bg-black dark:bg-gray-900 text-white' : ''
                  }`}
                >
                  <CardContent className="p-8 space-y-6">
                    {/* Badge */}
                    {product.badge && (
                      <div className="flex justify-center">
                        <Badge className="bg-orange-500 text-white">
                          {product.badge}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className={`
                        w-32 h-32 rounded-2xl 
                        bg-gradient-to-br ${product.gradient}
                        flex items-center justify-center
                        transform transition-transform group-hover:scale-110
                      `}>
                        <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    {/* Product Name */}
                    <h3 className={`
                      apple-product-title text-2xl
                      ${isDark ? 'text-white' : ''}
                    `}>
                      {product.name}
                    </h3>
                    
                    {/* Tagline */}
                    <p className={`
                      apple-product-description
                      ${isDark ? 'text-gray-400' : ''}
                    `}>
                      {product.tagline}
                    </p>
                    
                    {/* Price */}
                    <p className={`
                      text-sm font-medium
                      ${isDark ? 'text-gray-300' : 'text-gray-600'}
                    `}>
                      {product.price}
                    </p>
                    
                    {/* CTA */}
                    <Button 
                      className={`
                        w-full
                        ${isDark 
                          ? 'bg-white text-black hover:bg-gray-100' 
                          : 'apple-cta'
                        }
                      `}
                    >
                      Buy
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="apple-footer">
        <div className="apple-container">
          <p className="text-center">
            Moon BIBFRAME Catalog System • Built with care, inspired by Apple Design
          </p>
          <div className="apple-divider my-6"></div>
          <p className="text-center text-xs">
            Experience the perfect blend of Library Science and Modern Design
          </p>
        </div>
      </footer>
    </div>
  );
}