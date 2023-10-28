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