import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { PartsAddParameterComponent } from '../../parts-audits/parts-active-audits/parts-reference/parts-add-parameter/parts-add-parameter.component';
import { AuditrefRemarksPopComponent } from '../../parts-inner-screen/parts-audit-reference/auditref-remarks-pop/auditref-remarks-pop.component';
import { ViewDocPhotosComponent } from '../../parts-audits/parts-actions/view-doc-photos/view-doc-photos.component';
import { UploadstagepopComponent } from './uploadstagepop/uploadstagepop.component';
import { UploadListComponent } from './upload-list/upload-list.component';
import { SamplePopComponent } from './sample-pop/sample-pop.component';
import { InspectionService } from '../../inspection/inspection.service';

@Component({
  selector: 'app-active-records-ref',
  templateUrl: './active-records-ref.component.html',
  styleUrls: ['./active-records-ref.component.scss']
})
export class ActiveRecordsRefComponent implements OnInit {

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  
  currentInspectionId: number = 0;
  currentReference: string = '';
  currentPartFamily: string = '';
  currentPartName: string = '';

  pageSize = 10;
  pageIndex = 0;
  
  tableData: any[] = [];
  pagedData: any[] = [];
  totalFilteredRecords = 0; // Tracks total count for paginator

  // Category Filtering & Mapping
  categories: string[] = [];
  selectedCategory: string = 'All';
  categoryMap: { [key: string]: any } = {}; // Holds dynamic IDs for each category

  constructor(
    private location: Location,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private inspectionService: InspectionService 
  ) { }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentInspectionId = Number(params['inspectionId']); 
      this.currentReference = params['reference'];
      this.currentPartFamily = params['partFamily'];
      this.currentPartName = params['partName'];

