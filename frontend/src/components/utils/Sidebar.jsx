import { Link } from "react-router-dom";
import { useContext } from "react";
import SidebarContext from "../../context/Sidebar/SidebarContext";

import {
  HomeIcon,
  UserIcon,
  ClockIcon,
  QueueListIcon,
  FolderIcon,
  FireIcon,
  VideoCameraIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

function Sidebar() {
  const { isMenuOpen } = useContext(SidebarContext);

  return (
    <>
      {isMenuOpen ? (
        <aside className="w-64 bg-gray-800 text-white p-4 min-h-screen hidden md:block">
          <ul className="flex flex-col">
            <li>
              <Link
                to="/"
                className="hover:bg-gray-700 p-2 rounded flex items-center"
              >
                <HomeIcon className="h-6 w-6 mr-6" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:bg-gray-700 p-2 rounded flex items-center"
              >
                <UserIcon className="h-6 w-6 mr-6" />
                <span>About</span>
              </Link>
            </li>
            <li>
              <Link
                to="/history"
                className="hover:bg-gray-700 p-2 rounded flex items-center"
              >
                <ClockIcon className="h-6 w-6 mr-6" />
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link
                to="/playlist"
                className="hover:bg-gray-700 p-2 rounded flex items-center"
              >
                <FolderIcon className="h-6 w-6 mr-6" />
                <span>Playlist</span>
              </Link>
            </li>
            <li>
              <Link
                to="/watch-later"
                className="hover:bg-gray-700 p-2 rounded flex items-center"
              >
                <BookmarkIcon className="h-6 w-6 mr-6" />
                <span>Watch Later</span>
              </Link>
            </li>
            <li>
              <Link
                to="/video/upload-video"
                className="hover:bg-gray-700 p-2 rounded flex items-center"
              >
                <FireIcon className="h-6 w-6 mr-6" />
                <span>Upload Video</span>
              </Link>
            </li>
            <li className="hover:bg-gray-700 p-2 rounded flex items-center">
              <VideoCameraIcon className="h-6 w-6 mr-6" />
              <span>Subscriptions</span>
            </li>
            <li className="hover:bg-gray-700 p-2 rounded flex items-center">
              <QueueListIcon className="h-6 w-6 mr-6" />
              <span>Library</span>
            </li>
          </ul>
        </aside>
      ) : (
        // <aside className="w-min bg-gray-800 text-white p-4 min-h-screen hidden md:block">
        //   <ul className="flex flex-col">
        //     <li>
        //       <Link
        //         to="/"
        //         className="hover:bg-gray-700 p-2 rounded flex items-center"
        //       >
        //         <div className="flex flex-col items-center">
        //           <HomeIcon className="h-6 w-6" />
        //           <span> Home</span>
        //         </div>
        //       </Link>
        //     </li>{" "}
        //     <li>
        //       <Link
        //         to="/about"
        //         className="hover:bg-gray-700 p-2 rounded flex items-center"
        //       >
        //         <div className="flex flex-col items-center">
        //           <UserIcon className="h-6 w-6" />
        //           <span>About</span>
        //         </div>
        //       </Link>
        //     </li>{" "}
        //     <li>
        //       <Link
        //         to="/"
        //         className="hover:bg-gray-700 p-2 rounded flex items-center"
        //       >
        //         <div className="flex flex-col items-center">
        //           <ClockIcon className="h-6 w-6" />
        //           <span>History</span>
        //         </div>
        //       </Link>
        //     </li>
        //     <li>
        //       <Link
        //         to="/"
        //         className="hover:bg-gray-700 p-2 rounded flex items-center"
        //       >
        //         <div className="flex flex-col items-center">
        //           <FolderIcon className="h-6 w-6" />
        //           <span>Playlist</span>
        //         </div>
        //       </Link>
        //     </li>
        //   </ul>
        // </aside>
        <></>
      )}
    </>
  );
}

export default Sidebar;
