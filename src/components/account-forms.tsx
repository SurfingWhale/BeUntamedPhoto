"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updatePassword,
  updateProfile,
  type AccountState,
} from "@/app/account/actions";

const IDLE: AccountState = { status: "idle", message: "" };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn btn--quiet"
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending && <span className="btn__spin" aria-hidden="true" />}
      {pending ? "Saving" : label}
    </button>
  );
}

function Result({ state }: { state: AccountState }) {
  if (state.status === "idle") return null;
  return (
    <p
      className="form-note"
      data-tone={state.status === "error" ? "error" : undefined}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function AccountForms({ displayName }: { displayName: string }) {
  const [nameState, nameAction] = useActionState(updateProfile, IDLE);
  const [pwState, pwAction] = useActionState(updatePassword, IDLE);

  return (
    <>
      <form className="auth__form" action={nameAction}>
        <div className="field">
          <label className="field__label" htmlFor="display_name">
            Display name
          </label>
          <input
            className="field__input"
            id="display_name"
            name="display_name"
            defaultValue={displayName}
            autoComplete="nickname"
            required
            aria-required="true"
            aria-invalid={nameState.status === "error" ? true : undefined}
            aria-describedby="display_name-help"
          />
          <p className="field__help" id="display_name-help">
            Signs every note you leave.
          </p>
        </div>
        <div>
          <Submit label="Save name" />
        </div>
        <Result state={nameState} />
      </form>

      <form className="auth__form" action={pwAction}>
        <div className="field">
          <label className="field__label" htmlFor="new_password">
            New password
          </label>
          <input
            className="field__input"
            id="new_password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={pwState.status === "error" ? true : undefined}
            aria-describedby="new_password-help"
          />
          <p className="field__help" id="new_password-help">
            At least 8 characters.
          </p>
        </div>
        <div>
          <Submit label="Change password" />
        </div>
        <Result state={pwState} />
      </form>
    </>
  );
}
