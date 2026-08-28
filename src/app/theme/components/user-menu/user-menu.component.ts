// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { Router } from '@angular/router';
// import { MatDialog } from '@angular/material/dialog';
// import { ResetPasswordDialogComponent } from 'src/app/pages/admin/manage-user/users/reset-password-dialog/reset-password-dialog.component';

// @Component({
//   selector: 'app-user-menu',
//   templateUrl: './user-menu.component.html',
//   styleUrls: ['./user-menu.component.scss'],
//   encapsulation: ViewEncapsulation.None,
// })
// export class UserMenuComponent implements OnInit {
//   public userImage = '../assets/img/users/user.jpg';
  
//    public userName: string = 'User';
//   public userType: string = 'Role';

//   constructor(
//     private router: Router,
//     private dialog: MatDialog
//   ) { }

//   ngOnInit() {
//      this.userName = localStorage.getItem('UserName') || 'Guest';
//     this.userType = localStorage.getItem('UserType') || 'User';
//   }

 
//    openChangePassword() {
//      const currentUserId = localStorage.getItem('UserId'); 

//     this.dialog.open(ResetPasswordDialogComponent, {
//       width: '550px',
//       data: { 
//         userId: currentUserId, 
//         isSelfChange: true  
//       }
//     });
//   }

  
//   public logout() {
//     localStorage.clear();
//     sessionStorage.clear();
    
    
//     window.location.href = '/#/login';
//   }

  
// }


import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordDialogComponent } from 'src/app/pages/admin/manage-user/users/reset-password-dialog/reset-password-dialog.component';

// 🔥 Add these imports! Check the paths based on your folder structure.
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service'; 
import { AlertService } from 'src/app/shared/alert.service'; 
import { PasskeyManageDialogComponent } from 'src/app/pages/passkey-manage-dialog/passkey-manage-dialog.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent implements OnInit {
  public userImage = '../assets/img/users/user.jpg';
  
  public userName: string = 'User';
  public userType: string = 'Role';
  public hasPasskey: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private api: ManageUsersService,   // 🔥 Injected API
    private alertService: AlertService // 🔥 Injected Alerts
  ) { }

  // ngOnInit() {
  //   this.userName = localStorage.getItem('UserName') || 'Guest';
  //   this.userType = localStorage.getItem('UserType') || 'User';
  // }

  ngOnInit() {
    this.userName = localStorage.getItem('UserName') || 'Guest';
    this.userType = localStorage.getItem('UserType') || 'User';

    // 🔥 FETCH STATUS ON LOAD
    this.api.getPasskeyStatus().subscribe({
      next: (res: any) => {
        this.hasPasskey = res.hasPasskey;
      }
    });
  }

  openChangePassword() {
    const currentUserId = localStorage.getItem('UserId'); 

    this.dialog.open(ResetPasswordDialogComponent, {
      width: '550px',
      data: { 
        userId: currentUserId, 
        isSelfChange: true 
      }
    });
  }

  public logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/#/login';
  }

  // ==========================================================
  // 🔥 PASSKEY / FINGERPRINT SETUP
  // ==========================================================
  public setupPasskey() {
    // 1. Get the challenge options from the server
    this.api.setupPasskeyOptions().subscribe({
      next: async (options: any) => {
        try {
          // 2. Convert server strings into binary buffers for the browser scanner
          options.challenge = this.base64urlToBuffer(options.challenge);
          options.user.id = this.base64urlToBuffer(options.user.id);
          
          if (options.excludeCredentials) {
            options.excludeCredentials = options.excludeCredentials.map((c: any) => {
              c.id = this.base64urlToBuffer(c.id);
              return c;
            });
          }

         // 3. WAKE UP THE DEVICE SCANNER
          const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
          
          const responseObj = credential.response as AuthenticatorAttestationResponse;

          // 4. Format the biometric signature to send back to the server
          const attestationResponse = {
            id: credential.id,
            rawId: this.bufferToBase64url(credential.rawId),
            type: credential.type,
            extensions: credential.getClientExtensionResults(), 
            
            response: {
              attestationObject: this.bufferToBase64url(responseObj.attestationObject),
              clientDataJson: this.bufferToBase64url(responseObj.clientDataJSON),
              
              // 🔥 Cast to (responseObj as any) to resolve the TypeScript error
              transports: (responseObj as any).getTransports 
                ? (responseObj as any).getTransports() 
                : ['internal']
            }
          };

        // 5. Send to server to securely verify and save!
          this.api.setupPasskeyRegister(attestationResponse).subscribe({
             next: (res: any) => {
               this.alertService.createAlert(res.message, 1);
               this.hasPasskey = true; // 🔥 UPDATES UI INSTANTLY
             },
             error: (err: any) => this.alertService.createAlert(err.error?.message || 'Passkey setup failed', 0)
          });
        } catch (err) {
           console.error(err);
           this.alertService.createAlert('Biometric scan cancelled or failed.', 0);
        }
      },
      error: () => this.alertService.createAlert('Failed to initialize Passkey setup.', 0)
    });
  }

  // --- WebAuthn Helper Methods (Required for Passkeys) ---
  private base64urlToBuffer(base64url: string): ArrayBuffer {
    const padding = '==='.slice((base64url.length + 3) % 4);
    const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const charCode of bytes) {
      str += String.fromCharCode(charCode);
    }
    const base64String = btoa(str);
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  openPasskeyManager() {
    this.dialog.open(PasskeyManageDialogComponent, {
      width: '450px',
      disableClose: false
    });
  }
}