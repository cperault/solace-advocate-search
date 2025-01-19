import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { and, or, ilike, SQL, sql, not } from "drizzle-orm";
import { DatabaseClient, setup } from ".";
import { PostgresType } from "postgres";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SearchParams {
  terms?: string[];
  operator?: "AND" | "OR";
  conditions?: Array<
    | {
        term: string;
        operator: "OR" | "NOT";
      }
    | {
        terms: string[];
        operator: "AND";
      }
  >;
}

export class DatabaseService<T> {
  protected db: PostgresJsDatabase;
  protected table: any;
  protected sql: any;

  constructor(table: any, sql: PostgresType) {
    const db = setup() as DatabaseClient;

    if (!db) {
      throw new Error("Database wasn't initialized.");
    }

    if (!db.select || !db.insert) {
      throw new Error("Database client missing required methods");
    }

    const selectChain = db.select().from(table);

    if (!selectChain.where || !selectChain.limit || !selectChain.offset) {
      throw new Error("Database select missing required methods");
    }

    const insertChain = db.insert(table);

    if (!insertChain.values) {
      throw new Error("Database insert missing required methods");
    }

    this.db = db;
    this.table = table;
    this.sql = sql;
  }

  private buildFieldCondition(field: string, term: string) {
    if (field === "specialties") {
      return sql`${this.table.specialties}::text ILIKE ${`%${term}%`}`;
    }
    return ilike(this.table[field], `%${term}%`);
  }

  private buildSearchCondition(term: string, searchFields: (keyof T)[], isNot = false): SQL<unknown> {
    const fieldConditions = searchFields.map((field) => this.buildFieldCondition(field as string, term));

    const condition = or(...fieldConditions) ?? sql`TRUE`;
    return isNot ? not(condition) : condition;
  }

  private buildWhereClause(search: SearchParams | undefined, searchFields: (keyof T)[]): SQL<unknown> {
    if (!search?.conditions && !search?.terms) {
      return sql`TRUE`;
    }

    const conditions: SQL<unknown>[] = [];

    // Handle simple terms with AND/OR
    if (search.terms) {
      const termConditions = search.terms.map((term) => this.buildSearchCondition(term, searchFields));
      conditions.push(search.operator === "AND" ? and(...termConditions) ?? sql`TRUE` : or(...termConditions) ?? sql`TRUE`);
    }

    // Handle complex conditions (NOT, AND groups)
    if (search.conditions) {
      const conditionClauses = search.conditions.map((condition) => {
        if ("terms" in condition) {
          // Handle AND group
          const termConditions = condition.terms.map((term) => this.buildSearchCondition(term, searchFields));
          return and(...termConditions);
        } else {
          // Handle NOT/OR
          return this.buildSearchCondition(condition.term, searchFields, condition.operator === "NOT");
        }
      });

      // Changed from or to and here - we want all conditions to be satisfied
      conditions.push(and(...conditionClauses) ?? sql`TRUE`);
    }

    // Always combine top-level conditions with AND
    return and(...conditions) ?? sql`TRUE`;
  }

  async select(params: { pagination: PaginationParams; search?: SearchParams; searchFields: (keyof T)[] }): Promise<{ data: T[]; total: number }> {
    try {
      const {
        pagination: { page, pageSize },
        search,
        searchFields,
      } = params;
      const whereClause = this.buildWhereClause(search, searchFields);

      const result = await this.db
        .select({
          data: this.table,
          total: sql<number>`count(*) over()`,
        })
        .from(this.table)
        .where(whereClause)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: result.map((row) => row.data as T),
        total: result[0]?.total ?? 0,
      };
    } finally {
      await this.cleanup();
    }
  }

  async insert(values: T[]): Promise<T[]> {
    try {
      const result = await this.db.insert(this.table).values(values).returning();
      return result as T[];
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.sql.end({ timeout: 5 });
    } catch (error) {
      console.error("Error cleaning up database connection:", error);
    }
  }
}
