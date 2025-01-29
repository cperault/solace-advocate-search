"use client";

import { PaginatedResponse, PaginationMetadata } from "@/app/api/advocates/route";
import { Advocate } from "@/app/api/advocates/types";
import { useDebounce } from "@/app/components/Shared/useDebounce";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MockUser, useSession } from "../auth/MockAuth";

interface AdvocateServiceContextType {
  advocates: Advocate[];
  loading: boolean;
  initialized: boolean;
  error: Error | null;
  setAdvocates: React.Dispatch<React.SetStateAction<Advocate[]>>;
  pagination: PaginationMetadata;
  setPagination: React.Dispatch<React.SetStateAction<PaginationMetadata>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  user: MockUser | null;
  isAdmin: boolean;
}

export const MAX_ITEMS_PER_PAGE = 10;

const AdvocateServiceContext = createContext<AdvocateServiceContextType | undefined>(undefined);

export const AdvocateServiceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [state, setState] = useState({
    advocates: [] as Advocate[],
    loading: false,
    initialized: false,
    error: null as Error | null,
    searchTerm: "",
    pagination: {
      totalAdvocates: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: MAX_ITEMS_PER_PAGE,
    },
    user: session?.user || null,
    isAdmin: session?.user?.isAdmin || false,
  });

  const searchParams = useMemo(
    () => ({
      searchTerm: state.searchTerm,
      currentPage: state.pagination.currentPage,
      pageSize: state.pagination.pageSize,
    }),
    [state.searchTerm, state.pagination.currentPage, state.pagination.pageSize]
  );

  const debouncedParams = useDebounce(searchParams, 300);

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }));

    const fetchAdvocates = async () => {
      try {
        const searchQuery = debouncedParams.searchTerm ? `&searchTerm=${encodeURIComponent(debouncedParams.searchTerm)}` : "";

        const url = `/api/advocates?page=${debouncedParams.currentPage}&pageSize=${debouncedParams.pageSize}${searchQuery}`;

        const response = await fetch(url);
        const jsonResponse: PaginatedResponse = await response.json();

        setState((prev) => ({
          ...prev,
          advocates: jsonResponse.data,
          loading: false,
          initialized: true,
          pagination: {
            ...prev.pagination,
            totalAdvocates: jsonResponse.meta.totalAdvocates,
            totalPages: jsonResponse.meta.totalPages,
          },
        }));
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false, error: error as Error }));
        console.error("Error fetching advocates:", error);
      }
    };

    fetchAdvocates();
  }, [debouncedParams]);

  const contextValue = useMemo(
    () => ({
      advocates: state.advocates,
      loading: state.loading,
      initialized: state.initialized,
      error: state.error,
      setAdvocates: (newAdvocates: Advocate[] | ((prev: Advocate[]) => Advocate[])) => {
        setState((prev) => ({
          ...prev,
          advocates: typeof newAdvocates === "function" ? newAdvocates(prev.advocates) : newAdvocates,
        }));
      },
      pagination: state.pagination,
      setPagination: (newPagination: PaginationMetadata | ((prev: PaginationMetadata) => PaginationMetadata)) => {
        setState((prev) => ({
          ...prev,
          pagination: typeof newPagination === "function" ? newPagination(prev.pagination) : newPagination,
        }));
      },
      searchTerm: state.searchTerm,
      setSearchTerm: (newSearchTerm: string | ((prev: string) => string)) => {
        setState((prev) => ({
          ...prev,
          searchTerm: typeof newSearchTerm === "function" ? newSearchTerm(prev.searchTerm) : newSearchTerm,
          pagination: { ...prev.pagination, currentPage: 1 },
        }));
      },
      user: state.user,
      isAdmin: state.isAdmin,
    }),
    [state]
  );

  return <AdvocateServiceContext.Provider value={contextValue}>{children}</AdvocateServiceContext.Provider>;
};

export const useAdvocateService = (): AdvocateServiceContextType => {
  const context = useContext(AdvocateServiceContext);

  if (!context) {
    throw new Error("useAdvocateService must be used within an AdvocateServiceProvider");
  }

  return context;
};
