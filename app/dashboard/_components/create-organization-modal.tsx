"use client";

import { useState, cloneElement, ReactElement, ComponentProps } from "react";
import { orgClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateOrganizationModalProps {
  trigger: ReactElement;
  onOrganizationCreated?: () => void;
}

export function CreateOrganizationModal({
  trigger,
  onOrganizationCreated
}: CreateOrganizationModalProps) {
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  const triggerWithHandler = cloneElement(trigger as ReactElement<ComponentProps<typeof Button>>, {
    onClick: () => setOpen(true),
  });

  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    // Auto-generate slug from name
    setOrgSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;

    setIsCreatingOrg(true);
    try {
      // Auto-generate slug from name if not provided
      const slug =
        orgSlug ||
        orgName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      const { error } = await orgClient.create({
        name: orgName,
        slug,
      });

      if (error) {
        alert("Failed to create organization. Please try again.");
        return;
      }

      // Reset form
      setOrgName("");
      setOrgSlug("");
      setOpen(false);
      onOrganizationCreated?.();
    } catch {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingOrg(false);
    }
  };

  return (
    <>
      {triggerWithHandler}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Organization Workspace</DialogTitle>
            <DialogDescription>
              Set up a workspace for your team to collaborate and manage
              projects together.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Acme Corp"
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                disabled={isCreatingOrg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <div className="flex">
                <Input
                  id="org-slug"
                  type="text"
                  placeholder="acme-corp"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="rounded-l-none"
                  disabled={true}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreatingOrg}
            >
              Cancel
            </Button>
          <Button
            onClick={handleCreateOrg}
            disabled={isCreatingOrg || !orgName.trim()}
          >
            {isCreatingOrg ? "Creating..." : "Create Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}