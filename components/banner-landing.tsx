'use client'
import PixelBlast from "@/app/visualizers/bg/pixelblast"
import { Target, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BannerLanding() {
    return (
        <div className="relative flex flex-col justify-center items-center text-center overflow-hidden min-h-[300px] md:min-h-[500px]">
            <div className="absolute inset-0 -z-10 w-full h-full">
                <PixelBlast />
            </div>

            <h1 className="text-5xl md:text-8xl font-bold leading-tight font-[Bricolage_Grotesque] mb-4 bg-[var(--primary)] bg-clip-text text-transparent drop-shadow-[0_0_15px_var(--primary)]">
                AlgoRise
            </h1>

            <p className="text-xl md:text-1xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
                Master competitive programming with adaptive practice sheets,
                real-time contest tracking, and comprehensive progress analytics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="text-lg px-8 py-6 bg-[#f0f0f0] hover:bg-[#b0b0b0]">
                    <Link href="/adaptive-sheet" className="flex items-center">
                        <Target className="mr-2 h-5 w-5" />
                        Start Adaptive Practice
                    </Link>
                </Button>

                <Button
                    asChild
                    className="w-auto px-6 py-6 text-lg flex items-center justify-center text-white bg-slate-600 hover:bg-slate-800">
                    <Link href="/contests" className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        View Contests
                    </Link>
                </Button>
            </div>
        </div>
    )
}