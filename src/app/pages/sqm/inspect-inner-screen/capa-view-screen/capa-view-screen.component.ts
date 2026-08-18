import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InspectionService } from '../../inspection/inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';

@Component({
  selector: 'app-capa-view-screen',
  templateUrl: './capa-view-screen.component.html',
  styleUrls: ['./capa-view-screen.component.scss']
})
export class CapaViewScreenComponent implements OnInit {

  auditForm!: FormGroup;
  inspectionRefId: number = 0;
  pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
  severityOptions: any[] = [];
  occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  isReadOnly: boolean = false;
  isSupplier: boolean = false;
  isUpdate: boolean = false;
  isSaved: boolean = false;
  parameterName: string = '';

  isSlideshowOpen = false;
  currentSlideIndex = 0;

  // Arrays for PDFs
  selectedFiles: File[] = [];
  uploadedDocs: any[] = [];

  // Arrays for Images
  apiImages: string[] = [];
  localImageFiles: File[] = [];
  localImagePreviews: string[] = [];



  // Combined for Slideshow
  get slideshowImages(): string[] {
    return [...this.apiImages, ...this.localImagePreviews];
  }

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private route: ActivatedRoute,
    private inspectionService: InspectionService,
    private alertService: AlertService,
    private setupService: SetupService
  ) { }

  ngOnInit(): void {
    this.isSupplier = localStorage.getItem('UserType') === 'Supplier';
    this.initForm();
    this.loadSeverities();
    this.setupScoreCalculation();
    this.getDemeritMaster();

    this.route.queryParams.subscribe(params => {
      this.isReadOnly = params['isReadOnly'] === 'true' || params['readOnly'] === 'true';
      if (this.isSupplier) {
        this.isReadOnly = true;
      }
      this.parameterName = params['parameterName'] || '';
      if (params['inspectionRefId']) {
        this.inspectionRefId = Number(params['inspectionRefId']);
        this.loadCapaDetails();
      } else {
        if (this.isReadOnly || this.isSupplier) {
          this.auditForm.disable();
          if (this.isSupplier) {
            this.auditForm.get('supplierRemarks')?.enable();
            this.auditForm.get('correctiveActions')?.enable();
          }
        }
      }
    });
  }

  goBack(): void {
    this.location.back();
  }



  demeritOptions: any[] = [];
  getDemeritMaster() {

    this.setupService.getDemeritMaster({})
      .subscribe((res: any) => {

        if (res.success) {

          this.demeritOptions = res.data.data.map((item: any) => {

            let bgColor = '';
            let color = '';

            switch (item.subject) {

              case 'Minor':
                bgColor = '#dcfce7';
                color = '#166534';
                break;

              case 'Small':
                bgColor = '#fef9c3';
                color = '#854d0e';
                break;

              case 'Moderate':
                bgColor = '#ffedd5';
                color = '#9a3412';
                break;

              case 'Major':
                bgColor = '#fee2e2';
                color = '#991b1b';
                break;

              case 'Critical':
                bgColor = '#fecaca';
                color = '#7f1d1d';
                break;
            }

            return {
              ...item,
              bgColor: bgColor,
              color: color
            };

          });

        }

      });

  }
  selectDemerit(item: any) {

    this.auditForm.patchValue({
      demeritId: item.demeritId
    });

  }


  initForm(): void {
    this.auditForm = this.fb.group({
      capaId: [0],
      inspectionRefId: [0],
      subject: [''],
      dueDate: [''],
      completedDate: [''],
      pdcaStatus: [''],
      severityId: [null],
      occurrence: [null],
      detection: [null],
      sodScore: [{ value: '', disabled: true }],
      demerit: [null], // Changed from riskRating
      class: [''],
      actionType: [''],
      capaSubject: [''],
      observations: [''],
      correctiveActions: [''],
      supplierRemarks: [''],
      demeritId: [null],
    });
  }

  loadSeverities(): void {
    this.setupService.getSeverities().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.severityOptions = res.data.filter((s: any) => s.isActive && !s.isDeleted);
        }
      },
      error: (err) => console.error('Error fetching severities', err)
    });
  }

  loadCapaDetails(): void {
    this.inspectionService.getCapaByInspectionRefId(this.inspectionRefId).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          const data = res[0];
          this.isUpdate = true;

          // Parse legacy risk rating into numeric demerit
          let mappedDemerit = null;
          let legacyRisk = data.demerit || data.riskRating;

          if (legacyRisk) {
            if (typeof legacyRisk === 'string' && legacyRisk.includes('-')) {
              // e.g., "Excellent - 5" -> 5
              mappedDemerit = parseInt(legacyRisk.split('-')[1].trim(), 10);
            } else if (typeof legacyRisk === 'number') {
              mappedDemerit = legacyRisk;
            } else if (!isNaN(Number(legacyRisk))) {
              mappedDemerit = Number(legacyRisk);
            }
          }

          this.auditForm.patchValue({
            capaId: data.id,
            inspectionRefId: this.inspectionRefId,
            subject: data.subject,
            dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
            completedDate: data.completedDate ? data.completedDate.split('T')[0] : '',
            pdcaStatus: data.status,
            severityId: data.severityId,
            occurrence: data.occurrence,
            detection: data.detection,
            sodScore: data.sodScore,
            demerit: mappedDemerit,
            class: data.class || '',
            actionType: data.actionType,
            capaSubject: data.capaSubject,
            observations: data.observations,
            correctiveActions: data.correctiveActions,
            supplierRemarks: data.supplierRemarks,
            demeritId: data.demeritId
          });

          // Parse existing images (API)
          this.apiImages = [];
          if (data.imageDocs) {
            data.imageDocs.split(',').forEach((url: string) => {
              url = url.trim();
              if (url) this.apiImages.push(url);
            });
          }

          // Parse existing PDFs (API)
          this.uploadedDocs = [];
          if (data.pdfDocs) {
            data.pdfDocs.split(',').forEach((url: string) => {
              url = url.trim();
              if (url) {
                this.uploadedDocs.push({
                  url: url,
                  title: url.split('/').pop()?.split('?')[0] || 'Document'
                });
              }
            });
          }

          // Reset local selections on load
          this.selectedFiles = [];
          this.localImageFiles = [];
          this.localImagePreviews = [];
        }

        if (this.isReadOnly || this.isSupplier) {
          this.auditForm.disable();
          if (this.isSupplier) {
            this.auditForm.get('supplierRemarks')?.enable();
            this.auditForm.get('correctiveActions')?.enable();
          }
        }
      },
      error: (err) => {
        console.error('Error fetching CAPA data', err);
        if (this.isReadOnly || this.isSupplier) {
          this.auditForm.disable();
          if (this.isSupplier) {
            this.auditForm.get('supplierRemarks')?.enable();
            this.auditForm.get('correctiveActions')?.enable();
          }
        }
      }
    });
  }

  setupScoreCalculation(): void {
    this.auditForm.valueChanges.subscribe(values => {
      this.isSaved = false;
      if (values.severityId && values.occurrence && values.detection) {
        const selectedSeverity = this.severityOptions.find(s => s.severityId === values.severityId);
        const severityRating = selectedSeverity ? selectedSeverity.rating : 0;
        const sod = `${severityRating}${values.occurrence}${values.detection}`;

        this.auditForm.get('sodScore')?.setValue(Number(sod), { emitEvent: false });
      } else {
        this.auditForm.get('sodScore')?.setValue('', { emitEvent: false });
      }
    });
  }

  // Custom setter for Demerit selection 
  setDemerit(val: number): void {
    if (this.isReadOnly && !this.isSupplier) {
      return;
    }
    this.auditForm.get('demerit')?.setValue(val);
    this.auditForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.isReadOnly && !this.isSupplier) {
      return;
    }
    if (this.auditForm.invalid) {
      this.alertService.createAlert("Please fill all required fields.");
      return;
    }

    const formDataValues = this.auditForm.getRawValue();
    const payload = {
      capaId: formDataValues.capaId || 0,
      inspectionRefId: this.inspectionRefId,
      severityId: formDataValues.severityId ? Number(formDataValues.severityId) : null,
      occurrence: formDataValues.occurrence ? Number(formDataValues.occurrence) : null,
      detection: formDataValues.detection ? Number(formDataValues.detection) : null,
      sodScore: formDataValues.sodScore ? Number(formDataValues.sodScore) : null,
      subject: formDataValues.subject || '',
      dueDate: formDataValues.dueDate || null,
      completedDate: formDataValues.completedDate || null,
      pdcaStatus: formDataValues.pdcaStatus || null,

      // Pass mapped demerit value to the API (also keeping riskRating mapped just in case the backend wasn't updated)
      demerit: formDataValues.demerit || null,
      riskRating: formDataValues.demerit ? formDataValues.demerit.toString() : null,
      demeritId: formDataValues.demeritId ? Number(formDataValues.demeritId) : null,

      demeritId: formDataValues.demeritId ? Number(formDataValues.demeritId) : null,

      class: formDataValues.class || null,
      actionType: formDataValues.actionType || null,
      capaSubject: formDataValues.capaSubject || null,
      observations: formDataValues.observations || null,
      correctiveActions: formDataValues.correctiveActions || null,
      supplierRemarks: formDataValues.supplierRemarks || null,
      createdBy: 1
    };

    const sendData = new FormData();
    sendData.append('jsonData', JSON.stringify(payload));

    // Append newly selected PDFs
    this.selectedFiles.forEach(file => {
      sendData.append('files', file);
    });

    // Append newly selected Images
    this.localImageFiles.forEach(file => {
      sendData.append('files', file);
    });

    this.inspectionService.saveCapa(sendData).subscribe({
      next: (res) => {
        this.alertService.createAlert("CAPA saved successfully!");
        this.isSaved = true;
        this.loadCapaDetails();
      },
      error: (err) => {
        console.error("Error saving CAPA", err);
        this.alertService.createAlert("Failed to save CAPA.");
      }
    });
  }

  // --- PDF / Document Logic ---
  onFilesSelected(event: any): void {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
    }
  }

  removeLocalFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removeApiDoc(index: number): void {
    const doc = this.uploadedDocs[index];
    const capaId = this.auditForm.get('capaId')?.value;

    if (capaId > 0) {
      this.inspectionService.deleteCapaDocument({ capaId: capaId, fileUrl: doc.url }).subscribe({
        next: () => this.uploadedDocs.splice(index, 1),
        error: () => this.alertService.createAlert("Failed to delete document.")
      });
    } else {
      this.uploadedDocs.splice(index, 1);
    }
  }

  viewLocalFile(file: File): void {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  }

  addDocument(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.multiple = true;
    fileInput.onchange = (event: any) => {
      this.onFilesSelected(event);
    };
    fileInput.click();
  }

  viewApiDoc(url: string): void {
    window.open(url, '_blank');
  }

  // --- Image Upload Logic (Gallery) ---
  addImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.localImageFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.localImagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }

  removeApiImage(event: Event, index: number): void {
    event.stopPropagation(); // Prevent slideshow from opening
    const capaId = this.auditForm.get('capaId')?.value;
    const imageUrl = this.apiImages[index];

    if (capaId > 0) {
      this.inspectionService.deleteCapaDocument({ capaId: capaId, fileUrl: imageUrl }).subscribe({
        next: () => this.apiImages.splice(index, 1),
        error: () => this.alertService.createAlert("Failed to delete image.")
      });
    } else {
      this.apiImages.splice(index, 1);
    }
  }

  removeLocalImage(event: Event, index: number): void {
    event.stopPropagation(); // Prevent slideshow from opening
    this.localImageFiles.splice(index, 1);
    this.localImagePreviews.splice(index, 1);
  }

  // --- Slideshow Logic ---
  openSlideshow(index: number): void {
    if (this.slideshowImages.length > 0) {
      this.currentSlideIndex = index;
      this.isSlideshowOpen = true;
    }
  }

  closeSlideshow(): void {
    this.isSlideshowOpen = false;
  }

  prevSlide(event?: Event): void {
    if (event) event.stopPropagation();
    const len = this.slideshowImages.length;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + len) % len;
  }

  nextSlide(event?: Event): void {
    if (event) event.stopPropagation();
    const len = this.slideshowImages.length;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % len;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isSlideshowOpen) return;
    if (event.key === 'ArrowLeft') this.prevSlide();
    if (event.key === 'ArrowRight') this.nextSlide();
    if (event.key === 'Escape') this.closeSlideshow();
  }
}