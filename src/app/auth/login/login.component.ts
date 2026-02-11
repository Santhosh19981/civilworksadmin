import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email = '';
    password = '';
    showPassword = false;
    error = '';

    constructor(private auth: AuthService, private router: Router) { }

    onLogin() {
        console.log('Login attempt:', this.email);
        if (this.auth.login(this.email, this.password)) {
            console.log('Login successful, navigating to dashboard...');
            this.router.navigateByUrl('/dashboard').then(success => {
                if (success) {
                    console.log('Navigation successful');
                } else {
                    console.error('Navigation failed');
                }
            });
        } else {
            console.error('Login failed: Invalid credentials');
            this.error = 'Invalid email or password. Please try again.';
        }
    }
}
