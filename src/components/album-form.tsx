"use client";

import { useActionState, useState } from "react";
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

/**
 * The card, at the width it will actually render.
 *
 * The subtitle is written in a text input two hundred pixels wider than the
 * box that has to hold it, which is how "Strobist, PrimeLens And Summer" and
 * "Sales Headshot Photography" both looked fine while being written. One card
 * of the two-up /work grid measures 167px on a 390px phone — measured, not
 * guessed — so that is the width here. Same classes as the real card, so it
 * cannot drift from it.
 *
 * See docs/PRD-the-archive-in-its-own-words.md § 5.2.3.
 */
function CardPreview({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="preview">
      <p className="u-mono preview__label">
        As it renders — one card of the two-up grid, 167px, on a 390px phone
      </p>
      <div className="preview__card" aria-hidden="true">
        <span className="preview__media" />
        <div className="album__meta">
          <h2 className="album__title">{title || "Untitled"}</h2>
          <p className="album__sub">{subtitle || "no subtitle"}</p>
        </div>
      </div>
    </div>
  );
}

export function AlbumForm() {
  const [state, action] = useActionState(createAlbum, IDLE);
  const [card, setCard] = useState({ title: "", subtitle: "" });

  return (
    <form
      className="auth__form"
      action={action}
      /* Uncontrolled inputs, read on the way past: the form already posts as
       * FormData, so mirroring every field into React state would be two
       * sources of truth for no gain. */
      onInput={(e) => {
        const f = new FormData(e.currentTarget);
        setCard({
          title: String(f.get("title") ?? ""),
          subtitle: String(f.get("subtitle") ?? ""),
        });
      }}
    >
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
          placeholder="Wisuda UI for Nuna and her family, Salemba"
          aria-describedby="subtitle-help"
        />
        <p className="field__help" id="subtitle-help">
          One line: who it was for, what was shot, where. This is the only
          sentence a client reads before deciding — so &ldquo;Graduation&rdquo;
          or the title again says nothing they cannot already see. Optional,
          and blank is better than a repeat.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="story">
          The story
        </label>
        <textarea
          className="field__area"
          id="story"
          name="story"
          rows={5}
          maxLength={1200}
          placeholder="Rona Mekar were launching a gift box and needed the packaging to read as a present rather than a product. Two hours in their kitchen, one window, no lights — the afternoon sun off the tiles was the whole set-up."
          aria-describedby="story-help"
        />
        <p className="field__help" id="story-help">
          The paragraph on the gallery page itself, after a client taps
          through. What the brief was, what it was for, how it was made. This
          is what turns a set of frames into a sample project — a food or
          sport gallery with no story is a folder, and a client cannot tell
          from photographs alone whether you can be briefed. Optional, up to
          1200 characters, and it only appears once{" "}
          <code>add-album-story.sql</code> has been run.
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

      <CardPreview title={card.title} subtitle={card.subtitle} />

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
