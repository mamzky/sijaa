import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, query, updateDoc } from 'firebase/firestore'

const isInDevelopment = false

export const PRODUCT_COLLECTION = isInDevelopment ? "DEV_product" : "product"
export const CUSTOMER_COLLECTION = isInDevelopment ? "DEV_customer" : "customer"
export const LOG_COLLECTION = isInDevelopment ? "DEV_log" : "log"