import { Navbar } from "@/components/global/navbar";
import { FC, ReactNode } from "react";

interface LandingLayoutProps {
  children: ReactNode;
}

const LandingLayout: FC<LandingLayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default LandingLayout;
