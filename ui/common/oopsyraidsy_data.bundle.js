(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 3483:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ oopsy_manifest)
});

// EXTERNAL MODULE: ./resources/netregexes.ts
var netregexes = __webpack_require__(7641);
// EXTERNAL MODULE: ./resources/zone_id.ts
var zone_id = __webpack_require__(2248);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/buffs.ts


// Abilities seem instant.
const abilityCollectSeconds = 0.5;
// Observation: up to ~1.2 seconds for a buff to roll through the party.
const effectCollectSeconds = 2.0;
const isInPartyConditionFunc = (data, matches) => {
    const sourceId = matches.sourceId.toUpperCase();
    if (data.party.partyIds.includes(sourceId))
        return true;
    if (data.petIdToOwnerId) {
        const ownerId = data.petIdToOwnerId[sourceId];
        if (ownerId && data.party.partyIds.includes(ownerId))
            return true;
    }
    return false;
};
const missedFunc = (args) => [
    {
        // Sure, not all of these are "buffs" per se, but they're all in the buffs file.
        id: `Buff ${args.triggerId} Collect`,
        type: args.regexType,
        netRegex: args.netRegex,
        condition: isInPartyConditionFunc,
        run: (data, matches) => {
            var _a, _b;
            var _c, _d;
            (_a = data.generalBuffCollection) !== null && _a !== void 0 ? _a : (data.generalBuffCollection = {});
            const arr = (_b = (_c = data.generalBuffCollection)[_d = args.triggerId]) !== null && _b !== void 0 ? _b : (_c[_d] = []);
            arr.push(matches);
        },
    },
    {
        id: `Buff ${args.triggerId}`,
        type: args.regexType,
        netRegex: args.netRegex,
        condition: isInPartyConditionFunc,
        delaySeconds: args.collectSeconds,
        suppressSeconds: args.collectSeconds,
        mistake: (data) => {
            var _a;
            const allMatches = (_a = data.generalBuffCollection) === null || _a === void 0 ? void 0 : _a[args.triggerId];
            const firstMatch = allMatches === null || allMatches === void 0 ? void 0 : allMatches[0];
            const thingName = firstMatch === null || firstMatch === void 0 ? void 0 : firstMatch[args.field];
            if (!allMatches || !firstMatch || !thingName)
                return;
            const partyNames = data.party.partyNames;
            // TODO: consider dead people somehow
            const gotBuffMap = {};
            for (const name of partyNames)
                gotBuffMap[name] = false;
            let sourceName = firstMatch.source;
            // Blame pet mistakes on owners.
            if (data.petIdToOwnerId) {
                const petId = firstMatch.sourceId.toUpperCase();
                const ownerId = data.petIdToOwnerId[petId];
                if (ownerId) {
                    const ownerName = data.party.nameFromId(ownerId);
                    if (ownerName)
                        sourceName = ownerName;
                    else
                        console.error(`Couldn't find name for ${ownerId} from pet ${petId}`);
                }
            }
            if (args.ignoreSelf)
                gotBuffMap[sourceName] = true;
            for (const matches of allMatches) {
                // In case you have multiple party members who hit the same cooldown at the same
                // time (lol?), then ignore anybody who wasn't the first.
                if (matches.source !== firstMatch.source)
                    continue;
                gotBuffMap[matches.target] = true;
            }
            const missed = Object.keys(gotBuffMap).filter((x) => !gotBuffMap[x]);
            if (missed.length === 0)
                return;
            // TODO: oopsy could really use mouseover popups for details.
            // TODO: alternatively, if we have a death report, it'd be good to
            // explicitly call out that other people got a heal this person didn't.
            if (missed.length < 4) {
                return {
                    type: args.type,
                    blame: sourceName,
                    text: {
                        en: `${thingName} missed ${missed.map((x) => data.ShortName(x)).join(', ')}`,
                        de: `${thingName} verfehlt ${missed.map((x) => data.ShortName(x)).join(', ')}`,
                        fr: `${thingName} manqué(e) sur ${missed.map((x) => data.ShortName(x)).join(', ')}`,
                        ja: `(${missed.map((x) => data.ShortName(x)).join(', ')}) が${thingName}を受けなかった`,
                        cn: `${missed.map((x) => data.ShortName(x)).join(', ')} 没受到 ${thingName}`,
                        ko: `${thingName} ${missed.map((x) => data.ShortName(x)).join(', ')}에게 적용안됨`,
                    },
                };
            }
            // If there's too many people, just list the number of people missed.
            // TODO: we could also list everybody on separate lines?
            return {
                type: args.type,
                blame: sourceName,
                text: {
                    en: `${thingName} missed ${missed.length} people`,
                    de: `${thingName} verfehlte ${missed.length} Personen`,
                    fr: `${thingName} manqué(e) sur ${missed.length} personnes`,
                    ja: `${missed.length}人が${thingName}を受けなかった`,
                    cn: `有${missed.length}人没受到 ${thingName}`,
                    ko: `${thingName} ${missed.length}명에게 적용안됨`,
                },
            };
        },
        run: (data) => {
            if (data.generalBuffCollection)
                delete data.generalBuffCollection[args.triggerId];
        },
    },
];
const missedMitigationBuff = (args) => {
    if (!args.effectId)
        console.error('Missing effectId: ' + JSON.stringify(args));
    return missedFunc({
        triggerId: args.id,
        netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: args.effectId }),
        regexType: 'GainsEffect',
        field: 'effect',
        type: 'heal',
        ignoreSelf: args.ignoreSelf,
        collectSeconds: args.collectSeconds ? args.collectSeconds : effectCollectSeconds,
    });
};
const missedDamageAbility = (args) => {
    if (!args.abilityId)
        console.error('Missing abilityId: ' + JSON.stringify(args));
    return missedFunc({
        triggerId: args.id,
        netRegex: netregexes/* default.ability */.Z.ability({ id: args.abilityId }),
        regexType: 'Ability',
        field: 'ability',
        type: 'damage',
        ignoreSelf: args.ignoreSelf,
        collectSeconds: args.collectSeconds ? args.collectSeconds : abilityCollectSeconds,
    });
};
const missedHeal = (args) => {
    if (!args.abilityId)
        console.error('Missing abilityId: ' + JSON.stringify(args));
    return missedFunc({
        triggerId: args.id,
        netRegex: netregexes/* default.ability */.Z.ability({ id: args.abilityId }),
        regexType: 'Ability',
        field: 'ability',
        type: 'heal',
        collectSeconds: args.collectSeconds ? args.collectSeconds : abilityCollectSeconds,
    });
};
const missedMitigationAbility = missedHeal;
const triggerSet = {
    zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
    triggers: [
        {
            id: 'Buff Pet To Owner Mapper',
            type: 'AddedCombatant',
            netRegex: netregexes/* default.addedCombatantFull */.Z.addedCombatantFull(),
            run: (data, matches) => {
                var _a;
                if (matches.ownerId === '0')
                    return;
                (_a = data.petIdToOwnerId) !== null && _a !== void 0 ? _a : (data.petIdToOwnerId = {});
                // Fix any lowercase ids.
                data.petIdToOwnerId[matches.id.toUpperCase()] = matches.ownerId.toUpperCase();
            },
        },
        {
            id: 'Buff Pet To Owner Clearer',
            type: 'ChangeZone',
            netRegex: netregexes/* default.changeZone */.Z.changeZone(),
            run: (data) => {
                // Clear this hash periodically so it doesn't have false positives.
                data.petIdToOwnerId = {};
            },
        },
        // Prefer abilities to effects, as effects take longer to roll through the party.
        // However, some things are only effects and so there is no choice.
        // For things you can step in or out of, give a longer timer?  This isn't perfect.
        // TODO: include soil here??
        ...missedMitigationBuff({ id: 'Collective Unconscious', effectId: '351', collectSeconds: 10 }),
        // Arms Up = 498 (others), Passage Of Arms = 497 (you).  Use both in case everybody is missed.
        ...missedMitigationBuff({ id: 'Passage of Arms', effectId: '49[78]', ignoreSelf: true, collectSeconds: 10 }),
        ...missedMitigationBuff({ id: 'Divine Veil', effectId: '2D7', ignoreSelf: true }),
        ...missedMitigationAbility({ id: 'Heart Of Light', abilityId: '3F20' }),
        ...missedMitigationAbility({ id: 'Dark Missionary', abilityId: '4057' }),
        ...missedMitigationAbility({ id: 'Shake It Off', abilityId: '1CDC' }),
        // 3F44 is the correct Quadruple Technical Finish, others are Dinky Technical Finish.
        ...missedDamageAbility({ id: 'Technical Finish', abilityId: '3F4[1-4]' }),
        ...missedDamageAbility({ id: 'Divination', abilityId: '40A8' }),
        ...missedDamageAbility({ id: 'Brotherhood', abilityId: '1CE4' }),
        ...missedDamageAbility({ id: 'Battle Litany', abilityId: 'DE5' }),
        ...missedDamageAbility({ id: 'Embolden', abilityId: '1D60' }),
        ...missedDamageAbility({ id: 'Battle Voice', abilityId: '76', ignoreSelf: true }),
        // Too noisy (procs every three seconds, and bards often off doing mechanics).
        // missedDamageBuff({ id: 'Wanderer\'s Minuet', effectId: '8A8', ignoreSelf: true }),
        // missedDamageBuff({ id: 'Mage\'s Ballad', effectId: '8A9', ignoreSelf: true }),
        // missedDamageBuff({ id: 'Army\'s Paeon', effectId: '8AA', ignoreSelf: true }),
        ...missedMitigationAbility({ id: 'Troubadour', abilityId: '1CED' }),
        ...missedMitigationAbility({ id: 'Tactician', abilityId: '41F9' }),
        ...missedMitigationAbility({ id: 'Shield Samba', abilityId: '3E8C' }),
        ...missedMitigationAbility({ id: 'Mantra', abilityId: '41' }),
        ...missedDamageAbility({ id: 'Devotion', abilityId: '1D1A' }),
        // Maybe using a healer LB1/LB2 should be an error for the healer. O:)
        // ...missedHeal({ id: 'Healing Wind', abilityId: 'CE' }),
        // ...missedHeal({ id: 'Breath of the Earth', abilityId: 'CF' }),
        ...missedHeal({ id: 'Medica', abilityId: '7C' }),
        ...missedHeal({ id: 'Medica II', abilityId: '85' }),
        ...missedHeal({ id: 'Afflatus Rapture', abilityId: '4096' }),
        ...missedHeal({ id: 'Temperance', abilityId: '751' }),
        ...missedHeal({ id: 'Plenary Indulgence', abilityId: '1D09' }),
        ...missedHeal({ id: 'Pulse of Life', abilityId: 'D0' }),
        ...missedHeal({ id: 'Succor', abilityId: 'BA' }),
        ...missedHeal({ id: 'Indomitability', abilityId: 'DFF' }),
        ...missedHeal({ id: 'Deployment Tactics', abilityId: 'E01' }),
        ...missedHeal({ id: 'Whispering Dawn', abilityId: '323' }),
        ...missedHeal({ id: 'Fey Blessing', abilityId: '40A0' }),
        ...missedHeal({ id: 'Consolation', abilityId: '40A3' }),
        ...missedHeal({ id: 'Angel\'s Whisper', abilityId: '40A6' }),
        ...missedMitigationAbility({ id: 'Fey Illumination', abilityId: '325' }),
        ...missedMitigationAbility({ id: 'Seraphic Illumination', abilityId: '40A7' }),
        ...missedHeal({ id: 'Angel Feathers', abilityId: '1097' }),
        ...missedHeal({ id: 'Helios', abilityId: 'E10' }),
        ...missedHeal({ id: 'Aspected Helios', abilityId: 'E11' }),
        ...missedHeal({ id: 'Aspected Helios', abilityId: '3200' }),
        ...missedHeal({ id: 'Celestial Opposition', abilityId: '40A9' }),
        ...missedHeal({ id: 'Astral Stasis', abilityId: '1098' }),
        ...missedHeal({ id: 'White Wind', abilityId: '2C8E' }),
        ...missedHeal({ id: 'Gobskin', abilityId: '4780' }),
        // TODO: export all of these missed functions into their own helper
        // and then add this to the Delubrum Reginae files directly.
        ...missedMitigationAbility({ id: 'Lost Aethershield', abilityId: '5753' }),
    ],
};
/* harmony default export */ const buffs = (triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/general.ts


// General mistakes; these apply everywhere.
const general_triggerSet = {
    zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
    triggers: [
        {
            // Trigger id for internally generated early pull warning.
            id: 'General Early Pull',
        },
        {
            id: 'General Food Buff',
            type: 'LosesEffect',
            // Well Fed
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '48' }),
            condition: (_data, matches) => {
                // Prevent "Eos loses the effect of Well Fed from Critlo Mcgee"
                return matches.target === matches.source;
            },
            mistake: (data, matches) => {
                var _a;
                (_a = data.lostFood) !== null && _a !== void 0 ? _a : (data.lostFood = {});
                // Well Fed buff happens repeatedly when it falls off (WHY),
                // so suppress multiple occurrences.
                if (!data.inCombat || data.lostFood[matches.target])
                    return;
                data.lostFood[matches.target] = true;
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'lost food buff',
                        de: 'Nahrungsbuff verloren',
                        fr: 'Buff nourriture terminée',
                        ja: '飯効果が失った',
                        cn: '失去食物BUFF',
                        ko: '음식 버프 해제',
                    },
                };
            },
        },
        {
            id: 'General Well Fed',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '48' }),
            run: (data, matches) => {
                if (!data.lostFood)
                    return;
                delete data.lostFood[matches.target];
            },
        },
        {
            id: 'General Rabbit Medium',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '8E0' }),
            condition: (data, matches) => data.IsPlayerId(matches.sourceId),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.source,
                    text: {
                        en: 'bunny',
                        de: 'Hase',
                        fr: 'lapin',
                        ja: 'うさぎ',
                        cn: '兔子',
                        ko: '토끼',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const general = (general_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/test.ts


// Test mistake triggers.
const test_triggerSet = {
    zoneId: zone_id/* default.MiddleLaNoscea */.Z.MiddleLaNoscea,
    triggers: [
        {
            id: 'Test Bow',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You bow courteously to the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous vous inclinez devant le mannequin d\'entraînement.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人にお辞儀した.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*恭敬地对木人行礼.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형에게 공손하게 인사합니다.*?' }),
            mistake: (data) => {
                return {
                    type: 'pull',
                    blame: data.me,
                    text: {
                        en: 'Bow',
                        de: 'Bogen',
                        fr: 'Saluer',
                        ja: 'お辞儀',
                        cn: '鞠躬',
                        ko: '인사',
                    },
                };
            },
        },
        {
            id: 'Test Wipe',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You bid farewell to the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous faites vos adieux au mannequin d\'entraînement.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人に別れの挨拶をした.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*向木人告别.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형에게 작별 인사를 합니다.*?' }),
            mistake: (data) => {
                return {
                    type: 'wipe',
                    blame: data.me,
                    text: {
                        en: 'Party Wipe',
                        de: 'Gruppenwipe',
                        fr: 'Party Wipe',
                        ja: 'ワイプ',
                        cn: '团灭',
                        ko: '파티 전멸',
                    },
                };
            },
        },
        {
            id: 'Test Bootshine',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '35' }),
            condition: (data, matches) => {
                if (matches.source !== data.me)
                    return false;
                const strikingDummyByLocale = {
                    en: 'Striking Dummy',
                    fr: 'Mannequin d\'entraînement',
                    ja: '木人',
                    cn: '木人',
                    ko: '나무인형',
                };
                const strikingDummyNames = Object.values(strikingDummyByLocale);
                return strikingDummyNames.includes(matches.target);
            },
            mistake: (data, matches) => {
                var _a;
                (_a = data.bootCount) !== null && _a !== void 0 ? _a : (data.bootCount = 0);
                data.bootCount++;
                const text = `${matches.ability} (${data.bootCount}): ${data.DamageFromMatches(matches)}`;
                return { type: 'warn', blame: data.me, text: text };
            },
        },
        {
            id: 'Test Leaden Fist',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '745' }),
            condition: (data, matches) => matches.source === data.me,
            mistake: (data, matches) => {
                return { type: 'good', blame: data.me, text: matches.effect };
            },
        },
        {
            id: 'Test Oops',
            type: 'GameLog',
            netRegex: netregexes/* default.echo */.Z.echo({ line: '.*oops.*' }),
            suppressSeconds: 10,
            mistake: (data, matches) => {
                return { type: 'fail', blame: data.me, text: matches.line };
            },
        },
        {
            id: 'Test Poke Collect',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You poke the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous touchez légèrement le mannequin d\'entraînement du doigt.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人をつついた.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*用手指戳向木人.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형을 쿡쿡 찌릅니다.*?' }),
            run: (data) => {
                var _a;
                data.pokeCount = ((_a = data.pokeCount) !== null && _a !== void 0 ? _a : 0) + 1;
            },
        },
        {
            id: 'Test Poke',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You poke the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous touchez légèrement le mannequin d\'entraînement du doigt.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人をつついた.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*用手指戳向木人.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형을 쿡쿡 찌릅니다.*?' }),
            delaySeconds: 5,
            mistake: (data) => {
                // 1 poke at a time is fine, but more than one in 5 seconds is (OBVIOUSLY) a mistake.
                if (!data.pokeCount || data.pokeCount <= 1)
                    return;
                return {
                    type: 'fail',
                    blame: data.me,
                    text: {
                        en: `Too many pokes (${data.pokeCount})`,
                        de: `Zu viele Piekser (${data.pokeCount})`,
                        fr: `Trop de touches (${data.pokeCount})`,
                        ja: `いっぱいつついた (${data.pokeCount})`,
                        cn: `戳太多下啦 (${data.pokeCount})`,
                        ko: `너무 많이 찌름 (${data.pokeCount}번)`,
                    },
                };
            },
            run: (data) => delete data.pokeCount,
        },
    ],
};
/* harmony default export */ const test = (test_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/ifrit-nm.ts

// Ifrit Story Mode
const ifrit_nm_triggerSet = {
    zoneId: zone_id/* default.TheBowlOfEmbers */.Z.TheBowlOfEmbers,
    damageWarn: {
        'IfritNm Radiant Plume': '2DE',
    },
    shareWarn: {
        'IfritNm Incinerate': '1C5',
        'IfritNm Eruption': '2DD',
    },
};
/* harmony default export */ const ifrit_nm = (ifrit_nm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-nm.ts

// Titan Story Mode
const titan_nm_triggerSet = {
    zoneId: zone_id/* default.TheNavel */.Z.TheNavel,
    damageWarn: {
        'TitanNm Weight Of The Land': '3CD',
    },
    damageFail: {
        'TitanNm Landslide': '28A',
    },
    shareWarn: {
        'TitanNm Rock Buster': '281',
    },
};
/* harmony default export */ const titan_nm = (titan_nm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/levi-ex.ts


// It's hard to capture the reflection abilities from Leviathan's Head and Tail if you use
// ranged physical attacks / magic attacks respectively, as the ability names are the
// ability you used and don't appear to show up in the log as normal "ability" lines.
// That said, dots still tick independently on both so it's likely that people will atack
// them anyway.
// TODO: Figure out why Dread Tide / Waterspout appear like shares (i.e. 0x16 id).
// Dread Tide = 823/824/825, Waterspout = 829
// Leviathan Extreme
const levi_ex_triggerSet = {
    zoneId: zone_id/* default.TheWhorleaterExtreme */.Z.TheWhorleaterExtreme,
    damageWarn: {
        'LeviEx Grand Fall': '82F',
        'LeviEx Hydro Shot': '748',
        'LeviEx Dreadstorm': '749',
    },
    damageFail: {
        'LeviEx Body Slam': '82A',
        'LeviEx Spinning Dive 1': '88A',
        'LeviEx Spinning Dive 2': '88B',
        'LeviEx Spinning Dive 3': '82C',
    },
    gainsEffectWarn: {
        'LeviEx Dropsy': '110',
    },
    gainsEffectFail: {
        'LeviEx Hysteria': '128',
    },
    triggers: [
        {
            id: 'LeviEx Body Slam Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '82A' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const levi_ex = (levi_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/shiva-hm.ts


// Shiva Hard
const shiva_hm_triggerSet = {
    zoneId: zone_id/* default.TheAkhAfahAmphitheatreHard */.Z.TheAkhAfahAmphitheatreHard,
    damageWarn: {
        // Large white circles.
        'ShivaHm Icicle Impact': '993',
        // Avoidable tank stun.
        'ShivaHm Glacier Bash': '9A1',
    },
    shareWarn: {
        // Knockback tank cleave.
        'ShivaHm Heavenly Strike': '9A0',
        // Hailstorm spread marker.
        'ShivaHm Hailstorm': '998',
    },
    shareFail: {
        // Tankbuster.  This is Shiva Hard mode, not Shiva Extreme.  Please!
        'ShivaHm Icebrand': '996',
    },
    triggers: [
        {
            id: 'ShivaHm Diamond Dust',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '98A' }),
            run: (data) => {
                data.seenDiamondDust = true;
            },
        },
        {
            id: 'ShivaHm Deep Freeze',
            type: 'GainsEffect',
            // Shiva also uses ability 9A3 on you, but it has the untranslated name
            // 透明：シヴァ：凍結レクト：ノックバック用. So, use the effect instead for free translation.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1E7' }),
            condition: (data) => {
                // The intermission also gets this effect, so only a mistake after that.
                // Unlike extreme, this has the same 20 second duration as the intermission.
                return data.seenDiamondDust;
            },
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const shiva_hm = (shiva_hm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/shiva-ex.ts


// Shiva Extreme
const shiva_ex_triggerSet = {
    zoneId: zone_id/* default.TheAkhAfahAmphitheatreExtreme */.Z.TheAkhAfahAmphitheatreExtreme,
    damageWarn: {
        // Large white circles.
        'ShivaEx Icicle Impact': 'BEB',
        // "get in" aoe
        'ShivaEx Whiteout': 'BEC',
        // Avoidable tank stun.
        'ShivaEx Glacier Bash': 'BE9',
    },
    damageFail: {
        // 270 degree attack.
        'ShivaEx Glass Dance': 'BDF',
    },
    shareWarn: {
        // Hailstorm spread marker.
        'ShivaEx Hailstorm': 'BE2',
    },
    shareFail: {
        // Laser.  TODO: maybe blame the person it's on??
        'ShivaEx Avalanche': 'BE0',
    },
    soloWarn: {
        // Party shared tankbuster
        'ShivaEx Icebrand': 'BE1',
    },
    triggers: [
        {
            id: 'ShivaEx Deep Freeze',
            type: 'GainsEffect',
            // Shiva also uses ability C8A on you, but it has the untranslated name
            // 透明：シヴァ：凍結レクト：ノックバック用/ヒロイック. So, use the effect instead for free translation.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1E7' }),
            condition: (_data, matches) => {
                // The intermission also gets this effect, but for a shorter duration.
                return parseFloat(matches.duration) > 20;
            },
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const shiva_ex = (shiva_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-hm.ts

// Titan Hard
const titan_hm_triggerSet = {
    zoneId: zone_id/* default.TheNavelHard */.Z.TheNavelHard,
    damageWarn: {
        'TitanHm Weight Of The Land': '553',
        'TitanHm Burst': '41C',
    },
    damageFail: {
        'TitanHm Landslide': '554',
    },
    shareWarn: {
        'TitanHm Rock Buster': '550',
    },
    shareFail: {
        'TitanHm Mountain Buster': '283',
    },
};
/* harmony default export */ const titan_hm = (titan_hm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-ex.ts

// Titan Extreme
const titan_ex_triggerSet = {
    zoneId: zone_id/* default.TheNavelExtreme */.Z.TheNavelExtreme,
    damageWarn: {
        'TitanEx Weight Of The Land': '5BE',
        'TitanEx Burst': '5BF',
    },
    damageFail: {
        'TitanEx Landslide': '5BB',
        'TitanEx Gaoler Landslide': '5C3',
    },
    shareWarn: {
        'TitanEx Rock Buster': '5B7',
    },
    shareFail: {
        'TitanEx Mountain Buster': '5B8',
    },
};
/* harmony default export */ const titan_ex = (titan_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/alliance/weeping_city.ts


const weeping_city_triggerSet = {
    zoneId: zone_id/* default.TheWeepingCityOfMhach */.Z.TheWeepingCityOfMhach,
    damageWarn: {
        'Weeping Critical Bite': '1848',
        'Weeping Realm Shaker': '183E',
        'Weeping Silkscreen': '183C',
        'Weeping Silken Spray': '1824',
        'Weeping Tremblor 1': '1837',
        'Weeping Tremblor 2': '1836',
        'Weeping Tremblor 3': '1835',
        'Weeping Spider Thread': '1839',
        'Weeping Fire II': '184E',
        'Weeping Necropurge': '17D7',
        'Weeping Rotten Breath': '17D0',
        'Weeping Mow': '17D2',
        'Weeping Dark Eruption': '17C3',
        // 1806 is also Flare Star, but if you get by 1805 you also get hit by 1806?
        'Weeping Flare Star': '1805',
        'Weeping Execration': '1829',
        'Weeping Haircut 1': '180B',
        'Weeping Haircut 2': '180F',
        'Weeping Entanglement': '181D',
        'Weeping Evil Curl': '1816',
        'Weeping Evil Tress': '1817',
        'Weeping Depth Charge': '1820',
        'Weeping Feint Particle Beam': '1928',
        'Weeping Evil Switch': '1815',
    },
    gainsEffectWarn: {
        'Weeping Hysteria': '128',
        'Weeping Zombification': '173',
        'Weeping Toad': '1B7',
        'Weeping Doom': '38E',
        'Weeping Assimilation': '42C',
        'Weeping Stun': '95',
    },
    shareWarn: {
        'Weeping Arachne Web': '185E',
        'Weeping Earth Aether': '1841',
        'Weeping Epigraph': '1852',
        // This is too noisy.  Better to pop the balloons than worry about friends.
        // 'Weeping Explosion': '1807', // Ozmasphere Cube orb explosion
        'Weeping Split End 1': '180C',
        'Weeping Split End 2': '1810',
        'Weeping Bloodied Nail': '181F',
    },
    triggers: [
        {
            id: 'Weeping Forgall Gradual Zombification Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '415' }),
            run: (data, matches) => {
                var _a;
                (_a = data.zombie) !== null && _a !== void 0 ? _a : (data.zombie = {});
                data.zombie[matches.target] = true;
            },
        },
        {
            id: 'Weeping Forgall Gradual Zombification Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '415' }),
            run: (data, matches) => {
                data.zombie = data.zombie || {};
                data.zombie[matches.target] = false;
            },
        },
        {
            id: 'Weeping Forgall Mega Death',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '17CA' }),
            condition: (data, matches) => data.zombie && !data.zombie[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'Weeping Headstone Shield Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '15E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.shield) !== null && _a !== void 0 ? _a : (data.shield = {});
                data.shield[matches.target] = true;
            },
        },
        {
            id: 'Weeping Headstone Shield Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '15E' }),
            run: (data, matches) => {
                data.shield = data.shield || {};
                data.shield[matches.target] = false;
            },
        },
        {
            id: 'Weeping Flaring Epigraph',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '1856' }),
            condition: (data, matches) => data.shield && !data.shield[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            // This ability name is helpfully called "Attack" so name it something else.
            id: 'Weeping Ozma Tank Laser',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ type: '22', id: '1831' }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Tank Laser',
                        de: 'Tank Laser',
                        fr: 'Tank Laser',
                        ja: 'タンクレザー',
                        cn: '坦克激光',
                        ko: '탱커 레이저',
                    },
                };
            },
        },
        {
            id: 'Weeping Ozma Holy',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '182E' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Slid off!',
                        de: 'ist runtergerutscht!',
                        fr: 'A glissé(e) !',
                        ja: 'ノックバック',
                        cn: '击退！',
                        ko: '넉백됨!',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const weeping_city = (weeping_city_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/aetherochemical_research_facility.ts


// Aetherochemical Research Facility
const aetherochemical_research_facility_triggerSet = {
    zoneId: zone_id/* default.TheAetherochemicalResearchFacility */.Z.TheAetherochemicalResearchFacility,
    damageWarn: {
        'ARF Grand Sword': '216',
        'ARF Cermet Drill': '20E',
        'ARF Magitek Slug': '10DB',
        'ARF Aetherochemical Grenado': '10E2',
        'ARF Magitek Spread': '10DC',
        'ARF Eerie Soundwave': '1170',
        'ARF Tail Slap': '125F',
        'ARF Calcifying Mist': '123A',
        'ARF Puncture': '1171',
        'ARF Sideswipe': '11A7',
        'ARF Gust': '395',
        'ARF Marrow Drain': 'D0E',
        'ARF Riddle Of The Sphinx': '10E4',
        'ARF Ka': '106E',
        'ARF Rotoswipe': '11CC',
        'ARF Auto-cannons': '12D9',
        'ARF Death\'s Door': '4EC',
        'ARF Spellsword': '4EB',
        'ARF End Of Days': '10FD',
        'ARF Blizzard Burst': '10FE',
        'ARF Fire Burst': '10FF',
        'ARF Sea Of Pitch': '12DE',
        'ARF Dark Blizzard II': '10F3',
        'ARF Dark Fire II': '10F8',
        'ARF Ancient Eruption': '1104',
        'ARF Entropic Flame': '1108',
    },
    shareWarn: {
        'ARF Chthonic Hush': '10E7',
        'ARF Height Of Chaos': '1101',
        'ARF Ancient Circle': '1102',
    },
    triggers: [
        {
            id: 'ARF Petrifaction',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '01' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const aetherochemical_research_facility = (aetherochemical_research_facility_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/fractal_continuum.ts

// Fractal Continuum
const fractal_continuum_triggerSet = {
    zoneId: zone_id/* default.TheFractalContinuum */.Z.TheFractalContinuum,
    damageWarn: {
        'Fractal Double Sever': 'F7D',
        'Fractal Aetheric Compression': 'F80',
        'Fractal 11-Tonze Swipe': 'F81',
        'Fractal 10-Tonze Slash': 'F83',
        'Fractal 111-Tonze Swing': 'F87',
        'Fractal Broken Glass': 'F8E',
        'Fractal Mines': 'F90',
        'Fractal Seed of the Rivers': 'F91',
    },
    shareWarn: {
        'Fractal Sanctification': 'F89',
    },
};
/* harmony default export */ const fractal_continuum = (fractal_continuum_triggerSet);

// EXTERNAL MODULE: ./ui/oopsyraidsy/oopsy_common.ts
var oopsy_common = __webpack_require__(5013);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/gubal_library_hard.ts



const gubal_library_hard_triggerSet = {
    zoneId: zone_id/* default.TheGreatGubalLibraryHard */.Z.TheGreatGubalLibraryHard,
    damageWarn: {
        'GubalHm Terror Eye': '930',
        'GubalHm Batter': '198A',
        'GubalHm Condemnation': '390',
        'GubalHm Discontinue 1': '1943',
        'GubalHm Discontinue 2': '1940',
        'GubalHm Discontinue 3': '1942',
        'GubalHm Frightful Roar': '193B',
        'GubalHm Issue 1': '193D',
        'GubalHm Issue 2': '193F',
        'GubalHm Issue 3': '1941',
        'GubalHm Desolation': '198C',
        'GubalHm Double Smash': '26A',
        'GubalHm Darkness': '3A0',
        'GubalHm Firewater': '3BA',
        'GubalHm Elbow Drop': 'CBA',
        'GubalHm Dark': '19DF',
        'GubalHm Seals': '194A',
        'GubalHm Water III': '1C67',
        'GubalHm Raging Axe': '1703',
        'GubalHm Magic Hammer': '1990',
        'GubalHm Properties Of Gravity': '1950',
        'GubalHm Properties Of Levitation': '194F',
        'GubalHm Comet': '1969',
    },
    damageFail: {
        'GubalHm Ecliptic Meteor': '195C',
    },
    shareWarn: {
        'GubalHm Searing Wind': '1944',
        'GubalHm Thunder': '19[AB]',
    },
    triggers: [
        {
            // Fire gate in hallway to boss 2, magnet failure on boss 2
            id: 'GubalHm Burns',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '10B' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Helper for Thunder 3 failures
            id: 'GubalHm Imp Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '46E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasImp) !== null && _a !== void 0 ? _a : (data.hasImp = {});
                data.hasImp[matches.target] = true;
            },
        },
        {
            id: 'GubalHm Imp Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '46E' }),
            run: (data, matches) => {
                data.hasImp = data.hasImp || {};
                data.hasImp[matches.target] = false;
            },
        },
        {
            // Targets with Imp when Thunder III resolves receive a vulnerability stack and brief stun
            id: 'GubalHm Imp Thunder',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '195[AB]', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => { var _a; return (_a = data.hasImp) === null || _a === void 0 ? void 0 : _a[matches.target]; },
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Shocked Imp',
                        de: 'Schockierter Imp',
                        ja: 'カッパを解除しなかった',
                        cn: '河童状态吃了暴雷',
                    },
                };
            },
        },
        {
            id: 'GubalHm Quake',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1956', ...oopsy_common/* playerDamageFields */.np }),
            // Always hits target, but if correctly resolved will deal 0 damage
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'GubalHm Tornado',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '195[78]', ...oopsy_common/* playerDamageFields */.np }),
            // Always hits target, but if correctly resolved will deal 0 damage
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const gubal_library_hard = (gubal_library_hard_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/sohm_al_hard.ts


const sohm_al_hard_triggerSet = {
    zoneId: zone_id/* default.SohmAlHard */.Z.SohmAlHard,
    damageWarn: {
        'SohmAlHm Deadly Vapor': '1DC9',
        'SohmAlHm Deeproot': '1CDA',
        'SohmAlHm Odious Air': '1CDB',
        'SohmAlHm Glorious Blaze': '1C33',
        'SohmAlHm Foul Waters': '118A',
        'SohmAlHm Plain Pound': '1187',
        'SohmAlHm Palsynyxis': '1161',
        'SohmAlHm Surface Breach': '1E80',
        'SohmAlHm Freshwater Cannon': '119F',
        'SohmAlHm Tail Smash': '1C35',
        'SohmAlHm Tail Swing': '1C36',
        'SohmAlHm Ripper Claw': '1C37',
        'SohmAlHm Wind Slash': '1C38',
        'SohmAlHm Wild Charge': '1C39',
        'SohmAlHm Hot Charge': '1C3A',
        'SohmAlHm Fireball': '1C3B',
        'SohmAlHm Lava Flow': '1C3C',
        'SohmAlHm Wild Horn': '1507',
        'SohmAlHm Lava Breath': '1C4D',
        'SohmAlHm Ring of Fire': '1C4C',
        'SohmAlHm Molten Silk 1': '1C43',
        'SohmAlHm Molten Silk 2': '1C44',
        'SohmAlHm Molten Silk 3': '1C42',
        'SohmAlHm Realm Shaker': '1C41',
    },
    triggers: [
        {
            // Warns if players step into the lava puddles. There is unfortunately no direct damage event.
            id: 'SohmAlHm Burns',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '11C' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const sohm_al_hard = (sohm_al_hard_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/raid/a12n.ts



const a12n_triggerSet = {
    zoneId: zone_id/* default.AlexanderTheSoulOfTheCreator */.Z.AlexanderTheSoulOfTheCreator,
    damageWarn: {
        'A12N Sacrament': '1AE6',
        'A12N Gravitational Anomaly': '1AEB',
    },
    shareWarn: {
        'A12N Divine Spear': '1AE3',
        'A12N Blazing Scourge': '1AE9',
        'A12N Plaint Of Severity': '1AF1',
        'A12N Communion': '1AFC',
    },
    triggers: [
        {
            id: 'A12N Assault Collect',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '461' }),
            run: (data, matches) => {
                var _a;
                (_a = data.assault) !== null && _a !== void 0 ? _a : (data.assault = []);
                data.assault.push(matches.target);
            },
        },
        {
            // It is a failure for a Severity marker to stack with the Solidarity group.
            id: 'A12N Assault Failure',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1AF2', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => { var _a; return (_a = data.assault) === null || _a === void 0 ? void 0 : _a.includes(matches.target); },
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Didn\'t Spread!',
                        de: 'Nicht verteilt!',
                        fr: 'Ne s\'est pas dispersé(e) !',
                        ja: '散開しなかった!',
                        cn: '没有散开!',
                    },
                };
            },
        },
        {
            id: 'A12N Assault Cleanup',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '461' }),
            delaySeconds: 20,
            suppressSeconds: 5,
            run: (data) => {
                delete data.assault;
            },
        },
    ],
};
/* harmony default export */ const a12n = (a12n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/ala_mhigo.ts


const ala_mhigo_triggerSet = {
    zoneId: zone_id/* default.AlaMhigo */.Z.AlaMhigo,
    damageWarn: {
        'Ala Mhigo Magitek Ray': '24CE',
        'Ala Mhigo Lock On': '2047',
        'Ala Mhigo Tail Laser 1': '2049',
        'Ala Mhigo Tail Laser 2': '204B',
        'Ala Mhigo Tail Laser 3': '204C',
        'Ala Mhigo Shoulder Cannon': '24D0',
        'Ala Mhigo Cannonfire': '23ED',
        'Ala Mhigo Aetherochemical Grenado': '205A',
        'Ala Mhigo Integrated Aetheromodulator': '205B',
        'Ala Mhigo Circle Of Death': '24D4',
        'Ala Mhigo Exhaust': '24D3',
        'Ala Mhigo Grand Sword': '24D2',
        'Ala Mhigo Art Of The Storm 1': '2066',
        'Ala Mhigo Art Of The Storm 2': '2587',
        'Ala Mhigo Vein Splitter 1': '24B6',
        'Ala Mhigo Vein Splitter 2': '206C',
        'Ala Mhigo Lightless Spark': '206B',
    },
    shareWarn: {
        'Ala Mhigo Demimagicks': '205E',
        'Ala Mhigo Unmoving Troika': '2060',
        'Ala Mhigo Art Of The Sword 1': '2069',
        'Ala Mhigo Art Of The Sword 2': '2589',
    },
    triggers: [
        {
            // It's possible players might just wander into the bad on the outside,
            // but normally people get pushed into it.
            id: 'Ala Mhigo Art Of The Swell',
            type: 'GainsEffect',
            // Damage Down
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '2B8' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const ala_mhigo = (ala_mhigo_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/bardams_mettle.ts


// For reasons not completely understood at the time this was merged,
// but likely related to the fact that no nameplates are visible during the encounter,
// and that nothing in the encounter actually does damage,
// we can't use damageWarn or gainsEffect helpers on the Bardam fight.
// Instead, we use this helper function to look for failure flags.
// If the flag is present,a full trigger object is returned that drops in seamlessly.
const abilityWarn = (args) => {
    if (!args.abilityId)
        console.error('Missing ability ' + JSON.stringify(args));
    const trigger = {
        id: args.id,
        type: 'Ability',
        netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: args.abilityId }),
        condition: (_data, matches) => matches.flags.substr(-2) === '0E',
        mistake: (_data, matches) => {
            return { type: 'warn', blame: matches.target, text: matches.ability };
        },
    };
    return trigger;
};
const bardams_mettle_triggerSet = {
    zoneId: zone_id/* default.BardamsMettle */.Z.BardamsMettle,
    damageWarn: {
        'Bardam Dirty Claw': '21A8',
        'Bardam Epigraph': '23AF',
        'Bardam The Dusk Star': '2187',
        'Bardam The Dawn Star': '2186',
        'Bardam Crumbling Crust': '1F13',
        'Bardam Ram Rush': '1EFC',
        'Bardam Lullaby': '24B2',
        'Bardam Heave': '1EF7',
        'Bardam Wide Blaster': '24B3',
        'Bardam Double Smash': '26A',
        'Bardam Transonic Blast': '1262',
        'Bardam Wild Horn': '2208',
        'Bardam Heavy Strike 1': '2578',
        'Bardam Heavy Strike 2': '2579',
        'Bardam Heavy Strike 3': '257A',
        'Bardam Tremblor 1': '257B',
        'Bardam Tremblor 2': '257C',
        'Bardam Throwing Spear': '257F',
        'Bardam Bardam\'s Ring': '2581',
        'Bardam Comet': '257D',
        'Bardam Comet Impact': '2580',
        'Bardam Iron Sphere Attack': '16B6',
        'Bardam Tornado': '247E',
        'Bardam Pinion': '1F11',
        'Bardam Feather Squall': '1F0E',
        'Bardam Flutterfall Untargeted': '1F12',
    },
    gainsEffectWarn: {
        'Bardam Confused': '0B',
    },
    gainsEffectFail: {
        'Bardam Fetters': '56F',
    },
    shareWarn: {
        'Bardam Garula Rush': '1EF9',
        'Bardam Flutterfall Targeted': '1F0C',
        'Bardam Wingbeat': '1F0F',
    },
    triggers: [
        // 1 of 3 270-degree ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Heavy Strike 1', abilityId: '2578' }),
        // 2 of 3 270-degree ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Heavy Strike 2', abilityId: '2579' }),
        // 3 of 3 270-degree ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Heavy Strike 3', abilityId: '257A' }),
        // 1 of 2 concentric ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Tremblor 1', abilityId: '257B' }),
        // 2 of 2 concentric ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Tremblor 2', abilityId: '257C' }),
        // Checkerboard AoE, Throwing Spear, second boss
        abilityWarn({ id: 'Bardam Throwing Spear', abilityId: '257F' }),
        // Gaze attack, Warrior of Bardam, second boss
        abilityWarn({ id: 'Bardam Empty Gaze', abilityId: '1F04' }),
        // Donut AoE headmarkers, Bardam, second boss
        abilityWarn({ id: 'Bardam\'s Ring', abilityId: '2581' }),
        // Targeted circle AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Comet', abilityId: '257D' }),
        // Circle AoEs, Star Shard, second boss
        abilityWarn({ id: 'Bardam Comet Impact', abilityId: '2580' }),
    ],
};
/* harmony default export */ const bardams_mettle = (bardams_mettle_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/kugane_castle.ts


const kugane_castle_triggerSet = {
    zoneId: zone_id/* default.KuganeCastle */.Z.KuganeCastle,
    damageWarn: {
        'Kugane Castle Tenka Gokken': '2329',
        'Kugane Castle Kenki Release Trash': '2330',
        'Kugane Castle Clearout': '1E92',
        'Kugane Castle Hara-Kiri 1': '1E96',
        'Kugane Castle Hara-Kiri 2': '24F9',
        'Kugane Castle Juji Shuriken 1': '232D',
        'Kugane Castle 1000 Barbs': '2198',
        'Kugane Castle Juji Shuriken 2': '1E98',
        'Kugane Castle Tatami-Gaeshi': '1E9D',
        'Kugane Castle Juji Shuriken 3': '1EA0',
        'Kugane Castle Auto Crossbow': '2333',
        'Kugane Castle Harakiri 3': '23C9',
        'Kugane Castle Iai-Giri': '1EA2',
        'Kugane Castle Fragility': '1EAA',
        'Kugane Castle Dragonfire': '1EAB',
    },
    shareWarn: {
        'Kugane Castle Issen': '1E97',
        'Kugane Castle Clockwork Raiton': '1E9B',
    },
    triggers: [
        {
            // Stack marker, Zuiko Maru, boss 1
            id: 'Kugane Castle Helm Crack',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '1E94' }),
            condition: (_data, matches) => matches.type === '21',
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (alone)`,
                        de: `${matches.ability} (allein)`,
                        fr: `${matches.ability} (seul(e))`,
                        ja: `${matches.ability} (一人)`,
                        cn: `${matches.ability} (单吃)`,
                        ko: `${matches.ability} (혼자 맞음)`,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const kugane_castle = (kugane_castle_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/st_mocianne_hard.ts

const st_mocianne_hard_triggerSet = {
    zoneId: zone_id/* default.SaintMociannesArboretumHard */.Z.SaintMociannesArboretumHard,
    damageWarn: {
        'St Mocianne Hard Mudstream': '30D9',
        'St Mocianne Hard Silken Spray': '3385',
        'St Mocianne Hard Muddy Puddles': '30DA',
        'St Mocianne Hard Odious Air': '2E49',
        'St Mocianne Hard SLudge Bomb': '2E4E',
        'St Mocianne Hard Odious Atmosphere': '2E51',
        'St Mocianne Hard Creeping Ivy': '31A5',
        'St Mocianne Hard Rockslide': '3134',
        'St Mocianne Hard Earthquake Inner': '312E',
        'St Mocianne Hard Earthquake Outer': '312F',
        'St Mocianne Hard Embalming Earth': '31A6',
        'St Mocianne Hard Quickmire': '3136',
        'St Mocianne Hard Quagmire Platforms': '3139',
        'St Mocianne Hard Feculent Flood': '313C',
        'St Mocianne Hard Corrupture': '33A0',
    },
    gainsEffectWarn: {
        'St Mocianne Hard Seduced': '3DF',
        'St Mocianne Hard Pollen': '13',
        'St Mocianne Hard Transfiguration': '648',
        'St Mocianne Hard Hysteria': '128',
        'St Mocianne Hard Stab Wound': '45D',
    },
    shareWarn: {
        'St Mocianne Hard Taproot': '2E4C',
        'St Mocianne Hard Earth Shaker': '3131',
    },
    soloFail: {
        'St Mocianne Hard Fault Warren': '2E4A',
    },
};
/* harmony default export */ const st_mocianne_hard = (st_mocianne_hard_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/swallows_compass.ts


const swallows_compass_triggerSet = {
    zoneId: zone_id/* default.TheSwallowsCompass */.Z.TheSwallowsCompass,
    damageWarn: {
        'Swallows Compass Ivy Fetters': '2C04',
        'Swallows Compass Wildswind 1': '2C05',
        'Swallows Compass Yama-Kagura': '2B96',
        'Swallows Compass Flames Of Hate': '2B98',
        'Swallows Compass Conflagrate': '2B99',
        'Swallows Compass Upwell': '2C06',
        'Swallows Compass Bad Breath': '2C07',
        'Swallows Compass Greater Palm 1': '2B9D',
        'Swallows Compass Greater Palm 2': '2B9E',
        'Swallows Compass Tributary': '2BA0',
        'Swallows Compass Wildswind 2': '2C06',
        'Swallows Compass Wildswind 3': '2C07',
        'Swallows Compass Filoplumes': '2C76',
        'Swallows Compass Both Ends 1': '2BA8',
        'Swallows Compass Both Ends 2': '2BA9',
        'Swallows Compass Both Ends 3': '2BAE',
        'Swallows Compass Both Ends 4': '2BAF',
        'Swallows Compass Equal Of Heaven': '2BB4',
    },
    gainsEffectWarn: {
        'Swallows Compass Hysteria': '128',
        'Swallows Compass Bleeding': '112F',
    },
    shareWarn: {
        'Swallows Compass Mirage': '2BA2',
        'Swallows Compass Mountain Falls': '2BA5',
        'Swallows Compass The Long End': '2BA7',
        'Swallows Compass The Long End 2': '2BAD',
    },
    triggers: [
        {
            // Standing in the lake, Diadarabotchi, boss 2
            id: 'Swallows Compass Six Fulms Under',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '237' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: matches.effect,
                };
            },
        },
        {
            // Stack marker, boss 3
            id: 'Swallows Compass Five Fingered Punishment',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['2BAB', '2BB0'], source: ['Qitian Dasheng', 'Shadow Of The Sage'] }),
            condition: (_data, matches) => matches.type === '21',
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (alone)`,
                        de: `${matches.ability} (allein)`,
                        fr: `${matches.ability} (seul(e))`,
                        ja: `${matches.ability} (一人)`,
                        cn: `${matches.ability} (单吃)`,
                        ko: `${matches.ability} (혼자 맞음)`,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const swallows_compass = (swallows_compass_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/temple_of_the_fist.ts

const temple_of_the_fist_triggerSet = {
    zoneId: zone_id/* default.TheTempleOfTheFist */.Z.TheTempleOfTheFist,
    damageWarn: {
        'Temple Fire Break': '21ED',
        'Temple Radial Blaster': '1FD3',
        'Temple Wide Blaster': '1FD4',
        'Temple Crippling Blow': '2016',
        'Temple Broken Earth': '236E',
        'Temple Shear': '1FDD',
        'Temple Counter Parry': '1FE0',
        'Temple Tapas': '',
        'Temple Hellseal': '200F',
        'Temple Pure Will': '2017',
        'Temple Megablaster': '163',
        'Temple Windburn': '1FE8',
        'Temple Hurricane Kick': '1FE5',
        'Temple Silent Roar': '1FEB',
        'Temple Mighty Blow': '1FEA',
    },
    shareWarn: {
        'Temple Heat Lightning': '1FD7',
    },
};
/* harmony default export */ const temple_of_the_fist = (temple_of_the_fist_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/the_burn.ts

const the_burn_triggerSet = {
    zoneId: zone_id/* default.TheBurn */.Z.TheBurn,
    damageWarn: {
        'The Burn Falling Rock': '31A3',
        'The Burn Aetherial Blast': '328B',
        'The Burn Mole-a-whack': '328D',
        'The Burn Head Butt': '328E',
        'The Burn Shardfall': '3191',
        'The Burn Dissonance': '3192',
        'The Burn Crystalline Fracture': '3197',
        'The Burn Resonant Frequency': '3198',
        'The Burn Rotoswipe': '3291',
        'The Burn Wrecking Ball': '3292',
        'The Burn Shatter': '3294',
        'The Burn Auto-Cannons': '3295',
        'The Burn Self-Detonate': '3296',
        'The Burn Full Throttle': '2D75',
        'The Burn Throttle': '2D76',
        'The Burn Adit Driver': '2D78',
        'The Burn Tremblor': '3297',
        'The Burn Desert Spice': '3298',
        'The Burn Toxic Spray': '329A',
        'The Burn Venom Spray': '329B',
        'The Burn White Death': '3143',
        'The Burn Fog Plume 1': '3145',
        'The Burn Fog Plume 2': '3146',
        'The Burn Cauterize': '3148',
    },
    damageFail: {
        'The Burn Cold Fog': '3142',
    },
    gainsEffectWarn: {
        'The Burn Leaden': '43',
        'The Burn Puddle Frostbite': '11D',
    },
    shareWarn: {
        'The Burn Hailfire': '3194',
        'The Burn Shardstrike': '3195',
        'The Burn Chilling Aspiration': '314D',
        'The Burn Frost Breath': '314C',
    },
};
/* harmony default export */ const the_burn = (the_burn_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o1n.ts

// O1N - Deltascape 1.0 Normal
const o1n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV10 */.Z.DeltascapeV10,
    damageWarn: {
        'O1N Burn': '23D5',
        'O1N Clamp': '23E2',
    },
    shareWarn: {
        'O1N Levinbolt': '23DA',
    },
};
/* harmony default export */ const o1n = (o1n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o2n.ts



// O2N - Deltascape 2.0 Normal
const o2n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV20 */.Z.DeltascapeV20,
    damageWarn: {
        'O2N Main Quake': '24A5',
        'O2N Erosion': '2590',
    },
    shareWarn: {
        'O2N Paranormal Wave': '250E',
    },
    triggers: [
        {
            // We could try to separate out the mistake that led to the player being petrified.
            // However, it's Normal mode, why overthink it?
            id: 'O2N Petrification',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '262' }),
            // The user might get hit by another petrifying ability before the effect ends.
            // There's no point in notifying for that.
            suppressSeconds: 10,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'O2N Earthquake',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '2515', ...oopsy_common/* playerDamageFields */.np }),
            // This deals damage only to non-floating targets.
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const o2n = (o2n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o3n.ts


// O3N - Deltascape 3.0 Normal
const o3n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV30 */.Z.DeltascapeV30,
    damageWarn: {
        'O3N Spellblade Fire III': '2460',
        'O3N Spellblade Blizzard III': '2461',
        'O3N Spellblade Thunder III': '2462',
        'O3N Cross Reaper': '246B',
        'O3N Gusting Gouge': '246C',
        'O3N Sword Dance': '2470',
        'O3N Uplift': '2473',
    },
    damageFail: {
        'O3N Ultimum': '2477',
    },
    shareWarn: {
        'O3N Holy Blur': '2463',
    },
    triggers: [
        {
            id: 'O3N Phase Tracker',
            type: 'StartsUsing',
            netRegex: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'Halicarnassus', capture: false }),
            netRegexDe: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'Halikarnassos', capture: false }),
            netRegexFr: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'Halicarnasse', capture: false }),
            netRegexJa: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'ハリカルナッソス', capture: false }),
            netRegexCn: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: '哈利卡纳苏斯', capture: false }),
            netRegexKo: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: '할리카르나소스', capture: false }),
            run: (data) => { var _a; return data.phaseNumber = ((_a = data.phaseNumber) !== null && _a !== void 0 ? _a : 0) + 1; },
        },
        {
            // There's a lot to track, and in order to make it all clean, it's safest just to
            // initialize it all up front instead of trying to guard against undefined comparisons.
            id: 'O3N Initializing',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '367', source: 'Halicarnassus', capture: false }),
            netRegexDe: netregexes/* default.ability */.Z.ability({ id: '367', source: 'Halikarnassos', capture: false }),
            netRegexFr: netregexes/* default.ability */.Z.ability({ id: '367', source: 'Halicarnasse', capture: false }),
            netRegexJa: netregexes/* default.ability */.Z.ability({ id: '367', source: 'ハリカルナッソス', capture: false }),
            netRegexCn: netregexes/* default.ability */.Z.ability({ id: '367', source: '哈利卡纳苏斯', capture: false }),
            netRegexKo: netregexes/* default.ability */.Z.ability({ id: '367', source: '할리카르나소스', capture: false }),
            condition: (data) => !data.initialized,
            run: (data) => {
                data.gameCount = 0;
                // Indexing phases at 1 so as to make phases match what humans expect.
                // 1: We start here.
                // 2: Cave phase with Uplifts.
                // 3: Post-intermission, with good and bad frogs.
                data.phaseNumber = 1;
                data.initialized = true;
            },
        },
        {
            id: 'O3N Ribbit',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2466' }),
            condition: (data, matches) => {
                var _a;
                // We DO want to be hit by Toad/Ribbit if the next cast of The Game
                // is 4x toad panels.
                const gameCount = (_a = data.gameCount) !== null && _a !== void 0 ? _a : 0;
                return !(data.phaseNumber === 3 && gameCount % 2 === 0) && matches.targetId !== 'E0000000';
            },
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            // There's a lot we could do to track exactly how the player failed The Game.
            // Why overthink Normal mode, however?
            id: 'O3N The Game',
            type: 'Ability',
            // Guess what you just lost?
            netRegex: netregexes/* default.ability */.Z.ability({ id: '246D' }),
            // If the player takes no damage, they did the mechanic correctly.
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
            run: (data) => { var _a; return data.gameCount = ((_a = data.gameCount) !== null && _a !== void 0 ? _a : 0) + 1; },
        },
    ],
};
/* harmony default export */ const o3n = (o3n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4n.ts



// O4N - Deltascape 4.0 Normal
const o4n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV40 */.Z.DeltascapeV40,
    damageWarn: {
        'O4N Blizzard III': '24BC',
        'O4N Empowered Thunder III': '24C1',
        'O4N Zombie Breath': '24CB',
        'O4N Clearout': '24CC',
        'O4N Black Spark': '24C9',
    },
    shareWarn: {
        // Empowered Fire III inflicts the Pyretic debuff, which deals damage if the player
        // moves or acts before the debuff falls. Unfortunately it doesn't look like there's
        // currently a log line for this, so the only way to check for this is to collect
        // the debuffs and then warn if a player takes an action during that time. Not worth it
        // for Normal.
        'O4N Standard Fire': '24BA',
        'O4N Buster Thunder': '24BE',
    },
    triggers: [
        {
            // Kills target if not cleansed
            id: 'O4N Doom',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38E' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Cleansers missed Doom!',
                        de: 'Doom-Reinigung vergessen!',
                        fr: 'N\'a pas été dissipé(e) du Glas !',
                        ja: '死の宣告',
                        cn: '没解死宣',
                    },
                };
            },
        },
        {
            // Short knockback from Exdeath
            id: 'O4N Vacuum Wave',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '24B8', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été poussé(e) !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
        {
            // Room-wide AoE, freezes non-moving targets
            id: 'O4N Empowered Blizzard',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '4E6' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const o4n = (o4n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4s.ts



// O4S - Deltascape 4.0 Savage
const o4s_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV40Savage */.Z.DeltascapeV40Savage,
    damageWarn: {
        'O4S2 Neo Vacuum Wave': '241D',
        'O4S2 Acceleration Bomb': '2431',
        'O4S2 Emptiness': '2422',
    },
    damageFail: {
        'O4S2 Double Laser': '2415',
    },
    triggers: [
        {
            id: 'O4S2 Decisive Battle',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2408', capture: false }),
            run: (data) => {
                data.isDecisiveBattleElement = true;
            },
        },
        {
            id: 'O4S1 Vacuum Wave',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '23FE', capture: false }),
            run: (data) => {
                data.isDecisiveBattleElement = false;
            },
        },
        {
            id: 'O4S2 Almagest',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2417', capture: false }),
            run: (data) => {
                data.isNeoExdeath = true;
            },
        },
        {
            id: 'O4S2 Blizzard III',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '23F8', ...oopsy_common/* playerDamageFields */.np }),
            // Ignore unavoidable raid aoe Blizzard III.
            condition: (data) => !data.isDecisiveBattleElement,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.abilityName };
            },
        },
        {
            id: 'O4S2 Thunder III',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '23FD', ...oopsy_common/* playerDamageFields */.np }),
            // Only consider this during random mechanic after decisive battle.
            condition: (data) => data.isDecisiveBattleElement,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.abilityName };
            },
        },
        {
            id: 'O4S2 Petrified',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '262' }),
            mistake: (data, matches) => {
                // On Neo, being petrified is because you looked at Shriek, so your fault.
                if (data.isNeoExdeath)
                    return { type: 'fail', blame: matches.target, text: matches.effect };
                // On normal ExDeath, this is due to White Hole.
                return { type: 'warn', name: matches.target, text: matches.effect };
            },
        },
        {
            id: 'O4S2 Forked Lightning',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '242E', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'O4S2 Beyond Death Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = true;
            },
        },
        {
            id: 'O4S2 Beyond Death Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = false;
            },
        },
        {
            id: 'O4S2 Beyond Death',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasBeyondDeath)
                    return;
                if (!data.hasBeyondDeath[matches.target])
                    return;
                return {
                    name: matches.target,
                    reason: matches.effect,
                };
            },
        },
        {
            id: 'O4S2 Double Attack Collect',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '241C', ...oopsy_common/* playerDamageFields */.np }),
            run: (data, matches) => {
                data.doubleAttackMatches = data.doubleAttackMatches || [];
                data.doubleAttackMatches.push(matches);
            },
        },
        {
            id: 'O4S2 Double Attack',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '241C', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (data) => {
                var _a, _b;
                const arr = data.doubleAttackMatches;
                if (!arr)
                    return;
                if (arr.length <= 2)
                    return;
                // Hard to know who should be in this and who shouldn't, but
                // it should never hit 3 people.
                return { type: 'fail', text: `${(_b = (_a = arr[0]) === null || _a === void 0 ? void 0 : _a.ability) !== null && _b !== void 0 ? _b : ''} x ${arr.length}` };
            },
            run: (data) => delete data.doubleAttackMatches,
        },
    ],
};
/* harmony default export */ const o4s = (o4s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o7s.ts


// TODO: missing many abilities here
// O7S - Sigmascape 3.0 Savage
const o7s_triggerSet = {
    zoneId: zone_id/* default.SigmascapeV30Savage */.Z.SigmascapeV30Savage,
    damageWarn: {
        'O7S Searing Wind': '2777',
    },
    damageFail: {
        'O7S Missile': '2782',
        'O7S Chain Cannon': '278F',
    },
    triggers: [
        {
            id: 'O7S Stoneskin',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2AB5' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.source, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const o7s = (o7s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o12s.ts



// TODO: could add Patch warnings for double/unbroken tethers
// TODO: Hello World could have any warnings (sorry)
const o12s_triggerSet = {
    zoneId: zone_id/* default.AlphascapeV40Savage */.Z.AlphascapeV40Savage,
    damageWarn: {
        'O12S1 Superliminal Motion 1': '3334',
        'O12S1 Efficient Bladework 1': '3329',
        'O12S1 Efficient Bladework 2': '332A',
        'O12S1 Beyond Strength': '3328',
        'O12S1 Superliminal Steel 1': '3330',
        'O12S1 Superliminal Steel 2': '3331',
        'O12S1 Optimized Blizzard III': '3332',
        'O12S2 Diffuse Wave Cannon': '3369',
        'O12S2 Right Arm Unit Hyper Pulse 1': '335A',
        'O12S2 Right Arm Unit Hyper Pulse 2': '335B',
        'O12S2 Right Arm Unit Colossal Blow': '335F',
        'O12S2 Left Arm Unit Colossal Blow': '3360',
    },
    damageFail: {
        'O12S1 Optical Laser': '3347',
        'O12S1 Advanced Optical Laser': '334A',
        'O12S2 Rear Power Unit Rear Lasers 1': '3361',
        'O12S2 Rear Power Unit Rear Lasers 2': '3362',
    },
    shareWarn: {
        'O12S1 Optimized Fire III': '3337',
        'O12S2 Hyper Pulse Tether': '335C',
        'O12S2 Wave Cannon': '336B',
        'O12S2 Optimized Fire III': '3379',
    },
    shareFail: {
        'O12S1 Optimized Sagittarius Arrow': '334D',
        'O12S2 Oversampled Wave Cannon': '3366',
        'O12S2 Savage Wave Cannon': '336D',
    },
    triggers: [
        {
            id: 'O12S1 Discharger Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '3327' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
        {
            id: 'O12S1 Magic Vulnerability Up Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '472' }),
            run: (data, matches) => {
                var _a;
                (_a = data.vuln) !== null && _a !== void 0 ? _a : (data.vuln = {});
                data.vuln[matches.target] = true;
            },
        },
        {
            id: 'O12S1 Magic Vulnerability Up Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '472' }),
            run: (data, matches) => {
                data.vuln = data.vuln || {};
                data.vuln[matches.target] = false;
            },
        },
        {
            id: 'O12S1 Magic Vulnerability Damage',
            type: 'Ability',
            // 332E = Pile Pitch stack
            // 333E = Electric Slide (Omega-M square 1-4 dashes)
            // 333F = Electric Slide (Omega-F triangle 1-4 dashes)
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['332E', '333E', '333F'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.vuln && data.vuln[matches.target],
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (with vuln)`,
                        de: `${matches.ability} (mit Verwundbarkeit)`,
                        ja: `${matches.ability} (被ダメージ上昇)`,
                        cn: `${matches.ability} (带易伤)`,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const o12s = (o12s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/byakko-ex.ts



// Byakko Extreme
const byakko_ex_triggerSet = {
    zoneId: zone_id/* default.TheJadeStoaExtreme */.Z.TheJadeStoaExtreme,
    damageWarn: {
        // Popping Unrelenting Anguish bubbles
        'ByaEx Aratama': '27F6',
        // Stepping in growing orb
        'ByaEx Vacuum Claw': '27E9',
        // Lightning Puddles
        'ByaEx Hunderfold Havoc 1': '27E5',
        'ByaEx Hunderfold Havoc 2': '27E6',
    },
    damageFail: {
        'ByaEx Sweep The Leg': '27DB',
        'ByaEx Fire and Lightning': '27DE',
        'ByaEx Distant Clap': '27DD',
        // Midphase line attack
        'ByaEx Imperial Guard': '27F1',
    },
    triggers: [
        {
            // Pink bubble collision
            id: 'ByaEx Ominous Wind',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '27EC', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'bubble collision',
                        de: 'Blasen sind zusammengestoßen',
                        fr: 'collision de bulles',
                        ja: '衝突',
                        cn: '相撞',
                        ko: '장판 겹쳐서 터짐',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const byakko_ex = (byakko_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/shinryu.ts



// Shinryu Normal
const shinryu_triggerSet = {
    zoneId: zone_id/* default.TheRoyalMenagerie */.Z.TheRoyalMenagerie,
    damageWarn: {
        'Shinryu Akh Rhai': '1FA6',
        'Shinryu Blazing Trail': '221A',
        'Shinryu Collapse': '2218',
        'Shinryu Dragonfist': '24F0',
        'Shinryu Earth Breath': '1F9D',
        'Shinryu Gyre Charge': '1FA8',
        'Shinryu Spikesicle': '1FA`',
        'Shinryu Tail Slap': '1F93',
    },
    shareWarn: {
        'Shinryu Levinbolt': '1F9C',
    },
    triggers: [
        {
            // Icy floor attack.
            id: 'Shinryu Diamond Dust',
            type: 'GainsEffect',
            // Thin Ice
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38F' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Slid off!',
                        de: 'Runter gerutscht!',
                        fr: 'A glissé(e) !',
                        ja: '滑った',
                        cn: '滑落',
                    },
                };
            },
        },
        {
            id: 'Shinryu Tidal Wave',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1F8B', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été poussé(e) !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
        {
            // Knockback from center.
            id: 'Shinryu Aerial Blast',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1F90', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été pousser !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const shinryu = (shinryu_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/susano-ex.ts

// Susano Extreme
const susano_ex_triggerSet = {
    zoneId: zone_id/* default.ThePoolOfTributeExtreme */.Z.ThePoolOfTributeExtreme,
    damageWarn: {
        'SusEx Churning': '203F',
    },
    damageFail: {
        'SusEx Rasen Kaikyo': '202E',
    },
};
/* harmony default export */ const susano_ex = (susano_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/ultima_weapon_ultimate.ts



// Ultima Weapon Ultimate
const ultima_weapon_ultimate_triggerSet = {
    zoneId: zone_id/* default.TheWeaponsRefrainUltimate */.Z.TheWeaponsRefrainUltimate,
    damageWarn: {
        'UWU Searing Wind': '2B5C',
        'UWU Eruption': '2B5A',
        'UWU Weight': '2B65',
        'UWU Landslide1': '2B70',
        'UWU Landslide2': '2B71',
    },
    damageFail: {
        'UWU Great Whirlwind': '2B41',
        'UWU Slipstream': '2B53',
        'UWU Wicked Wheel': '2B4E',
        'UWU Wicked Tornado': '2B4F',
    },
    triggers: [
        {
            id: 'UWU Windburn',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'EB' }),
            suppressSeconds: 2,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Featherlance explosion.  It seems like the person who pops it is the
            // first person listed damage-wise, so they are likely the culprit.
            id: 'UWU Featherlance',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '2B43', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 5,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.source };
            },
        },
    ],
};
/* harmony default export */ const ultima_weapon_ultimate = (ultima_weapon_ultimate_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/unending_coil_ultimate.ts



// UCU - The Unending Coil Of Bahamut (Ultimate)
const unending_coil_ultimate_triggerSet = {
    zoneId: zone_id/* default.TheUnendingCoilOfBahamutUltimate */.Z.TheUnendingCoilOfBahamutUltimate,
    damageFail: {
        'UCU Lunar Dynamo': '26BC',
        'UCU Iron Chariot': '26BB',
        'UCU Exaflare': '26EF',
        'UCU Wings Of Salvation': '26CA',
    },
    triggers: [
        {
            id: 'UCU Twister Death',
            type: 'Ability',
            // Instant death has a special flag value, differentiating
            // from the explosion damage you take when somebody else
            // pops one.
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '26AB', ...oopsy_common/* playerDamageFields */.np, flags: oopsy_common/* kFlagInstantDeath */.hm }),
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Twister Pop',
                        de: 'Wirbelsturm berührt',
                        fr: 'Apparition des tornades',
                        ja: 'ツイスター',
                        cn: '旋风',
                        ko: '회오리 밟음',
                    },
                };
            },
        },
        {
            id: 'UCU Thermionic Burst',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '26B9', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Pizza Slice',
                        de: 'Pizzastück',
                        fr: 'Parts de pizza',
                        ja: 'サーミオニックバースト',
                        cn: '天崩地裂',
                        ko: '장판에 맞음',
                    },
                };
            },
        },
        {
            id: 'UCU Chain Lightning',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '26C8', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                // It's hard to assign blame for lightning.  The debuffs
                // go out and then explode in order, but the attacker is
                // the dragon and not the player.
                return {
                    type: 'warn',
                    name: matches.target,
                    text: {
                        en: 'hit by lightning',
                        de: 'vom Blitz getroffen',
                        fr: 'frappé(e) par la foudre',
                        ja: 'チェインライトニング',
                        cn: '雷光链',
                        ko: '번개 맞음',
                    },
                };
            },
        },
        {
            id: 'UCU Burns',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'FA' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'UCU Sludge',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '11F' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'UCU Doom Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'D2' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = true;
            },
        },
        {
            id: 'UCU Doom Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: 'D2' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = false;
            },
        },
        {
            // There is no callout for "you forgot to clear doom".  The logs look
            // something like this:
            //   [20:02:30.564] 1A:Okonomi Yaki gains the effect of Doom from  for 6.00 Seconds.
            //   [20:02:36.443] 1E:Okonomi Yaki loses the effect of Protect from Tako Yaki.
            //   [20:02:36.443] 1E:Okonomi Yaki loses the effect of Doom from .
            //   [20:02:38.525] 19:Okonomi Yaki was defeated by Firehorn.
            // In other words, doom effect is removed +/- network latency, but can't
            // tell until later that it was a death.  Arguably, this could have been a
            // close-but-successful clearing of doom as well.  It looks the same.
            // Strategy: if you haven't cleared doom with 1 second to go then you probably
            // died to doom.  You can get non-fatally iceballed or auto'd in between,
            // but what can you do.
            id: 'UCU Doom Death',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'D2' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 1,
            deathReason: (data, matches) => {
                if (!data.hasDoom || !data.hasDoom[matches.target])
                    return;
                let reason;
                const duration = parseFloat(matches.duration);
                if (duration < 9)
                    reason = matches.effect + ' #1';
                else if (duration < 14)
                    reason = matches.effect + ' #2';
                else
                    reason = matches.effect + ' #3';
                return { name: matches.target, reason: reason };
            },
        },
    ],
};
/* harmony default export */ const unending_coil_ultimate = (unending_coil_ultimate_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_copied_factory.ts

// The Copied Factory
const the_copied_factory_triggerSet = {
    zoneId: zone_id/* default.TheCopiedFactory */.Z.TheCopiedFactory,
    damageWarn: {
        'Copied Serial Energy Bomb': '48B4',
        // Make sure enemies are ignored on these
        'Copied Serial Energy Bombardment': '48B8',
        'Copied Serial Energy Assault': '48B6',
        'Copied Serial High-Powered Laser': '48C5',
        'Copied Serial Sidestriking Spin Spin 1': '48CB',
        'Copied Serial Sidestriking Spin 2': '48CC',
        'Copied Serial Centrifugal Spin': '48C9',
        'Copied Serial Air-To-Surface Energy': '48BA',
        'Copied Serial High-Caliber Laser': '48FA',
        'Copied Serial Energy Ring 1': '48BC',
        'Copied Serial Energy Ring 2': '48BD',
        'Copied Serial Energy Ring 3': '48BE',
        'Copied Serial Energy Ring 4': '48C0',
        'Copied Serial Energy Ring 5': '48C1',
        'Copied Serial Energy Ring 6': '48C2',
        'Copied Trash Energy Bomb': '491D',
        'Copied Trash Frontal Somersault': '491B',
        'Copied Trash High-Frequency Laser': '491E',
        'Copied Hobbes Shocking Discharge': '480B',
        'Copied Hobbes Variable Combat Test 1': '49C5',
        'Copied Hobbes Variable Combat Test 2': '49C6',
        'Copied Hobbes Variable Combat Test 3': '49C7',
        'Copied Hobbes Variable Combat Test 4': '480F',
        'Copied Hobbes Variable Combat Test 5': '4810',
        'Copied Hobbes Variable Combat Test 6': '4811',
        'Copied Hobbes Ring Laser 1': '4802',
        'Copied Hobbes Ring Laser 2': '4803',
        'Copied Hobbes Ring Laser 3': '4804',
        'Copied Hobbes Towerfall': '4813',
        'Copied Hobbes Fire-Reistance Test 1': '4816',
        'Copied Hobbes Fire-Reistance Test 2': '4817',
        'Copied Hobbes Fire-Reistance Test 3': '4818',
        'Copied Hobbes Oil Well': '481B',
        'Copied Hobbes Electromagnetic Pulse': '4819',
        // TODO: what's the electrified floor with conveyor belts?
        'Copied Goliath Energy Ring 1': '4937',
        'Copied Goliath Energy Ring 2': '4938',
        'Copied Goliath Energy Ring 3': '4939',
        'Copied Goliath Energy Ring 4': '493A',
        'Copied Goliath Energy Ring 5': '4937',
        'Copied Goliath Laser Turret': '48E6',
        'Copied Flight Unit Area Bombing': '4943',
        'Copied Flight Unit Lightfast Blade': '4940',
        'Copied Engels Marx Smash 1': '4729',
        'Copied Engels Marx Smash 2': '4728',
        'Copied Engels Marx Smash 3': '472F',
        'Copied Engels Marx Smash 4': '4731',
        'Copied Engels Marx Smash 5': '472B',
        'Copied Engels Marx Smash 6': '472D',
        'Copied Engels Marx Smash 7': '4732',
        'Copied Engels Incendiary Bombing': '4739',
        'Copied Engels Guided Missile': '4736',
        'Copied Engels Surface Missile': '4734',
        'Copied Engels Laser Sight': '473B',
        'Copied Engels Frack': '474D',
        'Copied Engels Marx Crush': '48FC',
        'Copied Engels Crushing Wheel': '474B',
        'Copied Engels Marx Thrust': '48FC',
        'Copied 9S Laser Suppression': '48E0',
        'Copied 9S Ballistic Impact 1': '4974',
        'Copied 9S Ballistic Impact 2': '48DC',
        'Copied 9S Ballistic Impact 3': '48E4',
        'Copied 9S Ballistic Impact 4': '48E0',
        'Copied 9S Marx Impact': '48D4',
        'Copied 9S Tank Destruction 1': '48E8',
        'Copied 9S Tank Destruction 2': '48E9',
        'Copied 9S Serial Spin 1': '48A5',
        'Copied 9S Serial Spin 2': '48A7',
    },
    shareWarn: {
        'Copied Hobbes Short-Range Missile': '4815',
    },
};
/* harmony default export */ const the_copied_factory = (the_copied_factory_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_puppets_bunker.ts

// TODO: 5093 taking High-Powered Laser with a vuln (because of taking two)
// TODO: 4FB5 taking High-Powered Laser with a vuln (because of taking two)
// TODO: 50D3 Aerial Support: Bombardment going off from add
// TODO: 5211 Maneuver: Volt Array not getting interrupted
// TODO: 4FF4/4FF5 One of these is failing chemical conflagration
// TODO: standing in wrong teleporter?? maybe 5363?
const the_puppets_bunker_triggerSet = {
    zoneId: zone_id/* default.ThePuppetsBunker */.Z.ThePuppetsBunker,
    damageWarn: {
        'Puppet Aegis Beam Cannons 1': '5074',
        'Puppet Aegis Beam Cannons 2': '5075',
        'Puppet Aegis Beam Cannons 3': '5076',
        'Puppet Aegis Collider Cannons': '507E',
        'Puppet Aegis Surface Laser 1': '5091',
        'Puppet Aegis Surface Laser 2': '5092',
        'Puppet Aegis Flight Path': '508C',
        'Puppet Aegis Refraction Cannons 1': '5081',
        'Puppet Aegis Life\'s Last Song': '53B3',
        'Puppet Light Long-Barreled Laser': '5212',
        'Puppet Light Surface Missile Impact': '520F',
        'Puppet Superior Incendiary Bombing': '4FB9',
        'Puppet Superior Sharp Turn': '506D',
        'Puppet Superior Standard Surface Missile 1': '4FB1',
        'Puppet Superior Standard Surface Missile 2': '4FB2',
        'Puppet Superior Standard Surface Missile 3': '4FB3',
        'Puppet Superior Sliding Swipe 1': '506F',
        'Puppet Superior Sliding Swipe 2': '5070',
        'Puppet Superior Guided Missile': '4FB8',
        'Puppet Superior High-Order Explosive Blast 1': '4FC0',
        'Puppet Superior High-Order Explosive Blast 2': '4FC1',
        'Puppet Heavy Energy Bombardment': '4FFC',
        'Puppet Heavy Revolving Laser': '5000',
        'Puppet Heavy Energy Bomb': '4FFA',
        'Puppet Heavy R010 Laser': '4FF0',
        'Puppet Heavy R030 Hammer': '4FF1',
        'Puppet Hallway High-Powered Laser': '50B1',
        'Puppet Hallway Energy Bomb': '50B2',
        'Puppet Compound Mechanical Dissection': '51B3',
        'Puppet Compound Mechanical Decapitation': '51B4',
        'Puppet Compound Mechnical Contusion Untargeted': '51B7',
        'Puppet Compound 2P Relentless Spiral 1': '51AA',
        'Puppet Compound 2P Relentless Spiral 2': '51CB',
        'Puppet Compound 2P Prime Blade Out 1': '541F',
        'Puppet Compound 2P Prime Blade Out 2': '5198',
        'Puppet Compound 2P Prime Blade Behind 1': '5420',
        'Puppet Compound 2P Prime Blade Behind 2': '5199',
        'Puppet Compound 2P Prime Blade In 1': '5421',
        'Puppet Compound 2P Prime Blade In 2': '519A',
        'Puppet Compound 2P R012 Laser Ground': '51AE',
    },
    damageFail: {
        'Puppet Heavy Upper Laser 1': '5087',
        'Puppet Heavy Upper Laser 2': '4FF7',
        'Puppet Heavy Lower Laser 1': '5086',
        'Puppet Heavy Lower Laser 2': '4FF6',
        'Puppet Heavy Lower Laser 3': '5088',
        'Puppet Heavy Lower Laser 4': '4FF8',
        'Puppet Heavy Lower Laser 5': '5089',
        'Puppet Heavy Lower Laser 6': '4FF9',
        'Puppet Compound Incongruous Spin': '51B2',
    },
    gainsEffectWarn: {
        'Puppet Burns': '10B',
    },
    shareWarn: {
        // This is pretty large and getting hit by initial without burns seems fine.
        // 'Puppet Light Homing Missile Impact': '5210', // targeted fire aoe from No Restrictions
        'Puppet Heavy Unconventional Voltage': '5004',
        // Pretty noisy.
        'Puppet Maneuver High-Powered Laser': '5002',
        'Puppet Compound Mechnical Contusion Targeted': '51B6',
        'Puppet Compound 2P R012 Laser Tank': '51AE',
    },
    shareFail: {
        'Puppet Aegis Anti-Personnel Laser': '5090',
        'Puppet Superior Precision-Guided Missile': '4FC5',
        'Puppet Compound 2P R012 Laser Tank': '51AD',
    },
};
/* harmony default export */ const the_puppets_bunker = (the_puppets_bunker_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_tower_at_paradigms_breach.ts


// TODO: missing Shock Black 2?
// TODO: White/Black Dissonance damage is maybe when flags end in 03?
const the_tower_at_paradigms_breach_triggerSet = {
    zoneId: zone_id/* default.TheTowerAtParadigmsBreach */.Z.TheTowerAtParadigmsBreach,
    damageWarn: {
        'Tower Knave Colossal Impact Center 1': '5EA7',
        'Tower Knave Colossal Impact Center 2': '60C8',
        'Tower Knave Colossal Impact Side 1': '5EA5',
        'Tower Knave Colossal Impact Side 2': '5EA6',
        'Tower Knave Colossal Impact Side 3': '60C6',
        'Tower Knave Colossal Impact Side 4': '60C7',
        'Tower Knave Burst': '5ED4',
        'Tower Knave Magic Barrage': '5EAC',
        'Tower Hansel Repay': '5C70',
        'Tower Hansel Explosion': '5C67',
        'Tower Hansel Impact': '5C5C',
        'Tower Hansel Bloody Sweep 1': '5C6C',
        'Tower Hansel Bloody Sweep 2': '5C6D',
        'Tower Hansel Bloody Sweep 3': '5C6E',
        'Tower Hansel Bloody Sweep 4': '5C6F',
        'Tower Hansel Passing Lance': '5C66',
        'Tower Hansel Breaththrough 1': '55B3',
        'Tower Hansel Breaththrough 2': '5C5D',
        'Tower Hansel Breaththrough 3': '5C5E',
        'Tower Hansel Hungry Lance 1': '5C71',
        'Tower Hansel Hungry Lance 2': '5C72',
        'Tower Flight Unit Lightfast Blade': '5BFE',
        'Tower Flight Unit Standard Laser': '5BFF',
        'Tower 2P Whirling Assault': '5BFB',
        'Tower 2P Balanced Edge': '5BFA',
        'Tower Red Girl Generate Barrier 1': '6006',
        'Tower Red Girl Generate Barrier 2': '6007',
        'Tower Red Girl Generate Barrier 3': '6008',
        'Tower Red Girl Generate Barrier 4': '6009',
        'Tower Red Girl Generate Barrier 5': '6310',
        'Tower Red Girl Generate Barrier 6': '6311',
        'Tower Red Girl Generate Barrier 7': '6312',
        'Tower Red Girl Generate Barrier 8': '6313',
        'Tower Red Girl Shock White 1': '600F',
        'Tower Red Girl Shock White 2': '6010',
        'Tower Red Girl Shock Black 1': '6011',
        'Tower Red Girl Point White 1': '601F',
        'Tower Red Girl Point White 2': '6021',
        'Tower Red Girl Point Black 1': '6020',
        'Tower Red Girl Point Black 2': '6022',
        'Tower Red Girl Wipe White': '600C',
        'Tower Red Girl Wipe Black': '600D',
        'Tower Red Girl Diffuse Energy': '6056',
        'Tower Red Girl Pylon Big Explosion': '6027',
        'Tower Red Girl Pylon Explosion': '6026',
        'Tower Philosopher Deploy Armaments Middle': '5C02',
        'Tower Philosopher Deploy Armaments Sides': '5C05',
        'Tower Philosopher Deploy Armaments 3': '6078',
        'Tower Philosopher Deploy Armaments 4': '6079',
        'Tower Philosopher Energy Bomb': '5C05',
        'Tower False Idol Made Magic Right': '5BD7',
        'Tower False Idol Made Magic Left': '5BD6',
        'Tower False Idol Lighter Note': '5BDA',
        'Tower False Idol Magical Interference': '5BD5',
        'Tower False Idol Scattered Magic': '5BDF',
        'Tower Her Inflorescence Uneven Fotting': '5BE2',
        'Tower Her Inflorescence Crash': '5BE5',
        'Tower Her Inflorescence Heavy Arms 1': '5BED',
        'Tower Her Inflorescence Heavy Arms 2': '5BEF',
        'Tower Her Inflorescence Energy Scattered Magic': '5BE8',
    },
    damageFail: {
        'Tower Her Inflorescence Place Of Power': '5C0D',
    },
    shareWarn: {
        'Tower Knave Magic Artillery Alpha': '5EAB',
        'Tower Hansel Seed Of Magic Alpha': '5C61',
    },
    shareFail: {
        'Tower Knave Magic Artillery Beta': '5EB3',
        'Tower Red Girl Manipulate Energy': '601A',
        'Tower False Idol Darker Note': '5BDC',
    },
    triggers: [
        {
            id: 'Tower Knocked Off',
            type: 'Ability',
            // 5EB1 = Knave Lunge
            // 5BF2 = Her Infloresence Shockwave
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5EB1', '5BF2'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const the_tower_at_paradigms_breach = (the_tower_at_paradigms_breach_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/akadaemia_anyder.ts

const akadaemia_anyder_triggerSet = {
    zoneId: zone_id/* default.AkadaemiaAnyder */.Z.AkadaemiaAnyder,
    damageWarn: {
        'Anyder Acrid Stream': '4304',
        'Anyder Waterspout': '4306',
        'Anyder Raging Waters': '4302',
        'Anyder Violent Breach': '4305',
        'Anyder Tidal Guillotine 1': '3E08',
        'Anyder Tidal Guillotine 2': '3E0A',
        'Anyder Pelagic Cleaver 1': '3E09',
        'Anyder Pelagic Cleaver 2': '3E0B',
        'Anyder Aquatic Lance': '3E05',
        'Anyder Syrup Spout': '4308',
        'Anyder Needle Storm': '4309',
        'Anyder Extensible Tendrils 1': '3E10',
        'Anyder Extensible Tendrils 2': '3E11',
        'Anyder Putrid Breath': '3E12',
        'Anyder Detonator': '430F',
        'Anyder Dominion Slash': '430D',
        'Anyder Quasar': '430B',
        'Anyder Dark Arrivisme': '430E',
        'Anyder Thunderstorm': '3E1C',
        'Anyder Winding Current': '3E1F',
    },
};
/* harmony default export */ const akadaemia_anyder = (akadaemia_anyder_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/amaurot.ts

const amaurot_triggerSet = {
    zoneId: zone_id/* default.Amaurot */.Z.Amaurot,
    damageWarn: {
        'Amaurot Burning Sky': '354A',
        'Amaurot Whack': '353C',
        'Amaurot Aetherspike': '353B',
        'Amaurot Venemous Breath': '3CCE',
        'Amaurot Cosmic Shrapnel': '4D26',
        'Amaurot Earthquake': '3CCD',
        'Amaurot Meteor Rain': '3CC6',
        'Amaurot Final Sky': '3CCB',
        'Amaurot Malevolence': '3541',
        'Amaurot Turnabout': '3542',
        'Amaurot Sickly Inferno': '3DE3',
        'Amaurot Disquieting Gleam': '3546',
        'Amaurot Black Death': '3543',
        'Amaurot Force of Loathing': '3544',
        'Amaurot Damning Ray 1': '3E00',
        'Amaurot Damning Ray 2': '3E01',
        'Amaurot Deadly Tentacles': '3547',
        'Amaurot Misfortune': '3CE2',
    },
    damageFail: {
        'Amaurot Apokalypsis': '3CD7',
    },
};
/* harmony default export */ const amaurot = (amaurot_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/anamnesis_anyder.ts

const anamnesis_anyder_triggerSet = {
    zoneId: zone_id/* default.AnamnesisAnyder */.Z.AnamnesisAnyder,
    damageWarn: {
        'Anamnesis Trench Phuabo Spine Lash': '4D1A',
        'Anamnesis Trench Anemone Falling Rock': '4E37',
        'Anamnesis Trench Dagonite Sewer Water': '4D1C',
        'Anamnesis Trench Yovra Rock Hard': '4D21',
        'Anamnesis Trench Yovra Torrential Torment': '4D21',
        'Anamnesis Unknown Luminous Ray': '4E27',
        'Anamnesis Unknown Sinster Bubble Explosion': '4B6E',
        'Anamnesis Unknown Reflection': '4B6F',
        'Anamnesis Unknown Clearout 1': '4B74',
        'Anamnesis Unknown Clearout 2': '4B6B',
        'Anamnesis Unknown Setback 1': '4B75',
        'Anamnesis Unknown Setback 2': '5B6C',
        'Anamnesis Anyder Clionid Acrid Stream': '4D24',
        'Anamnesis Anyder Diviner Dreadstorm': '4D28',
        'Anamnesis Kyklops 2000-Mina Swing': '4B55',
        'Anamnesis Kyklops Terrible Hammer': '4B5D',
        'Anamnesis Kyklops Terrible Blade': '4B5E',
        'Anamnesis Kyklops Raging Glower': '4B56',
        'Anamnesis Kyklops Eye Of The Cyclone': '4B57',
        'Anamnesis Anyder Harpooner Hydroball': '4D26',
        'Anamnesis Rukshs Swift Shift': '4B83',
        'Anamnesis Rukshs Depth Grip Wavebreaker': '33D4',
        'Anamnesis Rukshs Rising Tide': '4B8B',
        'Anamnesis Rukshs Command Current': '4B82',
    },
    shareWarn: {
        'Anamnesis Trench Xzomit Mantle Drill': '4D19',
        'Anamnesis Io Ousia Barreling Smash': '4E24',
        'Anamnesis Kyklops Wanderer\'s Pyre': '4B5F',
    },
};
/* harmony default export */ const anamnesis_anyder = (anamnesis_anyder_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/dohn_mheg.ts


// TODO: Missing Growing tethers on boss 2.
// (Maybe gather party member names on the previous TIIIIMBEEEEEER cast for comparison?)
// TODO: Failing to interrupt Dohnfaust Fuath on Watering Wheel casts?
// (15:........:Dohnfast Fuath:3DAA:Watering Wheel:........:(\y{Name}):)
const dohn_mheg_triggerSet = {
    zoneId: zone_id/* default.DohnMheg */.Z.DohnMheg,
    damageWarn: {
        'Dohn Mheg Geyser': '2260',
        'Dohn Mheg Hydrofall': '22BD',
        'Dohn Mheg Laughing Leap': '2294',
        'Dohn Mheg Swinge': '22CA',
        'Dohn Mheg Canopy': '3DB0',
        'Dohn Mheg Pinecone Bomb': '3DB1',
        'Dohn Mheg Bile Bombardment': '34EE',
        'Dohn Mheg Corrosive Bile': '34EC',
        'Dohn Mheg Flailing Tentacles': '3681',
    },
    triggers: [
        {
            id: 'Dohn Mheg Imp Choir',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '46E' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'Dohn Mheg Toad Choir',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1B7' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'Dohn Mheg Fool\'s Tumble',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '183' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const dohn_mheg = (dohn_mheg_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/heroes_gauntlet.ts



// TODO: Berserker 2nd/3rd wild anguish should be shared with just a rock
const heroes_gauntlet_triggerSet = {
    zoneId: zone_id/* default.TheHeroesGauntlet */.Z.TheHeroesGauntlet,
    damageWarn: {
        'THG Blade\'s Benison': '5228',
        'THG Absolute Holy': '524B',
        'THG Hissatsu: Goka': '523D',
        'THG Whole Self': '522D',
        'THG Randgrith': '5232',
        'THG Vacuum Blade 1': '5061',
        'THG Vacuum Blade 2': '5062',
        'THG Coward\'s Cunning': '4FD7',
        'THG Papercutter 1': '4FD1',
        'THG Papercutter 2': '4FD2',
        'THG Ring of Death': '5236',
        'THG Lunar Eclipse': '5227',
        'THG Absolute Gravity': '5248',
        'THG Rain of Light': '5242',
        'THG Dooming Force': '5239',
        'THG Absolute Dark II': '4F61',
        'THG Burst': '53B7',
        'THG Pain Mire': '4FA4',
        'THG Dark Deluge': '4F5D',
        'THG Tekka Gojin': '523E',
        'THG Raging Slice 1': '520A',
        'THG Raging Slice 2': '520B',
        'THG Wild Rage': '5203',
    },
    gainsEffectWarn: {
        'THG Bleeding': '828',
    },
    gainsEffectFail: {
        'THG Truly Berserk': '906',
    },
    shareWarn: {
        'THG Absolute Thunder IV': '5245',
        'THG Moondiver': '5233',
        'THG Spectral Gust': '53CF',
    },
    shareFail: {
        'THG Falling Rock': '5205',
    },
    soloWarn: {
        // This should always be shared.  On all times but the 2nd and 3rd, it's a party share.
        // TODO: on the 2nd and 3rd time this should only be shared with a rock.
        // TODO: alternatively warn on taking one of these with a 472 Magic Vulnerability Up effect
        'THG Wild Anguish': '5209',
    },
    triggers: [
        {
            id: 'THG Wild Rampage',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '5207', ...oopsy_common/* playerDamageFields */.np }),
            // This is zero damage if you are in the crater.
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const heroes_gauntlet = (heroes_gauntlet_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/holminster_switch.ts

const holminster_switch_triggerSet = {
    zoneId: zone_id/* default.HolminsterSwitch */.Z.HolminsterSwitch,
    damageWarn: {
        'Holminster Thumbscrew': '3DC6',
        'Holminster Wooden horse': '3DC7',
        'Holminster Light Shot': '3DC8',
        'Holminster Heretic\'s Fork': '3DCE',
        'Holminster Holy Water': '3DD4',
        'Holminster Fierce Beating 1': '3DDD',
        'Holminster Fierce Beating 2': '3DDE',
        'Holminster Fierce Beating 3': '3DDF',
        'Holminster Cat O\' Nine Tails': '3DE1',
        'Holminster Right Knout': '3DE6',
        'Holminster Left Knout': '3DE7',
    },
    damageFail: {
        'Holminster Aethersup': '3DE9',
    },
    shareWarn: {
        'Holminster Flagellation': '3DD6',
    },
    shareFail: {
        'Holminster Taphephobia': '4181',
    },
};
/* harmony default export */ const holminster_switch = (holminster_switch_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/malikahs_well.ts

const malikahs_well_triggerSet = {
    zoneId: zone_id/* default.MalikahsWell */.Z.MalikahsWell,
    damageWarn: {
        'Malikah Falling Rock': '3CEA',
        'Malikah Wellbore': '3CED',
        'Malikah Geyser Eruption': '3CEE',
        'Malikah Swift Spill': '3CF0',
        'Malikah Breaking Wheel 1': '3CF5',
        'Malikah Crystal Nail': '3CF7',
        'Malikah Heretic\'s Fork 1': '3CF9',
        'Malikah Breaking Wheel 2': '3CFA',
        'Malikah Heretic\'s Fork 2': '3E0E',
        'Malikah Earthshake': '3E39',
    },
};
/* harmony default export */ const malikahs_well = (malikahs_well_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/matoyas_relict.ts

// TODO: could include 5484 Mudman Rocky Roll as a shareWarn, but it's low damage and common.
const matoyas_relict_triggerSet = {
    zoneId: zone_id/* default.MatoyasRelict */.Z.MatoyasRelict,
    damageWarn: {
        'Matoya Relict Werewood Ovation': '5518',
        'Matoya Cave Tarantula Hawk Apitoxin': '5519',
        'Matoya Spriggan Stonebearer Romp': '551A',
        'Matoya Sonny Of Ziggy Jittering Glare': '551C',
        'Matoya Mudman Quagmire': '5481',
        'Matoya Mudman Brittle Breccia 1': '548E',
        'Matoya Mudman Brittle Breccia 2': '548F',
        'Matoya Mudman Brittle Breccia 3': '5490',
        'Matoya Mudman Mud Bubble': '5487',
        'Matoya Cave Pugil Screwdriver': '551E',
        'Matoya Nixie Gurgle': '5992',
        'Matoya Relict Molten Phoebad Pyroclastic Shot': '57EB',
        'Matoya Relict Flan Flood': '5523',
        'Matoya Pyroduct Eldthurs Mash': '5527',
        'Matyoa Pyroduct Eldthurs Spin': '5528',
        'Matoya Relict Bavarois Thunder III': '5525',
        'Matoya Relict Marshmallow Ancient Aero': '5524',
        'Matoya Relict Pudding Fire II': '5522',
        'Matoya Relict Molten Phoebad Hot Lava': '57E9',
        'Matoya Relict Molten Phoebad Volcanic Drop': '57E8',
        'Matoya Mother Porxie Medium Rear': '591D',
        'Matoya Mother Porxie Barbeque Line': '5917',
        'Matoya Mother Porxie Barbeque Circle': '5918',
        'Matoya Mother Porxie To A Crisp': '5925',
        'Matoya Mother Proxie Buffet': '5926',
    },
    damageFail: {
        'Matoya Nixie Sea Shanty': '598C',
    },
    shareWarn: {
        'Matoya Nixie Crack': '5990',
        'Matoya Nixie Sputter': '5993',
    },
};
/* harmony default export */ const matoyas_relict = (matoyas_relict_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/mt_gulg.ts

const mt_gulg_triggerSet = {
    zoneId: zone_id/* default.MtGulg */.Z.MtGulg,
    damageWarn: {
        'Gulg Immolation': '41AA',
        'Gulg Tail Smash': '41AB',
        'Gulg Heavenslash': '41A9',
        'Gulg Typhoon Wing 1': '3D00',
        'Gulg Typhoon Wing 2': '3D01',
        'Gulg Hurricane Wing': '3D03',
        'Gulg Earth Shaker': '37F5',
        'Gulg Sanctification': '41AE',
        'Gulg Exegesis': '3D07',
        'Gulg Perfect Contrition': '3D0E',
        'Gulg Sanctified Aero': '41AD',
        'Gulg Divine Diminuendo 1': '3D16',
        'Gulg Divine Diminuendo 2': '3D18',
        'Gulg Divine Diminuendo 3': '4669',
        'Gulg Divine Diminuendo 4': '3D19',
        'Gulg Divine Diminuendo 5': '3D21',
        'Gulg Conviction Marcato 1': '3D1A',
        'Gulg Conviction Marcato 2': '3D1B',
        'Gulg Conviction Marcato 3': '3D20',
        'Gulg Vena Amoris': '3D27',
    },
    damageFail: {
        'Gulg Lumen Infinitum': '41B2',
        'Gulg Right Palm': '37F8',
        'Gulg Left Palm': '37FA',
    },
};
/* harmony default export */ const mt_gulg = (mt_gulg_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/paglthan.ts

// TODO: What to do about Kahn Rai 5B50?
// It seems impossible for the marked person to avoid entirely.
const paglthan_triggerSet = {
    zoneId: zone_id/* default.Paglthan */.Z.Paglthan,
    damageWarn: {
        'Paglthan Telovouivre Plague Swipe': '60FC',
        'Paglthan Lesser Telodragon Engulfing Flames': '60F5',
        'Paglthan Amhuluk Lightning Bolt': '5C4C',
        'Paglthan Amhuluk Ball Of Levin Shock': '5C52',
        'Paglthan Amhuluk Supercharged Ball Of Levin Shock': '5C53',
        'Paglthan Amhuluk Wide Blaster': '60C5',
        'Paglthan Telobrobinyak Fall Of Man': '6148',
        'Paglthan Telotek Reaper Magitek Cannon': '6121',
        'Paglthan Telodragon Sheet of Ice': '60F8',
        'Paglthan Telodragon Frost Breath': '60F7',
        'Paglthan Magitek Core Stable Cannon': '5C94',
        'Paglthan Magitek Core 2-Tonze Magitek Missile': '5C95',
        'Paglthan Telotek Sky Armor Aethershot': '5C9C',
        'Paglthan Mark II Telotek Colossus Exhaust': '5C99',
        'Paglthan Magitek Missile Explosive Force': '5C98',
        'Paglthan Tiamat Flamisphere': '610F',
        'Paglthan Armored Telodragon Tortoise Stomp': '614B',
        'Paglthan Telodragon Thunderous Breath': '6149',
        'Paglthan Lunar Bahamut Lunar Nail Upburst': '605B',
        'Paglthan Lunar Bahamut Lunar Nail Big Burst': '5B48',
        'Paglthan Lunar Bahamut Perigean Breath': '5B59',
        'Paglthan Lunar Bahamut Megaflare': '5B4E',
        'Paglthan Lunar Bahamut Megaflare Dive': '5B52',
        'Paglthan Lunar Bahamut Lunar Flare': '5B4A',
    },
    shareWarn: {
        'Paglthan Lunar Bahamut Megaflare': '5B4D',
    },
};
/* harmony default export */ const paglthan = (paglthan_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/qitana_ravel.ts

const qitana_ravel_triggerSet = {
    zoneId: zone_id/* default.TheQitanaRavel */.Z.TheQitanaRavel,
    damageWarn: {
        'Qitana Sun Toss': '3C8A',
        'Qitana Ronkan Light 1': '3C8C',
        'Qitana Lozatl\'s Fury 1': '3C8F',
        'Qitana Lozatl\'s Fury 2': '3C90',
        'Qitana Falling Rock': '3C96',
        'Qitana Falling Boulder': '3C97',
        'Qitana Towerfall': '3C98',
        'Qitana Viper Poison 2': '3C9E',
        'Qitana Confession of Faith 1': '3CA2',
        'Qitana Confession of Faith 3': '3CA6',
        'Qitana Confession of Faith 4': '3CA7',
        'Qitana Ronkan Light 2': '3D6D',
        'Qitana Wrath of the Ronka': '3E2C',
        'Qitana Sinspitter': '3E36',
        'Qitana Hound out of Heaven': '42B8',
        'Qitana Ronkan Abyss': '43EB',
    },
    shareWarn: {
        'Qitana Viper Poison 1': '3C9D',
        'Qitana Confession of Faith 2': '3CA3',
    },
};
/* harmony default export */ const qitana_ravel = (qitana_ravel_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/the_grand_cosmos.ts

// The Grand Cosmos
const the_grand_cosmos_triggerSet = {
    zoneId: zone_id/* default.TheGrandCosmos */.Z.TheGrandCosmos,
    damageWarn: {
        'Cosmos Iron Justice': '491F',
        'Cosmos Smite Of Rage': '4921',
        'Cosmos Tribulation': '49A4',
        'Cosmos Dark Shock': '476F',
        'Cosmos Sweep': '4770',
        'Cosmos Deep Clean': '4771',
        'Cosmos Shadow Burst': '4924',
        'Cosmos Bloody Caress': '4927',
        'Cosmos Nepenthic Plunge': '4928',
        'Cosmos Brewing Storm': '4929',
        'Cosmos Ode To Fallen Petals': '4950',
        'Cosmos Far Wind Ground': '4273',
        'Cosmos Fire Breath': '492B',
        'Cosmos Ronkan Freeze': '492E',
        'Cosmos Overpower': '492D',
        'Cosmos Scorching Left': '4763',
        'Cosmos Scorching Right': '4762',
        'Cosmos Otherwordly Heat': '475C',
        'Cosmos Fire\'s Ire': '4761',
        'Cosmos Plummet': '4767',
        'Cosmos Fire\'s Domain Tether': '475F',
    },
    shareWarn: {
        'Cosmos Dark Well': '476D',
        'Cosmos Far Wind Spread': '4724',
        'Cosmos Black Flame': '475D',
        'Cosmos Fire\'s Domain': '4760',
    },
};
/* harmony default export */ const the_grand_cosmos = (the_grand_cosmos_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/twinning.ts

const twinning_triggerSet = {
    zoneId: zone_id/* default.TheTwinning */.Z.TheTwinning,
    damageWarn: {
        'Twinning Auto Cannons': '43A9',
        'Twinning Heave': '3DB9',
        'Twinning 32 Tonze Swipe': '3DBB',
        'Twinning Sideswipe': '3DBF',
        'Twinning Wind Spout': '3DBE',
        'Twinning Shock': '3DF1',
        'Twinning Laserblade': '3DEC',
        'Twinning Vorpal Blade': '3DC2',
        'Twinning Thrown Flames': '3DC3',
        'Twinning Magitek Ray': '3DF3',
        'Twinning High Gravity': '3DFA',
    },
    damageFail: {
        'Twinning 128 Tonze Swipe': '3DBA',
    },
};
/* harmony default export */ const twinning = (twinning_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae.ts



// TODO: Dead Iron 5AB0 (earthshakers, but only if you take two?)
const delubrum_reginae_triggerSet = {
    zoneId: zone_id/* default.DelubrumReginae */.Z.DelubrumReginae,
    damageWarn: {
        'Delubrum Seeker Mercy Fourfold': '5B34',
        'Delubrum Seeker Baleful Swathe': '5AB4',
        'Delubrum Seeker Baleful Blade': '5B28',
        'Delubrum Seeker Iron Splitter Blue 1': '5AA4',
        'Delubrum Seeker Iron Splitter Blue 2': '5AA5',
        'Delubrum Seeker Iron Splitter Blue 3': '5AA6',
        'Delubrum Seeker Iron Splitter White 1': '5AA7',
        'Delubrum Seeker Iron Splitter White 2': '5AA8',
        'Delubrum Seeker Iron Splitter White 3': '5AA9',
        'Delubrum Seeker Scorching Shackle': '5AAE',
        'Delubrum Seeker Merciful Breeze': '5AAB',
        'Delubrum Seeker Merciful Blooms': '5AAD',
        'Delubrum Dahu Right-Sided Shockwave': '5761',
        'Delubrum Dahu Left-Sided Shockwave': '5762',
        'Delubrum Dahu Firebreathe': '5765',
        'Delubrum Dahu Firebreathe Rotating': '575A',
        'Delubrum Dahu Head Down': '5756',
        'Delubrum Dahu Hunter\'s Claw': '5757',
        'Delubrum Dahu Falling Rock': '575C',
        'Delubrum Dahu Hot Charge': '5764',
        'Delubrum Dahu Ripper Claw': '575D',
        'Delubrum Dahu Tail Swing': '575F',
        'Delubrum Guard Pawn Off': '5806',
        'Delubrum Guard Turret\'s Tour 1': '580D',
        'Delubrum Guard Turret\'s Tour 2': '580E',
        'Delubrum Guard Turret\'s Tour 3': '580F',
        'Delubrum Guard Optimal Play Shield': '57F3',
        'Delubrum Guard Optimal Play Sword': '57F2',
        'Delubrum Guard Counterplay': '57F6',
        'Delubrum Phantom Swirling Miasma 1': '57A9',
        'Delubrum Phantom Swirling Miasma 2': '57AA',
        'Delubrum Phantom Creeping Miasma': '57A5',
        'Delubrum Phantom Vile Wave': '57B1',
        'Delubrum Avowed Fury Of Bozja': '5973',
        'Delubrum Avowed Flashvane': '5972',
        'Delubrum Avowed Infernal Slash': '5971',
        'Delubrum Avowed Flames Of Bozja': '5968',
        'Delubrum Avowed Gleaming Arrow': '5974',
        'Delubrum Queen The Means 1': '59BB',
        'Delubrum Queen The Means 2': '59BD',
        'Delubrum Queen The End 1': '59BA',
        'Delubrum Queen The End 2': '59BC',
        'Delubrum Queen Northswain\'s Glow': '59C4',
        'Delubrum Queen Judgment Blade Left': '5B83',
        'Delubrum Queen Judgment Blade Right': '5B83',
        'Delubrum Queen Queen\'s Justice': '59BF',
        'Delubrum Queen Turret\'s Tour 1': '59E0',
        'Delubrum Queen Turret\'s Tour 2': '59E1',
        'Delubrum Queen Turret\'s Tour 3': '59E2',
        'Delubrum Queen Pawn Off': '59DA',
        'Delubrum Queen Optimal Play Shield': '59CE',
        'Delubrum Queen Optimal Play Sword': '59CC',
    },
    damageFail: {
        'Delubrum Hidden Trap Massive Explosion': '5A6E',
        'Delubrum Hidden Trap Poison Trap': '5A6F',
        'Delubrum Avowed Heat Shock': '595E',
        'Delubrum Avowed Cold Shock': '595F',
    },
    gainsEffectWarn: {
        'Delubrum Seeker Merciful Moon': '262',
    },
    shareFail: {
        'Delubrum Dahu Heat Breath': '5766',
        'Delubrum Avowed Wrath Of Bozja': '5975',
    },
    triggers: [
        {
            // At least during The Queen, these ability ids can be ordered differently,
            // and the first explosion "hits" everyone, although with "1B" flags.
            id: 'Delubrum Lots Cast',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['565A', '565B', '57FD', '57FE', '5B86', '5B87', '59D2', '5D93'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (_data, matches) => matches.flags.slice(-2) === '03',
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const delubrum_reginae = (delubrum_reginae_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae_savage.ts



// TODO: Dahu 5776 Spit Flame should always hit a Marchosias
// TODO: hitting phantom with ice spikes with anything but dispel?
// TODO: failing icy/fiery portent (guard and queen)
//       `18:Pyretic DoT Tick on ${name} for ${damage} damage.`
// TODO: Winds Of Fate / Weight Of Fortune?
// TODO: Turret's Tour?
// general traps: explosion: 5A71, poison trap: 5A72, mini: 5A73
// duel traps: mini: 57A1, ice: 579F, toad: 57A0
// TODO: taking mana flame without reflect
// TODO: taking Maelstrom's Bolt without lightning buff
const delubrum_reginae_savage_triggerSet = {
    zoneId: zone_id/* default.DelubrumReginaeSavage */.Z.DelubrumReginaeSavage,
    damageWarn: {
        'DelubrumSav Seeker Slimes Hellish Slash': '57EA',
        'DelubrumSav Seeker Slimes Viscous Rupture': '5016',
        'DelubrumSav Seeker Golems Demolish': '5880',
        'DelubrumSav Seeker Baleful Swathe': '5AD1',
        'DelubrumSav Seeker Baleful Blade': '5B2A',
        'DelubrumSav Seeker Scorching Shackle': '5ACB',
        'DelubrumSav Seeker Mercy Fourfold 1': '5B94',
        'DelubrumSav Seeker Mercy Fourfold 2': '5AB9',
        'DelubrumSav Seeker Mercy Fourfold 3': '5ABA',
        'DelubrumSav Seeker Mercy Fourfold 4': '5ABB',
        'DelubrumSav Seeker Mercy Fourfold 5': '5ABC',
        'DelubrumSav Seeker Merciful Breeze': '5AC8',
        'DelubrumSav Seeker Baleful Comet': '5AD7',
        'DelubrumSav Seeker Baleful Firestorm': '5AD8',
        'DelubrumSav Seeker Iron Rose': '5AD9',
        'DelubrumSav Seeker Iron Splitter Blue 1': '5AC1',
        'DelubrumSav Seeker Iron Splitter Blue 2': '5AC2',
        'DelubrumSav Seeker Iron Splitter Blue 3': '5AC3',
        'DelubrumSav Seeker Iron Splitter White 1': '5AC4',
        'DelubrumSav Seeker Iron Splitter White 2': '5AC5',
        'DelubrumSav Seeker Iron Splitter White 3': '5AC6',
        'DelubrumSav Seeker Act Of Mercy': '5ACF',
        'DelubrumSav Dahu Right-Sided Shockwave 1': '5770',
        'DelubrumSav Dahu Right-Sided Shockwave 2': '5772',
        'DelubrumSav Dahu Left-Sided Shockwave 1': '576F',
        'DelubrumSav Dahu Left-Sided Shockwave 2': '5771',
        'DelubrumSav Dahu Firebreathe': '5774',
        'DelubrumSav Dahu Firebreathe Rotating': '576C',
        'DelubrumSav Dahu Head Down': '5768',
        'DelubrumSav Dahu Hunter\'s Claw': '5769',
        'DelubrumSav Dahu Falling Rock': '576E',
        'DelubrumSav Dahu Hot Charge': '5773',
        'DelubrumSav Duel Massive Explosion': '579E',
        'DelubrumSav Duel Vicious Swipe': '5797',
        'DelubrumSav Duel Focused Tremor 1': '578F',
        'DelubrumSav Duel Focused Tremor 2': '5791',
        'DelubrumSav Duel Devour': '5789',
        'DelubrumSav Duel Flailing Strike 1': '578C',
        'DelubrumSav Duel Flailing Strike 2': '578D',
        'DelubrumSav Guard Optimal Offensive Sword': '5819',
        'DelubrumSav Guard Optimal Offensive Shield': '581A',
        'DelubrumSav Guard Optimal Play Sword': '5816',
        'DelubrumSav Guard Optimal Play Shield': '5817',
        'DelubrumSav Guard Optimal Play Cleave': '5818',
        'DelubrumSav Guard Unlucky Lot': '581D',
        'DelubrumSav Guard Burn 1': '583D',
        'DelubrumSav Guard Burn 2': '583E',
        'DelubrumSav Guard Pawn Off': '583A',
        'DelubrumSav Guard Turret\'s Tour Normal 1': '5847',
        'DelubrumSav Guard Turret\'s Tour Normal 2': '5848',
        'DelubrumSav Guard Turret\'s Tour Normal 3': '5849',
        'DelubrumSav Guard Counterplay': '58F5',
        'DelubrumSav Phantom Swirling Miasma 1': '57B8',
        'DelubrumSav Phantom Swirling Miasma 2': '57B9',
        'DelubrumSav Phantom Creeping Miasma 1': '57B4',
        'DelubrumSav Phantom Creeping Miasma 2': '57B5',
        'DelubrumSav Phantom Lingering Miasma 1': '57B6',
        'DelubrumSav Phantom Lingering Miasma 2': '57B7',
        'DelubrumSav Phantom Vile Wave': '57BF',
        'DelubrumSav Avowed Fury Of Bozja': '594C',
        'DelubrumSav Avowed Flashvane': '594B',
        'DelubrumSav Avowed Infernal Slash': '594A',
        'DelubrumSav Avowed Flames Of Bozja': '5939',
        'DelubrumSav Avowed Gleaming Arrow': '594D',
        'DelubrumSav Lord Whack': '57D0',
        'DelubrumSav Lord Devastating Bolt 1': '57C5',
        'DelubrumSav Lord Devastating Bolt 2': '57C6',
        'DelubrumSav Lord Electrocution': '57CC',
        'DelubrumSav Lord Rapid Bolts': '57C3',
        'DelubrumSav Lord 1111-Tonze Swing': '57D8',
        'DelubrumSav Lord Monk Attack': '55A6',
        'DelubrumSav Queen Northswain\'s Glow': '59F4',
        'DelubrumSav Queen The Means 1': '59E7',
        'DelubrumSav Queen The Means 2': '59EA',
        'DelubrumSav Queen The End 1': '59E8',
        'DelubrumSav Queen The End 2': '59E9',
        'DelubrumSav Queen Optimal Offensive Sword': '5A02',
        'DelubrumSav Queen Optimal Offensive Shield': '5A03',
        'DelubrumSav Queen Judgment Blade Left 1': '59F2',
        'DelubrumSav Queen Judgment Blade Left 2': '5B85',
        'DelubrumSav Queen Judgment Blade Right 1': '59F1',
        'DelubrumSav Queen Judgment Blade Right 2': '5B84',
        'DelubrumSav Queen Pawn Off': '5A1D',
        'DelubrumSav Queen Optimal Play Sword': '59FF',
        'DelubrumSav Queen Optimal Play Shield': '5A00',
        'DelubrumSav Queen Optimal Play Cleave': '5A01',
        'DelubrumSav Queen Turret\'s Tour Normal 1': '5A28',
        'DelubrumSav Queen Turret\'s Tour Normal 2': '5A2A',
        'DelubrumSav Queen Turret\'s Tour Normal 3': '5A29',
    },
    damageFail: {
        'DelubrumSav Avowed Heat Shock': '5927',
        'DelubrumSav Avowed Cold Shock': '5928',
        'DelubrumSav Queen Queen\'s Justice': '59EB',
        'DelubrumSav Queen Gunnhildr\'s Blades': '5B22',
        'DelubrumSav Queen Unlucky Lot': '55B6',
    },
    gainsEffectWarn: {
        'DelubrumSav Seeker Merciful Moon': '262',
    },
    shareWarn: {
        'DelubrumSav Seeker Phantom Baleful Onslaught': '5AD6',
        'DelubrumSav Lord Foe Splitter': '57D7',
    },
    triggers: [
        {
            // These ability ids can be ordered differently and "hit" people when levitating.
            id: 'DelubrumSav Guard Lots Cast',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['5827', '5828', '5B6C', '5B6D', '5BB6', '5BB7', '5B88', '5B89'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (_data, matches) => matches.flags.slice(-2) === '03',
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'DelubrumSav Golem Compaction',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5746' }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: `${matches.source}: ${matches.ability}` };
            },
        },
        {
            id: 'DelubrumSav Slime Sanguine Fusion',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '554D' }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: `${matches.source}: ${matches.ability}` };
            },
        },
    ],
};
/* harmony default export */ const delubrum_reginae_savage = (delubrum_reginae_savage_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1n.ts

const e1n_triggerSet = {
    zoneId: zone_id/* default.EdensGateResurrection */.Z.EdensGateResurrection,
    damageWarn: {
        'E1N Eden\'s Thunder III': '44ED',
        'E1N Eden\'s Blizzard III': '44EC',
        'E1N Pure Beam': '3D9E',
        'E1N Paradise Lost': '3DA0',
    },
    damageFail: {
        'E1N Eden\'s Flare': '3D97',
        'E1N Pure Light': '3DA3',
    },
    shareFail: {
        'E1N Fire III': '44EB',
        'E1N Vice Of Vanity': '44E7',
        'E1N Vice Of Apathy': '44E8',
    },
};
/* harmony default export */ const e1n = (e1n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1s.ts

// TODO: failing to interrupt Mana Boost (3D8D)
// TODO: failing to pass healer debuff?
// TODO: what happens if you don't kill a meteor during four orbs?
const e1s_triggerSet = {
    zoneId: zone_id/* default.EdensGateResurrectionSavage */.Z.EdensGateResurrectionSavage,
    damageWarn: {
        'E1S Eden\'s Thunder III': '44F7',
        'E1S Eden\'s Blizzard III': '44F6',
        'E1S Eden\'s Regained Blizzard III': '44FA',
        'E1S Pure Beam Trident 1': '3D83',
        'E1S Pure Beam Trident 2': '3D84',
        'E1S Paradise Lost': '3D87',
    },
    damageFail: {
        'E1S Eden\'s Flare': '3D73',
        'E1S Pure Light': '3D8A',
    },
    shareFail: {
        'E1S Fire/Thunder III': '44FB',
        'E1S Pure Beam Single': '3D81',
        'E1S Vice Of Vanity': '44F1',
        'E1S Vice of Apathy': '44F2',
    },
};
/* harmony default export */ const e1s = (e1s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e2n.ts



// TODO: shadoweye failure (top line fail, bottom line success, effect there too)
// [16:17:35.966] 16:400110FE:Voidwalker:40B7:Shadoweye:10612345:Tini Poutini:F:10000:100190F:
// [16:17:35.966] 16:400110FE:Voidwalker:40B7:Shadoweye:1067890A:Potato Chippy:1:0:1C:8000:
// gains the effect of Petrification from Voidwalker for 10.00 Seconds.
// TODO: puddle failure?
const e2n_triggerSet = {
    zoneId: zone_id/* default.EdensGateDescent */.Z.EdensGateDescent,
    damageWarn: {
        'E2N Doomvoid Slicer': '3E3C',
        'E2N Doomvoid Guillotine': '3E3B',
    },
    triggers: [
        {
            id: 'E2N Nyx',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '3E3D', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Booped',
                        de: matches.ability,
                        fr: 'Malus de dégâts',
                        ja: matches.ability,
                        cn: matches.ability,
                        ko: '닉스',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e2n = (e2n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e2s.ts



// TODO: shadoweye failure
// TODO: Empty Hate (3E59/3E5A) hits everybody, so hard to tell about knockback
// TODO: maybe mark hell wind people who got clipped by stack?
// TODO: missing puddles?
// TODO: missing light/dark circle stack
const e2s_triggerSet = {
    zoneId: zone_id/* default.EdensGateDescentSavage */.Z.EdensGateDescentSavage,
    damageWarn: {
        'E2S Doomvoid Slicer': '3E50',
        'E3S Empty Rage': '3E6C',
        'E3S Doomvoid Guillotine': '3E4F',
    },
    shareWarn: {
        'E2S Doomvoid Cleaver': '3E64',
    },
    triggers: [
        {
            id: 'E2S Shadoweye',
            type: 'GainsEffect',
            // Stone Curse
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '589' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'E2S Nyx',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '3E51', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Booped',
                        de: matches.ability,
                        fr: 'Malus de dégâts',
                        ja: matches.ability,
                        cn: matches.ability,
                        ko: '닉스',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e2s = (e2s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3n.ts

const e3n_triggerSet = {
    zoneId: zone_id/* default.EdensGateInundation */.Z.EdensGateInundation,
    damageWarn: {
        'E3N Monster Wave 1': '3FCA',
        'E3N Monster Wave 2': '3FE9',
        'E3N Maelstrom': '3FD9',
        'E3N Swirling Tsunami': '3FD5',
    },
    damageFail: {
        'E3N Temporary Current 1': '3FCE',
        'E3N Temporary Current 2': '3FCD',
        'E3N Spinning Dive': '3FDB',
    },
    shareFail: {
        'E3N Rip Current': '3FC7',
    },
};
/* harmony default export */ const e3n = (e3n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3s.ts

// TODO: Scouring Tsunami (3CE0) on somebody other than target
// TODO: Sweeping Tsunami (3FF5) on somebody other than tanks
// TODO: Rip Current (3FE0, 3FE1) on somebody other than target/tanks
// TODO: Boiled Alive (4006) is failing puddles???
// TODO: failing to cleanse Splashing Waters
// TODO: does getting hit by undersea quake cause an ability?
const e3s_triggerSet = {
    zoneId: zone_id/* default.EdensGateInundationSavage */.Z.EdensGateInundationSavage,
    damageWarn: {
        'E3S Monster Wave 1': '3FE5',
        'E3S Monster Wave 2': '3FE9',
        'E3S Maelstrom': '3FFB',
        'E3S Swirling Tsunami': '3FF4',
    },
    damageFail: {
        'E3S Temporary Current 1': '3FEA',
        'E3S Temporary Current 2': '3FEB',
        'E3S Temporary Current 3': '3FEC',
        'E3S Temporary Current 4': '3FED',
        'E3S Spinning Dive': '3FFD',
    },
};
/* harmony default export */ const e3s = (e3s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e4n.ts

const e4n_triggerSet = {
    zoneId: zone_id/* default.EdensGateSepulture */.Z.EdensGateSepulture,
    damageWarn: {
        'E4N Weight of the Land': '40EB',
        'E4N Evil Earth': '40EF',
        'E4N Aftershock 1': '41B4',
        'E4N Aftershock 2': '40F0',
        'E4N Explosion 1': '40ED',
        'E4N Explosion 2': '40F5',
        'E4N Landslide': '411B',
        'E4N Rightward Landslide': '4100',
        'E4N Leftward Landslide': '40FF',
        'E4N Massive Landslide': '40FC',
        'E4N Seismic Wave': '40F3',
        'E4N Fault Line': '4101',
    },
};
/* harmony default export */ const e4n = (e4n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e4s.ts



// TODO: could track people get hitting by markers they shouldn't
// TODO: could track non-tanks getting hit by tankbusters, megaliths
// TODO: could track non-target getting hit by tankbuster
const e4s_triggerSet = {
    zoneId: zone_id/* default.EdensGateSepultureSavage */.Z.EdensGateSepultureSavage,
    damageWarn: {
        'E4S Weight of the Land': '4108',
        'E4S Evil Earth': '410C',
        'E4S Aftershock 1': '41B5',
        'E4S Aftershock 2': '410D',
        'E4S Explosion': '410A',
        'E4S Landslide': '411B',
        'E4S Rightward Landslide': '411D',
        'E4S Leftward Landslide': '411C',
        'E4S Massive Landslide 1': '4118',
        'E4S Massive Landslide 2': '4119',
        'E4S Seismic Wave': '4110',
    },
    damageFail: {
        'E4S Dual Earthen Fists 1': '4135',
        'E4S Dual Earthen Fists 2': '4687',
        'E4S Plate Fracture': '43EA',
        'E4S Earthen Fist 1': '43CA',
        'E4S Earthen Fist 2': '43C9',
    },
    triggers: [
        {
            id: 'E4S Fault Line Collect',
            type: 'StartsUsing',
            netRegex: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'Titan' }),
            netRegexDe: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'Titan' }),
            netRegexFr: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'Titan' }),
            netRegexJa: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'タイタン' }),
            netRegexCn: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: '泰坦' }),
            netRegexKo: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: '타이탄' }),
            run: (data, matches) => {
                data.faultLineTarget = matches.target;
            },
        },
        {
            id: 'E4S Fault Line',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '411E', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.faultLineTarget !== matches.target,
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Run Over',
                        de: matches.ability,
                        fr: 'A été écrasé(e)',
                        ja: matches.ability,
                        cn: matches.ability,
                        ko: matches.ability,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e4s = (e4s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5n.ts



const e5n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFulmination */.Z.EdensVerseFulmination,
    damageWarn: {
        'E5N Impact': '4E3A',
        'E5N Lightning Bolt': '4B9C',
        'E5N Gallop': '4B97',
        'E5N Shock Strike': '4BA1',
        'E5N Volt Strike': '4CF2',
    },
    damageFail: {
        'E5N Judgment Jolt': '4B8F',
    },
    triggers: [
        {
            // This happens when a player gets 4+ stacks of orbs. Don't be greedy!
            id: 'E5N Static Condensation',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8B5' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Helper for orb pickup failures
            id: 'E5N Orb Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = true;
            },
        },
        {
            id: 'E5N Orb Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = false;
            },
        },
        {
            id: 'E5N Divine Judgement Volts',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4B9A', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (no orb)`,
                        de: `${matches.ability} (kein Orb)`,
                        fr: `${matches.ability} (pas d'orbe)`,
                        ja: `${matches.ability} (雷玉無し)`,
                        cn: `${matches.ability} (没吃球)`,
                    },
                };
            },
        },
        {
            id: 'E5N Stormcloud Target Tracking',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : (data.cloudMarkers = []);
                data.cloudMarkers.push(matches.target);
            },
        },
        {
            // This ability is seen only if players stacked the clouds instead of spreading them.
            id: 'E5N The Parting Clouds',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4B9D', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 30,
            mistake: (data, matches) => {
                var _a;
                for (const name of (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : []) {
                    return {
                        type: 'fail',
                        blame: name,
                        text: {
                            en: `${matches.ability} (clouds too close)`,
                            de: `${matches.ability} (Wolken zu nahe)`,
                            fr: `${matches.ability} (nuages trop proches)`,
                            ja: `${matches.ability} (雲近すぎ)`,
                            cn: `${matches.ability} (雷云重叠)`,
                        },
                    };
                }
            },
        },
        {
            id: 'E5N Stormcloud cleanup',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            delaySeconds: 30,
            run: (data) => {
                delete data.cloudMarkers;
            },
        },
    ],
};
/* harmony default export */ const e5n = (e5n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5s.ts



// TODO: is there a different ability if the shield duty action isn't used properly?
// TODO: is there an ability from Raiden (the bird) if you get eaten?
// TODO: maybe chain lightning warning if you get hit while you have system shock (8B8)
const noOrb = (str) => {
    return {
        en: str + ' (no orb)',
        de: str + ' (kein Orb)',
        fr: str + ' (pas d\'orbe)',
        ja: str + ' (雷玉無し)',
        cn: str + ' (没吃球)',
        ko: str + ' (구슬 없음)',
    };
};
const e5s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFulminationSavage */.Z.EdensVerseFulminationSavage,
    damageWarn: {
        'E5S Impact': '4E3B',
        'E5S Gallop': '4BB4',
        'E5S Shock Strike': '4BC1',
        'E5S Stepped Leader Twister': '4BC7',
        'E5S Stepped Leader Donut': '4BC8',
        'E5S Shock': '4E3D',
    },
    damageFail: {
        'E5S Judgment Jolt': '4BA7',
    },
    shareWarn: {
        'E5S Volt Strike Double': '4BC3',
        'E5S Crippling Blow': '4BCA',
        'E5S Chain Lightning Double': '4BC5',
    },
    triggers: [
        {
            // Helper for orb pickup failures
            id: 'E5S Orb Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = true;
            },
        },
        {
            id: 'E5S Orb Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = false;
            },
        },
        {
            id: 'E5S Divine Judgement Volts',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BB7', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: noOrb(matches.ability) };
            },
        },
        {
            id: 'E5S Volt Strike Orb',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BC3', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: noOrb(matches.ability) };
            },
        },
        {
            id: 'E5S Deadly Discharge Big Knockback',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BB2', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: noOrb(matches.ability) };
            },
        },
        {
            id: 'E5S Lightning Bolt',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BB9', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                // Having a non-idempotent condition function is a bit <_<
                // Only consider lightning bolt damage if you have a debuff to clear.
                if (!data.hated || !data.hated[matches.target])
                    return true;
                delete data.hated[matches.target];
                return false;
            },
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'E5S Hated of Levin',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '00D2' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hated) !== null && _a !== void 0 ? _a : (data.hated = {});
                data.hated[matches.target] = true;
            },
        },
        {
            id: 'E5S Stormcloud Target Tracking',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : (data.cloudMarkers = []);
                data.cloudMarkers.push(matches.target);
            },
        },
        {
            // This ability is seen only if players stacked the clouds instead of spreading them.
            id: 'E5S The Parting Clouds',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BBA', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 30,
            mistake: (data, matches) => {
                var _a;
                for (const name of (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : []) {
                    return {
                        type: 'fail',
                        blame: name,
                        text: {
                            en: `${matches.ability} (clouds too close)`,
                            de: `${matches.ability} (Wolken zu nahe)`,
                            fr: `${matches.ability} (nuages trop proches)`,
                            ja: `${matches.ability} (雲近すぎ)`,
                            cn: `${matches.ability} (雷云重叠)`,
                        },
                    };
                }
            },
        },
        {
            id: 'E5S Stormcloud cleanup',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            // Stormclouds resolve well before this.
            delaySeconds: 30,
            run: (data) => {
                delete data.cloudMarkers;
                delete data.hated;
            },
        },
    ],
};
/* harmony default export */ const e5s = (e5s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6n.ts

const e6n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFuror */.Z.EdensVerseFuror,
    damageWarn: {
        'E6N Thorns': '4BDA',
        'E6N Ferostorm 1': '4BDD',
        'E6N Ferostorm 2': '4BE5',
        'E6N Storm Of Fury 1': '4BE0',
        'E6N Storm Of Fury 2': '4BE6',
        'E6N Explosion': '4BE2',
        'E6N Heat Burst': '4BEC',
        'E6N Conflag Strike': '4BEE',
        'E6N Spike Of Flame': '4BF0',
        'E6N Radiant Plume': '4BF2',
        'E6N Eruption': '4BF4',
    },
    damageFail: {
        'E6N Vacuum Slice': '4BD5',
        'E6N Downburst': '4BDB',
    },
    shareFail: {
        // Kills non-tanks who get hit by it.
        'E6N Instant Incineration': '4BED',
    },
};
/* harmony default export */ const e6n = (e6n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6s.ts

// TODO: check tethers being cut (when they shouldn't)
// TODO: check for concussed debuff
// TODO: check for taking tankbuster with lightheaded
// TODO: check for one person taking multiple Storm Of Fury Tethers (4C01/4C08)
const e6s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFurorSavage */.Z.EdensVerseFurorSavage,
    damageWarn: {
        // It's common to just ignore futbol mechanics, so don't warn on Strike Spark.
        // 'Spike Of Flame': '4C13', // Orb explosions after Strike Spark
        'E6S Thorns': '4BFA',
        'E6S Ferostorm 1': '4BFD',
        'E6S Ferostorm 2': '4C06',
        'E6S Storm Of Fury 1': '4C00',
        'E6S Storm Of Fury 2': '4C07',
        'E6S Explosion': '4C03',
        'E6S Heat Burst': '4C1F',
        'E6S Conflag Strike': '4C10',
        'E6S Radiant Plume': '4C15',
        'E6S Eruption': '4C17',
        'E6S Wind Cutter': '4C02',
    },
    damageFail: {
        'E6S Vacuum Slice': '4BF5',
        'E6S Downburst 1': '4BFB',
        'E6S Downburst 2': '4BFC',
        'E6S Meteor Strike': '4C0F',
    },
    shareWarn: {
        'E6S Hands of Hell': '4C0[BC]',
        'E6S Hands of Flame': '4C0A',
        'E6S Instant Incineration': '4C0E',
        'E6S Blaze': '4C1B',
    },
    soloFail: {
        'E6S Air Bump': '4BF9',
    },
};
/* harmony default export */ const e6s = (e6s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7n.ts



const wrongBuff = (str) => {
    return {
        en: str + ' (wrong buff)',
        de: str + ' (falscher Buff)',
        fr: str + ' (mauvais buff)',
        ja: str + ' (不適切なバフ)',
        cn: str + ' (Buff错了)',
        ko: str + ' (버프 틀림)',
    };
};
const noBuff = (str) => {
    return {
        en: str + ' (no buff)',
        de: str + ' (kein Buff)',
        fr: str + ' (pas de buff)',
        ja: str + ' (バフ無し)',
        cn: str + ' (没有Buff)',
        ko: str + '(버프 없음)',
    };
};
const e7n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseIconoclasm */.Z.EdensVerseIconoclasm,
    damageWarn: {
        'E7N Stygian Sword': '4C55',
        'E7N Strength In Numbers Donut': '4C4C',
        'E7N Strength In Numbers 2': '4C4D',
    },
    shareWarn: {
        'E7N Stygian Stake': '4C33',
        'E5N Silver Shot': '4E7D',
    },
    triggers: [
        {
            id: 'E7N Astral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasAstral) !== null && _a !== void 0 ? _a : (data.hasAstral = {});
                data.hasAstral[matches.target] = true;
            },
        },
        {
            id: 'E7N Astral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasAstral) !== null && _a !== void 0 ? _a : (data.hasAstral = {});
                data.hasAstral[matches.target] = false;
            },
        },
        {
            id: 'E7N Umbral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasUmbral) !== null && _a !== void 0 ? _a : (data.hasUmbral = {});
                data.hasUmbral[matches.target] = true;
            },
        },
        {
            id: 'E7N Umbral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasUmbral) !== null && _a !== void 0 ? _a : (data.hasUmbral = {});
                data.hasUmbral[matches.target] = false;
            },
        },
        {
            id: 'E7N Light\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C3E', '4C40', '4C22', '4C3C', '4E63'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasUmbral || !data.hasUmbral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasAstral && data.hasAstral[matches.target])
                    return { type: 'fail', blame: matches.target, text: wrongBuff(matches.ability) };
                return { type: 'warn', blame: matches.target, text: noBuff(matches.ability) };
            },
        },
        {
            id: 'E7N Darks\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C3D', '4C23', '4C41', '4C43'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasAstral || !data.hasAstral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasUmbral && data.hasUmbral[matches.target])
                    return { type: 'fail', blame: matches.target, text: wrongBuff(matches.ability) };
                // This case is probably impossible, as the debuff ticks after death,
                // but leaving it here in case there's some rez or disconnect timing
                // that could lead to this.
                return { type: 'warn', blame: matches.target, text: noBuff(matches.ability) };
            },
        },
    ],
};
/* harmony default export */ const e7n = (e7n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7s.ts



// TODO: missing an orb during tornado phase
// TODO: jumping in the tornado damage??
// TODO: taking sungrace(4C80) or moongrace(4C82) with wrong debuff
// TODO: stygian spear/silver spear with the wrong debuff
// TODO: taking explosion from the wrong Chiaro/Scuro orb
// TODO: handle 4C89 Silver Stake tankbuster 2nd hit, as it's ok to have two in.
const e7s_wrongBuff = (str) => {
    return {
        en: str + ' (wrong buff)',
        de: str + ' (falscher Buff)',
        fr: str + ' (mauvais buff)',
        ja: str + ' (不適切なバフ)',
        cn: str + ' (Buff错了)',
        ko: str + ' (버프 틀림)',
    };
};
const e7s_noBuff = (str) => {
    return {
        en: str + ' (no buff)',
        de: str + ' (kein Buff)',
        fr: str + ' (pas de buff)',
        ja: str + ' (バフ無し)',
        cn: str + ' (没有Buff)',
        ko: str + ' (버프 없음)',
    };
};
const e7s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseIconoclasmSavage */.Z.EdensVerseIconoclasmSavage,
    damageWarn: {
        'E7S Silver Sword': '4C8E',
        'E7S Overwhelming Force': '4C73',
        'E7S Strength in Numbers 1': '4C70',
        'E7S Strength in Numbers 2': '4C71',
        'E7S Paper Cut': '4C7D',
        'E7S Buffet': '4C77',
    },
    damageFail: {
        'E7S Betwixt Worlds': '4C6B',
        'E7S Crusade': '4C58',
        'E7S Explosion': '4C6F',
    },
    shareWarn: {
        'E7S Stygian Stake': '4C34',
        'E7S Silver Shot': '4C92',
        'E7S Silver Scourge': '4C93',
        'E7S Chiaro Scuro Explosion 1': '4D14',
        'E7S Chiaro Scuro Explosion 2': '4D15',
    },
    triggers: [
        {
            // Interrupt
            id: 'E7S Advent Of Light',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4C6E' }),
            mistake: (_data, matches) => {
                // TODO: is this blame correct? does this have a target?
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'E7S Astral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                data.hasAstral = data.hasAstral || {};
                data.hasAstral[matches.target] = true;
            },
        },
        {
            id: 'E7S Astral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                data.hasAstral = data.hasAstral || {};
                data.hasAstral[matches.target] = false;
            },
        },
        {
            id: 'E7S Umbral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                data.hasUmbral = data.hasUmbral || {};
                data.hasUmbral[matches.target] = true;
            },
        },
        {
            id: 'E7S Umbral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                data.hasUmbral = data.hasUmbral || {};
                data.hasUmbral[matches.target] = false;
            },
        },
        {
            id: 'E7S Light\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C62', '4C63', '4C64', '4C5B', '4C5F'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasUmbral || !data.hasUmbral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasAstral && data.hasAstral[matches.target])
                    return { type: 'fail', blame: matches.target, text: e7s_wrongBuff(matches.ability) };
                return { type: 'warn', blame: matches.target, text: e7s_noBuff(matches.ability) };
            },
        },
        {
            id: 'E7S Darks\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C65', '4C66', '4C67', '4C5A', '4C60'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasAstral || !data.hasAstral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasUmbral && data.hasUmbral[matches.target])
                    return { type: 'fail', blame: matches.target, text: e7s_wrongBuff(matches.ability) };
                // This case is probably impossible, as the debuff ticks after death,
                // but leaving it here in case there's some rez or disconnect timing
                // that could lead to this.
                return { type: 'warn', blame: matches.target, text: e7s_noBuff(matches.ability) };
            },
        },
        {
            id: 'E7S Crusade Knockback',
            type: 'Ability',
            // 4C76 is the knockback damage, 4C58 is the damage for standing on the puck.
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4C76', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e7s = (e7s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8n.ts



const e8n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseRefulgence */.Z.EdensVerseRefulgence,
    damageWarn: {
        'E8N Biting Frost': '4DDB',
        'E8N Driving Frost': '4DDC',
        'E8N Frigid Stone': '4E66',
        'E8N Reflected Axe Kick': '4E00',
        'E8N Reflected Scythe Kick': '4E01',
        'E8N Frigid Eruption': '4E09',
        'E8N Icicle Impact': '4E0A',
        'E8N Axe Kick': '4DE2',
        'E8N Scythe Kick': '4DE3',
        'E8N Reflected Biting Frost': '4DFE',
        'E8N Reflected Driving Frost': '4DFF',
    },
    damageFail: {},
    triggers: [
        {
            id: 'E8N Shining Armor',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '95' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'E8N Heavenly Strike',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4DD8', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Pushed off!',
                        de: 'Runter gestoßen!',
                        fr: 'A été poussé(e) !',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백됨!',
                    },
                };
            },
        },
        {
            id: 'E8N Frost Armor',
            type: 'GainsEffect',
            // Thin Ice
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38F' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Slid off!',
                        de: 'runtergerutscht!',
                        fr: 'A glissé(e) !',
                        ja: '滑った',
                        cn: '滑落',
                        ko: '미끄러짐!',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e8n = (e8n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8s.ts


// TODO: rush hitting the crystal
// TODO: adds not being killed
// TODO: taking the rush twice (when you have debuff)
// TODO: not hitting the dragon four times during wyrm's lament
// TODO: death reasons for not picking up puddle
// TODO: not being in the tower when you should
// TODO: picking up too many stacks
// Note: Banish III (4DA8) and Banish Iii Divided (4DA9) both are type=0x16 lines.
// The same is true for Banish (4DA6) and Banish Divided (4DA7).
// I'm not sure this makes any sense? But can't tell if the spread was a mistake or not.
// Maybe we could check for "Magic Vulnerability Up"?
const e8s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseRefulgenceSavage */.Z.EdensVerseRefulgenceSavage,
    damageWarn: {
        'E8S Biting Frost': '4D66',
        'E8S Driving Frost': '4D67',
        'E8S Axe Kick': '4D6D',
        'E8S Scythe Kick': '4D6E',
        'E8S Reflected Axe Kick': '4DB9',
        'E8S Reflected Scythe Kick': '4DBA',
        'E8S Frigid Eruption': '4D9F',
        'E8S Frigid Needle': '4D9D',
        'E8S Icicle Impact': '4DA0',
        'E8S Reflected Biting Frost 1': '4DB7',
        'E8S Reflected Biting Frost 2': '4DC3',
        'E8S Reflected Driving Frost 1': '4DB8',
        'E8S Reflected Driving Frost 2': '4DC4',
        'E8S Hallowed Wings 1': '4D75',
        'E8S Hallowed Wings 2': '4D76',
        'E8S Hallowed Wings 3': '4D77',
        'E8S Reflected Hallowed Wings 1': '4D90',
        'E8S Reflected Hallowed Wings 2': '4DBB',
        'E8S Reflected Hallowed Wings 3': '4DC7',
        'E8S Reflected Hallowed Wings 4': '4D91',
        'E8S Twin Stillness 1': '4D68',
        'E8S Twin Stillness 2': '4D6B',
        'E8S Twin Silence 1': '4D69',
        'E8S Twin Silence 2': '4D6A',
        'E8S Akh Rhai': '4D99',
        'E8S Embittered Dance 1': '4D70',
        'E8S Embittered Dance 2': '4D71',
        'E8S Spiteful Dance 1': '4D6F',
        'E8S Spiteful Dance 2': '4D72',
    },
    damageFail: {
        // Broken tether.
        'E8S Refulgent Fate': '4DA4',
        // Shared orb, correct is Bright Pulse (4D95)
        'E8S Blinding Pulse': '4D96',
    },
    shareFail: {
        'E8S Path of Light': '4DA1',
    },
    triggers: [
        {
            id: 'E8S Shining Armor',
            type: 'GainsEffect',
            // Stun
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '95' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Interrupt
            id: 'E8S Stoneskin',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4D85' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e8s = (e8s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9n.ts

const e9n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseUmbra */.Z.EdensPromiseUmbra,
    damageWarn: {
        'E9N The Art Of Darkness 1': '5223',
        'E9N The Art Of Darkness 2': '5224',
        'E9N Wide-Angle Particle Beam': '5AFF',
        'E9N Wide-Angle Phaser': '55E1',
        'E9N Bad Vibrations': '55E6',
        'E9N Earth-Shattering Particle Beam': '5225',
        'E9N Anti-Air Particle Beam': '55DC',
        'E9N Zero-Form Particle Beam 2': '55DB',
    },
    damageFail: {
        'E9N Withdraw': '5534',
        'E9N Aetherosynthesis': '5535',
    },
    shareWarn: {
        'E9N Zero-Form Particle Beam 1': '55EB',
    },
};
/* harmony default export */ const e9n = (e9n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9s.ts



// TODO: 561D Evil Seed hits everyone, hard to know if there's a double tap
// TODO: falling through panel just does damage with no ability name, like a death wall
// TODO: what happens if you jump in seed thorns?
const e9s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseUmbraSavage */.Z.EdensPromiseUmbraSavage,
    damageWarn: {
        'E9S Bad Vibrations': '561C',
        'E9S Wide-Angle Particle Beam': '5B00',
        'E9S Wide-Angle Phaser Unlimited': '560E',
        'E9S Anti-Air Particle Beam': '5B01',
        'E9S The Second Art Of Darkness 1': '5601',
        'E9S The Second Art Of Darkness 2': '5602',
        'E9S The Art Of Darkness 1': '5A95',
        'E9S The Art Of Darkness 2': '5A96',
        'E9S The Art Of Darkness Clone 1': '561E',
        'E9S The Art Of Darkness Clone 2': '561F',
        'E9S The Third Art Of Darkness 1': '5603',
        'E9S The Third Art Of Darkness 2': '5604',
        'E9S Art Of Darkness': '5606',
        'E9S Full-Perimiter Particle Beam': '5629',
        'E9S Dark Chains': '5FAC',
    },
    damageFail: {
        'E9S Withdraw': '561A',
        'E9S Aetherosynthesis': '561B',
    },
    gainsEffectWarn: {
        'E9S Stygian Tendrils': '952',
    },
    shareWarn: {
        'E9S Hyper-Focused Particle Beam': '55FD',
    },
    shareFail: {
        'E9S Condensed Wide-Angle Particle Beam': '5610',
    },
    soloWarn: {
        'E9S Multi-Pronged Particle Beam': '5600',
    },
    triggers: [
        {
            // Anti-air "tank spread".  This can be stacked by two tanks invulning.
            // Note: this will still show something for holmgang/living, but
            // arguably a healer might need to do something about that, so maybe
            // it's ok to still show as a warning??
            id: 'E9S Condensed Anti-Air Particle Beam',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ type: '22', id: '5615', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            // Anti-air "out".  This can be invulned by a tank along with the spread above.
            id: 'E9S Anti-Air Phaser Unlimited',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '5612', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e9s = (e9s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10n.ts

const e10n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseLitany */.Z.EdensPromiseLitany,
    damageWarn: {
        'E10N Forward Implosion': '56B4',
        'E10N Forward Shadow Implosion': '56B5',
        'E10N Backward Implosion': '56B7',
        'E10N Backward Shadow Implosion': '56B8',
        'E10N Barbs Of Agony 1': '56D9',
        'E10N Barbs Of Agony 2': '5B26',
        'E10N Cloak Of Shadows': '5B11',
        'E10N Throne Of Shadow': '56C7',
        'E10N Right Giga Slash': '56AE',
        'E10N Right Shadow Slash': '56AF',
        'E10N Left Giga Slash': '56B1',
        'E10N Left Shadow Slash': '56BD',
        'E10N Shadowy Eruption': '56E1',
    },
    shareWarn: {
        'E10N Shadow\'s Edge': '56DB',
    },
};
/* harmony default export */ const e10n = (e10n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10s.ts



// TODO: hitting shadow of the hero with abilities can cause you to take damage, list those?
//       e.g. picking up your first pitch bog puddle will cause you to die to the damage
//       your shadow takes from Deepshadow Nova or Distant Scream.
// TODO: 573B Blighting Blitz issues during limit cut numbers
const e10s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseLitanySavage */.Z.EdensPromiseLitanySavage,
    damageWarn: {
        'E10S Implosion Single 1': '56F2',
        'E10S Implosion Single 2': '56EF',
        'E10S Implosion Quadruple 1': '56EF',
        'E10S Implosion Quadruple 2': '56F2',
        'E10S Giga Slash Single 1': '56EC',
        'E10S Giga Slash Single 2': '56ED',
        'E10S Giga Slash Box 1': '5709',
        'E10S Giga Slash Box 2': '570D',
        'E10S Giga Slash Quadruple 1': '56EC',
        'E10S Giga Slash Quadruple 2': '56E9',
        'E10S Cloak Of Shadows 1': '5B13',
        'E10S Cloak Of Shadows 2': '5B14',
        'E10S Throne Of Shadow': '5717',
        'E10S Shadowy Eruption': '5738',
    },
    damageFail: {
        'E10S Swath Of Silence 1': '571A',
        'E10S Swath Of Silence 2': '5BBF',
    },
    shareWarn: {
        'E10S Shadefire': '5732',
        'E10S Pitch Bog': '5722',
    },
    shareFail: {
        'E10S Shadow\'s Edge': '5725',
    },
    triggers: [
        {
            id: 'E10S Damage Down Orbs',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Flameshadow', effectId: '82C' }),
            netRegexDe: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Schattenflamme', effectId: '82C' }),
            netRegexFr: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Flamme ombrale', effectId: '82C' }),
            netRegexJa: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'シャドウフレイム', effectId: '82C' }),
            mistake: (_data, matches) => {
                return { type: 'damage', blame: matches.target, text: `${matches.effect} (partial stack)` };
            },
        },
        {
            id: 'E10S Damage Down Boss',
            type: 'GainsEffect',
            // Shackles being messed up appear to just give the Damage Down, with nothing else.
            // Messing up towers is the Thrice-Come Ruin effect (9E2), but also Damage Down.
            // TODO: some of these will be duplicated with others, like `E10S Throne Of Shadow`.
            // Maybe it'd be nice to figure out how to put the damage marker on that?
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Shadowkeeper', effectId: '82C' }),
            netRegexDe: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Schattenkönig', effectId: '82C' }),
            netRegexFr: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Roi De L\'Ombre', effectId: '82C' }),
            netRegexJa: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: '影の王', effectId: '82C' }),
            mistake: (_data, matches) => {
                return { type: 'damage', blame: matches.target, text: `${matches.effect}` };
            },
        },
        {
            // Shadow Warrior 4 dog room cleave
            // This can be mitigated by the whole group, so add a damage condition.
            id: 'E10S Barbs Of Agony',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['572A', '5B27'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e10s = (e10s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11n.ts


const e11n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseAnamorphosis */.Z.EdensPromiseAnamorphosis,
    damageWarn: {
        'E11N Burnt Strike Lightning': '562E',
        'E11N Burnt Strike Fire': '562C',
        'E11N Burnt Strike Holy': '5630',
        'E11N Burnout': '562F',
        'E11N Shining Blade': '5631',
        'E11N Halo Of Flame Brightfire': '563B',
        'E11N Halo Of Levin Brightfire': '563C',
        'E11N Resounding Crack': '564D',
        'E11N Image Burnt Strike Lightning': '5645',
        'E11N Image Burnt Strike Fire': '5643',
        'E11N Image Burnout': '5646',
    },
    damageFail: {
        'E11N Blasting Zone': '563E',
    },
    shareWarn: {
        'E11N Burn Mark': '564F',
    },
    triggers: [
        {
            id: 'E11N Blastburn Knocked Off',
            type: 'Ability',
            // 562D = Burnt Strike fire followup during most of the fight
            // 5644 = same thing, but from Fatebreaker's Image
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['562D', '5644'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e11n = (e11n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11s.ts


// 565A/568D Sinsmoke Bound Of Faith share
// 565E/5699 Bowshock hits target of 565D (twice) and two others
const e11s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseAnamorphosisSavage */.Z.EdensPromiseAnamorphosisSavage,
    damageWarn: {
        'E11S Burnt Strike Fire': '5652',
        'E11S Burnt Strike Lightning': '5654',
        'E11S Burnt Strike Holy': '5656',
        'E11S Shining Blade': '5657',
        'E11S Burnt Strike Cycle Fire': '568E',
        'E11S Burnt Strike Cycle Lightning': '5695',
        'E11S Burnt Strike Cycle Holy': '569D',
        'E11S Shining Blade Cycle': '569E',
        'E11S Halo Of Flame Brightfire': '566D',
        'E11S Halo Of Levin Brightfire': '566C',
        'E11S Portal Of Flame Bright Pulse': '5671',
        'E11S Portal Of Levin Bright Pulse': '5670',
        'E11S Resonant Winds': '5689',
        'E11S Resounding Crack': '5688',
        'E11S Image Burnt Strike Lightning': '567B',
        'E11N Image Burnout': '567C',
        'E11N Image Burnt Strike Fire': '5679',
        'E11N Image Burnt Strike Holy': '567B',
        'E11N Image Shining Blade': '567E',
    },
    damageFail: {
        'E11S Burnout': '5655',
        'E11S Burnout Cycle': '5696',
        'E11S Blasting Zone': '5674',
    },
    shareWarn: {
        'E11S Elemental Break': '5664',
        'E11S Elemental Break Cycle': '568C',
        'E11S Sinsmite': '5667',
        'E11S Sinsmite Cycle': '5694',
    },
    shareFail: {
        'E11S Burn Mark': '56A3',
        'E11S Sinsight 1': '5661',
        'E11S Sinsight 2': '5BC7',
        'E11S Sinsight 3': '56A0',
    },
    soloFail: {
        'E11S Holy Sinsight Group Share': '5669',
    },
    triggers: [
        {
            id: 'E11S Blastburn Knocked Off',
            type: 'Ability',
            // 5653 = Burnt Strike fire followup during most of the fight
            // 567A = same thing, but from Fatebreaker's Image
            // 568F = same thing, but during Cycle of Faith
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5653', '567A', '568F'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e11s = (e11s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12n.ts

const e12n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseEternity */.Z.EdensPromiseEternity,
    damageWarn: {
        'E12N Judgment Jolt Single': '585F',
        'E12N Judgment Jolt': '4E30',
        'E12N Temporary Current Single': '585C',
        'E12N Temporary Current': '4E2D',
        'E12N Conflag Strike Single': '585D',
        'E12N Conflag Strike': '4E2E',
        'E12N Ferostorm Single': '585E',
        'E12N Ferostorm': '4E2F',
        'E12N Rapturous Reach 1': '5878',
        'E12N Rapturous Reach 2': '5877',
        'E12N Bomb Explosion': '586D',
        'E12N Titanic Bomb Explosion': '586F',
    },
    shareWarn: {
        'E12N Earthshaker': '5885',
        'E12N Promise Frigid Stone 1': '5867',
        'E12N Promise Frigid Stone 2': '5869',
    },
};
/* harmony default export */ const e12n = (e12n_triggerSet);

// EXTERNAL MODULE: ./resources/not_reached.ts
var not_reached = __webpack_require__(9509);
// EXTERNAL MODULE: ./resources/outputs.ts
var outputs = __webpack_require__(4970);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12s.ts





// TODO: add separate damageWarn-esque icon for damage downs?
// TODO: 58A6 Under The Weight / 58B2 Classical Sculpture missing somebody in party warning?
// TODO: 58CA Dark Water III / 58C5 Shell Crusher should hit everyone in party
// TODO: Dark Aero III 58D4 should not be a share except on advanced relativity for double aero.
// (for gains effect, single aero = ~23 seconds, double aero = ~31 seconds duration)
// Due to changes introduced in patch 5.2, overhead markers now have a random offset
// added to their ID. This offset currently appears to be set per instance, so
// we can determine what it is from the first overhead marker we see.
// The first 1B marker in the encounter is the formless tankbuster, ID 004F.
const firstHeadmarker = parseInt('00DA', 16);
const getHeadmarkerId = (data, matches) => {
    // If we naively just check !data.decOffset and leave it, it breaks if the first marker is 00DA.
    // (This makes the offset 0, and !0 is true.)
    if (typeof data.decOffset === 'undefined')
        data.decOffset = parseInt(matches.id, 16) - firstHeadmarker;
    // The leading zeroes are stripped when converting back to string, so we re-add them here.
    // Fortunately, we don't have to worry about whether or not this is robust,
    // since we know all the IDs that will be present in the encounter.
    return (parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0');
};
const e12s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseEternitySavage */.Z.EdensPromiseEternitySavage,
    damageWarn: {
        'E12S Promise Rapturous Reach Left': '58AD',
        'E12S Promise Rapturous Reach Right': '58AE',
        'E12S Promise Temporary Current': '4E44',
        'E12S Promise Conflag Strike': '4E45',
        'E12S Promise Ferostorm': '4E46',
        'E12S Promise Judgment Jolt': '4E47',
        'E12S Promise Shatter': '589C',
        'E12S Promise Impact': '58A1',
        'E12S Oracle Dark Blizzard III': '58D3',
        'E12S Oracle Apocalypse': '58E6',
    },
    damageFail: {
        'E12S Oracle Maelstrom': '58DA',
    },
    gainsEffectFail: {
        'E12S Oracle Doom': '9D4',
    },
    shareWarn: {
        'E12S Promise Frigid Stone': '589E',
        'E12S Oracle Darkest Dance': '4E33',
        'E12S Oracle Dark Current': '58D8',
        'E12S Oracle Spirit Taker': '58C6',
        'E12S Oracle Somber Dance 1': '58BF',
        'E12S Oracle Somber Dance 2': '58C0',
    },
    shareFail: {
        'E12S Promise Weight Of The World': '58A5',
        'E12S Promise Pulse Of The Land': '58A3',
        'E12S Oracle Dark Eruption 1': '58CE',
        'E12S Oracle Dark Eruption 2': '58CD',
        'E12S Oracle Black Halo': '58C7',
    },
    soloWarn: {
        'E12S Promise Force Of The Land': '58A4',
    },
    triggers: [
        {
            // Big circle ground aoes during Shiva junction.
            // This can be shielded through as long as that person doesn't stack.
            id: 'E12S Icicle Impact',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4E5A', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'E12S Headmarker',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({}),
            run: (data, matches) => {
                var _a;
                const id = getHeadmarkerId(data, matches);
                const firstLaserMarker = '0091';
                const lastLaserMarker = '0098';
                if (id >= firstLaserMarker && id <= lastLaserMarker) {
                    // ids are sequential: #1 square, #2 square, #3 square, #4 square, #1 triangle etc
                    const decOffset = parseInt(id, 16) - parseInt(firstLaserMarker, 16);
                    // decOffset is 0-7, so map 0-3 to 1-4 and 4-7 to 1-4.
                    (_a = data.laserNameToNum) !== null && _a !== void 0 ? _a : (data.laserNameToNum = {});
                    data.laserNameToNum[matches.target] = decOffset % 4 + 1;
                }
            },
        },
        {
            // These sculptures are added at the start of the fight, so we need to check where they
            // use the "Classical Sculpture" ability and end up on the arena for real.
            id: 'E12S Promise Chiseled Sculpture Classical Sculpture',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Chiseled Sculpture', id: '58B2' }),
            run: (data, matches) => {
                var _a;
                // This will run per person that gets hit by the same sculpture, but that's fine.
                // Record the y position of each sculpture so we can use it for better text later.
                (_a = data.sculptureYPositions) !== null && _a !== void 0 ? _a : (data.sculptureYPositions = {});
                data.sculptureYPositions[matches.sourceId.toUpperCase()] = parseFloat(matches.y);
            },
        },
        {
            // The source of the tether is the player, the target is the sculpture.
            id: 'E12S Promise Chiseled Sculpture Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ target: 'Chiseled Sculpture', id: '0011' }),
            run: (data, matches) => {
                var _a;
                (_a = data.sculptureTetherNameToId) !== null && _a !== void 0 ? _a : (data.sculptureTetherNameToId = {});
                data.sculptureTetherNameToId[matches.source] = matches.targetId.toUpperCase();
            },
        },
        {
            id: 'E12S Promise Blade Of Flame Counter',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ source: 'Chiseled Sculpture', id: '58B3' }),
            delaySeconds: 1,
            suppressSeconds: 1,
            run: (data) => {
                data.bladeOfFlameCount = data.bladeOfFlameCount || 0;
                data.bladeOfFlameCount++;
            },
        },
        {
            // This is the Chiseled Sculpture laser with the limit cut dots.
            id: 'E12S Promise Blade Of Flame',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ type: '22', source: 'Chiseled Sculpture', id: '58B3' }),
            mistake: (data, matches) => {
                if (!data.laserNameToNum || !data.sculptureTetherNameToId || !data.sculptureYPositions)
                    return;
                // Find the person who has this laser number and is tethered to this statue.
                const number = (data.bladeOfFlameCount || 0) + 1;
                const sourceId = matches.sourceId.toUpperCase();
                const names = Object.keys(data.laserNameToNum);
                const withNum = names.filter((name) => { var _a; return ((_a = data.laserNameToNum) === null || _a === void 0 ? void 0 : _a[name]) === number; });
                const owners = withNum.filter((name) => { var _a; return ((_a = data.sculptureTetherNameToId) === null || _a === void 0 ? void 0 : _a[name]) === sourceId; });
                // if some logic error, just abort.
                if (owners.length !== 1)
                    return;
                // The owner hitting themselves isn't a mistake...technically.
                if (owners[0] === matches.target)
                    return;
                // Now try to figure out which statue is which.
                // People can put these wherever.  They could go sideways, or diagonal, or whatever.
                // It seems mooooost people put these north / south (on the south edge of the arena).
                // Let's say a minimum of 2 yalms apart in the y direction to consider them "north/south".
                const minimumYalmsForStatues = 2;
                let isStatuePositionKnown = false;
                let isStatueNorth = false;
                const sculptureIds = Object.keys(data.sculptureYPositions);
                if (sculptureIds.length === 2 && sculptureIds.includes(sourceId)) {
                    const otherId = sculptureIds[0] === sourceId ? sculptureIds[1] : sculptureIds[0];
                    const sourceY = data.sculptureYPositions[sourceId];
                    const otherY = data.sculptureYPositions[otherId !== null && otherId !== void 0 ? otherId : ''];
                    if (sourceY === undefined || otherY === undefined || otherId === undefined)
                        throw new not_reached/* UnreachableCode */.$();
                    const yDiff = Math.abs(sourceY - otherY);
                    if (yDiff > minimumYalmsForStatues) {
                        isStatuePositionKnown = true;
                        isStatueNorth = sourceY < otherY;
                    }
                }
                const owner = owners[0];
                const ownerNick = data.ShortName(owner);
                let text = {
                    en: `${matches.ability} (from ${ownerNick}, #${number})`,
                    de: `${matches.ability} (von ${ownerNick}, #${number})`,
                    ja: `${matches.ability} (${ownerNick}から、#${number})`,
                    cn: `${matches.ability} (来自${ownerNick}，#${number})`,
                    ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번)`,
                };
                if (isStatuePositionKnown && isStatueNorth) {
                    text = {
                        en: `${matches.ability} (from ${ownerNick}, #${number} north)`,
                        de: `${matches.ability} (von ${ownerNick}, #${number} norden)`,
                        ja: `${matches.ability} (北の${ownerNick}から、#${number})`,
                        cn: `${matches.ability} (来自北方${ownerNick}，#${number})`,
                        ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번 북쪽)`,
                    };
                }
                else if (isStatuePositionKnown && !isStatueNorth) {
                    text = {
                        en: `${matches.ability} (from ${ownerNick}, #${number} south)`,
                        de: `${matches.ability} (von ${ownerNick}, #${number} Süden)`,
                        ja: `${matches.ability} (南の${ownerNick}から、#${number})`,
                        cn: `${matches.ability} (来自南方${ownerNick}，#${number})`,
                        ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번 남쪽)`,
                    };
                }
                return {
                    type: 'fail',
                    name: matches.target,
                    blame: owner,
                    text: text,
                };
            },
        },
        {
            id: 'E12S Promise Ice Pillar Tracker',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Ice Pillar', id: ['0001', '0039'] }),
            run: (data, matches) => {
                var _a;
                (_a = data.pillarIdToOwner) !== null && _a !== void 0 ? _a : (data.pillarIdToOwner = {});
                data.pillarIdToOwner[matches.sourceId] = matches.target;
            },
        },
        {
            id: 'E12S Promise Ice Pillar Mistake',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ source: 'Ice Pillar', id: '589B' }),
            condition: (data, matches) => {
                if (!data.pillarIdToOwner)
                    return false;
                return matches.target !== data.pillarIdToOwner[matches.sourceId];
            },
            mistake: (data, matches) => {
                var _a;
                const pillarOwner = data.ShortName((_a = data.pillarIdToOwner) === null || _a === void 0 ? void 0 : _a[matches.sourceId]);
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (from ${pillarOwner})`,
                        de: `${matches.ability} (von ${pillarOwner})`,
                        fr: `${matches.ability} (de ${pillarOwner})`,
                        ja: `${matches.ability} (${pillarOwner}から)`,
                        cn: `${matches.ability} (来自${pillarOwner})`,
                        ko: `${matches.ability} (대상자 "${pillarOwner}")`,
                    },
                };
            },
        },
        {
            id: 'E12S Promise Gain Fire Resistance Down II',
            type: 'GainsEffect',
            // The Beastly Sculpture gives a 3 second debuff, the Regal Sculpture gives a 14s one.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '832' }),
            run: (data, matches) => {
                var _a;
                (_a = data.fire) !== null && _a !== void 0 ? _a : (data.fire = {});
                data.fire[matches.target] = true;
            },
        },
        {
            id: 'E12S Promise Lose Fire Resistance Down II',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '832' }),
            run: (data, matches) => {
                var _a;
                (_a = data.fire) !== null && _a !== void 0 ? _a : (data.fire = {});
                data.fire[matches.target] = false;
            },
        },
        {
            id: 'E12S Promise Small Lion Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Beastly Sculpture', id: '0011' }),
            netRegexDe: netregexes/* default.tether */.Z.tether({ source: 'Abbild Eines Löwen', id: '0011' }),
            netRegexFr: netregexes/* default.tether */.Z.tether({ source: 'Création Léonine', id: '0011' }),
            netRegexJa: netregexes/* default.tether */.Z.tether({ source: '創られた獅子', id: '0011' }),
            run: (data, matches) => {
                var _a, _b;
                (_a = data.smallLionIdToOwner) !== null && _a !== void 0 ? _a : (data.smallLionIdToOwner = {});
                data.smallLionIdToOwner[matches.sourceId.toUpperCase()] = matches.target;
                (_b = data.smallLionOwners) !== null && _b !== void 0 ? _b : (data.smallLionOwners = []);
                data.smallLionOwners.push(matches.target);
            },
        },
        {
            id: 'E12S Promise Small Lion Lionsblaze',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Beastly Sculpture', id: '58B9' }),
            netRegexDe: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Abbild Eines Löwen', id: '58B9' }),
            netRegexFr: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Création Léonine', id: '58B9' }),
            netRegexJa: netregexes/* default.abilityFull */.Z.abilityFull({ source: '創られた獅子', id: '58B9' }),
            mistake: (data, matches) => {
                var _a;
                // Folks baiting the big lion second can take the first small lion hit,
                // so it's not sufficient to check only the owner.
                if (!data.smallLionOwners)
                    return;
                const owner = (_a = data.smallLionIdToOwner) === null || _a === void 0 ? void 0 : _a[matches.sourceId.toUpperCase()];
                if (!owner)
                    return;
                if (matches.target === owner)
                    return;
                // If the target also has a small lion tether, that is always a mistake.
                // Otherwise, it's only a mistake if the target has a fire debuff.
                const hasSmallLion = data.smallLionOwners.includes(matches.target);
                const hasFireDebuff = data.fire && data.fire[matches.target];
                if (hasSmallLion || hasFireDebuff) {
                    const ownerNick = data.ShortName(owner);
                    const centerY = -75;
                    const x = parseFloat(matches.x);
                    const y = parseFloat(matches.y);
                    let dirObj = null;
                    if (y < centerY) {
                        if (x > 0)
                            dirObj = outputs/* default.dirNE */.Z.dirNE;
                        else
                            dirObj = outputs/* default.dirNW */.Z.dirNW;
                    }
                    else {
                        if (x > 0)
                            dirObj = outputs/* default.dirSE */.Z.dirSE;
                        else
                            dirObj = outputs/* default.dirSW */.Z.dirSW;
                    }
                    return {
                        type: 'fail',
                        blame: owner,
                        name: matches.target,
                        text: {
                            en: `${matches.ability} (from ${ownerNick}, ${dirObj['en']})`,
                            de: `${matches.ability} (von ${ownerNick}, ${dirObj['de']})`,
                            fr: `${matches.ability} (de ${ownerNick}, ${dirObj['fr']})`,
                            ja: `${matches.ability} (${ownerNick}から, ${dirObj['ja']})`,
                            cn: `${matches.ability} (来自${ownerNick}, ${dirObj['cn']}`,
                            ko: `${matches.ability} (대상자 "${ownerNick}", ${dirObj['ko']})`,
                        },
                    };
                }
            },
        },
        {
            id: 'E12S Promise North Big Lion',
            type: 'AddedCombatant',
            netRegex: netregexes/* default.addedCombatantFull */.Z.addedCombatantFull({ name: 'Regal Sculpture' }),
            run: (data, matches) => {
                const y = parseFloat(matches.y);
                const centerY = -75;
                if (y < centerY)
                    data.northBigLion = matches.id.toUpperCase();
            },
        },
        {
            id: 'E12S Promise Big Lion Kingsblaze',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ source: 'Regal Sculpture', id: '4F9E' }),
            netRegexDe: netregexes/* default.ability */.Z.ability({ source: 'Abbild eines großen Löwen', id: '4F9E' }),
            netRegexFr: netregexes/* default.ability */.Z.ability({ source: 'création léonine royale', id: '4F9E' }),
            netRegexJa: netregexes/* default.ability */.Z.ability({ source: '創られた獅子王', id: '4F9E' }),
            mistake: (data, matches) => {
                var _a, _b, _c, _d;
                const singleTarget = matches.type === '21';
                const hasFireDebuff = data.fire && data.fire[matches.target];
                // Success if only one person takes it and they have no fire debuff.
                if (singleTarget && !hasFireDebuff)
                    return;
                const northBigLion = {
                    en: 'north big lion',
                    de: 'Nordem, großer Löwe',
                    ja: '大ライオン(北)',
                    cn: '北方大狮子',
                    ko: '북쪽 큰 사자',
                };
                const southBigLion = {
                    en: 'south big lion',
                    de: 'Süden, großer Löwe',
                    ja: '大ライオン(南)',
                    cn: '南方大狮子',
                    ko: '남쪽 큰 사자',
                };
                const shared = {
                    en: 'shared',
                    de: 'geteilt',
                    ja: '重ねた',
                    cn: '重叠',
                    ko: '같이 맞음',
                };
                const fireDebuff = {
                    en: 'had fire',
                    de: 'hatte Feuer',
                    ja: '炎付き',
                    cn: '火Debuff',
                    ko: '화염 디버프 받음',
                };
                const labels = [];
                const lang = data.options.ParserLanguage;
                if (data.northBigLion) {
                    if (data.northBigLion === matches.sourceId)
                        labels.push((_a = northBigLion[lang]) !== null && _a !== void 0 ? _a : northBigLion['en']);
                    else
                        labels.push((_b = southBigLion[lang]) !== null && _b !== void 0 ? _b : southBigLion['en']);
                }
                if (!singleTarget)
                    labels.push((_c = shared[lang]) !== null && _c !== void 0 ? _c : shared['en']);
                if (hasFireDebuff)
                    labels.push((_d = fireDebuff[lang]) !== null && _d !== void 0 ? _d : fireDebuff['en']);
                return {
                    type: 'fail',
                    name: matches.target,
                    text: `${matches.ability} (${labels.join(', ')})`,
                };
            },
        },
        {
            id: 'E12S Knocked Off',
            type: 'Ability',
            // 589A = Ice Pillar (promise shiva phase)
            // 58B6 = Palm Of Temperance (promise statue hand)
            // 58B7 = Laser Eye (promise lion phase)
            // 58C1 = Darkest Dance (oracle tank jump + knockback in beginning and triple apoc)
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['589A', '58B6', '58B7', '58C1'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
        {
            id: 'E12S Oracle Shadoweye',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '58D2', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e12s = (e12s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon-ex.ts


// TODO: warning for taking Diamond Flash (5FA1) stack on your own?
// Diamond Weapon Extreme
const diamond_weapon_ex_triggerSet = {
    zoneId: zone_id/* default.TheCloudDeckExtreme */.Z.TheCloudDeckExtreme,
    damageWarn: {
        'DiamondEx Auri Arts 1': '5FAF',
        'DiamondEx Auri Arts 2': '5FB2',
        'DiamondEx Auri Arts 3': '5FCD',
        'DiamondEx Auri Arts 4': '5FCE',
        'DiamondEx Auri Arts 5': '5FCF',
        'DiamondEx Auri Arts 6': '5FF8',
        'DiamondEx Auri Arts 7': '6159',
        'DiamondEx Articulated Bit Aetherial Bullet': '5FAB',
        'DiamondEx Diamond Shrapnel 1': '5FCB',
        'DiamondEx Diamond Shrapnel 2': '5FCC',
    },
    damageFail: {
        'DiamondEx Claw Swipe Left': '5FC2',
        'DiamondEx Claw Swipe Right': '5FC3',
        'DiamondEx Auri Cyclone 1': '5FD1',
        'DiamondEx Auri Cyclone 2': '5FD2',
        'DiamondEx Airship\'s Bane 1': '5FFE',
        'DiamondEx Airship\'s Bane 2': '5FD3',
    },
    shareWarn: {
        'DiamondEx Tank Lasers': '5FC8',
        'DiamondEx Homing Laser': '5FC4',
    },
    shareFail: {
        'DiamondEx Flood Ray': '5FC7',
    },
    triggers: [
        {
            id: 'DiamondEx Vertical Cleave Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5FD0' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const diamond_weapon_ex = (diamond_weapon_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon.ts


// Diamond Weapon Normal
const diamond_weapon_triggerSet = {
    zoneId: zone_id/* default.TheCloudDeck */.Z.TheCloudDeck,
    damageWarn: {
        'Diamond Weapon Auri Arts': '5FE3',
        'Diamond Weapon Diamond Shrapnel Initial': '5FE1',
        'Diamond Weapon Diamond Shrapnel Chasing': '5FE2',
        'Diamond Weapon Aetherial Bullet': '5FD5',
    },
    damageFail: {
        'Diamond Weapon Claw Swipe Left': '5FD9',
        'Diamond Weapon Claw Swipe Right': '5FDA',
        'Diamond Weapon Auri Cyclone 1': '5FE6',
        'Diamond Weapon Auri Cyclone 2': '5FE7',
        'Diamond Weapon Airship\'s Bane 1': '5FE8',
        'Diamond Weapon Airship\'s Bane 2': '5FFE',
    },
    shareWarn: {
        'Diamond Weapon Homing Laser': '5FDB',
    },
    triggers: [
        {
            id: 'Diamond Weapon Vertical Cleave Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5FE5' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const diamond_weapon = (diamond_weapon_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon-ex.ts

const emerald_weapon_ex_triggerSet = {
    zoneId: zone_id/* default.CastrumMarinumExtreme */.Z.CastrumMarinumExtreme,
    damageWarn: {
        'EmeraldEx Heat Ray': '5BD3',
        'EmeraldEx Photon Laser 1': '557B',
        'EmeraldEx Photon Laser 2': '557D',
        'EmeraldEx Heat Ray 1': '557A',
        'EmeraldEx Heat Ray 2': '5579',
        'EmeraldEx Explosion': '5596',
        'EmeraldEx Tertius Terminus Est Initial': '55CD',
        'EmeraldEx Tertius Terminus Est Explosion': '55CE',
        'EmeraldEx Airborne Explosion': '55BD',
        'EmeraldEx Sidescathe 1': '55D4',
        'EmeraldEx Sidescathe 2': '55D5',
        'EmeraldEx Shots Fired': '55B7',
        'EmeraldEx Secundus Terminus Est': '55CB',
        'EmeraldEx Expire': '55D1',
        'EmeraldEx Aire Tam Storm': '55D0',
    },
    shareWarn: {
        'EmeraldEx Divide Et Impera': '55D9',
        'EmeraldEx Primus Terminus Est 1': '55C4',
        'EmeraldEx Primus Terminus Est 2': '55C5',
        'EmeraldEx Primus Terminus Est 3': '55C6',
        'EmeraldEx Primus Terminus Est 4': '55C7',
    },
};
/* harmony default export */ const emerald_weapon_ex = (emerald_weapon_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon.ts


const emerald_weapon_triggerSet = {
    zoneId: zone_id/* default.CastrumMarinum */.Z.CastrumMarinum,
    damageWarn: {
        'Emerald Weapon Heat Ray': '4F9D',
        'Emerald Weapon Photon Laser 1': '5534',
        'Emerald Weapon Photon Laser 2': '5536',
        'Emerald Weapon Photon Laser 3': '5538',
        'Emerald Weapon Heat Ray 1': '5532',
        'Emerald Weapon Heat Ray 2': '5533',
        'Emerald Weapon Magnetic Mine Explosion': '5B04',
        'Emerald Weapon Sidescathe 1': '553F',
        'Emerald Weapon Sidescathe 2': '5540',
        'Emerald Weapon Sidescathe 3': '5541',
        'Emerald Weapon Sidescathe 4': '5542',
        'Emerald Weapon Bit Storm': '554A',
        'Emerald Weapon Emerald Crusher': '553C',
        'Emerald Weapon Pulse Laser': '5548',
        'Emerald Weapon Energy Aetheroplasm': '5551',
        'Emerald Weapon Divide Et Impera Ground': '556F',
        'Emerald Weapon Primus Terminus Est': '4B3E',
        'Emerald Weapon Secundus Terminus Est': '556A',
        'Emerald Weapon Tertius Terminus Est': '556D',
        'Emerald Weapon Shots Fired': '555F',
    },
    shareWarn: {
        'Emerald Weapon Divide Et Impera P1': '554E',
        'Emerald Weapon Divide Et Impera P2': '5570',
    },
    triggers: [
        {
            id: 'Emerald Weapon Emerald Crusher Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '553E' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
        {
            // Getting knocked into a wall from the arrow headmarker.
            id: 'Emerald Weapon Primus Terminus Est Wall',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5563', '5564'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Pushed into wall',
                        de: 'Rückstoß in die Wand',
                        ja: '壁へノックバック',
                        cn: '击退至墙',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const emerald_weapon = (emerald_weapon_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/hades-ex.ts



// Hades Ex
const hades_ex_triggerSet = {
    zoneId: zone_id/* default.TheMinstrelsBalladHadessElegy */.Z.TheMinstrelsBalladHadessElegy,
    damageWarn: {
        'HadesEx Shadow Spread 2': '47AA',
        'HadesEx Shadow Spread 3': '47E4',
        'HadesEx Shadow Spread 4': '47E5',
        // Everybody stacks in good faith for Bad Faith, so don't call it a mistake.
        // 'HadesEx Bad Faith 1': '47AD',
        // 'HadesEx Bad Faith 2': '47B0',
        // 'HadesEx Bad Faith 3': '47AE',
        // 'HadesEx Bad Faith 4': '47AF',
        'HadesEx Broken Faith': '47B2',
        'HadesEx Magic Spear': '47B6',
        'HadesEx Magic Chakram': '47B5',
        'HadesEx Forked Lightning': '47C9',
        'HadesEx Dark Current 1': '47F1',
        'HadesEx Dark Current 2': '47F2',
    },
    damageFail: {
        'HadesEx Comet': '47B9',
        'HadesEx Ancient Eruption': '47D3',
        'HadesEx Purgation 1': '47EC',
        'HadesEx Purgation 2': '47ED',
        'HadesEx Shadow Stream': '47EA',
        'HadesEx Dead Space': '47EE',
    },
    shareWarn: {
        'HadesEx Shadow Spread Initial': '47A9',
        'HadesEx Ravenous Assault': '(?:47A6|47A7)',
        'HadesEx Dark Flame 1': '47C6',
        'HadesEx Dark Freeze 1': '47C4',
        'HadesEx Dark Freeze 2': '47DF',
    },
    triggers: [
        {
            id: 'HadesEx Dark II Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Shadow of the Ancients', id: '0011' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDark) !== null && _a !== void 0 ? _a : (data.hasDark = []);
                data.hasDark.push(matches.target);
            },
        },
        {
            id: 'HadesEx Dark II',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ type: '22', id: '47BA', ...oopsy_common/* playerDamageFields */.np }),
            // Don't blame people who don't have tethers.
            condition: (data, matches) => data.hasDark && data.hasDark.includes(matches.target),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'HadesEx Boss Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: ['Igeyorhm\'s Shade', 'Lahabrea\'s Shade'], id: '000E', capture: false }),
            mistake: {
                type: 'warn',
                text: {
                    en: 'Bosses Too Close',
                    de: 'Bosses zu Nahe',
                    fr: 'Boss trop proches',
                    ja: 'ボス近すぎる',
                    cn: 'BOSS靠太近了',
                    ko: '쫄들이 너무 가까움',
                },
            },
        },
        {
            id: 'HadesEx Death Shriek',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '47CB', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'HadesEx Beyond Death Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = true;
            },
        },
        {
            id: 'HadesEx Beyond Death Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = false;
            },
        },
        {
            id: 'HadesEx Beyond Death',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasBeyondDeath)
                    return;
                if (!data.hasBeyondDeath[matches.target])
                    return;
                return {
                    name: matches.target,
                    reason: matches.effect,
                };
            },
        },
        {
            id: 'HadesEx Doom Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '6E9' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = true;
            },
        },
        {
            id: 'HadesEx Doom Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '6E9' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = false;
            },
        },
        {
            id: 'HadesEx Doom',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '6E9' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasDoom)
                    return;
                if (!data.hasDoom[matches.target])
                    return;
                return {
                    name: matches.target,
                    reason: matches.effect,
                };
            },
        },
    ],
};
/* harmony default export */ const hades_ex = (hades_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/hades.ts

// Hades Normal
const hades_triggerSet = {
    zoneId: zone_id/* default.TheDyingGasp */.Z.TheDyingGasp,
    damageWarn: {
        'Hades Bad Faith 1': '414B',
        'Hades Bad Faith 2': '414C',
        'Hades Dark Eruption': '4152',
        'Hades Shadow Spread 1': '4156',
        'Hades Shadow Spread 2': '4157',
        'Hades Broken Faith': '414E',
        'Hades Hellborn Yawp': '416F',
        'Hades Purgation': '4172',
        'Hades Shadow Stream': '415C',
        'Hades Aero': '4595',
        'Hades Echo 1': '4163',
        'Hades Echo 2': '4164',
    },
    shareFail: {
        'Hades Nether Blast': '4163',
        'Hades Ravenous Assault': '4158',
        'Hades Ancient Darkness': '4593',
        'Hades Dual Strike': '4162',
    },
};
/* harmony default export */ const hades = (hades_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/innocence-ex.ts

// Innocence Extreme
const innocence_ex_triggerSet = {
    zoneId: zone_id/* default.TheCrownOfTheImmaculateExtreme */.Z.TheCrownOfTheImmaculateExtreme,
    damageWarn: {
        'InnoEx Duel Descent': '3ED2',
        'InnoEx Reprobation 1': '3EE0',
        'InnoEx Reprobation 2': '3ECC',
        'InnoEx Sword of Condemnation 1': '3EDE',
        'InnoEx Sword of Condemnation 2': '3EDF',
        'InnoEx Dream of the Rood 1': '3ED3',
        'InnoEx Dream of the Rood 2': '3ED4',
        'InnoEx Dream of the Rood 3': '3ED5',
        'InnoEx Dream of the Rood 4': '3ED6',
        'InnoEx Dream of the Rood 5': '3EFB',
        'InnoEx Dream of the Rood 6': '3EFC',
        'InnoEx Dream of the Rood 7': '3EFD',
        'InnoEx Dream of the Rood 8': '3EFE',
        'InnoEx Holy Trinity': '3EDB',
        'InnoEx Soul and Body 1': '3ED7',
        'InnoEx Soul and Body 2': '3ED8',
        'InnoEx Soul and Body 3': '3ED9',
        'InnoEx Soul and Body 4': '3EDA',
        'InnoEx Soul and Body 5': '3EFF',
        'InnoEx Soul and Body 6': '3F00',
        'InnoEx Soul and Body 7': '3F01',
        'InnoEx Soul and Body 8': '3F02',
        'InnoEx God Ray 1': '3EE6',
        'InnoEx God Ray 2': '3EE7',
        'InnoEx God Ray 3': '3EE8',
        'InnoEx Explosion': '3EF0',
    },
};
/* harmony default export */ const innocence_ex = (innocence_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/innocence.ts

// Innocence Normal
const innocence_triggerSet = {
    zoneId: zone_id/* default.TheCrownOfTheImmaculate */.Z.TheCrownOfTheImmaculate,
    damageWarn: {
        'Inno Daybreak': '3E9D',
        'Inno Holy Trinity': '3EB3',
        'Inno Reprobation 1': '3EB6',
        'Inno Reprobation 2': '3EB8',
        'Inno Reprobation 3': '3ECB',
        'Inno Reprobation 4': '3EB7',
        'Inno Soul and Body 1': '3EB1',
        'Inno Soul and Body 2': '3EB2',
        'Inno Soul and Body 3': '3EF9',
        'Inno Soul and Body 4': '3EFA',
        'Inno God Ray 1': '3EBD',
        'Inno God Ray 2': '3EBE',
        'Inno God Ray 3': '3EBF',
        'Inno God Ray 4': '3EC0',
    },
};
/* harmony default export */ const innocence = (innocence_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/levi-un.ts


// It's hard to capture the reflection abilities from Leviathan's Head and Tail if you use
// ranged physical attacks / magic attacks respectively, as the ability names are the
// ability you used and don't appear to show up in the log as normal "ability" lines.
// That said, dots still tick independently on both so it's likely that people will atack
// them anyway.
// TODO: Figure out why Dread Tide / Waterspout appear like shares (i.e. 0x16 id).
// Dread Tide = 5CCA/5CCB/5CCC, Waterspout = 5CD1
// Leviathan Unreal
const levi_un_triggerSet = {
    zoneId: zone_id/* default.TheWhorleaterUnreal */.Z.TheWhorleaterUnreal,
    damageWarn: {
        'LeviUn Grand Fall': '5CDF',
        'LeviUn Hydroshot': '5CD5',
        'LeviUn Dreadstorm': '5CD6',
    },
    damageFail: {
        'LeviUn Body Slam': '5CD2',
        'LeviUn Spinning Dive 1': '5CDB',
        'LeviUn Spinning Dive 2': '5CE3',
        'LeviUn Spinning Dive 3': '5CE8',
        'LeviUn Spinning Dive 4': '5CE9',
    },
    gainsEffectWarn: {
        'LeviUn Dropsy': '110',
    },
    gainsEffectFail: {
        'LeviUn Hysteria': '128',
    },
    triggers: [
        {
            id: 'LeviUn Body Slam Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5CD2' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const levi_un = (levi_un_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon-ex.ts


// TODO: taking two different High-Powered Homing Lasers (4AD8)
// TODO: could blame the tethered player for White Agony / White Fury failures?
// Ruby Weapon Extreme
const ruby_weapon_ex_triggerSet = {
    zoneId: zone_id/* default.CinderDriftExtreme */.Z.CinderDriftExtreme,
    damageWarn: {
        'RubyEx Ruby Bit Magitek Ray': '4AD2',
        'RubyEx Spike Of Flame 1': '4AD3',
        'RubyEx Spike Of Flame 2': '4B2F',
        'RubyEx Spike Of Flame 3': '4D04',
        'RubyEx Spike Of Flame 4': '4D05',
        'RubyEx Spike Of Flame 5': '4ACD',
        'RubyEx Spike Of Flame 6': '4ACE',
        'RubyEx Undermine': '4AD0',
        'RubyEx Ruby Ray': '4B02',
        'RubyEx Ravensflight 1': '4AD9',
        'RubyEx Ravensflight 2': '4ADA',
        'RubyEx Ravensflight 3': '4ADD',
        'RubyEx Ravensflight 4': '4ADE',
        'RubyEx Ravensflight 5': '4ADF',
        'RubyEx Ravensflight 6': '4AE0',
        'RubyEx Ravensflight 7': '4AE1',
        'RubyEx Ravensflight 8': '4AE2',
        'RubyEx Ravensflight 9': '4AE3',
        'RubyEx Ravensflight 10': '4AE4',
        'RubyEx Ravensflight 11': '4AE5',
        'RubyEx Ravensflight 12': '4AE6',
        'RubyEx Ravensflight 13': '4AE7',
        'RubyEx Ravensflight 14': '4AE8',
        'RubyEx Ravensflight 15': '4AE9',
        'RubyEx Ravensflight 16': '4AEA',
        'RubyEx Ravensflight 17': '4E6B',
        'RubyEx Ravensflight 18': '4E6C',
        'RubyEx Ravensflight 19': '4E6D',
        'RubyEx Ravensflight 20': '4E6E',
        'RubyEx Ravensflight 21': '4E6F',
        'RubyEx Ravensflight 22': '4E70',
        'RubyEx Cut And Run 1': '4B05',
        'RubyEx Cut And Run 2': '4B06',
        'RubyEx Cut And Run 3': '4B07',
        'RubyEx Cut And Run 4': '4B08',
        'RubyEx Cut And Run 5': '4DOD',
        'RubyEx Meteor Burst': '4AF2',
        'RubyEx Bradamante': '4E38',
        'RubyEx Comet Heavy Impact': '4AF6',
    },
    damageFail: {
        'RubyEx Ruby Sphere Burst': '4ACB',
        'RubyEx Lunar Dynamo': '4EB0',
        'RubyEx Iron Chariot': '4EB1',
        'RubyEx Heart In The Machine': '4AFA',
    },
    gainsEffectFail: {
        'RubyEx Hysteria': '128',
    },
    shareWarn: {
        'RubyEx Homing Lasers': '4AD6',
        'RubyEx Meteor Stream': '4E68',
    },
    triggers: [
        {
            id: 'RubyEx Screech',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4AEE' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    reason: {
                        en: 'Knocked into wall',
                        de: 'Rückstoß in die Wand',
                        ja: '壁へノックバック',
                        cn: '击退至墙',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const ruby_weapon_ex = (ruby_weapon_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon.ts

// Ruby Normal
const ruby_weapon_triggerSet = {
    zoneId: zone_id/* default.CinderDrift */.Z.CinderDrift,
    damageWarn: {
        'Ruby Ravensclaw': '4A93',
        'Ruby Spike Of Flame 1': '4A9A',
        'Ruby Spike Of Flame 2': '4B2E',
        'Ruby Spike Of Flame 3': '4A94',
        'Ruby Spike Of Flame 4': '4A95',
        'Ruby Spike Of Flame 5': '4D02',
        'Ruby Spike Of Flame 6': '4D03',
        'Ruby Ruby Ray': '4AC6',
        'Ruby Undermine': '4A97',
        'Ruby Ravensflight 1': '4E69',
        'Ruby Ravensflight 2': '4E6A',
        'Ruby Ravensflight 3': '4AA1',
        'Ruby Ravensflight 4': '4AA2',
        'Ruby Ravensflight 5': '4AA3',
        'Ruby Ravensflight 6': '4AA4',
        'Ruby Ravensflight 7': '4AA5',
        'Ruby Ravensflight 8': '4AA6',
        'Ruby Ravensflight 9': '4AA7',
        'Ruby Ravensflight 10': '4C21',
        'Ruby Ravensflight 11': '4C2A',
        'Ruby Comet Burst': '4AB4',
        'Ruby Bradamante': '4ABC',
    },
    shareWarn: {
        'Ruby Homing Laser': '4AC5',
        'Ruby Meteor Stream': '4E67',
    },
};
/* harmony default export */ const ruby_weapon = (ruby_weapon_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/shiva-un.ts


// Shiva Unreal
const shiva_un_triggerSet = {
    zoneId: zone_id/* default.TheAkhAfahAmphitheatreUnreal */.Z.TheAkhAfahAmphitheatreUnreal,
    damageWarn: {
        // Large white circles.
        'ShivaEx Icicle Impact': '537B',
        // "get in" aoe
        'ShivaEx Whiteout': '5376',
        // Avoidable tank stun.
        'ShivaEx Glacier Bash': '5375',
    },
    damageFail: {
        // 270 degree attack.
        'ShivaEx Glass Dance': '5378',
    },
    shareWarn: {
        // Hailstorm spread marker.
        'ShivaEx Hailstorm': '536F',
    },
    shareFail: {
        // Laser.  TODO: maybe blame the person it's on??
        'ShivaEx Avalanche': '5379',
    },
    soloWarn: {
        // Party shared tank buster.
        'ShivaEx Icebrand': '5373',
    },
    triggers: [
        {
            id: 'ShivaEx Deep Freeze',
            type: 'GainsEffect',
            // Shiva also uses ability 537A on you, but it has an unknown name.
            // So, use the effect instead for free translation.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1E7' }),
            condition: (_data, matches) => {
                // The intermission also gets this effect, but for a shorter duration.
                return parseFloat(matches.duration) > 20;
            },
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const shiva_un = (shiva_un_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titania.ts

const titania_triggerSet = {
    zoneId: zone_id/* default.TheDancingPlague */.Z.TheDancingPlague,
    damageWarn: {
        'Titania Wood\'s Embrace': '3D50',
        // 'Titania Frost Rune': '3D4E',
        'Titania Gentle Breeze': '3F83',
        'Titania Leafstorm 1': '3D55',
        'Titania Puck\'s Rebuke': '3D58',
        'Titania Leafstorm 2': '3E03',
    },
    damageFail: {
        'Titania Phantom Rune 1': '3D5D',
        'Titania Phantom Rune 2': '3D5E',
    },
    shareFail: {
        'Titania Divination Rune': '3D5B',
    },
};
/* harmony default export */ const titania = (titania_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titania-ex.ts

const titania_ex_triggerSet = {
    zoneId: zone_id/* default.TheDancingPlagueExtreme */.Z.TheDancingPlagueExtreme,
    damageWarn: {
        'TitaniaEx Wood\'s Embrace': '3D2F',
        // 'TitaniaEx Frost Rune': '3D2B',
        'TitaniaEx Gentle Breeze': '3F82',
        'TitaniaEx Leafstorm 1': '3D39',
        'TitaniaEx Puck\'s Rebuke': '3D43',
        'TitaniaEx Wallop': '3D3B',
        'TitaniaEx Leafstorm 2': '3D49',
    },
    damageFail: {
        'TitaniaEx Phantom Rune 1': '3D4C',
        'TitaniaEx Phantom Rune 2': '3D4D',
    },
    shareFail: {
        // TODO: This could maybe blame the person with the tether?
        'TitaniaEx Thunder Rune': '3D29',
        'TitaniaEx Divination Rune': '3D4A',
    },
};
/* harmony default export */ const titania_ex = (titania_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titan-un.ts

// Titan Unreal
const titan_un_triggerSet = {
    zoneId: zone_id/* default.TheNavelUnreal */.Z.TheNavelUnreal,
    damageWarn: {
        'TitanUn Weight Of The Land': '58FE',
        'TitanUn Burst': '5ADF',
    },
    damageFail: {
        'TitanUn Landslide': '5ADC',
        'TitanUn Gaoler Landslide': '5902',
    },
    shareWarn: {
        'TitanUn Rock Buster': '58F6',
    },
    shareFail: {
        'TitanUn Mountain Buster': '58F7',
    },
};
/* harmony default export */ const titan_un = (titan_un_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/varis-ex.ts



const varis_ex_triggerSet = {
    zoneId: zone_id/* default.MemoriaMiseraExtreme */.Z.MemoriaMiseraExtreme,
    damageWarn: {
        'VarisEx Alea Iacta Est 1': '4CD2',
        'VarisEx Alea Iacta Est 2': '4CD3',
        'VarisEx Alea Iacta Est 3': '4CD4',
        'VarisEx Alea Iacta Est 4': '4CD5',
        'VarisEx Alea Iacta Est 5': '4CD6',
        'VarisEx Ignis Est 1': '4CB5',
        'VarisEx Ignis Est 2': '4CC5',
        'VarisEx Ventus Est 1': '4CC7',
        'VarisEx Ventus Est 2': '4CC8',
        'VarisEx Assault Cannon': '4CE5',
        'VarisEx Fortius Rotating': '4CE9',
    },
    damageFail: {
        // Don't hit the shields!
        'VarisEx Repay': '4CDD',
    },
    shareWarn: {
        // This is the "protean" fortius.
        'VarisEx Fortius Protean': '4CE7',
    },
    shareFail: {
        'VarisEx Magitek Burst': '4CDF',
        'VarisEx Aetherochemical Grenado': '4CED',
    },
    triggers: [
        {
            id: 'VarisEx Terminus Est',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4CB4', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 1,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const varis_ex = (varis_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/wol.ts


// TODO: Radiant Braver is 4F16/4F17(x2), shouldn't get hit by both?
// TODO: Radiant Desperado is 4F18/4F19, shouldn't get hit by both?
// TODO: Radiant Meteor is 4F1A, and shouldn't get hit by more than 1?
// TODO: missing a tower?
// Note: Deliberately not including pyretic damage as an error.
// Note: It doesn't appear that there's any way to tell who failed the cutscene.
const wol_triggerSet = {
    zoneId: zone_id/* default.TheSeatOfSacrifice */.Z.TheSeatOfSacrifice,
    damageWarn: {
        'WOL Solemn Confiteor': '4F2A',
        'WOL Coruscant Saber In': '4F10',
        'WOL Coruscant Saber Out': '4F11',
        'WOL Imbued Corusance Out': '4F4B',
        'WOL Imbued Corusance In': '4F4C',
        'WOL Shining Wave': '4F26',
        'WOL Cauterize': '4F25',
        'WOL Brimstone Earth 1': '4F1E',
        'WOL Brimstone Earth 2': '4F1F',
        'WOL Flare Breath': '4F24',
        'WOL Decimation': '4F23',
    },
    gainsEffectWarn: {
        'WOL Deep Freeze': '4E6',
    },
    triggers: [
        {
            id: 'WOL True Walking Dead',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38E' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (_data, matches) => {
                return { type: 'fail', name: matches.target, reason: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const wol = (wol_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/wol-ex.ts


// TODO: Radiant Braver is 4EF7/4EF8(x2), shouldn't get hit by both?
// TODO: Radiant Desperado is 4EF9/4EFA, shouldn't get hit by both?
// TODO: Radiant Meteor is 4EFC, and shouldn't get hit by more than 1?
// TODO: Absolute Holy should be shared?
// TODO: intersecting brimstones?
const wol_ex_triggerSet = {
    zoneId: zone_id/* default.TheSeatOfSacrificeExtreme */.Z.TheSeatOfSacrificeExtreme,
    damageWarn: {
        'WOLEx Solemn Confiteor': '4F0C',
        'WOLEx Coruscant Saber In': '4EF2',
        'WOLEx Coruscant Saber Out': '4EF1',
        'WOLEx Imbued Corusance Out': '4F49',
        'WOLEx Imbued Corusance In': '4F4A',
        'WOLEx Shining Wave': '4F08',
        'WOLEx Cauterize': '4F07',
        'WOLEx Brimstone Earth': '4F00',
    },
    gainsEffectWarn: {
        'WOLEx Deep Freeze': '4E6',
        'WOLEx Damage Down': '274',
    },
    shareWarn: {
        'WOLEx Absolute Stone III': '4EEB',
        'WOLEx Flare Breath': '4F06',
        'WOLEx Perfect Decimation': '4F05',
    },
    soloWarn: {
        'WolEx Katon San Share': '4EFE',
    },
    triggers: [
        {
            id: 'WOLEx True Walking Dead',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8FF' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (_data, matches) => {
                return { type: 'fail', name: matches.target, reason: matches.effect };
            },
        },
        {
            id: 'WOLEx Tower',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4F04', capture: false }),
            mistake: {
                type: 'fail',
                text: {
                    en: 'Missed Tower',
                    de: 'Turm verpasst',
                    fr: 'Tour manquée',
                    ja: '塔を踏まなかった',
                    cn: '没踩塔',
                    ko: '장판 실수',
                },
            },
        },
        {
            id: 'WOLEx True Hallowed Ground',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4F44' }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: matches.ability };
            },
        },
        {
            // For Berserk and Deep Darkside
            id: 'WOLEx Missed Interrupt',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5156', '5158'] }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const wol_ex = (wol_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/ultimate/the_epic_of_alexander.ts



// TODO: FIX luminous aetheroplasm warning not working
// TODO: FIX doll death not working
// TODO: failing hand of pain/parting (check for high damage?)
// TODO: make sure everybody takes exactly one protean (rather than watching double hits)
// TODO: thunder not hitting exactly 2?
// TODO: person with water/thunder debuff dying
// TODO: bad nisi pass
// TODO: failed gavel mechanic
// TODO: double rocket punch not hitting exactly 2? (or tanks)
// TODO: standing in sludge puddles before hidden mine?
// TODO: hidden mine failure?
// TODO: failures of ordained motion / stillness
// TODO: failures of plaint of severity (tethers)
// TODO: failures of plaint of solidarity (shared sentence)
// TODO: ordained capital punishment hitting non-tanks
const the_epic_of_alexander_triggerSet = {
    zoneId: zone_id/* default.TheEpicOfAlexanderUltimate */.Z.TheEpicOfAlexanderUltimate,
    damageWarn: {
        'TEA Sluice': '49B1',
        'TEA Protean Wave 1': '4824',
        'TEA Protean Wave 2': '49B5',
        'TEA Spin Crusher': '4A72',
        'TEA Sacrament': '485F',
        'TEA Radiant Sacrament': '4886',
        'TEA Almighty Judgment': '4890',
    },
    damageFail: {
        'TEA Hawk Blaster': '4830',
        'TEA Chakram': '4855',
        'TEA Enumeration': '4850',
        'TEA Apocalyptic Ray': '484C',
        'TEA Propeller Wind': '4832',
    },
    shareWarn: {
        'TEA Protean Wave Double 1': '49B6',
        'TEA Protean Wave Double 2': '4825',
        'TEA Fluid Swing': '49B0',
        'TEA Fluid Strike': '49B7',
        'TEA Hidden Mine': '4852',
        'TEA Alpha Sword': '486B',
        'TEA Flarethrower': '486B',
        'TEA Chastening Heat': '4A80',
        'TEA Divine Spear': '4A82',
        'TEA Ordained Punishment': '4891',
        // Optical Spread
        'TEA Individual Reprobation': '488C',
    },
    soloFail: {
        // Optical Stack
        'TEA Collective Reprobation': '488D',
    },
    triggers: [
        {
            // "too much luminous aetheroplasm"
            // When this happens, the target explodes, hitting nearby people
            // but also themselves.
            id: 'TEA Exhaust',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '481F', ...oopsy_common/* playerDamageFields */.np }),
            condition: (_data, matches) => matches.target === matches.source,
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'luminous aetheroplasm',
                        de: 'Luminiszentes Ätheroplasma',
                        fr: 'Éthéroplasma lumineux',
                        ja: '光性爆雷',
                        cn: '光性爆雷',
                    },
                };
            },
        },
        {
            id: 'TEA Dropsy',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '121' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'TEA Tether Tracking',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Jagd Doll', id: '0011' }),
            run: (data, matches) => {
                var _a;
                (_a = data.jagdTether) !== null && _a !== void 0 ? _a : (data.jagdTether = {});
                data.jagdTether[matches.sourceId] = matches.target;
            },
        },
        {
            id: 'TEA Reducible Complexity',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4821', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (data, matches) => {
                return {
                    type: 'fail',
                    // This may be undefined, which is fine.
                    name: data.jagdTether ? data.jagdTether[matches.sourceId] : undefined,
                    text: {
                        en: 'Doll Death',
                        de: 'Puppe Tot',
                        fr: 'Poupée morte',
                        ja: 'ドールが死んだ',
                        cn: '浮士德死亡',
                    },
                };
            },
        },
        {
            id: 'TEA Drainage',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4827', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.party.isTank(matches.target),
            mistake: (_data, matches) => {
                return { type: 'fail', name: matches.target, text: matches.ability };
            },
        },
        {
            id: 'TEA Throttle Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '2BC' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasThrottle) !== null && _a !== void 0 ? _a : (data.hasThrottle = {});
                data.hasThrottle[matches.target] = true;
            },
        },
        {
            id: 'TEA Throttle Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '2BC' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasThrottle) !== null && _a !== void 0 ? _a : (data.hasThrottle = {});
                data.hasThrottle[matches.target] = false;
            },
        },
        {
            id: 'TEA Throttle',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '2BC' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasThrottle)
                    return;
                if (!data.hasThrottle[matches.target])
                    return;
                return {
                    name: matches.target,
                    reason: matches.effect,
                };
            },
        },
        {
            // Balloon Popping.  It seems like the person who pops it is the
            // first person listed damage-wise, so they are likely the culprit.
            id: 'TEA Outburst',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '482A', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 5,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.source };
            },
        },
    ],
};
/* harmony default export */ const the_epic_of_alexander = (the_epic_of_alexander_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/oopsy_manifest.txt

































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.ts': buffs,'00-misc/general.ts': general,'00-misc/test.ts': test,'02-arr/trial/ifrit-nm.ts': ifrit_nm,'02-arr/trial/titan-nm.ts': titan_nm,'02-arr/trial/levi-ex.ts': levi_ex,'02-arr/trial/shiva-hm.ts': shiva_hm,'02-arr/trial/shiva-ex.ts': shiva_ex,'02-arr/trial/titan-hm.ts': titan_hm,'02-arr/trial/titan-ex.ts': titan_ex,'03-hw/alliance/weeping_city.ts': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.ts': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.ts': fractal_continuum,'03-hw/dungeon/gubal_library_hard.ts': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.ts': sohm_al_hard,'03-hw/raid/a12n.ts': a12n,'04-sb/dungeon/ala_mhigo.ts': ala_mhigo,'04-sb/dungeon/bardams_mettle.ts': bardams_mettle,'04-sb/dungeon/kugane_castle.ts': kugane_castle,'04-sb/dungeon/st_mocianne_hard.ts': st_mocianne_hard,'04-sb/dungeon/swallows_compass.ts': swallows_compass,'04-sb/dungeon/temple_of_the_fist.ts': temple_of_the_fist,'04-sb/dungeon/the_burn.ts': the_burn,'04-sb/raid/o1n.ts': o1n,'04-sb/raid/o2n.ts': o2n,'04-sb/raid/o3n.ts': o3n,'04-sb/raid/o4n.ts': o4n,'04-sb/raid/o4s.ts': o4s,'04-sb/raid/o7s.ts': o7s,'04-sb/raid/o12s.ts': o12s,'04-sb/trial/byakko-ex.ts': byakko_ex,'04-sb/trial/shinryu.ts': shinryu,'04-sb/trial/susano-ex.ts': susano_ex,'04-sb/ultimate/ultima_weapon_ultimate.ts': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.ts': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.ts': the_copied_factory,'05-shb/alliance/the_puppets_bunker.ts': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.ts': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.ts': akadaemia_anyder,'05-shb/dungeon/amaurot.ts': amaurot,'05-shb/dungeon/anamnesis_anyder.ts': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.ts': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.ts': heroes_gauntlet,'05-shb/dungeon/holminster_switch.ts': holminster_switch,'05-shb/dungeon/malikahs_well.ts': malikahs_well,'05-shb/dungeon/matoyas_relict.ts': matoyas_relict,'05-shb/dungeon/mt_gulg.ts': mt_gulg,'05-shb/dungeon/paglthan.ts': paglthan,'05-shb/dungeon/qitana_ravel.ts': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.ts': the_grand_cosmos,'05-shb/dungeon/twinning.ts': twinning,'05-shb/eureka/delubrum_reginae.ts': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.ts': delubrum_reginae_savage,'05-shb/raid/e1n.ts': e1n,'05-shb/raid/e1s.ts': e1s,'05-shb/raid/e2n.ts': e2n,'05-shb/raid/e2s.ts': e2s,'05-shb/raid/e3n.ts': e3n,'05-shb/raid/e3s.ts': e3s,'05-shb/raid/e4n.ts': e4n,'05-shb/raid/e4s.ts': e4s,'05-shb/raid/e5n.ts': e5n,'05-shb/raid/e5s.ts': e5s,'05-shb/raid/e6n.ts': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.ts': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.ts': e8n,'05-shb/raid/e8s.ts': e8s,'05-shb/raid/e9n.ts': e9n,'05-shb/raid/e9s.ts': e9s,'05-shb/raid/e10n.ts': e10n,'05-shb/raid/e10s.ts': e10s,'05-shb/raid/e11n.ts': e11n,'05-shb/raid/e11s.ts': e11s,'05-shb/raid/e12n.ts': e12n,'05-shb/raid/e12s.ts': e12s,'05-shb/trial/diamond_weapon-ex.ts': diamond_weapon_ex,'05-shb/trial/diamond_weapon.ts': diamond_weapon,'05-shb/trial/emerald_weapon-ex.ts': emerald_weapon_ex,'05-shb/trial/emerald_weapon.ts': emerald_weapon,'05-shb/trial/hades-ex.ts': hades_ex,'05-shb/trial/hades.ts': hades,'05-shb/trial/innocence-ex.ts': innocence_ex,'05-shb/trial/innocence.ts': innocence,'05-shb/trial/levi-un.ts': levi_un,'05-shb/trial/ruby_weapon-ex.ts': ruby_weapon_ex,'05-shb/trial/ruby_weapon.ts': ruby_weapon,'05-shb/trial/shiva-un.ts': shiva_un,'05-shb/trial/titania.ts': titania,'05-shb/trial/titania-ex.ts': titania_ex,'05-shb/trial/titan-un.ts': titan_un,'05-shb/trial/varis-ex.ts': varis_ex,'05-shb/trial/wol.ts': wol,'05-shb/trial/wol-ex.ts': wol_ex,'05-shb/ultimate/the_epic_of_alexander.ts': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2gudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUEwRDtBQUNQO0FBYW5ELDBCQUEwQjtBQUMxQixNQUFNLHFCQUFxQixHQUFHLEdBQUcsQ0FBQztBQUNsQyx3RUFBd0U7QUFDeEUsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUM7QUFFakMsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLElBQVUsRUFBRSxPQUFvQixFQUFFLEVBQUU7SUFDbEUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNoRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDeEMsT0FBTyxJQUFJLENBQUM7SUFFZCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7UUFDdkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2xELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1B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QUEyQixPQUFNLDZCQUE2QixTQUFNLDZDQUE2QyxzQkFBTSw2Q0FBNkMsc0JBQU0sMENBQTBDLGtCQUFNLDBDQUEwQyxrQkFBTSxxREFBcUQsNkJBQU0sdUNBQXVDLGdCQUFNLDhCQUE4QixPQUFNLHVDQUF1QyxnQkFBTSxnQ0FBZ0MsU0FBTSxzQ0FBc0MsZUFBTSx3Q0FBd0MsaUJBQU0sb0NBQW9DLGFBQU0scUNBQXFDLGNBQU0sOEJBQThCLE9BQU0sK0JBQStCLFFBQU0sbUNBQW1DLFlBQU0sdUNBQXVDLGdCQUFNLCtCQUErQixRQUFNLHNDQUFzQyxnQkFBTSw2Q0FBNkMsdUJBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sc0NBQXNDLGlCQUFNLG1DQUFtQyxjQUFNLHNDQUFzQyxpQkFBTSxtQ0FBbUMsY0FBTSw2QkFBNkIsUUFBTSwwQkFBMEIsS0FBTSxpQ0FBaUMsWUFBTSw4QkFBOEIsU0FBTSw0QkFBNEIsT0FBTSxtQ0FBbUMsY0FBTSxnQ0FBZ0MsV0FBTSw2QkFBNkIsUUFBTSw0QkFBNEIsT0FBTSwrQkFBK0IsVUFBTSw2QkFBNkIsUUFBTSw2QkFBNkIsUUFBTSx3QkFBd0IsR0FBTSwyQkFBMkIsTUFBTSw2Q0FBNkMscUJBQU0sRUFBRSxFIiwiZmlsZSI6InVpL2NvbW1vbi9vb3BzeXJhaWRzeV9kYXRhLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBOZXRNYXRjaGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvbmV0X21hdGNoZXMnO1xyXG5pbXBvcnQgeyBDYWN0Ym90QmFzZVJlZ0V4cCB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL25ldF90cmlnZ2VyJztcclxuaW1wb3J0IHsgT29wc3lNaXN0YWtlVHlwZSwgT29wc3lUcmlnZ2VyR2VuZXJpYywgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxudHlwZSBCdWZmTWF0Y2hlcyA9IE5ldE1hdGNoZXNbJ0FiaWxpdHknXSB8IE5ldE1hdGNoZXNbJ0dhaW5zRWZmZWN0J107XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGdlbmVyYWxCdWZmQ29sbGVjdGlvbj86IHsgW3RyaWdnZXJJZDogc3RyaW5nXTogQnVmZk1hdGNoZXNbXSB9O1xyXG4gIHBldElkVG9Pd25lcklkPzogeyBbcGV0SWQ6IHN0cmluZ106IHN0cmluZyB9O1xyXG59XHJcblxyXG4vLyBBYmlsaXRpZXMgc2VlbSBpbnN0YW50LlxyXG5jb25zdCBhYmlsaXR5Q29sbGVjdFNlY29uZHMgPSAwLjU7XHJcbi8vIE9ic2VydmF0aW9uOiB1cCB0byB+MS4yIHNlY29uZHMgZm9yIGEgYnVmZiB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG5jb25zdCBlZmZlY3RDb2xsZWN0U2Vjb25kcyA9IDIuMDtcclxuXHJcbmNvbnN0IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMgPSAoZGF0YTogRGF0YSwgbWF0Y2hlczogQnVmZk1hdGNoZXMpID0+IHtcclxuICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICBpZiAoZGF0YS5wYXJ0eS5wYXJ0eUlkcy5pbmNsdWRlcyhzb3VyY2VJZCkpXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgaWYgKGRhdGEucGV0SWRUb093bmVySWQpIHtcclxuICAgIGNvbnN0IG93bmVySWQgPSBkYXRhLnBldElkVG9Pd25lcklkW3NvdXJjZUlkXTtcclxuICAgIGlmIChvd25lcklkICYmIGRhdGEucGFydHkucGFydHlJZHMuaW5jbHVkZXMob3duZXJJZCkpXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkRnVuYyA9IDxUIGV4dGVuZHMgJ0FiaWxpdHknIHwgJ0dhaW5zRWZmZWN0Jz4oYXJnczoge1xyXG4gIHRyaWdnZXJJZDogc3RyaW5nO1xyXG4gIHJlZ2V4VHlwZTogVDtcclxuICBuZXRSZWdleDogQ2FjdGJvdEJhc2VSZWdFeHA8VD47XHJcbiAgZmllbGQ6IHN0cmluZztcclxuICB0eXBlOiBPb3BzeU1pc3Rha2VUeXBlO1xyXG4gIGlnbm9yZVNlbGY/OiBib29sZWFuO1xyXG4gIGNvbGxlY3RTZWNvbmRzOiBudW1iZXI7XHJcbn0pOiBPb3BzeVRyaWdnZXJHZW5lcmljPERhdGEsIFQ+W10gPT4gW1xyXG4gIHtcclxuICAgIC8vIFN1cmUsIG5vdCBhbGwgb2YgdGhlc2UgYXJlIFwiYnVmZnNcIiBwZXIgc2UsIGJ1dCB0aGV5J3JlIGFsbCBpbiB0aGUgYnVmZnMgZmlsZS5cclxuICAgIGlkOiBgQnVmZiAke2FyZ3MudHJpZ2dlcklkfSBDb2xsZWN0YCxcclxuICAgIHR5cGU6IGFyZ3MucmVnZXhUeXBlLFxyXG4gICAgbmV0UmVnZXg6IGFyZ3MubmV0UmVnZXgsXHJcbiAgICBjb25kaXRpb246IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMsXHJcbiAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uID8/PSB7fTtcclxuICAgICAgY29uc3QgYXJyID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdID8/PSBbXTtcclxuICAgICAgYXJyLnB1c2gobWF0Y2hlcyk7XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6IGBCdWZmICR7YXJncy50cmlnZ2VySWR9YCxcclxuICAgIHR5cGU6IGFyZ3MucmVnZXhUeXBlLFxyXG4gICAgbmV0UmVnZXg6IGFyZ3MubmV0UmVnZXgsXHJcbiAgICBjb25kaXRpb246IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMsXHJcbiAgICBkZWxheVNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMsXHJcbiAgICBzdXBwcmVzc1NlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMsXHJcbiAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICBjb25zdCBhbGxNYXRjaGVzID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24/LlthcmdzLnRyaWdnZXJJZF07XHJcbiAgICAgIGNvbnN0IGZpcnN0TWF0Y2ggPSBhbGxNYXRjaGVzPy5bMF07XHJcbiAgICAgIGNvbnN0IHRoaW5nTmFtZSA9IGZpcnN0TWF0Y2g/LlthcmdzLmZpZWxkXTtcclxuICAgICAgaWYgKCFhbGxNYXRjaGVzIHx8ICFmaXJzdE1hdGNoIHx8ICF0aGluZ05hbWUpXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgcGFydHlOYW1lcyA9IGRhdGEucGFydHkucGFydHlOYW1lcztcclxuXHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIGRlYWQgcGVvcGxlIHNvbWVob3dcclxuICAgICAgY29uc3QgZ290QnVmZk1hcDogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XHJcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBwYXJ0eU5hbWVzKVxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbmFtZV0gPSBmYWxzZTtcclxuXHJcbiAgICAgIGxldCBzb3VyY2VOYW1lID0gZmlyc3RNYXRjaC5zb3VyY2U7XHJcbiAgICAgIC8vIEJsYW1lIHBldCBtaXN0YWtlcyBvbiBvd25lcnMuXHJcbiAgICAgIGlmIChkYXRhLnBldElkVG9Pd25lcklkKSB7XHJcbiAgICAgICAgY29uc3QgcGV0SWQgPSBmaXJzdE1hdGNoLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbcGV0SWRdO1xyXG4gICAgICAgIGlmIChvd25lcklkKSB7XHJcbiAgICAgICAgICBjb25zdCBvd25lck5hbWUgPSBkYXRhLnBhcnR5Lm5hbWVGcm9tSWQob3duZXJJZCk7XHJcbiAgICAgICAgICBpZiAob3duZXJOYW1lKVxyXG4gICAgICAgICAgICBzb3VyY2VOYW1lID0gb3duZXJOYW1lO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZG4ndCBmaW5kIG5hbWUgZm9yICR7b3duZXJJZH0gZnJvbSBwZXQgJHtwZXRJZH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhcmdzLmlnbm9yZVNlbGYpXHJcbiAgICAgICAgZ290QnVmZk1hcFtzb3VyY2VOYW1lXSA9IHRydWU7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IG1hdGNoZXMgb2YgYWxsTWF0Y2hlcykge1xyXG4gICAgICAgIC8vIEluIGNhc2UgeW91IGhhdmUgbXVsdGlwbGUgcGFydHkgbWVtYmVycyB3aG8gaGl0IHRoZSBzYW1lIGNvb2xkb3duIGF0IHRoZSBzYW1lXHJcbiAgICAgICAgLy8gdGltZSAobG9sPyksIHRoZW4gaWdub3JlIGFueWJvZHkgd2hvIHdhc24ndCB0aGUgZmlyc3QuXHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBmaXJzdE1hdGNoLnNvdXJjZSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBnb3RCdWZmTWFwW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG1pc3NlZCA9IE9iamVjdC5rZXlzKGdvdEJ1ZmZNYXApLmZpbHRlcigoeCkgPT4gIWdvdEJ1ZmZNYXBbeF0pO1xyXG4gICAgICBpZiAobWlzc2VkLmxlbmd0aCA9PT0gMClcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAvLyBUT0RPOiBvb3BzeSBjb3VsZCByZWFsbHkgdXNlIG1vdXNlb3ZlciBwb3B1cHMgZm9yIGRldGFpbHMuXHJcbiAgICAgIC8vIFRPRE86IGFsdGVybmF0aXZlbHksIGlmIHdlIGhhdmUgYSBkZWF0aCByZXBvcnQsIGl0J2QgYmUgZ29vZCB0b1xyXG4gICAgICAvLyBleHBsaWNpdGx5IGNhbGwgb3V0IHRoYXQgb3RoZXIgcGVvcGxlIGdvdCBhIGhlYWwgdGhpcyBwZXJzb24gZGlkbid0LlxyXG4gICAgICBpZiAobWlzc2VkLmxlbmd0aCA8IDQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogYXJncy50eXBlLFxyXG4gICAgICAgICAgYmxhbWU6IHNvdXJjZU5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHt0aGluZ05hbWV9IG1pc3NlZCAke21pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpfWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHt0aGluZ05hbWV9IHZlcmZlaGx0ICR7bWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyl9YCxcclxuICAgICAgICAgICAgZnI6IGAke3RoaW5nTmFtZX0gbWFucXXDqShlKSBzdXIgJHttaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKX1gLFxyXG4gICAgICAgICAgICBqYTogYCgke21pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpfSkg44GMJHt0aGluZ05hbWV944KS5Y+X44GR44Gq44GL44Gj44GfYCxcclxuICAgICAgICAgICAgY246IGAke21pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpfSDmsqHlj5fliLAgJHt0aGluZ05hbWV9YCxcclxuICAgICAgICAgICAga286IGAke3RoaW5nTmFtZX0gJHttaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKX3sl5Dqsowg7KCB7Jqp7JWI65CoYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICAvLyBJZiB0aGVyZSdzIHRvbyBtYW55IHBlb3BsZSwganVzdCBsaXN0IHRoZSBudW1iZXIgb2YgcGVvcGxlIG1pc3NlZC5cclxuICAgICAgLy8gVE9ETzogd2UgY291bGQgYWxzbyBsaXN0IGV2ZXJ5Ym9keSBvbiBzZXBhcmF0ZSBsaW5lcz9cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0eXBlOiBhcmdzLnR5cGUsXHJcbiAgICAgICAgYmxhbWU6IHNvdXJjZU5hbWUsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46IGAke3RoaW5nTmFtZX0gbWlzc2VkICR7bWlzc2VkLmxlbmd0aH0gcGVvcGxlYCxcclxuICAgICAgICAgIGRlOiBgJHt0aGluZ05hbWV9IHZlcmZlaGx0ZSAke21pc3NlZC5sZW5ndGh9IFBlcnNvbmVuYCxcclxuICAgICAgICAgIGZyOiBgJHt0aGluZ05hbWV9IG1hbnF1w6koZSkgc3VyICR7bWlzc2VkLmxlbmd0aH0gcGVyc29ubmVzYCxcclxuICAgICAgICAgIGphOiBgJHttaXNzZWQubGVuZ3RofeS6uuOBjCR7dGhpbmdOYW1lfeOCkuWPl+OBkeOBquOBi+OBo+OBn2AsXHJcbiAgICAgICAgICBjbjogYOaciSR7bWlzc2VkLmxlbmd0aH3kurrmsqHlj5fliLAgJHt0aGluZ05hbWV9YCxcclxuICAgICAgICAgIGtvOiBgJHt0aGluZ05hbWV9ICR7bWlzc2VkLmxlbmd0aH3rqoXsl5Dqsowg7KCB7Jqp7JWI65CoYCxcclxuICAgICAgICB9LFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgaWYgKGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uKVxyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvblthcmdzLnRyaWdnZXJJZF07XHJcbiAgICB9LFxyXG4gIH0sXHJcbl07XHJcblxyXG5jb25zdCBtaXNzZWRNaXRpZ2F0aW9uQnVmZiA9IChhcmdzOiB7IGlkOiBzdHJpbmc7IGVmZmVjdElkOiBzdHJpbmc7XHJcbiAgaWdub3JlU2VsZj86IGJvb2xlYW47IGNvbGxlY3RTZWNvbmRzPzogbnVtYmVyOyB9KSA9PiB7XHJcbiAgaWYgKCFhcmdzLmVmZmVjdElkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBlZmZlY3RJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiBhcmdzLmVmZmVjdElkIH0pLFxyXG4gICAgcmVnZXhUeXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgZmllbGQ6ICdlZmZlY3QnLFxyXG4gICAgdHlwZTogJ2hlYWwnLFxyXG4gICAgaWdub3JlU2VsZjogYXJncy5pZ25vcmVTZWxmLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogZWZmZWN0Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWREYW1hZ2VBYmlsaXR5ID0gKGFyZ3M6IHsgaWQ6IHN0cmluZzsgYWJpbGl0eUlkOiBzdHJpbmc7XHJcbiAgaWdub3JlU2VsZj86IGJvb2xlYW47IGNvbGxlY3RTZWNvbmRzPzogbnVtYmVyOyB9KSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eUlkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICByZWdleFR5cGU6ICdBYmlsaXR5JyxcclxuICAgIGZpZWxkOiAnYWJpbGl0eScsXHJcbiAgICB0eXBlOiAnZGFtYWdlJyxcclxuICAgIGlnbm9yZVNlbGY6IGFyZ3MuaWdub3JlU2VsZixcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZEhlYWwgPSAoYXJnczogeyBpZDogc3RyaW5nOyBhYmlsaXR5SWQ6IHN0cmluZztcclxuICBpZ25vcmVTZWxmPzogYm9vbGVhbjsgY29sbGVjdFNlY29uZHM/OiBudW1iZXI7IH0pID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIHJlZ2V4VHlwZTogJ0FiaWxpdHknLFxyXG4gICAgZmllbGQ6ICdhYmlsaXR5JyxcclxuICAgIHR5cGU6ICdoZWFsJyxcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5ID0gbWlzc2VkSGVhbDtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRjaEFsbCxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0J1ZmYgUGV0IFRvIE93bmVyIE1hcHBlcicsXHJcbiAgICAgIHR5cGU6ICdBZGRlZENvbWJhdGFudCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCgpLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMub3duZXJJZCA9PT0gJzAnKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkID8/PSB7fTtcclxuICAgICAgICAvLyBGaXggYW55IGxvd2VyY2FzZSBpZHMuXHJcbiAgICAgICAgZGF0YS5wZXRJZFRvT3duZXJJZFttYXRjaGVzLmlkLnRvVXBwZXJDYXNlKCldID0gbWF0Y2hlcy5vd25lcklkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0J1ZmYgUGV0IFRvIE93bmVyIENsZWFyZXInLFxyXG4gICAgICB0eXBlOiAnQ2hhbmdlWm9uZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmNoYW5nZVpvbmUoKSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIENsZWFyIHRoaXMgaGFzaCBwZXJpb2RpY2FsbHkgc28gaXQgZG9lc24ndCBoYXZlIGZhbHNlIHBvc2l0aXZlcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkID0ge307XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByZWZlciBhYmlsaXRpZXMgdG8gZWZmZWN0cywgYXMgZWZmZWN0cyB0YWtlIGxvbmdlciB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG4gICAgLy8gSG93ZXZlciwgc29tZSB0aGluZ3MgYXJlIG9ubHkgZWZmZWN0cyBhbmQgc28gdGhlcmUgaXMgbm8gY2hvaWNlLlxyXG5cclxuICAgIC8vIEZvciB0aGluZ3MgeW91IGNhbiBzdGVwIGluIG9yIG91dCBvZiwgZ2l2ZSBhIGxvbmdlciB0aW1lcj8gIFRoaXMgaXNuJ3QgcGVyZmVjdC5cclxuICAgIC8vIFRPRE86IGluY2x1ZGUgc29pbCBoZXJlPz9cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdDb2xsZWN0aXZlIFVuY29uc2Npb3VzJywgZWZmZWN0SWQ6ICczNTEnLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcbiAgICAvLyBBcm1zIFVwID0gNDk4IChvdGhlcnMpLCBQYXNzYWdlIE9mIEFybXMgPSA0OTcgKHlvdSkuICBVc2UgYm90aCBpbiBjYXNlIGV2ZXJ5Ym9keSBpcyBtaXNzZWQuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnUGFzc2FnZSBvZiBBcm1zJywgZWZmZWN0SWQ6ICc0OVs3OF0nLCBpZ25vcmVTZWxmOiB0cnVlLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0RpdmluZSBWZWlsJywgZWZmZWN0SWQ6ICcyRDcnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdIZWFydCBPZiBMaWdodCcsIGFiaWxpdHlJZDogJzNGMjAnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0RhcmsgTWlzc2lvbmFyeScsIGFiaWxpdHlJZDogJzQwNTcnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NoYWtlIEl0IE9mZicsIGFiaWxpdHlJZDogJzFDREMnIH0pLFxyXG5cclxuICAgIC8vIDNGNDQgaXMgdGhlIGNvcnJlY3QgUXVhZHJ1cGxlIFRlY2huaWNhbCBGaW5pc2gsIG90aGVycyBhcmUgRGlua3kgVGVjaG5pY2FsIEZpbmlzaC5cclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ1RlY2huaWNhbCBGaW5pc2gnLCBhYmlsaXR5SWQ6ICczRjRbMS00XScgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEaXZpbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBOCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCcm90aGVyaG9vZCcsIGFiaWxpdHlJZDogJzFDRTQnIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIExpdGFueScsIGFiaWxpdHlJZDogJ0RFNScgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdFbWJvbGRlbicsIGFiaWxpdHlJZDogJzFENjAnIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIFZvaWNlJywgYWJpbGl0eUlkOiAnNzYnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC8vIFRvbyBub2lzeSAocHJvY3MgZXZlcnkgdGhyZWUgc2Vjb25kcywgYW5kIGJhcmRzIG9mdGVuIG9mZiBkb2luZyBtZWNoYW5pY3MpLlxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnV2FuZGVyZXJcXCdzIE1pbnVldCcsIGVmZmVjdElkOiAnOEE4JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ01hZ2VcXCdzIEJhbGxhZCcsIGVmZmVjdElkOiAnOEE5JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ0FybXlcXCdzIFBhZW9uJywgZWZmZWN0SWQ6ICc4QUEnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUcm91YmFkb3VyJywgYWJpbGl0eUlkOiAnMUNFRCcgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnVGFjdGljaWFuJywgYWJpbGl0eUlkOiAnNDFGOScgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hpZWxkIFNhbWJhJywgYWJpbGl0eUlkOiAnM0U4QycgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ01hbnRyYScsIGFiaWxpdHlJZDogJzQxJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEZXZvdGlvbicsIGFiaWxpdHlJZDogJzFEMUEnIH0pLFxyXG5cclxuICAgIC8vIE1heWJlIHVzaW5nIGEgaGVhbGVyIExCMS9MQjIgc2hvdWxkIGJlIGFuIGVycm9yIGZvciB0aGUgaGVhbGVyLiBPOilcclxuICAgIC8vIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0hlYWxpbmcgV2luZCcsIGFiaWxpdHlJZDogJ0NFJyB9KSxcclxuICAgIC8vIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0JyZWF0aCBvZiB0aGUgRWFydGgnLCBhYmlsaXR5SWQ6ICdDRicgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhJywgYWJpbGl0eUlkOiAnN0MnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhIElJJywgYWJpbGl0eUlkOiAnODUnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQWZmbGF0dXMgUmFwdHVyZScsIGFiaWxpdHlJZDogJzQwOTYnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnVGVtcGVyYW5jZScsIGFiaWxpdHlJZDogJzc1MScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdQbGVuYXJ5IEluZHVsZ2VuY2UnLCBhYmlsaXR5SWQ6ICcxRDA5JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1B1bHNlIG9mIExpZmUnLCBhYmlsaXR5SWQ6ICdEMCcgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnU3VjY29yJywgYWJpbGl0eUlkOiAnQkEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnSW5kb21pdGFiaWxpdHknLCBhYmlsaXR5SWQ6ICdERkYnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnRGVwbG95bWVudCBUYWN0aWNzJywgYWJpbGl0eUlkOiAnRTAxJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1doaXNwZXJpbmcgRGF3bicsIGFiaWxpdHlJZDogJzMyMycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdGZXkgQmxlc3NpbmcnLCBhYmlsaXR5SWQ6ICc0MEEwJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0NvbnNvbGF0aW9uJywgYWJpbGl0eUlkOiAnNDBBMycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBbmdlbFxcJ3MgV2hpc3BlcicsIGFiaWxpdHlJZDogJzQwQTYnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0ZleSBJbGx1bWluYXRpb24nLCBhYmlsaXR5SWQ6ICczMjUnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NlcmFwaGljIElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzQwQTcnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQW5nZWwgRmVhdGhlcnMnLCBhYmlsaXR5SWQ6ICcxMDk3JyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnRTExJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FzcGVjdGVkIEhlbGlvcycsIGFiaWxpdHlJZDogJzMyMDAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQ2VsZXN0aWFsIE9wcG9zaXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE5JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FzdHJhbCBTdGFzaXMnLCBhYmlsaXR5SWQ6ICcxMDk4JyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdXaGl0ZSBXaW5kJywgYWJpbGl0eUlkOiAnMkM4RScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdHb2Jza2luJywgYWJpbGl0eUlkOiAnNDc4MCcgfSksXHJcblxyXG4gICAgLy8gVE9ETzogZXhwb3J0IGFsbCBvZiB0aGVzZSBtaXNzZWQgZnVuY3Rpb25zIGludG8gdGhlaXIgb3duIGhlbHBlclxyXG4gICAgLy8gYW5kIHRoZW4gYWRkIHRoaXMgdG8gdGhlIERlbHVicnVtIFJlZ2luYWUgZmlsZXMgZGlyZWN0bHkuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTG9zdCBBZXRoZXJzaGllbGQnLCBhYmlsaXR5SWQ6ICc1NzUzJyB9KSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgbG9zdEZvb2Q/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbi8vIEdlbmVyYWwgbWlzdGFrZXM7IHRoZXNlIGFwcGx5IGV2ZXJ5d2hlcmUuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRjaEFsbCxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUcmlnZ2VyIGlkIGZvciBpbnRlcm5hbGx5IGdlbmVyYXRlZCBlYXJseSBwdWxsIHdhcm5pbmcuXHJcbiAgICAgIGlkOiAnR2VuZXJhbCBFYXJseSBQdWxsJyxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBGb29kIEJ1ZmYnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICAvLyBXZWxsIEZlZFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDgnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFByZXZlbnQgXCJFb3MgbG9zZXMgdGhlIGVmZmVjdCBvZiBXZWxsIEZlZCBmcm9tIENyaXRsbyBNY2dlZVwiXHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXMudGFyZ2V0ID09PSBtYXRjaGVzLnNvdXJjZTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmxvc3RGb29kID8/PSB7fTtcclxuICAgICAgICAvLyBXZWxsIEZlZCBidWZmIGhhcHBlbnMgcmVwZWF0ZWRseSB3aGVuIGl0IGZhbGxzIG9mZiAoV0hZKSxcclxuICAgICAgICAvLyBzbyBzdXBwcmVzcyBtdWx0aXBsZSBvY2N1cnJlbmNlcy5cclxuICAgICAgICBpZiAoIWRhdGEuaW5Db21iYXQgfHwgZGF0YS5sb3N0Rm9vZFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGF0YS5sb3N0Rm9vZFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnbG9zdCBmb29kIGJ1ZmYnLFxyXG4gICAgICAgICAgICBkZTogJ05haHJ1bmdzYnVmZiB2ZXJsb3JlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQnVmZiBub3Vycml0dXJlIHRlcm1pbsOpZScsXHJcbiAgICAgICAgICAgIGphOiAn6aOv5Yq55p6c44GM5aSx44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICflpLHljrvpo5/nialCVUZGJyxcclxuICAgICAgICAgICAga286ICfsnYzsi50g67KE7ZSEIO2VtOygnCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0dlbmVyYWwgV2VsbCBGZWQnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDgnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmxvc3RGb29kKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBSYWJiaXQgTWVkaXVtJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc4RTAnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLklzUGxheWVySWQobWF0Y2hlcy5zb3VyY2VJZCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy5zb3VyY2UsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnYnVubnknLFxyXG4gICAgICAgICAgICBkZTogJ0hhc2UnLFxyXG4gICAgICAgICAgICBmcjogJ2xhcGluJyxcclxuICAgICAgICAgICAgamE6ICfjgYbjgZXjgY4nLFxyXG4gICAgICAgICAgICBjbjogJ+WFlOWtkCcsXHJcbiAgICAgICAgICAgIGtvOiAn7Yag64G8JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGJvb3RDb3VudD86IG51bWJlcjtcclxuICBwb2tlQ291bnQ/OiBudW1iZXI7XHJcbn1cclxuXHJcbi8vIFRlc3QgbWlzdGFrZSB0cmlnZ2Vycy5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1pZGRsZUxhTm9zY2VhLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb3cnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBib3cgY291cnRlb3VzbHkgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHZvdXMgaW5jbGluZXogZGV2YW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavjgYrovp7lhIDjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5oGt5pWs5Zyw5a+55pyo5Lq66KGM56S8Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDqs7XshpDtlZjqsowg7J247IKs7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3B1bGwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm93JyxcclxuICAgICAgICAgICAgZGU6ICdCb2dlbicsXHJcbiAgICAgICAgICAgIGZyOiAnU2FsdWVyJyxcclxuICAgICAgICAgICAgamE6ICfjgYrovp7lhIAnLFxyXG4gICAgICAgICAgICBjbjogJ+meoOi6rCcsXHJcbiAgICAgICAgICAgIGtvOiAn7J247IKsJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBXaXBlJyxcclxuICAgICAgdHlwZTogJ0dhbWVMb2cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgYmlkIGZhcmV3ZWxsIHRvIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyBmYWl0ZXMgdm9zIGFkaWV1eCBhdSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644Gr5Yil44KM44Gu5oyo5ou244KS44GX44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuWQkeacqOS6uuWRiuWIqy4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsl5Dqsowg7J6R67OEIOyduOyCrOulvCDtlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2lwZScsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQYXJ0eSBXaXBlJyxcclxuICAgICAgICAgICAgZGU6ICdHcnVwcGVud2lwZScsXHJcbiAgICAgICAgICAgIGZyOiAnUGFydHkgV2lwZScsXHJcbiAgICAgICAgICAgIGphOiAn44Ov44Kk44OXJyxcclxuICAgICAgICAgICAgY246ICflm6Lnga0nLFxyXG4gICAgICAgICAgICBrbzogJ+2MjO2LsCDsoITrqbgnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvb3RzaGluZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzM1JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChtYXRjaGVzLnNvdXJjZSAhPT0gZGF0YS5tZSlcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBjb25zdCBzdHJpa2luZ0R1bW15QnlMb2NhbGUgPSB7XHJcbiAgICAgICAgICBlbjogJ1N0cmlraW5nIER1bW15JyxcclxuICAgICAgICAgIGZyOiAnTWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50JyxcclxuICAgICAgICAgIGphOiAn5pyo5Lq6JyxcclxuICAgICAgICAgIGNuOiAn5pyo5Lq6JyxcclxuICAgICAgICAgIGtvOiAn64KY66y07J247ZiVJyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlOYW1lcyA9IE9iamVjdC52YWx1ZXMoc3RyaWtpbmdEdW1teUJ5TG9jYWxlKTtcclxuICAgICAgICByZXR1cm4gc3RyaWtpbmdEdW1teU5hbWVzLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCA/Pz0gMDtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2RhdGEuYm9vdENvdW50fSk6ICR7ZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKX1gO1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBMZWFkZW4gRmlzdCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc3NDUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnNvdXJjZSA9PT0gZGF0YS5tZSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZ29vZCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IE9vcHMnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmVjaG8oeyBsaW5lOiAnLipvb3BzLionIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEwLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IG1hdGNoZXMubGluZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFBva2UgQ29sbGVjdCcsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IHBva2UgdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHRvdWNoZXogbMOpZ8OocmVtZW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCBkdSBkb2lndC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgpLjgaTjgaTjgYTjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q55So5omL5oyH5oiz5ZCR5pyo5Lq6Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleydhCDsv6Hsv6Eg7LCM66aF64uI64ukLio/JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEucG9rZUNvdW50ID0gKGRhdGEucG9rZUNvdW50ID8/IDApICsgMTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlJyxcclxuICAgICAgdHlwZTogJ0dhbWVMb2cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gMSBwb2tlIGF0IGEgdGltZSBpcyBmaW5lLCBidXQgbW9yZSB0aGFuIG9uZSBpbiA1IHNlY29uZHMgaXMgKE9CVklPVVNMWSkgYSBtaXN0YWtlLlxyXG4gICAgICAgIGlmICghZGF0YS5wb2tlQ291bnQgfHwgZGF0YS5wb2tlQ291bnQgPD0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgVG9vIG1hbnkgcG9rZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgWnUgdmllbGUgUGlla3NlciAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgZnI6IGBUcm9wIGRlIHRvdWNoZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGphOiBg44GE44Gj44Gx44GE44Gk44Gk44GE44GfICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBjbjogYOaIs+WkquWkmuS4i+WVpiAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAga286IGDrhIjrrLQg66eO7J20IOywjOumhCAoJHtkYXRhLnBva2VDb3VudH3rsogpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEucG9rZUNvdW50LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSWZyaXQgU3RvcnkgTW9kZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQm93bE9mRW1iZXJzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJZnJpdE5tIFJhZGlhbnQgUGx1bWUnOiAnMkRFJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0lmcml0Tm0gSW5jaW5lcmF0ZSc6ICcxQzUnLFxyXG4gICAgJ0lmcml0Tm0gRXJ1cHRpb24nOiAnMkREJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGl0YW4gU3RvcnkgTW9kZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuTm0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzNDRCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5ObSBMYW5kc2xpZGUnOiAnMjhBJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuTm0gUm9jayBCdXN0ZXInOiAnMjgxJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA4MjMvODI0LzgyNSwgV2F0ZXJzcG91dCA9IDgyOVxyXG5cclxuLy8gTGV2aWF0aGFuIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdMZXZpRXggR3JhbmQgRmFsbCc6ICc4MkYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aUV4IEh5ZHJvIFNob3QnOiAnNzQ4JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlFeCBEcmVhZHN0b3JtJzogJzc0OScsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlFeCBCb2R5IFNsYW0nOiAnODJBJywgLy8gbGV2aSBzbGFtIHRoYXQgdGlsdHMgdGhlIGJvYXRcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAxJzogJzg4QScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAyJzogJzg4QicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAzJzogJzgyQycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlFeCBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlFeCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpRXggQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc4MkEnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHNlZW5EaWFtb25kRHVzdD86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8vIFNoaXZhIEhhcmRcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFIbSBJY2ljbGUgSW1wYWN0JzogJzk5MycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhSG0gR2xhY2llciBCYXNoJzogJzlBMScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEtub2NrYmFjayB0YW5rIGNsZWF2ZS5cclxuICAgICdTaGl2YUhtIEhlYXZlbmx5IFN0cmlrZSc6ICc5QTAnLFxyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFIbSBIYWlsc3Rvcm0nOiAnOTk4JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVGFua2J1c3Rlci4gIFRoaXMgaXMgU2hpdmEgSGFyZCBtb2RlLCBub3QgU2hpdmEgRXh0cmVtZS4gIFBsZWFzZSFcclxuICAgICdTaGl2YUhtIEljZWJyYW5kJzogJzk5NicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGlhbW9uZCBEdXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc5OEEnIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zZWVuRGlhbW9uZER1c3QgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUhtIERlZXAgRnJlZXplJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgOUEzIG9uIHlvdSwgYnV0IGl0IGhhcyB0aGUgdW50cmFuc2xhdGVkIG5hbWVcclxuICAgICAgLy8g6YCP5piO77ya44K344O044Kh77ya5YeN57WQ44Os44Kv44OI77ya44OO44OD44Kv44OQ44OD44Kv55SoLiBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgc28gb25seSBhIG1pc3Rha2UgYWZ0ZXIgdGhhdC5cclxuICAgICAgICAvLyBVbmxpa2UgZXh0cmVtZSwgdGhpcyBoYXMgdGhlIHNhbWUgMjAgc2Vjb25kIGR1cmF0aW9uIGFzIHRoZSBpbnRlcm1pc3Npb24uXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuc2VlbkRpYW1vbmREdXN0O1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gU2hpdmEgRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnQkVCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICdCRUMnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUV4IEdsYWNpZXIgQmFzaCc6ICdCRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICdCREYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICdCRTInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBMYXNlci4gIFRPRE86IG1heWJlIGJsYW1lIHRoZSBwZXJzb24gaXQncyBvbj8/XHJcbiAgICAnU2hpdmFFeCBBdmFsYW5jaGUnOiAnQkUwJyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFua2J1c3RlclxyXG4gICAgJ1NoaXZhRXggSWNlYnJhbmQnOiAnQkUxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IEM4QSBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC/jg5Ljg63jgqTjg4Pjgq8uIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgYnV0IGZvciBhIHNob3J0ZXIgZHVyYXRpb24uXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgPiAyMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBIYXJkXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU1MycsXHJcbiAgICAnVGl0YW5IbSBCdXJzdCc6ICc0MUMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTGFuZHNsaWRlJzogJzU1NCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFJvY2sgQnVzdGVyJzogJzU1MCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIE1vdW50YWluIEJ1c3Rlcic6ICcyODMnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzVCRScsXHJcbiAgICAnVGl0YW5FeCBCdXJzdCc6ICc1QkYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTGFuZHNsaWRlJzogJzVCQicsXHJcbiAgICAnVGl0YW5FeCBHYW9sZXIgTGFuZHNsaWRlJzogJzVDMycsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkV4IFJvY2sgQnVzdGVyJzogJzVCNycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkV4IE1vdW50YWluIEJ1c3Rlcic6ICc1QjgnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICB6b21iaWU/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgc2hpZWxkPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2VlcGluZ0NpdHlPZk1oYWNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdXZWVwaW5nIENyaXRpY2FsIEJpdGUnOiAnMTg0OCcsIC8vIFNhcnN1Y2h1cyBjb25lIGFvZVxyXG4gICAgJ1dlZXBpbmcgUmVhbG0gU2hha2VyJzogJzE4M0UnLCAvLyBGaXJzdCBEYXVnaHRlciBjaXJjbGUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrc2NyZWVuJzogJzE4M0MnLCAvLyBGaXJzdCBEYXVnaHRlciBsaW5lIGFvZVxyXG4gICAgJ1dlZXBpbmcgU2lsa2VuIFNwcmF5JzogJzE4MjQnLCAvLyBBcmFjaG5lIEV2ZSByZWFyIGNvbmFsIGFvZVxyXG4gICAgJ1dlZXBpbmcgVHJlbWJsb3IgMSc6ICcxODM3JywgLy8gQXJhY2huZSBFdmUgZGlzYXBwZWFyIGNpcmNsZSBhb2UgMVxyXG4gICAgJ1dlZXBpbmcgVHJlbWJsb3IgMic6ICcxODM2JywgLy8gQXJhY2huZSBFdmUgZGlzYXBwZWFyIGNpcmNsZSBhb2UgMlxyXG4gICAgJ1dlZXBpbmcgVHJlbWJsb3IgMyc6ICcxODM1JywgLy8gQXJhY2huZSBFdmUgZGlzYXBwZWFyIGNpcmNsZSBhb2UgM1xyXG4gICAgJ1dlZXBpbmcgU3BpZGVyIFRocmVhZCc6ICcxODM5JywgLy8gQXJhY2huZSBFdmUgc3BpZGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBGaXJlIElJJzogJzE4NEUnLCAvLyBCbGFjayBNYWdlIENvcnBzZSBjaXJjbGUgYW9lXHJcbiAgICAnV2VlcGluZyBOZWNyb3B1cmdlJzogJzE3RDcnLCAvLyBGb3JnYWxsIFNocml2ZWxlZCBUYWxvbiBsaW5lIGFvZVxyXG4gICAgJ1dlZXBpbmcgUm90dGVuIEJyZWF0aCc6ICcxN0QwJywgLy8gRm9yZ2FsbCBEYWhhayBjb25lIGFvZVxyXG4gICAgJ1dlZXBpbmcgTW93JzogJzE3RDInLCAvLyBGb3JnYWxsIEhhYWdlbnRpIHVubWFya2VkIGNsZWF2ZVxyXG4gICAgJ1dlZXBpbmcgRGFyayBFcnVwdGlvbic6ICcxN0MzJywgLy8gRm9yZ2FsbCBwdWRkbGUgbWFya2VyXHJcbiAgICAvLyAxODA2IGlzIGFsc28gRmxhcmUgU3RhciwgYnV0IGlmIHlvdSBnZXQgYnkgMTgwNSB5b3UgYWxzbyBnZXQgaGl0IGJ5IDE4MDY/XHJcbiAgICAnV2VlcGluZyBGbGFyZSBTdGFyJzogJzE4MDUnLCAvLyBPem1hIGN1YmUgcGhhc2UgZG9udXRcclxuICAgICdXZWVwaW5nIEV4ZWNyYXRpb24nOiAnMTgyOScsIC8vIE96bWEgdHJpYW5nbGUgbGFzZXJcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMSc6ICcxODBCJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAxXHJcbiAgICAnV2VlcGluZyBIYWlyY3V0IDInOiAnMTgwRicsIC8vIENhbG9maXN0ZXJpIDE4MCBjbGVhdmUgMlxyXG4gICAgJ1dlZXBpbmcgRW50YW5nbGVtZW50JzogJzE4MUQnLCAvLyBDYWxvZmlzdGVyaSBsYW5kbWluZSBwdWRkbGUgcHJvY1xyXG4gICAgJ1dlZXBpbmcgRXZpbCBDdXJsJzogJzE4MTYnLCAvLyBDYWxvZmlzdGVyaSBheGVcclxuICAgICdXZWVwaW5nIEV2aWwgVHJlc3MnOiAnMTgxNycsIC8vIENhbG9maXN0ZXJpIGJ1bGJcclxuICAgICdXZWVwaW5nIERlcHRoIENoYXJnZSc6ICcxODIwJywgLy8gQ2Fsb2Zpc3RlcmkgY2hhcmdlIHRvIGVkZ2VcclxuICAgICdXZWVwaW5nIEZlaW50IFBhcnRpY2xlIEJlYW0nOiAnMTkyOCcsIC8vIENhbG9maXN0ZXJpIHNreSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgRXZpbCBTd2l0Y2gnOiAnMTgxNScsIC8vIENhbG9maXN0ZXJpIGxhc2Vyc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBBcmFjaG5lIEV2ZSBGcm9uZCBBZmZlYXJkXHJcbiAgICAnV2VlcGluZyBab21iaWZpY2F0aW9uJzogJzE3MycsIC8vIEZvcmdhbGwgdG9vIG1hbnkgem9tYmllIHB1ZGRsZXNcclxuICAgICdXZWVwaW5nIFRvYWQnOiAnMUI3JywgLy8gRm9yZ2FsbCBCcmFuZCBvZiB0aGUgRmFsbGVuIGZhaWx1cmVcclxuICAgICdXZWVwaW5nIERvb20nOiAnMzhFJywgLy8gRm9yZ2FsbCBIYWFnZW50aSBNb3J0YWwgUmF5XHJcbiAgICAnV2VlcGluZyBBc3NpbWlsYXRpb24nOiAnNDJDJywgLy8gT3ptYXNoYWRlIEFzc2ltaWxhdGlvbiBsb29rLWF3YXlcclxuICAgICdXZWVwaW5nIFN0dW4nOiAnOTUnLCAvLyBDYWxvZmlzdGVyaSBQZW5ldHJhdGlvbiBsb29rLWF3YXlcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQXJhY2huZSBXZWInOiAnMTg1RScsIC8vIEFyYWNobmUgRXZlIGhlYWRtYXJrZXIgd2ViIGFvZVxyXG4gICAgJ1dlZXBpbmcgRWFydGggQWV0aGVyJzogJzE4NDEnLCAvLyBBcmFjaG5lIEV2ZSBvcmJzXHJcbiAgICAnV2VlcGluZyBFcGlncmFwaCc6ICcxODUyJywgLy8gSGVhZHN0b25lIHVudGVsZWdyYXBoZWQgbGFzZXIgbGluZSB0YW5rIGF0dGFja1xyXG4gICAgLy8gVGhpcyBpcyB0b28gbm9pc3kuICBCZXR0ZXIgdG8gcG9wIHRoZSBiYWxsb29ucyB0aGFuIHdvcnJ5IGFib3V0IGZyaWVuZHMuXHJcbiAgICAvLyAnV2VlcGluZyBFeHBsb3Npb24nOiAnMTgwNycsIC8vIE96bWFzcGhlcmUgQ3ViZSBvcmIgZXhwbG9zaW9uXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMSc6ICcxODBDJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDInOiAnMTgxMCcsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEJsb29kaWVkIE5haWwnOiAnMTgxRicsIC8vIENhbG9maXN0ZXJpIGF4ZS9idWxiIGFwcGVhcmluZ1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEZvcmdhbGwgR3JhZHVhbCBab21iaWZpY2F0aW9uIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDE1JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuem9tYmllID8/PSB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEZvcmdhbGwgR3JhZHVhbCBab21iaWZpY2F0aW9uIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDE1JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuem9tYmllID0gZGF0YS56b21iaWUgfHwge307XHJcbiAgICAgICAgZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBNZWdhIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxN0NBJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS56b21iaWUgJiYgIWRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuc2hpZWxkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNoaWVsZCA9IGRhdGEuc2hpZWxkIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2hpZWxkW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEZsYXJpbmcgRXBpZ3JhcGgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4NTYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnNoaWVsZCAmJiAhZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgbmFtZSBpcyBoZWxwZnVsbHkgY2FsbGVkIFwiQXR0YWNrXCIgc28gbmFtZSBpdCBzb21ldGhpbmcgZWxzZS5cclxuICAgICAgaWQ6ICdXZWVwaW5nIE96bWEgVGFuayBMYXNlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIGlkOiAnMTgzMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGRlOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGZyOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGphOiAn44K/44Oz44Kv44Os44K244O8JyxcclxuICAgICAgICAgICAgY246ICflnablhYvmv4DlhYknLFxyXG4gICAgICAgICAgICBrbzogJ+2Dsey7pCDroIjsnbTsoIAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIE96bWEgSG9seScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTgyRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ2lzdCBydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDvvIEnLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0ltcD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyZWF0R3ViYWxMaWJyYXJ5SGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBUZXJyb3IgRXllJzogJzkzMCcsIC8vIENpcmNsZSBBb0UsIFNwaW5lIEJyZWFrZXIgdHJhc2hcclxuICAgICdHdWJhbEhtIEJhdHRlcic6ICcxOThBJywgLy8gQ2lyY2xlIEFvRSwgdHJhc2ggYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gQ29uZGVtbmF0aW9uJzogJzM5MCcsIC8vIENvbmFsIEFvRSwgQmlibGlvdm9yZSB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMSc6ICcxOTQzJywgLy8gRmFsbGluZyBib29rIHNoYWRvdywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAyJzogJzE5NDAnLCAvLyBSdXNoIEFvRSBmcm9tIGVuZHMsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMyc6ICcxOTQyJywgLy8gUnVzaCBBb0UgYWNyb3NzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIEZyaWdodGZ1bCBSb2FyJzogJzE5M0InLCAvLyBHZXQtT3V0IEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAxJzogJzE5M0QnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDInOiAnMTkzRicsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMyc6ICcxOTQxJywgLy8gSW5pdGlhbCBzaWRlIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGVzb2xhdGlvbic6ICcxOThDJywgLy8gTGluZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFya25lc3MnOiAnM0EwJywgLy8gQ29uYWwgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRmlyZXdhdGVyJzogJzNCQScsIC8vIENpcmNsZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBFbGJvdyBEcm9wJzogJ0NCQScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmsnOiAnMTlERicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBTZWFscyc6ICcxOTRBJywgLy8gU3VuL01vb25zZWFsIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gV2F0ZXIgSUlJJzogJzFDNjcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBQb3JvZ28gUGVnaXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBSYWdpbmcgQXhlJzogJzE3MDMnLCAvLyBTbWFsbCBjb25hbCBBb0UsIE1lY2hhbm9zZXJ2aXRvciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gTWFnaWMgSGFtbWVyJzogJzE5OTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBBcGFuZGEgbWluaS1ib3NzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIEdyYXZpdHknOiAnMTk1MCcsIC8vIENpcmNsZSBBb0UgZnJvbSBncmF2aXR5IHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBMZXZpdGF0aW9uJzogJzE5NEYnLCAvLyBDaXJjbGUgQW9FIGZyb20gbGV2aXRhdGlvbiBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIENvbWV0JzogJzE5NjknLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1YmFsSG0gRWNsaXB0aWMgTWV0ZW9yJzogJzE5NUMnLCAvLyBMb1MgbWVjaGFuaWMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBTZWFyaW5nIFdpbmQnOiAnMTk0NCcsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFRodW5kZXInOiAnMTlbQUJdJywgLy8gU3ByZWFkIG1hcmtlciwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBGaXJlIGdhdGUgaW4gaGFsbHdheSB0byBib3NzIDIsIG1hZ25ldCBmYWlsdXJlIG9uIGJvc3MgMlxyXG4gICAgICBpZDogJ0d1YmFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTBCJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGFyZ2V0cyB3aXRoIEltcCB3aGVuIFRodW5kZXIgSUlJIHJlc29sdmVzIHJlY2VpdmUgYSB2dWxuZXJhYmlsaXR5IHN0YWNrIGFuZCBicmllZiBzdHVuXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgVGh1bmRlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVtBQl0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzSW1wPy5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxOTU2JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBBbHdheXMgaGl0cyB0YXJnZXQsIGJ1dCBpZiBjb3JyZWN0bHkgcmVzb2x2ZWQgd2lsbCBkZWFsIDAgZGFtYWdlXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gVG9ybmFkbycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVs3OF0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNvaG1BbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NvaG1BbEhtIERlYWRseSBWYXBvcic6ICcxREM5JywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9Fc1xyXG4gICAgJ1NvaG1BbEhtIERlZXByb290JzogJzFDREEnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBPZGlvdXMgQWlyJzogJzFDREInLCAvLyBDb25hbCBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEdsb3Jpb3VzIEJsYXplJzogJzFDMzMnLCAvLyBDaXJjbGUgQW9FLCBTbWFsbCBTcG9yZSBTYWMsIGJvc3MgMVxyXG4gICAgJ1NvaG1BbEhtIEZvdWwgV2F0ZXJzJzogJzExOEEnLCAvLyBDb25hbCBBb0UsIE1vdW50YWludG9wIE9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGxhaW4gUG91bmQnOiAnMTE4NycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIE1vdW50YWludG9wIEhyb3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQYWxzeW55eGlzJzogJzExNjEnLCAvLyBDb25hbCBBb0UsIE92ZXJncm93biBEaWZmbHVnaWEgdHJhc2hcclxuICAgICdTb2htQWxIbSBTdXJmYWNlIEJyZWFjaCc6ICcxRTgwJywgLy8gQ2lyY2xlIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEZyZXNod2F0ZXIgQ2Fubm9uJzogJzExOUYnLCAvLyBMaW5lIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU21hc2gnOiAnMUMzNScsIC8vIFVudGVsZWdyYXBoZWQgcmVhciBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gVGFpbCBTd2luZyc6ICcxQzM2JywgLy8gVW50ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFJpcHBlciBDbGF3JzogJzFDMzcnLCAvLyBVbnRlbGVncmFwaGVkIGZyb250YWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbmQgU2xhc2gnOiAnMUMzOCcsIC8vIENpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBDaGFyZ2UnOiAnMUMzOScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEhvdCBDaGFyZ2UnOiAnMUMzQScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEZpcmViYWxsJzogJzFDM0InLCAvLyBVbnRlbGVncmFwaGVkIHRhcmdldGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gTGF2YSBGbG93JzogJzFDM0MnLCAvLyBVbnRlbGVncmFwaGVkIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIEhvcm4nOiAnMTUwNycsIC8vIENvbmFsIEFvRSwgQWJhbGF0aGlhbiBDbGF5IEdvbGVtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTGF2YSBCcmVhdGgnOiAnMUM0RCcsIC8vIENvbmFsIEFvRSwgTGF2YSBDcmFiIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUmluZyBvZiBGaXJlJzogJzFDNEMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBWb2xjYW5vIEFuYWxhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMSc6ICcxQzQzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMic6ICcxQzQ0JywgLy8gMjcwLWRlZ3JlZSByZWFyIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMyc6ICcxQzQyJywgLy8gUmluZyBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIFJlYWxtIFNoYWtlcic6ICcxQzQxJywgLy8gQ2lyY2xlIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXYXJucyBpZiBwbGF5ZXJzIHN0ZXAgaW50byB0aGUgbGF2YSBwdWRkbGVzLiBUaGVyZSBpcyB1bmZvcnR1bmF0ZWx5IG5vIGRpcmVjdCBkYW1hZ2UgZXZlbnQuXHJcbiAgICAgIGlkOiAnU29obUFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBhc3NhdWx0Pzogc3RyaW5nW107XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGV4YW5kZXJUaGVTb3VsT2ZUaGVDcmVhdG9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBMTJOIFNhY3JhbWVudCc6ICcxQUU2JywgLy8gQ3Jvc3MgTGFzZXJzXHJcbiAgICAnQTEyTiBHcmF2aXRhdGlvbmFsIEFub21hbHknOiAnMUFFQicsIC8vIEdyYXZpdHkgUHVkZGxlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQTEyTiBEaXZpbmUgU3BlYXInOiAnMUFFMycsIC8vIEluc3RhbnQgY29uYWwgdGFuayBjbGVhdmVcclxuICAgICdBMTJOIEJsYXppbmcgU2NvdXJnZSc6ICcxQUU5JywgLy8gT3JhbmdlIGhlYWQgbWFya2VyIHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIFBsYWludCBPZiBTZXZlcml0eSc6ICcxQUYxJywgLy8gQWdncmF2YXRlZCBBc3NhdWx0IHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIENvbW11bmlvbic6ICcxQUZDJywgLy8gVGV0aGVyIFB1ZGRsZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDYxJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdCA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5hc3NhdWx0LnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSXQgaXMgYSBmYWlsdXJlIGZvciBhIFNldmVyaXR5IG1hcmtlciB0byBzdGFjayB3aXRoIHRoZSBTb2xpZGFyaXR5IGdyb3VwLlxyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBGYWlsdXJlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUFGMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5hc3NhdWx0Py5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRGlkblxcJ3QgU3ByZWFkIScsXHJcbiAgICAgICAgICAgIGRlOiAnTmljaHQgdmVydGVpbHQhJyxcclxuICAgICAgICAgICAgZnI6ICdOZSBzXFwnZXN0IHBhcyBkaXNwZXJzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5pWj6ZaL44GX44Gq44GL44Gj44GfIScsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh5pyJ5pWj5byAIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDbGVhbnVwJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMjAsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmFzc2F1bHQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGFNaGlnbyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIE1hZ2l0ZWsgUmF5JzogJzI0Q0UnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIFByZWRhdG9yIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIExvY2sgT24nOiAnMjA0NycsIC8vIEhvbWluZyBjaXJjbGVzLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAxJzogJzIwNDknLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAyJzogJzIwNEInLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAzJzogJzIwNEMnLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gU2hvdWxkZXIgQ2Fubm9uJzogJzI0RDAnLCAvLyBDaXJjbGUgQW9FLCBMZWdpb24gQXZlbmdlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDYW5ub25maXJlJzogJzIzRUQnLCAvLyBFbnZpcm9ubWVudGFsIGNpcmNsZSBBb0UsIHBhdGggdG8gYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzIwNUEnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gSW50ZWdyYXRlZCBBZXRoZXJvbW9kdWxhdG9yJzogJzIwNUInLCAvLyBSaW5nIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENpcmNsZSBPZiBEZWF0aCc6ICcyNEQ0JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIEhleGFkcm9uZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBFeGhhdXN0JzogJzI0RDMnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEdyYW5kIFN3b3JkJzogJzI0RDInLCAvLyBDb25hbCBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDEnOiAnMjA2NicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmUtaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAyJzogJzI1ODcnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAxJzogJzI0QjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJpbWFyeSBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDInOiAnMjA2QycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBoZWxwZXIgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gTGlnaHRsZXNzIFNwYXJrJzogJzIwNkInLCAvLyBDb25hbCBBb0UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIERlbWltYWdpY2tzJzogJzIwNUUnLFxyXG4gICAgJ0FsYSBNaGlnbyBVbm1vdmluZyBUcm9pa2EnOiAnMjA2MCcsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMSc6ICcyMDY5JyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAyJzogJzI1ODknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSXQncyBwb3NzaWJsZSBwbGF5ZXJzIG1pZ2h0IGp1c3Qgd2FuZGVyIGludG8gdGhlIGJhZCBvbiB0aGUgb3V0c2lkZSxcclxuICAgICAgLy8gYnV0IG5vcm1hbGx5IHBlb3BsZSBnZXQgcHVzaGVkIGludG8gaXQuXHJcbiAgICAgIGlkOiAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dlbGwnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBEYW1hZ2UgRG93blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkI4JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyLCBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gRm9yIHJlYXNvbnMgbm90IGNvbXBsZXRlbHkgdW5kZXJzdG9vZCBhdCB0aGUgdGltZSB0aGlzIHdhcyBtZXJnZWQsXHJcbi8vIGJ1dCBsaWtlbHkgcmVsYXRlZCB0byB0aGUgZmFjdCB0aGF0IG5vIG5hbWVwbGF0ZXMgYXJlIHZpc2libGUgZHVyaW5nIHRoZSBlbmNvdW50ZXIsXHJcbi8vIGFuZCB0aGF0IG5vdGhpbmcgaW4gdGhlIGVuY291bnRlciBhY3R1YWxseSBkb2VzIGRhbWFnZSxcclxuLy8gd2UgY2FuJ3QgdXNlIGRhbWFnZVdhcm4gb3IgZ2FpbnNFZmZlY3QgaGVscGVycyBvbiB0aGUgQmFyZGFtIGZpZ2h0LlxyXG4vLyBJbnN0ZWFkLCB3ZSB1c2UgdGhpcyBoZWxwZXIgZnVuY3Rpb24gdG8gbG9vayBmb3IgZmFpbHVyZSBmbGFncy5cclxuLy8gSWYgdGhlIGZsYWcgaXMgcHJlc2VudCxhIGZ1bGwgdHJpZ2dlciBvYmplY3QgaXMgcmV0dXJuZWQgdGhhdCBkcm9wcyBpbiBzZWFtbGVzc2x5LlxyXG5jb25zdCBhYmlsaXR5V2FybiA9IChhcmdzOiB7IGFiaWxpdHlJZDogc3RyaW5nOyBpZDogc3RyaW5nIH0pOiBPb3BzeVRyaWdnZXI8RGF0YT4gPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHkgJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICBjb25zdCB0cmlnZ2VyOiBPb3BzeVRyaWdnZXI8RGF0YT4gPSB7XHJcbiAgICBpZDogYXJncy5pZCxcclxuICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMuZmxhZ3Muc3Vic3RyKC0yKSA9PT0gJzBFJyxcclxuICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICB9LFxyXG4gIH07XHJcbiAgcmV0dXJuIHRyaWdnZXI7XHJcbn07XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQmFyZGFtc01ldHRsZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQmFyZGFtIERpcnR5IENsYXcnOiAnMjFBOCcsIC8vIEZyb250YWwgY2xlYXZlLCBHdWxvIEd1bG8gdHJhc2hcclxuICAgICdCYXJkYW0gRXBpZ3JhcGgnOiAnMjNBRicsIC8vIExpbmUgQW9FLCBXYWxsIG9mIEJhcmRhbSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBUaGUgRHVzayBTdGFyJzogJzIxODcnLCAvLyBDaXJjbGUgQW9FLCBlbnZpcm9ubWVudCBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBUaGUgRGF3biBTdGFyJzogJzIxODYnLCAvLyBDaXJjbGUgQW9FLCBlbnZpcm9ubWVudCBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBDcnVtYmxpbmcgQ3J1c3QnOiAnMUYxMycsIC8vIENpcmNsZSBBb0VzLCBHYXJ1bGEsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gUmFtIFJ1c2gnOiAnMUVGQycsIC8vIExpbmUgQW9FcywgU3RlcHBlIFlhbWFhLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBMdWxsYWJ5JzogJzI0QjInLCAvLyBDaXJjbGUgQW9FcywgU3RlcHBlIFNoZWVwLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBIZWF2ZSc6ICcxRUY3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaWRlIEJsYXN0ZXInOiAnMjRCMycsIC8vIEVub3Jtb3VzIGZyb250YWwgY2xlYXZlLCBTdGVwcGUgQ29ldXJsLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIERvdWJsZSBTbWFzaCc6ICcyNkEnLCAvLyBDaXJjbGUgQW9FLCBNZXR0bGluZyBEaGFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBUcmFuc29uaWMgQmxhc3QnOiAnMTI2MicsIC8vIENpcmNsZSBBb0UsIFN0ZXBwZSBFYWdsZSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBXaWxkIEhvcm4nOiAnMjIwOCcsIC8vIEZyb250YWwgY2xlYXZlLCBLaHVuIEd1cnZlbCB0cmFzaFxyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMSc6ICcyNTc4JywgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAyJzogJzI1NzknLCAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDMnOiAnMjU3QScsIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAxJzogJzI1N0InLCAvLyAxIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVHJlbWJsb3IgMic6ICcyNTdDJywgLy8gMiBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRocm93aW5nIFNwZWFyJzogJzI1N0YnLCAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQmFyZGFtXFwncyBSaW5nJzogJzI1ODEnLCAvLyBEb251dCBBb0UgaGVhZG1hcmtlcnMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQnOiAnMjU3RCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIENvbWV0IEltcGFjdCc6ICcyNTgwJywgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIElyb24gU3BoZXJlIEF0dGFjayc6ICcxNkI2JywgLy8gQ29udGFjdCBkYW1hZ2UsIElyb24gU3BoZXJlIHRyYXNoLCBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUb3JuYWRvJzogJzI0N0UnLCAvLyBDaXJjbGUgQW9FLCBLaHVuIFNoYXZhcmEgdHJhc2hcclxuICAgICdCYXJkYW0gUGluaW9uJzogJzFGMTEnLCAvLyBMaW5lIEFvRSwgWW9sIEZlYXRoZXIsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gRmVhdGhlciBTcXVhbGwnOiAnMUYwRScsIC8vIERhc2ggYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gRmx1dHRlcmZhbGwgVW50YXJnZXRlZCc6ICcxRjEyJywgLy8gUm90YXRpbmcgY2lyY2xlIEFvRXMsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnQmFyZGFtIENvbmZ1c2VkJzogJzBCJywgLy8gRmFpbGVkIGdhemUgYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0JhcmRhbSBGZXR0ZXJzJzogJzU2RicsIC8vIEZhaWxpbmcgdHdvIG1lY2hhbmljcyBpbiBhbnkgb25lIHBoYXNlIG9uIEJhcmRhbSwgc2Vjb25kIGJvc3MuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCYXJkYW0gR2FydWxhIFJ1c2gnOiAnMUVGOScsIC8vIExpbmUgQW9FLCBHYXJ1bGEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFRhcmdldGVkJzogJzFGMEMnLCAvLyBDaXJjbGUgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaW5nYmVhdCc6ICcxRjBGJywgLy8gQ29uYWwgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIC8vIDEgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMScsIGFiaWxpdHlJZDogJzI1NzgnIH0pLFxyXG4gICAgLy8gMiBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAyJywgYWJpbGl0eUlkOiAnMjU3OScgfSksXHJcbiAgICAvLyAzIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDMnLCBhYmlsaXR5SWQ6ICcyNTdBJyB9KSxcclxuICAgIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAxJywgYWJpbGl0eUlkOiAnMjU3QicgfSksXHJcbiAgICAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVHJlbWJsb3IgMicsIGFiaWxpdHlJZDogJzI1N0MnIH0pLFxyXG4gICAgLy8gQ2hlY2tlcmJvYXJkIEFvRSwgVGhyb3dpbmcgU3BlYXIsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRocm93aW5nIFNwZWFyJywgYWJpbGl0eUlkOiAnMjU3RicgfSksXHJcbiAgICAvLyBHYXplIGF0dGFjaywgV2FycmlvciBvZiBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEVtcHR5IEdhemUnLCBhYmlsaXR5SWQ6ICcxRjA0JyB9KSxcclxuICAgIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbVxcJ3MgUmluZycsIGFiaWxpdHlJZDogJzI1ODEnIH0pLFxyXG4gICAgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gQ29tZXQnLCBhYmlsaXR5SWQ6ICcyNTdEJyB9KSxcclxuICAgIC8vIENpcmNsZSBBb0VzLCBTdGFyIFNoYXJkLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCBJbXBhY3QnLCBhYmlsaXR5SWQ6ICcyNTgwJyB9KSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuS3VnYW5lQ2FzdGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIFRlbmthIEdva2tlbic6ICcyMzI5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgIEpvaSBCbGFkZSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgS2Vua2kgUmVsZWFzZSBUcmFzaCc6ICcyMzMwJywgLy8gQ2hhcmlvdCBBb0UsIEpvaSBLaXlvZnVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIENsZWFyb3V0JzogJzFFOTInLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBadWlrby1NYXJ1LCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAxJzogJzFFOTYnLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJhLUtpcmkgMic6ICcyNEY5JywgLy8gR2lhbnQgY2lyY2xlIEFvRSwgSGFyYWtpcmkgS29zaG8sIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMSc6ICcyMzJEJywgLy8gTGluZSBBb0UsIEthcmFrdXJpIE9ubWl0c3UgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIDEwMDAgQmFyYnMnOiAnMjE5OCcsIC8vIExpbmUgQW9FLCBKb2kgS29qYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMic6ICcxRTk4JywgLy8gTGluZSBBb0UsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGF0YW1pLUdhZXNoaSc6ICcxRTlEJywgLy8gRmxvb3IgdGlsZSBsaW5lIGF0dGFjaywgRWxraXRlIE9ubWl0c3UsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAzJzogJzFFQTAnLCAvLyBMaW5lIEFvRSwgRWxpdGUgT25taXRzdSwgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQXV0byBDcm9zc2Jvdyc6ICcyMzMzJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgS2FyYWt1cmkgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYWtpcmkgMyc6ICcyM0M5JywgLy8gR2lhbnQgQ2lyY2xlIEFvRSwgSGFyYWtpcmkgIEhhbnlhIHRyYXNoLCBhZnRlciBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBJYWktR2lyaSc6ICcxRUEyJywgLy8gQ2hhcmlvdCBBb0UsIFlvamltYm8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRnJhZ2lsaXR5JzogJzFFQUEnLCAvLyBDaGFyaW90IEFvRSwgSW5vc2hpa2FjaG8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRHJhZ29uZmlyZSc6ICcxRUFCJywgLy8gTGluZSBBb0UsIERyYWdvbiBIZWFkLCBib3NzIDNcclxuICB9LFxyXG5cclxuICBzaGFyZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIElzc2VuJzogJzFFOTcnLCAvLyBJbnN0YW50IGZyb250YWwgY2xlYXZlLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIENsb2Nrd29yayBSYWl0b24nOiAnMUU5QicsIC8vIExhcmdlIGxpZ2h0bmluZyBzcHJlYWQgY2lyY2xlcywgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIFp1aWtvIE1hcnUsIGJvc3MgMVxyXG4gICAgICBpZDogJ0t1Z2FuZSBDYXN0bGUgSGVsbSBDcmFjaycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMUU5NCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnR5cGUgPT09ICcyMScsIC8vIFRha2luZyB0aGUgc3RhY2sgc29sbyBpcyAqcHJvYmFibHkqIGEgbWlzdGFrZS5cclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2FpbnRNb2NpYW5uZXNBcmJvcmV0dW1IYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZHN0cmVhbSc6ICczMEQ5JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgSW1tYWN1bGF0ZSBBcGEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNpbGtlbiBTcHJheSc6ICczMzg1JywgLy8gUmVhciBjb25lIEFvRSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgTXVkZHkgUHVkZGxlcyc6ICczMERBJywgLy8gU21hbGwgdGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIERvcnBva2t1ciB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEFpcic6ICcyRTQ5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTTHVkZ2UgQm9tYic6ICcyRTRFJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEF0bW9zcGhlcmUnOiAnMkU1MScsIC8vIENoYW5uZWxlZCAzLzQgYXJlbmEgY2xlYXZlLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIENyZWVwaW5nIEl2eSc6ICczMUE1JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgV2l0aGVyZWQgS3VsYWsgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFJvY2tzbGlkZSc6ICczMTM0JywgLy8gTGluZSBBb0UsIFNpbHQgR29sZW0sIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBJbm5lcic6ICczMTJFJywgLy8gQ2hhcmlvdCBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBPdXRlcic6ICczMTJGJywgLy8gRHluYW1vIEFvRSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFbWJhbG1pbmcgRWFydGgnOiAnMzFBNicsIC8vIExhcmdlIENoYXJpb3QgQW9FLCBNdWRkeSBNYXRhLCBhZnRlciBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1aWNrbWlyZSc6ICczMTM2JywgLy8gU2V3YWdlIHN1cmdlIGF2b2lkZWQgb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUXVhZ21pcmUgUGxhdGZvcm1zJzogJzMxMzknLCAvLyBRdWFnbWlyZSBleHBsb3Npb24gb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRmVjdWxlbnQgRmxvb2QnOiAnMzEzQycsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDb3JydXB0dXJlJzogJzMzQTAnLCAvLyBNdWQgU2xpbWUgZXhwbG9zaW9uLCBib3NzIDMuIChObyBleHBsb3Npb24gaWYgZG9uZSBjb3JyZWN0bHkuKVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTZWR1Y2VkJzogJzNERicsIC8vIEdhemUgZmFpbHVyZSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUG9sbGVuJzogJzEzJywgLy8gU2x1ZGdlIHB1ZGRsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVHJhbnNmaWd1cmF0aW9uJzogJzY0OCcsIC8vIFJvbHktUG9seSBBb0UgY2lyY2xlIGZhaWx1cmUsIEJMb29taW5nIEJpbG9rbyB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBmYWlsdXJlLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFN0YWIgV291bmQnOiAnNDVEJywgLy8gQXJlbmEgb3V0ZXIgd2FsbCBlZmZlY3QsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBUYXByb290JzogJzJFNEMnLCAvLyBMYXJnZSBvcmFuZ2Ugc3ByZWFkIGNpcmNsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGggU2hha2VyJzogJzMxMzEnLCAvLyBFYXJ0aCBTaGFrZXIsIExha2hhbXUsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZhdWx0IFdhcnJlbic6ICcyRTRBJywgLy8gU3RhY2sgbWFya2VyLCBOdWxsY2h1LCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU3dhbGxvd3NDb21wYXNzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEl2eSBGZXR0ZXJzJzogJzJDMDQnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDEnOiAnMkMwNScsIC8vIFRvcm5hZG8gZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBZYW1hLUthZ3VyYSc6ICcyQjk2JywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZsYW1lcyBPZiBIYXRlJzogJzJCOTgnLCAvLyBGaXJlIG9yYiBleHBsb3Npb25zLCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIENvbmZsYWdyYXRlJzogJzJCOTknLCAvLyBDb2xsaXNpb24gd2l0aCBmaXJlIG9yYiwgYm9zcyAxXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVXB3ZWxsJzogJzJDMDYnLCAvLyBUYXJnZXRlZCBjaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmFkIEJyZWF0aCc6ICcyQzA3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEppbm1lbmp1IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDEnOiAnMkI5RCcsIC8vIEhhbGYgYXJlbmEgcmlnaHQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEdyZWF0ZXIgUGFsbSAyJzogJzJCOUUnLCAvLyBIYWxmIGFyZW5hIGxlZnQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRyaWJ1dGFyeSc6ICcyQkEwJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25hbCBncm91bmQgQW9FcywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDInOiAnMkMwNicsIC8vIENpcmNsZSBncm91bmQgQW9FLCBlbnZpcm9ubWVudCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMyc6ICcyQzA3JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIHBsYWNlZCBieSBTYWkgVGFpc3VpIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZpbG9wbHVtZXMnOiAnMkM3NicsIC8vIEZyb250YWwgcmVjdGFuZ2xlIEFvRSwgRHJhZ29uIEJpIEZhbmcgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAxJzogJzJCQTgnLCAvLyBDaGFyaW90IEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDInOiAnMkJBOScsIC8vIER5bmFtbyBBb0UsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAzJzogJzJCQUUnLCAvLyBDaGFyaW90IEFvRSwgU2hhZG93IE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyA0JzogJzJCQUYnLCAvLyBEeW5hbW8gQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRXF1YWwgT2YgSGVhdmVuJzogJzJCQjQnLCAvLyBTbWFsbCBjaXJjbGUgZ3JvdW5kIEFvRXMsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBhdHRhY2sgZmFpbHVyZSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJsZWVkaW5nJzogJzExMkYnLCAvLyBTdGVwcGluZyBvdXRzaWRlIHRoZSBhcmVuYSwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1pcmFnZSc6ICcyQkEyJywgLy8gUHJleS1jaGFzaW5nIHB1ZGRsZXMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgTW91bnRhaW4gRmFsbHMnOiAnMkJBNScsIC8vIENpcmNsZSBzcHJlYWQgbWFya2VycywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBUaGUgTG9uZyBFbmQnOiAnMkJBNycsIC8vIExhc2VyIHRldGhlciwgUWl0aWFuIERhc2hlbmcgIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kIDInOiAnMkJBRCcsIC8vIExhc2VyIFRldGhlciwgU2hhZG93cyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFuZGluZyBpbiB0aGUgbGFrZSwgRGlhZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBTaXggRnVsbXMgVW5kZXInLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjM3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgYm9zcyAzXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBGaXZlIEZpbmdlcmVkIFB1bmlzaG1lbnQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWycyQkFCJywgJzJCQjAnXSwgc291cmNlOiBbJ1FpdGlhbiBEYXNoZW5nJywgJ1NoYWRvdyBPZiBUaGUgU2FnZSddIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50eXBlID09PSAnMjEnLCAvLyBUYWtpbmcgdGhlIHN0YWNrIHNvbG8gaXMgKnByb2JhYmx5KiBhIG1pc3Rha2UuXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRlbXBsZU9mVGhlRmlzdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEZpcmUgQnJlYWsnOiAnMjFFRCcsIC8vIENvbmFsIEFvRSwgQmxvb2RnbGlkZXIgTW9uayB0cmFzaFxyXG4gICAgJ1RlbXBsZSBSYWRpYWwgQmxhc3Rlcic6ICcxRkQzJywgLy8gQ2lyY2xlIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIFdpZGUgQmxhc3Rlcic6ICcxRkQ0JywgLy8gQ29uYWwgQW9FLCBib3NzIDFcclxuICAgICdUZW1wbGUgQ3JpcHBsaW5nIEJsb3cnOiAnMjAxNicsIC8vIExpbmUgQW9FcywgZW52aXJvbm1lbnRhbCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBCcm9rZW4gRWFydGgnOiAnMjM2RScsIC8vIENpcmNsZSBBb0UsIFNpbmdoYSB0cmFzaFxyXG4gICAgJ1RlbXBsZSBTaGVhcic6ICcxRkREJywgLy8gRHVhbCBjb25hbCBBb0UsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBDb3VudGVyIFBhcnJ5JzogJzFGRTAnLCAvLyBSZXRhbGlhdGlvbiBmb3IgaW5jb3JyZWN0IGRpcmVjdGlvbiBhZnRlciBLaWxsZXIgSW5zdGluY3QsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBUYXBhcyc6ICcnLCAvLyBUcmFja2luZyBjaXJjdWxhciBncm91bmQgQW9FcywgYm9zcyAyXHJcbiAgICAnVGVtcGxlIEhlbGxzZWFsJzogJzIwMEYnLCAvLyBSZWQvQmx1ZSBzeW1ib2wgZmFpbHVyZSwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIFB1cmUgV2lsbCc6ICcyMDE3JywgLy8gQ2lyY2xlIEFvRSwgU3Bpcml0IEZsYW1lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1lZ2FibGFzdGVyJzogJzE2MycsIC8vIENvbmFsIEFvRSwgQ29ldXJsIFByYW5hIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnVGVtcGxlIFdpbmRidXJuJzogJzFGRTgnLCAvLyBDaXJjbGUgQW9FLCBUd2lzdGVyIHdpbmQsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBIdXJyaWNhbmUgS2ljayc6ICcxRkU1JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIFNpbGVudCBSb2FyJzogJzFGRUInLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDNcclxuICAgICdUZW1wbGUgTWlnaHR5IEJsb3cnOiAnMUZFQScsIC8vIENvbnRhY3Qgd2l0aCBjb2V1cmwgaGVhZCwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUZW1wbGUgSGVhdCBMaWdodG5pbmcnOiAnMUZENycsIC8vIFB1cnBsZSBzcHJlYWQgY2lyY2xlcywgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVCdXJuLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaGUgQnVybiBGYWxsaW5nIFJvY2snOiAnMzFBMycsIC8vIEVudmlyb25tZW50YWwgbGluZSBBb0VcclxuICAgICdUaGUgQnVybiBBZXRoZXJpYWwgQmxhc3QnOiAnMzI4QicsIC8vIExpbmUgQW9FLCBLdWt1bGthbiB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIE1vbGUtYS13aGFjayc6ICczMjhEJywgLy8gQ2lyY2xlIEFvRSwgRGVzZXJ0IERlc21hbiB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEhlYWQgQnV0dCc6ICczMjhFJywgLy8gU21hbGwgY29uYWwgQW9FLCBEZXNlcnQgRGVzbWFuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2hhcmRmYWxsJzogJzMxOTEnLCAvLyBSb29td2lkZSBBb0UsIExvUyBmb3Igc2FmZXR5LCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBEaXNzb25hbmNlJzogJzMxOTInLCAvLyBEb251dCBBb0UsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIENyeXN0YWxsaW5lIEZyYWN0dXJlJzogJzMxOTcnLCAvLyBDaXJjbGUgQW9FLCBEaW0gQ3J5c3RhbCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gUmVzb25hbnQgRnJlcXVlbmN5JzogJzMxOTgnLCAvLyBDaXJjbGUgQW9FLCBEaW0gQ3J5c3RhbCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gUm90b3N3aXBlJzogJzMyOTEnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBDaGFycmVkIERyZWFkbmF1Z2h0IHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gV3JlY2tpbmcgQmFsbCc6ICczMjkyJywgLy8gQ2lyY2xlIEFvRSwgQ2hhcnJlZCBEcmVhZG5hdWdodCB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFNoYXR0ZXInOiAnMzI5NCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIENoYXJyZWQgRG9ibHluIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gQXV0by1DYW5ub25zJzogJzMyOTUnLCAvLyBMaW5lIEFvRSwgQ2hhcnJlZCBEcm9uZSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFNlbGYtRGV0b25hdGUnOiAnMzI5NicsIC8vIENpcmNsZSBBb0UsIENoYXJyZWQgRHJvbmUgdHJhc2hcclxuICAgICdUaGUgQnVybiBGdWxsIFRocm90dGxlJzogJzJENzUnLCAvLyBMaW5lIEFvRSwgRGVmZWN0aXZlIERyb25lLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBUaHJvdHRsZSc6ICcyRDc2JywgLy8gTGluZSBBb0UsIE1pbmluZyBEcm9uZSBhZGRzLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBBZGl0IERyaXZlcic6ICcyRDc4JywgLy8gTGluZSBBb0UsIFJvY2sgQml0ZXIgYWRkcywgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gVHJlbWJsb3InOiAnMzI5NycsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFZlaWxlZCBHaWdhd29ybSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIERlc2VydCBTcGljZSc6ICczMjk4JywgLy8gVGhlIGZyb250YWwgY2xlYXZlcyBtdXN0IGZsb3dcclxuICAgICdUaGUgQnVybiBUb3hpYyBTcHJheSc6ICczMjlBJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgR2lnYXdvcm0gU3RhbGtlciB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFZlbm9tIFNwcmF5JzogJzMyOUInLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBHaWdhd29ybSBTdGFsa2VyIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gV2hpdGUgRGVhdGgnOiAnMzE0MycsIC8vIFJlYWN0aXZlIGR1cmluZyBpbnZ1bG5lcmFiaWxpdHksIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBGb2cgUGx1bWUgMSc6ICczMTQ1JywgLy8gU3RhciBBb0UsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBGb2cgUGx1bWUgMic6ICczMTQ2JywgLy8gTGluZSBBb0VzIGFmdGVyIHN0YXJzLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gQ2F1dGVyaXplJzogJzMxNDgnLCAvLyBMaW5lL1N3b29wIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RoZSBCdXJuIENvbGQgRm9nJzogJzMxNDInLCAvLyBHcm93aW5nIGNpcmNsZSBBb0UsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIExlYWRlbic6ICc0MycsIC8vIFB1ZGRsZSBlZmZlY3QsIGJvc3MgMi4gKEFsc28gaW5mbGljdHMgMTFGLCBTbHVkZ2UuKVxyXG4gICAgJ1RoZSBCdXJuIFB1ZGRsZSBGcm9zdGJpdGUnOiAnMTFEJywgLy8gSWNlIHB1ZGRsZSBlZmZlY3QsIGJvc3MgMy4gKE5PVCB0aGUgY29uYWwtaW5mbGljdGVkIG9uZSwgMTBDLilcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIEhhaWxmaXJlJzogJzMxOTQnLCAvLyBIZWFkIG1hcmtlciBsaW5lIEFvRSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gU2hhcmRzdHJpa2UnOiAnMzE5NScsIC8vIE9yYW5nZSBzcHJlYWQgaGVhZCBtYXJrZXJzLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBDaGlsbGluZyBBc3BpcmF0aW9uJzogJzMxNEQnLCAvLyBIZWFkIG1hcmtlciBjbGVhdmUsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBGcm9zdCBCcmVhdGgnOiAnMzE0QycsIC8vIFRhbmsgY2xlYXZlLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8xTiAtIERlbHRhc2NhcGUgMS4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYxMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzFOIEJ1cm4nOiAnMjNENScsIC8vIEZpcmViYWxsIGV4cGxvc2lvbiBjaXJjbGUgQW9Fc1xyXG4gICAgJ08xTiBDbGFtcCc6ICcyM0UyJywgLy8gRnJvbnRhbCByZWN0YW5nbGUga25vY2tiYWNrIEFvRSwgQWx0ZSBSb2l0ZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzFOIExldmluYm9sdCc6ICcyM0RBJywgLy8gc21hbGwgc3ByZWFkIGNpcmNsZXNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPMk4gLSBEZWx0YXNjYXBlIDIuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMjAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08yTiBNYWluIFF1YWtlJzogJzI0QTUnLCAvLyBOb24tdGVsZWdyYXBoZWQgY2lyY2xlIEFvRSwgRmxlc2h5IE1lbWJlclxyXG4gICAgJ08yTiBFcm9zaW9uJzogJzI1OTAnLCAvLyBTbWFsbCBjaXJjbGUgQW9FcywgRmxlc2h5IE1lbWJlclxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzJOIFBhcmFub3JtYWwgV2F2ZSc6ICcyNTBFJywgLy8gSW5zdGFudCB0YW5rIGNsZWF2ZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gV2UgY291bGQgdHJ5IHRvIHNlcGFyYXRlIG91dCB0aGUgbWlzdGFrZSB0aGF0IGxlZCB0byB0aGUgcGxheWVyIGJlaW5nIHBldHJpZmllZC5cclxuICAgICAgLy8gSG93ZXZlciwgaXQncyBOb3JtYWwgbW9kZSwgd2h5IG92ZXJ0aGluayBpdD9cclxuICAgICAgaWQ6ICdPMk4gUGV0cmlmaWNhdGlvbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyNjInIH0pLFxyXG4gICAgICAvLyBUaGUgdXNlciBtaWdodCBnZXQgaGl0IGJ5IGFub3RoZXIgcGV0cmlmeWluZyBhYmlsaXR5IGJlZm9yZSB0aGUgZWZmZWN0IGVuZHMuXHJcbiAgICAgIC8vIFRoZXJlJ3Mgbm8gcG9pbnQgaW4gbm90aWZ5aW5nIGZvciB0aGF0LlxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzJOIEVhcnRocXVha2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNTE1JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGRlYWxzIGRhbWFnZSBvbmx5IHRvIG5vbi1mbG9hdGluZyB0YXJnZXRzLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaW5pdGlhbGl6ZWQ/OiBib29sZWFuO1xyXG4gIHBoYXNlTnVtYmVyPzogbnVtYmVyO1xyXG4gIGdhbWVDb3VudD86IG51bWJlcjtcclxufVxyXG5cclxuLy8gTzNOIC0gRGVsdGFzY2FwZSAzLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjMwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPM04gU3BlbGxibGFkZSBGaXJlIElJSSc6ICcyNDYwJywgLy8gRG9udXQgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgQmxpenphcmQgSUlJJzogJzI0NjEnLCAvLyBDaXJjbGUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgVGh1bmRlciBJSUknOiAnMjQ2MicsIC8vIExpbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIENyb3NzIFJlYXBlcic6ICcyNDZCJywgLy8gQ2lyY2xlIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gR3VzdGluZyBHb3VnZSc6ICcyNDZDJywgLy8gR3JlZW4gbGluZSBBb0UsIFNvdWwgUmVhcGVyXHJcbiAgICAnTzNOIFN3b3JkIERhbmNlJzogJzI0NzAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFVwbGlmdCc6ICcyNDczJywgLy8gR3JvdW5kIHNwZWFycywgUXVlZW4ncyBXYWx0eiBlZmZlY3QsIEhhbGljYXJuYXNzdXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPM04gVWx0aW11bSc6ICcyNDc3JywgLy8gSW5zdGFudCBraWxsLiBVc2VkIGlmIHRoZSBwbGF5ZXIgZG9lcyBub3QgZXhpdCB0aGUgc2FuZCBtYXplIGZhc3QgZW5vdWdoLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzNOIEhvbHkgQmx1cic6ICcyNDYzJywgLy8gU3ByZWFkIGNpcmNsZXMuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08zTiBQaGFzZSBUcmFja2VyJyxcclxuICAgICAgdHlwZTogJ1N0YXJ0c1VzaW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpY2FybmFzc3VzJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpY2FybmFzc2UnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+ODj+ODquOCq+ODq+ODiuODg+OCveOCuScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICftlaDrpqzsubTrpbTrgpjshozsiqQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGF0YS5waGFzZU51bWJlciA9IChkYXRhLnBoYXNlTnVtYmVyID8/IDApICsgMSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBsb3QgdG8gdHJhY2ssIGFuZCBpbiBvcmRlciB0byBtYWtlIGl0IGFsbCBjbGVhbiwgaXQncyBzYWZlc3QganVzdCB0b1xyXG4gICAgICAvLyBpbml0aWFsaXplIGl0IGFsbCB1cCBmcm9udCBpbnN0ZWFkIG9mIHRyeWluZyB0byBndWFyZCBhZ2FpbnN0IHVuZGVmaW5lZCBjb21wYXJpc29ucy5cclxuICAgICAgaWQ6ICdPM04gSW5pdGlhbGl6aW5nJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpY2FybmFzc3VzJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWthcm5hc3NvcycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzZScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ+ODj+ODquOCq+ODq+ODiuODg+OCveOCuScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ+WTiOWIqeWNoee6s+iLj+aWrycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ+2VoOumrOy5tOultOuCmOyGjOyKpCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiAhZGF0YS5pbml0aWFsaXplZCxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuZ2FtZUNvdW50ID0gMDtcclxuICAgICAgICAvLyBJbmRleGluZyBwaGFzZXMgYXQgMSBzbyBhcyB0byBtYWtlIHBoYXNlcyBtYXRjaCB3aGF0IGh1bWFucyBleHBlY3QuXHJcbiAgICAgICAgLy8gMTogV2Ugc3RhcnQgaGVyZS5cclxuICAgICAgICAvLyAyOiBDYXZlIHBoYXNlIHdpdGggVXBsaWZ0cy5cclxuICAgICAgICAvLyAzOiBQb3N0LWludGVybWlzc2lvbiwgd2l0aCBnb29kIGFuZCBiYWQgZnJvZ3MuXHJcbiAgICAgICAgZGF0YS5waGFzZU51bWJlciA9IDE7XHJcbiAgICAgICAgZGF0YS5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08zTiBSaWJiaXQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NjYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgRE8gd2FudCB0byBiZSBoaXQgYnkgVG9hZC9SaWJiaXQgaWYgdGhlIG5leHQgY2FzdCBvZiBUaGUgR2FtZVxyXG4gICAgICAgIC8vIGlzIDR4IHRvYWQgcGFuZWxzLlxyXG4gICAgICAgIGNvbnN0IGdhbWVDb3VudCA9IGRhdGEuZ2FtZUNvdW50ID8/IDA7XHJcbiAgICAgICAgcmV0dXJuICEoZGF0YS5waGFzZU51bWJlciA9PT0gMyAmJiBnYW1lQ291bnQgJSAyID09PSAwKSAmJiBtYXRjaGVzLnRhcmdldElkICE9PSAnRTAwMDAwMDAnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHdlIGNvdWxkIGRvIHRvIHRyYWNrIGV4YWN0bHkgaG93IHRoZSBwbGF5ZXIgZmFpbGVkIFRoZSBHYW1lLlxyXG4gICAgICAvLyBXaHkgb3ZlcnRoaW5rIE5vcm1hbCBtb2RlLCBob3dldmVyP1xyXG4gICAgICBpZDogJ08zTiBUaGUgR2FtZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gR3Vlc3Mgd2hhdCB5b3UganVzdCBsb3N0P1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyNDZEJyB9KSxcclxuICAgICAgLy8gSWYgdGhlIHBsYXllciB0YWtlcyBubyBkYW1hZ2UsIHRoZXkgZGlkIHRoZSBtZWNoYW5pYyBjb3JyZWN0bHkuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IGRhdGEuZ2FtZUNvdW50ID0gKGRhdGEuZ2FtZUNvdW50ID8/IDApICsgMSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzROIC0gRGVsdGFzY2FwZSA0LjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjQwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPNE4gQmxpenphcmQgSUlJJzogJzI0QkMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgRXhkZWF0aFxyXG4gICAgJ080TiBFbXBvd2VyZWQgVGh1bmRlciBJSUknOiAnMjRDMScsIC8vIFVudGVsZWdyYXBoZWQgbGFyZ2UgY2lyY2xlIEFvRSwgRXhkZWF0aFxyXG4gICAgJ080TiBab21iaWUgQnJlYXRoJzogJzI0Q0InLCAvLyBDb25hbCwgdHJlZSBoZWFkIGFmdGVyIERlY2lzaXZlIEJhdHRsZVxyXG4gICAgJ080TiBDbGVhcm91dCc6ICcyNENDJywgLy8gT3ZlcmxhcHBpbmcgY29uZSBBb0VzLCBEZWF0aGx5IFZpbmUgKHRlbnRhY2xlcyBhbG9uZ3NpZGUgdHJlZSBoZWFkKVxyXG4gICAgJ080TiBCbGFjayBTcGFyayc6ICcyNEM5JywgLy8gRXhwbG9kaW5nIEJsYWNrIEhvbGVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gRW1wb3dlcmVkIEZpcmUgSUlJIGluZmxpY3RzIHRoZSBQeXJldGljIGRlYnVmZiwgd2hpY2ggZGVhbHMgZGFtYWdlIGlmIHRoZSBwbGF5ZXJcclxuICAgIC8vIG1vdmVzIG9yIGFjdHMgYmVmb3JlIHRoZSBkZWJ1ZmYgZmFsbHMuIFVuZm9ydHVuYXRlbHkgaXQgZG9lc24ndCBsb29rIGxpa2UgdGhlcmUnc1xyXG4gICAgLy8gY3VycmVudGx5IGEgbG9nIGxpbmUgZm9yIHRoaXMsIHNvIHRoZSBvbmx5IHdheSB0byBjaGVjayBmb3IgdGhpcyBpcyB0byBjb2xsZWN0XHJcbiAgICAvLyB0aGUgZGVidWZmcyBhbmQgdGhlbiB3YXJuIGlmIGEgcGxheWVyIHRha2VzIGFuIGFjdGlvbiBkdXJpbmcgdGhhdCB0aW1lLiBOb3Qgd29ydGggaXRcclxuICAgIC8vIGZvciBOb3JtYWwuXHJcbiAgICAnTzROIFN0YW5kYXJkIEZpcmUnOiAnMjRCQScsXHJcbiAgICAnTzROIEJ1c3RlciBUaHVuZGVyJzogJzI0QkUnLCAvLyBBIGNsZWF2aW5nIHRhbmsgYnVzdGVyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBLaWxscyB0YXJnZXQgaWYgbm90IGNsZWFuc2VkXHJcbiAgICAgIGlkOiAnTzROIERvb20nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0NsZWFuc2VycyBtaXNzZWQgRG9vbSEnLFxyXG4gICAgICAgICAgICBkZTogJ0Rvb20tUmVpbmlndW5nIHZlcmdlc3NlbiEnLFxyXG4gICAgICAgICAgICBmcjogJ05cXCdhIHBhcyDDqXTDqSBkaXNzaXDDqShlKSBkdSBHbGFzICEnLFxyXG4gICAgICAgICAgICBqYTogJ+atu+OBruWuo+WRiicsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh6Kej5q275a6jJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFNob3J0IGtub2NrYmFjayBmcm9tIEV4ZGVhdGhcclxuICAgICAgaWQ6ICdPNE4gVmFjdXVtIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNEI4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gUm9vbS13aWRlIEFvRSwgZnJlZXplcyBub24tbW92aW5nIHRhcmdldHNcclxuICAgICAgaWQ6ICdPNE4gRW1wb3dlcmVkIEJsaXp6YXJkJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzRFNicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE5ldE1hdGNoZXMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9uZXRfbWF0Y2hlcyc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQ/OiBib29sZWFuO1xyXG4gIGlzTmVvRXhkZWF0aD86IGJvb2xlYW47XHJcbiAgaGFzQmV5b25kRGVhdGg/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgZG91YmxlQXR0YWNrTWF0Y2hlcz86IE5ldE1hdGNoZXNbJ0FiaWxpdHknXVtdO1xyXG59XHJcblxyXG4vLyBPNFMgLSBEZWx0YXNjYXBlIDQuMCBTYXZhZ2VcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080UzIgTmVvIFZhY3V1bSBXYXZlJzogJzI0MUQnLFxyXG4gICAgJ080UzIgQWNjZWxlcmF0aW9uIEJvbWInOiAnMjQzMScsXHJcbiAgICAnTzRTMiBFbXB0aW5lc3MnOiAnMjQyMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzRTMiBEb3VibGUgTGFzZXInOiAnMjQxNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRGVjaXNpdmUgQmF0dGxlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyNDA4JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMSBWYWN1dW0gV2F2ZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjNGRScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEFsbWFnZXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyNDE3JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzTmVvRXhkZWF0aCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmxpenphcmQgSUlJJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjNGOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gSWdub3JlIHVuYXZvaWRhYmxlIHJhaWQgYW9lIEJsaXp6YXJkIElJSS5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSkgPT4gIWRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgVGh1bmRlciBJSUknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0ZEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgZHVyaW5nIHJhbmRvbSBtZWNoYW5pYyBhZnRlciBkZWNpc2l2ZSBiYXR0bGUuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+IGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgUGV0cmlmaWVkJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gT24gTmVvLCBiZWluZyBwZXRyaWZpZWQgaXMgYmVjYXVzZSB5b3UgbG9va2VkIGF0IFNocmllaywgc28geW91ciBmYXVsdC5cclxuICAgICAgICBpZiAoZGF0YS5pc05lb0V4ZGVhdGgpXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgICAvLyBPbiBub3JtYWwgRXhEZWF0aCwgdGhpcyBpcyBkdWUgdG8gV2hpdGUgSG9sZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEZvcmtlZCBMaWdodG5pbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDJFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEb3VibGUgQXR0YWNrIENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzID0gZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcy5wdXNoKG1hdGNoZXMpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERvdWJsZSBBdHRhY2snLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGFyciA9IGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcztcclxuICAgICAgICBpZiAoIWFycilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoYXJyLmxlbmd0aCA8PSAyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIEhhcmQgdG8ga25vdyB3aG8gc2hvdWxkIGJlIGluIHRoaXMgYW5kIHdobyBzaG91bGRuJ3QsIGJ1dFxyXG4gICAgICAgIC8vIGl0IHNob3VsZCBuZXZlciBoaXQgMyBwZW9wbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBgJHthcnJbMF0/LmFiaWxpdHkgPz8gJyd9IHggJHthcnIubGVuZ3RofWAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBtYW55IGFiaWxpdGllcyBoZXJlXHJcblxyXG4vLyBPN1MgLSBTaWdtYXNjYXBlIDMuMCBTYXZhZ2VcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNpZ21hc2NhcGVWMzBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ083UyBTZWFyaW5nIFdpbmQnOiAnMjc3NycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzdTIE1pc3NpbGUnOiAnMjc4MicsXHJcbiAgICAnTzdTIENoYWluIENhbm5vbic6ICcyNzhGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzdTIFN0b25lc2tpbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMkFCNScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMuc291cmNlLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHZ1bG4/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbi8vIFRPRE86IGNvdWxkIGFkZCBQYXRjaCB3YXJuaW5ncyBmb3IgZG91YmxlL3VuYnJva2VuIHRldGhlcnNcclxuLy8gVE9ETzogSGVsbG8gV29ybGQgY291bGQgaGF2ZSBhbnkgd2FybmluZ3MgKHNvcnJ5KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFscGhhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBNb3Rpb24gMSc6ICczMzM0JywgLy8gMzAwKyBkZWdyZWUgY2xlYXZlIHdpdGggYmFjayBzYWZlIGFyZWFcclxuICAgICdPMTJTMSBFZmZpY2llbnQgQmxhZGV3b3JrIDEnOiAnMzMyOScsIC8vIE9tZWdhLU0gXCJnZXQgb3V0XCIgY2VudGVyZWQgYW9lIGFmdGVyIHNwbGl0XHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAyJzogJzMzMkEnLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgYmxhZGVzXHJcbiAgICAnTzEyUzEgQmV5b25kIFN0cmVuZ3RoJzogJzMzMjgnLCAvLyBPbWVnYS1NIFwiZ2V0IGluXCIgY2VudGVyZWQgYW9lIGR1cmluZyBzaGllbGRcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgU3RlZWwgMSc6ICczMzMwJywgLy8gT21lZ2EtRiBcImdldCBmcm9udC9iYWNrXCIgYmxhZGVzIHBoYXNlXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDInOiAnMzMzMScsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIE9wdGltaXplZCBCbGl6emFyZCBJSUknOiAnMzMzMicsIC8vIE9tZWdhLUYgZ2lhbnQgY3Jvc3NcclxuICAgICdPMTJTMiBEaWZmdXNlIFdhdmUgQ2Fubm9uJzogJzMzNjknLCAvLyBiYWNrL3NpZGVzIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IEh5cGVyIFB1bHNlIDEnOiAnMzM1QScsIC8vIFJvdGF0aW5nIEFyY2hpdmUgUGVyaXBoZXJhbCBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAyJzogJzMzNUInLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzVGJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgICAnTzEyUzIgTGVmdCBBcm0gVW5pdCBDb2xvc3NhbCBCbG93JzogJzMzNjAnLCAvLyBFeHBsb2RpbmcgQXJjaGl2ZSBBbGwgaGFuZHNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPMTJTMSBPcHRpY2FsIExhc2VyJzogJzMzNDcnLCAvLyBtaWRkbGUgbGFzZXIgZnJvbSBleWVcclxuICAgICdPMTJTMSBBZHZhbmNlZCBPcHRpY2FsIExhc2VyJzogJzMzNEEnLCAvLyBnaWFudCBjaXJjbGUgY2VudGVyZWQgb24gZXllXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDEnOiAnMzM2MScsIC8vIEFyY2hpdmUgQWxsIGluaXRpYWwgbGFzZXJcclxuICAgICdPMTJTMiBSZWFyIFBvd2VyIFVuaXQgUmVhciBMYXNlcnMgMic6ICczMzYyJywgLy8gQXJjaGl2ZSBBbGwgcm90YXRpbmcgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBGaXJlIElJSSc6ICczMzM3JywgLy8gZmlyZSBzcHJlYWRcclxuICAgICdPMTJTMiBIeXBlciBQdWxzZSBUZXRoZXInOiAnMzM1QycsIC8vIEluZGV4IEFuZCBBcmNoaXZlIFBlcmlwaGVyYWwgdGV0aGVyc1xyXG4gICAgJ08xMlMyIFdhdmUgQ2Fubm9uJzogJzMzNkInLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIGJhaXRlZCBsYXNlcnNcclxuICAgICdPMTJTMiBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzM3OScsIC8vIEFyY2hpdmUgQWxsIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIFNhZ2l0dGFyaXVzIEFycm93JzogJzMzNEQnLCAvLyBPbWVnYS1NIGJhcmQgbGltaXQgYnJlYWtcclxuICAgICdPMTJTMiBPdmVyc2FtcGxlZCBXYXZlIENhbm5vbic6ICczMzY2JywgLy8gTW9uaXRvciB0YW5rIGJ1c3RlcnNcclxuICAgICdPMTJTMiBTYXZhZ2UgV2F2ZSBDYW5ub24nOiAnMzM2RCcsIC8vIFRhbmsgYnVzdGVyIHdpdGggdGhlIHZ1bG4gZmlyc3RcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgRGlzY2hhcmdlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzMyNycgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA/Pz0ge307XHJcbiAgICAgICAgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID0gZGF0YS52dWxuIHx8IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBEYW1hZ2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDMzMkUgPSBQaWxlIFBpdGNoIHN0YWNrXHJcbiAgICAgIC8vIDMzM0UgPSBFbGVjdHJpYyBTbGlkZSAoT21lZ2EtTSBzcXVhcmUgMS00IGRhc2hlcylcclxuICAgICAgLy8gMzMzRiA9IEVsZWN0cmljIFNsaWRlIChPbWVnYS1GIHRyaWFuZ2xlIDEtNCBkYXNoZXMpXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnMzMyRScsICczMzNFJywgJzMzM0YnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnZ1bG4gJiYgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKHdpdGggdnVsbilgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobWl0IFZlcnd1bmRiYXJrZWl0KWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjooqvjg4Djg6Hjg7zjgrjkuIrmmIcpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOW4puaYk+S8pClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBCeWFra28gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlSmFkZVN0b2FFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIFBvcHBpbmcgVW5yZWxlbnRpbmcgQW5ndWlzaCBidWJibGVzXHJcbiAgICAnQnlhRXggQXJhdGFtYSc6ICcyN0Y2JyxcclxuICAgIC8vIFN0ZXBwaW5nIGluIGdyb3dpbmcgb3JiXHJcbiAgICAnQnlhRXggVmFjdXVtIENsYXcnOiAnMjdFOScsXHJcbiAgICAvLyBMaWdodG5pbmcgUHVkZGxlc1xyXG4gICAgJ0J5YUV4IEh1bmRlcmZvbGQgSGF2b2MgMSc6ICcyN0U1JyxcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDInOiAnMjdFNicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQnlhRXggU3dlZXAgVGhlIExlZyc6ICcyN0RCJyxcclxuICAgICdCeWFFeCBGaXJlIGFuZCBMaWdodG5pbmcnOiAnMjdERScsXHJcbiAgICAnQnlhRXggRGlzdGFudCBDbGFwJzogJzI3REQnLFxyXG4gICAgLy8gTWlkcGhhc2UgbGluZSBhdHRhY2tcclxuICAgICdCeWFFeCBJbXBlcmlhbCBHdWFyZCc6ICcyN0YxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFBpbmsgYnViYmxlIGNvbGxpc2lvblxyXG4gICAgICBpZDogJ0J5YUV4IE9taW5vdXMgV2luZCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI3RUMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnYnViYmxlIGNvbGxpc2lvbicsXHJcbiAgICAgICAgICAgIGRlOiAnQmxhc2VuIHNpbmQgenVzYW1tZW5nZXN0b8OfZW4nLFxyXG4gICAgICAgICAgICBmcjogJ2NvbGxpc2lvbiBkZSBidWxsZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ihneeqgScsXHJcbiAgICAgICAgICAgIGNuOiAn55u45pKeJyxcclxuICAgICAgICAgICAga286ICfsnqXtjJAg6rK57LOQ7IScIO2EsOynkCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFNoaW5yeXUgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVSb3lhbE1lbmFnZXJpZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU2hpbnJ5dSBBa2ggUmhhaSc6ICcxRkE2JywgLy8gU2t5IGxhc2VycyBhbG9uZ3NpZGUgQWtoIE1vcm4uXHJcbiAgICAnU2hpbnJ5dSBCbGF6aW5nIFRyYWlsJzogJzIyMUEnLCAvLyBSZWN0YW5nbGUgQW9FcywgaW50ZXJtaXNzaW9uIGFkZHMuXHJcbiAgICAnU2hpbnJ5dSBDb2xsYXBzZSc6ICcyMjE4JywgLy8gQ2lyY2xlIEFvRXMsIGludGVybWlzc2lvbiBhZGRzXHJcbiAgICAnU2hpbnJ5dSBEcmFnb25maXN0JzogJzI0RjAnLCAvLyBHaWFudCBwdW5jaHkgY2lyY2xlIGluIHRoZSBjZW50ZXIuXHJcbiAgICAnU2hpbnJ5dSBFYXJ0aCBCcmVhdGgnOiAnMUY5RCcsIC8vIENvbmFsIGF0dGFja3MgdGhhdCBhcmVuJ3QgYWN0dWFsbHkgRWFydGggU2hha2Vycy5cclxuICAgICdTaGlucnl1IEd5cmUgQ2hhcmdlJzogJzFGQTgnLCAvLyBHcmVlbiBkaXZlIGJvbWIgYXR0YWNrLlxyXG4gICAgJ1NoaW5yeXUgU3Bpa2VzaWNsZSc6ICcxRkFgJywgLy8gQmx1ZS1ncmVlbiBsaW5lIGF0dGFja3MgZnJvbSBiZWhpbmQuXHJcbiAgICAnU2hpbnJ5dSBUYWlsIFNsYXAnOiAnMUY5MycsIC8vIFJlZCBzcXVhcmVzIGluZGljYXRpbmcgdGhlIHRhaWwncyBsYW5kaW5nIHNwb3RzLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU2hpbnJ5dSBMZXZpbmJvbHQnOiAnMUY5QycsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJY3kgZmxvb3IgYXR0YWNrLlxyXG4gICAgICBpZDogJ1NoaW5yeXUgRGlhbW9uZCBEdXN0JyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gVGhpbiBJY2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGlucnl1IFRpZGFsIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxRjhCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gS25vY2tiYWNrIGZyb20gY2VudGVyLlxyXG4gICAgICBpZDogJ1NoaW5yeXUgQWVyaWFsIEJsYXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY5MCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc2VyICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFN1c2FubyBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVQb29sT2ZUcmlidXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3VzRXggQ2h1cm5pbmcnOiAnMjAzRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnU3VzRXggUmFzZW4gS2Fpa3lvJzogJzIwMkUnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFVsdGltYSBXZWFwb24gVWx0aW1hdGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlYXBvbnNSZWZyYWluVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1VXVSBTZWFyaW5nIFdpbmQnOiAnMkI1QycsXHJcbiAgICAnVVdVIEVydXB0aW9uJzogJzJCNUEnLFxyXG4gICAgJ1VXVSBXZWlnaHQnOiAnMkI2NScsXHJcbiAgICAnVVdVIExhbmRzbGlkZTEnOiAnMkI3MCcsXHJcbiAgICAnVVdVIExhbmRzbGlkZTInOiAnMkI3MScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVVdVIEdyZWF0IFdoaXJsd2luZCc6ICcyQjQxJyxcclxuICAgICdVV1UgU2xpcHN0cmVhbSc6ICcyQjUzJyxcclxuICAgICdVV1UgV2lja2VkIFdoZWVsJzogJzJCNEUnLFxyXG4gICAgJ1VXVSBXaWNrZWQgVG9ybmFkbyc6ICcyQjRGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVVdVIFdpbmRidXJuJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0VCJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAyLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZlYXRoZXJsYW5jZSBleHBsb3Npb24uICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdVV1UgRmVhdGhlcmxhbmNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMkI0MycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcywga0ZsYWdJbnN0YW50RGVhdGggfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNEb29tPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBVQ1UgLSBUaGUgVW5lbmRpbmcgQ29pbCBPZiBCYWhhbXV0IChVbHRpbWF0ZSlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVVuZW5kaW5nQ29pbE9mQmFoYW11dFVsdGltYXRlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVQ1UgTHVuYXIgRHluYW1vJzogJzI2QkMnLFxyXG4gICAgJ1VDVSBJcm9uIENoYXJpb3QnOiAnMjZCQicsXHJcbiAgICAnVUNVIEV4YWZsYXJlJzogJzI2RUYnLFxyXG4gICAgJ1VDVSBXaW5ncyBPZiBTYWx2YXRpb24nOiAnMjZDQScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUd2lzdGVyIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyBJbnN0YW50IGRlYXRoIGhhcyBhIHNwZWNpYWwgZmxhZyB2YWx1ZSwgZGlmZmVyZW50aWF0aW5nXHJcbiAgICAgIC8vIGZyb20gdGhlIGV4cGxvc2lvbiBkYW1hZ2UgeW91IHRha2Ugd2hlbiBzb21lYm9keSBlbHNlXHJcbiAgICAgIC8vIHBvcHMgb25lLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZBQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcywgZmxhZ3M6IGtGbGFnSW5zdGFudERlYXRoIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1R3aXN0ZXIgUG9wJyxcclxuICAgICAgICAgICAgZGU6ICdXaXJiZWxzdHVybSBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnQXBwYXJpdGlvbiBkZXMgdG9ybmFkZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ODhOOCpOOCueOCv+ODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5peL6aOOJyxcclxuICAgICAgICAgICAga286ICftmozsmKTrpqwg67Cf7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFRoZXJtaW9uaWMgQnVyc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BpenphIFNsaWNlJyxcclxuICAgICAgICAgICAgZGU6ICdQaXp6YXN0w7xjaycsXHJcbiAgICAgICAgICAgIGZyOiAnUGFydHMgZGUgcGl6emEnLFxyXG4gICAgICAgICAgICBqYTogJ+OCteODvOODn+OCquODi+ODg+OCr+ODkOODvOOCueODiCcsXHJcbiAgICAgICAgICAgIGNuOiAn5aSp5bSp5Zyw6KOCJyxcclxuICAgICAgICAgICAga286ICfsnqXtjJDsl5Ag66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIENoYWluIExpZ2h0bmluZycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QzgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEl0J3MgaGFyZCB0byBhc3NpZ24gYmxhbWUgZm9yIGxpZ2h0bmluZy4gIFRoZSBkZWJ1ZmZzXHJcbiAgICAgICAgLy8gZ28gb3V0IGFuZCB0aGVuIGV4cGxvZGUgaW4gb3JkZXIsIGJ1dCB0aGUgYXR0YWNrZXIgaXNcclxuICAgICAgICAvLyB0aGUgZHJhZ29uIGFuZCBub3QgdGhlIHBsYXllci5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGl0IGJ5IGxpZ2h0bmluZycsXHJcbiAgICAgICAgICAgIGRlOiAndm9tIEJsaXR6IGdldHJvZmZlbicsXHJcbiAgICAgICAgICAgIGZyOiAnZnJhcHDDqShlKSBwYXIgbGEgZm91ZHJlJyxcclxuICAgICAgICAgICAgamE6ICfjg4HjgqfjgqTjg7Pjg6njgqTjg4jjg4vjg7PjgrAnLFxyXG4gICAgICAgICAgICBjbjogJ+mbt+WFiemTvicsXHJcbiAgICAgICAgICAgIGtvOiAn67KI6rCcIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBCdXJucycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdGQScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgU2x1ZGdlJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExRicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSBpcyBubyBjYWxsb3V0IGZvciBcInlvdSBmb3Jnb3QgdG8gY2xlYXIgZG9vbVwiLiAgVGhlIGxvZ3MgbG9va1xyXG4gICAgICAvLyBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAvLyAgIFsyMDowMjozMC41NjRdIDFBOk9rb25vbWkgWWFraSBnYWlucyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAgZm9yIDYuMDAgU2Vjb25kcy5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBQcm90ZWN0IGZyb20gVGFrbyBZYWtpLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM4LjUyNV0gMTk6T2tvbm9taSBZYWtpIHdhcyBkZWZlYXRlZCBieSBGaXJlaG9ybi5cclxuICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIGRvb20gZWZmZWN0IGlzIHJlbW92ZWQgKy8tIG5ldHdvcmsgbGF0ZW5jeSwgYnV0IGNhbid0XHJcbiAgICAgIC8vIHRlbGwgdW50aWwgbGF0ZXIgdGhhdCBpdCB3YXMgYSBkZWF0aC4gIEFyZ3VhYmx5LCB0aGlzIGNvdWxkIGhhdmUgYmVlbiBhXHJcbiAgICAgIC8vIGNsb3NlLWJ1dC1zdWNjZXNzZnVsIGNsZWFyaW5nIG9mIGRvb20gYXMgd2VsbC4gIEl0IGxvb2tzIHRoZSBzYW1lLlxyXG4gICAgICAvLyBTdHJhdGVneTogaWYgeW91IGhhdmVuJ3QgY2xlYXJlZCBkb29tIHdpdGggMSBzZWNvbmQgdG8gZ28gdGhlbiB5b3UgcHJvYmFibHlcclxuICAgICAgLy8gZGllZCB0byBkb29tLiAgWW91IGNhbiBnZXQgbm9uLWZhdGFsbHkgaWNlYmFsbGVkIG9yIGF1dG8nZCBpbiBiZXR3ZWVuLFxyXG4gICAgICAvLyBidXQgd2hhdCBjYW4geW91IGRvLlxyXG4gICAgICBpZDogJ1VDVSBEb29tIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSB8fCAhZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgcmVhc29uO1xyXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKTtcclxuICAgICAgICBpZiAoZHVyYXRpb24gPCA5KVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMxJztcclxuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA8IDE0KVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMyJztcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZWFzb24gPSBtYXRjaGVzLmVmZmVjdCArICcgIzMnO1xyXG4gICAgICAgIHJldHVybiB7IG5hbWU6IG1hdGNoZXMudGFyZ2V0LCByZWFzb246IHJlYXNvbiB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGhlIENvcGllZCBGYWN0b3J5XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDb3BpZWRGYWN0b3J5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iJzogJzQ4QjQnLFxyXG4gICAgLy8gTWFrZSBzdXJlIGVuZW1pZXMgYXJlIGlnbm9yZWQgb24gdGhlc2VcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iYXJkbWVudCc6ICc0OEI4JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBBc3NhdWx0JzogJzQ4QjYnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzQ4QzUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gU3BpbiAxJzogJzQ4Q0InLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gMic6ICc0OENDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIENlbnRyaWZ1Z2FsIFNwaW4nOiAnNDhDOScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBBaXItVG8tU3VyZmFjZSBFbmVyZ3knOiAnNDhCQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLUNhbGliZXIgTGFzZXInOiAnNDhGQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAxJzogJzQ4QkMnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMic6ICc0OEJEJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDMnOiAnNDhCRScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA0JzogJzQ4QzAnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNSc6ICc0OEMxJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDYnOiAnNDhDMicsXHJcblxyXG4gICAgJ0NvcGllZCBUcmFzaCBFbmVyZ3kgQm9tYic6ICc0OTFEJyxcclxuICAgICdDb3BpZWQgVHJhc2ggRnJvbnRhbCBTb21lcnNhdWx0JzogJzQ5MUInLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBIaWdoLUZyZXF1ZW5jeSBMYXNlcic6ICc0OTFFJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ja2luZyBEaXNjaGFyZ2UnOiAnNDgwQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAxJzogJzQ5QzUnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMic6ICc0OUM2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDMnOiAnNDlDNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA0JzogJzQ4MEYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNSc6ICc0ODEwJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDYnOiAnNDgxMScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAxJzogJzQ4MDInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAyJzogJzQ4MDMnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAzJzogJzQ4MDQnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFRvd2VyZmFsbCc6ICc0ODEzJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDEnOiAnNDgxNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDInOiAnNDgxNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDMnOiAnNDgxOCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgT2lsIFdlbGwnOiAnNDgxQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBFbGVjdHJvbWFnbmV0aWMgUHVsc2UnOiAnNDgxOScsXHJcbiAgICAvLyBUT0RPOiB3aGF0J3MgdGhlIGVsZWN0cmlmaWVkIGZsb29yIHdpdGggY29udmV5b3IgYmVsdHM/XHJcblxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDEnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMic6ICc0OTM4JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAzJzogJzQ5MzknLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDQnOiAnNDkzQScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBMYXNlciBUdXJyZXQnOiAnNDhFNicsXHJcblxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBBcmVhIEJvbWJpbmcnOiAnNDk0MycsXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc0OTQwJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDEnOiAnNDcyOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDInOiAnNDcyOCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDMnOiAnNDcyRicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDQnOiAnNDczMScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDUnOiAnNDcyQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDYnOiAnNDcyRCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDcnOiAnNDczMicsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgSW5jZW5kaWFyeSBCb21iaW5nJzogJzQ3MzknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgR3VpZGVkIE1pc3NpbGUnOiAnNDczNicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBTdXJmYWNlIE1pc3NpbGUnOiAnNDczNCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBMYXNlciBTaWdodCc6ICc0NzNCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEZyYWNrJzogJzQ3NEQnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggQ3J1c2gnOiAnNDhGQycsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBDcnVzaGluZyBXaGVlbCc6ICc0NzRCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggVGhydXN0JzogJzQ4RkMnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTGFzZXIgU3VwcHJlc3Npb24nOiAnNDhFMCcsIC8vIENhbm5vbnNcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAxJzogJzQ5NzQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDInOiAnNDhEQycsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMyc6ICc0OEU0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCA0JzogJzQ4RTAnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTWFyeCBJbXBhY3QnOiAnNDhENCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDEnOiAnNDhFOCcsXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMic6ICc0OEU5JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDEnOiAnNDhBNScsXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDInOiAnNDhBNycsXHJcblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ydC1SYW5nZSBNaXNzaWxlJzogJzQ4MTUnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1MDkzIHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNEZCNSB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDUwRDMgQWVyaWFsIFN1cHBvcnQ6IEJvbWJhcmRtZW50IGdvaW5nIG9mZiBmcm9tIGFkZFxyXG4vLyBUT0RPOiA1MjExIE1hbmV1dmVyOiBWb2x0IEFycmF5IG5vdCBnZXR0aW5nIGludGVycnVwdGVkXHJcbi8vIFRPRE86IDRGRjQvNEZGNSBPbmUgb2YgdGhlc2UgaXMgZmFpbGluZyBjaGVtaWNhbCBjb25mbGFncmF0aW9uXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHdyb25nIHRlbGVwb3J0ZXI/PyBtYXliZSA1MzYzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVB1cHBldHNCdW5rZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMSc6ICc1MDc0JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAyJzogJzUwNzUnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDMnOiAnNTA3NicsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBDb2xsaWRlciBDYW5ub25zJzogJzUwN0UnLCAvLyByb3RhdGluZyByZWQgZ3JvdW5kIGFvZSBwaW53aGVlbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDEnOiAnNTA5MScsIC8vIGNoYXNpbmcgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDInOiAnNTA5MicsIC8vIGNoYXNpbmcgbGFzZXIgY2hhc2luZ1xyXG4gICAgJ1B1cHBldCBBZWdpcyBGbGlnaHQgUGF0aCc6ICc1MDhDJywgLy8gYmx1ZSBsaW5lIGFvZSBmcm9tIGZseWluZyB1bnRhcmdldGFibGUgYWRkc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBSZWZyYWN0aW9uIENhbm5vbnMgMSc6ICc1MDgxJywgLy8gcmVmcmFjdGlvbiBjYW5ub25zIGJldHdlZW4gd2luZ3NcclxuICAgICdQdXBwZXQgQWVnaXMgTGlmZVxcJ3MgTGFzdCBTb25nJzogJzUzQjMnLCAvLyByaW5nIGFvZSB3aXRoIGdhcFxyXG4gICAgJ1B1cHBldCBMaWdodCBMb25nLUJhcnJlbGVkIExhc2VyJzogJzUyMTInLCAvLyBsaW5lIGFvZSBmcm9tIGFkZFxyXG4gICAgJ1B1cHBldCBMaWdodCBTdXJmYWNlIE1pc3NpbGUgSW1wYWN0JzogJzUyMEYnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSW5jZW5kaWFyeSBCb21iaW5nJzogJzRGQjknLCAvLyBmaXJlIHB1ZGRsZSBpbml0aWFsXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNoYXJwIFR1cm4nOiAnNTA2RCcsIC8vIHNoYXJwIHR1cm4gZGFzaFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMSc6ICc0RkIxJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMic6ICc0RkIyJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMyc6ICc0RkIzJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDEnOiAnNTA2RicsIC8vIHJpZ2h0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMic6ICc1MDcwJywgLy8gbGVmdC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBHdWlkZWQgTWlzc2lsZSc6ICc0RkI4JywgLy8gZ3JvdW5kIGFvZSBkdXJpbmcgQXJlYSBCb21iYXJkbWVudFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAxJzogJzRGQzAnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAyJzogJzRGQzEnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNEZGQycsIC8vIGNvbG9yZWQgbWFnaWMgaGFtbWVyLXkgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBSZXZvbHZpbmcgTGFzZXInOiAnNTAwMCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYic6ICc0RkZBJywgLy8gZ2V0dGluZyBoaXQgYnkgYmFsbCBkdXJpbmcgQWN0aXZlIFN1cHByZXNzaXZlIFVuaXRcclxuICAgICdQdXBwZXQgSGVhdnkgUjAxMCBMYXNlcic6ICc0RkYwJywgLy8gbGFzZXIgcG9kXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMzAgSGFtbWVyJzogJzRGRjEnLCAvLyBjaXJjbGUgYW9lIHBvZFxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc1MEIxJywgLy8gbG9uZyBhb2UgaW4gdGhlIGhhbGx3YXkgc2VjdGlvblxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEVuZXJneSBCb21iJzogJzUwQjInLCAvLyBydW5uaW5nIGludG8gYSBmbG9hdGluZyBvcmJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEaXNzZWN0aW9uJzogJzUxQjMnLCAvLyBzcGlubmluZyB2ZXJ0aWNhbCBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERlY2FwaXRhdGlvbic6ICc1MUI0JywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVW50YXJnZXRlZCc6ICc1MUI3JywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDEnOiAnNTFBQScsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDInOiAnNTFDQicsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAxJzogJzU0MUYnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAyJzogJzUxOTgnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDEnOiAnNTQyMCcsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDInOiAnNTE5OScsIC8vIDJQIHRlbGVwb3J0aW5nIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMSc6ICc1NDIxJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDInOiAnNTE5QScsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgR3JvdW5kJzogJzUxQUUnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBjaXJjbGVcclxuICAgIC8vIFRoaXMgaXMuLi4gdG9vIG5vaXN5LlxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMSc6ICc1MUEwJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGp1bXBcclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDInOiAnNTE5RicsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBjbGVhdmVcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMSc6ICc1MDg3JywgLy8gdXBwZXIgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAyJzogJzRGRjcnLCAvLyB1cHBlciBsYXNlciBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDEnOiAnNTA4NicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAyJzogJzRGRjYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMyc6ICc1MDg4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA0JzogJzRGRjgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDUnOiAnNTA4OScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA2JzogJzRGRjknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgSW5jb25ncnVvdXMgU3Bpbic6ICc1MUIyJywgLy8gZmluZCB0aGUgc2FmZSBzcG90IGRvdWJsZSBkYXNoXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdQdXBwZXQgQnVybnMnOiAnMTBCJywgLy8gc3RhbmRpbmcgaW4gbWFueSB2YXJpb3VzIGZpcmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHByZXR0eSBsYXJnZSBhbmQgZ2V0dGluZyBoaXQgYnkgaW5pdGlhbCB3aXRob3V0IGJ1cm5zIHNlZW1zIGZpbmUuXHJcbiAgICAvLyAnUHVwcGV0IExpZ2h0IEhvbWluZyBNaXNzaWxlIEltcGFjdCc6ICc1MjEwJywgLy8gdGFyZ2V0ZWQgZmlyZSBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgSGVhdnkgVW5jb252ZW50aW9uYWwgVm9sdGFnZSc6ICc1MDA0JyxcclxuICAgIC8vIFByZXR0eSBub2lzeS5cclxuICAgICdQdXBwZXQgTWFuZXV2ZXIgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwMDInLCAvLyB0YW5rIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVGFyZ2V0ZWQnOiAnNTFCNicsIC8vIHRhcmdldGVkIHNwcmVhZCBtYXJrZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUUnLCAvLyB0YXJnZXRlZCBzcHJlYWQgcG9kIGxhc2VyIG9uIG5vbi10YW5rXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQW50aS1QZXJzb25uZWwgTGFzZXInOiAnNTA5MCcsIC8vIHRhbmsgYnVzdGVyIG1hcmtlclxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBQcmVjaXNpb24tR3VpZGVkIE1pc3NpbGUnOiAnNEZDNScsXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgVGFuayc6ICc1MUFEJywgLy8gdGFyZ2V0ZWQgcG9kIGxhc2VyIG9uIHRhbmtcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIFNob2NrIEJsYWNrIDI/XHJcbi8vIFRPRE86IFdoaXRlL0JsYWNrIERpc3NvbmFuY2UgZGFtYWdlIGlzIG1heWJlIHdoZW4gZmxhZ3MgZW5kIGluIDAzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRvd2VyQXRQYXJhZGlnbXNCcmVhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMSc6ICc1RUE3JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDInOiAnNjBDOCcsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAxJzogJzVFQTUnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMic6ICc1RUE2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDMnOiAnNjBDNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDQnOiAnNjBDNycsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIEJ1cnN0JzogJzVFRDQnLCAvLyBTcGhlcm9pZCBLbmF2aXNoIEJ1bGxldHMgY29sbGlzaW9uXHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQmFycmFnZSc6ICc1RUFDJywgLy8gU3BoZXJvaWQgbGluZSBhb2VzXHJcbiAgICAnVG93ZXIgSGFuc2VsIFJlcGF5JzogJzVDNzAnLCAvLyBTaGllbGQgZGFtYWdlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEV4cGxvc2lvbic6ICc1QzY3JywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljIEJ1bGxldCBkdXJpbmcgUGFzc2luZyBMYW5jZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBJbXBhY3QnOiAnNUM1QycsIC8vIEJlaW5nIGhpdCBieSBNYWdpY2FsIENvbmZsdWVuY2UgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMSc6ICc1QzZDJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAyJzogJzVDNkQnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDMnOiAnNUM2RScsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgNCc6ICc1QzZGJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIFBhc3NpbmcgTGFuY2UnOiAnNUM2NicsIC8vIFRoZSBQYXNzaW5nIExhbmNlIGNoYXJnZSBpdHNlbGZcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAxJzogJzU1QjMnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAyJzogJzVDNUQnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAzJzogJzVDNUUnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDEnOiAnNUM3MScsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDInOiAnNUM3MicsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBMaWdodGZhc3QgQmxhZGUnOiAnNUJGRScsIC8vIGxhcmdlIHJvb20gY2xlYXZlXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgU3RhbmRhcmQgTGFzZXInOiAnNUJGRicsIC8vIHRyYWNraW5nIGxhc2VyXHJcbiAgICAnVG93ZXIgMlAgV2hpcmxpbmcgQXNzYXVsdCc6ICc1QkZCJywgLy8gbGluZSBhb2UgZnJvbSAyUCBjbG9uZXNcclxuICAgICdUb3dlciAyUCBCYWxhbmNlZCBFZGdlJzogJzVCRkEnLCAvLyBjaXJjdWxhciBhb2Ugb24gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAxJzogJzYwMDYnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAyJzogJzYwMDcnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAzJzogJzYwMDgnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA0JzogJzYwMDknLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA1JzogJzYzMTAnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA2JzogJzYzMTEnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA3JzogJzYzMTInLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA4JzogJzYzMTMnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMSc6ICc2MDBGJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDInOiAnNjAxMCcsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBCbGFjayAxJzogJzYwMTEnLCAvLyBibGFjayBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIHdoaXRlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMSc6ICc2MDFGJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAyJzogJzYwMjEnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDEnOiAnNjAyMCcsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMic6ICc2MDIyJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIFdoaXRlJzogJzYwMEMnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgd2hpdGUgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBCbGFjayc6ICc2MDBEJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIGJsYWNrIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIERpZmZ1c2UgRW5lcmd5JzogJzYwNTYnLCAvLyByb3RhdGluZyBjbG9uZSBidWJibGUgY2xlYXZlc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEJpZyBFeHBsb3Npb24nOiAnNjAyNycsIC8vIG5vdCBraWxsaW5nIGEgcHlsb24gZHVyaW5nIGhhY2tpbmcgcGhhc2VcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBFeHBsb3Npb24nOiAnNjAyNicsIC8vIHB5bG9uIGR1cmluZyBDaGlsZCdzIHBsYXlcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIE1pZGRsZSc6ICc1QzAyJywgLy8gbWlkZGxlIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBTaWRlcyc6ICc1QzA1JywgLy8gc2lkZXMgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDMnOiAnNjA3OCcsIC8vIGdvZXMgd2l0aCA1QzAxXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyA0JzogJzYwNzknLCAvLyBnb2VzIHdpdGggNUMwNFxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIEVuZXJneSBCb21iJzogJzVDMDUnLCAvLyBwaW5rIGJ1YmJsZVxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBSaWdodCc6ICc1QkQ3JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgcmlnaHRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgTGVmdCc6ICc1QkQ2JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgbGVmdFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTGlnaHRlciBOb3RlJzogJzVCREEnLCAvLyBsaWdodGVyIG5vdGUgbW92aW5nIGFvZXNcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZ2ljYWwgSW50ZXJmZXJlbmNlJzogJzVCRDUnLCAvLyBsYXNlcnMgZHVyaW5nIFJoeXRobSBSaW5nc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgU2NhdHRlcmVkIE1hZ2ljJzogJzVCREYnLCAvLyBjaXJjbGUgYW9lcyBmcm9tIFNlZWQgT2YgTWFnaWNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBVbmV2ZW4gRm90dGluZyc6ICc1QkUyJywgLy8gYnVpbGRpbmcgZnJvbSBSZWNyZWF0ZSBTdHJ1Y3R1cmVcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBDcmFzaCc6ICc1QkU1JywgLy8gdHJhaW5zIGZyb20gTWl4ZWQgU2lnbmFsc1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMSc6ICc1QkVEJywgLy8gaGVhdnkgYXJtcyBmcm9udC9iYWNrIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMic6ICc1QkVGJywgLy8gaGVhdnkgYXJtcyBzaWRlcyBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBFbmVyZ3kgU2NhdHRlcmVkIE1hZ2ljJzogJzVCRTgnLCAvLyBvcmJzIGZyb20gUmVkIEdpcmwgYnkgdHJhaW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBQbGFjZSBPZiBQb3dlcic6ICc1QzBEJywgLy8gaW5zdGFkZWF0aCBtaWRkbGUgY2lyY2xlIGJlZm9yZSBibGFjay93aGl0ZSByaW5nc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEFscGhhJzogJzVFQUInLCAvLyBTcHJlYWRcclxuICAgICdUb3dlciBIYW5zZWwgU2VlZCBPZiBNYWdpYyBBbHBoYSc6ICc1QzYxJywgLy8gU3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQmV0YSc6ICc1RUIzJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIE1hbmlwdWxhdGUgRW5lcmd5JzogJzYwMUEnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBEYXJrZXIgTm90ZSc6ICc1QkRDJywgLy8gVGFua2J1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUb3dlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNUVCMSA9IEtuYXZlIEx1bmdlXHJcbiAgICAgIC8vIDVCRjIgPSBIZXIgSW5mbG9yZXNlbmNlIFNob2Nrd2F2ZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNUVCMScsICc1QkYyJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFrYWRhZW1pYUFueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW55ZGVyIEFjcmlkIFN0cmVhbSc6ICc0MzA0JyxcclxuICAgICdBbnlkZXIgV2F0ZXJzcG91dCc6ICc0MzA2JyxcclxuICAgICdBbnlkZXIgUmFnaW5nIFdhdGVycyc6ICc0MzAyJyxcclxuICAgICdBbnlkZXIgVmlvbGVudCBCcmVhY2gnOiAnNDMwNScsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMSc6ICczRTA4JyxcclxuICAgICdBbnlkZXIgVGlkYWwgR3VpbGxvdGluZSAyJzogJzNFMEEnLFxyXG4gICAgJ0FueWRlciBQZWxhZ2ljIENsZWF2ZXIgMSc6ICczRTA5JyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDInOiAnM0UwQicsXHJcbiAgICAnQW55ZGVyIEFxdWF0aWMgTGFuY2UnOiAnM0UwNScsXHJcbiAgICAnQW55ZGVyIFN5cnVwIFNwb3V0JzogJzQzMDgnLFxyXG4gICAgJ0FueWRlciBOZWVkbGUgU3Rvcm0nOiAnNDMwOScsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMSc6ICczRTEwJyxcclxuICAgICdBbnlkZXIgRXh0ZW5zaWJsZSBUZW5kcmlscyAyJzogJzNFMTEnLFxyXG4gICAgJ0FueWRlciBQdXRyaWQgQnJlYXRoJzogJzNFMTInLFxyXG4gICAgJ0FueWRlciBEZXRvbmF0b3InOiAnNDMwRicsXHJcbiAgICAnQW55ZGVyIERvbWluaW9uIFNsYXNoJzogJzQzMEQnLFxyXG4gICAgJ0FueWRlciBRdWFzYXInOiAnNDMwQicsXHJcbiAgICAnQW55ZGVyIERhcmsgQXJyaXZpc21lJzogJzQzMEUnLFxyXG4gICAgJ0FueWRlciBUaHVuZGVyc3Rvcm0nOiAnM0UxQycsXHJcbiAgICAnQW55ZGVyIFdpbmRpbmcgQ3VycmVudCc6ICczRTFGJyxcclxuICAgIC8vIDNFMjAgaXMgYmVpbmcgaGl0IGJ5IHRoZSBncm93aW5nIG9yYnMsIG1heWJlP1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQW1hdXJvdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW1hdXJvdCBCdXJuaW5nIFNreSc6ICczNTRBJyxcclxuICAgICdBbWF1cm90IFdoYWNrJzogJzM1M0MnLFxyXG4gICAgJ0FtYXVyb3QgQWV0aGVyc3Bpa2UnOiAnMzUzQicsXHJcbiAgICAnQW1hdXJvdCBWZW5lbW91cyBCcmVhdGgnOiAnM0NDRScsXHJcbiAgICAnQW1hdXJvdCBDb3NtaWMgU2hyYXBuZWwnOiAnNEQyNicsXHJcbiAgICAnQW1hdXJvdCBFYXJ0aHF1YWtlJzogJzNDQ0QnLFxyXG4gICAgJ0FtYXVyb3QgTWV0ZW9yIFJhaW4nOiAnM0NDNicsXHJcbiAgICAnQW1hdXJvdCBGaW5hbCBTa3knOiAnM0NDQicsXHJcbiAgICAnQW1hdXJvdCBNYWxldm9sZW5jZSc6ICczNTQxJyxcclxuICAgICdBbWF1cm90IFR1cm5hYm91dCc6ICczNTQyJyxcclxuICAgICdBbWF1cm90IFNpY2tseSBJbmZlcm5vJzogJzNERTMnLFxyXG4gICAgJ0FtYXVyb3QgRGlzcXVpZXRpbmcgR2xlYW0nOiAnMzU0NicsXHJcbiAgICAnQW1hdXJvdCBCbGFjayBEZWF0aCc6ICczNTQzJyxcclxuICAgICdBbWF1cm90IEZvcmNlIG9mIExvYXRoaW5nJzogJzM1NDQnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMSc6ICczRTAwJyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDInOiAnM0UwMScsXHJcbiAgICAnQW1hdXJvdCBEZWFkbHkgVGVudGFjbGVzJzogJzM1NDcnLFxyXG4gICAgJ0FtYXVyb3QgTWlzZm9ydHVuZSc6ICczQ0UyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdBbWF1cm90IEFwb2thbHlwc2lzJzogJzNDRDcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQW5hbW5lc2lzQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFBodWFibyBTcGluZSBMYXNoJzogJzREMUEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBBbmVtb25lIEZhbGxpbmcgUm9jayc6ICc0RTM3JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2UgZnJvbSBUcmVuY2ggQW5lbW9uZSBzaG93aW5nIHVwXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBEYWdvbml0ZSBTZXdlciBXYXRlcic6ICc0RDFDJywgLy8gZnJvbnRhbCBjb25hbCBmcm9tIFRyZW5jaCBBbmVtb25lICg/ISlcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFJvY2sgSGFyZCc6ICc0RDIxJywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWW92cmEgVG9ycmVudGlhbCBUb3JtZW50JzogJzREMjEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gTHVtaW5vdXMgUmF5JzogJzRFMjcnLCAvLyBVbmtub3duIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2luc3RlciBCdWJibGUgRXhwbG9zaW9uJzogJzRCNkUnLCAvLyBVbmtub3duIGV4cGxvc2lvbnMgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gUmVmbGVjdGlvbic6ICc0QjZGJywgLy8gVW5rbm93biBjb25hbCBhdHRhY2sgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMSc6ICc0Qjc0JywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBDbGVhcm91dCAyJzogJzRCNkInLCAvLyBVbmtub3duIGZyb250YWwgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNldGJhY2sgMSc6ICc0Qjc1JywgLy8gVW5rbm93biByZWFyIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDInOiAnNUI2QycsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBDbGlvbmlkIEFjcmlkIFN0cmVhbSc6ICc0RDI0JywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgRGl2aW5lciBEcmVhZHN0b3JtJzogJzREMjgnLCAvLyBncm91bmQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIDIwMDAtTWluYSBTd2luZyc6ICc0QjU1JywgLy8gS3lrbG9wcyBnZXQgb3V0IG1lY2hhbmljXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgSGFtbWVyJzogJzRCNUQnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgQmxhZGUnOiAnNEI1RScsIC8vIEt5a2xvcHMgSGFtbWVyL0JsYWRlIGFsdGVybmF0aW5nIHNxdWFyZXNcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBSYWdpbmcgR2xvd2VyJzogJzRCNTYnLCAvLyBLeWtsb3BzIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgRXllIE9mIFRoZSBDeWNsb25lJzogJzRCNTcnLCAvLyBLeWtsb3BzIGRvbnV0XHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBIYXJwb29uZXIgSHlkcm9iYWxsJzogJzREMjYnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBTd2lmdCBTaGlmdCc6ICc0QjgzJywgLy8gUnVrc2hzIERlZW0gdGVsZXBvcnQgTi9TXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBEZXB0aCBHcmlwIFdhdmVicmVha2VyJzogJzMzRDQnLCAvLyBSdWtzaHMgRGVlbSBoYW5kIGF0dGFja3NcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIFJpc2luZyBUaWRlJzogJzRCOEInLCAvLyBSdWtzaHMgRGVlbSBjcm9zcyBhb2VcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIENvbW1hbmQgQ3VycmVudCc6ICc0QjgyJywgLy8gUnVrc2hzIERlZW0gcHJvdGVhbi1pc2ggZ3JvdW5kIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWHpvbWl0IE1hbnRsZSBEcmlsbCc6ICc0RDE5JywgLy8gY2hhcmdlIGF0dGFja1xyXG4gICAgJ0FuYW1uZXNpcyBJbyBPdXNpYSBCYXJyZWxpbmcgU21hc2gnOiAnNEUyNCcsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBXYW5kZXJlclxcJ3MgUHlyZSc6ICc0QjVGJywgLy8gS3lrbG9wcyBzcHJlYWQgYXR0YWNrXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogTWlzc2luZyBHcm93aW5nIHRldGhlcnMgb24gYm9zcyAyLlxyXG4vLyAoTWF5YmUgZ2F0aGVyIHBhcnR5IG1lbWJlciBuYW1lcyBvbiB0aGUgcHJldmlvdXMgVElJSUlNQkVFRUVFRVIgY2FzdCBmb3IgY29tcGFyaXNvbj8pXHJcbi8vIFRPRE86IEZhaWxpbmcgdG8gaW50ZXJydXB0IERvaG5mYXVzdCBGdWF0aCBvbiBXYXRlcmluZyBXaGVlbCBjYXN0cz9cclxuLy8gKDE1Oi4uLi4uLi4uOkRvaG5mYXN0IEZ1YXRoOjNEQUE6V2F0ZXJpbmcgV2hlZWw6Li4uLi4uLi46KFxceXtOYW1lfSk6KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRvaG5NaGVnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEb2huIE1oZWcgR2V5c2VyJzogJzIyNjAnLCAvLyBXYXRlciBlcnVwdGlvbnMsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBIeWRyb2ZhbGwnOiAnMjJCRCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgTGF1Z2hpbmcgTGVhcCc6ICcyMjk0JywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBTd2luZ2UnOiAnMjJDQScsIC8vIEZyb250YWwgY29uZSwgYm9zcyAyXHJcbiAgICAnRG9obiBNaGVnIENhbm9weSc6ICczREIwJywgLy8gRnJvbnRhbCBjb25lLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgUGluZWNvbmUgQm9tYic6ICczREIxJywgLy8gQ2lyY3VsYXIgZ3JvdW5kIEFvRSBtYXJrZXIsIERvaG5mYXVzdCBSb3dhbnMgdGhyb3VnaG91dCBpbnN0YW5jZVxyXG4gICAgJ0RvaG4gTWhlZyBCaWxlIEJvbWJhcmRtZW50JzogJzM0RUUnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAzXHJcbiAgICAnRG9obiBNaGVnIENvcnJvc2l2ZSBCaWxlJzogJzM0RUMnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBGbGFpbGluZyBUZW50YWNsZXMnOiAnMzY4MScsXHJcblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgSW1wIENob2lyJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgVG9hZCBDaG9pcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxQjcnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEZvb2xcXCdzIFR1bWJsZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxODMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogQmVyc2Vya2VyIDJuZC8zcmQgd2lsZCBhbmd1aXNoIHNob3VsZCBiZSBzaGFyZWQgd2l0aCBqdXN0IGEgcm9ja1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUhlcm9lc0dhdW50bGV0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUSEcgQmxhZGVcXCdzIEJlbmlzb24nOiAnNTIyOCcsIC8vIHBsZCBjb25hbFxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBIb2x5JzogJzUyNEInLCAvLyB3aG0gdmVyeSBsYXJnZSBhb2VcclxuICAgICdUSEcgSGlzc2F0c3U6IEdva2EnOiAnNTIzRCcsIC8vIHNhbSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBXaG9sZSBTZWxmJzogJzUyMkQnLCAvLyBtbmsgd2lkZSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBSYW5kZ3JpdGgnOiAnNTIzMicsIC8vIGRyZyB2ZXJ5IGJpZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMSc6ICc1MDYxJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMic6ICc1MDYyJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBDb3dhcmRcXCdzIEN1bm5pbmcnOiAnNEZENycsIC8vIFNwZWN0cmFsIFRoaWVmIENoaWNrZW4gS25pZmUgbGFzZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMSc6ICc0RkQxJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMic6ICc0RkQyJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUmluZyBvZiBEZWF0aCc6ICc1MjM2JywgLy8gZHJnIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBMdW5hciBFY2xpcHNlJzogJzUyMjcnLCAvLyBwbGQgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIEdyYXZpdHknOiAnNTI0OCcsIC8vIGluayBtYWdlIGNpcmN1bGFyXHJcbiAgICAnVEhHIFJhaW4gb2YgTGlnaHQnOiAnNTI0MicsIC8vIGJhcmQgbGFyZ2UgY2lyY3VsZSBhb2VcclxuICAgICdUSEcgRG9vbWluZyBGb3JjZSc6ICc1MjM5JywgLy8gZHJnIGxpbmUgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIERhcmsgSUknOiAnNEY2MScsIC8vIE5lY3JvbWFuY2VyIDEyMCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgQnVyc3QnOiAnNTNCNycsIC8vIE5lY3JvbWFuY2VyIG5lY3JvYnVyc3Qgc21hbGwgem9tYmllIGV4cGxvc2lvblxyXG4gICAgJ1RIRyBQYWluIE1pcmUnOiAnNEZBNCcsIC8vIE5lY3JvbWFuY2VyIHZlcnkgbGFyZ2UgZ3JlZW4gYmxlZWQgcHVkZGxlXHJcbiAgICAnVEhHIERhcmsgRGVsdWdlJzogJzRGNUQnLCAvLyBOZWNyb21hbmNlciBncm91bmQgYW9lXHJcbiAgICAnVEhHIFRla2thIEdvamluJzogJzUyM0UnLCAvLyBzYW0gOTAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAxJzogJzUyMEEnLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDInOiAnNTIwQicsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBXaWxkIFJhZ2UnOiAnNTIwMycsIC8vIEJlcnNlcmtlciBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdUSEcgQmxlZWRpbmcnOiAnODI4JywgLy8gU3RhbmRpbmcgaW4gdGhlIE5lY3JvbWFuY2VyIHB1ZGRsZSBvciBvdXRzaWRlIHRoZSBCZXJzZXJrZXIgYXJlbmFcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ1RIRyBUcnVseSBCZXJzZXJrJzogJzkwNicsIC8vIFN0YW5kaW5nIGluIHRoZSBjcmF0ZXIgdG9vIGxvbmdcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RIRyBBYnNvbHV0ZSBUaHVuZGVyIElWJzogJzUyNDUnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGJsbVxyXG4gICAgJ1RIRyBNb29uZGl2ZXInOiAnNTIzMycsIC8vIGhlYWRtYXJrZXIgYW9lIGZyb20gZHJnXHJcbiAgICAnVEhHIFNwZWN0cmFsIEd1c3QnOiAnNTNDRicsIC8vIFNwZWN0cmFsIFRoaWVmIGhlYWRtYXJrZXIgYW9lXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUSEcgRmFsbGluZyBSb2NrJzogJzUyMDUnLCAvLyBCZXJzZXJrZXIgaGVhZG1hcmtlciBhb2UgdGhhdCBjcmVhdGVzIHJ1YmJsZVxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSBzaGFyZWQuICBPbiBhbGwgdGltZXMgYnV0IHRoZSAybmQgYW5kIDNyZCwgaXQncyBhIHBhcnR5IHNoYXJlLlxyXG4gICAgLy8gVE9ETzogb24gdGhlIDJuZCBhbmQgM3JkIHRpbWUgdGhpcyBzaG91bGQgb25seSBiZSBzaGFyZWQgd2l0aCBhIHJvY2suXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5IHdhcm4gb24gdGFraW5nIG9uZSBvZiB0aGVzZSB3aXRoIGEgNDcyIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgZWZmZWN0XHJcbiAgICAnVEhHIFdpbGQgQW5ndWlzaCc6ICc1MjA5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEhHIFdpbGQgUmFtcGFnZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzUyMDcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgaXMgemVybyBkYW1hZ2UgaWYgeW91IGFyZSBpbiB0aGUgY3JhdGVyLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkhvbG1pbnN0ZXJTd2l0Y2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGh1bWJzY3Jldyc6ICczREM2JyxcclxuICAgICdIb2xtaW5zdGVyIFdvb2RlbiBob3JzZSc6ICczREM3JyxcclxuICAgICdIb2xtaW5zdGVyIExpZ2h0IFNob3QnOiAnM0RDOCcsXHJcbiAgICAnSG9sbWluc3RlciBIZXJldGljXFwncyBGb3JrJzogJzNEQ0UnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSG9seSBXYXRlcic6ICczREQ0JyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDEnOiAnM0RERCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAyJzogJzNEREUnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMyc6ICczRERGJyxcclxuICAgICdIb2xtaW5zdGVyIENhdCBPXFwnIE5pbmUgVGFpbHMnOiAnM0RFMScsXHJcbiAgICAnSG9sbWluc3RlciBSaWdodCBLbm91dCc6ICczREU2JyxcclxuICAgICdIb2xtaW5zdGVyIExlZnQgS25vdXQnOiAnM0RFNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBBZXRoZXJzdXAnOiAnM0RFOScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIEZsYWdlbGxhdGlvbic6ICczREQ2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGFwaGVwaG9iaWEnOiAnNDE4MScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYWxpa2Foc1dlbGwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ01hbGlrYWggRmFsbGluZyBSb2NrJzogJzNDRUEnLFxyXG4gICAgJ01hbGlrYWggV2VsbGJvcmUnOiAnM0NFRCcsXHJcbiAgICAnTWFsaWthaCBHZXlzZXIgRXJ1cHRpb24nOiAnM0NFRScsXHJcbiAgICAnTWFsaWthaCBTd2lmdCBTcGlsbCc6ICczQ0YwJyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDEnOiAnM0NGNScsXHJcbiAgICAnTWFsaWthaCBDcnlzdGFsIE5haWwnOiAnM0NGNycsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDEnOiAnM0NGOScsXHJcbiAgICAnTWFsaWthaCBCcmVha2luZyBXaGVlbCAyJzogJzNDRkEnLFxyXG4gICAgJ01hbGlrYWggSGVyZXRpY1xcJ3MgRm9yayAyJzogJzNFMEUnLFxyXG4gICAgJ01hbGlrYWggRWFydGhzaGFrZSc6ICczRTM5JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogY291bGQgaW5jbHVkZSA1NDg0IE11ZG1hbiBSb2NreSBSb2xsIGFzIGEgc2hhcmVXYXJuLCBidXQgaXQncyBsb3cgZGFtYWdlIGFuZCBjb21tb24uXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0b3lhc1JlbGljdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWF0b3lhIFJlbGljdCBXZXJld29vZCBPdmF0aW9uJzogJzU1MTgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdG95YSBDYXZlIFRhcmFudHVsYSBIYXdrIEFwaXRveGluJzogJzU1MTknLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBTcHJpZ2dhbiBTdG9uZWJlYXJlciBSb21wJzogJzU1MUEnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgU29ubnkgT2YgWmlnZ3kgSml0dGVyaW5nIEdsYXJlJzogJzU1MUMnLCAvLyBsb25nIG5hcnJvdyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIFF1YWdtaXJlJzogJzU0ODEnLCAvLyBNdWRtYW4gYW9lIHB1ZGRsZXNcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAxJzogJzU0OEUnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDInOiAnNTQ4RicsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMyc6ICc1NDkwJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIE11ZCBCdWJibGUnOiAnNTQ4NycsIC8vIHN0YW5kaW5nIGluIG11ZCBwdWRkbGU/XHJcbiAgICAnTWF0b3lhIENhdmUgUHVnaWwgU2NyZXdkcml2ZXInOiAnNTUxRScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBOaXhpZSBHdXJnbGUnOiAnNTk5MicsIC8vIE5peGllIHdhbGwgZmx1c2hcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFB5cm9jbGFzdGljIFNob3QnOiAnNTdFQicsIC8vIHRoZSBsaW5lIGFvZXMgYXMgeW91IHJ1biB0byB0cmFzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgRmxhbiBGbG9vZCc6ICc1NTIzJywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUHlyb2R1Y3QgRWxkdGh1cnMgTWFzaCc6ICc1NTI3JywgLy8gbGluZSBhb2VcclxuICAgICdNYXR5b2EgUHlyb2R1Y3QgRWxkdGh1cnMgU3Bpbic6ICc1NTI4JywgLy8gdmVyeSBsYXJnZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBCYXZhcm9pcyBUaHVuZGVyIElJSSc6ICc1NTI1JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTWFyc2htYWxsb3cgQW5jaWVudCBBZXJvJzogJzU1MjQnLCAvLyB2ZXJ5IGxhcmdlIGxpbmUgZ3JvYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBQdWRkaW5nIEZpcmUgSUknOiAnNTUyMicsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIEhvdCBMYXZhJzogJzU3RTknLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFZvbGNhbmljIERyb3AnOiAnNTdFOCcsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBNZWRpdW0gUmVhcic6ICc1OTFEJywgLy8ga25vY2tiYWNrIGludG8gc2FmZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgTGluZSc6ICc1OTE3JywgLy8gbGluZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIENpcmNsZSc6ICc1OTE4JywgLy8gY2lyY2xlIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgVG8gQSBDcmlzcCc6ICc1OTI1JywgLy8gZ2V0dGluZyB0byBjbG9zZSB0byBib3NzIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFByb3hpZSBCdWZmZXQnOiAnNTkyNicsIC8vIEFlb2xpYW4gQ2F2ZSBTcHJpdGUgbGluZSBhb2UgKGlzIHRoaXMgYSBwdW4/KVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBTZWEgU2hhbnR5JzogJzU5OEMnLCAvLyBOb3QgdGFraW5nIHRoZSBwdWRkbGUgdXAgdG8gdGhlIHRvcD8gRmFpbGluZyBhZGQgZW5yYWdlP1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIENyYWNrJzogJzU5OTAnLCAvLyBOaXhpZSBDcmFzaC1TbWFzaCB0YW5rIHRldGhlcnNcclxuICAgICdNYXRveWEgTml4aWUgU3B1dHRlcic6ICc1OTkzJywgLy8gTml4aWUgc3ByZWFkIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTXRHdWxnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdHdWxnIEltbW9sYXRpb24nOiAnNDFBQScsXHJcbiAgICAnR3VsZyBUYWlsIFNtYXNoJzogJzQxQUInLFxyXG4gICAgJ0d1bGcgSGVhdmVuc2xhc2gnOiAnNDFBOScsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMSc6ICczRDAwJyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAyJzogJzNEMDEnLFxyXG4gICAgJ0d1bGcgSHVycmljYW5lIFdpbmcnOiAnM0QwMycsXHJcbiAgICAnR3VsZyBFYXJ0aCBTaGFrZXInOiAnMzdGNScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWNhdGlvbic6ICc0MUFFJyxcclxuICAgICdHdWxnIEV4ZWdlc2lzJzogJzNEMDcnLFxyXG4gICAgJ0d1bGcgUGVyZmVjdCBDb250cml0aW9uJzogJzNEMEUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmllZCBBZXJvJzogJzQxQUQnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMSc6ICczRDE2JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDInOiAnM0QxOCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAzJzogJzQ2NjknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNCc6ICczRDE5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDUnOiAnM0QyMScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMSc6ICczRDFBJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAyJzogJzNEMUInLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDMnOiAnM0QyMCcsXHJcbiAgICAnR3VsZyBWZW5hIEFtb3Jpcyc6ICczRDI3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdHdWxnIEx1bWVuIEluZmluaXR1bSc6ICc0MUIyJyxcclxuICAgICdHdWxnIFJpZ2h0IFBhbG0nOiAnMzdGOCcsXHJcbiAgICAnR3VsZyBMZWZ0IFBhbG0nOiAnMzdGQScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFdoYXQgdG8gZG8gYWJvdXQgS2FobiBSYWkgNUI1MD9cclxuLy8gSXQgc2VlbXMgaW1wb3NzaWJsZSBmb3IgdGhlIG1hcmtlZCBwZXJzb24gdG8gYXZvaWQgZW50aXJlbHkuXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuUGFnbHRoYW4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1BhZ2x0aGFuIFRlbG92b3VpdnJlIFBsYWd1ZSBTd2lwZSc6ICc2MEZDJywgLy8gZnJvbnRhbCBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMZXNzZXIgVGVsb2RyYWdvbiBFbmd1bGZpbmcgRmxhbWVzJzogJzYwRjUnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgTGlnaHRuaW5nIEJvbHQnOiAnNUM0QycsIC8vIGNpcmN1bGFyIGxpZ2h0bmluZyBhb2UgKG9uIHNlbGYgb3IgcG9zdClcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MicsIC8vIHB1bHNpbmcgc21hbGwgY2lyY3VsYXIgYW9lc1xyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgU3VwZXJjaGFyZ2VkIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MycsIC8vIHB1bHNpbmcgbGFyZ2UgY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBXaWRlIEJsYXN0ZXInOiAnNjBDNScsIC8vIHJlYXIgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2Jyb2JpbnlhayBGYWxsIE9mIE1hbic6ICc2MTQ4JywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb3RlayBSZWFwZXIgTWFnaXRlayBDYW5ub24nOiAnNjEyMScsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gU2hlZXQgb2YgSWNlJzogJzYwRjgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIEZyb3N0IEJyZWF0aCc6ICc2MEY3JywgLy8gdmVyeSBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgU3RhYmxlIENhbm5vbic6ICc1Qzk0JywgLy8gbGFyZ2UgbGluZSBhb2VzXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBDb3JlIDItVG9uemUgTWFnaXRlayBNaXNzaWxlJzogJzVDOTUnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFNreSBBcm1vciBBZXRoZXJzaG90JzogJzVDOUMnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBNYXJrIElJIFRlbG90ZWsgQ29sb3NzdXMgRXhoYXVzdCc6ICc1Qzk5JywgLy8gbGFyZ2UgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIE1pc3NpbGUgRXhwbG9zaXZlIEZvcmNlJzogJzVDOTgnLCAvLyBzbG93IG1vdmluZyBob3Jpem9udGFsIG1pc3NpbGVzXHJcbiAgICAnUGFnbHRoYW4gVGlhbWF0IEZsYW1pc3BoZXJlJzogJzYxMEYnLCAvLyB2ZXJ5IGxvbmcgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBBcm1vcmVkIFRlbG9kcmFnb24gVG9ydG9pc2UgU3RvbXAnOiAnNjE0QicsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZSBmcm9tIHR1cnRsZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gVGh1bmRlcm91cyBCcmVhdGgnOiAnNjE0OScsIC8vIGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBVcGJ1cnN0JzogJzYwNUInLCAvLyBzbWFsbCBhb2VzIGJlZm9yZSBCaWcgQnVyc3RcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIE5haWwgQmlnIEJ1cnN0JzogJzVCNDgnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VzIGZyb20gbmFpbHNcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IFBlcmlnZWFuIEJyZWF0aCc6ICc1QjU5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RScsIC8vIG1lZ2FmbGFyZSBwZXBwZXJvbmlcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSBEaXZlJzogJzVCNTInLCAvLyBtZWdhZmxhcmUgbGluZSBhb2UgYWNyb3NzIHRoZSBhcmVuYVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgRmxhcmUnOiAnNUI0QScsIC8vIGxhcmdlIHB1cnBsZSBzaHJpbmtpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RCcsIC8vIG1lZ2FmbGFyZSBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUWl0YW5hUmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBTdW4gVG9zcyc6ICczQzhBJywgLy8gR3JvdW5kIEFvRSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDEnOiAnM0M4QycsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAxJzogJzNDOEYnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDInOiAnM0M5MCcsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIFJvY2snOiAnM0M5NicsIC8vIFNtYWxsIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgQm91bGRlcic6ICczQzk3JywgLy8gTGFyZ2UgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVG93ZXJmYWxsJzogJzNDOTgnLCAvLyBQaWxsYXIgY29sbGFwc2UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAyJzogJzNDOUUnLCAvLyBTdGF0aW9uYXJ5IHBvaXNvbiBwdWRkbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMSc6ICczQ0EyJywgLy8gRGFuZ2Vyb3VzIG1pZGRsZSBkdXJpbmcgc3ByZWFkIGNpcmNsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAzJzogJzNDQTYnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDQnOiAnM0NBNycsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAyJzogJzNENkQnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBXcmF0aCBvZiB0aGUgUm9ua2EnOiAnM0UyQycsIC8vIFN0YXR1ZSBsaW5lIGF0dGFjayBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnUWl0YW5hIFNpbnNwaXR0ZXInOiAnM0UzNicsIC8vIEdvcmlsbGEgYm91bGRlciB0b3NzIEFvRSBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ1FpdGFuYSBIb3VuZCBvdXQgb2YgSGVhdmVuJzogJzQyQjgnLCAvLyBUZXRoZXIgZXh0ZW5zaW9uIGZhaWx1cmUsIGJvc3MgdGhyZWU7IDQyQjcgaXMgY29ycmVjdCBleGVjdXRpb25cclxuICAgICdRaXRhbmEgUm9ua2FuIEFieXNzJzogJzQzRUInLCAvLyBHcm91bmQgQW9FIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMSc6ICczQzlEJywgLy8gQW9FIGZyb20gdGhlIDAwQUIgcG9pc29uIGhlYWQgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMic6ICczQ0EzJywgLy8gT3ZlcmxhcHBlZCBjaXJjbGVzIGZhaWx1cmUgb24gdGhlIHNwcmVhZCBjaXJjbGVzIHZlcnNpb24gb2YgdGhlIG1lY2hhbmljXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRoZSBHcmFuZCBDb3Ntb3NcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyYW5kQ29zbW9zLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3Ntb3MgSXJvbiBKdXN0aWNlJzogJzQ5MUYnLFxyXG4gICAgJ0Nvc21vcyBTbWl0ZSBPZiBSYWdlJzogJzQ5MjEnLFxyXG5cclxuICAgICdDb3Ntb3MgVHJpYnVsYXRpb24nOiAnNDlBNCcsXHJcbiAgICAnQ29zbW9zIERhcmsgU2hvY2snOiAnNDc2RicsXHJcbiAgICAnQ29zbW9zIFN3ZWVwJzogJzQ3NzAnLFxyXG4gICAgJ0Nvc21vcyBEZWVwIENsZWFuJzogJzQ3NzEnLFxyXG5cclxuICAgICdDb3Ntb3MgU2hhZG93IEJ1cnN0JzogJzQ5MjQnLFxyXG4gICAgJ0Nvc21vcyBCbG9vZHkgQ2FyZXNzJzogJzQ5MjcnLFxyXG4gICAgJ0Nvc21vcyBOZXBlbnRoaWMgUGx1bmdlJzogJzQ5MjgnLFxyXG4gICAgJ0Nvc21vcyBCcmV3aW5nIFN0b3JtJzogJzQ5MjknLFxyXG5cclxuICAgICdDb3Ntb3MgT2RlIFRvIEZhbGxlbiBQZXRhbHMnOiAnNDk1MCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIEdyb3VuZCc6ICc0MjczJyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmUgQnJlYXRoJzogJzQ5MkInLFxyXG4gICAgJ0Nvc21vcyBSb25rYW4gRnJlZXplJzogJzQ5MkUnLFxyXG4gICAgJ0Nvc21vcyBPdmVycG93ZXInOiAnNDkyRCcsXHJcblxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgTGVmdCc6ICc0NzYzJyxcclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIFJpZ2h0JzogJzQ3NjInLFxyXG4gICAgJ0Nvc21vcyBPdGhlcndvcmRseSBIZWF0JzogJzQ3NUMnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBJcmUnOiAnNDc2MScsXHJcbiAgICAnQ29zbW9zIFBsdW1tZXQnOiAnNDc2NycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4gVGV0aGVyJzogJzQ3NUYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29zbW9zIERhcmsgV2VsbCc6ICc0NzZEJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgU3ByZWFkJzogJzQ3MjQnLFxyXG4gICAgJ0Nvc21vcyBCbGFjayBGbGFtZSc6ICc0NzVEJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluJzogJzQ3NjAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVHdpbm5pbmcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1R3aW5uaW5nIEF1dG8gQ2Fubm9ucyc6ICc0M0E5JyxcclxuICAgICdUd2lubmluZyBIZWF2ZSc6ICczREI5JyxcclxuICAgICdUd2lubmluZyAzMiBUb256ZSBTd2lwZSc6ICczREJCJyxcclxuICAgICdUd2lubmluZyBTaWRlc3dpcGUnOiAnM0RCRicsXHJcbiAgICAnVHdpbm5pbmcgV2luZCBTcG91dCc6ICczREJFJyxcclxuICAgICdUd2lubmluZyBTaG9jayc6ICczREYxJyxcclxuICAgICdUd2lubmluZyBMYXNlcmJsYWRlJzogJzNERUMnLFxyXG4gICAgJ1R3aW5uaW5nIFZvcnBhbCBCbGFkZSc6ICczREMyJyxcclxuICAgICdUd2lubmluZyBUaHJvd24gRmxhbWVzJzogJzNEQzMnLFxyXG4gICAgJ1R3aW5uaW5nIE1hZ2l0ZWsgUmF5JzogJzNERjMnLFxyXG4gICAgJ1R3aW5uaW5nIEhpZ2ggR3Jhdml0eSc6ICczREZBJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUd2lubmluZyAxMjggVG9uemUgU3dpcGUnOiAnM0RCQScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogRGVhZCBJcm9uIDVBQjAgKGVhcnRoc2hha2VycywgYnV0IG9ubHkgaWYgeW91IHRha2UgdHdvPylcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjeSBGb3VyZm9sZCc6ICc1QjM0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBQjQnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjI4JywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFBNCcsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFBNScsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFBNicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQTcnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFBOCcsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUE5JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFBRScsIC8vIENoYWluIGRhbWFnZVxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFBQicsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJsb29tcyc6ICc1QUFEJywgLy8gUHVycGxlIGdyb3dpbmcgY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaWdodC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MScsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSc6ICc1NzY1JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzVBJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtIERhaHUgSGVhZCBEb3duJzogJzU3NTYnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NTcnLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBGYWxsaW5nIFJvY2snOiAnNTc1QycsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc2NCcsIC8vIGRvdWJsZSBjaGFyZ2VcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpcHBlciBDbGF3JzogJzU3NUQnLCAvLyBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgVGFpbCBTd2luZyc6ICc1NzVGJywgLy8gdGFpbCBzd2luZyA7KVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFBhd24gT2ZmJzogJzU4MDYnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1ODBEJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAyJzogJzU4MEUnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDMnOiAnNTgwRicsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU3RjMnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU3RjInLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgQ291bnRlcnBsYXknOiAnNTdGNicsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdBOScsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2UgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QUEnLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEnOiAnNTdBNScsIC8vIHBoYW50b20gbGluZSBhb2UgZnJvbSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFZpbGUgV2F2ZSc6ICc1N0IxJywgLy8gcGhhbnRvbSBjb25hbCBhb2VcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTczJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk3MicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NzEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTY4JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTc0JywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAxJzogJzU5QkInLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMic6ICc1OUJEJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAxJzogJzU5QkEnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMic6ICc1OUJDJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBOb3J0aHN3YWluXFwncyBHbG93JzogJzU5QzQnLCAvLyBleHBhbmRpbmcgbGluZXMgd2l0aCBleHBsb3Npb24gaW50ZXJzZWN0aW9uc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlCRicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1OUUwJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMic6ICc1OUUxJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1OUUyJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBQYXduIE9mZic6ICc1OURBJywgLy8gU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2UgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1OUNFJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlciBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTlDQycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXQgZHVyaW5nIFF1ZWVuXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNUE2RScsIC8vIGV4cGxvc2lvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgUG9pc29uIFRyYXAnOiAnNUE2RicsIC8vIHBvaXNvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEhlYXQgU2hvY2snOiAnNTk1RScsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBDb2xkIFNob2NrJzogJzU5NUYnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBNb29uJzogJzI2MicsIC8vIFwiUGV0cmlmaWNhdGlvblwiIGZyb20gQWV0aGVyaWFsIE9yYiBsb29rYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWF0IEJyZWF0aCc6ICc1NzY2JywgLy8gdGFuayBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgV3JhdGggT2YgQm96amEnOiAnNTk3NScsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBdCBsZWFzdCBkdXJpbmcgVGhlIFF1ZWVuLCB0aGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSxcclxuICAgICAgLy8gYW5kIHRoZSBmaXJzdCBleHBsb3Npb24gXCJoaXRzXCIgZXZlcnlvbmUsIGFsdGhvdWdoIHdpdGggXCIxQlwiIGZsYWdzLlxyXG4gICAgICBpZDogJ0RlbHVicnVtIExvdHMgQ2FzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NjVBJywgJzU2NUInLCAnNTdGRCcsICc1N0ZFJywgJzVCODYnLCAnNUI4NycsICc1OUQyJywgJzVEOTMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogRGFodSA1Nzc2IFNwaXQgRmxhbWUgc2hvdWxkIGFsd2F5cyBoaXQgYSBNYXJjaG9zaWFzXHJcbi8vIFRPRE86IGhpdHRpbmcgcGhhbnRvbSB3aXRoIGljZSBzcGlrZXMgd2l0aCBhbnl0aGluZyBidXQgZGlzcGVsP1xyXG4vLyBUT0RPOiBmYWlsaW5nIGljeS9maWVyeSBwb3J0ZW50IChndWFyZCBhbmQgcXVlZW4pXHJcbi8vICAgICAgIGAxODpQeXJldGljIERvVCBUaWNrIG9uICR7bmFtZX0gZm9yICR7ZGFtYWdlfSBkYW1hZ2UuYFxyXG4vLyBUT0RPOiBXaW5kcyBPZiBGYXRlIC8gV2VpZ2h0IE9mIEZvcnR1bmU/XHJcbi8vIFRPRE86IFR1cnJldCdzIFRvdXI/XHJcbi8vIGdlbmVyYWwgdHJhcHM6IGV4cGxvc2lvbjogNUE3MSwgcG9pc29uIHRyYXA6IDVBNzIsIG1pbmk6IDVBNzNcclxuLy8gZHVlbCB0cmFwczogbWluaTogNTdBMSwgaWNlOiA1NzlGLCB0b2FkOiA1N0EwXHJcbi8vIFRPRE86IHRha2luZyBtYW5hIGZsYW1lIHdpdGhvdXQgcmVmbGVjdFxyXG4vLyBUT0RPOiB0YWtpbmcgTWFlbHN0cm9tJ3MgQm9sdCB3aXRob3V0IGxpZ2h0bmluZyBidWZmXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2xpbWVzIEhlbGxpc2ggU2xhc2gnOiAnNTdFQScsIC8vIEJvemphbiBTb2xkaWVyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgVmlzY291cyBSdXB0dXJlJzogJzUwMTYnLCAvLyBGdWxseSBtZXJnZWQgdmlzY291cyBzbGltZSBhb2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEdvbGVtcyBEZW1vbGlzaCc6ICc1ODgwJywgLy8gaW50ZXJydXB0aWJsZSBSdWlucyBHb2xlbSBjYXN0XHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUQxJywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyQScsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQ0InLCAvLyBDaGFpbnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMSc6ICc1Qjk0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDInOiAnNUFCOScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAzJzogJzVBQkEnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNCc6ICc1QUJCJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDUnOiAnNUFCQycsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFDOCcsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQ29tZXQnOiAnNUFENycsIC8vIENsb25lIG1ldGVvciBkcm9wcGluZyBiZWZvcmUgY2hhcmdlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIEZpcmVzdG9ybSc6ICc1QUQ4JywgLy8gQ2xvbmUgY2hhcmdlIGFmdGVyIEJhbGVmdWwgQ29tZXRcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBSb3NlJzogJzVBRDknLCAvLyBDbG9uZSBsaW5lIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFDMScsIC8vIEJsdWUgcmluIGcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQzInLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQzMnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUM0JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQzUnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFDNicsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEFjdCBPZiBNZXJjeSc6ICc1QUNGJywgLy8gY3Jvc3Mtc2hhcGVkIGxpbmUgYW9lc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAxJzogJzU3NzAnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzInLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc2RicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzEnLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUnOiAnNTc3NCcsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc2QycsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhlYWQgRG93bic6ICc1NzY4JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzY5JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmFsbGluZyBSb2NrJzogJzU3NkUnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBIb3QgQ2hhcmdlJzogJzU3NzMnLCAvLyBkb3VibGUgY2hhcmdlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNTc5RScsIC8vIGJvbWJzIGJlaW5nIGNsZWFyZWRcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIFZpY2lvdXMgU3dpcGUnOiAnNTc5NycsIC8vIGNpcmN1bGFyIGFvZSBhcm91bmQgYm9zc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMSc6ICc1NzhGJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZvY3VzZWQgVHJlbW9yIDInOiAnNTc5MScsIC8vIHNxdWFyZSBmbG9vciBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBEZXZvdXInOiAnNTc4OScsIC8vIGNvbmFsIGFvZSBhZnRlciB3aXRoZXJpbmcgY3Vyc2VcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZsYWlsaW5nIFN0cmlrZSAxJzogJzU3OEMnLCAvLyBpbml0aWFsIHJvdGF0aW5nIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDInOiAnNTc4RCcsIC8vIHJvdGF0aW5nIGNsZWF2ZXNcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNTgxOScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNTgxQScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTgxNicsIC8vIE9wdGltYWwgUGxheSBTd29yZCBcImdldCBvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTgxNycsIC8vIE9wdGltYWwgcGxheSBzaGllbGQgXCJnZXQgaW5cIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBDbGVhdmUnOiAnNTgxOCcsIC8vIE9wdGltYWwgUGxheSBjbGVhdmVzIGZvciBzd29yZC9zaGllbGRcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBVbmx1Y2t5IExvdCc6ICc1ODFEJywgLy8gUXVlZW4ncyBLbmlnaHQgb3JiIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIEJ1cm4gMSc6ICc1ODNEJywgLy8gc21hbGwgZmlyZSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAyJzogJzU4M0UnLCAvLyBsYXJnZSBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBQYXduIE9mZic6ICc1ODNBJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzU4NDcnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzU4NDgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzU4NDknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQ291bnRlcnBsYXknOiAnNThGNScsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QjgnLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0I5JywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDEnOiAnNTdCNCcsIC8vIEluaXRpYWwgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDInOiAnNTdCNScsIC8vIExhdGVyIHBoYW50b20gbGluZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMSc6ICc1N0I2JywgLy8gSW5pdGlhbCBwaGFudG9tIGNpcmNsZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMic6ICc1N0I3JywgLy8gTW92aW5nIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gVmlsZSBXYXZlJzogJzU3QkYnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTRDJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk0QicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NEEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTM5JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTREJywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFdoYWNrJzogJzU3RDAnLCAvLyBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMSc6ICc1N0M1JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBEZXZhc3RhdGluZyBCb2x0IDInOiAnNTdDNicsIC8vIGxpZ2h0bmluZyByaW5nc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRWxlY3Ryb2N1dGlvbic6ICc1N0NDJywgLy8gcmFuZG9tIGNpcmNsZSBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBSYXBpZCBCb2x0cyc6ICc1N0MzJywgLy8gZHJvcHBlZCBsaWdodG5pbmcgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgMTExMS1Ub256ZSBTd2luZyc6ICc1N0Q4JywgLy8gdmVyeSBsYXJnZSBcImdldCBvdXRcIiBzd2luZ1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgTW9uayBBdHRhY2snOiAnNTVBNicsIC8vIE1vbmsgYWRkIGF1dG8tYXR0YWNrXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlGNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlFNycsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5RUEnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDEnOiAnNTlFOCcsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIEVuZCAyJzogJzU5RTknLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgT2ZmZW5zaXZlIFN3b3JkJzogJzVBMDInLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU2hpZWxkJzogJzVBMDMnLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCAxJzogJzU5RjInLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDInOiAnNUI4NScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDEnOiAnNTlGMScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCAyJzogJzVCODQnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUGF3biBPZmYnOiAnNUExRCcsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUZGJywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1QTAwJywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1QTAxJywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMSc6ICc1QTI4JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMic6ICc1QTJBJywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMlxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMyc6ICc1QTI5JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIHNlY29uZCBsaW5lc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBIZWF0IFNob2NrJzogJzU5MjcnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTI4JywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlFQicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBHdW5uaGlsZHJcXCdzIEJsYWRlcyc6ICc1QjIyJywgLy8gbm90IGJlaW5nIGluIHRoZSBjaGVzcyBibHVlIHNhZmUgc3F1YXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVW5sdWNreSBMb3QnOiAnNTVCNicsIC8vIGxpZ2h0bmluZyBvcmIgYXR0YWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSBhbmQgXCJoaXRcIiBwZW9wbGUgd2hlbiBsZXZpdGF0aW5nLlxyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IEd1YXJkIExvdHMgQ2FzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1ODI3JywgJzU4MjgnLCAnNUI2QycsICc1QjZEJywgJzVCQjYnLCAnNUJCNycsICc1Qjg4JywgJzVCODknXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR29sZW0gQ29tcGFjdGlvbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTc0NicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IFNsaW1lIFNhbmd1aW5lIEZ1c2lvbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTU0RCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMU4gRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRFRCcsXHJcbiAgICAnRTFOIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEVDJyxcclxuICAgICdFMU4gUHVyZSBCZWFtJzogJzNEOUUnLFxyXG4gICAgJ0UxTiBQYXJhZGlzZSBMb3N0JzogJzNEQTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBGbGFyZSc6ICczRDk3JyxcclxuICAgICdFMU4gUHVyZSBMaWdodCc6ICczREEzJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxTiBGaXJlIElJSSc6ICc0NEVCJyxcclxuICAgICdFMU4gVmljZSBPZiBWYW5pdHknOiAnNDRFNycsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFOIFZpY2UgT2YgQXBhdGh5JzogJzQ0RTgnLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGludGVycnVwdCBNYW5hIEJvb3N0ICgzRDhEKVxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIHBhc3MgaGVhbGVyIGRlYnVmZj9cclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBkb24ndCBraWxsIGEgbWV0ZW9yIGR1cmluZyBmb3VyIG9yYnM/XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVSZXN1cnJlY3Rpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBUaHVuZGVyIElJSSc6ICc0NEY3JyxcclxuICAgICdFMVMgRWRlblxcJ3MgQmxpenphcmQgSUlJJzogJzQ0RjYnLFxyXG4gICAgJ0UxUyBFZGVuXFwncyBSZWdhaW5lZCBCbGl6emFyZCBJSUknOiAnNDRGQScsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDEnOiAnM0Q4MycsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDInOiAnM0Q4NCcsXHJcbiAgICAnRTFTIFBhcmFkaXNlIExvc3QnOiAnM0Q4NycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTFTIEVkZW5cXCdzIEZsYXJlJzogJzNENzMnLFxyXG4gICAgJ0UxUyBQdXJlIExpZ2h0JzogJzNEOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTFTIEZpcmUvVGh1bmRlciBJSUknOiAnNDRGQicsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBTaW5nbGUnOiAnM0Q4MScsXHJcbiAgICAnRTFTIFZpY2UgT2YgVmFuaXR5JzogJzQ0RjEnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxUyBWaWNlIG9mIEFwYXRoeSc6ICc0NEYyJywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZSAodG9wIGxpbmUgZmFpbCwgYm90dG9tIGxpbmUgc3VjY2VzcywgZWZmZWN0IHRoZXJlIHRvbylcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDYxMjM0NTpUaW5pIFBvdXRpbmk6RjoxMDAwMDoxMDAxOTBGOlxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjc4OTBBOlBvdGF0byBDaGlwcHk6MTowOjFDOjgwMDA6XHJcbi8vIGdhaW5zIHRoZSBlZmZlY3Qgb2YgUGV0cmlmaWNhdGlvbiBmcm9tIFZvaWR3YWxrZXIgZm9yIDEwLjAwIFNlY29uZHMuXHJcbi8vIFRPRE86IHB1ZGRsZSBmYWlsdXJlP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZURlc2NlbnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UyTiBEb29tdm9pZCBTbGljZXInOiAnM0UzQycsXHJcbiAgICAnRTJOIERvb212b2lkIEd1aWxsb3RpbmUnOiAnM0UzQicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyTiBOeXgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICczRTNEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0Jvb3BlZCcsXHJcbiAgICAgICAgICAgIGRlOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGZyOiAnTWFsdXMgZGUgZMOpZ8OidHMnLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogJ+uLieyKpCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlXHJcbi8vIFRPRE86IEVtcHR5IEhhdGUgKDNFNTkvM0U1QSkgaGl0cyBldmVyeWJvZHksIHNvIGhhcmQgdG8gdGVsbCBhYm91dCBrbm9ja2JhY2tcclxuLy8gVE9ETzogbWF5YmUgbWFyayBoZWxsIHdpbmQgcGVvcGxlIHdobyBnb3QgY2xpcHBlZCBieSBzdGFjaz9cclxuLy8gVE9ETzogbWlzc2luZyBwdWRkbGVzP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGxpZ2h0L2RhcmsgY2lyY2xlIHN0YWNrXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIFNsaWNlcic6ICczRTUwJyxcclxuICAgICdFM1MgRW1wdHkgUmFnZSc6ICczRTZDJyxcclxuICAgICdFM1MgRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UyUyBEb29tdm9pZCBDbGVhdmVyJzogJzNFNjQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgU2hhZG93ZXllJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU3RvbmUgQ3Vyc2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU4OScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgTnl4JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0U1MScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZUludW5kYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMSc6ICczRkNBJyxcclxuICAgICdFM04gTW9uc3RlciBXYXZlIDInOiAnM0ZFOScsXHJcbiAgICAnRTNOIE1hZWxzdHJvbSc6ICczRkQ5JyxcclxuICAgICdFM04gU3dpcmxpbmcgVHN1bmFtaSc6ICczRkQ1JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFM04gVGVtcG9yYXJ5IEN1cnJlbnQgMSc6ICczRkNFJyxcclxuICAgICdFM04gVGVtcG9yYXJ5IEN1cnJlbnQgMic6ICczRkNEJyxcclxuICAgICdFM04gU3Bpbm5pbmcgRGl2ZSc6ICczRkRCJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UzTiBSaXAgQ3VycmVudCc6ICczRkM3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogU2NvdXJpbmcgVHN1bmFtaSAoM0NFMCkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXRcclxuLy8gVE9ETzogU3dlZXBpbmcgVHN1bmFtaSAoM0ZGNSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YW5rc1xyXG4vLyBUT0RPOiBSaXAgQ3VycmVudCAoM0ZFMCwgM0ZFMSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXQvdGFua3NcclxuLy8gVE9ETzogQm9pbGVkIEFsaXZlICg0MDA2KSBpcyBmYWlsaW5nIHB1ZGRsZXM/Pz9cclxuLy8gVE9ETzogZmFpbGluZyB0byBjbGVhbnNlIFNwbGFzaGluZyBXYXRlcnNcclxuLy8gVE9ETzogZG9lcyBnZXR0aW5nIGhpdCBieSB1bmRlcnNlYSBxdWFrZSBjYXVzZSBhbiBhYmlsaXR5P1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAxJzogJzNGRTUnLFxyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM1MgTWFlbHN0cm9tJzogJzNGRkInLFxyXG4gICAgJ0UzUyBTd2lybGluZyBUc3VuYW1pJzogJzNGRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGRUEnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGRUInLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAzJzogJzNGRUMnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCA0JzogJzNGRUQnLFxyXG4gICAgJ0UzUyBTcGlubmluZyBEaXZlJzogJzNGRkQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNE4gV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQwRUInLFxyXG4gICAgJ0U0TiBFdmlsIEVhcnRoJzogJzQwRUYnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDEnOiAnNDFCNCcsXHJcbiAgICAnRTROIEFmdGVyc2hvY2sgMic6ICc0MEYwJyxcclxuICAgICdFNE4gRXhwbG9zaW9uIDEnOiAnNDBFRCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAyJzogJzQwRjUnLFxyXG4gICAgJ0U0TiBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTROIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDEwMCcsXHJcbiAgICAnRTROIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MEZGJyxcclxuICAgICdFNE4gTWFzc2l2ZSBMYW5kc2xpZGUnOiAnNDBGQycsXHJcbiAgICAnRTROIFNlaXNtaWMgV2F2ZSc6ICc0MEYzJyxcclxuICAgICdFNE4gRmF1bHQgTGluZSc6ICc0MTAxJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgZmF1bHRMaW5lVGFyZ2V0Pzogc3RyaW5nO1xyXG59XHJcblxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBwZW9wbGUgZ2V0IGhpdHRpbmcgYnkgbWFya2VycyB0aGV5IHNob3VsZG4ndFxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFua3MgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlcnMsIG1lZ2FsaXRoc1xyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFyZ2V0IGdldHRpbmcgaGl0IGJ5IHRhbmtidXN0ZXJcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVTZXB1bHR1cmVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U0UyBXZWlnaHQgb2YgdGhlIExhbmQnOiAnNDEwOCcsXHJcbiAgICAnRTRTIEV2aWwgRWFydGgnOiAnNDEwQycsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMSc6ICc0MUI1JyxcclxuICAgICdFNFMgQWZ0ZXJzaG9jayAyJzogJzQxMEQnLFxyXG4gICAgJ0U0UyBFeHBsb3Npb24nOiAnNDEwQScsXHJcbiAgICAnRTRTIExhbmRzbGlkZSc6ICc0MTFCJyxcclxuICAgICdFNFMgUmlnaHR3YXJkIExhbmRzbGlkZSc6ICc0MTFEJyxcclxuICAgICdFNFMgTGVmdHdhcmQgTGFuZHNsaWRlJzogJzQxMUMnLFxyXG4gICAgJ0U0UyBNYXNzaXZlIExhbmRzbGlkZSAxJzogJzQxMTgnLFxyXG4gICAgJ0U0UyBNYXNzaXZlIExhbmRzbGlkZSAyJzogJzQxMTknLFxyXG4gICAgJ0U0UyBTZWlzbWljIFdhdmUnOiAnNDExMCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTRTIER1YWwgRWFydGhlbiBGaXN0cyAxJzogJzQxMzUnLFxyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMic6ICc0Njg3JyxcclxuICAgICdFNFMgUGxhdGUgRnJhY3R1cmUnOiAnNDNFQScsXHJcbiAgICAnRTRTIEVhcnRoZW4gRmlzdCAxJzogJzQzQ0EnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMic6ICc0M0M5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTRTIEZhdWx0IExpbmUgQ29sbGVjdCcsXHJcbiAgICAgIHR5cGU6ICdTdGFydHNVc2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAnVGl0YW4nIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAnVGl0YW4nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAnVGl0YW4nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn44K/44Kk44K/44OzJyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+azsOWdpicgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICftg4DsnbTtg4QnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5mYXVsdExpbmVUYXJnZXQgPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTRTIEZhdWx0IExpbmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0MTFFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmZhdWx0TGluZVRhcmdldCAhPT0gbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUnVuIE92ZXInLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgw6ljcmFzw6koZSknLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzT3JiPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGNsb3VkTWFya2Vycz86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1bG1pbmF0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNU4gSW1wYWN0JzogJzRFM0EnLCAvLyBTdHJhdG9zcGVhciBsYW5kaW5nIEFvRVxyXG4gICAgJ0U1TiBMaWdodG5pbmcgQm9sdCc6ICc0QjlDJywgLy8gU3Rvcm1jbG91ZCBzdGFuZGFyZCBhdHRhY2tcclxuICAgICdFNU4gR2FsbG9wJzogJzRCOTcnLCAvLyBTaWRld2F5cyBhZGQgY2hhcmdlXHJcbiAgICAnRTVOIFNob2NrIFN0cmlrZSc6ICc0QkExJywgLy8gU21hbGwgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gICAgJ0U1TiBWb2x0IFN0cmlrZSc6ICc0Q0YyJywgLy8gTGFyZ2UgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U1TiBKdWRnbWVudCBKb2x0JzogJzRCOEYnLCAvLyBTdHJhdG9zcGVhciBleHBsb3Npb25zXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGhhcHBlbnMgd2hlbiBhIHBsYXllciBnZXRzIDQrIHN0YWNrcyBvZiBvcmJzLiBEb24ndCBiZSBncmVlZHkhXHJcbiAgICAgIGlkOiAnRTVOIFN0YXRpYyBDb25kZW5zYXRpb24nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNU4gT3JiIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gT3JiIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QjlBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKG5vIG9yYilgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoa2VpbiBPcmIpYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHBhcyBkJ29yYmUpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+eOieeEoeOBlylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5rKh5ZCD55CDKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2VycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVOIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGRhdGEuY2xvdWRNYXJrZXJzID8/IFtdKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc09yYj86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXRlZD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBjbG91ZE1hcmtlcnM/OiBzdHJpbmdbXTtcclxufVxyXG5cclxuXHJcbi8vIFRPRE86IGlzIHRoZXJlIGEgZGlmZmVyZW50IGFiaWxpdHkgaWYgdGhlIHNoaWVsZCBkdXR5IGFjdGlvbiBpc24ndCB1c2VkIHByb3Blcmx5P1xyXG4vLyBUT0RPOiBpcyB0aGVyZSBhbiBhYmlsaXR5IGZyb20gUmFpZGVuICh0aGUgYmlyZCkgaWYgeW91IGdldCBlYXRlbj9cclxuLy8gVE9ETzogbWF5YmUgY2hhaW4gbGlnaHRuaW5nIHdhcm5pbmcgaWYgeW91IGdldCBoaXQgd2hpbGUgeW91IGhhdmUgc3lzdGVtIHNob2NrICg4QjgpXHJcblxyXG5jb25zdCBub09yYiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gb3JiKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBPcmIpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZFxcJ29yYmUpJyxcclxuICAgIGphOiBzdHIgKyAnICjpm7fnjonnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHlkIPnkIMpJyxcclxuICAgIGtvOiBzdHIgKyAnICjqtazsiqwg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1UyBJbXBhY3QnOiAnNEUzQicsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVTIEdhbGxvcCc6ICc0QkI0JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1UyBTaG9jayBTdHJpa2UnOiAnNEJDMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgVHdpc3Rlcic6ICc0QkM3JywgLy8gVHdpc3RlciBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBEb251dCc6ICc0QkM4JywgLy8gRG9udXQgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU2hvY2snOiAnNEUzRCcsIC8vIEhhdGVkIG9mIExldmluIFN0b3JtY2xvdWQtY2xlYW5zYWJsZSBleHBsb2RpbmcgZGVidWZmXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVTIEp1ZGdtZW50IEpvbHQnOiAnNEJBNycsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U1UyBWb2x0IFN0cmlrZSBEb3VibGUnOiAnNEJDMycsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgQ3JpcHBsaW5nIEJsb3cnOiAnNEJDQScsXHJcbiAgICAnRTVTIENoYWluIExpZ2h0bmluZyBEb3VibGUnOiAnNEJDNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNVMgT3JiIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgT3JiIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkI3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vT3JiKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFZvbHQgU3RyaWtlIE9yYicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQzMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgRGVhZGx5IERpc2NoYXJnZSBCaWcgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBMaWdodG5pbmcgQm9sdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjknLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBIYXZpbmcgYSBub24taWRlbXBvdGVudCBjb25kaXRpb24gZnVuY3Rpb24gaXMgYSBiaXQgPF88XHJcbiAgICAgICAgLy8gT25seSBjb25zaWRlciBsaWdodG5pbmcgYm9sdCBkYW1hZ2UgaWYgeW91IGhhdmUgYSBkZWJ1ZmYgdG8gY2xlYXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLmhhdGVkIHx8ICFkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBIYXRlZCBvZiBMZXZpbicsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDBEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2VycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVTIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGRhdGEuY2xvdWRNYXJrZXJzID8/IFtdKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgZGVsYXlTZWNvbmRzOiAzMCxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U2TiBUaG9ybnMnOiAnNEJEQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZOIEZlcm9zdG9ybSAxJzogJzRCREQnLFxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMic6ICc0QkU1JyxcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAxJzogJzRCRTAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAyJzogJzRCRTYnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZOIEV4cGxvc2lvbic6ICc0QkUyJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZOIEhlYXQgQnVyc3QnOiAnNEJFQycsXHJcbiAgICAnRTZOIENvbmZsYWcgU3RyaWtlJzogJzRCRUUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZOIFNwaWtlIE9mIEZsYW1lJzogJzRCRjAnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuICAgICdFNk4gUmFkaWFudCBQbHVtZSc6ICc0QkYyJyxcclxuICAgICdFNk4gRXJ1cHRpb24nOiAnNEJGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZOIFZhY3V1bSBTbGljZSc6ICc0QkQ1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2TiBEb3duYnVyc3QnOiAnNEJEQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZS4gQWN0dWFsIGtub2NrYmFjayBpcyB1bmtub3duIGFiaWxpdHkgNEMyMFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBLaWxscyBub24tdGFua3Mgd2hvIGdldCBoaXQgYnkgaXQuXHJcbiAgICAnRTZOIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRCRUQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgU2ltcGxlT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuLy8gVE9ETzogY2hlY2sgdGV0aGVycyBiZWluZyBjdXQgKHdoZW4gdGhleSBzaG91bGRuJ3QpXHJcbi8vIFRPRE86IGNoZWNrIGZvciBjb25jdXNzZWQgZGVidWZmXHJcbi8vIFRPRE86IGNoZWNrIGZvciB0YWtpbmcgdGFua2J1c3RlciB3aXRoIGxpZ2h0aGVhZGVkXHJcbi8vIFRPRE86IGNoZWNrIGZvciBvbmUgcGVyc29uIHRha2luZyBtdWx0aXBsZSBTdG9ybSBPZiBGdXJ5IFRldGhlcnMgKDRDMDEvNEMwOClcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IFNpbXBsZU9vcHN5VHJpZ2dlclNldCA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3JTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gSXQncyBjb21tb24gdG8ganVzdCBpZ25vcmUgZnV0Ym9sIG1lY2hhbmljcywgc28gZG9uJ3Qgd2FybiBvbiBTdHJpa2UgU3BhcmsuXHJcbiAgICAvLyAnU3Bpa2UgT2YgRmxhbWUnOiAnNEMxMycsIC8vIE9yYiBleHBsb3Npb25zIGFmdGVyIFN0cmlrZSBTcGFya1xyXG5cclxuICAgICdFNlMgVGhvcm5zJzogJzRCRkEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2UyBGZXJvc3Rvcm0gMSc6ICc0QkZEJyxcclxuICAgICdFNlMgRmVyb3N0b3JtIDInOiAnNEMwNicsXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QzAwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMic6ICc0QzA3JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2UyBFeHBsb3Npb24nOiAnNEMwMycsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2UyBIZWF0IEJ1cnN0JzogJzRDMUYnLFxyXG4gICAgJ0U2UyBDb25mbGFnIFN0cmlrZSc6ICc0QzEwJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2UyBSYWRpYW50IFBsdW1lJzogJzRDMTUnLFxyXG4gICAgJ0U2UyBFcnVwdGlvbic6ICc0QzE3JyxcclxuICAgICdFNlMgV2luZCBDdXR0ZXInOiAnNEMwMicsIC8vIFRldGhlci1jdXR0aW5nIGxpbmUgYW9lXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZTIFZhY3V1bSBTbGljZSc6ICc0QkY1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMSc6ICc0QkZCJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChHYXJ1ZGEpLlxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMic6ICc0QkZDJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChSYWt0YXBha3NhKS5cclxuICAgICdFNlMgTWV0ZW9yIFN0cmlrZSc6ICc0QzBGJywgLy8gRnJvbnRhbCBhdm9pZGFibGUgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U2UyBIYW5kcyBvZiBIZWxsJzogJzRDMFtCQ10nLCAvLyBUZXRoZXIgY2hhcmdlXHJcbiAgICAnRTZTIEhhbmRzIG9mIEZsYW1lJzogJzRDMEEnLCAvLyBGaXJzdCBUYW5rYnVzdGVyXHJcbiAgICAnRTZTIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRDMEUnLCAvLyBTZWNvbmQgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBCbGF6ZSc6ICc0QzFCJywgLy8gRmxhbWUgVG9ybmFkbyBDbGVhdmVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTZTIEFpciBCdW1wJzogJzRCRjknLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNBc3RyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzVW1icmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEMzRScsICc0QzQwJywgJzRDMjInLCAnNEMzQycsICc0RTYzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0QnLCAnNEMyMycsICc0QzQxJywgJzRDNDMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc0FzdHJhbCB8fCAhZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgYW4gb3JiIGR1cmluZyB0b3JuYWRvIHBoYXNlXHJcbi8vIFRPRE86IGp1bXBpbmcgaW4gdGhlIHRvcm5hZG8gZGFtYWdlPz9cclxuLy8gVE9ETzogdGFraW5nIHN1bmdyYWNlKDRDODApIG9yIG1vb25ncmFjZSg0QzgyKSB3aXRoIHdyb25nIGRlYnVmZlxyXG4vLyBUT0RPOiBzdHlnaWFuIHNwZWFyL3NpbHZlciBzcGVhciB3aXRoIHRoZSB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogdGFraW5nIGV4cGxvc2lvbiBmcm9tIHRoZSB3cm9uZyBDaGlhcm8vU2N1cm8gb3JiXHJcbi8vIFRPRE86IGhhbmRsZSA0Qzg5IFNpbHZlciBTdGFrZSB0YW5rYnVzdGVyIDJuZCBoaXQsIGFzIGl0J3Mgb2sgdG8gaGF2ZSB0d28gaW4uXHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0FzdHJhbD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXNVbWJyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdTIFNpbHZlciBTd29yZCc6ICc0QzhFJywgLy8gZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBPdmVyd2hlbG1pbmcgRm9yY2UnOiAnNEM3MycsIC8vIGFkZCBwaGFzZSBncm91bmQgYW9lXHJcbiAgICAnRTdTIFN0cmVuZ3RoIGluIE51bWJlcnMgMSc6ICc0QzcwJywgLy8gYWRkIGdldCB1bmRlclxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDInOiAnNEM3MScsIC8vIGFkZCBnZXQgb3V0XHJcbiAgICAnRTdTIFBhcGVyIEN1dCc6ICc0QzdEJywgLy8gdG9ybmFkbyBncm91bmQgYW9lc1xyXG4gICAgJ0U3UyBCdWZmZXQnOiAnNEM3NycsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXMgYWxzbz8/XHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTdTIEJldHdpeHQgV29ybGRzJzogJzRDNkInLCAvLyBwdXJwbGUgZ3JvdW5kIGxpbmUgYW9lc1xyXG4gICAgJ0U3UyBDcnVzYWRlJzogJzRDNTgnLCAvLyBibHVlIGtub2NrYmFjayBjaXJjbGUgKHN0YW5kaW5nIGluIGl0KVxyXG4gICAgJ0U3UyBFeHBsb3Npb24nOiAnNEM2RicsIC8vIGRpZG4ndCBraWxsIGFuIGFkZFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTdTIFN0eWdpYW4gU3Rha2UnOiAnNEMzNCcsIC8vIExhc2VyIHRhbmsgYnVzdGVyIDFcclxuICAgICdFN1MgU2lsdmVyIFNob3QnOiAnNEM5MicsIC8vIFNwcmVhZCBtYXJrZXJzXHJcbiAgICAnRTdTIFNpbHZlciBTY291cmdlJzogJzRDOTMnLCAvLyBJY2UgbWFya2Vyc1xyXG4gICAgJ0U3UyBDaGlhcm8gU2N1cm8gRXhwbG9zaW9uIDEnOiAnNEQxNCcsIC8vIG9yYiBleHBsb3Npb25cclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAyJzogJzREMTUnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFN1MgQWR2ZW50IE9mIExpZ2h0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QzZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBibGFtZSBjb3JyZWN0PyBkb2VzIHRoaXMgaGF2ZSBhIHRhcmdldD9cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzYyJywgJzRDNjMnLCAnNEM2NCcsICc0QzVCJywgJzRDNUYnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2NScsICc0QzY2JywgJzRDNjcnLCAnNEM1QScsICc0QzYwJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIENydXNhZGUgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA0Qzc2IGlzIHRoZSBrbm9ja2JhY2sgZGFtYWdlLCA0QzU4IGlzIHRoZSBkYW1hZ2UgZm9yIHN0YW5kaW5nIG9uIHRoZSBwdWNrLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEM3NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4TiBCaXRpbmcgRnJvc3QnOiAnNEREQicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIERyaXZpbmcgRnJvc3QnOiAnNEREQycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIEZyaWdpZCBTdG9uZSc6ICc0RTY2JywgLy8gU21hbGwgc3ByZWFkIGNpcmNsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzRFMDAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0RTAxJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIEZyaWdpZCBFcnVwdGlvbic6ICc0RTA5JywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEljaWNsZSBJbXBhY3QnOiAnNEUwQScsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBBeGUgS2ljayc6ICc0REUyJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOE4gU2N5dGhlIEtpY2snOiAnNERFMycsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOE4gUmVmbGVjdGVkIEJpdGluZyBGcm9zdCc6ICc0REZFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCc6ICc0REZGJywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIEhlYXZlbmx5IFN0cmlrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRERDgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc3Rvw59lbiEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBGcm9zdCBBcm1vcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uvuOuBhOufrOynkCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBydXNoIGhpdHRpbmcgdGhlIGNyeXN0YWxcclxuLy8gVE9ETzogYWRkcyBub3QgYmVpbmcga2lsbGVkXHJcbi8vIFRPRE86IHRha2luZyB0aGUgcnVzaCB0d2ljZSAod2hlbiB5b3UgaGF2ZSBkZWJ1ZmYpXHJcbi8vIFRPRE86IG5vdCBoaXR0aW5nIHRoZSBkcmFnb24gZm91ciB0aW1lcyBkdXJpbmcgd3lybSdzIGxhbWVudFxyXG4vLyBUT0RPOiBkZWF0aCByZWFzb25zIGZvciBub3QgcGlja2luZyB1cCBwdWRkbGVcclxuLy8gVE9ETzogbm90IGJlaW5nIGluIHRoZSB0b3dlciB3aGVuIHlvdSBzaG91bGRcclxuLy8gVE9ETzogcGlja2luZyB1cCB0b28gbWFueSBzdGFja3NcclxuXHJcbi8vIE5vdGU6IEJhbmlzaCBJSUkgKDREQTgpIGFuZCBCYW5pc2ggSWlpIERpdmlkZWQgKDREQTkpIGJvdGggYXJlIHR5cGU9MHgxNiBsaW5lcy5cclxuLy8gVGhlIHNhbWUgaXMgdHJ1ZSBmb3IgQmFuaXNoICg0REE2KSBhbmQgQmFuaXNoIERpdmlkZWQgKDREQTcpLlxyXG4vLyBJJ20gbm90IHN1cmUgdGhpcyBtYWtlcyBhbnkgc2Vuc2U/IEJ1dCBjYW4ndCB0ZWxsIGlmIHRoZSBzcHJlYWQgd2FzIGEgbWlzdGFrZSBvciBub3QuXHJcbi8vIE1heWJlIHdlIGNvdWxkIGNoZWNrIGZvciBcIk1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXBcIj9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThTIEJpdGluZyBGcm9zdCc6ICc0RDY2JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOFMgRHJpdmluZyBGcm9zdCc6ICc0RDY3JywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOFMgQXhlIEtpY2snOiAnNEQ2RCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFNjeXRoZSBLaWNrJzogJzRENkUnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0REI5JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNERCQScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBGcmlnaWQgRXJ1cHRpb24nOiAnNEQ5RicsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBGcmlnaWQgTmVlZGxlJzogJzREOUQnLCAvLyA4LXdheSBcImZsb3dlclwiIGV4cGxvc2lvblxyXG4gICAgJ0U4UyBJY2ljbGUgSW1wYWN0JzogJzREQTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAxJzogJzREQjcnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMic6ICc0REMzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAxJzogJzREQjgnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAyJzogJzREQzQnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG5cclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDc1JywgLy8gTGVmdCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMic6ICc0RDc2JywgLy8gUmlnaHQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDMnOiAnNEQ3NycsIC8vIEtub2NrYmFjayBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDkwJywgLy8gUmVmbGVjdGVkIGxlZnQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMic6ICc0REJCJywgLy8gUmVmbGVjdGVkIGxlZnQgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMyc6ICc0REM3JywgLy8gUmVmbGVjdGVkIHJpZ2h0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDQnOiAnNEQ5MScsIC8vIFJlZmxlY3RlZCByaWdodCAxXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDEnOiAnNEQ2OCcsXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDInOiAnNEQ2QicsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAxJzogJzRENjknLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMic6ICc0RDZBJyxcclxuICAgICdFOFMgQWtoIFJoYWknOiAnNEQ5OScsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMSc6ICc0RDcwJyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAyJzogJzRENzEnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAxJzogJzRENkYnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAyJzogJzRENzInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gQnJva2VuIHRldGhlci5cclxuICAgICdFOFMgUmVmdWxnZW50IEZhdGUnOiAnNERBNCcsXHJcbiAgICAvLyBTaGFyZWQgb3JiLCBjb3JyZWN0IGlzIEJyaWdodCBQdWxzZSAoNEQ5NSlcclxuICAgICdFOFMgQmxpbmRpbmcgUHVsc2UnOiAnNEQ5NicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOFMgUGF0aCBvZiBMaWdodCc6ICc0REExJywgLy8gUHJvdGVhblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOFMgU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFN0dW5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFOFMgU3RvbmVza2luJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RDg1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzUyMjMnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTIyNCcsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QUZGJywgLy8gZnJvbnRhbCBjbGVhdmUgdHV0b3JpYWwgbWVjaGFuaWNcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQaGFzZXInOiAnNTVFMScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlOIEJhZCBWaWJyYXRpb25zJzogJzU1RTYnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOU4gRWFydGgtU2hhdHRlcmluZyBQYXJ0aWNsZSBCZWFtJzogJzUyMjUnLCAvLyBtaXNzaW5nIHRvd2Vycz9cclxuICAgICdFOU4gQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1NURDJywgLy8gXCJnZXQgb3V0XCIgZHVyaW5nIHBhbmVsc1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAyJzogJzU1REInLCAvLyBDbG9uZSBsaW5lIGFvZXMgdy8gQW50aS1BaXIgUGFydGljbGUgQmVhbVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5TiBXaXRoZHJhdyc6ICc1NTM0JywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOU4gQWV0aGVyb3N5bnRoZXNpcyc6ICc1NTM1JywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDEnOiAnNTVFQicsIC8vIHRhbmsgbGFzZXIgd2l0aCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1NjFEIEV2aWwgU2VlZCBoaXRzIGV2ZXJ5b25lLCBoYXJkIHRvIGtub3cgaWYgdGhlcmUncyBhIGRvdWJsZSB0YXBcclxuLy8gVE9ETzogZmFsbGluZyB0aHJvdWdoIHBhbmVsIGp1c3QgZG9lcyBkYW1hZ2Ugd2l0aCBubyBhYmlsaXR5IG5hbWUsIGxpa2UgYSBkZWF0aCB3YWxsXHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UganVtcCBpbiBzZWVkIHRob3Jucz9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlTIEJhZCBWaWJyYXRpb25zJzogJzU2MUMnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQYXJ0aWNsZSBCZWFtJzogJzVCMDAnLCAvLyBhbnRpLWFpciBcInNpZGVzXCJcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQaGFzZXIgVW5saW1pdGVkJzogJzU2MEUnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJzogJzVCMDEnLCAvLyB3aWRlLWFuZ2xlIFwib3V0XCJcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAxJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMic6ICc1NjAyJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzVBOTUnLCAvLyBib3NzIGxlZnQtcmlnaHQgc3VtbW9uL3BhbmVsIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNUE5NicsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMSc6ICc1NjFFJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMic6ICc1NjFGJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBUaGlyZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAzJywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGluaXRpYWxcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDQnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBBcnQgT2YgRGFya25lc3MnOiAnNTYwNicsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBmaW5hbFxyXG4gICAgJ0U5UyBGdWxsLVBlcmltaXRlciBQYXJ0aWNsZSBCZWFtJzogJzU2MjknLCAvLyBwYW5lbCBcImdldCBpblwiXHJcbiAgICAnRTlTIERhcmsgQ2hhaW5zJzogJzVGQUMnLCAvLyBTbG93IHRvIGJyZWFrIHBhcnRuZXIgY2hhaW5zXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTlTIFdpdGhkcmF3JzogJzU2MUEnLCAvLyBTbG93IHRvIGJyZWFrIHNlZWQgY2hhaW4sIGdldCBzdWNrZWQgYmFjayBpbiB5aWtlc1xyXG4gICAgJ0U5UyBBZXRoZXJvc3ludGhlc2lzJzogJzU2MUInLCAvLyBTdGFuZGluZyBvbiBzZWVkcyBkdXJpbmcgZXhwbG9zaW9uIChwb3NzaWJseSB2aWEgV2l0aGRyYXcpXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdFOVMgU3R5Z2lhbiBUZW5kcmlscyc6ICc5NTInLCAvLyBzdGFuZGluZyBpbiB0aGUgYnJhbWJsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdFOVMgTXVsdGktUHJvbmdlZCBQYXJ0aWNsZSBCZWFtJzogJzU2MDAnLCAvLyBBcnQgT2YgRGFya25lc3MgUGFydG5lciBTdGFja1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQW50aS1haXIgXCJ0YW5rIHNwcmVhZFwiLiAgVGhpcyBjYW4gYmUgc3RhY2tlZCBieSB0d28gdGFua3MgaW52dWxuaW5nLlxyXG4gICAgICAvLyBOb3RlOiB0aGlzIHdpbGwgc3RpbGwgc2hvdyBzb21ldGhpbmcgZm9yIGhvbG1nYW5nL2xpdmluZywgYnV0XHJcbiAgICAgIC8vIGFyZ3VhYmx5IGEgaGVhbGVyIG1pZ2h0IG5lZWQgdG8gZG8gc29tZXRoaW5nIGFib3V0IHRoYXQsIHNvIG1heWJlXHJcbiAgICAgIC8vIGl0J3Mgb2sgdG8gc3RpbGwgc2hvdyBhcyBhIHdhcm5pbmc/P1xyXG4gICAgICBpZDogJ0U5UyBDb25kZW5zZWQgQW50aS1BaXIgUGFydGljbGUgQmVhbScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzU2MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcIm91dFwiLiAgVGhpcyBjYW4gYmUgaW52dWxuZWQgYnkgYSB0YW5rIGFsb25nIHdpdGggdGhlIHNwcmVhZCBhYm92ZS5cclxuICAgICAgaWQ6ICdFOVMgQW50aS1BaXIgUGhhc2VyIFVubGltaXRlZCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzU2MTInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBOIEZvcndhcmQgSW1wbG9zaW9uJzogJzU2QjQnLCAvLyBob3dsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBGb3J3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCNScsIC8vIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgSW1wbG9zaW9uJzogJzU2QjcnLCAvLyB0YWlsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjgnLCAvLyB0YWlsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDEnOiAnNTZEOScsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAyJzogJzVCMjYnLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQ2xvYWsgT2YgU2hhZG93cyc6ICc1QjExJywgLy8gbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxME4gVGhyb25lIE9mIFNoYWRvdyc6ICc1NkM3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxME4gUmlnaHQgR2lnYSBTbGFzaCc6ICc1NkFFJywgLy8gYm9zcyByaWdodCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBSaWdodCBTaGFkb3cgU2xhc2gnOiAnNTZBRicsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIExlZnQgR2lnYSBTbGFzaCc6ICc1NkIxJywgLy8gYm9zcyBsZWZ0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIExlZnQgU2hhZG93IFNsYXNoJzogJzU2QkQnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBTaGFkb3d5IEVydXB0aW9uJzogJzU2RTEnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBtYXJrZXJzIHBhaXJlZCB3aXRoIGJhcmJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBOIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NkRCJywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogaGl0dGluZyBzaGFkb3cgb2YgdGhlIGhlcm8gd2l0aCBhYmlsaXRpZXMgY2FuIGNhdXNlIHlvdSB0byB0YWtlIGRhbWFnZSwgbGlzdCB0aG9zZT9cclxuLy8gICAgICAgZS5nLiBwaWNraW5nIHVwIHlvdXIgZmlyc3QgcGl0Y2ggYm9nIHB1ZGRsZSB3aWxsIGNhdXNlIHlvdSB0byBkaWUgdG8gdGhlIGRhbWFnZVxyXG4vLyAgICAgICB5b3VyIHNoYWRvdyB0YWtlcyBmcm9tIERlZXBzaGFkb3cgTm92YSBvciBEaXN0YW50IFNjcmVhbS5cclxuLy8gVE9ETzogNTczQiBCbGlnaHRpbmcgQmxpdHogaXNzdWVzIGR1cmluZyBsaW1pdCBjdXQgbnVtYmVyc1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDEnOiAnNTZGMicsIC8vIHNpbmdsZSB0YWlsIHVwIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBTaW5nbGUgMic6ICc1NkVGJywgLy8gc2luZ2xlIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAxJzogJzU2RUYnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gUXVhZHJ1cGxlIDInOiAnNTZGMicsIC8vIHF1YWRydXBsZSBzZXQgb2Ygc2hhZG93IGltcGxvc2lvbnNcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggU2luZ2xlIDEnOiAnNTZFQycsIC8vIEdpZ2Egc2xhc2ggc2luZ2xlIGZyb20gc2hhZG93XHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAyJzogJzU2RUQnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMSc6ICc1NzA5JywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIEJveCAyJzogJzU3MEQnLCAvLyBHaWdhIHNsYXNoIGJveCBmcm9tIGZvdXIgZ3JvdW5kIHNoYWRvd3NcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggUXVhZHJ1cGxlIDEnOiAnNTZFQycsIC8vIHF1YWRydXBsZSBzZXQgb2YgZ2lnYSBzbGFzaCBjbGVhdmVzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAyJzogJzU2RTknLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgQ2xvYWsgT2YgU2hhZG93cyAxJzogJzVCMTMnLCAvLyBpbml0aWFsIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMic6ICc1QjE0JywgLy8gc2Vjb25kIHNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxMFMgVGhyb25lIE9mIFNoYWRvdyc6ICc1NzE3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxMFMgU2hhZG93eSBFcnVwdGlvbic6ICc1NzM4JywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgZHVyaW5nIGFtcGxpZmllclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAxJzogJzU3MUEnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0b28gY2xvc2UpXHJcbiAgICAnRTEwUyBTd2F0aCBPZiBTaWxlbmNlIDInOiAnNUJCRicsIC8vIFNoYWRvdyBjbG9uZSBjbGVhdmUgKHRpbWVkKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwUyBTaGFkZWZpcmUnOiAnNTczMicsIC8vIHB1cnBsZSB0YW5rIHVtYnJhbCBvcmJzXHJcbiAgICAnRTEwUyBQaXRjaCBCb2cnOiAnNTcyMicsIC8vIG1hcmtlciBzcHJlYWQgdGhhdCBkcm9wcyBhIHNoYWRvdyBwdWRkbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMFMgU2hhZG93XFwncyBFZGdlJzogJzU3MjUnLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEwUyBEYW1hZ2UgRG93biBPcmJzJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdGbGFtZXNoYWRvdycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVuZmxhbW1lJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbW1lIG9tYnJhbGUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICfjgrfjg6Pjg4njgqbjg5Xjg6zjgqTjg6AnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdkYW1hZ2UnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IGAke21hdGNoZXMuZWZmZWN0fSAocGFydGlhbCBzdGFjaylgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gQm9zcycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoYWNrbGVzIGJlaW5nIG1lc3NlZCB1cCBhcHBlYXIgdG8ganVzdCBnaXZlIHRoZSBEYW1hZ2UgRG93biwgd2l0aCBub3RoaW5nIGVsc2UuXHJcbiAgICAgIC8vIE1lc3NpbmcgdXAgdG93ZXJzIGlzIHRoZSBUaHJpY2UtQ29tZSBSdWluIGVmZmVjdCAoOUUyKSwgYnV0IGFsc28gRGFtYWdlIERvd24uXHJcbiAgICAgIC8vIFRPRE86IHNvbWUgb2YgdGhlc2Ugd2lsbCBiZSBkdXBsaWNhdGVkIHdpdGggb3RoZXJzLCBsaWtlIGBFMTBTIFRocm9uZSBPZiBTaGFkb3dgLlxyXG4gICAgICAvLyBNYXliZSBpdCdkIGJlIG5pY2UgdG8gZmlndXJlIG91dCBob3cgdG8gcHV0IHRoZSBkYW1hZ2UgbWFya2VyIG9uIHRoYXQ/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2hhZG93a2VlcGVyJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2NoYXR0ZW5rw7ZuaWcnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdSb2kgRGUgTFxcJ09tYnJlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn5b2x44Gu546LJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaGFkb3cgV2FycmlvciA0IGRvZyByb29tIGNsZWF2ZVxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBtaXRpZ2F0ZWQgYnkgdGhlIHdob2xlIGdyb3VwLCBzbyBhZGQgYSBkYW1hZ2UgY29uZGl0aW9uLlxyXG4gICAgICBpZDogJ0UxMFMgQmFyYnMgT2YgQWdvbnknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNTcyQScsICc1QjI3J10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3NpcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2MkUnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEZpcmUnOiAnNTYyQycsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjMwJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm5vdXQnOiAnNTYyRicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBTaGluaW5nIEJsYWRlJzogJzU2MzEnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTYzQicsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2M0MnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBSZXNvdW5kaW5nIENyYWNrJzogJzU2NEQnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY0NScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjQzJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY0NicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFOIEJsYXN0aW5nIFpvbmUnOiAnNTYzRScsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJuIE1hcmsnOiAnNTY0RicsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExTiBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU2MkQgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY0NCA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2MkQnLCAnNTY0NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gNTY1QS81NjhEIFNpbnNtb2tlIEJvdW5kIE9mIEZhaXRoIHNoYXJlXHJcbi8vIDU2NUUvNTY5OSBCb3dzaG9jayBoaXRzIHRhcmdldCBvZiA1NjVEICh0d2ljZSkgYW5kIHR3byBvdGhlcnNcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VBbmFtb3JwaG9zaXNTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEZpcmUnOiAnNTY1MicsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2NTQnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEhvbHknOiAnNTY1NicsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBTaGluaW5nIEJsYWRlJzogJzU2NTcnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgRmlyZSc6ICc1NjhFJywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgTGlnaHRuaW5nJzogJzU2OTUnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBIb2x5JzogJzU2OUQnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIFNoaW5pbmcgQmxhZGUgQ3ljbGUnOiAnNTY5RScsIC8vIEJhaXRlZCBleHBsb3Npb24gZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTY2RCcsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2NkMnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBQb3J0YWwgT2YgRmxhbWUgQnJpZ2h0IFB1bHNlJzogJzU2NzEnLCAvLyBSZWQgY2FyZCBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBQb3J0YWwgT2YgTGV2aW4gQnJpZ2h0IFB1bHNlJzogJzU2NzAnLCAvLyBCbHVlIGNhcmQgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUmVzb25hbnQgV2luZHMnOiAnNTY4OScsIC8vIERlbWktR3VrdW1hdHogXCJnZXQgaW5cIlxyXG4gICAgJ0UxMVMgUmVzb3VuZGluZyBDcmFjayc6ICc1Njg4JywgLy8gRGVtaS1HdWt1bWF0eiAyNzAgZGVncmVlIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRTExUyBJbWFnZSBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2N0InLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybm91dCc6ICc1NjdDJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEZpcmUnOiAnNTY3OScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjdCJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIFNoaW5pbmcgQmxhZGUnOiAnNTY3RScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGJhaXRlZCBleHBsb3Npb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFTIEJ1cm5vdXQnOiAnNTY1NScsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExUyBCdXJub3V0IEN5Y2xlJzogJzU2OTYnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMVMgQmxhc3RpbmcgWm9uZSc6ICc1Njc0JywgLy8gUHJpc21hdGljIERlY2VwdGlvbiBjaGFyZ2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTFTIEVsZW1lbnRhbCBCcmVhayc6ICc1NjY0JywgLy8gRWxlbWVudGFsIEJyZWFrIHByb3RlYW5cclxuICAgICdFMTFTIEVsZW1lbnRhbCBCcmVhayBDeWNsZSc6ICc1NjhDJywgLy8gRWxlbWVudGFsIEJyZWFrIHByb3RlYW4gZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBTaW5zbWl0ZSc6ICc1NjY3JywgLy8gTGlnaHRuaW5nIEVsZW1lbnRhbCBCcmVhayBzcHJlYWRcclxuICAgICdFMTFTIFNpbnNtaXRlIEN5Y2xlJzogJzU2OTQnLCAvLyBMaWdodG5pbmcgRWxlbWVudGFsIEJyZWFrIHNwcmVhZCBkdXJpbmcgQ3ljbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMVMgQnVybiBNYXJrJzogJzU2QTMnLCAvLyBQb3dkZXIgTWFyayBkZWJ1ZmYgZXhwbG9zaW9uXHJcbiAgICAnRTExUyBTaW5zaWdodCAxJzogJzU2NjEnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlclxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMic6ICc1QkM3JywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXIgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAnRTExUyBTaW5zaWdodCAzJzogJzU2QTAnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlciBkdXJpbmcgQ3ljbGVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTExUyBIb2x5IFNpbnNpZ2h0IEdyb3VwIFNoYXJlJzogJzU2NjknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTFTIEJsYXN0YnVybiBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNTY1MyA9IEJ1cm50IFN0cmlrZSBmaXJlIGZvbGxvd3VwIGR1cmluZyBtb3N0IG9mIHRoZSBmaWdodFxyXG4gICAgICAvLyA1NjdBID0gc2FtZSB0aGluZywgYnV0IGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgICAvLyA1NjhGID0gc2FtZSB0aGluZywgYnV0IGR1cmluZyBDeWNsZSBvZiBGYWl0aFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTY1MycsICc1NjdBJywgJzU2OEYnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlRXRlcm5pdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMk4gSnVkZ21lbnQgSm9sdCBTaW5nbGUnOiAnNTg1RicsIC8vIFJhbXVoIGdldCBvdXQgY2FzdFxyXG4gICAgJ0UxMk4gSnVkZ21lbnQgSm9sdCc6ICc0RTMwJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBUZW1wb3JhcnkgQ3VycmVudCBTaW5nbGUnOiAnNTg1QycsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFMkQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0XHJcbiAgICAnRTEyTiBDb25mbGFnIFN0cmlrZSBTaW5nbGUnOiAnNTg1RCcsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0XHJcbiAgICAnRTEyTiBDb25mbGFnIFN0cmlrZSc6ICc0RTJFJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIEZlcm9zdG9ybSBTaW5nbGUnOiAnNTg1RScsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtJzogJzRFMkYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3RcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAxJzogJzU4NzgnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBSYXB0dXJvdXMgUmVhY2ggMic6ICc1ODc3JywgLy8gSGFpcmN1dFxyXG4gICAgJ0UxMk4gQm9tYiBFeHBsb3Npb24nOiAnNTg2RCcsIC8vIFNtYWxsIGJvbWIgZXhwbG9zaW9uXHJcbiAgICAnRTEyTiBUaXRhbmljIEJvbWIgRXhwbG9zaW9uJzogJzU4NkYnLCAvLyBMYXJnZSBib21iIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyTiBFYXJ0aHNoYWtlcic6ICc1ODg1JywgLy8gRWFydGhzaGFrZXIgb24gZmlyc3QgcGxhdGZvcm1cclxuICAgICdFMTJOIFByb21pc2UgRnJpZ2lkIFN0b25lIDEnOiAnNTg2NycsIC8vIFNoaXZhIHNwcmVhZCB3aXRoIHNsaWRpbmdcclxuICAgICdFMTJOIFByb21pc2UgRnJpZ2lkIFN0b25lIDInOiAnNTg2OScsIC8vIFNoaXZhIHNwcmVhZCB3aXRoIFJhcHR1cm91cyBSZWFjaFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgeyBMYW5nIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL2xhbmd1YWdlcyc7XHJcbmltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IHsgVW5yZWFjaGFibGVDb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25vdF9yZWFjaGVkJztcclxuaW1wb3J0IE91dHB1dHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL291dHB1dHMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE5ldE1hdGNoZXMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9uZXRfbWF0Y2hlcyc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgTG9jYWxlVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL3RyaWdnZXInO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBkZWNPZmZzZXQ/OiBudW1iZXI7XHJcbiAgbGFzZXJOYW1lVG9OdW0/OiB7IFtuYW1lOiBzdHJpbmddOiBudW1iZXIgfTtcclxuICBzY3VscHR1cmVUZXRoZXJOYW1lVG9JZD86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIHNjdWxwdHVyZVlQb3NpdGlvbnM/OiB7IFtzY3VscHR1cmVJZDogc3RyaW5nXTogbnVtYmVyIH07XHJcbiAgYmxhZGVPZkZsYW1lQ291bnQ/OiBudW1iZXI7XHJcbiAgcGlsbGFySWRUb093bmVyPzogeyBbcGlsbGFySWQ6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIHNtYWxsTGlvbklkVG9Pd25lcj86IHsgW3BpbGxhcklkOiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICBzbWFsbExpb25Pd25lcnM/OiBzdHJpbmdbXTtcclxuICBub3J0aEJpZ0xpb24/OiBzdHJpbmc7XHJcbiAgZmlyZT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gVE9ETzogYWRkIHNlcGFyYXRlIGRhbWFnZVdhcm4tZXNxdWUgaWNvbiBmb3IgZGFtYWdlIGRvd25zP1xyXG4vLyBUT0RPOiA1OEE2IFVuZGVyIFRoZSBXZWlnaHQgLyA1OEIyIENsYXNzaWNhbCBTY3VscHR1cmUgbWlzc2luZyBzb21lYm9keSBpbiBwYXJ0eSB3YXJuaW5nP1xyXG4vLyBUT0RPOiA1OENBIERhcmsgV2F0ZXIgSUlJIC8gNThDNSBTaGVsbCBDcnVzaGVyIHNob3VsZCBoaXQgZXZlcnlvbmUgaW4gcGFydHlcclxuLy8gVE9ETzogRGFyayBBZXJvIElJSSA1OEQ0IHNob3VsZCBub3QgYmUgYSBzaGFyZSBleGNlcHQgb24gYWR2YW5jZWQgcmVsYXRpdml0eSBmb3IgZG91YmxlIGFlcm8uXHJcbi8vIChmb3IgZ2FpbnMgZWZmZWN0LCBzaW5nbGUgYWVybyA9IH4yMyBzZWNvbmRzLCBkb3VibGUgYWVybyA9IH4zMSBzZWNvbmRzIGR1cmF0aW9uKVxyXG5cclxuLy8gRHVlIHRvIGNoYW5nZXMgaW50cm9kdWNlZCBpbiBwYXRjaCA1LjIsIG92ZXJoZWFkIG1hcmtlcnMgbm93IGhhdmUgYSByYW5kb20gb2Zmc2V0XHJcbi8vIGFkZGVkIHRvIHRoZWlyIElELiBUaGlzIG9mZnNldCBjdXJyZW50bHkgYXBwZWFycyB0byBiZSBzZXQgcGVyIGluc3RhbmNlLCBzb1xyXG4vLyB3ZSBjYW4gZGV0ZXJtaW5lIHdoYXQgaXQgaXMgZnJvbSB0aGUgZmlyc3Qgb3ZlcmhlYWQgbWFya2VyIHdlIHNlZS5cclxuLy8gVGhlIGZpcnN0IDFCIG1hcmtlciBpbiB0aGUgZW5jb3VudGVyIGlzIHRoZSBmb3JtbGVzcyB0YW5rYnVzdGVyLCBJRCAwMDRGLlxyXG5jb25zdCBmaXJzdEhlYWRtYXJrZXIgPSBwYXJzZUludCgnMDBEQScsIDE2KTtcclxuY29uc3QgZ2V0SGVhZG1hcmtlcklkID0gKGRhdGE6IERhdGEsIG1hdGNoZXM6IE5ldE1hdGNoZXNbJ0hlYWRNYXJrZXInXSkgPT4ge1xyXG4gIC8vIElmIHdlIG5haXZlbHkganVzdCBjaGVjayAhZGF0YS5kZWNPZmZzZXQgYW5kIGxlYXZlIGl0LCBpdCBicmVha3MgaWYgdGhlIGZpcnN0IG1hcmtlciBpcyAwMERBLlxyXG4gIC8vIChUaGlzIG1ha2VzIHRoZSBvZmZzZXQgMCwgYW5kICEwIGlzIHRydWUuKVxyXG4gIGlmICh0eXBlb2YgZGF0YS5kZWNPZmZzZXQgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgZGF0YS5kZWNPZmZzZXQgPSBwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBmaXJzdEhlYWRtYXJrZXI7XHJcbiAgLy8gVGhlIGxlYWRpbmcgemVyb2VzIGFyZSBzdHJpcHBlZCB3aGVuIGNvbnZlcnRpbmcgYmFjayB0byBzdHJpbmcsIHNvIHdlIHJlLWFkZCB0aGVtIGhlcmUuXHJcbiAgLy8gRm9ydHVuYXRlbHksIHdlIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgd2hldGhlciBvciBub3QgdGhpcyBpcyByb2J1c3QsXHJcbiAgLy8gc2luY2Ugd2Uga25vdyBhbGwgdGhlIElEcyB0aGF0IHdpbGwgYmUgcHJlc2VudCBpbiB0aGUgZW5jb3VudGVyLlxyXG4gIHJldHVybiAocGFyc2VJbnQobWF0Y2hlcy5pZCwgMTYpIC0gZGF0YS5kZWNPZmZzZXQpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpLnBhZFN0YXJ0KDQsICcwJyk7XHJcbn07XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlRXRlcm5pdHlTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBSYXB0dXJvdXMgUmVhY2ggTGVmdCc6ICc1OEFEJywgLy8gSGFpcmN1dCB3aXRoIGxlZnQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBSaWdodCc6ICc1OEFFJywgLy8gSGFpcmN1dCB3aXRoIHJpZ2h0IHNhZmUgc2lkZVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBUZW1wb3JhcnkgQ3VycmVudCc6ICc0RTQ0JywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIENvbmZsYWcgU3RyaWtlJzogJzRFNDUnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIEZlcm9zdG9ybSc6ICc0RTQ2JywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgSnVkZ21lbnQgSm9sdCc6ICc0RTQ3JywgLy8gUmFtdWggZ2V0IG91dCBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgU2hhdHRlcic6ICc1ODlDJywgLy8gSWNlIFBpbGxhciBleHBsb3Npb24gaWYgdGV0aGVyIG5vdCBnb3R0ZW5cclxuICAgICdFMTJTIFByb21pc2UgSW1wYWN0JzogJzU4QTEnLCAvLyBUaXRhbiBib21iIGRyb3BcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEJsaXp6YXJkIElJSSc6ICc1OEQzJywgLy8gUmVsYXRpdml0eSBkb251dCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIEFwb2NhbHlwc2UnOiAnNThFNicsIC8vIExpZ2h0IHVwIGNpcmNsZSBleHBsb3Npb25zIChkYW1hZ2UgZG93bilcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTJTIE9yYWNsZSBNYWVsc3Ryb20nOiAnNThEQScsIC8vIEFkdmFuY2VkIFJlbGF0aXZpdHkgdHJhZmZpYyBsaWdodCBhb2VcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIERvb20nOiAnOUQ0JywgLy8gUmVsYXRpdml0eSBwdW5pc2htZW50IGZvciBtdWx0aXBsZSBtaXN0YWtlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZyaWdpZCBTdG9uZSc6ICc1ODlFJywgLy8gU2hpdmEgc3ByZWFkXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFya2VzdCBEYW5jZSc6ICc0RTMzJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgKyBqdW1wIGJlZm9yZSBrbm9ja2JhY2tcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEN1cnJlbnQnOiAnNThEOCcsIC8vIEJhaXRlZCB0cmFmZmljIGxpZ2h0IGxhc2Vyc1xyXG4gICAgJ0UxMlMgT3JhY2xlIFNwaXJpdCBUYWtlcic6ICc1OEM2JywgLy8gUmFuZG9tIGp1bXAgc3ByZWFkIG1lY2hhbmljIGFmdGVyIFNoZWxsIENydXNoZXJcclxuICAgICdFMTJTIE9yYWNsZSBTb21iZXIgRGFuY2UgMSc6ICc1OEJGJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgZm9yIER1YWwgQXBvY2FseXBzZVxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAyJzogJzU4QzAnLCAvLyBTZWNvbmQgc29tYmVyIGRhbmNlIGp1bXBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBXZWlnaHQgT2YgVGhlIFdvcmxkJzogJzU4QTUnLCAvLyBUaXRhbiBib21iIGJsdWUgbWFya2VyXHJcbiAgICAnRTEyUyBQcm9taXNlIFB1bHNlIE9mIFRoZSBMYW5kJzogJzU4QTMnLCAvLyBUaXRhbiBib21iIHllbGxvdyBtYXJrZXJcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEVydXB0aW9uIDEnOiAnNThDRScsIC8vIEluaXRpYWwgd2FybXVwIHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMic6ICc1OENEJywgLy8gUmVsYXRpdml0eSBzcHJlYWQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBCbGFjayBIYWxvJzogJzU4QzcnLCAvLyBUYW5rYnVzdGVyIGNsZWF2ZVxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgRm9yY2UgT2YgVGhlIExhbmQnOiAnNThBNCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBCaWcgY2lyY2xlIGdyb3VuZCBhb2VzIGR1cmluZyBTaGl2YSBqdW5jdGlvbi5cclxuICAgICAgLy8gVGhpcyBjYW4gYmUgc2hpZWxkZWQgdGhyb3VnaCBhcyBsb25nIGFzIHRoYXQgcGVyc29uIGRvZXNuJ3Qgc3RhY2suXHJcbiAgICAgIGlkOiAnRTEyUyBJY2ljbGUgSW1wYWN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEU1QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBIZWFkbWFya2VyJyxcclxuICAgICAgdHlwZTogJ0hlYWRNYXJrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHt9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gZ2V0SGVhZG1hcmtlcklkKGRhdGEsIG1hdGNoZXMpO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0TGFzZXJNYXJrZXIgPSAnMDA5MSc7XHJcbiAgICAgICAgY29uc3QgbGFzdExhc2VyTWFya2VyID0gJzAwOTgnO1xyXG4gICAgICAgIGlmIChpZCA+PSBmaXJzdExhc2VyTWFya2VyICYmIGlkIDw9IGxhc3RMYXNlck1hcmtlcikge1xyXG4gICAgICAgICAgLy8gaWRzIGFyZSBzZXF1ZW50aWFsOiAjMSBzcXVhcmUsICMyIHNxdWFyZSwgIzMgc3F1YXJlLCAjNCBzcXVhcmUsICMxIHRyaWFuZ2xlIGV0Y1xyXG4gICAgICAgICAgY29uc3QgZGVjT2Zmc2V0ID0gcGFyc2VJbnQoaWQsIDE2KSAtIHBhcnNlSW50KGZpcnN0TGFzZXJNYXJrZXIsIDE2KTtcclxuXHJcbiAgICAgICAgICAvLyBkZWNPZmZzZXQgaXMgMC03LCBzbyBtYXAgMC0zIHRvIDEtNCBhbmQgNC03IHRvIDEtNC5cclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW0gPz89IHt9O1xyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bVttYXRjaGVzLnRhcmdldF0gPSBkZWNPZmZzZXQgJSA0ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBzY3VscHR1cmVzIGFyZSBhZGRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpZ2h0LCBzbyB3ZSBuZWVkIHRvIGNoZWNrIHdoZXJlIHRoZXlcclxuICAgICAgLy8gdXNlIHRoZSBcIkNsYXNzaWNhbCBTY3VscHR1cmVcIiBhYmlsaXR5IGFuZCBlbmQgdXAgb24gdGhlIGFyZW5hIGZvciByZWFsLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgQ2xhc3NpY2FsIFNjdWxwdHVyZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIHJ1biBwZXIgcGVyc29uIHRoYXQgZ2V0cyBoaXQgYnkgdGhlIHNhbWUgc2N1bHB0dXJlLCBidXQgdGhhdCdzIGZpbmUuXHJcbiAgICAgICAgLy8gUmVjb3JkIHRoZSB5IHBvc2l0aW9uIG9mIGVhY2ggc2N1bHB0dXJlIHNvIHdlIGNhbiB1c2UgaXQgZm9yIGJldHRlciB0ZXh0IGxhdGVyLlxyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGUgc291cmNlIG9mIHRoZSB0ZXRoZXIgaXMgdGhlIHBsYXllciwgdGhlIHRhcmdldCBpcyB0aGUgc2N1bHB0dXJlLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgVGV0aGVyJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHRhcmdldDogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkID8/PSB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkW21hdGNoZXMuc291cmNlXSA9IG1hdGNoZXMudGFyZ2V0SWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lIENvdW50ZXInLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjMnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDEsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgPSBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDA7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCsrO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBpcyB0aGUgQ2hpc2VsZWQgU2N1bHB0dXJlIGxhc2VyIHdpdGggdGhlIGxpbWl0IGN1dCBkb3RzLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCbGFkZSBPZiBGbGFtZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmxhc2VyTmFtZVRvTnVtIHx8ICFkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkIHx8ICFkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEZpbmQgdGhlIHBlcnNvbiB3aG8gaGFzIHRoaXMgbGFzZXIgbnVtYmVyIGFuZCBpcyB0ZXRoZXJlZCB0byB0aGlzIHN0YXR1ZS5cclxuICAgICAgICBjb25zdCBudW1iZXIgPSAoZGF0YS5ibGFkZU9mRmxhbWVDb3VudCB8fCAwKSArIDE7XHJcbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSBtYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBPYmplY3Qua2V5cyhkYXRhLmxhc2VyTmFtZVRvTnVtKTtcclxuICAgICAgICBjb25zdCB3aXRoTnVtID0gbmFtZXMuZmlsdGVyKChuYW1lKSA9PiBkYXRhLmxhc2VyTmFtZVRvTnVtPy5bbmFtZV0gPT09IG51bWJlcik7XHJcbiAgICAgICAgY29uc3Qgb3duZXJzID0gd2l0aE51bS5maWx0ZXIoKG5hbWUpID0+IGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQ/LltuYW1lXSA9PT0gc291cmNlSWQpO1xyXG5cclxuICAgICAgICAvLyBpZiBzb21lIGxvZ2ljIGVycm9yLCBqdXN0IGFib3J0LlxyXG4gICAgICAgIGlmIChvd25lcnMubGVuZ3RoICE9PSAxKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUaGUgb3duZXIgaGl0dGluZyB0aGVtc2VsdmVzIGlzbid0IGEgbWlzdGFrZS4uLnRlY2huaWNhbGx5LlxyXG4gICAgICAgIGlmIChvd25lcnNbMF0gPT09IG1hdGNoZXMudGFyZ2V0KVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBOb3cgdHJ5IHRvIGZpZ3VyZSBvdXQgd2hpY2ggc3RhdHVlIGlzIHdoaWNoLlxyXG4gICAgICAgIC8vIFBlb3BsZSBjYW4gcHV0IHRoZXNlIHdoZXJldmVyLiAgVGhleSBjb3VsZCBnbyBzaWRld2F5cywgb3IgZGlhZ29uYWwsIG9yIHdoYXRldmVyLlxyXG4gICAgICAgIC8vIEl0IHNlZW1zIG1vb29vb3N0IHBlb3BsZSBwdXQgdGhlc2Ugbm9ydGggLyBzb3V0aCAob24gdGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGFyZW5hKS5cclxuICAgICAgICAvLyBMZXQncyBzYXkgYSBtaW5pbXVtIG9mIDIgeWFsbXMgYXBhcnQgaW4gdGhlIHkgZGlyZWN0aW9uIHRvIGNvbnNpZGVyIHRoZW0gXCJub3J0aC9zb3V0aFwiLlxyXG4gICAgICAgIGNvbnN0IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMgPSAyO1xyXG5cclxuICAgICAgICBsZXQgaXNTdGF0dWVQb3NpdGlvbktub3duID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzU3RhdHVlTm9ydGggPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBzY3VscHR1cmVJZHMgPSBPYmplY3Qua2V5cyhkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpO1xyXG4gICAgICAgIGlmIChzY3VscHR1cmVJZHMubGVuZ3RoID09PSAyICYmIHNjdWxwdHVyZUlkcy5pbmNsdWRlcyhzb3VyY2VJZCkpIHtcclxuICAgICAgICAgIGNvbnN0IG90aGVySWQgPSBzY3VscHR1cmVJZHNbMF0gPT09IHNvdXJjZUlkID8gc2N1bHB0dXJlSWRzWzFdIDogc2N1bHB0dXJlSWRzWzBdO1xyXG4gICAgICAgICAgY29uc3Qgc291cmNlWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tzb3VyY2VJZF07XHJcbiAgICAgICAgICBjb25zdCBvdGhlclkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbb3RoZXJJZCA/PyAnJ107XHJcbiAgICAgICAgICBpZiAoc291cmNlWSA9PT0gdW5kZWZpbmVkIHx8IG90aGVyWSA9PT0gdW5kZWZpbmVkIHx8IG90aGVySWQgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG4gICAgICAgICAgY29uc3QgeURpZmYgPSBNYXRoLmFicyhzb3VyY2VZIC0gb3RoZXJZKTtcclxuICAgICAgICAgIGlmICh5RGlmZiA+IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMpIHtcclxuICAgICAgICAgICAgaXNTdGF0dWVQb3NpdGlvbktub3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXNTdGF0dWVOb3J0aCA9IHNvdXJjZVkgPCBvdGhlclk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvd25lciA9IG93bmVyc1swXTtcclxuICAgICAgICBjb25zdCBvd25lck5pY2sgPSBkYXRhLlNob3J0TmFtZShvd25lcik7XHJcbiAgICAgICAgbGV0IHRleHQgPSB7XHJcbiAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIKWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmIGlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3J0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3JkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWMl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWMl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg67aB7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmICFpc1N0YXR1ZU5vcnRoKSB7XHJcbiAgICAgICAgICB0ZXh0ID0ge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0gc291dGgpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0gU8O8ZGVuKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZfjga4ke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6rljZfmlrkke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIIOuCqOyqvSlgLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgVHJhY2tlcicsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdJY2UgUGlsbGFyJywgaWQ6IFsnMDAwMScsICcwMDM5J10gfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lciA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgTWlzdGFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogJzU4OUInIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLnBpbGxhcklkVG9Pd25lcilcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgIT09IGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBpbGxhck93bmVyID0gZGF0YS5TaG9ydE5hbWUoZGF0YS5waWxsYXJJZFRvT3duZXI/LlttYXRjaGVzLnNvdXJjZUlkXSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7cGlsbGFyT3duZXJ944GL44KJKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6oke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtwaWxsYXJPd25lcn1cIilgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgR2FpbiBGaXJlIFJlc2lzdGFuY2UgRG93biBJSScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoZSBCZWFzdGx5IFNjdWxwdHVyZSBnaXZlcyBhIDMgc2Vjb25kIGRlYnVmZiwgdGhlIFJlZ2FsIFNjdWxwdHVyZSBnaXZlcyBhIDE0cyBvbmUuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4MzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5maXJlID8/PSB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIExvc2UgRmlyZSBSZXNpc3RhbmNlIERvd24gSUknLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnODMyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmlyZSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0FiYmlsZCBFaW5lcyBMw7Z3ZW4nLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0Nyw6lhdGlvbiBMw6lvbmluZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyID8/PSB7fTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uT3duZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBMaW9uc2JsYXplJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0JlYXN0bHkgU2N1bHB0dXJlJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0FiYmlsZCBFaW5lcyBMw7Z3ZW4nLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkCcsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gRm9sa3MgYmFpdGluZyB0aGUgYmlnIGxpb24gc2Vjb25kIGNhbiB0YWtlIHRoZSBmaXJzdCBzbWFsbCBsaW9uIGhpdCxcclxuICAgICAgICAvLyBzbyBpdCdzIG5vdCBzdWZmaWNpZW50IHRvIGNoZWNrIG9ubHkgdGhlIG93bmVyLlxyXG4gICAgICAgIGlmICghZGF0YS5zbWFsbExpb25Pd25lcnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgb3duZXIgPSBkYXRhLnNtYWxsTGlvbklkVG9Pd25lcj8uW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgaWYgKCFvd25lcilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAobWF0Y2hlcy50YXJnZXQgPT09IG93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGFsc28gaGFzIGEgc21hbGwgbGlvbiB0ZXRoZXIsIHRoYXQgaXMgYWx3YXlzIGEgbWlzdGFrZS5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0J3Mgb25seSBhIG1pc3Rha2UgaWYgdGhlIHRhcmdldCBoYXMgYSBmaXJlIGRlYnVmZi5cclxuICAgICAgICBjb25zdCBoYXNTbWFsbExpb24gPSBkYXRhLnNtYWxsTGlvbk93bmVycy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICBpZiAoaGFzU21hbGxMaW9uIHx8IGhhc0ZpcmVEZWJ1ZmYpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgICAgY29uc3QgeCA9IHBhcnNlRmxvYXQobWF0Y2hlcy54KTtcclxuICAgICAgICAgIGNvbnN0IHkgPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgICAgICBsZXQgZGlyT2JqID0gbnVsbDtcclxuICAgICAgICAgIGlmICh5IDwgY2VudGVyWSkge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJORTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyTlc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTRTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyU1c7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogb3duZXIsXHJcbiAgICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZW4nXX0pYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2RlJ119KWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2ZyJ119KWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7b3duZXJOaWNrfeOBi+OCiSwgJHtkaXJPYmpbJ2phJ119KWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2NuJ119YCxcclxuICAgICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7ZGlyT2JqWydrbyddfSlgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBOb3J0aCBCaWcgTGlvbicsXHJcbiAgICAgIHR5cGU6ICdBZGRlZENvbWJhdGFudCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCh7IG5hbWU6ICdSZWdhbCBTY3VscHR1cmUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgIGlmICh5IDwgY2VudGVyWSlcclxuICAgICAgICAgIGRhdGEubm9ydGhCaWdMaW9uID0gbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmlnIExpb24gS2luZ3NibGF6ZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ1JlZ2FsIFNjdWxwdHVyZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0FiYmlsZCBlaW5lcyBncm/Dn2VuIEzDtndlbicsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ2Nyw6lhdGlvbiBsw6lvbmluZSByb3lhbGUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZDnjosnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNpbmdsZVRhcmdldCA9IG1hdGNoZXMudHlwZSA9PT0gJzIxJztcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIC8vIFN1Y2Nlc3MgaWYgb25seSBvbmUgcGVyc29uIHRha2VzIGl0IGFuZCB0aGV5IGhhdmUgbm8gZmlyZSBkZWJ1ZmYuXHJcbiAgICAgICAgaWYgKHNpbmdsZVRhcmdldCAmJiAhaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgbm9ydGhCaWdMaW9uOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdub3J0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICBkZTogJ05vcmRlbSwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljJcpJyxcclxuICAgICAgICAgIGNuOiAn5YyX5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgIGtvOiAn67aB7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc291dGhCaWdMaW9uOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdzb3V0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICBkZTogJ1PDvGRlbiwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljZcpJyxcclxuICAgICAgICAgIGNuOiAn5Y2X5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgIGtvOiAn64Ko7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc2hhcmVkOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdzaGFyZWQnLFxyXG4gICAgICAgICAgZGU6ICdnZXRlaWx0JyxcclxuICAgICAgICAgIGphOiAn6YeN44Gt44GfJyxcclxuICAgICAgICAgIGNuOiAn6YeN5Y+gJyxcclxuICAgICAgICAgIGtvOiAn6rCZ7J20IOunnuydjCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBmaXJlRGVidWZmOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdoYWQgZmlyZScsXHJcbiAgICAgICAgICBkZTogJ2hhdHRlIEZldWVyJyxcclxuICAgICAgICAgIGphOiAn54KO5LuY44GNJyxcclxuICAgICAgICAgIGNuOiAn54GrRGVidWZmJyxcclxuICAgICAgICAgIGtvOiAn7ZmU7Je8IOuUlOuyhO2UhCDrsJvsnYwnLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGxhYmVscyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGxhbmc6IExhbmcgPSBkYXRhLm9wdGlvbnMuUGFyc2VyTGFuZ3VhZ2U7XHJcblxyXG4gICAgICAgIGlmIChkYXRhLm5vcnRoQmlnTGlvbikge1xyXG4gICAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uID09PSBtYXRjaGVzLnNvdXJjZUlkKVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChub3J0aEJpZ0xpb25bbGFuZ10gPz8gbm9ydGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2goc291dGhCaWdMaW9uW2xhbmddID8/IHNvdXRoQmlnTGlvblsnZW4nXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2luZ2xlVGFyZ2V0KVxyXG4gICAgICAgICAgbGFiZWxzLnB1c2goc2hhcmVkW2xhbmddID8/IHNoYXJlZFsnZW4nXSk7XHJcbiAgICAgICAgaWYgKGhhc0ZpcmVEZWJ1ZmYpXHJcbiAgICAgICAgICBsYWJlbHMucHVzaChmaXJlRGVidWZmW2xhbmddID8/IGZpcmVEZWJ1ZmZbJ2VuJ10pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2xhYmVscy5qb2luKCcsICcpfSlgLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU4OUEgPSBJY2UgUGlsbGFyIChwcm9taXNlIHNoaXZhIHBoYXNlKVxyXG4gICAgICAvLyA1OEI2ID0gUGFsbSBPZiBUZW1wZXJhbmNlIChwcm9taXNlIHN0YXR1ZSBoYW5kKVxyXG4gICAgICAvLyA1OEI3ID0gTGFzZXIgRXllIChwcm9taXNlIGxpb24gcGhhc2UpXHJcbiAgICAgIC8vIDU4QzEgPSBEYXJrZXN0IERhbmNlIChvcmFjbGUgdGFuayBqdW1wICsga25vY2tiYWNrIGluIGJlZ2lubmluZyBhbmQgdHJpcGxlIGFwb2MpXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1ODlBJywgJzU4QjYnLCAnNThCNycsICc1OEMxJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIE9yYWNsZSBTaGFkb3dleWUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1OEQyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiB3YXJuaW5nIGZvciB0YWtpbmcgRGlhbW9uZCBGbGFzaCAoNUZBMSkgc3RhY2sgb24geW91ciBvd24/XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2tFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDEnOiAnNUZBRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMic6ICc1RkIyJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAzJzogJzVGQ0QnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDQnOiAnNUZDRScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNSc6ICc1RkNGJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA2JzogJzVGRjgnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDcnOiAnNjE1OScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBcnRpY3VsYXRlZCBCaXQgQWV0aGVyaWFsIEJ1bGxldCc6ICc1RkFCJywgLy8gYml0IGxhc2VycyBkdXJpbmcgYWxsIHBoYXNlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDEnOiAnNUZDQicsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDInOiAnNUZDQycsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIExlZnQnOiAnNUZDMicsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IENsYXcgU3dpcGUgUmlnaHQnOiAnNUZDMycsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQ3ljbG9uZSAxJzogJzVGRDEnLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMic6ICc1RkQyJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmRFeCBBaXJzaGlwXFwncyBCYW5lIDInOiAnNUZEMycsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggVGFuayBMYXNlcnMnOiAnNUZDOCcsIC8vIGNsZWF2aW5nIHllbGxvdyBsYXNlcnMgb24gdG9wIHR3byBlbm1pdHlcclxuICAgICdEaWFtb25kRXggSG9taW5nIExhc2VyJzogJzVGQzQnLCAvLyBBZGFtYW50ZSBQdXJnZSBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBGbG9vZCBSYXknOiAnNUZDNycsIC8vIFwibGltaXQgY3V0XCIgY2xlYXZlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kRXggVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkQwJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIERpYW1vbmQgV2VhcG9uIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ2xvdWREZWNrLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEFydHMnOiAnNUZFMycsIC8vIEF1cmkgQXJ0cyBkYXNoZXNcclxuICAgICdEaWFtb25kIFdlYXBvbiBEaWFtb25kIFNocmFwbmVsIEluaXRpYWwnOiAnNUZFMScsIC8vIGluaXRpYWwgY2lyY2xlIG9mIERpYW1vbmQgU2hyYXBuZWxcclxuICAgICdEaWFtb25kIFdlYXBvbiBEaWFtb25kIFNocmFwbmVsIENoYXNpbmcnOiAnNUZFMicsIC8vIGZvbGxvd3VwIGNpcmNsZXMgZnJvbSBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWV0aGVyaWFsIEJ1bGxldCc6ICc1RkQ1JywgLy8gYml0IGxhc2Vyc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIENsYXcgU3dpcGUgTGVmdCc6ICc1RkQ5JywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIFJpZ2h0JzogJzVGREEnLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEF1cmkgQ3ljbG9uZSAxJzogJzVGRTYnLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEF1cmkgQ3ljbG9uZSAyJzogJzVGRTcnLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFpcnNoaXBcXCdzIEJhbmUgMSc6ICc1RkU4JywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDInOiAnNUZGRScsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBIb21pbmcgTGFzZXInOiAnNUZEQicsIC8vIHNwcmVhZCBtYXJrZXJzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0RpYW1vbmQgV2VhcG9uIFZlcnRpY2FsIENsZWF2ZSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUZFNScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNhc3RydW1NYXJpbnVtRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5JzogJzVCRDMnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMSc6ICc1NTdCJywgLy8gRW1lcmFsZCBCZWFtIGluc2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkRXggUGhvdG9uIExhc2VyIDInOiAnNTU3RCcsIC8vIEVtZXJhbGQgQmVhbSBvdXRzaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSAxJzogJzU1N0EnLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSAyJzogJzU1NzknLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGRFeCBFeHBsb3Npb24nOiAnNTU5NicsIC8vIE1hZ2l0ZWsgTWluZSBleHBsb3Npb25cclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgSW5pdGlhbCc6ICc1NUNEJywgLy8gc3dvcmQgaW5pdGlhbCBwdWRkbGVzXHJcbiAgICAnRW1lcmFsZEV4IFRlcnRpdXMgVGVybWludXMgRXN0IEV4cGxvc2lvbic6ICc1NUNFJywgLy8gc3dvcmQgZXhwbG9zaW9uc1xyXG4gICAgJ0VtZXJhbGRFeCBBaXJib3JuZSBFeHBsb3Npb24nOiAnNTVCRCcsIC8vIGV4YWZsYXJlXHJcbiAgICAnRW1lcmFsZEV4IFNpZGVzY2F0aGUgMSc6ICc1NUQ0JywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAyJzogJzU1RDUnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaG90cyBGaXJlZCc6ICc1NUI3JywgLy8gcmFuayBhbmQgZmlsZSBzb2xkaWVyc1xyXG4gICAgJ0VtZXJhbGRFeCBTZWN1bmR1cyBUZXJtaW51cyBFc3QnOiAnNTVDQicsIC8vIGRyb3BwZWQgKyBhbmQgeCBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGRFeCBFeHBpcmUnOiAnNTVEMScsIC8vIGdyb3VuZCBhb2Ugb24gYm9zcyBcImdldCBvdXRcIlxyXG4gICAgJ0VtZXJhbGRFeCBBaXJlIFRhbSBTdG9ybSc6ICc1NUQwJywgLy8gZXhwYW5kaW5nIHJlZCBhbmQgYmxhY2sgZ3JvdW5kIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZEV4IERpdmlkZSBFdCBJbXBlcmEnOiAnNTVEOScsIC8vIG5vbi10YW5rIHByb3RlYW4gc3ByZWFkXHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMSc6ICc1NUM0JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMic6ICc1NUM1JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMyc6ICc1NUM2JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgNCc6ICc1NUM3JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNhc3RydW1NYXJpbnVtLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSc6ICc0RjlEJywgLy8gRW1lcmFsZCBCZWFtIGluaXRpYWwgY29uYWxcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMSc6ICc1NTM0JywgLy8gRW1lcmFsZCBCZWFtIGluc2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMic6ICc1NTM2JywgLy8gRW1lcmFsZCBCZWFtIG1pZGRsZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMyc6ICc1NTM4JywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXkgMSc6ICc1NTMyJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAyJzogJzU1MzMnLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIE1hZ25ldGljIE1pbmUgRXhwbG9zaW9uJzogJzVCMDQnLCAvLyByZXB1bHNpbmcgbWluZSBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAxJzogJzU1M0YnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMic6ICc1NTQwJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDMnOiAnNTU0MScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSA0JzogJzU1NDInLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEJpdCBTdG9ybSc6ICc1NTRBJywgLy8gXCJnZXQgaW5cIlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEVtZXJhbGQgQ3J1c2hlcic6ICc1NTNDJywgLy8gYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFB1bHNlIExhc2VyJzogJzU1NDgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEVuZXJneSBBZXRoZXJvcGxhc20nOiAnNTU1MScsIC8vIGhpdHRpbmcgYSBnbG93eSBvcmJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIEdyb3VuZCc6ICc1NTZGJywgLy8gcGFydHkgdGFyZ2V0ZWQgZ3JvdW5kIGNvbmVzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHJpbXVzIFRlcm1pbnVzIEVzdCc6ICc0QjNFJywgLy8gZ3JvdW5kIGNpcmNsZSBkdXJpbmcgYXJyb3cgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTZWN1bmR1cyBUZXJtaW51cyBFc3QnOiAnNTU2QScsIC8vIFggLyArIGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gVGVydGl1cyBUZXJtaW51cyBFc3QnOiAnNTU2RCcsIC8vIHRyaXBsZSBzd29yZHNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaG90cyBGaXJlZCc6ICc1NTVGJywgLy8gbGluZSBhb2VzIGZyb20gc29sZGllcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDEnOiAnNTU0RScsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDFcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIFAyJzogJzU1NzAnLCAvLyB0YW5rYnVzdGVyLCBwcm9iYWJseSBjbGVhdmVzLCBwaGFzZSAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIEVtZXJhbGQgQ3J1c2hlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTUzRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gR2V0dGluZyBrbm9ja2VkIGludG8gYSB3YWxsIGZyb20gdGhlIGFycm93IGhlYWRtYXJrZXIuXHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gUHJpbXVzIFRlcm1pbnVzIEVzdCBXYWxsJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTU2MycsICc1NTY0J10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0Rhcms/OiBzdHJpbmdbXTtcclxuICBoYXNCZXlvbmREZWF0aD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXNEb29tPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBIYWRlcyBFeFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTWluc3RyZWxzQmFsbGFkSGFkZXNzRWxlZ3ksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAyJzogJzQ3QUEnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAzJzogJzQ3RTQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCA0JzogJzQ3RTUnLFxyXG4gICAgLy8gRXZlcnlib2R5IHN0YWNrcyBpbiBnb29kIGZhaXRoIGZvciBCYWQgRmFpdGgsIHNvIGRvbid0IGNhbGwgaXQgYSBtaXN0YWtlLlxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDEnOiAnNDdBRCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMic6ICc0N0IwJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAzJzogJzQ3QUUnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDQnOiAnNDdBRicsXHJcbiAgICAnSGFkZXNFeCBCcm9rZW4gRmFpdGgnOiAnNDdCMicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBTcGVhcic6ICc0N0I2JyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIENoYWtyYW0nOiAnNDdCNScsXHJcbiAgICAnSGFkZXNFeCBGb3JrZWQgTGlnaHRuaW5nJzogJzQ3QzknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDEnOiAnNDdGMScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMic6ICc0N0YyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIYWRlc0V4IENvbWV0JzogJzQ3QjknLCAvLyBtaXNzZWQgdG93ZXJcclxuICAgICdIYWRlc0V4IEFuY2llbnQgRXJ1cHRpb24nOiAnNDdEMycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMSc6ICc0N0VDJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAyJzogJzQ3RUQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFN0cmVhbSc6ICc0N0VBJyxcclxuICAgICdIYWRlc0V4IERlYWQgU3BhY2UnOiAnNDdFRScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgSW5pdGlhbCc6ICc0N0E5JyxcclxuICAgICdIYWRlc0V4IFJhdmVub3VzIEFzc2F1bHQnOiAnKD86NDdBNnw0N0E3KScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZsYW1lIDEnOiAnNDdDNicsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAxJzogJzQ3QzQnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMic6ICc0N0RGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJIFRldGhlcicsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdTaGFkb3cgb2YgdGhlIEFuY2llbnRzJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRGFyayA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5oYXNEYXJrLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERhcmsgSUknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgdHlwZTogJzIyJywgaWQ6ICc0N0JBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBEb24ndCBibGFtZSBwZW9wbGUgd2hvIGRvbid0IGhhdmUgdGV0aGVycy5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5oYXNEYXJrICYmIGRhdGEuaGFzRGFyay5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCb3NzIFRldGhlcicsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6IFsnSWdleW9yaG1cXCdzIFNoYWRlJywgJ0xhaGFicmVhXFwncyBTaGFkZSddLCBpZDogJzAwMEUnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbWlzdGFrZToge1xyXG4gICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogJ0Jvc3NlcyBUb28gQ2xvc2UnLFxyXG4gICAgICAgICAgZGU6ICdCb3NzZXMgenUgTmFoZScsXHJcbiAgICAgICAgICBmcjogJ0Jvc3MgdHJvcCBwcm9jaGVzJyxcclxuICAgICAgICAgIGphOiAn44Oc44K56L+R44GZ44GO44KLJyxcclxuICAgICAgICAgIGNuOiAnQk9TU+mdoOWkqui/keS6hicsXHJcbiAgICAgICAgICBrbzogJ+yrhOuTpOydtCDrhIjrrLQg6rCA6rmM7JuAJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERlYXRoIFNocmllaycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ3Q0InLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbSBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSGFkZXMgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEeWluZ0dhc3AsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAxJzogJzQxNEInLFxyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAyJzogJzQxNEMnLFxyXG4gICAgJ0hhZGVzIERhcmsgRXJ1cHRpb24nOiAnNDE1MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFNwcmVhZCAxJzogJzQxNTYnLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMic6ICc0MTU3JyxcclxuICAgICdIYWRlcyBCcm9rZW4gRmFpdGgnOiAnNDE0RScsXHJcbiAgICAnSGFkZXMgSGVsbGJvcm4gWWF3cCc6ICc0MTZGJyxcclxuICAgICdIYWRlcyBQdXJnYXRpb24nOiAnNDE3MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFN0cmVhbSc6ICc0MTVDJyxcclxuICAgICdIYWRlcyBBZXJvJzogJzQ1OTUnLFxyXG4gICAgJ0hhZGVzIEVjaG8gMSc6ICc0MTYzJyxcclxuICAgICdIYWRlcyBFY2hvIDInOiAnNDE2NCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIYWRlcyBOZXRoZXIgQmxhc3QnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgUmF2ZW5vdXMgQXNzYXVsdCc6ICc0MTU4JyxcclxuICAgICdIYWRlcyBBbmNpZW50IERhcmtuZXNzJzogJzQ1OTMnLFxyXG4gICAgJ0hhZGVzIER1YWwgU3RyaWtlJzogJzQxNjInLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJbm5vY2VuY2UgRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vRXggRHVlbCBEZXNjZW50JzogJzNFRDInLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAxJzogJzNFRTAnLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAyJzogJzNFQ0MnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMSc6ICczRURFJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDInOiAnM0VERicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDEnOiAnM0VEMycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDInOiAnM0VENCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDMnOiAnM0VENScsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDQnOiAnM0VENicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDUnOiAnM0VGQicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDYnOiAnM0VGQycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDcnOiAnM0VGRCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDgnOiAnM0VGRScsXHJcbiAgICAnSW5ub0V4IEhvbHkgVHJpbml0eSc6ICczRURCJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAxJzogJzNFRDcnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDInOiAnM0VEOCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMyc6ICczRUQ5JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA0JzogJzNFREEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDUnOiAnM0VGRicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNic6ICczRjAwJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA3JzogJzNGMDEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDgnOiAnM0YwMicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMSc6ICczRUU2JyxcclxuICAgICdJbm5vRXggR29kIFJheSAyJzogJzNFRTcnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDMnOiAnM0VFOCcsXHJcbiAgICAnSW5ub0V4IEV4cGxvc2lvbic6ICczRUYwJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSW5ub2NlbmNlIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm8gRGF5YnJlYWsnOiAnM0U5RCcsXHJcbiAgICAnSW5ubyBIb2x5IFRyaW5pdHknOiAnM0VCMycsXHJcblxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMSc6ICczRUI2JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDInOiAnM0VCOCcsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAzJzogJzNFQ0InLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gNCc6ICczRUI3JyxcclxuXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDEnOiAnM0VCMScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDInOiAnM0VCMicsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDMnOiAnM0VGOScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDQnOiAnM0VGQScsXHJcblxyXG4gICAgJ0lubm8gR29kIFJheSAxJzogJzNFQkQnLFxyXG4gICAgJ0lubm8gR29kIFJheSAyJzogJzNFQkUnLFxyXG4gICAgJ0lubm8gR29kIFJheSAzJzogJzNFQkYnLFxyXG4gICAgJ0lubm8gR29kIFJheSA0JzogJzNFQzAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEl0J3MgaGFyZCB0byBjYXB0dXJlIHRoZSByZWZsZWN0aW9uIGFiaWxpdGllcyBmcm9tIExldmlhdGhhbidzIEhlYWQgYW5kIFRhaWwgaWYgeW91IHVzZVxyXG4vLyByYW5nZWQgcGh5c2ljYWwgYXR0YWNrcyAvIG1hZ2ljIGF0dGFja3MgcmVzcGVjdGl2ZWx5LCBhcyB0aGUgYWJpbGl0eSBuYW1lcyBhcmUgdGhlXHJcbi8vIGFiaWxpdHkgeW91IHVzZWQgYW5kIGRvbid0IGFwcGVhciB0byBzaG93IHVwIGluIHRoZSBsb2cgYXMgbm9ybWFsIFwiYWJpbGl0eVwiIGxpbmVzLlxyXG4vLyBUaGF0IHNhaWQsIGRvdHMgc3RpbGwgdGljayBpbmRlcGVuZGVudGx5IG9uIGJvdGggc28gaXQncyBsaWtlbHkgdGhhdCBwZW9wbGUgd2lsbCBhdGFja1xyXG4vLyB0aGVtIGFueXdheS5cclxuXHJcbi8vIFRPRE86IEZpZ3VyZSBvdXQgd2h5IERyZWFkIFRpZGUgLyBXYXRlcnNwb3V0IGFwcGVhciBsaWtlIHNoYXJlcyAoaS5lLiAweDE2IGlkKS5cclxuLy8gRHJlYWQgVGlkZSA9IDVDQ0EvNUNDQi81Q0NDLCBXYXRlcnNwb3V0ID0gNUNEMVxyXG5cclxuLy8gTGV2aWF0aGFuIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2hvcmxlYXRlclVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aVVuIEdyYW5kIEZhbGwnOiAnNUNERicsIC8vIHZlcnkgbGFyZ2UgY2lyY3VsYXIgYW9lIGJlZm9yZSBzcGlubnkgZGl2ZXMsIGFwcGxpZXMgaGVhdnlcclxuICAgICdMZXZpVW4gSHlkcm9zaG90JzogJzVDRDUnLCAvLyBXYXZlc3BpbmUgU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBEcm9wc3kgZWZmZWN0XHJcbiAgICAnTGV2aVVuIERyZWFkc3Rvcm0nOiAnNUNENicsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlVbiBCb2R5IFNsYW0nOiAnNUNEMicsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMSc6ICc1Q0RCJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDInOiAnNUNFMycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAzJzogJzVDRTgnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgNCc6ICc1Q0U5JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnTGV2aVVuIERyb3BzeSc6ICcxMTAnLCAvLyBzdGFuZGluZyBpbiB0aGUgaHlkcm8gc2hvdCBmcm9tIHRoZSBXYXZlc3BpbmUgU2FoYWdpblxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTGV2aVVuIEh5c3RlcmlhJzogJzEyOCcsIC8vIHN0YW5kaW5nIGluIHRoZSBkcmVhZHN0b3JtIGZyb20gdGhlIFdhdmV0b290aCBTYWhhZ2luXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0xldmlVbiBCb2R5IFNsYW0gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVDRDInIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogdGFraW5nIHR3byBkaWZmZXJlbnQgSGlnaC1Qb3dlcmVkIEhvbWluZyBMYXNlcnMgKDRBRDgpXHJcbi8vIFRPRE86IGNvdWxkIGJsYW1lIHRoZSB0ZXRoZXJlZCBwbGF5ZXIgZm9yIFdoaXRlIEFnb255IC8gV2hpdGUgRnVyeSBmYWlsdXJlcz9cclxuXHJcbi8vIFJ1YnkgV2VhcG9uIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNpbmRlckRyaWZ0RXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgQml0IE1hZ2l0ZWsgUmF5JzogJzRBRDInLCAvLyBsaW5lIGFvZXMgZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QUQzJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJGJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDMnOiAnNEQwNCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNCc6ICc0RDA1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA1JzogJzRBQ0QnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDYnOiAnNEFDRScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggVW5kZXJtaW5lJzogJzRBRDAnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieUV4IFJ1YnkgUmF5JzogJzRCMDInLCAvLyBmcm9udGFsIGxhc2VyXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxJzogJzRBRDknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDInOiAnNEFEQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMyc6ICc0QUREJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA0JzogJzRBREUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDUnOiAnNEFERicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNic6ICc0QUUwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA3JzogJzRBRTEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDgnOiAnNEFFMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgOSc6ICc0QUUzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMCc6ICc0QUU0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMSc6ICc0QUU1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMic6ICc0QUU2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMyc6ICc0QUU3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNCc6ICc0QUU4JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNSc6ICc0QUU5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNic6ICc0QUVBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNyc6ICc0RTZCJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOCc6ICc0RTZDJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOSc6ICc0RTZEJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMCc6ICc0RTZFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMSc6ICc0RTZGJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMic6ICc0RTcwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDEnOiAnNEIwNScsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMic6ICc0QjA2JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAzJzogJzRCMDcnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDQnOiAnNEIwOCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gNSc6ICc0RE9EJywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBNZXRlb3IgQnVyc3QnOiAnNEFGMicsIC8vIG1ldGVvciBleHBsb2RpbmdcclxuICAgICdSdWJ5RXggQnJhZGFtYW50ZSc6ICc0RTM4JywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICAgICdSdWJ5RXggQ29tZXQgSGVhdnkgSW1wYWN0JzogJzRBRjYnLCAvLyBsZXR0aW5nIGEgdGFuayBjb21ldCBsYW5kXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgU3BoZXJlIEJ1cnN0JzogJzRBQ0InLCAvLyBleHBsb2RpbmcgdGhlIHJlZCBtaW5lXHJcbiAgICAnUnVieUV4IEx1bmFyIER5bmFtbyc6ICc0RUIwJywgLy8gXCJnZXQgaW5cIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSXJvbiBDaGFyaW90JzogJzRFQjEnLCAvLyBcImdldCBvdXRcIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSGVhcnQgSW4gVGhlIE1hY2hpbmUnOiAnNEFGQScsIC8vIFdoaXRlIEFnb255L0Z1cnkgc2t1bGwgaGl0dGluZyBwbGF5ZXJzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdSdWJ5RXggSHlzdGVyaWEnOiAnMTI4JywgLy8gTmVnYXRpdmUgQXVyYSBsb29rYXdheSBmYWlsdXJlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdSdWJ5RXggSG9taW5nIExhc2Vycyc6ICc0QUQ2JywgLy8gc3ByZWFkIG1hcmtlcnMgZHVyaW5nIGN1dCBhbmQgcnVuXHJcbiAgICAnUnVieUV4IE1ldGVvciBTdHJlYW0nOiAnNEU2OCcsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBQMlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdSdWJ5RXggU2NyZWVjaCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEFFRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBSdWJ5IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2luZGVyRHJpZnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnkgUmF2ZW5zY2xhdyc6ICc0QTkzJywgLy8gY2VudGVyZWQgY2lyY2xlIGFvZSBmb3IgcmF2ZW5zY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QTlBJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRScsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMyc6ICc0QTk0JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNCc6ICc0QTk1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNSc6ICc0RDAyJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNic6ICc0RDAzJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgUnVieSBSYXknOiAnNEFDNicsIC8vIGZyb250YWwgbGFzZXJcclxuICAgICdSdWJ5IFVuZGVybWluZSc6ICc0QTk3JywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEnOiAnNEU2OScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDInOiAnNEU2QScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDMnOiAnNEFBMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDQnOiAnNEFBMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDUnOiAnNEFBMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDYnOiAnNEFBNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDcnOiAnNEFBNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDgnOiAnNEFBNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDknOiAnNEFBNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEwJzogJzRDMjEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxMSc6ICc0QzJBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBDb21ldCBCdXJzdCc6ICc0QUI0JywgLy8gbWV0ZW9yIGV4cGxvZGluZ1xyXG4gICAgJ1J1YnkgQnJhZGFtYW50ZSc6ICc0QUJDJywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1J1YnkgSG9taW5nIExhc2VyJzogJzRBQzUnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMVxyXG4gICAgJ1J1YnkgTWV0ZW9yIFN0cmVhbSc6ICc0RTY3JywgLy8gc3ByZWFkIG1hcmtlcnMgaW4gUDJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGl2YSBVbnJlYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnNTM3QicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnNTM3NicsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJzUzNzUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICc1Mzc4JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnNTM2RicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICc1Mzc5JyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFuayBidXN0ZXIuXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICc1MzczJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDUzN0Egb24geW91LCBidXQgaXQgaGFzIGFuIHVua25vd24gbmFtZS5cclxuICAgICAgLy8gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEYW5jaW5nUGxhZ3VlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhIFdvb2RcXCdzIEVtYnJhY2UnOiAnM0Q1MCcsXHJcbiAgICAvLyAnVGl0YW5pYSBGcm9zdCBSdW5lJzogJzNENEUnLFxyXG4gICAgJ1RpdGFuaWEgR2VudGxlIEJyZWV6ZSc6ICczRjgzJyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAxJzogJzNENTUnLFxyXG4gICAgJ1RpdGFuaWEgUHVja1xcJ3MgUmVidWtlJzogJzNENTgnLFxyXG4gICAgJ1RpdGFuaWEgTGVhZnN0b3JtIDInOiAnM0UwMycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMSc6ICczRDVEJyxcclxuICAgICdUaXRhbmlhIFBoYW50b20gUnVuZSAyJzogJzNENUUnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5pYSBEaXZpbmF0aW9uIFJ1bmUnOiAnM0Q1QicsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEYW5jaW5nUGxhZ3VlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYUV4IFdvb2RcXCdzIEVtYnJhY2UnOiAnM0QyRicsXHJcbiAgICAvLyAnVGl0YW5pYUV4IEZyb3N0IFJ1bmUnOiAnM0QyQicsXHJcbiAgICAnVGl0YW5pYUV4IEdlbnRsZSBCcmVlemUnOiAnM0Y4MicsXHJcbiAgICAnVGl0YW5pYUV4IExlYWZzdG9ybSAxJzogJzNEMzknLFxyXG4gICAgJ1RpdGFuaWFFeCBQdWNrXFwncyBSZWJ1a2UnOiAnM0Q0MycsXHJcbiAgICAnVGl0YW5pYUV4IFdhbGxvcCc6ICczRDNCJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDInOiAnM0Q0OScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAxJzogJzNENEMnLFxyXG4gICAgJ1RpdGFuaWFFeCBQaGFudG9tIFJ1bmUgMic6ICczRDREJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVE9ETzogVGhpcyBjb3VsZCBtYXliZSBibGFtZSB0aGUgcGVyc29uIHdpdGggdGhlIHRldGhlcj9cclxuICAgICdUaXRhbmlhRXggVGh1bmRlciBSdW5lJzogJzNEMjknLFxyXG4gICAgJ1RpdGFuaWFFeCBEaXZpbmF0aW9uIFJ1bmUnOiAnM0Q0QScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU4RkUnLFxyXG4gICAgJ1RpdGFuVW4gQnVyc3QnOiAnNUFERicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBMYW5kc2xpZGUnOiAnNUFEQycsXHJcbiAgICAnVGl0YW5VbiBHYW9sZXIgTGFuZHNsaWRlJzogJzU5MDInLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBSb2NrIEJ1c3Rlcic6ICc1OEY2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTW91bnRhaW4gQnVzdGVyJzogJzU4RjcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NZW1vcmlhTWlzZXJhRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAxJzogJzRDRDInLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMic6ICc0Q0QzJyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDMnOiAnNENENCcsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA0JzogJzRDRDUnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgNSc6ICc0Q0Q2JyxcclxuICAgICdWYXJpc0V4IElnbmlzIEVzdCAxJzogJzRDQjUnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDInOiAnNENDNScsXHJcbiAgICAnVmFyaXNFeCBWZW50dXMgRXN0IDEnOiAnNENDNycsXHJcbiAgICAnVmFyaXNFeCBWZW50dXMgRXN0IDInOiAnNENDOCcsXHJcbiAgICAnVmFyaXNFeCBBc3NhdWx0IENhbm5vbic6ICc0Q0U1JyxcclxuICAgICdWYXJpc0V4IEZvcnRpdXMgUm90YXRpbmcnOiAnNENFOScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyBEb24ndCBoaXQgdGhlIHNoaWVsZHMhXHJcbiAgICAnVmFyaXNFeCBSZXBheSc6ICc0Q0REJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gVGhpcyBpcyB0aGUgXCJwcm90ZWFuXCIgZm9ydGl1cy5cclxuICAgICdWYXJpc0V4IEZvcnRpdXMgUHJvdGVhbic6ICc0Q0U3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1ZhcmlzRXggTWFnaXRlayBCdXJzdCc6ICc0Q0RGJyxcclxuICAgICdWYXJpc0V4IEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzRDRUQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdWYXJpc0V4IFRlcm1pbnVzIEVzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRDQjQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBSYWRpYW50IEJyYXZlciBpcyA0RjE2LzRGMTcoeDIpLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IERlc3BlcmFkbyBpcyA0RjE4LzRGMTksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgTWV0ZW9yIGlzIDRGMUEsIGFuZCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBtb3JlIHRoYW4gMT9cclxuLy8gVE9ETzogbWlzc2luZyBhIHRvd2VyP1xyXG5cclxuLy8gTm90ZTogRGVsaWJlcmF0ZWx5IG5vdCBpbmNsdWRpbmcgcHlyZXRpYyBkYW1hZ2UgYXMgYW4gZXJyb3IuXHJcbi8vIE5vdGU6IEl0IGRvZXNuJ3QgYXBwZWFyIHRoYXQgdGhlcmUncyBhbnkgd2F5IHRvIHRlbGwgd2hvIGZhaWxlZCB0aGUgY3V0c2NlbmUuXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdXT0wgU29sZW1uIENvbmZpdGVvcic6ICc0RjJBJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIEluJzogJzRGMTAnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTCBDb3J1c2NhbnQgU2FiZXIgT3V0JzogJzRGMTEnLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0QicsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEMnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTCBTaGluaW5nIFdhdmUnOiAnNEYyNicsIC8vIHN3b3JkIHRyaWFuZ2xlXHJcbiAgICAnV09MIENhdXRlcml6ZSc6ICc0RjI1JyxcclxuICAgICdXT0wgQnJpbXN0b25lIEVhcnRoIDEnOiAnNEYxRScsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGluaXRpYWxcclxuICAgICdXT0wgQnJpbXN0b25lIEVhcnRoIDInOiAnNEYxRicsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICAgICdXT0wgRmxhcmUgQnJlYXRoJzogJzRGMjQnLFxyXG4gICAgJ1dPTCBEZWNpbWF0aW9uJzogJzRGMjMnLFxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV09MIERlZXAgRnJlZXplJzogJzRFNicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEVGNy80RUY4KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEVGOS80RUZBLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RUZDLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IEFic29sdXRlIEhvbHkgc2hvdWxkIGJlIHNoYXJlZD9cclxuLy8gVE9ETzogaW50ZXJzZWN0aW5nIGJyaW1zdG9uZXM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MRXggU29sZW1uIENvbmZpdGVvcic6ICc0RjBDJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0xFeCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEVGMicsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RUYxJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MRXggSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0OScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QScsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggU2hpbmluZyBXYXZlJzogJzRGMDgnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTEV4IENhdXRlcml6ZSc6ICc0RjA3JyxcclxuICAgICdXT0xFeCBCcmltc3RvbmUgRWFydGgnOiAnNEYwMCcsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTEV4IERlZXAgRnJlZXplJzogJzRFNicsIC8vIGZhaWxpbmcgQWJzb2x1dGUgQmxpenphcmQgSUlJXHJcbiAgICAnV09MRXggRGFtYWdlIERvd24nOiAnMjc0JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBGbGFzaFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV09MRXggQWJzb2x1dGUgU3RvbmUgSUlJJzogJzRFRUInLCAvLyBwcm90ZWFuIHdhdmUgaW1idWVkIG1hZ2ljXHJcbiAgICAnV09MRXggRmxhcmUgQnJlYXRoJzogJzRGMDYnLCAvLyB0ZXRoZXIgZnJvbSBzdW1tb25lZCBiYWhhbXV0c1xyXG4gICAgJ1dPTEV4IFBlcmZlY3QgRGVjaW1hdGlvbic6ICc0RjA1JywgLy8gc21uL3dhciBwaGFzZSBtYXJrZXJcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnV29sRXggS2F0b24gU2FuIFNoYXJlJzogJzRFRkUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4RkYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVG93ZXInLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRGMDQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbWlzdGFrZToge1xyXG4gICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogJ01pc3NlZCBUb3dlcicsXHJcbiAgICAgICAgICBkZTogJ1R1cm0gdmVycGFzc3QnLFxyXG4gICAgICAgICAgZnI6ICdUb3VyIG1hbnF1w6llJyxcclxuICAgICAgICAgIGphOiAn5aGU44KS6LiP44G+44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgIGNuOiAn5rKh6Lip5aGUJyxcclxuICAgICAgICAgIGtvOiAn7J6l7YyQIOyLpOyImCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBIYWxsb3dlZCBHcm91bmQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRGNDQnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gRm9yIEJlcnNlcmsgYW5kIERlZXAgRGFya3NpZGVcclxuICAgICAgaWQ6ICdXT0xFeCBNaXNzZWQgSW50ZXJydXB0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTE1NicsICc1MTU4J10gfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNUaHJvdHRsZT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBqYWdkVGV0aGVyPzogeyBbc291cmNlSWQ6IHN0cmluZ106IHN0cmluZyB9O1xyXG59XHJcblxyXG4vLyBUT0RPOiBGSVggbHVtaW5vdXMgYWV0aGVyb3BsYXNtIHdhcm5pbmcgbm90IHdvcmtpbmdcclxuLy8gVE9ETzogRklYIGRvbGwgZGVhdGggbm90IHdvcmtpbmdcclxuLy8gVE9ETzogZmFpbGluZyBoYW5kIG9mIHBhaW4vcGFydGluZyAoY2hlY2sgZm9yIGhpZ2ggZGFtYWdlPylcclxuLy8gVE9ETzogbWFrZSBzdXJlIGV2ZXJ5Ym9keSB0YWtlcyBleGFjdGx5IG9uZSBwcm90ZWFuIChyYXRoZXIgdGhhbiB3YXRjaGluZyBkb3VibGUgaGl0cylcclxuLy8gVE9ETzogdGh1bmRlciBub3QgaGl0dGluZyBleGFjdGx5IDI/XHJcbi8vIFRPRE86IHBlcnNvbiB3aXRoIHdhdGVyL3RodW5kZXIgZGVidWZmIGR5aW5nXHJcbi8vIFRPRE86IGJhZCBuaXNpIHBhc3NcclxuLy8gVE9ETzogZmFpbGVkIGdhdmVsIG1lY2hhbmljXHJcbi8vIFRPRE86IGRvdWJsZSByb2NrZXQgcHVuY2ggbm90IGhpdHRpbmcgZXhhY3RseSAyPyAob3IgdGFua3MpXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHNsdWRnZSBwdWRkbGVzIGJlZm9yZSBoaWRkZW4gbWluZT9cclxuLy8gVE9ETzogaGlkZGVuIG1pbmUgZmFpbHVyZT9cclxuLy8gVE9ETzogZmFpbHVyZXMgb2Ygb3JkYWluZWQgbW90aW9uIC8gc3RpbGxuZXNzXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzZXZlcml0eSAodGV0aGVycylcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNvbGlkYXJpdHkgKHNoYXJlZCBzZW50ZW5jZSlcclxuLy8gVE9ETzogb3JkYWluZWQgY2FwaXRhbCBwdW5pc2htZW50IGhpdHRpbmcgbm9uLXRhbmtzXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRXBpY09mQWxleGFuZGVyVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RFQSBTbHVpY2UnOiAnNDlCMScsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAxJzogJzQ4MjQnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMic6ICc0OUI1JyxcclxuICAgICdURUEgU3BpbiBDcnVzaGVyJzogJzRBNzInLFxyXG4gICAgJ1RFQSBTYWNyYW1lbnQnOiAnNDg1RicsXHJcbiAgICAnVEVBIFJhZGlhbnQgU2FjcmFtZW50JzogJzQ4ODYnLFxyXG4gICAgJ1RFQSBBbG1pZ2h0eSBKdWRnbWVudCc6ICc0ODkwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdURUEgSGF3ayBCbGFzdGVyJzogJzQ4MzAnLFxyXG4gICAgJ1RFQSBDaGFrcmFtJzogJzQ4NTUnLFxyXG4gICAgJ1RFQSBFbnVtZXJhdGlvbic6ICc0ODUwJyxcclxuICAgICdURUEgQXBvY2FseXB0aWMgUmF5JzogJzQ4NEMnLFxyXG4gICAgJ1RFQSBQcm9wZWxsZXIgV2luZCc6ICc0ODMyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDEnOiAnNDlCNicsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMic6ICc0ODI1JyxcclxuICAgICdURUEgRmx1aWQgU3dpbmcnOiAnNDlCMCcsXHJcbiAgICAnVEVBIEZsdWlkIFN0cmlrZSc6ICc0OUI3JyxcclxuICAgICdURUEgSGlkZGVuIE1pbmUnOiAnNDg1MicsXHJcbiAgICAnVEVBIEFscGhhIFN3b3JkJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBGbGFyZXRocm93ZXInOiAnNDg2QicsXHJcbiAgICAnVEVBIENoYXN0ZW5pbmcgSGVhdCc6ICc0QTgwJyxcclxuICAgICdURUEgRGl2aW5lIFNwZWFyJzogJzRBODInLFxyXG4gICAgJ1RFQSBPcmRhaW5lZCBQdW5pc2htZW50JzogJzQ4OTEnLFxyXG4gICAgLy8gT3B0aWNhbCBTcHJlYWRcclxuICAgICdURUEgSW5kaXZpZHVhbCBSZXByb2JhdGlvbic6ICc0ODhDJyxcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAvLyBPcHRpY2FsIFN0YWNrXHJcbiAgICAnVEVBIENvbGxlY3RpdmUgUmVwcm9iYXRpb24nOiAnNDg4RCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBcInRvbyBtdWNoIGx1bWlub3VzIGFldGhlcm9wbGFzbVwiXHJcbiAgICAgIC8vIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgdGFyZ2V0IGV4cGxvZGVzLCBoaXR0aW5nIG5lYXJieSBwZW9wbGVcclxuICAgICAgLy8gYnV0IGFsc28gdGhlbXNlbHZlcy5cclxuICAgICAgaWQ6ICdURUEgRXhoYXVzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MUYnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnRhcmdldCA9PT0gbWF0Y2hlcy5zb3VyY2UsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnbHVtaW5vdXMgYWV0aGVyb3BsYXNtJyxcclxuICAgICAgICAgICAgZGU6ICdMdW1pbmlzemVudGVzIMOEdGhlcm9wbGFzbWEnLFxyXG4gICAgICAgICAgICBmcjogJ8OJdGjDqXJvcGxhc21hIGx1bWluZXV4JyxcclxuICAgICAgICAgICAgamE6ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgICBjbjogJ+WFieaAp+eIhumbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBEcm9wc3knLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTIxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUZXRoZXIgVHJhY2tpbmcnLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnSmFnZCBEb2xsJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlciA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5qYWdkVGV0aGVyW21hdGNoZXMuc291cmNlSWRdID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBSZWR1Y2libGUgQ29tcGxleGl0eScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIHVuZGVmaW5lZCwgd2hpY2ggaXMgZmluZS5cclxuICAgICAgICAgIG5hbWU6IGRhdGEuamFnZFRldGhlciA/IGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdEb2xsIERlYXRoJyxcclxuICAgICAgICAgICAgZGU6ICdQdXBwZSBUb3QnLFxyXG4gICAgICAgICAgICBmcjogJ1BvdXDDqWUgbW9ydGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODieODvOODq+OBjOatu+OCk+OBoCcsXHJcbiAgICAgICAgICAgIGNuOiAn5rWu5aOr5b635q275LqhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIERyYWluYWdlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyNycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEucGFydHkuaXNUYW5rKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZSBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZSBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNUaHJvdHRsZSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEJhbGxvb24gUG9wcGluZy4gIEl0IHNlZW1zIGxpa2UgdGhlIHBlcnNvbiB3aG8gcG9wcyBpdCBpcyB0aGVcclxuICAgICAgLy8gZmlyc3QgcGVyc29uIGxpc3RlZCBkYW1hZ2Utd2lzZSwgc28gdGhleSBhcmUgbGlrZWx5IHRoZSBjdWxwcml0LlxyXG4gICAgICBpZDogJ1RFQSBPdXRidXJzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuc291cmNlIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgZmlsZTAgZnJvbSAnLi8wMC1taXNjL2J1ZmZzLnRzJztcbmltcG9ydCBmaWxlMSBmcm9tICcuLzAwLW1pc2MvZ2VuZXJhbC50cyc7XG5pbXBvcnQgZmlsZTIgZnJvbSAnLi8wMC1taXNjL3Rlc3QudHMnO1xuaW1wb3J0IGZpbGUzIGZyb20gJy4vMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzJztcbmltcG9ydCBmaWxlNCBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyc7XG5pbXBvcnQgZmlsZTUgZnJvbSAnLi8wMi1hcnIvdHJpYWwvbGV2aS1leC50cyc7XG5pbXBvcnQgZmlsZTYgZnJvbSAnLi8wMi1hcnIvdHJpYWwvc2hpdmEtaG0udHMnO1xuaW1wb3J0IGZpbGU3IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWV4LnRzJztcbmltcG9ydCBmaWxlOCBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1obS50cyc7XG5pbXBvcnQgZmlsZTkgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMnO1xuaW1wb3J0IGZpbGUxMCBmcm9tICcuLzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS50cyc7XG5pbXBvcnQgZmlsZTExIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9hZXRoZXJvY2hlbWljYWxfcmVzZWFyY2hfZmFjaWxpdHkudHMnO1xuaW1wb3J0IGZpbGUxMiBmcm9tICcuLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMnO1xuaW1wb3J0IGZpbGUxMyBmcm9tICcuLzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLnRzJztcbmltcG9ydCBmaWxlMTQgZnJvbSAnLi8wMy1ody9kdW5nZW9uL3NvaG1fYWxfaGFyZC50cyc7XG5pbXBvcnQgZmlsZTE1IGZyb20gJy4vMDMtaHcvcmFpZC9hMTJuLnRzJztcbmltcG9ydCBmaWxlMTYgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2FsYV9taGlnby50cyc7XG5pbXBvcnQgZmlsZTE3IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS50cyc7XG5pbXBvcnQgZmlsZTE4IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLnRzJztcbmltcG9ydCBmaWxlMTkgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N0X21vY2lhbm5lX2hhcmQudHMnO1xuaW1wb3J0IGZpbGUyMCBmcm9tICcuLzA0LXNiL2R1bmdlb24vc3dhbGxvd3NfY29tcGFzcy50cyc7XG5pbXBvcnQgZmlsZTIxIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMnO1xuaW1wb3J0IGZpbGUyMiBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGhlX2J1cm4udHMnO1xuaW1wb3J0IGZpbGUyMyBmcm9tICcuLzA0LXNiL3JhaWQvbzFuLnRzJztcbmltcG9ydCBmaWxlMjQgZnJvbSAnLi8wNC1zYi9yYWlkL28ybi50cyc7XG5pbXBvcnQgZmlsZTI1IGZyb20gJy4vMDQtc2IvcmFpZC9vM24udHMnO1xuaW1wb3J0IGZpbGUyNiBmcm9tICcuLzA0LXNiL3JhaWQvbzRuLnRzJztcbmltcG9ydCBmaWxlMjcgZnJvbSAnLi8wNC1zYi9yYWlkL280cy50cyc7XG5pbXBvcnQgZmlsZTI4IGZyb20gJy4vMDQtc2IvcmFpZC9vN3MudHMnO1xuaW1wb3J0IGZpbGUyOSBmcm9tICcuLzA0LXNiL3JhaWQvbzEycy50cyc7XG5pbXBvcnQgZmlsZTMwIGZyb20gJy4vMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzJztcbmltcG9ydCBmaWxlMzEgZnJvbSAnLi8wNC1zYi90cmlhbC9zaGlucnl1LnRzJztcbmltcG9ydCBmaWxlMzIgZnJvbSAnLi8wNC1zYi90cmlhbC9zdXNhbm8tZXgudHMnO1xuaW1wb3J0IGZpbGUzMyBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUudHMnO1xuaW1wb3J0IGZpbGUzNCBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUudHMnO1xuaW1wb3J0IGZpbGUzNSBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkudHMnO1xuaW1wb3J0IGZpbGUzNiBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMnO1xuaW1wb3J0IGZpbGUzNyBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC50cyc7XG5pbXBvcnQgZmlsZTM4IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTM5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyc7XG5pbXBvcnQgZmlsZTQwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTQxIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLnRzJztcbmltcG9ydCBmaWxlNDIgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQudHMnO1xuaW1wb3J0IGZpbGU0MyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLnRzJztcbmltcG9ydCBmaWxlNDQgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLnRzJztcbmltcG9ydCBmaWxlNDUgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyc7XG5pbXBvcnQgZmlsZTQ2IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy50cyc7XG5pbXBvcnQgZmlsZTQ3IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4udHMnO1xuaW1wb3J0IGZpbGU0OCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyc7XG5pbXBvcnQgZmlsZTQ5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy50cyc7XG5pbXBvcnQgZmlsZTUwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcudHMnO1xuaW1wb3J0IGZpbGU1MSBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS50cyc7XG5pbXBvcnQgZmlsZTUyIGZyb20gJy4vMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS50cyc7XG5pbXBvcnQgZmlsZTUzIGZyb20gJy4vMDUtc2hiL3JhaWQvZTFuLnRzJztcbmltcG9ydCBmaWxlNTQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMXMudHMnO1xuaW1wb3J0IGZpbGU1NSBmcm9tICcuLzA1LXNoYi9yYWlkL2Uybi50cyc7XG5pbXBvcnQgZmlsZTU2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTJzLnRzJztcbmltcG9ydCBmaWxlNTcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lM24udHMnO1xuaW1wb3J0IGZpbGU1OCBmcm9tICcuLzA1LXNoYi9yYWlkL2Uzcy50cyc7XG5pbXBvcnQgZmlsZTU5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTRuLnRzJztcbmltcG9ydCBmaWxlNjAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNHMudHMnO1xuaW1wb3J0IGZpbGU2MSBmcm9tICcuLzA1LXNoYi9yYWlkL2U1bi50cyc7XG5pbXBvcnQgZmlsZTYyIGZyb20gJy4vMDUtc2hiL3JhaWQvZTVzLnRzJztcbmltcG9ydCBmaWxlNjMgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNm4udHMnO1xuaW1wb3J0IGZpbGU2NCBmcm9tICcuLzA1LXNoYi9yYWlkL2U2cy50cyc7XG5pbXBvcnQgZmlsZTY1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTduLnRzJztcbmltcG9ydCBmaWxlNjYgZnJvbSAnLi8wNS1zaGIvcmFpZC9lN3MudHMnO1xuaW1wb3J0IGZpbGU2NyBmcm9tICcuLzA1LXNoYi9yYWlkL2U4bi50cyc7XG5pbXBvcnQgZmlsZTY4IGZyb20gJy4vMDUtc2hiL3JhaWQvZThzLnRzJztcbmltcG9ydCBmaWxlNjkgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOW4udHMnO1xuaW1wb3J0IGZpbGU3MCBmcm9tICcuLzA1LXNoYi9yYWlkL2U5cy50cyc7XG5pbXBvcnQgZmlsZTcxIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwbi50cyc7XG5pbXBvcnQgZmlsZTcyIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwcy50cyc7XG5pbXBvcnQgZmlsZTczIGZyb20gJy4vMDUtc2hiL3JhaWQvZTExbi50cyc7XG5pbXBvcnQgZmlsZTc0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExcy50cyc7XG5pbXBvcnQgZmlsZTc1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEybi50cyc7XG5pbXBvcnQgZmlsZTc2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEycy50cyc7XG5pbXBvcnQgZmlsZTc3IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LnRzJztcbmltcG9ydCBmaWxlNzggZnJvbSAnLi8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24udHMnO1xuaW1wb3J0IGZpbGU3OSBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTgwIGZyb20gJy4vMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlODEgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMtZXgudHMnO1xuaW1wb3J0IGZpbGU4MiBmcm9tICcuLzA1LXNoYi90cmlhbC9oYWRlcy50cyc7XG5pbXBvcnQgZmlsZTgzIGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC50cyc7XG5pbXBvcnQgZmlsZTg0IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyc7XG5pbXBvcnQgZmlsZTg1IGZyb20gJy4vMDUtc2hiL3RyaWFsL2xldmktdW4udHMnO1xuaW1wb3J0IGZpbGU4NiBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTg3IGZyb20gJy4vMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlODggZnJvbSAnLi8wNS1zaGIvdHJpYWwvc2hpdmEtdW4udHMnO1xuaW1wb3J0IGZpbGU4OSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLnRzJztcbmltcG9ydCBmaWxlOTAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyc7XG5pbXBvcnQgZmlsZTkxIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzJztcbmltcG9ydCBmaWxlOTIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdmFyaXMtZXgudHMnO1xuaW1wb3J0IGZpbGU5MyBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wudHMnO1xuaW1wb3J0IGZpbGU5NCBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wtZXgudHMnO1xuaW1wb3J0IGZpbGU5NSBmcm9tICcuLzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIudHMnO1xuXG5leHBvcnQgZGVmYXVsdCB7JzAwLW1pc2MvYnVmZnMudHMnOiBmaWxlMCwnMDAtbWlzYy9nZW5lcmFsLnRzJzogZmlsZTEsJzAwLW1pc2MvdGVzdC50cyc6IGZpbGUyLCcwMi1hcnIvdHJpYWwvaWZyaXQtbm0udHMnOiBmaWxlMywnMDItYXJyL3RyaWFsL3RpdGFuLW5tLnRzJzogZmlsZTQsJzAyLWFyci90cmlhbC9sZXZpLWV4LnRzJzogZmlsZTUsJzAyLWFyci90cmlhbC9zaGl2YS1obS50cyc6IGZpbGU2LCcwMi1hcnIvdHJpYWwvc2hpdmEtZXgudHMnOiBmaWxlNywnMDItYXJyL3RyaWFsL3RpdGFuLWhtLnRzJzogZmlsZTgsJzAyLWFyci90cmlhbC90aXRhbi1leC50cyc6IGZpbGU5LCcwMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkudHMnOiBmaWxlMTAsJzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LnRzJzogZmlsZTExLCcwMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLnRzJzogZmlsZTEyLCcwMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC50cyc6IGZpbGUxMywnMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQudHMnOiBmaWxlMTQsJzAzLWh3L3JhaWQvYTEybi50cyc6IGZpbGUxNSwnMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28udHMnOiBmaWxlMTYsJzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMnOiBmaWxlMTcsJzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS50cyc6IGZpbGUxOCwnMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJzogZmlsZTE5LCcwNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMnOiBmaWxlMjAsJzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJzogZmlsZTIxLCcwNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJzogZmlsZTIyLCcwNC1zYi9yYWlkL28xbi50cyc6IGZpbGUyMywnMDQtc2IvcmFpZC9vMm4udHMnOiBmaWxlMjQsJzA0LXNiL3JhaWQvbzNuLnRzJzogZmlsZTI1LCcwNC1zYi9yYWlkL280bi50cyc6IGZpbGUyNiwnMDQtc2IvcmFpZC9vNHMudHMnOiBmaWxlMjcsJzA0LXNiL3JhaWQvbzdzLnRzJzogZmlsZTI4LCcwNC1zYi9yYWlkL28xMnMudHMnOiBmaWxlMjksJzA0LXNiL3RyaWFsL2J5YWtrby1leC50cyc6IGZpbGUzMCwnMDQtc2IvdHJpYWwvc2hpbnJ5dS50cyc6IGZpbGUzMSwnMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzJzogZmlsZTMyLCcwNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLnRzJzogZmlsZTMzLCcwNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLnRzJzogZmlsZTM0LCcwNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzJzogZmlsZTM1LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzJzogZmlsZTM2LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2gudHMnOiBmaWxlMzcsJzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMnOiBmaWxlMzgsJzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMnOiBmaWxlMzksJzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIudHMnOiBmaWxlNDAsJzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy50cyc6IGZpbGU0MSwnMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LnRzJzogZmlsZTQyLCcwNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC50cyc6IGZpbGU0MywnMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyc6IGZpbGU0NCwnMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMnOiBmaWxlNDUsJzA1LXNoYi9kdW5nZW9uL210X2d1bGcudHMnOiBmaWxlNDYsJzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzJzogZmlsZTQ3LCcwNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMnOiBmaWxlNDgsJzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MudHMnOiBmaWxlNDksJzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzJzogZmlsZTUwLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUudHMnOiBmaWxlNTEsJzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UudHMnOiBmaWxlNTIsJzA1LXNoYi9yYWlkL2Uxbi50cyc6IGZpbGU1MywnMDUtc2hiL3JhaWQvZTFzLnRzJzogZmlsZTU0LCcwNS1zaGIvcmFpZC9lMm4udHMnOiBmaWxlNTUsJzA1LXNoYi9yYWlkL2Uycy50cyc6IGZpbGU1NiwnMDUtc2hiL3JhaWQvZTNuLnRzJzogZmlsZTU3LCcwNS1zaGIvcmFpZC9lM3MudHMnOiBmaWxlNTgsJzA1LXNoYi9yYWlkL2U0bi50cyc6IGZpbGU1OSwnMDUtc2hiL3JhaWQvZTRzLnRzJzogZmlsZTYwLCcwNS1zaGIvcmFpZC9lNW4udHMnOiBmaWxlNjEsJzA1LXNoYi9yYWlkL2U1cy50cyc6IGZpbGU2MiwnMDUtc2hiL3JhaWQvZTZuLnRzJzogZmlsZTYzLCcwNS1zaGIvcmFpZC9lNnMudHMnOiBmaWxlNjQsJzA1LXNoYi9yYWlkL2U3bi50cyc6IGZpbGU2NSwnMDUtc2hiL3JhaWQvZTdzLnRzJzogZmlsZTY2LCcwNS1zaGIvcmFpZC9lOG4udHMnOiBmaWxlNjcsJzA1LXNoYi9yYWlkL2U4cy50cyc6IGZpbGU2OCwnMDUtc2hiL3JhaWQvZTluLnRzJzogZmlsZTY5LCcwNS1zaGIvcmFpZC9lOXMudHMnOiBmaWxlNzAsJzA1LXNoYi9yYWlkL2UxMG4udHMnOiBmaWxlNzEsJzA1LXNoYi9yYWlkL2UxMHMudHMnOiBmaWxlNzIsJzA1LXNoYi9yYWlkL2UxMW4udHMnOiBmaWxlNzMsJzA1LXNoYi9yYWlkL2UxMXMudHMnOiBmaWxlNzQsJzA1LXNoYi9yYWlkL2UxMm4udHMnOiBmaWxlNzUsJzA1LXNoYi9yYWlkL2UxMnMudHMnOiBmaWxlNzYsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC50cyc6IGZpbGU3NywnMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLnRzJzogZmlsZTc4LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXgudHMnOiBmaWxlNzksJzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi50cyc6IGZpbGU4MCwnMDUtc2hiL3RyaWFsL2hhZGVzLWV4LnRzJzogZmlsZTgxLCcwNS1zaGIvdHJpYWwvaGFkZXMudHMnOiBmaWxlODIsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMnOiBmaWxlODMsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMnOiBmaWxlODQsJzA1LXNoYi90cmlhbC9sZXZpLXVuLnRzJzogZmlsZTg1LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMnOiBmaWxlODYsJzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyc6IGZpbGU4NywnMDUtc2hiL3RyaWFsL3NoaXZhLXVuLnRzJzogZmlsZTg4LCcwNS1zaGIvdHJpYWwvdGl0YW5pYS50cyc6IGZpbGU4OSwnMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXgudHMnOiBmaWxlOTAsJzA1LXNoYi90cmlhbC90aXRhbi11bi50cyc6IGZpbGU5MSwnMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LnRzJzogZmlsZTkyLCcwNS1zaGIvdHJpYWwvd29sLnRzJzogZmlsZTkzLCcwNS1zaGIvdHJpYWwvd29sLWV4LnRzJzogZmlsZTk0LCcwNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLnRzJzogZmlsZTk1LH07Il0sInNvdXJjZVJvb3QiOiIifQ==