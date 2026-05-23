import React from "react";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav className={`flex flex-wrap items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 sm:gap-2 ${className}`}>
      <Link 
        href="/" 
        className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
        <span className="sr-only">Trang chủ</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href}
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`${index === items.length - 1 ? 'text-neutral-900 dark:text-neutral-100 font-medium break-words max-w-full' : ''}`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
