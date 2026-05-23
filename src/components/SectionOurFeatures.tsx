import React, { FC } from "react";
import rightImgPng from "@/images/hero-right-3.png";
import Image, { StaticImageData } from "next/image";
import Badge from "@/shared/Badge";

export interface SectionOurFeaturesProps {
  className?: string;
  rightImg?: StaticImageData;
  type?: "type1" | "type2";
}

const SectionOurFeatures: FC<SectionOurFeaturesProps> = ({
  className = "lg:py-14",
  rightImg = rightImgPng,
  type = "type1",
}) => {
  return (
    <div
      className={`nc-SectionOurFeatures relative flex flex-col items-center ${
        type === "type1" ? "lg:flex-row" : "lg:flex-row-reverse"
      } ${className}`}
      data-nc-id="SectionOurFeatures"
    >
      <div className="flex-grow">
        <Image src={rightImg} alt="" />
      </div>
      <div
        className={`max-w-2xl flex-shrink-0 mt-10 lg:mt-0 lg:w-2/5 ${
          type === "type1" ? "lg:pl-16" : "lg:pr-16"
        }`}
      >
        <span className="uppercase text-sm text-gray-400 tracking-widest">
          Giới thiệu
        </span>
        <h2 className="font-semibold text-4xl mt-5">Chào mừng bạn đến với Hoà Lạc Có Trọ Xinh🎀</h2>

        <ul className="space-y-10 mt-16">
          <li className="space-y-4">
            <Badge name="Chất lượng – Uy tín là hàng đầu." />
            <span className="block text-xl font-semibold">
              🏙️ Chất lượng – Uy tín là hàng đầu.
              
            </span>
            <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
            Đội ngũ “Hoà Lạc Có Trọ Xinh” luôn kiểm tra và cập nhật thông tin liên tục,đảm bảo các phòng trọ được đăng tải đều uy tín, thật 100%, không ảo, không lừa đảo.Chúng tớ mong muốn mỗi bạn sinh viên đều có thể tìm được nơi ở an toàn, thoải mái và xứng đáng.            </span>
          </li>
          <li className="space-y-4">
            <Badge color="green" name="Gần gũi – Vì chúng tớ cũng là sinh viên" />
            <span className="block text-xl font-semibold">
            🫂 Gần gũi – Vì chúng tớ cũng là sinh viên
            </span>
            <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
            Chúng tớ hiểu cảm giác phải chạy khắp nơi tìm trọ,nên muốn biến việc tìm phòng trở nên nhẹ nhàng và thân thiện hơn bao giờ hết.Từng dòng code, từng bài đăng đều được làm bằng tâm huyết và trải nghiệm thật của sinh viên FPT chúng mình.            </span>
          </li>
          <li className="space-y-4">
            <Badge color="red" name="Hành trình mới chỉ bắt đầu." />
            <span className="block text-xl font-semibold">
            💪Hành trình mới chỉ bắt đầu. 
            </span>
            <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
            “Hoà Lạc Có Trọ Xinh” là bước đầu tiên trong hành trình xây dựng một cộng đồng sinh viên – chủ trọ – dịch vụ văn minh, an toàn và đáng tin cậy tại Hoà Lạc             </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SectionOurFeatures;
