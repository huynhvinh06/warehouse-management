import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Đếm số tăng dần từ 0 đến giá trị cần hiển thị
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = Number(target);
    if (!Number.isFinite(end)) return undefined;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return undefined;
    }

    let frame;
    let start;

    const step = (t) => {
      if (start === undefined) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

// color: primary | success | warning | info | error
function StatCard({ label, value, icon, color = "primary" }) {
  const animated = useCountUp(value);
  const isNumber = Number.isFinite(Number(value));

  return (
    <Card
      sx={(theme) => ({
        height: "100%",
        borderLeft: `4px solid ${theme.palette[color].main}`,
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 24px rgba(16, 24, 40, 0.12)",
        },
      })}
    >
      <CardContent
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4">
            {isNumber ? animated.toLocaleString("vi-VN") : value}
          </Typography>
        </Box>

        {icon && (
          <Box
            sx={(theme) => ({
              width: 52,
              height: 52,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              color: theme.palette[color].main,
              backgroundColor: alpha(theme.palette[color].main, 0.12),
            })}
          >
            {icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
