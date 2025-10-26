import { supabase } from "../lib/supabaseClient";
import { Button, Box, Typography } from "@mui/material";

export default function LoginPage() {
const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        import.meta.env.MODE === "development"
          ? "http://localhost:5173/timetable"
          : "https://timetable-neon.vercel.app/timetable",
    },
  });
};
  
  //const handleLogin = async () => {
  //  await supabase.auth.signInWithOAuth({
  //    provider: "google",
  //    options: {
  //      redirectTo: window.location.origin + "/timetable",
  //    },
  //  });
  //};

  return (
    <Box sx={{ textAlign: "center", mt: "30vh" }}>
      <Typography variant="h5" gutterBottom>
        教務システムログイン
      </Typography>
      <Button variant="contained" onClick={handleLogin}>
        Googleアカウントでログイン
      </Button>
    </Box>
  );
}
