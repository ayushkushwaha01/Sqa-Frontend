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


  // Preference screen API endpoints
  getPreferences() {
    return this.http.get(this.apiUrl + 'Preference/get-preferences');
  }
  upsertPreference(data: any) { return this.http.post(this.apiUrl + 'Preference/upsert-preference', data); }
  getEscalation() {
    return this.http.get(this.apiUrl + 'Escalation/get-escalations');
  }
  upsertEscalation(data: any) { return this.http.post(this.apiUrl + 'Escalation/upsert-escalation', data); }


  // ==========================================
  // ----------Screen PERMISSIONS Api's ---------
  // ==========================================

  getRolePermissions(roleId: number) {
    return this.http.get(this.apiUrl + `RolePermissions/get-role-permissions?roleId=${roleId}`);
  }

  saveRolePermissions(payload: any) {
    return this.http.post(this.apiUrl + 'RolePermissions/save-role-permissions', payload);
  }

  getUserLoginPermissions(roleId: number) {
    return this.http.get(this.apiUrl + `RolePermissions/get-user-login-permissions?roleId=${roleId}`);
  }

  // ==========================================
  // ---------- HELP DESK API ENDPOINTS -------
  // ==========================================

  getHelpDeskNotifications(userId: number, userType: string) {
    return this.http.get<any>(`${this.apiUrl}HelpDesk/get-notifications?userId=${userId}&userType=${userType}`);
  }

  getSentMails(userId: number, userType: string) {
    return this.http.get<any>(`${this.apiUrl}HelpDesk/get-sent-mails?userId=${userId}&userType=${userType}`);
  }

  // ==========================================
  // ---------- ESCALATION AUTOMATION ---------
  // ==========================================

  triggerDailyEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-daily-escalations', {});
  }

  // ==========================================
  // DAILY ESCALATION SWEEPERS
  // ==========================================

  triggerProcessEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-daily-escalations', {});
  }

  triggerPartsEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-parts-escalations', {});
  }

  triggerInspectionEscalations() {
    return this.http.post(this.apiUrl + 'CapaEscalation/trigger-inspection-escalations', {});
  }

  // for eventLog 

  getEventLog(filter: any) { return this.http.get(this.apiUrl + 'Preference/get-event-log', { params: filter }); }


}