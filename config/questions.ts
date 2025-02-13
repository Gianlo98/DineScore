import { GuestVote } from "@/types";

export const QUESTIONS: {
  key: keyof GuestVote;
  question: string;
}[] = [
  { key: "location", question: "Location" },
  { key: "service", question: "Service" },
  { key: "menu", question: "Menu" },
  { key: "bill", question: "Bill" },
  { key: "pizzaDough", question: "Pizza Dough" },
  { key: "ingredients", question: "Ingredients" },
];
