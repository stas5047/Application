const TAG_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  art:        { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  business:   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  design:     { bg: 'bg-purple-100', text: 'text-purple-700' },
  devops:     { bg: 'bg-orange-100', text: 'text-orange-700' },
  education:  { bg: 'bg-teal-100',   text: 'text-teal-700'   },
  health:     { bg: 'bg-green-100',  text: 'text-green-700'  },
  music:      { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  networking: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  sports:     { bg: 'bg-red-100',    text: 'text-red-700'    },
  tech:       { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
};

const TAG_PALETTE = Object.values(TAG_COLOR_MAP);

export function getTagColor(tagName: string): { bg: string; text: string } {
  const key = tagName.toLowerCase();
  if (TAG_COLOR_MAP[key]) return TAG_COLOR_MAP[key];

  const hash = tagName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}