import { formatMobileNumber } from "@/app/utils/formatMobileNumber";

describe("formatMobileNumber", () => {
  it("should format a valid 10-digit number", () => {
    expect(formatMobileNumber("1234567890")).toBe("(123) 456-7890");
    expect(formatMobileNumber(1234567890)).toBe("(123) 456-7890");
  });

  it("should handle numbers with existing formatting", () => {
    expect(formatMobileNumber("(123) 456-7890")).toBe("(123) 456-7890");
    expect(formatMobileNumber("123-456-7890")).toBe("(123) 456-7890");
    expect(formatMobileNumber("123.456.7890")).toBe("(123) 456-7890");
  });

  it("should return N/A for invalid numbers", () => {
    expect(formatMobileNumber("123")).toBe("N/A");
    expect(formatMobileNumber("12345678901")).toBe("N/A");
    expect(formatMobileNumber("")).toBe("N/A");
    expect(formatMobileNumber("abcdefghij")).toBe("N/A");
  });

  it("should handle edge cases", () => {
    expect(formatMobileNumber(null as any)).toBe("N/A");
    expect(formatMobileNumber(undefined as any)).toBe("N/A");
    expect(formatMobileNumber(" 1234567890 ")).toBe("(123) 456-7890");
  });
});
