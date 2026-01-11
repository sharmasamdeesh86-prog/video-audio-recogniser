export const runtime = "nodejs";

/**
 * MVP identify endpoint:
 * - Accepts FormData with "clip" Blob
 * - Returns a placeholder match (so the app is fully functional end-to-end)
 *
 * Next step: replace the placeholder with real fingerprint/embedding lookup.
 */
export async function POST(req) {
  try {
    const form = await req.formData();
    const clip = form.get("clip");

    if (!clip) {
      return Response.json({ error: 'Missing "clip" file' }, { status: 400 });
    }

    // We are NOT storing raw audio. This MVP just confirms receipt.
    const size = clip.size ?? 0;

    // Placeholder logic (replace later with real matching)
    const match = size > 2000; // silly threshold so you can see both outcomes

    if (!match) {
      return Response.json({ match: false, confidence: 0.12 }, { status: 200 });
    }

    return Response.json(
      {
        match: true,
        confidence: 0.72,
        title: "Example match (placeholder)",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=0",
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
