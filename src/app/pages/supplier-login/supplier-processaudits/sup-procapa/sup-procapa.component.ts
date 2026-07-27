import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ProcessAuditService } from 'src/app/pages/sqm/process-audits/process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ActionDescRemarksComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsGridComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { ProcessDocPopComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-doc-pop/process-doc-pop.component';

@Component({
  selector: 'app-sup-procapa',
  templateUrl: './sup-procapa.component.html',
  styleUrls: ['./sup-procapa.component.scss']
})
export class SupProcapaComponent implements OnInit {

  filterToggle: boolean = false;
  isAlertsView: boolean = false;
  totalSize = 0;
  myGroup!: FormGroup;

  originalTableList: any[] = [];
  tableList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  TractorIdSections: any[] = [];
  responsibleSections: any[] = [];
  resSectionFilterLeads: any[] = [];

  constructor(
    public dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl('')
    });

    this.loadData();
  }

// loadData() {
//     //   Grab the logged-in Supplier's ID
//     const supplierId = Number(localStorage.getItem('UserId')) || 0;

//     //   Pass it to the API
//     this.api.getAllCapasSupplie(supplierId).subscribe((res: any) => {
//       if (res.success) {
//         this.originalTableList = res.data.map((item: any) => ({
//           capaId: item.capaId,
//           status: item.status,
//           resolved: item.resolved,
//           docs: item.docs,
//           reference: item.reference,
//           actionSubject: item.actionSubject,
//           supplierName: item.supplierName,
//           actionType: item.actionType,
//           auditReference: item.auditReference,
//           processCategory: item.processCategory,
//           description: item.description,
//           supplierRemarks: item.supplierRemarks,
//           logDate: new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
//           dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
//           delayInDays: item.delayInDays,
//           completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
//           severity: item.severity,
//           occurrence: item.occurrence,
//           detection: item.detection,
//           riskRating: item.riskRating,
//           rating: item.rating,
//           pdcaStatus: item.pdcaStatus,
//           isAlert: item.delayInDays > 5 
//         }));
        
//         this.tableList = [...this.originalTableList];
//         this.totalSize = this.tableList.length;

//         // Dynamic filters based on actual loaded data
//         this.TractorIdSections = [...new Set(res.data.map((i: any) => i.processCategory).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
//         this.responsibleSections = [...new Set(res.data.map((i: any) => i.supplierName).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
//         this.resSectionFilterLeads = [...new Set(res.data.map((i: any) => i.actionType).filter(Boolean))].map(val => ({ UserId: val, UserName: val }));
//       }
//     });
//   }

loadData() {
  const supplierId = Number(localStorage.getItem('UserId')) || 0;

  this.api.getAllCapasSupplie(supplierId).subscribe((res: any) => {
    if (res.success) {
      this.originalTableList = res.data.map((item: any) => ({
        capaId: item.capaId,
        processAuditId: item.processAuditId,        // 🔥 Added
        processCategoryId: item.processCategoryId,  // 🔥 Added
        checklistId: item.checklistId,              // 🔥 Added
        auditReference: item.auditReference,        // 🔥 Added
        status: item.status,
        resolved: item.resolved,
        docs: item.docs,
        reference: item.reference,
        actionSubject: item.actionSubject,
        supplierName: item.supplierName,
        actionType: item.actionType,
        processCategory: item.processCategory,
        description: item.description,
        supplierRemarks: item.supplierRemarks,
        logDate: new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
        dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
        delayInDays: item.delayInDays,
        completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
        severity: item.severity,
        occurrence: item.occurrence,
        detection: item.detection,
        riskRating: item.riskRating,
        rating: item.rating,
        pdcaStatus: item.pdcaStatus,
        isAlert: item.delayInDays > 5 
      }));
      
      this.tableList = [...this.originalTableList];
      this.totalSize = this.tableList.length;

      // Dynamic filters
      this.TractorIdSections = [...new Set(res.data.map((i: any) => i.processCategory).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
      this.responsibleSections = [...new Set(res.data.map((i: any) => i.supplierName).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
      this.resSectionFilterLeads = [...new Set(res.data.map((i: any) => i.actionType).filter(Boolean))].map(val => ({ UserId: val, UserName: val }));
    }
  });
}

  get alertsCount(): number { return this.originalTableList.filter(item => item.isAlert).length; }

  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    this.tableList = this.isAlertsView ? this.originalTableList.filter(item => item.isAlert) : [...this.originalTableList];
    this.totalSize = this.tableList.length;
    if (this.paginator) this.paginator.firstPage();
  }

  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword?.toLowerCase() || '';
    const processCat = filters.TractorIdSections;
    const actionType = filters.ResponsibleSectionLeadId;

    let baseList = this.isAlertsView ? this.originalTableList.filter(item => item.isAlert) : this.originalTableList;

    this.tableList = baseList.filter(item => {
      let isMatch = true;
      if (keyword) {
        const searchStr = `${item.reference} ${item.actionSubject} ${item.actionType} ${item.auditReference} ${item.description}`.toLowerCase();
        isMatch = isMatch && searchStr.includes(keyword);
      }
      if (processCat) isMatch = isMatch && item.processCategory === processCat;
      if (actionType) isMatch = isMatch && item.actionType === actionType;
      
      return isMatch;
    });

    this.totalSize = this.tableList.length;
    if (this.paginator) this.paginator.firstPage();
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false;
    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;
    if (this.paginator) this.paginator.firstPage();
  }

  scrollRight() { document.getElementById('grid-table-container')?.scrollBy({ left: 300, behavior: 'smooth' }); }
  scrollLeft() { document.getElementById('grid-table-container')?.scrollBy({ left: -300, behavior: 'smooth' }); }

  imageSource1() { this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' }); }
  processgrid() { this.dialog.open(ProcessActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' }); }
  docsPhoto() { this.dialog.open(ProcessDocPopComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' }); }

  // 🔥 Strictly Read-Only
  deleteConfirmation(item: any) {
    this.alertService.createAlert('Suppliers do not have permission to delete CAPA records.', 0);
  }
}