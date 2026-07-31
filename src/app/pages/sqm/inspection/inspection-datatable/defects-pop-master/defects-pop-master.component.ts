import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DefectsPopComponent } from '../defects-pop/defects-pop.component';
import { InspectionService } from '../../inspection.service';

@Component({
  selector: 'app-defects-pop-master',
  templateUrl: './defects-pop-master.component.html',
  styleUrls: ['./defects-pop-master.component.scss']
})
export class DefectsPopMasterComponent implements OnInit {

  gridCells: any[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12

  constructor(private inspectionService: InspectionService) {}

  ngOnInit(): void {
    this.fetchDefectData();
  }

  fetchDefectData(): void {
    this.inspectionService.getDefectStats(this.selectedYear, this.selectedMonth).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.mapToGrid(res.data);
        }
      },
      error: (err) => {
        console.error("Error fetching defect stats", err);
      }
    });
  }

  mapToGrid(defectsData: any[]): void {
    // Map API data to UI blocks
    this.gridCells = defectsData.map(defect => ({
      // Example label output: "Scratch \n Count: 3 \n Avg: 2"
      label: `${defect.defectName}\nCount: ${defect.count}\nAvg: ${defect.averageStatus}`,
      bgColor: this.getColorBasedOnAverage(defect.averageStatus),
      textColor: '#000000',
      rawData: defect // Keep raw data if needed for clicking/toggling
    }));

    // Optional: Fill remaining blocks to always maintain the 5x10 (50 blocks) grid look
    const maxGridBlocks = 50; 
    while (this.gridCells.length < maxGridBlocks) {
      this.gridCells.push({
        label: '-',
        bgColor: '#f9f9f9',
        textColor: '#cccccc'
      });
    }
  }

  // Define your status color logic here
  getColorBasedOnAverage(avgStatus: number): string {
    if (avgStatus <= 2) return '#ffcccc'; // Red-ish for bad
    if (avgStatus <= 4) return '#fff2cc'; // Yellow-ish for medium
    return '#d9ead3';                     // Green-ish for good (5)
  }

  toggleColor(cell: any): void {
    if (cell.label === '-') return; // ignore empty cells
    console.log('Clicked defect:', cell.rawData);
    // Add custom toggle logic if needed
  }

  close(): void {
    // Logic to close dialog
  }

}