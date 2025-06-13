import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from '@angular/fire/auth';
import { FacebookAuthProvider, GithubAuthProvider } from '@angular/fire/auth';
import { AccessService } from '../access/access.service';
import { sha256 } from 'js-sha256';
import { updateProfile } from '@angular/fire/auth';

export interface User {
  email: string;
  password: string;
}

export interface RegisterOptions {
  displayName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _accessService = inject(AccessService);
  private _accessDocId: string | null = null;

  async register(user: User, options?: RegisterOptions) {
    const credential = await createUserWithEmailAndPassword(
      this._auth,
      user.email,
      user.password
    );

    if (options?.displayName && credential.user) {
      await updateProfile(credential.user, {
        displayName: options.displayName,
      });
    }

    const hashed = sha256(user.password);

    this._accessDocId = await this._accessService.registerLogin({
      uidUser: credential.user.uid,
      email: credential.user.email!,
      displayName:
        options?.displayName ?? credential.user.displayName ?? undefined,
      method: 'email',
      encryptedPassword: hashed,
    });

    localStorage.setItem('docId', this._accessDocId);
    return credential;
  }

  async login(user: User) {
    const credential = await signInWithEmailAndPassword(
      this._auth,
      user.email,
      user.password
    );

    const hashed = sha256(user.password);

    this._accessDocId = await this._accessService.registerLogin({
      uidUser: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: 'email',
      encryptedPassword: hashed,
    });

    localStorage.setItem('docId', this._accessDocId);
    return credential;
  }

  async loginGoogle(): Promise<UserCredential> {
    const googleProvider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this._auth, googleProvider);

    this._accessDocId = await this._accessService.registerLogin({
      uidUser: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: 'google',
    });

    localStorage.setItem('docId', this._accessDocId);
    return credential;
  }

  async loginFacebook(): Promise<UserCredential> {
    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email');
    facebookProvider.addScope('public_profile');

    const credential = await signInWithPopup(this._auth, facebookProvider);

    this._accessDocId = await this._accessService.registerLogin({
      uidUser: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: 'facebook',
    });

    localStorage.setItem('docId', this._accessDocId);
    return credential;
  }

  async loginGitHub(): Promise<UserCredential> {
    const githubProvider = new GithubAuthProvider();
    const credential = await signInWithPopup(this._auth, githubProvider);

    this._accessDocId = await this._accessService.registerLogin({
      uidUser: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: 'github',
    });

    localStorage.setItem('docId', this._accessDocId);
    return credential;
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this._auth, email);
  }
}
