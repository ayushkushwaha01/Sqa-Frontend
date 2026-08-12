// import { Component, OnInit, ViewEncapsulation } from '@angular/core';

// @Component({
//   selector: 'app-user-menu',
//   templateUrl: './user-menu.component.html',
//   styleUrls: ['./user-menu.component.scss'],
//   encapsulation: ViewEncapsulation.None,
// })
// export class UserMenuComponent implements OnInit {
//   public userImage = '../assets/img/users/user.jpg';
//   constructor() { }

//   ngOnInit() {
//   }

// }



// <!-- after imtroducing supplier login -->


import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  ngOnInit() {
    // Read the user data we saved during login
    this.userName = localStorage.getItem('UserName') || 'Guest';
    this.userType = localStorage.getItem('UserType') || 'User';
  }

  // Real logout function that wipes memory
  public logout() {
    localStorage.clear();
    sessionStorage.clear();
    
    // Force a full browser reload to the login page. 
    // This ensures all Angular singleton services (like Auth behaviors) are wiped from memory.
    window.location.href = '/#/login';
  }
}