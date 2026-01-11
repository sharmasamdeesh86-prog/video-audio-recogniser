export const metadata = {
  title: "Video Audio Recogniser",
  description: "Shazam-style app for recognising YouTube video clips",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
