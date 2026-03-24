import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Admin access is granted when Firestore has a document at `admins/{uid}`.
 * Create it once in Firebase Console (Firestore → admins → document ID = User UID).
 * Passwords live only in Firebase Authentication, not in Firestore.
 */
export async function isFirestoreAdmin(uid) {
  if (!uid || !db) return false
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists()
}
