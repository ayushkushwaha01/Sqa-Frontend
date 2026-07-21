import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class InspectionService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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
    // Passes the boolean value perfectly in the URL to match the new C# route
    return this.http.put(
      `${this.apiUrl}DataTable/toggle-publish/${id}/${isPublished}`,
      {},
    );
  }

  // --- NEW: Fetch inner screen parameters ---
  getInspectionParameters(inspectionId: number): Observable<any> {
    // NOTE: Ensure your controller has [Route("api/[controller]")] at the top of the class
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
}
