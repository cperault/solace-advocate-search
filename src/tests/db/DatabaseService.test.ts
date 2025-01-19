import { DatabaseService } from "@/db/DatabaseService";
import { setup } from "@/db";
import { advocates } from "@/db/schema";
import { PostgresType } from "postgres";
import { SQL } from "drizzle-orm";

const flattenQueryChunks = (chunks: any[]): string => {
  return chunks
    .map((chunk) => {
      if (chunk.value) return chunk.value.join("");
      if (chunk.queryChunks) return flattenQueryChunks(chunk.queryChunks);
      return "";
    })
    .join("");
};

jest.mock("@/db", () => ({
  setup: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue([]),
          }),
        }),
        limit: jest.fn(),
        offset: jest.fn(),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn(),
      }),
    }),
  }),
}));

type MockAdvocate = {
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
};

describe("DatabaseService", () => {
  let service: DatabaseService<MockAdvocate>;

  type MockPostgresType = PostgresType & {
    end: jest.Mock;
    arrays: jest.Mock;
    begin: jest.Mock;
    call: jest.Mock;
    connect: jest.Mock;
    unsafe: jest.Mock;
    parameters: {};
    to: number;
    from: number[];
    mock: { calls: any[][] };
    sql: jest.Mock<SQL, any[]>;
  };

  const mockSql: MockPostgresType = {
    end: jest.fn().mockResolvedValue(undefined),
    arrays: jest.fn(),
    begin: jest.fn(),
    call: jest.fn(),
    connect: jest.fn(),
    unsafe: jest.fn(),
    parameters: {},
    to: 1,
    from: [1],
    serialize: jest.fn(),
    parse: jest.fn(),
    mock: { calls: [] },
    sql: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DatabaseService(advocates, mockSql);
  });

  describe("initialization", () => {
    it("should initialize with valid database connection", () => {
      expect(service).toBeInstanceOf(DatabaseService);
    });

    it("should throw error if db is not initialized", () => {
      (setup as jest.Mock).mockReturnValueOnce(null);
      expect(() => new DatabaseService(advocates, mockSql)).toThrow("Database wasn't initialized.");
    });

    it("should require both select and insert capabilities", () => {
      // mock setup without insert
      (setup as jest.Mock).mockReturnValueOnce({
        select: jest.fn(),
      });
      expect(() => new DatabaseService(advocates, mockSql)).toThrow("Database client missing required methods");

      // mock setup without select
      (setup as jest.Mock).mockReturnValueOnce({
        insert: jest.fn(),
      });
      expect(() => new DatabaseService(advocates, mockSql)).toThrow("Database client missing required methods");
    });

    it("should validate where(), limit(), and offset() methods after from() in select chain", () => {
      (setup as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({}), // missing where(), limit(), and offset() methods after from()
        }),
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn(),
          }),
        }),
      });
      expect(() => new DatabaseService(advocates, mockSql)).toThrow("Database select missing required methods");
    });

    it("should validate values() method", () => {
      (setup as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn(),
            limit: jest.fn(),
            offset: jest.fn(),
          }),
        }),
        insert: jest.fn().mockReturnValue({}), // missing values()
      });
      expect(() => new DatabaseService(advocates, mockSql)).toThrow("Database insert missing required methods");
    });
  });

  describe("cleanup", () => {
    it("should call sql.end()", async () => {
      await service.cleanup();
      expect(mockSql.end).toHaveBeenCalled();
    });
  });

  describe("select", () => {
    let whereMock: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();

      whereMock = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          offset: jest.fn().mockResolvedValue([
            {
              data: { id: 1, name: "test" },
              total: 10,
            },
          ]),
        }),
      });

      const fromMock = jest.fn().mockReturnValue({
        where: whereMock,
        limit: jest.fn(),
        offset: jest.fn(),
      });

      const selectMock = jest.fn().mockReturnValue({
        from: fromMock,
      });

      (setup as jest.Mock).mockReturnValue({
        select: selectMock,
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn(),
          }),
        }),
      });

      service = new DatabaseService(advocates, mockSql);
    });

    it("should return total count from window function", async () => {
      const result = await service.select({
        pagination: { page: 1, pageSize: 10 },
        searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
      });

      expect(result.total).toBe(10);
      expect(result.data).toHaveLength(1);
    });

    it("should handle empty results", async () => {
      const whereMock = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          offset: jest.fn().mockResolvedValue([]),
        }),
      });

      const fromMock = jest.fn().mockReturnValue({
        where: whereMock,
        limit: jest.fn(),
        offset: jest.fn(),
      });

      const selectMock = jest.fn().mockReturnValue({
        from: fromMock,
      });

      (setup as jest.Mock).mockReturnValue({
        select: selectMock,
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn(),
          }),
        }),
      });

      service = new DatabaseService(advocates, mockSql);

      const result = await service.select({
        pagination: { page: 1, pageSize: 10 },
        searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
      });

      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    describe("NOT conditions in SQL generation", () => {
      it("should handle standalone NOT condition", async () => {
        await service.select({
          pagination: { page: 1, pageSize: 10 },
          search: {
            conditions: [{ term: "Anxiety", operator: "NOT" }],
          },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });

        const whereClause = whereMock.mock.calls[0][0];
        const sqlString = flattenQueryChunks(whereClause.queryChunks);
        expect(sqlString).toContain("not");
        expect(sqlString).toContain("or");
      });

      it("should handle OR with NOT condition", async () => {
        await service.select({
          pagination: { page: 1, pageSize: 10 },
          search: {
            conditions: [
              { term: "Depression", operator: "OR" },
              { term: "Anxiety", operator: "OR" },
              { term: "PTSD", operator: "NOT" },
            ],
          },
          searchFields: ["firstName", "lastName", "city", "degree", "specialties"],
        });

        const whereClause = whereMock.mock.calls[0][0];
        const sqlString = flattenQueryChunks(whereClause.queryChunks);

        expect(sqlString).toMatch(/\(\(/); // Opens with double parentheses
        expect(sqlString).toMatch(/ilike.*or.*ilike.*or.*ilike.*or.*ilike.*or.*ILIKE/i); // First OR group
        expect(sqlString).toMatch(/\) and \(/); // AND between groups
        expect(sqlString).toMatch(/ilike.*or.*ilike.*or.*ilike.*or.*ilike.*or.*ILIKE/i); // Second OR group
        expect(sqlString).toMatch(/\) and not \(/); // NOT before last group
        expect(sqlString).toMatch(/ilike.*or.*ilike.*or.*ilike.*or.*ilike.*or.*ILIKE/i); // Last OR group
        expect(sqlString).toMatch(/\)\)$/); // Ends with double parentheses

        // Verify the order of operations
        const andIndex = sqlString.indexOf(" and ");
        const notIndex = sqlString.indexOf(" not ");
        expect(andIndex).toBeLessThan(notIndex); // AND should come before NOT

        // Verify we're using ILIKE for case-insensitive search
        expect(sqlString.match(/ilike/gi)?.length).toBe(15); // 5 fields × 3 conditions
      });

      it("should handle AND with NOT condition", async () => {
        await service.select({
          pagination: { page: 1, pageSize: 10 },
          search: {
            conditions: [
              { terms: ["Depression", "Anxiety"], operator: "AND" },
              { term: "PTSD", operator: "NOT" },
            ],
          },
          searchFields: ["specialties"],
        });

        const whereClause = whereMock.mock.calls[0][0];
        const sqlString = flattenQueryChunks(whereClause.queryChunks);
        expect(sqlString).toContain("and");
        expect(sqlString).toContain("not");
      });
    });
  });
});
