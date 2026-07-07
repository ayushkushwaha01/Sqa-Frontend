import { Component, OnInit } from '@angular/core';
import { AddCityComponent } from './add-city/add-city.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-city-master',
  templateUrl: './city-master.component.html',
  styleUrls: ['./city-master.component.scss']
})
export class CityMasterComponent implements OnInit {



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
        City: 'Hyderabad',
        Status: 'Active'
      },
      {
        State: 'Andhra Pradesh',
        City: 'Vijayawada',
        Status: 'Inactive'
      },
      {
        State: 'Karnataka',
        City: 'Bengaluru',
        Status: 'Active'
      },
      {
        State: 'Tamil Nadu',
        City: 'Chennai',
        Status: 'Inactive'
      },
      {
        State: 'Maharashtra',
        City: 'Mumbai',
        Status: 'Active'
      }
    ];
  }

  addSupplier(data: any) {
    this.dialog.open(AddCityComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });
  }


}
