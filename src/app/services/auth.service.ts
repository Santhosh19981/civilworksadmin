import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(this.checkToken());

    constructor(private router: Router) { }

    private checkToken(): boolean {
        return !!localStorage.getItem('admin_token');
    }

    isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    login(email: string, pass: string): boolean {
        if (email === 'admin@buildpro.com' && pass === 'admin123') {
            localStorage.setItem('admin_token', 'fake-jwt-token');
            this.loggedIn.next(true);
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('admin_token');
        this.loggedIn.next(false);
        this.router.navigate(['/login']);
    }
}
