import { Navigate } from "react-router-dom";

export const NotFoundRoute = () => {
  return (
    <Navigate to="/" ></Navigate>
  );
};