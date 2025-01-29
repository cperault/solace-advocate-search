import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdvocateServiceProvider, useAdvocateService } from "../../app/context/AdvocateServiceContext";
import { Advocate } from "@/app/api/advocates/types";
import { useEffect, useRef } from "react";
import { render } from "../test-utils";

const TestComponent = () => {
  const { advocates, searchTerm, setSearchTerm, pagination } = useAdvocateService();
  return (
    <div>
      <input data-testid="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <div data-testid="advocates-count">{advocates.length}</div>
      <div data-testid="current-page">{pagination.currentPage}</div>
      {advocates.map((advocate) => (
        <div key={advocate.id} data-testid={`advocate-${advocate.id}`}>
          {advocate.firstName} {advocate.lastName}
        </div>
      ))}
    </div>
  );
};

const mockAdvocates: Advocate[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    city: "New York",
    degree: "PhD",
    specialties: ["Grief", "Anxiety", "Sleep Disorders"],
    yearsOfExperience: 5,
    phoneNumber: "1234567890",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    city: "Boston",
    degree: "Masters",
    specialties: ["Depression", "PTSD"],
    yearsOfExperience: 8,
    phoneNumber: "1234567891",
  },
];

global.fetch = jest.fn();

describe("AdvocateServiceProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: mockAdvocates,
            meta: {
              totalAdvocates: mockAdvocates.length,
              totalPages: 1,
              currentPage: 1,
              pageSize: 10,
            },
          }),
      })
    );
  });

  describe("Initial Load and Search", () => {
    it("should fetch advocates on initial render", async () => {
      render(
        <AdvocateServiceProvider>
          <TestComponent />
        </AdvocateServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("advocates-count")).toHaveTextContent("2");
      });

      expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/advocates\?page=1&pageSize=10/));
    });

    it("should update search results when search term changes", async () => {
      const user = userEvent.setup();

      render(
        <AdvocateServiceProvider>
          <TestComponent />
        </AdvocateServiceProvider>
      );

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              data: [mockAdvocates[0]],
              meta: {
                totalAdvocates: 1,
                totalPages: 1,
                currentPage: 1,
                pageSize: 10,
              },
            }),
        })
      );

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "Grief");

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/searchTerm=Grief/));
      });

      expect(screen.getByTestId("advocates-count")).toHaveTextContent("1");
      expect(screen.getByTestId("advocate-1")).toBeInTheDocument();
      expect(screen.queryByTestId("advocate-2")).not.toBeInTheDocument();
    });

    it("should handle empty search results", async () => {
      const user = userEvent.setup();

      render(<TestComponent />);

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              data: [],
              meta: {
                totalAdvocates: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: 10,
              },
            }),
        })
      );

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "NonexistentSearch");

      await waitFor(() => {
        expect(screen.getByTestId("advocates-count")).toHaveTextContent("0");
      });
    });
  });

  describe("Pagination", () => {
    it("should handle pagination", async () => {
      const TestPaginationComponent = () => {
        const { advocates, pagination, setPagination } = useAdvocateService();
        return (
          <div>
            <div data-testid="advocates-count">{advocates.length}</div>
            <div data-testid="current-page">{pagination.currentPage}</div>
            <button
              data-testid="next-page"
              onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </button>
          </div>
        );
      };

      const user = userEvent.setup();

      render(<TestPaginationComponent />);

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              data: [mockAdvocates[1]],
              meta: {
                totalAdvocates: 2,
                totalPages: 2,
                currentPage: 2,
                pageSize: 1,
              },
            }),
        })
      );

      await user.click(screen.getByTestId("next-page"));

      await waitFor(() => {
        expect(screen.getByTestId("current-page")).toHaveTextContent("2");
        expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/page=2/));
      });
    });

    it("should reset to page 1 when search term changes", async () => {
      const user = userEvent.setup();

      const TestPaginationComponent = () => {
        const { advocates, searchTerm, setSearchTerm, pagination, setPagination } = useAdvocateService();
        const hasSetInitialPage = useRef(false);

        useEffect(() => {
          if (!hasSetInitialPage.current) {
            hasSetInitialPage.current = true;
            setPagination((prev) => ({ ...prev, currentPage: 2 }));
          }
        }, []);

        return (
          <div>
            <input data-testid="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <div data-testid="current-page">{pagination.currentPage}</div>
          </div>
        );
      };

      render(<TestPaginationComponent />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "Grief");

      await waitFor(() => {
        expect(screen.getByTestId("current-page")).toHaveTextContent("1");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("API Error")));

      render(<TestComponent />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Advocate CRUD", () => {
    it("should successfully add a new advocate", async () => {
      const newAdvocate: Advocate = {
        id: "3",
        firstName: "Christopher",
        lastName: "Perault",
        city: "Seattle",
        degree: "Bs.C",
        specialties: ["music therapy", "aromatherapy"],
        yearsOfExperience: 6,
        phoneNumber: "1234567893",
      };

      const TestAddComponent = () => {
        const { advocates, setAdvocates } = useAdvocateService();
        return (
          <div>
            <button data-testid="add-advocate" onClick={() => setAdvocates((prev) => [...prev, newAdvocate])}>
              Add
            </button>
            <div data-testid="advocates-count">{advocates.length}</div>
          </div>
        );
      };

      render(<TestAddComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("advocates-count")).toHaveTextContent("2");
      });

      await userEvent.click(screen.getByTestId("add-advocate"));

      await waitFor(() => {
        expect(screen.getByTestId("advocates-count")).toHaveTextContent("3");
      });
    });

    it("should maintain advocate list integrity when adding multiple advocates", async () => {
      const newAdvocates: Advocate[] = [
        {
          id: "3",
          firstName: "Third",
          lastName: "Advocate",
          city: "Chicago",
          degree: "PhD",
          specialties: ["CBT"],
          yearsOfExperience: 3,
          phoneNumber: "1234567893",
        },
        {
          id: "4",
          firstName: "Fourth",
          lastName: "Advocate",
          city: "Miami",
          degree: "PsyD",
          specialties: ["DBT", "Mindfulness"],
          yearsOfExperience: 7,
          phoneNumber: "1234567894",
        },
      ];

      const TestMultiAddComponent = () => {
        const { advocates, setAdvocates } = useAdvocateService();
        return (
          <div>
            <button
              data-testid="add-multiple"
              onClick={() => {
                newAdvocates.forEach((advocate) => {
                  setAdvocates((prev) => [...prev, advocate]);
                });
              }}
            >
              Add Multiple
            </button>
            <div data-testid="advocates-count">{advocates.length}</div>
            {advocates.map((advocate) => (
              <div key={advocate.id} data-testid={`advocate-${advocate.id}`}>
                {advocate.firstName} {advocate.lastName}
              </div>
            ))}
          </div>
        );
      };

      render(<TestMultiAddComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("advocates-count")).toHaveTextContent("2");
      });

      await userEvent.click(screen.getByTestId("add-multiple"));

      await waitFor(() => {
        expect(screen.getByTestId("advocates-count")).toHaveTextContent("4");
      });

      expect(screen.getByTestId("advocate-1")).toBeInTheDocument();
      expect(screen.getByTestId("advocate-2")).toBeInTheDocument();
      expect(screen.getByTestId("advocate-3")).toBeInTheDocument();
      expect(screen.getByTestId("advocate-4")).toBeInTheDocument();

      expect(screen.getByTestId("advocate-3")).toHaveTextContent("Third Advocate");
      expect(screen.getByTestId("advocate-4")).toHaveTextContent("Fourth Advocate");
    });
  });
});
