import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button, Box, Typography, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // すでにログイン済みなら時間割ページへ
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/timetable");
    });
  }, [navigate]);

  const handleLogin = async () => {
    // 現在の環境に応じてリダイレクト先を設定
    const redirectTo =
      window.location.hostname === "localhost"
        ? "http://localhost:5173/timetable"
        : "https://timetable-neon.vercel.app/timetable";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Login error:", error);
      alert("ログインに失敗しました。");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to bottom right, #e3f2fd, #bbdefb)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 3,
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" gutterBottom>
          授業時間割システム
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Google アカウントでログインしてください
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Googleでログイン
        </Button>
      </Paper>
    </Box>
  );
}
