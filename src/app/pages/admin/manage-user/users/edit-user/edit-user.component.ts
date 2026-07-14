import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManageUsersService } from '../../manage-users.service';
import { AlertService } from 'src/app/shared/alert.service'; 

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  
  myGroup: FormGroup;
  roles: any[] = [];
  managerList: any[] = [];
  
  constructor(
    public fb: FormBuilder, 
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    
    // Safely map the comma-separated string "1,4" to an array of numbers [1, 4]
    let selectedManagers: number[] = [];
    if (this.data && this.data.manager) {
      selectedManagers = this.data.manager.split(',').filter((x: string) => x).map(Number);
    }

    this.myGroup = this.fb.group({
      userId: [this.data ? this.data.userId : 0],
      userName: [this.data ? this.data.userName : null, Validators.required],
      email: [this.data ? this.data.email : null, [Validators.required, Validators.email]],
      phoneNumber: [this.data ? this.data.phoneNumber : null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      roleId: [this.data ? this.data.roleId : null, Validators.required], 
      department: [this.data ? this.data.department : null],
      manager: [selectedManagers], // Initialize with the array
      isHod: [this.data ? this.data.isHod : false],
      isInspector: [this.data ? this.data.isInspector : false],
      isAuditor: [this.data ? this.data.isAuditor : false],
      isManagerialRole: [this.data ? this.data.isManagerialRole : false]
    });
  }

  ngOnInit() {
    this.getAllRoles();
    this.getManagers(); // 🔥 FIX: Added the call to populate the dropdown!
  }

  getAllRoles() {
    this.api.getAllRoles().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.roles = res.data;
        }
      }
    });
  }

  getManagers() {
    this.api.getManagers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.managerList = res.data;
        }
      }
    });
  }

  upsertuser() {
    if (this.myGroup.valid) {
      
      // Create a copy of the form value to format the data
      let payload = { ...this.myGroup.value };
      
      // Convert the array [1, 4] back to a comma-separated string "1,4" for the database.
      if (Array.isArray(payload.manager)) {
        payload.manager = payload.manager.length > 0 ? payload.manager.join(',') : null;
      }

      this.api.upsertUser(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message, 1); 
            this.dialogRef.close(true); 
          } else {
            this.alertService.createAlert(res.message, 0); 
          }
        },
        error: () => this.alertService.createAlert("Server Error or Validation Failed", 0)
      });
    } else {
      this.myGroup.markAllAsTouched(); 
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onlyNumbers(event: any) {
    const k = event.charCode;
    return ((k > 47 && k < 58));
  }
}