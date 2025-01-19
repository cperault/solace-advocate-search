import {
  validateFirstName,
  validateLastName,
  validateCity,
  validateDegree,
  validateYearsOfExperience,
  validatePhoneNumber,
  validateSpecialty,
} from "@/app/utils/validation";

describe("Validation Functions", () => {
  describe("validateFirstName", () => {
    it("should accept valid first names", () => {
      expect(validateFirstName("John")).toBe(true);
      expect(validateFirstName("Mary-Jane")).toBe(true);
      expect(validateFirstName("O'Connor")).toBe(true);
      expect(validateFirstName("José")).toBe(true);
    });

    it("should reject invalid first names", () => {
      expect(validateFirstName("")).toBe(false);
      expect(validateFirstName("a".repeat(129))).toBe(false);
      expect(validateFirstName("John123")).toBe(false);
      expect(validateFirstName("John@")).toBe(false);
    });
  });

  describe("validateLastName", () => {
    it("should accept valid last names", () => {
      expect(validateLastName("Smith")).toBe(true);
      expect(validateLastName("O'Brien")).toBe(true);
      expect(validateLastName("Smith-Jones")).toBe(true);
      expect(validateLastName("González")).toBe(true);
    });

    it("should reject invalid last names", () => {
      expect(validateLastName("")).toBe(false);
      expect(validateLastName("a".repeat(129))).toBe(false);
      expect(validateLastName("Smith123")).toBe(false);
      expect(validateLastName("Smith@")).toBe(false);
    });
  });

  describe("validateCity", () => {
    it("should accept valid city names", () => {
      expect(validateCity("New York")).toBe(true);
      expect(validateCity("San Francisco")).toBe(true);
      expect(validateCity("Saint-Louis")).toBe(true);
      expect(validateCity("O'Fallon")).toBe(true);
    });

    it("should reject invalid city names", () => {
      expect(validateCity("")).toBe(false);
      expect(validateCity("a".repeat(256))).toBe(false);
      expect(validateCity("London123")).toBe(false);
      expect(validateCity("Paris@")).toBe(false);
    });
  });

  describe("validateDegree", () => {
    it("should accept valid degrees", () => {
      expect(validateDegree("PhD")).toBe(true);
      expect(validateDegree("M.D.")).toBe(true);
      expect(validateDegree("B.A.")).toBe(true);
    });

    it("should reject invalid degrees", () => {
      expect(validateDegree("")).toBe(false);
      expect(validateDegree("a".repeat(5))).toBe(false);
      expect(validateDegree("PhD123")).toBe(false);
      expect(validateDegree("PhD@")).toBe(false);
    });
  });

  describe("validateYearsOfExperience", () => {
    it("should accept valid years of experience", () => {
      expect(validateYearsOfExperience(1)).toBe(true);
      expect(validateYearsOfExperience(50)).toBe(true);
      expect(validateYearsOfExperience(100)).toBe(true);
    });

    it("should reject invalid years of experience", () => {
      expect(validateYearsOfExperience(0)).toBe(false);
      expect(validateYearsOfExperience(101)).toBe(false);
      expect(validateYearsOfExperience(-1)).toBe(false);
      expect(validateYearsOfExperience(NaN)).toBe(false);
    });
  });

  describe("validatePhoneNumber", () => {
    it("should accept valid phone numbers", () => {
      expect(validatePhoneNumber("2234567890")).toBe(true);
      expect(validatePhoneNumber("(223) 456-7890")).toBe(true);
      expect(validatePhoneNumber("223-456-7890")).toBe(true);
      expect(validatePhoneNumber("223.456.7890")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhoneNumber("")).toBe(false);
      expect(validatePhoneNumber("123")).toBe(false);
      expect(validatePhoneNumber("12345678901")).toBe(false);
      expect(validatePhoneNumber("abcdefghij")).toBe(false);
      expect(validatePhoneNumber("123-456-789")).toBe(false);
    });
  });

  describe("validateSpecialty", () => {
    it("should accept valid specialties", () => {
      expect(validateSpecialty("Anxiety")).toBe(true);
      expect(validateSpecialty("Cognitive-Behavioral")).toBe(true);
      expect(validateSpecialty("Children's Therapy")).toBe(true);
      expect(validateSpecialty("Post-Traumatic Stress")).toBe(true);
    });

    it("should reject invalid specialties", () => {
      expect(validateSpecialty("")).toBe(false);
      expect(validateSpecialty("a".repeat(256))).toBe(false);
      expect(validateSpecialty("Anxiety123")).toBe(false);
      expect(validateSpecialty("CBT@")).toBe(false);
    });
  });
});
