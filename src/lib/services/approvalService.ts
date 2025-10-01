import { supabase } from '../supabase-client';

export interface ReviewRequest {
  id: string;
  item_type: string;
  item_id: string;
  item_table: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'needs_revision';
  submitted_by?: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  rejection_reason?: string;
  revision_notes?: string;
}

export interface PendingReview {
  review_id: string;
  item_type: string;
  item_id: string;
  item_table: string;
  status: string;
  submitted_at: string;
  submitted_by?: string;
  submitted_by_email?: string;
  item_name: string;
  item_description?: string;
  item_city?: string;
  item_country?: string;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  item_type: string;
  item_id: string;
  item_table: string;
  user_id?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  created_at: string;
}

export class ApprovalService {
  // Get all pending reviews
  static async getPendingReviews(): Promise<PendingReview[]> {
    const { data, error } = await supabase
      .from('pending_reviews')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending reviews:', error);
      throw new Error('Failed to fetch pending reviews');
    }

    return data || [];
  }

  // Get review requests by status
  static async getReviewRequests(status?: string): Promise<ReviewRequest[]> {
    let query = supabase
      .from('review_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching review requests:', error);
      throw new Error('Failed to fetch review requests');
    }

    return data || [];
  }

  // Submit an item for review
  static async submitForReview(
    itemType: string,
    itemId: string,
    itemTable: string,
    submittedBy?: string
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('submit_for_review', {
        p_item_type: itemType,
        p_item_id: itemId,
        p_item_table: itemTable,
        p_submitted_by: submittedBy
      });

    if (error) {
      console.error('Error submitting for review:', error);
      throw new Error('Failed to submit item for review');
    }

    return data;
  }

  // Approve an item
  static async approveItem(
    itemId: string,
    itemTable: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('approve_item', {
        p_item_id: itemId,
        p_item_table: itemTable,
        p_reviewed_by: reviewedBy,
        p_review_notes: reviewNotes
      });

    if (error) {
      console.error('Error approving item:', error);
      throw new Error('Failed to approve item');
    }

    return data;
  }

  // Reject an item
  static async rejectItem(
    itemId: string,
    itemTable: string,
    reviewedBy: string,
    rejectionReason: string,
    reviewNotes?: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('reject_item', {
        p_item_id: itemId,
        p_item_table: itemTable,
        p_reviewed_by: reviewedBy,
        p_rejection_reason: rejectionReason,
        p_review_notes: reviewNotes
      });

    if (error) {
      console.error('Error rejecting item:', error);
      throw new Error('Failed to reject item');
    }

    return data;
  }

  // Request revision for an item
  static async requestRevision(
    itemId: string,
    itemTable: string,
    reviewedBy: string,
    revisionNotes: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('request_revision', {
        p_item_id: itemId,
        p_item_table: itemTable,
        p_reviewed_by: reviewedBy,
        p_revision_notes: revisionNotes
      });

    if (error) {
      console.error('Error requesting revision:', error);
      throw new Error('Failed to request revision');
    }

    return data;
  }

  // Get admin notifications
  static async getAdminNotifications(): Promise<AdminNotification[]> {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }

    return data || [];
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Get audit log entries
  static async getAuditLog(
    itemType?: string,
    action?: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit log:', error);
      throw new Error('Failed to fetch audit log');
    }

    return data || [];
  }

  // Bulk approve items
  static async bulkApproveItems(
    itemIds: string[],
    itemTable: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<boolean[]> {
    const results = await Promise.allSettled(
      itemIds.map(id => 
        this.approveItem(id, itemTable, reviewedBy, reviewNotes)
      )
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  // Bulk reject items
  static async bulkRejectItems(
    itemIds: string[],
    itemTable: string,
    reviewedBy: string,
    rejectionReason: string,
    reviewNotes?: string
  ): Promise<boolean[]> {
    const results = await Promise.allSettled(
      itemIds.map(id => 
        this.rejectItem(id, itemTable, reviewedBy, rejectionReason, reviewNotes)
      )
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  // Get approval statistics
  static async getApprovalStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    needs_revision: number;
  }> {
    const { data, error } = await supabase
      .from('review_requests')
      .select('status');

    if (error) {
      console.error('Error fetching approval stats:', error);
      throw new Error('Failed to fetch approval statistics');
    }

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      needs_revision: 0
    };

    data?.forEach(item => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++;
      }
    });

    return stats;
  }

  // Create a notification for admin
  static async createNotification(
    type: string,
    title: string,
    message: string,
    data?: any,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .insert({
        type,
        title,
        message,
        data,
        priority
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }
} 