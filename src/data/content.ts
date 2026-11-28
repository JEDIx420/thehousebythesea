export const FISH = {
  sardine: {
    name: "Silver sardine",
    price: 18,
    description: "A little flash of silver from the sheltered bay.",
  },
  bream: {
    name: "Sunlit bream",
    price: 32,
    description: "Golden fins, and a good supper for someone in town.",
  },
} as const;

export const FIRST_DELIVERY = {
  id: "havenport-saltglass-parcel",
  issuerId: "harbourmaster",
  recipientId: "saltglass-fisher",
  reward: 120,
  title: "A parcel across the water",
} as const;

export const HOME_FUND_TARGET = 500;
export const ISLANDS = [
  { id: "havenport", name: "Havenport", x: 0, z: 0, playable: true },
  { id: "saltglass-bay", name: "Saltglass Bay", x: 0, z: -220, playable: true },
  { id: "willowmere", name: "Willowmere", playable: false },
  { id: "bellport", name: "Bellport", playable: false },
  { id: "orchard-point", name: "Orchard Point", playable: false },
  { id: "bracken-island", name: "Bracken Island", playable: false },
  { id: "gullwatch", name: "Gullwatch", playable: false },
  { id: "tideglass-reef", name: "Tideglass Reef", playable: false },
  { id: "ashen-springs", name: "Ashen Springs", playable: false },
  { id: "lantern-key", name: "Lantern Key", playable: false },
  { id: "observatory-isle", name: "Observatory Isle", playable: false },
  { id: "far-beacon", name: "Far Beacon", playable: false },
] as const;
