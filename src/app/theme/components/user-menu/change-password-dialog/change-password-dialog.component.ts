import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {

  form: FormGroup;
  isSubmitting = false;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.alertService.createAlert('New Password and Confirm Password do not match', 0);
      return;
    }

    this.isSubmitting = true;
    const userId = parseInt(localStorage.getItem('UserId') || '0', 10);

    const payload = {
      userId: userId,
      newPassword: newPassword
    };

    this.api.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success) {
          this.alertService.createAlert(res.message || 'Password changed successfully', 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message || 'Failed to change password', 0);
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Error changing password', err);
        this.alertService.createAlert(err?.error?.message || 'Server error while changing password', 0);
      }
    });
  }
}
