import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderService } from 'src/app/shared/page-header.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';

export interface NotificationItem {
  id: number;
  auditType: 'Process Audit' | 'Parts Audit' | 'Help Desk';
  date: string;
  commodity: string;
  category: string;
  issue?: string;
  partFamily?: string;
  parameter?: string;
  severity: 'Critical' | 'Important' | 'Medium' | 'Low';
  isRead: boolean;
  sender?: string;
  moduleName?: string;
  description?: string;
}

@Component({
  selector: 'app-notifications-inbox',
  templateUrl: './notifications-inbox.component.html',
  styleUrls: ['./notifications-inbox.component.scss']
})
export class NotificationsInboxComponent implements OnInit, OnDestroy {

  activeSection: 'notifications' | 'mails' = 'mails';
  selectedItem: NotificationItem | null = null;
  searchQuery: string = '';

  notificationsList: NotificationItem[] = [];

  constructor(
    private api: ManageUsersService,
    private location: Location,
    private router: Router,
    private pageHeaderService: PageHeaderService
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/app/sqm']);
    }
  }

  fetchData(): void {
    const storedUserId = localStorage.getItem('UserId');
    const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;
    const currentUserType = localStorage.getItem('UserType') || 'Internal';

    if (currentUserId === 0) return;

    this.api.getHelpDeskNotifications(currentUserId, currentUserType).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const liveTickets: NotificationItem[] = res.data.map((log: any) => {
            return {
              id: log.ticketId,
              auditType: 'Help Desk',
              date: new Date(log.createdDate).toLocaleDateString(),
              commodity: 'System',
              category: 'Support',
              sender: log.userName || 'Unknown User',
              moduleName: log.moduleName || 'General',
              issue: log.subject || 'Help Desk Ticket',
              description: log.description || '',
              severity: 'Medium',
              isRead: false
            };
          });

          this.notificationsList = liveTickets;
          this.autoSelectFirst();
        }
      },
      error: (err) => {
        console.error('Failed to fetch help desk logs', err);
      }
    });
  }

  setSection(section: 'notifications' | 'mails'): void {
    this.activeSection = section;
    this.autoSelectFirst();
  }

  autoSelectFirst(): void {
    const filtered = this.filteredItems;
    if (filtered.length > 0) {
      this.selectItem(filtered[0]);
    } else {
      this.selectedItem = null;
    }
  }

  selectItem(item: NotificationItem): void {
    this.selectedItem = item;
    item.isRead = true;
  }

  get filteredItems(): NotificationItem[] {
    return this.notificationsList.filter(item => {
      // 2 Section filtering: 'notifications' (Process/Parts/System) vs 'mails' (Help Desk)
      if (this.activeSection === 'notifications' && item.auditType === 'Help Desk') {
        return false;
      }
      if (this.activeSection === 'mails' && item.auditType !== 'Help Desk') {
        return false;
      }

      // Search query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const text = `${item.auditType} ${item.commodity} ${item.category} ${item.issue || ''} ${item.sender || ''} ${item.moduleName || ''} ${item.parameter || ''} ${item.description || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }

  get notificationCount(): number {
    return this.notificationsList.filter(i => i.auditType !== 'Help Desk').length;
  }

  get mailCount(): number {
    return this.notificationsList.filter(i => i.auditType === 'Help Desk').length;
  }
}