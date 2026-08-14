import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SetupService } from "src/app/pages/setup/setup.service";
import { LookupService } from "src/app/pages/admin/lookup/lookup.service";
import { ManageUsersService } from "src/app/pages/admin/manage-user/manage-users.service";
import { InspectionService } from "../inspection.service";
import { AlertService } from "src/app/shared/alert.service";
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

export class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date.toDateString();
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  selector: "app-add-record-pop",
  templateUrl: "./add-record-pop.component.html",
  styleUrls: ["./add-record-pop.component.scss"],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class AddRecordPopComponent implements OnInit {
  recordForm!: FormGroup;

  stages: any[] = [];
  shifts: any[] = [];
  suppliers: any[] = [];
  inspectors: any[] = [];
  partFamilies: any[] = [];
  partCodes: any[] = [];
  batches: any[] = [];
  allPartCodes: any[] = [];
  allBatches: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddRecordPopComponent>,
    private fb: FormBuilder,
    private setupService: SetupService,
    private lookupService: LookupService,
    private manageUsersService: ManageUsersService,
    private inspectionService: InspectionService,
    private alertService: AlertService // <-- Inject Alert Service
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadDropdownData();
  }

  initForm() {
    this.recordForm = this.fb.group({
      stageId: [null, Validators.required],
      supplierId: [null, Validators.required],
      inspectionDate: [null, Validators.required],
      shiftId: [null],
      time: [null, Validators.required],
      inspectorId: [null, Validators.required],
      partFamilyId: [null, Validators.required],
      partMasterId: [null, Validators.required],
      batchId: [null, Validators.required],
      remarks: [""],
      batchQuantity: [null],
      sampleQuantity: [null],
    });

    if (this.data) {
      this.recordForm.patchValue({
        stageId: this.data.stageId,
        supplierId: this.data.supplierId,
        shiftId: this.data.shiftId,
        inspectorId: this.data.inspectorId,
        partFamilyId: this.data.partFamilyId,
        partMasterId: this.data.partMasterId,
        batchId: this.data.batchId,
        inspectionDate: this.parseLocalDate(this.data.InspectionDate),
        time: this.data.Time,
        remarks: this.data.Remarks === "-" ? "" : this.data.Remarks,
        batchQuantity: this.data.BatchQuantity,
        sampleQuantity: this.data.SampleQuantity,
      });

      this.recordForm.get('partFamilyId')?.disable();
      this.recordForm.get('partMasterId')?.disable();

      setTimeout(() => {
        if (this.data.partFamilyId) {
          this.onPartFamilyChange(this.data.partFamilyId);
          this.recordForm.get("partMasterId")?.setValue(this.data.partMasterId);

          if (this.data.partMasterId) {
            this.onPartMasterChange(this.data.partMasterId);
            this.recordForm.get("batchId")?.setValue(this.data.batchId);
          }
        }
      }, 600);
    }
  }

  loadDropdownData() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success && res.data) {
        this.stages = res.data.filter((item: any) => item.codeMasterName === "Inspection-Stage" && item.isActive);
        this.shifts = res.data.filter((item: any) => item.codeMasterName === "Shift" && item.isActive);
      }
    });

    this.setupService.getAllSuppliers().subscribe((res: any) => {
      if (res.success && res.data) {
        this.suppliers = res.data.filter((item: any) => item.isActive);
      }
    });

    this.manageUsersService.getAllUsers().subscribe((res: any) => {
      if (res.success && res.data) {
        this.inspectors = res.data.filter((user: any) => user.isInspector && user.isActive);
      }
    });

    this.setupService.getPartFamilies({}).subscribe((res: any) => {
      if (res.success && res.data && res.data.data) {
        this.partFamilies = res.data.data.filter((item: any) => item.isActive);
      }
    });

    this.setupService.getPartMaster({ Keyword: "", Status: "" }).subscribe((res: any) => {
      if (res.success && res.data && res.data.data) {
        this.allPartCodes = res.data.data.filter((item: any) => item.isActive);
        const partFamilyId = this.recordForm.get("partFamilyId")?.value;
        this.partCodes = partFamilyId ? this.allPartCodes.filter((item: any) => item.partFamilyId == partFamilyId) : [];
      }
    });

    this.setupService.getBatchMaster({ Keyword: "", Status: "" }).subscribe((res: any) => {
      if (res.success && res.data && res.data.data) {
        this.allBatches = res.data.data.filter((item: any) => item.isActive);
        const partMasterId = this.recordForm.get("partMasterId")?.value;
        this.batches = partMasterId ? this.allBatches.filter((item: any) => item.partMasterId == partMasterId) : [];
      }
    });
  }

 saveRecord() {
    if (this.recordForm.valid) {
      const formData = this.recordForm.getRawValue();

      const payload = {
        ...formData,
        inspectionId: this.data && this.data.id ? this.data.id : 0, 
        partCodeId: formData.partMasterId,
        batchNumberId: formData.batchId,
        inspectionDate: this.formatLocalDate(formData.inspectionDate),
        createdBy: 1, 
      };

      this.inspectionService.addInspection(payload).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            this.alertService.createAlert("Record saved successfully!"); // <-- Success Alert added
            this.dialogRef.close(true); // Triggers loadData() in parent component
          } else {
            this.alertService.createAlert("Failed to save record: " + (res.message || "Unknown error")); // <-- Error Alert
          }
        },
        error: (err) => {
          console.error("Error saving record", err);
          if (err.status === 400 && err.error && err.error.errors) {
            this.alertService.createAlert("Validation Error: " + JSON.stringify(err.error.errors)); // <-- Validation Alert
          } else {
            this.alertService.createAlert("An error occurred while saving. Check console for details."); // <-- Generic Error Alert
          }
        },
      });
    } else {
      this.recordForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close(false);
  }

  onPartFamilyChange(partFamilyId: any) {
    this.partCodes = partFamilyId ? this.allPartCodes.filter((item: any) => item.partFamilyId == partFamilyId) : [];
    this.recordForm.get("partMasterId")?.setValue(null);
    this.recordForm.get("batchId")?.setValue(null);
    this.batches = [];
  }

  onPartMasterChange(partMasterId: any) {
    this.batches = partMasterId ? this.allBatches.filter((item: any) => item.partMasterId == partMasterId) : [];
    this.recordForm.get("batchId")?.setValue(null);
  }

  parseLocalDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;

    const dateStr = String(dateInput).trim();
    const hasTimezone = dateStr.endsWith('Z') || /[\+\-]\d{2}:?\d{2}$/.test(dateStr);

    if (hasTimezone) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } else {
      const cleanDateStr = dateStr.split('T')[0]; 
      const parts = cleanDateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; 
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }

    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  formatLocalDate(dateInput: any): string | null {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}