import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // 1. Add this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // 2. Add RouterModule here
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'my-app';
}