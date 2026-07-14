import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPartsFamilypopComponent } from './add-parts-familypop/add-parts-familypop.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-parts-families',
  templateUrl: './parts-families.component.html',
  styleUrls: ['./parts-families.component.scss']
})
export class PartsFamiliesComponent implements OnInit {

  showFilters: boolean = false;
  selectedCategory: string | null = null;
  selectedStatus: string = '';

  tableData = [
    { name: 'Engine Components', code: 'PF001', status: 'Active', parameters: 12 },
    { name: 'Transmission Systems', code: 'PF002', status: 'Active', parameters: 8 },
    { name: 'Chassis and Frame', code: 'PF003', status: 'Inactive', parameters: 0 },
    { name: 'Suspension Parts', code: 'PF004', status: 'Active', parameters: 15 },
    { name: 'Electrical Systems', code: 'PF005', status: 'Inactive', parameters: 0 },
    { name: 'Braking Systems', code: 'PF006', status: 'Active', parameters: 10 },
    { name: 'Body and Cabin', code: 'PF007', status: 'Active', parameters: 20 },
    { name: 'Fuel Systems', code: 'PF008', status: 'Inactive', parameters: 0 },
    { name: 'Cooling Systems', code: 'PF009', status: 'Active', parameters: 12 },
    { name: 'Steering Systems', code: 'PF010', status: 'Active', parameters: 8 }
  ];
  selectedKeyword: any;


  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];

  constructor(private dialog: MatDialog,
    private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
  ) { }

  filterForm!: FormGroup;
  ngOnInit(): void {
    this.formInit();
    this.getPartsFamilies();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClear(): void {
    this.selectedCategory = null;
    this.selectedStatus = '';
  }

  onGo(): void {
    console.log('Filters Applied:', { category: this.selectedCategory, status: this.selectedStatus });
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }
  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.getPartsFamilies();
  }

  addPartFamily(data: any) {
    const dialogRef = this.dialog.open(AddPartsFamilypopComponent, {
      width: '650px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPartsFamilies();   // Reload the grid/list
      }
    });
  }
  partsFamilies: any[] = [];
  getPartsFamilies() {
    this._setupService.getPartFamilies(this.filterForm.value)
      .subscribe((res: any) => {
        if (res.success) {

          this.partsFamilies = res.data.data;
          this.totalSize = res.data.totalRecords;

          this.tableLists = this.partsFamilies.slice(
            this.fromIndex,
            this.pageSize
          );
        }
      });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.partsFamilies.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }
  fnHandlePage(event: any) {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadPageData();
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
