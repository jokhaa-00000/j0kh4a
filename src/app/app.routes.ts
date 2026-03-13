import { Routes } from '@angular/router';
import { Main } from './components/main/main';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { Cars } from './components/cars/cars';
import { Rent } from './components/rent/rent';
import { Rentout } from './components/rentout/rentout';

export const routes: Routes = [
  {
    path: '',
    component: Main,
  },
  {
    path: 'cars',
    component: Cars,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'profile',
    component: Profile,
  },
  {
    path: 'rent',
    component: Rent,
  },
  {
    path: 'rentout',
    component: Rentout,
  },
];
