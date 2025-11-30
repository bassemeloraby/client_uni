import { nanoid } from "nanoid";

export const mainPages = [
  {
    id: nanoid(),
    text: "Home",
    ping: [{ id: nanoid(), linkName: "Home", link: "/" }],
  },
  {
    id: nanoid(),
    text: "Pharmacies",
    ping: [{ id: nanoid(), linkName: "Pharmacies", link: "/pharmacies" }],
  },  
 
];
