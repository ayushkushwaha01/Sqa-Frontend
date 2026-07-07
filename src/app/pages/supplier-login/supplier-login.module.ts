import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Import main components
import { SupplierLoginComponent } from './supplier-login.component';
import { SupplierDashboardComponent } from './supplier-dashboard/supplier-dashboard.component';
import { SupplierInspectionComponent } from './supplier-inspection/supplier-inspection.component';
import { SupplierPartsauditsComponent } from './supplier-partsaudits/supplier-partsaudits.component';
import { SupplierProcessauditsComponent } from './supplier-processaudits/supplier-processaudits.component';

// Import Process Audit child components
import { SupProactivegridComponent } from './supplier-processaudits/sup-proactivegrid/sup-proactivegrid.component';
import { SupProcapaComponent } from './supplier-processaudits/sup-procapa/sup-procapa.component';

// Import Parts Audit child components
import { SupPartsActiveComponent } from './supplier-partsaudits/sup-parts-active/sup-parts-active.component';
import { SupPartsCapaComponent } from './supplier-partsaudits/sup-parts-capa/sup-parts-capa.component';

// Import Inspection child components
import { SupplierActiverecordsComponent } from './supplier-inspection/supplier-activerecords/supplier-activerecords.component';
import { SupplierCapaComponent } from './supplier-inspection/supplier-capa/supplier-capa.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { DragulaModule } from 'ng2-dragula';
import { HighchartsChartModule } from 'highcharts-angular';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
// import { SupplierInnerscreenComponent } from './supplier-innerscreen/supplier-innerscreen.component';
import { SupplierProcessRefComponent } from './supplier-innerscreen/supplier-process-ref/supplier-process-ref.component';
import { SupplierCapaRefComponent } from './supplier-innerscreen/supplier-capa-ref/supplier-capa-ref.component';
import { SupplierPartsRefComponent } from './supplier-innerscreen/supplier-parts-ref/supplier-parts-ref.component';
// import { SupplierPartsCapaComponent } from './supplier-innerscreen/supplier-parts-capa/supplier-parts-capa.component';
// import { SupplierPartsDetailsComponent } from './supplier-innerscreen/supplier-parts-details/supplier-parts-details.component';
// import { SupplierAuditReferenceComponent } from './supplier-partsaudits/sup-parts-active/supplier-audit-reference/supplier-audit-reference.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
// Define child routes for the supplier section
const routes: Routes = [
  {
    path: '',
    component: SupplierLoginComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: SupplierDashboardComponent,
        data: { breadcrumb: 'Dashboard', description: 'Supplier overview of all audits and metrics.' }
      },
      
      // Inspection route with children
      { 
        path: 'inspection', 
        component: SupplierInspectionComponent,
        data: { breadcrumb: 'Inspection', description: 'Supplier incoming inspection records.' },
        children: [
          { path: '', redirectTo: 'active-records', pathMatch: 'full' },
          { path: 'active-records', component: SupplierActiverecordsComponent },
          { path: 'capa', component: SupplierCapaComponent }
        ]
      },
      
      // Parts Audits route with children
      { 
        path: 'parts-audits', 
        component: SupplierPartsauditsComponent,
        data: { breadcrumb: 'Parts Audits', description: 'Supplier parts audits and corrective actions.' },
        children: [
          { path: '', redirectTo: 'parts-dashboard', pathMatch: 'full' },
          { path: 'parts-dashboard', component: SupPartsActiveComponent },
          { path: 'parts-actions', component: SupPartsCapaComponent },
          {path: 'reference-audits', component: SupplierPartsRefComponent, data: { breadcrumb: 'Reference Audits' } }
         
        ]
      },
      
      // Process Audits route with children
      { 
        path: 'process-audits', 
        component: SupplierProcessauditsComponent,
        data: { breadcrumb: 'Process Audits', description: 'Supplier process audits and corrective actions.' },
        children: [
          { path: '', redirectTo: 'active-audits', pathMatch: 'full' },
          { path: 'active-audits', component: SupProactivegridComponent },
          { path: 'actions', component: SupProcapaComponent }
        ]
      },

      // Lazy load the Inner Screens module
      {
        path: 'inner-screen',
        loadChildren: () => import('./supplier-innerscreen/supplier-innerscreen.module').then(m => m.SupplierInnerscreenModule)
      }
    ]
  }
];

@NgModule({
  declarations: [
    SupplierLoginComponent,
    SupplierDashboardComponent,
    SupplierInspectionComponent,
    SupplierPartsauditsComponent,
    SupplierProcessauditsComponent,
    // SupplierInnerscreenComponent,
    // SupplierProcessRefComponent,
    // SupplierCapaRefComponent,
    // SupplierPartsRefComponent,
    // SupplierPartsCapaComponent,
    // SupplierPartsDetailsComponent,
    SupProactivegridComponent,
    SupProcapaComponent,
    SupPartsActiveComponent,
    SupPartsCapaComponent,
    SupplierActiverecordsComponent,
    SupplierCapaComponent
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
    MatIconModule,
    MatTableModule,      // For mat-table
    MatSortModule,       // For matSort directive
    MatTooltipModule     // For matTooltip on buttons/icons
  ]
})
export class SupplierLoginModule { }