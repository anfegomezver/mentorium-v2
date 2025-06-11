import { inject, Injectable } from "@angular/core";
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
  Timestamp,
} from "@angular/fire/firestore";

export interface Access {
  uid: string;
  email: string;
  displayName?: string | null;
  method: string;
  encryptedPassword?: string | null;
  loginAt: Timestamp | null;
  logoutAt: Timestamp | null;
}

@Injectable({
  providedIn: "root",
})
export class AccessService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, "access");

  async registerLogin({
    uid,
    email,
    displayName,
    method,
    encryptedPassword,
  }: {
    uid: string;
    email: string;
    displayName?: string;
    method: string;
    encryptedPassword?: string;
  }): Promise<string> {
    const docRef = await addDoc(this._collection, {
      uid,
      email,
      displayName: displayName || null,
      method,
      encryptedPassword: encryptedPassword || null,
      loginAt: serverTimestamp(),
      logoutAt: null,
    });

    return docRef.id;
  }

  async registerLogout(docId: string): Promise<void> {
    const accessRef = doc(this._firestore, "access", docId);
    await updateDoc(accessRef, {
      logoutAt: serverTimestamp(),
    });
  }
  
}