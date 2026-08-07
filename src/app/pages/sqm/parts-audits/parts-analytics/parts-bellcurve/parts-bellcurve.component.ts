import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'src/app/shared/alert.service';
import { CommodityService } from '../../../process-audits/paudits-setup/commodity-master/commodity.service';
import { PartsAuditAnalayticsService } from '../../../process-audits/paudits-analytics/parts-audit-analaytics.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-parts-bellcurve',
  templateUrl: './parts-bellcurve.component.html',
  styleUrls: ['./parts-bellcurve.component.scss']
})
export class PartsBellcurveComponent implements OnInit {


  chartOptions = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Bell Curve for Parts Audits",
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      fontSize: 24,
      margin: 30
    },
    axisX: {
      labelFontFamily: "Arial, sans-serif",
      labelFontColor: "#777",
      tickThickness: 0,
      lineThickness: 1,
      lineColor: "#d3d3d3"
    },
    axisY: {
      minimum: 0,
      maximum: 100,
      interval: 10,
      gridColor: "#e6e6e6",
      gridThickness: 1,
      lineThickness: 0,
      tickThickness: 0,
      labelFontFamily: "Arial, sans-serif",
      labelFontColor: "#777"
    },
    data: [{
      type: "column",
      color: "#8cd3ef", // Matches the light blue in the image
      dataPoints: [
        { label: "0-10", y: 16 },
        { label: "10-20", y: 3 },
        { label: "20-30", y: 1 },
        { label: "30-40", y: 5 },
        { label: "40-50", y: 1 },
        { label: "50-60", y: 60 },
        { label: "60-70", y: 76 },
        { label: "70-80", y: 93 },
        { label: "80-90", y: 79 },
        { label: "90-100", y: 35 }
      ]
    }]
  };

  constructor() { }

  ngOnInit(): void {
    this.forminit();
    this.getBellCurve();
  }
  forminit() {
    this.filterForm = this.fb.group({

      Year: [null],
    });
  }
  onClearFilter() {
    this.filterForm.reset({

      Year: null,
    });
    this.getBellCurve();

  }

  getBellCurve() {

    const filter = { ...this.filterForm.value };

    Object.keys(filter).forEach(key => {

      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === '' ||
        filter[key] === 'null'
      ) {
        delete filter[key];
      }

    });

    this.PartsAuditAnalayticsService.getBellCurve(filter)
      .subscribe({
        next: (res: any) => {

          if (res.success) {

            const categories = res.data.map((x: any) => x.range);

            const values = res.data.map((x: any) => x.count);

            this.chartOptions = {

              ...this.chartOptions,

              xAxis: {
                categories: categories,
                title: {
                  text: 'Percentage Range'
                },
                labels: {
                  style: {
                    fontSize: '15px'
                  },
                  rotation: 0,
                  reserveSpace: true
                },
                tickmarkPlacement: 'on',
                startOnTick: true,
                endOnTick: true
              },

              yAxis: {
                min: 0,
                max: 100,
                tickInterval: 10,
                allowDecimals: false,
                title: {
                  text: 'No. of Audits'
                },
                labels: {
                  style: {
                    fontSize: '15px'
                  }
                }
              },

              series: [{
                type: 'column',
                color: '#8cd3ef',
                data: values
              }]
            };

          }
        },
        error: (err) => {
          this.alertService.createAlert(
            err.error?.message || 'Unable to load Bell Curve',
            0
          );
        }
      });

  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: '#ffffff',
      spacingTop: 20,
      spacingRight: 40,
      spacingLeft: 20,
      spacingBottom: 20
    },

    title: {
      text: 'Bell Curve for Parts Audits',
      style: {
        fontSize: '26px',
        fontWeight: 'normal',
        color: '#333'
      }
    },

    xAxis: {
      categories: [],
      title: {
        text: 'Percentage Range',
        style: {
          fontSize: '16px'
        }
      },
      labels: {
        style: {
          fontSize: '15px'
        },
        rotation: 0,
        reserveSpace: true
      },
      tickmarkPlacement: 'on',
      startOnTick: true,
      endOnTick: true
    },

    yAxis: {
      min: 0,
      max: 100,
      tickInterval: 10,
      allowDecimals: false,
      title: {
        text: 'No. of Audits',
        style: {
          fontSize: '16px'
        }
      },
      labels: {
        style: {
          fontSize: '15px'
        }
      }
    },

    legend: {
      enabled: false
    },

    credits: {
      enabled: false
    },

    tooltip: {
      headerFormat: '',
      pointFormat:
        '<b>{point.category}</b><br/>No. of Audits : <b>{point.y}</b>'
    },

    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0.05,
        groupPadding: 0.08,
        color: '#8cd3ef'
      }
    },

    series: [{
      type: 'column',
      data: []
    }]
  };
}
