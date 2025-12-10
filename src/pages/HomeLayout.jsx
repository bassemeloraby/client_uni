import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { Header, Navbar, Loading } from "../components";
import { useNavigation } from "react-router-dom";

const HomeLayout = () => {

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
