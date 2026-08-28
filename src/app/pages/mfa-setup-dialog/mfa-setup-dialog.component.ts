import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/shared/alert.service';
 // Fix the relative path based on where your component actually is!
import { ManageUsersService } from '../admin/manage-user/manage-users.service';
 
@Component({
  selector: 'app-mfa-setup-dialog',
  templateUrl: './mfa-setup-dialog.component.html',
  styleUrls: ['./mfa-setup-dialog.component.scss']
})
export class MfaSetupDialogComponent implements OnInit {

  qrCodeUrl: string = '';
  manualKey: string = '';
  verificationCode: string = '';
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<MfaSetupDialogComponent>,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {}

 ngOnInit(): void {
    // Automatically fetch the QR code when the dialog opens
    this.api.setupAuthenticator().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.qrCodeUrl = res.qrCode;
          this.manualKey = res.manualKey;
        }
        this.isLoading = false;
      },
      error: () => {
        this.alertService.createAlert('Failed to generate QR code.', 0);
        this.isLoading = false;
        this.close();
      }
    });
  } 

  verifyCode() {
    if (!this.verificationCode || this.verificationCode.length < 6) return;

    this.api.verifyAuthenticator({ code: this.verificationCode }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true); // Close and return success
        }
      },
      error: (err) => {
        this.alertService.createAlert(err.error?.message || 'Invalid code. Try again.', 0);
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }

}
