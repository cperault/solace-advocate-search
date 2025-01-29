import { POST } from "@/app/api/seed/route";
import { AdvocateService } from "@/db/AdvocateService";

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

global.Request = MockRequest as any;
global.Response = MockResponse as any;

jest.mock("@/db/AdvocateService", () => ({
  AdvocateService: jest.fn().mockImplementation(() => ({
    bulkCreateAdvocates: jest.fn().mockResolvedValue([
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        city: "New York",
        degree: "PhD",
        specialties: ["CBT"],
        yearsOfExperience: 5,
        phoneNumber: "2345678901",
      },
    ]),
  })),
}));

describe("POST /api/seed", () => {
  let advocateService: jest.Mocked<AdvocateService>;

  beforeEach(() => {
    jest.clearAllMocks();
    advocateService = new AdvocateService() as jest.Mocked<AdvocateService>;
  });

  it("should create advocates and return success response", async () => {
    const request = new MockRequest("http://localhost:3000/api/seed", {
      method: "POST",
      body: JSON.stringify({
        id: "1",
        firstName: "John",
        lastName: "Doe",
        city: "New York",
        degree: "PhD",
        specialties: ["CBT"],
        yearsOfExperience: 5,
        phoneNumber: "2345678901",
      }),
    }) as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      advocates: [
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          city: "New York",
          degree: "PhD",
          specialties: ["CBT"],
          yearsOfExperience: 5,
          phoneNumber: "2345678901",
        },
      ],
    });
  });

  it("should handle invalid JSON", async () => {
    const request = new MockRequest("http://localhost:3000/api/seed", {
      method: "POST",
      body: "invalid json",
    }) as unknown as Request;

    await expect(POST(request)).rejects.toThrow();
  });

  it("should handle database errors", async () => {
    (AdvocateService as unknown as jest.Mock).mockImplementation(() => ({
      bulkCreateAdvocates: jest
        .fn()
        .mockRejectedValueOnce(new Error("Database error")),
    }));

    const request = new MockRequest("http://localhost:3000/api/seed", {
      method: "POST",
      body: JSON.stringify({
        id: "1",
        firstName: "John",
      }),
    }) as unknown as Request;

    await expect(POST(request)).rejects.toThrow("Database error");
  });

  it("should handle empty request body", async () => {
    const request = new MockRequest("http://localhost:3000/api/seed", {
      method: "POST",
      body: "",
    }) as unknown as Request;

    await expect(POST(request)).rejects.toThrow();
  });
});
