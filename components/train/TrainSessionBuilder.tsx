'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Zap, Clock, Target, Lightbulb, Play, Loader2 } from 'lucide-react';

/**
 * Session configuration builder component.
 * 
 * TODO: Load user's preferred settings from profile
 * TODO: Add template presets (Quick Practice, Interview Prep, Topic Focus)
 */

interface SessionConfig {
  template: 'quick' | 'standard' | 'intensive' | 'custom';
  topics: string[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  durationMinutes: number;
  language: string;
  hintsEnabled: boolean;
  problemCount?: number;
}

interface TrainSessionBuilderProps {
  onStartSession: (config: SessionConfig) => void;
  isLoading?: boolean;
}

const AVAILABLE_TOPICS = [
  'Arrays',
  'Strings',
  'Trees',
  'Graphs',
  'DP',
  'Sorting',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Queue',
  'Heap',
  'Greedy',
  'Backtracking',
  'Math',
];

const LANGUAGES = [
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const TEMPLATES = {
  quick: { duration: 15, easy: 50, medium: 40, hard: 10, problemCount: 3 },
  standard: { duration: 30, easy: 30, medium: 50, hard: 20, problemCount: 6 },
  intensive: { duration: 60, easy: 20, medium: 40, hard: 40, problemCount: 10 },
  custom: { duration: 30, easy: 30, medium: 50, hard: 20, problemCount: 6 },
};

export function TrainSessionBuilder({ onStartSession, isLoading = false }: TrainSessionBuilderProps) {
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>('standard');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays', 'DP']);
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: TEMPLATES.standard.easy,
    medium: TEMPLATES.standard.medium,
    hard: TEMPLATES.standard.hard,
  });
  const [durationMinutes, setDurationMinutes] = useState(TEMPLATES.standard.duration);
  const [language, setLanguage] = useState('cpp');
  const [hintsEnabled, setHintsEnabled] = useState(true);

  const handleTemplateChange = (newTemplate: keyof typeof TEMPLATES) => {
    setTemplate(newTemplate);
    if (newTemplate !== 'custom') {
      const preset = TEMPLATES[newTemplate];
      setDurationMinutes(preset.duration);
      setDifficultyDistribution({
        easy: preset.easy,
        medium: preset.medium,
        hard: preset.hard,
      });
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStart = () => {
    if (selectedTopics.length === 0) return;

    const config: SessionConfig = {
      template,
      topics: selectedTopics,
      difficultyDistribution,
      durationMinutes,
      language,
      hintsEnabled,
      problemCount: TEMPLATES[template].problemCount,
    };

    onStartSession(config);
  };

  const updateDifficulty = (key: 'easy' | 'medium' | 'hard', value: number) => {
    setTemplate('custom');
    const remaining = 100 - value;
    const otherKeys = (['easy', 'medium', 'hard'] as const).filter((k) => k !== key);
    const otherTotal = otherKeys.reduce((sum, k) => sum + difficultyDistribution[k], 0);

    if (otherTotal === 0) {
      setDifficultyDistribution({
        ...difficultyDistribution,
        [key]: value,
        [otherKeys[0]]: remaining / 2,
        [otherKeys[1]]: remaining / 2,
      });
    } else {
      const ratio = remaining / otherTotal;
      setDifficultyDistribution({
        ...difficultyDistribution,
        [key]: value,
        [otherKeys[0]]: Math.round(difficultyDistribution[otherKeys[0]] * ratio),
        [otherKeys[1]]: Math.round(difficultyDistribution[otherKeys[1]] * ratio),
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Configure Training Session
        </CardTitle>
        <CardDescription>
          Set up your practice session with topics, difficulty, and preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Session Template</Label>
          <div className="flex gap-2">
            {(['quick', 'standard', 'intensive', 'custom'] as const).map((t) => (
              <Button
                key={t}
                variant={template === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTemplateChange(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Topics Selection */}
        <div className="space-y-2">
          <Label>Topics ({selectedTopics.length} selected)</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TOPICS.map((topic) => (
              <Badge
                key={topic}
                variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTopic(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
          {selectedTopics.length === 0 && (
            <p className="text-sm text-red-500">Select at least one topic</p>
          )}
        </div>

        {/* Difficulty Distribution */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Difficulty Distribution
          </Label>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm text-green-500">Easy</span>
              <Slider
                value={[difficultyDistribution.easy]}
                onValueChange={([v]) => updateDifficulty('easy', v)}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="w-10 text-sm text-right">{difficultyDistribution.easy}%</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-16 text-sm text-yellow-500">Medium</span>
              <Slider
                value={[difficultyDistribution.medium]}
                onValueChange={([v]) => updateDifficulty('medium', v)}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="w-10 text-sm text-right">{difficultyDistribution.medium}%</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-16 text-sm text-red-500">Hard</span>
              <Slider
                value={[difficultyDistribution.hard]}
                onValueChange={([v]) => updateDifficulty('hard', v)}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="w-10 text-sm text-right">{difficultyDistribution.hard}%</span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duration: {durationMinutes} minutes
          </Label>
          <Slider
            value={[durationMinutes]}
            onValueChange={([v]) => {
              setDurationMinutes(v);
              setTemplate('custom');
            }}
            min={5}
            max={120}
            step={5}
          />
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label>Programming Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hints Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <Label htmlFor="hints">Enable Hints</Label>
          </div>
          <Switch
            id="hints"
            checked={hintsEnabled}
            onCheckedChange={setHintsEnabled}
          />
        </div>

        {/* Start Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleStart}
          disabled={selectedTopics.length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Session...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Training Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
