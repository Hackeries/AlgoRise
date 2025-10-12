"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ReportBugButton } from "@/components/report-bug-button"

interface FAQ {
  question: string
  answer: string | string[]
}

interface FAQCategory {
  name: string
  faqs: FAQ[]
}

const faqCategories: FAQCategory[] = [
  {
    name: "Getting Started",
    faqs: [
      {
        question: "What is AlgoRise?",
        answer:
          "AlgoRise is an adaptive competitive programming platform that helps you improve your problem-solving skills through personalized practice, contests, and analytics. Our platform adapts to your skill level and provides targeted problems to help you grow.",
      },
      {
        question: "How do I get started?",
        answer: [
          "1. Sign up for a free account",
          "2. Verify your Codeforces handle to sync your progress",
          "3. Complete your profile with college/company information",
          "4. Start training with our adaptive problem recommendations",
          "5. Join groups and participate in contests to compete with peers",
        ],
      },
      {
        question: "Do I need a Codeforces account?",
        answer:
          "Yes, AlgoRise integrates with Codeforces to track your progress and provide personalized recommendations. You need to verify your Codeforces handle to access most features.",
      },
    ],
  },
  {
    name: "Practice & Training",
    faqs: [
      {
        question: "What is the Adaptive Sheet?",
        answer:
          "The Adaptive Sheet is our intelligent problem recommendation system that analyzes your solving patterns, strengths, and weaknesses to suggest the most beneficial problems for your growth. It adapts in real-time based on your performance.",
      },
      {
        question: "How does the Train feature work?",
        answer:
          "The Train feature provides curated problem sets based on your current rating and skill level. You can practice problems, track your progress, and get instant feedback on your solutions.",
      },
      {
        question: "What are Learning Paths?",
        answer:
          "Learning Paths are structured courses covering specific topics like Dynamic Programming, Graph Theory, and Data Structures. Each path includes theory, practice problems, and assessments to help you master the topic systematically.",
      },
      {
        question: "Can I track my daily practice streak?",
        answer:
          "Yes! AlgoRise automatically tracks your daily solving streak. Solve at least one problem each day to maintain your streak and build consistent practice habits.",
      },
    ],
  },
  {
    name: "Contests",
    faqs: [
      {
        question: "How do contests work on AlgoRise?",
        answer:
          "AlgoRise hosts regular contests where you can compete with other users. Contests have a fixed duration, and you earn points based on problem difficulty and solving time. Your performance affects your contest rating.",
      },
      {
        question: "Can I create my own contests?",
        answer:
          "Currently, contest creation is limited to administrators. However, you can create private groups and organize practice sessions with your peers.",
      },
      {
        question: "How is contest ranking calculated?",
        answer:
          "Contest ranking is based on total points earned. Points are awarded for each solved problem, with bonuses for faster solutions. Penalties may apply for incorrect submissions.",
      },
    ],
  },
  {
    name: "Groups & Collaboration",
    faqs: [
      {
        question: "What are Groups?",
        answer:
          "Groups allow you to connect with peers from your college, company, or friend circle. You can compete on group leaderboards, share progress, and motivate each other.",
      },
      {
        question: "How do I join a group?",
        answer:
          "You can join groups in three ways: (1) Auto-join your college group by verifying your college email, (2) Use an invite code shared by a group admin, or (3) Create your own group and invite friends.",
      },
      {
        question: "Can I be in multiple groups?",
        answer:
          "Yes! You can join multiple groups simultaneously. This allows you to compete with different communities like your college, company, and friend groups.",
      },
    ],
  },
  {
    name: "Profile & Progress",
    faqs: [
      {
        question: "How do I verify my Codeforces handle?",
        answer:
          'Go to your profile settings and click "Verify Codeforces Handle". Follow the instructions to add a verification code to your Codeforces profile. Once verified, your progress will sync automatically.',
      },
      {
        question: "What is Profile Strength?",
        answer:
          "Profile Strength is a percentage indicating how complete your profile is. A complete profile includes verified Codeforces handle, status (student/professional), education/work details, and coding platform handles. Aim for 100% to unlock all features.",
      },
      {
        question: "How often does my Codeforces data sync?",
        answer:
          "Your Codeforces data syncs automatically every 24 hours. You can also manually trigger a sync from your profile page to get the latest updates immediately.",
      },
    ],
  },
  {
    name: "Analytics",
    faqs: [
      {
        question: "What analytics does AlgoRise provide?",
        answer:
          "AlgoRise provides comprehensive analytics including rating trends, problem-solving heatmaps, topic-wise accuracy, contest performance, and comparison with peers. Use these insights to identify areas for improvement.",
      },
      {
        question: "Can I compare my progress with friends?",
        answer:
          "Yes! The Analytics section allows you to compare your performance with other users. You can compare rating trends, problem counts, and topic strengths.",
      },
    ],
  },
  {
    name: "Technical Issues",
    faqs: [
      {
        question: "My Codeforces verification is not working",
        answer: [
          "Try these steps:",
          "1. Ensure you have added the verification code to your Codeforces profile",
          "2. Wait a few minutes for Codeforces to update",
          '3. Click "Check Verification" again',
          "4. If still failing, try logging out and back in",
          "5. Contact support if the issue persists",
        ],
      },
      {
        question: "I am not seeing my latest Codeforces submissions",
        answer:
          "Data syncs every 24 hours automatically. You can manually trigger a sync from your profile page. If problems persist, ensure your Codeforces handle is correctly verified.",
      },
      {
        question: "The website is loading slowly",
        answer:
          "Try clearing your browser cache and cookies. If the issue persists, check your internet connection. You can also try using a different browser or device.",
      },
    ],
  },
  {
    name: "Account & Privacy",
    faqs: [
      {
        question: "Is my data secure?",
        answer:
          "Yes, we take data security seriously. All data is encrypted in transit and at rest. We only collect information necessary to provide our services and never share your personal data with third parties.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can request account deletion by contacting our support team. Please note that this action is irreversible and will permanently delete all your data.",
      },
      {
        question: "How do I change my email address?",
        answer:
          "Currently, email changes must be done through our support team. Contact us with your current and new email addresses, and we will assist you with the change.",
      },
    ],
  },
]

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].name)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (question: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(question)) {
      newExpanded.delete(question)
    } else {
      newExpanded.add(question)
    }
    setExpandedQuestions(newExpanded)
  }

  const activeCategoryData = faqCategories.find((cat) => cat.name === activeCategory)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about AlgoRise. Can't find what you're looking for? Feel free to report a
            bug or contact our support team.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {faqCategories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? "default" : "outline"}
              onClick={() => setActiveCategory(category.name)}
              className={cn(
                "transition-all",
                activeCategory === category.name ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted/50",
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {activeCategoryData?.faqs.map((faq, index) => {
            const isExpanded = expandedQuestions.has(faq.question)
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
              >
                <button
                  onClick={() => toggleQuestion(faq.question)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4 text-muted-foreground">
                    {Array.isArray(faq.answer) ? (
                      <ul className="space-y-2">
                        {faq.answer.map((line, i) => (
                          <li key={i} className="leading-relaxed">
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="leading-relaxed">{faq.answer}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still Need Help Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 border border-border rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            If you couldn't find the answer you were looking for, we're here to help!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ReportBugButton
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            />
            <Button variant="outline" asChild>
              <a href="mailto:support@algorise.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
