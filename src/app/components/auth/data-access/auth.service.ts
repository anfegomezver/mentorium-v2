import { inject, Injectable } from "@angular/core"
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from "@angular/fire/auth"
import { FacebookAuthProvider, GithubAuthProvider, type UserCredential } from "@angular/fire/auth"

export interface User {
  email: string
  password: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _auth = inject(Auth)

  register(user: User) {
    return createUserWithEmailAndPassword(this._auth, user.email, user.password)
  }

  login(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password)
  }

  async loginGoogle(): Promise<UserCredential> {
    const googleProvider = new GoogleAuthProvider()
    return await signInWithPopup(this._auth, googleProvider)
  }

  async loginFacebook(): Promise<UserCredential> {
    const facebookProvider = new FacebookAuthProvider()
    return await signInWithPopup(this._auth, facebookProvider)
  }

  async loginGitHub(): Promise<UserCredential> {
    const githubProvider = new GithubAuthProvider()
    return await signInWithPopup(this._auth, githubProvider)
  }

  getCurrentUser(): FirebaseUser | null {
    return this._auth.currentUser
  }

  logout() {
    return this._auth.signOut()
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this._auth, email)
  }
}
