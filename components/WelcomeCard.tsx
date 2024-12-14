"use client";

import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

import GoogleButton from "./GoogleButton";

import { title } from "@/components/primitives";
import { useAuth } from "@/context/authContext";

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {user === null ? (
        <>
          <div className="inline-block max-w-xl text-center justify-center">
            <span className={title()}>DineScore</span>
          </div>
          <div className="inline-block max-w-xl text-center justify-center">
            <span className={title()}>
              Heeeeey! LogIn to save your scores!{" "}
            </span>
          </div>

          <GoogleButton />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center max-w-xl text-center">
          <Avatar
            className="w-30 h-30 mb-5"
            size="lg"
            src={user.photoURL || undefined}
          />
          <span className={title()}>
            👋 Welcome back, {user.displayName || "User"}!
          </span>

          <Button
            className="mt-5"
            onPress={() => router.push("/start-session")}
          >
            Start a New Session
          </Button>
        </div>
      )}
    </section>
  );
}
