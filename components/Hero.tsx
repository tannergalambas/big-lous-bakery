'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type Cta = { label: string; href: string };

type HeroProps = {
  title?: string;
  subtitle?: string;
  ctas?: Cta[];
  image?: string;
  secondaryImage?: string;
};

export default function Hero({
  title,
  subtitle,
  ctas,
  image = '/C3D858C4-1D83-4665-A3B2-3711A3CA9BC5_4_5005_c.jpeg',
  secondaryImage = '/DC71389D-2882-4FFA-9953-764146A1FCB9_4_5005_c.jpeg',
}: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const defaultPrimary = 'Artisan Treats';
  const defaultSecondary = 'Made with Love';

  let primaryTitle = defaultPrimary;
  let secondaryTitle = defaultSecondary;

  if (title) {
    const parts = title.split('|').map((part) => part.trim()).filter(Boolean);
    if (parts.length === 1) {
      primaryTitle = parts[0];
      secondaryTitle = '';
    } else if (parts.length >= 2) {
      [primaryTitle, secondaryTitle] = parts as [string, string];
    }
  }

  const heroSubtitle =
    subtitle ||
    "Discover handcrafted pastries, cookies, and cakes made fresh daily in Austin, Texas. Every bite tells a story of passion and tradition.";

  const heroCtas: Cta[] =
    ctas && ctas.length
      ? ctas
      : [
          { label: 'Shop Our Treats', href: '/shop' },
          { label: 'Our Story', href: '/about' },
        ];

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden bg-gradient-to-br from-cream via-cream/90 to-accent/20">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-60"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-brand/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>

      {/* Main Content */}
      <div className="container relative z-10 text-center px-4 pt-20 md:pt-24 lg:pt-28 pb-16">
        <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center mb-4 md:mb-6">
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-xl border border-white/40 bg-white/80 backdrop-blur">
              <Image src="/logo.jpeg" alt="Big Lou's Bakery" fill className="object-contain" sizes="112px" priority quality={100} />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 md:mb-6 leading-tight">
            <span className="block gradient-text">{primaryTitle}</span>
            {secondaryTitle ? (
              <span className="block text-brand/80 font-body font-light italic text-4xl md:text-5xl lg:text-6xl mt-2">
                {secondaryTitle}
              </span>
            ) : null}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 font-body leading-relaxed">
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {heroCtas.map((cta, index) =>
              index === 0 ? (
                <Link key={cta.href} href={cta.href} className="btn btn-brand text-xl px-8 py-4 shadow-2xl">
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cta.label}
                  </span>
                </Link>
              ) : (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className="group flex items-center gap-3 text-brand font-semibold text-lg hover:text-brand/80 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-brand/20 flex items-center justify-center group-hover:border-brand/40 group-hover:bg-brand/5 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {cta.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Feature Images */}
      <div className={`hidden lg:block absolute bottom-8 right-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative w-[420px] h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 bg-white/40 backdrop-blur">
          <Image
            src={image}
            alt={secondaryTitle ? `${primaryTitle} ${secondaryTitle}` : primaryTitle}
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="420px"
          />
        </div>
      </div>

      <div className={`hidden lg:block absolute top-8 left-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
        <div className="relative w-[260px] h-[260px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/30 bg-white/50 backdrop-blur">
          <Image
            src={secondaryImage}
            alt={secondaryTitle ? `${primaryTitle} ${secondaryTitle}` : primaryTitle}
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="260px"
          />
        </div>
      </div>
    </section>
  );
}
