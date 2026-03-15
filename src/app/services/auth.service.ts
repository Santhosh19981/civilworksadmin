import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'civilworks_admin_token';
    private readonly USER_KEY = 'civilworks_admin_user';
    private loggedIn = new BehaviorSubject<boolean>(this.checkToken());

    constructor(private router: Router, private http: HttpClient) { }

    private checkToken(): boolean {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    isLoggedIn(): Observable<boolean> {
        return this.loggedIn.asObservable();
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/auth/admin-login`, { email, password })
            .pipe(
                tap(res => {
                    if (res.status === 'success' && res.data.token) {
                        localStorage.setItem(this.TOKEN_KEY, res.data.token);
                        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
                        this.loggedIn.next(true);
                    }
                })
            );
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.loggedIn.next(false);
        this.router.navigate(['/login']);
    }

    get currentUserValue(): any {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    hasPermission(page: string): boolean {
        const user = this.currentUserValue;
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (!user.permissions) return false;
        return user.permissions.split(',').includes(page);
    }
}
