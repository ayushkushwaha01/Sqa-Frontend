// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { emailValidator } from 'src/app/theme/utils/app-validators';
// import { ManageUsersService } from '../admin/manage-user/manage-users.service';
// import { AlertService } from 'src/app/shared/alert.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//   public form: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private api: ManageUsersService,
//     private alertService: AlertService
//   ) {
//     this.form = this.fb.group({
//       'email': [null, Validators.compose([Validators.required, emailValidator])],
//       'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
//     });
//   }

//   ngOnInit() { }

//   public onSubmit(values: any) {
//     if (this.form.valid) {
//       const credentials = {
//         email: values.email,
//         password: values.password
//       };

//       this.api.login(credentials).subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             // 1. Save Token and User Data
//             localStorage.setItem('jwt_token', res.token);
//             sessionStorage.setItem('jwt_token', res.token);
//             localStorage.setItem('UserName', res.userData.userName);
//             localStorage.setItem('UserId', res.userData.userId);
//             localStorage.setItem('RoleId', res.userData.roleId);

//             // 2. Show Success Toast
//             this.alertService.createAlert('Login Successful', 1);

//             // 3. Navigate to your app dashboard
//             this.router.navigate(['/app/sqm/sqmd']);
//           } else {
//             this.alertService.createAlert(res.message || 'Invalid Email or Password', 0);
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           this.alertService.createAlert(err.error?.message || 'Invalid Email or Password', 0);
//         }
//       });
//     }
//   }
// }



// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { emailValidator } from 'src/app/theme/utils/app-validators';
// import { ManageUsersService } from '../admin/manage-user/manage-users.service';
// import { AlertService } from 'src/app/shared/alert.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//   public form: FormGroup;
//   public passwordType: string = 'password';

//   public togglePassword() {
//     this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
//   }

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private api: ManageUsersService,
//     private alertService: AlertService
//   ) {
//     this.form = this.fb.group({
//       'email': [null, Validators.compose([Validators.required, emailValidator])],
//       'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
//     });
//   }

//   ngOnInit() { }

   

//   public onSubmit(values: any) {
//     if (this.form.valid) {
//       const credentials = {
//         email: values.email,
//         password: values.password
//       };

//       this.api.login(credentials).subscribe({
//         next: (res: any) => {
           

//           if (res.success) {
          
//             localStorage.setItem('jwt_token', res.token);
//             sessionStorage.setItem('jwt_token', res.token);
//             localStorage.setItem('UserName', res.userData.userName);
//             localStorage.setItem('UserId', res.userData.userId);
//             localStorage.setItem('RoleId', res.userData.roleId);
//             localStorage.setItem('UserType', res.userData.userType);  
//             this.setGridLength();

      
//             this.alertService.createAlert('Login Successful', 1);

//             localStorage.setItem('UserType', res.userData.userType);

         
//             this.api.getUserLoginPermissions(res.userData.roleId).subscribe({
//               next: (permRes: any) => {
//                 if (permRes.success || permRes.Success) {
//                    localStorage.setItem('rolePermissions', JSON.stringify(permRes.data || permRes.Data));
//                 }

//                  this.alertService.createAlert('Login Successful', 1);

//                  if (res.userData.userType === 'Supplier') {
//                   this.router.navigate(['/app/supplier-login/dashboard']);
//                 } else {
//                   this.router.navigate(['/app/sqm/sqmd']);
//                 }
//               },
//               error: () => {
//                  if (res.userData?.userType === 'Supplier') {
//                   this.alertService.createAlert('Login Successful', 1);
//                   this.router.navigate(['/app/supplier-login/dashboard']);
//                 } else {
//                   this.alertService.createAlert('Login Successful, but failed to load permissions', 1);
//                   this.router.navigate(['/app/sqm/sqmd']);
//                 }
//               }
//             });
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           this.alertService.createAlert(err.error?.message || 'Invalid Email or Password', 0);
//         }
//       });
//     }
//   }

 
//   private setGridLength(): void {

//     this.api.getPreferences().subscribe({
//       next: (res: any) => {

//         if (res.success) {

//           const preferences = res.data || [];

//           const gridPreference = preferences.find(
//             (item: any) =>
//               item.subject?.trim().toLowerCase() === 'grid length'
//           );

