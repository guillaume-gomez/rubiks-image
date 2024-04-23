import { ReactNode, useState } from "react";
import CardBase from "./CardBase";

interface CustomSettingsCardProps {
  children: ReactNode;
}

function CustomSettingsCard({ children } : CustomSettingsCardProps) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
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
      {collapsed ? null : children }
    </CardBase>
  );
}

export default CustomSettingsCard;
