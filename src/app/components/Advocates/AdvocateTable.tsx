"use client";

import { Advocate } from "@/app/api/advocates/types";
import { useAdvocateService } from "@/app/context/AdvocateServiceContext";
import { PhoneNumber } from "@/app/utils/PhoneNumber";

interface AdvocateTableProps {
  advocateData: Advocate[];
  openModal: (advocate: Advocate) => void;
  onAddAdvocate?: () => void;
}

export const AdvocateTable = ({ advocateData, openModal, onAddAdvocate }: AdvocateTableProps) => {
  const { isAdmin } = useAdvocateService();

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {advocateData.length > 0 ? (
            advocateData.map((advocate, idx1) => (
              <tr key={`tr-${idx1}`} onClick={() => openModal(advocate)}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>{advocate.yearsOfExperience}</td>
                <td itemType="tel">{PhoneNumber(advocate.phoneNumber)}</td>
              </tr>
            ))
          ) : (
            <tr key="no-results">
              <td colSpan={6} className="no-results-cell">
                <div>No advocates found.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isAdmin && advocateData.length === 0 ? (
        <div className="add-advocate-button-container">
          <button className="new-advocate-add" onClick={onAddAdvocate}>
            Add Advocate
          </button>
        </div>
      ) : null}
    </>
  );
};
