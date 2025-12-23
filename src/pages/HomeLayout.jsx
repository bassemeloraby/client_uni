import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { Header, Navbar, Loading } from "../components";
import { useNavigation } from "react-router-dom";
import { useVisitTracker } from "../hooks/useVisitTracker";

const HomeLayout = () => {
  // Track page visits
  useVisitTracker();

  const navigation = useNavigation();
  const isPageLoading = navigation.state === "loading";

  return (
    <Fragment>
      <Header />
      <Navbar />
      {isPageLoading ? (
        <Loading />
      ) : (
        <section className="align-element">
          <Outlet />
        </section>
      )}
    </Fragment>

  );
};
export default HomeLayout;
