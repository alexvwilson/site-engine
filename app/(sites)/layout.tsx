/**
 * Layout for published user sites.
 * This route group does NOT include the main app's navbar/footer.
 * Published sites render their own content with their own theme.
 */
export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
