import Link from "next/link";

export default function Home() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(59,130,246,0.25),transparent),linear-gradient(180deg,rgba(0,0,0,0.04),transparent)] dark:bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(29,78,216,0.35),transparent),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
        <div
          className="absolute inset-0 opacity-10 dark:opacity-15"
          style={{
            backgroundImage: "url('/file.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-28 sm:py-36">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Transform PDFs into searchable, structured knowledge
          </h1>
          <p className="text-base sm:text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Digitalization converts paper and static PDFs into machine-readable text and metadata using OCR,
            tagging, and annotation. Search instantly, organize with tags, and collaborate with your team.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black px-5 text-sm font-medium shadow-sm hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
