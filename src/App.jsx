import { HomeLayout, Error,
  Login,
  Register,
  Pharmacies,
  Landing
 } from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';


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
      element: <Pharmacies />,
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
