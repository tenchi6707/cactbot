(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 1112:
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
        text: {
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
        text: {
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
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/ifrit-nm.ts

// Ifrit Story Mode
const triggerSet = {
    zoneId: zone_id/* default.TheBowlOfEmbers */.Z.TheBowlOfEmbers,
    damageWarn: {
        'IfritNm Radiant Plume': '2DE',
    },
    shareWarn: {
        'IfritNm Incinerate': '1C5',
        'IfritNm Eruption': '2DD',
    },
};
/* harmony default export */ const ifrit_nm = (triggerSet);

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
        text: `${arr[0].ability} x ${arr.length}`
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
        text: `${matches.source}: ${matches.ability}`
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
        text: `${matches.source}: ${matches.ability}`
      };
    }
  }]
});
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

































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.js': buffs,'00-misc/general.js': general,'00-misc/test.js': test,'02-arr/trial/ifrit-nm.ts': ifrit_nm,'02-arr/trial/titan-nm.ts': titan_nm,'02-arr/trial/levi-ex.js': levi_ex,'02-arr/trial/shiva-hm.js': shiva_hm,'02-arr/trial/shiva-ex.js': shiva_ex,'02-arr/trial/titan-hm.ts': titan_hm,'02-arr/trial/titan-ex.ts': titan_ex,'03-hw/alliance/weeping_city.js': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.js': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.ts': fractal_continuum,'03-hw/dungeon/gubal_library_hard.js': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.js': sohm_al_hard,'03-hw/raid/a12n.js': a12n,'04-sb/dungeon/ala_mhigo.js': ala_mhigo,'04-sb/dungeon/bardams_mettle.js': bardams_mettle,'04-sb/dungeon/kugane_castle.js': kugane_castle,'04-sb/dungeon/st_mocianne_hard.ts': st_mocianne_hard,'04-sb/dungeon/swallows_compass.js': swallows_compass,'04-sb/dungeon/temple_of_the_fist.ts': temple_of_the_fist,'04-sb/dungeon/the_burn.ts': the_burn,'04-sb/raid/o1n.ts': o1n,'04-sb/raid/o2n.js': o2n,'04-sb/raid/o3n.js': o3n,'04-sb/raid/o4n.js': o4n,'04-sb/raid/o4s.js': o4s,'04-sb/raid/o7s.js': o7s,'04-sb/raid/o12s.js': o12s,'04-sb/trial/byakko-ex.js': byakko_ex,'04-sb/trial/shinryu.js': shinryu,'04-sb/trial/susano-ex.ts': susano_ex,'04-sb/ultimate/ultima_weapon_ultimate.js': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.js': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.ts': the_copied_factory,'05-shb/alliance/the_puppets_bunker.ts': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.js': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.ts': akadaemia_anyder,'05-shb/dungeon/amaurot.ts': amaurot,'05-shb/dungeon/anamnesis_anyder.ts': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.js': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.js': heroes_gauntlet,'05-shb/dungeon/holminster_switch.ts': holminster_switch,'05-shb/dungeon/malikahs_well.ts': malikahs_well,'05-shb/dungeon/matoyas_relict.ts': matoyas_relict,'05-shb/dungeon/mt_gulg.ts': mt_gulg,'05-shb/dungeon/paglthan.ts': paglthan,'05-shb/dungeon/qitana_ravel.ts': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.ts': the_grand_cosmos,'05-shb/dungeon/twinning.ts': twinning,'05-shb/eureka/delubrum_reginae.js': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.js': delubrum_reginae_savage,'05-shb/raid/e1n.ts': e1n,'05-shb/raid/e1s.ts': e1s,'05-shb/raid/e2n.js': e2n,'05-shb/raid/e2s.js': e2s,'05-shb/raid/e3n.ts': e3n,'05-shb/raid/e3s.ts': e3s,'05-shb/raid/e4n.ts': e4n,'05-shb/raid/e4s.js': e4s,'05-shb/raid/e5n.js': e5n,'05-shb/raid/e5s.js': e5s,'05-shb/raid/e6n.ts': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.js': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.js': e8n,'05-shb/raid/e8s.js': e8s,'05-shb/raid/e9n.ts': e9n,'05-shb/raid/e9s.js': e9s,'05-shb/raid/e10n.ts': e10n,'05-shb/raid/e10s.js': e10s,'05-shb/raid/e11n.js': e11n,'05-shb/raid/e11s.js': e11s,'05-shb/raid/e12n.ts': e12n,'05-shb/raid/e12s.js': e12s,'05-shb/trial/diamond_weapon-ex.js': diamond_weapon_ex,'05-shb/trial/diamond_weapon.js': diamond_weapon,'05-shb/trial/emerald_weapon-ex.ts': emerald_weapon_ex,'05-shb/trial/emerald_weapon.js': emerald_weapon,'05-shb/trial/hades-ex.js': hades_ex,'05-shb/trial/hades.ts': hades,'05-shb/trial/innocence-ex.ts': innocence_ex,'05-shb/trial/innocence.ts': innocence,'05-shb/trial/levi-un.js': levi_un,'05-shb/trial/ruby_weapon-ex.js': ruby_weapon_ex,'05-shb/trial/ruby_weapon.ts': ruby_weapon,'05-shb/trial/shiva-un.js': shiva_un,'05-shb/trial/titania.ts': titania,'05-shb/trial/titania-ex.ts': titania_ex,'05-shb/trial/titan-un.ts': titan_un,'05-shb/trial/varis-ex.js': varis_ex,'05-shb/trial/wol.js': wol,'05-shb/trial/wol-ex.js': wol_ex,'05-shb/ultimate/the_epic_of_alexander.js': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2gudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6WyJhYmlsaXR5Q29sbGVjdFNlY29uZHMiLCJlZmZlY3RDb2xsZWN0U2Vjb25kcyIsImlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMiLCJkYXRhIiwibWF0Y2hlcyIsInNvdXJjZUlkIiwidG9VcHBlckNhc2UiLCJwYXJ0eSIsInBhcnR5SWRzIiwiaW5jbHVkZXMiLCJwZXRJZFRvT3duZXJJZCIsIm93bmVySWQiLCJtaXNzZWRGdW5jIiwiYXJncyIsImlkIiwidHJpZ2dlcklkIiwibmV0UmVnZXgiLCJjb25kaXRpb24iLCJydW4iLCJnZW5lcmFsQnVmZkNvbGxlY3Rpb24iLCJwdXNoIiwiZGVsYXlTZWNvbmRzIiwiY29sbGVjdFNlY29uZHMiLCJzdXBwcmVzc1NlY29uZHMiLCJtaXN0YWtlIiwiX21hdGNoZXMiLCJhbGxNYXRjaGVzIiwicGFydHlOYW1lcyIsImdvdEJ1ZmZNYXAiLCJuYW1lIiwiZmlyc3RNYXRjaCIsInNvdXJjZU5hbWUiLCJzb3VyY2UiLCJwZXRJZCIsIm93bmVyTmFtZSIsIm5hbWVGcm9tSWQiLCJjb25zb2xlIiwiZXJyb3IiLCJpZ25vcmVTZWxmIiwidGhpbmdOYW1lIiwiZmllbGQiLCJ0YXJnZXQiLCJtaXNzZWQiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwieCIsImxlbmd0aCIsInR5cGUiLCJibGFtZSIsInRleHQiLCJlbiIsIm1hcCIsIlNob3J0TmFtZSIsImpvaW4iLCJkZSIsImZyIiwiamEiLCJjbiIsImtvIiwibWlzc2VkTWl0aWdhdGlvbkJ1ZmYiLCJlZmZlY3RJZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJOZXRSZWdleGVzIiwibWlzc2VkRGFtYWdlQWJpbGl0eSIsImFiaWxpdHlJZCIsIm1pc3NlZEhlYWwiLCJtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSIsInpvbmVJZCIsIlpvbmVJZCIsInRyaWdnZXJzIiwiX2RhdGEiLCJsb3N0Rm9vZCIsImluQ29tYmF0IiwiSXNQbGF5ZXJJZCIsImxpbmUiLCJuZXRSZWdleEZyIiwibmV0UmVnZXhKYSIsIm5ldFJlZ2V4Q24iLCJuZXRSZWdleEtvIiwibWUiLCJzdHJpa2luZ0R1bW15QnlMb2NhbGUiLCJzdHJpa2luZ0R1bW15TmFtZXMiLCJ2YWx1ZXMiLCJib290Q291bnQiLCJhYmlsaXR5IiwiRGFtYWdlRnJvbU1hdGNoZXMiLCJlZmZlY3QiLCJwb2tlQ291bnQiLCJkYW1hZ2VXYXJuIiwiZGFtYWdlRmFpbCIsImdhaW5zRWZmZWN0V2FybiIsImdhaW5zRWZmZWN0RmFpbCIsImRlYXRoUmVhc29uIiwicmVhc29uIiwic2hhcmVXYXJuIiwic2hhcmVGYWlsIiwic2VlbkRpYW1vbmREdXN0Iiwic29sb1dhcm4iLCJwYXJzZUZsb2F0IiwiZHVyYXRpb24iLCJ6b21iaWUiLCJzaGllbGQiLCJoYXNJbXAiLCJwbGF5ZXJEYW1hZ2VGaWVsZHMiLCJhc3NhdWx0IiwiYWJpbGl0eVdhcm4iLCJmbGFncyIsInN1YnN0ciIsImNhcHR1cmUiLCJuZXRSZWdleERlIiwicGhhc2VOdW1iZXIiLCJpbml0aWFsaXplZCIsImdhbWVDb3VudCIsInRhcmdldElkIiwiaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQiLCJpc05lb0V4ZGVhdGgiLCJhYmlsaXR5TmFtZSIsImhhc0JleW9uZERlYXRoIiwiZG91YmxlQXR0YWNrTWF0Y2hlcyIsImFyciIsInZ1bG4iLCJrRmxhZ0luc3RhbnREZWF0aCIsImhhc0Rvb20iLCJzbGljZSIsImZhdWx0TGluZVRhcmdldCIsImhhc09yYiIsImNsb3VkTWFya2VycyIsIm0iLCJub09yYiIsInN0ciIsImhhdGVkIiwid3JvbmdCdWZmIiwibm9CdWZmIiwiaGFzQXN0cmFsIiwiaGFzVW1icmFsIiwic29sb0ZhaWwiLCJmaXJzdEhlYWRtYXJrZXIiLCJwYXJzZUludCIsImdldEhlYWRtYXJrZXJJZCIsImRlY09mZnNldCIsInRvU3RyaW5nIiwicGFkU3RhcnQiLCJmaXJzdExhc2VyTWFya2VyIiwibGFzdExhc2VyTWFya2VyIiwibGFzZXJOYW1lVG9OdW0iLCJzY3VscHR1cmVZUG9zaXRpb25zIiwieSIsInNjdWxwdHVyZVRldGhlck5hbWVUb0lkIiwiYmxhZGVPZkZsYW1lQ291bnQiLCJudW1iZXIiLCJuYW1lcyIsIndpdGhOdW0iLCJvd25lcnMiLCJtaW5pbXVtWWFsbXNGb3JTdGF0dWVzIiwiaXNTdGF0dWVQb3NpdGlvbktub3duIiwiaXNTdGF0dWVOb3J0aCIsInNjdWxwdHVyZUlkcyIsIm90aGVySWQiLCJzb3VyY2VZIiwib3RoZXJZIiwieURpZmYiLCJNYXRoIiwiYWJzIiwib3duZXIiLCJvd25lck5pY2siLCJwaWxsYXJJZFRvT3duZXIiLCJwaWxsYXJPd25lciIsImZpcmUiLCJzbWFsbExpb25JZFRvT3duZXIiLCJzbWFsbExpb25Pd25lcnMiLCJoYXNTbWFsbExpb24iLCJoYXNGaXJlRGVidWZmIiwiY2VudGVyWSIsImRpck9iaiIsIk91dHB1dHMiLCJub3J0aEJpZ0xpb24iLCJzaW5nbGVUYXJnZXQiLCJvdXRwdXQiLCJzb3V0aEJpZ0xpb24iLCJzaGFyZWQiLCJmaXJlRGVidWZmIiwibGFiZWxzIiwicGFyc2VyTGFuZyIsImhhc0RhcmsiLCJqYWdkVGV0aGVyIiwidW5kZWZpbmVkIiwiaXNUYW5rIiwiaGFzVGhyb3R0bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Q0FHQTs7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QU0sbUNBQW1DLFlBQU0sdUNBQXVDLGdCQUFNLCtCQUErQixRQUFNLHNDQUFzQyxnQkFBTSw2Q0FBNkMsdUJBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sdUJBQXVCLEdBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sd0JBQXdCLElBQU0sc0NBQXNDLGlCQUFNLG1DQUFtQyxjQUFNLHNDQUFzQyxpQkFBTSxtQ0FBbUMsY0FBTSw2QkFBNkIsUUFBTSwwQkFBMEIsS0FBTSxpQ0FBaUMsWUFBTSw4QkFBOEIsU0FBTSw0QkFBNEIsT0FBTSxtQ0FBbUMsY0FBTSxnQ0FBZ0MsV0FBTSw2QkFBNkIsUUFBTSw0QkFBNEIsT0FBTSwrQkFBK0IsVUFBTSw2QkFBNkIsUUFBTSw2QkFBNkIsUUFBTSx3QkFBd0IsR0FBTSwyQkFBMkIsTUFBTSw2Q0FBNkMscUJBQU0sRUFBRSxFIiwiZmlsZSI6InVpL2NvbW1vbi9vb3BzeXJhaWRzeV9kYXRhLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBBYmlsaXRpZXMgc2VlbSBpbnN0YW50LlxyXG5jb25zdCBhYmlsaXR5Q29sbGVjdFNlY29uZHMgPSAwLjU7XHJcbi8vIE9ic2VydmF0aW9uOiB1cCB0byB+MS4yIHNlY29uZHMgZm9yIGEgYnVmZiB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG5jb25zdCBlZmZlY3RDb2xsZWN0U2Vjb25kcyA9IDIuMDtcclxuXHJcbmNvbnN0IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMgPSAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gIGNvbnN0IHNvdXJjZUlkID0gbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gIGlmIChkYXRhLnBhcnR5LnBhcnR5SWRzLmluY2x1ZGVzKHNvdXJjZUlkKSlcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICBpZiAoZGF0YS5wZXRJZFRvT3duZXJJZCkge1xyXG4gICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbc291cmNlSWRdO1xyXG4gICAgaWYgKG93bmVySWQgJiYgZGF0YS5wYXJ0eS5wYXJ0eUlkcy5pbmNsdWRlcyhvd25lcklkKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vLyBhcmdzOiB0cmlnZ2VySWQsIG5ldFJlZ2V4LCBmaWVsZCwgdHlwZSwgaWdub3JlU2VsZlxyXG5jb25zdCBtaXNzZWRGdW5jID0gKGFyZ3MpID0+IFtcclxuICB7XHJcbiAgICAvLyBTdXJlLCBub3QgYWxsIG9mIHRoZXNlIGFyZSBcImJ1ZmZzXCIgcGVyIHNlLCBidXQgdGhleSdyZSBhbGwgaW4gdGhlIGJ1ZmZzIGZpbGUuXHJcbiAgICBpZDogYEJ1ZmYgJHthcmdzLnRyaWdnZXJJZH0gQ29sbGVjdGAsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogaXNJblBhcnR5Q29uZGl0aW9uRnVuYyxcclxuICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24gPSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbiB8fCB7fTtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdIHx8IFtdO1xyXG4gICAgICBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvblthcmdzLnRyaWdnZXJJZF0ucHVzaChtYXRjaGVzKTtcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogYEJ1ZmYgJHthcmdzLnRyaWdnZXJJZH1gLFxyXG4gICAgbmV0UmVnZXg6IGFyZ3MubmV0UmVnZXgsXHJcbiAgICBjb25kaXRpb246IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMsXHJcbiAgICBkZWxheVNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMsXHJcbiAgICBzdXBwcmVzc1NlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMsXHJcbiAgICBtaXN0YWtlOiAoZGF0YSwgX21hdGNoZXMpID0+IHtcclxuICAgICAgaWYgKCFkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbilcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNvbnN0IGFsbE1hdGNoZXMgPSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvblthcmdzLnRyaWdnZXJJZF07XHJcbiAgICAgIGlmICghYWxsTWF0Y2hlcylcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBwYXJ0eU5hbWVzID0gZGF0YS5wYXJ0eS5wYXJ0eU5hbWVzO1xyXG5cclxuICAgICAgLy8gVE9ETzogY29uc2lkZXIgZGVhZCBwZW9wbGUgc29tZWhvd1xyXG4gICAgICBjb25zdCBnb3RCdWZmTWFwID0ge307XHJcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBwYXJ0eU5hbWVzKVxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbmFtZV0gPSBmYWxzZTtcclxuXHJcbiAgICAgIGNvbnN0IGZpcnN0TWF0Y2ggPSBhbGxNYXRjaGVzWzBdO1xyXG4gICAgICBsZXQgc291cmNlTmFtZSA9IGZpcnN0TWF0Y2guc291cmNlO1xyXG4gICAgICAvLyBCbGFtZSBwZXQgbWlzdGFrZXMgb24gb3duZXJzLlxyXG4gICAgICBpZiAoZGF0YS5wZXRJZFRvT3duZXJJZCkge1xyXG4gICAgICAgIGNvbnN0IHBldElkID0gZmlyc3RNYXRjaC5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBkYXRhLnBldElkVG9Pd25lcklkW3BldElkXTtcclxuICAgICAgICBpZiAob3duZXJJZCkge1xyXG4gICAgICAgICAgY29uc3Qgb3duZXJOYW1lID0gZGF0YS5wYXJ0eS5uYW1lRnJvbUlkKG93bmVySWQpO1xyXG4gICAgICAgICAgaWYgKG93bmVyTmFtZSlcclxuICAgICAgICAgICAgc291cmNlTmFtZSA9IG93bmVyTmFtZTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ291bGRuJ3QgZmluZCBuYW1lIGZvciAke293bmVySWR9IGZyb20gcGV0ICR7cGV0SWR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYXJncy5pZ25vcmVTZWxmKVxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbc291cmNlTmFtZV0gPSB0cnVlO1xyXG5cclxuICAgICAgY29uc3QgdGhpbmdOYW1lID0gZmlyc3RNYXRjaFthcmdzLmZpZWxkXTtcclxuICAgICAgZm9yIChjb25zdCBtYXRjaGVzIG9mIGFsbE1hdGNoZXMpIHtcclxuICAgICAgICAvLyBJbiBjYXNlIHlvdSBoYXZlIG11bHRpcGxlIHBhcnR5IG1lbWJlcnMgd2hvIGhpdCB0aGUgc2FtZSBjb29sZG93biBhdCB0aGUgc2FtZVxyXG4gICAgICAgIC8vIHRpbWUgKGxvbD8pLCB0aGVuIGlnbm9yZSBhbnlib2R5IHdobyB3YXNuJ3QgdGhlIGZpcnN0LlxyXG4gICAgICAgIGlmIChtYXRjaGVzLnNvdXJjZSAhPT0gZmlyc3RNYXRjaC5zb3VyY2UpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgZ290QnVmZk1hcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtaXNzZWQgPSBPYmplY3Qua2V5cyhnb3RCdWZmTWFwKS5maWx0ZXIoKHgpID0+ICFnb3RCdWZmTWFwW3hdKTtcclxuICAgICAgaWYgKG1pc3NlZC5sZW5ndGggPT09IDApXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gVE9ETzogb29wc3kgY291bGQgcmVhbGx5IHVzZSBtb3VzZW92ZXIgcG9wdXBzIGZvciBkZXRhaWxzLlxyXG4gICAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5LCBpZiB3ZSBoYXZlIGEgZGVhdGggcmVwb3J0LCBpdCdkIGJlIGdvb2QgdG9cclxuICAgICAgLy8gZXhwbGljaXRseSBjYWxsIG91dCB0aGF0IG90aGVyIHBlb3BsZSBnb3QgYSBoZWFsIHRoaXMgcGVyc29uIGRpZG4ndC5cclxuICAgICAgaWYgKG1pc3NlZC5sZW5ndGggPCA0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6IGFyZ3MudHlwZSxcclxuICAgICAgICAgIGJsYW1lOiBzb3VyY2VOYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogdGhpbmdOYW1lICsgJyBtaXNzZWQgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpLFxyXG4gICAgICAgICAgICBkZTogdGhpbmdOYW1lICsgJyB2ZXJmZWhsdCAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyksXHJcbiAgICAgICAgICAgIGZyOiB0aGluZ05hbWUgKyAnIG1hbnF1w6koZSkgc3VyICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSxcclxuICAgICAgICAgICAgamE6ICcoJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJykg44GMJyArIHRoaW5nTmFtZSArICfjgpLlj5fjgZHjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJykgKyAnIOayoeWPl+WIsCAnICsgdGhpbmdOYW1lLFxyXG4gICAgICAgICAgICBrbzogdGhpbmdOYW1lICsgJyAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJykgKyAn7JeQ6rKMIOyggeyaqeyViOuQqCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgLy8gSWYgdGhlcmUncyB0b28gbWFueSBwZW9wbGUsIGp1c3QgbGlzdCB0aGUgbnVtYmVyIG9mIHBlb3BsZSBtaXNzZWQuXHJcbiAgICAgIC8vIFRPRE86IHdlIGNvdWxkIGFsc28gbGlzdCBldmVyeWJvZHkgb24gc2VwYXJhdGUgbGluZXM/XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdHlwZTogYXJncy50eXBlLFxyXG4gICAgICAgIGJsYW1lOiBzb3VyY2VOYW1lLFxyXG4gICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgIGVuOiB0aGluZ05hbWUgKyAnIG1pc3NlZCAnICsgbWlzc2VkLmxlbmd0aCArICcgcGVvcGxlJyxcclxuICAgICAgICAgIGRlOiB0aGluZ05hbWUgKyAnIHZlcmZlaGx0ZSAnICsgbWlzc2VkLmxlbmd0aCArICcgUGVyc29uZW4nLFxyXG4gICAgICAgICAgZnI6IHRoaW5nTmFtZSArICcgbWFucXXDqShlKSBzdXIgJyArIG1pc3NlZC5sZW5ndGggKyAnIHBlcnNvbm5lcycsXHJcbiAgICAgICAgICBqYTogbWlzc2VkLmxlbmd0aCArICfkurrjgYwnICsgdGhpbmdOYW1lICsgJ+OCkuWPl+OBkeOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+aciScgKyBtaXNzZWQubGVuZ3RoICsgJ+S6uuayoeWPl+WIsCAnICsgdGhpbmdOYW1lLFxyXG4gICAgICAgICAga286IHRoaW5nTmFtZSArICcgJyArIG1pc3NlZC5sZW5ndGggKyAn66qF7JeQ6rKMIOyggeyaqeyViOuQqCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgIGlmIChkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbilcclxuICAgICAgICBkZWxldGUgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdO1xyXG4gICAgfSxcclxuICB9LFxyXG5dO1xyXG5cclxuY29uc3QgbWlzc2VkTWl0aWdhdGlvbkJ1ZmYgPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5lZmZlY3RJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgZWZmZWN0SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogYXJncy5lZmZlY3RJZCB9KSxcclxuICAgIGZpZWxkOiAnZWZmZWN0JyxcclxuICAgIHR5cGU6ICdoZWFsJyxcclxuICAgIGlnbm9yZVNlbGY6IGFyZ3MuaWdub3JlU2VsZixcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGVmZmVjdENvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkRGFtYWdlQWJpbGl0eSA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eUlkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICBmaWVsZDogJ2FiaWxpdHknLFxyXG4gICAgdHlwZTogJ2RhbWFnZScsXHJcbiAgICBpZ25vcmVTZWxmOiBhcmdzLmlnbm9yZVNlbGYsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBhYmlsaXR5Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRIZWFsID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGZpZWxkOiAnYWJpbGl0eScsXHJcbiAgICB0eXBlOiAnaGVhbCcsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBhYmlsaXR5Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSA9IG1pc3NlZEhlYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0Y2hBbGwsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBNYXBwZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hZGRlZENvbWJhdGFudEZ1bGwoKSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChtYXRjaGVzLm93bmVySWQgPT09ICcwJylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZGF0YS5wZXRJZFRvT3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWQgfHwge307XHJcbiAgICAgICAgLy8gRml4IGFueSBsb3dlcmNhc2UgaWRzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWRbbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpXSA9IG1hdGNoZXMub3duZXJJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBDbGVhcmVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuY2hhbmdlWm9uZSgpLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gQ2xlYXIgdGhpcyBoYXNoIHBlcmlvZGljYWxseSBzbyBpdCBkb2Vzbid0IGhhdmUgZmFsc2UgcG9zaXRpdmVzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWQgPSB7fTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUHJlZmVyIGFiaWxpdGllcyB0byBlZmZlY3RzLCBhcyBlZmZlY3RzIHRha2UgbG9uZ2VyIHRvIHJvbGwgdGhyb3VnaCB0aGUgcGFydHkuXHJcbiAgICAvLyBIb3dldmVyLCBzb21lIHRoaW5ncyBhcmUgb25seSBlZmZlY3RzIGFuZCBzbyB0aGVyZSBpcyBubyBjaG9pY2UuXHJcblxyXG4gICAgLy8gRm9yIHRoaW5ncyB5b3UgY2FuIHN0ZXAgaW4gb3Igb3V0IG9mLCBnaXZlIGEgbG9uZ2VyIHRpbWVyPyAgVGhpcyBpc24ndCBwZXJmZWN0LlxyXG4gICAgLy8gVE9ETzogaW5jbHVkZSBzb2lsIGhlcmU/P1xyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0NvbGxlY3RpdmUgVW5jb25zY2lvdXMnLCBlZmZlY3RJZDogJzM1MScsIGNvbGxlY3RTZWNvbmRzOiAxMCB9KSxcclxuICAgIC8vIEFybXMgVXAgPSA0OTggKG90aGVycyksIFBhc3NhZ2UgT2YgQXJtcyA9IDQ5NyAoeW91KS4gIFVzZSBib3RoIGluIGNhc2UgZXZlcnlib2R5IGlzIG1pc3NlZC5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdQYXNzYWdlIG9mIEFybXMnLCBlZmZlY3RJZDogJzQ5Wzc4XScsIGlnbm9yZVNlbGY6IHRydWUsIGNvbGxlY3RTZWNvbmRzOiAxMCB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnRGl2aW5lIFZlaWwnLCBlZmZlY3RJZDogJzJENycsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0hlYXJ0IE9mIExpZ2h0JywgYWJpbGl0eUlkOiAnM0YyMCcgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnRGFyayBNaXNzaW9uYXJ5JywgYWJpbGl0eUlkOiAnNDA1NycgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hha2UgSXQgT2ZmJywgYWJpbGl0eUlkOiAnMUNEQycgfSksXHJcblxyXG4gICAgLy8gM0Y0NCBpcyB0aGUgY29ycmVjdCBRdWFkcnVwbGUgVGVjaG5pY2FsIEZpbmlzaCwgb3RoZXJzIGFyZSBEaW5reSBUZWNobmljYWwgRmluaXNoLlxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnVGVjaG5pY2FsIEZpbmlzaCcsIGFiaWxpdHlJZDogJzNGNFsxLTRdJyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0RpdmluYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE4JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0Jyb3RoZXJob29kJywgYWJpbGl0eUlkOiAnMUNFNCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCYXR0bGUgTGl0YW55JywgYWJpbGl0eUlkOiAnREU1JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0VtYm9sZGVuJywgYWJpbGl0eUlkOiAnMUQ2MCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCYXR0bGUgVm9pY2UnLCBhYmlsaXR5SWQ6ICc3NicsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLy8gVG9vIG5vaXN5IChwcm9jcyBldmVyeSB0aHJlZSBzZWNvbmRzLCBhbmQgYmFyZHMgb2Z0ZW4gb2ZmIGRvaW5nIG1lY2hhbmljcykuXHJcbiAgICAvLyBtaXNzZWREYW1hZ2VCdWZmKHsgaWQ6ICdXYW5kZXJlclxcJ3MgTWludWV0JywgZWZmZWN0SWQ6ICc4QTgnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnTWFnZVxcJ3MgQmFsbGFkJywgZWZmZWN0SWQ6ICc4QTknLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnQXJteVxcJ3MgUGFlb24nLCBlZmZlY3RJZDogJzhBQScsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1Ryb3ViYWRvdXInLCBhYmlsaXR5SWQ6ICcxQ0VEJyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUYWN0aWNpYW4nLCBhYmlsaXR5SWQ6ICc0MUY5JyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdTaGllbGQgU2FtYmEnLCBhYmlsaXR5SWQ6ICczRThDJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTWFudHJhJywgYWJpbGl0eUlkOiAnNDEnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0Rldm90aW9uJywgYWJpbGl0eUlkOiAnMUQxQScgfSksXHJcblxyXG4gICAgLy8gTWF5YmUgdXNpbmcgYSBoZWFsZXIgTEIxL0xCMiBzaG91bGQgYmUgYW4gZXJyb3IgZm9yIHRoZSBoZWFsZXIuIE86KVxyXG4gICAgLy8gLi4ubWlzc2VkSGVhbCh7IGlkOiAnSGVhbGluZyBXaW5kJywgYWJpbGl0eUlkOiAnQ0UnIH0pLFxyXG4gICAgLy8gLi4ubWlzc2VkSGVhbCh7IGlkOiAnQnJlYXRoIG9mIHRoZSBFYXJ0aCcsIGFiaWxpdHlJZDogJ0NGJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdNZWRpY2EnLCBhYmlsaXR5SWQ6ICc3QycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdNZWRpY2EgSUknLCBhYmlsaXR5SWQ6ICc4NScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBZmZsYXR1cyBSYXB0dXJlJywgYWJpbGl0eUlkOiAnNDA5NicgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdUZW1wZXJhbmNlJywgYWJpbGl0eUlkOiAnNzUxJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1BsZW5hcnkgSW5kdWxnZW5jZScsIGFiaWxpdHlJZDogJzFEMDknIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnUHVsc2Ugb2YgTGlmZScsIGFiaWxpdHlJZDogJ0QwJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdTdWNjb3InLCBhYmlsaXR5SWQ6ICdCQScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdJbmRvbWl0YWJpbGl0eScsIGFiaWxpdHlJZDogJ0RGRicgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdEZXBsb3ltZW50IFRhY3RpY3MnLCBhYmlsaXR5SWQ6ICdFMDEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnV2hpc3BlcmluZyBEYXduJywgYWJpbGl0eUlkOiAnMzIzJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0ZleSBCbGVzc2luZycsIGFiaWxpdHlJZDogJzQwQTAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQ29uc29sYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEEzJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FuZ2VsXFwncyBXaGlzcGVyJywgYWJpbGl0eUlkOiAnNDBBNicgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnRmV5IElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzMyNScgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2VyYXBoaWMgSWxsdW1pbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBNycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBbmdlbCBGZWF0aGVycycsIGFiaWxpdHlJZDogJzEwOTcnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0hlbGlvcycsIGFiaWxpdHlJZDogJ0UxMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBc3BlY3RlZCBIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnMzIwMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdDZWxlc3RpYWwgT3Bwb3NpdGlvbicsIGFiaWxpdHlJZDogJzQwQTknIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXN0cmFsIFN0YXNpcycsIGFiaWxpdHlJZDogJzEwOTgnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1doaXRlIFdpbmQnLCBhYmlsaXR5SWQ6ICcyQzhFJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0dvYnNraW4nLCBhYmlsaXR5SWQ6ICc0NzgwJyB9KSxcclxuXHJcbiAgICAvLyBUT0RPOiBleHBvcnQgYWxsIG9mIHRoZXNlIG1pc3NlZCBmdW5jdGlvbnMgaW50byB0aGVpciBvd24gaGVscGVyXHJcbiAgICAvLyBhbmQgdGhlbiBhZGQgdGhpcyB0byB0aGUgRGVsdWJydW0gUmVnaW5hZSBmaWxlcyBkaXJlY3RseS5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdMb3N0IEFldGhlcnNoaWVsZCcsIGFiaWxpdHlJZDogJzU3NTMnIH0pLFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBHZW5lcmFsIG1pc3Rha2VzOyB0aGVzZSBhcHBseSBldmVyeXdoZXJlLlxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0Y2hBbGwsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gVHJpZ2dlciBpZCBmb3IgaW50ZXJuYWxseSBnZW5lcmF0ZWQgZWFybHkgcHVsbCB3YXJuaW5nLlxyXG4gICAgICBpZDogJ0dlbmVyYWwgRWFybHkgUHVsbCcsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0dlbmVyYWwgRm9vZCBCdWZmJyxcclxuICAgICAgLy8gV2VsbCBGZWRcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ4JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBQcmV2ZW50IFwiRW9zIGxvc2VzIHRoZSBlZmZlY3Qgb2YgV2VsbCBGZWQgZnJvbSBDcml0bG8gTWNnZWVcIlxyXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnRhcmdldCA9PT0gbWF0Y2hlcy5zb3VyY2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5sb3N0Rm9vZCA9IGRhdGEubG9zdEZvb2QgfHwge307XHJcbiAgICAgICAgLy8gV2VsbCBGZWQgYnVmZiBoYXBwZW5zIHJlcGVhdGVkbHkgd2hlbiBpdCBmYWxscyBvZmYgKFdIWSksXHJcbiAgICAgICAgLy8gc28gc3VwcHJlc3MgbXVsdGlwbGUgb2NjdXJyZW5jZXMuXHJcbiAgICAgICAgaWYgKCFkYXRhLmluQ29tYmF0IHx8IGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2xvc3QgZm9vZCBidWZmJyxcclxuICAgICAgICAgICAgZGU6ICdOYWhydW5nc2J1ZmYgdmVybG9yZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0J1ZmYgbm91cnJpdHVyZSB0ZXJtaW7DqWUnLFxyXG4gICAgICAgICAgICBqYTogJ+mjr+WKueaenOOBjOWkseOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5aSx5Y676aOf54mpQlVGRicsXHJcbiAgICAgICAgICAgIGtvOiAn7J2M7IudIOuyhO2UhCDtlbTsoJwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFdlbGwgRmVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ4JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5sb3N0Rm9vZClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkZWxldGUgZGF0YS5sb3N0Rm9vZFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0dlbmVyYWwgUmFiYml0IE1lZGl1bScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzhFMCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuSXNQbGF5ZXJJZChtYXRjaGVzLnNvdXJjZUlkKSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidW5ueScsXHJcbiAgICAgICAgICAgIGRlOiAnSGFzZScsXHJcbiAgICAgICAgICAgIGZyOiAnbGFwaW4nLFxyXG4gICAgICAgICAgICBqYTogJ+OBhuOBleOBjicsXHJcbiAgICAgICAgICAgIGNuOiAn5YWU5a2QJyxcclxuICAgICAgICAgICAga286ICfthqDrgbwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGVzdCBtaXN0YWtlIHRyaWdnZXJzLlxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWlkZGxlTGFOb3NjZWEsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvdycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBib3cgY291cnRlb3VzbHkgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHZvdXMgaW5jbGluZXogZGV2YW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavjgYrovp7lhIDjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5oGt5pWs5Zyw5a+55pyo5Lq66KGM56S8Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDqs7XshpDtlZjqsowg7J247IKs7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3B1bGwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm93JyxcclxuICAgICAgICAgICAgZGU6ICdCb2dlbicsXHJcbiAgICAgICAgICAgIGZyOiAnU2FsdWVyJyxcclxuICAgICAgICAgICAgamE6ICfjgYrovp7lhIAnLFxyXG4gICAgICAgICAgICBjbjogJ+meoOi6rCcsXHJcbiAgICAgICAgICAgIGtvOiAn7J247IKsJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBXaXBlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJpZCBmYXJld2VsbCB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgZmFpdGVzIHZvcyBhZGlldXggYXUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+WIpeOCjOOBruaMqOaLtuOCkuOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirlkJHmnKjkurrlkYrliKsuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOyekeuzhCDsnbjsgqzrpbwg7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dpcGUnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUGFydHkgV2lwZScsXHJcbiAgICAgICAgICAgIGRlOiAnR3J1cHBlbndpcGUnLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODr+OCpOODlycsXHJcbiAgICAgICAgICAgIGNuOiAn5Zui54GtJyxcclxuICAgICAgICAgICAga286ICftjIzti7Ag7KCE66m4JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb290c2hpbmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZnI6ICdNYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQnLFxyXG4gICAgICAgICAgamE6ICfmnKjkuronLFxyXG4gICAgICAgICAgY246ICfmnKjkuronLFxyXG4gICAgICAgICAga286ICfrgpjrrLTsnbjtmJUnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc3RyaWtpbmdEdW1teU5hbWVzID0gT2JqZWN0LnZhbHVlcyhzdHJpa2luZ0R1bW15QnlMb2NhbGUpO1xyXG4gICAgICAgIHJldHVybiBzdHJpa2luZ0R1bW15TmFtZXMuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYm9vdENvdW50ID0gZGF0YS5ib290Q291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2RhdGEuYm9vdENvdW50fSk6ICR7ZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKX1gO1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBMZWFkZW4gRmlzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc3NDUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnNvdXJjZSA9PT0gZGF0YS5tZSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZ29vZCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IE9vcHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmxpbmUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5wb2tlQ291bnQgPSAoZGF0YS5wb2tlQ291bnQgfHwgMCkgKyAxO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFBva2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gMSBwb2tlIGF0IGEgdGltZSBpcyBmaW5lLCBidXQgbW9yZSB0aGFuIG9uZSBpbiA1IHNlY29uZHMgaXMgKE9CVklPVVNMWSkgYSBtaXN0YWtlLlxyXG4gICAgICAgIGlmICghZGF0YS5wb2tlQ291bnQgfHwgZGF0YS5wb2tlQ291bnQgPD0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgVG9vIG1hbnkgcG9rZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgWnUgdmllbGUgUGlla3NlciAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgZnI6IGBUcm9wIGRlIHRvdWNoZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGphOiBg44GE44Gj44Gx44GE44Gk44Gk44GE44GfICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBjbjogYOaIs+WkquWkmuS4i+WVpiAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAga286IGDrhIjrrLQg66eO7J20IOywjOumhCAoJHtkYXRhLnBva2VDb3VudH3rsogpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEucG9rZUNvdW50LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJZnJpdCBTdG9yeSBNb2RlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVCb3dsT2ZFbWJlcnMsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lmcml0Tm0gUmFkaWFudCBQbHVtZSc6ICcyREUnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBJbmNpbmVyYXRlJzogJzFDNScsXHJcbiAgICAnSWZyaXRObSBFcnVwdGlvbic6ICcyREQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBTdG9yeSBNb2RlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnM0NEJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbk5tIExhbmRzbGlkZSc6ICcyOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBSb2NrIEJ1c3Rlcic6ICcyODEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gODIzLzgyNC84MjUsIFdhdGVyc3BvdXQgPSA4MjlcclxuXHJcbi8vIExldmlhdGhhbiBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aUV4IEdyYW5kIEZhbGwnOiAnODJGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlFeCBIeWRybyBTaG90JzogJzc0OCcsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpRXggRHJlYWRzdG9ybSc6ICc3NDknLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpRXggQm9keSBTbGFtJzogJzgyQScsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMSc6ICc4OEEnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMic6ICc4OEInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMyc6ICc4MkMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpRXggRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpRXggSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aUV4IEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzgyQScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gU2hpdmEgSGFyZFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUhtIEljaWNsZSBJbXBhY3QnOiAnOTkzJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFIbSBHbGFjaWVyIEJhc2gnOiAnOUExJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gS25vY2tiYWNrIHRhbmsgY2xlYXZlLlxyXG4gICAgJ1NoaXZhSG0gSGVhdmVubHkgU3RyaWtlJzogJzlBMCcsXHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUhtIEhhaWxzdG9ybSc6ICc5OTgnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUYW5rYnVzdGVyLiAgVGhpcyBpcyBTaGl2YSBIYXJkIG1vZGUsIG5vdCBTaGl2YSBFeHRyZW1lLiAgUGxlYXNlIVxyXG4gICAgJ1NoaXZhSG0gSWNlYnJhbmQnOiAnOTk2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEaWFtb25kIER1c3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc5OEEnIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zZWVuRGlhbW9uZER1c3QgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUhtIERlZXAgRnJlZXplJyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgOUEzIG9uIHlvdSwgYnV0IGl0IGhhcyB0aGUgdW50cmFuc2xhdGVkIG5hbWVcclxuICAgICAgLy8g6YCP5piO77ya44K344O044Kh77ya5YeN57WQ44Os44Kv44OI77ya44OO44OD44Kv44OQ44OD44Kv55SoLiBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgc28gb25seSBhIG1pc3Rha2UgYWZ0ZXIgdGhhdC5cclxuICAgICAgICAvLyBVbmxpa2UgZXh0cmVtZSwgdGhpcyBoYXMgdGhlIHNhbWUgMjAgc2Vjb25kIGR1cmF0aW9uIGFzIHRoZSBpbnRlcm1pc3Npb24uXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuc2VlbkRpYW1vbmREdXN0O1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFFeCBJY2ljbGUgSW1wYWN0JzogJ0JFQicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnQkVDJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnQkU5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIDI3MCBkZWdyZWUgYXR0YWNrLlxyXG4gICAgJ1NoaXZhRXggR2xhc3MgRGFuY2UnOiAnQkRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnQkUyJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJ0JFMCcsXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gUGFydHkgc2hhcmVkIHRhbmtidXN0ZXJcclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJ0JFMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhRXggRGVlcCBGcmVlemUnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSBDOEEgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKgv44OS44Ot44Kk44OD44KvLiBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIGJ1dCBmb3IgYSBzaG9ydGVyIGR1cmF0aW9uLlxyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pID4gMjA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBIYXJkXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU1MycsXHJcbiAgICAnVGl0YW5IbSBCdXJzdCc6ICc0MUMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTGFuZHNsaWRlJzogJzU1NCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFJvY2sgQnVzdGVyJzogJzU1MCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIE1vdW50YWluIEJ1c3Rlcic6ICcyODMnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzVCRScsXHJcbiAgICAnVGl0YW5FeCBCdXJzdCc6ICc1QkYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTGFuZHNsaWRlJzogJzVCQicsXHJcbiAgICAnVGl0YW5FeCBHYW9sZXIgTGFuZHNsaWRlJzogJzVDMycsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkV4IFJvY2sgQnVzdGVyJzogJzVCNycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkV4IE1vdW50YWluIEJ1c3Rlcic6ICc1QjgnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlZXBpbmdDaXR5T2ZNaGFjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBDcml0aWNhbCBCaXRlJzogJzE4NDgnLCAvLyBTYXJzdWNodXMgY29uZSBhb2VcclxuICAgICdXZWVwaW5nIFJlYWxtIFNoYWtlcic6ICcxODNFJywgLy8gRmlyc3QgRGF1Z2h0ZXIgY2lyY2xlIGFvZVxyXG4gICAgJ1dlZXBpbmcgU2lsa3NjcmVlbic6ICcxODNDJywgLy8gRmlyc3QgRGF1Z2h0ZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtlbiBTcHJheSc6ICcxODI0JywgLy8gQXJhY2huZSBFdmUgcmVhciBjb25hbCBhb2VcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDEnOiAnMTgzNycsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDFcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDInOiAnMTgzNicsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDJcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDMnOiAnMTgzNScsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDNcclxuICAgICdXZWVwaW5nIFNwaWRlciBUaHJlYWQnOiAnMTgzOScsIC8vIEFyYWNobmUgRXZlIHNwaWRlciBsaW5lIGFvZVxyXG4gICAgJ1dlZXBpbmcgRmlyZSBJSSc6ICcxODRFJywgLy8gQmxhY2sgTWFnZSBDb3Jwc2UgY2lyY2xlIGFvZVxyXG4gICAgJ1dlZXBpbmcgTmVjcm9wdXJnZSc6ICcxN0Q3JywgLy8gRm9yZ2FsbCBTaHJpdmVsZWQgVGFsb24gbGluZSBhb2VcclxuICAgICdXZWVwaW5nIFJvdHRlbiBCcmVhdGgnOiAnMTdEMCcsIC8vIEZvcmdhbGwgRGFoYWsgY29uZSBhb2VcclxuICAgICdXZWVwaW5nIE1vdyc6ICcxN0QyJywgLy8gRm9yZ2FsbCBIYWFnZW50aSB1bm1hcmtlZCBjbGVhdmVcclxuICAgICdXZWVwaW5nIERhcmsgRXJ1cHRpb24nOiAnMTdDMycsIC8vIEZvcmdhbGwgcHVkZGxlIG1hcmtlclxyXG4gICAgLy8gMTgwNiBpcyBhbHNvIEZsYXJlIFN0YXIsIGJ1dCBpZiB5b3UgZ2V0IGJ5IDE4MDUgeW91IGFsc28gZ2V0IGhpdCBieSAxODA2P1xyXG4gICAgJ1dlZXBpbmcgRmxhcmUgU3Rhcic6ICcxODA1JywgLy8gT3ptYSBjdWJlIHBoYXNlIGRvbnV0XHJcbiAgICAnV2VlcGluZyBFeGVjcmF0aW9uJzogJzE4MjknLCAvLyBPem1hIHRyaWFuZ2xlIGxhc2VyXHJcbiAgICAnV2VlcGluZyBIYWlyY3V0IDEnOiAnMTgwQicsIC8vIENhbG9maXN0ZXJpIDE4MCBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAyJzogJzE4MEYnLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEVudGFuZ2xlbWVudCc6ICcxODFEJywgLy8gQ2Fsb2Zpc3RlcmkgbGFuZG1pbmUgcHVkZGxlIHByb2NcclxuICAgICdXZWVwaW5nIEV2aWwgQ3VybCc6ICcxODE2JywgLy8gQ2Fsb2Zpc3RlcmkgYXhlXHJcbiAgICAnV2VlcGluZyBFdmlsIFRyZXNzJzogJzE4MTcnLCAvLyBDYWxvZmlzdGVyaSBidWxiXHJcbiAgICAnV2VlcGluZyBEZXB0aCBDaGFyZ2UnOiAnMTgyMCcsIC8vIENhbG9maXN0ZXJpIGNoYXJnZSB0byBlZGdlXHJcbiAgICAnV2VlcGluZyBGZWludCBQYXJ0aWNsZSBCZWFtJzogJzE5MjgnLCAvLyBDYWxvZmlzdGVyaSBza3kgbGFzZXJcclxuICAgICdXZWVwaW5nIEV2aWwgU3dpdGNoJzogJzE4MTUnLCAvLyBDYWxvZmlzdGVyaSBsYXNlcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQXJhY2huZSBXZWInOiAnMTg1RScsIC8vIEFyYWNobmUgRXZlIGhlYWRtYXJrZXIgd2ViIGFvZVxyXG4gICAgJ1dlZXBpbmcgRWFydGggQWV0aGVyJzogJzE4NDEnLCAvLyBBcmFjaG5lIEV2ZSBvcmJzXHJcbiAgICAnV2VlcGluZyBFcGlncmFwaCc6ICcxODUyJywgLy8gSGVhZHN0b25lIHVudGVsZWdyYXBoZWQgbGFzZXIgbGluZSB0YW5rIGF0dGFja1xyXG4gICAgLy8gVGhpcyBpcyB0b28gbm9pc3kuICBCZXR0ZXIgdG8gcG9wIHRoZSBiYWxsb29ucyB0aGFuIHdvcnJ5IGFib3V0IGZyaWVuZHMuXHJcbiAgICAvLyAnV2VlcGluZyBFeHBsb3Npb24nOiAnMTgwNycsIC8vIE96bWFzcGhlcmUgQ3ViZSBvcmIgZXhwbG9zaW9uXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMSc6ICcxODBDJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDInOiAnMTgxMCcsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEJsb29kaWVkIE5haWwnOiAnMTgxRicsIC8vIENhbG9maXN0ZXJpIGF4ZS9idWxiIGFwcGVhcmluZ1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBBcmFjaG5lIEV2ZSBGcm9uZCBBZmZlYXJkXHJcbiAgICAnV2VlcGluZyBab21iaWZpY2F0aW9uJzogJzE3MycsIC8vIEZvcmdhbGwgdG9vIG1hbnkgem9tYmllIHB1ZGRsZXNcclxuICAgICdXZWVwaW5nIFRvYWQnOiAnMUI3JywgLy8gRm9yZ2FsbCBCcmFuZCBvZiB0aGUgRmFsbGVuIGZhaWx1cmVcclxuICAgICdXZWVwaW5nIERvb20nOiAnMzhFJywgLy8gRm9yZ2FsbCBIYWFnZW50aSBNb3J0YWwgUmF5XHJcbiAgICAnV2VlcGluZyBBc3NpbWlsYXRpb24nOiAnNDJDJywgLy8gT3ptYXNoYWRlIEFzc2ltaWxhdGlvbiBsb29rLWF3YXlcclxuICAgICdXZWVwaW5nIFN0dW4nOiAnOTUnLCAvLyBDYWxvZmlzdGVyaSBQZW5ldHJhdGlvbiBsb29rLWF3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIEdyYWR1YWwgWm9tYmlmaWNhdGlvbiBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQxNScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnpvbWJpZSA9IGRhdGEuem9tYmllIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxN0NBJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS56b21iaWUgJiYgIWRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGbGFyaW5nIEVwaWdyYXBoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTg1NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuc2hpZWxkICYmICFkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIGlkOiAnMTgzMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGRlOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGZyOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGphOiAn44K/44Oz44Kv44Os44K244O8JyxcclxuICAgICAgICAgICAgY246ICflnablhYvmv4DlhYknLFxyXG4gICAgICAgICAgICBrbzogJ+2Dsey7pCDroIjsnbTsoIAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIE96bWEgSG9seScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4MkUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdpc3QgcnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA77yBJyxcclxuICAgICAgICAgICAga286ICfrhInrsLHrkKghJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEFldGhlcm9jaGVtaWNhbCBSZXNlYXJjaCBGYWNpbGl0eVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWV0aGVyb2NoZW1pY2FsUmVzZWFyY2hGYWNpbGl0eSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQVJGIEdyYW5kIFN3b3JkJzogJzIxNicsIC8vIENvbmFsIEFvRSwgU2NyYW1ibGVkIElyb24gR2lhbnQgdHJhc2hcclxuICAgICdBUkYgQ2VybWV0IERyaWxsJzogJzIwRScsIC8vIExpbmUgQW9FLCA2dGggTGVnaW9uIE1hZ2l0ZWsgVmFuZ3VhcmQgdHJhc2hcclxuICAgICdBUkYgTWFnaXRlayBTbHVnJzogJzEwREInLCAvLyBMaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQVJGIEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzEwRTInLCAvLyBMYXJnZSB0YXJnZXRlZCBjaXJjbGUgQW9FLCBNYWdpdGVrIFR1cnJldCBJSSwgYm9zcyAxXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU3ByZWFkJzogJzEwREMnLCAvLyAyNzAtZGVncmVlIHJvb213aWRlIEFvRSwgYm9zcyAxXHJcbiAgICAnQVJGIEVlcmllIFNvdW5kd2F2ZSc6ICcxMTcwJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFRhaWwgU2xhcCc6ICcxMjVGJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBEYW5jZXIgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgQ2FsY2lmeWluZyBNaXN0JzogJzEyM0EnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIE5hZ2EgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUHVuY3R1cmUnOiAnMTE3MScsIC8vIFNob3J0IGxpbmUgQW9FLCBDdWx0dXJlZCBFbXB1c2EgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgU2lkZXN3aXBlJzogJzExQTcnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIFJlcHRvaWQgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgR3VzdCc6ICczOTUnLCAvLyBUYXJnZXRlZCBzbWFsbCBjaXJjbGUgQW9FLCBDdWx0dXJlZCBNaXJyb3JrbmlnaHQgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgTWFycm93IERyYWluJzogJ0QwRScsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgQ2hpbWVyYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBSaWRkbGUgT2YgVGhlIFNwaGlueCc6ICcxMEU0JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgYm9zcyAyXHJcbiAgICAnQVJGIEthJzogJzEwNkUnLCAvLyBDb25hbCBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBSb3Rvc3dpcGUnOiAnMTFDQycsIC8vIENvbmFsIEFvRSwgRmFjaWxpdHkgRHJlYWRub3VnaHQgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgQXV0by1jYW5ub25zJzogJzEyRDknLCAvLyBMaW5lIEFvRSwgTW9uaXRvcmluZyBEcm9uZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBEZWF0aFxcJ3MgRG9vcic6ICc0RUMnLCAvLyBMaW5lIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIFNwZWxsc3dvcmQnOiAnNEVCJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBTaGFidGkgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRW5kIE9mIERheXMnOiAnMTBGRCcsIC8vIExpbmUgQW9FLCBib3NzIDNcclxuICAgICdBUkYgQmxpenphcmQgQnVyc3QnOiAnMTBGRScsIC8vIEZpeGVkIGNpcmNsZSBBb0VzLCBJZ2V5b3JobSwgYm9zcyAzXHJcbiAgICAnQVJGIEZpcmUgQnVyc3QnOiAnMTBGRicsIC8vIEZpeGVkIGNpcmNsZSBBb0VzLCBMYWhhYnJlYSwgYm9zcyAzXHJcbiAgICAnQVJGIFNlYSBPZiBQaXRjaCc6ICcxMkRFJywgLy8gVGFyZ2V0ZWQgcGVyc2lzdGVudCBjaXJjbGUgQW9FcywgYm9zcyAzXHJcbiAgICAnQVJGIERhcmsgQmxpenphcmQgSUknOiAnMTBGMycsIC8vIFJhbmRvbSBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEZpcmUgSUknOiAnMTBGOCcsIC8vIFJhbmRvbSBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBBbmNpZW50IEVydXB0aW9uJzogJzExMDQnLCAvLyBTZWxmLXRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgNFxyXG4gICAgJ0FSRiBFbnRyb3BpYyBGbGFtZSc6ICcxMTA4JywgLy8gTGluZSBBb0VzLCAgYm9zcyA0XHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBUkYgQ2h0aG9uaWMgSHVzaCc6ICcxMEU3JywgLy8gSW5zdGFudCB0YW5rIGNsZWF2ZSwgYm9zcyAyXHJcbiAgICAnQVJGIEhlaWdodCBPZiBDaGFvcyc6ICcxMTAxJywgLy8gVGFuayBjbGVhdmUsIGJvc3MgNFxyXG4gICAgJ0FSRiBBbmNpZW50IENpcmNsZSc6ICcxMTAyJywgLy8gVGFyZ2V0ZWQgZG9udXQgQW9FcywgYm9zcyA0XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0FSRiBQZXRyaWZhY3Rpb24nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMDEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gRnJhY3RhbCBDb250aW51dW1cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUZyYWN0YWxDb250aW51dW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0ZyYWN0YWwgRG91YmxlIFNldmVyJzogJ0Y3RCcsIC8vIENvbmFscywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCBBZXRoZXJpYyBDb21wcmVzc2lvbic6ICdGODAnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgMVxyXG4gICAgJ0ZyYWN0YWwgMTEtVG9uemUgU3dpcGUnOiAnRjgxJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDEwLVRvbnplIFNsYXNoJzogJ0Y4MycsIC8vIEZyb250YWwgbGluZSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCAxMTEtVG9uemUgU3dpbmcnOiAnRjg3JywgLy8gR2V0LW91dCBBb0UsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgQnJva2VuIEdsYXNzJzogJ0Y4RScsIC8vIEdsb3dpbmcgcGFuZWxzLCBib3NzIDNcclxuICAgICdGcmFjdGFsIE1pbmVzJzogJ0Y5MCcsXHJcbiAgICAnRnJhY3RhbCBTZWVkIG9mIHRoZSBSaXZlcnMnOiAnRjkxJywgLy8gR3JvdW5kIEFvRSBjaXJjbGVzLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0ZyYWN0YWwgU2FuY3RpZmljYXRpb24nOiAnRjg5JywgLy8gSW5zdGFudCBjb25hbCBidXN0ZXIsIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVHcmVhdEd1YmFsTGlicmFyeUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0d1YmFsSG0gVGVycm9yIEV5ZSc6ICc5MzAnLCAvLyBDaXJjbGUgQW9FLCBTcGluZSBCcmVha2VyIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBCYXR0ZXInOiAnMTk4QScsIC8vIENpcmNsZSBBb0UsIHRyYXNoIGJlZm9yZSBib3NzIDFcclxuICAgICdHdWJhbEhtIENvbmRlbW5hdGlvbic6ICczOTAnLCAvLyBDb25hbCBBb0UsIEJpYmxpb3ZvcmUgdHJhc2hcclxuICAgICdHdWJhbEhtIERpc2NvbnRpbnVlIDEnOiAnMTk0MycsIC8vIEZhbGxpbmcgYm9vayBzaGFkb3csIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMic6ICcxOTQwJywgLy8gUnVzaCBBb0UgZnJvbSBlbmRzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIERpc2NvbnRpbnVlIDMnOiAnMTk0MicsIC8vIFJ1c2ggQW9FIGFjcm9zcywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBGcmlnaHRmdWwgUm9hcic6ICcxOTNCJywgLy8gR2V0LU91dCBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMSc6ICcxOTNEJywgLy8gSW5pdGlhbCBlbmQgYm9vayB3YXJuaW5nIEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAyJzogJzE5M0YnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDMnOiAnMTk0MScsIC8vIEluaXRpYWwgc2lkZSBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIERlc29sYXRpb24nOiAnMTk4QycsIC8vIExpbmUgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRG91YmxlIFNtYXNoJzogJzI2QScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmtuZXNzJzogJzNBMCcsIC8vIENvbmFsIEFvRSwgSW5rc3RhaW4gdHJhc2hcclxuICAgICdHdWJhbEhtIEZpcmV3YXRlcic6ICczQkEnLCAvLyBDaXJjbGUgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRWxib3cgRHJvcCc6ICdDQkEnLCAvLyBDb25hbCBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEYXJrJzogJzE5REYnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gU2VhbHMnOiAnMTk0QScsIC8vIFN1bi9Nb29uc2VhbCBmYWlsdXJlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFdhdGVyIElJSSc6ICcxQzY3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgUG9yb2dvIFBlZ2lzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gUmFnaW5nIEF4ZSc6ICcxNzAzJywgLy8gU21hbGwgY29uYWwgQW9FLCBNZWNoYW5vc2Vydml0b3IgdHJhc2hcclxuICAgICdHdWJhbEhtIE1hZ2ljIEhhbW1lcic6ICcxOTkwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQXBhbmRhIG1pbmktYm9zc1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBHcmF2aXR5JzogJzE5NTAnLCAvLyBDaXJjbGUgQW9FIGZyb20gZ3Jhdml0eSBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIFByb3BlcnRpZXMgT2YgTGV2aXRhdGlvbic6ICcxOTRGJywgLy8gQ2lyY2xlIEFvRSBmcm9tIGxldml0YXRpb24gcHVkZGxlcywgYm9zcyAzXHJcbiAgICAnR3ViYWxIbSBDb21ldCc6ICcxOTY5JywgLy8gU21hbGwgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdHdWJhbEhtIEVjbGlwdGljIE1ldGVvcic6ICcxOTVDJywgLy8gTG9TIG1lY2hhbmljLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0d1YmFsSG0gU2VhcmluZyBXaW5kJzogJzE5NDQnLCAvLyBUYW5rIGNsZWF2ZSwgYm9zcyAyXHJcbiAgICAnR3ViYWxIbSBUaHVuZGVyJzogJzE5W0FCXScsIC8vIFNwcmVhZCBtYXJrZXIsIGJvc3MgM1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gRmlyZSBnYXRlIGluIGhhbGx3YXkgdG8gYm9zcyAyLCBtYWduZXQgZmFpbHVyZSBvbiBib3NzIDJcclxuICAgICAgaWQ6ICdHdWJhbEhtIEJ1cm5zJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEwQicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSGVscGVyIGZvciBUaHVuZGVyIDMgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID0gZGF0YS5oYXNJbXAgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNJbXBbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUYXJnZXRzIHdpdGggSW1wIHdoZW4gVGh1bmRlciBJSUkgcmVzb2x2ZXMgcmVjZWl2ZSBhIHZ1bG5lcmFiaWxpdHkgc3RhY2sgYW5kIGJyaWVmIHN0dW5cclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBUaHVuZGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVtBQl0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdTaG9ja2VkIEltcCcsXHJcbiAgICAgICAgICAgIGRlOiAnU2Nob2NraWVydGVyIEltcCcsXHJcbiAgICAgICAgICAgIGphOiAn44Kr44OD44OR44KS6Kej6Zmk44GX44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmsrPnq6XnirbmgIHlkIPkuobmmrTpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIFF1YWtlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NTYnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR3ViYWxIbSBUb3JuYWRvJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVs3OF0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Tb2htQWxIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTb2htQWxIbSBEZWFkbHkgVmFwb3InOiAnMURDOScsIC8vIEVudmlyb25tZW50YWwgY2lyY2xlIEFvRXNcclxuICAgICdTb2htQWxIbSBEZWVwcm9vdCc6ICcxQ0RBJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgQmxvb21pbmcgQ2hpY2h1IHRyYXNoXHJcbiAgICAnU29obUFsSG0gT2Rpb3VzIEFpcic6ICcxQ0RCJywgLy8gQ29uYWwgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBHbG9yaW91cyBCbGF6ZSc6ICcxQzMzJywgLy8gQ2lyY2xlIEFvRSwgU21hbGwgU3BvcmUgU2FjLCBib3NzIDFcclxuICAgICdTb2htQWxIbSBGb3VsIFdhdGVycyc6ICcxMThBJywgLy8gQ29uYWwgQW9FLCBNb3VudGFpbnRvcCBPcGtlbiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFBsYWluIFBvdW5kJzogJzExODcnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBNb3VudGFpbnRvcCBIcm9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGFsc3lueXhpcyc6ICcxMTYxJywgLy8gQ29uYWwgQW9FLCBPdmVyZ3Jvd24gRGlmZmx1Z2lhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gU3VyZmFjZSBCcmVhY2gnOiAnMUU4MCcsIC8vIENpcmNsZSBBb0UsIEdpYW50IE5ldGhlcndvcm0gdHJhc2hcclxuICAgICdTb2htQWxIbSBGcmVzaHdhdGVyIENhbm5vbic6ICcxMTlGJywgLy8gTGluZSBBb0UsIEdpYW50IE5ldGhlcndvcm0gdHJhc2hcclxuICAgICdTb2htQWxIbSBUYWlsIFNtYXNoJzogJzFDMzUnLCAvLyBVbnRlbGVncmFwaGVkIHJlYXIgY29uYWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU3dpbmcnOiAnMUMzNicsIC8vIFVudGVsZWdyYXBoZWQgY2lyY2xlIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBSaXBwZXIgQ2xhdyc6ICcxQzM3JywgLy8gVW50ZWxlZ3JhcGhlZCBmcm9udGFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaW5kIFNsYXNoJzogJzFDMzgnLCAvLyBDaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbGQgQ2hhcmdlJzogJzFDMzknLCAvLyBEYXNoIGF0dGFjaywgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBIb3QgQ2hhcmdlJzogJzFDM0EnLCAvLyBEYXNoIGF0dGFjaywgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBGaXJlYmFsbCc6ICcxQzNCJywgLy8gVW50ZWxlZ3JhcGhlZCB0YXJnZXRlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIExhdmEgRmxvdyc6ICcxQzNDJywgLy8gVW50ZWxlZ3JhcGhlZCBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBIb3JuJzogJzE1MDcnLCAvLyBDb25hbCBBb0UsIEFiYWxhdGhpYW4gQ2xheSBHb2xlbSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIExhdmEgQnJlYXRoJzogJzFDNEQnLCAvLyBDb25hbCBBb0UsIExhdmEgQ3JhYiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFJpbmcgb2YgRmlyZSc6ICcxQzRDJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgVm9sY2FubyBBbmFsYSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDEnOiAnMUM0MycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDInOiAnMUM0NCcsIC8vIDI3MC1kZWdyZWUgcmVhciBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDMnOiAnMUM0MicsIC8vIFJpbmcgQW9FLCBMYXZhIFNjb3JwaW9uLCBib3NzIDNcclxuICAgICdTb2htQWxIbSBSZWFsbSBTaGFrZXInOiAnMUM0MScsIC8vIENpcmNsZSBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gV2FybnMgaWYgcGxheWVycyBzdGVwIGludG8gdGhlIGxhdmEgcHVkZGxlcy4gVGhlcmUgaXMgdW5mb3J0dW5hdGVseSBubyBkaXJlY3QgZGFtYWdlIGV2ZW50LlxyXG4gICAgICBpZDogJ1NvaG1BbEhtIEJ1cm5zJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGV4YW5kZXJUaGVTb3VsT2ZUaGVDcmVhdG9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBMTJOIFNhY3JhbWVudCc6ICcxQUU2JywgLy8gQ3Jvc3MgTGFzZXJzXHJcbiAgICAnQTEyTiBHcmF2aXRhdGlvbmFsIEFub21hbHknOiAnMUFFQicsIC8vIEdyYXZpdHkgUHVkZGxlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQTEyTiBEaXZpbmUgU3BlYXInOiAnMUFFMycsIC8vIEluc3RhbnQgY29uYWwgdGFuayBjbGVhdmVcclxuICAgICdBMTJOIEJsYXppbmcgU2NvdXJnZSc6ICcxQUU5JywgLy8gT3JhbmdlIGhlYWQgbWFya2VyIHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIFBsYWludCBPZiBTZXZlcml0eSc6ICcxQUYxJywgLy8gQWdncmF2YXRlZCBBc3NhdWx0IHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIENvbW11bmlvbic6ICcxQUZDJywgLy8gVGV0aGVyIFB1ZGRsZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDYxJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdCA9IGRhdGEuYXNzYXVsdCB8fCBbXTtcclxuICAgICAgICBkYXRhLmFzc2F1bHQucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJdCBpcyBhIGZhaWx1cmUgZm9yIGEgU2V2ZXJpdHkgbWFya2VyIHRvIHN0YWNrIHdpdGggdGhlIFNvbGlkYXJpdHkgZ3JvdXAuXHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IEZhaWx1cmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUFGMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5hc3NhdWx0LmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdEaWRuXFwndCBTcHJlYWQhJyxcclxuICAgICAgICAgICAgZGU6ICdOaWNodCB2ZXJ0ZWlsdCEnLFxyXG4gICAgICAgICAgICBmcjogJ05lIHNcXCdlc3QgcGFzIGRpc3BlcnPDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfmlaPplovjgZfjgarjgYvjgaPjgZ8hJyxcclxuICAgICAgICAgICAgY246ICfmsqHmnInmlaPlvIAhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IENsZWFudXAnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDYxJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAyMCxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuYXNzYXVsdDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGFNaGlnbyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIE1hZ2l0ZWsgUmF5JzogJzI0Q0UnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIFByZWRhdG9yIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIExvY2sgT24nOiAnMjA0NycsIC8vIEhvbWluZyBjaXJjbGVzLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAxJzogJzIwNDknLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAyJzogJzIwNEInLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAzJzogJzIwNEMnLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gU2hvdWxkZXIgQ2Fubm9uJzogJzI0RDAnLCAvLyBDaXJjbGUgQW9FLCBMZWdpb24gQXZlbmdlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDYW5ub25maXJlJzogJzIzRUQnLCAvLyBFbnZpcm9ubWVudGFsIGNpcmNsZSBBb0UsIHBhdGggdG8gYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzIwNUEnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gSW50ZWdyYXRlZCBBZXRoZXJvbW9kdWxhdG9yJzogJzIwNUInLCAvLyBSaW5nIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENpcmNsZSBPZiBEZWF0aCc6ICcyNEQ0JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIEhleGFkcm9uZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBFeGhhdXN0JzogJzI0RDMnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEdyYW5kIFN3b3JkJzogJzI0RDInLCAvLyBDb25hbCBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDEnOiAnMjA2NicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmUtaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAyJzogJzI1ODcnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAxJzogJzI0QjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJpbWFyeSBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDInOiAnMjA2QycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBoZWxwZXIgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gTGlnaHRsZXNzIFNwYXJrJzogJzIwNkInLCAvLyBDb25hbCBBb0UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIERlbWltYWdpY2tzJzogJzIwNUUnLFxyXG4gICAgJ0FsYSBNaGlnbyBVbm1vdmluZyBUcm9pa2EnOiAnMjA2MCcsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMSc6ICcyMDY5JyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAyJzogJzI1ODknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSXQncyBwb3NzaWJsZSBwbGF5ZXJzIG1pZ2h0IGp1c3Qgd2FuZGVyIGludG8gdGhlIGJhZCBvbiB0aGUgb3V0c2lkZSxcclxuICAgICAgLy8gYnV0IG5vcm1hbGx5IHBlb3BsZSBnZXQgcHVzaGVkIGludG8gaXQuXHJcbiAgICAgIGlkOiAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dlbGwnLFxyXG4gICAgICAvLyBEYW1hZ2UgRG93blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkI4JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBCYXJkYW0ncyBNZXR0bGVcclxuXHJcblxyXG4vLyBGb3IgcmVhc29ucyBub3QgY29tcGxldGVseSB1bmRlcnN0b29kIGF0IHRoZSB0aW1lIHRoaXMgd2FzIG1lcmdlZCxcclxuLy8gYnV0IGxpa2VseSByZWxhdGVkIHRvIHRoZSBmYWN0IHRoYXQgbm8gbmFtZXBsYXRlcyBhcmUgdmlzaWJsZSBkdXJpbmcgdGhlIGVuY291bnRlcixcclxuLy8gYW5kIHRoYXQgbm90aGluZyBpbiB0aGUgZW5jb3VudGVyIGFjdHVhbGx5IGRvZXMgZGFtYWdlLFxyXG4vLyB3ZSBjYW4ndCB1c2UgZGFtYWdlV2FybiBvciBnYWluc0VmZmVjdCBoZWxwZXJzIG9uIHRoZSBCYXJkYW0gZmlnaHQuXHJcbi8vIEluc3RlYWQsIHdlIHVzZSB0aGlzIGhlbHBlciBmdW5jdGlvbiB0byBsb29rIGZvciBmYWlsdXJlIGZsYWdzLlxyXG4vLyBJZiB0aGUgZmxhZyBpcyBwcmVzZW50LGEgZnVsbCB0cmlnZ2VyIG9iamVjdCBpcyByZXR1cm5lZCB0aGF0IGRyb3BzIGluIHNlYW1sZXNzbHkuXHJcbmNvbnN0IGFiaWxpdHlXYXJuID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGlkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zdWJzdHIoLTIpID09PSAnMEUnLFxyXG4gICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgIH0sXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5CYXJkYW1zTWV0dGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdCYXJkYW0gRGlydHkgQ2xhdyc6ICcyMUE4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEd1bG8gR3VsbyB0cmFzaFxyXG4gICAgJ0JhcmRhbSBFcGlncmFwaCc6ICcyM0FGJywgLy8gTGluZSBBb0UsIFdhbGwgb2YgQmFyZGFtIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRoZSBEdXNrIFN0YXInOiAnMjE4NycsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFRoZSBEYXduIFN0YXInOiAnMjE4NicsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIENydW1ibGluZyBDcnVzdCc6ICcxRjEzJywgLy8gQ2lyY2xlIEFvRXMsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBSYW0gUnVzaCc6ICcxRUZDJywgLy8gTGluZSBBb0VzLCBTdGVwcGUgWWFtYWEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEx1bGxhYnknOiAnMjRCMicsIC8vIENpcmNsZSBBb0VzLCBTdGVwcGUgU2hlZXAsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEhlYXZlJzogJzFFRjcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFdpZGUgQmxhc3Rlcic6ICcyNEIzJywgLy8gRW5vcm1vdXMgZnJvbnRhbCBjbGVhdmUsIFN0ZXBwZSBDb2V1cmwsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gRG91YmxlIFNtYXNoJzogJzI2QScsIC8vIENpcmNsZSBBb0UsIE1ldHRsaW5nIERoYXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRyYW5zb25pYyBCbGFzdCc6ICcxMjYyJywgLy8gQ2lyY2xlIEFvRSwgU3RlcHBlIEVhZ2xlIHRyYXNoXHJcbiAgICAnQmFyZGFtIFdpbGQgSG9ybic6ICcyMjA4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEtodW4gR3VydmVsIHRyYXNoXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJzogJzI1NzgnLCAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInOiAnMjU3OScsIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMyc6ICcyNTdBJywgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDEnOiAnMjU3QicsIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAyJzogJzI1N0MnLCAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInOiAnMjU3RicsIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBCYXJkYW1cXCdzIFJpbmcnOiAnMjU4MScsIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCc6ICcyNTdEJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQgSW1wYWN0JzogJzI1ODAnLCAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSXJvbiBTcGhlcmUgQXR0YWNrJzogJzE2QjYnLCAvLyBDb250YWN0IGRhbWFnZSwgSXJvbiBTcGhlcmUgdHJhc2gsIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIFRvcm5hZG8nOiAnMjQ3RScsIC8vIENpcmNsZSBBb0UsIEtodW4gU2hhdmFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBQaW5pb24nOiAnMUYxMScsIC8vIExpbmUgQW9FLCBZb2wgRmVhdGhlciwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGZWF0aGVyIFNxdWFsbCc6ICcxRjBFJywgLy8gRGFzaCBhdHRhY2ssIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBVbnRhcmdldGVkJzogJzFGMTInLCAvLyBSb3RhdGluZyBjaXJjbGUgQW9FcywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCYXJkYW0gR2FydWxhIFJ1c2gnOiAnMUVGOScsIC8vIExpbmUgQW9FLCBHYXJ1bGEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFRhcmdldGVkJzogJzFGMEMnLCAvLyBDaXJjbGUgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaW5nYmVhdCc6ICcxRjBGJywgLy8gQ29uYWwgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnQmFyZGFtIENvbmZ1c2VkJzogJzBCJywgLy8gRmFpbGVkIGdhemUgYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0JhcmRhbSBGZXR0ZXJzJzogJzU2RicsIC8vIEZhaWxpbmcgdHdvIG1lY2hhbmljcyBpbiBhbnkgb25lIHBoYXNlIG9uIEJhcmRhbSwgc2Vjb25kIGJvc3MuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJywgYWJpbGl0eUlkOiAnMjU3OCcgfSksXHJcbiAgICAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInLCBhYmlsaXR5SWQ6ICcyNTc5JyB9KSxcclxuICAgIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMycsIGFiaWxpdHlJZDogJzI1N0EnIH0pLFxyXG4gICAgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDEnLCBhYmlsaXR5SWQ6ICcyNTdCJyB9KSxcclxuICAgIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAyJywgYWJpbGl0eUlkOiAnMjU3QycgfSksXHJcbiAgICAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInLCBhYmlsaXR5SWQ6ICcyNTdGJyB9KSxcclxuICAgIC8vIEdhemUgYXR0YWNrLCBXYXJyaW9yIG9mIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gRW1wdHkgR2F6ZScsIGFiaWxpdHlJZDogJzFGMDQnIH0pLFxyXG4gICAgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtXFwncyBSaW5nJywgYWJpbGl0eUlkOiAnMjU4MScgfSksXHJcbiAgICAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCcsIGFiaWxpdHlJZDogJzI1N0QnIH0pLFxyXG4gICAgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0IEltcGFjdCcsIGFiaWxpdHlJZDogJzI1ODAnIH0pLFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuS3VnYW5lQ2FzdGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIFRlbmthIEdva2tlbic6ICcyMzI5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgIEpvaSBCbGFkZSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgS2Vua2kgUmVsZWFzZSBUcmFzaCc6ICcyMzMwJywgLy8gQ2hhcmlvdCBBb0UsIEpvaSBLaXlvZnVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIENsZWFyb3V0JzogJzFFOTInLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBadWlrby1NYXJ1LCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAxJzogJzFFOTYnLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJhLUtpcmkgMic6ICcyNEY5JywgLy8gR2lhbnQgY2lyY2xlIEFvRSwgSGFyYWtpcmkgS29zaG8sIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMSc6ICcyMzJEJywgLy8gTGluZSBBb0UsIEthcmFrdXJpIE9ubWl0c3UgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIDEwMDAgQmFyYnMnOiAnMjE5OCcsIC8vIExpbmUgQW9FLCBKb2kgS29qYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMic6ICcxRTk4JywgLy8gTGluZSBBb0UsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGF0YW1pLUdhZXNoaSc6ICcxRTlEJywgLy8gRmxvb3IgdGlsZSBsaW5lIGF0dGFjaywgRWxraXRlIE9ubWl0c3UsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAzJzogJzFFQTAnLCAvLyBMaW5lIEFvRSwgRWxpdGUgT25taXRzdSwgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQXV0byBDcm9zc2Jvdyc6ICcyMzMzJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgS2FyYWt1cmkgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYWtpcmkgMyc6ICcyM0M5JywgLy8gR2lhbnQgQ2lyY2xlIEFvRSwgSGFyYWtpcmkgIEhhbnlhIHRyYXNoLCBhZnRlciBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBJYWktR2lyaSc6ICcxRUEyJywgLy8gQ2hhcmlvdCBBb0UsIFlvamltYm8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRnJhZ2lsaXR5JzogJzFFQUEnLCAvLyBDaGFyaW90IEFvRSwgSW5vc2hpa2FjaG8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRHJhZ29uZmlyZSc6ICcxRUFCJywgLy8gTGluZSBBb0UsIERyYWdvbiBIZWFkLCBib3NzIDNcclxuICB9LFxyXG5cclxuICBzaGFyZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIElzc2VuJzogJzFFOTcnLCAvLyBJbnN0YW50IGZyb250YWwgY2xlYXZlLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIENsb2Nrd29yayBSYWl0b24nOiAnMUU5QicsIC8vIExhcmdlIGxpZ2h0bmluZyBzcHJlYWQgY2lyY2xlcywgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIFp1aWtvIE1hcnUsIGJvc3MgMVxyXG4gICAgICBpZDogJ0t1Z2FuZSBDYXN0bGUgSGVsbSBDcmFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzFFOTQnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50eXBlID09PSAnMjEnLCAvLyBUYWtpbmcgdGhlIHN0YWNrIHNvbG8gaXMgKnByb2JhYmx5KiBhIG1pc3Rha2UuXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2FpbnRNb2NpYW5uZXNBcmJvcmV0dW1IYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZHN0cmVhbSc6ICczMEQ5JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgSW1tYWN1bGF0ZSBBcGEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNpbGtlbiBTcHJheSc6ICczMzg1JywgLy8gUmVhciBjb25lIEFvRSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgTXVkZHkgUHVkZGxlcyc6ICczMERBJywgLy8gU21hbGwgdGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIERvcnBva2t1ciB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEFpcic6ICcyRTQ5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTTHVkZ2UgQm9tYic6ICcyRTRFJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEF0bW9zcGhlcmUnOiAnMkU1MScsIC8vIENoYW5uZWxlZCAzLzQgYXJlbmEgY2xlYXZlLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIENyZWVwaW5nIEl2eSc6ICczMUE1JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgV2l0aGVyZWQgS3VsYWsgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFJvY2tzbGlkZSc6ICczMTM0JywgLy8gTGluZSBBb0UsIFNpbHQgR29sZW0sIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBJbm5lcic6ICczMTJFJywgLy8gQ2hhcmlvdCBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBPdXRlcic6ICczMTJGJywgLy8gRHluYW1vIEFvRSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFbWJhbG1pbmcgRWFydGgnOiAnMzFBNicsIC8vIExhcmdlIENoYXJpb3QgQW9FLCBNdWRkeSBNYXRhLCBhZnRlciBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1aWNrbWlyZSc6ICczMTM2JywgLy8gU2V3YWdlIHN1cmdlIGF2b2lkZWQgb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUXVhZ21pcmUgUGxhdGZvcm1zJzogJzMxMzknLCAvLyBRdWFnbWlyZSBleHBsb3Npb24gb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRmVjdWxlbnQgRmxvb2QnOiAnMzEzQycsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDb3JydXB0dXJlJzogJzMzQTAnLCAvLyBNdWQgU2xpbWUgZXhwbG9zaW9uLCBib3NzIDMuIChObyBleHBsb3Npb24gaWYgZG9uZSBjb3JyZWN0bHkuKVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTZWR1Y2VkJzogJzNERicsIC8vIEdhemUgZmFpbHVyZSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUG9sbGVuJzogJzEzJywgLy8gU2x1ZGdlIHB1ZGRsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVHJhbnNmaWd1cmF0aW9uJzogJzY0OCcsIC8vIFJvbHktUG9seSBBb0UgY2lyY2xlIGZhaWx1cmUsIEJMb29taW5nIEJpbG9rbyB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBmYWlsdXJlLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFN0YWIgV291bmQnOiAnNDVEJywgLy8gQXJlbmEgb3V0ZXIgd2FsbCBlZmZlY3QsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBUYXByb290JzogJzJFNEMnLCAvLyBMYXJnZSBvcmFuZ2Ugc3ByZWFkIGNpcmNsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGggU2hha2VyJzogJzMxMzEnLCAvLyBFYXJ0aCBTaGFrZXIsIExha2hhbXUsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZhdWx0IFdhcnJlbic6ICcyRTRBJywgLy8gU3RhY2sgbWFya2VyLCBOdWxsY2h1LCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTd2FsbG93c0NvbXBhc3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSXZ5IEZldHRlcnMnOiAnMkMwNCcsIC8vIENpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMSc6ICcyQzA1JywgLy8gVG9ybmFkbyBncm91bmQgQW9FLCBwbGFjZWQgYnkgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFlhbWEtS2FndXJhJzogJzJCOTYnLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmxhbWVzIE9mIEhhdGUnOiAnMkI5OCcsIC8vIEZpcmUgb3JiIGV4cGxvc2lvbnMsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQ29uZmxhZ3JhdGUnOiAnMkI5OScsIC8vIENvbGxpc2lvbiB3aXRoIGZpcmUgb3JiLCBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBVcHdlbGwnOiAnMkMwNicsIC8vIFRhcmdldGVkIGNpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCYWQgQnJlYXRoJzogJzJDMDcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgSmlubWVuanUgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBHcmVhdGVyIFBhbG0gMSc6ICcyQjlEJywgLy8gSGFsZiBhcmVuYSByaWdodCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDInOiAnMkI5RScsIC8vIEhhbGYgYXJlbmEgbGVmdCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVHJpYnV0YXJ5JzogJzJCQTAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmFsIGdyb3VuZCBBb0VzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMic6ICcyQzA2JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIGVudmlyb25tZW50LCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAzJzogJzJDMDcnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmlsb3BsdW1lcyc6ICcyQzc2JywgLy8gRnJvbnRhbCByZWN0YW5nbGUgQW9FLCBEcmFnb24gQmkgRmFuZyB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDEnOiAnMkJBOCcsIC8vIENoYXJpb3QgQW9FLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMic6ICcyQkE5JywgLy8gRHluYW1vIEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDMnOiAnMkJBRScsIC8vIENoYXJpb3QgQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDQnOiAnMkJBRicsIC8vIER5bmFtbyBBb0UsIFNoYWRvdyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBFcXVhbCBPZiBIZWF2ZW4nOiAnMkJCNCcsIC8vIFNtYWxsIGNpcmNsZSBncm91bmQgQW9FcywgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNaXJhZ2UnOiAnMkJBMicsIC8vIFByZXktY2hhc2luZyBwdWRkbGVzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1vdW50YWluIEZhbGxzJzogJzJCQTUnLCAvLyBDaXJjbGUgc3ByZWFkIG1hcmtlcnMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kJzogJzJCQTcnLCAvLyBMYXNlciB0ZXRoZXIsIFFpdGlhbiBEYXNoZW5nICBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCAyJzogJzJCQUQnLCAvLyBMYXNlciBUZXRoZXIsIFNoYWRvd3MgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGF0dGFjayBmYWlsdXJlLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmxlZWRpbmcnOiAnMTEyRicsIC8vIFN0ZXBwaW5nIG91dHNpZGUgdGhlIGFyZW5hLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YW5kaW5nIGluIHRoZSBsYWtlLCBEaWFkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIFNpeCBGdWxtcyBVbmRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyMzcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU3RhY2sgbWFya2VyLCBib3NzIDNcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIEZpdmUgRmluZ2VyZWQgUHVuaXNobWVudCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWycyQkFCJywgJzJCQjAnXSwgc291cmNlOiBbJ1FpdGlhbiBEYXNoZW5nJywgJ1NoYWRvdyBPZiBUaGUgU2FnZSddIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50eXBlID09PSAnMjEnLCAvLyBUYWtpbmcgdGhlIHN0YWNrIHNvbG8gaXMgKnByb2JhYmx5KiBhIG1pc3Rha2UuXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVGVtcGxlT2ZUaGVGaXN0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUZW1wbGUgRmlyZSBCcmVhayc6ICcyMUVEJywgLy8gQ29uYWwgQW9FLCBCbG9vZGdsaWRlciBNb25rIHRyYXNoXHJcbiAgICAnVGVtcGxlIFJhZGlhbCBCbGFzdGVyJzogJzFGRDMnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDFcclxuICAgICdUZW1wbGUgV2lkZSBCbGFzdGVyJzogJzFGRDQnLCAvLyBDb25hbCBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBDcmlwcGxpbmcgQmxvdyc6ICcyMDE2JywgLy8gTGluZSBBb0VzLCBlbnZpcm9ubWVudGFsLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnVGVtcGxlIEJyb2tlbiBFYXJ0aCc6ICcyMzZFJywgLy8gQ2lyY2xlIEFvRSwgU2luZ2hhIHRyYXNoXHJcbiAgICAnVGVtcGxlIFNoZWFyJzogJzFGREQnLCAvLyBEdWFsIGNvbmFsIEFvRSwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIENvdW50ZXIgUGFycnknOiAnMUZFMCcsIC8vIFJldGFsaWF0aW9uIGZvciBpbmNvcnJlY3QgZGlyZWN0aW9uIGFmdGVyIEtpbGxlciBJbnN0aW5jdCwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIFRhcGFzJzogJycsIC8vIFRyYWNraW5nIGNpcmN1bGFyIGdyb3VuZCBBb0VzLCBib3NzIDJcclxuICAgICdUZW1wbGUgSGVsbHNlYWwnOiAnMjAwRicsIC8vIFJlZC9CbHVlIHN5bWJvbCBmYWlsdXJlLCBib3NzIDJcclxuICAgICdUZW1wbGUgUHVyZSBXaWxsJzogJzIwMTcnLCAvLyBDaXJjbGUgQW9FLCBTcGlyaXQgRmxhbWUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdUZW1wbGUgTWVnYWJsYXN0ZXInOiAnMTYzJywgLy8gQ29uYWwgQW9FLCBDb2V1cmwgUHJhbmEgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdUZW1wbGUgV2luZGJ1cm4nOiAnMUZFOCcsIC8vIENpcmNsZSBBb0UsIFR3aXN0ZXIgd2luZCwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIEh1cnJpY2FuZSBLaWNrJzogJzFGRTUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBib3NzIDNcclxuICAgICdUZW1wbGUgU2lsZW50IFJvYXInOiAnMUZFQicsIC8vIEZyb250YWwgbGluZSBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNaWdodHkgQmxvdyc6ICcxRkVBJywgLy8gQ29udGFjdCB3aXRoIGNvZXVybCBoZWFkLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBIZWF0IExpZ2h0bmluZyc6ICcxRkQ3JywgLy8gUHVycGxlIHNwcmVhZCBjaXJjbGVzLCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJ1cm4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIEZhbGxpbmcgUm9jayc6ICczMUEzJywgLy8gRW52aXJvbm1lbnRhbCBsaW5lIEFvRVxyXG4gICAgJ1RoZSBCdXJuIEFldGhlcmlhbCBCbGFzdCc6ICczMjhCJywgLy8gTGluZSBBb0UsIEt1a3Vsa2FuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gTW9sZS1hLXdoYWNrJzogJzMyOEQnLCAvLyBDaXJjbGUgQW9FLCBEZXNlcnQgRGVzbWFuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gSGVhZCBCdXR0JzogJzMyOEUnLCAvLyBTbWFsbCBjb25hbCBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGFyZGZhbGwnOiAnMzE5MScsIC8vIFJvb213aWRlIEFvRSwgTG9TIGZvciBzYWZldHksIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIERpc3NvbmFuY2UnOiAnMzE5MicsIC8vIERvbnV0IEFvRSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ3J5c3RhbGxpbmUgRnJhY3R1cmUnOiAnMzE5NycsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSZXNvbmFudCBGcmVxdWVuY3knOiAnMzE5OCcsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSb3Rvc3dpcGUnOiAnMzI5MScsIC8vIEZyb250YWwgY29uZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBXcmVja2luZyBCYWxsJzogJzMyOTInLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyZWFkbmF1Z2h0IHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2hhdHRlcic6ICczMjk0JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQ2hhcnJlZCBEb2JseW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBBdXRvLUNhbm5vbnMnOiAnMzI5NScsIC8vIExpbmUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2VsZi1EZXRvbmF0ZSc6ICczMjk2JywgLy8gQ2lyY2xlIEFvRSwgQ2hhcnJlZCBEcm9uZSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEZ1bGwgVGhyb3R0bGUnOiAnMkQ3NScsIC8vIExpbmUgQW9FLCBEZWZlY3RpdmUgRHJvbmUsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRocm90dGxlJzogJzJENzYnLCAvLyBMaW5lIEFvRSwgTWluaW5nIERyb25lIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIEFkaXQgRHJpdmVyJzogJzJENzgnLCAvLyBMaW5lIEFvRSwgUm9jayBCaXRlciBhZGRzLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBUcmVtYmxvcic6ICczMjk3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVmVpbGVkIEdpZ2F3b3JtIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRGVzZXJ0IFNwaWNlJzogJzMyOTgnLCAvLyBUaGUgZnJvbnRhbCBjbGVhdmVzIG11c3QgZmxvd1xyXG4gICAgJ1RoZSBCdXJuIFRveGljIFNwcmF5JzogJzMyOUEnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBHaWdhd29ybSBTdGFsa2VyIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gVmVub20gU3ByYXknOiAnMzI5QicsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBXaGl0ZSBEZWF0aCc6ICczMTQzJywgLy8gUmVhY3RpdmUgZHVyaW5nIGludnVsbmVyYWJpbGl0eSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAxJzogJzMxNDUnLCAvLyBTdGFyIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAyJzogJzMxNDYnLCAvLyBMaW5lIEFvRXMgYWZ0ZXIgc3RhcnMsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBDYXV0ZXJpemUnOiAnMzE0OCcsIC8vIExpbmUvU3dvb3AgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGhlIEJ1cm4gQ29sZCBGb2cnOiAnMzE0MicsIC8vIEdyb3dpbmcgY2lyY2xlIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gTGVhZGVuJzogJzQzJywgLy8gUHVkZGxlIGVmZmVjdCwgYm9zcyAyLiAoQWxzbyBpbmZsaWN0cyAxMUYsIFNsdWRnZS4pXHJcbiAgICAnVGhlIEJ1cm4gUHVkZGxlIEZyb3N0Yml0ZSc6ICcxMUQnLCAvLyBJY2UgcHVkZGxlIGVmZmVjdCwgYm9zcyAzLiAoTk9UIHRoZSBjb25hbC1pbmZsaWN0ZWQgb25lLCAxMEMuKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gSGFpbGZpcmUnOiAnMzE5NCcsIC8vIEhlYWQgbWFya2VyIGxpbmUgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBTaGFyZHN0cmlrZSc6ICczMTk1JywgLy8gT3JhbmdlIHNwcmVhZCBoZWFkIG1hcmtlcnMsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIENoaWxsaW5nIEFzcGlyYXRpb24nOiAnMzE0RCcsIC8vIEhlYWQgbWFya2VyIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZyb3N0IEJyZWF0aCc6ICczMTRDJywgLy8gVGFuayBjbGVhdmUsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzFOIC0gRGVsdGFzY2FwZSAxLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjEwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMU4gQnVybic6ICcyM0Q1JywgLy8gRmlyZWJhbGwgZXhwbG9zaW9uIGNpcmNsZSBBb0VzXHJcbiAgICAnTzFOIENsYW1wJzogJzIzRTInLCAvLyBGcm9udGFsIHJlY3RhbmdsZSBrbm9ja2JhY2sgQW9FLCBBbHRlIFJvaXRlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMU4gTGV2aW5ib2x0JzogJzIzREEnLCAvLyBzbWFsbCBzcHJlYWQgY2lyY2xlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIE8yTiAtIERlbHRhc2NhcGUgMi4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJOIE1haW4gUXVha2UnOiAnMjRBNScsIC8vIE5vbi10ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBGbGVzaHkgTWVtYmVyXHJcbiAgICAnTzJOIEVyb3Npb24nOiAnMjU5MCcsIC8vIFNtYWxsIGNpcmNsZSBBb0VzLCBGbGVzaHkgTWVtYmVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMk4gUGFyYW5vcm1hbCBXYXZlJzogJzI1MEUnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXZSBjb3VsZCB0cnkgdG8gc2VwYXJhdGUgb3V0IHRoZSBtaXN0YWtlIHRoYXQgbGVkIHRvIHRoZSBwbGF5ZXIgYmVpbmcgcGV0cmlmaWVkLlxyXG4gICAgICAvLyBIb3dldmVyLCBpdCdzIE5vcm1hbCBtb2RlLCB3aHkgb3ZlcnRoaW5rIGl0P1xyXG4gICAgICBpZDogJ08yTiBQZXRyaWZpY2F0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIC8vIFRoZSB1c2VyIG1pZ2h0IGdldCBoaXQgYnkgYW5vdGhlciBwZXRyaWZ5aW5nIGFiaWxpdHkgYmVmb3JlIHRoZSBlZmZlY3QgZW5kcy5cclxuICAgICAgLy8gVGhlcmUncyBubyBwb2ludCBpbiBub3RpZnlpbmcgZm9yIHRoYXQuXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNTE1JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGRlYWxzIGRhbWFnZSBvbmx5IHRvIG5vbi1mbG9hdGluZyB0YXJnZXRzLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzNOIC0gRGVsdGFzY2FwZSAzLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjMwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPM04gU3BlbGxibGFkZSBGaXJlIElJSSc6ICcyNDYwJywgLy8gRG9udXQgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgQmxpenphcmQgSUlJJzogJzI0NjEnLCAvLyBDaXJjbGUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgVGh1bmRlciBJSUknOiAnMjQ2MicsIC8vIExpbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIENyb3NzIFJlYXBlcic6ICcyNDZCJywgLy8gQ2lyY2xlIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gR3VzdGluZyBHb3VnZSc6ICcyNDZDJywgLy8gR3JlZW4gbGluZSBBb0UsIFNvdWwgUmVhcGVyXHJcbiAgICAnTzNOIFN3b3JkIERhbmNlJzogJzI0NzAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFVwbGlmdCc6ICcyNDczJywgLy8gR3JvdW5kIHNwZWFycywgUXVlZW4ncyBXYWx0eiBlZmZlY3QsIEhhbGljYXJuYXNzdXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPM04gVWx0aW11bSc6ICcyNDc3JywgLy8gSW5zdGFudCBraWxsLiBVc2VkIGlmIHRoZSBwbGF5ZXIgZG9lcyBub3QgZXhpdCB0aGUgc2FuZCBtYXplIGZhc3QgZW5vdWdoLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzNOIEhvbHkgQmx1cic6IDI0NjMsIC8vIFNwcmVhZCBjaXJjbGVzLlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPM04gUGhhc2UgVHJhY2tlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWNhcm5hc3N1cycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWthcm5hc3NvcycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICfjg4/jg6rjgqvjg6vjg4rjg4Pjgr3jgrknLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+WTiOWIqeWNoee6s+iLj+aWrycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyICs9IDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHRvIHRyYWNrLCBhbmQgaW4gb3JkZXIgdG8gbWFrZSBpdCBhbGwgY2xlYW4sIGl0J3Mgc2FmZXN0IGp1c3QgdG9cclxuICAgICAgLy8gaW5pdGlhbGl6ZSBpdCBhbGwgdXAgZnJvbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgY29tcGFyaXNvbnMuXHJcbiAgICAgIGlkOiAnTzNOIEluaXRpYWxpemluZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIC8vIEluZGV4aW5nIHBoYXNlcyBhdCAxIHNvIGFzIHRvIG1ha2UgcGhhc2VzIG1hdGNoIHdoYXQgaHVtYW5zIGV4cGVjdC5cclxuICAgICAgICAvLyAxOiBXZSBzdGFydCBoZXJlLlxyXG4gICAgICAgIC8vIDI6IENhdmUgcGhhc2Ugd2l0aCBVcGxpZnRzLlxyXG4gICAgICAgIC8vIDM6IFBvc3QtaW50ZXJtaXNzaW9uLCB3aXRoIGdvb2QgYW5kIGJhZCBmcm9ncy5cclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyID0gMTtcclxuICAgICAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFJpYmJpdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NjYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgRE8gd2FudCB0byBiZSBoaXQgYnkgVG9hZC9SaWJiaXQgaWYgdGhlIG5leHQgY2FzdCBvZiBUaGUgR2FtZVxyXG4gICAgICAgIC8vIGlzIDR4IHRvYWQgcGFuZWxzLlxyXG4gICAgICAgIHJldHVybiAhKGRhdGEucGhhc2VOdW1iZXIgPT09IDMgJiYgZGF0YS5nYW1lQ291bnQgJSAyID09PSAwKSAmJiBtYXRjaGVzLnRhcmdldElkICE9PSAnRTAwMDAwMDAnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHdlIGNvdWxkIGRvIHRvIHRyYWNrIGV4YWN0bHkgaG93IHRoZSBwbGF5ZXIgZmFpbGVkIFRoZSBHYW1lLlxyXG4gICAgICAvLyBXaHkgb3ZlcnRoaW5rIE5vcm1hbCBtb2RlLCBob3dldmVyP1xyXG4gICAgICBpZDogJ08zTiBUaGUgR2FtZScsXHJcbiAgICAgIC8vIEd1ZXNzIHdoYXQgeW91IGp1c3QgbG9zdD9cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2RCcgfSksXHJcbiAgICAgIC8vIElmIHRoZSBwbGF5ZXIgdGFrZXMgbm8gZGFtYWdlLCB0aGV5IGRpZCB0aGUgbWVjaGFuaWMgY29ycmVjdGx5LlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgKz0gMTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIE80TiAtIERlbHRhc2NhcGUgNC4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzROIEJsaXp6YXJkIElJSSc6ICcyNEJDJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEV4ZGVhdGhcclxuICAgICdPNE4gRW1wb3dlcmVkIFRodW5kZXIgSUlJJzogJzI0QzEnLCAvLyBVbnRlbGVncmFwaGVkIGxhcmdlIGNpcmNsZSBBb0UsIEV4ZGVhdGhcclxuICAgICdPNE4gWm9tYmllIEJyZWF0aCc6ICcyNENCJywgLy8gQ29uYWwsIHRyZWUgaGVhZCBhZnRlciBEZWNpc2l2ZSBCYXR0bGVcclxuICAgICdPNE4gQ2xlYXJvdXQnOiAnMjRDQycsIC8vIE92ZXJsYXBwaW5nIGNvbmUgQW9FcywgRGVhdGhseSBWaW5lICh0ZW50YWNsZXMgYWxvbmdzaWRlIHRyZWUgaGVhZClcclxuICAgICdPNE4gQmxhY2sgU3BhcmsnOiAnMjRDOScsIC8vIEV4cGxvZGluZyBCbGFjayBIb2xlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEVtcG93ZXJlZCBGaXJlIElJSSBpbmZsaWN0cyB0aGUgUHlyZXRpYyBkZWJ1ZmYsIHdoaWNoIGRlYWxzIGRhbWFnZSBpZiB0aGUgcGxheWVyXHJcbiAgICAvLyBtb3ZlcyBvciBhY3RzIGJlZm9yZSB0aGUgZGVidWZmIGZhbGxzLiBVbmZvcnR1bmF0ZWx5IGl0IGRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3NcclxuICAgIC8vIGN1cnJlbnRseSBhIGxvZyBsaW5lIGZvciB0aGlzLCBzbyB0aGUgb25seSB3YXkgdG8gY2hlY2sgZm9yIHRoaXMgaXMgdG8gY29sbGVjdFxyXG4gICAgLy8gdGhlIGRlYnVmZnMgYW5kIHRoZW4gd2FybiBpZiBhIHBsYXllciB0YWtlcyBhbiBhY3Rpb24gZHVyaW5nIHRoYXQgdGltZS4gTm90IHdvcnRoIGl0XHJcbiAgICAvLyBmb3IgTm9ybWFsLlxyXG4gICAgJ080TiBTdGFuZGFyZCBGaXJlJzogJzI0QkEnLFxyXG4gICAgJ080TiBCdXN0ZXIgVGh1bmRlcic6ICcyNEJFJywgLy8gQSBjbGVhdmluZyB0YW5rIGJ1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdDbGVhbnNlcnMgbWlzc2VkIERvb20hJyxcclxuICAgICAgICAgICAgZGU6ICdEb29tLVJlaW5pZ3VuZyB2ZXJnZXNzZW4hJyxcclxuICAgICAgICAgICAgZnI6ICdOXFwnYSBwYXMgw6l0w6kgZGlzc2lww6koZSkgZHUgR2xhcyAhJyxcclxuICAgICAgICAgICAgamE6ICfmrbvjga7lrqPlkYonLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeino+atu+WuoycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaG9ydCBrbm9ja2JhY2sgZnJvbSBFeGRlYXRoXHJcbiAgICAgIGlkOiAnTzROIFZhY3V1bSBXYXZlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0QjgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080TiBFbXBvd2VyZWQgQmxpenphcmQnLCAvLyBSb29tLXdpZGUgQW9FLCBmcmVlemVzIG5vbi1tb3ZpbmcgdGFyZ2V0c1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNEU2JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gTzRTIC0gRGVsdGFzY2FwZSA0LjAgU2F2YWdlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPNFMyIE5lbyBWYWN1dW0gV2F2ZSc6ICcyNDFEJyxcclxuICAgICdPNFMyIEFjY2VsZXJhdGlvbiBCb21iJzogJzI0MzEnLFxyXG4gICAgJ080UzIgRW1wdGluZXNzJzogJzI0MjInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ080UzIgRG91YmxlIExhc2VyJzogJzI0MTUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERlY2lzaXZlIEJhdHRsZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MDgnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMxIFZhY3V1bSBXYXZlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjNGRScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEFsbWFnZXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQxNycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc05lb0V4ZGVhdGggPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJsaXp6YXJkIElJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0Y4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBJZ25vcmUgdW5hdm9pZGFibGUgcmFpZCBhb2UgQmxpenphcmQgSUlJLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiAhZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBUaHVuZGVyIElJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0ZEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgZHVyaW5nIHJhbmRvbSBtZWNoYW5pYyBhZnRlciBkZWNpc2l2ZSBiYXR0bGUuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+IGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgUGV0cmlmaWVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gT24gTmVvLCBiZWluZyBwZXRyaWZpZWQgaXMgYmVjYXVzZSB5b3UgbG9va2VkIGF0IFNocmllaywgc28geW91ciBmYXVsdC5cclxuICAgICAgICBpZiAoZGF0YS5pc05lb0V4ZGVhdGgpXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgICAvLyBPbiBub3JtYWwgRXhEZWF0aCwgdGhpcyBpcyBkdWUgdG8gV2hpdGUgSG9sZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEZvcmtlZCBMaWdodG5pbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQyRScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGgpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjayBDb2xsZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0MUMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMgfHwgW107XHJcbiAgICAgICAgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzLnB1c2gobWF0Y2hlcyk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGFyciA9IGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcztcclxuICAgICAgICBpZiAoIWFycilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoYXJyLmxlbmd0aCA8PSAyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIEhhcmQgdG8ga25vdyB3aG8gc2hvdWxkIGJlIGluIHRoaXMgYW5kIHdobyBzaG91bGRuJ3QsIGJ1dFxyXG4gICAgICAgIC8vIGl0IHNob3VsZCBuZXZlciBoaXQgMyBwZW9wbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBgJHthcnJbMF0uYWJpbGl0eX0geCAke2Fyci5sZW5ndGh9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgICBydW46IChkYXRhKSA9PiBkZWxldGUgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzLFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzdTIC0gU2lnbWFzY2FwZSAzLjAgU2F2YWdlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TaWdtYXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPN1MgTWlzc2lsZSc6ICcyNzgyJyxcclxuICAgICdPN1MgQ2hhaW4gQ2Fubm9uJzogJzI3OEYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ083UyBTZWFyaW5nIFdpbmQnOiAnMjc3NycsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ083UyBTdG9uZXNraW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyQUI1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy5zb3VyY2UsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIGFkZCBQYXRjaCB3YXJuaW5ncyBmb3IgZG91YmxlL3VuYnJva2VuIHRldGhlcnNcclxuLy8gVE9ETzogSGVsbG8gV29ybGQgY291bGQgaGF2ZSBhbnkgd2FybmluZ3MgKHNvcnJ5KVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFscGhhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBNb3Rpb24gMSc6ICczMzM0JywgLy8gMzAwKyBkZWdyZWUgY2xlYXZlIHdpdGggYmFjayBzYWZlIGFyZWFcclxuICAgICdPMTJTMSBFZmZpY2llbnQgQmxhZGV3b3JrIDEnOiAnMzMyOScsIC8vIE9tZWdhLU0gXCJnZXQgb3V0XCIgY2VudGVyZWQgYW9lIGFmdGVyIHNwbGl0XHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAyJzogJzMzMkEnLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgYmxhZGVzXHJcbiAgICAnTzEyUzEgQmV5b25kIFN0cmVuZ3RoJzogJzMzMjgnLCAvLyBPbWVnYS1NIFwiZ2V0IGluXCIgY2VudGVyZWQgYW9lIGR1cmluZyBzaGllbGRcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgU3RlZWwgMSc6ICczMzMwJywgLy8gT21lZ2EtRiBcImdldCBmcm9udC9iYWNrXCIgYmxhZGVzIHBoYXNlXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDInOiAnMzMzMScsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIE9wdGltaXplZCBCbGl6emFyZCBJSUknOiAnMzMzMicsIC8vIE9tZWdhLUYgZ2lhbnQgY3Jvc3NcclxuICAgICdPMTJTMiBEaWZmdXNlIFdhdmUgQ2Fubm9uJzogJzMzNjknLCAvLyBiYWNrL3NpZGVzIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IEh5cGVyIFB1bHNlIDEnOiAnMzM1QScsIC8vIFJvdGF0aW5nIEFyY2hpdmUgUGVyaXBoZXJhbCBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAyJzogJzMzNUInLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzVGJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgICAnTzEyUzIgTGVmdCBBcm0gVW5pdCBDb2xvc3NhbCBCbG93JzogJzMzNjAnLCAvLyBFeHBsb2RpbmcgQXJjaGl2ZSBBbGwgaGFuZHNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPMTJTMSBPcHRpY2FsIExhc2VyJzogJzMzNDcnLCAvLyBtaWRkbGUgbGFzZXIgZnJvbSBleWVcclxuICAgICdPMTJTMSBBZHZhbmNlZCBPcHRpY2FsIExhc2VyJzogJzMzNEEnLCAvLyBnaWFudCBjaXJjbGUgY2VudGVyZWQgb24gZXllXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDEnOiAnMzM2MScsIC8vIEFyY2hpdmUgQWxsIGluaXRpYWwgbGFzZXJcclxuICAgICdPMTJTMiBSZWFyIFBvd2VyIFVuaXQgUmVhciBMYXNlcnMgMic6ICczMzYyJywgLy8gQXJjaGl2ZSBBbGwgcm90YXRpbmcgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBGaXJlIElJSSc6ICczMzM3JywgLy8gZmlyZSBzcHJlYWRcclxuICAgICdPMTJTMiBIeXBlciBQdWxzZSBUZXRoZXInOiAnMzM1QycsIC8vIEluZGV4IEFuZCBBcmNoaXZlIFBlcmlwaGVyYWwgdGV0aGVyc1xyXG4gICAgJ08xMlMyIFdhdmUgQ2Fubm9uJzogJzMzNkInLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIGJhaXRlZCBsYXNlcnNcclxuICAgICdPMTJTMiBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzM3OScsIC8vIEFyY2hpdmUgQWxsIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIFNhZ2l0dGFyaXVzIEFycm93JzogJzMzNEQnLCAvLyBPbWVnYS1NIGJhcmQgbGltaXQgYnJlYWtcclxuICAgICdPMTJTMiBPdmVyc2FtcGxlZCBXYXZlIENhbm5vbic6ICczMzY2JywgLy8gTW9uaXRvciB0YW5rIGJ1c3RlcnNcclxuICAgICdPMTJTMiBTYXZhZ2UgV2F2ZSBDYW5ub24nOiAnMzM2RCcsIC8vIFRhbmsgYnVzdGVyIHdpdGggdGhlIHZ1bG4gZmlyc3RcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgRGlzY2hhcmdlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzMzMjcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ3MicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnZ1bG4gPSBkYXRhLnZ1bG4gfHwge307XHJcbiAgICAgICAgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID0gZGF0YS52dWxuIHx8IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBEYW1hZ2UnLFxyXG4gICAgICAvLyAzMzJFID0gUGlsZSBQaXRjaCBzdGFja1xyXG4gICAgICAvLyAzMzNFID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLU0gc3F1YXJlIDEtNCBkYXNoZXMpXHJcbiAgICAgIC8vIDMzM0YgPSBFbGVjdHJpYyBTbGlkZSAoT21lZ2EtRiB0cmlhbmdsZSAxLTQgZGFzaGVzKVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzMzMkUnLCAnMzMzRScsICczMzNGJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS52dWxuICYmIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh3aXRoIHZ1bG4pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKG1pdCBWZXJ3dW5kYmFya2VpdClgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6KKr44OA44Oh44O844K45LiK5piHKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjluKbmmJPkvKQpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBCeWFra28gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlSmFkZVN0b2FFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIFBvcHBpbmcgVW5yZWxlbnRpbmcgQW5ndWlzaCBidWJibGVzXHJcbiAgICAnQnlhRXggQXJhdGFtYSc6ICcyN0Y2JyxcclxuICAgIC8vIFN0ZXBwaW5nIGluIGdyb3dpbmcgb3JiXHJcbiAgICAnQnlhRXggVmFjdXVtIENsYXcnOiAnMjdFOScsXHJcbiAgICAvLyBMaWdodG5pbmcgUHVkZGxlc1xyXG4gICAgJ0J5YUV4IEh1bmRlcmZvbGQgSGF2b2MgMSc6ICcyN0U1JyxcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDInOiAnMjdFNicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQnlhRXggU3dlZXAgVGhlIExlZyc6ICcyN0RCJyxcclxuICAgICdCeWFFeCBGaXJlIGFuZCBMaWdodG5pbmcnOiAnMjdERScsXHJcbiAgICAnQnlhRXggRGlzdGFudCBDbGFwJzogJzI3REQnLFxyXG4gICAgLy8gTWlkcGhhc2UgbGluZSBhdHRhY2tcclxuICAgICdCeWFFeCBJbXBlcmlhbCBHdWFyZCc6ICcyN0YxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFBpbmsgYnViYmxlIGNvbGxpc2lvblxyXG4gICAgICBpZDogJ0J5YUV4IE9taW5vdXMgV2luZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyN0VDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2J1YmJsZSBjb2xsaXNpb24nLFxyXG4gICAgICAgICAgICBkZTogJ0JsYXNlbiBzaW5kIHp1c2FtbWVuZ2VzdG/Dn2VuJyxcclxuICAgICAgICAgICAgZnI6ICdjb2xsaXNpb24gZGUgYnVsbGVzJyxcclxuICAgICAgICAgICAgamE6ICfooZ3nqoEnLFxyXG4gICAgICAgICAgICBjbjogJ+ebuOaSnicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQIOqyueyzkOyEnCDthLDsp5AnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFNoaW5yeXUgTm9ybWFsXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUm95YWxNZW5hZ2VyaWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgQWtoIFJoYWknOiAnMUZBNicsIC8vIFNreSBsYXNlcnMgYWxvbmdzaWRlIEFraCBNb3JuLlxyXG4gICAgJ1NoaW5yeXUgQmxhemluZyBUcmFpbCc6ICcyMjFBJywgLy8gUmVjdGFuZ2xlIEFvRXMsIGludGVybWlzc2lvbiBhZGRzLlxyXG4gICAgJ1NoaW5yeXUgQ29sbGFwc2UnOiAnMjIxOCcsIC8vIENpcmNsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkc1xyXG4gICAgJ1NoaW5yeXUgRHJhZ29uZmlzdCc6ICcyNEYwJywgLy8gR2lhbnQgcHVuY2h5IGNpcmNsZSBpbiB0aGUgY2VudGVyLlxyXG4gICAgJ1NoaW5yeXUgRWFydGggQnJlYXRoJzogJzFGOUQnLCAvLyBDb25hbCBhdHRhY2tzIHRoYXQgYXJlbid0IGFjdHVhbGx5IEVhcnRoIFNoYWtlcnMuXHJcbiAgICAnU2hpbnJ5dSBHeXJlIENoYXJnZSc6ICcxRkE4JywgLy8gR3JlZW4gZGl2ZSBib21iIGF0dGFjay5cclxuICAgICdTaGlucnl1IFNwaWtlc2ljbGUnOiAnMUZBYCcsIC8vIEJsdWUtZ3JlZW4gbGluZSBhdHRhY2tzIGZyb20gYmVoaW5kLlxyXG4gICAgJ1NoaW5yeXUgVGFpbCBTbGFwJzogJzFGOTMnLCAvLyBSZWQgc3F1YXJlcyBpbmRpY2F0aW5nIHRoZSB0YWlsJ3MgbGFuZGluZyBzcG90cy5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgTGV2aW5ib2x0JzogJzFGOUMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSWN5IGZsb29yIGF0dGFjay5cclxuICAgICAgaWQ6ICdTaGlucnl1IERpYW1vbmQgRHVzdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBUaWRhbCBXYXZlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFGOEInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBLbm9ja2JhY2sgZnJvbSBjZW50ZXIuXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBBZXJpYWwgQmxhc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY5MCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc2VyICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFN1c2FubyBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVQb29sT2ZUcmlidXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3VzRXggQ2h1cm5pbmcnOiAnMjAzRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnU3VzRXggUmFzZW4gS2Fpa3lvJzogJzIwMkUnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFVsdGltYSBXZWFwb24gVWx0aW1hdGVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlYXBvbnNSZWZyYWluVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1VXVSBTZWFyaW5nIFdpbmQnOiAnMkI1QycsXHJcbiAgICAnVVdVIEVydXB0aW9uJzogJzJCNUEnLFxyXG4gICAgJ1VXVSBXZWlnaHQnOiAnMkI2NScsXHJcbiAgICAnVVdVIExhbmRzbGlkZTEnOiAnMkI3MCcsXHJcbiAgICAnVVdVIExhbmRzbGlkZTInOiAnMkI3MScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVVdVIEdyZWF0IFdoaXJsd2luZCc6ICcyQjQxJyxcclxuICAgICdVV1UgU2xpcHN0cmVhbSc6ICcyQjUzJyxcclxuICAgICdVV1UgV2lja2VkIFdoZWVsJzogJzJCNEUnLFxyXG4gICAgJ1VXVSBXaWNrZWQgVG9ybmFkbyc6ICcyQjRGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVVdVIFdpbmRidXJuJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0VCJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAyLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZlYXRoZXJsYW5jZSBleHBsb3Npb24uICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdVV1UgRmVhdGhlcmxhbmNlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzJCNDMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuc291cmNlIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMsIGtGbGFnSW5zdGFudERlYXRoIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFVDVSAtIFRoZSBVbmVuZGluZyBDb2lsIE9mIEJhaGFtdXQgKFVsdGltYXRlKVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVW5lbmRpbmdDb2lsT2ZCYWhhbXV0VWx0aW1hdGUsXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1VDVSBMdW5hciBEeW5hbW8nOiAnMjZCQycsXHJcbiAgICAnVUNVIElyb24gQ2hhcmlvdCc6ICcyNkJCJyxcclxuICAgICdVQ1UgRXhhZmxhcmUnOiAnMjZFRicsXHJcbiAgICAnVUNVIFdpbmdzIE9mIFNhbHZhdGlvbic6ICcyNkNBJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFR3aXN0ZXIgRGVhdGgnLFxyXG4gICAgICAvLyBJbnN0YW50IGRlYXRoIGhhcyBhIHNwZWNpYWwgZmxhZyB2YWx1ZSwgZGlmZmVyZW50aWF0aW5nXHJcbiAgICAgIC8vIGZyb20gdGhlIGV4cGxvc2lvbiBkYW1hZ2UgeW91IHRha2Ugd2hlbiBzb21lYm9keSBlbHNlXHJcbiAgICAgIC8vIHBvcHMgb25lLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZBQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcywgZmxhZ3M6IGtGbGFnSW5zdGFudERlYXRoIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1R3aXN0ZXIgUG9wJyxcclxuICAgICAgICAgICAgZGU6ICdXaXJiZWxzdHVybSBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnQXBwYXJpdGlvbiBkZXMgdG9ybmFkZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ODhOOCpOOCueOCv+ODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5peL6aOOJyxcclxuICAgICAgICAgICAga286ICftmozsmKTrpqwg67Cf7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFRoZXJtaW9uaWMgQnVyc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZCOScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQaXp6YSBTbGljZScsXHJcbiAgICAgICAgICAgIGRlOiAnUGl6emFzdMO8Y2snLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnRzIGRlIHBpenphJyxcclxuICAgICAgICAgICAgamE6ICfjgrXjg7zjg5/jgqrjg4vjg4Pjgq/jg5Djg7zjgrnjg4gnLFxyXG4gICAgICAgICAgICBjbjogJ+WkqeW0qeWcsOijgicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQ7JeQIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBDaGFpbiBMaWdodG5pbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZDOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gSXQncyBoYXJkIHRvIGFzc2lnbiBibGFtZSBmb3IgbGlnaHRuaW5nLiAgVGhlIGRlYnVmZnNcclxuICAgICAgICAvLyBnbyBvdXQgYW5kIHRoZW4gZXhwbG9kZSBpbiBvcmRlciwgYnV0IHRoZSBhdHRhY2tlciBpc1xyXG4gICAgICAgIC8vIHRoZSBkcmFnb24gYW5kIG5vdCB0aGUgcGxheWVyLlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdoaXQgYnkgbGlnaHRuaW5nJyxcclxuICAgICAgICAgICAgZGU6ICd2b20gQmxpdHogZ2V0cm9mZmVuJyxcclxuICAgICAgICAgICAgZnI6ICdmcmFwcMOpKGUpIHBhciBsYSBmb3VkcmUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODgeOCp+OCpOODs+ODqeOCpOODiOODi+ODs+OCsCcsXHJcbiAgICAgICAgICAgIGNuOiAn6Zu35YWJ6ZO+JyxcclxuICAgICAgICAgICAga286ICfrsojqsJwg66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIEJ1cm5zJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0ZBJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBTbHVkZ2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFGJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA9IGRhdGEuaGFzRG9vbSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSBpcyBubyBjYWxsb3V0IGZvciBcInlvdSBmb3Jnb3QgdG8gY2xlYXIgZG9vbVwiLiAgVGhlIGxvZ3MgbG9va1xyXG4gICAgICAvLyBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAvLyAgIFsyMDowMjozMC41NjRdIDFBOk9rb25vbWkgWWFraSBnYWlucyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAgZm9yIDYuMDAgU2Vjb25kcy5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBQcm90ZWN0IGZyb20gVGFrbyBZYWtpLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM4LjUyNV0gMTk6T2tvbm9taSBZYWtpIHdhcyBkZWZlYXRlZCBieSBGaXJlaG9ybi5cclxuICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIGRvb20gZWZmZWN0IGlzIHJlbW92ZWQgKy8tIG5ldHdvcmsgbGF0ZW5jeSwgYnV0IGNhbid0XHJcbiAgICAgIC8vIHRlbGwgdW50aWwgbGF0ZXIgdGhhdCBpdCB3YXMgYSBkZWF0aC4gIEFyZ3VhYmx5LCB0aGlzIGNvdWxkIGhhdmUgYmVlbiBhXHJcbiAgICAgIC8vIGNsb3NlLWJ1dC1zdWNjZXNzZnVsIGNsZWFyaW5nIG9mIGRvb20gYXMgd2VsbC4gIEl0IGxvb2tzIHRoZSBzYW1lLlxyXG4gICAgICAvLyBTdHJhdGVneTogaWYgeW91IGhhdmVuJ3QgY2xlYXJlZCBkb29tIHdpdGggMSBzZWNvbmQgdG8gZ28gdGhlbiB5b3UgcHJvYmFibHlcclxuICAgICAgLy8gZGllZCB0byBkb29tLiAgWW91IGNhbiBnZXQgbm9uLWZhdGFsbHkgaWNlYmFsbGVkIG9yIGF1dG8nZCBpbiBiZXR3ZWVuLFxyXG4gICAgICAvLyBidXQgd2hhdCBjYW4geW91IGRvLlxyXG4gICAgICBpZDogJ1VDVSBEb29tIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSB8fCAhZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgcmVhc29uO1xyXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKTtcclxuICAgICAgICBpZiAoZHVyYXRpb24gPCA5KVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMxJztcclxuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA8IDE0KVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMyJztcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZWFzb24gPSBtYXRjaGVzLmVmZmVjdCArICcgIzMnO1xyXG4gICAgICAgIHJldHVybiB7IG5hbWU6IG1hdGNoZXMudGFyZ2V0LCByZWFzb246IHJlYXNvbiB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaGUgQ29waWVkIEZhY3RvcnlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNvcGllZEZhY3RvcnksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEJvbWInOiAnNDhCNCcsXHJcbiAgICAvLyBNYWtlIHN1cmUgZW5lbWllcyBhcmUgaWdub3JlZCBvbiB0aGVzZVxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEJvbWJhcmRtZW50JzogJzQ4QjgnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEFzc2F1bHQnOiAnNDhCNicsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNDhDNScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBTaWRlc3RyaWtpbmcgU3BpbiBTcGluIDEnOiAnNDhDQicsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBTaWRlc3RyaWtpbmcgU3BpbiAyJzogJzQ4Q0MnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgQ2VudHJpZnVnYWwgU3Bpbic6ICc0OEM5JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEFpci1Uby1TdXJmYWNlIEVuZXJneSc6ICc0OEJBJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEhpZ2gtQ2FsaWJlciBMYXNlcic6ICc0OEZBJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDEnOiAnNDhCQycsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAyJzogJzQ4QkQnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMyc6ICc0OEJFJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDQnOiAnNDhDMCcsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA1JzogJzQ4QzEnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNic6ICc0OEMyJyxcclxuXHJcbiAgICAnQ29waWVkIFRyYXNoIEVuZXJneSBCb21iJzogJzQ5MUQnLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBGcm9udGFsIFNvbWVyc2F1bHQnOiAnNDkxQicsXHJcbiAgICAnQ29waWVkIFRyYXNoIEhpZ2gtRnJlcXVlbmN5IExhc2VyJzogJzQ5MUUnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFNob2NraW5nIERpc2NoYXJnZSc6ICc0ODBCJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDEnOiAnNDlDNScsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAyJzogJzQ5QzYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMyc6ICc0OUM3JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDQnOiAnNDgwRicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA1JzogJzQ4MTAnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNic6ICc0ODExJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDEnOiAnNDgwMicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDInOiAnNDgwMycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDMnOiAnNDgwNCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVG93ZXJmYWxsJzogJzQ4MTMnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMSc6ICc0ODE2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMic6ICc0ODE3JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMyc6ICc0ODE4JyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBPaWwgV2VsbCc6ICc0ODFCJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEVsZWN0cm9tYWduZXRpYyBQdWxzZSc6ICc0ODE5JyxcclxuICAgIC8vIFRPRE86IHdoYXQncyB0aGUgZWxlY3RyaWZpZWQgZmxvb3Igd2l0aCBjb252ZXlvciBiZWx0cz9cclxuXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAyJzogJzQ5MzgnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDMnOiAnNDkzOScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNCc6ICc0OTNBJyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyA1JzogJzQ5MzcnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIExhc2VyIFR1cnJldCc6ICc0OEU2JyxcclxuXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IEFyZWEgQm9tYmluZyc6ICc0OTQzJyxcclxuICAgICdDb3BpZWQgRmxpZ2h0IFVuaXQgTGlnaHRmYXN0IEJsYWRlJzogJzQ5NDAnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMSc6ICc0NzI5JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMic6ICc0NzI4JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMyc6ICc0NzJGJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNCc6ICc0NzMxJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNSc6ICc0NzJCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNic6ICc0NzJEJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNyc6ICc0NzMyJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBJbmNlbmRpYXJ5IEJvbWJpbmcnOiAnNDczOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBHdWlkZWQgTWlzc2lsZSc6ICc0NzM2JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIFN1cmZhY2UgTWlzc2lsZSc6ICc0NzM0JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIExhc2VyIFNpZ2h0JzogJzQ3M0InLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgRnJhY2snOiAnNDc0RCcsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBDcnVzaCc6ICc0OEZDJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIENydXNoaW5nIFdoZWVsJzogJzQ3NEInLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBUaHJ1c3QnOiAnNDhGQycsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBMYXNlciBTdXBwcmVzc2lvbic6ICc0OEUwJywgLy8gQ2Fubm9uc1xyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDEnOiAnNDk3NCcsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMic6ICc0OERDJyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAzJzogJzQ4RTQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDQnOiAnNDhFMCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBNYXJ4IEltcGFjdCc6ICc0OEQ0JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMSc6ICc0OEU4JyxcclxuICAgICdDb3BpZWQgOVMgVGFuayBEZXN0cnVjdGlvbiAyJzogJzQ4RTknLFxyXG5cclxuICAgICdDb3BpZWQgOVMgU2VyaWFsIFNwaW4gMSc6ICc0OEE1JyxcclxuICAgICdDb3BpZWQgOVMgU2VyaWFsIFNwaW4gMic6ICc0OEE3JyxcclxuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3BpZWQgSG9iYmVzIFNob3J0LVJhbmdlIE1pc3NpbGUnOiAnNDgxNScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IDUwOTMgdGFraW5nIEhpZ2gtUG93ZXJlZCBMYXNlciB3aXRoIGEgdnVsbiAoYmVjYXVzZSBvZiB0YWtpbmcgdHdvKVxyXG4vLyBUT0RPOiA0RkI1IHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNTBEMyBBZXJpYWwgU3VwcG9ydDogQm9tYmFyZG1lbnQgZ29pbmcgb2ZmIGZyb20gYWRkXHJcbi8vIFRPRE86IDUyMTEgTWFuZXV2ZXI6IFZvbHQgQXJyYXkgbm90IGdldHRpbmcgaW50ZXJydXB0ZWRcclxuLy8gVE9ETzogNEZGNC80RkY1IE9uZSBvZiB0aGVzZSBpcyBmYWlsaW5nIGNoZW1pY2FsIGNvbmZsYWdyYXRpb25cclxuLy8gVE9ETzogc3RhbmRpbmcgaW4gd3JvbmcgdGVsZXBvcnRlcj8/IG1heWJlIDUzNjM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUHVwcGV0c0J1bmtlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAxJzogJzUwNzQnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDInOiAnNTA3NScsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMyc6ICc1MDc2JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIENvbGxpZGVyIENhbm5vbnMnOiAnNTA3RScsIC8vIHJvdGF0aW5nIHJlZCBncm91bmQgYW9lIHBpbndoZWVsXHJcbiAgICAnUHVwcGV0IEFlZ2lzIFN1cmZhY2UgTGFzZXIgMSc6ICc1MDkxJywgLy8gY2hhc2luZyBsYXNlciBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEFlZ2lzIFN1cmZhY2UgTGFzZXIgMic6ICc1MDkyJywgLy8gY2hhc2luZyBsYXNlciBjaGFzaW5nXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEZsaWdodCBQYXRoJzogJzUwOEMnLCAvLyBibHVlIGxpbmUgYW9lIGZyb20gZmx5aW5nIHVudGFyZ2V0YWJsZSBhZGRzXHJcbiAgICAnUHVwcGV0IEFlZ2lzIFJlZnJhY3Rpb24gQ2Fubm9ucyAxJzogJzUwODEnLCAvLyByZWZyYWN0aW9uIGNhbm5vbnMgYmV0d2VlbiB3aW5nc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBMaWZlXFwncyBMYXN0IFNvbmcnOiAnNTNCMycsIC8vIHJpbmcgYW9lIHdpdGggZ2FwXHJcbiAgICAnUHVwcGV0IExpZ2h0IExvbmctQmFycmVsZWQgTGFzZXInOiAnNTIxMicsIC8vIGxpbmUgYW9lIGZyb20gYWRkXHJcbiAgICAnUHVwcGV0IExpZ2h0IFN1cmZhY2UgTWlzc2lsZSBJbXBhY3QnOiAnNTIwRicsIC8vIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZSBmcm9tIE5vIFJlc3RyaWN0aW9uc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBJbmNlbmRpYXJ5IEJvbWJpbmcnOiAnNEZCOScsIC8vIGZpcmUgcHVkZGxlIGluaXRpYWxcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU2hhcnAgVHVybic6ICc1MDZEJywgLy8gc2hhcnAgdHVybiBkYXNoXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFN0YW5kYXJkIFN1cmZhY2UgTWlzc2lsZSAxJzogJzRGQjEnLCAvLyBMZXRoYWwgUmV2b2x1dGlvbiBjaXJjbGVzXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFN0YW5kYXJkIFN1cmZhY2UgTWlzc2lsZSAyJzogJzRGQjInLCAvLyBMZXRoYWwgUmV2b2x1dGlvbiBjaXJjbGVzXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFN0YW5kYXJkIFN1cmZhY2UgTWlzc2lsZSAzJzogJzRGQjMnLCAvLyBMZXRoYWwgUmV2b2x1dGlvbiBjaXJjbGVzXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMSc6ICc1MDZGJywgLy8gcmlnaHQtaGFuZGVkIHNsaWRpbmcgc3dpcGVcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU2xpZGluZyBTd2lwZSAyJzogJzUwNzAnLCAvLyBsZWZ0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEd1aWRlZCBNaXNzaWxlJzogJzRGQjgnLCAvLyBncm91bmQgYW9lIGR1cmluZyBBcmVhIEJvbWJhcmRtZW50XHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEhpZ2gtT3JkZXIgRXhwbG9zaXZlIEJsYXN0IDEnOiAnNEZDMCcsIC8vIHN0YXIgYW9lXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEhpZ2gtT3JkZXIgRXhwbG9zaXZlIEJsYXN0IDInOiAnNEZDMScsIC8vIHN0YXIgYW9lXHJcbiAgICAnUHVwcGV0IEhlYXZ5IEVuZXJneSBCb21iYXJkbWVudCc6ICc0RkZDJywgLy8gY29sb3JlZCBtYWdpYyBoYW1tZXIteSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFJldm9sdmluZyBMYXNlcic6ICc1MDAwJywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IEhlYXZ5IEVuZXJneSBCb21iJzogJzRGRkEnLCAvLyBnZXR0aW5nIGhpdCBieSBiYWxsIGR1cmluZyBBY3RpdmUgU3VwcHJlc3NpdmUgVW5pdFxyXG4gICAgJ1B1cHBldCBIZWF2eSBSMDEwIExhc2VyJzogJzRGRjAnLCAvLyBsYXNlciBwb2RcclxuICAgICdQdXBwZXQgSGVhdnkgUjAzMCBIYW1tZXInOiAnNEZGMScsIC8vIGNpcmNsZSBhb2UgcG9kXHJcbiAgICAnUHVwcGV0IEhhbGx3YXkgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwQjEnLCAvLyBsb25nIGFvZSBpbiB0aGUgaGFsbHdheSBzZWN0aW9uXHJcbiAgICAnUHVwcGV0IEhhbGx3YXkgRW5lcmd5IEJvbWInOiAnNTBCMicsIC8vIHJ1bm5pbmcgaW50byBhIGZsb2F0aW5nIG9yYlxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERpc3NlY3Rpb24nOiAnNTFCMycsIC8vIHNwaW5uaW5nIHZlcnRpY2FsIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2hhbmljYWwgRGVjYXBpdGF0aW9uJzogJzUxQjQnLCAvLyBnZXQgdW5kZXIgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaG5pY2FsIENvbnR1c2lvbiBVbnRhcmdldGVkJzogJzUxQjcnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUmVsZW50bGVzcyBTcGlyYWwgMSc6ICc1MUFBJywgLy8gdHJpcGxlIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUmVsZW50bGVzcyBTcGlyYWwgMic6ICc1MUNCJywgLy8gdHJpcGxlIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgT3V0IDEnOiAnNTQxRicsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgT3V0IDInOiAnNTE5OCcsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IG91dFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBCZWhpbmQgMSc6ICc1NDIwJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGJlaGluZFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBCZWhpbmQgMic6ICc1MTk5JywgLy8gMlAgdGVsZXBvcnRpbmcgcHJpbWUgYmxhZGUgZ2V0IGJlaGluZFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBJbiAxJzogJzU0MjEnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgaW5cclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMic6ICc1MTlBJywgLy8gMlAvcHVwcGV0IHRlbGVwb3J0aW5nL3JlcHJvZHVjZSBwcmltZSBibGFkZSBnZXQgaW5cclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBHcm91bmQnOiAnNTFBRScsIC8vIHVudGFyZ2V0ZWQgZ3JvdW5kIGNpcmNsZVxyXG4gICAgLy8gVGhpcyBpcy4uLiB0b28gbm9pc3kuXHJcbiAgICAvLyAnUHVwcGV0IENvbXBvdW5kIDJQIEZvdXIgUGFydHMgUmVzb2x2ZSAxJzogJzUxQTAnLCAvLyBmb3VyIHBhcnRzIHJlc29sdmUganVtcFxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMic6ICc1MTlGJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAxJzogJzUwODcnLCAvLyB1cHBlciBsYXNlciBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFVwcGVyIExhc2VyIDInOiAnNEZGNycsIC8vIHVwcGVyIGxhc2VyIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMSc6ICc1MDg2JywgLy8gbG93ZXIgbGFzZXIgZmlyc3Qgc2VjdGlvbiBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDInOiAnNEZGNicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gY29udGludW91c1xyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAzJzogJzUwODgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDQnOiAnNEZGOCcsIC8vIGxvd2VyIGxhc2VyIHNlY29uZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgNSc6ICc1MDg5JywgLy8gbG93ZXIgbGFzZXIgdGhpcmQgc2VjdGlvbiBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDYnOiAnNEZGOScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gY29udGludW91c1xyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBJbmNvbmdydW91cyBTcGluJzogJzUxQjInLCAvLyBmaW5kIHRoZSBzYWZlIHNwb3QgZG91YmxlIGRhc2hcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1B1cHBldCBCdXJucyc6ICcxMEInLCAvLyBzdGFuZGluZyBpbiBtYW55IHZhcmlvdXMgZmlyZSBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgcHJldHR5IGxhcmdlIGFuZCBnZXR0aW5nIGhpdCBieSBpbml0aWFsIHdpdGhvdXQgYnVybnMgc2VlbXMgZmluZS5cclxuICAgIC8vICdQdXBwZXQgTGlnaHQgSG9taW5nIE1pc3NpbGUgSW1wYWN0JzogJzUyMTAnLCAvLyB0YXJnZXRlZCBmaXJlIGFvZSBmcm9tIE5vIFJlc3RyaWN0aW9uc1xyXG4gICAgJ1B1cHBldCBIZWF2eSBVbmNvbnZlbnRpb25hbCBWb2x0YWdlJzogJzUwMDQnLFxyXG4gICAgLy8gUHJldHR5IG5vaXN5LlxyXG4gICAgJ1B1cHBldCBNYW5ldXZlciBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNTAwMicsIC8vIHRhbmsgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaG5pY2FsIENvbnR1c2lvbiBUYXJnZXRlZCc6ICc1MUI2JywgLy8gdGFyZ2V0ZWQgc3ByZWFkIG1hcmtlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSMDEyIExhc2VyIFRhbmsnOiAnNTFBRScsIC8vIHRhcmdldGVkIHNwcmVhZCBwb2QgbGFzZXIgb24gbm9uLXRhbmtcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBBbnRpLVBlcnNvbm5lbCBMYXNlcic6ICc1MDkwJywgLy8gdGFuayBidXN0ZXIgbWFya2VyXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFByZWNpc2lvbi1HdWlkZWQgTWlzc2lsZSc6ICc0RkM1JyxcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUQnLCAvLyB0YXJnZXRlZCBwb2QgbGFzZXIgb24gdGFua1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBTaG9jayBCbGFjayAyP1xyXG4vLyBUT0RPOiBXaGl0ZS9CbGFjayBEaXNzb25hbmNlIGRhbWFnZSBpcyBtYXliZSB3aGVuIGZsYWdzIGVuZCBpbiAwMz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUb3dlckF0UGFyYWRpZ21zQnJlYWNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDEnOiAnNUVBNycsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IENlbnRlciAyJzogJzYwQzgnLCAvLyBDZW50ZXIgYW9lIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMSc6ICc1RUE1JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDInOiAnNUVBNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAzJzogJzYwQzYnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSA0JzogJzYwQzcnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBCdXJzdCc6ICc1RUQ0JywgLy8gU3BoZXJvaWQgS25hdmlzaCBCdWxsZXRzIGNvbGxpc2lvblxyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEJhcnJhZ2UnOiAnNUVBQycsIC8vIFNwaGVyb2lkIGxpbmUgYW9lc1xyXG4gICAgJ1Rvd2VyIEhhbnNlbCBSZXBheSc6ICc1QzcwJywgLy8gU2hpZWxkIGRhbWFnZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBFeHBsb3Npb24nOiAnNUM2NycsIC8vIEJlaW5nIGhpdCBieSBNYWdpYyBCdWxsZXQgZHVyaW5nIFBhc3NpbmcgTGFuY2VcclxuICAgICdUb3dlciBIYW5zZWwgSW1wYWN0JzogJzVDNUMnLCAvLyBCZWluZyBoaXQgYnkgTWFnaWNhbCBDb25mbHVlbmNlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDEnOiAnNUM2QycsIC8vIER1YWwgY2xlYXZlcyB3aXRob3V0IHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMic6ICc1QzZEJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAzJzogJzVDNkUnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDQnOiAnNUM2RicsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBQYXNzaW5nIExhbmNlJzogJzVDNjYnLCAvLyBUaGUgUGFzc2luZyBMYW5jZSBjaGFyZ2UgaXRzZWxmXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMSc6ICc1NUIzJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMic6ICc1QzVEJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMyc6ICc1QzVFJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEh1bmdyeSBMYW5jZSAxJzogJzVDNzEnLCAvLyAyeGxhcmdlIGNvbmFsIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEh1bmdyeSBMYW5jZSAyJzogJzVDNzInLCAvLyAyeGxhcmdlIGNvbmFsIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgTGlnaHRmYXN0IEJsYWRlJzogJzVCRkUnLCAvLyBsYXJnZSByb29tIGNsZWF2ZVxyXG4gICAgJ1Rvd2VyIEZsaWdodCBVbml0IFN0YW5kYXJkIExhc2VyJzogJzVCRkYnLCAvLyB0cmFja2luZyBsYXNlclxyXG4gICAgJ1Rvd2VyIDJQIFdoaXJsaW5nIEFzc2F1bHQnOiAnNUJGQicsIC8vIGxpbmUgYW9lIGZyb20gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgMlAgQmFsYW5jZWQgRWRnZSc6ICc1QkZBJywgLy8gY2lyY3VsYXIgYW9lIG9uIDJQIGNsb25lc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMSc6ICc2MDA2JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMic6ICc2MDA3JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMyc6ICc2MDA4JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNCc6ICc2MDA5JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNSc6ICc2MzEwJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNic6ICc2MzExJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNyc6ICc2MzEyJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgOCc6ICc2MzEzJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDEnOiAnNjAwRicsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBXaGl0ZSAyJzogJzYwMTAnLCAvLyB3aGl0ZSBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIGJsYWNrXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgQmxhY2sgMSc6ICc2MDExJywgLy8gYmxhY2sgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiB3aGl0ZVxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IFdoaXRlIDEnOiAnNjAxRicsIC8vIGJlaW5nIGhpdCBieSBhIHdoaXRlIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMic6ICc2MDIxJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBCbGFjayAxJzogJzYwMjAnLCAvLyBiZWluZyBoaXQgYnkgYSBibGFjayBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDInOiAnNjAyMicsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBXaGl0ZSc6ICc2MDBDJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIHdoaXRlIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFdpcGUgQmxhY2snOiAnNjAwRCcsIC8vIG5vdCBsaW5lIG9mIHNpZ2h0aW5nIHRoZSBibGFjayBtZXRlb3JcclxuICAgICdUb3dlciBSZWQgR2lybCBEaWZmdXNlIEVuZXJneSc6ICc2MDU2JywgLy8gcm90YXRpbmcgY2xvbmUgYnViYmxlIGNsZWF2ZXNcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBCaWcgRXhwbG9zaW9uJzogJzYwMjcnLCAvLyBub3Qga2lsbGluZyBhIHB5bG9uIGR1cmluZyBoYWNraW5nIHBoYXNlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUHlsb24gRXhwbG9zaW9uJzogJzYwMjYnLCAvLyBweWxvbiBkdXJpbmcgQ2hpbGQncyBwbGF5XHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBNaWRkbGUnOiAnNUMwMicsIC8vIG1pZGRsZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgU2lkZXMnOiAnNUMwNScsIC8vIHNpZGVzIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyAzJzogJzYwNzgnLCAvLyBnb2VzIHdpdGggNUMwMVxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgNCc6ICc2MDc5JywgLy8gZ29lcyB3aXRoIDVDMDRcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBFbmVyZ3kgQm9tYic6ICc1QzA1JywgLy8gcGluayBidWJibGVcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgUmlnaHQnOiAnNUJENycsIC8vIHJvdGF0aW5nIHdoZWVsIGdvaW5nIHJpZ2h0XHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWRlIE1hZ2ljIExlZnQnOiAnNUJENicsIC8vIHJvdGF0aW5nIHdoZWVsIGdvaW5nIGxlZnRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIExpZ2h0ZXIgTm90ZSc6ICc1QkRBJywgLy8gbGlnaHRlciBub3RlIG1vdmluZyBhb2VzXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWdpY2FsIEludGVyZmVyZW5jZSc6ICc1QkQ1JywgLy8gbGFzZXJzIGR1cmluZyBSaHl0aG0gUmluZ3NcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIFNjYXR0ZXJlZCBNYWdpYyc6ICc1QkRGJywgLy8gY2lyY2xlIGFvZXMgZnJvbSBTZWVkIE9mIE1hZ2ljXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgVW5ldmVuIEZvdHRpbmcnOiAnNUJFMicsIC8vIGJ1aWxkaW5nIGZyb20gUmVjcmVhdGUgU3RydWN0dXJlXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgQ3Jhc2gnOiAnNUJFNScsIC8vIHRyYWlucyBmcm9tIE1peGVkIFNpZ25hbHNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBIZWF2eSBBcm1zIDEnOiAnNUJFRCcsIC8vIGhlYXZ5IGFybXMgZnJvbnQvYmFjayBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBIZWF2eSBBcm1zIDInOiAnNUJFRicsIC8vIGhlYXZ5IGFybXMgc2lkZXMgYXR0YWNrXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgRW5lcmd5IFNjYXR0ZXJlZCBNYWdpYyc6ICc1QkU4JywgLy8gb3JicyBmcm9tIFJlZCBHaXJsIGJ5IHRyYWluXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgUGxhY2UgT2YgUG93ZXInOiAnNUMwRCcsIC8vIGluc3RhZGVhdGggbWlkZGxlIGNpcmNsZSBiZWZvcmUgYmxhY2svd2hpdGUgcmluZ3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEFydGlsbGVyeSBBbHBoYSc6ICc1RUFCJywgLy8gU3ByZWFkXHJcbiAgICAnVG93ZXIgSGFuc2VsIFNlZWQgT2YgTWFnaWMgQWxwaGEnOiAnNUM2MScsIC8vIFNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEJldGEnOiAnNUVCMycsIC8vIFRhbmtidXN0ZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBNYW5pcHVsYXRlIEVuZXJneSc6ICc2MDFBJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgRGFya2VyIE5vdGUnOiAnNUJEQycsIC8vIFRhbmtidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVG93ZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1RUIxID0gS25hdmUgTHVuZ2VcclxuICAgICAgLy8gNUJGMiA9IEhlciBJbmZsb3Jlc2VuY2UgU2hvY2t3YXZlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1RUIxJywgJzVCRjInXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ba2FkYWVtaWFBbnlkZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FueWRlciBBY3JpZCBTdHJlYW0nOiAnNDMwNCcsXHJcbiAgICAnQW55ZGVyIFdhdGVyc3BvdXQnOiAnNDMwNicsXHJcbiAgICAnQW55ZGVyIFJhZ2luZyBXYXRlcnMnOiAnNDMwMicsXHJcbiAgICAnQW55ZGVyIFZpb2xlbnQgQnJlYWNoJzogJzQzMDUnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDEnOiAnM0UwOCcsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMic6ICczRTBBJyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDEnOiAnM0UwOScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAyJzogJzNFMEInLFxyXG4gICAgJ0FueWRlciBBcXVhdGljIExhbmNlJzogJzNFMDUnLFxyXG4gICAgJ0FueWRlciBTeXJ1cCBTcG91dCc6ICc0MzA4JyxcclxuICAgICdBbnlkZXIgTmVlZGxlIFN0b3JtJzogJzQzMDknLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDEnOiAnM0UxMCcsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMic6ICczRTExJyxcclxuICAgICdBbnlkZXIgUHV0cmlkIEJyZWF0aCc6ICczRTEyJyxcclxuICAgICdBbnlkZXIgRGV0b25hdG9yJzogJzQzMEYnLFxyXG4gICAgJ0FueWRlciBEb21pbmlvbiBTbGFzaCc6ICc0MzBEJyxcclxuICAgICdBbnlkZXIgUXVhc2FyJzogJzQzMEInLFxyXG4gICAgJ0FueWRlciBEYXJrIEFycml2aXNtZSc6ICc0MzBFJyxcclxuICAgICdBbnlkZXIgVGh1bmRlcnN0b3JtJzogJzNFMUMnLFxyXG4gICAgJ0FueWRlciBXaW5kaW5nIEN1cnJlbnQnOiAnM0UxRicsXHJcbiAgICAvLyAzRTIwIGlzIGJlaW5nIGhpdCBieSB0aGUgZ3Jvd2luZyBvcmJzLCBtYXliZT9cclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFtYXVyb3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FtYXVyb3QgQnVybmluZyBTa3knOiAnMzU0QScsXHJcbiAgICAnQW1hdXJvdCBXaGFjayc6ICczNTNDJyxcclxuICAgICdBbWF1cm90IEFldGhlcnNwaWtlJzogJzM1M0InLFxyXG4gICAgJ0FtYXVyb3QgVmVuZW1vdXMgQnJlYXRoJzogJzNDQ0UnLFxyXG4gICAgJ0FtYXVyb3QgQ29zbWljIFNocmFwbmVsJzogJzREMjYnLFxyXG4gICAgJ0FtYXVyb3QgRWFydGhxdWFrZSc6ICczQ0NEJyxcclxuICAgICdBbWF1cm90IE1ldGVvciBSYWluJzogJzNDQzYnLFxyXG4gICAgJ0FtYXVyb3QgRmluYWwgU2t5JzogJzNDQ0InLFxyXG4gICAgJ0FtYXVyb3QgTWFsZXZvbGVuY2UnOiAnMzU0MScsXHJcbiAgICAnQW1hdXJvdCBUdXJuYWJvdXQnOiAnMzU0MicsXHJcbiAgICAnQW1hdXJvdCBTaWNrbHkgSW5mZXJubyc6ICczREUzJyxcclxuICAgICdBbWF1cm90IERpc3F1aWV0aW5nIEdsZWFtJzogJzM1NDYnLFxyXG4gICAgJ0FtYXVyb3QgQmxhY2sgRGVhdGgnOiAnMzU0MycsXHJcbiAgICAnQW1hdXJvdCBGb3JjZSBvZiBMb2F0aGluZyc6ICczNTQ0JyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDEnOiAnM0UwMCcsXHJcbiAgICAnQW1hdXJvdCBEYW1uaW5nIFJheSAyJzogJzNFMDEnLFxyXG4gICAgJ0FtYXVyb3QgRGVhZGx5IFRlbnRhY2xlcyc6ICczNTQ3JyxcclxuICAgICdBbWF1cm90IE1pc2ZvcnR1bmUnOiAnM0NFMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQW1hdXJvdCBBcG9rYWx5cHNpcyc6ICczQ0Q3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFuYW1uZXNpc0FueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBQaHVhYm8gU3BpbmUgTGFzaCc6ICc0RDFBJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggQW5lbW9uZSBGYWxsaW5nIFJvY2snOiAnNEUzNycsIC8vIGdyb3VuZCBjaXJjbGUgYW9lIGZyb20gVHJlbmNoIEFuZW1vbmUgc2hvd2luZyB1cFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggRGFnb25pdGUgU2V3ZXIgV2F0ZXInOiAnNEQxQycsIC8vIGZyb250YWwgY29uYWwgZnJvbSBUcmVuY2ggQW5lbW9uZSAoPyEpXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBZb3ZyYSBSb2NrIEhhcmQnOiAnNEQyMScsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFRvcnJlbnRpYWwgVG9ybWVudCc6ICc0RDIxJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIEx1bWlub3VzIFJheSc6ICc0RTI3JywgLy8gVW5rbm93biBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNpbnN0ZXIgQnViYmxlIEV4cGxvc2lvbic6ICc0QjZFJywgLy8gVW5rbm93biBleHBsb3Npb25zIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFJlZmxlY3Rpb24nOiAnNEI2RicsIC8vIFVua25vd24gY29uYWwgYXR0YWNrIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIENsZWFyb3V0IDEnOiAnNEI3NCcsIC8vIFVua25vd24gZnJvbnRhbCBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMic6ICc0QjZCJywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDEnOiAnNEI3NScsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2V0YmFjayAyJzogJzVCNkMnLCAvLyBVbmtub3duIHJlYXIgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgQ2xpb25pZCBBY3JpZCBTdHJlYW0nOiAnNEQyNCcsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgQW55ZGVyIERpdmluZXIgRHJlYWRzdG9ybSc6ICc0RDI4JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyAyMDAwLU1pbmEgU3dpbmcnOiAnNEI1NScsIC8vIEt5a2xvcHMgZ2V0IG91dCBtZWNoYW5pY1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEhhbW1lcic6ICc0QjVEJywgLy8gS3lrbG9wcyBIYW1tZXIvQmxhZGUgYWx0ZXJuYXRpbmcgc3F1YXJlc1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEJsYWRlJzogJzRCNUUnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgUmFnaW5nIEdsb3dlcic6ICc0QjU2JywgLy8gS3lrbG9wcyBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIEV5ZSBPZiBUaGUgQ3ljbG9uZSc6ICc0QjU3JywgLy8gS3lrbG9wcyBkb251dFxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgSGFycG9vbmVyIEh5ZHJvYmFsbCc6ICc0RDI2JywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgU3dpZnQgU2hpZnQnOiAnNEI4MycsIC8vIFJ1a3NocyBEZWVtIHRlbGVwb3J0IE4vU1xyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgRGVwdGggR3JpcCBXYXZlYnJlYWtlcic6ICczM0Q0JywgLy8gUnVrc2hzIERlZW0gaGFuZCBhdHRhY2tzXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBSaXNpbmcgVGlkZSc6ICc0QjhCJywgLy8gUnVrc2hzIERlZW0gY3Jvc3MgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBDb21tYW5kIEN1cnJlbnQnOiAnNEI4MicsIC8vIFJ1a3NocyBEZWVtIHByb3RlYW4taXNoIGdyb3VuZCBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFh6b21pdCBNYW50bGUgRHJpbGwnOiAnNEQxOScsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgSW8gT3VzaWEgQmFycmVsaW5nIFNtYXNoJzogJzRFMjQnLCAvLyBjaGFyZ2UgYXR0YWNrXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgV2FuZGVyZXJcXCdzIFB5cmUnOiAnNEI1RicsIC8vIEt5a2xvcHMgc3ByZWFkIGF0dGFja1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogTWlzc2luZyBHcm93aW5nIHRldGhlcnMgb24gYm9zcyAyLlxyXG4vLyAoTWF5YmUgZ2F0aGVyIHBhcnR5IG1lbWJlciBuYW1lcyBvbiB0aGUgcHJldmlvdXMgVElJSUlNQkVFRUVFRVIgY2FzdCBmb3IgY29tcGFyaXNvbj8pXHJcbi8vIFRPRE86IEZhaWxpbmcgdG8gaW50ZXJydXB0IERvaG5mYXVzdCBGdWF0aCBvbiBXYXRlcmluZyBXaGVlbCBjYXN0cz9cclxuLy8gKDE1Oi4uLi4uLi4uOkRvaG5mYXN0IEZ1YXRoOjNEQUE6V2F0ZXJpbmcgV2hlZWw6Li4uLi4uLi46KFxceXtOYW1lfSk6KVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRvaG5NaGVnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEb2huIE1oZWcgR2V5c2VyJzogJzIyNjAnLCAvLyBXYXRlciBlcnVwdGlvbnMsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBIeWRyb2ZhbGwnOiAnMjJCRCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgTGF1Z2hpbmcgTGVhcCc6ICcyMjk0JywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBTd2luZ2UnOiAnMjJDQScsIC8vIEZyb250YWwgY29uZSwgYm9zcyAyXHJcbiAgICAnRG9obiBNaGVnIENhbm9weSc6ICczREIwJywgLy8gRnJvbnRhbCBjb25lLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgUGluZWNvbmUgQm9tYic6ICczREIxJywgLy8gQ2lyY3VsYXIgZ3JvdW5kIEFvRSBtYXJrZXIsIERvaG5mYXVzdCBSb3dhbnMgdGhyb3VnaG91dCBpbnN0YW5jZVxyXG4gICAgJ0RvaG4gTWhlZyBCaWxlIEJvbWJhcmRtZW50JzogJzM0RUUnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAzXHJcbiAgICAnRG9obiBNaGVnIENvcnJvc2l2ZSBCaWxlJzogJzM0RUMnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBGbGFpbGluZyBUZW50YWNsZXMnOiAnMzY4MScsXHJcblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgSW1wIENob2lyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgVG9hZCBDaG9pcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxQjcnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEZvb2xcXCdzIFR1bWJsZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxODMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBCZXJzZXJrZXIgMm5kLzNyZCB3aWxkIGFuZ3Vpc2ggc2hvdWxkIGJlIHNoYXJlZCB3aXRoIGp1c3QgYSByb2NrXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlSGVyb2VzR2F1bnRsZXQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RIRyBCbGFkZVxcJ3MgQmVuaXNvbic6ICc1MjI4JywgLy8gcGxkIGNvbmFsXHJcbiAgICAnVEhHIEFic29sdXRlIEhvbHknOiAnNTI0QicsIC8vIHdobSB2ZXJ5IGxhcmdlIGFvZVxyXG4gICAgJ1RIRyBIaXNzYXRzdTogR29rYSc6ICc1MjNEJywgLy8gc2FtIGxpbmUgYW9lXHJcbiAgICAnVEhHIFdob2xlIFNlbGYnOiAnNTIyRCcsIC8vIG1uayB3aWRlIGxpbmUgYW9lXHJcbiAgICAnVEhHIFJhbmRncml0aCc6ICc1MjMyJywgLy8gZHJnIHZlcnkgYmlnIGxpbmUgYW9lXHJcbiAgICAnVEhHIFZhY3V1bSBCbGFkZSAxJzogJzUwNjEnLCAvLyBTcGVjdHJhbCBUaGllZiBjaXJjdWxhciBncm91bmQgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIFZhY3V1bSBCbGFkZSAyJzogJzUwNjInLCAvLyBTcGVjdHJhbCBUaGllZiBjaXJjdWxhciBncm91bmQgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIENvd2FyZFxcJ3MgQ3VubmluZyc6ICc0RkQ3JywgLy8gU3BlY3RyYWwgVGhpZWYgQ2hpY2tlbiBLbmlmZSBsYXNlclxyXG4gICAgJ1RIRyBQYXBlcmN1dHRlciAxJzogJzRGRDEnLCAvLyBTcGVjdHJhbCBUaGllZiBsaW5lIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBQYXBlcmN1dHRlciAyJzogJzRGRDInLCAvLyBTcGVjdHJhbCBUaGllZiBsaW5lIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBSaW5nIG9mIERlYXRoJzogJzUyMzYnLCAvLyBkcmcgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEx1bmFyIEVjbGlwc2UnOiAnNTIyNycsIC8vIHBsZCBjaXJjdWxhciBhb2VcclxuICAgICdUSEcgQWJzb2x1dGUgR3Jhdml0eSc6ICc1MjQ4JywgLy8gaW5rIG1hZ2UgY2lyY3VsYXJcclxuICAgICdUSEcgUmFpbiBvZiBMaWdodCc6ICc1MjQyJywgLy8gYmFyZCBsYXJnZSBjaXJjdWxlIGFvZVxyXG4gICAgJ1RIRyBEb29taW5nIEZvcmNlJzogJzUyMzknLCAvLyBkcmcgbGluZSBhb2VcclxuICAgICdUSEcgQWJzb2x1dGUgRGFyayBJSSc6ICc0RjYxJywgLy8gTmVjcm9tYW5jZXIgMTIwIGRlZ3JlZSBjb25hbFxyXG4gICAgJ1RIRyBCdXJzdCc6ICc1M0I3JywgLy8gTmVjcm9tYW5jZXIgbmVjcm9idXJzdCBzbWFsbCB6b21iaWUgZXhwbG9zaW9uXHJcbiAgICAnVEhHIFBhaW4gTWlyZSc6ICc0RkE0JywgLy8gTmVjcm9tYW5jZXIgdmVyeSBsYXJnZSBncmVlbiBibGVlZCBwdWRkbGVcclxuICAgICdUSEcgRGFyayBEZWx1Z2UnOiAnNEY1RCcsIC8vIE5lY3JvbWFuY2VyIGdyb3VuZCBhb2VcclxuICAgICdUSEcgVGVra2EgR29qaW4nOiAnNTIzRScsIC8vIHNhbSA5MCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDEnOiAnNTIwQScsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBSYWdpbmcgU2xpY2UgMic6ICc1MjBCJywgLy8gQmVyc2Vya2VyIGxpbmUgY2xlYXZlXHJcbiAgICAnVEhHIFdpbGQgUmFnZSc6ICc1MjAzJywgLy8gQmVyc2Vya2VyIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RIRyBBYnNvbHV0ZSBUaHVuZGVyIElWJzogJzUyNDUnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGJsbVxyXG4gICAgJ1RIRyBNb29uZGl2ZXInOiAnNTIzMycsIC8vIGhlYWRtYXJrZXIgYW9lIGZyb20gZHJnXHJcbiAgICAnVEhHIFNwZWN0cmFsIEd1c3QnOiAnNTNDRicsIC8vIFNwZWN0cmFsIFRoaWVmIGhlYWRtYXJrZXIgYW9lXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUSEcgRmFsbGluZyBSb2NrJzogJzUyMDUnLCAvLyBCZXJzZXJrZXIgaGVhZG1hcmtlciBhb2UgdGhhdCBjcmVhdGVzIHJ1YmJsZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVEhHIEJsZWVkaW5nJzogJzgyOCcsIC8vIFN0YW5kaW5nIGluIHRoZSBOZWNyb21hbmNlciBwdWRkbGUgb3Igb3V0c2lkZSB0aGUgQmVyc2Vya2VyIGFyZW5hXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdUSEcgVHJ1bHkgQmVyc2Vyayc6ICc5MDYnLCAvLyBTdGFuZGluZyBpbiB0aGUgY3JhdGVyIHRvbyBsb25nXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gVGhpcyBzaG91bGQgYWx3YXlzIGJlIHNoYXJlZC4gIE9uIGFsbCB0aW1lcyBidXQgdGhlIDJuZCBhbmQgM3JkLCBpdCdzIGEgcGFydHkgc2hhcmUuXHJcbiAgICAvLyBUT0RPOiBvbiB0aGUgMm5kIGFuZCAzcmQgdGltZSB0aGlzIHNob3VsZCBvbmx5IGJlIHNoYXJlZCB3aXRoIGEgcm9jay5cclxuICAgIC8vIFRPRE86IGFsdGVybmF0aXZlbHkgd2FybiBvbiB0YWtpbmcgb25lIG9mIHRoZXNlIHdpdGggYSA0NzIgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBlZmZlY3RcclxuICAgICdUSEcgV2lsZCBBbmd1aXNoJzogJzUyMDknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUSEcgV2lsZCBSYW1wYWdlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzUyMDcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgaXMgemVybyBkYW1hZ2UgaWYgeW91IGFyZSBpbiB0aGUgY3JhdGVyLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuSG9sbWluc3RlclN3aXRjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSG9sbWluc3RlciBUaHVtYnNjcmV3JzogJzNEQzYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgV29vZGVuIGhvcnNlJzogJzNEQzcnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgTGlnaHQgU2hvdCc6ICczREM4JyxcclxuICAgICdIb2xtaW5zdGVyIEhlcmV0aWNcXCdzIEZvcmsnOiAnM0RDRScsXHJcbiAgICAnSG9sbWluc3RlciBIb2x5IFdhdGVyJzogJzNERDQnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMSc6ICczREREJyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDInOiAnM0RERScsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAzJzogJzNEREYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgQ2F0IE9cXCcgTmluZSBUYWlscyc6ICczREUxJyxcclxuICAgICdIb2xtaW5zdGVyIFJpZ2h0IEtub3V0JzogJzNERTYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgTGVmdCBLbm91dCc6ICczREU3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIb2xtaW5zdGVyIEFldGhlcnN1cCc6ICczREU5JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgRmxhZ2VsbGF0aW9uJzogJzNERDYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBUYXBoZXBob2JpYSc6ICc0MTgxJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hbGlrYWhzV2VsbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWFsaWthaCBGYWxsaW5nIFJvY2snOiAnM0NFQScsXHJcbiAgICAnTWFsaWthaCBXZWxsYm9yZSc6ICczQ0VEJyxcclxuICAgICdNYWxpa2FoIEdleXNlciBFcnVwdGlvbic6ICczQ0VFJyxcclxuICAgICdNYWxpa2FoIFN3aWZ0IFNwaWxsJzogJzNDRjAnLFxyXG4gICAgJ01hbGlrYWggQnJlYWtpbmcgV2hlZWwgMSc6ICczQ0Y1JyxcclxuICAgICdNYWxpa2FoIENyeXN0YWwgTmFpbCc6ICczQ0Y3JyxcclxuICAgICdNYWxpa2FoIEhlcmV0aWNcXCdzIEZvcmsgMSc6ICczQ0Y5JyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDInOiAnM0NGQScsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDInOiAnM0UwRScsXHJcbiAgICAnTWFsaWthaCBFYXJ0aHNoYWtlJzogJzNFMzknLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBpbmNsdWRlIDU0ODQgTXVkbWFuIFJvY2t5IFJvbGwgYXMgYSBzaGFyZVdhcm4sIGJ1dCBpdCdzIGxvdyBkYW1hZ2UgYW5kIGNvbW1vbi5cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRveWFzUmVsaWN0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdNYXRveWEgUmVsaWN0IFdlcmV3b29kIE92YXRpb24nOiAnNTUxOCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnTWF0b3lhIENhdmUgVGFyYW50dWxhIEhhd2sgQXBpdG94aW4nOiAnNTUxOScsIC8vIGJpZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFNwcmlnZ2FuIFN0b25lYmVhcmVyIFJvbXAnOiAnNTUxQScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBTb25ueSBPZiBaaWdneSBKaXR0ZXJpbmcgR2xhcmUnOiAnNTUxQycsIC8vIGxvbmcgbmFycm93IGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gUXVhZ21pcmUnOiAnNTQ4MScsIC8vIE11ZG1hbiBhb2UgcHVkZGxlc1xyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDEnOiAnNTQ4RScsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMic6ICc1NDhGJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAzJzogJzU0OTAnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gTXVkIEJ1YmJsZSc6ICc1NDg3JywgLy8gc3RhbmRpbmcgaW4gbXVkIHB1ZGRsZT9cclxuICAgICdNYXRveWEgQ2F2ZSBQdWdpbCBTY3Jld2RyaXZlcic6ICc1NTFFJywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIE5peGllIEd1cmdsZSc6ICc1OTkyJywgLy8gTml4aWUgd2FsbCBmbHVzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgUHlyb2NsYXN0aWMgU2hvdCc6ICc1N0VCJywgLy8gdGhlIGxpbmUgYW9lcyBhcyB5b3UgcnVuIHRvIHRyYXNoXHJcbiAgICAnTWF0b3lhIFJlbGljdCBGbGFuIEZsb29kJzogJzU1MjMnLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBQeXJvZHVjdCBFbGR0aHVycyBNYXNoJzogJzU1MjcnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdHlvYSBQeXJvZHVjdCBFbGR0aHVycyBTcGluJzogJzU1MjgnLCAvLyB2ZXJ5IGxhcmdlIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IEJhdmFyb2lzIFRodW5kZXIgSUlJJzogJzU1MjUnLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNYXJzaG1hbGxvdyBBbmNpZW50IEFlcm8nOiAnNTUyNCcsIC8vIHZlcnkgbGFyZ2UgbGluZSBncm9hb2VcclxuICAgICdNYXRveWEgUmVsaWN0IFB1ZGRpbmcgRmlyZSBJSSc6ICc1NTIyJywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgSG90IExhdmEnOiAnNTdFOScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgVm9sY2FuaWMgRHJvcCc6ICc1N0U4JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIE1lZGl1bSBSZWFyJzogJzU5MUQnLCAvLyBrbm9ja2JhY2sgaW50byBzYWZlIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBCYXJiZXF1ZSBMaW5lJzogJzU5MTcnLCAvLyBsaW5lIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgQ2lyY2xlJzogJzU5MTgnLCAvLyBjaXJjbGUgYW9lIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBUbyBBIENyaXNwJzogJzU5MjUnLCAvLyBnZXR0aW5nIHRvIGNsb3NlIHRvIGJvc3MgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUHJveGllIEJ1ZmZldCc6ICc1OTI2JywgLy8gQWVvbGlhbiBDYXZlIFNwcml0ZSBsaW5lIGFvZSAoaXMgdGhpcyBhIHB1bj8pXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIFNlYSBTaGFudHknOiAnNTk4QycsIC8vIE5vdCB0YWtpbmcgdGhlIHB1ZGRsZSB1cCB0byB0aGUgdG9wPyBGYWlsaW5nIGFkZCBlbnJhZ2U/XHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdNYXRveWEgTml4aWUgQ3JhY2snOiAnNTk5MCcsIC8vIE5peGllIENyYXNoLVNtYXNoIHRhbmsgdGV0aGVyc1xyXG4gICAgJ01hdG95YSBOaXhpZSBTcHV0dGVyJzogJzU5OTMnLCAvLyBOaXhpZSBzcHJlYWQgbWFya2VyXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NdEd1bGcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0d1bGcgSW1tb2xhdGlvbic6ICc0MUFBJyxcclxuICAgICdHdWxnIFRhaWwgU21hc2gnOiAnNDFBQicsXHJcbiAgICAnR3VsZyBIZWF2ZW5zbGFzaCc6ICc0MUE5JyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAxJzogJzNEMDAnLFxyXG4gICAgJ0d1bGcgVHlwaG9vbiBXaW5nIDInOiAnM0QwMScsXHJcbiAgICAnR3VsZyBIdXJyaWNhbmUgV2luZyc6ICczRDAzJyxcclxuICAgICdHdWxnIEVhcnRoIFNoYWtlcic6ICczN0Y1JyxcclxuICAgICdHdWxnIFNhbmN0aWZpY2F0aW9uJzogJzQxQUUnLFxyXG4gICAgJ0d1bGcgRXhlZ2VzaXMnOiAnM0QwNycsXHJcbiAgICAnR3VsZyBQZXJmZWN0IENvbnRyaXRpb24nOiAnM0QwRScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWVkIEFlcm8nOiAnNDFBRCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAxJzogJzNEMTYnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMic6ICczRDE4JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDMnOiAnNDY2OScsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyA0JzogJzNEMTknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNSc6ICczRDIxJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAxJzogJzNEMUEnLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDInOiAnM0QxQicsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMyc6ICczRDIwJyxcclxuICAgICdHdWxnIFZlbmEgQW1vcmlzJzogJzNEMjcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1bGcgTHVtZW4gSW5maW5pdHVtJzogJzQxQjInLFxyXG4gICAgJ0d1bGcgUmlnaHQgUGFsbSc6ICczN0Y4JyxcclxuICAgICdHdWxnIExlZnQgUGFsbSc6ICczN0ZBJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogV2hhdCB0byBkbyBhYm91dCBLYWhuIFJhaSA1QjUwP1xyXG4vLyBJdCBzZWVtcyBpbXBvc3NpYmxlIGZvciB0aGUgbWFya2VkIHBlcnNvbiB0byBhdm9pZCBlbnRpcmVseS5cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5QYWdsdGhhbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gVGVsb3ZvdWl2cmUgUGxhZ3VlIFN3aXBlJzogJzYwRkMnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIExlc3NlciBUZWxvZHJhZ29uIEVuZ3VsZmluZyBGbGFtZXMnOiAnNjBGNScsIC8vIGZyb250YWwgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBMaWdodG5pbmcgQm9sdCc6ICc1QzRDJywgLy8gY2lyY3VsYXIgbGlnaHRuaW5nIGFvZSAob24gc2VsZiBvciBwb3N0KVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUyJywgLy8gcHVsc2luZyBzbWFsbCBjaXJjdWxhciBhb2VzXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBTdXBlcmNoYXJnZWQgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUzJywgLy8gcHVsc2luZyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIFdpZGUgQmxhc3Rlcic6ICc2MEM1JywgLy8gcmVhciBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBUZWxvYnJvYmlueWFrIEZhbGwgT2YgTWFuJzogJzYxNDgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFJlYXBlciBNYWdpdGVrIENhbm5vbic6ICc2MTIxJywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBTaGVldCBvZiBJY2UnOiAnNjBGOCcsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gRnJvc3QgQnJlYXRoJzogJzYwRjcnLCAvLyB2ZXJ5IGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgQ29yZSBTdGFibGUgQ2Fubm9uJzogJzVDOTQnLCAvLyBsYXJnZSBsaW5lIGFvZXNcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgMi1Ub256ZSBNYWdpdGVrIE1pc3NpbGUnOiAnNUM5NScsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG90ZWsgU2t5IEFybW9yIEFldGhlcnNob3QnOiAnNUM5QycsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hcmsgSUkgVGVsb3RlayBDb2xvc3N1cyBFeGhhdXN0JzogJzVDOTknLCAvLyBsYXJnZSBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgTWlzc2lsZSBFeHBsb3NpdmUgRm9yY2UnOiAnNUM5OCcsIC8vIHNsb3cgbW92aW5nIGhvcml6b250YWwgbWlzc2lsZXNcclxuICAgICdQYWdsdGhhbiBUaWFtYXQgRmxhbWlzcGhlcmUnOiAnNjEwRicsIC8vIHZlcnkgbG9uZyBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIEFybW9yZWQgVGVsb2RyYWdvbiBUb3J0b2lzZSBTdG9tcCc6ICc2MTRCJywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lIGZyb20gdHVydGxlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBUaHVuZGVyb3VzIEJyZWF0aCc6ICc2MTQ5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBOYWlsIFVwYnVyc3QnOiAnNjA1QicsIC8vIHNtYWxsIGFvZXMgYmVmb3JlIEJpZyBCdXJzdFxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBCaWcgQnVyc3QnOiAnNUI0OCcsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZXMgZnJvbSBuYWlsc1xyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgUGVyaWdlYW4gQnJlYXRoJzogJzVCNTknLCAvLyBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjRFJywgLy8gbWVnYWZsYXJlIHBlcHBlcm9uaVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlIERpdmUnOiAnNUI1MicsIC8vIG1lZ2FmbGFyZSBsaW5lIGFvZSBhY3Jvc3MgdGhlIGFyZW5hXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBGbGFyZSc6ICc1QjRBJywgLy8gbGFyZ2UgcHVycGxlIHNocmlua2luZyBjaXJjbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjREJywgLy8gbWVnYWZsYXJlIHNwcmVhZCBtYXJrZXJzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVRaXRhbmFSYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUWl0YW5hIFN1biBUb3NzJzogJzNDOEEnLCAvLyBHcm91bmQgQW9FLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBSb25rYW4gTGlnaHQgMSc6ICczQzhDJywgLy8gU3RhdHVlIGF0dGFjaywgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDEnOiAnM0M4RicsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBMb3phdGxcXCdzIEZ1cnkgMic6ICczQzkwJywgLy8gU2VtaWNpcmNsZSBjbGVhdmUsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgUm9jayc6ICczQzk2JywgLy8gU21hbGwgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgRmFsbGluZyBCb3VsZGVyJzogJzNDOTcnLCAvLyBMYXJnZSBncm91bmQgQW9FLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBUb3dlcmZhbGwnOiAnM0M5OCcsIC8vIFBpbGxhciBjb2xsYXBzZSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVmlwZXIgUG9pc29uIDInOiAnM0M5RScsIC8vIFN0YXRpb25hcnkgcG9pc29uIHB1ZGRsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAxJzogJzNDQTInLCAvLyBEYW5nZXJvdXMgbWlkZGxlIGR1cmluZyBzcHJlYWQgY2lyY2xlcywgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDMnOiAnM0NBNicsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggNCc6ICczQ0E3JywgLy8gRGFuZ2Vyb3VzIHNpZGVzIGR1cmluZyBzdGFjayBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDInOiAnM0Q2RCcsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIFdyYXRoIG9mIHRoZSBSb25rYSc6ICczRTJDJywgLy8gU3RhdHVlIGxpbmUgYXR0YWNrIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdRaXRhbmEgU2luc3BpdHRlcic6ICczRTM2JywgLy8gR29yaWxsYSBib3VsZGVyIHRvc3MgQW9FIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnUWl0YW5hIEhvdW5kIG91dCBvZiBIZWF2ZW4nOiAnNDJCOCcsIC8vIFRldGhlciBleHRlbnNpb24gZmFpbHVyZSwgYm9zcyB0aHJlZTsgNDJCNyBpcyBjb3JyZWN0IGV4ZWN1dGlvblxyXG4gICAgJ1FpdGFuYSBSb25rYW4gQWJ5c3MnOiAnNDNFQicsIC8vIEdyb3VuZCBBb0UgZnJvbSBtaW5pLWJvc3NlcyBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAxJzogJzNDOUQnLCAvLyBBb0UgZnJvbSB0aGUgMDBBQiBwb2lzb24gaGVhZCBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAyJzogJzNDQTMnLCAvLyBPdmVybGFwcGVkIGNpcmNsZXMgZmFpbHVyZSBvbiB0aGUgc3ByZWFkIGNpcmNsZXMgdmVyc2lvbiBvZiB0aGUgbWVjaGFuaWNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGhlIEdyYW5kIENvc21vc1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlR3JhbmRDb3Ntb3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0Nvc21vcyBJcm9uIEp1c3RpY2UnOiAnNDkxRicsXHJcbiAgICAnQ29zbW9zIFNtaXRlIE9mIFJhZ2UnOiAnNDkyMScsXHJcblxyXG4gICAgJ0Nvc21vcyBUcmlidWxhdGlvbic6ICc0OUE0JyxcclxuICAgICdDb3Ntb3MgRGFyayBTaG9jayc6ICc0NzZGJyxcclxuICAgICdDb3Ntb3MgU3dlZXAnOiAnNDc3MCcsXHJcbiAgICAnQ29zbW9zIERlZXAgQ2xlYW4nOiAnNDc3MScsXHJcblxyXG4gICAgJ0Nvc21vcyBTaGFkb3cgQnVyc3QnOiAnNDkyNCcsXHJcbiAgICAnQ29zbW9zIEJsb29keSBDYXJlc3MnOiAnNDkyNycsXHJcbiAgICAnQ29zbW9zIE5lcGVudGhpYyBQbHVuZ2UnOiAnNDkyOCcsXHJcbiAgICAnQ29zbW9zIEJyZXdpbmcgU3Rvcm0nOiAnNDkyOScsXHJcblxyXG4gICAgJ0Nvc21vcyBPZGUgVG8gRmFsbGVuIFBldGFscyc6ICc0OTUwJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgR3JvdW5kJzogJzQyNzMnLFxyXG5cclxuICAgICdDb3Ntb3MgRmlyZSBCcmVhdGgnOiAnNDkyQicsXHJcbiAgICAnQ29zbW9zIFJvbmthbiBGcmVlemUnOiAnNDkyRScsXHJcbiAgICAnQ29zbW9zIE92ZXJwb3dlcic6ICc0OTJEJyxcclxuXHJcbiAgICAnQ29zbW9zIFNjb3JjaGluZyBMZWZ0JzogJzQ3NjMnLFxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgUmlnaHQnOiAnNDc2MicsXHJcbiAgICAnQ29zbW9zIE90aGVyd29yZGx5IEhlYXQnOiAnNDc1QycsXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIElyZSc6ICc0NzYxJyxcclxuICAgICdDb3Ntb3MgUGx1bW1ldCc6ICc0NzY3JyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIERvbWFpbiBUZXRoZXInOiAnNDc1RicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3Ntb3MgRGFyayBXZWxsJzogJzQ3NkQnLFxyXG4gICAgJ0Nvc21vcyBGYXIgV2luZCBTcHJlYWQnOiAnNDcyNCcsXHJcbiAgICAnQ29zbW9zIEJsYWNrIEZsYW1lJzogJzQ3NUQnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4nOiAnNDc2MCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUd2lubmluZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVHdpbm5pbmcgQXV0byBDYW5ub25zJzogJzQzQTknLFxyXG4gICAgJ1R3aW5uaW5nIEhlYXZlJzogJzNEQjknLFxyXG4gICAgJ1R3aW5uaW5nIDMyIFRvbnplIFN3aXBlJzogJzNEQkInLFxyXG4gICAgJ1R3aW5uaW5nIFNpZGVzd2lwZSc6ICczREJGJyxcclxuICAgICdUd2lubmluZyBXaW5kIFNwb3V0JzogJzNEQkUnLFxyXG4gICAgJ1R3aW5uaW5nIFNob2NrJzogJzNERjEnLFxyXG4gICAgJ1R3aW5uaW5nIExhc2VyYmxhZGUnOiAnM0RFQycsXHJcbiAgICAnVHdpbm5pbmcgVm9ycGFsIEJsYWRlJzogJzNEQzInLFxyXG4gICAgJ1R3aW5uaW5nIFRocm93biBGbGFtZXMnOiAnM0RDMycsXHJcbiAgICAnVHdpbm5pbmcgTWFnaXRlayBSYXknOiAnM0RGMycsXHJcbiAgICAnVHdpbm5pbmcgSGlnaCBHcmF2aXR5JzogJzNERkEnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1R3aW5uaW5nIDEyOCBUb256ZSBTd2lwZSc6ICczREJBJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBEZWFkIElyb24gNUFCMCAoZWFydGhzaGFrZXJzLCBidXQgb25seSBpZiB5b3UgdGFrZSB0d28/KVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHVicnVtUmVnaW5hZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmN5IEZvdXJmb2xkJzogJzVCMzQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBTd2F0aGUnOiAnNUFCNCcsIC8vIEdyb3VuZCBhb2UgdG8gZWl0aGVyIHNpZGUgb2YgYm9zc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBCYWxlZnVsIEJsYWRlJzogJzVCMjgnLCAvLyBIaWRlIGJlaGluZCBwaWxsYXJzIGF0dGFja1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUE0JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMic6ICc1QUE1JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMyc6ICc1QUE2JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDEnOiAnNUFBNycsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMic6ICc1QUE4JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAzJzogJzVBQTknLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBTY29yY2hpbmcgU2hhY2tsZSc6ICc1QUFFJywgLy8gQ2hhaW4gZGFtYWdlXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUFCJywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgQmxvb21zJzogJzVBQUQnLCAvLyBQdXJwbGUgZ3Jvd2luZyBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSc6ICc1NzYxJywgLy8gUmlnaHQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSc6ICc1NzYyJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZpcmVicmVhdGhlJzogJzU3NjUnLCAvLyBDb25hbCBicmVhdGhcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZpcmVicmVhdGhlIFJvdGF0aW5nJzogJzU3NUEnLCAvLyBDb25hbCBicmVhdGgsIHJvdGF0aW5nXHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWFkIERvd24nOiAnNTc1NicsIC8vIGxpbmUgYW9lIGNoYXJnZSBmcm9tIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBIdW50ZXJcXCdzIENsYXcnOiAnNTc1NycsIC8vIGNpcmN1bGFyIGdyb3VuZCBhb2UgY2VudGVyZWQgb24gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZhbGxpbmcgUm9jayc6ICc1NzVDJywgLy8gZ3JvdW5kIGFvZSBmcm9tIFJldmVyYmVyYXRpbmcgUm9hclxyXG4gICAgJ0RlbHVicnVtIERhaHUgSG90IENoYXJnZSc6ICc1NzY0JywgLy8gZG91YmxlIGNoYXJnZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgUmlwcGVyIENsYXcnOiAnNTc1RCcsIC8vIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBUYWlsIFN3aW5nJzogJzU3NUYnLCAvLyB0YWlsIHN3aW5nIDspXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgUGF3biBPZmYnOiAnNTgwNicsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAxJzogJzU4MEQnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDInOiAnNTgwRScsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1ODBGJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTdGMycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHNoaWVsZCBnZXQgdW5kZXJcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTdGMicsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXRcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBDb3VudGVycGxheSc6ICc1N0Y2JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMSc6ICc1N0E5JywgLy8gSW5pdGlhbCBwaGFudG9tIGRvbnV0IGFvZSBmcm9tIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDInOiAnNTdBQScsIC8vIE1vdmluZyBwaGFudG9tIGRvbnV0IGFvZXMgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIENyZWVwaW5nIE1pYXNtYSc6ICc1N0E1JywgLy8gcGhhbnRvbSBsaW5lIGFvZSBmcm9tIHNxdWFyZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gVmlsZSBXYXZlJzogJzU3QjEnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NzMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYXNodmFuZSc6ICc1OTcyJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk3MScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5NjgnLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NzQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlCQicsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5QkQnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgRW5kIDEnOiAnNTlCQScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAyJzogJzU5QkMnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlDNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCc6ICc1QjgzJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUJGJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAxJzogJzU5RTAnLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAyJzogJzU5RTEnLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAzJzogJzU5RTInLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFBhd24gT2ZmJzogJzU5REEnLCAvLyBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZSBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU5Q0UnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyIGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUNDJywgLy8gUXVlZW4ncyBLbmlnaHQgc3dvcmQgZ2V0IG91dCBkdXJpbmcgUXVlZW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bSBIaWRkZW4gVHJhcCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1QTZFJywgLy8gZXhwbG9zaW9uIHRyYXBcclxuICAgICdEZWx1YnJ1bSBIaWRkZW4gVHJhcCBQb2lzb24gVHJhcCc6ICc1QTZGJywgLy8gcG9pc29uIHRyYXBcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgSGVhdCBTaG9jayc6ICc1OTVFJywgLy8gdG9vIG11Y2ggaGVhdCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIENvbGQgU2hvY2snOiAnNTk1RicsIC8vIHRvbyBtdWNoIGNvbGQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWF0IEJyZWF0aCc6ICc1NzY2JywgLy8gdGFuayBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgV3JhdGggT2YgQm96amEnOiAnNTk3NScsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEF0IGxlYXN0IGR1cmluZyBUaGUgUXVlZW4sIHRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5LFxyXG4gICAgICAvLyBhbmQgdGhlIGZpcnN0IGV4cGxvc2lvbiBcImhpdHNcIiBldmVyeW9uZSwgYWx0aG91Z2ggd2l0aCBcIjFCXCIgZmxhZ3MuXHJcbiAgICAgIGlkOiAnRGVsdWJydW0gTG90cyBDYXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NjVBJywgJzU2NUInLCAnNTdGRCcsICc1N0ZFJywgJzVCODYnLCAnNUI4NycsICc1OUQyJywgJzVEOTMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBEYWh1IDU3NzYgU3BpdCBGbGFtZSBzaG91bGQgYWx3YXlzIGhpdCBhIE1hcmNob3NpYXNcclxuLy8gVE9ETzogaGl0dGluZyBwaGFudG9tIHdpdGggaWNlIHNwaWtlcyB3aXRoIGFueXRoaW5nIGJ1dCBkaXNwZWw/XHJcbi8vIFRPRE86IGZhaWxpbmcgaWN5L2ZpZXJ5IHBvcnRlbnQgKGd1YXJkIGFuZCBxdWVlbilcclxuLy8gICAgICAgYDE4OlB5cmV0aWMgRG9UIFRpY2sgb24gJHtuYW1lfSBmb3IgJHtkYW1hZ2V9IGRhbWFnZS5gXHJcbi8vIFRPRE86IFdpbmRzIE9mIEZhdGUgLyBXZWlnaHQgT2YgRm9ydHVuZT9cclxuLy8gVE9ETzogVHVycmV0J3MgVG91cj9cclxuLy8gZ2VuZXJhbCB0cmFwczogZXhwbG9zaW9uOiA1QTcxLCBwb2lzb24gdHJhcDogNUE3MiwgbWluaTogNUE3M1xyXG4vLyBkdWVsIHRyYXBzOiBtaW5pOiA1N0ExLCBpY2U6IDU3OUYsIHRvYWQ6IDU3QTBcclxuLy8gVE9ETzogdGFraW5nIG1hbmEgZmxhbWUgd2l0aG91dCByZWZsZWN0XHJcbi8vIFRPRE86IHRha2luZyBNYWVsc3Ryb20ncyBCb2x0IHdpdGhvdXQgbGlnaHRuaW5nIGJ1ZmZcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgSGVsbGlzaCBTbGFzaCc6ICc1N0VBJywgLy8gQm96amFuIFNvbGRpZXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNsaW1lcyBWaXNjb3VzIFJ1cHR1cmUnOiAnNTAxNicsIC8vIEZ1bGx5IG1lcmdlZCB2aXNjb3VzIHNsaW1lIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgR29sZW1zIERlbW9saXNoJzogJzU4ODAnLCAvLyBpbnRlcnJ1cHRpYmxlIFJ1aW5zIEdvbGVtIGNhc3RcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBRDEnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjJBJywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFDQicsIC8vIENoYWluc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAxJzogJzVCOTQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMic6ICc1QUI5JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDMnOiAnNUFCQScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCA0JzogJzVBQkInLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNSc6ICc1QUJDJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUM4JywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBDb21ldCc6ICc1QUQ3JywgLy8gQ2xvbmUgbWV0ZW9yIGRyb3BwaW5nIGJlZm9yZSBjaGFyZ2VzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgRmlyZXN0b3JtJzogJzVBRDgnLCAvLyBDbG9uZSBjaGFyZ2UgYWZ0ZXIgQmFsZWZ1bCBDb21ldFxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFJvc2UnOiAnNUFEOScsIC8vIENsb25lIGxpbmUgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUMxJywgLy8gQmx1ZSByaW4gZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFDMicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFDMycsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQzQnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFDNScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUM2JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQWN0IE9mIE1lcmN5JzogJzVBQ0YnLCAvLyBjcm9zcy1zaGFwZWQgbGluZSBhb2VzXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc3MCcsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MicsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUgMSc6ICc1NzZGJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MScsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSc6ICc1Nzc0JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzZDJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSGVhZCBEb3duJzogJzU3NjgnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NjknLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGYWxsaW5nIFJvY2snOiAnNTc2RScsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc3MycsIC8vIGRvdWJsZSBjaGFyZ2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1NzlFJywgLy8gYm9tYnMgYmVpbmcgY2xlYXJlZFxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgVmljaW91cyBTd2lwZSc6ICc1Nzk3JywgLy8gY2lyY3VsYXIgYW9lIGFyb3VuZCBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGb2N1c2VkIFRyZW1vciAxJzogJzU3OEYnLCAvLyBzcXVhcmUgZmxvb3IgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMic6ICc1NzkxJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIERldm91cic6ICc1Nzg5JywgLy8gY29uYWwgYW9lIGFmdGVyIHdpdGhlcmluZyBjdXJzZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDEnOiAnNTc4QycsIC8vIGluaXRpYWwgcm90YXRpbmcgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGbGFpbGluZyBTdHJpa2UgMic6ICc1NzhEJywgLy8gcm90YXRpbmcgY2xlYXZlc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTd29yZCc6ICc1ODE5JywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgT2ZmZW5zaXZlIFNoaWVsZCc6ICc1ODFBJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1ODE2JywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1ODE3JywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1ODE4JywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFVubHVja3kgTG90JzogJzU4MUQnLCAvLyBRdWVlbidzIEtuaWdodCBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAxJzogJzU4M0QnLCAvLyBzbWFsbCBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBCdXJuIDInOiAnNTgzRScsIC8vIGxhcmdlIGZpcmUgYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFBhd24gT2ZmJzogJzU4M0EnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDEnOiAnNTg0NycsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDFcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDInOiAnNTg0OCcsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDMnOiAnNTg0OScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBzZWNvbmQgbGluZXNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBDb3VudGVycGxheSc6ICc1OEY1JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdCOCcsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QjknLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMSc6ICc1N0I0JywgLy8gSW5pdGlhbCBwaGFudG9tIGxpbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMic6ICc1N0I1JywgLy8gTGF0ZXIgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAxJzogJzU3QjYnLCAvLyBJbml0aWFsIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAyJzogJzU3QjcnLCAvLyBNb3ZpbmcgcGhhbnRvbSBjaXJjbGUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCRicsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NEMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYXNodmFuZSc6ICc1OTRCJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk0QScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5MzknLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NEQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgV2hhY2snOiAnNTdEMCcsIC8vIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRGV2YXN0YXRpbmcgQm9sdCAxJzogJzU3QzUnLCAvLyBsaWdodG5pbmcgcmluZ3NcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMic6ICc1N0M2JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBFbGVjdHJvY3V0aW9uJzogJzU3Q0MnLCAvLyByYW5kb20gY2lyY2xlIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFJhcGlkIEJvbHRzJzogJzU3QzMnLCAvLyBkcm9wcGVkIGxpZ2h0bmluZyBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCAxMTExLVRvbnplIFN3aW5nJzogJzU3RDgnLCAvLyB2ZXJ5IGxhcmdlIFwiZ2V0IG91dFwiIHN3aW5nXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBNb25rIEF0dGFjayc6ICc1NUE2JywgLy8gTW9uayBhZGQgYXV0by1hdHRhY2tcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUY0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUU3JywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlFQScsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUU4JywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDInOiAnNTlFOScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNUEwMicsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNUEwMycsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDEnOiAnNTlGMicsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQgMic6ICc1Qjg1JywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQgMSc6ICc1OUYxJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDInOiAnNUI4NCcsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBQYXduIE9mZic6ICc1QTFEJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5RkYnLCAvLyBPcHRpbWFsIFBsYXkgU3dvcmQgXCJnZXQgb3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzVBMDAnLCAvLyBPcHRpbWFsIHBsYXkgc2hpZWxkIFwiZ2V0IGluXCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgQ2xlYXZlJzogJzVBMDEnLCAvLyBPcHRpbWFsIFBsYXkgY2xlYXZlcyBmb3Igc3dvcmQvc2hpZWxkXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzVBMjgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzVBMkEnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzVBMjknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEhlYXQgU2hvY2snOiAnNTkyNycsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBDb2xkIFNob2NrJzogJzU5MjgnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUVCJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEd1bm5oaWxkclxcJ3MgQmxhZGVzJzogJzVCMjInLCAvLyBub3QgYmVpbmcgaW4gdGhlIGNoZXNzIGJsdWUgc2FmZSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBVbmx1Y2t5IExvdCc6ICc1NUI2JywgLy8gbGlnaHRuaW5nIG9yYiBhdHRhY2tcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5IGFuZCBcImhpdFwiIHBlb3BsZSB3aGVuIGxldml0YXRpbmcuXHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR3VhcmQgTG90cyBDYXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1ODI3JywgJzU4MjgnLCAnNUI2QycsICc1QjZEJywgJzVCQjYnLCAnNUJCNycsICc1Qjg4JywgJzVCODknXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR29sZW0gQ29tcGFjdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU3NDYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IGAke21hdGNoZXMuc291cmNlfTogJHttYXRjaGVzLmFiaWxpdHl9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEZWx1YnJ1bVNhdiBTbGltZSBTYW5ndWluZSBGdXNpb24nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NTREJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVJlc3VycmVjdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTFOIEVkZW5cXCdzIFRodW5kZXIgSUlJJzogJzQ0RUQnLFxyXG4gICAgJ0UxTiBFZGVuXFwncyBCbGl6emFyZCBJSUknOiAnNDRFQycsXHJcbiAgICAnRTFOIFB1cmUgQmVhbSc6ICczRDlFJyxcclxuICAgICdFMU4gUGFyYWRpc2UgTG9zdCc6ICczREEwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMU4gRWRlblxcJ3MgRmxhcmUnOiAnM0Q5NycsXHJcbiAgICAnRTFOIFB1cmUgTGlnaHQnOiAnM0RBMycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMU4gRmlyZSBJSUknOiAnNDRFQicsXHJcbiAgICAnRTFOIFZpY2UgT2YgVmFuaXR5JzogJzQ0RTcnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxTiBWaWNlIE9mIEFwYXRoeSc6ICc0NEU4JywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogZmFpbGluZyB0byBpbnRlcnJ1cHQgTWFuYSBCb29zdCAoM0Q4RClcclxuLy8gVE9ETzogZmFpbGluZyB0byBwYXNzIGhlYWxlciBkZWJ1ZmY/XHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UgZG9uJ3Qga2lsbCBhIG1ldGVvciBkdXJpbmcgZm91ciBvcmJzP1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMVMgRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRGNycsXHJcbiAgICAnRTFTIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEY2JyxcclxuICAgICdFMVMgRWRlblxcJ3MgUmVnYWluZWQgQmxpenphcmQgSUlJJzogJzQ0RkEnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAxJzogJzNEODMnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAyJzogJzNEODQnLFxyXG4gICAgJ0UxUyBQYXJhZGlzZSBMb3N0JzogJzNEODcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBGbGFyZSc6ICczRDczJyxcclxuICAgICdFMVMgUHVyZSBMaWdodCc6ICczRDhBJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxUyBGaXJlL1RodW5kZXIgSUlJJzogJzQ0RkInLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gU2luZ2xlJzogJzNEODEnLFxyXG4gICAgJ0UxUyBWaWNlIE9mIFZhbml0eSc6ICc0NEYxJywgLy8gdGFuayBsYXNlcnNcclxuICAgICdFMVMgVmljZSBvZiBBcGF0aHknOiAnNDRGMicsIC8vIGRwcyBwdWRkbGVzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogc2hhZG93ZXllIGZhaWx1cmUgKHRvcCBsaW5lIGZhaWwsIGJvdHRvbSBsaW5lIHN1Y2Nlc3MsIGVmZmVjdCB0aGVyZSB0b28pXHJcbi8vIFsxNjoxNzozNS45NjZdIDE2OjQwMDExMEZFOlZvaWR3YWxrZXI6NDBCNzpTaGFkb3dleWU6MTA2MTIzNDU6VGluaSBQb3V0aW5pOkY6MTAwMDA6MTAwMTkwRjpcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDY3ODkwQTpQb3RhdG8gQ2hpcHB5OjE6MDoxQzo4MDAwOlxyXG4vLyBnYWlucyB0aGUgZWZmZWN0IG9mIFBldHJpZmljYXRpb24gZnJvbSBWb2lkd2Fsa2VyIGZvciAxMC4wMCBTZWNvbmRzLlxyXG4vLyBUT0RPOiBwdWRkbGUgZmFpbHVyZT9cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZURlc2NlbnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UyTiBEb29tdm9pZCBTbGljZXInOiAnM0UzQycsXHJcbiAgICAnRTJOIERvb212b2lkIEd1aWxsb3RpbmUnOiAnM0UzQicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyTiBOeXgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0UzRCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlXHJcbi8vIFRPRE86IEVtcHR5IEhhdGUgKDNFNTkvM0U1QSkgaGl0cyBldmVyeWJvZHksIHNvIGhhcmQgdG8gdGVsbCBhYm91dCBrbm9ja2JhY2tcclxuLy8gVE9ETzogbWF5YmUgbWFyayBoZWxsIHdpbmQgcGVvcGxlIHdobyBnb3QgY2xpcHBlZCBieSBzdGFjaz9cclxuLy8gVE9ETzogbWlzc2luZyBwdWRkbGVzP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGxpZ2h0L2RhcmsgY2lyY2xlIHN0YWNrXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVEZXNjZW50U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMlMgRG9vbXZvaWQgU2xpY2VyJzogJzNFNTAnLFxyXG4gICAgJ0UzUyBFbXB0eSBSYWdlJzogJzNFNkMnLFxyXG4gICAgJ0UzUyBEb29tdm9pZCBHdWlsbG90aW5lJzogJzNFNEYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIENsZWF2ZXInOiAnM0U2NCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyUyBTaGFkb3dleWUnLFxyXG4gICAgICAvLyBTdG9uZSBDdXJzZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTg5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UyUyBOeXgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0U1MScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAxJzogJzNGQ0EnLFxyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM04gTWFlbHN0cm9tJzogJzNGRDknLFxyXG4gICAgJ0UzTiBTd2lybGluZyBUc3VuYW1pJzogJzNGRDUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGQ0UnLFxyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGQ0QnLFxyXG4gICAgJ0UzTiBTcGlubmluZyBEaXZlJzogJzNGREInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTNOIFJpcCBDdXJyZW50JzogJzNGQzcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBTY291cmluZyBUc3VuYW1pICgzQ0UwKSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhcmdldFxyXG4vLyBUT0RPOiBTd2VlcGluZyBUc3VuYW1pICgzRkY1KSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhbmtzXHJcbi8vIFRPRE86IFJpcCBDdXJyZW50ICgzRkUwLCAzRkUxKSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhcmdldC90YW5rc1xyXG4vLyBUT0RPOiBCb2lsZWQgQWxpdmUgKDQwMDYpIGlzIGZhaWxpbmcgcHVkZGxlcz8/P1xyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGNsZWFuc2UgU3BsYXNoaW5nIFdhdGVyc1xyXG4vLyBUT0RPOiBkb2VzIGdldHRpbmcgaGl0IGJ5IHVuZGVyc2VhIHF1YWtlIGNhdXNlIGFuIGFiaWxpdHk/XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVJbnVuZGF0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFM1MgTW9uc3RlciBXYXZlIDEnOiAnM0ZFNScsXHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAyJzogJzNGRTknLFxyXG4gICAgJ0UzUyBNYWVsc3Ryb20nOiAnM0ZGQicsXHJcbiAgICAnRTNTIFN3aXJsaW5nIFRzdW5hbWknOiAnM0ZGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDEnOiAnM0ZFQScsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDInOiAnM0ZFQicsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDMnOiAnM0ZFQycsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDQnOiAnM0ZFRCcsXHJcbiAgICAnRTNTIFNwaW5uaW5nIERpdmUnOiAnM0ZGRCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVTZXB1bHR1cmUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U0TiBXZWlnaHQgb2YgdGhlIExhbmQnOiAnNDBFQicsXHJcbiAgICAnRTROIEV2aWwgRWFydGgnOiAnNDBFRicsXHJcbiAgICAnRTROIEFmdGVyc2hvY2sgMSc6ICc0MUI0JyxcclxuICAgICdFNE4gQWZ0ZXJzaG9jayAyJzogJzQwRjAnLFxyXG4gICAgJ0U0TiBFeHBsb3Npb24gMSc6ICc0MEVEJyxcclxuICAgICdFNE4gRXhwbG9zaW9uIDInOiAnNDBGNScsXHJcbiAgICAnRTROIExhbmRzbGlkZSc6ICc0MTFCJyxcclxuICAgICdFNE4gUmlnaHR3YXJkIExhbmRzbGlkZSc6ICc0MTAwJyxcclxuICAgICdFNE4gTGVmdHdhcmQgTGFuZHNsaWRlJzogJzQwRkYnLFxyXG4gICAgJ0U0TiBNYXNzaXZlIExhbmRzbGlkZSc6ICc0MEZDJyxcclxuICAgICdFNE4gU2Vpc21pYyBXYXZlJzogJzQwRjMnLFxyXG4gICAgJ0U0TiBGYXVsdCBMaW5lJzogJzQxMDEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIHBlb3BsZSBnZXQgaGl0dGluZyBieSBtYXJrZXJzIHRoZXkgc2hvdWxkbid0XHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YW5rcyBnZXR0aW5nIGhpdCBieSB0YW5rYnVzdGVycywgbWVnYWxpdGhzXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YXJnZXQgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlclxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNFMgV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQxMDgnLFxyXG4gICAgJ0U0UyBFdmlsIEVhcnRoJzogJzQxMEMnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDEnOiAnNDFCNScsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMic6ICc0MTBEJyxcclxuICAgICdFNFMgRXhwbG9zaW9uJzogJzQxMEEnLFxyXG4gICAgJ0U0UyBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTRTIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDExRCcsXHJcbiAgICAnRTRTIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MTFDJyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMSc6ICc0MTE4JyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMic6ICc0MTE5JyxcclxuICAgICdFNFMgU2Vpc21pYyBXYXZlJzogJzQxMTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMSc6ICc0MTM1JyxcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDInOiAnNDY4NycsXHJcbiAgICAnRTRTIFBsYXRlIEZyYWN0dXJlJzogJzQzRUEnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMSc6ICc0M0NBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDInOiAnNDNDOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+OCv+OCpOOCv+ODsycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfms7DlnaYnIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn7YOA7J207YOEJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmF1bHRMaW5lVGFyZ2V0ID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQxMUUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuZmF1bHRMaW5lVGFyZ2V0ICE9PSBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdSdW4gT3ZlcicsXHJcbiAgICAgICAgICAgIGRlOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSDDqWNyYXPDqShlKScsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VGdWxtaW5hdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTVOIEltcGFjdCc6ICc0RTNBJywgLy8gU3RyYXRvc3BlYXIgbGFuZGluZyBBb0VcclxuICAgICdFNU4gTGlnaHRuaW5nIEJvbHQnOiAnNEI5QycsIC8vIFN0b3JtY2xvdWQgc3RhbmRhcmQgYXR0YWNrXHJcbiAgICAnRTVOIEdhbGxvcCc6ICc0Qjk3JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1TiBTaG9jayBTdHJpa2UnOiAnNEJBMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNU4gVm9sdCBTdHJpa2UnOiAnNENGMicsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNU4gSnVkZ21lbnQgSm9sdCc6ICc0QjhGJywgLy8gU3RyYXRvc3BlYXIgZXhwbG9zaW9uc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gYSBwbGF5ZXIgZ2V0cyA0KyBzdGFja3Mgb2Ygb3Jicy4gRG9uJ3QgYmUgZ3JlZWR5IVxyXG4gICAgICBpZDogJ0U1TiBTdGF0aWMgQ29uZGVuc2F0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSGVscGVyIGZvciBvcmIgcGlja3VwIGZhaWx1cmVzXHJcbiAgICAgIGlkOiAnRTVOIE9yYiBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEI5QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKG5vIG9yYilgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoa2VpbiBPcmIpYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHBhcyBkJ29yYmUpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+eOieeEoeOBlylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5rKh5ZCD55CDKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPSBkYXRhLmNsb3VkTWFya2VycyB8fCBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNU4gVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIGRhdGEuY2xvdWRNYXJrZXJzKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBkYXRhLmNsb3VkTWFya2Vyc1ttXSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChjbG91ZHMgdG9vIGNsb3NlKWAsXHJcbiAgICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKFdvbGtlbiB6dSBuYWhlKWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKG51YWdlcyB0cm9wIHByb2NoZXMpYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zuy6L+R44GZ44GOKWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+S6kemHjeWPoClgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAzMCwgLy8gU3Rvcm1jbG91ZHMgcmVzb2x2ZSB3ZWxsIGJlZm9yZSB0aGlzLlxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGlzIHRoZXJlIGEgZGlmZmVyZW50IGFiaWxpdHkgaWYgdGhlIHNoaWVsZCBkdXR5IGFjdGlvbiBpc24ndCB1c2VkIHByb3Blcmx5P1xyXG4vLyBUT0RPOiBpcyB0aGVyZSBhbiBhYmlsaXR5IGZyb20gUmFpZGVuICh0aGUgYmlyZCkgaWYgeW91IGdldCBlYXRlbj9cclxuLy8gVE9ETzogbWF5YmUgY2hhaW4gbGlnaHRuaW5nIHdhcm5pbmcgaWYgeW91IGdldCBoaXQgd2hpbGUgeW91IGhhdmUgc3lzdGVtIHNob2NrICg4QjgpXHJcblxyXG5jb25zdCBub09yYiA9IChzdHIpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKG5vIG9yYiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gT3JiKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRcXCdvcmJlKScsXHJcbiAgICBqYTogc3RyICsgJyAo6Zu3546J54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5ZCD55CDKScsXHJcbiAgICBrbzogc3RyICsgJyAo6rWs7IqsIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1bG1pbmF0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNVMgSW1wYWN0JzogJzRFM0InLCAvLyBTdHJhdG9zcGVhciBsYW5kaW5nIEFvRVxyXG4gICAgJ0U1UyBHYWxsb3AnOiAnNEJCNCcsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNVMgU2hvY2sgU3RyaWtlJzogJzRCQzEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVTIFN0ZXBwZWQgTGVhZGVyIFR3aXN0ZXInOiAnNEJDNycsIC8vIFR3aXN0ZXIgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgRG9udXQnOiAnNEJDOCcsIC8vIERvbnV0IHN0ZXBwZWQgbGVhZGVyXHJcbiAgICAnRTVTIFNob2NrJzogJzRFM0QnLCAvLyBIYXRlZCBvZiBMZXZpbiBTdG9ybWNsb3VkLWNsZWFuc2FibGUgZXhwbG9kaW5nIGRlYnVmZlxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U1UyBKdWRnbWVudCBKb2x0JzogJzRCQTcnLCAvLyBTdHJhdG9zcGVhciBleHBsb3Npb25zXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFNVMgVm9sdCBTdHJpa2UgRG91YmxlJzogJzRCQzMnLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVTIENyaXBwbGluZyBCbG93JzogJzRCQ0EnLFxyXG4gICAgJ0U1UyBDaGFpbiBMaWdodG5pbmcgRG91YmxlJzogJzRCQzUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSGVscGVyIGZvciBvcmIgcGlja3VwIGZhaWx1cmVzXHJcbiAgICAgIGlkOiAnRTVTIE9yYiBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCNycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBWb2x0IFN0cmlrZSBPcmInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJDMycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEZWFkbHkgRGlzY2hhcmdlIEJpZyBLbm9ja2JhY2snLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBMaWdodG5pbmcgQm9sdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gSGF2aW5nIGEgbm9uLWlkZW1wb3RlbnQgY29uZGl0aW9uIGZ1bmN0aW9uIGlzIGEgYml0IDxfPFxyXG4gICAgICAgIC8vIE9ubHkgY29uc2lkZXIgbGlnaHRuaW5nIGJvbHQgZGFtYWdlIGlmIHlvdSBoYXZlIGEgZGVidWZmIHRvIGNsZWFyLlxyXG4gICAgICAgIGlmICghZGF0YS5oYXRlZCB8fCAhZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgZGVsZXRlIGRhdGEuaGF0ZWRbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgSGF0ZWQgb2YgTGV2aW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMEQyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGF0ZWQgPSBkYXRhLmhhdGVkIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGF0ZWRbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFN0b3JtY2xvdWQgVGFyZ2V0IFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2VycyA9IGRhdGEuY2xvdWRNYXJrZXJzIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBhYmlsaXR5IGlzIHNlZW4gb25seSBpZiBwbGF5ZXJzIHN0YWNrZWQgdGhlIGNsb3VkcyBpbnN0ZWFkIG9mIHNwcmVhZGluZyB0aGVtLlxyXG4gICAgICBpZDogJ0U1UyBUaGUgUGFydGluZyBDbG91ZHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAzMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IG0gb2YgZGF0YS5jbG91ZE1hcmtlcnMpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgICAgYmxhbWU6IGRhdGEuY2xvdWRNYXJrZXJzW21dLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICAvLyBTdG9ybWNsb3VkcyByZXNvbHZlIHdlbGwgYmVmb3JlIHRoaXMuXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5jbG91ZE1hcmtlcnM7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuaGF0ZWQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U2TiBUaG9ybnMnOiAnNEJEQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZOIEZlcm9zdG9ybSAxJzogJzRCREQnLFxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMic6ICc0QkU1JyxcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAxJzogJzRCRTAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAyJzogJzRCRTYnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZOIEV4cGxvc2lvbic6ICc0QkUyJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZOIEhlYXQgQnVyc3QnOiAnNEJFQycsXHJcbiAgICAnRTZOIENvbmZsYWcgU3RyaWtlJzogJzRCRUUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZOIFNwaWtlIE9mIEZsYW1lJzogJzRCRjAnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuICAgICdFNk4gUmFkaWFudCBQbHVtZSc6ICc0QkYyJyxcclxuICAgICdFNk4gRXJ1cHRpb24nOiAnNEJGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZOIFZhY3V1bSBTbGljZSc6ICc0QkQ1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2TiBEb3duYnVyc3QnOiAnNEJEQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZS4gQWN0dWFsIGtub2NrYmFjayBpcyB1bmtub3duIGFiaWxpdHkgNEMyMFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBLaWxscyBub24tdGFua3Mgd2hvIGdldCBoaXQgYnkgaXQuXHJcbiAgICAnRTZOIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRCRUQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgU2ltcGxlT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuLy8gVE9ETzogY2hlY2sgdGV0aGVycyBiZWluZyBjdXQgKHdoZW4gdGhleSBzaG91bGRuJ3QpXHJcbi8vIFRPRE86IGNoZWNrIGZvciBjb25jdXNzZWQgZGVidWZmXHJcbi8vIFRPRE86IGNoZWNrIGZvciB0YWtpbmcgdGFua2J1c3RlciB3aXRoIGxpZ2h0aGVhZGVkXHJcbi8vIFRPRE86IGNoZWNrIGZvciBvbmUgcGVyc29uIHRha2luZyBtdWx0aXBsZSBTdG9ybSBPZiBGdXJ5IFRldGhlcnMgKDRDMDEvNEMwOClcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IFNpbXBsZU9vcHN5VHJpZ2dlclNldCA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3JTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gSXQncyBjb21tb24gdG8ganVzdCBpZ25vcmUgZnV0Ym9sIG1lY2hhbmljcywgc28gZG9uJ3Qgd2FybiBvbiBTdHJpa2UgU3BhcmsuXHJcbiAgICAvLyAnU3Bpa2UgT2YgRmxhbWUnOiAnNEMxMycsIC8vIE9yYiBleHBsb3Npb25zIGFmdGVyIFN0cmlrZSBTcGFya1xyXG5cclxuICAgICdFNlMgVGhvcm5zJzogJzRCRkEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2UyBGZXJvc3Rvcm0gMSc6ICc0QkZEJyxcclxuICAgICdFNlMgRmVyb3N0b3JtIDInOiAnNEMwNicsXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QzAwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMic6ICc0QzA3JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2UyBFeHBsb3Npb24nOiAnNEMwMycsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2UyBIZWF0IEJ1cnN0JzogJzRDMUYnLFxyXG4gICAgJ0U2UyBDb25mbGFnIFN0cmlrZSc6ICc0QzEwJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2UyBSYWRpYW50IFBsdW1lJzogJzRDMTUnLFxyXG4gICAgJ0U2UyBFcnVwdGlvbic6ICc0QzE3JyxcclxuICAgICdFNlMgV2luZCBDdXR0ZXInOiAnNEMwMicsIC8vIFRldGhlci1jdXR0aW5nIGxpbmUgYW9lXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZTIFZhY3V1bSBTbGljZSc6ICc0QkY1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMSc6ICc0QkZCJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChHYXJ1ZGEpLlxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMic6ICc0QkZDJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChSYWt0YXBha3NhKS5cclxuICAgICdFNlMgTWV0ZW9yIFN0cmlrZSc6ICc0QzBGJywgLy8gRnJvbnRhbCBhdm9pZGFibGUgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U2UyBIYW5kcyBvZiBIZWxsJzogJzRDMFtCQ10nLCAvLyBUZXRoZXIgY2hhcmdlXHJcbiAgICAnRTZTIEhhbmRzIG9mIEZsYW1lJzogJzRDMEEnLCAvLyBGaXJzdCBUYW5rYnVzdGVyXHJcbiAgICAnRTZTIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRDMEUnLCAvLyBTZWNvbmQgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBCbGF6ZSc6ICc0QzFCJywgLy8gRmxhbWUgVG9ybmFkbyBDbGVhdmVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTZTIEFpciBCdW1wJzogJzRCRjknLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmNvbnN0IHdyb25nQnVmZiA9IChzdHIpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkZSBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo44OQ44OV54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5pyJQnVmZiknLFxyXG4gICAga286IHN0ciArICco67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUljb25vY2xhc20sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN3b3JkJzogJzRDNTUnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRXMgYWZ0ZXIgRmFsc2UgVHdpbGlnaHRcclxuICAgICdFN04gU3RyZW5ndGggSW4gTnVtYmVycyBEb251dCc6ICc0QzRDJywgLy8gTGFyZ2UgZG9udXQgZ3JvdW5kIEFvRXMsIGludGVybWlzc2lvblxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIDInOiAnNEM0RCcsIC8vIExhcmdlIGNpcmNsZSBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFN04gU3R5Z2lhbiBTdGFrZSc6ICc0QzMzJywgLy8gTGFzZXIgdGFuayBidXN0ZXIsIG91dHNpZGUgaW50ZXJtaXNzaW9uIHBoYXNlXHJcbiAgICAnRTVOIFNpbHZlciBTaG90JzogJzRFN0QnLCAvLyBTcHJlYWQgbWFya2VycywgaW50ZXJtaXNzaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEMzRScsICc0QzQwJywgJzRDMjInLCAnNEMzQycsICc0RTYzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzNEJywgJzRDMjMnLCAnNEM0MScsICc0QzQzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgYW4gb3JiIGR1cmluZyB0b3JuYWRvIHBoYXNlXHJcbi8vIFRPRE86IGp1bXBpbmcgaW4gdGhlIHRvcm5hZG8gZGFtYWdlPz9cclxuLy8gVE9ETzogdGFraW5nIHN1bmdyYWNlKDRDODApIG9yIG1vb25ncmFjZSg0QzgyKSB3aXRoIHdyb25nIGRlYnVmZlxyXG4vLyBUT0RPOiBzdHlnaWFuIHNwZWFyL3NpbHZlciBzcGVhciB3aXRoIHRoZSB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogdGFraW5nIGV4cGxvc2lvbiBmcm9tIHRoZSB3cm9uZyBDaGlhcm8vU2N1cm8gb3JiXHJcbi8vIFRPRE86IGhhbmRsZSA0Qzg5IFNpbHZlciBTdGFrZSB0YW5rYnVzdGVyIDJuZCBoaXQsIGFzIGl0J3Mgb2sgdG8gaGF2ZSB0d28gaW4uXHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0FzdHJhbD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXNVbWJyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdTIFNpbHZlciBTd29yZCc6ICc0QzhFJywgLy8gZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBPdmVyd2hlbG1pbmcgRm9yY2UnOiAnNEM3MycsIC8vIGFkZCBwaGFzZSBncm91bmQgYW9lXHJcbiAgICAnRTdTIFN0cmVuZ3RoIGluIE51bWJlcnMgMSc6ICc0QzcwJywgLy8gYWRkIGdldCB1bmRlclxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDInOiAnNEM3MScsIC8vIGFkZCBnZXQgb3V0XHJcbiAgICAnRTdTIFBhcGVyIEN1dCc6ICc0QzdEJywgLy8gdG9ybmFkbyBncm91bmQgYW9lc1xyXG4gICAgJ0U3UyBCdWZmZXQnOiAnNEM3NycsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXMgYWxzbz8/XHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTdTIEJldHdpeHQgV29ybGRzJzogJzRDNkInLCAvLyBwdXJwbGUgZ3JvdW5kIGxpbmUgYW9lc1xyXG4gICAgJ0U3UyBDcnVzYWRlJzogJzRDNTgnLCAvLyBibHVlIGtub2NrYmFjayBjaXJjbGUgKHN0YW5kaW5nIGluIGl0KVxyXG4gICAgJ0U3UyBFeHBsb3Npb24nOiAnNEM2RicsIC8vIGRpZG4ndCBraWxsIGFuIGFkZFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTdTIFN0eWdpYW4gU3Rha2UnOiAnNEMzNCcsIC8vIExhc2VyIHRhbmsgYnVzdGVyIDFcclxuICAgICdFN1MgU2lsdmVyIFNob3QnOiAnNEM5MicsIC8vIFNwcmVhZCBtYXJrZXJzXHJcbiAgICAnRTdTIFNpbHZlciBTY291cmdlJzogJzRDOTMnLCAvLyBJY2UgbWFya2Vyc1xyXG4gICAgJ0U3UyBDaGlhcm8gU2N1cm8gRXhwbG9zaW9uIDEnOiAnNEQxNCcsIC8vIG9yYiBleHBsb3Npb25cclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAyJzogJzREMTUnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFN1MgQWR2ZW50IE9mIExpZ2h0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QzZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBibGFtZSBjb3JyZWN0PyBkb2VzIHRoaXMgaGF2ZSBhIHRhcmdldD9cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzYyJywgJzRDNjMnLCAnNEM2NCcsICc0QzVCJywgJzRDNUYnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2NScsICc0QzY2JywgJzRDNjcnLCAnNEM1QScsICc0QzYwJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIENydXNhZGUgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA0Qzc2IGlzIHRoZSBrbm9ja2JhY2sgZGFtYWdlLCA0QzU4IGlzIHRoZSBkYW1hZ2UgZm9yIHN0YW5kaW5nIG9uIHRoZSBwdWNrLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEM3NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4TiBCaXRpbmcgRnJvc3QnOiAnNEREQicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIERyaXZpbmcgRnJvc3QnOiAnNEREQycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIEZyaWdpZCBTdG9uZSc6ICc0RTY2JywgLy8gU21hbGwgc3ByZWFkIGNpcmNsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzRFMDAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0RTAxJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIEZyaWdpZCBFcnVwdGlvbic6ICc0RTA5JywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEljaWNsZSBJbXBhY3QnOiAnNEUwQScsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBBeGUgS2ljayc6ICc0REUyJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOE4gU2N5dGhlIEtpY2snOiAnNERFMycsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOE4gUmVmbGVjdGVkIEJpdGluZyBGcm9zdCc6ICc0REZFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCc6ICc0REZGJywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIEhlYXZlbmx5IFN0cmlrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0REQ4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXN0b8OfZW4hJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gRnJvc3QgQXJtb3InLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAncnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgICAga286ICfrr7jrgYTrn6zsp5AhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHJ1c2ggaGl0dGluZyB0aGUgY3J5c3RhbFxyXG4vLyBUT0RPOiBhZGRzIG5vdCBiZWluZyBraWxsZWRcclxuLy8gVE9ETzogdGFraW5nIHRoZSBydXNoIHR3aWNlICh3aGVuIHlvdSBoYXZlIGRlYnVmZilcclxuLy8gVE9ETzogbm90IGhpdHRpbmcgdGhlIGRyYWdvbiBmb3VyIHRpbWVzIGR1cmluZyB3eXJtJ3MgbGFtZW50XHJcbi8vIFRPRE86IGRlYXRoIHJlYXNvbnMgZm9yIG5vdCBwaWNraW5nIHVwIHB1ZGRsZVxyXG4vLyBUT0RPOiBub3QgYmVpbmcgaW4gdGhlIHRvd2VyIHdoZW4geW91IHNob3VsZFxyXG4vLyBUT0RPOiBwaWNraW5nIHVwIHRvbyBtYW55IHN0YWNrc1xyXG5cclxuLy8gTm90ZTogQmFuaXNoIElJSSAoNERBOCkgYW5kIEJhbmlzaCBJaWkgRGl2aWRlZCAoNERBOSkgYm90aCBhcmUgdHlwZT0weDE2IGxpbmVzLlxyXG4vLyBUaGUgc2FtZSBpcyB0cnVlIGZvciBCYW5pc2ggKDREQTYpIGFuZCBCYW5pc2ggRGl2aWRlZCAoNERBNykuXHJcbi8vIEknbSBub3Qgc3VyZSB0aGlzIG1ha2VzIGFueSBzZW5zZT8gQnV0IGNhbid0IHRlbGwgaWYgdGhlIHNwcmVhZCB3YXMgYSBtaXN0YWtlIG9yIG5vdC5cclxuLy8gTWF5YmUgd2UgY291bGQgY2hlY2sgZm9yIFwiTWFnaWMgVnVsbmVyYWJpbGl0eSBVcFwiP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VSZWZ1bGdlbmNlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOFMgQml0aW5nIEZyb3N0JzogJzRENjYnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBEcml2aW5nIEZyb3N0JzogJzRENjcnLCAvLyBSZWFyIGNvbmUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBBeGUgS2ljayc6ICc0RDZEJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOFMgU2N5dGhlIEtpY2snOiAnNEQ2RScsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOFMgUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzREQjknLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0REJBJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIEZyaWdpZCBFcnVwdGlvbic6ICc0RDlGJywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThTIEZyaWdpZCBOZWVkbGUnOiAnNEQ5RCcsIC8vIDgtd2F5IFwiZmxvd2VyXCIgZXhwbG9zaW9uXHJcbiAgICAnRThTIEljaWNsZSBJbXBhY3QnOiAnNERBMCcsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0IDEnOiAnNERCNycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAyJzogJzREQzMnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0IDEnOiAnNERCOCcsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0IDInOiAnNERDNCcsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcblxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAxJzogJzRENzUnLCAvLyBMZWZ0IGNsZWF2ZVxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAyJzogJzRENzYnLCAvLyBSaWdodCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMyc6ICc0RDc3JywgLy8gS25vY2tiYWNrIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAxJzogJzREOTAnLCAvLyBSZWZsZWN0ZWQgbGVmdCAyXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAyJzogJzREQkInLCAvLyBSZWZsZWN0ZWQgbGVmdCAxXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAzJzogJzREQzcnLCAvLyBSZWZsZWN0ZWQgcmlnaHQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgNCc6ICc0RDkxJywgLy8gUmVmbGVjdGVkIHJpZ2h0IDFcclxuICAgICdFOFMgVHdpbiBTdGlsbG5lc3MgMSc6ICc0RDY4JyxcclxuICAgICdFOFMgVHdpbiBTdGlsbG5lc3MgMic6ICc0RDZCJyxcclxuICAgICdFOFMgVHdpbiBTaWxlbmNlIDEnOiAnNEQ2OScsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAyJzogJzRENkEnLFxyXG4gICAgJ0U4UyBBa2ggUmhhaSc6ICc0RDk5JyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAxJzogJzRENzAnLFxyXG4gICAgJ0U4UyBFbWJpdHRlcmVkIERhbmNlIDInOiAnNEQ3MScsXHJcbiAgICAnRThTIFNwaXRlZnVsIERhbmNlIDEnOiAnNEQ2RicsXHJcbiAgICAnRThTIFNwaXRlZnVsIERhbmNlIDInOiAnNEQ3MicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyBCcm9rZW4gdGV0aGVyLlxyXG4gICAgJ0U4UyBSZWZ1bGdlbnQgRmF0ZSc6ICc0REE0JyxcclxuICAgIC8vIFNoYXJlZCBvcmIsIGNvcnJlY3QgaXMgQnJpZ2h0IFB1bHNlICg0RDk1KVxyXG4gICAgJ0U4UyBCbGluZGluZyBQdWxzZSc6ICc0RDk2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0U4UyBQYXRoIG9mIExpZ2h0JzogJzREQTEnLCAvLyBQcm90ZWFuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U4UyBTaGluaW5nIEFybW9yJyxcclxuICAgICAgLy8gU3R1blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEludGVycnVwdFxyXG4gICAgICBpZDogJ0U4UyBTdG9uZXNraW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RDg1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlVW1icmEsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNTIyMycsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFRoZSBBcnQgT2YgRGFya25lc3MgMic6ICc1MjI0JywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQYXJ0aWNsZSBCZWFtJzogJzVBRkYnLCAvLyBmcm9udGFsIGNsZWF2ZSB0dXRvcmlhbCBtZWNoYW5pY1xyXG4gICAgJ0U5TiBXaWRlLUFuZ2xlIFBoYXNlcic6ICc1NUUxJywgLy8gd2lkZS1hbmdsZSBcInNpZGVzXCJcclxuICAgICdFOU4gQmFkIFZpYnJhdGlvbnMnOiAnNTVFNicsIC8vIHRldGhlcmVkIG91dHNpZGUgZ2lhbnQgdHJlZSBncm91bmQgYW9lc1xyXG4gICAgJ0U5TiBFYXJ0aC1TaGF0dGVyaW5nIFBhcnRpY2xlIEJlYW0nOiAnNTIyNScsIC8vIG1pc3NpbmcgdG93ZXJzP1xyXG4gICAgJ0U5TiBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJzogJzU1REMnLCAvLyBcImdldCBvdXRcIiBkdXJpbmcgcGFuZWxzXHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDInOiAnNTVEQicsIC8vIENsb25lIGxpbmUgYW9lcyB3LyBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTlOIFdpdGhkcmF3JzogJzU1MzQnLCAvLyBTbG93IHRvIGJyZWFrIHNlZWQgY2hhaW4sIGdldCBzdWNrZWQgYmFjayBpbiB5aWtlc1xyXG4gICAgJ0U5TiBBZXRoZXJvc3ludGhlc2lzJzogJzU1MzUnLCAvLyBTdGFuZGluZyBvbiBzZWVkcyBkdXJpbmcgZXhwbG9zaW9uIChwb3NzaWJseSB2aWEgV2l0aGRyYXcpXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFOU4gWmVyby1Gb3JtIFBhcnRpY2xlIEJlYW0gMSc6ICc1NUVCJywgLy8gdGFuayBsYXNlciB3aXRoIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IDU2MUQgRXZpbCBTZWVkIGhpdHMgZXZlcnlvbmUsIGhhcmQgdG8ga25vdyBpZiB0aGVyZSdzIGEgZG91YmxlIHRhcFxyXG4vLyBUT0RPOiBmYWxsaW5nIHRocm91Z2ggcGFuZWwganVzdCBkb2VzIGRhbWFnZSB3aXRoIG5vIGFiaWxpdHkgbmFtZSwgbGlrZSBhIGRlYXRoIHdhbGxcclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBqdW1wIGluIHNlZWQgdGhvcm5zP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOVMgQmFkIFZpYnJhdGlvbnMnOiAnNTYxQycsIC8vIHRldGhlcmVkIG91dHNpZGUgZ2lhbnQgdHJlZSBncm91bmQgYW9lc1xyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUIwMCcsIC8vIGFudGktYWlyIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBoYXNlciBVbmxpbWl0ZWQnOiAnNTYwRScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlTIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNUIwMScsIC8vIHdpZGUtYW5nbGUgXCJvdXRcIlxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDEnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDInLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNUE5NScsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgMic6ICc1QTk2JywgLy8gYm9zcyBsZWZ0LXJpZ2h0IHN1bW1vbi9wYW5lbCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAxJzogJzU2MUUnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAyJzogJzU2MUYnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDMnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBUaGUgVGhpcmQgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTYwNCcsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBpbml0aWFsXHJcbiAgICAnRTlTIEFydCBPZiBEYXJrbmVzcyc6ICc1NjA2JywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGZpbmFsXHJcbiAgICAnRTlTIEZ1bGwtUGVyaW1pdGVyIFBhcnRpY2xlIEJlYW0nOiAnNTYyOScsIC8vIHBhbmVsIFwiZ2V0IGluXCJcclxuICAgICdFOVMgRGFyayBDaGFpbnMnOiAnNUZBQycsIC8vIFNsb3cgdG8gYnJlYWsgcGFydG5lciBjaGFpbnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOVMgV2l0aGRyYXcnOiAnNTYxQScsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlTIEFldGhlcm9zeW50aGVzaXMnOiAnNTYxQicsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRTlTIFN0eWdpYW4gVGVuZHJpbHMnOiAnOTUyJywgLy8gc3RhbmRpbmcgaW4gdGhlIGJyYW1ibGVzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0U5UyBNdWx0aS1Qcm9uZ2VkIFBhcnRpY2xlIEJlYW0nOiAnNTYwMCcsIC8vIEFydCBPZiBEYXJrbmVzcyBQYXJ0bmVyIFN0YWNrXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcInRhbmsgc3ByZWFkXCIuICBUaGlzIGNhbiBiZSBzdGFja2VkIGJ5IHR3byB0YW5rcyBpbnZ1bG5pbmcuXHJcbiAgICAgIC8vIE5vdGU6IHRoaXMgd2lsbCBzdGlsbCBzaG93IHNvbWV0aGluZyBmb3IgaG9sbWdhbmcvbGl2aW5nLCBidXRcclxuICAgICAgLy8gYXJndWFibHkgYSBoZWFsZXIgbWlnaHQgbmVlZCB0byBkbyBzb21ldGhpbmcgYWJvdXQgdGhhdCwgc28gbWF5YmVcclxuICAgICAgLy8gaXQncyBvayB0byBzdGlsbCBzaG93IGFzIGEgd2FybmluZz8/XHJcbiAgICAgIGlkOiAnRTlTIENvbmRlbnNlZCBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzU2MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcIm91dFwiLiAgVGhpcyBjYW4gYmUgaW52dWxuZWQgYnkgYSB0YW5rIGFsb25nIHdpdGggdGhlIHNwcmVhZCBhYm92ZS5cclxuICAgICAgaWQ6ICdFOVMgQW50aS1BaXIgUGhhc2VyIFVubGltaXRlZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1NjEyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBOIEZvcndhcmQgSW1wbG9zaW9uJzogJzU2QjQnLCAvLyBob3dsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBGb3J3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCNScsIC8vIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgSW1wbG9zaW9uJzogJzU2QjcnLCAvLyB0YWlsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjgnLCAvLyB0YWlsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDEnOiAnNTZEOScsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAyJzogJzVCMjYnLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQ2xvYWsgT2YgU2hhZG93cyc6ICc1QjExJywgLy8gbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxME4gVGhyb25lIE9mIFNoYWRvdyc6ICc1NkM3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxME4gUmlnaHQgR2lnYSBTbGFzaCc6ICc1NkFFJywgLy8gYm9zcyByaWdodCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBSaWdodCBTaGFkb3cgU2xhc2gnOiAnNTZBRicsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIExlZnQgR2lnYSBTbGFzaCc6ICc1NkIxJywgLy8gYm9zcyBsZWZ0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIExlZnQgU2hhZG93IFNsYXNoJzogJzU2QkQnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBTaGFkb3d5IEVydXB0aW9uJzogJzU2RTEnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBtYXJrZXJzIHBhaXJlZCB3aXRoIGJhcmJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBOIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NkRCJywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogaGl0dGluZyBzaGFkb3cgb2YgdGhlIGhlcm8gd2l0aCBhYmlsaXRpZXMgY2FuIGNhdXNlIHlvdSB0byB0YWtlIGRhbWFnZSwgbGlzdCB0aG9zZT9cclxuLy8gICAgICAgZS5nLiBwaWNraW5nIHVwIHlvdXIgZmlyc3QgcGl0Y2ggYm9nIHB1ZGRsZSB3aWxsIGNhdXNlIHlvdSB0byBkaWUgdG8gdGhlIGRhbWFnZVxyXG4vLyAgICAgICB5b3VyIHNoYWRvdyB0YWtlcyBmcm9tIERlZXBzaGFkb3cgTm92YSBvciBEaXN0YW50IFNjcmVhbS5cclxuLy8gVE9ETzogNTczQiBCbGlnaHRpbmcgQmxpdHogaXNzdWVzIGR1cmluZyBsaW1pdCBjdXQgbnVtYmVyc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDEnOiAnNTZGMicsIC8vIHNpbmdsZSB0YWlsIHVwIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBTaW5nbGUgMic6ICc1NkVGJywgLy8gc2luZ2xlIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAxJzogJzU2RUYnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gUXVhZHJ1cGxlIDInOiAnNTZGMicsIC8vIHF1YWRydXBsZSBzZXQgb2Ygc2hhZG93IGltcGxvc2lvbnNcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggU2luZ2xlIDEnOiAnNTZFQycsIC8vIEdpZ2Egc2xhc2ggc2luZ2xlIGZyb20gc2hhZG93XHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAyJzogJzU2RUQnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMSc6ICc1NzA5JywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIEJveCAyJzogJzU3MEQnLCAvLyBHaWdhIHNsYXNoIGJveCBmcm9tIGZvdXIgZ3JvdW5kIHNoYWRvd3NcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggUXVhZHJ1cGxlIDEnOiAnNTZFQycsIC8vIHF1YWRydXBsZSBzZXQgb2YgZ2lnYSBzbGFzaCBjbGVhdmVzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAyJzogJzU2RTknLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgQ2xvYWsgT2YgU2hhZG93cyAxJzogJzVCMTMnLCAvLyBpbml0aWFsIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMic6ICc1QjE0JywgLy8gc2Vjb25kIHNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxMFMgVGhyb25lIE9mIFNoYWRvdyc6ICc1NzE3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxMFMgU2hhZG93eSBFcnVwdGlvbic6ICc1NzM4JywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgZHVyaW5nIGFtcGxpZmllclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAxJzogJzU3MUEnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0b28gY2xvc2UpXHJcbiAgICAnRTEwUyBTd2F0aCBPZiBTaWxlbmNlIDInOiAnNUJCRicsIC8vIFNoYWRvdyBjbG9uZSBjbGVhdmUgKHRpbWVkKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwUyBTaGFkZWZpcmUnOiAnNTczMicsIC8vIHB1cnBsZSB0YW5rIHVtYnJhbCBvcmJzXHJcbiAgICAnRTEwUyBQaXRjaCBCb2cnOiAnNTcyMicsIC8vIG1hcmtlciBzcHJlYWQgdGhhdCBkcm9wcyBhIHNoYWRvdyBwdWRkbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMFMgU2hhZG93XFwncyBFZGdlJzogJzU3MjUnLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEwUyBEYW1hZ2UgRG93biBPcmJzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdGbGFtZXNoYWRvdycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVuZmxhbW1lJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbW1lIG9tYnJhbGUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICfjgrfjg6Pjg4njgqbjg5Xjg6zjgqTjg6AnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdkYW1hZ2UnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IGAke21hdGNoZXMuZWZmZWN0fSAocGFydGlhbCBzdGFjaylgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gQm9zcycsXHJcbiAgICAgIC8vIFNoYWNrbGVzIGJlaW5nIG1lc3NlZCB1cCBhcHBlYXIgdG8ganVzdCBnaXZlIHRoZSBEYW1hZ2UgRG93biwgd2l0aCBub3RoaW5nIGVsc2UuXHJcbiAgICAgIC8vIE1lc3NpbmcgdXAgdG93ZXJzIGlzIHRoZSBUaHJpY2UtQ29tZSBSdWluIGVmZmVjdCAoOUUyKSwgYnV0IGFsc28gRGFtYWdlIERvd24uXHJcbiAgICAgIC8vIFRPRE86IHNvbWUgb2YgdGhlc2Ugd2lsbCBiZSBkdXBsaWNhdGVkIHdpdGggb3RoZXJzLCBsaWtlIGBFMTBTIFRocm9uZSBPZiBTaGFkb3dgLlxyXG4gICAgICAvLyBNYXliZSBpdCdkIGJlIG5pY2UgdG8gZmlndXJlIG91dCBob3cgdG8gcHV0IHRoZSBkYW1hZ2UgbWFya2VyIG9uIHRoYXQ/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2hhZG93a2VlcGVyJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2NoYXR0ZW5rw7ZuaWcnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdSb2kgRGUgTFxcJ09tYnJlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn5b2x44Gu546LJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaGFkb3cgV2FycmlvciA0IGRvZyByb29tIGNsZWF2ZVxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBtaXRpZ2F0ZWQgYnkgdGhlIHdob2xlIGdyb3VwLCBzbyBhZGQgYSBkYW1hZ2UgY29uZGl0aW9uLlxyXG4gICAgICBpZDogJ0UxMFMgQmFyYnMgT2YgQWdvbnknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzU3MkEnLCAnNUIyNyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTYyRScsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjJDJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2MzAnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybm91dCc6ICc1NjJGJywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIFNoaW5pbmcgQmxhZGUnOiAnNTYzMScsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFOIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjNCJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTYzQycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFOIFJlc291bmRpbmcgQ3JhY2snOiAnNTY0RCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjQ1JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NDMnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybm91dCc6ICc1NjQ2JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMU4gQmxhc3RpbmcgWm9uZSc6ICc1NjNFJywgLy8gUHJpc21hdGljIERlY2VwdGlvbiBjaGFyZ2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTFOIEJ1cm4gTWFyayc6ICc1NjRGJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTFOIEJsYXN0YnVybiBLbm9ja2VkIE9mZicsXHJcbiAgICAgIC8vIDU2MkQgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY0NCA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2MkQnLCAnNTY0NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIDU2NUEvNTY4RCBTaW5zbW9rZSBCb3VuZCBPZiBGYWl0aCBzaGFyZVxyXG4vLyA1NjVFLzU2OTkgQm93c2hvY2sgaGl0cyB0YXJnZXQgb2YgNTY1RCAodHdpY2UpIGFuZCB0d28gb3RoZXJzXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NTInLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjU0JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2NTYnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSc6ICc1NjU3JywgLy8gQmFpdGVkIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEZpcmUnOiAnNTY4RScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIExpZ2h0bmluZyc6ICc1Njk1JywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgSG9seSc6ICc1NjlEJywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBTaGluaW5nIEJsYWRlIEN5Y2xlJzogJzU2OUUnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgSGFsbyBPZiBGbGFtZSBCcmlnaHRmaXJlJzogJzU2NkQnLCAvLyBSZWQgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIEhhbG8gT2YgTGV2aW4gQnJpZ2h0ZmlyZSc6ICc1NjZDJywgLy8gQmx1ZSBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIEZsYW1lIEJyaWdodCBQdWxzZSc6ICc1NjcxJywgLy8gUmVkIGNhcmQgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIExldmluIEJyaWdodCBQdWxzZSc6ICc1NjcwJywgLy8gQmx1ZSBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFJlc29uYW50IFdpbmRzJzogJzU2ODknLCAvLyBEZW1pLUd1a3VtYXR6IFwiZ2V0IGluXCJcclxuICAgICdFMTFTIFJlc291bmRpbmcgQ3JhY2snOiAnNTY4OCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMVMgSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjdCJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY3QycsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NzknLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEhvbHknOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBTaGluaW5nIEJsYWRlJzogJzU2N0UnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBiYWl0ZWQgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJub3V0JzogJzU2NTUnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMVMgQnVybm91dCBDeWNsZSc6ICc1Njk2JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJsYXN0aW5nIFpvbmUnOiAnNTY3NCcsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsnOiAnNTY2NCcsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuXHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsgQ3ljbGUnOiAnNTY4QycsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2luc21pdGUnOiAnNTY2NycsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkXHJcbiAgICAnRTExUyBTaW5zbWl0ZSBDeWNsZSc6ICc1Njk0JywgLy8gTGlnaHRuaW5nIEVsZW1lbnRhbCBCcmVhayBzcHJlYWQgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTFTIEJ1cm4gTWFyayc6ICc1NkEzJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMSc6ICc1NjYxJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXJcclxuICAgICdFMTFTIFNpbnNpZ2h0IDInOiAnNUJDNycsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMyc6ICc1NkEwJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXIgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0UxMVMgSG9seSBTaW5zaWdodCBHcm91cCBTaGFyZSc6ICc1NjY5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExUyBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1NjUzID0gQnVybnQgU3RyaWtlIGZpcmUgZm9sbG93dXAgZHVyaW5nIG1vc3Qgb2YgdGhlIGZpZ2h0XHJcbiAgICAgIC8vIDU2N0EgPSBzYW1lIHRoaW5nLCBidXQgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAgIC8vIDU2OEYgPSBzYW1lIHRoaW5nLCBidXQgZHVyaW5nIEN5Y2xlIG9mIEZhaXRoXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NjUzJywgJzU2N0EnLCAnNTY4RiddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUV0ZXJuaXR5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTJOIEp1ZGdtZW50IEpvbHQgU2luZ2xlJzogJzU4NUYnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIEp1ZGdtZW50IEpvbHQnOiAnNEUzMCcsIC8vIFJhbXVoIGdldCBvdXQgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQgU2luZ2xlJzogJzU4NUMnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0XHJcbiAgICAnRTEyTiBUZW1wb3JhcnkgQ3VycmVudCc6ICc0RTJEJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gQ29uZmxhZyBTdHJpa2UgU2luZ2xlJzogJzU4NUQnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gQ29uZmxhZyBTdHJpa2UnOiAnNEUyRScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0gU2luZ2xlJzogJzU4NUUnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3RcclxuICAgICdFMTJOIEZlcm9zdG9ybSc6ICc0RTJGJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBSYXB0dXJvdXMgUmVhY2ggMSc6ICc1ODc4JywgLy8gSGFpcmN1dFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDInOiAnNTg3NycsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIEJvbWIgRXhwbG9zaW9uJzogJzU4NkQnLCAvLyBTbWFsbCBib21iIGV4cGxvc2lvblxyXG4gICAgJ0UxMk4gVGl0YW5pYyBCb21iIEV4cGxvc2lvbic6ICc1ODZGJywgLy8gTGFyZ2UgYm9tYiBleHBsb3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMk4gRWFydGhzaGFrZXInOiAnNTg4NScsIC8vIEVhcnRoc2hha2VyIG9uIGZpcnN0IHBsYXRmb3JtXHJcbiAgICAnRTEyTiBQcm9taXNlIEZyaWdpZCBTdG9uZSAxJzogJzU4NjcnLCAvLyBTaGl2YSBzcHJlYWQgd2l0aCBzbGlkaW5nXHJcbiAgICAnRTEyTiBQcm9taXNlIEZyaWdpZCBTdG9uZSAyJzogJzU4NjknLCAvLyBTaGl2YSBzcHJlYWQgd2l0aCBSYXB0dXJvdXMgUmVhY2hcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgT3V0cHV0cyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvb3V0cHV0cyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGFkZCBzZXBhcmF0ZSBkYW1hZ2VXYXJuLWVzcXVlIGljb24gZm9yIGRhbWFnZSBkb3ducz9cclxuLy8gVE9ETzogNThBNiBVbmRlciBUaGUgV2VpZ2h0IC8gNThCMiBDbGFzc2ljYWwgU2N1bHB0dXJlIG1pc3Npbmcgc29tZWJvZHkgaW4gcGFydHkgd2FybmluZz9cclxuLy8gVE9ETzogNThDQSBEYXJrIFdhdGVyIElJSSAvIDU4QzUgU2hlbGwgQ3J1c2hlciBzaG91bGQgaGl0IGV2ZXJ5b25lIGluIHBhcnR5XHJcbi8vIFRPRE86IERhcmsgQWVybyBJSUkgNThENCBzaG91bGQgbm90IGJlIGEgc2hhcmUgZXhjZXB0IG9uIGFkdmFuY2VkIHJlbGF0aXZpdHkgZm9yIGRvdWJsZSBhZXJvLlxyXG4vLyAoZm9yIGdhaW5zIGVmZmVjdCwgc2luZ2xlIGFlcm8gPSB+MjMgc2Vjb25kcywgZG91YmxlIGFlcm8gPSB+MzEgc2Vjb25kcyBkdXJhdGlvbilcclxuXHJcbi8vIER1ZSB0byBjaGFuZ2VzIGludHJvZHVjZWQgaW4gcGF0Y2ggNS4yLCBvdmVyaGVhZCBtYXJrZXJzIG5vdyBoYXZlIGEgcmFuZG9tIG9mZnNldFxyXG4vLyBhZGRlZCB0byB0aGVpciBJRC4gVGhpcyBvZmZzZXQgY3VycmVudGx5IGFwcGVhcnMgdG8gYmUgc2V0IHBlciBpbnN0YW5jZSwgc29cclxuLy8gd2UgY2FuIGRldGVybWluZSB3aGF0IGl0IGlzIGZyb20gdGhlIGZpcnN0IG92ZXJoZWFkIG1hcmtlciB3ZSBzZWUuXHJcbi8vIFRoZSBmaXJzdCAxQiBtYXJrZXIgaW4gdGhlIGVuY291bnRlciBpcyB0aGUgZm9ybWxlc3MgdGFua2J1c3RlciwgSUQgMDA0Ri5cclxuY29uc3QgZmlyc3RIZWFkbWFya2VyID0gcGFyc2VJbnQoJzAwREEnLCAxNik7XHJcbmNvbnN0IGdldEhlYWRtYXJrZXJJZCA9IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgLy8gSWYgd2UgbmFpdmVseSBqdXN0IGNoZWNrICFkYXRhLmRlY09mZnNldCBhbmQgbGVhdmUgaXQsIGl0IGJyZWFrcyBpZiB0aGUgZmlyc3QgbWFya2VyIGlzIDAwREEuXHJcbiAgLy8gKFRoaXMgbWFrZXMgdGhlIG9mZnNldCAwLCBhbmQgITAgaXMgdHJ1ZS4pXHJcbiAgaWYgKHR5cGVvZiBkYXRhLmRlY09mZnNldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBkYXRhLmRlY09mZnNldCA9IHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGZpcnN0SGVhZG1hcmtlcjtcclxuICAvLyBUaGUgbGVhZGluZyB6ZXJvZXMgYXJlIHN0cmlwcGVkIHdoZW4gY29udmVydGluZyBiYWNrIHRvIHN0cmluZywgc28gd2UgcmUtYWRkIHRoZW0gaGVyZS5cclxuICAvLyBGb3J0dW5hdGVseSwgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHJvYnVzdCxcclxuICAvLyBzaW5jZSB3ZSBrbm93IGFsbCB0aGUgSURzIHRoYXQgd2lsbCBiZSBwcmVzZW50IGluIHRoZSBlbmNvdW50ZXIuXHJcbiAgcmV0dXJuIChwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBkYXRhLmRlY09mZnNldCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkucGFkU3RhcnQoNCwgJzAnKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBMZWZ0JzogJzU4QUQnLCAvLyBIYWlyY3V0IHdpdGggbGVmdCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIFJpZ2h0JzogJzU4QUUnLCAvLyBIYWlyY3V0IHdpdGggcmlnaHQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFNDQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgQ29uZmxhZyBTdHJpa2UnOiAnNEU0NScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgRmVyb3N0b3JtJzogJzRFNDYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBKdWRnbWVudCBKb2x0JzogJzRFNDcnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBTaGF0dGVyJzogJzU4OUMnLCAvLyBJY2UgUGlsbGFyIGV4cGxvc2lvbiBpZiB0ZXRoZXIgbm90IGdvdHRlblxyXG4gICAgJ0UxMlMgUHJvbWlzZSBJbXBhY3QnOiAnNThBMScsIC8vIFRpdGFuIGJvbWIgZHJvcFxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQmxpenphcmQgSUlJJzogJzU4RDMnLCAvLyBSZWxhdGl2aXR5IGRvbnV0IG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgQXBvY2FseXBzZSc6ICc1OEU2JywgLy8gTGlnaHQgdXAgY2lyY2xlIGV4cGxvc2lvbnMgKGRhbWFnZSBkb3duKVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIE1hZWxzdHJvbSc6ICc1OERBJywgLy8gQWR2YW5jZWQgUmVsYXRpdml0eSB0cmFmZmljIGxpZ2h0IGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZyaWdpZCBTdG9uZSc6ICc1ODlFJywgLy8gU2hpdmEgc3ByZWFkXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFya2VzdCBEYW5jZSc6ICc0RTMzJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgKyBqdW1wIGJlZm9yZSBrbm9ja2JhY2tcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEN1cnJlbnQnOiAnNThEOCcsIC8vIEJhaXRlZCB0cmFmZmljIGxpZ2h0IGxhc2Vyc1xyXG4gICAgJ0UxMlMgT3JhY2xlIFNwaXJpdCBUYWtlcic6ICc1OEM2JywgLy8gUmFuZG9tIGp1bXAgc3ByZWFkIG1lY2hhbmljIGFmdGVyIFNoZWxsIENydXNoZXJcclxuICAgICdFMTJTIE9yYWNsZSBTb21iZXIgRGFuY2UgMSc6ICc1OEJGJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgZm9yIER1YWwgQXBvY2FseXBzZVxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAyJzogJzU4QzAnLCAvLyBTZWNvbmQgc29tYmVyIGRhbmNlIGp1bXBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBXZWlnaHQgT2YgVGhlIFdvcmxkJzogJzU4QTUnLCAvLyBUaXRhbiBib21iIGJsdWUgbWFya2VyXHJcbiAgICAnRTEyUyBQcm9taXNlIFB1bHNlIE9mIFRoZSBMYW5kJzogJzU4QTMnLCAvLyBUaXRhbiBib21iIHllbGxvdyBtYXJrZXJcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEVydXB0aW9uIDEnOiAnNThDRScsIC8vIEluaXRpYWwgd2FybXVwIHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMic6ICc1OENEJywgLy8gUmVsYXRpdml0eSBzcHJlYWQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBCbGFjayBIYWxvJzogJzU4QzcnLCAvLyBUYW5rYnVzdGVyIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgRG9vbSc6ICc5RDQnLCAvLyBSZWxhdGl2aXR5IHB1bmlzaG1lbnQgZm9yIG11bHRpcGxlIG1pc3Rha2VzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBGb3JjZSBPZiBUaGUgTGFuZCc6ICc1OEE0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEJpZyBjaXJjbGUgZ3JvdW5kIGFvZXMgZHVyaW5nIFNoaXZhIGp1bmN0aW9uLlxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBzaGllbGRlZCB0aHJvdWdoIGFzIGxvbmcgYXMgdGhhdCBwZXJzb24gZG9lc24ndCBzdGFjay5cclxuICAgICAgaWQ6ICdFMTJTIEljaWNsZSBJbXBhY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEU1QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBIZWFkbWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7fSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBpZCA9IGdldEhlYWRtYXJrZXJJZChkYXRhLCBtYXRjaGVzKTtcclxuICAgICAgICBjb25zdCBmaXJzdExhc2VyTWFya2VyID0gJzAwOTEnO1xyXG4gICAgICAgIGNvbnN0IGxhc3RMYXNlck1hcmtlciA9ICcwMDk4JztcclxuICAgICAgICBpZiAoaWQgPj0gZmlyc3RMYXNlck1hcmtlciAmJiBpZCA8PSBsYXN0TGFzZXJNYXJrZXIpIHtcclxuICAgICAgICAgIC8vIGlkcyBhcmUgc2VxdWVudGlhbDogIzEgc3F1YXJlLCAjMiBzcXVhcmUsICMzIHNxdWFyZSwgIzQgc3F1YXJlLCAjMSB0cmlhbmdsZSBldGNcclxuICAgICAgICAgIGNvbnN0IGRlY09mZnNldCA9IHBhcnNlSW50KGlkLCAxNikgLSBwYXJzZUludChmaXJzdExhc2VyTWFya2VyLCAxNik7XHJcblxyXG4gICAgICAgICAgLy8gZGVjT2Zmc2V0IGlzIDAtNywgc28gbWFwIDAtMyB0byAxLTQgYW5kIDQtNyB0byAxLTQuXHJcbiAgICAgICAgICBkYXRhLmxhc2VyTmFtZVRvTnVtID0gZGF0YS5sYXNlck5hbWVUb051bSB8fCB7fTtcclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW1bbWF0Y2hlcy50YXJnZXRdID0gZGVjT2Zmc2V0ICUgNCArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlc2Ugc2N1bHB0dXJlcyBhcmUgYWRkZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBmaWdodCwgc28gd2UgbmVlZCB0byBjaGVjayB3aGVyZSB0aGV5XHJcbiAgICAgIC8vIHVzZSB0aGUgXCJDbGFzc2ljYWwgU2N1bHB0dXJlXCIgYWJpbGl0eSBhbmQgZW5kIHVwIG9uIHRoZSBhcmVuYSBmb3IgcmVhbC5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQ2hpc2VsZWQgU2N1bHB0dXJlIENsYXNzaWNhbCBTY3VscHR1cmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgcnVuIHBlciBwZXJzb24gdGhhdCBnZXRzIGhpdCBieSB0aGUgc2FtZSBzY3VscHR1cmUsIGJ1dCB0aGF0J3MgZmluZS5cclxuICAgICAgICAvLyBSZWNvcmQgdGhlIHkgcG9zaXRpb24gb2YgZWFjaCBzY3VscHR1cmUgc28gd2UgY2FuIHVzZSBpdCBmb3IgYmV0dGVyIHRleHQgbGF0ZXIuXHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1ttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlIHNvdXJjZSBvZiB0aGUgdGV0aGVyIGlzIHRoZSBwbGF5ZXIsIHRoZSB0YXJnZXQgaXMgdGhlIHNjdWxwdHVyZS5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQ2hpc2VsZWQgU2N1bHB0dXJlIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHRhcmdldDogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkID0gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkW21hdGNoZXMuc291cmNlXSA9IG1hdGNoZXMudGFyZ2V0SWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lIENvdW50ZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAxLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50ID0gZGF0YS5ibGFkZU9mRmxhbWVDb3VudCB8fCAwO1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQrKztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaXMgdGhlIENoaXNlbGVkIFNjdWxwdHVyZSBsYXNlciB3aXRoIHRoZSBsaW1pdCBjdXQgZG90cy5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubGFzZXJOYW1lVG9OdW0gfHwgIWRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgfHwgIWRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgcGVyc29uIHdobyBoYXMgdGhpcyBsYXNlciBudW1iZXIgYW5kIGlzIHRldGhlcmVkIHRvIHRoaXMgc3RhdHVlLlxyXG4gICAgICAgIGNvbnN0IG51bWJlciA9IChkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDApICsgMTtcclxuICAgICAgICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKGRhdGEubGFzZXJOYW1lVG9OdW0pO1xyXG4gICAgICAgIGNvbnN0IHdpdGhOdW0gPSBuYW1lcy5maWx0ZXIoKG5hbWUpID0+IGRhdGEubGFzZXJOYW1lVG9OdW1bbmFtZV0gPT09IG51bWJlcik7XHJcbiAgICAgICAgY29uc3Qgb3duZXJzID0gd2l0aE51bS5maWx0ZXIoKG5hbWUpID0+IGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbmFtZV0gPT09IHNvdXJjZUlkKTtcclxuXHJcbiAgICAgICAgLy8gaWYgc29tZSBsb2dpYyBlcnJvciwganVzdCBhYm9ydC5cclxuICAgICAgICBpZiAob3duZXJzLmxlbmd0aCAhPT0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVGhlIG93bmVyIGhpdHRpbmcgdGhlbXNlbHZlcyBpc24ndCBhIG1pc3Rha2UuLi50ZWNobmljYWxseS5cclxuICAgICAgICBpZiAob3duZXJzWzBdID09PSBtYXRjaGVzLnRhcmdldClcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gTm93IHRyeSB0byBmaWd1cmUgb3V0IHdoaWNoIHN0YXR1ZSBpcyB3aGljaC5cclxuICAgICAgICAvLyBQZW9wbGUgY2FuIHB1dCB0aGVzZSB3aGVyZXZlci4gIFRoZXkgY291bGQgZ28gc2lkZXdheXMsIG9yIGRpYWdvbmFsLCBvciB3aGF0ZXZlci5cclxuICAgICAgICAvLyBJdCBzZWVtcyBtb29vb29zdCBwZW9wbGUgcHV0IHRoZXNlIG5vcnRoIC8gc291dGggKG9uIHRoZSBzb3V0aCBlZGdlIG9mIHRoZSBhcmVuYSkuXHJcbiAgICAgICAgLy8gTGV0J3Mgc2F5IGEgbWluaW11bSBvZiAyIHlhbG1zIGFwYXJ0IGluIHRoZSB5IGRpcmVjdGlvbiB0byBjb25zaWRlciB0aGVtIFwibm9ydGgvc291dGhcIi5cclxuICAgICAgICBjb25zdCBtaW5pbXVtWWFsbXNGb3JTdGF0dWVzID0gMjtcclxuXHJcbiAgICAgICAgbGV0IGlzU3RhdHVlUG9zaXRpb25Lbm93biA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc1N0YXR1ZU5vcnRoID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgc2N1bHB0dXJlSWRzID0gT2JqZWN0LmtleXMoZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zKTtcclxuICAgICAgICBpZiAoc2N1bHB0dXJlSWRzLmxlbmd0aCA9PT0gMiAmJiBzY3VscHR1cmVJZHMuaW5jbHVkZXMoc291cmNlSWQpKSB7XHJcbiAgICAgICAgICBjb25zdCBvdGhlcklkID0gc2N1bHB0dXJlSWRzWzBdID09PSBzb3VyY2VJZCA/IHNjdWxwdHVyZUlkc1sxXSA6IHNjdWxwdHVyZUlkc1swXTtcclxuICAgICAgICAgIGNvbnN0IHNvdXJjZVkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbc291cmNlSWRdO1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJZID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW290aGVySWRdO1xyXG4gICAgICAgICAgY29uc3QgeURpZmYgPSBNYXRoLmFicyhzb3VyY2VZIC0gb3RoZXJZKTtcclxuICAgICAgICAgIGlmICh5RGlmZiA+IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMpIHtcclxuICAgICAgICAgICAgaXNTdGF0dWVQb3NpdGlvbktub3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXNTdGF0dWVOb3J0aCA9IHNvdXJjZVkgPCBvdGhlclk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvd25lciA9IG93bmVyc1swXTtcclxuICAgICAgICBjb25zdCBvd25lck5pY2sgPSBkYXRhLlNob3J0TmFtZShvd25lcik7XHJcbiAgICAgICAgbGV0IHRleHQgPSB7XHJcbiAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIKWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmIGlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3J0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3JkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWMl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWMl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg67aB7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmICFpc1N0YXR1ZU5vcnRoKSB7XHJcbiAgICAgICAgICB0ZXh0ID0ge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0gc291dGgpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0gU8O8ZGVuKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZfjga4ke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6rljZfmlrkke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIIOuCqOyqvSlgLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgVHJhY2tlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogWycwMDAxJywgJzAwMzknXSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEucGlsbGFySWRUb093bmVyID0gZGF0YS5waWxsYXJJZFRvT3duZXIgfHwge307XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgTWlzdGFrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdJY2UgUGlsbGFyJywgaWQ6ICc1ODlCJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5waWxsYXJJZFRvT3duZXIpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXMudGFyZ2V0ICE9PSBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBwaWxsYXJPd25lciA9IGRhdGEuU2hvcnROYW1lKGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChkZSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtwaWxsYXJPd25lcn3jgYvjgokpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke3BpbGxhck93bmVyfVwiKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBHYWluIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgLy8gVGhlIEJlYXN0bHkgU2N1bHB0dXJlIGdpdmVzIGEgMyBzZWNvbmQgZGVidWZmLCB0aGUgUmVnYWwgU2N1bHB0dXJlIGdpdmVzIGEgMTRzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPSBkYXRhLmZpcmUgfHwge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBMb3NlIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPSBkYXRhLmZpcmUgfHwge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25JZFRvT3duZXIgPSBkYXRhLnNtYWxsTGlvbklkVG9Pd25lciB8fCB7fTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMgPSBkYXRhLnNtYWxsTGlvbk93bmVycyB8fCBbXTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIFNtYWxsIExpb24gTGlvbnNibGF6ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBGb2xrcyBiYWl0aW5nIHRoZSBiaWcgbGlvbiBzZWNvbmQgY2FuIHRha2UgdGhlIGZpcnN0IHNtYWxsIGxpb24gaGl0LFxyXG4gICAgICAgIC8vIHNvIGl0J3Mgbm90IHN1ZmZpY2llbnQgdG8gY2hlY2sgb25seSB0aGUgb3duZXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLnNtYWxsTGlvbk93bmVycylcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgaWYgKCFvd25lcilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAobWF0Y2hlcy50YXJnZXQgPT09IG93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGFsc28gaGFzIGEgc21hbGwgbGlvbiB0ZXRoZXIsIHRoYXQgaXMgYWx3YXlzIGEgbWlzdGFrZS5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0J3Mgb25seSBhIG1pc3Rha2UgaWYgdGhlIHRhcmdldCBoYXMgYSBmaXJlIGRlYnVmZi5cclxuICAgICAgICBjb25zdCBoYXNTbWFsbExpb24gPSBkYXRhLnNtYWxsTGlvbk93bmVycy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICBpZiAoaGFzU21hbGxMaW9uIHx8IGhhc0ZpcmVEZWJ1ZmYpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgICAgY29uc3QgeCA9IHBhcnNlRmxvYXQobWF0Y2hlcy54KTtcclxuICAgICAgICAgIGNvbnN0IHkgPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgICAgICBsZXQgZGlyT2JqID0gbnVsbDtcclxuICAgICAgICAgIGlmICh5IDwgY2VudGVyWSkge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJORTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyTlc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTRTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyU1c7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogb3duZXIsXHJcbiAgICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZW4nXX0pYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2RlJ119KWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2ZyJ119KWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7b3duZXJOaWNrfeOBi+OCiSwgJHtkaXJPYmpbJ2phJ119KWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2NuJ119YCxcclxuICAgICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7ZGlyT2JqWydrbyddfSlgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBOb3J0aCBCaWcgTGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCh7IG5hbWU6ICdSZWdhbCBTY3VscHR1cmUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgIGlmICh5IDwgY2VudGVyWSlcclxuICAgICAgICAgIGRhdGEubm9ydGhCaWdMaW9uID0gbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmlnIExpb24gS2luZ3NibGF6ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdSZWdhbCBTY3VscHR1cmUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdBYmJpbGQgZWluZXMgZ3Jvw59lbiBMw7Z3ZW4nLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdjcsOpYXRpb24gbMOpb25pbmUgcm95YWxlJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2Q546LJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBzaW5nbGVUYXJnZXQgPSBtYXRjaGVzLnR5cGUgPT09ICcyMSc7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICAvLyBTdWNjZXNzIGlmIG9ubHkgb25lIHBlcnNvbiB0YWtlcyBpdCBhbmQgdGhleSBoYXZlIG5vIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGlmIChzaW5nbGVUYXJnZXQgJiYgIWhhc0ZpcmVEZWJ1ZmYpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHtcclxuICAgICAgICAgIG5vcnRoQmlnTGlvbjoge1xyXG4gICAgICAgICAgICBlbjogJ25vcnRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdOb3JkZW0sIGdyb8OfZXIgTMO2d2UnLFxyXG4gICAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljJcpJyxcclxuICAgICAgICAgICAgY246ICfljJfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAgICBrbzogJ+u2geyqvSDtgbAg7IKs7J6QJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzb3V0aEJpZ0xpb246IHtcclxuICAgICAgICAgICAgZW46ICdzb3V0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICAgIGRlOiAnU8O8ZGVuLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgICAgamE6ICflpKfjg6njgqTjgqrjg7Mo5Y2XKScsXHJcbiAgICAgICAgICAgIGNuOiAn5Y2X5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgICAga286ICfrgqjsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2hhcmVkOiB7XHJcbiAgICAgICAgICAgIGVuOiAnc2hhcmVkJyxcclxuICAgICAgICAgICAgZGU6ICdnZXRlaWx0JyxcclxuICAgICAgICAgICAgamE6ICfph43jga3jgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+mHjeWPoCcsXHJcbiAgICAgICAgICAgIGtvOiAn6rCZ7J20IOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmlyZURlYnVmZjoge1xyXG4gICAgICAgICAgICBlbjogJ2hhZCBmaXJlJyxcclxuICAgICAgICAgICAgZGU6ICdoYXR0ZSBGZXVlcicsXHJcbiAgICAgICAgICAgIGphOiAn54KO5LuY44GNJyxcclxuICAgICAgICAgICAgY246ICfngatEZWJ1ZmYnLFxyXG4gICAgICAgICAgICBrbzogJ+2ZlOyXvCDrlJTrsoTtlIQg67Cb7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFiZWxzID0gW107XHJcbiAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24gPT09IG1hdGNoZXMuc291cmNlSWQpXHJcbiAgICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5ub3J0aEJpZ0xpb25bZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQubm9ydGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LnNvdXRoQmlnTGlvbltkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5zb3V0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbmdsZVRhcmdldClcclxuICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5zaGFyZWRbZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQuc2hhcmVkWydlbiddKTtcclxuICAgICAgICBpZiAoaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5maXJlRGVidWZmW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0LmZpcmVEZWJ1ZmZbJ2VuJ10pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2xhYmVscy5qb2luKCcsICcpfSlgLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1ODlBID0gSWNlIFBpbGxhciAocHJvbWlzZSBzaGl2YSBwaGFzZSlcclxuICAgICAgLy8gNThCNiA9IFBhbG0gT2YgVGVtcGVyYW5jZSAocHJvbWlzZSBzdGF0dWUgaGFuZClcclxuICAgICAgLy8gNThCNyA9IExhc2VyIEV5ZSAocHJvbWlzZSBsaW9uIHBoYXNlKVxyXG4gICAgICAvLyA1OEMxID0gRGFya2VzdCBEYW5jZSAob3JhY2xlIHRhbmsganVtcCArIGtub2NrYmFjayBpbiBiZWdpbm5pbmcgYW5kIHRyaXBsZSBhcG9jKVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTg5QScsICc1OEI2JywgJzU4QjcnLCAnNThDMSddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBPcmFjbGUgU2hhZG93ZXllJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzU4RDInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiB3YXJuaW5nIGZvciB0YWtpbmcgRGlhbW9uZCBGbGFzaCAoNUZBMSkgc3RhY2sgb24geW91ciBvd24/XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2tFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDEnOiAnNUZBRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMic6ICc1RkIyJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAzJzogJzVGQ0QnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDQnOiAnNUZDRScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNSc6ICc1RkNGJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA2JzogJzVGRjgnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDcnOiAnNjE1OScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBcnRpY3VsYXRlZCBCaXQgQWV0aGVyaWFsIEJ1bGxldCc6ICc1RkFCJywgLy8gYml0IGxhc2VycyBkdXJpbmcgYWxsIHBoYXNlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDEnOiAnNUZDQicsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDInOiAnNUZDQycsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIExlZnQnOiAnNUZDMicsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IENsYXcgU3dpcGUgUmlnaHQnOiAnNUZDMycsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQ3ljbG9uZSAxJzogJzVGRDEnLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMic6ICc1RkQyJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmRFeCBBaXJzaGlwXFwncyBCYW5lIDInOiAnNUZEMycsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggVGFuayBMYXNlcnMnOiAnNUZDOCcsIC8vIGNsZWF2aW5nIHllbGxvdyBsYXNlcnMgb24gdG9wIHR3byBlbm1pdHlcclxuICAgICdEaWFtb25kRXggSG9taW5nIExhc2VyJzogJzVGQzQnLCAvLyBBZGFtYW50ZSBQdXJnZSBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBGbG9vZCBSYXknOiAnNUZDNycsIC8vIFwibGltaXQgY3V0XCIgY2xlYXZlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kRXggVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUZEMCcgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2ssXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEF1cmkgQXJ0cyc6ICc1RkUzJywgLy8gQXVyaSBBcnRzIGRhc2hlc1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIERpYW1vbmQgU2hyYXBuZWwgSW5pdGlhbCc6ICc1RkUxJywgLy8gaW5pdGlhbCBjaXJjbGUgb2YgRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIERpYW1vbmQgU2hyYXBuZWwgQ2hhc2luZyc6ICc1RkUyJywgLy8gZm9sbG93dXAgY2lyY2xlcyBmcm9tIERpYW1vbmQgU2hyYXBuZWxcclxuICAgICdEaWFtb25kIFdlYXBvbiBBZXRoZXJpYWwgQnVsbGV0JzogJzVGRDUnLCAvLyBiaXQgbGFzZXJzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBMZWZ0JzogJzVGRDknLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIENsYXcgU3dpcGUgUmlnaHQnOiAnNUZEQScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBDeWNsb25lIDEnOiAnNUZFNicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBDeWNsb25lIDInOiAnNUZFNycsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRTgnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFpcnNoaXBcXCdzIEJhbmUgMic6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEhvbWluZyBMYXNlcic6ICc1RkRCJywgLy8gc3ByZWFkIG1hcmtlcnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZCBXZWFwb24gVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUZFNScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW1FeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXknOiAnNUJEMycsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAxJzogJzU1N0InLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMic6ICc1NTdEJywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDEnOiAnNTU3QScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDInOiAnNTU3OScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEV4cGxvc2lvbic6ICc1NTk2JywgLy8gTWFnaXRlayBNaW5lIGV4cGxvc2lvblxyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBJbml0aWFsJzogJzU1Q0QnLCAvLyBzd29yZCBpbml0aWFsIHB1ZGRsZXNcclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgRXhwbG9zaW9uJzogJzU1Q0UnLCAvLyBzd29yZCBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZEV4IEFpcmJvcm5lIEV4cGxvc2lvbic6ICc1NUJEJywgLy8gZXhhZmxhcmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAxJzogJzU1RDQnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDInOiAnNTVENScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNob3RzIEZpcmVkJzogJzU1QjcnLCAvLyByYW5rIGFuZCBmaWxlIHNvbGRpZXJzXHJcbiAgICAnRW1lcmFsZEV4IFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NUNCJywgLy8gZHJvcHBlZCArIGFuZCB4IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZEV4IEV4cGlyZSc6ICc1NUQxJywgLy8gZ3JvdW5kIGFvZSBvbiBib3NzIFwiZ2V0IG91dFwiXHJcbiAgICAnRW1lcmFsZEV4IEFpcmUgVGFtIFN0b3JtJzogJzU1RDAnLCAvLyBleHBhbmRpbmcgcmVkIGFuZCBibGFjayBncm91bmQgYW9lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggRGl2aWRlIEV0IEltcGVyYSc6ICc1NUQ5JywgLy8gbm9uLXRhbmsgcHJvdGVhbiBzcHJlYWRcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAxJzogJzU1QzQnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAyJzogJzU1QzUnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAzJzogJzU1QzYnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCA0JzogJzU1QzcnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DYXN0cnVtTWFyaW51bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXknOiAnNEY5RCcsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDEnOiAnNTUzNCcsIC8vIEVtZXJhbGQgQmVhbSBpbnNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDInOiAnNTUzNicsIC8vIEVtZXJhbGQgQmVhbSBtaWRkbGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDMnOiAnNTUzOCcsIC8vIEVtZXJhbGQgQmVhbSBvdXRzaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDEnOiAnNTUzMicsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXkgMic6ICc1NTMzJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBNYWduZXRpYyBNaW5lIEV4cGxvc2lvbic6ICc1QjA0JywgLy8gcmVwdWxzaW5nIG1pbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMSc6ICc1NTNGJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDInOiAnNTU0MCcsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAzJzogJzU1NDEnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgNCc6ICc1NTQyJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBCaXQgU3Rvcm0nOiAnNTU0QScsIC8vIFwiZ2V0IGluXCJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBFbWVyYWxkIENydXNoZXInOiAnNTUzQycsIC8vIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQdWxzZSBMYXNlcic6ICc1NTQ4JywgLy8gbGluZSBhb2VcclxuICAgICdFbWVyYWxkIFdlYXBvbiBFbmVyZ3kgQWV0aGVyb3BsYXNtJzogJzU1NTEnLCAvLyBoaXR0aW5nIGEgZ2xvd3kgb3JiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBHcm91bmQnOiAnNTU2RicsIC8vIHBhcnR5IHRhcmdldGVkIGdyb3VuZCBjb25lc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QnOiAnNEIzRScsIC8vIGdyb3VuZCBjaXJjbGUgZHVyaW5nIGFycm93IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2VjdW5kdXMgVGVybWludXMgRXN0JzogJzU1NkEnLCAvLyBYIC8gKyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFRlcnRpdXMgVGVybWludXMgRXN0JzogJzU1NkQnLCAvLyB0cmlwbGUgc3dvcmRzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2hvdHMgRmlyZWQnOiAnNTU1RicsIC8vIGxpbmUgYW9lcyBmcm9tIHNvbGRpZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIFAxJzogJzU1NEUnLCAvLyB0YW5rYnVzdGVyLCBwcm9iYWJseSBjbGVhdmVzLCBwaGFzZSAxXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMic6ICc1NTcwJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFbWVyYWxkIFdlYXBvbiBFbWVyYWxkIENydXNoZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NTNFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBHZXR0aW5nIGtub2NrZWQgaW50byBhIHdhbGwgZnJvbSB0aGUgYXJyb3cgaGVhZG1hcmtlci5cclxuICAgICAgaWQ6ICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0IFdhbGwnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTU2MycsICc1NTY0J10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBIYWRlcyBFeFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTWluc3RyZWxzQmFsbGFkSGFkZXNzRWxlZ3ksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAyJzogJzQ3QUEnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAzJzogJzQ3RTQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCA0JzogJzQ3RTUnLFxyXG4gICAgLy8gRXZlcnlib2R5IHN0YWNrcyBpbiBnb29kIGZhaXRoIGZvciBCYWQgRmFpdGgsIHNvIGRvbid0IGNhbGwgaXQgYSBtaXN0YWtlLlxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDEnOiAnNDdBRCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMic6ICc0N0IwJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAzJzogJzQ3QUUnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDQnOiAnNDdBRicsXHJcbiAgICAnSGFkZXNFeCBCcm9rZW4gRmFpdGgnOiAnNDdCMicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBTcGVhcic6ICc0N0I2JyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIENoYWtyYW0nOiAnNDdCNScsXHJcbiAgICAnSGFkZXNFeCBGb3JrZWQgTGlnaHRuaW5nJzogJzQ3QzknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDEnOiAnNDdGMScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMic6ICc0N0YyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIYWRlc0V4IENvbWV0JzogJzQ3QjknLCAvLyBtaXNzZWQgdG93ZXJcclxuICAgICdIYWRlc0V4IEFuY2llbnQgRXJ1cHRpb24nOiAnNDdEMycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMSc6ICc0N0VDJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAyJzogJzQ3RUQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFN0cmVhbSc6ICc0N0VBJyxcclxuICAgICdIYWRlc0V4IERlYWQgU3BhY2UnOiAnNDdFRScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgSW5pdGlhbCc6ICc0N0E5JyxcclxuICAgICdIYWRlc0V4IFJhdmVub3VzIEFzc2F1bHQnOiAnKD86NDdBNnw0N0E3KScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZsYW1lIDEnOiAnNDdDNicsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAxJzogJzQ3QzQnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMic6ICc0N0RGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ1NoYWRvdyBvZiB0aGUgQW5jaWVudHMnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEYXJrID0gZGF0YS5oYXNEYXJrIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuaGFzRGFyay5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzQ3QkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIERvbid0IGJsYW1lIHBlb3BsZSB3aG8gZG9uJ3QgaGF2ZSB0ZXRoZXJzLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmhhc0RhcmsgJiYgZGF0YS5oYXNEYXJrLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJvc3MgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiBbJ0lnZXlvcmhtXFwncyBTaGFkZScsICdMYWhhYnJlYVxcJ3MgU2hhZGUnXSwgaWQ6ICcwMDBFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdCb3NzZXMgVG9vIENsb3NlJyxcclxuICAgICAgICAgIGRlOiAnQm9zc2VzIHp1IE5haGUnLFxyXG4gICAgICAgICAgZnI6ICdCb3NzIHRyb3AgcHJvY2hlcycsXHJcbiAgICAgICAgICBqYTogJ+ODnOOCuei/keOBmeOBjuOCiycsXHJcbiAgICAgICAgICBjbjogJ0JPU1PpnaDlpKrov5HkuoYnLFxyXG4gICAgICAgICAga286ICfsq4Trk6TsnbQg64SI66y0IOqwgOq5jOybgCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEZWF0aCBTaHJpZWsnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDdDQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBIYWRlcyBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUR5aW5nR2FzcCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSGFkZXMgQmFkIEZhaXRoIDEnOiAnNDE0QicsXHJcbiAgICAnSGFkZXMgQmFkIEZhaXRoIDInOiAnNDE0QycsXHJcbiAgICAnSGFkZXMgRGFyayBFcnVwdGlvbic6ICc0MTUyJyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3ByZWFkIDEnOiAnNDE1NicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFNwcmVhZCAyJzogJzQxNTcnLFxyXG4gICAgJ0hhZGVzIEJyb2tlbiBGYWl0aCc6ICc0MTRFJyxcclxuICAgICdIYWRlcyBIZWxsYm9ybiBZYXdwJzogJzQxNkYnLFxyXG4gICAgJ0hhZGVzIFB1cmdhdGlvbic6ICc0MTcyJyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3RyZWFtJzogJzQxNUMnLFxyXG4gICAgJ0hhZGVzIEFlcm8nOiAnNDU5NScsXHJcbiAgICAnSGFkZXMgRWNobyAxJzogJzQxNjMnLFxyXG4gICAgJ0hhZGVzIEVjaG8gMic6ICc0MTY0JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0hhZGVzIE5ldGhlciBCbGFzdCc6ICc0MTYzJyxcclxuICAgICdIYWRlcyBSYXZlbm91cyBBc3NhdWx0JzogJzQxNTgnLFxyXG4gICAgJ0hhZGVzIEFuY2llbnQgRGFya25lc3MnOiAnNDU5MycsXHJcbiAgICAnSGFkZXMgRHVhbCBTdHJpa2UnOiAnNDE2MicsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIElubm9jZW5jZSBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDcm93bk9mVGhlSW1tYWN1bGF0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm9FeCBEdWVsIERlc2NlbnQnOiAnM0VEMicsXHJcbiAgICAnSW5ub0V4IFJlcHJvYmF0aW9uIDEnOiAnM0VFMCcsXHJcbiAgICAnSW5ub0V4IFJlcHJvYmF0aW9uIDInOiAnM0VDQycsXHJcbiAgICAnSW5ub0V4IFN3b3JkIG9mIENvbmRlbW5hdGlvbiAxJzogJzNFREUnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMic6ICczRURGJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMSc6ICczRUQzJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMic6ICczRUQ0JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMyc6ICczRUQ1JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNCc6ICczRUQ2JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNSc6ICczRUZCJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNic6ICczRUZDJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNyc6ICczRUZEJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgOCc6ICczRUZFJyxcclxuICAgICdJbm5vRXggSG9seSBUcmluaXR5JzogJzNFREInLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDEnOiAnM0VENycsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMic6ICczRUQ4JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAzJzogJzNFRDknLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDQnOiAnM0VEQScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNSc6ICczRUZGJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA2JzogJzNGMDAnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDcnOiAnM0YwMScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgOCc6ICczRjAyJyxcclxuICAgICdJbm5vRXggR29kIFJheSAxJzogJzNFRTYnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDInOiAnM0VFNycsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMyc6ICczRUU4JyxcclxuICAgICdJbm5vRXggRXhwbG9zaW9uJzogJzNFRjAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJbm5vY2VuY2UgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDcm93bk9mVGhlSW1tYWN1bGF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSW5ubyBEYXlicmVhayc6ICczRTlEJyxcclxuICAgICdJbm5vIEhvbHkgVHJpbml0eSc6ICczRUIzJyxcclxuXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAxJzogJzNFQjYnLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMic6ICczRUI4JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDMnOiAnM0VDQicsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiA0JzogJzNFQjcnLFxyXG5cclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgMSc6ICczRUIxJyxcclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgMic6ICczRUIyJyxcclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgMyc6ICczRUY5JyxcclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgNCc6ICczRUZBJyxcclxuXHJcbiAgICAnSW5ubyBHb2QgUmF5IDEnOiAnM0VCRCcsXHJcbiAgICAnSW5ubyBHb2QgUmF5IDInOiAnM0VCRScsXHJcbiAgICAnSW5ubyBHb2QgUmF5IDMnOiAnM0VCRicsXHJcbiAgICAnSW5ubyBHb2QgUmF5IDQnOiAnM0VDMCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA1Q0NBLzVDQ0IvNUNDQywgV2F0ZXJzcG91dCA9IDVDRDFcclxuXHJcbi8vIExldmlhdGhhbiBVbnJlYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0xldmlVbiBHcmFuZCBGYWxsJzogJzVDREYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aVVuIEh5ZHJvc2hvdCc6ICc1Q0Q1JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlVbiBEcmVhZHN0b3JtJzogJzVDRDYnLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpVW4gQm9keSBTbGFtJzogJzVDRDInLCAvLyBsZXZpIHNsYW0gdGhhdCB0aWx0cyB0aGUgYm9hdFxyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDEnOiAnNUNEQicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAyJzogJzVDRTMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMyc6ICc1Q0U4JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDQnOiAnNUNFOScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlVbiBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlVbiBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpVW4gQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUNEMicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogdGFraW5nIHR3byBkaWZmZXJlbnQgSGlnaC1Qb3dlcmVkIEhvbWluZyBMYXNlcnMgKDRBRDgpXHJcbi8vIFRPRE86IGNvdWxkIGJsYW1lIHRoZSB0ZXRoZXJlZCBwbGF5ZXIgZm9yIFdoaXRlIEFnb255IC8gV2hpdGUgRnVyeSBmYWlsdXJlcz9cclxuXHJcbi8vIFJ1YnkgV2VhcG9uIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNpbmRlckRyaWZ0RXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgQml0IE1hZ2l0ZWsgUmF5JzogJzRBRDInLCAvLyBsaW5lIGFvZXMgZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QUQzJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJGJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDMnOiAnNEQwNCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNCc6ICc0RDA1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA1JzogJzRBQ0QnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDYnOiAnNEFDRScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggVW5kZXJtaW5lJzogJzRBRDAnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieUV4IFJ1YnkgUmF5JzogJzRCMDInLCAvLyBmcm9udGFsIGxhc2VyXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxJzogJzRBRDknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDInOiAnNEFEQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMyc6ICc0QUREJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA0JzogJzRBREUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDUnOiAnNEFERicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNic6ICc0QUUwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA3JzogJzRBRTEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDgnOiAnNEFFMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgOSc6ICc0QUUzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMCc6ICc0QUU0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMSc6ICc0QUU1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMic6ICc0QUU2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMyc6ICc0QUU3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNCc6ICc0QUU4JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNSc6ICc0QUU5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNic6ICc0QUVBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNyc6ICc0RTZCJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOCc6ICc0RTZDJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOSc6ICc0RTZEJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMCc6ICc0RTZFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMSc6ICc0RTZGJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMic6ICc0RTcwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDEnOiAnNEIwNScsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMic6ICc0QjA2JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAzJzogJzRCMDcnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDQnOiAnNEIwOCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gNSc6ICc0RE9EJywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBNZXRlb3IgQnVyc3QnOiAnNEFGMicsIC8vIG1ldGVvciBleHBsb2RpbmdcclxuICAgICdSdWJ5RXggQnJhZGFtYW50ZSc6ICc0RTM4JywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICAgICdSdWJ5RXggQ29tZXQgSGVhdnkgSW1wYWN0JzogJzRBRjYnLCAvLyBsZXR0aW5nIGEgdGFuayBjb21ldCBsYW5kXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgU3BoZXJlIEJ1cnN0JzogJzRBQ0InLCAvLyBleHBsb2RpbmcgdGhlIHJlZCBtaW5lXHJcbiAgICAnUnVieUV4IEx1bmFyIER5bmFtbyc6ICc0RUIwJywgLy8gXCJnZXQgaW5cIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSXJvbiBDaGFyaW90JzogJzRFQjEnLCAvLyBcImdldCBvdXRcIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSGVhcnQgSW4gVGhlIE1hY2hpbmUnOiAnNEFGQScsIC8vIFdoaXRlIEFnb255L0Z1cnkgc2t1bGwgaGl0dGluZyBwbGF5ZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdSdWJ5RXggSG9taW5nIExhc2Vycyc6ICc0QUQ2JywgLy8gc3ByZWFkIG1hcmtlcnMgZHVyaW5nIGN1dCBhbmQgcnVuXHJcbiAgICAnUnVieUV4IE1ldGVvciBTdHJlYW0nOiAnNEU2OCcsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBQMlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnUnVieUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIE5lZ2F0aXZlIEF1cmEgbG9va2F3YXkgZmFpbHVyZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdSdWJ5RXggU2NyZWVjaCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRBRUUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBpbnRvIHdhbGwnLFxyXG4gICAgICAgICAgICBkZTogJ1LDvGNrc3Rvw58gaW4gZGllIFdhbmQnLFxyXG4gICAgICAgICAgICBqYTogJ+WjgeOBuOODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA6Iez5aKZJyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBSdWJ5IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2luZGVyRHJpZnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnkgUmF2ZW5zY2xhdyc6ICc0QTkzJywgLy8gY2VudGVyZWQgY2lyY2xlIGFvZSBmb3IgcmF2ZW5zY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QTlBJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRScsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMyc6ICc0QTk0JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNCc6ICc0QTk1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNSc6ICc0RDAyJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNic6ICc0RDAzJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgUnVieSBSYXknOiAnNEFDNicsIC8vIGZyb250YWwgbGFzZXJcclxuICAgICdSdWJ5IFVuZGVybWluZSc6ICc0QTk3JywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEnOiAnNEU2OScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDInOiAnNEU2QScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDMnOiAnNEFBMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDQnOiAnNEFBMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDUnOiAnNEFBMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDYnOiAnNEFBNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDcnOiAnNEFBNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDgnOiAnNEFBNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDknOiAnNEFBNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEwJzogJzRDMjEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxMSc6ICc0QzJBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBDb21ldCBCdXJzdCc6ICc0QUI0JywgLy8gbWV0ZW9yIGV4cGxvZGluZ1xyXG4gICAgJ1J1YnkgQnJhZGFtYW50ZSc6ICc0QUJDJywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1J1YnkgSG9taW5nIExhc2VyJzogJzRBQzUnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMVxyXG4gICAgJ1J1YnkgTWV0ZW9yIFN0cmVhbSc6ICc0RTY3JywgLy8gc3ByZWFkIG1hcmtlcnMgaW4gUDJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIFVucmVhbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZVVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICc1MzdCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICc1Mzc2JyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnNTM3NScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJzUzNzgnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICc1MzZGJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJzUzNzknLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rIGJ1c3Rlci5cclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJzUzNzMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgNTM3QSBvbiB5b3UsIGJ1dCBpdCBoYXMgYW4gdW5rbm93biBuYW1lLlxyXG4gICAgICAvLyBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIGJ1dCBmb3IgYSBzaG9ydGVyIGR1cmF0aW9uLlxyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pID4gMjA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYSBXb29kXFwncyBFbWJyYWNlJzogJzNENTAnLFxyXG4gICAgLy8gJ1RpdGFuaWEgRnJvc3QgUnVuZSc6ICczRDRFJyxcclxuICAgICdUaXRhbmlhIEdlbnRsZSBCcmVlemUnOiAnM0Y4MycsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMSc6ICczRDU1JyxcclxuICAgICdUaXRhbmlhIFB1Y2tcXCdzIFJlYnVrZSc6ICczRDU4JyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAyJzogJzNFMDMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDEnOiAnM0Q1RCcsXHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMic6ICczRDVFJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgRGl2aW5hdGlvbiBSdW5lJzogJzNENUInLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuaWFFeCBXb29kXFwncyBFbWJyYWNlJzogJzNEMkYnLFxyXG4gICAgLy8gJ1RpdGFuaWFFeCBGcm9zdCBSdW5lJzogJzNEMkInLFxyXG4gICAgJ1RpdGFuaWFFeCBHZW50bGUgQnJlZXplJzogJzNGODInLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMSc6ICczRDM5JyxcclxuICAgICdUaXRhbmlhRXggUHVja1xcJ3MgUmVidWtlJzogJzNENDMnLFxyXG4gICAgJ1RpdGFuaWFFeCBXYWxsb3AnOiAnM0QzQicsXHJcbiAgICAnVGl0YW5pYUV4IExlYWZzdG9ybSAyJzogJzNENDknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWFFeCBQaGFudG9tIFJ1bmUgMSc6ICczRDRDJyxcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDInOiAnM0Q0RCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIFRPRE86IFRoaXMgY291bGQgbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiB3aXRoIHRoZSB0ZXRoZXI/XHJcbiAgICAnVGl0YW5pYUV4IFRodW5kZXIgUnVuZSc6ICczRDI5JyxcclxuICAgICdUaXRhbmlhRXggRGl2aW5hdGlvbiBSdW5lJzogJzNENEEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBVbnJlYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsVW5yZWFsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhblVuIFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1OEZFJyxcclxuICAgICdUaXRhblVuIEJ1cnN0JzogJzVBREYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTGFuZHNsaWRlJzogJzVBREMnLFxyXG4gICAgJ1RpdGFuVW4gR2FvbGVyIExhbmRzbGlkZSc6ICc1OTAyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gUm9jayBCdXN0ZXInOiAnNThGNicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhblVuIE1vdW50YWluIEJ1c3Rlcic6ICc1OEY3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWVtb3JpYU1pc2VyYUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMSc6ICc0Q0QyJyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDInOiAnNENEMycsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAzJzogJzRDRDQnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgNCc6ICc0Q0Q1JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDUnOiAnNENENicsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMSc6ICc0Q0I1JyxcclxuICAgICdWYXJpc0V4IElnbmlzIEVzdCAyJzogJzRDQzUnLFxyXG4gICAgJ1ZhcmlzRXggVmVudHVzIEVzdCAxJzogJzRDQzcnLFxyXG4gICAgJ1ZhcmlzRXggVmVudHVzIEVzdCAyJzogJzRDQzgnLFxyXG4gICAgJ1ZhcmlzRXggQXNzYXVsdCBDYW5ub24nOiAnNENFNScsXHJcbiAgICAnVmFyaXNFeCBGb3J0aXVzIFJvdGF0aW5nJzogJzRDRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gRG9uJ3QgaGl0IHRoZSBzaGllbGRzIVxyXG4gICAgJ1ZhcmlzRXggUmVwYXknOiAnNENERCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgdGhlIFwicHJvdGVhblwiIGZvcnRpdXMuXHJcbiAgICAnVmFyaXNFeCBGb3J0aXVzIFByb3RlYW4nOiAnNENFNycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdWYXJpc0V4IE1hZ2l0ZWsgQnVyc3QnOiAnNENERicsXHJcbiAgICAnVmFyaXNFeCBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICc0Q0VEJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVmFyaXNFeCBUZXJtaW51cyBFc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNENCNCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBSYWRpYW50IEJyYXZlciBpcyA0RjE2LzRGMTcoeDIpLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IERlc3BlcmFkbyBpcyA0RjE4LzRGMTksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgTWV0ZW9yIGlzIDRGMUEsIGFuZCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBtb3JlIHRoYW4gMT9cclxuLy8gVE9ETzogbWlzc2luZyBhIHRvd2VyP1xyXG5cclxuLy8gTm90ZTogRGVsaWJlcmF0ZWx5IG5vdCBpbmNsdWRpbmcgcHlyZXRpYyBkYW1hZ2UgYXMgYW4gZXJyb3IuXHJcbi8vIE5vdGU6IEl0IGRvZXNuJ3QgYXBwZWFyIHRoYXQgdGhlcmUncyBhbnkgd2F5IHRvIHRlbGwgd2hvIGZhaWxlZCB0aGUgY3V0c2NlbmUuXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdXT0wgU29sZW1uIENvbmZpdGVvcic6ICc0RjJBJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIEluJzogJzRGMTAnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTCBDb3J1c2NhbnQgU2FiZXIgT3V0JzogJzRGMTEnLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0QicsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEMnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTCBTaGluaW5nIFdhdmUnOiAnNEYyNicsIC8vIHN3b3JkIHRyaWFuZ2xlXHJcbiAgICAnV09MIENhdXRlcml6ZSc6ICc0RjI1JyxcclxuICAgICdXT0wgQnJpbXN0b25lIEVhcnRoIDEnOiAnNEYxRScsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGluaXRpYWxcclxuICAgICdXT0wgQnJpbXN0b25lIEVhcnRoIDInOiAnNEYxRicsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICAgICdXT0wgRmxhcmUgQnJlYXRoJzogJzRGMjQnLFxyXG4gICAgJ1dPTCBEZWNpbWF0aW9uJzogJzRGMjMnLFxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV09MIERlZXAgRnJlZXplJzogJzRFNicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRFRjcvNEVGOCh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRFRjkvNEVGQSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEVGQywgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBBYnNvbHV0ZSBIb2x5IHNob3VsZCBiZSBzaGFyZWQ/XHJcbi8vIFRPRE86IGludGVyc2VjdGluZyBicmltc3RvbmVzP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTEV4IFNvbGVtbiBDb25maXRlb3InOiAnNEYwQycsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIEluJzogJzRFRjInLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEVGMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNDknLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0xFeCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEEnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IFNoaW5pbmcgV2F2ZSc6ICc0RjA4JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0xFeCBDYXV0ZXJpemUnOiAnNEYwNycsXHJcbiAgICAnV09MRXggQnJpbXN0b25lIEVhcnRoJzogJzRGMDAnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdXT0xFeCBBYnNvbHV0ZSBTdG9uZSBJSUknOiAnNEVFQicsIC8vIHByb3RlYW4gd2F2ZSBpbWJ1ZWQgbWFnaWNcclxuICAgICdXT0xFeCBGbGFyZSBCcmVhdGgnOiAnNEYwNicsIC8vIHRldGhlciBmcm9tIHN1bW1vbmVkIGJhaGFtdXRzXHJcbiAgICAnV09MRXggUGVyZmVjdCBEZWNpbWF0aW9uJzogJzRGMDUnLCAvLyBzbW4vd2FyIHBoYXNlIG1hcmtlclxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV09MRXggRGVlcCBGcmVlemUnOiAnNEU2JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBCbGl6emFyZCBJSUlcclxuICAgICdXT0xFeCBEYW1hZ2UgRG93bic6ICcyNzQnLCAvLyBmYWlsaW5nIEFic29sdXRlIEZsYXNoXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ1dvbEV4IEthdG9uIFNhbiBTaGFyZSc6ICc0RUZFJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEZGJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCByZWFzb246IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRvd2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEYwNCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBtaXN0YWtlOiB7XHJcbiAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgZW46ICdNaXNzZWQgVG93ZXInLFxyXG4gICAgICAgICAgZGU6ICdUdXJtIHZlcnBhc3N0JyxcclxuICAgICAgICAgIGZyOiAnVG91ciBtYW5xdcOpZScsXHJcbiAgICAgICAgICBqYTogJ+WhlOOCkui4j+OBvuOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+ayoei4qeWhlCcsXHJcbiAgICAgICAgICBrbzogJ+yepe2MkCDsi6TsiJgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRydWUgSGFsbG93ZWQgR3JvdW5kJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEY0NCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgcmVhc29uOiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZvciBCZXJzZXJrIGFuZCBEZWVwIERhcmtzaWRlXHJcbiAgICAgIGlkOiAnV09MRXggTWlzc2VkIEludGVycnVwdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1MTU2JywgJzUxNTgnXSB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCByZWFzb246IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IEZJWCBsdW1pbm91cyBhZXRoZXJvcGxhc20gd2FybmluZyBub3Qgd29ya2luZ1xyXG4vLyBUT0RPOiBGSVggZG9sbCBkZWF0aCBub3Qgd29ya2luZ1xyXG4vLyBUT0RPOiBmYWlsaW5nIGhhbmQgb2YgcGFpbi9wYXJ0aW5nIChjaGVjayBmb3IgaGlnaCBkYW1hZ2U/KVxyXG4vLyBUT0RPOiBtYWtlIHN1cmUgZXZlcnlib2R5IHRha2VzIGV4YWN0bHkgb25lIHByb3RlYW4gKHJhdGhlciB0aGFuIHdhdGNoaW5nIGRvdWJsZSBoaXRzKVxyXG4vLyBUT0RPOiB0aHVuZGVyIG5vdCBoaXR0aW5nIGV4YWN0bHkgMj9cclxuLy8gVE9ETzogcGVyc29uIHdpdGggd2F0ZXIvdGh1bmRlciBkZWJ1ZmYgZHlpbmdcclxuLy8gVE9ETzogYmFkIG5pc2kgcGFzc1xyXG4vLyBUT0RPOiBmYWlsZWQgZ2F2ZWwgbWVjaGFuaWNcclxuLy8gVE9ETzogZG91YmxlIHJvY2tldCBwdW5jaCBub3QgaGl0dGluZyBleGFjdGx5IDI/IChvciB0YW5rcylcclxuLy8gVE9ETzogc3RhbmRpbmcgaW4gc2x1ZGdlIHB1ZGRsZXMgYmVmb3JlIGhpZGRlbiBtaW5lP1xyXG4vLyBUT0RPOiBoaWRkZW4gbWluZSBmYWlsdXJlP1xyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBvcmRhaW5lZCBtb3Rpb24gLyBzdGlsbG5lc3NcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNldmVyaXR5ICh0ZXRoZXJzKVxyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBwbGFpbnQgb2Ygc29saWRhcml0eSAoc2hhcmVkIHNlbnRlbmNlKVxyXG4vLyBUT0RPOiBvcmRhaW5lZCBjYXBpdGFsIHB1bmlzaG1lbnQgaGl0dGluZyBub24tdGFua3NcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVFcGljT2ZBbGV4YW5kZXJVbHRpbWF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVEVBIFNsdWljZSc6ICc0OUIxJyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIDEnOiAnNDgyNCcsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAyJzogJzQ5QjUnLFxyXG4gICAgJ1RFQSBTcGluIENydXNoZXInOiAnNEE3MicsXHJcbiAgICAnVEVBIFNhY3JhbWVudCc6ICc0ODVGJyxcclxuICAgICdURUEgUmFkaWFudCBTYWNyYW1lbnQnOiAnNDg4NicsXHJcbiAgICAnVEVBIEFsbWlnaHR5IEp1ZGdtZW50JzogJzQ4OTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RFQSBIYXdrIEJsYXN0ZXInOiAnNDgzMCcsXHJcbiAgICAnVEVBIENoYWtyYW0nOiAnNDg1NScsXHJcbiAgICAnVEVBIEVudW1lcmF0aW9uJzogJzQ4NTAnLFxyXG4gICAgJ1RFQSBBcG9jYWx5cHRpYyBSYXknOiAnNDg0QycsXHJcbiAgICAnVEVBIFByb3BlbGxlciBXaW5kJzogJzQ4MzInLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMSc6ICc0OUI2JyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIERvdWJsZSAyJzogJzQ4MjUnLFxyXG4gICAgJ1RFQSBGbHVpZCBTd2luZyc6ICc0OUIwJyxcclxuICAgICdURUEgRmx1aWQgU3RyaWtlJzogJzQ5QjcnLFxyXG4gICAgJ1RFQSBIaWRkZW4gTWluZSc6ICc0ODUyJyxcclxuICAgICdURUEgQWxwaGEgU3dvcmQnOiAnNDg2QicsXHJcbiAgICAnVEVBIEZsYXJldGhyb3dlcic6ICc0ODZCJyxcclxuICAgICdURUEgQ2hhc3RlbmluZyBIZWF0JzogJzRBODAnLFxyXG4gICAgJ1RFQSBEaXZpbmUgU3BlYXInOiAnNEE4MicsXHJcbiAgICAnVEVBIE9yZGFpbmVkIFB1bmlzaG1lbnQnOiAnNDg5MScsXHJcbiAgICAvLyBPcHRpY2FsIFNwcmVhZFxyXG4gICAgJ1RFQSBJbmRpdmlkdWFsIFJlcHJvYmF0aW9uJzogJzQ4OEMnLFxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgIC8vIE9wdGljYWwgU3RhY2tcclxuICAgICdURUEgQ29sbGVjdGl2ZSBSZXByb2JhdGlvbic6ICc0ODhEJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFwidG9vIG11Y2ggbHVtaW5vdXMgYWV0aGVyb3BsYXNtXCJcclxuICAgICAgLy8gV2hlbiB0aGlzIGhhcHBlbnMsIHRoZSB0YXJnZXQgZXhwbG9kZXMsIGhpdHRpbmcgbmVhcmJ5IHBlb3BsZVxyXG4gICAgICAvLyBidXQgYWxzbyB0aGVtc2VsdmVzLlxyXG4gICAgICBpZDogJ1RFQSBFeGhhdXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MUYnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnRhcmdldCA9PT0gbWF0Y2hlcy5zb3VyY2UsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnbHVtaW5vdXMgYWV0aGVyb3BsYXNtJyxcclxuICAgICAgICAgICAgZGU6ICdMdW1pbmlzemVudGVzIMOEdGhlcm9wbGFzbWEnLFxyXG4gICAgICAgICAgICBmcjogJ8OJdGjDqXJvcGxhc21hIGx1bWluZXV4JyxcclxuICAgICAgICAgICAgamE6ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgICBjbjogJ+WFieaAp+eIhumbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBEcm9wc3knLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTIxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUZXRoZXIgVHJhY2tpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdKYWdkIERvbGwnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5qYWdkVGV0aGVyID0gZGF0YS5qYWdkVGV0aGVyIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgUmVkdWNpYmxlIENvbXBsZXhpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyMScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgLy8gVGhpcyBtYXkgYmUgdW5kZWZpbmVkLCB3aGljaCBpcyBmaW5lLlxyXG4gICAgICAgICAgbmFtZTogZGF0YS5qYWdkVGV0aGVyID8gZGF0YS5qYWdkVGV0aGVyW21hdGNoZXMuc291cmNlSWRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RvbGwgRGVhdGgnLFxyXG4gICAgICAgICAgICBkZTogJ1B1cHBlIFRvdCcsXHJcbiAgICAgICAgICAgIGZyOiAnUG91cMOpZSBtb3J0ZScsXHJcbiAgICAgICAgICAgIGphOiAn44OJ44O844Or44GM5q2744KT44GgJyxcclxuICAgICAgICAgICAgY246ICfmta7lo6vlvrfmrbvkuqEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJhaW5hZ2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyNycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEucGFydHkuaXNUYW5rKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZSBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlID0gZGF0YS5oYXNUaHJvdHRsZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZSBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlID0gZGF0YS5oYXNUaHJvdHRsZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNUaHJvdHRsZSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEJhbGxvb24gUG9wcGluZy4gIEl0IHNlZW1zIGxpa2UgdGhlIHBlcnNvbiB3aG8gcG9wcyBpdCBpcyB0aGVcclxuICAgICAgLy8gZmlyc3QgcGVyc29uIGxpc3RlZCBkYW1hZ2Utd2lzZSwgc28gdGhleSBhcmUgbGlrZWx5IHRoZSBjdWxwcml0LlxyXG4gICAgICBpZDogJ1RFQSBPdXRidXJzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODJBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLnNvdXJjZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgZmlsZTAgZnJvbSAnLi8wMC1taXNjL2J1ZmZzLmpzJztcbmltcG9ydCBmaWxlMSBmcm9tICcuLzAwLW1pc2MvZ2VuZXJhbC5qcyc7XG5pbXBvcnQgZmlsZTIgZnJvbSAnLi8wMC1taXNjL3Rlc3QuanMnO1xuaW1wb3J0IGZpbGUzIGZyb20gJy4vMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzJztcbmltcG9ydCBmaWxlNCBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyc7XG5pbXBvcnQgZmlsZTUgZnJvbSAnLi8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyc7XG5pbXBvcnQgZmlsZTYgZnJvbSAnLi8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMnO1xuaW1wb3J0IGZpbGU3IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzJztcbmltcG9ydCBmaWxlOCBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1obS50cyc7XG5pbXBvcnQgZmlsZTkgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMnO1xuaW1wb3J0IGZpbGUxMCBmcm9tICcuLzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS5qcyc7XG5pbXBvcnQgZmlsZTExIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9hZXRoZXJvY2hlbWljYWxfcmVzZWFyY2hfZmFjaWxpdHkuanMnO1xuaW1wb3J0IGZpbGUxMiBmcm9tICcuLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMnO1xuaW1wb3J0IGZpbGUxMyBmcm9tICcuLzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLmpzJztcbmltcG9ydCBmaWxlMTQgZnJvbSAnLi8wMy1ody9kdW5nZW9uL3NvaG1fYWxfaGFyZC5qcyc7XG5pbXBvcnQgZmlsZTE1IGZyb20gJy4vMDMtaHcvcmFpZC9hMTJuLmpzJztcbmltcG9ydCBmaWxlMTYgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2FsYV9taGlnby5qcyc7XG5pbXBvcnQgZmlsZTE3IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS5qcyc7XG5pbXBvcnQgZmlsZTE4IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzJztcbmltcG9ydCBmaWxlMTkgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N0X21vY2lhbm5lX2hhcmQudHMnO1xuaW1wb3J0IGZpbGUyMCBmcm9tICcuLzA0LXNiL2R1bmdlb24vc3dhbGxvd3NfY29tcGFzcy5qcyc7XG5pbXBvcnQgZmlsZTIxIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMnO1xuaW1wb3J0IGZpbGUyMiBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGhlX2J1cm4udHMnO1xuaW1wb3J0IGZpbGUyMyBmcm9tICcuLzA0LXNiL3JhaWQvbzFuLnRzJztcbmltcG9ydCBmaWxlMjQgZnJvbSAnLi8wNC1zYi9yYWlkL28ybi5qcyc7XG5pbXBvcnQgZmlsZTI1IGZyb20gJy4vMDQtc2IvcmFpZC9vM24uanMnO1xuaW1wb3J0IGZpbGUyNiBmcm9tICcuLzA0LXNiL3JhaWQvbzRuLmpzJztcbmltcG9ydCBmaWxlMjcgZnJvbSAnLi8wNC1zYi9yYWlkL280cy5qcyc7XG5pbXBvcnQgZmlsZTI4IGZyb20gJy4vMDQtc2IvcmFpZC9vN3MuanMnO1xuaW1wb3J0IGZpbGUyOSBmcm9tICcuLzA0LXNiL3JhaWQvbzEycy5qcyc7XG5pbXBvcnQgZmlsZTMwIGZyb20gJy4vMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzJztcbmltcG9ydCBmaWxlMzEgZnJvbSAnLi8wNC1zYi90cmlhbC9zaGlucnl1LmpzJztcbmltcG9ydCBmaWxlMzIgZnJvbSAnLi8wNC1zYi90cmlhbC9zdXNhbm8tZXgudHMnO1xuaW1wb3J0IGZpbGUzMyBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMnO1xuaW1wb3J0IGZpbGUzNCBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUuanMnO1xuaW1wb3J0IGZpbGUzNSBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkudHMnO1xuaW1wb3J0IGZpbGUzNiBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMnO1xuaW1wb3J0IGZpbGUzNyBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC5qcyc7XG5pbXBvcnQgZmlsZTM4IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTM5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyc7XG5pbXBvcnQgZmlsZTQwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTQxIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLmpzJztcbmltcG9ydCBmaWxlNDIgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMnO1xuaW1wb3J0IGZpbGU0MyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLnRzJztcbmltcG9ydCBmaWxlNDQgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLnRzJztcbmltcG9ydCBmaWxlNDUgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyc7XG5pbXBvcnQgZmlsZTQ2IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy50cyc7XG5pbXBvcnQgZmlsZTQ3IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4udHMnO1xuaW1wb3J0IGZpbGU0OCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyc7XG5pbXBvcnQgZmlsZTQ5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy50cyc7XG5pbXBvcnQgZmlsZTUwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcudHMnO1xuaW1wb3J0IGZpbGU1MSBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyc7XG5pbXBvcnQgZmlsZTUyIGZyb20gJy4vMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS5qcyc7XG5pbXBvcnQgZmlsZTUzIGZyb20gJy4vMDUtc2hiL3JhaWQvZTFuLnRzJztcbmltcG9ydCBmaWxlNTQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMXMudHMnO1xuaW1wb3J0IGZpbGU1NSBmcm9tICcuLzA1LXNoYi9yYWlkL2Uybi5qcyc7XG5pbXBvcnQgZmlsZTU2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTJzLmpzJztcbmltcG9ydCBmaWxlNTcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lM24udHMnO1xuaW1wb3J0IGZpbGU1OCBmcm9tICcuLzA1LXNoYi9yYWlkL2Uzcy50cyc7XG5pbXBvcnQgZmlsZTU5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTRuLnRzJztcbmltcG9ydCBmaWxlNjAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNHMuanMnO1xuaW1wb3J0IGZpbGU2MSBmcm9tICcuLzA1LXNoYi9yYWlkL2U1bi5qcyc7XG5pbXBvcnQgZmlsZTYyIGZyb20gJy4vMDUtc2hiL3JhaWQvZTVzLmpzJztcbmltcG9ydCBmaWxlNjMgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNm4udHMnO1xuaW1wb3J0IGZpbGU2NCBmcm9tICcuLzA1LXNoYi9yYWlkL2U2cy50cyc7XG5pbXBvcnQgZmlsZTY1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTduLmpzJztcbmltcG9ydCBmaWxlNjYgZnJvbSAnLi8wNS1zaGIvcmFpZC9lN3MudHMnO1xuaW1wb3J0IGZpbGU2NyBmcm9tICcuLzA1LXNoYi9yYWlkL2U4bi5qcyc7XG5pbXBvcnQgZmlsZTY4IGZyb20gJy4vMDUtc2hiL3JhaWQvZThzLmpzJztcbmltcG9ydCBmaWxlNjkgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOW4udHMnO1xuaW1wb3J0IGZpbGU3MCBmcm9tICcuLzA1LXNoYi9yYWlkL2U5cy5qcyc7XG5pbXBvcnQgZmlsZTcxIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwbi50cyc7XG5pbXBvcnQgZmlsZTcyIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwcy5qcyc7XG5pbXBvcnQgZmlsZTczIGZyb20gJy4vMDUtc2hiL3JhaWQvZTExbi5qcyc7XG5pbXBvcnQgZmlsZTc0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExcy5qcyc7XG5pbXBvcnQgZmlsZTc1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEybi50cyc7XG5pbXBvcnQgZmlsZTc2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEycy5qcyc7XG5pbXBvcnQgZmlsZTc3IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LmpzJztcbmltcG9ydCBmaWxlNzggZnJvbSAnLi8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMnO1xuaW1wb3J0IGZpbGU3OSBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTgwIGZyb20gJy4vMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLmpzJztcbmltcG9ydCBmaWxlODEgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMnO1xuaW1wb3J0IGZpbGU4MiBmcm9tICcuLzA1LXNoYi90cmlhbC9oYWRlcy50cyc7XG5pbXBvcnQgZmlsZTgzIGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC50cyc7XG5pbXBvcnQgZmlsZTg0IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyc7XG5pbXBvcnQgZmlsZTg1IGZyb20gJy4vMDUtc2hiL3RyaWFsL2xldmktdW4uanMnO1xuaW1wb3J0IGZpbGU4NiBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi1leC5qcyc7XG5pbXBvcnQgZmlsZTg3IGZyb20gJy4vMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlODggZnJvbSAnLi8wNS1zaGIvdHJpYWwvc2hpdmEtdW4uanMnO1xuaW1wb3J0IGZpbGU4OSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLnRzJztcbmltcG9ydCBmaWxlOTAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyc7XG5pbXBvcnQgZmlsZTkxIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzJztcbmltcG9ydCBmaWxlOTIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdmFyaXMtZXguanMnO1xuaW1wb3J0IGZpbGU5MyBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wuanMnO1xuaW1wb3J0IGZpbGU5NCBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wtZXguanMnO1xuaW1wb3J0IGZpbGU5NSBmcm9tICcuLzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCB7JzAwLW1pc2MvYnVmZnMuanMnOiBmaWxlMCwnMDAtbWlzYy9nZW5lcmFsLmpzJzogZmlsZTEsJzAwLW1pc2MvdGVzdC5qcyc6IGZpbGUyLCcwMi1hcnIvdHJpYWwvaWZyaXQtbm0udHMnOiBmaWxlMywnMDItYXJyL3RyaWFsL3RpdGFuLW5tLnRzJzogZmlsZTQsJzAyLWFyci90cmlhbC9sZXZpLWV4LmpzJzogZmlsZTUsJzAyLWFyci90cmlhbC9zaGl2YS1obS5qcyc6IGZpbGU2LCcwMi1hcnIvdHJpYWwvc2hpdmEtZXguanMnOiBmaWxlNywnMDItYXJyL3RyaWFsL3RpdGFuLWhtLnRzJzogZmlsZTgsJzAyLWFyci90cmlhbC90aXRhbi1leC50cyc6IGZpbGU5LCcwMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkuanMnOiBmaWxlMTAsJzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzJzogZmlsZTExLCcwMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLnRzJzogZmlsZTEyLCcwMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC5qcyc6IGZpbGUxMywnMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMnOiBmaWxlMTQsJzAzLWh3L3JhaWQvYTEybi5qcyc6IGZpbGUxNSwnMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28uanMnOiBmaWxlMTYsJzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMnOiBmaWxlMTcsJzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS5qcyc6IGZpbGUxOCwnMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJzogZmlsZTE5LCcwNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMnOiBmaWxlMjAsJzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJzogZmlsZTIxLCcwNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJzogZmlsZTIyLCcwNC1zYi9yYWlkL28xbi50cyc6IGZpbGUyMywnMDQtc2IvcmFpZC9vMm4uanMnOiBmaWxlMjQsJzA0LXNiL3JhaWQvbzNuLmpzJzogZmlsZTI1LCcwNC1zYi9yYWlkL280bi5qcyc6IGZpbGUyNiwnMDQtc2IvcmFpZC9vNHMuanMnOiBmaWxlMjcsJzA0LXNiL3JhaWQvbzdzLmpzJzogZmlsZTI4LCcwNC1zYi9yYWlkL28xMnMuanMnOiBmaWxlMjksJzA0LXNiL3RyaWFsL2J5YWtrby1leC5qcyc6IGZpbGUzMCwnMDQtc2IvdHJpYWwvc2hpbnJ5dS5qcyc6IGZpbGUzMSwnMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzJzogZmlsZTMyLCcwNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLmpzJzogZmlsZTMzLCcwNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLmpzJzogZmlsZTM0LCcwNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzJzogZmlsZTM1LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzJzogZmlsZTM2LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2guanMnOiBmaWxlMzcsJzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMnOiBmaWxlMzgsJzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMnOiBmaWxlMzksJzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIudHMnOiBmaWxlNDAsJzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyc6IGZpbGU0MSwnMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LmpzJzogZmlsZTQyLCcwNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC50cyc6IGZpbGU0MywnMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyc6IGZpbGU0NCwnMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMnOiBmaWxlNDUsJzA1LXNoYi9kdW5nZW9uL210X2d1bGcudHMnOiBmaWxlNDYsJzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzJzogZmlsZTQ3LCcwNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMnOiBmaWxlNDgsJzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MudHMnOiBmaWxlNDksJzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzJzogZmlsZTUwLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUuanMnOiBmaWxlNTEsJzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UuanMnOiBmaWxlNTIsJzA1LXNoYi9yYWlkL2Uxbi50cyc6IGZpbGU1MywnMDUtc2hiL3JhaWQvZTFzLnRzJzogZmlsZTU0LCcwNS1zaGIvcmFpZC9lMm4uanMnOiBmaWxlNTUsJzA1LXNoYi9yYWlkL2Uycy5qcyc6IGZpbGU1NiwnMDUtc2hiL3JhaWQvZTNuLnRzJzogZmlsZTU3LCcwNS1zaGIvcmFpZC9lM3MudHMnOiBmaWxlNTgsJzA1LXNoYi9yYWlkL2U0bi50cyc6IGZpbGU1OSwnMDUtc2hiL3JhaWQvZTRzLmpzJzogZmlsZTYwLCcwNS1zaGIvcmFpZC9lNW4uanMnOiBmaWxlNjEsJzA1LXNoYi9yYWlkL2U1cy5qcyc6IGZpbGU2MiwnMDUtc2hiL3JhaWQvZTZuLnRzJzogZmlsZTYzLCcwNS1zaGIvcmFpZC9lNnMudHMnOiBmaWxlNjQsJzA1LXNoYi9yYWlkL2U3bi5qcyc6IGZpbGU2NSwnMDUtc2hiL3JhaWQvZTdzLnRzJzogZmlsZTY2LCcwNS1zaGIvcmFpZC9lOG4uanMnOiBmaWxlNjcsJzA1LXNoYi9yYWlkL2U4cy5qcyc6IGZpbGU2OCwnMDUtc2hiL3JhaWQvZTluLnRzJzogZmlsZTY5LCcwNS1zaGIvcmFpZC9lOXMuanMnOiBmaWxlNzAsJzA1LXNoYi9yYWlkL2UxMG4udHMnOiBmaWxlNzEsJzA1LXNoYi9yYWlkL2UxMHMuanMnOiBmaWxlNzIsJzA1LXNoYi9yYWlkL2UxMW4uanMnOiBmaWxlNzMsJzA1LXNoYi9yYWlkL2UxMXMuanMnOiBmaWxlNzQsJzA1LXNoYi9yYWlkL2UxMm4udHMnOiBmaWxlNzUsJzA1LXNoYi9yYWlkL2UxMnMuanMnOiBmaWxlNzYsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyc6IGZpbGU3NywnMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLmpzJzogZmlsZTc4LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXgudHMnOiBmaWxlNzksJzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyc6IGZpbGU4MCwnMDUtc2hiL3RyaWFsL2hhZGVzLWV4LmpzJzogZmlsZTgxLCcwNS1zaGIvdHJpYWwvaGFkZXMudHMnOiBmaWxlODIsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMnOiBmaWxlODMsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMnOiBmaWxlODQsJzA1LXNoYi90cmlhbC9sZXZpLXVuLmpzJzogZmlsZTg1LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMnOiBmaWxlODYsJzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyc6IGZpbGU4NywnMDUtc2hiL3RyaWFsL3NoaXZhLXVuLmpzJzogZmlsZTg4LCcwNS1zaGIvdHJpYWwvdGl0YW5pYS50cyc6IGZpbGU4OSwnMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXgudHMnOiBmaWxlOTAsJzA1LXNoYi90cmlhbC90aXRhbi11bi50cyc6IGZpbGU5MSwnMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzJzogZmlsZTkyLCcwNS1zaGIvdHJpYWwvd29sLmpzJzogZmlsZTkzLCcwNS1zaGIvdHJpYWwvd29sLWV4LmpzJzogZmlsZTk0LCcwNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzJzogZmlsZTk1LH07Il0sInNvdXJjZVJvb3QiOiIifQ==