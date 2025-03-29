import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string; // Añadimos email para poder buscar por él
}

export type UserCreate = Omit<User, 'id'>;

const PATH = 'users';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);

  // Crear usuario con UID específico
  createWithUID(user: UserCreate, uid: string) {
    const userRef = doc(this._firestore, PATH, uid);
    return setDoc(userRef, user);
  }

  // Recuperar usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(this._collection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      return null;
    }
  }
}
