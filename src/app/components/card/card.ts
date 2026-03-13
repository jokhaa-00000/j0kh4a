import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { input, output } from '@angular/core';
import { Car, Api } from '../../services/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-card',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  car = input.required<Car>();
  isFavorite = output<number>();

  private router = inject(Router);
  private api = inject(Api);
  private imageBaseUrl = 'https://rentcar.stepprojects.ge/resources/';

  currentImageIndex = signal(0);
  isFav = signal(false);
  favoriteError = signal<string | null>(null);

  private normalizeImageUrl(url: string): string {
    if (!url) return '';
    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    // If it's a relative path, prepend the base URL
    return this.imageBaseUrl + url;
  }

  images() {
    const car = this.car();
    const images: string[] = [];
    if (car.imageUrl1) images.push(this.normalizeImageUrl(car.imageUrl1));
    if (car.imageUrl2) images.push(this.normalizeImageUrl(car.imageUrl2));
    if (car.imageUrl3) images.push(this.normalizeImageUrl(car.imageUrl3));
    if (!images.length && car.image1) images.push(this.normalizeImageUrl(car.image1));
    if (!images.length && car.image2) images.push(this.normalizeImageUrl(car.image2));
    if (!images.length && car.image3) images.push(this.normalizeImageUrl(car.image3));
    return images.length > 0
      ? images
      : [
          'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E',
        ];
  }

  previousImage() {
    const images = this.images();
    this.currentImageIndex.update((idx) => (idx - 1 + images.length) % images.length);
  }

  nextImage() {
    const images = this.images();
    this.currentImageIndex.update((idx) => (idx + 1) % images.length);
  }

  private getUserId(): string | null {
    const storedId = localStorage.getItem('userId');
    if (storedId) return storedId;

    const phone = localStorage.getItem('phoneNumber');
    if (phone) return phone;

    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    try {
      const user = JSON.parse(userJson);
      return user?.id || user?.userId || user?.user?.id || user?.phoneNumber || null;
    } catch {
      return null;
    }
  }

  toggleFavorite() {
    const userId = this.getUserId();
    if (!userId) {
      this.router.navigate(['/register']);
      return;
    }

    this.favoriteError.set(null);

    this.api.addToFavorites(userId, this.car().id).subscribe({
      next: () => {
        this.isFav.update((val) => !val);
        this.isFavorite.emit(this.car().id);
      },
      error: (err) => {
        const message = err?.error?.message || 'Failed to add to favorites';
        this.favoriteError.set(message);
        console.error('Error adding to favorites:', err);
      },
    });
  }

  rentCar() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/register']);
      return;
    }
    // Navigate to rent page with car id
    this.router.navigate(['/rent'], { queryParams: { carId: this.car().id } });
  }

  get carName(): string {
    return `${this.car().brand} ${this.car().model}`;
  }

  get currentImage(): string {
    return this.images()[this.currentImageIndex()];
  }
}
