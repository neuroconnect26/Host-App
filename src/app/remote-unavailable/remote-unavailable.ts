import { Component } from '@angular/core';

@Component({
  selector: 'app-remote-unavailable',
  standalone: true,
  template: `
    <section style="padding: 1.5rem">
      <h2 style="margin: 0 0 0.5rem">Module unavailable</h2>
      <p style="margin: 0; color: #64748b">
        This remote module is not reachable right now. Please try again later.
      </p>
    </section>
  `,
})
export class RemoteUnavailable {}
