import React, { useEffect, useState } from "react"
import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore'
import { TRANSACTION_COLLECTION } from "../Utils/DataUtils";
import { useParams } from "react-router-dom";
import LargeImageCard from "../Components/LargeImageCard";
import SmallImageCard from "../Components/SmallImageCard";

function StockCustomer() {

    const [transactionData, setTransactionData] = useState([])
    const { customer_code } = useParams()
    const [isLoading, setIsLoading] = useState(false)
    const [productList, setProductList] = useState([])



    const getStockByTransaction = async () => {

        const q = query(collection(db, TRANSACTION_COLLECTION)
            , where('customer_id', '==', customer_code)
            , where('status', '==', true))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => (doc.data().order_list))
        let productListHolder = []
        if (!querySnapshot.empty) {
            result.map((_) => {
                _.map((item) => {
                    const idx = productListHolder.findIndex((e) => e.id === item?.id)
                    if (idx < 0) {
                        productListHolder.push(item)
                    } else {
                        productListHolder[idx].qty = parseInt(productListHolder[idx].qty) + item.qty
                    }
                })
            })
            console.log(productListHolder)
            setProductList(productListHolder)
            setIsLoading(false)
        } else {
            setProductList([])
            setIsLoading(false)
            console.log('FAILED');
        }
    }

    useEffect(() => {
        getStockByTransaction()
    }, [])

    return (
        <div>
            <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>Stock Customer</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        {productList.map((_) => {
                            return (
                                <SmallImageCard title={_.name} subtitle={_.qty}/>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
export default StockCustomer