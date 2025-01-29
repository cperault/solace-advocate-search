import validator from "validator";

export const validateFirstName = (firstName: string) => {
  return (
    !validator.isEmpty(firstName) &&
    firstName.length >= 1 &&
    firstName.length <= 128 &&
    /^[\p{L}\s'-]+$/u.test(firstName)
  );
};

export const validateLastName = (lastName: string) => {
  return (
    !validator.isEmpty(lastName) && lastName.length >= 1 && lastName.length <= 128 && /^[\p{L}\s'-]+$/u.test(lastName)
  );
};

export const validateCity = (city: string) => {
  return !validator.isEmpty(city) && city.length >= 1 && city.length <= 255 && /^[\p{L}\s'-]+$/u.test(city);
};

export const validateDegree = (degree: string) => {
  return !validator.isEmpty(degree) && degree.length >= 1 && degree.length <= 4 && /^[\p{L}\s'.]+$/u.test(degree);
};

export const validateYearsOfExperience = (yearsOfExperience: number) => {
  return !isNaN(yearsOfExperience) && yearsOfExperience >= 1 && yearsOfExperience <= 100;
};

export const validatePhoneNumber = (phoneNumber: string) => {
  const phone = phoneNumber?.toString() || "";

  // accepts most common formats: 1234567890, (123) 456-7890, 123-456-7890, 123.456.7890
  const phoneRegex = /^(\d{10}|\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4})$/;

  if (phoneRegex.test(phone)) {
    const cleanedNumber = phone.replace(/\D/g, "");
    return validator.isMobilePhone(cleanedNumber, "en-US");
  }

  return false;
};

export const validateSpecialty = (specialty: string) => {
  return (
    !validator.isEmpty(specialty) &&
    specialty.length >= 1 &&
    specialty.length <= 255 &&
    /^[\p{L}\s'-]+$/u.test(specialty)
  );
};
