import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { isValidUrl, isValidAlias, generateShortCode, buildShortUrl } from "@/lib/utils";
import type { Link, LinkStats, CreateLinkResult } from "@/types";
import { StatsCards } from "@/components/StatsCards";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinksList } from "@/components/LinksList";
import { Header } from "@/components/Header";

export default function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [stats, setStats] = useState<LinkStats>({ totalLinks: 0, totalClicks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLinks = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("links")
      .select("id, original_url, short_code, custom_alias, is_active, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Failed to load links from the database.");
      return [];
    }

    if (!data || data.length === 0) {
      setLinks([]);
      setStats({ totalLinks: 0, totalClicks: 0 });
      return [];
    }

    // Fetch click counts per link
    const linkIds = data.map((l) => l.id);
    const { data: clickData, error: clickError } = await supabase
      .from("clicks")
      .select("link_id")
      .in("link_id", linkIds);

    if (clickError) {
      setError("Failed to load click data.");
      return [];
    }

    const clickCounts = new Map<string, number>();
    let totalClicks = 0;
    for (const click of clickData || []) {
      const count = (clickCounts.get(click.link_id) || 0) + 1;
      clickCounts.set(click.link_id, count);
      totalClicks++;
    }

    const linksWithCounts: Link[] = data.map((l) => ({
      ...l,
      click_count: clickCounts.get(l.id) || 0,
    }));

    setLinks(linksWithCounts);
    setStats({ totalLinks: linksWithCounts.length, totalClicks });
    setError(null);
    return linksWithCounts;
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchLinks();
      setLoading(false);
    })();
  }, [fetchLinks]);

  const handleCreateLink = useCallback(
    async (url: string, customAlias: string): Promise<CreateLinkResult> => {
      setError(null);

      if (!isValidUrl(url)) {
        return { success: false, error: "Please enter a valid URL starting with http:// or https://" };
      }

      let shortCode = "";

      if (customAlias.trim()) {
        const trimmed = customAlias.trim();
        if (!isValidAlias(trimmed)) {
          return {
            success: false,
            error: "Alias can only contain letters, numbers, hyphens, and underscores",
          };
        }

        // Check for duplicate alias
        const { data: existing } = await supabase
          .from("links")
          .select("id")
          .eq("short_code", trimmed)
          .maybeSingle();

        if (existing) {
          return { success: false, error: "This alias is already taken. Please choose another." };
        }

        shortCode = trimmed;
      } else {
        // Generate unique short code
        let attempts = 0;
        let isUnique = false;
        while (!isUnique && attempts < 10) {
          shortCode = generateShortCode(6);
          const { data: existing } = await supabase
            .from("links")
            .select("id")
            .eq("short_code", shortCode)
            .maybeSingle();
          if (!existing) isUnique = true;
          attempts++;
        }

        if (!isUnique) {
          return { success: false, error: "Could not generate a unique short code. Please try again." };
        }
      }

      const { data: newLink, error: insertError } = await supabase
        .from("links")
        .insert({
          original_url: url,
          short_code: shortCode,
          custom_alias: customAlias.trim() || null,
          is_active: true,
        })
        .select("id, original_url, short_code, custom_alias, is_active, created_at")
        .single();

      if (insertError) {
        return { success: false, error: "Database error: could not save the short link." };
      }

      // Refresh data
      await fetchLinks();

      return {
        success: true,
        link: { ...newLink, click_count: 0 } as Link,
      };
    },
    [fetchLinks]
  );

  const handleToggleActive = useCallback(
    async (linkId: string, currentActive: boolean) => {
      const { error: updateError } = await supabase
        .from("links")
        .update({ is_active: !currentActive })
        .eq("id", linkId);

      if (updateError) {
        setError("Failed to update link status.");
        return;
      }

      await fetchLinks();
    },
    [fetchLinks]
  );

  const handleDeleteLink = useCallback(
    async (linkId: string) => {
      const { error: deleteError } = await supabase.from("links").delete().eq("id", linkId);

      if (deleteError) {
        setError("Failed to delete link.");
        return;
      }

      await fetchLinks();
    },
    [fetchLinks]
  );

  const filteredLinks = searchQuery.trim()
    ? links.filter(
        (l) =>
          l.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.custom_alias || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : links;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 transition-colors">
                Dismiss
              </button>
            </div>
          )}

          <StatsCards stats={stats} loading={loading} />

          <div className="mt-8">
            <CreateLinkForm onCreate={handleCreateLink} buildShortUrl={buildShortUrl} />
          </div>

          <div className="mt-8">
            <LinksList
              links={filteredLinks}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleActive={handleToggleActive}
              onDeleteLink={handleDeleteLink}
              onRefresh={fetchLinks}
              buildShortUrl={buildShortUrl}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
