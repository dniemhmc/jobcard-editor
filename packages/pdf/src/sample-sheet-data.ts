import type { JobcardSheetData } from './sheet-data';

/**
 * Example jobcard for previews and tests. All names, numbers and work steps
 * are invented demo content, not engineering-approved instructions.
 */
export const SAMPLE_SHEET_DATA: JobcardSheetData = {
  titleBlock: {
    project: '[Example] Platform A decommissioning',
    jobNo: '12.034',
    department: 'Construction',
    module: 'M03',
    title: 'Remove HVAC ducting, cellar deck',
    date: '2026-10-15',
    jcNo: 'HD-M03-HVAC-01',
    revision: '01',
  },
  location: 'Module M03, cellar deck, grid C4 to C7',
  keyplan: { caption: 'Isometric view of platform, work location highlighted', northDeg: 30 },
  hazards: { hotWork: true, liftingRigging: true, workAtHeight: true, hazmat: true },
  disciplines: [{ code: 'SCAF' }, { code: 'WLDR' }, { code: 'RIG' }, { code: 'HSE' }],
  generalPictures: [
    { caption: 'Ducting run along the cellar deck, looking east' },
    { caption: 'Duct supports at grid C5' },
  ],
  activities: [
    {
      title: 'Prepare worksite and install scaffold',
      disciplines: [{ code: 'SCAF' }],
      steps: [
        { text: 'Install hard barriers around the work area at grid C4 to C7.' },
        {
          text: 'Erect access scaffold under the ducting run.',
          details: 'Working height approx. 4.5 m above deck. Use scaffold request SR-034.',
        },
        { text: 'Inspect and tag the scaffold before use.' },
      ],
      hazardsAndPrecautions: [
        'Work at height: harness and lanyard above 2 m.',
        'Hard barriers and signage around the drop zone.',
      ],
      pictures: [{ caption: 'Scaffold position under ducting' }],
    },
    {
      title: 'Cut and remove ducting sections',
      disciplines: [{ code: 'WLDR' }, { code: 'RIG' }],
      steps: [
        { text: 'Check the hot work permit and gas test results are valid.' },
        {
          text: 'Fit slings to section D1 and take the weight with chain block CB-1.',
          details: 'Estimated weight of section D1: 85 kg (not verified, weigh before lift).',
        },
        { text: 'Cut section D1 at cut lines CL-1 and CL-2.' },
        { text: 'Lower section D1 to the laydown area and remove slings.' },
        {
          text: 'Repeat for sections D2 and D3.',
          details: 'Estimated weights: D2 70 kg, D3 90 kg.',
        },
      ],
      hazardsAndPrecautions: [
        'HAZMAT: duct insulation may contain mineral wool; wear FFP3 mask and coverall.',
        'Fire watch during and 30 minutes after hot work.',
        'No personnel under suspended load.',
      ],
      pictures: [{ caption: 'Cut lines CL-1 and CL-2 on section D1' }, { caption: 'Laydown area' }],
      referToGeneralWorkMethods: true,
    },
    {
      title: 'Clear worksite and remove scaffold',
      disciplines: [{ code: 'SCAF' }],
      steps: [
        { text: 'Remove waste and tag removed sections with the JC number.' },
        { text: 'Dismantle scaffold and remove hard barriers.' },
        { text: 'Report completion to the area authority and close the permit.' },
      ],
      hazardsAndPrecautions: ['Keep the drop zone barriered until the scaffold is down.'],
      pictures: [],
    },
  ],
};
