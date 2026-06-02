import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { colors } from "./theme";
import { PatternBackground } from "./PatternBackground";
import { Cursor } from "./Cursor";
import { Shell } from "./Shell";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { IdentityScreen } from "./screens/IdentityScreen";
import { ScoringScreen } from "./screens/ScoringScreen";
import { SuccessScreen } from "./screens/SuccessScreen";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// Logical full-bleed viewport (9:16). No phone bezel.
const VW = 350;
const VH = (VW * 16) / 9; // 622.2

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

// ---------------------------------------------------------------------------
// Timeline (frames @ 30fps)
// ---------------------------------------------------------------------------
const T = {
  onbReveal: [0, 16] as const,
  createClick: 82,
  toIdentity: [92, 110] as const,

  inputClick: 130,
  typeStart: 142,
  typeEnd: 212,
  scroll1: [224, 256] as const, // reveal emoji row
  emojiClick: 286,
  scroll2: [300, 332] as const, // reveal preview + próximo
  nextClick: 356,
  toScoring: [366, 384] as const,

  resultFocus: 404,
  resultChange: [410, 426] as const, // 1 -> 3
  scroll3: [446, 506] as const, // scroll through configs to CTA
  createBolaoClick: 524,
  loading: [530, 586] as const,
  toSuccess: [586, 602] as const,
};

const DURATION = 700;

const FULL_NAME = "Bolão da copa";
const FINAL_EMOJI = "🏆";

// Scroll amounts (logical px).
const ID_S1 = 70;
const ID_S2 = 120;
const SC_S = 380;

// ---- helpers --------------------------------------------------------------
function seg(f: number, range: readonly [number, number], out: [number, number]) {
  if (f <= range[0]) return out[0];
  if (f >= range[1]) return out[1];
  return out[0] + (out[1] - out[0]) * EASE(interpolate(f, range, [0, 1]));
}

function identityScroll(f: number): number {
  if (f <= T.scroll1[0]) return 0;
  if (f < T.scroll1[1]) return seg(f, T.scroll1, [0, -ID_S1]);
  if (f < T.scroll2[0]) return -ID_S1;
  if (f < T.scroll2[1]) return seg(f, T.scroll2, [-ID_S1, -ID_S1 - ID_S2]);
  return -ID_S1 - ID_S2;
}

function scoringScroll(f: number): number {
  return seg(f, T.scroll3, [0, -SC_S]);
}

function blurOf(fn: (f: number) => number, f: number): number {
  const v = Math.abs(fn(f) - fn(f - 1));
  return Math.min(v * 0.75, 7);
}

function clickPress(f: number, c: number): number {
  if (f < c - 5 || f > c + 8) return 0;
  return f <= c
    ? interpolate(f, [c - 5, c], [0, 1])
    : interpolate(f, [c, c + 8], [1, 0]);
}
function clickRipple(f: number, c: number): number {
  if (f < c || f > c + 18) return 0;
  return interpolate(f, [c, c + 18], [0.001, 1]);
}

type Waypoint = { f: number; x: number; y: number };

// Cursor path in logical viewport coordinates.
const PATH: Waypoint[] = [
  { f: 0, x: 290, y: 590 },
  { f: 22, x: 290, y: 590 },
  { f: T.createClick, x: 175, y: 512 }, // "Criar um bolão" card
  { f: 116, x: 190, y: 360 }, // drift during transition
  { f: T.inputClick, x: 174, y: 255 }, // name input
  { f: 218, x: 174, y: 255 }, // idle while typing
  { f: 268, x: 320, y: 299 }, // arrive at emoji row (right side)
  { f: T.emojiClick, x: 79, y: 299 }, // sweep left across icons -> 🏆
  { f: T.nextClick, x: 175, y: 482 }, // "Próximo"
  { f: 384, x: 180, y: 380 }, // drift during transition
  { f: T.resultFocus, x: 100, y: 238 }, // "Acertar o vencedor" field
  { f: 446, x: 130, y: 300 }, // before scrolling
  { f: T.createBolaoClick, x: 256, y: 490 }, // "Criar bolão"
  { f: 640, x: 256, y: 490 },
];

