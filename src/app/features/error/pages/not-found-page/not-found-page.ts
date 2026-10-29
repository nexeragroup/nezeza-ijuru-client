import { Component, inject, RESPONSE_INIT } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  standalone: false,
  styleUrl: './not-found-page.css',
  templateUrl: './not-found-page.html',
})
export class NotFoundPage {
  private readonly responseInit = inject(RESPONSE_INIT);

  constructor() {
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
  }
}
