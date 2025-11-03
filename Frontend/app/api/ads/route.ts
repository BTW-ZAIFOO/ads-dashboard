import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type AdRow = {
  id?: number;
  date: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  runrate: number;
};

async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
        }
      },
    },
  });
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 200);
  const offset = Number(searchParams.get("offset") || 0);

  let query = supabase
    .from("ads")
    .select("*", { count: "exact" })
    .order("date", { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const body = (await req.json()) as Partial<AdRow>;

  const payload: Partial<AdRow> = {
    date: body.date,
    campaign_name: body.campaign_name,
    impressions: body.impressions,
    clicks: body.clicks,
    conversions: body.conversions,
    runrate: body.runrate,
  };

  const { data, error } = await supabase
    .from("ads")
    .insert(payload)
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}
