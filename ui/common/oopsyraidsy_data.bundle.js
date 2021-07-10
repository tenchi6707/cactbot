(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 6327:
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
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/buffs.js

 // Abilities seem instant.

const abilityCollectSeconds = 0.5; // Observation: up to ~1.2 seconds for a buff to roll through the party.

const effectCollectSeconds = 2.0;

const isInPartyConditionFunc = (_evt, data, matches) => {
  const sourceId = matches.sourceId.toUpperCase();
  if (data.party.partyIds.includes(sourceId)) return true;

  if (data.petIdToOwnerId) {
    const ownerId = data.petIdToOwnerId[sourceId];
    if (ownerId && data.party.partyIds.includes(ownerId)) return true;
  }

  return false;
}; // args: triggerId, netRegex, field, type, ignoreSelf


const missedFunc = args => [{
  // Sure, not all of these are "buffs" per se, but they're all in the buffs file.
  id: `Buff ${args.triggerId} Collect`,
  netRegex: args.netRegex,
  condition: isInPartyConditionFunc,
  run: (_e, data, matches) => {
    data.generalBuffCollection = data.generalBuffCollection || {};
    data.generalBuffCollection[args.triggerId] = data.generalBuffCollection[args.triggerId] || [];
    data.generalBuffCollection[args.triggerId].push(matches);
  }
}, {
  id: `Buff ${args.triggerId}`,
  netRegex: args.netRegex,
  condition: isInPartyConditionFunc,
  delaySeconds: args.collectSeconds,
  suppressSeconds: args.collectSeconds,
  mistake: (_e, data, _matches) => {
    if (!data.generalBuffCollection) return;
    const allMatches = data.generalBuffCollection[args.triggerId];
    if (!allMatches) return;
    const partyNames = data.party.partyNames; // TODO: consider dead people somehow

    const gotBuffMap = {};

    for (const name of partyNames) gotBuffMap[name] = false;

    const firstMatch = allMatches[0];
    let sourceName = firstMatch.source; // Blame pet mistakes on owners.

    if (data.petIdToOwnerId) {
      const petId = firstMatch.sourceId.toUpperCase();
      const ownerId = data.petIdToOwnerId[petId];

      if (ownerId) {
        const ownerName = data.party.nameFromId(ownerId);
        if (ownerName) sourceName = ownerName;else console.error(`Couldn't find name for ${ownerId} from pet ${petId}`);
      }
    }

    if (args.ignoreSelf) gotBuffMap[sourceName] = true;
    const thingName = firstMatch[args.field];

    for (const matches of allMatches) {
      // In case you have multiple party members who hit the same cooldown at the same
      // time (lol?), then ignore anybody who wasn't the first.
      if (matches.source !== firstMatch.source) continue;
      gotBuffMap[matches.target] = true;
    }

    const missed = Object.keys(gotBuffMap).filter(x => !gotBuffMap[x]);
    if (missed.length === 0) return; // TODO: oopsy could really use mouseover popups for details.
    // TODO: alternatively, if we have a death report, it'd be good to
    // explicitly call out that other people got a heal this person didn't.

    if (missed.length < 4) {
      return {
        type: args.type,
        blame: sourceName,
        text: {
          en: thingName + ' missed ' + missed.map(x => data.ShortName(x)).join(', '),
          de: thingName + ' verfehlt ' + missed.map(x => data.ShortName(x)).join(', '),
          fr: thingName + ' manqué(e) sur ' + missed.map(x => data.ShortName(x)).join(', '),
          ja: '(' + missed.map(x => data.ShortName(x)).join(', ') + ') が' + thingName + 'を受けなかった',
          cn: missed.map(x => data.ShortName(x)).join(', ') + ' 没受到 ' + thingName,
          ko: thingName + ' ' + missed.map(x => data.ShortName(x)).join(', ') + '에게 적용안됨'
        }
      };
    } // If there's too many people, just list the number of people missed.
    // TODO: we could also list everybody on separate lines?


    return {
      type: args.type,
      blame: sourceName,
      text: {
        en: thingName + ' missed ' + missed.length + ' people',
        de: thingName + ' verfehlte ' + missed.length + ' Personen',
        fr: thingName + ' manqué(e) sur ' + missed.length + ' personnes',
        ja: missed.length + '人が' + thingName + 'を受けなかった',
        cn: '有' + missed.length + '人没受到 ' + thingName,
        ko: thingName + ' ' + missed.length + '명에게 적용안됨'
      }
    };
  },
  run: (_e, data) => {
    if (data.generalBuffCollection) delete data.generalBuffCollection[args.triggerId];
  }
}];

const missedMitigationBuff = args => {
  if (!args.effectId) console.error('Missing effectId: ' + JSON.stringify(args));
  return missedFunc({
    triggerId: args.id,
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: args.effectId
    }),
    field: 'effect',
    type: 'heal',
    ignoreSelf: args.ignoreSelf,
    collectSeconds: args.collectSeconds ? args.collectSeconds : effectCollectSeconds
  });
};

const missedDamageAbility = args => {
  if (!args.abilityId) console.error('Missing abilityId: ' + JSON.stringify(args));
  return missedFunc({
    triggerId: args.id,
    netRegex: netregexes/* default.ability */.Z.ability({
      id: args.abilityId
    }),
    field: 'ability',
    type: 'damage',
    ignoreSelf: args.ignoreSelf,
    collectSeconds: args.collectSeconds ? args.collectSeconds : abilityCollectSeconds
  });
};

const missedHeal = args => {
  if (!args.abilityId) console.error('Missing abilityId: ' + JSON.stringify(args));
  return missedFunc({
    triggerId: args.id,
    netRegex: netregexes/* default.ability */.Z.ability({
      id: args.abilityId
    }),
    field: 'ability',
    type: 'heal',
    collectSeconds: args.collectSeconds ? args.collectSeconds : abilityCollectSeconds
  });
};

const missedMitigationAbility = missedHeal;
/* harmony default export */ const buffs = ({
  zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
  triggers: [{
    id: 'Buff Pet To Owner Mapper',
    netRegex: netregexes/* default.addedCombatantFull */.Z.addedCombatantFull(),
    run: (_e, data, matches) => {
      if (matches.ownerId === '0') return;
      data.petIdToOwnerId = data.petIdToOwnerId || {}; // Fix any lowercase ids.

      data.petIdToOwnerId[matches.id.toUpperCase()] = matches.ownerId.toUpperCase();
    }
  }, {
    id: 'Buff Pet To Owner Clearer',
    netRegex: netregexes/* default.changeZone */.Z.changeZone(),
    run: (_e, data) => {
      // Clear this hash periodically so it doesn't have false positives.
      data.petIdToOwnerId = {};
    }
  }, // Prefer abilities to effects, as effects take longer to roll through the party.
  // However, some things are only effects and so there is no choice.
  // For things you can step in or out of, give a longer timer?  This isn't perfect.
  // TODO: include soil here??
  ...missedMitigationBuff({
    id: 'Collective Unconscious',
    effectId: '351',
    collectSeconds: 10
  }), // Arms Up = 498 (others), Passage Of Arms = 497 (you).  Use both in case everybody is missed.
  ...missedMitigationBuff({
    id: 'Passage of Arms',
    effectId: '49[78]',
    ignoreSelf: true,
    collectSeconds: 10
  }), ...missedMitigationBuff({
    id: 'Divine Veil',
    effectId: '2D7',
    ignoreSelf: true
  }), ...missedMitigationAbility({
    id: 'Heart Of Light',
    abilityId: '3F20'
  }), ...missedMitigationAbility({
    id: 'Dark Missionary',
    abilityId: '4057'
  }), ...missedMitigationAbility({
    id: 'Shake It Off',
    abilityId: '1CDC'
  }), // 3F44 is the correct Quadruple Technical Finish, others are Dinky Technical Finish.
  ...missedDamageAbility({
    id: 'Technical Finish',
    abilityId: '3F4[1-4]'
  }), ...missedDamageAbility({
    id: 'Divination',
    abilityId: '40A8'
  }), ...missedDamageAbility({
    id: 'Brotherhood',
    abilityId: '1CE4'
  }), ...missedDamageAbility({
    id: 'Battle Litany',
    abilityId: 'DE5'
  }), ...missedDamageAbility({
    id: 'Embolden',
    abilityId: '1D60'
  }), ...missedDamageAbility({
    id: 'Battle Voice',
    abilityId: '76',
    ignoreSelf: true
  }), // Too noisy (procs every three seconds, and bards often off doing mechanics).
  // missedDamageBuff({ id: 'Wanderer\'s Minuet', effectId: '8A8', ignoreSelf: true }),
  // missedDamageBuff({ id: 'Mage\'s Ballad', effectId: '8A9', ignoreSelf: true }),
  // missedDamageBuff({ id: 'Army\'s Paeon', effectId: '8AA', ignoreSelf: true }),
  ...missedMitigationAbility({
    id: 'Troubadour',
    abilityId: '1CED'
  }), ...missedMitigationAbility({
    id: 'Tactician',
    abilityId: '41F9'
  }), ...missedMitigationAbility({
    id: 'Shield Samba',
    abilityId: '3E8C'
  }), ...missedMitigationAbility({
    id: 'Mantra',
    abilityId: '41'
  }), ...missedDamageAbility({
    id: 'Devotion',
    abilityId: '1D1A'
  }), // Maybe using a healer LB1/LB2 should be an error for the healer. O:)
  // ...missedHeal({ id: 'Healing Wind', abilityId: 'CE' }),
  // ...missedHeal({ id: 'Breath of the Earth', abilityId: 'CF' }),
  ...missedHeal({
    id: 'Medica',
    abilityId: '7C'
  }), ...missedHeal({
    id: 'Medica II',
    abilityId: '85'
  }), ...missedHeal({
    id: 'Afflatus Rapture',
    abilityId: '4096'
  }), ...missedHeal({
    id: 'Temperance',
    abilityId: '751'
  }), ...missedHeal({
    id: 'Plenary Indulgence',
    abilityId: '1D09'
  }), ...missedHeal({
    id: 'Pulse of Life',
    abilityId: 'D0'
  }), ...missedHeal({
    id: 'Succor',
    abilityId: 'BA'
  }), ...missedHeal({
    id: 'Indomitability',
    abilityId: 'DFF'
  }), ...missedHeal({
    id: 'Deployment Tactics',
    abilityId: 'E01'
  }), ...missedHeal({
    id: 'Whispering Dawn',
    abilityId: '323'
  }), ...missedHeal({
    id: 'Fey Blessing',
    abilityId: '40A0'
  }), ...missedHeal({
    id: 'Consolation',
    abilityId: '40A3'
  }), ...missedHeal({
    id: 'Angel\'s Whisper',
    abilityId: '40A6'
  }), ...missedMitigationAbility({
    id: 'Fey Illumination',
    abilityId: '325'
  }), ...missedMitigationAbility({
    id: 'Seraphic Illumination',
    abilityId: '40A7'
  }), ...missedHeal({
    id: 'Angel Feathers',
    abilityId: '1097'
  }), ...missedHeal({
    id: 'Helios',
    abilityId: 'E10'
  }), ...missedHeal({
    id: 'Aspected Helios',
    abilityId: 'E11'
  }), ...missedHeal({
    id: 'Aspected Helios',
    abilityId: '3200'
  }), ...missedHeal({
    id: 'Celestial Opposition',
    abilityId: '40A9'
  }), ...missedHeal({
    id: 'Astral Stasis',
    abilityId: '1098'
  }), ...missedHeal({
    id: 'White Wind',
    abilityId: '2C8E'
  }), ...missedHeal({
    id: 'Gobskin',
    abilityId: '4780'
  }), // TODO: export all of these missed functions into their own helper
  // and then add this to the Delubrum Reginae files directly.
  ...missedMitigationAbility({
    id: 'Lost Aethershield',
    abilityId: '5753'
  })]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/general.js

 // General mistakes; these apply everywhere.

/* harmony default export */ const general = ({
  zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
  triggers: [{
    // Trigger id for internally generated early pull warning.
    id: 'General Early Pull'
  }, {
    id: 'General Food Buff',
    // Well Fed
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '48'
    }),
    condition: (_e, _data, matches) => {
      // Prevent "Eos loses the effect of Well Fed from Critlo Mcgee"
      return matches.target === matches.source;
    },
    mistake: (_e, data, matches) => {
      data.lostFood = data.lostFood || {}; // Well Fed buff happens repeatedly when it falls off (WHY),
      // so suppress multiple occurrences.

      if (!data.inCombat || data.lostFood[matches.target]) return;
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
          ko: '음식 버프 해제'
        }
      };
    }
  }, {
    id: 'General Well Fed',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '48'
    }),
    run: (_e, data, matches) => {
      if (!data.lostFood) return;
      delete data.lostFood[matches.target];
    }
  }, {
    id: 'General Rabbit Medium',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '8E0'
    }),
    condition: (_e, data, matches) => data.IsPlayerId(matches.sourceId),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.source,
        text: {
          en: 'bunny',
          de: 'Hase',
          fr: 'lapin',
          ja: 'うさぎ',
          cn: '兔子',
          ko: '토끼'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/test.js

 // Test mistake triggers.

/* harmony default export */ const test = ({
  zoneId: zone_id/* default.MiddleLaNoscea */.Z.MiddleLaNoscea,
  triggers: [{
    id: 'Test Bow',
    netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'You bow courteously to the striking dummy.*?'
    }),
    netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'Vous vous inclinez devant le mannequin d\'entraînement.*?'
    }),
    netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*は木人にお辞儀した.*?'
    }),
    netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*恭敬地对木人行礼.*?'
    }),
    netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*나무인형에게 공손하게 인사합니다.*?'
    }),
    mistake: (_e, data) => {
      return {
        type: 'pull',
        blame: data.me,
        fullText: {
          en: 'Bow',
          de: 'Bogen',
          fr: 'Saluer',
          ja: 'お辞儀',
          cn: '鞠躬',
          ko: '인사'
        }
      };
    }
  }, {
    id: 'Test Wipe',
    netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'You bid farewell to the striking dummy.*?'
    }),
    netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'Vous faites vos adieux au mannequin d\'entraînement.*?'
    }),
    netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*は木人に別れの挨拶をした.*?'
    }),
    netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*向木人告别.*?'
    }),
    netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*나무인형에게 작별 인사를 합니다.*?'
    }),
    mistake: (_e, data) => {
      return {
        type: 'wipe',
        blame: data.me,
        fullText: {
          en: 'Party Wipe',
          de: 'Gruppenwipe',
          fr: 'Party Wipe',
          ja: 'ワイプ',
          cn: '团灭',
          ko: '파티 전멸'
        }
      };
    }
  }, {
    id: 'Test Bootshine',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '35'
    }),
    condition: (_e, data, matches) => {
      if (matches.source !== data.me) return false;
      const strikingDummyByLocale = {
        en: 'Striking Dummy',
        fr: 'Mannequin d\'entraînement',
        ja: '木人',
        cn: '木人',
        ko: '나무인형'
      };
      const strikingDummyNames = Object.values(strikingDummyByLocale);
      return strikingDummyNames.includes(matches.target);
    },
    mistake: (_e, data, matches) => {
      data.bootCount = data.bootCount || 0;
      data.bootCount++;
      const text = `${matches.ability} (${data.bootCount}): ${data.DamageFromMatches(matches)}`;
      return {
        type: 'warn',
        blame: data.me,
        text: text
      };
    }
  }, {
    id: 'Test Leaden Fist',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '745'
    }),
    condition: (_e, data, matches) => matches.source === data.me,
    mistake: (_e, data, matches) => {
      return {
        type: 'good',
        blame: data.me,
        text: matches.effect
      };
    }
  }, {
    id: 'Test Oops',
    netRegex: netregexes/* default.echo */.Z.echo({
      line: '.*oops.*'
    }),
    suppressSeconds: 10,
    mistake: (_e, data, matches) => {
      return {
        type: 'fail',
        blame: data.me,
        text: matches.line
      };
    }
  }, {
    id: 'Test Poke Collect',
    netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'You poke the striking dummy.*?'
    }),
    netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'Vous touchez légèrement le mannequin d\'entraînement du doigt.*?'
    }),
    netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*は木人をつついた.*?'
    }),
    netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*用手指戳向木人.*?'
    }),
    netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*나무인형을 쿡쿡 찌릅니다.*?'
    }),
    run: (_e, data) => {
      data.pokeCount = (data.pokeCount || 0) + 1;
    }
  }, {
    id: 'Test Poke',
    netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'You poke the striking dummy.*?'
    }),
    netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: 'Vous touchez légèrement le mannequin d\'entraînement du doigt.*?'
    }),
    netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*は木人をつついた.*?'
    }),
    netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*用手指戳向木人.*?'
    }),
    netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({
      line: '.*나무인형을 쿡쿡 찌릅니다.*?'
    }),
    delaySeconds: 5,
    mistake: (_e, data) => {
      // 1 poke at a time is fine, but more than one in 5 seconds is (OBVIOUSLY) a mistake.
      if (!data.pokeCount || data.pokeCount <= 1) return;
      return {
        type: 'fail',
        blame: data.me,
        text: {
          en: `Too many pokes (${data.pokeCount})`,
          de: `Zu viele Piekser (${data.pokeCount})`,
          fr: `Trop de touches (${data.pokeCount})`,
          ja: `いっぱいつついた (${data.pokeCount})`,
          cn: `戳太多下啦 (${data.pokeCount})`,
          ko: `너무 많이 찌름 (${data.pokeCount}번)`
        }
      };
    },
    run: (_e, data) => delete data.pokeCount
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/ifrit-nm.js
 // Ifrit Story Mode

/* harmony default export */ const ifrit_nm = ({
  zoneId: zone_id/* default.TheBowlOfEmbers */.Z.TheBowlOfEmbers,
  damageWarn: {
    'IfritNm Radiant Plume': '2DE'
  },
  shareWarn: {
    'IfritNm Incinerate': '1C5',
    'IfritNm Eruption': '2DD'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-nm.js
 // Titan Story Mode

/* harmony default export */ const titan_nm = ({
  zoneId: zone_id/* default.TheNavel */.Z.TheNavel,
  damageWarn: {
    'TitanNm Weight Of The Land': '3CD'
  },
  damageFail: {
    'TitanNm Landslide': '28A'
  },
  shareWarn: {
    'TitanNm Rock Buster': '281'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/levi-ex.js

 // It's hard to capture the reflection abilities from Leviathan's Head and Tail if you use
// ranged physical attacks / magic attacks respectively, as the ability names are the
// ability you used and don't appear to show up in the log as normal "ability" lines.
// That said, dots still tick independently on both so it's likely that people will atack
// them anyway.
// TODO: Figure out why Dread Tide / Waterspout appear like shares (i.e. 0x16 id).
// Dread Tide = 823/824/825, Waterspout = 829
// Leviathan Extreme

/* harmony default export */ const levi_ex = ({
  zoneId: zone_id/* default.TheWhorleaterExtreme */.Z.TheWhorleaterExtreme,
  damageWarn: {
    'LeviEx Grand Fall': '82F',
    // very large circular aoe before spinny dives, applies heavy
    'LeviEx Hydro Shot': '748',
    // Wavespine Sahagin aoe that gives Dropsy effect
    'LeviEx Dreadstorm': '749' // Wavetooth Sahagin aoe that gives Hysteria effect

  },
  damageFail: {
    'LeviEx Body Slam': '82A',
    // levi slam that tilts the boat
    'LeviEx Spinning Dive 1': '88A',
    // levi dash across the boat with knockback
    'LeviEx Spinning Dive 2': '88B',
    // levi dash across the boat with knockback
    'LeviEx Spinning Dive 3': '82C' // levi dash across the boat with knockback

  },
  gainsEffectWarn: {
    'LeviEx Dropsy': '110' // standing in the hydro shot from the Wavespine Sahagin

  },
  gainsEffectFail: {
    'LeviEx Hysteria': '128' // standing in the dreadstorm from the Wavetooth Sahagin

  },
  triggers: [{
    id: 'LeviEx Body Slam Knocked Off',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '82A'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/shiva-hm.js

 // Shiva Hard

/* harmony default export */ const shiva_hm = ({
  zoneId: zone_id/* default.TheAkhAfahAmphitheatreHard */.Z.TheAkhAfahAmphitheatreHard,
  damageWarn: {
    // Large white circles.
    'ShivaHm Icicle Impact': '993',
    // Avoidable tank stun.
    'ShivaHm Glacier Bash': '9A1'
  },
  shareWarn: {
    // Knockback tank cleave.
    'ShivaHm Heavenly Strike': '9A0',
    // Hailstorm spread marker.
    'ShivaHm Hailstorm': '998'
  },
  shareFail: {
    // Tankbuster.  This is Shiva Hard mode, not Shiva Extreme.  Please!
    'ShivaHm Icebrand': '996'
  },
  triggers: [{
    id: 'ShivaHm Diamond Dust',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '98A'
    }),
    run: data => {
      data.seenDiamondDust = true;
    }
  }, {
    id: 'ShivaHm Deep Freeze',
    // Shiva also uses ability 9A3 on you, but it has the untranslated name
    // 透明：シヴァ：凍結レクト：ノックバック用. So, use the effect instead for free translation.
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '1E7'
    }),
    condition: (_e, data) => {
      // The intermission also gets this effect, so only a mistake after that.
      // Unlike extreme, this has the same 20 second duration as the intermission.
      return data.seenDiamondDust;
    },
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/shiva-ex.js

 // Shiva Extreme

/* harmony default export */ const shiva_ex = ({
  zoneId: zone_id/* default.TheAkhAfahAmphitheatreExtreme */.Z.TheAkhAfahAmphitheatreExtreme,
  damageWarn: {
    // Large white circles.
    'ShivaEx Icicle Impact': 'BEB',
    // "get in" aoe
    'ShivaEx Whiteout': 'BEC',
    // Avoidable tank stun.
    'ShivaEx Glacier Bash': 'BE9'
  },
  damageFail: {
    // 270 degree attack.
    'ShivaEx Glass Dance': 'BDF'
  },
  shareWarn: {
    // Hailstorm spread marker.
    'ShivaEx Hailstorm': 'BE2'
  },
  shareFail: {
    // Laser.  TODO: maybe blame the person it's on??
    'ShivaEx Avalanche': 'BE0'
  },
  soloWarn: {
    // Party shared tankbuster
    'ShivaEx Icebrand': 'BE1'
  },
  triggers: [{
    id: 'ShivaEx Deep Freeze',
    // Shiva also uses ability C8A on you, but it has the untranslated name
    // 透明：シヴァ：凍結レクト：ノックバック用/ヒロイック. So, use the effect instead for free translation.
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '1E7'
    }),
    condition: (_e, _data, matches) => {
      // The intermission also gets this effect, but for a shorter duration.
      return parseFloat(matches.duration) > 20;
    },
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-hm.js
 // Titan Hard

/* harmony default export */ const titan_hm = ({
  zoneId: zone_id/* default.TheNavelHard */.Z.TheNavelHard,
  damageWarn: {
    'TitanHm Weight Of The Land': '553',
    'TitanHm Burst': '41C'
  },
  damageFail: {
    'TitanHm Landslide': '554'
  },
  shareWarn: {
    'TitanHm Rock Buster': '550'
  },
  shareFail: {
    'TitanHm Mountain Buster': '283'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-ex.js
 // Titan Extreme

/* harmony default export */ const titan_ex = ({
  zoneId: zone_id/* default.TheNavelExtreme */.Z.TheNavelExtreme,
  damageWarn: {
    'TitanEx Weight Of The Land': '5BE',
    'TitanEx Burst': '5BF'
  },
  damageFail: {
    'TitanEx Landslide': '5BB',
    'TitanEx Gaoler Landslide': '5C3'
  },
  shareWarn: {
    'TitanEx Rock Buster': '5B7'
  },
  shareFail: {
    'TitanEx Mountain Buster': '5B8'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/alliance/weeping_city.js


/* harmony default export */ const weeping_city = ({
  zoneId: zone_id/* default.TheWeepingCityOfMhach */.Z.TheWeepingCityOfMhach,
  damageWarn: {
    'Weeping Critical Bite': '1848',
    // Sarsuchus cone aoe
    'Weeping Realm Shaker': '183E',
    // First Daughter circle aoe
    'Weeping Silkscreen': '183C',
    // First Daughter line aoe
    'Weeping Silken Spray': '1824',
    // Arachne Eve rear conal aoe
    'Weeping Tremblor 1': '1837',
    // Arachne Eve disappear circle aoe 1
    'Weeping Tremblor 2': '1836',
    // Arachne Eve disappear circle aoe 2
    'Weeping Tremblor 3': '1835',
    // Arachne Eve disappear circle aoe 3
    'Weeping Spider Thread': '1839',
    // Arachne Eve spider line aoe
    'Weeping Fire II': '184E',
    // Black Mage Corpse circle aoe
    'Weeping Necropurge': '17D7',
    // Forgall Shriveled Talon line aoe
    'Weeping Rotten Breath': '17D0',
    // Forgall Dahak cone aoe
    'Weeping Mow': '17D2',
    // Forgall Haagenti unmarked cleave
    'Weeping Dark Eruption': '17C3',
    // Forgall puddle marker
    // 1806 is also Flare Star, but if you get by 1805 you also get hit by 1806?
    'Weeping Flare Star': '1805',
    // Ozma cube phase donut
    'Weeping Execration': '1829',
    // Ozma triangle laser
    'Weeping Haircut 1': '180B',
    // Calofisteri 180 cleave 1
    'Weeping Haircut 2': '180F',
    // Calofisteri 180 cleave 2
    'Weeping Entanglement': '181D',
    // Calofisteri landmine puddle proc
    'Weeping Evil Curl': '1816',
    // Calofisteri axe
    'Weeping Evil Tress': '1817',
    // Calofisteri bulb
    'Weeping Depth Charge': '1820',
    // Calofisteri charge to edge
    'Weeping Feint Particle Beam': '1928',
    // Calofisteri sky laser
    'Weeping Evil Switch': '1815' // Calofisteri lasers

  },
  shareWarn: {
    'Weeping Arachne Web': '185E',
    // Arachne Eve headmarker web aoe
    'Weeping Earth Aether': '1841',
    // Arachne Eve orbs
    'Weeping Epigraph': '1852',
    // Headstone untelegraphed laser line tank attack
    // This is too noisy.  Better to pop the balloons than worry about friends.
    // 'Weeping Explosion': '1807', // Ozmasphere Cube orb explosion
    'Weeping Split End 1': '180C',
    // Calofisteri tank cleave 1
    'Weeping Split End 2': '1810',
    // Calofisteri tank cleave 2
    'Weeping Bloodied Nail': '181F' // Calofisteri axe/bulb appearing

  },
  gainsEffectWarn: {
    'Weeping Hysteria': '128',
    // Arachne Eve Frond Affeard
    'Weeping Zombification': '173',
    // Forgall too many zombie puddles
    'Weeping Toad': '1B7',
    // Forgall Brand of the Fallen failure
    'Weeping Doom': '38E',
    // Forgall Haagenti Mortal Ray
    'Weeping Assimilation': '42C',
    // Ozmashade Assimilation look-away
    'Weeping Stun': '95' // Calofisteri Penetration look-away

  },
  triggers: [{
    id: 'Weeping Forgall Gradual Zombification Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '415'
    }),
    run: (_e, data, matches) => {
      data.zombie = data.zombie || {};
      data.zombie[matches.target] = true;
    }
  }, {
    id: 'Weeping Forgall Gradual Zombification Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '415'
    }),
    run: (_e, data, matches) => {
      data.zombie = data.zombie || {};
      data.zombie[matches.target] = false;
    }
  }, {
    id: 'Weeping Forgall Mega Death',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '17CA'
    }),
    condition: (_e, data, matches) => data.zombie && !data.zombie[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'Weeping Headstone Shield Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '15E'
    }),
    run: (_e, data, matches) => {
      data.shield = data.shield || {};
      data.shield[matches.target] = true;
    }
  }, {
    id: 'Weeping Headstone Shield Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '15E'
    }),
    run: (_e, data, matches) => {
      data.shield = data.shield || {};
      data.shield[matches.target] = false;
    }
  }, {
    id: 'Weeping Flaring Epigraph',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '1856'
    }),
    condition: (_e, data, matches) => data.shield && !data.shield[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    // This ability name is helpfully called "Attack" so name it something else.
    id: 'Weeping Ozma Tank Laser',
    netRegex: netregexes/* default.ability */.Z.ability({
      type: '22',
      id: '1831'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: {
          en: 'Tank Laser',
          de: 'Tank Laser',
          fr: 'Tank Laser',
          ja: 'タンクレザー',
          cn: '坦克激光',
          ko: '탱커 레이저'
        }
      };
    }
  }, {
    id: 'Weeping Ozma Holy',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '182E'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Slid off!',
          de: 'ist runtergerutscht!',
          fr: 'A glissé(e) !',
          ja: 'ノックバック',
          cn: '击退！',
          ko: '넉백됨!'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/aetherochemical_research_facility.js

 // Aetherochemical Research Facility

/* harmony default export */ const aetherochemical_research_facility = ({
  zoneId: zone_id/* default.TheAetherochemicalResearchFacility */.Z.TheAetherochemicalResearchFacility,
  damageWarn: {
    'ARF Grand Sword': '216',
    // Conal AoE, Scrambled Iron Giant trash
    'ARF Cermet Drill': '20E',
    // Line AoE, 6th Legion Magitek Vanguard trash
    'ARF Magitek Slug': '10DB',
    // Line AoE, boss 1
    'ARF Aetherochemical Grenado': '10E2',
    // Large targeted circle AoE, Magitek Turret II, boss 1
    'ARF Magitek Spread': '10DC',
    // 270-degree roomwide AoE, boss 1
    'ARF Eerie Soundwave': '1170',
    // Targeted circle AoE, Cultured Empusa trash, before boss 2
    'ARF Tail Slap': '125F',
    // Conal AoE, Cultured Dancer trash, before boss 2
    'ARF Calcifying Mist': '123A',
    // Conal AoE, Cultured Naga trash, before boss 2
    'ARF Puncture': '1171',
    // Short line AoE, Cultured Empusa trash, before boss 2
    'ARF Sideswipe': '11A7',
    // Conal AoE, Cultured Reptoid trash, before boss 2
    'ARF Gust': '395',
    // Targeted small circle AoE, Cultured Mirrorknight trash, before boss 2
    'ARF Marrow Drain': 'D0E',
    // Conal AoE, Cultured Chimera trash, before boss 2
    'ARF Riddle Of The Sphinx': '10E4',
    // Targeted circle AoE, boss 2
    'ARF Ka': '106E',
    // Conal AoE, boss 2
    'ARF Rotoswipe': '11CC',
    // Conal AoE, Facility Dreadnought trash, before boss 3
    'ARF Auto-cannons': '12D9',
    // Line AoE, Monitoring Drone trash, before boss 3
    'ARF Death\'s Door': '4EC',
    // Line AoE, Cultured Shabti trash, before boss 3
    'ARF Spellsword': '4EB',
    // Conal AoE, Cultured Shabti trash, before boss 3
    'ARF End Of Days': '10FD',
    // Line AoE, boss 3
    'ARF Blizzard Burst': '10FE',
    // Fixed circle AoEs, Igeyorhm, boss 3
    'ARF Fire Burst': '10FF',
    // Fixed circle AoEs, Lahabrea, boss 3
    'ARF Sea Of Pitch': '12DE',
    // Targeted persistent circle AoEs, boss 3
    'ARF Dark Blizzard II': '10F3',
    // Random circle AoEs, Igeyorhm, boss 3
    'ARF Dark Fire II': '10F8',
    // Random circle AoEs, Lahabrea, boss 3
    'ARF Ancient Eruption': '1104',
    // Self-targeted circle AoE, boss 4
    'ARF Entropic Flame': '1108' // Line AoEs,  boss 4

  },
  shareWarn: {
    'ARF Chthonic Hush': '10E7',
    // Instant tank cleave, boss 2
    'ARF Height Of Chaos': '1101',
    // Tank cleave, boss 4
    'ARF Ancient Circle': '1102' // Targeted donut AoEs, boss 4

  },
  triggers: [{
    id: 'ARF Petrifaction',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '01'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/fractal_continuum.js
 // Fractal Continuum

/* harmony default export */ const fractal_continuum = ({
  zoneId: zone_id/* default.TheFractalContinuum */.Z.TheFractalContinuum,
  damageWarn: {
    'Fractal Double Sever': 'F7D',
    // Conals, boss 1
    'Fractal Aetheric Compression': 'F80',
    // Ground AoE circles, boss 1
    'Fractal 11-Tonze Swipe': 'F81',
    // Frontal cone, boss 2
    'Fractal 10-Tonze Slash': 'F83',
    // Frontal line, boss 2
    'Fractal 111-Tonze Swing': 'F87',
    // Get-out AoE, boss 2
    'Fractal Broken Glass': 'F8E',
    // Glowing panels, boss 3
    'Fractal Mines': 'F90',
    'Fractal Seed of the Rivers': 'F91' // Ground AoE circles, boss 3

  },
  shareWarn: {
    'Fractal Sanctification': 'F89' // Instant conal buster, boss 3

  }
});
// EXTERNAL MODULE: ./ui/oopsyraidsy/oopsy_common.ts
var oopsy_common = __webpack_require__(5013);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/gubal_library_hard.js



/* harmony default export */ const gubal_library_hard = ({
  zoneId: zone_id/* default.TheGreatGubalLibraryHard */.Z.TheGreatGubalLibraryHard,
  damageWarn: {
    'GubalHm Terror Eye': '930',
    // Circle AoE, Spine Breaker trash
    'GubalHm Batter': '198A',
    // Circle AoE, trash before boss 1
    'GubalHm Condemnation': '390',
    // Conal AoE, Bibliovore trash
    'GubalHm Discontinue 1': '1943',
    // Falling book shadow, boss 1
    'GubalHm Discontinue 2': '1940',
    // Rush AoE from ends, boss 1
    'GubalHm Discontinue 3': '1942',
    // Rush AoE across, boss 1
    'GubalHm Frightful Roar': '193B',
    // Get-Out AoE, boss 1
    'GubalHm Issue 1': '193D',
    // Initial end book warning AoE, boss 1
    'GubalHm Issue 2': '193F',
    // Initial end book warning AoE, boss 1
    'GubalHm Issue 3': '1941',
    // Initial side book warning AoE, boss 1
    'GubalHm Desolation': '198C',
    // Line AoE, Biblioclast trash
    'GubalHm Double Smash': '26A',
    // Conal AoE, Biblioclast trash
    'GubalHm Darkness': '3A0',
    // Conal AoE, Inkstain trash
    'GubalHm Firewater': '3BA',
    // Circle AoE, Biblioclast trash
    'GubalHm Elbow Drop': 'CBA',
    // Conal AoE, Biblioclast trash
    'GubalHm Dark': '19DF',
    // Large circle AoE, Inkstain trash
    'GubalHm Seals': '194A',
    // Sun/Moonseal failure, boss 2
    'GubalHm Water III': '1C67',
    // Large circle AoE, Porogo Pegist trash
    'GubalHm Raging Axe': '1703',
    // Small conal AoE, Mechanoservitor trash
    'GubalHm Magic Hammer': '1990',
    // Large circle AoE, Apanda mini-boss
    'GubalHm Properties Of Gravity': '1950',
    // Circle AoE from gravity puddles, boss 3
    'GubalHm Properties Of Levitation': '194F',
    // Circle AoE from levitation puddles, boss 3
    'GubalHm Comet': '1969' // Small circle AoE, intermission, boss 3

  },
  damageFail: {
    'GubalHm Ecliptic Meteor': '195C' // LoS mechanic, boss 3

  },
  shareWarn: {
    'GubalHm Searing Wind': '1944',
    // Tank cleave, boss 2
    'GubalHm Thunder': '19[AB]' // Spread marker, boss 3

  },
  triggers: [{
    // Fire gate in hallway to boss 2, magnet failure on boss 2
    id: 'GubalHm Burns',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '10B'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    // Helper for Thunder 3 failures
    id: 'GubalHm Imp Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '46E'
    }),
    run: (_e, data, matches) => {
      data.hasImp = data.hasImp || {};
      data.hasImp[matches.target] = true;
    }
  }, {
    id: 'GubalHm Imp Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '46E'
    }),
    run: (_e, data, matches) => {
      data.hasImp = data.hasImp || {};
      data.hasImp[matches.target] = false;
    }
  }, {
    // Targets with Imp when Thunder III resolves receive a vulnerability stack and brief stun
    id: 'GubalHm Imp Thunder',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '195[AB]',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.hasImp[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: {
          en: 'Shocked Imp',
          de: 'Schockierter Imp',
          ja: 'カッパを解除しなかった',
          cn: '河童状态吃了暴雷'
        }
      };
    }
  }, {
    id: 'GubalHm Quake',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1956',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // Always hits target, but if correctly resolved will deal 0 damage
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'GubalHm Tornado',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '195[78]',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // Always hits target, but if correctly resolved will deal 0 damage
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/sohm_al_hard.js


/* harmony default export */ const sohm_al_hard = ({
  zoneId: zone_id/* default.SohmAlHard */.Z.SohmAlHard,
  damageWarn: {
    'SohmAlHm Deadly Vapor': '1DC9',
    // Environmental circle AoEs
    'SohmAlHm Deeproot': '1CDA',
    // Targeted circle AoE, Blooming Chichu trash
    'SohmAlHm Odious Air': '1CDB',
    // Conal AoE, Blooming Chichu trash
    'SohmAlHm Glorious Blaze': '1C33',
    // Circle AoE, Small Spore Sac, boss 1
    'SohmAlHm Foul Waters': '118A',
    // Conal AoE, Mountaintop Opken trash
    'SohmAlHm Plain Pound': '1187',
    // Targeted circle AoE, Mountaintop Hropken trash
    'SohmAlHm Palsynyxis': '1161',
    // Conal AoE, Overgrown Difflugia trash
    'SohmAlHm Surface Breach': '1E80',
    // Circle AoE, Giant Netherworm trash
    'SohmAlHm Freshwater Cannon': '119F',
    // Line AoE, Giant Netherworm trash
    'SohmAlHm Tail Smash': '1C35',
    // Untelegraphed rear conal AoE, Gowrow, boss 2
    'SohmAlHm Tail Swing': '1C36',
    // Untelegraphed circle AoE, Gowrow, boss 2
    'SohmAlHm Ripper Claw': '1C37',
    // Untelegraphed frontal AoE, Gowrow, boss 2
    'SohmAlHm Wind Slash': '1C38',
    // Circle AoE, Gowrow, boss 2
    'SohmAlHm Wild Charge': '1C39',
    // Dash attack, Gowrow, boss 2
    'SohmAlHm Hot Charge': '1C3A',
    // Dash attack, Gowrow, boss 2
    'SohmAlHm Fireball': '1C3B',
    // Untelegraphed targeted circle AoE, Gowrow, boss 2
    'SohmAlHm Lava Flow': '1C3C',
    // Untelegraphed conal AoE, Gowrow, boss 2
    'SohmAlHm Wild Horn': '1507',
    // Conal AoE, Abalathian Clay Golem trash
    'SohmAlHm Lava Breath': '1C4D',
    // Conal AoE, Lava Crab trash
    'SohmAlHm Ring of Fire': '1C4C',
    // Targeted circle AoE, Volcano Anala trash
    'SohmAlHm Molten Silk 1': '1C43',
    // 270-degree frontal AoE, Lava Scorpion, boss 3
    'SohmAlHm Molten Silk 2': '1C44',
    // 270-degree rear AoE, Lava Scorpion, boss 3
    'SohmAlHm Molten Silk 3': '1C42',
    // Ring AoE, Lava Scorpion, boss 3
    'SohmAlHm Realm Shaker': '1C41' // Circle AoE, Lava Scorpion, boss 3

  },
  triggers: [{
    // Warns if players step into the lava puddles. There is unfortunately no direct damage event.
    id: 'SohmAlHm Burns',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '11C'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/raid/a12n.js



/* harmony default export */ const a12n = ({
  zoneId: zone_id/* default.AlexanderTheSoulOfTheCreator */.Z.AlexanderTheSoulOfTheCreator,
  damageWarn: {
    'A12N Sacrament': '1AE6',
    // Cross Lasers
    'A12N Gravitational Anomaly': '1AEB' // Gravity Puddles

  },
  shareWarn: {
    'A12N Divine Spear': '1AE3',
    // Instant conal tank cleave
    'A12N Blazing Scourge': '1AE9',
    // Orange head marker splash damage
    'A12N Plaint Of Severity': '1AF1',
    // Aggravated Assault splash damage
    'A12N Communion': '1AFC' // Tether Puddles

  },
  triggers: [{
    id: 'A12N Assault Collect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '461'
    }),
    run: (_e, data, matches) => {
      data.assault = data.assault || [];
      data.assault.push(matches.target);
    }
  }, {
    // It is a failure for a Severity marker to stack with the Solidarity group.
    id: 'A12N Assault Failure',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1AF2',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.assault.includes(matches.target),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: 'Didn\'t Spread!',
          de: 'Nicht verteilt!',
          fr: 'Ne s\'est pas dispersé(e) !',
          ja: '散開しなかった!',
          cn: '没有散开!'
        }
      };
    }
  }, {
    id: 'A12N Assault Cleanup',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '461'
    }),
    delaySeconds: 20,
    suppressSeconds: 5,
    run: (_e, data) => {
      delete data.assault;
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/ala_mhigo.js


/* harmony default export */ const ala_mhigo = ({
  zoneId: zone_id/* default.AlaMhigo */.Z.AlaMhigo,
  damageWarn: {
    'Ala Mhigo Magitek Ray': '24CE',
    // Line AoE, Legion Predator trash, before boss 1
    'Ala Mhigo Lock On': '2047',
    // Homing circles, boss 1
    'Ala Mhigo Tail Laser 1': '2049',
    // Frontal line AoE, boss 1
    'Ala Mhigo Tail Laser 2': '204B',
    // Rear line AoE, boss 1
    'Ala Mhigo Tail Laser 3': '204C',
    // Rear line AoE, boss 1
    'Ala Mhigo Shoulder Cannon': '24D0',
    // Circle AoE, Legion Avenger trash, before boss 2
    'Ala Mhigo Cannonfire': '23ED',
    // Environmental circle AoE, path to boss 2
    'Ala Mhigo Aetherochemical Grenado': '205A',
    // Circle AoE, boss 2
    'Ala Mhigo Integrated Aetheromodulator': '205B',
    // Ring AoE, boss 2
    'Ala Mhigo Circle Of Death': '24D4',
    // Proximity circle AoE, Hexadrone trash, before boss 3
    'Ala Mhigo Exhaust': '24D3',
    // Line AoE, Legion Colossus trash, before boss 3
    'Ala Mhigo Grand Sword': '24D2',
    // Conal AoE, Legion Colossus trash, before boss 3
    'Ala Mhigo Art Of The Storm 1': '2066',
    // Proximity circle AoE, pre-intermission, boss 3
    'Ala Mhigo Art Of The Storm 2': '2587',
    // Proximity circle AoE, intermission, boss 3
    'Ala Mhigo Vein Splitter 1': '24B6',
    // Proximity circle AoE, primary entity, boss 3
    'Ala Mhigo Vein Splitter 2': '206C',
    // Proximity circle AoE, helper entity, boss 3
    'Ala Mhigo Lightless Spark': '206B' // Conal AoE, boss 3

  },
  shareWarn: {
    'Ala Mhigo Demimagicks': '205E',
    'Ala Mhigo Unmoving Troika': '2060',
    'Ala Mhigo Art Of The Sword 1': '2069',
    'Ala Mhigo Art Of The Sword 2': '2589'
  },
  triggers: [{
    // It's possible players might just wander into the bad on the outside,
    // but normally people get pushed into it.
    id: 'Ala Mhigo Art Of The Swell',
    // Damage Down
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '2B8'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/bardams_mettle.js

 // Bardam's Mettle
// For reasons not completely understood at the time this was merged,
// but likely related to the fact that no nameplates are visible during the encounter,
// and that nothing in the encounter actually does damage,
// we can't use damageWarn or gainsEffect helpers on the Bardam fight.
// Instead, we use this helper function to look for failure flags.
// If the flag is present,a full trigger object is returned that drops in seamlessly.

const abilityWarn = args => {
  if (!args.abilityId) console.error('Missing ability ' + JSON.stringify(args));
  return {
    id: args.id,
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: args.abilityId
    }),
    condition: (_e, _data, matches) => matches.flags.substr(-2) === '0E',
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  };
};

/* harmony default export */ const bardams_mettle = ({
  zoneId: zone_id/* default.BardamsMettle */.Z.BardamsMettle,
  damageWarn: {
    'Bardam Dirty Claw': '21A8',
    // Frontal cleave, Gulo Gulo trash
    'Bardam Epigraph': '23AF',
    // Line AoE, Wall of Bardam trash
    'Bardam The Dusk Star': '2187',
    // Circle AoE, environment before first boss
    'Bardam The Dawn Star': '2186',
    // Circle AoE, environment before first boss
    'Bardam Crumbling Crust': '1F13',
    // Circle AoEs, Garula, first boss
    'Bardam Ram Rush': '1EFC',
    // Line AoEs, Steppe Yamaa, first boss.
    'Bardam Lullaby': '24B2',
    // Circle AoEs, Steppe Sheep, first boss.
    'Bardam Heave': '1EF7',
    // Frontal cleave, Garula, first boss
    'Bardam Wide Blaster': '24B3',
    // Enormous frontal cleave, Steppe Coeurl, first boss
    'Bardam Double Smash': '26A',
    // Circle AoE, Mettling Dhara trash
    'Bardam Transonic Blast': '1262',
    // Circle AoE, Steppe Eagle trash
    'Bardam Wild Horn': '2208',
    // Frontal cleave, Khun Gurvel trash
    'Bardam Heavy Strike 1': '2578',
    // 1 of 3 270-degree ring AoEs, Bardam, second boss
    'Bardam Heavy Strike 2': '2579',
    // 2 of 3 270-degree ring AoEs, Bardam, second boss
    'Bardam Heavy Strike 3': '257A',
    // 3 of 3 270-degree ring AoEs, Bardam, second boss
    'Bardam Tremblor 1': '257B',
    // 1 of 2 concentric ring AoEs, Bardam, second boss
    'Bardam Tremblor 2': '257C',
    // 2 of 2 concentric ring AoEs, Bardam, second boss
    'Bardam Throwing Spear': '257F',
    // Checkerboard AoE, Throwing Spear, second boss
    'Bardam Bardam\'s Ring': '2581',
    // Donut AoE headmarkers, Bardam, second boss
    'Bardam Comet': '257D',
    // Targeted circle AoEs, Bardam, second boss
    'Bardam Comet Impact': '2580',
    // Circle AoEs, Star Shard, second boss
    'Bardam Iron Sphere Attack': '16B6',
    // Contact damage, Iron Sphere trash, before third boss
    'Bardam Tornado': '247E',
    // Circle AoE, Khun Shavara trash
    'Bardam Pinion': '1F11',
    // Line AoE, Yol Feather, third boss
    'Bardam Feather Squall': '1F0E',
    // Dash attack, Yol, third boss
    'Bardam Flutterfall Untargeted': '1F12' // Rotating circle AoEs, Yol, third boss

  },
  shareWarn: {
    'Bardam Garula Rush': '1EF9',
    // Line AoE, Garula, first boss.
    'Bardam Flutterfall Targeted': '1F0C',
    // Circle AoE headmarker, Yol, third boss
    'Bardam Wingbeat': '1F0F' // Conal AoE headmarker, Yol, third boss

  },
  gainsEffectWarn: {
    'Bardam Confused': '0B' // Failed gaze attack, Yol, third boss

  },
  gainsEffectFail: {
    'Bardam Fetters': '56F' // Failing two mechanics in any one phase on Bardam, second boss.

  },
  triggers: [// 1 of 3 270-degree ring AoEs, Bardam, second boss
  abilityWarn({
    id: 'Bardam Heavy Strike 1',
    abilityId: '2578'
  }), // 2 of 3 270-degree ring AoEs, Bardam, second boss
  abilityWarn({
    id: 'Bardam Heavy Strike 2',
    abilityId: '2579'
  }), // 3 of 3 270-degree ring AoEs, Bardam, second boss
  abilityWarn({
    id: 'Bardam Heavy Strike 3',
    abilityId: '257A'
  }), // 1 of 2 concentric ring AoEs, Bardam, second boss
  abilityWarn({
    id: 'Bardam Tremblor 1',
    abilityId: '257B'
  }), // 2 of 2 concentric ring AoEs, Bardam, second boss
  abilityWarn({
    id: 'Bardam Tremblor 2',
    abilityId: '257C'
  }), // Checkerboard AoE, Throwing Spear, second boss
  abilityWarn({
    id: 'Bardam Throwing Spear',
    abilityId: '257F'
  }), // Gaze attack, Warrior of Bardam, second boss
  abilityWarn({
    id: 'Bardam Empty Gaze',
    abilityId: '1F04'
  }), // Donut AoE headmarkers, Bardam, second boss
  abilityWarn({
    id: 'Bardam\'s Ring',
    abilityId: '2581'
  }), // Targeted circle AoEs, Bardam, second boss
  abilityWarn({
    id: 'Bardam Comet',
    abilityId: '257D'
  }), // Circle AoEs, Star Shard, second boss
  abilityWarn({
    id: 'Bardam Comet Impact',
    abilityId: '2580'
  })]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/kugane_castle.js


/* harmony default export */ const kugane_castle = ({
  zoneId: zone_id/* default.KuganeCastle */.Z.KuganeCastle,
  damageWarn: {
    'Kugane Castle Tenka Gokken': '2329',
    // Frontal cone AoE,  Joi Blade trash, before boss 1
    'Kugane Castle Kenki Release Trash': '2330',
    // Chariot AoE, Joi Kiyofusa trash, before boss 1
    'Kugane Castle Clearout': '1E92',
    // Frontal cone AoE, Zuiko-Maru, boss 1
    'Kugane Castle Hara-Kiri 1': '1E96',
    // Giant circle AoE, Harakiri Kosho, boss 1
    'Kugane Castle Hara-Kiri 2': '24F9',
    // Giant circle AoE, Harakiri Kosho, boss 1
    'Kugane Castle Juji Shuriken 1': '232D',
    // Line AoE, Karakuri Onmitsu trash, before boss 2
    'Kugane Castle 1000 Barbs': '2198',
    // Line AoE, Joi Koja trash, before boss 2
    'Kugane Castle Juji Shuriken 2': '1E98',
    // Line AoE, Dojun Maru, boss 2
    'Kugane Castle Tatami-Gaeshi': '1E9D',
    // Floor tile line attack, Elkite Onmitsu, boss 2
    'Kugane Castle Juji Shuriken 3': '1EA0',
    // Line AoE, Elite Onmitsu, boss 2
    'Kugane Castle Auto Crossbow': '2333',
    // Frontal cone AoE, Karakuri Hanya trash, after boss 2
    'Kugane Castle Harakiri 3': '23C9',
    // Giant Circle AoE, Harakiri  Hanya trash, after boss 2
    'Kugane Castle Iai-Giri': '1EA2',
    // Chariot AoE, Yojimbo, boss 3
    'Kugane Castle Fragility': '1EAA',
    // Chariot AoE, Inoshikacho, boss 3
    'Kugane Castle Dragonfire': '1EAB' // Line AoE, Dragon Head, boss 3

  },
  shareWarn: {
    'Kugane Castle Issen': '1E97',
    // Instant frontal cleave, Dojun Maru, boss 2
    'Kugane Castle Clockwork Raiton': '1E9B' // Large lightning spread circles, Dojun Maru, boss 2

  },
  triggers: [{
    // Stack marker, Zuiko Maru, boss 1
    id: 'Kugane Castle Helm Crack',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '1E94'
    }),
    condition: (_e, _data, matches) => matches.type === '21',
    // Taking the stack solo is *probably* a mistake.
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: `${matches.ability} (alone)`,
          de: `${matches.ability} (allein)`,
          fr: `${matches.ability} (seul(e))`,
          ja: `${matches.ability} (一人)`,
          cn: `${matches.ability} (单吃)`,
          ko: `${matches.ability} (혼자 맞음)`
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/st_mocianne_hard.js

/* harmony default export */ const st_mocianne_hard = ({
  zoneId: zone_id/* default.SaintMociannesArboretumHard */.Z.SaintMociannesArboretumHard,
  damageWarn: {
    'St Mocianne Hard Mudstream': '30D9',
    // Targeted circle AoE, Immaculate Apa trash, before boss 1
    'St Mocianne Hard Silken Spray': '3385',
    // Rear cone AoE, Withered Belladonna trash, before boss 1
    'St Mocianne Hard Muddy Puddles': '30DA',
    // Small targeted circle AoEs, Dorpokkur trash, before boss 1
    'St Mocianne Hard Odious Air': '2E49',
    // Frontal cone AoE, Nullchu, boss 1
    'St Mocianne Hard SLudge Bomb': '2E4E',
    // Targeted circle AoEs, Nullchu, boss 1
    'St Mocianne Hard Odious Atmosphere': '2E51',
    // Channeled 3/4 arena cleave, Nullchu, boss 1
    'St Mocianne Hard Creeping Ivy': '31A5',
    // Frontal cone AoE, Withered Kulak trash, before boss 2
    'St Mocianne Hard Rockslide': '3134',
    // Line AoE, Silt Golem, boss 2
    'St Mocianne Hard Earthquake Inner': '312E',
    // Chariot AoE, Lakhamu, boss 2
    'St Mocianne Hard Earthquake Outer': '312F',
    // Dynamo AoE, Lakhamu, boss 2
    'St Mocianne Hard Embalming Earth': '31A6',
    // Large Chariot AoE, Muddy Mata, after boss 2
    'St Mocianne Hard Quickmire': '3136',
    // Sewage surge avoided on platforms, Tokkapchi, boss 3
    'St Mocianne Hard Quagmire Platforms': '3139',
    // Quagmire explosion on platforms, Tokkapchi, boss 3
    'St Mocianne Hard Feculent Flood': '313C',
    // Targeted thin cone AoE, Tokkapchi, boss 3
    'St Mocianne Hard Corrupture': '33A0' // Mud Slime explosion, boss 3. (No explosion if done correctly.)

  },
  shareWarn: {
    'St Mocianne Hard Taproot': '2E4C',
    // Large orange spread circles, Nullchu, boss 1
    'St Mocianne Hard Earth Shaker': '3131' // Earth Shaker, Lakhamu, boss 2

  },
  gainsEffectWarn: {
    'St Mocianne Hard Seduced': '3DF',
    // Gaze failure, Withered Belladonna trash, before boss 1
    'St Mocianne Hard Pollen': '13',
    // Sludge puddles, Nullchu, boss 1
    'St Mocianne Hard Transfiguration': '648',
    // Roly-Poly AoE circle failure, BLooming Biloko trash, before boss 2
    'St Mocianne Hard Hysteria': '128',
    // Gaze failure, Lakhamu, boss 2
    'St Mocianne Hard Stab Wound': '45D' // Arena outer wall effect, boss 2

  },
  soloFail: {
    'St Mocianne Hard Fault Warren': '2E4A' // Stack marker, Nullchu, boss 1

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/swallows_compass.js


/* harmony default export */ const swallows_compass = ({
  zoneId: zone_id/* default.TheSwallowsCompass */.Z.TheSwallowsCompass,
  damageWarn: {
    'Swallows Compass Ivy Fetters': '2C04',
    // Circle ground AoE, Sai Taisui trash, before boss 1
    'Swallows Compass Wildswind 1': '2C05',
    // Tornado ground AoE, placed by Sai Taisui trash, before boss 1
    'Swallows Compass Yama-Kagura': '2B96',
    // Frontal line AoE, Otengu, boss 1
    'Swallows Compass Flames Of Hate': '2B98',
    // Fire orb explosions, boss 1
    'Swallows Compass Conflagrate': '2B99',
    // Collision with fire orb, boss 1
    'Swallows Compass Upwell': '2C06',
    // Targeted circle ground AoE, Sai Taisui trash, before boss 2
    'Swallows Compass Bad Breath': '2C07',
    // Frontal cleave, Jinmenju trash, before boss 2
    'Swallows Compass Greater Palm 1': '2B9D',
    // Half arena right cleave, Daidarabotchi, boss 2
    'Swallows Compass Greater Palm 2': '2B9E',
    // Half arena left cleave, Daidarabotchi, boss 2
    'Swallows Compass Tributary': '2BA0',
    // Targeted thin conal ground AoEs, Daidarabotchi, boss 2
    'Swallows Compass Wildswind 2': '2C06',
    // Circle ground AoE, environment, after boss 2
    'Swallows Compass Wildswind 3': '2C07',
    // Circle ground AoE, placed by Sai Taisui trash, after boss 2
    'Swallows Compass Filoplumes': '2C76',
    // Frontal rectangle AoE, Dragon Bi Fang trash, after boss 2
    'Swallows Compass Both Ends 1': '2BA8',
    // Chariot AoE, Qitian Dasheng, boss 3
    'Swallows Compass Both Ends 2': '2BA9',
    // Dynamo AoE, Qitian Dasheng, boss 3
    'Swallows Compass Both Ends 3': '2BAE',
    // Chariot AoE, Shadow Of The Sage, boss 3
    'Swallows Compass Both Ends 4': '2BAF',
    // Dynamo AoE, Shadow Of The Sage, boss 3
    'Swallows Compass Equal Of Heaven': '2BB4' // Small circle ground AoEs, Qitian Dasheng, boss 3

  },
  shareWarn: {
    'Swallows Compass Mirage': '2BA2',
    // Prey-chasing puddles, Daidarabotchi, boss 2
    'Swallows Compass Mountain Falls': '2BA5',
    // Circle spread markers, Daidarabotchi, boss 2
    'Swallows Compass The Long End': '2BA7',
    // Laser tether, Qitian Dasheng  boss 3
    'Swallows Compass The Long End 2': '2BAD' // Laser Tether, Shadows Of The Sage, boss 3

  },
  gainsEffectWarn: {
    'Swallows Compass Hysteria': '128',
    // Gaze attack failure, Otengu, boss 1
    'Swallows Compass Bleeding': '112F' // Stepping outside the arena, boss 3

  },
  triggers: [{
    // Standing in the lake, Diadarabotchi, boss 2
    id: 'Swallows Compass Six Fulms Under',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '237'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: matches.effect
      };
    }
  }, {
    // Stack marker, boss 3
    id: 'Swallows Compass Five Fingered Punishment',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['2BAB', '2BB0'],
      source: ['Qitian Dasheng', 'Shadow Of The Sage']
    }),
    condition: (_data, matches) => matches.type === '21',
    // Taking the stack solo is *probably* a mistake.
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: `${matches.ability} (alone)`,
          de: `${matches.ability} (allein)`,
          fr: `${matches.ability} (seul(e))`,
          ja: `${matches.ability} (一人)`,
          cn: `${matches.ability} (单吃)`,
          ko: `${matches.ability} (혼자 맞음)`
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/temple_of_the_fist.js

/* harmony default export */ const temple_of_the_fist = ({
  zoneId: zone_id/* default.TheTempleOfTheFist */.Z.TheTempleOfTheFist,
  damageWarn: {
    'Temple Fire Break': '21ED',
    // Conal AoE, Bloodglider Monk trash
    'Temple Radial Blaster': '1FD3',
    // Circle AoE, boss 1
    'Temple Wide Blaster': '1FD4',
    // Conal AoE, boss 1
    'Temple Crippling Blow': '2016',
    // Line AoEs, environmental, before boss 2
    'Temple Broken Earth': '236E',
    // Circle AoE, Singha trash
    'Temple Shear': '1FDD',
    // Dual conal AoE, boss 2
    'Temple Counter Parry': '1FE0',
    // Retaliation for incorrect direction after Killer Instinct, boss 2
    'Temple Tapas': '',
    // Tracking circular ground AoEs, boss 2
    'Temple Hellseal': '200F',
    // Red/Blue symbol failure, boss 2
    'Temple Pure Will': '2017',
    // Circle AoE, Spirit Flame trash, before boss 3
    'Temple Megablaster': '163',
    // Conal AoE, Coeurl Prana trash, before boss 3
    'Temple Windburn': '1FE8',
    // Circle AoE, Twister wind, boss 3
    'Temple Hurricane Kick': '1FE5',
    // 270-degree frontal AoE, boss 3
    'Temple Silent Roar': '1FEB',
    // Frontal line AoE, boss 3
    'Temple Mighty Blow': '1FEA' // Contact with coeurl head, boss 3

  },
  shareWarn: {
    'Temple Heat Lightning': '1FD7' // Purple spread circles, boss 1

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/the_burn.js

/* harmony default export */ const the_burn = ({
  zoneId: zone_id/* default.TheBurn */.Z.TheBurn,
  damageWarn: {
    'The Burn Falling Rock': '31A3',
    // Environmental line AoE
    'The Burn Aetherial Blast': '328B',
    // Line AoE, Kukulkan trash
    'The Burn Mole-a-whack': '328D',
    // Circle AoE, Desert Desman trash
    'The Burn Head Butt': '328E',
    // Small conal AoE, Desert Desman trash
    'The Burn Shardfall': '3191',
    // Roomwide AoE, LoS for safety, Hedetet, boss 1
    'The Burn Dissonance': '3192',
    // Donut AoE, Hedetet, boss 1
    'The Burn Crystalline Fracture': '3197',
    // Circle AoE, Dim Crystal, boss 1
    'The Burn Resonant Frequency': '3198',
    // Circle AoE, Dim Crystal, boss 1
    'The Burn Rotoswipe': '3291',
    // Frontal cone AoE, Charred Dreadnaught trash
    'The Burn Wrecking Ball': '3292',
    // Circle AoE, Charred Dreadnaught trash
    'The Burn Shatter': '3294',
    // Large circle AoE, Charred Doblyn trash
    'The Burn Auto-Cannons': '3295',
    // Line AoE, Charred Drone trash
    'The Burn Self-Detonate': '3296',
    // Circle AoE, Charred Drone trash
    'The Burn Full Throttle': '2D75',
    // Line AoE, Defective Drone, boss 2
    'The Burn Throttle': '2D76',
    // Line AoE, Mining Drone adds, boss 2
    'The Burn Adit Driver': '2D78',
    // Line AoE, Rock Biter adds, boss 2
    'The Burn Tremblor': '3297',
    // Large circle AoE, Veiled Gigaworm trash
    'The Burn Desert Spice': '3298',
    // The frontal cleaves must flow
    'The Burn Toxic Spray': '329A',
    // Frontal cone AoE, Gigaworm Stalker trash
    'The Burn Venom Spray': '329B',
    // Targeted circle AoE, Gigaworm Stalker trash
    'The Burn White Death': '3143',
    // Reactive during invulnerability, Mist Dragon, boss 3
    'The Burn Fog Plume 1': '3145',
    // Star AoE, Mist Dragon, boss 3
    'The Burn Fog Plume 2': '3146',
    // Line AoEs after stars, Mist Dragon, boss 3
    'The Burn Cauterize': '3148' // Line/Swoop AoE, Mist Dragon, boss 3

  },
  damageFail: {
    'The Burn Cold Fog': '3142' // Growing circle AoE, Mist Dragon, boss 3

  },
  shareWarn: {
    'The Burn Hailfire': '3194',
    // Head marker line AoE, Hedetet, boss 1
    'The Burn Shardstrike': '3195',
    // Orange spread head markers, Hedetet, boss 1
    'The Burn Chilling Aspiration': '314D',
    // Head marker cleave, Mist Dragon, boss 3
    'The Burn Frost Breath': '314C' // Tank cleave, Mist Dragon, boss 3

  },
  gainsEffectWarn: {
    'The Burn Leaden': '43',
    // Puddle effect, boss 2. (Also inflicts 11F, Sludge.)
    'The Burn Puddle Frostbite': '11D' // Ice puddle effect, boss 3. (NOT the conal-inflicted one, 10C.)

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o1n.js
 // O1N - Deltascape 1.0 Normal

/* harmony default export */ const o1n = ({
  zoneId: zone_id/* default.DeltascapeV10 */.Z.DeltascapeV10,
  damageWarn: {
    'O1N Burn': '23D5',
    // Fireball explosion circle AoEs
    'O1N Clamp': '23E2' // Frontal rectangle knockback AoE, Alte Roite

  },
  shareWarn: {
    'O1N Levinbolt': '23DA' // small spread circles

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o2n.js


 // O2N - Deltascape 2.0 Normal

/* harmony default export */ const o2n = ({
  zoneId: zone_id/* default.DeltascapeV20 */.Z.DeltascapeV20,
  damageWarn: {
    'O2N Main Quake': '24A5',
    // Non-telegraphed circle AoE, Fleshy Member
    'O2N Erosion': '2590' // Small circle AoEs, Fleshy Member

  },
  shareWarn: {
    'O2N Paranormal Wave': '250E' // Instant tank cleave

  },
  triggers: [{
    // We could try to separate out the mistake that led to the player being petrified.
    // However, it's Normal mode, why overthink it?
    id: 'O2N Petrification',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '262'
    }),
    // The user might get hit by another petrifying ability before the effect ends.
    // There's no point in notifying for that.
    suppressSeconds: 10,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'O2N Earthquake',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '2515',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // This deals damage only to non-floating targets.
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o3n.js

 // O3N - Deltascape 3.0 Normal

/* harmony default export */ const o3n = ({
  zoneId: zone_id/* default.DeltascapeV30 */.Z.DeltascapeV30,
  damageWarn: {
    'O3N Spellblade Fire III': '2460',
    // Donut AoE, Halicarnassus
    'O3N Spellblade Blizzard III': '2461',
    // Circle AoE, Halicarnassus
    'O3N Spellblade Thunder III': '2462',
    // Line AoE, Halicarnassus
    'O3N Cross Reaper': '246B',
    // Circle AoE, Soul Reaper
    'O3N Gusting Gouge': '246C',
    // Green line AoE, Soul Reaper
    'O3N Sword Dance': '2470',
    // Targeted thin cone AoE, Halicarnassus
    'O3N Uplift': '2473' // Ground spears, Queen's Waltz effect, Halicarnassus

  },
  damageFail: {
    'O3N Ultimum': '2477' // Instant kill. Used if the player does not exit the sand maze fast enough.

  },
  shareWarn: {
    'O3N Holy Blur': 2463 // Spread circles.

  },
  triggers: [{
    id: 'O3N Phase Tracker',
    netRegex: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '2304',
      source: 'Halicarnassus',
      capture: false
    }),
    netRegexDe: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '2304',
      source: 'Halikarnassos',
      capture: false
    }),
    netRegexFr: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '2304',
      source: 'Halicarnasse',
      capture: false
    }),
    netRegexJa: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '2304',
      source: 'ハリカルナッソス',
      capture: false
    }),
    netRegexCn: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '2304',
      source: '哈利卡纳苏斯',
      capture: false
    }),
    netRegexKo: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '2304',
      source: '할리카르나소스',
      capture: false
    }),
    run: (_e, data) => {
      data.phaseNumber += 1;
    }
  }, {
    // There's a lot to track, and in order to make it all clean, it's safest just to
    // initialize it all up front instead of trying to guard against undefined comparisons.
    id: 'O3N Initializing',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '367',
      source: 'Halicarnassus',
      capture: false
    }),
    netRegexDe: netregexes/* default.ability */.Z.ability({
      id: '367',
      source: 'Halikarnassos',
      capture: false
    }),
    netRegexFr: netregexes/* default.ability */.Z.ability({
      id: '367',
      source: 'Halicarnasse',
      capture: false
    }),
    netRegexJa: netregexes/* default.ability */.Z.ability({
      id: '367',
      source: 'ハリカルナッソス',
      capture: false
    }),
    netRegexCn: netregexes/* default.ability */.Z.ability({
      id: '367',
      source: '哈利卡纳苏斯',
      capture: false
    }),
    netRegexKo: netregexes/* default.ability */.Z.ability({
      id: '367',
      source: '할리카르나소스',
      capture: false
    }),
    condition: (_e, data) => !data.initialized,
    run: (_e, data) => {
      data.gameCount = 0; // Indexing phases at 1 so as to make phases match what humans expect.
      // 1: We start here.
      // 2: Cave phase with Uplifts.
      // 3: Post-intermission, with good and bad frogs.

      data.phaseNumber = 1;
      data.initialized = true;
    }
  }, {
    id: 'O3N Ribbit',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2466'
    }),
    condition: (_e, data, matches) => {
      // We DO want to be hit by Toad/Ribbit if the next cast of The Game
      // is 4x toad panels.
      return !(data.phaseNumber === 3 && data.gameCount % 2 === 0) && matches.targetId !== 'E0000000';
    },
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    // There's a lot we could do to track exactly how the player failed The Game.
    // Why overthink Normal mode, however?
    id: 'O3N The Game',
    // Guess what you just lost?
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '246D'
    }),
    // If the player takes no damage, they did the mechanic correctly.
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    },
    run: (_e, data) => {
      data.gameCount += 1;
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4n.js


 // O4N - Deltascape 4.0 Normal

/* harmony default export */ const o4n = ({
  zoneId: zone_id/* default.DeltascapeV40 */.Z.DeltascapeV40,
  damageWarn: {
    'O4N Blizzard III': '24BC',
    // Targeted circle AoEs, Exdeath
    'O4N Empowered Thunder III': '24C1',
    // Untelegraphed large circle AoE, Exdeath
    'O4N Zombie Breath': '24CB',
    // Conal, tree head after Decisive Battle
    'O4N Clearout': '24CC',
    // Overlapping cone AoEs, Deathly Vine (tentacles alongside tree head)
    'O4N Black Spark': '24C9' // Exploding Black Hole

  },
  shareWarn: {
    // Empowered Fire III inflicts the Pyretic debuff, which deals damage if the player
    // moves or acts before the debuff falls. Unfortunately it doesn't look like there's
    // currently a log line for this, so the only way to check for this is to collect
    // the debuffs and then warn if a player takes an action during that time. Not worth it
    // for Normal.
    'O4N Standard Fire': '24BA',
    'O4N Buster Thunder': '24BE' // A cleaving tank buster

  },
  triggers: [{
    id: 'O4N Doom',
    // Kills target if not cleansed
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38E'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Cleansers missed Doom!',
          de: 'Doom-Reinigung vergessen!',
          fr: 'N\'a pas été dissipé(e) du Glas !',
          ja: '死の宣告',
          cn: '没解死宣'
        }
      };
    }
  }, {
    // Short knockback from Exdeath
    id: 'O4N Vacuum Wave',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '24B8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Pushed off!',
          de: 'Runter geschubst!',
          fr: 'A été poussé(e) !',
          ja: '落ちた',
          cn: '击退坠落'
        }
      };
    }
  }, {
    id: 'O4N Empowered Blizzard',
    // Room-wide AoE, freezes non-moving targets
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '4E6'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4s.js


 // O4S - Deltascape 4.0 Savage

/* harmony default export */ const o4s = ({
  zoneId: zone_id/* default.DeltascapeV40Savage */.Z.DeltascapeV40Savage,
  damageWarn: {
    'O4S2 Neo Vacuum Wave': '241D',
    'O4S2 Acceleration Bomb': '2431',
    'O4S2 Emptiness': '2422'
  },
  damageFail: {
    'O4S2 Double Laser': '2415'
  },
  triggers: [{
    id: 'O4S2 Decisive Battle',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2408',
      capture: false
    }),
    run: (_e, data) => {
      data.isDecisiveBattleElement = true;
    }
  }, {
    id: 'O4S1 Vacuum Wave',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '23FE',
      capture: false
    }),
    run: (_e, data) => {
      data.isDecisiveBattleElement = false;
    }
  }, {
    id: 'O4S2 Almagest',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2417',
      capture: false
    }),
    run: (_e, data) => {
      data.isNeoExdeath = true;
    }
  }, {
    id: 'O4S2 Blizzard III',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '23F8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // Ignore unavoidable raid aoe Blizzard III.
    condition: (_e, data) => !data.isDecisiveBattleElement,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.abilityName
      };
    }
  }, {
    id: 'O4S2 Thunder III',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '23FD',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // Only consider this during random mechanic after decisive battle.
    condition: (_e, data) => data.isDecisiveBattleElement,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.abilityName
      };
    }
  }, {
    id: 'O4S2 Petrified',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '262'
    }),
    mistake: (_e, data, matches) => {
      // On Neo, being petrified is because you looked at Shriek, so your fault.
      if (data.isNeoExdeath) return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      }; // On normal ExDeath, this is due to White Hole.

      return {
        type: 'warn',
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'O4S2 Forked Lightning',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '242E',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'O4S2 Beyond Death Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    run: (_e, data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = true;
    }
  }, {
    id: 'O4S2 Beyond Death Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '566'
    }),
    run: (_e, data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = false;
    }
  }, {
    id: 'O4S2 Beyond Death',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_e, data, matches) => {
      if (!data.hasBeyondDeath) return;
      if (!data.hasBeyondDeath[matches.target]) return;
      return {
        name: matches.target,
        reason: matches.effect
      };
    }
  }, {
    id: 'O4S2 Double Attack Collect',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '241C',
      ...oopsy_common/* playerDamageFields */.np
    }),
    run: (_e, data, matches) => {
      data.doubleAttackMatches = data.doubleAttackMatches || [];
      data.doubleAttackMatches.push(matches);
    }
  }, {
    id: 'O4S2 Double Attack',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '241C',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, data) => {
      const arr = data.doubleAttackMatches;
      if (!arr) return;
      if (arr.length <= 2) return; // Hard to know who should be in this and who shouldn't, but
      // it should never hit 3 people.

      return {
        type: 'fail',
        fullText: `${arr[0].ability} x ${arr.length}`
      };
    },
    run: (_e, data) => delete data.doubleAttackMatches
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o7s.js

 // O7S - Sigmascape 3.0 Savage

/* harmony default export */ const o7s = ({
  zoneId: zone_id/* default.SigmascapeV30Savage */.Z.SigmascapeV30Savage,
  damageFail: {
    'O7S Missile': '2782',
    'O7S Chain Cannon': '278F'
  },
  damageWarn: {
    'O7S Searing Wind': '2777'
  },
  triggers: [{
    id: 'O7S Stoneskin',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2AB5'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.source,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o12s.js


 // TODO: could add Patch warnings for double/unbroken tethers
// TODO: Hello World could have any warnings (sorry)

/* harmony default export */ const o12s = ({
  zoneId: zone_id/* default.AlphascapeV40Savage */.Z.AlphascapeV40Savage,
  damageWarn: {
    'O12S1 Superliminal Motion 1': '3334',
    // 300+ degree cleave with back safe area
    'O12S1 Efficient Bladework 1': '3329',
    // Omega-M "get out" centered aoe after split
    'O12S1 Efficient Bladework 2': '332A',
    // Omega-M "get out" centered aoe during blades
    'O12S1 Beyond Strength': '3328',
    // Omega-M "get in" centered aoe during shield
    'O12S1 Superliminal Steel 1': '3330',
    // Omega-F "get front/back" blades phase
    'O12S1 Superliminal Steel 2': '3331',
    // Omega-F "get front/back" blades phase
    'O12S1 Optimized Blizzard III': '3332',
    // Omega-F giant cross
    'O12S2 Diffuse Wave Cannon': '3369',
    // back/sides lasers
    'O12S2 Right Arm Unit Hyper Pulse 1': '335A',
    // Rotating Archive Peripheral lasers
    'O12S2 Right Arm Unit Hyper Pulse 2': '335B',
    // Rotating Archive Peripheral lasers
    'O12S2 Right Arm Unit Colossal Blow': '335F',
    // Exploding Archive All hands
    'O12S2 Left Arm Unit Colossal Blow': '3360' // Exploding Archive All hands

  },
  damageFail: {
    'O12S1 Optical Laser': '3347',
    // middle laser from eye
    'O12S1 Advanced Optical Laser': '334A',
    // giant circle centered on eye
    'O12S2 Rear Power Unit Rear Lasers 1': '3361',
    // Archive All initial laser
    'O12S2 Rear Power Unit Rear Lasers 2': '3362' // Archive All rotating laser

  },
  shareWarn: {
    'O12S1 Optimized Fire III': '3337',
    // fire spread
    'O12S2 Hyper Pulse Tether': '335C',
    // Index And Archive Peripheral tethers
    'O12S2 Wave Cannon': '336B',
    // Index And Archive Peripheral baited lasers
    'O12S2 Optimized Fire III': '3379' // Archive All spread

  },
  shareFail: {
    'O12S1 Optimized Sagittarius Arrow': '334D',
    // Omega-M bard limit break
    'O12S2 Oversampled Wave Cannon': '3366',
    // Monitor tank busters
    'O12S2 Savage Wave Cannon': '336D' // Tank buster with the vuln first

  },
  triggers: [{
    id: 'O12S1 Discharger Knocked Off',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '3327'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }, {
    id: 'O12S1 Magic Vulnerability Up Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '472'
    }),
    run: (_e, data, matches) => {
      data.vuln = data.vuln || {};
      data.vuln[matches.target] = true;
    }
  }, {
    id: 'O12S1 Magic Vulnerability Up Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '472'
    }),
    run: (_e, data, matches) => {
      data.vuln = data.vuln || {};
      data.vuln[matches.target] = false;
    }
  }, {
    id: 'O12S1 Magic Vulnerability Damage',
    // 332E = Pile Pitch stack
    // 333E = Electric Slide (Omega-M square 1-4 dashes)
    // 333F = Electric Slide (Omega-F triangle 1-4 dashes)
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['332E', '333E', '333F'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.vuln && data.vuln[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: `${matches.ability} (with vuln)`,
          de: `${matches.ability} (mit Verwundbarkeit)`,
          ja: `${matches.ability} (被ダメージ上昇)`,
          cn: `${matches.ability} (带易伤)`
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/byakko-ex.js


 // Byakko Extreme

/* harmony default export */ const byakko_ex = ({
  zoneId: zone_id/* default.TheJadeStoaExtreme */.Z.TheJadeStoaExtreme,
  damageWarn: {
    // Popping Unrelenting Anguish bubbles
    'ByaEx Aratama': '27F6',
    // Stepping in growing orb
    'ByaEx Vacuum Claw': '27E9',
    // Lightning Puddles
    'ByaEx Hunderfold Havoc 1': '27E5',
    'ByaEx Hunderfold Havoc 2': '27E6'
  },
  damageFail: {
    'ByaEx Sweep The Leg': '27DB',
    'ByaEx Fire and Lightning': '27DE',
    'ByaEx Distant Clap': '27DD',
    // Midphase line attack
    'ByaEx Imperial Guard': '27F1'
  },
  triggers: [{
    // Pink bubble collision
    id: 'ByaEx Ominous Wind',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '27EC',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: {
          en: 'bubble collision',
          de: 'Blasen sind zusammengestoßen',
          fr: 'collision de bulles',
          ja: '衝突',
          cn: '相撞',
          ko: '장판 겹쳐서 터짐'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/shinryu.js


 // Shinryu Normal

/* harmony default export */ const shinryu = ({
  zoneId: zone_id/* default.TheRoyalMenagerie */.Z.TheRoyalMenagerie,
  damageWarn: {
    'Shinryu Akh Rhai': '1FA6',
    // Sky lasers alongside Akh Morn.
    'Shinryu Blazing Trail': '221A',
    // Rectangle AoEs, intermission adds.
    'Shinryu Collapse': '2218',
    // Circle AoEs, intermission adds
    'Shinryu Dragonfist': '24F0',
    // Giant punchy circle in the center.
    'Shinryu Earth Breath': '1F9D',
    // Conal attacks that aren't actually Earth Shakers.
    'Shinryu Gyre Charge': '1FA8',
    // Green dive bomb attack.
    'Shinryu Spikesicle': '1FA`',
    // Blue-green line attacks from behind.
    'Shinryu Tail Slap': '1F93' // Red squares indicating the tail's landing spots.

  },
  shareWarn: {
    'Shinryu Levinbolt': '1F9C'
  },
  triggers: [{
    // Icy floor attack.
    id: 'Shinryu Diamond Dust',
    // Thin Ice
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38F'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Slid off!',
          de: 'Runter gerutscht!',
          fr: 'A glissé(e) !',
          ja: '滑った',
          cn: '滑落'
        }
      };
    }
  }, {
    id: 'Shinryu Tidal Wave',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1F8B',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Pushed off!',
          de: 'Runter geschubst!',
          fr: 'A été poussé(e) !',
          ja: '落ちた',
          cn: '击退坠落'
        }
      };
    }
  }, {
    // Knockback from center.
    id: 'Shinryu Aerial Blast',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1F90',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Pushed off!',
          de: 'Runter geschubst!',
          fr: 'A été pousser !',
          ja: '落ちた',
          cn: '击退坠落'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/susano-ex.js
 // Susano Extreme

/* harmony default export */ const susano_ex = ({
  zoneId: zone_id/* default.ThePoolOfTributeExtreme */.Z.ThePoolOfTributeExtreme,
  damageWarn: {
    'SusEx Churning': '203F'
  },
  damageFail: {
    'SusEx Rasen Kaikyo': '202E'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/ultima_weapon_ultimate.js


 // Ultima Weapon Ultimate

/* harmony default export */ const ultima_weapon_ultimate = ({
  zoneId: zone_id/* default.TheWeaponsRefrainUltimate */.Z.TheWeaponsRefrainUltimate,
  damageWarn: {
    'UWU Searing Wind': '2B5C',
    'UWU Eruption': '2B5A',
    'UWU Weight': '2B65',
    'UWU Landslide1': '2B70',
    'UWU Landslide2': '2B71'
  },
  damageFail: {
    'UWU Great Whirlwind': '2B41',
    'UWU Slipstream': '2B53',
    'UWU Wicked Wheel': '2B4E',
    'UWU Wicked Tornado': '2B4F'
  },
  triggers: [{
    id: 'UWU Windburn',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'EB'
    }),
    suppressSeconds: 2,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    // Featherlance explosion.  It seems like the person who pops it is the
    // first person listed damage-wise, so they are likely the culprit.
    id: 'UWU Featherlance',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '2B43',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 5,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.source
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/unending_coil_ultimate.js


 // UCU - The Unending Coil Of Bahamut (Ultimate)

/* harmony default export */ const unending_coil_ultimate = ({
  zoneId: zone_id/* default.TheUnendingCoilOfBahamutUltimate */.Z.TheUnendingCoilOfBahamutUltimate,
  damageFail: {
    'UCU Lunar Dynamo': '26BC',
    'UCU Iron Chariot': '26BB',
    'UCU Exaflare': '26EF',
    'UCU Wings Of Salvation': '26CA'
  },
  triggers: [{
    id: 'UCU Twister Death',
    // Instant death has a special flag value, differentiating
    // from the explosion damage you take when somebody else
    // pops one.
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '26AB',
      ...oopsy_common/* playerDamageFields */.np,
      flags: oopsy_common/* kFlagInstantDeath */.hm
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: 'Twister Pop',
          de: 'Wirbelsturm berührt',
          fr: 'Apparition des tornades',
          ja: 'ツイスター',
          cn: '旋风',
          ko: '회오리 밟음'
        }
      };
    }
  }, {
    id: 'UCU Thermionic Burst',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '26B9',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: 'Pizza Slice',
          de: 'Pizzastück',
          fr: 'Parts de pizza',
          ja: 'サーミオニックバースト',
          cn: '天崩地裂',
          ko: '장판에 맞음'
        }
      };
    }
  }, {
    id: 'UCU Chain Lightning',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '26C8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, _data, matches) => {
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
          ko: '번개 맞음'
        }
      };
    }
  }, {
    id: 'UCU Burns',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'FA'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'UCU Sludge',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '11F'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'UCU Doom Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'D2'
    }),
    run: (_e, data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = true;
    }
  }, {
    id: 'UCU Doom Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: 'D2'
    }),
    run: (_e, data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = false;
    }
  }, {
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
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'D2'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 1,
    deathReason: (_e, data, matches) => {
      if (!data.hasDoom || !data.hasDoom[matches.target]) return;
      let reason;
      const duration = parseFloat(matches.duration);
      if (duration < 9) reason = matches.effect + ' #1';else if (duration < 14) reason = matches.effect + ' #2';else reason = matches.effect + ' #3';
      return {
        name: matches.target,
        reason: reason
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_copied_factory.js
 // The Copied Factory

/* harmony default export */ const the_copied_factory = ({
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
    // Cannons
    'Copied 9S Ballistic Impact 1': '4974',
    'Copied 9S Ballistic Impact 2': '48DC',
    'Copied 9S Ballistic Impact 3': '48E4',
    'Copied 9S Ballistic Impact 4': '48E0',
    'Copied 9S Marx Impact': '48D4',
    'Copied 9S Tank Destruction 1': '48E8',
    'Copied 9S Tank Destruction 2': '48E9',
    'Copied 9S Serial Spin 1': '48A5',
    'Copied 9S Serial Spin 2': '48A7'
  },
  shareWarn: {
    'Copied Hobbes Short-Range Missile': '4815'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_puppets_bunker.js
 // TODO: 5093 taking High-Powered Laser with a vuln (because of taking two)
// TODO: 4FB5 taking High-Powered Laser with a vuln (because of taking two)
// TODO: 50D3 Aerial Support: Bombardment going off from add
// TODO: 5211 Maneuver: Volt Array not getting interrupted
// TODO: 4FF4/4FF5 One of these is failing chemical conflagration
// TODO: standing in wrong teleporter?? maybe 5363?

/* harmony default export */ const the_puppets_bunker = ({
  zoneId: zone_id/* default.ThePuppetsBunker */.Z.ThePuppetsBunker,
  damageWarn: {
    'Puppet Aegis Beam Cannons 1': '5074',
    // rotating separating white ground aoe
    'Puppet Aegis Beam Cannons 2': '5075',
    // rotating separating white ground aoe
    'Puppet Aegis Beam Cannons 3': '5076',
    // rotating separating white ground aoe
    'Puppet Aegis Collider Cannons': '507E',
    // rotating red ground aoe pinwheel
    'Puppet Aegis Surface Laser 1': '5091',
    // chasing laser initial
    'Puppet Aegis Surface Laser 2': '5092',
    // chasing laser chasing
    'Puppet Aegis Flight Path': '508C',
    // blue line aoe from flying untargetable adds
    'Puppet Aegis Refraction Cannons 1': '5081',
    // refraction cannons between wings
    'Puppet Aegis Life\'s Last Song': '53B3',
    // ring aoe with gap
    'Puppet Light Long-Barreled Laser': '5212',
    // line aoe from add
    'Puppet Light Surface Missile Impact': '520F',
    // untargeted ground aoe from No Restrictions
    'Puppet Superior Incendiary Bombing': '4FB9',
    // fire puddle initial
    'Puppet Superior Sharp Turn': '506D',
    // sharp turn dash
    'Puppet Superior Standard Surface Missile 1': '4FB1',
    // Lethal Revolution circles
    'Puppet Superior Standard Surface Missile 2': '4FB2',
    // Lethal Revolution circles
    'Puppet Superior Standard Surface Missile 3': '4FB3',
    // Lethal Revolution circles
    'Puppet Superior Sliding Swipe 1': '506F',
    // right-handed sliding swipe
    'Puppet Superior Sliding Swipe 2': '5070',
    // left-handed sliding swipe
    'Puppet Superior Guided Missile': '4FB8',
    // ground aoe during Area Bombardment
    'Puppet Superior High-Order Explosive Blast 1': '4FC0',
    // star aoe
    'Puppet Superior High-Order Explosive Blast 2': '4FC1',
    // star aoe
    'Puppet Heavy Energy Bombardment': '4FFC',
    // colored magic hammer-y ground aoe
    'Puppet Heavy Revolving Laser': '5000',
    // get under laser
    'Puppet Heavy Energy Bomb': '4FFA',
    // getting hit by ball during Active Suppressive Unit
    'Puppet Heavy R010 Laser': '4FF0',
    // laser pod
    'Puppet Heavy R030 Hammer': '4FF1',
    // circle aoe pod
    'Puppet Hallway High-Powered Laser': '50B1',
    // long aoe in the hallway section
    'Puppet Hallway Energy Bomb': '50B2',
    // running into a floating orb
    'Puppet Compound Mechanical Dissection': '51B3',
    // spinning vertical laser
    'Puppet Compound Mechanical Decapitation': '51B4',
    // get under laser
    'Puppet Compound Mechnical Contusion Untargeted': '51B7',
    // untargeted ground aoe
    'Puppet Compound 2P Relentless Spiral 1': '51AA',
    // triple untargeted ground aoes
    'Puppet Compound 2P Relentless Spiral 2': '51CB',
    // triple untargeted ground aoes
    'Puppet Compound 2P Prime Blade Out 1': '541F',
    // 2P prime blade get out
    'Puppet Compound 2P Prime Blade Out 2': '5198',
    // 2P/puppet teleporting/reproduce prime blade get out
    'Puppet Compound 2P Prime Blade Behind 1': '5420',
    // 2P prime blade get behind
    'Puppet Compound 2P Prime Blade Behind 2': '5199',
    // 2P teleporting prime blade get behind
    'Puppet Compound 2P Prime Blade In 1': '5421',
    // 2P prime blade get in
    'Puppet Compound 2P Prime Blade In 2': '519A',
    // 2P/puppet teleporting/reproduce prime blade get in
    'Puppet Compound 2P R012 Laser Ground': '51AE' // untargeted ground circle
    // This is... too noisy.
    // 'Puppet Compound 2P Four Parts Resolve 1': '51A0', // four parts resolve jump
    // 'Puppet Compound 2P Four Parts Resolve 2': '519F', // four parts resolve cleave

  },
  damageFail: {
    'Puppet Heavy Upper Laser 1': '5087',
    // upper laser initial
    'Puppet Heavy Upper Laser 2': '4FF7',
    // upper laser continuous
    'Puppet Heavy Lower Laser 1': '5086',
    // lower laser first section initial
    'Puppet Heavy Lower Laser 2': '4FF6',
    // lower laser first section continuous
    'Puppet Heavy Lower Laser 3': '5088',
    // lower laser second section initial
    'Puppet Heavy Lower Laser 4': '4FF8',
    // lower laser second section continuous
    'Puppet Heavy Lower Laser 5': '5089',
    // lower laser third section initial
    'Puppet Heavy Lower Laser 6': '4FF9',
    // lower laser third section continuous
    'Puppet Compound Incongruous Spin': '51B2' // find the safe spot double dash

  },
  shareWarn: {
    // This is pretty large and getting hit by initial without burns seems fine.
    // 'Puppet Light Homing Missile Impact': '5210', // targeted fire aoe from No Restrictions
    'Puppet Heavy Unconventional Voltage': '5004',
    // Pretty noisy.
    'Puppet Maneuver High-Powered Laser': '5002',
    // tank laser
    'Puppet Compound Mechnical Contusion Targeted': '51B6',
    // targeted spread marker
    'Puppet Compound 2P R012 Laser Tank': '51AE' // targeted spread pod laser on non-tank

  },
  shareFail: {
    'Puppet Aegis Anti-Personnel Laser': '5090',
    // tank buster marker
    'Puppet Superior Precision-Guided Missile': '4FC5',
    'Puppet Compound 2P R012 Laser Tank': '51AD' // targeted pod laser on tank

  },
  gainsEffectWarn: {
    'Puppet Burns': '10B' // standing in many various fire aoes

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_tower_at_paradigms_breach.js

 // TODO: missing Shock Black 2?
// TODO: White/Black Dissonance damage is maybe when flags end in 03?

/* harmony default export */ const the_tower_at_paradigms_breach = ({
  zoneId: zone_id/* default.TheTowerAtParadigmsBreach */.Z.TheTowerAtParadigmsBreach,
  damageWarn: {
    'Tower Knave Colossal Impact Center 1': '5EA7',
    // Center aoe from Knave and clones
    'Tower Knave Colossal Impact Center 2': '60C8',
    // Center aoe from Knave during lunge
    'Tower Knave Colossal Impact Side 1': '5EA5',
    // Side aoes from Knave and clones
    'Tower Knave Colossal Impact Side 2': '5EA6',
    // Side aoes from Knave and clones
    'Tower Knave Colossal Impact Side 3': '60C6',
    // Side aoes from Knave during lunge
    'Tower Knave Colossal Impact Side 4': '60C7',
    // Side aoes from Knave during lunge
    'Tower Knave Burst': '5ED4',
    // Spheroid Knavish Bullets collision
    'Tower Knave Magic Barrage': '5EAC',
    // Spheroid line aoes
    'Tower Hansel Repay': '5C70',
    // Shield damage
    'Tower Hansel Explosion': '5C67',
    // Being hit by Magic Bullet during Passing Lance
    'Tower Hansel Impact': '5C5C',
    // Being hit by Magical Confluence during Wandering Trail
    'Tower Hansel Bloody Sweep 1': '5C6C',
    // Dual cleaves without tether
    'Tower Hansel Bloody Sweep 2': '5C6D',
    // Dual cleaves without tether
    'Tower Hansel Bloody Sweep 3': '5C6E',
    // Dual cleaves with tether
    'Tower Hansel Bloody Sweep 4': '5C6F',
    // Dual cleaves with tether
    'Tower Hansel Passing Lance': '5C66',
    // The Passing Lance charge itself
    'Tower Hansel Breaththrough 1': '55B3',
    // half room cleave during Wandering Trail
    'Tower Hansel Breaththrough 2': '5C5D',
    // half room cleave during Wandering Trail
    'Tower Hansel Breaththrough 3': '5C5E',
    // half room cleave during Wandering Trail
    'Tower Hansel Hungry Lance 1': '5C71',
    // 2xlarge conal cleave during Wandering Trail
    'Tower Hansel Hungry Lance 2': '5C72',
    // 2xlarge conal cleave during Wandering Trail
    'Tower Flight Unit Lightfast Blade': '5BFE',
    // large room cleave
    'Tower Flight Unit Standard Laser': '5BFF',
    // tracking laser
    'Tower 2P Whirling Assault': '5BFB',
    // line aoe from 2P clones
    'Tower 2P Balanced Edge': '5BFA',
    // circular aoe on 2P clones
    'Tower Red Girl Generate Barrier 1': '6006',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 2': '6007',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 3': '6008',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 4': '6009',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 5': '6310',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 6': '6311',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 7': '6312',
    // being hit by barriers appearing
    'Tower Red Girl Generate Barrier 8': '6313',
    // being hit by barriers appearing
    'Tower Red Girl Shock White 1': '600F',
    // white shockwave circle not dropped on black
    'Tower Red Girl Shock White 2': '6010',
    // white shockwave circle not dropped on black
    'Tower Red Girl Shock Black 1': '6011',
    // black shockwave circle not dropped on white
    'Tower Red Girl Point White 1': '601F',
    // being hit by a white laser
    'Tower Red Girl Point White 2': '6021',
    // being hit by a white laser
    'Tower Red Girl Point Black 1': '6020',
    // being hit by a black laser
    'Tower Red Girl Point Black 2': '6022',
    // being hit by a black laser
    'Tower Red Girl Wipe White': '600C',
    // not line of sighting the white meteor
    'Tower Red Girl Wipe Black': '600D',
    // not line of sighting the black meteor
    'Tower Red Girl Diffuse Energy': '6056',
    // rotating clone bubble cleaves
    'Tower Red Girl Pylon Big Explosion': '6027',
    // not killing a pylon during hacking phase
    'Tower Red Girl Pylon Explosion': '6026',
    // pylon during Child's play
    'Tower Philosopher Deploy Armaments Middle': '5C02',
    // middle laser
    'Tower Philosopher Deploy Armaments Sides': '5C05',
    // sides laser
    'Tower Philosopher Deploy Armaments 3': '6078',
    // goes with 5C01
    'Tower Philosopher Deploy Armaments 4': '6079',
    // goes with 5C04
    'Tower Philosopher Energy Bomb': '5C05',
    // pink bubble
    'Tower False Idol Made Magic Right': '5BD7',
    // rotating wheel going right
    'Tower False Idol Made Magic Left': '5BD6',
    // rotating wheel going left
    'Tower False Idol Lighter Note': '5BDA',
    // lighter note moving aoes
    'Tower False Idol Magical Interference': '5BD5',
    // lasers during Rhythm Rings
    'Tower False Idol Scattered Magic': '5BDF',
    // circle aoes from Seed Of Magic
    'Tower Her Inflorescence Uneven Fotting': '5BE2',
    // building from Recreate Structure
    'Tower Her Inflorescence Crash': '5BE5',
    // trains from Mixed Signals
    'Tower Her Inflorescence Heavy Arms 1': '5BED',
    // heavy arms front/back attack
    'Tower Her Inflorescence Heavy Arms 2': '5BEF',
    // heavy arms sides attack
    'Tower Her Inflorescence Energy Scattered Magic': '5BE8' // orbs from Red Girl by train

  },
  damageFail: {
    'Tower Her Inflorescence Place Of Power': '5C0D' // instadeath middle circle before black/white rings

  },
  shareWarn: {
    'Tower Knave Magic Artillery Alpha': '5EAB',
    // Spread
    'Tower Hansel Seed Of Magic Alpha': '5C61' // Spread

  },
  shareFail: {
    'Tower Knave Magic Artillery Beta': '5EB3',
    // Tankbuster
    'Tower Red Girl Manipulate Energy': '601A',
    // Tankbuster
    'Tower False Idol Darker Note': '5BDC' // Tankbuster

  },
  triggers: [{
    id: 'Tower Knocked Off',
    // 5EB1 = Knave Lunge
    // 5BF2 = Her Infloresence Shockwave
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5EB1', '5BF2']
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/akadaemia_anyder.js

/* harmony default export */ const akadaemia_anyder = ({
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
    'Anyder Winding Current': '3E1F' // 3E20 is being hit by the growing orbs, maybe?

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/amaurot.js

/* harmony default export */ const amaurot = ({
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
    'Amaurot Misfortune': '3CE2'
  },
  damageFail: {
    'Amaurot Apokalypsis': '3CD7'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/anamnesis_anyder.js

/* harmony default export */ const anamnesis_anyder = ({
  zoneId: zone_id/* default.AnamnesisAnyder */.Z.AnamnesisAnyder,
  damageWarn: {
    'Anamnesis Trench Phuabo Spine Lash': '4D1A',
    // frontal conal
    'Anamnesis Trench Anemone Falling Rock': '4E37',
    // ground circle aoe from Trench Anemone showing up
    'Anamnesis Trench Dagonite Sewer Water': '4D1C',
    // frontal conal from Trench Anemone (?!)
    'Anamnesis Trench Yovra Rock Hard': '4D21',
    // targeted circle aoe
    'Anamnesis Trench Yovra Torrential Torment': '4D21',
    // frontal conal
    'Anamnesis Unknown Luminous Ray': '4E27',
    // Unknown line aoe
    'Anamnesis Unknown Sinster Bubble Explosion': '4B6E',
    // Unknown explosions during Scrutiny
    'Anamnesis Unknown Reflection': '4B6F',
    // Unknown conal attack during Scrutiny
    'Anamnesis Unknown Clearout 1': '4B74',
    // Unknown frontal cone
    'Anamnesis Unknown Clearout 2': '4B6B',
    // Unknown frontal cone
    'Anamnesis Unknown Setback 1': '4B75',
    // Unknown rear cone
    'Anamnesis Unknown Setback 2': '5B6C',
    // Unknown rear cone
    'Anamnesis Anyder Clionid Acrid Stream': '4D24',
    // targeted circle aoe
    'Anamnesis Anyder Diviner Dreadstorm': '4D28',
    // ground circle aoe
    'Anamnesis Kyklops 2000-Mina Swing': '4B55',
    // Kyklops get out mechanic
    'Anamnesis Kyklops Terrible Hammer': '4B5D',
    // Kyklops Hammer/Blade alternating squares
    'Anamnesis Kyklops Terrible Blade': '4B5E',
    // Kyklops Hammer/Blade alternating squares
    'Anamnesis Kyklops Raging Glower': '4B56',
    // Kyklops line aoe
    'Anamnesis Kyklops Eye Of The Cyclone': '4B57',
    // Kyklops donut
    'Anamnesis Anyder Harpooner Hydroball': '4D26',
    // frontal conal
    'Anamnesis Rukshs Swift Shift': '4B83',
    // Rukshs Deem teleport N/S
    'Anamnesis Rukshs Depth Grip Wavebreaker': '33D4',
    // Rukshs Deem hand attacks
    'Anamnesis Rukshs Rising Tide': '4B8B',
    // Rukshs Deem cross aoe
    'Anamnesis Rukshs Command Current': '4B82' // Rukshs Deem protean-ish ground aoes

  },
  shareWarn: {
    'Anamnesis Trench Xzomit Mantle Drill': '4D19',
    // charge attack
    'Anamnesis Io Ousia Barreling Smash': '4E24',
    // charge attack
    'Anamnesis Kyklops Wanderer\'s Pyre': '4B5F' // Kyklops spread attack

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/dohn_mheg.js

 // TODO: Missing Growing tethers on boss 2.
// (Maybe gather party member names on the previous TIIIIMBEEEEEER cast for comparison?)
// TODO: Failing to interrupt Dohnfaust Fuath on Watering Wheel casts?
// (15:........:Dohnfast Fuath:3DAA:Watering Wheel:........:(\y{Name}):)

/* harmony default export */ const dohn_mheg = ({
  zoneId: zone_id/* default.DohnMheg */.Z.DohnMheg,
  damageWarn: {
    'Dohn Mheg Geyser': '2260',
    // Water eruptions, boss 1
    'Dohn Mheg Hydrofall': '22BD',
    // Ground AoE marker, boss 1
    'Dohn Mheg Laughing Leap': '2294',
    // Ground AoE marker, boss 1
    'Dohn Mheg Swinge': '22CA',
    // Frontal cone, boss 2
    'Dohn Mheg Canopy': '3DB0',
    // Frontal cone, Dohnfaust Rowans throughout instance
    'Dohn Mheg Pinecone Bomb': '3DB1',
    // Circular ground AoE marker, Dohnfaust Rowans throughout instance
    'Dohn Mheg Bile Bombardment': '34EE',
    // Ground AoE marker, boss 3
    'Dohn Mheg Corrosive Bile': '34EC',
    // Frontal cone, boss 3
    'Dohn Mheg Flailing Tentacles': '3681'
  },
  triggers: [{
    id: 'Dohn Mheg Imp Choir',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '46E'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'Dohn Mheg Toad Choir',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '1B7'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'Dohn Mheg Fool\'s Tumble',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '183'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/heroes_gauntlet.js


 // TODO: Berserker 2nd/3rd wild anguish should be shared with just a rock

/* harmony default export */ const heroes_gauntlet = ({
  zoneId: zone_id/* default.TheHeroesGauntlet */.Z.TheHeroesGauntlet,
  damageWarn: {
    'THG Blade\'s Benison': '5228',
    // pld conal
    'THG Absolute Holy': '524B',
    // whm very large aoe
    'THG Hissatsu: Goka': '523D',
    // sam line aoe
    'THG Whole Self': '522D',
    // mnk wide line aoe
    'THG Randgrith': '5232',
    // drg very big line aoe
    'THG Vacuum Blade 1': '5061',
    // Spectral Thief circular ground aoe from marker
    'THG Vacuum Blade 2': '5062',
    // Spectral Thief circular ground aoe from marker
    'THG Coward\'s Cunning': '4FD7',
    // Spectral Thief Chicken Knife laser
    'THG Papercutter 1': '4FD1',
    // Spectral Thief line aoe from marker
    'THG Papercutter 2': '4FD2',
    // Spectral Thief line aoe from marker
    'THG Ring of Death': '5236',
    // drg circular aoe
    'THG Lunar Eclipse': '5227',
    // pld circular aoe
    'THG Absolute Gravity': '5248',
    // ink mage circular
    'THG Rain of Light': '5242',
    // bard large circule aoe
    'THG Dooming Force': '5239',
    // drg line aoe
    'THG Absolute Dark II': '4F61',
    // Necromancer 120 degree conal
    'THG Burst': '53B7',
    // Necromancer necroburst small zombie explosion
    'THG Pain Mire': '4FA4',
    // Necromancer very large green bleed puddle
    'THG Dark Deluge': '4F5D',
    // Necromancer ground aoe
    'THG Tekka Gojin': '523E',
    // sam 90 degree conal
    'THG Raging Slice 1': '520A',
    // Berserker line cleave
    'THG Raging Slice 2': '520B',
    // Berserker line cleave
    'THG Wild Rage': '5203' // Berserker blue knockback puck

  },
  shareWarn: {
    'THG Absolute Thunder IV': '5245',
    // headmarker aoe from blm
    'THG Moondiver': '5233',
    // headmarker aoe from drg
    'THG Spectral Gust': '53CF' // Spectral Thief headmarker aoe

  },
  shareFail: {
    'THG Falling Rock': '5205' // Berserker headmarker aoe that creates rubble

  },
  gainsEffectWarn: {
    'THG Bleeding': '828' // Standing in the Necromancer puddle or outside the Berserker arena

  },
  gainsEffectFail: {
    'THG Truly Berserk': '906' // Standing in the crater too long

  },
  soloWarn: {
    // This should always be shared.  On all times but the 2nd and 3rd, it's a party share.
    // TODO: on the 2nd and 3rd time this should only be shared with a rock.
    // TODO: alternatively warn on taking one of these with a 472 Magic Vulnerability Up effect
    'THG Wild Anguish': '5209'
  },
  triggers: [{
    id: 'THG Wild Rampage',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '5207',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // This is zero damage if you are in the crater.
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/holminster_switch.js

/* harmony default export */ const holminster_switch = ({
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
    'Holminster Left Knout': '3DE7'
  },
  damageFail: {
    'Holminster Aethersup': '3DE9'
  },
  shareWarn: {
    'Holminster Flagellation': '3DD6'
  },
  shareFail: {
    'Holminster Taphephobia': '4181'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/malikahs_well.js

/* harmony default export */ const malikahs_well = ({
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
    'Malikah Earthshake': '3E39'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/matoyas_relict.js
 // TODO: could include 5484 Mudman Rocky Roll as a shareWarn, but it's low damage and common.

/* harmony default export */ const matoyas_relict = ({
  zoneId: zone_id/* default.MatoyasRelict */.Z.MatoyasRelict,
  damageWarn: {
    'Matoya Relict Werewood Ovation': '5518',
    // line aoe
    'Matoya Cave Tarantula Hawk Apitoxin': '5519',
    // big circle aoe
    'Matoya Spriggan Stonebearer Romp': '551A',
    // conal aoe
    'Matoya Sonny Of Ziggy Jittering Glare': '551C',
    // long narrow conal aoe
    'Matoya Mudman Quagmire': '5481',
    // Mudman aoe puddles
    'Matoya Mudman Brittle Breccia 1': '548E',
    // expanding circle aoe
    'Matoya Mudman Brittle Breccia 2': '548F',
    // expanding circle aoe
    'Matoya Mudman Brittle Breccia 3': '5490',
    // expanding circle aoe
    'Matoya Mudman Mud Bubble': '5487',
    // standing in mud puddle?
    'Matoya Cave Pugil Screwdriver': '551E',
    // conal aoe
    'Matoya Nixie Gurgle': '5992',
    // Nixie wall flush
    'Matoya Relict Molten Phoebad Pyroclastic Shot': '57EB',
    // the line aoes as you run to trash
    'Matoya Relict Flan Flood': '5523',
    // big circle aoe
    'Matoya Pyroduct Eldthurs Mash': '5527',
    // line aoe
    'Matyoa Pyroduct Eldthurs Spin': '5528',
    // very large circle aoe
    'Matoya Relict Bavarois Thunder III': '5525',
    // circle aoe
    'Matoya Relict Marshmallow Ancient Aero': '5524',
    // very large line groaoe
    'Matoya Relict Pudding Fire II': '5522',
    // circle aoe
    'Matoya Relict Molten Phoebad Hot Lava': '57E9',
    // conal aoe
    'Matoya Relict Molten Phoebad Volcanic Drop': '57E8',
    // circle aoe
    'Matoya Mother Porxie Medium Rear': '591D',
    // knockback into safe circle aoe
    'Matoya Mother Porxie Barbeque Line': '5917',
    // line aoe during bbq
    'Matoya Mother Porxie Barbeque Circle': '5918',
    // circle aoe during bbq
    'Matoya Mother Porxie To A Crisp': '5925',
    // getting to close to boss during bbq
    'Matoya Mother Proxie Buffet': '5926' // Aeolian Cave Sprite line aoe (is this a pun?)

  },
  damageFail: {
    'Matoya Nixie Sea Shanty': '598C' // Not taking the puddle up to the top? Failing add enrage?

  },
  shareWarn: {
    'Matoya Nixie Crack': '5990',
    // Nixie Crash-Smash tank tethers
    'Matoya Nixie Sputter': '5993' // Nixie spread marker

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/mt_gulg.js

/* harmony default export */ const mt_gulg = ({
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
    'Gulg Vena Amoris': '3D27'
  },
  damageFail: {
    'Gulg Lumen Infinitum': '41B2',
    'Gulg Right Palm': '37F8',
    'Gulg Left Palm': '37FA'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/paglthan.js
 // TODO: What to do about Kahn Rai 5B50?
// It seems impossible for the marked person to avoid entirely.

/* harmony default export */ const paglthan = ({
  zoneId: zone_id/* default.Paglthan */.Z.Paglthan,
  damageWarn: {
    'Paglthan Telovouivre Plague Swipe': '60FC',
    // frontal conal cleave
    'Paglthan Lesser Telodragon Engulfing Flames': '60F5',
    // frontal conal cleave
    'Paglthan Amhuluk Lightning Bolt': '5C4C',
    // circular lightning aoe (on self or post)
    'Paglthan Amhuluk Ball Of Levin Shock': '5C52',
    // pulsing small circular aoes
    'Paglthan Amhuluk Supercharged Ball Of Levin Shock': '5C53',
    // pulsing large circular aoe
    'Paglthan Amhuluk Wide Blaster': '60C5',
    // rear conal cleave
    'Paglthan Telobrobinyak Fall Of Man': '6148',
    // circular aoe
    'Paglthan Telotek Reaper Magitek Cannon': '6121',
    // circular aoe
    'Paglthan Telodragon Sheet of Ice': '60F8',
    // circular aoe
    'Paglthan Telodragon Frost Breath': '60F7',
    // very large conal cleave
    'Paglthan Magitek Core Stable Cannon': '5C94',
    // large line aoes
    'Paglthan Magitek Core 2-Tonze Magitek Missile': '5C95',
    // large circular aoe
    'Paglthan Telotek Sky Armor Aethershot': '5C9C',
    // circular aoe
    'Paglthan Mark II Telotek Colossus Exhaust': '5C99',
    // large line aoe
    'Paglthan Magitek Missile Explosive Force': '5C98',
    // slow moving horizontal missiles
    'Paglthan Tiamat Flamisphere': '610F',
    // very long line aoe
    'Paglthan Armored Telodragon Tortoise Stomp': '614B',
    // large circular aoe from turtle
    'Paglthan Telodragon Thunderous Breath': '6149',
    // large conal cleave
    'Paglthan Lunar Bahamut Lunar Nail Upburst': '605B',
    // small aoes before Big Burst
    'Paglthan Lunar Bahamut Lunar Nail Big Burst': '5B48',
    // large circular aoes from nails
    'Paglthan Lunar Bahamut Perigean Breath': '5B59',
    // large conal cleave
    'Paglthan Lunar Bahamut Megaflare': '5B4E',
    // megaflare pepperoni
    'Paglthan Lunar Bahamut Megaflare Dive': '5B52',
    // megaflare line aoe across the arena
    'Paglthan Lunar Bahamut Lunar Flare': '5B4A' // large purple shrinking circles

  },
  shareWarn: {
    'Paglthan Lunar Bahamut Megaflare': '5B4D' // megaflare spread markers

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/qitana_ravel.js

/* harmony default export */ const qitana_ravel = ({
  zoneId: zone_id/* default.TheQitanaRavel */.Z.TheQitanaRavel,
  damageWarn: {
    'Qitana Sun Toss': '3C8A',
    // Ground AoE, boss one
    'Qitana Ronkan Light 1': '3C8C',
    // Statue attack, boss one
    'Qitana Lozatl\'s Fury 1': '3C8F',
    // Semicircle cleave, boss one
    'Qitana Lozatl\'s Fury 2': '3C90',
    // Semicircle cleave, boss one
    'Qitana Falling Rock': '3C96',
    // Small ground AoE, boss two
    'Qitana Falling Boulder': '3C97',
    // Large ground AoE, boss two
    'Qitana Towerfall': '3C98',
    // Pillar collapse, boss two
    'Qitana Viper Poison 2': '3C9E',
    // Stationary poison puddles, boss three
    'Qitana Confession of Faith 1': '3CA2',
    // Dangerous middle during spread circles, boss three
    'Qitana Confession of Faith 3': '3CA6',
    // Dangerous sides during stack marker, boss three
    'Qitana Confession of Faith 4': '3CA7',
    // Dangerous sides during stack marker, boss three
    'Qitana Ronkan Light 2': '3D6D',
    // Statue attack, boss one
    'Qitana Wrath of the Ronka': '3E2C',
    // Statue line attack from mini-bosses before first boss
    'Qitana Sinspitter': '3E36',
    // Gorilla boulder toss AoE before third boss
    'Qitana Hound out of Heaven': '42B8',
    // Tether extension failure, boss three; 42B7 is correct execution
    'Qitana Ronkan Abyss': '43EB' // Ground AoE from mini-bosses before first boss

  },
  shareWarn: {
    'Qitana Viper Poison 1': '3C9D',
    // AoE from the 00AB poison head marker, boss three
    'Qitana Confession of Faith 2': '3CA3' // Overlapped circles failure on the spread circles version of the mechanic

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/the_grand_cosmos.js
 // The Grand Cosmos

/* harmony default export */ const the_grand_cosmos = ({
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
    'Cosmos Fire\'s Domain Tether': '475F'
  },
  shareWarn: {
    'Cosmos Dark Well': '476D',
    'Cosmos Far Wind Spread': '4724',
    'Cosmos Black Flame': '475D',
    'Cosmos Fire\'s Domain': '4760'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/twinning.js

/* harmony default export */ const twinning = ({
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
    'Twinning High Gravity': '3DFA'
  },
  damageFail: {
    'Twinning 128 Tonze Swipe': '3DBA'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae.js


 // TODO: Dead Iron 5AB0 (earthshakers, but only if you take two?)

/* harmony default export */ const delubrum_reginae = ({
  zoneId: zone_id/* default.DelubrumReginae */.Z.DelubrumReginae,
  damageWarn: {
    'Delubrum Seeker Mercy Fourfold': '5B34',
    // Four glowing sword half room cleaves
    'Delubrum Seeker Baleful Swathe': '5AB4',
    // Ground aoe to either side of boss
    'Delubrum Seeker Baleful Blade': '5B28',
    // Hide behind pillars attack
    'Delubrum Seeker Iron Splitter Blue 1': '5AA4',
    // Blue ring explosion
    'Delubrum Seeker Iron Splitter Blue 2': '5AA5',
    // Blue ring explosion
    'Delubrum Seeker Iron Splitter Blue 3': '5AA6',
    // Blue ring explosion
    'Delubrum Seeker Iron Splitter White 1': '5AA7',
    // White ring explosion
    'Delubrum Seeker Iron Splitter White 2': '5AA8',
    // White ring explosion
    'Delubrum Seeker Iron Splitter White 3': '5AA9',
    // White ring explosion
    'Delubrum Seeker Scorching Shackle': '5AAE',
    // Chain damage
    'Delubrum Seeker Merciful Breeze': '5AAB',
    // Waffle criss-cross floor markers
    'Delubrum Seeker Merciful Blooms': '5AAD',
    // Purple growing circle
    'Delubrum Dahu Right-Sided Shockwave': '5761',
    // Right circular cleave
    'Delubrum Dahu Left-Sided Shockwave': '5762',
    // Left circular cleave
    'Delubrum Dahu Firebreathe': '5765',
    // Conal breath
    'Delubrum Dahu Firebreathe Rotating': '575A',
    // Conal breath, rotating
    'Delubrum Dahu Head Down': '5756',
    // line aoe charge from Marchosias add
    'Delubrum Dahu Hunter\'s Claw': '5757',
    // circular ground aoe centered on Marchosias add
    'Delubrum Dahu Falling Rock': '575C',
    // ground aoe from Reverberating Roar
    'Delubrum Dahu Hot Charge': '5764',
    // double charge
    'Delubrum Dahu Ripper Claw': '575D',
    // frontal cleave
    'Delubrum Dahu Tail Swing': '575F',
    // tail swing ;)
    'Delubrum Guard Pawn Off': '5806',
    // Queen's Soldier Secrets Revealed tethered clone aoe
    'Delubrum Guard Turret\'s Tour 1': '580D',
    // Queen's Gunner reflective turret shot
    'Delubrum Guard Turret\'s Tour 2': '580E',
    // Queen's Gunner reflective turret shot
    'Delubrum Guard Turret\'s Tour 3': '580F',
    // Queen's Gunner reflective turret shot
    'Delubrum Guard Optimal Play Shield': '57F3',
    // Queen's Knight shield get under
    'Delubrum Guard Optimal Play Sword': '57F2',
    // Queen's Knight sword get out
    'Delubrum Guard Counterplay': '57F6',
    // Hitting aetherial ward directional barrier
    'Delubrum Phantom Swirling Miasma 1': '57A9',
    // Initial phantom donut aoe from circle
    'Delubrum Phantom Swirling Miasma 2': '57AA',
    // Moving phantom donut aoes from circle
    'Delubrum Phantom Creeping Miasma': '57A5',
    // phantom line aoe from square
    'Delubrum Phantom Vile Wave': '57B1',
    // phantom conal aoe
    'Delubrum Avowed Fury Of Bozja': '5973',
    // Trinity Avowed Allegiant Arsenal "out"
    'Delubrum Avowed Flashvane': '5972',
    // Trinity Avowed Allegiant Arsenal "get behind"
    'Delubrum Avowed Infernal Slash': '5971',
    // Trinity Avowed Allegiant Arsenal "get front"
    'Delubrum Avowed Flames Of Bozja': '5968',
    // 80% floor aoe before shimmering shot swords
    'Delubrum Avowed Gleaming Arrow': '5974',
    // Trinity Avatar line aoes from outside
    'Delubrum Queen The Means 1': '59BB',
    // The Queen's Beck and Call cross aoe from adds
    'Delubrum Queen The Means 2': '59BD',
    // The Queen's Beck and Call cross aoe from adds
    'Delubrum Queen The End 1': '59BA',
    // Also The Queen's Beck and Call cross aoe from adds
    'Delubrum Queen The End 2': '59BC',
    // Also The Queen's Beck and Call cross aoe from adds
    'Delubrum Queen Northswain\'s Glow': '59C4',
    // expanding lines with explosion intersections
    'Delubrum Queen Judgment Blade Left': '5B83',
    // dash across room with left cleave
    'Delubrum Queen Judgment Blade Right': '5B83',
    // dash across room with right cleave
    'Delubrum Queen Queen\'s Justice': '59BF',
    // failing to walk the right number of squares
    'Delubrum Queen Turret\'s Tour 1': '59E0',
    // reflective turret shot during Queen
    'Delubrum Queen Turret\'s Tour 2': '59E1',
    // reflective turret shot during Queen
    'Delubrum Queen Turret\'s Tour 3': '59E2',
    // reflective turret shot during Queen
    'Delubrum Queen Pawn Off': '59DA',
    // Secrets Revealed tethered clone aoe during Queen
    'Delubrum Queen Optimal Play Shield': '59CE',
    // Queen's Knight shield get under during Queen
    'Delubrum Queen Optimal Play Sword': '59CC' // Queen's Knight sword get out during Queen

  },
  damageFail: {
    'Delubrum Hidden Trap Massive Explosion': '5A6E',
    // explosion trap
    'Delubrum Hidden Trap Poison Trap': '5A6F',
    // poison trap
    'Delubrum Avowed Heat Shock': '595E',
    // too much heat or failing to regulate temperature
    'Delubrum Avowed Cold Shock': '595F' // too much cold or failing to regulate temperature

  },
  shareFail: {
    'Delubrum Dahu Heat Breath': '5766',
    // tank cleave
    'Delubrum Avowed Wrath Of Bozja': '5975' // tank cleave

  },
  gainsEffectWarn: {
    'Delubrum Seeker Merciful Moon': '262' // "Petrification" from Aetherial Orb lookaway

  },
  triggers: [{
    // At least during The Queen, these ability ids can be ordered differently,
    // and the first explosion "hits" everyone, although with "1B" flags.
    id: 'Delubrum Lots Cast',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['565A', '565B', '57FD', '57FE', '5B86', '5B87', '59D2', '5D93'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, _data, matches) => matches.flags.slice(-2) === '03',
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae_savage.js


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

/* harmony default export */ const delubrum_reginae_savage = ({
  zoneId: zone_id/* default.DelubrumReginaeSavage */.Z.DelubrumReginaeSavage,
  damageWarn: {
    'DelubrumSav Seeker Slimes Hellish Slash': '57EA',
    // Bozjan Soldier cleave
    'DelubrumSav Seeker Slimes Viscous Rupture': '5016',
    // Fully merged viscous slime aoe
    'DelubrumSav Seeker Golems Demolish': '5880',
    // interruptible Ruins Golem cast
    'DelubrumSav Seeker Baleful Swathe': '5AD1',
    // Ground aoe to either side of boss
    'DelubrumSav Seeker Baleful Blade': '5B2A',
    // Hide behind pillars attack
    'DelubrumSav Seeker Scorching Shackle': '5ACB',
    // Chains
    'DelubrumSav Seeker Mercy Fourfold 1': '5B94',
    // Four glowing sword half room cleaves
    'DelubrumSav Seeker Mercy Fourfold 2': '5AB9',
    // Four glowing sword half room cleaves
    'DelubrumSav Seeker Mercy Fourfold 3': '5ABA',
    // Four glowing sword half room cleaves
    'DelubrumSav Seeker Mercy Fourfold 4': '5ABB',
    // Four glowing sword half room cleaves
    'DelubrumSav Seeker Mercy Fourfold 5': '5ABC',
    // Four glowing sword half room cleaves
    'DelubrumSav Seeker Merciful Breeze': '5AC8',
    // Waffle criss-cross floor markers
    'DelubrumSav Seeker Baleful Comet': '5AD7',
    // Clone meteor dropping before charges
    'DelubrumSav Seeker Baleful Firestorm': '5AD8',
    // Clone charge after Baleful Comet
    'DelubrumSav Seeker Iron Rose': '5AD9',
    // Clone line aoes
    'DelubrumSav Seeker Iron Splitter Blue 1': '5AC1',
    // Blue rin g explosion
    'DelubrumSav Seeker Iron Splitter Blue 2': '5AC2',
    // Blue ring explosion
    'DelubrumSav Seeker Iron Splitter Blue 3': '5AC3',
    // Blue ring explosion
    'DelubrumSav Seeker Iron Splitter White 1': '5AC4',
    // White ring explosion
    'DelubrumSav Seeker Iron Splitter White 2': '5AC5',
    // White ring explosion
    'DelubrumSav Seeker Iron Splitter White 3': '5AC6',
    // White ring explosion
    'DelubrumSav Seeker Act Of Mercy': '5ACF',
    // cross-shaped line aoes
    'DelubrumSav Dahu Right-Sided Shockwave 1': '5770',
    // Right circular cleave
    'DelubrumSav Dahu Right-Sided Shockwave 2': '5772',
    // Right circular cleave
    'DelubrumSav Dahu Left-Sided Shockwave 1': '576F',
    // Left circular cleave
    'DelubrumSav Dahu Left-Sided Shockwave 2': '5771',
    // Left circular cleave
    'DelubrumSav Dahu Firebreathe': '5774',
    // Conal breath
    'DelubrumSav Dahu Firebreathe Rotating': '576C',
    // Conal breath, rotating
    'DelubrumSav Dahu Head Down': '5768',
    // line aoe charge from Marchosias add
    'DelubrumSav Dahu Hunter\'s Claw': '5769',
    // circular ground aoe centered on Marchosias add
    'DelubrumSav Dahu Falling Rock': '576E',
    // ground aoe from Reverberating Roar
    'DelubrumSav Dahu Hot Charge': '5773',
    // double charge
    'DelubrumSav Duel Massive Explosion': '579E',
    // bombs being cleared
    'DelubrumSav Duel Vicious Swipe': '5797',
    // circular aoe around boss
    'DelubrumSav Duel Focused Tremor 1': '578F',
    // square floor aoes
    'DelubrumSav Duel Focused Tremor 2': '5791',
    // square floor aoes
    'DelubrumSav Duel Devour': '5789',
    // conal aoe after withering curse
    'DelubrumSav Duel Flailing Strike 1': '578C',
    // initial rotating cleave
    'DelubrumSav Duel Flailing Strike 2': '578D',
    // rotating cleaves
    'DelubrumSav Guard Optimal Offensive Sword': '5819',
    // middle explosion
    'DelubrumSav Guard Optimal Offensive Shield': '581A',
    // middle explosion
    'DelubrumSav Guard Optimal Play Sword': '5816',
    // Optimal Play Sword "get out"
    'DelubrumSav Guard Optimal Play Shield': '5817',
    // Optimal play shield "get in"
    'DelubrumSav Guard Optimal Play Cleave': '5818',
    // Optimal Play cleaves for sword/shield
    'DelubrumSav Guard Unlucky Lot': '581D',
    // Queen's Knight orb explosion
    'DelubrumSav Guard Burn 1': '583D',
    // small fire adds
    'DelubrumSav Guard Burn 2': '583E',
    // large fire adds
    'DelubrumSav Guard Pawn Off': '583A',
    // Queen's Soldier Secrets Revealed tethered clone aoe
    'DelubrumSav Guard Turret\'s Tour Normal 1': '5847',
    // "normal mode" turrets, initial lines 1
    'DelubrumSav Guard Turret\'s Tour Normal 2': '5848',
    // "normal mode" turrets, initial lines 2
    'DelubrumSav Guard Turret\'s Tour Normal 3': '5849',
    // "normal mode" turrets, second lines
    'DelubrumSav Guard Counterplay': '58F5',
    // Hitting aetherial ward directional barrier
    'DelubrumSav Phantom Swirling Miasma 1': '57B8',
    // Initial phantom donut aoe
    'DelubrumSav Phantom Swirling Miasma 2': '57B9',
    // Moving phantom donut aoes
    'DelubrumSav Phantom Creeping Miasma 1': '57B4',
    // Initial phantom line aoe
    'DelubrumSav Phantom Creeping Miasma 2': '57B5',
    // Later phantom line aoe
    'DelubrumSav Phantom Lingering Miasma 1': '57B6',
    // Initial phantom circle aoe
    'DelubrumSav Phantom Lingering Miasma 2': '57B7',
    // Moving phantom circle aoe
    'DelubrumSav Phantom Vile Wave': '57BF',
    // phantom conal aoe
    'DelubrumSav Avowed Fury Of Bozja': '594C',
    // Trinity Avowed Allegiant Arsenal "out"
    'DelubrumSav Avowed Flashvane': '594B',
    // Trinity Avowed Allegiant Arsenal "get behind"
    'DelubrumSav Avowed Infernal Slash': '594A',
    // Trinity Avowed Allegiant Arsenal "get front"
    'DelubrumSav Avowed Flames Of Bozja': '5939',
    // 80% floor aoe before shimmering shot swords
    'DelubrumSav Avowed Gleaming Arrow': '594D',
    // Trinity Avatar line aoes from outside
    'DelubrumSav Lord Whack': '57D0',
    // cleave
    'DelubrumSav Lord Devastating Bolt 1': '57C5',
    // lightning rings
    'DelubrumSav Lord Devastating Bolt 2': '57C6',
    // lightning rings
    'DelubrumSav Lord Electrocution': '57CC',
    // random circle aoes
    'DelubrumSav Lord Rapid Bolts': '57C3',
    // dropped lightning aoes
    'DelubrumSav Lord 1111-Tonze Swing': '57D8',
    // very large "get out" swing
    'DelubrumSav Lord Monk Attack': '55A6',
    // Monk add auto-attack
    'DelubrumSav Queen Northswain\'s Glow': '59F4',
    // expanding lines with explosion intersections
    'DelubrumSav Queen The Means 1': '59E7',
    // The Queen's Beck and Call cross aoe from adds
    'DelubrumSav Queen The Means 2': '59EA',
    // The Queen's Beck and Call cross aoe from adds
    'DelubrumSav Queen The End 1': '59E8',
    // Also The Queen's Beck and Call cross aoe from adds
    'DelubrumSav Queen The End 2': '59E9',
    // Also The Queen's Beck and Call cross aoe from adds
    'DelubrumSav Queen Optimal Offensive Sword': '5A02',
    // middle explosion
    'DelubrumSav Queen Optimal Offensive Shield': '5A03',
    // middle explosion
    'DelubrumSav Queen Judgment Blade Left 1': '59F2',
    // dash across room with left cleave
    'DelubrumSav Queen Judgment Blade Left 2': '5B85',
    // dash across room with left cleave
    'DelubrumSav Queen Judgment Blade Right 1': '59F1',
    // dash across room with right cleave
    'DelubrumSav Queen Judgment Blade Right 2': '5B84',
    // dash across room with right cleave
    'DelubrumSav Queen Pawn Off': '5A1D',
    // Queen's Soldier Secrets Revealed tethered clone aoe
    'DelubrumSav Queen Optimal Play Sword': '59FF',
    // Optimal Play Sword "get out"
    'DelubrumSav Queen Optimal Play Shield': '5A00',
    // Optimal play shield "get in"
    'DelubrumSav Queen Optimal Play Cleave': '5A01',
    // Optimal Play cleaves for sword/shield
    'DelubrumSav Queen Turret\'s Tour Normal 1': '5A28',
    // "normal mode" turrets, initial lines 1
    'DelubrumSav Queen Turret\'s Tour Normal 2': '5A2A',
    // "normal mode" turrets, initial lines 2
    'DelubrumSav Queen Turret\'s Tour Normal 3': '5A29' // "normal mode" turrets, second lines

  },
  damageFail: {
    'DelubrumSav Avowed Heat Shock': '5927',
    // too much heat or failing to regulate temperature
    'DelubrumSav Avowed Cold Shock': '5928',
    // too much cold or failing to regulate temperature
    'DelubrumSav Queen Queen\'s Justice': '59EB',
    // failing to walk the right number of squares
    'DelubrumSav Queen Gunnhildr\'s Blades': '5B22',
    // not being in the chess blue safe square
    'DelubrumSav Queen Unlucky Lot': '55B6' // lightning orb attack

  },
  shareWarn: {
    'DelubrumSav Seeker Phantom Baleful Onslaught': '5AD6',
    // solo tank cleave
    'DelubrumSav Lord Foe Splitter': '57D7' // tank cleave

  },
  gainsEffectWarn: {
    'DelubrumSav Seeker Merciful Moon': '262' // "Petrification" from Aetherial Orb lookaway

  },
  triggers: [{
    // These ability ids can be ordered differently and "hit" people when levitating.
    id: 'DelubrumSav Guard Lots Cast',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['5827', '5828', '5B6C', '5B6D', '5BB6', '5BB7', '5B88', '5B89'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, _data, matches) => matches.flags.slice(-2) === '03',
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'DelubrumSav Golem Compaction',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5746'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        fullText: `${matches.source}: ${matches.ability}`
      };
    }
  }, {
    id: 'DelubrumSav Slime Sanguine Fusion',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '554D'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        fullText: `${matches.source}: ${matches.ability}`
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1n.js

/* harmony default export */ const e1n = ({
  zoneId: zone_id/* default.EdensGateResurrection */.Z.EdensGateResurrection,
  damageWarn: {
    'E1N Eden\'s Thunder III': '44ED',
    'E1N Eden\'s Blizzard III': '44EC',
    'E1N Pure Beam': '3D9E',
    'E1N Paradise Lost': '3DA0'
  },
  damageFail: {
    'E1N Eden\'s Flare': '3D97',
    'E1N Pure Light': '3DA3'
  },
  shareFail: {
    'E1N Fire III': '44EB',
    'E1N Vice Of Vanity': '44E7',
    // tank lasers
    'E1N Vice Of Apathy': '44E8' // dps puddles

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1s.js
 // TODO: failing to interrupt Mana Boost (3D8D)
// TODO: failing to pass healer debuff?
// TODO: what happens if you don't kill a meteor during four orbs?

/* harmony default export */ const e1s = ({
  zoneId: zone_id/* default.EdensGateResurrectionSavage */.Z.EdensGateResurrectionSavage,
  damageWarn: {
    'E1S Eden\'s Thunder III': '44F7',
    'E1S Eden\'s Blizzard III': '44F6',
    'E1S Eden\'s Regained Blizzard III': '44FA',
    'E1S Pure Beam Trident 1': '3D83',
    'E1S Pure Beam Trident 2': '3D84',
    'E1S Paradise Lost': '3D87'
  },
  damageFail: {
    'E1S Eden\'s Flare': '3D73',
    'E1S Pure Light': '3D8A'
  },
  shareFail: {
    'E1S Fire/Thunder III': '44FB',
    'E1S Pure Beam Single': '3D81',
    'E1S Vice Of Vanity': '44F1',
    // tank lasers
    'E1S Vice of Apathy': '44F2' // dps puddles

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e2n.js


 // TODO: shadoweye failure (top line fail, bottom line success, effect there too)
// [16:17:35.966] 16:400110FE:Voidwalker:40B7:Shadoweye:10612345:Tini Poutini:F:10000:100190F:
// [16:17:35.966] 16:400110FE:Voidwalker:40B7:Shadoweye:1067890A:Potato Chippy:1:0:1C:8000:
// gains the effect of Petrification from Voidwalker for 10.00 Seconds.
// TODO: puddle failure?

/* harmony default export */ const e2n = ({
  zoneId: zone_id/* default.EdensGateDescent */.Z.EdensGateDescent,
  damageWarn: {
    'E2N Doomvoid Slicer': '3E3C',
    'E2N Doomvoid Guillotine': '3E3B'
  },
  triggers: [{
    id: 'E2N Nyx',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '3E3D',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: {
          en: 'Booped',
          de: matches.ability,
          // FIXME
          fr: 'Malus de dégâts',
          ja: matches.ability,
          // FIXME
          cn: matches.ability,
          // FIXME
          ko: '닉스'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e2s.js


 // TODO: shadoweye failure
// TODO: Empty Hate (3E59/3E5A) hits everybody, so hard to tell about knockback
// TODO: maybe mark hell wind people who got clipped by stack?
// TODO: missing puddles?
// TODO: missing light/dark circle stack

/* harmony default export */ const e2s = ({
  zoneId: zone_id/* default.EdensGateDescentSavage */.Z.EdensGateDescentSavage,
  damageWarn: {
    'E2S Doomvoid Slicer': '3E50',
    'E3S Empty Rage': '3E6C',
    'E3S Doomvoid Guillotine': '3E4F'
  },
  shareWarn: {
    'E2S Doomvoid Cleaver': '3E64'
  },
  triggers: [{
    id: 'E2S Shadoweye',
    // Stone Curse
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '589'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'E2S Nyx',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '3E51',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: {
          en: 'Booped',
          de: matches.ability,
          // FIXME
          fr: 'Malus de dégâts',
          ja: matches.ability,
          // FIXME
          cn: matches.ability,
          // FIXME
          ko: '닉스'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3n.js

/* harmony default export */ const e3n = ({
  zoneId: zone_id/* default.EdensGateInundation */.Z.EdensGateInundation,
  damageWarn: {
    'E3N Monster Wave 1': '3FCA',
    'E3N Monster Wave 2': '3FE9',
    'E3N Maelstrom': '3FD9',
    'E3N Swirling Tsunami': '3FD5'
  },
  damageFail: {
    'E3N Temporary Current 1': '3FCE',
    'E3N Temporary Current 2': '3FCD',
    'E3N Spinning Dive': '3FDB'
  },
  shareFail: {
    'E3N Rip Current': '3FC7'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3s.js
 // TODO: Scouring Tsunami (3CE0) on somebody other than target
// TODO: Sweeping Tsunami (3FF5) on somebody other than tanks
// TODO: Rip Current (3FE0, 3FE1) on somebody other than target/tanks
// TODO: Boiled Alive (4006) is failing puddles???
// TODO: failing to cleanse Splashing Waters
// TODO: does getting hit by undersea quake cause an ability?

/* harmony default export */ const e3s = ({
  zoneId: zone_id/* default.EdensGateInundationSavage */.Z.EdensGateInundationSavage,
  damageWarn: {
    'E3S Monster Wave 1': '3FE5',
    'E3S Monster Wave 2': '3FE9',
    'E3S Maelstrom': '3FFB',
    'E3S Swirling Tsunami': '3FF4'
  },
  damageFail: {
    'E3S Temporary Current 1': '3FEA',
    'E3S Temporary Current 2': '3FEB',
    'E3S Temporary Current 3': '3FEC',
    'E3S Temporary Current 4': '3FED',
    'E3S Spinning Dive': '3FFD'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e4n.js

/* harmony default export */ const e4n = ({
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
    'E4N Fault Line': '4101'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e4s.js


 // TODO: could track people get hitting by markers they shouldn't
// TODO: could track non-tanks getting hit by tankbusters, megaliths
// TODO: could track non-target getting hit by tankbuster

/* harmony default export */ const e4s = ({
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
    'E4S Seismic Wave': '4110'
  },
  damageFail: {
    'E4S Dual Earthen Fists 1': '4135',
    'E4S Dual Earthen Fists 2': '4687',
    'E4S Plate Fracture': '43EA',
    'E4S Earthen Fist 1': '43CA',
    'E4S Earthen Fist 2': '43C9'
  },
  triggers: [{
    id: 'E4S Fault Line Collect',
    netRegex: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '411E',
      source: 'Titan'
    }),
    netRegexDe: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '411E',
      source: 'Titan'
    }),
    netRegexFr: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '411E',
      source: 'Titan'
    }),
    netRegexJa: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '411E',
      source: 'タイタン'
    }),
    netRegexCn: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '411E',
      source: '泰坦'
    }),
    netRegexKo: netregexes/* default.startsUsing */.Z.startsUsing({
      id: '411E',
      source: '타이탄'
    }),
    run: (_e, data, matches) => {
      data.faultLineTarget = matches.target;
    }
  }, {
    id: 'E4S Fault Line',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '411E',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.faultLineTarget !== matches.target,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: 'Run Over',
          de: matches.ability,
          // FIXME
          fr: 'A été écrasé(e)',
          ja: matches.ability,
          // FIXME
          cn: matches.ability,
          // FIXME
          ko: matches.ability // FIXME

        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5n.js



/* harmony default export */ const e5n = ({
  zoneId: zone_id/* default.EdensVerseFulmination */.Z.EdensVerseFulmination,
  damageWarn: {
    'E5N Impact': '4E3A',
    // Stratospear landing AoE
    'E5N Lightning Bolt': '4B9C',
    // Stormcloud standard attack
    'E5N Gallop': '4B97',
    // Sideways add charge
    'E5N Shock Strike': '4BA1',
    // Small AoE circles during Thunderstorm
    'E5N Volt Strike': '4CF2' // Large AoE circles during Thunderstorm

  },
  damageFail: {
    'E5N Judgment Jolt': '4B8F' // Stratospear explosions

  },
  triggers: [{
    // This happens when a player gets 4+ stacks of orbs. Don't be greedy!
    id: 'E5N Static Condensation',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8B5'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    // Helper for orb pickup failures
    id: 'E5N Orb Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8B4'
    }),
    run: (_e, data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = true;
    }
  }, {
    id: 'E5N Orb Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8B4'
    }),
    run: (_e, data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = false;
    }
  }, {
    id: 'E5N Divine Judgement Volts',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4B9A',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => !data.hasOrb[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: `${matches.ability} (no orb)`,
          de: `${matches.ability} (kein Orb)`,
          fr: `${matches.ability} (pas d'orbe)`,
          ja: `${matches.ability} (雷玉無し)`,
          cn: `${matches.ability} (没吃球)`
        }
      };
    }
  }, {
    id: 'E5N Stormcloud Target Tracking',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    run: (_e, data, matches) => {
      data.cloudMarkers = data.cloudMarkers || [];
      data.cloudMarkers.push(matches.target);
    }
  }, {
    // This ability is seen only if players stacked the clouds instead of spreading them.
    id: 'E5N The Parting Clouds',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4B9D',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 30,
    mistake: (_e, data, matches) => {
      for (const m of data.cloudMarkers) {
        return {
          type: 'fail',
          blame: data.cloudMarkers[m],
          text: {
            en: `${matches.ability} (clouds too close)`,
            de: `${matches.ability} (Wolken zu nahe)`,
            fr: `${matches.ability} (nuages trop proches)`,
            ja: `${matches.ability} (雲近すぎ)`,
            cn: `${matches.ability} (雷云重叠)`
          }
        };
      }
    }
  }, {
    id: 'E5N Stormcloud cleanup',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    delaySeconds: 30,
    // Stormclouds resolve well before this.
    run: (_e, data) => {
      delete data.cloudMarkers;
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5s.js


 // TODO: is there a different ability if the shield duty action isn't used properly?
// TODO: is there an ability from Raiden (the bird) if you get eaten?
// TODO: maybe chain lightning warning if you get hit while you have system shock (8B8)

const noOrb = str => {
  return {
    en: str + ' (no orb)',
    de: str + ' (kein Orb)',
    fr: str + ' (pas d\'orbe)',
    ja: str + ' (雷玉無し)',
    cn: str + ' (没吃球)',
    ko: str + ' (구슬 없음)'
  };
};

/* harmony default export */ const e5s = ({
  zoneId: zone_id/* default.EdensVerseFulminationSavage */.Z.EdensVerseFulminationSavage,
  damageWarn: {
    'E5S Impact': '4E3B',
    // Stratospear landing AoE
    'E5S Gallop': '4BB4',
    // Sideways add charge
    'E5S Shock Strike': '4BC1',
    // Small AoE circles during Thunderstorm
    'E5S Stepped Leader Twister': '4BC7',
    // Twister stepped leader
    'E5S Stepped Leader Donut': '4BC8',
    // Donut stepped leader
    'E5S Shock': '4E3D' // Hated of Levin Stormcloud-cleansable exploding debuff

  },
  damageFail: {
    'E5S Judgment Jolt': '4BA7' // Stratospear explosions

  },
  shareWarn: {
    'E5S Volt Strike Double': '4BC3',
    // Large AoE circles during Thunderstorm
    'E5S Crippling Blow': '4BCA',
    'E5S Chain Lightning Double': '4BC5'
  },
  triggers: [{
    // Helper for orb pickup failures
    id: 'E5S Orb Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8B4'
    }),
    run: (_e, data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = true;
    }
  }, {
    id: 'E5S Orb Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8B4'
    }),
    run: (_e, data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = false;
    }
  }, {
    id: 'E5S Divine Judgement Volts',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BB7',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: noOrb(matches.ability)
      };
    }
  }, {
    id: 'E5S Volt Strike Orb',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BC3',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: noOrb(matches.ability)
      };
    }
  }, {
    id: 'E5S Deadly Discharge Big Knockback',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BB2',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: noOrb(matches.ability)
      };
    }
  }, {
    id: 'E5S Lightning Bolt',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BB9',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => {
      // Having a non-idempotent condition function is a bit <_<
      // Only consider lightning bolt damage if you have a debuff to clear.
      if (!data.hated || !data.hated[matches.target]) return true;
      delete data.hated[matches.target];
      return false;
    },
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'E5S Hated of Levin',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '00D2'
    }),
    run: (_e, data, matches) => {
      data.hated = data.hated || {};
      data.hated[matches.target] = true;
    }
  }, {
    id: 'E5S Stormcloud Target Tracking',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    run: (_e, data, matches) => {
      data.cloudMarkers = data.cloudMarkers || [];
      data.cloudMarkers.push(matches.target);
    }
  }, {
    // This ability is seen only if players stacked the clouds instead of spreading them.
    id: 'E5S The Parting Clouds',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BBA',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 30,
    mistake: (_e, data, matches) => {
      for (const m of data.cloudMarkers) {
        return {
          type: 'fail',
          blame: data.cloudMarkers[m],
          text: {
            en: `${matches.ability} (clouds too close)`,
            de: `${matches.ability} (Wolken zu nahe)`,
            fr: `${matches.ability} (nuages trop proches)`,
            ja: `${matches.ability} (雲近すぎ)`,
            cn: `${matches.ability} (雷云重叠)`
          }
        };
      }
    }
  }, {
    id: 'E5S Stormcloud cleanup',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    // Stormclouds resolve well before this.
    delaySeconds: 30,
    run: (_e, data) => {
      delete data.cloudMarkers;
      delete data.hated;
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6n.js

/* harmony default export */ const e6n = ({
  zoneId: zone_id/* default.EdensVerseFuror */.Z.EdensVerseFuror,
  damageWarn: {
    'E6N Thorns': '4BDA',
    // AoE markers after Enumeration
    'E6N Ferostorm 1': '4BDD',
    'E6N Ferostorm 2': '4BE5',
    'E6N Storm Of Fury 1': '4BE0',
    // Circle AoE during tethers--Garuda
    'E6N Storm Of Fury 2': '4BE6',
    // Circle AoE during tethers--Raktapaksa
    'E6N Explosion': '4BE2',
    // AoE circles, Garuda orbs
    'E6N Heat Burst': '4BEC',
    'E6N Conflag Strike': '4BEE',
    // 270-degree frontal AoE
    'E6N Spike Of Flame': '4BF0',
    // Orb explosions after Strike Spark
    'E6N Radiant Plume': '4BF2',
    'E6N Eruption': '4BF4'
  },
  damageFail: {
    'E6N Vacuum Slice': '4BD5',
    // Dark line AoE from Garuda
    'E6N Downburst': '4BDB' // Blue knockback circle. Actual knockback is unknown ability 4C20

  },
  shareFail: {
    // Kills non-tanks who get hit by it.
    'E6N Instant Incineration': '4BED'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6s.js
 // TODO: check tethers being cut (when they shouldn't)
// TODO: check for concussed debuff
// TODO: check for taking tankbuster with lightheaded
// TODO: check for one person taking multiple Storm Of Fury Tethers (4C01/4C08)

/* harmony default export */ const e6s = ({
  zoneId: zone_id/* default.EdensVerseFurorSavage */.Z.EdensVerseFurorSavage,
  damageWarn: {
    // It's common to just ignore futbol mechanics, so don't warn on Strike Spark.
    // 'Spike Of Flame': '4C13', // Orb explosions after Strike Spark
    'E6S Thorns': '4BFA',
    // AoE markers after Enumeration
    'E6S Ferostorm 1': '4BFD',
    'E6S Ferostorm 2': '4C06',
    'E6S Storm Of Fury 1': '4C00',
    // Circle AoE during tethers--Garuda
    'E6S Storm Of Fury 2': '4C07',
    // Circle AoE during tethers--Raktapaksa
    'E6S Explosion': '4C03',
    // AoE circles, Garuda orbs
    'E6S Heat Burst': '4C1F',
    'E6S Conflag Strike': '4C10',
    // 270-degree frontal AoE
    'E6S Radiant Plume': '4C15',
    'E6S Eruption': '4C17',
    'E6S Wind Cutter': '4C02' // Tether-cutting line aoe

  },
  damageFail: {
    'E6S Vacuum Slice': '4BF5',
    // Dark line AoE from Garuda
    'E6S Downburst 1': '4BFB',
    // Blue knockback circle (Garuda).
    'E6S Downburst 2': '4BFC',
    // Blue knockback circle (Raktapaksa).
    'E6S Meteor Strike': '4C0F' // Frontal avoidable tank buster

  },
  shareWarn: {
    'E6S Hands of Hell': '4C0[BC]',
    // Tether charge
    'E6S Hands of Flame': '4C0A',
    // First Tankbuster
    'E6S Instant Incineration': '4C0E',
    // Second Tankbuster
    'E6S Blaze': '4C1B' // Flame Tornado Cleave

  },
  soloFail: {
    'E6S Air Bump': '4BF9'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7n.js




const wrongBuff = str => {
  return {
    en: str + ' (wrong buff)',
    de: str + ' (falscher Buff)',
    fr: str + ' (mauvais buff)',
    ja: str + ' (不適切なバフ)',
    cn: str + ' (Buff错了)',
    ko: str + ' (버프 틀림)'
  };
};

const noBuff = str => {
  return {
    en: str + ' (no buff)',
    de: str + ' (kein Buff)',
    fr: str + ' (pas de buff)',
    ja: str + ' (バフ無し)',
    cn: str + ' (没有Buff)',
    ko: str + '(버프 없음)'
  };
};

/* harmony default export */ const e7n = ({
  zoneId: zone_id/* default.EdensVerseIconoclasm */.Z.EdensVerseIconoclasm,
  damageWarn: {
    'E7N Stygian Sword': '4C55',
    // Circle ground AoEs after False Twilight
    'E7N Strength In Numbers Donut': '4C4C',
    // Large donut ground AoEs, intermission
    'E7N Strength In Numbers 2': '4C4D' // Large circle ground AoEs, intermission

  },
  shareWarn: {
    'E7N Stygian Stake': '4C33',
    // Laser tank buster, outside intermission phase
    'E5N Silver Shot': '4E7D' // Spread markers, intermission

  },
  triggers: [{
    id: 'E7N Astral Effect Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BE'
    }),
    run: (_e, data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = true;
    }
  }, {
    id: 'E7N Astral Effect Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BE'
    }),
    run: (_e, data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = false;
    }
  }, {
    id: 'E7N Umbral Effect Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BF'
    }),
    run: (_e, data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = true;
    }
  }, {
    id: 'E7N Umbral Effect Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BF'
    }),
    run: (_e, data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = false;
    }
  }, {
    id: 'E7N Light\'s Course',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C3E', '4C40', '4C22', '4C3C', '4E63'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => {
      return !data.hasUmbral || !data.hasUmbral[matches.target];
    },
    mistake: (_e, data, matches) => {
      if (data.hasAstral && data.hasAstral[matches.target]) return {
        type: 'fail',
        blame: matches.target,
        text: wrongBuff(matches.ability)
      };
      return {
        type: 'warn',
        blame: matches.target,
        text: noBuff(matches.ability)
      };
    }
  }, {
    id: 'E7N Darks\'s Course',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C3D', '4C23', '4C41', '4C43'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => {
      return !data.hasAstral || !data.hasAstral[matches.target];
    },
    mistake: (_e, data, matches) => {
      if (data.hasUmbral && data.hasUmbral[matches.target]) return {
        type: 'fail',
        blame: matches.target,
        text: wrongBuff(matches.ability)
      }; // This case is probably impossible, as the debuff ticks after death,
      // but leaving it here in case there's some rez or disconnect timing
      // that could lead to this.

      return {
        type: 'warn',
        blame: matches.target,
        text: noBuff(matches.ability)
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7s.js


 // TODO: missing an orb during tornado phase
// TODO: jumping in the tornado damage??
// TODO: taking sungrace(4C80) or moongrace(4C82) with wrong debuff
// TODO: stygian spear/silver spear with the wrong debuff
// TODO: taking explosion from the wrong Chiaro/Scuro orb
// TODO: handle 4C89 Silver Stake tankbuster 2nd hit, as it's ok to have two in.

const e7s_wrongBuff = str => {
  return {
    en: str + ' (wrong buff)',
    de: str + ' (falscher Buff)',
    fr: str + ' (mauvais buff)',
    ja: str + ' (不適切なバフ)',
    cn: str + ' (Buff错了)',
    ko: str + ' (버프 틀림)'
  };
};

const e7s_noBuff = str => {
  return {
    en: str + ' (no buff)',
    de: str + ' (kein Buff)',
    fr: str + ' (pas de buff)',
    ja: str + ' (バフ無し)',
    cn: str + ' (没有Buff)',
    ko: str + ' (버프 없음)'
  };
};

/* harmony default export */ const e7s = ({
  zoneId: zone_id/* default.EdensVerseIconoclasmSavage */.Z.EdensVerseIconoclasmSavage,
  damageWarn: {
    'E7S Silver Sword': '4C8E',
    // ground aoe
    'E7S Overwhelming Force': '4C73',
    // add phase ground aoe
    'E7S Strength in Numbers 1': '4C70',
    // add get under
    'E7S Strength in Numbers 2': '4C71',
    // add get out
    'E7S Paper Cut': '4C7D',
    // tornado ground aoes
    'E7S Buffet': '4C77' // tornado ground aoes also??

  },
  damageFail: {
    'E7S Betwixt Worlds': '4C6B',
    // purple ground line aoes
    'E7S Crusade': '4C58',
    // blue knockback circle (standing in it)
    'E7S Explosion': '4C6F' // didn't kill an add

  },
  shareWarn: {
    'E7S Stygian Stake': '4C34',
    // Laser tank buster 1
    'E7S Silver Shot': '4C92',
    // Spread markers
    'E7S Silver Scourge': '4C93',
    // Ice markers
    'E7S Chiaro Scuro Explosion 1': '4D14',
    // orb explosion
    'E7S Chiaro Scuro Explosion 2': '4D15' // orb explosion

  },
  triggers: [{
    // Interrupt
    id: 'E7S Advent Of Light',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4C6E'
    }),
    mistake: (_e, _data, matches) => {
      // TODO: is this blame correct? does this have a target?
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'E7S Astral Effect Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BE'
    }),
    run: (_e, data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = true;
    }
  }, {
    id: 'E7S Astral Effect Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BE'
    }),
    run: (_e, data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = false;
    }
  }, {
    id: 'E7S Umbral Effect Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BF'
    }),
    run: (_e, data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = true;
    }
  }, {
    id: 'E7S Umbral Effect Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BF'
    }),
    run: (_e, data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = false;
    }
  }, {
    id: 'E7S Light\'s Course',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C62', '4C63', '4C64', '4C5B', '4C5F'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => {
      return !data.hasUmbral || !data.hasUmbral[matches.target];
    },
    mistake: (_e, data, matches) => {
      if (data.hasAstral && data.hasAstral[matches.target]) return {
        type: 'fail',
        blame: matches.target,
        text: e7s_wrongBuff(matches.ability)
      };
      return {
        type: 'warn',
        blame: matches.target,
        text: e7s_noBuff(matches.ability)
      };
    }
  }, {
    id: 'E7S Darks\'s Course',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C65', '4C66', '4C67', '4C5A', '4C60'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => {
      return !data.hasAstral || !data.hasAstral[matches.target];
    },
    mistake: (_e, data, matches) => {
      if (data.hasUmbral && data.hasUmbral[matches.target]) return {
        type: 'fail',
        blame: matches.target,
        text: e7s_wrongBuff(matches.ability)
      }; // This case is probably impossible, as the debuff ticks after death,
      // but leaving it here in case there's some rez or disconnect timing
      // that could lead to this.

      return {
        type: 'warn',
        blame: matches.target,
        text: e7s_noBuff(matches.ability)
      };
    }
  }, {
    id: 'E7S Crusade Knockback',
    // 4C76 is the knockback damage, 4C58 is the damage for standing on the puck.
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4C76',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8n.js



/* harmony default export */ const e8n = ({
  zoneId: zone_id/* default.EdensVerseRefulgence */.Z.EdensVerseRefulgence,
  damageWarn: {
    'E8N Biting Frost': '4DDB',
    // 270-degree frontal AoE, Shiva
    'E8N Driving Frost': '4DDC',
    // Rear cone AoE, Shiva
    'E8N Frigid Stone': '4E66',
    // Small spread circles, phase 1
    'E8N Reflected Axe Kick': '4E00',
    // Large circle AoE, Frozen Mirror
    'E8N Reflected Scythe Kick': '4E01',
    // Donut AoE, Frozen Mirror
    'E8N Frigid Eruption': '4E09',
    // Small circle AoE puddles, phase 1
    'E8N Icicle Impact': '4E0A',
    // Large circle AoE puddles, phase 1
    'E8N Axe Kick': '4DE2',
    // Large circle AoE, Shiva
    'E8N Scythe Kick': '4DE3',
    // Donut AoE, Shiva
    'E8N Reflected Biting Frost': '4DFE',
    // 270-degree frontal AoE, Frozen Mirror
    'E8N Reflected Driving Frost': '4DFF' // Cone AoE, Frozen Mirror

  },
  damageFail: {},
  triggers: [{
    id: 'E8N Shining Armor',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '95'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'E8N Heavenly Strike',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4DD8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Pushed off!',
          de: 'Runter gestoßen!',
          fr: 'A été poussé(e) !',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백됨!'
        }
      };
    }
  }, {
    id: 'E8N Frost Armor',
    // Thin Ice
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38F'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Slid off!',
          de: 'runtergerutscht!',
          fr: 'A glissé(e) !',
          ja: '滑った',
          cn: '滑落',
          ko: '미끄러짐!'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8s.js

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

/* harmony default export */ const e8s = ({
  zoneId: zone_id/* default.EdensVerseRefulgenceSavage */.Z.EdensVerseRefulgenceSavage,
  damageWarn: {
    'E8S Biting Frost': '4D66',
    // 270-degree frontal AoE, Shiva
    'E8S Driving Frost': '4D67',
    // Rear cone AoE, Shiva
    'E8S Axe Kick': '4D6D',
    // Large circle AoE, Shiva
    'E8S Scythe Kick': '4D6E',
    // Donut AoE, Shiva
    'E8S Reflected Axe Kick': '4DB9',
    // Large circle AoE, Frozen Mirror
    'E8S Reflected Scythe Kick': '4DBA',
    // Donut AoE, Frozen Mirror
    'E8S Frigid Eruption': '4D9F',
    // Small circle AoE puddles, phase 1
    'E8S Frigid Needle': '4D9D',
    // 8-way "flower" explosion
    'E8S Icicle Impact': '4DA0',
    // Large circle AoE puddles, phase 1
    'E8S Reflected Biting Frost 1': '4DB7',
    // 270-degree frontal AoE, Frozen Mirror
    'E8S Reflected Biting Frost 2': '4DC3',
    // 270-degree frontal AoE, Frozen Mirror
    'E8S Reflected Driving Frost 1': '4DB8',
    // Cone AoE, Frozen Mirror
    'E8S Reflected Driving Frost 2': '4DC4',
    // Cone AoE, Frozen Mirror
    'E8S Hallowed Wings 1': '4D75',
    // Left cleave
    'E8S Hallowed Wings 2': '4D76',
    // Right cleave
    'E8S Hallowed Wings 3': '4D77',
    // Knockback frontal cleave
    'E8S Reflected Hallowed Wings 1': '4D90',
    // Reflected left 2
    'E8S Reflected Hallowed Wings 2': '4DBB',
    // Reflected left 1
    'E8S Reflected Hallowed Wings 3': '4DC7',
    // Reflected right 2
    'E8S Reflected Hallowed Wings 4': '4D91',
    // Reflected right 1
    'E8S Twin Stillness 1': '4D68',
    'E8S Twin Stillness 2': '4D6B',
    'E8S Twin Silence 1': '4D69',
    'E8S Twin Silence 2': '4D6A',
    'E8S Akh Rhai': '4D99',
    'E8S Embittered Dance 1': '4D70',
    'E8S Embittered Dance 2': '4D71',
    'E8S Spiteful Dance 1': '4D6F',
    'E8S Spiteful Dance 2': '4D72'
  },
  damageFail: {
    // Broken tether.
    'E8S Refulgent Fate': '4DA4',
    // Shared orb, correct is Bright Pulse (4D95)
    'E8S Blinding Pulse': '4D96'
  },
  shareFail: {
    'E8S Path of Light': '4DA1' // Protean

  },
  triggers: [{
    id: 'E8S Shining Armor',
    // Stun
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '95'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    // Interrupt
    id: 'E8S Stoneskin',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4D85'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9n.js

/* harmony default export */ const e9n = ({
  zoneId: zone_id/* default.EdensPromiseUmbra */.Z.EdensPromiseUmbra,
  damageWarn: {
    'E9N The Art Of Darkness 1': '5223',
    // left-right cleave
    'E9N The Art Of Darkness 2': '5224',
    // left-right cleave
    'E9N Wide-Angle Particle Beam': '5AFF',
    // frontal cleave tutorial mechanic
    'E9N Wide-Angle Phaser': '55E1',
    // wide-angle "sides"
    'E9N Bad Vibrations': '55E6',
    // tethered outside giant tree ground aoes
    'E9N Earth-Shattering Particle Beam': '5225',
    // missing towers?
    'E9N Anti-Air Particle Beam': '55DC',
    // "get out" during panels
    'E9N Zero-Form Particle Beam 2': '55DB' // Clone line aoes w/ Anti-Air Particle Beam

  },
  damageFail: {
    'E9N Withdraw': '5534',
    // Slow to break seed chain, get sucked back in yikes
    'E9N Aetherosynthesis': '5535' // Standing on seeds during explosion (possibly via Withdraw)

  },
  shareWarn: {
    'E9N Zero-Form Particle Beam 1': '55EB' // tank laser with marker

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9s.js


 // TODO: 561D Evil Seed hits everyone, hard to know if there's a double tap
// TODO: falling through panel just does damage with no ability name, like a death wall
// TODO: what happens if you jump in seed thorns?

/* harmony default export */ const e9s = ({
  zoneId: zone_id/* default.EdensPromiseUmbraSavage */.Z.EdensPromiseUmbraSavage,
  damageWarn: {
    'E9S Bad Vibrations': '561C',
    // tethered outside giant tree ground aoes
    'E9S Wide-Angle Particle Beam': '5B00',
    // anti-air "sides"
    'E9S Wide-Angle Phaser Unlimited': '560E',
    // wide-angle "sides"
    'E9S Anti-Air Particle Beam': '5B01',
    // wide-angle "out"
    'E9S The Second Art Of Darkness 1': '5601',
    // left-right cleave
    'E9S The Second Art Of Darkness 2': '5602',
    // left-right cleave
    'E9S The Art Of Darkness 1': '5A95',
    // boss left-right summon/panel cleave
    'E9S The Art Of Darkness 2': '5A96',
    // boss left-right summon/panel cleave
    'E9S The Art Of Darkness Clone 1': '561E',
    // clone left-right summon cleave
    'E9S The Art Of Darkness Clone 2': '561F',
    // clone left-right summon cleave
    'E9S The Third Art Of Darkness 1': '5603',
    // third art left-right cleave initial
    'E9S The Third Art Of Darkness 2': '5604',
    // third art left-right cleave initial
    'E9S Art Of Darkness': '5606',
    // third art left-right cleave final
    'E9S Full-Perimiter Particle Beam': '5629',
    // panel "get in"
    'E9S Dark Chains': '5FAC' // Slow to break partner chains

  },
  damageFail: {
    'E9S Withdraw': '561A',
    // Slow to break seed chain, get sucked back in yikes
    'E9S Aetherosynthesis': '561B' // Standing on seeds during explosion (possibly via Withdraw)

  },
  shareWarn: {
    'E9S Hyper-Focused Particle Beam': '55FD' // Art Of Darkness protean

  },
  shareFail: {
    'E9S Condensed Wide-Angle Particle Beam': '5610' // wide-angle "tank laser"

  },
  gainsEffectWarn: {
    'E9S Stygian Tendrils': '952' // standing in the brambles

  },
  soloWarn: {
    'E9S Multi-Pronged Particle Beam': '5600' // Art Of Darkness Partner Stack

  },
  triggers: [{
    // Anti-air "tank spread".  This can be stacked by two tanks invulning.
    // Note: this will still show something for holmgang/living, but
    // arguably a healer might need to do something about that, so maybe
    // it's ok to still show as a warning??
    id: 'E9S Condensed Anti-Air Particle Beam',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      type: '22',
      id: '5615',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    // Anti-air "out".  This can be invulned by a tank along with the spread above.
    id: 'E9S Anti-Air Phaser Unlimited',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '5612',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10n.js

/* harmony default export */ const e10n = ({
  zoneId: zone_id/* default.EdensPromiseLitany */.Z.EdensPromiseLitany,
  damageWarn: {
    'E10N Forward Implosion': '56B4',
    // howl boss implosion
    'E10N Forward Shadow Implosion': '56B5',
    // howl shadow implosion
    'E10N Backward Implosion': '56B7',
    // tail boss implosion
    'E10N Backward Shadow Implosion': '56B8',
    // tail shadow implosion
    'E10N Barbs Of Agony 1': '56D9',
    // Shadow Warrior 3 dog room cleave
    'E10N Barbs Of Agony 2': '5B26',
    // Shadow Warrior 3 dog room cleave
    'E10N Cloak Of Shadows': '5B11',
    // non-squiggly line explosions
    'E10N Throne Of Shadow': '56C7',
    // standing up get out
    'E10N Right Giga Slash': '56AE',
    // boss right giga slash
    'E10N Right Shadow Slash': '56AF',
    // giga slash from shadow
    'E10N Left Giga Slash': '56B1',
    // boss left giga slash
    'E10N Left Shadow Slash': '56BD',
    // giga slash from shadow
    'E10N Shadowy Eruption': '56E1' // baited ground aoe markers paired with barbs

  },
  shareWarn: {
    'E10N Shadow\'s Edge': '56DB' // Tankbuster single target followup

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10s.js


 // TODO: hitting shadow of the hero with abilities can cause you to take damage, list those?
//       e.g. picking up your first pitch bog puddle will cause you to die to the damage
//       your shadow takes from Deepshadow Nova or Distant Scream.
// TODO: 573B Blighting Blitz issues during limit cut numbers

/* harmony default export */ const e10s = ({
  zoneId: zone_id/* default.EdensPromiseLitanySavage */.Z.EdensPromiseLitanySavage,
  damageWarn: {
    'E10S Implosion Single 1': '56F2',
    // single tail up shadow implosion
    'E10S Implosion Single 2': '56EF',
    // single howl shadow implosion
    'E10S Implosion Quadruple 1': '56EF',
    // quadruple set of shadow implosions
    'E10S Implosion Quadruple 2': '56F2',
    // quadruple set of shadow implosions
    'E10S Giga Slash Single 1': '56EC',
    // Giga slash single from shadow
    'E10S Giga Slash Single 2': '56ED',
    // Giga slash single from shadow
    'E10S Giga Slash Box 1': '5709',
    // Giga slash box from four ground shadows
    'E10S Giga Slash Box 2': '570D',
    // Giga slash box from four ground shadows
    'E10S Giga Slash Quadruple 1': '56EC',
    // quadruple set of giga slash cleaves
    'E10S Giga Slash Quadruple 2': '56E9',
    // quadruple set of giga slash cleaves
    'E10S Cloak Of Shadows 1': '5B13',
    // initial non-squiggly line explosions
    'E10S Cloak Of Shadows 2': '5B14',
    // second squiggly line explosions
    'E10S Throne Of Shadow': '5717',
    // standing up get out
    'E10S Shadowy Eruption': '5738' // baited ground aoe during amplifier

  },
  damageFail: {
    'E10S Swath Of Silence 1': '571A',
    // Shadow clone cleave (too close)
    'E10S Swath Of Silence 2': '5BBF' // Shadow clone cleave (timed)

  },
  shareWarn: {
    'E10S Shadefire': '5732',
    // purple tank umbral orbs
    'E10S Pitch Bog': '5722' // marker spread that drops a shadow puddle

  },
  shareFail: {
    'E10S Shadow\'s Edge': '5725' // Tankbuster single target followup

  },
  triggers: [{
    id: 'E10S Damage Down Orbs',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'Flameshadow',
      effectId: '82C'
    }),
    netRegexDe: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'Schattenflamme',
      effectId: '82C'
    }),
    netRegexFr: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'Flamme ombrale',
      effectId: '82C'
    }),
    netRegexJa: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'シャドウフレイム',
      effectId: '82C'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'damage',
        blame: matches.target,
        text: `${matches.effect} (partial stack)`
      };
    }
  }, {
    id: 'E10S Damage Down Boss',
    // Shackles being messed up appear to just give the Damage Down, with nothing else.
    // Messing up towers is the Thrice-Come Ruin effect (9E2), but also Damage Down.
    // TODO: some of these will be duplicated with others, like `E10S Throne Of Shadow`.
    // Maybe it'd be nice to figure out how to put the damage marker on that?
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'Shadowkeeper',
      effectId: '82C'
    }),
    netRegexDe: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'Schattenkönig',
      effectId: '82C'
    }),
    netRegexFr: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: 'Roi De L\'Ombre',
      effectId: '82C'
    }),
    netRegexJa: netregexes/* default.gainsEffect */.Z.gainsEffect({
      source: '影の王',
      effectId: '82C'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'damage',
        blame: matches.target,
        text: `${matches.effect}`
      };
    }
  }, {
    // Shadow Warrior 4 dog room cleave
    // This can be mitigated by the whole group, so add a damage condition.
    id: 'E10S Barbs Of Agony',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['572A', '5B27'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11n.js


/* harmony default export */ const e11n = ({
  zoneId: zone_id/* default.EdensPromiseAnamorphosis */.Z.EdensPromiseAnamorphosis,
  damageWarn: {
    'E11N Burnt Strike Lightning': '562E',
    // Line cleave
    'E11N Burnt Strike Fire': '562C',
    // Line cleave
    'E11N Burnt Strike Holy': '5630',
    // Line cleave
    'E11N Burnout': '562F',
    // Burnt Strike lightning expansion
    'E11N Shining Blade': '5631',
    // Baited explosion
    'E11N Halo Of Flame Brightfire': '563B',
    // Red circle intermission explosion
    'E11N Halo Of Levin Brightfire': '563C',
    // Blue circle intermission explosion
    'E11N Resounding Crack': '564D',
    // Demi-Gukumatz 270 degree frontal cleave
    'E11N Image Burnt Strike Lightning': '5645',
    // Fate Breaker's Image line cleave
    'E11N Image Burnt Strike Fire': '5643',
    // Fate Breaker's Image line cleave
    'E11N Image Burnout': '5646' // Fate Breaker's Image lightning expansion

  },
  damageFail: {
    'E11N Blasting Zone': '563E' // Prismatic Deception charges

  },
  shareWarn: {
    'E11N Burn Mark': '564F' // Powder Mark debuff explosion

  },
  triggers: [{
    id: 'E11N Blastburn Knocked Off',
    // 562D = Burnt Strike fire followup during most of the fight
    // 5644 = same thing, but from Fatebreaker's Image
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['562D', '5644']
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11s.js

 // 565A/568D Sinsmoke Bound Of Faith share
// 565E/5699 Bowshock hits target of 565D (twice) and two others

/* harmony default export */ const e11s = ({
  zoneId: zone_id/* default.EdensPromiseAnamorphosisSavage */.Z.EdensPromiseAnamorphosisSavage,
  damageWarn: {
    'E11S Burnt Strike Fire': '5652',
    // Line cleave
    'E11S Burnt Strike Lightning': '5654',
    // Line cleave
    'E11S Burnt Strike Holy': '5656',
    // Line cleave
    'E11S Shining Blade': '5657',
    // Baited explosion
    'E11S Burnt Strike Cycle Fire': '568E',
    // Line cleave during Cycle
    'E11S Burnt Strike Cycle Lightning': '5695',
    // Line cleave during Cycle
    'E11S Burnt Strike Cycle Holy': '569D',
    // Line cleave during Cycle
    'E11S Shining Blade Cycle': '569E',
    // Baited explosion during Cycle
    'E11S Halo Of Flame Brightfire': '566D',
    // Red circle intermission explosion
    'E11S Halo Of Levin Brightfire': '566C',
    // Blue circle intermission explosion
    'E11S Portal Of Flame Bright Pulse': '5671',
    // Red card intermission explosion
    'E11S Portal Of Levin Bright Pulse': '5670',
    // Blue card intermission explosion
    'E11S Resonant Winds': '5689',
    // Demi-Gukumatz "get in"
    'E11S Resounding Crack': '5688',
    // Demi-Gukumatz 270 degree frontal cleave
    'E11S Image Burnt Strike Lightning': '567B',
    // Fate Breaker's Image line cleave
    'E11N Image Burnout': '567C',
    // Fate Breaker's Image lightning expansion
    'E11N Image Burnt Strike Fire': '5679',
    // Fate Breaker's Image line cleave
    'E11N Image Burnt Strike Holy': '567B',
    // Fate Breaker's Image line cleave
    'E11N Image Shining Blade': '567E' // Fate Breaker's Image baited explosion

  },
  damageFail: {
    'E11S Burnout': '5655',
    // Burnt Strike lightning expansion
    'E11S Burnout Cycle': '5696',
    // Burnt Strike lightning expansion
    'E11S Blasting Zone': '5674' // Prismatic Deception charges

  },
  shareWarn: {
    'E11S Elemental Break': '5664',
    // Elemental Break protean
    'E11S Elemental Break Cycle': '568C',
    // Elemental Break protean during Cycle
    'E11S Sinsmite': '5667',
    // Lightning Elemental Break spread
    'E11S Sinsmite Cycle': '5694' // Lightning Elemental Break spread during Cycle

  },
  shareFail: {
    'E11S Burn Mark': '56A3',
    // Powder Mark debuff explosion
    'E11S Sinsight 1': '5661',
    // Holy Bound Of Faith tether
    'E11S Sinsight 2': '5BC7',
    // Holy Bound Of Faith tether from Fatebreaker's Image
    'E11S Sinsight 3': '56A0' // Holy Bound Of Faith tether during Cycle

  },
  soloFail: {
    'E11S Holy Sinsight Group Share': '5669'
  },
  triggers: [{
    id: 'E11S Blastburn Knocked Off',
    // 5653 = Burnt Strike fire followup during most of the fight
    // 567A = same thing, but from Fatebreaker's Image
    // 568F = same thing, but during Cycle of Faith
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5653', '567A', '568F']
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12n.js

/* harmony default export */ const e12n = ({
  zoneId: zone_id/* default.EdensPromiseEternity */.Z.EdensPromiseEternity,
  damageWarn: {
    'E12N Judgment Jolt Single': '585F',
    // Ramuh get out cast
    'E12N Judgment Jolt': '4E30',
    // Ramuh get out cast
    'E12N Temporary Current Single': '585C',
    // Levi get under cast
    'E12N Temporary Current': '4E2D',
    // Levi get under cast
    'E12N Conflag Strike Single': '585D',
    // Ifrit get sides cast
    'E12N Conflag Strike': '4E2E',
    // Ifrit get sides cast
    'E12N Ferostorm Single': '585E',
    // Garuda get intercardinals cast
    'E12N Ferostorm': '4E2F',
    // Garuda get intercardinals cast
    'E12N Rapturous Reach 1': '5878',
    // Haircut
    'E12N Rapturous Reach 2': '5877',
    // Haircut
    'E12N Bomb Explosion': '586D',
    // Small bomb explosion
    'E12N Titanic Bomb Explosion': '586F' // Large bomb explosion

  },
  shareWarn: {
    'E12N Earthshaker': '5885',
    // Earthshaker on first platform
    'E12N Promise Frigid Stone 1': '5867',
    // Shiva spread with sliding
    'E12N Promise Frigid Stone 2': '5869' // Shiva spread with Rapturous Reach

  }
});
// EXTERNAL MODULE: ./resources/outputs.ts
var outputs = __webpack_require__(4970);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12s.js



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
  if (typeof data.decOffset === 'undefined') data.decOffset = parseInt(matches.id, 16) - firstHeadmarker; // The leading zeroes are stripped when converting back to string, so we re-add them here.
  // Fortunately, we don't have to worry about whether or not this is robust,
  // since we know all the IDs that will be present in the encounter.

  return (parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0');
};

/* harmony default export */ const e12s = ({
  zoneId: zone_id/* default.EdensPromiseEternitySavage */.Z.EdensPromiseEternitySavage,
  damageWarn: {
    'E12S Promise Rapturous Reach Left': '58AD',
    // Haircut with left safe side
    'E12S Promise Rapturous Reach Right': '58AE',
    // Haircut with right safe side
    'E12S Promise Temporary Current': '4E44',
    // Levi get under cast (damage down)
    'E12S Promise Conflag Strike': '4E45',
    // Ifrit get sides cast (damage down)
    'E12S Promise Ferostorm': '4E46',
    // Garuda get intercardinals cast (damage down)
    'E12S Promise Judgment Jolt': '4E47',
    // Ramuh get out cast (damage down)
    'E12S Promise Shatter': '589C',
    // Ice Pillar explosion if tether not gotten
    'E12S Promise Impact': '58A1',
    // Titan bomb drop
    'E12S Oracle Dark Blizzard III': '58D3',
    // Relativity donut mechanic
    'E12S Oracle Apocalypse': '58E6' // Light up circle explosions (damage down)

  },
  damageFail: {
    'E12S Oracle Maelstrom': '58DA' // Advanced Relativity traffic light aoe

  },
  shareWarn: {
    'E12S Promise Frigid Stone': '589E',
    // Shiva spread
    'E12S Oracle Darkest Dance': '4E33',
    // Farthest target bait + jump before knockback
    'E12S Oracle Dark Current': '58D8',
    // Baited traffic light lasers
    'E12S Oracle Spirit Taker': '58C6',
    // Random jump spread mechanic after Shell Crusher
    'E12S Oracle Somber Dance 1': '58BF',
    // Farthest target bait for Dual Apocalypse
    'E12S Oracle Somber Dance 2': '58C0' // Second somber dance jump

  },
  shareFail: {
    'E12S Promise Weight Of The World': '58A5',
    // Titan bomb blue marker
    'E12S Promise Pulse Of The Land': '58A3',
    // Titan bomb yellow marker
    'E12S Oracle Dark Eruption 1': '58CE',
    // Initial warmup spread mechanic
    'E12S Oracle Dark Eruption 2': '58CD',
    // Relativity spread mechanic
    'E12S Oracle Black Halo': '58C7' // Tankbuster cleave

  },
  gainsEffectFail: {
    'E12S Oracle Doom': '9D4' // Relativity punishment for multiple mistakes

  },
  soloWarn: {
    'E12S Promise Force Of The Land': '58A4'
  },
  triggers: [{
    // Big circle ground aoes during Shiva junction.
    // This can be shielded through as long as that person doesn't stack.
    id: 'E12S Icicle Impact',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4E5A',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'E12S Headmarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({}),
    run: (_e, data, matches) => {
      const id = getHeadmarkerId(data, matches);
      const firstLaserMarker = '0091';
      const lastLaserMarker = '0098';

      if (id >= firstLaserMarker && id <= lastLaserMarker) {
        // ids are sequential: #1 square, #2 square, #3 square, #4 square, #1 triangle etc
        const decOffset = parseInt(id, 16) - parseInt(firstLaserMarker, 16); // decOffset is 0-7, so map 0-3 to 1-4 and 4-7 to 1-4.

        data.laserNameToNum = data.laserNameToNum || {};
        data.laserNameToNum[matches.target] = decOffset % 4 + 1;
      }
    }
  }, {
    // These sculptures are added at the start of the fight, so we need to check where they
    // use the "Classical Sculpture" ability and end up on the arena for real.
    id: 'E12S Promise Chiseled Sculpture Classical Sculpture',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      source: 'Chiseled Sculpture',
      id: '58B2'
    }),
    run: (_e, data, matches) => {
      // This will run per person that gets hit by the same sculpture, but that's fine.
      // Record the y position of each sculpture so we can use it for better text later.
      data.sculptureYPositions = data.sculptureYPositions || {};
      data.sculptureYPositions[matches.sourceId.toUpperCase()] = parseFloat(matches.y);
    }
  }, {
    // The source of the tether is the player, the target is the sculpture.
    id: 'E12S Promise Chiseled Sculpture Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      target: 'Chiseled Sculpture',
      id: '0011'
    }),
    run: (_e, data, matches) => {
      data.sculptureTetherNameToId = data.sculptureTetherNameToId || {};
      data.sculptureTetherNameToId[matches.source] = matches.targetId.toUpperCase();
    }
  }, {
    id: 'E12S Promise Blade Of Flame Counter',
    netRegex: netregexes/* default.ability */.Z.ability({
      source: 'Chiseled Sculpture',
      id: '58B3'
    }),
    delaySeconds: 1,
    suppressSeconds: 1,
    run: (_e, data) => {
      data.bladeOfFlameCount = data.bladeOfFlameCount || 0;
      data.bladeOfFlameCount++;
    }
  }, {
    // This is the Chiseled Sculpture laser with the limit cut dots.
    id: 'E12S Promise Blade Of Flame',
    netRegex: netregexes/* default.ability */.Z.ability({
      type: '22',
      source: 'Chiseled Sculpture',
      id: '58B3'
    }),
    mistake: (_e, data, matches) => {
      if (!data.laserNameToNum || !data.sculptureTetherNameToId || !data.sculptureYPositions) return; // Find the person who has this laser number and is tethered to this statue.

      const number = (data.bladeOfFlameCount || 0) + 1;
      const sourceId = matches.sourceId.toUpperCase();
      const names = Object.keys(data.laserNameToNum);
      const withNum = names.filter(name => data.laserNameToNum[name] === number);
      const owners = withNum.filter(name => data.sculptureTetherNameToId[name] === sourceId); // if some logic error, just abort.

      if (owners.length !== 1) return; // The owner hitting themselves isn't a mistake...technically.

      if (owners[0] === matches.target) return; // Now try to figure out which statue is which.
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
        const otherY = data.sculptureYPositions[otherId];
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
        ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번)`
      };

      if (isStatuePositionKnown && isStatueNorth) {
        text = {
          en: `${matches.ability} (from ${ownerNick}, #${number} north)`,
          de: `${matches.ability} (von ${ownerNick}, #${number} norden)`,
          ja: `${matches.ability} (北の${ownerNick}から、#${number})`,
          cn: `${matches.ability} (来自北方${ownerNick}，#${number})`,
          ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번 북쪽)`
        };
      } else if (isStatuePositionKnown && !isStatueNorth) {
        text = {
          en: `${matches.ability} (from ${ownerNick}, #${number} south)`,
          de: `${matches.ability} (von ${ownerNick}, #${number} Süden)`,
          ja: `${matches.ability} (南の${ownerNick}から、#${number})`,
          cn: `${matches.ability} (来自南方${ownerNick}，#${number})`,
          ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번 남쪽)`
        };
      }

      return {
        type: 'fail',
        name: matches.target,
        blame: owner,
        text: text
      };
    }
  }, {
    id: 'E12S Promise Ice Pillar Tracker',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Ice Pillar',
      id: ['0001', '0039']
    }),
    run: (_e, data, matches) => {
      data.pillarIdToOwner = data.pillarIdToOwner || {};
      data.pillarIdToOwner[matches.sourceId] = matches.target;
    }
  }, {
    id: 'E12S Promise Ice Pillar Mistake',
    netRegex: netregexes/* default.ability */.Z.ability({
      source: 'Ice Pillar',
      id: '589B'
    }),
    condition: (_e, data, matches) => {
      if (!data.pillarIdToOwner) return false;
      return matches.target !== data.pillarIdToOwner[matches.sourceId];
    },
    mistake: (_e, data, matches) => {
      const pillarOwner = data.ShortName(data.pillarIdToOwner[matches.sourceId]);
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: `${matches.ability} (from ${pillarOwner})`,
          de: `${matches.ability} (von ${pillarOwner})`,
          fr: `${matches.ability} (de ${pillarOwner})`,
          ja: `${matches.ability} (${pillarOwner}から)`,
          cn: `${matches.ability} (来自${pillarOwner})`,
          ko: `${matches.ability} (대상자 "${pillarOwner}")`
        }
      };
    }
  }, {
    id: 'E12S Promise Gain Fire Resistance Down II',
    // The Beastly Sculpture gives a 3 second debuff, the Regal Sculpture gives a 14s one.
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '832'
    }),
    run: (_e, data, matches) => {
      data.fire = data.fire || {};
      data.fire[matches.target] = true;
    }
  }, {
    id: 'E12S Promise Lose Fire Resistance Down II',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '832'
    }),
    run: (_e, data, matches) => {
      data.fire = data.fire || {};
      data.fire[matches.target] = false;
    }
  }, {
    id: 'E12S Promise Small Lion Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Beastly Sculpture',
      id: '0011'
    }),
    netRegexDe: netregexes/* default.tether */.Z.tether({
      source: 'Abbild Eines Löwen',
      id: '0011'
    }),
    netRegexFr: netregexes/* default.tether */.Z.tether({
      source: 'Création Léonine',
      id: '0011'
    }),
    netRegexJa: netregexes/* default.tether */.Z.tether({
      source: '創られた獅子',
      id: '0011'
    }),
    run: (_e, data, matches) => {
      data.smallLionIdToOwner = data.smallLionIdToOwner || {};
      data.smallLionIdToOwner[matches.sourceId.toUpperCase()] = matches.target;
      data.smallLionOwners = data.smallLionOwners || [];
      data.smallLionOwners.push(matches.target);
    }
  }, {
    id: 'E12S Promise Small Lion Lionsblaze',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      source: 'Beastly Sculpture',
      id: '58B9'
    }),
    netRegexDe: netregexes/* default.abilityFull */.Z.abilityFull({
      source: 'Abbild Eines Löwen',
      id: '58B9'
    }),
    netRegexFr: netregexes/* default.abilityFull */.Z.abilityFull({
      source: 'Création Léonine',
      id: '58B9'
    }),
    netRegexJa: netregexes/* default.abilityFull */.Z.abilityFull({
      source: '創られた獅子',
      id: '58B9'
    }),
    mistake: (_e, data, matches) => {
      // Folks baiting the big lion second can take the first small lion hit,
      // so it's not sufficient to check only the owner.
      if (!data.smallLionOwners) return;
      const owner = data.smallLionIdToOwner[matches.sourceId.toUpperCase()];
      if (!owner) return;
      if (matches.target === owner) return; // If the target also has a small lion tether, that is always a mistake.
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
          if (x > 0) dirObj = outputs/* default.dirNE */.Z.dirNE;else dirObj = outputs/* default.dirNW */.Z.dirNW;
        } else {
          if (x > 0) dirObj = outputs/* default.dirSE */.Z.dirSE;else dirObj = outputs/* default.dirSW */.Z.dirSW;
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
            ko: `${matches.ability} (대상자 "${ownerNick}", ${dirObj['ko']})`
          }
        };
      }
    }
  }, {
    id: 'E12S Promise North Big Lion',
    netRegex: netregexes/* default.addedCombatantFull */.Z.addedCombatantFull({
      name: 'Regal Sculpture'
    }),
    run: (_e, data, matches) => {
      const y = parseFloat(matches.y);
      const centerY = -75;
      if (y < centerY) data.northBigLion = matches.id.toUpperCase();
    }
  }, {
    id: 'E12S Promise Big Lion Kingsblaze',
    netRegex: netregexes/* default.ability */.Z.ability({
      source: 'Regal Sculpture',
      id: '4F9E'
    }),
    netRegexDe: netregexes/* default.ability */.Z.ability({
      source: 'Abbild eines großen Löwen',
      id: '4F9E'
    }),
    netRegexFr: netregexes/* default.ability */.Z.ability({
      source: 'création léonine royale',
      id: '4F9E'
    }),
    netRegexJa: netregexes/* default.ability */.Z.ability({
      source: '創られた獅子王',
      id: '4F9E'
    }),
    mistake: (_e, data, matches) => {
      const singleTarget = matches.type === '21';
      const hasFireDebuff = data.fire && data.fire[matches.target]; // Success if only one person takes it and they have no fire debuff.

      if (singleTarget && !hasFireDebuff) return;
      const output = {
        northBigLion: {
          en: 'north big lion',
          de: 'Nordem, großer Löwe',
          ja: '大ライオン(北)',
          cn: '北方大狮子',
          ko: '북쪽 큰 사자'
        },
        southBigLion: {
          en: 'south big lion',
          de: 'Süden, großer Löwe',
          ja: '大ライオン(南)',
          cn: '南方大狮子',
          ko: '남쪽 큰 사자'
        },
        shared: {
          en: 'shared',
          de: 'geteilt',
          ja: '重ねた',
          cn: '重叠',
          ko: '같이 맞음'
        },
        fireDebuff: {
          en: 'had fire',
          de: 'hatte Feuer',
          ja: '炎付き',
          cn: '火Debuff',
          ko: '화염 디버프 받음'
        }
      };
      const labels = [];

      if (data.northBigLion) {
        if (data.northBigLion === matches.sourceId) labels.push(output.northBigLion[data.parserLang] || output.northBigLion['en']);else labels.push(output.southBigLion[data.parserLang] || output.southBigLion['en']);
      }

      if (!singleTarget) labels.push(output.shared[data.parserLang] || output.shared['en']);
      if (hasFireDebuff) labels.push(output.fireDebuff[data.parserLang] || output.fireDebuff['en']);
      return {
        type: 'fail',
        name: matches.target,
        text: `${matches.ability} (${labels.join(', ')})`
      };
    }
  }, {
    id: 'E12S Knocked Off',
    // 589A = Ice Pillar (promise shiva phase)
    // 58B6 = Palm Of Temperance (promise statue hand)
    // 58B7 = Laser Eye (promise lion phase)
    // 58C1 = Darkest Dance (oracle tank jump + knockback in beginning and triple apoc)
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['589A', '58B6', '58B7', '58C1']
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }, {
    id: 'E12S Oracle Shadoweye',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '58D2',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon-ex.js

 // TODO: warning for taking Diamond Flash (5FA1) stack on your own?
// Diamond Weapon Extreme

/* harmony default export */ const diamond_weapon_ex = ({
  zoneId: zone_id/* default.TheCloudDeckExtreme */.Z.TheCloudDeckExtreme,
  damageWarn: {
    'DiamondEx Auri Arts 1': '5FAF',
    // Auri Arts dashes/explosions
    'DiamondEx Auri Arts 2': '5FB2',
    // Auri Arts dashes/explosions
    'DiamondEx Auri Arts 3': '5FCD',
    // Auri Arts dashes/explosions
    'DiamondEx Auri Arts 4': '5FCE',
    // Auri Arts dashes/explosions
    'DiamondEx Auri Arts 5': '5FCF',
    // Auri Arts dashes/explosions
    'DiamondEx Auri Arts 6': '5FF8',
    // Auri Arts dashes/explosions
    'DiamondEx Auri Arts 7': '6159',
    // Auri Arts dashes/explosions
    'DiamondEx Articulated Bit Aetherial Bullet': '5FAB',
    // bit lasers during all phases
    'DiamondEx Diamond Shrapnel 1': '5FCB',
    // chasing circles
    'DiamondEx Diamond Shrapnel 2': '5FCC' // chasing circles

  },
  damageFail: {
    'DiamondEx Claw Swipe Left': '5FC2',
    // Adamant Purge platform cleave
    'DiamondEx Claw Swipe Right': '5FC3',
    // Adamant Purge platform cleave
    'DiamondEx Auri Cyclone 1': '5FD1',
    // standing on the blue knockback puck
    'DiamondEx Auri Cyclone 2': '5FD2',
    // standing on the blue knockback puck
    'DiamondEx Airship\'s Bane 1': '5FFE',
    // destroying one of the platforms after Auri Cyclone
    'DiamondEx Airship\'s Bane 2': '5FD3' // destroying one of the platforms after Auri Cyclone

  },
  shareWarn: {
    'DiamondEx Tank Lasers': '5FC8',
    // cleaving yellow lasers on top two enmity
    'DiamondEx Homing Laser': '5FC4' // Adamante Purge spread

  },
  shareFail: {
    'DiamondEx Flood Ray': '5FC7' // "limit cut" cleaves

  },
  triggers: [{
    id: 'DiamondEx Vertical Cleave Knocked Off',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5FD0'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon.js

 // Diamond Weapon Normal

/* harmony default export */ const diamond_weapon = ({
  zoneId: zone_id/* default.TheCloudDeck */.Z.TheCloudDeck,
  damageWarn: {
    'Diamond Weapon Auri Arts': '5FE3',
    // Auri Arts dashes
    'Diamond Weapon Diamond Shrapnel Initial': '5FE1',
    // initial circle of Diamond Shrapnel
    'Diamond Weapon Diamond Shrapnel Chasing': '5FE2',
    // followup circles from Diamond Shrapnel
    'Diamond Weapon Aetherial Bullet': '5FD5' // bit lasers

  },
  damageFail: {
    'Diamond Weapon Claw Swipe Left': '5FD9',
    // Adamant Purge platform cleave
    'Diamond Weapon Claw Swipe Right': '5FDA',
    // Adamant Purge platform cleave
    'Diamond Weapon Auri Cyclone 1': '5FE6',
    // standing on the blue knockback puck
    'Diamond Weapon Auri Cyclone 2': '5FE7',
    // standing on the blue knockback puck
    'Diamond Weapon Airship\'s Bane 1': '5FE8',
    // destroying one of the platforms after Auri Cyclone
    'Diamond Weapon Airship\'s Bane 2': '5FFE' // destroying one of the platforms after Auri Cyclone

  },
  shareWarn: {
    'Diamond Weapon Homing Laser': '5FDB' // spread markers

  },
  triggers: [{
    id: 'Diamond Weapon Vertical Cleave Knocked Off',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5FE5'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon-ex.js

/* harmony default export */ const emerald_weapon_ex = ({
  zoneId: zone_id/* default.CastrumMarinumExtreme */.Z.CastrumMarinumExtreme,
  damageWarn: {
    'EmeraldEx Heat Ray': '5BD3',
    // Emerald Beam initial conal
    'EmeraldEx Photon Laser 1': '557B',
    // Emerald Beam inside circle
    'EmeraldEx Photon Laser 2': '557D',
    // Emerald Beam outside circle
    'EmeraldEx Heat Ray 1': '557A',
    // Emerald Beam rotating pulsing laser
    'EmeraldEx Heat Ray 2': '5579',
    // Emerald Beam rotating pulsing laser
    'EmeraldEx Explosion': '5596',
    // Magitek Mine explosion
    'EmeraldEx Tertius Terminus Est Initial': '55CD',
    // sword initial puddles
    'EmeraldEx Tertius Terminus Est Explosion': '55CE',
    // sword explosions
    'EmeraldEx Airborne Explosion': '55BD',
    // exaflare
    'EmeraldEx Sidescathe 1': '55D4',
    // left/right cleave
    'EmeraldEx Sidescathe 2': '55D5',
    // left/right cleave
    'EmeraldEx Shots Fired': '55B7',
    // rank and file soldiers
    'EmeraldEx Secundus Terminus Est': '55CB',
    // dropped + and x headmarkers
    'EmeraldEx Expire': '55D1',
    // ground aoe on boss "get out"
    'EmeraldEx Aire Tam Storm': '55D0' // expanding red and black ground aoe

  },
  shareWarn: {
    'EmeraldEx Divide Et Impera': '55D9',
    // non-tank protean spread
    'EmeraldEx Primus Terminus Est 1': '55C4',
    // knockback arrow
    'EmeraldEx Primus Terminus Est 2': '55C5',
    // knockback arrow
    'EmeraldEx Primus Terminus Est 3': '55C6',
    // knockback arrow
    'EmeraldEx Primus Terminus Est 4': '55C7' // knockback arrow

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon.js


/* harmony default export */ const emerald_weapon = ({
  zoneId: zone_id/* default.CastrumMarinum */.Z.CastrumMarinum,
  damageWarn: {
    'Emerald Weapon Heat Ray': '4F9D',
    // Emerald Beam initial conal
    'Emerald Weapon Photon Laser 1': '5534',
    // Emerald Beam inside circle
    'Emerald Weapon Photon Laser 2': '5536',
    // Emerald Beam middle circle
    'Emerald Weapon Photon Laser 3': '5538',
    // Emerald Beam outside circle
    'Emerald Weapon Heat Ray 1': '5532',
    // Emerald Beam rotating pulsing laser
    'Emerald Weapon Heat Ray 2': '5533',
    // Emerald Beam rotating pulsing laser
    'Emerald Weapon Magnetic Mine Explosion': '5B04',
    // repulsing mine explosions
    'Emerald Weapon Sidescathe 1': '553F',
    // left/right cleave
    'Emerald Weapon Sidescathe 2': '5540',
    // left/right cleave
    'Emerald Weapon Sidescathe 3': '5541',
    // left/right cleave
    'Emerald Weapon Sidescathe 4': '5542',
    // left/right cleave
    'Emerald Weapon Bit Storm': '554A',
    // "get in"
    'Emerald Weapon Emerald Crusher': '553C',
    // blue knockback puck
    'Emerald Weapon Pulse Laser': '5548',
    // line aoe
    'Emerald Weapon Energy Aetheroplasm': '5551',
    // hitting a glowy orb
    'Emerald Weapon Divide Et Impera Ground': '556F',
    // party targeted ground cones
    'Emerald Weapon Primus Terminus Est': '4B3E',
    // ground circle during arrow headmarkers
    'Emerald Weapon Secundus Terminus Est': '556A',
    // X / + headmarkers
    'Emerald Weapon Tertius Terminus Est': '556D',
    // triple swords
    'Emerald Weapon Shots Fired': '555F' // line aoes from soldiers

  },
  shareWarn: {
    'Emerald Weapon Divide Et Impera P1': '554E',
    // tankbuster, probably cleaves, phase 1
    'Emerald Weapon Divide Et Impera P2': '5570' // tankbuster, probably cleaves, phase 2

  },
  triggers: [{
    id: 'Emerald Weapon Emerald Crusher Knocked Off',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '553E'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }, {
    // Getting knocked into a wall from the arrow headmarker.
    id: 'Emerald Weapon Primus Terminus Est Wall',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5563', '5564']
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Pushed into wall',
          de: 'Rückstoß in die Wand',
          ja: '壁へノックバック',
          cn: '击退至墙',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/hades-ex.js


 // Hades Ex

/* harmony default export */ const hades_ex = ({
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
    'HadesEx Dark Current 2': '47F2'
  },
  damageFail: {
    'HadesEx Comet': '47B9',
    // missed tower
    'HadesEx Ancient Eruption': '47D3',
    'HadesEx Purgation 1': '47EC',
    'HadesEx Purgation 2': '47ED',
    'HadesEx Shadow Stream': '47EA',
    'HadesEx Dead Space': '47EE'
  },
  shareWarn: {
    'HadesEx Shadow Spread Initial': '47A9',
    'HadesEx Ravenous Assault': '(?:47A6|47A7)',
    'HadesEx Dark Flame 1': '47C6',
    'HadesEx Dark Freeze 1': '47C4',
    'HadesEx Dark Freeze 2': '47DF'
  },
  triggers: [{
    id: 'HadesEx Dark II Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Shadow of the Ancients',
      id: '0011'
    }),
    run: (_e, data, matches) => {
      data.hasDark = data.hasDark || [];
      data.hasDark.push(matches.target);
    }
  }, {
    id: 'HadesEx Dark II',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      type: '22',
      id: '47BA',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // Don't blame people who don't have tethers.
    condition: (_e, data, matches) => data.hasDark && data.hasDark.includes(matches.target),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'HadesEx Boss Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: ['Igeyorhm\'s Shade', 'Lahabrea\'s Shade'],
      id: '000E',
      capture: false
    }),
    mistake: {
      type: 'warn',
      text: {
        en: 'Bosses Too Close',
        de: 'Bosses zu Nahe',
        fr: 'Boss trop proches',
        ja: 'ボス近すぎる',
        cn: 'BOSS靠太近了',
        ko: '쫄들이 너무 가까움'
      }
    }
  }, {
    id: 'HadesEx Death Shriek',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '47CB',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'HadesEx Beyond Death Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    run: (_e, data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = true;
    }
  }, {
    id: 'HadesEx Beyond Death Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '566'
    }),
    run: (_e, data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = false;
    }
  }, {
    id: 'HadesEx Beyond Death',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_e, data, matches) => {
      if (!data.hasBeyondDeath) return;
      if (!data.hasBeyondDeath[matches.target]) return;
      return {
        name: matches.target,
        reason: matches.effect
      };
    }
  }, {
    id: 'HadesEx Doom Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '6E9'
    }),
    run: (_e, data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = true;
    }
  }, {
    id: 'HadesEx Doom Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '6E9'
    }),
    run: (_e, data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = false;
    }
  }, {
    id: 'HadesEx Doom',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '6E9'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_e, data, matches) => {
      if (!data.hasDoom) return;
      if (!data.hasDoom[matches.target]) return;
      return {
        name: matches.target,
        reason: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/hades.js
 // Hades Normal

/* harmony default export */ const hades = ({
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
    'Hades Echo 2': '4164'
  },
  shareFail: {
    'Hades Nether Blast': '4163',
    'Hades Ravenous Assault': '4158',
    'Hades Ancient Darkness': '4593',
    'Hades Dual Strike': '4162'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/innocence-ex.js
 // Innocence Extreme

/* harmony default export */ const innocence_ex = ({
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
    'InnoEx Explosion': '3EF0'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/innocence.js
 // Innocence Normal

/* harmony default export */ const innocence = ({
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
    'Inno God Ray 4': '3EC0'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/levi-un.js

 // It's hard to capture the reflection abilities from Leviathan's Head and Tail if you use
// ranged physical attacks / magic attacks respectively, as the ability names are the
// ability you used and don't appear to show up in the log as normal "ability" lines.
// That said, dots still tick independently on both so it's likely that people will atack
// them anyway.
// TODO: Figure out why Dread Tide / Waterspout appear like shares (i.e. 0x16 id).
// Dread Tide = 5CCA/5CCB/5CCC, Waterspout = 5CD1
// Leviathan Unreal

/* harmony default export */ const levi_un = ({
  zoneId: zone_id/* default.TheWhorleaterUnreal */.Z.TheWhorleaterUnreal,
  damageWarn: {
    'LeviUn Grand Fall': '5CDF',
    // very large circular aoe before spinny dives, applies heavy
    'LeviUn Hydroshot': '5CD5',
    // Wavespine Sahagin aoe that gives Dropsy effect
    'LeviUn Dreadstorm': '5CD6' // Wavetooth Sahagin aoe that gives Hysteria effect

  },
  damageFail: {
    'LeviUn Body Slam': '5CD2',
    // levi slam that tilts the boat
    'LeviUn Spinning Dive 1': '5CDB',
    // levi dash across the boat with knockback
    'LeviUn Spinning Dive 2': '5CE3',
    // levi dash across the boat with knockback
    'LeviUn Spinning Dive 3': '5CE8',
    // levi dash across the boat with knockback
    'LeviUn Spinning Dive 4': '5CE9' // levi dash across the boat with knockback

  },
  gainsEffectWarn: {
    'LeviUn Dropsy': '110' // standing in the hydro shot from the Wavespine Sahagin

  },
  gainsEffectFail: {
    'LeviUn Hysteria': '128' // standing in the dreadstorm from the Wavetooth Sahagin

  },
  triggers: [{
    id: 'LeviUn Body Slam Knocked Off',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5CD2'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon-ex.js

 // TODO: taking two different High-Powered Homing Lasers (4AD8)
// TODO: could blame the tethered player for White Agony / White Fury failures?
// Ruby Weapon Extreme

/* harmony default export */ const ruby_weapon_ex = ({
  zoneId: zone_id/* default.CinderDriftExtreme */.Z.CinderDriftExtreme,
  damageWarn: {
    'RubyEx Ruby Bit Magitek Ray': '4AD2',
    // line aoes during helicoclaw
    'RubyEx Spike Of Flame 1': '4AD3',
    // initial explosion during helicoclaw
    'RubyEx Spike Of Flame 2': '4B2F',
    // followup helicoclaw explosions
    'RubyEx Spike Of Flame 3': '4D04',
    // ravensclaw explosion at ends of lines
    'RubyEx Spike Of Flame 4': '4D05',
    // ravensclaw explosion at ends of lines
    'RubyEx Spike Of Flame 5': '4ACD',
    // ravensclaw explosion at ends of lines
    'RubyEx Spike Of Flame 6': '4ACE',
    // ravensclaw explosion at ends of lines
    'RubyEx Undermine': '4AD0',
    // ground aoes under the ravensclaw patches
    'RubyEx Ruby Ray': '4B02',
    // frontal laser
    'RubyEx Ravensflight 1': '4AD9',
    // dash around the arena
    'RubyEx Ravensflight 2': '4ADA',
    // dash around the arena
    'RubyEx Ravensflight 3': '4ADD',
    // dash around the arena
    'RubyEx Ravensflight 4': '4ADE',
    // dash around the arena
    'RubyEx Ravensflight 5': '4ADF',
    // dash around the arena
    'RubyEx Ravensflight 6': '4AE0',
    // dash around the arena
    'RubyEx Ravensflight 7': '4AE1',
    // dash around the arena
    'RubyEx Ravensflight 8': '4AE2',
    // dash around the arena
    'RubyEx Ravensflight 9': '4AE3',
    // dash around the arena
    'RubyEx Ravensflight 10': '4AE4',
    // dash around the arena
    'RubyEx Ravensflight 11': '4AE5',
    // dash around the arena
    'RubyEx Ravensflight 12': '4AE6',
    // dash around the arena
    'RubyEx Ravensflight 13': '4AE7',
    // dash around the arena
    'RubyEx Ravensflight 14': '4AE8',
    // dash around the arena
    'RubyEx Ravensflight 15': '4AE9',
    // dash around the arena
    'RubyEx Ravensflight 16': '4AEA',
    // dash around the arena
    'RubyEx Ravensflight 17': '4E6B',
    // dash around the arena
    'RubyEx Ravensflight 18': '4E6C',
    // dash around the arena
    'RubyEx Ravensflight 19': '4E6D',
    // dash around the arena
    'RubyEx Ravensflight 20': '4E6E',
    // dash around the arena
    'RubyEx Ravensflight 21': '4E6F',
    // dash around the arena
    'RubyEx Ravensflight 22': '4E70',
    // dash around the arena
    'RubyEx Cut And Run 1': '4B05',
    // slow charge across arena after stacks
    'RubyEx Cut And Run 2': '4B06',
    // slow charge across arena after stacks
    'RubyEx Cut And Run 3': '4B07',
    // slow charge across arena after stacks
    'RubyEx Cut And Run 4': '4B08',
    // slow charge across arena after stacks
    'RubyEx Cut And Run 5': '4DOD',
    // slow charge across arena after stacks
    'RubyEx Meteor Burst': '4AF2',
    // meteor exploding
    'RubyEx Bradamante': '4E38',
    // headmarkers with line aoes
    'RubyEx Comet Heavy Impact': '4AF6' // letting a tank comet land

  },
  damageFail: {
    'RubyEx Ruby Sphere Burst': '4ACB',
    // exploding the red mine
    'RubyEx Lunar Dynamo': '4EB0',
    // "get in" from Raven's Image
    'RubyEx Iron Chariot': '4EB1',
    // "get out" from Raven's Image
    'RubyEx Heart In The Machine': '4AFA' // White Agony/Fury skull hitting players

  },
  shareWarn: {
    'RubyEx Homing Lasers': '4AD6',
    // spread markers during cut and run
    'RubyEx Meteor Stream': '4E68' // spread markers during P2

  },
  gainsEffectFail: {
    'RubyEx Hysteria': '128' // Negative Aura lookaway failure

  },
  triggers: [{
    id: 'RubyEx Screech',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4AEE'
    }),
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: {
          en: 'Knocked into wall',
          de: 'Rückstoß in die Wand',
          ja: '壁へノックバック',
          cn: '击退至墙',
          ko: '넉백'
        }
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon.js
 // Ruby Normal

/* harmony default export */ const ruby_weapon = ({
  zoneId: zone_id/* default.CinderDrift */.Z.CinderDrift,
  damageWarn: {
    'Ruby Ravensclaw': '4A93',
    // centered circle aoe for ravensclaw
    'Ruby Spike Of Flame 1': '4A9A',
    // initial explosion during helicoclaw
    'Ruby Spike Of Flame 2': '4B2E',
    // followup helicoclaw explosions
    'Ruby Spike Of Flame 3': '4A94',
    // ravensclaw explosion at ends of lines
    'Ruby Spike Of Flame 4': '4A95',
    // ravensclaw explosion at ends of lines
    'Ruby Spike Of Flame 5': '4D02',
    // ravensclaw explosion at ends of lines
    'Ruby Spike Of Flame 6': '4D03',
    // ravensclaw explosion at ends of lines
    'Ruby Ruby Ray': '4AC6',
    // frontal laser
    'Ruby Undermine': '4A97',
    // ground aoes under the ravensclaw patches
    'Ruby Ravensflight 1': '4E69',
    // dash around the arena
    'Ruby Ravensflight 2': '4E6A',
    // dash around the arena
    'Ruby Ravensflight 3': '4AA1',
    // dash around the arena
    'Ruby Ravensflight 4': '4AA2',
    // dash around the arena
    'Ruby Ravensflight 5': '4AA3',
    // dash around the arena
    'Ruby Ravensflight 6': '4AA4',
    // dash around the arena
    'Ruby Ravensflight 7': '4AA5',
    // dash around the arena
    'Ruby Ravensflight 8': '4AA6',
    // dash around the arena
    'Ruby Ravensflight 9': '4AA7',
    // dash around the arena
    'Ruby Ravensflight 10': '4C21',
    // dash around the arena
    'Ruby Ravensflight 11': '4C2A',
    // dash around the arena
    'Ruby Comet Burst': '4AB4',
    // meteor exploding
    'Ruby Bradamante': '4ABC' // headmarkers with line aoes

  },
  shareWarn: {
    'Ruby Homing Laser': '4AC5',
    // spread markers in P1
    'Ruby Meteor Stream': '4E67' // spread markers in P2

  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/shiva-un.js

 // Shiva Unreal

/* harmony default export */ const shiva_un = ({
  zoneId: zone_id/* default.TheAkhAfahAmphitheatreUnreal */.Z.TheAkhAfahAmphitheatreUnreal,
  damageWarn: {
    // Large white circles.
    'ShivaEx Icicle Impact': '537B',
    // "get in" aoe
    'ShivaEx Whiteout': '5376',
    // Avoidable tank stun.
    'ShivaEx Glacier Bash': '5375'
  },
  damageFail: {
    // 270 degree attack.
    'ShivaEx Glass Dance': '5378'
  },
  shareWarn: {
    // Hailstorm spread marker.
    'ShivaEx Hailstorm': '536F'
  },
  shareFail: {
    // Laser.  TODO: maybe blame the person it's on??
    'ShivaEx Avalanche': '5379'
  },
  soloWarn: {
    // Party shared tank buster.
    'ShivaEx Icebrand': '5373'
  },
  triggers: [{
    id: 'ShivaEx Deep Freeze',
    // Shiva also uses ability 537A on you, but it has an unknown name.
    // So, use the effect instead for free translation.
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '1E7'
    }),
    condition: (_e, _data, matches) => {
      // The intermission also gets this effect, but for a shorter duration.
      return parseFloat(matches.duration) > 20;
    },
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titania.js

/* harmony default export */ const titania = ({
  zoneId: zone_id/* default.TheDancingPlague */.Z.TheDancingPlague,
  damageWarn: {
    'Titania Wood\'s Embrace': '3D50',
    // 'Titania Frost Rune': '3D4E',
    'Titania Gentle Breeze': '3F83',
    'Titania Leafstorm 1': '3D55',
    'Titania Puck\'s Rebuke': '3D58',
    'Titania Leafstorm 2': '3E03'
  },
  damageFail: {
    'Titania Phantom Rune 1': '3D5D',
    'Titania Phantom Rune 2': '3D5E'
  },
  shareFail: {
    'Titania Divination Rune': '3D5B'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titania-ex.js

/* harmony default export */ const titania_ex = ({
  zoneId: zone_id/* default.TheDancingPlagueExtreme */.Z.TheDancingPlagueExtreme,
  damageWarn: {
    'TitaniaEx Wood\'s Embrace': '3D2F',
    // 'TitaniaEx Frost Rune': '3D2B',
    'TitaniaEx Gentle Breeze': '3F82',
    'TitaniaEx Leafstorm 1': '3D39',
    'TitaniaEx Puck\'s Rebuke': '3D43',
    'TitaniaEx Wallop': '3D3B',
    'TitaniaEx Leafstorm 2': '3D49'
  },
  damageFail: {
    'TitaniaEx Phantom Rune 1': '3D4C',
    'TitaniaEx Phantom Rune 2': '3D4D'
  },
  shareFail: {
    // TODO: This could maybe blame the person with the tether?
    'TitaniaEx Thunder Rune': '3D29',
    'TitaniaEx Divination Rune': '3D4A'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titan-un.js
 // Titan Unreal

/* harmony default export */ const titan_un = ({
  zoneId: zone_id/* default.TheNavelUnreal */.Z.TheNavelUnreal,
  damageWarn: {
    'TitanUn Weight Of The Land': '58FE',
    'TitanUn Burst': '5ADF'
  },
  damageFail: {
    'TitanUn Landslide': '5ADC',
    'TitanUn Gaoler Landslide': '5902'
  },
  shareWarn: {
    'TitanUn Rock Buster': '58F6'
  },
  shareFail: {
    'TitanUn Mountain Buster': '58F7'
  }
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/varis-ex.js



/* harmony default export */ const varis_ex = ({
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
    'VarisEx Fortius Rotating': '4CE9'
  },
  damageFail: {
    // Don't hit the shields!
    'VarisEx Repay': '4CDD'
  },
  shareWarn: {
    // This is the "protean" fortius.
    'VarisEx Fortius Protean': '4CE7'
  },
  shareFail: {
    'VarisEx Magitek Burst': '4CDF',
    'VarisEx Aetherochemical Grenado': '4CED'
  },
  triggers: [{
    id: 'VarisEx Terminus Est',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4CB4',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 1,
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/wol.js

 // TODO: Radiant Braver is 4F16/4F17(x2), shouldn't get hit by both?
// TODO: Radiant Desperado is 4F18/4F19, shouldn't get hit by both?
// TODO: Radiant Meteor is 4F1A, and shouldn't get hit by more than 1?
// TODO: missing a tower?
// Note: Deliberately not including pyretic damage as an error.
// Note: It doesn't appear that there's any way to tell who failed the cutscene.

/* harmony default export */ const wol = ({
  zoneId: zone_id/* default.TheSeatOfSacrifice */.Z.TheSeatOfSacrifice,
  damageWarn: {
    'WOL Solemn Confiteor': '4F2A',
    // ground puddles
    'WOL Coruscant Saber In': '4F10',
    // saber in
    'WOL Coruscant Saber Out': '4F11',
    // saber out
    'WOL Imbued Corusance Out': '4F4B',
    // saber out
    'WOL Imbued Corusance In': '4F4C',
    // saber in
    'WOL Shining Wave': '4F26',
    // sword triangle
    'WOL Cauterize': '4F25',
    'WOL Brimstone Earth 1': '4F1E',
    // corner growing circles, initial
    'WOL Brimstone Earth 2': '4F1F',
    // corner growing circles, growing
    'WOL Flare Breath': '4F24',
    'WOL Decimation': '4F23'
  },
  gainsEffectWarn: {
    'WOL Deep Freeze': '4E6'
  },
  triggers: [{
    id: 'WOL True Walking Dead',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38E'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: matches.effect
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/wol-ex.js

 // TODO: Radiant Braver is 4EF7/4EF8(x2), shouldn't get hit by both?
// TODO: Radiant Desperado is 4EF9/4EFA, shouldn't get hit by both?
// TODO: Radiant Meteor is 4EFC, and shouldn't get hit by more than 1?
// TODO: Absolute Holy should be shared?
// TODO: intersecting brimstones?

/* harmony default export */ const wol_ex = ({
  zoneId: zone_id/* default.TheSeatOfSacrificeExtreme */.Z.TheSeatOfSacrificeExtreme,
  damageWarn: {
    'WOLEx Solemn Confiteor': '4F0C',
    // ground puddles
    'WOLEx Coruscant Saber In': '4EF2',
    // saber in
    'WOLEx Coruscant Saber Out': '4EF1',
    // saber out
    'WOLEx Imbued Corusance Out': '4F49',
    // saber out
    'WOLEx Imbued Corusance In': '4F4A',
    // saber in
    'WOLEx Shining Wave': '4F08',
    // sword triangle
    'WOLEx Cauterize': '4F07',
    'WOLEx Brimstone Earth': '4F00' // corner growing circles, growing

  },
  shareWarn: {
    'WOLEx Absolute Stone III': '4EEB',
    // protean wave imbued magic
    'WOLEx Flare Breath': '4F06',
    // tether from summoned bahamuts
    'WOLEx Perfect Decimation': '4F05' // smn/war phase marker

  },
  gainsEffectWarn: {
    'WOLEx Deep Freeze': '4E6',
    // failing Absolute Blizzard III
    'WOLEx Damage Down': '274' // failing Absolute Flash

  },
  soloWarn: {
    'WolEx Katon San Share': '4EFE'
  },
  triggers: [{
    id: 'WOLEx True Walking Dead',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8FF'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        reason: matches.effect
      };
    }
  }, {
    id: 'WOLEx Tower',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4F04',
      capture: false
    }),
    mistake: {
      type: 'fail',
      reason: {
        en: 'Missed Tower',
        de: 'Turm verpasst',
        fr: 'Tour manquée',
        ja: '塔を踏まなかった',
        cn: '没踩塔',
        ko: '장판 실수'
      }
    }
  }, {
    id: 'WOLEx True Hallowed Ground',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4F44'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        reason: matches.ability
      };
    }
  }, {
    // For Berserk and Deep Darkside
    id: 'WOLEx Missed Interrupt',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5156', '5158']
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        reason: matches.ability
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/ultimate/the_epic_of_alexander.js


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

/* harmony default export */ const the_epic_of_alexander = ({
  zoneId: zone_id/* default.TheEpicOfAlexanderUltimate */.Z.TheEpicOfAlexanderUltimate,
  damageWarn: {
    'TEA Sluice': '49B1',
    'TEA Protean Wave 1': '4824',
    'TEA Protean Wave 2': '49B5',
    'TEA Spin Crusher': '4A72',
    'TEA Sacrament': '485F',
    'TEA Radiant Sacrament': '4886',
    'TEA Almighty Judgment': '4890'
  },
  damageFail: {
    'TEA Hawk Blaster': '4830',
    'TEA Chakram': '4855',
    'TEA Enumeration': '4850',
    'TEA Apocalyptic Ray': '484C',
    'TEA Propeller Wind': '4832'
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
    'TEA Individual Reprobation': '488C'
  },
  soloFail: {
    // Optical Stack
    'TEA Collective Reprobation': '488D'
  },
  triggers: [{
    // "too much luminous aetheroplasm"
    // When this happens, the target explodes, hitting nearby people
    // but also themselves.
    id: 'TEA Exhaust',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '481F',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, _data, matches) => matches.target === matches.source,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: {
          en: 'luminous aetheroplasm',
          de: 'Luminiszentes Ätheroplasma',
          fr: 'Éthéroplasma lumineux',
          ja: '光性爆雷',
          cn: '光性爆雷'
        }
      };
    }
  }, {
    id: 'TEA Dropsy',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '121'
    }),
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'TEA Tether Tracking',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Jagd Doll',
      id: '0011'
    }),
    run: (_e, data, matches) => {
      data.jagdTether = data.jagdTether || {};
      data.jagdTether[matches.sourceId] = matches.target;
    }
  }, {
    id: 'TEA Reducible Complexity',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4821',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: (_e, data, matches) => {
      return {
        type: 'fail',
        // This may be undefined, which is fine.
        name: data.jagdTether ? data.jagdTether[matches.sourceId] : undefined,
        text: {
          en: 'Doll Death',
          de: 'Puppe Tot',
          fr: 'Poupée morte',
          ja: 'ドールが死んだ',
          cn: '浮士德死亡'
        }
      };
    }
  }, {
    id: 'TEA Drainage',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4827',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (_e, data, matches) => !data.party.isTank(matches.target),
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'TEA Throttle Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '2BC'
    }),
    run: (_e, data, matches) => {
      data.hasThrottle = data.hasThrottle || {};
      data.hasThrottle[matches.target] = true;
    }
  }, {
    id: 'TEA Throttle Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '2BC'
    }),
    run: (_e, data, matches) => {
      data.hasThrottle = data.hasThrottle || {};
      data.hasThrottle[matches.target] = false;
    }
  }, {
    id: 'TEA Throttle',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '2BC'
    }),
    delaySeconds: (_e, _data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_e, data, matches) => {
      if (!data.hasThrottle) return;
      if (!data.hasThrottle[matches.target]) return;
      return {
        name: matches.target,
        reason: matches.effect
      };
    }
  }, {
    // Balloon Popping.  It seems like the person who pops it is the
    // first person listed damage-wise, so they are likely the culprit.
    id: 'TEA Outburst',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '482A',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 5,
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.source
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/oopsy_manifest.txt

































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.js': buffs,'00-misc/general.js': general,'00-misc/test.js': test,'02-arr/trial/ifrit-nm.js': ifrit_nm,'02-arr/trial/titan-nm.js': titan_nm,'02-arr/trial/levi-ex.js': levi_ex,'02-arr/trial/shiva-hm.js': shiva_hm,'02-arr/trial/shiva-ex.js': shiva_ex,'02-arr/trial/titan-hm.js': titan_hm,'02-arr/trial/titan-ex.js': titan_ex,'03-hw/alliance/weeping_city.js': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.js': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.js': fractal_continuum,'03-hw/dungeon/gubal_library_hard.js': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.js': sohm_al_hard,'03-hw/raid/a12n.js': a12n,'04-sb/dungeon/ala_mhigo.js': ala_mhigo,'04-sb/dungeon/bardams_mettle.js': bardams_mettle,'04-sb/dungeon/kugane_castle.js': kugane_castle,'04-sb/dungeon/st_mocianne_hard.js': st_mocianne_hard,'04-sb/dungeon/swallows_compass.js': swallows_compass,'04-sb/dungeon/temple_of_the_fist.js': temple_of_the_fist,'04-sb/dungeon/the_burn.js': the_burn,'04-sb/raid/o1n.js': o1n,'04-sb/raid/o2n.js': o2n,'04-sb/raid/o3n.js': o3n,'04-sb/raid/o4n.js': o4n,'04-sb/raid/o4s.js': o4s,'04-sb/raid/o7s.js': o7s,'04-sb/raid/o12s.js': o12s,'04-sb/trial/byakko-ex.js': byakko_ex,'04-sb/trial/shinryu.js': shinryu,'04-sb/trial/susano-ex.js': susano_ex,'04-sb/ultimate/ultima_weapon_ultimate.js': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.js': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.js': the_copied_factory,'05-shb/alliance/the_puppets_bunker.js': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.js': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.js': akadaemia_anyder,'05-shb/dungeon/amaurot.js': amaurot,'05-shb/dungeon/anamnesis_anyder.js': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.js': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.js': heroes_gauntlet,'05-shb/dungeon/holminster_switch.js': holminster_switch,'05-shb/dungeon/malikahs_well.js': malikahs_well,'05-shb/dungeon/matoyas_relict.js': matoyas_relict,'05-shb/dungeon/mt_gulg.js': mt_gulg,'05-shb/dungeon/paglthan.js': paglthan,'05-shb/dungeon/qitana_ravel.js': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.js': the_grand_cosmos,'05-shb/dungeon/twinning.js': twinning,'05-shb/eureka/delubrum_reginae.js': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.js': delubrum_reginae_savage,'05-shb/raid/e1n.js': e1n,'05-shb/raid/e1s.js': e1s,'05-shb/raid/e2n.js': e2n,'05-shb/raid/e2s.js': e2s,'05-shb/raid/e3n.js': e3n,'05-shb/raid/e3s.js': e3s,'05-shb/raid/e4n.js': e4n,'05-shb/raid/e4s.js': e4s,'05-shb/raid/e5n.js': e5n,'05-shb/raid/e5s.js': e5s,'05-shb/raid/e6n.js': e6n,'05-shb/raid/e6s.js': e6s,'05-shb/raid/e7n.js': e7n,'05-shb/raid/e7s.js': e7s,'05-shb/raid/e8n.js': e8n,'05-shb/raid/e8s.js': e8s,'05-shb/raid/e9n.js': e9n,'05-shb/raid/e9s.js': e9s,'05-shb/raid/e10n.js': e10n,'05-shb/raid/e10s.js': e10s,'05-shb/raid/e11n.js': e11n,'05-shb/raid/e11s.js': e11s,'05-shb/raid/e12n.js': e12n,'05-shb/raid/e12s.js': e12s,'05-shb/trial/diamond_weapon-ex.js': diamond_weapon_ex,'05-shb/trial/diamond_weapon.js': diamond_weapon,'05-shb/trial/emerald_weapon-ex.js': emerald_weapon_ex,'05-shb/trial/emerald_weapon.js': emerald_weapon,'05-shb/trial/hades-ex.js': hades_ex,'05-shb/trial/hades.js': hades,'05-shb/trial/innocence-ex.js': innocence_ex,'05-shb/trial/innocence.js': innocence,'05-shb/trial/levi-un.js': levi_un,'05-shb/trial/ruby_weapon-ex.js': ruby_weapon_ex,'05-shb/trial/ruby_weapon.js': ruby_weapon,'05-shb/trial/shiva-un.js': shiva_un,'05-shb/trial/titania.js': titania,'05-shb/trial/titania-ex.js': titania_ex,'05-shb/trial/titan-un.js': titan_un,'05-shb/trial/varis-ex.js': varis_ex,'05-shb/trial/wol.js': wol,'05-shb/trial/wol-ex.js': wol_ex,'05-shb/ultimate/the_epic_of_alexander.js': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6WyJhYmlsaXR5Q29sbGVjdFNlY29uZHMiLCJlZmZlY3RDb2xsZWN0U2Vjb25kcyIsImlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMiLCJfZXZ0IiwiZGF0YSIsIm1hdGNoZXMiLCJzb3VyY2VJZCIsInRvVXBwZXJDYXNlIiwicGFydHkiLCJwYXJ0eUlkcyIsImluY2x1ZGVzIiwicGV0SWRUb093bmVySWQiLCJvd25lcklkIiwibWlzc2VkRnVuYyIsImFyZ3MiLCJpZCIsInRyaWdnZXJJZCIsIm5ldFJlZ2V4IiwiY29uZGl0aW9uIiwicnVuIiwiX2UiLCJnZW5lcmFsQnVmZkNvbGxlY3Rpb24iLCJwdXNoIiwiZGVsYXlTZWNvbmRzIiwiY29sbGVjdFNlY29uZHMiLCJzdXBwcmVzc1NlY29uZHMiLCJtaXN0YWtlIiwiX21hdGNoZXMiLCJhbGxNYXRjaGVzIiwicGFydHlOYW1lcyIsImdvdEJ1ZmZNYXAiLCJuYW1lIiwiZmlyc3RNYXRjaCIsInNvdXJjZU5hbWUiLCJzb3VyY2UiLCJwZXRJZCIsIm93bmVyTmFtZSIsIm5hbWVGcm9tSWQiLCJjb25zb2xlIiwiZXJyb3IiLCJpZ25vcmVTZWxmIiwidGhpbmdOYW1lIiwiZmllbGQiLCJ0YXJnZXQiLCJtaXNzZWQiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwieCIsImxlbmd0aCIsInR5cGUiLCJibGFtZSIsInRleHQiLCJlbiIsIm1hcCIsIlNob3J0TmFtZSIsImpvaW4iLCJkZSIsImZyIiwiamEiLCJjbiIsImtvIiwibWlzc2VkTWl0aWdhdGlvbkJ1ZmYiLCJlZmZlY3RJZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJOZXRSZWdleGVzIiwibWlzc2VkRGFtYWdlQWJpbGl0eSIsImFiaWxpdHlJZCIsIm1pc3NlZEhlYWwiLCJtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSIsInpvbmVJZCIsIlpvbmVJZCIsInRyaWdnZXJzIiwiX2RhdGEiLCJsb3N0Rm9vZCIsImluQ29tYmF0IiwiSXNQbGF5ZXJJZCIsImxpbmUiLCJuZXRSZWdleEZyIiwibmV0UmVnZXhKYSIsIm5ldFJlZ2V4Q24iLCJuZXRSZWdleEtvIiwibWUiLCJmdWxsVGV4dCIsInN0cmlraW5nRHVtbXlCeUxvY2FsZSIsInN0cmlraW5nRHVtbXlOYW1lcyIsInZhbHVlcyIsImJvb3RDb3VudCIsImFiaWxpdHkiLCJEYW1hZ2VGcm9tTWF0Y2hlcyIsImVmZmVjdCIsInBva2VDb3VudCIsImRhbWFnZVdhcm4iLCJzaGFyZVdhcm4iLCJkYW1hZ2VGYWlsIiwiZ2FpbnNFZmZlY3RXYXJuIiwiZ2FpbnNFZmZlY3RGYWlsIiwiZGVhdGhSZWFzb24iLCJyZWFzb24iLCJzaGFyZUZhaWwiLCJzZWVuRGlhbW9uZER1c3QiLCJzb2xvV2FybiIsInBhcnNlRmxvYXQiLCJkdXJhdGlvbiIsInpvbWJpZSIsInNoaWVsZCIsImhhc0ltcCIsInBsYXllckRhbWFnZUZpZWxkcyIsImFzc2F1bHQiLCJhYmlsaXR5V2FybiIsImZsYWdzIiwic3Vic3RyIiwic29sb0ZhaWwiLCJjYXB0dXJlIiwibmV0UmVnZXhEZSIsInBoYXNlTnVtYmVyIiwiaW5pdGlhbGl6ZWQiLCJnYW1lQ291bnQiLCJ0YXJnZXRJZCIsImlzRGVjaXNpdmVCYXR0bGVFbGVtZW50IiwiaXNOZW9FeGRlYXRoIiwiYWJpbGl0eU5hbWUiLCJoYXNCZXlvbmREZWF0aCIsImRvdWJsZUF0dGFja01hdGNoZXMiLCJhcnIiLCJ2dWxuIiwia0ZsYWdJbnN0YW50RGVhdGgiLCJoYXNEb29tIiwic2xpY2UiLCJmYXVsdExpbmVUYXJnZXQiLCJoYXNPcmIiLCJjbG91ZE1hcmtlcnMiLCJtIiwibm9PcmIiLCJzdHIiLCJoYXRlZCIsIndyb25nQnVmZiIsIm5vQnVmZiIsImhhc0FzdHJhbCIsImhhc1VtYnJhbCIsImZpcnN0SGVhZG1hcmtlciIsInBhcnNlSW50IiwiZ2V0SGVhZG1hcmtlcklkIiwiZGVjT2Zmc2V0IiwidG9TdHJpbmciLCJwYWRTdGFydCIsImZpcnN0TGFzZXJNYXJrZXIiLCJsYXN0TGFzZXJNYXJrZXIiLCJsYXNlck5hbWVUb051bSIsInNjdWxwdHVyZVlQb3NpdGlvbnMiLCJ5Iiwic2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQiLCJibGFkZU9mRmxhbWVDb3VudCIsIm51bWJlciIsIm5hbWVzIiwid2l0aE51bSIsIm93bmVycyIsIm1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMiLCJpc1N0YXR1ZVBvc2l0aW9uS25vd24iLCJpc1N0YXR1ZU5vcnRoIiwic2N1bHB0dXJlSWRzIiwib3RoZXJJZCIsInNvdXJjZVkiLCJvdGhlclkiLCJ5RGlmZiIsIk1hdGgiLCJhYnMiLCJvd25lciIsIm93bmVyTmljayIsInBpbGxhcklkVG9Pd25lciIsInBpbGxhck93bmVyIiwiZmlyZSIsInNtYWxsTGlvbklkVG9Pd25lciIsInNtYWxsTGlvbk93bmVycyIsImhhc1NtYWxsTGlvbiIsImhhc0ZpcmVEZWJ1ZmYiLCJjZW50ZXJZIiwiZGlyT2JqIiwiT3V0cHV0cyIsIm5vcnRoQmlnTGlvbiIsInNpbmdsZVRhcmdldCIsIm91dHB1dCIsInNvdXRoQmlnTGlvbiIsInNoYXJlZCIsImZpcmVEZWJ1ZmYiLCJsYWJlbHMiLCJwYXJzZXJMYW5nIiwiaGFzRGFyayIsImphZ2RUZXRoZXIiLCJ1bmRlZmluZWQiLCJpc1RhbmsiLCJoYXNUaHJvdHRsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7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RUFBRSxFIiwiZmlsZSI6InVpL2NvbW1vbi9vb3BzeXJhaWRzeV9kYXRhLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBBYmlsaXRpZXMgc2VlbSBpbnN0YW50LlxyXG5jb25zdCBhYmlsaXR5Q29sbGVjdFNlY29uZHMgPSAwLjU7XHJcbi8vIE9ic2VydmF0aW9uOiB1cCB0byB+MS4yIHNlY29uZHMgZm9yIGEgYnVmZiB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG5jb25zdCBlZmZlY3RDb2xsZWN0U2Vjb25kcyA9IDIuMDtcclxuXHJcbmNvbnN0IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMgPSAoX2V2dCwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gIGNvbnN0IHNvdXJjZUlkID0gbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gIGlmIChkYXRhLnBhcnR5LnBhcnR5SWRzLmluY2x1ZGVzKHNvdXJjZUlkKSlcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICBpZiAoZGF0YS5wZXRJZFRvT3duZXJJZCkge1xyXG4gICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbc291cmNlSWRdO1xyXG4gICAgaWYgKG93bmVySWQgJiYgZGF0YS5wYXJ0eS5wYXJ0eUlkcy5pbmNsdWRlcyhvd25lcklkKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vLyBhcmdzOiB0cmlnZ2VySWQsIG5ldFJlZ2V4LCBmaWVsZCwgdHlwZSwgaWdub3JlU2VsZlxyXG5jb25zdCBtaXNzZWRGdW5jID0gKGFyZ3MpID0+IFtcclxuICB7XHJcbiAgICAvLyBTdXJlLCBub3QgYWxsIG9mIHRoZXNlIGFyZSBcImJ1ZmZzXCIgcGVyIHNlLCBidXQgdGhleSdyZSBhbGwgaW4gdGhlIGJ1ZmZzIGZpbGUuXHJcbiAgICBpZDogYEJ1ZmYgJHthcmdzLnRyaWdnZXJJZH0gQ29sbGVjdGAsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogaXNJblBhcnR5Q29uZGl0aW9uRnVuYyxcclxuICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24gfHwge307XHJcbiAgICAgIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXSA9IGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXSB8fCBbXTtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdLnB1c2gobWF0Y2hlcyk7XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6IGBCdWZmICR7YXJncy50cmlnZ2VySWR9YCxcclxuICAgIG5ldFJlZ2V4OiBhcmdzLm5ldFJlZ2V4LFxyXG4gICAgY29uZGl0aW9uOiBpc0luUGFydHlDb25kaXRpb25GdW5jLFxyXG4gICAgZGVsYXlTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzLFxyXG4gICAgc3VwcHJlc3NTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzLFxyXG4gICAgbWlzdGFrZTogKF9lLCBkYXRhLCBfbWF0Y2hlcykgPT4ge1xyXG4gICAgICBpZiAoIWRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgY29uc3QgYWxsTWF0Y2hlcyA9IGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXTtcclxuICAgICAgaWYgKCFhbGxNYXRjaGVzKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHBhcnR5TmFtZXMgPSBkYXRhLnBhcnR5LnBhcnR5TmFtZXM7XHJcblxyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciBkZWFkIHBlb3BsZSBzb21laG93XHJcbiAgICAgIGNvbnN0IGdvdEJ1ZmZNYXAgPSB7fTtcclxuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHBhcnR5TmFtZXMpXHJcbiAgICAgICAgZ290QnVmZk1hcFtuYW1lXSA9IGZhbHNlO1xyXG5cclxuICAgICAgY29uc3QgZmlyc3RNYXRjaCA9IGFsbE1hdGNoZXNbMF07XHJcbiAgICAgIGxldCBzb3VyY2VOYW1lID0gZmlyc3RNYXRjaC5zb3VyY2U7XHJcbiAgICAgIC8vIEJsYW1lIHBldCBtaXN0YWtlcyBvbiBvd25lcnMuXHJcbiAgICAgIGlmIChkYXRhLnBldElkVG9Pd25lcklkKSB7XHJcbiAgICAgICAgY29uc3QgcGV0SWQgPSBmaXJzdE1hdGNoLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbcGV0SWRdO1xyXG4gICAgICAgIGlmIChvd25lcklkKSB7XHJcbiAgICAgICAgICBjb25zdCBvd25lck5hbWUgPSBkYXRhLnBhcnR5Lm5hbWVGcm9tSWQob3duZXJJZCk7XHJcbiAgICAgICAgICBpZiAob3duZXJOYW1lKVxyXG4gICAgICAgICAgICBzb3VyY2VOYW1lID0gb3duZXJOYW1lO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZG4ndCBmaW5kIG5hbWUgZm9yICR7b3duZXJJZH0gZnJvbSBwZXQgJHtwZXRJZH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhcmdzLmlnbm9yZVNlbGYpXHJcbiAgICAgICAgZ290QnVmZk1hcFtzb3VyY2VOYW1lXSA9IHRydWU7XHJcblxyXG4gICAgICBjb25zdCB0aGluZ05hbWUgPSBmaXJzdE1hdGNoW2FyZ3MuZmllbGRdO1xyXG4gICAgICBmb3IgKGNvbnN0IG1hdGNoZXMgb2YgYWxsTWF0Y2hlcykge1xyXG4gICAgICAgIC8vIEluIGNhc2UgeW91IGhhdmUgbXVsdGlwbGUgcGFydHkgbWVtYmVycyB3aG8gaGl0IHRoZSBzYW1lIGNvb2xkb3duIGF0IHRoZSBzYW1lXHJcbiAgICAgICAgLy8gdGltZSAobG9sPyksIHRoZW4gaWdub3JlIGFueWJvZHkgd2hvIHdhc24ndCB0aGUgZmlyc3QuXHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBmaXJzdE1hdGNoLnNvdXJjZSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBnb3RCdWZmTWFwW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG1pc3NlZCA9IE9iamVjdC5rZXlzKGdvdEJ1ZmZNYXApLmZpbHRlcigoeCkgPT4gIWdvdEJ1ZmZNYXBbeF0pO1xyXG4gICAgICBpZiAobWlzc2VkLmxlbmd0aCA9PT0gMClcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAvLyBUT0RPOiBvb3BzeSBjb3VsZCByZWFsbHkgdXNlIG1vdXNlb3ZlciBwb3B1cHMgZm9yIGRldGFpbHMuXHJcbiAgICAgIC8vIFRPRE86IGFsdGVybmF0aXZlbHksIGlmIHdlIGhhdmUgYSBkZWF0aCByZXBvcnQsIGl0J2QgYmUgZ29vZCB0b1xyXG4gICAgICAvLyBleHBsaWNpdGx5IGNhbGwgb3V0IHRoYXQgb3RoZXIgcGVvcGxlIGdvdCBhIGhlYWwgdGhpcyBwZXJzb24gZGlkbid0LlxyXG4gICAgICBpZiAobWlzc2VkLmxlbmd0aCA8IDQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogYXJncy50eXBlLFxyXG4gICAgICAgICAgYmxhbWU6IHNvdXJjZU5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiB0aGluZ05hbWUgKyAnIG1pc3NlZCAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyksXHJcbiAgICAgICAgICAgIGRlOiB0aGluZ05hbWUgKyAnIHZlcmZlaGx0ICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSxcclxuICAgICAgICAgICAgZnI6IHRoaW5nTmFtZSArICcgbWFucXXDqShlKSBzdXIgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpLFxyXG4gICAgICAgICAgICBqYTogJygnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJykgKyAnKSDjgYwnICsgdGhpbmdOYW1lICsgJ+OCkuWPl+OBkeOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSArICcg5rKh5Y+X5YiwICcgKyB0aGluZ05hbWUsXHJcbiAgICAgICAgICAgIGtvOiB0aGluZ05hbWUgKyAnICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSArICfsl5Dqsowg7KCB7Jqp7JWI65CoJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICAvLyBJZiB0aGVyZSdzIHRvbyBtYW55IHBlb3BsZSwganVzdCBsaXN0IHRoZSBudW1iZXIgb2YgcGVvcGxlIG1pc3NlZC5cclxuICAgICAgLy8gVE9ETzogd2UgY291bGQgYWxzbyBsaXN0IGV2ZXJ5Ym9keSBvbiBzZXBhcmF0ZSBsaW5lcz9cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0eXBlOiBhcmdzLnR5cGUsXHJcbiAgICAgICAgYmxhbWU6IHNvdXJjZU5hbWUsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46IHRoaW5nTmFtZSArICcgbWlzc2VkICcgKyBtaXNzZWQubGVuZ3RoICsgJyBwZW9wbGUnLFxyXG4gICAgICAgICAgZGU6IHRoaW5nTmFtZSArICcgdmVyZmVobHRlICcgKyBtaXNzZWQubGVuZ3RoICsgJyBQZXJzb25lbicsXHJcbiAgICAgICAgICBmcjogdGhpbmdOYW1lICsgJyBtYW5xdcOpKGUpIHN1ciAnICsgbWlzc2VkLmxlbmd0aCArICcgcGVyc29ubmVzJyxcclxuICAgICAgICAgIGphOiBtaXNzZWQubGVuZ3RoICsgJ+S6uuOBjCcgKyB0aGluZ05hbWUgKyAn44KS5Y+X44GR44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgIGNuOiAn5pyJJyArIG1pc3NlZC5sZW5ndGggKyAn5Lq65rKh5Y+X5YiwICcgKyB0aGluZ05hbWUsXHJcbiAgICAgICAgICBrbzogdGhpbmdOYW1lICsgJyAnICsgbWlzc2VkLmxlbmd0aCArICfrqoXsl5Dqsowg7KCB7Jqp7JWI65CoJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgIGlmIChkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbilcclxuICAgICAgICBkZWxldGUgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdO1xyXG4gICAgfSxcclxuICB9LFxyXG5dO1xyXG5cclxuY29uc3QgbWlzc2VkTWl0aWdhdGlvbkJ1ZmYgPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5lZmZlY3RJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgZWZmZWN0SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogYXJncy5lZmZlY3RJZCB9KSxcclxuICAgIGZpZWxkOiAnZWZmZWN0JyxcclxuICAgIHR5cGU6ICdoZWFsJyxcclxuICAgIGlnbm9yZVNlbGY6IGFyZ3MuaWdub3JlU2VsZixcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGVmZmVjdENvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkRGFtYWdlQWJpbGl0eSA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eUlkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICBmaWVsZDogJ2FiaWxpdHknLFxyXG4gICAgdHlwZTogJ2RhbWFnZScsXHJcbiAgICBpZ25vcmVTZWxmOiBhcmdzLmlnbm9yZVNlbGYsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBhYmlsaXR5Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRIZWFsID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGZpZWxkOiAnYWJpbGl0eScsXHJcbiAgICB0eXBlOiAnaGVhbCcsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBhYmlsaXR5Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSA9IG1pc3NlZEhlYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0Y2hBbGwsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBNYXBwZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hZGRlZENvbWJhdGFudEZ1bGwoKSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAobWF0Y2hlcy5vd25lcklkID09PSAnMCcpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWQgPSBkYXRhLnBldElkVG9Pd25lcklkIHx8IHt9O1xyXG4gICAgICAgIC8vIEZpeCBhbnkgbG93ZXJjYXNlIGlkcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkW21hdGNoZXMuaWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLm93bmVySWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQnVmZiBQZXQgVG8gT3duZXIgQ2xlYXJlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmNoYW5nZVpvbmUoKSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICAvLyBDbGVhciB0aGlzIGhhc2ggcGVyaW9kaWNhbGx5IHNvIGl0IGRvZXNuJ3QgaGF2ZSBmYWxzZSBwb3NpdGl2ZXMuXHJcbiAgICAgICAgZGF0YS5wZXRJZFRvT3duZXJJZCA9IHt9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQcmVmZXIgYWJpbGl0aWVzIHRvIGVmZmVjdHMsIGFzIGVmZmVjdHMgdGFrZSBsb25nZXIgdG8gcm9sbCB0aHJvdWdoIHRoZSBwYXJ0eS5cclxuICAgIC8vIEhvd2V2ZXIsIHNvbWUgdGhpbmdzIGFyZSBvbmx5IGVmZmVjdHMgYW5kIHNvIHRoZXJlIGlzIG5vIGNob2ljZS5cclxuXHJcbiAgICAvLyBGb3IgdGhpbmdzIHlvdSBjYW4gc3RlcCBpbiBvciBvdXQgb2YsIGdpdmUgYSBsb25nZXIgdGltZXI/ICBUaGlzIGlzbid0IHBlcmZlY3QuXHJcbiAgICAvLyBUT0RPOiBpbmNsdWRlIHNvaWwgaGVyZT8/XHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnQ29sbGVjdGl2ZSBVbmNvbnNjaW91cycsIGVmZmVjdElkOiAnMzUxJywgY29sbGVjdFNlY29uZHM6IDEwIH0pLFxyXG4gICAgLy8gQXJtcyBVcCA9IDQ5OCAob3RoZXJzKSwgUGFzc2FnZSBPZiBBcm1zID0gNDk3ICh5b3UpLiAgVXNlIGJvdGggaW4gY2FzZSBldmVyeWJvZHkgaXMgbWlzc2VkLlxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ1Bhc3NhZ2Ugb2YgQXJtcycsIGVmZmVjdElkOiAnNDlbNzhdJywgaWdub3JlU2VsZjogdHJ1ZSwgY29sbGVjdFNlY29uZHM6IDEwIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdEaXZpbmUgVmVpbCcsIGVmZmVjdElkOiAnMkQ3JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnSGVhcnQgT2YgTGlnaHQnLCBhYmlsaXR5SWQ6ICczRjIwJyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdEYXJrIE1pc3Npb25hcnknLCBhYmlsaXR5SWQ6ICc0MDU3JyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdTaGFrZSBJdCBPZmYnLCBhYmlsaXR5SWQ6ICcxQ0RDJyB9KSxcclxuXHJcbiAgICAvLyAzRjQ0IGlzIHRoZSBjb3JyZWN0IFF1YWRydXBsZSBUZWNobmljYWwgRmluaXNoLCBvdGhlcnMgYXJlIERpbmt5IFRlY2huaWNhbCBGaW5pc2guXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdUZWNobmljYWwgRmluaXNoJywgYWJpbGl0eUlkOiAnM0Y0WzEtNF0nIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnRGl2aW5hdGlvbicsIGFiaWxpdHlJZDogJzQwQTgnIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQnJvdGhlcmhvb2QnLCBhYmlsaXR5SWQ6ICcxQ0U0JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0JhdHRsZSBMaXRhbnknLCBhYmlsaXR5SWQ6ICdERTUnIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnRW1ib2xkZW4nLCBhYmlsaXR5SWQ6ICcxRDYwJyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0JhdHRsZSBWb2ljZScsIGFiaWxpdHlJZDogJzc2JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuXHJcbiAgICAvLyBUb28gbm9pc3kgKHByb2NzIGV2ZXJ5IHRocmVlIHNlY29uZHMsIGFuZCBiYXJkcyBvZnRlbiBvZmYgZG9pbmcgbWVjaGFuaWNzKS5cclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ1dhbmRlcmVyXFwncyBNaW51ZXQnLCBlZmZlY3RJZDogJzhBOCcsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcbiAgICAvLyBtaXNzZWREYW1hZ2VCdWZmKHsgaWQ6ICdNYWdlXFwncyBCYWxsYWQnLCBlZmZlY3RJZDogJzhBOScsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcbiAgICAvLyBtaXNzZWREYW1hZ2VCdWZmKHsgaWQ6ICdBcm15XFwncyBQYWVvbicsIGVmZmVjdElkOiAnOEFBJywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnVHJvdWJhZG91cicsIGFiaWxpdHlJZDogJzFDRUQnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1RhY3RpY2lhbicsIGFiaWxpdHlJZDogJzQxRjknIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NoaWVsZCBTYW1iYScsIGFiaWxpdHlJZDogJzNFOEMnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdNYW50cmEnLCBhYmlsaXR5SWQ6ICc0MScgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnRGV2b3Rpb24nLCBhYmlsaXR5SWQ6ICcxRDFBJyB9KSxcclxuXHJcbiAgICAvLyBNYXliZSB1c2luZyBhIGhlYWxlciBMQjEvTEIyIHNob3VsZCBiZSBhbiBlcnJvciBmb3IgdGhlIGhlYWxlci4gTzopXHJcbiAgICAvLyAuLi5taXNzZWRIZWFsKHsgaWQ6ICdIZWFsaW5nIFdpbmQnLCBhYmlsaXR5SWQ6ICdDRScgfSksXHJcbiAgICAvLyAuLi5taXNzZWRIZWFsKHsgaWQ6ICdCcmVhdGggb2YgdGhlIEVhcnRoJywgYWJpbGl0eUlkOiAnQ0YnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ01lZGljYScsIGFiaWxpdHlJZDogJzdDJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ01lZGljYSBJSScsIGFiaWxpdHlJZDogJzg1JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FmZmxhdHVzIFJhcHR1cmUnLCBhYmlsaXR5SWQ6ICc0MDk2JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1RlbXBlcmFuY2UnLCBhYmlsaXR5SWQ6ICc3NTEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnUGxlbmFyeSBJbmR1bGdlbmNlJywgYWJpbGl0eUlkOiAnMUQwOScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdQdWxzZSBvZiBMaWZlJywgYWJpbGl0eUlkOiAnRDAnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1N1Y2NvcicsIGFiaWxpdHlJZDogJ0JBJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0luZG9taXRhYmlsaXR5JywgYWJpbGl0eUlkOiAnREZGJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0RlcGxveW1lbnQgVGFjdGljcycsIGFiaWxpdHlJZDogJ0UwMScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdXaGlzcGVyaW5nIERhd24nLCBhYmlsaXR5SWQ6ICczMjMnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnRmV5IEJsZXNzaW5nJywgYWJpbGl0eUlkOiAnNDBBMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdDb25zb2xhdGlvbicsIGFiaWxpdHlJZDogJzQwQTMnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQW5nZWxcXCdzIFdoaXNwZXInLCBhYmlsaXR5SWQ6ICc0MEE2JyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdGZXkgSWxsdW1pbmF0aW9uJywgYWJpbGl0eUlkOiAnMzI1JyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdTZXJhcGhpYyBJbGx1bWluYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE3JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FuZ2VsIEZlYXRoZXJzJywgYWJpbGl0eUlkOiAnMTA5NycgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnSGVsaW9zJywgYWJpbGl0eUlkOiAnRTEwJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FzcGVjdGVkIEhlbGlvcycsIGFiaWxpdHlJZDogJ0UxMScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBc3BlY3RlZCBIZWxpb3MnLCBhYmlsaXR5SWQ6ICczMjAwJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0NlbGVzdGlhbCBPcHBvc2l0aW9uJywgYWJpbGl0eUlkOiAnNDBBOScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBc3RyYWwgU3Rhc2lzJywgYWJpbGl0eUlkOiAnMTA5OCcgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnV2hpdGUgV2luZCcsIGFiaWxpdHlJZDogJzJDOEUnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnR29ic2tpbicsIGFiaWxpdHlJZDogJzQ3ODAnIH0pLFxyXG5cclxuICAgIC8vIFRPRE86IGV4cG9ydCBhbGwgb2YgdGhlc2UgbWlzc2VkIGZ1bmN0aW9ucyBpbnRvIHRoZWlyIG93biBoZWxwZXJcclxuICAgIC8vIGFuZCB0aGVuIGFkZCB0aGlzIHRvIHRoZSBEZWx1YnJ1bSBSZWdpbmFlIGZpbGVzIGRpcmVjdGx5LlxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0xvc3QgQWV0aGVyc2hpZWxkJywgYWJpbGl0eUlkOiAnNTc1MycgfSksXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEdlbmVyYWwgbWlzdGFrZXM7IHRoZXNlIGFwcGx5IGV2ZXJ5d2hlcmUuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRjaEFsbCxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUcmlnZ2VyIGlkIGZvciBpbnRlcm5hbGx5IGdlbmVyYXRlZCBlYXJseSBwdWxsIHdhcm5pbmcuXHJcbiAgICAgIGlkOiAnR2VuZXJhbCBFYXJseSBQdWxsJyxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBGb29kIEJ1ZmYnLFxyXG4gICAgICAvLyBXZWxsIEZlZFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDgnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBQcmV2ZW50IFwiRW9zIGxvc2VzIHRoZSBlZmZlY3Qgb2YgV2VsbCBGZWQgZnJvbSBDcml0bG8gTWNnZWVcIlxyXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnRhcmdldCA9PT0gbWF0Y2hlcy5zb3VyY2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2QgPSBkYXRhLmxvc3RGb29kIHx8IHt9O1xyXG4gICAgICAgIC8vIFdlbGwgRmVkIGJ1ZmYgaGFwcGVucyByZXBlYXRlZGx5IHdoZW4gaXQgZmFsbHMgb2ZmIChXSFkpLFxyXG4gICAgICAgIC8vIHNvIHN1cHByZXNzIG11bHRpcGxlIG9jY3VycmVuY2VzLlxyXG4gICAgICAgIGlmICghZGF0YS5pbkNvbWJhdCB8fCBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsb3N0IGZvb2QgYnVmZicsXHJcbiAgICAgICAgICAgIGRlOiAnTmFocnVuZ3NidWZmIHZlcmxvcmVuJyxcclxuICAgICAgICAgICAgZnI6ICdCdWZmIG5vdXJyaXR1cmUgdGVybWluw6llJyxcclxuICAgICAgICAgICAgamE6ICfpo6/lirnmnpzjgYzlpLHjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WkseWOu+mjn+eJqUJVRkYnLFxyXG4gICAgICAgICAgICBrbzogJ+ydjOyLnSDrsoTtlIQg7ZW07KCcJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBXZWxsIEZlZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmxvc3RGb29kKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBSYWJiaXQgTWVkaXVtJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnOEUwJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuSXNQbGF5ZXJJZChtYXRjaGVzLnNvdXJjZUlkKSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy5zb3VyY2UsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnYnVubnknLFxyXG4gICAgICAgICAgICBkZTogJ0hhc2UnLFxyXG4gICAgICAgICAgICBmcjogJ2xhcGluJyxcclxuICAgICAgICAgICAgamE6ICfjgYbjgZXjgY4nLFxyXG4gICAgICAgICAgICBjbjogJ+WFlOWtkCcsXHJcbiAgICAgICAgICAgIGtvOiAn7Yag64G8JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRlc3QgbWlzdGFrZSB0cmlnZ2Vycy5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1pZGRsZUxhTm9zY2VhLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb3cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgYm93IGNvdXJ0ZW91c2x5IHRvIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB2b3VzIGluY2xpbmV6IGRldmFudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644Gr44GK6L6e5YSA44GX44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuaBreaVrOWcsOWvueacqOS6uuihjOekvC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsl5Dqsowg6rO17IaQ7ZWY6rKMIOyduOyCrO2VqeuLiOuLpC4qPycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncHVsbCcsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIGZ1bGxUZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm93JyxcclxuICAgICAgICAgICAgZGU6ICdCb2dlbicsXHJcbiAgICAgICAgICAgIGZyOiAnU2FsdWVyJyxcclxuICAgICAgICAgICAgamE6ICfjgYrovp7lhIAnLFxyXG4gICAgICAgICAgICBjbjogJ+meoOi6rCcsXHJcbiAgICAgICAgICAgIGtvOiAn7J247IKsJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBXaXBlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJpZCBmYXJld2VsbCB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgZmFpdGVzIHZvcyBhZGlldXggYXUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+WIpeOCjOOBruaMqOaLtuOCkuOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirlkJHmnKjkurrlkYrliKsuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOyekeuzhCDsnbjsgqzrpbwg7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3aXBlJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgZnVsbFRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQYXJ0eSBXaXBlJyxcclxuICAgICAgICAgICAgZGU6ICdHcnVwcGVud2lwZScsXHJcbiAgICAgICAgICAgIGZyOiAnUGFydHkgV2lwZScsXHJcbiAgICAgICAgICAgIGphOiAn44Ov44Kk44OXJyxcclxuICAgICAgICAgICAgY246ICflm6Lnga0nLFxyXG4gICAgICAgICAgICBrbzogJ+2MjO2LsCDsoITrqbgnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvb3RzaGluZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICczNScgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZnI6ICdNYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQnLFxyXG4gICAgICAgICAgamE6ICfmnKjkuronLFxyXG4gICAgICAgICAgY246ICfmnKjkuronLFxyXG4gICAgICAgICAga286ICfrgpjrrLTsnbjtmJUnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc3RyaWtpbmdEdW1teU5hbWVzID0gT2JqZWN0LnZhbHVlcyhzdHJpa2luZ0R1bW15QnlMb2NhbGUpO1xyXG4gICAgICAgIHJldHVybiBzdHJpa2luZ0R1bW15TmFtZXMuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCA9IGRhdGEuYm9vdENvdW50IHx8IDA7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQrKztcclxuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtkYXRhLmJvb3RDb3VudH0pOiAke2RhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcyl9YDtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiB0ZXh0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgTGVhZGVuIEZpc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNzQ1JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMuc291cmNlID09PSBkYXRhLm1lLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZ29vZCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IE9vcHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogbWF0Y2hlcy5saW5lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgUG9rZSBDb2xsZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IHBva2UgdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHRvdWNoZXogbMOpZ8OocmVtZW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCBkdSBkb2lndC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgpLjgaTjgaTjgYTjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q55So5omL5oyH5oiz5ZCR5pyo5Lq6Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleydhCDsv6Hsv6Eg7LCM66aF64uI64ukLio/JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBva2VDb3VudCA9IChkYXRhLnBva2VDb3VudCB8fCAwKSArIDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgUG9rZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBwb2tlIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB0b3VjaGV6IGzDqWfDqHJlbWVudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQgZHUgZG9pZ3QuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644KS44Gk44Gk44GE44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKueUqOaJi+aMh+aIs+WQkeacqOS6ui4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsnYQg7L+h7L+hIOywjOumheuLiOuLpC4qPycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gMSBwb2tlIGF0IGEgdGltZSBpcyBmaW5lLCBidXQgbW9yZSB0aGFuIG9uZSBpbiA1IHNlY29uZHMgaXMgKE9CVklPVVNMWSkgYSBtaXN0YWtlLlxyXG4gICAgICAgIGlmICghZGF0YS5wb2tlQ291bnQgfHwgZGF0YS5wb2tlQ291bnQgPD0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgVG9vIG1hbnkgcG9rZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgWnUgdmllbGUgUGlla3NlciAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgZnI6IGBUcm9wIGRlIHRvdWNoZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGphOiBg44GE44Gj44Gx44GE44Gk44Gk44GE44GfICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBjbjogYOaIs+WkquWkmuS4i+WVpiAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAga286IGDrhIjrrLQg66eO7J20IOywjOumhCAoJHtkYXRhLnBva2VDb3VudH3rsogpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IGRlbGV0ZSBkYXRhLnBva2VDb3VudCxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJZnJpdCBTdG9yeSBNb2RlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVCb3dsT2ZFbWJlcnMsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lmcml0Tm0gUmFkaWFudCBQbHVtZSc6ICcyREUnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBJbmNpbmVyYXRlJzogJzFDNScsXHJcbiAgICAnSWZyaXRObSBFcnVwdGlvbic6ICcyREQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gU3RvcnkgTW9kZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuTm0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzNDRCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5ObSBMYW5kc2xpZGUnOiAnMjhBJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuTm0gUm9jayBCdXN0ZXInOiAnMjgxJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gODIzLzgyNC84MjUsIFdhdGVyc3BvdXQgPSA4MjlcclxuXHJcbi8vIExldmlhdGhhbiBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aUV4IEdyYW5kIEZhbGwnOiAnODJGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlFeCBIeWRybyBTaG90JzogJzc0OCcsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpRXggRHJlYWRzdG9ybSc6ICc3NDknLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpRXggQm9keSBTbGFtJzogJzgyQScsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMSc6ICc4OEEnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMic6ICc4OEInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMyc6ICc4MkMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpRXggRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpRXggSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aUV4IEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzgyQScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIEhhcmRcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFIbSBJY2ljbGUgSW1wYWN0JzogJzk5MycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhSG0gR2xhY2llciBCYXNoJzogJzlBMScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEtub2NrYmFjayB0YW5rIGNsZWF2ZS5cclxuICAgICdTaGl2YUhtIEhlYXZlbmx5IFN0cmlrZSc6ICc5QTAnLFxyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFIbSBIYWlsc3Rvcm0nOiAnOTk4JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVGFua2J1c3Rlci4gIFRoaXMgaXMgU2hpdmEgSGFyZCBtb2RlLCBub3QgU2hpdmEgRXh0cmVtZS4gIFBsZWFzZSFcclxuICAgICdTaGl2YUhtIEljZWJyYW5kJzogJzk5NicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGlhbW9uZCBEdXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnOThBJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuc2VlbkRpYW1vbmREdXN0ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDlBMyBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC4gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBzbyBvbmx5IGEgbWlzdGFrZSBhZnRlciB0aGF0LlxyXG4gICAgICAgIC8vIFVubGlrZSBleHRyZW1lLCB0aGlzIGhhcyB0aGUgc2FtZSAyMCBzZWNvbmQgZHVyYXRpb24gYXMgdGhlIGludGVybWlzc2lvbi5cclxuICAgICAgICByZXR1cm4gZGF0YS5zZWVuRGlhbW9uZER1c3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFFeCBJY2ljbGUgSW1wYWN0JzogJ0JFQicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnQkVDJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnQkU5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIDI3MCBkZWdyZWUgYXR0YWNrLlxyXG4gICAgJ1NoaXZhRXggR2xhc3MgRGFuY2UnOiAnQkRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnQkUyJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJ0JFMCcsXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gUGFydHkgc2hhcmVkIHRhbmtidXN0ZXJcclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJ0JFMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhRXggRGVlcCBGcmVlemUnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSBDOEEgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKgv44OS44Ot44Kk44OD44KvLiBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gSGFyZFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1NTMnLFxyXG4gICAgJ1RpdGFuSG0gQnVyc3QnOiAnNDFDJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIExhbmRzbGlkZSc6ICc1NTQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5IbSBSb2NrIEJ1c3Rlcic6ICc1NTAnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5IbSBNb3VudGFpbiBCdXN0ZXInOiAnMjgzJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRpdGFuIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNUJFJyxcclxuICAgICdUaXRhbkV4IEJ1cnN0JzogJzVCRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBMYW5kc2xpZGUnOiAnNUJCJyxcclxuICAgICdUaXRhbkV4IEdhb2xlciBMYW5kc2xpZGUnOiAnNUMzJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggUm9jayBCdXN0ZXInOiAnNUI3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTW91bnRhaW4gQnVzdGVyJzogJzVCOCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWVwaW5nQ2l0eU9mTWhhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQ3JpdGljYWwgQml0ZSc6ICcxODQ4JywgLy8gU2Fyc3VjaHVzIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSZWFsbSBTaGFrZXInOiAnMTgzRScsIC8vIEZpcnN0IERhdWdodGVyIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtzY3JlZW4nOiAnMTgzQycsIC8vIEZpcnN0IERhdWdodGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrZW4gU3ByYXknOiAnMTgyNCcsIC8vIEFyYWNobmUgRXZlIHJlYXIgY29uYWwgYW9lXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAxJzogJzE4MzcnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAxXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAyJzogJzE4MzYnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAyXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAzJzogJzE4MzUnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAzXHJcbiAgICAnV2VlcGluZyBTcGlkZXIgVGhyZWFkJzogJzE4MzknLCAvLyBBcmFjaG5lIEV2ZSBzcGlkZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIEZpcmUgSUknOiAnMTg0RScsIC8vIEJsYWNrIE1hZ2UgQ29ycHNlIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIE5lY3JvcHVyZ2UnOiAnMTdENycsIC8vIEZvcmdhbGwgU2hyaXZlbGVkIFRhbG9uIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSb3R0ZW4gQnJlYXRoJzogJzE3RDAnLCAvLyBGb3JnYWxsIERhaGFrIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBNb3cnOiAnMTdEMicsIC8vIEZvcmdhbGwgSGFhZ2VudGkgdW5tYXJrZWQgY2xlYXZlXHJcbiAgICAnV2VlcGluZyBEYXJrIEVydXB0aW9uJzogJzE3QzMnLCAvLyBGb3JnYWxsIHB1ZGRsZSBtYXJrZXJcclxuICAgIC8vIDE4MDYgaXMgYWxzbyBGbGFyZSBTdGFyLCBidXQgaWYgeW91IGdldCBieSAxODA1IHlvdSBhbHNvIGdldCBoaXQgYnkgMTgwNj9cclxuICAgICdXZWVwaW5nIEZsYXJlIFN0YXInOiAnMTgwNScsIC8vIE96bWEgY3ViZSBwaGFzZSBkb251dFxyXG4gICAgJ1dlZXBpbmcgRXhlY3JhdGlvbic6ICcxODI5JywgLy8gT3ptYSB0cmlhbmdsZSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAxJzogJzE4MEInLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMic6ICcxODBGJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBFbnRhbmdsZW1lbnQnOiAnMTgxRCcsIC8vIENhbG9maXN0ZXJpIGxhbmRtaW5lIHB1ZGRsZSBwcm9jXHJcbiAgICAnV2VlcGluZyBFdmlsIEN1cmwnOiAnMTgxNicsIC8vIENhbG9maXN0ZXJpIGF4ZVxyXG4gICAgJ1dlZXBpbmcgRXZpbCBUcmVzcyc6ICcxODE3JywgLy8gQ2Fsb2Zpc3RlcmkgYnVsYlxyXG4gICAgJ1dlZXBpbmcgRGVwdGggQ2hhcmdlJzogJzE4MjAnLCAvLyBDYWxvZmlzdGVyaSBjaGFyZ2UgdG8gZWRnZVxyXG4gICAgJ1dlZXBpbmcgRmVpbnQgUGFydGljbGUgQmVhbSc6ICcxOTI4JywgLy8gQ2Fsb2Zpc3Rlcmkgc2t5IGxhc2VyXHJcbiAgICAnV2VlcGluZyBFdmlsIFN3aXRjaCc6ICcxODE1JywgLy8gQ2Fsb2Zpc3RlcmkgbGFzZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdXZWVwaW5nIEFyYWNobmUgV2ViJzogJzE4NUUnLCAvLyBBcmFjaG5lIEV2ZSBoZWFkbWFya2VyIHdlYiBhb2VcclxuICAgICdXZWVwaW5nIEVhcnRoIEFldGhlcic6ICcxODQxJywgLy8gQXJhY2huZSBFdmUgb3Jic1xyXG4gICAgJ1dlZXBpbmcgRXBpZ3JhcGgnOiAnMTg1MicsIC8vIEhlYWRzdG9uZSB1bnRlbGVncmFwaGVkIGxhc2VyIGxpbmUgdGFuayBhdHRhY2tcclxuICAgIC8vIFRoaXMgaXMgdG9vIG5vaXN5LiAgQmV0dGVyIHRvIHBvcCB0aGUgYmFsbG9vbnMgdGhhbiB3b3JyeSBhYm91dCBmcmllbmRzLlxyXG4gICAgLy8gJ1dlZXBpbmcgRXhwbG9zaW9uJzogJzE4MDcnLCAvLyBPem1hc3BoZXJlIEN1YmUgb3JiIGV4cGxvc2lvblxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDEnOiAnMTgwQycsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIFNwbGl0IEVuZCAyJzogJzE4MTAnLCAvLyBDYWxvZmlzdGVyaSB0YW5rIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBCbG9vZGllZCBOYWlsJzogJzE4MUYnLCAvLyBDYWxvZmlzdGVyaSBheGUvYnVsYiBhcHBlYXJpbmdcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgSHlzdGVyaWEnOiAnMTI4JywgLy8gQXJhY2huZSBFdmUgRnJvbmQgQWZmZWFyZFxyXG4gICAgJ1dlZXBpbmcgWm9tYmlmaWNhdGlvbic6ICcxNzMnLCAvLyBGb3JnYWxsIHRvbyBtYW55IHpvbWJpZSBwdWRkbGVzXHJcbiAgICAnV2VlcGluZyBUb2FkJzogJzFCNycsIC8vIEZvcmdhbGwgQnJhbmQgb2YgdGhlIEZhbGxlbiBmYWlsdXJlXHJcbiAgICAnV2VlcGluZyBEb29tJzogJzM4RScsIC8vIEZvcmdhbGwgSGFhZ2VudGkgTW9ydGFsIFJheVxyXG4gICAgJ1dlZXBpbmcgQXNzaW1pbGF0aW9uJzogJzQyQycsIC8vIE96bWFzaGFkZSBBc3NpbWlsYXRpb24gbG9vay1hd2F5XHJcbiAgICAnV2VlcGluZyBTdHVuJzogJzk1JywgLy8gQ2Fsb2Zpc3RlcmkgUGVuZXRyYXRpb24gbG9vay1hd2F5XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuem9tYmllID0gZGF0YS56b21iaWUgfHwge307XHJcbiAgICAgICAgZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIEdyYWR1YWwgWm9tYmlmaWNhdGlvbiBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQxNScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxN0NBJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuem9tYmllICYmICFkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRmxhcmluZyBFcGlncmFwaCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4NTYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5zaGllbGQgJiYgIWRhdGEuc2hpZWxkW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIGlkOiAnMTgzMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBkZTogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBmcjogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OCv+ODs+OCr+ODrOOCtuODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5Z2m5YWL5r+A5YWJJyxcclxuICAgICAgICAgICAga286ICftg7Hsu6Qg66CI7J207KCAJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBPem1hIEhvbHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxODJFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ2lzdCBydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDvvIEnLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gQWV0aGVyb2NoZW1pY2FsIFJlc2VhcmNoIEZhY2lsaXR5XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBZXRoZXJvY2hlbWljYWxSZXNlYXJjaEZhY2lsaXR5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBUkYgR3JhbmQgU3dvcmQnOiAnMjE2JywgLy8gQ29uYWwgQW9FLCBTY3JhbWJsZWQgSXJvbiBHaWFudCB0cmFzaFxyXG4gICAgJ0FSRiBDZXJtZXQgRHJpbGwnOiAnMjBFJywgLy8gTGluZSBBb0UsIDZ0aCBMZWdpb24gTWFnaXRlayBWYW5ndWFyZCB0cmFzaFxyXG4gICAgJ0FSRiBNYWdpdGVrIFNsdWcnOiAnMTBEQicsIC8vIExpbmUgQW9FLCBib3NzIDFcclxuICAgICdBUkYgQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnMTBFMicsIC8vIExhcmdlIHRhcmdldGVkIGNpcmNsZSBBb0UsIE1hZ2l0ZWsgVHVycmV0IElJLCBib3NzIDFcclxuICAgICdBUkYgTWFnaXRlayBTcHJlYWQnOiAnMTBEQycsIC8vIDI3MC1kZWdyZWUgcm9vbXdpZGUgQW9FLCBib3NzIDFcclxuICAgICdBUkYgRWVyaWUgU291bmR3YXZlJzogJzExNzAnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBDdWx0dXJlZCBFbXB1c2EgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgVGFpbCBTbGFwJzogJzEyNUYnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIERhbmNlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBDYWxjaWZ5aW5nIE1pc3QnOiAnMTIzQScsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgTmFnYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBQdW5jdHVyZSc6ICcxMTcxJywgLy8gU2hvcnQgbGluZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBTaWRlc3dpcGUnOiAnMTFBNycsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgUmVwdG9pZCB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBHdXN0JzogJzM5NScsIC8vIFRhcmdldGVkIHNtYWxsIGNpcmNsZSBBb0UsIEN1bHR1cmVkIE1pcnJvcmtuaWdodCB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBNYXJyb3cgRHJhaW4nOiAnRDBFJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBDaGltZXJhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFJpZGRsZSBPZiBUaGUgU3BoaW54JzogJzEwRTQnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBUkYgS2EnOiAnMTA2RScsIC8vIENvbmFsIEFvRSwgYm9zcyAyXHJcbiAgICAnQVJGIFJvdG9zd2lwZSc6ICcxMUNDJywgLy8gQ29uYWwgQW9FLCBGYWNpbGl0eSBEcmVhZG5vdWdodCB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBBdXRvLWNhbm5vbnMnOiAnMTJEOScsIC8vIExpbmUgQW9FLCBNb25pdG9yaW5nIERyb25lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIERlYXRoXFwncyBEb29yJzogJzRFQycsIC8vIExpbmUgQW9FLCBDdWx0dXJlZCBTaGFidGkgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgU3BlbGxzd29yZCc6ICc0RUInLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBFbmQgT2YgRGF5cyc6ICcxMEZEJywgLy8gTGluZSBBb0UsIGJvc3MgM1xyXG4gICAgJ0FSRiBCbGl6emFyZCBCdXJzdCc6ICcxMEZFJywgLy8gRml4ZWQgY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRmlyZSBCdXJzdCc6ICcxMEZGJywgLy8gRml4ZWQgY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgU2VhIE9mIFBpdGNoJzogJzEyREUnLCAvLyBUYXJnZXRlZCBwZXJzaXN0ZW50IGNpcmNsZSBBb0VzLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBCbGl6emFyZCBJSSc6ICcxMEYzJywgLy8gUmFuZG9tIGNpcmNsZSBBb0VzLCBJZ2V5b3JobSwgYm9zcyAzXHJcbiAgICAnQVJGIERhcmsgRmlyZSBJSSc6ICcxMEY4JywgLy8gUmFuZG9tIGNpcmNsZSBBb0VzLCBMYWhhYnJlYSwgYm9zcyAzXHJcbiAgICAnQVJGIEFuY2llbnQgRXJ1cHRpb24nOiAnMTEwNCcsIC8vIFNlbGYtdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgYm9zcyA0XHJcbiAgICAnQVJGIEVudHJvcGljIEZsYW1lJzogJzExMDgnLCAvLyBMaW5lIEFvRXMsICBib3NzIDRcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FSRiBDaHRob25pYyBIdXNoJzogJzEwRTcnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdBUkYgSGVpZ2h0IE9mIENoYW9zJzogJzExMDEnLCAvLyBUYW5rIGNsZWF2ZSwgYm9zcyA0XHJcbiAgICAnQVJGIEFuY2llbnQgQ2lyY2xlJzogJzExMDInLCAvLyBUYXJnZXRlZCBkb251dCBBb0VzLCBib3NzIDRcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQVJGIFBldHJpZmFjdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcwMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlR3JlYXRHdWJhbExpYnJhcnlIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdHdWJhbEhtIFRlcnJvciBFeWUnOiAnOTMwJywgLy8gQ2lyY2xlIEFvRSwgU3BpbmUgQnJlYWtlciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gQmF0dGVyJzogJzE5OEEnLCAvLyBDaXJjbGUgQW9FLCB0cmFzaCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBDb25kZW1uYXRpb24nOiAnMzkwJywgLy8gQ29uYWwgQW9FLCBCaWJsaW92b3JlIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAxJzogJzE5NDMnLCAvLyBGYWxsaW5nIGJvb2sgc2hhZG93LCBib3NzIDFcclxuICAgICdHdWJhbEhtIERpc2NvbnRpbnVlIDInOiAnMTk0MCcsIC8vIFJ1c2ggQW9FIGZyb20gZW5kcywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAzJzogJzE5NDInLCAvLyBSdXNoIEFvRSBhY3Jvc3MsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRnJpZ2h0ZnVsIFJvYXInOiAnMTkzQicsIC8vIEdldC1PdXQgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDEnOiAnMTkzRCcsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMic6ICcxOTNGJywgLy8gSW5pdGlhbCBlbmQgYm9vayB3YXJuaW5nIEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAzJzogJzE5NDEnLCAvLyBJbml0aWFsIHNpZGUgYm9vayB3YXJuaW5nIEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEZXNvbGF0aW9uJzogJzE5OEMnLCAvLyBMaW5lIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERvdWJsZSBTbWFzaCc6ICcyNkEnLCAvLyBDb25hbCBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEYXJrbmVzcyc6ICczQTAnLCAvLyBDb25hbCBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBGaXJld2F0ZXInOiAnM0JBJywgLy8gQ2lyY2xlIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIEVsYm93IERyb3AnOiAnQ0JBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFyayc6ICcxOURGJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgSW5rc3RhaW4gdHJhc2hcclxuICAgICdHdWJhbEhtIFNlYWxzJzogJzE5NEEnLCAvLyBTdW4vTW9vbnNlYWwgZmFpbHVyZSwgYm9zcyAyXHJcbiAgICAnR3ViYWxIbSBXYXRlciBJSUknOiAnMUM2NycsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFBvcm9nbyBQZWdpc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIFJhZ2luZyBBeGUnOiAnMTcwMycsIC8vIFNtYWxsIGNvbmFsIEFvRSwgTWVjaGFub3NlcnZpdG9yIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBNYWdpYyBIYW1tZXInOiAnMTk5MCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEFwYW5kYSBtaW5pLWJvc3NcclxuICAgICdHdWJhbEhtIFByb3BlcnRpZXMgT2YgR3Jhdml0eSc6ICcxOTUwJywgLy8gQ2lyY2xlIEFvRSBmcm9tIGdyYXZpdHkgcHVkZGxlcywgYm9zcyAzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIExldml0YXRpb24nOiAnMTk0RicsIC8vIENpcmNsZSBBb0UgZnJvbSBsZXZpdGF0aW9uIHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gQ29tZXQnOiAnMTk2OScsIC8vIFNtYWxsIGNpcmNsZSBBb0UsIGludGVybWlzc2lvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnR3ViYWxIbSBFY2xpcHRpYyBNZXRlb3InOiAnMTk1QycsIC8vIExvUyBtZWNoYW5pYywgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdHdWJhbEhtIFNlYXJpbmcgV2luZCc6ICcxOTQ0JywgLy8gVGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gVGh1bmRlcic6ICcxOVtBQl0nLCAvLyBTcHJlYWQgbWFya2VyLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEZpcmUgZ2F0ZSBpbiBoYWxsd2F5IHRvIGJvc3MgMiwgbWFnbmV0IGZhaWx1cmUgb24gYm9zcyAyXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBCdXJucycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMEInIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGFyZ2V0cyB3aXRoIEltcCB3aGVuIFRodW5kZXIgSUlJIHJlc29sdmVzIHJlY2VpdmUgYSB2dWxuZXJhYmlsaXR5IHN0YWNrIGFuZCBicmllZiBzdHVuXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgVGh1bmRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxOTVbQUJdJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5oYXNJbXBbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdTaG9ja2VkIEltcCcsXHJcbiAgICAgICAgICAgIGRlOiAnU2Nob2NraWVydGVyIEltcCcsXHJcbiAgICAgICAgICAgIGphOiAn44Kr44OD44OR44KS6Kej6Zmk44GX44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmsrPnq6XnirbmgIHlkIPkuobmmrTpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIFF1YWtlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NTYnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIFRvcm5hZG8nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1Wzc4XScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gQWx3YXlzIGhpdHMgdGFyZ2V0LCBidXQgaWYgY29ycmVjdGx5IHJlc29sdmVkIHdpbGwgZGVhbCAwIGRhbWFnZVxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuU29obUFsSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU29obUFsSG0gRGVhZGx5IFZhcG9yJzogJzFEQzknLCAvLyBFbnZpcm9ubWVudGFsIGNpcmNsZSBBb0VzXHJcbiAgICAnU29obUFsSG0gRGVlcHJvb3QnOiAnMUNEQScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIE9kaW91cyBBaXInOiAnMUNEQicsIC8vIENvbmFsIEFvRSwgQmxvb21pbmcgQ2hpY2h1IHRyYXNoXHJcbiAgICAnU29obUFsSG0gR2xvcmlvdXMgQmxhemUnOiAnMUMzMycsIC8vIENpcmNsZSBBb0UsIFNtYWxsIFNwb3JlIFNhYywgYm9zcyAxXHJcbiAgICAnU29obUFsSG0gRm91bCBXYXRlcnMnOiAnMTE4QScsIC8vIENvbmFsIEFvRSwgTW91bnRhaW50b3AgT3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQbGFpbiBQb3VuZCc6ICcxMTg3JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTW91bnRhaW50b3AgSHJvcGtlbiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFBhbHN5bnl4aXMnOiAnMTE2MScsIC8vIENvbmFsIEFvRSwgT3Zlcmdyb3duIERpZmZsdWdpYSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFN1cmZhY2UgQnJlYWNoJzogJzFFODAnLCAvLyBDaXJjbGUgQW9FLCBHaWFudCBOZXRoZXJ3b3JtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gRnJlc2h3YXRlciBDYW5ub24nOiAnMTE5RicsIC8vIExpbmUgQW9FLCBHaWFudCBOZXRoZXJ3b3JtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gVGFpbCBTbWFzaCc6ICcxQzM1JywgLy8gVW50ZWxlZ3JhcGhlZCByZWFyIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBUYWlsIFN3aW5nJzogJzFDMzYnLCAvLyBVbnRlbGVncmFwaGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gUmlwcGVyIENsYXcnOiAnMUMzNycsIC8vIFVudGVsZWdyYXBoZWQgZnJvbnRhbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2luZCBTbGFzaCc6ICcxQzM4JywgLy8gQ2lyY2xlIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIENoYXJnZSc6ICcxQzM5JywgLy8gRGFzaCBhdHRhY2ssIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gSG90IENoYXJnZSc6ICcxQzNBJywgLy8gRGFzaCBhdHRhY2ssIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gRmlyZWJhbGwnOiAnMUMzQicsIC8vIFVudGVsZWdyYXBoZWQgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBMYXZhIEZsb3cnOiAnMUMzQycsIC8vIFVudGVsZWdyYXBoZWQgY29uYWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbGQgSG9ybic6ICcxNTA3JywgLy8gQ29uYWwgQW9FLCBBYmFsYXRoaWFuIENsYXkgR29sZW0gdHJhc2hcclxuICAgICdTb2htQWxIbSBMYXZhIEJyZWF0aCc6ICcxQzREJywgLy8gQ29uYWwgQW9FLCBMYXZhIENyYWIgdHJhc2hcclxuICAgICdTb2htQWxIbSBSaW5nIG9mIEZpcmUnOiAnMUM0QycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIFZvbGNhbm8gQW5hbGEgdHJhc2hcclxuICAgICdTb2htQWxIbSBNb2x0ZW4gU2lsayAxJzogJzFDNDMnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBMYXZhIFNjb3JwaW9uLCBib3NzIDNcclxuICAgICdTb2htQWxIbSBNb2x0ZW4gU2lsayAyJzogJzFDNDQnLCAvLyAyNzAtZGVncmVlIHJlYXIgQW9FLCBMYXZhIFNjb3JwaW9uLCBib3NzIDNcclxuICAgICdTb2htQWxIbSBNb2x0ZW4gU2lsayAzJzogJzFDNDInLCAvLyBSaW5nIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gUmVhbG0gU2hha2VyJzogJzFDNDEnLCAvLyBDaXJjbGUgQW9FLCBMYXZhIFNjb3JwaW9uLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFdhcm5zIGlmIHBsYXllcnMgc3RlcCBpbnRvIHRoZSBsYXZhIHB1ZGRsZXMuIFRoZXJlIGlzIHVuZm9ydHVuYXRlbHkgbm8gZGlyZWN0IGRhbWFnZSBldmVudC5cclxuICAgICAgaWQ6ICdTb2htQWxIbSBCdXJucycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMUMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsZXhhbmRlclRoZVNvdWxPZlRoZUNyZWF0b3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0ExMk4gU2FjcmFtZW50JzogJzFBRTYnLCAvLyBDcm9zcyBMYXNlcnNcclxuICAgICdBMTJOIEdyYXZpdGF0aW9uYWwgQW5vbWFseSc6ICcxQUVCJywgLy8gR3Jhdml0eSBQdWRkbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBMTJOIERpdmluZSBTcGVhcic6ICcxQUUzJywgLy8gSW5zdGFudCBjb25hbCB0YW5rIGNsZWF2ZVxyXG4gICAgJ0ExMk4gQmxhemluZyBTY291cmdlJzogJzFBRTknLCAvLyBPcmFuZ2UgaGVhZCBtYXJrZXIgc3BsYXNoIGRhbWFnZVxyXG4gICAgJ0ExMk4gUGxhaW50IE9mIFNldmVyaXR5JzogJzFBRjEnLCAvLyBBZ2dyYXZhdGVkIEFzc2F1bHQgc3BsYXNoIGRhbWFnZVxyXG4gICAgJ0ExMk4gQ29tbXVuaW9uJzogJzFBRkMnLCAvLyBUZXRoZXIgUHVkZGxlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ29sbGVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdCA9IGRhdGEuYXNzYXVsdCB8fCBbXTtcclxuICAgICAgICBkYXRhLmFzc2F1bHQucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJdCBpcyBhIGZhaWx1cmUgZm9yIGEgU2V2ZXJpdHkgbWFya2VyIHRvIHN0YWNrIHdpdGggdGhlIFNvbGlkYXJpdHkgZ3JvdXAuXHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IEZhaWx1cmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUFGMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuYXNzYXVsdC5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RpZG5cXCd0IFNwcmVhZCEnLFxyXG4gICAgICAgICAgICBkZTogJ05pY2h0IHZlcnRlaWx0IScsXHJcbiAgICAgICAgICAgIGZyOiAnTmUgc1xcJ2VzdCBwYXMgZGlzcGVyc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+aVo+mWi+OBl+OBquOBi+OBo+OBnyEnLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeacieaVo+W8gCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDIwLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuYXNzYXVsdDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGFNaGlnbyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIE1hZ2l0ZWsgUmF5JzogJzI0Q0UnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIFByZWRhdG9yIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIExvY2sgT24nOiAnMjA0NycsIC8vIEhvbWluZyBjaXJjbGVzLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAxJzogJzIwNDknLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAyJzogJzIwNEInLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAzJzogJzIwNEMnLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gU2hvdWxkZXIgQ2Fubm9uJzogJzI0RDAnLCAvLyBDaXJjbGUgQW9FLCBMZWdpb24gQXZlbmdlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDYW5ub25maXJlJzogJzIzRUQnLCAvLyBFbnZpcm9ubWVudGFsIGNpcmNsZSBBb0UsIHBhdGggdG8gYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzIwNUEnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gSW50ZWdyYXRlZCBBZXRoZXJvbW9kdWxhdG9yJzogJzIwNUInLCAvLyBSaW5nIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENpcmNsZSBPZiBEZWF0aCc6ICcyNEQ0JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIEhleGFkcm9uZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBFeGhhdXN0JzogJzI0RDMnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEdyYW5kIFN3b3JkJzogJzI0RDInLCAvLyBDb25hbCBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDEnOiAnMjA2NicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmUtaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAyJzogJzI1ODcnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAxJzogJzI0QjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJpbWFyeSBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDInOiAnMjA2QycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBoZWxwZXIgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gTGlnaHRsZXNzIFNwYXJrJzogJzIwNkInLCAvLyBDb25hbCBBb0UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIERlbWltYWdpY2tzJzogJzIwNUUnLFxyXG4gICAgJ0FsYSBNaGlnbyBVbm1vdmluZyBUcm9pa2EnOiAnMjA2MCcsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMSc6ICcyMDY5JyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAyJzogJzI1ODknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSXQncyBwb3NzaWJsZSBwbGF5ZXJzIG1pZ2h0IGp1c3Qgd2FuZGVyIGludG8gdGhlIGJhZCBvbiB0aGUgb3V0c2lkZSxcclxuICAgICAgLy8gYnV0IG5vcm1hbGx5IHBlb3BsZSBnZXQgcHVzaGVkIGludG8gaXQuXHJcbiAgICAgIGlkOiAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dlbGwnLFxyXG4gICAgICAvLyBEYW1hZ2UgRG93blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkI4JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gQmFyZGFtJ3MgTWV0dGxlXHJcblxyXG5cclxuLy8gRm9yIHJlYXNvbnMgbm90IGNvbXBsZXRlbHkgdW5kZXJzdG9vZCBhdCB0aGUgdGltZSB0aGlzIHdhcyBtZXJnZWQsXHJcbi8vIGJ1dCBsaWtlbHkgcmVsYXRlZCB0byB0aGUgZmFjdCB0aGF0IG5vIG5hbWVwbGF0ZXMgYXJlIHZpc2libGUgZHVyaW5nIHRoZSBlbmNvdW50ZXIsXHJcbi8vIGFuZCB0aGF0IG5vdGhpbmcgaW4gdGhlIGVuY291bnRlciBhY3R1YWxseSBkb2VzIGRhbWFnZSxcclxuLy8gd2UgY2FuJ3QgdXNlIGRhbWFnZVdhcm4gb3IgZ2FpbnNFZmZlY3QgaGVscGVycyBvbiB0aGUgQmFyZGFtIGZpZ2h0LlxyXG4vLyBJbnN0ZWFkLCB3ZSB1c2UgdGhpcyBoZWxwZXIgZnVuY3Rpb24gdG8gbG9vayBmb3IgZmFpbHVyZSBmbGFncy5cclxuLy8gSWYgdGhlIGZsYWcgaXMgcHJlc2VudCxhIGZ1bGwgdHJpZ2dlciBvYmplY3QgaXMgcmV0dXJuZWQgdGhhdCBkcm9wcyBpbiBzZWFtbGVzc2x5LlxyXG5jb25zdCBhYmlsaXR5V2FybiA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eSAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiB7XHJcbiAgICBpZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgY29uZGl0aW9uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnN1YnN0cigtMikgPT09ICcwRScsXHJcbiAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgIH0sXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5CYXJkYW1zTWV0dGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdCYXJkYW0gRGlydHkgQ2xhdyc6ICcyMUE4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEd1bG8gR3VsbyB0cmFzaFxyXG4gICAgJ0JhcmRhbSBFcGlncmFwaCc6ICcyM0FGJywgLy8gTGluZSBBb0UsIFdhbGwgb2YgQmFyZGFtIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRoZSBEdXNrIFN0YXInOiAnMjE4NycsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFRoZSBEYXduIFN0YXInOiAnMjE4NicsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIENydW1ibGluZyBDcnVzdCc6ICcxRjEzJywgLy8gQ2lyY2xlIEFvRXMsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBSYW0gUnVzaCc6ICcxRUZDJywgLy8gTGluZSBBb0VzLCBTdGVwcGUgWWFtYWEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEx1bGxhYnknOiAnMjRCMicsIC8vIENpcmNsZSBBb0VzLCBTdGVwcGUgU2hlZXAsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEhlYXZlJzogJzFFRjcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFdpZGUgQmxhc3Rlcic6ICcyNEIzJywgLy8gRW5vcm1vdXMgZnJvbnRhbCBjbGVhdmUsIFN0ZXBwZSBDb2V1cmwsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gRG91YmxlIFNtYXNoJzogJzI2QScsIC8vIENpcmNsZSBBb0UsIE1ldHRsaW5nIERoYXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRyYW5zb25pYyBCbGFzdCc6ICcxMjYyJywgLy8gQ2lyY2xlIEFvRSwgU3RlcHBlIEVhZ2xlIHRyYXNoXHJcbiAgICAnQmFyZGFtIFdpbGQgSG9ybic6ICcyMjA4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEtodW4gR3VydmVsIHRyYXNoXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJzogJzI1NzgnLCAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInOiAnMjU3OScsIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMyc6ICcyNTdBJywgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDEnOiAnMjU3QicsIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAyJzogJzI1N0MnLCAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInOiAnMjU3RicsIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBCYXJkYW1cXCdzIFJpbmcnOiAnMjU4MScsIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCc6ICcyNTdEJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQgSW1wYWN0JzogJzI1ODAnLCAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSXJvbiBTcGhlcmUgQXR0YWNrJzogJzE2QjYnLCAvLyBDb250YWN0IGRhbWFnZSwgSXJvbiBTcGhlcmUgdHJhc2gsIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIFRvcm5hZG8nOiAnMjQ3RScsIC8vIENpcmNsZSBBb0UsIEtodW4gU2hhdmFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBQaW5pb24nOiAnMUYxMScsIC8vIExpbmUgQW9FLCBZb2wgRmVhdGhlciwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGZWF0aGVyIFNxdWFsbCc6ICcxRjBFJywgLy8gRGFzaCBhdHRhY2ssIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBVbnRhcmdldGVkJzogJzFGMTInLCAvLyBSb3RhdGluZyBjaXJjbGUgQW9FcywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCYXJkYW0gR2FydWxhIFJ1c2gnOiAnMUVGOScsIC8vIExpbmUgQW9FLCBHYXJ1bGEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFRhcmdldGVkJzogJzFGMEMnLCAvLyBDaXJjbGUgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaW5nYmVhdCc6ICcxRjBGJywgLy8gQ29uYWwgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnQmFyZGFtIENvbmZ1c2VkJzogJzBCJywgLy8gRmFpbGVkIGdhemUgYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0JhcmRhbSBGZXR0ZXJzJzogJzU2RicsIC8vIEZhaWxpbmcgdHdvIG1lY2hhbmljcyBpbiBhbnkgb25lIHBoYXNlIG9uIEJhcmRhbSwgc2Vjb25kIGJvc3MuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJywgYWJpbGl0eUlkOiAnMjU3OCcgfSksXHJcbiAgICAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInLCBhYmlsaXR5SWQ6ICcyNTc5JyB9KSxcclxuICAgIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMycsIGFiaWxpdHlJZDogJzI1N0EnIH0pLFxyXG4gICAgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDEnLCBhYmlsaXR5SWQ6ICcyNTdCJyB9KSxcclxuICAgIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAyJywgYWJpbGl0eUlkOiAnMjU3QycgfSksXHJcbiAgICAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInLCBhYmlsaXR5SWQ6ICcyNTdGJyB9KSxcclxuICAgIC8vIEdhemUgYXR0YWNrLCBXYXJyaW9yIG9mIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gRW1wdHkgR2F6ZScsIGFiaWxpdHlJZDogJzFGMDQnIH0pLFxyXG4gICAgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtXFwncyBSaW5nJywgYWJpbGl0eUlkOiAnMjU4MScgfSksXHJcbiAgICAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCcsIGFiaWxpdHlJZDogJzI1N0QnIH0pLFxyXG4gICAgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0IEltcGFjdCcsIGFiaWxpdHlJZDogJzI1ODAnIH0pLFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuS3VnYW5lQ2FzdGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIFRlbmthIEdva2tlbic6ICcyMzI5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgIEpvaSBCbGFkZSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgS2Vua2kgUmVsZWFzZSBUcmFzaCc6ICcyMzMwJywgLy8gQ2hhcmlvdCBBb0UsIEpvaSBLaXlvZnVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIENsZWFyb3V0JzogJzFFOTInLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBadWlrby1NYXJ1LCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAxJzogJzFFOTYnLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJhLUtpcmkgMic6ICcyNEY5JywgLy8gR2lhbnQgY2lyY2xlIEFvRSwgSGFyYWtpcmkgS29zaG8sIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMSc6ICcyMzJEJywgLy8gTGluZSBBb0UsIEthcmFrdXJpIE9ubWl0c3UgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIDEwMDAgQmFyYnMnOiAnMjE5OCcsIC8vIExpbmUgQW9FLCBKb2kgS29qYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMic6ICcxRTk4JywgLy8gTGluZSBBb0UsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGF0YW1pLUdhZXNoaSc6ICcxRTlEJywgLy8gRmxvb3IgdGlsZSBsaW5lIGF0dGFjaywgRWxraXRlIE9ubWl0c3UsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAzJzogJzFFQTAnLCAvLyBMaW5lIEFvRSwgRWxpdGUgT25taXRzdSwgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQXV0byBDcm9zc2Jvdyc6ICcyMzMzJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgS2FyYWt1cmkgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYWtpcmkgMyc6ICcyM0M5JywgLy8gR2lhbnQgQ2lyY2xlIEFvRSwgSGFyYWtpcmkgIEhhbnlhIHRyYXNoLCBhZnRlciBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBJYWktR2lyaSc6ICcxRUEyJywgLy8gQ2hhcmlvdCBBb0UsIFlvamltYm8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRnJhZ2lsaXR5JzogJzFFQUEnLCAvLyBDaGFyaW90IEFvRSwgSW5vc2hpa2FjaG8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRHJhZ29uZmlyZSc6ICcxRUFCJywgLy8gTGluZSBBb0UsIERyYWdvbiBIZWFkLCBib3NzIDNcclxuICB9LFxyXG5cclxuICBzaGFyZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIElzc2VuJzogJzFFOTcnLCAvLyBJbnN0YW50IGZyb250YWwgY2xlYXZlLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIENsb2Nrd29yayBSYWl0b24nOiAnMUU5QicsIC8vIExhcmdlIGxpZ2h0bmluZyBzcHJlYWQgY2lyY2xlcywgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIFp1aWtvIE1hcnUsIGJvc3MgMVxyXG4gICAgICBpZDogJ0t1Z2FuZSBDYXN0bGUgSGVsbSBDcmFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzFFOTQnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNhaW50TW9jaWFubmVzQXJib3JldHVtSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBNdWRzdHJlYW0nOiAnMzBEOScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEltbWFjdWxhdGUgQXBhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTaWxrZW4gU3ByYXknOiAnMzM4NScsIC8vIFJlYXIgY29uZSBBb0UsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZGR5IFB1ZGRsZXMnOiAnMzBEQScsIC8vIFNtYWxsIHRhcmdldGVkIGNpcmNsZSBBb0VzLCBEb3Jwb2trdXIgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBaXInOiAnMkU0OScsIC8vIEZyb250YWwgY29uZSBBb0UsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU0x1ZGdlIEJvbWInOiAnMkU0RScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBdG1vc3BoZXJlJzogJzJFNTEnLCAvLyBDaGFubmVsZWQgMy80IGFyZW5hIGNsZWF2ZSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDcmVlcGluZyBJdnknOiAnMzFBNScsIC8vIEZyb250YWwgY29uZSBBb0UsIFdpdGhlcmVkIEt1bGFrIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBSb2Nrc2xpZGUnOiAnMzEzNCcsIC8vIExpbmUgQW9FLCBTaWx0IEdvbGVtLCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgSW5uZXInOiAnMzEyRScsIC8vIENoYXJpb3QgQW9FLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgT3V0ZXInOiAnMzEyRicsIC8vIER5bmFtbyBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRW1iYWxtaW5nIEVhcnRoJzogJzMxQTYnLCAvLyBMYXJnZSBDaGFyaW90IEFvRSwgTXVkZHkgTWF0YSwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBRdWlja21pcmUnOiAnMzEzNicsIC8vIFNld2FnZSBzdXJnZSBhdm9pZGVkIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1YWdtaXJlIFBsYXRmb3Jtcyc6ICczMTM5JywgLy8gUXVhZ21pcmUgZXhwbG9zaW9uIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZlY3VsZW50IEZsb29kJzogJzMxM0MnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgQ29ycnVwdHVyZSc6ICczM0EwJywgLy8gTXVkIFNsaW1lIGV4cGxvc2lvbiwgYm9zcyAzLiAoTm8gZXhwbG9zaW9uIGlmIGRvbmUgY29ycmVjdGx5LilcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVGFwcm9vdCc6ICcyRTRDJywgLy8gTGFyZ2Ugb3JhbmdlIHNwcmVhZCBjaXJjbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRoIFNoYWtlcic6ICczMTMxJywgLy8gRWFydGggU2hha2VyLCBMYWtoYW11LCBib3NzIDJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU2VkdWNlZCc6ICczREYnLCAvLyBHYXplIGZhaWx1cmUsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFBvbGxlbic6ICcxMycsIC8vIFNsdWRnZSBwdWRkbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFRyYW5zZmlndXJhdGlvbic6ICc2NDgnLCAvLyBSb2x5LVBvbHkgQW9FIGNpcmNsZSBmYWlsdXJlLCBCTG9vbWluZyBCaWxva28gdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEh5c3RlcmlhJzogJzEyOCcsIC8vIEdhemUgZmFpbHVyZSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTdGFiIFdvdW5kJzogJzQ1RCcsIC8vIEFyZW5hIG91dGVyIHdhbGwgZWZmZWN0LCBib3NzIDJcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBGYXVsdCBXYXJyZW4nOiAnMkU0QScsIC8vIFN0YWNrIG1hcmtlciwgTnVsbGNodSwgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTd2FsbG93c0NvbXBhc3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSXZ5IEZldHRlcnMnOiAnMkMwNCcsIC8vIENpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMSc6ICcyQzA1JywgLy8gVG9ybmFkbyBncm91bmQgQW9FLCBwbGFjZWQgYnkgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFlhbWEtS2FndXJhJzogJzJCOTYnLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmxhbWVzIE9mIEhhdGUnOiAnMkI5OCcsIC8vIEZpcmUgb3JiIGV4cGxvc2lvbnMsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQ29uZmxhZ3JhdGUnOiAnMkI5OScsIC8vIENvbGxpc2lvbiB3aXRoIGZpcmUgb3JiLCBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBVcHdlbGwnOiAnMkMwNicsIC8vIFRhcmdldGVkIGNpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCYWQgQnJlYXRoJzogJzJDMDcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgSmlubWVuanUgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBHcmVhdGVyIFBhbG0gMSc6ICcyQjlEJywgLy8gSGFsZiBhcmVuYSByaWdodCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDInOiAnMkI5RScsIC8vIEhhbGYgYXJlbmEgbGVmdCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVHJpYnV0YXJ5JzogJzJCQTAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmFsIGdyb3VuZCBBb0VzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMic6ICcyQzA2JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIGVudmlyb25tZW50LCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAzJzogJzJDMDcnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmlsb3BsdW1lcyc6ICcyQzc2JywgLy8gRnJvbnRhbCByZWN0YW5nbGUgQW9FLCBEcmFnb24gQmkgRmFuZyB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDEnOiAnMkJBOCcsIC8vIENoYXJpb3QgQW9FLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMic6ICcyQkE5JywgLy8gRHluYW1vIEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDMnOiAnMkJBRScsIC8vIENoYXJpb3QgQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDQnOiAnMkJBRicsIC8vIER5bmFtbyBBb0UsIFNoYWRvdyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBFcXVhbCBPZiBIZWF2ZW4nOiAnMkJCNCcsIC8vIFNtYWxsIGNpcmNsZSBncm91bmQgQW9FcywgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNaXJhZ2UnOiAnMkJBMicsIC8vIFByZXktY2hhc2luZyBwdWRkbGVzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1vdW50YWluIEZhbGxzJzogJzJCQTUnLCAvLyBDaXJjbGUgc3ByZWFkIG1hcmtlcnMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kJzogJzJCQTcnLCAvLyBMYXNlciB0ZXRoZXIsIFFpdGlhbiBEYXNoZW5nICBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCAyJzogJzJCQUQnLCAvLyBMYXNlciBUZXRoZXIsIFNoYWRvd3MgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGF0dGFjayBmYWlsdXJlLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmxlZWRpbmcnOiAnMTEyRicsIC8vIFN0ZXBwaW5nIG91dHNpZGUgdGhlIGFyZW5hLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YW5kaW5nIGluIHRoZSBsYWtlLCBEaWFkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIFNpeCBGdWxtcyBVbmRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyMzcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgYm9zcyAzXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBGaXZlIEZpbmdlcmVkIFB1bmlzaG1lbnQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnMkJBQicsICcyQkIwJ10sIHNvdXJjZTogWydRaXRpYW4gRGFzaGVuZycsICdTaGFkb3cgT2YgVGhlIFNhZ2UnXSB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRlbXBsZU9mVGhlRmlzdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEZpcmUgQnJlYWsnOiAnMjFFRCcsIC8vIENvbmFsIEFvRSwgQmxvb2RnbGlkZXIgTW9uayB0cmFzaFxyXG4gICAgJ1RlbXBsZSBSYWRpYWwgQmxhc3Rlcic6ICcxRkQzJywgLy8gQ2lyY2xlIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIFdpZGUgQmxhc3Rlcic6ICcxRkQ0JywgLy8gQ29uYWwgQW9FLCBib3NzIDFcclxuICAgICdUZW1wbGUgQ3JpcHBsaW5nIEJsb3cnOiAnMjAxNicsIC8vIExpbmUgQW9FcywgZW52aXJvbm1lbnRhbCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBCcm9rZW4gRWFydGgnOiAnMjM2RScsIC8vIENpcmNsZSBBb0UsIFNpbmdoYSB0cmFzaFxyXG4gICAgJ1RlbXBsZSBTaGVhcic6ICcxRkREJywgLy8gRHVhbCBjb25hbCBBb0UsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBDb3VudGVyIFBhcnJ5JzogJzFGRTAnLCAvLyBSZXRhbGlhdGlvbiBmb3IgaW5jb3JyZWN0IGRpcmVjdGlvbiBhZnRlciBLaWxsZXIgSW5zdGluY3QsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBUYXBhcyc6ICcnLCAvLyBUcmFja2luZyBjaXJjdWxhciBncm91bmQgQW9FcywgYm9zcyAyXHJcbiAgICAnVGVtcGxlIEhlbGxzZWFsJzogJzIwMEYnLCAvLyBSZWQvQmx1ZSBzeW1ib2wgZmFpbHVyZSwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIFB1cmUgV2lsbCc6ICcyMDE3JywgLy8gQ2lyY2xlIEFvRSwgU3Bpcml0IEZsYW1lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1lZ2FibGFzdGVyJzogJzE2MycsIC8vIENvbmFsIEFvRSwgQ29ldXJsIFByYW5hIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnVGVtcGxlIFdpbmRidXJuJzogJzFGRTgnLCAvLyBDaXJjbGUgQW9FLCBUd2lzdGVyIHdpbmQsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBIdXJyaWNhbmUgS2ljayc6ICcxRkU1JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIFNpbGVudCBSb2FyJzogJzFGRUInLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDNcclxuICAgICdUZW1wbGUgTWlnaHR5IEJsb3cnOiAnMUZFQScsIC8vIENvbnRhY3Qgd2l0aCBjb2V1cmwgaGVhZCwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUZW1wbGUgSGVhdCBMaWdodG5pbmcnOiAnMUZENycsIC8vIFB1cnBsZSBzcHJlYWQgY2lyY2xlcywgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQnVybixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gRmFsbGluZyBSb2NrJzogJzMxQTMnLCAvLyBFbnZpcm9ubWVudGFsIGxpbmUgQW9FXHJcbiAgICAnVGhlIEJ1cm4gQWV0aGVyaWFsIEJsYXN0JzogJzMyOEInLCAvLyBMaW5lIEFvRSwgS3VrdWxrYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBNb2xlLWEtd2hhY2snOiAnMzI4RCcsIC8vIENpcmNsZSBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBIZWFkIEJ1dHQnOiAnMzI4RScsIC8vIFNtYWxsIGNvbmFsIEFvRSwgRGVzZXJ0IERlc21hbiB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkZmFsbCc6ICczMTkxJywgLy8gUm9vbXdpZGUgQW9FLCBMb1MgZm9yIHNhZmV0eSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gRGlzc29uYW5jZSc6ICczMTkyJywgLy8gRG9udXQgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBDcnlzdGFsbGluZSBGcmFjdHVyZSc6ICczMTk3JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJlc29uYW50IEZyZXF1ZW5jeSc6ICczMTk4JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJvdG9zd2lwZSc6ICczMjkxJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgQ2hhcnJlZCBEcmVhZG5hdWdodCB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdyZWNraW5nIEJhbGwnOiAnMzI5MicsIC8vIENpcmNsZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGF0dGVyJzogJzMyOTQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBDaGFycmVkIERvYmx5biB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEF1dG8tQ2Fubm9ucyc6ICczMjk1JywgLy8gTGluZSBBb0UsIENoYXJyZWQgRHJvbmUgdHJhc2hcclxuICAgICdUaGUgQnVybiBTZWxmLURldG9uYXRlJzogJzMyOTYnLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRnVsbCBUaHJvdHRsZSc6ICcyRDc1JywgLy8gTGluZSBBb0UsIERlZmVjdGl2ZSBEcm9uZSwgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gVGhyb3R0bGUnOiAnMkQ3NicsIC8vIExpbmUgQW9FLCBNaW5pbmcgRHJvbmUgYWRkcywgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gQWRpdCBEcml2ZXInOiAnMkQ3OCcsIC8vIExpbmUgQW9FLCBSb2NrIEJpdGVyIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRyZW1ibG9yJzogJzMyOTcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBWZWlsZWQgR2lnYXdvcm0gdHJhc2hcclxuICAgICdUaGUgQnVybiBEZXNlcnQgU3BpY2UnOiAnMzI5OCcsIC8vIFRoZSBmcm9udGFsIGNsZWF2ZXMgbXVzdCBmbG93XHJcbiAgICAnVGhlIEJ1cm4gVG94aWMgU3ByYXknOiAnMzI5QScsIC8vIEZyb250YWwgY29uZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBWZW5vbSBTcHJheSc6ICczMjlCJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgR2lnYXdvcm0gU3RhbGtlciB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdoaXRlIERlYXRoJzogJzMxNDMnLCAvLyBSZWFjdGl2ZSBkdXJpbmcgaW52dWxuZXJhYmlsaXR5LCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDEnOiAnMzE0NScsIC8vIFN0YXIgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDInOiAnMzE0NicsIC8vIExpbmUgQW9FcyBhZnRlciBzdGFycywgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIENhdXRlcml6ZSc6ICczMTQ4JywgLy8gTGluZS9Td29vcCBBb0UsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaGUgQnVybiBDb2xkIEZvZyc6ICczMTQyJywgLy8gR3Jvd2luZyBjaXJjbGUgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaGUgQnVybiBIYWlsZmlyZSc6ICczMTk0JywgLy8gSGVhZCBtYXJrZXIgbGluZSBBb0UsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkc3RyaWtlJzogJzMxOTUnLCAvLyBPcmFuZ2Ugc3ByZWFkIGhlYWQgbWFya2VycywgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ2hpbGxpbmcgQXNwaXJhdGlvbic6ICczMTREJywgLy8gSGVhZCBtYXJrZXIgY2xlYXZlLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRnJvc3QgQnJlYXRoJzogJzMxNEMnLCAvLyBUYW5rIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gTGVhZGVuJzogJzQzJywgLy8gUHVkZGxlIGVmZmVjdCwgYm9zcyAyLiAoQWxzbyBpbmZsaWN0cyAxMUYsIFNsdWRnZS4pXHJcbiAgICAnVGhlIEJ1cm4gUHVkZGxlIEZyb3N0Yml0ZSc6ICcxMUQnLCAvLyBJY2UgcHVkZGxlIGVmZmVjdCwgYm9zcyAzLiAoTk9UIHRoZSBjb25hbC1pbmZsaWN0ZWQgb25lLCAxMEMuKVxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzFOIC0gRGVsdGFzY2FwZSAxLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjEwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMU4gQnVybic6ICcyM0Q1JywgLy8gRmlyZWJhbGwgZXhwbG9zaW9uIGNpcmNsZSBBb0VzXHJcbiAgICAnTzFOIENsYW1wJzogJzIzRTInLCAvLyBGcm9udGFsIHJlY3RhbmdsZSBrbm9ja2JhY2sgQW9FLCBBbHRlIFJvaXRlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMU4gTGV2aW5ib2x0JzogJzIzREEnLCAvLyBzbWFsbCBzcHJlYWQgY2lyY2xlc1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gTzJOIC0gRGVsdGFzY2FwZSAyLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjIwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMk4gTWFpbiBRdWFrZSc6ICcyNEE1JywgLy8gTm9uLXRlbGVncmFwaGVkIGNpcmNsZSBBb0UsIEZsZXNoeSBNZW1iZXJcclxuICAgICdPMk4gRXJvc2lvbic6ICcyNTkwJywgLy8gU21hbGwgY2lyY2xlIEFvRXMsIEZsZXNoeSBNZW1iZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08yTiBQYXJhbm9ybWFsIFdhdmUnOiAnMjUwRScsIC8vIEluc3RhbnQgdGFuayBjbGVhdmVcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFdlIGNvdWxkIHRyeSB0byBzZXBhcmF0ZSBvdXQgdGhlIG1pc3Rha2UgdGhhdCBsZWQgdG8gdGhlIHBsYXllciBiZWluZyBwZXRyaWZpZWQuXHJcbiAgICAgIC8vIEhvd2V2ZXIsIGl0J3MgTm9ybWFsIG1vZGUsIHdoeSBvdmVydGhpbmsgaXQ/XHJcbiAgICAgIGlkOiAnTzJOIFBldHJpZmljYXRpb24nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjYyJyB9KSxcclxuICAgICAgLy8gVGhlIHVzZXIgbWlnaHQgZ2V0IGhpdCBieSBhbm90aGVyIHBldHJpZnlpbmcgYWJpbGl0eSBiZWZvcmUgdGhlIGVmZmVjdCBlbmRzLlxyXG4gICAgICAvLyBUaGVyZSdzIG5vIHBvaW50IGluIG5vdGlmeWluZyBmb3IgdGhhdC5cclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNTE1JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGRlYWxzIGRhbWFnZSBvbmx5IHRvIG5vbi1mbG9hdGluZyB0YXJnZXRzLlxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBPM04gLSBEZWx0YXNjYXBlIDMuMCBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMzAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIEZpcmUgSUlJJzogJzI0NjAnLCAvLyBEb251dCBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBCbGl6emFyZCBJSUknOiAnMjQ2MScsIC8vIENpcmNsZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyNDYyJywgLy8gTGluZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gQ3Jvc3MgUmVhcGVyJzogJzI0NkInLCAvLyBDaXJjbGUgQW9FLCBTb3VsIFJlYXBlclxyXG4gICAgJ08zTiBHdXN0aW5nIEdvdWdlJzogJzI0NkMnLCAvLyBHcmVlbiBsaW5lIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gU3dvcmQgRGFuY2UnOiAnMjQ3MCcsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gVXBsaWZ0JzogJzI0NzMnLCAvLyBHcm91bmQgc3BlYXJzLCBRdWVlbidzIFdhbHR6IGVmZmVjdCwgSGFsaWNhcm5hc3N1c1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08zTiBVbHRpbXVtJzogJzI0NzcnLCAvLyBJbnN0YW50IGtpbGwuIFVzZWQgaWYgdGhlIHBsYXllciBkb2VzIG5vdCBleGl0IHRoZSBzYW5kIG1hemUgZmFzdCBlbm91Z2guXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM04gSG9seSBCbHVyJzogMjQ2MywgLy8gU3ByZWFkIGNpcmNsZXMuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08zTiBQaGFzZSBUcmFja2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpY2FybmFzc3VzJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpY2FybmFzc2UnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+ODj+ODquOCq+ODq+ODiuODg+OCveOCuScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICftlaDrpqzsubTrpbTrgpjshozsiqQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyICs9IDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHRvIHRyYWNrLCBhbmQgaW4gb3JkZXIgdG8gbWFrZSBpdCBhbGwgY2xlYW4sIGl0J3Mgc2FmZXN0IGp1c3QgdG9cclxuICAgICAgLy8gaW5pdGlhbGl6ZSBpdCBhbGwgdXAgZnJvbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgY29tcGFyaXNvbnMuXHJcbiAgICAgIGlkOiAnTzNOIEluaXRpYWxpemluZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhKSA9PiAhZGF0YS5pbml0aWFsaXplZCxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmdhbWVDb3VudCA9IDA7XHJcbiAgICAgICAgLy8gSW5kZXhpbmcgcGhhc2VzIGF0IDEgc28gYXMgdG8gbWFrZSBwaGFzZXMgbWF0Y2ggd2hhdCBodW1hbnMgZXhwZWN0LlxyXG4gICAgICAgIC8vIDE6IFdlIHN0YXJ0IGhlcmUuXHJcbiAgICAgICAgLy8gMjogQ2F2ZSBwaGFzZSB3aXRoIFVwbGlmdHMuXHJcbiAgICAgICAgLy8gMzogUG9zdC1pbnRlcm1pc3Npb24sIHdpdGggZ29vZCBhbmQgYmFkIGZyb2dzLlxyXG4gICAgICAgIGRhdGEucGhhc2VOdW1iZXIgPSAxO1xyXG4gICAgICAgIGRhdGEuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPM04gUmliYml0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgRE8gd2FudCB0byBiZSBoaXQgYnkgVG9hZC9SaWJiaXQgaWYgdGhlIG5leHQgY2FzdCBvZiBUaGUgR2FtZVxyXG4gICAgICAgIC8vIGlzIDR4IHRvYWQgcGFuZWxzLlxyXG4gICAgICAgIHJldHVybiAhKGRhdGEucGhhc2VOdW1iZXIgPT09IDMgJiYgZGF0YS5nYW1lQ291bnQgJSAyID09PSAwKSAmJiBtYXRjaGVzLnRhcmdldElkICE9PSAnRTAwMDAwMDAnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUncyBhIGxvdCB3ZSBjb3VsZCBkbyB0byB0cmFjayBleGFjdGx5IGhvdyB0aGUgcGxheWVyIGZhaWxlZCBUaGUgR2FtZS5cclxuICAgICAgLy8gV2h5IG92ZXJ0aGluayBOb3JtYWwgbW9kZSwgaG93ZXZlcj9cclxuICAgICAgaWQ6ICdPM04gVGhlIEdhbWUnLFxyXG4gICAgICAvLyBHdWVzcyB3aGF0IHlvdSBqdXN0IGxvc3Q/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NkQnIH0pLFxyXG4gICAgICAvLyBJZiB0aGUgcGxheWVyIHRha2VzIG5vIGRhbWFnZSwgdGhleSBkaWQgdGhlIG1lY2hhbmljIGNvcnJlY3RseS5cclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuZ2FtZUNvdW50ICs9IDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBPNE4gLSBEZWx0YXNjYXBlIDQuMCBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080TiBCbGl6emFyZCBJSUknOiAnMjRCQycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBFeGRlYXRoXHJcbiAgICAnTzROIEVtcG93ZXJlZCBUaHVuZGVyIElJSSc6ICcyNEMxJywgLy8gVW50ZWxlZ3JhcGhlZCBsYXJnZSBjaXJjbGUgQW9FLCBFeGRlYXRoXHJcbiAgICAnTzROIFpvbWJpZSBCcmVhdGgnOiAnMjRDQicsIC8vIENvbmFsLCB0cmVlIGhlYWQgYWZ0ZXIgRGVjaXNpdmUgQmF0dGxlXHJcbiAgICAnTzROIENsZWFyb3V0JzogJzI0Q0MnLCAvLyBPdmVybGFwcGluZyBjb25lIEFvRXMsIERlYXRobHkgVmluZSAodGVudGFjbGVzIGFsb25nc2lkZSB0cmVlIGhlYWQpXHJcbiAgICAnTzROIEJsYWNrIFNwYXJrJzogJzI0QzknLCAvLyBFeHBsb2RpbmcgQmxhY2sgSG9sZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBFbXBvd2VyZWQgRmlyZSBJSUkgaW5mbGljdHMgdGhlIFB5cmV0aWMgZGVidWZmLCB3aGljaCBkZWFscyBkYW1hZ2UgaWYgdGhlIHBsYXllclxyXG4gICAgLy8gbW92ZXMgb3IgYWN0cyBiZWZvcmUgdGhlIGRlYnVmZiBmYWxscy4gVW5mb3J0dW5hdGVseSBpdCBkb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzXHJcbiAgICAvLyBjdXJyZW50bHkgYSBsb2cgbGluZSBmb3IgdGhpcywgc28gdGhlIG9ubHkgd2F5IHRvIGNoZWNrIGZvciB0aGlzIGlzIHRvIGNvbGxlY3RcclxuICAgIC8vIHRoZSBkZWJ1ZmZzIGFuZCB0aGVuIHdhcm4gaWYgYSBwbGF5ZXIgdGFrZXMgYW4gYWN0aW9uIGR1cmluZyB0aGF0IHRpbWUuIE5vdCB3b3J0aCBpdFxyXG4gICAgLy8gZm9yIE5vcm1hbC5cclxuICAgICdPNE4gU3RhbmRhcmQgRmlyZSc6ICcyNEJBJyxcclxuICAgICdPNE4gQnVzdGVyIFRodW5kZXInOiAnMjRCRScsIC8vIEEgY2xlYXZpbmcgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzROIERvb20nLCAvLyBLaWxscyB0YXJnZXQgaWYgbm90IGNsZWFuc2VkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0NsZWFuc2VycyBtaXNzZWQgRG9vbSEnLFxyXG4gICAgICAgICAgICBkZTogJ0Rvb20tUmVpbmlndW5nIHZlcmdlc3NlbiEnLFxyXG4gICAgICAgICAgICBmcjogJ05cXCdhIHBhcyDDqXTDqSBkaXNzaXDDqShlKSBkdSBHbGFzICEnLFxyXG4gICAgICAgICAgICBqYTogJ+atu+OBruWuo+WRiicsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh6Kej5q275a6jJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFNob3J0IGtub2NrYmFjayBmcm9tIEV4ZGVhdGhcclxuICAgICAgaWQ6ICdPNE4gVmFjdXVtIFdhdmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjRCOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080TiBFbXBvd2VyZWQgQmxpenphcmQnLCAvLyBSb29tLXdpZGUgQW9FLCBmcmVlemVzIG5vbi1tb3ZpbmcgdGFyZ2V0c1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNEU2JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIE80UyAtIERlbHRhc2NhcGUgNC4wIFNhdmFnZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzRTMiBOZW8gVmFjdXVtIFdhdmUnOiAnMjQxRCcsXHJcbiAgICAnTzRTMiBBY2NlbGVyYXRpb24gQm9tYic6ICcyNDMxJyxcclxuICAgICdPNFMyIEVtcHRpbmVzcyc6ICcyNDIyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPNFMyIERvdWJsZSBMYXNlcic6ICcyNDE1JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEZWNpc2l2ZSBCYXR0bGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyNDA4JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzEgVmFjdXVtIFdhdmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyM0ZFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEFsbWFnZXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQxNycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNOZW9FeGRlYXRoID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCbGl6emFyZCBJSUknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjNGOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gSWdub3JlIHVuYXZvaWRhYmxlIHJhaWQgYW9lIEJsaXp6YXJkIElJSS5cclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEpID0+ICFkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBUaHVuZGVyIElJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0ZEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgZHVyaW5nIHJhbmRvbSBtZWNoYW5pYyBhZnRlciBkZWNpc2l2ZSBiYXR0bGUuXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhKSA9PiBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBQZXRyaWZpZWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjYyJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gT24gTmVvLCBiZWluZyBwZXRyaWZpZWQgaXMgYmVjYXVzZSB5b3UgbG9va2VkIGF0IFNocmllaywgc28geW91ciBmYXVsdC5cclxuICAgICAgICBpZiAoZGF0YS5pc05lb0V4ZGVhdGgpXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgICAvLyBPbiBub3JtYWwgRXhEZWF0aCwgdGhpcyBpcyBkdWUgdG8gV2hpdGUgSG9sZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEZvcmtlZCBMaWdodG5pbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQyRScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEb3VibGUgQXR0YWNrIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQxQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMgfHwgW107XHJcbiAgICAgICAgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzLnB1c2gobWF0Y2hlcyk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCBhcnIgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXM7XHJcbiAgICAgICAgaWYgKCFhcnIpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPD0gMilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBIYXJkIHRvIGtub3cgd2hvIHNob3VsZCBiZSBpbiB0aGlzIGFuZCB3aG8gc2hvdWxkbid0LCBidXRcclxuICAgICAgICAvLyBpdCBzaG91bGQgbmV2ZXIgaGl0IDMgcGVvcGxlLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgZnVsbFRleHQ6IGAke2FyclswXS5hYmlsaXR5fSB4ICR7YXJyLmxlbmd0aH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiBkZWxldGUgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzLFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzdTIC0gU2lnbWFzY2FwZSAzLjAgU2F2YWdlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TaWdtYXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPN1MgTWlzc2lsZSc6ICcyNzgyJyxcclxuICAgICdPN1MgQ2hhaW4gQ2Fubm9uJzogJzI3OEYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ083UyBTZWFyaW5nIFdpbmQnOiAnMjc3NycsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ083UyBTdG9uZXNraW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyQUI1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMuc291cmNlLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBhZGQgUGF0Y2ggd2FybmluZ3MgZm9yIGRvdWJsZS91bmJyb2tlbiB0ZXRoZXJzXHJcbi8vIFRPRE86IEhlbGxvIFdvcmxkIGNvdWxkIGhhdmUgYW55IHdhcm5pbmdzIChzb3JyeSlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgTW90aW9uIDEnOiAnMzMzNCcsIC8vIDMwMCsgZGVncmVlIGNsZWF2ZSB3aXRoIGJhY2sgc2FmZSBhcmVhXHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAxJzogJzMzMjknLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBhZnRlciBzcGxpdFxyXG4gICAgJ08xMlMxIEVmZmljaWVudCBCbGFkZXdvcmsgMic6ICczMzJBJywgLy8gT21lZ2EtTSBcImdldCBvdXRcIiBjZW50ZXJlZCBhb2UgZHVyaW5nIGJsYWRlc1xyXG4gICAgJ08xMlMxIEJleW9uZCBTdHJlbmd0aCc6ICczMzI4JywgLy8gT21lZ2EtTSBcImdldCBpblwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgc2hpZWxkXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDEnOiAnMzMzMCcsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBTdGVlbCAyJzogJzMzMzEnLCAvLyBPbWVnYS1GIFwiZ2V0IGZyb250L2JhY2tcIiBibGFkZXMgcGhhc2VcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgQmxpenphcmQgSUlJJzogJzMzMzInLCAvLyBPbWVnYS1GIGdpYW50IGNyb3NzXHJcbiAgICAnTzEyUzIgRGlmZnVzZSBXYXZlIENhbm5vbic6ICczMzY5JywgLy8gYmFjay9zaWRlcyBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAxJzogJzMzNUEnLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgSHlwZXIgUHVsc2UgMic6ICczMzVCJywgLy8gUm90YXRpbmcgQXJjaGl2ZSBQZXJpcGhlcmFsIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IENvbG9zc2FsIEJsb3cnOiAnMzM1RicsIC8vIEV4cGxvZGluZyBBcmNoaXZlIEFsbCBoYW5kc1xyXG4gICAgJ08xMlMyIExlZnQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzYwJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aWNhbCBMYXNlcic6ICczMzQ3JywgLy8gbWlkZGxlIGxhc2VyIGZyb20gZXllXHJcbiAgICAnTzEyUzEgQWR2YW5jZWQgT3B0aWNhbCBMYXNlcic6ICczMzRBJywgLy8gZ2lhbnQgY2lyY2xlIGNlbnRlcmVkIG9uIGV5ZVxyXG4gICAgJ08xMlMyIFJlYXIgUG93ZXIgVW5pdCBSZWFyIExhc2VycyAxJzogJzMzNjEnLCAvLyBBcmNoaXZlIEFsbCBpbml0aWFsIGxhc2VyXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDInOiAnMzM2MicsIC8vIEFyY2hpdmUgQWxsIHJvdGF0aW5nIGxhc2VyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzMzNycsIC8vIGZpcmUgc3ByZWFkXHJcbiAgICAnTzEyUzIgSHlwZXIgUHVsc2UgVGV0aGVyJzogJzMzNUMnLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIHRldGhlcnNcclxuICAgICdPMTJTMiBXYXZlIENhbm5vbic6ICczMzZCJywgLy8gSW5kZXggQW5kIEFyY2hpdmUgUGVyaXBoZXJhbCBiYWl0ZWQgbGFzZXJzXHJcbiAgICAnTzEyUzIgT3B0aW1pemVkIEZpcmUgSUlJJzogJzMzNzknLCAvLyBBcmNoaXZlIEFsbCBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBTYWdpdHRhcml1cyBBcnJvdyc6ICczMzREJywgLy8gT21lZ2EtTSBiYXJkIGxpbWl0IGJyZWFrXHJcbiAgICAnTzEyUzIgT3ZlcnNhbXBsZWQgV2F2ZSBDYW5ub24nOiAnMzM2NicsIC8vIE1vbml0b3IgdGFuayBidXN0ZXJzXHJcbiAgICAnTzEyUzIgU2F2YWdlIFdhdmUgQ2Fubm9uJzogJzMzNkQnLCAvLyBUYW5rIGJ1c3RlciB3aXRoIHRoZSB2dWxuIGZpcnN0XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIERpc2NoYXJnZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczMzI3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnZ1bG4gPSBkYXRhLnZ1bG4gfHwge307XHJcbiAgICAgICAgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA9IGRhdGEudnVsbiB8fCB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgRGFtYWdlJyxcclxuICAgICAgLy8gMzMyRSA9IFBpbGUgUGl0Y2ggc3RhY2tcclxuICAgICAgLy8gMzMzRSA9IEVsZWN0cmljIFNsaWRlIChPbWVnYS1NIHNxdWFyZSAxLTQgZGFzaGVzKVxyXG4gICAgICAvLyAzMzNGID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLUYgdHJpYW5nbGUgMS00IGRhc2hlcylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyczMzJFJywgJzMzM0UnLCAnMzMzRiddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnZ1bG4gJiYgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh3aXRoIHZ1bG4pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKG1pdCBWZXJ3dW5kYmFya2VpdClgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6KKr44OA44Oh44O844K45LiK5piHKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjluKbmmJPkvKQpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBCeWFra28gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlSmFkZVN0b2FFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIFBvcHBpbmcgVW5yZWxlbnRpbmcgQW5ndWlzaCBidWJibGVzXHJcbiAgICAnQnlhRXggQXJhdGFtYSc6ICcyN0Y2JyxcclxuICAgIC8vIFN0ZXBwaW5nIGluIGdyb3dpbmcgb3JiXHJcbiAgICAnQnlhRXggVmFjdXVtIENsYXcnOiAnMjdFOScsXHJcbiAgICAvLyBMaWdodG5pbmcgUHVkZGxlc1xyXG4gICAgJ0J5YUV4IEh1bmRlcmZvbGQgSGF2b2MgMSc6ICcyN0U1JyxcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDInOiAnMjdFNicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQnlhRXggU3dlZXAgVGhlIExlZyc6ICcyN0RCJyxcclxuICAgICdCeWFFeCBGaXJlIGFuZCBMaWdodG5pbmcnOiAnMjdERScsXHJcbiAgICAnQnlhRXggRGlzdGFudCBDbGFwJzogJzI3REQnLFxyXG4gICAgLy8gTWlkcGhhc2UgbGluZSBhdHRhY2tcclxuICAgICdCeWFFeCBJbXBlcmlhbCBHdWFyZCc6ICcyN0YxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFBpbmsgYnViYmxlIGNvbGxpc2lvblxyXG4gICAgICBpZDogJ0J5YUV4IE9taW5vdXMgV2luZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyN0VDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidWJibGUgY29sbGlzaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdCbGFzZW4gc2luZCB6dXNhbW1lbmdlc3Rvw59lbicsXHJcbiAgICAgICAgICAgIGZyOiAnY29sbGlzaW9uIGRlIGJ1bGxlcycsXHJcbiAgICAgICAgICAgIGphOiAn6KGd56qBJyxcclxuICAgICAgICAgICAgY246ICfnm7jmkp4nLFxyXG4gICAgICAgICAgICBrbzogJ+yepe2MkCDqsrnss5DshJwg7YSw7KeQJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBTaGlucnl1IE5vcm1hbFxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVJveWFsTWVuYWdlcmllLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTaGlucnl1IEFraCBSaGFpJzogJzFGQTYnLCAvLyBTa3kgbGFzZXJzIGFsb25nc2lkZSBBa2ggTW9ybi5cclxuICAgICdTaGlucnl1IEJsYXppbmcgVHJhaWwnOiAnMjIxQScsIC8vIFJlY3RhbmdsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkcy5cclxuICAgICdTaGlucnl1IENvbGxhcHNlJzogJzIyMTgnLCAvLyBDaXJjbGUgQW9FcywgaW50ZXJtaXNzaW9uIGFkZHNcclxuICAgICdTaGlucnl1IERyYWdvbmZpc3QnOiAnMjRGMCcsIC8vIEdpYW50IHB1bmNoeSBjaXJjbGUgaW4gdGhlIGNlbnRlci5cclxuICAgICdTaGlucnl1IEVhcnRoIEJyZWF0aCc6ICcxRjlEJywgLy8gQ29uYWwgYXR0YWNrcyB0aGF0IGFyZW4ndCBhY3R1YWxseSBFYXJ0aCBTaGFrZXJzLlxyXG4gICAgJ1NoaW5yeXUgR3lyZSBDaGFyZ2UnOiAnMUZBOCcsIC8vIEdyZWVuIGRpdmUgYm9tYiBhdHRhY2suXHJcbiAgICAnU2hpbnJ5dSBTcGlrZXNpY2xlJzogJzFGQWAnLCAvLyBCbHVlLWdyZWVuIGxpbmUgYXR0YWNrcyBmcm9tIGJlaGluZC5cclxuICAgICdTaGlucnl1IFRhaWwgU2xhcCc6ICcxRjkzJywgLy8gUmVkIHNxdWFyZXMgaW5kaWNhdGluZyB0aGUgdGFpbCdzIGxhbmRpbmcgc3BvdHMuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTaGlucnl1IExldmluYm9sdCc6ICcxRjlDJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEljeSBmbG9vciBhdHRhY2suXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBEaWFtb25kIER1c3QnLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGlucnl1IFRpZGFsIFdhdmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY4QicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBLbm9ja2JhY2sgZnJvbSBjZW50ZXIuXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBBZXJpYWwgQmxhc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY5MCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3NlciAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFN1c2FubyBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVQb29sT2ZUcmlidXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3VzRXggQ2h1cm5pbmcnOiAnMjAzRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnU3VzRXggUmFzZW4gS2Fpa3lvJzogJzIwMkUnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVWx0aW1hIFdlYXBvbiBVbHRpbWF0ZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2VhcG9uc1JlZnJhaW5VbHRpbWF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVVdVIFNlYXJpbmcgV2luZCc6ICcyQjVDJyxcclxuICAgICdVV1UgRXJ1cHRpb24nOiAnMkI1QScsXHJcbiAgICAnVVdVIFdlaWdodCc6ICcyQjY1JyxcclxuICAgICdVV1UgTGFuZHNsaWRlMSc6ICcyQjcwJyxcclxuICAgICdVV1UgTGFuZHNsaWRlMic6ICcyQjcxJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVV1UgR3JlYXQgV2hpcmx3aW5kJzogJzJCNDEnLFxyXG4gICAgJ1VXVSBTbGlwc3RyZWFtJzogJzJCNTMnLFxyXG4gICAgJ1VXVSBXaWNrZWQgV2hlZWwnOiAnMkI0RScsXHJcbiAgICAnVVdVIFdpY2tlZCBUb3JuYWRvJzogJzJCNEYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdVV1UgV2luZGJ1cm4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRUInIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDIsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZlYXRoZXJsYW5jZSBleHBsb3Npb24uICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdVV1UgRmVhdGhlcmxhbmNlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzJCNDMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLnNvdXJjZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzLCBrRmxhZ0luc3RhbnREZWF0aCB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBVQ1UgLSBUaGUgVW5lbmRpbmcgQ29pbCBPZiBCYWhhbXV0IChVbHRpbWF0ZSlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVVuZW5kaW5nQ29pbE9mQmFoYW11dFVsdGltYXRlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVQ1UgTHVuYXIgRHluYW1vJzogJzI2QkMnLFxyXG4gICAgJ1VDVSBJcm9uIENoYXJpb3QnOiAnMjZCQicsXHJcbiAgICAnVUNVIEV4YWZsYXJlJzogJzI2RUYnLFxyXG4gICAgJ1VDVSBXaW5ncyBPZiBTYWx2YXRpb24nOiAnMjZDQScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUd2lzdGVyIERlYXRoJyxcclxuICAgICAgLy8gSW5zdGFudCBkZWF0aCBoYXMgYSBzcGVjaWFsIGZsYWcgdmFsdWUsIGRpZmZlcmVudGlhdGluZ1xyXG4gICAgICAvLyBmcm9tIHRoZSBleHBsb3Npb24gZGFtYWdlIHlvdSB0YWtlIHdoZW4gc29tZWJvZHkgZWxzZVxyXG4gICAgICAvLyBwb3BzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QUInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMsIGZsYWdzOiBrRmxhZ0luc3RhbnREZWF0aCB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVHdpc3RlciBQb3AnLFxyXG4gICAgICAgICAgICBkZTogJ1dpcmJlbHN0dXJtIGJlcsO8aHJ0JyxcclxuICAgICAgICAgICAgZnI6ICdBcHBhcml0aW9uIGRlcyB0b3JuYWRlcycsXHJcbiAgICAgICAgICAgIGphOiAn44OE44Kk44K544K/44O8JyxcclxuICAgICAgICAgICAgY246ICfml4vpo44nLFxyXG4gICAgICAgICAgICBrbzogJ+2ajOyYpOumrCDrsJ/snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgVGhlcm1pb25pYyBCdXJzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQaXp6YSBTbGljZScsXHJcbiAgICAgICAgICAgIGRlOiAnUGl6emFzdMO8Y2snLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnRzIGRlIHBpenphJyxcclxuICAgICAgICAgICAgamE6ICfjgrXjg7zjg5/jgqrjg4vjg4Pjgq/jg5Djg7zjgrnjg4gnLFxyXG4gICAgICAgICAgICBjbjogJ+WkqeW0qeWcsOijgicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQ7JeQIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBDaGFpbiBMaWdodG5pbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZDOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEl0J3MgaGFyZCB0byBhc3NpZ24gYmxhbWUgZm9yIGxpZ2h0bmluZy4gIFRoZSBkZWJ1ZmZzXHJcbiAgICAgICAgLy8gZ28gb3V0IGFuZCB0aGVuIGV4cGxvZGUgaW4gb3JkZXIsIGJ1dCB0aGUgYXR0YWNrZXIgaXNcclxuICAgICAgICAvLyB0aGUgZHJhZ29uIGFuZCBub3QgdGhlIHBsYXllci5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGl0IGJ5IGxpZ2h0bmluZycsXHJcbiAgICAgICAgICAgIGRlOiAndm9tIEJsaXR6IGdldHJvZmZlbicsXHJcbiAgICAgICAgICAgIGZyOiAnZnJhcHDDqShlKSBwYXIgbGEgZm91ZHJlJyxcclxuICAgICAgICAgICAgamE6ICfjg4HjgqfjgqTjg7Pjg6njgqTjg4jjg4vjg7PjgrAnLFxyXG4gICAgICAgICAgICBjbjogJ+mbt+WFiemTvicsXHJcbiAgICAgICAgICAgIGtvOiAn67KI6rCcIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBCdXJucycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdGQScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFNsdWRnZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMUYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA9IGRhdGEuaGFzRG9vbSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIERvb20gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlIGlzIG5vIGNhbGxvdXQgZm9yIFwieW91IGZvcmdvdCB0byBjbGVhciBkb29tXCIuICBUaGUgbG9ncyBsb29rXHJcbiAgICAgIC8vIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgIC8vICAgWzIwOjAyOjMwLjU2NF0gMUE6T2tvbm9taSBZYWtpIGdhaW5zIHRoZSBlZmZlY3Qgb2YgRG9vbSBmcm9tICBmb3IgNi4wMCBTZWNvbmRzLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIFByb3RlY3QgZnJvbSBUYWtvIFlha2kuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM2LjQ0M10gMUU6T2tvbm9taSBZYWtpIGxvc2VzIHRoZSBlZmZlY3Qgb2YgRG9vbSBmcm9tIC5cclxuICAgICAgLy8gICBbMjA6MDI6MzguNTI1XSAxOTpPa29ub21pIFlha2kgd2FzIGRlZmVhdGVkIGJ5IEZpcmVob3JuLlxyXG4gICAgICAvLyBJbiBvdGhlciB3b3JkcywgZG9vbSBlZmZlY3QgaXMgcmVtb3ZlZCArLy0gbmV0d29yayBsYXRlbmN5LCBidXQgY2FuJ3RcclxuICAgICAgLy8gdGVsbCB1bnRpbCBsYXRlciB0aGF0IGl0IHdhcyBhIGRlYXRoLiAgQXJndWFibHksIHRoaXMgY291bGQgaGF2ZSBiZWVuIGFcclxuICAgICAgLy8gY2xvc2UtYnV0LXN1Y2Nlc3NmdWwgY2xlYXJpbmcgb2YgZG9vbSBhcyB3ZWxsLiAgSXQgbG9va3MgdGhlIHNhbWUuXHJcbiAgICAgIC8vIFN0cmF0ZWd5OiBpZiB5b3UgaGF2ZW4ndCBjbGVhcmVkIGRvb20gd2l0aCAxIHNlY29uZCB0byBnbyB0aGVuIHlvdSBwcm9iYWJseVxyXG4gICAgICAvLyBkaWVkIHRvIGRvb20uICBZb3UgY2FuIGdldCBub24tZmF0YWxseSBpY2ViYWxsZWQgb3IgYXV0bydkIGluIGJldHdlZW4sXHJcbiAgICAgIC8vIGJ1dCB3aGF0IGNhbiB5b3UgZG8uXHJcbiAgICAgIGlkOiAnVUNVIERvb20gRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0Rvb20gfHwgIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgbGV0IHJlYXNvbjtcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbik7XHJcbiAgICAgICAgaWYgKGR1cmF0aW9uIDwgOSlcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMSc7XHJcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPCAxNClcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMic7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMzJztcclxuICAgICAgICByZXR1cm4geyBuYW1lOiBtYXRjaGVzLnRhcmdldCwgcmVhc29uOiByZWFzb24gfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaGUgQ29waWVkIEZhY3RvcnlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNvcGllZEZhY3RvcnksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEJvbWInOiAnNDhCNCcsXHJcbiAgICAvLyBNYWtlIHN1cmUgZW5lbWllcyBhcmUgaWdub3JlZCBvbiB0aGVzZVxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEJvbWJhcmRtZW50JzogJzQ4QjgnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEFzc2F1bHQnOiAnNDhCNicsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNDhDNScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBTaWRlc3RyaWtpbmcgU3BpbiBTcGluIDEnOiAnNDhDQicsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBTaWRlc3RyaWtpbmcgU3BpbiAyJzogJzQ4Q0MnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgQ2VudHJpZnVnYWwgU3Bpbic6ICc0OEM5JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEFpci1Uby1TdXJmYWNlIEVuZXJneSc6ICc0OEJBJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEhpZ2gtQ2FsaWJlciBMYXNlcic6ICc0OEZBJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDEnOiAnNDhCQycsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAyJzogJzQ4QkQnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMyc6ICc0OEJFJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDQnOiAnNDhDMCcsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA1JzogJzQ4QzEnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNic6ICc0OEMyJyxcclxuXHJcbiAgICAnQ29waWVkIFRyYXNoIEVuZXJneSBCb21iJzogJzQ5MUQnLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBGcm9udGFsIFNvbWVyc2F1bHQnOiAnNDkxQicsXHJcbiAgICAnQ29waWVkIFRyYXNoIEhpZ2gtRnJlcXVlbmN5IExhc2VyJzogJzQ5MUUnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFNob2NraW5nIERpc2NoYXJnZSc6ICc0ODBCJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDEnOiAnNDlDNScsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAyJzogJzQ5QzYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMyc6ICc0OUM3JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDQnOiAnNDgwRicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA1JzogJzQ4MTAnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNic6ICc0ODExJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDEnOiAnNDgwMicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDInOiAnNDgwMycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDMnOiAnNDgwNCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVG93ZXJmYWxsJzogJzQ4MTMnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMSc6ICc0ODE2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMic6ICc0ODE3JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMyc6ICc0ODE4JyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBPaWwgV2VsbCc6ICc0ODFCJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEVsZWN0cm9tYWduZXRpYyBQdWxzZSc6ICc0ODE5JyxcclxuICAgIC8vIFRPRE86IHdoYXQncyB0aGUgZWxlY3RyaWZpZWQgZmxvb3Igd2l0aCBjb252ZXlvciBiZWx0cz9cclxuXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAyJzogJzQ5MzgnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDMnOiAnNDkzOScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNCc6ICc0OTNBJyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyA1JzogJzQ5MzcnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIExhc2VyIFR1cnJldCc6ICc0OEU2JyxcclxuXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IEFyZWEgQm9tYmluZyc6ICc0OTQzJyxcclxuICAgICdDb3BpZWQgRmxpZ2h0IFVuaXQgTGlnaHRmYXN0IEJsYWRlJzogJzQ5NDAnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMSc6ICc0NzI5JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMic6ICc0NzI4JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMyc6ICc0NzJGJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNCc6ICc0NzMxJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNSc6ICc0NzJCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNic6ICc0NzJEJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNyc6ICc0NzMyJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBJbmNlbmRpYXJ5IEJvbWJpbmcnOiAnNDczOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBHdWlkZWQgTWlzc2lsZSc6ICc0NzM2JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIFN1cmZhY2UgTWlzc2lsZSc6ICc0NzM0JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIExhc2VyIFNpZ2h0JzogJzQ3M0InLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgRnJhY2snOiAnNDc0RCcsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBDcnVzaCc6ICc0OEZDJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIENydXNoaW5nIFdoZWVsJzogJzQ3NEInLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBUaHJ1c3QnOiAnNDhGQycsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBMYXNlciBTdXBwcmVzc2lvbic6ICc0OEUwJywgLy8gQ2Fubm9uc1xyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDEnOiAnNDk3NCcsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMic6ICc0OERDJyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAzJzogJzQ4RTQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDQnOiAnNDhFMCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBNYXJ4IEltcGFjdCc6ICc0OEQ0JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMSc6ICc0OEU4JyxcclxuICAgICdDb3BpZWQgOVMgVGFuayBEZXN0cnVjdGlvbiAyJzogJzQ4RTknLFxyXG5cclxuICAgICdDb3BpZWQgOVMgU2VyaWFsIFNwaW4gMSc6ICc0OEE1JyxcclxuICAgICdDb3BpZWQgOVMgU2VyaWFsIFNwaW4gMic6ICc0OEE3JyxcclxuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3BpZWQgSG9iYmVzIFNob3J0LVJhbmdlIE1pc3NpbGUnOiAnNDgxNScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiA1MDkzIHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNEZCNSB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDUwRDMgQWVyaWFsIFN1cHBvcnQ6IEJvbWJhcmRtZW50IGdvaW5nIG9mZiBmcm9tIGFkZFxyXG4vLyBUT0RPOiA1MjExIE1hbmV1dmVyOiBWb2x0IEFycmF5IG5vdCBnZXR0aW5nIGludGVycnVwdGVkXHJcbi8vIFRPRE86IDRGRjQvNEZGNSBPbmUgb2YgdGhlc2UgaXMgZmFpbGluZyBjaGVtaWNhbCBjb25mbGFncmF0aW9uXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHdyb25nIHRlbGVwb3J0ZXI/PyBtYXliZSA1MzYzP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVB1cHBldHNCdW5rZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMSc6ICc1MDc0JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAyJzogJzUwNzUnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDMnOiAnNTA3NicsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBDb2xsaWRlciBDYW5ub25zJzogJzUwN0UnLCAvLyByb3RhdGluZyByZWQgZ3JvdW5kIGFvZSBwaW53aGVlbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDEnOiAnNTA5MScsIC8vIGNoYXNpbmcgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDInOiAnNTA5MicsIC8vIGNoYXNpbmcgbGFzZXIgY2hhc2luZ1xyXG4gICAgJ1B1cHBldCBBZWdpcyBGbGlnaHQgUGF0aCc6ICc1MDhDJywgLy8gYmx1ZSBsaW5lIGFvZSBmcm9tIGZseWluZyB1bnRhcmdldGFibGUgYWRkc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBSZWZyYWN0aW9uIENhbm5vbnMgMSc6ICc1MDgxJywgLy8gcmVmcmFjdGlvbiBjYW5ub25zIGJldHdlZW4gd2luZ3NcclxuICAgICdQdXBwZXQgQWVnaXMgTGlmZVxcJ3MgTGFzdCBTb25nJzogJzUzQjMnLCAvLyByaW5nIGFvZSB3aXRoIGdhcFxyXG4gICAgJ1B1cHBldCBMaWdodCBMb25nLUJhcnJlbGVkIExhc2VyJzogJzUyMTInLCAvLyBsaW5lIGFvZSBmcm9tIGFkZFxyXG4gICAgJ1B1cHBldCBMaWdodCBTdXJmYWNlIE1pc3NpbGUgSW1wYWN0JzogJzUyMEYnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSW5jZW5kaWFyeSBCb21iaW5nJzogJzRGQjknLCAvLyBmaXJlIHB1ZGRsZSBpbml0aWFsXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNoYXJwIFR1cm4nOiAnNTA2RCcsIC8vIHNoYXJwIHR1cm4gZGFzaFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMSc6ICc0RkIxJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMic6ICc0RkIyJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMyc6ICc0RkIzJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDEnOiAnNTA2RicsIC8vIHJpZ2h0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMic6ICc1MDcwJywgLy8gbGVmdC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBHdWlkZWQgTWlzc2lsZSc6ICc0RkI4JywgLy8gZ3JvdW5kIGFvZSBkdXJpbmcgQXJlYSBCb21iYXJkbWVudFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAxJzogJzRGQzAnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAyJzogJzRGQzEnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNEZGQycsIC8vIGNvbG9yZWQgbWFnaWMgaGFtbWVyLXkgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBSZXZvbHZpbmcgTGFzZXInOiAnNTAwMCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYic6ICc0RkZBJywgLy8gZ2V0dGluZyBoaXQgYnkgYmFsbCBkdXJpbmcgQWN0aXZlIFN1cHByZXNzaXZlIFVuaXRcclxuICAgICdQdXBwZXQgSGVhdnkgUjAxMCBMYXNlcic6ICc0RkYwJywgLy8gbGFzZXIgcG9kXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMzAgSGFtbWVyJzogJzRGRjEnLCAvLyBjaXJjbGUgYW9lIHBvZFxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc1MEIxJywgLy8gbG9uZyBhb2UgaW4gdGhlIGhhbGx3YXkgc2VjdGlvblxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEVuZXJneSBCb21iJzogJzUwQjInLCAvLyBydW5uaW5nIGludG8gYSBmbG9hdGluZyBvcmJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEaXNzZWN0aW9uJzogJzUxQjMnLCAvLyBzcGlubmluZyB2ZXJ0aWNhbCBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERlY2FwaXRhdGlvbic6ICc1MUI0JywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVW50YXJnZXRlZCc6ICc1MUI3JywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDEnOiAnNTFBQScsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDInOiAnNTFDQicsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAxJzogJzU0MUYnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAyJzogJzUxOTgnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDEnOiAnNTQyMCcsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDInOiAnNTE5OScsIC8vIDJQIHRlbGVwb3J0aW5nIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMSc6ICc1NDIxJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDInOiAnNTE5QScsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgR3JvdW5kJzogJzUxQUUnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBjaXJjbGVcclxuICAgIC8vIFRoaXMgaXMuLi4gdG9vIG5vaXN5LlxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMSc6ICc1MUEwJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGp1bXBcclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDInOiAnNTE5RicsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBjbGVhdmVcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMSc6ICc1MDg3JywgLy8gdXBwZXIgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAyJzogJzRGRjcnLCAvLyB1cHBlciBsYXNlciBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDEnOiAnNTA4NicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAyJzogJzRGRjYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMyc6ICc1MDg4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA0JzogJzRGRjgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDUnOiAnNTA4OScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA2JzogJzRGRjknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgSW5jb25ncnVvdXMgU3Bpbic6ICc1MUIyJywgLy8gZmluZCB0aGUgc2FmZSBzcG90IGRvdWJsZSBkYXNoXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgcHJldHR5IGxhcmdlIGFuZCBnZXR0aW5nIGhpdCBieSBpbml0aWFsIHdpdGhvdXQgYnVybnMgc2VlbXMgZmluZS5cclxuICAgIC8vICdQdXBwZXQgTGlnaHQgSG9taW5nIE1pc3NpbGUgSW1wYWN0JzogJzUyMTAnLCAvLyB0YXJnZXRlZCBmaXJlIGFvZSBmcm9tIE5vIFJlc3RyaWN0aW9uc1xyXG4gICAgJ1B1cHBldCBIZWF2eSBVbmNvbnZlbnRpb25hbCBWb2x0YWdlJzogJzUwMDQnLFxyXG4gICAgLy8gUHJldHR5IG5vaXN5LlxyXG4gICAgJ1B1cHBldCBNYW5ldXZlciBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNTAwMicsIC8vIHRhbmsgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaG5pY2FsIENvbnR1c2lvbiBUYXJnZXRlZCc6ICc1MUI2JywgLy8gdGFyZ2V0ZWQgc3ByZWFkIG1hcmtlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSMDEyIExhc2VyIFRhbmsnOiAnNTFBRScsIC8vIHRhcmdldGVkIHNwcmVhZCBwb2QgbGFzZXIgb24gbm9uLXRhbmtcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBBbnRpLVBlcnNvbm5lbCBMYXNlcic6ICc1MDkwJywgLy8gdGFuayBidXN0ZXIgbWFya2VyXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFByZWNpc2lvbi1HdWlkZWQgTWlzc2lsZSc6ICc0RkM1JyxcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUQnLCAvLyB0YXJnZXRlZCBwb2QgbGFzZXIgb24gdGFua1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnUHVwcGV0IEJ1cm5zJzogJzEwQicsIC8vIHN0YW5kaW5nIGluIG1hbnkgdmFyaW91cyBmaXJlIGFvZXNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBTaG9jayBCbGFjayAyP1xyXG4vLyBUT0RPOiBXaGl0ZS9CbGFjayBEaXNzb25hbmNlIGRhbWFnZSBpcyBtYXliZSB3aGVuIGZsYWdzIGVuZCBpbiAwMz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUb3dlckF0UGFyYWRpZ21zQnJlYWNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDEnOiAnNUVBNycsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IENlbnRlciAyJzogJzYwQzgnLCAvLyBDZW50ZXIgYW9lIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMSc6ICc1RUE1JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDInOiAnNUVBNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAzJzogJzYwQzYnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSA0JzogJzYwQzcnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBCdXJzdCc6ICc1RUQ0JywgLy8gU3BoZXJvaWQgS25hdmlzaCBCdWxsZXRzIGNvbGxpc2lvblxyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEJhcnJhZ2UnOiAnNUVBQycsIC8vIFNwaGVyb2lkIGxpbmUgYW9lc1xyXG4gICAgJ1Rvd2VyIEhhbnNlbCBSZXBheSc6ICc1QzcwJywgLy8gU2hpZWxkIGRhbWFnZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBFeHBsb3Npb24nOiAnNUM2NycsIC8vIEJlaW5nIGhpdCBieSBNYWdpYyBCdWxsZXQgZHVyaW5nIFBhc3NpbmcgTGFuY2VcclxuICAgICdUb3dlciBIYW5zZWwgSW1wYWN0JzogJzVDNUMnLCAvLyBCZWluZyBoaXQgYnkgTWFnaWNhbCBDb25mbHVlbmNlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDEnOiAnNUM2QycsIC8vIER1YWwgY2xlYXZlcyB3aXRob3V0IHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMic6ICc1QzZEJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAzJzogJzVDNkUnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDQnOiAnNUM2RicsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBQYXNzaW5nIExhbmNlJzogJzVDNjYnLCAvLyBUaGUgUGFzc2luZyBMYW5jZSBjaGFyZ2UgaXRzZWxmXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMSc6ICc1NUIzJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMic6ICc1QzVEJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMyc6ICc1QzVFJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEh1bmdyeSBMYW5jZSAxJzogJzVDNzEnLCAvLyAyeGxhcmdlIGNvbmFsIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEh1bmdyeSBMYW5jZSAyJzogJzVDNzInLCAvLyAyeGxhcmdlIGNvbmFsIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgTGlnaHRmYXN0IEJsYWRlJzogJzVCRkUnLCAvLyBsYXJnZSByb29tIGNsZWF2ZVxyXG4gICAgJ1Rvd2VyIEZsaWdodCBVbml0IFN0YW5kYXJkIExhc2VyJzogJzVCRkYnLCAvLyB0cmFja2luZyBsYXNlclxyXG4gICAgJ1Rvd2VyIDJQIFdoaXJsaW5nIEFzc2F1bHQnOiAnNUJGQicsIC8vIGxpbmUgYW9lIGZyb20gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgMlAgQmFsYW5jZWQgRWRnZSc6ICc1QkZBJywgLy8gY2lyY3VsYXIgYW9lIG9uIDJQIGNsb25lc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMSc6ICc2MDA2JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMic6ICc2MDA3JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMyc6ICc2MDA4JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNCc6ICc2MDA5JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNSc6ICc2MzEwJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNic6ICc2MzExJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNyc6ICc2MzEyJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgOCc6ICc2MzEzJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDEnOiAnNjAwRicsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBXaGl0ZSAyJzogJzYwMTAnLCAvLyB3aGl0ZSBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIGJsYWNrXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgQmxhY2sgMSc6ICc2MDExJywgLy8gYmxhY2sgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiB3aGl0ZVxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IFdoaXRlIDEnOiAnNjAxRicsIC8vIGJlaW5nIGhpdCBieSBhIHdoaXRlIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMic6ICc2MDIxJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBCbGFjayAxJzogJzYwMjAnLCAvLyBiZWluZyBoaXQgYnkgYSBibGFjayBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDInOiAnNjAyMicsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBXaGl0ZSc6ICc2MDBDJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIHdoaXRlIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFdpcGUgQmxhY2snOiAnNjAwRCcsIC8vIG5vdCBsaW5lIG9mIHNpZ2h0aW5nIHRoZSBibGFjayBtZXRlb3JcclxuICAgICdUb3dlciBSZWQgR2lybCBEaWZmdXNlIEVuZXJneSc6ICc2MDU2JywgLy8gcm90YXRpbmcgY2xvbmUgYnViYmxlIGNsZWF2ZXNcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBCaWcgRXhwbG9zaW9uJzogJzYwMjcnLCAvLyBub3Qga2lsbGluZyBhIHB5bG9uIGR1cmluZyBoYWNraW5nIHBoYXNlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUHlsb24gRXhwbG9zaW9uJzogJzYwMjYnLCAvLyBweWxvbiBkdXJpbmcgQ2hpbGQncyBwbGF5XHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBNaWRkbGUnOiAnNUMwMicsIC8vIG1pZGRsZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgU2lkZXMnOiAnNUMwNScsIC8vIHNpZGVzIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyAzJzogJzYwNzgnLCAvLyBnb2VzIHdpdGggNUMwMVxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgNCc6ICc2MDc5JywgLy8gZ29lcyB3aXRoIDVDMDRcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBFbmVyZ3kgQm9tYic6ICc1QzA1JywgLy8gcGluayBidWJibGVcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgUmlnaHQnOiAnNUJENycsIC8vIHJvdGF0aW5nIHdoZWVsIGdvaW5nIHJpZ2h0XHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWRlIE1hZ2ljIExlZnQnOiAnNUJENicsIC8vIHJvdGF0aW5nIHdoZWVsIGdvaW5nIGxlZnRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIExpZ2h0ZXIgTm90ZSc6ICc1QkRBJywgLy8gbGlnaHRlciBub3RlIG1vdmluZyBhb2VzXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWdpY2FsIEludGVyZmVyZW5jZSc6ICc1QkQ1JywgLy8gbGFzZXJzIGR1cmluZyBSaHl0aG0gUmluZ3NcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIFNjYXR0ZXJlZCBNYWdpYyc6ICc1QkRGJywgLy8gY2lyY2xlIGFvZXMgZnJvbSBTZWVkIE9mIE1hZ2ljXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgVW5ldmVuIEZvdHRpbmcnOiAnNUJFMicsIC8vIGJ1aWxkaW5nIGZyb20gUmVjcmVhdGUgU3RydWN0dXJlXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgQ3Jhc2gnOiAnNUJFNScsIC8vIHRyYWlucyBmcm9tIE1peGVkIFNpZ25hbHNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBIZWF2eSBBcm1zIDEnOiAnNUJFRCcsIC8vIGhlYXZ5IGFybXMgZnJvbnQvYmFjayBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBIZWF2eSBBcm1zIDInOiAnNUJFRicsIC8vIGhlYXZ5IGFybXMgc2lkZXMgYXR0YWNrXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgRW5lcmd5IFNjYXR0ZXJlZCBNYWdpYyc6ICc1QkU4JywgLy8gb3JicyBmcm9tIFJlZCBHaXJsIGJ5IHRyYWluXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgUGxhY2UgT2YgUG93ZXInOiAnNUMwRCcsIC8vIGluc3RhZGVhdGggbWlkZGxlIGNpcmNsZSBiZWZvcmUgYmxhY2svd2hpdGUgcmluZ3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEFydGlsbGVyeSBBbHBoYSc6ICc1RUFCJywgLy8gU3ByZWFkXHJcbiAgICAnVG93ZXIgSGFuc2VsIFNlZWQgT2YgTWFnaWMgQWxwaGEnOiAnNUM2MScsIC8vIFNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEJldGEnOiAnNUVCMycsIC8vIFRhbmtidXN0ZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBNYW5pcHVsYXRlIEVuZXJneSc6ICc2MDFBJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgRGFya2VyIE5vdGUnOiAnNUJEQycsIC8vIFRhbmtidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVG93ZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1RUIxID0gS25hdmUgTHVuZ2VcclxuICAgICAgLy8gNUJGMiA9IEhlciBJbmZsb3Jlc2VuY2UgU2hvY2t3YXZlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1RUIxJywgJzVCRjInXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ba2FkYWVtaWFBbnlkZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FueWRlciBBY3JpZCBTdHJlYW0nOiAnNDMwNCcsXHJcbiAgICAnQW55ZGVyIFdhdGVyc3BvdXQnOiAnNDMwNicsXHJcbiAgICAnQW55ZGVyIFJhZ2luZyBXYXRlcnMnOiAnNDMwMicsXHJcbiAgICAnQW55ZGVyIFZpb2xlbnQgQnJlYWNoJzogJzQzMDUnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDEnOiAnM0UwOCcsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMic6ICczRTBBJyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDEnOiAnM0UwOScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAyJzogJzNFMEInLFxyXG4gICAgJ0FueWRlciBBcXVhdGljIExhbmNlJzogJzNFMDUnLFxyXG4gICAgJ0FueWRlciBTeXJ1cCBTcG91dCc6ICc0MzA4JyxcclxuICAgICdBbnlkZXIgTmVlZGxlIFN0b3JtJzogJzQzMDknLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDEnOiAnM0UxMCcsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMic6ICczRTExJyxcclxuICAgICdBbnlkZXIgUHV0cmlkIEJyZWF0aCc6ICczRTEyJyxcclxuICAgICdBbnlkZXIgRGV0b25hdG9yJzogJzQzMEYnLFxyXG4gICAgJ0FueWRlciBEb21pbmlvbiBTbGFzaCc6ICc0MzBEJyxcclxuICAgICdBbnlkZXIgUXVhc2FyJzogJzQzMEInLFxyXG4gICAgJ0FueWRlciBEYXJrIEFycml2aXNtZSc6ICc0MzBFJyxcclxuICAgICdBbnlkZXIgVGh1bmRlcnN0b3JtJzogJzNFMUMnLFxyXG4gICAgJ0FueWRlciBXaW5kaW5nIEN1cnJlbnQnOiAnM0UxRicsXHJcbiAgICAvLyAzRTIwIGlzIGJlaW5nIGhpdCBieSB0aGUgZ3Jvd2luZyBvcmJzLCBtYXliZT9cclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbWF1cm90LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbWF1cm90IEJ1cm5pbmcgU2t5JzogJzM1NEEnLFxyXG4gICAgJ0FtYXVyb3QgV2hhY2snOiAnMzUzQycsXHJcbiAgICAnQW1hdXJvdCBBZXRoZXJzcGlrZSc6ICczNTNCJyxcclxuICAgICdBbWF1cm90IFZlbmVtb3VzIEJyZWF0aCc6ICczQ0NFJyxcclxuICAgICdBbWF1cm90IENvc21pYyBTaHJhcG5lbCc6ICc0RDI2JyxcclxuICAgICdBbWF1cm90IEVhcnRocXVha2UnOiAnM0NDRCcsXHJcbiAgICAnQW1hdXJvdCBNZXRlb3IgUmFpbic6ICczQ0M2JyxcclxuICAgICdBbWF1cm90IEZpbmFsIFNreSc6ICczQ0NCJyxcclxuICAgICdBbWF1cm90IE1hbGV2b2xlbmNlJzogJzM1NDEnLFxyXG4gICAgJ0FtYXVyb3QgVHVybmFib3V0JzogJzM1NDInLFxyXG4gICAgJ0FtYXVyb3QgU2lja2x5IEluZmVybm8nOiAnM0RFMycsXHJcbiAgICAnQW1hdXJvdCBEaXNxdWlldGluZyBHbGVhbSc6ICczNTQ2JyxcclxuICAgICdBbWF1cm90IEJsYWNrIERlYXRoJzogJzM1NDMnLFxyXG4gICAgJ0FtYXVyb3QgRm9yY2Ugb2YgTG9hdGhpbmcnOiAnMzU0NCcsXHJcbiAgICAnQW1hdXJvdCBEYW1uaW5nIFJheSAxJzogJzNFMDAnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMic6ICczRTAxJyxcclxuICAgICdBbWF1cm90IERlYWRseSBUZW50YWNsZXMnOiAnMzU0NycsXHJcbiAgICAnQW1hdXJvdCBNaXNmb3J0dW5lJzogJzNDRTInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0FtYXVyb3QgQXBva2FseXBzaXMnOiAnM0NENycsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQW5hbW5lc2lzQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFBodWFibyBTcGluZSBMYXNoJzogJzREMUEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBBbmVtb25lIEZhbGxpbmcgUm9jayc6ICc0RTM3JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2UgZnJvbSBUcmVuY2ggQW5lbW9uZSBzaG93aW5nIHVwXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBEYWdvbml0ZSBTZXdlciBXYXRlcic6ICc0RDFDJywgLy8gZnJvbnRhbCBjb25hbCBmcm9tIFRyZW5jaCBBbmVtb25lICg/ISlcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFJvY2sgSGFyZCc6ICc0RDIxJywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWW92cmEgVG9ycmVudGlhbCBUb3JtZW50JzogJzREMjEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gTHVtaW5vdXMgUmF5JzogJzRFMjcnLCAvLyBVbmtub3duIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2luc3RlciBCdWJibGUgRXhwbG9zaW9uJzogJzRCNkUnLCAvLyBVbmtub3duIGV4cGxvc2lvbnMgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gUmVmbGVjdGlvbic6ICc0QjZGJywgLy8gVW5rbm93biBjb25hbCBhdHRhY2sgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMSc6ICc0Qjc0JywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBDbGVhcm91dCAyJzogJzRCNkInLCAvLyBVbmtub3duIGZyb250YWwgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNldGJhY2sgMSc6ICc0Qjc1JywgLy8gVW5rbm93biByZWFyIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDInOiAnNUI2QycsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBDbGlvbmlkIEFjcmlkIFN0cmVhbSc6ICc0RDI0JywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgRGl2aW5lciBEcmVhZHN0b3JtJzogJzREMjgnLCAvLyBncm91bmQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIDIwMDAtTWluYSBTd2luZyc6ICc0QjU1JywgLy8gS3lrbG9wcyBnZXQgb3V0IG1lY2hhbmljXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgSGFtbWVyJzogJzRCNUQnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgQmxhZGUnOiAnNEI1RScsIC8vIEt5a2xvcHMgSGFtbWVyL0JsYWRlIGFsdGVybmF0aW5nIHNxdWFyZXNcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBSYWdpbmcgR2xvd2VyJzogJzRCNTYnLCAvLyBLeWtsb3BzIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgRXllIE9mIFRoZSBDeWNsb25lJzogJzRCNTcnLCAvLyBLeWtsb3BzIGRvbnV0XHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBIYXJwb29uZXIgSHlkcm9iYWxsJzogJzREMjYnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBTd2lmdCBTaGlmdCc6ICc0QjgzJywgLy8gUnVrc2hzIERlZW0gdGVsZXBvcnQgTi9TXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBEZXB0aCBHcmlwIFdhdmVicmVha2VyJzogJzMzRDQnLCAvLyBSdWtzaHMgRGVlbSBoYW5kIGF0dGFja3NcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIFJpc2luZyBUaWRlJzogJzRCOEInLCAvLyBSdWtzaHMgRGVlbSBjcm9zcyBhb2VcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIENvbW1hbmQgQ3VycmVudCc6ICc0QjgyJywgLy8gUnVrc2hzIERlZW0gcHJvdGVhbi1pc2ggZ3JvdW5kIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWHpvbWl0IE1hbnRsZSBEcmlsbCc6ICc0RDE5JywgLy8gY2hhcmdlIGF0dGFja1xyXG4gICAgJ0FuYW1uZXNpcyBJbyBPdXNpYSBCYXJyZWxpbmcgU21hc2gnOiAnNEUyNCcsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBXYW5kZXJlclxcJ3MgUHlyZSc6ICc0QjVGJywgLy8gS3lrbG9wcyBzcHJlYWQgYXR0YWNrXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IE1pc3NpbmcgR3Jvd2luZyB0ZXRoZXJzIG9uIGJvc3MgMi5cclxuLy8gKE1heWJlIGdhdGhlciBwYXJ0eSBtZW1iZXIgbmFtZXMgb24gdGhlIHByZXZpb3VzIFRJSUlJTUJFRUVFRUVSIGNhc3QgZm9yIGNvbXBhcmlzb24/KVxyXG4vLyBUT0RPOiBGYWlsaW5nIHRvIGludGVycnVwdCBEb2huZmF1c3QgRnVhdGggb24gV2F0ZXJpbmcgV2hlZWwgY2FzdHM/XHJcbi8vICgxNTouLi4uLi4uLjpEb2huZmFzdCBGdWF0aDozREFBOldhdGVyaW5nIFdoZWVsOi4uLi4uLi4uOihcXHl7TmFtZX0pOilcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Eb2huTWhlZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRG9obiBNaGVnIEdleXNlcic6ICcyMjYwJywgLy8gV2F0ZXIgZXJ1cHRpb25zLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgSHlkcm9mYWxsJzogJzIyQkQnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIExhdWdoaW5nIExlYXAnOiAnMjI5NCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgU3dpbmdlJzogJzIyQ0EnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0RvaG4gTWhlZyBDYW5vcHknOiAnM0RCMCcsIC8vIEZyb250YWwgY29uZSwgRG9obmZhdXN0IFJvd2FucyB0aHJvdWdob3V0IGluc3RhbmNlXHJcbiAgICAnRG9obiBNaGVnIFBpbmVjb25lIEJvbWInOiAnM0RCMScsIC8vIENpcmN1bGFyIGdyb3VuZCBBb0UgbWFya2VyLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgQmlsZSBCb21iYXJkbWVudCc6ICczNEVFJywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBDb3Jyb3NpdmUgQmlsZSc6ICczNEVDJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDNcclxuICAgICdEb2huIE1oZWcgRmxhaWxpbmcgVGVudGFjbGVzJzogJzM2ODEnLFxyXG5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEltcCBDaG9pcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NkUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBUb2FkIENob2lyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFCNycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEZvb2xcXCdzIFR1bWJsZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxODMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogQmVyc2Vya2VyIDJuZC8zcmQgd2lsZCBhbmd1aXNoIHNob3VsZCBiZSBzaGFyZWQgd2l0aCBqdXN0IGEgcm9ja1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUhlcm9lc0dhdW50bGV0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUSEcgQmxhZGVcXCdzIEJlbmlzb24nOiAnNTIyOCcsIC8vIHBsZCBjb25hbFxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBIb2x5JzogJzUyNEInLCAvLyB3aG0gdmVyeSBsYXJnZSBhb2VcclxuICAgICdUSEcgSGlzc2F0c3U6IEdva2EnOiAnNTIzRCcsIC8vIHNhbSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBXaG9sZSBTZWxmJzogJzUyMkQnLCAvLyBtbmsgd2lkZSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBSYW5kZ3JpdGgnOiAnNTIzMicsIC8vIGRyZyB2ZXJ5IGJpZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMSc6ICc1MDYxJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMic6ICc1MDYyJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBDb3dhcmRcXCdzIEN1bm5pbmcnOiAnNEZENycsIC8vIFNwZWN0cmFsIFRoaWVmIENoaWNrZW4gS25pZmUgbGFzZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMSc6ICc0RkQxJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMic6ICc0RkQyJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUmluZyBvZiBEZWF0aCc6ICc1MjM2JywgLy8gZHJnIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBMdW5hciBFY2xpcHNlJzogJzUyMjcnLCAvLyBwbGQgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIEdyYXZpdHknOiAnNTI0OCcsIC8vIGluayBtYWdlIGNpcmN1bGFyXHJcbiAgICAnVEhHIFJhaW4gb2YgTGlnaHQnOiAnNTI0MicsIC8vIGJhcmQgbGFyZ2UgY2lyY3VsZSBhb2VcclxuICAgICdUSEcgRG9vbWluZyBGb3JjZSc6ICc1MjM5JywgLy8gZHJnIGxpbmUgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIERhcmsgSUknOiAnNEY2MScsIC8vIE5lY3JvbWFuY2VyIDEyMCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgQnVyc3QnOiAnNTNCNycsIC8vIE5lY3JvbWFuY2VyIG5lY3JvYnVyc3Qgc21hbGwgem9tYmllIGV4cGxvc2lvblxyXG4gICAgJ1RIRyBQYWluIE1pcmUnOiAnNEZBNCcsIC8vIE5lY3JvbWFuY2VyIHZlcnkgbGFyZ2UgZ3JlZW4gYmxlZWQgcHVkZGxlXHJcbiAgICAnVEhHIERhcmsgRGVsdWdlJzogJzRGNUQnLCAvLyBOZWNyb21hbmNlciBncm91bmQgYW9lXHJcbiAgICAnVEhHIFRla2thIEdvamluJzogJzUyM0UnLCAvLyBzYW0gOTAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAxJzogJzUyMEEnLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDInOiAnNTIwQicsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBXaWxkIFJhZ2UnOiAnNTIwMycsIC8vIEJlcnNlcmtlciBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUSEcgQWJzb2x1dGUgVGh1bmRlciBJVic6ICc1MjQ1JywgLy8gaGVhZG1hcmtlciBhb2UgZnJvbSBibG1cclxuICAgICdUSEcgTW9vbmRpdmVyJzogJzUyMzMnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGRyZ1xyXG4gICAgJ1RIRyBTcGVjdHJhbCBHdXN0JzogJzUzQ0YnLCAvLyBTcGVjdHJhbCBUaGllZiBoZWFkbWFya2VyIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVEhHIEZhbGxpbmcgUm9jayc6ICc1MjA1JywgLy8gQmVyc2Vya2VyIGhlYWRtYXJrZXIgYW9lIHRoYXQgY3JlYXRlcyBydWJibGVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RIRyBCbGVlZGluZyc6ICc4MjgnLCAvLyBTdGFuZGluZyBpbiB0aGUgTmVjcm9tYW5jZXIgcHVkZGxlIG9yIG91dHNpZGUgdGhlIEJlcnNlcmtlciBhcmVuYVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnVEhHIFRydWx5IEJlcnNlcmsnOiAnOTA2JywgLy8gU3RhbmRpbmcgaW4gdGhlIGNyYXRlciB0b28gbG9uZ1xyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSBzaGFyZWQuICBPbiBhbGwgdGltZXMgYnV0IHRoZSAybmQgYW5kIDNyZCwgaXQncyBhIHBhcnR5IHNoYXJlLlxyXG4gICAgLy8gVE9ETzogb24gdGhlIDJuZCBhbmQgM3JkIHRpbWUgdGhpcyBzaG91bGQgb25seSBiZSBzaGFyZWQgd2l0aCBhIHJvY2suXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5IHdhcm4gb24gdGFraW5nIG9uZSBvZiB0aGVzZSB3aXRoIGEgNDcyIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgZWZmZWN0XHJcbiAgICAnVEhHIFdpbGQgQW5ndWlzaCc6ICc1MjA5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEhHIFdpbGQgUmFtcGFnZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1MjA3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGlzIHplcm8gZGFtYWdlIGlmIHlvdSBhcmUgaW4gdGhlIGNyYXRlci5cclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ib2xtaW5zdGVyU3dpdGNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIFRodW1ic2NyZXcnOiAnM0RDNicsXHJcbiAgICAnSG9sbWluc3RlciBXb29kZW4gaG9yc2UnOiAnM0RDNycsXHJcbiAgICAnSG9sbWluc3RlciBMaWdodCBTaG90JzogJzNEQzgnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSGVyZXRpY1xcJ3MgRm9yayc6ICczRENFJyxcclxuICAgICdIb2xtaW5zdGVyIEhvbHkgV2F0ZXInOiAnM0RENCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAxJzogJzNEREQnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMic6ICczRERFJyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDMnOiAnM0RERicsXHJcbiAgICAnSG9sbWluc3RlciBDYXQgT1xcJyBOaW5lIFRhaWxzJzogJzNERTEnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgUmlnaHQgS25vdXQnOiAnM0RFNicsXHJcbiAgICAnSG9sbWluc3RlciBMZWZ0IEtub3V0JzogJzNERTcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgQWV0aGVyc3VwJzogJzNERTknLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSG9sbWluc3RlciBGbGFnZWxsYXRpb24nOiAnM0RENicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIb2xtaW5zdGVyIFRhcGhlcGhvYmlhJzogJzQxODEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hbGlrYWhzV2VsbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWFsaWthaCBGYWxsaW5nIFJvY2snOiAnM0NFQScsXHJcbiAgICAnTWFsaWthaCBXZWxsYm9yZSc6ICczQ0VEJyxcclxuICAgICdNYWxpa2FoIEdleXNlciBFcnVwdGlvbic6ICczQ0VFJyxcclxuICAgICdNYWxpa2FoIFN3aWZ0IFNwaWxsJzogJzNDRjAnLFxyXG4gICAgJ01hbGlrYWggQnJlYWtpbmcgV2hlZWwgMSc6ICczQ0Y1JyxcclxuICAgICdNYWxpa2FoIENyeXN0YWwgTmFpbCc6ICczQ0Y3JyxcclxuICAgICdNYWxpa2FoIEhlcmV0aWNcXCdzIEZvcmsgMSc6ICczQ0Y5JyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDInOiAnM0NGQScsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDInOiAnM0UwRScsXHJcbiAgICAnTWFsaWthaCBFYXJ0aHNoYWtlJzogJzNFMzknLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogY291bGQgaW5jbHVkZSA1NDg0IE11ZG1hbiBSb2NreSBSb2xsIGFzIGEgc2hhcmVXYXJuLCBidXQgaXQncyBsb3cgZGFtYWdlIGFuZCBjb21tb24uXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0b3lhc1JlbGljdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWF0b3lhIFJlbGljdCBXZXJld29vZCBPdmF0aW9uJzogJzU1MTgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdG95YSBDYXZlIFRhcmFudHVsYSBIYXdrIEFwaXRveGluJzogJzU1MTknLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBTcHJpZ2dhbiBTdG9uZWJlYXJlciBSb21wJzogJzU1MUEnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgU29ubnkgT2YgWmlnZ3kgSml0dGVyaW5nIEdsYXJlJzogJzU1MUMnLCAvLyBsb25nIG5hcnJvdyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIFF1YWdtaXJlJzogJzU0ODEnLCAvLyBNdWRtYW4gYW9lIHB1ZGRsZXNcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAxJzogJzU0OEUnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDInOiAnNTQ4RicsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMyc6ICc1NDkwJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIE11ZCBCdWJibGUnOiAnNTQ4NycsIC8vIHN0YW5kaW5nIGluIG11ZCBwdWRkbGU/XHJcbiAgICAnTWF0b3lhIENhdmUgUHVnaWwgU2NyZXdkcml2ZXInOiAnNTUxRScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBOaXhpZSBHdXJnbGUnOiAnNTk5MicsIC8vIE5peGllIHdhbGwgZmx1c2hcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFB5cm9jbGFzdGljIFNob3QnOiAnNTdFQicsIC8vIHRoZSBsaW5lIGFvZXMgYXMgeW91IHJ1biB0byB0cmFzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgRmxhbiBGbG9vZCc6ICc1NTIzJywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUHlyb2R1Y3QgRWxkdGh1cnMgTWFzaCc6ICc1NTI3JywgLy8gbGluZSBhb2VcclxuICAgICdNYXR5b2EgUHlyb2R1Y3QgRWxkdGh1cnMgU3Bpbic6ICc1NTI4JywgLy8gdmVyeSBsYXJnZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBCYXZhcm9pcyBUaHVuZGVyIElJSSc6ICc1NTI1JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTWFyc2htYWxsb3cgQW5jaWVudCBBZXJvJzogJzU1MjQnLCAvLyB2ZXJ5IGxhcmdlIGxpbmUgZ3JvYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBQdWRkaW5nIEZpcmUgSUknOiAnNTUyMicsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIEhvdCBMYXZhJzogJzU3RTknLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFZvbGNhbmljIERyb3AnOiAnNTdFOCcsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBNZWRpdW0gUmVhcic6ICc1OTFEJywgLy8ga25vY2tiYWNrIGludG8gc2FmZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgTGluZSc6ICc1OTE3JywgLy8gbGluZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIENpcmNsZSc6ICc1OTE4JywgLy8gY2lyY2xlIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgVG8gQSBDcmlzcCc6ICc1OTI1JywgLy8gZ2V0dGluZyB0byBjbG9zZSB0byBib3NzIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFByb3hpZSBCdWZmZXQnOiAnNTkyNicsIC8vIEFlb2xpYW4gQ2F2ZSBTcHJpdGUgbGluZSBhb2UgKGlzIHRoaXMgYSBwdW4/KVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBTZWEgU2hhbnR5JzogJzU5OEMnLCAvLyBOb3QgdGFraW5nIHRoZSBwdWRkbGUgdXAgdG8gdGhlIHRvcD8gRmFpbGluZyBhZGQgZW5yYWdlP1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIENyYWNrJzogJzU5OTAnLCAvLyBOaXhpZSBDcmFzaC1TbWFzaCB0YW5rIHRldGhlcnNcclxuICAgICdNYXRveWEgTml4aWUgU3B1dHRlcic6ICc1OTkzJywgLy8gTml4aWUgc3ByZWFkIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk10R3VsZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3VsZyBJbW1vbGF0aW9uJzogJzQxQUEnLFxyXG4gICAgJ0d1bGcgVGFpbCBTbWFzaCc6ICc0MUFCJyxcclxuICAgICdHdWxnIEhlYXZlbnNsYXNoJzogJzQxQTknLFxyXG4gICAgJ0d1bGcgVHlwaG9vbiBXaW5nIDEnOiAnM0QwMCcsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMic6ICczRDAxJyxcclxuICAgICdHdWxnIEh1cnJpY2FuZSBXaW5nJzogJzNEMDMnLFxyXG4gICAgJ0d1bGcgRWFydGggU2hha2VyJzogJzM3RjUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmljYXRpb24nOiAnNDFBRScsXHJcbiAgICAnR3VsZyBFeGVnZXNpcyc6ICczRDA3JyxcclxuICAgICdHdWxnIFBlcmZlY3QgQ29udHJpdGlvbic6ICczRDBFJyxcclxuICAgICdHdWxnIFNhbmN0aWZpZWQgQWVybyc6ICc0MUFEJyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDEnOiAnM0QxNicsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAyJzogJzNEMTgnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMyc6ICc0NjY5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDQnOiAnM0QxOScsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyA1JzogJzNEMjEnLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDEnOiAnM0QxQScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMic6ICczRDFCJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAzJzogJzNEMjAnLFxyXG4gICAgJ0d1bGcgVmVuYSBBbW9yaXMnOiAnM0QyNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnR3VsZyBMdW1lbiBJbmZpbml0dW0nOiAnNDFCMicsXHJcbiAgICAnR3VsZyBSaWdodCBQYWxtJzogJzM3RjgnLFxyXG4gICAgJ0d1bGcgTGVmdCBQYWxtJzogJzM3RkEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogV2hhdCB0byBkbyBhYm91dCBLYWhuIFJhaSA1QjUwP1xyXG4vLyBJdCBzZWVtcyBpbXBvc3NpYmxlIGZvciB0aGUgbWFya2VkIHBlcnNvbiB0byBhdm9pZCBlbnRpcmVseS5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5QYWdsdGhhbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gVGVsb3ZvdWl2cmUgUGxhZ3VlIFN3aXBlJzogJzYwRkMnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIExlc3NlciBUZWxvZHJhZ29uIEVuZ3VsZmluZyBGbGFtZXMnOiAnNjBGNScsIC8vIGZyb250YWwgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBMaWdodG5pbmcgQm9sdCc6ICc1QzRDJywgLy8gY2lyY3VsYXIgbGlnaHRuaW5nIGFvZSAob24gc2VsZiBvciBwb3N0KVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUyJywgLy8gcHVsc2luZyBzbWFsbCBjaXJjdWxhciBhb2VzXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBTdXBlcmNoYXJnZWQgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUzJywgLy8gcHVsc2luZyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIFdpZGUgQmxhc3Rlcic6ICc2MEM1JywgLy8gcmVhciBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBUZWxvYnJvYmlueWFrIEZhbGwgT2YgTWFuJzogJzYxNDgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFJlYXBlciBNYWdpdGVrIENhbm5vbic6ICc2MTIxJywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBTaGVldCBvZiBJY2UnOiAnNjBGOCcsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gRnJvc3QgQnJlYXRoJzogJzYwRjcnLCAvLyB2ZXJ5IGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgQ29yZSBTdGFibGUgQ2Fubm9uJzogJzVDOTQnLCAvLyBsYXJnZSBsaW5lIGFvZXNcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgMi1Ub256ZSBNYWdpdGVrIE1pc3NpbGUnOiAnNUM5NScsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG90ZWsgU2t5IEFybW9yIEFldGhlcnNob3QnOiAnNUM5QycsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hcmsgSUkgVGVsb3RlayBDb2xvc3N1cyBFeGhhdXN0JzogJzVDOTknLCAvLyBsYXJnZSBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgTWlzc2lsZSBFeHBsb3NpdmUgRm9yY2UnOiAnNUM5OCcsIC8vIHNsb3cgbW92aW5nIGhvcml6b250YWwgbWlzc2lsZXNcclxuICAgICdQYWdsdGhhbiBUaWFtYXQgRmxhbWlzcGhlcmUnOiAnNjEwRicsIC8vIHZlcnkgbG9uZyBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIEFybW9yZWQgVGVsb2RyYWdvbiBUb3J0b2lzZSBTdG9tcCc6ICc2MTRCJywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lIGZyb20gdHVydGxlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBUaHVuZGVyb3VzIEJyZWF0aCc6ICc2MTQ5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBOYWlsIFVwYnVyc3QnOiAnNjA1QicsIC8vIHNtYWxsIGFvZXMgYmVmb3JlIEJpZyBCdXJzdFxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBCaWcgQnVyc3QnOiAnNUI0OCcsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZXMgZnJvbSBuYWlsc1xyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgUGVyaWdlYW4gQnJlYXRoJzogJzVCNTknLCAvLyBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjRFJywgLy8gbWVnYWZsYXJlIHBlcHBlcm9uaVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlIERpdmUnOiAnNUI1MicsIC8vIG1lZ2FmbGFyZSBsaW5lIGFvZSBhY3Jvc3MgdGhlIGFyZW5hXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBGbGFyZSc6ICc1QjRBJywgLy8gbGFyZ2UgcHVycGxlIHNocmlua2luZyBjaXJjbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjREJywgLy8gbWVnYWZsYXJlIHNwcmVhZCBtYXJrZXJzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUWl0YW5hUmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBTdW4gVG9zcyc6ICczQzhBJywgLy8gR3JvdW5kIEFvRSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDEnOiAnM0M4QycsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAxJzogJzNDOEYnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDInOiAnM0M5MCcsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIFJvY2snOiAnM0M5NicsIC8vIFNtYWxsIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgQm91bGRlcic6ICczQzk3JywgLy8gTGFyZ2UgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVG93ZXJmYWxsJzogJzNDOTgnLCAvLyBQaWxsYXIgY29sbGFwc2UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAyJzogJzNDOUUnLCAvLyBTdGF0aW9uYXJ5IHBvaXNvbiBwdWRkbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMSc6ICczQ0EyJywgLy8gRGFuZ2Vyb3VzIG1pZGRsZSBkdXJpbmcgc3ByZWFkIGNpcmNsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAzJzogJzNDQTYnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDQnOiAnM0NBNycsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAyJzogJzNENkQnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBXcmF0aCBvZiB0aGUgUm9ua2EnOiAnM0UyQycsIC8vIFN0YXR1ZSBsaW5lIGF0dGFjayBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnUWl0YW5hIFNpbnNwaXR0ZXInOiAnM0UzNicsIC8vIEdvcmlsbGEgYm91bGRlciB0b3NzIEFvRSBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ1FpdGFuYSBIb3VuZCBvdXQgb2YgSGVhdmVuJzogJzQyQjgnLCAvLyBUZXRoZXIgZXh0ZW5zaW9uIGZhaWx1cmUsIGJvc3MgdGhyZWU7IDQyQjcgaXMgY29ycmVjdCBleGVjdXRpb25cclxuICAgICdRaXRhbmEgUm9ua2FuIEFieXNzJzogJzQzRUInLCAvLyBHcm91bmQgQW9FIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMSc6ICczQzlEJywgLy8gQW9FIGZyb20gdGhlIDAwQUIgcG9pc29uIGhlYWQgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMic6ICczQ0EzJywgLy8gT3ZlcmxhcHBlZCBjaXJjbGVzIGZhaWx1cmUgb24gdGhlIHNwcmVhZCBjaXJjbGVzIHZlcnNpb24gb2YgdGhlIG1lY2hhbmljXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaGUgR3JhbmQgQ29zbW9zXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVHcmFuZENvc21vcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQ29zbW9zIElyb24gSnVzdGljZSc6ICc0OTFGJyxcclxuICAgICdDb3Ntb3MgU21pdGUgT2YgUmFnZSc6ICc0OTIxJyxcclxuXHJcbiAgICAnQ29zbW9zIFRyaWJ1bGF0aW9uJzogJzQ5QTQnLFxyXG4gICAgJ0Nvc21vcyBEYXJrIFNob2NrJzogJzQ3NkYnLFxyXG4gICAgJ0Nvc21vcyBTd2VlcCc6ICc0NzcwJyxcclxuICAgICdDb3Ntb3MgRGVlcCBDbGVhbic6ICc0NzcxJyxcclxuXHJcbiAgICAnQ29zbW9zIFNoYWRvdyBCdXJzdCc6ICc0OTI0JyxcclxuICAgICdDb3Ntb3MgQmxvb2R5IENhcmVzcyc6ICc0OTI3JyxcclxuICAgICdDb3Ntb3MgTmVwZW50aGljIFBsdW5nZSc6ICc0OTI4JyxcclxuICAgICdDb3Ntb3MgQnJld2luZyBTdG9ybSc6ICc0OTI5JyxcclxuXHJcbiAgICAnQ29zbW9zIE9kZSBUbyBGYWxsZW4gUGV0YWxzJzogJzQ5NTAnLFxyXG4gICAgJ0Nvc21vcyBGYXIgV2luZCBHcm91bmQnOiAnNDI3MycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlIEJyZWF0aCc6ICc0OTJCJyxcclxuICAgICdDb3Ntb3MgUm9ua2FuIEZyZWV6ZSc6ICc0OTJFJyxcclxuICAgICdDb3Ntb3MgT3ZlcnBvd2VyJzogJzQ5MkQnLFxyXG5cclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIExlZnQnOiAnNDc2MycsXHJcbiAgICAnQ29zbW9zIFNjb3JjaGluZyBSaWdodCc6ICc0NzYyJyxcclxuICAgICdDb3Ntb3MgT3RoZXJ3b3JkbHkgSGVhdCc6ICc0NzVDJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgSXJlJzogJzQ3NjEnLFxyXG4gICAgJ0Nvc21vcyBQbHVtbWV0JzogJzQ3NjcnLFxyXG5cclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluIFRldGhlcic6ICc0NzVGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0Nvc21vcyBEYXJrIFdlbGwnOiAnNDc2RCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIFNwcmVhZCc6ICc0NzI0JyxcclxuICAgICdDb3Ntb3MgQmxhY2sgRmxhbWUnOiAnNDc1RCcsXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIERvbWFpbic6ICc0NzYwJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUd2lubmluZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVHdpbm5pbmcgQXV0byBDYW5ub25zJzogJzQzQTknLFxyXG4gICAgJ1R3aW5uaW5nIEhlYXZlJzogJzNEQjknLFxyXG4gICAgJ1R3aW5uaW5nIDMyIFRvbnplIFN3aXBlJzogJzNEQkInLFxyXG4gICAgJ1R3aW5uaW5nIFNpZGVzd2lwZSc6ICczREJGJyxcclxuICAgICdUd2lubmluZyBXaW5kIFNwb3V0JzogJzNEQkUnLFxyXG4gICAgJ1R3aW5uaW5nIFNob2NrJzogJzNERjEnLFxyXG4gICAgJ1R3aW5uaW5nIExhc2VyYmxhZGUnOiAnM0RFQycsXHJcbiAgICAnVHdpbm5pbmcgVm9ycGFsIEJsYWRlJzogJzNEQzInLFxyXG4gICAgJ1R3aW5uaW5nIFRocm93biBGbGFtZXMnOiAnM0RDMycsXHJcbiAgICAnVHdpbm5pbmcgTWFnaXRlayBSYXknOiAnM0RGMycsXHJcbiAgICAnVHdpbm5pbmcgSGlnaCBHcmF2aXR5JzogJzNERkEnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1R3aW5uaW5nIDEyOCBUb256ZSBTd2lwZSc6ICczREJBJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IERlYWQgSXJvbiA1QUIwIChlYXJ0aHNoYWtlcnMsIGJ1dCBvbmx5IGlmIHlvdSB0YWtlIHR3bz8pXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY3kgRm91cmZvbGQnOiAnNUIzNCcsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUI0JywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyOCcsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAxJzogJzVBQTQnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQTUnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQTYnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUE3JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQTgnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFBOScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQUUnLCAvLyBDaGFpbiBkYW1hZ2VcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgQnJlZXplJzogJzVBQUInLCAvLyBXYWZmbGUgY3Jpc3MtY3Jvc3MgZmxvb3IgbWFya2Vyc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCbG9vbXMnOiAnNUFBRCcsIC8vIFB1cnBsZSBncm93aW5nIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlJzogJzU3NjEnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlJzogJzU3NjInLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmlyZWJyZWF0aGUnOiAnNTc2NScsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc1QScsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhlYWQgRG93bic6ICc1NzU2JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bSBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzU3JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmFsbGluZyBSb2NrJzogJzU3NUMnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW0gRGFodSBIb3QgQ2hhcmdlJzogJzU3NjQnLCAvLyBkb3VibGUgY2hhcmdlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaXBwZXIgQ2xhdyc6ICc1NzVEJywgLy8gZnJvbnRhbCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IFRhaWwgU3dpbmcnOiAnNTc1RicsIC8vIHRhaWwgc3dpbmcgOylcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBQYXduIE9mZic6ICc1ODA2JywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDEnOiAnNTgwRCcsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMic6ICc1ODBFJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAzJzogJzU4MEYnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1N0YzJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlclxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1N0YyJywgLy8gUXVlZW4ncyBLbmlnaHQgc3dvcmQgZ2V0IG91dFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIENvdW50ZXJwbGF5JzogJzU3RjYnLCAvLyBIaXR0aW5nIGFldGhlcmlhbCB3YXJkIGRpcmVjdGlvbmFsIGJhcnJpZXJcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QTknLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0FBJywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lcyBmcm9tIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gQ3JlZXBpbmcgTWlhc21hJzogJzU3QTUnLCAvLyBwaGFudG9tIGxpbmUgYW9lIGZyb20gc3F1YXJlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCMScsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZ1cnkgT2YgQm96amEnOiAnNTk3MycsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwib3V0XCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRmxhc2h2YW5lJzogJzU5NzInLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBiZWhpbmRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBJbmZlcm5hbCBTbGFzaCc6ICc1OTcxJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgZnJvbnRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFtZXMgT2YgQm96amEnOiAnNTk2OCcsIC8vIDgwJSBmbG9vciBhb2UgYmVmb3JlIHNoaW1tZXJpbmcgc2hvdCBzd29yZHNcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgR2xlYW1pbmcgQXJyb3cnOiAnNTk3NCcsIC8vIFRyaW5pdHkgQXZhdGFyIGxpbmUgYW9lcyBmcm9tIG91dHNpZGVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUJCJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlCRCcsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUJBJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgRW5kIDInOiAnNTlCQycsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUM0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCc6ICc1QjgzJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFF1ZWVuXFwncyBKdXN0aWNlJzogJzU5QkYnLCAvLyBmYWlsaW5nIHRvIHdhbGsgdGhlIHJpZ2h0IG51bWJlciBvZiBzcXVhcmVzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDEnOiAnNTlFMCcsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDInOiAnNTlFMScsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDMnOiAnNTlFMicsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUGF3biBPZmYnOiAnNTlEQScsIC8vIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lIGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTlDRScsIC8vIFF1ZWVuJ3MgS25pZ2h0IHNoaWVsZCBnZXQgdW5kZXIgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5Q0MnLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0IGR1cmluZyBRdWVlblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtIEhpZGRlbiBUcmFwIE1hc3NpdmUgRXhwbG9zaW9uJzogJzVBNkUnLCAvLyBleHBsb3Npb24gdHJhcFxyXG4gICAgJ0RlbHVicnVtIEhpZGRlbiBUcmFwIFBvaXNvbiBUcmFwJzogJzVBNkYnLCAvLyBwb2lzb24gdHJhcFxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBIZWF0IFNob2NrJzogJzU5NUUnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTVGJywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhlYXQgQnJlYXRoJzogJzU3NjYnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBXcmF0aCBPZiBCb3pqYSc6ICc1OTc1JywgLy8gdGFuayBjbGVhdmVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBNb29uJzogJzI2MicsIC8vIFwiUGV0cmlmaWNhdGlvblwiIGZyb20gQWV0aGVyaWFsIE9yYiBsb29rYXdheVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQXQgbGVhc3QgZHVyaW5nIFRoZSBRdWVlbiwgdGhlc2UgYWJpbGl0eSBpZHMgY2FuIGJlIG9yZGVyZWQgZGlmZmVyZW50bHksXHJcbiAgICAgIC8vIGFuZCB0aGUgZmlyc3QgZXhwbG9zaW9uIFwiaGl0c1wiIGV2ZXJ5b25lLCBhbHRob3VnaCB3aXRoIFwiMUJcIiBmbGFncy5cclxuICAgICAgaWQ6ICdEZWx1YnJ1bSBMb3RzIENhc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzU2NUEnLCAnNTY1QicsICc1N0ZEJywgJzU3RkUnLCAnNUI4NicsICc1Qjg3JywgJzU5RDInLCAnNUQ5MyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogRGFodSA1Nzc2IFNwaXQgRmxhbWUgc2hvdWxkIGFsd2F5cyBoaXQgYSBNYXJjaG9zaWFzXHJcbi8vIFRPRE86IGhpdHRpbmcgcGhhbnRvbSB3aXRoIGljZSBzcGlrZXMgd2l0aCBhbnl0aGluZyBidXQgZGlzcGVsP1xyXG4vLyBUT0RPOiBmYWlsaW5nIGljeS9maWVyeSBwb3J0ZW50IChndWFyZCBhbmQgcXVlZW4pXHJcbi8vICAgICAgIGAxODpQeXJldGljIERvVCBUaWNrIG9uICR7bmFtZX0gZm9yICR7ZGFtYWdlfSBkYW1hZ2UuYFxyXG4vLyBUT0RPOiBXaW5kcyBPZiBGYXRlIC8gV2VpZ2h0IE9mIEZvcnR1bmU/XHJcbi8vIFRPRE86IFR1cnJldCdzIFRvdXI/XHJcbi8vIGdlbmVyYWwgdHJhcHM6IGV4cGxvc2lvbjogNUE3MSwgcG9pc29uIHRyYXA6IDVBNzIsIG1pbmk6IDVBNzNcclxuLy8gZHVlbCB0cmFwczogbWluaTogNTdBMSwgaWNlOiA1NzlGLCB0b2FkOiA1N0EwXHJcbi8vIFRPRE86IHRha2luZyBtYW5hIGZsYW1lIHdpdGhvdXQgcmVmbGVjdFxyXG4vLyBUT0RPOiB0YWtpbmcgTWFlbHN0cm9tJ3MgQm9sdCB3aXRob3V0IGxpZ2h0bmluZyBidWZmXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2xpbWVzIEhlbGxpc2ggU2xhc2gnOiAnNTdFQScsIC8vIEJvemphbiBTb2xkaWVyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgVmlzY291cyBSdXB0dXJlJzogJzUwMTYnLCAvLyBGdWxseSBtZXJnZWQgdmlzY291cyBzbGltZSBhb2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEdvbGVtcyBEZW1vbGlzaCc6ICc1ODgwJywgLy8gaW50ZXJydXB0aWJsZSBSdWlucyBHb2xlbSBjYXN0XHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUQxJywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyQScsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQ0InLCAvLyBDaGFpbnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMSc6ICc1Qjk0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDInOiAnNUFCOScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAzJzogJzVBQkEnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNCc6ICc1QUJCJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDUnOiAnNUFCQycsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFDOCcsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQ29tZXQnOiAnNUFENycsIC8vIENsb25lIG1ldGVvciBkcm9wcGluZyBiZWZvcmUgY2hhcmdlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIEZpcmVzdG9ybSc6ICc1QUQ4JywgLy8gQ2xvbmUgY2hhcmdlIGFmdGVyIEJhbGVmdWwgQ29tZXRcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBSb3NlJzogJzVBRDknLCAvLyBDbG9uZSBsaW5lIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFDMScsIC8vIEJsdWUgcmluIGcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQzInLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQzMnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUM0JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQzUnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFDNicsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEFjdCBPZiBNZXJjeSc6ICc1QUNGJywgLy8gY3Jvc3Mtc2hhcGVkIGxpbmUgYW9lc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAxJzogJzU3NzAnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzInLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc2RicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzEnLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUnOiAnNTc3NCcsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc2QycsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhlYWQgRG93bic6ICc1NzY4JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzY5JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmFsbGluZyBSb2NrJzogJzU3NkUnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBIb3QgQ2hhcmdlJzogJzU3NzMnLCAvLyBkb3VibGUgY2hhcmdlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNTc5RScsIC8vIGJvbWJzIGJlaW5nIGNsZWFyZWRcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIFZpY2lvdXMgU3dpcGUnOiAnNTc5NycsIC8vIGNpcmN1bGFyIGFvZSBhcm91bmQgYm9zc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMSc6ICc1NzhGJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZvY3VzZWQgVHJlbW9yIDInOiAnNTc5MScsIC8vIHNxdWFyZSBmbG9vciBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBEZXZvdXInOiAnNTc4OScsIC8vIGNvbmFsIGFvZSBhZnRlciB3aXRoZXJpbmcgY3Vyc2VcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZsYWlsaW5nIFN0cmlrZSAxJzogJzU3OEMnLCAvLyBpbml0aWFsIHJvdGF0aW5nIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDInOiAnNTc4RCcsIC8vIHJvdGF0aW5nIGNsZWF2ZXNcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNTgxOScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNTgxQScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTgxNicsIC8vIE9wdGltYWwgUGxheSBTd29yZCBcImdldCBvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTgxNycsIC8vIE9wdGltYWwgcGxheSBzaGllbGQgXCJnZXQgaW5cIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBDbGVhdmUnOiAnNTgxOCcsIC8vIE9wdGltYWwgUGxheSBjbGVhdmVzIGZvciBzd29yZC9zaGllbGRcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBVbmx1Y2t5IExvdCc6ICc1ODFEJywgLy8gUXVlZW4ncyBLbmlnaHQgb3JiIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIEJ1cm4gMSc6ICc1ODNEJywgLy8gc21hbGwgZmlyZSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAyJzogJzU4M0UnLCAvLyBsYXJnZSBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBQYXduIE9mZic6ICc1ODNBJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzU4NDcnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzU4NDgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzU4NDknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQ291bnRlcnBsYXknOiAnNThGNScsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QjgnLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0I5JywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDEnOiAnNTdCNCcsIC8vIEluaXRpYWwgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDInOiAnNTdCNScsIC8vIExhdGVyIHBoYW50b20gbGluZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMSc6ICc1N0I2JywgLy8gSW5pdGlhbCBwaGFudG9tIGNpcmNsZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMic6ICc1N0I3JywgLy8gTW92aW5nIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gVmlsZSBXYXZlJzogJzU3QkYnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTRDJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk0QicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NEEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTM5JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTREJywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFdoYWNrJzogJzU3RDAnLCAvLyBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMSc6ICc1N0M1JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBEZXZhc3RhdGluZyBCb2x0IDInOiAnNTdDNicsIC8vIGxpZ2h0bmluZyByaW5nc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRWxlY3Ryb2N1dGlvbic6ICc1N0NDJywgLy8gcmFuZG9tIGNpcmNsZSBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBSYXBpZCBCb2x0cyc6ICc1N0MzJywgLy8gZHJvcHBlZCBsaWdodG5pbmcgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgMTExMS1Ub256ZSBTd2luZyc6ICc1N0Q4JywgLy8gdmVyeSBsYXJnZSBcImdldCBvdXRcIiBzd2luZ1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgTW9uayBBdHRhY2snOiAnNTVBNicsIC8vIE1vbmsgYWRkIGF1dG8tYXR0YWNrXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlGNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlFNycsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5RUEnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDEnOiAnNTlFOCcsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIEVuZCAyJzogJzU5RTknLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgT2ZmZW5zaXZlIFN3b3JkJzogJzVBMDInLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU2hpZWxkJzogJzVBMDMnLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCAxJzogJzU5RjInLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDInOiAnNUI4NScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDEnOiAnNTlGMScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCAyJzogJzVCODQnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUGF3biBPZmYnOiAnNUExRCcsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUZGJywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1QTAwJywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1QTAxJywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMSc6ICc1QTI4JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMic6ICc1QTJBJywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMlxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMyc6ICc1QTI5JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIHNlY29uZCBsaW5lc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBIZWF0IFNob2NrJzogJzU5MjcnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTI4JywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlFQicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBHdW5uaGlsZHJcXCdzIEJsYWRlcyc6ICc1QjIyJywgLy8gbm90IGJlaW5nIGluIHRoZSBjaGVzcyBibHVlIHNhZmUgc3F1YXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVW5sdWNreSBMb3QnOiAnNTVCNicsIC8vIGxpZ2h0bmluZyBvcmIgYXR0YWNrXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgUGhhbnRvbSBCYWxlZnVsIE9uc2xhdWdodCc6ICc1QUQ2JywgLy8gc29sbyB0YW5rIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRm9lIFNwbGl0dGVyJzogJzU3RDcnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIE1vb24nOiAnMjYyJywgLy8gXCJQZXRyaWZpY2F0aW9uXCIgZnJvbSBBZXRoZXJpYWwgT3JiIGxvb2thd2F5XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSBhbmQgXCJoaXRcIiBwZW9wbGUgd2hlbiBsZXZpdGF0aW5nLlxyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IEd1YXJkIExvdHMgQ2FzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNTgyNycsICc1ODI4JywgJzVCNkMnLCAnNUI2RCcsICc1QkI2JywgJzVCQjcnLCAnNUI4OCcsICc1Qjg5J10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnNsaWNlKC0yKSA9PT0gJzAzJyxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR29sZW0gQ29tcGFjdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU3NDYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBmdWxsVGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IFNsaW1lIFNhbmd1aW5lIEZ1c2lvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU1NEQnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBmdWxsVGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVJlc3VycmVjdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTFOIEVkZW5cXCdzIFRodW5kZXIgSUlJJzogJzQ0RUQnLFxyXG4gICAgJ0UxTiBFZGVuXFwncyBCbGl6emFyZCBJSUknOiAnNDRFQycsXHJcbiAgICAnRTFOIFB1cmUgQmVhbSc6ICczRDlFJyxcclxuICAgICdFMU4gUGFyYWRpc2UgTG9zdCc6ICczREEwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMU4gRWRlblxcJ3MgRmxhcmUnOiAnM0Q5NycsXHJcbiAgICAnRTFOIFB1cmUgTGlnaHQnOiAnM0RBMycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMU4gRmlyZSBJSUknOiAnNDRFQicsXHJcbiAgICAnRTFOIFZpY2UgT2YgVmFuaXR5JzogJzQ0RTcnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxTiBWaWNlIE9mIEFwYXRoeSc6ICc0NEU4JywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGZhaWxpbmcgdG8gaW50ZXJydXB0IE1hbmEgQm9vc3QgKDNEOEQpXHJcbi8vIFRPRE86IGZhaWxpbmcgdG8gcGFzcyBoZWFsZXIgZGVidWZmP1xyXG4vLyBUT0RPOiB3aGF0IGhhcHBlbnMgaWYgeW91IGRvbid0IGtpbGwgYSBtZXRlb3IgZHVyaW5nIGZvdXIgb3Jicz9cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVJlc3VycmVjdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTFTIEVkZW5cXCdzIFRodW5kZXIgSUlJJzogJzQ0RjcnLFxyXG4gICAgJ0UxUyBFZGVuXFwncyBCbGl6emFyZCBJSUknOiAnNDRGNicsXHJcbiAgICAnRTFTIEVkZW5cXCdzIFJlZ2FpbmVkIEJsaXp6YXJkIElJSSc6ICc0NEZBJyxcclxuICAgICdFMVMgUHVyZSBCZWFtIFRyaWRlbnQgMSc6ICczRDgzJyxcclxuICAgICdFMVMgUHVyZSBCZWFtIFRyaWRlbnQgMic6ICczRDg0JyxcclxuICAgICdFMVMgUGFyYWRpc2UgTG9zdCc6ICczRDg3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMVMgRWRlblxcJ3MgRmxhcmUnOiAnM0Q3MycsXHJcbiAgICAnRTFTIFB1cmUgTGlnaHQnOiAnM0Q4QScsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMVMgRmlyZS9UaHVuZGVyIElJSSc6ICc0NEZCJyxcclxuICAgICdFMVMgUHVyZSBCZWFtIFNpbmdsZSc6ICczRDgxJyxcclxuICAgICdFMVMgVmljZSBPZiBWYW5pdHknOiAnNDRGMScsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFTIFZpY2Ugb2YgQXBhdGh5JzogJzQ0RjInLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogc2hhZG93ZXllIGZhaWx1cmUgKHRvcCBsaW5lIGZhaWwsIGJvdHRvbSBsaW5lIHN1Y2Nlc3MsIGVmZmVjdCB0aGVyZSB0b28pXHJcbi8vIFsxNjoxNzozNS45NjZdIDE2OjQwMDExMEZFOlZvaWR3YWxrZXI6NDBCNzpTaGFkb3dleWU6MTA2MTIzNDU6VGluaSBQb3V0aW5pOkY6MTAwMDA6MTAwMTkwRjpcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDY3ODkwQTpQb3RhdG8gQ2hpcHB5OjE6MDoxQzo4MDAwOlxyXG4vLyBnYWlucyB0aGUgZWZmZWN0IG9mIFBldHJpZmljYXRpb24gZnJvbSBWb2lkd2Fsa2VyIGZvciAxMC4wMCBTZWNvbmRzLlxyXG4vLyBUT0RPOiBwdWRkbGUgZmFpbHVyZT9cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZURlc2NlbnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UyTiBEb29tdm9pZCBTbGljZXInOiAnM0UzQycsXHJcbiAgICAnRTJOIERvb212b2lkIEd1aWxsb3RpbmUnOiAnM0UzQicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyTiBOeXgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0UzRCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZVxyXG4vLyBUT0RPOiBFbXB0eSBIYXRlICgzRTU5LzNFNUEpIGhpdHMgZXZlcnlib2R5LCBzbyBoYXJkIHRvIHRlbGwgYWJvdXQga25vY2tiYWNrXHJcbi8vIFRPRE86IG1heWJlIG1hcmsgaGVsbCB3aW5kIHBlb3BsZSB3aG8gZ290IGNsaXBwZWQgYnkgc3RhY2s/XHJcbi8vIFRPRE86IG1pc3NpbmcgcHVkZGxlcz9cclxuLy8gVE9ETzogbWlzc2luZyBsaWdodC9kYXJrIGNpcmNsZSBzdGFja1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIFNsaWNlcic6ICczRTUwJyxcclxuICAgICdFM1MgRW1wdHkgUmFnZSc6ICczRTZDJyxcclxuICAgICdFM1MgRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UyUyBEb29tdm9pZCBDbGVhdmVyJzogJzNFNjQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgU2hhZG93ZXllJyxcclxuICAgICAgLy8gU3RvbmUgQ3Vyc2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU4OScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTJTIE55eCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICczRTUxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVJbnVuZGF0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFM04gTW9uc3RlciBXYXZlIDEnOiAnM0ZDQScsXHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAyJzogJzNGRTknLFxyXG4gICAgJ0UzTiBNYWVsc3Ryb20nOiAnM0ZEOScsXHJcbiAgICAnRTNOIFN3aXJsaW5nIFRzdW5hbWknOiAnM0ZENScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTNOIFRlbXBvcmFyeSBDdXJyZW50IDEnOiAnM0ZDRScsXHJcbiAgICAnRTNOIFRlbXBvcmFyeSBDdXJyZW50IDInOiAnM0ZDRCcsXHJcbiAgICAnRTNOIFNwaW5uaW5nIERpdmUnOiAnM0ZEQicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFM04gUmlwIEN1cnJlbnQnOiAnM0ZDNycsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBTY291cmluZyBUc3VuYW1pICgzQ0UwKSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhcmdldFxyXG4vLyBUT0RPOiBTd2VlcGluZyBUc3VuYW1pICgzRkY1KSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhbmtzXHJcbi8vIFRPRE86IFJpcCBDdXJyZW50ICgzRkUwLCAzRkUxKSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhcmdldC90YW5rc1xyXG4vLyBUT0RPOiBCb2lsZWQgQWxpdmUgKDQwMDYpIGlzIGZhaWxpbmcgcHVkZGxlcz8/P1xyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGNsZWFuc2UgU3BsYXNoaW5nIFdhdGVyc1xyXG4vLyBUT0RPOiBkb2VzIGdldHRpbmcgaGl0IGJ5IHVuZGVyc2VhIHF1YWtlIGNhdXNlIGFuIGFiaWxpdHk/XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVJbnVuZGF0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFM1MgTW9uc3RlciBXYXZlIDEnOiAnM0ZFNScsXHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAyJzogJzNGRTknLFxyXG4gICAgJ0UzUyBNYWVsc3Ryb20nOiAnM0ZGQicsXHJcbiAgICAnRTNTIFN3aXJsaW5nIFRzdW5hbWknOiAnM0ZGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDEnOiAnM0ZFQScsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDInOiAnM0ZFQicsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDMnOiAnM0ZFQycsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDQnOiAnM0ZFRCcsXHJcbiAgICAnRTNTIFNwaW5uaW5nIERpdmUnOiAnM0ZGRCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNE4gV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQwRUInLFxyXG4gICAgJ0U0TiBFdmlsIEVhcnRoJzogJzQwRUYnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDEnOiAnNDFCNCcsXHJcbiAgICAnRTROIEFmdGVyc2hvY2sgMic6ICc0MEYwJyxcclxuICAgICdFNE4gRXhwbG9zaW9uIDEnOiAnNDBFRCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAyJzogJzQwRjUnLFxyXG4gICAgJ0U0TiBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTROIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDEwMCcsXHJcbiAgICAnRTROIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MEZGJyxcclxuICAgICdFNE4gTWFzc2l2ZSBMYW5kc2xpZGUnOiAnNDBGQycsXHJcbiAgICAnRTROIFNlaXNtaWMgV2F2ZSc6ICc0MEYzJyxcclxuICAgICdFNE4gRmF1bHQgTGluZSc6ICc0MTAxJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIHBlb3BsZSBnZXQgaGl0dGluZyBieSBtYXJrZXJzIHRoZXkgc2hvdWxkbid0XHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YW5rcyBnZXR0aW5nIGhpdCBieSB0YW5rYnVzdGVycywgbWVnYWxpdGhzXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YXJnZXQgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlclxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNFMgV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQxMDgnLFxyXG4gICAgJ0U0UyBFdmlsIEVhcnRoJzogJzQxMEMnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDEnOiAnNDFCNScsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMic6ICc0MTBEJyxcclxuICAgICdFNFMgRXhwbG9zaW9uJzogJzQxMEEnLFxyXG4gICAgJ0U0UyBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTRTIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDExRCcsXHJcbiAgICAnRTRTIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MTFDJyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMSc6ICc0MTE4JyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMic6ICc0MTE5JyxcclxuICAgICdFNFMgU2Vpc21pYyBXYXZlJzogJzQxMTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMSc6ICc0MTM1JyxcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDInOiAnNDY4NycsXHJcbiAgICAnRTRTIFBsYXRlIEZyYWN0dXJlJzogJzQzRUEnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMSc6ICc0M0NBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDInOiAnNDNDOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+OCv+OCpOOCv+ODsycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfms7DlnaYnIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn7YOA7J207YOEJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZhdWx0TGluZVRhcmdldCA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0MTFFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5mYXVsdExpbmVUYXJnZXQgIT09IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdSdW4gT3ZlcicsXHJcbiAgICAgICAgICAgIGRlOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSDDqWNyYXPDqShlKScsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VGdWxtaW5hdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTVOIEltcGFjdCc6ICc0RTNBJywgLy8gU3RyYXRvc3BlYXIgbGFuZGluZyBBb0VcclxuICAgICdFNU4gTGlnaHRuaW5nIEJvbHQnOiAnNEI5QycsIC8vIFN0b3JtY2xvdWQgc3RhbmRhcmQgYXR0YWNrXHJcbiAgICAnRTVOIEdhbGxvcCc6ICc0Qjk3JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1TiBTaG9jayBTdHJpa2UnOiAnNEJBMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNU4gVm9sdCBTdHJpa2UnOiAnNENGMicsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNU4gSnVkZ21lbnQgSm9sdCc6ICc0QjhGJywgLy8gU3RyYXRvc3BlYXIgZXhwbG9zaW9uc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gYSBwbGF5ZXIgZ2V0cyA0KyBzdGFja3Mgb2Ygb3Jicy4gRG9uJ3QgYmUgZ3JlZWR5IVxyXG4gICAgICBpZDogJ0U1TiBTdGF0aWMgQ29uZGVuc2F0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEhlbHBlciBmb3Igb3JiIHBpY2t1cCBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0U1TiBPcmIgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIE9yYiBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEI5QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobm8gb3JiKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChrZWluIE9yYilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAocGFzIGQnb3JiZSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu3546J54Sh44GXKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmsqHlkIPnkIMpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgVGFyZ2V0IFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPSBkYXRhLmNsb3VkTWFya2VycyB8fCBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNU4gVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgbSBvZiBkYXRhLmNsb3VkTWFya2Vycykge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogZGF0YS5jbG91ZE1hcmtlcnNbbV0sXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoY2xvdWRzIHRvbyBjbG9zZSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChXb2xrZW4genUgbmFoZSlgLFxyXG4gICAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChudWFnZXMgdHJvcCBwcm9jaGVzKWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbsui/keOBmeOBjilgLFxyXG4gICAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fkupHph43lj6ApYCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBjbGVhbnVwJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5jbG91ZE1hcmtlcnM7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogaXMgdGhlcmUgYSBkaWZmZXJlbnQgYWJpbGl0eSBpZiB0aGUgc2hpZWxkIGR1dHkgYWN0aW9uIGlzbid0IHVzZWQgcHJvcGVybHk/XHJcbi8vIFRPRE86IGlzIHRoZXJlIGFuIGFiaWxpdHkgZnJvbSBSYWlkZW4gKHRoZSBiaXJkKSBpZiB5b3UgZ2V0IGVhdGVuP1xyXG4vLyBUT0RPOiBtYXliZSBjaGFpbiBsaWdodG5pbmcgd2FybmluZyBpZiB5b3UgZ2V0IGhpdCB3aGlsZSB5b3UgaGF2ZSBzeXN0ZW0gc2hvY2sgKDhCOClcclxuXHJcbmNvbnN0IG5vT3JiID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gb3JiKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBPcmIpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZFxcJ29yYmUpJyxcclxuICAgIGphOiBzdHIgKyAnICjpm7fnjonnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHlkIPnkIMpJyxcclxuICAgIGtvOiBzdHIgKyAnICjqtazsiqwg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1UyBJbXBhY3QnOiAnNEUzQicsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVTIEdhbGxvcCc6ICc0QkI0JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1UyBTaG9jayBTdHJpa2UnOiAnNEJDMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgVHdpc3Rlcic6ICc0QkM3JywgLy8gVHdpc3RlciBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBEb251dCc6ICc0QkM4JywgLy8gRG9udXQgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU2hvY2snOiAnNEUzRCcsIC8vIEhhdGVkIG9mIExldmluIFN0b3JtY2xvdWQtY2xlYW5zYWJsZSBleHBsb2RpbmcgZGVidWZmXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVTIEp1ZGdtZW50IEpvbHQnOiAnNEJBNycsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U1UyBWb2x0IFN0cmlrZSBEb3VibGUnOiAnNEJDMycsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgQ3JpcHBsaW5nIEJsb3cnOiAnNEJDQScsXHJcbiAgICAnRTVTIENoYWluIExpZ2h0bmluZyBEb3VibGUnOiAnNEJDNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNVMgT3JiIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBWb2x0IFN0cmlrZSBPcmInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJDMycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vT3JiKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIERlYWRseSBEaXNjaGFyZ2UgQmlnIEtub2NrYmFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkIyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgTGlnaHRuaW5nIEJvbHQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCOScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBIYXZpbmcgYSBub24taWRlbXBvdGVudCBjb25kaXRpb24gZnVuY3Rpb24gaXMgYSBiaXQgPF88XHJcbiAgICAgICAgLy8gT25seSBjb25zaWRlciBsaWdodG5pbmcgYm9sdCBkYW1hZ2UgaWYgeW91IGhhdmUgYSBkZWJ1ZmYgdG8gY2xlYXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLmhhdGVkIHx8ICFkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgSGF0ZWQgb2YgTGV2aW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMEQyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID0gZGF0YS5oYXRlZCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzID0gZGF0YS5jbG91ZE1hcmtlcnMgfHwgW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVTIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkJBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDMwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IG0gb2YgZGF0YS5jbG91ZE1hcmtlcnMpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgICAgYmxhbWU6IGRhdGEuY2xvdWRNYXJrZXJzW21dLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICAvLyBTdG9ybWNsb3VkcyByZXNvbHZlIHdlbGwgYmVmb3JlIHRoaXMuXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U2TiBUaG9ybnMnOiAnNEJEQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZOIEZlcm9zdG9ybSAxJzogJzRCREQnLFxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMic6ICc0QkU1JyxcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAxJzogJzRCRTAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAyJzogJzRCRTYnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZOIEV4cGxvc2lvbic6ICc0QkUyJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZOIEhlYXQgQnVyc3QnOiAnNEJFQycsXHJcbiAgICAnRTZOIENvbmZsYWcgU3RyaWtlJzogJzRCRUUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZOIFNwaWtlIE9mIEZsYW1lJzogJzRCRjAnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuICAgICdFNk4gUmFkaWFudCBQbHVtZSc6ICc0QkYyJyxcclxuICAgICdFNk4gRXJ1cHRpb24nOiAnNEJGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZOIFZhY3V1bSBTbGljZSc6ICc0QkQ1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2TiBEb3duYnVyc3QnOiAnNEJEQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZS4gQWN0dWFsIGtub2NrYmFjayBpcyB1bmtub3duIGFiaWxpdHkgNEMyMFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBLaWxscyBub24tdGFua3Mgd2hvIGdldCBoaXQgYnkgaXQuXHJcbiAgICAnRTZOIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRCRUQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogY2hlY2sgdGV0aGVycyBiZWluZyBjdXQgKHdoZW4gdGhleSBzaG91bGRuJ3QpXHJcbi8vIFRPRE86IGNoZWNrIGZvciBjb25jdXNzZWQgZGVidWZmXHJcbi8vIFRPRE86IGNoZWNrIGZvciB0YWtpbmcgdGFua2J1c3RlciB3aXRoIGxpZ2h0aGVhZGVkXHJcbi8vIFRPRE86IGNoZWNrIGZvciBvbmUgcGVyc29uIHRha2luZyBtdWx0aXBsZSBTdG9ybSBPZiBGdXJ5IFRldGhlcnMgKDRDMDEvNEMwOClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3JTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gSXQncyBjb21tb24gdG8ganVzdCBpZ25vcmUgZnV0Ym9sIG1lY2hhbmljcywgc28gZG9uJ3Qgd2FybiBvbiBTdHJpa2UgU3BhcmsuXHJcbiAgICAvLyAnU3Bpa2UgT2YgRmxhbWUnOiAnNEMxMycsIC8vIE9yYiBleHBsb3Npb25zIGFmdGVyIFN0cmlrZSBTcGFya1xyXG5cclxuICAgICdFNlMgVGhvcm5zJzogJzRCRkEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2UyBGZXJvc3Rvcm0gMSc6ICc0QkZEJyxcclxuICAgICdFNlMgRmVyb3N0b3JtIDInOiAnNEMwNicsXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QzAwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMic6ICc0QzA3JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2UyBFeHBsb3Npb24nOiAnNEMwMycsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2UyBIZWF0IEJ1cnN0JzogJzRDMUYnLFxyXG4gICAgJ0U2UyBDb25mbGFnIFN0cmlrZSc6ICc0QzEwJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2UyBSYWRpYW50IFBsdW1lJzogJzRDMTUnLFxyXG4gICAgJ0U2UyBFcnVwdGlvbic6ICc0QzE3JyxcclxuICAgICdFNlMgV2luZCBDdXR0ZXInOiAnNEMwMicsIC8vIFRldGhlci1jdXR0aW5nIGxpbmUgYW9lXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZTIFZhY3V1bSBTbGljZSc6ICc0QkY1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMSc6ICc0QkZCJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChHYXJ1ZGEpLlxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMic6ICc0QkZDJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChSYWt0YXBha3NhKS5cclxuICAgICdFNlMgTWV0ZW9yIFN0cmlrZSc6ICc0QzBGJywgLy8gRnJvbnRhbCBhdm9pZGFibGUgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U2UyBIYW5kcyBvZiBIZWxsJzogJzRDMFtCQ10nLCAvLyBUZXRoZXIgY2hhcmdlXHJcbiAgICAnRTZTIEhhbmRzIG9mIEZsYW1lJzogJzRDMEEnLCAvLyBGaXJzdCBUYW5rYnVzdGVyXHJcbiAgICAnRTZTIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRDMEUnLCAvLyBTZWNvbmQgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBCbGF6ZSc6ICc0QzFCJywgLy8gRmxhbWUgVG9ybmFkbyBDbGVhdmVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTZTIEFpciBCdW1wJzogJzRCRjknLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEMzRScsICc0QzQwJywgJzRDMjInLCAnNEMzQycsICc0RTYzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzVW1icmFsIHx8ICFkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0QnLCAnNEMyMycsICc0QzQxJywgJzRDNDMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzVW1icmFsICYmIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIC8vIFRoaXMgY2FzZSBpcyBwcm9iYWJseSBpbXBvc3NpYmxlLCBhcyB0aGUgZGVidWZmIHRpY2tzIGFmdGVyIGRlYXRoLFxyXG4gICAgICAgIC8vIGJ1dCBsZWF2aW5nIGl0IGhlcmUgaW4gY2FzZSB0aGVyZSdzIHNvbWUgcmV6IG9yIGRpc2Nvbm5lY3QgdGltaW5nXHJcbiAgICAgICAgLy8gdGhhdCBjb3VsZCBsZWFkIHRvIHRoaXMuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBhbiBvcmIgZHVyaW5nIHRvcm5hZG8gcGhhc2VcclxuLy8gVE9ETzoganVtcGluZyBpbiB0aGUgdG9ybmFkbyBkYW1hZ2U/P1xyXG4vLyBUT0RPOiB0YWtpbmcgc3VuZ3JhY2UoNEM4MCkgb3IgbW9vbmdyYWNlKDRDODIpIHdpdGggd3JvbmcgZGVidWZmXHJcbi8vIFRPRE86IHN0eWdpYW4gc3BlYXIvc2lsdmVyIHNwZWFyIHdpdGggdGhlIHdyb25nIGRlYnVmZlxyXG4vLyBUT0RPOiB0YWtpbmcgZXhwbG9zaW9uIGZyb20gdGhlIHdyb25nIENoaWFyby9TY3VybyBvcmJcclxuLy8gVE9ETzogaGFuZGxlIDRDODkgU2lsdmVyIFN0YWtlIHRhbmtidXN0ZXIgMm5kIGhpdCwgYXMgaXQncyBvayB0byBoYXZlIHR3byBpbi5cclxuXHJcbmNvbnN0IHdyb25nQnVmZiA9IChzdHIpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkZSBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo44OQ44OV54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5pyJQnVmZiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDsl4bsnYwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VJY29ub2NsYXNtU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFN1MgU2lsdmVyIFN3b3JkJzogJzRDOEUnLCAvLyBncm91bmQgYW9lXHJcbiAgICAnRTdTIE92ZXJ3aGVsbWluZyBGb3JjZSc6ICc0QzczJywgLy8gYWRkIHBoYXNlIGdyb3VuZCBhb2VcclxuICAgICdFN1MgU3RyZW5ndGggaW4gTnVtYmVycyAxJzogJzRDNzAnLCAvLyBhZGQgZ2V0IHVuZGVyXHJcbiAgICAnRTdTIFN0cmVuZ3RoIGluIE51bWJlcnMgMic6ICc0QzcxJywgLy8gYWRkIGdldCBvdXRcclxuICAgICdFN1MgUGFwZXIgQ3V0JzogJzRDN0QnLCAvLyB0b3JuYWRvIGdyb3VuZCBhb2VzXHJcbiAgICAnRTdTIEJ1ZmZldCc6ICc0Qzc3JywgLy8gdG9ybmFkbyBncm91bmQgYW9lcyBhbHNvPz9cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFN1MgQmV0d2l4dCBXb3JsZHMnOiAnNEM2QicsIC8vIHB1cnBsZSBncm91bmQgbGluZSBhb2VzXHJcbiAgICAnRTdTIENydXNhZGUnOiAnNEM1OCcsIC8vIGJsdWUga25vY2tiYWNrIGNpcmNsZSAoc3RhbmRpbmcgaW4gaXQpXHJcbiAgICAnRTdTIEV4cGxvc2lvbic6ICc0QzZGJywgLy8gZGlkbid0IGtpbGwgYW4gYWRkXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFN1MgU3R5Z2lhbiBTdGFrZSc6ICc0QzM0JywgLy8gTGFzZXIgdGFuayBidXN0ZXIgMVxyXG4gICAgJ0U3UyBTaWx2ZXIgU2hvdCc6ICc0QzkyJywgLy8gU3ByZWFkIG1hcmtlcnNcclxuICAgICdFN1MgU2lsdmVyIFNjb3VyZ2UnOiAnNEM5MycsIC8vIEljZSBtYXJrZXJzXHJcbiAgICAnRTdTIENoaWFybyBTY3VybyBFeHBsb3Npb24gMSc6ICc0RDE0JywgLy8gb3JiIGV4cGxvc2lvblxyXG4gICAgJ0U3UyBDaGlhcm8gU2N1cm8gRXhwbG9zaW9uIDInOiAnNEQxNScsIC8vIG9yYiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEludGVycnVwdFxyXG4gICAgICBpZDogJ0U3UyBBZHZlbnQgT2YgTGlnaHQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QzZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgYmxhbWUgY29ycmVjdD8gZG9lcyB0aGlzIGhhdmUgYSB0YXJnZXQ/XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBMaWdodFxcJ3MgQ291cnNlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzYyJywgJzRDNjMnLCAnNEM2NCcsICc0QzVCJywgJzRDNUYnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzQXN0cmFsICYmIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgRGFya3NcXCdzIENvdXJzZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2NScsICc0QzY2JywgJzRDNjcnLCAnNEM1QScsICc0QzYwJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQ3J1c2FkZSBLbm9ja2JhY2snLFxyXG4gICAgICAvLyA0Qzc2IGlzIHRoZSBrbm9ja2JhY2sgZGFtYWdlLCA0QzU4IGlzIHRoZSBkYW1hZ2UgZm9yIHN0YW5kaW5nIG9uIHRoZSBwdWNrLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEM3NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4TiBCaXRpbmcgRnJvc3QnOiAnNEREQicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIERyaXZpbmcgRnJvc3QnOiAnNEREQycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIEZyaWdpZCBTdG9uZSc6ICc0RTY2JywgLy8gU21hbGwgc3ByZWFkIGNpcmNsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzRFMDAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0RTAxJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIEZyaWdpZCBFcnVwdGlvbic6ICc0RTA5JywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEljaWNsZSBJbXBhY3QnOiAnNEUwQScsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBBeGUgS2ljayc6ICc0REUyJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOE4gU2N5dGhlIEtpY2snOiAnNERFMycsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOE4gUmVmbGVjdGVkIEJpdGluZyBGcm9zdCc6ICc0REZFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCc6ICc0REZGJywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBIZWF2ZW5seSBTdHJpa2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEREOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc3Rvw59lbiEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBGcm9zdCBBcm1vcicsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAncnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgICAga286ICfrr7jrgYTrn6zsp5AhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHJ1c2ggaGl0dGluZyB0aGUgY3J5c3RhbFxyXG4vLyBUT0RPOiBhZGRzIG5vdCBiZWluZyBraWxsZWRcclxuLy8gVE9ETzogdGFraW5nIHRoZSBydXNoIHR3aWNlICh3aGVuIHlvdSBoYXZlIGRlYnVmZilcclxuLy8gVE9ETzogbm90IGhpdHRpbmcgdGhlIGRyYWdvbiBmb3VyIHRpbWVzIGR1cmluZyB3eXJtJ3MgbGFtZW50XHJcbi8vIFRPRE86IGRlYXRoIHJlYXNvbnMgZm9yIG5vdCBwaWNraW5nIHVwIHB1ZGRsZVxyXG4vLyBUT0RPOiBub3QgYmVpbmcgaW4gdGhlIHRvd2VyIHdoZW4geW91IHNob3VsZFxyXG4vLyBUT0RPOiBwaWNraW5nIHVwIHRvbyBtYW55IHN0YWNrc1xyXG5cclxuLy8gTm90ZTogQmFuaXNoIElJSSAoNERBOCkgYW5kIEJhbmlzaCBJaWkgRGl2aWRlZCAoNERBOSkgYm90aCBhcmUgdHlwZT0weDE2IGxpbmVzLlxyXG4vLyBUaGUgc2FtZSBpcyB0cnVlIGZvciBCYW5pc2ggKDREQTYpIGFuZCBCYW5pc2ggRGl2aWRlZCAoNERBNykuXHJcbi8vIEknbSBub3Qgc3VyZSB0aGlzIG1ha2VzIGFueSBzZW5zZT8gQnV0IGNhbid0IHRlbGwgaWYgdGhlIHNwcmVhZCB3YXMgYSBtaXN0YWtlIG9yIG5vdC5cclxuLy8gTWF5YmUgd2UgY291bGQgY2hlY2sgZm9yIFwiTWFnaWMgVnVsbmVyYWJpbGl0eSBVcFwiP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VSZWZ1bGdlbmNlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOFMgQml0aW5nIEZyb3N0JzogJzRENjYnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBEcml2aW5nIEZyb3N0JzogJzRENjcnLCAvLyBSZWFyIGNvbmUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBBeGUgS2ljayc6ICc0RDZEJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOFMgU2N5dGhlIEtpY2snOiAnNEQ2RScsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOFMgUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzREQjknLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0REJBJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIEZyaWdpZCBFcnVwdGlvbic6ICc0RDlGJywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThTIEZyaWdpZCBOZWVkbGUnOiAnNEQ5RCcsIC8vIDgtd2F5IFwiZmxvd2VyXCIgZXhwbG9zaW9uXHJcbiAgICAnRThTIEljaWNsZSBJbXBhY3QnOiAnNERBMCcsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0IDEnOiAnNERCNycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAyJzogJzREQzMnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0IDEnOiAnNERCOCcsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0IDInOiAnNERDNCcsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcblxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAxJzogJzRENzUnLCAvLyBMZWZ0IGNsZWF2ZVxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAyJzogJzRENzYnLCAvLyBSaWdodCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMyc6ICc0RDc3JywgLy8gS25vY2tiYWNrIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAxJzogJzREOTAnLCAvLyBSZWZsZWN0ZWQgbGVmdCAyXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAyJzogJzREQkInLCAvLyBSZWZsZWN0ZWQgbGVmdCAxXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAzJzogJzREQzcnLCAvLyBSZWZsZWN0ZWQgcmlnaHQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgNCc6ICc0RDkxJywgLy8gUmVmbGVjdGVkIHJpZ2h0IDFcclxuICAgICdFOFMgVHdpbiBTdGlsbG5lc3MgMSc6ICc0RDY4JyxcclxuICAgICdFOFMgVHdpbiBTdGlsbG5lc3MgMic6ICc0RDZCJyxcclxuICAgICdFOFMgVHdpbiBTaWxlbmNlIDEnOiAnNEQ2OScsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAyJzogJzRENkEnLFxyXG4gICAgJ0U4UyBBa2ggUmhhaSc6ICc0RDk5JyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAxJzogJzRENzAnLFxyXG4gICAgJ0U4UyBFbWJpdHRlcmVkIERhbmNlIDInOiAnNEQ3MScsXHJcbiAgICAnRThTIFNwaXRlZnVsIERhbmNlIDEnOiAnNEQ2RicsXHJcbiAgICAnRThTIFNwaXRlZnVsIERhbmNlIDInOiAnNEQ3MicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyBCcm9rZW4gdGV0aGVyLlxyXG4gICAgJ0U4UyBSZWZ1bGdlbnQgRmF0ZSc6ICc0REE0JyxcclxuICAgIC8vIFNoYXJlZCBvcmIsIGNvcnJlY3QgaXMgQnJpZ2h0IFB1bHNlICg0RDk1KVxyXG4gICAgJ0U4UyBCbGluZGluZyBQdWxzZSc6ICc0RDk2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0U4UyBQYXRoIG9mIExpZ2h0JzogJzREQTEnLCAvLyBQcm90ZWFuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U4UyBTaGluaW5nIEFybW9yJyxcclxuICAgICAgLy8gU3R1blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFOFMgU3RvbmVza2luJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEQ4NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzUyMjMnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTIyNCcsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QUZGJywgLy8gZnJvbnRhbCBjbGVhdmUgdHV0b3JpYWwgbWVjaGFuaWNcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQaGFzZXInOiAnNTVFMScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlOIEJhZCBWaWJyYXRpb25zJzogJzU1RTYnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOU4gRWFydGgtU2hhdHRlcmluZyBQYXJ0aWNsZSBCZWFtJzogJzUyMjUnLCAvLyBtaXNzaW5nIHRvd2Vycz9cclxuICAgICdFOU4gQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1NURDJywgLy8gXCJnZXQgb3V0XCIgZHVyaW5nIHBhbmVsc1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAyJzogJzU1REInLCAvLyBDbG9uZSBsaW5lIGFvZXMgdy8gQW50aS1BaXIgUGFydGljbGUgQmVhbVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5TiBXaXRoZHJhdyc6ICc1NTM0JywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOU4gQWV0aGVyb3N5bnRoZXNpcyc6ICc1NTM1JywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDEnOiAnNTVFQicsIC8vIHRhbmsgbGFzZXIgd2l0aCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IDU2MUQgRXZpbCBTZWVkIGhpdHMgZXZlcnlvbmUsIGhhcmQgdG8ga25vdyBpZiB0aGVyZSdzIGEgZG91YmxlIHRhcFxyXG4vLyBUT0RPOiBmYWxsaW5nIHRocm91Z2ggcGFuZWwganVzdCBkb2VzIGRhbWFnZSB3aXRoIG5vIGFiaWxpdHkgbmFtZSwgbGlrZSBhIGRlYXRoIHdhbGxcclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBqdW1wIGluIHNlZWQgdGhvcm5zP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOVMgQmFkIFZpYnJhdGlvbnMnOiAnNTYxQycsIC8vIHRldGhlcmVkIG91dHNpZGUgZ2lhbnQgdHJlZSBncm91bmQgYW9lc1xyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUIwMCcsIC8vIGFudGktYWlyIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBoYXNlciBVbmxpbWl0ZWQnOiAnNTYwRScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlTIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNUIwMScsIC8vIHdpZGUtYW5nbGUgXCJvdXRcIlxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDEnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDInLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNUE5NScsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgMic6ICc1QTk2JywgLy8gYm9zcyBsZWZ0LXJpZ2h0IHN1bW1vbi9wYW5lbCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAxJzogJzU2MUUnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAyJzogJzU2MUYnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDMnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBUaGUgVGhpcmQgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTYwNCcsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBpbml0aWFsXHJcbiAgICAnRTlTIEFydCBPZiBEYXJrbmVzcyc6ICc1NjA2JywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGZpbmFsXHJcbiAgICAnRTlTIEZ1bGwtUGVyaW1pdGVyIFBhcnRpY2xlIEJlYW0nOiAnNTYyOScsIC8vIHBhbmVsIFwiZ2V0IGluXCJcclxuICAgICdFOVMgRGFyayBDaGFpbnMnOiAnNUZBQycsIC8vIFNsb3cgdG8gYnJlYWsgcGFydG5lciBjaGFpbnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOVMgV2l0aGRyYXcnOiAnNTYxQScsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlTIEFldGhlcm9zeW50aGVzaXMnOiAnNTYxQicsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRTlTIFN0eWdpYW4gVGVuZHJpbHMnOiAnOTUyJywgLy8gc3RhbmRpbmcgaW4gdGhlIGJyYW1ibGVzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0U5UyBNdWx0aS1Qcm9uZ2VkIFBhcnRpY2xlIEJlYW0nOiAnNTYwMCcsIC8vIEFydCBPZiBEYXJrbmVzcyBQYXJ0bmVyIFN0YWNrXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcInRhbmsgc3ByZWFkXCIuICBUaGlzIGNhbiBiZSBzdGFja2VkIGJ5IHR3byB0YW5rcyBpbnZ1bG5pbmcuXHJcbiAgICAgIC8vIE5vdGU6IHRoaXMgd2lsbCBzdGlsbCBzaG93IHNvbWV0aGluZyBmb3IgaG9sbWdhbmcvbGl2aW5nLCBidXRcclxuICAgICAgLy8gYXJndWFibHkgYSBoZWFsZXIgbWlnaHQgbmVlZCB0byBkbyBzb21ldGhpbmcgYWJvdXQgdGhhdCwgc28gbWF5YmVcclxuICAgICAgLy8gaXQncyBvayB0byBzdGlsbCBzaG93IGFzIGEgd2FybmluZz8/XHJcbiAgICAgIGlkOiAnRTlTIENvbmRlbnNlZCBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzU2MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEFudGktYWlyIFwib3V0XCIuICBUaGlzIGNhbiBiZSBpbnZ1bG5lZCBieSBhIHRhbmsgYWxvbmcgd2l0aCB0aGUgc3ByZWFkIGFib3ZlLlxyXG4gICAgICBpZDogJ0U5UyBBbnRpLUFpciBQaGFzZXIgVW5saW1pdGVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzU2MTInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBOIEZvcndhcmQgSW1wbG9zaW9uJzogJzU2QjQnLCAvLyBob3dsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBGb3J3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCNScsIC8vIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgSW1wbG9zaW9uJzogJzU2QjcnLCAvLyB0YWlsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjgnLCAvLyB0YWlsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDEnOiAnNTZEOScsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAyJzogJzVCMjYnLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQ2xvYWsgT2YgU2hhZG93cyc6ICc1QjExJywgLy8gbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxME4gVGhyb25lIE9mIFNoYWRvdyc6ICc1NkM3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxME4gUmlnaHQgR2lnYSBTbGFzaCc6ICc1NkFFJywgLy8gYm9zcyByaWdodCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBSaWdodCBTaGFkb3cgU2xhc2gnOiAnNTZBRicsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIExlZnQgR2lnYSBTbGFzaCc6ICc1NkIxJywgLy8gYm9zcyBsZWZ0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIExlZnQgU2hhZG93IFNsYXNoJzogJzU2QkQnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBTaGFkb3d5IEVydXB0aW9uJzogJzU2RTEnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBtYXJrZXJzIHBhaXJlZCB3aXRoIGJhcmJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBOIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NkRCJywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBoaXR0aW5nIHNoYWRvdyBvZiB0aGUgaGVybyB3aXRoIGFiaWxpdGllcyBjYW4gY2F1c2UgeW91IHRvIHRha2UgZGFtYWdlLCBsaXN0IHRob3NlP1xyXG4vLyAgICAgICBlLmcuIHBpY2tpbmcgdXAgeW91ciBmaXJzdCBwaXRjaCBib2cgcHVkZGxlIHdpbGwgY2F1c2UgeW91IHRvIGRpZSB0byB0aGUgZGFtYWdlXHJcbi8vICAgICAgIHlvdXIgc2hhZG93IHRha2VzIGZyb20gRGVlcHNoYWRvdyBOb3ZhIG9yIERpc3RhbnQgU2NyZWFtLlxyXG4vLyBUT0RPOiA1NzNCIEJsaWdodGluZyBCbGl0eiBpc3N1ZXMgZHVyaW5nIGxpbWl0IGN1dCBudW1iZXJzXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBTIEltcGxvc2lvbiBTaW5nbGUgMSc6ICc1NkYyJywgLy8gc2luZ2xlIHRhaWwgdXAgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFNpbmdsZSAyJzogJzU2RUYnLCAvLyBzaW5nbGUgaG93bCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gUXVhZHJ1cGxlIDEnOiAnNTZFRicsIC8vIHF1YWRydXBsZSBzZXQgb2Ygc2hhZG93IGltcGxvc2lvbnNcclxuICAgICdFMTBTIEltcGxvc2lvbiBRdWFkcnVwbGUgMic6ICc1NkYyJywgLy8gcXVhZHJ1cGxlIHNldCBvZiBzaGFkb3cgaW1wbG9zaW9uc1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBTaW5nbGUgMSc6ICc1NkVDJywgLy8gR2lnYSBzbGFzaCBzaW5nbGUgZnJvbSBzaGFkb3dcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggU2luZ2xlIDInOiAnNTZFRCcsIC8vIEdpZ2Egc2xhc2ggc2luZ2xlIGZyb20gc2hhZG93XHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIEJveCAxJzogJzU3MDknLCAvLyBHaWdhIHNsYXNoIGJveCBmcm9tIGZvdXIgZ3JvdW5kIHNoYWRvd3NcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggQm94IDInOiAnNTcwRCcsIC8vIEdpZ2Egc2xhc2ggYm94IGZyb20gZm91ciBncm91bmQgc2hhZG93c1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBRdWFkcnVwbGUgMSc6ICc1NkVDJywgLy8gcXVhZHJ1cGxlIHNldCBvZiBnaWdhIHNsYXNoIGNsZWF2ZXNcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggUXVhZHJ1cGxlIDInOiAnNTZFOScsIC8vIHF1YWRydXBsZSBzZXQgb2YgZ2lnYSBzbGFzaCBjbGVhdmVzXHJcbiAgICAnRTEwUyBDbG9hayBPZiBTaGFkb3dzIDEnOiAnNUIxMycsIC8vIGluaXRpYWwgbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxMFMgQ2xvYWsgT2YgU2hhZG93cyAyJzogJzVCMTQnLCAvLyBzZWNvbmQgc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwUyBUaHJvbmUgT2YgU2hhZG93JzogJzU3MTcnLCAvLyBzdGFuZGluZyB1cCBnZXQgb3V0XHJcbiAgICAnRTEwUyBTaGFkb3d5IEVydXB0aW9uJzogJzU3MzgnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBkdXJpbmcgYW1wbGlmaWVyXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTEwUyBTd2F0aCBPZiBTaWxlbmNlIDEnOiAnNTcxQScsIC8vIFNoYWRvdyBjbG9uZSBjbGVhdmUgKHRvbyBjbG9zZSlcclxuICAgICdFMTBTIFN3YXRoIE9mIFNpbGVuY2UgMic6ICc1QkJGJywgLy8gU2hhZG93IGNsb25lIGNsZWF2ZSAodGltZWQpXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBTIFNoYWRlZmlyZSc6ICc1NzMyJywgLy8gcHVycGxlIHRhbmsgdW1icmFsIG9yYnNcclxuICAgICdFMTBTIFBpdGNoIEJvZyc6ICc1NzIyJywgLy8gbWFya2VyIHNwcmVhZCB0aGF0IGRyb3BzIGEgc2hhZG93IHB1ZGRsZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTEwUyBTaGFkb3dcXCdzIEVkZ2UnOiAnNTcyNScsIC8vIFRhbmtidXN0ZXIgc2luZ2xlIHRhcmdldCBmb2xsb3d1cFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTBTIERhbWFnZSBEb3duIE9yYnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ0ZsYW1lc2hhZG93JywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2NoYXR0ZW5mbGFtbWUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdGbGFtbWUgb21icmFsZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ+OCt+ODo+ODieOCpuODleODrOOCpOODoCcsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdkYW1hZ2UnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IGAke21hdGNoZXMuZWZmZWN0fSAocGFydGlhbCBzdGFjaylgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gQm9zcycsXHJcbiAgICAgIC8vIFNoYWNrbGVzIGJlaW5nIG1lc3NlZCB1cCBhcHBlYXIgdG8ganVzdCBnaXZlIHRoZSBEYW1hZ2UgRG93biwgd2l0aCBub3RoaW5nIGVsc2UuXHJcbiAgICAgIC8vIE1lc3NpbmcgdXAgdG93ZXJzIGlzIHRoZSBUaHJpY2UtQ29tZSBSdWluIGVmZmVjdCAoOUUyKSwgYnV0IGFsc28gRGFtYWdlIERvd24uXHJcbiAgICAgIC8vIFRPRE86IHNvbWUgb2YgdGhlc2Ugd2lsbCBiZSBkdXBsaWNhdGVkIHdpdGggb3RoZXJzLCBsaWtlIGBFMTBTIFRocm9uZSBPZiBTaGFkb3dgLlxyXG4gICAgICAvLyBNYXliZSBpdCdkIGJlIG5pY2UgdG8gZmlndXJlIG91dCBob3cgdG8gcHV0IHRoZSBkYW1hZ2UgbWFya2VyIG9uIHRoYXQ/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2hhZG93a2VlcGVyJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2NoYXR0ZW5rw7ZuaWcnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdSb2kgRGUgTFxcJ09tYnJlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn5b2x44Gu546LJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RhbWFnZScsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogYCR7bWF0Y2hlcy5lZmZlY3R9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU2hhZG93IFdhcnJpb3IgNCBkb2cgcm9vbSBjbGVhdmVcclxuICAgICAgLy8gVGhpcyBjYW4gYmUgbWl0aWdhdGVkIGJ5IHRoZSB3aG9sZSBncm91cCwgc28gYWRkIGEgZGFtYWdlIGNvbmRpdGlvbi5cclxuICAgICAgaWQ6ICdFMTBTIEJhcmJzIE9mIEFnb255JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NzJBJywgJzVCMjcnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTYyRScsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjJDJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2MzAnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybm91dCc6ICc1NjJGJywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIFNoaW5pbmcgQmxhZGUnOiAnNTYzMScsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFOIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjNCJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTYzQycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFOIFJlc291bmRpbmcgQ3JhY2snOiAnNTY0RCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjQ1JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NDMnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybm91dCc6ICc1NjQ2JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMU4gQmxhc3RpbmcgWm9uZSc6ICc1NjNFJywgLy8gUHJpc21hdGljIERlY2VwdGlvbiBjaGFyZ2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTFOIEJ1cm4gTWFyayc6ICc1NjRGJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTFOIEJsYXN0YnVybiBLbm9ja2VkIE9mZicsXHJcbiAgICAgIC8vIDU2MkQgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY0NCA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2MkQnLCAnNTY0NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyA1NjVBLzU2OEQgU2luc21va2UgQm91bmQgT2YgRmFpdGggc2hhcmVcclxuLy8gNTY1RS81Njk5IEJvd3Nob2NrIGhpdHMgdGFyZ2V0IG9mIDU2NUQgKHR3aWNlKSBhbmQgdHdvIG90aGVyc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3Npc1NhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjUyJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY1NCcsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjU2JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIFNoaW5pbmcgQmxhZGUnOiAnNTY1NycsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBGaXJlJzogJzU2OEUnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBMaWdodG5pbmcnOiAnNTY5NScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEhvbHknOiAnNTY5RCcsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSBDeWNsZSc6ICc1NjlFJywgLy8gQmFpdGVkIGV4cGxvc2lvbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjZEJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTY2QycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBGbGFtZSBCcmlnaHQgUHVsc2UnOiAnNTY3MScsIC8vIFJlZCBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBMZXZpbiBCcmlnaHQgUHVsc2UnOiAnNTY3MCcsIC8vIEJsdWUgY2FyZCBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBSZXNvbmFudCBXaW5kcyc6ICc1Njg5JywgLy8gRGVtaS1HdWt1bWF0eiBcImdldCBpblwiXHJcbiAgICAnRTExUyBSZXNvdW5kaW5nIENyYWNrJzogJzU2ODgnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFTIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJub3V0JzogJzU2N0MnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1Njc5JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2N0InLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgU2hpbmluZyBCbGFkZSc6ICc1NjdFJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgYmFpdGVkIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMVMgQnVybm91dCc6ICc1NjU1JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJ1cm5vdXQgQ3ljbGUnOiAnNTY5NicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExUyBCbGFzdGluZyBab25lJzogJzU2NzQnLCAvLyBQcmlzbWF0aWMgRGVjZXB0aW9uIGNoYXJnZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrJzogJzU2NjQnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhblxyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrIEN5Y2xlJzogJzU2OEMnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIFNpbnNtaXRlJzogJzU2NjcnLCAvLyBMaWdodG5pbmcgRWxlbWVudGFsIEJyZWFrIHNwcmVhZFxyXG4gICAgJ0UxMVMgU2luc21pdGUgQ3ljbGUnOiAnNTY5NCcsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJuIE1hcmsnOiAnNTZBMycsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICAgICdFMTFTIFNpbnNpZ2h0IDEnOiAnNTY2MScsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyXHJcbiAgICAnRTExUyBTaW5zaWdodCAyJzogJzVCQzcnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlciBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICdFMTFTIFNpbnNpZ2h0IDMnOiAnNTZBMCcsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdFMTFTIEhvbHkgU2luc2lnaHQgR3JvdXAgU2hhcmUnOiAnNTY2OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMVMgQmxhc3RidXJuIEtub2NrZWQgT2ZmJyxcclxuICAgICAgLy8gNTY1MyA9IEJ1cm50IFN0cmlrZSBmaXJlIGZvbGxvd3VwIGR1cmluZyBtb3N0IG9mIHRoZSBmaWdodFxyXG4gICAgICAvLyA1NjdBID0gc2FtZSB0aGluZywgYnV0IGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgICAvLyA1NjhGID0gc2FtZSB0aGluZywgYnV0IGR1cmluZyBDeWNsZSBvZiBGYWl0aFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTY1MycsICc1NjdBJywgJzU2OEYnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0IFNpbmdsZSc6ICc1ODVGJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0JzogJzRFMzAnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50IFNpbmdsZSc6ICc1ODVDJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQnOiAnNEUyRCcsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlIFNpbmdsZSc6ICc1ODVEJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlJzogJzRFMkUnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtIFNpbmdsZSc6ICc1ODVFJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0nOiAnNEUyRicsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDEnOiAnNTg3OCcsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAyJzogJzU4NzcnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBCb21iIEV4cGxvc2lvbic6ICc1ODZEJywgLy8gU21hbGwgYm9tYiBleHBsb3Npb25cclxuICAgICdFMTJOIFRpdGFuaWMgQm9tYiBFeHBsb3Npb24nOiAnNTg2RicsIC8vIExhcmdlIGJvbWIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJOIEVhcnRoc2hha2VyJzogJzU4ODUnLCAvLyBFYXJ0aHNoYWtlciBvbiBmaXJzdCBwbGF0Zm9ybVxyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMSc6ICc1ODY3JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggc2xpZGluZ1xyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMic6ICc1ODY5JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggUmFwdHVyb3VzIFJlYWNoXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgT3V0cHV0cyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvb3V0cHV0cyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGFkZCBzZXBhcmF0ZSBkYW1hZ2VXYXJuLWVzcXVlIGljb24gZm9yIGRhbWFnZSBkb3ducz9cclxuLy8gVE9ETzogNThBNiBVbmRlciBUaGUgV2VpZ2h0IC8gNThCMiBDbGFzc2ljYWwgU2N1bHB0dXJlIG1pc3Npbmcgc29tZWJvZHkgaW4gcGFydHkgd2FybmluZz9cclxuLy8gVE9ETzogNThDQSBEYXJrIFdhdGVyIElJSSAvIDU4QzUgU2hlbGwgQ3J1c2hlciBzaG91bGQgaGl0IGV2ZXJ5b25lIGluIHBhcnR5XHJcbi8vIFRPRE86IERhcmsgQWVybyBJSUkgNThENCBzaG91bGQgbm90IGJlIGEgc2hhcmUgZXhjZXB0IG9uIGFkdmFuY2VkIHJlbGF0aXZpdHkgZm9yIGRvdWJsZSBhZXJvLlxyXG4vLyAoZm9yIGdhaW5zIGVmZmVjdCwgc2luZ2xlIGFlcm8gPSB+MjMgc2Vjb25kcywgZG91YmxlIGFlcm8gPSB+MzEgc2Vjb25kcyBkdXJhdGlvbilcclxuXHJcbi8vIER1ZSB0byBjaGFuZ2VzIGludHJvZHVjZWQgaW4gcGF0Y2ggNS4yLCBvdmVyaGVhZCBtYXJrZXJzIG5vdyBoYXZlIGEgcmFuZG9tIG9mZnNldFxyXG4vLyBhZGRlZCB0byB0aGVpciBJRC4gVGhpcyBvZmZzZXQgY3VycmVudGx5IGFwcGVhcnMgdG8gYmUgc2V0IHBlciBpbnN0YW5jZSwgc29cclxuLy8gd2UgY2FuIGRldGVybWluZSB3aGF0IGl0IGlzIGZyb20gdGhlIGZpcnN0IG92ZXJoZWFkIG1hcmtlciB3ZSBzZWUuXHJcbi8vIFRoZSBmaXJzdCAxQiBtYXJrZXIgaW4gdGhlIGVuY291bnRlciBpcyB0aGUgZm9ybWxlc3MgdGFua2J1c3RlciwgSUQgMDA0Ri5cclxuY29uc3QgZmlyc3RIZWFkbWFya2VyID0gcGFyc2VJbnQoJzAwREEnLCAxNik7XHJcbmNvbnN0IGdldEhlYWRtYXJrZXJJZCA9IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgLy8gSWYgd2UgbmFpdmVseSBqdXN0IGNoZWNrICFkYXRhLmRlY09mZnNldCBhbmQgbGVhdmUgaXQsIGl0IGJyZWFrcyBpZiB0aGUgZmlyc3QgbWFya2VyIGlzIDAwREEuXHJcbiAgLy8gKFRoaXMgbWFrZXMgdGhlIG9mZnNldCAwLCBhbmQgITAgaXMgdHJ1ZS4pXHJcbiAgaWYgKHR5cGVvZiBkYXRhLmRlY09mZnNldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBkYXRhLmRlY09mZnNldCA9IHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGZpcnN0SGVhZG1hcmtlcjtcclxuICAvLyBUaGUgbGVhZGluZyB6ZXJvZXMgYXJlIHN0cmlwcGVkIHdoZW4gY29udmVydGluZyBiYWNrIHRvIHN0cmluZywgc28gd2UgcmUtYWRkIHRoZW0gaGVyZS5cclxuICAvLyBGb3J0dW5hdGVseSwgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHJvYnVzdCxcclxuICAvLyBzaW5jZSB3ZSBrbm93IGFsbCB0aGUgSURzIHRoYXQgd2lsbCBiZSBwcmVzZW50IGluIHRoZSBlbmNvdW50ZXIuXHJcbiAgcmV0dXJuIChwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBkYXRhLmRlY09mZnNldCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkucGFkU3RhcnQoNCwgJzAnKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBMZWZ0JzogJzU4QUQnLCAvLyBIYWlyY3V0IHdpdGggbGVmdCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIFJpZ2h0JzogJzU4QUUnLCAvLyBIYWlyY3V0IHdpdGggcmlnaHQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFNDQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgQ29uZmxhZyBTdHJpa2UnOiAnNEU0NScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgRmVyb3N0b3JtJzogJzRFNDYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBKdWRnbWVudCBKb2x0JzogJzRFNDcnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBTaGF0dGVyJzogJzU4OUMnLCAvLyBJY2UgUGlsbGFyIGV4cGxvc2lvbiBpZiB0ZXRoZXIgbm90IGdvdHRlblxyXG4gICAgJ0UxMlMgUHJvbWlzZSBJbXBhY3QnOiAnNThBMScsIC8vIFRpdGFuIGJvbWIgZHJvcFxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQmxpenphcmQgSUlJJzogJzU4RDMnLCAvLyBSZWxhdGl2aXR5IGRvbnV0IG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgQXBvY2FseXBzZSc6ICc1OEU2JywgLy8gTGlnaHQgdXAgY2lyY2xlIGV4cGxvc2lvbnMgKGRhbWFnZSBkb3duKVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIE1hZWxzdHJvbSc6ICc1OERBJywgLy8gQWR2YW5jZWQgUmVsYXRpdml0eSB0cmFmZmljIGxpZ2h0IGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZyaWdpZCBTdG9uZSc6ICc1ODlFJywgLy8gU2hpdmEgc3ByZWFkXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFya2VzdCBEYW5jZSc6ICc0RTMzJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgKyBqdW1wIGJlZm9yZSBrbm9ja2JhY2tcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEN1cnJlbnQnOiAnNThEOCcsIC8vIEJhaXRlZCB0cmFmZmljIGxpZ2h0IGxhc2Vyc1xyXG4gICAgJ0UxMlMgT3JhY2xlIFNwaXJpdCBUYWtlcic6ICc1OEM2JywgLy8gUmFuZG9tIGp1bXAgc3ByZWFkIG1lY2hhbmljIGFmdGVyIFNoZWxsIENydXNoZXJcclxuICAgICdFMTJTIE9yYWNsZSBTb21iZXIgRGFuY2UgMSc6ICc1OEJGJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgZm9yIER1YWwgQXBvY2FseXBzZVxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAyJzogJzU4QzAnLCAvLyBTZWNvbmQgc29tYmVyIGRhbmNlIGp1bXBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBXZWlnaHQgT2YgVGhlIFdvcmxkJzogJzU4QTUnLCAvLyBUaXRhbiBib21iIGJsdWUgbWFya2VyXHJcbiAgICAnRTEyUyBQcm9taXNlIFB1bHNlIE9mIFRoZSBMYW5kJzogJzU4QTMnLCAvLyBUaXRhbiBib21iIHllbGxvdyBtYXJrZXJcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEVydXB0aW9uIDEnOiAnNThDRScsIC8vIEluaXRpYWwgd2FybXVwIHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMic6ICc1OENEJywgLy8gUmVsYXRpdml0eSBzcHJlYWQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBCbGFjayBIYWxvJzogJzU4QzcnLCAvLyBUYW5rYnVzdGVyIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgRG9vbSc6ICc5RDQnLCAvLyBSZWxhdGl2aXR5IHB1bmlzaG1lbnQgZm9yIG11bHRpcGxlIG1pc3Rha2VzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBGb3JjZSBPZiBUaGUgTGFuZCc6ICc1OEE0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEJpZyBjaXJjbGUgZ3JvdW5kIGFvZXMgZHVyaW5nIFNoaXZhIGp1bmN0aW9uLlxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBzaGllbGRlZCB0aHJvdWdoIGFzIGxvbmcgYXMgdGhhdCBwZXJzb24gZG9lc24ndCBzdGFjay5cclxuICAgICAgaWQ6ICdFMTJTIEljaWNsZSBJbXBhY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEU1QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIEhlYWRtYXJrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHt9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBpZCA9IGdldEhlYWRtYXJrZXJJZChkYXRhLCBtYXRjaGVzKTtcclxuICAgICAgICBjb25zdCBmaXJzdExhc2VyTWFya2VyID0gJzAwOTEnO1xyXG4gICAgICAgIGNvbnN0IGxhc3RMYXNlck1hcmtlciA9ICcwMDk4JztcclxuICAgICAgICBpZiAoaWQgPj0gZmlyc3RMYXNlck1hcmtlciAmJiBpZCA8PSBsYXN0TGFzZXJNYXJrZXIpIHtcclxuICAgICAgICAgIC8vIGlkcyBhcmUgc2VxdWVudGlhbDogIzEgc3F1YXJlLCAjMiBzcXVhcmUsICMzIHNxdWFyZSwgIzQgc3F1YXJlLCAjMSB0cmlhbmdsZSBldGNcclxuICAgICAgICAgIGNvbnN0IGRlY09mZnNldCA9IHBhcnNlSW50KGlkLCAxNikgLSBwYXJzZUludChmaXJzdExhc2VyTWFya2VyLCAxNik7XHJcblxyXG4gICAgICAgICAgLy8gZGVjT2Zmc2V0IGlzIDAtNywgc28gbWFwIDAtMyB0byAxLTQgYW5kIDQtNyB0byAxLTQuXHJcbiAgICAgICAgICBkYXRhLmxhc2VyTmFtZVRvTnVtID0gZGF0YS5sYXNlck5hbWVUb051bSB8fCB7fTtcclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW1bbWF0Y2hlcy50YXJnZXRdID0gZGVjT2Zmc2V0ICUgNCArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlc2Ugc2N1bHB0dXJlcyBhcmUgYWRkZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBmaWdodCwgc28gd2UgbmVlZCB0byBjaGVjayB3aGVyZSB0aGV5XHJcbiAgICAgIC8vIHVzZSB0aGUgXCJDbGFzc2ljYWwgU2N1bHB0dXJlXCIgYWJpbGl0eSBhbmQgZW5kIHVwIG9uIHRoZSBhcmVuYSBmb3IgcmVhbC5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQ2hpc2VsZWQgU2N1bHB0dXJlIENsYXNzaWNhbCBTY3VscHR1cmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIHJ1biBwZXIgcGVyc29uIHRoYXQgZ2V0cyBoaXQgYnkgdGhlIHNhbWUgc2N1bHB0dXJlLCBidXQgdGhhdCdzIGZpbmUuXHJcbiAgICAgICAgLy8gUmVjb3JkIHRoZSB5IHBvc2l0aW9uIG9mIGVhY2ggc2N1bHB0dXJlIHNvIHdlIGNhbiB1c2UgaXQgZm9yIGJldHRlciB0ZXh0IGxhdGVyLlxyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyB8fCB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZSBzb3VyY2Ugb2YgdGhlIHRldGhlciBpcyB0aGUgcGxheWVyLCB0aGUgdGFyZ2V0IGlzIHRoZSBzY3VscHR1cmUuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIENoaXNlbGVkIFNjdWxwdHVyZSBUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyB0YXJnZXQ6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgPSBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbWF0Y2hlcy5zb3VyY2VdID0gbWF0Y2hlcy50YXJnZXRJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUgQ291bnRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjMnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDEsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50ID0gZGF0YS5ibGFkZU9mRmxhbWVDb3VudCB8fCAwO1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQrKztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaXMgdGhlIENoaXNlbGVkIFNjdWxwdHVyZSBsYXNlciB3aXRoIHRoZSBsaW1pdCBjdXQgZG90cy5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmxhc2VyTmFtZVRvTnVtIHx8ICFkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkIHx8ICFkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEZpbmQgdGhlIHBlcnNvbiB3aG8gaGFzIHRoaXMgbGFzZXIgbnVtYmVyIGFuZCBpcyB0ZXRoZXJlZCB0byB0aGlzIHN0YXR1ZS5cclxuICAgICAgICBjb25zdCBudW1iZXIgPSAoZGF0YS5ibGFkZU9mRmxhbWVDb3VudCB8fCAwKSArIDE7XHJcbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSBtYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBPYmplY3Qua2V5cyhkYXRhLmxhc2VyTmFtZVRvTnVtKTtcclxuICAgICAgICBjb25zdCB3aXRoTnVtID0gbmFtZXMuZmlsdGVyKChuYW1lKSA9PiBkYXRhLmxhc2VyTmFtZVRvTnVtW25hbWVdID09PSBudW1iZXIpO1xyXG4gICAgICAgIGNvbnN0IG93bmVycyA9IHdpdGhOdW0uZmlsdGVyKChuYW1lKSA9PiBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkW25hbWVdID09PSBzb3VyY2VJZCk7XHJcblxyXG4gICAgICAgIC8vIGlmIHNvbWUgbG9naWMgZXJyb3IsIGp1c3QgYWJvcnQuXHJcbiAgICAgICAgaWYgKG93bmVycy5sZW5ndGggIT09IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFRoZSBvd25lciBoaXR0aW5nIHRoZW1zZWx2ZXMgaXNuJ3QgYSBtaXN0YWtlLi4udGVjaG5pY2FsbHkuXHJcbiAgICAgICAgaWYgKG93bmVyc1swXSA9PT0gbWF0Y2hlcy50YXJnZXQpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE5vdyB0cnkgdG8gZmlndXJlIG91dCB3aGljaCBzdGF0dWUgaXMgd2hpY2guXHJcbiAgICAgICAgLy8gUGVvcGxlIGNhbiBwdXQgdGhlc2Ugd2hlcmV2ZXIuICBUaGV5IGNvdWxkIGdvIHNpZGV3YXlzLCBvciBkaWFnb25hbCwgb3Igd2hhdGV2ZXIuXHJcbiAgICAgICAgLy8gSXQgc2VlbXMgbW9vb29vc3QgcGVvcGxlIHB1dCB0aGVzZSBub3J0aCAvIHNvdXRoIChvbiB0aGUgc291dGggZWRnZSBvZiB0aGUgYXJlbmEpLlxyXG4gICAgICAgIC8vIExldCdzIHNheSBhIG1pbmltdW0gb2YgMiB5YWxtcyBhcGFydCBpbiB0aGUgeSBkaXJlY3Rpb24gdG8gY29uc2lkZXIgdGhlbSBcIm5vcnRoL3NvdXRoXCIuXHJcbiAgICAgICAgY29uc3QgbWluaW11bVlhbG1zRm9yU3RhdHVlcyA9IDI7XHJcblxyXG4gICAgICAgIGxldCBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSBmYWxzZTtcclxuICAgICAgICBsZXQgaXNTdGF0dWVOb3J0aCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHNjdWxwdHVyZUlkcyA9IE9iamVjdC5rZXlzKGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyk7XHJcbiAgICAgICAgaWYgKHNjdWxwdHVyZUlkcy5sZW5ndGggPT09IDIgJiYgc2N1bHB0dXJlSWRzLmluY2x1ZGVzKHNvdXJjZUlkKSkge1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJJZCA9IHNjdWxwdHVyZUlkc1swXSA9PT0gc291cmNlSWQgPyBzY3VscHR1cmVJZHNbMV0gOiBzY3VscHR1cmVJZHNbMF07XHJcbiAgICAgICAgICBjb25zdCBzb3VyY2VZID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW3NvdXJjZUlkXTtcclxuICAgICAgICAgIGNvbnN0IG90aGVyWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tvdGhlcklkXTtcclxuICAgICAgICAgIGNvbnN0IHlEaWZmID0gTWF0aC5hYnMoc291cmNlWSAtIG90aGVyWSk7XHJcbiAgICAgICAgICBpZiAoeURpZmYgPiBtaW5pbXVtWWFsbXNGb3JTdGF0dWVzKSB7XHJcbiAgICAgICAgICAgIGlzU3RhdHVlUG9zaXRpb25Lbm93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlzU3RhdHVlTm9ydGggPSBzb3VyY2VZIDwgb3RoZXJZO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3duZXIgPSBvd25lcnNbMF07XHJcbiAgICAgICAgY29uc3Qgb3duZXJOaWNrID0gZGF0YS5TaG9ydE5hbWUob3duZXIpO1xyXG4gICAgICAgIGxldCB0ZXh0ID0ge1xyXG4gICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6oke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7bnVtYmVyfeuyiClgLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKGlzU3RhdHVlUG9zaXRpb25Lbm93biAmJiBpc1N0YXR1ZU5vcnRoKSB7XHJcbiAgICAgICAgICB0ZXh0ID0ge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0gbm9ydGgpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0gbm9yZGVuKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljJfjga4ke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6rljJfmlrkke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIIOu2geyqvSlgLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzU3RhdHVlUG9zaXRpb25Lbm93biAmJiAhaXNTdGF0dWVOb3J0aCkge1xyXG4gICAgICAgICAgdGV4dCA9IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IHNvdXRoKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IFPDvGRlbilgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2X44GuJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6Ieq5Y2X5pa5JHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7bnVtYmVyfeuyiCDrgqjsqr0pYCxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICBibGFtZTogb3duZXIsXHJcbiAgICAgICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBJY2UgUGlsbGFyIFRyYWNrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdJY2UgUGlsbGFyJywgaWQ6IFsnMDAwMScsICcwMDM5J10gfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXIgPSBkYXRhLnBpbGxhcklkVG9Pd25lciB8fCB7fTtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBNaXN0YWtlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogJzU4OUInIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5waWxsYXJJZFRvT3duZXIpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXMudGFyZ2V0ICE9PSBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGlsbGFyT3duZXIgPSBkYXRhLlNob3J0TmFtZShkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7cGlsbGFyT3duZXJ944GL44KJKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6oke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtwaWxsYXJPd25lcn1cIilgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgR2FpbiBGaXJlIFJlc2lzdGFuY2UgRG93biBJSScsXHJcbiAgICAgIC8vIFRoZSBCZWFzdGx5IFNjdWxwdHVyZSBnaXZlcyBhIDMgc2Vjb25kIGRlYnVmZiwgdGhlIFJlZ2FsIFNjdWxwdHVyZSBnaXZlcyBhIDE0cyBvbmUuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4MzInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmlyZSA9IGRhdGEuZmlyZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIExvc2UgRmlyZSBSZXNpc3RhbmNlIERvd24gSUknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnODMyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPSBkYXRhLmZpcmUgfHwge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyID0gZGF0YS5zbWFsbExpb25JZFRvT3duZXIgfHwge307XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25JZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uT3duZXJzID0gZGF0YS5zbWFsbExpb25Pd25lcnMgfHwgW107XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIExpb25zYmxhemUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0JlYXN0bHkgU2N1bHB0dXJlJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0FiYmlsZCBFaW5lcyBMw7Z3ZW4nLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkCcsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEZvbGtzIGJhaXRpbmcgdGhlIGJpZyBsaW9uIHNlY29uZCBjYW4gdGFrZSB0aGUgZmlyc3Qgc21hbGwgbGlvbiBoaXQsXHJcbiAgICAgICAgLy8gc28gaXQncyBub3Qgc3VmZmljaWVudCB0byBjaGVjayBvbmx5IHRoZSBvd25lci5cclxuICAgICAgICBpZiAoIWRhdGEuc21hbGxMaW9uT3duZXJzKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IG93bmVyID0gZGF0YS5zbWFsbExpb25JZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXTtcclxuICAgICAgICBpZiAoIW93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChtYXRjaGVzLnRhcmdldCA9PT0gb3duZXIpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB0YXJnZXQgYWxzbyBoYXMgYSBzbWFsbCBsaW9uIHRldGhlciwgdGhhdCBpcyBhbHdheXMgYSBtaXN0YWtlLlxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQncyBvbmx5IGEgbWlzdGFrZSBpZiB0aGUgdGFyZ2V0IGhhcyBhIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGNvbnN0IGhhc1NtYWxsTGlvbiA9IGRhdGEuc21hbGxMaW9uT3duZXJzLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIGlmIChoYXNTbWFsbExpb24gfHwgaGFzRmlyZURlYnVmZikge1xyXG4gICAgICAgICAgY29uc3Qgb3duZXJOaWNrID0gZGF0YS5TaG9ydE5hbWUob3duZXIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgICBjb25zdCB4ID0gcGFyc2VGbG9hdChtYXRjaGVzLngpO1xyXG4gICAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICAgIGxldCBkaXJPYmogPSBudWxsO1xyXG4gICAgICAgICAgaWYgKHkgPCBjZW50ZXJZKSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpck5FO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJOVztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpclNFO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTVztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICR7ZGlyT2JqWydlbiddfSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZGUnXX0pYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtvd25lck5pY2t9LCAke2Rpck9ialsnZnInXX0pYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJLCAke2Rpck9ialsnamEnXX0pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t9LCAke2Rpck9ialsnY24nXX1gLFxyXG4gICAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtkaXJPYmpbJ2tvJ119KWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIE5vcnRoIEJpZyBMaW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnRGdWxsKHsgbmFtZTogJ1JlZ2FsIFNjdWxwdHVyZScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgIGlmICh5IDwgY2VudGVyWSlcclxuICAgICAgICAgIGRhdGEubm9ydGhCaWdMaW9uID0gbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmlnIExpb24gS2luZ3NibGF6ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdSZWdhbCBTY3VscHR1cmUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdBYmJpbGQgZWluZXMgZ3Jvw59lbiBMw7Z3ZW4nLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdjcsOpYXRpb24gbMOpb25pbmUgcm95YWxlJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2Q546LJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2luZ2xlVGFyZ2V0ID0gbWF0Y2hlcy50eXBlID09PSAnMjEnO1xyXG4gICAgICAgIGNvbnN0IGhhc0ZpcmVEZWJ1ZmYgPSBkYXRhLmZpcmUgJiYgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XTtcclxuXHJcbiAgICAgICAgLy8gU3VjY2VzcyBpZiBvbmx5IG9uZSBwZXJzb24gdGFrZXMgaXQgYW5kIHRoZXkgaGF2ZSBubyBmaXJlIGRlYnVmZi5cclxuICAgICAgICBpZiAoc2luZ2xlVGFyZ2V0ICYmICFoYXNGaXJlRGVidWZmKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXQgPSB7XHJcbiAgICAgICAgICBub3J0aEJpZ0xpb246IHtcclxuICAgICAgICAgICAgZW46ICdub3J0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICAgIGRlOiAnTm9yZGVtLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgICAgamE6ICflpKfjg6njgqTjgqrjg7Mo5YyXKScsXHJcbiAgICAgICAgICAgIGNuOiAn5YyX5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgICAga286ICfrtoHsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc291dGhCaWdMaW9uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnc291dGggYmlnIGxpb24nLFxyXG4gICAgICAgICAgICBkZTogJ1PDvGRlbiwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWNlyknLFxyXG4gICAgICAgICAgICBjbjogJ+WNl+aWueWkp+eLruWtkCcsXHJcbiAgICAgICAgICAgIGtvOiAn64Ko7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNoYXJlZDoge1xyXG4gICAgICAgICAgICBlbjogJ3NoYXJlZCcsXHJcbiAgICAgICAgICAgIGRlOiAnZ2V0ZWlsdCcsXHJcbiAgICAgICAgICAgIGphOiAn6YeN44Gt44GfJyxcclxuICAgICAgICAgICAgY246ICfph43lj6AnLFxyXG4gICAgICAgICAgICBrbzogJ+qwmeydtCDrp57snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGZpcmVEZWJ1ZmY6IHtcclxuICAgICAgICAgICAgZW46ICdoYWQgZmlyZScsXHJcbiAgICAgICAgICAgIGRlOiAnaGF0dGUgRmV1ZXInLFxyXG4gICAgICAgICAgICBqYTogJ+eCjuS7mOOBjScsXHJcbiAgICAgICAgICAgIGNuOiAn54GrRGVidWZmJyxcclxuICAgICAgICAgICAga286ICftmZTsl7wg65SU67KE7ZSEIOuwm+ydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGxhYmVscyA9IFtdO1xyXG4gICAgICAgIGlmIChkYXRhLm5vcnRoQmlnTGlvbikge1xyXG4gICAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uID09PSBtYXRjaGVzLnNvdXJjZUlkKVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChvdXRwdXQubm9ydGhCaWdMaW9uW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0Lm5vcnRoQmlnTGlvblsnZW4nXSk7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5zb3V0aEJpZ0xpb25bZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQuc291dGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaW5nbGVUYXJnZXQpXHJcbiAgICAgICAgICBsYWJlbHMucHVzaChvdXRwdXQuc2hhcmVkW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0LnNoYXJlZFsnZW4nXSk7XHJcbiAgICAgICAgaWYgKGhhc0ZpcmVEZWJ1ZmYpXHJcbiAgICAgICAgICBsYWJlbHMucHVzaChvdXRwdXQuZmlyZURlYnVmZltkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5maXJlRGVidWZmWydlbiddKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtsYWJlbHMuam9pbignLCAnKX0pYCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIEtub2NrZWQgT2ZmJyxcclxuICAgICAgLy8gNTg5QSA9IEljZSBQaWxsYXIgKHByb21pc2Ugc2hpdmEgcGhhc2UpXHJcbiAgICAgIC8vIDU4QjYgPSBQYWxtIE9mIFRlbXBlcmFuY2UgKHByb21pc2Ugc3RhdHVlIGhhbmQpXHJcbiAgICAgIC8vIDU4QjcgPSBMYXNlciBFeWUgKHByb21pc2UgbGlvbiBwaGFzZSlcclxuICAgICAgLy8gNThDMSA9IERhcmtlc3QgRGFuY2UgKG9yYWNsZSB0YW5rIGp1bXAgKyBrbm9ja2JhY2sgaW4gYmVnaW5uaW5nIGFuZCB0cmlwbGUgYXBvYylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU4OUEnLCAnNThCNicsICc1OEI3JywgJzU4QzEnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIE9yYWNsZSBTaGFkb3dleWUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNThEMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogd2FybmluZyBmb3IgdGFraW5nIERpYW1vbmQgRmxhc2ggKDVGQTEpIHN0YWNrIG9uIHlvdXIgb3duP1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ2xvdWREZWNrRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAxJzogJzVGQUYnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDInOiAnNUZCMicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMyc6ICc1RkNEJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA0JzogJzVGQ0UnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDUnOiAnNUZDRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNic6ICc1RkY4JywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA3JzogJzYxNTknLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXJ0aWN1bGF0ZWQgQml0IEFldGhlcmlhbCBCdWxsZXQnOiAnNUZBQicsIC8vIGJpdCBsYXNlcnMgZHVyaW5nIGFsbCBwaGFzZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAxJzogJzVGQ0InLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAyJzogJzVGQ0MnLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggQ2xhdyBTd2lwZSBMZWZ0JzogJzVGQzInLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIFJpZ2h0JzogJzVGQzMnLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMSc6ICc1RkQxJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQXVyaSBDeWNsb25lIDInOiAnNUZEMicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZEV4IEFpcnNoaXBcXCdzIEJhbmUgMSc6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRDMnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IFRhbmsgTGFzZXJzJzogJzVGQzgnLCAvLyBjbGVhdmluZyB5ZWxsb3cgbGFzZXJzIG9uIHRvcCB0d28gZW5taXR5XHJcbiAgICAnRGlhbW9uZEV4IEhvbWluZyBMYXNlcic6ICc1RkM0JywgLy8gQWRhbWFudGUgUHVyZ2Ugc3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggRmxvb2QgUmF5JzogJzVGQzcnLCAvLyBcImxpbWl0IGN1dFwiIGNsZWF2ZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZEV4IFZlcnRpY2FsIENsZWF2ZSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVGRDAnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVjayxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBBcnRzJzogJzVGRTMnLCAvLyBBdXJpIEFydHMgZGFzaGVzXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBJbml0aWFsJzogJzVGRTEnLCAvLyBpbml0aWFsIGNpcmNsZSBvZiBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBDaGFzaW5nJzogJzVGRTInLCAvLyBmb2xsb3d1cCBjaXJjbGVzIGZyb20gRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFldGhlcmlhbCBCdWxsZXQnOiAnNUZENScsIC8vIGJpdCBsYXNlcnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIExlZnQnOiAnNUZEOScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkRBJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMSc6ICc1RkU2JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMic6ICc1RkU3JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZFOCcsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gSG9taW5nIExhc2VyJzogJzVGREInLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kIFdlYXBvbiBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkU1JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DYXN0cnVtTWFyaW51bUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSc6ICc1QkQzJywgLy8gRW1lcmFsZCBCZWFtIGluaXRpYWwgY29uYWxcclxuICAgICdFbWVyYWxkRXggUGhvdG9uIExhc2VyIDEnOiAnNTU3QicsIC8vIEVtZXJhbGQgQmVhbSBpbnNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAyJzogJzU1N0QnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXkgMSc6ICc1NTdBJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXkgMic6ICc1NTc5JywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkRXggRXhwbG9zaW9uJzogJzU1OTYnLCAvLyBNYWdpdGVrIE1pbmUgZXhwbG9zaW9uXHJcbiAgICAnRW1lcmFsZEV4IFRlcnRpdXMgVGVybWludXMgRXN0IEluaXRpYWwnOiAnNTVDRCcsIC8vIHN3b3JkIGluaXRpYWwgcHVkZGxlc1xyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBFeHBsb3Npb24nOiAnNTVDRScsIC8vIHN3b3JkIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkRXggQWlyYm9ybmUgRXhwbG9zaW9uJzogJzU1QkQnLCAvLyBleGFmbGFyZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDEnOiAnNTVENCcsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNpZGVzY2F0aGUgMic6ICc1NUQ1JywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkRXggU2hvdHMgRmlyZWQnOiAnNTVCNycsIC8vIHJhbmsgYW5kIGZpbGUgc29sZGllcnNcclxuICAgICdFbWVyYWxkRXggU2VjdW5kdXMgVGVybWludXMgRXN0JzogJzU1Q0InLCAvLyBkcm9wcGVkICsgYW5kIHggaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkRXggRXhwaXJlJzogJzU1RDEnLCAvLyBncm91bmQgYW9lIG9uIGJvc3MgXCJnZXQgb3V0XCJcclxuICAgICdFbWVyYWxkRXggQWlyZSBUYW0gU3Rvcm0nOiAnNTVEMCcsIC8vIGV4cGFuZGluZyByZWQgYW5kIGJsYWNrIGdyb3VuZCBhb2VcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGRFeCBEaXZpZGUgRXQgSW1wZXJhJzogJzU1RDknLCAvLyBub24tdGFuayBwcm90ZWFuIHNwcmVhZFxyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDEnOiAnNTVDNCcsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDInOiAnNTVDNScsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDMnOiAnNTVDNicsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDQnOiAnNTVDNycsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5JzogJzRGOUQnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAxJzogJzU1MzQnLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAyJzogJzU1MzYnLCAvLyBFbWVyYWxkIEJlYW0gbWlkZGxlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAzJzogJzU1MzgnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAxJzogJzU1MzInLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDInOiAnNTUzMycsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gTWFnbmV0aWMgTWluZSBFeHBsb3Npb24nOiAnNUIwNCcsIC8vIHJlcHVsc2luZyBtaW5lIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDEnOiAnNTUzRicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAyJzogJzU1NDAnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMyc6ICc1NTQxJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDQnOiAnNTU0MicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gQml0IFN0b3JtJzogJzU1NEEnLCAvLyBcImdldCBpblwiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyJzogJzU1M0MnLCAvLyBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHVsc2UgTGFzZXInOiAnNTU0OCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW5lcmd5IEFldGhlcm9wbGFzbSc6ICc1NTUxJywgLy8gaGl0dGluZyBhIGdsb3d5IG9yYlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgR3JvdW5kJzogJzU1NkYnLCAvLyBwYXJ0eSB0YXJnZXRlZCBncm91bmQgY29uZXNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0JzogJzRCM0UnLCAvLyBncm91bmQgY2lyY2xlIGR1cmluZyBhcnJvdyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NTZBJywgLy8gWCAvICsgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBUZXJ0aXVzIFRlcm1pbnVzIEVzdCc6ICc1NTZEJywgLy8gdHJpcGxlIHN3b3Jkc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNob3RzIEZpcmVkJzogJzU1NUYnLCAvLyBsaW5lIGFvZXMgZnJvbSBzb2xkaWVyc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMSc6ICc1NTRFJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDInOiAnNTU3MCcsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTUzRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEdldHRpbmcga25vY2tlZCBpbnRvIGEgd2FsbCBmcm9tIHRoZSBhcnJvdyBoZWFkbWFya2VyLlxyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QgV2FsbCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NTYzJywgJzU1NjQnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBIYWRlcyBFeFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTWluc3RyZWxzQmFsbGFkSGFkZXNzRWxlZ3ksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAyJzogJzQ3QUEnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAzJzogJzQ3RTQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCA0JzogJzQ3RTUnLFxyXG4gICAgLy8gRXZlcnlib2R5IHN0YWNrcyBpbiBnb29kIGZhaXRoIGZvciBCYWQgRmFpdGgsIHNvIGRvbid0IGNhbGwgaXQgYSBtaXN0YWtlLlxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDEnOiAnNDdBRCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMic6ICc0N0IwJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAzJzogJzQ3QUUnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDQnOiAnNDdBRicsXHJcbiAgICAnSGFkZXNFeCBCcm9rZW4gRmFpdGgnOiAnNDdCMicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBTcGVhcic6ICc0N0I2JyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIENoYWtyYW0nOiAnNDdCNScsXHJcbiAgICAnSGFkZXNFeCBGb3JrZWQgTGlnaHRuaW5nJzogJzQ3QzknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDEnOiAnNDdGMScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMic6ICc0N0YyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIYWRlc0V4IENvbWV0JzogJzQ3QjknLCAvLyBtaXNzZWQgdG93ZXJcclxuICAgICdIYWRlc0V4IEFuY2llbnQgRXJ1cHRpb24nOiAnNDdEMycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMSc6ICc0N0VDJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAyJzogJzQ3RUQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFN0cmVhbSc6ICc0N0VBJyxcclxuICAgICdIYWRlc0V4IERlYWQgU3BhY2UnOiAnNDdFRScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgSW5pdGlhbCc6ICc0N0E5JyxcclxuICAgICdIYWRlc0V4IFJhdmVub3VzIEFzc2F1bHQnOiAnKD86NDdBNnw0N0E3KScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZsYW1lIDEnOiAnNDdDNicsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAxJzogJzQ3QzQnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMic6ICc0N0RGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ1NoYWRvdyBvZiB0aGUgQW5jaWVudHMnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRGFyayA9IGRhdGEuaGFzRGFyayB8fCBbXTtcclxuICAgICAgICBkYXRhLmhhc0RhcmsucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRGFyayBJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgdHlwZTogJzIyJywgaWQ6ICc0N0JBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBEb24ndCBibGFtZSBwZW9wbGUgd2hvIGRvbid0IGhhdmUgdGV0aGVycy5cclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzRGFyayAmJiBkYXRhLmhhc0RhcmsuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJvc3MgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiBbJ0lnZXlvcmhtXFwncyBTaGFkZScsICdMYWhhYnJlYVxcJ3MgU2hhZGUnXSwgaWQ6ICcwMDBFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdCb3NzZXMgVG9vIENsb3NlJyxcclxuICAgICAgICAgIGRlOiAnQm9zc2VzIHp1IE5haGUnLFxyXG4gICAgICAgICAgZnI6ICdCb3NzIHRyb3AgcHJvY2hlcycsXHJcbiAgICAgICAgICBqYTogJ+ODnOOCuei/keOBmeOBjuOCiycsXHJcbiAgICAgICAgICBjbjogJ0JPU1PpnaDlpKrov5HkuoYnLFxyXG4gICAgICAgICAga286ICfsq4Trk6TsnbQg64SI66y0IOqwgOq5jOybgCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEZWF0aCBTaHJpZWsnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDdDQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA9IGRhdGEuaGFzRG9vbSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0Rvb20pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBIYWRlcyBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUR5aW5nR2FzcCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSGFkZXMgQmFkIEZhaXRoIDEnOiAnNDE0QicsXHJcbiAgICAnSGFkZXMgQmFkIEZhaXRoIDInOiAnNDE0QycsXHJcbiAgICAnSGFkZXMgRGFyayBFcnVwdGlvbic6ICc0MTUyJyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3ByZWFkIDEnOiAnNDE1NicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFNwcmVhZCAyJzogJzQxNTcnLFxyXG4gICAgJ0hhZGVzIEJyb2tlbiBGYWl0aCc6ICc0MTRFJyxcclxuICAgICdIYWRlcyBIZWxsYm9ybiBZYXdwJzogJzQxNkYnLFxyXG4gICAgJ0hhZGVzIFB1cmdhdGlvbic6ICc0MTcyJyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3RyZWFtJzogJzQxNUMnLFxyXG4gICAgJ0hhZGVzIEFlcm8nOiAnNDU5NScsXHJcbiAgICAnSGFkZXMgRWNobyAxJzogJzQxNjMnLFxyXG4gICAgJ0hhZGVzIEVjaG8gMic6ICc0MTY0JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0hhZGVzIE5ldGhlciBCbGFzdCc6ICc0MTYzJyxcclxuICAgICdIYWRlcyBSYXZlbm91cyBBc3NhdWx0JzogJzQxNTgnLFxyXG4gICAgJ0hhZGVzIEFuY2llbnQgRGFya25lc3MnOiAnNDU5MycsXHJcbiAgICAnSGFkZXMgRHVhbCBTdHJpa2UnOiAnNDE2MicsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJbm5vY2VuY2UgRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vRXggRHVlbCBEZXNjZW50JzogJzNFRDInLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAxJzogJzNFRTAnLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAyJzogJzNFQ0MnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMSc6ICczRURFJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDInOiAnM0VERicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDEnOiAnM0VEMycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDInOiAnM0VENCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDMnOiAnM0VENScsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDQnOiAnM0VENicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDUnOiAnM0VGQicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDYnOiAnM0VGQycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDcnOiAnM0VGRCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDgnOiAnM0VGRScsXHJcbiAgICAnSW5ub0V4IEhvbHkgVHJpbml0eSc6ICczRURCJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAxJzogJzNFRDcnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDInOiAnM0VEOCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMyc6ICczRUQ5JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA0JzogJzNFREEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDUnOiAnM0VGRicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNic6ICczRjAwJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA3JzogJzNGMDEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDgnOiAnM0YwMicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMSc6ICczRUU2JyxcclxuICAgICdJbm5vRXggR29kIFJheSAyJzogJzNFRTcnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDMnOiAnM0VFOCcsXHJcbiAgICAnSW5ub0V4IEV4cGxvc2lvbic6ICczRUYwJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIElubm9jZW5jZSBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNyb3duT2ZUaGVJbW1hY3VsYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vIERheWJyZWFrJzogJzNFOUQnLFxyXG4gICAgJ0lubm8gSG9seSBUcmluaXR5JzogJzNFQjMnLFxyXG5cclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDEnOiAnM0VCNicsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAyJzogJzNFQjgnLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMyc6ICczRUNCJyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDQnOiAnM0VCNycsXHJcblxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAxJzogJzNFQjEnLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAyJzogJzNFQjInLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAzJzogJzNFRjknLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSA0JzogJzNFRkEnLFxyXG5cclxuICAgICdJbm5vIEdvZCBSYXkgMSc6ICczRUJEJyxcclxuICAgICdJbm5vIEdvZCBSYXkgMic6ICczRUJFJyxcclxuICAgICdJbm5vIEdvZCBSYXkgMyc6ICczRUJGJyxcclxuICAgICdJbm5vIEdvZCBSYXkgNCc6ICczRUMwJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gNUNDQS81Q0NCLzVDQ0MsIFdhdGVyc3BvdXQgPSA1Q0QxXHJcblxyXG4vLyBMZXZpYXRoYW4gVW5yZWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyVW5yZWFsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdMZXZpVW4gR3JhbmQgRmFsbCc6ICc1Q0RGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlVbiBIeWRyb3Nob3QnOiAnNUNENScsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpVW4gRHJlYWRzdG9ybSc6ICc1Q0Q2JywgLy8gV2F2ZXRvb3RoIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgSHlzdGVyaWEgZWZmZWN0XHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTGV2aVVuIEJvZHkgU2xhbSc6ICc1Q0QyJywgLy8gbGV2aSBzbGFtIHRoYXQgdGlsdHMgdGhlIGJvYXRcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAxJzogJzVDREInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMic6ICc1Q0UzJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDMnOiAnNUNFOCcsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSA0JzogJzVDRTknLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpVW4gRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpVW4gSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aVVuIEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVDRDInIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiB0YWtpbmcgdHdvIGRpZmZlcmVudCBIaWdoLVBvd2VyZWQgSG9taW5nIExhc2VycyAoNEFEOClcclxuLy8gVE9ETzogY291bGQgYmxhbWUgdGhlIHRldGhlcmVkIHBsYXllciBmb3IgV2hpdGUgQWdvbnkgLyBXaGl0ZSBGdXJ5IGZhaWx1cmVzP1xyXG5cclxuLy8gUnVieSBXZWFwb24gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2luZGVyRHJpZnRFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdSdWJ5RXggUnVieSBCaXQgTWFnaXRlayBSYXknOiAnNEFEMicsIC8vIGxpbmUgYW9lcyBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAxJzogJzRBRDMnLCAvLyBpbml0aWFsIGV4cGxvc2lvbiBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAyJzogJzRCMkYnLCAvLyBmb2xsb3d1cCBoZWxpY29jbGF3IGV4cGxvc2lvbnNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMyc6ICc0RDA0JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA0JzogJzREMDUnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDUnOiAnNEFDRCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNic6ICc0QUNFJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBVbmRlcm1pbmUnOiAnNEFEMCcsIC8vIGdyb3VuZCBhb2VzIHVuZGVyIHRoZSByYXZlbnNjbGF3IHBhdGNoZXNcclxuICAgICdSdWJ5RXggUnVieSBSYXknOiAnNEIwMicsIC8vIGZyb250YWwgbGFzZXJcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEnOiAnNEFEOScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMic6ICc0QURBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAzJzogJzRBREQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDQnOiAnNEFERScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNSc6ICc0QURGJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA2JzogJzRBRTAnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDcnOiAnNEFFMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgOCc6ICc0QUUyJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA5JzogJzRBRTMnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEwJzogJzRBRTQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDExJzogJzRBRTUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEyJzogJzRBRTYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEzJzogJzRBRTcnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE0JzogJzRBRTgnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE1JzogJzRBRTknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE2JzogJzRBRUEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE3JzogJzRFNkInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE4JzogJzRFNkMnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE5JzogJzRFNkQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDIwJzogJzRFNkUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDIxJzogJzRFNkYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDIyJzogJzRFNzAnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMSc6ICc0QjA1JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAyJzogJzRCMDYnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDMnOiAnNEIwNycsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gNCc6ICc0QjA4JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biA1JzogJzRET0QnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IE1ldGVvciBCdXJzdCc6ICc0QUYyJywgLy8gbWV0ZW9yIGV4cGxvZGluZ1xyXG4gICAgJ1J1YnlFeCBCcmFkYW1hbnRlJzogJzRFMzgnLCAvLyBoZWFkbWFya2VycyB3aXRoIGxpbmUgYW9lc1xyXG4gICAgJ1J1YnlFeCBDb21ldCBIZWF2eSBJbXBhY3QnOiAnNEFGNicsIC8vIGxldHRpbmcgYSB0YW5rIGNvbWV0IGxhbmRcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdSdWJ5RXggUnVieSBTcGhlcmUgQnVyc3QnOiAnNEFDQicsIC8vIGV4cGxvZGluZyB0aGUgcmVkIG1pbmVcclxuICAgICdSdWJ5RXggTHVuYXIgRHluYW1vJzogJzRFQjAnLCAvLyBcImdldCBpblwiIGZyb20gUmF2ZW4ncyBJbWFnZVxyXG4gICAgJ1J1YnlFeCBJcm9uIENoYXJpb3QnOiAnNEVCMScsIC8vIFwiZ2V0IG91dFwiIGZyb20gUmF2ZW4ncyBJbWFnZVxyXG4gICAgJ1J1YnlFeCBIZWFydCBJbiBUaGUgTWFjaGluZSc6ICc0QUZBJywgLy8gV2hpdGUgQWdvbnkvRnVyeSBza3VsbCBoaXR0aW5nIHBsYXllcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1J1YnlFeCBIb21pbmcgTGFzZXJzJzogJzRBRDYnLCAvLyBzcHJlYWQgbWFya2VycyBkdXJpbmcgY3V0IGFuZCBydW5cclxuICAgICdSdWJ5RXggTWV0ZW9yIFN0cmVhbSc6ICc0RTY4JywgLy8gc3ByZWFkIG1hcmtlcnMgZHVyaW5nIFAyXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdSdWJ5RXggSHlzdGVyaWEnOiAnMTI4JywgLy8gTmVnYXRpdmUgQXVyYSBsb29rYXdheSBmYWlsdXJlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1J1YnlFeCBTY3JlZWNoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEFFRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBpbnRvIHdhbGwnLFxyXG4gICAgICAgICAgICBkZTogJ1LDvGNrc3Rvw58gaW4gZGllIFdhbmQnLFxyXG4gICAgICAgICAgICBqYTogJ+WjgeOBuOODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA6Iez5aKZJyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFJ1YnkgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieSBSYXZlbnNjbGF3JzogJzRBOTMnLCAvLyBjZW50ZXJlZCBjaXJjbGUgYW9lIGZvciByYXZlbnNjbGF3XHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAxJzogJzRBOUEnLCAvLyBpbml0aWFsIGV4cGxvc2lvbiBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJFJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAzJzogJzRBOTQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA0JzogJzRBOTUnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA1JzogJzREMDInLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA2JzogJzREMDMnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBSdWJ5IFJheSc6ICc0QUM2JywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnkgVW5kZXJtaW5lJzogJzRBOTcnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMSc6ICc0RTY5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMic6ICc0RTZBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMyc6ICc0QUExJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNCc6ICc0QUEyJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNSc6ICc0QUEzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNic6ICc0QUE0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNyc6ICc0QUE1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOCc6ICc0QUE2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOSc6ICc0QUE3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMTAnOiAnNEMyMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDExJzogJzRDMkEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IENvbWV0IEJ1cnN0JzogJzRBQjQnLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieSBCcmFkYW1hbnRlJzogJzRBQkMnLCAvLyBoZWFkbWFya2VycyB3aXRoIGxpbmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieSBIb21pbmcgTGFzZXInOiAnNEFDNScsIC8vIHNwcmVhZCBtYXJrZXJzIGluIFAxXHJcbiAgICAnUnVieSBNZXRlb3IgU3RyZWFtJzogJzRFNjcnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMlxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBTaGl2YSBVbnJlYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnNTM3QicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnNTM3NicsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJzUzNzUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICc1Mzc4JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnNTM2RicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICc1Mzc5JyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFuayBidXN0ZXIuXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICc1MzczJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDUzN0Egb24geW91LCBidXQgaXQgaGFzIGFuIHVua25vd24gbmFtZS5cclxuICAgICAgLy8gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgYnV0IGZvciBhIHNob3J0ZXIgZHVyYXRpb24uXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgPiAyMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEYW5jaW5nUGxhZ3VlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhIFdvb2RcXCdzIEVtYnJhY2UnOiAnM0Q1MCcsXHJcbiAgICAvLyAnVGl0YW5pYSBGcm9zdCBSdW5lJzogJzNENEUnLFxyXG4gICAgJ1RpdGFuaWEgR2VudGxlIEJyZWV6ZSc6ICczRjgzJyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAxJzogJzNENTUnLFxyXG4gICAgJ1RpdGFuaWEgUHVja1xcJ3MgUmVidWtlJzogJzNENTgnLFxyXG4gICAgJ1RpdGFuaWEgTGVhZnN0b3JtIDInOiAnM0UwMycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMSc6ICczRDVEJyxcclxuICAgICdUaXRhbmlhIFBoYW50b20gUnVuZSAyJzogJzNENUUnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5pYSBEaXZpbmF0aW9uIFJ1bmUnOiAnM0Q1QicsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuaWFFeCBXb29kXFwncyBFbWJyYWNlJzogJzNEMkYnLFxyXG4gICAgLy8gJ1RpdGFuaWFFeCBGcm9zdCBSdW5lJzogJzNEMkInLFxyXG4gICAgJ1RpdGFuaWFFeCBHZW50bGUgQnJlZXplJzogJzNGODInLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMSc6ICczRDM5JyxcclxuICAgICdUaXRhbmlhRXggUHVja1xcJ3MgUmVidWtlJzogJzNENDMnLFxyXG4gICAgJ1RpdGFuaWFFeCBXYWxsb3AnOiAnM0QzQicsXHJcbiAgICAnVGl0YW5pYUV4IExlYWZzdG9ybSAyJzogJzNENDknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWFFeCBQaGFudG9tIFJ1bmUgMSc6ICczRDRDJyxcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDInOiAnM0Q0RCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIFRPRE86IFRoaXMgY291bGQgbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiB3aXRoIHRoZSB0ZXRoZXI/XHJcbiAgICAnVGl0YW5pYUV4IFRodW5kZXIgUnVuZSc6ICczRDI5JyxcclxuICAgICdUaXRhbmlhRXggRGl2aW5hdGlvbiBSdW5lJzogJzNENEEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gVW5yZWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbFVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNThGRScsXHJcbiAgICAnVGl0YW5VbiBCdXJzdCc6ICc1QURGJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhblVuIExhbmRzbGlkZSc6ICc1QURDJyxcclxuICAgICdUaXRhblVuIEdhb2xlciBMYW5kc2xpZGUnOiAnNTkwMicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhblVuIFJvY2sgQnVzdGVyJzogJzU4RjYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBNb3VudGFpbiBCdXN0ZXInOiAnNThGNycsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWVtb3JpYU1pc2VyYUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMSc6ICc0Q0QyJyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDInOiAnNENEMycsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAzJzogJzRDRDQnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgNCc6ICc0Q0Q1JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDUnOiAnNENENicsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMSc6ICc0Q0I1JyxcclxuICAgICdWYXJpc0V4IElnbmlzIEVzdCAyJzogJzRDQzUnLFxyXG4gICAgJ1ZhcmlzRXggVmVudHVzIEVzdCAxJzogJzRDQzcnLFxyXG4gICAgJ1ZhcmlzRXggVmVudHVzIEVzdCAyJzogJzRDQzgnLFxyXG4gICAgJ1ZhcmlzRXggQXNzYXVsdCBDYW5ub24nOiAnNENFNScsXHJcbiAgICAnVmFyaXNFeCBGb3J0aXVzIFJvdGF0aW5nJzogJzRDRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gRG9uJ3QgaGl0IHRoZSBzaGllbGRzIVxyXG4gICAgJ1ZhcmlzRXggUmVwYXknOiAnNENERCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgdGhlIFwicHJvdGVhblwiIGZvcnRpdXMuXHJcbiAgICAnVmFyaXNFeCBGb3J0aXVzIFByb3RlYW4nOiAnNENFNycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdWYXJpc0V4IE1hZ2l0ZWsgQnVyc3QnOiAnNENERicsXHJcbiAgICAnVmFyaXNFeCBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICc0Q0VEJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVmFyaXNFeCBUZXJtaW51cyBFc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNENCNCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEYxNi80RjE3KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEYxOC80RjE5LCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RjFBLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IG1pc3NpbmcgYSB0b3dlcj9cclxuXHJcbi8vIE5vdGU6IERlbGliZXJhdGVseSBub3QgaW5jbHVkaW5nIHB5cmV0aWMgZGFtYWdlIGFzIGFuIGVycm9yLlxyXG4vLyBOb3RlOiBJdCBkb2Vzbid0IGFwcGVhciB0aGF0IHRoZXJlJ3MgYW55IHdheSB0byB0ZWxsIHdobyBmYWlsZWQgdGhlIGN1dHNjZW5lLlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MIFNvbGVtbiBDb25maXRlb3InOiAnNEYyQScsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBJbic6ICc0RjEwJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RjExJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNEInLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBJbic6ICc0RjRDJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgU2hpbmluZyBXYXZlJzogJzRGMjYnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTCBDYXV0ZXJpemUnOiAnNEYyNScsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAxJzogJzRGMUUnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBpbml0aWFsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAyJzogJzRGMUYnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgICAnV09MIEZsYXJlIEJyZWF0aCc6ICc0RjI0JyxcclxuICAgICdXT0wgRGVjaW1hdGlvbic6ICc0RjIzJyxcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTCBEZWVwIEZyZWV6ZSc6ICc0RTYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0wgVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhFJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRFRjcvNEVGOCh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRFRjkvNEVGQSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEVGQywgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBBYnNvbHV0ZSBIb2x5IHNob3VsZCBiZSBzaGFyZWQ/XHJcbi8vIFRPRE86IGludGVyc2VjdGluZyBicmltc3RvbmVzP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTEV4IFNvbGVtbiBDb25maXRlb3InOiAnNEYwQycsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIEluJzogJzRFRjInLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEVGMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNDknLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0xFeCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEEnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IFNoaW5pbmcgV2F2ZSc6ICc0RjA4JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0xFeCBDYXV0ZXJpemUnOiAnNEYwNycsXHJcbiAgICAnV09MRXggQnJpbXN0b25lIEVhcnRoJzogJzRGMDAnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdXT0xFeCBBYnNvbHV0ZSBTdG9uZSBJSUknOiAnNEVFQicsIC8vIHByb3RlYW4gd2F2ZSBpbWJ1ZWQgbWFnaWNcclxuICAgICdXT0xFeCBGbGFyZSBCcmVhdGgnOiAnNEYwNicsIC8vIHRldGhlciBmcm9tIHN1bW1vbmVkIGJhaGFtdXRzXHJcbiAgICAnV09MRXggUGVyZmVjdCBEZWNpbWF0aW9uJzogJzRGMDUnLCAvLyBzbW4vd2FyIHBoYXNlIG1hcmtlclxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV09MRXggRGVlcCBGcmVlemUnOiAnNEU2JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBCbGl6emFyZCBJSUlcclxuICAgICdXT0xFeCBEYW1hZ2UgRG93bic6ICcyNzQnLCAvLyBmYWlsaW5nIEFic29sdXRlIEZsYXNoXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ1dvbEV4IEthdG9uIFNhbiBTaGFyZSc6ICc0RUZFJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEZGJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVG93ZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjA0JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICBlbjogJ01pc3NlZCBUb3dlcicsXHJcbiAgICAgICAgICBkZTogJ1R1cm0gdmVycGFzc3QnLFxyXG4gICAgICAgICAgZnI6ICdUb3VyIG1hbnF1w6llJyxcclxuICAgICAgICAgIGphOiAn5aGU44KS6LiP44G+44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgIGNuOiAn5rKh6Lip5aGUJyxcclxuICAgICAgICAgIGtvOiAn7J6l7YyQIOyLpOyImCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBIYWxsb3dlZCBHcm91bmQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjQ0JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgcmVhc29uOiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZvciBCZXJzZXJrIGFuZCBEZWVwIERhcmtzaWRlXHJcbiAgICAgIGlkOiAnV09MRXggTWlzc2VkIEludGVycnVwdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1MTU2JywgJzUxNTgnXSB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgcmVhc29uOiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBGSVggbHVtaW5vdXMgYWV0aGVyb3BsYXNtIHdhcm5pbmcgbm90IHdvcmtpbmdcclxuLy8gVE9ETzogRklYIGRvbGwgZGVhdGggbm90IHdvcmtpbmdcclxuLy8gVE9ETzogZmFpbGluZyBoYW5kIG9mIHBhaW4vcGFydGluZyAoY2hlY2sgZm9yIGhpZ2ggZGFtYWdlPylcclxuLy8gVE9ETzogbWFrZSBzdXJlIGV2ZXJ5Ym9keSB0YWtlcyBleGFjdGx5IG9uZSBwcm90ZWFuIChyYXRoZXIgdGhhbiB3YXRjaGluZyBkb3VibGUgaGl0cylcclxuLy8gVE9ETzogdGh1bmRlciBub3QgaGl0dGluZyBleGFjdGx5IDI/XHJcbi8vIFRPRE86IHBlcnNvbiB3aXRoIHdhdGVyL3RodW5kZXIgZGVidWZmIGR5aW5nXHJcbi8vIFRPRE86IGJhZCBuaXNpIHBhc3NcclxuLy8gVE9ETzogZmFpbGVkIGdhdmVsIG1lY2hhbmljXHJcbi8vIFRPRE86IGRvdWJsZSByb2NrZXQgcHVuY2ggbm90IGhpdHRpbmcgZXhhY3RseSAyPyAob3IgdGFua3MpXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHNsdWRnZSBwdWRkbGVzIGJlZm9yZSBoaWRkZW4gbWluZT9cclxuLy8gVE9ETzogaGlkZGVuIG1pbmUgZmFpbHVyZT9cclxuLy8gVE9ETzogZmFpbHVyZXMgb2Ygb3JkYWluZWQgbW90aW9uIC8gc3RpbGxuZXNzXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzZXZlcml0eSAodGV0aGVycylcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNvbGlkYXJpdHkgKHNoYXJlZCBzZW50ZW5jZSlcclxuLy8gVE9ETzogb3JkYWluZWQgY2FwaXRhbCBwdW5pc2htZW50IGhpdHRpbmcgbm9uLXRhbmtzXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRXBpY09mQWxleGFuZGVyVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RFQSBTbHVpY2UnOiAnNDlCMScsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAxJzogJzQ4MjQnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMic6ICc0OUI1JyxcclxuICAgICdURUEgU3BpbiBDcnVzaGVyJzogJzRBNzInLFxyXG4gICAgJ1RFQSBTYWNyYW1lbnQnOiAnNDg1RicsXHJcbiAgICAnVEVBIFJhZGlhbnQgU2FjcmFtZW50JzogJzQ4ODYnLFxyXG4gICAgJ1RFQSBBbG1pZ2h0eSBKdWRnbWVudCc6ICc0ODkwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdURUEgSGF3ayBCbGFzdGVyJzogJzQ4MzAnLFxyXG4gICAgJ1RFQSBDaGFrcmFtJzogJzQ4NTUnLFxyXG4gICAgJ1RFQSBFbnVtZXJhdGlvbic6ICc0ODUwJyxcclxuICAgICdURUEgQXBvY2FseXB0aWMgUmF5JzogJzQ4NEMnLFxyXG4gICAgJ1RFQSBQcm9wZWxsZXIgV2luZCc6ICc0ODMyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDEnOiAnNDlCNicsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMic6ICc0ODI1JyxcclxuICAgICdURUEgRmx1aWQgU3dpbmcnOiAnNDlCMCcsXHJcbiAgICAnVEVBIEZsdWlkIFN0cmlrZSc6ICc0OUI3JyxcclxuICAgICdURUEgSGlkZGVuIE1pbmUnOiAnNDg1MicsXHJcbiAgICAnVEVBIEFscGhhIFN3b3JkJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBGbGFyZXRocm93ZXInOiAnNDg2QicsXHJcbiAgICAnVEVBIENoYXN0ZW5pbmcgSGVhdCc6ICc0QTgwJyxcclxuICAgICdURUEgRGl2aW5lIFNwZWFyJzogJzRBODInLFxyXG4gICAgJ1RFQSBPcmRhaW5lZCBQdW5pc2htZW50JzogJzQ4OTEnLFxyXG4gICAgLy8gT3B0aWNhbCBTcHJlYWRcclxuICAgICdURUEgSW5kaXZpZHVhbCBSZXByb2JhdGlvbic6ICc0ODhDJyxcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAvLyBPcHRpY2FsIFN0YWNrXHJcbiAgICAnVEVBIENvbGxlY3RpdmUgUmVwcm9iYXRpb24nOiAnNDg4RCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBcInRvbyBtdWNoIGx1bWlub3VzIGFldGhlcm9wbGFzbVwiXHJcbiAgICAgIC8vIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgdGFyZ2V0IGV4cGxvZGVzLCBoaXR0aW5nIG5lYXJieSBwZW9wbGVcclxuICAgICAgLy8gYnV0IGFsc28gdGhlbXNlbHZlcy5cclxuICAgICAgaWQ6ICdURUEgRXhoYXVzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODFGJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudGFyZ2V0ID09PSBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnbHVtaW5vdXMgYWV0aGVyb3BsYXNtJyxcclxuICAgICAgICAgICAgZGU6ICdMdW1pbmlzemVudGVzIMOEdGhlcm9wbGFzbWEnLFxyXG4gICAgICAgICAgICBmcjogJ8OJdGjDqXJvcGxhc21hIGx1bWluZXV4JyxcclxuICAgICAgICAgICAgamE6ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgICBjbjogJ+WFieaAp+eIhumbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBEcm9wc3knLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTIxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGV0aGVyIFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnSmFnZCBEb2xsJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXIgPSBkYXRhLmphZ2RUZXRoZXIgfHwge307XHJcbiAgICAgICAgZGF0YS5qYWdkVGV0aGVyW21hdGNoZXMuc291cmNlSWRdID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBSZWR1Y2libGUgQ29tcGxleGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODIxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgLy8gVGhpcyBtYXkgYmUgdW5kZWZpbmVkLCB3aGljaCBpcyBmaW5lLlxyXG4gICAgICAgICAgbmFtZTogZGF0YS5qYWdkVGV0aGVyID8gZGF0YS5qYWdkVGV0aGVyW21hdGNoZXMuc291cmNlSWRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RvbGwgRGVhdGgnLFxyXG4gICAgICAgICAgICBkZTogJ1B1cHBlIFRvdCcsXHJcbiAgICAgICAgICAgIGZyOiAnUG91cMOpZSBtb3J0ZScsXHJcbiAgICAgICAgICAgIGphOiAn44OJ44O844Or44GM5q2744KT44GgJyxcclxuICAgICAgICAgICAgY246ICfmta7lo6vlvrfmrbvkuqEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJhaW5hZ2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyNycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLnBhcnR5LmlzVGFuayhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlID0gZGF0YS5oYXNUaHJvdHRsZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZSBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA9IGRhdGEuaGFzVGhyb3R0bGUgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNUaHJvdHRsZSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEJhbGxvb24gUG9wcGluZy4gIEl0IHNlZW1zIGxpa2UgdGhlIHBlcnNvbiB3aG8gcG9wcyBpdCBpcyB0aGVcclxuICAgICAgLy8gZmlyc3QgcGVyc29uIGxpc3RlZCBkYW1hZ2Utd2lzZSwgc28gdGhleSBhcmUgbGlrZWx5IHRoZSBjdWxwcml0LlxyXG4gICAgICBpZDogJ1RFQSBPdXRidXJzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODJBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IGZpbGUwIGZyb20gJy4vMDAtbWlzYy9idWZmcy5qcyc7XG5pbXBvcnQgZmlsZTEgZnJvbSAnLi8wMC1taXNjL2dlbmVyYWwuanMnO1xuaW1wb3J0IGZpbGUyIGZyb20gJy4vMDAtbWlzYy90ZXN0LmpzJztcbmltcG9ydCBmaWxlMyBmcm9tICcuLzAyLWFyci90cmlhbC9pZnJpdC1ubS5qcyc7XG5pbXBvcnQgZmlsZTQgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tbm0uanMnO1xuaW1wb3J0IGZpbGU1IGZyb20gJy4vMDItYXJyL3RyaWFsL2xldmktZXguanMnO1xuaW1wb3J0IGZpbGU2IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWhtLmpzJztcbmltcG9ydCBmaWxlNyBmcm9tICcuLzAyLWFyci90cmlhbC9zaGl2YS1leC5qcyc7XG5pbXBvcnQgZmlsZTggZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4taG0uanMnO1xuaW1wb3J0IGZpbGU5IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLWV4LmpzJztcbmltcG9ydCBmaWxlMTAgZnJvbSAnLi8wMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkuanMnO1xuaW1wb3J0IGZpbGUxMSBmcm9tICcuLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzJztcbmltcG9ydCBmaWxlMTIgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLmpzJztcbmltcG9ydCBmaWxlMTMgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC5qcyc7XG5pbXBvcnQgZmlsZTE0IGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMnO1xuaW1wb3J0IGZpbGUxNSBmcm9tICcuLzAzLWh3L3JhaWQvYTEybi5qcyc7XG5pbXBvcnQgZmlsZTE2IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28uanMnO1xuaW1wb3J0IGZpbGUxNyBmcm9tICcuLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMnO1xuaW1wb3J0IGZpbGUxOCBmcm9tICcuLzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS5qcyc7XG5pbXBvcnQgZmlsZTE5IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLmpzJztcbmltcG9ydCBmaWxlMjAgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMnO1xuaW1wb3J0IGZpbGUyMSBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LmpzJztcbmltcG9ydCBmaWxlMjIgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RoZV9idXJuLmpzJztcbmltcG9ydCBmaWxlMjMgZnJvbSAnLi8wNC1zYi9yYWlkL28xbi5qcyc7XG5pbXBvcnQgZmlsZTI0IGZyb20gJy4vMDQtc2IvcmFpZC9vMm4uanMnO1xuaW1wb3J0IGZpbGUyNSBmcm9tICcuLzA0LXNiL3JhaWQvbzNuLmpzJztcbmltcG9ydCBmaWxlMjYgZnJvbSAnLi8wNC1zYi9yYWlkL280bi5qcyc7XG5pbXBvcnQgZmlsZTI3IGZyb20gJy4vMDQtc2IvcmFpZC9vNHMuanMnO1xuaW1wb3J0IGZpbGUyOCBmcm9tICcuLzA0LXNiL3JhaWQvbzdzLmpzJztcbmltcG9ydCBmaWxlMjkgZnJvbSAnLi8wNC1zYi9yYWlkL28xMnMuanMnO1xuaW1wb3J0IGZpbGUzMCBmcm9tICcuLzA0LXNiL3RyaWFsL2J5YWtrby1leC5qcyc7XG5pbXBvcnQgZmlsZTMxIGZyb20gJy4vMDQtc2IvdHJpYWwvc2hpbnJ5dS5qcyc7XG5pbXBvcnQgZmlsZTMyIGZyb20gJy4vMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzJztcbmltcG9ydCBmaWxlMzMgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLmpzJztcbmltcG9ydCBmaWxlMzQgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLmpzJztcbmltcG9ydCBmaWxlMzUgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzJztcbmltcG9ydCBmaWxlMzYgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLmpzJztcbmltcG9ydCBmaWxlMzcgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2guanMnO1xuaW1wb3J0IGZpbGUzOCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMnO1xuaW1wb3J0IGZpbGUzOSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QuanMnO1xuaW1wb3J0IGZpbGU0MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIuanMnO1xuaW1wb3J0IGZpbGU0MSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyc7XG5pbXBvcnQgZmlsZTQyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LmpzJztcbmltcG9ydCBmaWxlNDMgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC5qcyc7XG5pbXBvcnQgZmlsZTQ0IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyc7XG5pbXBvcnQgZmlsZTQ1IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QuanMnO1xuaW1wb3J0IGZpbGU0NiBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL210X2d1bGcuanMnO1xuaW1wb3J0IGZpbGU0NyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzJztcbmltcG9ydCBmaWxlNDggZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwuanMnO1xuaW1wb3J0IGZpbGU0OSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MuanMnO1xuaW1wb3J0IGZpbGU1MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzJztcbmltcG9ydCBmaWxlNTEgZnJvbSAnLi8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUuanMnO1xuaW1wb3J0IGZpbGU1MiBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UuanMnO1xuaW1wb3J0IGZpbGU1MyBmcm9tICcuLzA1LXNoYi9yYWlkL2Uxbi5qcyc7XG5pbXBvcnQgZmlsZTU0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTFzLmpzJztcbmltcG9ydCBmaWxlNTUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMm4uanMnO1xuaW1wb3J0IGZpbGU1NiBmcm9tICcuLzA1LXNoYi9yYWlkL2Uycy5qcyc7XG5pbXBvcnQgZmlsZTU3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTNuLmpzJztcbmltcG9ydCBmaWxlNTggZnJvbSAnLi8wNS1zaGIvcmFpZC9lM3MuanMnO1xuaW1wb3J0IGZpbGU1OSBmcm9tICcuLzA1LXNoYi9yYWlkL2U0bi5qcyc7XG5pbXBvcnQgZmlsZTYwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTRzLmpzJztcbmltcG9ydCBmaWxlNjEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNW4uanMnO1xuaW1wb3J0IGZpbGU2MiBmcm9tICcuLzA1LXNoYi9yYWlkL2U1cy5qcyc7XG5pbXBvcnQgZmlsZTYzIGZyb20gJy4vMDUtc2hiL3JhaWQvZTZuLmpzJztcbmltcG9ydCBmaWxlNjQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNnMuanMnO1xuaW1wb3J0IGZpbGU2NSBmcm9tICcuLzA1LXNoYi9yYWlkL2U3bi5qcyc7XG5pbXBvcnQgZmlsZTY2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTdzLmpzJztcbmltcG9ydCBmaWxlNjcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOG4uanMnO1xuaW1wb3J0IGZpbGU2OCBmcm9tICcuLzA1LXNoYi9yYWlkL2U4cy5qcyc7XG5pbXBvcnQgZmlsZTY5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTluLmpzJztcbmltcG9ydCBmaWxlNzAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOXMuanMnO1xuaW1wb3J0IGZpbGU3MSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMG4uanMnO1xuaW1wb3J0IGZpbGU3MiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMHMuanMnO1xuaW1wb3J0IGZpbGU3MyBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMW4uanMnO1xuaW1wb3J0IGZpbGU3NCBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMXMuanMnO1xuaW1wb3J0IGZpbGU3NSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMm4uanMnO1xuaW1wb3J0IGZpbGU3NiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMnMuanMnO1xuaW1wb3J0IGZpbGU3NyBmcm9tICcuLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyc7XG5pbXBvcnQgZmlsZTc4IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLmpzJztcbmltcG9ydCBmaWxlNzkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXguanMnO1xuaW1wb3J0IGZpbGU4MCBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyc7XG5pbXBvcnQgZmlsZTgxIGZyb20gJy4vMDUtc2hiL3RyaWFsL2hhZGVzLWV4LmpzJztcbmltcG9ydCBmaWxlODIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMuanMnO1xuaW1wb3J0IGZpbGU4MyBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMnO1xuaW1wb3J0IGZpbGU4NCBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UuanMnO1xuaW1wb3J0IGZpbGU4NSBmcm9tICcuLzA1LXNoYi90cmlhbC9sZXZpLXVuLmpzJztcbmltcG9ydCBmaWxlODYgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMnO1xuaW1wb3J0IGZpbGU4NyBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi5qcyc7XG5pbXBvcnQgZmlsZTg4IGZyb20gJy4vMDUtc2hiL3RyaWFsL3NoaXZhLXVuLmpzJztcbmltcG9ydCBmaWxlODkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyc7XG5pbXBvcnQgZmlsZTkwIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXguanMnO1xuaW1wb3J0IGZpbGU5MSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbi11bi5qcyc7XG5pbXBvcnQgZmlsZTkyIGZyb20gJy4vMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzJztcbmltcG9ydCBmaWxlOTMgZnJvbSAnLi8wNS1zaGIvdHJpYWwvd29sLmpzJztcbmltcG9ydCBmaWxlOTQgZnJvbSAnLi8wNS1zaGIvdHJpYWwvd29sLWV4LmpzJztcbmltcG9ydCBmaWxlOTUgZnJvbSAnLi8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgeycwMC1taXNjL2J1ZmZzLmpzJzogZmlsZTAsJzAwLW1pc2MvZ2VuZXJhbC5qcyc6IGZpbGUxLCcwMC1taXNjL3Rlc3QuanMnOiBmaWxlMiwnMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzJzogZmlsZTMsJzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyc6IGZpbGU0LCcwMi1hcnIvdHJpYWwvbGV2aS1leC5qcyc6IGZpbGU1LCcwMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMnOiBmaWxlNiwnMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzJzogZmlsZTcsJzAyLWFyci90cmlhbC90aXRhbi1obS5qcyc6IGZpbGU4LCcwMi1hcnIvdHJpYWwvdGl0YW4tZXguanMnOiBmaWxlOSwnMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzJzogZmlsZTEwLCcwMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS5qcyc6IGZpbGUxMSwnMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS5qcyc6IGZpbGUxMiwnMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMnOiBmaWxlMTMsJzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLmpzJzogZmlsZTE0LCcwMy1ody9yYWlkL2ExMm4uanMnOiBmaWxlMTUsJzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzJzogZmlsZTE2LCcwNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLmpzJzogZmlsZTE3LCcwNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUuanMnOiBmaWxlMTgsJzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyc6IGZpbGUxOSwnMDQtc2IvZHVuZ2Vvbi9zd2FsbG93c19jb21wYXNzLmpzJzogZmlsZTIwLCcwNC1zYi9kdW5nZW9uL3RlbXBsZV9vZl90aGVfZmlzdC5qcyc6IGZpbGUyMSwnMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyc6IGZpbGUyMiwnMDQtc2IvcmFpZC9vMW4uanMnOiBmaWxlMjMsJzA0LXNiL3JhaWQvbzJuLmpzJzogZmlsZTI0LCcwNC1zYi9yYWlkL28zbi5qcyc6IGZpbGUyNSwnMDQtc2IvcmFpZC9vNG4uanMnOiBmaWxlMjYsJzA0LXNiL3JhaWQvbzRzLmpzJzogZmlsZTI3LCcwNC1zYi9yYWlkL283cy5qcyc6IGZpbGUyOCwnMDQtc2IvcmFpZC9vMTJzLmpzJzogZmlsZTI5LCcwNC1zYi90cmlhbC9ieWFra28tZXguanMnOiBmaWxlMzAsJzA0LXNiL3RyaWFsL3NoaW5yeXUuanMnOiBmaWxlMzEsJzA0LXNiL3RyaWFsL3N1c2Fuby1leC5qcyc6IGZpbGUzMiwnMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS5qcyc6IGZpbGUzMywnMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyc6IGZpbGUzNCwnMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS5qcyc6IGZpbGUzNSwnMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci5qcyc6IGZpbGUzNiwnMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzJzogZmlsZTM3LCcwNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLmpzJzogZmlsZTM4LCcwNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LmpzJzogZmlsZTM5LCcwNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzJzogZmlsZTQwLCcwNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcuanMnOiBmaWxlNDEsJzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC5qcyc6IGZpbGU0MiwnMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMnOiBmaWxlNDMsJzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwuanMnOiBmaWxlNDQsJzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LmpzJzogZmlsZTQ1LCcwNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzJzogZmlsZTQ2LCcwNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi5qcyc6IGZpbGU0NywnMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLmpzJzogZmlsZTQ4LCcwNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzJzogZmlsZTQ5LCcwNS1zaGIvZHVuZ2Vvbi90d2lubmluZy5qcyc6IGZpbGU1MCwnMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLmpzJzogZmlsZTUxLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzJzogZmlsZTUyLCcwNS1zaGIvcmFpZC9lMW4uanMnOiBmaWxlNTMsJzA1LXNoYi9yYWlkL2Uxcy5qcyc6IGZpbGU1NCwnMDUtc2hiL3JhaWQvZTJuLmpzJzogZmlsZTU1LCcwNS1zaGIvcmFpZC9lMnMuanMnOiBmaWxlNTYsJzA1LXNoYi9yYWlkL2Uzbi5qcyc6IGZpbGU1NywnMDUtc2hiL3JhaWQvZTNzLmpzJzogZmlsZTU4LCcwNS1zaGIvcmFpZC9lNG4uanMnOiBmaWxlNTksJzA1LXNoYi9yYWlkL2U0cy5qcyc6IGZpbGU2MCwnMDUtc2hiL3JhaWQvZTVuLmpzJzogZmlsZTYxLCcwNS1zaGIvcmFpZC9lNXMuanMnOiBmaWxlNjIsJzA1LXNoYi9yYWlkL2U2bi5qcyc6IGZpbGU2MywnMDUtc2hiL3JhaWQvZTZzLmpzJzogZmlsZTY0LCcwNS1zaGIvcmFpZC9lN24uanMnOiBmaWxlNjUsJzA1LXNoYi9yYWlkL2U3cy5qcyc6IGZpbGU2NiwnMDUtc2hiL3JhaWQvZThuLmpzJzogZmlsZTY3LCcwNS1zaGIvcmFpZC9lOHMuanMnOiBmaWxlNjgsJzA1LXNoYi9yYWlkL2U5bi5qcyc6IGZpbGU2OSwnMDUtc2hiL3JhaWQvZTlzLmpzJzogZmlsZTcwLCcwNS1zaGIvcmFpZC9lMTBuLmpzJzogZmlsZTcxLCcwNS1zaGIvcmFpZC9lMTBzLmpzJzogZmlsZTcyLCcwNS1zaGIvcmFpZC9lMTFuLmpzJzogZmlsZTczLCcwNS1zaGIvcmFpZC9lMTFzLmpzJzogZmlsZTc0LCcwNS1zaGIvcmFpZC9lMTJuLmpzJzogZmlsZTc1LCcwNS1zaGIvcmFpZC9lMTJzLmpzJzogZmlsZTc2LCcwNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXguanMnOiBmaWxlNzcsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi5qcyc6IGZpbGU3OCwnMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzJzogZmlsZTc5LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24uanMnOiBmaWxlODAsJzA1LXNoYi90cmlhbC9oYWRlcy1leC5qcyc6IGZpbGU4MSwnMDUtc2hiL3RyaWFsL2hhZGVzLmpzJzogZmlsZTgyLCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LmpzJzogZmlsZTgzLCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLmpzJzogZmlsZTg0LCcwNS1zaGIvdHJpYWwvbGV2aS11bi5qcyc6IGZpbGU4NSwnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LmpzJzogZmlsZTg2LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24uanMnOiBmaWxlODcsJzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyc6IGZpbGU4OCwnMDUtc2hiL3RyaWFsL3RpdGFuaWEuanMnOiBmaWxlODksJzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LmpzJzogZmlsZTkwLCcwNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMnOiBmaWxlOTEsJzA1LXNoYi90cmlhbC92YXJpcy1leC5qcyc6IGZpbGU5MiwnMDUtc2hiL3RyaWFsL3dvbC5qcyc6IGZpbGU5MywnMDUtc2hiL3RyaWFsL3dvbC1leC5qcyc6IGZpbGU5NCwnMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci5qcyc6IGZpbGU5NSx9OyJdLCJzb3VyY2VSb290IjoiIn0=