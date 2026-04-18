import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const getRequestUser = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await client.auth.getUser(token);
  return data.user ?? null;
};
