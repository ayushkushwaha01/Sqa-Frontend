import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddDefectsPopComponent } from './add-defects-pop/add-defects-pop.component';
 import { MatTableDataSource } from '@angular/material/table';
import { SetupService } from 'src/app/pages/setup/setup.service';

@Component({
  selector: 'app-defects-master',
  templateUrl: './defects-master.component.html',
  styleUrls: ['./defects-master.component.scss']
})
export class DefectsMasterComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  allData: any[] = [];
  showFilters: boolean = false; 
  keyword: string = '';

  constructor(private dialog: MatDialog, private api: SetupService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.api.getDefects().subscribe((res: any) => {
      if (res.success) {
        this.allData = res.data;
        this.dataSource.data = this.allData;
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  filterData() {
    const key = this.keyword.toLowerCase();
    this.dataSource.data = this.allData.filter(x => 
      x.defectName.toLowerCase().includes(key)
    );
  }

  clearFilter() {
    this.keyword = '';
    this.dataSource.data = this.allData;
  }

  adddefects(data: any) {
    let dialogRef = this.dialog.open(AddDefectsPopComponent, {
      width: '600px',
      height: 'auto',
      data: data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Refresh grid on save
      }
    });
  }

  openEditDialog(item: any) {
    this.adddefects(item);
  }

  deleteConfirmation(item: any) {
    if(confirm('Are you sure you want to delete this defect?')) {
      this.api.deleteDefect({ defectId: item.defectId }).subscribe((res: any) => {
        if (res.success) {
          this.loadData(); // Refresh grid after delete
        }
      });
    }
  }
}