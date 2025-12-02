import { HomeLayout, Error,
  Login,
  Register,
  PharmaciesPage,
  CreatePharmacy,
  EditPharmacy,
  SinglePharmacy,
  UsersPage,
  CreateUser,
  EditUser,
  SingleUser,
  Landing
} from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';


// Import loaders and actions directly
import { loader as pharmaciesLoader } from "./pages/Pharmacies/Pharmacies.jsx";
import { loader as singlePharmacyLoader } from "./pages/Pharmacies/SinglePharmacy.jsx";
import { loader as editPharmacyLoader } from "./pages/Pharmacies/EditPharmacy.jsx";
import { loader as usersLoader } from "./pages/Users/Users.jsx";
import { loader as singleUserLoader } from "./pages/Users/SingleUser.jsx";
import { loader as editUserLoader } from "./pages/Users/EditUser.jsx";

const router = createBrowserRouter([{
  path: "/",
  element: <HomeLayout />,
  errorElement: <Error />,
  children: [
    {
      index: true,
      element: <Landing />,
    },
    {
      path: "pharmacies",
      element: <PharmaciesPage />,
      loader: pharmaciesLoader,
    },
    {
      path: "pharmacies/create",
      element: <CreatePharmacy />,
    },
    {
      path: "pharmacies/:id/edit",
      element: <EditPharmacy />,
      loader: editPharmacyLoader,
    },
    {
      path: "pharmacies/:id",
      element: <SinglePharmacy />,
      loader: singlePharmacyLoader,
    },
    {
      path: "users",
      element: <UsersPage />,
      loader: usersLoader,
    },
    {
      path: "users/create",
      element: <CreateUser />,
    },
    {
      path: "users/:id/edit",
      element: <EditUser />,
      loader: editUserLoader,
    },
    {
      path: "users/:id",
      element: <SingleUser />,
      loader: singleUserLoader,
    },
  ],
},
{
  path: "/login",
  element: <Login />,
  errorElement: <Error />,
},
{
  path: "/register",
  element: <Register />,
  errorElement: <Error />,
}
]);



const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
