import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, query, updateDoc } from 'firebase/firestore'

const isInDevelopment = true

export const PRODUCT_COLLECTION = isInDevelopment ? "DEV_product" : "product"
export const LOG_COLLECTION = isInDevelopment ? "DEV_log" : "log"