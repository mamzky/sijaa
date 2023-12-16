import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { LOG_COLLECTION } from './DataUtils';
import moment from 'moment';

const logRef = collection(db, LOG_COLLECTION)

export const addLog = async (title, msg) => {
    await addDoc(logRef, {title, msg, date: moment().format('DD/MMM/YYYY hh:mm')})
}