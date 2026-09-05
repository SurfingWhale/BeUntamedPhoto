"use client";

import Link from "next/link";

import type { Mode } from "@/lib/auth-mode";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  sendMagicLink,
  sendReset,
  signIn,
  signUp,
  type AuthState,
} from "@/app/enter/actions";

const IDLE: AuthState = { status: "idle", message: "" };



const COPY: Record<Mode, { title: string; blurb: string; submit: string }> = {
  signin: {
    title: "Sign in",
    blurb: "Opens the held-back galleries and the guestbook.",
    submit: "Sign in",
  },
  signup: {
    title: "Make an account",
    blurb: "Email, a password, and the name that signs your notes. Nothing else.",
    submit: "Create account",
  },
  link: {
    title: "Sign-in link",
    blurb: "No password. We email a one-time link that signs you in on this device.",
    submit: "Email me a link",
  },
  reset: {
    title: "Reset password",
    blurb: "We email a link that lets you set a new one.",
    submit: "Send reset link",
  },
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <span className="btn__spin" aria-hidden="true" />}
      {/* The label stays put while the request is in flight; the spinner
          carries the state. Swapping it removes the confirmation of what is
          being submitted. */}
      {label}
    </button>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  help,
  invalid,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  help?: string;
  invalid?: boolean;
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="field__input"
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        aria-required="true"
        aria-invalid={invalid ? true : undefined}
        aria-describedby={`${id}-help`}
      />
      <p className="field__help" id={`${id}-help`}>
        {help ?? ""}
      </p>
    </div>
  );
}

export function AuthForms({ next, mode }: { next: string; mode: Mode }) {

  const action =
    mode === "signin"
      ? signIn
      : mode === "signup"
        ? signUp
        : mode === "link"
          ? sendMagicLink
          : sendReset;

  const [state, formAction] = useActionState<AuthState, FormData>(action, IDLE);
  const copy = COPY[mode];

  /** Each mode is an address, so the switchers are links rather than buttons —
   *  back works, a long-press offers "open in new tab", and the mode survives
   *  being shared. `next` rides along or it would be dropped on the switch. */
  const to = (m: Mode) =>
    `/enter?mode=${m}&next=${encodeURIComponent(next)}`;
  const invalid = state.status === "error";

  return (
    <div className="auth">
      {/* This is the page's h1. The page used to render its own "Sign in"
          heading above it, so /enter opened with the same word twice at hero
          size — and the mode switcher's title no longer read as the state it
          controls. */}
      <div className="head">
        <p className="u-mono">Access</p>
        <h1 className="page__title">{copy.title}</h1>
        <p className="head__sub">{copy.blurb}</p>
      </div>

      <form className="auth__form" action={formAction} key={mode}>
        <input type="hidden" name="next" value={next} />

        {mode === "signup" && (
          <Field
            id="display_name"
            name="display_name"
            label="Display name"
            autoComplete="nickname"
            placeholder="Fauzy"
            help="Shown on notes you leave."
          />
        )}

        <Field
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={invalid}
        />

        {(mode === "signin" || mode === "signup") && (
          <Field
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            help={mode === "signup" ? "At least 8 characters." : undefined}
            invalid={invalid}
          />
        )}

        <div>
          <Submit label={copy.submit} />
        </div>

        {state.status !== "idle" && (
          <p
            className="form-note"
            data-tone={state.status === "error" ? "error" : undefined}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
      </form>

      <div className="auth__alt">
        {mode !== "signin" && (
          <Link className="link" href={to("signin")}>
            Sign in
          </Link>
        )}
        {mode !== "signup" && (
          <Link className="link" href={to("signup")}>
            Make an account
          </Link>
        )}
        {mode !== "link" && (
          <Link className="link" href={to("link")}>
            Email a link instead
          </Link>
        )}
        {mode !== "reset" && (
          <Link className="link" href={to("reset")}>
            Reset password
          </Link>
        )}
      </div>
    </div>
  );
}
