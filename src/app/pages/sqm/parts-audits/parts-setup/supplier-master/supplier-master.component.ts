import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';

@Component({
  selector: 'app-supplier-master',
  templateUrl: './supplier-master.component.html',
  styleUrls: ['./supplier-master.component.scss']
})
export class SupplierMasterComponent implements OnInit {

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
        SupplierName: 'ABC Auto Parts',
        ContactPerson: 'Ravi Kumar',
        State: 'Telangana',
        City: 'Hyderabad',
        Address: '12-4-56, Madhapur, Hyderabad, Telangana - 500081',
        Remarks: 'Preferred supplier for engine components.',
        Status: 'Active'
      },
      {
        SupplierName: 'Prime Motors',
        ContactPerson: 'Suresh Reddy',
        State: 'Karnataka',
        City: 'Bengaluru',
        Address: '45, MG Road, Bengaluru, Karnataka - 560001',
        Remarks: 'Supplies transmission parts.',
        Status: 'Inactive'
      },
      {
        SupplierName: 'ElectroTech Pvt Ltd',
        ContactPerson: 'Anita Sharma',
        State: 'Tamil Nadu',
        City: 'Chennai',
        Address: '18, Anna Salai, Chennai, Tamil Nadu - 600002',
        Remarks: 'Electrical components supplier.',
        Status: 'Active'
      },
      {
        SupplierName: 'Global Components',
        ContactPerson: 'Rahul Verma',
        State: 'Maharashtra',
        City: 'Pune',
        Address: '102, Hinjewadi Phase 1, Pune, Maharashtra - 411057',
        Remarks: 'High-quality body panels.',
        Status: 'Active'
      },
      {
        SupplierName: 'Auto Interiors Ltd',
        ContactPerson: 'Priya Singh',
        State: 'Delhi',
        City: 'New Delhi',
        Address: '78, Connaught Place, New Delhi - 110001',
        Remarks: 'Interior accessories supplier.',
        Status: 'Inactive'
      },
      {
        SupplierName: 'Chassis World',
        ContactPerson: 'Vikram Patel',
        State: 'Gujarat',
        City: 'Ahmedabad',
        Address: '25, SG Highway, Ahmedabad, Gujarat - 380015',
        Remarks: 'Leading chassis manufacturer.',
        Status: 'Active'
      },
      {
        SupplierName: 'Brake Solutions',
        ContactPerson: 'Kiran Rao',
        State: 'Andhra Pradesh',
        City: 'Vijayawada',
        Address: '9-120, Benz Circle, Vijayawada, Andhra Pradesh - 520010',
        Remarks: 'Brake system specialist.',
        Status: 'Active'
      },
      {
        SupplierName: 'Engine Hub',
        ContactPerson: 'Manoj Gupta',
        State: 'Kerala',
        City: 'Kochi',
        Address: '55, Marine Drive, Kochi, Kerala - 682031',
        Remarks: 'Reliable engine parts supplier.',
        Status: 'Inactive'
      }
    ];
  }

  addSupplier(data: any) {
    this.dialog.open(AddSupplierComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });
  }

}