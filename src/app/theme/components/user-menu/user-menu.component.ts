import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordDialogComponent } from 'src/app/pages/admin/manage-user/users/reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent implements OnInit {
  public userImage = '../assets/img/users/user.jpg';
  
  // Variables to hold dynamic user data
  public userName: string = 'User';
  public userType: string = 'Role';

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // Read the user data saved during login
    this.userName = localStorage.getItem('UserName') || 'Guest';
    this.userType = localStorage.getItem('UserType') || 'User';
  }

  // openChangePassword(): void {
  //   const userId = parseInt(localStorage.getItem('UserId') || '0', 10);
  //   this.dialog.open(ResetPasswordDialogComponent, {
  //     width: '550px',
  //     data: {
  //       userId: userId,
  //       userName: this.userName,
  //       isSelfChange: true
  //     }
  //   });
  // }

  // Call this method from your HTML 'Change Password' button
  openChangePassword() {
    // 🔥 Get the currently logged-in user's ID
    const currentUserId = localStorage.getItem('UserId'); 

    this.dialog.open(ResetPasswordDialogComponent, {
      width: '550px',
      data: { 
        userId: currentUserId, 
        isSelfChange: true // 🔥 This tells the popup to show the "Old Password" field
      }
    });
  }

  // Real logout function that wipes memory
  public logout() {
    localStorage.clear();
    sessionStorage.clear();
    
    // Force a full browser reload to the login page.
    window.location.href = '/#/login';
  }

  
}