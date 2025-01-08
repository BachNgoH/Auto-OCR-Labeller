import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  RiDashboardLine,
  RiProjectorLine,
  RiLogoutBoxLine,
} from "react-icons/ri";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path === "/projects" && location.pathname.startsWith("/project"))
      return true;
    return false;
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: RiDashboardLine,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: RiProjectorLine,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg">
      {/* Logo/Brand Section */}
      <div className="px-6 py-8 border-b border-gray-800">
        <h1 className="text-xl font-bold text-center">Auto OCR Labeller</h1>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white truncate">
              {user?.username}
            </h3>
            <p
              className="text-sm text-gray-400 truncate"
              style={{ maxWidth: "100px" }}
            >
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
        >
          <RiLogoutBoxLine className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
