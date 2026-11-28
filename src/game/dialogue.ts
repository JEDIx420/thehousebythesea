import type { GameState } from "../state/game";
import { FISH } from "../data/content";
export interface Choice {
  label: string;
  action: string;
}
export interface Beat {
  speakerId: string;
  expressionId: "neutral" | "happy" | "thoughtful" | "surprised";
  text: string;
}
export interface Dialogue {
  beats: Beat[];
  speaker: string;
  role: string;
  title: string;
  paragraphs: string[];
  choices: Choice[];
}
const close: Choice = { label: "See you soon", action: "close" };
function conversationData(id: string, s: GameState): Omit<Dialogue, "beats"> {
  if (id === "ellis")
    return {
      speaker: "Ellis",
      role: "HARBOURMASTER",
      title:
        s.delivery === "complete"
          ? "Honest journeys add up"
          : "A parcel across the water",
      paragraphs: [
        "“I remember you sitting on that wall until the boats were little more than specks. You watched them as if they knew a secret.”",
        s.delivery === "available"
          ? "“Nessa at Saltglass needs these net needles. North along the channel, then her east pier. A hundred and twenty coins for the trouble. No hurry: a careful crossing is a good crossing.”"
          : s.delivery === "active"
            ? "“North along the channel to Saltglass, then ease up beside the pier. Nessa is usually working on her nets there. The chart will keep you straight.”"
            : "“Nessa sent word. The needles are already mending nets. Not a bad beginning for a boat you used to dream about.”",
        "“Leave the pier straight ahead before turning her round. She’s a small boat, but she still needs a little sea room.”",
      ],
      choices: [
        ...(s.delivery === "available"
          ? [{ label: "Take the parcel · 120 coins", action: "accept" }]
          : []),
        { label: "Look at the sea chart", action: "chart" },
        close,
      ],
    };
  if (id === "mira") {
    if (!s.story.metMira)
      return {
        speaker: "Mira",
        role: "COASTAL ILLUSTRATOR",
        title: "The shape of an afternoon",
        paragraphs: [
          "“You’re Rowan, aren’t you? Ellis said someone had finally bought the little boat he kept talking about.”",
          "“I’m making an illustrated guide to the working harbours. Not just the pretty bits. The hands mending nets, the cups left on walls, the colours the sea borrows from the shops.”",
          "“Saltglass is next on my list. I’ve promised a printer some finished pages, so I can’t spend every day staring at the water. A terrible arrangement, really.”",
        ],
        choices: [
          { label: "Tell her about the boat", action: "meet" },
          { label: "Another time", action: "close" },
        ],
      };
    if (s.story.outingComplete)
      return {
        speaker: "Mira",
        role: "COASTAL ILLUSTRATOR",
        title: "Something worth returning to",
        paragraphs: [
          "“I’ll make finished pieces from those sketches tomorrow. The printer wants tidy edges. I’m keeping a little of the wind in them.”",
          "“Thank you for taking me. I liked that we didn’t have to make the afternoon into anything grand.”",
          "“There’s a small beachfront plot north of the post office. I sometimes draw from the bench. Go and have a look. A dream feels different once you know where the window might face.”",
        ],
        choices: [
          { label: "I’ll take a look at the plot", action: "plot-hint" },
          close,
        ],
      };
    if (
      s.story.outingInvited &&
      s.story.outingVisitedSaltglass &&
      s.player.island === "havenport"
    )
      return {
        speaker: "Mira",
        role: "BACK IN HAVENPORT",
        title: "The things we noticed",
        paragraphs: [
          "“The crossing looked different on the way home. Same water, different light. I’m glad we didn’t rush it.”",
          "“I’ve a page full of ropes and crooked roofs, and one very uncooperative gull. You made a good travelling companion, Rowan.”",
          "“Next time, I’ll choose the stopping place. There are things I want to draw beyond the harbour too.”",
        ],
        choices: [
          { label: "Share the memory of the crossing", action: "memory" },
          { label: "Let her finish her sketches", action: "close" },
        ],
      };
    if (s.story.outingInvited)
      return {
        speaker: "Mira",
        role: "A SHARED CROSSING",
        title: "A little room for a sketchbook",
        paragraphs: [
          "“I’ll bring my sketchbook down to the pier. Give me a moment to gather the pages; they have a habit of going everywhere.”",
          "“You can take care of your delivery. I’ll work from the boat while we’re at Saltglass. A view doesn’t need to be far away to be new.”",
        ],
        choices: [{ label: "Meet you by the boat", action: "close" }],
      };
    return {
      speaker: "Mira",
      role: "COASTAL ILLUSTRATOR",
      title: "Sea-glass sketches",
      paragraphs: [
        "“A boat of your own. That must feel like a very large door opening.”",
        "“I’ve finished enough work for today. If you’re crossing to Saltglass, I’d like to come. I’ll bring my own tea and try not to lose any pencils overboard.”",
        "“And if you’d rather make the first voyage alone, that’s all right. There will be other afternoons.”",
      ],
      choices: [
        { label: "Invite Mira to Saltglass", action: "invite" },
        { label: "Maybe another afternoon", action: "close" },
      ],
    };
  }
  if (id === "nessa")
    return {
      speaker: "Nessa",
      role: "SALTGLASS FISHER",
      title:
        s.delivery === "active" ? "The useful things" : "Welcome to Saltglass",
      paragraphs: [
        s.delivery === "active"
          ? "“Net needles! Ellis said he’d find someone coming this way. The old ones were worn almost smooth. A little parcel can keep half a village working.”"
          : s.delivery === "complete"
            ? "“Your parcel’s safely stowed. Thank you again. The harbour book has your payment; there’s no need to carry anything back.”"
            : "“Follow the pale path uphill when you’ve a moment. The shell arch looks as if someone meant to build it. Water did all that carving, without a single plan.”",
        "“You can fish from the pier or a stopped boat. Wait for the float to dip, then Space while the line is lively. F puts the rod away. A missed bite is only a missed bite.”",
        `“Silver sardines bring ${FISH.sardine.price} coins; sunlit bream ${FISH.bream.price}. Keep what you fancy for supper, or I’ll buy your catch.”`,
      ],
      choices: [
        ...(s.delivery === "active"
          ? [{ label: "Hand over the parcel", action: "deliver" }]
          : []),
        { label: "Sell my catch", action: "sell" },
        { label: "Ask about the shell arch", action: "arch-hint" },
        close,
      ],
    };
  return {
    speaker: "Tomas",
    role: "HAVENPORT FISH MARKET",
    title: "Fresh from the water",
    paragraphs: [
      "“A fish caught on your own boat tastes different. Or so everyone tells me while asking a better price.”",
      "“Sardines are eighteen, bream thirty-two. Nothing wasted, no mystery. Bring them back when you’re ready.”",
      "“Some people save for something big. Some save because a little spare money makes tomorrow kinder. Both are a decent reason to start.”",
    ],
    choices: [{ label: "Sell my catch", action: "sell" }, close],
  };
}

export function conversation(id: string, s: GameState): Dialogue {
  const d = conversationData(id, s),
    speakerId = id === "seller" ? "tomas" : id;
  const expressions: Beat["expressionId"][] =
    id === "mira"
      ? s.story.outingVisitedSaltglass
        ? ["happy", "thoughtful", "happy"]
        : ["neutral", "thoughtful", "happy"]
      : ["neutral", "thoughtful", "happy"];
  const beats: Beat[] = d.paragraphs.map((text, i) => ({
    speakerId,
    expressionId: expressions[i % expressions.length],
    text,
  }));
  if (id === "mira" && !s.story.metMira)
    beats.splice(1, 0, {
      speakerId: "rowan",
      expressionId: "happy",
      text: "“I used to know every scratch on her hull from the quay. It feels strange to have the key in my pocket now.”",
    });
  if (id === "ellis" && s.delivery === "available")
    beats.splice(2, 0, {
      speakerId: "rowan",
      expressionId: "happy",
      text: "“Net needles, the north channel, and no hurry. I think I can make a good first day of that.”",
    });
  return { ...d, beats };
}
