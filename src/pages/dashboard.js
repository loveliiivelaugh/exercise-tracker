import React from "react";
import Navbar from "./../components/Navbar";
import DashboardSection from "./../components/DashboardSection";
import MuiDashboardSection from './../components/MuiDashboardSection';
import { requireAuth } from "./../util/auth.js";

function DashboardPage(props) {
  const [muiDashboard, toggleDashboard] = React.useState(true);
  return (
    muiDashboard ?
      <MuiDashboardSection /> :
      <>
        <Navbar
          color="default"
          logo="https://uploads.divjoy.com/logo.svg"
          logoInverted="https://uploads.divjoy.com/logo-white.svg"
        />
        <DashboardSection
          bgColor="default"
          size="medium"
          bgImage=""
          bgImageOpacity={1}
          title="Dashboard"
          subtitle=""
        />
      </>
  );
}

export default requireAuth(DashboardPage);
