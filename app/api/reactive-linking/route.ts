import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectMongoose } from '@/lib/db';
import { Expense } from '@/lib/models';
import { ExpenseStatus } from '@/types/expense';
import { organizationService } from '@/lib/services/organizationService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    await connectMongoose();

    // Check for reactive linking notification
    const notification = await organizationService.findReactiveLinkingNotification(session.user.id, organizationId);

    // Serialize MongoDB object to plain JavaScript object
    const serializedNotification = notification ? JSON.parse(JSON.stringify(notification)) : null;

    return NextResponse.json({ notification: serializedNotification });
  } catch (error) {
    console.error('Error fetching reactive linking notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, organizationId, notificationId } = body;

    if (!action || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectMongoose();

    if (action === 'link') {
      if (!notificationId) {
        return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
      }

      // Get the notification to verify ownership - we need to check ownership manually
      const notification = await organizationService.findReactiveLinkingNotification(session.user.id, organizationId);

      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      // Link personal drafts to organization
      const updateResult = await Expense.updateMany(
        {
          userId: session.user.id,
          organizationId: null,
          status: ExpenseStatus.DRAFT
        },
        {
          $set: { organizationId },
          $push: {
            auditTrail: {
              timestamp: new Date(),
              action: 'LINK_ORG',
              actorId: session.user.id,
              role: 'Employee',
              changes: [{
                field: 'organizationId',
                oldValue: null,
                newValue: organizationId,
              }],
            }
          }
        }
      );

      // Mark notification as dismissed
      await organizationService.markNotificationAsLinked(notificationId);

      return NextResponse.json({
        success: true,
        linkedCount: updateResult.modifiedCount
      });

    } else if (action === 'dismiss') {
      if (!notificationId) {
        return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
      }

      // Mark notification as dismissed
      await organizationService.dismissReactiveLinkingNotification(notificationId, session.user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing reactive linking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}