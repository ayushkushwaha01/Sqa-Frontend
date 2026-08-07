import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InspectionService } from '../../inspection.service';
 // Update path as needed

@Component({
  selector: 'app-defects-pop',
  templateUrl: './defects-pop.component.html',
  styleUrls: ['./defects-pop.component.scss']
})
export class DefectsPopComponent implements OnInit {

  gridCells: any[] = [];
  inspectionId: number;
  isReadOnly: boolean = false;

  // New Color Mapping: 1=Green, 2=Blue, 3=Yellow, 4=Orange, 5=Red
  palette: { [key: number]: any } = {
    1: { bgColor: '#4c9a2a', textColor: '#ffffff' }, // Green
    2: { bgColor: '#3b82f6', textColor: '#ffffff' }, // Blue
    3: { bgColor: '#fcd34d', textColor: '#ffffff' }, // Yellow
    4: { bgColor: '#f8a000', textColor: '#ffffff' }, // Orange
    5: { bgColor: '#dc2626', textColor: '#ffffff' }  // Red
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DefectsPopComponent>,
    private inspectionService: InspectionService
  ) {
    // Extract the inspectionId passed from the datatable
    this.inspectionId = this.data.id;
    this.isReadOnly = (this.data && this.data.isReadOnly) || localStorage.getItem('UserType') === 'Supplier';
  }

  ngOnInit(): void {
    this.fetchDefects();
  }

  fetchDefects(): void {
    this.inspectionService.getDefectsByInspection(this.inspectionId).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.buildGrid(res.data);
        }
      },
      error: (err) => {
        console.error("Failed to load defects", err);
      }
    });
  }

  buildGrid(defectsData: any[]): void {
    this.gridCells = defectsData.map(defect => {
      const color = this.palette[defect.status] || this.palette[5]; // Fallback to 5 (Red)
      return {
        defectId: defect.defectId,
        label: defect.defectName,
        status: defect.status,
        bgColor: color.bgColor,
        textColor: color.textColor
      };
    });
  }

  toggleColor(cell: any): void {
    if (this.isReadOnly) return;
    // Cycle logic: 5 -> 1 -> 2 -> 3 -> 4 -> 5
    cell.status = (cell.status % 5) + 1;
    
    // Apply the new color properties
    const color = this.palette[cell.status];
    cell.bgColor = color.bgColor;
    cell.textColor = color.textColor;
  }

  saveAndClose(): void {
    const statuses: { [key: string]: number } = {};
    
    this.gridCells.forEach(cell => {
      statuses[cell.defectId.toString()] = cell.status;
    });

    const payload = {
      inspectionId: this.inspectionId,
      statuses: statuses
    };

    this.inspectionService.updateDefectsStatus(payload).subscribe({
      next: (res) => {
        this.dialogRef.close(true); // Close and indicate success
      },
      error: (err) => {
        console.error("Failed to save defect statuses", err);
        this.dialogRef.close(false); 
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}