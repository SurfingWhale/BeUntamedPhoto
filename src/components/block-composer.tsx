"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  addBlock,
  deleteBlock,
  moveBlock,
  updateBlock,
  type DarkroomState,
} from "@/app/darkroom/actions";
import type { Block } from "@/lib/gallery";

const IDLE: DarkroomState = { status: "idle", message: "" };

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

function Quiet({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="note__del" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "…" : label}
    </button>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--quiet" type="submit" disabled={pending} aria-disabled={pending}>
      {pending && <span className="btn__spin" aria-hidden="true" />}
      {pending ? "Saving" : "Save band"}
    </button>
  );
}

/** One existing band: editable prose, or a break with nothing to edit. */
function Row({
  block,
  slug,
  albumId,
  index,
  total,
}: {
  block: Block;
  slug: string;
  albumId: string;
  index: number;
  total: number;
}) {
  const [editState, editAction] = useActionState(updateBlock, IDLE);
  const [delState, delAction] = useActionState(deleteBlock, IDLE);
  const [moveState, moveAction] = useActionState(moveBlock, IDLE);

  return (
    <div className="band">
      <div className="band__bar">
        <span className="band__kind">
          {block.kind === "text" ? "Text" : "Break"} · {index + 1} of {total}
        </span>
        <div className="band__acts">
          {index > 0 && (
            <form action={moveAction}>
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="albumId" value={albumId} />
              <input type="hidden" name="dir" value="up" />
              <Quiet label="↑ up" />
            </form>
          )}
          {index < total - 1 && (
            <form action={moveAction}>
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="albumId" value={albumId} />
              <input type="hidden" name="dir" value="down" />
              <Quiet label="↓ down" />
            </form>
          )}
          <form action={delAction}>
            <input type="hidden" name="id" value={block.id} />
            <input type="hidden" name="slug" value={slug} />
            <Quiet label="remove" />
          </form>
        </div>
      </div>

      {block.kind === "text" ? (
        <form className="auth__form" action={editAction}>
          <input type="hidden" name="id" value={block.id} />
          <input type="hidden" name="slug" value={slug} />
          <div className="field">
            <label className="u-sr" htmlFor={`band-${block.id}`}>
              Band text
            </label>
            <textarea
              className="field__area"
              id={`band-${block.id}`}
              name="body"
              defaultValue={block.body ?? ""}
            />
          </div>
          <div>
            <Save />
          </div>
          <Result state={editState} />
        </form>
      ) : (
        <p className="band__break" aria-hidden="true" />
      )}

      <Result state={delState} />
      <Result state={moveState} />
    </div>
  );
}

export function BlockComposer({
  albumId,
  slug,
  blocks,
}: {
  albumId: string;
  slug: string;
  blocks: Block[];
}) {
  const [addState, addAction] = useActionState(addBlock, IDLE);

  return (
    <>
      {blocks.length === 0 ? (
        <p className="notes__empty">
          No prose yet — the gallery opens straight onto the plates.
        </p>
      ) : (
        <div className="bands">
          {blocks.map((block, i) => (
            <Row
              key={block.id}
              block={block}
              slug={slug}
              albumId={albumId}
              index={i}
              total={blocks.length}
            />
          ))}
        </div>
      )}

      <form className="auth__form" action={addAction}>
        <input type="hidden" name="albumId" value={albumId} />
        <input type="hidden" name="slug" value={slug} />

        <div className="field">
          <label className="field__label" htmlFor="new-band">
            Add a band
          </label>
          <textarea
            className="field__area"
            id="new-band"
            name="body"
            placeholder="What were you doing here? What should someone notice?"
            aria-describedby="band-help"
          />
          <p className="field__help" id="band-help">
            Sits above the plates, in the order you set. Leave empty and choose
            Break to add a hairline instead.
          </p>
        </div>

        <div className="plates__acts">
          <button className="btn" type="submit" name="kind" value="text">
            Add text
          </button>
          <button className="btn btn--quiet" type="submit" name="kind" value="rule">
            Add break
          </button>
        </div>

        <Result state={addState} />
      </form>
    </>
  );
}
