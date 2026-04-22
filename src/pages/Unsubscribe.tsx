import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type State = 'loading' | 'valid' | 'already' | 'invalid' | 'submitting' | 'done' | 'error';

const Unsubscribe = () => {
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }
    const validate = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const data = await res.json();
        if (!res.ok) {
          setState('invalid');
          return;
        }
        if (data.valid === false && data.reason === 'already_unsubscribed') {
          setState('already');
        } else if (data.valid === true) {
          setState('valid');
        } else {
          setState('invalid');
        }
      } catch {
        setState('invalid');
      }
    };
    validate();
  }, [token]);

  const confirm = async () => {
    setState('submitting');
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({ token }),
        },
      );
      const data = await res.json();
      if (data.success || data.reason === 'already_unsubscribed') {
        setState('done');
      } else {
        setErrorMsg(data.error || 'صار في خطأ، جرّب كمان مرة');
        setState('error');
      }
    } catch {
      setErrorMsg('في مشكلة بالشبكة');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="card-game w-full max-w-md text-center space-y-4">
        {state === 'loading' && (
          <>
            <Loader2 className="mx-auto animate-spin" size={40} />
            <p className="text-muted-foreground">جاري التحقق...</p>
          </>
        )}

        {state === 'valid' && (
          <>
            <div className="text-5xl">📭</div>
            <h1 className="text-2xl font-black">إلغاء الاشتراك</h1>
            <p className="text-sm text-muted-foreground">
              لو ضغطت تأكيد، رح نوقف نبعتلك أي إيميلات من فعاليات.
            </p>
            <button onClick={confirm} className="w-full btn-primary-game">
              تأكيد إلغاء الاشتراك
            </button>
          </>
        )}

        {state === 'submitting' && (
          <>
            <Loader2 className="mx-auto animate-spin" size={40} />
            <p className="text-muted-foreground">جاري الإلغاء...</p>
          </>
        )}

        {state === 'done' && (
          <>
            <CheckCircle2 className="mx-auto text-primary" size={56} />
            <h1 className="text-2xl font-black">تمّ ✓</h1>
            <p className="text-sm text-muted-foreground">
              ما رح يوصلك إيميلات منا بعد هلأ. خليك بأمان.
            </p>
          </>
        )}

        {state === 'already' && (
          <>
            <CheckCircle2 className="mx-auto text-primary" size={56} />
            <h1 className="text-2xl font-black">إنت أصلاً ملغي اشتراكك</h1>
            <p className="text-sm text-muted-foreground">ما في إشي يستدعي القلق.</p>
          </>
        )}

        {state === 'invalid' && (
          <>
            <AlertTriangle className="mx-auto text-destructive" size={56} />
            <h1 className="text-2xl font-black">رابط غير صالح</h1>
            <p className="text-sm text-muted-foreground">
              الرابط منتهي أو مش صحيح.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertTriangle className="mx-auto text-destructive" size={56} />
            <h1 className="text-2xl font-black">صار خطأ</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <button onClick={confirm} className="w-full btn-primary-game">
              جرّب مرة ثانية
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
