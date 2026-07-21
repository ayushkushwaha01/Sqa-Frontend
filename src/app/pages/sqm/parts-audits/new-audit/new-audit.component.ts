import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommodityService } from '../../process-audits/paudits-setup/commodity-master/commodity.service';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { PartAuditService } from '../part-audit.service';

@Component({
  selector: 'app-new-audit',
  templateUrl: './new-audit.component.html',
  styleUrls: ['./new-audit.component.scss']
})
export class NewAuditComponent implements OnInit {

  isEditMode: boolean = false;



  constructor(
    private dialogRef: MatDialogRef<NewAuditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private alertService: AlertService, private _setupService: SetupService, private fb: FormBuilder,
    private api: CommodityService, private manageUsersService: ManageUsersService, private partAuditService: PartAuditService
  ) { }

  ngOnInit(): void {
    console.log('Received data:', this.data);
    this.formInit(this.data);
    this.getPartsFamilies();
    this.getCommodities();
    this.getSuppliers();
    this.getStates();
    this.getCities();
    this.getAuditors();
    this.getParts();

  }



  partsFamilies: any[] = [];
  getPartsFamilies() {
    this._setupService.getPartFamilies(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.partsFamilies = res.data.data;

        }
      });
  }

  parts: any[] = [];
  getParts() {
    this._setupService.getPartMaster(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.parts = res.data.data;

        }
      });
  }
  originalTableData: any[] = [];
  getCommodities() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;

      }
    });
  }

  Suppliers: any[] = [];
  getSuppliers() {
    this.manageUsersService.getSuppliers()
      .subscribe((res: any) => {
        if (res.success) {

          this.Suppliers = res.data;

        }
      });
  }

  states: any[] = []
  getStates() {
    this._setupService.getAllStates()
      .subscribe((res: any) => {
        if (res.success) {

          this.states = res.data;

        }
      });
  }


  cities: any[] = []
  getCities() {
    this._setupService.getAllCities()
      .subscribe((res: any) => {
        if (res.success) {

          this.cities = res.data;

        }
      });
  }

  Auditors: any[] = [];

  getAuditors() {
    this.manageUsersService.getAllUsers()
      .subscribe((res: any) => {
        if (res.success) {
          this.Auditors = res.data;
          //this.Auditors = res.data.data.filter((user: any) => user.isAuditor === true);
        }
      });
  }


  // myGroup!: FormGroup;

  // formInit(data: any) {

  //   this.myGroup = this.fb.group({
  //     PartAuditId: [
  //       data?.partAuditId || 0
  //     ],


  //     PartMasterId: [
  //       data?.partMasterId || 0
  //     ],

  //     PartFamilyId: [
  //       data?.partFamilyId || null,
  //       Validators.required
  //     ],


  //     CommodityId: [
  //       data?.commodityId || null,
  //       Validators.required
  //     ],
  //     SupplierId: [
  //       data?.supplierId || null,
  //       Validators.required
  //     ],

  //     StateId: [
  //       data?.stateId || null,
  //       Validators.required
  //     ],
  //     CityId: [
  //       data?.cityId || null,
  //       Validators.required
  //     ],

  //     userId: [
  //       data?.AuditorId || null,
  //       Validators.required
  //     ],
  //     AuditDate: [
  //       data?.AuditDate || null,
  //       Validators.required
  //     ],
  //     Remakrs: [data?.Remakrs || '']
  //   });
  // }
  myGroup!: FormGroup;

  formInit(data: any) {
    this.myGroup = this.fb.group({

      partAuditId: [data?.partAuditId || 0],

      commodityId: [
        data?.commodityId || null,
        Validators.required
      ],

      partFamilyId: [
        data?.partFamilyId || null,
        Validators.required
      ],

      partMasterId: [
        data?.partMasterId || null,
        Validators.required
      ],

      supplierId: [
        data?.supplierId || null,
        Validators.required
      ],

      stateId: [
        data?.stateId || null,
        Validators.required
      ],

      cityId: [
        data?.cityId || null,
        Validators.required
      ],

      auditorId: [
        data?.auditorId || null,
        Validators.required
      ],

      auditDate: [
        data?.auditDate || null,
        Validators.required
      ],

      remakrs: [
        data?.remakrs || ''
      ]

    });
  }

  get f() {
    return this.myGroup.controls;
  }

  UpsertPartAudit(): void {

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      return;
    }

    this.partAuditService.upsertPartAudit(this.myGroup.value)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message, 1);
            this.dialogRef.close(true);

          } else {

            this.alertService.createAlert(res.message, 0);

          }

        },

        error: (err) => {

          console.error(err);
          this.alertService.createAlert('Something went wrong.', 0);

        }

      });

  }


  close(): void {
    this.dialogRef.close();
  }

  selectedFiles: File[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).style.borderColor = '#b5b5b5';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).style.borderColor = '#b5b5b5';

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  addFiles(files: FileList): void {
    Array.from(files).forEach(f => {
      if (!this.selectedFiles.find(x => x.name === f.name)) {
        this.selectedFiles.push(f);
      }
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

}