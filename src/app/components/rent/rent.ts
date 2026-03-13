import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loader } from '../loader/loader';
import { ActivatedRoute } from '@angular/router';
import { Api, Car } from '../../services/api';
import { HttpClient } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rent',
  imports: [CommonModule, Loader, TranslateModule],
  templateUrl: './rent.html',
  styleUrl: './rent.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rent implements OnInit {
  mapInitialized = false;
  randomX = 0;
  randomY = 0;
  setDays(val: any) {
    this.days.set(Number(val));
  }
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  private http = inject(HttpClient);

  car = signal<Car | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  days = signal(1);
  mapUrl = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const carId = params['carId'];
      if (!carId) {
        this.error.set('Car not found');
        this.loading.set(false);
        return;
      }
      this.api.getCarById(carId).subscribe({
        next: (car) => {
          this.car.set(car);
          this.setRandomMap(car);
          this.generateRandomLocation();
          this.loading.set(false);
          setTimeout(() => this.initLeafletMap(), 100);
        },
        error: () => {
          this.error.set('Car not found');
          this.loading.set(false);
        },
      });
    });
  }

  initLeafletMap() {
    if (this.mapInitialized) return;
    this.mapInitialized = true;
    const lat = this.car()?.latitude || 41 + Math.random();
    const lng = this.car()?.longitude || 44 + Math.random();
    // @ts-ignore
    const map = window.L.map('leafletMap').setView([lat, lng], 8);
    // @ts-ignore
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    // @ts-ignore
    window.L.marker([lat, lng]).addTo(map);
  }

  generateRandomLocation() {
    // Map box is 900x300
    this.randomX = Math.floor(Math.random() * 880) + 10;
    this.randomY = Math.floor(Math.random() * 280) + 10;
  }

  setRandomMap(car: Car) {
    // Random location in Georgia
    const lat = 41 + Math.random();
    const lng = 44 + Math.random();
    this.mapUrl.set(`https://maps.google.com/maps?q=${lat},${lng}&z=12&output=embed`);
  }

  purchase() {
    this.error.set(null);
    this.success.set(null);
    const phoneNumber = localStorage.getItem('phoneNumber');
    const car = this.car();
    const multiplier = this.days();
    if (!phoneNumber) {
      window.location.href = '/register';
      return;
    }
    if (!car || !multiplier) {
      this.error.set('Car or rental days missing. Please select a car and days.');
      return;
    }
    const purchaseUrl = `https://rentcar.stepprojects.ge/Purchase/purchase?phoneNumber=${phoneNumber}&carId=${car.id}&multiplier=${multiplier}`;
    this.http.post(purchaseUrl, {}).subscribe({
      next: () => {
        this.success.set('Purchase successful!');
        // Only send notification if renting someone else's car
        if (car.ownerPhoneNumber && car.ownerPhoneNumber !== phoneNumber) {
          const messageUrl = `https://rentcar.stepprojects.ge/Message/Message?phoneNumber=${phoneNumber}&CarId=${car.id}`;
          this.http.post(messageUrl, {}).subscribe({
            next: () => {
              // Optionally show a message or update UI
            },
            error: (err) => {
              console.error('Failed to send message', err);
            },
          });
        }
      },
      error: () => {
        this.error.set('Purchase failed! Please try again.');
      },
    });
  }
}
