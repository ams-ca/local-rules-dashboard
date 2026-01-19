import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Loader2, Pencil, Trash2, Plus, Check, X, Bot, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    url?: string;
    title?: string;
    description?: string;
  }>({});

  const { data: courtUrls, isLoading, refetch } = trpc.admin.getAllCourtUrls.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const updateMutation = trpc.admin.updateCourtUrl.useMutation({
    onSuccess: () => {
      toast.success("URL updated successfully");
      refetch();
      setEditingId(null);
      setEditForm({});
    },
    onError: (error) => {
      toast.error(`Failed to update URL: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.deleteCourtUrl.useMutation({
    onSuccess: () => {
      toast.success("URL deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete URL: ${error.message}`);
    },
  });

  const handleEdit = (id: number, url: string, title: string, description: string | null) => {
    setEditingId(id);
    setEditForm({ url, title, description: description || "" });
  };

  const handleSave = () => {
    if (editingId === null) return;
    updateMutation.mutate({
      id: editingId,
      ...editForm,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this URL?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-display">Access Denied</h1>
        <p className="text-muted-foreground">You must be an administrator to access this page.</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-primary">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">Manage court URLs and categories</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/review">
                <Button variant="outline">
                  <Bot className="h-4 w-4 mr-2" />
                  Review AI Findings
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Search</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Court</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[150px]">Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[200px]">Description</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courtUrls?.map((courtUrl) => (
                <TableRow key={courtUrl.id}>
                  <TableCell className="font-medium text-sm">{courtUrl.courtName}</TableCell>
                  <TableCell className="text-sm">{courtUrl.category}</TableCell>
                  <TableCell>
                    {editingId === courtUrl.id ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <span className="text-sm">{courtUrl.title}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === courtUrl.id ? (
                      <Input
                        value={editForm.url}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        className="text-sm font-mono"
                      />
                    ) : (
                      <a
                        href={courtUrl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 hover:underline"
                      >
                        {courtUrl.url.length > 50
                          ? courtUrl.url.substring(0, 47) + "..."
                          : courtUrl.url}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === courtUrl.id ? (
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {courtUrl.description && courtUrl.description.length > 50
                          ? courtUrl.description.substring(0, 47) + "..."
                          : courtUrl.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        courtUrl.isActive === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {courtUrl.isActive === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === courtUrl.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEdit(
                              courtUrl.id,
                              courtUrl.url,
                              courtUrl.title,
                              courtUrl.description
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(courtUrl.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
