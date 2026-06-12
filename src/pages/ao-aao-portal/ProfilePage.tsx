import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SessionUser = {
  fullName?: string;
  phone?: string;
  gmail?: string;
  category?: string;
  university?: string;
};

const SESSION_KEY = "agri_session";

export default function ProfilePage() {
  const [profile, setProfile] = useState<SessionUser>({});

  useEffect(() => {
    const session = readSession();
    if (session?.user && typeof session.user === "object") {
      setProfile(session.user as SessionUser);
    }
  }, []);

  return (
    <div className="max-w-xl font-sans text-left space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account details.</p>
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Full name</Label>
          <Input
            value={profile.fullName ?? ""}
            onChange={(e) => setProfile((current) => ({ ...current, fullName: e.target.value }))}
            className="bg-white border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mobile number</Label>
          <Input value={profile.phone ?? ""} disabled className="bg-gray-50 border cursor-not-allowed" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Gmail</Label>
          <Input
            value={profile.gmail ?? ""}
            onChange={(e) => setProfile((current) => ({ ...current, gmail: e.target.value }))}
            className="bg-white border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Input
            value={profile.category ?? ""}
            onChange={(e) => setProfile((current) => ({ ...current, category: e.target.value }))}
            className="bg-white border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">University</Label>
          <Input
            value={profile.university ?? ""}
            onChange={(e) => setProfile((current) => ({ ...current, university: e.target.value }))}
            className="bg-white border"
          />
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl" disabled>
          Save changes
        </Button>
      </div>
    </div>
  );
}

function readSession(): { token: string; user?: unknown } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string; user?: unknown };
  } catch {
    return null;
  }
}
