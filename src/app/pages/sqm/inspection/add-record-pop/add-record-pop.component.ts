import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SetupService } from "src/app/pages/setup/setup.service";
import { LookupService } from "src/app/pages/admin/lookup/lookup.service";
import { ManageUsersService } from "src/app/pages/admin/manage-user/manage-users.service";
import { InspectionService } from "../inspection.service";

@Component({
  selector: "app-add-record-pop",
  templateUrl: "./add-record-pop.component.html",
  styleUrls: ["./add-record-pop.component.scss"],
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
      shiftId: [null, Validators.required],
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
        inspectionDate: this.data.InspectionDate,
        time: this.data.Time,
        remarks: this.data.Remarks === "-" ? "" : this.data.Remarks,
        batchQuantity: this.data.BatchQuantity,
        sampleQuantity: this.data.SampleQuantity,
      });

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
        this.stages = res.data.filter(
          (item: any) =>
            item.codeMasterName === "Inspection-Stage" && item.isActive,
        );
        this.shifts = res.data.filter(
          (item: any) => item.codeMasterName === "Shift" && item.isActive,
        );
      }
    });

    this.setupService.getAllSuppliers().subscribe((res: any) => {
      if (res.success && res.data) {
        this.suppliers = res.data.filter((item: any) => item.isActive);
      }
    });

    this.manageUsersService.getAllUsers().subscribe((res: any) => {
      if (res.success && res.data) {
        this.inspectors = res.data.filter(
          (user: any) => user.isInspector && user.isActive,
        );
      }
    });

    this.setupService.getPartFamilies({}).subscribe((res: any) => {
      if (res.success && res.data && res.data.data) {
        this.partFamilies = res.data.data.filter((item: any) => item.isActive);
      }
    });

    this.setupService
      .getPartMaster({ Keyword: "", Status: "" })
      .subscribe((res: any) => {
        if (res.success && res.data && res.data.data) {
          this.allPartCodes = res.data.data.filter(
            (item: any) => item.isActive,
          );
          const partFamilyId = this.recordForm.get("partFamilyId")?.value;
          this.partCodes = partFamilyId
            ? this.allPartCodes.filter(
                (item: any) => item.partFamilyId == partFamilyId,
              )
            : [];
        }
      });

    this.setupService
      .getBatchMaster({ Keyword: "", Status: "" })
      .subscribe((res: any) => {
        if (res.success && res.data && res.data.data) {
          this.allBatches = res.data.data.filter((item: any) => item.isActive);
          const partMasterId = this.recordForm.get("partMasterId")?.value;
          this.batches = partMasterId
            ? this.allBatches.filter(
                (item: any) => item.partMasterId == partMasterId,
              )
            : [];
        }
      });
  }

 saveRecord() {
    if (this.recordForm.valid) {
      const formData = this.recordForm.value;

      const payload = {
        ...formData,
        // If editing, include the existing ID; if adding, default to 0
        inspectionId: this.data && this.data.id ? this.data.id : 0, 
        partCodeId: formData.partMasterId,
        batchNumberId: formData.batchId,
        inspectionDate: formData.inspectionDate
          ? new Date(formData.inspectionDate).toISOString()
          : null,
        createdBy: 1, // FIX: Hardcoded to bypass Foreign Key error
      };

      // Use the single unified service method for both Add and Edit
      this.inspectionService.addInspection(payload).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            this.dialogRef.close(true);
          } else {
            alert("Failed to save record: " + (res.message || "Unknown error"));
          }
        },
        error: (err) => {
          console.error("Error saving record", err);
          if (err.status === 400 && err.error && err.error.errors) {
            alert("Validation Error: " + JSON.stringify(err.error.errors));
          } else {
            alert("An error occurred while saving. Check console for details.");
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
    this.partCodes = partFamilyId
      ? this.allPartCodes.filter(
          (item: any) => item.partFamilyId == partFamilyId,
        )
      : [];
    this.recordForm.get("partMasterId")?.setValue(null);
    this.recordForm.get("batchId")?.setValue(null);
    this.batches = [];
  }

  onPartMasterChange(partMasterId: any) {
    this.batches = partMasterId
      ? this.allBatches.filter((item: any) => item.partMasterId == partMasterId)
      : [];
    this.recordForm.get("batchId")?.setValue(null);
  }
}
