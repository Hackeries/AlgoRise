"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Plus } from "lucide-react";

interface College {
  id: string;
  name: string;
}

interface CollegeStepProps {
  onComplete: () => void;
}

export function CollegeStep({ onComplete }: CollegeStepProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [customCollege, setCustomCollege] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchColleges();
  }, []);

  async function fetchColleges() {
    try {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      if (res.ok) setColleges(data.colleges || []);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
    }
  }

  async function handleCollegeSubmit() {
    const collegeName = showCustom ? customCollege.trim() : selectedCollege;
    if (!collegeName) return;

    setIsLoading(true);
    try {
      let collegeId = selectedCollege;

      if (showCustom) {
        // Create new college
        const res = await fetch("/api/colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: collegeName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        collegeId = data.id;
      }

      // Join college group
      const res = await fetch("/api/groups/join-college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "College Set!",
        description: `Joined ${collegeName} group`,
      });
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
          <GraduationCap className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">Which college are you from? 🎓</h2>
        <p className="text-muted-foreground mt-2">
          Join your college community to compete with classmates
        </p>
      </div>

      <Card className="border-blue-500/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Select Your College</CardTitle>
          <CardDescription>
            Choose from the list or add your college if it's not there
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCustom ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Select
                  value={selectedCollege}
                  onValueChange={setSelectedCollege}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowCustom(true)}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  My college isn't listed
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-college">College Name</Label>
                <Input
                  id="custom-college"
                  placeholder="Enter your college name"
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                />
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowCustom(false)}
                  className="text-sm"
                >
                  ← Back to list
                </Button>
              </div>
            </>
          )}

          <Button
            onClick={handleCollegeSubmit}
            disabled={isLoading || (!selectedCollege && !customCollege.trim())}
            className="w-full"
          >
            {isLoading ? "Setting up..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
