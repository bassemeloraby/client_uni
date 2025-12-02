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
  {
    id: nanoid(),
    text: "Sales",
    ping: [{ id: nanoid(), linkName: "Detailed Sales", link: "/detailed-sales" }],
  },  
 {
  id: nanoid(),
  text: "Settings",
  ping: [{ id: nanoid(), linkName: "Users", link: "/users" }],
 },
];
