import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./supabase";

type AdRow = {
  id?: number;
  date: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  runrate: number;
  spend: number;
};

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/ads", async (req, res) => {
  const limit = Number(req.query.limit ?? 200);
  const offset = Number(req.query.offset ?? 0);

  const { data, error, count } = await supabase
    .from("ads")
    .select("*", { count: "exact" })
    .order("date", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("/ads select error:", error);
    return res.status(500).json({ error: error.message });
  }
  res.json({ data, count });
});

app.post("/ads", async (req, res) => {
  const payload = req.body as Partial<AdRow>;
  const { data, error } = await supabase
    .from("ads")
    .insert(payload)
    .select("*")
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ data });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
