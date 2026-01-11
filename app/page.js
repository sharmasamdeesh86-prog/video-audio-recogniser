"use client";

import { useRef, useState } from "react";

export default function Home() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  async function startRecording() {
    setResult(null);
    setStatus("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : undefined,
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop mic tracks to release microphone
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        await identifyClip(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setStatus("Recording… (tap stop after 3–10 seconds)");
    } catch (err) {
      console.error(err);
      setStatus("Microphone permission blocked. Enable mic access in Safari settings and try again.");
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setStatus("Uploading clip…");
  }

  async function identifyClip(blob) {
    try {
      const fd = new FormData();
      fd.append("clip", blob, "clip.webm");

      // For now we call our Vercel API route (Step 2).
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Identify failed.");
        return;
      }

      setResult(data);
      setStatus(data?.match ? "Match found ✅" : "No confident match.");
    } catch (err) {
      console.error(err);
      setStatus("Network error calling identify API.");
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>🎵 Video Audio Recogniser</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Record 3–10 seconds. We’ll return the best YouTube match + link.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {!isRecording ? (
          <button onClick={startRecording} style={btn()}>
            🎙 Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={btn({ danger: true })}>
            ⏹ Stop
          </button>
        )}
      </div>

      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}

      {result ? (
        <div style={card()}>
          <h3 style={{ marginTop: 0 }}>Result</h3>

          <p style={{ margin: "8px 0" }}>
            <b>Confidence:</b> {result.confidence ?? "—"}
          </p>

          {result.match ? (
            <>
              <p style={{ margin: "8px 0" }}>
                <b>Title:</b> {result.title}
              </p>
              <p style={{ margin: "8px 0" }}>
                <b>URL:</b>{" "}
                <a href={result.url} target="_blank" rel="noreferrer">
                  Open in YouTube
                </a>
              </p>
            </>
          ) : (
            <p style={{ margin: "8px 0" }}>
              No match. Try a cleaner 8–12 sec clip, higher volume, less noise.
            </p>
          )}
        </div>
      ) : null}

      <p style={{ marginTop: 28, fontSize: 14, opacity: 0.75 }}>
        Note: This MVP uses a placeholder matching API. Next we’ll connect a real backend.
      </p>
    </main>
  );
}

function btn(opts = {}) {
  return {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: opts.danger ? "#ffeded" : "#f4f4f4",
    fontSize: 16,
  };
}

function card() {
  return {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
  };
}