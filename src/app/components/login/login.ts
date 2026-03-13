import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  phoneNumber = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: Api,
    private router: Router,
  ) {}

  onSubmit() {
    if (!this.phoneNumber || !this.password) {
      this.errorMessage = 'Phone number and password are required!';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginData = {
      phoneNumber: this.phoneNumber,
      password: this.password,
    };

    this.api.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Login successful! Redirecting...';
        localStorage.setItem('user', JSON.stringify(response));
        const resp: any = response;
        const resolvedId =
          resp.id || resp.userId || (resp.user && resp.user.id) || this.phoneNumber || '';
        localStorage.setItem('userId', resolvedId);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('phoneNumber', this.phoneNumber);
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      },
    });
  }
}
