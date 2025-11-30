import { nanoid } from "nanoid";

export const mainPages = [
  {
    id: nanoid(),
    text: "Pharmacies",
    ping: [{ id: nanoid(), linkName: "Pharmacies", link: "/pharmacies" }],
  },  
];
