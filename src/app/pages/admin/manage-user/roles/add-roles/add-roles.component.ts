import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManageUsersService } from '../../manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';
 
@Component({
  selector: 'app-add-roles',
  templateUrl: './add-roles.component.html',
  styleUrls: ['./add-roles.component.scss']
})
export class AddRolesComponent implements OnInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddRolesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private api: ManageUsersService, // <-- Updated Service Injection
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      roleId: [0],
      roleName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  onlyAlphabets(event: any) {
    const k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 32);
  }

  saveRole(): void {
    if (this.form.valid) {
      this.api.upsertRole(this.form.value).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true); 
          } else {
            this.alertService.createAlert(res.message || 'Something went wrong', 0);
          }
        },
        error: () => this.alertService.createAlert('Server Error', 0)
      });
    }
  }
}