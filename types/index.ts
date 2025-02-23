import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Guest {
  name: string;
  meal: string;
  votes: GuestVote;
  photoURL?: string;
  uid?: string;
}

export interface GuestVote {
  location: number;
  service: number;
  menu: number;
  bill: number;
  pizzaDough: number;
  ingredients: number;
}

export type SessionStatus = "open" | "closed";

export interface Session {
  id?: string;
  date: string;
  name: string;
  placeId?: string;
  numberOfGuests: number;
  guests: Guest[];
  status: SessionStatus;
  results?: {
    location: number;
    service: number;
    menu: number;
    bill: number;
    pizzaDough: number;
    ingredients: number;
  };
}
