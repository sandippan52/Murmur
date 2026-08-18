"use client";

import { useState } from "react";

export default function CreateCommunity() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function createCommunity() {
    if (!name.trim()) {
      alert("Community name is required.");
      return;
    }

    if (!monthlyPrice) {
      alert("Please set a monthly subscription price.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          monthlyprice: monthlyPrice,
        }),
      });

      const data = await res.json();

      alert(data.message);

      setName("");
      setDescription("");
      setMonthlyPrice("");
    } catch (err) {
      console.log(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

    <div className="grid lg:grid-cols-3 gap-8">

      <div className="lg:sticky lg:top-24 h-fit">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h1 className="text-4xl font-bold text-white">

            Create Community

          </h1>

          <p className="text-zinc-400 mt-4 leading-7">

            Build your own premium creator community.
            Share exclusive content, earn recurring income
            and grow your audience.

          </p>

          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-3 text-zinc-300">

              <span className="text-xl">🎨</span>

              <span>Choose a unique name</span>

            </div>

            <div className="flex items-center gap-3 text-zinc-300">

              <span className="text-xl">⭐</span>

              <span>Set subscriber pricing</span>

            </div>

            <div className="flex items-center gap-3 text-zinc-300">

              <span className="text-xl">📸</span>

              <span>Share exclusive posts</span>

            </div>

            <div className="flex items-center gap-3 text-zinc-300">

              <span className="text-xl">💰</span>

              <span>Earn every month</span>

            </div>

          </div>

        </div>

      </div>

      <div className="lg:col-span-2">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <div className="space-y-8">

            <div>

              <label className="block text-zinc-300 mb-3">

                Community Name

              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AnimeCartoons"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

            </div>

            <div>

              <label className="block text-zinc-300 mb-3">

                Description

              </label>

              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your community..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white resize-none outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

            </div>

            <div>

              <label className="block text-zinc-300 mb-3">

                Monthly Subscription

              </label>

              <div className="relative">

                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">

                  ₹

                </span>

                <input
                  type="number"
                  min="0"
                  value={monthlyPrice}
                  onChange={(e) =>
                    setMonthlyPrice(e.target.value)
                  }
                  placeholder="199"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-700 py-4 pl-10 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />

              </div>

              <p className="text-zinc-500 text-sm mt-3">

                This amount will be charged monthly from subscribers.

              </p>

            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

              <div className="flex items-center gap-5">

                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white">

                  {name
                    ? name.charAt(0).toUpperCase()
                    : "C"}

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-white">

                    {name || "Community Name"}

                  </h2>

                  <p className="text-zinc-400 mt-1">

                    ₹{monthlyPrice || "0"} / month

                  </p>

                </div>

              </div>

              <p className="text-zinc-400 mt-5 leading-7">

                {description ||
                  "Your community description will appear here."}

              </p>

            </div>

            <div className="flex justify-end">

              <button
                disabled={loading}
                onClick={createCommunity}
                className="bg-white text-black font-semibold px-10 py-3 rounded-xl transition hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
              >

                {loading
                  ? "Creating..."
                  : "Create Community"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
  );
}