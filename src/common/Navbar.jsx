import React, { useState, useEffect, useRef } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo/logo4Navbar.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `transition duration-300 font-medium ${
      isActive
        ? "text-[#7C1835] font-bold border-b-2 border-[#7C1835]"
        : "text-[#2B171D] hover:text-[#7C1835]"
    }`;

  return (
    <nav className="w-full bg-[#F8F4EF]/95 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50 border-b border-[#F6D1DA]/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="AdultMixer Logo"
            className="h-16 md:h-18 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/matches" className={linkClass}>
            Matches
          </NavLink>
          <NavLink to="/pricing" className={linkClass}>
            Pricing
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl btn-primary shadow-sm"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!user.profileImageUrl && <User size={20} />}
                <span className="font-semibold">{user.firstName}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FAF0F3] rounded-xl shadow-xl py-2 z-50 border border-[#F6D1DA]">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-[#F6D1DA] transition text-[#2B171D] font-medium"
                  >
                    <User size={18} className="text-[#7C1835]" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-[#F6D1DA] transition text-left text-[#7C1835] font-semibold"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl btn-secondary font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-xl btn-primary font-semibold shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#2B171D] hover:text-[#7C1835]"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-[#FAF0F3] shadow-xl border-t border-[#F6D1DA] px-6 py-5 space-y-3 text-lg font-medium">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block w-full px-3 py-2 rounded-lg ${
                isActive
                  ? "text-[#7C1835] font-bold bg-[#F6D1DA]/50"
                  : "text-[#2B171D] hover:text-[#7C1835]"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/explore"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block w-full px-3 py-2 rounded-lg ${
                isActive
                  ? "text-[#7C1835] font-bold bg-[#F6D1DA]/50"
                  : "text-[#2B171D] hover:text-[#7C1835]"
              }`
            }
          >
            Explore
          </NavLink>

          <NavLink
            to="/matches"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block w-full px-3 py-2 rounded-lg ${
                isActive
                  ? "text-[#7C1835] font-bold bg-[#F6D1DA]/50"
                  : "text-[#2B171D] hover:text-[#7C1835]"
              }`
            }
          >
            Matches
          </NavLink>

          <NavLink
            to="/pricing"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block w-full px-3 py-2 rounded-lg ${
                isActive
                  ? "text-[#7C1835] font-bold bg-[#F6D1DA]/50"
                  : "text-[#2B171D] hover:text-[#7C1835]"
              }`
            }
          >
            Pricing
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block w-full px-3 py-2 rounded-lg ${
                isActive
                  ? "text-[#7C1835] font-bold bg-[#F6D1DA]/50"
                  : "text-[#2B171D] hover:text-[#7C1835]"
              }`
            }
          >
            Contact
          </NavLink>

          {!user && (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl btn-secondary font-semibold"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl btn-primary font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}

          {user && (
            <>
              <div className="flex flex-col items-center space-y-2 px-4 py-3 border-t border-[#F6D1DA] mt-2 pt-4">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.firstName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#C88B7B] shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!user.profileImageUrl && (
                  <div className="w-20 h-20 rounded-full bg-[#7C1835] flex items-center justify-center border-4 border-[#C88B7B] shadow-lg">
                    <User size={32} className="text-white" />
                  </div>
                )}
                <span className="text-[#2B171D] font-bold text-xl">{user.firstName}</span>
              </div>

              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl btn-secondary font-semibold"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="block w-full text-center px-4 py-2.5 rounded-xl btn-primary font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
