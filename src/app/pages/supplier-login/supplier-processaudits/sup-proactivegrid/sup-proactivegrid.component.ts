import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import * as Highcharts from 'highcharts';
import { ActiveGridDialogComponent } from 'src/app/pages/sqm/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { ProcessAuditService } from 'src/app/pages/sqm/process-audits/process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-sup-proactivegrid',
  templateUrl: './sup-proactivegrid.component.html',
  styleUrls: ['./sup-proactivegrid.component.scss']
})
export class SupProactivegridComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Chart Configuration
  auditScoreChartOptions: Highcharts.Options = {
    chart: { type: 'column', height: 350 },
    title: { text: 'Latest 10 Process Audit Scores', style: { color: '#666', fontSize: '18px' } },
    credits: { enabled: false },
    xAxis: { categories: [], title: { text: 'Audit Reference' }, crosshair: true },
    yAxis: { min: 0, max: 100, title: { text: 'Score (%)' } },
    tooltip: { shared: true, useHTML: true },
    plotOptions: { column: { pointPadding: 0.2, borderWidth: 0, dataLabels: { enabled: true, format: '{point.y}%' } } },
    series: [{ type: 'column', name: 'Audit Score', data: [], color: '#2b6ca3' }]
  };

  auditData: any[] = [];
  statusLookups: any[] = [];

  constructor(
    private dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void { 
    this.loadLookups();
  }

  loadLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.statusLookups = res.data.filter((l: any) => l.codeMasterName === 'Audit-Status');
      }
      this.loadData();
    });
  }

// loadData() {
//     // 🔥 Grab the logged-in Supplier's ID
//     const supplierId = Number(localStorage.getItem('UserId')) || 0;

//     // 🔥 Pass it to the API
//     this.api.getAllAuditsSupplier(supplierId).subscribe((res: any) => {
//       if (res.success) {
//         this.auditData = res.data.map((item: any) => {
//           const statusObj = this.statusLookups.find((l: any) => l.lookupId === item.statusId);
//           return {
//             processAuditId: item.processAuditId,
//             ref: item.auditReference,
//             commodity: item.commodityName,
//             location: item.cityName,
//             supplier: item.supplierName,
//             auditor: item.auditorName,
//             date: new Date(item.auditDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
//             action: item.capaSummary,
//             score: item.report ? item.report + ' %' : '0 %',
//             status: statusObj ? statusObj.lookupName : 'Open',
//             done: item.isDone,
//             rawScore: parseInt(item.report || '0', 10)
//           };
//         });
//         this.updateChart();
//       }
//     });
//   }


loadData() {
  const supplierId = Number(localStorage.getItem('UserId')) || 0;

  this.api.getAllAuditsSupplier(supplierId).subscribe((res: any) => {
    if (res.success) {
      this.auditData = res.data.map((item: any) => {
        const statusObj = this.statusLookups.find((l: any) => l.lookupId === item.statusId);
        return {
          processAuditId: item.processAuditId,  // 🔥 Required for routing
          auditReference: item.auditReference,  // 🔥 Required for routing
          ref: item.auditReference,
          commodity: item.commodityName,
          location: item.cityName,
          supplier: item.supplierName,
          auditor: item.auditorName,
          date: new Date(item.auditDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
          action: item.capaSummary,
          score: item.report ? item.report + ' %' : '0 %',
          status: statusObj ? statusObj.lookupName : 'Open',
          done: item.isDone,
          rawScore: parseInt(item.report || '0', 10)
        };
      });
      this.updateChart();
    }
  });
}

  updateChart() {
    const latest10 = this.auditData.slice(0, 10);
    const categories = latest10.map(a => a.ref.split('/').pop());
    const scores = latest10.map(a => a.rawScore);

    this.auditScoreChartOptions = {
      ...this.auditScoreChartOptions,
      xAxis: { ...this.auditScoreChartOptions.xAxis, categories: categories },
      series: [{ type: 'column', name: 'Audit Score', data: scores, color: '#2b6ca3' }]
    };
  }

  openGridView() {
    this.dialog.open(ActiveGridDialogComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  openscorepdf(fileName: string): void { window.open(`assets/${fileName}`, '_blank'); }

  // 🔥 Strictly Read-Only
  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault(); 
    this.alertService.createAlert('Suppliers cannot modify the Done status.', 0);
  }
}