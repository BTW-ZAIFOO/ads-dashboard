import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* --------------------------------------------------------------------------
  🧩 Type Definition: AdRow
  Defines the shape of each advertisement record from the 'ads' table.
-------------------------------------------------------------------------- */
type AdRow = {
  id?: number;
  date: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  runrate: number;
};

/* --------------------------------------------------------------------------
  🔐 Function: getSupabase
  - Creates a Supabase server client instance with cookie-based session handling.
  - Enables SSR-compatible authentication and API calls within Next.js.
-------------------------------------------------------------------------- */
async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        // Retrieve all cookies from the current request
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Write cookies for Supabase session persistence
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore any cookie write errors silently
        }
      },
    },
  });
}

/* --------------------------------------------------------------------------
  📦 GET Handler
  Fetches advertisement data from the Supabase 'ads' table with pagination.
  - Supports query parameters: `limit` and `offset`
  - Returns JSON with { data, count } or error message
-------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  const { searchParams } = new URL(req.url);

  // Extract query parameters for pagination
  const limit = Number(searchParams.get("limit") || 200);
  const offset = Number(searchParams.get("offset") || 0);

  // Query 'ads' table ordered by date (ascending)
  let query = supabase
    .from("ads")
    .select("*", { count: "exact" })
    .order("date", { ascending: true })
    .range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await query;

  // Handle errors gracefully
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Success response
  return NextResponse.json({ data, count });
}

/* --------------------------------------------------------------------------
  ➕ POST Handler
  Inserts a new ad record into the 'ads' table.
  - Expects a JSON body containing ad details
  - Returns inserted record or validation error
-------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const body = (await req.json()) as Partial<AdRow>;

  // Prepare clean payload for insertion
  const payload: Partial<AdRow> = {
    date: body.date,
    campaign_name: body.campaign_name,
    impressions: body.impressions,
    clicks: body.clicks,
    conversions: body.conversions,
    runrate: body.runrate,
  };

  // Insert record into Supabase
  const { data, error } = await supabase
    .from("ads")
    .insert(payload)
    .select("*")
    .single();

  // Handle validation or DB errors
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Return newly inserted record
  return NextResponse.json({ data }, { status: 201 });
}
