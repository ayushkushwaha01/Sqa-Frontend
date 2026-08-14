import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-demerit-master',
  templateUrl: './demerit-master.component.html',
  styleUrls: ['./demerit-master.component.scss']
})
export class DemeritMasterComponent implements OnInit {

  //originalData: VendorRating[] = [];


  constructor(
    private dialog: MatDialog,
    private setupService: SetupService,
    private AlertService: AlertService
  ) { }

  tableData: any[] = [];

  ngOnInit(): void {

    this.getDemeritMaster();

  }

  getDemeritMaster() {

    this.setupService.getDemeritMaster({})
      .subscribe((res: any) => {

        if (res.success) {

          this.tableData = res.data.data;

        }

      });

  }

  saveDemerit(item: any) {

    const payload = {
      ...item,
      demerit: item.demerit != null
        ? Number(item.demerit)
        : null,
      description: item.description || ''
    };

    this.setupService.upsertDemeritMaster(payload)
      .subscribe((res: any) => {

        if (res.success) {

          this.AlertService.createAlert(
            res.message,
            1
          );

          this.getDemeritMaster();

        } else {

          this.AlertService.createAlert(
            res.message,
            0
          );

        }

      });
  }
}
