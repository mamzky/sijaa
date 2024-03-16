import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { LOG_COLLECTION } from './DataUtils';
import moment from 'moment';

const logRef = collection(db, LOG_COLLECTION)

export const addLog = async (title, msg) => {
    await addDoc(logRef, {title, msg, date: moment().format('DD/MMM/YYYY hh:mm')})
}

export function calculateTotal(items) {
    return items.reduce((total, item) => {
        const itemPrice = parseFloat(item.price.replace(',', '.')); // assuming price is a string
        const itemQty = parseInt(item.qty, 10);
        const itemDiscount = parseFloat(item.disc);
        const totalPriceBeforeDiscount = itemPrice * itemQty ;
        const totalPriceAfterDiscount = totalPriceBeforeDiscount * (1 - itemDiscount / 100);
        return total + totalPriceAfterDiscount;
    }, 0);
}