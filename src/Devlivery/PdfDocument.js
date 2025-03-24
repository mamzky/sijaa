import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import moment from 'moment';
import 'moment/locale/id'
import { DigitFormatter } from '../Utils/General';
import IMGJAA from '../Utils/imageJaaBase64'



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
    const [data, setData] = useState(null)
    const [docType, setDocType] = useState('')
    const [totalQty, setTotalQty] = useState(0)

    useEffect(() => {
        setData(order)
        setDocType(type)
    }, [order, type])

    const chunkArray = (arr, size) => {
        return arr.reduce((acc, _, i) =>
            (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc), []
        );
    };
    const itemsPerPage = 4;
    const groupedOrders = chunkArray(order?.order_list || [], itemsPerPage);

    const footer = () => {
        return (
            <View style={styles.signature}>
                <View style={styles.signatureBox}>
                    <Text style={{ width: '100%' }}>Received by,</Text>
                    <Text style={{ borderBottom: 1, borderBottomColor: 'black', marginTop: 64 }}>{``}</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={{ width: '100%' }}>PT. Kreasi Nurwidhi Grup</Text>
                    <Text style={{ borderBottom: 1, borderBottomColor: 'black', marginTop: 64 }}>{``}</Text>
                </View>
            </View>
        )
    }

    const invoicePageHeader = () => {
        return (
            <View style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '25%', marginRight: 20 }}>
                    <Image style={{ height: 50, width: 100 }} src={IMGJAA} />
                </div>
                <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 14, width: '100%', textAlign: 'left' }}>{`PT. Kreasi Nurwidhi Grup`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Rehabilitation & General Hospital Equipment`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Bantar Jati, Setu, Cipayung, Jakarta Timur`}</Text>
                </div>
                <div style={{ width: '50%' }}>
                    <Text style={{ textAlign: 'right', fontWeight: 'extrabold', fontSize: 22 }}>
                        INVOICE
                    </Text>
                </div>
            </View>
        )
    }
    const invoiceTableHeader = () => {
        return (
            <View style={styles.tableRow}>
                <View style={styles.tableColHeaderNumber}>
                    <Text style={{ fontSize: 8, textAlign: 'center', paddingVertical: 4 }}>No</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '25%' }]}>
                    <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical: 4, fontWeight: 'extrabold' }}>Description</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '7%' }]}>
                    <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical: 4, fontWeight: 'extrabold' }}>Qty</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '15%' }]}>
                    <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical: 4, fontWeight: 'extrabold' }}>UoM</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '20%' }]}>
                    <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical: 4, fontWeight: 'extrabold' }}>Unit Price</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '10%' }]}>
                    <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical: 4, fontWeight: 'extrabold' }}>Disc</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '23%' }]}>
                    <Text style={{ fontSize: 10, textAlign: 'center', paddingVertical: 4, fontWeight: 'extrabold' }}>Amount(IDR)</Text>
                </View>
            </View>
        )
    }
    const invoiceOrderInformation = () => {
        return (
            <View style={styles.section}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '45%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%' }}>Invoice Date</Text>
                            <Text style={{ width: '60%' }}>: {moment(order?.created_at).format('DD/MM/YYYY')}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%', fontSize: 11 }}>Invoice No.</Text>
                            <Text style={{ width: '60%', fontSize: 11 }}>: {order?.order_number}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%', fontSize: 11 }}>PO No.</Text>
                            <Text style={{ width: '60%', fontSize: 11 }}>: {order?.po_number}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%', fontSize: 11 }}>Due Date</Text>
                            <Text style={{ width: '60%', fontSize: 12 }}>: {moment(order?.created_at).add('days', 30).format('DD/MM/YYYY')}</Text>
                        </div>
                    </div>
                    <div style={{ width: '55%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%', fontSize: 11 }}>Customer</Text>
                            <Text>{': '}</Text>
                            <Text style={{ width: '80%', fontSize: 11 }}>{order?.customer?.name}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%', fontSize: 11 }}>Address</Text>
                            <Text>{': '}</Text>
                            <Text style={{ width: '60%', fontSize: 11 }}>: {order?.customer?.address}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '30%', fontSize: 11 }}>Contact Person</Text>
                            <Text>{': '}</Text>
                            <Text style={{ width: '80%', fontSize: 11 }}>{order?.customer?.contact_person}</Text>
                        </div>
                    </div>
                </div>
            </View>
        )
    }

    const dnHeader = () => {
        return (
            <View style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '25%', marginRight: 20 }}>
                    <Image style={{ height: 50, width: 100 }} src={IMGJAA} />
                </div>
                <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 14, width: '100%', textAlign: 'left' }}>{`PT. Kreasi Nurwidhi Grup`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Rehabilitation & General Hospital Equipment`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'left' }}>{`Bantar Jati, Setu, Cipayung, Jakarta Timur`}</Text>
                </div>
                <div style={{ width: '50%' }}>
                    <Text style={{ textAlign: 'right', fontWeight: 'extrabold', fontSize: 22 }}>
                        DELIVERY NOTES
                    </Text>
                </div>
            </View>
        )
    }
    const dnInfo = () => {
        return (
            <View style={styles.section}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '60%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '20%', fontSize: 11 }}>Nomor</Text>
                            <Text>{': '}</Text>
                            <Text style={{ width: '70%' }}>{order?.order_number}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '20%', fontSize: 11 }}>Date</Text>
                            <Text style={{ width: '70%', fontSize: 11 }}>: {moment().format('DD/MM/YYYY')}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '20%', fontSize: 11 }}>Reff PO</Text>
                            <Text style={{ width: '70%', fontSize: 11 }}>: {order?.po_number}</Text>
                        </div>
                    </div>
                    <div style={{ width: '60%', display: 'flex', flexDirection: 'col' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '20%', fontSize: 11 }}>To</Text>
                            <Text>{': '}</Text>
                            <Text style={{ width: '70%', fontSize: 11 }}>{order?.customer?.name}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '20%', fontSize: 11 }}></Text>
                            <Text style={{ width: '70%', fontSize: 11 }}> {order?.customer?.address}</Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Text style={{ width: '20%', fontSize: 11 }}>UP</Text>
                            <Text>{': '}</Text>
                            <Text style={{ width: '70%', fontSize: 11 }}>{`${order?.customer?.contact_person ?? ''}`}</Text>
                        </div>
                    </div>
                </div>
            </View>
        )
    }
    const dnTableHeader = () => {
        return (
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
        )
    }

    const Invoice = <Document>
        {groupedOrders.map((group, pageIndex) => (
            <Page key={pageIndex} size="A5" orientation="landscape" style={styles.page}>
                {invoicePageHeader()}
                <View style={{ width: '100%', borderBottomWidth: 2, borderBottomColor: 'black', marginTop: 8, marginBottom: 8 }}></View>
                {pageIndex === 0 && invoiceOrderInformation()}

                <View style={styles.table}>
                    {invoiceTableHeader()}
                    {group.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={styles.tableColHeaderNumber}>
                                <Text style={{ fontSize: 8, textAlign: 'center' }}>
                                    {index + 1 + pageIndex * itemsPerPage}
                                </Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '25%' }]}>
                                <Text style={{ fontSize: 8, textAlign: 'left' }}>{item?.name}</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '7%' }]}>
                                <Text style={{ fontSize: 8, textAlign: 'center' }}>{item?.qty}</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '15%' }]}>
                                <Text style={{ fontSize: 8, textAlign: 'center' }}>{item?.uom ?? '-'}</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '20%' }]}>
                                <Text style={{ fontSize: 8, textAlign: 'center' }}>{DigitFormatter(item?.price)}</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '10%' }]}>
                                <Text style={{ fontSize: 8, textAlign: 'center' }}>{item?.disc}</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '23%' }]}>
                                <Text style={{ fontSize: 8, textAlign: 'right' }}>
                                    {DigitFormatter(Number(item?.price * item?.qty - (item?.disc ?? 0)))}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {pageIndex === groupedOrders.length - 1 && (
                        <>
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
                                    <Text style={{ fontSize: 8 }}>Mandiri: 103 00000 89777 A/N. Kreasi Nurwidhi Grup</Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '30%' }]}>
                                    <Text style={{ fontSize: 8, textAlign: 'center' }}>Tax</Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '23%' }]}>
                                    <Text style={{ fontSize: 8, textAlign: 'right' }}>
                                        {order?.tax ? DigitFormatter(Number(order?.total_bill.replaceAll('.', '') * 0.11).toFixed(0)) : '0'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableColHeaderBottom, { width: '52%' }]}>
                                    <Text style={{ fontSize: 8 }}> </Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '30%' }]}>
                                    <Text style={{ fontSize: 8, textAlign: 'center' }}>Grand Total</Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '23%' }]}>
                                    <Text style={{ fontSize: 8, textAlign: 'right' }}>
                                        {order.withTax ? 
                                     DigitFormatter(Number(order?.total_bill.replaceAll('.', '') * 1.11).toFixed(0))
                                     :
                                     DigitFormatter(Number(order?.total_bill.replaceAll('.', '')).toFixed(0))   
                                    }
                                    </Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>
                {pageIndex === groupedOrders.length - 1 && footer()}
                <Text
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 20,
                        fontSize: 8,
                    }}
                >
                    Halaman {pageIndex + 1} dari {groupedOrders.length}
                </Text>
            </Page>
        ))}
    </Document>

    const DeliveryNote = <Document>
        {groupedOrders.map((group, pageIndex) => (
            <Page key={pageIndex} size="A5" orientation="landscape" style={styles.page}>
                {dnHeader()}
                <View style={{ width: '100%', borderBottomWidth: 2, borderBottomColor: 'black', marginTop: 8, marginBottom: 8 }}></View>

                {/* TAMPILIN ORDER INFO CUMA DI PAGE PERTAMA */}
                {pageIndex === 0 && dnInfo()}

                <View style={styles.table}>
                    {dnTableHeader()}
                    {group.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={styles.tableColHeaderNumber}>
                                <Text style={{ fontSize: 8 }}>{index + 1 + pageIndex * itemsPerPage}</Text>
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
                    {pageIndex === groupedOrders.length - 1 && (
                        <>
                            <View style={styles.tableRow}>
                                <View style={[styles.tableColHeader, { width: '55%' }]}>
                                    <Text style={{ fontSize: 8 }}>Total</Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '7%' }]}>
                                    <Text style={{ fontSize: 8, textAlign: 'center' }}>{totalQty ?? '-'}</Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '23%' }]}>
                                    <Text></Text>
                                </View>
                                <View style={[styles.tableColHeader, { width: '23%' }]}>
                                    <Text style={{ fontSize: 8, textAlign: 'right' }}>{order?.total_bill}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Notes & Footer Hanya di Halaman Terakhir */}
                {pageIndex === groupedOrders.length - 1 && (
                    <>
                        <View>
                            <Text>{`Notes : ${order?.notes}`}</Text>
                        </View>
                        {footer()}
                    </>
                )}

                {/* Pagination di pojokan kanan bawah */}
                <Text
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 20,
                        fontSize: 8,
                    }}
                >
                    Halaman {pageIndex + 1} dari {groupedOrders.length}
                </Text>
            </Page>
        ))}
    </Document>

    return docType === 'INVOICE' ? Invoice : DeliveryNote
}

export default PdfDocument;
