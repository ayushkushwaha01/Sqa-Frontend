import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-add-parts-familypop',
  templateUrl: './add-parts-familypop.component.html',
  styleUrls: ['./add-parts-familypop.component.scss']
})
export class AddPartsFamilypopComponent implements OnInit {

  isEditMode: boolean = false;

  isDragOver = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  myGroup!: FormGroup;



  constructor(
    public _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddPartsFamilypopComponent>,
    private _setupService: SetupService, private alertService: AlertService) {
  }


  ngOnInit() {
    console.log('Received data in AddPartCategoryComponent:', this.data);
    if (this.data) {
      this.formInit(this.data);
    }
    else {
      this.formInit(null);
    }
  }

  formInit(data: any) {
    this.myGroup = this._fb.group({
      PartFamilyId: [data?.partFamilyId || 0],

      PartFamilyName: [
        data?.partFamilyName || '',
        Validators.required
      ],

      PartFamilyCode: [
        data?.partFamilyCode || '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]{5}$')
        ]
      ]
    });

    console.log(this.myGroup.value);
  }
  get f() { return this.myGroup.controls }


  UpsertPartFamily() {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }

    this._setupService.upsertPartFamily(this.myGroup.value)
      .subscribe((data: any) => {

        if (data.success) {
          this.alertService.createAlert(data.message, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(data.message, 0);
        }

      });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (!this.selectedFile) {
      console.warn('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    console.log('Saving with file:', this.selectedFile.name);

    this.dialogRef.close({ file: this.selectedFile });
  }

}