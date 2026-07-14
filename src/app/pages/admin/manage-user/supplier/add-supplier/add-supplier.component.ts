import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManageUsersService } from '../../manage-users.service';
 
@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html'
})
export class AddSupplierComponent implements OnInit {
  myGroup: FormGroup;
  states: any[] = [];
  allCities: any[] = [];
  filteredCities: any[] = [];
  supplierId: number = 0;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ManageUsersService
  ) {
    this.myGroup = this.fb.group({
      userName: ['', Validators.required],
      supplierName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      stateId: [null, Validators.required],
      cityId: [null, Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns() {
    // 1. Fetch States
    this.api.getStates().subscribe((res: any) => {
      if (res.success) this.states = res.data;
    });

    // 2. Fetch All Cities
    this.api.getCities().subscribe((res: any) => {
      if (res.success) {
        this.allCities = res.data;
        
        // 3. Patch data if in Edit Mode (Wait for cities to load first)
        if (this.data) {
          this.supplierId = this.data.supplierId;
          this.onStateChange(this.data.stateId); // Pre-filter cities
          this.myGroup.patchValue(this.data);
        }
      }
    });
  }

  onStateChange(stateId: number) {
    // Filter the master list of cities to only show those belonging to the selected StateId
    this.filteredCities = this.allCities.filter(c => c.stateId === stateId);
    
    // Clear city value if user changes state manually via UI
    if(this.myGroup.get('stateId')?.dirty) {
        this.myGroup.get('cityId')?.setValue(null);
    }
  }

  saveSupplier() {
    if (this.myGroup.valid) {
      const payload = { ...this.myGroup.value, supplierId: this.supplierId };
      this.api.upsertSupplier(payload).subscribe((res: any) => {
        if(res.success) this.dialogRef.close(true);
      });
    } else {
      this.myGroup.markAllAsTouched();
    }
  }

  close(): void { this.dialogRef.close(false); }
  
  onlyNumbers(event: any) {
    const k = event.charCode;
    return ((k > 47 && k < 58));
  }
}