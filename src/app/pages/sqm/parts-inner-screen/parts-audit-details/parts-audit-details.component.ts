import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PartAuditService } from '../../parts-audits/part-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { ActivatedRoute } from '@angular/router';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-parts-audit-details',
  templateUrl: './parts-audit-details.component.html',
  styleUrls: ['./parts-audit-details.component.scss']
})
export class PartsAuditDetailsComponent implements OnInit {

  auditForm!: FormGroup;

  pdcaOptions = ['Plan', 'Do', 'Check', 'Act'];
  severityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  occurrenceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detectionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // images: string[] = [
  //   'assets/img8.jpg',
  //   'assets/img-001.jpg',
  //   'assets/img-002.jpg',
  //   'assets/img-003.jpg',
  //   'assets/img5.jpg'
  // ];

  selectedClass: any;

  isSlideshowOpen = false;
  currentSlideIndex = 0;

  constructor(
    private fb: FormBuilder, private dialog: MatDialog,
    private location: Location, private partAuditService: PartAuditService, private alertService: AlertService,
    private setupService: SetupService, private route: ActivatedRoute
  ) { }
  partAuditId: number = 0;
  auditParameterId: number = 0;
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.partAuditId = +params['partAuditId'] || 0;
      this.auditParameterId = +params['auditParameterId'] || 0;

      console.log('PartAuditId:', this.partAuditId);
      console.log('AuditParameterId:', this.auditParameterId);

