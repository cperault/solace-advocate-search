"use client";

import { Advocate } from "@/app/api/advocates/types";

import { Modal } from "../Shared/Modal";
import { PhoneNumber } from "@/app/utils/PhoneNumber";

interface AdvocateModalProps {
  advocate: Advocate | null;
  onClose: () => void;
}

export const AdvocateDetailsModal = ({ advocate, onClose }: AdvocateModalProps) => {
  if (!advocate) {
    return null;
  }

  return (
    <Modal isOpen={Boolean(advocate)} onClose={onClose}>
      <h2 id="modal-title" className="modal-title">
        Advocate Details
      </h2>
      <div className="modal-grid">
        <div className="modal-grid-item">
          <strong>First Name:</strong> {advocate.firstName}
        </div>
        <div className="modal-grid-item">
          <strong>Last Name:</strong> {advocate.lastName}
        </div>
        <div className="modal-grid-item">
          <strong>City:</strong> {advocate.city}
        </div>
        <div className="modal-grid-item">
          <strong>Degree:</strong> {advocate.degree}
        </div>
        <div className="modal-grid-item">
          <strong>Years of Experience:</strong> {advocate.yearsOfExperience}
        </div>
        <div className="modal-grid-item">
          <strong>Phone Number:</strong> {PhoneNumber(advocate.phoneNumber)}
        </div>
        <div className="modal-grid-item specialties">
          <strong>Specialties:</strong>
          <ul className="modal-specialties-list">
            {advocate.specialties.map((specialty, index) => (
              <li key={index}>{specialty}</li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};
