import { Fragment, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Offcanvas from "./Offcanvas";
import { RxHamburgerMenu } from "react-icons/rx";
import ToggleTheme from "./ToggleTheme";
import { mainPages } from "./links";
import { useSelector } from "react-redux";
import { FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.userRole?.toLowerCase() === "admin";
  const isSupervisor = user?.userRole?.toLowerCase() === "pharmacy supervisor";
  const [activeSectionId, setActiveSectionId] = useState(null);

  const desktopLinks = useMemo(() => {
    return mainPages
      .filter((section) => {
        // Hide Settings for non-admin users
        if (section.text === "Settings" && !isAdmin) {
          return false;
        }
        // Hide Sales for non-admin users (only admins can access sales now)
        if (section.text === "Sales" && !isAdmin) {
          return false;
        }
        // Hide Pharmacies for non-authenticated users
        if (!user && section.text === "Pharmacies") {
          return false;
        }
        return true;
      })
      .map((section) => ({
        ...section,
        ping: (section.ping || []).filter((link) => {
          // Hide Assignments link for non-admin users
          if (link.linkName === "Assignments" && !isAdmin) {
            return false;
          }
          return true;
        }),
      }));
  }, [isAdmin, isSupervisor, user]);

  const activeSection = useMemo(
    () => desktopLinks.find((section) => section.id === activeSectionId),
    [activeSectionId, desktopLinks]
  );

  const handleSectionToggle = (sectionId) => {
    setActiveSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const handleCloseDropdown = () => setActiveSectionId(null);

  return (
    <Fragment>
      <Offcanvas isOpen={isOpen} setIsOpen={setIsOpen} />
      <nav className="bg-base-200 shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="relative">
          <div className="navbar align-element py-3" onMouseLeave={handleCloseDropdown}>
            <div className="navbar-start flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden"
                onClick={() => setIsOpen(true)}
                aria-label="فتح القائمة"
              >
                <RxHamburgerMenu className="text-2xl cursor-pointer hover:text-primary transition-colors duration-200" />
              </button>
              <NavLink
                to="/"
                className="btn btn-primary text-2xl font-bold tracking-wide hover:scale-105 transition-transform duration-200 shadow-lg"
              >
                Uni Pharmacy              </NavLink>
            </div>

            <div className="navbar-center hidden lg:flex">
              <ul className="flex items-center gap-4 text-sm font-semibold text-base-content">
                {desktopLinks.map((section) => {
                  const hasMultipleLinks = section.ping.length > 1;
                  const firstLink = section.ping[0];
                  const isSettings = section.text === "Settings";

                  // Always show Settings as dropdown, even with one item
                  if (!hasMultipleLinks && firstLink && !isSettings) {
                    return (
                      <li key={section.id}>
                        <NavLink
                          to={firstLink.link}
                          className={({ isActive }) =>
                            `px-3 py-2 rounded-md transition-colors duration-200 ${isActive ? "bg-primary text-white" : "hover:bg-primary/10"
                            }`
                          }
                          onClick={handleCloseDropdown}
                        >
                          {firstLink.linkName || section.text}
                        </NavLink>
                      </li>
                    );
                  }

                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors duration-200 ${activeSectionId === section.id ? "bg-primary/10" : "hover:bg-primary/10"
                          }`}
                        onMouseEnter={() => setActiveSectionId(section.id)}
                        onFocus={() => setActiveSectionId(section.id)}
                        onClick={() => handleSectionToggle(section.id)}
                        aria-expanded={activeSectionId === section.id}
                        aria-haspopup="true"
                      >
                        {section.text}
                        <FaChevronDown className={`text-xs mt-0.5 transition-transform ${activeSectionId === section.id ? "rotate-180" : ""
                          }`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="navbar-end gap-2">
              <ToggleTheme />
            </div>
          </div>

          {activeSection && activeSection.ping.length > 0 && (
            <div
              className="hidden lg:block border-t border-base-300 bg-base-100 shadow-sm relative z-50"
              onMouseEnter={() => setActiveSectionId(activeSection.id)}
              onMouseLeave={handleCloseDropdown}
            >
              <div className="align-element flex flex-wrap items-center gap-3 py-3">
                {activeSection.ping.map((subLink) => (
                  <NavLink
                    key={subLink.id || subLink.link}
                    to={subLink.link}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm transition-colors duration-200 ${isActive ? "bg-primary text-white" : "hover:bg-primary/10"
                      }`
                    }
                    onClick={handleCloseDropdown}
                  >
                    {subLink.linkName}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </Fragment>
  );
};

export default Navbar;
