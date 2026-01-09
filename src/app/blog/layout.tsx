export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 블로그 페이지에서는 Header를 표시하지 않음 (Navbar 사용)
  return <>{children}</>;
}

