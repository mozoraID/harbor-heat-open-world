// 3-act story outline for Harbor Heat.
export const STORY = {
  title: 'Harbor Heat',
  setting: 'Port Solenne',
  hero: 'Rio Vance',
  acts: [
    {
      act: 1,
      name: 'Act I: The Debt Tide',
      summary: 'Rio Vance returns to Port Solenne after years away to find Mama Inés\'s diner drowning in debt to harbour kingpin Victor Kade. To keep the doors open and the SHP off Mama\'s back, Rio takes on small jobs around Marigold Beach, Old Pier, and Ferro Docks, proving he can drive, steal, and survive the heat.',
    },
    {
      act: 2,
      name: 'Act II: Kade\'s Wake',
      summary: 'Kade calls in the favour and pulls Rio into his harbour smuggling operation across Glasswater Heights, Ferro Docks, and Cinder Hills. With Sasha running diversions and Wrench tuning the rides, Rio moves contraband, dodges Detective Mara Quill, and realises the ledger he\'s protecting could bury Mama for good.',
    },
    {
      act: 3,
      name: 'Act III: Breakwater',
      summary: 'Rio turns on Victor Kade, stealing the ledger and racing through Lagoon Bridge and the Old Pier to expose the smuggling ring. In a final run against Kade\'s enforcers and the SHP dragnet, Rio clears the debt, saves the diner, and earns his place in Port Solenne on his own terms.',
    },
  ],
};

export function getAct(actNumber) { return STORY.acts.find(a => a.act === actNumber) || null; }
