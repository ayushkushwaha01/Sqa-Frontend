import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { PageHeaderService } from '../../shared/page-header.service';
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service';
import { AlertService } from 'src/app/shared/alert.service'; // 🔥 1. Add this import

// Import your dialog components here (adjust relative paths as needed)
import { PauditsNewAuditComponent } from './process-audits/paudits-new-audit/paudits-new-audit.component';
import { NewAuditComponent as PartsNewAuditComponent } from './parts-audits/new-audit/new-audit.component';
import { PauditsHelpDeskComponent } from './process-audits/paudits-help-desk/paudits-help-desk.component';
import { DefectsPopComponent } from './inspection/inspection-datatable/defects-pop/defects-pop.component';
import { AddRecordPopComponent } from './inspection/add-record-pop/add-record-pop.component';
import { DefectsPopMasterComponent } from './inspection/inspection-datatable/defects-pop-master/defects-pop-master.component';

@Component({
  selector: 'app-sqm',
  templateUrl: './sqm.component.html',
  styleUrls: ['./sqm.component.scss']
})
export class SqmComponent implements OnInit, OnDestroy {
  hideSidebar = false;
  isSidenavOpen = true;
  activeTab = 'sqmd'; // Can be 'sqmd', 'process', or 'parts'

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pageHeaderService: PageHeaderService,
    private alertService: AlertService
  ) {}


  canRead(screenId: number): boolean {
    return UserPermissionService.fnGetReadPermissions(screenId);
  }

  canCreate(screenId: number): boolean {
    return UserPermissionService.fnGetCreatePermissions(screenId);
  }

  ngOnInit(): void {
    // Check initial route
    this.updateLayout(this.router.url);

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateLayout(event.urlAfterRedirects);
      });
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
    this.updateSidenavWidth();
  }

  // Pass the module string from the template to open the correct dialog
  // openaudit(module: string) {
  //   if (module === 'process') {
  //     this.dialog.open(PauditsNewAuditComponent, { width: '600px', height: 'auto' });
  //   } else if (module === 'parts') {
  //     this.dialog.open(PartsNewAuditComponent, { width: '600px', height: 'auto' });
  //   }
  // }


  showAccessDenied(action: string) {
    this.alertService.createAlert(`Access Denied: You do not have permission to ${action}.`, 0);
  }

  // 🔥 4. Update your openaudit function to check permission first
  openaudit(module: string, screenId: number) {
    if (!this.canCreate(screenId)) {
      this.alertService.createAlert('Access Denied: You do not have permission to create a New Audit.', 0);
      return; // Stop them from opening the dialog!
    }

    if (module === 'process') {
      this.dialog.open(PauditsNewAuditComponent, { width: '600px', height: 'auto' });
    } else if (module === 'parts') {
      this.dialog.open(PartsNewAuditComponent, { width: '600px', height: 'auto' });
    }
  }

  openUserManual(fileName: string): void {
    window.open(`assets/${fileName}`, '_blank');
  }

  openHelpDesk() {
    this.dialog.open(PauditsHelpDeskComponent, { width: '600px', height: '350px' });
  }

  // Inside SqmComponent class
  updateLayout(url: string) {
    // Hide sidebar entirely for specific inner screens
    this.hideSidebar = url.includes('reference') || url.includes('details') || url.includes('inspect-inner-screen');

    let newTab = 'sqmd';
    if (url.includes('/setup')) {
      newTab = 'setup';
    } else if (url.includes('/process')) {
      newTab = 'process';
    } else if (url.includes('/parts')) {
      newTab = 'parts';
    } else if (url.includes('/inspection') || url.includes('/inspect-inner-screen')) { 
      newTab = 'inspection';
    }

    // Auto-set isSidenavOpen when the TAB changes
    if (newTab !== this.activeTab) {
      if (newTab === 'sqmd') { 
        this.isSidenavOpen = false;
      } else {
        // Show sidenav for Process, Parts, Inspection AND Setup
        this.isSidenavOpen = !this.hideSidebar;
      }
    }

    // Always hide if sidebar is forcibly hidden by inner routes
    if (this.hideSidebar) {
      this.isSidenavOpen = false;
    }

    this.activeTab = newTab;
    this.cdr.detectChanges();
    this.updateSidenavWidth();
  }

  ngOnDestroy(): void {
    this.pageHeaderService.setSidenavWidth(0);
  }

  private updateSidenavWidth(): void {
    let width = 0;
    if (this.activeTab !== 'sqmd' && !this.hideSidebar) {
      width = this.isSidenavOpen ? 200 : 52;
    }
    this.pageHeaderService.setSidenavWidth(width);
  }

  openheatmapname() {
    this.dialog.open(DefectsPopMasterComponent, { width: '1400px', height: 'auto' });
  }

  addrecordpop(item: any) {
    if (!this.canCreate(27)) {
      this.alertService.createAlert('Access Denied: You do not have permission to add a new record.', 0);
      return; 
    }
    
    this.dialog.open(AddRecordPopComponent, {
      width: '1000px',
      height: 'auto',
      data: item 
    });
  }
}