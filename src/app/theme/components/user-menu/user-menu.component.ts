

// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { Router } from '@angular/router';
// import { MatDialog } from '@angular/material/dialog';
// import { ResetPasswordDialogComponent } from 'src/app/pages/admin/manage-user/users/reset-password-dialog/reset-password-dialog.component';

// import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service'; 
// import { AlertService } from 'src/app/shared/alert.service'; 
// import { PasskeyManageDialogComponent } from 'src/app/pages/passkey-manage-dialog/passkey-manage-dialog.component';

// @Component({
//   selector: 'app-user-menu',
//   templateUrl: './user-menu.component.html',
//   styleUrls: ['./user-menu.component.scss'],
//   encapsulation: ViewEncapsulation.None,
// })
// export class UserMenuComponent implements OnInit {
//   public userImage = '../assets/img/users/user.jpg';
  
//   public userName: string = 'User';
//   public userType: string = 'Role';
//   public hasPasskey: boolean = false;

//   constructor(
//     private router: Router,
//     private dialog: MatDialog,
//     private api: ManageUsersService,   // 🔥 Injected API
//     private alertService: AlertService // 🔥 Injected Alerts
//   ) { }

//   ngOnInit() {
//     this.userName = localStorage.getItem('UserName') || 'Guest';
//     this.userType = localStorage.getItem('UserType') || 'User';

//     // 🔥 FETCH STATUS ON LOAD
//     this.api.getPasskeyStatus().subscribe({
//       next: (res: any) => {
//         this.hasPasskey = res.hasPasskey;
//       }
//     });
    
//   }

//   openChangePassword() {
//     const currentUserId = localStorage.getItem('UserId'); 

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

//   openPasskeyManager() {
//     this.dialog.open(PasskeyManageDialogComponent, {
//       width: '450px',
//       disableClose: false
//     });
//   }
// }


import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordDialogComponent } from 'src/app/pages/admin/manage-user/users/reset-password-dialog/reset-password-dialog.component';

import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service'; 
import { AlertService } from 'src/app/shared/alert.service'; 
import { PasskeyManageDialogComponent } from 'src/app/pages/passkey-manage-dialog/passkey-manage-dialog.component';
import { AuthTokenService } from 'src/auth-token.service'; // Make sure path is correct!

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
  public currentUserName: string = 'User'; // 🔥 New property for the template
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private api: ManageUsersService,
    private alertService: AlertService,
    private authTokenService: AuthTokenService // 🔥 Injected the secure token service
  ) { }

  // ngOnInit() {
  //   // 🔥 1. Pull the UI cosmetics safely from the decoded token
  //   const decoded = this.authTokenService.getDecodedToken();
   

  //   // 🔥 2. FETCH STATUS ON LOAD
  //   this.api.getPasskeyStatus().subscribe({
  //     next: (res: any) => {
  //       this.hasPasskey = res.hasPasskey;
  //     }
  //   });
    
  // }

  ngOnInit() {
    //  1. Pull the UI cosmetics safely from the decoded token
    const decoded = this.authTokenService.getDecodedToken();
    if (decoded) {
      //  FIX: Update currentUserName so the HTML can see it!
      this.currentUserName = decoded.UserName || decoded.userName || decoded.name || 'User';
      
      this.userName = this.currentUserName; // Keep this just in case you use it elsewhere
      this.userType = decoded.UserType || decoded.userType || 'User';
    }

    //  2. FETCH STATUS ON LOAD (only for non-supplier users)
    if (!this.isSupplier) {
      this.api.getPasskeyStatus().subscribe({
        next: (res: any) => {
          this.hasPasskey = res.hasPasskey; 
        }
      });
    }
  }

  public get isSupplier(): boolean {
    const uType = (this.userType || this.authTokenService.getUserType() || '').toLowerCase();
    const url = this.router ? this.router.url.toLowerCase() : '';
    return uType === 'supplier' || url.includes('supplier');
  }

  openChangePassword() {
    //  3. SECURITY FIX: Get the UserId directly from the encrypted token!
    const currentUserId = this.authTokenService.getUserId(); 

    this.dialog.open(ResetPasswordDialogComponent, {
      width: '550px',
      data: { 
        userId: currentUserId, 
        isSelfChange: true 
      }
    });
  }

  public logout() {
    // Completely wipes all UI configurations and the JWT token
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/#/login';
  }

  openPasskeyManager() {
    this.dialog.open(PasskeyManageDialogComponent, {
      width: '450px',
      disableClose: false
    });
  }
}