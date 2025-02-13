"use client";

import { signInWithPopup } from "firebase/auth";
import { Button } from "@heroui/button";

import { auth, googleProvider } from "@/firebase/firebaseConfig";

export default function GoogleButton() {
  const handleGoogleSignIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return <Button onPress={handleGoogleSignIn}>Sign in with Google</Button>;
}
