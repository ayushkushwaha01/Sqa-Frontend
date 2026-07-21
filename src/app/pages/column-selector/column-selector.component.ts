import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PartAuditService } from '../sqm/parts-audits/part-audit.service';


@Component({
  selector: 'app-column-selector',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class ColumnSelectorComponent implements OnInit {

  allAvailableColumns: string[] = [];
  selectedColumns: string[] = [];

  searchQuery: string = '';

  frozenCount: number = 0;

  currentUserId: number = 0;

  gridIdentifier: string = '';

  constructor(
    private partAuditService: PartAuditService,
    public dialogRef: MatDialogRef<ColumnSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.currentUserId = data.userId;
    this.gridIdentifier = data.gridType;
    this.allAvailableColumns = data.defaultColumns || [];

  }

  ngOnInit(): void {

    this.loadSavedColumns();

  }

  //-----------------------------------------------------
  // Load Saved Configuration
  //-----------------------------------------------------

  loadSavedColumns() {

    const filter = {
      userId: this.currentUserId,
      gridType: this.gridIdentifier
    };

    this.partAuditService.getgridcolumns(filter)
      .subscribe({

        next: (res: any) => {

          if (res.success && res.data) {

            let parsed = JSON.parse(res.data.selectedColumnsJSON);

            if (Array.isArray(parsed)) {

              this.selectedColumns = parsed;
              this.frozenCount = 0;

            }
            else {

              this.selectedColumns = parsed.columns || [];
              this.frozenCount = parsed.frozenCount || 0;

            }

          }
          else {

            this.selectedColumns = [...this.allAvailableColumns];
            this.frozenCount = 0;

          }

        },

        error: (err) => {

          console.error(err);

          this.selectedColumns = [...this.allAvailableColumns];

          this.frozenCount = 0;

        }

      });

  }

  //-----------------------------------------------------
  // Search
  //-----------------------------------------------------

  getFilteredColumns(): string[] {

    if (!this.searchQuery) {

      return this.allAvailableColumns;

    }

    return this.allAvailableColumns.filter(x =>
      x.toLowerCase().includes(this.searchQuery.toLowerCase()));

  }

  //-----------------------------------------------------
  // Checkbox
  //-----------------------------------------------------

  toggleColumn(column: string, event: any) {

    if (event.target.checked) {

      if (!this.selectedColumns.includes(column)) {

        this.selectedColumns.push(column);

      }

    }
    else {

      this.removeColumn(column);

    }

  }

  //-----------------------------------------------------
  // Remove
  //-----------------------------------------------------

  removeColumn(column: string) {

    this.selectedColumns =
      this.selectedColumns.filter(x => x != column);

    if (this.frozenCount > this.selectedColumns.length) {

      this.frozenCount = this.selectedColumns.length;

    }

  }

  //-----------------------------------------------------
  // Selected
  //-----------------------------------------------------

  isSelected(column: string): boolean {

    return this.selectedColumns.includes(column);

  }

  //-----------------------------------------------------
  // Drag Drop
  //-----------------------------------------------------

  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(

      this.selectedColumns,

      event.previousIndex,

      event.currentIndex

    );

  }

  //-----------------------------------------------------
  // Save
  //-----------------------------------------------------

  saveConfiguration() {

    const config = {

      frozenCount: this.frozenCount,

      columns: this.selectedColumns

    };

    const payload = {

      UserId: this.currentUserId,

      GridType: this.gridIdentifier,

      SelectedColumnsJSON: JSON.stringify(config)

    };

    this.partAuditService
      .upsertgridcolumns(payload)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.dialogRef.close(true);

          }

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  //-----------------------------------------------------
  // Cancel
  //-----------------------------------------------------

  closeDialog(value: boolean = false) {

    this.dialogRef.close(value);

  }

}