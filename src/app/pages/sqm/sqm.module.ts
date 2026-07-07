import { NgModule } from "@angular/core";
import { SqmDashboardComponent } from "./sqm-dashboard/sqm-dashboard.component";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from "src/app/shared/shared.module";

import { MatButtonModule } from "@angular/material/button";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioModule } from "@angular/material/radio";
import { DragulaModule } from "ng2-dragula";
import { HighchartsChartModule } from 'highcharts-angular';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from "@angular/material/sidenav";
import { ProcessInnerScreenComponent } from './process-inner-screen/process-inner-screen.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";

const routes: Routes = [
    { path: "", redirectTo: "sqmd", pathMatch: "full" },
    { path: 'sqmd', component: SqmDashboardComponent, data: { breadcrumb: 'Dashboard', description: 'System overview of all audits and metrics.' } },
    {
        path: 'process',
        loadChildren: () => import('./process-audits/process-audits.module').then(m => m.ProcessAuditsModule),
        data: { breadcrumb: 'Process Audit', description: 'Manage and track process audits.' }
    },
    {
        path: 'parts',
        loadChildren: () => import('./parts-audits/parts-audits.module').then(m => m.PartsAuditsModule),
        data: { breadcrumb: 'Parts Audit', description: 'Manage and track parts audits.' }
    },
    {
        path: 'process-inner-screen',
        loadChildren: () => import('./process-inner-screen/process-inner-screen.module').then(m => m.ProcessInnerScreen),
        data: { breadcrumb: 'Process Details', description: 'Detailed view of a process audit.' }
    },
    {
        path: 'parts-inner-screen',
        loadChildren: () => import('./parts-inner-screen/parts-inner-screen.module').then(m => m.PartsInnerScreen),
        data: { breadcrumb: 'Parts Details', description: 'Detailed view of a parts audit.' }
    },
    {
        path: 'inspection',
        loadChildren: () => import('./inspection/inspection.module').then(m => m.InspectionModule),
        data: { breadcrumb: 'Inspection', description: 'Incoming inspection records.' }
    },
    {
        path: 'inspect-inner-screen',
        loadChildren: () => import('./inspect-inner-screen/inspect-inner-screen.module').then(m => m.InspectInnerScreenModule),
        data: { breadcrumb: 'Inspection Details', description: 'Detailed inspection record.' }
    }
];

@NgModule({
    declarations: [
        SqmDashboardComponent,
        ProcessInnerScreenComponent
        // ✅ REMOVED: InspectInnerScreenComponent, CapaReferenceComponent, ActiveRecordsRefComponent (They belong to their own module now)
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        SharedModule,
        MatButtonModule,
        MatPaginatorModule,
        MatCardModule,
        MatSelectModule,
        MatRadioModule,
        DragulaModule,
        HighchartsChartModule,
        CanvasJSAngularChartsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSidenavModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule
    ],
    providers: []
})
export class SqmModule { }