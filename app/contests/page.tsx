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
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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
  registered_users?: string[];
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
    ratingMin: "800", // ✅ lowest default
    ratingMax: "3500", // ✅ highest default
    maxParticipants: "",
    allowLateJoin: true,
    durationHours: "2", // ✅ add
    durationMinutes: "0", // ✅ add
  });
// <<<<<<< HEAD
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  useEffect(() => {
    const fetchUserRating = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from("cf_snapshots")
        .select("rating")
        .eq("user_id", userId)
  .order("snapshot_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching rating:", error);
        return;
      }

      if (data?.rating) {
        setUserRating(data.rating);
      }
    };

    fetchUserRating();
  }, []);
// =======
//   const [userRating, setUserRating] = useState<number>(0);
//   useEffect(() => {
//   const fetchUserRating = async () => {
//     const { data: userData } = await supabase.auth.getUser();
//     const userId = userData?.user?.id;

//     const { data, error } = await supabase
//       .from("cf_snapshots")
//       .select("rating")
//       .eq("user_id", userId)
//       .order("captured_at", { ascending: false })
//       .limit(1)
//       .single();

//     if (error) {
//       console.error("Error fetching rating:", error);
//       return;
//     }

//     if (data?.rating) {
//       setUserRating(data.rating);
//     }
//   };

