import { inject, Injectable } from "@angular/core"
import {
  Firestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "@angular/fire/firestore"

export interface AuthProvider {
  providerId: string
  displayName: string
  providerDisplayName?: string
  linkedAt: Timestamp
}

export interface User {
  id: string
  username: string
  name: string
  email: string
  providers?: AuthProvider[]
}

export type UserCreate = Omit<User, "id">

const PATH = "users"

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private _firestore = inject(Firestore)
  private _collection = collection(this._firestore, PATH)

  async createWithUID(user: UserCreate, uid: string, provider?: AuthProvider) {
    const userRef = doc(this._firestore, PATH, uid)

    const userData = {
      ...user,
      providers: provider ? [provider] : [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    return setDoc(userRef, userData)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(this._collection, where("email", "==", email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]
        return { id: docSnap.id, ...docSnap.data() } as User
      }

      return null
    } catch (error) {
      return null
    }
  }

  async getUserByUID(uid: string): Promise<User | null> {
    try {
      const userRef = doc(this._firestore, PATH, uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User
      }

      return null
    } catch (error) {
      return null
    }
  }

  async addProviderToUser(uid: string, provider: AuthProvider) {
    const userRef = doc(this._firestore, PATH, uid)

    await updateDoc(userRef, {
      providers: arrayUnion(provider),
      updatedAt: Timestamp.now(),
    })
  }

  async isProviderLinked(uid: string, providerId: string): Promise<boolean> {
    try {
      const user = await this.getUserByUID(uid)
      return user?.providers?.some((provider) => provider.providerId === providerId) ?? false
    } catch (error) {
      return false
    }
  }
}
