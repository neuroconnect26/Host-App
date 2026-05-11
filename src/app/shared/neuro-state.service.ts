import { Injectable } from '@angular/core';

export interface NeuroUser {
  name: string;
  age: number | null;
  weight: number | null;
  weightUnit: 'kg' | 'lbs';
  height: number | null;
  heightUnit: 'cm' | 'ft';
}

export interface NeuroState {
  user: NeuroUser;
}

const STORAGE_KEY = 'neuroconnect_user';

const DEFAULT_USER: NeuroUser = {
  name: '',
  age: null,
  weight: null,
  weightUnit: 'lbs',
  height: null,
  heightUnit: 'ft',
};

@Injectable({ providedIn: 'root' })
export class NeuroStateService {
  private state: NeuroState = {
    user: { ...DEFAULT_USER, ...this.loadFromStorage() },
  };

  constructor() {
    this.publishToWindow();
  }

  getUser(): NeuroUser {
    return this.state.user;
  }

  updateUser(partial: Partial<NeuroUser>): void {
    this.state.user = { ...this.state.user, ...partial };
    this.saveToStorage();
    this.publishToWindow();

    window.dispatchEvent(
      new CustomEvent('neuroconnect:user-updated', {
        detail: this.state.user,
      }),
    );
  }

  private publishToWindow(): void {
    const win = window as Window & {
      __neuroConnect?: {
        user: NeuroUser;
        getUser: () => NeuroUser;
      };
    };

    win.__neuroConnect = {
      user: this.state.user,
      getUser: () => this.state.user,
    };
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.user));
  }

  private loadFromStorage(): Partial<NeuroUser> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<NeuroUser>;
    } catch {
      return {};
    }
  }
}
