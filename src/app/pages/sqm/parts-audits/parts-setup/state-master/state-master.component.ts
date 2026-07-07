import { Component, OnInit } from '@angular/core';
import { AddStateComponent } from './add-state/add-state.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-state-master',
  templateUrl: './state-master.component.html',
  styleUrls: ['./state-master.component.scss']
})
export class StateMasterComponent implements OnInit {



  mockdata: any[] = [];

  showFilters: boolean = false;



  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.generateMockData();
  }

  generateMockData() {
    this.mockdata = [
      {
        State: 'Telangana',
        Status: 'Active'
      },
      {
        State: 'Andhra Pradesh',
        Status: 'Inactive'
      },
      {
        State: 'Karnataka',
        Status: 'Active'
      },
      {
        State: 'Tamil Nadu',
        Status: 'Inactive'
      },
      {
        State: 'Maharashtra',
        Status: 'Active'
      }
    ];
  }

  addSupplier(data: any) {
    this.dialog.open(AddStateComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });
  }



}
