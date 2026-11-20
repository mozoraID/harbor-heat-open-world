// Act I mission definitions: Rio returns to Port Solenne to pay Mama Inés's diner debt.
export const ACT1_MISSIONS = [
  {
    id: 'first_light',
    title: 'First Light',
    giver: 'mama',
    district: 'Marigold Beach',
    act: 1,
    number: 1,
    reward: { money: 1200, respect: 150 },
    unlock: null,
    stages: [
      {
        type: 'goto',
        target: { x: -29, z: 319, radius: 12 },
        objective: 'Meet Mama Inés outside the diner on Marigold Beach',
        next: 'Pick up supplies at the pier',
        dialogueStart: [
          { speaker: 'Mama Inés', text: 'Mijo, Port Solenne takes what it wants. Victor Kade wants my diner debt paid, or he takes the doors.' },
          { speaker: 'Rio Vance', text: 'I just got back, Mama. Tell me where to start.' }
        ],
        dialogueEnd: [
          { speaker: 'Mama Inés', text: 'Good. Start by proving you still know these streets. Head to Old Pier for the morning delivery.' }
        ]
      },
      {
        type: 'collect',
        target: { x: -261, z: 261, radius: 10 },
        item: 'supply crate',
        objective: 'Collect the supply crate at Old Pier',
        next: 'Deliver to the diner',
        dialogueStart: [
          { speaker: 'Rio Vance', text: 'Old Pier hasn\'t changed a bit. Let\'s grab that crate.' }
        ],
        dialogueEnd: [
          { speaker: 'Rio Vance', text: 'Got it. Mama\'s waiting back on the beach.' }
        ]
      },
      {
        type: 'drive_to',
        target: { x: 29, z: 319, radius: 12 },
        objective: 'Deliver the supplies back to Mama\'s diner',
        next: 'Mission complete',
        dialogueStart: [
          { speaker: 'Mama Inés', text: 'Bring it straight here, Rio. No detours.' }
        ],
        dialogueEnd: [
          { speaker: 'Mama Inés', text: 'You still move quick. This is only the first light — Kade\'s debt runs deep.' },
          { speaker: 'Rio Vance', text: 'Then I\'ll keep moving.' }
        ]
      }
    ]
  },
  {
    id: 'tide_breaker',
    title: 'Tide Breaker',
    giver: 'wrench',
    district: 'Ferro Docks',
    act: 1,
    number: 2,
    reward: { money: 1800, respect: 220 },
    unlock: ['first_light'],
    stages: [
      {
        type: 'goto',
        target: { x: -261, z: -203, radius: 12 },
        objective: 'Meet Wrench at the Ferro Docks garage',
        next: 'Steal a dock hauler',
        dialogueStart: [
          { speaker: 'Teo "Wrench" Okafor', text: 'Rio Vance, back from the dead. Mama says you need cash fast — I got a job that pays in a hurry.' },
          { speaker: 'Rio Vance', text: 'Talk to me, Wrench.' }
        ],
        dialogueEnd: [
          { speaker: 'Teo "Wrench" Okafor', text: 'Kade\'s crew parked a clean hauler by the cranes. Borrow it permanent-like.' }
        ]
      },
      {
        type: 'steal',
        target: { x: -203, z: -145, radius: 10 },
        carType: 'Dock Hauler',
        objective: 'Steal the Dock Hauler near the cranes',
        next: 'Deliver it to Wrench\'s lockup',
        dialogueStart: [
          { speaker: 'Teo "Wrench" Okafor', text: 'Quiet in, loud out if you have to. Just get me that hauler.' }
        ],
        dialogueEnd: [
          { speaker: 'Rio Vance', text: 'Hauler secured. Hope this thing floats like you said.' }
        ]
      },
      {
        type: 'drive_to',
        target: { x: -319, z: -261, radius: 14 },
        objective: 'Drive the hauler to Wrench\'s lockup',
        next: 'Lose the dock guards',
        dialogueStart: [
          { speaker: 'Teo "Wrench" Okafor', text: 'Bring it round the back. And watch for dock guards — they bite.' }
        ],
        dialogueEnd: [
          { speaker: 'Teo "Wrench" Okafor', text: 'They\'re on your tail! Shake them before you bring trouble to my door.' }
        ]
      },
      {
        type: 'escape',
        wantedLevel: 0,
        objective: 'Lose the wanted level',
        next: 'Mission complete',
        dialogueStart: [
          { speaker: 'Rio Vance', text: 'Time to break the tide and vanish.' }
        ],
        dialogueEnd: [
          { speaker: 'Teo "Wrench" Okafor', text: 'Clean work. I\'ll strip it for parts and wire Mama her cut.' }
        ]
      }
    ]
  },
  {
    id: 'neon_tides',
    title: 'Neon Tides',
    giver: 'sasha',
    district: 'Old Pier',
    act: 1,
    number: 3,
    reward: { money: 2400, respect: 300 },
    unlock: ['tide_breaker'],
    stages: [
      {
        type: 'goto',
        target: { x: -203, z: 261, radius: 12 },
        objective: 'Meet Sasha Lune at the Old Pier overlook',
        next: 'Snap proof of Kade\'s runners',
        dialogueStart: [
          { speaker: 'Sasha Lune', text: 'Rio, you drive like the old days? Kade\'s runners are moving product off the pier tonight.' },
          { speaker: 'Rio Vance', text: 'If it hurts Kade\'s grip on Mama, I\'m in.' }
        ],
        dialogueEnd: [
          { speaker: 'Sasha Lune', text: 'Good. I need a photo of their handoff — proof we can use later.' }
        ]
      },
      {
        type: 'photo',
        target: { x: -145, z: 319, radius: 14 },
        subject: 'Kade\'s runners handoff',
        objective: 'Photograph Kade\'s runners at the pier handoff',
        next: 'Chase the runner',
        dialogueStart: [
          { speaker: 'Sasha Lune', text: 'Get close enough for a clean shot, but don\'t spook them yet.' }
        ],
        dialogueEnd: [
          { speaker: 'Sasha Lune', text: 'Nice shot. One of them\'s bolting — stay on him!' }
        ]
      },
      {
        type: 'chase',
        target: { x: -87, z: 203, radius: 18 },
        targetName: 'pier runner',
        objective: 'Chase and ram the fleeing runner to stop him',
        next: 'Escape the heat',
        dialogueStart: [
          { speaker: 'Rio Vance', text: 'He\'s not getting away with that bag.' }
        ],
        dialogueEnd: [
          { speaker: 'Sasha Lune', text: 'Runner\'s down. Heat\'s coming in fast — lose them in the neon.' }
        ]
      },
      {
        type: 'escape',
        wantedLevel: 0,
        objective: 'Lose the wanted level',
        next: 'Return to Sasha',
        dialogueStart: [
          { speaker: 'Rio Vance', text: 'Time to ride the neon tides out of here.' }
        ],
        dialogueEnd: [
          { speaker: 'Sasha Lune', text: 'Clean vanish. You just bought Mama some breathing room — and Kade\'s attention.' }
        ]
      }
    ]
  }
];
