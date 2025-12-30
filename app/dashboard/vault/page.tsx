import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { VaultContent } from './_components/vault-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Receipt } from 'lucide-react';

export default async function VaultPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Lock className="h-8 w-8" />
                    Private Vault
                </h1>
                <p className="text-muted-foreground">
                    Your personal expense drafts, safely stored and private.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Personal Drafts
                    </CardTitle>
                    <CardDescription>
                        Capture receipts and track expenses before they&apos;re ready for submission.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Suspense fallback={<VaultSkeleton count={3} />}>
                        <VaultContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}

function VaultSkeleton({ count = 3 }: { count?: number } = {}) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-4 bg-muted rounded w-24"></div>
                                <div className="h-3 bg-muted rounded w-32 mt-1"></div>
                            </div>
                            <div className="h-6 bg-muted rounded w-16"></div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                            <div className="h-3 bg-muted rounded w-48"></div>
                            <div className="flex gap-2">
                                <div className="h-8 bg-muted rounded w-16"></div>
                                <div className="h-8 bg-muted rounded w-16"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}