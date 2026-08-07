import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRecordPopComponent } from 'src/app/pages/sqm/inspection/add-record-pop/add-record-pop.component';
import { DefectsPopComponent } from 'src/app/pages/sqm/inspection/inspection-datatable/defects-pop/defects-pop.component';
import { ActiveGridDialogComponent } from 'src/app/pages/sqm/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { InspectionService } from 'src/app/pages/sqm/inspection/inspection.service'; // Ensure correct path

@Component({
  selector: 'app-supplier-activerecords',
  templateUrl: './supplier-activerecords.component.html',
  styleUrls: ['./supplier-activerecords.component.scss']
})
export class SupplierActiverecordsComponent implements OnInit {

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  // ── ngx-charts Configuration ──
  public first:  any[] = []; // Inspection by Stage
  public multi:  any[] = []; // Distribution by Part Family
  public triple: any[] = []; // By Inspector
  
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

  // ── Grid Data ──
  inspectionData: any[] = [];
  showFilter = false;

  constructor(
    private dialog: MatDialog,
    private api: InspectionService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // 🔥 Grab the logged-in Supplier's ID
    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    // 🔥 Pass it to the API
    this.api.getAllInspections(supplierId).subscribe((res: any) => {
      if (res.success) {
        this.inspectionData = res.data.map((item: any) => {
          return {
            id: item.inspectionId,
            Reference: item.referenceId,
            Publish: item.publish,
            InspectionDate: item.inspectionDate ? new Date(item.inspectionDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            Time: item.time || '-',
            Inspector: item.inspectorName || 'N/A',
            PartFamily: item.partFamilyName || 'N/A',
            PartName: item.partMasterCode || 'N/A',
            PartNumber: item.partMasterCode || 'N/A',
            Defects: item.defects,
            Parameters: item.parameters,
            Remarks: item.remarks || '-',
            BatchNumber: item.batchNumber || 'N/A',
            BatchQuantity: item.batchQuantity || 0,
            SampleQuantity: item.sampleQuantity || 0,
            ErrorRatePct: item.errorRate,
            ErrorRatePPM: '0', 
            stage: item.stageName || 'N/A'
          };
        });
        this.updateChartData();
      }
    });
  }

  // Dynamically calculate chart data based on inspectionData
  updateChartData() {
    const stageCounts: any = {};
    const familyCounts: any = {};
    const inspectorCounts: any = {};

    this.inspectionData.forEach(item => {
      // Count Stages
      stageCounts[item.stage] = (stageCounts[item.stage] || 0) + 1;
      // Count Part Families
      familyCounts[item.PartFamily] = (familyCounts[item.PartFamily] || 0) + 1;
      // Count Inspectors
      inspectorCounts[item.Inspector] = (inspectorCounts[item.Inspector] || 0) + 1;
    });

    // Map to ngx-charts format: { name: string, value: number }
    this.first = Object.keys(stageCounts).map(key => ({ name: key, value: stageCounts[key] }));
    this.multi = Object.keys(familyCounts).map(key => ({ name: key, value: familyCounts[key] }));
    this.triple = Object.keys(inspectorCounts).map(key => ({ name: key, value: inspectorCounts[key] }));
  }

  scrollLeft()  { this.tableContainer?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' }); }
  scrollRight() { this.tableContainer?.nativeElement.scrollBy({ left:  300, behavior: 'smooth' }); }

  addrecord(data: any)          { this.dialog.open(AddRecordPopComponent, { width: '1000px', height: 'auto', data }); }
  openDefectsPop(item: any)     { this.dialog.open(DefectsPopComponent,   { width: '1400px', height: 'auto', data: { ...item, isReadOnly: true } }); }
  openEditDialog(item: any)     { console.log('Edit clicked for:', item);    }
  deleteConfirmation(item: any) { console.log('Delete clicked for:', item);  }
  archiveRecord(item: any)      { console.log('Archive clicked for:', item); }

  openGridView(data:any) {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog' 
    });
  }

  ngAfterViewInit(): void {
    // code after view initialization
  }
}