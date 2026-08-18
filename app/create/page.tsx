"use client";

import { useState } from "react";
import UploadMedia from "@/components/UploadMedia";

export default function CreatePage() {
  type CreateTab = "TEXT" | "MEDIA" | "AUDIO";

  const [tab, setTab] = useState<CreateTab>("TEXT");

  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");

  const [bodyText, setBodyText] = useState("");

  const [loading, setLoading] = useState(false);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData();

    if (tab === "TEXT") {
      formData.append("postType", "TEXT");
    }

    if (tab === "MEDIA") {
      if (file?.type.startsWith("image/")) {
        formData.append("postType", "IMAGE");
      } else if (file?.type.startsWith("video/")) {
        formData.append("postType", "VIDEO");
      }
    }

    if (tab === "AUDIO") {
      formData.append("postType", "AUDIO");
    }

    formData.append("title", title);

    if (bodyText) {
      formData.append("bodyText", bodyText);
    }

    if (file) {
      formData.append("file", file);
    }

    const res = await fetch("/api/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    alert(data.message);

    setTab("TEXT");
    setFile(null);
    setTitle("");
    setBodyText("");

    setLoading(false);
  }

  return (
   <div className="max-w-5xl mx-auto px-6 py-10">

    <div className="grid lg:grid-cols-3 gap-8">

      <div className="lg:sticky lg:top-24 h-fit">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h1 className="text-4xl font-bold text-white">

            Create Post

          </h1>

          <p className="text-zinc-400 mt-3 leading-7">

            Share your ideas, images, videos or audio
            with the Murmur community.

          </p>

          <div className="mt-10 space-y-3">

            <button
              onClick={() => setTab("TEXT")}
              className={`w-full rounded-xl p-4 transition ${
                tab === "TEXT"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              📝 Text Post
            </button>

            <button
              onClick={() => setTab("MEDIA")}
              className={`w-full rounded-xl p-4 transition ${
                tab === "MEDIA"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              🖼️ Image / Video
            </button>

            <button
              onClick={() => setTab("AUDIO")}
              className={`w-full rounded-xl p-4 transition ${
                tab === "AUDIO"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              🎵 Audio
            </button>

          </div>

        </div>

      </div>

      <div className="lg:col-span-2">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <div className="space-y-8">

            <div>

              <label className="block text-zinc-300 mb-3">

                Title

              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

            </div>

            <div>

              <label className="block text-zinc-300 mb-3">

                Description

              </label>

              <textarea
                rows={10}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Tell everyone what's on your mind..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white resize-none outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

            </div>

            {(tab === "MEDIA" || tab === "AUDIO") && (

              <div>

                <label className="block text-zinc-300 mb-3">

                  Upload

                </label>

                <UploadMedia
                  accept={
                    tab === "MEDIA"
                      ? "image/*,video/*"
                      : "audio/*"
                  }
                  onFileSelect={setFile}
                />

                {file && (

                  <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950 p-4">

                    <div className="text-white font-medium">

                      {file.name}

                    </div>

                    <div className="text-zinc-500 text-sm mt-1">

                      {(file.size / 1024 / 1024).toFixed(2)} MB

                    </div>

                  </div>

                )}

              </div>

            )}

            <div className="flex justify-end">

              <button
                disabled={loading}
                onClick={handlePost}
                className="bg-white text-black font-semibold px-10 py-3 rounded-xl transition hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
              >

                {loading
                  ? "Posting..."
                  : "Create Post"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
  );
}