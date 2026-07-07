import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { ActiveGridDialogComponent } from 'src/app/pages/sqm/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { AuditDonePopupComponent } from 'src/app/pages/sqm/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/audit-done-popup/audit-done-popup.component';
import { PauditsNewAuditComponent } from 'src/app/pages/sqm/process-audits/paudits-new-audit/paudits-new-audit.component';

@Component({
  selector: 'app-sup-proactivegrid',
  templateUrl: './sup-proactivegrid.component.html',
  styleUrls: ['./sup-proactivegrid.component.scss']
})
export class SupProactivegridComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;

  // Single Column (Vertical Bar) Chart: Latest 10 Process Audit Scores
  auditScoreChartOptions: Highcharts.Options = {
    chart: { type: 'column', height: 350 },
    title: { text: 'Latest 10 Process Audit Scores', style: { color: '#666', fontSize: '18px' } },
    credits: { enabled: false },
    xAxis: {
      categories: [
        '254871', '254832', '254812', '254854', '254865', 
        '254866', '254867', '254868', '254869', '254870'
      ],
      title: { text: 'Audit Reference' },
      crosshair: true
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: 'Score (%)' }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                   '<td style="padding:0"><b>{point.y} %</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: { enabled: true, format: '{point.y}%' }
      }
    },
    series: [
      {
        type: 'column',
        name: 'Audit Score',
        data: [87, 80, 90, 75, 95, 82, 88, 79, 91, 94],
        color: '#2b6ca3' // Matched to your table header color
      }
    ]
  };

  // Table Data
auditData = [
  {
    ref: "2024/Process/254871",
    commodity: "Engine Block",
    location: "Chennai",
    supplier: "ABC Castings Pvt Ltd",
    auditor: "Vijay Mohan",
    date: "12-09-2024",
    action: "3/4",
    score: "87 %",
    status: "Completed",
    done: true,
  },
  {
    ref: "2024/Process/254832",
    commodity: "Transmission Case",
    location: "Pune",
    supplier: "XYZ Industries Ltd",
    auditor: "Arjun Sharma",
    date: "05-09-2024",
    action: "3/4",
    score: "80 %",
    status: "In Progress",
    done: false,
  },
  {
    ref: "2024/Process/254812",
    commodity: "Cylinder Head",
    location: "Bangalore",
    supplier: "LMN Castings Co",
    auditor: "Radhika Iyer",
    date: "22-08-2024",
    action: "3/4",
    score: "90 %",
    status: "Pending Review",
    done: false,
  },
  {
    ref: "2024/Process/254854",
    commodity: "Crankshaft",
    location: "Hyderabad",
    supplier: "PQR Castings Ltd",
    auditor: "Siva Kumar",
    date: "30-07-2024",
    action: "3/4",
    score: "75 %",
    status: "Open",
    done: false,
  },
  {
    ref: "2024/Process/254865",
    commodity: "Camshaft",
    location: "Mumbai",
    supplier: "DEF Automotive Ltd",
    auditor: "Manoj Singh",
    date: "15-07-2024",
    action: "3/4",
    score: "95 %",
    status: "Closed",
    done: true,
  },
];

  ngOnInit(): void { }

  constructor(private dialog: MatDialog) { }

  openaudit() {
    this.dialog.open(PauditsNewAuditComponent, {
      width: '600px',
      height: 'auto'
    });
  }

  openGridView() {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  openscorepdf(fileName: string): void {
    window.open(`assets/${fileName}`, '_blank');
  }

  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault(); // prevents the checkbox from toggling on its own

    const dialogRef = this.dialog.open(AuditDonePopupComponent, {
      width: '480px',
      data: { audit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        audit.done = !audit.done; // only toggle if user confirmed
      }
    });
  }
}