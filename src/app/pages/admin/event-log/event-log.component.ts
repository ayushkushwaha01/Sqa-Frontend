import { PartAuditService } from 'src/app/pages/sqm/parts-audits/part-audit.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import { environment } from 'src/environments/environment';
import { admindata } from '../admindata';
import { UserPermissionService } from '../../helpers/user-permission.service';
import { ManageUsersService } from '../manage-user/manage-users.service';

@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss']
})
export class EventLogComponent implements OnInit {

  sortedData: any;
  tableList: Object[] = [];
  alltableListLookup: any;
  tableListLookup = [];
  public allReports: Array<any> = [];
  // sortedData = [];
  type: any;
  navParameter: any;

  roleDetails: any;
  options = [];
  filteredEvents: any;
  access = {
    btCreate: false,
    btRead: false,
    btUpdate: false,
    btDelete: false
  };
  allRoles: any;
  filteredAlerts = [];
  titleService: any;
  alertService: any;
  service: any;
  canUpdate: boolean = false;

  canRead: boolean = false;
  readonly SCREEN_ID: number = 8;


  constructor(public _menuService: MenuService, private fb: FormBuilder, private ManageUsersService: ManageUsersService,
    private PartAuditService: PartAuditService
  ) {

  }
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this.?';
  public cancelClicked: boolean = false;
  public popoverStatusTitle: string = 'Confirm Status Change';
  public popoverStatusMessage: string = 'Are you sure you want to change status.?';

  name: any;

  public setTitle(newTitle: string) {
    // this.titleService.setTitle(newTitle);
  }


  ngOnInit() {
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.formInit();
    this.getEventLog();
    this.getAllusers();


  }
  filterForm!: FormGroup;

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      EventType: [''],
      userId: [null],
      FromDate: [null],
      ToDate: [null]
    });
  }

  clearFilter() {
    this.filterForm.reset({
      Keyword: '',
      EventType: '',
      userId: null,
      FromDate: null,
      ToDate: null
    });

    this.getEventLog();
  }


  eventDetails: any[] = [];

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 20;

  tableLists: any[] = [];
  filterToggle: boolean = false

  getEventLog() {
    const filter: any = {
      Keyword: this.filterForm.value.Keyword || ''
    };

    const selectedUserId = this.filterForm.value.userId;

    if (selectedUserId !== null && selectedUserId !== undefined && selectedUserId !== '') {
      filter.UserId = Number(selectedUserId);
    }

    if (this.filterForm.value.FromDate) {
      filter.FromDate = this.filterForm.value.FromDate;
    }

    if (this.filterForm.value.ToDate) {
      filter.ToDate = this.filterForm.value.ToDate;
    }

    console.log('Event Log Filter:', filter);

    this.ManageUsersService.getEventLog(filter).subscribe((res: any) => {
      if (res.success) {
        this.eventDetails = res.data.data || [];
        this.totalSize = res.data.totalRecords || 0;

        this.currentPage = 0;
        this.loadPageData();
      }
    });
  }
  allusers: any
  getAllusers() {
    this.PartAuditService.getUserDD()
      .subscribe((res: any) => {
        if (res.success) {
          this.allusers = res.data;

        }
      });
  }
  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.eventDetails.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }
  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadPageData();
  }



}
