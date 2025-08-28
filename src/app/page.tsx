import { MainCardClient } from "@/app/_clientBoundary/MainCardClient";
import { RoomFormClient } from "@/app/_clientBoundary/RoomFormClient";
import { Footer } from "@/app/_components/Footer";
import { Header } from "@/app/_components/Header";
import { UsageGuide } from "@/app/_components/UsageGuide";
import { TrackPageView } from "@/app/_shared/clientBoundary/TrackPageView";
import { Toaster } from "react-hot-toast";

const RootPage = () => {
  return (
    <>
      <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
        <Toaster position="top-right" />

        <div className="w-full max-w-2xl">
          {/* 헤더 */}
          <Header />

          {/* 메인 카드 */}
          <MainCardClient>
            <RoomFormClient />
            <UsageGuide />
          </MainCardClient>

          {/* 푸터 */}
          <Footer />
        </div>
      </div>
      <TrackPageView />
    </>
  );
};

export default RootPage;
