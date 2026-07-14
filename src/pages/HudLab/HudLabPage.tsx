import * as s from "./HudLabPage.css.ts";

type VectorStyleId = keyof typeof s.hudCardFrame;

type HudMeter = {
    label: string;
    value: string;
    width: string;
    tone: keyof typeof s.meterFillTone;
};

type HudCard = {
    title: string;
    role: string;
    statA: string;
    statB: string;
    statC: string;
    meters: HudMeter[];
    tags: string[];
};

type VectorGroup = {
    id: VectorStyleId;
    label: string;
    mood: string;
    mark: string;
    cards: HudCard[];
};

const vectorGroups: VectorGroup[] = [
    {
        id: "neutral",
        label: "Neutral",
        mood: "salvage, first shelters, practical city bones",
        mark: "N",
        cards: [
            {
                title: "Shelter",
                role: "Early housing / people",
                statA: "3",
                statB: "4",
                statC: "1",
                meters: [
                    {label: "People", value: "+3", width: "58%", tone: "success"},
                    {label: "Signature", value: "+4", width: "34%", tone: "warning"},
                ],
                tags: ["Housing", "Starter"],
            },
            {
                title: "Scrap Collection",
                role: "Salvage / basic supplies",
                statA: "2",
                statB: "5",
                statC: "1",
                meters: [
                    {label: "Supplies", value: "+5", width: "66%", tone: "success"},
                    {label: "Noise", value: "+2", width: "24%", tone: "warning"},
                ],
                tags: ["Scrap", "Production"],
            },
            {
                title: "Tool Shed",
                role: "Utility / unlock helper",
                statA: "1",
                statB: "3",
                statC: "2",
                meters: [
                    {label: "Tools", value: "+3", width: "48%", tone: "success"},
                    {label: "Upkeep", value: "2", width: "38%", tone: "info"},
                ],
                tags: ["Tools", "Craft"],
            },
        ],
    },
    {
        id: "tech",
        label: "Tech",
        mood: "glass panels, scan lines, active diagnostics",
        mark: "T",
        cards: [
            {
                title: "Power Relay",
                role: "Electric support / network",
                statA: "8",
                statB: "6",
                statC: "3",
                meters: [
                    {label: "Power", value: "+8", width: "74%", tone: "info"},
                    {label: "Heat", value: "+3", width: "30%", tone: "warning"},
                ],
                tags: ["Power", "Grid"],
            },
            {
                title: "Sensor Mast",
                role: "Threat visibility / range",
                statA: "6",
                statB: "2",
                statC: "4",
                meters: [
                    {label: "Scan", value: "+6", width: "68%", tone: "info"},
                    {label: "Load", value: "2", width: "20%", tone: "success"},
                ],
                tags: ["Scan", "Wall"],
            },
            {
                title: "Assembly Bay",
                role: "Tower parts / production",
                statA: "5",
                statB: "7",
                statC: "4",
                meters: [
                    {label: "Output", value: "+7", width: "72%", tone: "success"},
                    {label: "Signature", value: "+5", width: "42%", tone: "warning"},
                ],
                tags: ["Parts", "Factory"],
            },
        ],
    },
    {
        id: "nature",
        label: "Nature",
        mood: "living edges, green glow, soft warnings",
        mark: "G",
        cards: [
            {
                title: "Wild Garden",
                role: "Growth / low signature",
                statA: "2",
                statB: "4",
                statC: "1",
                meters: [
                    {label: "Growth", value: "+4", width: "62%", tone: "nature"},
                    {label: "Signature", value: "+2", width: "18%", tone: "success"},
                ],
                tags: ["Plants", "Quiet"],
            },
            {
                title: "Herbalist Hut",
                role: "Plants / support mix",
                statA: "5",
                statB: "6",
                statC: "2",
                meters: [
                    {label: "Biomass", value: "+6", width: "70%", tone: "nature"},
                    {label: "Upkeep", value: "2", width: "26%", tone: "info"},
                ],
                tags: ["Plants", "Support"],
            },
            {
                title: "Thorn Bulwark",
                role: "Living wall / containment",
                statA: "9",
                statB: "3",
                statC: "4",
                meters: [
                    {label: "Contain", value: "+9", width: "82%", tone: "nature"},
                    {label: "Spread", value: "+3", width: "36%", tone: "warning"},
                ],
                tags: ["Wall", "Regrowth"],
            },
        ],
    },
    {
        id: "medieval",
        label: "Medieval",
        mood: "brass trim, stone plates, readable siege craft",
        mark: "M",
        cards: [
            {
                title: "Workshop",
                role: "Craft / city support",
                statA: "4",
                statB: "7",
                statC: "2",
                meters: [
                    {label: "Craft", value: "+7", width: "72%", tone: "success"},
                    {label: "Smoke", value: "+4", width: "34%", tone: "warning"},
                ],
                tags: ["Craft", "Stone"],
            },
            {
                title: "Farm",
                role: "Food / people upkeep",
                statA: "3",
                statB: "8",
                statC: "1",
                meters: [
                    {label: "Food", value: "+8", width: "76%", tone: "success"},
                    {label: "Footprint", value: "+3", width: "28%", tone: "warning"},
                ],
                tags: ["Food", "People"],
            },
            {
                title: "Engineer's House",
                role: "Wall craft / towers",
                statA: "6",
                statB: "5",
                statC: "3",
                meters: [
                    {label: "Fortify", value: "+6", width: "70%", tone: "success"},
                    {label: "Upkeep", value: "3", width: "38%", tone: "info"},
                ],
                tags: ["Wall", "Tower"],
            },
        ],
    },
    {
        id: "aether",
        label: "Aether",
        mood: "runes, glow glass, high-signature magic",
        mark: "A",
        cards: [
            {
                title: "Dolmen",
                role: "Veil / ritual foundation",
                statA: "20",
                statB: "8",
                statC: "3",
                meters: [
                    {label: "Veil", value: "+8", width: "72%", tone: "aether"},
                    {label: "Signature", value: "+20", width: "88%", tone: "warning"},
                ],
                tags: ["Ritual", "Veil"],
            },
            {
                title: "Shaman Hut",
                role: "Ritual support / focus",
                statA: "12",
                statB: "6",
                statC: "2",
                meters: [
                    {label: "Focus", value: "+6", width: "64%", tone: "aether"},
                    {label: "Instability", value: "+4", width: "36%", tone: "warning"},
                ],
                tags: ["Focus", "Ritual"],
            },
            {
                title: "Warded Home",
                role: "Protected housing / veil",
                statA: "9",
                statB: "5",
                statC: "2",
                meters: [
                    {label: "Ward", value: "+5", width: "58%", tone: "aether"},
                    {label: "People", value: "+2", width: "34%", tone: "success"},
                ],
                tags: ["Ward", "Housing"],
            },
        ],
    },
];

