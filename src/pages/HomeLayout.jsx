import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { Header, Navbar } from "../components";

const HomeLayout = () => {
  return (
    <Fragment>
      <Header />
      <Navbar />
      <section className="align-element">
        <Outlet />
      </section>
    </Fragment>

  );
};
export default HomeLayout;
