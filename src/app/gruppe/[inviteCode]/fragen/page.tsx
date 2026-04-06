"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FragenRedirect({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/gruppe/${inviteCode}`);
  }, [inviteCode, router]);

  return null;
}
