import { AddSubjectiveAuditComponent } from './add-subjective-audit/add-subjective-audit.component';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusConfirmationDialogComponent } from '../../testing/testing-projects/add-projects/status-confirmation-dialog/status-confirmation-dialog.component';
import { AddObjectiveAuditComponent } from '../../objective-audits/objective-audits-issue-status/add-objective-audit/add-objective-audit.component';
import { objectivedata } from '../../objective-audits/objectivedata';

@Component({
  selector: 'app-subjective-audits-issue-status',
  templateUrl: './subjective-audits-issue-status.component.html',
  styleUrls: ['./subjective-audits-issue-status.component.scss']
})
export class SubjectiveAuditsIssueStatusComponent implements OnInit {

 //Objective Audit
  public pageSize = 5;
  public currentPage = 0;
  public totalSize = 0;
  filterToggle = false;

  constructor(
    public dialog: MatDialog,
  ) { }
  values = []
  ngOnInit() {
    if (environment.mode == 1) {
      //this.values = PartsData.getd1();
      this.values = objectivedata.objectiveStatue();
    }
    else {

    }
  }

  scrollRight() {
  const container = document.getElementById('grid-table-container');
  if (container) {
    container.scrollBy({ left: 300, behavior: 'smooth' });
  }
}
 
scrollLeft() {
  const container = document.getElementById('grid-table-container');
  if (container) {
    container.scrollBy({ left: -300, behavior: 'smooth' });
  }
}

  values1 = [
  ]

   opendashboard() {
    window.open('/#/app/checklistdoard');
  }

  //parameterboard
  saveStatus() {
    //this.alertService.createAlert('Successfully saved.', 1);
  }
  addchecklistaudit(auditdata) {
    let dialogRef = this.dialog.open(AddObjectiveAuditComponent, {
      data: auditdata,
      height: 'auto',
      width: '850px'
    });
    dialogRef.afterClosed().subscribe(data => {
    });
  }
        deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { ProjectId: item.ProjectId, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?' }
    });

}
    Confirmation(item: any) {
    let dialogRef = this.dialog.open(StatusConfirmationDialogComponent, {
      width: 'auto',
      data: { TractorStatusId: item.TractorStatusId, title: 'Change Status', content: 'Are you sure you want to Change the Status ?' }
    });
  }

}