      this.initForm();
      this.setupScoreCalculation();
      this.getSeverities();
      this.getCapa();




    });

  }

  goBack(): void {
    this.location.back();
  }



  severities: any[] = [];
  getSeverities() {
    this.setupService.getSeverities()
      .subscribe((res: any) => {
        if (res.success) {

          this.severities = res.data;

        }
      });
  }

  initForm(): void {

    this.auditForm = this.fb.group({

      partAuditCapaId: [0],

      partAuditId: [this.partAuditId],

      auditParameterId: [this.auditParameterId],
      subject: [''],

      dueDate: [''],

      completedDate: [''],

      pdcaStatus: [''],

      severityId: [null],

      occurrence: [null],

      detection: [null],

      sodScore: [''],

      riskRating: [''],

      isResolved: [false],

      class: [''],

      actionType: [''],

      capaSubject: [''],

      observations: [''],

      correctiveActions: [''],

      supplierRemarks: ['']

    });

  }

  save() {

    if (this.auditForm.invalid) {
      return;
    }

    const payload = this.auditForm.getRawValue();

    this.partAuditService.upsertCapa(payload).subscribe({

      next: (res: any) => {

        if (res.success) {

          this.alertService.createAlert(res.message);

          this.auditForm.patchValue({
            partAuditCapaId: res.data.partAuditCapaId
          });

          if (this.selectedPdfFiles.length > 0) {
            this.uploadDocuments();
          }

          if (this.selectedImageFiles.length > 0) {
            this.uploadImages();
          }

        }

      },

      error: err => console.error(err)

    });

  }

  selectedPdfFiles: File[] = [];
  onPdfSelected(event: any) {

    if (event.target.files && event.target.files.length > 0) {

      this.selectedPdfFiles = Array.from(event.target.files);

    }

  }

  uploadDocuments() {

    const formData = new FormData();

    formData.append('partAuditId', this.partAuditId.toString());
    formData.append('auditParameterId', this.auditParameterId.toString());

    this.selectedPdfFiles.forEach(file => {
      formData.append('files', file);
    });

    this.partAuditService.upsertPartsAuditDoc(formData)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message);

            this.selectedPdfFiles = [];

          }

        },

        error: err => console.error(err)

      });

  }


  selectedImageFiles: File[] = [];
  //images: string[] = [];

  onFileSelected(event: any) {

    if (event.target.files && event.target.files.length > 0) {

      const files = Array.from(event.target.files) as File[];

      files.forEach(file => {

        this.selectedImageFiles.push(file);

        const reader = new FileReader();

        reader.onload = () => {
          this.images.push(reader.result as string);
        };

        reader.readAsDataURL(file);

      });

    }

  }

  uploadImages() {

    const formData = new FormData();

    formData.append('partAuditId', this.partAuditId.toString());
    formData.append('auditParameterId', this.auditParameterId.toString());

    this.selectedImageFiles.forEach(file => {
      formData.append('files', file);
    });

    this.partAuditService.upsertPartsAuditImages(formData)
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.alertService.createAlert(res.message);

            this.selectedImageFiles = [];

          }

        },

        error: err => console.error(err)

      });

  }
  setupScoreCalculation() {

    this.auditForm.get('severityId')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

    this.auditForm.get('occurrence')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

    this.auditForm.get('detection')?.valueChanges.subscribe(() => {
      this.calculateSodScore();
    });

  }
  calculateSodScore() {

    const severityId = this.auditForm.get('severityId')?.value;
    const occurrence = this.auditForm.get('occurrence')?.value ?? '';
    const detection = this.auditForm.get('detection')?.value ?? '';

    const severity = this.severities.find(x => x.severityId == severityId);

    const severityRating = severity?.rating ?? '';

    const sodScore = `${severityRating}${occurrence}${detection}`;

    this.auditForm.patchValue(
      {
        sodScore: sodScore
      },
      { emitEvent: false }
    );
  }


  documents: any[] = [];
  imageDetails: any[] = [];
  images: string[] = [];
  getCapa() {

    const filter = {
      auditParameterId: this.auditParameterId
    };

    this.partAuditService.getCapa(filter)
      .subscribe((res: any) => {

        if (!res.success || !res.data) {
          return;
        }

        const capa = res.data.capa;

        this.auditForm.patchValue({

          partAuditCapaId: capa.partAuditCapaId,
          partAuditId: capa.partAuditId,
          auditParameterId: capa.auditParameterId,
          subject: capa.subject,
          // dueDate: capa.dueDate,
          // completedDate: capa.completedDate,
          dueDate: capa.dueDate ? capa.dueDate.substring(0, 10) : '',

          completedDate: capa.completedDate
            ? capa.completedDate.substring(0, 10)
            : '',
          pdcaStatus: capa.pdcaStatus,
          severityId: capa.severityId,
          occurrence: capa.occurrence,
          detection: capa.detection,
          sodScore: capa.sodScore,
          riskRating: capa.riskRating,
          isResolved: capa.isResolved,
          class: capa.class,
          actionType: capa.actionType,
          capaSubject: capa.capaSubject,
          observations: capa.observations,
          correctiveActions: capa.correctiveActions,
          supplierRemarks: capa.supplierRemarks

        });

        // Documents
        this.documents = res.data.documents || [];

        // Images for gallery
        this.imageDetails = res.data.images || [];

        this.images = this.imageDetails.map((x: any) => x.imageurl);

      });

  }



  changeResolvedStatus() {

    const dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: {
        component: null,
        title: 'Change Status Confirmation',
        content: `Are you sure you want to mark this record as ${this.auditForm.get('isResolved')?.value ? 'Not Resolved' : 'Resolved'
          }?`,
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }

      this.partAuditService.updateResolvedStatus({
        partAuditCapaId: this.auditForm.get('partAuditCapaId')?.value
      }).subscribe({

        next: (res: any) => {

          if (res.success) {

            this.auditForm.patchValue({
              isResolved: res.isResolved
            });

            this.alertService.createAlert(res.message, 1);

          } else {

            this.alertService.createAlert(res.message, 0);

          }

        },

        error: () => {

          this.alertService.createAlert('Something went wrong.', 0);

        }

      });

    });

  }

  openSlideshow(index: number): void {
    this.currentSlideIndex = index;
    this.isSlideshowOpen = true;
  }

  closeSlideshow(): void {
    this.isSlideshowOpen = false;
  }

  prevSlide(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.images.length) %
      this.images.length;
  }

  nextSlide(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.currentSlideIndex =
      (this.currentSlideIndex + 1) %
      this.images.length;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {

    if (!this.isSlideshowOpen) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.prevSlide();
    }

    if (event.key === 'ArrowRight') {
      this.nextSlide();
    }

    if (event.key === 'Escape') {
      this.closeSlideshow();
    }
  }

  onSubmit(): void {
    console.log(
      'Form Submitted',
      this.auditForm.getRawValue()
    );
  }
}