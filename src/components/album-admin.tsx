"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteAlbum,
  deletePhoto,
  movePhoto,
  setCover,
  updateAlbum,
  type DarkroomState,
} from "@/app/darkroom/actions";
import { plate } from "@/lib/format";
import { genres } from "@/lib/site";
import { SIZES } from "@/lib/images";
import type { Album, PhotoWithUrl } from "@/lib/gallery";

const IDLE: DarkroomState = { status: "idle", message: "" };

function Pending({ label, danger = false }: { label: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={danger ? "note__del note__del--danger" : "note__del"}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "…" : label}
    </button>
  );
}

/**
 * Removing a plate asks once.
 *
 * "make cover" and "remove" were the same grey word next to each other, and
 * removing one took a single tap with nothing between the tap and the file
 * being gone. On a phone, with both targets a thumb apart, that is a deletion
 * waiting to happen. The first tap arms it, the second does it, and it
 * disarms itself after a few seconds so a stray arm does not stay live.
 */
function RemovePlate({ children }: { children: React.ReactNode }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!armed) {
    return (
      <button
        className="note__del note__del--danger"
        type="button"
        onClick={() => setArmed(true)}
      >
        remove
      </button>
    );
  }
  return (
    <span className="confirm">
      <span className="confirm__ask">delete this plate?</span>
      {children}
      <button className="note__del" type="button" onClick={() => setArmed(false)}>
        cancel
      </button>
    </span>
  );
}

/**
 * Ordering lives next to the plate it reorders, not in a separate mode. The
 * ends are disabled rather than hidden so the row never changes shape as a
 * plate travels — a control that moves under your thumb is worse than one
 * that greys out.
 */
function Move({
  photoId,
  albumId,
  slug,
  first,
  last,
  index,
  total,
}: {
  photoId: string;
  albumId: string;
  slug: string;
  first: boolean;
  last: boolean;
  index: number;
  total: number;
}) {
  const [, action] = useActionState(movePhoto, IDLE);
  return (
    <form action={action} className="plates__move">
      <input type="hidden" name="id" value={photoId} />
      <input type="hidden" name="albumId" value={albumId} />
      <input type="hidden" name="slug" value={slug} />
      <button
        className="tog plates__arrow"
        type="submit"
        name="dir"
        value="up"
        disabled={first}
        aria-label={`Move plate ${index + 1} of ${total} earlier`}
      >
        ↑
      </button>
      <button
        className="tog plates__arrow"
        type="submit"
        name="dir"
        value="down"
        disabled={last}
        aria-label={`Move plate ${index + 1} of ${total} later`}
      >
        ↓
      </button>
    </form>
  );
}

