import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from '@angular/fire/auth';

export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);

  register(user: User) {
    return createUserWithEmailAndPassword(
      this._auth,
      user.email,
      user.password
    );
  }

  login(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password);
  }

  loginGoogle() {
    return signInWithPopup(this._auth, new GoogleAuthProvider());
  }

  // Método para obtener el usuario actual
  getCurrentUser(): FirebaseUser | null {
    return this._auth.currentUser;
  }

  // Método para cerrar sesión
  logout() {
    return this._auth.signOut();
  }
}
