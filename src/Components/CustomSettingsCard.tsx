import { ReactNode, useState, useRef } from "react";
import CardBase from "./CardBase";

interface CustomSettingsCardProps {
  children: ReactNode;
}

function CustomSettingsCard({ children } : CustomSettingsCardProps) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>();
  return (
    <CardBase
      title={
        <div className="flex flex-row items-center justify-between">
          <span>Advanced Settings</span>
          <button
            className="btn btn-sm btn-ghost text-xl"
            onClick={() => setCollapsed(!collapsed)}
          >
          { collapsed ? "+" : "-" }
          </button>
        </div>
       }
      bgColor={"bg-base-200"}
      titleClass={"text-lg bold"}
    >
    <div className="overflow-y-hidden transition-all duration-300"
      style={{ height: !collapsed ? ref.current?.offsetHeight || 0 : 0 }}
    >
      <div ref={ref}>
      {children}
      </div>
    </div>
    </CardBase>
  );
}

export default CustomSettingsCard;
