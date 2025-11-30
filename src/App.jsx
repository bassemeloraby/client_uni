import { HomeLayout, Error,
  Login,
  Register,
  PharmaciesPage,
  CreatePharmacy,
  EditPharmacy,
  SinglePharmacy,
  Landing
 } from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';


// Import loaders and actions directly
import { loader as pharmaciesLoader } from "./pages/Pharmacies/Pharmacies.jsx";
import { loader as singlePharmacyLoader } from "./pages/Pharmacies/SinglePharmacy.jsx";
import { loader as editPharmacyLoader } from "./pages/Pharmacies/EditPharmacy.jsx";

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
