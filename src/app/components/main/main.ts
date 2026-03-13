import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loader } from '../loader/loader';
import { Api, Car } from '../../services/api';
import { Card } from '../card/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  imports: [CommonModule, Card, Loader, TranslateModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main implements OnInit {
  private api = inject(Api);

  randomCars = signal<Car[]>([]);
  popularCars = signal<Car[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.loading.set(true);
    this.error.set(null);

    Promise.all([this.api.getAllCars().toPromise(), this.api.getPopularCars().toPromise()])
      .then(([allCars, popularCarsData]) => {
        if (!allCars || !popularCarsData) {
          throw new Error('Failed to load cars');
        }

        // Get 10 random cars from all cars
        const shuffledAll = this.shuffleArray([...allCars]);
        this.randomCars.set(shuffledAll.slice(0, 10));

        // Get 10 popular cars
        const shuffledPopular = this.shuffleArray([...popularCarsData]);
        this.popularCars.set(shuffledPopular.slice(0, 10));

        this.loading.set(false);
      })
      .catch((err) => {
        console.error('Error loading cars:', err);
        this.error.set('Failed to load cars');
        this.loading.set(false);
      });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  onFavoriteAdded(carId: number) {
    console.log(`Car ${carId} added to favorites`);
  }
}
