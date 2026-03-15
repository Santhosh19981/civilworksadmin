import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (localStorage.getItem('civilworks_admin_token')) {
            // Check for specific permission if required by route
            const requiredPermission = route.data['permission'];
            if (requiredPermission && !this.auth.hasPermission(requiredPermission)) {
                alert('You do not have permission to access this page');
                this.router.navigate(['/dashboard']);
                return false;
            }
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
