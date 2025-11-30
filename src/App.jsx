import { HomeLayout, Error,
  Login,
  Register
 } from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';


const router = createBrowserRouter([{
  path: "/",
  element: <HomeLayout />,
  errorElement: <Error />,
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
