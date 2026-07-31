import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InspectionService } from '../../../inspection/inspection.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-uploadstagepop',
  templateUrl: './uploadstagepop.component.html',
  styleUrls: ['./uploadstagepop.component.scss']
})
export class UploadstagepopComponent implements OnInit {
  defectsText: string = '';
  selectedFiles: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadstagepopComponent>,
    private inspectionService: InspectionService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
  }

  saveDefects(): void {
    if (!this.data || !this.data.id) {
      this.alertService.createAlert("Invalid record ID. Cannot save defects.");
      return;
    }

    // Convert comma-separated string to an array, trimming spaces and filtering out empties
    const defectsArray = this.defectsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const payload = {
      InspectionRefId: this.data.id,
      DefectsList: defectsArray
    };

    this.inspectionService.updateDefectsList(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.alertService.createAlert("Defects uploaded successfully!");
          // Close the dialog and pass 'true' to trigger a table refresh in the parent
          this.dialogRef.close(true); 
        } else {
          this.alertService.createAlert("Failed: " + res.message);
        }
      },
      error: (err) => {
        console.error("Error saving defects", err);
        this.alertService.createAlert("An error occurred while saving the defects.");
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  // Placeholder methods for drag-and-drop to suppress TS errors
  onDragLeave($event: DragEvent) { }
  onDrop($event: DragEvent) { }
  onDragOver($event: DragEvent) { }
  onFileSelected($event: Event) { }
}