function Result({ state }: { state: DarkroomState }) {
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

export function AlbumAdmin({
  album,
  photos,
}: {
  album: Album;
  photos: PhotoWithUrl[];
}) {
  const [visState, visAction] = useActionState(updateAlbum, IDLE);
  const [delState, delAction] = useActionState(deleteAlbum, IDLE);
  const [photoState, photoAction] = useActionState(deletePhoto, IDLE);
  const [coverState, coverAction] = useActionState(setCover, IDLE);

  return (
    <>
      <form className="auth__form" action={visAction}>
        <input type="hidden" name="id" value={album.id} />
        <input type="hidden" name="slug" value={album.slug} />
        <div className="field">
          <label className="field__label" htmlFor="title-edit">
            Title
          </label>
          <input
            className="field__input"
            id="title-edit"
            name="title"
            defaultValue={album.title}
            required
            aria-required="true"
            aria-describedby="title-edit-help"
          />
          <p className="field__help" id="title-edit-help">
            The name a visitor reads. The address stays{" "}
            <strong>/work/{album.slug}</strong> — it is in every link already
            sent, and it is the folder the files were written under.
          </p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="subtitle-edit">
            Subtitle
          </label>
          <input
            className="field__input"
            id="subtitle-edit"
            name="subtitle"
            defaultValue={album.subtitle ?? ""}
            placeholder="One line. Optional."
          />
          <p className="field__help" />
        </div>

        <div className="row2">
          <div className="field">
            <label className="field__label" htmlFor="place-edit">
              Place
            </label>
            <input
              className="field__input"
              id="place-edit"
              name="place"
              defaultValue={album.place ?? ""}
              placeholder="Bintaro"
            />
            <p className="field__help" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="year-edit">
              Year
            </label>
            <input
              className="field__input"
              id="year-edit"
              name="year"
              type="number"
              min={1900}
              max={2200}
              defaultValue={album.year ?? ""}
              placeholder="2026"
            />
            <p className="field__help" />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="genre-edit">
            Genre
          </label>
          <select
            className="field__select"
            id="genre-edit"
            name="genre"
            defaultValue={album.genre}
            aria-describedby="genre-edit-help"
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <p className="field__help" id="genre-edit-help">
            Decides which genre page this set appears on, and which chip it
            answers to on the index.
          </p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="visibility-edit">
            Who can see it
          </label>
          <select
            className="field__select"
            id="visibility-edit"
            name="visibility"
            defaultValue={album.visibility}
          >
            <option value="public">Everyone</option>
            <option value="members">Signed-in visitors only</option>
          </select>
          <p className="field__help">
            Saving moves the files too, up to 60 at a time, so held-back plates
            stop being reachable on a public link.
          </p>
        </div>
        <div>
          <button className="btn btn--quiet" type="submit">
            Save gallery
          </button>
        </div>
        <Result state={visState} />
      </form>

      <div className="plates">
        {photos.length === 0 ? (
          <p className="notes__empty">No plates yet.</p>
        ) : (
          photos.map((photo, i) => (
            <div className="plates__row" key={photo.id}>
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="plates__thumb"
                  src={photo.url}
                  srcSet={photo.srcSet ?? undefined}
                  sizes={SIZES.thumb}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <div className="plates__thumb" aria-hidden="true" />
              )}
              <Move
                photoId={photo.id}
                albumId={album.id}
                slug={album.slug}
                first={i === 0}
                last={i === photos.length - 1}
                index={i}
                total={photos.length}
              />
              <div className="plates__meta">
                <p className="note__body" style={{ fontSize: "var(--text-base)" }}>
                  Plate {plate(i)}
                  {photo.caption ? ` · ${photo.caption}` : ""}
                  {photo.is_cover ? " · cover" : ""}
                </p>
                <p className="note__meta">
                  <span>{photo.bucket}</span>
                  <span style={{ overflowWrap: "anywhere", textTransform: "none" }}>
                    {photo.path}
                  </span>
                </p>
                <div className="plates__acts">
                  {!photo.is_cover && (
                    <form action={coverAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="albumId" value={album.id} />
                      <input type="hidden" name="slug" value={album.slug} />
                      <Pending label="make cover" />
                    </form>
                  )}
                  <form action={photoAction}>
                    <input type="hidden" name="id" value={photo.id} />
                    <input type="hidden" name="slug" value={album.slug} />
                    <RemovePlate>
                      <Pending label="yes, delete" danger />
                    </RemovePlate>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
        <Result state={coverState} />
        <Result state={photoState} />
      </div>

      <form className="auth__form" action={delAction}>
        <input type="hidden" name="id" value={album.id} />
        <input type="hidden" name="slug" value={album.slug} />
        <div className="field">
          <label className="field__label" htmlFor="confirm">
            Delete this gallery
          </label>
          <input
            className="field__input"
            id="confirm"
            name="confirm"
            placeholder={album.slug}
            aria-describedby="confirm-help"
          />
          <p className="field__help" id="confirm-help">
            Type <strong>{album.slug}</strong> to confirm. Removes the gallery,
            its plates, and the stored files.
          </p>
        </div>
        <div>
          <button className="btn btn--danger" type="submit">
            Delete gallery
          </button>
        </div>
        <Result state={delState} />
      </form>
    </>
  );
}
