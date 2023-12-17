export const DigitFormatter = (number) => {
    if (isNaN(number)) {
        return "Invalid number";
      }
      const numStr = number.toString();
      const parts = numStr.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      const formattedNumber = parts.join(".");
      return formattedNumber;
}

export const OnlyDigit = (value) => {
    return value.replace(/[^0-9]/g, '')
}

export const PaymentTypeList = [
    {label: 'Tunai', value: 'Tunai'},
    {label: 'Konsinyasi', value: 'Konsinyasi'},
    {label: 'Purchase Order', value: 'Purchase Order'},
]

export const StatusTypeList = [
    {label: 'Aktif', value: true},
    {label: 'NonAktif', value: false},
]

export const filterByList = [
    { label: 'Nomor Transaksi', value: 'order_number' },
    { label: 'Customer', value: 'customer_id' },
    { label: 'Jenis', value: 'type' },
    { label: 'Tanggal', value: 'order_date' },
    { label: 'Status', value: 'status' },
    { label: 'Hapus Filter', value: null }
  ]