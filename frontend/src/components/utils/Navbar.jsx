import { MagnifyingGlassIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleSideBar } from "../../features/SideBarSlice";
import { changeIsLoggedIn } from "../../features/LoginSlice";
import { backendCaller } from "./backendCaller";
import { useState } from "react";

const Navbar = () => {
  const isLoggedIn = useSelector((state) => state.logInReducer.isLoggedIn);
  const userDetails = useSelector((state) => state.logInReducer.userDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchBarInput, setSearchBarInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleLogOut = async () => {
    const json = await backendCaller("/users/logout");
    if (json.success) {
      dispatch(changeIsLoggedIn({ isLoggedIn: false, userDetails: {} }));
      navigate("/");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchBarInput.trim()) return;

    navigate(`/search?query=${searchBarInput}`);
  };

  const avatar = userDetails?.avatar;

  return (
    <nav className="bg-gray-900 text-white px-2 py-4 shadow-lg">
      <div className="flex items-center justify-between  mx-auto">
        {/* Left Section: Hamburger & Logo */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu (for Sidebar toggle) */}
          <button
            onClick={() => {
              dispatch(toggleSideBar());
            }}
            className="text-white focus:outline-none md:block"
            aria-label="Toggle Menu"
          >
            <Bars3Icon className="h-7 w-7 hover:text-gray-400 transition" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/Streamio.png"
              alt="Streamio Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-xl font-semibold tracking-wide hover:text-gray-400 transition">
              Streamio
            </span>
          </Link>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="flex-1 mx-4 hidden sm:block">
          <form className="flex items-center w-full max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchBarInput}
              className="bg-gray-800 text-gray-300 px-4 py-2 rounded-l-lg focus:outline-none w-full text-sm"
              aria-label="Search"
              onChange={(e) => {
                setSearchBarInput((prev) => (prev = e.target.value));
              }}
            />
            <button
              onClick={handleSearch}
              type="submit"
              className="bg-red-600 px-4 py-2 rounded-r-lg hover:bg-red-500 transition-colors text-white"
              aria-label="Search Button"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Right Section: Profile & Options */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <Link
                to="/account/profile"
                className="relative w-10 h-10 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    ?
                  </div>
                )}
              </Link>

              {/* Log Out Button */}
              <button
                onClick={handleLogOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/account/login"
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-500 transition hidden sm:block"
            >
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar for smaller screens */}
      <div className="mt-3 sm:hidden">
        <form className="flex items-center w-full">
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-l-lg focus:outline-none w-full text-sm"
            aria-label="Search"
          />
          <button
            type="submit"
            className="bg-red-600 px-4 py-2 rounded-r-lg hover:bg-red-500 transition-colors text-white"
            aria-label="Search Button"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </nav>
  );
};
export default Navbar;
