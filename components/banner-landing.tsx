'use client'
import PixelBlast from "@/app/visualizers/bg/pixelblast"

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
        </div>
    )
}