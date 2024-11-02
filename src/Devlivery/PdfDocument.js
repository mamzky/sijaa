import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import moment from 'moment';
import 'moment/locale/id'
import { DigitFormatter } from '../Utils/General';
import IMGJAA from '../Utils/imageJaaBase64'
import Constant from '../Utils/Constants';



// Style PDF
const styles = StyleSheet.create({
    page: {
        paddingVertical: 20,
        paddingHorizontal: 40,
        fontSize: 12,
    },
    section: {
        marginBottom: 10,
    },
    header: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#bfbfbf',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableColHeaderNumber: {
        width: "5%",
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: '#f2f2f2',
        padding: 2,
    },
    tableColHeader: {
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: '#f2f2f2',
        padding: 2,
    },
    tableColHeaderCenter: {
        borderStyle: "solid",
        borderLeft: 1,
        backgroundColor: '#f2f2f2',
        padding: 2,
    },
    tableColHeaderTop: {
        borderStyle: "solid",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        backgroundColor: '#f2f2f2',
        padding: 2,
    },
    tableColHeaderBottom: {
        borderStyle: "solid",
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        backgroundColor: '#f2f2f2',
        padding: 2,
    },
    tableColNumber: {
        width: "10%",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 5,
    },
    tableCol: {
        width: "33.33%",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 5,
    },
    tableColTotal: {
        width: "77.66%",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 5,
    },
    tableColTotalAmount: {
        width: "33.33%",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 5,
    },
    tableCell: {
        margin: "auto",
        fontSize: 10,
    },
    signature: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    signatureBox: {
        width: "30%",
        textAlign: "center",
        paddingTop: 5,
    },
});
moment.locale('id')

