import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManageUsersService } from '../../manage-users.service'; // Adjust path if needed
import { AlertService } from 'src/app/shared/alert.service'; // Adjust path if needed

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.scss']
})
export class ResetPasswordDialogComponent implements OnInit {

  myform: FormGroup;
  isSubmitting = false;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.myform = this.fb.group({
      // We extract the userId directly from the row data passed in from the grid
      UserId: new FormControl(this.data ? this.data.userId : null),
      Password: new FormControl(null, Validators.compose([Validators.required])),
      UserPassword: new FormControl(null, Validators.compose([Validators.required])) // This is the Confirm field
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
      
      // Validation Check
      if (password !== confirmPassword) {
        this.alertService.createAlert('Passwords do not match', 0);
        return; // Stop execution
      } 
      
      this.isSubmitting = true;
      
      // Build the payload matching the C# ResetPasswordDto
      let payload = {
        userId: this.myform.value.UserId,
        newPassword: password
      };

      // Call the API
      this.api.resetPassword(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          if (res.success) {
            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true); // Tell the grid to refresh
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