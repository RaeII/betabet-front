import "./index.css";
import { Composition } from "remotion";
import { OnboardingVideo, ONBOARDING_DURATION } from "./OnboardingVideo";
import { LiveScene, LIVE_DURATION } from "./live/LiveScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OnboardingVideo"
        component={OnboardingVideo}
        durationInFrames={ONBOARDING_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LiveScene"
        component={LiveScene}
        durationInFrames={LIVE_DURATION}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
