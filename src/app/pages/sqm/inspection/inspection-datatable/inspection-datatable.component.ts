import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRecordPopComponent } from '../add-record-pop/add-record-pop.component';
import { DefectsPopComponent } from './defects-pop/defects-pop.component';
import { ActiveGridDialogComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { InspectionService } from '../inspection.service';

@Component({
  selector: 'app-inspection-datatable',
  templateUrl: './inspection-datatable.component.html',
  styleUrls: ['./inspection-datatable.component.scss']
})
export class InspectionDatatableComponent implements OnInit, AfterViewInit {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  // ── ngx-charts Configuration ──
  public first:  any[] = []; 
  public multi:  any[] = []; 
  public triple: any[] = []; 
  
  public showLegend    = false;
  public showLabels    = true;
  public explodeSlices = false;
  public doughnut      = false;
  public gradient      = false;
  public colorScheme: any = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#0096A6', '#F47B00', '#606060']
  };

  public onSelect(event?: any) {
    console.log('Item clicked', event);
  }

  // --- Filter Variables ---
  allMockData: any[] = []; // Stores the unfiltered data
  mockdata: any[] = [];    // Stores the currently displayed data
  showFilter = false;

  filterObj = {
    date: null as Date | null,
    inspector: '',
    partFamily: '',
    partName: ''
  };

  constructor(
    private dialog: MatDialog,
    private inspectionService: InspectionService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.inspectionService.getAllInspections().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          // Added fallbacks (||) for case sensitivity to ensure ID and Publish map correctly
          this.allMockData = res.data.map((item: any) => ({
            id: item.inspectionId || item.InspectionId,
            
            stageId: item.stageId || item.StageId,
            supplierId: item.supplierId || item.SupplierId,
            shiftId: item.shiftId || item.ShiftId,
            inspectorId: item.inspectorId || item.InspectorId,
            partFamilyId: item.partFamilyId || item.PartFamilyId,
            partMasterId: item.partCodeId || item.PartCodeId, 
            batchId: item.batchNumberId || item.BatchNumberId,   
            
            Reference: item.referenceId || item.ReferenceId,
            Publish: item.publish ?? item.Publish ?? false,
            InspectionDate: item.inspectionDate || item.InspectionDate ? new Date(item.inspectionDate || item.InspectionDate).toISOString() : null,
            Time: item.time || item.Time,
            Inspector: item.inspectorName || item.InspectorName || '-',
            PartFamily: item.partFamilyName || item.PartFamilyName || '-',
            PartName: item.partMasterCode || item.PartMasterCode || '-', 
            PartNumber: item.partMasterCode || item.PartMasterCode || '-',
            Defects: item.defects || item.Defects || 0,
            Parameters: item.parameters || item.Parameters || 0,
            Remarks: item.remarks || item.Remarks || '-',
            BatchNumber: item.batchNumber || item.BatchNumber || '-',
            BatchQuantity: item.batchQuantity || item.BatchQuantity || 0, 
            SampleQuantity: item.sampleQuantity || item.SampleQuantity || 0,
            ErrorRatePct: (item.errorRate ?? item.ErrorRate) != null ? (item.errorRate ?? item.ErrorRate) + '%' : '0%',
            ErrorRatePPM: (item.errorRate ?? item.ErrorRate) != null ? ((item.errorRate ?? item.ErrorRate) * 10000) : 0, 
            stage: item.stageName || item.StageName || 'Unassigned'
          }));

          // Initialize grid with full data
          this.mockdata = [...this.allMockData];
          this.updateChartData();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load inspection records from API', err);
        this.mockdata = [];
        this.allMockData = [];
      }
    });
  }

  // --- NEW: Filter Methods ---
  applyFilter() {
    this.mockdata = this.allMockData.filter(item => {
      let matches = true;

      // Filter by Date
      if (this.filterObj.date && item.InspectionDate) {
        const itemDate = new Date(item.InspectionDate).toDateString();
        const filterDate = new Date(this.filterObj.date).toDateString();
        if (itemDate !== filterDate) matches = false;
      }

      // Filter by Inspector
      if (this.filterObj.inspector && item.Inspector !== this.filterObj.inspector) {
        matches = false;
      }

      // Filter by Part Family
      if (this.filterObj.partFamily && item.PartFamily !== this.filterObj.partFamily) {
        matches = false;
      }

      // Filter by Part Name
      if (this.filterObj.partName && item.PartName !== this.filterObj.partName) {
        matches = false;
      }

      return matches;
    });

    this.updateChartData();
  }

  clearFilter() {
    this.filterObj = { date: null, inspector: '', partFamily: '', partName: '' };
    this.mockdata = [...this.allMockData];
    this.updateChartData();
  }

  updateChartData() {
    const stageCounts: any = {};
    const familyCounts: any = {};
    const inspectorCounts: any = {};

    this.mockdata.forEach(item => {
      if (item.stage) stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
      if (item.PartFamily) familyCounts[item.PartFamily] = (familyCounts[item.PartFamily] || 0) + 1;
      if (item.Inspector) inspectorCounts[item.Inspector] = (inspectorCounts[item.Inspector] || 0) + 1;
    });

    this.first = Object.keys(stageCounts).map(key => ({ name: key, value: stageCounts[key] }));
    this.multi = Object.keys(familyCounts).map(key => ({ name: key, value: familyCounts[key] }));
    this.triple = Object.keys(inspectorCounts).map(key => ({ name: key, value: inspectorCounts[key] }));
  }

  scrollLeft()  { this.tableContainer?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' }); }
  scrollRight() { this.tableContainer?.nativeElement.scrollBy({ left:  300, behavior: 'smooth' }); }

  // -------------------------------------------------------------
  // ACTIONS (Add, Edit, Delete, Archive, Publish)
  // -------------------------------------------------------------

  addrecord(data: any) { 
    const dialogRef = this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data: null }); 
    dialogRef.afterClosed().subscribe(res => { if(res) this.loadData(); });
  }

  openEditDialog(item: any) { 
    const dialogRef = this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data: item }); 
    dialogRef.afterClosed().subscribe(res => { if(res) this.loadData(); });
  }

  deleteConfirmation(item: any) { 
    if(confirm('Are you sure you want to delete this record?')) {
      this.inspectionService.deleteInspection(item.id).subscribe({
        next: (res) => { if(res.success) this.loadData(); },
        error: (err) => alert('Failed to delete record')
      });
    }
  }

  archiveRecord(item: any) { 
    if(confirm('Are you sure you want to archive this record?')) {
      this.inspectionService.archiveInspection(item.id).subscribe({
        next: (res) => { if(res.success) this.loadData(); },
        error: (err) => alert('Failed to archive record')
      });
    }
  }

togglePublish(item: any) {
    if (!item.id) {
      alert("Error: Inspection ID is missing.");
      item.Publish = !item.Publish; // Revert
      return;
    }

    // Send both the ID and the current checkbox state (item.Publish)
    this.inspectionService.togglePublish(item.id, item.Publish).subscribe({
      next: (res) => { 
        console.log('Publish status updated successfully to: ', item.Publish); 
      },
      error: (err) => {
        alert('Failed to update publish status. Check console for details.');
        console.error(err);
        item.Publish = !item.Publish; // Revert checkbox if API fails
        this.cdr.detectChanges();
      }
    });
  }

  openDefectsPop(item: any) { this.dialog.open(DefectsPopComponent,   { width: '1400px', height: 'auto', data: item }); }
  
  openGridView(data:any) {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog' 
    });
  }

  ngAfterViewInit(): void { }
}