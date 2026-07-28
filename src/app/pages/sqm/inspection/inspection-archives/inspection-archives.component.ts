import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DefectsPopComponent } from '../inspection-datatable/defects-pop/defects-pop.component';
import { AddRecordPopComponent } from '../add-record-pop/add-record-pop.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { InspectionService } from '../inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-inspection-archives',
  templateUrl: './inspection-archives.component.html',
  styleUrls: ['./inspection-archives.component.scss'],
  providers: [DatePipe] // Provide DatePipe for formatting dates
})
export class InspectionArchivesComponent implements OnInit {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  mockdata: any[] = [];
  pagedMockdata: any[] = [];
  pageSize = 5;
  pageIndex = 0;
  totalSize = 0;
  allMockData: any[] = [];
  showFilter = true;
  filterToggle: boolean = false;
  myGroup!: FormGroup;

  // Filter Arrays for UI
  inspectors: string[] = [];
  partFamilies: string[] = [];
  partNames: string[] = [];
  filteredPartNames: string[] = [];
  batchNumbers: string[] = [];
  partNameSearch = '';

  constructor(
    private dialog: MatDialog,
    private inspectionService: InspectionService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    // Initialize the form group to prevent HTML errors
    this.myGroup = new FormGroup({
      inspectionDate: new FormControl(''),
      inspector: new FormControl(''),
      partFamily: new FormControl(''),
      partName: new FormControl(''),
      partNumber: new FormControl(''),
      batchNumber: new FormControl('')
    });
    this.loadData();
  }

