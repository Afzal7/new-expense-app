'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateOrganization } from '@/hooks/use-organization-crud';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

interface UpdateOrganizationProps {
    key?: string; // Add key for remounting
    organizationId: string;
    currentName: string;
    currentSlug: string;
    variant?: 'button' | 'icon';
    className?: string;
    onOrganizationUpdated?: () => void;
}

export function UpdateOrganization({
    organizationId,
    currentName,
    currentSlug,
    variant = 'button',
    className,
    onOrganizationUpdated
}: UpdateOrganizationProps) {
    const [open, setOpen] = useState(false);
    const updateOrgMutation = useUpdateOrganization();

    // Use props directly for initial state - component will be remounted when props change
    const [name, setName] = useState(currentName);
    const [slug, setSlug] = useState(currentSlug);

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (newName: string) => {
        setName(newName);
        setSlug(generateSlug(newName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Organization name is required');
            return;
        }

        if (!slug.trim()) {
            toast.error('Organization slug is required');
            return;
        }

        // Only update if values changed
        const updates: { name?: string; slug?: string } = {};
        if (name !== currentName) updates.name = name.trim();
        if (slug !== currentSlug) updates.slug = slug.trim();

        if (Object.keys(updates).length === 0) {
            toast.info('No changes to save');
            setOpen(false);
            return;
        }

        try {
            await updateOrgMutation.mutateAsync({
                organizationId,
                ...updates,
            });

            toast.success('Organization updated successfully!');
            setOpen(false);
            onOrganizationUpdated?.();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to update organization');
        }
    };

    const hasChanges = name !== currentName || slug !== currentSlug;

    const triggerButton = variant === 'button' ? (
        <Button onClick={() => setOpen(true)} className={className}>
            <Settings className="h-4 w-4 mr-2" />
            Update Settings
        </Button>
    ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
            <Settings className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            {triggerButton}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Organization</DialogTitle>
                        <DialogDescription>
                            Modify your organization&apos;s name and settings.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Enter organization name"
                                disabled={updateOrgMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-slug">Organization Slug</Label>
                            <Input
                                id="org-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="organization-slug"
                                disabled={updateOrgMutation.isPending}
                            />
                            <p className="text-sm text-muted-foreground">
                                Used in URLs. Auto-generated from name, but you can customize it.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={updateOrgMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateOrgMutation.isPending || !hasChanges}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {updateOrgMutation.isPending ? 'Updating...' : 'Update Organization'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}