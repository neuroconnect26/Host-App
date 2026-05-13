import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { RemoteUnavailable } from './remote-unavailable/remote-unavailable';


const loadRemoteComponent = (
  options: { remoteName: string; exposedModule: string },
  selectComponent: (module: any) => any,
) =>
  loadRemoteModule({
    remoteName: options.remoteName,
    exposedModule: options.exposedModule,
  })
    .then(selectComponent)
    .catch((error) => {
      console.error(
        `Failed to load remote "${options.remoteName}" module "${options.exposedModule}"`,
        error,
      );
      return RemoteUnavailable;
    });

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  { path: 'home', component: Homepage, title: 'NeuroConnect' },
  { path: 'homepage', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'cholesterol',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'cholesterol',
        exposedModule: './Component',
      }, m => m.Dashboard)
  },
  {
    path: 'cholesterol/history',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'cholesterol',
        exposedModule: './History',
      }, m => m.History)
  },
  {
    path: 'cholesterol/results',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'cholesterol',
        exposedModule: './Results',
      }, m => m.Results)
  },
  {
    path: 'sleep',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'sleep',
        exposedModule: './Component',
      }, m => m.Dashboard)
  },
  {
    path: 'sleep/track',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'sleep',
        exposedModule: './Track',
      }, m => m.SleepTracker)
  },
  {
    path: 'sleep/analysis',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'sleep',
        exposedModule: './Analysis',
      }, m => m.SleepAnalysis)
  },
  {
    path: 'sleep/dreams',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'sleep',
        exposedModule: './Dreams',
      }, m => m.DreamJournal)
  },
  {
    path: 'mood',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'mood',
        exposedModule: './WeeklyTrend',
      }, m => m.App)
  },
  {
    path: 'mood/log',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'mood',
        exposedModule: './LogMood',
      }, m => m.Logmoodpage)
  },
  {
    path: 'mood/trends',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'mood',
        exposedModule: './Trends',
      }, m => m.Weeklytrend)
  },
  {
  path: 'heart-rate-card',
  loadComponent: () =>
    loadRemoteComponent({
      remoteName: 'heartRate',
      exposedModule: './Card',
      }, m => m.heartRateCard)
  },
  {
    path: 'heart-rate',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'heartRate',
        exposedModule: './Component',
      }, m => m.HeartComponent)
  },
  {
    path: 'glucose',
    loadComponent: () =>
      loadRemoteComponent({
        remoteName: 'glucose',
        exposedModule: './Component',
      }, m => m.GlucoseDashboard)
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
