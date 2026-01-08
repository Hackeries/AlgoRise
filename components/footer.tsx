'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Mail, Linkedin, Code2 } from 'lucide-react';

type FooterLink = { name: string; href: string };

const footerLinks = {
  product: [
    { name: 'Train', href: '/train' },
    { name: 'Practice', href: '/adaptive-sheet' },
    { name: 'Contests', href: '/contests' },
    { name: 'Learning Paths', href: '/paths' },
  ] satisfies FooterLink[],
  resources: [
    { name: 'Analytics', href: '/analytics' },
    { name: 'Visualizers', href: '/visualizers' },
    { name: 'Groups', href: '/groups' },
    { name: 'FAQs', href: '/faqs' },
  ] satisfies FooterLink[],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ] satisfies FooterLink[],
};

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/Hackeries',
    icon: Github,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aviral-joshi15/',
    icon: Linkedin,
  },
  {
    name: 'Email',
    href: 'mailto:algo.rise2025@gmail.com',
    icon: Mail,
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">AlgoRise</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Master competitive programming with adaptive learning, real-time
              contests, and AI-powered analytics.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AlgoRise. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built for competitive programmers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
