import { ReactNode } from "react";

interface CardBaseProps {
  title: string | ReactNode;
  children: ReactNode;
  bgColor?: string
  titleClass?: string
}

function CardBase({ title, children, bgColor = "bg-base-200", titleClass="card-title" } : CardBaseProps) {
  return (
    <div className={`card ${bgColor} shadow-xl h-full`}>
      <div className="card-body p-4">
        <h2 className={titleClass}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default CardBase;
