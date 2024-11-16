"use client";
import { Card } from "@/components/global/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { FC, useState } from "react";

interface AccountSettingsContentProps {
  discordId: string;
}

export const AccountSettingsContent: FC<AccountSettingsContentProps> = ({
  discordId: initialDiscordId,
}) => {
  const [discordId, setDiscordId] = useState<string>(initialDiscordId);
  const { mutate, isPending } = useMutation({
    mutationFn: async (discordId: string) => {
      const res = await client.project.setDiscordID.$post({ discordId });
      return await res.json();
    },
  });
  return (
    <Card className="max-w-xl w-full space-y-4">
      <div className="pt-2">
        <Label>Discord ID</Label>
        <Input
          className="mt-1"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          placeholder="Enter your Discord ID"
        />
      </div>

      <p className="mt-2 text-sm/6 text-gray-600">
        Don't know how to find your Discord ID?{" "}
        <Link href="#" className="text-brand-600 hover:text-brand-500">
          Learn how to obtain it here
        </Link>
        .
      </p>

      <div className="pt-4">
        <Button onClick={() => mutate(discordId)} disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
};
