"use client";

import { signInWithPopup } from "firebase/auth";
import { Button } from "@nextui-org/button";

import { auth, googleProvider } from "@/firebase/firebaseConfig";

export default function GoogleButton() {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User signed in:", result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return <Button onPress={handleGoogleSignIn}>Sign in with Google</Button>;
}
