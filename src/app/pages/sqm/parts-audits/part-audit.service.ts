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

}
