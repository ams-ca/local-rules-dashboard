/**
 * Federal Court Rules Search Assistant
 * Real-time search tool that queries court websites to find relevant rules and procedures
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Loader2, Scale, Search, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState("");
  const [court, setCourt] = useState("");

  const searchMutation = trpc.search.findRules.useMutation();
  const { data: states, isLoading: statesLoading } = trpc.search.getStates.useQuery();
  const { data: courts, isLoading: courtsLoading } = trpc.search.getCourtsByState.useQuery(
    { state: selectedState },
    { enabled: !!selectedState }
  );

  // Reset court selection when state changes
  useEffect(() => {
    setCourt("");
  }, [selectedState]);

  const handleSearch = () => {
    if (!court.trim()) {
      return;
    }

    searchMutation.mutate({
      court: court.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-display text-primary">
                Local Court Rules Finder
              </h1>
            </div>
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Navigate to local rules, standing orders, and judge procedures from federal court websites.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-5xl">
        {/* Search Form */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* State Selector */}
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Federal">Federal (All Courts)</SelectItem>
                  {statesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading states...
                    </SelectItem>
                  ) : (
                    states?.map((s) => (
                      <SelectItem key={s.state} value={s.state}>
                        {s.stateName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Court Selector - Only show when state is selected */}
            {selectedState && (
              <div className="space-y-2">
                <Label htmlFor="court">Court *</Label>
                <Select value={court} onValueChange={setCourt}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courtsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading courts...
                      </SelectItem>
                    ) : (
                      courts?.map((c) => (
                        <SelectItem key={c.courtId} value={c.courtId}>
                          {c.courtName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {courts?.length || 0} courts in {selectedState === "Federal" ? "all states" : selectedState}
                </p>
              </div>
            )}

            <Button
              onClick={handleSearch}
              disabled={!court || searchMutation.isPending}
              className="w-full h-11"
              size="lg"
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Search Results */}
        {searchMutation.data && (
          <div className="space-y-6">
            {/* AI Explanation */}
            {searchMutation.data.explanation && (
              <Card className="p-6 bg-muted/30">
                <h2 className="text-lg font-semibold mb-3 text-primary">
                  About This Court's Rules
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {searchMutation.data.explanation}
                </p>
              </Card>
            )}

            {/* Results by Category */}
            {searchMutation.data.results
              .filter((category) => category.links.length > 0)
              .map((category) => (
                <div key={category.category} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      {category.category}
                    </h3>
                  </div>
                  <div className="divide-y">
                    {category.links.map((link, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 group"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm group-hover:text-primary transition-colors">
                              {link.title}
                            </div>
                            {link.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {link.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <span className="truncate">{link.url}</span>
                              {link.verifiedDate && (
                                <span className="text-xs text-muted-foreground">
                                  • Verified{" "}
                                  {new Date(link.verifiedDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Error State */}
        {searchMutation.isError && (
          <Card className="p-6 border-destructive">
            <p className="text-sm text-destructive">
              Error: {searchMutation.error.message}
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
