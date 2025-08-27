import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  points: number;
  msBeforeNext: number;
}

const Usage = ({ points, msBeforeNext }: Props) => {
  const { has } = useAuth();
  const hasPremium = has?.({ plan: "pro" });
  return (
    <div className=" flex justify-between rounded-t-xl bg-background border border-b-0 p-2">
      <div className=" text-sm">
        <p>
          {points} {hasPremium ? "" : "free"} credits remaning
        </p>
        <p className=" text-xs text-muted-foreground">
          Reset in{" "}
          {formatDuration(
            intervalToDuration({
              start: new Date(),
              end: new Date(Date.now() + msBeforeNext),
            }),
            { format: ["months", "days", "hours"] }
          )}
        </p>
      </div>
      {!hasPremium && (
        <Button
          className="ml-auto bg-accent"
          asChild
          size={"sm"}
          variant={"ghost"}
        >
          <Link href={"/pricing"}>
            <CrownIcon /> Upgrade
          </Link>
        </Button>
      )}
    </div>
  );
};

export default Usage;
