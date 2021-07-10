(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 5661:
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

const isInPartyConditionFunc = (data, matches) => {
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
  run: (data, matches) => {
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
  mistake: (data, _matches) => {
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
  run: data => {
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
    run: (data, matches) => {
      if (matches.ownerId === '0') return;
      data.petIdToOwnerId = data.petIdToOwnerId || {}; // Fix any lowercase ids.

      data.petIdToOwnerId[matches.id.toUpperCase()] = matches.ownerId.toUpperCase();
    }
  }, {
    id: 'Buff Pet To Owner Clearer',
    netRegex: netregexes/* default.changeZone */.Z.changeZone(),
    run: data => {
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
    condition: (_data, matches) => {
      // Prevent "Eos loses the effect of Well Fed from Critlo Mcgee"
      return matches.target === matches.source;
    },
    mistake: (data, matches) => {
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
    run: (data, matches) => {
      if (!data.lostFood) return;
      delete data.lostFood[matches.target];
    }
  }, {
    id: 'General Rabbit Medium',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '8E0'
    }),
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
    mistake: data => {
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
    mistake: data => {
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
    condition: (data, matches) => {
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
    mistake: (data, matches) => {
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
    condition: (data, matches) => matches.source === data.me,
    mistake: (data, matches) => {
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
    mistake: (data, matches) => {
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
    run: data => {
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
    mistake: data => {
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
    run: data => delete data.pokeCount
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
    condition: data => {
      // The intermission also gets this effect, so only a mistake after that.
      // Unlike extreme, this has the same 20 second duration as the intermission.
      return data.seenDiamondDust;
    },
    mistake: (_data, matches) => {
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
    condition: (_data, matches) => {
      // The intermission also gets this effect, but for a shorter duration.
      return parseFloat(matches.duration) > 20;
    },
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.zombie = data.zombie || {};
      data.zombie[matches.target] = true;
    }
  }, {
    id: 'Weeping Forgall Gradual Zombification Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '415'
    }),
    run: (data, matches) => {
      data.zombie = data.zombie || {};
      data.zombie[matches.target] = false;
    }
  }, {
    id: 'Weeping Forgall Mega Death',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '17CA'
    }),
    condition: (data, matches) => data.zombie && !data.zombie[matches.target],
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.shield = data.shield || {};
      data.shield[matches.target] = true;
    }
  }, {
    id: 'Weeping Headstone Shield Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '15E'
    }),
    run: (data, matches) => {
      data.shield = data.shield || {};
      data.shield[matches.target] = false;
    }
  }, {
    id: 'Weeping Flaring Epigraph',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '1856'
    }),
    condition: (data, matches) => data.shield && !data.shield[matches.target],
    mistake: (_data, matches) => {
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
          ko: '탱커 레이저'
        }
      };
    }
  }, {
    id: 'Weeping Ozma Holy',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '182E'
    }),
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hasImp = data.hasImp || {};
      data.hasImp[matches.target] = true;
    }
  }, {
    id: 'GubalHm Imp Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '46E'
    }),
    run: (data, matches) => {
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
    condition: (data, matches) => data.hasImp[matches.target],
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
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
    condition: (data, matches) => data.assault.includes(matches.target),
    mistake: (_data, matches) => {
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
    run: data => {
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
    mistake: (_data, matches) => {
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
    condition: (_data, matches) => matches.flags.substr(-2) === '0E',
    mistake: (_data, matches) => {
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
    condition: (_data, matches) => matches.type === '21',
    // Taking the stack solo is *probably* a mistake.
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
    deathReason: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    run: data => {
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
    condition: data => !data.initialized,
    run: data => {
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
    condition: (data, matches) => {
      // We DO want to be hit by Toad/Ribbit if the next cast of The Game
      // is 4x toad panels.
      return !(data.phaseNumber === 3 && data.gameCount % 2 === 0) && matches.targetId !== 'E0000000';
    },
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    },
    run: data => {
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
    deathReason: (_data, matches) => {
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
    deathReason: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: data => {
      data.isDecisiveBattleElement = true;
    }
  }, {
    id: 'O4S1 Vacuum Wave',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '23FE',
      capture: false
    }),
    run: data => {
      data.isDecisiveBattleElement = false;
    }
  }, {
    id: 'O4S2 Almagest',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2417',
      capture: false
    }),
    run: data => {
      data.isNeoExdeath = true;
    }
  }, {
    id: 'O4S2 Blizzard III',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '23F8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    // Ignore unavoidable raid aoe Blizzard III.
    condition: data => !data.isDecisiveBattleElement,
    mistake: (_data, matches) => {
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
    condition: data => data.isDecisiveBattleElement,
    mistake: (_data, matches) => {
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
    mistake: (data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = true;
    }
  }, {
    id: 'O4S2 Beyond Death Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '566'
    }),
    run: (data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = false;
    }
  }, {
    id: 'O4S2 Beyond Death',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
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
    run: (data, matches) => {
      data.doubleAttackMatches = data.doubleAttackMatches || [];
      data.doubleAttackMatches.push(matches);
    }
  }, {
    id: 'O4S2 Double Attack',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '241C',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: data => {
      const arr = data.doubleAttackMatches;
      if (!arr) return;
      if (arr.length <= 2) return; // Hard to know who should be in this and who shouldn't, but
      // it should never hit 3 people.

      return {
        type: 'fail',
        fullText: `${arr[0].ability} x ${arr.length}`
      };
    },
    run: data => delete data.doubleAttackMatches
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
    mistake: (_data, matches) => {
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
          ko: '넉백'
        }
      };
    }
  }, {
    id: 'O12S1 Magic Vulnerability Up Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '472'
    }),
    run: (data, matches) => {
      data.vuln = data.vuln || {};
      data.vuln[matches.target] = true;
    }
  }, {
    id: 'O12S1 Magic Vulnerability Up Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '472'
    }),
    run: (data, matches) => {
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
    condition: (data, matches) => data.vuln && data.vuln[matches.target],
    mistake: (_data, matches) => {
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
    deathReason: (_data, matches) => {
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
    deathReason: (_data, matches) => {
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
    deathReason: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
          ko: '번개 맞음'
        }
      };
    }
  }, {
    id: 'UCU Burns',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'FA'
    }),
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = true;
    }
  }, {
    id: 'UCU Doom Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: 'D2'
    }),
    run: (data, matches) => {
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
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 1,
    deathReason: (data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    condition: (_data, matches) => matches.flags.slice(-2) === '03',
    mistake: (_data, matches) => {
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
    condition: (_data, matches) => matches.flags.slice(-2) === '03',
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.faultLineTarget = matches.target;
    }
  }, {
    id: 'E4S Fault Line',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '411E',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => data.faultLineTarget !== matches.target,
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = true;
    }
  }, {
    id: 'E5N Orb Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8B4'
    }),
    run: (data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = false;
    }
  }, {
    id: 'E5N Divine Judgement Volts',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4B9A',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => !data.hasOrb[matches.target],
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
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
    mistake: (data, matches) => {
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
    run: data => {
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
    run: (data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = true;
    }
  }, {
    id: 'E5S Orb Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8B4'
    }),
    run: (data, matches) => {
      data.hasOrb = data.hasOrb || {};
      data.hasOrb[matches.target] = false;
    }
  }, {
    id: 'E5S Divine Judgement Volts',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BB7',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
    mistake: (_data, matches) => {
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
    condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
    mistake: (_data, matches) => {
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
    condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
    mistake: (_data, matches) => {
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
    condition: (data, matches) => {
      // Having a non-idempotent condition function is a bit <_<
      // Only consider lightning bolt damage if you have a debuff to clear.
      if (!data.hated || !data.hated[matches.target]) return true;
      delete data.hated[matches.target];
      return false;
    },
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hated = data.hated || {};
      data.hated[matches.target] = true;
    }
  }, {
    id: 'E5S Stormcloud Target Tracking',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    run: (data, matches) => {
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
    mistake: (data, matches) => {
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
    run: data => {
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
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6s.ts

// TODO: check tethers being cut (when they shouldn't)
// TODO: check for concussed debuff
// TODO: check for taking tankbuster with lightheaded
// TODO: check for one person taking multiple Storm Of Fury Tethers (4C01/4C08)
const triggerSet = {
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
/* harmony default export */ const e6s = (triggerSet);

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
    run: (data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = true;
    }
  }, {
    id: 'E7N Astral Effect Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BE'
    }),
    run: (data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = false;
    }
  }, {
    id: 'E7N Umbral Effect Gain',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BF'
    }),
    run: (data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = true;
    }
  }, {
    id: 'E7N Umbral Effect Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BF'
    }),
    run: (data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = false;
    }
  }, {
    id: 'E7N Light\'s Course',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C3E', '4C40', '4C22', '4C3C', '4E63'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => {
      return !data.hasUmbral || !data.hasUmbral[matches.target];
    },
    mistake: (data, matches) => {
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
    condition: (data, matches) => {
      return !data.hasAstral || !data.hasAstral[matches.target];
    },
    mistake: (data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'E12S Headmarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({}),
    run: (data, matches) => {
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
    run: (data, matches) => {
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
    run: (data, matches) => {
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
    run: data => {
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
    mistake: (data, matches) => {
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
    run: (data, matches) => {
      data.pillarIdToOwner = data.pillarIdToOwner || {};
      data.pillarIdToOwner[matches.sourceId] = matches.target;
    }
  }, {
    id: 'E12S Promise Ice Pillar Mistake',
    netRegex: netregexes/* default.ability */.Z.ability({
      source: 'Ice Pillar',
      id: '589B'
    }),
    condition: (data, matches) => {
      if (!data.pillarIdToOwner) return false;
      return matches.target !== data.pillarIdToOwner[matches.sourceId];
    },
    mistake: (data, matches) => {
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
    run: (data, matches) => {
      data.fire = data.fire || {};
      data.fire[matches.target] = true;
    }
  }, {
    id: 'E12S Promise Lose Fire Resistance Down II',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '832'
    }),
    run: (data, matches) => {
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
    run: (data, matches) => {
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
    mistake: (data, matches) => {
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
    run: (data, matches) => {
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
    mistake: (data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    deathReason: (_data, matches) => {
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
    run: (data, matches) => {
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
    condition: (data, matches) => data.hasDark && data.hasDark.includes(matches.target),
    mistake: (_data, matches) => {
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
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = true;
    }
  }, {
    id: 'HadesEx Beyond Death Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '566'
    }),
    run: (data, matches) => {
      data.hasBeyondDeath = data.hasBeyondDeath || {};
      data.hasBeyondDeath[matches.target] = false;
    }
  }, {
    id: 'HadesEx Beyond Death',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
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
    run: (data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = true;
    }
  }, {
    id: 'HadesEx Doom Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '6E9'
    }),
    run: (data, matches) => {
      data.hasDoom = data.hasDoom || {};
      data.hasDoom[matches.target] = false;
    }
  }, {
    id: 'HadesEx Doom',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '6E9'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
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
    deathReason: (_data, matches) => {
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
    condition: (_data, matches) => {
      // The intermission also gets this effect, but for a shorter duration.
      return parseFloat(matches.duration) > 20;
    },
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_data, matches) => {
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
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
    mistake: (_data, matches) => {
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
          cn: '光性爆雷'
        }
      };
    }
  }, {
    id: 'TEA Dropsy',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '121'
    }),
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.jagdTether = data.jagdTether || {};
      data.jagdTether[matches.sourceId] = matches.target;
    }
  }, {
    id: 'TEA Reducible Complexity',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4821',
      ...oopsy_common/* playerDamageFields */.np
    }),
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
    condition: (data, matches) => !data.party.isTank(matches.target),
    mistake: (_data, matches) => {
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
    run: (data, matches) => {
      data.hasThrottle = data.hasThrottle || {};
      data.hasThrottle[matches.target] = true;
    }
  }, {
    id: 'TEA Throttle Lose',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '2BC'
    }),
    run: (data, matches) => {
      data.hasThrottle = data.hasThrottle || {};
      data.hasThrottle[matches.target] = false;
    }
  }, {
    id: 'TEA Throttle',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '2BC'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
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
    mistake: (_data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.source
      };
    }
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/oopsy_manifest.txt

































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.js': buffs,'00-misc/general.js': general,'00-misc/test.js': test,'02-arr/trial/ifrit-nm.js': ifrit_nm,'02-arr/trial/titan-nm.js': titan_nm,'02-arr/trial/levi-ex.js': levi_ex,'02-arr/trial/shiva-hm.js': shiva_hm,'02-arr/trial/shiva-ex.js': shiva_ex,'02-arr/trial/titan-hm.js': titan_hm,'02-arr/trial/titan-ex.js': titan_ex,'03-hw/alliance/weeping_city.js': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.js': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.js': fractal_continuum,'03-hw/dungeon/gubal_library_hard.js': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.js': sohm_al_hard,'03-hw/raid/a12n.js': a12n,'04-sb/dungeon/ala_mhigo.js': ala_mhigo,'04-sb/dungeon/bardams_mettle.js': bardams_mettle,'04-sb/dungeon/kugane_castle.js': kugane_castle,'04-sb/dungeon/st_mocianne_hard.js': st_mocianne_hard,'04-sb/dungeon/swallows_compass.js': swallows_compass,'04-sb/dungeon/temple_of_the_fist.js': temple_of_the_fist,'04-sb/dungeon/the_burn.js': the_burn,'04-sb/raid/o1n.js': o1n,'04-sb/raid/o2n.js': o2n,'04-sb/raid/o3n.js': o3n,'04-sb/raid/o4n.js': o4n,'04-sb/raid/o4s.js': o4s,'04-sb/raid/o7s.js': o7s,'04-sb/raid/o12s.js': o12s,'04-sb/trial/byakko-ex.js': byakko_ex,'04-sb/trial/shinryu.js': shinryu,'04-sb/trial/susano-ex.js': susano_ex,'04-sb/ultimate/ultima_weapon_ultimate.js': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.js': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.js': the_copied_factory,'05-shb/alliance/the_puppets_bunker.js': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.js': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.js': akadaemia_anyder,'05-shb/dungeon/amaurot.js': amaurot,'05-shb/dungeon/anamnesis_anyder.js': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.js': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.js': heroes_gauntlet,'05-shb/dungeon/holminster_switch.js': holminster_switch,'05-shb/dungeon/malikahs_well.js': malikahs_well,'05-shb/dungeon/matoyas_relict.js': matoyas_relict,'05-shb/dungeon/mt_gulg.js': mt_gulg,'05-shb/dungeon/paglthan.js': paglthan,'05-shb/dungeon/qitana_ravel.js': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.js': the_grand_cosmos,'05-shb/dungeon/twinning.js': twinning,'05-shb/eureka/delubrum_reginae.js': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.js': delubrum_reginae_savage,'05-shb/raid/e1n.js': e1n,'05-shb/raid/e1s.js': e1s,'05-shb/raid/e2n.js': e2n,'05-shb/raid/e2s.js': e2s,'05-shb/raid/e3n.js': e3n,'05-shb/raid/e3s.js': e3s,'05-shb/raid/e4n.js': e4n,'05-shb/raid/e4s.js': e4s,'05-shb/raid/e5n.js': e5n,'05-shb/raid/e5s.js': e5s,'05-shb/raid/e6n.js': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.js': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.js': e8n,'05-shb/raid/e8s.js': e8s,'05-shb/raid/e9n.js': e9n,'05-shb/raid/e9s.js': e9s,'05-shb/raid/e10n.js': e10n,'05-shb/raid/e10s.js': e10s,'05-shb/raid/e11n.js': e11n,'05-shb/raid/e11s.js': e11s,'05-shb/raid/e12n.js': e12n,'05-shb/raid/e12s.js': e12s,'05-shb/trial/diamond_weapon-ex.js': diamond_weapon_ex,'05-shb/trial/diamond_weapon.js': diamond_weapon,'05-shb/trial/emerald_weapon-ex.js': emerald_weapon_ex,'05-shb/trial/emerald_weapon.js': emerald_weapon,'05-shb/trial/hades-ex.js': hades_ex,'05-shb/trial/hades.js': hades,'05-shb/trial/innocence-ex.js': innocence_ex,'05-shb/trial/innocence.js': innocence,'05-shb/trial/levi-un.js': levi_un,'05-shb/trial/ruby_weapon-ex.js': ruby_weapon_ex,'05-shb/trial/ruby_weapon.js': ruby_weapon,'05-shb/trial/shiva-un.js': shiva_un,'05-shb/trial/titania.js': titania,'05-shb/trial/titania-ex.js': titania_ex,'05-shb/trial/titan-un.js': titan_un,'05-shb/trial/varis-ex.js': varis_ex,'05-shb/trial/wol.js': wol,'05-shb/trial/wol-ex.js': wol_ex,'05-shb/ultimate/the_epic_of_alexander.js': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6WyJhYmlsaXR5Q29sbGVjdFNlY29uZHMiLCJlZmZlY3RDb2xsZWN0U2Vjb25kcyIsImlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMiLCJkYXRhIiwibWF0Y2hlcyIsInNvdXJjZUlkIiwidG9VcHBlckNhc2UiLCJwYXJ0eSIsInBhcnR5SWRzIiwiaW5jbHVkZXMiLCJwZXRJZFRvT3duZXJJZCIsIm93bmVySWQiLCJtaXNzZWRGdW5jIiwiYXJncyIsImlkIiwidHJpZ2dlcklkIiwibmV0UmVnZXgiLCJjb25kaXRpb24iLCJydW4iLCJnZW5lcmFsQnVmZkNvbGxlY3Rpb24iLCJwdXNoIiwiZGVsYXlTZWNvbmRzIiwiY29sbGVjdFNlY29uZHMiLCJzdXBwcmVzc1NlY29uZHMiLCJtaXN0YWtlIiwiX21hdGNoZXMiLCJhbGxNYXRjaGVzIiwicGFydHlOYW1lcyIsImdvdEJ1ZmZNYXAiLCJuYW1lIiwiZmlyc3RNYXRjaCIsInNvdXJjZU5hbWUiLCJzb3VyY2UiLCJwZXRJZCIsIm93bmVyTmFtZSIsIm5hbWVGcm9tSWQiLCJjb25zb2xlIiwiZXJyb3IiLCJpZ25vcmVTZWxmIiwidGhpbmdOYW1lIiwiZmllbGQiLCJ0YXJnZXQiLCJtaXNzZWQiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwieCIsImxlbmd0aCIsInR5cGUiLCJibGFtZSIsInRleHQiLCJlbiIsIm1hcCIsIlNob3J0TmFtZSIsImpvaW4iLCJkZSIsImZyIiwiamEiLCJjbiIsImtvIiwibWlzc2VkTWl0aWdhdGlvbkJ1ZmYiLCJlZmZlY3RJZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJOZXRSZWdleGVzIiwibWlzc2VkRGFtYWdlQWJpbGl0eSIsImFiaWxpdHlJZCIsIm1pc3NlZEhlYWwiLCJtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSIsInpvbmVJZCIsIlpvbmVJZCIsInRyaWdnZXJzIiwiX2RhdGEiLCJsb3N0Rm9vZCIsImluQ29tYmF0IiwiSXNQbGF5ZXJJZCIsImxpbmUiLCJuZXRSZWdleEZyIiwibmV0UmVnZXhKYSIsIm5ldFJlZ2V4Q24iLCJuZXRSZWdleEtvIiwibWUiLCJmdWxsVGV4dCIsInN0cmlraW5nRHVtbXlCeUxvY2FsZSIsInN0cmlraW5nRHVtbXlOYW1lcyIsInZhbHVlcyIsImJvb3RDb3VudCIsImFiaWxpdHkiLCJEYW1hZ2VGcm9tTWF0Y2hlcyIsImVmZmVjdCIsInBva2VDb3VudCIsImRhbWFnZVdhcm4iLCJzaGFyZVdhcm4iLCJkYW1hZ2VGYWlsIiwiZ2FpbnNFZmZlY3RXYXJuIiwiZ2FpbnNFZmZlY3RGYWlsIiwiZGVhdGhSZWFzb24iLCJyZWFzb24iLCJzaGFyZUZhaWwiLCJzZWVuRGlhbW9uZER1c3QiLCJzb2xvV2FybiIsInBhcnNlRmxvYXQiLCJkdXJhdGlvbiIsInpvbWJpZSIsInNoaWVsZCIsImhhc0ltcCIsInBsYXllckRhbWFnZUZpZWxkcyIsImFzc2F1bHQiLCJhYmlsaXR5V2FybiIsImZsYWdzIiwic3Vic3RyIiwic29sb0ZhaWwiLCJjYXB0dXJlIiwibmV0UmVnZXhEZSIsInBoYXNlTnVtYmVyIiwiaW5pdGlhbGl6ZWQiLCJnYW1lQ291bnQiLCJ0YXJnZXRJZCIsImlzRGVjaXNpdmVCYXR0bGVFbGVtZW50IiwiaXNOZW9FeGRlYXRoIiwiYWJpbGl0eU5hbWUiLCJoYXNCZXlvbmREZWF0aCIsImRvdWJsZUF0dGFja01hdGNoZXMiLCJhcnIiLCJ2dWxuIiwia0ZsYWdJbnN0YW50RGVhdGgiLCJoYXNEb29tIiwic2xpY2UiLCJmYXVsdExpbmVUYXJnZXQiLCJoYXNPcmIiLCJjbG91ZE1hcmtlcnMiLCJtIiwibm9PcmIiLCJzdHIiLCJoYXRlZCIsIndyb25nQnVmZiIsIm5vQnVmZiIsImhhc0FzdHJhbCIsImhhc1VtYnJhbCIsImZpcnN0SGVhZG1hcmtlciIsInBhcnNlSW50IiwiZ2V0SGVhZG1hcmtlcklkIiwiZGVjT2Zmc2V0IiwidG9TdHJpbmciLCJwYWRTdGFydCIsImZpcnN0TGFzZXJNYXJrZXIiLCJsYXN0TGFzZXJNYXJrZXIiLCJsYXNlck5hbWVUb051bSIsInNjdWxwdHVyZVlQb3NpdGlvbnMiLCJ5Iiwic2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQiLCJibGFkZU9mRmxhbWVDb3VudCIsIm51bWJlciIsIm5hbWVzIiwid2l0aE51bSIsIm93bmVycyIsIm1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMiLCJpc1N0YXR1ZVBvc2l0aW9uS25vd24iLCJpc1N0YXR1ZU5vcnRoIiwic2N1bHB0dXJlSWRzIiwib3RoZXJJZCIsInNvdXJjZVkiLCJvdGhlclkiLCJ5RGlmZiIsIk1hdGgiLCJhYnMiLCJvd25lciIsIm93bmVyTmljayIsInBpbGxhcklkVG9Pd25lciIsInBpbGxhck93bmVyIiwiZmlyZSIsInNtYWxsTGlvbklkVG9Pd25lciIsInNtYWxsTGlvbk93bmVycyIsImhhc1NtYWxsTGlvbiIsImhhc0ZpcmVEZWJ1ZmYiLCJjZW50ZXJZIiwiZGlyT2JqIiwiT3V0cHV0cyIsIm5vcnRoQmlnTGlvbiIsInNpbmdsZVRhcmdldCIsIm91dHB1dCIsInNvdXRoQmlnTGlvbiIsInNoYXJlZCIsImZpcmVEZWJ1ZmYiLCJsYWJlbHMiLCJwYXJzZXJMYW5nIiwiaGFzRGFyayIsImphZ2RUZXRoZXIiLCJ1bmRlZmluZWQiLCJpc1RhbmsiLCJoYXNUaHJvdHRsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtDQUdBOztBQUNBLE1BQU1BLHFCQUFxQixHQUFHLEdBQTlCLEMsQ0FDQTs7QUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxHQUE3Qjs7QUFFQSxNQUFNQyxzQkFBc0IsR0FBRyxDQUFDQyxJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDaEQsUUFBTUMsUUFBUSxHQUFHRCxPQUFPLENBQUNDLFFBQVIsQ0FBaUJDLFdBQWpCLEVBQWpCO0FBQ0EsTUFBSUgsSUFBSSxDQUFDSSxLQUFMLENBQVdDLFFBQVgsQ0FBb0JDLFFBQXBCLENBQTZCSixRQUE3QixDQUFKLEVBQ0UsT0FBTyxJQUFQOztBQUVGLE1BQUlGLElBQUksQ0FBQ08sY0FBVCxFQUF5QjtBQUN2QixVQUFNQyxPQUFPLEdBQUdSLElBQUksQ0FBQ08sY0FBTCxDQUFvQkwsUUFBcEIsQ0FBaEI7QUFDQSxRQUFJTSxPQUFPLElBQUlSLElBQUksQ0FBQ0ksS0FBTCxDQUFXQyxRQUFYLENBQW9CQyxRQUFwQixDQUE2QkUsT0FBN0IsQ0FBZixFQUNFLE9BQU8sSUFBUDtBQUNIOztBQUVELFNBQU8sS0FBUDtBQUNELENBWkQsQyxDQWNBOzs7QUFDQSxNQUFNQyxVQUFVLEdBQUlDLElBQUQsSUFBVSxDQUMzQjtBQUNFO0FBQ0FDLElBQUUsRUFBRyxRQUFPRCxJQUFJLENBQUNFLFNBQVUsVUFGN0I7QUFHRUMsVUFBUSxFQUFFSCxJQUFJLENBQUNHLFFBSGpCO0FBSUVDLFdBQVMsRUFBRWYsc0JBSmI7QUFLRWdCLEtBQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFFBQUksQ0FBQ2dCLHFCQUFMLEdBQTZCaEIsSUFBSSxDQUFDZ0IscUJBQUwsSUFBOEIsRUFBM0Q7QUFDQWhCLFFBQUksQ0FBQ2dCLHFCQUFMLENBQTJCTixJQUFJLENBQUNFLFNBQWhDLElBQTZDWixJQUFJLENBQUNnQixxQkFBTCxDQUEyQk4sSUFBSSxDQUFDRSxTQUFoQyxLQUE4QyxFQUEzRjtBQUNBWixRQUFJLENBQUNnQixxQkFBTCxDQUEyQk4sSUFBSSxDQUFDRSxTQUFoQyxFQUEyQ0ssSUFBM0MsQ0FBZ0RoQixPQUFoRDtBQUNEO0FBVEgsQ0FEMkIsRUFZM0I7QUFDRVUsSUFBRSxFQUFHLFFBQU9ELElBQUksQ0FBQ0UsU0FBVSxFQUQ3QjtBQUVFQyxVQUFRLEVBQUVILElBQUksQ0FBQ0csUUFGakI7QUFHRUMsV0FBUyxFQUFFZixzQkFIYjtBQUlFbUIsY0FBWSxFQUFFUixJQUFJLENBQUNTLGNBSnJCO0FBS0VDLGlCQUFlLEVBQUVWLElBQUksQ0FBQ1MsY0FMeEI7QUFNRUUsU0FBTyxFQUFFLENBQUNyQixJQUFELEVBQU9zQixRQUFQLEtBQW9CO0FBQzNCLFFBQUksQ0FBQ3RCLElBQUksQ0FBQ2dCLHFCQUFWLEVBQ0U7QUFDRixVQUFNTyxVQUFVLEdBQUd2QixJQUFJLENBQUNnQixxQkFBTCxDQUEyQk4sSUFBSSxDQUFDRSxTQUFoQyxDQUFuQjtBQUNBLFFBQUksQ0FBQ1csVUFBTCxFQUNFO0FBRUYsVUFBTUMsVUFBVSxHQUFHeEIsSUFBSSxDQUFDSSxLQUFMLENBQVdvQixVQUE5QixDQVAyQixDQVMzQjs7QUFDQSxVQUFNQyxVQUFVLEdBQUcsRUFBbkI7O0FBQ0EsU0FBSyxNQUFNQyxJQUFYLElBQW1CRixVQUFuQixFQUNFQyxVQUFVLENBQUNDLElBQUQsQ0FBVixHQUFtQixLQUFuQjs7QUFFRixVQUFNQyxVQUFVLEdBQUdKLFVBQVUsQ0FBQyxDQUFELENBQTdCO0FBQ0EsUUFBSUssVUFBVSxHQUFHRCxVQUFVLENBQUNFLE1BQTVCLENBZjJCLENBZ0IzQjs7QUFDQSxRQUFJN0IsSUFBSSxDQUFDTyxjQUFULEVBQXlCO0FBQ3ZCLFlBQU11QixLQUFLLEdBQUdILFVBQVUsQ0FBQ3pCLFFBQVgsQ0FBb0JDLFdBQXBCLEVBQWQ7QUFDQSxZQUFNSyxPQUFPLEdBQUdSLElBQUksQ0FBQ08sY0FBTCxDQUFvQnVCLEtBQXBCLENBQWhCOztBQUNBLFVBQUl0QixPQUFKLEVBQWE7QUFDWCxjQUFNdUIsU0FBUyxHQUFHL0IsSUFBSSxDQUFDSSxLQUFMLENBQVc0QixVQUFYLENBQXNCeEIsT0FBdEIsQ0FBbEI7QUFDQSxZQUFJdUIsU0FBSixFQUNFSCxVQUFVLEdBQUdHLFNBQWIsQ0FERixLQUdFRSxPQUFPLENBQUNDLEtBQVIsQ0FBZSwwQkFBeUIxQixPQUFRLGFBQVlzQixLQUFNLEVBQWxFO0FBQ0g7QUFDRjs7QUFFRCxRQUFJcEIsSUFBSSxDQUFDeUIsVUFBVCxFQUNFVixVQUFVLENBQUNHLFVBQUQsQ0FBVixHQUF5QixJQUF6QjtBQUVGLFVBQU1RLFNBQVMsR0FBR1QsVUFBVSxDQUFDakIsSUFBSSxDQUFDMkIsS0FBTixDQUE1Qjs7QUFDQSxTQUFLLE1BQU1wQyxPQUFYLElBQXNCc0IsVUFBdEIsRUFBa0M7QUFDaEM7QUFDQTtBQUNBLFVBQUl0QixPQUFPLENBQUM0QixNQUFSLEtBQW1CRixVQUFVLENBQUNFLE1BQWxDLEVBQ0U7QUFFRkosZ0JBQVUsQ0FBQ3hCLE9BQU8sQ0FBQ3FDLE1BQVQsQ0FBVixHQUE2QixJQUE3QjtBQUNEOztBQUVELFVBQU1DLE1BQU0sR0FBR0MsTUFBTSxDQUFDQyxJQUFQLENBQVloQixVQUFaLEVBQXdCaUIsTUFBeEIsQ0FBZ0NDLENBQUQsSUFBTyxDQUFDbEIsVUFBVSxDQUFDa0IsQ0FBRCxDQUFqRCxDQUFmO0FBQ0EsUUFBSUosTUFBTSxDQUFDSyxNQUFQLEtBQWtCLENBQXRCLEVBQ0UsT0E1Q3lCLENBOEMzQjtBQUNBO0FBQ0E7O0FBQ0EsUUFBSUwsTUFBTSxDQUFDSyxNQUFQLEdBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLGFBQU87QUFDTEMsWUFBSSxFQUFFbkMsSUFBSSxDQUFDbUMsSUFETjtBQUVMQyxhQUFLLEVBQUVsQixVQUZGO0FBR0xtQixZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFWixTQUFTLEdBQUcsVUFBWixHQUF5QkcsTUFBTSxDQUFDVSxHQUFQLENBQVlOLENBQUQsSUFBTzNDLElBQUksQ0FBQ2tELFNBQUwsQ0FBZVAsQ0FBZixDQUFsQixFQUFxQ1EsSUFBckMsQ0FBMEMsSUFBMUMsQ0FEekI7QUFFSkMsWUFBRSxFQUFFaEIsU0FBUyxHQUFHLFlBQVosR0FBMkJHLE1BQU0sQ0FBQ1UsR0FBUCxDQUFZTixDQUFELElBQU8zQyxJQUFJLENBQUNrRCxTQUFMLENBQWVQLENBQWYsQ0FBbEIsRUFBcUNRLElBQXJDLENBQTBDLElBQTFDLENBRjNCO0FBR0pFLFlBQUUsRUFBRWpCLFNBQVMsR0FBRyxpQkFBWixHQUFnQ0csTUFBTSxDQUFDVSxHQUFQLENBQVlOLENBQUQsSUFBTzNDLElBQUksQ0FBQ2tELFNBQUwsQ0FBZVAsQ0FBZixDQUFsQixFQUFxQ1EsSUFBckMsQ0FBMEMsSUFBMUMsQ0FIaEM7QUFJSkcsWUFBRSxFQUFFLE1BQU1mLE1BQU0sQ0FBQ1UsR0FBUCxDQUFZTixDQUFELElBQU8zQyxJQUFJLENBQUNrRCxTQUFMLENBQWVQLENBQWYsQ0FBbEIsRUFBcUNRLElBQXJDLENBQTBDLElBQTFDLENBQU4sR0FBd0QsS0FBeEQsR0FBZ0VmLFNBQWhFLEdBQTRFLFNBSjVFO0FBS0ptQixZQUFFLEVBQUVoQixNQUFNLENBQUNVLEdBQVAsQ0FBWU4sQ0FBRCxJQUFPM0MsSUFBSSxDQUFDa0QsU0FBTCxDQUFlUCxDQUFmLENBQWxCLEVBQXFDUSxJQUFyQyxDQUEwQyxJQUExQyxJQUFrRCxPQUFsRCxHQUE0RGYsU0FMNUQ7QUFNSm9CLFlBQUUsRUFBRXBCLFNBQVMsR0FBRyxHQUFaLEdBQWtCRyxNQUFNLENBQUNVLEdBQVAsQ0FBWU4sQ0FBRCxJQUFPM0MsSUFBSSxDQUFDa0QsU0FBTCxDQUFlUCxDQUFmLENBQWxCLEVBQXFDUSxJQUFyQyxDQUEwQyxJQUExQyxDQUFsQixHQUFvRTtBQU5wRTtBQUhELE9BQVA7QUFZRCxLQTlEMEIsQ0ErRDNCO0FBQ0E7OztBQUNBLFdBQU87QUFDTE4sVUFBSSxFQUFFbkMsSUFBSSxDQUFDbUMsSUFETjtBQUVMQyxXQUFLLEVBQUVsQixVQUZGO0FBR0xtQixVQUFJLEVBQUU7QUFDSkMsVUFBRSxFQUFFWixTQUFTLEdBQUcsVUFBWixHQUF5QkcsTUFBTSxDQUFDSyxNQUFoQyxHQUF5QyxTQUR6QztBQUVKUSxVQUFFLEVBQUVoQixTQUFTLEdBQUcsYUFBWixHQUE0QkcsTUFBTSxDQUFDSyxNQUFuQyxHQUE0QyxXQUY1QztBQUdKUyxVQUFFLEVBQUVqQixTQUFTLEdBQUcsaUJBQVosR0FBZ0NHLE1BQU0sQ0FBQ0ssTUFBdkMsR0FBZ0QsWUFIaEQ7QUFJSlUsVUFBRSxFQUFFZixNQUFNLENBQUNLLE1BQVAsR0FBZ0IsSUFBaEIsR0FBdUJSLFNBQXZCLEdBQW1DLFNBSm5DO0FBS0ptQixVQUFFLEVBQUUsTUFBTWhCLE1BQU0sQ0FBQ0ssTUFBYixHQUFzQixPQUF0QixHQUFnQ1IsU0FMaEM7QUFNSm9CLFVBQUUsRUFBRXBCLFNBQVMsR0FBRyxHQUFaLEdBQWtCRyxNQUFNLENBQUNLLE1BQXpCLEdBQWtDO0FBTmxDO0FBSEQsS0FBUDtBQVlELEdBbkZIO0FBb0ZFN0IsS0FBRyxFQUFHZixJQUFELElBQVU7QUFDYixRQUFJQSxJQUFJLENBQUNnQixxQkFBVCxFQUNFLE9BQU9oQixJQUFJLENBQUNnQixxQkFBTCxDQUEyQk4sSUFBSSxDQUFDRSxTQUFoQyxDQUFQO0FBQ0g7QUF2RkgsQ0FaMkIsQ0FBN0I7O0FBdUdBLE1BQU02QyxvQkFBb0IsR0FBSS9DLElBQUQsSUFBVTtBQUNyQyxNQUFJLENBQUNBLElBQUksQ0FBQ2dELFFBQVYsRUFDRXpCLE9BQU8sQ0FBQ0MsS0FBUixDQUFjLHVCQUF1QnlCLElBQUksQ0FBQ0MsU0FBTCxDQUFlbEQsSUFBZixDQUFyQztBQUNGLFNBQU9ELFVBQVUsQ0FBQztBQUNoQkcsYUFBUyxFQUFFRixJQUFJLENBQUNDLEVBREE7QUFFaEJFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRWhELElBQUksQ0FBQ2dEO0FBQWpCLEtBQXZCLENBRk07QUFHaEJyQixTQUFLLEVBQUUsUUFIUztBQUloQlEsUUFBSSxFQUFFLE1BSlU7QUFLaEJWLGNBQVUsRUFBRXpCLElBQUksQ0FBQ3lCLFVBTEQ7QUFNaEJoQixrQkFBYyxFQUFFVCxJQUFJLENBQUNTLGNBQUwsR0FBc0JULElBQUksQ0FBQ1MsY0FBM0IsR0FBNENyQjtBQU41QyxHQUFELENBQWpCO0FBUUQsQ0FYRDs7QUFhQSxNQUFNZ0UsbUJBQW1CLEdBQUlwRCxJQUFELElBQVU7QUFDcEMsTUFBSSxDQUFDQSxJQUFJLENBQUNxRCxTQUFWLEVBQ0U5QixPQUFPLENBQUNDLEtBQVIsQ0FBYyx3QkFBd0J5QixJQUFJLENBQUNDLFNBQUwsQ0FBZWxELElBQWYsQ0FBdEM7QUFDRixTQUFPRCxVQUFVLENBQUM7QUFDaEJHLGFBQVMsRUFBRUYsSUFBSSxDQUFDQyxFQURBO0FBRWhCRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFRCxJQUFJLENBQUNxRDtBQUFYLEtBQW5CLENBRk07QUFHaEIxQixTQUFLLEVBQUUsU0FIUztBQUloQlEsUUFBSSxFQUFFLFFBSlU7QUFLaEJWLGNBQVUsRUFBRXpCLElBQUksQ0FBQ3lCLFVBTEQ7QUFNaEJoQixrQkFBYyxFQUFFVCxJQUFJLENBQUNTLGNBQUwsR0FBc0JULElBQUksQ0FBQ1MsY0FBM0IsR0FBNEN0QjtBQU41QyxHQUFELENBQWpCO0FBUUQsQ0FYRDs7QUFhQSxNQUFNbUUsVUFBVSxHQUFJdEQsSUFBRCxJQUFVO0FBQzNCLE1BQUksQ0FBQ0EsSUFBSSxDQUFDcUQsU0FBVixFQUNFOUIsT0FBTyxDQUFDQyxLQUFSLENBQWMsd0JBQXdCeUIsSUFBSSxDQUFDQyxTQUFMLENBQWVsRCxJQUFmLENBQXRDO0FBQ0YsU0FBT0QsVUFBVSxDQUFDO0FBQ2hCRyxhQUFTLEVBQUVGLElBQUksQ0FBQ0MsRUFEQTtBQUVoQkUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRUQsSUFBSSxDQUFDcUQ7QUFBWCxLQUFuQixDQUZNO0FBR2hCMUIsU0FBSyxFQUFFLFNBSFM7QUFJaEJRLFFBQUksRUFBRSxNQUpVO0FBS2hCMUIsa0JBQWMsRUFBRVQsSUFBSSxDQUFDUyxjQUFMLEdBQXNCVCxJQUFJLENBQUNTLGNBQTNCLEdBQTRDdEI7QUFMNUMsR0FBRCxDQUFqQjtBQU9ELENBVkQ7O0FBWUEsTUFBTW9FLHVCQUF1QixHQUFHRCxVQUFoQztBQUVBLDRDQUFlO0FBQ2JFLFFBQU0sRUFBRUMsd0NBREs7QUFFYkMsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSwwQkFETjtBQUVFRSxZQUFRLEVBQUVnRCwrREFBQSxFQUZaO0FBR0U5QyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCLFVBQUlBLE9BQU8sQ0FBQ08sT0FBUixLQUFvQixHQUF4QixFQUNFO0FBRUZSLFVBQUksQ0FBQ08sY0FBTCxHQUFzQlAsSUFBSSxDQUFDTyxjQUFMLElBQXVCLEVBQTdDLENBSnNCLENBS3RCOztBQUNBUCxVQUFJLENBQUNPLGNBQUwsQ0FBb0JOLE9BQU8sQ0FBQ1UsRUFBUixDQUFXUixXQUFYLEVBQXBCLElBQWdERixPQUFPLENBQUNPLE9BQVIsQ0FBZ0JMLFdBQWhCLEVBQWhEO0FBQ0Q7QUFWSCxHQURRLEVBYVI7QUFDRVEsTUFBRSxFQUFFLDJCQUROO0FBRUVFLFlBQVEsRUFBRWdELCtDQUFBLEVBRlo7QUFHRTlDLE9BQUcsRUFBR2YsSUFBRCxJQUFVO0FBQ2I7QUFDQUEsVUFBSSxDQUFDTyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0Q7QUFOSCxHQWJRLEVBc0JSO0FBQ0E7QUFFQTtBQUNBO0FBQ0EsS0FBR2tELG9CQUFvQixDQUFDO0FBQUU5QyxNQUFFLEVBQUUsd0JBQU47QUFBZ0MrQyxZQUFRLEVBQUUsS0FBMUM7QUFBaUR2QyxrQkFBYyxFQUFFO0FBQWpFLEdBQUQsQ0EzQmYsRUE0QlI7QUFDQSxLQUFHc0Msb0JBQW9CLENBQUM7QUFBRTlDLE1BQUUsRUFBRSxpQkFBTjtBQUF5QitDLFlBQVEsRUFBRSxRQUFuQztBQUE2Q3ZCLGNBQVUsRUFBRSxJQUF6RDtBQUErRGhCLGtCQUFjLEVBQUU7QUFBL0UsR0FBRCxDQTdCZixFQStCUixHQUFHc0Msb0JBQW9CLENBQUM7QUFBRTlDLE1BQUUsRUFBRSxhQUFOO0FBQXFCK0MsWUFBUSxFQUFFLEtBQS9CO0FBQXNDdkIsY0FBVSxFQUFFO0FBQWxELEdBQUQsQ0EvQmYsRUFpQ1IsR0FBRzhCLHVCQUF1QixDQUFDO0FBQUV0RCxNQUFFLEVBQUUsZ0JBQU47QUFBd0JvRCxhQUFTLEVBQUU7QUFBbkMsR0FBRCxDQWpDbEIsRUFrQ1IsR0FBR0UsdUJBQXVCLENBQUM7QUFBRXRELE1BQUUsRUFBRSxpQkFBTjtBQUF5Qm9ELGFBQVMsRUFBRTtBQUFwQyxHQUFELENBbENsQixFQW1DUixHQUFHRSx1QkFBdUIsQ0FBQztBQUFFdEQsTUFBRSxFQUFFLGNBQU47QUFBc0JvRCxhQUFTLEVBQUU7QUFBakMsR0FBRCxDQW5DbEIsRUFxQ1I7QUFDQSxLQUFHRCxtQkFBbUIsQ0FBQztBQUFFbkQsTUFBRSxFQUFFLGtCQUFOO0FBQTBCb0QsYUFBUyxFQUFFO0FBQXJDLEdBQUQsQ0F0Q2QsRUF1Q1IsR0FBR0QsbUJBQW1CLENBQUM7QUFBRW5ELE1BQUUsRUFBRSxZQUFOO0FBQW9Cb0QsYUFBUyxFQUFFO0FBQS9CLEdBQUQsQ0F2Q2QsRUF3Q1IsR0FBR0QsbUJBQW1CLENBQUM7QUFBRW5ELE1BQUUsRUFBRSxhQUFOO0FBQXFCb0QsYUFBUyxFQUFFO0FBQWhDLEdBQUQsQ0F4Q2QsRUF5Q1IsR0FBR0QsbUJBQW1CLENBQUM7QUFBRW5ELE1BQUUsRUFBRSxlQUFOO0FBQXVCb0QsYUFBUyxFQUFFO0FBQWxDLEdBQUQsQ0F6Q2QsRUEwQ1IsR0FBR0QsbUJBQW1CLENBQUM7QUFBRW5ELE1BQUUsRUFBRSxVQUFOO0FBQWtCb0QsYUFBUyxFQUFFO0FBQTdCLEdBQUQsQ0ExQ2QsRUEyQ1IsR0FBR0QsbUJBQW1CLENBQUM7QUFBRW5ELE1BQUUsRUFBRSxjQUFOO0FBQXNCb0QsYUFBUyxFQUFFLElBQWpDO0FBQXVDNUIsY0FBVSxFQUFFO0FBQW5ELEdBQUQsQ0EzQ2QsRUE2Q1I7QUFDQTtBQUNBO0FBQ0E7QUFFQSxLQUFHOEIsdUJBQXVCLENBQUM7QUFBRXRELE1BQUUsRUFBRSxZQUFOO0FBQW9Cb0QsYUFBUyxFQUFFO0FBQS9CLEdBQUQsQ0FsRGxCLEVBbURSLEdBQUdFLHVCQUF1QixDQUFDO0FBQUV0RCxNQUFFLEVBQUUsV0FBTjtBQUFtQm9ELGFBQVMsRUFBRTtBQUE5QixHQUFELENBbkRsQixFQW9EUixHQUFHRSx1QkFBdUIsQ0FBQztBQUFFdEQsTUFBRSxFQUFFLGNBQU47QUFBc0JvRCxhQUFTLEVBQUU7QUFBakMsR0FBRCxDQXBEbEIsRUFzRFIsR0FBR0UsdUJBQXVCLENBQUM7QUFBRXRELE1BQUUsRUFBRSxRQUFOO0FBQWdCb0QsYUFBUyxFQUFFO0FBQTNCLEdBQUQsQ0F0RGxCLEVBd0RSLEdBQUdELG1CQUFtQixDQUFDO0FBQUVuRCxNQUFFLEVBQUUsVUFBTjtBQUFrQm9ELGFBQVMsRUFBRTtBQUE3QixHQUFELENBeERkLEVBMERSO0FBQ0E7QUFDQTtBQUVBLEtBQUdDLFVBQVUsQ0FBQztBQUFFckQsTUFBRSxFQUFFLFFBQU47QUFBZ0JvRCxhQUFTLEVBQUU7QUFBM0IsR0FBRCxDQTlETCxFQStEUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxXQUFOO0FBQW1Cb0QsYUFBUyxFQUFFO0FBQTlCLEdBQUQsQ0EvREwsRUFnRVIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsa0JBQU47QUFBMEJvRCxhQUFTLEVBQUU7QUFBckMsR0FBRCxDQWhFTCxFQWlFUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxZQUFOO0FBQW9Cb0QsYUFBUyxFQUFFO0FBQS9CLEdBQUQsQ0FqRUwsRUFrRVIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsb0JBQU47QUFBNEJvRCxhQUFTLEVBQUU7QUFBdkMsR0FBRCxDQWxFTCxFQW1FUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxlQUFOO0FBQXVCb0QsYUFBUyxFQUFFO0FBQWxDLEdBQUQsQ0FuRUwsRUFxRVIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsUUFBTjtBQUFnQm9ELGFBQVMsRUFBRTtBQUEzQixHQUFELENBckVMLEVBc0VSLEdBQUdDLFVBQVUsQ0FBQztBQUFFckQsTUFBRSxFQUFFLGdCQUFOO0FBQXdCb0QsYUFBUyxFQUFFO0FBQW5DLEdBQUQsQ0F0RUwsRUF1RVIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsb0JBQU47QUFBNEJvRCxhQUFTLEVBQUU7QUFBdkMsR0FBRCxDQXZFTCxFQXdFUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxpQkFBTjtBQUF5Qm9ELGFBQVMsRUFBRTtBQUFwQyxHQUFELENBeEVMLEVBeUVSLEdBQUdDLFVBQVUsQ0FBQztBQUFFckQsTUFBRSxFQUFFLGNBQU47QUFBc0JvRCxhQUFTLEVBQUU7QUFBakMsR0FBRCxDQXpFTCxFQTBFUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxhQUFOO0FBQXFCb0QsYUFBUyxFQUFFO0FBQWhDLEdBQUQsQ0ExRUwsRUEyRVIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsa0JBQU47QUFBMEJvRCxhQUFTLEVBQUU7QUFBckMsR0FBRCxDQTNFTCxFQTRFUixHQUFHRSx1QkFBdUIsQ0FBQztBQUFFdEQsTUFBRSxFQUFFLGtCQUFOO0FBQTBCb0QsYUFBUyxFQUFFO0FBQXJDLEdBQUQsQ0E1RWxCLEVBNkVSLEdBQUdFLHVCQUF1QixDQUFDO0FBQUV0RCxNQUFFLEVBQUUsdUJBQU47QUFBK0JvRCxhQUFTLEVBQUU7QUFBMUMsR0FBRCxDQTdFbEIsRUE4RVIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsZ0JBQU47QUFBd0JvRCxhQUFTLEVBQUU7QUFBbkMsR0FBRCxDQTlFTCxFQWdGUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxRQUFOO0FBQWdCb0QsYUFBUyxFQUFFO0FBQTNCLEdBQUQsQ0FoRkwsRUFpRlIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsaUJBQU47QUFBeUJvRCxhQUFTLEVBQUU7QUFBcEMsR0FBRCxDQWpGTCxFQWtGUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxpQkFBTjtBQUF5Qm9ELGFBQVMsRUFBRTtBQUFwQyxHQUFELENBbEZMLEVBbUZSLEdBQUdDLFVBQVUsQ0FBQztBQUFFckQsTUFBRSxFQUFFLHNCQUFOO0FBQThCb0QsYUFBUyxFQUFFO0FBQXpDLEdBQUQsQ0FuRkwsRUFvRlIsR0FBR0MsVUFBVSxDQUFDO0FBQUVyRCxNQUFFLEVBQUUsZUFBTjtBQUF1Qm9ELGFBQVMsRUFBRTtBQUFsQyxHQUFELENBcEZMLEVBc0ZSLEdBQUdDLFVBQVUsQ0FBQztBQUFFckQsTUFBRSxFQUFFLFlBQU47QUFBb0JvRCxhQUFTLEVBQUU7QUFBL0IsR0FBRCxDQXRGTCxFQXVGUixHQUFHQyxVQUFVLENBQUM7QUFBRXJELE1BQUUsRUFBRSxTQUFOO0FBQWlCb0QsYUFBUyxFQUFFO0FBQTVCLEdBQUQsQ0F2RkwsRUF5RlI7QUFDQTtBQUNBLEtBQUdFLHVCQUF1QixDQUFDO0FBQUV0RCxNQUFFLEVBQUUsbUJBQU47QUFBMkJvRCxhQUFTLEVBQUU7QUFBdEMsR0FBRCxDQTNGbEI7QUFGRyxDQUFmLEU7O0FDdEtBO0NBR0E7O0FBQ0EsOENBQWU7QUFDYkcsUUFBTSxFQUFFQyx3Q0FESztBQUViQyxVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0F6RCxNQUFFLEVBQUU7QUFGTixHQURRLEVBS1I7QUFDRUEsTUFBRSxFQUFFLG1CQUROO0FBRUU7QUFDQUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FIWjtBQUlFNUMsYUFBUyxFQUFFLENBQUN1RCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzdCO0FBQ0EsYUFBT0EsT0FBTyxDQUFDcUMsTUFBUixLQUFtQnJDLE9BQU8sQ0FBQzRCLE1BQWxDO0FBQ0QsS0FQSDtBQVFFUixXQUFPLEVBQUUsQ0FBQ3JCLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUMxQkQsVUFBSSxDQUFDc0UsUUFBTCxHQUFnQnRFLElBQUksQ0FBQ3NFLFFBQUwsSUFBaUIsRUFBakMsQ0FEMEIsQ0FFMUI7QUFDQTs7QUFDQSxVQUFJLENBQUN0RSxJQUFJLENBQUN1RSxRQUFOLElBQWtCdkUsSUFBSSxDQUFDc0UsUUFBTCxDQUFjckUsT0FBTyxDQUFDcUMsTUFBdEIsQ0FBdEIsRUFDRTtBQUNGdEMsVUFBSSxDQUFDc0UsUUFBTCxDQUFjckUsT0FBTyxDQUFDcUMsTUFBdEIsSUFBZ0MsSUFBaEM7QUFDQSxhQUFPO0FBQ0xPLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRSxnQkFEQTtBQUVKSSxZQUFFLEVBQUUsdUJBRkE7QUFHSkMsWUFBRSxFQUFFLDBCQUhBO0FBSUpDLFlBQUUsRUFBRSxTQUpBO0FBS0pDLFlBQUUsRUFBRSxVQUxBO0FBTUpDLFlBQUUsRUFBRTtBQU5BO0FBSEQsT0FBUDtBQVlEO0FBM0JILEdBTFEsRUFrQ1I7QUFDRTdDLE1BQUUsRUFBRSxrQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCLFVBQUksQ0FBQ0QsSUFBSSxDQUFDc0UsUUFBVixFQUNFO0FBQ0YsYUFBT3RFLElBQUksQ0FBQ3NFLFFBQUwsQ0FBY3JFLE9BQU8sQ0FBQ3FDLE1BQXRCLENBQVA7QUFDRDtBQVBILEdBbENRLEVBMkNSO0FBQ0UzQixNQUFFLEVBQUUsdUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRUcsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDd0UsVUFBTCxDQUFnQnZFLE9BQU8sQ0FBQ0MsUUFBeEIsQ0FIaEM7QUFJRW1CLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMQyxhQUFLLEVBQUU3QyxPQUFPLENBQUM0QixNQUZWO0FBR0xrQixZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLE9BREE7QUFFSkksWUFBRSxFQUFFLE1BRkE7QUFHSkMsWUFBRSxFQUFFLE9BSEE7QUFJSkMsWUFBRSxFQUFFLEtBSkE7QUFLSkMsWUFBRSxFQUFFLElBTEE7QUFNSkMsWUFBRSxFQUFFO0FBTkE7QUFIRCxPQUFQO0FBWUQ7QUFqQkgsR0EzQ1E7QUFGRyxDQUFmLEU7O0FDSkE7Q0FHQTs7QUFDQSwyQ0FBZTtBQUNiVSxRQUFNLEVBQUVDLG9EQURLO0FBRWJDLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsVUFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUZaO0FBR0VDLGNBQVUsRUFBRWIsaURBQUEsQ0FBdUI7QUFBRVksVUFBSSxFQUFFO0FBQVIsS0FBdkIsQ0FIZDtBQUlFRSxjQUFVLEVBQUVkLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBSmQ7QUFLRUcsY0FBVSxFQUFFZixpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUxkO0FBTUVJLGNBQVUsRUFBRWhCLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBTmQ7QUFPRXBELFdBQU8sRUFBR3JCLElBQUQsSUFBVTtBQUNqQixhQUFPO0FBQ0w2QyxZQUFJLEVBQUUsTUFERDtBQUVMQyxhQUFLLEVBQUU5QyxJQUFJLENBQUM4RSxFQUZQO0FBR0xDLGdCQUFRLEVBQUU7QUFDUi9CLFlBQUUsRUFBRSxLQURJO0FBRVJJLFlBQUUsRUFBRSxPQUZJO0FBR1JDLFlBQUUsRUFBRSxRQUhJO0FBSVJDLFlBQUUsRUFBRSxLQUpJO0FBS1JDLFlBQUUsRUFBRSxJQUxJO0FBTVJDLFlBQUUsRUFBRTtBQU5JO0FBSEwsT0FBUDtBQVlEO0FBcEJILEdBRFEsRUF1QlI7QUFDRTdDLE1BQUUsRUFBRSxXQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBRlo7QUFHRUMsY0FBVSxFQUFFYixpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUhkO0FBSUVFLGNBQVUsRUFBRWQsaURBQUEsQ0FBdUI7QUFBRVksVUFBSSxFQUFFO0FBQVIsS0FBdkIsQ0FKZDtBQUtFRyxjQUFVLEVBQUVmLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBTGQ7QUFNRUksY0FBVSxFQUFFaEIsaURBQUEsQ0FBdUI7QUFBRVksVUFBSSxFQUFFO0FBQVIsS0FBdkIsQ0FOZDtBQU9FcEQsV0FBTyxFQUFHckIsSUFBRCxJQUFVO0FBQ2pCLGFBQU87QUFDTDZDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTlDLElBQUksQ0FBQzhFLEVBRlA7QUFHTEMsZ0JBQVEsRUFBRTtBQUNSL0IsWUFBRSxFQUFFLFlBREk7QUFFUkksWUFBRSxFQUFFLGFBRkk7QUFHUkMsWUFBRSxFQUFFLFlBSEk7QUFJUkMsWUFBRSxFQUFFLEtBSkk7QUFLUkMsWUFBRSxFQUFFLElBTEk7QUFNUkMsWUFBRSxFQUFFO0FBTkk7QUFITCxPQUFQO0FBWUQ7QUFwQkgsR0F2QlEsRUE2Q1I7QUFDRTdDLE1BQUUsRUFBRSxnQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBdkIsQ0FGWjtBQUdFRyxhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQzVCLFVBQUlBLE9BQU8sQ0FBQzRCLE1BQVIsS0FBbUI3QixJQUFJLENBQUM4RSxFQUE1QixFQUNFLE9BQU8sS0FBUDtBQUNGLFlBQU1FLHFCQUFxQixHQUFHO0FBQzVCaEMsVUFBRSxFQUFFLGdCQUR3QjtBQUU1QkssVUFBRSxFQUFFLDJCQUZ3QjtBQUc1QkMsVUFBRSxFQUFFLElBSHdCO0FBSTVCQyxVQUFFLEVBQUUsSUFKd0I7QUFLNUJDLFVBQUUsRUFBRTtBQUx3QixPQUE5QjtBQU9BLFlBQU15QixrQkFBa0IsR0FBR3pDLE1BQU0sQ0FBQzBDLE1BQVAsQ0FBY0YscUJBQWQsQ0FBM0I7QUFDQSxhQUFPQyxrQkFBa0IsQ0FBQzNFLFFBQW5CLENBQTRCTCxPQUFPLENBQUNxQyxNQUFwQyxDQUFQO0FBQ0QsS0FmSDtBQWdCRWpCLFdBQU8sRUFBRSxDQUFDckIsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQzFCRCxVQUFJLENBQUNtRixTQUFMLEdBQWlCbkYsSUFBSSxDQUFDbUYsU0FBTCxJQUFrQixDQUFuQztBQUNBbkYsVUFBSSxDQUFDbUYsU0FBTDtBQUNBLFlBQU1wQyxJQUFJLEdBQUksR0FBRTlDLE9BQU8sQ0FBQ21GLE9BQVEsS0FBSXBGLElBQUksQ0FBQ21GLFNBQVUsTUFBS25GLElBQUksQ0FBQ3FGLGlCQUFMLENBQXVCcEYsT0FBdkIsQ0FBZ0MsRUFBeEY7QUFDQSxhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFOUMsSUFBSSxDQUFDOEUsRUFBNUI7QUFBZ0MvQixZQUFJLEVBQUVBO0FBQXRDLE9BQVA7QUFDRDtBQXJCSCxHQTdDUSxFQW9FUjtBQUNFcEMsTUFBRSxFQUFFLGtCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTVDLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUJBLE9BQU8sQ0FBQzRCLE1BQVIsS0FBbUI3QixJQUFJLENBQUM4RSxFQUh4RDtBQUlFekQsV0FBTyxFQUFFLENBQUNyQixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDMUIsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTlDLElBQUksQ0FBQzhFLEVBQTVCO0FBQWdDL0IsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBOUMsT0FBUDtBQUNEO0FBTkgsR0FwRVEsRUE0RVI7QUFDRTNFLE1BQUUsRUFBRSxXQUROO0FBRUVFLFlBQVEsRUFBRWdELG1DQUFBLENBQWdCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQWhCLENBRlo7QUFHRXJELG1CQUFlLEVBQUUsRUFIbkI7QUFJRUMsV0FBTyxFQUFFLENBQUNyQixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDMUIsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTlDLElBQUksQ0FBQzhFLEVBQTVCO0FBQWdDL0IsWUFBSSxFQUFFOUMsT0FBTyxDQUFDd0U7QUFBOUMsT0FBUDtBQUNEO0FBTkgsR0E1RVEsRUFvRlI7QUFDRTlELE1BQUUsRUFBRSxtQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUZaO0FBR0VDLGNBQVUsRUFBRWIsaURBQUEsQ0FBdUI7QUFBRVksVUFBSSxFQUFFO0FBQVIsS0FBdkIsQ0FIZDtBQUlFRSxjQUFVLEVBQUVkLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBSmQ7QUFLRUcsY0FBVSxFQUFFZixpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUxkO0FBTUVJLGNBQVUsRUFBRWhCLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBTmQ7QUFPRTFELE9BQUcsRUFBR2YsSUFBRCxJQUFVO0FBQ2JBLFVBQUksQ0FBQ3VGLFNBQUwsR0FBaUIsQ0FBQ3ZGLElBQUksQ0FBQ3VGLFNBQUwsSUFBa0IsQ0FBbkIsSUFBd0IsQ0FBekM7QUFDRDtBQVRILEdBcEZRLEVBK0ZSO0FBQ0U1RSxNQUFFLEVBQUUsV0FETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUZaO0FBR0VDLGNBQVUsRUFBRWIsaURBQUEsQ0FBdUI7QUFBRVksVUFBSSxFQUFFO0FBQVIsS0FBdkIsQ0FIZDtBQUlFRSxjQUFVLEVBQUVkLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBSmQ7QUFLRUcsY0FBVSxFQUFFZixpREFBQSxDQUF1QjtBQUFFWSxVQUFJLEVBQUU7QUFBUixLQUF2QixDQUxkO0FBTUVJLGNBQVUsRUFBRWhCLGlEQUFBLENBQXVCO0FBQUVZLFVBQUksRUFBRTtBQUFSLEtBQXZCLENBTmQ7QUFPRXZELGdCQUFZLEVBQUUsQ0FQaEI7QUFRRUcsV0FBTyxFQUFHckIsSUFBRCxJQUFVO0FBQ2pCO0FBQ0EsVUFBSSxDQUFDQSxJQUFJLENBQUN1RixTQUFOLElBQW1CdkYsSUFBSSxDQUFDdUYsU0FBTCxJQUFrQixDQUF6QyxFQUNFO0FBQ0YsYUFBTztBQUNMMUMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFOUMsSUFBSSxDQUFDOEUsRUFGUDtBQUdML0IsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRyxtQkFBa0JoRCxJQUFJLENBQUN1RixTQUFVLEdBRGxDO0FBRUpuQyxZQUFFLEVBQUcscUJBQW9CcEQsSUFBSSxDQUFDdUYsU0FBVSxHQUZwQztBQUdKbEMsWUFBRSxFQUFHLG9CQUFtQnJELElBQUksQ0FBQ3VGLFNBQVUsR0FIbkM7QUFJSmpDLFlBQUUsRUFBRyxhQUFZdEQsSUFBSSxDQUFDdUYsU0FBVSxHQUo1QjtBQUtKaEMsWUFBRSxFQUFHLFVBQVN2RCxJQUFJLENBQUN1RixTQUFVLEdBTHpCO0FBTUovQixZQUFFLEVBQUcsYUFBWXhELElBQUksQ0FBQ3VGLFNBQVU7QUFONUI7QUFIRCxPQUFQO0FBWUQsS0F4Qkg7QUF5QkV4RSxPQUFHLEVBQUdmLElBQUQsSUFBVSxPQUFPQSxJQUFJLENBQUN1RjtBQXpCN0IsR0EvRlE7QUFGRyxDQUFmLEU7O0NDRkE7O0FBQ0EsK0NBQWU7QUFDYnJCLFFBQU0sRUFBRUMsc0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDZCQUF5QjtBQURmLEdBRkM7QUFLYkMsV0FBUyxFQUFFO0FBQ1QsMEJBQXNCLEtBRGI7QUFFVCx3QkFBb0I7QUFGWDtBQUxFLENBQWYsRTs7Q0NEQTs7QUFDQSwrQ0FBZTtBQUNidkIsUUFBTSxFQUFFQyx3Q0FESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysa0NBQThCO0FBRHBCLEdBRkM7QUFLYkUsWUFBVSxFQUFFO0FBQ1YseUJBQXFCO0FBRFgsR0FMQztBQVFiRCxXQUFTLEVBQUU7QUFDVCwyQkFBdUI7QUFEZDtBQVJFLENBQWYsRTs7QUNIQTtDQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7O0FBQ0EsOENBQWU7QUFDYnZCLFFBQU0sRUFBRUMsZ0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHlCQUFxQixLQURYO0FBQ2tCO0FBQzVCLHlCQUFxQixLQUZYO0FBRWtCO0FBQzVCLHlCQUFxQixLQUhYLENBR2tCOztBQUhsQixHQUZDO0FBT2JFLFlBQVUsRUFBRTtBQUNWLHdCQUFvQixLQURWO0FBQ2lCO0FBQzNCLDhCQUEwQixLQUZoQjtBQUV1QjtBQUNqQyw4QkFBMEIsS0FIaEI7QUFHdUI7QUFDakMsOEJBQTBCLEtBSmhCLENBSXVCOztBQUp2QixHQVBDO0FBYWJDLGlCQUFlLEVBQUU7QUFDZixxQkFBaUIsS0FERixDQUNTOztBQURULEdBYko7QUFnQmJDLGlCQUFlLEVBQUU7QUFDZix1QkFBbUIsS0FESixDQUNXOztBQURYLEdBaEJKO0FBbUJieEIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSw4QkFETjtBQUVFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBbkIsQ0FGWjtBQUdFa0YsZUFBVyxFQUFFLENBQUN4QixLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQy9CLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0x3RCxjQUFNLEVBQUU7QUFDTjlDLFlBQUUsRUFBRSxhQURFO0FBRU5JLFlBQUUsRUFBRSxnQkFGRTtBQUdOQyxZQUFFLEVBQUUsa0JBSEU7QUFJTkMsWUFBRSxFQUFFLFFBSkU7QUFLTkMsWUFBRSxFQUFFLE1BTEU7QUFNTkMsWUFBRSxFQUFFO0FBTkU7QUFISCxPQUFQO0FBWUQ7QUFoQkgsR0FEUTtBQW5CRyxDQUFmLEU7O0FDYkE7Q0FHQTs7QUFDQSwrQ0FBZTtBQUNiVSxRQUFNLEVBQUVDLDRFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVjtBQUNBLDZCQUF5QixLQUZmO0FBR1Y7QUFDQSw0QkFBd0I7QUFKZCxHQUZDO0FBUWJDLFdBQVMsRUFBRTtBQUNUO0FBQ0EsK0JBQTJCLEtBRmxCO0FBR1Q7QUFDQSx5QkFBcUI7QUFKWixHQVJFO0FBY2JNLFdBQVMsRUFBRTtBQUNUO0FBQ0Esd0JBQW9CO0FBRlgsR0FkRTtBQWtCYjNCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsc0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRUksT0FBRyxFQUFHZixJQUFELElBQVU7QUFDYkEsVUFBSSxDQUFDZ0csZUFBTCxHQUF1QixJQUF2QjtBQUNEO0FBTEgsR0FEUSxFQVFSO0FBQ0VyRixNQUFFLEVBQUUscUJBRE47QUFFRTtBQUNBO0FBQ0FFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSlo7QUFLRTVDLGFBQVMsRUFBR2QsSUFBRCxJQUFVO0FBQ25CO0FBQ0E7QUFDQSxhQUFPQSxJQUFJLENBQUNnRyxlQUFaO0FBQ0QsS0FUSDtBQVVFM0UsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBWkgsR0FSUTtBQWxCRyxDQUFmLEU7O0FDSkE7Q0FHQTs7QUFDQSwrQ0FBZTtBQUNicEIsUUFBTSxFQUFFQyxrRkFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Y7QUFDQSw2QkFBeUIsS0FGZjtBQUdWO0FBQ0Esd0JBQW9CLEtBSlY7QUFLVjtBQUNBLDRCQUF3QjtBQU5kLEdBRkM7QUFVYkUsWUFBVSxFQUFFO0FBQ1Y7QUFDQSwyQkFBdUI7QUFGYixHQVZDO0FBY2JELFdBQVMsRUFBRTtBQUNUO0FBQ0EseUJBQXFCO0FBRlosR0FkRTtBQWtCYk0sV0FBUyxFQUFFO0FBQ1Q7QUFDQSx5QkFBcUI7QUFGWixHQWxCRTtBQXNCYkUsVUFBUSxFQUFFO0FBQ1I7QUFDQSx3QkFBb0I7QUFGWixHQXRCRztBQTBCYjdCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUscUJBRE47QUFFRTtBQUNBO0FBQ0FFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSlo7QUFLRTVDLGFBQVMsRUFBRSxDQUFDdUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUM3QjtBQUNBLGFBQU9pRyxVQUFVLENBQUNqRyxPQUFPLENBQUNrRyxRQUFULENBQVYsR0FBK0IsRUFBdEM7QUFDRCxLQVJIO0FBU0U5RSxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQO0FBQ0Q7QUFYSCxHQURRO0FBMUJHLENBQWYsRTs7Q0NGQTs7QUFDQSwrQ0FBZTtBQUNicEIsUUFBTSxFQUFFQyxnREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysa0NBQThCLEtBRHBCO0FBRVYscUJBQWlCO0FBRlAsR0FGQztBQU1iRSxZQUFVLEVBQUU7QUFDVix5QkFBcUI7QUFEWCxHQU5DO0FBU2JELFdBQVMsRUFBRTtBQUNULDJCQUF1QjtBQURkLEdBVEU7QUFZYk0sV0FBUyxFQUFFO0FBQ1QsK0JBQTJCO0FBRGxCO0FBWkUsQ0FBZixFOztDQ0RBOztBQUNBLCtDQUFlO0FBQ2I3QixRQUFNLEVBQUVDLHNEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixrQ0FBOEIsS0FEcEI7QUFFVixxQkFBaUI7QUFGUCxHQUZDO0FBTWJFLFlBQVUsRUFBRTtBQUNWLHlCQUFxQixLQURYO0FBRVYsZ0NBQTRCO0FBRmxCLEdBTkM7QUFVYkQsV0FBUyxFQUFFO0FBQ1QsMkJBQXVCO0FBRGQsR0FWRTtBQWFiTSxXQUFTLEVBQUU7QUFDVCwrQkFBMkI7QUFEbEI7QUFiRSxDQUFmLEU7O0FDSEE7QUFDQTtBQUVBLG1EQUFlO0FBQ2I3QixRQUFNLEVBQUVDLGtFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw2QkFBeUIsTUFEZjtBQUN1QjtBQUNqQyw0QkFBd0IsTUFGZDtBQUVzQjtBQUNoQywwQkFBc0IsTUFIWjtBQUdvQjtBQUM5Qiw0QkFBd0IsTUFKZDtBQUlzQjtBQUNoQywwQkFBc0IsTUFMWjtBQUtvQjtBQUM5QiwwQkFBc0IsTUFOWjtBQU1vQjtBQUM5QiwwQkFBc0IsTUFQWjtBQU9vQjtBQUM5Qiw2QkFBeUIsTUFSZjtBQVF1QjtBQUNqQyx1QkFBbUIsTUFUVDtBQVNpQjtBQUMzQiwwQkFBc0IsTUFWWjtBQVVvQjtBQUM5Qiw2QkFBeUIsTUFYZjtBQVd1QjtBQUNqQyxtQkFBZSxNQVpMO0FBWWE7QUFDdkIsNkJBQXlCLE1BYmY7QUFhdUI7QUFDakM7QUFDQSwwQkFBc0IsTUFmWjtBQWVvQjtBQUM5QiwwQkFBc0IsTUFoQlo7QUFnQm9CO0FBQzlCLHlCQUFxQixNQWpCWDtBQWlCbUI7QUFDN0IseUJBQXFCLE1BbEJYO0FBa0JtQjtBQUM3Qiw0QkFBd0IsTUFuQmQ7QUFtQnNCO0FBQ2hDLHlCQUFxQixNQXBCWDtBQW9CbUI7QUFDN0IsMEJBQXNCLE1BckJaO0FBcUJvQjtBQUM5Qiw0QkFBd0IsTUF0QmQ7QUFzQnNCO0FBQ2hDLG1DQUErQixNQXZCckI7QUF1QjZCO0FBQ3ZDLDJCQUF1QixNQXhCYixDQXdCcUI7O0FBeEJyQixHQUZDO0FBNEJiQyxXQUFTLEVBQUU7QUFDVCwyQkFBdUIsTUFEZDtBQUNzQjtBQUMvQiw0QkFBd0IsTUFGZjtBQUV1QjtBQUNoQyx3QkFBb0IsTUFIWDtBQUdtQjtBQUM1QjtBQUNBO0FBQ0EsMkJBQXVCLE1BTmQ7QUFNc0I7QUFDL0IsMkJBQXVCLE1BUGQ7QUFPc0I7QUFDL0IsNkJBQXlCLE1BUmhCLENBUXdCOztBQVJ4QixHQTVCRTtBQXNDYkUsaUJBQWUsRUFBRTtBQUNmLHdCQUFvQixLQURMO0FBQ1k7QUFDM0IsNkJBQXlCLEtBRlY7QUFFaUI7QUFDaEMsb0JBQWdCLEtBSEQ7QUFHUTtBQUN2QixvQkFBZ0IsS0FKRDtBQUlRO0FBQ3ZCLDRCQUF3QixLQUxUO0FBS2dCO0FBQy9CLG9CQUFnQixJQU5ELENBTU87O0FBTlAsR0F0Q0o7QUE4Q2J2QixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLDRDQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ29HLE1BQUwsR0FBY3BHLElBQUksQ0FBQ29HLE1BQUwsSUFBZSxFQUE3QjtBQUNBcEcsVUFBSSxDQUFDb0csTUFBTCxDQUFZbkcsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsSUFBOUI7QUFDRDtBQU5ILEdBRFEsRUFTUjtBQUNFM0IsTUFBRSxFQUFFLDRDQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ29HLE1BQUwsR0FBY3BHLElBQUksQ0FBQ29HLE1BQUwsSUFBZSxFQUE3QjtBQUNBcEcsVUFBSSxDQUFDb0csTUFBTCxDQUFZbkcsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsS0FBOUI7QUFDRDtBQU5ILEdBVFEsRUFpQlI7QUFDRTNCLE1BQUUsRUFBRSw0QkFETjtBQUVFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBbkIsQ0FGWjtBQUdFRyxhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUNvRyxNQUFMLElBQWUsQ0FBQ3BHLElBQUksQ0FBQ29HLE1BQUwsQ0FBWW5HLE9BQU8sQ0FBQ3FDLE1BQXBCLENBSGhEO0FBSUVqQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0Q7QUFOSCxHQWpCUSxFQXlCUjtBQUNFekUsTUFBRSxFQUFFLCtCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3FHLE1BQUwsR0FBY3JHLElBQUksQ0FBQ3FHLE1BQUwsSUFBZSxFQUE3QjtBQUNBckcsVUFBSSxDQUFDcUcsTUFBTCxDQUFZcEcsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsSUFBOUI7QUFDRDtBQU5ILEdBekJRLEVBaUNSO0FBQ0UzQixNQUFFLEVBQUUsK0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDcUcsTUFBTCxHQUFjckcsSUFBSSxDQUFDcUcsTUFBTCxJQUFlLEVBQTdCO0FBQ0FyRyxVQUFJLENBQUNxRyxNQUFMLENBQVlwRyxPQUFPLENBQUNxQyxNQUFwQixJQUE4QixLQUE5QjtBQUNEO0FBTkgsR0FqQ1EsRUF5Q1I7QUFDRTNCLE1BQUUsRUFBRSwwQkFETjtBQUVFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBbkIsQ0FGWjtBQUdFRyxhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUNxRyxNQUFMLElBQWUsQ0FBQ3JHLElBQUksQ0FBQ3FHLE1BQUwsQ0FBWXBHLE9BQU8sQ0FBQ3FDLE1BQXBCLENBSGhEO0FBSUVqQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0Q7QUFOSCxHQXpDUSxFQWlEUjtBQUNFO0FBQ0F6RSxNQUFFLEVBQUUseUJBRk47QUFHRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWhCLFVBQUksRUFBRSxJQUFSO0FBQWNsQyxRQUFFLEVBQUU7QUFBbEIsS0FBbkIsQ0FIWjtBQUlFVSxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLFlBREE7QUFFSkksWUFBRSxFQUFFLFlBRkE7QUFHSkMsWUFBRSxFQUFFLFlBSEE7QUFJSkMsWUFBRSxFQUFFLFFBSkE7QUFLSkMsWUFBRSxFQUFFLE1BTEE7QUFNSkMsWUFBRSxFQUFFO0FBTkE7QUFIRCxPQUFQO0FBWUQ7QUFqQkgsR0FqRFEsRUFvRVI7QUFDRTdDLE1BQUUsRUFBRSxtQkFETjtBQUVFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBbkIsQ0FGWjtBQUdFa0YsZUFBVyxFQUFFLENBQUN4QixLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQy9CLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0x3RCxjQUFNLEVBQUU7QUFDTjlDLFlBQUUsRUFBRSxXQURFO0FBRU5JLFlBQUUsRUFBRSxzQkFGRTtBQUdOQyxZQUFFLEVBQUUsZUFIRTtBQUlOQyxZQUFFLEVBQUUsUUFKRTtBQUtOQyxZQUFFLEVBQUUsS0FMRTtBQU1OQyxZQUFFLEVBQUU7QUFORTtBQUhILE9BQVA7QUFZRDtBQWhCSCxHQXBFUTtBQTlDRyxDQUFmLEU7O0FDSEE7Q0FHQTs7QUFDQSx3RUFBZTtBQUNiVSxRQUFNLEVBQUVDLDRGQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVix1QkFBbUIsS0FEVDtBQUNnQjtBQUMxQix3QkFBb0IsS0FGVjtBQUVpQjtBQUMzQix3QkFBb0IsTUFIVjtBQUdrQjtBQUM1QixtQ0FBK0IsTUFKckI7QUFJNkI7QUFDdkMsMEJBQXNCLE1BTFo7QUFLb0I7QUFDOUIsMkJBQXVCLE1BTmI7QUFNcUI7QUFDL0IscUJBQWlCLE1BUFA7QUFPZTtBQUN6QiwyQkFBdUIsTUFSYjtBQVFxQjtBQUMvQixvQkFBZ0IsTUFUTjtBQVNjO0FBQ3hCLHFCQUFpQixNQVZQO0FBVWU7QUFDekIsZ0JBQVksS0FYRjtBQVdTO0FBQ25CLHdCQUFvQixLQVpWO0FBWWlCO0FBQzNCLGdDQUE0QixNQWJsQjtBQWEwQjtBQUNwQyxjQUFVLE1BZEE7QUFjUTtBQUNsQixxQkFBaUIsTUFmUDtBQWVlO0FBQ3pCLHdCQUFvQixNQWhCVjtBQWdCa0I7QUFDNUIseUJBQXFCLEtBakJYO0FBaUJrQjtBQUM1QixzQkFBa0IsS0FsQlI7QUFrQmU7QUFDekIsdUJBQW1CLE1BbkJUO0FBbUJpQjtBQUMzQiwwQkFBc0IsTUFwQlo7QUFvQm9CO0FBQzlCLHNCQUFrQixNQXJCUjtBQXFCZ0I7QUFDMUIsd0JBQW9CLE1BdEJWO0FBc0JrQjtBQUM1Qiw0QkFBd0IsTUF2QmQ7QUF1QnNCO0FBQ2hDLHdCQUFvQixNQXhCVjtBQXdCa0I7QUFDNUIsNEJBQXdCLE1BekJkO0FBeUJzQjtBQUNoQywwQkFBc0IsTUExQlosQ0EwQm9COztBQTFCcEIsR0FGQztBQThCYkMsV0FBUyxFQUFFO0FBQ1QseUJBQXFCLE1BRFo7QUFDb0I7QUFDN0IsMkJBQXVCLE1BRmQ7QUFFc0I7QUFDL0IsMEJBQXNCLE1BSGIsQ0FHcUI7O0FBSHJCLEdBOUJFO0FBbUNickIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSxrQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0VyQyxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQO0FBQ0Q7QUFMSCxHQURRO0FBbkNHLENBQWYsRTs7Q0NGQTs7QUFDQSx3REFBZTtBQUNicEIsUUFBTSxFQUFFQyw4REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsNEJBQXdCLEtBRGQ7QUFDcUI7QUFDL0Isb0NBQWdDLEtBRnRCO0FBRTZCO0FBQ3ZDLDhCQUEwQixLQUhoQjtBQUd1QjtBQUNqQyw4QkFBMEIsS0FKaEI7QUFJdUI7QUFDakMsK0JBQTJCLEtBTGpCO0FBS3dCO0FBQ2xDLDRCQUF3QixLQU5kO0FBTXFCO0FBQy9CLHFCQUFpQixLQVBQO0FBUVYsa0NBQThCLEtBUnBCLENBUTJCOztBQVIzQixHQUZDO0FBWWJDLFdBQVMsRUFBRTtBQUNULDhCQUEwQixLQURqQixDQUN3Qjs7QUFEeEI7QUFaRSxDQUFmLEU7Ozs7QUNIQTtBQUNBO0FBRUE7QUFFQSx5REFBZTtBQUNidkIsUUFBTSxFQUFFQyx3RUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsMEJBQXNCLEtBRFo7QUFDbUI7QUFDN0Isc0JBQWtCLE1BRlI7QUFFZ0I7QUFDMUIsNEJBQXdCLEtBSGQ7QUFHcUI7QUFDL0IsNkJBQXlCLE1BSmY7QUFJdUI7QUFDakMsNkJBQXlCLE1BTGY7QUFLdUI7QUFDakMsNkJBQXlCLE1BTmY7QUFNdUI7QUFDakMsOEJBQTBCLE1BUGhCO0FBT3dCO0FBQ2xDLHVCQUFtQixNQVJUO0FBUWlCO0FBQzNCLHVCQUFtQixNQVRUO0FBU2lCO0FBQzNCLHVCQUFtQixNQVZUO0FBVWlCO0FBQzNCLDBCQUFzQixNQVhaO0FBV29CO0FBQzlCLDRCQUF3QixLQVpkO0FBWXFCO0FBQy9CLHdCQUFvQixLQWJWO0FBYWlCO0FBQzNCLHlCQUFxQixLQWRYO0FBY2tCO0FBQzVCLDBCQUFzQixLQWZaO0FBZW1CO0FBQzdCLG9CQUFnQixNQWhCTjtBQWdCYztBQUN4QixxQkFBaUIsTUFqQlA7QUFpQmU7QUFDekIseUJBQXFCLE1BbEJYO0FBa0JtQjtBQUM3QiwwQkFBc0IsTUFuQlo7QUFtQm9CO0FBQzlCLDRCQUF3QixNQXBCZDtBQW9Cc0I7QUFDaEMscUNBQWlDLE1BckJ2QjtBQXFCK0I7QUFDekMsd0NBQW9DLE1BdEIxQjtBQXNCa0M7QUFDNUMscUJBQWlCLE1BdkJQLENBdUJlOztBQXZCZixHQUZDO0FBMkJiRSxZQUFVLEVBQUU7QUFDViwrQkFBMkIsTUFEakIsQ0FDeUI7O0FBRHpCLEdBM0JDO0FBOEJiRCxXQUFTLEVBQUU7QUFDVCw0QkFBd0IsTUFEZjtBQUN1QjtBQUNoQyx1QkFBbUIsUUFGVixDQUVvQjs7QUFGcEIsR0E5QkU7QUFrQ2JyQixVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0F6RCxNQUFFLEVBQUUsZUFGTjtBQUdFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUhaO0FBSUVyQyxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQO0FBQ0Q7QUFOSCxHQURRLEVBU1I7QUFDRTtBQUNBM0UsTUFBRSxFQUFFLGtCQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSFo7QUFJRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3NHLE1BQUwsR0FBY3RHLElBQUksQ0FBQ3NHLE1BQUwsSUFBZSxFQUE3QjtBQUNBdEcsVUFBSSxDQUFDc0csTUFBTCxDQUFZckcsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsSUFBOUI7QUFDRDtBQVBILEdBVFEsRUFrQlI7QUFDRTNCLE1BQUUsRUFBRSxrQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUNzRyxNQUFMLEdBQWN0RyxJQUFJLENBQUNzRyxNQUFMLElBQWUsRUFBN0I7QUFDQXRHLFVBQUksQ0FBQ3NHLE1BQUwsQ0FBWXJHLE9BQU8sQ0FBQ3FDLE1BQXBCLElBQThCLEtBQTlCO0FBQ0Q7QUFOSCxHQWxCUSxFQTBCUjtBQUNFO0FBQ0EzQixNQUFFLEVBQUUscUJBRk47QUFHRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxTQUFOO0FBQWlCLFNBQUc0Rix1Q0FBa0JBO0FBQXRDLEtBQXZCLENBSFo7QUFJRXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUJELElBQUksQ0FBQ3NHLE1BQUwsQ0FBWXJHLE9BQU8sQ0FBQ3FDLE1BQXBCLENBSmhDO0FBS0VqQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLGFBREE7QUFFSkksWUFBRSxFQUFFLGtCQUZBO0FBR0pFLFlBQUUsRUFBRSxhQUhBO0FBSUpDLFlBQUUsRUFBRTtBQUpBO0FBSEQsT0FBUDtBQVVEO0FBaEJILEdBMUJRLEVBNENSO0FBQ0U1QyxNQUFFLEVBQUUsZUFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0U7QUFDQXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUJELElBQUksQ0FBQ3FGLGlCQUFMLENBQXVCcEYsT0FBdkIsSUFBa0MsQ0FKbEU7QUFLRW9CLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQVBILEdBNUNRLEVBcURSO0FBQ0V6RSxNQUFFLEVBQUUsaUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxTQUFOO0FBQWlCLFNBQUc0Rix1Q0FBa0JBO0FBQXRDLEtBQXZCLENBRlo7QUFHRTtBQUNBekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDcUYsaUJBQUwsQ0FBdUJwRixPQUF2QixJQUFrQyxDQUpsRTtBQUtFb0IsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBUEgsR0FyRFE7QUFsQ0csQ0FBZixFOztBQ0xBO0FBQ0E7QUFFQSxtREFBZTtBQUNibEIsUUFBTSxFQUFFQyw0Q0FESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsNkJBQXlCLE1BRGY7QUFDdUI7QUFDakMseUJBQXFCLE1BRlg7QUFFbUI7QUFDN0IsMkJBQXVCLE1BSGI7QUFHcUI7QUFDL0IsK0JBQTJCLE1BSmpCO0FBSXlCO0FBQ25DLDRCQUF3QixNQUxkO0FBS3NCO0FBQ2hDLDRCQUF3QixNQU5kO0FBTXNCO0FBQ2hDLDJCQUF1QixNQVBiO0FBT3FCO0FBQy9CLCtCQUEyQixNQVJqQjtBQVF5QjtBQUNuQyxrQ0FBOEIsTUFUcEI7QUFTNEI7QUFDdEMsMkJBQXVCLE1BVmI7QUFVcUI7QUFDL0IsMkJBQXVCLE1BWGI7QUFXcUI7QUFDL0IsNEJBQXdCLE1BWmQ7QUFZc0I7QUFDaEMsMkJBQXVCLE1BYmI7QUFhcUI7QUFDL0IsNEJBQXdCLE1BZGQ7QUFjc0I7QUFDaEMsMkJBQXVCLE1BZmI7QUFlcUI7QUFDL0IseUJBQXFCLE1BaEJYO0FBZ0JtQjtBQUM3QiwwQkFBc0IsTUFqQlo7QUFpQm9CO0FBQzlCLDBCQUFzQixNQWxCWjtBQWtCb0I7QUFDOUIsNEJBQXdCLE1BbkJkO0FBbUJzQjtBQUNoQyw2QkFBeUIsTUFwQmY7QUFvQnVCO0FBQ2pDLDhCQUEwQixNQXJCaEI7QUFxQndCO0FBQ2xDLDhCQUEwQixNQXRCaEI7QUFzQndCO0FBQ2xDLDhCQUEwQixNQXZCaEI7QUF1QndCO0FBQ2xDLDZCQUF5QixNQXhCZixDQXdCdUI7O0FBeEJ2QixHQUZDO0FBNEJicEIsVUFBUSxFQUFFLENBQ1I7QUFDRTtBQUNBekQsTUFBRSxFQUFFLGdCQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSFo7QUFJRXJDLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ3FGO0FBQXJELE9BQVA7QUFDRDtBQU5ILEdBRFE7QUE1QkcsQ0FBZixFOztBQ0hBO0FBQ0E7QUFFQTtBQUVBLDJDQUFlO0FBQ2JwQixRQUFNLEVBQUVDLGdGQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixzQkFBa0IsTUFEUjtBQUNnQjtBQUMxQixrQ0FBOEIsTUFGcEIsQ0FFNEI7O0FBRjVCLEdBRkM7QUFNYkMsV0FBUyxFQUFFO0FBQ1QseUJBQXFCLE1BRFo7QUFDb0I7QUFDN0IsNEJBQXdCLE1BRmY7QUFFdUI7QUFDaEMsK0JBQTJCLE1BSGxCO0FBRzBCO0FBQ25DLHNCQUFrQixNQUpULENBSWlCOztBQUpqQixHQU5FO0FBWWJyQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLHNCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3dHLE9BQUwsR0FBZXhHLElBQUksQ0FBQ3dHLE9BQUwsSUFBZ0IsRUFBL0I7QUFDQXhHLFVBQUksQ0FBQ3dHLE9BQUwsQ0FBYXZGLElBQWIsQ0FBa0JoQixPQUFPLENBQUNxQyxNQUExQjtBQUNEO0FBTkgsR0FEUSxFQVNSO0FBQ0U7QUFDQTNCLE1BQUUsRUFBRSxzQkFGTjtBQUdFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUhaO0FBSUV6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUN3RyxPQUFMLENBQWFsRyxRQUFiLENBQXNCTCxPQUFPLENBQUNxQyxNQUE5QixDQUpoQztBQUtFakIsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRSxpQkFEQTtBQUVKSSxZQUFFLEVBQUUsaUJBRkE7QUFHSkMsWUFBRSxFQUFFLDZCQUhBO0FBSUpDLFlBQUUsRUFBRSxVQUpBO0FBS0pDLFlBQUUsRUFBRTtBQUxBO0FBSEQsT0FBUDtBQVdEO0FBakJILEdBVFEsRUE0QlI7QUFDRTVDLE1BQUUsRUFBRSxzQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0V4QyxnQkFBWSxFQUFFLEVBSGhCO0FBSUVFLG1CQUFlLEVBQUUsQ0FKbkI7QUFLRUwsT0FBRyxFQUFHZixJQUFELElBQVU7QUFDYixhQUFPQSxJQUFJLENBQUN3RyxPQUFaO0FBQ0Q7QUFQSCxHQTVCUTtBQVpHLENBQWYsRTs7QUNMQTtBQUNBO0FBRUEsZ0RBQWU7QUFDYnRDLFFBQU0sRUFBRUMsd0NBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDZCQUF5QixNQURmO0FBQ3VCO0FBQ2pDLHlCQUFxQixNQUZYO0FBRW1CO0FBQzdCLDhCQUEwQixNQUhoQjtBQUd3QjtBQUNsQyw4QkFBMEIsTUFKaEI7QUFJd0I7QUFDbEMsOEJBQTBCLE1BTGhCO0FBS3dCO0FBQ2xDLGlDQUE2QixNQU5uQjtBQU0yQjtBQUNyQyw0QkFBd0IsTUFQZDtBQU9zQjtBQUNoQyx5Q0FBcUMsTUFSM0I7QUFRbUM7QUFDN0MsNkNBQXlDLE1BVC9CO0FBU3VDO0FBQ2pELGlDQUE2QixNQVZuQjtBQVUyQjtBQUNyQyx5QkFBcUIsTUFYWDtBQVdtQjtBQUM3Qiw2QkFBeUIsTUFaZjtBQVl1QjtBQUNqQyxvQ0FBZ0MsTUFidEI7QUFhOEI7QUFDeEMsb0NBQWdDLE1BZHRCO0FBYzhCO0FBQ3hDLGlDQUE2QixNQWZuQjtBQWUyQjtBQUNyQyxpQ0FBNkIsTUFoQm5CO0FBZ0IyQjtBQUNyQyxpQ0FBNkIsTUFqQm5CLENBaUIyQjs7QUFqQjNCLEdBRkM7QUFxQmJDLFdBQVMsRUFBRTtBQUNULDZCQUF5QixNQURoQjtBQUVULGlDQUE2QixNQUZwQjtBQUdULG9DQUFnQyxNQUh2QjtBQUlULG9DQUFnQztBQUp2QixHQXJCRTtBQTJCYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQTtBQUNBekQsTUFBRSxFQUFFLDRCQUhOO0FBSUU7QUFDQUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FMWjtBQU1FckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBUkgsR0FEUTtBQTNCRyxDQUFmLEU7O0FDSEE7Q0FHQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxNQUFNbUIsV0FBVyxHQUFJL0YsSUFBRCxJQUFVO0FBQzVCLE1BQUksQ0FBQ0EsSUFBSSxDQUFDcUQsU0FBVixFQUNFOUIsT0FBTyxDQUFDQyxLQUFSLENBQWMscUJBQXFCeUIsSUFBSSxDQUFDQyxTQUFMLENBQWVsRCxJQUFmLENBQW5DO0FBQ0YsU0FBTztBQUNMQyxNQUFFLEVBQUVELElBQUksQ0FBQ0MsRUFESjtBQUVMRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFRCxJQUFJLENBQUNxRDtBQUFYLEtBQXZCLENBRkw7QUFHTGpELGFBQVMsRUFBRSxDQUFDdUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQkEsT0FBTyxDQUFDeUcsS0FBUixDQUFjQyxNQUFkLENBQXFCLENBQUMsQ0FBdEIsTUFBNkIsSUFIdkQ7QUFJTHRGLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQU5JLEdBQVA7QUFRRCxDQVhEOztBQWFBLHFEQUFlO0FBQ2JsQixRQUFNLEVBQUVDLGtEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVix5QkFBcUIsTUFEWDtBQUNtQjtBQUM3Qix1QkFBbUIsTUFGVDtBQUVpQjtBQUMzQiw0QkFBd0IsTUFIZDtBQUdzQjtBQUNoQyw0QkFBd0IsTUFKZDtBQUlzQjtBQUNoQyw4QkFBMEIsTUFMaEI7QUFLd0I7QUFDbEMsdUJBQW1CLE1BTlQ7QUFNaUI7QUFDM0Isc0JBQWtCLE1BUFI7QUFPZ0I7QUFDMUIsb0JBQWdCLE1BUk47QUFRYztBQUN4QiwyQkFBdUIsTUFUYjtBQVNxQjtBQUMvQiwyQkFBdUIsS0FWYjtBQVVvQjtBQUM5Qiw4QkFBMEIsTUFYaEI7QUFXd0I7QUFDbEMsd0JBQW9CLE1BWlY7QUFZa0I7QUFDNUIsNkJBQXlCLE1BYmY7QUFhdUI7QUFDakMsNkJBQXlCLE1BZGY7QUFjdUI7QUFDakMsNkJBQXlCLE1BZmY7QUFldUI7QUFDakMseUJBQXFCLE1BaEJYO0FBZ0JtQjtBQUM3Qix5QkFBcUIsTUFqQlg7QUFpQm1CO0FBQzdCLDZCQUF5QixNQWxCZjtBQWtCdUI7QUFDakMsNkJBQXlCLE1BbkJmO0FBbUJ1QjtBQUNqQyxvQkFBZ0IsTUFwQk47QUFvQmM7QUFDeEIsMkJBQXVCLE1BckJiO0FBcUJxQjtBQUMvQixpQ0FBNkIsTUF0Qm5CO0FBc0IyQjtBQUNyQyxzQkFBa0IsTUF2QlI7QUF1QmdCO0FBQzFCLHFCQUFpQixNQXhCUDtBQXdCZTtBQUN6Qiw2QkFBeUIsTUF6QmY7QUF5QnVCO0FBQ2pDLHFDQUFpQyxNQTFCdkIsQ0EwQitCOztBQTFCL0IsR0FGQztBQThCYkMsV0FBUyxFQUFFO0FBQ1QsMEJBQXNCLE1BRGI7QUFDcUI7QUFDOUIsbUNBQStCLE1BRnRCO0FBRThCO0FBQ3ZDLHVCQUFtQixNQUhWLENBR2tCOztBQUhsQixHQTlCRTtBQW1DYkUsaUJBQWUsRUFBRTtBQUNmLHVCQUFtQixJQURKLENBQ1U7O0FBRFYsR0FuQ0o7QUFzQ2JDLGlCQUFlLEVBQUU7QUFDZixzQkFBa0IsS0FESCxDQUNVOztBQURWLEdBdENKO0FBeUNieEIsVUFBUSxFQUFFLENBQ1I7QUFDQXFDLGFBQVcsQ0FBQztBQUFFOUYsTUFBRSxFQUFFLHVCQUFOO0FBQStCb0QsYUFBUyxFQUFFO0FBQTFDLEdBQUQsQ0FGSCxFQUdSO0FBQ0EwQyxhQUFXLENBQUM7QUFBRTlGLE1BQUUsRUFBRSx1QkFBTjtBQUErQm9ELGFBQVMsRUFBRTtBQUExQyxHQUFELENBSkgsRUFLUjtBQUNBMEMsYUFBVyxDQUFDO0FBQUU5RixNQUFFLEVBQUUsdUJBQU47QUFBK0JvRCxhQUFTLEVBQUU7QUFBMUMsR0FBRCxDQU5ILEVBT1I7QUFDQTBDLGFBQVcsQ0FBQztBQUFFOUYsTUFBRSxFQUFFLG1CQUFOO0FBQTJCb0QsYUFBUyxFQUFFO0FBQXRDLEdBQUQsQ0FSSCxFQVNSO0FBQ0EwQyxhQUFXLENBQUM7QUFBRTlGLE1BQUUsRUFBRSxtQkFBTjtBQUEyQm9ELGFBQVMsRUFBRTtBQUF0QyxHQUFELENBVkgsRUFXUjtBQUNBMEMsYUFBVyxDQUFDO0FBQUU5RixNQUFFLEVBQUUsdUJBQU47QUFBK0JvRCxhQUFTLEVBQUU7QUFBMUMsR0FBRCxDQVpILEVBYVI7QUFDQTBDLGFBQVcsQ0FBQztBQUFFOUYsTUFBRSxFQUFFLG1CQUFOO0FBQTJCb0QsYUFBUyxFQUFFO0FBQXRDLEdBQUQsQ0FkSCxFQWVSO0FBQ0EwQyxhQUFXLENBQUM7QUFBRTlGLE1BQUUsRUFBRSxnQkFBTjtBQUF3Qm9ELGFBQVMsRUFBRTtBQUFuQyxHQUFELENBaEJILEVBaUJSO0FBQ0EwQyxhQUFXLENBQUM7QUFBRTlGLE1BQUUsRUFBRSxjQUFOO0FBQXNCb0QsYUFBUyxFQUFFO0FBQWpDLEdBQUQsQ0FsQkgsRUFtQlI7QUFDQTBDLGFBQVcsQ0FBQztBQUFFOUYsTUFBRSxFQUFFLHFCQUFOO0FBQTZCb0QsYUFBUyxFQUFFO0FBQXhDLEdBQUQsQ0FwQkg7QUF6Q0csQ0FBZixFOztBQ3pCQTtBQUNBO0FBRUEsb0RBQWU7QUFDYkcsUUFBTSxFQUFFQyxnREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysa0NBQThCLE1BRHBCO0FBQzRCO0FBQ3RDLHlDQUFxQyxNQUYzQjtBQUVtQztBQUU3Qyw4QkFBMEIsTUFKaEI7QUFJd0I7QUFDbEMsaUNBQTZCLE1BTG5CO0FBSzJCO0FBQ3JDLGlDQUE2QixNQU5uQjtBQU0yQjtBQUVyQyxxQ0FBaUMsTUFSdkI7QUFRK0I7QUFDekMsZ0NBQTRCLE1BVGxCO0FBUzBCO0FBRXBDLHFDQUFpQyxNQVh2QjtBQVcrQjtBQUN6QyxtQ0FBK0IsTUFackI7QUFZNkI7QUFDdkMscUNBQWlDLE1BYnZCO0FBYStCO0FBRXpDLG1DQUErQixNQWZyQjtBQWU2QjtBQUN2QyxnQ0FBNEIsTUFoQmxCO0FBZ0IwQjtBQUVwQyw4QkFBMEIsTUFsQmhCO0FBa0J3QjtBQUNsQywrQkFBMkIsTUFuQmpCO0FBbUJ5QjtBQUNuQyxnQ0FBNEIsTUFwQmxCLENBb0IwQjs7QUFwQjFCLEdBRkM7QUF5QmJDLFdBQVMsRUFBRTtBQUNULDJCQUF1QixNQURkO0FBQ3NCO0FBQy9CLHNDQUFrQyxNQUZ6QixDQUVpQzs7QUFGakMsR0F6QkU7QUE2QmJyQixVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0F6RCxNQUFFLEVBQUUsMEJBRk47QUFHRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBSFo7QUFJRUcsYUFBUyxFQUFFLENBQUN1RCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CQSxPQUFPLENBQUM0QyxJQUFSLEtBQWlCLElBSmxEO0FBSXdEO0FBQ3REeEIsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRyxHQUFFL0MsT0FBTyxDQUFDbUYsT0FBUSxVQURuQjtBQUVKaEMsWUFBRSxFQUFHLEdBQUVuRCxPQUFPLENBQUNtRixPQUFRLFdBRm5CO0FBR0ovQixZQUFFLEVBQUcsR0FBRXBELE9BQU8sQ0FBQ21GLE9BQVEsWUFIbkI7QUFJSjlCLFlBQUUsRUFBRyxHQUFFckQsT0FBTyxDQUFDbUYsT0FBUSxPQUpuQjtBQUtKN0IsWUFBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRLE9BTG5CO0FBTUo1QixZQUFFLEVBQUcsR0FBRXZELE9BQU8sQ0FBQ21GLE9BQVE7QUFObkI7QUFIRCxPQUFQO0FBWUQ7QUFsQkgsR0FEUTtBQTdCRyxDQUFmLEU7O0FDSEE7QUFFQSx1REFBZTtBQUNibEIsUUFBTSxFQUFFQyw4RUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysa0NBQThCLE1BRHBCO0FBQzRCO0FBQ3RDLHFDQUFpQyxNQUZ2QjtBQUUrQjtBQUN6QyxzQ0FBa0MsTUFIeEI7QUFHZ0M7QUFDMUMsbUNBQStCLE1BSnJCO0FBSTZCO0FBQ3ZDLG9DQUFnQyxNQUx0QjtBQUs4QjtBQUN4QywwQ0FBc0MsTUFONUI7QUFNb0M7QUFDOUMscUNBQWlDLE1BUHZCO0FBTytCO0FBQ3pDLGtDQUE4QixNQVJwQjtBQVE0QjtBQUN0Qyx5Q0FBcUMsTUFUM0I7QUFTbUM7QUFDN0MseUNBQXFDLE1BVjNCO0FBVW1DO0FBQzdDLHdDQUFvQyxNQVgxQjtBQVdrQztBQUM1QyxrQ0FBOEIsTUFacEI7QUFZNEI7QUFDdEMsMkNBQXVDLE1BYjdCO0FBYXFDO0FBQy9DLHVDQUFtQyxNQWR6QjtBQWNpQztBQUMzQyxtQ0FBK0IsTUFmckIsQ0FlNkI7O0FBZjdCLEdBRkM7QUFtQmJDLFdBQVMsRUFBRTtBQUNULGdDQUE0QixNQURuQjtBQUMyQjtBQUNwQyxxQ0FBaUMsTUFGeEIsQ0FFZ0M7O0FBRmhDLEdBbkJFO0FBdUJiRSxpQkFBZSxFQUFFO0FBQ2YsZ0NBQTRCLEtBRGI7QUFDb0I7QUFDbkMsK0JBQTJCLElBRlo7QUFFa0I7QUFDakMsd0NBQW9DLEtBSHJCO0FBRzRCO0FBQzNDLGlDQUE2QixLQUpkO0FBSXFCO0FBQ3BDLG1DQUErQixLQUxoQixDQUt1Qjs7QUFMdkIsR0F2Qko7QUE4QmJpQixVQUFRLEVBQUU7QUFDUixxQ0FBaUMsTUFEekIsQ0FDaUM7O0FBRGpDO0FBOUJHLENBQWYsRTs7QUNGQTtBQUNBO0FBRUEsdURBQWU7QUFDYjFDLFFBQU0sRUFBRUMsNERBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLG9DQUFnQyxNQUR0QjtBQUM4QjtBQUN4QyxvQ0FBZ0MsTUFGdEI7QUFFOEI7QUFFeEMsb0NBQWdDLE1BSnRCO0FBSThCO0FBQ3hDLHVDQUFtQyxNQUx6QjtBQUtpQztBQUMzQyxvQ0FBZ0MsTUFOdEI7QUFNOEI7QUFFeEMsK0JBQTJCLE1BUmpCO0FBUXlCO0FBQ25DLG1DQUErQixNQVRyQjtBQVM2QjtBQUV2Qyx1Q0FBbUMsTUFYekI7QUFXaUM7QUFDM0MsdUNBQW1DLE1BWnpCO0FBWWlDO0FBQzNDLGtDQUE4QixNQWJwQjtBQWE0QjtBQUV0QyxvQ0FBZ0MsTUFmdEI7QUFlOEI7QUFDeEMsb0NBQWdDLE1BaEJ0QjtBQWdCOEI7QUFDeEMsbUNBQStCLE1BakJyQjtBQWlCNkI7QUFFdkMsb0NBQWdDLE1BbkJ0QjtBQW1COEI7QUFDeEMsb0NBQWdDLE1BcEJ0QjtBQW9COEI7QUFDeEMsb0NBQWdDLE1BckJ0QjtBQXFCOEI7QUFDeEMsb0NBQWdDLE1BdEJ0QjtBQXNCOEI7QUFDeEMsd0NBQW9DLE1BdkIxQixDQXVCa0M7O0FBdkJsQyxHQUZDO0FBMkJiQyxXQUFTLEVBQUU7QUFDVCwrQkFBMkIsTUFEbEI7QUFDMEI7QUFDbkMsdUNBQW1DLE1BRjFCO0FBRWtDO0FBQzNDLHFDQUFpQyxNQUh4QjtBQUdnQztBQUN6Qyx1Q0FBbUMsTUFKMUIsQ0FJa0M7O0FBSmxDLEdBM0JFO0FBaUNiRSxpQkFBZSxFQUFFO0FBQ2YsaUNBQTZCLEtBRGQ7QUFDcUI7QUFDcEMsaUNBQTZCLE1BRmQsQ0FFc0I7O0FBRnRCLEdBakNKO0FBcUNidkIsVUFBUSxFQUFFLENBQ1I7QUFDRTtBQUNBekQsTUFBRSxFQUFFLGtDQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSFo7QUFJRW1DLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFN0YsT0FBTyxDQUFDcUY7QUFIWCxPQUFQO0FBS0Q7QUFWSCxHQURRLEVBYVI7QUFDRTtBQUNBM0UsTUFBRSxFQUFFLDJDQUZOO0FBR0VFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUUsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFOO0FBQXdCa0IsWUFBTSxFQUFFLENBQUMsZ0JBQUQsRUFBbUIsb0JBQW5CO0FBQWhDLEtBQW5CLENBSFo7QUFJRWYsYUFBUyxFQUFFLENBQUN1RCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CQSxPQUFPLENBQUM0QyxJQUFSLEtBQWlCLElBSmxEO0FBSXdEO0FBQ3REeEIsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRyxHQUFFL0MsT0FBTyxDQUFDbUYsT0FBUSxVQURuQjtBQUVKaEMsWUFBRSxFQUFHLEdBQUVuRCxPQUFPLENBQUNtRixPQUFRLFdBRm5CO0FBR0ovQixZQUFFLEVBQUcsR0FBRXBELE9BQU8sQ0FBQ21GLE9BQVEsWUFIbkI7QUFJSjlCLFlBQUUsRUFBRyxHQUFFckQsT0FBTyxDQUFDbUYsT0FBUSxPQUpuQjtBQUtKN0IsWUFBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRLE9BTG5CO0FBTUo1QixZQUFFLEVBQUcsR0FBRXZELE9BQU8sQ0FBQ21GLE9BQVE7QUFObkI7QUFIRCxPQUFQO0FBWUQ7QUFsQkgsR0FiUTtBQXJDRyxDQUFmLEU7O0FDSEE7QUFFQSx5REFBZTtBQUNibEIsUUFBTSxFQUFFQyw0REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YseUJBQXFCLE1BRFg7QUFDbUI7QUFDN0IsNkJBQXlCLE1BRmY7QUFFdUI7QUFDakMsMkJBQXVCLE1BSGI7QUFHcUI7QUFDL0IsNkJBQXlCLE1BSmY7QUFJdUI7QUFDakMsMkJBQXVCLE1BTGI7QUFLcUI7QUFDL0Isb0JBQWdCLE1BTk47QUFNYztBQUN4Qiw0QkFBd0IsTUFQZDtBQU9zQjtBQUNoQyxvQkFBZ0IsRUFSTjtBQVFVO0FBQ3BCLHVCQUFtQixNQVRUO0FBU2lCO0FBQzNCLHdCQUFvQixNQVZWO0FBVWtCO0FBQzVCLDBCQUFzQixLQVhaO0FBV21CO0FBQzdCLHVCQUFtQixNQVpUO0FBWWlCO0FBQzNCLDZCQUF5QixNQWJmO0FBYXVCO0FBQ2pDLDBCQUFzQixNQWRaO0FBY29CO0FBQzlCLDBCQUFzQixNQWZaLENBZW9COztBQWZwQixHQUZDO0FBbUJiQyxXQUFTLEVBQUU7QUFDVCw2QkFBeUIsTUFEaEIsQ0FDd0I7O0FBRHhCO0FBbkJFLENBQWYsRTs7QUNGQTtBQUVBLCtDQUFlO0FBQ2J2QixRQUFNLEVBQUVDLHNDQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw2QkFBeUIsTUFEZjtBQUN1QjtBQUNqQyxnQ0FBNEIsTUFGbEI7QUFFMEI7QUFDcEMsNkJBQXlCLE1BSGY7QUFHdUI7QUFDakMsMEJBQXNCLE1BSlo7QUFJb0I7QUFDOUIsMEJBQXNCLE1BTFo7QUFLb0I7QUFDOUIsMkJBQXVCLE1BTmI7QUFNcUI7QUFDL0IscUNBQWlDLE1BUHZCO0FBTytCO0FBQ3pDLG1DQUErQixNQVJyQjtBQVE2QjtBQUN2QywwQkFBc0IsTUFUWjtBQVNvQjtBQUM5Qiw4QkFBMEIsTUFWaEI7QUFVd0I7QUFDbEMsd0JBQW9CLE1BWFY7QUFXa0I7QUFDNUIsNkJBQXlCLE1BWmY7QUFZdUI7QUFDakMsOEJBQTBCLE1BYmhCO0FBYXdCO0FBQ2xDLDhCQUEwQixNQWRoQjtBQWN3QjtBQUNsQyx5QkFBcUIsTUFmWDtBQWVtQjtBQUM3Qiw0QkFBd0IsTUFoQmQ7QUFnQnNCO0FBQ2hDLHlCQUFxQixNQWpCWDtBQWlCbUI7QUFDN0IsNkJBQXlCLE1BbEJmO0FBa0J1QjtBQUNqQyw0QkFBd0IsTUFuQmQ7QUFtQnNCO0FBQ2hDLDRCQUF3QixNQXBCZDtBQW9Cc0I7QUFDaEMsNEJBQXdCLE1BckJkO0FBcUJzQjtBQUNoQyw0QkFBd0IsTUF0QmQ7QUFzQnNCO0FBQ2hDLDRCQUF3QixNQXZCZDtBQXVCc0I7QUFDaEMsMEJBQXNCLE1BeEJaLENBd0JvQjs7QUF4QnBCLEdBRkM7QUE0QmJFLFlBQVUsRUFBRTtBQUNWLHlCQUFxQixNQURYLENBQ21COztBQURuQixHQTVCQztBQStCYkQsV0FBUyxFQUFFO0FBQ1QseUJBQXFCLE1BRFo7QUFDb0I7QUFDN0IsNEJBQXdCLE1BRmY7QUFFdUI7QUFDaEMsb0NBQWdDLE1BSHZCO0FBRytCO0FBQ3hDLDZCQUF5QixNQUpoQixDQUl3Qjs7QUFKeEIsR0EvQkU7QUFxQ2JFLGlCQUFlLEVBQUU7QUFDZix1QkFBbUIsSUFESjtBQUNVO0FBQ3pCLGlDQUE2QixLQUZkLENBRXFCOztBQUZyQjtBQXJDSixDQUFmLEU7O0NDQUE7O0FBQ0EsMENBQWU7QUFDYnpCLFFBQU0sRUFBRUMsa0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGdCQUFZLE1BREY7QUFDVTtBQUNwQixpQkFBYSxNQUZILENBRVc7O0FBRlgsR0FGQztBQU1iQyxXQUFTLEVBQUU7QUFDVCxxQkFBaUIsTUFEUixDQUNnQjs7QUFEaEI7QUFORSxDQUFmLEU7O0FDSEE7QUFDQTtDQUlBOztBQUNBLDBDQUFlO0FBQ2J2QixRQUFNLEVBQUVDLGtEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixzQkFBa0IsTUFEUjtBQUNnQjtBQUMxQixtQkFBZSxNQUZMLENBRWE7O0FBRmIsR0FGQztBQU1iQyxXQUFTLEVBQUU7QUFDVCwyQkFBdUIsTUFEZCxDQUNzQjs7QUFEdEIsR0FORTtBQVNickIsVUFBUSxFQUFFLENBQ1I7QUFDRTtBQUNBO0FBQ0F6RCxNQUFFLEVBQUUsbUJBSE47QUFJRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FKWjtBQUtFO0FBQ0E7QUFDQXRDLG1CQUFlLEVBQUUsRUFQbkI7QUFRRUMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBVkgsR0FEUSxFQWFSO0FBQ0UzRSxNQUFFLEVBQUUsZ0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFO0FBQ0F6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUNxRixpQkFBTCxDQUF1QnBGLE9BQXZCLElBQWtDLENBSmxFO0FBS0VvQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0Q7QUFQSCxHQWJRO0FBVEcsQ0FBZixFOztBQ05BO0NBR0E7O0FBQ0EsMENBQWU7QUFDYmxCLFFBQU0sRUFBRUMsa0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLCtCQUEyQixNQURqQjtBQUN5QjtBQUNuQyxtQ0FBK0IsTUFGckI7QUFFNkI7QUFDdkMsa0NBQThCLE1BSHBCO0FBRzRCO0FBQ3RDLHdCQUFvQixNQUpWO0FBSWtCO0FBQzVCLHlCQUFxQixNQUxYO0FBS21CO0FBQzdCLHVCQUFtQixNQU5UO0FBTWlCO0FBQzNCLGtCQUFjLE1BUEosQ0FPWTs7QUFQWixHQUZDO0FBV2JFLFlBQVUsRUFBRTtBQUNWLG1CQUFlLE1BREwsQ0FDYTs7QUFEYixHQVhDO0FBY2JELFdBQVMsRUFBRTtBQUNULHFCQUFpQixJQURSLENBQ2M7O0FBRGQsR0FkRTtBQWlCYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsbUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWNrQixZQUFNLEVBQUUsZUFBdEI7QUFBdUNnRixhQUFPLEVBQUU7QUFBaEQsS0FBdkIsQ0FGWjtBQUdFQyxjQUFVLEVBQUVqRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRSxlQUF0QjtBQUF1Q2dGLGFBQU8sRUFBRTtBQUFoRCxLQUF2QixDQUhkO0FBSUVuQyxjQUFVLEVBQUViLGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFja0IsWUFBTSxFQUFFLGNBQXRCO0FBQXNDZ0YsYUFBTyxFQUFFO0FBQS9DLEtBQXZCLENBSmQ7QUFLRWxDLGNBQVUsRUFBRWQsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWNrQixZQUFNLEVBQUUsVUFBdEI7QUFBa0NnRixhQUFPLEVBQUU7QUFBM0MsS0FBdkIsQ0FMZDtBQU1FakMsY0FBVSxFQUFFZixpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRSxRQUF0QjtBQUFnQ2dGLGFBQU8sRUFBRTtBQUF6QyxLQUF2QixDQU5kO0FBT0VoQyxjQUFVLEVBQUVoQixpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRSxTQUF0QjtBQUFpQ2dGLGFBQU8sRUFBRTtBQUExQyxLQUF2QixDQVBkO0FBUUU5RixPQUFHLEVBQUdmLElBQUQsSUFBVTtBQUNiQSxVQUFJLENBQUMrRyxXQUFMLElBQW9CLENBQXBCO0FBQ0Q7QUFWSCxHQURRLEVBYVI7QUFDRTtBQUNBO0FBQ0FwRyxNQUFFLEVBQUUsa0JBSE47QUFJRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRSxLQUFOO0FBQWFrQixZQUFNLEVBQUUsZUFBckI7QUFBc0NnRixhQUFPLEVBQUU7QUFBL0MsS0FBbkIsQ0FKWjtBQUtFQyxjQUFVLEVBQUVqRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLEtBQU47QUFBYWtCLFlBQU0sRUFBRSxlQUFyQjtBQUFzQ2dGLGFBQU8sRUFBRTtBQUEvQyxLQUFuQixDQUxkO0FBTUVuQyxjQUFVLEVBQUViLHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUUsS0FBTjtBQUFha0IsWUFBTSxFQUFFLGNBQXJCO0FBQXFDZ0YsYUFBTyxFQUFFO0FBQTlDLEtBQW5CLENBTmQ7QUFPRWxDLGNBQVUsRUFBRWQseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRSxLQUFOO0FBQWFrQixZQUFNLEVBQUUsVUFBckI7QUFBaUNnRixhQUFPLEVBQUU7QUFBMUMsS0FBbkIsQ0FQZDtBQVFFakMsY0FBVSxFQUFFZix5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLEtBQU47QUFBYWtCLFlBQU0sRUFBRSxRQUFyQjtBQUErQmdGLGFBQU8sRUFBRTtBQUF4QyxLQUFuQixDQVJkO0FBU0VoQyxjQUFVLEVBQUVoQix5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLEtBQU47QUFBYWtCLFlBQU0sRUFBRSxTQUFyQjtBQUFnQ2dGLGFBQU8sRUFBRTtBQUF6QyxLQUFuQixDQVRkO0FBVUUvRixhQUFTLEVBQUdkLElBQUQsSUFBVSxDQUFDQSxJQUFJLENBQUNnSCxXQVY3QjtBQVdFakcsT0FBRyxFQUFHZixJQUFELElBQVU7QUFDYkEsVUFBSSxDQUFDaUgsU0FBTCxHQUFpQixDQUFqQixDQURhLENBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBQ0FqSCxVQUFJLENBQUMrRyxXQUFMLEdBQW1CLENBQW5CO0FBQ0EvRyxVQUFJLENBQUNnSCxXQUFMLEdBQW1CLElBQW5CO0FBQ0Q7QUFuQkgsR0FiUSxFQWtDUjtBQUNFckcsTUFBRSxFQUFFLFlBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRUcsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUM1QjtBQUNBO0FBQ0EsYUFBTyxFQUFFRCxJQUFJLENBQUMrRyxXQUFMLEtBQXFCLENBQXJCLElBQTBCL0csSUFBSSxDQUFDaUgsU0FBTCxHQUFpQixDQUFqQixLQUF1QixDQUFuRCxLQUF5RGhILE9BQU8sQ0FBQ2lILFFBQVIsS0FBcUIsVUFBckY7QUFDRCxLQVBIO0FBUUU3RixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0Q7QUFWSCxHQWxDUSxFQThDUjtBQUNFO0FBQ0E7QUFDQXpFLE1BQUUsRUFBRSxjQUhOO0FBSUU7QUFDQUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBTFo7QUFNRTtBQUNBRyxhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUNxRixpQkFBTCxDQUF1QnBGLE9BQXZCLElBQWtDLENBUGxFO0FBUUVvQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0QsS0FWSDtBQVdFckUsT0FBRyxFQUFHZixJQUFELElBQVU7QUFDYkEsVUFBSSxDQUFDaUgsU0FBTCxJQUFrQixDQUFsQjtBQUNEO0FBYkgsR0E5Q1E7QUFqQkcsQ0FBZixFOztBQ0pBO0FBQ0E7Q0FHQTs7QUFDQSwwQ0FBZTtBQUNiL0MsUUFBTSxFQUFFQyxrREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysd0JBQW9CLE1BRFY7QUFDa0I7QUFDNUIsaUNBQTZCLE1BRm5CO0FBRTJCO0FBQ3JDLHlCQUFxQixNQUhYO0FBR21CO0FBQzdCLG9CQUFnQixNQUpOO0FBSWM7QUFDeEIsdUJBQW1CLE1BTFQsQ0FLaUI7O0FBTGpCLEdBRkM7QUFTYkMsV0FBUyxFQUFFO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUFxQixNQU5aO0FBT1QsMEJBQXNCLE1BUGIsQ0FPcUI7O0FBUHJCLEdBVEU7QUFrQmJyQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLFVBRE47QUFDa0I7QUFDaEJFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRW1DLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsd0JBREU7QUFFTkksWUFBRSxFQUFFLDJCQUZFO0FBR05DLFlBQUUsRUFBRSxtQ0FIRTtBQUlOQyxZQUFFLEVBQUUsTUFKRTtBQUtOQyxZQUFFLEVBQUU7QUFMRTtBQUhILE9BQVA7QUFXRDtBQWZILEdBRFEsRUFrQlI7QUFDRTtBQUNBNUMsTUFBRSxFQUFFLGlCQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBSFo7QUFJRVYsZUFBVyxFQUFFLENBQUN4QixLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQy9CLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0x3RCxjQUFNLEVBQUU7QUFDTjlDLFlBQUUsRUFBRSxhQURFO0FBRU5JLFlBQUUsRUFBRSxtQkFGRTtBQUdOQyxZQUFFLEVBQUUsbUJBSEU7QUFJTkMsWUFBRSxFQUFFLEtBSkU7QUFLTkMsWUFBRSxFQUFFO0FBTEU7QUFISCxPQUFQO0FBV0Q7QUFoQkgsR0FsQlEsRUFvQ1I7QUFDRTVDLE1BQUUsRUFBRSx3QkFETjtBQUNnQztBQUM5QkUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBTEgsR0FwQ1E7QUFsQkcsQ0FBZixFOztBQ0xBO0FBQ0E7Q0FJQTs7QUFDQSwwQ0FBZTtBQUNicEIsUUFBTSxFQUFFQyw4REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsNEJBQXdCLE1BRGQ7QUFFViw4QkFBMEIsTUFGaEI7QUFHVixzQkFBa0I7QUFIUixHQUZDO0FBT2JFLFlBQVUsRUFBRTtBQUNWLHlCQUFxQjtBQURYLEdBUEM7QUFVYnRCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsc0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWNrRyxhQUFPLEVBQUU7QUFBdkIsS0FBbkIsQ0FGWjtBQUdFOUYsT0FBRyxFQUFHZixJQUFELElBQVU7QUFDYkEsVUFBSSxDQUFDbUgsdUJBQUwsR0FBK0IsSUFBL0I7QUFDRDtBQUxILEdBRFEsRUFRUjtBQUNFeEcsTUFBRSxFQUFFLGtCQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFja0csYUFBTyxFQUFFO0FBQXZCLEtBQW5CLENBRlo7QUFHRTlGLE9BQUcsRUFBR2YsSUFBRCxJQUFVO0FBQ2JBLFVBQUksQ0FBQ21ILHVCQUFMLEdBQStCLEtBQS9CO0FBQ0Q7QUFMSCxHQVJRLEVBZVI7QUFDRXhHLE1BQUUsRUFBRSxlQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFja0csYUFBTyxFQUFFO0FBQXZCLEtBQW5CLENBRlo7QUFHRTlGLE9BQUcsRUFBR2YsSUFBRCxJQUFVO0FBQ2JBLFVBQUksQ0FBQ29ILFlBQUwsR0FBb0IsSUFBcEI7QUFDRDtBQUxILEdBZlEsRUFzQlI7QUFDRXpHLE1BQUUsRUFBRSxtQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0U7QUFDQXpGLGFBQVMsRUFBR2QsSUFBRCxJQUFVLENBQUNBLElBQUksQ0FBQ21ILHVCQUo3QjtBQUtFOUYsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDb0g7QUFBckQsT0FBUDtBQUNEO0FBUEgsR0F0QlEsRUErQlI7QUFDRTFHLE1BQUUsRUFBRSxrQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0U7QUFDQXpGLGFBQVMsRUFBR2QsSUFBRCxJQUFVQSxJQUFJLENBQUNtSCx1QkFKNUI7QUFLRTlGLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ29IO0FBQXJELE9BQVA7QUFDRDtBQVBILEdBL0JRLEVBd0NSO0FBQ0UxRyxNQUFFLEVBQUUsZ0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFckMsV0FBTyxFQUFFLENBQUNyQixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDMUI7QUFDQSxVQUFJRCxJQUFJLENBQUNvSCxZQUFULEVBQ0UsT0FBTztBQUFFdkUsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQLENBSHdCLENBSTFCOztBQUNBLGFBQU87QUFBRXpDLFlBQUksRUFBRSxNQUFSO0FBQWdCbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFBOUI7QUFBc0NTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ3FGO0FBQXBELE9BQVA7QUFDRDtBQVRILEdBeENRLEVBbURSO0FBQ0UzRSxNQUFFLEVBQUUsdUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFbEYsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBTEgsR0FuRFEsRUEwRFI7QUFDRXpFLE1BQUUsRUFBRSx3QkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUNzSCxjQUFMLEdBQXNCdEgsSUFBSSxDQUFDc0gsY0FBTCxJQUF1QixFQUE3QztBQUNBdEgsVUFBSSxDQUFDc0gsY0FBTCxDQUFvQnJILE9BQU8sQ0FBQ3FDLE1BQTVCLElBQXNDLElBQXRDO0FBQ0Q7QUFOSCxHQTFEUSxFQWtFUjtBQUNFM0IsTUFBRSxFQUFFLHdCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3NILGNBQUwsR0FBc0J0SCxJQUFJLENBQUNzSCxjQUFMLElBQXVCLEVBQTdDO0FBQ0F0SCxVQUFJLENBQUNzSCxjQUFMLENBQW9CckgsT0FBTyxDQUFDcUMsTUFBNUIsSUFBc0MsS0FBdEM7QUFDRDtBQU5ILEdBbEVRLEVBMEVSO0FBQ0UzQixNQUFFLEVBQUUsbUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFeEMsZ0JBQVksRUFBRSxDQUFDbUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQmlHLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBVixHQUErQixHQUhuRTtBQUlFTixlQUFXLEVBQUUsQ0FBQzdGLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUM5QixVQUFJLENBQUNELElBQUksQ0FBQ3NILGNBQVYsRUFDRTtBQUNGLFVBQUksQ0FBQ3RILElBQUksQ0FBQ3NILGNBQUwsQ0FBb0JySCxPQUFPLENBQUNxQyxNQUE1QixDQUFMLEVBQ0U7QUFDRixhQUFPO0FBQ0xaLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRFQ7QUFFTHdELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ3FGO0FBRlgsT0FBUDtBQUlEO0FBYkgsR0ExRVEsRUF5RlI7QUFDRTNFLE1BQUUsRUFBRSw0QkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0V4RixPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUN1SCxtQkFBTCxHQUEyQnZILElBQUksQ0FBQ3VILG1CQUFMLElBQTRCLEVBQXZEO0FBQ0F2SCxVQUFJLENBQUN1SCxtQkFBTCxDQUF5QnRHLElBQXpCLENBQThCaEIsT0FBOUI7QUFDRDtBQU5ILEdBekZRLEVBaUdSO0FBQ0VVLE1BQUUsRUFBRSxvQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0VsRixXQUFPLEVBQUdyQixJQUFELElBQVU7QUFDakIsWUFBTXdILEdBQUcsR0FBR3hILElBQUksQ0FBQ3VILG1CQUFqQjtBQUNBLFVBQUksQ0FBQ0MsR0FBTCxFQUNFO0FBQ0YsVUFBSUEsR0FBRyxDQUFDNUUsTUFBSixJQUFjLENBQWxCLEVBQ0UsT0FMZSxDQU1qQjtBQUNBOztBQUNBLGFBQU87QUFBRUMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JrQyxnQkFBUSxFQUFHLEdBQUV5QyxHQUFHLENBQUMsQ0FBRCxDQUFILENBQU9wQyxPQUFRLE1BQUtvQyxHQUFHLENBQUM1RSxNQUFPO0FBQTVELE9BQVA7QUFDRCxLQVpIO0FBYUU3QixPQUFHLEVBQUdmLElBQUQsSUFBVSxPQUFPQSxJQUFJLENBQUN1SDtBQWI3QixHQWpHUTtBQVZHLENBQWYsRTs7QUNOQTtDQUdBOztBQUNBLDBDQUFlO0FBQ2JyRCxRQUFNLEVBQUVDLDhEQURLO0FBRWJ1QixZQUFVLEVBQUU7QUFDVixtQkFBZSxNQURMO0FBRVYsd0JBQW9CO0FBRlYsR0FGQztBQU1iRixZQUFVLEVBQUU7QUFDVix3QkFBb0I7QUFEVixHQU5DO0FBU2JwQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLGVBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRVUsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUM0QixNQUEvQjtBQUF1Q2tCLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQUxILEdBRFE7QUFURyxDQUFmLEU7O0FDSkE7QUFDQTtDQUlBO0FBQ0E7O0FBRUEsMkNBQWU7QUFDYmxCLFFBQU0sRUFBRUMsOERBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLG1DQUErQixNQURyQjtBQUM2QjtBQUN2QyxtQ0FBK0IsTUFGckI7QUFFNkI7QUFDdkMsbUNBQStCLE1BSHJCO0FBRzZCO0FBQ3ZDLDZCQUF5QixNQUpmO0FBSXVCO0FBQ2pDLGtDQUE4QixNQUxwQjtBQUs0QjtBQUN0QyxrQ0FBOEIsTUFOcEI7QUFNNEI7QUFDdEMsb0NBQWdDLE1BUHRCO0FBTzhCO0FBQ3hDLGlDQUE2QixNQVJuQjtBQVEyQjtBQUNyQywwQ0FBc0MsTUFUNUI7QUFTb0M7QUFDOUMsMENBQXNDLE1BVjVCO0FBVW9DO0FBQzlDLDBDQUFzQyxNQVg1QjtBQVdvQztBQUM5Qyx5Q0FBcUMsTUFaM0IsQ0FZbUM7O0FBWm5DLEdBRkM7QUFnQmJFLFlBQVUsRUFBRTtBQUNWLDJCQUF1QixNQURiO0FBQ3FCO0FBQy9CLG9DQUFnQyxNQUZ0QjtBQUU4QjtBQUN4QywyQ0FBdUMsTUFIN0I7QUFHcUM7QUFDL0MsMkNBQXVDLE1BSjdCLENBSXFDOztBQUpyQyxHQWhCQztBQXNCYkQsV0FBUyxFQUFFO0FBQ1QsZ0NBQTRCLE1BRG5CO0FBQzJCO0FBQ3BDLGdDQUE0QixNQUZuQjtBQUUyQjtBQUNwQyx5QkFBcUIsTUFIWjtBQUdvQjtBQUM3QixnQ0FBNEIsTUFKbkIsQ0FJMkI7O0FBSjNCLEdBdEJFO0FBNEJiTSxXQUFTLEVBQUU7QUFDVCx5Q0FBcUMsTUFENUI7QUFDb0M7QUFDN0MscUNBQWlDLE1BRnhCO0FBRWdDO0FBQ3pDLGdDQUE0QixNQUhuQixDQUcyQjs7QUFIM0IsR0E1QkU7QUFpQ2IzQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLDhCQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUU7QUFBTixLQUFuQixDQUZaO0FBR0VrRixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTG5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRlQ7QUFHTHdELGNBQU0sRUFBRTtBQUNOOUMsWUFBRSxFQUFFLGFBREU7QUFFTkksWUFBRSxFQUFFLGdCQUZFO0FBR05DLFlBQUUsRUFBRSxrQkFIRTtBQUlOQyxZQUFFLEVBQUUsUUFKRTtBQUtOQyxZQUFFLEVBQUUsTUFMRTtBQU1OQyxZQUFFLEVBQUU7QUFORTtBQUhILE9BQVA7QUFZRDtBQWhCSCxHQURRLEVBbUJSO0FBQ0U3QyxNQUFFLEVBQUUsbUNBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDeUgsSUFBTCxHQUFZekgsSUFBSSxDQUFDeUgsSUFBTCxJQUFhLEVBQXpCO0FBQ0F6SCxVQUFJLENBQUN5SCxJQUFMLENBQVV4SCxPQUFPLENBQUNxQyxNQUFsQixJQUE0QixJQUE1QjtBQUNEO0FBTkgsR0FuQlEsRUEyQlI7QUFDRTNCLE1BQUUsRUFBRSxtQ0FETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUN5SCxJQUFMLEdBQVl6SCxJQUFJLENBQUN5SCxJQUFMLElBQWEsRUFBekI7QUFDQXpILFVBQUksQ0FBQ3lILElBQUwsQ0FBVXhILE9BQU8sQ0FBQ3FDLE1BQWxCLElBQTRCLEtBQTVCO0FBQ0Q7QUFOSCxHQTNCUSxFQW1DUjtBQUNFM0IsTUFBRSxFQUFFLGtDQUROO0FBRUU7QUFDQTtBQUNBO0FBQ0FFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixNQUFqQixDQUFOO0FBQWdDLFNBQUc0Rix1Q0FBa0JBO0FBQXJELEtBQXZCLENBTFo7QUFNRXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUJELElBQUksQ0FBQ3lILElBQUwsSUFBYXpILElBQUksQ0FBQ3lILElBQUwsQ0FBVXhILE9BQU8sQ0FBQ3FDLE1BQWxCLENBTjdDO0FBT0VqQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFHLEdBQUUvQyxPQUFPLENBQUNtRixPQUFRLGNBRG5CO0FBRUpoQyxZQUFFLEVBQUcsR0FBRW5ELE9BQU8sQ0FBQ21GLE9BQVEsdUJBRm5CO0FBR0o5QixZQUFFLEVBQUcsR0FBRXJELE9BQU8sQ0FBQ21GLE9BQVEsWUFIbkI7QUFJSjdCLFlBQUUsRUFBRyxHQUFFdEQsT0FBTyxDQUFDbUYsT0FBUTtBQUpuQjtBQUhELE9BQVA7QUFVRDtBQWxCSCxHQW5DUTtBQWpDRyxDQUFmLEU7O0FDUkE7QUFDQTtDQUlBOztBQUNBLGdEQUFlO0FBQ2JsQixRQUFNLEVBQUVDLDREQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVjtBQUNBLHFCQUFpQixNQUZQO0FBR1Y7QUFDQSx5QkFBcUIsTUFKWDtBQUtWO0FBQ0EsZ0NBQTRCLE1BTmxCO0FBT1YsZ0NBQTRCO0FBUGxCLEdBRkM7QUFXYkUsWUFBVSxFQUFFO0FBQ1YsMkJBQXVCLE1BRGI7QUFFVixnQ0FBNEIsTUFGbEI7QUFHViwwQkFBc0IsTUFIWjtBQUlWO0FBQ0EsNEJBQXdCO0FBTGQsR0FYQztBQWtCYnRCLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQXpELE1BQUUsRUFBRSxvQkFGTjtBQUdFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUhaO0FBSUVsRixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLGtCQURBO0FBRUpJLFlBQUUsRUFBRSw4QkFGQTtBQUdKQyxZQUFFLEVBQUUscUJBSEE7QUFJSkMsWUFBRSxFQUFFLElBSkE7QUFLSkMsWUFBRSxFQUFFLElBTEE7QUFNSkMsWUFBRSxFQUFFO0FBTkE7QUFIRCxPQUFQO0FBWUQ7QUFqQkgsR0FEUTtBQWxCRyxDQUFmLEU7O0FDTkE7QUFDQTtDQUlBOztBQUVBLDhDQUFlO0FBQ2JVLFFBQU0sRUFBRUMsMERBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHdCQUFvQixNQURWO0FBQ2tCO0FBQzVCLDZCQUF5QixNQUZmO0FBRXVCO0FBQ2pDLHdCQUFvQixNQUhWO0FBR2tCO0FBQzVCLDBCQUFzQixNQUpaO0FBSW9CO0FBQzlCLDRCQUF3QixNQUxkO0FBS3NCO0FBQ2hDLDJCQUF1QixNQU5iO0FBTXFCO0FBQy9CLDBCQUFzQixNQVBaO0FBT29CO0FBQzlCLHlCQUFxQixNQVJYLENBUW1COztBQVJuQixHQUZDO0FBWWJDLFdBQVMsRUFBRTtBQUNULHlCQUFxQjtBQURaLEdBWkU7QUFlYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQXpELE1BQUUsRUFBRSxzQkFGTjtBQUdFO0FBQ0FFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSlo7QUFLRW1DLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsV0FERTtBQUVOSSxZQUFFLEVBQUUsbUJBRkU7QUFHTkMsWUFBRSxFQUFFLGVBSEU7QUFJTkMsWUFBRSxFQUFFLEtBSkU7QUFLTkMsWUFBRSxFQUFFO0FBTEU7QUFISCxPQUFQO0FBV0Q7QUFqQkgsR0FEUSxFQW9CUjtBQUNFNUMsTUFBRSxFQUFFLG9CQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRVYsZUFBVyxFQUFFLENBQUN4QixLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQy9CLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0x3RCxjQUFNLEVBQUU7QUFDTjlDLFlBQUUsRUFBRSxhQURFO0FBRU5JLFlBQUUsRUFBRSxtQkFGRTtBQUdOQyxZQUFFLEVBQUUsbUJBSEU7QUFJTkMsWUFBRSxFQUFFLEtBSkU7QUFLTkMsWUFBRSxFQUFFO0FBTEU7QUFISCxPQUFQO0FBV0Q7QUFmSCxHQXBCUSxFQXFDUjtBQUNFO0FBQ0E1QyxNQUFFLEVBQUUsc0JBRk47QUFHRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FIWjtBQUlFVixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTG5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRlQ7QUFHTHdELGNBQU0sRUFBRTtBQUNOOUMsWUFBRSxFQUFFLGFBREU7QUFFTkksWUFBRSxFQUFFLG1CQUZFO0FBR05DLFlBQUUsRUFBRSxpQkFIRTtBQUlOQyxZQUFFLEVBQUUsS0FKRTtBQUtOQyxZQUFFLEVBQUU7QUFMRTtBQUhILE9BQVA7QUFXRDtBQWhCSCxHQXJDUTtBQWZHLENBQWYsRTs7Q0NMQTs7QUFDQSxnREFBZTtBQUNiVyxRQUFNLEVBQUVDLHNFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixzQkFBa0I7QUFEUixHQUZDO0FBS2JFLFlBQVUsRUFBRTtBQUNWLDBCQUFzQjtBQURaO0FBTEMsQ0FBZixFOztBQ0hBO0FBQ0E7Q0FJQTs7QUFDQSw2REFBZTtBQUNieEIsUUFBTSxFQUFFQywwRUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysd0JBQW9CLE1BRFY7QUFFVixvQkFBZ0IsTUFGTjtBQUdWLGtCQUFjLE1BSEo7QUFJVixzQkFBa0IsTUFKUjtBQUtWLHNCQUFrQjtBQUxSLEdBRkM7QUFTYkUsWUFBVSxFQUFFO0FBQ1YsMkJBQXVCLE1BRGI7QUFFVixzQkFBa0IsTUFGUjtBQUdWLHdCQUFvQixNQUhWO0FBSVYsMEJBQXNCO0FBSlosR0FUQztBQWVidEIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSxjQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRXRDLG1CQUFlLEVBQUUsQ0FIbkI7QUFJRUMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBTkgsR0FEUSxFQVNSO0FBQ0U7QUFDQTtBQUNBM0UsTUFBRSxFQUFFLGtCQUhOO0FBSUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBSlo7QUFLRW5GLG1CQUFlLEVBQUUsQ0FMbkI7QUFNRUMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDNEI7QUFBckQsT0FBUDtBQUNEO0FBUkgsR0FUUTtBQWZHLENBQWYsRTs7QUNOQTtBQUNBO0NBSUE7O0FBQ0EsNkRBQWU7QUFDYnFDLFFBQU0sRUFBRUMsd0ZBREs7QUFFYnVCLFlBQVUsRUFBRTtBQUNWLHdCQUFvQixNQURWO0FBRVYsd0JBQW9CLE1BRlY7QUFHVixvQkFBZ0IsTUFITjtBQUlWLDhCQUEwQjtBQUpoQixHQUZDO0FBUWJ0QixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLG1CQUROO0FBRUU7QUFDQTtBQUNBO0FBQ0FFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBakI7QUFBcUNHLFdBQUssRUFBRWdCLHNDQUFpQkE7QUFBN0QsS0FBdkIsQ0FMWjtBQU1FckcsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRSxhQURBO0FBRUpJLFlBQUUsRUFBRSxxQkFGQTtBQUdKQyxZQUFFLEVBQUUseUJBSEE7QUFJSkMsWUFBRSxFQUFFLE9BSkE7QUFLSkMsWUFBRSxFQUFFLElBTEE7QUFNSkMsWUFBRSxFQUFFO0FBTkE7QUFIRCxPQUFQO0FBWUQ7QUFuQkgsR0FEUSxFQXNCUjtBQUNFN0MsTUFBRSxFQUFFLHNCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRWxGLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUZWO0FBR0xTLFlBQUksRUFBRTtBQUNKQyxZQUFFLEVBQUUsYUFEQTtBQUVKSSxZQUFFLEVBQUUsWUFGQTtBQUdKQyxZQUFFLEVBQUUsZ0JBSEE7QUFJSkMsWUFBRSxFQUFFLGFBSkE7QUFLSkMsWUFBRSxFQUFFLE1BTEE7QUFNSkMsWUFBRSxFQUFFO0FBTkE7QUFIRCxPQUFQO0FBWUQ7QUFoQkgsR0F0QlEsRUF3Q1I7QUFDRTdDLE1BQUUsRUFBRSxxQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0VsRixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTG5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRlQ7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRSxrQkFEQTtBQUVKSSxZQUFFLEVBQUUscUJBRkE7QUFHSkMsWUFBRSxFQUFFLHlCQUhBO0FBSUpDLFlBQUUsRUFBRSxZQUpBO0FBS0pDLFlBQUUsRUFBRSxLQUxBO0FBTUpDLFlBQUUsRUFBRTtBQU5BO0FBSEQsT0FBUDtBQVlEO0FBbkJILEdBeENRLEVBNkRSO0FBQ0U3QyxNQUFFLEVBQUUsV0FETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0VyQyxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQO0FBQ0Q7QUFMSCxHQTdEUSxFQW9FUjtBQUNFM0UsTUFBRSxFQUFFLFlBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBTEgsR0FwRVEsRUEyRVI7QUFDRTNFLE1BQUUsRUFBRSxlQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQzJILE9BQUwsR0FBZTNILElBQUksQ0FBQzJILE9BQUwsSUFBZ0IsRUFBL0I7QUFDQTNILFVBQUksQ0FBQzJILE9BQUwsQ0FBYTFILE9BQU8sQ0FBQ3FDLE1BQXJCLElBQStCLElBQS9CO0FBQ0Q7QUFOSCxHQTNFUSxFQW1GUjtBQUNFM0IsTUFBRSxFQUFFLGVBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDMkgsT0FBTCxHQUFlM0gsSUFBSSxDQUFDMkgsT0FBTCxJQUFnQixFQUEvQjtBQUNBM0gsVUFBSSxDQUFDMkgsT0FBTCxDQUFhMUgsT0FBTyxDQUFDcUMsTUFBckIsSUFBK0IsS0FBL0I7QUFDRDtBQU5ILEdBbkZRLEVBMkZSO0FBQ0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EzQixNQUFFLEVBQUUsZ0JBYk47QUFjRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FkWjtBQWVFeEMsZ0JBQVksRUFBRSxDQUFDbUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQmlHLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBVixHQUErQixDQWZuRTtBQWdCRU4sZUFBVyxFQUFFLENBQUM3RixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDOUIsVUFBSSxDQUFDRCxJQUFJLENBQUMySCxPQUFOLElBQWlCLENBQUMzSCxJQUFJLENBQUMySCxPQUFMLENBQWExSCxPQUFPLENBQUNxQyxNQUFyQixDQUF0QixFQUNFO0FBQ0YsVUFBSXdELE1BQUo7QUFDQSxZQUFNSyxRQUFRLEdBQUdELFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBM0I7QUFDQSxVQUFJQSxRQUFRLEdBQUcsQ0FBZixFQUNFTCxNQUFNLEdBQUc3RixPQUFPLENBQUNxRixNQUFSLEdBQWlCLEtBQTFCLENBREYsS0FFSyxJQUFJYSxRQUFRLEdBQUcsRUFBZixFQUNITCxNQUFNLEdBQUc3RixPQUFPLENBQUNxRixNQUFSLEdBQWlCLEtBQTFCLENBREcsS0FHSFEsTUFBTSxHQUFHN0YsT0FBTyxDQUFDcUYsTUFBUixHQUFpQixLQUExQjtBQUNGLGFBQU87QUFBRTVELFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BQWhCO0FBQXdCd0QsY0FBTSxFQUFFQTtBQUFoQyxPQUFQO0FBQ0Q7QUE1QkgsR0EzRlE7QUFSRyxDQUFmLEU7O0NDSkE7O0FBQ0EseURBQWU7QUFDYjVCLFFBQU0sRUFBRUMsd0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGlDQUE2QixNQURuQjtBQUVWO0FBQ0Esd0NBQW9DLE1BSDFCO0FBSVYsb0NBQWdDLE1BSnRCO0FBS1Ysd0NBQW9DLE1BTDFCO0FBTVYsOENBQTBDLE1BTmhDO0FBT1YseUNBQXFDLE1BUDNCO0FBUVYsc0NBQWtDLE1BUnhCO0FBU1YsMkNBQXVDLE1BVDdCO0FBVVYsd0NBQW9DLE1BVjFCO0FBV1YsbUNBQStCLE1BWHJCO0FBWVYsbUNBQStCLE1BWnJCO0FBYVYsbUNBQStCLE1BYnJCO0FBY1YsbUNBQStCLE1BZHJCO0FBZVYsbUNBQStCLE1BZnJCO0FBZ0JWLG1DQUErQixNQWhCckI7QUFrQlYsZ0NBQTRCLE1BbEJsQjtBQW1CVix1Q0FBbUMsTUFuQnpCO0FBb0JWLHlDQUFxQyxNQXBCM0I7QUFzQlYsd0NBQW9DLE1BdEIxQjtBQXVCViw0Q0FBd0MsTUF2QjlCO0FBd0JWLDRDQUF3QyxNQXhCOUI7QUF5QlYsNENBQXdDLE1BekI5QjtBQTBCViw0Q0FBd0MsTUExQjlCO0FBMkJWLDRDQUF3QyxNQTNCOUI7QUE0QlYsNENBQXdDLE1BNUI5QjtBQThCVixrQ0FBOEIsTUE5QnBCO0FBK0JWLGtDQUE4QixNQS9CcEI7QUFnQ1Ysa0NBQThCLE1BaENwQjtBQWtDViwrQkFBMkIsTUFsQ2pCO0FBb0NWLDJDQUF1QyxNQXBDN0I7QUFxQ1YsMkNBQXVDLE1BckM3QjtBQXNDViwyQ0FBdUMsTUF0QzdCO0FBd0NWLDhCQUEwQixNQXhDaEI7QUF5Q1YsMkNBQXVDLE1BekM3QjtBQTBDVjtBQUVBLG9DQUFnQyxNQTVDdEI7QUE2Q1Ysb0NBQWdDLE1BN0N0QjtBQThDVixvQ0FBZ0MsTUE5Q3RCO0FBK0NWLG9DQUFnQyxNQS9DdEI7QUFnRFYsb0NBQWdDLE1BaER0QjtBQWlEVixtQ0FBK0IsTUFqRHJCO0FBbURWLHVDQUFtQyxNQW5EekI7QUFvRFYsMENBQXNDLE1BcEQ1QjtBQXNEVixrQ0FBOEIsTUF0RHBCO0FBdURWLGtDQUE4QixNQXZEcEI7QUF3RFYsa0NBQThCLE1BeERwQjtBQXlEVixrQ0FBOEIsTUF6RHBCO0FBMERWLGtDQUE4QixNQTFEcEI7QUEyRFYsa0NBQThCLE1BM0RwQjtBQTREVixrQ0FBOEIsTUE1RHBCO0FBOERWLHdDQUFvQyxNQTlEMUI7QUErRFYsb0NBQWdDLE1BL0R0QjtBQWdFVixxQ0FBaUMsTUFoRXZCO0FBaUVWLGlDQUE2QixNQWpFbkI7QUFrRVYsMkJBQXVCLE1BbEViO0FBb0VWLGdDQUE0QixNQXBFbEI7QUFxRVYsb0NBQWdDLE1BckV0QjtBQXNFVixpQ0FBNkIsTUF0RW5CO0FBd0VWLG1DQUErQixNQXhFckI7QUF3RTZCO0FBQ3ZDLG9DQUFnQyxNQXpFdEI7QUEwRVYsb0NBQWdDLE1BMUV0QjtBQTJFVixvQ0FBZ0MsTUEzRXRCO0FBNEVWLG9DQUFnQyxNQTVFdEI7QUE4RVYsNkJBQXlCLE1BOUVmO0FBZ0ZWLG9DQUFnQyxNQWhGdEI7QUFpRlYsb0NBQWdDLE1BakZ0QjtBQW1GViwrQkFBMkIsTUFuRmpCO0FBb0ZWLCtCQUEyQjtBQXBGakIsR0FGQztBQXlGYkMsV0FBUyxFQUFFO0FBQ1QseUNBQXFDO0FBRDVCO0FBekZFLENBQWYsRTs7Q0NEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEseURBQWU7QUFDYnZCLFFBQU0sRUFBRUMsd0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLG1DQUErQixNQURyQjtBQUM2QjtBQUN2QyxtQ0FBK0IsTUFGckI7QUFFNkI7QUFDdkMsbUNBQStCLE1BSHJCO0FBRzZCO0FBQ3ZDLHFDQUFpQyxNQUp2QjtBQUkrQjtBQUN6QyxvQ0FBZ0MsTUFMdEI7QUFLOEI7QUFDeEMsb0NBQWdDLE1BTnRCO0FBTThCO0FBQ3hDLGdDQUE0QixNQVBsQjtBQU8wQjtBQUNwQyx5Q0FBcUMsTUFSM0I7QUFRbUM7QUFDN0Msc0NBQWtDLE1BVHhCO0FBU2dDO0FBQzFDLHdDQUFvQyxNQVYxQjtBQVVrQztBQUM1QywyQ0FBdUMsTUFYN0I7QUFXcUM7QUFDL0MsMENBQXNDLE1BWjVCO0FBWW9DO0FBQzlDLGtDQUE4QixNQWJwQjtBQWE0QjtBQUN0QyxrREFBOEMsTUFkcEM7QUFjNEM7QUFDdEQsa0RBQThDLE1BZnBDO0FBZTRDO0FBQ3RELGtEQUE4QyxNQWhCcEM7QUFnQjRDO0FBQ3RELHVDQUFtQyxNQWpCekI7QUFpQmlDO0FBQzNDLHVDQUFtQyxNQWxCekI7QUFrQmlDO0FBQzNDLHNDQUFrQyxNQW5CeEI7QUFtQmdDO0FBQzFDLG9EQUFnRCxNQXBCdEM7QUFvQjhDO0FBQ3hELG9EQUFnRCxNQXJCdEM7QUFxQjhDO0FBQ3hELHVDQUFtQyxNQXRCekI7QUFzQmlDO0FBQzNDLG9DQUFnQyxNQXZCdEI7QUF1QjhCO0FBQ3hDLGdDQUE0QixNQXhCbEI7QUF3QjBCO0FBQ3BDLCtCQUEyQixNQXpCakI7QUF5QnlCO0FBQ25DLGdDQUE0QixNQTFCbEI7QUEwQjBCO0FBQ3BDLHlDQUFxQyxNQTNCM0I7QUEyQm1DO0FBQzdDLGtDQUE4QixNQTVCcEI7QUE0QjRCO0FBQ3RDLDZDQUF5QyxNQTdCL0I7QUE2QnVDO0FBQ2pELCtDQUEyQyxNQTlCakM7QUE4QnlDO0FBQ25ELHNEQUFrRCxNQS9CeEM7QUErQmdEO0FBQzFELDhDQUEwQyxNQWhDaEM7QUFnQ3dDO0FBQ2xELDhDQUEwQyxNQWpDaEM7QUFpQ3dDO0FBQ2xELDRDQUF3QyxNQWxDOUI7QUFrQ3NDO0FBQ2hELDRDQUF3QyxNQW5DOUI7QUFtQ3NDO0FBQ2hELCtDQUEyQyxNQXBDakM7QUFvQ3lDO0FBQ25ELCtDQUEyQyxNQXJDakM7QUFxQ3lDO0FBQ25ELDJDQUF1QyxNQXRDN0I7QUFzQ3FDO0FBQy9DLDJDQUF1QyxNQXZDN0I7QUF1Q3FDO0FBQy9DLDRDQUF3QyxNQXhDOUIsQ0F3Q3NDO0FBQ2hEO0FBQ0E7QUFDQTs7QUEzQ1UsR0FGQztBQStDYkUsWUFBVSxFQUFFO0FBQ1Ysa0NBQThCLE1BRHBCO0FBQzRCO0FBQ3RDLGtDQUE4QixNQUZwQjtBQUU0QjtBQUN0QyxrQ0FBOEIsTUFIcEI7QUFHNEI7QUFDdEMsa0NBQThCLE1BSnBCO0FBSTRCO0FBQ3RDLGtDQUE4QixNQUxwQjtBQUs0QjtBQUN0QyxrQ0FBOEIsTUFOcEI7QUFNNEI7QUFDdEMsa0NBQThCLE1BUHBCO0FBTzRCO0FBQ3RDLGtDQUE4QixNQVJwQjtBQVE0QjtBQUN0Qyx3Q0FBb0MsTUFUMUIsQ0FTa0M7O0FBVGxDLEdBL0NDO0FBMERiRCxXQUFTLEVBQUU7QUFDVDtBQUNBO0FBQ0EsMkNBQXVDLE1BSDlCO0FBSVQ7QUFDQSwwQ0FBc0MsTUFMN0I7QUFLcUM7QUFDOUMsb0RBQWdELE1BTnZDO0FBTStDO0FBQ3hELDBDQUFzQyxNQVA3QixDQU9xQzs7QUFQckMsR0ExREU7QUFtRWJNLFdBQVMsRUFBRTtBQUNULHlDQUFxQyxNQUQ1QjtBQUNvQztBQUM3QyxnREFBNEMsTUFGbkM7QUFHVCwwQ0FBc0MsTUFIN0IsQ0FHcUM7O0FBSHJDLEdBbkVFO0FBd0ViSixpQkFBZSxFQUFFO0FBQ2Ysb0JBQWdCLEtBREQsQ0FDUTs7QUFEUjtBQXhFSixDQUFmLEU7O0FDVEE7Q0FHQTtBQUNBOztBQUVBLG9FQUFlO0FBQ2J6QixRQUFNLEVBQUVDLDBFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw0Q0FBd0MsTUFEOUI7QUFDc0M7QUFDaEQsNENBQXdDLE1BRjlCO0FBRXNDO0FBQ2hELDBDQUFzQyxNQUg1QjtBQUdvQztBQUM5QywwQ0FBc0MsTUFKNUI7QUFJb0M7QUFDOUMsMENBQXNDLE1BTDVCO0FBS29DO0FBQzlDLDBDQUFzQyxNQU41QjtBQU1vQztBQUM5Qyx5QkFBcUIsTUFQWDtBQU9tQjtBQUM3QixpQ0FBNkIsTUFSbkI7QUFRMkI7QUFDckMsMEJBQXNCLE1BVFo7QUFTb0I7QUFDOUIsOEJBQTBCLE1BVmhCO0FBVXdCO0FBQ2xDLDJCQUF1QixNQVhiO0FBV3FCO0FBQy9CLG1DQUErQixNQVpyQjtBQVk2QjtBQUN2QyxtQ0FBK0IsTUFickI7QUFhNkI7QUFDdkMsbUNBQStCLE1BZHJCO0FBYzZCO0FBQ3ZDLG1DQUErQixNQWZyQjtBQWU2QjtBQUN2QyxrQ0FBOEIsTUFoQnBCO0FBZ0I0QjtBQUN0QyxvQ0FBZ0MsTUFqQnRCO0FBaUI4QjtBQUN4QyxvQ0FBZ0MsTUFsQnRCO0FBa0I4QjtBQUN4QyxvQ0FBZ0MsTUFuQnRCO0FBbUI4QjtBQUN4QyxtQ0FBK0IsTUFwQnJCO0FBb0I2QjtBQUN2QyxtQ0FBK0IsTUFyQnJCO0FBcUI2QjtBQUN2Qyx5Q0FBcUMsTUF0QjNCO0FBc0JtQztBQUM3Qyx3Q0FBb0MsTUF2QjFCO0FBdUJrQztBQUM1QyxpQ0FBNkIsTUF4Qm5CO0FBd0IyQjtBQUNyQyw4QkFBMEIsTUF6QmhCO0FBeUJ3QjtBQUNsQyx5Q0FBcUMsTUExQjNCO0FBMEJtQztBQUM3Qyx5Q0FBcUMsTUEzQjNCO0FBMkJtQztBQUM3Qyx5Q0FBcUMsTUE1QjNCO0FBNEJtQztBQUM3Qyx5Q0FBcUMsTUE3QjNCO0FBNkJtQztBQUM3Qyx5Q0FBcUMsTUE5QjNCO0FBOEJtQztBQUM3Qyx5Q0FBcUMsTUEvQjNCO0FBK0JtQztBQUM3Qyx5Q0FBcUMsTUFoQzNCO0FBZ0NtQztBQUM3Qyx5Q0FBcUMsTUFqQzNCO0FBaUNtQztBQUM3QyxvQ0FBZ0MsTUFsQ3RCO0FBa0M4QjtBQUN4QyxvQ0FBZ0MsTUFuQ3RCO0FBbUM4QjtBQUN4QyxvQ0FBZ0MsTUFwQ3RCO0FBb0M4QjtBQUN4QyxvQ0FBZ0MsTUFyQ3RCO0FBcUM4QjtBQUN4QyxvQ0FBZ0MsTUF0Q3RCO0FBc0M4QjtBQUN4QyxvQ0FBZ0MsTUF2Q3RCO0FBdUM4QjtBQUN4QyxvQ0FBZ0MsTUF4Q3RCO0FBd0M4QjtBQUN4QyxpQ0FBNkIsTUF6Q25CO0FBeUMyQjtBQUNyQyxpQ0FBNkIsTUExQ25CO0FBMEMyQjtBQUNyQyxxQ0FBaUMsTUEzQ3ZCO0FBMkMrQjtBQUN6QywwQ0FBc0MsTUE1QzVCO0FBNENvQztBQUM5QyxzQ0FBa0MsTUE3Q3hCO0FBNkNnQztBQUMxQyxpREFBNkMsTUE5Q25DO0FBOEMyQztBQUNyRCxnREFBNEMsTUEvQ2xDO0FBK0MwQztBQUNwRCw0Q0FBd0MsTUFoRDlCO0FBZ0RzQztBQUNoRCw0Q0FBd0MsTUFqRDlCO0FBaURzQztBQUNoRCxxQ0FBaUMsTUFsRHZCO0FBa0QrQjtBQUN6Qyx5Q0FBcUMsTUFuRDNCO0FBbURtQztBQUM3Qyx3Q0FBb0MsTUFwRDFCO0FBb0RrQztBQUM1QyxxQ0FBaUMsTUFyRHZCO0FBcUQrQjtBQUN6Qyw2Q0FBeUMsTUF0RC9CO0FBc0R1QztBQUNqRCx3Q0FBb0MsTUF2RDFCO0FBdURrQztBQUM1Qyw4Q0FBMEMsTUF4RGhDO0FBd0R3QztBQUNsRCxxQ0FBaUMsTUF6RHZCO0FBeUQrQjtBQUN6Qyw0Q0FBd0MsTUExRDlCO0FBMERzQztBQUNoRCw0Q0FBd0MsTUEzRDlCO0FBMkRzQztBQUNoRCxzREFBa0QsTUE1RHhDLENBNERnRDs7QUE1RGhELEdBRkM7QUFnRWJFLFlBQVUsRUFBRTtBQUNWLDhDQUEwQyxNQURoQyxDQUN3Qzs7QUFEeEMsR0FoRUM7QUFtRWJELFdBQVMsRUFBRTtBQUNULHlDQUFxQyxNQUQ1QjtBQUNvQztBQUM3Qyx3Q0FBb0MsTUFGM0IsQ0FFbUM7O0FBRm5DLEdBbkVFO0FBdUViTSxXQUFTLEVBQUU7QUFDVCx3Q0FBb0MsTUFEM0I7QUFDbUM7QUFDNUMsd0NBQW9DLE1BRjNCO0FBRW1DO0FBQzVDLG9DQUFnQyxNQUh2QixDQUcrQjs7QUFIL0IsR0F2RUU7QUE0RWIzQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLG1CQUROO0FBRUU7QUFDQTtBQUNBRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQ7QUFBTixLQUFuQixDQUpaO0FBS0VrRixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTG5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRlQ7QUFHTHdELGNBQU0sRUFBRTtBQUNOOUMsWUFBRSxFQUFFLGFBREU7QUFFTkksWUFBRSxFQUFFLGdCQUZFO0FBR05DLFlBQUUsRUFBRSxrQkFIRTtBQUlOQyxZQUFFLEVBQUUsUUFKRTtBQUtOQyxZQUFFLEVBQUUsTUFMRTtBQU1OQyxZQUFFLEVBQUU7QUFORTtBQUhILE9BQVA7QUFZRDtBQWxCSCxHQURRO0FBNUVHLENBQWYsRTs7QUNOQTtBQUVBLHVEQUFlO0FBQ2JVLFFBQU0sRUFBRUMsc0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDJCQUF1QixNQURiO0FBRVYseUJBQXFCLE1BRlg7QUFHViw0QkFBd0IsTUFIZDtBQUlWLDZCQUF5QixNQUpmO0FBS1YsaUNBQTZCLE1BTG5CO0FBTVYsaUNBQTZCLE1BTm5CO0FBT1YsZ0NBQTRCLE1BUGxCO0FBUVYsZ0NBQTRCLE1BUmxCO0FBU1YsNEJBQXdCLE1BVGQ7QUFVViwwQkFBc0IsTUFWWjtBQVdWLDJCQUF1QixNQVhiO0FBWVYsb0NBQWdDLE1BWnRCO0FBYVYsb0NBQWdDLE1BYnRCO0FBY1YsNEJBQXdCLE1BZGQ7QUFlVix3QkFBb0IsTUFmVjtBQWdCViw2QkFBeUIsTUFoQmY7QUFpQlYscUJBQWlCLE1BakJQO0FBa0JWLDZCQUF5QixNQWxCZjtBQW1CViwyQkFBdUIsTUFuQmI7QUFvQlYsOEJBQTBCLE1BcEJoQixDQXFCVjs7QUFyQlU7QUFGQyxDQUFmLEU7O0FDRkE7QUFFQSw4Q0FBZTtBQUNidEIsUUFBTSxFQUFFQyxzQ0FESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsMkJBQXVCLE1BRGI7QUFFVixxQkFBaUIsTUFGUDtBQUdWLDJCQUF1QixNQUhiO0FBSVYsK0JBQTJCLE1BSmpCO0FBS1YsK0JBQTJCLE1BTGpCO0FBTVYsMEJBQXNCLE1BTlo7QUFPViwyQkFBdUIsTUFQYjtBQVFWLHlCQUFxQixNQVJYO0FBU1YsMkJBQXVCLE1BVGI7QUFVVix5QkFBcUIsTUFWWDtBQVdWLDhCQUEwQixNQVhoQjtBQVlWLGlDQUE2QixNQVpuQjtBQWFWLDJCQUF1QixNQWJiO0FBY1YsaUNBQTZCLE1BZG5CO0FBZVYsNkJBQXlCLE1BZmY7QUFnQlYsNkJBQXlCLE1BaEJmO0FBaUJWLGdDQUE0QixNQWpCbEI7QUFrQlYsMEJBQXNCO0FBbEJaLEdBRkM7QUFzQmJFLFlBQVUsRUFBRTtBQUNWLDJCQUF1QjtBQURiO0FBdEJDLENBQWYsRTs7QUNGQTtBQUVBLHVEQUFlO0FBQ2J4QixRQUFNLEVBQUVDLHNEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViwwQ0FBc0MsTUFENUI7QUFDb0M7QUFDOUMsNkNBQXlDLE1BRi9CO0FBRXVDO0FBQ2pELDZDQUF5QyxNQUgvQjtBQUd1QztBQUNqRCx3Q0FBb0MsTUFKMUI7QUFJa0M7QUFDNUMsaURBQTZDLE1BTG5DO0FBSzJDO0FBQ3JELHNDQUFrQyxNQU54QjtBQU1nQztBQUMxQyxrREFBOEMsTUFQcEM7QUFPNEM7QUFDdEQsb0NBQWdDLE1BUnRCO0FBUThCO0FBQ3hDLG9DQUFnQyxNQVR0QjtBQVM4QjtBQUN4QyxvQ0FBZ0MsTUFWdEI7QUFVOEI7QUFDeEMsbUNBQStCLE1BWHJCO0FBVzZCO0FBQ3ZDLG1DQUErQixNQVpyQjtBQVk2QjtBQUN2Qyw2Q0FBeUMsTUFiL0I7QUFhdUM7QUFDakQsMkNBQXVDLE1BZDdCO0FBY3FDO0FBQy9DLHlDQUFxQyxNQWYzQjtBQWVtQztBQUM3Qyx5Q0FBcUMsTUFoQjNCO0FBZ0JtQztBQUM3Qyx3Q0FBb0MsTUFqQjFCO0FBaUJrQztBQUM1Qyx1Q0FBbUMsTUFsQnpCO0FBa0JpQztBQUMzQyw0Q0FBd0MsTUFuQjlCO0FBbUJzQztBQUNoRCw0Q0FBd0MsTUFwQjlCO0FBb0JzQztBQUNoRCxvQ0FBZ0MsTUFyQnRCO0FBcUI4QjtBQUN4QywrQ0FBMkMsTUF0QmpDO0FBc0J5QztBQUNuRCxvQ0FBZ0MsTUF2QnRCO0FBdUI4QjtBQUN4Qyx3Q0FBb0MsTUF4QjFCLENBd0JrQzs7QUF4QmxDLEdBRkM7QUE0QmJDLFdBQVMsRUFBRTtBQUNULDRDQUF3QyxNQUQvQjtBQUN1QztBQUNoRCwwQ0FBc0MsTUFGN0I7QUFFcUM7QUFDOUMsMENBQXNDLE1BSDdCLENBR3FDOztBQUhyQztBQTVCRSxDQUFmLEU7O0FDRkE7Q0FHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnREFBZTtBQUNidkIsUUFBTSxFQUFFQyx3Q0FESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysd0JBQW9CLE1BRFY7QUFDa0I7QUFDNUIsMkJBQXVCLE1BRmI7QUFFcUI7QUFDL0IsK0JBQTJCLE1BSGpCO0FBR3lCO0FBQ25DLHdCQUFvQixNQUpWO0FBSWtCO0FBQzVCLHdCQUFvQixNQUxWO0FBS2tCO0FBQzVCLCtCQUEyQixNQU5qQjtBQU15QjtBQUNuQyxrQ0FBOEIsTUFQcEI7QUFPNEI7QUFDdEMsZ0NBQTRCLE1BUmxCO0FBUTBCO0FBQ3BDLG9DQUFnQztBQVR0QixHQUZDO0FBY2JwQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLHFCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRXJDLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ3FGO0FBQXJELE9BQVA7QUFDRDtBQUxILEdBRFEsRUFRUjtBQUNFM0UsTUFBRSxFQUFFLHNCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRXJDLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ3FGO0FBQXJELE9BQVA7QUFDRDtBQUxILEdBUlEsRUFlUjtBQUNFM0UsTUFBRSxFQUFFLDBCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRXJDLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ3FGO0FBQXJELE9BQVA7QUFDRDtBQUxILEdBZlE7QUFkRyxDQUFmLEU7O0FDUkE7QUFDQTtDQUlBOztBQUVBLHNEQUFlO0FBQ2JwQixRQUFNLEVBQUVDLDBEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw0QkFBd0IsTUFEZDtBQUNzQjtBQUNoQyx5QkFBcUIsTUFGWDtBQUVtQjtBQUM3QiwwQkFBc0IsTUFIWjtBQUdvQjtBQUM5QixzQkFBa0IsTUFKUjtBQUlnQjtBQUMxQixxQkFBaUIsTUFMUDtBQUtlO0FBQ3pCLDBCQUFzQixNQU5aO0FBTW9CO0FBQzlCLDBCQUFzQixNQVBaO0FBT29CO0FBQzlCLDZCQUF5QixNQVJmO0FBUXVCO0FBQ2pDLHlCQUFxQixNQVRYO0FBU21CO0FBQzdCLHlCQUFxQixNQVZYO0FBVW1CO0FBQzdCLHlCQUFxQixNQVhYO0FBV21CO0FBQzdCLHlCQUFxQixNQVpYO0FBWW1CO0FBQzdCLDRCQUF3QixNQWJkO0FBYXNCO0FBQ2hDLHlCQUFxQixNQWRYO0FBY21CO0FBQzdCLHlCQUFxQixNQWZYO0FBZW1CO0FBQzdCLDRCQUF3QixNQWhCZDtBQWdCc0I7QUFDaEMsaUJBQWEsTUFqQkg7QUFpQlc7QUFDckIscUJBQWlCLE1BbEJQO0FBa0JlO0FBQ3pCLHVCQUFtQixNQW5CVDtBQW1CaUI7QUFDM0IsdUJBQW1CLE1BcEJUO0FBb0JpQjtBQUMzQiwwQkFBc0IsTUFyQlo7QUFxQm9CO0FBQzlCLDBCQUFzQixNQXRCWjtBQXNCb0I7QUFDOUIscUJBQWlCLE1BdkJQLENBdUJlOztBQXZCZixHQUZDO0FBMkJiQyxXQUFTLEVBQUU7QUFDVCwrQkFBMkIsTUFEbEI7QUFDMEI7QUFDbkMscUJBQWlCLE1BRlI7QUFFZ0I7QUFDekIseUJBQXFCLE1BSFosQ0FHb0I7O0FBSHBCLEdBM0JFO0FBZ0NiTSxXQUFTLEVBQUU7QUFDVCx3QkFBb0IsTUFEWCxDQUNtQjs7QUFEbkIsR0FoQ0U7QUFtQ2JKLGlCQUFlLEVBQUU7QUFDZixvQkFBZ0IsS0FERCxDQUNROztBQURSLEdBbkNKO0FBc0NiQyxpQkFBZSxFQUFFO0FBQ2YseUJBQXFCLEtBRE4sQ0FDYTs7QUFEYixHQXRDSjtBQXlDYkssVUFBUSxFQUFFO0FBQ1I7QUFDQTtBQUNBO0FBQ0Esd0JBQW9CO0FBSlosR0F6Q0c7QUErQ2I3QixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLGtCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRTtBQUNBekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDcUYsaUJBQUwsQ0FBdUJwRixPQUF2QixJQUFrQyxDQUpsRTtBQUtFb0IsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBUEgsR0FEUTtBQS9DRyxDQUFmLEU7O0FDUEE7QUFFQSx3REFBZTtBQUNibEIsUUFBTSxFQUFFQyx3REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsNkJBQXlCLE1BRGY7QUFFViwrQkFBMkIsTUFGakI7QUFHViw2QkFBeUIsTUFIZjtBQUlWLGtDQUE4QixNQUpwQjtBQUtWLDZCQUF5QixNQUxmO0FBTVYsbUNBQStCLE1BTnJCO0FBT1YsbUNBQStCLE1BUHJCO0FBUVYsbUNBQStCLE1BUnJCO0FBU1YscUNBQWlDLE1BVHZCO0FBVVYsOEJBQTBCLE1BVmhCO0FBV1YsNkJBQXlCO0FBWGYsR0FGQztBQWViRSxZQUFVLEVBQUU7QUFDViw0QkFBd0I7QUFEZCxHQWZDO0FBa0JiRCxXQUFTLEVBQUU7QUFDVCwrQkFBMkI7QUFEbEIsR0FsQkU7QUFxQmJNLFdBQVMsRUFBRTtBQUNULDhCQUEwQjtBQURqQjtBQXJCRSxDQUFmLEU7O0FDRkE7QUFFQSxvREFBZTtBQUNiN0IsUUFBTSxFQUFFQyxnREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsNEJBQXdCLE1BRGQ7QUFFVix3QkFBb0IsTUFGVjtBQUdWLCtCQUEyQixNQUhqQjtBQUlWLDJCQUF1QixNQUpiO0FBS1YsZ0NBQTRCLE1BTGxCO0FBTVYsNEJBQXdCLE1BTmQ7QUFPVixpQ0FBNkIsTUFQbkI7QUFRVixnQ0FBNEIsTUFSbEI7QUFTVixpQ0FBNkIsTUFUbkI7QUFVViwwQkFBc0I7QUFWWjtBQUZDLENBQWYsRTs7Q0NBQTs7QUFFQSxxREFBZTtBQUNidEIsUUFBTSxFQUFFQyxrREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1Ysc0NBQWtDLE1BRHhCO0FBQ2dDO0FBQzFDLDJDQUF1QyxNQUY3QjtBQUVxQztBQUMvQyx3Q0FBb0MsTUFIMUI7QUFHa0M7QUFDNUMsNkNBQXlDLE1BSi9CO0FBSXVDO0FBQ2pELDhCQUEwQixNQUxoQjtBQUt3QjtBQUNsQyx1Q0FBbUMsTUFOekI7QUFNaUM7QUFDM0MsdUNBQW1DLE1BUHpCO0FBT2lDO0FBQzNDLHVDQUFtQyxNQVJ6QjtBQVFpQztBQUMzQyxnQ0FBNEIsTUFUbEI7QUFTMEI7QUFDcEMscUNBQWlDLE1BVnZCO0FBVStCO0FBQ3pDLDJCQUF1QixNQVhiO0FBV3FCO0FBQy9CLHFEQUFpRCxNQVp2QztBQVkrQztBQUN6RCxnQ0FBNEIsTUFibEI7QUFhMEI7QUFDcEMscUNBQWlDLE1BZHZCO0FBYytCO0FBQ3pDLHFDQUFpQyxNQWZ2QjtBQWUrQjtBQUN6QywwQ0FBc0MsTUFoQjVCO0FBZ0JvQztBQUM5Qyw4Q0FBMEMsTUFqQmhDO0FBaUJ3QztBQUNsRCxxQ0FBaUMsTUFsQnZCO0FBa0IrQjtBQUN6Qyw2Q0FBeUMsTUFuQi9CO0FBbUJ1QztBQUNqRCxrREFBOEMsTUFwQnBDO0FBb0I0QztBQUN0RCx3Q0FBb0MsTUFyQjFCO0FBcUJrQztBQUM1QywwQ0FBc0MsTUF0QjVCO0FBc0JvQztBQUM5Qyw0Q0FBd0MsTUF2QjlCO0FBdUJzQztBQUNoRCx1Q0FBbUMsTUF4QnpCO0FBd0JpQztBQUMzQyxtQ0FBK0IsTUF6QnJCLENBeUI2Qjs7QUF6QjdCLEdBRkM7QUE2QmJFLFlBQVUsRUFBRTtBQUNWLCtCQUEyQixNQURqQixDQUN5Qjs7QUFEekIsR0E3QkM7QUFnQ2JELFdBQVMsRUFBRTtBQUNULDBCQUFzQixNQURiO0FBQ3FCO0FBQzlCLDRCQUF3QixNQUZmLENBRXVCOztBQUZ2QjtBQWhDRSxDQUFmLEU7O0FDSkE7QUFFQSw4Q0FBZTtBQUNidkIsUUFBTSxFQUFFQyxvQ0FESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsdUJBQW1CLE1BRFQ7QUFFVix1QkFBbUIsTUFGVDtBQUdWLHdCQUFvQixNQUhWO0FBSVYsMkJBQXVCLE1BSmI7QUFLViwyQkFBdUIsTUFMYjtBQU1WLDJCQUF1QixNQU5iO0FBT1YseUJBQXFCLE1BUFg7QUFRViwyQkFBdUIsTUFSYjtBQVNWLHFCQUFpQixNQVRQO0FBVVYsK0JBQTJCLE1BVmpCO0FBV1YsNEJBQXdCLE1BWGQ7QUFZVixnQ0FBNEIsTUFabEI7QUFhVixnQ0FBNEIsTUFibEI7QUFjVixnQ0FBNEIsTUFkbEI7QUFlVixnQ0FBNEIsTUFmbEI7QUFnQlYsZ0NBQTRCLE1BaEJsQjtBQWlCVixpQ0FBNkIsTUFqQm5CO0FBa0JWLGlDQUE2QixNQWxCbkI7QUFtQlYsaUNBQTZCLE1BbkJuQjtBQW9CVix3QkFBb0I7QUFwQlYsR0FGQztBQXdCYkUsWUFBVSxFQUFFO0FBQ1YsNEJBQXdCLE1BRGQ7QUFFVix1QkFBbUIsTUFGVDtBQUdWLHNCQUFrQjtBQUhSO0FBeEJDLENBQWYsRTs7Q0NBQTtBQUNBOztBQUVBLCtDQUFlO0FBQ2J4QixRQUFNLEVBQUVDLHdDQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVix5Q0FBcUMsTUFEM0I7QUFDbUM7QUFDN0MsbURBQStDLE1BRnJDO0FBRTZDO0FBQ3ZELHVDQUFtQyxNQUh6QjtBQUdpQztBQUMzQyw0Q0FBd0MsTUFKOUI7QUFJc0M7QUFDaEQseURBQXFELE1BTDNDO0FBS21EO0FBQzdELHFDQUFpQyxNQU52QjtBQU0rQjtBQUN6QywwQ0FBc0MsTUFQNUI7QUFPb0M7QUFDOUMsOENBQTBDLE1BUmhDO0FBUXdDO0FBQ2xELHdDQUFvQyxNQVQxQjtBQVNrQztBQUM1Qyx3Q0FBb0MsTUFWMUI7QUFVa0M7QUFDNUMsMkNBQXVDLE1BWDdCO0FBV3FDO0FBQy9DLHFEQUFpRCxNQVp2QztBQVkrQztBQUN6RCw2Q0FBeUMsTUFiL0I7QUFhdUM7QUFDakQsaURBQTZDLE1BZG5DO0FBYzJDO0FBQ3JELGdEQUE0QyxNQWZsQztBQWUwQztBQUNwRCxtQ0FBK0IsTUFoQnJCO0FBZ0I2QjtBQUN2QyxrREFBOEMsTUFqQnBDO0FBaUI0QztBQUN0RCw2Q0FBeUMsTUFsQi9CO0FBa0J1QztBQUNqRCxpREFBNkMsTUFuQm5DO0FBbUIyQztBQUNyRCxtREFBK0MsTUFwQnJDO0FBb0I2QztBQUN2RCw4Q0FBMEMsTUFyQmhDO0FBcUJ3QztBQUNsRCx3Q0FBb0MsTUF0QjFCO0FBc0JrQztBQUM1Qyw2Q0FBeUMsTUF2Qi9CO0FBdUJ1QztBQUNqRCwwQ0FBc0MsTUF4QjVCLENBd0JvQzs7QUF4QnBDLEdBRkM7QUE0QmJDLFdBQVMsRUFBRTtBQUNULHdDQUFvQyxNQUQzQixDQUNtQzs7QUFEbkM7QUE1QkUsQ0FBZixFOztBQ0xBO0FBRUEsbURBQWU7QUFDYnZCLFFBQU0sRUFBRUMsb0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHVCQUFtQixNQURUO0FBQ2lCO0FBQzNCLDZCQUF5QixNQUZmO0FBRXVCO0FBQ2pDLCtCQUEyQixNQUhqQjtBQUd5QjtBQUNuQywrQkFBMkIsTUFKakI7QUFJeUI7QUFDbkMsMkJBQXVCLE1BTGI7QUFLcUI7QUFDL0IsOEJBQTBCLE1BTmhCO0FBTXdCO0FBQ2xDLHdCQUFvQixNQVBWO0FBT2tCO0FBQzVCLDZCQUF5QixNQVJmO0FBUXVCO0FBQ2pDLG9DQUFnQyxNQVR0QjtBQVM4QjtBQUN4QyxvQ0FBZ0MsTUFWdEI7QUFVOEI7QUFDeEMsb0NBQWdDLE1BWHRCO0FBVzhCO0FBQ3hDLDZCQUF5QixNQVpmO0FBWXVCO0FBQ2pDLGlDQUE2QixNQWJuQjtBQWEyQjtBQUNyQyx5QkFBcUIsTUFkWDtBQWNtQjtBQUM3QixrQ0FBOEIsTUFmcEI7QUFlNEI7QUFDdEMsMkJBQXVCLE1BaEJiLENBZ0JxQjs7QUFoQnJCLEdBRkM7QUFvQmJDLFdBQVMsRUFBRTtBQUNULDZCQUF5QixNQURoQjtBQUN3QjtBQUNqQyxvQ0FBZ0MsTUFGdkIsQ0FFK0I7O0FBRi9CO0FBcEJFLENBQWYsRTs7Q0NBQTs7QUFDQSx1REFBZTtBQUNidkIsUUFBTSxFQUFFQyxvREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsMkJBQXVCLE1BRGI7QUFFViw0QkFBd0IsTUFGZDtBQUlWLDBCQUFzQixNQUpaO0FBS1YseUJBQXFCLE1BTFg7QUFNVixvQkFBZ0IsTUFOTjtBQU9WLHlCQUFxQixNQVBYO0FBU1YsMkJBQXVCLE1BVGI7QUFVViw0QkFBd0IsTUFWZDtBQVdWLCtCQUEyQixNQVhqQjtBQVlWLDRCQUF3QixNQVpkO0FBY1YsbUNBQStCLE1BZHJCO0FBZVYsOEJBQTBCLE1BZmhCO0FBaUJWLDBCQUFzQixNQWpCWjtBQWtCViw0QkFBd0IsTUFsQmQ7QUFtQlYsd0JBQW9CLE1BbkJWO0FBcUJWLDZCQUF5QixNQXJCZjtBQXNCViw4QkFBMEIsTUF0QmhCO0FBdUJWLCtCQUEyQixNQXZCakI7QUF3QlYsMEJBQXNCLE1BeEJaO0FBeUJWLHNCQUFrQixNQXpCUjtBQTJCVixvQ0FBZ0M7QUEzQnRCLEdBRkM7QUErQmJDLFdBQVMsRUFBRTtBQUNULHdCQUFvQixNQURYO0FBRVQsOEJBQTBCLE1BRmpCO0FBR1QsMEJBQXNCLE1BSGI7QUFJVCw2QkFBeUI7QUFKaEI7QUEvQkUsQ0FBZixFOztBQ0hBO0FBRUEsK0NBQWU7QUFDYnZCLFFBQU0sRUFBRUMsOENBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDZCQUF5QixNQURmO0FBRVYsc0JBQWtCLE1BRlI7QUFHViwrQkFBMkIsTUFIakI7QUFJViwwQkFBc0IsTUFKWjtBQUtWLDJCQUF1QixNQUxiO0FBTVYsc0JBQWtCLE1BTlI7QUFPViwyQkFBdUIsTUFQYjtBQVFWLDZCQUF5QixNQVJmO0FBU1YsOEJBQTBCLE1BVGhCO0FBVVYsNEJBQXdCLE1BVmQ7QUFXViw2QkFBeUI7QUFYZixHQUZDO0FBZWJFLFlBQVUsRUFBRTtBQUNWLGdDQUE0QjtBQURsQjtBQWZDLENBQWYsRTs7QUNGQTtBQUNBO0NBSUE7O0FBRUEsdURBQWU7QUFDYnhCLFFBQU0sRUFBRUMsc0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHNDQUFrQyxNQUR4QjtBQUNnQztBQUMxQyxzQ0FBa0MsTUFGeEI7QUFFZ0M7QUFDMUMscUNBQWlDLE1BSHZCO0FBRytCO0FBQ3pDLDRDQUF3QyxNQUo5QjtBQUlzQztBQUNoRCw0Q0FBd0MsTUFMOUI7QUFLc0M7QUFDaEQsNENBQXdDLE1BTjlCO0FBTXNDO0FBQ2hELDZDQUF5QyxNQVAvQjtBQU91QztBQUNqRCw2Q0FBeUMsTUFSL0I7QUFRdUM7QUFDakQsNkNBQXlDLE1BVC9CO0FBU3VDO0FBQ2pELHlDQUFxQyxNQVYzQjtBQVVtQztBQUM3Qyx1Q0FBbUMsTUFYekI7QUFXaUM7QUFDM0MsdUNBQW1DLE1BWnpCO0FBWWlDO0FBQzNDLDJDQUF1QyxNQWI3QjtBQWFxQztBQUMvQywwQ0FBc0MsTUFkNUI7QUFjb0M7QUFDOUMsaUNBQTZCLE1BZm5CO0FBZTJCO0FBQ3JDLDBDQUFzQyxNQWhCNUI7QUFnQm9DO0FBQzlDLCtCQUEyQixNQWpCakI7QUFpQnlCO0FBQ25DLG9DQUFnQyxNQWxCdEI7QUFrQjhCO0FBQ3hDLGtDQUE4QixNQW5CcEI7QUFtQjRCO0FBQ3RDLGdDQUE0QixNQXBCbEI7QUFvQjBCO0FBQ3BDLGlDQUE2QixNQXJCbkI7QUFxQjJCO0FBQ3JDLGdDQUE0QixNQXRCbEI7QUFzQjBCO0FBQ3BDLCtCQUEyQixNQXZCakI7QUF1QnlCO0FBQ25DLHVDQUFtQyxNQXhCekI7QUF3QmlDO0FBQzNDLHVDQUFtQyxNQXpCekI7QUF5QmlDO0FBQzNDLHVDQUFtQyxNQTFCekI7QUEwQmlDO0FBQzNDLDBDQUFzQyxNQTNCNUI7QUEyQm9DO0FBQzlDLHlDQUFxQyxNQTVCM0I7QUE0Qm1DO0FBQzdDLGtDQUE4QixNQTdCcEI7QUE2QjRCO0FBQ3RDLDBDQUFzQyxNQTlCNUI7QUE4Qm9DO0FBQzlDLDBDQUFzQyxNQS9CNUI7QUErQm9DO0FBQzlDLHdDQUFvQyxNQWhDMUI7QUFnQ2tDO0FBQzVDLGtDQUE4QixNQWpDcEI7QUFpQzRCO0FBQ3RDLHFDQUFpQyxNQWxDdkI7QUFrQytCO0FBQ3pDLGlDQUE2QixNQW5DbkI7QUFtQzJCO0FBQ3JDLHNDQUFrQyxNQXBDeEI7QUFvQ2dDO0FBQzFDLHVDQUFtQyxNQXJDekI7QUFxQ2lDO0FBQzNDLHNDQUFrQyxNQXRDeEI7QUFzQ2dDO0FBQzFDLGtDQUE4QixNQXZDcEI7QUF1QzRCO0FBQ3RDLGtDQUE4QixNQXhDcEI7QUF3QzRCO0FBQ3RDLGdDQUE0QixNQXpDbEI7QUF5QzBCO0FBQ3BDLGdDQUE0QixNQTFDbEI7QUEwQzBCO0FBQ3BDLHlDQUFxQyxNQTNDM0I7QUEyQ21DO0FBQzdDLDBDQUFzQyxNQTVDNUI7QUE0Q29DO0FBQzlDLDJDQUF1QyxNQTdDN0I7QUE2Q3FDO0FBQy9DLHVDQUFtQyxNQTlDekI7QUE4Q2lDO0FBQzNDLHVDQUFtQyxNQS9DekI7QUErQ2lDO0FBQzNDLHVDQUFtQyxNQWhEekI7QUFnRGlDO0FBQzNDLHVDQUFtQyxNQWpEekI7QUFpRGlDO0FBQzNDLCtCQUEyQixNQWxEakI7QUFrRHlCO0FBQ25DLDBDQUFzQyxNQW5ENUI7QUFtRG9DO0FBQzlDLHlDQUFxQyxNQXBEM0IsQ0FvRG1DOztBQXBEbkMsR0FGQztBQXdEYkUsWUFBVSxFQUFFO0FBQ1YsOENBQTBDLE1BRGhDO0FBQ3dDO0FBQ2xELHdDQUFvQyxNQUYxQjtBQUVrQztBQUM1QyxrQ0FBOEIsTUFIcEI7QUFHNEI7QUFDdEMsa0NBQThCLE1BSnBCLENBSTRCOztBQUo1QixHQXhEQztBQThEYkssV0FBUyxFQUFFO0FBQ1QsaUNBQTZCLE1BRHBCO0FBQzRCO0FBQ3JDLHNDQUFrQyxNQUZ6QixDQUVpQzs7QUFGakMsR0E5REU7QUFrRWJKLGlCQUFlLEVBQUU7QUFDZixxQ0FBaUMsS0FEbEIsQ0FDeUI7O0FBRHpCLEdBbEVKO0FBcUVidkIsVUFBUSxFQUFFLENBQ1I7QUFDRTtBQUNBO0FBQ0F6RCxNQUFFLEVBQUUsb0JBSE47QUFJRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLEVBQWlDLE1BQWpDLEVBQXlDLE1BQXpDLEVBQWlELE1BQWpELEVBQXlELE1BQXpELENBQU47QUFBd0UsU0FBRzRGLHVDQUFrQkE7QUFBN0YsS0FBdkIsQ0FKWjtBQUtFekYsYUFBUyxFQUFFLENBQUN1RCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CQSxPQUFPLENBQUN5RyxLQUFSLENBQWNrQixLQUFkLENBQW9CLENBQUMsQ0FBckIsTUFBNEIsSUFMN0Q7QUFNRXZHLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQVJILEdBRFE7QUFyRUcsQ0FBZixFOztBQ1BBO0FBQ0E7Q0FJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4REFBZTtBQUNibEIsUUFBTSxFQUFFQyxrRUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsK0NBQTJDLE1BRGpDO0FBQ3lDO0FBQ25ELGlEQUE2QyxNQUZuQztBQUUyQztBQUVyRCwwQ0FBc0MsTUFKNUI7QUFJb0M7QUFFOUMseUNBQXFDLE1BTjNCO0FBTW1DO0FBQzdDLHdDQUFvQyxNQVAxQjtBQU9rQztBQUM1Qyw0Q0FBd0MsTUFSOUI7QUFRc0M7QUFDaEQsMkNBQXVDLE1BVDdCO0FBU3FDO0FBQy9DLDJDQUF1QyxNQVY3QjtBQVVxQztBQUMvQywyQ0FBdUMsTUFYN0I7QUFXcUM7QUFDL0MsMkNBQXVDLE1BWjdCO0FBWXFDO0FBQy9DLDJDQUF1QyxNQWI3QjtBQWFxQztBQUMvQywwQ0FBc0MsTUFkNUI7QUFjb0M7QUFDOUMsd0NBQW9DLE1BZjFCO0FBZWtDO0FBQzVDLDRDQUF3QyxNQWhCOUI7QUFnQnNDO0FBQ2hELG9DQUFnQyxNQWpCdEI7QUFpQjhCO0FBQ3hDLCtDQUEyQyxNQWxCakM7QUFrQnlDO0FBQ25ELCtDQUEyQyxNQW5CakM7QUFtQnlDO0FBQ25ELCtDQUEyQyxNQXBCakM7QUFvQnlDO0FBQ25ELGdEQUE0QyxNQXJCbEM7QUFxQjBDO0FBQ3BELGdEQUE0QyxNQXRCbEM7QUFzQjBDO0FBQ3BELGdEQUE0QyxNQXZCbEM7QUF1QjBDO0FBQ3BELHVDQUFtQyxNQXhCekI7QUF3QmlDO0FBRTNDLGdEQUE0QyxNQTFCbEM7QUEwQjBDO0FBQ3BELGdEQUE0QyxNQTNCbEM7QUEyQjBDO0FBQ3BELCtDQUEyQyxNQTVCakM7QUE0QnlDO0FBQ25ELCtDQUEyQyxNQTdCakM7QUE2QnlDO0FBQ25ELG9DQUFnQyxNQTlCdEI7QUE4QjhCO0FBQ3hDLDZDQUF5QyxNQS9CL0I7QUErQnVDO0FBQ2pELGtDQUE4QixNQWhDcEI7QUFnQzRCO0FBQ3RDLHVDQUFtQyxNQWpDekI7QUFpQ2lDO0FBQzNDLHFDQUFpQyxNQWxDdkI7QUFrQytCO0FBQ3pDLG1DQUErQixNQW5DckI7QUFtQzZCO0FBRXZDLDBDQUFzQyxNQXJDNUI7QUFxQ29DO0FBQzlDLHNDQUFrQyxNQXRDeEI7QUFzQ2dDO0FBQzFDLHlDQUFxQyxNQXZDM0I7QUF1Q21DO0FBQzdDLHlDQUFxQyxNQXhDM0I7QUF3Q21DO0FBQzdDLCtCQUEyQixNQXpDakI7QUF5Q3lCO0FBQ25DLDBDQUFzQyxNQTFDNUI7QUEwQ29DO0FBQzlDLDBDQUFzQyxNQTNDNUI7QUEyQ29DO0FBRTlDLGlEQUE2QyxNQTdDbkM7QUE2QzJDO0FBQ3JELGtEQUE4QyxNQTlDcEM7QUE4QzRDO0FBQ3RELDRDQUF3QyxNQS9DOUI7QUErQ3NDO0FBQ2hELDZDQUF5QyxNQWhEL0I7QUFnRHVDO0FBQ2pELDZDQUF5QyxNQWpEL0I7QUFpRHVDO0FBQ2pELHFDQUFpQyxNQWxEdkI7QUFrRCtCO0FBQ3pDLGdDQUE0QixNQW5EbEI7QUFtRDBCO0FBQ3BDLGdDQUE0QixNQXBEbEI7QUFvRDBCO0FBQ3BDLGtDQUE4QixNQXJEcEI7QUFxRDRCO0FBQ3RDLGlEQUE2QyxNQXREbkM7QUFzRDJDO0FBQ3JELGlEQUE2QyxNQXZEbkM7QUF1RDJDO0FBQ3JELGlEQUE2QyxNQXhEbkM7QUF3RDJDO0FBQ3JELHFDQUFpQyxNQXpEdkI7QUF5RCtCO0FBRXpDLDZDQUF5QyxNQTNEL0I7QUEyRHVDO0FBQ2pELDZDQUF5QyxNQTVEL0I7QUE0RHVDO0FBQ2pELDZDQUF5QyxNQTdEL0I7QUE2RHVDO0FBQ2pELDZDQUF5QyxNQTlEL0I7QUE4RHVDO0FBQ2pELDhDQUEwQyxNQS9EaEM7QUErRHdDO0FBQ2xELDhDQUEwQyxNQWhFaEM7QUFnRXdDO0FBQ2xELHFDQUFpQyxNQWpFdkI7QUFpRStCO0FBRXpDLHdDQUFvQyxNQW5FMUI7QUFtRWtDO0FBQzVDLG9DQUFnQyxNQXBFdEI7QUFvRThCO0FBQ3hDLHlDQUFxQyxNQXJFM0I7QUFxRW1DO0FBQzdDLDBDQUFzQyxNQXRFNUI7QUFzRW9DO0FBQzlDLHlDQUFxQyxNQXZFM0I7QUF1RW1DO0FBRTdDLDhCQUEwQixNQXpFaEI7QUF5RXdCO0FBQ2xDLDJDQUF1QyxNQTFFN0I7QUEwRXFDO0FBQy9DLDJDQUF1QyxNQTNFN0I7QUEyRXFDO0FBQy9DLHNDQUFrQyxNQTVFeEI7QUE0RWdDO0FBQzFDLG9DQUFnQyxNQTdFdEI7QUE2RThCO0FBQ3hDLHlDQUFxQyxNQTlFM0I7QUE4RW1DO0FBQzdDLG9DQUFnQyxNQS9FdEI7QUErRThCO0FBRXhDLDRDQUF3QyxNQWpGOUI7QUFpRnNDO0FBQ2hELHFDQUFpQyxNQWxGdkI7QUFrRitCO0FBQ3pDLHFDQUFpQyxNQW5GdkI7QUFtRitCO0FBQ3pDLG1DQUErQixNQXBGckI7QUFvRjZCO0FBQ3ZDLG1DQUErQixNQXJGckI7QUFxRjZCO0FBQ3ZDLGlEQUE2QyxNQXRGbkM7QUFzRjJDO0FBQ3JELGtEQUE4QyxNQXZGcEM7QUF1RjRDO0FBQ3RELCtDQUEyQyxNQXhGakM7QUF3RnlDO0FBQ25ELCtDQUEyQyxNQXpGakM7QUF5RnlDO0FBQ25ELGdEQUE0QyxNQTFGbEM7QUEwRjBDO0FBQ3BELGdEQUE0QyxNQTNGbEM7QUEyRjBDO0FBQ3BELGtDQUE4QixNQTVGcEI7QUE0RjRCO0FBQ3RDLDRDQUF3QyxNQTdGOUI7QUE2RnNDO0FBQ2hELDZDQUF5QyxNQTlGL0I7QUE4RnVDO0FBQ2pELDZDQUF5QyxNQS9GL0I7QUErRnVDO0FBQ2pELGlEQUE2QyxNQWhHbkM7QUFnRzJDO0FBQ3JELGlEQUE2QyxNQWpHbkM7QUFpRzJDO0FBQ3JELGlEQUE2QyxNQWxHbkMsQ0FrRzJDOztBQWxHM0MsR0FGQztBQXNHYkUsWUFBVSxFQUFFO0FBQ1YscUNBQWlDLE1BRHZCO0FBQytCO0FBQ3pDLHFDQUFpQyxNQUZ2QjtBQUUrQjtBQUN6QywwQ0FBc0MsTUFINUI7QUFHb0M7QUFDOUMsNkNBQXlDLE1BSi9CO0FBSXVDO0FBQ2pELHFDQUFpQyxNQUx2QixDQUsrQjs7QUFML0IsR0F0R0M7QUE2R2JELFdBQVMsRUFBRTtBQUNULG9EQUFnRCxNQUR2QztBQUMrQztBQUN4RCxxQ0FBaUMsTUFGeEIsQ0FFZ0M7O0FBRmhDLEdBN0dFO0FBaUhiRSxpQkFBZSxFQUFFO0FBQ2Ysd0NBQW9DLEtBRHJCLENBQzRCOztBQUQ1QixHQWpISjtBQW9IYnZCLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQXpELE1BQUUsRUFBRSw2QkFGTjtBQUdFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsRUFBaUMsTUFBakMsRUFBeUMsTUFBekMsRUFBaUQsTUFBakQsRUFBeUQsTUFBekQsQ0FBTjtBQUF3RSxTQUFHNEYsdUNBQWtCQTtBQUE3RixLQUF2QixDQUhaO0FBSUV6RixhQUFTLEVBQUUsQ0FBQ3VELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0JBLE9BQU8sQ0FBQ3lHLEtBQVIsQ0FBY2tCLEtBQWQsQ0FBb0IsQ0FBQyxDQUFyQixNQUE0QixJQUo3RDtBQUtFdkcsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBUEgsR0FEUSxFQVVSO0FBQ0V6RSxNQUFFLEVBQUUsOEJBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRVUsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCa0MsZ0JBQVEsRUFBRyxHQUFFOUUsT0FBTyxDQUFDNEIsTUFBTyxLQUFJNUIsT0FBTyxDQUFDbUYsT0FBUTtBQUFoRSxPQUFQO0FBQ0Q7QUFMSCxHQVZRLEVBaUJSO0FBQ0V6RSxNQUFFLEVBQUUsbUNBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRVUsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCa0MsZ0JBQVEsRUFBRyxHQUFFOUUsT0FBTyxDQUFDNEIsTUFBTyxLQUFJNUIsT0FBTyxDQUFDbUYsT0FBUTtBQUFoRSxPQUFQO0FBQ0Q7QUFMSCxHQWpCUTtBQXBIRyxDQUFmLEU7O0FDaEJBO0FBRUEsMENBQWU7QUFDYmxCLFFBQU0sRUFBRUMsa0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLCtCQUEyQixNQURqQjtBQUVWLGdDQUE0QixNQUZsQjtBQUdWLHFCQUFpQixNQUhQO0FBSVYseUJBQXFCO0FBSlgsR0FGQztBQVFiRSxZQUFVLEVBQUU7QUFDVix5QkFBcUIsTUFEWDtBQUVWLHNCQUFrQjtBQUZSLEdBUkM7QUFZYkssV0FBUyxFQUFFO0FBQ1Qsb0JBQWdCLE1BRFA7QUFFVCwwQkFBc0IsTUFGYjtBQUVxQjtBQUM5QiwwQkFBc0IsTUFIYixDQUdxQjs7QUFIckI7QUFaRSxDQUFmLEU7O0NDQUE7QUFDQTtBQUNBOztBQUNBLDBDQUFlO0FBQ2I3QixRQUFNLEVBQUVDLDhFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViwrQkFBMkIsTUFEakI7QUFFVixnQ0FBNEIsTUFGbEI7QUFHVix5Q0FBcUMsTUFIM0I7QUFJViwrQkFBMkIsTUFKakI7QUFLViwrQkFBMkIsTUFMakI7QUFNVix5QkFBcUI7QUFOWCxHQUZDO0FBVWJFLFlBQVUsRUFBRTtBQUNWLHlCQUFxQixNQURYO0FBRVYsc0JBQWtCO0FBRlIsR0FWQztBQWNiSyxXQUFTLEVBQUU7QUFDVCw0QkFBd0IsTUFEZjtBQUVULDRCQUF3QixNQUZmO0FBR1QsMEJBQXNCLE1BSGI7QUFHcUI7QUFDOUIsMEJBQXNCLE1BSmIsQ0FJcUI7O0FBSnJCO0FBZEUsQ0FBZixFOztBQ0xBO0FBQ0E7Q0FJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLDBDQUFlO0FBQ2I3QixRQUFNLEVBQUVDLHdEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViwyQkFBdUIsTUFEYjtBQUVWLCtCQUEyQjtBQUZqQixHQUZDO0FBTWJwQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLFNBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFbEYsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRSxRQURBO0FBRUpJLFlBQUUsRUFBRW5ELE9BQU8sQ0FBQ21GLE9BRlI7QUFFaUI7QUFDckIvQixZQUFFLEVBQUUsaUJBSEE7QUFJSkMsWUFBRSxFQUFFckQsT0FBTyxDQUFDbUYsT0FKUjtBQUlpQjtBQUNyQjdCLFlBQUUsRUFBRXRELE9BQU8sQ0FBQ21GLE9BTFI7QUFLaUI7QUFDckI1QixZQUFFLEVBQUU7QUFOQTtBQUhELE9BQVA7QUFZRDtBQWhCSCxHQURRO0FBTkcsQ0FBZixFOztBQ1ZBO0FBQ0E7Q0FJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLDBDQUFlO0FBQ2JVLFFBQU0sRUFBRUMsb0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDJCQUF1QixNQURiO0FBRVYsc0JBQWtCLE1BRlI7QUFHViwrQkFBMkI7QUFIakIsR0FGQztBQU9iQyxXQUFTLEVBQUU7QUFDVCw0QkFBd0I7QUFEZixHQVBFO0FBVWJyQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLGVBRE47QUFFRTtBQUNBRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUhaO0FBSUVyQyxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQO0FBQ0Q7QUFOSCxHQURRLEVBU1I7QUFDRTNFLE1BQUUsRUFBRSxTQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRWxGLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUZWO0FBR0xTLFlBQUksRUFBRTtBQUNKQyxZQUFFLEVBQUUsUUFEQTtBQUVKSSxZQUFFLEVBQUVuRCxPQUFPLENBQUNtRixPQUZSO0FBRWlCO0FBQ3JCL0IsWUFBRSxFQUFFLGlCQUhBO0FBSUpDLFlBQUUsRUFBRXJELE9BQU8sQ0FBQ21GLE9BSlI7QUFJaUI7QUFDckI3QixZQUFFLEVBQUV0RCxPQUFPLENBQUNtRixPQUxSO0FBS2lCO0FBQ3JCNUIsWUFBRSxFQUFFO0FBTkE7QUFIRCxPQUFQO0FBWUQ7QUFoQkgsR0FUUTtBQVZHLENBQWYsRTs7QUNWQTtBQUVBLDBDQUFlO0FBQ2JVLFFBQU0sRUFBRUMsOERBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDBCQUFzQixNQURaO0FBRVYsMEJBQXNCLE1BRlo7QUFHVixxQkFBaUIsTUFIUDtBQUlWLDRCQUF3QjtBQUpkLEdBRkM7QUFRYkUsWUFBVSxFQUFFO0FBQ1YsK0JBQTJCLE1BRGpCO0FBRVYsK0JBQTJCLE1BRmpCO0FBR1YseUJBQXFCO0FBSFgsR0FSQztBQWFiSyxXQUFTLEVBQUU7QUFDVCx1QkFBbUI7QUFEVjtBQWJFLENBQWYsRTs7Q0NBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsMENBQWU7QUFDYjdCLFFBQU0sRUFBRUMsMEVBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDBCQUFzQixNQURaO0FBRVYsMEJBQXNCLE1BRlo7QUFHVixxQkFBaUIsTUFIUDtBQUlWLDRCQUF3QjtBQUpkLEdBRkM7QUFRYkUsWUFBVSxFQUFFO0FBQ1YsK0JBQTJCLE1BRGpCO0FBRVYsK0JBQTJCLE1BRmpCO0FBR1YsK0JBQTJCLE1BSGpCO0FBSVYsK0JBQTJCLE1BSmpCO0FBS1YseUJBQXFCO0FBTFg7QUFSQyxDQUFmLEU7O0FDUkE7QUFFQSwwQ0FBZTtBQUNieEIsUUFBTSxFQUFFQyw0REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsOEJBQTBCLE1BRGhCO0FBRVYsc0JBQWtCLE1BRlI7QUFHVix3QkFBb0IsTUFIVjtBQUlWLHdCQUFvQixNQUpWO0FBS1YsdUJBQW1CLE1BTFQ7QUFNVix1QkFBbUIsTUFOVDtBQU9WLHFCQUFpQixNQVBQO0FBUVYsK0JBQTJCLE1BUmpCO0FBU1YsOEJBQTBCLE1BVGhCO0FBVVYsNkJBQXlCLE1BVmY7QUFXVix3QkFBb0IsTUFYVjtBQVlWLHNCQUFrQjtBQVpSO0FBRkMsQ0FBZixFOztBQ0ZBO0FBQ0E7Q0FJQTtBQUNBO0FBQ0E7O0FBQ0EsMENBQWU7QUFDYnRCLFFBQU0sRUFBRUMsd0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDhCQUEwQixNQURoQjtBQUVWLHNCQUFrQixNQUZSO0FBR1Ysd0JBQW9CLE1BSFY7QUFJVix3QkFBb0IsTUFKVjtBQUtWLHFCQUFpQixNQUxQO0FBTVYscUJBQWlCLE1BTlA7QUFPViwrQkFBMkIsTUFQakI7QUFRViw4QkFBMEIsTUFSaEI7QUFTViwrQkFBMkIsTUFUakI7QUFVViwrQkFBMkIsTUFWakI7QUFXVix3QkFBb0I7QUFYVixHQUZDO0FBZWJFLFlBQVUsRUFBRTtBQUNWLGdDQUE0QixNQURsQjtBQUVWLGdDQUE0QixNQUZsQjtBQUdWLDBCQUFzQixNQUhaO0FBSVYsMEJBQXNCLE1BSlo7QUFLViwwQkFBc0I7QUFMWixHQWZDO0FBc0JidEIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSx3QkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRTtBQUF0QixLQUF2QixDQUZaO0FBR0VpRixjQUFVLEVBQUVqRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRTtBQUF0QixLQUF2QixDQUhkO0FBSUU2QyxjQUFVLEVBQUViLGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFja0IsWUFBTSxFQUFFO0FBQXRCLEtBQXZCLENBSmQ7QUFLRThDLGNBQVUsRUFBRWQsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWNrQixZQUFNLEVBQUU7QUFBdEIsS0FBdkIsQ0FMZDtBQU1FK0MsY0FBVSxFQUFFZixpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRTtBQUF0QixLQUF2QixDQU5kO0FBT0VnRCxjQUFVLEVBQUVoQixpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBY2tCLFlBQU0sRUFBRTtBQUF0QixLQUF2QixDQVBkO0FBUUVkLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQzZILGVBQUwsR0FBdUI1SCxPQUFPLENBQUNxQyxNQUEvQjtBQUNEO0FBVkgsR0FEUSxFQWFSO0FBQ0UzQixNQUFFLEVBQUUsZ0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDNkgsZUFBTCxLQUF5QjVILE9BQU8sQ0FBQ3FDLE1BSGpFO0FBSUVqQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLFVBREE7QUFFSkksWUFBRSxFQUFFbkQsT0FBTyxDQUFDbUYsT0FGUjtBQUVpQjtBQUNyQi9CLFlBQUUsRUFBRSxpQkFIQTtBQUlKQyxZQUFFLEVBQUVyRCxPQUFPLENBQUNtRixPQUpSO0FBSWlCO0FBQ3JCN0IsWUFBRSxFQUFFdEQsT0FBTyxDQUFDbUYsT0FMUjtBQUtpQjtBQUNyQjVCLFlBQUUsRUFBRXZELE9BQU8sQ0FBQ21GLE9BTlIsQ0FNaUI7O0FBTmpCO0FBSEQsT0FBUDtBQVlEO0FBakJILEdBYlE7QUF0QkcsQ0FBZixFOztBQ1JBO0FBQ0E7QUFFQTtBQUVBLDBDQUFlO0FBQ2JsQixRQUFNLEVBQUVDLGtFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixrQkFBYyxNQURKO0FBQ1k7QUFDdEIsMEJBQXNCLE1BRlo7QUFFb0I7QUFDOUIsa0JBQWMsTUFISjtBQUdZO0FBQ3RCLHdCQUFvQixNQUpWO0FBSWtCO0FBQzVCLHVCQUFtQixNQUxULENBS2lCOztBQUxqQixHQUZDO0FBU2JFLFlBQVUsRUFBRTtBQUNWLHlCQUFxQixNQURYLENBQ21COztBQURuQixHQVRDO0FBWWJ0QixVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0F6RCxNQUFFLEVBQUUseUJBRk47QUFHRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FIWjtBQUlFckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBTkgsR0FEUSxFQVNSO0FBQ0U7QUFDQTNFLE1BQUUsRUFBRSxjQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSFo7QUFJRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQzhILE1BQUwsR0FBYzlILElBQUksQ0FBQzhILE1BQUwsSUFBZSxFQUE3QjtBQUNBOUgsVUFBSSxDQUFDOEgsTUFBTCxDQUFZN0gsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsSUFBOUI7QUFDRDtBQVBILEdBVFEsRUFrQlI7QUFDRTNCLE1BQUUsRUFBRSxjQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQzhILE1BQUwsR0FBYzlILElBQUksQ0FBQzhILE1BQUwsSUFBZSxFQUE3QjtBQUNBOUgsVUFBSSxDQUFDOEgsTUFBTCxDQUFZN0gsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsS0FBOUI7QUFDRDtBQU5ILEdBbEJRLEVBMEJSO0FBQ0UzQixNQUFFLEVBQUUsNEJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQixDQUFDRCxJQUFJLENBQUM4SCxNQUFMLENBQVk3SCxPQUFPLENBQUNxQyxNQUFwQixDQUhqQztBQUlFakIsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BRlY7QUFHTFMsWUFBSSxFQUFFO0FBQ0pDLFlBQUUsRUFBRyxHQUFFL0MsT0FBTyxDQUFDbUYsT0FBUSxXQURuQjtBQUVKaEMsWUFBRSxFQUFHLEdBQUVuRCxPQUFPLENBQUNtRixPQUFRLGFBRm5CO0FBR0ovQixZQUFFLEVBQUcsR0FBRXBELE9BQU8sQ0FBQ21GLE9BQVEsZUFIbkI7QUFJSjlCLFlBQUUsRUFBRyxHQUFFckQsT0FBTyxDQUFDbUYsT0FBUSxTQUpuQjtBQUtKN0IsWUFBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRO0FBTG5CO0FBSEQsT0FBUDtBQVdEO0FBaEJILEdBMUJRLEVBNENSO0FBQ0V6RSxNQUFFLEVBQUUsZ0NBRE47QUFFRUUsWUFBUSxFQUFFZ0QsK0NBQUEsQ0FBc0I7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQXRCLENBRlo7QUFHRUksT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDK0gsWUFBTCxHQUFvQi9ILElBQUksQ0FBQytILFlBQUwsSUFBcUIsRUFBekM7QUFDQS9ILFVBQUksQ0FBQytILFlBQUwsQ0FBa0I5RyxJQUFsQixDQUF1QmhCLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQ0Q7QUFOSCxHQTVDUSxFQW9EUjtBQUNFO0FBQ0EzQixNQUFFLEVBQUUsd0JBRk47QUFHRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FIWjtBQUlFbkYsbUJBQWUsRUFBRSxFQUpuQjtBQUtFQyxXQUFPLEVBQUUsQ0FBQ3JCLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUMxQixXQUFLLE1BQU0rSCxDQUFYLElBQWdCaEksSUFBSSxDQUFDK0gsWUFBckIsRUFBbUM7QUFDakMsZUFBTztBQUNMbEYsY0FBSSxFQUFFLE1BREQ7QUFFTEMsZUFBSyxFQUFFOUMsSUFBSSxDQUFDK0gsWUFBTCxDQUFrQkMsQ0FBbEIsQ0FGRjtBQUdMakYsY0FBSSxFQUFFO0FBQ0pDLGNBQUUsRUFBRyxHQUFFL0MsT0FBTyxDQUFDbUYsT0FBUSxxQkFEbkI7QUFFSmhDLGNBQUUsRUFBRyxHQUFFbkQsT0FBTyxDQUFDbUYsT0FBUSxtQkFGbkI7QUFHSi9CLGNBQUUsRUFBRyxHQUFFcEQsT0FBTyxDQUFDbUYsT0FBUSx3QkFIbkI7QUFJSjlCLGNBQUUsRUFBRyxHQUFFckQsT0FBTyxDQUFDbUYsT0FBUSxTQUpuQjtBQUtKN0IsY0FBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRO0FBTG5CO0FBSEQsU0FBUDtBQVdEO0FBQ0Y7QUFuQkgsR0FwRFEsRUF5RVI7QUFDRXpFLE1BQUUsRUFBRSx3QkFETjtBQUVFRSxZQUFRLEVBQUVnRCwrQ0FBQSxDQUFzQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBdEIsQ0FGWjtBQUdFTyxnQkFBWSxFQUFFLEVBSGhCO0FBR29CO0FBQ2xCSCxPQUFHLEVBQUdmLElBQUQsSUFBVTtBQUNiLGFBQU9BLElBQUksQ0FBQytILFlBQVo7QUFDRDtBQU5ILEdBekVRO0FBWkcsQ0FBZixFOztBQ0xBO0FBQ0E7Q0FJQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUUsS0FBSyxHQUFJQyxHQUFELElBQVM7QUFDckIsU0FBTztBQUNMbEYsTUFBRSxFQUFFa0YsR0FBRyxHQUFHLFdBREw7QUFFTDlFLE1BQUUsRUFBRThFLEdBQUcsR0FBRyxhQUZMO0FBR0w3RSxNQUFFLEVBQUU2RSxHQUFHLEdBQUcsZ0JBSEw7QUFJTDVFLE1BQUUsRUFBRTRFLEdBQUcsR0FBRyxTQUpMO0FBS0wzRSxNQUFFLEVBQUUyRSxHQUFHLEdBQUcsUUFMTDtBQU1MMUUsTUFBRSxFQUFFMEUsR0FBRyxHQUFHO0FBTkwsR0FBUDtBQVFELENBVEQ7O0FBV0EsMENBQWU7QUFDYmhFLFFBQU0sRUFBRUMsOEVBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGtCQUFjLE1BREo7QUFDWTtBQUN0QixrQkFBYyxNQUZKO0FBRVk7QUFDdEIsd0JBQW9CLE1BSFY7QUFHa0I7QUFDNUIsa0NBQThCLE1BSnBCO0FBSTRCO0FBQ3RDLGdDQUE0QixNQUxsQjtBQUswQjtBQUNwQyxpQkFBYSxNQU5ILENBTVc7O0FBTlgsR0FGQztBQVViRSxZQUFVLEVBQUU7QUFDVix5QkFBcUIsTUFEWCxDQUNtQjs7QUFEbkIsR0FWQztBQWFiRCxXQUFTLEVBQUU7QUFDVCw4QkFBMEIsTUFEakI7QUFDeUI7QUFDbEMsMEJBQXNCLE1BRmI7QUFHVCxrQ0FBOEI7QUFIckIsR0FiRTtBQWtCYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQXpELE1BQUUsRUFBRSxjQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSFo7QUFJRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQzhILE1BQUwsR0FBYzlILElBQUksQ0FBQzhILE1BQUwsSUFBZSxFQUE3QjtBQUNBOUgsVUFBSSxDQUFDOEgsTUFBTCxDQUFZN0gsT0FBTyxDQUFDcUMsTUFBcEIsSUFBOEIsSUFBOUI7QUFDRDtBQVBILEdBRFEsRUFVUjtBQUNFM0IsTUFBRSxFQUFFLGNBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDOEgsTUFBTCxHQUFjOUgsSUFBSSxDQUFDOEgsTUFBTCxJQUFlLEVBQTdCO0FBQ0E5SCxVQUFJLENBQUM4SCxNQUFMLENBQVk3SCxPQUFPLENBQUNxQyxNQUFwQixJQUE4QixLQUE5QjtBQUNEO0FBTkgsR0FWUSxFQWtCUjtBQUNFM0IsTUFBRSxFQUFFLDRCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUIsQ0FBQ0QsSUFBSSxDQUFDOEgsTUFBTixJQUFnQixDQUFDOUgsSUFBSSxDQUFDOEgsTUFBTCxDQUFZN0gsT0FBTyxDQUFDcUMsTUFBcEIsQ0FIakQ7QUFJRWpCLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRWtGLEtBQUssQ0FBQ2hJLE9BQU8sQ0FBQ21GLE9BQVQ7QUFBbEQsT0FBUDtBQUNEO0FBTkgsR0FsQlEsRUEwQlI7QUFDRXpFLE1BQUUsRUFBRSxxQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0V6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CLENBQUNELElBQUksQ0FBQzhILE1BQU4sSUFBZ0IsQ0FBQzlILElBQUksQ0FBQzhILE1BQUwsQ0FBWTdILE9BQU8sQ0FBQ3FDLE1BQXBCLENBSGpEO0FBSUVqQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUVrRixLQUFLLENBQUNoSSxPQUFPLENBQUNtRixPQUFUO0FBQWxELE9BQVA7QUFDRDtBQU5ILEdBMUJRLEVBa0NSO0FBQ0V6RSxNQUFFLEVBQUUsb0NBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQixDQUFDRCxJQUFJLENBQUM4SCxNQUFOLElBQWdCLENBQUM5SCxJQUFJLENBQUM4SCxNQUFMLENBQVk3SCxPQUFPLENBQUNxQyxNQUFwQixDQUhqRDtBQUlFakIsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFa0YsS0FBSyxDQUFDaEksT0FBTyxDQUFDbUYsT0FBVDtBQUFsRCxPQUFQO0FBQ0Q7QUFOSCxHQWxDUSxFQTBDUjtBQUNFekUsTUFBRSxFQUFFLG9CQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDNUI7QUFDQTtBQUNBLFVBQUksQ0FBQ0QsSUFBSSxDQUFDbUksS0FBTixJQUFlLENBQUNuSSxJQUFJLENBQUNtSSxLQUFMLENBQVdsSSxPQUFPLENBQUNxQyxNQUFuQixDQUFwQixFQUNFLE9BQU8sSUFBUDtBQUVGLGFBQU90QyxJQUFJLENBQUNtSSxLQUFMLENBQVdsSSxPQUFPLENBQUNxQyxNQUFuQixDQUFQO0FBQ0EsYUFBTyxLQUFQO0FBQ0QsS0FYSDtBQVlFakIsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBZEgsR0ExQ1EsRUEwRFI7QUFDRXpFLE1BQUUsRUFBRSxvQkFETjtBQUVFRSxZQUFRLEVBQUVnRCwrQ0FBQSxDQUFzQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBdEIsQ0FGWjtBQUdFSSxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUNtSSxLQUFMLEdBQWFuSSxJQUFJLENBQUNtSSxLQUFMLElBQWMsRUFBM0I7QUFDQW5JLFVBQUksQ0FBQ21JLEtBQUwsQ0FBV2xJLE9BQU8sQ0FBQ3FDLE1BQW5CLElBQTZCLElBQTdCO0FBQ0Q7QUFOSCxHQTFEUSxFQWtFUjtBQUNFM0IsTUFBRSxFQUFFLGdDQUROO0FBRUVFLFlBQVEsRUFBRWdELCtDQUFBLENBQXNCO0FBQUVsRCxRQUFFLEVBQUU7QUFBTixLQUF0QixDQUZaO0FBR0VJLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQytILFlBQUwsR0FBb0IvSCxJQUFJLENBQUMrSCxZQUFMLElBQXFCLEVBQXpDO0FBQ0EvSCxVQUFJLENBQUMrSCxZQUFMLENBQWtCOUcsSUFBbEIsQ0FBdUJoQixPQUFPLENBQUNxQyxNQUEvQjtBQUNEO0FBTkgsR0FsRVEsRUEwRVI7QUFDRTtBQUNBM0IsTUFBRSxFQUFFLHdCQUZOO0FBR0VFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBSFo7QUFJRW5GLG1CQUFlLEVBQUUsRUFKbkI7QUFLRUMsV0FBTyxFQUFFLENBQUNyQixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDMUIsV0FBSyxNQUFNK0gsQ0FBWCxJQUFnQmhJLElBQUksQ0FBQytILFlBQXJCLEVBQW1DO0FBQ2pDLGVBQU87QUFDTGxGLGNBQUksRUFBRSxNQUREO0FBRUxDLGVBQUssRUFBRTlDLElBQUksQ0FBQytILFlBQUwsQ0FBa0JDLENBQWxCLENBRkY7QUFHTGpGLGNBQUksRUFBRTtBQUNKQyxjQUFFLEVBQUcsR0FBRS9DLE9BQU8sQ0FBQ21GLE9BQVEscUJBRG5CO0FBRUpoQyxjQUFFLEVBQUcsR0FBRW5ELE9BQU8sQ0FBQ21GLE9BQVEsbUJBRm5CO0FBR0ovQixjQUFFLEVBQUcsR0FBRXBELE9BQU8sQ0FBQ21GLE9BQVEsd0JBSG5CO0FBSUo5QixjQUFFLEVBQUcsR0FBRXJELE9BQU8sQ0FBQ21GLE9BQVEsU0FKbkI7QUFLSjdCLGNBQUUsRUFBRyxHQUFFdEQsT0FBTyxDQUFDbUYsT0FBUTtBQUxuQjtBQUhELFNBQVA7QUFXRDtBQUNGO0FBbkJILEdBMUVRLEVBK0ZSO0FBQ0V6RSxNQUFFLEVBQUUsd0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsK0NBQUEsQ0FBc0I7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQXRCLENBRlo7QUFHRTtBQUNBTyxnQkFBWSxFQUFFLEVBSmhCO0FBS0VILE9BQUcsRUFBR2YsSUFBRCxJQUFVO0FBQ2IsYUFBT0EsSUFBSSxDQUFDK0gsWUFBWjtBQUNBLGFBQU8vSCxJQUFJLENBQUNtSSxLQUFaO0FBQ0Q7QUFSSCxHQS9GUTtBQWxCRyxDQUFmLEU7O0FDcEJBO0FBRUEsMENBQWU7QUFDYmpFLFFBQU0sRUFBRUMsc0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGtCQUFjLE1BREo7QUFDWTtBQUN0Qix1QkFBbUIsTUFGVDtBQUdWLHVCQUFtQixNQUhUO0FBSVYsMkJBQXVCLE1BSmI7QUFJcUI7QUFDL0IsMkJBQXVCLE1BTGI7QUFLcUI7QUFDL0IscUJBQWlCLE1BTlA7QUFNZTtBQUN6QixzQkFBa0IsTUFQUjtBQVFWLDBCQUFzQixNQVJaO0FBUW9CO0FBQzlCLDBCQUFzQixNQVRaO0FBU29CO0FBQzlCLHlCQUFxQixNQVZYO0FBV1Ysb0JBQWdCO0FBWE4sR0FGQztBQWViRSxZQUFVLEVBQUU7QUFDVix3QkFBb0IsTUFEVjtBQUNrQjtBQUM1QixxQkFBaUIsTUFGUCxDQUVlOztBQUZmLEdBZkM7QUFtQmJLLFdBQVMsRUFBRTtBQUNUO0FBQ0EsZ0NBQTRCO0FBRm5CO0FBbkJFLENBQWYsRTs7QUNGc0Q7QUFHdEQsc0RBQXNEO0FBQ3RELG1DQUFtQztBQUNuQyxxREFBcUQ7QUFDckQsK0VBQStFO0FBRS9FLE1BQU0sVUFBVSxHQUEwQjtJQUN4QyxNQUFNLEVBQUUsa0VBQTRCO0lBQ3BDLFVBQVUsRUFBRTtRQUNWLDhFQUE4RTtRQUM5RSxpRUFBaUU7UUFFakUsWUFBWSxFQUFFLE1BQU07UUFDcEIsaUJBQWlCLEVBQUUsTUFBTTtRQUN6QixpQkFBaUIsRUFBRSxNQUFNO1FBQ3pCLHFCQUFxQixFQUFFLE1BQU07UUFDN0IscUJBQXFCLEVBQUUsTUFBTTtRQUM3QixlQUFlLEVBQUUsTUFBTTtRQUN2QixnQkFBZ0IsRUFBRSxNQUFNO1FBQ3hCLG9CQUFvQixFQUFFLE1BQU07UUFDNUIsbUJBQW1CLEVBQUUsTUFBTTtRQUMzQixjQUFjLEVBQUUsTUFBTTtRQUN0QixpQkFBaUIsRUFBRSxNQUFNO0tBQzFCO0lBQ0QsVUFBVSxFQUFFO1FBQ1Ysa0JBQWtCLEVBQUUsTUFBTTtRQUMxQixpQkFBaUIsRUFBRSxNQUFNO1FBQ3pCLGlCQUFpQixFQUFFLE1BQU07UUFDekIsbUJBQW1CLEVBQUUsTUFBTTtLQUM1QjtJQUNELFNBQVMsRUFBRTtRQUNULG1CQUFtQixFQUFFLFNBQVM7UUFDOUIsb0JBQW9CLEVBQUUsTUFBTTtRQUM1QiwwQkFBMEIsRUFBRSxNQUFNO1FBQ2xDLFdBQVcsRUFBRSxNQUFNO0tBQ3BCO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsY0FBYyxFQUFFLE1BQU07S0FDdkI7Q0FDRixDQUFDO0FBRUYsMENBQWUsVUFBVSxFQUFDOzs7QUMzQzFCO0FBQ0E7QUFFQTs7QUFFQSxNQUFNcUMsU0FBUyxHQUFJRixHQUFELElBQVM7QUFDekIsU0FBTztBQUNMbEYsTUFBRSxFQUFFa0YsR0FBRyxHQUFHLGVBREw7QUFFTDlFLE1BQUUsRUFBRThFLEdBQUcsR0FBRyxrQkFGTDtBQUdMN0UsTUFBRSxFQUFFNkUsR0FBRyxHQUFHLGlCQUhMO0FBSUw1RSxNQUFFLEVBQUU0RSxHQUFHLEdBQUcsV0FKTDtBQUtMM0UsTUFBRSxFQUFFMkUsR0FBRyxHQUFHLFdBTEw7QUFNTDFFLE1BQUUsRUFBRTBFLEdBQUcsR0FBRztBQU5MLEdBQVA7QUFRRCxDQVREOztBQVdBLE1BQU1HLE1BQU0sR0FBSUgsR0FBRCxJQUFTO0FBQ3RCLFNBQU87QUFDTGxGLE1BQUUsRUFBRWtGLEdBQUcsR0FBRyxZQURMO0FBRUw5RSxNQUFFLEVBQUU4RSxHQUFHLEdBQUcsY0FGTDtBQUdMN0UsTUFBRSxFQUFFNkUsR0FBRyxHQUFHLGdCQUhMO0FBSUw1RSxNQUFFLEVBQUU0RSxHQUFHLEdBQUcsU0FKTDtBQUtMM0UsTUFBRSxFQUFFMkUsR0FBRyxHQUFHLFdBTEw7QUFNTDFFLE1BQUUsRUFBRTBFLEdBQUcsR0FBRztBQU5MLEdBQVA7QUFRRCxDQVREOztBQVdBLDBDQUFlO0FBQ2JoRSxRQUFNLEVBQUVDLGdFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVix5QkFBcUIsTUFEWDtBQUNtQjtBQUM3QixxQ0FBaUMsTUFGdkI7QUFFK0I7QUFDekMsaUNBQTZCLE1BSG5CLENBRzJCOztBQUgzQixHQUZDO0FBT2JDLFdBQVMsRUFBRTtBQUNULHlCQUFxQixNQURaO0FBQ29CO0FBQzdCLHVCQUFtQixNQUZWLENBRWtCOztBQUZsQixHQVBFO0FBV2JyQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLHdCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3NJLFNBQUwsR0FBaUJ0SSxJQUFJLENBQUNzSSxTQUFMLElBQWtCLEVBQW5DO0FBQ0F0SSxVQUFJLENBQUNzSSxTQUFMLENBQWVySSxPQUFPLENBQUNxQyxNQUF2QixJQUFpQyxJQUFqQztBQUNEO0FBTkgsR0FEUSxFQVNSO0FBQ0UzQixNQUFFLEVBQUUsd0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDc0ksU0FBTCxHQUFpQnRJLElBQUksQ0FBQ3NJLFNBQUwsSUFBa0IsRUFBbkM7QUFDQXRJLFVBQUksQ0FBQ3NJLFNBQUwsQ0FBZXJJLE9BQU8sQ0FBQ3FDLE1BQXZCLElBQWlDLEtBQWpDO0FBQ0Q7QUFOSCxHQVRRLEVBaUJSO0FBQ0UzQixNQUFFLEVBQUUsd0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDdUksU0FBTCxHQUFpQnZJLElBQUksQ0FBQ3VJLFNBQUwsSUFBa0IsRUFBbkM7QUFDQXZJLFVBQUksQ0FBQ3VJLFNBQUwsQ0FBZXRJLE9BQU8sQ0FBQ3FDLE1BQXZCLElBQWlDLElBQWpDO0FBQ0Q7QUFOSCxHQWpCUSxFQXlCUjtBQUNFM0IsTUFBRSxFQUFFLHdCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3VJLFNBQUwsR0FBaUJ2SSxJQUFJLENBQUN1SSxTQUFMLElBQWtCLEVBQW5DO0FBQ0F2SSxVQUFJLENBQUN1SSxTQUFMLENBQWV0SSxPQUFPLENBQUNxQyxNQUF2QixJQUFpQyxLQUFqQztBQUNEO0FBTkgsR0F6QlEsRUFpQ1I7QUFDRTNCLE1BQUUsRUFBRSxxQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsRUFBaUMsTUFBakMsQ0FBTjtBQUFnRCxTQUFHNEYsdUNBQWtCQTtBQUFyRSxLQUF2QixDQUZaO0FBR0V6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQzVCLGFBQU8sQ0FBQ0QsSUFBSSxDQUFDdUksU0FBTixJQUFtQixDQUFDdkksSUFBSSxDQUFDdUksU0FBTCxDQUFldEksT0FBTyxDQUFDcUMsTUFBdkIsQ0FBM0I7QUFDRCxLQUxIO0FBTUVqQixXQUFPLEVBQUUsQ0FBQ3JCLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUMxQixVQUFJRCxJQUFJLENBQUNzSSxTQUFMLElBQWtCdEksSUFBSSxDQUFDc0ksU0FBTCxDQUFlckksT0FBTyxDQUFDcUMsTUFBdkIsQ0FBdEIsRUFDRSxPQUFPO0FBQUVPLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFcUYsU0FBUyxDQUFDbkksT0FBTyxDQUFDbUYsT0FBVDtBQUF0RCxPQUFQO0FBQ0YsYUFBTztBQUFFdkMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUVzRixNQUFNLENBQUNwSSxPQUFPLENBQUNtRixPQUFUO0FBQW5ELE9BQVA7QUFDRDtBQVZILEdBakNRLEVBNkNSO0FBQ0V6RSxNQUFFLEVBQUUscUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLENBQU47QUFBd0MsU0FBRzRGLHVDQUFrQkE7QUFBN0QsS0FBdkIsQ0FGWjtBQUdFekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUM1QixhQUFPLENBQUNELElBQUksQ0FBQ3NJLFNBQU4sSUFBbUIsQ0FBQ3RJLElBQUksQ0FBQ3NJLFNBQUwsQ0FBZXJJLE9BQU8sQ0FBQ3FDLE1BQXZCLENBQTNCO0FBQ0QsS0FMSDtBQU1FakIsV0FBTyxFQUFFLENBQUNyQixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDMUIsVUFBSUQsSUFBSSxDQUFDdUksU0FBTCxJQUFrQnZJLElBQUksQ0FBQ3VJLFNBQUwsQ0FBZXRJLE9BQU8sQ0FBQ3FDLE1BQXZCLENBQXRCLEVBQ0UsT0FBTztBQUFFTyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRXFGLFNBQVMsQ0FBQ25JLE9BQU8sQ0FBQ21GLE9BQVQ7QUFBdEQsT0FBUCxDQUZ3QixDQUcxQjtBQUNBO0FBQ0E7O0FBQ0EsYUFBTztBQUFFdkMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUVzRixNQUFNLENBQUNwSSxPQUFPLENBQUNtRixPQUFUO0FBQW5ELE9BQVA7QUFDRDtBQWJILEdBN0NRO0FBWEcsQ0FBZixFOztBQzNCNkQ7QUFDUDtBQUdLO0FBRTNELDRDQUE0QztBQUM1Qyx3Q0FBd0M7QUFDeEMsbUVBQW1FO0FBQ25FLHlEQUF5RDtBQUN6RCx5REFBeUQ7QUFDekQsZ0ZBQWdGO0FBRWhGLE1BQU0sYUFBUyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7SUFDaEMsT0FBTztRQUNMLEVBQUUsRUFBRSxHQUFHLEdBQUcsZUFBZTtRQUN6QixFQUFFLEVBQUUsR0FBRyxHQUFHLGtCQUFrQjtRQUM1QixFQUFFLEVBQUUsR0FBRyxHQUFHLGlCQUFpQjtRQUMzQixFQUFFLEVBQUUsR0FBRyxHQUFHLFdBQVc7UUFDckIsRUFBRSxFQUFFLEdBQUcsR0FBRyxXQUFXO1FBQ3JCLEVBQUUsRUFBRSxHQUFHLEdBQUcsVUFBVTtLQUNyQixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFNLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRTtJQUM3QixPQUFPO1FBQ0wsRUFBRSxFQUFFLEdBQUcsR0FBRyxZQUFZO1FBQ3RCLEVBQUUsRUFBRSxHQUFHLEdBQUcsY0FBYztRQUN4QixFQUFFLEVBQUUsR0FBRyxHQUFHLGdCQUFnQjtRQUMxQixFQUFFLEVBQUUsR0FBRyxHQUFHLFNBQVM7UUFDbkIsRUFBRSxFQUFFLEdBQUcsR0FBRyxXQUFXO1FBQ3JCLEVBQUUsRUFBRSxHQUFHLEdBQUcsVUFBVTtLQUNyQixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBT0YsTUFBTSxjQUFVLEdBQTBCO0lBQ3hDLE1BQU0sRUFBRSw0RUFBaUM7SUFDekMsVUFBVSxFQUFFO1FBQ1Ysa0JBQWtCLEVBQUUsTUFBTTtRQUMxQix3QkFBd0IsRUFBRSxNQUFNO1FBQ2hDLDJCQUEyQixFQUFFLE1BQU07UUFDbkMsMkJBQTJCLEVBQUUsTUFBTTtRQUNuQyxlQUFlLEVBQUUsTUFBTTtRQUN2QixZQUFZLEVBQUUsTUFBTTtLQUNyQjtJQUNELFVBQVUsRUFBRTtRQUNWLG9CQUFvQixFQUFFLE1BQU07UUFDNUIsYUFBYSxFQUFFLE1BQU07UUFDckIsZUFBZSxFQUFFLE1BQU07S0FDeEI7SUFDRCxTQUFTLEVBQUU7UUFDVCxtQkFBbUIsRUFBRSxNQUFNO1FBQzNCLGlCQUFpQixFQUFFLE1BQU07UUFDekIsb0JBQW9CLEVBQUUsTUFBTTtRQUM1Qiw4QkFBOEIsRUFBRSxNQUFNO1FBQ3RDLDhCQUE4QixFQUFFLE1BQU07S0FDdkM7SUFDRCxRQUFRLEVBQUU7UUFDUjtZQUNFLFlBQVk7WUFDWixFQUFFLEVBQUUscUJBQXFCO1lBQ3pCLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFLHlDQUFrQixDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzVDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDMUIsd0RBQXdEO2dCQUN4RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hFLENBQUM7U0FDRjtRQUNEO1lBQ0UsRUFBRSxFQUFFLHdCQUF3QjtZQUM1QixJQUFJLEVBQUUsYUFBYTtZQUNuQixRQUFRLEVBQUUsaURBQXNCLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDckQsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDeEMsQ0FBQztTQUNGO1FBQ0Q7WUFDRSxFQUFFLEVBQUUsd0JBQXdCO1lBQzVCLElBQUksRUFBRSxhQUFhO1lBQ25CLFFBQVEsRUFBRSxpREFBc0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNyRCxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN6QyxDQUFDO1NBQ0Y7UUFDRDtZQUNFLEVBQUUsRUFBRSx3QkFBd0I7WUFDNUIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsUUFBUSxFQUFFLGlEQUFzQixDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3JELEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3hDLENBQUM7U0FDRjtRQUNEO1lBQ0UsRUFBRSxFQUFFLHdCQUF3QjtZQUM1QixJQUFJLEVBQUUsYUFBYTtZQUNuQixRQUFRLEVBQUUsaURBQXNCLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDckQsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDekMsQ0FBQztTQUNGO1FBQ0Q7WUFDRSxFQUFFLEVBQUUscUJBQXFCO1lBQ3pCLElBQUksRUFBRSxTQUFTO1lBQ2YsUUFBUSxFQUFFLGlEQUFzQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUcsdUNBQWtCLEVBQUUsQ0FBQztZQUN6RyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUNELE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztvQkFDbEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbkYsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNoRixDQUFDO1NBQ0Y7UUFDRDtZQUNFLEVBQUUsRUFBRSxxQkFBcUI7WUFDekIsSUFBSSxFQUFFLFNBQVM7WUFDZixRQUFRLEVBQUUsaURBQXNCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsR0FBRyx1Q0FBa0IsRUFBRSxDQUFDO1lBQ3pHLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQ0QsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUN6QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO29CQUNsRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNuRixxRUFBcUU7Z0JBQ3JFLG9FQUFvRTtnQkFDcEUsMkJBQTJCO2dCQUMzQixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2hGLENBQUM7U0FDRjtRQUNEO1lBQ0UsRUFBRSxFQUFFLHVCQUF1QjtZQUMzQixJQUFJLEVBQUUsU0FBUztZQUNmLDZFQUE2RTtZQUM3RSxRQUFRLEVBQUUsaURBQXNCLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsdUNBQWtCLEVBQUUsQ0FBQztZQUN2RSxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzlCLE9BQU87b0JBQ0wsSUFBSSxFQUFFLE1BQU07b0JBQ1osSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNO29CQUNwQixNQUFNLEVBQUU7d0JBQ04sRUFBRSxFQUFFLGFBQWE7d0JBQ2pCLEVBQUUsRUFBRSxnQkFBZ0I7d0JBQ3BCLEVBQUUsRUFBRSxrQkFBa0I7d0JBQ3RCLEVBQUUsRUFBRSxRQUFRO3dCQUNaLEVBQUUsRUFBRSxNQUFNO3FCQUNYO2lCQUNGLENBQUM7WUFDSixDQUFDO1NBQ0Y7S0FDRjtDQUNGLENBQUM7QUFFRiwwQ0FBZSxjQUFVLEVBQUM7OztBQ2hLMUI7QUFDQTtBQUVBO0FBRUEsMENBQWU7QUFDYmxCLFFBQU0sRUFBRUMsZ0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHdCQUFvQixNQURWO0FBQ2tCO0FBQzVCLHlCQUFxQixNQUZYO0FBRW1CO0FBQzdCLHdCQUFvQixNQUhWO0FBR2tCO0FBQzVCLDhCQUEwQixNQUpoQjtBQUl3QjtBQUNsQyxpQ0FBNkIsTUFMbkI7QUFLMkI7QUFDckMsMkJBQXVCLE1BTmI7QUFNcUI7QUFDL0IseUJBQXFCLE1BUFg7QUFPbUI7QUFDN0Isb0JBQWdCLE1BUk47QUFRYztBQUN4Qix1QkFBbUIsTUFUVDtBQVNpQjtBQUMzQixrQ0FBOEIsTUFWcEI7QUFVNEI7QUFDdEMsbUNBQStCLE1BWHJCLENBVzZCOztBQVg3QixHQUZDO0FBZWJFLFlBQVUsRUFBRSxFQWZDO0FBaUJidEIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSxtQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0VyQyxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNxRjtBQUFyRCxPQUFQO0FBQ0Q7QUFMSCxHQURRLEVBUVI7QUFDRTNFLE1BQUUsRUFBRSxxQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUZaO0FBR0VWLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsYUFERTtBQUVOSSxZQUFFLEVBQUUsa0JBRkU7QUFHTkMsWUFBRSxFQUFFLG1CQUhFO0FBSU5DLFlBQUUsRUFBRSxRQUpFO0FBS05DLFlBQUUsRUFBRSxNQUxFO0FBTU5DLFlBQUUsRUFBRTtBQU5FO0FBSEgsT0FBUDtBQVlEO0FBaEJILEdBUlEsRUEwQlI7QUFDRTdDLE1BQUUsRUFBRSxpQkFETjtBQUVFO0FBQ0FFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSFo7QUFJRW1DLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsV0FERTtBQUVOSSxZQUFFLEVBQUUsa0JBRkU7QUFHTkMsWUFBRSxFQUFFLGVBSEU7QUFJTkMsWUFBRSxFQUFFLEtBSkU7QUFLTkMsWUFBRSxFQUFFLElBTEU7QUFNTkMsWUFBRSxFQUFFO0FBTkU7QUFISCxPQUFQO0FBWUQ7QUFqQkgsR0ExQlE7QUFqQkcsQ0FBZixFOztBQ0xBO0NBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwQ0FBZTtBQUNiVSxRQUFNLEVBQUVDLDRFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVix3QkFBb0IsTUFEVjtBQUNrQjtBQUM1Qix5QkFBcUIsTUFGWDtBQUVtQjtBQUM3QixvQkFBZ0IsTUFITjtBQUdjO0FBQ3hCLHVCQUFtQixNQUpUO0FBSWlCO0FBQzNCLDhCQUEwQixNQUxoQjtBQUt3QjtBQUNsQyxpQ0FBNkIsTUFObkI7QUFNMkI7QUFDckMsMkJBQXVCLE1BUGI7QUFPcUI7QUFDL0IseUJBQXFCLE1BUlg7QUFRbUI7QUFDN0IseUJBQXFCLE1BVFg7QUFTbUI7QUFDN0Isb0NBQWdDLE1BVnRCO0FBVThCO0FBQ3hDLG9DQUFnQyxNQVh0QjtBQVc4QjtBQUN4QyxxQ0FBaUMsTUFadkI7QUFZK0I7QUFDekMscUNBQWlDLE1BYnZCO0FBYStCO0FBRXpDLDRCQUF3QixNQWZkO0FBZXNCO0FBQ2hDLDRCQUF3QixNQWhCZDtBQWdCc0I7QUFDaEMsNEJBQXdCLE1BakJkO0FBaUJzQjtBQUNoQyxzQ0FBa0MsTUFsQnhCO0FBa0JnQztBQUMxQyxzQ0FBa0MsTUFuQnhCO0FBbUJnQztBQUMxQyxzQ0FBa0MsTUFwQnhCO0FBb0JnQztBQUMxQyxzQ0FBa0MsTUFyQnhCO0FBcUJnQztBQUMxQyw0QkFBd0IsTUF0QmQ7QUF1QlYsNEJBQXdCLE1BdkJkO0FBd0JWLDBCQUFzQixNQXhCWjtBQXlCViwwQkFBc0IsTUF6Qlo7QUEwQlYsb0JBQWdCLE1BMUJOO0FBMkJWLDhCQUEwQixNQTNCaEI7QUE0QlYsOEJBQTBCLE1BNUJoQjtBQTZCViw0QkFBd0IsTUE3QmQ7QUE4QlYsNEJBQXdCO0FBOUJkLEdBRkM7QUFrQ2JFLFlBQVUsRUFBRTtBQUNWO0FBQ0EsMEJBQXNCLE1BRlo7QUFHVjtBQUNBLDBCQUFzQjtBQUpaLEdBbENDO0FBd0NiSyxXQUFTLEVBQUU7QUFDVCx5QkFBcUIsTUFEWixDQUNvQjs7QUFEcEIsR0F4Q0U7QUEyQ2IzQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLG1CQUROO0FBRUU7QUFDQUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FIWjtBQUlFckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBTkgsR0FEUSxFQVNSO0FBQ0U7QUFDQTNFLE1BQUUsRUFBRSxlQUZOO0FBR0VFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUU7QUFBTixLQUFuQixDQUhaO0FBSUVVLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQU5ILEdBVFE7QUEzQ0csQ0FBZixFOztBQ2hCQTtBQUVBLDBDQUFlO0FBQ2JsQixRQUFNLEVBQUVDLDBEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixpQ0FBNkIsTUFEbkI7QUFDMkI7QUFDckMsaUNBQTZCLE1BRm5CO0FBRTJCO0FBQ3JDLG9DQUFnQyxNQUh0QjtBQUc4QjtBQUN4Qyw2QkFBeUIsTUFKZjtBQUl1QjtBQUNqQywwQkFBc0IsTUFMWjtBQUtvQjtBQUM5QiwwQ0FBc0MsTUFONUI7QUFNb0M7QUFDOUMsa0NBQThCLE1BUHBCO0FBTzRCO0FBQ3RDLHFDQUFpQyxNQVJ2QixDQVErQjs7QUFSL0IsR0FGQztBQVliRSxZQUFVLEVBQUU7QUFDVixvQkFBZ0IsTUFETjtBQUNjO0FBQ3hCLDRCQUF3QixNQUZkLENBRXNCOztBQUZ0QixHQVpDO0FBZ0JiRCxXQUFTLEVBQUU7QUFDVCxxQ0FBaUMsTUFEeEIsQ0FDZ0M7O0FBRGhDO0FBaEJFLENBQWYsRTs7QUNGQTtBQUNBO0NBSUE7QUFDQTtBQUNBOztBQUVBLDBDQUFlO0FBQ2J2QixRQUFNLEVBQUVDLHNFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViwwQkFBc0IsTUFEWjtBQUNvQjtBQUM5QixvQ0FBZ0MsTUFGdEI7QUFFOEI7QUFDeEMsdUNBQW1DLE1BSHpCO0FBR2lDO0FBQzNDLGtDQUE4QixNQUpwQjtBQUk0QjtBQUN0Qyx3Q0FBb0MsTUFMMUI7QUFLa0M7QUFDNUMsd0NBQW9DLE1BTjFCO0FBTWtDO0FBQzVDLGlDQUE2QixNQVBuQjtBQU8yQjtBQUNyQyxpQ0FBNkIsTUFSbkI7QUFRMkI7QUFDckMsdUNBQW1DLE1BVHpCO0FBU2lDO0FBQzNDLHVDQUFtQyxNQVZ6QjtBQVVpQztBQUMzQyx1Q0FBbUMsTUFYekI7QUFXaUM7QUFDM0MsdUNBQW1DLE1BWnpCO0FBWWlDO0FBQzNDLDJCQUF1QixNQWJiO0FBYXFCO0FBQy9CLHdDQUFvQyxNQWQxQjtBQWNrQztBQUM1Qyx1QkFBbUIsTUFmVCxDQWVpQjs7QUFmakIsR0FGQztBQW1CYkUsWUFBVSxFQUFFO0FBQ1Ysb0JBQWdCLE1BRE47QUFDYztBQUN4Qiw0QkFBd0IsTUFGZCxDQUVzQjs7QUFGdEIsR0FuQkM7QUF1QmJELFdBQVMsRUFBRTtBQUNULHVDQUFtQyxNQUQxQixDQUNrQzs7QUFEbEMsR0F2QkU7QUEwQmJNLFdBQVMsRUFBRTtBQUNULDhDQUEwQyxNQURqQyxDQUN5Qzs7QUFEekMsR0ExQkU7QUE2QmJKLGlCQUFlLEVBQUU7QUFDZiw0QkFBd0IsS0FEVCxDQUNnQjs7QUFEaEIsR0E3Qko7QUFnQ2JNLFVBQVEsRUFBRTtBQUNSLHVDQUFtQyxNQUQzQixDQUNtQzs7QUFEbkMsR0FoQ0c7QUFtQ2I3QixVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0F6RCxNQUFFLEVBQUUsc0NBTE47QUFNRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWhCLFVBQUksRUFBRSxJQUFSO0FBQWNsQyxRQUFFLEVBQUUsTUFBbEI7QUFBMEIsU0FBRzRGLHVDQUFrQkE7QUFBL0MsS0FBdkIsQ0FOWjtBQU9FekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDcUYsaUJBQUwsQ0FBdUJwRixPQUF2QixJQUFrQyxDQVBsRTtBQVFFb0IsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBVkgsR0FEUSxFQWFSO0FBQ0U7QUFDQXpFLE1BQUUsRUFBRSwrQkFGTjtBQUdFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUhaO0FBSUV6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUNxRixpQkFBTCxDQUF1QnBGLE9BQXZCLElBQWtDLENBSmxFO0FBS0VvQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0Q7QUFQSCxHQWJRO0FBbkNHLENBQWYsRTs7QUNUQTtBQUVBLDJDQUFlO0FBQ2JsQixRQUFNLEVBQUVDLDREQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw4QkFBMEIsTUFEaEI7QUFDd0I7QUFDbEMscUNBQWlDLE1BRnZCO0FBRStCO0FBQ3pDLCtCQUEyQixNQUhqQjtBQUd5QjtBQUNuQyxzQ0FBa0MsTUFKeEI7QUFJZ0M7QUFDMUMsNkJBQXlCLE1BTGY7QUFLdUI7QUFDakMsNkJBQXlCLE1BTmY7QUFNdUI7QUFDakMsNkJBQXlCLE1BUGY7QUFPdUI7QUFDakMsNkJBQXlCLE1BUmY7QUFRdUI7QUFDakMsNkJBQXlCLE1BVGY7QUFTdUI7QUFDakMsK0JBQTJCLE1BVmpCO0FBVXlCO0FBQ25DLDRCQUF3QixNQVhkO0FBV3NCO0FBQ2hDLDhCQUEwQixNQVpoQjtBQVl3QjtBQUNsQyw2QkFBeUIsTUFiZixDQWF1Qjs7QUFidkIsR0FGQztBQWlCYkMsV0FBUyxFQUFFO0FBQ1QsMkJBQXVCLE1BRGQsQ0FDc0I7O0FBRHRCO0FBakJFLENBQWYsRTs7QUNGQTtBQUNBO0NBSUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkNBQWU7QUFDYnZCLFFBQU0sRUFBRUMsd0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLCtCQUEyQixNQURqQjtBQUN5QjtBQUNuQywrQkFBMkIsTUFGakI7QUFFeUI7QUFDbkMsa0NBQThCLE1BSHBCO0FBRzRCO0FBQ3RDLGtDQUE4QixNQUpwQjtBQUk0QjtBQUN0QyxnQ0FBNEIsTUFMbEI7QUFLMEI7QUFDcEMsZ0NBQTRCLE1BTmxCO0FBTTBCO0FBQ3BDLDZCQUF5QixNQVBmO0FBT3VCO0FBQ2pDLDZCQUF5QixNQVJmO0FBUXVCO0FBQ2pDLG1DQUErQixNQVRyQjtBQVM2QjtBQUN2QyxtQ0FBK0IsTUFWckI7QUFVNkI7QUFDdkMsK0JBQTJCLE1BWGpCO0FBV3lCO0FBQ25DLCtCQUEyQixNQVpqQjtBQVl5QjtBQUNuQyw2QkFBeUIsTUFiZjtBQWF1QjtBQUNqQyw2QkFBeUIsTUFkZixDQWN1Qjs7QUFkdkIsR0FGQztBQWtCYkUsWUFBVSxFQUFFO0FBQ1YsK0JBQTJCLE1BRGpCO0FBQ3lCO0FBQ25DLCtCQUEyQixNQUZqQixDQUV5Qjs7QUFGekIsR0FsQkM7QUFzQmJELFdBQVMsRUFBRTtBQUNULHNCQUFrQixNQURUO0FBQ2lCO0FBQzFCLHNCQUFrQixNQUZULENBRWlCOztBQUZqQixHQXRCRTtBQTBCYk0sV0FBUyxFQUFFO0FBQ1QsMkJBQXVCLE1BRGQsQ0FDc0I7O0FBRHRCLEdBMUJFO0FBNkJiM0IsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSx1QkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFaEMsWUFBTSxFQUFFLGFBQVY7QUFBeUI2QixjQUFRLEVBQUU7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFb0QsY0FBVSxFQUFFakQsaURBQUEsQ0FBdUI7QUFBRWhDLFlBQU0sRUFBRSxnQkFBVjtBQUE0QjZCLGNBQVEsRUFBRTtBQUF0QyxLQUF2QixDQUhkO0FBSUVnQixjQUFVLEVBQUViLGlEQUFBLENBQXVCO0FBQUVoQyxZQUFNLEVBQUUsZ0JBQVY7QUFBNEI2QixjQUFRLEVBQUU7QUFBdEMsS0FBdkIsQ0FKZDtBQUtFaUIsY0FBVSxFQUFFZCxpREFBQSxDQUF1QjtBQUFFaEMsWUFBTSxFQUFFLFVBQVY7QUFBc0I2QixjQUFRLEVBQUU7QUFBaEMsS0FBdkIsQ0FMZDtBQU1FckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxRQUFSO0FBQWtCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUFqQztBQUF5Q1MsWUFBSSxFQUFHLEdBQUU5QyxPQUFPLENBQUNxRixNQUFPO0FBQWpFLE9BQVA7QUFDRDtBQVJILEdBRFEsRUFXUjtBQUNFM0UsTUFBRSxFQUFFLHVCQUROO0FBRUU7QUFDQTtBQUNBO0FBQ0E7QUFDQUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWhDLFlBQU0sRUFBRSxjQUFWO0FBQTBCNkIsY0FBUSxFQUFFO0FBQXBDLEtBQXZCLENBTlo7QUFPRW9ELGNBQVUsRUFBRWpELGlEQUFBLENBQXVCO0FBQUVoQyxZQUFNLEVBQUUsZUFBVjtBQUEyQjZCLGNBQVEsRUFBRTtBQUFyQyxLQUF2QixDQVBkO0FBUUVnQixjQUFVLEVBQUViLGlEQUFBLENBQXVCO0FBQUVoQyxZQUFNLEVBQUUsaUJBQVY7QUFBNkI2QixjQUFRLEVBQUU7QUFBdkMsS0FBdkIsQ0FSZDtBQVNFaUIsY0FBVSxFQUFFZCxpREFBQSxDQUF1QjtBQUFFaEMsWUFBTSxFQUFFLEtBQVY7QUFBaUI2QixjQUFRLEVBQUU7QUFBM0IsS0FBdkIsQ0FUZDtBQVVFckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxRQUFSO0FBQWtCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUFqQztBQUF5Q1MsWUFBSSxFQUFHLEdBQUU5QyxPQUFPLENBQUNxRixNQUFPO0FBQWpFLE9BQVA7QUFDRDtBQVpILEdBWFEsRUF5QlI7QUFDRTtBQUNBO0FBQ0EzRSxNQUFFLEVBQUUscUJBSE47QUFJRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxDQUFDLE1BQUQsRUFBUyxNQUFULENBQU47QUFBd0IsU0FBRzRGLHVDQUFrQkE7QUFBN0MsS0FBdkIsQ0FKWjtBQUtFekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDcUYsaUJBQUwsQ0FBdUJwRixPQUF2QixJQUFrQyxDQUxsRTtBQU1Fb0IsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBUkgsR0F6QlE7QUE3QkcsQ0FBZixFOztBQ1ZBO0FBQ0E7QUFFQSwyQ0FBZTtBQUNibEIsUUFBTSxFQUFFQyx3RUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsbUNBQStCLE1BRHJCO0FBQzZCO0FBQ3ZDLDhCQUEwQixNQUZoQjtBQUV3QjtBQUNsQyw4QkFBMEIsTUFIaEI7QUFHd0I7QUFDbEMsb0JBQWdCLE1BSk47QUFJYztBQUN4QiwwQkFBc0IsTUFMWjtBQUtvQjtBQUM5QixxQ0FBaUMsTUFOdkI7QUFNK0I7QUFDekMscUNBQWlDLE1BUHZCO0FBTytCO0FBQ3pDLDZCQUF5QixNQVJmO0FBUXVCO0FBQ2pDLHlDQUFxQyxNQVQzQjtBQVNtQztBQUM3QyxvQ0FBZ0MsTUFWdEI7QUFVOEI7QUFDeEMsMEJBQXNCLE1BWFosQ0FXb0I7O0FBWHBCLEdBRkM7QUFlYkUsWUFBVSxFQUFFO0FBQ1YsMEJBQXNCLE1BRFosQ0FDb0I7O0FBRHBCLEdBZkM7QUFrQmJELFdBQVMsRUFBRTtBQUNULHNCQUFrQixNQURULENBQ2lCOztBQURqQixHQWxCRTtBQXFCYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsNEJBRE47QUFFRTtBQUNBO0FBQ0FFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUUsQ0FBQyxNQUFELEVBQVMsTUFBVDtBQUFOLEtBQW5CLENBSlo7QUFLRWtGLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsYUFERTtBQUVOSSxZQUFFLEVBQUUsZ0JBRkU7QUFHTkMsWUFBRSxFQUFFLGtCQUhFO0FBSU5DLFlBQUUsRUFBRSxRQUpFO0FBS05DLFlBQUUsRUFBRSxNQUxFO0FBTU5DLFlBQUUsRUFBRTtBQU5FO0FBSEgsT0FBUDtBQVlEO0FBbEJILEdBRFE7QUFyQkcsQ0FBZixFOztBQ0hBO0NBR0E7QUFDQTs7QUFFQSwyQ0FBZTtBQUNiVSxRQUFNLEVBQUVDLG9GQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw4QkFBMEIsTUFEaEI7QUFDd0I7QUFDbEMsbUNBQStCLE1BRnJCO0FBRTZCO0FBQ3ZDLDhCQUEwQixNQUhoQjtBQUd3QjtBQUNsQywwQkFBc0IsTUFKWjtBQUlvQjtBQUM5QixvQ0FBZ0MsTUFMdEI7QUFLOEI7QUFDeEMseUNBQXFDLE1BTjNCO0FBTW1DO0FBQzdDLG9DQUFnQyxNQVB0QjtBQU84QjtBQUN4QyxnQ0FBNEIsTUFSbEI7QUFRMEI7QUFDcEMscUNBQWlDLE1BVHZCO0FBUytCO0FBQ3pDLHFDQUFpQyxNQVZ2QjtBQVUrQjtBQUN6Qyx5Q0FBcUMsTUFYM0I7QUFXbUM7QUFDN0MseUNBQXFDLE1BWjNCO0FBWW1DO0FBQzdDLDJCQUF1QixNQWJiO0FBYXFCO0FBQy9CLDZCQUF5QixNQWRmO0FBY3VCO0FBQ2pDLHlDQUFxQyxNQWYzQjtBQWVtQztBQUM3QywwQkFBc0IsTUFoQlo7QUFnQm9CO0FBQzlCLG9DQUFnQyxNQWpCdEI7QUFpQjhCO0FBQ3hDLG9DQUFnQyxNQWxCdEI7QUFrQjhCO0FBQ3hDLGdDQUE0QixNQW5CbEIsQ0FtQjBCOztBQW5CMUIsR0FGQztBQXVCYkUsWUFBVSxFQUFFO0FBQ1Ysb0JBQWdCLE1BRE47QUFDYztBQUN4QiwwQkFBc0IsTUFGWjtBQUVvQjtBQUM5QiwwQkFBc0IsTUFIWixDQUdvQjs7QUFIcEIsR0F2QkM7QUE0QmJELFdBQVMsRUFBRTtBQUNULDRCQUF3QixNQURmO0FBQ3VCO0FBQ2hDLGtDQUE4QixNQUZyQjtBQUU2QjtBQUN0QyxxQkFBaUIsTUFIUjtBQUdnQjtBQUN6QiwyQkFBdUIsTUFKZCxDQUlzQjs7QUFKdEIsR0E1QkU7QUFrQ2JNLFdBQVMsRUFBRTtBQUNULHNCQUFrQixNQURUO0FBQ2lCO0FBQzFCLHVCQUFtQixNQUZWO0FBRWtCO0FBQzNCLHVCQUFtQixNQUhWO0FBR2tCO0FBQzNCLHVCQUFtQixNQUpWLENBSWtCOztBQUpsQixHQWxDRTtBQXdDYmEsVUFBUSxFQUFFO0FBQ1Isc0NBQWtDO0FBRDFCLEdBeENHO0FBMkNieEMsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSw0QkFETjtBQUVFO0FBQ0E7QUFDQTtBQUNBRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakI7QUFBTixLQUFuQixDQUxaO0FBTUVrRixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTG5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRlQ7QUFHTHdELGNBQU0sRUFBRTtBQUNOOUMsWUFBRSxFQUFFLGFBREU7QUFFTkksWUFBRSxFQUFFLGdCQUZFO0FBR05DLFlBQUUsRUFBRSxrQkFIRTtBQUlOQyxZQUFFLEVBQUUsUUFKRTtBQUtOQyxZQUFFLEVBQUUsTUFMRTtBQU1OQyxZQUFFLEVBQUU7QUFORTtBQUhILE9BQVA7QUFZRDtBQW5CSCxHQURRO0FBM0NHLENBQWYsRTs7QUNOQTtBQUVBLDJDQUFlO0FBQ2JVLFFBQU0sRUFBRUMsZ0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGlDQUE2QixNQURuQjtBQUMyQjtBQUNyQywwQkFBc0IsTUFGWjtBQUVvQjtBQUM5QixxQ0FBaUMsTUFIdkI7QUFHK0I7QUFDekMsOEJBQTBCLE1BSmhCO0FBSXdCO0FBQ2xDLGtDQUE4QixNQUxwQjtBQUs0QjtBQUN0QywyQkFBdUIsTUFOYjtBQU1xQjtBQUMvQiw2QkFBeUIsTUFQZjtBQU91QjtBQUNqQyxzQkFBa0IsTUFSUjtBQVFnQjtBQUMxQiw4QkFBMEIsTUFUaEI7QUFTd0I7QUFDbEMsOEJBQTBCLE1BVmhCO0FBVXdCO0FBQ2xDLDJCQUF1QixNQVhiO0FBV3FCO0FBQy9CLG1DQUErQixNQVpyQixDQVk2Qjs7QUFaN0IsR0FGQztBQWdCYkMsV0FBUyxFQUFFO0FBQ1Qsd0JBQW9CLE1BRFg7QUFDbUI7QUFDNUIsbUNBQStCLE1BRnRCO0FBRThCO0FBQ3ZDLG1DQUErQixNQUh0QixDQUc4Qjs7QUFIOUI7QUFoQkUsQ0FBZixFOzs7O0FDRkE7QUFDQTtBQUNBO0NBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE1BQU0rQyxlQUFlLEdBQUdDLFFBQVEsQ0FBQyxNQUFELEVBQVMsRUFBVCxDQUFoQzs7QUFDQSxNQUFNQyxlQUFlLEdBQUcsQ0FBQzFJLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN6QztBQUNBO0FBQ0EsTUFBSSxPQUFPRCxJQUFJLENBQUMySSxTQUFaLEtBQTBCLFdBQTlCLEVBQ0UzSSxJQUFJLENBQUMySSxTQUFMLEdBQWlCRixRQUFRLENBQUN4SSxPQUFPLENBQUNVLEVBQVQsRUFBYSxFQUFiLENBQVIsR0FBMkI2SCxlQUE1QyxDQUp1QyxDQUt6QztBQUNBO0FBQ0E7O0FBQ0EsU0FBTyxDQUFDQyxRQUFRLENBQUN4SSxPQUFPLENBQUNVLEVBQVQsRUFBYSxFQUFiLENBQVIsR0FBMkJYLElBQUksQ0FBQzJJLFNBQWpDLEVBQTRDQyxRQUE1QyxDQUFxRCxFQUFyRCxFQUF5RHpJLFdBQXpELEdBQXVFMEksUUFBdkUsQ0FBZ0YsQ0FBaEYsRUFBbUYsR0FBbkYsQ0FBUDtBQUNELENBVEQ7O0FBV0EsMkNBQWU7QUFDYjNFLFFBQU0sRUFBRUMsNEVBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHlDQUFxQyxNQUQzQjtBQUNtQztBQUM3QywwQ0FBc0MsTUFGNUI7QUFFb0M7QUFDOUMsc0NBQWtDLE1BSHhCO0FBR2dDO0FBQzFDLG1DQUErQixNQUpyQjtBQUk2QjtBQUN2Qyw4QkFBMEIsTUFMaEI7QUFLd0I7QUFDbEMsa0NBQThCLE1BTnBCO0FBTTRCO0FBQ3RDLDRCQUF3QixNQVBkO0FBT3NCO0FBQ2hDLDJCQUF1QixNQVJiO0FBUXFCO0FBQy9CLHFDQUFpQyxNQVR2QjtBQVMrQjtBQUN6Qyw4QkFBMEIsTUFWaEIsQ0FVd0I7O0FBVnhCLEdBRkM7QUFjYkUsWUFBVSxFQUFFO0FBQ1YsNkJBQXlCLE1BRGYsQ0FDdUI7O0FBRHZCLEdBZEM7QUFpQmJELFdBQVMsRUFBRTtBQUNULGlDQUE2QixNQURwQjtBQUM0QjtBQUNyQyxpQ0FBNkIsTUFGcEI7QUFFNEI7QUFDckMsZ0NBQTRCLE1BSG5CO0FBRzJCO0FBQ3BDLGdDQUE0QixNQUpuQjtBQUkyQjtBQUNwQyxrQ0FBOEIsTUFMckI7QUFLNkI7QUFDdEMsa0NBQThCLE1BTnJCLENBTTZCOztBQU43QixHQWpCRTtBQXlCYk0sV0FBUyxFQUFFO0FBQ1Qsd0NBQW9DLE1BRDNCO0FBQ21DO0FBQzVDLHNDQUFrQyxNQUZ6QjtBQUVpQztBQUMxQyxtQ0FBK0IsTUFIdEI7QUFHOEI7QUFDdkMsbUNBQStCLE1BSnRCO0FBSThCO0FBQ3ZDLDhCQUEwQixNQUxqQixDQUt5Qjs7QUFMekIsR0F6QkU7QUFnQ2JILGlCQUFlLEVBQUU7QUFDZix3QkFBb0IsS0FETCxDQUNZOztBQURaLEdBaENKO0FBbUNiSyxVQUFRLEVBQUU7QUFDUixzQ0FBa0M7QUFEMUIsR0FuQ0c7QUFzQ2I3QixVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0E7QUFDQXpELE1BQUUsRUFBRSxvQkFITjtBQUlFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUpaO0FBS0V6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUNxRixpQkFBTCxDQUF1QnBGLE9BQXZCLElBQWtDLENBTGxFO0FBTUVvQixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFyRCxPQUFQO0FBQ0Q7QUFSSCxHQURRLEVBV1I7QUFDRXpFLE1BQUUsRUFBRSxpQkFETjtBQUVFRSxZQUFRLEVBQUVnRCwrQ0FBQSxDQUFzQixFQUF0QixDQUZaO0FBR0U5QyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCLFlBQU1VLEVBQUUsR0FBRytILGVBQWUsQ0FBQzFJLElBQUQsRUFBT0MsT0FBUCxDQUExQjtBQUNBLFlBQU02SSxnQkFBZ0IsR0FBRyxNQUF6QjtBQUNBLFlBQU1DLGVBQWUsR0FBRyxNQUF4Qjs7QUFDQSxVQUFJcEksRUFBRSxJQUFJbUksZ0JBQU4sSUFBMEJuSSxFQUFFLElBQUlvSSxlQUFwQyxFQUFxRDtBQUNuRDtBQUNBLGNBQU1KLFNBQVMsR0FBR0YsUUFBUSxDQUFDOUgsRUFBRCxFQUFLLEVBQUwsQ0FBUixHQUFtQjhILFFBQVEsQ0FBQ0ssZ0JBQUQsRUFBbUIsRUFBbkIsQ0FBN0MsQ0FGbUQsQ0FJbkQ7O0FBQ0E5SSxZQUFJLENBQUNnSixjQUFMLEdBQXNCaEosSUFBSSxDQUFDZ0osY0FBTCxJQUF1QixFQUE3QztBQUNBaEosWUFBSSxDQUFDZ0osY0FBTCxDQUFvQi9JLE9BQU8sQ0FBQ3FDLE1BQTVCLElBQXNDcUcsU0FBUyxHQUFHLENBQVosR0FBZ0IsQ0FBdEQ7QUFDRDtBQUNGO0FBZkgsR0FYUSxFQTRCUjtBQUNFO0FBQ0E7QUFDQWhJLE1BQUUsRUFBRSxxREFITjtBQUlFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFaEMsWUFBTSxFQUFFLG9CQUFWO0FBQWdDbEIsUUFBRSxFQUFFO0FBQXBDLEtBQXZCLENBSlo7QUFLRUksT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QjtBQUNBO0FBQ0FELFVBQUksQ0FBQ2lKLG1CQUFMLEdBQTJCakosSUFBSSxDQUFDaUosbUJBQUwsSUFBNEIsRUFBdkQ7QUFDQWpKLFVBQUksQ0FBQ2lKLG1CQUFMLENBQXlCaEosT0FBTyxDQUFDQyxRQUFSLENBQWlCQyxXQUFqQixFQUF6QixJQUEyRCtGLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2lKLENBQVQsQ0FBckU7QUFDRDtBQVZILEdBNUJRLEVBd0NSO0FBQ0U7QUFDQXZJLE1BQUUsRUFBRSx3Q0FGTjtBQUdFRSxZQUFRLEVBQUVnRCx1Q0FBQSxDQUFrQjtBQUFFdkIsWUFBTSxFQUFFLG9CQUFWO0FBQWdDM0IsUUFBRSxFQUFFO0FBQXBDLEtBQWxCLENBSFo7QUFJRUksT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDbUosdUJBQUwsR0FBK0JuSixJQUFJLENBQUNtSix1QkFBTCxJQUFnQyxFQUEvRDtBQUNBbkosVUFBSSxDQUFDbUosdUJBQUwsQ0FBNkJsSixPQUFPLENBQUM0QixNQUFyQyxJQUErQzVCLE9BQU8sQ0FBQ2lILFFBQVIsQ0FBaUIvRyxXQUFqQixFQUEvQztBQUNEO0FBUEgsR0F4Q1EsRUFpRFI7QUFDRVEsTUFBRSxFQUFFLHFDQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVoQyxZQUFNLEVBQUUsb0JBQVY7QUFBZ0NsQixRQUFFLEVBQUU7QUFBcEMsS0FBbkIsQ0FGWjtBQUdFTyxnQkFBWSxFQUFFLENBSGhCO0FBSUVFLG1CQUFlLEVBQUUsQ0FKbkI7QUFLRUwsT0FBRyxFQUFHZixJQUFELElBQVU7QUFDYkEsVUFBSSxDQUFDb0osaUJBQUwsR0FBeUJwSixJQUFJLENBQUNvSixpQkFBTCxJQUEwQixDQUFuRDtBQUNBcEosVUFBSSxDQUFDb0osaUJBQUw7QUFDRDtBQVJILEdBakRRLEVBMkRSO0FBQ0U7QUFDQXpJLE1BQUUsRUFBRSw2QkFGTjtBQUdFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFaEIsVUFBSSxFQUFFLElBQVI7QUFBY2hCLFlBQU0sRUFBRSxvQkFBdEI7QUFBNENsQixRQUFFLEVBQUU7QUFBaEQsS0FBbkIsQ0FIWjtBQUlFVSxXQUFPLEVBQUUsQ0FBQ3JCLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUMxQixVQUFJLENBQUNELElBQUksQ0FBQ2dKLGNBQU4sSUFBd0IsQ0FBQ2hKLElBQUksQ0FBQ21KLHVCQUE5QixJQUF5RCxDQUFDbkosSUFBSSxDQUFDaUosbUJBQW5FLEVBQ0UsT0FGd0IsQ0FJMUI7O0FBQ0EsWUFBTUksTUFBTSxHQUFHLENBQUNySixJQUFJLENBQUNvSixpQkFBTCxJQUEwQixDQUEzQixJQUFnQyxDQUEvQztBQUNBLFlBQU1sSixRQUFRLEdBQUdELE9BQU8sQ0FBQ0MsUUFBUixDQUFpQkMsV0FBakIsRUFBakI7QUFDQSxZQUFNbUosS0FBSyxHQUFHOUcsTUFBTSxDQUFDQyxJQUFQLENBQVl6QyxJQUFJLENBQUNnSixjQUFqQixDQUFkO0FBQ0EsWUFBTU8sT0FBTyxHQUFHRCxLQUFLLENBQUM1RyxNQUFOLENBQWNoQixJQUFELElBQVUxQixJQUFJLENBQUNnSixjQUFMLENBQW9CdEgsSUFBcEIsTUFBOEIySCxNQUFyRCxDQUFoQjtBQUNBLFlBQU1HLE1BQU0sR0FBR0QsT0FBTyxDQUFDN0csTUFBUixDQUFnQmhCLElBQUQsSUFBVTFCLElBQUksQ0FBQ21KLHVCQUFMLENBQTZCekgsSUFBN0IsTUFBdUN4QixRQUFoRSxDQUFmLENBVDBCLENBVzFCOztBQUNBLFVBQUlzSixNQUFNLENBQUM1RyxNQUFQLEtBQWtCLENBQXRCLEVBQ0UsT0Fid0IsQ0FlMUI7O0FBQ0EsVUFBSTRHLE1BQU0sQ0FBQyxDQUFELENBQU4sS0FBY3ZKLE9BQU8sQ0FBQ3FDLE1BQTFCLEVBQ0UsT0FqQndCLENBbUIxQjtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxZQUFNbUgsc0JBQXNCLEdBQUcsQ0FBL0I7QUFFQSxVQUFJQyxxQkFBcUIsR0FBRyxLQUE1QjtBQUNBLFVBQUlDLGFBQWEsR0FBRyxLQUFwQjtBQUNBLFlBQU1DLFlBQVksR0FBR3BILE1BQU0sQ0FBQ0MsSUFBUCxDQUFZekMsSUFBSSxDQUFDaUosbUJBQWpCLENBQXJCOztBQUNBLFVBQUlXLFlBQVksQ0FBQ2hILE1BQWIsS0FBd0IsQ0FBeEIsSUFBNkJnSCxZQUFZLENBQUN0SixRQUFiLENBQXNCSixRQUF0QixDQUFqQyxFQUFrRTtBQUNoRSxjQUFNMkosT0FBTyxHQUFHRCxZQUFZLENBQUMsQ0FBRCxDQUFaLEtBQW9CMUosUUFBcEIsR0FBK0IwSixZQUFZLENBQUMsQ0FBRCxDQUEzQyxHQUFpREEsWUFBWSxDQUFDLENBQUQsQ0FBN0U7QUFDQSxjQUFNRSxPQUFPLEdBQUc5SixJQUFJLENBQUNpSixtQkFBTCxDQUF5Qi9JLFFBQXpCLENBQWhCO0FBQ0EsY0FBTTZKLE1BQU0sR0FBRy9KLElBQUksQ0FBQ2lKLG1CQUFMLENBQXlCWSxPQUF6QixDQUFmO0FBQ0EsY0FBTUcsS0FBSyxHQUFHQyxJQUFJLENBQUNDLEdBQUwsQ0FBU0osT0FBTyxHQUFHQyxNQUFuQixDQUFkOztBQUNBLFlBQUlDLEtBQUssR0FBR1Asc0JBQVosRUFBb0M7QUFDbENDLCtCQUFxQixHQUFHLElBQXhCO0FBQ0FDLHVCQUFhLEdBQUdHLE9BQU8sR0FBR0MsTUFBMUI7QUFDRDtBQUNGOztBQUVELFlBQU1JLEtBQUssR0FBR1gsTUFBTSxDQUFDLENBQUQsQ0FBcEI7QUFDQSxZQUFNWSxTQUFTLEdBQUdwSyxJQUFJLENBQUNrRCxTQUFMLENBQWVpSCxLQUFmLENBQWxCO0FBQ0EsVUFBSXBILElBQUksR0FBRztBQUNUQyxVQUFFLEVBQUcsR0FBRS9DLE9BQU8sQ0FBQ21GLE9BQVEsVUFBU2dGLFNBQVUsTUFBS2YsTUFBTyxHQUQ3QztBQUVUakcsVUFBRSxFQUFHLEdBQUVuRCxPQUFPLENBQUNtRixPQUFRLFNBQVFnRixTQUFVLE1BQUtmLE1BQU8sR0FGNUM7QUFHVC9GLFVBQUUsRUFBRyxHQUFFckQsT0FBTyxDQUFDbUYsT0FBUSxLQUFJZ0YsU0FBVSxPQUFNZixNQUFPLEdBSHpDO0FBSVQ5RixVQUFFLEVBQUcsR0FBRXRELE9BQU8sQ0FBQ21GLE9BQVEsT0FBTWdGLFNBQVUsS0FBSWYsTUFBTyxHQUp6QztBQUtUN0YsVUFBRSxFQUFHLEdBQUV2RCxPQUFPLENBQUNtRixPQUFRLFVBQVNnRixTQUFVLE1BQUtmLE1BQU87QUFMN0MsT0FBWDs7QUFPQSxVQUFJSyxxQkFBcUIsSUFBSUMsYUFBN0IsRUFBNEM7QUFDMUM1RyxZQUFJLEdBQUc7QUFDTEMsWUFBRSxFQUFHLEdBQUUvQyxPQUFPLENBQUNtRixPQUFRLFVBQVNnRixTQUFVLE1BQUtmLE1BQU8sU0FEakQ7QUFFTGpHLFlBQUUsRUFBRyxHQUFFbkQsT0FBTyxDQUFDbUYsT0FBUSxTQUFRZ0YsU0FBVSxNQUFLZixNQUFPLFVBRmhEO0FBR0wvRixZQUFFLEVBQUcsR0FBRXJELE9BQU8sQ0FBQ21GLE9BQVEsT0FBTWdGLFNBQVUsT0FBTWYsTUFBTyxHQUgvQztBQUlMOUYsWUFBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRLFNBQVFnRixTQUFVLEtBQUlmLE1BQU8sR0FKL0M7QUFLTDdGLFlBQUUsRUFBRyxHQUFFdkQsT0FBTyxDQUFDbUYsT0FBUSxVQUFTZ0YsU0FBVSxNQUFLZixNQUFPO0FBTGpELFNBQVA7QUFPRCxPQVJELE1BUU8sSUFBSUsscUJBQXFCLElBQUksQ0FBQ0MsYUFBOUIsRUFBNkM7QUFDbEQ1RyxZQUFJLEdBQUc7QUFDTEMsWUFBRSxFQUFHLEdBQUUvQyxPQUFPLENBQUNtRixPQUFRLFVBQVNnRixTQUFVLE1BQUtmLE1BQU8sU0FEakQ7QUFFTGpHLFlBQUUsRUFBRyxHQUFFbkQsT0FBTyxDQUFDbUYsT0FBUSxTQUFRZ0YsU0FBVSxNQUFLZixNQUFPLFNBRmhEO0FBR0wvRixZQUFFLEVBQUcsR0FBRXJELE9BQU8sQ0FBQ21GLE9BQVEsT0FBTWdGLFNBQVUsT0FBTWYsTUFBTyxHQUgvQztBQUlMOUYsWUFBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRLFNBQVFnRixTQUFVLEtBQUlmLE1BQU8sR0FKL0M7QUFLTDdGLFlBQUUsRUFBRyxHQUFFdkQsT0FBTyxDQUFDbUYsT0FBUSxVQUFTZ0YsU0FBVSxNQUFLZixNQUFPO0FBTGpELFNBQVA7QUFPRDs7QUFFRCxhQUFPO0FBQ0x4RyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMUSxhQUFLLEVBQUVxSCxLQUhGO0FBSUxwSCxZQUFJLEVBQUVBO0FBSkQsT0FBUDtBQU1EO0FBNUVILEdBM0RRLEVBeUlSO0FBQ0VwQyxNQUFFLEVBQUUsaUNBRE47QUFFRUUsWUFBUSxFQUFFZ0QsdUNBQUEsQ0FBa0I7QUFBRWhDLFlBQU0sRUFBRSxZQUFWO0FBQXdCbEIsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQ7QUFBNUIsS0FBbEIsQ0FGWjtBQUdFSSxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUNxSyxlQUFMLEdBQXVCckssSUFBSSxDQUFDcUssZUFBTCxJQUF3QixFQUEvQztBQUNBckssVUFBSSxDQUFDcUssZUFBTCxDQUFxQnBLLE9BQU8sQ0FBQ0MsUUFBN0IsSUFBeUNELE9BQU8sQ0FBQ3FDLE1BQWpEO0FBQ0Q7QUFOSCxHQXpJUSxFQWlKUjtBQUNFM0IsTUFBRSxFQUFFLGlDQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVoQyxZQUFNLEVBQUUsWUFBVjtBQUF3QmxCLFFBQUUsRUFBRTtBQUE1QixLQUFuQixDQUZaO0FBR0VHLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDNUIsVUFBSSxDQUFDRCxJQUFJLENBQUNxSyxlQUFWLEVBQ0UsT0FBTyxLQUFQO0FBQ0YsYUFBT3BLLE9BQU8sQ0FBQ3FDLE1BQVIsS0FBbUJ0QyxJQUFJLENBQUNxSyxlQUFMLENBQXFCcEssT0FBTyxDQUFDQyxRQUE3QixDQUExQjtBQUNELEtBUEg7QUFRRW1CLFdBQU8sRUFBRSxDQUFDckIsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQzFCLFlBQU1xSyxXQUFXLEdBQUd0SyxJQUFJLENBQUNrRCxTQUFMLENBQWVsRCxJQUFJLENBQUNxSyxlQUFMLENBQXFCcEssT0FBTyxDQUFDQyxRQUE3QixDQUFmLENBQXBCO0FBQ0EsYUFBTztBQUNMMkMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFHLEdBQUUvQyxPQUFPLENBQUNtRixPQUFRLFVBQVNrRixXQUFZLEdBRHhDO0FBRUpsSCxZQUFFLEVBQUcsR0FBRW5ELE9BQU8sQ0FBQ21GLE9BQVEsU0FBUWtGLFdBQVksR0FGdkM7QUFHSmpILFlBQUUsRUFBRyxHQUFFcEQsT0FBTyxDQUFDbUYsT0FBUSxRQUFPa0YsV0FBWSxHQUh0QztBQUlKaEgsWUFBRSxFQUFHLEdBQUVyRCxPQUFPLENBQUNtRixPQUFRLEtBQUlrRixXQUFZLEtBSm5DO0FBS0ovRyxZQUFFLEVBQUcsR0FBRXRELE9BQU8sQ0FBQ21GLE9BQVEsT0FBTWtGLFdBQVksR0FMckM7QUFNSjlHLFlBQUUsRUFBRyxHQUFFdkQsT0FBTyxDQUFDbUYsT0FBUSxVQUFTa0YsV0FBWTtBQU54QztBQUhELE9BQVA7QUFZRDtBQXRCSCxHQWpKUSxFQXlLUjtBQUNFM0osTUFBRSxFQUFFLDJDQUROO0FBRUU7QUFDQUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FIWjtBQUlFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDdUssSUFBTCxHQUFZdkssSUFBSSxDQUFDdUssSUFBTCxJQUFhLEVBQXpCO0FBQ0F2SyxVQUFJLENBQUN1SyxJQUFMLENBQVV0SyxPQUFPLENBQUNxQyxNQUFsQixJQUE0QixJQUE1QjtBQUNEO0FBUEgsR0F6S1EsRUFrTFI7QUFDRTNCLE1BQUUsRUFBRSwyQ0FETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUN1SyxJQUFMLEdBQVl2SyxJQUFJLENBQUN1SyxJQUFMLElBQWEsRUFBekI7QUFDQXZLLFVBQUksQ0FBQ3VLLElBQUwsQ0FBVXRLLE9BQU8sQ0FBQ3FDLE1BQWxCLElBQTRCLEtBQTVCO0FBQ0Q7QUFOSCxHQWxMUSxFQTBMUjtBQUNFM0IsTUFBRSxFQUFFLGdDQUROO0FBRUVFLFlBQVEsRUFBRWdELHVDQUFBLENBQWtCO0FBQUVoQyxZQUFNLEVBQUUsbUJBQVY7QUFBK0JsQixRQUFFLEVBQUU7QUFBbkMsS0FBbEIsQ0FGWjtBQUdFbUcsY0FBVSxFQUFFakQsdUNBQUEsQ0FBa0I7QUFBRWhDLFlBQU0sRUFBRSxvQkFBVjtBQUFnQ2xCLFFBQUUsRUFBRTtBQUFwQyxLQUFsQixDQUhkO0FBSUUrRCxjQUFVLEVBQUViLHVDQUFBLENBQWtCO0FBQUVoQyxZQUFNLEVBQUUsa0JBQVY7QUFBOEJsQixRQUFFLEVBQUU7QUFBbEMsS0FBbEIsQ0FKZDtBQUtFZ0UsY0FBVSxFQUFFZCx1Q0FBQSxDQUFrQjtBQUFFaEMsWUFBTSxFQUFFLFFBQVY7QUFBb0JsQixRQUFFLEVBQUU7QUFBeEIsS0FBbEIsQ0FMZDtBQU1FSSxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUN3SyxrQkFBTCxHQUEwQnhLLElBQUksQ0FBQ3dLLGtCQUFMLElBQTJCLEVBQXJEO0FBQ0F4SyxVQUFJLENBQUN3SyxrQkFBTCxDQUF3QnZLLE9BQU8sQ0FBQ0MsUUFBUixDQUFpQkMsV0FBakIsRUFBeEIsSUFBMERGLE9BQU8sQ0FBQ3FDLE1BQWxFO0FBQ0F0QyxVQUFJLENBQUN5SyxlQUFMLEdBQXVCekssSUFBSSxDQUFDeUssZUFBTCxJQUF3QixFQUEvQztBQUNBekssVUFBSSxDQUFDeUssZUFBTCxDQUFxQnhKLElBQXJCLENBQTBCaEIsT0FBTyxDQUFDcUMsTUFBbEM7QUFDRDtBQVhILEdBMUxRLEVBdU1SO0FBQ0UzQixNQUFFLEVBQUUsb0NBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWhDLFlBQU0sRUFBRSxtQkFBVjtBQUErQmxCLFFBQUUsRUFBRTtBQUFuQyxLQUF2QixDQUZaO0FBR0VtRyxjQUFVLEVBQUVqRCxpREFBQSxDQUF1QjtBQUFFaEMsWUFBTSxFQUFFLG9CQUFWO0FBQWdDbEIsUUFBRSxFQUFFO0FBQXBDLEtBQXZCLENBSGQ7QUFJRStELGNBQVUsRUFBRWIsaURBQUEsQ0FBdUI7QUFBRWhDLFlBQU0sRUFBRSxrQkFBVjtBQUE4QmxCLFFBQUUsRUFBRTtBQUFsQyxLQUF2QixDQUpkO0FBS0VnRSxjQUFVLEVBQUVkLGlEQUFBLENBQXVCO0FBQUVoQyxZQUFNLEVBQUUsUUFBVjtBQUFvQmxCLFFBQUUsRUFBRTtBQUF4QixLQUF2QixDQUxkO0FBTUVVLFdBQU8sRUFBRSxDQUFDckIsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQzFCO0FBQ0E7QUFDQSxVQUFJLENBQUNELElBQUksQ0FBQ3lLLGVBQVYsRUFDRTtBQUNGLFlBQU1OLEtBQUssR0FBR25LLElBQUksQ0FBQ3dLLGtCQUFMLENBQXdCdkssT0FBTyxDQUFDQyxRQUFSLENBQWlCQyxXQUFqQixFQUF4QixDQUFkO0FBQ0EsVUFBSSxDQUFDZ0ssS0FBTCxFQUNFO0FBQ0YsVUFBSWxLLE9BQU8sQ0FBQ3FDLE1BQVIsS0FBbUI2SCxLQUF2QixFQUNFLE9BVHdCLENBVzFCO0FBQ0E7O0FBQ0EsWUFBTU8sWUFBWSxHQUFHMUssSUFBSSxDQUFDeUssZUFBTCxDQUFxQm5LLFFBQXJCLENBQThCTCxPQUFPLENBQUNxQyxNQUF0QyxDQUFyQjtBQUNBLFlBQU1xSSxhQUFhLEdBQUczSyxJQUFJLENBQUN1SyxJQUFMLElBQWF2SyxJQUFJLENBQUN1SyxJQUFMLENBQVV0SyxPQUFPLENBQUNxQyxNQUFsQixDQUFuQzs7QUFFQSxVQUFJb0ksWUFBWSxJQUFJQyxhQUFwQixFQUFtQztBQUNqQyxjQUFNUCxTQUFTLEdBQUdwSyxJQUFJLENBQUNrRCxTQUFMLENBQWVpSCxLQUFmLENBQWxCO0FBRUEsY0FBTVMsT0FBTyxHQUFHLENBQUMsRUFBakI7QUFDQSxjQUFNakksQ0FBQyxHQUFHdUQsVUFBVSxDQUFDakcsT0FBTyxDQUFDMEMsQ0FBVCxDQUFwQjtBQUNBLGNBQU11RyxDQUFDLEdBQUdoRCxVQUFVLENBQUNqRyxPQUFPLENBQUNpSixDQUFULENBQXBCO0FBQ0EsWUFBSTJCLE1BQU0sR0FBRyxJQUFiOztBQUNBLFlBQUkzQixDQUFDLEdBQUcwQixPQUFSLEVBQWlCO0FBQ2YsY0FBSWpJLENBQUMsR0FBRyxDQUFSLEVBQ0VrSSxNQUFNLEdBQUdDLGtDQUFULENBREYsS0FHRUQsTUFBTSxHQUFHQyxrQ0FBVDtBQUNILFNBTEQsTUFLTztBQUNMLGNBQUluSSxDQUFDLEdBQUcsQ0FBUixFQUNFa0ksTUFBTSxHQUFHQyxrQ0FBVCxDQURGLEtBR0VELE1BQU0sR0FBR0Msa0NBQVQ7QUFDSDs7QUFFRCxlQUFPO0FBQ0xqSSxjQUFJLEVBQUUsTUFERDtBQUVMQyxlQUFLLEVBQUVxSCxLQUZGO0FBR0x6SSxjQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUhUO0FBSUxTLGNBQUksRUFBRTtBQUNKQyxjQUFFLEVBQUcsR0FBRS9DLE9BQU8sQ0FBQ21GLE9BQVEsVUFBU2dGLFNBQVUsS0FBSVMsTUFBTSxDQUFDLElBQUQsQ0FBTyxHQUR2RDtBQUVKekgsY0FBRSxFQUFHLEdBQUVuRCxPQUFPLENBQUNtRixPQUFRLFNBQVFnRixTQUFVLEtBQUlTLE1BQU0sQ0FBQyxJQUFELENBQU8sR0FGdEQ7QUFHSnhILGNBQUUsRUFBRyxHQUFFcEQsT0FBTyxDQUFDbUYsT0FBUSxRQUFPZ0YsU0FBVSxLQUFJUyxNQUFNLENBQUMsSUFBRCxDQUFPLEdBSHJEO0FBSUp2SCxjQUFFLEVBQUcsR0FBRXJELE9BQU8sQ0FBQ21GLE9BQVEsS0FBSWdGLFNBQVUsT0FBTVMsTUFBTSxDQUFDLElBQUQsQ0FBTyxHQUpwRDtBQUtKdEgsY0FBRSxFQUFHLEdBQUV0RCxPQUFPLENBQUNtRixPQUFRLE9BQU1nRixTQUFVLEtBQUlTLE1BQU0sQ0FBQyxJQUFELENBQU8sRUFMcEQ7QUFNSnJILGNBQUUsRUFBRyxHQUFFdkQsT0FBTyxDQUFDbUYsT0FBUSxVQUFTZ0YsU0FBVSxNQUFLUyxNQUFNLENBQUMsSUFBRCxDQUFPO0FBTnhEO0FBSkQsU0FBUDtBQWFEO0FBQ0Y7QUF2REgsR0F2TVEsRUFnUVI7QUFDRWxLLE1BQUUsRUFBRSw2QkFETjtBQUVFRSxZQUFRLEVBQUVnRCwrREFBQSxDQUE4QjtBQUFFbkMsVUFBSSxFQUFFO0FBQVIsS0FBOUIsQ0FGWjtBQUdFWCxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCLFlBQU1pSixDQUFDLEdBQUdoRCxVQUFVLENBQUNqRyxPQUFPLENBQUNpSixDQUFULENBQXBCO0FBQ0EsWUFBTTBCLE9BQU8sR0FBRyxDQUFDLEVBQWpCO0FBQ0EsVUFBSTFCLENBQUMsR0FBRzBCLE9BQVIsRUFDRTVLLElBQUksQ0FBQytLLFlBQUwsR0FBb0I5SyxPQUFPLENBQUNVLEVBQVIsQ0FBV1IsV0FBWCxFQUFwQjtBQUNIO0FBUkgsR0FoUVEsRUEwUVI7QUFDRVEsTUFBRSxFQUFFLGtDQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVoQyxZQUFNLEVBQUUsaUJBQVY7QUFBNkJsQixRQUFFLEVBQUU7QUFBakMsS0FBbkIsQ0FGWjtBQUdFbUcsY0FBVSxFQUFFakQseUNBQUEsQ0FBbUI7QUFBRWhDLFlBQU0sRUFBRSwyQkFBVjtBQUF1Q2xCLFFBQUUsRUFBRTtBQUEzQyxLQUFuQixDQUhkO0FBSUUrRCxjQUFVLEVBQUViLHlDQUFBLENBQW1CO0FBQUVoQyxZQUFNLEVBQUUseUJBQVY7QUFBcUNsQixRQUFFLEVBQUU7QUFBekMsS0FBbkIsQ0FKZDtBQUtFZ0UsY0FBVSxFQUFFZCx5Q0FBQSxDQUFtQjtBQUFFaEMsWUFBTSxFQUFFLFNBQVY7QUFBcUJsQixRQUFFLEVBQUU7QUFBekIsS0FBbkIsQ0FMZDtBQU1FVSxXQUFPLEVBQUUsQ0FBQ3JCLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUMxQixZQUFNK0ssWUFBWSxHQUFHL0ssT0FBTyxDQUFDNEMsSUFBUixLQUFpQixJQUF0QztBQUNBLFlBQU04SCxhQUFhLEdBQUczSyxJQUFJLENBQUN1SyxJQUFMLElBQWF2SyxJQUFJLENBQUN1SyxJQUFMLENBQVV0SyxPQUFPLENBQUNxQyxNQUFsQixDQUFuQyxDQUYwQixDQUkxQjs7QUFDQSxVQUFJMEksWUFBWSxJQUFJLENBQUNMLGFBQXJCLEVBQ0U7QUFFRixZQUFNTSxNQUFNLEdBQUc7QUFDYkYsb0JBQVksRUFBRTtBQUNaL0gsWUFBRSxFQUFFLGdCQURRO0FBRVpJLFlBQUUsRUFBRSxxQkFGUTtBQUdaRSxZQUFFLEVBQUUsVUFIUTtBQUlaQyxZQUFFLEVBQUUsT0FKUTtBQUtaQyxZQUFFLEVBQUU7QUFMUSxTQUREO0FBUWIwSCxvQkFBWSxFQUFFO0FBQ1psSSxZQUFFLEVBQUUsZ0JBRFE7QUFFWkksWUFBRSxFQUFFLG9CQUZRO0FBR1pFLFlBQUUsRUFBRSxVQUhRO0FBSVpDLFlBQUUsRUFBRSxPQUpRO0FBS1pDLFlBQUUsRUFBRTtBQUxRLFNBUkQ7QUFlYjJILGNBQU0sRUFBRTtBQUNObkksWUFBRSxFQUFFLFFBREU7QUFFTkksWUFBRSxFQUFFLFNBRkU7QUFHTkUsWUFBRSxFQUFFLEtBSEU7QUFJTkMsWUFBRSxFQUFFLElBSkU7QUFLTkMsWUFBRSxFQUFFO0FBTEUsU0FmSztBQXNCYjRILGtCQUFVLEVBQUU7QUFDVnBJLFlBQUUsRUFBRSxVQURNO0FBRVZJLFlBQUUsRUFBRSxhQUZNO0FBR1ZFLFlBQUUsRUFBRSxLQUhNO0FBSVZDLFlBQUUsRUFBRSxTQUpNO0FBS1ZDLFlBQUUsRUFBRTtBQUxNO0FBdEJDLE9BQWY7QUErQkEsWUFBTTZILE1BQU0sR0FBRyxFQUFmOztBQUNBLFVBQUlyTCxJQUFJLENBQUMrSyxZQUFULEVBQXVCO0FBQ3JCLFlBQUkvSyxJQUFJLENBQUMrSyxZQUFMLEtBQXNCOUssT0FBTyxDQUFDQyxRQUFsQyxFQUNFbUwsTUFBTSxDQUFDcEssSUFBUCxDQUFZZ0ssTUFBTSxDQUFDRixZQUFQLENBQW9CL0ssSUFBSSxDQUFDc0wsVUFBekIsS0FBd0NMLE1BQU0sQ0FBQ0YsWUFBUCxDQUFvQixJQUFwQixDQUFwRCxFQURGLEtBR0VNLE1BQU0sQ0FBQ3BLLElBQVAsQ0FBWWdLLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQmxMLElBQUksQ0FBQ3NMLFVBQXpCLEtBQXdDTCxNQUFNLENBQUNDLFlBQVAsQ0FBb0IsSUFBcEIsQ0FBcEQ7QUFDSDs7QUFDRCxVQUFJLENBQUNGLFlBQUwsRUFDRUssTUFBTSxDQUFDcEssSUFBUCxDQUFZZ0ssTUFBTSxDQUFDRSxNQUFQLENBQWNuTCxJQUFJLENBQUNzTCxVQUFuQixLQUFrQ0wsTUFBTSxDQUFDRSxNQUFQLENBQWMsSUFBZCxDQUE5QztBQUNGLFVBQUlSLGFBQUosRUFDRVUsTUFBTSxDQUFDcEssSUFBUCxDQUFZZ0ssTUFBTSxDQUFDRyxVQUFQLENBQWtCcEwsSUFBSSxDQUFDc0wsVUFBdkIsS0FBc0NMLE1BQU0sQ0FBQ0csVUFBUCxDQUFrQixJQUFsQixDQUFsRDtBQUVGLGFBQU87QUFDTHZJLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0xTLFlBQUksRUFBRyxHQUFFOUMsT0FBTyxDQUFDbUYsT0FBUSxLQUFJaUcsTUFBTSxDQUFDbEksSUFBUCxDQUFZLElBQVosQ0FBa0I7QUFIMUMsT0FBUDtBQUtEO0FBOURILEdBMVFRLEVBMFVSO0FBQ0V4QyxNQUFFLEVBQUUsa0JBRE47QUFFRTtBQUNBO0FBQ0E7QUFDQTtBQUNBRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekI7QUFBTixLQUFuQixDQU5aO0FBT0VrRixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTG5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRlQ7QUFHTHdELGNBQU0sRUFBRTtBQUNOOUMsWUFBRSxFQUFFLGFBREU7QUFFTkksWUFBRSxFQUFFLGdCQUZFO0FBR05DLFlBQUUsRUFBRSxrQkFIRTtBQUlOQyxZQUFFLEVBQUUsUUFKRTtBQUtOQyxZQUFFLEVBQUUsTUFMRTtBQU1OQyxZQUFFLEVBQUU7QUFORTtBQUhILE9BQVA7QUFZRDtBQXBCSCxHQTFVUSxFQWdXUjtBQUNFN0MsTUFBRSxFQUFFLHVCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUJELElBQUksQ0FBQ3FGLGlCQUFMLENBQXVCcEYsT0FBdkIsSUFBa0MsQ0FIbEU7QUFJRW9CLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQU5ILEdBaFdRO0FBdENHLENBQWYsRTs7QUM1QkE7Q0FHQTtBQUVBOztBQUNBLHdEQUFlO0FBQ2JsQixRQUFNLEVBQUVDLDhEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViw2QkFBeUIsTUFEZjtBQUN1QjtBQUNqQyw2QkFBeUIsTUFGZjtBQUV1QjtBQUNqQyw2QkFBeUIsTUFIZjtBQUd1QjtBQUNqQyw2QkFBeUIsTUFKZjtBQUl1QjtBQUNqQyw2QkFBeUIsTUFMZjtBQUt1QjtBQUNqQyw2QkFBeUIsTUFOZjtBQU11QjtBQUNqQyw2QkFBeUIsTUFQZjtBQU91QjtBQUNqQyxrREFBOEMsTUFScEM7QUFRNEM7QUFDdEQsb0NBQWdDLE1BVHRCO0FBUzhCO0FBQ3hDLG9DQUFnQyxNQVZ0QixDQVU4Qjs7QUFWOUIsR0FGQztBQWNiRSxZQUFVLEVBQUU7QUFDVixpQ0FBNkIsTUFEbkI7QUFDMkI7QUFDckMsa0NBQThCLE1BRnBCO0FBRTRCO0FBQ3RDLGdDQUE0QixNQUhsQjtBQUcwQjtBQUNwQyxnQ0FBNEIsTUFKbEI7QUFJMEI7QUFDcEMsbUNBQStCLE1BTHJCO0FBSzZCO0FBQ3ZDLG1DQUErQixNQU5yQixDQU02Qjs7QUFON0IsR0FkQztBQXNCYkQsV0FBUyxFQUFFO0FBQ1QsNkJBQXlCLE1BRGhCO0FBQ3dCO0FBQ2pDLDhCQUEwQixNQUZqQixDQUV5Qjs7QUFGekIsR0F0QkU7QUEwQmJNLFdBQVMsRUFBRTtBQUNULDJCQUF1QixNQURkLENBQ3NCOztBQUR0QixHQTFCRTtBQTZCYjNCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsdUNBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRWtGLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsYUFERTtBQUVOSSxZQUFFLEVBQUUsZ0JBRkU7QUFHTkMsWUFBRSxFQUFFLGtCQUhFO0FBSU5DLFlBQUUsRUFBRSxRQUpFO0FBS05DLFlBQUUsRUFBRSxNQUxFO0FBTU5DLFlBQUUsRUFBRTtBQU5FO0FBSEgsT0FBUDtBQVlEO0FBaEJILEdBRFE7QUE3QkcsQ0FBZixFOztBQ05BO0NBR0E7O0FBQ0EscURBQWU7QUFDYlUsUUFBTSxFQUFFQyxnREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsZ0NBQTRCLE1BRGxCO0FBQzBCO0FBQ3BDLCtDQUEyQyxNQUZqQztBQUV5QztBQUNuRCwrQ0FBMkMsTUFIakM7QUFHeUM7QUFDbkQsdUNBQW1DLE1BSnpCLENBSWlDOztBQUpqQyxHQUZDO0FBUWJFLFlBQVUsRUFBRTtBQUNWLHNDQUFrQyxNQUR4QjtBQUNnQztBQUMxQyx1Q0FBbUMsTUFGekI7QUFFaUM7QUFDM0MscUNBQWlDLE1BSHZCO0FBRytCO0FBQ3pDLHFDQUFpQyxNQUp2QjtBQUkrQjtBQUN6Qyx3Q0FBb0MsTUFMMUI7QUFLa0M7QUFDNUMsd0NBQW9DLE1BTjFCLENBTWtDOztBQU5sQyxHQVJDO0FBZ0JiRCxXQUFTLEVBQUU7QUFDVCxtQ0FBK0IsTUFEdEIsQ0FDOEI7O0FBRDlCLEdBaEJFO0FBbUJickIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSw0Q0FETjtBQUVFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBbkIsQ0FGWjtBQUdFa0YsZUFBVyxFQUFFLENBQUN4QixLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQy9CLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0x3RCxjQUFNLEVBQUU7QUFDTjlDLFlBQUUsRUFBRSxhQURFO0FBRU5JLFlBQUUsRUFBRSxnQkFGRTtBQUdOQyxZQUFFLEVBQUUsa0JBSEU7QUFJTkMsWUFBRSxFQUFFLFFBSkU7QUFLTkMsWUFBRSxFQUFFLE1BTEU7QUFNTkMsWUFBRSxFQUFFO0FBTkU7QUFISCxPQUFQO0FBWUQ7QUFoQkgsR0FEUTtBQW5CRyxDQUFmLEU7O0FDSkE7QUFFQSx3REFBZTtBQUNiVSxRQUFNLEVBQUVDLGtFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDViwwQkFBc0IsTUFEWjtBQUNvQjtBQUM5QixnQ0FBNEIsTUFGbEI7QUFFMEI7QUFDcEMsZ0NBQTRCLE1BSGxCO0FBRzBCO0FBQ3BDLDRCQUF3QixNQUpkO0FBSXNCO0FBQ2hDLDRCQUF3QixNQUxkO0FBS3NCO0FBQ2hDLDJCQUF1QixNQU5iO0FBTXFCO0FBQy9CLDhDQUEwQyxNQVBoQztBQU93QztBQUNsRCxnREFBNEMsTUFSbEM7QUFRMEM7QUFDcEQsb0NBQWdDLE1BVHRCO0FBUzhCO0FBQ3hDLDhCQUEwQixNQVZoQjtBQVV3QjtBQUNsQyw4QkFBMEIsTUFYaEI7QUFXd0I7QUFDbEMsNkJBQXlCLE1BWmY7QUFZdUI7QUFDakMsdUNBQW1DLE1BYnpCO0FBYWlDO0FBQzNDLHdCQUFvQixNQWRWO0FBY2tCO0FBQzVCLGdDQUE0QixNQWZsQixDQWUwQjs7QUFmMUIsR0FGQztBQW1CYkMsV0FBUyxFQUFFO0FBQ1Qsa0NBQThCLE1BRHJCO0FBQzZCO0FBQ3RDLHVDQUFtQyxNQUYxQjtBQUVrQztBQUMzQyx1Q0FBbUMsTUFIMUI7QUFHa0M7QUFDM0MsdUNBQW1DLE1BSjFCO0FBSWtDO0FBQzNDLHVDQUFtQyxNQUwxQixDQUtrQzs7QUFMbEM7QUFuQkUsQ0FBZixFOztBQ0ZBO0FBQ0E7QUFFQSxxREFBZTtBQUNidkIsUUFBTSxFQUFFQyxvREFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsK0JBQTJCLE1BRGpCO0FBQ3lCO0FBQ25DLHFDQUFpQyxNQUZ2QjtBQUUrQjtBQUN6QyxxQ0FBaUMsTUFIdkI7QUFHK0I7QUFDekMscUNBQWlDLE1BSnZCO0FBSStCO0FBQ3pDLGlDQUE2QixNQUxuQjtBQUsyQjtBQUNyQyxpQ0FBNkIsTUFObkI7QUFNMkI7QUFDckMsOENBQTBDLE1BUGhDO0FBT3dDO0FBQ2xELG1DQUErQixNQVJyQjtBQVE2QjtBQUN2QyxtQ0FBK0IsTUFUckI7QUFTNkI7QUFDdkMsbUNBQStCLE1BVnJCO0FBVTZCO0FBQ3ZDLG1DQUErQixNQVhyQjtBQVc2QjtBQUN2QyxnQ0FBNEIsTUFabEI7QUFZMEI7QUFDcEMsc0NBQWtDLE1BYnhCO0FBYWdDO0FBQzFDLGtDQUE4QixNQWRwQjtBQWM0QjtBQUN0QywwQ0FBc0MsTUFmNUI7QUFlb0M7QUFDOUMsOENBQTBDLE1BaEJoQztBQWdCd0M7QUFDbEQsMENBQXNDLE1BakI1QjtBQWlCb0M7QUFDOUMsNENBQXdDLE1BbEI5QjtBQWtCc0M7QUFDaEQsMkNBQXVDLE1BbkI3QjtBQW1CcUM7QUFDL0Msa0NBQThCLE1BcEJwQixDQW9CNEI7O0FBcEI1QixHQUZDO0FBd0JiQyxXQUFTLEVBQUU7QUFDVCwwQ0FBc0MsTUFEN0I7QUFDcUM7QUFDOUMsMENBQXNDLE1BRjdCLENBRXFDOztBQUZyQyxHQXhCRTtBQTRCYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsNENBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRWtGLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsYUFERTtBQUVOSSxZQUFFLEVBQUUsZ0JBRkU7QUFHTkMsWUFBRSxFQUFFLGtCQUhFO0FBSU5DLFlBQUUsRUFBRSxRQUpFO0FBS05DLFlBQUUsRUFBRSxNQUxFO0FBTU5DLFlBQUUsRUFBRTtBQU5FO0FBSEgsT0FBUDtBQVlEO0FBaEJILEdBRFEsRUFtQlI7QUFDRTtBQUNBN0MsTUFBRSxFQUFFLHlDQUZOO0FBR0VFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUUsQ0FBQyxNQUFELEVBQVMsTUFBVDtBQUFOLEtBQW5CLENBSFo7QUFJRWtGLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsa0JBREU7QUFFTkksWUFBRSxFQUFFLHNCQUZFO0FBR05FLFlBQUUsRUFBRSxVQUhFO0FBSU5DLFlBQUUsRUFBRSxNQUpFO0FBS05DLFlBQUUsRUFBRTtBQUxFO0FBSEgsT0FBUDtBQVdEO0FBaEJILEdBbkJRO0FBNUJHLENBQWYsRTs7QUNIQTtBQUNBO0NBSUE7O0FBQ0EsK0NBQWU7QUFDYlUsUUFBTSxFQUFFQyxrRkFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsK0JBQTJCLE1BRGpCO0FBRVYsK0JBQTJCLE1BRmpCO0FBR1YsK0JBQTJCLE1BSGpCO0FBSVY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUF3QixNQVRkO0FBVVYsMkJBQXVCLE1BVmI7QUFXViw2QkFBeUIsTUFYZjtBQVlWLGdDQUE0QixNQVpsQjtBQWFWLDhCQUEwQixNQWJoQjtBQWNWLDhCQUEwQjtBQWRoQixHQUZDO0FBa0JiRSxZQUFVLEVBQUU7QUFDVixxQkFBaUIsTUFEUDtBQUNlO0FBQ3pCLGdDQUE0QixNQUZsQjtBQUdWLDJCQUF1QixNQUhiO0FBSVYsMkJBQXVCLE1BSmI7QUFLViw2QkFBeUIsTUFMZjtBQU1WLDBCQUFzQjtBQU5aLEdBbEJDO0FBMEJiRCxXQUFTLEVBQUU7QUFDVCxxQ0FBaUMsTUFEeEI7QUFFVCxnQ0FBNEIsZUFGbkI7QUFHVCw0QkFBd0IsTUFIZjtBQUlULDZCQUF5QixNQUpoQjtBQUtULDZCQUF5QjtBQUxoQixHQTFCRTtBQWlDYnJCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsd0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsdUNBQUEsQ0FBa0I7QUFBRWhDLFlBQU0sRUFBRSx3QkFBVjtBQUFvQ2xCLFFBQUUsRUFBRTtBQUF4QyxLQUFsQixDQUZaO0FBR0VJLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3VMLE9BQUwsR0FBZXZMLElBQUksQ0FBQ3VMLE9BQUwsSUFBZ0IsRUFBL0I7QUFDQXZMLFVBQUksQ0FBQ3VMLE9BQUwsQ0FBYXRLLElBQWIsQ0FBa0JoQixPQUFPLENBQUNxQyxNQUExQjtBQUNEO0FBTkgsR0FEUSxFQVNSO0FBQ0UzQixNQUFFLEVBQUUsaUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWhCLFVBQUksRUFBRSxJQUFSO0FBQWNsQyxRQUFFLEVBQUUsTUFBbEI7QUFBMEIsU0FBRzRGLHVDQUFrQkE7QUFBL0MsS0FBdkIsQ0FGWjtBQUdFO0FBQ0F6RixhQUFTLEVBQUUsQ0FBQ2QsSUFBRCxFQUFPQyxPQUFQLEtBQW1CRCxJQUFJLENBQUN1TCxPQUFMLElBQWdCdkwsSUFBSSxDQUFDdUwsT0FBTCxDQUFhakwsUUFBYixDQUFzQkwsT0FBTyxDQUFDcUMsTUFBOUIsQ0FKaEQ7QUFLRWpCLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ21GO0FBQXJELE9BQVA7QUFDRDtBQVBILEdBVFEsRUFrQlI7QUFDRXpFLE1BQUUsRUFBRSxxQkFETjtBQUVFRSxZQUFRLEVBQUVnRCx1Q0FBQSxDQUFrQjtBQUFFaEMsWUFBTSxFQUFFLENBQUMsbUJBQUQsRUFBc0IsbUJBQXRCLENBQVY7QUFBc0RsQixRQUFFLEVBQUUsTUFBMUQ7QUFBa0VrRyxhQUFPLEVBQUU7QUFBM0UsS0FBbEIsQ0FGWjtBQUdFeEYsV0FBTyxFQUFFO0FBQ1B3QixVQUFJLEVBQUUsTUFEQztBQUVQRSxVQUFJLEVBQUU7QUFDSkMsVUFBRSxFQUFFLGtCQURBO0FBRUpJLFVBQUUsRUFBRSxnQkFGQTtBQUdKQyxVQUFFLEVBQUUsbUJBSEE7QUFJSkMsVUFBRSxFQUFFLFFBSkE7QUFLSkMsVUFBRSxFQUFFLFVBTEE7QUFNSkMsVUFBRSxFQUFFO0FBTkE7QUFGQztBQUhYLEdBbEJRLEVBaUNSO0FBQ0U3QyxNQUFFLEVBQUUsc0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FGWjtBQUdFekYsYUFBUyxFQUFFLENBQUNkLElBQUQsRUFBT0MsT0FBUCxLQUFtQkQsSUFBSSxDQUFDcUYsaUJBQUwsQ0FBdUJwRixPQUF2QixJQUFrQyxDQUhsRTtBQUlFb0IsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBTkgsR0FqQ1EsRUF5Q1I7QUFDRXpFLE1BQUUsRUFBRSwyQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUNzSCxjQUFMLEdBQXNCdEgsSUFBSSxDQUFDc0gsY0FBTCxJQUF1QixFQUE3QztBQUNBdEgsVUFBSSxDQUFDc0gsY0FBTCxDQUFvQnJILE9BQU8sQ0FBQ3FDLE1BQTVCLElBQXNDLElBQXRDO0FBQ0Q7QUFOSCxHQXpDUSxFQWlEUjtBQUNFM0IsTUFBRSxFQUFFLDJCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQ3NILGNBQUwsR0FBc0J0SCxJQUFJLENBQUNzSCxjQUFMLElBQXVCLEVBQTdDO0FBQ0F0SCxVQUFJLENBQUNzSCxjQUFMLENBQW9CckgsT0FBTyxDQUFDcUMsTUFBNUIsSUFBc0MsS0FBdEM7QUFDRDtBQU5ILEdBakRRLEVBeURSO0FBQ0UzQixNQUFFLEVBQUUsc0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFeEMsZ0JBQVksRUFBRSxDQUFDbUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQmlHLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBVixHQUErQixHQUhuRTtBQUlFTixlQUFXLEVBQUUsQ0FBQzdGLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUM5QixVQUFJLENBQUNELElBQUksQ0FBQ3NILGNBQVYsRUFDRTtBQUNGLFVBQUksQ0FBQ3RILElBQUksQ0FBQ3NILGNBQUwsQ0FBb0JySCxPQUFPLENBQUNxQyxNQUE1QixDQUFMLEVBQ0U7QUFDRixhQUFPO0FBQ0xaLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRFQ7QUFFTHdELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ3FGO0FBRlgsT0FBUDtBQUlEO0FBYkgsR0F6RFEsRUF3RVI7QUFDRTNFLE1BQUUsRUFBRSxtQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUMySCxPQUFMLEdBQWUzSCxJQUFJLENBQUMySCxPQUFMLElBQWdCLEVBQS9CO0FBQ0EzSCxVQUFJLENBQUMySCxPQUFMLENBQWExSCxPQUFPLENBQUNxQyxNQUFyQixJQUErQixJQUEvQjtBQUNEO0FBTkgsR0F4RVEsRUFnRlI7QUFDRTNCLE1BQUUsRUFBRSxtQkFETjtBQUVFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFSCxjQUFRLEVBQUU7QUFBWixLQUF2QixDQUZaO0FBR0UzQyxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUMySCxPQUFMLEdBQWUzSCxJQUFJLENBQUMySCxPQUFMLElBQWdCLEVBQS9CO0FBQ0EzSCxVQUFJLENBQUMySCxPQUFMLENBQWExSCxPQUFPLENBQUNxQyxNQUFyQixJQUErQixLQUEvQjtBQUNEO0FBTkgsR0FoRlEsRUF3RlI7QUFDRTNCLE1BQUUsRUFBRSxjQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRXhDLGdCQUFZLEVBQUUsQ0FBQ21ELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0JpRyxVQUFVLENBQUNqRyxPQUFPLENBQUNrRyxRQUFULENBQVYsR0FBK0IsR0FIbkU7QUFJRU4sZUFBVyxFQUFFLENBQUM3RixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDOUIsVUFBSSxDQUFDRCxJQUFJLENBQUMySCxPQUFWLEVBQ0U7QUFDRixVQUFJLENBQUMzSCxJQUFJLENBQUMySCxPQUFMLENBQWExSCxPQUFPLENBQUNxQyxNQUFyQixDQUFMLEVBQ0U7QUFDRixhQUFPO0FBQ0xaLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BRFQ7QUFFTHdELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ3FGO0FBRlgsT0FBUDtBQUlEO0FBYkgsR0F4RlE7QUFqQ0csQ0FBZixFOztDQ0pBOztBQUNBLDRDQUFlO0FBQ2JwQixRQUFNLEVBQUVDLGdEQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVix5QkFBcUIsTUFEWDtBQUVWLHlCQUFxQixNQUZYO0FBR1YsMkJBQXVCLE1BSGI7QUFJViw2QkFBeUIsTUFKZjtBQUtWLDZCQUF5QixNQUxmO0FBTVYsMEJBQXNCLE1BTlo7QUFPViwyQkFBdUIsTUFQYjtBQVFWLHVCQUFtQixNQVJUO0FBU1YsMkJBQXVCLE1BVGI7QUFVVixrQkFBYyxNQVZKO0FBV1Ysb0JBQWdCLE1BWE47QUFZVixvQkFBZ0I7QUFaTixHQUZDO0FBZ0JiTyxXQUFTLEVBQUU7QUFDVCwwQkFBc0IsTUFEYjtBQUVULDhCQUEwQixNQUZqQjtBQUdULDhCQUEwQixNQUhqQjtBQUlULHlCQUFxQjtBQUpaO0FBaEJFLENBQWYsRTs7Q0NEQTs7QUFDQSxtREFBZTtBQUNiN0IsUUFBTSxFQUFFQyxvRkFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsMkJBQXVCLE1BRGI7QUFFViw0QkFBd0IsTUFGZDtBQUdWLDRCQUF3QixNQUhkO0FBSVYsc0NBQWtDLE1BSnhCO0FBS1Ysc0NBQWtDLE1BTHhCO0FBTVYsa0NBQThCLE1BTnBCO0FBT1Ysa0NBQThCLE1BUHBCO0FBUVYsa0NBQThCLE1BUnBCO0FBU1Ysa0NBQThCLE1BVHBCO0FBVVYsa0NBQThCLE1BVnBCO0FBV1Ysa0NBQThCLE1BWHBCO0FBWVYsa0NBQThCLE1BWnBCO0FBYVYsa0NBQThCLE1BYnBCO0FBY1YsMkJBQXVCLE1BZGI7QUFlViw4QkFBMEIsTUFmaEI7QUFnQlYsOEJBQTBCLE1BaEJoQjtBQWlCViw4QkFBMEIsTUFqQmhCO0FBa0JWLDhCQUEwQixNQWxCaEI7QUFtQlYsOEJBQTBCLE1BbkJoQjtBQW9CViw4QkFBMEIsTUFwQmhCO0FBcUJWLDhCQUEwQixNQXJCaEI7QUFzQlYsOEJBQTBCLE1BdEJoQjtBQXVCVix3QkFBb0IsTUF2QlY7QUF3QlYsd0JBQW9CLE1BeEJWO0FBeUJWLHdCQUFvQixNQXpCVjtBQTBCVix3QkFBb0I7QUExQlY7QUFGQyxDQUFmLEU7O0NDREE7O0FBQ0EsZ0RBQWU7QUFDYnRCLFFBQU0sRUFBRUMsc0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLHFCQUFpQixNQURQO0FBRVYseUJBQXFCLE1BRlg7QUFJViwwQkFBc0IsTUFKWjtBQUtWLDBCQUFzQixNQUxaO0FBTVYsMEJBQXNCLE1BTlo7QUFPViwwQkFBc0IsTUFQWjtBQVNWLDRCQUF3QixNQVRkO0FBVVYsNEJBQXdCLE1BVmQ7QUFXViw0QkFBd0IsTUFYZDtBQVlWLDRCQUF3QixNQVpkO0FBY1Ysc0JBQWtCLE1BZFI7QUFlVixzQkFBa0IsTUFmUjtBQWdCVixzQkFBa0IsTUFoQlI7QUFpQlYsc0JBQWtCO0FBakJSO0FBRkMsQ0FBZixFOztBQ0hBO0NBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTs7QUFDQSw4Q0FBZTtBQUNidEIsUUFBTSxFQUFFQyw4REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YseUJBQXFCLE1BRFg7QUFDbUI7QUFDN0Isd0JBQW9CLE1BRlY7QUFFa0I7QUFDNUIseUJBQXFCLE1BSFgsQ0FHbUI7O0FBSG5CLEdBRkM7QUFPYkUsWUFBVSxFQUFFO0FBQ1Ysd0JBQW9CLE1BRFY7QUFDa0I7QUFDNUIsOEJBQTBCLE1BRmhCO0FBRXdCO0FBQ2xDLDhCQUEwQixNQUhoQjtBQUd3QjtBQUNsQyw4QkFBMEIsTUFKaEI7QUFJd0I7QUFDbEMsOEJBQTBCLE1BTGhCLENBS3dCOztBQUx4QixHQVBDO0FBY2JDLGlCQUFlLEVBQUU7QUFDZixxQkFBaUIsS0FERixDQUNTOztBQURULEdBZEo7QUFpQmJDLGlCQUFlLEVBQUU7QUFDZix1QkFBbUIsS0FESixDQUNXOztBQURYLEdBakJKO0FBb0JieEIsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSw4QkFETjtBQUVFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFO0FBQU4sS0FBbkIsQ0FGWjtBQUdFa0YsZUFBVyxFQUFFLENBQUN4QixLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQy9CLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUxuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUZUO0FBR0x3RCxjQUFNLEVBQUU7QUFDTjlDLFlBQUUsRUFBRSxhQURFO0FBRU5JLFlBQUUsRUFBRSxnQkFGRTtBQUdOQyxZQUFFLEVBQUUsa0JBSEU7QUFJTkMsWUFBRSxFQUFFLFFBSkU7QUFLTkMsWUFBRSxFQUFFLE1BTEU7QUFNTkMsWUFBRSxFQUFFO0FBTkU7QUFISCxPQUFQO0FBWUQ7QUFoQkgsR0FEUTtBQXBCRyxDQUFmLEU7O0FDYkE7Q0FHQTtBQUNBO0FBRUE7O0FBQ0EscURBQWU7QUFDYlUsUUFBTSxFQUFFQyw0REFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsbUNBQStCLE1BRHJCO0FBQzZCO0FBQ3ZDLCtCQUEyQixNQUZqQjtBQUV5QjtBQUNuQywrQkFBMkIsTUFIakI7QUFHeUI7QUFDbkMsK0JBQTJCLE1BSmpCO0FBSXlCO0FBQ25DLCtCQUEyQixNQUxqQjtBQUt5QjtBQUNuQywrQkFBMkIsTUFOakI7QUFNeUI7QUFDbkMsK0JBQTJCLE1BUGpCO0FBT3lCO0FBQ25DLHdCQUFvQixNQVJWO0FBUWtCO0FBQzVCLHVCQUFtQixNQVRUO0FBU2lCO0FBQzNCLDZCQUF5QixNQVZmO0FBVXVCO0FBQ2pDLDZCQUF5QixNQVhmO0FBV3VCO0FBQ2pDLDZCQUF5QixNQVpmO0FBWXVCO0FBQ2pDLDZCQUF5QixNQWJmO0FBYXVCO0FBQ2pDLDZCQUF5QixNQWRmO0FBY3VCO0FBQ2pDLDZCQUF5QixNQWZmO0FBZXVCO0FBQ2pDLDZCQUF5QixNQWhCZjtBQWdCdUI7QUFDakMsNkJBQXlCLE1BakJmO0FBaUJ1QjtBQUNqQyw2QkFBeUIsTUFsQmY7QUFrQnVCO0FBQ2pDLDhCQUEwQixNQW5CaEI7QUFtQndCO0FBQ2xDLDhCQUEwQixNQXBCaEI7QUFvQndCO0FBQ2xDLDhCQUEwQixNQXJCaEI7QUFxQndCO0FBQ2xDLDhCQUEwQixNQXRCaEI7QUFzQndCO0FBQ2xDLDhCQUEwQixNQXZCaEI7QUF1QndCO0FBQ2xDLDhCQUEwQixNQXhCaEI7QUF3QndCO0FBQ2xDLDhCQUEwQixNQXpCaEI7QUF5QndCO0FBQ2xDLDhCQUEwQixNQTFCaEI7QUEwQndCO0FBQ2xDLDhCQUEwQixNQTNCaEI7QUEyQndCO0FBQ2xDLDhCQUEwQixNQTVCaEI7QUE0QndCO0FBQ2xDLDhCQUEwQixNQTdCaEI7QUE2QndCO0FBQ2xDLDhCQUEwQixNQTlCaEI7QUE4QndCO0FBQ2xDLDhCQUEwQixNQS9CaEI7QUErQndCO0FBQ2xDLDRCQUF3QixNQWhDZDtBQWdDc0I7QUFDaEMsNEJBQXdCLE1BakNkO0FBaUNzQjtBQUNoQyw0QkFBd0IsTUFsQ2Q7QUFrQ3NCO0FBQ2hDLDRCQUF3QixNQW5DZDtBQW1Dc0I7QUFDaEMsNEJBQXdCLE1BcENkO0FBb0NzQjtBQUNoQywyQkFBdUIsTUFyQ2I7QUFxQ3FCO0FBQy9CLHlCQUFxQixNQXRDWDtBQXNDbUI7QUFDN0IsaUNBQTZCLE1BdkNuQixDQXVDMkI7O0FBdkMzQixHQUZDO0FBMkNiRSxZQUFVLEVBQUU7QUFDVixnQ0FBNEIsTUFEbEI7QUFDMEI7QUFDcEMsMkJBQXVCLE1BRmI7QUFFcUI7QUFDL0IsMkJBQXVCLE1BSGI7QUFHcUI7QUFDL0IsbUNBQStCLE1BSnJCLENBSTZCOztBQUo3QixHQTNDQztBQWlEYkQsV0FBUyxFQUFFO0FBQ1QsNEJBQXdCLE1BRGY7QUFDdUI7QUFDaEMsNEJBQXdCLE1BRmYsQ0FFdUI7O0FBRnZCLEdBakRFO0FBcURiRyxpQkFBZSxFQUFFO0FBQ2YsdUJBQW1CLEtBREosQ0FDVzs7QUFEWCxHQXJESjtBQXdEYnhCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsZ0JBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRTtBQUFOLEtBQW5CLENBRlo7QUFHRWtGLGVBQVcsRUFBRSxDQUFDeEIsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMvQixhQUFPO0FBQ0w0QyxZQUFJLEVBQUUsTUFERDtBQUVMbkIsWUFBSSxFQUFFekIsT0FBTyxDQUFDcUMsTUFGVDtBQUdMd0QsY0FBTSxFQUFFO0FBQ045QyxZQUFFLEVBQUUsbUJBREU7QUFFTkksWUFBRSxFQUFFLHNCQUZFO0FBR05FLFlBQUUsRUFBRSxVQUhFO0FBSU5DLFlBQUUsRUFBRSxNQUpFO0FBS05DLFlBQUUsRUFBRTtBQUxFO0FBSEgsT0FBUDtBQVdEO0FBZkgsR0FEUTtBQXhERyxDQUFmLEU7O0NDTEE7O0FBQ0Esa0RBQWU7QUFDYlUsUUFBTSxFQUFFQyw4Q0FESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsdUJBQW1CLE1BRFQ7QUFDaUI7QUFDM0IsNkJBQXlCLE1BRmY7QUFFdUI7QUFDakMsNkJBQXlCLE1BSGY7QUFHdUI7QUFDakMsNkJBQXlCLE1BSmY7QUFJdUI7QUFDakMsNkJBQXlCLE1BTGY7QUFLdUI7QUFDakMsNkJBQXlCLE1BTmY7QUFNdUI7QUFDakMsNkJBQXlCLE1BUGY7QUFPdUI7QUFDakMscUJBQWlCLE1BUlA7QUFRZTtBQUN6QixzQkFBa0IsTUFUUjtBQVNnQjtBQUMxQiwyQkFBdUIsTUFWYjtBQVVxQjtBQUMvQiwyQkFBdUIsTUFYYjtBQVdxQjtBQUMvQiwyQkFBdUIsTUFaYjtBQVlxQjtBQUMvQiwyQkFBdUIsTUFiYjtBQWFxQjtBQUMvQiwyQkFBdUIsTUFkYjtBQWNxQjtBQUMvQiwyQkFBdUIsTUFmYjtBQWVxQjtBQUMvQiwyQkFBdUIsTUFoQmI7QUFnQnFCO0FBQy9CLDJCQUF1QixNQWpCYjtBQWlCcUI7QUFDL0IsMkJBQXVCLE1BbEJiO0FBa0JxQjtBQUMvQiw0QkFBd0IsTUFuQmQ7QUFtQnNCO0FBQ2hDLDRCQUF3QixNQXBCZDtBQW9Cc0I7QUFDaEMsd0JBQW9CLE1BckJWO0FBcUJrQjtBQUM1Qix1QkFBbUIsTUF0QlQsQ0FzQmlCOztBQXRCakIsR0FGQztBQTBCYkMsV0FBUyxFQUFFO0FBQ1QseUJBQXFCLE1BRFo7QUFDb0I7QUFDN0IsMEJBQXNCLE1BRmIsQ0FFcUI7O0FBRnJCO0FBMUJFLENBQWYsRTs7QUNIQTtDQUdBOztBQUNBLCtDQUFlO0FBQ2J2QixRQUFNLEVBQUVDLGdGQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVjtBQUNBLDZCQUF5QixNQUZmO0FBR1Y7QUFDQSx3QkFBb0IsTUFKVjtBQUtWO0FBQ0EsNEJBQXdCO0FBTmQsR0FGQztBQVViRSxZQUFVLEVBQUU7QUFDVjtBQUNBLDJCQUF1QjtBQUZiLEdBVkM7QUFjYkQsV0FBUyxFQUFFO0FBQ1Q7QUFDQSx5QkFBcUI7QUFGWixHQWRFO0FBa0JiTSxXQUFTLEVBQUU7QUFDVDtBQUNBLHlCQUFxQjtBQUZaLEdBbEJFO0FBc0JiRSxVQUFRLEVBQUU7QUFDUjtBQUNBLHdCQUFvQjtBQUZaLEdBdEJHO0FBMEJiN0IsVUFBUSxFQUFFLENBQ1I7QUFDRXpELE1BQUUsRUFBRSxxQkFETjtBQUVFO0FBQ0E7QUFDQUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FKWjtBQUtFNUMsYUFBUyxFQUFFLENBQUN1RCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzdCO0FBQ0EsYUFBT2lHLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBVixHQUErQixFQUF0QztBQUNELEtBUkg7QUFTRTlFLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQkMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFBL0I7QUFBdUNTLFlBQUksRUFBRTlDLE9BQU8sQ0FBQ3FGO0FBQXJELE9BQVA7QUFDRDtBQVhILEdBRFE7QUExQkcsQ0FBZixFOztBQ0pBO0FBRUEsOENBQWU7QUFDYnBCLFFBQU0sRUFBRUMsd0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLCtCQUEyQixNQURqQjtBQUVWO0FBQ0EsNkJBQXlCLE1BSGY7QUFJViwyQkFBdUIsTUFKYjtBQUtWLDhCQUEwQixNQUxoQjtBQU1WLDJCQUF1QjtBQU5iLEdBRkM7QUFVYkUsWUFBVSxFQUFFO0FBQ1YsOEJBQTBCLE1BRGhCO0FBRVYsOEJBQTBCO0FBRmhCLEdBVkM7QUFjYkssV0FBUyxFQUFFO0FBQ1QsK0JBQTJCO0FBRGxCO0FBZEUsQ0FBZixFOztBQ0ZBO0FBRUEsaURBQWU7QUFDYjdCLFFBQU0sRUFBRUMsc0VBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGlDQUE2QixNQURuQjtBQUVWO0FBQ0EsK0JBQTJCLE1BSGpCO0FBSVYsNkJBQXlCLE1BSmY7QUFLVixnQ0FBNEIsTUFMbEI7QUFNVix3QkFBb0IsTUFOVjtBQU9WLDZCQUF5QjtBQVBmLEdBRkM7QUFXYkUsWUFBVSxFQUFFO0FBQ1YsZ0NBQTRCLE1BRGxCO0FBRVYsZ0NBQTRCO0FBRmxCLEdBWEM7QUFlYkssV0FBUyxFQUFFO0FBQ1Q7QUFDQSw4QkFBMEIsTUFGakI7QUFHVCxpQ0FBNkI7QUFIcEI7QUFmRSxDQUFmLEU7O0NDQUE7O0FBQ0EsK0NBQWU7QUFDYjdCLFFBQU0sRUFBRUMsb0RBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLGtDQUE4QixNQURwQjtBQUVWLHFCQUFpQjtBQUZQLEdBRkM7QUFNYkUsWUFBVSxFQUFFO0FBQ1YseUJBQXFCLE1BRFg7QUFFVixnQ0FBNEI7QUFGbEIsR0FOQztBQVViRCxXQUFTLEVBQUU7QUFDVCwyQkFBdUI7QUFEZCxHQVZFO0FBYWJNLFdBQVMsRUFBRTtBQUNULCtCQUEyQjtBQURsQjtBQWJFLENBQWYsRTs7QUNIQTtBQUNBO0FBRUE7QUFFQSwrQ0FBZTtBQUNiN0IsUUFBTSxFQUFFQyxnRUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsZ0NBQTRCLE1BRGxCO0FBRVYsZ0NBQTRCLE1BRmxCO0FBR1YsZ0NBQTRCLE1BSGxCO0FBSVYsZ0NBQTRCLE1BSmxCO0FBS1YsZ0NBQTRCLE1BTGxCO0FBTVYsMkJBQXVCLE1BTmI7QUFPViwyQkFBdUIsTUFQYjtBQVFWLDRCQUF3QixNQVJkO0FBU1YsNEJBQXdCLE1BVGQ7QUFVViw4QkFBMEIsTUFWaEI7QUFXVixnQ0FBNEI7QUFYbEIsR0FGQztBQWViRSxZQUFVLEVBQUU7QUFDVjtBQUNBLHFCQUFpQjtBQUZQLEdBZkM7QUFtQmJELFdBQVMsRUFBRTtBQUNUO0FBQ0EsK0JBQTJCO0FBRmxCLEdBbkJFO0FBdUJiTSxXQUFTLEVBQUU7QUFDVCw2QkFBeUIsTUFEaEI7QUFFVCx1Q0FBbUM7QUFGMUIsR0F2QkU7QUEyQmIzQixVQUFRLEVBQUUsQ0FDUjtBQUNFekQsTUFBRSxFQUFFLHNCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRW5GLG1CQUFlLEVBQUUsQ0FIbkI7QUFJRUMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDbUY7QUFBckQsT0FBUDtBQUNEO0FBTkgsR0FEUTtBQTNCRyxDQUFmLEU7O0FDTEE7Q0FHQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7O0FBRUEsMENBQWU7QUFDYmxCLFFBQU0sRUFBRUMsNERBREs7QUFFYnFCLFlBQVUsRUFBRTtBQUNWLDRCQUF3QixNQURkO0FBQ3NCO0FBQ2hDLDhCQUEwQixNQUZoQjtBQUV3QjtBQUNsQywrQkFBMkIsTUFIakI7QUFHeUI7QUFDbkMsZ0NBQTRCLE1BSmxCO0FBSTBCO0FBQ3BDLCtCQUEyQixNQUxqQjtBQUt5QjtBQUNuQyx3QkFBb0IsTUFOVjtBQU1rQjtBQUM1QixxQkFBaUIsTUFQUDtBQVFWLDZCQUF5QixNQVJmO0FBUXVCO0FBQ2pDLDZCQUF5QixNQVRmO0FBU3VCO0FBQ2pDLHdCQUFvQixNQVZWO0FBV1Ysc0JBQWtCO0FBWFIsR0FGQztBQWViRyxpQkFBZSxFQUFFO0FBQ2YsdUJBQW1CO0FBREosR0FmSjtBQWtCYnZCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUsdUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFeEMsZ0JBQVksRUFBRSxDQUFDbUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQmlHLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBVixHQUErQixHQUhuRTtBQUlFTixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUE5QjtBQUFzQ3dELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ3FGO0FBQXRELE9BQVA7QUFDRDtBQU5ILEdBRFE7QUFsQkcsQ0FBZixFOztBQ1hBO0NBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2Q0FBZTtBQUNicEIsUUFBTSxFQUFFQywwRUFESztBQUVicUIsWUFBVSxFQUFFO0FBQ1YsOEJBQTBCLE1BRGhCO0FBQ3dCO0FBQ2xDLGdDQUE0QixNQUZsQjtBQUUwQjtBQUNwQyxpQ0FBNkIsTUFIbkI7QUFHMkI7QUFDckMsa0NBQThCLE1BSnBCO0FBSTRCO0FBQ3RDLGlDQUE2QixNQUxuQjtBQUsyQjtBQUNyQywwQkFBc0IsTUFOWjtBQU1vQjtBQUM5Qix1QkFBbUIsTUFQVDtBQVFWLDZCQUF5QixNQVJmLENBUXVCOztBQVJ2QixHQUZDO0FBWWJDLFdBQVMsRUFBRTtBQUNULGdDQUE0QixNQURuQjtBQUMyQjtBQUNwQywwQkFBc0IsTUFGYjtBQUVxQjtBQUM5QixnQ0FBNEIsTUFIbkIsQ0FHMkI7O0FBSDNCLEdBWkU7QUFpQmJFLGlCQUFlLEVBQUU7QUFDZix5QkFBcUIsS0FETjtBQUNhO0FBQzVCLHlCQUFxQixLQUZOLENBRWE7O0FBRmIsR0FqQko7QUFxQmJNLFVBQVEsRUFBRTtBQUNSLDZCQUF5QjtBQURqQixHQXJCRztBQXdCYjdCLFVBQVEsRUFBRSxDQUNSO0FBQ0V6RCxNQUFFLEVBQUUseUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFeEMsZ0JBQVksRUFBRSxDQUFDbUQsS0FBRCxFQUFRcEUsT0FBUixLQUFvQmlHLFVBQVUsQ0FBQ2pHLE9BQU8sQ0FBQ2tHLFFBQVQsQ0FBVixHQUErQixHQUhuRTtBQUlFTixlQUFXLEVBQUUsQ0FBQ3hCLEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDL0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JuQixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQUE5QjtBQUFzQ3dELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ3FGO0FBQXRELE9BQVA7QUFDRDtBQU5ILEdBRFEsRUFTUjtBQUNFM0UsTUFBRSxFQUFFLGFBRE47QUFFRUUsWUFBUSxFQUFFZ0QseUNBQUEsQ0FBbUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWNrRyxhQUFPLEVBQUU7QUFBdkIsS0FBbkIsQ0FGWjtBQUdFeEYsV0FBTyxFQUFFO0FBQ1B3QixVQUFJLEVBQUUsTUFEQztBQUVQaUQsWUFBTSxFQUFFO0FBQ045QyxVQUFFLEVBQUUsY0FERTtBQUVOSSxVQUFFLEVBQUUsZUFGRTtBQUdOQyxVQUFFLEVBQUUsY0FIRTtBQUlOQyxVQUFFLEVBQUUsVUFKRTtBQUtOQyxVQUFFLEVBQUUsS0FMRTtBQU1OQyxVQUFFLEVBQUU7QUFORTtBQUZEO0FBSFgsR0FUUSxFQXdCUjtBQUNFN0MsTUFBRSxFQUFFLDRCQUROO0FBRUVFLFlBQVEsRUFBRWdELHlDQUFBLENBQW1CO0FBQUVsRCxRQUFFLEVBQUU7QUFBTixLQUFuQixDQUZaO0FBR0VVLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQmlELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ21GO0FBQWhDLE9BQVA7QUFDRDtBQUxILEdBeEJRLEVBK0JSO0FBQ0U7QUFDQXpFLE1BQUUsRUFBRSx3QkFGTjtBQUdFRSxZQUFRLEVBQUVnRCx5Q0FBQSxDQUFtQjtBQUFFbEQsUUFBRSxFQUFFLENBQUMsTUFBRCxFQUFTLE1BQVQ7QUFBTixLQUFuQixDQUhaO0FBSUVVLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQmlELGNBQU0sRUFBRTdGLE9BQU8sQ0FBQ21GO0FBQWhDLE9BQVA7QUFDRDtBQU5ILEdBL0JRO0FBeEJHLENBQWYsRTs7QUNUQTtBQUNBO0NBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDREQUFlO0FBQ2JsQixRQUFNLEVBQUVDLDRFQURLO0FBRWJxQixZQUFVLEVBQUU7QUFDVixrQkFBYyxNQURKO0FBRVYsMEJBQXNCLE1BRlo7QUFHViwwQkFBc0IsTUFIWjtBQUlWLHdCQUFvQixNQUpWO0FBS1YscUJBQWlCLE1BTFA7QUFNViw2QkFBeUIsTUFOZjtBQU9WLDZCQUF5QjtBQVBmLEdBRkM7QUFXYkUsWUFBVSxFQUFFO0FBQ1Ysd0JBQW9CLE1BRFY7QUFFVixtQkFBZSxNQUZMO0FBR1YsdUJBQW1CLE1BSFQ7QUFJViwyQkFBdUIsTUFKYjtBQUtWLDBCQUFzQjtBQUxaLEdBWEM7QUFrQmJELFdBQVMsRUFBRTtBQUNULGlDQUE2QixNQURwQjtBQUVULGlDQUE2QixNQUZwQjtBQUdULHVCQUFtQixNQUhWO0FBSVQsd0JBQW9CLE1BSlg7QUFLVCx1QkFBbUIsTUFMVjtBQU1ULHVCQUFtQixNQU5WO0FBT1Qsd0JBQW9CLE1BUFg7QUFRVCwyQkFBdUIsTUFSZDtBQVNULHdCQUFvQixNQVRYO0FBVVQsK0JBQTJCLE1BVmxCO0FBV1Q7QUFDQSxrQ0FBOEI7QUFackIsR0FsQkU7QUFnQ2JtQixVQUFRLEVBQUU7QUFDUjtBQUNBLGtDQUE4QjtBQUZ0QixHQWhDRztBQW9DYnhDLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQTtBQUNBO0FBQ0F6RCxNQUFFLEVBQUUsYUFKTjtBQUtFRSxZQUFRLEVBQUVnRCxpREFBQSxDQUF1QjtBQUFFbEQsUUFBRSxFQUFFLE1BQU47QUFBYyxTQUFHNEYsdUNBQWtCQTtBQUFuQyxLQUF2QixDQUxaO0FBTUV6RixhQUFTLEVBQUUsQ0FBQ3VELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0JBLE9BQU8sQ0FBQ3FDLE1BQVIsS0FBbUJyQyxPQUFPLENBQUM0QixNQU41RDtBQU9FUixXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUNMNEMsWUFBSSxFQUFFLE1BREQ7QUFFTEMsYUFBSyxFQUFFN0MsT0FBTyxDQUFDcUMsTUFGVjtBQUdMUyxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLHVCQURBO0FBRUpJLFlBQUUsRUFBRSw0QkFGQTtBQUdKQyxZQUFFLEVBQUUsdUJBSEE7QUFJSkMsWUFBRSxFQUFFLE1BSkE7QUFLSkMsWUFBRSxFQUFFO0FBTEE7QUFIRCxPQUFQO0FBV0Q7QUFuQkgsR0FEUSxFQXNCUjtBQUNFNUMsTUFBRSxFQUFFLFlBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFckMsV0FBTyxFQUFFLENBQUNnRCxLQUFELEVBQVFwRSxPQUFSLEtBQW9CO0FBQzNCLGFBQU87QUFBRTRDLFlBQUksRUFBRSxNQUFSO0FBQWdCQyxhQUFLLEVBQUU3QyxPQUFPLENBQUNxQyxNQUEvQjtBQUF1Q1MsWUFBSSxFQUFFOUMsT0FBTyxDQUFDcUY7QUFBckQsT0FBUDtBQUNEO0FBTEgsR0F0QlEsRUE2QlI7QUFDRTNFLE1BQUUsRUFBRSxxQkFETjtBQUVFRSxZQUFRLEVBQUVnRCx1Q0FBQSxDQUFrQjtBQUFFaEMsWUFBTSxFQUFFLFdBQVY7QUFBdUJsQixRQUFFLEVBQUU7QUFBM0IsS0FBbEIsQ0FGWjtBQUdFSSxPQUFHLEVBQUUsQ0FBQ2YsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQ3RCRCxVQUFJLENBQUN3TCxVQUFMLEdBQWtCeEwsSUFBSSxDQUFDd0wsVUFBTCxJQUFtQixFQUFyQztBQUNBeEwsVUFBSSxDQUFDd0wsVUFBTCxDQUFnQnZMLE9BQU8sQ0FBQ0MsUUFBeEIsSUFBb0NELE9BQU8sQ0FBQ3FDLE1BQTVDO0FBQ0Q7QUFOSCxHQTdCUSxFQXFDUjtBQUNFM0IsTUFBRSxFQUFFLDBCQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRWxGLFdBQU8sRUFBRSxDQUFDckIsSUFBRCxFQUFPQyxPQUFQLEtBQW1CO0FBQzFCLGFBQU87QUFDTDRDLFlBQUksRUFBRSxNQUREO0FBRUw7QUFDQW5CLFlBQUksRUFBRTFCLElBQUksQ0FBQ3dMLFVBQUwsR0FBa0J4TCxJQUFJLENBQUN3TCxVQUFMLENBQWdCdkwsT0FBTyxDQUFDQyxRQUF4QixDQUFsQixHQUFzRHVMLFNBSHZEO0FBSUwxSSxZQUFJLEVBQUU7QUFDSkMsWUFBRSxFQUFFLFlBREE7QUFFSkksWUFBRSxFQUFFLFdBRkE7QUFHSkMsWUFBRSxFQUFFLGNBSEE7QUFJSkMsWUFBRSxFQUFFLFNBSkE7QUFLSkMsWUFBRSxFQUFFO0FBTEE7QUFKRCxPQUFQO0FBWUQ7QUFoQkgsR0FyQ1EsRUF1RFI7QUFDRTVDLE1BQUUsRUFBRSxjQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVsRCxRQUFFLEVBQUUsTUFBTjtBQUFjLFNBQUc0Rix1Q0FBa0JBO0FBQW5DLEtBQXZCLENBRlo7QUFHRXpGLGFBQVMsRUFBRSxDQUFDZCxJQUFELEVBQU9DLE9BQVAsS0FBbUIsQ0FBQ0QsSUFBSSxDQUFDSSxLQUFMLENBQVdzTCxNQUFYLENBQWtCekwsT0FBTyxDQUFDcUMsTUFBMUIsQ0FIakM7QUFJRWpCLFdBQU8sRUFBRSxDQUFDZ0QsS0FBRCxFQUFRcEUsT0FBUixLQUFvQjtBQUMzQixhQUFPO0FBQUU0QyxZQUFJLEVBQUUsTUFBUjtBQUFnQm5CLFlBQUksRUFBRXpCLE9BQU8sQ0FBQ3FDLE1BQTlCO0FBQXNDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUNtRjtBQUFwRCxPQUFQO0FBQ0Q7QUFOSCxHQXZEUSxFQStEUjtBQUNFekUsTUFBRSxFQUFFLG1CQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRTNDLE9BQUcsRUFBRSxDQUFDZixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDdEJELFVBQUksQ0FBQzJMLFdBQUwsR0FBbUIzTCxJQUFJLENBQUMyTCxXQUFMLElBQW9CLEVBQXZDO0FBQ0EzTCxVQUFJLENBQUMyTCxXQUFMLENBQWlCMUwsT0FBTyxDQUFDcUMsTUFBekIsSUFBbUMsSUFBbkM7QUFDRDtBQU5ILEdBL0RRLEVBdUVSO0FBQ0UzQixNQUFFLEVBQUUsbUJBRE47QUFFRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRUgsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FGWjtBQUdFM0MsT0FBRyxFQUFFLENBQUNmLElBQUQsRUFBT0MsT0FBUCxLQUFtQjtBQUN0QkQsVUFBSSxDQUFDMkwsV0FBTCxHQUFtQjNMLElBQUksQ0FBQzJMLFdBQUwsSUFBb0IsRUFBdkM7QUFDQTNMLFVBQUksQ0FBQzJMLFdBQUwsQ0FBaUIxTCxPQUFPLENBQUNxQyxNQUF6QixJQUFtQyxLQUFuQztBQUNEO0FBTkgsR0F2RVEsRUErRVI7QUFDRTNCLE1BQUUsRUFBRSxjQUROO0FBRUVFLFlBQVEsRUFBRWdELGlEQUFBLENBQXVCO0FBQUVILGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBRlo7QUFHRXhDLGdCQUFZLEVBQUUsQ0FBQ21ELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0JpRyxVQUFVLENBQUNqRyxPQUFPLENBQUNrRyxRQUFULENBQVYsR0FBK0IsR0FIbkU7QUFJRU4sZUFBVyxFQUFFLENBQUM3RixJQUFELEVBQU9DLE9BQVAsS0FBbUI7QUFDOUIsVUFBSSxDQUFDRCxJQUFJLENBQUMyTCxXQUFWLEVBQ0U7QUFDRixVQUFJLENBQUMzTCxJQUFJLENBQUMyTCxXQUFMLENBQWlCMUwsT0FBTyxDQUFDcUMsTUFBekIsQ0FBTCxFQUNFO0FBQ0YsYUFBTztBQUNMWixZQUFJLEVBQUV6QixPQUFPLENBQUNxQyxNQURUO0FBRUx3RCxjQUFNLEVBQUU3RixPQUFPLENBQUNxRjtBQUZYLE9BQVA7QUFJRDtBQWJILEdBL0VRLEVBOEZSO0FBQ0U7QUFDQTtBQUNBM0UsTUFBRSxFQUFFLGNBSE47QUFJRUUsWUFBUSxFQUFFZ0QsaURBQUEsQ0FBdUI7QUFBRWxELFFBQUUsRUFBRSxNQUFOO0FBQWMsU0FBRzRGLHVDQUFrQkE7QUFBbkMsS0FBdkIsQ0FKWjtBQUtFbkYsbUJBQWUsRUFBRSxDQUxuQjtBQU1FQyxXQUFPLEVBQUUsQ0FBQ2dELEtBQUQsRUFBUXBFLE9BQVIsS0FBb0I7QUFDM0IsYUFBTztBQUFFNEMsWUFBSSxFQUFFLE1BQVI7QUFBZ0JDLGFBQUssRUFBRTdDLE9BQU8sQ0FBQ3FDLE1BQS9CO0FBQXVDUyxZQUFJLEVBQUU5QyxPQUFPLENBQUM0QjtBQUFyRCxPQUFQO0FBQ0Q7QUFSSCxHQTlGUTtBQXBDRyxDQUFmLEU7O0FDckJ1QztBQUNFO0FBQ0g7QUFDUztBQUNBO0FBQ0Q7QUFDQztBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ29CO0FBQ2hCO0FBQ0M7QUFDTjtBQUNYO0FBQ1E7QUFDSztBQUNEO0FBQ0c7QUFDQTtBQUNFO0FBQ1Y7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQztBQUNNO0FBQ0Y7QUFDRTtBQUNnQjtBQUNBO0FBQ0g7QUFDQTtBQUNXO0FBQ2Q7QUFDVDtBQUNTO0FBQ1A7QUFDTTtBQUNFO0FBQ0o7QUFDQztBQUNQO0FBQ0M7QUFDSTtBQUNJO0FBQ1I7QUFDTztBQUNPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNjO0FBQ0g7QUFDRztBQUNIO0FBQ047QUFDSDtBQUNPO0FBQ0g7QUFDRjtBQUNPO0FBQ0g7QUFDSDtBQUNEO0FBQ0c7QUFDRjtBQUNBO0FBQ0w7QUFDRztBQUNrQjs7QUFFaEUscURBQWUsQ0FBQyxvQkFBb0IsS0FBSyx1QkFBdUIsT0FBSyxvQkFBb0IsSUFBSyw2QkFBNkIsUUFBSyw2QkFBNkIsUUFBSyw0QkFBNEIsT0FBSyw2QkFBNkIsUUFBSyw2QkFBNkIsUUFBSyw2QkFBNkIsUUFBSyw2QkFBNkIsUUFBSyxtQ0FBbUMsWUFBTSx1REFBdUQsaUNBQU0sdUNBQXVDLGlCQUFNLHdDQUF3QyxrQkFBTSxrQ0FBa0MsWUFBTSx1QkFBdUIsSUFBTSwrQkFBK0IsU0FBTSxvQ0FBb0MsY0FBTSxtQ0FBbUMsYUFBTSxzQ0FBc0MsZ0JBQU0sc0NBQXNDLGdCQUFNLHdDQUF3QyxrQkFBTSw4QkFBOEIsUUFBTSxzQkFBc0IsR0FBTSxzQkFBc0IsR0FBTSxzQkFBc0IsR0FBTSxzQkFBc0IsR0FBTSxzQkFBc0IsR0FBTSxzQkFBc0IsR0FBTSx1QkFBdUIsSUFBTSw2QkFBNkIsU0FBTSwyQkFBMkIsT0FBTSw2QkFBNkIsU0FBTSw2Q0FBNkMsc0JBQU0sNkNBQTZDLHNCQUFNLDBDQUEwQyxrQkFBTSwwQ0FBMEMsa0JBQU0scURBQXFELDZCQUFNLHVDQUF1QyxnQkFBTSw4QkFBOEIsT0FBTSx1Q0FBdUMsZ0JBQU0sZ0NBQWdDLFNBQU0sc0NBQXNDLGVBQU0sd0NBQXdDLGlCQUFNLG9DQUFvQyxhQUFNLHFDQUFxQyxjQUFNLDhCQUE4QixPQUFNLCtCQUErQixRQUFNLG1DQUFtQyxZQUFNLHVDQUF1QyxnQkFBTSwrQkFBK0IsUUFBTSxzQ0FBc0MsZ0JBQU0sNkNBQTZDLHVCQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHNDQUFzQyxpQkFBTSxtQ0FBbUMsY0FBTSxzQ0FBc0MsaUJBQU0sbUNBQW1DLGNBQU0sNkJBQTZCLFFBQU0sMEJBQTBCLEtBQU0saUNBQWlDLFlBQU0sOEJBQThCLFNBQU0sNEJBQTRCLE9BQU0sbUNBQW1DLGNBQU0sZ0NBQWdDLFdBQU0sNkJBQTZCLFFBQU0sNEJBQTRCLE9BQU0sK0JBQStCLFVBQU0sNkJBQTZCLFFBQU0sNkJBQTZCLFFBQU0sd0JBQXdCLEdBQU0sMkJBQTJCLE1BQU0sNkNBQTZDLHFCQUFNLEVBQUUsRSIsImZpbGUiOiJ1aS9jb21tb24vb29wc3lyYWlkc3lfZGF0YS5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gQWJpbGl0aWVzIHNlZW0gaW5zdGFudC5cclxuY29uc3QgYWJpbGl0eUNvbGxlY3RTZWNvbmRzID0gMC41O1xyXG4vLyBPYnNlcnZhdGlvbjogdXAgdG8gfjEuMiBzZWNvbmRzIGZvciBhIGJ1ZmYgdG8gcm9sbCB0aHJvdWdoIHRoZSBwYXJ0eS5cclxuY29uc3QgZWZmZWN0Q29sbGVjdFNlY29uZHMgPSAyLjA7XHJcblxyXG5jb25zdCBpc0luUGFydHlDb25kaXRpb25GdW5jID0gKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICBpZiAoZGF0YS5wYXJ0eS5wYXJ0eUlkcy5pbmNsdWRlcyhzb3VyY2VJZCkpXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgaWYgKGRhdGEucGV0SWRUb093bmVySWQpIHtcclxuICAgIGNvbnN0IG93bmVySWQgPSBkYXRhLnBldElkVG9Pd25lcklkW3NvdXJjZUlkXTtcclxuICAgIGlmIChvd25lcklkICYmIGRhdGEucGFydHkucGFydHlJZHMuaW5jbHVkZXMob3duZXJJZCkpXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuLy8gYXJnczogdHJpZ2dlcklkLCBuZXRSZWdleCwgZmllbGQsIHR5cGUsIGlnbm9yZVNlbGZcclxuY29uc3QgbWlzc2VkRnVuYyA9IChhcmdzKSA9PiBbXHJcbiAge1xyXG4gICAgLy8gU3VyZSwgbm90IGFsbCBvZiB0aGVzZSBhcmUgXCJidWZmc1wiIHBlciBzZSwgYnV0IHRoZXkncmUgYWxsIGluIHRoZSBidWZmcyBmaWxlLlxyXG4gICAgaWQ6IGBCdWZmICR7YXJncy50cmlnZ2VySWR9IENvbGxlY3RgLFxyXG4gICAgbmV0UmVnZXg6IGFyZ3MubmV0UmVnZXgsXHJcbiAgICBjb25kaXRpb246IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMsXHJcbiAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24gfHwge307XHJcbiAgICAgIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXSA9IGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXSB8fCBbXTtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdLnB1c2gobWF0Y2hlcyk7XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6IGBCdWZmICR7YXJncy50cmlnZ2VySWR9YCxcclxuICAgIG5ldFJlZ2V4OiBhcmdzLm5ldFJlZ2V4LFxyXG4gICAgY29uZGl0aW9uOiBpc0luUGFydHlDb25kaXRpb25GdW5jLFxyXG4gICAgZGVsYXlTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzLFxyXG4gICAgc3VwcHJlc3NTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzLFxyXG4gICAgbWlzdGFrZTogKGRhdGEsIF9tYXRjaGVzKSA9PiB7XHJcbiAgICAgIGlmICghZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24pXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjb25zdCBhbGxNYXRjaGVzID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdO1xyXG4gICAgICBpZiAoIWFsbE1hdGNoZXMpXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgcGFydHlOYW1lcyA9IGRhdGEucGFydHkucGFydHlOYW1lcztcclxuXHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIGRlYWQgcGVvcGxlIHNvbWVob3dcclxuICAgICAgY29uc3QgZ290QnVmZk1hcCA9IHt9O1xyXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgcGFydHlOYW1lcylcclxuICAgICAgICBnb3RCdWZmTWFwW25hbWVdID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCBmaXJzdE1hdGNoID0gYWxsTWF0Y2hlc1swXTtcclxuICAgICAgbGV0IHNvdXJjZU5hbWUgPSBmaXJzdE1hdGNoLnNvdXJjZTtcclxuICAgICAgLy8gQmxhbWUgcGV0IG1pc3Rha2VzIG9uIG93bmVycy5cclxuICAgICAgaWYgKGRhdGEucGV0SWRUb093bmVySWQpIHtcclxuICAgICAgICBjb25zdCBwZXRJZCA9IGZpcnN0TWF0Y2guc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBvd25lcklkID0gZGF0YS5wZXRJZFRvT3duZXJJZFtwZXRJZF07XHJcbiAgICAgICAgaWYgKG93bmVySWQpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmFtZSA9IGRhdGEucGFydHkubmFtZUZyb21JZChvd25lcklkKTtcclxuICAgICAgICAgIGlmIChvd25lck5hbWUpXHJcbiAgICAgICAgICAgIHNvdXJjZU5hbWUgPSBvd25lck5hbWU7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkbid0IGZpbmQgbmFtZSBmb3IgJHtvd25lcklkfSBmcm9tIHBldCAke3BldElkfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFyZ3MuaWdub3JlU2VsZilcclxuICAgICAgICBnb3RCdWZmTWFwW3NvdXJjZU5hbWVdID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHRoaW5nTmFtZSA9IGZpcnN0TWF0Y2hbYXJncy5maWVsZF07XHJcbiAgICAgIGZvciAoY29uc3QgbWF0Y2hlcyBvZiBhbGxNYXRjaGVzKSB7XHJcbiAgICAgICAgLy8gSW4gY2FzZSB5b3UgaGF2ZSBtdWx0aXBsZSBwYXJ0eSBtZW1iZXJzIHdobyBoaXQgdGhlIHNhbWUgY29vbGRvd24gYXQgdGhlIHNhbWVcclxuICAgICAgICAvLyB0aW1lIChsb2w/KSwgdGhlbiBpZ25vcmUgYW55Ym9keSB3aG8gd2Fzbid0IHRoZSBmaXJzdC5cclxuICAgICAgICBpZiAobWF0Y2hlcy5zb3VyY2UgIT09IGZpcnN0TWF0Y2guc291cmNlKVxyXG4gICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWlzc2VkID0gT2JqZWN0LmtleXMoZ290QnVmZk1hcCkuZmlsdGVyKCh4KSA9PiAhZ290QnVmZk1hcFt4XSk7XHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoID09PSAwKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIC8vIFRPRE86IG9vcHN5IGNvdWxkIHJlYWxseSB1c2UgbW91c2VvdmVyIHBvcHVwcyBmb3IgZGV0YWlscy5cclxuICAgICAgLy8gVE9ETzogYWx0ZXJuYXRpdmVseSwgaWYgd2UgaGF2ZSBhIGRlYXRoIHJlcG9ydCwgaXQnZCBiZSBnb29kIHRvXHJcbiAgICAgIC8vIGV4cGxpY2l0bHkgY2FsbCBvdXQgdGhhdCBvdGhlciBwZW9wbGUgZ290IGEgaGVhbCB0aGlzIHBlcnNvbiBkaWRuJ3QuXHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoIDwgNCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiBhcmdzLnR5cGUsXHJcbiAgICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IHRoaW5nTmFtZSArICcgbWlzc2VkICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSxcclxuICAgICAgICAgICAgZGU6IHRoaW5nTmFtZSArICcgdmVyZmVobHQgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpLFxyXG4gICAgICAgICAgICBmcjogdGhpbmdOYW1lICsgJyBtYW5xdcOpKGUpIHN1ciAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyksXHJcbiAgICAgICAgICAgIGphOiAnKCcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSArICcpIOOBjCcgKyB0aGluZ05hbWUgKyAn44KS5Y+X44GR44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgICAgY246IG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJyDmsqHlj5fliLAgJyArIHRoaW5nTmFtZSxcclxuICAgICAgICAgICAga286IHRoaW5nTmFtZSArICcgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJ+yXkOqyjCDsoIHsmqnslYjrkKgnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIC8vIElmIHRoZXJlJ3MgdG9vIG1hbnkgcGVvcGxlLCBqdXN0IGxpc3QgdGhlIG51bWJlciBvZiBwZW9wbGUgbWlzc2VkLlxyXG4gICAgICAvLyBUT0RPOiB3ZSBjb3VsZCBhbHNvIGxpc3QgZXZlcnlib2R5IG9uIHNlcGFyYXRlIGxpbmVzP1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IGFyZ3MudHlwZSxcclxuICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogdGhpbmdOYW1lICsgJyBtaXNzZWQgJyArIG1pc3NlZC5sZW5ndGggKyAnIHBlb3BsZScsXHJcbiAgICAgICAgICBkZTogdGhpbmdOYW1lICsgJyB2ZXJmZWhsdGUgJyArIG1pc3NlZC5sZW5ndGggKyAnIFBlcnNvbmVuJyxcclxuICAgICAgICAgIGZyOiB0aGluZ05hbWUgKyAnIG1hbnF1w6koZSkgc3VyICcgKyBtaXNzZWQubGVuZ3RoICsgJyBwZXJzb25uZXMnLFxyXG4gICAgICAgICAgamE6IG1pc3NlZC5sZW5ndGggKyAn5Lq644GMJyArIHRoaW5nTmFtZSArICfjgpLlj5fjgZHjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgY246ICfmnIknICsgbWlzc2VkLmxlbmd0aCArICfkurrmsqHlj5fliLAgJyArIHRoaW5nTmFtZSxcclxuICAgICAgICAgIGtvOiB0aGluZ05hbWUgKyAnICcgKyBtaXNzZWQubGVuZ3RoICsgJ+uqheyXkOqyjCDsoIHsmqnslYjrkKgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICBpZiAoZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24pXHJcbiAgICAgICAgZGVsZXRlIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXTtcclxuICAgIH0sXHJcbiAgfSxcclxuXTtcclxuXHJcbmNvbnN0IG1pc3NlZE1pdGlnYXRpb25CdWZmID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuZWZmZWN0SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGVmZmVjdElkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6IGFyZ3MuZWZmZWN0SWQgfSksXHJcbiAgICBmaWVsZDogJ2VmZmVjdCcsXHJcbiAgICB0eXBlOiAnaGVhbCcsXHJcbiAgICBpZ25vcmVTZWxmOiBhcmdzLmlnbm9yZVNlbGYsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBlZmZlY3RDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZERhbWFnZUFiaWxpdHkgPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHlJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgZmllbGQ6ICdhYmlsaXR5JyxcclxuICAgIHR5cGU6ICdkYW1hZ2UnLFxyXG4gICAgaWdub3JlU2VsZjogYXJncy5pZ25vcmVTZWxmLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogYWJpbGl0eUNvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkSGVhbCA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eUlkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICBmaWVsZDogJ2FiaWxpdHknLFxyXG4gICAgdHlwZTogJ2hlYWwnLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogYWJpbGl0eUNvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkgPSBtaXNzZWRIZWFsO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQnVmZiBQZXQgVG8gT3duZXIgTWFwcGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnRGdWxsKCksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAobWF0Y2hlcy5vd25lcklkID09PSAnMCcpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWQgPSBkYXRhLnBldElkVG9Pd25lcklkIHx8IHt9O1xyXG4gICAgICAgIC8vIEZpeCBhbnkgbG93ZXJjYXNlIGlkcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkW21hdGNoZXMuaWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLm93bmVySWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQnVmZiBQZXQgVG8gT3duZXIgQ2xlYXJlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmNoYW5nZVpvbmUoKSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIENsZWFyIHRoaXMgaGFzaCBwZXJpb2RpY2FsbHkgc28gaXQgZG9lc24ndCBoYXZlIGZhbHNlIHBvc2l0aXZlcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkID0ge307XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByZWZlciBhYmlsaXRpZXMgdG8gZWZmZWN0cywgYXMgZWZmZWN0cyB0YWtlIGxvbmdlciB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG4gICAgLy8gSG93ZXZlciwgc29tZSB0aGluZ3MgYXJlIG9ubHkgZWZmZWN0cyBhbmQgc28gdGhlcmUgaXMgbm8gY2hvaWNlLlxyXG5cclxuICAgIC8vIEZvciB0aGluZ3MgeW91IGNhbiBzdGVwIGluIG9yIG91dCBvZiwgZ2l2ZSBhIGxvbmdlciB0aW1lcj8gIFRoaXMgaXNuJ3QgcGVyZmVjdC5cclxuICAgIC8vIFRPRE86IGluY2x1ZGUgc29pbCBoZXJlPz9cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdDb2xsZWN0aXZlIFVuY29uc2Npb3VzJywgZWZmZWN0SWQ6ICczNTEnLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcbiAgICAvLyBBcm1zIFVwID0gNDk4IChvdGhlcnMpLCBQYXNzYWdlIE9mIEFybXMgPSA0OTcgKHlvdSkuICBVc2UgYm90aCBpbiBjYXNlIGV2ZXJ5Ym9keSBpcyBtaXNzZWQuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnUGFzc2FnZSBvZiBBcm1zJywgZWZmZWN0SWQ6ICc0OVs3OF0nLCBpZ25vcmVTZWxmOiB0cnVlLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0RpdmluZSBWZWlsJywgZWZmZWN0SWQ6ICcyRDcnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdIZWFydCBPZiBMaWdodCcsIGFiaWxpdHlJZDogJzNGMjAnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0RhcmsgTWlzc2lvbmFyeScsIGFiaWxpdHlJZDogJzQwNTcnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NoYWtlIEl0IE9mZicsIGFiaWxpdHlJZDogJzFDREMnIH0pLFxyXG5cclxuICAgIC8vIDNGNDQgaXMgdGhlIGNvcnJlY3QgUXVhZHJ1cGxlIFRlY2huaWNhbCBGaW5pc2gsIG90aGVycyBhcmUgRGlua3kgVGVjaG5pY2FsIEZpbmlzaC5cclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ1RlY2huaWNhbCBGaW5pc2gnLCBhYmlsaXR5SWQ6ICczRjRbMS00XScgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEaXZpbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBOCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCcm90aGVyaG9vZCcsIGFiaWxpdHlJZDogJzFDRTQnIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIExpdGFueScsIGFiaWxpdHlJZDogJ0RFNScgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdFbWJvbGRlbicsIGFiaWxpdHlJZDogJzFENjAnIH0pLFxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIFZvaWNlJywgYWJpbGl0eUlkOiAnNzYnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC8vIFRvbyBub2lzeSAocHJvY3MgZXZlcnkgdGhyZWUgc2Vjb25kcywgYW5kIGJhcmRzIG9mdGVuIG9mZiBkb2luZyBtZWNoYW5pY3MpLlxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnV2FuZGVyZXJcXCdzIE1pbnVldCcsIGVmZmVjdElkOiAnOEE4JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ01hZ2VcXCdzIEJhbGxhZCcsIGVmZmVjdElkOiAnOEE5JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ0FybXlcXCdzIFBhZW9uJywgZWZmZWN0SWQ6ICc4QUEnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUcm91YmFkb3VyJywgYWJpbGl0eUlkOiAnMUNFRCcgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnVGFjdGljaWFuJywgYWJpbGl0eUlkOiAnNDFGOScgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hpZWxkIFNhbWJhJywgYWJpbGl0eUlkOiAnM0U4QycgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ01hbnRyYScsIGFiaWxpdHlJZDogJzQxJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEZXZvdGlvbicsIGFiaWxpdHlJZDogJzFEMUEnIH0pLFxyXG5cclxuICAgIC8vIE1heWJlIHVzaW5nIGEgaGVhbGVyIExCMS9MQjIgc2hvdWxkIGJlIGFuIGVycm9yIGZvciB0aGUgaGVhbGVyLiBPOilcclxuICAgIC8vIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0hlYWxpbmcgV2luZCcsIGFiaWxpdHlJZDogJ0NFJyB9KSxcclxuICAgIC8vIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0JyZWF0aCBvZiB0aGUgRWFydGgnLCBhYmlsaXR5SWQ6ICdDRicgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhJywgYWJpbGl0eUlkOiAnN0MnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhIElJJywgYWJpbGl0eUlkOiAnODUnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQWZmbGF0dXMgUmFwdHVyZScsIGFiaWxpdHlJZDogJzQwOTYnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnVGVtcGVyYW5jZScsIGFiaWxpdHlJZDogJzc1MScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdQbGVuYXJ5IEluZHVsZ2VuY2UnLCBhYmlsaXR5SWQ6ICcxRDA5JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1B1bHNlIG9mIExpZmUnLCBhYmlsaXR5SWQ6ICdEMCcgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnU3VjY29yJywgYWJpbGl0eUlkOiAnQkEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnSW5kb21pdGFiaWxpdHknLCBhYmlsaXR5SWQ6ICdERkYnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnRGVwbG95bWVudCBUYWN0aWNzJywgYWJpbGl0eUlkOiAnRTAxJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1doaXNwZXJpbmcgRGF3bicsIGFiaWxpdHlJZDogJzMyMycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdGZXkgQmxlc3NpbmcnLCBhYmlsaXR5SWQ6ICc0MEEwJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0NvbnNvbGF0aW9uJywgYWJpbGl0eUlkOiAnNDBBMycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBbmdlbFxcJ3MgV2hpc3BlcicsIGFiaWxpdHlJZDogJzQwQTYnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0ZleSBJbGx1bWluYXRpb24nLCBhYmlsaXR5SWQ6ICczMjUnIH0pLFxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NlcmFwaGljIElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzQwQTcnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQW5nZWwgRmVhdGhlcnMnLCBhYmlsaXR5SWQ6ICcxMDk3JyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnRTExJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FzcGVjdGVkIEhlbGlvcycsIGFiaWxpdHlJZDogJzMyMDAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQ2VsZXN0aWFsIE9wcG9zaXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE5JyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FzdHJhbCBTdGFzaXMnLCBhYmlsaXR5SWQ6ICcxMDk4JyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdXaGl0ZSBXaW5kJywgYWJpbGl0eUlkOiAnMkM4RScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdHb2Jza2luJywgYWJpbGl0eUlkOiAnNDc4MCcgfSksXHJcblxyXG4gICAgLy8gVE9ETzogZXhwb3J0IGFsbCBvZiB0aGVzZSBtaXNzZWQgZnVuY3Rpb25zIGludG8gdGhlaXIgb3duIGhlbHBlclxyXG4gICAgLy8gYW5kIHRoZW4gYWRkIHRoaXMgdG8gdGhlIERlbHVicnVtIFJlZ2luYWUgZmlsZXMgZGlyZWN0bHkuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTG9zdCBBZXRoZXJzaGllbGQnLCBhYmlsaXR5SWQ6ICc1NzUzJyB9KSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gR2VuZXJhbCBtaXN0YWtlczsgdGhlc2UgYXBwbHkgZXZlcnl3aGVyZS5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRyaWdnZXIgaWQgZm9yIGludGVybmFsbHkgZ2VuZXJhdGVkIGVhcmx5IHB1bGwgd2FybmluZy5cclxuICAgICAgaWQ6ICdHZW5lcmFsIEVhcmx5IFB1bGwnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIEZvb2QgQnVmZicsXHJcbiAgICAgIC8vIFdlbGwgRmVkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gUHJldmVudCBcIkVvcyBsb3NlcyB0aGUgZWZmZWN0IG9mIFdlbGwgRmVkIGZyb20gQ3JpdGxvIE1jZ2VlXCJcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2QgPSBkYXRhLmxvc3RGb29kIHx8IHt9O1xyXG4gICAgICAgIC8vIFdlbGwgRmVkIGJ1ZmYgaGFwcGVucyByZXBlYXRlZGx5IHdoZW4gaXQgZmFsbHMgb2ZmIChXSFkpLFxyXG4gICAgICAgIC8vIHNvIHN1cHByZXNzIG11bHRpcGxlIG9jY3VycmVuY2VzLlxyXG4gICAgICAgIGlmICghZGF0YS5pbkNvbWJhdCB8fCBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsb3N0IGZvb2QgYnVmZicsXHJcbiAgICAgICAgICAgIGRlOiAnTmFocnVuZ3NidWZmIHZlcmxvcmVuJyxcclxuICAgICAgICAgICAgZnI6ICdCdWZmIG5vdXJyaXR1cmUgdGVybWluw6llJyxcclxuICAgICAgICAgICAgamE6ICfpo6/lirnmnpzjgYzlpLHjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WkseWOu+mjn+eJqUJVRkYnLFxyXG4gICAgICAgICAgICBrbzogJ+ydjOyLnSDrsoTtlIQg7ZW07KCcJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBXZWxsIEZlZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubG9zdEZvb2QpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFJhYmJpdCBNZWRpdW0nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc4RTAnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLklzUGxheWVySWQobWF0Y2hlcy5zb3VyY2VJZCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy5zb3VyY2UsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnYnVubnknLFxyXG4gICAgICAgICAgICBkZTogJ0hhc2UnLFxyXG4gICAgICAgICAgICBmcjogJ2xhcGluJyxcclxuICAgICAgICAgICAgamE6ICfjgYbjgZXjgY4nLFxyXG4gICAgICAgICAgICBjbjogJ+WFlOWtkCcsXHJcbiAgICAgICAgICAgIGtvOiAn7Yag64G8JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRlc3QgbWlzdGFrZSB0cmlnZ2Vycy5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1pZGRsZUxhTm9zY2VhLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb3cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgYm93IGNvdXJ0ZW91c2x5IHRvIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB2b3VzIGluY2xpbmV6IGRldmFudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644Gr44GK6L6e5YSA44GX44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuaBreaVrOWcsOWvueacqOS6uuihjOekvC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsl5Dqsowg6rO17IaQ7ZWY6rKMIOyduOyCrO2VqeuLiOuLpC4qPycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdwdWxsJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgZnVsbFRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb3cnLFxyXG4gICAgICAgICAgICBkZTogJ0JvZ2VuJyxcclxuICAgICAgICAgICAgZnI6ICdTYWx1ZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OBiui+nuWEgCcsXHJcbiAgICAgICAgICAgIGNuOiAn6Z6g6LqsJyxcclxuICAgICAgICAgICAga286ICfsnbjsgqwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFdpcGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgYmlkIGZhcmV3ZWxsIHRvIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyBmYWl0ZXMgdm9zIGFkaWV1eCBhdSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644Gr5Yil44KM44Gu5oyo5ou244KS44GX44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuWQkeacqOS6uuWRiuWIqy4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsl5Dqsowg7J6R67OEIOyduOyCrOulvCDtlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2lwZScsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIGZ1bGxUZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUGFydHkgV2lwZScsXHJcbiAgICAgICAgICAgIGRlOiAnR3J1cHBlbndpcGUnLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODr+OCpOODlycsXHJcbiAgICAgICAgICAgIGNuOiAn5Zui54GtJyxcclxuICAgICAgICAgICAga286ICftjIzti7Ag7KCE66m4JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb290c2hpbmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZnI6ICdNYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQnLFxyXG4gICAgICAgICAgamE6ICfmnKjkuronLFxyXG4gICAgICAgICAgY246ICfmnKjkuronLFxyXG4gICAgICAgICAga286ICfrgpjrrLTsnbjtmJUnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc3RyaWtpbmdEdW1teU5hbWVzID0gT2JqZWN0LnZhbHVlcyhzdHJpa2luZ0R1bW15QnlMb2NhbGUpO1xyXG4gICAgICAgIHJldHVybiBzdHJpa2luZ0R1bW15TmFtZXMuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYm9vdENvdW50ID0gZGF0YS5ib290Q291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2RhdGEuYm9vdENvdW50fSk6ICR7ZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKX1gO1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBMZWFkZW4gRmlzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc3NDUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnNvdXJjZSA9PT0gZGF0YS5tZSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZ29vZCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IE9vcHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmxpbmUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5wb2tlQ291bnQgPSAoZGF0YS5wb2tlQ291bnQgfHwgMCkgKyAxO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFBva2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gMSBwb2tlIGF0IGEgdGltZSBpcyBmaW5lLCBidXQgbW9yZSB0aGFuIG9uZSBpbiA1IHNlY29uZHMgaXMgKE9CVklPVVNMWSkgYSBtaXN0YWtlLlxyXG4gICAgICAgIGlmICghZGF0YS5wb2tlQ291bnQgfHwgZGF0YS5wb2tlQ291bnQgPD0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgVG9vIG1hbnkgcG9rZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgWnUgdmllbGUgUGlla3NlciAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgZnI6IGBUcm9wIGRlIHRvdWNoZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGphOiBg44GE44Gj44Gx44GE44Gk44Gk44GE44GfICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBjbjogYOaIs+WkquWkmuS4i+WVpiAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAga286IGDrhIjrrLQg66eO7J20IOywjOumhCAoJHtkYXRhLnBva2VDb3VudH3rsogpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEucG9rZUNvdW50LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIElmcml0IFN0b3J5IE1vZGVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJvd2xPZkVtYmVycyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBSYWRpYW50IFBsdW1lJzogJzJERScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdJZnJpdE5tIEluY2luZXJhdGUnOiAnMUM1JyxcclxuICAgICdJZnJpdE5tIEVydXB0aW9uJzogJzJERCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaXRhbiBTdG9yeSBNb2RlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnM0NEJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbk5tIExhbmRzbGlkZSc6ICcyOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBSb2NrIEJ1c3Rlcic6ICcyODEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA4MjMvODI0LzgyNSwgV2F0ZXJzcG91dCA9IDgyOVxyXG5cclxuLy8gTGV2aWF0aGFuIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdMZXZpRXggR3JhbmQgRmFsbCc6ICc4MkYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aUV4IEh5ZHJvIFNob3QnOiAnNzQ4JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlFeCBEcmVhZHN0b3JtJzogJzc0OScsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlFeCBCb2R5IFNsYW0nOiAnODJBJywgLy8gbGV2aSBzbGFtIHRoYXQgdGlsdHMgdGhlIGJvYXRcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAxJzogJzg4QScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAyJzogJzg4QicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAzJzogJzgyQycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlFeCBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlFeCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpRXggQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnODJBJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBTaGl2YSBIYXJkXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBa2hBZmFoQW1waGl0aGVhdHJlSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhSG0gSWNpY2xlIEltcGFjdCc6ICc5OTMnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUhtIEdsYWNpZXIgQmFzaCc6ICc5QTEnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBLbm9ja2JhY2sgdGFuayBjbGVhdmUuXHJcbiAgICAnU2hpdmFIbSBIZWF2ZW5seSBTdHJpa2UnOiAnOUEwJyxcclxuICAgIC8vIEhhaWxzdG9ybSBzcHJlYWQgbWFya2VyLlxyXG4gICAgJ1NoaXZhSG0gSGFpbHN0b3JtJzogJzk5OCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIFRhbmtidXN0ZXIuICBUaGlzIGlzIFNoaXZhIEhhcmQgbW9kZSwgbm90IFNoaXZhIEV4dHJlbWUuICBQbGVhc2UhXHJcbiAgICAnU2hpdmFIbSBJY2VicmFuZCc6ICc5OTYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUhtIERpYW1vbmQgRHVzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzk4QScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnNlZW5EaWFtb25kRHVzdCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGVlcCBGcmVlemUnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSA5QTMgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKguIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBzbyBvbmx5IGEgbWlzdGFrZSBhZnRlciB0aGF0LlxyXG4gICAgICAgIC8vIFVubGlrZSBleHRyZW1lLCB0aGlzIGhhcyB0aGUgc2FtZSAyMCBzZWNvbmQgZHVyYXRpb24gYXMgdGhlIGludGVybWlzc2lvbi5cclxuICAgICAgICByZXR1cm4gZGF0YS5zZWVuRGlhbW9uZER1c3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gU2hpdmEgRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnQkVCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICdCRUMnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUV4IEdsYWNpZXIgQmFzaCc6ICdCRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICdCREYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICdCRTInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBMYXNlci4gIFRPRE86IG1heWJlIGJsYW1lIHRoZSBwZXJzb24gaXQncyBvbj8/XHJcbiAgICAnU2hpdmFFeCBBdmFsYW5jaGUnOiAnQkUwJyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFua2J1c3RlclxyXG4gICAgJ1NoaXZhRXggSWNlYnJhbmQnOiAnQkUxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IEM4QSBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC/jg5Ljg63jgqTjg4Pjgq8uIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgYnV0IGZvciBhIHNob3J0ZXIgZHVyYXRpb24uXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgPiAyMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gSGFyZFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1NTMnLFxyXG4gICAgJ1RpdGFuSG0gQnVyc3QnOiAnNDFDJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIExhbmRzbGlkZSc6ICc1NTQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5IbSBSb2NrIEJ1c3Rlcic6ICc1NTAnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5IbSBNb3VudGFpbiBCdXN0ZXInOiAnMjgzJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRpdGFuIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNUJFJyxcclxuICAgICdUaXRhbkV4IEJ1cnN0JzogJzVCRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBMYW5kc2xpZGUnOiAnNUJCJyxcclxuICAgICdUaXRhbkV4IEdhb2xlciBMYW5kc2xpZGUnOiAnNUMzJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggUm9jayBCdXN0ZXInOiAnNUI3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTW91bnRhaW4gQnVzdGVyJzogJzVCOCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWVwaW5nQ2l0eU9mTWhhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQ3JpdGljYWwgQml0ZSc6ICcxODQ4JywgLy8gU2Fyc3VjaHVzIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSZWFsbSBTaGFrZXInOiAnMTgzRScsIC8vIEZpcnN0IERhdWdodGVyIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtzY3JlZW4nOiAnMTgzQycsIC8vIEZpcnN0IERhdWdodGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrZW4gU3ByYXknOiAnMTgyNCcsIC8vIEFyYWNobmUgRXZlIHJlYXIgY29uYWwgYW9lXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAxJzogJzE4MzcnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAxXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAyJzogJzE4MzYnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAyXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAzJzogJzE4MzUnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAzXHJcbiAgICAnV2VlcGluZyBTcGlkZXIgVGhyZWFkJzogJzE4MzknLCAvLyBBcmFjaG5lIEV2ZSBzcGlkZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIEZpcmUgSUknOiAnMTg0RScsIC8vIEJsYWNrIE1hZ2UgQ29ycHNlIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIE5lY3JvcHVyZ2UnOiAnMTdENycsIC8vIEZvcmdhbGwgU2hyaXZlbGVkIFRhbG9uIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSb3R0ZW4gQnJlYXRoJzogJzE3RDAnLCAvLyBGb3JnYWxsIERhaGFrIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBNb3cnOiAnMTdEMicsIC8vIEZvcmdhbGwgSGFhZ2VudGkgdW5tYXJrZWQgY2xlYXZlXHJcbiAgICAnV2VlcGluZyBEYXJrIEVydXB0aW9uJzogJzE3QzMnLCAvLyBGb3JnYWxsIHB1ZGRsZSBtYXJrZXJcclxuICAgIC8vIDE4MDYgaXMgYWxzbyBGbGFyZSBTdGFyLCBidXQgaWYgeW91IGdldCBieSAxODA1IHlvdSBhbHNvIGdldCBoaXQgYnkgMTgwNj9cclxuICAgICdXZWVwaW5nIEZsYXJlIFN0YXInOiAnMTgwNScsIC8vIE96bWEgY3ViZSBwaGFzZSBkb251dFxyXG4gICAgJ1dlZXBpbmcgRXhlY3JhdGlvbic6ICcxODI5JywgLy8gT3ptYSB0cmlhbmdsZSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAxJzogJzE4MEInLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMic6ICcxODBGJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBFbnRhbmdsZW1lbnQnOiAnMTgxRCcsIC8vIENhbG9maXN0ZXJpIGxhbmRtaW5lIHB1ZGRsZSBwcm9jXHJcbiAgICAnV2VlcGluZyBFdmlsIEN1cmwnOiAnMTgxNicsIC8vIENhbG9maXN0ZXJpIGF4ZVxyXG4gICAgJ1dlZXBpbmcgRXZpbCBUcmVzcyc6ICcxODE3JywgLy8gQ2Fsb2Zpc3RlcmkgYnVsYlxyXG4gICAgJ1dlZXBpbmcgRGVwdGggQ2hhcmdlJzogJzE4MjAnLCAvLyBDYWxvZmlzdGVyaSBjaGFyZ2UgdG8gZWRnZVxyXG4gICAgJ1dlZXBpbmcgRmVpbnQgUGFydGljbGUgQmVhbSc6ICcxOTI4JywgLy8gQ2Fsb2Zpc3Rlcmkgc2t5IGxhc2VyXHJcbiAgICAnV2VlcGluZyBFdmlsIFN3aXRjaCc6ICcxODE1JywgLy8gQ2Fsb2Zpc3RlcmkgbGFzZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdXZWVwaW5nIEFyYWNobmUgV2ViJzogJzE4NUUnLCAvLyBBcmFjaG5lIEV2ZSBoZWFkbWFya2VyIHdlYiBhb2VcclxuICAgICdXZWVwaW5nIEVhcnRoIEFldGhlcic6ICcxODQxJywgLy8gQXJhY2huZSBFdmUgb3Jic1xyXG4gICAgJ1dlZXBpbmcgRXBpZ3JhcGgnOiAnMTg1MicsIC8vIEhlYWRzdG9uZSB1bnRlbGVncmFwaGVkIGxhc2VyIGxpbmUgdGFuayBhdHRhY2tcclxuICAgIC8vIFRoaXMgaXMgdG9vIG5vaXN5LiAgQmV0dGVyIHRvIHBvcCB0aGUgYmFsbG9vbnMgdGhhbiB3b3JyeSBhYm91dCBmcmllbmRzLlxyXG4gICAgLy8gJ1dlZXBpbmcgRXhwbG9zaW9uJzogJzE4MDcnLCAvLyBPem1hc3BoZXJlIEN1YmUgb3JiIGV4cGxvc2lvblxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDEnOiAnMTgwQycsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIFNwbGl0IEVuZCAyJzogJzE4MTAnLCAvLyBDYWxvZmlzdGVyaSB0YW5rIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBCbG9vZGllZCBOYWlsJzogJzE4MUYnLCAvLyBDYWxvZmlzdGVyaSBheGUvYnVsYiBhcHBlYXJpbmdcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgSHlzdGVyaWEnOiAnMTI4JywgLy8gQXJhY2huZSBFdmUgRnJvbmQgQWZmZWFyZFxyXG4gICAgJ1dlZXBpbmcgWm9tYmlmaWNhdGlvbic6ICcxNzMnLCAvLyBGb3JnYWxsIHRvbyBtYW55IHpvbWJpZSBwdWRkbGVzXHJcbiAgICAnV2VlcGluZyBUb2FkJzogJzFCNycsIC8vIEZvcmdhbGwgQnJhbmQgb2YgdGhlIEZhbGxlbiBmYWlsdXJlXHJcbiAgICAnV2VlcGluZyBEb29tJzogJzM4RScsIC8vIEZvcmdhbGwgSGFhZ2VudGkgTW9ydGFsIFJheVxyXG4gICAgJ1dlZXBpbmcgQXNzaW1pbGF0aW9uJzogJzQyQycsIC8vIE96bWFzaGFkZSBBc3NpbWlsYXRpb24gbG9vay1hd2F5XHJcbiAgICAnV2VlcGluZyBTdHVuJzogJzk1JywgLy8gQ2Fsb2Zpc3RlcmkgUGVuZXRyYXRpb24gbG9vay1hd2F5XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEZvcmdhbGwgR3JhZHVhbCBab21iaWZpY2F0aW9uIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDE1JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuem9tYmllID0gZGF0YS56b21iaWUgfHwge307XHJcbiAgICAgICAgZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBNZWdhIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTdDQScgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuem9tYmllICYmICFkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBIZWFkc3RvbmUgU2hpZWxkIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTVFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBIZWFkc3RvbmUgU2hpZWxkIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnMTVFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRmxhcmluZyBFcGlncmFwaCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4NTYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnNoaWVsZCAmJiAhZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgbmFtZSBpcyBoZWxwZnVsbHkgY2FsbGVkIFwiQXR0YWNrXCIgc28gbmFtZSBpdCBzb21ldGhpbmcgZWxzZS5cclxuICAgICAgaWQ6ICdXZWVwaW5nIE96bWEgVGFuayBMYXNlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyB0eXBlOiAnMjInLCBpZDogJzE4MzEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBkZTogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBmcjogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OCv+ODs+OCr+ODrOOCtuODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5Z2m5YWL5r+A5YWJJyxcclxuICAgICAgICAgICAga286ICftg7Hsu6Qg66CI7J207KCAJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBPem1hIEhvbHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxODJFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnaXN0IHJ1bnRlcmdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgO+8gScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gRnJhY3RhbCBDb250aW51dW1cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUZyYWN0YWxDb250aW51dW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0ZyYWN0YWwgRG91YmxlIFNldmVyJzogJ0Y3RCcsIC8vIENvbmFscywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCBBZXRoZXJpYyBDb21wcmVzc2lvbic6ICdGODAnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgMVxyXG4gICAgJ0ZyYWN0YWwgMTEtVG9uemUgU3dpcGUnOiAnRjgxJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDEwLVRvbnplIFNsYXNoJzogJ0Y4MycsIC8vIEZyb250YWwgbGluZSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCAxMTEtVG9uemUgU3dpbmcnOiAnRjg3JywgLy8gR2V0LW91dCBBb0UsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgQnJva2VuIEdsYXNzJzogJ0Y4RScsIC8vIEdsb3dpbmcgcGFuZWxzLCBib3NzIDNcclxuICAgICdGcmFjdGFsIE1pbmVzJzogJ0Y5MCcsXHJcbiAgICAnRnJhY3RhbCBTZWVkIG9mIHRoZSBSaXZlcnMnOiAnRjkxJywgLy8gR3JvdW5kIEFvRSBjaXJjbGVzLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0ZyYWN0YWwgU2FuY3RpZmljYXRpb24nOiAnRjg5JywgLy8gSW5zdGFudCBjb25hbCBidXN0ZXIsIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyZWF0R3ViYWxMaWJyYXJ5SGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBUZXJyb3IgRXllJzogJzkzMCcsIC8vIENpcmNsZSBBb0UsIFNwaW5lIEJyZWFrZXIgdHJhc2hcclxuICAgICdHdWJhbEhtIEJhdHRlcic6ICcxOThBJywgLy8gQ2lyY2xlIEFvRSwgdHJhc2ggYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gQ29uZGVtbmF0aW9uJzogJzM5MCcsIC8vIENvbmFsIEFvRSwgQmlibGlvdm9yZSB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMSc6ICcxOTQzJywgLy8gRmFsbGluZyBib29rIHNoYWRvdywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAyJzogJzE5NDAnLCAvLyBSdXNoIEFvRSBmcm9tIGVuZHMsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMyc6ICcxOTQyJywgLy8gUnVzaCBBb0UgYWNyb3NzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIEZyaWdodGZ1bCBSb2FyJzogJzE5M0InLCAvLyBHZXQtT3V0IEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAxJzogJzE5M0QnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDInOiAnMTkzRicsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMyc6ICcxOTQxJywgLy8gSW5pdGlhbCBzaWRlIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGVzb2xhdGlvbic6ICcxOThDJywgLy8gTGluZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFya25lc3MnOiAnM0EwJywgLy8gQ29uYWwgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRmlyZXdhdGVyJzogJzNCQScsIC8vIENpcmNsZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBFbGJvdyBEcm9wJzogJ0NCQScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmsnOiAnMTlERicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBTZWFscyc6ICcxOTRBJywgLy8gU3VuL01vb25zZWFsIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gV2F0ZXIgSUlJJzogJzFDNjcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBQb3JvZ28gUGVnaXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBSYWdpbmcgQXhlJzogJzE3MDMnLCAvLyBTbWFsbCBjb25hbCBBb0UsIE1lY2hhbm9zZXJ2aXRvciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gTWFnaWMgSGFtbWVyJzogJzE5OTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBBcGFuZGEgbWluaS1ib3NzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIEdyYXZpdHknOiAnMTk1MCcsIC8vIENpcmNsZSBBb0UgZnJvbSBncmF2aXR5IHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBMZXZpdGF0aW9uJzogJzE5NEYnLCAvLyBDaXJjbGUgQW9FIGZyb20gbGV2aXRhdGlvbiBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIENvbWV0JzogJzE5NjknLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1YmFsSG0gRWNsaXB0aWMgTWV0ZW9yJzogJzE5NUMnLCAvLyBMb1MgbWVjaGFuaWMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBTZWFyaW5nIFdpbmQnOiAnMTk0NCcsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFRodW5kZXInOiAnMTlbQUJdJywgLy8gU3ByZWFkIG1hcmtlciwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBGaXJlIGdhdGUgaW4gaGFsbHdheSB0byBib3NzIDIsIG1hZ25ldCBmYWlsdXJlIG9uIGJvc3MgMlxyXG4gICAgICBpZDogJ0d1YmFsSG0gQnVybnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTBCJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID0gZGF0YS5oYXNJbXAgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNJbXBbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNJbXAgPSBkYXRhLmhhc0ltcCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRhcmdldHMgd2l0aCBJbXAgd2hlbiBUaHVuZGVyIElJSSByZXNvbHZlcyByZWNlaXZlIGEgdnVsbmVyYWJpbGl0eSBzdGFjayBhbmQgYnJpZWYgc3R1blxyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIFRodW5kZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1W0FCXScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5oYXNJbXBbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gQWx3YXlzIGhpdHMgdGFyZ2V0LCBidXQgaWYgY29ycmVjdGx5IHJlc29sdmVkIHdpbGwgZGVhbCAwIGRhbWFnZVxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIFRvcm5hZG8nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1Wzc4XScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gQWx3YXlzIGhpdHMgdGFyZ2V0LCBidXQgaWYgY29ycmVjdGx5IHJlc29sdmVkIHdpbGwgZGVhbCAwIGRhbWFnZVxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNvaG1BbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NvaG1BbEhtIERlYWRseSBWYXBvcic6ICcxREM5JywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9Fc1xyXG4gICAgJ1NvaG1BbEhtIERlZXByb290JzogJzFDREEnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBPZGlvdXMgQWlyJzogJzFDREInLCAvLyBDb25hbCBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEdsb3Jpb3VzIEJsYXplJzogJzFDMzMnLCAvLyBDaXJjbGUgQW9FLCBTbWFsbCBTcG9yZSBTYWMsIGJvc3MgMVxyXG4gICAgJ1NvaG1BbEhtIEZvdWwgV2F0ZXJzJzogJzExOEEnLCAvLyBDb25hbCBBb0UsIE1vdW50YWludG9wIE9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGxhaW4gUG91bmQnOiAnMTE4NycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIE1vdW50YWludG9wIEhyb3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQYWxzeW55eGlzJzogJzExNjEnLCAvLyBDb25hbCBBb0UsIE92ZXJncm93biBEaWZmbHVnaWEgdHJhc2hcclxuICAgICdTb2htQWxIbSBTdXJmYWNlIEJyZWFjaCc6ICcxRTgwJywgLy8gQ2lyY2xlIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEZyZXNod2F0ZXIgQ2Fubm9uJzogJzExOUYnLCAvLyBMaW5lIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU21hc2gnOiAnMUMzNScsIC8vIFVudGVsZWdyYXBoZWQgcmVhciBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gVGFpbCBTd2luZyc6ICcxQzM2JywgLy8gVW50ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFJpcHBlciBDbGF3JzogJzFDMzcnLCAvLyBVbnRlbGVncmFwaGVkIGZyb250YWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbmQgU2xhc2gnOiAnMUMzOCcsIC8vIENpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBDaGFyZ2UnOiAnMUMzOScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEhvdCBDaGFyZ2UnOiAnMUMzQScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEZpcmViYWxsJzogJzFDM0InLCAvLyBVbnRlbGVncmFwaGVkIHRhcmdldGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gTGF2YSBGbG93JzogJzFDM0MnLCAvLyBVbnRlbGVncmFwaGVkIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIEhvcm4nOiAnMTUwNycsIC8vIENvbmFsIEFvRSwgQWJhbGF0aGlhbiBDbGF5IEdvbGVtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTGF2YSBCcmVhdGgnOiAnMUM0RCcsIC8vIENvbmFsIEFvRSwgTGF2YSBDcmFiIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUmluZyBvZiBGaXJlJzogJzFDNEMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBWb2xjYW5vIEFuYWxhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMSc6ICcxQzQzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMic6ICcxQzQ0JywgLy8gMjcwLWRlZ3JlZSByZWFyIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMyc6ICcxQzQyJywgLy8gUmluZyBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIFJlYWxtIFNoYWtlcic6ICcxQzQxJywgLy8gQ2lyY2xlIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXYXJucyBpZiBwbGF5ZXJzIHN0ZXAgaW50byB0aGUgbGF2YSBwdWRkbGVzLiBUaGVyZSBpcyB1bmZvcnR1bmF0ZWx5IG5vIGRpcmVjdCBkYW1hZ2UgZXZlbnQuXHJcbiAgICAgIGlkOiAnU29obUFsSG0gQnVybnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsZXhhbmRlclRoZVNvdWxPZlRoZUNyZWF0b3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0ExMk4gU2FjcmFtZW50JzogJzFBRTYnLCAvLyBDcm9zcyBMYXNlcnNcclxuICAgICdBMTJOIEdyYXZpdGF0aW9uYWwgQW5vbWFseSc6ICcxQUVCJywgLy8gR3Jhdml0eSBQdWRkbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBMTJOIERpdmluZSBTcGVhcic6ICcxQUUzJywgLy8gSW5zdGFudCBjb25hbCB0YW5rIGNsZWF2ZVxyXG4gICAgJ0ExMk4gQmxhemluZyBTY291cmdlJzogJzFBRTknLCAvLyBPcmFuZ2UgaGVhZCBtYXJrZXIgc3BsYXNoIGRhbWFnZVxyXG4gICAgJ0ExMk4gUGxhaW50IE9mIFNldmVyaXR5JzogJzFBRjEnLCAvLyBBZ2dyYXZhdGVkIEFzc2F1bHQgc3BsYXNoIGRhbWFnZVxyXG4gICAgJ0ExMk4gQ29tbXVuaW9uJzogJzFBRkMnLCAvLyBUZXRoZXIgUHVkZGxlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ29sbGVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5hc3NhdWx0ID0gZGF0YS5hc3NhdWx0IHx8IFtdO1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdC5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEl0IGlzIGEgZmFpbHVyZSBmb3IgYSBTZXZlcml0eSBtYXJrZXIgdG8gc3RhY2sgd2l0aCB0aGUgU29saWRhcml0eSBncm91cC5cclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgRmFpbHVyZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxQUYyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmFzc2F1bHQuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RpZG5cXCd0IFNwcmVhZCEnLFxyXG4gICAgICAgICAgICBkZTogJ05pY2h0IHZlcnRlaWx0IScsXHJcbiAgICAgICAgICAgIGZyOiAnTmUgc1xcJ2VzdCBwYXMgZGlzcGVyc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+aVo+mWi+OBl+OBquOBi+OBo+OBnyEnLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeacieaVo+W8gCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDIwLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5hc3NhdWx0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsYU1oaWdvLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbGEgTWhpZ28gTWFnaXRlayBSYXknOiAnMjRDRScsIC8vIExpbmUgQW9FLCBMZWdpb24gUHJlZGF0b3IgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gTG9jayBPbic6ICcyMDQ3JywgLy8gSG9taW5nIGNpcmNsZXMsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDEnOiAnMjA0OScsIC8vIEZyb250YWwgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDInOiAnMjA0QicsIC8vIFJlYXIgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDMnOiAnMjA0QycsIC8vIFJlYXIgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBTaG91bGRlciBDYW5ub24nOiAnMjREMCcsIC8vIENpcmNsZSBBb0UsIExlZ2lvbiBBdmVuZ2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENhbm5vbmZpcmUnOiAnMjNFRCcsIC8vIEVudmlyb25tZW50YWwgY2lyY2xlIEFvRSwgcGF0aCB0byBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnMjA1QScsIC8vIENpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBJbnRlZ3JhdGVkIEFldGhlcm9tb2R1bGF0b3InOiAnMjA1QicsIC8vIFJpbmcgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQ2lyY2xlIE9mIERlYXRoJzogJzI0RDQnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgSGV4YWRyb25lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEV4aGF1c3QnOiAnMjREMycsIC8vIExpbmUgQW9FLCBMZWdpb24gQ29sb3NzdXMgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gR3JhbmQgU3dvcmQnOiAnMjREMicsIC8vIENvbmFsIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3Rvcm0gMSc6ICcyMDY2JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIHByZS1pbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDInOiAnMjU4NycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDEnOiAnMjRCNicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmltYXJ5IGVudGl0eSwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIFZlaW4gU3BsaXR0ZXIgMic6ICcyMDZDJywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIGhlbHBlciBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBMaWdodGxlc3MgU3BhcmsnOiAnMjA2QicsIC8vIENvbmFsIEFvRSwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbGEgTWhpZ28gRGVtaW1hZ2lja3MnOiAnMjA1RScsXHJcbiAgICAnQWxhIE1oaWdvIFVubW92aW5nIFRyb2lrYSc6ICcyMDYwJyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAxJzogJzIwNjknLFxyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3b3JkIDInOiAnMjU4OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJdCdzIHBvc3NpYmxlIHBsYXllcnMgbWlnaHQganVzdCB3YW5kZXIgaW50byB0aGUgYmFkIG9uIHRoZSBvdXRzaWRlLFxyXG4gICAgICAvLyBidXQgbm9ybWFsbHkgcGVvcGxlIGdldCBwdXNoZWQgaW50byBpdC5cclxuICAgICAgaWQ6ICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd2VsbCcsXHJcbiAgICAgIC8vIERhbWFnZSBEb3duXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQjgnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEJhcmRhbSdzIE1ldHRsZVxyXG5cclxuXHJcbi8vIEZvciByZWFzb25zIG5vdCBjb21wbGV0ZWx5IHVuZGVyc3Rvb2QgYXQgdGhlIHRpbWUgdGhpcyB3YXMgbWVyZ2VkLFxyXG4vLyBidXQgbGlrZWx5IHJlbGF0ZWQgdG8gdGhlIGZhY3QgdGhhdCBubyBuYW1lcGxhdGVzIGFyZSB2aXNpYmxlIGR1cmluZyB0aGUgZW5jb3VudGVyLFxyXG4vLyBhbmQgdGhhdCBub3RoaW5nIGluIHRoZSBlbmNvdW50ZXIgYWN0dWFsbHkgZG9lcyBkYW1hZ2UsXHJcbi8vIHdlIGNhbid0IHVzZSBkYW1hZ2VXYXJuIG9yIGdhaW5zRWZmZWN0IGhlbHBlcnMgb24gdGhlIEJhcmRhbSBmaWdodC5cclxuLy8gSW5zdGVhZCwgd2UgdXNlIHRoaXMgaGVscGVyIGZ1bmN0aW9uIHRvIGxvb2sgZm9yIGZhaWx1cmUgZmxhZ3MuXHJcbi8vIElmIHRoZSBmbGFnIGlzIHByZXNlbnQsYSBmdWxsIHRyaWdnZXIgb2JqZWN0IGlzIHJldHVybmVkIHRoYXQgZHJvcHMgaW4gc2VhbWxlc3NseS5cclxuY29uc3QgYWJpbGl0eVdhcm4gPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHkgJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4ge1xyXG4gICAgaWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnN1YnN0cigtMikgPT09ICcwRScsXHJcbiAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgfSxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkJhcmRhbXNNZXR0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0JhcmRhbSBEaXJ0eSBDbGF3JzogJzIxQTgnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR3VsbyBHdWxvIHRyYXNoXHJcbiAgICAnQmFyZGFtIEVwaWdyYXBoJzogJzIzQUYnLCAvLyBMaW5lIEFvRSwgV2FsbCBvZiBCYXJkYW0gdHJhc2hcclxuICAgICdCYXJkYW0gVGhlIER1c2sgU3Rhcic6ICcyMTg3JywgLy8gQ2lyY2xlIEFvRSwgZW52aXJvbm1lbnQgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gVGhlIERhd24gU3Rhcic6ICcyMTg2JywgLy8gQ2lyY2xlIEFvRSwgZW52aXJvbm1lbnQgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gQ3J1bWJsaW5nIENydXN0JzogJzFGMTMnLCAvLyBDaXJjbGUgQW9FcywgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFJhbSBSdXNoJzogJzFFRkMnLCAvLyBMaW5lIEFvRXMsIFN0ZXBwZSBZYW1hYSwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gTHVsbGFieSc6ICcyNEIyJywgLy8gQ2lyY2xlIEFvRXMsIFN0ZXBwZSBTaGVlcCwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gSGVhdmUnOiAnMUVGNycsIC8vIEZyb250YWwgY2xlYXZlLCBHYXJ1bGEsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gV2lkZSBCbGFzdGVyJzogJzI0QjMnLCAvLyBFbm9ybW91cyBmcm9udGFsIGNsZWF2ZSwgU3RlcHBlIENvZXVybCwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ2lyY2xlIEFvRSwgTWV0dGxpbmcgRGhhcmEgdHJhc2hcclxuICAgICdCYXJkYW0gVHJhbnNvbmljIEJsYXN0JzogJzEyNjInLCAvLyBDaXJjbGUgQW9FLCBTdGVwcGUgRWFnbGUgdHJhc2hcclxuICAgICdCYXJkYW0gV2lsZCBIb3JuJzogJzIyMDgnLCAvLyBGcm9udGFsIGNsZWF2ZSwgS2h1biBHdXJ2ZWwgdHJhc2hcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDEnOiAnMjU3OCcsIC8vIDEgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMic6ICcyNTc5JywgLy8gMiBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAzJzogJzI1N0EnLCAvLyAzIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVHJlbWJsb3IgMSc6ICcyNTdCJywgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDInOiAnMjU3QycsIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUaHJvd2luZyBTcGVhcic6ICcyNTdGJywgLy8gQ2hlY2tlcmJvYXJkIEFvRSwgVGhyb3dpbmcgU3BlYXIsIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEJhcmRhbVxcJ3MgUmluZyc6ICcyNTgxJywgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIENvbWV0JzogJzI1N0QnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCBJbXBhY3QnOiAnMjU4MCcsIC8vIENpcmNsZSBBb0VzLCBTdGFyIFNoYXJkLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBJcm9uIFNwaGVyZSBBdHRhY2snOiAnMTZCNicsIC8vIENvbnRhY3QgZGFtYWdlLCBJcm9uIFNwaGVyZSB0cmFzaCwgYmVmb3JlIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gVG9ybmFkbyc6ICcyNDdFJywgLy8gQ2lyY2xlIEFvRSwgS2h1biBTaGF2YXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFBpbmlvbic6ICcxRjExJywgLy8gTGluZSBBb0UsIFlvbCBGZWF0aGVyLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIEZlYXRoZXIgU3F1YWxsJzogJzFGMEUnLCAvLyBEYXNoIGF0dGFjaywgWW9sLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFVudGFyZ2V0ZWQnOiAnMUYxMicsIC8vIFJvdGF0aW5nIGNpcmNsZSBBb0VzLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0JhcmRhbSBHYXJ1bGEgUnVzaCc6ICcxRUY5JywgLy8gTGluZSBBb0UsIEdhcnVsYSwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gRmx1dHRlcmZhbGwgVGFyZ2V0ZWQnOiAnMUYwQycsIC8vIENpcmNsZSBBb0UgaGVhZG1hcmtlciwgWW9sLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIFdpbmdiZWF0JzogJzFGMEYnLCAvLyBDb25hbCBBb0UgaGVhZG1hcmtlciwgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdCYXJkYW0gQ29uZnVzZWQnOiAnMEInLCAvLyBGYWlsZWQgZ2F6ZSBhdHRhY2ssIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnQmFyZGFtIEZldHRlcnMnOiAnNTZGJywgLy8gRmFpbGluZyB0d28gbWVjaGFuaWNzIGluIGFueSBvbmUgcGhhc2Ugb24gQmFyZGFtLCBzZWNvbmQgYm9zcy5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDEnLCBhYmlsaXR5SWQ6ICcyNTc4JyB9KSxcclxuICAgIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMicsIGFiaWxpdHlJZDogJzI1NzknIH0pLFxyXG4gICAgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAzJywgYWJpbGl0eUlkOiAnMjU3QScgfSksXHJcbiAgICAvLyAxIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVHJlbWJsb3IgMScsIGFiaWxpdHlJZDogJzI1N0InIH0pLFxyXG4gICAgLy8gMiBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDInLCBhYmlsaXR5SWQ6ICcyNTdDJyB9KSxcclxuICAgIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUaHJvd2luZyBTcGVhcicsIGFiaWxpdHlJZDogJzI1N0YnIH0pLFxyXG4gICAgLy8gR2F6ZSBhdHRhY2ssIFdhcnJpb3Igb2YgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBFbXB0eSBHYXplJywgYWJpbGl0eUlkOiAnMUYwNCcgfSksXHJcbiAgICAvLyBEb251dCBBb0UgaGVhZG1hcmtlcnMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW1cXCdzIFJpbmcnLCBhYmlsaXR5SWQ6ICcyNTgxJyB9KSxcclxuICAgIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0JywgYWJpbGl0eUlkOiAnMjU3RCcgfSksXHJcbiAgICAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gQ29tZXQgSW1wYWN0JywgYWJpbGl0eUlkOiAnMjU4MCcgfSksXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5LdWdhbmVDYXN0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGVua2EgR29ra2VuJzogJzIzMjknLCAvLyBGcm9udGFsIGNvbmUgQW9FLCAgSm9pIEJsYWRlIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBLZW5raSBSZWxlYXNlIFRyYXNoJzogJzIzMzAnLCAvLyBDaGFyaW90IEFvRSwgSm9pIEtpeW9mdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xlYXJvdXQnOiAnMUU5MicsIC8vIEZyb250YWwgY29uZSBBb0UsIFp1aWtvLU1hcnUsIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYS1LaXJpIDEnOiAnMUU5NicsIC8vIEdpYW50IGNpcmNsZSBBb0UsIEhhcmFraXJpIEtvc2hvLCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAyJzogJzI0RjknLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAxJzogJzIzMkQnLCAvLyBMaW5lIEFvRSwgS2FyYWt1cmkgT25taXRzdSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgMTAwMCBCYXJicyc6ICcyMTk4JywgLy8gTGluZSBBb0UsIEpvaSBLb2phIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAyJzogJzFFOTgnLCAvLyBMaW5lIEFvRSwgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBUYXRhbWktR2Flc2hpJzogJzFFOUQnLCAvLyBGbG9vciB0aWxlIGxpbmUgYXR0YWNrLCBFbGtpdGUgT25taXRzdSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDMnOiAnMUVBMCcsIC8vIExpbmUgQW9FLCBFbGl0ZSBPbm1pdHN1LCBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBBdXRvIENyb3NzYm93JzogJzIzMzMnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBLYXJha3VyaSBIYW55YSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJha2lyaSAzJzogJzIzQzknLCAvLyBHaWFudCBDaXJjbGUgQW9FLCBIYXJha2lyaSAgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIElhaS1HaXJpJzogJzFFQTInLCAvLyBDaGFyaW90IEFvRSwgWW9qaW1ibywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBGcmFnaWxpdHknOiAnMUVBQScsIC8vIENoYXJpb3QgQW9FLCBJbm9zaGlrYWNobywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBEcmFnb25maXJlJzogJzFFQUInLCAvLyBMaW5lIEFvRSwgRHJhZ29uIEhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcblxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSXNzZW4nOiAnMUU5NycsIC8vIEluc3RhbnQgZnJvbnRhbCBjbGVhdmUsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xvY2t3b3JrIFJhaXRvbic6ICcxRTlCJywgLy8gTGFyZ2UgbGlnaHRuaW5nIHNwcmVhZCBjaXJjbGVzLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgWnVpa28gTWFydSwgYm9zcyAxXHJcbiAgICAgIGlkOiAnS3VnYW5lIENhc3RsZSBIZWxtIENyYWNrJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMUU5NCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnR5cGUgPT09ICcyMScsIC8vIFRha2luZyB0aGUgc3RhY2sgc29sbyBpcyAqcHJvYmFibHkqIGEgbWlzdGFrZS5cclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNhaW50TW9jaWFubmVzQXJib3JldHVtSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBNdWRzdHJlYW0nOiAnMzBEOScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEltbWFjdWxhdGUgQXBhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTaWxrZW4gU3ByYXknOiAnMzM4NScsIC8vIFJlYXIgY29uZSBBb0UsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZGR5IFB1ZGRsZXMnOiAnMzBEQScsIC8vIFNtYWxsIHRhcmdldGVkIGNpcmNsZSBBb0VzLCBEb3Jwb2trdXIgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBaXInOiAnMkU0OScsIC8vIEZyb250YWwgY29uZSBBb0UsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU0x1ZGdlIEJvbWInOiAnMkU0RScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBdG1vc3BoZXJlJzogJzJFNTEnLCAvLyBDaGFubmVsZWQgMy80IGFyZW5hIGNsZWF2ZSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDcmVlcGluZyBJdnknOiAnMzFBNScsIC8vIEZyb250YWwgY29uZSBBb0UsIFdpdGhlcmVkIEt1bGFrIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBSb2Nrc2xpZGUnOiAnMzEzNCcsIC8vIExpbmUgQW9FLCBTaWx0IEdvbGVtLCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgSW5uZXInOiAnMzEyRScsIC8vIENoYXJpb3QgQW9FLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgT3V0ZXInOiAnMzEyRicsIC8vIER5bmFtbyBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRW1iYWxtaW5nIEVhcnRoJzogJzMxQTYnLCAvLyBMYXJnZSBDaGFyaW90IEFvRSwgTXVkZHkgTWF0YSwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBRdWlja21pcmUnOiAnMzEzNicsIC8vIFNld2FnZSBzdXJnZSBhdm9pZGVkIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1YWdtaXJlIFBsYXRmb3Jtcyc6ICczMTM5JywgLy8gUXVhZ21pcmUgZXhwbG9zaW9uIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZlY3VsZW50IEZsb29kJzogJzMxM0MnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgQ29ycnVwdHVyZSc6ICczM0EwJywgLy8gTXVkIFNsaW1lIGV4cGxvc2lvbiwgYm9zcyAzLiAoTm8gZXhwbG9zaW9uIGlmIGRvbmUgY29ycmVjdGx5LilcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVGFwcm9vdCc6ICcyRTRDJywgLy8gTGFyZ2Ugb3JhbmdlIHNwcmVhZCBjaXJjbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRoIFNoYWtlcic6ICczMTMxJywgLy8gRWFydGggU2hha2VyLCBMYWtoYW11LCBib3NzIDJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU2VkdWNlZCc6ICczREYnLCAvLyBHYXplIGZhaWx1cmUsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFBvbGxlbic6ICcxMycsIC8vIFNsdWRnZSBwdWRkbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFRyYW5zZmlndXJhdGlvbic6ICc2NDgnLCAvLyBSb2x5LVBvbHkgQW9FIGNpcmNsZSBmYWlsdXJlLCBCTG9vbWluZyBCaWxva28gdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEh5c3RlcmlhJzogJzEyOCcsIC8vIEdhemUgZmFpbHVyZSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTdGFiIFdvdW5kJzogJzQ1RCcsIC8vIEFyZW5hIG91dGVyIHdhbGwgZWZmZWN0LCBib3NzIDJcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBGYXVsdCBXYXJyZW4nOiAnMkU0QScsIC8vIFN0YWNrIG1hcmtlciwgTnVsbGNodSwgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTd2FsbG93c0NvbXBhc3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSXZ5IEZldHRlcnMnOiAnMkMwNCcsIC8vIENpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMSc6ICcyQzA1JywgLy8gVG9ybmFkbyBncm91bmQgQW9FLCBwbGFjZWQgYnkgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFlhbWEtS2FndXJhJzogJzJCOTYnLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmxhbWVzIE9mIEhhdGUnOiAnMkI5OCcsIC8vIEZpcmUgb3JiIGV4cGxvc2lvbnMsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQ29uZmxhZ3JhdGUnOiAnMkI5OScsIC8vIENvbGxpc2lvbiB3aXRoIGZpcmUgb3JiLCBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBVcHdlbGwnOiAnMkMwNicsIC8vIFRhcmdldGVkIGNpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCYWQgQnJlYXRoJzogJzJDMDcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgSmlubWVuanUgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBHcmVhdGVyIFBhbG0gMSc6ICcyQjlEJywgLy8gSGFsZiBhcmVuYSByaWdodCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDInOiAnMkI5RScsIC8vIEhhbGYgYXJlbmEgbGVmdCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVHJpYnV0YXJ5JzogJzJCQTAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmFsIGdyb3VuZCBBb0VzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMic6ICcyQzA2JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIGVudmlyb25tZW50LCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAzJzogJzJDMDcnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmlsb3BsdW1lcyc6ICcyQzc2JywgLy8gRnJvbnRhbCByZWN0YW5nbGUgQW9FLCBEcmFnb24gQmkgRmFuZyB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDEnOiAnMkJBOCcsIC8vIENoYXJpb3QgQW9FLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMic6ICcyQkE5JywgLy8gRHluYW1vIEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDMnOiAnMkJBRScsIC8vIENoYXJpb3QgQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDQnOiAnMkJBRicsIC8vIER5bmFtbyBBb0UsIFNoYWRvdyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBFcXVhbCBPZiBIZWF2ZW4nOiAnMkJCNCcsIC8vIFNtYWxsIGNpcmNsZSBncm91bmQgQW9FcywgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNaXJhZ2UnOiAnMkJBMicsIC8vIFByZXktY2hhc2luZyBwdWRkbGVzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1vdW50YWluIEZhbGxzJzogJzJCQTUnLCAvLyBDaXJjbGUgc3ByZWFkIG1hcmtlcnMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kJzogJzJCQTcnLCAvLyBMYXNlciB0ZXRoZXIsIFFpdGlhbiBEYXNoZW5nICBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCAyJzogJzJCQUQnLCAvLyBMYXNlciBUZXRoZXIsIFNoYWRvd3MgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGF0dGFjayBmYWlsdXJlLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmxlZWRpbmcnOiAnMTEyRicsIC8vIFN0ZXBwaW5nIG91dHNpZGUgdGhlIGFyZW5hLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YW5kaW5nIGluIHRoZSBsYWtlLCBEaWFkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIFNpeCBGdWxtcyBVbmRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyMzcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU3RhY2sgbWFya2VyLCBib3NzIDNcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIEZpdmUgRmluZ2VyZWQgUHVuaXNobWVudCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWycyQkFCJywgJzJCQjAnXSwgc291cmNlOiBbJ1FpdGlhbiBEYXNoZW5nJywgJ1NoYWRvdyBPZiBUaGUgU2FnZSddIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50eXBlID09PSAnMjEnLCAvLyBUYWtpbmcgdGhlIHN0YWNrIHNvbG8gaXMgKnByb2JhYmx5KiBhIG1pc3Rha2UuXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUZW1wbGVPZlRoZUZpc3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBGaXJlIEJyZWFrJzogJzIxRUQnLCAvLyBDb25hbCBBb0UsIEJsb29kZ2xpZGVyIE1vbmsgdHJhc2hcclxuICAgICdUZW1wbGUgUmFkaWFsIEJsYXN0ZXInOiAnMUZEMycsIC8vIENpcmNsZSBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBXaWRlIEJsYXN0ZXInOiAnMUZENCcsIC8vIENvbmFsIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIENyaXBwbGluZyBCbG93JzogJzIwMTYnLCAvLyBMaW5lIEFvRXMsIGVudmlyb25tZW50YWwsIGJlZm9yZSBib3NzIDJcclxuICAgICdUZW1wbGUgQnJva2VuIEVhcnRoJzogJzIzNkUnLCAvLyBDaXJjbGUgQW9FLCBTaW5naGEgdHJhc2hcclxuICAgICdUZW1wbGUgU2hlYXInOiAnMUZERCcsIC8vIER1YWwgY29uYWwgQW9FLCBib3NzIDJcclxuICAgICdUZW1wbGUgQ291bnRlciBQYXJyeSc6ICcxRkUwJywgLy8gUmV0YWxpYXRpb24gZm9yIGluY29ycmVjdCBkaXJlY3Rpb24gYWZ0ZXIgS2lsbGVyIEluc3RpbmN0LCBib3NzIDJcclxuICAgICdUZW1wbGUgVGFwYXMnOiAnJywgLy8gVHJhY2tpbmcgY2lyY3VsYXIgZ3JvdW5kIEFvRXMsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBIZWxsc2VhbCc6ICcyMDBGJywgLy8gUmVkL0JsdWUgc3ltYm9sIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBQdXJlIFdpbGwnOiAnMjAxNycsIC8vIENpcmNsZSBBb0UsIFNwaXJpdCBGbGFtZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNZWdhYmxhc3Rlcic6ICcxNjMnLCAvLyBDb25hbCBBb0UsIENvZXVybCBQcmFuYSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBXaW5kYnVybic6ICcxRkU4JywgLy8gQ2lyY2xlIEFvRSwgVHdpc3RlciB3aW5kLCBib3NzIDNcclxuICAgICdUZW1wbGUgSHVycmljYW5lIEtpY2snOiAnMUZFNScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBTaWxlbnQgUm9hcic6ICcxRkVCJywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1pZ2h0eSBCbG93JzogJzFGRUEnLCAvLyBDb250YWN0IHdpdGggY29ldXJsIGhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEhlYXQgTGlnaHRuaW5nJzogJzFGRDcnLCAvLyBQdXJwbGUgc3ByZWFkIGNpcmNsZXMsIGJvc3MgMVxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJ1cm4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIEZhbGxpbmcgUm9jayc6ICczMUEzJywgLy8gRW52aXJvbm1lbnRhbCBsaW5lIEFvRVxyXG4gICAgJ1RoZSBCdXJuIEFldGhlcmlhbCBCbGFzdCc6ICczMjhCJywgLy8gTGluZSBBb0UsIEt1a3Vsa2FuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gTW9sZS1hLXdoYWNrJzogJzMyOEQnLCAvLyBDaXJjbGUgQW9FLCBEZXNlcnQgRGVzbWFuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gSGVhZCBCdXR0JzogJzMyOEUnLCAvLyBTbWFsbCBjb25hbCBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGFyZGZhbGwnOiAnMzE5MScsIC8vIFJvb213aWRlIEFvRSwgTG9TIGZvciBzYWZldHksIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIERpc3NvbmFuY2UnOiAnMzE5MicsIC8vIERvbnV0IEFvRSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ3J5c3RhbGxpbmUgRnJhY3R1cmUnOiAnMzE5NycsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSZXNvbmFudCBGcmVxdWVuY3knOiAnMzE5OCcsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSb3Rvc3dpcGUnOiAnMzI5MScsIC8vIEZyb250YWwgY29uZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBXcmVja2luZyBCYWxsJzogJzMyOTInLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyZWFkbmF1Z2h0IHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2hhdHRlcic6ICczMjk0JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQ2hhcnJlZCBEb2JseW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBBdXRvLUNhbm5vbnMnOiAnMzI5NScsIC8vIExpbmUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2VsZi1EZXRvbmF0ZSc6ICczMjk2JywgLy8gQ2lyY2xlIEFvRSwgQ2hhcnJlZCBEcm9uZSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEZ1bGwgVGhyb3R0bGUnOiAnMkQ3NScsIC8vIExpbmUgQW9FLCBEZWZlY3RpdmUgRHJvbmUsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRocm90dGxlJzogJzJENzYnLCAvLyBMaW5lIEFvRSwgTWluaW5nIERyb25lIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIEFkaXQgRHJpdmVyJzogJzJENzgnLCAvLyBMaW5lIEFvRSwgUm9jayBCaXRlciBhZGRzLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBUcmVtYmxvcic6ICczMjk3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVmVpbGVkIEdpZ2F3b3JtIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRGVzZXJ0IFNwaWNlJzogJzMyOTgnLCAvLyBUaGUgZnJvbnRhbCBjbGVhdmVzIG11c3QgZmxvd1xyXG4gICAgJ1RoZSBCdXJuIFRveGljIFNwcmF5JzogJzMyOUEnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBHaWdhd29ybSBTdGFsa2VyIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gVmVub20gU3ByYXknOiAnMzI5QicsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBXaGl0ZSBEZWF0aCc6ICczMTQzJywgLy8gUmVhY3RpdmUgZHVyaW5nIGludnVsbmVyYWJpbGl0eSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAxJzogJzMxNDUnLCAvLyBTdGFyIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAyJzogJzMxNDYnLCAvLyBMaW5lIEFvRXMgYWZ0ZXIgc3RhcnMsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBDYXV0ZXJpemUnOiAnMzE0OCcsIC8vIExpbmUvU3dvb3AgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGhlIEJ1cm4gQ29sZCBGb2cnOiAnMzE0MicsIC8vIEdyb3dpbmcgY2lyY2xlIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gSGFpbGZpcmUnOiAnMzE5NCcsIC8vIEhlYWQgbWFya2VyIGxpbmUgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBTaGFyZHN0cmlrZSc6ICczMTk1JywgLy8gT3JhbmdlIHNwcmVhZCBoZWFkIG1hcmtlcnMsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIENoaWxsaW5nIEFzcGlyYXRpb24nOiAnMzE0RCcsIC8vIEhlYWQgbWFya2VyIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZyb3N0IEJyZWF0aCc6ICczMTRDJywgLy8gVGFuayBjbGVhdmUsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIExlYWRlbic6ICc0MycsIC8vIFB1ZGRsZSBlZmZlY3QsIGJvc3MgMi4gKEFsc28gaW5mbGljdHMgMTFGLCBTbHVkZ2UuKVxyXG4gICAgJ1RoZSBCdXJuIFB1ZGRsZSBGcm9zdGJpdGUnOiAnMTFEJywgLy8gSWNlIHB1ZGRsZSBlZmZlY3QsIGJvc3MgMy4gKE5PVCB0aGUgY29uYWwtaW5mbGljdGVkIG9uZSwgMTBDLilcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIE8xTiAtIERlbHRhc2NhcGUgMS4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYxMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzFOIEJ1cm4nOiAnMjNENScsIC8vIEZpcmViYWxsIGV4cGxvc2lvbiBjaXJjbGUgQW9Fc1xyXG4gICAgJ08xTiBDbGFtcCc6ICcyM0UyJywgLy8gRnJvbnRhbCByZWN0YW5nbGUga25vY2tiYWNrIEFvRSwgQWx0ZSBSb2l0ZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzFOIExldmluYm9sdCc6ICcyM0RBJywgLy8gc21hbGwgc3ByZWFkIGNpcmNsZXNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIE8yTiAtIERlbHRhc2NhcGUgMi4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJOIE1haW4gUXVha2UnOiAnMjRBNScsIC8vIE5vbi10ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBGbGVzaHkgTWVtYmVyXHJcbiAgICAnTzJOIEVyb3Npb24nOiAnMjU5MCcsIC8vIFNtYWxsIGNpcmNsZSBBb0VzLCBGbGVzaHkgTWVtYmVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMk4gUGFyYW5vcm1hbCBXYXZlJzogJzI1MEUnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXZSBjb3VsZCB0cnkgdG8gc2VwYXJhdGUgb3V0IHRoZSBtaXN0YWtlIHRoYXQgbGVkIHRvIHRoZSBwbGF5ZXIgYmVpbmcgcGV0cmlmaWVkLlxyXG4gICAgICAvLyBIb3dldmVyLCBpdCdzIE5vcm1hbCBtb2RlLCB3aHkgb3ZlcnRoaW5rIGl0P1xyXG4gICAgICBpZDogJ08yTiBQZXRyaWZpY2F0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIC8vIFRoZSB1c2VyIG1pZ2h0IGdldCBoaXQgYnkgYW5vdGhlciBwZXRyaWZ5aW5nIGFiaWxpdHkgYmVmb3JlIHRoZSBlZmZlY3QgZW5kcy5cclxuICAgICAgLy8gVGhlcmUncyBubyBwb2ludCBpbiBub3RpZnlpbmcgZm9yIHRoYXQuXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNTE1JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGRlYWxzIGRhbWFnZSBvbmx5IHRvIG5vbi1mbG9hdGluZyB0YXJnZXRzLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzNOIC0gRGVsdGFzY2FwZSAzLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjMwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPM04gU3BlbGxibGFkZSBGaXJlIElJSSc6ICcyNDYwJywgLy8gRG9udXQgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgQmxpenphcmQgSUlJJzogJzI0NjEnLCAvLyBDaXJjbGUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgVGh1bmRlciBJSUknOiAnMjQ2MicsIC8vIExpbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIENyb3NzIFJlYXBlcic6ICcyNDZCJywgLy8gQ2lyY2xlIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gR3VzdGluZyBHb3VnZSc6ICcyNDZDJywgLy8gR3JlZW4gbGluZSBBb0UsIFNvdWwgUmVhcGVyXHJcbiAgICAnTzNOIFN3b3JkIERhbmNlJzogJzI0NzAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFVwbGlmdCc6ICcyNDczJywgLy8gR3JvdW5kIHNwZWFycywgUXVlZW4ncyBXYWx0eiBlZmZlY3QsIEhhbGljYXJuYXNzdXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPM04gVWx0aW11bSc6ICcyNDc3JywgLy8gSW5zdGFudCBraWxsLiBVc2VkIGlmIHRoZSBwbGF5ZXIgZG9lcyBub3QgZXhpdCB0aGUgc2FuZCBtYXplIGZhc3QgZW5vdWdoLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzNOIEhvbHkgQmx1cic6IDI0NjMsIC8vIFNwcmVhZCBjaXJjbGVzLlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPM04gUGhhc2UgVHJhY2tlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWNhcm5hc3N1cycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWthcm5hc3NvcycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICfjg4/jg6rjgqvjg6vjg4rjg4Pjgr3jgrknLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+WTiOWIqeWNoee6s+iLj+aWrycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyICs9IDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHRvIHRyYWNrLCBhbmQgaW4gb3JkZXIgdG8gbWFrZSBpdCBhbGwgY2xlYW4sIGl0J3Mgc2FmZXN0IGp1c3QgdG9cclxuICAgICAgLy8gaW5pdGlhbGl6ZSBpdCBhbGwgdXAgZnJvbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgY29tcGFyaXNvbnMuXHJcbiAgICAgIGlkOiAnTzNOIEluaXRpYWxpemluZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIC8vIEluZGV4aW5nIHBoYXNlcyBhdCAxIHNvIGFzIHRvIG1ha2UgcGhhc2VzIG1hdGNoIHdoYXQgaHVtYW5zIGV4cGVjdC5cclxuICAgICAgICAvLyAxOiBXZSBzdGFydCBoZXJlLlxyXG4gICAgICAgIC8vIDI6IENhdmUgcGhhc2Ugd2l0aCBVcGxpZnRzLlxyXG4gICAgICAgIC8vIDM6IFBvc3QtaW50ZXJtaXNzaW9uLCB3aXRoIGdvb2QgYW5kIGJhZCBmcm9ncy5cclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyID0gMTtcclxuICAgICAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFJpYmJpdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NjYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgRE8gd2FudCB0byBiZSBoaXQgYnkgVG9hZC9SaWJiaXQgaWYgdGhlIG5leHQgY2FzdCBvZiBUaGUgR2FtZVxyXG4gICAgICAgIC8vIGlzIDR4IHRvYWQgcGFuZWxzLlxyXG4gICAgICAgIHJldHVybiAhKGRhdGEucGhhc2VOdW1iZXIgPT09IDMgJiYgZGF0YS5nYW1lQ291bnQgJSAyID09PSAwKSAmJiBtYXRjaGVzLnRhcmdldElkICE9PSAnRTAwMDAwMDAnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHdlIGNvdWxkIGRvIHRvIHRyYWNrIGV4YWN0bHkgaG93IHRoZSBwbGF5ZXIgZmFpbGVkIFRoZSBHYW1lLlxyXG4gICAgICAvLyBXaHkgb3ZlcnRoaW5rIE5vcm1hbCBtb2RlLCBob3dldmVyP1xyXG4gICAgICBpZDogJ08zTiBUaGUgR2FtZScsXHJcbiAgICAgIC8vIEd1ZXNzIHdoYXQgeW91IGp1c3QgbG9zdD9cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2RCcgfSksXHJcbiAgICAgIC8vIElmIHRoZSBwbGF5ZXIgdGFrZXMgbm8gZGFtYWdlLCB0aGV5IGRpZCB0aGUgbWVjaGFuaWMgY29ycmVjdGx5LlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgKz0gMTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIE80TiAtIERlbHRhc2NhcGUgNC4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzROIEJsaXp6YXJkIElJSSc6ICcyNEJDJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEV4ZGVhdGhcclxuICAgICdPNE4gRW1wb3dlcmVkIFRodW5kZXIgSUlJJzogJzI0QzEnLCAvLyBVbnRlbGVncmFwaGVkIGxhcmdlIGNpcmNsZSBBb0UsIEV4ZGVhdGhcclxuICAgICdPNE4gWm9tYmllIEJyZWF0aCc6ICcyNENCJywgLy8gQ29uYWwsIHRyZWUgaGVhZCBhZnRlciBEZWNpc2l2ZSBCYXR0bGVcclxuICAgICdPNE4gQ2xlYXJvdXQnOiAnMjRDQycsIC8vIE92ZXJsYXBwaW5nIGNvbmUgQW9FcywgRGVhdGhseSBWaW5lICh0ZW50YWNsZXMgYWxvbmdzaWRlIHRyZWUgaGVhZClcclxuICAgICdPNE4gQmxhY2sgU3BhcmsnOiAnMjRDOScsIC8vIEV4cGxvZGluZyBCbGFjayBIb2xlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEVtcG93ZXJlZCBGaXJlIElJSSBpbmZsaWN0cyB0aGUgUHlyZXRpYyBkZWJ1ZmYsIHdoaWNoIGRlYWxzIGRhbWFnZSBpZiB0aGUgcGxheWVyXHJcbiAgICAvLyBtb3ZlcyBvciBhY3RzIGJlZm9yZSB0aGUgZGVidWZmIGZhbGxzLiBVbmZvcnR1bmF0ZWx5IGl0IGRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3NcclxuICAgIC8vIGN1cnJlbnRseSBhIGxvZyBsaW5lIGZvciB0aGlzLCBzbyB0aGUgb25seSB3YXkgdG8gY2hlY2sgZm9yIHRoaXMgaXMgdG8gY29sbGVjdFxyXG4gICAgLy8gdGhlIGRlYnVmZnMgYW5kIHRoZW4gd2FybiBpZiBhIHBsYXllciB0YWtlcyBhbiBhY3Rpb24gZHVyaW5nIHRoYXQgdGltZS4gTm90IHdvcnRoIGl0XHJcbiAgICAvLyBmb3IgTm9ybWFsLlxyXG4gICAgJ080TiBTdGFuZGFyZCBGaXJlJzogJzI0QkEnLFxyXG4gICAgJ080TiBCdXN0ZXIgVGh1bmRlcic6ICcyNEJFJywgLy8gQSBjbGVhdmluZyB0YW5rIGJ1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdDbGVhbnNlcnMgbWlzc2VkIERvb20hJyxcclxuICAgICAgICAgICAgZGU6ICdEb29tLVJlaW5pZ3VuZyB2ZXJnZXNzZW4hJyxcclxuICAgICAgICAgICAgZnI6ICdOXFwnYSBwYXMgw6l0w6kgZGlzc2lww6koZSkgZHUgR2xhcyAhJyxcclxuICAgICAgICAgICAgamE6ICfmrbvjga7lrqPlkYonLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeino+atu+WuoycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaG9ydCBrbm9ja2JhY2sgZnJvbSBFeGRlYXRoXHJcbiAgICAgIGlkOiAnTzROIFZhY3V1bSBXYXZlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0QjgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080TiBFbXBvd2VyZWQgQmxpenphcmQnLCAvLyBSb29tLXdpZGUgQW9FLCBmcmVlemVzIG5vbi1tb3ZpbmcgdGFyZ2V0c1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNEU2JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gTzRTIC0gRGVsdGFzY2FwZSA0LjAgU2F2YWdlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPNFMyIE5lbyBWYWN1dW0gV2F2ZSc6ICcyNDFEJyxcclxuICAgICdPNFMyIEFjY2VsZXJhdGlvbiBCb21iJzogJzI0MzEnLFxyXG4gICAgJ080UzIgRW1wdGluZXNzJzogJzI0MjInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ080UzIgRG91YmxlIExhc2VyJzogJzI0MTUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERlY2lzaXZlIEJhdHRsZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MDgnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMxIFZhY3V1bSBXYXZlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjNGRScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEFsbWFnZXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQxNycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc05lb0V4ZGVhdGggPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJsaXp6YXJkIElJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0Y4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBJZ25vcmUgdW5hdm9pZGFibGUgcmFpZCBhb2UgQmxpenphcmQgSUlJLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiAhZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBUaHVuZGVyIElJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0ZEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgZHVyaW5nIHJhbmRvbSBtZWNoYW5pYyBhZnRlciBkZWNpc2l2ZSBiYXR0bGUuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+IGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgUGV0cmlmaWVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gT24gTmVvLCBiZWluZyBwZXRyaWZpZWQgaXMgYmVjYXVzZSB5b3UgbG9va2VkIGF0IFNocmllaywgc28geW91ciBmYXVsdC5cclxuICAgICAgICBpZiAoZGF0YS5pc05lb0V4ZGVhdGgpXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgICAvLyBPbiBub3JtYWwgRXhEZWF0aCwgdGhpcyBpcyBkdWUgdG8gV2hpdGUgSG9sZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEZvcmtlZCBMaWdodG5pbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQyRScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGgpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjayBDb2xsZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0MUMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMgfHwgW107XHJcbiAgICAgICAgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzLnB1c2gobWF0Y2hlcyk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGFyciA9IGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcztcclxuICAgICAgICBpZiAoIWFycilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoYXJyLmxlbmd0aCA8PSAyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIEhhcmQgdG8ga25vdyB3aG8gc2hvdWxkIGJlIGluIHRoaXMgYW5kIHdobyBzaG91bGRuJ3QsIGJ1dFxyXG4gICAgICAgIC8vIGl0IHNob3VsZCBuZXZlciBoaXQgMyBwZW9wbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBmdWxsVGV4dDogYCR7YXJyWzBdLmFiaWxpdHl9IHggJHthcnIubGVuZ3RofWAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIE83UyAtIFNpZ21hc2NhcGUgMy4wIFNhdmFnZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuU2lnbWFzY2FwZVYzMFNhdmFnZSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzdTIE1pc3NpbGUnOiAnMjc4MicsXHJcbiAgICAnTzdTIENoYWluIENhbm5vbic6ICcyNzhGJyxcclxuICB9LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPN1MgU2VhcmluZyBXaW5kJzogJzI3NzcnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPN1MgU3RvbmVza2luJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMkFCNScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMuc291cmNlLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBhZGQgUGF0Y2ggd2FybmluZ3MgZm9yIGRvdWJsZS91bmJyb2tlbiB0ZXRoZXJzXHJcbi8vIFRPRE86IEhlbGxvIFdvcmxkIGNvdWxkIGhhdmUgYW55IHdhcm5pbmdzIChzb3JyeSlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgTW90aW9uIDEnOiAnMzMzNCcsIC8vIDMwMCsgZGVncmVlIGNsZWF2ZSB3aXRoIGJhY2sgc2FmZSBhcmVhXHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAxJzogJzMzMjknLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBhZnRlciBzcGxpdFxyXG4gICAgJ08xMlMxIEVmZmljaWVudCBCbGFkZXdvcmsgMic6ICczMzJBJywgLy8gT21lZ2EtTSBcImdldCBvdXRcIiBjZW50ZXJlZCBhb2UgZHVyaW5nIGJsYWRlc1xyXG4gICAgJ08xMlMxIEJleW9uZCBTdHJlbmd0aCc6ICczMzI4JywgLy8gT21lZ2EtTSBcImdldCBpblwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgc2hpZWxkXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDEnOiAnMzMzMCcsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBTdGVlbCAyJzogJzMzMzEnLCAvLyBPbWVnYS1GIFwiZ2V0IGZyb250L2JhY2tcIiBibGFkZXMgcGhhc2VcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgQmxpenphcmQgSUlJJzogJzMzMzInLCAvLyBPbWVnYS1GIGdpYW50IGNyb3NzXHJcbiAgICAnTzEyUzIgRGlmZnVzZSBXYXZlIENhbm5vbic6ICczMzY5JywgLy8gYmFjay9zaWRlcyBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAxJzogJzMzNUEnLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgSHlwZXIgUHVsc2UgMic6ICczMzVCJywgLy8gUm90YXRpbmcgQXJjaGl2ZSBQZXJpcGhlcmFsIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IENvbG9zc2FsIEJsb3cnOiAnMzM1RicsIC8vIEV4cGxvZGluZyBBcmNoaXZlIEFsbCBoYW5kc1xyXG4gICAgJ08xMlMyIExlZnQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzYwJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aWNhbCBMYXNlcic6ICczMzQ3JywgLy8gbWlkZGxlIGxhc2VyIGZyb20gZXllXHJcbiAgICAnTzEyUzEgQWR2YW5jZWQgT3B0aWNhbCBMYXNlcic6ICczMzRBJywgLy8gZ2lhbnQgY2lyY2xlIGNlbnRlcmVkIG9uIGV5ZVxyXG4gICAgJ08xMlMyIFJlYXIgUG93ZXIgVW5pdCBSZWFyIExhc2VycyAxJzogJzMzNjEnLCAvLyBBcmNoaXZlIEFsbCBpbml0aWFsIGxhc2VyXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDInOiAnMzM2MicsIC8vIEFyY2hpdmUgQWxsIHJvdGF0aW5nIGxhc2VyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzMzNycsIC8vIGZpcmUgc3ByZWFkXHJcbiAgICAnTzEyUzIgSHlwZXIgUHVsc2UgVGV0aGVyJzogJzMzNUMnLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIHRldGhlcnNcclxuICAgICdPMTJTMiBXYXZlIENhbm5vbic6ICczMzZCJywgLy8gSW5kZXggQW5kIEFyY2hpdmUgUGVyaXBoZXJhbCBiYWl0ZWQgbGFzZXJzXHJcbiAgICAnTzEyUzIgT3B0aW1pemVkIEZpcmUgSUlJJzogJzMzNzknLCAvLyBBcmNoaXZlIEFsbCBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBTYWdpdHRhcml1cyBBcnJvdyc6ICczMzREJywgLy8gT21lZ2EtTSBiYXJkIGxpbWl0IGJyZWFrXHJcbiAgICAnTzEyUzIgT3ZlcnNhbXBsZWQgV2F2ZSBDYW5ub24nOiAnMzM2NicsIC8vIE1vbml0b3IgdGFuayBidXN0ZXJzXHJcbiAgICAnTzEyUzIgU2F2YWdlIFdhdmUgQ2Fubm9uJzogJzMzNkQnLCAvLyBUYW5rIGJ1c3RlciB3aXRoIHRoZSB2dWxuIGZpcnN0XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIERpc2NoYXJnZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczMzI3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID0gZGF0YS52dWxuIHx8IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA9IGRhdGEudnVsbiB8fCB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgRGFtYWdlJyxcclxuICAgICAgLy8gMzMyRSA9IFBpbGUgUGl0Y2ggc3RhY2tcclxuICAgICAgLy8gMzMzRSA9IEVsZWN0cmljIFNsaWRlIChPbWVnYS1NIHNxdWFyZSAxLTQgZGFzaGVzKVxyXG4gICAgICAvLyAzMzNGID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLUYgdHJpYW5nbGUgMS00IGRhc2hlcylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyczMzJFJywgJzMzM0UnLCAnMzMzRiddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEudnVsbiAmJiBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAod2l0aCB2dWxuKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChtaXQgVmVyd3VuZGJhcmtlaXQpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOiiq+ODgOODoeODvOOCuOS4iuaYhylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5bim5piT5LykKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gQnlha2tvIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUphZGVTdG9hRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBQb3BwaW5nIFVucmVsZW50aW5nIEFuZ3Vpc2ggYnViYmxlc1xyXG4gICAgJ0J5YUV4IEFyYXRhbWEnOiAnMjdGNicsXHJcbiAgICAvLyBTdGVwcGluZyBpbiBncm93aW5nIG9yYlxyXG4gICAgJ0J5YUV4IFZhY3V1bSBDbGF3JzogJzI3RTknLFxyXG4gICAgLy8gTGlnaHRuaW5nIFB1ZGRsZXNcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDEnOiAnMjdFNScsXHJcbiAgICAnQnlhRXggSHVuZGVyZm9sZCBIYXZvYyAyJzogJzI3RTYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0J5YUV4IFN3ZWVwIFRoZSBMZWcnOiAnMjdEQicsXHJcbiAgICAnQnlhRXggRmlyZSBhbmQgTGlnaHRuaW5nJzogJzI3REUnLFxyXG4gICAgJ0J5YUV4IERpc3RhbnQgQ2xhcCc6ICcyN0REJyxcclxuICAgIC8vIE1pZHBoYXNlIGxpbmUgYXR0YWNrXHJcbiAgICAnQnlhRXggSW1wZXJpYWwgR3VhcmQnOiAnMjdGMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBQaW5rIGJ1YmJsZSBjb2xsaXNpb25cclxuICAgICAgaWQ6ICdCeWFFeCBPbWlub3VzIFdpbmQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjdFQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidWJibGUgY29sbGlzaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdCbGFzZW4gc2luZCB6dXNhbW1lbmdlc3Rvw59lbicsXHJcbiAgICAgICAgICAgIGZyOiAnY29sbGlzaW9uIGRlIGJ1bGxlcycsXHJcbiAgICAgICAgICAgIGphOiAn6KGd56qBJyxcclxuICAgICAgICAgICAgY246ICfnm7jmkp4nLFxyXG4gICAgICAgICAgICBrbzogJ+yepe2MkCDqsrnss5DshJwg7YSw7KeQJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBTaGlucnl1IE5vcm1hbFxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVJveWFsTWVuYWdlcmllLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTaGlucnl1IEFraCBSaGFpJzogJzFGQTYnLCAvLyBTa3kgbGFzZXJzIGFsb25nc2lkZSBBa2ggTW9ybi5cclxuICAgICdTaGlucnl1IEJsYXppbmcgVHJhaWwnOiAnMjIxQScsIC8vIFJlY3RhbmdsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkcy5cclxuICAgICdTaGlucnl1IENvbGxhcHNlJzogJzIyMTgnLCAvLyBDaXJjbGUgQW9FcywgaW50ZXJtaXNzaW9uIGFkZHNcclxuICAgICdTaGlucnl1IERyYWdvbmZpc3QnOiAnMjRGMCcsIC8vIEdpYW50IHB1bmNoeSBjaXJjbGUgaW4gdGhlIGNlbnRlci5cclxuICAgICdTaGlucnl1IEVhcnRoIEJyZWF0aCc6ICcxRjlEJywgLy8gQ29uYWwgYXR0YWNrcyB0aGF0IGFyZW4ndCBhY3R1YWxseSBFYXJ0aCBTaGFrZXJzLlxyXG4gICAgJ1NoaW5yeXUgR3lyZSBDaGFyZ2UnOiAnMUZBOCcsIC8vIEdyZWVuIGRpdmUgYm9tYiBhdHRhY2suXHJcbiAgICAnU2hpbnJ5dSBTcGlrZXNpY2xlJzogJzFGQWAnLCAvLyBCbHVlLWdyZWVuIGxpbmUgYXR0YWNrcyBmcm9tIGJlaGluZC5cclxuICAgICdTaGlucnl1IFRhaWwgU2xhcCc6ICcxRjkzJywgLy8gUmVkIHNxdWFyZXMgaW5kaWNhdGluZyB0aGUgdGFpbCdzIGxhbmRpbmcgc3BvdHMuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTaGlucnl1IExldmluYm9sdCc6ICcxRjlDJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEljeSBmbG9vciBhdHRhY2suXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBEaWFtb25kIER1c3QnLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfmu5HjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+a7keiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaW5yeXUgVGlkYWwgV2F2ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxRjhCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gS25vY2tiYWNrIGZyb20gY2VudGVyLlxyXG4gICAgICBpZDogJ1NoaW5yeXUgQWVyaWFsIEJsYXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFGOTAnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3NlciAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFN1c2FubyBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVQb29sT2ZUcmlidXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3VzRXggQ2h1cm5pbmcnOiAnMjAzRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnU3VzRXggUmFzZW4gS2Fpa3lvJzogJzIwMkUnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVWx0aW1hIFdlYXBvbiBVbHRpbWF0ZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2VhcG9uc1JlZnJhaW5VbHRpbWF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVVdVIFNlYXJpbmcgV2luZCc6ICcyQjVDJyxcclxuICAgICdVV1UgRXJ1cHRpb24nOiAnMkI1QScsXHJcbiAgICAnVVdVIFdlaWdodCc6ICcyQjY1JyxcclxuICAgICdVV1UgTGFuZHNsaWRlMSc6ICcyQjcwJyxcclxuICAgICdVV1UgTGFuZHNsaWRlMic6ICcyQjcxJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVV1UgR3JlYXQgV2hpcmx3aW5kJzogJzJCNDEnLFxyXG4gICAgJ1VXVSBTbGlwc3RyZWFtJzogJzJCNTMnLFxyXG4gICAgJ1VXVSBXaWNrZWQgV2hlZWwnOiAnMkI0RScsXHJcbiAgICAnVVdVIFdpY2tlZCBUb3JuYWRvJzogJzJCNEYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdVV1UgV2luZGJ1cm4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRUInIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDIsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gRmVhdGhlcmxhbmNlIGV4cGxvc2lvbi4gIEl0IHNlZW1zIGxpa2UgdGhlIHBlcnNvbiB3aG8gcG9wcyBpdCBpcyB0aGVcclxuICAgICAgLy8gZmlyc3QgcGVyc29uIGxpc3RlZCBkYW1hZ2Utd2lzZSwgc28gdGhleSBhcmUgbGlrZWx5IHRoZSBjdWxwcml0LlxyXG4gICAgICBpZDogJ1VXVSBGZWF0aGVybGFuY2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMkI0MycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcywga0ZsYWdJbnN0YW50RGVhdGggfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVUNVIC0gVGhlIFVuZW5kaW5nIENvaWwgT2YgQmFoYW11dCAoVWx0aW1hdGUpXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVVbmVuZGluZ0NvaWxPZkJhaGFtdXRVbHRpbWF0ZSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVUNVIEx1bmFyIER5bmFtbyc6ICcyNkJDJyxcclxuICAgICdVQ1UgSXJvbiBDaGFyaW90JzogJzI2QkInLFxyXG4gICAgJ1VDVSBFeGFmbGFyZSc6ICcyNkVGJyxcclxuICAgICdVQ1UgV2luZ3MgT2YgU2FsdmF0aW9uJzogJzI2Q0EnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgVHdpc3RlciBEZWF0aCcsXHJcbiAgICAgIC8vIEluc3RhbnQgZGVhdGggaGFzIGEgc3BlY2lhbCBmbGFnIHZhbHVlLCBkaWZmZXJlbnRpYXRpbmdcclxuICAgICAgLy8gZnJvbSB0aGUgZXhwbG9zaW9uIGRhbWFnZSB5b3UgdGFrZSB3aGVuIHNvbWVib2R5IGVsc2VcclxuICAgICAgLy8gcG9wcyBvbmUuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkFCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzLCBmbGFnczoga0ZsYWdJbnN0YW50RGVhdGggfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVHdpc3RlciBQb3AnLFxyXG4gICAgICAgICAgICBkZTogJ1dpcmJlbHN0dXJtIGJlcsO8aHJ0JyxcclxuICAgICAgICAgICAgZnI6ICdBcHBhcml0aW9uIGRlcyB0b3JuYWRlcycsXHJcbiAgICAgICAgICAgIGphOiAn44OE44Kk44K544K/44O8JyxcclxuICAgICAgICAgICAgY246ICfml4vpo44nLFxyXG4gICAgICAgICAgICBrbzogJ+2ajOyYpOumrCDrsJ/snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgVGhlcm1pb25pYyBCdXJzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BpenphIFNsaWNlJyxcclxuICAgICAgICAgICAgZGU6ICdQaXp6YXN0w7xjaycsXHJcbiAgICAgICAgICAgIGZyOiAnUGFydHMgZGUgcGl6emEnLFxyXG4gICAgICAgICAgICBqYTogJ+OCteODvOODn+OCquODi+ODg+OCr+ODkOODvOOCueODiCcsXHJcbiAgICAgICAgICAgIGNuOiAn5aSp5bSp5Zyw6KOCJyxcclxuICAgICAgICAgICAga286ICfsnqXtjJDsl5Ag66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIENoYWluIExpZ2h0bmluZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkM4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBJdCdzIGhhcmQgdG8gYXNzaWduIGJsYW1lIGZvciBsaWdodG5pbmcuICBUaGUgZGVidWZmc1xyXG4gICAgICAgIC8vIGdvIG91dCBhbmQgdGhlbiBleHBsb2RlIGluIG9yZGVyLCBidXQgdGhlIGF0dGFja2VyIGlzXHJcbiAgICAgICAgLy8gdGhlIGRyYWdvbiBhbmQgbm90IHRoZSBwbGF5ZXIuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2hpdCBieSBsaWdodG5pbmcnLFxyXG4gICAgICAgICAgICBkZTogJ3ZvbSBCbGl0eiBnZXRyb2ZmZW4nLFxyXG4gICAgICAgICAgICBmcjogJ2ZyYXBww6koZSkgcGFyIGxhIGZvdWRyZScsXHJcbiAgICAgICAgICAgIGphOiAn44OB44Kn44Kk44Oz44Op44Kk44OI44OL44Oz44KwJyxcclxuICAgICAgICAgICAgY246ICfpm7flhYnpk74nLFxyXG4gICAgICAgICAgICBrbzogJ+uyiOqwnCDrp57snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgQnVybnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRkEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFNsdWRnZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMUYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIERvb20gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlIGlzIG5vIGNhbGxvdXQgZm9yIFwieW91IGZvcmdvdCB0byBjbGVhciBkb29tXCIuICBUaGUgbG9ncyBsb29rXHJcbiAgICAgIC8vIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgIC8vICAgWzIwOjAyOjMwLjU2NF0gMUE6T2tvbm9taSBZYWtpIGdhaW5zIHRoZSBlZmZlY3Qgb2YgRG9vbSBmcm9tICBmb3IgNi4wMCBTZWNvbmRzLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIFByb3RlY3QgZnJvbSBUYWtvIFlha2kuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM2LjQ0M10gMUU6T2tvbm9taSBZYWtpIGxvc2VzIHRoZSBlZmZlY3Qgb2YgRG9vbSBmcm9tIC5cclxuICAgICAgLy8gICBbMjA6MDI6MzguNTI1XSAxOTpPa29ub21pIFlha2kgd2FzIGRlZmVhdGVkIGJ5IEZpcmVob3JuLlxyXG4gICAgICAvLyBJbiBvdGhlciB3b3JkcywgZG9vbSBlZmZlY3QgaXMgcmVtb3ZlZCArLy0gbmV0d29yayBsYXRlbmN5LCBidXQgY2FuJ3RcclxuICAgICAgLy8gdGVsbCB1bnRpbCBsYXRlciB0aGF0IGl0IHdhcyBhIGRlYXRoLiAgQXJndWFibHksIHRoaXMgY291bGQgaGF2ZSBiZWVuIGFcclxuICAgICAgLy8gY2xvc2UtYnV0LXN1Y2Nlc3NmdWwgY2xlYXJpbmcgb2YgZG9vbSBhcyB3ZWxsLiAgSXQgbG9va3MgdGhlIHNhbWUuXHJcbiAgICAgIC8vIFN0cmF0ZWd5OiBpZiB5b3UgaGF2ZW4ndCBjbGVhcmVkIGRvb20gd2l0aCAxIHNlY29uZCB0byBnbyB0aGVuIHlvdSBwcm9iYWJseVxyXG4gICAgICAvLyBkaWVkIHRvIGRvb20uICBZb3UgY2FuIGdldCBub24tZmF0YWxseSBpY2ViYWxsZWQgb3IgYXV0bydkIGluIGJldHdlZW4sXHJcbiAgICAgIC8vIGJ1dCB3aGF0IGNhbiB5b3UgZG8uXHJcbiAgICAgIGlkOiAnVUNVIERvb20gRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDEsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tIHx8ICFkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGxldCByZWFzb247XHJcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pO1xyXG4gICAgICAgIGlmIChkdXJhdGlvbiA8IDkpXHJcbiAgICAgICAgICByZWFzb24gPSBtYXRjaGVzLmVmZmVjdCArICcgIzEnO1xyXG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uIDwgMTQpXHJcbiAgICAgICAgICByZWFzb24gPSBtYXRjaGVzLmVmZmVjdCArICcgIzInO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMyc7XHJcbiAgICAgICAgcmV0dXJuIHsgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogcmVhc29uIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGhlIENvcGllZCBGYWN0b3J5XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDb3BpZWRGYWN0b3J5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iJzogJzQ4QjQnLFxyXG4gICAgLy8gTWFrZSBzdXJlIGVuZW1pZXMgYXJlIGlnbm9yZWQgb24gdGhlc2VcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iYXJkbWVudCc6ICc0OEI4JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBBc3NhdWx0JzogJzQ4QjYnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzQ4QzUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gU3BpbiAxJzogJzQ4Q0InLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gMic6ICc0OENDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIENlbnRyaWZ1Z2FsIFNwaW4nOiAnNDhDOScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBBaXItVG8tU3VyZmFjZSBFbmVyZ3knOiAnNDhCQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLUNhbGliZXIgTGFzZXInOiAnNDhGQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAxJzogJzQ4QkMnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMic6ICc0OEJEJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDMnOiAnNDhCRScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA0JzogJzQ4QzAnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNSc6ICc0OEMxJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDYnOiAnNDhDMicsXHJcblxyXG4gICAgJ0NvcGllZCBUcmFzaCBFbmVyZ3kgQm9tYic6ICc0OTFEJyxcclxuICAgICdDb3BpZWQgVHJhc2ggRnJvbnRhbCBTb21lcnNhdWx0JzogJzQ5MUInLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBIaWdoLUZyZXF1ZW5jeSBMYXNlcic6ICc0OTFFJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ja2luZyBEaXNjaGFyZ2UnOiAnNDgwQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAxJzogJzQ5QzUnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMic6ICc0OUM2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDMnOiAnNDlDNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA0JzogJzQ4MEYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNSc6ICc0ODEwJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDYnOiAnNDgxMScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAxJzogJzQ4MDInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAyJzogJzQ4MDMnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAzJzogJzQ4MDQnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFRvd2VyZmFsbCc6ICc0ODEzJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDEnOiAnNDgxNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDInOiAnNDgxNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDMnOiAnNDgxOCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgT2lsIFdlbGwnOiAnNDgxQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBFbGVjdHJvbWFnbmV0aWMgUHVsc2UnOiAnNDgxOScsXHJcbiAgICAvLyBUT0RPOiB3aGF0J3MgdGhlIGVsZWN0cmlmaWVkIGZsb29yIHdpdGggY29udmV5b3IgYmVsdHM/XHJcblxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDEnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMic6ICc0OTM4JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAzJzogJzQ5MzknLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDQnOiAnNDkzQScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBMYXNlciBUdXJyZXQnOiAnNDhFNicsXHJcblxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBBcmVhIEJvbWJpbmcnOiAnNDk0MycsXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc0OTQwJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDEnOiAnNDcyOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDInOiAnNDcyOCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDMnOiAnNDcyRicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDQnOiAnNDczMScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDUnOiAnNDcyQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDYnOiAnNDcyRCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDcnOiAnNDczMicsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgSW5jZW5kaWFyeSBCb21iaW5nJzogJzQ3MzknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgR3VpZGVkIE1pc3NpbGUnOiAnNDczNicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBTdXJmYWNlIE1pc3NpbGUnOiAnNDczNCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBMYXNlciBTaWdodCc6ICc0NzNCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEZyYWNrJzogJzQ3NEQnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggQ3J1c2gnOiAnNDhGQycsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBDcnVzaGluZyBXaGVlbCc6ICc0NzRCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggVGhydXN0JzogJzQ4RkMnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTGFzZXIgU3VwcHJlc3Npb24nOiAnNDhFMCcsIC8vIENhbm5vbnNcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAxJzogJzQ5NzQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDInOiAnNDhEQycsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMyc6ICc0OEU0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCA0JzogJzQ4RTAnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTWFyeCBJbXBhY3QnOiAnNDhENCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDEnOiAnNDhFOCcsXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMic6ICc0OEU5JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDEnOiAnNDhBNScsXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDInOiAnNDhBNycsXHJcblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ydC1SYW5nZSBNaXNzaWxlJzogJzQ4MTUnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogNTA5MyB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDRGQjUgdGFraW5nIEhpZ2gtUG93ZXJlZCBMYXNlciB3aXRoIGEgdnVsbiAoYmVjYXVzZSBvZiB0YWtpbmcgdHdvKVxyXG4vLyBUT0RPOiA1MEQzIEFlcmlhbCBTdXBwb3J0OiBCb21iYXJkbWVudCBnb2luZyBvZmYgZnJvbSBhZGRcclxuLy8gVE9ETzogNTIxMSBNYW5ldXZlcjogVm9sdCBBcnJheSBub3QgZ2V0dGluZyBpbnRlcnJ1cHRlZFxyXG4vLyBUT0RPOiA0RkY0LzRGRjUgT25lIG9mIHRoZXNlIGlzIGZhaWxpbmcgY2hlbWljYWwgY29uZmxhZ3JhdGlvblxyXG4vLyBUT0RPOiBzdGFuZGluZyBpbiB3cm9uZyB0ZWxlcG9ydGVyPz8gbWF5YmUgNTM2Mz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVQdXBwZXRzQnVua2VyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDEnOiAnNTA3NCcsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMic6ICc1MDc1JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAzJzogJzUwNzYnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQ29sbGlkZXIgQ2Fubm9ucyc6ICc1MDdFJywgLy8gcm90YXRpbmcgcmVkIGdyb3VuZCBhb2UgcGlud2hlZWxcclxuICAgICdQdXBwZXQgQWVnaXMgU3VyZmFjZSBMYXNlciAxJzogJzUwOTEnLCAvLyBjaGFzaW5nIGxhc2VyIGluaXRpYWxcclxuICAgICdQdXBwZXQgQWVnaXMgU3VyZmFjZSBMYXNlciAyJzogJzUwOTInLCAvLyBjaGFzaW5nIGxhc2VyIGNoYXNpbmdcclxuICAgICdQdXBwZXQgQWVnaXMgRmxpZ2h0IFBhdGgnOiAnNTA4QycsIC8vIGJsdWUgbGluZSBhb2UgZnJvbSBmbHlpbmcgdW50YXJnZXRhYmxlIGFkZHNcclxuICAgICdQdXBwZXQgQWVnaXMgUmVmcmFjdGlvbiBDYW5ub25zIDEnOiAnNTA4MScsIC8vIHJlZnJhY3Rpb24gY2Fubm9ucyBiZXR3ZWVuIHdpbmdzXHJcbiAgICAnUHVwcGV0IEFlZ2lzIExpZmVcXCdzIExhc3QgU29uZyc6ICc1M0IzJywgLy8gcmluZyBhb2Ugd2l0aCBnYXBcclxuICAgICdQdXBwZXQgTGlnaHQgTG9uZy1CYXJyZWxlZCBMYXNlcic6ICc1MjEyJywgLy8gbGluZSBhb2UgZnJvbSBhZGRcclxuICAgICdQdXBwZXQgTGlnaHQgU3VyZmFjZSBNaXNzaWxlIEltcGFjdCc6ICc1MjBGJywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lIGZyb20gTm8gUmVzdHJpY3Rpb25zXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEluY2VuZGlhcnkgQm9tYmluZyc6ICc0RkI5JywgLy8gZmlyZSBwdWRkbGUgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTaGFycCBUdXJuJzogJzUwNkQnLCAvLyBzaGFycCB0dXJuIGRhc2hcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU3RhbmRhcmQgU3VyZmFjZSBNaXNzaWxlIDEnOiAnNEZCMScsIC8vIExldGhhbCBSZXZvbHV0aW9uIGNpcmNsZXNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU3RhbmRhcmQgU3VyZmFjZSBNaXNzaWxlIDInOiAnNEZCMicsIC8vIExldGhhbCBSZXZvbHV0aW9uIGNpcmNsZXNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU3RhbmRhcmQgU3VyZmFjZSBNaXNzaWxlIDMnOiAnNEZCMycsIC8vIExldGhhbCBSZXZvbHV0aW9uIGNpcmNsZXNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU2xpZGluZyBTd2lwZSAxJzogJzUwNkYnLCAvLyByaWdodC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDInOiAnNTA3MCcsIC8vIGxlZnQtaGFuZGVkIHNsaWRpbmcgc3dpcGVcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgR3VpZGVkIE1pc3NpbGUnOiAnNEZCOCcsIC8vIGdyb3VuZCBhb2UgZHVyaW5nIEFyZWEgQm9tYmFyZG1lbnRcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSGlnaC1PcmRlciBFeHBsb3NpdmUgQmxhc3QgMSc6ICc0RkMwJywgLy8gc3RhciBhb2VcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSGlnaC1PcmRlciBFeHBsb3NpdmUgQmxhc3QgMic6ICc0RkMxJywgLy8gc3RhciBhb2VcclxuICAgICdQdXBwZXQgSGVhdnkgRW5lcmd5IEJvbWJhcmRtZW50JzogJzRGRkMnLCAvLyBjb2xvcmVkIG1hZ2ljIGhhbW1lci15IGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgSGVhdnkgUmV2b2x2aW5nIExhc2VyJzogJzUwMDAnLCAvLyBnZXQgdW5kZXIgbGFzZXJcclxuICAgICdQdXBwZXQgSGVhdnkgRW5lcmd5IEJvbWInOiAnNEZGQScsIC8vIGdldHRpbmcgaGl0IGJ5IGJhbGwgZHVyaW5nIEFjdGl2ZSBTdXBwcmVzc2l2ZSBVbml0XHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMTAgTGFzZXInOiAnNEZGMCcsIC8vIGxhc2VyIHBvZFxyXG4gICAgJ1B1cHBldCBIZWF2eSBSMDMwIEhhbW1lcic6ICc0RkYxJywgLy8gY2lyY2xlIGFvZSBwb2RcclxuICAgICdQdXBwZXQgSGFsbHdheSBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNTBCMScsIC8vIGxvbmcgYW9lIGluIHRoZSBoYWxsd2F5IHNlY3Rpb25cclxuICAgICdQdXBwZXQgSGFsbHdheSBFbmVyZ3kgQm9tYic6ICc1MEIyJywgLy8gcnVubmluZyBpbnRvIGEgZmxvYXRpbmcgb3JiXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2hhbmljYWwgRGlzc2VjdGlvbic6ICc1MUIzJywgLy8gc3Bpbm5pbmcgdmVydGljYWwgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEZWNhcGl0YXRpb24nOiAnNTFCNCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNobmljYWwgQ29udHVzaW9uIFVudGFyZ2V0ZWQnOiAnNTFCNycsIC8vIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSZWxlbnRsZXNzIFNwaXJhbCAxJzogJzUxQUEnLCAvLyB0cmlwbGUgdW50YXJnZXRlZCBncm91bmQgYW9lc1xyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSZWxlbnRsZXNzIFNwaXJhbCAyJzogJzUxQ0InLCAvLyB0cmlwbGUgdW50YXJnZXRlZCBncm91bmQgYW9lc1xyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBPdXQgMSc6ICc1NDFGJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IG91dFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBPdXQgMic6ICc1MTk4JywgLy8gMlAvcHVwcGV0IHRlbGVwb3J0aW5nL3JlcHJvZHVjZSBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEJlaGluZCAxJzogJzU0MjAnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgYmVoaW5kXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEJlaGluZCAyJzogJzUxOTknLCAvLyAyUCB0ZWxlcG9ydGluZyBwcmltZSBibGFkZSBnZXQgYmVoaW5kXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDEnOiAnNTQyMScsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBpblxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBJbiAyJzogJzUxOUEnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBpblxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSMDEyIExhc2VyIEdyb3VuZCc6ICc1MUFFJywgLy8gdW50YXJnZXRlZCBncm91bmQgY2lyY2xlXHJcbiAgICAvLyBUaGlzIGlzLi4uIHRvbyBub2lzeS5cclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDEnOiAnNTFBMCcsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBqdW1wXHJcbiAgICAvLyAnUHVwcGV0IENvbXBvdW5kIDJQIEZvdXIgUGFydHMgUmVzb2x2ZSAyJzogJzUxOUYnLCAvLyBmb3VyIHBhcnRzIHJlc29sdmUgY2xlYXZlXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnUHVwcGV0IEhlYXZ5IFVwcGVyIExhc2VyIDEnOiAnNTA4NycsIC8vIHVwcGVyIGxhc2VyIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMic6ICc0RkY3JywgLy8gdXBwZXIgbGFzZXIgY29udGludW91c1xyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAxJzogJzUwODYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMic6ICc0RkY2JywgLy8gbG93ZXIgbGFzZXIgZmlyc3Qgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDMnOiAnNTA4OCcsIC8vIGxvd2VyIGxhc2VyIHNlY29uZCBzZWN0aW9uIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgNCc6ICc0RkY4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gY29udGludW91c1xyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA1JzogJzUwODknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgNic6ICc0RkY5JywgLy8gbG93ZXIgbGFzZXIgdGhpcmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIEluY29uZ3J1b3VzIFNwaW4nOiAnNTFCMicsIC8vIGZpbmQgdGhlIHNhZmUgc3BvdCBkb3VibGUgZGFzaFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHByZXR0eSBsYXJnZSBhbmQgZ2V0dGluZyBoaXQgYnkgaW5pdGlhbCB3aXRob3V0IGJ1cm5zIHNlZW1zIGZpbmUuXHJcbiAgICAvLyAnUHVwcGV0IExpZ2h0IEhvbWluZyBNaXNzaWxlIEltcGFjdCc6ICc1MjEwJywgLy8gdGFyZ2V0ZWQgZmlyZSBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgSGVhdnkgVW5jb252ZW50aW9uYWwgVm9sdGFnZSc6ICc1MDA0JyxcclxuICAgIC8vIFByZXR0eSBub2lzeS5cclxuICAgICdQdXBwZXQgTWFuZXV2ZXIgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwMDInLCAvLyB0YW5rIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVGFyZ2V0ZWQnOiAnNTFCNicsIC8vIHRhcmdldGVkIHNwcmVhZCBtYXJrZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUUnLCAvLyB0YXJnZXRlZCBzcHJlYWQgcG9kIGxhc2VyIG9uIG5vbi10YW5rXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQW50aS1QZXJzb25uZWwgTGFzZXInOiAnNTA5MCcsIC8vIHRhbmsgYnVzdGVyIG1hcmtlclxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBQcmVjaXNpb24tR3VpZGVkIE1pc3NpbGUnOiAnNEZDNScsXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgVGFuayc6ICc1MUFEJywgLy8gdGFyZ2V0ZWQgcG9kIGxhc2VyIG9uIHRhbmtcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1B1cHBldCBCdXJucyc6ICcxMEInLCAvLyBzdGFuZGluZyBpbiBtYW55IHZhcmlvdXMgZmlyZSBhb2VzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgU2hvY2sgQmxhY2sgMj9cclxuLy8gVE9ETzogV2hpdGUvQmxhY2sgRGlzc29uYW5jZSBkYW1hZ2UgaXMgbWF5YmUgd2hlbiBmbGFncyBlbmQgaW4gMDM/XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVG93ZXJBdFBhcmFkaWdtc0JyZWFjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IENlbnRlciAxJzogJzVFQTcnLCAvLyBDZW50ZXIgYW9lIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMic6ICc2MEM4JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDEnOiAnNUVBNScsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAyJzogJzVFQTYnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMyc6ICc2MEM2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgNCc6ICc2MEM3JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQnVyc3QnOiAnNUVENCcsIC8vIFNwaGVyb2lkIEtuYXZpc2ggQnVsbGV0cyBjb2xsaXNpb25cclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBCYXJyYWdlJzogJzVFQUMnLCAvLyBTcGhlcm9pZCBsaW5lIGFvZXNcclxuICAgICdUb3dlciBIYW5zZWwgUmVwYXknOiAnNUM3MCcsIC8vIFNoaWVsZCBkYW1hZ2VcclxuICAgICdUb3dlciBIYW5zZWwgRXhwbG9zaW9uJzogJzVDNjcnLCAvLyBCZWluZyBoaXQgYnkgTWFnaWMgQnVsbGV0IGR1cmluZyBQYXNzaW5nIExhbmNlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEltcGFjdCc6ICc1QzVDJywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljYWwgQ29uZmx1ZW5jZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAxJzogJzVDNkMnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDInOiAnNUM2RCcsIC8vIER1YWwgY2xlYXZlcyB3aXRob3V0IHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMyc6ICc1QzZFJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCA0JzogJzVDNkYnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgUGFzc2luZyBMYW5jZSc6ICc1QzY2JywgLy8gVGhlIFBhc3NpbmcgTGFuY2UgY2hhcmdlIGl0c2VsZlxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDEnOiAnNTVCMycsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDInOiAnNUM1RCcsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDMnOiAnNUM1RScsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBIdW5ncnkgTGFuY2UgMSc6ICc1QzcxJywgLy8gMnhsYXJnZSBjb25hbCBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBIdW5ncnkgTGFuY2UgMic6ICc1QzcyJywgLy8gMnhsYXJnZSBjb25hbCBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc1QkZFJywgLy8gbGFyZ2Ugcm9vbSBjbGVhdmVcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBTdGFuZGFyZCBMYXNlcic6ICc1QkZGJywgLy8gdHJhY2tpbmcgbGFzZXJcclxuICAgICdUb3dlciAyUCBXaGlybGluZyBBc3NhdWx0JzogJzVCRkInLCAvLyBsaW5lIGFvZSBmcm9tIDJQIGNsb25lc1xyXG4gICAgJ1Rvd2VyIDJQIEJhbGFuY2VkIEVkZ2UnOiAnNUJGQScsIC8vIGNpcmN1bGFyIGFvZSBvbiAyUCBjbG9uZXNcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDEnOiAnNjAwNicsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDInOiAnNjAwNycsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDMnOiAnNjAwOCcsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDQnOiAnNjAwOScsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDUnOiAnNjMxMCcsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDYnOiAnNjMxMScsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDcnOiAnNjMxMicsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDgnOiAnNjMxMycsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBXaGl0ZSAxJzogJzYwMEYnLCAvLyB3aGl0ZSBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIGJsYWNrXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMic6ICc2MDEwJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIEJsYWNrIDEnOiAnNjAxMScsIC8vIGJsYWNrIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gd2hpdGVcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAxJzogJzYwMUYnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IFdoaXRlIDInOiAnNjAyMScsIC8vIGJlaW5nIGhpdCBieSBhIHdoaXRlIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMSc6ICc2MDIwJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBCbGFjayAyJzogJzYwMjInLCAvLyBiZWluZyBoaXQgYnkgYSBibGFjayBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFdpcGUgV2hpdGUnOiAnNjAwQycsIC8vIG5vdCBsaW5lIG9mIHNpZ2h0aW5nIHRoZSB3aGl0ZSBtZXRlb3JcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIEJsYWNrJzogJzYwMEQnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgYmxhY2sgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgRGlmZnVzZSBFbmVyZ3knOiAnNjA1NicsIC8vIHJvdGF0aW5nIGNsb25lIGJ1YmJsZSBjbGVhdmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUHlsb24gQmlnIEV4cGxvc2lvbic6ICc2MDI3JywgLy8gbm90IGtpbGxpbmcgYSBweWxvbiBkdXJpbmcgaGFja2luZyBwaGFzZVxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEV4cGxvc2lvbic6ICc2MDI2JywgLy8gcHlsb24gZHVyaW5nIENoaWxkJ3MgcGxheVxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgTWlkZGxlJzogJzVDMDInLCAvLyBtaWRkbGUgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIFNpZGVzJzogJzVDMDUnLCAvLyBzaWRlcyBsYXNlclxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgMyc6ICc2MDc4JywgLy8gZ29lcyB3aXRoIDVDMDFcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDQnOiAnNjA3OScsIC8vIGdvZXMgd2l0aCA1QzA0XHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRW5lcmd5IEJvbWInOiAnNUMwNScsIC8vIHBpbmsgYnViYmxlXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWRlIE1hZ2ljIFJpZ2h0JzogJzVCRDcnLCAvLyByb3RhdGluZyB3aGVlbCBnb2luZyByaWdodFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBMZWZ0JzogJzVCRDYnLCAvLyByb3RhdGluZyB3aGVlbCBnb2luZyBsZWZ0XHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBMaWdodGVyIE5vdGUnOiAnNUJEQScsIC8vIGxpZ2h0ZXIgbm90ZSBtb3ZpbmcgYW9lc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFnaWNhbCBJbnRlcmZlcmVuY2UnOiAnNUJENScsIC8vIGxhc2VycyBkdXJpbmcgUmh5dGhtIFJpbmdzXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBTY2F0dGVyZWQgTWFnaWMnOiAnNUJERicsIC8vIGNpcmNsZSBhb2VzIGZyb20gU2VlZCBPZiBNYWdpY1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIFVuZXZlbiBGb3R0aW5nJzogJzVCRTInLCAvLyBidWlsZGluZyBmcm9tIFJlY3JlYXRlIFN0cnVjdHVyZVxyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIENyYXNoJzogJzVCRTUnLCAvLyB0cmFpbnMgZnJvbSBNaXhlZCBTaWduYWxzXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgSGVhdnkgQXJtcyAxJzogJzVCRUQnLCAvLyBoZWF2eSBhcm1zIGZyb250L2JhY2sgYXR0YWNrXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgSGVhdnkgQXJtcyAyJzogJzVCRUYnLCAvLyBoZWF2eSBhcm1zIHNpZGVzIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEVuZXJneSBTY2F0dGVyZWQgTWFnaWMnOiAnNUJFOCcsIC8vIG9yYnMgZnJvbSBSZWQgR2lybCBieSB0cmFpblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIFBsYWNlIE9mIFBvd2VyJzogJzVDMEQnLCAvLyBpbnN0YWRlYXRoIG1pZGRsZSBjaXJjbGUgYmVmb3JlIGJsYWNrL3doaXRlIHJpbmdzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQWxwaGEnOiAnNUVBQicsIC8vIFNwcmVhZFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBTZWVkIE9mIE1hZ2ljIEFscGhhJzogJzVDNjEnLCAvLyBTcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEFydGlsbGVyeSBCZXRhJzogJzVFQjMnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgTWFuaXB1bGF0ZSBFbmVyZ3knOiAnNjAxQScsIC8vIFRhbmtidXN0ZXJcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIERhcmtlciBOb3RlJzogJzVCREMnLCAvLyBUYW5rYnVzdGVyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1Rvd2VyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgLy8gNUVCMSA9IEtuYXZlIEx1bmdlXHJcbiAgICAgIC8vIDVCRjIgPSBIZXIgSW5mbG9yZXNlbmNlIFNob2Nrd2F2ZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNUVCMScsICc1QkYyJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ba2FkYWVtaWFBbnlkZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FueWRlciBBY3JpZCBTdHJlYW0nOiAnNDMwNCcsXHJcbiAgICAnQW55ZGVyIFdhdGVyc3BvdXQnOiAnNDMwNicsXHJcbiAgICAnQW55ZGVyIFJhZ2luZyBXYXRlcnMnOiAnNDMwMicsXHJcbiAgICAnQW55ZGVyIFZpb2xlbnQgQnJlYWNoJzogJzQzMDUnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDEnOiAnM0UwOCcsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMic6ICczRTBBJyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDEnOiAnM0UwOScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAyJzogJzNFMEInLFxyXG4gICAgJ0FueWRlciBBcXVhdGljIExhbmNlJzogJzNFMDUnLFxyXG4gICAgJ0FueWRlciBTeXJ1cCBTcG91dCc6ICc0MzA4JyxcclxuICAgICdBbnlkZXIgTmVlZGxlIFN0b3JtJzogJzQzMDknLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDEnOiAnM0UxMCcsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMic6ICczRTExJyxcclxuICAgICdBbnlkZXIgUHV0cmlkIEJyZWF0aCc6ICczRTEyJyxcclxuICAgICdBbnlkZXIgRGV0b25hdG9yJzogJzQzMEYnLFxyXG4gICAgJ0FueWRlciBEb21pbmlvbiBTbGFzaCc6ICc0MzBEJyxcclxuICAgICdBbnlkZXIgUXVhc2FyJzogJzQzMEInLFxyXG4gICAgJ0FueWRlciBEYXJrIEFycml2aXNtZSc6ICc0MzBFJyxcclxuICAgICdBbnlkZXIgVGh1bmRlcnN0b3JtJzogJzNFMUMnLFxyXG4gICAgJ0FueWRlciBXaW5kaW5nIEN1cnJlbnQnOiAnM0UxRicsXHJcbiAgICAvLyAzRTIwIGlzIGJlaW5nIGhpdCBieSB0aGUgZ3Jvd2luZyBvcmJzLCBtYXliZT9cclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbWF1cm90LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbWF1cm90IEJ1cm5pbmcgU2t5JzogJzM1NEEnLFxyXG4gICAgJ0FtYXVyb3QgV2hhY2snOiAnMzUzQycsXHJcbiAgICAnQW1hdXJvdCBBZXRoZXJzcGlrZSc6ICczNTNCJyxcclxuICAgICdBbWF1cm90IFZlbmVtb3VzIEJyZWF0aCc6ICczQ0NFJyxcclxuICAgICdBbWF1cm90IENvc21pYyBTaHJhcG5lbCc6ICc0RDI2JyxcclxuICAgICdBbWF1cm90IEVhcnRocXVha2UnOiAnM0NDRCcsXHJcbiAgICAnQW1hdXJvdCBNZXRlb3IgUmFpbic6ICczQ0M2JyxcclxuICAgICdBbWF1cm90IEZpbmFsIFNreSc6ICczQ0NCJyxcclxuICAgICdBbWF1cm90IE1hbGV2b2xlbmNlJzogJzM1NDEnLFxyXG4gICAgJ0FtYXVyb3QgVHVybmFib3V0JzogJzM1NDInLFxyXG4gICAgJ0FtYXVyb3QgU2lja2x5IEluZmVybm8nOiAnM0RFMycsXHJcbiAgICAnQW1hdXJvdCBEaXNxdWlldGluZyBHbGVhbSc6ICczNTQ2JyxcclxuICAgICdBbWF1cm90IEJsYWNrIERlYXRoJzogJzM1NDMnLFxyXG4gICAgJ0FtYXVyb3QgRm9yY2Ugb2YgTG9hdGhpbmcnOiAnMzU0NCcsXHJcbiAgICAnQW1hdXJvdCBEYW1uaW5nIFJheSAxJzogJzNFMDAnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMic6ICczRTAxJyxcclxuICAgICdBbWF1cm90IERlYWRseSBUZW50YWNsZXMnOiAnMzU0NycsXHJcbiAgICAnQW1hdXJvdCBNaXNmb3J0dW5lJzogJzNDRTInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0FtYXVyb3QgQXBva2FseXBzaXMnOiAnM0NENycsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQW5hbW5lc2lzQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFBodWFibyBTcGluZSBMYXNoJzogJzREMUEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBBbmVtb25lIEZhbGxpbmcgUm9jayc6ICc0RTM3JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2UgZnJvbSBUcmVuY2ggQW5lbW9uZSBzaG93aW5nIHVwXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBEYWdvbml0ZSBTZXdlciBXYXRlcic6ICc0RDFDJywgLy8gZnJvbnRhbCBjb25hbCBmcm9tIFRyZW5jaCBBbmVtb25lICg/ISlcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFJvY2sgSGFyZCc6ICc0RDIxJywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWW92cmEgVG9ycmVudGlhbCBUb3JtZW50JzogJzREMjEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gTHVtaW5vdXMgUmF5JzogJzRFMjcnLCAvLyBVbmtub3duIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2luc3RlciBCdWJibGUgRXhwbG9zaW9uJzogJzRCNkUnLCAvLyBVbmtub3duIGV4cGxvc2lvbnMgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gUmVmbGVjdGlvbic6ICc0QjZGJywgLy8gVW5rbm93biBjb25hbCBhdHRhY2sgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMSc6ICc0Qjc0JywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBDbGVhcm91dCAyJzogJzRCNkInLCAvLyBVbmtub3duIGZyb250YWwgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNldGJhY2sgMSc6ICc0Qjc1JywgLy8gVW5rbm93biByZWFyIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDInOiAnNUI2QycsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBDbGlvbmlkIEFjcmlkIFN0cmVhbSc6ICc0RDI0JywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgRGl2aW5lciBEcmVhZHN0b3JtJzogJzREMjgnLCAvLyBncm91bmQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIDIwMDAtTWluYSBTd2luZyc6ICc0QjU1JywgLy8gS3lrbG9wcyBnZXQgb3V0IG1lY2hhbmljXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgSGFtbWVyJzogJzRCNUQnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgQmxhZGUnOiAnNEI1RScsIC8vIEt5a2xvcHMgSGFtbWVyL0JsYWRlIGFsdGVybmF0aW5nIHNxdWFyZXNcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBSYWdpbmcgR2xvd2VyJzogJzRCNTYnLCAvLyBLeWtsb3BzIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgRXllIE9mIFRoZSBDeWNsb25lJzogJzRCNTcnLCAvLyBLeWtsb3BzIGRvbnV0XHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBIYXJwb29uZXIgSHlkcm9iYWxsJzogJzREMjYnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBTd2lmdCBTaGlmdCc6ICc0QjgzJywgLy8gUnVrc2hzIERlZW0gdGVsZXBvcnQgTi9TXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBEZXB0aCBHcmlwIFdhdmVicmVha2VyJzogJzMzRDQnLCAvLyBSdWtzaHMgRGVlbSBoYW5kIGF0dGFja3NcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIFJpc2luZyBUaWRlJzogJzRCOEInLCAvLyBSdWtzaHMgRGVlbSBjcm9zcyBhb2VcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIENvbW1hbmQgQ3VycmVudCc6ICc0QjgyJywgLy8gUnVrc2hzIERlZW0gcHJvdGVhbi1pc2ggZ3JvdW5kIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWHpvbWl0IE1hbnRsZSBEcmlsbCc6ICc0RDE5JywgLy8gY2hhcmdlIGF0dGFja1xyXG4gICAgJ0FuYW1uZXNpcyBJbyBPdXNpYSBCYXJyZWxpbmcgU21hc2gnOiAnNEUyNCcsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBXYW5kZXJlclxcJ3MgUHlyZSc6ICc0QjVGJywgLy8gS3lrbG9wcyBzcHJlYWQgYXR0YWNrXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IE1pc3NpbmcgR3Jvd2luZyB0ZXRoZXJzIG9uIGJvc3MgMi5cclxuLy8gKE1heWJlIGdhdGhlciBwYXJ0eSBtZW1iZXIgbmFtZXMgb24gdGhlIHByZXZpb3VzIFRJSUlJTUJFRUVFRUVSIGNhc3QgZm9yIGNvbXBhcmlzb24/KVxyXG4vLyBUT0RPOiBGYWlsaW5nIHRvIGludGVycnVwdCBEb2huZmF1c3QgRnVhdGggb24gV2F0ZXJpbmcgV2hlZWwgY2FzdHM/XHJcbi8vICgxNTouLi4uLi4uLjpEb2huZmFzdCBGdWF0aDozREFBOldhdGVyaW5nIFdoZWVsOi4uLi4uLi4uOihcXHl7TmFtZX0pOilcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Eb2huTWhlZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRG9obiBNaGVnIEdleXNlcic6ICcyMjYwJywgLy8gV2F0ZXIgZXJ1cHRpb25zLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgSHlkcm9mYWxsJzogJzIyQkQnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIExhdWdoaW5nIExlYXAnOiAnMjI5NCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgU3dpbmdlJzogJzIyQ0EnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0RvaG4gTWhlZyBDYW5vcHknOiAnM0RCMCcsIC8vIEZyb250YWwgY29uZSwgRG9obmZhdXN0IFJvd2FucyB0aHJvdWdob3V0IGluc3RhbmNlXHJcbiAgICAnRG9obiBNaGVnIFBpbmVjb25lIEJvbWInOiAnM0RCMScsIC8vIENpcmN1bGFyIGdyb3VuZCBBb0UgbWFya2VyLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgQmlsZSBCb21iYXJkbWVudCc6ICczNEVFJywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBDb3Jyb3NpdmUgQmlsZSc6ICczNEVDJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDNcclxuICAgICdEb2huIE1oZWcgRmxhaWxpbmcgVGVudGFjbGVzJzogJzM2ODEnLFxyXG5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEltcCBDaG9pcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NkUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIFRvYWQgQ2hvaXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUI3JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBGb29sXFwncyBUdW1ibGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTgzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogQmVyc2Vya2VyIDJuZC8zcmQgd2lsZCBhbmd1aXNoIHNob3VsZCBiZSBzaGFyZWQgd2l0aCBqdXN0IGEgcm9ja1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUhlcm9lc0dhdW50bGV0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUSEcgQmxhZGVcXCdzIEJlbmlzb24nOiAnNTIyOCcsIC8vIHBsZCBjb25hbFxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBIb2x5JzogJzUyNEInLCAvLyB3aG0gdmVyeSBsYXJnZSBhb2VcclxuICAgICdUSEcgSGlzc2F0c3U6IEdva2EnOiAnNTIzRCcsIC8vIHNhbSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBXaG9sZSBTZWxmJzogJzUyMkQnLCAvLyBtbmsgd2lkZSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBSYW5kZ3JpdGgnOiAnNTIzMicsIC8vIGRyZyB2ZXJ5IGJpZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMSc6ICc1MDYxJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMic6ICc1MDYyJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBDb3dhcmRcXCdzIEN1bm5pbmcnOiAnNEZENycsIC8vIFNwZWN0cmFsIFRoaWVmIENoaWNrZW4gS25pZmUgbGFzZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMSc6ICc0RkQxJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMic6ICc0RkQyJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUmluZyBvZiBEZWF0aCc6ICc1MjM2JywgLy8gZHJnIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBMdW5hciBFY2xpcHNlJzogJzUyMjcnLCAvLyBwbGQgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIEdyYXZpdHknOiAnNTI0OCcsIC8vIGluayBtYWdlIGNpcmN1bGFyXHJcbiAgICAnVEhHIFJhaW4gb2YgTGlnaHQnOiAnNTI0MicsIC8vIGJhcmQgbGFyZ2UgY2lyY3VsZSBhb2VcclxuICAgICdUSEcgRG9vbWluZyBGb3JjZSc6ICc1MjM5JywgLy8gZHJnIGxpbmUgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIERhcmsgSUknOiAnNEY2MScsIC8vIE5lY3JvbWFuY2VyIDEyMCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgQnVyc3QnOiAnNTNCNycsIC8vIE5lY3JvbWFuY2VyIG5lY3JvYnVyc3Qgc21hbGwgem9tYmllIGV4cGxvc2lvblxyXG4gICAgJ1RIRyBQYWluIE1pcmUnOiAnNEZBNCcsIC8vIE5lY3JvbWFuY2VyIHZlcnkgbGFyZ2UgZ3JlZW4gYmxlZWQgcHVkZGxlXHJcbiAgICAnVEhHIERhcmsgRGVsdWdlJzogJzRGNUQnLCAvLyBOZWNyb21hbmNlciBncm91bmQgYW9lXHJcbiAgICAnVEhHIFRla2thIEdvamluJzogJzUyM0UnLCAvLyBzYW0gOTAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAxJzogJzUyMEEnLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDInOiAnNTIwQicsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBXaWxkIFJhZ2UnOiAnNTIwMycsIC8vIEJlcnNlcmtlciBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUSEcgQWJzb2x1dGUgVGh1bmRlciBJVic6ICc1MjQ1JywgLy8gaGVhZG1hcmtlciBhb2UgZnJvbSBibG1cclxuICAgICdUSEcgTW9vbmRpdmVyJzogJzUyMzMnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGRyZ1xyXG4gICAgJ1RIRyBTcGVjdHJhbCBHdXN0JzogJzUzQ0YnLCAvLyBTcGVjdHJhbCBUaGllZiBoZWFkbWFya2VyIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVEhHIEZhbGxpbmcgUm9jayc6ICc1MjA1JywgLy8gQmVyc2Vya2VyIGhlYWRtYXJrZXIgYW9lIHRoYXQgY3JlYXRlcyBydWJibGVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RIRyBCbGVlZGluZyc6ICc4MjgnLCAvLyBTdGFuZGluZyBpbiB0aGUgTmVjcm9tYW5jZXIgcHVkZGxlIG9yIG91dHNpZGUgdGhlIEJlcnNlcmtlciBhcmVuYVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnVEhHIFRydWx5IEJlcnNlcmsnOiAnOTA2JywgLy8gU3RhbmRpbmcgaW4gdGhlIGNyYXRlciB0b28gbG9uZ1xyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSBzaGFyZWQuICBPbiBhbGwgdGltZXMgYnV0IHRoZSAybmQgYW5kIDNyZCwgaXQncyBhIHBhcnR5IHNoYXJlLlxyXG4gICAgLy8gVE9ETzogb24gdGhlIDJuZCBhbmQgM3JkIHRpbWUgdGhpcyBzaG91bGQgb25seSBiZSBzaGFyZWQgd2l0aCBhIHJvY2suXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5IHdhcm4gb24gdGFraW5nIG9uZSBvZiB0aGVzZSB3aXRoIGEgNDcyIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgZWZmZWN0XHJcbiAgICAnVEhHIFdpbGQgQW5ndWlzaCc6ICc1MjA5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEhHIFdpbGQgUmFtcGFnZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1MjA3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGlzIHplcm8gZGFtYWdlIGlmIHlvdSBhcmUgaW4gdGhlIGNyYXRlci5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuSG9sbWluc3RlclN3aXRjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSG9sbWluc3RlciBUaHVtYnNjcmV3JzogJzNEQzYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgV29vZGVuIGhvcnNlJzogJzNEQzcnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgTGlnaHQgU2hvdCc6ICczREM4JyxcclxuICAgICdIb2xtaW5zdGVyIEhlcmV0aWNcXCdzIEZvcmsnOiAnM0RDRScsXHJcbiAgICAnSG9sbWluc3RlciBIb2x5IFdhdGVyJzogJzNERDQnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMSc6ICczREREJyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDInOiAnM0RERScsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAzJzogJzNEREYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgQ2F0IE9cXCcgTmluZSBUYWlscyc6ICczREUxJyxcclxuICAgICdIb2xtaW5zdGVyIFJpZ2h0IEtub3V0JzogJzNERTYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgTGVmdCBLbm91dCc6ICczREU3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIb2xtaW5zdGVyIEFldGhlcnN1cCc6ICczREU5JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgRmxhZ2VsbGF0aW9uJzogJzNERDYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBUYXBoZXBob2JpYSc6ICc0MTgxJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYWxpa2Foc1dlbGwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ01hbGlrYWggRmFsbGluZyBSb2NrJzogJzNDRUEnLFxyXG4gICAgJ01hbGlrYWggV2VsbGJvcmUnOiAnM0NFRCcsXHJcbiAgICAnTWFsaWthaCBHZXlzZXIgRXJ1cHRpb24nOiAnM0NFRScsXHJcbiAgICAnTWFsaWthaCBTd2lmdCBTcGlsbCc6ICczQ0YwJyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDEnOiAnM0NGNScsXHJcbiAgICAnTWFsaWthaCBDcnlzdGFsIE5haWwnOiAnM0NGNycsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDEnOiAnM0NGOScsXHJcbiAgICAnTWFsaWthaCBCcmVha2luZyBXaGVlbCAyJzogJzNDRkEnLFxyXG4gICAgJ01hbGlrYWggSGVyZXRpY1xcJ3MgRm9yayAyJzogJzNFMEUnLFxyXG4gICAgJ01hbGlrYWggRWFydGhzaGFrZSc6ICczRTM5JyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIGluY2x1ZGUgNTQ4NCBNdWRtYW4gUm9ja3kgUm9sbCBhcyBhIHNoYXJlV2FybiwgYnV0IGl0J3MgbG93IGRhbWFnZSBhbmQgY29tbW9uLlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdG95YXNSZWxpY3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ01hdG95YSBSZWxpY3QgV2VyZXdvb2QgT3ZhdGlvbic6ICc1NTE4JywgLy8gbGluZSBhb2VcclxuICAgICdNYXRveWEgQ2F2ZSBUYXJhbnR1bGEgSGF3ayBBcGl0b3hpbic6ICc1NTE5JywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgU3ByaWdnYW4gU3RvbmViZWFyZXIgUm9tcCc6ICc1NTFBJywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIFNvbm55IE9mIFppZ2d5IEppdHRlcmluZyBHbGFyZSc6ICc1NTFDJywgLy8gbG9uZyBuYXJyb3cgY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBRdWFnbWlyZSc6ICc1NDgxJywgLy8gTXVkbWFuIGFvZSBwdWRkbGVzXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMSc6ICc1NDhFJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAyJzogJzU0OEYnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDMnOiAnNTQ5MCcsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBNdWQgQnViYmxlJzogJzU0ODcnLCAvLyBzdGFuZGluZyBpbiBtdWQgcHVkZGxlP1xyXG4gICAgJ01hdG95YSBDYXZlIFB1Z2lsIFNjcmV3ZHJpdmVyJzogJzU1MUUnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTml4aWUgR3VyZ2xlJzogJzU5OTInLCAvLyBOaXhpZSB3YWxsIGZsdXNoXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNb2x0ZW4gUGhvZWJhZCBQeXJvY2xhc3RpYyBTaG90JzogJzU3RUInLCAvLyB0aGUgbGluZSBhb2VzIGFzIHlvdSBydW4gdG8gdHJhc2hcclxuICAgICdNYXRveWEgUmVsaWN0IEZsYW4gRmxvb2QnOiAnNTUyMycsIC8vIGJpZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFB5cm9kdWN0IEVsZHRodXJzIE1hc2gnOiAnNTUyNycsIC8vIGxpbmUgYW9lXHJcbiAgICAnTWF0eW9hIFB5cm9kdWN0IEVsZHRodXJzIFNwaW4nOiAnNTUyOCcsIC8vIHZlcnkgbGFyZ2UgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgQmF2YXJvaXMgVGh1bmRlciBJSUknOiAnNTUyNScsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1hcnNobWFsbG93IEFuY2llbnQgQWVybyc6ICc1NTI0JywgLy8gdmVyeSBsYXJnZSBsaW5lIGdyb2FvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgUHVkZGluZyBGaXJlIElJJzogJzU1MjInLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNb2x0ZW4gUGhvZWJhZCBIb3QgTGF2YSc6ICc1N0U5JywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNb2x0ZW4gUGhvZWJhZCBWb2xjYW5pYyBEcm9wJzogJzU3RTgnLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgTWVkaXVtIFJlYXInOiAnNTkxRCcsIC8vIGtub2NrYmFjayBpbnRvIHNhZmUgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIExpbmUnOiAnNTkxNycsIC8vIGxpbmUgYW9lIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBCYXJiZXF1ZSBDaXJjbGUnOiAnNTkxOCcsIC8vIGNpcmNsZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIFRvIEEgQ3Jpc3AnOiAnNTkyNScsIC8vIGdldHRpbmcgdG8gY2xvc2UgdG8gYm9zcyBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQcm94aWUgQnVmZmV0JzogJzU5MjYnLCAvLyBBZW9saWFuIENhdmUgU3ByaXRlIGxpbmUgYW9lIChpcyB0aGlzIGEgcHVuPylcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdNYXRveWEgTml4aWUgU2VhIFNoYW50eSc6ICc1OThDJywgLy8gTm90IHRha2luZyB0aGUgcHVkZGxlIHVwIHRvIHRoZSB0b3A/IEZhaWxpbmcgYWRkIGVucmFnZT9cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBDcmFjayc6ICc1OTkwJywgLy8gTml4aWUgQ3Jhc2gtU21hc2ggdGFuayB0ZXRoZXJzXHJcbiAgICAnTWF0b3lhIE5peGllIFNwdXR0ZXInOiAnNTk5MycsIC8vIE5peGllIHNwcmVhZCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NdEd1bGcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0d1bGcgSW1tb2xhdGlvbic6ICc0MUFBJyxcclxuICAgICdHdWxnIFRhaWwgU21hc2gnOiAnNDFBQicsXHJcbiAgICAnR3VsZyBIZWF2ZW5zbGFzaCc6ICc0MUE5JyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAxJzogJzNEMDAnLFxyXG4gICAgJ0d1bGcgVHlwaG9vbiBXaW5nIDInOiAnM0QwMScsXHJcbiAgICAnR3VsZyBIdXJyaWNhbmUgV2luZyc6ICczRDAzJyxcclxuICAgICdHdWxnIEVhcnRoIFNoYWtlcic6ICczN0Y1JyxcclxuICAgICdHdWxnIFNhbmN0aWZpY2F0aW9uJzogJzQxQUUnLFxyXG4gICAgJ0d1bGcgRXhlZ2VzaXMnOiAnM0QwNycsXHJcbiAgICAnR3VsZyBQZXJmZWN0IENvbnRyaXRpb24nOiAnM0QwRScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWVkIEFlcm8nOiAnNDFBRCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAxJzogJzNEMTYnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMic6ICczRDE4JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDMnOiAnNDY2OScsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyA0JzogJzNEMTknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNSc6ICczRDIxJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAxJzogJzNEMUEnLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDInOiAnM0QxQicsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMyc6ICczRDIwJyxcclxuICAgICdHdWxnIFZlbmEgQW1vcmlzJzogJzNEMjcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1bGcgTHVtZW4gSW5maW5pdHVtJzogJzQxQjInLFxyXG4gICAgJ0d1bGcgUmlnaHQgUGFsbSc6ICczN0Y4JyxcclxuICAgICdHdWxnIExlZnQgUGFsbSc6ICczN0ZBJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IFdoYXQgdG8gZG8gYWJvdXQgS2FobiBSYWkgNUI1MD9cclxuLy8gSXQgc2VlbXMgaW1wb3NzaWJsZSBmb3IgdGhlIG1hcmtlZCBwZXJzb24gdG8gYXZvaWQgZW50aXJlbHkuXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuUGFnbHRoYW4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1BhZ2x0aGFuIFRlbG92b3VpdnJlIFBsYWd1ZSBTd2lwZSc6ICc2MEZDJywgLy8gZnJvbnRhbCBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMZXNzZXIgVGVsb2RyYWdvbiBFbmd1bGZpbmcgRmxhbWVzJzogJzYwRjUnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgTGlnaHRuaW5nIEJvbHQnOiAnNUM0QycsIC8vIGNpcmN1bGFyIGxpZ2h0bmluZyBhb2UgKG9uIHNlbGYgb3IgcG9zdClcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MicsIC8vIHB1bHNpbmcgc21hbGwgY2lyY3VsYXIgYW9lc1xyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgU3VwZXJjaGFyZ2VkIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MycsIC8vIHB1bHNpbmcgbGFyZ2UgY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBXaWRlIEJsYXN0ZXInOiAnNjBDNScsIC8vIHJlYXIgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2Jyb2JpbnlhayBGYWxsIE9mIE1hbic6ICc2MTQ4JywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb3RlayBSZWFwZXIgTWFnaXRlayBDYW5ub24nOiAnNjEyMScsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gU2hlZXQgb2YgSWNlJzogJzYwRjgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIEZyb3N0IEJyZWF0aCc6ICc2MEY3JywgLy8gdmVyeSBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgU3RhYmxlIENhbm5vbic6ICc1Qzk0JywgLy8gbGFyZ2UgbGluZSBhb2VzXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBDb3JlIDItVG9uemUgTWFnaXRlayBNaXNzaWxlJzogJzVDOTUnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFNreSBBcm1vciBBZXRoZXJzaG90JzogJzVDOUMnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBNYXJrIElJIFRlbG90ZWsgQ29sb3NzdXMgRXhoYXVzdCc6ICc1Qzk5JywgLy8gbGFyZ2UgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIE1pc3NpbGUgRXhwbG9zaXZlIEZvcmNlJzogJzVDOTgnLCAvLyBzbG93IG1vdmluZyBob3Jpem9udGFsIG1pc3NpbGVzXHJcbiAgICAnUGFnbHRoYW4gVGlhbWF0IEZsYW1pc3BoZXJlJzogJzYxMEYnLCAvLyB2ZXJ5IGxvbmcgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBBcm1vcmVkIFRlbG9kcmFnb24gVG9ydG9pc2UgU3RvbXAnOiAnNjE0QicsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZSBmcm9tIHR1cnRsZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gVGh1bmRlcm91cyBCcmVhdGgnOiAnNjE0OScsIC8vIGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBVcGJ1cnN0JzogJzYwNUInLCAvLyBzbWFsbCBhb2VzIGJlZm9yZSBCaWcgQnVyc3RcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIE5haWwgQmlnIEJ1cnN0JzogJzVCNDgnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VzIGZyb20gbmFpbHNcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IFBlcmlnZWFuIEJyZWF0aCc6ICc1QjU5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RScsIC8vIG1lZ2FmbGFyZSBwZXBwZXJvbmlcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSBEaXZlJzogJzVCNTInLCAvLyBtZWdhZmxhcmUgbGluZSBhb2UgYWNyb3NzIHRoZSBhcmVuYVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgRmxhcmUnOiAnNUI0QScsIC8vIGxhcmdlIHB1cnBsZSBzaHJpbmtpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RCcsIC8vIG1lZ2FmbGFyZSBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVFpdGFuYVJhdmVsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdRaXRhbmEgU3VuIFRvc3MnOiAnM0M4QScsIC8vIEdyb3VuZCBBb0UsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAxJzogJzNDOEMnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBMb3phdGxcXCdzIEZ1cnkgMSc6ICczQzhGJywgLy8gU2VtaWNpcmNsZSBjbGVhdmUsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAyJzogJzNDOTAnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgRmFsbGluZyBSb2NrJzogJzNDOTYnLCAvLyBTbWFsbCBncm91bmQgQW9FLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIEJvdWxkZXInOiAnM0M5NycsIC8vIExhcmdlIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFRvd2VyZmFsbCc6ICczQzk4JywgLy8gUGlsbGFyIGNvbGxhcHNlLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMic6ICczQzlFJywgLy8gU3RhdGlvbmFyeSBwb2lzb24gcHVkZGxlcywgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDEnOiAnM0NBMicsIC8vIERhbmdlcm91cyBtaWRkbGUgZHVyaW5nIHNwcmVhZCBjaXJjbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMyc6ICczQ0E2JywgLy8gRGFuZ2Vyb3VzIHNpZGVzIGR1cmluZyBzdGFjayBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCA0JzogJzNDQTcnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBSb25rYW4gTGlnaHQgMic6ICczRDZEJywgLy8gU3RhdHVlIGF0dGFjaywgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgV3JhdGggb2YgdGhlIFJvbmthJzogJzNFMkMnLCAvLyBTdGF0dWUgbGluZSBhdHRhY2sgZnJvbSBtaW5pLWJvc3NlcyBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ1FpdGFuYSBTaW5zcGl0dGVyJzogJzNFMzYnLCAvLyBHb3JpbGxhIGJvdWxkZXIgdG9zcyBBb0UgYmVmb3JlIHRoaXJkIGJvc3NcclxuICAgICdRaXRhbmEgSG91bmQgb3V0IG9mIEhlYXZlbic6ICc0MkI4JywgLy8gVGV0aGVyIGV4dGVuc2lvbiBmYWlsdXJlLCBib3NzIHRocmVlOyA0MkI3IGlzIGNvcnJlY3QgZXhlY3V0aW9uXHJcbiAgICAnUWl0YW5hIFJvbmthbiBBYnlzcyc6ICc0M0VCJywgLy8gR3JvdW5kIEFvRSBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdRaXRhbmEgVmlwZXIgUG9pc29uIDEnOiAnM0M5RCcsIC8vIEFvRSBmcm9tIHRoZSAwMEFCIHBvaXNvbiBoZWFkIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDInOiAnM0NBMycsIC8vIE92ZXJsYXBwZWQgY2lyY2xlcyBmYWlsdXJlIG9uIHRoZSBzcHJlYWQgY2lyY2xlcyB2ZXJzaW9uIG9mIHRoZSBtZWNoYW5pY1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGhlIEdyYW5kIENvc21vc1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlR3JhbmRDb3Ntb3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0Nvc21vcyBJcm9uIEp1c3RpY2UnOiAnNDkxRicsXHJcbiAgICAnQ29zbW9zIFNtaXRlIE9mIFJhZ2UnOiAnNDkyMScsXHJcblxyXG4gICAgJ0Nvc21vcyBUcmlidWxhdGlvbic6ICc0OUE0JyxcclxuICAgICdDb3Ntb3MgRGFyayBTaG9jayc6ICc0NzZGJyxcclxuICAgICdDb3Ntb3MgU3dlZXAnOiAnNDc3MCcsXHJcbiAgICAnQ29zbW9zIERlZXAgQ2xlYW4nOiAnNDc3MScsXHJcblxyXG4gICAgJ0Nvc21vcyBTaGFkb3cgQnVyc3QnOiAnNDkyNCcsXHJcbiAgICAnQ29zbW9zIEJsb29keSBDYXJlc3MnOiAnNDkyNycsXHJcbiAgICAnQ29zbW9zIE5lcGVudGhpYyBQbHVuZ2UnOiAnNDkyOCcsXHJcbiAgICAnQ29zbW9zIEJyZXdpbmcgU3Rvcm0nOiAnNDkyOScsXHJcblxyXG4gICAgJ0Nvc21vcyBPZGUgVG8gRmFsbGVuIFBldGFscyc6ICc0OTUwJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgR3JvdW5kJzogJzQyNzMnLFxyXG5cclxuICAgICdDb3Ntb3MgRmlyZSBCcmVhdGgnOiAnNDkyQicsXHJcbiAgICAnQ29zbW9zIFJvbmthbiBGcmVlemUnOiAnNDkyRScsXHJcbiAgICAnQ29zbW9zIE92ZXJwb3dlcic6ICc0OTJEJyxcclxuXHJcbiAgICAnQ29zbW9zIFNjb3JjaGluZyBMZWZ0JzogJzQ3NjMnLFxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgUmlnaHQnOiAnNDc2MicsXHJcbiAgICAnQ29zbW9zIE90aGVyd29yZGx5IEhlYXQnOiAnNDc1QycsXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIElyZSc6ICc0NzYxJyxcclxuICAgICdDb3Ntb3MgUGx1bW1ldCc6ICc0NzY3JyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIERvbWFpbiBUZXRoZXInOiAnNDc1RicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3Ntb3MgRGFyayBXZWxsJzogJzQ3NkQnLFxyXG4gICAgJ0Nvc21vcyBGYXIgV2luZCBTcHJlYWQnOiAnNDcyNCcsXHJcbiAgICAnQ29zbW9zIEJsYWNrIEZsYW1lJzogJzQ3NUQnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4nOiAnNDc2MCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVHdpbm5pbmcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1R3aW5uaW5nIEF1dG8gQ2Fubm9ucyc6ICc0M0E5JyxcclxuICAgICdUd2lubmluZyBIZWF2ZSc6ICczREI5JyxcclxuICAgICdUd2lubmluZyAzMiBUb256ZSBTd2lwZSc6ICczREJCJyxcclxuICAgICdUd2lubmluZyBTaWRlc3dpcGUnOiAnM0RCRicsXHJcbiAgICAnVHdpbm5pbmcgV2luZCBTcG91dCc6ICczREJFJyxcclxuICAgICdUd2lubmluZyBTaG9jayc6ICczREYxJyxcclxuICAgICdUd2lubmluZyBMYXNlcmJsYWRlJzogJzNERUMnLFxyXG4gICAgJ1R3aW5uaW5nIFZvcnBhbCBCbGFkZSc6ICczREMyJyxcclxuICAgICdUd2lubmluZyBUaHJvd24gRmxhbWVzJzogJzNEQzMnLFxyXG4gICAgJ1R3aW5uaW5nIE1hZ2l0ZWsgUmF5JzogJzNERjMnLFxyXG4gICAgJ1R3aW5uaW5nIEhpZ2ggR3Jhdml0eSc6ICczREZBJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUd2lubmluZyAxMjggVG9uemUgU3dpcGUnOiAnM0RCQScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBEZWFkIElyb24gNUFCMCAoZWFydGhzaGFrZXJzLCBidXQgb25seSBpZiB5b3UgdGFrZSB0d28/KVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHVicnVtUmVnaW5hZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmN5IEZvdXJmb2xkJzogJzVCMzQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBTd2F0aGUnOiAnNUFCNCcsIC8vIEdyb3VuZCBhb2UgdG8gZWl0aGVyIHNpZGUgb2YgYm9zc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBCYWxlZnVsIEJsYWRlJzogJzVCMjgnLCAvLyBIaWRlIGJlaGluZCBwaWxsYXJzIGF0dGFja1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUE0JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMic6ICc1QUE1JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMyc6ICc1QUE2JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDEnOiAnNUFBNycsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMic6ICc1QUE4JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAzJzogJzVBQTknLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBTY29yY2hpbmcgU2hhY2tsZSc6ICc1QUFFJywgLy8gQ2hhaW4gZGFtYWdlXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUFCJywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgQmxvb21zJzogJzVBQUQnLCAvLyBQdXJwbGUgZ3Jvd2luZyBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSc6ICc1NzYxJywgLy8gUmlnaHQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSc6ICc1NzYyJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZpcmVicmVhdGhlJzogJzU3NjUnLCAvLyBDb25hbCBicmVhdGhcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZpcmVicmVhdGhlIFJvdGF0aW5nJzogJzU3NUEnLCAvLyBDb25hbCBicmVhdGgsIHJvdGF0aW5nXHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWFkIERvd24nOiAnNTc1NicsIC8vIGxpbmUgYW9lIGNoYXJnZSBmcm9tIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBIdW50ZXJcXCdzIENsYXcnOiAnNTc1NycsIC8vIGNpcmN1bGFyIGdyb3VuZCBhb2UgY2VudGVyZWQgb24gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZhbGxpbmcgUm9jayc6ICc1NzVDJywgLy8gZ3JvdW5kIGFvZSBmcm9tIFJldmVyYmVyYXRpbmcgUm9hclxyXG4gICAgJ0RlbHVicnVtIERhaHUgSG90IENoYXJnZSc6ICc1NzY0JywgLy8gZG91YmxlIGNoYXJnZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgUmlwcGVyIENsYXcnOiAnNTc1RCcsIC8vIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBUYWlsIFN3aW5nJzogJzU3NUYnLCAvLyB0YWlsIHN3aW5nIDspXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgUGF3biBPZmYnOiAnNTgwNicsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAxJzogJzU4MEQnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDInOiAnNTgwRScsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1ODBGJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTdGMycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHNoaWVsZCBnZXQgdW5kZXJcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTdGMicsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXRcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBDb3VudGVycGxheSc6ICc1N0Y2JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMSc6ICc1N0E5JywgLy8gSW5pdGlhbCBwaGFudG9tIGRvbnV0IGFvZSBmcm9tIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDInOiAnNTdBQScsIC8vIE1vdmluZyBwaGFudG9tIGRvbnV0IGFvZXMgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIENyZWVwaW5nIE1pYXNtYSc6ICc1N0E1JywgLy8gcGhhbnRvbSBsaW5lIGFvZSBmcm9tIHNxdWFyZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gVmlsZSBXYXZlJzogJzU3QjEnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NzMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYXNodmFuZSc6ICc1OTcyJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk3MScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5NjgnLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NzQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlCQicsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5QkQnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgRW5kIDEnOiAnNTlCQScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAyJzogJzU5QkMnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlDNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCc6ICc1QjgzJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUJGJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAxJzogJzU5RTAnLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAyJzogJzU5RTEnLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAzJzogJzU5RTInLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFBhd24gT2ZmJzogJzU5REEnLCAvLyBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZSBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU5Q0UnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyIGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUNDJywgLy8gUXVlZW4ncyBLbmlnaHQgc3dvcmQgZ2V0IG91dCBkdXJpbmcgUXVlZW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bSBIaWRkZW4gVHJhcCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1QTZFJywgLy8gZXhwbG9zaW9uIHRyYXBcclxuICAgICdEZWx1YnJ1bSBIaWRkZW4gVHJhcCBQb2lzb24gVHJhcCc6ICc1QTZGJywgLy8gcG9pc29uIHRyYXBcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgSGVhdCBTaG9jayc6ICc1OTVFJywgLy8gdG9vIG11Y2ggaGVhdCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIENvbGQgU2hvY2snOiAnNTk1RicsIC8vIHRvbyBtdWNoIGNvbGQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWF0IEJyZWF0aCc6ICc1NzY2JywgLy8gdGFuayBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgV3JhdGggT2YgQm96amEnOiAnNTk3NScsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEF0IGxlYXN0IGR1cmluZyBUaGUgUXVlZW4sIHRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5LFxyXG4gICAgICAvLyBhbmQgdGhlIGZpcnN0IGV4cGxvc2lvbiBcImhpdHNcIiBldmVyeW9uZSwgYWx0aG91Z2ggd2l0aCBcIjFCXCIgZmxhZ3MuXHJcbiAgICAgIGlkOiAnRGVsdWJydW0gTG90cyBDYXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NjVBJywgJzU2NUInLCAnNTdGRCcsICc1N0ZFJywgJzVCODYnLCAnNUI4NycsICc1OUQyJywgJzVEOTMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBEYWh1IDU3NzYgU3BpdCBGbGFtZSBzaG91bGQgYWx3YXlzIGhpdCBhIE1hcmNob3NpYXNcclxuLy8gVE9ETzogaGl0dGluZyBwaGFudG9tIHdpdGggaWNlIHNwaWtlcyB3aXRoIGFueXRoaW5nIGJ1dCBkaXNwZWw/XHJcbi8vIFRPRE86IGZhaWxpbmcgaWN5L2ZpZXJ5IHBvcnRlbnQgKGd1YXJkIGFuZCBxdWVlbilcclxuLy8gICAgICAgYDE4OlB5cmV0aWMgRG9UIFRpY2sgb24gJHtuYW1lfSBmb3IgJHtkYW1hZ2V9IGRhbWFnZS5gXHJcbi8vIFRPRE86IFdpbmRzIE9mIEZhdGUgLyBXZWlnaHQgT2YgRm9ydHVuZT9cclxuLy8gVE9ETzogVHVycmV0J3MgVG91cj9cclxuLy8gZ2VuZXJhbCB0cmFwczogZXhwbG9zaW9uOiA1QTcxLCBwb2lzb24gdHJhcDogNUE3MiwgbWluaTogNUE3M1xyXG4vLyBkdWVsIHRyYXBzOiBtaW5pOiA1N0ExLCBpY2U6IDU3OUYsIHRvYWQ6IDU3QTBcclxuLy8gVE9ETzogdGFraW5nIG1hbmEgZmxhbWUgd2l0aG91dCByZWZsZWN0XHJcbi8vIFRPRE86IHRha2luZyBNYWVsc3Ryb20ncyBCb2x0IHdpdGhvdXQgbGlnaHRuaW5nIGJ1ZmZcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgSGVsbGlzaCBTbGFzaCc6ICc1N0VBJywgLy8gQm96amFuIFNvbGRpZXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNsaW1lcyBWaXNjb3VzIFJ1cHR1cmUnOiAnNTAxNicsIC8vIEZ1bGx5IG1lcmdlZCB2aXNjb3VzIHNsaW1lIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgR29sZW1zIERlbW9saXNoJzogJzU4ODAnLCAvLyBpbnRlcnJ1cHRpYmxlIFJ1aW5zIEdvbGVtIGNhc3RcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBRDEnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjJBJywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFDQicsIC8vIENoYWluc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAxJzogJzVCOTQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMic6ICc1QUI5JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDMnOiAnNUFCQScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCA0JzogJzVBQkInLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNSc6ICc1QUJDJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUM4JywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBDb21ldCc6ICc1QUQ3JywgLy8gQ2xvbmUgbWV0ZW9yIGRyb3BwaW5nIGJlZm9yZSBjaGFyZ2VzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgRmlyZXN0b3JtJzogJzVBRDgnLCAvLyBDbG9uZSBjaGFyZ2UgYWZ0ZXIgQmFsZWZ1bCBDb21ldFxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFJvc2UnOiAnNUFEOScsIC8vIENsb25lIGxpbmUgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUMxJywgLy8gQmx1ZSByaW4gZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFDMicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFDMycsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQzQnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFDNScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUM2JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQWN0IE9mIE1lcmN5JzogJzVBQ0YnLCAvLyBjcm9zcy1zaGFwZWQgbGluZSBhb2VzXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc3MCcsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MicsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUgMSc6ICc1NzZGJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MScsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSc6ICc1Nzc0JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzZDJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSGVhZCBEb3duJzogJzU3NjgnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NjknLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGYWxsaW5nIFJvY2snOiAnNTc2RScsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc3MycsIC8vIGRvdWJsZSBjaGFyZ2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1NzlFJywgLy8gYm9tYnMgYmVpbmcgY2xlYXJlZFxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgVmljaW91cyBTd2lwZSc6ICc1Nzk3JywgLy8gY2lyY3VsYXIgYW9lIGFyb3VuZCBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGb2N1c2VkIFRyZW1vciAxJzogJzU3OEYnLCAvLyBzcXVhcmUgZmxvb3IgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMic6ICc1NzkxJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIERldm91cic6ICc1Nzg5JywgLy8gY29uYWwgYW9lIGFmdGVyIHdpdGhlcmluZyBjdXJzZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDEnOiAnNTc4QycsIC8vIGluaXRpYWwgcm90YXRpbmcgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGbGFpbGluZyBTdHJpa2UgMic6ICc1NzhEJywgLy8gcm90YXRpbmcgY2xlYXZlc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTd29yZCc6ICc1ODE5JywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgT2ZmZW5zaXZlIFNoaWVsZCc6ICc1ODFBJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1ODE2JywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1ODE3JywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1ODE4JywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFVubHVja3kgTG90JzogJzU4MUQnLCAvLyBRdWVlbidzIEtuaWdodCBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAxJzogJzU4M0QnLCAvLyBzbWFsbCBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBCdXJuIDInOiAnNTgzRScsIC8vIGxhcmdlIGZpcmUgYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFBhd24gT2ZmJzogJzU4M0EnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDEnOiAnNTg0NycsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDFcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDInOiAnNTg0OCcsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDMnOiAnNTg0OScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBzZWNvbmQgbGluZXNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBDb3VudGVycGxheSc6ICc1OEY1JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdCOCcsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QjknLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMSc6ICc1N0I0JywgLy8gSW5pdGlhbCBwaGFudG9tIGxpbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMic6ICc1N0I1JywgLy8gTGF0ZXIgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAxJzogJzU3QjYnLCAvLyBJbml0aWFsIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAyJzogJzU3QjcnLCAvLyBNb3ZpbmcgcGhhbnRvbSBjaXJjbGUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCRicsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NEMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYXNodmFuZSc6ICc1OTRCJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk0QScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5MzknLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NEQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgV2hhY2snOiAnNTdEMCcsIC8vIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRGV2YXN0YXRpbmcgQm9sdCAxJzogJzU3QzUnLCAvLyBsaWdodG5pbmcgcmluZ3NcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMic6ICc1N0M2JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBFbGVjdHJvY3V0aW9uJzogJzU3Q0MnLCAvLyByYW5kb20gY2lyY2xlIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFJhcGlkIEJvbHRzJzogJzU3QzMnLCAvLyBkcm9wcGVkIGxpZ2h0bmluZyBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCAxMTExLVRvbnplIFN3aW5nJzogJzU3RDgnLCAvLyB2ZXJ5IGxhcmdlIFwiZ2V0IG91dFwiIHN3aW5nXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBNb25rIEF0dGFjayc6ICc1NUE2JywgLy8gTW9uayBhZGQgYXV0by1hdHRhY2tcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUY0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUU3JywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlFQScsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUU4JywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDInOiAnNTlFOScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNUEwMicsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNUEwMycsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDEnOiAnNTlGMicsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQgMic6ICc1Qjg1JywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQgMSc6ICc1OUYxJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDInOiAnNUI4NCcsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBQYXduIE9mZic6ICc1QTFEJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5RkYnLCAvLyBPcHRpbWFsIFBsYXkgU3dvcmQgXCJnZXQgb3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzVBMDAnLCAvLyBPcHRpbWFsIHBsYXkgc2hpZWxkIFwiZ2V0IGluXCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgQ2xlYXZlJzogJzVBMDEnLCAvLyBPcHRpbWFsIFBsYXkgY2xlYXZlcyBmb3Igc3dvcmQvc2hpZWxkXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzVBMjgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzVBMkEnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzVBMjknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEhlYXQgU2hvY2snOiAnNTkyNycsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBDb2xkIFNob2NrJzogJzU5MjgnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUVCJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEd1bm5oaWxkclxcJ3MgQmxhZGVzJzogJzVCMjInLCAvLyBub3QgYmVpbmcgaW4gdGhlIGNoZXNzIGJsdWUgc2FmZSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBVbmx1Y2t5IExvdCc6ICc1NUI2JywgLy8gbGlnaHRuaW5nIG9yYiBhdHRhY2tcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5IGFuZCBcImhpdFwiIHBlb3BsZSB3aGVuIGxldml0YXRpbmcuXHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR3VhcmQgTG90cyBDYXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1ODI3JywgJzU4MjgnLCAnNUI2QycsICc1QjZEJywgJzVCQjYnLCAnNUJCNycsICc1Qjg4JywgJzVCODknXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR29sZW0gQ29tcGFjdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU3NDYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGZ1bGxUZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgU2xpbWUgU2FuZ3VpbmUgRnVzaW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTU0RCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgZnVsbFRleHQ6IGAke21hdGNoZXMuc291cmNlfTogJHttYXRjaGVzLmFiaWxpdHl9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVSZXN1cnJlY3Rpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBUaHVuZGVyIElJSSc6ICc0NEVEJyxcclxuICAgICdFMU4gRWRlblxcJ3MgQmxpenphcmQgSUlJJzogJzQ0RUMnLFxyXG4gICAgJ0UxTiBQdXJlIEJlYW0nOiAnM0Q5RScsXHJcbiAgICAnRTFOIFBhcmFkaXNlIExvc3QnOiAnM0RBMCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTFOIEVkZW5cXCdzIEZsYXJlJzogJzNEOTcnLFxyXG4gICAgJ0UxTiBQdXJlIExpZ2h0JzogJzNEQTMnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTFOIEZpcmUgSUlJJzogJzQ0RUInLFxyXG4gICAgJ0UxTiBWaWNlIE9mIFZhbml0eSc6ICc0NEU3JywgLy8gdGFuayBsYXNlcnNcclxuICAgICdFMU4gVmljZSBPZiBBcGF0aHknOiAnNDRFOCcsIC8vIGRwcyBwdWRkbGVzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGludGVycnVwdCBNYW5hIEJvb3N0ICgzRDhEKVxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIHBhc3MgaGVhbGVyIGRlYnVmZj9cclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBkb24ndCBraWxsIGEgbWV0ZW9yIGR1cmluZyBmb3VyIG9yYnM/XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVSZXN1cnJlY3Rpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBUaHVuZGVyIElJSSc6ICc0NEY3JyxcclxuICAgICdFMVMgRWRlblxcJ3MgQmxpenphcmQgSUlJJzogJzQ0RjYnLFxyXG4gICAgJ0UxUyBFZGVuXFwncyBSZWdhaW5lZCBCbGl6emFyZCBJSUknOiAnNDRGQScsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDEnOiAnM0Q4MycsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDInOiAnM0Q4NCcsXHJcbiAgICAnRTFTIFBhcmFkaXNlIExvc3QnOiAnM0Q4NycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTFTIEVkZW5cXCdzIEZsYXJlJzogJzNENzMnLFxyXG4gICAgJ0UxUyBQdXJlIExpZ2h0JzogJzNEOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTFTIEZpcmUvVGh1bmRlciBJSUknOiAnNDRGQicsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBTaW5nbGUnOiAnM0Q4MScsXHJcbiAgICAnRTFTIFZpY2UgT2YgVmFuaXR5JzogJzQ0RjEnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxUyBWaWNlIG9mIEFwYXRoeSc6ICc0NEYyJywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlICh0b3AgbGluZSBmYWlsLCBib3R0b20gbGluZSBzdWNjZXNzLCBlZmZlY3QgdGhlcmUgdG9vKVxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjEyMzQ1OlRpbmkgUG91dGluaTpGOjEwMDAwOjEwMDE5MEY6XHJcbi8vIFsxNjoxNzozNS45NjZdIDE2OjQwMDExMEZFOlZvaWR3YWxrZXI6NDBCNzpTaGFkb3dleWU6MTA2Nzg5MEE6UG90YXRvIENoaXBweToxOjA6MUM6ODAwMDpcclxuLy8gZ2FpbnMgdGhlIGVmZmVjdCBvZiBQZXRyaWZpY2F0aW9uIGZyb20gVm9pZHdhbGtlciBmb3IgMTAuMDAgU2Vjb25kcy5cclxuLy8gVE9ETzogcHVkZGxlIGZhaWx1cmU/XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVEZXNjZW50LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMk4gRG9vbXZvaWQgU2xpY2VyJzogJzNFM0MnLFxyXG4gICAgJ0UyTiBEb29tdm9pZCBHdWlsbG90aW5lJzogJzNFM0InLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMk4gTnl4JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzNFM0QnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZVxyXG4vLyBUT0RPOiBFbXB0eSBIYXRlICgzRTU5LzNFNUEpIGhpdHMgZXZlcnlib2R5LCBzbyBoYXJkIHRvIHRlbGwgYWJvdXQga25vY2tiYWNrXHJcbi8vIFRPRE86IG1heWJlIG1hcmsgaGVsbCB3aW5kIHBlb3BsZSB3aG8gZ290IGNsaXBwZWQgYnkgc3RhY2s/XHJcbi8vIFRPRE86IG1pc3NpbmcgcHVkZGxlcz9cclxuLy8gVE9ETzogbWlzc2luZyBsaWdodC9kYXJrIGNpcmNsZSBzdGFja1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIFNsaWNlcic6ICczRTUwJyxcclxuICAgICdFM1MgRW1wdHkgUmFnZSc6ICczRTZDJyxcclxuICAgICdFM1MgRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UyUyBEb29tdm9pZCBDbGVhdmVyJzogJzNFNjQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgU2hhZG93ZXllJyxcclxuICAgICAgLy8gU3RvbmUgQ3Vyc2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU4OScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgTnl4JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzNFNTEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAxJzogJzNGQ0EnLFxyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM04gTWFlbHN0cm9tJzogJzNGRDknLFxyXG4gICAgJ0UzTiBTd2lybGluZyBUc3VuYW1pJzogJzNGRDUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGQ0UnLFxyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGQ0QnLFxyXG4gICAgJ0UzTiBTcGlubmluZyBEaXZlJzogJzNGREInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTNOIFJpcCBDdXJyZW50JzogJzNGQzcnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogU2NvdXJpbmcgVHN1bmFtaSAoM0NFMCkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXRcclxuLy8gVE9ETzogU3dlZXBpbmcgVHN1bmFtaSAoM0ZGNSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YW5rc1xyXG4vLyBUT0RPOiBSaXAgQ3VycmVudCAoM0ZFMCwgM0ZFMSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXQvdGFua3NcclxuLy8gVE9ETzogQm9pbGVkIEFsaXZlICg0MDA2KSBpcyBmYWlsaW5nIHB1ZGRsZXM/Pz9cclxuLy8gVE9ETzogZmFpbGluZyB0byBjbGVhbnNlIFNwbGFzaGluZyBXYXRlcnNcclxuLy8gVE9ETzogZG9lcyBnZXR0aW5nIGhpdCBieSB1bmRlcnNlYSBxdWFrZSBjYXVzZSBhbiBhYmlsaXR5P1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAxJzogJzNGRTUnLFxyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM1MgTWFlbHN0cm9tJzogJzNGRkInLFxyXG4gICAgJ0UzUyBTd2lybGluZyBUc3VuYW1pJzogJzNGRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGRUEnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGRUInLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAzJzogJzNGRUMnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCA0JzogJzNGRUQnLFxyXG4gICAgJ0UzUyBTcGlubmluZyBEaXZlJzogJzNGRkQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTROIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MEVCJyxcclxuICAgICdFNE4gRXZpbCBFYXJ0aCc6ICc0MEVGJyxcclxuICAgICdFNE4gQWZ0ZXJzaG9jayAxJzogJzQxQjQnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDInOiAnNDBGMCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAxJzogJzQwRUQnLFxyXG4gICAgJ0U0TiBFeHBsb3Npb24gMic6ICc0MEY1JyxcclxuICAgICdFNE4gTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0TiBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMDAnLFxyXG4gICAgJ0U0TiBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDBGRicsXHJcbiAgICAnRTROIE1hc3NpdmUgTGFuZHNsaWRlJzogJzQwRkMnLFxyXG4gICAgJ0U0TiBTZWlzbWljIFdhdmUnOiAnNDBGMycsXHJcbiAgICAnRTROIEZhdWx0IExpbmUnOiAnNDEwMScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBwZW9wbGUgZ2V0IGhpdHRpbmcgYnkgbWFya2VycyB0aGV5IHNob3VsZG4ndFxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFua3MgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlcnMsIG1lZ2FsaXRoc1xyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFyZ2V0IGdldHRpbmcgaGl0IGJ5IHRhbmtidXN0ZXJcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTRTIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MTA4JyxcclxuICAgICdFNFMgRXZpbCBFYXJ0aCc6ICc0MTBDJyxcclxuICAgICdFNFMgQWZ0ZXJzaG9jayAxJzogJzQxQjUnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDInOiAnNDEwRCcsXHJcbiAgICAnRTRTIEV4cGxvc2lvbic6ICc0MTBBJyxcclxuICAgICdFNFMgTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0UyBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMUQnLFxyXG4gICAgJ0U0UyBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDExQycsXHJcbiAgICAnRTRTIE1hc3NpdmUgTGFuZHNsaWRlIDEnOiAnNDExOCcsXHJcbiAgICAnRTRTIE1hc3NpdmUgTGFuZHNsaWRlIDInOiAnNDExOScsXHJcbiAgICAnRTRTIFNlaXNtaWMgV2F2ZSc6ICc0MTEwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDEnOiAnNDEzNScsXHJcbiAgICAnRTRTIER1YWwgRWFydGhlbiBGaXN0cyAyJzogJzQ2ODcnLFxyXG4gICAgJ0U0UyBQbGF0ZSBGcmFjdHVyZSc6ICc0M0VBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDEnOiAnNDNDQScsXHJcbiAgICAnRTRTIEVhcnRoZW4gRmlzdCAyJzogJzQzQzknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZSBDb2xsZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfjgr/jgqTjgr/jg7MnIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn5rOw5Z2mJyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+2DgOydtO2DhCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZhdWx0TGluZVRhcmdldCA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0MTFFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmZhdWx0TGluZVRhcmdldCAhPT0gbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUnVuIE92ZXInLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgw6ljcmFzw6koZSknLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1TiBJbXBhY3QnOiAnNEUzQScsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVOIExpZ2h0bmluZyBCb2x0JzogJzRCOUMnLCAvLyBTdG9ybWNsb3VkIHN0YW5kYXJkIGF0dGFja1xyXG4gICAgJ0U1TiBHYWxsb3AnOiAnNEI5NycsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNU4gU2hvY2sgU3RyaWtlJzogJzRCQTEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVOIFZvbHQgU3RyaWtlJzogJzRDRjInLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVOIEp1ZGdtZW50IEpvbHQnOiAnNEI4RicsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIGEgcGxheWVyIGdldHMgNCsgc3RhY2tzIG9mIG9yYnMuIERvbid0IGJlIGdyZWVkeSFcclxuICAgICAgaWQ6ICdFNU4gU3RhdGljIENvbmRlbnNhdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEhlbHBlciBmb3Igb3JiIHBpY2t1cCBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0U1TiBPcmIgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gT3JiIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChubyBvcmIpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGtlaW4gT3JiKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChwYXMgZCdvcmJlKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fnjonnhKHjgZcpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOayoeWQg+eQgylgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBUYXJnZXQgVHJhY2tpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzID0gZGF0YS5jbG91ZE1hcmtlcnMgfHwgW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVOIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QjlEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDMwLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgbSBvZiBkYXRhLmNsb3VkTWFya2Vycykge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogZGF0YS5jbG91ZE1hcmtlcnNbbV0sXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoY2xvdWRzIHRvbyBjbG9zZSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChXb2xrZW4genUgbmFoZSlgLFxyXG4gICAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChudWFnZXMgdHJvcCBwcm9jaGVzKWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbsui/keOBmeOBjilgLFxyXG4gICAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fkupHph43lj6ApYCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBjbGVhbnVwJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBpcyB0aGVyZSBhIGRpZmZlcmVudCBhYmlsaXR5IGlmIHRoZSBzaGllbGQgZHV0eSBhY3Rpb24gaXNuJ3QgdXNlZCBwcm9wZXJseT9cclxuLy8gVE9ETzogaXMgdGhlcmUgYW4gYWJpbGl0eSBmcm9tIFJhaWRlbiAodGhlIGJpcmQpIGlmIHlvdSBnZXQgZWF0ZW4/XHJcbi8vIFRPRE86IG1heWJlIGNoYWluIGxpZ2h0bmluZyB3YXJuaW5nIGlmIHlvdSBnZXQgaGl0IHdoaWxlIHlvdSBoYXZlIHN5c3RlbSBzaG9jayAoOEI4KVxyXG5cclxuY29uc3Qgbm9PcmIgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBvcmIpJyxcclxuICAgIGRlOiBzdHIgKyAnIChrZWluIE9yYiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkXFwnb3JiZSknLFxyXG4gICAgamE6IHN0ciArICcgKOmbt+eOieeEoeOBlyknLFxyXG4gICAgY246IHN0ciArICcgKOayoeWQg+eQgyknLFxyXG4gICAga286IHN0ciArICcgKOq1rOyKrCDsl4bsnYwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VGdWxtaW5hdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTVTIEltcGFjdCc6ICc0RTNCJywgLy8gU3RyYXRvc3BlYXIgbGFuZGluZyBBb0VcclxuICAgICdFNVMgR2FsbG9wJzogJzRCQjQnLCAvLyBTaWRld2F5cyBhZGQgY2hhcmdlXHJcbiAgICAnRTVTIFNob2NrIFN0cmlrZSc6ICc0QkMxJywgLy8gU21hbGwgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBUd2lzdGVyJzogJzRCQzcnLCAvLyBUd2lzdGVyIHN0ZXBwZWQgbGVhZGVyXHJcbiAgICAnRTVTIFN0ZXBwZWQgTGVhZGVyIERvbnV0JzogJzRCQzgnLCAvLyBEb251dCBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTaG9jayc6ICc0RTNEJywgLy8gSGF0ZWQgb2YgTGV2aW4gU3Rvcm1jbG91ZC1jbGVhbnNhYmxlIGV4cGxvZGluZyBkZWJ1ZmZcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNVMgSnVkZ21lbnQgSm9sdCc6ICc0QkE3JywgLy8gU3RyYXRvc3BlYXIgZXhwbG9zaW9uc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTVTIFZvbHQgU3RyaWtlIERvdWJsZSc6ICc0QkMzJywgLy8gTGFyZ2UgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gICAgJ0U1UyBDcmlwcGxpbmcgQmxvdyc6ICc0QkNBJyxcclxuICAgICdFNVMgQ2hhaW4gTGlnaHRuaW5nIERvdWJsZSc6ICc0QkM1JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEhlbHBlciBmb3Igb3JiIHBpY2t1cCBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0U1UyBPcmIgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgT3JiIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgVm9sdCBTdHJpa2UgT3JiJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQzMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgRGVhZGx5IERpc2NoYXJnZSBCaWcgS25vY2tiYWNrJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgTGlnaHRuaW5nIEJvbHQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCOScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEhhdmluZyBhIG5vbi1pZGVtcG90ZW50IGNvbmRpdGlvbiBmdW5jdGlvbiBpcyBhIGJpdCA8XzxcclxuICAgICAgICAvLyBPbmx5IGNvbnNpZGVyIGxpZ2h0bmluZyBib2x0IGRhbWFnZSBpZiB5b3UgaGF2ZSBhIGRlYnVmZiB0byBjbGVhci5cclxuICAgICAgICBpZiAoIWRhdGEuaGF0ZWQgfHwgIWRhdGEuaGF0ZWRbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIEhhdGVkIG9mIExldmluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDBEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID0gZGF0YS5oYXRlZCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPSBkYXRhLmNsb3VkTWFya2VycyB8fCBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNVMgVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIGRhdGEuY2xvdWRNYXJrZXJzKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBkYXRhLmNsb3VkTWFya2Vyc1ttXSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChjbG91ZHMgdG9vIGNsb3NlKWAsXHJcbiAgICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKFdvbGtlbiB6dSBuYWhlKWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKG51YWdlcyB0cm9wIHByb2NoZXMpYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zuy6L+R44GZ44GOKWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+S6kemHjeWPoClgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgLy8gU3Rvcm1jbG91ZHMgcmVzb2x2ZSB3ZWxsIGJlZm9yZSB0aGlzLlxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U2TiBUaG9ybnMnOiAnNEJEQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZOIEZlcm9zdG9ybSAxJzogJzRCREQnLFxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMic6ICc0QkU1JyxcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAxJzogJzRCRTAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAyJzogJzRCRTYnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZOIEV4cGxvc2lvbic6ICc0QkUyJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZOIEhlYXQgQnVyc3QnOiAnNEJFQycsXHJcbiAgICAnRTZOIENvbmZsYWcgU3RyaWtlJzogJzRCRUUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZOIFNwaWtlIE9mIEZsYW1lJzogJzRCRjAnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuICAgICdFNk4gUmFkaWFudCBQbHVtZSc6ICc0QkYyJyxcclxuICAgICdFNk4gRXJ1cHRpb24nOiAnNEJGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZOIFZhY3V1bSBTbGljZSc6ICc0QkQ1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2TiBEb3duYnVyc3QnOiAnNEJEQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZS4gQWN0dWFsIGtub2NrYmFjayBpcyB1bmtub3duIGFiaWxpdHkgNEMyMFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBLaWxscyBub24tdGFua3Mgd2hvIGdldCBoaXQgYnkgaXQuXHJcbiAgICAnRTZOIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRCRUQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBTaW1wbGVPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG4vLyBUT0RPOiBjaGVjayB0ZXRoZXJzIGJlaW5nIGN1dCAod2hlbiB0aGV5IHNob3VsZG4ndClcclxuLy8gVE9ETzogY2hlY2sgZm9yIGNvbmN1c3NlZCBkZWJ1ZmZcclxuLy8gVE9ETzogY2hlY2sgZm9yIHRha2luZyB0YW5rYnVzdGVyIHdpdGggbGlnaHRoZWFkZWRcclxuLy8gVE9ETzogY2hlY2sgZm9yIG9uZSBwZXJzb24gdGFraW5nIG11bHRpcGxlIFN0b3JtIE9mIEZ1cnkgVGV0aGVycyAoNEMwMS80QzA4KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogU2ltcGxlT29wc3lUcmlnZ2VyU2V0ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VGdXJvclNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBJdCdzIGNvbW1vbiB0byBqdXN0IGlnbm9yZSBmdXRib2wgbWVjaGFuaWNzLCBzbyBkb24ndCB3YXJuIG9uIFN0cmlrZSBTcGFyay5cclxuICAgIC8vICdTcGlrZSBPZiBGbGFtZSc6ICc0QzEzJywgLy8gT3JiIGV4cGxvc2lvbnMgYWZ0ZXIgU3RyaWtlIFNwYXJrXHJcblxyXG4gICAgJ0U2UyBUaG9ybnMnOiAnNEJGQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZTIEZlcm9zdG9ybSAxJzogJzRCRkQnLFxyXG4gICAgJ0U2UyBGZXJvc3Rvcm0gMic6ICc0QzA2JyxcclxuICAgICdFNlMgU3Rvcm0gT2YgRnVyeSAxJzogJzRDMDAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNlMgU3Rvcm0gT2YgRnVyeSAyJzogJzRDMDcnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZTIEV4cGxvc2lvbic6ICc0QzAzJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZTIEhlYXQgQnVyc3QnOiAnNEMxRicsXHJcbiAgICAnRTZTIENvbmZsYWcgU3RyaWtlJzogJzRDMTAnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZTIFJhZGlhbnQgUGx1bWUnOiAnNEMxNScsXHJcbiAgICAnRTZTIEVydXB0aW9uJzogJzRDMTcnLFxyXG4gICAgJ0U2UyBXaW5kIEN1dHRlcic6ICc0QzAyJywgLy8gVGV0aGVyLWN1dHRpbmcgbGluZSBhb2VcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNlMgVmFjdXVtIFNsaWNlJzogJzRCRjUnLCAvLyBEYXJrIGxpbmUgQW9FIGZyb20gR2FydWRhXHJcbiAgICAnRTZTIERvd25idXJzdCAxJzogJzRCRkInLCAvLyBCbHVlIGtub2NrYmFjayBjaXJjbGUgKEdhcnVkYSkuXHJcbiAgICAnRTZTIERvd25idXJzdCAyJzogJzRCRkMnLCAvLyBCbHVlIGtub2NrYmFjayBjaXJjbGUgKFJha3RhcGFrc2EpLlxyXG4gICAgJ0U2UyBNZXRlb3IgU3RyaWtlJzogJzRDMEYnLCAvLyBGcm9udGFsIGF2b2lkYWJsZSB0YW5rIGJ1c3RlclxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTZTIEhhbmRzIG9mIEhlbGwnOiAnNEMwW0JDXScsIC8vIFRldGhlciBjaGFyZ2VcclxuICAgICdFNlMgSGFuZHMgb2YgRmxhbWUnOiAnNEMwQScsIC8vIEZpcnN0IFRhbmtidXN0ZXJcclxuICAgICdFNlMgSW5zdGFudCBJbmNpbmVyYXRpb24nOiAnNEMwRScsIC8vIFNlY29uZCBUYW5rYnVzdGVyXHJcbiAgICAnRTZTIEJsYXplJzogJzRDMUInLCAvLyBGbGFtZSBUb3JuYWRvIENsZWF2ZVxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdFNlMgQWlyIEJ1bXAnOiAnNEJGOScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gQXN0cmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gVW1icmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBMaWdodFxcJ3MgQ291cnNlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzNFJywgJzRDNDAnLCAnNEMyMicsICc0QzNDJywgJzRFNjMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0QnLCAnNEMyMycsICc0QzQxJywgJzRDNDMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc0FzdHJhbCB8fCAhZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBhbiBvcmIgZHVyaW5nIHRvcm5hZG8gcGhhc2VcclxuLy8gVE9ETzoganVtcGluZyBpbiB0aGUgdG9ybmFkbyBkYW1hZ2U/P1xyXG4vLyBUT0RPOiB0YWtpbmcgc3VuZ3JhY2UoNEM4MCkgb3IgbW9vbmdyYWNlKDRDODIpIHdpdGggd3JvbmcgZGVidWZmXHJcbi8vIFRPRE86IHN0eWdpYW4gc3BlYXIvc2lsdmVyIHNwZWFyIHdpdGggdGhlIHdyb25nIGRlYnVmZlxyXG4vLyBUT0RPOiB0YWtpbmcgZXhwbG9zaW9uIGZyb20gdGhlIHdyb25nIENoaWFyby9TY3VybyBvcmJcclxuLy8gVE9ETzogaGFuZGxlIDRDODkgU2lsdmVyIFN0YWtlIHRhbmtidXN0ZXIgMm5kIGhpdCwgYXMgaXQncyBvayB0byBoYXZlIHR3byBpbi5cclxuXHJcbmNvbnN0IHdyb25nQnVmZiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKG5vIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChrZWluIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZGUgYnVmZiknLFxyXG4gICAgamE6IHN0ciArICcgKOODkOODleeEoeOBlyknLFxyXG4gICAgY246IHN0ciArICcgKOayoeaciUJ1ZmYpJyxcclxuICAgIGtvOiBzdHIgKyAnICjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzQXN0cmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGhhc1VtYnJhbD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VJY29ub2NsYXNtU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFN1MgU2lsdmVyIFN3b3JkJzogJzRDOEUnLCAvLyBncm91bmQgYW9lXHJcbiAgICAnRTdTIE92ZXJ3aGVsbWluZyBGb3JjZSc6ICc0QzczJywgLy8gYWRkIHBoYXNlIGdyb3VuZCBhb2VcclxuICAgICdFN1MgU3RyZW5ndGggaW4gTnVtYmVycyAxJzogJzRDNzAnLCAvLyBhZGQgZ2V0IHVuZGVyXHJcbiAgICAnRTdTIFN0cmVuZ3RoIGluIE51bWJlcnMgMic6ICc0QzcxJywgLy8gYWRkIGdldCBvdXRcclxuICAgICdFN1MgUGFwZXIgQ3V0JzogJzRDN0QnLCAvLyB0b3JuYWRvIGdyb3VuZCBhb2VzXHJcbiAgICAnRTdTIEJ1ZmZldCc6ICc0Qzc3JywgLy8gdG9ybmFkbyBncm91bmQgYW9lcyBhbHNvPz9cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFN1MgQmV0d2l4dCBXb3JsZHMnOiAnNEM2QicsIC8vIHB1cnBsZSBncm91bmQgbGluZSBhb2VzXHJcbiAgICAnRTdTIENydXNhZGUnOiAnNEM1OCcsIC8vIGJsdWUga25vY2tiYWNrIGNpcmNsZSAoc3RhbmRpbmcgaW4gaXQpXHJcbiAgICAnRTdTIEV4cGxvc2lvbic6ICc0QzZGJywgLy8gZGlkbid0IGtpbGwgYW4gYWRkXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFN1MgU3R5Z2lhbiBTdGFrZSc6ICc0QzM0JywgLy8gTGFzZXIgdGFuayBidXN0ZXIgMVxyXG4gICAgJ0U3UyBTaWx2ZXIgU2hvdCc6ICc0QzkyJywgLy8gU3ByZWFkIG1hcmtlcnNcclxuICAgICdFN1MgU2lsdmVyIFNjb3VyZ2UnOiAnNEM5MycsIC8vIEljZSBtYXJrZXJzXHJcbiAgICAnRTdTIENoaWFybyBTY3VybyBFeHBsb3Npb24gMSc6ICc0RDE0JywgLy8gb3JiIGV4cGxvc2lvblxyXG4gICAgJ0U3UyBDaGlhcm8gU2N1cm8gRXhwbG9zaW9uIDInOiAnNEQxNScsIC8vIG9yYiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEludGVycnVwdFxyXG4gICAgICBpZDogJ0U3UyBBZHZlbnQgT2YgTGlnaHQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRDNkUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUT0RPOiBpcyB0aGlzIGJsYW1lIGNvcnJlY3Q/IGRvZXMgdGhpcyBoYXZlIGEgdGFyZ2V0P1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBMaWdodFxcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDNjInLCAnNEM2MycsICc0QzY0JywgJzRDNUInLCAnNEM1RiddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzVW1icmFsIHx8ICFkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzQXN0cmFsICYmIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgRGFya3NcXCdzIENvdXJzZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzY1JywgJzRDNjYnLCAnNEM2NycsICc0QzVBJywgJzRDNjAnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc0FzdHJhbCB8fCAhZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQ3J1c2FkZSBLbm9ja2JhY2snLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDRDNzYgaXMgdGhlIGtub2NrYmFjayBkYW1hZ2UsIDRDNTggaXMgdGhlIGRhbWFnZSBmb3Igc3RhbmRpbmcgb24gdGhlIHB1Y2suXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0Qzc2JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThOIEJpdGluZyBGcm9zdCc6ICc0RERCJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOE4gRHJpdmluZyBGcm9zdCc6ICc0RERDJywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOE4gRnJpZ2lkIFN0b25lJzogJzRFNjYnLCAvLyBTbWFsbCBzcHJlYWQgY2lyY2xlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgQXhlIEtpY2snOiAnNEUwMCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gUmVmbGVjdGVkIFNjeXRoZSBLaWNrJzogJzRFMDEnLCAvLyBEb251dCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gRnJpZ2lkIEVydXB0aW9uJzogJzRFMDknLCAvLyBTbWFsbCBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gSWNpY2xlIEltcGFjdCc6ICc0RTBBJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEF4ZSBLaWNrJzogJzRERTInLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBTY3l0aGUgS2ljayc6ICc0REUzJywgLy8gRG9udXQgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0JzogJzRERkUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0JzogJzRERkYnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc5NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gSGVhdmVubHkgU3RyaWtlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRERDgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc3Rvw59lbiEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBGcm9zdCBBcm1vcicsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uvuOuBhOufrOynkCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogcnVzaCBoaXR0aW5nIHRoZSBjcnlzdGFsXHJcbi8vIFRPRE86IGFkZHMgbm90IGJlaW5nIGtpbGxlZFxyXG4vLyBUT0RPOiB0YWtpbmcgdGhlIHJ1c2ggdHdpY2UgKHdoZW4geW91IGhhdmUgZGVidWZmKVxyXG4vLyBUT0RPOiBub3QgaGl0dGluZyB0aGUgZHJhZ29uIGZvdXIgdGltZXMgZHVyaW5nIHd5cm0ncyBsYW1lbnRcclxuLy8gVE9ETzogZGVhdGggcmVhc29ucyBmb3Igbm90IHBpY2tpbmcgdXAgcHVkZGxlXHJcbi8vIFRPRE86IG5vdCBiZWluZyBpbiB0aGUgdG93ZXIgd2hlbiB5b3Ugc2hvdWxkXHJcbi8vIFRPRE86IHBpY2tpbmcgdXAgdG9vIG1hbnkgc3RhY2tzXHJcblxyXG4vLyBOb3RlOiBCYW5pc2ggSUlJICg0REE4KSBhbmQgQmFuaXNoIElpaSBEaXZpZGVkICg0REE5KSBib3RoIGFyZSB0eXBlPTB4MTYgbGluZXMuXHJcbi8vIFRoZSBzYW1lIGlzIHRydWUgZm9yIEJhbmlzaCAoNERBNikgYW5kIEJhbmlzaCBEaXZpZGVkICg0REE3KS5cclxuLy8gSSdtIG5vdCBzdXJlIHRoaXMgbWFrZXMgYW55IHNlbnNlPyBCdXQgY2FuJ3QgdGVsbCBpZiB0aGUgc3ByZWFkIHdhcyBhIG1pc3Rha2Ugb3Igbm90LlxyXG4vLyBNYXliZSB3ZSBjb3VsZCBjaGVjayBmb3IgXCJNYWdpYyBWdWxuZXJhYmlsaXR5IFVwXCI/XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2VTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4UyBCaXRpbmcgRnJvc3QnOiAnNEQ2NicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIERyaXZpbmcgRnJvc3QnOiAnNEQ2NycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIEF4ZSBLaWNrJzogJzRENkQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBTY3l0aGUgS2ljayc6ICc0RDZFJywgLy8gRG9udXQgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQXhlIEtpY2snOiAnNERCOScsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIFNjeXRoZSBLaWNrJzogJzREQkEnLCAvLyBEb251dCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgRnJpZ2lkIEVydXB0aW9uJzogJzREOUYnLCAvLyBTbWFsbCBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgRnJpZ2lkIE5lZWRsZSc6ICc0RDlEJywgLy8gOC13YXkgXCJmbG93ZXJcIiBleHBsb3Npb25cclxuICAgICdFOFMgSWNpY2xlIEltcGFjdCc6ICc0REEwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMSc6ICc0REI3JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0IDInOiAnNERDMycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QgMSc6ICc0REI4JywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QgMic6ICc0REM0JywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDEnOiAnNEQ3NScsIC8vIExlZnQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDInOiAnNEQ3NicsIC8vIFJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAzJzogJzRENzcnLCAvLyBLbm9ja2JhY2sgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDEnOiAnNEQ5MCcsIC8vIFJlZmxlY3RlZCBsZWZ0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDInOiAnNERCQicsIC8vIFJlZmxlY3RlZCBsZWZ0IDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDMnOiAnNERDNycsIC8vIFJlZmxlY3RlZCByaWdodCAyXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyA0JzogJzREOTEnLCAvLyBSZWZsZWN0ZWQgcmlnaHQgMVxyXG4gICAgJ0U4UyBUd2luIFN0aWxsbmVzcyAxJzogJzRENjgnLFxyXG4gICAgJ0U4UyBUd2luIFN0aWxsbmVzcyAyJzogJzRENkInLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMSc6ICc0RDY5JyxcclxuICAgICdFOFMgVHdpbiBTaWxlbmNlIDInOiAnNEQ2QScsXHJcbiAgICAnRThTIEFraCBSaGFpJzogJzREOTknLFxyXG4gICAgJ0U4UyBFbWJpdHRlcmVkIERhbmNlIDEnOiAnNEQ3MCcsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMic6ICc0RDcxJyxcclxuICAgICdFOFMgU3BpdGVmdWwgRGFuY2UgMSc6ICc0RDZGJyxcclxuICAgICdFOFMgU3BpdGVmdWwgRGFuY2UgMic6ICc0RDcyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIEJyb2tlbiB0ZXRoZXIuXHJcbiAgICAnRThTIFJlZnVsZ2VudCBGYXRlJzogJzREQTQnLFxyXG4gICAgLy8gU2hhcmVkIG9yYiwgY29ycmVjdCBpcyBCcmlnaHQgUHVsc2UgKDREOTUpXHJcbiAgICAnRThTIEJsaW5kaW5nIFB1bHNlJzogJzREOTYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRThTIFBhdGggb2YgTGlnaHQnOiAnNERBMScsIC8vIFByb3RlYW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThTIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICAvLyBTdHVuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc5NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRThTIFN0b25lc2tpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzREODUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzUyMjMnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTIyNCcsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QUZGJywgLy8gZnJvbnRhbCBjbGVhdmUgdHV0b3JpYWwgbWVjaGFuaWNcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQaGFzZXInOiAnNTVFMScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlOIEJhZCBWaWJyYXRpb25zJzogJzU1RTYnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOU4gRWFydGgtU2hhdHRlcmluZyBQYXJ0aWNsZSBCZWFtJzogJzUyMjUnLCAvLyBtaXNzaW5nIHRvd2Vycz9cclxuICAgICdFOU4gQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1NURDJywgLy8gXCJnZXQgb3V0XCIgZHVyaW5nIHBhbmVsc1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAyJzogJzU1REInLCAvLyBDbG9uZSBsaW5lIGFvZXMgdy8gQW50aS1BaXIgUGFydGljbGUgQmVhbVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5TiBXaXRoZHJhdyc6ICc1NTM0JywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOU4gQWV0aGVyb3N5bnRoZXNpcyc6ICc1NTM1JywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDEnOiAnNTVFQicsIC8vIHRhbmsgbGFzZXIgd2l0aCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IDU2MUQgRXZpbCBTZWVkIGhpdHMgZXZlcnlvbmUsIGhhcmQgdG8ga25vdyBpZiB0aGVyZSdzIGEgZG91YmxlIHRhcFxyXG4vLyBUT0RPOiBmYWxsaW5nIHRocm91Z2ggcGFuZWwganVzdCBkb2VzIGRhbWFnZSB3aXRoIG5vIGFiaWxpdHkgbmFtZSwgbGlrZSBhIGRlYXRoIHdhbGxcclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBqdW1wIGluIHNlZWQgdGhvcm5zP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOVMgQmFkIFZpYnJhdGlvbnMnOiAnNTYxQycsIC8vIHRldGhlcmVkIG91dHNpZGUgZ2lhbnQgdHJlZSBncm91bmQgYW9lc1xyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUIwMCcsIC8vIGFudGktYWlyIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBoYXNlciBVbmxpbWl0ZWQnOiAnNTYwRScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlTIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNUIwMScsIC8vIHdpZGUtYW5nbGUgXCJvdXRcIlxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDEnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDInLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNUE5NScsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgMic6ICc1QTk2JywgLy8gYm9zcyBsZWZ0LXJpZ2h0IHN1bW1vbi9wYW5lbCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAxJzogJzU2MUUnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAyJzogJzU2MUYnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDMnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBUaGUgVGhpcmQgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTYwNCcsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBpbml0aWFsXHJcbiAgICAnRTlTIEFydCBPZiBEYXJrbmVzcyc6ICc1NjA2JywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGZpbmFsXHJcbiAgICAnRTlTIEZ1bGwtUGVyaW1pdGVyIFBhcnRpY2xlIEJlYW0nOiAnNTYyOScsIC8vIHBhbmVsIFwiZ2V0IGluXCJcclxuICAgICdFOVMgRGFyayBDaGFpbnMnOiAnNUZBQycsIC8vIFNsb3cgdG8gYnJlYWsgcGFydG5lciBjaGFpbnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOVMgV2l0aGRyYXcnOiAnNTYxQScsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlTIEFldGhlcm9zeW50aGVzaXMnOiAnNTYxQicsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRTlTIFN0eWdpYW4gVGVuZHJpbHMnOiAnOTUyJywgLy8gc3RhbmRpbmcgaW4gdGhlIGJyYW1ibGVzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0U5UyBNdWx0aS1Qcm9uZ2VkIFBhcnRpY2xlIEJlYW0nOiAnNTYwMCcsIC8vIEFydCBPZiBEYXJrbmVzcyBQYXJ0bmVyIFN0YWNrXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcInRhbmsgc3ByZWFkXCIuICBUaGlzIGNhbiBiZSBzdGFja2VkIGJ5IHR3byB0YW5rcyBpbnZ1bG5pbmcuXHJcbiAgICAgIC8vIE5vdGU6IHRoaXMgd2lsbCBzdGlsbCBzaG93IHNvbWV0aGluZyBmb3IgaG9sbWdhbmcvbGl2aW5nLCBidXRcclxuICAgICAgLy8gYXJndWFibHkgYSBoZWFsZXIgbWlnaHQgbmVlZCB0byBkbyBzb21ldGhpbmcgYWJvdXQgdGhhdCwgc28gbWF5YmVcclxuICAgICAgLy8gaXQncyBvayB0byBzdGlsbCBzaG93IGFzIGEgd2FybmluZz8/XHJcbiAgICAgIGlkOiAnRTlTIENvbmRlbnNlZCBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzU2MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcIm91dFwiLiAgVGhpcyBjYW4gYmUgaW52dWxuZWQgYnkgYSB0YW5rIGFsb25nIHdpdGggdGhlIHNwcmVhZCBhYm92ZS5cclxuICAgICAgaWQ6ICdFOVMgQW50aS1BaXIgUGhhc2VyIFVubGltaXRlZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1NjEyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VMaXRhbnksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxME4gRm9yd2FyZCBJbXBsb3Npb24nOiAnNTZCNCcsIC8vIGhvd2wgYm9zcyBpbXBsb3Npb25cclxuICAgICdFMTBOIEZvcndhcmQgU2hhZG93IEltcGxvc2lvbic6ICc1NkI1JywgLy8gaG93bCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBJbXBsb3Npb24nOiAnNTZCNycsIC8vIHRhaWwgYm9zcyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhY2t3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCOCcsIC8vIHRhaWwgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFyYnMgT2YgQWdvbnkgMSc6ICc1NkQ5JywgLy8gU2hhZG93IFdhcnJpb3IgMyBkb2cgcm9vbSBjbGVhdmVcclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDInOiAnNUIyNicsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBDbG9hayBPZiBTaGFkb3dzJzogJzVCMTEnLCAvLyBub24tc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwTiBUaHJvbmUgT2YgU2hhZG93JzogJzU2QzcnLCAvLyBzdGFuZGluZyB1cCBnZXQgb3V0XHJcbiAgICAnRTEwTiBSaWdodCBHaWdhIFNsYXNoJzogJzU2QUUnLCAvLyBib3NzIHJpZ2h0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIFJpZ2h0IFNoYWRvdyBTbGFzaCc6ICc1NkFGJywgLy8gZ2lnYSBzbGFzaCBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxME4gTGVmdCBHaWdhIFNsYXNoJzogJzU2QjEnLCAvLyBib3NzIGxlZnQgZ2lnYSBzbGFzaFxyXG4gICAgJ0UxME4gTGVmdCBTaGFkb3cgU2xhc2gnOiAnNTZCRCcsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIFNoYWRvd3kgRXJ1cHRpb24nOiAnNTZFMScsIC8vIGJhaXRlZCBncm91bmQgYW9lIG1hcmtlcnMgcGFpcmVkIHdpdGggYmFyYnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxME4gU2hhZG93XFwncyBFZGdlJzogJzU2REInLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGhpdHRpbmcgc2hhZG93IG9mIHRoZSBoZXJvIHdpdGggYWJpbGl0aWVzIGNhbiBjYXVzZSB5b3UgdG8gdGFrZSBkYW1hZ2UsIGxpc3QgdGhvc2U/XHJcbi8vICAgICAgIGUuZy4gcGlja2luZyB1cCB5b3VyIGZpcnN0IHBpdGNoIGJvZyBwdWRkbGUgd2lsbCBjYXVzZSB5b3UgdG8gZGllIHRvIHRoZSBkYW1hZ2VcclxuLy8gICAgICAgeW91ciBzaGFkb3cgdGFrZXMgZnJvbSBEZWVwc2hhZG93IE5vdmEgb3IgRGlzdGFudCBTY3JlYW0uXHJcbi8vIFRPRE86IDU3M0IgQmxpZ2h0aW5nIEJsaXR6IGlzc3VlcyBkdXJpbmcgbGltaXQgY3V0IG51bWJlcnNcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VMaXRhbnlTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFNpbmdsZSAxJzogJzU2RjInLCAvLyBzaW5nbGUgdGFpbCB1cCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDInOiAnNTZFRicsIC8vIHNpbmdsZSBob3dsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBRdWFkcnVwbGUgMSc6ICc1NkVGJywgLy8gcXVhZHJ1cGxlIHNldCBvZiBzaGFkb3cgaW1wbG9zaW9uc1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAyJzogJzU2RjInLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAxJzogJzU2RUMnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBTaW5nbGUgMic6ICc1NkVEJywgLy8gR2lnYSBzbGFzaCBzaW5nbGUgZnJvbSBzaGFkb3dcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggQm94IDEnOiAnNTcwOScsIC8vIEdpZ2Egc2xhc2ggYm94IGZyb20gZm91ciBncm91bmQgc2hhZG93c1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMic6ICc1NzBEJywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAxJzogJzU2RUMnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBRdWFkcnVwbGUgMic6ICc1NkU5JywgLy8gcXVhZHJ1cGxlIHNldCBvZiBnaWdhIHNsYXNoIGNsZWF2ZXNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMSc6ICc1QjEzJywgLy8gaW5pdGlhbCBub24tc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwUyBDbG9hayBPZiBTaGFkb3dzIDInOiAnNUIxNCcsIC8vIHNlY29uZCBzcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIFRocm9uZSBPZiBTaGFkb3cnOiAnNTcxNycsIC8vIHN0YW5kaW5nIHVwIGdldCBvdXRcclxuICAgICdFMTBTIFNoYWRvd3kgRXJ1cHRpb24nOiAnNTczOCcsIC8vIGJhaXRlZCBncm91bmQgYW9lIGR1cmluZyBhbXBsaWZpZXJcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTBTIFN3YXRoIE9mIFNpbGVuY2UgMSc6ICc1NzFBJywgLy8gU2hhZG93IGNsb25lIGNsZWF2ZSAodG9vIGNsb3NlKVxyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAyJzogJzVCQkYnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0aW1lZClcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMFMgU2hhZGVmaXJlJzogJzU3MzInLCAvLyBwdXJwbGUgdGFuayB1bWJyYWwgb3Jic1xyXG4gICAgJ0UxMFMgUGl0Y2ggQm9nJzogJzU3MjInLCAvLyBtYXJrZXIgc3ByZWFkIHRoYXQgZHJvcHMgYSBzaGFkb3cgcHVkZGxlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTBTIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NzI1JywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gT3JicycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbWVzaGFkb3cnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdTY2hhdHRlbmZsYW1tZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ0ZsYW1tZSBvbWJyYWxlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn44K344Oj44OJ44Km44OV44Os44Kk44OgJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH0gKHBhcnRpYWwgc3RhY2spYCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTBTIERhbWFnZSBEb3duIEJvc3MnLFxyXG4gICAgICAvLyBTaGFja2xlcyBiZWluZyBtZXNzZWQgdXAgYXBwZWFyIHRvIGp1c3QgZ2l2ZSB0aGUgRGFtYWdlIERvd24sIHdpdGggbm90aGluZyBlbHNlLlxyXG4gICAgICAvLyBNZXNzaW5nIHVwIHRvd2VycyBpcyB0aGUgVGhyaWNlLUNvbWUgUnVpbiBlZmZlY3QgKDlFMiksIGJ1dCBhbHNvIERhbWFnZSBEb3duLlxyXG4gICAgICAvLyBUT0RPOiBzb21lIG9mIHRoZXNlIHdpbGwgYmUgZHVwbGljYXRlZCB3aXRoIG90aGVycywgbGlrZSBgRTEwUyBUaHJvbmUgT2YgU2hhZG93YC5cclxuICAgICAgLy8gTWF5YmUgaXQnZCBiZSBuaWNlIHRvIGZpZ3VyZSBvdXQgaG93IHRvIHB1dCB0aGUgZGFtYWdlIG1hcmtlciBvbiB0aGF0P1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NoYWRvd2tlZXBlcicsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVua8O2bmlnJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnUm9pIERlIExcXCdPbWJyZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ+W9seOBrueOiycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RhbWFnZScsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogYCR7bWF0Y2hlcy5lZmZlY3R9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU2hhZG93IFdhcnJpb3IgNCBkb2cgcm9vbSBjbGVhdmVcclxuICAgICAgLy8gVGhpcyBjYW4gYmUgbWl0aWdhdGVkIGJ5IHRoZSB3aG9sZSBncm91cCwgc28gYWRkIGEgZGFtYWdlIGNvbmRpdGlvbi5cclxuICAgICAgaWQ6ICdFMTBTIEJhcmJzIE9mIEFnb255JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NzJBJywgJzVCMjcnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3NpcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2MkUnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEZpcmUnOiAnNTYyQycsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjMwJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm5vdXQnOiAnNTYyRicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBTaGluaW5nIEJsYWRlJzogJzU2MzEnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTYzQicsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2M0MnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBSZXNvdW5kaW5nIENyYWNrJzogJzU2NEQnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY0NScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjQzJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY0NicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFOIEJsYXN0aW5nIFpvbmUnOiAnNTYzRScsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJuIE1hcmsnOiAnNTY0RicsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExTiBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1NjJEID0gQnVybnQgU3RyaWtlIGZpcmUgZm9sbG93dXAgZHVyaW5nIG1vc3Qgb2YgdGhlIGZpZ2h0XHJcbiAgICAgIC8vIDU2NDQgPSBzYW1lIHRoaW5nLCBidXQgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NjJEJywgJzU2NDQnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyA1NjVBLzU2OEQgU2luc21va2UgQm91bmQgT2YgRmFpdGggc2hhcmVcclxuLy8gNTY1RS81Njk5IEJvd3Nob2NrIGhpdHMgdGFyZ2V0IG9mIDU2NUQgKHR3aWNlKSBhbmQgdHdvIG90aGVyc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3Npc1NhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjUyJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY1NCcsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjU2JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIFNoaW5pbmcgQmxhZGUnOiAnNTY1NycsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBGaXJlJzogJzU2OEUnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBMaWdodG5pbmcnOiAnNTY5NScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEhvbHknOiAnNTY5RCcsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSBDeWNsZSc6ICc1NjlFJywgLy8gQmFpdGVkIGV4cGxvc2lvbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjZEJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTY2QycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBGbGFtZSBCcmlnaHQgUHVsc2UnOiAnNTY3MScsIC8vIFJlZCBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBMZXZpbiBCcmlnaHQgUHVsc2UnOiAnNTY3MCcsIC8vIEJsdWUgY2FyZCBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBSZXNvbmFudCBXaW5kcyc6ICc1Njg5JywgLy8gRGVtaS1HdWt1bWF0eiBcImdldCBpblwiXHJcbiAgICAnRTExUyBSZXNvdW5kaW5nIENyYWNrJzogJzU2ODgnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFTIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJub3V0JzogJzU2N0MnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1Njc5JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2N0InLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgU2hpbmluZyBCbGFkZSc6ICc1NjdFJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgYmFpdGVkIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMVMgQnVybm91dCc6ICc1NjU1JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJ1cm5vdXQgQ3ljbGUnOiAnNTY5NicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExUyBCbGFzdGluZyBab25lJzogJzU2NzQnLCAvLyBQcmlzbWF0aWMgRGVjZXB0aW9uIGNoYXJnZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrJzogJzU2NjQnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhblxyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrIEN5Y2xlJzogJzU2OEMnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIFNpbnNtaXRlJzogJzU2NjcnLCAvLyBMaWdodG5pbmcgRWxlbWVudGFsIEJyZWFrIHNwcmVhZFxyXG4gICAgJ0UxMVMgU2luc21pdGUgQ3ljbGUnOiAnNTY5NCcsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJuIE1hcmsnOiAnNTZBMycsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICAgICdFMTFTIFNpbnNpZ2h0IDEnOiAnNTY2MScsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyXHJcbiAgICAnRTExUyBTaW5zaWdodCAyJzogJzVCQzcnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlciBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICdFMTFTIFNpbnNpZ2h0IDMnOiAnNTZBMCcsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdFMTFTIEhvbHkgU2luc2lnaHQgR3JvdXAgU2hhcmUnOiAnNTY2OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMVMgQmxhc3RidXJuIEtub2NrZWQgT2ZmJyxcclxuICAgICAgLy8gNTY1MyA9IEJ1cm50IFN0cmlrZSBmaXJlIGZvbGxvd3VwIGR1cmluZyBtb3N0IG9mIHRoZSBmaWdodFxyXG4gICAgICAvLyA1NjdBID0gc2FtZSB0aGluZywgYnV0IGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgICAvLyA1NjhGID0gc2FtZSB0aGluZywgYnV0IGR1cmluZyBDeWNsZSBvZiBGYWl0aFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTY1MycsICc1NjdBJywgJzU2OEYnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUV0ZXJuaXR5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTJOIEp1ZGdtZW50IEpvbHQgU2luZ2xlJzogJzU4NUYnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIEp1ZGdtZW50IEpvbHQnOiAnNEUzMCcsIC8vIFJhbXVoIGdldCBvdXQgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQgU2luZ2xlJzogJzU4NUMnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0XHJcbiAgICAnRTEyTiBUZW1wb3JhcnkgQ3VycmVudCc6ICc0RTJEJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gQ29uZmxhZyBTdHJpa2UgU2luZ2xlJzogJzU4NUQnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gQ29uZmxhZyBTdHJpa2UnOiAnNEUyRScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0gU2luZ2xlJzogJzU4NUUnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3RcclxuICAgICdFMTJOIEZlcm9zdG9ybSc6ICc0RTJGJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBSYXB0dXJvdXMgUmVhY2ggMSc6ICc1ODc4JywgLy8gSGFpcmN1dFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDInOiAnNTg3NycsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIEJvbWIgRXhwbG9zaW9uJzogJzU4NkQnLCAvLyBTbWFsbCBib21iIGV4cGxvc2lvblxyXG4gICAgJ0UxMk4gVGl0YW5pYyBCb21iIEV4cGxvc2lvbic6ICc1ODZGJywgLy8gTGFyZ2UgYm9tYiBleHBsb3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMk4gRWFydGhzaGFrZXInOiAnNTg4NScsIC8vIEVhcnRoc2hha2VyIG9uIGZpcnN0IHBsYXRmb3JtXHJcbiAgICAnRTEyTiBQcm9taXNlIEZyaWdpZCBTdG9uZSAxJzogJzU4NjcnLCAvLyBTaGl2YSBzcHJlYWQgd2l0aCBzbGlkaW5nXHJcbiAgICAnRTEyTiBQcm9taXNlIEZyaWdpZCBTdG9uZSAyJzogJzU4NjknLCAvLyBTaGl2YSBzcHJlYWQgd2l0aCBSYXB0dXJvdXMgUmVhY2hcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBPdXRwdXRzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9vdXRwdXRzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogYWRkIHNlcGFyYXRlIGRhbWFnZVdhcm4tZXNxdWUgaWNvbiBmb3IgZGFtYWdlIGRvd25zP1xyXG4vLyBUT0RPOiA1OEE2IFVuZGVyIFRoZSBXZWlnaHQgLyA1OEIyIENsYXNzaWNhbCBTY3VscHR1cmUgbWlzc2luZyBzb21lYm9keSBpbiBwYXJ0eSB3YXJuaW5nP1xyXG4vLyBUT0RPOiA1OENBIERhcmsgV2F0ZXIgSUlJIC8gNThDNSBTaGVsbCBDcnVzaGVyIHNob3VsZCBoaXQgZXZlcnlvbmUgaW4gcGFydHlcclxuLy8gVE9ETzogRGFyayBBZXJvIElJSSA1OEQ0IHNob3VsZCBub3QgYmUgYSBzaGFyZSBleGNlcHQgb24gYWR2YW5jZWQgcmVsYXRpdml0eSBmb3IgZG91YmxlIGFlcm8uXHJcbi8vIChmb3IgZ2FpbnMgZWZmZWN0LCBzaW5nbGUgYWVybyA9IH4yMyBzZWNvbmRzLCBkb3VibGUgYWVybyA9IH4zMSBzZWNvbmRzIGR1cmF0aW9uKVxyXG5cclxuLy8gRHVlIHRvIGNoYW5nZXMgaW50cm9kdWNlZCBpbiBwYXRjaCA1LjIsIG92ZXJoZWFkIG1hcmtlcnMgbm93IGhhdmUgYSByYW5kb20gb2Zmc2V0XHJcbi8vIGFkZGVkIHRvIHRoZWlyIElELiBUaGlzIG9mZnNldCBjdXJyZW50bHkgYXBwZWFycyB0byBiZSBzZXQgcGVyIGluc3RhbmNlLCBzb1xyXG4vLyB3ZSBjYW4gZGV0ZXJtaW5lIHdoYXQgaXQgaXMgZnJvbSB0aGUgZmlyc3Qgb3ZlcmhlYWQgbWFya2VyIHdlIHNlZS5cclxuLy8gVGhlIGZpcnN0IDFCIG1hcmtlciBpbiB0aGUgZW5jb3VudGVyIGlzIHRoZSBmb3JtbGVzcyB0YW5rYnVzdGVyLCBJRCAwMDRGLlxyXG5jb25zdCBmaXJzdEhlYWRtYXJrZXIgPSBwYXJzZUludCgnMDBEQScsIDE2KTtcclxuY29uc3QgZ2V0SGVhZG1hcmtlcklkID0gKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAvLyBJZiB3ZSBuYWl2ZWx5IGp1c3QgY2hlY2sgIWRhdGEuZGVjT2Zmc2V0IGFuZCBsZWF2ZSBpdCwgaXQgYnJlYWtzIGlmIHRoZSBmaXJzdCBtYXJrZXIgaXMgMDBEQS5cclxuICAvLyAoVGhpcyBtYWtlcyB0aGUgb2Zmc2V0IDAsIGFuZCAhMCBpcyB0cnVlLilcclxuICBpZiAodHlwZW9mIGRhdGEuZGVjT2Zmc2V0ID09PSAndW5kZWZpbmVkJylcclxuICAgIGRhdGEuZGVjT2Zmc2V0ID0gcGFyc2VJbnQobWF0Y2hlcy5pZCwgMTYpIC0gZmlyc3RIZWFkbWFya2VyO1xyXG4gIC8vIFRoZSBsZWFkaW5nIHplcm9lcyBhcmUgc3RyaXBwZWQgd2hlbiBjb252ZXJ0aW5nIGJhY2sgdG8gc3RyaW5nLCBzbyB3ZSByZS1hZGQgdGhlbSBoZXJlLlxyXG4gIC8vIEZvcnR1bmF0ZWx5LCB3ZSBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHdoZXRoZXIgb3Igbm90IHRoaXMgaXMgcm9idXN0LFxyXG4gIC8vIHNpbmNlIHdlIGtub3cgYWxsIHRoZSBJRHMgdGhhdCB3aWxsIGJlIHByZXNlbnQgaW4gdGhlIGVuY291bnRlci5cclxuICByZXR1cm4gKHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGRhdGEuZGVjT2Zmc2V0KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5wYWRTdGFydCg0LCAnMCcpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUV0ZXJuaXR5U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIExlZnQnOiAnNThBRCcsIC8vIEhhaXJjdXQgd2l0aCBsZWZ0IHNhZmUgc2lkZVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBSYXB0dXJvdXMgUmVhY2ggUmlnaHQnOiAnNThBRScsIC8vIEhhaXJjdXQgd2l0aCByaWdodCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgVGVtcG9yYXJ5IEN1cnJlbnQnOiAnNEU0NCcsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBDb25mbGFnIFN0cmlrZSc6ICc0RTQ1JywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBGZXJvc3Rvcm0nOiAnNEU0NicsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIEp1ZGdtZW50IEpvbHQnOiAnNEU0NycsIC8vIFJhbXVoIGdldCBvdXQgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIFNoYXR0ZXInOiAnNTg5QycsIC8vIEljZSBQaWxsYXIgZXhwbG9zaW9uIGlmIHRldGhlciBub3QgZ290dGVuXHJcbiAgICAnRTEyUyBQcm9taXNlIEltcGFjdCc6ICc1OEExJywgLy8gVGl0YW4gYm9tYiBkcm9wXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFyayBCbGl6emFyZCBJSUknOiAnNThEMycsIC8vIFJlbGF0aXZpdHkgZG9udXQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBBcG9jYWx5cHNlJzogJzU4RTYnLCAvLyBMaWdodCB1cCBjaXJjbGUgZXhwbG9zaW9ucyAoZGFtYWdlIGRvd24pXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgTWFlbHN0cm9tJzogJzU4REEnLCAvLyBBZHZhbmNlZCBSZWxhdGl2aXR5IHRyYWZmaWMgbGlnaHQgYW9lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgRnJpZ2lkIFN0b25lJzogJzU4OUUnLCAvLyBTaGl2YSBzcHJlYWRcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrZXN0IERhbmNlJzogJzRFMzMnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCArIGp1bXAgYmVmb3JlIGtub2NrYmFja1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQ3VycmVudCc6ICc1OEQ4JywgLy8gQmFpdGVkIHRyYWZmaWMgbGlnaHQgbGFzZXJzXHJcbiAgICAnRTEyUyBPcmFjbGUgU3Bpcml0IFRha2VyJzogJzU4QzYnLCAvLyBSYW5kb20ganVtcCBzcHJlYWQgbWVjaGFuaWMgYWZ0ZXIgU2hlbGwgQ3J1c2hlclxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAxJzogJzU4QkYnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCBmb3IgRHVhbCBBcG9jYWx5cHNlXHJcbiAgICAnRTEyUyBPcmFjbGUgU29tYmVyIERhbmNlIDInOiAnNThDMCcsIC8vIFNlY29uZCBzb21iZXIgZGFuY2UganVtcFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFdlaWdodCBPZiBUaGUgV29ybGQnOiAnNThBNScsIC8vIFRpdGFuIGJvbWIgYmx1ZSBtYXJrZXJcclxuICAgICdFMTJTIFByb21pc2UgUHVsc2UgT2YgVGhlIExhbmQnOiAnNThBMycsIC8vIFRpdGFuIGJvbWIgeWVsbG93IG1hcmtlclxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMSc6ICc1OENFJywgLy8gSW5pdGlhbCB3YXJtdXAgc3ByZWFkIG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFyayBFcnVwdGlvbiAyJzogJzU4Q0QnLCAvLyBSZWxhdGl2aXR5IHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIEJsYWNrIEhhbG8nOiAnNThDNycsIC8vIFRhbmtidXN0ZXIgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdFMTJTIE9yYWNsZSBEb29tJzogJzlENCcsIC8vIFJlbGF0aXZpdHkgcHVuaXNobWVudCBmb3IgbXVsdGlwbGUgbWlzdGFrZXNcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZvcmNlIE9mIFRoZSBMYW5kJzogJzU4QTQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQmlnIGNpcmNsZSBncm91bmQgYW9lcyBkdXJpbmcgU2hpdmEganVuY3Rpb24uXHJcbiAgICAgIC8vIFRoaXMgY2FuIGJlIHNoaWVsZGVkIHRocm91Z2ggYXMgbG9uZyBhcyB0aGF0IHBlcnNvbiBkb2Vzbid0IHN0YWNrLlxyXG4gICAgICBpZDogJ0UxMlMgSWNpY2xlIEltcGFjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0RTVBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIEhlYWRtYXJrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHt9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gZ2V0SGVhZG1hcmtlcklkKGRhdGEsIG1hdGNoZXMpO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0TGFzZXJNYXJrZXIgPSAnMDA5MSc7XHJcbiAgICAgICAgY29uc3QgbGFzdExhc2VyTWFya2VyID0gJzAwOTgnO1xyXG4gICAgICAgIGlmIChpZCA+PSBmaXJzdExhc2VyTWFya2VyICYmIGlkIDw9IGxhc3RMYXNlck1hcmtlcikge1xyXG4gICAgICAgICAgLy8gaWRzIGFyZSBzZXF1ZW50aWFsOiAjMSBzcXVhcmUsICMyIHNxdWFyZSwgIzMgc3F1YXJlLCAjNCBzcXVhcmUsICMxIHRyaWFuZ2xlIGV0Y1xyXG4gICAgICAgICAgY29uc3QgZGVjT2Zmc2V0ID0gcGFyc2VJbnQoaWQsIDE2KSAtIHBhcnNlSW50KGZpcnN0TGFzZXJNYXJrZXIsIDE2KTtcclxuXHJcbiAgICAgICAgICAvLyBkZWNPZmZzZXQgaXMgMC03LCBzbyBtYXAgMC0zIHRvIDEtNCBhbmQgNC03IHRvIDEtNC5cclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW0gPSBkYXRhLmxhc2VyTmFtZVRvTnVtIHx8IHt9O1xyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bVttYXRjaGVzLnRhcmdldF0gPSBkZWNPZmZzZXQgJSA0ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBzY3VscHR1cmVzIGFyZSBhZGRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpZ2h0LCBzbyB3ZSBuZWVkIHRvIGNoZWNrIHdoZXJlIHRoZXlcclxuICAgICAgLy8gdXNlIHRoZSBcIkNsYXNzaWNhbCBTY3VscHR1cmVcIiBhYmlsaXR5IGFuZCBlbmQgdXAgb24gdGhlIGFyZW5hIGZvciByZWFsLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgQ2xhc3NpY2FsIFNjdWxwdHVyZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoaXMgd2lsbCBydW4gcGVyIHBlcnNvbiB0aGF0IGdldHMgaGl0IGJ5IHRoZSBzYW1lIHNjdWxwdHVyZSwgYnV0IHRoYXQncyBmaW5lLlxyXG4gICAgICAgIC8vIFJlY29yZCB0aGUgeSBwb3NpdGlvbiBvZiBlYWNoIHNjdWxwdHVyZSBzbyB3ZSBjYW4gdXNlIGl0IGZvciBiZXR0ZXIgdGV4dCBsYXRlci5cclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMgfHwge307XHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGUgc291cmNlIG9mIHRoZSB0ZXRoZXIgaXMgdGhlIHBsYXllciwgdGhlIHRhcmdldCBpcyB0aGUgc2N1bHB0dXJlLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgdGFyZ2V0OiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgPSBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbWF0Y2hlcy5zb3VyY2VdID0gbWF0Y2hlcy50YXJnZXRJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUgQ291bnRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjMnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDEsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgPSBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDA7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCsrO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBpcyB0aGUgQ2hpc2VsZWQgU2N1bHB0dXJlIGxhc2VyIHdpdGggdGhlIGxpbWl0IGN1dCBkb3RzLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCbGFkZSBPZiBGbGFtZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyB0eXBlOiAnMjInLCBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5sYXNlck5hbWVUb051bSB8fCAhZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZCB8fCAhZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBGaW5kIHRoZSBwZXJzb24gd2hvIGhhcyB0aGlzIGxhc2VyIG51bWJlciBhbmQgaXMgdGV0aGVyZWQgdG8gdGhpcyBzdGF0dWUuXHJcbiAgICAgICAgY29uc3QgbnVtYmVyID0gKGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgfHwgMCkgKyAxO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUlkID0gbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gT2JqZWN0LmtleXMoZGF0YS5sYXNlck5hbWVUb051bSk7XHJcbiAgICAgICAgY29uc3Qgd2l0aE51bSA9IG5hbWVzLmZpbHRlcigobmFtZSkgPT4gZGF0YS5sYXNlck5hbWVUb051bVtuYW1lXSA9PT0gbnVtYmVyKTtcclxuICAgICAgICBjb25zdCBvd25lcnMgPSB3aXRoTnVtLmZpbHRlcigobmFtZSkgPT4gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZFtuYW1lXSA9PT0gc291cmNlSWQpO1xyXG5cclxuICAgICAgICAvLyBpZiBzb21lIGxvZ2ljIGVycm9yLCBqdXN0IGFib3J0LlxyXG4gICAgICAgIGlmIChvd25lcnMubGVuZ3RoICE9PSAxKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUaGUgb3duZXIgaGl0dGluZyB0aGVtc2VsdmVzIGlzbid0IGEgbWlzdGFrZS4uLnRlY2huaWNhbGx5LlxyXG4gICAgICAgIGlmIChvd25lcnNbMF0gPT09IG1hdGNoZXMudGFyZ2V0KVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBOb3cgdHJ5IHRvIGZpZ3VyZSBvdXQgd2hpY2ggc3RhdHVlIGlzIHdoaWNoLlxyXG4gICAgICAgIC8vIFBlb3BsZSBjYW4gcHV0IHRoZXNlIHdoZXJldmVyLiAgVGhleSBjb3VsZCBnbyBzaWRld2F5cywgb3IgZGlhZ29uYWwsIG9yIHdoYXRldmVyLlxyXG4gICAgICAgIC8vIEl0IHNlZW1zIG1vb29vb3N0IHBlb3BsZSBwdXQgdGhlc2Ugbm9ydGggLyBzb3V0aCAob24gdGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGFyZW5hKS5cclxuICAgICAgICAvLyBMZXQncyBzYXkgYSBtaW5pbXVtIG9mIDIgeWFsbXMgYXBhcnQgaW4gdGhlIHkgZGlyZWN0aW9uIHRvIGNvbnNpZGVyIHRoZW0gXCJub3J0aC9zb3V0aFwiLlxyXG4gICAgICAgIGNvbnN0IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMgPSAyO1xyXG5cclxuICAgICAgICBsZXQgaXNTdGF0dWVQb3NpdGlvbktub3duID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzU3RhdHVlTm9ydGggPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBzY3VscHR1cmVJZHMgPSBPYmplY3Qua2V5cyhkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpO1xyXG4gICAgICAgIGlmIChzY3VscHR1cmVJZHMubGVuZ3RoID09PSAyICYmIHNjdWxwdHVyZUlkcy5pbmNsdWRlcyhzb3VyY2VJZCkpIHtcclxuICAgICAgICAgIGNvbnN0IG90aGVySWQgPSBzY3VscHR1cmVJZHNbMF0gPT09IHNvdXJjZUlkID8gc2N1bHB0dXJlSWRzWzFdIDogc2N1bHB0dXJlSWRzWzBdO1xyXG4gICAgICAgICAgY29uc3Qgc291cmNlWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tzb3VyY2VJZF07XHJcbiAgICAgICAgICBjb25zdCBvdGhlclkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbb3RoZXJJZF07XHJcbiAgICAgICAgICBjb25zdCB5RGlmZiA9IE1hdGguYWJzKHNvdXJjZVkgLSBvdGhlclkpO1xyXG4gICAgICAgICAgaWYgKHlEaWZmID4gbWluaW11bVlhbG1zRm9yU3RhdHVlcykge1xyXG4gICAgICAgICAgICBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpc1N0YXR1ZU5vcnRoID0gc291cmNlWSA8IG90aGVyWTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG93bmVyID0gb3duZXJzWzBdO1xyXG4gICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuICAgICAgICBsZXQgdGV4dCA9IHtcclxuICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogpYCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgaXNTdGF0dWVOb3J0aCkge1xyXG4gICAgICAgICAgdGV4dCA9IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcnRoKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcmRlbilgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5YyX44GuJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6Ieq5YyX5pa5JHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7bnVtYmVyfeuyiCDrtoHsqr0pYCxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgIWlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBzb3V0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBTw7xkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWNl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg64Ko7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgYmxhbWU6IG93bmVyLFxyXG4gICAgICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBUcmFja2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnSWNlIFBpbGxhcicsIGlkOiBbJzAwMDEnLCAnMDAzOSddIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXIgPSBkYXRhLnBpbGxhcklkVG9Pd25lciB8fCB7fTtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBNaXN0YWtlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogJzU4OUInIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLnBpbGxhcklkVG9Pd25lcilcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgIT09IGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBpbGxhck93bmVyID0gZGF0YS5TaG9ydE5hbWUoZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0pO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke3BpbGxhck93bmVyfeOBi+OCiSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7cGlsbGFyT3duZXJ9XCIpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEdhaW4gRmlyZSBSZXNpc3RhbmNlIERvd24gSUknLFxyXG4gICAgICAvLyBUaGUgQmVhc3RseSBTY3VscHR1cmUgZ2l2ZXMgYSAzIHNlY29uZCBkZWJ1ZmYsIHRoZSBSZWdhbCBTY3VscHR1cmUgZ2l2ZXMgYSAxNHMgb25lLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnODMyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmlyZSA9IGRhdGEuZmlyZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIExvc2UgRmlyZSBSZXNpc3RhbmNlIERvd24gSUknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnODMyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmlyZSA9IGRhdGEuZmlyZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0JlYXN0bHkgU2N1bHB0dXJlJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdBYmJpbGQgRWluZXMgTMO2d2VuJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkCcsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycyA9IGRhdGEuc21hbGxMaW9uT3duZXJzIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uT3duZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBMaW9uc2JsYXplJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdBYmJpbGQgRWluZXMgTMO2d2VuJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0Nyw6lhdGlvbiBMw6lvbmluZScsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEZvbGtzIGJhaXRpbmcgdGhlIGJpZyBsaW9uIHNlY29uZCBjYW4gdGFrZSB0aGUgZmlyc3Qgc21hbGwgbGlvbiBoaXQsXHJcbiAgICAgICAgLy8gc28gaXQncyBub3Qgc3VmZmljaWVudCB0byBjaGVjayBvbmx5IHRoZSBvd25lci5cclxuICAgICAgICBpZiAoIWRhdGEuc21hbGxMaW9uT3duZXJzKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IG93bmVyID0gZGF0YS5zbWFsbExpb25JZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXTtcclxuICAgICAgICBpZiAoIW93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChtYXRjaGVzLnRhcmdldCA9PT0gb3duZXIpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB0YXJnZXQgYWxzbyBoYXMgYSBzbWFsbCBsaW9uIHRldGhlciwgdGhhdCBpcyBhbHdheXMgYSBtaXN0YWtlLlxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQncyBvbmx5IGEgbWlzdGFrZSBpZiB0aGUgdGFyZ2V0IGhhcyBhIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGNvbnN0IGhhc1NtYWxsTGlvbiA9IGRhdGEuc21hbGxMaW9uT3duZXJzLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIGlmIChoYXNTbWFsbExpb24gfHwgaGFzRmlyZURlYnVmZikge1xyXG4gICAgICAgICAgY29uc3Qgb3duZXJOaWNrID0gZGF0YS5TaG9ydE5hbWUob3duZXIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgICBjb25zdCB4ID0gcGFyc2VGbG9hdChtYXRjaGVzLngpO1xyXG4gICAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICAgIGxldCBkaXJPYmogPSBudWxsO1xyXG4gICAgICAgICAgaWYgKHkgPCBjZW50ZXJZKSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpck5FO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJOVztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpclNFO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTVztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICR7ZGlyT2JqWydlbiddfSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZGUnXX0pYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtvd25lck5pY2t9LCAke2Rpck9ialsnZnInXX0pYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJLCAke2Rpck9ialsnamEnXX0pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t9LCAke2Rpck9ialsnY24nXX1gLFxyXG4gICAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtkaXJPYmpbJ2tvJ119KWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIE5vcnRoIEJpZyBMaW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnRGdWxsKHsgbmFtZTogJ1JlZ2FsIFNjdWxwdHVyZScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCB5ID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgaWYgKHkgPCBjZW50ZXJZKVxyXG4gICAgICAgICAgZGF0YS5ub3J0aEJpZ0xpb24gPSBtYXRjaGVzLmlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCaWcgTGlvbiBLaW5nc2JsYXplJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ1JlZ2FsIFNjdWxwdHVyZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0FiYmlsZCBlaW5lcyBncm/Dn2VuIEzDtndlbicsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ2Nyw6lhdGlvbiBsw6lvbmluZSByb3lhbGUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZDnjosnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNpbmdsZVRhcmdldCA9IG1hdGNoZXMudHlwZSA9PT0gJzIxJztcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIC8vIFN1Y2Nlc3MgaWYgb25seSBvbmUgcGVyc29uIHRha2VzIGl0IGFuZCB0aGV5IGhhdmUgbm8gZmlyZSBkZWJ1ZmYuXHJcbiAgICAgICAgaWYgKHNpbmdsZVRhcmdldCAmJiAhaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0ge1xyXG4gICAgICAgICAgbm9ydGhCaWdMaW9uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnbm9ydGggYmlnIGxpb24nLFxyXG4gICAgICAgICAgICBkZTogJ05vcmRlbSwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWMlyknLFxyXG4gICAgICAgICAgICBjbjogJ+WMl+aWueWkp+eLruWtkCcsXHJcbiAgICAgICAgICAgIGtvOiAn67aB7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNvdXRoQmlnTGlvbjoge1xyXG4gICAgICAgICAgICBlbjogJ3NvdXRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdTw7xkZW4sIGdyb8OfZXIgTMO2d2UnLFxyXG4gICAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljZcpJyxcclxuICAgICAgICAgICAgY246ICfljZfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAgICBrbzogJ+uCqOyqvSDtgbAg7IKs7J6QJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzaGFyZWQ6IHtcclxuICAgICAgICAgICAgZW46ICdzaGFyZWQnLFxyXG4gICAgICAgICAgICBkZTogJ2dldGVpbHQnLFxyXG4gICAgICAgICAgICBqYTogJ+mHjeOBreOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn6YeN5Y+gJyxcclxuICAgICAgICAgICAga286ICfqsJnsnbQg66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBmaXJlRGVidWZmOiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGFkIGZpcmUnLFxyXG4gICAgICAgICAgICBkZTogJ2hhdHRlIEZldWVyJyxcclxuICAgICAgICAgICAgamE6ICfngo7ku5jjgY0nLFxyXG4gICAgICAgICAgICBjbjogJ+eBq0RlYnVmZicsXHJcbiAgICAgICAgICAgIGtvOiAn7ZmU7Je8IOuUlOuyhO2UhCDrsJvsnYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBsYWJlbHMgPSBbXTtcclxuICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24pIHtcclxuICAgICAgICAgIGlmIChkYXRhLm5vcnRoQmlnTGlvbiA9PT0gbWF0Y2hlcy5zb3VyY2VJZClcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0Lm5vcnRoQmlnTGlvbltkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5ub3J0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChvdXRwdXQuc291dGhCaWdMaW9uW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0LnNvdXRoQmlnTGlvblsnZW4nXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2luZ2xlVGFyZ2V0KVxyXG4gICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LnNoYXJlZFtkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5zaGFyZWRbJ2VuJ10pO1xyXG4gICAgICAgIGlmIChoYXNGaXJlRGVidWZmKVxyXG4gICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LmZpcmVEZWJ1ZmZbZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQuZmlyZURlYnVmZlsnZW4nXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7bGFiZWxzLmpvaW4oJywgJyl9KWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBLbm9ja2VkIE9mZicsXHJcbiAgICAgIC8vIDU4OUEgPSBJY2UgUGlsbGFyIChwcm9taXNlIHNoaXZhIHBoYXNlKVxyXG4gICAgICAvLyA1OEI2ID0gUGFsbSBPZiBUZW1wZXJhbmNlIChwcm9taXNlIHN0YXR1ZSBoYW5kKVxyXG4gICAgICAvLyA1OEI3ID0gTGFzZXIgRXllIChwcm9taXNlIGxpb24gcGhhc2UpXHJcbiAgICAgIC8vIDU4QzEgPSBEYXJrZXN0IERhbmNlIChvcmFjbGUgdGFuayBqdW1wICsga25vY2tiYWNrIGluIGJlZ2lubmluZyBhbmQgdHJpcGxlIGFwb2MpXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1ODlBJywgJzU4QjYnLCAnNThCNycsICc1OEMxJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIE9yYWNsZSBTaGFkb3dleWUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNThEMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHdhcm5pbmcgZm9yIHRha2luZyBEaWFtb25kIEZsYXNoICg1RkExKSBzdGFjayBvbiB5b3VyIG93bj9cclxuXHJcbi8vIERpYW1vbmQgV2VhcG9uIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVja0V4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMSc6ICc1RkFGJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAyJzogJzVGQjInLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDMnOiAnNUZDRCcsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNCc6ICc1RkNFJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA1JzogJzVGQ0YnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDYnOiAnNUZGOCcsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNyc6ICc2MTU5JywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEFydGljdWxhdGVkIEJpdCBBZXRoZXJpYWwgQnVsbGV0JzogJzVGQUInLCAvLyBiaXQgbGFzZXJzIGR1cmluZyBhbGwgcGhhc2VzXHJcbiAgICAnRGlhbW9uZEV4IERpYW1vbmQgU2hyYXBuZWwgMSc6ICc1RkNCJywgLy8gY2hhc2luZyBjaXJjbGVzXHJcbiAgICAnRGlhbW9uZEV4IERpYW1vbmQgU2hyYXBuZWwgMic6ICc1RkNDJywgLy8gY2hhc2luZyBjaXJjbGVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGlhbW9uZEV4IENsYXcgU3dpcGUgTGVmdCc6ICc1RkMyJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kRXggQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkMzJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kRXggQXVyaSBDeWNsb25lIDEnOiAnNUZEMScsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQ3ljbG9uZSAyJzogJzVGRDInLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmRFeCBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZGRScsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZEV4IEFpcnNoaXBcXCdzIEJhbmUgMic6ICc1RkQzJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmRFeCBUYW5rIExhc2Vycyc6ICc1RkM4JywgLy8gY2xlYXZpbmcgeWVsbG93IGxhc2VycyBvbiB0b3AgdHdvIGVubWl0eVxyXG4gICAgJ0RpYW1vbmRFeCBIb21pbmcgTGFzZXInOiAnNUZDNCcsIC8vIEFkYW1hbnRlIFB1cmdlIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGlhbW9uZEV4IEZsb29kIFJheSc6ICc1RkM3JywgLy8gXCJsaW1pdCBjdXRcIiBjbGVhdmVzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0RpYW1vbmRFeCBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkQwJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVjayxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBBcnRzJzogJzVGRTMnLCAvLyBBdXJpIEFydHMgZGFzaGVzXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBJbml0aWFsJzogJzVGRTEnLCAvLyBpbml0aWFsIGNpcmNsZSBvZiBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBDaGFzaW5nJzogJzVGRTInLCAvLyBmb2xsb3d1cCBjaXJjbGVzIGZyb20gRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFldGhlcmlhbCBCdWxsZXQnOiAnNUZENScsIC8vIGJpdCBsYXNlcnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIExlZnQnOiAnNUZEOScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkRBJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMSc6ICc1RkU2JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMic6ICc1RkU3JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZFOCcsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gSG9taW5nIExhc2VyJzogJzVGREInLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kIFdlYXBvbiBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkU1JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNhc3RydW1NYXJpbnVtRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5JzogJzVCRDMnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMSc6ICc1NTdCJywgLy8gRW1lcmFsZCBCZWFtIGluc2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkRXggUGhvdG9uIExhc2VyIDInOiAnNTU3RCcsIC8vIEVtZXJhbGQgQmVhbSBvdXRzaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSAxJzogJzU1N0EnLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSAyJzogJzU1NzknLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGRFeCBFeHBsb3Npb24nOiAnNTU5NicsIC8vIE1hZ2l0ZWsgTWluZSBleHBsb3Npb25cclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgSW5pdGlhbCc6ICc1NUNEJywgLy8gc3dvcmQgaW5pdGlhbCBwdWRkbGVzXHJcbiAgICAnRW1lcmFsZEV4IFRlcnRpdXMgVGVybWludXMgRXN0IEV4cGxvc2lvbic6ICc1NUNFJywgLy8gc3dvcmQgZXhwbG9zaW9uc1xyXG4gICAgJ0VtZXJhbGRFeCBBaXJib3JuZSBFeHBsb3Npb24nOiAnNTVCRCcsIC8vIGV4YWZsYXJlXHJcbiAgICAnRW1lcmFsZEV4IFNpZGVzY2F0aGUgMSc6ICc1NUQ0JywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAyJzogJzU1RDUnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaG90cyBGaXJlZCc6ICc1NUI3JywgLy8gcmFuayBhbmQgZmlsZSBzb2xkaWVyc1xyXG4gICAgJ0VtZXJhbGRFeCBTZWN1bmR1cyBUZXJtaW51cyBFc3QnOiAnNTVDQicsIC8vIGRyb3BwZWQgKyBhbmQgeCBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGRFeCBFeHBpcmUnOiAnNTVEMScsIC8vIGdyb3VuZCBhb2Ugb24gYm9zcyBcImdldCBvdXRcIlxyXG4gICAgJ0VtZXJhbGRFeCBBaXJlIFRhbSBTdG9ybSc6ICc1NUQwJywgLy8gZXhwYW5kaW5nIHJlZCBhbmQgYmxhY2sgZ3JvdW5kIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZEV4IERpdmlkZSBFdCBJbXBlcmEnOiAnNTVEOScsIC8vIG5vbi10YW5rIHByb3RlYW4gc3ByZWFkXHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMSc6ICc1NUM0JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMic6ICc1NUM1JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMyc6ICc1NUM2JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgNCc6ICc1NUM3JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DYXN0cnVtTWFyaW51bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXknOiAnNEY5RCcsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDEnOiAnNTUzNCcsIC8vIEVtZXJhbGQgQmVhbSBpbnNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDInOiAnNTUzNicsIC8vIEVtZXJhbGQgQmVhbSBtaWRkbGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDMnOiAnNTUzOCcsIC8vIEVtZXJhbGQgQmVhbSBvdXRzaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDEnOiAnNTUzMicsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXkgMic6ICc1NTMzJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBNYWduZXRpYyBNaW5lIEV4cGxvc2lvbic6ICc1QjA0JywgLy8gcmVwdWxzaW5nIG1pbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMSc6ICc1NTNGJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDInOiAnNTU0MCcsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAzJzogJzU1NDEnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgNCc6ICc1NTQyJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBCaXQgU3Rvcm0nOiAnNTU0QScsIC8vIFwiZ2V0IGluXCJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBFbWVyYWxkIENydXNoZXInOiAnNTUzQycsIC8vIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQdWxzZSBMYXNlcic6ICc1NTQ4JywgLy8gbGluZSBhb2VcclxuICAgICdFbWVyYWxkIFdlYXBvbiBFbmVyZ3kgQWV0aGVyb3BsYXNtJzogJzU1NTEnLCAvLyBoaXR0aW5nIGEgZ2xvd3kgb3JiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBHcm91bmQnOiAnNTU2RicsIC8vIHBhcnR5IHRhcmdldGVkIGdyb3VuZCBjb25lc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QnOiAnNEIzRScsIC8vIGdyb3VuZCBjaXJjbGUgZHVyaW5nIGFycm93IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2VjdW5kdXMgVGVybWludXMgRXN0JzogJzU1NkEnLCAvLyBYIC8gKyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFRlcnRpdXMgVGVybWludXMgRXN0JzogJzU1NkQnLCAvLyB0cmlwbGUgc3dvcmRzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2hvdHMgRmlyZWQnOiAnNTU1RicsIC8vIGxpbmUgYW9lcyBmcm9tIHNvbGRpZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIFAxJzogJzU1NEUnLCAvLyB0YW5rYnVzdGVyLCBwcm9iYWJseSBjbGVhdmVzLCBwaGFzZSAxXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMic6ICc1NTcwJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFbWVyYWxkIFdlYXBvbiBFbWVyYWxkIENydXNoZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NTNFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBHZXR0aW5nIGtub2NrZWQgaW50byBhIHdhbGwgZnJvbSB0aGUgYXJyb3cgaGVhZG1hcmtlci5cclxuICAgICAgaWQ6ICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0IFdhbGwnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTU2MycsICc1NTY0J10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBIYWRlcyBFeFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTWluc3RyZWxzQmFsbGFkSGFkZXNzRWxlZ3ksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAyJzogJzQ3QUEnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAzJzogJzQ3RTQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCA0JzogJzQ3RTUnLFxyXG4gICAgLy8gRXZlcnlib2R5IHN0YWNrcyBpbiBnb29kIGZhaXRoIGZvciBCYWQgRmFpdGgsIHNvIGRvbid0IGNhbGwgaXQgYSBtaXN0YWtlLlxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDEnOiAnNDdBRCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMic6ICc0N0IwJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAzJzogJzQ3QUUnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDQnOiAnNDdBRicsXHJcbiAgICAnSGFkZXNFeCBCcm9rZW4gRmFpdGgnOiAnNDdCMicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBTcGVhcic6ICc0N0I2JyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIENoYWtyYW0nOiAnNDdCNScsXHJcbiAgICAnSGFkZXNFeCBGb3JrZWQgTGlnaHRuaW5nJzogJzQ3QzknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDEnOiAnNDdGMScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMic6ICc0N0YyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIYWRlc0V4IENvbWV0JzogJzQ3QjknLCAvLyBtaXNzZWQgdG93ZXJcclxuICAgICdIYWRlc0V4IEFuY2llbnQgRXJ1cHRpb24nOiAnNDdEMycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMSc6ICc0N0VDJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAyJzogJzQ3RUQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFN0cmVhbSc6ICc0N0VBJyxcclxuICAgICdIYWRlc0V4IERlYWQgU3BhY2UnOiAnNDdFRScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgSW5pdGlhbCc6ICc0N0E5JyxcclxuICAgICdIYWRlc0V4IFJhdmVub3VzIEFzc2F1bHQnOiAnKD86NDdBNnw0N0E3KScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZsYW1lIDEnOiAnNDdDNicsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAxJzogJzQ3QzQnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMic6ICc0N0RGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ1NoYWRvdyBvZiB0aGUgQW5jaWVudHMnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEYXJrID0gZGF0YS5oYXNEYXJrIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuaGFzRGFyay5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzQ3QkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIERvbid0IGJsYW1lIHBlb3BsZSB3aG8gZG9uJ3QgaGF2ZSB0ZXRoZXJzLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmhhc0RhcmsgJiYgZGF0YS5oYXNEYXJrLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJvc3MgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiBbJ0lnZXlvcmhtXFwncyBTaGFkZScsICdMYWhhYnJlYVxcJ3MgU2hhZGUnXSwgaWQ6ICcwMDBFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdCb3NzZXMgVG9vIENsb3NlJyxcclxuICAgICAgICAgIGRlOiAnQm9zc2VzIHp1IE5haGUnLFxyXG4gICAgICAgICAgZnI6ICdCb3NzIHRyb3AgcHJvY2hlcycsXHJcbiAgICAgICAgICBqYTogJ+ODnOOCuei/keOBmeOBjuOCiycsXHJcbiAgICAgICAgICBjbjogJ0JPU1PpnaDlpKrov5HkuoYnLFxyXG4gICAgICAgICAga286ICfsq4Trk6TsnbQg64SI66y0IOqwgOq5jOybgCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEZWF0aCBTaHJpZWsnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDdDQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEhhZGVzIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRHlpbmdHYXNwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMSc6ICc0MTRCJyxcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMic6ICc0MTRDJyxcclxuICAgICdIYWRlcyBEYXJrIEVydXB0aW9uJzogJzQxNTInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMSc6ICc0MTU2JyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3ByZWFkIDInOiAnNDE1NycsXHJcbiAgICAnSGFkZXMgQnJva2VuIEZhaXRoJzogJzQxNEUnLFxyXG4gICAgJ0hhZGVzIEhlbGxib3JuIFlhd3AnOiAnNDE2RicsXHJcbiAgICAnSGFkZXMgUHVyZ2F0aW9uJzogJzQxNzInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTdHJlYW0nOiAnNDE1QycsXHJcbiAgICAnSGFkZXMgQWVybyc6ICc0NTk1JyxcclxuICAgICdIYWRlcyBFY2hvIDEnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgRWNobyAyJzogJzQxNjQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSGFkZXMgTmV0aGVyIEJsYXN0JzogJzQxNjMnLFxyXG4gICAgJ0hhZGVzIFJhdmVub3VzIEFzc2F1bHQnOiAnNDE1OCcsXHJcbiAgICAnSGFkZXMgQW5jaWVudCBEYXJrbmVzcyc6ICc0NTkzJyxcclxuICAgICdIYWRlcyBEdWFsIFN0cmlrZSc6ICc0MTYyJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIElubm9jZW5jZSBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDcm93bk9mVGhlSW1tYWN1bGF0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm9FeCBEdWVsIERlc2NlbnQnOiAnM0VEMicsXHJcbiAgICAnSW5ub0V4IFJlcHJvYmF0aW9uIDEnOiAnM0VFMCcsXHJcbiAgICAnSW5ub0V4IFJlcHJvYmF0aW9uIDInOiAnM0VDQycsXHJcbiAgICAnSW5ub0V4IFN3b3JkIG9mIENvbmRlbW5hdGlvbiAxJzogJzNFREUnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMic6ICczRURGJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMSc6ICczRUQzJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMic6ICczRUQ0JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMyc6ICczRUQ1JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNCc6ICczRUQ2JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNSc6ICczRUZCJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNic6ICczRUZDJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNyc6ICczRUZEJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgOCc6ICczRUZFJyxcclxuICAgICdJbm5vRXggSG9seSBUcmluaXR5JzogJzNFREInLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDEnOiAnM0VENycsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMic6ICczRUQ4JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAzJzogJzNFRDknLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDQnOiAnM0VEQScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNSc6ICczRUZGJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA2JzogJzNGMDAnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDcnOiAnM0YwMScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgOCc6ICczRjAyJyxcclxuICAgICdJbm5vRXggR29kIFJheSAxJzogJzNFRTYnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDInOiAnM0VFNycsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMyc6ICczRUU4JyxcclxuICAgICdJbm5vRXggRXhwbG9zaW9uJzogJzNFRjAnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSW5ub2NlbmNlIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm8gRGF5YnJlYWsnOiAnM0U5RCcsXHJcbiAgICAnSW5ubyBIb2x5IFRyaW5pdHknOiAnM0VCMycsXHJcblxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMSc6ICczRUI2JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDInOiAnM0VCOCcsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAzJzogJzNFQ0InLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gNCc6ICczRUI3JyxcclxuXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDEnOiAnM0VCMScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDInOiAnM0VCMicsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDMnOiAnM0VGOScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDQnOiAnM0VGQScsXHJcblxyXG4gICAgJ0lubm8gR29kIFJheSAxJzogJzNFQkQnLFxyXG4gICAgJ0lubm8gR29kIFJheSAyJzogJzNFQkUnLFxyXG4gICAgJ0lubm8gR29kIFJheSAzJzogJzNFQkYnLFxyXG4gICAgJ0lubm8gR29kIFJheSA0JzogJzNFQzAnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA1Q0NBLzVDQ0IvNUNDQywgV2F0ZXJzcG91dCA9IDVDRDFcclxuXHJcbi8vIExldmlhdGhhbiBVbnJlYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0xldmlVbiBHcmFuZCBGYWxsJzogJzVDREYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aVVuIEh5ZHJvc2hvdCc6ICc1Q0Q1JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlVbiBEcmVhZHN0b3JtJzogJzVDRDYnLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpVW4gQm9keSBTbGFtJzogJzVDRDInLCAvLyBsZXZpIHNsYW0gdGhhdCB0aWx0cyB0aGUgYm9hdFxyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDEnOiAnNUNEQicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAyJzogJzVDRTMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMyc6ICc1Q0U4JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDQnOiAnNUNFOScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlVbiBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlVbiBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpVW4gQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUNEMicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogdGFraW5nIHR3byBkaWZmZXJlbnQgSGlnaC1Qb3dlcmVkIEhvbWluZyBMYXNlcnMgKDRBRDgpXHJcbi8vIFRPRE86IGNvdWxkIGJsYW1lIHRoZSB0ZXRoZXJlZCBwbGF5ZXIgZm9yIFdoaXRlIEFnb255IC8gV2hpdGUgRnVyeSBmYWlsdXJlcz9cclxuXHJcbi8vIFJ1YnkgV2VhcG9uIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNpbmRlckRyaWZ0RXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgQml0IE1hZ2l0ZWsgUmF5JzogJzRBRDInLCAvLyBsaW5lIGFvZXMgZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QUQzJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJGJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDMnOiAnNEQwNCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNCc6ICc0RDA1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA1JzogJzRBQ0QnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDYnOiAnNEFDRScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggVW5kZXJtaW5lJzogJzRBRDAnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieUV4IFJ1YnkgUmF5JzogJzRCMDInLCAvLyBmcm9udGFsIGxhc2VyXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxJzogJzRBRDknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDInOiAnNEFEQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMyc6ICc0QUREJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA0JzogJzRBREUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDUnOiAnNEFERicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNic6ICc0QUUwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA3JzogJzRBRTEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDgnOiAnNEFFMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgOSc6ICc0QUUzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMCc6ICc0QUU0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMSc6ICc0QUU1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMic6ICc0QUU2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMyc6ICc0QUU3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNCc6ICc0QUU4JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNSc6ICc0QUU5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNic6ICc0QUVBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNyc6ICc0RTZCJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOCc6ICc0RTZDJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOSc6ICc0RTZEJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMCc6ICc0RTZFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMSc6ICc0RTZGJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMic6ICc0RTcwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDEnOiAnNEIwNScsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMic6ICc0QjA2JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAzJzogJzRCMDcnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDQnOiAnNEIwOCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gNSc6ICc0RE9EJywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBNZXRlb3IgQnVyc3QnOiAnNEFGMicsIC8vIG1ldGVvciBleHBsb2RpbmdcclxuICAgICdSdWJ5RXggQnJhZGFtYW50ZSc6ICc0RTM4JywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICAgICdSdWJ5RXggQ29tZXQgSGVhdnkgSW1wYWN0JzogJzRBRjYnLCAvLyBsZXR0aW5nIGEgdGFuayBjb21ldCBsYW5kXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgU3BoZXJlIEJ1cnN0JzogJzRBQ0InLCAvLyBleHBsb2RpbmcgdGhlIHJlZCBtaW5lXHJcbiAgICAnUnVieUV4IEx1bmFyIER5bmFtbyc6ICc0RUIwJywgLy8gXCJnZXQgaW5cIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSXJvbiBDaGFyaW90JzogJzRFQjEnLCAvLyBcImdldCBvdXRcIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSGVhcnQgSW4gVGhlIE1hY2hpbmUnOiAnNEFGQScsIC8vIFdoaXRlIEFnb255L0Z1cnkgc2t1bGwgaGl0dGluZyBwbGF5ZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdSdWJ5RXggSG9taW5nIExhc2Vycyc6ICc0QUQ2JywgLy8gc3ByZWFkIG1hcmtlcnMgZHVyaW5nIGN1dCBhbmQgcnVuXHJcbiAgICAnUnVieUV4IE1ldGVvciBTdHJlYW0nOiAnNEU2OCcsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBQMlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnUnVieUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIE5lZ2F0aXZlIEF1cmEgbG9va2F3YXkgZmFpbHVyZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdSdWJ5RXggU2NyZWVjaCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRBRUUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBpbnRvIHdhbGwnLFxyXG4gICAgICAgICAgICBkZTogJ1LDvGNrc3Rvw58gaW4gZGllIFdhbmQnLFxyXG4gICAgICAgICAgICBqYTogJ+WjgeOBuOODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA6Iez5aKZJyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFJ1YnkgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieSBSYXZlbnNjbGF3JzogJzRBOTMnLCAvLyBjZW50ZXJlZCBjaXJjbGUgYW9lIGZvciByYXZlbnNjbGF3XHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAxJzogJzRBOUEnLCAvLyBpbml0aWFsIGV4cGxvc2lvbiBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJFJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAzJzogJzRBOTQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA0JzogJzRBOTUnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA1JzogJzREMDInLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA2JzogJzREMDMnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBSdWJ5IFJheSc6ICc0QUM2JywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnkgVW5kZXJtaW5lJzogJzRBOTcnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMSc6ICc0RTY5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMic6ICc0RTZBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMyc6ICc0QUExJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNCc6ICc0QUEyJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNSc6ICc0QUEzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNic6ICc0QUE0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNyc6ICc0QUE1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOCc6ICc0QUE2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOSc6ICc0QUE3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMTAnOiAnNEMyMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDExJzogJzRDMkEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IENvbWV0IEJ1cnN0JzogJzRBQjQnLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieSBCcmFkYW1hbnRlJzogJzRBQkMnLCAvLyBoZWFkbWFya2VycyB3aXRoIGxpbmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieSBIb21pbmcgTGFzZXInOiAnNEFDNScsIC8vIHNwcmVhZCBtYXJrZXJzIGluIFAxXHJcbiAgICAnUnVieSBNZXRlb3IgU3RyZWFtJzogJzRFNjcnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMlxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBTaGl2YSBVbnJlYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnNTM3QicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnNTM3NicsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJzUzNzUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICc1Mzc4JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnNTM2RicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICc1Mzc5JyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFuayBidXN0ZXIuXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICc1MzczJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDUzN0Egb24geW91LCBidXQgaXQgaGFzIGFuIHVua25vd24gbmFtZS5cclxuICAgICAgLy8gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYSBXb29kXFwncyBFbWJyYWNlJzogJzNENTAnLFxyXG4gICAgLy8gJ1RpdGFuaWEgRnJvc3QgUnVuZSc6ICczRDRFJyxcclxuICAgICdUaXRhbmlhIEdlbnRsZSBCcmVlemUnOiAnM0Y4MycsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMSc6ICczRDU1JyxcclxuICAgICdUaXRhbmlhIFB1Y2tcXCdzIFJlYnVrZSc6ICczRDU4JyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAyJzogJzNFMDMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDEnOiAnM0Q1RCcsXHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMic6ICczRDVFJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgRGl2aW5hdGlvbiBSdW5lJzogJzNENUInLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhRXggV29vZFxcJ3MgRW1icmFjZSc6ICczRDJGJyxcclxuICAgIC8vICdUaXRhbmlhRXggRnJvc3QgUnVuZSc6ICczRDJCJyxcclxuICAgICdUaXRhbmlhRXggR2VudGxlIEJyZWV6ZSc6ICczRjgyJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDEnOiAnM0QzOScsXHJcbiAgICAnVGl0YW5pYUV4IFB1Y2tcXCdzIFJlYnVrZSc6ICczRDQzJyxcclxuICAgICdUaXRhbmlhRXggV2FsbG9wJzogJzNEM0InLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMic6ICczRDQ5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDEnOiAnM0Q0QycsXHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAyJzogJzNENEQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUT0RPOiBUaGlzIGNvdWxkIG1heWJlIGJsYW1lIHRoZSBwZXJzb24gd2l0aCB0aGUgdGV0aGVyP1xyXG4gICAgJ1RpdGFuaWFFeCBUaHVuZGVyIFJ1bmUnOiAnM0QyOScsXHJcbiAgICAnVGl0YW5pYUV4IERpdmluYXRpb24gUnVuZSc6ICczRDRBJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRpdGFuIFVucmVhbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU4RkUnLFxyXG4gICAgJ1RpdGFuVW4gQnVyc3QnOiAnNUFERicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBMYW5kc2xpZGUnOiAnNUFEQycsXHJcbiAgICAnVGl0YW5VbiBHYW9sZXIgTGFuZHNsaWRlJzogJzU5MDInLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBSb2NrIEJ1c3Rlcic6ICc1OEY2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTW91bnRhaW4gQnVzdGVyJzogJzU4RjcnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1lbW9yaWFNaXNlcmFFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDEnOiAnNENEMicsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAyJzogJzRDRDMnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMyc6ICc0Q0Q0JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDQnOiAnNENENScsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA1JzogJzRDRDYnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDEnOiAnNENCNScsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMic6ICc0Q0M1JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMSc6ICc0Q0M3JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMic6ICc0Q0M4JyxcclxuICAgICdWYXJpc0V4IEFzc2F1bHQgQ2Fubm9uJzogJzRDRTUnLFxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBSb3RhdGluZyc6ICc0Q0U5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIERvbid0IGhpdCB0aGUgc2hpZWxkcyFcclxuICAgICdWYXJpc0V4IFJlcGF5JzogJzRDREQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHRoZSBcInByb3RlYW5cIiBmb3J0aXVzLlxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBQcm90ZWFuJzogJzRDRTcnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVmFyaXNFeCBNYWdpdGVrIEJ1cnN0JzogJzRDREYnLFxyXG4gICAgJ1ZhcmlzRXggQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnNENFRCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1ZhcmlzRXggVGVybWludXMgRXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRDQjQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEYxNi80RjE3KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEYxOC80RjE5LCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RjFBLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IG1pc3NpbmcgYSB0b3dlcj9cclxuXHJcbi8vIE5vdGU6IERlbGliZXJhdGVseSBub3QgaW5jbHVkaW5nIHB5cmV0aWMgZGFtYWdlIGFzIGFuIGVycm9yLlxyXG4vLyBOb3RlOiBJdCBkb2Vzbid0IGFwcGVhciB0aGF0IHRoZXJlJ3MgYW55IHdheSB0byB0ZWxsIHdobyBmYWlsZWQgdGhlIGN1dHNjZW5lLlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MIFNvbGVtbiBDb25maXRlb3InOiAnNEYyQScsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBJbic6ICc0RjEwJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RjExJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNEInLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBJbic6ICc0RjRDJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgU2hpbmluZyBXYXZlJzogJzRGMjYnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTCBDYXV0ZXJpemUnOiAnNEYyNScsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAxJzogJzRGMUUnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBpbml0aWFsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAyJzogJzRGMUYnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgICAnV09MIEZsYXJlIEJyZWF0aCc6ICc0RjI0JyxcclxuICAgICdXT0wgRGVjaW1hdGlvbic6ICc0RjIzJyxcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTCBEZWVwIEZyZWV6ZSc6ICc0RTYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0wgVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhFJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCByZWFzb246IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBSYWRpYW50IEJyYXZlciBpcyA0RUY3LzRFRjgoeDIpLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IERlc3BlcmFkbyBpcyA0RUY5LzRFRkEsIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgTWV0ZW9yIGlzIDRFRkMsIGFuZCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBtb3JlIHRoYW4gMT9cclxuLy8gVE9ETzogQWJzb2x1dGUgSG9seSBzaG91bGQgYmUgc2hhcmVkP1xyXG4vLyBUT0RPOiBpbnRlcnNlY3RpbmcgYnJpbXN0b25lcz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTZWF0T2ZTYWNyaWZpY2VFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdXT0xFeCBTb2xlbW4gQ29uZml0ZW9yJzogJzRGMEMnLCAvLyBncm91bmQgcHVkZGxlc1xyXG4gICAgJ1dPTEV4IENvcnVzY2FudCBTYWJlciBJbic6ICc0RUYyJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0xFeCBDb3J1c2NhbnQgU2FiZXIgT3V0JzogJzRFRjEnLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0xFeCBJbWJ1ZWQgQ29ydXNhbmNlIE91dCc6ICc0RjQ5JywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MRXggSW1idWVkIENvcnVzYW5jZSBJbic6ICc0RjRBJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0xFeCBTaGluaW5nIFdhdmUnOiAnNEYwOCcsIC8vIHN3b3JkIHRyaWFuZ2xlXHJcbiAgICAnV09MRXggQ2F1dGVyaXplJzogJzRGMDcnLFxyXG4gICAgJ1dPTEV4IEJyaW1zdG9uZSBFYXJ0aCc6ICc0RjAwJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgZ3Jvd2luZ1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV09MRXggQWJzb2x1dGUgU3RvbmUgSUlJJzogJzRFRUInLCAvLyBwcm90ZWFuIHdhdmUgaW1idWVkIG1hZ2ljXHJcbiAgICAnV09MRXggRmxhcmUgQnJlYXRoJzogJzRGMDYnLCAvLyB0ZXRoZXIgZnJvbSBzdW1tb25lZCBiYWhhbXV0c1xyXG4gICAgJ1dPTEV4IFBlcmZlY3QgRGVjaW1hdGlvbic6ICc0RjA1JywgLy8gc21uL3dhciBwaGFzZSBtYXJrZXJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTEV4IERlZXAgRnJlZXplJzogJzRFNicsIC8vIGZhaWxpbmcgQWJzb2x1dGUgQmxpenphcmQgSUlJXHJcbiAgICAnV09MRXggRGFtYWdlIERvd24nOiAnMjc0JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBGbGFzaFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdXb2xFeCBLYXRvbiBTYW4gU2hhcmUnOiAnNEVGRScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRydWUgV2Fsa2luZyBEZWFkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhGRicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUb3dlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRGMDQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbWlzdGFrZToge1xyXG4gICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgIGVuOiAnTWlzc2VkIFRvd2VyJyxcclxuICAgICAgICAgIGRlOiAnVHVybSB2ZXJwYXNzdCcsXHJcbiAgICAgICAgICBmcjogJ1RvdXIgbWFucXXDqWUnLFxyXG4gICAgICAgICAgamE6ICfloZTjgpLouI/jgb7jgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgY246ICfmsqHouKnloZQnLFxyXG4gICAgICAgICAga286ICfsnqXtjJAg7Iuk7IiYJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIEhhbGxvd2VkIEdyb3VuZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRGNDQnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHJlYXNvbjogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGb3IgQmVyc2VyayBhbmQgRGVlcCBEYXJrc2lkZVxyXG4gICAgICBpZDogJ1dPTEV4IE1pc3NlZCBJbnRlcnJ1cHQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTE1NicsICc1MTU4J10gfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgcmVhc29uOiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBGSVggbHVtaW5vdXMgYWV0aGVyb3BsYXNtIHdhcm5pbmcgbm90IHdvcmtpbmdcclxuLy8gVE9ETzogRklYIGRvbGwgZGVhdGggbm90IHdvcmtpbmdcclxuLy8gVE9ETzogZmFpbGluZyBoYW5kIG9mIHBhaW4vcGFydGluZyAoY2hlY2sgZm9yIGhpZ2ggZGFtYWdlPylcclxuLy8gVE9ETzogbWFrZSBzdXJlIGV2ZXJ5Ym9keSB0YWtlcyBleGFjdGx5IG9uZSBwcm90ZWFuIChyYXRoZXIgdGhhbiB3YXRjaGluZyBkb3VibGUgaGl0cylcclxuLy8gVE9ETzogdGh1bmRlciBub3QgaGl0dGluZyBleGFjdGx5IDI/XHJcbi8vIFRPRE86IHBlcnNvbiB3aXRoIHdhdGVyL3RodW5kZXIgZGVidWZmIGR5aW5nXHJcbi8vIFRPRE86IGJhZCBuaXNpIHBhc3NcclxuLy8gVE9ETzogZmFpbGVkIGdhdmVsIG1lY2hhbmljXHJcbi8vIFRPRE86IGRvdWJsZSByb2NrZXQgcHVuY2ggbm90IGhpdHRpbmcgZXhhY3RseSAyPyAob3IgdGFua3MpXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHNsdWRnZSBwdWRkbGVzIGJlZm9yZSBoaWRkZW4gbWluZT9cclxuLy8gVE9ETzogaGlkZGVuIG1pbmUgZmFpbHVyZT9cclxuLy8gVE9ETzogZmFpbHVyZXMgb2Ygb3JkYWluZWQgbW90aW9uIC8gc3RpbGxuZXNzXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzZXZlcml0eSAodGV0aGVycylcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNvbGlkYXJpdHkgKHNoYXJlZCBzZW50ZW5jZSlcclxuLy8gVE9ETzogb3JkYWluZWQgY2FwaXRhbCBwdW5pc2htZW50IGhpdHRpbmcgbm9uLXRhbmtzXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRXBpY09mQWxleGFuZGVyVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RFQSBTbHVpY2UnOiAnNDlCMScsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAxJzogJzQ4MjQnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMic6ICc0OUI1JyxcclxuICAgICdURUEgU3BpbiBDcnVzaGVyJzogJzRBNzInLFxyXG4gICAgJ1RFQSBTYWNyYW1lbnQnOiAnNDg1RicsXHJcbiAgICAnVEVBIFJhZGlhbnQgU2FjcmFtZW50JzogJzQ4ODYnLFxyXG4gICAgJ1RFQSBBbG1pZ2h0eSBKdWRnbWVudCc6ICc0ODkwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdURUEgSGF3ayBCbGFzdGVyJzogJzQ4MzAnLFxyXG4gICAgJ1RFQSBDaGFrcmFtJzogJzQ4NTUnLFxyXG4gICAgJ1RFQSBFbnVtZXJhdGlvbic6ICc0ODUwJyxcclxuICAgICdURUEgQXBvY2FseXB0aWMgUmF5JzogJzQ4NEMnLFxyXG4gICAgJ1RFQSBQcm9wZWxsZXIgV2luZCc6ICc0ODMyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDEnOiAnNDlCNicsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMic6ICc0ODI1JyxcclxuICAgICdURUEgRmx1aWQgU3dpbmcnOiAnNDlCMCcsXHJcbiAgICAnVEVBIEZsdWlkIFN0cmlrZSc6ICc0OUI3JyxcclxuICAgICdURUEgSGlkZGVuIE1pbmUnOiAnNDg1MicsXHJcbiAgICAnVEVBIEFscGhhIFN3b3JkJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBGbGFyZXRocm93ZXInOiAnNDg2QicsXHJcbiAgICAnVEVBIENoYXN0ZW5pbmcgSGVhdCc6ICc0QTgwJyxcclxuICAgICdURUEgRGl2aW5lIFNwZWFyJzogJzRBODInLFxyXG4gICAgJ1RFQSBPcmRhaW5lZCBQdW5pc2htZW50JzogJzQ4OTEnLFxyXG4gICAgLy8gT3B0aWNhbCBTcHJlYWRcclxuICAgICdURUEgSW5kaXZpZHVhbCBSZXByb2JhdGlvbic6ICc0ODhDJyxcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAvLyBPcHRpY2FsIFN0YWNrXHJcbiAgICAnVEVBIENvbGxlY3RpdmUgUmVwcm9iYXRpb24nOiAnNDg4RCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBcInRvbyBtdWNoIGx1bWlub3VzIGFldGhlcm9wbGFzbVwiXHJcbiAgICAgIC8vIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgdGFyZ2V0IGV4cGxvZGVzLCBoaXR0aW5nIG5lYXJieSBwZW9wbGVcclxuICAgICAgLy8gYnV0IGFsc28gdGhlbXNlbHZlcy5cclxuICAgICAgaWQ6ICdURUEgRXhoYXVzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODFGJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2x1bWlub3VzIGFldGhlcm9wbGFzbScsXHJcbiAgICAgICAgICAgIGRlOiAnTHVtaW5pc3plbnRlcyDDhHRoZXJvcGxhc21hJyxcclxuICAgICAgICAgICAgZnI6ICfDiXRow6lyb3BsYXNtYSBsdW1pbmV1eCcsXHJcbiAgICAgICAgICAgIGphOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgICAgY246ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJvcHN5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEyMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGV0aGVyIFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnSmFnZCBEb2xsJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlciA9IGRhdGEuamFnZFRldGhlciB8fCB7fTtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFJlZHVjaWJsZSBDb21wbGV4aXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIHVuZGVmaW5lZCwgd2hpY2ggaXMgZmluZS5cclxuICAgICAgICAgIG5hbWU6IGRhdGEuamFnZFRldGhlciA/IGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdEb2xsIERlYXRoJyxcclxuICAgICAgICAgICAgZGU6ICdQdXBwZSBUb3QnLFxyXG4gICAgICAgICAgICBmcjogJ1BvdXDDqWUgbW9ydGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODieODvOODq+OBjOatu+OCk+OBoCcsXHJcbiAgICAgICAgICAgIGNuOiAn5rWu5aOr5b635q275LqhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIERyYWluYWdlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLnBhcnR5LmlzVGFuayhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA9IGRhdGEuaGFzVGhyb3R0bGUgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA9IGRhdGEuaGFzVGhyb3R0bGUgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGUpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBCYWxsb29uIFBvcHBpbmcuICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdURUEgT3V0YnVyc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IGZpbGUwIGZyb20gJy4vMDAtbWlzYy9idWZmcy5qcyc7XG5pbXBvcnQgZmlsZTEgZnJvbSAnLi8wMC1taXNjL2dlbmVyYWwuanMnO1xuaW1wb3J0IGZpbGUyIGZyb20gJy4vMDAtbWlzYy90ZXN0LmpzJztcbmltcG9ydCBmaWxlMyBmcm9tICcuLzAyLWFyci90cmlhbC9pZnJpdC1ubS5qcyc7XG5pbXBvcnQgZmlsZTQgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tbm0uanMnO1xuaW1wb3J0IGZpbGU1IGZyb20gJy4vMDItYXJyL3RyaWFsL2xldmktZXguanMnO1xuaW1wb3J0IGZpbGU2IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWhtLmpzJztcbmltcG9ydCBmaWxlNyBmcm9tICcuLzAyLWFyci90cmlhbC9zaGl2YS1leC5qcyc7XG5pbXBvcnQgZmlsZTggZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4taG0uanMnO1xuaW1wb3J0IGZpbGU5IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLWV4LmpzJztcbmltcG9ydCBmaWxlMTAgZnJvbSAnLi8wMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkuanMnO1xuaW1wb3J0IGZpbGUxMSBmcm9tICcuLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzJztcbmltcG9ydCBmaWxlMTIgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLmpzJztcbmltcG9ydCBmaWxlMTMgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC5qcyc7XG5pbXBvcnQgZmlsZTE0IGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMnO1xuaW1wb3J0IGZpbGUxNSBmcm9tICcuLzAzLWh3L3JhaWQvYTEybi5qcyc7XG5pbXBvcnQgZmlsZTE2IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28uanMnO1xuaW1wb3J0IGZpbGUxNyBmcm9tICcuLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMnO1xuaW1wb3J0IGZpbGUxOCBmcm9tICcuLzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS5qcyc7XG5pbXBvcnQgZmlsZTE5IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLmpzJztcbmltcG9ydCBmaWxlMjAgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMnO1xuaW1wb3J0IGZpbGUyMSBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LmpzJztcbmltcG9ydCBmaWxlMjIgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RoZV9idXJuLmpzJztcbmltcG9ydCBmaWxlMjMgZnJvbSAnLi8wNC1zYi9yYWlkL28xbi5qcyc7XG5pbXBvcnQgZmlsZTI0IGZyb20gJy4vMDQtc2IvcmFpZC9vMm4uanMnO1xuaW1wb3J0IGZpbGUyNSBmcm9tICcuLzA0LXNiL3JhaWQvbzNuLmpzJztcbmltcG9ydCBmaWxlMjYgZnJvbSAnLi8wNC1zYi9yYWlkL280bi5qcyc7XG5pbXBvcnQgZmlsZTI3IGZyb20gJy4vMDQtc2IvcmFpZC9vNHMuanMnO1xuaW1wb3J0IGZpbGUyOCBmcm9tICcuLzA0LXNiL3JhaWQvbzdzLmpzJztcbmltcG9ydCBmaWxlMjkgZnJvbSAnLi8wNC1zYi9yYWlkL28xMnMuanMnO1xuaW1wb3J0IGZpbGUzMCBmcm9tICcuLzA0LXNiL3RyaWFsL2J5YWtrby1leC5qcyc7XG5pbXBvcnQgZmlsZTMxIGZyb20gJy4vMDQtc2IvdHJpYWwvc2hpbnJ5dS5qcyc7XG5pbXBvcnQgZmlsZTMyIGZyb20gJy4vMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzJztcbmltcG9ydCBmaWxlMzMgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLmpzJztcbmltcG9ydCBmaWxlMzQgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLmpzJztcbmltcG9ydCBmaWxlMzUgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzJztcbmltcG9ydCBmaWxlMzYgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLmpzJztcbmltcG9ydCBmaWxlMzcgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2guanMnO1xuaW1wb3J0IGZpbGUzOCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMnO1xuaW1wb3J0IGZpbGUzOSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QuanMnO1xuaW1wb3J0IGZpbGU0MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIuanMnO1xuaW1wb3J0IGZpbGU0MSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyc7XG5pbXBvcnQgZmlsZTQyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LmpzJztcbmltcG9ydCBmaWxlNDMgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC5qcyc7XG5pbXBvcnQgZmlsZTQ0IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyc7XG5pbXBvcnQgZmlsZTQ1IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QuanMnO1xuaW1wb3J0IGZpbGU0NiBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL210X2d1bGcuanMnO1xuaW1wb3J0IGZpbGU0NyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzJztcbmltcG9ydCBmaWxlNDggZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwuanMnO1xuaW1wb3J0IGZpbGU0OSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MuanMnO1xuaW1wb3J0IGZpbGU1MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzJztcbmltcG9ydCBmaWxlNTEgZnJvbSAnLi8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUuanMnO1xuaW1wb3J0IGZpbGU1MiBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UuanMnO1xuaW1wb3J0IGZpbGU1MyBmcm9tICcuLzA1LXNoYi9yYWlkL2Uxbi5qcyc7XG5pbXBvcnQgZmlsZTU0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTFzLmpzJztcbmltcG9ydCBmaWxlNTUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMm4uanMnO1xuaW1wb3J0IGZpbGU1NiBmcm9tICcuLzA1LXNoYi9yYWlkL2Uycy5qcyc7XG5pbXBvcnQgZmlsZTU3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTNuLmpzJztcbmltcG9ydCBmaWxlNTggZnJvbSAnLi8wNS1zaGIvcmFpZC9lM3MuanMnO1xuaW1wb3J0IGZpbGU1OSBmcm9tICcuLzA1LXNoYi9yYWlkL2U0bi5qcyc7XG5pbXBvcnQgZmlsZTYwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTRzLmpzJztcbmltcG9ydCBmaWxlNjEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNW4uanMnO1xuaW1wb3J0IGZpbGU2MiBmcm9tICcuLzA1LXNoYi9yYWlkL2U1cy5qcyc7XG5pbXBvcnQgZmlsZTYzIGZyb20gJy4vMDUtc2hiL3JhaWQvZTZuLmpzJztcbmltcG9ydCBmaWxlNjQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNnMudHMnO1xuaW1wb3J0IGZpbGU2NSBmcm9tICcuLzA1LXNoYi9yYWlkL2U3bi5qcyc7XG5pbXBvcnQgZmlsZTY2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTdzLnRzJztcbmltcG9ydCBmaWxlNjcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOG4uanMnO1xuaW1wb3J0IGZpbGU2OCBmcm9tICcuLzA1LXNoYi9yYWlkL2U4cy5qcyc7XG5pbXBvcnQgZmlsZTY5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTluLmpzJztcbmltcG9ydCBmaWxlNzAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOXMuanMnO1xuaW1wb3J0IGZpbGU3MSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMG4uanMnO1xuaW1wb3J0IGZpbGU3MiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMHMuanMnO1xuaW1wb3J0IGZpbGU3MyBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMW4uanMnO1xuaW1wb3J0IGZpbGU3NCBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMXMuanMnO1xuaW1wb3J0IGZpbGU3NSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMm4uanMnO1xuaW1wb3J0IGZpbGU3NiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMnMuanMnO1xuaW1wb3J0IGZpbGU3NyBmcm9tICcuLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyc7XG5pbXBvcnQgZmlsZTc4IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLmpzJztcbmltcG9ydCBmaWxlNzkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXguanMnO1xuaW1wb3J0IGZpbGU4MCBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyc7XG5pbXBvcnQgZmlsZTgxIGZyb20gJy4vMDUtc2hiL3RyaWFsL2hhZGVzLWV4LmpzJztcbmltcG9ydCBmaWxlODIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMuanMnO1xuaW1wb3J0IGZpbGU4MyBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMnO1xuaW1wb3J0IGZpbGU4NCBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UuanMnO1xuaW1wb3J0IGZpbGU4NSBmcm9tICcuLzA1LXNoYi90cmlhbC9sZXZpLXVuLmpzJztcbmltcG9ydCBmaWxlODYgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMnO1xuaW1wb3J0IGZpbGU4NyBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi5qcyc7XG5pbXBvcnQgZmlsZTg4IGZyb20gJy4vMDUtc2hiL3RyaWFsL3NoaXZhLXVuLmpzJztcbmltcG9ydCBmaWxlODkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyc7XG5pbXBvcnQgZmlsZTkwIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXguanMnO1xuaW1wb3J0IGZpbGU5MSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbi11bi5qcyc7XG5pbXBvcnQgZmlsZTkyIGZyb20gJy4vMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzJztcbmltcG9ydCBmaWxlOTMgZnJvbSAnLi8wNS1zaGIvdHJpYWwvd29sLmpzJztcbmltcG9ydCBmaWxlOTQgZnJvbSAnLi8wNS1zaGIvdHJpYWwvd29sLWV4LmpzJztcbmltcG9ydCBmaWxlOTUgZnJvbSAnLi8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgeycwMC1taXNjL2J1ZmZzLmpzJzogZmlsZTAsJzAwLW1pc2MvZ2VuZXJhbC5qcyc6IGZpbGUxLCcwMC1taXNjL3Rlc3QuanMnOiBmaWxlMiwnMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzJzogZmlsZTMsJzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyc6IGZpbGU0LCcwMi1hcnIvdHJpYWwvbGV2aS1leC5qcyc6IGZpbGU1LCcwMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMnOiBmaWxlNiwnMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzJzogZmlsZTcsJzAyLWFyci90cmlhbC90aXRhbi1obS5qcyc6IGZpbGU4LCcwMi1hcnIvdHJpYWwvdGl0YW4tZXguanMnOiBmaWxlOSwnMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzJzogZmlsZTEwLCcwMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS5qcyc6IGZpbGUxMSwnMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS5qcyc6IGZpbGUxMiwnMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMnOiBmaWxlMTMsJzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLmpzJzogZmlsZTE0LCcwMy1ody9yYWlkL2ExMm4uanMnOiBmaWxlMTUsJzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzJzogZmlsZTE2LCcwNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLmpzJzogZmlsZTE3LCcwNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUuanMnOiBmaWxlMTgsJzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyc6IGZpbGUxOSwnMDQtc2IvZHVuZ2Vvbi9zd2FsbG93c19jb21wYXNzLmpzJzogZmlsZTIwLCcwNC1zYi9kdW5nZW9uL3RlbXBsZV9vZl90aGVfZmlzdC5qcyc6IGZpbGUyMSwnMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyc6IGZpbGUyMiwnMDQtc2IvcmFpZC9vMW4uanMnOiBmaWxlMjMsJzA0LXNiL3JhaWQvbzJuLmpzJzogZmlsZTI0LCcwNC1zYi9yYWlkL28zbi5qcyc6IGZpbGUyNSwnMDQtc2IvcmFpZC9vNG4uanMnOiBmaWxlMjYsJzA0LXNiL3JhaWQvbzRzLmpzJzogZmlsZTI3LCcwNC1zYi9yYWlkL283cy5qcyc6IGZpbGUyOCwnMDQtc2IvcmFpZC9vMTJzLmpzJzogZmlsZTI5LCcwNC1zYi90cmlhbC9ieWFra28tZXguanMnOiBmaWxlMzAsJzA0LXNiL3RyaWFsL3NoaW5yeXUuanMnOiBmaWxlMzEsJzA0LXNiL3RyaWFsL3N1c2Fuby1leC5qcyc6IGZpbGUzMiwnMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS5qcyc6IGZpbGUzMywnMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyc6IGZpbGUzNCwnMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS5qcyc6IGZpbGUzNSwnMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci5qcyc6IGZpbGUzNiwnMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzJzogZmlsZTM3LCcwNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLmpzJzogZmlsZTM4LCcwNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LmpzJzogZmlsZTM5LCcwNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzJzogZmlsZTQwLCcwNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcuanMnOiBmaWxlNDEsJzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC5qcyc6IGZpbGU0MiwnMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMnOiBmaWxlNDMsJzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwuanMnOiBmaWxlNDQsJzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LmpzJzogZmlsZTQ1LCcwNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzJzogZmlsZTQ2LCcwNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi5qcyc6IGZpbGU0NywnMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLmpzJzogZmlsZTQ4LCcwNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzJzogZmlsZTQ5LCcwNS1zaGIvZHVuZ2Vvbi90d2lubmluZy5qcyc6IGZpbGU1MCwnMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLmpzJzogZmlsZTUxLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzJzogZmlsZTUyLCcwNS1zaGIvcmFpZC9lMW4uanMnOiBmaWxlNTMsJzA1LXNoYi9yYWlkL2Uxcy5qcyc6IGZpbGU1NCwnMDUtc2hiL3JhaWQvZTJuLmpzJzogZmlsZTU1LCcwNS1zaGIvcmFpZC9lMnMuanMnOiBmaWxlNTYsJzA1LXNoYi9yYWlkL2Uzbi5qcyc6IGZpbGU1NywnMDUtc2hiL3JhaWQvZTNzLmpzJzogZmlsZTU4LCcwNS1zaGIvcmFpZC9lNG4uanMnOiBmaWxlNTksJzA1LXNoYi9yYWlkL2U0cy5qcyc6IGZpbGU2MCwnMDUtc2hiL3JhaWQvZTVuLmpzJzogZmlsZTYxLCcwNS1zaGIvcmFpZC9lNXMuanMnOiBmaWxlNjIsJzA1LXNoYi9yYWlkL2U2bi5qcyc6IGZpbGU2MywnMDUtc2hiL3JhaWQvZTZzLnRzJzogZmlsZTY0LCcwNS1zaGIvcmFpZC9lN24uanMnOiBmaWxlNjUsJzA1LXNoYi9yYWlkL2U3cy50cyc6IGZpbGU2NiwnMDUtc2hiL3JhaWQvZThuLmpzJzogZmlsZTY3LCcwNS1zaGIvcmFpZC9lOHMuanMnOiBmaWxlNjgsJzA1LXNoYi9yYWlkL2U5bi5qcyc6IGZpbGU2OSwnMDUtc2hiL3JhaWQvZTlzLmpzJzogZmlsZTcwLCcwNS1zaGIvcmFpZC9lMTBuLmpzJzogZmlsZTcxLCcwNS1zaGIvcmFpZC9lMTBzLmpzJzogZmlsZTcyLCcwNS1zaGIvcmFpZC9lMTFuLmpzJzogZmlsZTczLCcwNS1zaGIvcmFpZC9lMTFzLmpzJzogZmlsZTc0LCcwNS1zaGIvcmFpZC9lMTJuLmpzJzogZmlsZTc1LCcwNS1zaGIvcmFpZC9lMTJzLmpzJzogZmlsZTc2LCcwNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXguanMnOiBmaWxlNzcsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi5qcyc6IGZpbGU3OCwnMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzJzogZmlsZTc5LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24uanMnOiBmaWxlODAsJzA1LXNoYi90cmlhbC9oYWRlcy1leC5qcyc6IGZpbGU4MSwnMDUtc2hiL3RyaWFsL2hhZGVzLmpzJzogZmlsZTgyLCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LmpzJzogZmlsZTgzLCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLmpzJzogZmlsZTg0LCcwNS1zaGIvdHJpYWwvbGV2aS11bi5qcyc6IGZpbGU4NSwnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LmpzJzogZmlsZTg2LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24uanMnOiBmaWxlODcsJzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyc6IGZpbGU4OCwnMDUtc2hiL3RyaWFsL3RpdGFuaWEuanMnOiBmaWxlODksJzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LmpzJzogZmlsZTkwLCcwNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMnOiBmaWxlOTEsJzA1LXNoYi90cmlhbC92YXJpcy1leC5qcyc6IGZpbGU5MiwnMDUtc2hiL3RyaWFsL3dvbC5qcyc6IGZpbGU5MywnMDUtc2hiL3RyaWFsL3dvbC1leC5qcyc6IGZpbGU5NCwnMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci5qcyc6IGZpbGU5NSx9OyJdLCJzb3VyY2VSb290IjoiIn0=