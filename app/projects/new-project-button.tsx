"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim() || saving) return;
    setSaving(true);
    const r = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, instructions }),
    });
    setSaving(false);
    if (!r.ok) {
      alert("Failed to create project");
      return;
    }
    const data = await r.json();
    setOpen(false);
    setName("");
    setInstructions("");
    router.push(`/projects/${data.id}`);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        New project
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Give your project a name and optional instructions that every chat
            inside it will inherit.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="Instructions (optional)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!name.trim() || saving}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
