import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

interface Notification {
  id: number;
  auditType: 'Process Audit' | 'Parts Audit';
  date: string;
  commodity: string;
  category: string;
  issue?: string; // Process Audit specific
  partFamily?: string; // Parts Audit specific
  parameter?: string; // Parts Audit specific
  severity: 'Critical' | 'Important' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-user-notification',
  templateUrl: './user-notification.component.html',
  styleUrls: ['./user-notification.component.scss']
})
export class UserNotificationComponent implements OnInit {

  @ViewChild('notificationMenuTrigger') notificationMenuTrigger!: MatMenuTrigger;

  notifications: Notification[] = [
//     Process Audit 06/07/2026
// Commodity - Casting, Category - QMS, No machine readings, Severity - Critical

    {
      id: 1,
      auditType: 'Process Audit',
      date: '06/07/2026',
      commodity: 'Casting',
      category: 'QMS',
      issue: 'No machine readings',
      severity: 'Critical'
    },
    {
      id: 2,
      auditType: 'Parts Audit',
      date: '01/07/2026',
      commodity: 'Forging',
      category: 'DIM',
      partFamily: 'Crank Shaft',
      parameter: 'Outer Diameter',
      severity: 'Important'
    },
    {
      id: 3,
      auditType: 'Process Audit',
      date: '05/07/2026',
      commodity: 'Machining',
      category: 'SPC',
      issue: 'Process variation detected',
      severity: 'Important'
    },
    {
      id: 4,
      auditType: 'Parts Audit',
      date: '03/07/2026',
      commodity: 'Fasteners',
      category: 'TOL',
      partFamily: 'Bolt Assembly',
      parameter: 'Thread Pitch',
      severity: 'Medium'
    },
    {
      id: 5,
      auditType: 'Process Audit',
      date: '02/07/2026',
      commodity: 'Sheet Metal',
      category: 'WLD',
      issue: 'Weld quality issues',
      severity: 'Critical'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications = [];
  }

  /**
   * Close notification menu
   */
  closeNotificationMenu(): void {
    if (this.notificationMenuTrigger) {
      this.notificationMenuTrigger.closeMenu();
    }
  }

  /**
   * Get critical notifications count
   */
  getCriticalCount(): number {
    return this.notifications.filter(n => n.severity === 'Critical').length;
  }

  /**
   * Get process audit count
   */
  getProcessAuditCount(): number {
    return this.notifications.filter(n => n.auditType === 'Process Audit').length;
  }

  /**
   * Get parts audit count
   */
  getPartsAuditCount(): number {
    return this.notifications.filter(n => n.auditType === 'Parts Audit').length;
  }

  /**
   * Get notifications by severity
   */
  getNotificationsBySeverity(severity: string): Notification[] {
    return this.notifications.filter(n => n.severity === severity);
  }

  /**
   * Delete single notification
   */
  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Mark notification as read (optional)
   */
  markAsRead(id: number): void {
    // Implement if needed
  }

  /**
 * Build single-line summary text for a notification
 */
getNotificationSummary(notification: Notification): string {
  const parts: string[] = [
    `Commodity - ${notification.commodity}`,
    `Category - ${notification.category}`
  ];

  if (notification.auditType === 'Process Audit') {
    parts.push(notification.issue || '');
  } else {
    parts.push(`${notification.partFamily} - ${notification.parameter}`);
  }

  parts.push(`Severity - ${notification.severity}`);

  return parts.join(', ');
}

}