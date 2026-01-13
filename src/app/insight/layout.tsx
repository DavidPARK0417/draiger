export default function InsightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인사이트 페이지에서는 Header를 표시하지 않음 (Navbar 사용)
  return <>{children}</>;
}

