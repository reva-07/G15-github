import { useState, useRef, useEffect } from "react";

/**
 * Accessible Dropdown Action Menu
 * Handles outside click, Escape key dismissal, and directional placement.
 */
export default function DropdownMenu({
  trigger,
  items,
  align = "right",
  direction = "down",
  onOpenChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  function handleToggle(e) {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  }

  return (
    <div className="dropdown-wrapper" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <div
        className="dropdown-trigger"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`dropdown-popover dropdown-align-${align} dropdown-direction-${direction}`}
          role="menu"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="dropdown-divider" role="separator" />;
            }
            return (
              <button
                key={index}
                type="button"
                className={`dropdown-item ${item.danger ? "danger" : ""}`}
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onOpenChange?.(false);
                  if (item.onClick) item.onClick();
                }}
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
