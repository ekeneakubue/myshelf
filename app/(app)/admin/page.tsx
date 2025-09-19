export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <div className="text-sm text-black/60 dark:text-white/70 mb-1">Companies</div>
          <div className="text-3xl font-semibold">—</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <div className="text-sm text-black/60 dark:text-white/70 mb-1">Users</div>
          <div className="text-3xl font-semibold">—</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <div className="text-sm text-black/60 dark:text-white/70 mb-1">Documents</div>
          <div className="text-3xl font-semibold">—</div>
        </div>
      </div>
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm">
        Use the demo credentials from the README to sign in as admin.
      </div>
    </div>
  );
}


