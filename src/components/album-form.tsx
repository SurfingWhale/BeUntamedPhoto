"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createAlbum, type DarkroomState } from "@/app/darkroom/actions";
import { genres } from "@/lib/site";

const IDLE: DarkroomState = { status: "idle", message: "" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <span className="btn__spin" aria-hidden="true" />}
      {pending ? "Filing" : "File the gallery"}
    </button>
  );
}

export function AlbumForm() {
  const [state, action] = useActionState(createAlbum, IDLE);

  return (
    <form className="auth__form" action={action}>
      <div className="field">
        <label className="field__label" htmlFor="title">
          Title
        </label>
        <input
          className="field__input"
          id="title"
          name="title"
          required
          aria-required="true"
          placeholder="Night matches, Bintaro"
          aria-describedby="title-help"
        />
        <p className="field__help" id="title-help">
          Shown on the index and the gallery page.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="subtitle">
          Subtitle
        </label>
        <input
          className="field__input"
          id="subtitle"
          name="subtitle"
          placeholder="Floodlight, humidity, and a lot of missed frames"
          aria-describedby="subtitle-help"
        />
        <p className="field__help" id="subtitle-help">
          One line. Optional.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="genre">
          Genre
        </label>
        <select
          className="field__select"
          id="genre"
          name="genre"
          defaultValue="event"
          aria-describedby="genre-help"
        >
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
        <p className="field__help" id="genre-help">
          Which body of work this belongs to. Visitors filter the index by it.
        </p>
      </div>

      <div className="row2">
        <div className="field">
          <label className="field__label" htmlFor="place">
            Place
          </label>
          <input className="field__input" id="place" name="place" placeholder="Bintaro" />
          <p className="field__help" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="year">
            Year
          </label>
          <input
            className="field__input u-tabular"
            id="year"
            name="year"
            inputMode="numeric"
            placeholder="2026"
          />
          <p className="field__help" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label className="field__label" htmlFor="slug">
            Slug
          </label>
          <input
            className="field__input"
            id="slug"
            name="slug"
            placeholder="night-matches-bintaro"
            aria-describedby="slug-help"
          />
          <p className="field__help" id="slug-help">
            Leave blank to build it from the title.
          </p>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="visibility">
            Who can see it
          </label>
          <select className="field__select" id="visibility" name="visibility" defaultValue="public">
            <option value="public">Everyone</option>
            <option value="members">Signed-in visitors only</option>
          </select>
          <p className="field__help" />
        </div>
      </div>

      <div>
        <Submit />
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
  );
}
