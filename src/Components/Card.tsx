import { ReactNode } from "react";
import CardBase from "./CardBase";

interface CardProps {
  title: string | ReactNode;
  children: ReactNode;
}

function Card({ title, children} : CardProps) {
  return (
    <CardBase title={title} bgColor={"bg-base-300"} titleClass={"card-title"}>
      {children}
    </CardBase>
  );
}

export default Card;
