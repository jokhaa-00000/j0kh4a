import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  role = 'customer';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: Api,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      this.successMessage = '';
      return;
    }

    if (!this.firstName || !this.lastName || !this.email || !this.phoneNumber || !this.password) {
      this.errorMessage = 'All fields are required!';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData = {
      phoneNumber: this.phoneNumber,
      password: this.password,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
    };

    this.api.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Registration successful! Redirecting...';
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
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