//           if (gridPreference) {

//             const gridLength =
//               gridPreference.newValue?.toString().trim() ||
//               gridPreference.previousValue?.toString().trim();

//             if (gridLength) {

//               localStorage.setItem('GridLength', gridLength);

//               console.log('Grid Length set to:', gridLength);
//             }
//           }

//         } else {
//           console.error('Failed to get preferences');
//         }
//       },

//       error: (err: any) => {
//         console.error('Failed to load Grid Length:', err);
//       }
//     });

//   }
// }


// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { emailValidator } from 'src/app/theme/utils/app-validators';
// import { ManageUsersService } from '../admin/manage-user/manage-users.service';
// import { AlertService } from 'src/app/shared/alert.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//   public form: FormGroup;
//   public passwordType: string = 'password';
  
  
//   public step: 'login' | 'mfa-choice' | 'mfa-auth' | 'mfa-email' = 'login';
//   public mfaCode: string = '';
//   public isSendingOtp: boolean = false;

//   public togglePassword() {
//     this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
//   }

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private api: ManageUsersService,
//     private alertService: AlertService
//   ) {
//     this.form = this.fb.group({
//       'email': [null, Validators.compose([Validators.required, emailValidator])],
//       'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
//     });
//   }

//   ngOnInit() { }

//   // ==========================================================
//   // 1. STANDARD LOGIN (With Smart MFA Routing)
//   // ==========================================================
//   public onSubmit(values: any) {
//     if (this.form.valid) {
//       const credentials = {
//         email: values.email,
//         password: values.password
//       };

//       this.api.login(credentials).subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             if (res.requiresMfa) {
//               // 🛑 MFA INTERCEPTION
//               localStorage.setItem('jwt_token', res.token);
//               sessionStorage.setItem('jwt_token', res.token);

//               // 🔥 SMART ROUTING LOGIC 🔥
//               if (res.isEmailEnabled && !res.isAuthEnabled) {
//                 // ONLY Email OTP is checked -> Automatically send email!
//                 this.chooseEmailOtp();
//               } 
//               else if (res.isAuthEnabled && !res.isEmailEnabled) {
//                 // ONLY Authenticator is checked -> Skip choice, go straight to input!
//                 this.step = 'mfa-auth';
//               } 
//               else {
//                 // BOTH are checked -> Show the Choice Menu!
//                 this.step = 'mfa-choice';
//               }
              
//             } else {
//               // ✅ No MFA required
//               this.processSuccessfulLogin(res);
//             }
//           }
//         },
//         error: (err) => {
//           this.alertService.createAlert(err.error?.message || 'Invalid Email or Password', 0);
//         }
//       });
//     }
//   }

//   // ==========================================================
//   // 2. MFA FLOW METHODS
//   // ==========================================================
//   public chooseAuthenticator() {
//     this.step = 'mfa-auth';
//   }

//   public chooseEmailOtp() {
//     this.isSendingOtp = true;
//     this.api.sendEmailOtp().subscribe({
//       next: (res: any) => {
//         this.isSendingOtp = false;
//         if (res.success) {
//           this.step = 'mfa-email';
//           this.alertService.createAlert('A 6-digit code has been sent to your email.', 1);
//         }
//       },
//       error: (err) => {
//         this.isSendingOtp = false;
//         this.alertService.createAlert('Failed to send email OTP', 0);
//       }
//     });
//   }

// public submitMfaCode() {
//     if (!this.mfaCode || this.mfaCode.length < 6) return;

//     // 🔥 Check which step we are on to call the correct API
//     const request = this.step === 'mfa-email' 
//       ? this.api.verifyEmailOtp({ code: this.mfaCode }) 
//       : this.api.verifyMfaLogin({ code: this.mfaCode });

//     request.subscribe({
//       next: (res: any) => {
//         if (res.success) {
//           this.processSuccessfulLogin(res);
//         }
//       },
//       error: (err) => {
//         this.alertService.createAlert(err.error?.message || 'Invalid verification code', 0);
//       }
//     });
//   }

//   public cancelMfa() {
//     this.step = 'login';
//     this.mfaCode = '';
//     localStorage.removeItem('jwt_token');
//     sessionStorage.removeItem('jwt_token');
//   }

