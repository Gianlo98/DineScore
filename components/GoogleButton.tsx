"use client";

import { signInWithPopup } from "firebase/auth";
import { Button } from "@nextui-org/button";

import { auth, googleProvider } from "@/firebase/firebaseConfig";

export default function GoogleButton() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return <Button onPress={handleGoogleSignIn}>Sign in with Google</Button>;
}
