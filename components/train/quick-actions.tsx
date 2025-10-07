"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, Trophy, BookOpen, Zap, Users, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const actions = [
  {
    title: "Adaptive Practice",
    description: "Personalized problems for your level",
    icon: Target,
    href: "/adaptive-sheet",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    title: "Virtual Contest",
    description: "Compete in timed challenges",
    icon: Trophy,
    href: "/contests",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  {
    title: "Learning Paths",
    description: "Structured topic-wise practice",
    icon: BookOpen,
    href: "/paths",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    title: "Quick Practice",
    description: "Solve a random problem now",
    icon: Zap,
    href: "/adaptive-sheet?mode=quick",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    title: "Join Groups",
    description: "Practice with friends",
    icon: Users,
    href: "/groups",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
  {
    title: "Analytics",
    description: "View detailed statistics",
    icon: BarChart3,
    href: "/analytics",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
  },
]

export function QuickActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="text-sm text-gray-400">Choose your next step</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={action.href}>
                <Card
                  className={`group relative overflow-hidden border ${action.borderColor} ${action.bgColor} hover:scale-105 transition-all duration-300 cursor-pointer h-full`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-white text-base">{action.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{action.description}</p>
                      </div>

                      <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
