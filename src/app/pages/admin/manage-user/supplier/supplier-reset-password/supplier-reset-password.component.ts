import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManageUsersService } from '../../manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-supplier-reset-password',
  templateUrl: './supplier-reset-password.component.html',
  styleUrls: ['./supplier-reset-password.component.scss']
})
export class SupplierResetPasswordComponent implements OnInit {

  myform: FormGroup;
  isSubmitting = false;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<SupplierResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.myform = this.fb.group({
      SupplierId: new FormControl(this.data ? this.data.supplierId : null),
      Password: new FormControl(null, Validators.compose([Validators.required])),
      UserPassword: new FormControl(null, Validators.compose([Validators.required]))
    });
  }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }

  saveData() {
    if (this.myform.valid) {
      let password = this.myform.controls['Password'].value;
      let confirmPassword = this.myform.controls['UserPassword'].value;

      if (password !== confirmPassword) {
        this.alertService.createAlert('Passwords do not match', 0);
        return;
      }

      this.isSubmitting = true;

      let payload = {
        supplierId: this.myform.value.SupplierId,
        newPassword: password
      };

      this.api.resetSupplierPassword(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);
          } else {
            this.alertService.createAlert(res.message, 0);
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.alertService.createAlert("Server Error while resetting password", 0);
        }
      });

    } else {
      this.myform.markAllAsTouched();
    }
  }
}
