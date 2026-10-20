// Shared colours and copy for the 4-level depression scale
const LEVELS = {
  'no depression': {
    color: 'var(--level-none)',
    bg: 'var(--level-none-bg)',
    hex: '#1d7350',
    title: 'No depression',
    message: 'Your answers suggest you are coping well right now. Keep nurturing the habits that support you.'
  },
  mild: {
    color: 'var(--level-mild)',
    bg: 'var(--level-mild-bg)',
    hex: '#8f5f00',
    title: 'Mild',
    message: 'Some signs of low mood are showing. Small, consistent self-care steps can make a real difference.'
  },
  moderate: {
    color: 'var(--level-moderate)',
    bg: 'var(--level-moderate-bg)',
    hex: '#b0440a',
    title: 'Moderate',
    message: 'Your answers point to symptoms that are affecting daily life. Talking to a professional is a good next step.'
  },
  severe: {
    color: 'var(--level-severe)',
    bg: 'var(--level-severe-bg)',
    hex: '#b42318',
    title: 'Severe',
    message: 'You are carrying a lot right now. Please reach out to a mental health professional soon - you do not have to do this alone.'
  }
};

export const LEVEL_ORDER = ['No Depression', 'Mild', 'Moderate', 'Severe'];

export const getLevel = (level) => {
  const key = String(level || '').toLowerCase().replace(' depression', '').trim();
  if (key === 'minimal' || key === 'no' || key === 'none' || key === 'no depression') return LEVELS['no depression'];
  if (key.includes('severe')) return LEVELS.severe;
  return LEVELS[key] || LEVELS['no depression'];
};

// Colour for an individual PHQ-9 answer value (0-3)
export const answerColor = (value) => ['#1d7350', '#8f5f00', '#b0440a', '#b42318'][value] || '#4b514d';
