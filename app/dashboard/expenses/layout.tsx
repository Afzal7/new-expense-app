export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Offset dashboard <main className="... py-6"> so expense UIs are not double-spaced below the app header. */
  return <div className="-mt-6">{children}</div>;
}
