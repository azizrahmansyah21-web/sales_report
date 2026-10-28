"use client";

import React from "react";
import { signOut } from "next-auth/react";
import Button from "@/components/atoms/Button";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      leftIcon={<LogOut className="w-4 h-4" />}
    >
      Keluar Akun
    </Button>
  );
}

