import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api, Car, CreateCarRequest } from '../../services/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rentout',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './rentout.html',
  styleUrl: './rentout.css',
})
export class Rentout implements OnInit {
  get createdCarAsCar(): Car | null {
    return this.createdCar;
  }
  brand = '';
  model = '';
  year = new Date().getFullYear();
  price = 0;
  capacity = 4;
  transmission = 'Automatic';
  city = '';
  latitude?: number;
  longitude?: number;
  fuelCapacity?: number;
  image1?: File;
  image2?: File;
  image3?: File;

  // common car brands for quick selection (matches the screenshot dropdown)
  brandOptions = [
    'Ferrari',
    'Porsche',
    'Lamborghini',
    'Aston Martin',
    'McLaren',
    'Bugatti',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Tesla',
    'Ford',
    'Toyota',
    'Nissan',
    'Honda',
  ];

  // Available models for selected brands (optional suggestion list)
  modelOptions: string[] = [];
  modelInputMode: 'select' | 'text' = 'text';

  private brandModelMap: Record<string, string[]> = {
    Lamborghini: ['Aventador', 'Huracán', 'Urus', 'Sian', 'Sián FKP 37'],
    Ferrari: ['488', 'F8 Tributo', 'Roma', 'Portofino', 'SF90'],
    Porsche: ['911', 'Cayenne', 'Panamera', 'Taycan', 'Macan'],
    'Aston Martin': ['DB11', 'Vantage', 'DBX', 'Valhalla'],
    McLaren: ['720S', 'Artura', 'GT', 'P1'],
    Bugatti: ['Chiron', 'Veyron', 'Divo'],
  };

  cities: string[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  createdCar: Car | null = null;
  // Explicit type assertion for Angular template type checking
  // This is a workaround for Angular's strict template type inference
  // See https://github.com/angular/angular/issues/37619

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

  image1Preview: string | null = null;
  image2Preview: string | null = null;
  image3Preview: string | null = null;

  constructor(
    private api: Api,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadCities();
  }

  onBrandChange(value: string) {
    this.brand = value;
    this.modelOptions = this.brandModelMap[value] ?? [];

    this.modelInputMode = this.modelOptions.length ? 'select' : 'text';

    // Clear model if it is no longer part of the suggested list.
    if (this.model && this.modelOptions.length && !this.modelOptions.includes(this.model)) {
      this.model = '';
    }
  }

  onModelSelect(value: string) {
    if (value === '__other') {
      this.modelInputMode = 'text';
      this.model = '';
    } else {
      this.model = value;
    }
  }

  private loadCities() {
    this.api.getCities().subscribe({
      next: (data) => {
        const filteredCities = (data || [])
          .filter((city) => city && this.realCities.has(city))
          .sort();
        this.cities = [...new Set(filteredCities)];
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.cities = [];
      },
    });
  }

  onFileSelected(event: Event, index: 1 | 2 | 3) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    // Store file directly - let API handle size validation
    if (index === 1) {
      this.image1 = file;
      this.setImagePreview(file, 1);
    }
    if (index === 2) {
      this.image2 = file;
      this.setImagePreview(file, 2);
    }
    if (index === 3) {
      this.image3 = file;
      this.setImagePreview(file, 3);
    }
    console.log(`Image ${index} selected:`, file.name, `(${(file.size / 1024).toFixed(1)}KB)`);
  }

  setImagePreview(file: File, index: 1 | 2 | 3) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (index === 1) this.image1Preview = e.target.result;
      if (index === 2) this.image2Preview = e.target.result;
      if (index === 3) this.image3Preview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private resetForm() {
    this.brand = '';
    this.model = '';
    this.year = new Date().getFullYear();
    this.price = 0;
    this.capacity = 4;
    this.transmission = 'Automatic';
    this.city = '';
    this.latitude = undefined;
    this.longitude = undefined;
    this.fuelCapacity = undefined;
    this.image1 = undefined;
    this.image2 = undefined;
    this.image3 = undefined;
    this.modelOptions = [];
    this.modelInputMode = 'text';
  }

  onSubmit() {
    if (!this.brand || !this.model || !this.city || !this.price || !this.year) {
      this.errorMessage = 'Please fill in all required fields.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const storedPhoneNumber = localStorage.getItem('phoneNumber') || '';
    const storedUser = localStorage.getItem('user');
    const storedUserData = storedUser ? JSON.parse(storedUser) : null;

    console.log('Selected files:', this.image1, this.image2, this.image3);

    const payload: CreateCarRequest = {
      brand: this.brand,
      model: this.model,
      year: Number(this.year),
      price: Number(this.price),
      capacity: Number(this.capacity),
      transmission: this.transmission,
      city: this.city,
      latitude: this.latitude,
      longitude: this.longitude,
      fuelCapacity: this.fuelCapacity ? Number(this.fuelCapacity) : undefined,
      image1: this.image1,
      image2: this.image2,
      image3: this.image3,
      createdBy: storedUserData?.email || storedUserData?.phoneNumber || '',
      createdByEmail: storedUserData?.email || '',
      ownerPhoneNumber: storedPhoneNumber,
    };

    console.log('Creating car with payload:', payload);

    this.api.createCar(payload).subscribe({
      next: (created) => {
        this.loading = false;
        console.log('Car created successfully:', created);
        this.successMessage = 'Car successfully added!';
        this.errorMessage = '';
        this.createdCar = created;
        this.resetForm();
        this.image1Preview = null;
        this.image2Preview = null;
        this.image3Preview = null;
      },
      error: (err) => {
        this.loading = false;
        console.error('Create car error:', err);
        this.errorMessage =
          err.error?.message || err.message || 'Failed to add car. Please try again.';
        this.successMessage = '';
      },
    });
  }
}
