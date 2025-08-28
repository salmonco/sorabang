import { Mail, Mic, Users } from "lucide-react";

export const UsageGuide = () => {
  return (
    <div className="mt-8 pt-8 border-t border-purple-200">
      <h3 className="text-purple-800 font-medium mb-4 text-center handwriting text-xl">
        어떻게 작동하나요?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="cassette-tape w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Users className="text-purple-600" size={20} />
          </div>
          <p className="text-purple-600">
            <span className="font-medium text-purple-800">
              1. 목소리 방 생성
            </span>
            <br />
            제목을 입력하고 링크를 만들어요
          </p>
        </div>
        <div className="text-center">
          <div className="cassette-tape w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Mic className="text-pink-500" size={20} />
          </div>
          <p className="text-purple-600">
            <span className="font-medium text-purple-800">2. 친구 초대</span>
            <br />
            링크를 공유해서 음성메시지를 받아요
          </p>
        </div>
        <div className="text-center">
          <div className="cassette-tape w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Mail className="text-orange-500" size={20} />
          </div>
          <p className="text-purple-600">
            <span className="font-medium text-purple-800">3. 편지 감상</span>
            <br />
            모든 메시지를 편지처럼 들어요
          </p>
        </div>
      </div>
    </div>
  );
};
