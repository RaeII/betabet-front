import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { colors } from "../theme";
import { Cursor } from "../Cursor";
import { BetCardReplica } from "./BetCardReplica";
import {
  LiveScoreboardReplica,
  MatchPointsCardReplica,
} from "./MatchDetailReplicas";
import { RankingReplica, ROW_H, type RankRow } from "./RankingReplica";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const EASE = Easing.bezier(0.4, 0, 0.2, 1);
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// ---------------------------------------------------------------------------
// Timeline (frames @ 30fps)
// ---------------------------------------------------------------------------
const S1 = { from: 0, dur: 84 };
const S2 = { from: 74, dur: 210 };
const S3 = { from: 274, dur: 336 };
const S4 = { from: 600, dur: 300 };
export const LIVE_DURATION = S4.from + S4.dur; // 900

// ---- helpers --------------------------------------------------------------
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Eased keyframe interpolation over an array of [frame, value] stops.
function kf(
  frame: number,
  stops: Array<[number, number]>,
  easing: (t: number) => number = EASE,
): number {
  if (frame <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (frame >= last[0]) return last[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [f0, v0] = stops[i];
    const [f1, v1] = stops[i + 1];
    if (frame >= f0 && frame <= f1) {
      return lerp(v0, v1, easing(interpolate(frame, [f0, f1], [0, 1])));
    }
  }
  return last[1];
}

function fade(local: number, dur: number, inD = 16, outD = 18): number {
  const i = interpolate(local, [0, inD], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const o = interpolate(local, [dur - outD, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return Math.min(i, o);
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
// Short symmetrical pop centered on a key frame.
function pop(f: number, c: number, span = 9): number {
  if (f < c - span || f > c + span) return 0;
  return f <= c
    ? interpolate(f, [c - span, c], [0, 1], { easing: EASE_OUT })
    : interpolate(f, [c, c + span], [1, 0], { easing: EASE });
}

type Waypoint = { f: number; x: number; y: number };
function pathAt(frame: number, path: Waypoint[]): { x: number; y: number } {
  if (frame <= path[0].f) return { x: path[0].x, y: path[0].y };
  const last = path[path.length - 1];
  if (frame >= last.f) return { x: last.x, y: last.y };
  let a = path[0];
  let b = path[1];
  for (let i = 0; i < path.length - 1; i++) {
    if (frame >= path[i].f && frame <= path[i + 1].f) {
      a = path[i];
      b = path[i + 1];
      break;
    }
  }
  const t = EASE(interpolate(frame, [a.f, b.f], [0, 1]));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

// Camera rig: centers content in the 1:1 frame and applies a scale + pan.
const Camera: React.FC<{
  scale: number;
  x?: number;
  y?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ scale, x = 0, y = 0, opacity = 1, children }) => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", opacity }}
  >
    <div style={{ transform: `scale(${scale}) translate(${x}px, ${y}px)` }}>
      {children}
    </div>
  </AbsoluteFill>
);

// ===========================================================================
// Scene 1 — Brand intro (Fade Up + Blur Reveal + Opacity Fade + Soft Scale In)
// ===========================================================================
const IntroScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const op = fade(f, dur, 1, 18);
  const reveal = interpolate(f, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const blur = (1 - reveal) * 14;
  const ty = (1 - reveal) * 36;
  const scale = 0.95 + reveal * 0.05;
  const drift = interpolate(f, [0, dur], [0, 0.05]); // slow push-in

  const subReveal = interpolate(f, [14, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity: op }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          transform: `translateY(${ty}px) scale(${scale + drift})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <Img
          src={staticFile("bolao_clt_logo.png")}
          style={{
            width: 210,
            height: 210,
            objectFit: "contain",
            filter: "drop-shadow(0 16px 36px rgba(18,61,42,0.20))",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 70,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: colors.text,
            }}
          >
            Bolão CLT
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 25,
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: colors.textMuted,
              opacity: subReveal,
              transform: `translateY(${(1 - subReveal) * 10}px)`,
            }}
          >
            Palpite. Acompanhe. Vença.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===========================================================================
// Scene 2 — Bet card (Flip transition + cursor placing 4 × 0 for Brazil)
// ===========================================================================
const CLICKS = [48, 66, 84, 102];
const SAVE_CLICK = 130;
const DETAIL_CLICK = 176;

const BetScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const op = fade(f, dur, 14, 18);

  // 3D flip entrance.
  const flip = interpolate(f, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const rotateY = (1 - flip) * -92;
  const cardOpacity = interpolate(f, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Brazil (home) score driven by the cursor's stepper clicks → 4. Argentina 0.
  const homeCount = CLICKS.filter((c) => f >= c).length;
  const home = String(homeCount);
  const away = "0";
  const homePress = Math.max(...CLICKS.map((c) => clickPress(f, c)));

  const reachedFour = f >= CLICKS[3] + 2;
  const showSave = reachedFour && f < SAVE_CLICK + 3;
  const savePress = clickPress(f, SAVE_CLICK);
  const showSaved = f >= SAVE_CLICK + 4 && f < SAVE_CLICK + 30;

  // gentle ken-burns drift on the floating card
  const drift = kf(f, [
    [0, 0],
    [dur, 0.03],
  ]);

  const path: Waypoint[] = [
    { f: 0, x: 770, y: 770 },
    { f: 40, x: 500, y: 518 }, // Brazil "+" stepper
    { f: 110, x: 500, y: 518 },
    { f: 126, x: 536, y: 628 }, // save button
    { f: 158, x: 536, y: 628 },
    { f: DETAIL_CLICK, x: 536, y: 628 }, // "Fique por dentro"
    { f: dur, x: 536, y: 628 },
  ];
  const { x: cx, y: cy } = pathAt(f, path);
  const press = Math.max(homePress, savePress, clickPress(f, DETAIL_CLICK));
  const ripple = Math.max(
    ...CLICKS.map((c) => clickRipple(f, c)),
    clickRipple(f, SAVE_CLICK),
    clickRipple(f, DETAIL_CLICK),
  );

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ perspective: 1700 }}>
          <div
            style={{
              transform: `rotateY(${rotateY}deg) scale(${1 + drift})`,
              transformOrigin: "center",
              opacity: cardOpacity,
            }}
          >
            <BetCardReplica
              home={home}
              away={away}
              homePlusPress={homePress}
              showSave={showSave}
              savePress={savePress}
              showSaved={showSaved}
            />
          </div>
        </div>
      </AbsoluteFill>
      <Cursor x={cx} y={cy} press={press} ripple={ripple} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// Scene 3 — Match detail (live scoreboard + live points, cinematic camera)
// ===========================================================================
const GOAL_FRAMES = [60, 120, 196]; // 2×0, 3×0, 4×0 (exact)
const EXACT_FRAME = 196;
const SCORERS = [
  "Vinícius Jr., 12'",
  "Rodrygo, 34'",
  "Raphinha, 58'",
  "Endrick, 71'",
];

const MatchDetailScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const op = fade(f, dur, 16, 18);

  const homeScore = 1 + GOAL_FRAMES.filter((c) => f >= c).length;
  const awayScore = 0;
  const elapsed = Math.round(
    kf(f, [
      [0, 23],
      [EXACT_FRAME, 71],
      [dur, 78],
    ]),
  );
  const clock = `${elapsed}'`;
  const scorePop = Math.max(pop(f, 0, 12), ...GOAL_FRAMES.map((c) => pop(f, c)));

  // Points: result correct (+5) early, exact-score bonus (+10) at 4×0.
  const points = Math.round(
    kf(f, [
      [0, 0],
      [16, 5],
      [EXACT_FRAME, 5],
      [EXACT_FRAME + 18, 15],
    ]),
  );
  const pointsPop = Math.max(pop(f, 16, 9), pop(f, EXACT_FRAME, 12));
  const showResultChip = f >= 16;
  const showExactChip = f >= EXACT_FRAME + 2;

  // ---- camera choreography -------------------------------------------------
  // pull-out reveal → push-in on scoreboard → pan down to points → dolly-zoom
  // on the exact-score payoff → pull-out to reveal both cards.
  const scale = kf(f, [
    [0, 0.99],
    [18, 1.0],
    [70, 1.3],
    [120, 1.34],
    [150, 1.32],
    [196, 1.32],
    [214, 1.5],
    [262, 0.9],
    [dur, 0.88],
  ]);
  const ty = kf(f, [
    [0, 0],
    [18, 0],
    [70, 150],
    [120, 156],
    [150, 90],
    [170, -120],
    [214, -132],
    [262, 0],
    [dur, 0],
  ]);
  const cx = kf(f, [
    [0, 0],
    [120, 10],
    [262, 0],
  ]);

  const bPoints = kf(f, [
    [0, 0],
    [22, 0],
    [44, 4],
    [118, 4],
    [150, 0],
    [dur, 0],
  ]);
  const bScore = kf(f, [
    [0, 0],
    [128, 0],
    [152, 4],
    [210, 4],
    [236, 0],
    [dur, 0],
  ]);

  return (
    <Camera scale={scale} x={cx} y={ty} opacity={op}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div style={{ filter: `blur(${bScore}px)` }}>
          <LiveScoreboardReplica
            homeScore={homeScore}
            awayScore={awayScore}
            clock={clock}
            homeGoals={SCORERS.slice(0, homeScore)}
            scorePop={scorePop}
          />
        </div>
        <div style={{ filter: `blur(${bPoints}px)` }}>
          <MatchPointsCardReplica
            points={points}
            bet="4 × 0"
            totalBefore={42}
            totalWith={42 + points}
            showResultChip={showResultChip}
            showExactChip={showExactChip}
            resultPoints={5}
            exactPoints={10}
            pointsPop={pointsPop}
          />
        </div>
      </div>
    </Camera>
  );
};

// ===========================================================================
// Scene 4 — Live ranking with animated position swaps
// ===========================================================================
interface UserDef {
  key: string;
  name: string;
  isMe: boolean;
  initRank: number;
  finalRank: number;
  initPts: number;
  finalPts: number;
}

const USERS: UserDef[] = [
  { key: "marina", name: "Marina", isMe: false, initRank: 0, finalRank: 1, initPts: 58, finalPts: 58 },
  { key: "me", name: "Você", isMe: true, initRank: 1, finalRank: 0, initPts: 52, finalPts: 67 },
  { key: "carlos", name: "Carlos", isMe: false, initRank: 2, finalRank: 3, initPts: 49, finalPts: 49 },
  { key: "bia", name: "Bia", isMe: false, initRank: 3, finalRank: 4, initPts: 45, finalPts: 45 },
  { key: "joao", name: "João", isMe: false, initRank: 4, finalRank: 2, initPts: 40, finalPts: 56 },
];

const REORDER: [number, number] = [54, 146];

const RankingScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const op = fade(f, dur, 16, 18);

  const t = EASE(
    interpolate(f, REORDER, [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const rows: RankRow[] = USERS.map((u) => {
    const rankF = lerp(u.initRank, u.finalRank, t);
    const points = Math.round(lerp(u.initPts, u.finalPts, t));
    const gained = points - u.initPts;
    return {
      key: u.key,
      name: u.name,
      isMe: u.isMe,
      points,
      livePoints: gained > 0 ? gained : 0,
      y: rankF * ROW_H,
      rank: Math.round(rankF) + 1,
      movedUp: u.finalRank < u.initRank && t > 0.55,
    };
  });

  const meGained = rows.find((r) => r.isMe)?.livePoints ?? 0;
  const liveDelta = meGained > 0 ? meGained : 15;

  // Gentle push-in that settles after the board resolves.
  const scale = kf(f, [
    [0, 0.95],
    [16, 1.0],
    [150, 1.04],
    [176, 1.1],
    [236, 1.07],
    [dur, 0.99],
  ]);
  const ty = kf(f, [
    [0, 0],
    [176, -18],
    [236, -10],
    [dur, 0],
  ]);

  return (
    <Camera scale={scale} y={ty} opacity={op}>
      <RankingReplica rows={rows} liveDelta={liveDelta} />
    </Camera>
  );
};

// ===========================================================================
// Composition
// ===========================================================================
export const LiveScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#ffffff", fontFamily }}>
      <Sequence from={S1.from} durationInFrames={S1.dur} layout="none">
        <IntroScene dur={S1.dur} />
      </Sequence>
      <Sequence from={S2.from} durationInFrames={S2.dur} layout="none">
        <BetScene dur={S2.dur} />
      </Sequence>
      <Sequence from={S3.from} durationInFrames={S3.dur} layout="none">
        <MatchDetailScene dur={S3.dur} />
      </Sequence>
      <Sequence from={S4.from} durationInFrames={S4.dur} layout="none">
        <RankingScene dur={S4.dur} />
      </Sequence>
    </AbsoluteFill>
  );
};
