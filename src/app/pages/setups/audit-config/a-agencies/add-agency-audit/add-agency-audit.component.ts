import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DepartmentService } from '../../../test-master-data/mdata-depts/department.service';
 

@Component({
  selector: 'app-add-agency-audit',
  templateUrl: './add-agency-audit.component.html',
  styleUrls: ['./add-agency-audit.component.scss']
})
export class AddAgencyAuditComponent implements OnInit {
  departmentForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddAgencyAuditComponent>,
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    // Initialize the form. If data was passed, we are in Edit Mode. 
    // If no data, we are in Add Mode and default DepartmentId to 0.
    this.departmentForm = this.fb.group({
      departmentId: [this.data ? this.data.departmentId : 0],
      departmentName: [this.data ? this.data.departmentName : null, Validators.required],
      departmentCode: [this.data ? this.data.departmentCode : null, Validators.required],
      departmentHead: [this.data ? this.data.departmentHead : null]
    });
  }

  saveDepartment() {
    if (this.departmentForm.valid) {
      this.departmentService.addUpdateDepartment(this.departmentForm.value).subscribe((res: any) => {
        if (res.success) {
          // Pass 'success' back to the parent to trigger a grid refresh
          this.dialogRef.close('success');
        } else {
          // Handle backend error messages (e.g. "Department already exists")
          alert(res.message); 
        }
      });
    } else {
      this.departmentForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}