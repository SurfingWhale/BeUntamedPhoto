"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteAlbum,
  deletePhoto,
  setCover,
  updateAlbum,
  type DarkroomState,
} from "@/app/darkroom/actions";
import { plate } from "@/lib/format";
import type { Album, PhotoWithUrl } from "@/lib/gallery";

const IDLE: DarkroomState = { status: "idle", message: "" };

function Pending({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="note__del" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "…" : label}
    </button>
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
  offset = 0,
}: {
  album: Album;
  photos: PhotoWithUrl[];
  /** Plates already listed on earlier pages, so numbering stays absolute. */
  offset?: number;
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
            Saving moves the stored files into the matching bucket, so a gallery
            held back later stops serving its plates on public URLs. Long
            galleries move in batches — save again if it says more remain.
          </p>
        </div>
        <div>
          <button className="btn btn--quiet" type="submit">
            Save visibility
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
              {photo.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="plates__thumb"
                  src={photo.thumbUrl}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="plates__thumb" aria-hidden="true" />
              )}
              <div className="plates__meta">
                <p className="note__body" style={{ fontSize: "var(--text-base)" }}>
                  Plate {plate(offset + i)}
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
                    <Pending label="remove" />
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
          <button className="btn btn--quiet" type="submit">
            Delete gallery
          </button>
        </div>
        <Result state={delState} />
      </form>
    </>
  );
}
