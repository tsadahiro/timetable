import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: any }) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // 初回チェック
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setSession(session);
      setLoading(false);

      if (session?.user?.email) {
        checkDomain(session.user.email);
      }
    };

    const checkDomain = async (email: string) => {
      const domain = email.split("@")[1] || "";
      const allowedDomains = ["tsuda.ac.jp"]; // 🔹 ← 許可するドメインをここに設定
      const isAllowed = allowedDomains.includes(domain);

      if (isAllowed) {
        setAuthorized(true);
      } else {
        alert("このアプリは許可されたドメインのユーザーのみ利用できます。");
        await supabase.auth.signOut();
        setAuthorized(false);
      }
    };

    checkSession();

    // セッション変更を監視
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user?.email) {
          await checkDomain(session.user.email);
        } else {
          setAuthorized(false);
        }
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p>認証確認中...</p>;

  // 🔹 未ログインまたは不許可ドメインはログイン画面へ
  if (!session || !authorized) return <Navigate to="/" replace />;

  return children;
}

//import { Navigate } from "react-router-dom";
//import { useEffect, useState } from "react";
//import { supabase } from "../lib/supabaseClient";
//
//export default function ProtectedRoute({ children }: { children: any }) {
//  const [session, setSession] = useState<any | null>(null);
//  const [loading, setLoading] = useState(true);
//
//  useEffect(() => {
//    // 初回チェック
//    supabase.auth.getSession().then(({ data: { session } }) => {
//      setSession(session);
//      setLoading(false);
//    });
//
//    // セッション変更を監視
//    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//      setSession(session);
//      setLoading(false);
//    });
//
//    return () => listener.subscription.unsubscribe();
//  }, []);
//
//  if (loading) return <p>認証確認中...</p>;
//  if (!session) return <Navigate to="/" replace />;
//  return children;
//}