function cursorAt(frame: number): { x: number; y: number } {
  if (frame <= PATH[0].f) return { x: PATH[0].x, y: PATH[0].y };
  const last = PATH[PATH.length - 1];
  if (frame >= last.f) return { x: last.x, y: last.y };
  let a = PATH[0];
  let b = PATH[1];
  for (let i = 0; i < PATH.length - 1; i++) {
    if (frame >= PATH[i].f && frame <= PATH[i + 1].f) {
      a = PATH[i];
      b = PATH[i + 1];
      break;
    }
  }
  const t = EASE(
    interpolate(frame, [a.f, b.f], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Panel slide/fade helper.
function panel(
  frame: number,
  enter: readonly [number, number] | null,
  exit: readonly [number, number] | null,
): { x: number; opacity: number } | null {
  if (enter && frame < enter[0]) return null;
  if (enter && frame < enter[1]) {
    const t = EASE(interpolate(frame, enter, [0, 1]));
    return { x: (1 - t) * VW, opacity: t };
  }
  if (exit && frame >= exit[0]) {
    if (frame >= exit[1]) return null;
    const t = EASE(interpolate(frame, exit, [0, 1]));
    return { x: -t * VW, opacity: 1 - t };
  }
  return { x: 0, opacity: 1 };
}

const Panel: React.FC<{
  state: { x: number; opacity: number } | null;
  children: React.ReactNode;
}> = ({ state, children }) => {
  if (!state) return null;
  return (
    <AbsoluteFill
      style={{ transform: `translateX(${state.x}px)`, opacity: state.opacity }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const OnboardingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const scale = Math.max(width / VW, height / VH);

  // ---- derived state -------------------------------------------------------
  const onbReveal = interpolate(frame, T.onbReveal, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const typedCount = Math.round(
    interpolate(frame, [T.typeStart, T.typeEnd], [0, FULL_NAME.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typedName = FULL_NAME.slice(0, typedCount);
  const inputFocused = frame >= T.inputClick && frame < T.toScoring[1];
  const caretOn = Math.floor(frame / 8) % 2 === 0;
  const selectedEmoji = frame >= T.emojiClick ? FINAL_EMOJI : "⚽";

  // Result points 1 -> 3 while the field is focused.
  const resultPoints =
    frame < T.resultChange[0]
      ? 1
      : frame < T.resultChange[1]
        ? Math.round(interpolate(frame, T.resultChange, [1, 3]))
        : 3;
  const resultFocused = frame >= T.resultFocus && frame < T.scroll3[0] + 6;

  const loading = frame >= T.loading[0] && frame < T.loading[1];
  const spinnerRotation = (frame - T.loading[0]) * 14;

  const idScrollY = identityScroll(frame);
  const idBlur = blurOf(identityScroll, frame);
  const scScrollY = scoringScroll(frame);
  const scBlur = blurOf(scoringScroll, frame);

  // ---- panels --------------------------------------------------------------
  const onbState = panel(frame, null, T.toIdentity);
  const idState = panel(frame, T.toIdentity, T.toScoring);
  const scState = panel(frame, T.toScoring, T.toSuccess);

  const successReveal = interpolate(frame, T.toSuccess, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const showSuccess = frame >= T.toSuccess[0];
  const checkScale = spring({
    frame: frame - T.toSuccess[0] - 4,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.7 },
  });

  // ---- cursor --------------------------------------------------------------
  const { x: cx, y: cy } = cursorAt(frame);
  const cursorHidden = showSuccess && frame > T.toSuccess[1];
  const press = Math.max(
    clickPress(frame, T.createClick),
    clickPress(frame, T.inputClick),
    clickPress(frame, T.emojiClick),
    clickPress(frame, T.nextClick),
    clickPress(frame, T.resultFocus),
    clickPress(frame, T.createBolaoClick),
  );
  const ripple = Math.max(
    clickRipple(frame, T.createClick),
    clickRipple(frame, T.inputClick),
    clickRipple(frame, T.emojiClick),
    clickRipple(frame, T.nextClick),
    clickRipple(frame, T.resultFocus),
    clickRipple(frame, T.createBolaoClick),
  );

  const highlightCreate = frame >= T.createClick - 16 && frame < T.toIdentity[1];

  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: VW,
          height: VH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <PatternBackground />

        {/* Onboarding */}
        <Panel state={onbState}>
          <Shell showLogout filterId="b-onb">
            <OnboardingScreen
              reveal={onbReveal}
              highlightCreate={highlightCreate}
              createPress={clickPress(frame, T.createClick)}
            />
          </Shell>
        </Panel>

        {/* Identity step */}
        <Panel state={idState}>
          <Shell scrollY={idScrollY} blur={idBlur} filterId="b-id">
            <IdentityScreen
              name={typedName}
              inputFocused={inputFocused}
              caretOn={caretOn}
              selectedEmoji={selectedEmoji}
              nextPress={clickPress(frame, T.nextClick)}
            />
          </Shell>
        </Panel>

        {/* Scoring step */}
        <Panel state={scState}>
          <Shell scrollY={scScrollY} blur={scBlur} filterId="b-sc">
            <ScoringScreen
              reveal={1}
              resultPoints={resultPoints}
              resultFocused={resultFocused}
              caretOn={caretOn}
              createPress={clickPress(frame, T.createBolaoClick)}
              loading={loading}
              spinnerRotation={spinnerRotation}
            />
          </Shell>
        </Panel>

        {/* Success */}
        {showSuccess && (
          <SuccessScreen
            reveal={successReveal}
            checkScale={checkScale}
            name={FULL_NAME}
            emoji={FINAL_EMOJI}
          />
        )}

        {/* Cursor (above everything) */}
        {!cursorHidden && <Cursor x={cx} y={cy} press={press} ripple={ripple} />}
      </div>
    </AbsoluteFill>
  );
};

export const ONBOARDING_DURATION = DURATION;
