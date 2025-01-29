"use client";

import { ChangeEvent, useState } from "react";
import { Advocate } from "@/app/api/advocates/types";
import { SearchBar } from "../Shared/SearchBar";
import { useAdvocateService } from "@/app/context/AdvocateServiceContext";
import { AdvocateDetailsModal } from "./AdvocateDetailsModal";
import { AdvocateTable } from "./AdvocateTable";
import { NewAdvocateModal } from "./NewAdvocateModal";
import { ErrorDisplay } from "../Shared/ErrorDisplay";

export const AdvocateSearch = () => {
  const { isAdmin, loading, advocates, error, setAdvocates, pagination, setPagination, searchTerm, setSearchTerm } = useAdvocateService();
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [isNewAdvocateModalOpen, setIsNewAdvocateModalOpen] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const onResetSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const openModal = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);
  };

  const closeModal = () => {
    setSelectedAdvocate(null);
  };

  const addNewAdvocate = () => {
    setIsNewAdvocateModalOpen(true);
  };

  const onAdvocateAdded = (advocate: Advocate) => {
    setAdvocates((prev) => [...prev, advocate]);
  };

  const closeNewAdvocateModal = () => {
    setIsNewAdvocateModalOpen(false);
  };

  const goToNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const goToPreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  if (error) return <ErrorDisplay errorMessage="Couldn't retrieve advocates" retryMessage="Reload" onRetry={() => window.location.reload()} />;

  return (
    <div className="search-input-container">
      <SearchBar<Advocate>
        searchTerm={searchTerm}
        placeholder="Search by name, city, degree, or specialties"
        buttonText="Reset Search"
        onResetSearch={onResetSearch}
        onChange={onChange}
      />
      <AdvocateTable advocateData={advocates} openModal={openModal} onAddAdvocate={addNewAdvocate} />
      {selectedAdvocate && <AdvocateDetailsModal advocate={selectedAdvocate} onClose={closeModal} />}
      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={goToPreviousPage} disabled={pagination.currentPage === 1} className="pagination-button">
            &larr;
          </button>
          <span className="pagination-text">
            <span className="current-page">{pagination.currentPage}</span> of <span className="total-pages">{pagination.totalPages}</span>
          </span>
          <button onClick={goToNextPage} disabled={pagination.currentPage === pagination.totalPages} className="pagination-button">
            &rarr;
          </button>
        </div>
      )}
      <NewAdvocateModal isOpen={isNewAdvocateModalOpen} onClose={closeNewAdvocateModal} onAdvocateAdded={onAdvocateAdded} searchTerm={searchTerm} />
    </div>
  );
};
