"use client"

import useSWR, { mutate } from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GroupLeaderboard } from "@/components/groups/group-leaderboard"
import { GroupManagement } from "@/components/groups/group-management"
import { Users, Plus, Trophy, Crown, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Group {
  id: string
  name: string
  type: "college" | "friends"
  memberCount: number
  description?: string
}

interface Membership {
  role: "admin" | "moderator" | "member"
  group: Group
}

export default function GroupsPage() {
  const { toast } = useToast()
  const { data, isLoading } = useSWR<{
    memberships: Membership[]
  }>("/api/groups/mine", fetcher)
  const memberships = data?.memberships ?? []
  const [selectedGroup, setSelectedGroup] = useState<Membership | null>(null)
  const [friendName, setFriendName] = useState("")
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [query, setQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "college" | "friends">("all")
  const [sortKey, setSortKey] = useState<"name" | "members">("name")

  const sortGroups = (groups: Membership[]) => {
    if (sortKey === "name") {
      return groups.sort((a, b) => a.group.name.localeCompare(b.group.name))
    }
    return groups.sort((a, b) => a.group.memberCount - b.group.memberCount)
  }

  const filterGroups = (groups: Membership[]) => {
    if (filterType === "all") return groups
    return groups.filter((m) => m.group.type === filterType)
  }

  const createFriendsGroup = async () => {
    if (!friendName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/groups/create-friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: friendName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Unable to create group")
      toast({
        title: "Group created",
        description: `Your friends group "${friendName}" has been created.`,
      })
      setFriendName("")
      setShowCreateDialog(false)
      mutate("/api/groups/mine")
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Unable to create friends group",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const leaveGroup = async (id: string) => {
    try {
      const res = await fetch("/api/groups/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Unable to leave group")
      toast({ title: "Left group", description: "You have left this group." })
      setSelectedGroup(null)
      mutate("/api/groups/mine")
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Unable to leave group",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const filteredAndSortedMemberships = sortGroups(filterGroups(memberships))

  if (selectedGroup) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setSelectedGroup(null)} className="px-2">
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedGroup.group.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={selectedGroup.group.type === "college" ? "default" : "secondary"}>
                  {selectedGroup.group.type}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getRoleIcon(selectedGroup.role)}
                  {selectedGroup.role}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedGroup.group.memberCount} members</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => leaveGroup(selectedGroup.group.id)}
              className="text-destructive hover:text-destructive"
            >
              Leave Group
            </Button>
          </div>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            <GroupLeaderboard groupId={selectedGroup.group.id} groupName={selectedGroup.group.name} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <GroupManagement
              groupId={selectedGroup.group.id}
              groupName={selectedGroup.group.name}
              userRole={selectedGroup.role}
            />
          </TabsContent>
        </Tabs>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground mt-1">Join groups to compete with friends and classmates</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort</label>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
            >
              <option value="name">Name</option>
              <option value="members">Members</option>
            </select>

            <label className="ml-3 text-sm text-muted-foreground">Type</label>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="college">College</option>
              <option value="friends">Friends</option>
            </select>
          </div>

          <Input
            placeholder="Search my groups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-40 sm:w-56 md:w-64"
          />
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Friends Group</DialogTitle>
                <DialogDescription>
                  Create a group to compete with your friends and track progress together.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    placeholder="Enter group name"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createFriendsGroup} disabled={creating || !friendName.trim()}>
                  {creating ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMemberships.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No groups match your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedMemberships.map((m) => (
              <Card
                key={m.group.id}
                role="button"
                onClick={() => setSelectedGroup(m)}
                className="hover:bg-muted/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{m.group.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant={m.group.type === "college" ? "default" : "secondary"}>{m.group.type}</Badge>
                        <Badge variant="outline">{m.group.memberCount} members</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getRoleIcon(m.role)}
                          {m.role}
                        </Badge>
                      </div>
                      {m.group.description ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{m.group.description}</p>
                      ) : null}
                    </div>
                    <Button variant="ghost" className="text-sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </main>
  )
}
