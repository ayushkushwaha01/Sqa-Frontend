import { AddAlertEscalationComponent } from './add-alert-escalation/add-alert-escalation.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/alert.service';
import { ManageUsersService } from '../manage-user/manage-users.service';
import { UserPermissionService } from '../../helpers/user-permission.service';

@Component({
  selector: 'app-escalation',
  templateUrl: './escalation.component.html',
  styleUrls: ['./escalation.component.scss']
})
export class EscalationComponent implements OnInit {

  isRunningEscalations: boolean = false;
  values: any[] = [];
  canUpdate: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 9;

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private alertService: AlertService,
    private ManageUsersService: ManageUsersService
  ) { }

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.getEscalations();
  }

  // Get Escalations
  getEscalations(): void {

    this.ManageUsersService.getEscalation().subscribe({
      next: (res: any) => {

        console.log('Escalation Response:', res);

        if (res.success) {

          this.values = res.data || [];

          // If NewValue is null,
          // initially show PreviousValue
          this.values.forEach((item: any) => {

            item.newValue =
              item.newValue ?? item.previousValue;

          });

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to load escalations'
          );

        }
      },

      error: (err: any) => {

        console.error('Get Escalations Error:', err);

        this.alertService.createAlert(
          'Failed to load escalations'
        );

      }
    });

  }

  // Save / Update Escalation
  // saveEscalation(item: any): void {

  //   if (
  //     item.newValue === null ||
  //     item.newValue === undefined ||
  //     item.newValue.toString().trim() === ''
  //   ) {

  //     this.alertService.createAlert(
  //       `Please enter revised value for ${item.escalationName}`
  //     );

  //     return;
  //   }

  //   const payload = {

  //     EscalationId: item.escalationId,

  //     EscalationName: item.escalationName,

  //     Description: item.description,

  //     PreviousValue: item.previousValue,

  //     NewValue: item.newValue,

  //     IsActive: item.isActive ?? true,

  //     IsDeleted: false,

  //     ModifiedBy: null

  //   };

  //   console.log('Escalation Payload:', payload);

  //   this.ManageUsersService.upsertEscalation(payload).subscribe({

  //     next: (res: any) => {

  //       console.log('Upsert Escalation Response:', res);

  //       if (res.success) {

  //         this.alertService.createAlert(
  //           res.message || 'Escalation updated successfully'
  //         );

  //         // Update current value after successful save
  //         item.previousValue = item.newValue;

  //       } else {

  //         this.alertService.createAlert(
  //           res.message || 'Failed to update escalation'
  //         );

  //       }

  //     },

  //     error: (err: any) => {

  //       console.error('Upsert Escalation Error:', err);

  //       this.alertService.createAlert(
  //         'Failed to update escalation'
  //       );

  //     }

  //   });

  // }

  saveEscalation(item: any) {
    
    // 🔥 Ensure we are passing the Primary Key (escalationId) so C# doesn't insert a new row!
    const payload = {
      escalationId: item.escalationId, 
      escalationName: item.escalationName,
      description: item.description,
      previousValue: item.previousValue,
      newValue: item.newValue,
      isActive: item.isActive,
      modifiedBy: parseInt(localStorage.getItem('UserId') || '1', 10) // Track who made the change
    };

    // 🔥 FIX 1: Changed "this.api" to "this.ManageUsersService"
    this.ManageUsersService.upsertEscalation(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert("Escalation Matrix Updated Successfully", 1);
          
          // 🔥 Reload the grid immediately so the user sees the numbers shift!
          this.getEscalations(); 
        } else {
          this.alertService.createAlert("Failed to update", 0);
        }
      },
      // 🔥 FIX 2: Added ": any" to err
      error: (err: any) => {
        console.error(err);
        this.alertService.createAlert("An error occurred", 0);
      }
    });
  }


  addchecklistaudit(): void {

    const dialogRef = this.dialog.open(
      AddAlertEscalationComponent,
      {
        height: 'auto',
        width: '600px'
      }
    );

    dialogRef.afterClosed().subscribe(data => {

      if (data) {
        this.getEscalations();
      }

    });

  }

  runEscalationsNow(): void {
    this.isRunningEscalations = true;
    
    // Call the new endpoint we added to your service
    this.ManageUsersService.triggerDailyEscalations().subscribe({
      next: (res: any) => {
        this.isRunningEscalations = false;
        if (res.success) {
          // Shows exactly how many emails and notifications were generated
          this.alertService.createAlert(res.message, 1); 
        } else {
          this.alertService.createAlert(res.message || 'Failed to run escalations', 0);
        }
      },
      error: (err: any) => {
        this.isRunningEscalations = false;
        console.error('Trigger Escalation Error:', err);
        this.alertService.createAlert('Error connecting to server to run escalations.', 0);
      }
    });
  }

}