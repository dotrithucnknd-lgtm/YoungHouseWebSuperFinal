"use client";

import React, { FC, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ClearDataButton from "../ClearDataButton";

export interface PriceRangeInputProps {
  className?: string;
  fieldClassName?: string;
  min?: number;
  max?: number;
  step?: number;
}

const PriceRangeInput: FC<PriceRangeInputProps> = ({
  className = "[ lg:nc-flex-2 ]",
  fieldClassName = "[ nc-hero-field-padding--small ]",
  min = 0,
  max = 1000000,
  step = 50000,
}) => {
  const [range, setRange] = useState<[number, number]>([200000, 800000]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

  const onClear = () => setRange([min, max]);

  return (
    <Popover className={`PriceRangeInput z-10 relative flex ${className}`}>
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex-1 z-10 flex relative ${fieldClassName} items-center space-x-3 focus:outline-none ${
              open ? "nc-hero-field-focused" : ""
            }`}
          >
            <div className="text-neutral-300 dark:text-neutral-400">
              <CurrencyDollarIcon className="w-5 h-5 lg:w-7 lg:h-7" />
            </div>
            <div className="flex-grow text-left">
              <span className="block xl:text-lg font-semibold">
                {formatCurrency(range[0])} - {formatCurrency(range[1])}
              </span>
              <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">Giá mỗi đêm</span>
            </div>
            {open && <ClearDataButton onClick={onClear} />}
          </Popover.Button>

          {open && (
            <div className="h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 -inset-x-0.5 bg-white dark:bg-neutral-800"></div>
          )}

          <Transition
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-3 top-full w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0">
              <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-neutral-800 p-6">
                <div className="px-1">
                  <Slider
                    range
                    min={min}
                    max={max}
                    step={step}
                    value={range}
                    onChange={(val) => setRange(val as [number, number])}
                    allowCross={false}
                    trackStyle={[{ backgroundColor: "#0ea5e9" }]}
                    handleStyle={[{ borderColor: "#0ea5e9" }, { borderColor: "#0ea5e9" }]}
                  />
                  <div className="flex justify-between mt-4 text-sm text-neutral-600 dark:text-neutral-300">
                    <span>{formatCurrency(range[0])}</span>
                    <span>{formatCurrency(range[1])}</span>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default PriceRangeInput;



