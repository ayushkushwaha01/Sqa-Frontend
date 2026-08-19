import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/alert.service';
import { ManageUsersService } from '../manage-user/manage-users.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  tableList: any[] = [];

  constructor(
    private alertService: AlertService,
    private ManageUsersService: ManageUsersService
  ) { }

  ngOnInit(): void {
    this.getPreferences();
  }

  // Get Preferences
  getPreferences(): void {

    this.ManageUsersService.getPreferences().subscribe({
      next: (res: any) => {

        if (res.success) {

          this.tableList = res.data || [];

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to load preferences'
          );

        }
      },

      error: (err: any) => {

        console.error('Get Preferences Error:', err);

        this.alertService.createAlert(
          'Failed to load preferences'
        );

      }
    });

  }

  // Save / Update Preference
  savePreference(item: any): void {

    if (!item.newValue || item.newValue.toString().trim() === '') {
      this.alertService.createAlert(
        `Please enter ${item.subject}`,
        0
      );
      return;
    }

    const payload = {
      PreferenceId: item.preferenceId,
      Subject: item.subject,
      Description: item.description,
      PreviousValue: item.previousValue,
      NewValue: item.newValue,
      IsActive: item.isActive ?? true,
      IsDeleted: false,
      ModifiedBy: null
    };

    this.ManageUsersService.upsertPreference(payload).subscribe({
      next: (res: any) => {

        if (res.success) {

          this.alertService.createAlert(
            res.message || 'Preference updated successfully',
            1
          );

          // Update displayed Previous Value
          item.previousValue = item.newValue;

          // Update Grid Length in localStorage immediately
          if (item.subject === 'Grid Length') {

            localStorage.setItem(
              'GridLength',
              item.newValue.toString()
            );

            console.log(
              'Grid Length updated:',
              localStorage.getItem('GridLength')
            );
          }

        } else {

          this.alertService.createAlert(
            res.message || 'Failed to update preference',
            0
          );

        }
      },

      error: (err: any) => {

        console.error('Upsert Preference Error:', err);

        this.alertService.createAlert(
          'Failed to update preference',
          0
        );
      }
    });
  }

}