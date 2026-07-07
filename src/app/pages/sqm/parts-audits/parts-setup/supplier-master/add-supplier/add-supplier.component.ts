import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.scss']
})
export class AddSupplierComponent implements OnInit {



  ngOnInit(): void {
  }


  isEditMode: boolean = false;

  selectedCommodity: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }



  close(): void {
    this.dialogRef.close();
  }
  states: string[] = [
    'Telangana',
    'Andhra Pradesh',
    'Karnataka',
    'Tamil Nadu',
    'Maharashtra'
  ];

  cities: string[] = [
    'Hyderabad',
    'Bengaluru',
    'Chennai',
    'Mumbai',
    'Pune'
  ];
}
