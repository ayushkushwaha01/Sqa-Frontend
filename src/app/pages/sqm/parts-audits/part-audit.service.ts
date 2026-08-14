import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartAuditService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getPartAudits(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAudit/get-part-audits', {
      params: filter
    });
  }

  upsertPartAudit(data: any) {
    return this.http.post(this.apiUrl + 'PartsAudit/upsert-part-audit', data);
  }
  DeletePartAudit(data: any) {
    return this.http.post(this.apiUrl + 'PartsAudit/delete', data);
  }
  updatePartAuditStatus(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAudit/update-status',
      data
    );
  }

  updatePartAuditDoneStatus(data: any) {
    return this.http.post(this.apiUrl + 'PartsAudit/done-status-change', data);
  }
  getCategoryAuditsParameters(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAudit/get-audit-parameters', {
      params: filter
    });
  }
  upsertPartAuditParameter(data: any) {
    return this.http.post(this.apiUrl + 'PartsAudit/upsert-audit-parameter', data);
  }

  upsertgridcolumns(data: any) {
    return this.http.post(this.apiUrl + 'PartsAudit/save-user-gridcolumns', data);
  }
  getgridcolumns(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAudit/get-user-gridcolumns', {
      params: filter
    });
  }


  // For Part Audit  inner screen

  updateOkayStatusinnerscreen(data: any) {
    return this.http.post(this.apiUrl + 'PartsAuditInnerScreen/okay-status-change', data);
  }
  upsertCapa(data: any) {
    return this.http.post(this.apiUrl + 'PartsAuditInnerScreen/upsert-capa', data);
  }
  getCapa(filter: any) {
    return this.http.get(this.apiUrl + 'PartsAuditInnerScreen/get-capa', {
      params: filter
    });
  }
  upsertPartsAuditDoc(data: any) {
    return this.http.post(this.apiUrl + 'PartsAuditInnerScreen/upload-docs', data);
  }
  upsertPartsAuditImages(data: any) {
    return this.http.post(this.apiUrl + 'PartsAuditInnerScreen/upload-images', data);
  }
  updateResolvedStatus(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAuditInnerScreen/resolved-status-change',
      data
    );
  }

  getAllCaps(filter: any) {
    return this.http.get(
      this.apiUrl + 'PartsAuditInnerScreen/get-all-capas',
      {
        params: filter
      }
    );
  }
  getDocs(auditParameterId: any) {
    return this.http.get(this.apiUrl + 'PartsAuditInnerScreen/get-docs', {
      params: { auditParameterId }
    });
  }

  deleteDoc(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAuditInnerScreen/delete-doc',
      data
    );
  }

  deleteCapa(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAuditInnerScreen/delete-capa',
      data
    );
  }

  updateCapaStatus(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAuditInnerScreen/update-capa-status',
      data
    );
  }
  archiveStatusChange(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAudit/archive-status-change',
      data
    );
  }
  deleteImage(data: any) {
    return this.http.post(
      this.apiUrl + 'PartsAuditInnerScreen/delete-image',
      data
    );
  }
}
