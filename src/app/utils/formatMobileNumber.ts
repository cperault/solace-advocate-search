export const formatMobileNumber = (number: number | string): string => {
  try {
    let phoneNumber = number.toString().replace(/\D/g, "");

    if (phoneNumber.length !== 10) {
      return "N/A";
    }

    // format the phone number as (XXX) XXX-XXXX
    const formattedNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;

    return formattedNumber;
  } catch {
    return "N/A";
  }
};
