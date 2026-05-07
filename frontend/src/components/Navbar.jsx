import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div>
        <h2>FaithLink</h2>
        <p>Church Management System</p>
      </div>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;