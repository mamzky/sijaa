import moment from 'moment';
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, query, where, updateDoc } from 'firebase/firestore'
import Constant from './Constants';

const isInDevelopment = false

export const PRODUCT_COLLECTION = isInDevelopment ? "DEV_product" : "product"
export const CUSTOMER_COLLECTION = isInDevelopment ? "DEV_customer" : "customer"
export const SALES = isInDevelopment ? "DEV_sales" : "sales"
export const CONTACT_COLLECTION = isInDevelopment ? "DEV_contact" : "contact"
export const ORDER_COLLECTION = isInDevelopment ? "DEV_order" : "order"
export const EMPLOYEE_COLLECTION = isInDevelopment ? "DEV_employee" : "employee"
export const LOG_COLLECTION = isInDevelopment ? "DEV_log" : "log"
export const USER_COLLECTION = isInDevelopment ? "DEV_user" : "user"

export const updateStock = async (id, qty, orderNumber, opr) => {
    try {
        const q = query(collection(db, PRODUCT_COLLECTION)
            , where('id', '==', id))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
        const holder = {
            ...result,
            qty: opr === 'ADD' ? result?.qty + qty : result?.qty - qty,
            updated_at: moment().format('DD/MMM/YYYY HH:mm'),
            updated_by: localStorage.getItem(Constant.USERNAME) ?? '-',
            latest_update: `order number ${orderNumber}, ${qty} pcs`
        }
        const oldProductDoc = doc(db, PRODUCT_COLLECTION, id)
        updateDoc(oldProductDoc, holder)
            .then(() => {
                console.log('DONE');
            })
            .catch((err) => {
                console.log('ERR', err);
            })
    } catch (error) {
        console.error("Error updating document:", error);
    }
}

export const extractCustomerCodes = (data) => {
    const customerCodes = new Set();

    data.forEach(item => {
        if (item.sold && Array.isArray(item.sold)) {
            item.sold.forEach(sale => {
                if (sale.customer && sale.customer.customer_code) {
                    customerCodes.add(sale.customer.customer_code);
                }
            });
        }
    });

    return Array.from(customerCodes);
}

export const summarizeOrdersByCustomer = async (orderData, data, db) => {
    const customerSummary = new Map();

    data.forEach(item => {
        if (item.sold && Array.isArray(item.sold)) {
            item.sold.forEach((sale, index) => {
                if (sale.qty === 0) return;

                if (sale.customer && sale.customer.customer_code) {
                    const customerCode = sale.customer.customer_code;

                    if (!customerSummary.has(customerCode)) {
                        customerSummary.set(customerCode, {
                            customer: null,
                            customer_id: customerCode,
                            order_list: [],
                            order_number: `JAA${moment().format('DDMMYYYYhhmm')}${index}`,
                            order_date: new Date().toISOString(),
                            po_number: '-',
                            notes: `SALES CANVASER ${moment().format('DD MMM YYYY')} oleh ${orderData?.pic}`,
                            type: 'Sales Canvaser',
                            dp: 0,
                            pic: orderData?.pic,
                            total_bill: 0,
                            status: 'DELIVERED',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            created_by: localStorage.getItem(Constant.USERNAME),
                        });
                    }

                    const summary = customerSummary.get(customerCode);
                    summary.order_list.push({
                        discount: 0,
                        name: item.name,
                        qty: sale.qty || 0,
                        price: item.price,
                        id: item?.id,
                        uom: item?.uom ?? '-'
                    });
                    summary.pic = orderData?.pic
                    summary.total_bill = summary.order_list.reduce((total, item) => total + (parseInt(item.price) * item.qty), 0)
                }
            });
        }
    });

    const uniqueCustomerCodes = Array.from(customerSummary.keys());

    const customerDataPromises = uniqueCustomerCodes.map(async (customer_code) => {
        const q = query(collection(db, CUSTOMER_COLLECTION), where("customer_code", "==", customer_code));
        const querySnapshot = await getDocs(q);
        const result = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
        return { customer_code, customer_data: result || null };
    });

    const customerDataResults = await Promise.all(customerDataPromises);
    customerDataResults.forEach(({ customer_code, customer_data }) => {
        if (customerSummary.has(customer_code)) {
            customerSummary.get(customer_code).customer = customer_data;
        }
    });

    return Array.from(customerSummary.values());
};

export const calculateRemainingQty = (originalData, soldData) => {
    return originalData.map(item => {
        const soldItem = soldData.find(s => s.id === item.id);
        const soldQty = soldItem ? soldItem.sold : 0;
        const remainingQty = Math.max(parseInt(item.qty) - soldQty, 0);

        return {
            id: item.id,
            remaining_qty: remainingQty
        };
    });
};