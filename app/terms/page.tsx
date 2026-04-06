import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-prose px-6 py-24 text-[#121110]">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-500 hover:text-[#FF8A65] transition-colors"
      >
        ← Back to home
      </Link>
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-zinc-600 leading-relaxed">
        We are preparing the full terms of service for this product. If you
        have questions before they are published, contact us through the
        channels listed on the marketing site.
      </p>
    </main>
  );
}
