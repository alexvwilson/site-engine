"use client";

import { AccountInformationCard } from "./AccountInformationCard";

export default function ProfilePageClient() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <AccountInformationCard />
      </div>
    </div>
  );
}
