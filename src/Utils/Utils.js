import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { LOG_COLLECTION } from './DataUtils';

const logRef = collection(db, LOG_COLLECTION)

export const addLog = async (title, msg) => {
    await addDoc(logRef, {title, msg})
}