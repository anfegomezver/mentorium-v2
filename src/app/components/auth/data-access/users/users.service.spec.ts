import { TestBed } from '@angular/core/testing';
import { UsersService, UserCreate, AuthProvider } from './users.service';
import { Firestore } from '@angular/fire/firestore';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: Firestore, useValue: {} },
      ],
    });
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
