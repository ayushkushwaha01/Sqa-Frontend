import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import * as Highcharts from 'highcharts';
import { DefectsPopMasterComponent } from '../inspection-datatable/defects-pop-master/defects-pop-master.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { InspectionService } from '../inspection.service';

@Component({
  selector: 'app-inspection-analytics',
  templateUrl: './inspection-analytics.component.html',
  styleUrls: ['./inspection-analytics.component.scss']
})
export class InspectionAnalyticsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  Highcharts: typeof Highcharts = Highcharts;

  chartsReady = true;

  isDailyView = false;
  showFilter = false;

  // Filter Data
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  selectedDay: number = new Date().getDate();

  availableYears = [2024, 2025, 2026, 2027];
  availableMonths = [
    { value: 1, name: 'Jan' }, { value: 2, name: 'Feb' }, { value: 3, name: 'Mar' },
    { value: 4, name: 'Apr' }, { value: 5, name: 'May' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' }, { value: 8, name: 'Aug' }, { value: 9, name: 'Sep' },
    { value: 10, name: 'Oct' }, { value: 11, name: 'Nov' }, { value: 12, name: 'Dec' }
  ];
  availableDays: number[] = [];

  // Active Data Variables
  activeIncoming = '0%';
  activeStartUp = '0%';
  activeProcess = '0%';
  activeFinal = '0%';

  activeAnnualPpmOptions: Highcharts.Options = {};
  activeMonthlyPpmOptions: Highcharts.Options = {};
  activeDefectsPieOptions: Highcharts.Options = {};
  activeProductsPieOptions: Highcharts.Options = {};

  topDefectsLeft: any[] = [];
  topDefectsRight: any[] = [];
  activeInspectorActivities: any[] = [];
  paginatedInspectorActivities: any[] = [];

  pieColors = ['#2caffe', '#544fc5', '#00e272', '#fe6a35', '#6b8abc', '#d568fb', '#2ee0ca', '#fa4b42', '#feb56a', '#91e8e1'];

  constructor(
    private dialog: MatDialog,
    private inspectionService: InspectionService
  ) { }

  ngOnInit(): void {
    // this.updateDaysInMonth();
    // this.fetchAnalyticsData();
  }

  updateDaysInMonth(): void {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.availableDays = Array.from({ length: days }, (_, i) => i + 1);

    if (this.selectedDay > days) {
      this.selectedDay = days;
    }
  }

  fetchAnalyticsData(): void {
    this.chartsReady = false;
    if (this.isDailyView) {
      this.setDailyData();
    } else {
      this.setMonthlyData();
    }
  }

  switchToDaily(): void {
    if (!this.isDailyView) {
      this.isDailyView = true;
      if (this.paginator) this.paginator.firstPage();
      this.fetchAnalyticsData();
    }
  }

  switchToMonthly(): void {
    if (this.isDailyView) {
      this.isDailyView = false;
      if (this.paginator) this.paginator.firstPage();
      this.fetchAnalyticsData();
    }
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  setMonthlyData(): void {
    // 6 Specific endpoints for Monthly View
    forkJoin({
      annualPpm: this.inspectionService.getMonthlyErrorRates(this.selectedYear),
      monthlyPpm: this.inspectionService.getDailyErrorRates(this.selectedYear, this.selectedMonth),
      partFamilies: this.inspectionService.getMonthlyPartFamilyCounts(this.selectedYear, this.selectedMonth),
      allDefects: this.inspectionService.getMonthlyDefectCounts(this.selectedYear, this.selectedMonth),
      topDefects: this.inspectionService.getTopDefectCounts(this.selectedYear, this.selectedMonth),
      inspectors: this.inspectionService.getTopInspectorCounts(this.selectedYear, this.selectedMonth)
    }).subscribe(responses => {

      // Safely map data arrays using || []
      const annualDataList = responses.annualPpm.data || responses.annualPpm.Data || [];
      const annualCats = annualDataList.map((d: any) => d.monthName);
      const annualValues = annualDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
      this.activeAnnualPpmOptions = this.createColumnChart(`Annual Defect Rate PPM Trend (${this.selectedYear})`, 'PPM', annualCats, annualValues);

      const monthlyDataList = responses.monthlyPpm.data || responses.monthlyPpm.Data || [];
      const monthlyCats = monthlyDataList.map((d: any) => d.dayNumber ? d.dayNumber.toString() : '');
      const monthlyValues = monthlyDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
      this.activeMonthlyPpmOptions = this.createSplineChart(`Daily Defect Rate PPM Trend (${this.selectedMonth}/${this.selectedYear})`, 'PPM', monthlyCats, monthlyValues);

      // Pie Chart uses allDefects
      const allDefectList = responses.allDefects.data || responses.allDefects.Data || [];
      this.activeDefectsPieOptions = this.createPieChart(
        allDefectList.map((item: any, index: number) => ({
          name: item.defectName,
          y: item.count,
          color: this.pieColors[index % this.pieColors.length]
        }))
      );

      // Table uses topDefects
      const topDefectList = responses.topDefects.data || responses.topDefects.Data || [];
      const mappedTableDefects = topDefectList.map((item: any) => ({ defect: item.defectName, qty: item.count }));
      this.topDefectsLeft = mappedTableDefects.slice(0, 5);
      this.topDefectsRight = mappedTableDefects.slice(5, 10);

      const pfList = responses.partFamilies.data || responses.partFamilies.Data || [];
      this.activeProductsPieOptions = this.createPieChart(
        pfList.map((item: any, index: number) => ({
          name: item.partFamilyName,
          y: item.count,
          color: this.pieColors[index % this.pieColors.length]
        }))
      );

      const inspectorDocs = responses.inspectors.data || responses.inspectors.Data || [];
      this.activeInspectorActivities = inspectorDocs.map((item: any) => ({
        inspector: item.inspectorName,
        qty: item.count,
        records: item.count,
        ppm: 'N/A'
      }));

      this.updatePaginatedData({ pageIndex: 0, pageSize: 5, length: this.activeInspectorActivities.length });

      // Using setTimeout ensures Angular completely unmounts old charts before mounting new ones, preventing 'columns' error
      setTimeout(() => {
        this.chartsReady = true;
      }, 50);
    });
  }

  setDailyData(): void {
    // 6 Specific endpoints for Daily View
    forkJoin({
      hourlyPpm: this.inspectionService.getHourlyErrorRates(this.selectedYear, this.selectedMonth, this.selectedDay),
      shiftPpm: this.inspectionService.getShiftErrorRates(this.selectedYear, this.selectedMonth, this.selectedDay),
      partFamilies: this.inspectionService.getDailyPartFamilyCounts(this.selectedYear, this.selectedMonth, this.selectedDay),
      allDefects: this.inspectionService.getDailyDefectCounts(this.selectedYear, this.selectedMonth, this.selectedDay),
      topDefects: this.inspectionService.getTopDefectCounts(this.selectedYear, this.selectedMonth, this.selectedDay),
      inspectors: this.inspectionService.getTopInspectorCounts(this.selectedYear, this.selectedMonth, this.selectedDay)
    }).subscribe(responses => {

      // Safely map data arrays using || []
      const hourlyDataList = responses.hourlyPpm.data || responses.hourlyPpm.Data || [];
      const hourlyCats = hourlyDataList.map((d: any) => d.time);
      const hourlyValues = hourlyDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
      this.activeAnnualPpmOptions = this.createColumnChart(`Hourly PPM Trend (${this.selectedDay}/${this.selectedMonth}/${this.selectedYear})`, 'PPM', hourlyCats, hourlyValues);

      const shiftDataList = responses.shiftPpm.data || responses.shiftPpm.Data || [];
      const shiftCats = shiftDataList.map((d: any) => d.shiftName);
      const shiftValues = shiftDataList.map((d: any) => parseFloat(d.averageErrorRate || 0));
      this.activeMonthlyPpmOptions = this.createSplineChart(`Shift PPM Trend`, 'PPM', shiftCats, shiftValues);

      // Pie Chart uses allDefects
      const allDefectList = responses.allDefects.data || responses.allDefects.Data || [];
      this.activeDefectsPieOptions = this.createPieChart(
        allDefectList.map((item: any, index: number) => ({
          name: item.defectName,
          y: item.count,
          color: this.pieColors[index % this.pieColors.length]
        }))
      );

      // Table uses topDefects
      const topDefectList = responses.topDefects.data || responses.topDefects.Data || [];
      const mappedTableDefects = topDefectList.map((item: any) => ({ defect: item.defectName, qty: item.count }));
      this.topDefectsLeft = mappedTableDefects.slice(0, 5);
      this.topDefectsRight = mappedTableDefects.slice(5, 10);

      const pfList = responses.partFamilies.data || responses.partFamilies.Data || [];
      this.activeProductsPieOptions = this.createPieChart(
        pfList.map((item: any, index: number) => ({
          name: item.partFamilyName,
          y: item.count,
          color: this.pieColors[index % this.pieColors.length]
        }))
      );

      const inspectorDocs = responses.inspectors.data || responses.inspectors.Data || [];
      this.activeInspectorActivities = inspectorDocs.map((item: any) => ({
        inspector: item.inspectorName,
        qty: item.count,
        records: item.count,
        ppm: 'N/A'
      }));

      this.updatePaginatedData({ pageIndex: 0, pageSize: 5, length: this.activeInspectorActivities.length });

      // Using setTimeout ensures Angular completely unmounts old charts before mounting new ones, preventing 'columns' error
      setTimeout(() => {
        this.chartsReady = true;
      }, 50);
    });
  }

  handlePageEvent(event: PageEvent) {
    this.updatePaginatedData(event);
  }

  updatePaginatedData(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.activeInspectorActivities.length) {
      endIndex = this.activeInspectorActivities.length;
    }
    this.paginatedInspectorActivities = this.activeInspectorActivities.slice(startIndex, endIndex);
  }

  createColumnChart(title: string, yTitle: string, categories: string[], data: number[]): Highcharts.Options {
    return {
      chart: { type: 'column' },
      title: { text: title },
      xAxis: { categories: categories },
      yAxis: { title: { text: yTitle }, min: 0 },
      series: [{ type: 'column', name: yTitle, data: data, color: '#2caffe' }],
      credits: { enabled: false },
      legend: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  createSplineChart(title: string, yTitle: string, categories: string[], data: number[]): Highcharts.Options {
    return {
      chart: { type: 'spline' },
      title: { text: title },
      xAxis: { categories: categories },
      yAxis: { title: { text: yTitle }, min: 0 },
      series: [{ type: 'spline', name: yTitle, data: data, color: '#2caffe' }],
      credits: { enabled: false },
      legend: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  createPieChart(data: any[]): Highcharts.Options {
    return {
      chart: { type: 'pie' },
      title: { text: '' },
      series: [{ type: 'pie', innerSize: '50%', data: data }],
      credits: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  openheatmapname() {
    this.dialog.open(DefectsPopMasterComponent, { width: '1400px', height: 'auto' });
  }
}