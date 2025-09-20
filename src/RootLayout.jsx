import { Outlet } from "react-router";
const RootLayout = () => {
  return (
    <div className="w-full h-full">
      <Outlet />
    </div>
  );
};

export default RootLayout;
