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
      <main className="container py-8 max-w-4xl">
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display">
                Search Results
              </h2>
              <p className="text-sm text-muted-foreground">
                {searchMutation.data.results.length} resources found
              </p>
            </div>

            {/* AI-Generated Explanation */}
            {searchMutation.data.explanation && (
              <Card className="p-5 bg-primary/5 border-primary/20">
                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-primary mb-2">
                      About {searchMutation.data.query.court}
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {searchMutation.data.explanation}
                    </p>
                  </div>
                </div>
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
              <div className="space-y-8">
                {searchMutation.data.results.map((category: any, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground uppercase tracking-wide">
                      {category.category}
                    </h3>
                    <div className="grid gap-4">
                      {category.links.map((link: any, linkIdx: number) => (
                        <Card key={linkIdx} className="p-5 hover:shadow-md transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="font-medium text-foreground leading-tight flex-1">
                                {link.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="shrink-0"
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {link.description}
                            </p>
                            {link.context && (
                              <p className="text-xs text-muted-foreground italic">
                                {link.context}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <p className="text-xs font-mono text-muted-foreground break-all flex-1">
                                {link.url}
                              </p>
                              {link.verifiedDate && (
                                <p className="text-xs text-muted-foreground shrink-0">
                                  Verified {new Date(link.verifiedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Card className="p-4 bg-muted/50">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> All links are to official court website pages. 
                Please verify information is current before relying on it.
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
