import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RESPONSE_INIT } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  let fixture: ComponentFixture<NotFoundPage>;

  it('sets a 404 response status during server rendering', async () => {
    const responseInit: ResponseInit = {};

    await TestBed.configureTestingModule({
      declarations: [NotFoundPage],
      imports: [RouterTestingModule],
      providers: [{ provide: RESPONSE_INIT, useValue: responseInit }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundPage);

    expect(fixture.componentInstance).toBeTruthy();
    expect(responseInit.status).toBe(404);
  });
});
