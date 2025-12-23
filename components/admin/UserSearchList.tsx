"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { searchUsers } from "@/app/actions/admin";
import type { UserListItem } from "@/lib/admin";

export function UserSearchList() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Debounced search function
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchUsers(
        searchQuery || undefined,
        20,
        0,
      );
      if (result.success && result.users) {
        setUsers(result.users.users);
        setTotal(result.users.total);
      } else {
        console.error("Failed to search users:", result.error);
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Trigger search on mount and when filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Search and view user details ({total} total users)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No users found matching your search.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.fullName || "-"}</TableCell>
                    <TableCell>
                      {new Date(user.joinedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results count */}
        {users.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {users.length} of {total} users
          </div>
        )}
      </CardContent>
    </Card>
  );
}
