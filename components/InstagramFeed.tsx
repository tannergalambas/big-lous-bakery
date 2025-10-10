'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type FallbackPost = {
  id: string;
  image_url: string;
  caption: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
};

export type InstagramFeedItem = {
  image?: string | null;
  imageUrl?: string | null;
  alt?: string;
  permalink: string;
  caption?: string | null;
};

interface Props {
  initialPosts?: InstagramFeedItem[] | null;
}

export default function InstagramFeed({ initialPosts }: Props) {
  const [posts, setPosts] = useState<InstagramFeedItem[]>(initialPosts ?? []);
  const [loading, setLoading] = useState(!(initialPosts && initialPosts.length > 0));

  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/instagram');
        const data = await response.json();
        
        if (data.success) {
          const mapped: InstagramFeedItem[] = (data.data as FallbackPost[])
            .slice(0, 6)
            .map((post) => ({
              image: post.image_url,
              imageUrl: post.image_url,
              alt: post.caption,
              permalink: post.permalink,
              caption: post.caption,
            }));
          setPosts(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch Instagram posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
              Follow Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what's fresh from our ovens on Instagram
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
            Follow Our Journey
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            See what's fresh from our ovens on Instagram
          </p>
          
          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/biglousbakery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @biglousbakery
            </a>
            
            <a
              href="https://www.tiktok.com/@biglousbakery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              @biglousbakery
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post, index) => (
            <a
              key={post.permalink}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {post.image || post.imageUrl ? (
                <Image
                  src={post.image || post.imageUrl!}
                  alt={post.alt || 'Instagram post'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  loading="lazy"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/10 to-brand/20 text-brand font-semibold">
                  View Post
                </div>
              )}
            </a>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/biglousbakery"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-brand"
          >
            View More on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