export default function HudLabPage() {
    return (
        <section className={s.page} aria-labelledby="hud-lab-title">
            <header className={s.header}>
                <div className={s.headerCopy}>
                    <p className={s.eyebrow}>Temporary city overlay</p>
                    <h1 id="hud-lab-title" className={s.title}>HUD Style Selector</h1>
                </div>
                <div className={s.headerBadge}>
                    Three cards per development vector
                </div>
            </header>

            <div className={s.vectorStack}>
                {vectorGroups.map(group => (
                    <section key={group.id} className={s.vectorSection} aria-labelledby={`${group.id}-hud-heading`}>
                        <header className={s.vectorHeader}>
                            <div className={s.vectorMark}>{group.mark}</div>
                            <div className={s.vectorHeaderCopy}>
                                <h2 id={`${group.id}-hud-heading`} className={s.vectorTitle}>{group.label}</h2>
                                <p className={s.vectorMood}>{group.mood}</p>
                            </div>
                        </header>

                        <div className={s.selectorGrid} role="list" aria-label={`${group.label} HUD cards`}>
                            {group.cards.map(card => (
                                <HudStyleCard key={`${group.id}-${card.title}`} group={group} card={card} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </section>
    );
}

function HudStyleCard({group, card}: {group: VectorGroup; card: HudCard}) {
    const stats = [
        {label: "Sig", value: card.statA},
        {label: "Gain", value: card.statB},
        {label: "Tier", value: card.statC},
    ];

    return (
        <article className={s.hudCardFrame[group.id]} role="listitem">
            <div className={s.cardGlow} aria-hidden />
            <header className={s.cardHeader}>
                <div className={s.styleMark} aria-hidden>{group.mark}</div>
                <div className={s.cardTitleGroup}>
                    <div className={s.styleName}>{group.label} Frame</div>
                    <div className={s.styleMood}>{group.mood}</div>
                </div>
            </header>

            <div className={s.buildingRow}>
                <div className={s.hexIcon} aria-hidden>
                    <span className={s.hexIconCore} />
                </div>
                <div className={s.buildingCopy}>
                    <h3 className={s.buildingName}>{card.title}</h3>
                    <p className={s.buildingRole}>{card.role}</p>
                </div>
            </div>

            <div className={s.statGrid}>
                {stats.map(stat => (
                    <div key={stat.label} className={s.statCell}>
                        <span className={s.statLabel}>{stat.label}</span>
                        <strong className={s.statValue}>{stat.value}</strong>
                    </div>
                ))}
            </div>

            <div className={s.meterStack}>
                {card.meters.map(row => (
                    <div key={row.label} className={s.meterRow}>
                        <div className={s.meterMeta}>
                            <span>{row.label}</span>
                            <strong>{row.value}</strong>
                        </div>
                        <div className={s.meterTrack}>
                            <span className={s.meterFillTone[row.tone]} style={{width: row.width}} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={s.cardFooter}>
                {card.tags.map(tag => (
                    <span key={tag} className={s.tag}>{tag}</span>
                ))}
                <button type="button" className={s.selectButton}>Preview</button>
            </div>
        </article>
    );
}