//   public goBackToChoice() {
//     this.step = 'mfa-choice';
//     this.mfaCode = '';
//   }

//   // ==========================================================
//   // 3. SUCCESSFUL LOGIN HELPER
//   // ==========================================================
//   private processSuccessfulLogin(res: any) {
//     localStorage.setItem('jwt_token', res.token);
//     sessionStorage.setItem('jwt_token', res.token);
//     localStorage.setItem('UserName', res.userData.userName);
//     localStorage.setItem('UserId', res.userData.userId);
//     localStorage.setItem('RoleId', res.userData.roleId);
//     localStorage.setItem('UserType', res.userData.userType); 
    
//     this.setGridLength();

//     this.api.getUserLoginPermissions(res.userData.roleId).subscribe({
//       next: (permRes: any) => {
//         if (permRes.success || permRes.Success) {
//           localStorage.setItem('rolePermissions', JSON.stringify(permRes.data || permRes.Data));
//         }

//         this.alertService.createAlert('Login Successful', 1);

//         if (res.userData.userType === 'Supplier') {
//           this.router.navigate(['/app/supplier-login/dashboard']);
//         } else {
//           this.router.navigate(['/app/sqm/sqmd']);
//         }
//       },
//       error: () => {
//         if (res.userData?.userType === 'Supplier') {
//           this.alertService.createAlert('Login Successful', 1);
//           this.router.navigate(['/app/supplier-login/dashboard']);
//         } else {
//           this.alertService.createAlert('Login Successful, but failed to load permissions', 1);
//           this.router.navigate(['/app/sqm/sqmd']);
//         }
//       }
//     });
//   }

//   // ==========================================================
//   // 4. PASSKEY / BIOMETRIC LOGIN
//   // ==========================================================
//   public loginWithPasskey() {
//     const email = this.form.get('email')?.value;

//     if (!email) {
//       this.alertService.createAlert('Please enter your email above to sign in with Passkey.', 0);
//       return;
//     }

//     this.api.passkeyLoginOptions(email).subscribe({
//       next: async (options: any) => {
//         try {
//           options.challenge = this.base64urlToBuffer(options.challenge);
          
//           if (options.allowCredentials) {
//             options.allowCredentials = options.allowCredentials.map((c: any) => {
//               c.id = this.base64urlToBuffer(c.id);
//               return c;
//             });
//           }

//           const assertion = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;

//           if (!assertion) {
//             this.alertService.createAlert('Biometric verification cancelled.', 0);
//             return;
//           }

//           const response = assertion.response as AuthenticatorAssertionResponse;
//           const clientResponse = {
//             id: assertion.id,
//             rawId: this.bufferToBase64url(assertion.rawId),
//             type: assertion.type,
//             response: {
//               authenticatorData: this.bufferToBase64url(response.authenticatorData),
//               clientDataJSON: this.bufferToBase64url(response.clientDataJSON),
//               signature: this.bufferToBase64url(response.signature),
//               userHandle: response.userHandle ? this.bufferToBase64url(response.userHandle) : null
//             }
//           };

//           this.api.verifyPasskeyLogin(clientResponse, email).subscribe({
//             next: (res: any) => {
//               if (res.success) {
//                 this.processSuccessfulLogin(res);
//               }
//             },
//             error: (err: any) => this.alertService.createAlert(err.error?.message || 'Passkey verification failed', 0)
//           });

//         } catch (err) {
//           console.error(err);
//           this.alertService.createAlert('Passkey login cancelled or failed.', 0);
//         }
//       },
//       error: (err: any) => this.alertService.createAlert(err.error?.message || 'No Passkey registered for this account.', 0)
//     });
//   }

//   // --- WebAuthn Base64 Helpers ---
//   private base64urlToBuffer(base64url: string): ArrayBuffer {
//     const padding = '==='.slice((base64url.length + 3) % 4);
//     const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
//     for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray.buffer;
//   }

//   private bufferToBase64url(buffer: ArrayBuffer): string {
//     const bytes = new Uint8Array(buffer);
//     let str = '';
//     for (const charCode of bytes) {
//       str += String.fromCharCode(charCode);
//     }
//     const base64String = btoa(str);
//     return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
//   }

