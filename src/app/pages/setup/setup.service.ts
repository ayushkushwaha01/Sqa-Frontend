import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  // --- Existing State APIs ---
  getAllStates() { return this.http.get(this.apiUrl + 'StateMasters/get-all-states'); }
  addState(data: any) { return this.http.post(this.apiUrl + 'StateMasters/add-state', data); }
  toggleStatus(data: any) { return this.http.post(this.apiUrl + 'StateMasters/toggle-status', data); }
  deleteState(data: any) { return this.http.post(this.apiUrl + 'StateMasters/delete', data); }

  // --- Existing City APIs ---
  getAllCities() { return this.http.get(this.apiUrl + 'CityMasters/get-all-cities'); }
  addCity(data: any) { return this.http.post(this.apiUrl + 'CityMasters/add-city', data); }
  deleteCity(data: any) { return this.http.post(this.apiUrl + 'CityMasters/delete-city', data); }
  toggleCity(data: any) { return this.http.post(this.apiUrl + 'CityMasters/toggle-city', data); }

  // --- NEW: Supplier APIs ---
  getAllSuppliers() { return this.http.get(this.apiUrl + 'SupplierMaster/get-all-suppliers'); }
  addSupplier(data: any) { return this.http.post(this.apiUrl + 'SupplierMaster/add-supplier', data); }
  toggleSupplierStatus(data: any) { return this.http.post(this.apiUrl + 'SupplierMaster/toggle-status', data); }
  deleteSupplier(data: any) { return this.http.post(this.apiUrl + 'SupplierMaster/delete', data); }

  // --- kJ ravi services ---
  upsertPartAuditCategory(data: any) { return this.http.post(this.apiUrl + 'PartsAuditCategories/upsert', data); }
  getPartAuditCategories(filter: any) { return this.http.get(this.apiUrl + 'PartsAuditCategories/get-all', { params: filter }); }
  deletePartAuditCategory(data: any) { return this.http.post(this.apiUrl + 'PartsAuditCategories/delete', data); }
  ChangeStatus(data: any) { return this.http.post(this.apiUrl + 'PartsAuditCategories/toggle-status', data); }

  upsertPartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/upsert', data); }
  getPartFamilies(filter: any) { return this.http.get(this.apiUrl + 'PartFamily/get-all', { params: filter }); }
  deletePartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/delete', data); }
  changeStatusPartFamily(data: any) { return this.http.post(this.apiUrl + 'PartFamily/toggle-status', data); }
  
  // NEW: Save Defects JSON to Part Family
  updatePartFamilyDefects(data: any) { return this.http.post(this.apiUrl + 'PartFamily/update-defects', data); }

  upsertParameter(data: any) { return this.http.post(this.apiUrl + 'PartFamily/upsert-parameter', data); }
  getParameters(filter: any) { return this.http.get(this.apiUrl + 'PartFamily/get-parameters', { params: filter }); }
  deleteParameter(data: any) { return this.http.post(this.apiUrl + 'PartFamily/delete-parameter', data); }

  upsertPartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/upsert', data); }
  getPartMaster(filter: any) { return this.http.get(this.apiUrl + 'PartMaster/get-all', { params: filter }); }
  deletePartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/delete', data); }
  changeStatusPartMaster(data: any) { return this.http.post(this.apiUrl + 'PartMaster/toggle-status', data); }

  upsertBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/upsert', data); }
  getBatchMaster(filter: any) { return this.http.get(this.apiUrl + 'BatchMaster/get-all', { params: filter }); }
  deleteBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/delete', data); }
  changeStatusBatchMaster(data: any) { return this.http.post(this.apiUrl + 'BatchMaster/toggle-status', data); }

  // --- Defects Master ---
  getDefects() { return this.http.get(this.apiUrl + 'Defects/get-all'); }
  upsertDefect(data: any) { return this.http.post(this.apiUrl + 'Defects/upsert', data); }
  deleteDefect(data: any) { return this.http.post(this.apiUrl + 'Defects/delete', data); }
}