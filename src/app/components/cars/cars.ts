import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Car, PaginatedResponse } from '../../services/api';
import { Card } from '../card/card';
import { Loader } from '../loader/loader';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cars',
  imports: [CommonModule, Card, FormsModule, Loader, TranslateModule],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cars implements OnInit {
  private api = inject(Api);

  cars = signal<Car[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(176);

  // Filter signals
  capacity = signal<number | null>(null);
  startYear = signal<number | null>(null);
  endYear = signal<number | null>(null);
  city = signal<string>('');
  cities = signal<string[]>([]);

  // Real Georgian cities for filtering
  private realCities = new Set([
    'ბათუმი',
    'თბილისი',
    'გორი',
    'ქუთაისი',
    'ქობულეთი',
    'ახალციხე',
    'ზესტაფონი',
    'მესტია',
    'წყალტუბო',
    'ხაშური',
    'Batumi',
    'tbilisi',
    'tbilis',
  ]);

  ngOnInit() {
    this.loadCities();
    this.loadCars();
  }

  loadCities() {
    this.api.getCities().subscribe({
      next: (data) => {
        // Filter to only keep real cities
        const filteredCities = (data || [])
          .filter((city) => city && this.realCities.has(city))
          .sort();
        this.cities.set([...new Set(filteredCities)]);
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.cities.set([]);
      },
    });
  }

  loadCars() {
    this.loading.set(true);
    this.error.set(null);

    const capacityValue = this.capacity() ? Number(this.capacity()) : undefined;
    const startYearValue = this.startYear() ? Number(this.startYear()) : undefined;
    const endYearValue = this.endYear() ? Number(this.endYear()) : undefined;
    const cityValue = this.city()?.trim() || undefined;

    this.api
      .filterCars(
        this.currentPage(),
        this.pageSize(),
        capacityValue,
        startYearValue,
        endYearValue,
        cityValue,
      )
      .subscribe({
        next: (response: PaginatedResponse) => {
          this.cars.set(response.data);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading cars:', err);
          this.error.set('Failed to load cars');
          this.loading.set(false);
        },
      });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadCars();
  }

  onFilterChange(value: any, filterType: string) {
    if (filterType === 'capacity') {
      this.capacity.set(value);
    } else if (filterType === 'startYear') {
      this.startYear.set(value);
    } else if (filterType === 'endYear') {
      this.endYear.set(value);
    } else if (filterType === 'city') {
      this.city.set(value);
    }
    // Reset to page 1 and load cars
    this.currentPage.set(1);
    this.loadCars();
  }

  clearFilters() {
    this.capacity.set(null);
    this.startYear.set(null);
    this.endYear.set(null);
    this.city.set('');
    this.currentPage.set(1);
    this.loadCars();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadCars();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadCars();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCars();
    }
  }

  onFavoriteAdded(carId: number) {
    console.log(`Car ${carId} added to favorites`);
  }
}
