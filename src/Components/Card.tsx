import { ReactNode } from "react";

interface CardProps {
  title: string | ReactNode;
  children: ReactNode;
  bgColor?: string
}

function Card({ title, children, bgColor = "bg-base-200" } : CardProps) {
  return (
    <div className={`card ${bgColor} shadow-xl`}>
      <div className="card-body p-4">
        <h2 className="card-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default Card;
