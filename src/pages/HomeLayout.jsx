import { Fragment } from "react";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <Fragment>
      <nav>
        <span className="text-4xl text-primary align-element">UNI company</span>
      </nav>
      <Outlet />
    </Fragment>
  );
};
export default HomeLayout;
