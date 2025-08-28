import { LetterAnimationClient } from "@/app/_clientBoundary/LetterAnimationClient";

export const Header = () => {
  return (
    <div className="text-center mb-2">
      <LetterAnimationClient />

      <h1 className="handwriting text-6xl font-bold gradient-text mb-2">
        목소리 편지
      </h1>

      {/* 브랜드 슬로건 */}
      <div className="glass-warm rounded-2xl p-1 border border-yellow-200">
        <p className="handwriting text-xl text-purple-800 font-semibold">
          마음을 전하는 새로운 방법
        </p>
      </div>
    </div>
  );
};
