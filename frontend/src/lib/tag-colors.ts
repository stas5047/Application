const TAG_PALETTE: Array<{ bg: string; text: string }> = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-green-100',  text: 'text-green-700'  },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { bg: 'bg-teal-100',   text: 'text-teal-700'   },
  { bg: 'bg-red-100',    text: 'text-red-700'    },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
];

export function getTagColor(tagName: string): { bg: string; text: string } {
  const hash = tagName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}
