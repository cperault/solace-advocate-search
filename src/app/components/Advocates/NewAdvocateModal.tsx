"use client";

import { Advocate } from "@/app/api/advocates/types";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Modal } from "../Shared/Modal";
import {
  validateCity,
  validateDegree,
  validateFirstName,
  validateLastName,
  validatePhoneNumber,
  validateSpecialty,
  validateYearsOfExperience,
} from "@/app/utils/validation";

interface NewAdvocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdvocateAdded: (advocate: Advocate) => void;
  searchTerm?: string;
}

export const NewAdvocateModal = ({ isOpen, onClose, onAdvocateAdded, searchTerm = "" }: NewAdvocateModalProps) => {
  const [formData, setFormData] = useState<Advocate>({
    firstName: "",
    lastName: "",
    city: "",
    degree: "",
    yearsOfExperience: 0,
    phoneNumber: "",
    specialties: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newSpecialty, setNewSpecialty] = useState("");

  useEffect(() => {
    if (isOpen && searchTerm.trim() !== "") {
      setNewSpecialty(searchTerm);
    }
  }, [isOpen, searchTerm]);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "firstName":
        return validateFirstName(value) ? null : "Please enter a valid first name";
      case "lastName":
        return validateLastName(value) ? null : "Please enter a valid last name";
      case "city":
        return validateCity(value) ? null : "Please enter a valid city";
      case "degree":
        return validateDegree(value) ? null : "Please enter a valid degree";
      case "yearsOfExperience":
        return validateYearsOfExperience(parseInt(value)) ? null : "Years of experience must be between 1 and 100";
      case "phoneNumber":
        return validatePhoneNumber(value) ? null : "Please enter a valid number";
      case "specialties":
        return validateSpecialty(value) ? null : "Please enter a valid specialty";
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof Advocate];
      const error = validateField(key, value?.toString() || "");
      if (error) newErrors[key] = error;
    });

    if (formData.specialties.length === 0) {
      if (!newSpecialty || !validateSpecialty(newSpecialty)) {
        newErrors["specialties"] = "Please add at least 1 specialty";
      }
    }

    if (formData.specialties.length > 0) {
      delete newErrors["specialties"];
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      city: "",
      degree: "",
      yearsOfExperience: 0,
      phoneNumber: "",
      specialties: [],
    });
    setNewSpecialty("");
    setErrors({});
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);

    if (!match) return value;
    const [, area, prefix, line] = match;
    if (line) return `(${area}) ${prefix}-${line}`;
    if (prefix) return `(${area}) ${prefix}`;
    if (area) return `(${area}`;
    return value;
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phoneNumber: rawValue }));
  };

  const handleSpecialtyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSpecialty(e.target.value);
  };

  const handleAddSpecialty = () => {
    const name = "specialties";
    const error = validateField(name, newSpecialty);

    if (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
      return;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));

    if (!formData.specialties.includes(newSpecialty)) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty],
      }));
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((item) => item !== specialty),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isValidData = validateForm();

    if (!isValidData) {
      return;
    }

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
        onAdvocateAdded(formData);
        onClose();
      } else {
        console.error("Uh oh: ", response.status);
      }
    } catch (error) {
      console.error("Failed to save new advocate data.", error);
    }
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const handleBlur = (name: string, value: string) => {
    const error = validateField(name, value);

    if (!error) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 id="modal-title" className="modal-title">
        Add New Advocate
      </h2>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={(e) => handleBlur("firstName", e.target.value)}
            placeholder={errors.firstName || "Enter a first name"}
            className={errors.firstName ? "input-error" : ""}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={(e) => handleBlur("lastName", e.target.value)}
            placeholder={errors.lastName || "Enter a last name"}
            className={errors.lastName ? "input-error" : ""}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={(e) => handleBlur("city", e.target.value)}
            placeholder={errors.city || "Enter a city"}
            className={errors.city ? "input-error" : ""}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="degree">Degree</label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            onBlur={(e) => handleBlur("degree", e.target.value)}
            placeholder={errors.degree || "Enter a degree"}
            className={errors.degree ? "input-error" : ""}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="yearsOfExperience">Years of Experience</label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            onBlur={(e) => handleBlur("yearsOfExperience", e.target.value)}
            className={errors.yearsOfExperience ? "input-error" : ""}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formatPhoneNumber(formData.phoneNumber)}
            onChange={handlePhoneNumberChange}
            onBlur={(e) => handleBlur("phoneNumber", formData.phoneNumber)}
            placeholder={errors.phoneNumber || "Enter a phone number"}
            className={errors.phoneNumber ? "input-error" : ""}
            required
          />
        </div>

        <div className="form-group specialties">
          <label htmlFor="specialties">Specialties</label>
          <div className="specialty-input-group">
            <input
              type="text"
              id="specialties"
              name="specialties"
              value={newSpecialty}
              onChange={handleSpecialtyChange}
              onBlur={(e) => handleBlur("specialties", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSpecialty();
                }
              }}
              placeholder={errors.specialties || "Add a new specialty"}
              className={errors.specialties ? "input-error" : ""}
            />
            <button type="button" onClick={handleAddSpecialty} className="add-specialty-btn">
              Add
            </button>
          </div>
          <div className="specialty-list">
            {formData.specialties.map((specialty, index) => (
              <div key={index} className="specialty-item">
                <span>{specialty}</span>
                <button type="button" onClick={() => handleRemoveSpecialty(specialty)} className="remove-specialty-btn">
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="submit" className="new-advocate-save" onClick={handleSubmit}>
            Save New Advocate
          </button>
        </div>
      </form>
    </Modal>
  );
};