//   private setGridLength(): void {
//     this.api.getPreferences().subscribe({
//       next: (res: any) => {
//         if (res.success) {
//           const preferences = res.data || [];
//           const gridPreference = preferences.find(
//             (item: any) => item.subject?.trim().toLowerCase() === 'grid length'
//           );
//           if (gridPreference) {
//             const gridLength = gridPreference.newValue?.toString().trim() || gridPreference.previousValue?.toString().trim();
//             if (gridLength) {
//               localStorage.setItem('GridLength', gridLength);
//             }
//           }
//         }
//       },
//       error: (err: any) => {
//         console.error('Failed to load Grid Length:', err);
//       }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { emailValidator } from 'src/app/theme/utils/app-validators';
import { ManageUsersService } from '../admin/manage-user/manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public passwordType: string = 'password';
  
  // 🔥 NEW: Flow State Variables
  public loginStep: 'email' | 'password' = 'email';
  public isCheckingPasskey: boolean = false;

  // MFA UI State
  public step: 'login' | 'mfa-choice' | 'mfa-auth' | 'mfa-email' = 'login';
  public mfaCode: string = '';
  public isSendingOtp: boolean = false;

  public togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      'email': [null, Validators.compose([Validators.required, emailValidator])],
      
      // Note: We remove the 'required' validator temporarily so the 'Continue' button works for just the email.
      // We will check password validity manually later!
      'password': [null] 
    });
  }

  ngOnInit() { }

  // ==========================================================
  // 🔥 NEW: STEP 1 - EMAIL & SMART PASSKEY DETECTION
  // ==========================================================
  public checkEmailAndPasskey() {
    if (this.form.get('email')?.invalid) {
      this.form.get('email')?.markAsTouched();
      return;
    }

    const email = this.form.get('email')?.value;
    this.isCheckingPasskey = true;

    // Ask the backend: Does this user have a Passkey?
    this.api.passkeyLoginOptions(email).subscribe({
      next: async (options: any) => {
        this.isCheckingPasskey = false;
        
        try {
          // 1. Passkey exists! Convert options for the scanner
          options.challenge = this.base64urlToBuffer(options.challenge);
          if (options.allowCredentials) {
            options.allowCredentials = options.allowCredentials.map((c: any) => {
              c.id = this.base64urlToBuffer(c.id);
              return c;
            });
          }

          // 2. Wake up the Fingerprint / Windows Hello scanner automatically
          const assertion = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;

          if (!assertion) {
            // User hit "Cancel" on the fingerprint prompt. Fall back to password.
            this.loginStep = 'password';
            return;
          }

          // 3. Scanner success! Format the signature
          const response = assertion.response as AuthenticatorAssertionResponse;
          const clientResponse = {
            id: assertion.id,
            rawId: this.bufferToBase64url(assertion.rawId),
            type: assertion.type,
            
            // 🔥 FIX 1: C# strictly requires this exact property name for Login
            clientExtensionResults: assertion.getClientExtensionResults(),
            
            response: {
              authenticatorData: this.bufferToBase64url(response.authenticatorData),
              
              // 🔥 FIX 2: Must be lowercase 'son' to match the C# Model
              clientDataJson: this.bufferToBase64url(response.clientDataJSON),
              
              signature: this.bufferToBase64url(response.signature),
              userHandle: response.userHandle ? this.bufferToBase64url(response.userHandle) : null
            }
          };

          // 4. Verify with C# Backend
          this.api.verifyPasskeyLogin(clientResponse, email).subscribe({
            next: (res: any) => {
              if (res.success) this.processSuccessfulLogin(res);
            },
            error: (err: any) => {
              this.alertService.createAlert(err.error?.message || 'Passkey failed. Please use password.', 0);
              this.loginStep = 'password'; // Fallback to password on error
            }
          });

        } catch (err) {
          // If biometric hardware fails or user aborts, gracefully fall back to password
          this.loginStep = 'password';
        }
      },
      error: () => {
        // No Passkey found for this email (or API error). Move cleanly to Step 2!
        this.isCheckingPasskey = false;
        this.loginStep = 'password';
      }
    });
  }

  // ==========================================================
  // STEP 2: STANDARD LOGIN (If no Passkey, or Passkey cancelled)
  // ==========================================================
  public onSubmit(values: any) {
    // Manually enforce password rules since we hid it in Step 1
    if (!values.password || values.password.length < 6) {
      this.alertService.createAlert('Password must be at least 6 characters.', 0);
      return;
    }

    const credentials = {
      email: values.email,
      password: values.password
    };

    this.api.login(credentials).subscribe({
      next: (res: any) => {
        if (res.success) {
          if (res.requiresMfa) {
            localStorage.setItem('jwt_token', res.token);
            sessionStorage.setItem('jwt_token', res.token);

            if (res.isEmailEnabled && !res.isAuthEnabled) {
              this.chooseEmailOtp();
            } else if (res.isAuthEnabled && !res.isEmailEnabled) {
              this.step = 'mfa-auth';
            } else {
              this.step = 'mfa-choice';
            }
          } else {
            this.processSuccessfulLogin(res);
          }
        }
      },
      error: (err) => {
        this.alertService.createAlert(err.error?.message || 'Invalid Email or Password', 0);
      }
    });
  }

  // ==========================================================
  // MFA FLOW METHODS
  // ==========================================================
  public chooseAuthenticator() { this.step = 'mfa-auth'; }

  public chooseEmailOtp() {
    this.isSendingOtp = true;
    this.api.sendEmailOtp().subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
        if (res.success) {
          this.step = 'mfa-email';
          this.alertService.createAlert('A 6-digit code has been sent to your email.', 1);
        }
      },
      error: () => {
        this.isSendingOtp = false;
        this.alertService.createAlert('Failed to send email OTP', 0);
      }
    });
  }

  public submitMfaCode() {
    if (!this.mfaCode || this.mfaCode.length < 6) return;

    const request = this.step === 'mfa-email' 
      ? this.api.verifyEmailOtp({ code: this.mfaCode }) 
      : this.api.verifyMfaLogin({ code: this.mfaCode });

    request.subscribe({
      next: (res: any) => {
        if (res.success) this.processSuccessfulLogin(res);
      },
      error: (err) => {
        this.alertService.createAlert(err.error?.message || 'Invalid verification code', 0);
      }
    });
  }

  public cancelMfa() {
    this.step = 'login';
    this.loginStep = 'password';
    this.mfaCode = '';
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  }

  public goBackToChoice() {
    this.step = 'mfa-choice';
    this.mfaCode = '';
  }

  // ==========================================================
  // SUCCESSFUL LOGIN HELPER
  // ==========================================================
  private processSuccessfulLogin(res: any) {
    localStorage.setItem('jwt_token', res.token);
    sessionStorage.setItem('jwt_token', res.token);
    localStorage.setItem('UserName', res.userData.userName);
    localStorage.setItem('UserId', res.userData.userId);
    localStorage.setItem('RoleId', res.userData.roleId);
    localStorage.setItem('UserType', res.userData.userType); 
    
    this.setGridLength();

    this.api.getUserLoginPermissions(res.userData.roleId).subscribe({
      next: (permRes: any) => {
        if (permRes.success || permRes.Success) {
          localStorage.setItem('rolePermissions', JSON.stringify(permRes.data || permRes.Data));
        }
        this.alertService.createAlert('Login Successful', 1);
        this.navigateUser(res.userData.userType);
      },
      error: () => {
        this.alertService.createAlert('Login Successful', 1);
        this.navigateUser(res.userData.userType);
      }
    });
  }

  private navigateUser(userType: string) {
    if (userType === 'Supplier') {
      this.router.navigate(['/app/supplier-login/dashboard']);
    } else {
      this.router.navigate(['/app/sqm/sqmd']);
    }
  }

  // --- WebAuthn Base64 Helpers ---
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
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private setGridLength(): void {
    this.api.getPreferences().subscribe({
      next: (res: any) => {
        if (res.success) {
          const preferences = res.data || [];
          const gridPreference = preferences.find(
            (item: any) => item.subject?.trim().toLowerCase() === 'grid length'
          );
          if (gridPreference) {
            const gridLength = gridPreference.newValue?.toString().trim() || gridPreference.previousValue?.toString().trim();
            if (gridLength) localStorage.setItem('GridLength', gridLength);
          }
        }
      }
    });
  }
} 