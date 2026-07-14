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

 //Roles realted API endpoints by ayush
  
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

   
login(credentials: any) {
  return this.http.post(this.apiUrl + 'Auth/login', credentials);
}



}