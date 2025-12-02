import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../app/features/auth/authSlice";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="bg-neutral py-2 text-neutral-content">
      <div className="align-element flex justify-center sm:justify-end">
        <div className="flex gap-x-6 justify-center items-center">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <FaUser className="text-sm" />
                <span className="text-xs sm:text-sm">
                  {user.username}
                </span>
                <span className="badge badge-sm badge-primary ml-2">
                  {user.userRole}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="link link-hover text-xs sm:text-sm flex items-center gap-1"
              >
                <FaSignOutAlt />
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="link link-hover text-xs sm:text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
