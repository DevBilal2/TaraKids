"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const COLUMN_COUNT = 4;

function chunkIntoColumns(items, columns = COLUMN_COUNT) {
  const result = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => result[i % columns].push(item));
  return result;
}

const DROPDOWN_MAX_W = 800;
const VIEW_MARGIN = 16;

export default function FeaturedProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [panelWidth, setPanelWidth] = useState(DROPDOWN_MAX_W);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/collections")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const collectionColumns = chunkIntoColumns(
    collections.map((c) => ({ name: c.title, href: `/collections/${c.handle}` })),
    COLUMN_COUNT
  );

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);

    if (triggerRef.current) {
      requestAnimationFrame(() => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          const vw = window.innerWidth;
          const dw = Math.min(
            DROPDOWN_MAX_W,
            Math.max(280, vw - VIEW_MARGIN * 2)
          );
          const leftPosition = Math.max(
            VIEW_MARGIN,
            Math.min(
              rect.left + rect.width / 2 - dw / 2,
              vw - dw - VIEW_MARGIN
            )
          );

          requestAnimationFrame(() => {
            setPanelWidth(dw);
            setDropdownPosition({
              left: leftPosition,
              top: rect.bottom + 4,
            });
            setIsOpen(true);
            setTimeout(() => setIsVisible(true), 10);
          });
        }
      });
    } else {
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 10);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setIsOpen(false), 200);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setIsOpen(false), 200);
    }, 150);
  };

  // Handle window resize - keep dropdown under trigger (viewport-relative for fixed)
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isOpen && triggerRef.current) {
          requestAnimationFrame(() => {
            if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              const vw = window.innerWidth;
              const dw = Math.min(
                DROPDOWN_MAX_W,
                Math.max(280, vw - VIEW_MARGIN * 2)
              );
              const leftPosition = Math.max(
                VIEW_MARGIN,
                Math.min(
                  rect.left + rect.width / 2 - dw / 2,
                  vw - dw - VIEW_MARGIN
                )
              );
              requestAnimationFrame(() => {
                setPanelWidth(dw);
                setDropdownPosition({
                  left: leftPosition,
                  top: rect.bottom + 4,
                });
              });
            }
          });
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock document scroll while open (html + body). No padding-right — avoids the
  // “extra gutter” feel on hover; globals.css scrollbar-gutter: stable helps layout.
  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOS: html.style.overscrollBehavior,
      bodyOS: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    const isInsidePanel = (target) =>
      typeof target?.closest === "function" &&
      target.closest("[data-shop-dropdown-panel]");

    const isEditableTarget = (target) =>
      typeof target?.closest === "function" &&
      target.closest("input, textarea, select, [contenteditable=true]");

    const preventWheelTouch = (e) => {
      if (isInsidePanel(e.target)) return;
      e.preventDefault();
    };

    const preventScrollKeys = (e) => {
      if (isInsidePanel(e.target) || isEditableTarget(e.target)) return;
      const k = e.key;
      if (
        k === " " ||
        k === "PageUp" ||
        k === "PageDown" ||
        k === "ArrowUp" ||
        k === "ArrowDown" ||
        k === "Home" ||
        k === "End"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", preventWheelTouch, { passive: false });
    document.addEventListener("touchmove", preventWheelTouch, {
      passive: false,
    });
    window.addEventListener("keydown", preventScrollKeys);

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOS;
      body.style.overscrollBehavior = prev.bodyOS;
      document.removeEventListener("wheel", preventWheelTouch);
      document.removeEventListener("touchmove", preventWheelTouch);
      window.removeEventListener("keydown", preventScrollKeys);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative" ref={triggerRef}>
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href="/allproducts"
className="no-underline whitespace-nowrap text-stone-700 hover:text-stone-900 transition-all duration-300 flex items-center gap-1.5 group text-sm tracking-wide"
            >
              <span className="relative after:content-['']  after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-stone-900 after:transition-all after:duration-300 group-hover:after:w-full">
              Shop
            </span>
            <ChevronDown
              size={16}
              className={`text-stone-500 group-hover:text-stone-900 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Link>
        </div>
      </div>

      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          data-shop-dropdown-panel
          className={`fixed top-0 max-h-[min(85vh,calc(100dvh-6rem))] z-[9999] overflow-y-auto overflow-x-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-200 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{
            left: `${dropdownPosition.left}px`,
            top: `${dropdownPosition.top}px`,
            width: `${panelWidth}px`,
            transformOrigin: "top center",
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="py-8 text-center text-stone-500 text-sm">
                Loading collections…
              </div>
            ) : collections.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm">
                No collections yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {collectionColumns.map((column, colIndex) => (
                  <div key={colIndex} className="min-w-0 space-y-1">
                    {column.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        className="block rounded px-2 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900 touch-manipulation"
                        onClick={() => {
                          setIsVisible(false);
                          setTimeout(() => setIsOpen(false), 200);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
