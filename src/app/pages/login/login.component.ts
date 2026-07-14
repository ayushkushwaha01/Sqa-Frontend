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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      'email': [null, Validators.compose([Validators.required, emailValidator])],
      'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ngOnInit() { }

  public onSubmit(values: any) {
    if (this.form.valid) {
      const credentials = {
        email: values.email,
        password: values.password
      };

      this.api.login(credentials).subscribe({
        next: (res: any) => {
          if (res.success) {
            // 1. Save Token and User Data
            localStorage.setItem('jwt_token', res.token);
            sessionStorage.setItem('jwt_token', res.token);
            localStorage.setItem('UserName', res.userData.userName);
            localStorage.setItem('UserId', res.userData.userId);
            localStorage.setItem('RoleId', res.userData.roleId);
            
            // We still save UserType in case you want to hide/show buttons later based on who is logged in!
            localStorage.setItem('UserType', res.userData.userType);

            // 2. Show Success Toast
            this.alertService.createAlert('Login Successful', 1);

            // 3. Exact same landing page for ALL users (Admin & Supplier)
            this.router.navigate(['/app/sqm/sqmd']);
            
          } else {
            this.alertService.createAlert(res.message || 'Invalid Email or Password', 0);
          }
        },
        error: (err) => {
          console.error(err);
          this.alertService.createAlert(err.error?.message || 'Invalid Email or Password', 0);
        }
      });
    }
  }
}