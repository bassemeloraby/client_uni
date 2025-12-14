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
    ping: [
      { id: nanoid(), linkName: "Pharmacies", link: "/pharmacies" },
      { id: nanoid(), linkName: "Assignments", link: "/pharmacies/assignments" },
    ],
  },
  {
    id: nanoid(),
    text: "Sales",
    ping: [
      { id: nanoid(), linkName: "Incentive Items", link: "/incentive-items" },
      { id: nanoid(), linkName: "Contests", link: "/contests" },
      { id: nanoid(), linkName: "Header Sales", link: "/header-sales" },
    ],
  },  
 {
  id: nanoid(),
  text: "Settings",
  ping: [{ id: nanoid(), linkName: "Users", link: "/users" }],
 },
];
