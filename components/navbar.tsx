"use client";
import NextLink from "next/link";
import { Navbar as NextUINavbar, NavbarContent, NavbarBrand, NavbarItem } from "@heroui/navbar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { signOut } from "firebase/auth";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { useAuth } from "@/context/authContext";
import { auth } from "@/firebase/firebaseConfig";

export const Navbar = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit hidden xs:block">DineScore</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        <NavbarItem className="flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        {user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name={user.displayName || "User"}
                size="sm"
                src={user.photoURL || undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" showDivider className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.displayName}</p>
              </DropdownItem>
              <DropdownItem key="session" as="a" className="w-full cursor-pointer" href="/session">
                <span className="font-bold"> Start a new session</span>
              </DropdownItem>
              <DropdownItem
                key="history"
                as="a"
                className="w-full cursor-pointer"
                href="/history"
                showDivider={true}
              >
                <span className="font-bold"> My votes</span>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
};
