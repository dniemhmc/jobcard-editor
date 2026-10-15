import type { Jobcard, Project, Workpack } from '@jobcard/domain';
import { DISCIPLINES, type DisciplineCode, type JobcardSheetData } from './sheet-data';

export interface SheetDataContext {
  project: Project;
  workpack: Workpack;
  /** Resolves an image asset to a URL the renderer can load. Without it pictures are placeholders. */
  imageUrl?: (assetId: string) => string | undefined;
}

function toDisciplineCode(value: string | undefined): DisciplineCode | undefined {
  const v = value?.trim().toUpperCase();
  return v && v in DISCIPLINES ? (v as DisciplineCode) : undefined;
}

/**
 * Maps a stored jobcard onto the sheet layout.
 *
 * The domain model has one flat list of steps, so the whole jobcard becomes a
 * single main activity. Fields the template has but the schema does not yet
 * (department, hazard flags, keyplan, job no. vs JC no.) are left empty until
 * the activity hierarchy ADR lands.
 */
export function jobcardToSheetData(jobcard: Jobcard, ctx: SheetDataContext): JobcardSheetData {
  const location = [jobcard.location.module, jobcard.location.deck, jobcard.location.area]
    .filter(Boolean)
    .join(' / ');
  const discipline = toDisciplineCode(jobcard.discipline);
  const disciplines = discipline ? [{ code: discipline }] : [];
  const imagesById = new Map(jobcard.images.map((img) => [img.id, img]));
  const stepImageIds = [...new Set(jobcard.steps.flatMap((s) => s.imageIds))];

  return {
    titleBlock: {
      project: `${ctx.project.code} ${ctx.project.name}`,
      jobNo: '',
      department: '',
      module: jobcard.location.module ?? ctx.workpack.module ?? '',
      title: jobcard.title,
      date: jobcard.audit.updatedAt.slice(0, 10),
      jcNo: jobcard.jobNumber,
      revision: jobcard.revision,
    },
    location: location || jobcard.location.description || ctx.project.installation,
    hazards: {},
    disciplines,
    generalPictures: [],
    activities: [
      {
        title: jobcard.scope || jobcard.title,
        disciplines,
        steps: jobcard.steps.map((s) => ({ text: s.text, details: s.details })),
        hazardsAndPrecautions: [],
        pictures: stepImageIds.flatMap((id) => {
          const img = imagesById.get(id);
          return img ? [{ caption: img.caption, src: ctx.imageUrl?.(img.assetId) }] : [];
        }),
      },
    ],
  };
}
