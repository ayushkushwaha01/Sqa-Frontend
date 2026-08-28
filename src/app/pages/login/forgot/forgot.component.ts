import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { emailValidator } from 'src/app/theme/utils/app-validators';
import { ManageUsersService } from '../../admin/manage-user/manage-users.service';
import { AlertService } from 'src/app/shared/alert.service';
 
@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      'email': [null, Validators.compose([Validators.required, emailValidator])],
    });
  }

  ngOnInit(): void {
  }

  public onSubmit(values: any): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.api.forgotPassword(values.email).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success || res.Success) {
            this.alertService.createAlert(res.message || res.Message || 'Password reset link sent to your email.', 1);
            this.router.navigate(['/login/login-page']);
          } else {
            this.alertService.createAlert(res.message || res.Message || 'Failed to process request', 0);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.alertService.createAlert(err.error?.message || 'Failed to send reset link. Please try again.', 0);
        }
      });
    }
  }
}
