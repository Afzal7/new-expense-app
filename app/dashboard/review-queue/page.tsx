import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReviewQueueContent } from './_components/review-queue-content';

export default async function ReviewQueuePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Review Queue</h1>
                <p className="text-muted-foreground">
                    Review and approve expense submissions from your team
                </p>
            </div>

            <ReviewQueueContent />
        </div>
    );
}