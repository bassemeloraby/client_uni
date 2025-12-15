import { nanoid } from "nanoid";

export const mainPages = [
  {
    id: nanoid(),
    text: "Home",
    ping: [{ id: nanoid(), linkName: "Home", link: "/" }],
  },
  {
    id: nanoid(),
    text: "Special items",
    ping: [
      { id: nanoid(), linkName: "Incentive", link: "/incentive-items" },
      { id: nanoid(), linkName: "Contest", link: "/contests" },
    ],
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
      { id: nanoid(), linkName: "Header Sales", link: "/header-sales" },
      { id: nanoid(), linkName: "Sales by Month", link: "/header-sales/by-month" },
      { id: nanoid(), linkName: "Cash Sales", link: "/cash-sales" },
      { id: nanoid(), linkName: "Insurance", link: "/insurance" },
      { id: nanoid(), linkName: "Online", link: "/online" },
      { id: nanoid(), linkName: "Wasfaty", link: "/wasfaty" },
    ],
  },  
 {
  id: nanoid(),
  text: "Settings",
  ping: [{ id: nanoid(), linkName: "Users", link: "/users" }],
 },
];
