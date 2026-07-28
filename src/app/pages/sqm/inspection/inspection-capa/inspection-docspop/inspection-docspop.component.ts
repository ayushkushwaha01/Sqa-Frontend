import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AlertService } from 'src/app/shared/alert.service'; 
import { InspectionService } from '../../inspection.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

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
     @Inject(MAT_DIALOG_DATA) public data: any, 
     private inspectionService: InspectionService,
     private alertService: AlertService,
     private dialog: MatDialog
   ) { 
     this.capaId = this.data.capaId;
   }
 
   ngOnInit(): void {
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

  // --- NEW DELETE METHOD ---
  deleteDoc(doc: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: `Are you sure you want to delete ${doc.title}?`,
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload = {
          capaId: this.capaId,
          fileUrl: doc.url
        };

        this.inspectionService.deleteCapaDocument(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Document deleted successfully.', 1); 
              this.fetchDocuments(); 
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete document.', 0);
            }
          },
          error: (err) => {
            console.error("Error deleting document:", err);
            this.alertService.createAlert('Error deleting document.', 0);
          }
        });
      }
    });
  }
 
   // Close the dialog
   closeDialog(): void {
     this.dialogRef.close();
   }
}