  // --- API INTEGRATION ---
  loadData() {
    this.inspectionService.getAllArchived().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.allMockData = res.data.map((item: any) => ({
            id: item.inspectionId,
            Reference: item.referenceId || '-',
            Publish: item.publish ?? false,
            InspectionDate: item.inspectionDate ? this.datePipe.transform(item.inspectionDate, 'dd/MM/yyyy') : '-',
            Time: item.time || '-',
            Inspector: item.inspectorName || '-',
            PartFamily: item.partFamilyName || '-',
            PartName: item.partMasterCode || '-',
            PartNumber: item.partMasterCode || '-',
            Defects: item.defects || '0/0',
            Parameters: item.parameters || '0',
            Remarks: item.remarks || '-',
            BatchNumber: item.batchNumber || '-',
            BatchQuantity: item.batchQuantity || 0,
            SampleQuantity: item.sampleQuantity || 0,
            ErrorRatePct: item.errorRate != null ? item.errorRate + '%' : '0%',
            ErrorRatePPM: item.errorRate != null ? (item.errorRate * 10000) : 0,
            
            // Hidden Ids useful for Edit/Delete
            stageId: item.stageId,
            supplierId: item.supplierId,
            shiftId: item.shiftId,
            inspectorId: item.inspectorId,
            partFamilyId: item.partFamilyId,
            partMasterId: item.partCodeId,
            batchId: item.batchNumberId
          }));

          this.mockdata = [...this.allMockData];
          this.populateFilterDropdowns();
          this.pageIndex = 0;
          this.updatePagedList();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load archived records', err);
        this.mockdata = [];
        this.allMockData = [];
      }
    });
  }

  populateFilterDropdowns() {
    this.inspectors = Array.from(new Set(this.allMockData.map(item => item.Inspector).filter(item => item && item !== '-'))).sort();
    this.partFamilies = Array.from(new Set(this.allMockData.map(item => item.PartFamily).filter(item => item && item !== '-'))).sort();
    this.partNames = Array.from(new Set(this.allMockData.map(item => item.PartName).filter(item => item && item !== '-'))).sort();
    this.filteredPartNames = [...this.partNames];
    this.batchNumbers = Array.from(new Set(this.allMockData.map(item => item.BatchNumber).filter(item => item && item !== '-'))).sort();
  }

  filterPartNames(search: string) {
    this.partNameSearch = search;
    const term = search.toLowerCase().trim();
    this.filteredPartNames = this.partNames.filter(name => name.toLowerCase().includes(term));
  }

  // --- ACTIONS ---

  togglePublish(item: any) {
    if (!item.id) {
      this.alertService.createAlert("Error: Inspection ID is missing.", 0);
      item.Publish = !item.Publish; // Revert
      return;
    }

    this.inspectionService.togglePublish(item.id, item.Publish).subscribe({
      next: (res) => {
        this.alertService.createAlert(`Record ${item.Publish ? 'published' : 'unpublished'} successfully!`, 1);
      },
      error: (err) => {
        this.alertService.createAlert('Failed to update publish status.', 0);
        item.Publish = !item.Publish; // Revert checkbox if API fails
        this.cdr.detectChanges();
      }
    });
  }

  openEditDialog(item: any) {
    const dialogRef = this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data: item });
    dialogRef.afterClosed().subscribe(res => { 
      if (res) this.loadData(); 
    });
  }

  openDefectsPop(item: any) {
    const dialogRef = this.dialog.open(DefectsPopComponent, { width: '1400px', height: 'auto', data: item });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.alertService.createAlert('Defects saved successfully!', 1);
        this.loadData();
      }
    });
  }

  deleteConfirmation(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to permanently delete this record?', confirmText: 'Delete' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.deleteInspection(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('Record deleted successfully!', 1);
              this.loadData();
            }
          },
          error: (err) => this.alertService.createAlert('Failed to delete record', 0)
        });
      }
    });
  }

  unarchiveRecord(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Unarchive Confirmation', content: 'Are you sure you want to unarchive this record and return it to Active status?', confirmText: 'Unarchive' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Calling the toggle archive endpoint to restore it
        this.inspectionService.archiveInspection(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('Record unarchived successfully!', 1);
              this.loadData();
            }
          },
          error: (err) => this.alertService.createAlert('Failed to unarchive record', 0)
        });
      }
    });
  }

  // --- UI Scrolling & Filtering ---
  scrollLeft() { 
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' }); 
    }
  }

  scrollRight() { 
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' }); 
    }
  }

  processgrid() {
    // Implement grid column toggling if needed
  }

  updatePagedList() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMockdata = this.mockdata.slice(startIndex, endIndex);
    this.totalSize = this.mockdata.length;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedList();
  }

  clearFilter() {
    this.myGroup.reset({
      inspectionDate: '',
      inspector: '',
      partFamily: '',
      partName: '',
      partNumber: '',
      batchNumber: ''
    });
    this.partNameSearch = '';
    this.filteredPartNames = [...this.partNames];
    this.mockdata = [...this.allMockData];
    this.pageIndex = 0;
    this.updatePagedList();
  }

  go() {
    const filters = this.myGroup.value;
    const dateVal = filters.inspectionDate;
    const inspectorVal = filters.inspector;
    const partFamilyVal = filters.partFamily;
    const partNameVal = filters.partName;
    const partNumberVal = filters.partNumber ? filters.partNumber.toLowerCase().trim() : '';
    const batchNumberVal = filters.batchNumber;

    this.mockdata = this.allMockData.filter(item => {
      let isMatch = true;

      // 1. Date filter (item.InspectionDate is string in 'dd/MM/yyyy' format)
      if (dateVal) {
        if (!item.InspectionDate || item.InspectionDate === '-') {
          isMatch = false;
        } else {
          const parsedFilterDate = this.datePipe.transform(new Date(dateVal), 'dd/MM/yyyy');
          if (item.InspectionDate !== parsedFilterDate) {
            isMatch = false;
          }
        }
      }

      // 2. Inspector
      if (inspectorVal) {
        isMatch = isMatch && item.Inspector === inspectorVal;
      }

      // 3. Part Family
      if (partFamilyVal) {
        isMatch = isMatch && item.PartFamily === partFamilyVal;
      }

      // 4. Part Name
      if (partNameVal) {
        isMatch = isMatch && item.PartName === partNameVal;
      }

      // 5. Part Number
      if (partNumberVal) {
        isMatch = isMatch && !!(item.PartNumber && item.PartNumber.toLowerCase().includes(partNumberVal));
      }

      // 6. Batch Number
      if (batchNumberVal) {
        isMatch = isMatch && item.BatchNumber === batchNumberVal;
      }

      return isMatch;
    });

    this.pageIndex = 0;
    this.updatePagedList();
  }
}