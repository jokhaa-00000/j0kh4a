import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loader } from '../loader/loader';
import { Router } from '@angular/router';
import { Api, Car } from '../../services/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Loader, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private router = inject(Router);
  private api = inject(Api);

  userName = signal('');
  initials = signal('');
  favorites = signal<Car[]>([]);
  rentals = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  yourCars = signal<Car[]>([]);
  rentedOutCars = signal<Car[]>([]);
  messages = signal<any[]>([]);
  messageCars = signal<{ [carId: number]: Car }>({});
  showNotifications = signal(false);
  toggleNotifications() {
    this.showNotifications.set(!this.showNotifications());
  }

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    const phoneNumber = localStorage.getItem('phoneNumber');
    if (!userJson || !phoneNumber) {
      this.router.navigate(['/register']);
      return;
    }

    const user = JSON.parse(userJson);
    this.userName.set(
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User',
    );
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    this.initials.set(initials);

    this.loadFavorites(phoneNumber);
    this.loadRentals(phoneNumber);
    this.loadYourCars(phoneNumber);
    this.loadRentedOutCars(phoneNumber);
    this.loadMessages(phoneNumber);
  }
  private loadMessages(phoneNumber: string) {
    this.api.getMessages(phoneNumber).subscribe({
      next: (messages) => {
        this.messages.set(messages || []);
        // Load car info for all message carIds
        const carIds = Array.from(new Set((messages || []).map((m: any) => m.carId)));
        if (carIds.length > 0) {
          this.api.getAllCars().subscribe({
            next: (cars) => {
              const carMap: { [carId: number]: Car } = {};
              carIds.forEach((id) => {
                const car = cars.find((c) => c.id === id);
                if (car) carMap[id] = car;
              });
              this.messageCars.set(carMap);
            },
            error: () => {
              this.messageCars.set({});
            },
          });
        } else {
          this.messageCars.set({});
        }
      },
      error: (err) => {
        console.error('Failed to load messages', err);
        this.messages.set([]);
        this.messageCars.set({});
      },
    });
  }

  private loadFavorites(phoneNumber: string) {
    this.api.getFavoriteCars(phoneNumber).subscribe({
      next: (cars) => {
        this.favorites.set(cars || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load favorite cars', err);
        this.error.set('Failed to load favorite cars');
        this.loading.set(false);
      },
    });
  }

  private loadRentals(phoneNumber: string) {
    this.api.getPurchases(phoneNumber).subscribe({
      next: (rentals) => {
        this.rentals.set(rentals || []);
      },
      error: (err) => {
        console.error('Failed to load rentals', err);
      },
    });
  }

  rentFavorite(carId: number) {
    this.router.navigate(['/rent'], { queryParams: { carId } });
  }

  private loadYourCars(phoneNumber: string) {
    this.api.getPurchases(phoneNumber).subscribe({
      next: (purchases) => {
        if (!purchases || purchases.length === 0) {
          this.yourCars.set([]);
          return;
        }
        // Fetch all cars
        this.api.getAllCars().subscribe({
          next: (cars) => {
            // Merge purchase info with car details
            const merged = purchases.map((purchase) => {
              const car = cars.find((c) => c.id === purchase.carId);
              return car ? { ...car, ...purchase } : purchase;
            });
            this.yourCars.set(merged);
          },
          error: (err) => {
            console.error('Failed to load car details for purchases', err);
            this.yourCars.set([]);
          },
        });
      },
      error: (err) => {
        console.error('Failed to load your cars', err);
        this.yourCars.set([]);
      },
    });
  }

  private loadRentedOutCars(phoneNumber: string) {
    this.api.getPurchases(phoneNumber).subscribe({
      next: (purchases) => {
        if (!purchases || purchases.length === 0) {
          this.rentedOutCars.set([]);
          return;
        }
        this.api.getAllCars().subscribe({
          next: (cars) => {
            // Join purchases with car details
            const rentedCars = purchases
              .map((purchase) => cars.find((car) => car.id === purchase.carId))
              .filter((car) => !!car);
            this.rentedOutCars.set(rentedCars);
          },
          error: (err) => {
            console.error('Failed to load car details for rentals', err);
            this.rentedOutCars.set([]);
          },
        });
      },
      error: (err) => {
        console.error('Failed to load rented out cars', err);
        this.rentedOutCars.set([]);
      },
    });
  }
}

// Removed: now only using localStorage for your cars
