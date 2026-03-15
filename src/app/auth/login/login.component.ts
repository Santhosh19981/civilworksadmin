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
    loading = false;

    constructor(private auth: AuthService, private router: Router) { }

    onLogin() {
        // Clear previous error and set loading
        this.error = '';
        this.loading = true;

        this.auth.login(this.email, this.password).subscribe({
            next: (res) => {
                this.loading = false;
                this.router.navigateByUrl('/dashboard');
            },
            error: (err) => {
                this.loading = false;
                console.error('Login failed:', err);

                if (err.status === 0) {
                    // Network error / server not reachable
                    this.error = 'Cannot connect to server. Please try again later.';
                } else if (err.error?.message) {
                    // API returned a structured error message
                    this.error = err.error.message;
                } else if (err.message) {
                    this.error = err.message;
                } else {
                    this.error = 'Invalid email or password. Please try again.';
                }
            }
        });
    }
}
