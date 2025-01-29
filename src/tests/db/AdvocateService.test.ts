import { AdvocateService } from "@/db/AdvocateService";
import { DatabaseService } from "@/db/DatabaseService";

jest.mock("@/db/DatabaseService");

describe("AdvocateService", () => {
  let service: AdvocateService;
  let mockSelect: jest.Mock;

  const mockAdvocates = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      city: "New York",
      degree: "PhD",
      specialties: ["CBT", "Depression"],
      yearsOfExperience: 5,
      phoneNumber: "2345678901",
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      city: "Boston",
      degree: "PsyD",
      specialties: ["Anxiety", "PTSD"],
      yearsOfExperience: 8,
      phoneNumber: "1234567890",
    },
    {
      id: "3",
      firstName: "Bob",
      lastName: "Johnson",
      city: "Chicago",
      degree: "MD",
      specialties: ["Depression", "Anxiety", "CBT"],
      yearsOfExperience: 12,
      phoneNumber: "9876543210",
    },
    {
      id: "4",
      firstName: "Sarah",
      lastName: "Williams",
      city: "Los Angeles",
      degree: "PhD",
      specialties: ["PTSD", "Trauma"],
      yearsOfExperience: 15,
      phoneNumber: "5678901234",
    },
    {
      id: "5",
      firstName: "Michael",
      lastName: "Brown",
      city: "Seattle",
      degree: "PsyD",
      specialties: ["CBT", "Anxiety", "Depression"],
      yearsOfExperience: 7,
      phoneNumber: "4567890123",
    },
    {
      id: "6",
      firstName: "Emily",
      lastName: "Davis",
      city: "Portland",
      degree: "PhD",
      specialties: ["Depression", "Trauma"],
      yearsOfExperience: 10,
      phoneNumber: "3456789012",
    },
    {
      id: "7",
      firstName: "David",
      lastName: "Miller",
      city: "Austin",
      degree: "MD",
      specialties: ["Anxiety", "CBT", "PTSD"],
      yearsOfExperience: 9,
      phoneNumber: "6789012345",
    },
  ];

  const MockDatabaseService = DatabaseService as jest.MockedClass<typeof DatabaseService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSelect = jest.fn().mockResolvedValue({
      data: mockAdvocates,
      total: mockAdvocates.length,
    });

    jest.spyOn(DatabaseService.prototype, "select").mockImplementation(mockSelect);

    service = new AdvocateService();
  });

  describe("getAllAdvocates", () => {
    describe("basic pagination", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should handle basic pagination without search", async () => {
        MockDatabaseService.prototype.select = jest.fn().mockResolvedValue({
          data: mockAdvocates,
          total: mockAdvocates.length,
        });

        service = new AdvocateService();

        const result = await service.getAllAdvocates({
          page: 1,
          pageSize: 10,
        });

        expect(result).toEqual({
          data: mockAdvocates,
          total: mockAdvocates.length,
        });
        expect(DatabaseService.prototype.select).toHaveBeenCalledWith({
          pagination: { page: 1, pageSize: 10 },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });
      });

      it("should return correct total count for paginated results", async () => {
        MockDatabaseService.prototype.select = jest.fn().mockResolvedValue({
          data: mockAdvocates.slice(0, 2),
          total: mockAdvocates.length,
        });

        service = new AdvocateService();

        const result = await service.getAllAdvocates({
          page: 1,
          pageSize: 2,
        });

        expect(result.total).toBe(mockAdvocates.length);
        expect(result.data).toHaveLength(2);
        expect(MockDatabaseService.prototype.select).toHaveBeenCalledWith({
          pagination: { page: 1, pageSize: 2 },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });
      });
    });

    describe("simple search patterns", () => {
      it("should handle single term search", async () => {
        await service.getAllAdvocates({
          page: 1,
          pageSize: 10,
          searchTerm: "Depression",
        });

        expect(DatabaseService.prototype.select).toHaveBeenCalledWith({
          pagination: { page: 1, pageSize: 10 },
          search: { terms: ["Depression"], operator: "OR" },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });
      });

      it("should handle AND search", async () => {
        await service.getAllAdvocates({
          page: 1,
          pageSize: 10,
          searchTerm: "CBT AND Depression",
        });

        expect(DatabaseService.prototype.select).toHaveBeenCalledWith({
          pagination: { page: 1, pageSize: 10 },
          search: { terms: ["CBT", "Depression"], operator: "AND" },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });
      });

      it("should handle OR search", async () => {
        await service.getAllAdvocates({
          page: 1,
          pageSize: 10,
          searchTerm: "PTSD OR Trauma",
        });

        expect(DatabaseService.prototype.select).toHaveBeenCalledWith({
          pagination: { page: 1, pageSize: 10 },
          search: { terms: ["PTSD", "Trauma"], operator: "OR" },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });
      });
    });

    describe("complex search patterns", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("handles single term search", async () => {
        await service.getAllAdvocates({
          page: 1,
          pageSize: 10,
          searchTerm: "Depression",
        });

        expect(mockSelect).toHaveBeenCalledWith({
          pagination: { page: 1, pageSize: 10 },
          search: { terms: ["Depression"], operator: "OR" },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });
      });

      it("handles NOT at start", async () => {
        const result = await service.getAllAdvocates({ page: 1, pageSize: 10, searchTerm: "NOT CBT" });
        expect(mockSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            search: {
              conditions: [{ term: "CBT", operator: "NOT" }],
            },
            searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
          })
        );
        expect(result.data.map((a) => a.id)).toEqual(
          expect.arrayContaining(["2", "4", "6"]) // All advocates without CBT specialty
        );
      });

      it("handles multiple AND", async () => {
        const result = await service.getAllAdvocates({ page: 1, pageSize: 10, searchTerm: "Depression AND Anxiety" });
        expect(mockSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            search: { terms: ["Depression", "Anxiety"], operator: "AND" },
            searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
          })
        );
        expect(result.data.map((a) => a.id)).toEqual(
          expect.arrayContaining(["3", "5"]) // Advocates with both Depression AND Anxiety
        );
      });

      it("handles multiple OR", async () => {
        const result = await service.getAllAdvocates({ page: 1, pageSize: 10, searchTerm: "PTSD OR Trauma" });
        expect(mockSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            search: { terms: ["PTSD", "Trauma"], operator: "OR" },
            searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
          })
        );
        expect(result.data.map((a) => a.id)).toEqual(
          expect.arrayContaining(["2", "4", "6", "7"]) // Advocates with either PTSD OR Trauma
        );
      });

      it("handles multiple NOT", async () => {
        const result = await service.getAllAdvocates({ page: 1, pageSize: 10, searchTerm: "Depression NOT CBT NOT PTSD" });
        expect(mockSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            search: {
              conditions: [
                { term: "Depression", operator: "OR" },
                { term: "CBT", operator: "NOT" },
                { term: "PTSD", operator: "NOT" },
              ],
            },
            searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
          })
        );
        expect(result.data.map((a) => a.id)).toEqual(
          expect.arrayContaining(["1", "6"]) // Advocates with Depression but without CBT and PTSD
        );
      });

      it("handles AND with NOT", async () => {
        const result = await service.getAllAdvocates({ page: 1, pageSize: 10, searchTerm: "Depression AND Anxiety NOT PTSD" });
        expect(mockSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            search: {
              conditions: [
                { terms: ["Depression", "Anxiety"], operator: "AND" },
                { term: "PTSD", operator: "NOT" },
              ],
            },
            searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
          })
        );
        expect(result.data.map((a) => a.id)).toEqual(
          expect.arrayContaining(["3", "5"]) // Advocates with Depression AND Anxiety but NOT PTSD
        );
      });

      it("handles OR with NOT", async () => {
        const result = await service.getAllAdvocates({ page: 1, pageSize: 10, searchTerm: "Depression OR Anxiety NOT CBT" });
        expect(mockSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            search: {
              conditions: [
                { term: "Depression", operator: "OR" },
                { term: "Anxiety", operator: "OR" },
                { term: "CBT", operator: "NOT" },
              ],
            },
            searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
          })
        );
        expect(result.data.map((a) => a.id)).toEqual(
          expect.arrayContaining(["2", "4", "6"]) // Advocates with Depression OR Anxiety but NOT CBT
        );
      });
    });
  });
});
