import { useState, useRef, useEffect, type FC, type ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  onLearnMore?: () => void;
}

const Tooltip: FC<TooltipProps> = ({ children, content, onLearnMore }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" }>({
    vertical: "top",
    horizontal: "center",
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 = 16rem = 256px
      
      // Vertical positioning
      let vertical: "top" | "bottom" = "top";
      if (triggerRect.top < tooltipRect.height + 10) {
        vertical = "bottom";
      }
      
      // Horizontal positioning - check if tooltip would overflow screen
      let horizontal: "left" | "center" | "right" = "center";
      const centerX = triggerRect.left + triggerRect.width / 2;
      const leftOverflow = centerX - tooltipWidth / 2 < 10;
      const rightOverflow = centerX + tooltipWidth / 2 > window.innerWidth - 10;
      
      if (leftOverflow) {
        horizontal = "left";
      } else if (rightOverflow) {
        horizontal = "right";
      }
      
      setPosition({ vertical, horizontal });
    }
  }, [isVisible]);

  const getHorizontalClasses = () => {
    switch (position.horizontal) {
      case "left":
        return "left-0";
      case "right":
        return "right-0";
      default:
        return "left-1/2 -translate-x-1/2";
    }
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-[#1a1a24] border-white/20 rotate-45";
    const verticalPos = position.vertical === "top" 
      ? "bottom-[-5px] border-r border-b" 
      : "top-[-5px] border-l border-t";
    
    let horizontalPos;
    switch (position.horizontal) {
      case "left":
        horizontalPos = "left-4";
        break;
      case "right":
        horizontalPos = "right-4";
        break;
      default:
        horizontalPos = "left-1/2 -translate-x-1/2";
    }
    
    return `${baseClasses} ${verticalPos} ${horizontalPos}`;
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-64 p-3 text-sm bg-[#1a1a24] border border-white/20 rounded-lg shadow-xl
            ${position.vertical === "top" ? "bottom-full mb-2" : "top-full mt-2"}
            ${getHorizontalClasses()}
          `}
        >
          {/* Arrow */}
          <div className={getArrowClasses()} />
          
          <p className="text-gray-300 leading-relaxed">{content}</p>
          
          {onLearnMore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLearnMore();
                setIsVisible(false);
              }}
              className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              Learn more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
