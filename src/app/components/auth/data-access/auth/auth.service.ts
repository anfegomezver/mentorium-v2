import { inject, Injectable } from "@angular/core"
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
  type UserCredential
} from "@angular/fire/auth"
import { FacebookAuthProvider, GithubAuthProvider } from "@angular/fire/auth"
import { AccessService } from "../access/access.service"
import { sha256 } from "js-sha256"

export interface User {
  email: string
  password: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _auth = inject(Auth)
  private _accessService = inject(AccessService)

  private _accessDocId: string | null = null

  async register(user: User) {
    const credential = await createUserWithEmailAndPassword(this._auth, user.email, user.password)
    const hashed = sha256(user.password)

    this._accessDocId = await this._accessService.registerLogin({
      uid: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: "email",
      encryptedPassword: hashed,
    })

    return credential
  }

  async login(user: User) {
    const credential = await signInWithEmailAndPassword(this._auth, user.email, user.password)
    const hashed = sha256(user.password)

    this._accessDocId = await this._accessService.registerLogin({
      uid: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: "email",
      encryptedPassword: hashed,
    })

    return credential
  }

  async loginGoogle(): Promise<UserCredential> {
    const googleProvider = new GoogleAuthProvider()
    const credential = await signInWithPopup(this._auth, googleProvider)

    this._accessDocId = await this._accessService.registerLogin({
      uid: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: "google",
    })

    return credential
  }

  async loginFacebook(): Promise<UserCredential> {
    const facebookProvider = new FacebookAuthProvider()
    facebookProvider.addScope("email")
    facebookProvider.addScope("public_profile")

    const credential = await signInWithPopup(this._auth, facebookProvider)

    this._accessDocId = await this._accessService.registerLogin({
      uid: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: "facebook",
    })

    return credential
  }

  async loginGitHub(): Promise<UserCredential> {
    const githubProvider = new GithubAuthProvider()
    const credential = await signInWithPopup(this._auth, githubProvider)

    this._accessDocId = await this._accessService.registerLogin({
      uid: credential.user.uid,
      email: credential.user.email!,
      displayName: credential.user.displayName ?? undefined,
      method: "github",
    })

    return credential
  }

  async logout() {
    if (this._accessDocId) {
      await this._accessService.registerLogout(this._accessDocId)
      this._accessDocId = null
    }

    return signOut(this._auth)
  }

  getCurrentUser(): FirebaseUser | null {
    return this._auth.currentUser
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this._auth, email)
  }
}
