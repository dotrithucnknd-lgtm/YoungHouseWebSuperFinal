import React from "react";
import { DEMO_POSTS } from "@/data/posts";
import { PostDataType } from "@/data/types";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Comment from "@/shared/Comment";
import SocialsList from "@/shared/SocialsList";
import Textarea from "@/shared/Textarea";
import Image from "next/image";
import travelhero2Image from "@/images/travelhero2.jpg";
import Link from "next/link";
import { Route } from "@/routers/types";

const Page = ({
  params,
  searchParams,
}: {
  params: { stepIndex: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const renderHeader = () => {
    return (
      <header className="container rounded-xl">
        <div className="max-w-screen-md mx-auto space-y-5">
          <Badge href="/blog" color="purple" name="Gợi ý nhà ở" />
          <h1
            className=" text-neutral-900 font-semibold text-3xl md:text-4xl md:!leading-[120%] lg:text-4xl dark:text-neutral-100 max-w-4xl "
            title="Bí Quyết Tìm Phòng Trọ Giá Rẻ Ở Hà Nội"
          >
            Bí Quyết Tìm Phòng Trọ Giá Rẻ Ở Hà Nội
          </h1>
          <span className="block text-base text-neutral-500 md:text-lg dark:text-neutral-400 pb-1">
            Tổng hợp những kinh nghiệm thực tế giúp bạn tìm được phòng trọ vừa
            túi tiền nhưng vẫn đảm bảo chất lượng sống tại Thủ đô đông đúc.
          </span>

          <div className="w-full border-b border-neutral-100 dark:border-neutral-800"></div>
          <div className="flex flex-col items-baseline sm:flex-row sm:justify-between">
            <div className="nc-PostMeta2 flex items-center flex-wrap text-neutral-700 text-left dark:text-neutral-200 text-sm leading-none flex-shrink-0">
              <Avatar
                containerClassName="flex-shrink-0"
                sizeClass="w-8 h-8 sm:h-11 sm:w-11 "
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <a className="block font-semibold" href="/">
                    Lan Chi
                  </a>
                </div>
                <div className="text-xs mt-[6px]">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Tháng 10, 2025
                  </span>
                  <span className="mx-2 font-semibold">·</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    7 phút đọc
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <SocialsList />
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderContent = () => {
    return (
      <div
        id="single-entry-content"
        className="prose dark:prose-invert prose-sm !max-w-screen-md sm:prose lg:prose-lg mx-auto dark:prose-dark"
      >
        <p>
          Hà Nội luôn là điểm đến hấp dẫn với sinh viên và người trẻ, nhưng chi
          phí sinh hoạt ngày càng tăng khiến việc tìm phòng trọ phù hợp trở nên
          khó khăn hơn. Bài viết này tổng hợp những bí quyết thực tế giúp bạn
          chủ động săn được chỗ ở vừa túi tiền mà vẫn đảm bảo an toàn, tiện lợi
          cho việc học tập và làm việc.
        </p>
        <p>
          Trước khi bắt đầu, hãy xác định rõ mục tiêu về ngân sách, vị trí và
          tiện ích bắt buộc. Việc lập danh sách ưu tiên sẽ giúp bạn sàng lọc
          thông tin nhanh chóng và tránh bị cuốn vào những lựa chọn không phù
          hợp. Đừng quên cập nhật giá thị trường thường xuyên từ các hội nhóm
          thuê trọ uy tín trên mạng xã hội.
        </p>
        <ol>
          <li>Lập ngân sách tối đa và tính thêm 2-3 tháng dự phòng chi phí.</li>
          <li>Khoanh vùng khu vực thuận tiện cho việc di chuyển hằng ngày.</li>
          <li>Tìm hiểu phản hồi từ người thuê cũ trước khi đặt cọc.</li>
        </ol>
        <h3>Đặt ngân sách hợp lý</h3>
        <p>
          Ngân sách phòng trọ giá rẻ tại Hà Nội hiện dao động từ 2 đến 4 triệu
          đồng/tháng cho phòng đơn, tùy quận. Nếu bạn ở ghép, mức này có thể
          giảm xuống còn 1,5 triệu đồng mỗi người. Tuy nhiên, hãy cộng thêm chi
          phí điện nước, gửi xe, dịch vụ chung và tối ưu lại các khoản chi mỗi
          tháng.
        </p>
        <p>Một kinh nghiệm hữu ích được chia sẻ rộng rãi là:</p>
        <blockquote>
          <p>
            "Đừng bao giờ ký hợp đồng nếu bạn chưa đọc kỹ điều khoản về tiền
            cọc, thời hạn báo trước khi trả phòng và mức tăng giá hằng năm."
          </p>
        </blockquote>
        <p>
          Khi đi xem phòng, hãy kiểm tra hệ thống điện nước, cửa sổ, khóa cửa và
          khả năng thoát hiểm. Nếu có thể, hãy đến vào buổi tối để đánh giá mức
          độ an ninh và tiếng ồn xung quanh.
        </p>
        <figure>
          <Image src={travelhero2Image} alt="blog" className="rounded-2xl" />
          <figcaption>
            Khu trọ yên tĩnh gần các trường đại học luôn hút người thuê và có
            giá tăng theo mùa nhập học.
          </figcaption>
        </figure>
        <p>
          Các nguồn thông tin đáng tin cậy sẽ giúp bạn tiết kiệm nhiều thời
          gian. Ngoài những website quen thuộc, hãy tận dụng các hội nhóm cư dân
          địa phương, diễn đàn sinh viên hoặc nhờ bạn bè giới thiệu.
        </p>
        <ul>
          <li>Tìm kiếm từ khóa theo tên phố, khu vực và mức giá cụ thể.</li>
          <li>Liên hệ trực tiếp chủ nhà để thương lượng giá và điều kiện.</li>
          <li>Đặt lịch xem phòng vào nhiều khung giờ khác nhau.</li>
        </ul>
        <p>Nếu bạn cảm thấy phân vân, hãy lập bảng so sánh giữa các lựa chọn.</p>
        <h2>Thương lượng và ký hợp đồng thông minh</h2>
        <p>
          Khi đã ưng ý phòng trọ, đừng vội chuyển tiền cọc. Bạn nên yêu cầu hợp
          đồng rõ ràng, có chữ ký của cả hai bên và người làm chứng nếu cần.
          Những điều khoản quan trọng gồm thời hạn thuê tối thiểu, quy định về
          khách, vật nuôi, sửa chữa và trách nhiệm khi xảy ra hỏng hóc.
        </p>
        <p>
          Để giữ mức giá tốt, hãy chủ động đề xuất thanh toán dài hạn hoặc hỗ trợ
          chủ nhà việc bảo trì. Đôi khi những cam kết nhỏ này giúp bạn tiết kiệm
          được vài trăm nghìn mỗi tháng.
        </p>

        <p>
          Hy vọng những bí quyết trên sẽ giúp bạn tìm được phòng trọ lý tưởng ở
          Hà Nội. Chúc bạn sớm có không gian sống thoải mái để tập trung cho mục
          tiêu học tập và sự nghiệp!
        </p>
        <h3>Đừng quên bảo vệ quyền lợi của mình</h3>

        <p>
          Lưu lại tất cả chứng từ, hóa đơn và hình ảnh hiện trạng phòng ngay khi
          nhận nhà. Điều này không chỉ giúp bạn yên tâm mà còn là bằng chứng quan
          trọng nếu phát sinh tranh chấp về sau.
        </p>
      </div>
    );
  };

  const renderTags = () => {
    return (
      <div className="max-w-screen-md mx-auto flex flex-wrap">
        <a
          className="nc-Tag inline-block bg-white text-sm text-neutral-600 dark:text-neutral-300 py-2 rounded-lg border border-neutral-100  md:px-4 dark:bg-neutral-700 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-6000 mr-2 mb-2"
          href="##"
        >
          Hà Nội
        </a>
        <a
          className="nc-Tag inline-block bg-white text-sm text-neutral-600 dark:text-neutral-300 py-2 rounded-lg border border-neutral-100  md:px-4 dark:bg-neutral-700 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-6000 mr-2 mb-2"
          href="##"
        >
          Mẹo thuê trọ
        </a>
        <a
          className="nc-Tag inline-block bg-white text-sm text-neutral-600 dark:text-neutral-300 py-2 rounded-lg border border-neutral-100  md:px-4 dark:bg-neutral-700 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-6000 mr-2 mb-2"
          href="##"
        >
          Sinh viên
        </a>
      </div>
    );
  };

  const renderAuthor = () => {
    return (
      <div className="max-w-screen-md mx-auto ">
        <div className="nc-SingleAuthor flex">
          <Avatar sizeClass="w-11 h-11 md:w-24 md:h-24" />
          <div className="flex flex-col ml-3 max-w-lg sm:ml-5 space-y-1">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">
              WRITEN BY
            </span>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
              <a href="/">Lan Chi</a>
            </h2>
            <span className="text-sm text-neutral-500 sm:text-base dark:text-neutral-300">
              Lan Chi là chuyên gia tư vấn bất động sản cho sinh viên và người
              trẻ tại Hà Nội, với hơn 7 năm kinh nghiệm đồng hành cùng hàng trăm
              bạn trẻ tìm được chỗ ở phù hợp.
              <a className="text-primary-6000 font-medium ml-1" href="/">
                Đọc thêm
              </a>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCommentForm = () => {
    return (
      <div className="max-w-screen-md mx-auto pt-5">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          Responses (14)
        </h3>
        <form className="nc-SingleCommentForm mt-5">
          <Textarea />
          <div className="mt-2 space-x-3">
            <ButtonPrimary>Submit</ButtonPrimary>
            <ButtonSecondary>Cancel</ButtonSecondary>
          </div>
        </form>
      </div>
    );
  };

  const renderCommentLists = () => {
    return (
      <div className="max-w-screen-md mx-auto">
        <ul className="nc-SingleCommentLists space-y-5">
          <li>
            <Comment />
            <ul className="pl-4 mt-5 space-y-5 md:pl-11">
              <li>
                <Comment isSmall />
              </li>
            </ul>
          </li>
          <li>
            <Comment />
            <ul className="pl-4 mt-5 space-y-5 md:pl-11">
              <li>
                <Comment isSmall />
              </li>
            </ul>
          </li>
        </ul>
      </div>
    );
  };

  const renderPostRelated = (post: PostDataType) => {
    return (
      <div
        key={post.id}
        className="relative aspect-w-3 aspect-h-4 rounded-3xl overflow-hidden group"
      >
        <Link href={post.href as Route} />
        <Image
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
          src={post.featuredImage}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          alt=""
        />
        <div>
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black"></div>
        </div>
        <div className="flex flex-col justify-end items-start text-xs text-neutral-300 space-y-2.5 p-4">
          <Badge name="Categories" />
          <h2 className="block text-lg font-semibold text-white ">
            <span className="line-clamp-2">{post.title}</span>
          </h2>

          <div className="flex">
            <span className="block text-neutral-200 hover:text-white font-medium truncate">
              {post.author.displayName}
            </span>
            <span className="mx-1.5 font-medium">·</span>
            <span className="font-normal truncate">{post.date}</span>
          </div>
        </div>
        <Link href={post.href as Route} />
      </div>
    );
  };

  return (
    <div className="nc-PageSingle pt-8 lg:pt-16 ">
      {renderHeader()}
      <div className="container my-10 sm:my-12 ">
        <Image className="w-full rounded-xl" src={travelhero2Image} alt="" />
      </div>

      <div className="nc-SingleContent container space-y-10">
        {renderContent()}
        {renderTags()}
        <div className="max-w-screen-md mx-auto border-b border-t border-neutral-100 dark:border-neutral-700"></div>
        {renderAuthor()}
        {renderCommentForm()}
        {renderCommentLists()}
      </div>
      <div className="relative bg-neutral-100 dark:bg-neutral-800 py-16 lg:py-28 mt-16 lg:mt-24">
        <div className="container ">
          <h2 className="text-3xl font-semibold">Related posts</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {/*  */}
            {DEMO_POSTS.filter((_, i) => i < 4).map(renderPostRelated)}
            {/*  */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
