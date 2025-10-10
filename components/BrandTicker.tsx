'use client';

import { useState, useEffect } from 'react';

const values = [
  { icon: '🌾', text: 'FRESH INGREDIENTS' },
  { icon: '👩‍🍳', text: 'HANDCRAFTED DAILY' },
  { icon: '🌟', text: 'ARTISAN QUALITY' },
  { icon: '💚', text: 'LOCALLY SOURCED' },
  { icon: '⏰', text: 'MADE TO ORDER' },
  { icon: '🏆', text: 'AWARD WINNING' },
  { icon: '💝', text: 'MADE WITH LOVE' },
  { icon: '🌿', text: 'NATURAL INGREDIENTS' },
];

export default function BrandTicker() {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('brand-ticker');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="brand-ticker" className="py-20 bg-gradient-to-r from-brand to-brand/90 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            What Makes Us Special
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Every detail matters in creating the perfect artisan experience
          </p>
        </div>

        {/* Ticker Animation */}
        <div className="space-y-6">
          {/* First ticker row */}
          <div className="relative overflow-hidden">
            <div className="ticker-line ticker-line--right">
              {[...values, ...values].map((value, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full mx-2 min-w-fit"
                >
                  <span className="text-2xl">{value.icon}</span>
                  <span className="text-white font-bold tracking-wider text-lg">
                    {value.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Second ticker row (reverse direction) */}
          <div className="relative overflow-hidden">
            <div className="ticker-line ticker-line--left">
              {[...values.slice().reverse(), ...values.slice().reverse()].map((value, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex items-center gap-4 px-8 py-4 bg-white/15 backdrop-blur-sm rounded-full mx-2 min-w-fit"
                >
                  <span className="text-2xl">{value.icon}</span>
                  <span className="text-white font-bold tracking-wider text-lg">
                    {value.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
