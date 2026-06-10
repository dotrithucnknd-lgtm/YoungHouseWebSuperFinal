"use client";

import React, { FC, useState } from "react";
import facebookSvg from "@/images/Facebook.svg";
import twitterSvg from "@/images/Twitter.svg";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, LoginCredentials, loginWithFacebook, loginWithTwitter } from "@/lib/supabaseServices";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export interface PageLoginProps {}


const PageLogin: FC<PageLoginProps> = ({}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const finalCredentials = { ...formData };
      if (finalCredentials.email && !finalCredentials.email.includes("@")) {
        finalCredentials.email = `${finalCredentials.email.trim().toLowerCase()}@younghouse.vn`;
      }
      const { user, error: loginError } = await loginUser(finalCredentials);
      
      if (loginError) {
        setError(loginError);
        return;
      }

      if (user) {
        login(user);
        setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          if (redirectTo && redirectTo.startsWith("/")) {
            router.push(redirectTo);
            return;
          }
          if (user.role === 'operator') {
            router.push('/operator');
          } else if (user.role === 'admin') {
            router.push('/admin');
          } else if (user.role === 'manager') {
            router.push('/manager');
          } else if (user.role === 'tenant') {
            router.push('/tenant');
          } else if (user.role === 'staff') {
            router.push('/staff');
          } else if (user.role === 'sales') {
            router.push('/ctv');
          } else {
            router.push('/');
          }
        }, 1500);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
    const target = redirectTo?.startsWith('/') ? redirectTo : '/';
    setTimeout(() => router.push(target), 500);
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await loginWithFacebook();
      if (error) {
        setError(error);
        setLoading(false);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập với Facebook');
      setLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await loginWithTwitter();
      if (error) {
        setError(error);
        setLoading(false);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập với Twitter');
      setLoading(false);
    }
  };

  return (
    <div className={`nc-PageLogin`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Đăng nhập
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          <div className="grid gap-3">
            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleSignInButton
                redirectTo={redirectTo}
                onSuccess={handleGoogleSuccess}
                onError={(msg) => {
                  setError(msg);
                  setLoading(false);
                }}
              />
            </div>

          </div>
          {/* OR */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
              OR
            </span>
            <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
          </div>
          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Tài khoản hoặc Email
              </span>
              <Input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ví dụ: P101Yh1 hoặc email@example.com"
                className="mt-1"
                required
              />
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Mật khẩu
                <Link href="/login" className="text-sm underline font-medium">
                  Quên mật khẩu?
                </Link>
              </span>
              <Input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1" 
                required
              />
            </label>
            <ButtonPrimary type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Bạn mới sử dụng dịch vụ? {` `}
            <Link href="/signup" className="font-semibold underline">
              Tạo tài khoản
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

