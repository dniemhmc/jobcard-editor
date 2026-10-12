import { z } from 'zod';
import { Id, Text, Timestamp, UserRef } from './common';

/**
 * A stored binary file (the original, unedited photo). Annotations are never
 * burned into the asset; see docs/adr/0004.
 */
export const Asset = z.object({
  id: Id,
  fileName: Text,
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive(),
  /** Key in object storage. */
  storageKey: Text,
  sha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  uploadedAt: Timestamp,
  uploadedBy: UserRef,
});
export type Asset = z.infer<typeof Asset>;

/**
 * R2S viewpoint the image was captured from, so the editor can link back to
 * the same spot in the R2S street-view.
 *
 * PROVISIONAL: field names and units must be confirmed against the R2S API
 * (see docs/open-questions.md). Keep extra R2S data in `raw` until then.
 */
export const R2sViewpoint = z.object({
  sceneId: Text,
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  headingDeg: z.number().optional(),
  pitchDeg: z.number().optional(),
  fovDeg: z.number().optional(),
  /** URL that opens R2S at this viewpoint. */
  deepLink: z.url(),
  raw: z.record(z.string(), z.unknown()).optional(),
});
export type R2sViewpoint = z.infer<typeof R2sViewpoint>;

export const ImageSource = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('upload') }),
  z.object({ kind: z.literal('r2s'), capturedAt: Timestamp, viewpoint: R2sViewpoint }),
]);
export type ImageSource = z.infer<typeof ImageSource>;

/**
 * Coordinates are normalised to the image: (0,0) is top-left, (1,1) is
 * bottom-right. This keeps annotations valid at any display or print size.
 */
const Unit = z.number().min(0).max(1);
export const Point = z.object({ x: Unit, y: Unit });
export type Point = z.infer<typeof Point>;

export const Geometry = z.discriminatedUnion('shape', [
  z.object({ shape: z.literal('rect'), x: Unit, y: Unit, width: Unit, height: Unit }),
  z.object({ shape: z.literal('ellipse'), cx: Unit, cy: Unit, rx: Unit, ry: Unit }),
  z.object({ shape: z.literal('polygon'), points: z.array(Point).min(3) }),
]);
export type Geometry = z.infer<typeof Geometry>;

export const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/** Label text placed at `position`, with an optional leader line to `anchor`. */
export const Label = z.object({
  text: Text,
  position: Point,
  anchor: Point.optional(),
});
export type Label = z.infer<typeof Label>;

export const Annotation = z.discriminatedUnion('kind', [
  /** Highlights an object or area, optionally with a label naming it. */
  z.object({
    kind: z.literal('highlight'),
    id: Id,
    geometry: Geometry,
    color: Color,
    label: Label.optional(),
  }),
  /** A free-standing label. */
  z.object({
    kind: z.literal('label'),
    id: Id,
    color: Color,
    label: Label,
  }),
]);
export type Annotation = z.infer<typeof Annotation>;

/** An image as used on a jobcard: original asset + source + annotation layer. */
export const JobcardImage = z.object({
  id: Id,
  assetId: Id,
  caption: z.string().optional(),
  source: ImageSource,
  annotations: z.array(Annotation),
});
export type JobcardImage = z.infer<typeof JobcardImage>;
