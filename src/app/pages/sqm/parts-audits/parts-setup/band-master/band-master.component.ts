import { AlertService } from 'src/app/shared/alert.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';


export interface VendorRating {
  id: number;
  ratings: string;
  processAuditMinScore: number;
  processAuditMaxScore: number;
  partsAuditMinScore: number;
  partsAuditMaxScore: number;
}

@Component({
  selector: 'app-band-master',
  templateUrl: './band-master.component.html',
  styleUrls: ['./band-master.component.scss']
})
export class BandMasterComponent implements OnInit {

  originalData: VendorRating[] = [];


  constructor(
    private dialog: MatDialog,
    private setupService: SetupService,
    private AlertService: AlertService
  ) { }

  tableData: any[] = [];

  ngOnInit(): void {

    this.getBandMaster();

  }

  getBandMaster() {

    this.setupService.getBandMaster({})
      .subscribe((res: any) => {

        if (res.success) {

          this.tableData = res.data.data;

        }

      });

  }

  saveBand(item: any) {

    const payload = {
      ...item,
      min: item.min.toString(),
      max: item.max.toString()
    };

    this.setupService.upsertBandMaster(payload)
      .subscribe((res: any) => {

        if (res.success) {
          this.AlertService.createAlert(res.message, 1);
          this.getBandMaster();
        }
        else {
          this.AlertService.createAlert(res.message, 0);
        }

      });

  }

}
