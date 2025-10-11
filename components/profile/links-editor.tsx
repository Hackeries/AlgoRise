"use client"

import type * as React from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useTransition } from "react"

type Props = {
  defaultValues: { leetcode: string; codechef: string; atcoder: string; gfg: string }
}

export default function LinksEditor({ defaultValues }: Props) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(defaultValues)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function onSubmit() {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // only send link fields; backend ignores unrelated when null
            leetcode_handle: values.leetcode || null,
            codechef_handle: values.codechef || null,
            atcoder_handle: values.atcoder || null,
            gfg_handle: values.gfg || null,
            // Do not touch status/college/company here
            status: "student", // harmless placeholder to satisfy validation; server uses existing when null is not allowed
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || "Failed to update links")
        }
        setSuccess(true)
        // Reload to reflect updates
        window.location.reload()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Links
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Update Coding Profiles</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label htmlFor="leetcode">LeetCode Username</Label>
            <Input
              id="leetcode"
              name="leetcode"
              value={values.leetcode}
              onChange={onChange}
              placeholder="e.g., johndoe"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="codechef">CodeChef Handle</Label>
            <Input
              id="codechef"
              name="codechef"
              value={values.codechef}
              onChange={onChange}
              placeholder="e.g., johndoe"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="atcoder">AtCoder ID</Label>
            <Input id="atcoder" name="atcoder" value={values.atcoder} onChange={onChange} placeholder="e.g., johndoe" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="gfg">GeeksforGeeks User</Label>
            <Input id="gfg" name="gfg" value={values.gfg} onChange={onChange} placeholder="e.g., johndoe" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">Saved! Reloading…</p> : null}
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
