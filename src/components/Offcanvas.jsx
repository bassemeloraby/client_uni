import { Link } from "react-router-dom";
import { mainPages } from "./links";
import LinkComponent from "./LinkComponent";
import { useSelector } from "react-redux";
import { 
  FaHome, 
  FaBox, 
  FaInfoCircle, 
  FaCog,
  FaListAlt,
  FaQuestionCircle,
  FaPlay,
  FaCalculator
} from "react-icons/fa";

const Offcanvas = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.userRole?.toLowerCase() === "admin";

  // Function to get the appropriate icon based on the page text
  const getIconForPage = (text) => {
    switch (text) {
      case "Products":
        return <FaBox className="h-5 w-5 mr-2 text-cyan-700" />;
      case "Indications":
        return <FaListAlt className="h-5 w-5 mr-2 text-cyan-700" />;
      case "Info":
        return <FaInfoCircle className="h-5 w-5 mr-2 text-cyan-700" />;
      case "Settings":
        return <FaCog className="h-5 w-5 mr-2 text-cyan-700" />;
      case "Quizzes":
        return <FaQuestionCircle className="h-5 w-5 mr-2 text-cyan-700" />;
      case "Videos":
        return <FaPlay className="h-5 w-5 mr-2 text-cyan-700" />;
      case "calculations":
        return <FaCalculator className="h-5 w-5 mr-2 text-cyan-700" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-cyan-100 to-cyan-200 shadow-xl transform transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-cyan-800 p-4 text-white">
        <h2 className="text-xl font-bold tracking-wide">Mederma Content</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-circle btn-sm bg-cyan-700 hover:bg-cyan-600 border-none text-white"
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="overflow-y-auto h-[calc(100vh-4rem)]">
        <ul className="menu bg-transparent text-gray-800 p-4 space-y-1">
          <li>
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="flex items-center p-3 rounded-lg hover:bg-cyan-300/30 transition-colors duration-200"
            >
              <FaHome className="h-5 w-5 mr-2 text-cyan-700" />
              Home
            </Link>
          </li>
          {mainPages.map((mainPage, mi) => {
            // Hide Settings section completely for non-admin users
            if (mainPage.text === "Settings" && !isAdmin) {
              return null;
            }
            // Hide Sales for non-admin users
            if (mainPage.text === "Sales" && !isAdmin) {
              return null;
            }
            // Hide Pharmacies for non-authenticated users
            if (!user && mainPage.text === "Pharmacies") {
              return null;
            }
            // Filter sub-links for non-admin users
            const filteredMainPage = {
              ...mainPage,
              ping: (mainPage.ping || []).filter((link) => {
                // Hide Assignments link for non-admin users
                if (link.linkName === "Assignments" && !isAdmin) {
                  return false;
                }
                return true;
              }),
            };
            return (
              <LinkComponent 
                key={mi} 
                mainPage={filteredMainPage} 
                setIsOpen={setIsOpen} 
                icon={getIconForPage(mainPage.text)}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Offcanvas;
