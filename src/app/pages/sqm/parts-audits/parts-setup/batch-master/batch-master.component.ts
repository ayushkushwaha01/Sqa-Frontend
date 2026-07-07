import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddBatchPopComponent } from './add-batch-pop/add-batch-pop.component';

@Component({
  selector: 'app-batch-master',
  templateUrl: './batch-master.component.html',
  styleUrls: ['./batch-master.component.scss']
})
export class BatchMasterComponent implements OnInit {

  mockdata: any[] = [];
  showFilters: boolean = false;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.generateMockData();
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
    this.dialog.open(AddBatchPopComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });
  }

  openEditDialog(item: any) {
    console.log('Edit clicked for:', item);
    // Add logic here to open the popup with existing data
  }

  deleteConfirmation(item: any) {
    console.log('Delete clicked for:', item);
    // Add delete logic here
  }

  archiveRecord(item: any) {
    console.log('Archive clicked for:', item);
    // Add archive logic here
  }

}