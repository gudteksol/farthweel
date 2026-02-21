export const metadata = {
  title: "FARTWHEEL",
  description: "The Solana Wallet Gas Detector",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
