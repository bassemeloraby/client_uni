import { HomeLayout, Error } from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';


const router = createBrowserRouter([{
  path: "/",
  element: <HomeLayout />,
  errorElement: <Error />,
}]);



const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
