import { ReactNode } from "react";
import CardBase from "./CardBase";

interface SubCardProps {
  title: string | ReactNode;
  children: ReactNode;
}

function SubCard({ title, children } : SubCardProps) {
  return (
    <CardBase title={title} bgColor={"bg-base-200"} titleClass={"text-lg bold"}>
      {children}
    </CardBase>
  );
}

export default SubCard;
