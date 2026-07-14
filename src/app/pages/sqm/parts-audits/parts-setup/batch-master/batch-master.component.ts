import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddBatchPopComponent } from './add-batch-pop/add-batch-pop.component';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-batch-master',
  templateUrl: './batch-master.component.html',
  styleUrls: ['./batch-master.component.scss']
})
export class BatchMasterComponent implements OnInit {

  mockdata: any[] = [];
  showFilters: boolean = false;

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
    this.getBatchMaster();
    this.generateMockData();
  }




  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }
  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.getBatchMaster();
  }

  BatchMasters: any[] = [];
  getBatchMaster() {
    this._setupService.getBatchMaster(this.filterForm.value)
      .subscribe((res: any) => {
        if (res.success) {

          this.BatchMasters = res.data.data;
          this.totalSize = res.data.toatalRecords;

          this.tableLists = this.BatchMasters.slice(
            this.fromIndex,
            this.pageSize
          );
        }
      });
  }

  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.BatchMasters.slice(
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
        this._setupService.deleteBatchMaster(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getBatchMaster();
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
        this._setupService.ChangeStatus(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getBatchMaster();
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

  generateMockData() {
    this.mockdata = [
      {
        PartFamily: 'Engine Components',
        PartName: 'Air Filter',
        BatchNumber: 'BCH-2026-001',
        BatchDate: '01/06/2026',
        Remarks: 'Passed quality inspection successfully.'
      },
      {
        PartFamily: 'Engine Components',
        PartName: 'Oil Filter',
        BatchNumber: 'BCH-2026-002',
        BatchDate: '03/06/2026',
        Remarks: 'Minor wear detected during testing. Requires review.'
      },
      {
        PartFamily: 'Braking System',
        PartName: 'Brake Pad',
        BatchNumber: 'BCH-2026-003',
        BatchDate: '05/06/2026',
        Remarks: 'Brake performance test completed successfully.'
      },
      {
        PartFamily: 'Engine Components',
        PartName: 'Fuel Pump',
        BatchNumber: 'BCH-2026-004',
        BatchDate: '08/06/2026',
        Remarks: 'Pressure standards meet required specifications.'
      },
      {
        PartFamily: 'Electrical',
        PartName: 'Starter Motor',
        BatchNumber: 'BCH-2026-005',
        BatchDate: '10/06/2026',
        Remarks: 'Electrical connectors verified and approved.'
      }
    ];
  }

  addbatchpop(data: any) {

    const dialogRef = this.dialog.open(AddBatchPopComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.getBatchMaster();
      }

    });
  }

  openEditDialog(item: any) {
    console.log('Edit clicked for:', item);
    // Add logic here to open the popup with existing data
  }



  archiveRecord(item: any) {
    console.log('Archive clicked for:', item);
    // Add archive logic here
  }

}