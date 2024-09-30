import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import moment from 'moment';
import 'moment/locale/id'
import { DigitFormatter } from '../Utils/General';

const items = [
    { name: "Barang A", qty: 10, price: 50000 },
    { name: "Barang B", qty: 5, price: 75000 },
    { name: "Barang C", qty: 7, price: 60000 },
    { name: "Barang D", qty: 3, price: 100000 },
];

// Style PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    section: {
        marginBottom: 20,
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
        width: "10%",
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: '#f2f2f2',
        padding: 5,
    },
    tableColHeader: {
        width: "33.33%",
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: '#f2f2f2',
        padding: 5,
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
        marginTop: 40,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    signatureBox: {
        width: "40%",
        textAlign: "center",
        paddingTop: 5,
    },
});
moment.locale('id')


// PDF Document
const PdfDocument = ({ order }) => {
    moment.locale('id')

    const [data, setData] = useState(null)
    useEffect(() => {
        setData(order)
        console.log('ORDER DATA', order);
    }, [order])
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Company Information */}
                <View style={{ width: '100%', justifyContent: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 24, width: '100%', textAlign: 'center' }}>{`JAA ALKESUM`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'center' }}>{`Jl. Swadaya Rw. Binong No.68 5, RT.5/RW.3, Bambu Apus, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13890`}</Text>
                    <Text style={{ fontSize: 12, width: '100%', textAlign: 'center' }}>{`<<NOMOR TELPON>>`}</Text>
                    <div style={{ width: '100%', borderBottomWidth: 2, borderBottomColor: 'black', marginTop: 8, marginBottom: 8 }}></div>
                </View>
                <View style={styles.section}>
                    {/* <Text style={styles.header}>Invoice</Text> */}
                    <Text>{moment().format('dddd, DD MMMM YYYY')}</Text>
                    <Text>{`Nomor Surat: ${order?.order_number}`}</Text>
                    <Text>{`Kepada`}</Text>
                    <Text>{`${order?.customer?.name}`}</Text>
                    <Text>{`Perihal: Surat Pengiriman Barang`}</Text>
                    <Text style={{ marginTop: 8 }}>{`Dengan Hormat,`}</Text>
                    <Text>{`Bersama surat ini, kami mengirimkan barang sesuai dengan pesanan nomor XXXXX pada tanggal XXX sebagai berikut`}</Text>
                </View>

                {/* Table Header */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeaderNumber}>
                            <Text>Nomor</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text>Nama Barang</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text>Jumlah(pcs)</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text>Harga (Rp)</Text>
                        </View>
                    </View>

                    {order?.order_list?.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={styles.tableColHeaderNumber}>
                                <Text>{index + 1}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{item.name}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{item.qty}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{DigitFormatter(item?.price)}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Table Footer (Total Price) */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColTotal}>
                            <Text>Total</Text>
                        </View>
                        <View style={styles.tableColTotalAmount}>
                            <Text style={styles.tableCell}>
                                {order?.total_bill}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.signature}>
                    <View style={styles.signatureBox}>
                        <Text style={{ width: '100%', borderBottom: 1, borderBottomColor: 'black' }}>{order?.pic}</Text>
                        <Text>{`Sales Pengirim`}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={{ width: '100%', borderBottom: 1, borderBottomColor: 'black', color: 'white' }}>|</Text>
                        <Text>{`Sales Pengirim`}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

export default PdfDocument;
