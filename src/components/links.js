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
      { id: nanoid(), linkName: "Detailed Sales", link: "/detailed-sales" },
      { id: nanoid(), linkName: "Cash Page", link: "/cash" },
      { id: nanoid(), linkName: "Insurance", link: "/insurance" },
      { id: nanoid(), linkName: "Incentive Items", link: "/incentive-items" },
      { id: nanoid(), linkName: "Contests", link: "/contests" },
    ],
  },  
 {
  id: nanoid(),
  text: "Settings",
  ping: [{ id: nanoid(), linkName: "Users", link: "/users" }],
 },
];
