import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-parts-master-suppliers',
  templateUrl: './parts-master-suppliers.component.html',
  styleUrls: ['./parts-master-suppliers.component.scss']
})
export class PartsMasterSuppliersComponent implements OnInit {

  // Available items for the left box
  availableSuppliers: string[] = [
    'Tata Motors Supplier',
    'Ashok Leyland Supplier',
    'Bosch Automotive Components',
    'Mahindra & Mahindra Supplier',
    'Exide Industries',
    'Lucas-TVS',
    'Amara Raja Batteries',
    'Hella India Lighting',
    'Sona Koyo Steering Systems',
    'Varroc Engineering',
    'Wheels India'
  ];

  // Assigned items for the right box
  assignedSuppliers: string[] = [
    'Sundaram Fasteners',
    'Motherson Sumi Systems',
    'Bharat Forge',
    'JBM Group',
    'Delphi Automotive Systems'
  ];

  // Track the user's active selections in the lists
  selectedAvailable: string[] = [];
  selectedAssigned: string[] = [];

  // Inject MatDialogRef to handle closing the popup
  // constructor(public dialogRef: MatDialogRef<PartsMasterSuppliersComponent>, private api: ManageUsersService,) { }

  constructor(
    private dialogRef: MatDialogRef<PartsMasterSuppliersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
    private api: ManageUsersService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }


  allData: any[] = [];

  loadSuppliers() {

    this.api.getSuppliers().subscribe((res: any) => {

      if (res.success) {

        const allSuppliers = res.data || [];

        const selectedIds = this.data?.supplierIds
          ? this.data.supplierIds.split(',').map((x: string) => +x)
          : [];

        this.assignedSuppliers = allSuppliers.filter((x: any) =>
          selectedIds.includes(x.supplierId)
        );

        this.availableSuppliers = allSuppliers.filter((x: any) =>
          !selectedIds.includes(x.supplierId)
        );
      }

    });

  }
  // Moves items from Left (Available) to Right (Assigned)
  addSuppliers() {

    this.assignedSuppliers.push(...this.selectedAvailable);

    this.availableSuppliers = this.availableSuppliers.filter(
      x => !this.selectedAvailable.includes(x)
    );

    this.selectedAvailable = [];
  }

  // Moves items from Right (Assigned) to Left (Available)
  removeSuppliers() {

    this.availableSuppliers.push(...this.selectedAssigned);

    this.assignedSuppliers = this.assignedSuppliers.filter(
      x => !this.selectedAssigned.includes(x)
    );

    this.selectedAssigned = [];
  }
  selectedSupplierIds: string = '';
  // Saves the selection and closes the dialog
  // save() {
  //   // Closes the popup and returns the updated assigned array to the parent component
  //   this.dialogRef.close(this.assignedSuppliers);
  // }

  save() {

    const supplierIds = this.assignedSuppliers
      .map((x: any) => x.supplierId)
      .join(',');

    const payload = {
      ...this.data,
      SupplierIds: supplierIds
    };

    this._setupService.upsertPartMaster(payload)
      .subscribe((res: any) => {

        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          this.dialogRef.close(true);
        } else {
          this.alertService.createAlert(res.message, 0);
        }

      });

  }
  closeDialog() {
    this.dialogRef.close();
  }

}