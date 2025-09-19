import Link from "next/link";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] grid-rows-[56px_1fr]">
      <aside className="row-span-2 bg-[--background] border-r border-black/10 dark:border-white/10 p-4 hidden sm:block">
        <div className="mb-6 font-semibold">MyShelf</div>
        <nav className="flex flex-col gap-2 text-sm">
          <div className="mt-4 border-t pt-4 border-black/10 dark:border-white/10" />
          <Link href="/company/clients" className="hover:underline">Clients</Link>
        </nav>
      </aside>
      <header className="col-start-2 h-[56px] border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4">
        <div className="text-sm text-black/70 dark:text-white/70">Document workspace</div>
        <div className="flex items-center gap-3">
          <input placeholder="Search documents..." className="h-9 px-3 rounded-md bg-black/[.04] dark:bg-white/[.06] outline-none text-sm" />
          <div className="size-8 rounded-full bg-black/10 dark:bg-white/20" />
        </div>
      </header>
      <main className="col-start-2 p-6">{children}</main>
    </div>
  );
}


