import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class InspectionService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllInspections(): Observable<any> {
    return this.http.get(this.apiUrl + "DataTable/get-all-records");
  }

  addInspection(data: any): Observable<any> {
    return this.http.post(this.apiUrl + "DataTable/add-record", data);
  }

  updateInspection(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}DataTable/update-record/${id}`, data);
  }

  deleteInspection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}DataTable/delete-record/${id}`);
  }

  archiveInspection(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}DataTable/archive-record/${id}`, {});
  }

  togglePublish(id: number, isPublished: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}DataTable/toggle-publish/${id}/${isPublished}`,
      {},
    );
  }

  // Fetch inner screen parameters
  getInspectionParameters(inspectionId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}InspectionRef/GetParametersByInspectionId/${inspectionId}`,
    );
  }

  addOrUpdateInspectionParameter(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}InspectionRef/AddOrUpdateParameter`,
      data,
    );
  }

  updateSampleValues(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionRef/UpdateSamples`, data);
  }


  toggleOkayStatus(id: number, status: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}InspectionRef/toggle-ok/${id}?status=${status}`,
      {}
    );
  }

  getCapaByInspectionRefId(inspectionRefId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionCapa/GetCapaByInspectionId/${inspectionRefId}`);
  }

  // Save or Update CAPA
  saveCapa(capaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionCapa/SaveCapa`, capaData);
  }

  // Add this inside InspectionService
  deleteCapaDocument(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionCapa/delete-document`, payload);
  }


  // Fetch defects for a specific inspection record
  getDefectsByInspection(inspectionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionDefects/GetDefectsByInspection/${inspectionId}`);
  }

  // Update defect statuses
  updateDefectsStatus(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}InspectionDefects/UpdateDefectsStatus`, payload);
  }



  // Add this inside InspectionService class
  getPendingCapaRecords(): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionCapa/GetPendingCapaRecords`);
  }

  updateCapaInlineStatus(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}InspectionCapa/UpdateInlineStatus`, payload);
  }

  getCapaDocuments(capaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}InspectionCapa/GetCapaDocuments/${capaId}`);
  }





  // Add this inside InspectionService class
  updateCapaDetails(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}InspectionCapa/UpdateCapaDetails`, payload);
  }

  deleteCapa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}InspectionCapa/DeleteCapa/${id}`);
  }

   getAllArchived(): Observable<any> {
    return this.http.get(this.apiUrl + "DataTable/get-all-archive");
  }
}