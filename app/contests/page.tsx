"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type CodeforcesContest = {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
};

type PrivateContest = {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  max_participants?: number;
  allow_late_join?: boolean;
  created_by?: string;
  created_at: string;
};

export default function ContestsPage() {
  const [upcomingCfContests, setUpcomingCfContests] = useState<
    CodeforcesContest[]
  >([]);
  const [privateContests, setPrivateContests] = useState<PrivateContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    mode: "practice", // "practice" or "icpc"
    name: "",
    description: "",
    startDate: "",
    startTime: "",
    problemCount: "5",
    ratingMin: "1200",
    ratingMax: "1400",
    maxParticipants: "",
    allowLateJoin: true,
    teamSize: "1", // For ICPC Arena
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      // Fetch Codeforces contests
      try {
        const cfResponse = await fetch("/api/cf/contests");
        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          setUpcomingCfContests(cfData.upcoming || []);
        } else {
          console.error("Failed to fetch CF contests:", cfResponse.status);
        }
      } catch (cfError) {
        console.error("Error fetching CF contests:", cfError);
      }

      // Fetch private contests
      try {
        const privateResponse = await fetch("/api/contests");
        if (privateResponse.ok) {
          const privateData = await privateResponse.json();
          console.log(privateData.contests);
          setPrivateContests(privateData.contests || []);
        } else {
          console.error(
            "Failed to fetch private contests:",
            privateResponse.status
          );
        }
      } catch (privateError) {
        console.error("Error fetching private contests:", privateError);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mode: "practice",
      name: "",
      description: "",
      startDate: "",
      startTime: "",
      problemCount: "5",
      ratingMin: "1200",
      ratingMax: "1400",
      maxParticipants: "",
      allowLateJoin: true,
      teamSize: "1",
    });
  };

  const calculateEndTime = () => {
    if (!formData.startDate || !formData.startTime) return null;

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const durationMs = 2 * 60 * 60 * 1000; // Fixed 2 hours duration
    const endDateTime = new Date(startDateTime.getTime() + durationMs);

    return endDateTime.toISOString();
  };

  const createContest = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Contest name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.startTime) {
      toast({
        title: "Error",
        description: "Start date and time are required",
        variant: "destructive",
      });
      return;
    }

    // Validate rating range
    const minRating = parseInt(formData.ratingMin);
    const maxRating = parseInt(formData.ratingMax);
    if (minRating >= maxRating) {
      toast({
        title: "Error",
        description: "Maximum rating must be higher than minimum rating",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      ).toISOString();
      const endDateTime = calculateEndTime();

      const response = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          start_time: startDateTime,
          end_time: endDateTime,
          duration_minutes: 120, // Fixed 2 hours
          problem_count: parseInt(formData.problemCount),
          rating_min: parseInt(formData.ratingMin),
          rating_max: parseInt(formData.ratingMax),
          max_participants: formData.maxParticipants
            ? parseInt(formData.maxParticipants)
            : null,
          allow_late_join: formData.allowLateJoin,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contest created successfully!",
        });
        resetForm();
        setCreateDialogOpen(false);
        fetchContests(); // Refresh the list
      } else {
        let errorMsg = "Failed to create contest";
        try {
          const text = await response.text();
          if (text) {
            const error = JSON.parse(text);
            errorMsg = error.error || errorMsg;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Contest creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create contest",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getCodeforcesContestUrl = (contestId: number) => {
    return `https://codeforces.com/contestRegistration/${contestId}`;
  };

  const handleCodeforcesContestClick = (contestId: number) => {
    const url = getCodeforcesContestUrl(contestId);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getTimeUntilStart = (startSeconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = startSeconds - now;

    if (diff < 0) return "Started";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Contests</h1>
          <p className="mt-2 text-white/80 leading-relaxed">
            Host or join private training contests. After the contest, view
            rating simulation and get a recovery set.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Contest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Contest</DialogTitle>
              <DialogDescription>
                Create a private training contest for your group or friends.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Contest Mode */}
              <div className="space-y-2">
                <Label htmlFor="contest-mode">Contest Mode *</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice Arena (Private)</SelectItem>
                    <SelectItem value="icpc">ICPC Arena (ICPC-style)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Contest Name */}
              <div className="space-y-2">
                <Label htmlFor="contest-name">Contest Name *</Label>
                <Input
                  id="contest-name"
                  placeholder="Enter contest name..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="contest-description">Description</Label>
                <Textarea
                  id="contest-description"
                  placeholder="Describe your contest (optional)..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <Separator />

              {/* Start Date & Time */}
              <div className="space-y-4">
                <h4 className="font-medium">Contest Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Duration - Dynamic */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="flex items-center px-3 py-2 bg-white/5 rounded-md border">
                    <ClockIcon className="w-4 h-4 mr-2 text-white/60" />
                    {formData.mode === "practice" ? (
                      <span className="text-sm font-medium">
                        {formData.problemCount === "5" || formData.problemCount === "6"
                          ? "2 hours"
                          : formData.problemCount === "7"
                            ? "3 hours"
                            : "2-3 hours"}
                      </span>
                    ) : (
                      <span className="text-sm font-medium">5 hours (ICPC)</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Problem Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Problem Configuration</h4>

                {/* Number of Problems */}
                <div className="space-y-2">
                  <Label htmlFor="problem-count">Number of Problems *</Label>
                  <Select
                    value={formData.problemCount}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, problemCount: value }))
                    }
                    disabled={formData.mode === "icpc"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of problems" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.mode === "practice" ? (
                        <>
                          <SelectItem value="5">5 Problems</SelectItem>
                          <SelectItem value="6">6 Problems</SelectItem>
                          <SelectItem value="7">7 Problems</SelectItem>
                          <SelectItem value="8">8 Problems</SelectItem>
                          <SelectItem value="9">9 Problems</SelectItem>
                          <SelectItem value="10">10 Problems</SelectItem>
                          <SelectItem value="11">11 Problems</SelectItem>
                          <SelectItem value="12">12 Problems</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="10">10 Problems</SelectItem>
                          <SelectItem value="11">11 Problems</SelectItem>
                          <SelectItem value="12">12 Problems</SelectItem>
                          <SelectItem value="13">13 Problems</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Team Size for ICPC Arena */}
                {formData.mode === "icpc" && (
                  <div className="space-y-2">
                    <Label htmlFor="team-size">Team Size</Label>
                    <Select
                      value={formData.teamSize}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, teamSize: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Solo</SelectItem>
                        <SelectItem value="2">2 Members</SelectItem>
                        <SelectItem value="3">3 Members (ICPC Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Rating Range */}
                <div className="space-y-2">
                  <Label>Problem Rating Range *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="rating-min"
                        className="text-sm text-white/70">
                        Minimum Rating
                      </Label>
                      <Select
                        value={formData.ratingMin}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, ratingMin: value }))
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="800">800</SelectItem>
                          <SelectItem value="900">900</SelectItem>
                          <SelectItem value="1000">1000</SelectItem>
                          <SelectItem value="1100">1100</SelectItem>
                          <SelectItem value="1200">1200</SelectItem>
                          <SelectItem value="1300">1300</SelectItem>
                          <SelectItem value="1400">1400</SelectItem>
                          <SelectItem value="1500">1500</SelectItem>
                          <SelectItem value="1600">1600</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="rating-max"
                        className="text-sm text-white/70">
                        Maximum Rating
                      </Label>
                      <Select
                        value={formData.ratingMax}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, ratingMax: value }))
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Max" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1000</SelectItem>
                          <SelectItem value="1100">1100</SelectItem>
                          <SelectItem value="1200">1200</SelectItem>
                          <SelectItem value="1300">1300</SelectItem>
                          <SelectItem value="1400">1400</SelectItem>
                          <SelectItem value="1500">1500</SelectItem>
                          <SelectItem value="1600">1600</SelectItem>
                          <SelectItem value="1700">1700</SelectItem>
                          <SelectItem value="1800">1800</SelectItem>
                          <SelectItem value="1900">1900</SelectItem>
                          <SelectItem value="2000">2000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">
                    Problems will be selected from Codeforces within this rating
                    range. Difficulty and topics will be hidden.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contest Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Contest Settings</h4>

                <div className="space-y-2">
                  <Label htmlFor="max-participants">Max Participants</Label>
                  <Input
                    id="max-participants"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxParticipants: e.target.value,
                      }))
                    }
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Late Join</Label>
                    <p className="text-sm text-muted-foreground">
                      Participants can join after contest starts
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowLateJoin}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowLateJoin: checked,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.startDate && formData.startTime && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Preview</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>Start:</strong>{" "}
                        {new Date(
                          `${formData.startDate}T${formData.startTime}`
                        ).toLocaleString()}
                      </p>
                      {calculateEndTime() && (
                        <p>
                          <strong>End:</strong>{" "}
                          {new Date(calculateEndTime()!).toLocaleString()}
                        </p>
                      )}
                      <p>
                        <strong>Duration:</strong>{" "}
                        {formData.mode === "practice"
                          ? (formData.problemCount === "5" || formData.problemCount === "6"
                            ? "2 hours"
                            : formData.problemCount === "7" || formData.problemCount === "8" || formData.problemCount === "9"
                              ? "3 hours"
                              : "2-3 hours")
                          : "5 hours (ICPC)"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}>
                Cancel
              </Button>
              <Button
                onClick={createContest}
                disabled={creating || !formData.name.trim()}>
                {creating ? "Creating..." : "Create Contest"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          <p className="mt-2 text-white/60">Loading contests...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Codeforces Contests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">
                Upcoming Codeforces Contests
              </h2>
              <Badge variant="secondary">{upcomingCfContests.length}</Badge>
            </div>

            {upcomingCfContests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-white/60 text-center">
                    No upcoming Codeforces contests found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingCfContests.slice(0, 6).map((contest) => (
                  <Card
                    key={contest.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleCodeforcesContestClick(contest.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {contest.name}
                        </CardTitle>
                        <ExternalLinkIcon className="w-4 h-4 text-white/40 flex-shrink-0 ml-2 hover:text-white/60 transition-colors" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {contest.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {contest.phase}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        {contest.startTimeSeconds && (
                          <div className="flex items-center gap-2 text-white/70">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatTime(contest.startTimeSeconds)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white/70">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDuration(contest.durationSeconds)}</span>
                        </div>
                        {contest.startTimeSeconds && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Starts in:</span>
                            <Badge variant="default" className="text-xs">
                              {getTimeUntilStart(contest.startTimeSeconds)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Private Contests */}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Private Contests</h2>
              <Badge variant="secondary">{privateContests.length}</Badge>
            </div>

            {privateContests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <UsersIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No private contests yet.</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Your First Contest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {privateContests.map((contest) => (
                  <Card
                    key={contest.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium">
                          {contest.name}
                        </CardTitle>
                        <Badge
                          variant={contest.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {contest.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-white/60">
                        Created: {contest.created_at
                          ? new Date(contest.created_at).toLocaleDateString()
                          : contest.date || "N/A"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-2 space-y-2 text-sm">
                      {contest.start_time && (
                        <div className="flex items-center gap-2 text-white/70">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(contest.start_time).toLocaleString()}</span>
                        </div>
                      )}
                      {contest.description && (
                        <p className="text-white/50">{contest.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-white/50">
                        {contest.problem_count && <span>{contest.problem_count} Problems</span>}
                        {contest.rating_min && contest.rating_max && (
                          <span>Rating: {contest.rating_min}-{contest.rating_max}</span>
                        )}
                        {contest.duration_minutes && <span>{contest.duration_minutes} min</span>}
                        {contest.max_participants && (
                          <span>Max: {contest.max_participants}</span>
                        )}
                        <span>{contest.allow_late_join ? "Late Join Allowed" : "No Late Join"}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open(`/contests/${contest.id}`, "_blank")}
                        >
                          View Details
                        </Button>
                        {(contest.status === "upcoming" || contest.status === "active") && (
                          <Button
                            size="sm"
                            className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => window.open(`/contests/${contest.id}/participate`, "_blank")}
                          >
                            Participate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
