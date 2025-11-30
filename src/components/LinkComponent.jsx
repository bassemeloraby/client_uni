import  { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { Link } from "react-router-dom";

const LinkComponent = ({ mainPage, setIsOpen, icon }) => {
  const { text, ping } = mainPage;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <li>
      <div 
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center justify-between p-3 rounded-lg hover:bg-cyan-300/30 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center">
          {icon}
          <h2 className="text-primary text-xl">{text}</h2>
        </div>
        <button className="btn btn-circle btn-xs bg-cyan-700 hover:bg-cyan-600 border-none text-white">
          {showInfo ? <AiOutlineMinus /> : <AiOutlinePlus />}
        </button>
      </div>
      {showInfo && (
        <ul className="ml-4 mt-2 space-y-1">
          {ping.map((m, index) => {
            const { linkName, link } = m;

            return (
              <li key={index}>
                <Link 
                  to={link} 
                  onClick={() => setIsOpen && setIsOpen(false)}
                  className="flex items-center p-2 rounded-lg hover:bg-cyan-300/30 transition-colors duration-200"
                >
                  {linkName}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default LinkComponent;
