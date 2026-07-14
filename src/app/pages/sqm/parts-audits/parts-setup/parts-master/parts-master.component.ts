import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { AddPartspopComponent } from './add-partspop/add-partspop.component';
import { PartsMasterSuppliersComponent } from './parts-master-suppliers/parts-master-suppliers.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-parts-master',
  templateUrl: './parts-master.component.html',
  styleUrls: ['./parts-master.component.scss']
})
export class PartsMasterComponent implements OnInit {

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  selectedKeyword: any;




  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];

  constructor(private dialog: MatDialog,
    private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
  ) { }



  ngOnInit(): void {
    this.formInit();
    this.getPartsMasters();

    this.updatePage();
  }


  pageIndex = 0;

  showFilters = false;

  selectedIndustry: string = '';
  selectedStatus: string = '';

  pagedData: any[] = [];
  filteredData: any[] = [];
  filterForm!: FormGroup;
  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }
  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.getPartsMasters();
  }





  partsMasters: any[] = [];
  getPartsMasters() {
    this._setupService.getPartMaster(this.filterForm.value)
      .subscribe((res: any) => {
        if (res.success) {

          this.partsMasters = res.data.data;
          this.totalSize = res.data.totalRecords;

          this.tableLists = this.partsMasters.slice(
            this.fromIndex,
            this.pageSize
          );
        }
      });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.partsMasters.slice(
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
        this._setupService.deletePartMaster(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsMasters();
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
        this._setupService.changeStatusPartMaster(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsMasters();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
  toggleFilters(): void {

    this.showFilters = !this.showFilters;
  }


  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.updatePage();
  }

  updatePage(): void {

    const start = this.pageIndex * this.pageSize;

    this.pagedData = this.filteredData.slice(
      start,
      start + this.pageSize
    );
  }

  scrollLeft(): void {

    this.tableContainer?.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {

    this.tableContainer?.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  }

  addpart(data: any): void {

    this.dialog.open(AddPartspopComponent, {
      width: '650px',
      disableClose: true,
      data: data
    });
  }




  opensuppliers() {
    this.dialog.open(PartsMasterSuppliersComponent, {
      width: '650px',
      disableClose: true,
      data: null
    });
  }
}