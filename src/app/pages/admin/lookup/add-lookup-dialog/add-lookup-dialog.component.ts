import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LookupService } from '../lookup.service'; // Adjust path
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-add-lookup-dialog',
  templateUrl: './add-lookup-dialog.component.html',
  styleUrls: ['./add-lookup-dialog.component.scss']
})
export class AddLookupDialogComponent implements OnInit {
  isEditMode: boolean = false;
  lookupId: number = 0;
  form: FormGroup;
  codeMasters: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddLookupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: LookupService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      codeId: [null, Validators.required],
      lookupName: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.codeMasters = this.data.codeMasters; // Receive dropdown list from parent

    if (this.data.item) {
      this.isEditMode = true;
      this.lookupId = this.data.item.lookupId;
      this.form.patchValue({
        codeId: this.data.item.codeId,
        lookupName: this.data.item.lookupName
      });
    }
  }

  saveLookup() {
    if (this.form.valid) {
      const payload = {
        lookupId: this.lookupId,
        codeId: this.form.value.codeId,
        lookupName: this.form.value.lookupName
      };

      this.api.upsertLookup(payload).subscribe((res: any) => {
        if (res.success) {
          const successMessage = res.message || (this.isEditMode ? 'Lookup updated successfully.' : 'Lookup added successfully.');
          this.alertService.createAlert(successMessage, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message || 'Failed to save lookup.', 0);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close(): void { this.dialogRef.close(false); }
}