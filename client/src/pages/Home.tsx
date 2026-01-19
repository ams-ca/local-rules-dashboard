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
import { ExternalLink, Loader2, Scale, Search } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [court, setCourt] = useState("");

  const searchMutation = trpc.search.findRules.useMutation();
  const { data: supportedCourts, isLoading: courtsLoading } = trpc.search.getSupportedCourts.useQuery();

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
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-display text-primary">
              Federal Court Rules Search
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Find local rules, standing orders, and judge procedures from federal court websites
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-5xl">
        {/* Search Form */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="court">Court *</Label>
              <Select value={court} onValueChange={setCourt}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a federal district court" />
                </SelectTrigger>
                <SelectContent>
                  {courtsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading courts...
                    </SelectItem>
                  ) : (
                    supportedCourts?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.circuit})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {supportedCourts?.length || 0} courts currently supported
              </p>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!court.trim() || searchMutation.isPending}
              className="w-full h-11"
              size="lg"
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching court website...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {searchMutation.isError && (
          <Card className="p-6 border-destructive">
            <p className="text-destructive font-medium">Error</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchMutation.error.message}
            </p>
          </Card>
        )}

        {searchMutation.isSuccess && searchMutation.data && (
          <div className="space-y-6">
            {/* AI-Generated Explanation */}
            {searchMutation.data.explanation && (
              <Card className="p-5 bg-primary/5 border-primary/20">
                <p className="text-sm text-foreground leading-relaxed">
                  {searchMutation.data.explanation}
                </p>
              </Card>
            )}

            {searchMutation.data.results.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-display mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check the court name
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {searchMutation.data.results
                  .filter((category: any) => category.links && category.links.length > 0)
                  .map((category: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-primary/10 px-5 py-3 border-b border-border">
                      <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
                        {category.category}
                      </h3>
                    </div>
                    
                    {/* Links Table */}
                    <div className="bg-card">
                      {category.links.map((link: any, linkIdx: number) => (
                        <div 
                          key={linkIdx} 
                          className={`px-5 py-4 ${linkIdx !== category.links.length - 1 ? 'border-b border-border' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-baseline gap-2">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium inline-flex items-center gap-1.5"
                                >
                                  {link.title}
                                  <ExternalLink className="h-3.5 w-3.5 inline" />
                                </a>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {link.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                <span className="font-mono">{link.url}</span>
                                {link.verifiedDate && (
                                  <span className="shrink-0">
                                    Verified {new Date(link.verifiedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-4">
              <strong>Note:</strong> All links are to official court website pages. 
              Please verify information is current before relying on it.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
