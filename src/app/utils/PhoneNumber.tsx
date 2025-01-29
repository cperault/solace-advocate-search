"use client";

import { formatMobileNumber } from "./formatMobileNumber";

export const PhoneNumber = (number: number | string): string | JSX.Element => {
  const formattedNumber = formatMobileNumber(number);

  return (
    <>
      {formattedNumber !== "N/A" ? (
        <a href={`tel:${number}`} aria-label={`Call ${formattedNumber}`} className="phone-number">
          {formattedNumber}
        </a>
      ) : (
        <span>{formattedNumber}</span>
      )}
    </>
  );
};
