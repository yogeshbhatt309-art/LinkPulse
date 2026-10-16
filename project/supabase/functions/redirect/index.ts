import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Expected route: /functions/v1/redirect/{shortCode}
    const shortCode = pathParts[pathParts.length - 1];

    if (!shortCode) {
      return new Response(JSON.stringify({ error: "Short code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the link by short_code
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, original_url, is_active")
      .eq("short_code", shortCode)
      .maybeSingle();

    if (linkError) {
      return new Response(JSON.stringify({ error: "Database lookup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!link) {
      return new Response(JSON.stringify({ error: "Short link not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!link.is_active) {
      return new Response(JSON.stringify({ error: "This short link is inactive" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record the click event
    const referrer = req.headers.get("referer") || req.headers.get("referrer") || null;
    const { error: clickError } = await supabase.from("clicks").insert({
      link_id: link.id,
      referrer,
    });

    if (clickError) {
      console.error("Failed to record click:", clickError.message);
      // Continue with redirect even if click recording fails
    }

    // Return the original URL for redirect (JSON for client-side handling)
    // Also support direct 302 redirect for browser navigation
    const accept = req.headers.get("accept") || "";
    if (accept.includes("text/html") || accept === "*/*" || accept === "") {
      // Direct browser redirect
      return new Response(null, {
        status: 302,
        headers: {
          Location: link.original_url,
          ...corsHeaders,
        },
      });
    }

    // API response (for fetch calls from the dashboard)
    return new Response(
      JSON.stringify({ original_url: link.original_url, short_code: shortCode }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
