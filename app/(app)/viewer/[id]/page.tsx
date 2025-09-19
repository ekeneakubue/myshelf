type Props = { params: Promise<{ id: string }> };

export default async function ViewerPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Document {id}</h1>
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 text-sm text-black/60 dark:text-white/70">
        Viewer placeholder.
      </div>
    </div>
  );
}


