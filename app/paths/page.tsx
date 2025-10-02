"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LEARNING_PATH_DATA, getTotalProblems } from "@/lib/learning-path-data";
import clsx from "clsx";

type ProgressMap = Record<string, number>;

export default function LearningPathsPage() {
  const supabase = createClient();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<ProgressMap>({});
  const [subsectionProgress, setSubsectionProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  const totalProblems = getTotalProblems();

  // Fetch progress
  useEffect(() => {
    loadAllProgress();
  }, []);

  const loadAllProgress = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const allProblemIds = LEARNING_PATH_DATA.flatMap((section) =>
        section.subsections.flatMap((subsection) =>
          subsection.problems.map((p) => p.id)
        )
      );

      const { data: solvedProblems, error } = await supabase
        .from("user_problems")
        .select("problem_id")
        .eq("user_id", user.id)
        .in("problem_id", allProblemIds)
        .eq("solved", true);

      if (error) throw error;

      const solvedIds = new Set(solvedProblems?.map((p) => p.problem_id) || []);

      const newSectionProgress: ProgressMap = {};
      const newSubsectionProgress: ProgressMap = {};

      LEARNING_PATH_DATA.forEach((section) => {
        let sectionSolved = 0;
        let sectionTotal = 0;

        section.subsections.forEach((sub) => {
          const solvedCount = sub.problems.filter((p) =>
            solvedIds.has(p.id)
          ).length;
          const percentage = sub.problems.length
            ? Math.round((solvedCount / sub.problems.length) * 100)
            : 0;

          newSubsectionProgress[`${section.id}-${sub.id}`] = percentage;
          sectionSolved += solvedCount;
          sectionTotal += sub.problems.length;
        });

        newSectionProgress[section.id] = sectionTotal
          ? Math.round((sectionSolved / sectionTotal) * 100)
          : 0;
      });

      setSectionProgress(newSectionProgress);
      setSubsectionProgress(newSubsectionProgress);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = useCallback((id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  }, []);

  const overallProgress = useMemo(() => {
    const totalSolved = LEARNING_PATH_DATA.reduce((sum, section) => {
      const progress = sectionProgress[section.id] || 0;
      return sum + Math.round((progress * section.totalProblems) / 100);
    }, 0);
    return totalProblems ? Math.round((totalSolved / totalProblems) * 100) : 0;
  }, [sectionProgress, totalProblems]);

  if (loading) return <Loader />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Header totalProblems={totalProblems} overallProgress={overallProgress} />
      <div className="space-y-4">
        {LEARNING_PATH_DATA.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            expanded={expandedSection === section.id}
            toggle={() => toggleSection(section.id)}
            progress={sectionProgress[section.id] || 0}
            subsectionProgress={subsectionProgress}
          />
        ))}
      </div>
      <GettingStarted />
    </main>
  );
}

// --- Components ---

const Loader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="ml-2">Loading your progress...</span>
  </div>
);

const Header = ({
  totalProblems,
  overallProgress,
}: {
  totalProblems: number;
  overallProgress: number;
}) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold mb-4">Learning Path</h1>
    <p className="text-muted-foreground text-lg mb-4">
      Complete structured journey from C++ basics to advanced competitive
      programming.
    </p>
    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4" />
        <span>{totalProblems} Total Problems</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>30+ weeks estimated</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        <span>{overallProgress}% Complete</span>
      </div>
    </div>
    <Progress value={overallProgress} className="h-3" />
  </div>
);

const SectionCard = ({
  section,
  expanded,
  toggle,
  progress,
  subsectionProgress,
}: {
  section: any;
  expanded: boolean;
  toggle: () => void;
  progress: number;
  subsectionProgress: ProgressMap;
}) => {
  const isCompleted = progress === 100;
  return (
    <Card
      className={clsx(
        "border-2 transition-all",
        isCompleted
          ? "border-green-500/50 bg-green-500/5"
          : "border-blue-500/30 hover:border-blue-500/50"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                "p-3 rounded-lg text-2xl",
                isCompleted ? "bg-green-500/20" : "bg-blue-500/20"
              )}
            >
              {section.icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">{section.title}</CardTitle>
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <CardDescription className="mt-1">
                {section.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{section.totalProblems} problems</span>
                <span>{section.estimatedTime}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggle}>
            <ChevronRight
              className={clsx(
                "h-4 w-4 transition-transform",
                expanded && "rotate-90"
              )}
            />
          </Button>
        </div>
        <div className="mt-4 flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {section.subsections.map((sub: any) => {
            const subProgress =
              subsectionProgress[`${section.id}-${sub.id}`] || 0;
            return (
              <SubsectionCard
                key={sub.id}
                sectionId={section.id}
                subsection={sub}
                progress={subProgress}
              />
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};

const SubsectionCard = ({
  sectionId,
  subsection,
  progress,
}: {
  sectionId: string;
  subsection: any;
  progress: number;
}) => {
  const completed = progress === 100;
  return (
    <Card className="border-muted/30">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{subsection.title}</h4>
            {completed && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {subsection.description}
          </p>
          <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
            <span>{subsection.problems.length} problems</span>
            <span>{subsection.estimatedTime}</span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5 mb-2" />
        </div>
        <Button size="sm" asChild>
          <Link href={`/paths/${sectionId}/${subsection.id}`}>
            <PlayCircle className="h-4 w-4 mr-1" />
            {progress > 0 ? "Continue" : "Start"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const GettingStarted = () => (
  <div className="mt-12 p-6 rounded-lg border border-green-500/20 bg-green-500/5">
    <div className="flex items-center gap-3 mb-4">
      <PlayCircle className="h-6 w-6 text-green-400" />
      <h2 className="text-xl font-semibold">Ready to Start?</h2>
    </div>
    <p className="text-muted-foreground mb-4">
      Begin your competitive programming journey with our structured learning
      path. Start with Basic C++ and progress through each section.
    </p>
    <Button asChild size="lg">
      <Link href="/paths/basic-cpp/cpp-basics">Start Learning Journey</Link>
    </Button>
  </div>
);