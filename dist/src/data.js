const DAY = 24 * 60 * 60 * 1000;

function isoDateFromNow(offsetDays, hour = 12, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createCanonicalSeed() {
  const createdAt = new Date().toISOString();
  const tomorrowMeeting = isoDateFromNow(1, 14, 0);
  const tomorrowMorning = isoDateFromNow(1, 9, 0);

  return {
    schemaVersion: 2,
    createdAt,
    demo: {
      mode: "synthetic",
      label: "Synthetic demo",
      seedDate: localDateKey(),
    },
    people: [
      {
        id: "maya-chen",
        name: "Maya Chen",
        initials: "MC",
        relationship: "Founder · professional relationship",
        company: "Northstar Labs",
        location: "Raleigh, NC",
        tone: "clay",
        summary: "A thoughtful founder navigating a consequential growth moment.",
        lastMeaningfulInteraction: isoDateFromNow(-42, 11, 30),
        upcoming: [
          {
            id: "maya-meeting",
            kind: "Meeting",
            startsAt: tomorrowMeeting,
            label: "Northstar working session",
            detail: "Scheduled working session",
          },
        ],
        facts: [
          {
            id: "maya-expansion-announcement",
            label: "Northstar Labs announced a new Durham facility.",
            source: "Northstar Labs newsroom · synthetic public source",
            observedAt: isoDateFromNow(-8, 9, 0),
            confidence: "Observed",
          },
          {
            id: "maya-recent-conversation",
            label: "Maya and you last had a meaningful working conversation about six weeks ago.",
            source: "Meeting note · synthetic private record",
            observedAt: isoDateFromNow(-42, 11, 30),
            confidence: "Observed",
          },
        ],
        hypotheses: [
          {
            id: "maya-scaling-hypothesis",
            label: "The new facility may create operational scaling and hiring pressure.",
            basis: "Expansion announcement; not confirmed by Maya.",
            confidence: "Moderate",
          },
        ],
        commitments: [
          {
            id: "maya-introduction-promise",
            label: "Introduce Maya to someone with practical scaling experience.",
            status: "Unresolved",
            madeAt: isoDateFromNow(-48, 15, 0),
            source: "Conversation note · synthetic private record",
          },
        ],
        relatedPeople: ["carlos-rivera"],
      },
      {
        id: "carlos-rivera",
        name: "Carlos Rivera",
        initials: "CR",
        relationship: "Trusted professional collaborator",
        company: "Rivera Operations",
        location: "Durham, NC",
        tone: "ink",
        summary: "A trusted operator with hands-on experience helping organizations scale thoughtfully.",
        lastMeaningfulInteraction: isoDateFromNow(-13, 16, 0),
        upcoming: [],
        facts: [
          {
            id: "carlos-scaling-experience",
            label: "Carlos recently helped an organization establish a second-site operating model and hire its first operations lead.",
            source: "Carlos debrief · synthetic private record",
            observedAt: isoDateFromNow(-19, 14, 0),
            confidence: "Observed",
          },
          {
            id: "carlos-introduction-context",
            label: "You know Carlos well enough that a relevant introduction would be welcome.",
            source: "Relationship history · synthetic private record",
            observedAt: isoDateFromNow(-90, 10, 0),
            confidence: "Observed",
          },
        ],
        hypotheses: [],
        commitments: [],
        relatedPeople: ["maya-chen", "elena-park"],
      },
      {
        id: "elena-park",
        name: "Elena Park",
        initials: "EP",
        relationship: "Longtime friend",
        company: "Independent",
        location: "Chapel Hill, NC",
        tone: "sage",
        summary: "A longtime friend who is starting a new chapter after a difficult season.",
        lastMeaningfulInteraction: isoDateFromNow(-25, 18, 0),
        upcoming: [
          {
            id: "elena-birthday",
            kind: "Personal moment",
            startsAt: isoDateFromNow(4, 10, 0),
            label: "Elena's birthday",
            detail: "Birthday",
          },
        ],
        facts: [
          {
            id: "elena-new-role",
            label: "Elena begins a new role next week.",
            source: "Elena's update · synthetic private record",
            observedAt: isoDateFromNow(-5, 17, 0),
            confidence: "Observed",
          },
        ],
        hypotheses: [],
        commitments: [],
        relatedPeople: ["carlos-rivera"],
      },
      {
        id: "jordan-brooks",
        name: "Jordan Brooks",
        initials: "JB",
        relationship: "Former teammate",
        company: "Oak & Signal",
        location: "Remote",
        tone: "blue",
        summary: "A former teammate whose new studio has just opened its doors.",
        lastMeaningfulInteraction: isoDateFromNow(-31, 13, 0),
        upcoming: [],
        facts: [
          {
            id: "jordan-studio",
            label: "Jordan opened Oak & Signal this month.",
            source: "Jordan's update · synthetic private record",
            observedAt: isoDateFromNow(-6, 8, 30),
            confidence: "Observed",
          },
        ],
        hypotheses: [],
        commitments: [],
        relatedPeople: [],
      },
      {
        id: "priya-nair",
        name: "Priya Nair",
        initials: "PN",
        relationship: "Neighbor and friend",
        company: "Civic Works",
        location: "Cary, NC",
        tone: "rose",
        summary: "A nearby friend who is preparing for a family transition.",
        lastMeaningfulInteraction: isoDateFromNow(-18, 9, 45),
        upcoming: [],
        facts: [
          {
            id: "priya-transition",
            label: "Priya's parents arrive this weekend to help with her move.",
            source: "Priya's update · synthetic private record",
            observedAt: isoDateFromNow(-2, 12, 0),
            confidence: "Observed",
          },
        ],
        hypotheses: [],
        commitments: [],
        relatedPeople: [],
      },
      {
        id: "marcus-green",
        name: "Marcus Green",
        initials: "MG",
        relationship: "Community collaborator",
        company: "Triangle Makers",
        location: "Raleigh, NC",
        tone: "gold",
        summary: "A generous connector planning a community gathering next week.",
        lastMeaningfulInteraction: isoDateFromNow(-20, 12, 0),
        upcoming: [
          {
            id: "marcus-gathering",
            kind: "Community gathering",
            startsAt: isoDateFromNow(6, 18, 30),
            label: "Triangle Makers supper",
            detail: "Small supper gathering",
          },
        ],
        facts: [
          {
            id: "marcus-gathering-fact",
            label: "Marcus is hosting a small Triangle Makers supper next week.",
            source: "Event invitation · synthetic private record",
            observedAt: isoDateFromNow(-3, 15, 0),
            confidence: "Observed",
          },
        ],
        hypotheses: [],
        commitments: [],
        relatedPeople: [],
      },
      {
        id: "tasha-owens",
        name: "Tasha Owens",
        initials: "TO",
        relationship: "Mentor",
        company: "Owens Advisory",
        location: "Charlotte, NC",
        tone: "lavender",
        summary: "A mentor whose counsel has shaped several important decisions.",
        lastMeaningfulInteraction: isoDateFromNow(-51, 15, 15),
        upcoming: [],
        facts: [
          {
            id: "tasha-book",
            label: "Tasha is in a focused writing period through the end of the month.",
            source: "Tasha's update · synthetic private record",
            observedAt: isoDateFromNow(-7, 11, 0),
            confidence: "Observed",
          },
        ],
        hypotheses: [],
        commitments: [],
        relatedPeople: [],
      },
    ],
    interventions: [],
    policies: {
      global: {
        personalized_communication: {
          label: "Personalized communication",
          value: "Prepare a draft; approval is required before any send.",
          authority: "Human approval required",
        },
        introductions: {
          label: "Introductions",
          value: "Require approval before any introduction is sent.",
          authority: "Human approval required",
        },
        workspace_actions: {
          label: "Personal workspace actions",
          value: "Low-risk organizational actions may be performed with more autonomy.",
          authority: "Low-risk only",
        },
      },
      personOverrides: {},
      lastUpdated: createdAt,
    },
    activity: [],
    transient: {
      canonicalTomorrowMorning: tomorrowMorning,
    },
  };
}

export const DAY_MS = DAY;
