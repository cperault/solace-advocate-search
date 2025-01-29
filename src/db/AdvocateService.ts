import { Advocate } from "@/app/api/advocates/types";
import { DatabaseService } from "./DatabaseService";
import { advocates } from "./schema";
import postgres, { PostgresType } from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
}) as unknown as PostgresType;

export class AdvocateService extends DatabaseService<Advocate> {
  constructor() {
    super(advocates, sql);
  }

  async getAllAdvocates(params: { page: number; pageSize: number; searchTerm?: string }): Promise<{ data: Advocate[]; total: number }> {
    const searchFields: (keyof Advocate)[] = ["firstName", "lastName", "city", "degree", "specialties"];

    if (!params.searchTerm) {
      return this.select({ pagination: { page: params.page, pageSize: params.pageSize }, searchFields });
    }

    // Handle NOT at start (e.g., "NOT grief")
    if (params.searchTerm.startsWith("NOT ")) {
      return await this.select({
        pagination: { page: params.page, pageSize: params.pageSize },
        search: {
          conditions: [
            {
              term: params.searchTerm.substring(4).trim(),
              operator: "NOT",
            },
          ],
        },
        searchFields,
      });
    }

    // Handle AND with multiple NOT
    if (params.searchTerm.includes(" AND ") && params.searchTerm.includes(" NOT ")) {
      const [andPart, ...notParts] = params.searchTerm.split(" NOT ");
      const andTerms = andPart.split(" AND ").map((t) => t.trim());

      return await this.select({
        pagination: { page: params.page, pageSize: params.pageSize },
        search: {
          conditions: [
            { terms: andTerms, operator: "AND" },
            ...notParts.map((term) => ({
              term: term.trim(),
              operator: "NOT" as const,
            })),
          ],
        },
        searchFields,
      });
    }

    // Handle OR with multiple NOT
    if (params.searchTerm.includes(" OR ") && params.searchTerm.includes(" NOT ")) {
      const [orPart, ...notParts] = params.searchTerm.split(" NOT ");
      const orTerms = orPart.split(" OR ").map((t) => t.trim());

      return await this.select({
        pagination: { page: params.page, pageSize: params.pageSize },
        search: {
          conditions: [
            ...orTerms.map((term) => ({
              term: term.trim(),
              operator: "OR" as const,
            })),
            ...notParts.map((term) => ({
              term: term.trim(),
              operator: "NOT" as const,
            })),
          ],
        },
        searchFields,
      });
    }

    // Handle multiple NOT
    if (params.searchTerm.includes(" NOT ")) {
      const [mainTerm, ...notTerms] = params.searchTerm.split(" NOT ");
      return await this.select({
        pagination: { page: params.page, pageSize: params.pageSize },
        search: {
          conditions: [
            { term: mainTerm.trim(), operator: "OR" },
            ...notTerms.map((term) => ({
              term: term.trim(),
              operator: "NOT" as const,
            })),
          ],
        },
        searchFields,
      });
    }

    // Handle multiple AND
    if (params.searchTerm.includes(" AND ")) {
      const terms = params.searchTerm.split(" AND ").map((t) => t.trim());
      return await this.select({
        pagination: { page: params.page, pageSize: params.pageSize },
        search: { terms, operator: "AND" },
        searchFields,
      });
    }

    // Handle multiple OR
    if (params.searchTerm.includes(" OR ")) {
      const terms = params.searchTerm.split(" OR ").map((t) => t.trim());
      return await this.select({
        pagination: { page: params.page, pageSize: params.pageSize },
        search: { terms, operator: "OR" },
        searchFields,
      });
    }

    // Handle single term
    return await this.select({
      pagination: { page: params.page, pageSize: params.pageSize },
      search: { terms: [params.searchTerm], operator: "OR" },
      searchFields,
    });
  }

  async bulkCreateAdvocates(advocates: Advocate[]): Promise<Advocate[]> {
    return await this.insert(advocates);
  }
}
