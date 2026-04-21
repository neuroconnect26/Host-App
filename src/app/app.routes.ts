import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'glucose',
    loadComponent: () => 
      loadRemoteModule('glucose', './Component').then(m => m.AppComponent)
  },
  {
    path: 'cholesterol',
    loadComponent: () => 
      loadRemoteModule('cholesterol', './Component').then(m => m.AppComponent)
  },
  {
    path: 'sleep',
    loadComponent: () => 
      loadRemoteModule('sleep', './Component').then(m => m.AppComponent)
  },
  {
    path: 'mood',
    loadComponent: () => 
      loadRemoteModule('mood', './Component').then(m => m.AppComponent)
  },
  {
    path: 'heart-rate',
    loadComponent: () => 
      loadRemoteModule('heartRate', './Component').then(m => m.AppComponent)
  }
];