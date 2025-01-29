import { GET } from "@/app/api/advocates/route";
import { AdvocateService } from "@/db/AdvocateService";

jest.mock("postgres", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    end: jest.fn(),
  })),
}));

jest.mock("@/db/AdvocateService");

class MockRequest {
  public url: string;
  private config: RequestInit;

  constructor(url: string, config: RequestInit) {
    this.url = url;
    this.config = config;
  }

  async json() {
    return JSON.parse(this.config.body as string);
  }
}

class MockResponse {
  private body: string;
  public status: number;
  private headers: Headers;

  constructor(body: string, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }

  async json() {
    return JSON.parse(this.body);
  }
}

global.Response = MockResponse as any;

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
];

describe("GET /api/advocates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AdvocateService.prototype, "getAllAdvocates").mockResolvedValue({ data: mockAdvocates, total: mockAdvocates.length });
  });

  describe("pagination", () => {
    it("should handle basic pagination", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10", { method: "GET" }) as unknown as Request;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: mockAdvocates,
        meta: {
          totalAdvocates: 2,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      });
    });

    it("should handle invalid pagination parameters", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=0&pageSize=10", { method: "GET" }) as unknown as Request;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Invalid pagination parameters. Page and pageSize must be positive integers.",
      });
    });
  });

  describe("search functionality", () => {
    it("should handle simple search term", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=Depression", {
        method: "GET",
      }) as unknown as Request;

      await GET(request);

      expect(AdvocateService.prototype.getAllAdvocates).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchTerm: "Depression",
      });
    });

    it("should handle complex search with AND", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=CBT%20AND%20Depression", {
        method: "GET",
      }) as unknown as Request;

      await GET(request);

      expect(AdvocateService.prototype.getAllAdvocates).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchTerm: "CBT AND Depression",
      });
    });

    it("should handle complex search with NOT", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=Depression%20NOT%20Anxiety", {
        method: "GET",
      }) as unknown as Request;

      await GET(request);

      expect(AdvocateService.prototype.getAllAdvocates).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchTerm: "Depression NOT Anxiety",
      });
    });

    it("should handle standalone NOT searches", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=NOT%20suicide", {
        method: "GET",
      }) as unknown as Request;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(AdvocateService.prototype.getAllAdvocates).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchTerm: "NOT suicide",
      });
    });

    it("should handle AND with NOT combination", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=Depression%20AND%20Anxiety%20NOT%20PTSD", {
        method: "GET",
      }) as unknown as Request;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(AdvocateService.prototype.getAllAdvocates).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchTerm: "Depression AND Anxiety NOT PTSD",
      });
    });

    it("should handle OR with NOT combination", async () => {
      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=Depression%20OR%20Anxiety%20NOT%20PTSD", {
        method: "GET",
      }) as unknown as Request;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(AdvocateService.prototype.getAllAdvocates).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        searchTerm: "Depression OR Anxiety NOT PTSD",
      });
    });
  });

  describe("error handling", () => {
    it("should handle database errors", async () => {
      jest.spyOn(AdvocateService.prototype, "getAllAdvocates").mockRejectedValueOnce(new Error("Database error"));

      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10", { method: "GET" }) as unknown as Request;

      await expect(GET(request)).rejects.toThrow("Database error");
    });

    it("should handle empty search results", async () => {
      jest.spyOn(AdvocateService.prototype, "getAllAdvocates").mockResolvedValueOnce({ data: [], total: 0 });

      const request = new MockRequest("http://localhost:3000/api/advocates?page=1&pageSize=10&searchTerm=NonexistentTerm", {
        method: "GET",
      }) as unknown as Request;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: [],
        meta: {
          totalAdvocates: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
        },
      });
    });
  });
});