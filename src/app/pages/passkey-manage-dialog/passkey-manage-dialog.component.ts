import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-passkey-manage-dialog',
  templateUrl: './passkey-manage-dialog.component.html',
  styleUrls: ['./passkey-manage-dialog.component.scss']
})
export class PasskeyManageDialogComponent implements OnInit {
  
  public hasPasskey: boolean = false;
  public passkeyInfo: any = null;
  public isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<PasskeyManageDialogComponent>,
    private api: ManageUsersService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadPasskeyInfo();
  }

  loadPasskeyInfo() {
    this.isLoading = true;
    this.api.getPasskeyInfo().subscribe({
      next: (res: any) => {
        this.hasPasskey = res.hasPasskey;
        if (this.hasPasskey) {
          this.passkeyInfo = res;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  deletePasskey() {
    if(confirm("Are you sure you want to delete this passkey? You will need to use a password to log in.")) {
      this.api.deletePasskey().subscribe({
        next: (res: any) => {
          this.alertService.createAlert(res.message, 1);
          this.hasPasskey = false;
          this.passkeyInfo = null;
        }
      });
    }
  }

  // ==========================================================
  // 🔥 THE FINGERPRINT SCANNER LOGIC (Moved from the menu!)
  // ==========================================================
  public addNewDevice() {
    this.api.setupPasskeyOptions().subscribe({
      next: async (options: any) => {
        try {
          options.challenge = this.base64urlToBuffer(options.challenge);
          options.user.id = this.base64urlToBuffer(options.user.id);
          
          if (options.excludeCredentials) {
            options.excludeCredentials = options.excludeCredentials.map((c: any) => {
              c.id = this.base64urlToBuffer(c.id);
              return c;
            });
          }

          const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
          const responseObj = credential.response as AuthenticatorAttestationResponse;

          const attestationResponse = {
            id: credential.id,
            rawId: this.bufferToBase64url(credential.rawId),
            type: credential.type,
            extensions: credential.getClientExtensionResults(), 
            response: {
              attestationObject: this.bufferToBase64url(responseObj.attestationObject),
              clientDataJson: this.bufferToBase64url(responseObj.clientDataJSON),
              transports: (responseObj as any).getTransports ? (responseObj as any).getTransports() : ['internal']
            }
          };

          this.api.setupPasskeyRegister(attestationResponse).subscribe({
             next: (res: any) => {
               this.alertService.createAlert(res.message, 1);
               this.loadPasskeyInfo(); // Refresh the popup!
             },
             error: (err: any) => this.alertService.createAlert(err.error?.message || 'Passkey setup failed', 0)
          });
        } catch (err) {
           this.alertService.createAlert('Biometric scan cancelled or failed.', 0);
        }
      }
    });
  }

  // --- WebAuthn Helpers ---
  private base64urlToBuffer(base64url: string): ArrayBuffer {
    const padding = '==='.slice((base64url.length + 3) % 4);
    const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray.buffer;
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const charCode of bytes) { str += String.fromCharCode(charCode); }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}