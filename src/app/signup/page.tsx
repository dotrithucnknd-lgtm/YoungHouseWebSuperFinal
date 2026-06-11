import React, { FC } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";

export interface PageSignUpProps {}

const PageSignUp: FC<PageSignUpProps> = ({}) => {
  return (
    <div className={`nc-PageSignUp  `}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Tạo tài khoản
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-6 text-center space-y-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              YoungHouse chỉ cấp tài khoản nội bộ. Vui lòng liên hệ quản trị viên để được
              tạo tài khoản và phân quyền.
            </p>
            <ButtonPrimary href="/login">Quay lại đăng nhập</ButtonPrimary>
          </div>

          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold underline">
              Đăng nhập
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
