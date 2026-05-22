import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  console.log("PrivateRoute ejecutado, token:", token);

  if (!token) {
    return <Navigate to="/001" />; // login
  }

  return children;
};

export default PrivateRoute;
