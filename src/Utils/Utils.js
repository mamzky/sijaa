import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { LOG_COLLECTION } from './DataUtils';
import moment from 'moment';

const logRef = collection(db, LOG_COLLECTION)

export const addLog = async (title, msg) => {
    await addDoc(logRef, {title, msg, date: moment().format('DD/MMM/YYYY hh:mm')})
}

export function calculateTotal(items) {
    return items?.reduce((total, item) => {
        const itemPrice = parseFloat(item?.price?.replace(',', '.')); // assuming price is a string
        const itemQty = parseInt(item?.qty, 10);
        const itemDiscount = parseFloat(item?.discount);
        const totalPriceBeforeDiscount = itemPrice * itemQty ;
        const totalPriceAfterDiscount = totalPriceBeforeDiscount - itemDiscount
        return total + totalPriceAfterDiscount;
    }, 0);
}

export const getDocument = async (collectionName, id) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : console.log("No such document!");
}