const PdfDocument = ({ order, type }) => {
    moment.locale('id')

    const itemPerPage = 5
    const [data, setData] = useState(null)
    const [jaaImg, setJaaImg] = useState('')
    const [docType, setDocType] = useState('')
    const [totalQty, setTotalQty] = useState(0)
    const [totalPage, setTotalPage] = useState(1)
    const [paginatedOrder, setPaginatedOrder] = useState([])
    const [grandTotal, setGrandTotal] = useState(0)
    const taxRate = 0.11;



    useEffect(() => {
        setData(order)
        setDocType(type)
        if (order?.order_list) {
            const tempTotal = order?.order_list.reduce((sum, item) => sum + parseInt(item.qty), 0);
            setTotalQty(tempTotal)
            setTotalPage(Math.ceil(order?.order_list?.length / itemPerPage))

            const itemsOnFirstPage = 5;
            const itemsPerPage = 7;
            const itemsOnLastPageMax = 5;

            const paginatedOrderList = [];

            paginatedOrderList.push(order.order_list.slice(0, itemsOnFirstPage));

            let start = itemsOnFirstPage;
            while (start < order.order_list.length - itemsOnLastPageMax) {
                paginatedOrderList.push(order.order_list.slice(start, start + itemsPerPage));
                start += itemsPerPage;
            }
            paginatedOrderList.push(order.order_list.slice(start, order.order_list.length));
            setPaginatedOrder(paginatedOrderList);
            const totalBill = parseInt(order.total_bill.replace(/\./g, ""), 10);
            setGrandTotal(totalBill + (totalBill * taxRate))
            console.log('ORDER', order);

            console.log('PAGINATED', paginatedOrderList); //DIBUAT PAGINATION PER PAGE

        }
    }, [order, type])

    const footer = () => {
        return (
            <View style={styles.signature}>
                <View style={styles.signatureBox}>
                    <Text style={{ width: '100%' }}>Received by,</Text>
                    <Text style={{ borderBottom: 1, borderBottomColor: 'black', marginTop: 32 }}>{``}</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={{ width: '100%' }}>CV. JAA Alkesum</Text>
                    <Text style={{ borderBottom: 1, borderBottomColor: 'black', marginTop: 32 }}>{``}</Text>
                </View>
            </View>
        )
    }

    const Invoice = <Document>
        <Page size="A5" orientation='landscape' style={styles.page}>
            {/* Company Information */}
            <View style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '10%', marginRight: 20 }}>
                    <Image style={{ height: 50, width: 50 }} src={{ uri: IMGJAA, method: "GET", headers: { "Cache-Control": "no-cache" }, body: "" }} />
                </div>
                <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 14, width: '100%', textAlign: 'left' }}>{`CV. JAA ALKESUM`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Rehabilitation & General Hospital Equipment`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Bantar Jati, Setu, Cipayung, Jakarta Timur`}</Text>
                </div>
                <div style={{ width: '50%' }}>
                    <Text style={{ textAlign: 'right', fontWeight: 'extrabold', fontSize: 22 }}>
                        INVOICE
                    </Text>
                </div>
            </View>
            <div style={{ width: '100%', borderBottomWidth: 2, borderBottomColor: 'black', marginTop: 8, marginBottom: 8 }}></div>
            <View style={styles.section}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Invoice Date</Text>
                            <Text style={{ width: '50%' }}>: {moment(order?.created_at).format('DD/MM/YYYY')}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Invoice No.</Text>
                            <Text style={{ width: '50%' }}>: {order?.order_number}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>PO No.</Text>
                            <Text style={{ width: '50%' }}>: {order?.po_number}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Due Date</Text>
                            <Text style={{ width: '50%' }}>: {moment(order?.created_at).add('days', 30).format('DD/MM/YYYY')}</Text>
                        </div>
                    </div>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Customer</Text>
                            <Text style={{ width: '50%' }}>: {order?.customer?.name}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Address</Text>
                            <Text style={{ width: '50%' }}>: {order?.customer?.address}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Contact Person</Text>
                            <Text style={{ width: '50%' }}>: {order?.customer?.contact_person}</Text>
                        </div>
                    </div>
                </div>
            </View>

            {/* Table Header */}
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeaderNumber}>
                        <Text style={{ fontSize: 8, textAlign: 'center', paddingVertical:4 }}>No</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '25%' }]}>
                        <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical:4, fontWeight: 'extrabold' }}>Description</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '7%' }]}>
                        <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical:4, fontWeight: 'extrabold' }}>Qty</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '15%' }]}>
                        <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical:4, fontWeight: 'extrabold' }}>UoM</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '20%' }]}>
                        <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical:4, fontWeight: 'extrabold' }}>Unit Price</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '10%' }]}>
                        <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical:4, fontWeight: 'extrabold' }}>Disc</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical:4, fontWeight: 'extrabold' }}>Amount(IDR)</Text>
                    </View>
                </View>

                {order?.order_list?.map((item, index) => (
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeaderNumber}>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{index + 1}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '25%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'left' }}>{item?.name}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '7%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{item?.qty}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '15%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{'-'}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '20%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{DigitFormatter(Number(item?.price / item?.qty))}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '10%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{item?.disc}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '23%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'right' }}>{DigitFormatter(item?.price)}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.tableRow}>
                    <View style={[styles.tableColHeaderTop, { width: '52%' }]}>
                        <Text style={{ fontSize: 8 }}>Bank Account</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '30%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>Sub Total</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'right' }}>{order?.total_bill}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableColHeaderCenter, { width: '52%' }]}>
                        <Text style={{ fontSize: 8 }}>BCA: 685 022 0041 A/N. Uyet Nurhidayat</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '30%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>Tax</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'right' }}>{DigitFormatter(Number(order?.total_bill.replaceAll('.', '') * 0.11).toFixed(0))}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableColHeaderBottom, { width: '52%' }]}>
                        <Text style={{ fontSize: 8 }}>Mandiri: 123 000 4354 017 A/N. Uyet Nurhidayat</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '30%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'center' }}>Grand Total</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'right' }}>{DigitFormatter(Number(order?.total_bill.replaceAll('.', '') * 1.11).toFixed(0))}</Text>
                    </View>
                </View>
            </View>
            {footer()}
        </Page>
    </Document>

    const DeliveryNote = <Document>
        <Page size="A5" orientation='landscape' style={styles.page}>
            <View style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '10%', marginRight: 20 }}>
                    <Image style={{ height: 50, width: 50 }} src={{ uri: IMGJAA, method: "GET", headers: { "Cache-Control": "no-cache" }, body: "" }} />
                </div>
                <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 14, width: '100%', textAlign: 'left' }}>{`CV. JAA ALKESUM`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Rehabilitation & General Hospital Equipment`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Bantar Jati, Setu, Cipayung, Jakarta Timur`}</Text>
                </div>
                <div style={{ width: '50%' }}>
                    <Text style={{ textAlign: 'right', fontWeight: 'extrabold', fontSize: 22 }}>
                        DELIVERY NOTES
                    </Text>
                </div>
            </View>
            <div style={{ width: '100%', borderBottomWidth: 2, borderBottomColor: 'black', marginTop: 8, marginBottom: 8 }}></div>
            <View style={styles.section}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Nomor</Text>
                            <Text style={{ width: '50%' }}>: {order?.order_number}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Date</Text>
                            <Text style={{ width: '50%' }}>: {moment().format('DD/MM/YYYY')}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}>Reff PO</Text>
                            <Text style={{ width: '50%' }}>: {order?.po_number}</Text>
                        </div>
                    </div>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%', textAlign: 'right' }}>To</Text>
                            <Text style={{ width: '50%' }}>: {order?.customer?.name}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}></Text>
                            <Text style={{ width: '50%' }}> {order?.customer?.address}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '40%' }}></Text>
                            <Text style={{ width: '50%' }}>{` UP: ${order?.customer?.contact_person}`}</Text>
                        </div>
                    </div>
                </div>
            </View>

            {/* Table Header */}
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeaderNumber}>
                        <Text style={{ fontSize: 10, paddingVertical: 4, fontWeight: 'extrabold', textAlign: 'center' }}>No</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '35%' }]}>
                        <Text style={{ fontSize: 10, paddingVertical: 4, fontWeight: 'extrabold', textAlign: 'center' }}>Description</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '15%' }]}>
                        <Text style={{ fontSize: 10, paddingVertical: 4, fontWeight: 'extrabold', textAlign: 'center' }}>Size</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '7%' }]}>
                        <Text style={{ fontSize: 10, paddingVertical: 4, fontWeight: 'extrabold', textAlign: 'center' }}>Qty</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 10, paddingVertical: 4, fontWeight: 'extrabold', textAlign: 'center' }}>Amount(IDR)</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 10, paddingVertical: 4, fontWeight: 'extrabold', textAlign: 'center' }}>Total</Text>
                    </View>
                </View>

                {order?.order_list?.map((item, index) => (
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeaderNumber}>
                            <Text style={{ fontSize: 8 }}>{index + 1}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '35%' }]}>
                            <Text style={{ fontSize: 8 }}>{item?.name}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '15%' }]}>
                            <Text style={{ fontSize: 8 }}>{item?.size ?? '-'}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '7%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{item?.qty}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '23%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'right' }}>{DigitFormatter(Number(item?.price))}</Text>
                        </View>
                        <View style={[styles.tableColHeader, { width: '23%' }]}>
                            <Text style={{ fontSize: 8, textAlign: 'right' }}>{DigitFormatter(Number(item?.price * item?.qty))}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.tableRow}>
                    <View style={[styles.tableColHeader, { width: '55%' }]}>
                        <Text style={{ fontSize: 8 }}>Total</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '7%' }]}>
                        <Text style={{ fontSize: 8, textAlign:'center' }}>{totalQty ?? '-'}</Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text></Text>
                    </View>
                    <View style={[styles.tableColHeader, { width: '23%' }]}>
                        <Text style={{ fontSize: 8, textAlign: 'right' }}>{order?.total_bill}</Text>
                    </View>
                </View>
            </View>
            <View>
                <Text>{`Notes : ${order?.notes}`}</Text>
            </View>
            {footer()}
        </Page>
    </Document>

    return docType === 'INVOICE' ? Invoice : DeliveryNote
}

export default PdfDocument;
