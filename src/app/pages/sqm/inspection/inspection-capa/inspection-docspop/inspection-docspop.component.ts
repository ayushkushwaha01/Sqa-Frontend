import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
 // Adjust path as necessary
import { AlertService } from 'src/app/shared/alert.service'; // Optional for errors
import { InspectionService } from '../../inspection.service';

@Component({
  selector: 'app-inspection-docspop',
  templateUrl: './inspection-docspop.component.html',
  styleUrls: ['./inspection-docspop.component.scss']
})
export class InspectionDocspopComponent implements OnInit {

   documents: any[] = [];
   pagedDocs: any[] = [];
   pageSize = 5;
   pageIndex = 0;
   
   // Property to hold the incoming ID
   capaId: number;

   constructor(
     public dialogRef: MatDialogRef<InspectionDocspopComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any, // Inject data from parent
     private inspectionService: InspectionService,
     private alertService: AlertService
   ) { 
     // Extract the ID passed from the parent component
     this.capaId = this.data.capaId;
   }
 
   ngOnInit(): void {
     // Fetch real data on component load
     this.fetchDocuments();
   }

   fetchDocuments(): void {
     this.inspectionService.getCapaDocuments(this.capaId).subscribe({
       next: (res: any) => {
         if (res.success && res.data) {
           this.documents = res.data;
           this.updatePage(); // Initialize the pagination view
         }
       },
       error: (err) => {
         console.error("Error fetching documents:", err);
         this.alertService.createAlert('Error fetching documents.', 0);
       }
     });
   }
 
   // Handle Pagination
   onPageChange(event: PageEvent): void {
     this.pageIndex = event.pageIndex;
     this.pageSize = event.pageSize;
     this.updatePage();
   }
 
   updatePage(): void {
     const start = this.pageIndex * this.pageSize;
     this.pagedDocs = this.documents.slice(start, start + this.pageSize);
   }

  viewDoc(doc: any): void {
  if (doc.url) {
    window.open(doc.url, '_blank');
  }
}
 
   // Close the dialog
   closeDialog(): void {
     this.dialogRef.close();
   }
}