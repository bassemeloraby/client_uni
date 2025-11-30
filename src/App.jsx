import { HomeLayout, Error,
  Login,
  Register,
  PharmaciesPage,
  CreatePharmacy,
  Landing
 } from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';


// Import loaders and actions directly
import { loader as pharmaciesLoader } from "./pages/Pharmacies/Pharmacies.jsx";

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
