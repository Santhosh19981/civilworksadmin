import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoreService {
    constructor(private http: HttpClient) { }

    getStats(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/dashboard/stats`).pipe(map((res: any) => res.data));
    }

    getPaymentStats(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/dashboard/payments/stats`).pipe(map((res: any) => res.data));
    }

    getRevenueReport(days: number = 30): Observable<any> {
        return this.http.get(`${environment.apiUrl}/dashboard/reports/revenue?days=${days}`).pipe(map((res: any) => res.data));
    }

    // Generic CRUD
    getData(key: string, page: number = 1, limit: number = 10, filters: any = {}): Observable<any> {
        let endpoint = key;
        if (key === 'customers') endpoint = 'users?role=customer';

        let url = `${environment.apiUrl}/${endpoint}`;
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}page=${page}&limit=${limit}`;

        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null && value !== '') {
                url += `&${key}=${value}`;
            }
        }

        return this.http.get<any>(url);
    }

    addItem(key: string, item: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/${key}/admin`, item);
    }

    updateItem(key: string, id: any, updates: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/${key}/admin/${id}`, updates);
    }

    deleteItem(key: string, id: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/${key}/admin/${id}`);
    }

    getSettings(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/settings`).pipe(map((res: any) => res.data));
    }

    updateSettings(data: any): Observable<any> {
        return this.http.put(`${environment.apiUrl}/admin/settings`, data);
    }

    uploadImage(file: File | Blob): Observable<any> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post(`${environment.apiUrl}/upload`, formData).pipe(map((res: any) => res.data));
    }

    updateProfile(data: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/users/profile`, data);
    }
}
