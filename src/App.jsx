import {
  HomeLayout,
  Error,
  Login,
  PharmaciesPage,
  CreatePharmacy,
  EditPharmacy,
  SinglePharmacy,
  PharmacyReports,
  PharmacyAssignments,
  UsersPage,
  CreateUser,
  EditUser,
  SingleUser,
  IncentiveItemsPage,
  InsuranceItemsPage,
  ContestsPage,
  HeaderSalesPage,
  SalesByMonthPage,
  CashSalesPage,
  InsurancePage,
  WasfatyPage,
  OnlinePage,
  VisitsPage,
  BabyJoyPage,
  Landing,
} from "./pages";

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminOrSupervisorRoute from './components/AdminOrSupervisorRoute';
import PageAccessRoute from './components/PageAccessRoute';


// Import loaders and actions directly
import { loader as pharmaciesLoader } from "./pages/Pharmacies/Pharmacies.jsx";
import { loader as singlePharmacyLoader } from "./pages/Pharmacies/SinglePharmacy.jsx";
import { loader as editPharmacyLoader } from "./pages/Pharmacies/EditPharmacy.jsx";
import { loader as pharmacyReportsLoader } from "./pages/Pharmacies/PharmacyReports.jsx";
import { loader as pharmacyAssignmentsLoader } from "./pages/Pharmacies/PharmacyAssignments.jsx";
import { loader as usersLoader } from "./pages/Users/Users.jsx";
import { loader as singleUserLoader } from "./pages/Users/SingleUser.jsx";
import { loader as editUserLoader } from "./pages/Users/EditUser.jsx";
import { loader as incentiveItemsLoader } from "./pages/IncentiveItems/IncentiveItems.jsx";
import { loader as insuranceItemsLoader } from "./pages/InsuranceItems/InsuranceItems.jsx";
import { loader as contestsLoader } from "./pages/Contests/Contests.jsx";
import { loader as headerSalesLoader } from "./pages/HeaderSales/HeaderSales.jsx";
import { loader as salesByMonthLoader } from "./pages/HeaderSales/SalesByMonth.jsx";
import { loader as cashSalesLoader } from "./pages/HeaderSales/CashSales.jsx";
import { loader as insuranceLoader } from "./pages/HeaderSales/Insurance.jsx";
import { loader as wasfatyLoader } from "./pages/HeaderSales/Wasfaty.jsx";
import { loader as onlineLoader } from "./pages/HeaderSales/Online.jsx";
import { loader as visitsLoader } from "./pages/Visits/Visits.jsx";
import { loader as babyJoyLoader } from "./pages/BabyJoy/BabyJoy.jsx";

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
        <AdminRoute>
          <CreatePharmacy />
        </AdminRoute>
      ),
    },
    {
      path: "pharmacies/:id/edit",
      element: (
        <AdminRoute>
          <EditPharmacy />
        </AdminRoute>
      ),
      loader: editPharmacyLoader,
    },
    {
      path: "pharmacies/:id/reports",
      element: (
        <ProtectedRoute>
          <PharmacyReports />
        </ProtectedRoute>
      ),
      loader: pharmacyReportsLoader,
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
      path: "pharmacies/assignments",
      element: (
        <AdminRoute>
          <PharmacyAssignments />
        </AdminRoute>
      ),
      loader: pharmacyAssignmentsLoader,
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
    {
      path: "incentive-items",
      element: (
        <PageAccessRoute>
          <IncentiveItemsPage />
        </PageAccessRoute>
      ),
      loader: incentiveItemsLoader,
    },
    {
      path: "insurance-items",
      element: (
        <PageAccessRoute>
          <InsuranceItemsPage />
        </PageAccessRoute>
      ),
      loader: insuranceItemsLoader,
    },
    {
      path: "contests",
      element: (
        <PageAccessRoute>
          <ContestsPage />
        </PageAccessRoute>
      ),
      loader: contestsLoader,
    },
    {
      path: "header-sales",
      element: (
        <PageAccessRoute>
          <HeaderSalesPage />
        </PageAccessRoute>
      ),
      loader: headerSalesLoader,
    },
    {
      path: "header-sales/by-month",
      element: (
        <PageAccessRoute>
          <SalesByMonthPage />
        </PageAccessRoute>
      ),
      loader: salesByMonthLoader,
    },
    {
      path: "cash-sales",
      element: (
        <PageAccessRoute>
          <CashSalesPage />
        </PageAccessRoute>
      ),
      loader: cashSalesLoader,
    },
    {
      path: "insurance",
      element: (
        <PageAccessRoute>
          <InsurancePage />
        </PageAccessRoute>
      ),
      loader: insuranceLoader,
    },
    {
      path: "wasfaty",
      element: (
        <PageAccessRoute>
          <WasfatyPage />
        </PageAccessRoute>
      ),
      loader: wasfatyLoader,
    },
    {
      path: "online",
      element: (
        <PageAccessRoute>
          <OnlinePage />
        </PageAccessRoute>
      ),
      loader: onlineLoader,
    },
    {
      path: "visits",
      element: (
        <AdminRoute>
          <VisitsPage />
        </AdminRoute>
      ),
      loader: visitsLoader,
    },
    {
      path: "baby-joy",
      element: (
        <PageAccessRoute>
          <BabyJoyPage />
        </PageAccessRoute>
      ),
      loader: babyJoyLoader,
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
