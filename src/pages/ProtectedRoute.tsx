import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: any }) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const allowedDomains = ["tsuda.ac.jp"]; // ← 許可ドメインをここに設定

    const checkDomain = async (email: string) => {
      const domain = email.split("@")[1] || "";
      const isAllowed = allowedDomains.includes(domain);

      if (isAllowed) {
        setAuthorized(true);
      } else {
        // 不許可ドメインの場合は即座にログアウト処理
        setSigningOut(true);
        alert("このアプリは許可されたドメインのユーザーのみ利用できます。");
        await supabase.auth.signOut();
        setSession(null);
        setAuthorized(false);
        setSigningOut(false);
      }
    };

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      setSession(s);

      if (s?.user?.email) {
        await checkDomain(s.user.email);
      }

      setLoading(false);
    };

    checkSession();

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

  // 🔹 状態別レンダリング
  if (loading || signingOut) return <p>認証確認中...</p>;
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
//  const [authorized, setAuthorized] = useState(false);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      // 初回チェック
//      const { data } = await supabase.auth.getSession();
//      const session = data.session;
//      setSession(session);
//      setLoading(false);
//
//      if (session?.user?.email) {
//        checkDomain(session.user.email);
//      }
//    };
//
//    const checkDomain = async (email: string) => {
//      const domain = email.split("@")[1] || "";
//      const allowedDomains = ["tsuda.ac.jp"]; //  許可するドメインをここに設定
//      const isAllowed = allowedDomains.includes(domain);
//
//      if (isAllowed) {
//        setAuthorized(true);
//      } else {
//        alert("このアプリは許可されたドメインのユーザーのみ利用できます。");
//        await supabase.auth.signOut();
//        setAuthorized(false);
//      }
//    };
//
//    checkSession();
//
//    // セッション変更を監視
//    const { data: listener } = supabase.auth.onAuthStateChange(
//      async (_event, session) => {
//        setSession(session);
//        if (session?.user?.email) {
//          await checkDomain(session.user.email);
//        } else {
//          setAuthorized(false);
//        }
//        setLoading(false);
//      }
//    );
//
//    return () => listener.subscription.unsubscribe();
//  }, []);
//
//  if (loading) return <p>認証確認中...</p>;
//
//  // 🔹 未ログインまたは不許可ドメインはログイン画面へ
//  if (!session || !authorized) return <Navigate to="/" replace />;
//
//  return children;
//}

