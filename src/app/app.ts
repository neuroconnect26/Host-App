import { Component, signal } from '@angular/core';
import { Navbar } from './navbar/navbar';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('host-app');
}
