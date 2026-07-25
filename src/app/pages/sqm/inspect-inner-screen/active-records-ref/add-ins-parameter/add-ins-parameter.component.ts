import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-ins-parameter',
  templateUrl: './add-ins-parameter.component.html',
  styleUrls: ['./add-ins-parameter.component.scss']
})
export class AddInsParameterComponent implements OnInit {

  isEditMode: boolean = false;
  localData: any = {}; 

  constructor(
    public dialogRef: MatDialogRef<AddInsParameterComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data) {
      this.isEditMode = true;
      this.localData = { ...this.data }; // This clones the object including 'special' if passed from ActiveRecordsRefComponent
    } else {
      this.isEditMode = false;
      this.localData = {}; 
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.localData);
  }
}