// Story and mission characters with roles, colours, and dialogue portrait seeds.
export const CHARACTERS = {
  rio: {
    id: 'rio',
    name: 'Rio Vance',
    role: 'Driver / Hero',
    colour: '#3ee6b0',
    portraitSeed: 'rio-vance-seed',
  },
  mama: {
    id: 'mama',
    name: 'Mama Inés',
    role: 'Fixer Matriarch',
    colour: '#ffcc4d',
    portraitSeed: 'Mama Inés',
  },
  wrench: {
    id: 'wrench',
    name: 'Teo "Wrench" Okafor',
    role: 'Mechanic',
    colour: '#5cc8ff',
    portraitSeed: 'Teo "Wrench" Okafor',
  },
  sasha: {
    id: 'sasha',
    name: 'Sasha Lune',
    role: 'Getaway Artist',
    colour: '#ff7ad1',
    portraitSeed: 'Sasha Lune',
  },
  kade: {
    id: 'kade',
    name: 'Victor Kade',
    role: 'Harbour Kingpin',
    colour: '#ff6b5a',
    portraitSeed: 'Victor Kade',
  },
  quill: {
    id: 'quill',
    name: 'Detective Mara Quill',
    role: 'SHP Detective',
    colour: '#9aa6b2',
    portraitSeed: 'mara-quill-shp',
  },
};

export function getCharacter(id) { return CHARACTERS[id] || null; }
export function getCharacterByName(name) { return Object.values(CHARACTERS).find(c => c.name === name) || null; }
