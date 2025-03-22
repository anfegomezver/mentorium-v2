import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';

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

    //.setCustomParameters({ prompt: 'select_account' })   Forzar a seleccionar cuenta

    return signInWithPopup(this._auth, new GoogleAuthProvider());
  }
}
