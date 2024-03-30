import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, query, updateDoc } from 'firebase/firestore'

const isInDevelopment = true    

export const PRODUCT_COLLECTION = isInDevelopment ? "DEV_product" : "product"
export const CUSTOMER_COLLECTION = isInDevelopment ? "DEV_customer" : "customer"
export const SALES = isInDevelopment ? "DEV_sales" : "sales"
export const CONTACT_COLLECTION = isInDevelopment ? "DEV_contact" : "contact"
export const TRANSACTION_COLLECTION = isInDevelopment ? "DEV_transaction" : "transaction"
export const LOG_COLLECTION = isInDevelopment ? "DEV_log" : "log"