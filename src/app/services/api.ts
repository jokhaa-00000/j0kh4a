import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  [key: string]: any;
}

export interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  image1: string;
  image2: string;
  image3: string;
  price: number;
  multiplier: number;
  capacity: number;
  transmission: string;
  createdBy: string;
  createdByEmail: string;
  fuelCapacity: number;
  city: string;
  latitude: number;
  longitude: number;
  ownerPhoneNumber: string;
}

export interface CreateCarRequest {
  brand: string;
  model: string;
  year: number;
  price: number;
  capacity: number;
  transmission: string;
  city: string;
  latitude?: number;
  longitude?: number;
  fuelCapacity?: number;
  image1?: File;
  image2?: File;
  image3?: File;
  createdBy?: string;
  createdByEmail?: string;
  ownerPhoneNumber?: string;
}

export interface PaginatedResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: Car[];
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private usersApiUrl = 'https://rentcar.stepprojects.ge/api/Users';
  private carsApiUrl = 'https://rentcar.stepprojects.ge/api/Car';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest | FormData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.usersApiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.usersApiUrl}/login`, data);
  }

  getAllCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.carsApiUrl);
  }

  getPopularCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.carsApiUrl}/popular`);
  }

  getCarById(id: number | string): Observable<Car> {
    return this.http.get<Car>(`${this.carsApiUrl}/${id}`);
  }

  createCar(data: CreateCarRequest): Observable<Car> {
    const formData = new FormData();

    formData.append('Brand', data.brand);
    formData.append('Model', data.model);
    formData.append('Year', data.year.toString());
    formData.append('Price', data.price.toString());
    formData.append('Capacity', data.capacity.toString());
    formData.append('Transmission', data.transmission);
    formData.append('City', data.city);

    if (data.latitude !== undefined) {
      formData.append('Latitude', data.latitude.toString());
    }

    if (data.longitude !== undefined) {
      formData.append('Longitude', data.longitude.toString());
    }

    if (data.fuelCapacity !== undefined) {
      formData.append('FuelCapacity', data.fuelCapacity.toString());
    }

    if (data.createdBy) {
      formData.append('CreatedBy', data.createdBy);
    }

    if (data.createdByEmail) {
      formData.append('CreatedByEmail', data.createdByEmail);
    }

    if (data.ownerPhoneNumber) {
      formData.append('OwnerPhoneNumber', data.ownerPhoneNumber);
    }

    if (data.image1) {
      formData.append('Image1', data.image1);
    }

    if (data.image2) {
      formData.append('Image2', data.image2);
    }

    if (data.image3) {
      formData.append('Image3', data.image3);
    }

    console.log('FormData ready');

    return this.http.post<Car>('https://rentcar.stepprojects.ge/api/Car', formData);
  }

  addToFavorites(userId: string, carId: number): Observable<any> {
    return this.http.post(`${this.usersApiUrl}/${userId}/favorites/${carId}`, {});
  }

  getFavoriteCars(userId: string): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.usersApiUrl}/${userId}/favorite-cars`);
  }

  getPurchases(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`https://rentcar.stepprojects.ge/Purchase/${userId}`);
  }

  filterCars(
    pageIndex: number,
    pageSize: number,
    capacity?: number,
    startYear?: number,
    endYear?: number,
    city?: string,
  ): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (capacity) params = params.set('capacity', capacity.toString());
    if (startYear) params = params.set('startYear', startYear.toString());
    if (endYear) params = params.set('endYear', endYear.toString());
    if (city) params = params.set('city', city);

    return this.http.get<PaginatedResponse>(`${this.carsApiUrl}/filter`, { params });
  }

  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.carsApiUrl}/cities`);
  }
  // Messaging API
  sendMessage(message: {
    senderPhoneNumber: string;
    receiverPhoneNumber: string;
    carId: number;
    text: string;
  }): Observable<any> {
    return this.http.post('https://rentcar.stepprojects.ge/Message/Message', message);
  }

  getMessages(phoneNumber: string): Observable<any[]> {
    return this.http.get<any[]>(
      `https://rentcar.stepprojects.ge/Message/Messages?phoneNumber=${phoneNumber}`,
    );
  }
}
