"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CTVProfileWithUser } from "@/lib/ctvServices";
import {
  ClipboardDocumentIcon,
  BuildingOffice2Icon,
  LinkIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface SalesQuickActionsProps {
  profile: CTVProfileWithUser;
  referralsCount?: number;
  pendingCommissions?: number;
}

type ActionItem =
  | {
      type: "link";
      title: string;
      description: string;
      href: string;
      color: string;
      icon: React.ReactNode;
      badge?: string;
      external?: boolean;
    }
  | {
      type: "button";
      title: string;
      description: string;
      color: string;
      icon: React.ReactNode;
      onClick: () => void;
      feedback?: string;
    };

export default function SalesQuickActions({
  profile,
  referralsCount = 0,
  pendingCommissions = 0,
}: SalesQuickActionsProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shared, setShared] = useState(false);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${profile.referral_code}`
      : `?ref=${profile.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(profile.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareLink = async () => {
    const text = `Young House - Tìm phòng trọ uy tín. Dùng mã giới thiệu ${profile.referral_code} của tôi nhé!\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Young House - Giới thiệu phòng trọ",
          text,
          url: referralLink,
        });
        return;
      } catch {
        /* fallback to copy */
      }
    }
    navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const actions: ActionItem[] = [
    {
      type: "button",
      title: copiedLink ? "Đã copy link!" : "Copy link giới thiệu",
      description: "Chia sẻ cho khách thuê tiềm năng",
      color: "bg-emerald-500 hover:bg-emerald-600",
      icon: <ClipboardDocumentIcon className="w-6 h-6" />,
      onClick: copyLink,
    },
    {
      type: "button",
      title: copiedCode ? "Đã copy mã!" : "Copy mã CTV",
      description: profile.referral_code,
      color: "bg-teal-500 hover:bg-teal-600",
      icon: <LinkIcon className="w-6 h-6" />,
      onClick: copyCode,
    },
    {
      type: "button",
      title: shared ? "Đã chia sẻ!" : "Chia sẻ nhanh",
      description: "Gửi link qua Zalo, Messenger...",
      color: "bg-cyan-500 hover:bg-cyan-600",
      icon: <ShareIcon className="w-6 h-6" />,
      onClick: shareLink,
    },
    {
      type: "link",
      title: "Phòng trống nội bộ",
      description: "Copy link GT từng phòng",
      href: "/ctv/rooms",
      color: "bg-blue-500 hover:bg-blue-600",
      icon: <BuildingOffice2Icon className="w-6 h-6" />,
    },
    {
      type: "link",
      title: "Tìm phòng công khai",
      description: "Danh sách phòng trên website",
      href: "/phong-tro",
      color: "bg-indigo-500 hover:bg-indigo-600",
      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
      external: true,
    },
    {
      type: "link",
      title: "Lịch sử giới thiệu",
      description: "Theo dõi lượt GT khách thuê",
      href: "/ctv/referrals",
      color: "bg-violet-500 hover:bg-violet-600",
      icon: <LinkIcon className="w-6 h-6" />,
      badge: referralsCount > 0 ? `${referralsCount} lượt` : undefined,
    },
    {
      type: "link",
      title: "Kiểm tra hoa hồng",
      description: "Xem trạng thái thanh toán",
      href: "/ctv/commissions",
      color: "bg-amber-500 hover:bg-amber-600",
      icon: <BanknotesIcon className="w-6 h-6" />,
      badge: pendingCommissions > 0 ? `${pendingCommissions} chờ duyệt` : undefined,
    },
    {
      type: "link",
      title: profile.bank_name ? "Cài đặt tài khoản" : "Cập nhật ngân hàng",
      description: profile.bank_name
        ? "Thông tin CTV & ngân hàng"
        : "⚠️ Chưa có STK nhận hoa hồng",
      href: "/ctv/settings",
      color: profile.bank_name ? "bg-neutral-600 hover:bg-neutral-700" : "bg-orange-500 hover:bg-orange-600",
      icon: <Cog6ToothIcon className="w-6 h-6" />,
    },
    {
      type: "link",
      title: "Liên hệ hỗ trợ",
      description: "Hotline IT Young House",
      href: "tel:0372858098",
      color: "bg-rose-500 hover:bg-rose-600",
      icon: <PhoneIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Thao tác nhanh</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Các tác vụ thường dùng khi tư vấn và giới thiệu khách
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          {profile.commission_rate}% hoa hồng
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 bg-white/20 rounded-lg shrink-0">{action.icon}</div>
                {action.type === "link" && action.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 shrink-0">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold mt-3 leading-snug">{action.title}</h3>
              <p className="text-xs opacity-90 mt-1 line-clamp-2">{action.description}</p>
            </>
          );

          if (action.type === "button") {
            return (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                className={`${action.color} text-white rounded-xl p-4 text-left hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md`}
              >
                {content}
              </button>
            );
          }

          const isExternal = action.external || action.href.startsWith("tel:");
          const className = `${action.color} text-white rounded-xl p-4 block hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md`;

          if (isExternal) {
            return (
              <a
                key={index}
                href={action.href}
                target={action.href.startsWith("tel:") ? undefined : "_blank"}
                rel={action.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={index} href={action.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
