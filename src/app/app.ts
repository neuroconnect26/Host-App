import { Component } from '@angular/core';
import { HeartComponent } from './heart/heart';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [HeartComponent],
//   template: ./app.css,
// })
  
@Component({
  selector: 'app-root',
  imports: [HeartComponent],
  standalone: true,
 templateUrl: './app.html',
  styleUrl: './app.css'
})
  
export class App {
}
