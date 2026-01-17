/**
 * Federal Local Rules Dashboard - Home Page
 * Design: Judicial Modernism - Swiss International Style with legal tech aesthetics
 * Color: Deep navy (#1a2332) + Warm amber (#d4a574)
 * Typography: DM Serif Display (display) + Inter (body) + JetBrains Mono (mono)
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, FileText, Gavel, Scale, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Rule {
  title: string;
  rule_type: string;
  category: string;
  effective_date: string;
  source_url: string;
  judge_name: string | null;
  court: string;
}

export default function Home() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ruleTypeFilter, setRuleTypeFilter] = useState<string>("all");
  const [judgeFilter, setJudgeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Load rules data
  useEffect(() => {
    fetch("/ndca_rules.json")
      .then((res) => res.json())
      .then((data: Rule[]) => {
        setRules(data);
        setFilteredRules(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading rules:", err);
        setLoading(false);
      });
  }, []);

  // Filter rules based on search and filters
  useEffect(() => {
    let filtered = rules;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rule) =>
          rule.title.toLowerCase().includes(query) ||
          rule.category.toLowerCase().includes(query) ||
          rule.judge_name?.toLowerCase().includes(query)
      );
    }

    // Apply rule type filter
    if (ruleTypeFilter !== "all") {
      filtered = filtered.filter((rule) => rule.rule_type === ruleTypeFilter);
    }

    // Apply judge filter
    if (judgeFilter !== "all") {
      filtered = filtered.filter((rule) => rule.judge_name === judgeFilter);
    }

    setFilteredRules(filtered);
  }, [searchQuery, ruleTypeFilter, judgeFilter, rules]);

  // Get unique judges for filter
  const judges = Array.from(
    new Set(rules.filter((r) => r.judge_name).map((r) => r.judge_name))
  ).sort() as string[];

  // Get rule type badge color
  const getRuleTypeBadge = (ruleType: string) => {
    switch (ruleType) {
      case "Local Rule":
        return "default";
      case "General Order":
        return "secondary";
      case "Standing Order":
        return "outline";
      default:
        return "default";
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
              Federal Local Rules Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Northern District of California • {rules.length} Rules & Orders
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Search and Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by rule title, category, or judge name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Rule Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rule Types</SelectItem>
                  <SelectItem value="Local Rule">Local Rules</SelectItem>
                  <SelectItem value="General Order">General Orders</SelectItem>
                  <SelectItem value="Standing Order">Standing Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={judgeFilter} onValueChange={setJudgeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Judges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Judges</SelectItem>
                  {judges.map((judge) => (
                    <SelectItem key={judge} value={judge}>
                      {judge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || ruleTypeFilter !== "all" || judgeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRuleTypeFilter("all");
                  setJudgeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              Showing {filteredRules.length} of {rules.length} rules
            </span>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <Card className="p-12 text-center">
            <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-display mb-2">No rules found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRules.map((rule, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                      {rule.title}
                    </h3>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Badge variant={getRuleTypeBadge(rule.rule_type)}>
                        {rule.rule_type}
                      </Badge>
                      <span className="text-muted-foreground">{rule.category}</span>
                      {rule.judge_name && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-foreground font-medium">
                            {rule.judge_name}
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {rule.effective_date}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="shrink-0"
                  >
                    <a
                      href={rule.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View PDF
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Federal Local Rules Dashboard • Prototype for Northern District of California
          </p>
          <p className="mt-2">
            Data sourced from{" "}
            <a
              href="https://cand.uscourts.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              cand.uscourts.gov
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
