import { AdvocateService } from "@/db/AdvocateService";
import { Advocate } from "./types";

export interface PaginationMetadata {
  totalAdvocates: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedResponse {
  data: Advocate[];
  meta: PaginationMetadata;
}

const validatePaginationParams = (page: number, pageSize: number): boolean => {
  return page > 0 && pageSize > 0 && Number.isInteger(page) && Number.isInteger(pageSize);
};

export async function GET(request: Request): Promise<Response> {
  const advocateService = new AdvocateService();

  const url = new URL(request.url);
  const page: number = parseInt(url.searchParams.get("page") || "1");
  const pageSize: number = parseInt(url.searchParams.get("pageSize") || "10");
  const searchTerm: string | null = url.searchParams.get("searchTerm");

  if (!validatePaginationParams(page, pageSize)) {
    return new Response(
      JSON.stringify({
        error: "Invalid pagination parameters. Page and pageSize must be positive integers.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { data, total } = await advocateService.getAllAdvocates({
    page,
    pageSize,
    searchTerm: searchTerm || undefined,
  });

  const responsePayload: PaginatedResponse = {
    data,
    meta: {
      totalAdvocates: total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      pageSize,
    },
  };

  return new Response(JSON.stringify(responsePayload), {
    headers: { "Content-Type": "application/json" },
  });
}
