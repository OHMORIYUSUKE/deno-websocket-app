import { User } from "../../types/user.ts";
import { kv } from "../../utils/kv.ts";
import { corsHeaders } from "../utils/corsHeader.ts";

export async function createUser(req: Request) {
  if (req.method === "GET") {
    const userId = crypto.randomUUID();

    await kv.set(["users", userId], {
      id: userId,
      createdAt: new Date(),
    } as User);

    return new Response(JSON.stringify({ userId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
