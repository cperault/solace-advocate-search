import { SQL } from "drizzle-orm";
import { PgInsertBuilder, PgSelectBuilder } from "drizzle-orm/pg-core";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type DatabaseClient = PostgresJsDatabase & {
  select: <T extends object>(
    table: T
  ) => PgSelectBuilder<any, any> & {
    from: (table: T) => {
      where: (condition: SQL<unknown>) => PgSelectBuilder<any, any>;
      limit: (limit: number) => PgSelectBuilder<any, any>;
      offset: (offset: number) => PgSelectBuilder<any, any>;
    };
  };
  insert: <T extends object>(
    table: T
  ) => PgInsertBuilder<any, any> & {
    values: (values: Partial<T>[]) => {
      returning: () => Promise<T[]>;
    };
  };
};

export const setup = (): DatabaseClient | null => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return null;
  }

  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient) as DatabaseClient;

  return db;
};
