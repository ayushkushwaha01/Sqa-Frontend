import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-state',
  templateUrl: './add-state.component.html',
  styleUrls: ['./add-state.component.scss']
})
export class AddStateComponent implements OnInit {




  ngOnInit(): void {
  }


  isEditMode: boolean = false;

  selectedCommodity: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }



  close(): void {
    this.dialogRef.close();
  }

}
