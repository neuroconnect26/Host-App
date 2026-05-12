import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, OnInit, OnDestroy, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { NeuroStateService, NeuroUser } from '../shared/neuro-state.service';

type CardKey = 'sleep' | 'glucose' | 'cholesterol' | 'mood' | 'heartRate';
const CARD_TIMEOUT_MS = 6500;
const CARD_RETRY_DELAY_MS = 450;

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, FormsModule, RouterLink, NgComponentOutlet],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit, OnDestroy {
  sleepCard?: Type<unknown>;
  glucoseCard?: Type<unknown>;
  moodCard?: Type<unknown>;
  heartRateCard?: Type<unknown>;
  latestCholesterol: {
    total?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    date?: string;
  } | null = null;

  user: NeuroUser;
  greeting = '';
  editingProfile = false;
  saved = false;
  private destroyed = false;

  cardStatus: Record<CardKey, 'loading' | 'ready' | 'error'> = {
    sleep: 'loading',
    glucose: 'loading',
    cholesterol: 'loading',
    mood: 'loading',
    heartRate: 'loading',
  };
  cardError: Record<CardKey, string> = {
    sleep: '',
    glucose: '',
    cholesterol: '',
    mood: '',
    heartRate: '',
  };

  constructor(private state: NeuroStateService) {
    this.user = { ...state.getUser() };
  }

  async ngOnInit(): Promise<void> {
    this.destroyed = false;
    this.greeting = this.getGreeting();
    await this.loadCards();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.sleepCard = undefined;
    this.glucoseCard = undefined;
    this.moodCard = undefined;
    //this.heartRateCard = undefined;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.user.name ? `, ${this.user.name}` : '';
    if (hour < 12) return `Good morning${name}`;
    if (hour < 17) return `Good afternoon${name}`;
    return `Good evening${name}`;
  }

  saveProfile(): void {
    this.state.updateUser(this.user);
    this.greeting = this.getGreeting();
    this.editingProfile = false;
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }

  async loadCards(): Promise<void> {
    this.refreshCholesterolData();
     Promise.all([
      this.loadSleepCard(),
      this.loadGlucoseCard(),
      this.loadCholesterolCard(),
      this.loadMoodCard(),
      this.loadHeartRateCard(),
    ]);
  }

  retryCard(card: CardKey, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (card === 'sleep') void this.loadSleepCard(true);
    if (card === 'glucose') void this.loadGlucoseCard(true);
    if (card === 'cholesterol') void this.loadCholesterolCard(true);
    if (card === 'mood') void this.loadMoodCard(true);
    if (card === 'heartRate') void this.loadHeartRateCard(true);
  }

  private async loadSleepCard(force = false): Promise<void> {
    this.cardStatus.sleep = 'loading';
    this.cardError.sleep = '';
    try {
      const card = await this.loadCardWithTimeout(
        loadRemoteModule({
          remoteName: 'sleep',
          exposedModule: './Analysis',
        }).then((m: { SleepAnalysis: Type<unknown> }) => m.SleepAnalysis),
      );
      if (this.destroyed) return;
      this.sleepCard = card;
      this.cardStatus.sleep = 'ready';
    } catch (error) {
      if (this.destroyed) return;
      if (!force) {
        await this.delay(CARD_RETRY_DELAY_MS);
        if (this.destroyed) return;
        return this.loadSleepCard(true);
      }
      this.cardStatus.sleep = 'error';
      this.cardError.sleep = 'Card is unavailable right now.';
      console.warn('Sleep card not available yet', error);
    }
  }

  private async loadGlucoseCard(force = false): Promise<void> {
    this.cardStatus.glucose = 'loading';
    this.cardError.glucose = '';
    try {
      const card = await this.loadCardWithTimeout(
        loadRemoteModule({
          remoteName: 'glucose',
          exposedModule: './Card',
        }).then((m: { GlucoseCard: Type<unknown> }) => m.GlucoseCard),
      );
      if (this.destroyed) return;
      this.glucoseCard = card;
      this.cardStatus.glucose = 'ready';
    } catch (error) {
      if (this.destroyed) return;
      if (!force) {
        await this.delay(CARD_RETRY_DELAY_MS);
        if (this.destroyed) return;
        return this.loadGlucoseCard(true);
      }
      this.cardStatus.glucose = 'error';
      this.cardError.glucose = 'Card is unavailable right now.';
      console.warn('Glucose card not available yet', error);
    }
  }

  private async loadCholesterolCard(force = false): Promise<void> {
    this.cardStatus.cholesterol = 'loading';
    this.cardError.cholesterol = '';
    try {
      this.refreshCholesterolData();
      if (this.destroyed) return;
      this.cardStatus.cholesterol = 'ready';
    } catch (error) {
      if (this.destroyed) return;
      if (!force) {
        await this.delay(CARD_RETRY_DELAY_MS);
        if (this.destroyed) return;
        return this.loadCholesterolCard(true);
      }
      this.cardStatus.cholesterol = 'error';
      this.cardError.cholesterol = 'Card is unavailable right now.';
      console.warn('Cholesterol card not available yet', error);
    }
  }

  cholesterolStatus(metric: 'total' | 'ldl' | 'hdl' | 'triglycerides'): 'Good' | 'Bad' | 'No data' {
    const reading = this.latestCholesterol;
    if (!reading) return 'No data';
    if (metric === 'total') return (reading.total ?? 9999) < 200 ? 'Good' : 'Bad';
    if (metric === 'ldl') return (reading.ldl ?? 9999) < 100 ? 'Good' : 'Bad';
    if (metric === 'hdl') return (reading.hdl ?? 0) >= 60 ? 'Good' : 'Bad';
    return (reading.triglycerides ?? 9999) < 150 ? 'Good' : 'Bad';
  }

  formatCardDate(date?: string): string {
    if (!date) return 'No date';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'No date';
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private refreshCholesterolData(): void {
    try {
      const raw = localStorage.getItem('cholesterolData');
      if (!raw) {
        this.latestCholesterol = null;
        return;
      }
      const parsed = JSON.parse(raw) as Array<{
        total?: number;
        ldl?: number;
        hdl?: number;
        triglycerides?: number;
        date?: string;
      }>;
      this.latestCholesterol = parsed.length ? parsed[parsed.length - 1] : null;
    } catch {
      this.latestCholesterol = null;
    }
  }

  private async loadMoodCard(force = false): Promise<void> {
    this.cardStatus.mood = 'loading';
    this.cardError.mood = '';
    try {
      const card = await this.loadCardWithTimeout(
        loadRemoteModule({
          remoteName: 'mood',
          exposedModule: './Card',
        }).then((m: { MoodCard: Type<unknown> }) => m.MoodCard),
      );
      if (this.destroyed) return;
      this.moodCard = card;
      this.cardStatus.mood = 'ready';
    } catch (error) {
      if (this.destroyed) return;
      if (!force) {
        await this.delay(CARD_RETRY_DELAY_MS);
        if (this.destroyed) return;
        return this.loadMoodCard(true);
      }
      this.cardStatus.mood = 'error';
      this.cardError.mood = 'Card is unavailable right now.';
      console.warn('Mood card not available yet', error);
    }
  }

  private async loadHeartRateCard(force = false): Promise<void> {
    this.cardStatus.heartRate = 'loading';
    this.cardError.heartRate = '';
    try {
      const card = await this.loadCardWithTimeout(
        loadRemoteModule({
          remoteName: 'heartRate',
          exposedModule: './Card',
        }).then((m: { HeartRateCard: Type<unknown> }) => m.HeartRateCard),
      );
      if (this.destroyed) return;
      this.heartRateCard = card;
      this.cardStatus.heartRate = 'ready';
    } catch (error) {
      if (this.destroyed) return;
      if (!force) {
        await this.delay(CARD_RETRY_DELAY_MS);
        if (this.destroyed) return;
        return this.loadHeartRateCard(true);
      }
      this.cardStatus.heartRate = 'error';
      this.cardError.heartRate = 'Card is unavailable right now.';
      console.warn('Heart rate card not available yet', error);
    }
  }

  private loadCardWithTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timed out loading remote card')), CARD_TIMEOUT_MS),
      ),
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
