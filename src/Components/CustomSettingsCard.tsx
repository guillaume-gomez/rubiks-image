import { ReactNode, useState, useRef } from "react";
import CardBase from "./CardBase";
import "./CustomSettingsCard.css";

interface CustomSettingsCardProps {
  children: ReactNode;
}

function CustomSettingsCard({ children } : CustomSettingsCardProps) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <CardBase
      title={
        <div className="flex flex-row items-center justify-between">
          <span>Advanced Settings</span>
          <button
            className={`btn btn-sm btn-ghost text-xl`}
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className={`anim-container ${collapsed ? "morphed" : ""}`}>

              <svg
                className="icons plus"
                viewBox="0 0 1024 1024"
                fill="currentColor"
                height="1em"
                width="1em"
              >
                <path d="M696 480H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
              </svg>

              <svg
                className="icons minus"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
              >
                <path d="M22 12 A10 10 0 0 1 12 22 A10 10 0 0 1 2 12 A10 10 0 0 1 22 12 z" />
                <path d="M8 12h8" />
              </svg>

            </div>
          </button>
        </div>
       }
      bgColor={"bg-base-200"}
      titleClass={"text-lg bold"}
    >
    <div className="overflow-y-hidden transition-all duration-300"
      style={{ height: !collapsed ? ref.current?.offsetHeight || 0 : 0 }}
    >
      <div ref={ref} className="flex flex-col gap-2">
      {children}
      </div>
    </div>
    </CardBase>
  );
}

export default CustomSettingsCard;
