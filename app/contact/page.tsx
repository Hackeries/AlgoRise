'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Clock, Send, CheckCircle2, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormState({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background'>
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10' />
        <div className='relative max-w-5xl mx-auto px-4 py-16 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4'>
              <Mail className='w-8 h-8 text-primary' />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
              Contact Us
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Have a question, feedback, or need help? We are here for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-12 px-4'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12'>
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className='p-8 rounded-2xl bg-card/60 border border-border/40'>
                <h2 className='text-2xl font-bold mb-6'>Send us a Message</h2>

                {isSubmitted ? (
                  <div className='text-center py-12'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4'>
                      <CheckCircle2 className='w-8 h-8 text-green-500' />
                    </div>
                    <h3 className='text-xl font-semibold mb-2'>
                      Message Sent!
                    </h3>
                    <p className='text-muted-foreground mb-6'>
                      Thank you for reaching out. We will get back to you within
                      24-48 hours.
                    </p>
                    <Button
                      variant='outline'
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                      <Label htmlFor='name'>Name</Label>
                      <Input
                        id='name'
                        name='name'
                        value={formState.name}
                        onChange={handleChange}
                        placeholder='Your name'
                        required
                        className='mt-1.5'
                      />
                    </div>

                    <div>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        value={formState.email}
                        onChange={handleChange}
                        placeholder='you@example.com'
                        required
                        className='mt-1.5'
                      />
                    </div>

                    <div>
                      <Label htmlFor='subject'>Subject</Label>
                      <Input
                        id='subject'
                        name='subject'
                        value={formState.subject}
                        onChange={handleChange}
                        placeholder='How can we help?'
                        required
                        className='mt-1.5'
                      />
                    </div>

                    <div>
                      <Label htmlFor='message'>Message</Label>
                      <Textarea
                        id='message'
                        name='message'
                        value={formState.message}
                        onChange={handleChange}
                        placeholder='Tell us more about your question or feedback...'
                        rows={5}
                        required
                        className='mt-1.5 resize-none'
                      />
                    </div>

                    <Button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full'
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className='w-4 h-4 mr-2' />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='space-y-8'
            >
              {/* Email Card */}
              <div className='p-6 rounded-2xl bg-card/60 border border-border/40'>
                <div className='flex items-start gap-4'>
                  <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <Mail className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-semibold mb-1'>Email Us</h3>
                    <a
                      href='mailto:support@myalgorise.in'
                      className='text-primary hover:underline'
                    >
                      support@myalgorise.in
                    </a>
                    <p className='text-sm text-muted-foreground mt-2'>
                      For general inquiries, support requests, and feedback.
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className='p-6 rounded-2xl bg-card/60 border border-border/40'>
                <div className='flex items-start gap-4'>
                  <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <Clock className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-semibold mb-1'>Response Time</h3>
                    <p className='text-muted-foreground'>
                      We typically respond within{' '}
                      <span className='text-foreground font-medium'>
                        24-48 hours
                      </span>
                    </p>
                    <p className='text-sm text-muted-foreground mt-2'>
                      For urgent issues, please include URGENT in your subject
                      line.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Card */}
              <div className='p-6 rounded-2xl bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 border border-border/40'>
                <div className='flex items-start gap-4'>
                  <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                    <HelpCircle className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-semibold mb-1'>
                      Check Our FAQs First
                    </h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Many common questions are already answered in our
                      comprehensive FAQ section.
                    </p>
                    <Link
                      href='/faqs'
                      className='inline-flex items-center text-primary hover:underline text-sm font-medium'
                    >
                      Visit FAQs →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Common Topics */}
              <div className='p-6 rounded-2xl bg-card/60 border border-border/40'>
                <h3 className='font-semibold mb-4'>Common Topics</h3>
                <ul className='space-y-3 text-sm text-muted-foreground'>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                    Account & Codeforces verification issues
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                    Problem recommendations & adaptive sheet
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                    Groups & contest participation
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                    Feature requests & feedback
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                    Bug reports & technical issues
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className='py-12 px-4 border-t border-border/50'>
        <div className='max-w-4xl mx-auto text-center text-muted-foreground'>
          <p className='text-sm'>
            <Link href='/about' className='text-primary hover:underline'>
              About Us
            </Link>{' '}
            ·{' '}
            <Link href='/faqs' className='text-primary hover:underline'>
              FAQs
            </Link>{' '}
            ·{' '}
            <Link href='/privacy' className='text-primary hover:underline'>
              Privacy Policy
            </Link>{' '}
            ·{' '}
            <Link href='/terms' className='text-primary hover:underline'>
              Terms of Service
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
