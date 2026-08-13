import { useEffect, useState } from "react";
import { apiRequest, saveSession } from "./api";

const emptyRegister = {
  name: "",
  email: "",
  mobile: "",
  password: ""
};

export default function AuthPage() {
  const [mode, setMode] = useState("login-password");
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpPurpose, setOtpPurpose] = useState("auth");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleResult = (data) => {
    setMessage(data.message || "Done");
    setError("");
    if (typeof data.cooldownSeconds === "number") {
      setCooldownSeconds(data.cooldownSeconds);
    }
    if (data.token) {
      saveSession(data);
      setMessage("Logged in successfully");
    }
  };

  const run = async (callback) => {
    try {
      const data = await callback();
      handleResult(data);
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  const requestRegisterOtp = () => {
    setEmail(registerForm.email);
    setOtpPurpose("auth");
    return run(() =>
      apiRequest("/auth/register/request", {
        method: "POST",
        body: JSON.stringify(registerForm)
      })
    );
  };

  const loginWithPassword = () =>
    run(() =>
      apiRequest("/auth/password/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
    );

  const requestLoginOtp = () => {
    setOtpPurpose("auth");
    return run(() =>
      apiRequest("/auth/login/otp/request", {
        method: "POST",
        body: JSON.stringify({ email })
      })
    );
  };

  const verifyAuthOtp = () =>
    run(() =>
      apiRequest("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp })
      })
    );

  const requestForgotOtp = () => {
    setOtpPurpose("password_reset");
    return run(() =>
      apiRequest("/auth/forgot/request", {
        method: "POST",
        body: JSON.stringify({ email })
      })
    );
  };

  const verifyForgotOtp = () =>
    run(() =>
      apiRequest("/auth/forgot/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp, password: newPassword })
      })
    );

  const resendOtp = () =>
    run(() =>
      apiRequest("/auth/otp/resend", {
        method: "POST",
        body: JSON.stringify({ email, purpose: otpPurpose })
      })
    );

  return (
    <main className="auth-page">
      <div className="auth-tabs">
        <button onClick={() => setMode("register")}>Register</button>
        <button onClick={() => setMode("login-password")}>Login Password</button>
        <button onClick={() => setMode("login-otp")}>Login OTP</button>
        <button onClick={() => setMode("forgot")}>Forgot Password</button>
      </div>

      {mode === "register" && (
        <section className="auth-box">
          <h2>Create Account</h2>
          <input
            placeholder="Name"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
          />
          <input
            placeholder="Mobile number"
            value={registerForm.mobile}
            onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          />
          <button onClick={requestRegisterOtp}>Send OTP</button>
        </section>
      )}

      {mode === "login-password" && (
        <section className="auth-box">
          <h2>Login</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={loginWithPassword}>Login</button>
          <button onClick={() => setMode("forgot")}>Forgot password?</button>
        </section>
      )}

      {mode === "login-otp" && (
        <section className="auth-box">
          <h2>Login with OTP</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={requestLoginOtp}>Send OTP</button>
        </section>
      )}

      {mode === "forgot" && (
        <section className="auth-box">
          <h2>Reset Password</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={requestForgotOtp}>Send Reset OTP</button>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </section>
      )}

      {(mode === "register" || mode === "login-otp" || mode === "forgot") && (
        <section className="auth-box">
          <h2>Verify OTP</h2>
          <input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          {mode === "forgot" ? (
            <button onClick={verifyForgotOtp}>Reset Password</button>
          ) : (
            <button onClick={verifyAuthOtp}>Verify & Login</button>
          )}
          <button disabled={cooldownSeconds > 0} onClick={resendOtp}>
            {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Resend OTP"}
          </button>
        </section>
      )}

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </main>
  );
}

