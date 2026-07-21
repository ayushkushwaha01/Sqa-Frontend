import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartsFamilypopComponent } from './add-parts-familypop/add-parts-familypop.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { PartsFamilyPopComponent } from '../defects-master/parts-family-pop/parts-family-pop.component';

@Component({
  selector: 'app-parts-families',
  templateUrl: './parts-families.component.html',
  styleUrls: ['./parts-families.component.scss']
})
export class PartsFamiliesComponent implements OnInit {

  showFilters: boolean = false;
  selectedCategory: string | null = null;
  selectedStatus: string = '';
  selectedKeyword: any;
  filterForm!: FormGroup;

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  
  partsFamilies: any[] = [];
  tableLists: any[] = [];
  
  // Variables for Defects tracking
  allDefectsMaster: any[] = []; 
  totalDefectsCount: number = 0; 

  constructor(
    private dialog: MatDialog,
    private alertService: AlertService, 
    private _setupService: SetupService, 
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.formInit();
    this.getAllDefectsList();
    this.getPartsFamilies();
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.getPartsFamilies();
  }

  // --- Data Fetching ---
  getAllDefectsList() {
    this._setupService.getDefects().subscribe((res: any) => {
      if (res.success) {
        this.allDefectsMaster = res.data;
        this.totalDefectsCount = this.allDefectsMaster.length;
      }
    });
  }

  getPartsFamilies() {
    this._setupService.getPartFamilies(this.filterForm.value).subscribe((res: any) => {
      if (res.success) {
        this.partsFamilies = res.data.data;
        this.totalSize = res.data.totalRecords;
        this.tableLists = this.partsFamilies.slice(this.fromIndex, this.pageSize);
      }
    });
  }

  // --- Pagination ---
  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;
    this.tableLists = this.partsFamilies.slice(this.fromIndex, this.fromIndex + this.pageSize);
  }

  fnHandlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPageData();
  }

  // --- Defect Pop-up Logic ---
  getDefectsCount(item: any): number {
    // Check for both lowercase and uppercase 'D' just in case of C# serialization differences
    const defectsData = item.defects || item.Defects;
    
    if (!defectsData) return 0;

    // If the data is already an array (parsed automatically by Angular HttpClient)
    if (Array.isArray(defectsData)) return defectsData.length;

    // If the data is a raw JSON string
    try {
      const parsed = JSON.parse(defectsData);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch (e) {
      console.error("Failed to parse defects:", defectsData);
      return 0; 
    }
  }

  openDefectsPopup(item: any) {
    let currentSelectedIds: number[] = [];
    const defectsData = item.defects || item.Defects;

    if (defectsData) {
      try {
        currentSelectedIds = Array.isArray(defectsData) ? defectsData : JSON.parse(defectsData);
      } catch (e) {
        currentSelectedIds = [];
      }
    }

    const dialogRef = this.dialog.open(PartsFamilyPopComponent, {
      width: '550px',
      disableClose: true,
      data: {
        fullItem: item,
        allDefects: this.allDefectsMaster,
        selectedIds: currentSelectedIds
      }
    });

    dialogRef.afterClosed().subscribe((needsRefresh: boolean) => {
      if (needsRefresh) {
        this.getPartsFamilies();
      }
    });
  }

  // --- CRUD Operations ---
  addPartFamily(data: any) {
    const dialogRef = this.dialog.open(AddPartsFamilypopComponent, {
      width: '650px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPartsFamilies();
      }
    });
  }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this._setupService.deletePartFamily(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsFamilies();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  changeStatus(item: any) {
    let dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Change Status Confirmation', content: 'Are you sure you want to change the status?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this._setupService.changeStatusPartFamily(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsFamilies();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
}