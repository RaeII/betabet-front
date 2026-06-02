import { Img, staticFile } from "remotion";
import { colors } from "./theme";

interface CursorProps {
  // Logical viewport coordinates (origin = top-left of the app viewport).
  x: number;
  y: number;
  // 0 = released, 1 = fully pressed.
  press?: number;
  // 0 = no ripple, >0..1 = expanding click ripple progress.
  ripple?: number;
}

const SIZE = 30;

export const Cursor: React.FC<CursorProps> = ({
  x,
  y,
  press = 0,
  ripple = 0,
}) => {
  const scale = 1 - press * 0.2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: 2,
            top: 2,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: 999,
            border: `2px solid ${colors.brand}`,
            transform: `scale(${1 + ripple * 3.4})`,
            opacity: (1 - ripple) * 0.55,
          }}
        />
      )}
      <Img
        src={staticFile("cursor.png")}
        style={{
          width: SIZE,
          height: SIZE,
          display: "block",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
};
