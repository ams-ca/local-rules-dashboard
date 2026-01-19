/**
 * Admin Review Page
 * Review and approve AI-discovered URLs before adding to production
 */

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminReview() {
  const { data: pendingUrls, isLoading, refetch } = trpc.admin.getPendingUrls.useQuery();
  const approveMutation = trpc.admin.approvePendingUrl.useMutation();
  const rejectMutation = trpc.admin.rejectPendingUrl.useMutation();

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("URL approved and added to database");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve URL");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("URL rejected");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject URL");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-primary mb-2">
                Review AI-Discovered URLs
              </h1>
              <p className="text-muted-foreground text-sm">
                {pendingUrls?.length || 0} URLs awaiting review
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {!pendingUrls || pendingUrls.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No pending URLs to review. Run AI research on a court to discover new URLs.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingUrls.map((url) => (
              <Card key={url.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{url.title}</h3>
                      <Badge variant="secondary">{url.category}</Badge>
                      {url.confidenceScore && (
                        <Badge
                          variant={
                            url.confidenceScore >= 80
                              ? "default"
                              : url.confidenceScore >= 60
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {url.confidenceScore}% confidence
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Court:</span>{" "}
                        <span className="text-muted-foreground">{url.courtName}</span>
                      </div>
                      <div>
                        <span className="font-medium">URL:</span>{" "}
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {url.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {url.description && (
                        <div>
                          <span className="font-medium">Description:</span>{" "}
                          <span className="text-muted-foreground">{url.description}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Discovered:</span>{" "}
                        <span className="text-muted-foreground">
                          {new Date(url.discoveredAt).toLocaleDateString()} by {url.discoveredBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(url.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(url.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
