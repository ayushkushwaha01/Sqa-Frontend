import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
 
@Injectable({
  providedIn: 'root'
})
export class ManageUsersService {

  // Base API URL
  apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  // ==========================================
  // ---------- ROLES API ENDPOINTS -----------
  // ==========================================
  
  getAllRoles() {
    return this.http.get(this.apiUrl + 'RoleMasters/get-all');
  }

  upsertRole(data: any) {
    return this.http.post(this.apiUrl + 'RoleMasters/upsert', data);
  }

  toggleStatus(data: any) {
    return this.http.post(this.apiUrl + 'RoleMasters/toggle-status', data);
  }

  deleteRole(data: any) {
    return this.http.post(this.apiUrl + 'RoleMasters/delete', data);
  }

  // ==========================================
  // ---------- USERS API ENDPOINTS -----------
  // ==========================================
  
  getAllUsers() {
    return this.http.get(this.apiUrl + 'Users/get-all');
  }

  upsertUser(data: any) {
    return this.http.post(this.apiUrl + 'Users/upsert', data);
  }

  toggleUserStatus(data: any) {
    return this.http.post(this.apiUrl + 'Users/toggle-status', data);
  }

  deleteUser(data: any) {
    return this.http.post(this.apiUrl + 'Users/delete', data);
  }

  getManagers() {
    return this.http.get(this.apiUrl + 'Users/get-managers');
  }

  resetPassword(data: any) {
    return this.http.post(this.apiUrl + 'Users/reset-password', data);
  }

  // ==========================================
  // ---------- AUTHENTICATION ----------------
  // ==========================================
   
  login(credentials: any) {
    return this.http.post(this.apiUrl + 'Auth/login', credentials);
  }

  forgotPassword(email: string) {
    return this.http.post(this.apiUrl + 'Auth/forgot-password', { email: email });
  }

  resetPasswordWithToken(data: any) {
    return this.http.post(this.apiUrl + 'Auth/reset-password-with-token', data);
  }

  // ==========================================
  // ---------- SUPPLIERS API ENDPOINTS -------
  // ==========================================

  getSuppliers() { 
    return this.http.get(this.apiUrl + 'Suppliers/get-all'); 
  }
  
  upsertSupplier(data: any) { 
    return this.http.post(this.apiUrl + 'Suppliers/upsert', data); 
  }
  
  toggleSupplierStatus(id: number) { 
    return this.http.post(this.apiUrl + `Suppliers/toggle-status/${id}`, {}); 
  }
  
  deleteSupplier(id: number) { 
    return this.http.post(this.apiUrl + `Suppliers/delete/${id}`, {}); 
  }
  
  resetSupplierPassword(data: any) { 
    return this.http.post(this.apiUrl + 'Suppliers/reset-password', data); 
  }

  // ==========================================
  // ---------- LOCATION API ENDPOINTS --------
  // ==========================================

  getStates() { 
    return this.http.get(this.apiUrl + 'StateMasters/get-all-states'); 
  }
  
  getCities() { 
    return this.http.get(this.apiUrl + 'CityMasters/get-all-cities'); 
  }

}