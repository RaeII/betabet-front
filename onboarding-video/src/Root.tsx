import "./index.css";
import { Composition } from "remotion";
import { OnboardingVideo, ONBOARDING_DURATION } from "./OnboardingVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OnboardingVideo"
      component={OnboardingVideo}
      durationInFrames={ONBOARDING_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
