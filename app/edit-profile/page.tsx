"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function EditProfilePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [avatar, setAvatar] = useState<File | null>(null);

  const [preview, setPreview] = useState<string>("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getMyData() {
      try {
        const res = await fetch("/api/me");

        const data = await res.json();

        setUsername(data.username);

        setBio(data.bio || "");

        if (data.avatarUrl) {
          setPreview(data.avatarUrl);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    getMyData();
  }, []);

  function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    setAvatar(file);

    setPreview(URL.createObjectURL(file));
  }

  async function saveProfile() {
    if (username.trim() === "") {
      alert("Username cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("username", username);

      formData.append("bio", bio);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await fetch("/api/user/edit", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      router.push(`/user/${data.id}`);

      router.refresh();
    } catch (err) {
      console.log(err);

      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-zinc-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <Card className="p-10 lg:p-12">

        <h1 className="text-4xl font-bold text-white mb-8">

          Edit Profile

        </h1>

        <div className="grid lg:grid-cols-3 gap-10">

          <Avatar
            image={preview}
            username={username}
            size={160}
          />

          <label className="mt-6">

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <span className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-white transition hover:bg-zinc-800">

              Change Profile Picture

            </span>

          </label>

        </div>

        <div className="mt-10">

          <label className="block text-zinc-300 mb-2">

            Username

          </label>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />

        </div>

        <div className="mt-8">

          <label className="block text-zinc-300 mb-2">

            Bio

          </label>

          <textarea
            rows={8}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white resize-none outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            placeholder="Tell people a little about yourself..."
          />

        </div>

        <div className="flex justify-end gap-3 mt-10">

          <Button
            variant="secondary"
            onClick={() => router.back()}
          >

            Cancel

          </Button>

          <Button
            onClick={saveProfile}
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Changes"}

          </Button>

        </div>

      </Card>

    </div>
  );
}