import { AdvocateService } from "@/db/AdvocateService";
import { Advocate } from "@/app/api/advocates/types";

interface BulkInsertResponse {
  advocates: Advocate[];
}

export async function POST(request: Request): Promise<Response> {
  const data = (await request.json()) as Advocate;

  const advocateService = new AdvocateService();
  const records: Advocate[] = await advocateService.bulkCreateAdvocates([data]);

  const responsePayload: BulkInsertResponse = { advocates: records };

  return new Response(JSON.stringify(responsePayload), {
    headers: { "Content-Type": "application/json" },
  });
}
