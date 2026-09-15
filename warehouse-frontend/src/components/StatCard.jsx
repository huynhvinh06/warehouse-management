import { Card, CardContent, Typography } from "@mui/material";

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h3">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
