"use client";

import { useState, useTransition } from "react";
import { deleteMediaFile } from "../actions";

interface MediaFile {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

interface MediaLibraryProps {
  files: MediaFile[];
  total: number;
}

export function MediaLibrary({ files, total }: MediaLibraryProps) {
  const [isPending, startTransition] = useTransition();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDelete = (path: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      startTransition(async () => {
        await deleteMediaFile(path);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-2">Storage Information</h3>
        <p className="text-sm text-muted-foreground">Total files: {total}</p>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Size</th>
              <th className="text-left p-3 font-medium">Uploaded</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file) => (
                <tr key={file.id} className="border-t hover:bg-muted/25">
                  <td className="p-3 font-medium">{file.name}</td>
                  <td className="p-3">{formatSize((file.metadata?.size as number) || 0)}</td>
                  <td className="p-3">
                    {file.created_at ? new Date(file.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(file.name)}
                      disabled={isPending}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No media files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