//   fetchUserRating();
// }, []);
// >>>>>>> 0c88a0aff73832c10eedb3a4b728cef1d20ef662

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
      ratingMin: "800",
      ratingMax: "3500",
      maxParticipants: "",
      allowLateJoin: true,
      durationHours: "2",
      durationMinutes: "0",
    });
  };


  const calculateEndTime = () => {
    if (!formData.startDate || !formData.startTime) return null;

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const durationMinutes =
      parseInt(formData.durationHours) * 60 +
      parseInt(formData.durationMinutes);

    if (isNaN(durationMinutes) || durationMinutes <= 0) return null;

    const durationMs = durationMinutes * 60 * 1000;
    const endDateTime = new Date(startDateTime.getTime() + durationMs);
    return endDateTime.toISOString();
  };

  const [createdContestLink, setCreatedContestLink] = useState<string | null>(
    null
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

const createContest = async () => {
  // Validate name
  if (!formData.name.trim()) {
    toast({
      title: "Error",
      description: "Contest name is required",
      variant: "destructive",
    });
    return;
  }

  // Validate start date & time
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
  if (isNaN(minRating) || isNaN(maxRating) || minRating >= maxRating) {
    toast({
      title: "Error",
      description: "Maximum rating must be higher than minimum rating",
      variant: "destructive",
    });
    return;
  }

  // Check start time ≥ 1 hour from now
  const selectedStart = new Date(`${formData.startDate}T${formData.startTime}`);
  if (selectedStart.getTime() - new Date().getTime() < 60 * 60 * 1000) {
    toast({
      title: "Error",
      description: "Start time must be at least 1 hour from now",
      variant: "destructive",
    });
    return;
  }

  // Calculate duration
  const durationMinutes =
    parseInt(formData.durationHours) * 60 + parseInt(formData.durationMinutes);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    toast({
      title: "Error",
      description: "Duration must be greater than 0",
      variant: "destructive",
    });
    return;
  }

  const endDateTime = calculateEndTime();
  if (!endDateTime) {
    toast({
      title: "Error",
      description: "Invalid end time",
      variant: "destructive",
    });
    return;
  }

  setCreating(true);

  try {
    const startDateTime = selectedStart.toISOString();

    const bodyData: any = {
      name: formData.name.trim(),
      description: formData.description.trim() || "",
      start_time: startDateTime,
      end_time: endDateTime,
      duration_minutes: durationMinutes,
      problem_count: parseInt(formData.problemCount) || 5,
      rating_min: minRating,
      rating_max: maxRating,
      allow_late_join: formData.allowLateJoin ? 1 : 0,
    };

    if (formData.maxParticipants) {
      const maxPart = parseInt(formData.maxParticipants);
      if (!isNaN(maxPart) && maxPart > 0) {
        bodyData.max_participants = maxPart;
      }
    }

    const response = await fetch("/api/contests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    // Safely parse response
    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn("Failed to parse JSON response:", err);
      }
    }

    if (response.ok) {
      if (!data || !data.contest || !data.contest.id) {
        toast({
          title: "Error",
          description: "Contest created but no ID returned",
          variant: "destructive",
        });
        return;
      }

      setCreatedContestLink(
        `${window.location.origin}/contests/${data.contest.id}/participate`
      );
      setShareDialogOpen(true);

      resetForm();
      setCreateDialogOpen(false);
      fetchContests();
    } else {
      toast({
        title: "Error",
        description: (data && data.error) || text || "Failed to create contest",
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

// <<<<<<< HEAD
  const handleCodeforcesContestClick = (
    contestId: number,
    startSeconds: number,
    contestName: string
  ) => {
    const url = getCodeforcesContestUrl(contestId);

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const timeLeftSeconds = startSeconds - now;
    const daysLeft = Math.floor(timeLeftSeconds / (60 * 60 * 24));

    const lowername = contestName.toLowerCase();

    if (lowername.includes("div. 1") && !lowername.includes("div. 2")) {
      if (userRating < 1999) {
        toast({
          title: "Not Eligible",
          description:
            "Register for Div2 because your current rating is <1900.",
          variant: "destructive",
          className: "text-white",
        });
        return;
      }
    }

    if (daysLeft <= 2) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast({
// =======
//   const handleCodeforcesContestClick = (contestId: number, startSeconds: number, contestName: string) => {
//     const url = getCodeforcesContestUrl(contestId);
//     const timeLeftMs = startSeconds * 1000 - Date.now();
//     const daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
//     const lowername = contestName.toLowerCase();
//     if(lowername.includes("div. 1") && !lowername.includes("div. 2")){
//       if(userRating < 1999){
//          toast({
//         title: "Not Eligible",
//         description:
//           "Register for Div2 because your current rating is <1900.",
//         variant: "destructive",
//         className: "text-white",
//       });
//       return ;
//       }
//     }
//     if(daysLeft <=2 ){
//       window.open(url, "_blank", "noopener,noreferrer");
//     }else{
//        toast({
// >>>>>>> 0c88a0aff73832c10eedb3a4b728cef1d20ef662
        title: "Registration Not Started",
        description: `Registration isn't opened yet, please wait ~${daysLeft} days to register!`,
        variant: "destructive", // red alert
        className: "text-white",
      });
    }
  };

  const handleJoinPrivateContest = (contest: PrivateContest) => {
    if (!contest.start_time) {
      toast({
        title: "Invalid Contest",
        description: "Start time is not set for this contest.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const start = new Date(contest.start_time);
    const registrationClose = new Date(start.getTime() + 10 * 60 * 1000); // 10 minutes after start

    if (now < start) {
      toast({
        title: "Too Early!",
        description:
          "Registration hasn't started yet! Wait for the contest to begin.",
        variant: "destructive",
      });
      return;
    }

    if (now > registrationClose) {
      toast({
        title: "Too Late!",
        description:
          "You missed the registration window! This is CP, not a casual meet 😎",
        variant: "destructive",
      });
      return;
    }

    // Registration allowed
    window.open(`/contests/${contest.id}/participate`, "_blank");
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

          <DialogContent className="max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Contest</DialogTitle>
              <DialogDescription>
                Create a private training contest for your group or friends.
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[60vh] space-y-6 py-4 px-2 sm:px-4">
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

              {/* Contest Schedule */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Contest Schedule</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duration *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={formData.durationHours}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          durationHours: e.target.value,
                        }))
                      }
                      className="w-24"
                      placeholder="Hours"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          durationMinutes: e.target.value,
                        }))
                      }
                      className="w-24"
                      placeholder="Minutes"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Problem Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Problem Configuration</h4>
                {/* Number of Problems */}
                <div className="space-y-2">
                  <Label htmlFor="problem-count">Number of Problems *</Label>
                  <Select
                    value={formData.problemCount}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, problemCount: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of problems" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7].map((num) => (
                        <SelectItem key={num} value={`${num}`}>
                          {num} Problems
                        </SelectItem>
                      ))}
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
                    <Select
                      value={formData.ratingMin}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, ratingMin: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => 800 + i * 100).map(
                          (val) => (
                            <SelectItem key={val} value={`${val}`}>
                              {val}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.ratingMax}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, ratingMax: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Max" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: 13 },
                          (_, i) => 1000 + i * 100
                        ).map((val) => (
                          <SelectItem key={val} value={`${val}`}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Problems will be selected from Codeforces within this rating
                    range.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contest Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Contest Settings</h4>

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
                    min={1}
                    max={1000}
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

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createContest}
                disabled={creating || !formData.name.trim()}
              >
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
// <<<<<<< HEAD
                    onClick={() =>
                      handleCodeforcesContestClick(
                        contest.id,
                        contest.startTimeSeconds || 0,
                        contest.name
                      )
                    }
                  >

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
                {privateContests.map((contest: PrivateContest) => {
                  const now = new Date();
                  const start = contest.start_time
                    ? new Date(contest.start_time)
                    : null;
                  const registrationClose = start
                    ? new Date(start.getTime() + 10 * 60 * 1000)
                    : null;
                  const isRegistered = currentUser
                    ? contest.registered_users?.includes(currentUser.id)
                    : false; // make sure your API provides this

                  const handlePrivateContestClick = async () => {
                    if (!isRegistered) {
                      // Register the user
                      try {
                        const res = await fetch(
                          `/api/contests/${contest.id}/register`,
                          { method: "POST" }
                        );
                        if (res.ok) {
                          toast({
                            title: "Registered!",
                            description: "You can now join the contest.",
                            variant: "default",
                          });
                          fetchContests(); // refresh private contests to update registered users
                        } else {
                          const err = await res.json();
                          toast({
                            title: "Error",
                            description: err.error || "Failed to register",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error(error);
                        toast({
                          title: "Error",
                          description: "Failed to register",
                          variant: "destructive",
                        });
                      }
                    } else if (start && now < start) {
                      // Too early
                      const diff = start.getTime() - now.getTime();
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor(
                        (diff % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      toast({
                        title: "Too Early!",
                        description: `Contest starts in ${hours}h ${minutes}m. Wait a bit!`,
                        variant: "destructive",
                      });
                    } else if (
                      start &&
                      registrationClose &&
                      now > registrationClose
                    ) {
                      // Registration closed
                      toast({
                        title: "Registration Closed",
                        description: "You missed the registration window! 😎",
                        variant: "destructive",
                      });
                    } else {
                      // Join now
                      window.open(
                        `/contests/${contest.id}/participate`,
                        "_blank"
                      );
                    }
                  };

                  return (
                    <Card
                      key={contest.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {contest.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Created{" "}
                          {new Date(contest.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              contest.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {contest.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs"
                              onClick={() =>
                                window.open(`/contests/${contest.id}`, "_blank")
                              }
                            >
                              View Details
                            </Button>
                            {(contest.status === "upcoming" ||
                              contest.status === "active") && (
                              <Button
                                size="sm"
                                className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700"
                                onClick={handlePrivateContestClick}
                              >
                                {!isRegistered ? "Register" : "Join Now"}
                              </Button>
                            )}
                          </div>
                        </div>

                        {contest.start_time && (
                          <div className="mt-3 text-xs text-white/60">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-3 h-3" />
                              <span>
                                {new Date(contest.start_time).toLocaleString()}
                              </span>
                            </div>
                            {contest.description && (
                              <div className="mt-2 text-xs text-white/50">
                                {contest.description}
                              </div>
                            )}
                            {(contest as any).problem_count && (
                              <div className="mt-2 flex items-center gap-4 text-xs text-white/50">
                                <span>
                                  {(contest as any).problem_count} Problems
                                </span>
                                <span>
                                  Rating: {(contest as any).rating_min}-
                                  {(contest as any).rating_max}
                                </span>
                                <span>2h Duration</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contest Created!</DialogTitle>
            <DialogDescription>
              Share this contest link with your friends. Users can register up
              to 10 minutes before start.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input value={createdContestLink || ""} readOnly />
            <Button
              onClick={() => {
                if (createdContestLink)
                  navigator.clipboard.writeText(createdContestLink);
                toast({
                  title: "Copied!",
                  description: "Link copied to clipboard.",
                });
              }}
            >
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </main>
  );
}
