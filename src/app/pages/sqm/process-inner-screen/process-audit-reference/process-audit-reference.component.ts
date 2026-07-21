import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/shared/alert.service';
import { ActivatedRoute } from '@angular/router';
import { ProcessAuditService } from '../../process-audits/process-audit.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-process-audit-reference',
  templateUrl: './process-audit-reference.component.html',
  styleUrls: ['./process-audit-reference.component.scss']
})
export class ProcessAuditReferenceComponent implements OnInit {

  // Dynamic Master Data
  categories: any[] = [];
  selectedCategory: any = null;
  processSteps: any[] = [];
  selectedStep: any = null;
  severities: any[] = [];
  parentAuditRef: string = 'Pending...';

  // Dropdown Options
  occurrences = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  detections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  pdcaStatuses = ['Plan', 'Do', 'Check', 'Act'];
  actionTypes = ['Containment', 'Corrective', 'Preventive'];
  classOptions = ['Regular', 'Important', 'Critical'];

  // Form Bindings
  rating = '5';
  selectedSeverityId: any = null;
  selectedOccurrence: any = null;
  selectedDetection: any = null;
  complianceStatus: string = '';
  selectedClass = '';
  capaSubject = '';
  dueDate: any = null;
  completedDate: any = null;
  pdcaStatus = '';
  isResolved = false;
  actionType = '';
  remarks = '';
  correctiveActions = '';
  supplierRemarks = '';

   targetCategoryId: any = null;  // 🔥 Add this
  targetChecklistId: any = null; // 🔥 Add this

  // File Upload Variables
  selectedFiles: File[] = [];
  selectedImageFiles: File[] = [];
  galleryImages: string[] = [];
  uploadedDocs: any[] = [];
  isSlideshowOpen = false;
  currentSlideIndex = 0;

