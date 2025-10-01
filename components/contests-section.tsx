"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Calendar, ArrowRight } from "lucide-react";
import { CardHeader, Card, CardTitle, CardContent } from "./ui/card";
import { motion } from "framer-motion";

interface Contest {
  id: number;
  name: string;
  startTimeSeconds: number;
  durationSeconds: number;
  type: string;
}

// 🎨 Badge colors by type
const getBadgeClass = (type: string) => {
  switch (true) {
    case type.includes("Div. 2"):
      return "bg-blue-500/20 text-blue-400";
    case type.includes("Div. 3"):
      return "bg-green-500/20 text-green-400";
    case type.includes("Div. 4"):
      return "bg-teal-500/20 text-teal-400";
    case type.includes("Global"):
      return "bg-yellow-500/20 text-yellow-400";
    case type.includes("Educational"):
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

// ⏱ Countdown formatter
const formatTimeRemaining = (startTime: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = startTime - now;

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export default function ContestSection() {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // force rerender for countdown

  useEffect(() => {
    fetchUpcomingContests();

    // ⏱ Update countdown every second
    const timer = setInterval(() => setTick((t) => t + 1), 1000);

    // 🔄 Refetch contests every 5 minutes
    const refresher = setInterval(fetchUpcomingContests, 5 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(refresher);
    };
  }, []);

  const fetchUpcomingContests = async () => {
    try {
      const response = await fetch("/api/cf/contests");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUpcomingContests(data.upcoming || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
      setUpcomingContests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 mb-8 mt-5">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-[#EDEB99] drop-shadow-md">
            Upcoming Contests
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest Codeforces contests —{" "}
            <span className="font-semibold text-sky-500">live countdowns</span>{" "}
            refresh in real-time.
          </p>
        </motion.div>

        {/* Contest Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : upcomingContests.length > 0 ? (
            upcomingContests.map((contest, i) => {
              const now = Math.floor(Date.now() / 1000);
              const timeDiff = contest.startTimeSeconds - now;
              const urgent = timeDiff < 3600; // less than 1 hour

              return (
                <motion.div
                  key={contest.id}
                  className="block h-full cursor-pointer"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  viewport={{ once: true, amount: 0.2 }}
                  onClick={() =>
                    window.open(
                      `https://codeforces.com/contest/${contest.id}`,
                      "_blank"
                    )
                  }
                  role="link"
                  tabIndex={0}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotateX: 3, rotateY: -3 }}
                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    className={`rounded-2xl shadow-lg h-full cursor-pointer border border-white/30 dark:border-gray-700/30 backdrop-blur-md 
                      ${
                        urgent
                          ? "animate-pulse border-red-500/40"
                          : "hover:shadow-[0_0_25px_rgba(56,189,248,0.5)]"
                      }`}
                  >
                    <Card className="bg-white/20 dark:bg-gray-800/20 rounded-2xl h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">
                            {contest.name}
                          </CardTitle>
                          <Badge
                            className={getBadgeClass(contest.type)}
                            variant="secondary"
                          >
                            {contest.type}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Timer className="h-4 w-4" />
                            <span>
                              {formatTimeRemaining(contest.startTimeSeconds)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                contest.startTimeSeconds * 1000
                              ).toLocaleString()}
                            </span>
                          </div>

                          <Button
                            asChild
                            className="w-full mt-4 text-white bg-sky-500/50 hover:bg-sky-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={`https://codeforces.com/contest/${contest.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Contest
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No upcoming contests found
              </p>
            </div>
          )}
        </div>
      </div>
      <hr className="border-gray-800 dark:border-white-800 m-10" />
    </section>
  );
}
