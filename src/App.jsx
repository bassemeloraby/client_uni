import { HomeLayout, Error,
  Login,
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
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';


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
      element: (
        <ProtectedRoute>
          <PharmaciesPage />
        </ProtectedRoute>
      ),
      loader: pharmaciesLoader,
    },
    {
      path: "pharmacies/create",
      element: (
        <ProtectedRoute>
          <CreatePharmacy />
        </ProtectedRoute>
      ),
    },
    {
      path: "pharmacies/:id/edit",
      element: (
        <ProtectedRoute>
          <EditPharmacy />
        </ProtectedRoute>
      ),
      loader: editPharmacyLoader,
    },
    {
      path: "pharmacies/:id",
      element: (
        <ProtectedRoute>
          <SinglePharmacy />
        </ProtectedRoute>
      ),
      loader: singlePharmacyLoader,
    },
    {
      path: "users",
      element: (
        <AdminRoute>
          <UsersPage />
        </AdminRoute>
      ),
      loader: usersLoader,
    },
    {
      path: "users/create",
      element: (
        <AdminRoute>
          <CreateUser />
        </AdminRoute>
      ),
    },
    {
      path: "users/:id/edit",
      element: (
        <AdminRoute>
          <EditUser />
        </AdminRoute>
      ),
      loader: editUserLoader,
    },
    {
      path: "users/:id",
      element: (
        <AdminRoute>
          <SingleUser />
        </AdminRoute>
      ),
      loader: singleUserLoader,
    },
  ],
},
{
  path: "/login",
  element: <Login />,
  errorElement: <Error />,
}
]);



const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