  constructor(
    private location: Location,
    private api: ProcessAuditService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  // ngOnInit(): void {
     

  //   this.parentAuditRef = this.route.snapshot.queryParamMap.get('ref') || 'New Audit';
  //   this.targetCategoryId = this.route.snapshot.queryParamMap.get('categoryId'); // 🔥 Catch Category ID
  //   this.targetChecklistId = this.route.snapshot.queryParamMap.get('checklistId'); // 🔥 Catch Question ID

  //   this.loadMasterData();

  //    this.loadMasterData();
  // }

  ngOnInit(): void {
    this.parentAuditRef = this.route.snapshot.queryParamMap.get('ref') || 'New Audit';
    this.targetCategoryId = this.route.snapshot.queryParamMap.get('categoryId'); 
    this.targetChecklistId = this.route.snapshot.queryParamMap.get('checklistId'); 

    
    this.loadMasterData(); 
  }

 loadMasterData() {
    this.api.getSeverities().subscribe((res: any) => {
      if (res.success) this.severities = res.data;
    });

    this.api.getProcessCategories().subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        this.categories = res.data;
        
        // 🔥 If a categoryId came from the URL, select it. Otherwise, select the first one.
        let catToSelect = this.categories[0];
        if (this.targetCategoryId) {
          const found = this.categories.find(c => c.processCategoryId == this.targetCategoryId);
          if (found) catToSelect = found;
        }
        
        this.selectCategory(catToSelect);
      }
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.processSteps = [];
    this.selectedStep = null;

    this.api.getChecklists(category.processCategoryId).subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        this.processSteps = res.data;
        
      
        let stepToSelect = this.processSteps[0];
        if (this.targetChecklistId) {
          const found = this.processSteps.find(s => s.checklistId == this.targetChecklistId);
          if (found) stepToSelect = found;
          
          // Clear the target ID so if the user clicks other tabs manually, it works normally
          this.targetChecklistId = null; 
        }
        
        this.selectStep(stepToSelect); 
      }
    });
  }

  selectStep(step: any) {
    this.selectedStep = step;
    this.loadSavedResponse();
  }

  loadSavedResponse() {
    const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');
    
    // Safety check: ensure we have both IDs before calling the API
    if (!parentAuditId || !this.selectedStep || !this.selectedStep.checklistId) return;

    // Use .checklistId because the step object comes from your DB Checklists table!
    this.api.getInnerScreenDetails(parentAuditId, this.selectedStep.checklistId).subscribe((res: any) => {
      console.log('API Response for Inner Screen Details:', res);
      if (res.success && res.data) {
        const d = res.data;
        
        this.rating = d.rating || '5';
        this.selectedSeverityId = d.severityId;
        this.selectedOccurrence = d.occurrence;
        this.selectedDetection = d.detection;
        this.complianceStatus = d.compliance || '';
        
        // CAPA fields
        this.selectedClass = d.class || '';
        this.capaSubject = d.capaSubject || '';
        this.pdcaStatus = d.pdcaStatus || '';
        this.isResolved = d.isResolved || false;
        this.actionType = d.actionType || '';
        this.remarks = d.remarks || '';
        this.correctiveActions = d.correctiveActions || '';
        this.supplierRemarks = d.supplierRemarks || '';

        // Format dates correctly for HTML <input type="date">
        this.dueDate = d.dueDate ? new Date(d.dueDate).toISOString().split('T')[0] : null;
        this.completedDate = d.completedDate ? new Date(d.completedDate).toISOString().split('T')[0] : null;

        // Clear local arrays on reload
        this.selectedFiles = []; 
        this.selectedImageFiles = []; 
        
        this.galleryImages = [];
        this.uploadedDocs = [];

        // Parse Images
        if (d.imageDocs) {
          const allImages = d.imageDocs.split(',');
          allImages.forEach((url: string) => {
            url = url.trim();
            if (url) this.galleryImages.push(url);
          });
        }

        // Parse Documents (PDFs, docs, etc.)
        if (d.pdfDocs) {
          const allDocs = d.pdfDocs.split(',');
          allDocs.forEach((url: string) => {
            url = url.trim();
            if (url) this.uploadedDocs.push({ url: url, title: url.split('/').pop()?.split('?')[0] || 'Document' });
          });
        }

      } else {
        // If NO record exists for this question, wipe the form clean
        this.resetForm();
      }
    });
  }

  setRating(val: string) {
    this.rating = val;
  }

  // --- Dynamic SOD Calculation ---
  get sodScore(): string {
    if (!this.selectedSeverityId || !this.selectedOccurrence || !this.selectedDetection) return '';
    
    // Find the actual rating value from the severity master
    const severity = this.severities.find(s => s.severityId === this.selectedSeverityId);
    const severityVal = severity ? severity.rating : 0;

    return `${severityVal}${this.selectedOccurrence}${this.selectedDetection}`;
  }

  // --- File Upload Logic (PDFs / General Docs) ---
  onFileSelected(event: any): void { if (event.target.files) this.addFiles(event.target.files); }
  onDragOver(event: any): void { event.preventDefault(); event.stopPropagation(); event.currentTarget.classList.add('drag-over'); }
  onDragLeave(event: any): void { event.preventDefault(); event.stopPropagation(); event.currentTarget.classList.remove('drag-over'); }
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    if (event.dataTransfer.files) this.addFiles(event.dataTransfer.files);
  }
  addFiles(files: FileList): void { for (let i = 0; i < files.length; i++) this.selectedFiles.push(files[i]); }
  removeFile(index: number): void { this.selectedFiles.splice(index, 1); }
  
  removeApiDoc(index: number): void {
    this.uploadedDocs.splice(index, 1);
    // You might also need an API call here to delete the doc if required by backend,
    // or just re-upload current files on save. For now, it removes it from UI.
  }

  viewLocalFile(file: File): void {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  }

  // --- Image Upload Logic (Gallery) ---
  addImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        
        this.selectedImageFiles.push(file); 

        const reader = new FileReader();
        reader.onload = () => { this.galleryImages.push(reader.result as string); }; // Local Preview
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }


  // --- Slideshow Logic ---
  openSlideshow(index: number): void { if (this.galleryImages.length > 0) { this.currentSlideIndex = index; this.isSlideshowOpen = true; } }
  closeSlideshow(): void { this.isSlideshowOpen = false; }
  prevSlide(event?: Event): void { if(event) event.stopPropagation(); this.currentSlideIndex = (this.currentSlideIndex - 1 + this.galleryImages.length) % this.galleryImages.length; }
  nextSlide(event?: Event): void { if(event) event.stopPropagation(); this.currentSlideIndex = (this.currentSlideIndex + 1) % this.galleryImages.length; }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isSlideshowOpen) return;
    if (event.key === 'ArrowLeft') this.prevSlide();
    if (event.key === 'ArrowRight') this.nextSlide();
    if (event.key === 'Escape') this.closeSlideshow();
  }

  goBack(): void { this.location.back(); }

  // --- SAVE RECORD ---
  saveData() {
    const parentAuditId = parseInt(this.route.snapshot.queryParamMap.get('id') || '0');

    const payload = {
      processAuditId: parentAuditId,
      processCategoryId: this.selectedCategory?.processCategoryId,
      checklistId: this.selectedStep?.checklistId,
      guideline: this.selectedStep?.guideline, // Sending the guideline text
      rating: this.rating,
      severityId: this.selectedSeverityId,
      occurrence: this.selectedOccurrence,
      detection: this.selectedDetection,
      compliance: this.complianceStatus,
      
      // CAPA
      class: this.selectedClass,
      capaSubject: this.capaSubject,
      dueDate: this.dueDate,
      completedDate: this.completedDate,
      pdcaStatus: this.pdcaStatus,
      isResolved: this.isResolved,
      actionType: this.actionType,
      remarks: this.remarks,
      correctiveActions: this.correctiveActions,
      supplierRemarks: this.supplierRemarks
    };

    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(payload));

    // Append both file arrays separately so the backend gets everything
    this.selectedFiles.forEach(file => { formData.append('files', file); });
    this.selectedImageFiles.forEach(file => { formData.append('files', file); });

    this.api.saveInnerScreenDetails(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          
          // Auto advance to next question
          const currentIndex = this.processSteps.findIndex(s => s.checklistId === this.selectedStep.checklistId);
          if(currentIndex < this.processSteps.length - 1) {
            this.selectStep(this.processSteps[currentIndex + 1]); 
          }
        } else {
          this.alertService.createAlert(res.message, 0);
        }
      },
      error: () => this.alertService.createAlert('Error saving response', 0)
    });
  }

  resetForm() {
    this.rating = '5';
    this.selectedSeverityId = null;
    this.selectedOccurrence = null;
    this.selectedDetection = null;
    this.complianceStatus = '';
    
    this.selectedClass = '';
    this.capaSubject = '';
    this.dueDate = null;
    this.completedDate = null;
    this.pdcaStatus = '';
    this.isResolved = false;
    this.actionType = '';
    this.remarks = '';
    this.correctiveActions = '';
    this.supplierRemarks = '';
    
    this.selectedFiles = [];
    this.selectedImageFiles = []; 
    this.galleryImages = [];
    this.uploadedDocs = [];
  }
}