      if (this.currentInspectionId && !isNaN(this.currentInspectionId)) {
        this.loadParameters();
      }
    });
  }

  loadParameters() {
    this.inspectionService.getInspectionParameters(this.currentInspectionId).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          
          this.tableData = res.data.map((item: any) => {
            const catName = item.categoryName || item.CategoryName;

            // Store category ID references dynamically so we can use them when saving
            if (!this.categoryMap[catName]) {
              this.categoryMap[catName] = {
                partId: item.partId || item.PartId,
                partFamilyId: item.partFamilyId || item.PartFamilyId,
                partNameId: item.partNameId || item.PartNameId
              };
            }

            return {
              id: item.id || item.Id,
              parameter: item.parameter || item.Parameter,
              categoryName: catName,
              spec: item.spec || item.Spec,
              unit: item.unit || item.Unit,
              min: item.min || item.Min,
              max: item.max || item.Max,
              defects: item.defects || item.Defects || '0',
              defectRate: '0%', 
              okay: item.okay || item.Okay,
              capa: item.capa || item.Capa,
              method: item.method || item.Method,
              s1: item.s1 || item.S1,
              s2: item.s2 || item.S2,
              s3: item.s3 || item.S3,
              s4: item.s4 || item.S4,
              s5: item.s5 || item.S5,
              remarks: item.remarks || item.Remarks
            };
          });

          // Extract unique categories for the buttons
          const uniqueCategories = new Set(this.tableData.map(x => x.categoryName).filter(c => c));
          this.categories = ['All', ...Array.from(uniqueCategories)];
          
          // Only reset to 'All' if it's the first time loading, 
          // otherwise keep the user on their current tab after a save refresh.
          if (!this.categories.includes(this.selectedCategory)) {
            this.selectedCategory = 'All';
          }

          this.updatePage();
        }
      },
      error: (err) => {
        console.error('Failed to load parameters', err);
      }
    });
  }

  // --- Category Selection Method ---
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.pageIndex = 0; // Reset to first page when filtering
    this.updatePage();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  private updatePage(): void {
    // 1. Filter by Category
    const filteredData = this.selectedCategory === 'All' 
      ? this.tableData 
      : this.tableData.filter(x => x.categoryName === this.selectedCategory);

    // 2. Update Total count for the paginator
    this.totalFilteredRecords = filteredData.length;

    // 3. Apply Pagination on the filtered list
    const start = this.pageIndex * this.pageSize;
    this.pagedData = filteredData.slice(start, start + this.pageSize);
  }

  // --- Save / Edit Logic ---

  addchecklistaudit() { 
    if (this.selectedCategory === 'All') {
      alert("Please select a specific category tab first to add a parameter to it.");
      return;
    }

    const dialogRef = this.dialog.open(PartsAddParameterComponent, { height: 'auto', width: '850px' }); 
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveParameterToDb(result);
      }
    });
  }

  editParameter(item: any) { 
    const dialogRef = this.dialog.open(PartsAddParameterComponent, { height: 'auto', width: '850px', data: item }); 
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ensure the ID and category name are passed back so the backend knows to Update
        result.id = item.id;
        result.categoryName = item.categoryName; 
        this.saveParameterToDb(result);
      }
    });
  }

  private saveParameterToDb(result: any) {
    // If editing from the "All" tab, use the item's specific category. Otherwise, use the selected tab.
    const targetCategory = (this.selectedCategory === 'All' && result.categoryName) 
      ? result.categoryName 
      : this.selectedCategory;

    const categoryIds = this.categoryMap[targetCategory];

    const payload = {
      InspectionRefId: result.id || 0,
      InspectionId: this.currentInspectionId,
      PartId: categoryIds?.partId || null,
      PartFamilyId: categoryIds?.partFamilyId || null,
      PartNameId: categoryIds?.partNameId || null,
      ParameterName: result.parameter,
      Spec: result.spec,
      Min: result.min ? result.min.toString() : null,
      Max: result.max ? result.max.toString() : null,
      Method: result.method,
      S1: result.s1 ? result.s1.toString() : null,
      S2: result.s2 ? result.s2.toString() : null,
      S3: result.s3 ? result.s3.toString() : null,
      S4: result.s4 ? result.s4.toString() : null,
      S5: result.s5 ? result.s5.toString() : null,
      Remarks: result.remarks
    };

    // Ensure you added addOrUpdateInspectionParameter to your inspection.service.ts
    this.inspectionService.addOrUpdateInspectionParameter(payload).subscribe({
      next: (res) => {
        if (res.success) {
          // Reload data to reflect the newly inserted record in the table
          this.loadParameters(); 
        } else {
          alert("Failed to save parameter: " + res.message);
        }
      },
      error: (err) => {
        console.error("Error saving parameter", err);
        alert("An error occurred while saving. Check console for details.");
      }
    });
  }

  deleteParameter(item: any): void {
    const confirmDelete = window.confirm('Are you sure you want to delete?');
    if (confirmDelete) {
      // NOTE: You'll likely want to create a delete method in your C# API later to delete from DB
      // For now, this just removes it from the frontend array
      const index = this.tableData.indexOf(item);
      if (index > -1) {
        this.tableData.splice(index, 1);
        this.updatePage();
      }
    }
  }

  // --- Utility Modals ---

  opendocpop() { this.dialog.open(ViewDocPhotosComponent, { width: '600px', height: '450px' }); }
  opennotes() { this.dialog.open(AuditrefRemarksPopComponent, { width: '500px', height: 'auto' }); }
  uploadstages() { this.dialog.open(UploadstagepopComponent, { width: '800px', height: 'auto' }); }
  openuploadpop() { this.dialog.open(UploadListComponent, { width: '600px', height: 'auto' }); }
  opensamplepop() { this.dialog.open(SamplePopComponent, { width: '700px', height: 'auto' }); }

  scrollTable(direction: 'left' | 'right') {
    if (this.tableContainer) {
      const container = this.tableContainer.nativeElement;
      const scrollAmount = 400; 
      if (direction === 'left') container.scrollLeft -= scrollAmount;
      else container.scrollLeft += scrollAmount;
    }
  }
}