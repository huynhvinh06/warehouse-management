import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { drawerWidth } from "./Sidebar";

function Header() {
  const handleLogout = () => {
    // TODO: xóa token, redirect về trang login
    console.log("Đăng xuất");
  };

  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          📦 Warehouse Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">Xin chào, Admin</Typography>
          <Button color="inherit" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
