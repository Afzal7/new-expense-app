'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateOrganization } from '@/hooks/use-organization-crud';
import { toast } from 'sonner';
import { Building2, Plus } from 'lucide-react';

interface CreateOrganizationProps {
    variant?: 'button' | 'icon';
    className?: string;
    onOrganizationCreated?: () => void;
}

export function CreateOrganization({ variant = 'button', className, onOrganizationCreated }: CreateOrganizationProps) {
    const [open, setOpen] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [orgSlug, setOrgSlug] = useState('');

    const createOrgMutation = useCreateOrganization();

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (newName: string) => {
        setOrgName(newName);
        setOrgSlug(generateSlug(newName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orgName.trim()) {
            toast.error('Organization name is required');
            return;
        }

        if (!orgSlug.trim()) {
            toast.error('Organization slug is required');
            return;
        }

        try {
            await createOrgMutation.mutateAsync({
                name: orgName.trim(),
                slug: orgSlug.trim(),
            });

            toast.success('Organization created successfully!');
            setOrgName('');
            setOrgSlug('');
            setOpen(false);
            onOrganizationCreated?.();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to create organization');
        }
    };

    const triggerButton = variant === 'button' ? (
        <Button onClick={() => setOpen(true)} className={className}>
            <Building2 className="h-4 w-4 mr-2" />
            Create Organization
        </Button>
    ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
            <Plus className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            {triggerButton}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Organization</DialogTitle>
                        <DialogDescription>
                            Create a new organization to collaborate with your team on expense management.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input
                                id="org-name"
                                value={orgName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Enter organization name"
                                disabled={createOrgMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-slug">Organization Slug</Label>
                            <Input
                                id="org-slug"
                                value={orgSlug}
                                onChange={(e) => setOrgSlug(e.target.value)}
                                placeholder="auto-generated-slug"
                                disabled={createOrgMutation.isPending}
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
                                disabled={createOrgMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createOrgMutation.isPending || !orgName.trim() || !orgSlug.trim()}
                            >
                                {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}