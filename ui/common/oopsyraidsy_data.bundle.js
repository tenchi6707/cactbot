(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 1843:
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

































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.js': buffs,'00-misc/general.js': general,'00-misc/test.js': test,'02-arr/trial/ifrit-nm.ts': ifrit_nm,'02-arr/trial/titan-nm.ts': titan_nm,'02-arr/trial/levi-ex.ts': levi_ex,'02-arr/trial/shiva-hm.js': shiva_hm,'02-arr/trial/shiva-ex.ts': shiva_ex,'02-arr/trial/titan-hm.ts': titan_hm,'02-arr/trial/titan-ex.ts': titan_ex,'03-hw/alliance/weeping_city.js': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.ts': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.ts': fractal_continuum,'03-hw/dungeon/gubal_library_hard.js': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.ts': sohm_al_hard,'03-hw/raid/a12n.js': a12n,'04-sb/dungeon/ala_mhigo.ts': ala_mhigo,'04-sb/dungeon/bardams_mettle.ts': bardams_mettle,'04-sb/dungeon/kugane_castle.ts': kugane_castle,'04-sb/dungeon/st_mocianne_hard.ts': st_mocianne_hard,'04-sb/dungeon/swallows_compass.ts': swallows_compass,'04-sb/dungeon/temple_of_the_fist.ts': temple_of_the_fist,'04-sb/dungeon/the_burn.ts': the_burn,'04-sb/raid/o1n.ts': o1n,'04-sb/raid/o2n.ts': o2n,'04-sb/raid/o3n.js': o3n,'04-sb/raid/o4n.ts': o4n,'04-sb/raid/o4s.js': o4s,'04-sb/raid/o7s.ts': o7s,'04-sb/raid/o12s.js': o12s,'04-sb/trial/byakko-ex.ts': byakko_ex,'04-sb/trial/shinryu.ts': shinryu,'04-sb/trial/susano-ex.ts': susano_ex,'04-sb/ultimate/ultima_weapon_ultimate.ts': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.js': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.ts': the_copied_factory,'05-shb/alliance/the_puppets_bunker.ts': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.ts': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.ts': akadaemia_anyder,'05-shb/dungeon/amaurot.ts': amaurot,'05-shb/dungeon/anamnesis_anyder.ts': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.ts': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.ts': heroes_gauntlet,'05-shb/dungeon/holminster_switch.ts': holminster_switch,'05-shb/dungeon/malikahs_well.ts': malikahs_well,'05-shb/dungeon/matoyas_relict.ts': matoyas_relict,'05-shb/dungeon/mt_gulg.ts': mt_gulg,'05-shb/dungeon/paglthan.ts': paglthan,'05-shb/dungeon/qitana_ravel.ts': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.ts': the_grand_cosmos,'05-shb/dungeon/twinning.ts': twinning,'05-shb/eureka/delubrum_reginae.ts': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.ts': delubrum_reginae_savage,'05-shb/raid/e1n.ts': e1n,'05-shb/raid/e1s.ts': e1s,'05-shb/raid/e2n.ts': e2n,'05-shb/raid/e2s.ts': e2s,'05-shb/raid/e3n.ts': e3n,'05-shb/raid/e3s.ts': e3s,'05-shb/raid/e4n.ts': e4n,'05-shb/raid/e4s.js': e4s,'05-shb/raid/e5n.js': e5n,'05-shb/raid/e5s.js': e5s,'05-shb/raid/e6n.ts': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.js': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.ts': e8n,'05-shb/raid/e8s.ts': e8s,'05-shb/raid/e9n.ts': e9n,'05-shb/raid/e9s.ts': e9s,'05-shb/raid/e10n.ts': e10n,'05-shb/raid/e10s.ts': e10s,'05-shb/raid/e11n.ts': e11n,'05-shb/raid/e11s.ts': e11s,'05-shb/raid/e12n.ts': e12n,'05-shb/raid/e12s.js': e12s,'05-shb/trial/diamond_weapon-ex.ts': diamond_weapon_ex,'05-shb/trial/diamond_weapon.ts': diamond_weapon,'05-shb/trial/emerald_weapon-ex.ts': emerald_weapon_ex,'05-shb/trial/emerald_weapon.ts': emerald_weapon,'05-shb/trial/hades-ex.js': hades_ex,'05-shb/trial/hades.ts': hades,'05-shb/trial/innocence-ex.ts': innocence_ex,'05-shb/trial/innocence.ts': innocence,'05-shb/trial/levi-un.ts': levi_un,'05-shb/trial/ruby_weapon-ex.ts': ruby_weapon_ex,'05-shb/trial/ruby_weapon.ts': ruby_weapon,'05-shb/trial/shiva-un.ts': shiva_un,'05-shb/trial/titania.ts': titania,'05-shb/trial/titania-ex.ts': titania_ex,'05-shb/trial/titan-un.ts': titan_un,'05-shb/trial/varis-ex.ts': varis_ex,'05-shb/trial/wol.ts': wol,'05-shb/trial/wol-ex.ts': wol_ex,'05-shb/ultimate/the_epic_of_alexander.js': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2gudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6WyJhYmlsaXR5Q29sbGVjdFNlY29uZHMiLCJlZmZlY3RDb2xsZWN0U2Vjb25kcyIsImlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMiLCJkYXRhIiwibWF0Y2hlcyIsInNvdXJjZUlkIiwidG9VcHBlckNhc2UiLCJwYXJ0eSIsInBhcnR5SWRzIiwiaW5jbHVkZXMiLCJwZXRJZFRvT3duZXJJZCIsIm93bmVySWQiLCJtaXNzZWRGdW5jIiwiYXJncyIsImlkIiwidHJpZ2dlcklkIiwibmV0UmVnZXgiLCJjb25kaXRpb24iLCJydW4iLCJnZW5lcmFsQnVmZkNvbGxlY3Rpb24iLCJwdXNoIiwiZGVsYXlTZWNvbmRzIiwiY29sbGVjdFNlY29uZHMiLCJzdXBwcmVzc1NlY29uZHMiLCJtaXN0YWtlIiwiX21hdGNoZXMiLCJhbGxNYXRjaGVzIiwicGFydHlOYW1lcyIsImdvdEJ1ZmZNYXAiLCJuYW1lIiwiZmlyc3RNYXRjaCIsInNvdXJjZU5hbWUiLCJzb3VyY2UiLCJwZXRJZCIsIm93bmVyTmFtZSIsIm5hbWVGcm9tSWQiLCJjb25zb2xlIiwiZXJyb3IiLCJpZ25vcmVTZWxmIiwidGhpbmdOYW1lIiwiZmllbGQiLCJ0YXJnZXQiLCJtaXNzZWQiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwieCIsImxlbmd0aCIsInR5cGUiLCJibGFtZSIsInRleHQiLCJlbiIsIm1hcCIsIlNob3J0TmFtZSIsImpvaW4iLCJkZSIsImZyIiwiamEiLCJjbiIsImtvIiwibWlzc2VkTWl0aWdhdGlvbkJ1ZmYiLCJlZmZlY3RJZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJOZXRSZWdleGVzIiwibWlzc2VkRGFtYWdlQWJpbGl0eSIsImFiaWxpdHlJZCIsIm1pc3NlZEhlYWwiLCJtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSIsInpvbmVJZCIsIlpvbmVJZCIsInRyaWdnZXJzIiwiX2RhdGEiLCJsb3N0Rm9vZCIsImluQ29tYmF0IiwiSXNQbGF5ZXJJZCIsImxpbmUiLCJuZXRSZWdleEZyIiwibmV0UmVnZXhKYSIsIm5ldFJlZ2V4Q24iLCJuZXRSZWdleEtvIiwibWUiLCJzdHJpa2luZ0R1bW15QnlMb2NhbGUiLCJzdHJpa2luZ0R1bW15TmFtZXMiLCJ2YWx1ZXMiLCJib290Q291bnQiLCJhYmlsaXR5IiwiRGFtYWdlRnJvbU1hdGNoZXMiLCJlZmZlY3QiLCJwb2tlQ291bnQiLCJkYW1hZ2VXYXJuIiwic2hhcmVXYXJuIiwic2hhcmVGYWlsIiwic2VlbkRpYW1vbmREdXN0IiwiZ2FpbnNFZmZlY3RXYXJuIiwiem9tYmllIiwic2hpZWxkIiwiZGVhdGhSZWFzb24iLCJyZWFzb24iLCJkYW1hZ2VGYWlsIiwiaGFzSW1wIiwicGxheWVyRGFtYWdlRmllbGRzIiwiYXNzYXVsdCIsImNhcHR1cmUiLCJuZXRSZWdleERlIiwicGhhc2VOdW1iZXIiLCJpbml0aWFsaXplZCIsImdhbWVDb3VudCIsInRhcmdldElkIiwiaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQiLCJpc05lb0V4ZGVhdGgiLCJhYmlsaXR5TmFtZSIsImhhc0JleW9uZERlYXRoIiwicGFyc2VGbG9hdCIsImR1cmF0aW9uIiwiZG91YmxlQXR0YWNrTWF0Y2hlcyIsImFyciIsInZ1bG4iLCJmbGFncyIsImtGbGFnSW5zdGFudERlYXRoIiwiaGFzRG9vbSIsImZhdWx0TGluZVRhcmdldCIsImhhc09yYiIsImNsb3VkTWFya2VycyIsIm0iLCJub09yYiIsInN0ciIsImhhdGVkIiwid3JvbmdCdWZmIiwibm9CdWZmIiwiaGFzQXN0cmFsIiwiaGFzVW1icmFsIiwiZmlyc3RIZWFkbWFya2VyIiwicGFyc2VJbnQiLCJnZXRIZWFkbWFya2VySWQiLCJkZWNPZmZzZXQiLCJ0b1N0cmluZyIsInBhZFN0YXJ0IiwiZ2FpbnNFZmZlY3RGYWlsIiwic29sb1dhcm4iLCJmaXJzdExhc2VyTWFya2VyIiwibGFzdExhc2VyTWFya2VyIiwibGFzZXJOYW1lVG9OdW0iLCJzY3VscHR1cmVZUG9zaXRpb25zIiwieSIsInNjdWxwdHVyZVRldGhlck5hbWVUb0lkIiwiYmxhZGVPZkZsYW1lQ291bnQiLCJudW1iZXIiLCJuYW1lcyIsIndpdGhOdW0iLCJvd25lcnMiLCJtaW5pbXVtWWFsbXNGb3JTdGF0dWVzIiwiaXNTdGF0dWVQb3NpdGlvbktub3duIiwiaXNTdGF0dWVOb3J0aCIsInNjdWxwdHVyZUlkcyIsIm90aGVySWQiLCJzb3VyY2VZIiwib3RoZXJZIiwieURpZmYiLCJNYXRoIiwiYWJzIiwib3duZXIiLCJvd25lck5pY2siLCJwaWxsYXJJZFRvT3duZXIiLCJwaWxsYXJPd25lciIsImZpcmUiLCJzbWFsbExpb25JZFRvT3duZXIiLCJzbWFsbExpb25Pd25lcnMiLCJoYXNTbWFsbExpb24iLCJoYXNGaXJlRGVidWZmIiwiY2VudGVyWSIsImRpck9iaiIsIk91dHB1dHMiLCJub3J0aEJpZ0xpb24iLCJzaW5nbGVUYXJnZXQiLCJvdXRwdXQiLCJzb3V0aEJpZ0xpb24iLCJzaGFyZWQiLCJmaXJlRGVidWZmIiwibGFiZWxzIiwicGFyc2VyTGFuZyIsImhhc0RhcmsiLCJzb2xvRmFpbCIsImphZ2RUZXRoZXIiLCJ1bmRlZmluZWQiLCJpc1RhbmsiLCJoYXNUaHJvdHRsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtDQUdBOztBQUNBLE1BQU1BLHFCQUFxQixHQUFHLEdBQTlCLEMs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dCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBBYmlsaXRpZXMgc2VlbSBpbnN0YW50LlxyXG5jb25zdCBhYmlsaXR5Q29sbGVjdFNlY29uZHMgPSAwLjU7XHJcbi8vIE9ic2VydmF0aW9uOiB1cCB0byB+MS4yIHNlY29uZHMgZm9yIGEgYnVmZiB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG5jb25zdCBlZmZlY3RDb2xsZWN0U2Vjb25kcyA9IDIuMDtcclxuXHJcbmNvbnN0IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMgPSAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gIGNvbnN0IHNvdXJjZUlkID0gbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gIGlmIChkYXRhLnBhcnR5LnBhcnR5SWRzLmluY2x1ZGVzKHNvdXJjZUlkKSlcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICBpZiAoZGF0YS5wZXRJZFRvT3duZXJJZCkge1xyXG4gICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbc291cmNlSWRdO1xyXG4gICAgaWYgKG93bmVySWQgJiYgZGF0YS5wYXJ0eS5wYXJ0eUlkcy5pbmNsdWRlcyhvd25lcklkKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vLyBhcmdzOiB0cmlnZ2VySWQsIG5ldFJlZ2V4LCBmaWVsZCwgdHlwZSwgaWdub3JlU2VsZlxyXG5jb25zdCBtaXNzZWRGdW5jID0gKGFyZ3MpID0+IFtcclxuICB7XHJcbiAgICAvLyBTdXJlLCBub3QgYWxsIG9mIHRoZXNlIGFyZSBcImJ1ZmZzXCIgcGVyIHNlLCBidXQgdGhleSdyZSBhbGwgaW4gdGhlIGJ1ZmZzIGZpbGUuXHJcbiAgICBpZDogYEJ1ZmYgJHthcmdzLnRyaWdnZXJJZH0gQ29sbGVjdGAsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogaXNJblBhcnR5Q29uZGl0aW9uRnVuYyxcclxuICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24gPSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbiB8fCB7fTtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdID0gZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdIHx8IFtdO1xyXG4gICAgICBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvblthcmdzLnRyaWdnZXJJZF0ucHVzaChtYXRjaGVzKTtcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogYEJ1ZmYgJHthcmdzLnRyaWdnZXJJZH1gLFxyXG4gICAgbmV0UmVnZXg6IGFyZ3MubmV0UmVnZXgsXHJcbiAgICBjb25kaXRpb246IGlzSW5QYXJ0eUNvbmRpdGlvbkZ1bmMsXHJcbiAgICBkZWxheVNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMsXHJcbiAgICBzdXBwcmVzc1NlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMsXHJcbiAgICBtaXN0YWtlOiAoZGF0YSwgX21hdGNoZXMpID0+IHtcclxuICAgICAgaWYgKCFkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbilcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNvbnN0IGFsbE1hdGNoZXMgPSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvblthcmdzLnRyaWdnZXJJZF07XHJcbiAgICAgIGlmICghYWxsTWF0Y2hlcylcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBwYXJ0eU5hbWVzID0gZGF0YS5wYXJ0eS5wYXJ0eU5hbWVzO1xyXG5cclxuICAgICAgLy8gVE9ETzogY29uc2lkZXIgZGVhZCBwZW9wbGUgc29tZWhvd1xyXG4gICAgICBjb25zdCBnb3RCdWZmTWFwID0ge307XHJcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBwYXJ0eU5hbWVzKVxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbmFtZV0gPSBmYWxzZTtcclxuXHJcbiAgICAgIGNvbnN0IGZpcnN0TWF0Y2ggPSBhbGxNYXRjaGVzWzBdO1xyXG4gICAgICBsZXQgc291cmNlTmFtZSA9IGZpcnN0TWF0Y2guc291cmNlO1xyXG4gICAgICAvLyBCbGFtZSBwZXQgbWlzdGFrZXMgb24gb3duZXJzLlxyXG4gICAgICBpZiAoZGF0YS5wZXRJZFRvT3duZXJJZCkge1xyXG4gICAgICAgIGNvbnN0IHBldElkID0gZmlyc3RNYXRjaC5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBkYXRhLnBldElkVG9Pd25lcklkW3BldElkXTtcclxuICAgICAgICBpZiAob3duZXJJZCkge1xyXG4gICAgICAgICAgY29uc3Qgb3duZXJOYW1lID0gZGF0YS5wYXJ0eS5uYW1lRnJvbUlkKG93bmVySWQpO1xyXG4gICAgICAgICAgaWYgKG93bmVyTmFtZSlcclxuICAgICAgICAgICAgc291cmNlTmFtZSA9IG93bmVyTmFtZTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ291bGRuJ3QgZmluZCBuYW1lIGZvciAke293bmVySWR9IGZyb20gcGV0ICR7cGV0SWR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYXJncy5pZ25vcmVTZWxmKVxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbc291cmNlTmFtZV0gPSB0cnVlO1xyXG5cclxuICAgICAgY29uc3QgdGhpbmdOYW1lID0gZmlyc3RNYXRjaFthcmdzLmZpZWxkXTtcclxuICAgICAgZm9yIChjb25zdCBtYXRjaGVzIG9mIGFsbE1hdGNoZXMpIHtcclxuICAgICAgICAvLyBJbiBjYXNlIHlvdSBoYXZlIG11bHRpcGxlIHBhcnR5IG1lbWJlcnMgd2hvIGhpdCB0aGUgc2FtZSBjb29sZG93biBhdCB0aGUgc2FtZVxyXG4gICAgICAgIC8vIHRpbWUgKGxvbD8pLCB0aGVuIGlnbm9yZSBhbnlib2R5IHdobyB3YXNuJ3QgdGhlIGZpcnN0LlxyXG4gICAgICAgIGlmIChtYXRjaGVzLnNvdXJjZSAhPT0gZmlyc3RNYXRjaC5zb3VyY2UpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgZ290QnVmZk1hcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtaXNzZWQgPSBPYmplY3Qua2V5cyhnb3RCdWZmTWFwKS5maWx0ZXIoKHgpID0+ICFnb3RCdWZmTWFwW3hdKTtcclxuICAgICAgaWYgKG1pc3NlZC5sZW5ndGggPT09IDApXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gVE9ETzogb29wc3kgY291bGQgcmVhbGx5IHVzZSBtb3VzZW92ZXIgcG9wdXBzIGZvciBkZXRhaWxzLlxyXG4gICAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5LCBpZiB3ZSBoYXZlIGEgZGVhdGggcmVwb3J0LCBpdCdkIGJlIGdvb2QgdG9cclxuICAgICAgLy8gZXhwbGljaXRseSBjYWxsIG91dCB0aGF0IG90aGVyIHBlb3BsZSBnb3QgYSBoZWFsIHRoaXMgcGVyc29uIGRpZG4ndC5cclxuICAgICAgaWYgKG1pc3NlZC5sZW5ndGggPCA0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6IGFyZ3MudHlwZSxcclxuICAgICAgICAgIGJsYW1lOiBzb3VyY2VOYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogdGhpbmdOYW1lICsgJyBtaXNzZWQgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpLFxyXG4gICAgICAgICAgICBkZTogdGhpbmdOYW1lICsgJyB2ZXJmZWhsdCAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyksXHJcbiAgICAgICAgICAgIGZyOiB0aGluZ05hbWUgKyAnIG1hbnF1w6koZSkgc3VyICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSxcclxuICAgICAgICAgICAgamE6ICcoJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJykg44GMJyArIHRoaW5nTmFtZSArICfjgpLlj5fjgZHjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJykgKyAnIOayoeWPl+WIsCAnICsgdGhpbmdOYW1lLFxyXG4gICAgICAgICAgICBrbzogdGhpbmdOYW1lICsgJyAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJykgKyAn7JeQ6rKMIOyggeyaqeyViOuQqCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgLy8gSWYgdGhlcmUncyB0b28gbWFueSBwZW9wbGUsIGp1c3QgbGlzdCB0aGUgbnVtYmVyIG9mIHBlb3BsZSBtaXNzZWQuXHJcbiAgICAgIC8vIFRPRE86IHdlIGNvdWxkIGFsc28gbGlzdCBldmVyeWJvZHkgb24gc2VwYXJhdGUgbGluZXM/XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdHlwZTogYXJncy50eXBlLFxyXG4gICAgICAgIGJsYW1lOiBzb3VyY2VOYW1lLFxyXG4gICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgIGVuOiB0aGluZ05hbWUgKyAnIG1pc3NlZCAnICsgbWlzc2VkLmxlbmd0aCArICcgcGVvcGxlJyxcclxuICAgICAgICAgIGRlOiB0aGluZ05hbWUgKyAnIHZlcmZlaGx0ZSAnICsgbWlzc2VkLmxlbmd0aCArICcgUGVyc29uZW4nLFxyXG4gICAgICAgICAgZnI6IHRoaW5nTmFtZSArICcgbWFucXXDqShlKSBzdXIgJyArIG1pc3NlZC5sZW5ndGggKyAnIHBlcnNvbm5lcycsXHJcbiAgICAgICAgICBqYTogbWlzc2VkLmxlbmd0aCArICfkurrjgYwnICsgdGhpbmdOYW1lICsgJ+OCkuWPl+OBkeOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+aciScgKyBtaXNzZWQubGVuZ3RoICsgJ+S6uuayoeWPl+WIsCAnICsgdGhpbmdOYW1lLFxyXG4gICAgICAgICAga286IHRoaW5nTmFtZSArICcgJyArIG1pc3NlZC5sZW5ndGggKyAn66qF7JeQ6rKMIOyggeyaqeyViOuQqCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgIGlmIChkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbilcclxuICAgICAgICBkZWxldGUgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb25bYXJncy50cmlnZ2VySWRdO1xyXG4gICAgfSxcclxuICB9LFxyXG5dO1xyXG5cclxuY29uc3QgbWlzc2VkTWl0aWdhdGlvbkJ1ZmYgPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5lZmZlY3RJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgZWZmZWN0SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogYXJncy5lZmZlY3RJZCB9KSxcclxuICAgIGZpZWxkOiAnZWZmZWN0JyxcclxuICAgIHR5cGU6ICdoZWFsJyxcclxuICAgIGlnbm9yZVNlbGY6IGFyZ3MuaWdub3JlU2VsZixcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGVmZmVjdENvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkRGFtYWdlQWJpbGl0eSA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eUlkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICBmaWVsZDogJ2FiaWxpdHknLFxyXG4gICAgdHlwZTogJ2RhbWFnZScsXHJcbiAgICBpZ25vcmVTZWxmOiBhcmdzLmlnbm9yZVNlbGYsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBhYmlsaXR5Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRIZWFsID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGZpZWxkOiAnYWJpbGl0eScsXHJcbiAgICB0eXBlOiAnaGVhbCcsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBhYmlsaXR5Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSA9IG1pc3NlZEhlYWw7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0Y2hBbGwsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBNYXBwZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hZGRlZENvbWJhdGFudEZ1bGwoKSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChtYXRjaGVzLm93bmVySWQgPT09ICcwJylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZGF0YS5wZXRJZFRvT3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWQgfHwge307XHJcbiAgICAgICAgLy8gRml4IGFueSBsb3dlcmNhc2UgaWRzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWRbbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpXSA9IG1hdGNoZXMub3duZXJJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBDbGVhcmVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuY2hhbmdlWm9uZSgpLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gQ2xlYXIgdGhpcyBoYXNoIHBlcmlvZGljYWxseSBzbyBpdCBkb2Vzbid0IGhhdmUgZmFsc2UgcG9zaXRpdmVzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWQgPSB7fTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUHJlZmVyIGFiaWxpdGllcyB0byBlZmZlY3RzLCBhcyBlZmZlY3RzIHRha2UgbG9uZ2VyIHRvIHJvbGwgdGhyb3VnaCB0aGUgcGFydHkuXHJcbiAgICAvLyBIb3dldmVyLCBzb21lIHRoaW5ncyBhcmUgb25seSBlZmZlY3RzIGFuZCBzbyB0aGVyZSBpcyBubyBjaG9pY2UuXHJcblxyXG4gICAgLy8gRm9yIHRoaW5ncyB5b3UgY2FuIHN0ZXAgaW4gb3Igb3V0IG9mLCBnaXZlIGEgbG9uZ2VyIHRpbWVyPyAgVGhpcyBpc24ndCBwZXJmZWN0LlxyXG4gICAgLy8gVE9ETzogaW5jbHVkZSBzb2lsIGhlcmU/P1xyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0NvbGxlY3RpdmUgVW5jb25zY2lvdXMnLCBlZmZlY3RJZDogJzM1MScsIGNvbGxlY3RTZWNvbmRzOiAxMCB9KSxcclxuICAgIC8vIEFybXMgVXAgPSA0OTggKG90aGVycyksIFBhc3NhZ2UgT2YgQXJtcyA9IDQ5NyAoeW91KS4gIFVzZSBib3RoIGluIGNhc2UgZXZlcnlib2R5IGlzIG1pc3NlZC5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdQYXNzYWdlIG9mIEFybXMnLCBlZmZlY3RJZDogJzQ5Wzc4XScsIGlnbm9yZVNlbGY6IHRydWUsIGNvbGxlY3RTZWNvbmRzOiAxMCB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnRGl2aW5lIFZlaWwnLCBlZmZlY3RJZDogJzJENycsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0hlYXJ0IE9mIExpZ2h0JywgYWJpbGl0eUlkOiAnM0YyMCcgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnRGFyayBNaXNzaW9uYXJ5JywgYWJpbGl0eUlkOiAnNDA1NycgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hha2UgSXQgT2ZmJywgYWJpbGl0eUlkOiAnMUNEQycgfSksXHJcblxyXG4gICAgLy8gM0Y0NCBpcyB0aGUgY29ycmVjdCBRdWFkcnVwbGUgVGVjaG5pY2FsIEZpbmlzaCwgb3RoZXJzIGFyZSBEaW5reSBUZWNobmljYWwgRmluaXNoLlxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnVGVjaG5pY2FsIEZpbmlzaCcsIGFiaWxpdHlJZDogJzNGNFsxLTRdJyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0RpdmluYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE4JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0Jyb3RoZXJob29kJywgYWJpbGl0eUlkOiAnMUNFNCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCYXR0bGUgTGl0YW55JywgYWJpbGl0eUlkOiAnREU1JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0VtYm9sZGVuJywgYWJpbGl0eUlkOiAnMUQ2MCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCYXR0bGUgVm9pY2UnLCBhYmlsaXR5SWQ6ICc3NicsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLy8gVG9vIG5vaXN5IChwcm9jcyBldmVyeSB0aHJlZSBzZWNvbmRzLCBhbmQgYmFyZHMgb2Z0ZW4gb2ZmIGRvaW5nIG1lY2hhbmljcykuXHJcbiAgICAvLyBtaXNzZWREYW1hZ2VCdWZmKHsgaWQ6ICdXYW5kZXJlclxcJ3MgTWludWV0JywgZWZmZWN0SWQ6ICc4QTgnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnTWFnZVxcJ3MgQmFsbGFkJywgZWZmZWN0SWQ6ICc4QTknLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnQXJteVxcJ3MgUGFlb24nLCBlZmZlY3RJZDogJzhBQScsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1Ryb3ViYWRvdXInLCBhYmlsaXR5SWQ6ICcxQ0VEJyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUYWN0aWNpYW4nLCBhYmlsaXR5SWQ6ICc0MUY5JyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdTaGllbGQgU2FtYmEnLCBhYmlsaXR5SWQ6ICczRThDJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTWFudHJhJywgYWJpbGl0eUlkOiAnNDEnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0Rldm90aW9uJywgYWJpbGl0eUlkOiAnMUQxQScgfSksXHJcblxyXG4gICAgLy8gTWF5YmUgdXNpbmcgYSBoZWFsZXIgTEIxL0xCMiBzaG91bGQgYmUgYW4gZXJyb3IgZm9yIHRoZSBoZWFsZXIuIE86KVxyXG4gICAgLy8gLi4ubWlzc2VkSGVhbCh7IGlkOiAnSGVhbGluZyBXaW5kJywgYWJpbGl0eUlkOiAnQ0UnIH0pLFxyXG4gICAgLy8gLi4ubWlzc2VkSGVhbCh7IGlkOiAnQnJlYXRoIG9mIHRoZSBFYXJ0aCcsIGFiaWxpdHlJZDogJ0NGJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdNZWRpY2EnLCBhYmlsaXR5SWQ6ICc3QycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdNZWRpY2EgSUknLCBhYmlsaXR5SWQ6ICc4NScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBZmZsYXR1cyBSYXB0dXJlJywgYWJpbGl0eUlkOiAnNDA5NicgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdUZW1wZXJhbmNlJywgYWJpbGl0eUlkOiAnNzUxJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1BsZW5hcnkgSW5kdWxnZW5jZScsIGFiaWxpdHlJZDogJzFEMDknIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnUHVsc2Ugb2YgTGlmZScsIGFiaWxpdHlJZDogJ0QwJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdTdWNjb3InLCBhYmlsaXR5SWQ6ICdCQScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdJbmRvbWl0YWJpbGl0eScsIGFiaWxpdHlJZDogJ0RGRicgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdEZXBsb3ltZW50IFRhY3RpY3MnLCBhYmlsaXR5SWQ6ICdFMDEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnV2hpc3BlcmluZyBEYXduJywgYWJpbGl0eUlkOiAnMzIzJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0ZleSBCbGVzc2luZycsIGFiaWxpdHlJZDogJzQwQTAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQ29uc29sYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEEzJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FuZ2VsXFwncyBXaGlzcGVyJywgYWJpbGl0eUlkOiAnNDBBNicgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnRmV5IElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzMyNScgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2VyYXBoaWMgSWxsdW1pbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBNycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBbmdlbCBGZWF0aGVycycsIGFiaWxpdHlJZDogJzEwOTcnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0hlbGlvcycsIGFiaWxpdHlJZDogJ0UxMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBc3BlY3RlZCBIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnMzIwMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdDZWxlc3RpYWwgT3Bwb3NpdGlvbicsIGFiaWxpdHlJZDogJzQwQTknIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXN0cmFsIFN0YXNpcycsIGFiaWxpdHlJZDogJzEwOTgnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1doaXRlIFdpbmQnLCBhYmlsaXR5SWQ6ICcyQzhFJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0dvYnNraW4nLCBhYmlsaXR5SWQ6ICc0NzgwJyB9KSxcclxuXHJcbiAgICAvLyBUT0RPOiBleHBvcnQgYWxsIG9mIHRoZXNlIG1pc3NlZCBmdW5jdGlvbnMgaW50byB0aGVpciBvd24gaGVscGVyXHJcbiAgICAvLyBhbmQgdGhlbiBhZGQgdGhpcyB0byB0aGUgRGVsdWJydW0gUmVnaW5hZSBmaWxlcyBkaXJlY3RseS5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdMb3N0IEFldGhlcnNoaWVsZCcsIGFiaWxpdHlJZDogJzU3NTMnIH0pLFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBHZW5lcmFsIG1pc3Rha2VzOyB0aGVzZSBhcHBseSBldmVyeXdoZXJlLlxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0Y2hBbGwsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gVHJpZ2dlciBpZCBmb3IgaW50ZXJuYWxseSBnZW5lcmF0ZWQgZWFybHkgcHVsbCB3YXJuaW5nLlxyXG4gICAgICBpZDogJ0dlbmVyYWwgRWFybHkgUHVsbCcsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0dlbmVyYWwgRm9vZCBCdWZmJyxcclxuICAgICAgLy8gV2VsbCBGZWRcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ4JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBQcmV2ZW50IFwiRW9zIGxvc2VzIHRoZSBlZmZlY3Qgb2YgV2VsbCBGZWQgZnJvbSBDcml0bG8gTWNnZWVcIlxyXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnRhcmdldCA9PT0gbWF0Y2hlcy5zb3VyY2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5sb3N0Rm9vZCA9IGRhdGEubG9zdEZvb2QgfHwge307XHJcbiAgICAgICAgLy8gV2VsbCBGZWQgYnVmZiBoYXBwZW5zIHJlcGVhdGVkbHkgd2hlbiBpdCBmYWxscyBvZmYgKFdIWSksXHJcbiAgICAgICAgLy8gc28gc3VwcHJlc3MgbXVsdGlwbGUgb2NjdXJyZW5jZXMuXHJcbiAgICAgICAgaWYgKCFkYXRhLmluQ29tYmF0IHx8IGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2xvc3QgZm9vZCBidWZmJyxcclxuICAgICAgICAgICAgZGU6ICdOYWhydW5nc2J1ZmYgdmVybG9yZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0J1ZmYgbm91cnJpdHVyZSB0ZXJtaW7DqWUnLFxyXG4gICAgICAgICAgICBqYTogJ+mjr+WKueaenOOBjOWkseOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5aSx5Y676aOf54mpQlVGRicsXHJcbiAgICAgICAgICAgIGtvOiAn7J2M7IudIOuyhO2UhCDtlbTsoJwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFdlbGwgRmVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ4JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5sb3N0Rm9vZClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkZWxldGUgZGF0YS5sb3N0Rm9vZFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0dlbmVyYWwgUmFiYml0IE1lZGl1bScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzhFMCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuSXNQbGF5ZXJJZChtYXRjaGVzLnNvdXJjZUlkKSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidW5ueScsXHJcbiAgICAgICAgICAgIGRlOiAnSGFzZScsXHJcbiAgICAgICAgICAgIGZyOiAnbGFwaW4nLFxyXG4gICAgICAgICAgICBqYTogJ+OBhuOBleOBjicsXHJcbiAgICAgICAgICAgIGNuOiAn5YWU5a2QJyxcclxuICAgICAgICAgICAga286ICfthqDrgbwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGVzdCBtaXN0YWtlIHRyaWdnZXJzLlxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWlkZGxlTGFOb3NjZWEsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvdycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBib3cgY291cnRlb3VzbHkgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHZvdXMgaW5jbGluZXogZGV2YW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavjgYrovp7lhIDjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5oGt5pWs5Zyw5a+55pyo5Lq66KGM56S8Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDqs7XshpDtlZjqsowg7J247IKs7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3B1bGwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm93JyxcclxuICAgICAgICAgICAgZGU6ICdCb2dlbicsXHJcbiAgICAgICAgICAgIGZyOiAnU2FsdWVyJyxcclxuICAgICAgICAgICAgamE6ICfjgYrovp7lhIAnLFxyXG4gICAgICAgICAgICBjbjogJ+meoOi6rCcsXHJcbiAgICAgICAgICAgIGtvOiAn7J247IKsJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBXaXBlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJpZCBmYXJld2VsbCB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgZmFpdGVzIHZvcyBhZGlldXggYXUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+WIpeOCjOOBruaMqOaLtuOCkuOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirlkJHmnKjkurrlkYrliKsuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOyekeuzhCDsnbjsgqzrpbwg7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dpcGUnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUGFydHkgV2lwZScsXHJcbiAgICAgICAgICAgIGRlOiAnR3J1cHBlbndpcGUnLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODr+OCpOODlycsXHJcbiAgICAgICAgICAgIGNuOiAn5Zui54GtJyxcclxuICAgICAgICAgICAga286ICftjIzti7Ag7KCE66m4JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb290c2hpbmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZnI6ICdNYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQnLFxyXG4gICAgICAgICAgamE6ICfmnKjkuronLFxyXG4gICAgICAgICAgY246ICfmnKjkuronLFxyXG4gICAgICAgICAga286ICfrgpjrrLTsnbjtmJUnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc3RyaWtpbmdEdW1teU5hbWVzID0gT2JqZWN0LnZhbHVlcyhzdHJpa2luZ0R1bW15QnlMb2NhbGUpO1xyXG4gICAgICAgIHJldHVybiBzdHJpa2luZ0R1bW15TmFtZXMuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYm9vdENvdW50ID0gZGF0YS5ib290Q291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2RhdGEuYm9vdENvdW50fSk6ICR7ZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKX1gO1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBMZWFkZW4gRmlzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc3NDUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnNvdXJjZSA9PT0gZGF0YS5tZSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZ29vZCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IE9vcHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmxpbmUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5wb2tlQ291bnQgPSAoZGF0YS5wb2tlQ291bnQgfHwgMCkgKyAxO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFBva2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gMSBwb2tlIGF0IGEgdGltZSBpcyBmaW5lLCBidXQgbW9yZSB0aGFuIG9uZSBpbiA1IHNlY29uZHMgaXMgKE9CVklPVVNMWSkgYSBtaXN0YWtlLlxyXG4gICAgICAgIGlmICghZGF0YS5wb2tlQ291bnQgfHwgZGF0YS5wb2tlQ291bnQgPD0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgVG9vIG1hbnkgcG9rZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgWnUgdmllbGUgUGlla3NlciAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgZnI6IGBUcm9wIGRlIHRvdWNoZXMgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGphOiBg44GE44Gj44Gx44GE44Gk44Gk44GE44GfICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBjbjogYOaIs+WkquWkmuS4i+WVpiAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAga286IGDrhIjrrLQg66eO7J20IOywjOumhCAoJHtkYXRhLnBva2VDb3VudH3rsogpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEucG9rZUNvdW50LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJZnJpdCBTdG9yeSBNb2RlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVCb3dsT2ZFbWJlcnMsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lmcml0Tm0gUmFkaWFudCBQbHVtZSc6ICcyREUnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBJbmNpbmVyYXRlJzogJzFDNScsXHJcbiAgICAnSWZyaXRObSBFcnVwdGlvbic6ICcyREQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBTdG9yeSBNb2RlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnM0NEJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbk5tIExhbmRzbGlkZSc6ICcyOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBSb2NrIEJ1c3Rlcic6ICcyODEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEl0J3MgaGFyZCB0byBjYXB0dXJlIHRoZSByZWZsZWN0aW9uIGFiaWxpdGllcyBmcm9tIExldmlhdGhhbidzIEhlYWQgYW5kIFRhaWwgaWYgeW91IHVzZVxyXG4vLyByYW5nZWQgcGh5c2ljYWwgYXR0YWNrcyAvIG1hZ2ljIGF0dGFja3MgcmVzcGVjdGl2ZWx5LCBhcyB0aGUgYWJpbGl0eSBuYW1lcyBhcmUgdGhlXHJcbi8vIGFiaWxpdHkgeW91IHVzZWQgYW5kIGRvbid0IGFwcGVhciB0byBzaG93IHVwIGluIHRoZSBsb2cgYXMgbm9ybWFsIFwiYWJpbGl0eVwiIGxpbmVzLlxyXG4vLyBUaGF0IHNhaWQsIGRvdHMgc3RpbGwgdGljayBpbmRlcGVuZGVudGx5IG9uIGJvdGggc28gaXQncyBsaWtlbHkgdGhhdCBwZW9wbGUgd2lsbCBhdGFja1xyXG4vLyB0aGVtIGFueXdheS5cclxuXHJcbi8vIFRPRE86IEZpZ3VyZSBvdXQgd2h5IERyZWFkIFRpZGUgLyBXYXRlcnNwb3V0IGFwcGVhciBsaWtlIHNoYXJlcyAoaS5lLiAweDE2IGlkKS5cclxuLy8gRHJlYWQgVGlkZSA9IDgyMy84MjQvODI1LCBXYXRlcnNwb3V0ID0gODI5XHJcblxyXG4vLyBMZXZpYXRoYW4gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2hvcmxlYXRlckV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0xldmlFeCBHcmFuZCBGYWxsJzogJzgyRicsIC8vIHZlcnkgbGFyZ2UgY2lyY3VsYXIgYW9lIGJlZm9yZSBzcGlubnkgZGl2ZXMsIGFwcGxpZXMgaGVhdnlcclxuICAgICdMZXZpRXggSHlkcm8gU2hvdCc6ICc3NDgnLCAvLyBXYXZlc3BpbmUgU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBEcm9wc3kgZWZmZWN0XHJcbiAgICAnTGV2aUV4IERyZWFkc3Rvcm0nOiAnNzQ5JywgLy8gV2F2ZXRvb3RoIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgSHlzdGVyaWEgZWZmZWN0XHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTGV2aUV4IEJvZHkgU2xhbSc6ICc4MkEnLCAvLyBsZXZpIHNsYW0gdGhhdCB0aWx0cyB0aGUgYm9hdFxyXG4gICAgJ0xldmlFeCBTcGlubmluZyBEaXZlIDEnOiAnODhBJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlFeCBTcGlubmluZyBEaXZlIDInOiAnODhCJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlFeCBTcGlubmluZyBEaXZlIDMnOiAnODJDJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnTGV2aUV4IERyb3BzeSc6ICcxMTAnLCAvLyBzdGFuZGluZyBpbiB0aGUgaHlkcm8gc2hvdCBmcm9tIHRoZSBXYXZlc3BpbmUgU2FoYWdpblxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTGV2aUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIHN0YW5kaW5nIGluIHRoZSBkcmVhZHN0b3JtIGZyb20gdGhlIFdhdmV0b290aCBTYWhhZ2luXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0xldmlFeCBCb2R5IFNsYW0gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzgyQScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIEhhcmRcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFIbSBJY2ljbGUgSW1wYWN0JzogJzk5MycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhSG0gR2xhY2llciBCYXNoJzogJzlBMScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEtub2NrYmFjayB0YW5rIGNsZWF2ZS5cclxuICAgICdTaGl2YUhtIEhlYXZlbmx5IFN0cmlrZSc6ICc5QTAnLFxyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFIbSBIYWlsc3Rvcm0nOiAnOTk4JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVGFua2J1c3Rlci4gIFRoaXMgaXMgU2hpdmEgSGFyZCBtb2RlLCBub3QgU2hpdmEgRXh0cmVtZS4gIFBsZWFzZSFcclxuICAgICdTaGl2YUhtIEljZWJyYW5kJzogJzk5NicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGlhbW9uZCBEdXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnOThBJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuc2VlbkRpYW1vbmREdXN0ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDlBMyBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC4gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIHNvIG9ubHkgYSBtaXN0YWtlIGFmdGVyIHRoYXQuXHJcbiAgICAgICAgLy8gVW5saWtlIGV4dHJlbWUsIHRoaXMgaGFzIHRoZSBzYW1lIDIwIHNlY29uZCBkdXJhdGlvbiBhcyB0aGUgaW50ZXJtaXNzaW9uLlxyXG4gICAgICAgIHJldHVybiBkYXRhLnNlZW5EaWFtb25kRHVzdDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gU2hpdmEgRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnQkVCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICdCRUMnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUV4IEdsYWNpZXIgQmFzaCc6ICdCRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICdCREYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICdCRTInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBMYXNlci4gIFRPRE86IG1heWJlIGJsYW1lIHRoZSBwZXJzb24gaXQncyBvbj8/XHJcbiAgICAnU2hpdmFFeCBBdmFsYW5jaGUnOiAnQkUwJyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFua2J1c3RlclxyXG4gICAgJ1NoaXZhRXggSWNlYnJhbmQnOiAnQkUxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IEM4QSBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC/jg5Ljg63jgqTjg4Pjgq8uIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgYnV0IGZvciBhIHNob3J0ZXIgZHVyYXRpb24uXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgPiAyMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBIYXJkXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU1MycsXHJcbiAgICAnVGl0YW5IbSBCdXJzdCc6ICc0MUMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTGFuZHNsaWRlJzogJzU1NCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFJvY2sgQnVzdGVyJzogJzU1MCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIE1vdW50YWluIEJ1c3Rlcic6ICcyODMnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzVCRScsXHJcbiAgICAnVGl0YW5FeCBCdXJzdCc6ICc1QkYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTGFuZHNsaWRlJzogJzVCQicsXHJcbiAgICAnVGl0YW5FeCBHYW9sZXIgTGFuZHNsaWRlJzogJzVDMycsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkV4IFJvY2sgQnVzdGVyJzogJzVCNycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkV4IE1vdW50YWluIEJ1c3Rlcic6ICc1QjgnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlZXBpbmdDaXR5T2ZNaGFjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBDcml0aWNhbCBCaXRlJzogJzE4NDgnLCAvLyBTYXJzdWNodXMgY29uZSBhb2VcclxuICAgICdXZWVwaW5nIFJlYWxtIFNoYWtlcic6ICcxODNFJywgLy8gRmlyc3QgRGF1Z2h0ZXIgY2lyY2xlIGFvZVxyXG4gICAgJ1dlZXBpbmcgU2lsa3NjcmVlbic6ICcxODNDJywgLy8gRmlyc3QgRGF1Z2h0ZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtlbiBTcHJheSc6ICcxODI0JywgLy8gQXJhY2huZSBFdmUgcmVhciBjb25hbCBhb2VcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDEnOiAnMTgzNycsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDFcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDInOiAnMTgzNicsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDJcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDMnOiAnMTgzNScsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDNcclxuICAgICdXZWVwaW5nIFNwaWRlciBUaHJlYWQnOiAnMTgzOScsIC8vIEFyYWNobmUgRXZlIHNwaWRlciBsaW5lIGFvZVxyXG4gICAgJ1dlZXBpbmcgRmlyZSBJSSc6ICcxODRFJywgLy8gQmxhY2sgTWFnZSBDb3Jwc2UgY2lyY2xlIGFvZVxyXG4gICAgJ1dlZXBpbmcgTmVjcm9wdXJnZSc6ICcxN0Q3JywgLy8gRm9yZ2FsbCBTaHJpdmVsZWQgVGFsb24gbGluZSBhb2VcclxuICAgICdXZWVwaW5nIFJvdHRlbiBCcmVhdGgnOiAnMTdEMCcsIC8vIEZvcmdhbGwgRGFoYWsgY29uZSBhb2VcclxuICAgICdXZWVwaW5nIE1vdyc6ICcxN0QyJywgLy8gRm9yZ2FsbCBIYWFnZW50aSB1bm1hcmtlZCBjbGVhdmVcclxuICAgICdXZWVwaW5nIERhcmsgRXJ1cHRpb24nOiAnMTdDMycsIC8vIEZvcmdhbGwgcHVkZGxlIG1hcmtlclxyXG4gICAgLy8gMTgwNiBpcyBhbHNvIEZsYXJlIFN0YXIsIGJ1dCBpZiB5b3UgZ2V0IGJ5IDE4MDUgeW91IGFsc28gZ2V0IGhpdCBieSAxODA2P1xyXG4gICAgJ1dlZXBpbmcgRmxhcmUgU3Rhcic6ICcxODA1JywgLy8gT3ptYSBjdWJlIHBoYXNlIGRvbnV0XHJcbiAgICAnV2VlcGluZyBFeGVjcmF0aW9uJzogJzE4MjknLCAvLyBPem1hIHRyaWFuZ2xlIGxhc2VyXHJcbiAgICAnV2VlcGluZyBIYWlyY3V0IDEnOiAnMTgwQicsIC8vIENhbG9maXN0ZXJpIDE4MCBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAyJzogJzE4MEYnLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEVudGFuZ2xlbWVudCc6ICcxODFEJywgLy8gQ2Fsb2Zpc3RlcmkgbGFuZG1pbmUgcHVkZGxlIHByb2NcclxuICAgICdXZWVwaW5nIEV2aWwgQ3VybCc6ICcxODE2JywgLy8gQ2Fsb2Zpc3RlcmkgYXhlXHJcbiAgICAnV2VlcGluZyBFdmlsIFRyZXNzJzogJzE4MTcnLCAvLyBDYWxvZmlzdGVyaSBidWxiXHJcbiAgICAnV2VlcGluZyBEZXB0aCBDaGFyZ2UnOiAnMTgyMCcsIC8vIENhbG9maXN0ZXJpIGNoYXJnZSB0byBlZGdlXHJcbiAgICAnV2VlcGluZyBGZWludCBQYXJ0aWNsZSBCZWFtJzogJzE5MjgnLCAvLyBDYWxvZmlzdGVyaSBza3kgbGFzZXJcclxuICAgICdXZWVwaW5nIEV2aWwgU3dpdGNoJzogJzE4MTUnLCAvLyBDYWxvZmlzdGVyaSBsYXNlcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQXJhY2huZSBXZWInOiAnMTg1RScsIC8vIEFyYWNobmUgRXZlIGhlYWRtYXJrZXIgd2ViIGFvZVxyXG4gICAgJ1dlZXBpbmcgRWFydGggQWV0aGVyJzogJzE4NDEnLCAvLyBBcmFjaG5lIEV2ZSBvcmJzXHJcbiAgICAnV2VlcGluZyBFcGlncmFwaCc6ICcxODUyJywgLy8gSGVhZHN0b25lIHVudGVsZWdyYXBoZWQgbGFzZXIgbGluZSB0YW5rIGF0dGFja1xyXG4gICAgLy8gVGhpcyBpcyB0b28gbm9pc3kuICBCZXR0ZXIgdG8gcG9wIHRoZSBiYWxsb29ucyB0aGFuIHdvcnJ5IGFib3V0IGZyaWVuZHMuXHJcbiAgICAvLyAnV2VlcGluZyBFeHBsb3Npb24nOiAnMTgwNycsIC8vIE96bWFzcGhlcmUgQ3ViZSBvcmIgZXhwbG9zaW9uXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMSc6ICcxODBDJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDInOiAnMTgxMCcsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEJsb29kaWVkIE5haWwnOiAnMTgxRicsIC8vIENhbG9maXN0ZXJpIGF4ZS9idWxiIGFwcGVhcmluZ1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBBcmFjaG5lIEV2ZSBGcm9uZCBBZmZlYXJkXHJcbiAgICAnV2VlcGluZyBab21iaWZpY2F0aW9uJzogJzE3MycsIC8vIEZvcmdhbGwgdG9vIG1hbnkgem9tYmllIHB1ZGRsZXNcclxuICAgICdXZWVwaW5nIFRvYWQnOiAnMUI3JywgLy8gRm9yZ2FsbCBCcmFuZCBvZiB0aGUgRmFsbGVuIGZhaWx1cmVcclxuICAgICdXZWVwaW5nIERvb20nOiAnMzhFJywgLy8gRm9yZ2FsbCBIYWFnZW50aSBNb3J0YWwgUmF5XHJcbiAgICAnV2VlcGluZyBBc3NpbWlsYXRpb24nOiAnNDJDJywgLy8gT3ptYXNoYWRlIEFzc2ltaWxhdGlvbiBsb29rLWF3YXlcclxuICAgICdXZWVwaW5nIFN0dW4nOiAnOTUnLCAvLyBDYWxvZmlzdGVyaSBQZW5ldHJhdGlvbiBsb29rLWF3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIEdyYWR1YWwgWm9tYmlmaWNhdGlvbiBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQxNScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnpvbWJpZSA9IGRhdGEuem9tYmllIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxN0NBJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS56b21iaWUgJiYgIWRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGbGFyaW5nIEVwaWdyYXBoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTg1NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuc2hpZWxkICYmICFkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIGlkOiAnMTgzMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGRlOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGZyOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGphOiAn44K/44Oz44Kv44Os44K244O8JyxcclxuICAgICAgICAgICAgY246ICflnablhYvmv4DlhYknLFxyXG4gICAgICAgICAgICBrbzogJ+2Dsey7pCDroIjsnbTsoIAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIE96bWEgSG9seScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4MkUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdpc3QgcnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA77yBJyxcclxuICAgICAgICAgICAga286ICfrhInrsLHrkKghJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyZWF0R3ViYWxMaWJyYXJ5SGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBUZXJyb3IgRXllJzogJzkzMCcsIC8vIENpcmNsZSBBb0UsIFNwaW5lIEJyZWFrZXIgdHJhc2hcclxuICAgICdHdWJhbEhtIEJhdHRlcic6ICcxOThBJywgLy8gQ2lyY2xlIEFvRSwgdHJhc2ggYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gQ29uZGVtbmF0aW9uJzogJzM5MCcsIC8vIENvbmFsIEFvRSwgQmlibGlvdm9yZSB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMSc6ICcxOTQzJywgLy8gRmFsbGluZyBib29rIHNoYWRvdywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAyJzogJzE5NDAnLCAvLyBSdXNoIEFvRSBmcm9tIGVuZHMsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMyc6ICcxOTQyJywgLy8gUnVzaCBBb0UgYWNyb3NzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIEZyaWdodGZ1bCBSb2FyJzogJzE5M0InLCAvLyBHZXQtT3V0IEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAxJzogJzE5M0QnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDInOiAnMTkzRicsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMyc6ICcxOTQxJywgLy8gSW5pdGlhbCBzaWRlIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGVzb2xhdGlvbic6ICcxOThDJywgLy8gTGluZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFya25lc3MnOiAnM0EwJywgLy8gQ29uYWwgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRmlyZXdhdGVyJzogJzNCQScsIC8vIENpcmNsZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBFbGJvdyBEcm9wJzogJ0NCQScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmsnOiAnMTlERicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBTZWFscyc6ICcxOTRBJywgLy8gU3VuL01vb25zZWFsIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gV2F0ZXIgSUlJJzogJzFDNjcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBQb3JvZ28gUGVnaXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBSYWdpbmcgQXhlJzogJzE3MDMnLCAvLyBTbWFsbCBjb25hbCBBb0UsIE1lY2hhbm9zZXJ2aXRvciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gTWFnaWMgSGFtbWVyJzogJzE5OTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBBcGFuZGEgbWluaS1ib3NzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIEdyYXZpdHknOiAnMTk1MCcsIC8vIENpcmNsZSBBb0UgZnJvbSBncmF2aXR5IHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBMZXZpdGF0aW9uJzogJzE5NEYnLCAvLyBDaXJjbGUgQW9FIGZyb20gbGV2aXRhdGlvbiBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIENvbWV0JzogJzE5NjknLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1YmFsSG0gRWNsaXB0aWMgTWV0ZW9yJzogJzE5NUMnLCAvLyBMb1MgbWVjaGFuaWMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBTZWFyaW5nIFdpbmQnOiAnMTk0NCcsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFRodW5kZXInOiAnMTlbQUJdJywgLy8gU3ByZWFkIG1hcmtlciwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBGaXJlIGdhdGUgaW4gaGFsbHdheSB0byBib3NzIDIsIG1hZ25ldCBmYWlsdXJlIG9uIGJvc3MgMlxyXG4gICAgICBpZDogJ0d1YmFsSG0gQnVybnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTBCJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID0gZGF0YS5oYXNJbXAgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNJbXBbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNJbXAgPSBkYXRhLmhhc0ltcCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRhcmdldHMgd2l0aCBJbXAgd2hlbiBUaHVuZGVyIElJSSByZXNvbHZlcyByZWNlaXZlIGEgdnVsbmVyYWJpbGl0eSBzdGFjayBhbmQgYnJpZWYgc3R1blxyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIFRodW5kZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1W0FCXScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5oYXNJbXBbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gQWx3YXlzIGhpdHMgdGFyZ2V0LCBidXQgaWYgY29ycmVjdGx5IHJlc29sdmVkIHdpbGwgZGVhbCAwIGRhbWFnZVxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIFRvcm5hZG8nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMTk1Wzc4XScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gQWx3YXlzIGhpdHMgdGFyZ2V0LCBidXQgaWYgY29ycmVjdGx5IHJlc29sdmVkIHdpbGwgZGVhbCAwIGRhbWFnZVxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Tb2htQWxIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTb2htQWxIbSBEZWFkbHkgVmFwb3InOiAnMURDOScsIC8vIEVudmlyb25tZW50YWwgY2lyY2xlIEFvRXNcclxuICAgICdTb2htQWxIbSBEZWVwcm9vdCc6ICcxQ0RBJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgQmxvb21pbmcgQ2hpY2h1IHRyYXNoXHJcbiAgICAnU29obUFsSG0gT2Rpb3VzIEFpcic6ICcxQ0RCJywgLy8gQ29uYWwgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBHbG9yaW91cyBCbGF6ZSc6ICcxQzMzJywgLy8gQ2lyY2xlIEFvRSwgU21hbGwgU3BvcmUgU2FjLCBib3NzIDFcclxuICAgICdTb2htQWxIbSBGb3VsIFdhdGVycyc6ICcxMThBJywgLy8gQ29uYWwgQW9FLCBNb3VudGFpbnRvcCBPcGtlbiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFBsYWluIFBvdW5kJzogJzExODcnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBNb3VudGFpbnRvcCBIcm9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGFsc3lueXhpcyc6ICcxMTYxJywgLy8gQ29uYWwgQW9FLCBPdmVyZ3Jvd24gRGlmZmx1Z2lhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gU3VyZmFjZSBCcmVhY2gnOiAnMUU4MCcsIC8vIENpcmNsZSBBb0UsIEdpYW50IE5ldGhlcndvcm0gdHJhc2hcclxuICAgICdTb2htQWxIbSBGcmVzaHdhdGVyIENhbm5vbic6ICcxMTlGJywgLy8gTGluZSBBb0UsIEdpYW50IE5ldGhlcndvcm0gdHJhc2hcclxuICAgICdTb2htQWxIbSBUYWlsIFNtYXNoJzogJzFDMzUnLCAvLyBVbnRlbGVncmFwaGVkIHJlYXIgY29uYWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU3dpbmcnOiAnMUMzNicsIC8vIFVudGVsZWdyYXBoZWQgY2lyY2xlIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBSaXBwZXIgQ2xhdyc6ICcxQzM3JywgLy8gVW50ZWxlZ3JhcGhlZCBmcm9udGFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaW5kIFNsYXNoJzogJzFDMzgnLCAvLyBDaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbGQgQ2hhcmdlJzogJzFDMzknLCAvLyBEYXNoIGF0dGFjaywgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBIb3QgQ2hhcmdlJzogJzFDM0EnLCAvLyBEYXNoIGF0dGFjaywgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBGaXJlYmFsbCc6ICcxQzNCJywgLy8gVW50ZWxlZ3JhcGhlZCB0YXJnZXRlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIExhdmEgRmxvdyc6ICcxQzNDJywgLy8gVW50ZWxlZ3JhcGhlZCBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBIb3JuJzogJzE1MDcnLCAvLyBDb25hbCBBb0UsIEFiYWxhdGhpYW4gQ2xheSBHb2xlbSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIExhdmEgQnJlYXRoJzogJzFDNEQnLCAvLyBDb25hbCBBb0UsIExhdmEgQ3JhYiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFJpbmcgb2YgRmlyZSc6ICcxQzRDJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgVm9sY2FubyBBbmFsYSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDEnOiAnMUM0MycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDInOiAnMUM0NCcsIC8vIDI3MC1kZWdyZWUgcmVhciBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDMnOiAnMUM0MicsIC8vIFJpbmcgQW9FLCBMYXZhIFNjb3JwaW9uLCBib3NzIDNcclxuICAgICdTb2htQWxIbSBSZWFsbSBTaGFrZXInOiAnMUM0MScsIC8vIENpcmNsZSBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gV2FybnMgaWYgcGxheWVycyBzdGVwIGludG8gdGhlIGxhdmEgcHVkZGxlcy4gVGhlcmUgaXMgdW5mb3J0dW5hdGVseSBubyBkaXJlY3QgZGFtYWdlIGV2ZW50LlxyXG4gICAgICBpZDogJ1NvaG1BbEhtIEJ1cm5zJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxleGFuZGVyVGhlU291bE9mVGhlQ3JlYXRvcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQTEyTiBTYWNyYW1lbnQnOiAnMUFFNicsIC8vIENyb3NzIExhc2Vyc1xyXG4gICAgJ0ExMk4gR3Jhdml0YXRpb25hbCBBbm9tYWx5JzogJzFBRUInLCAvLyBHcmF2aXR5IFB1ZGRsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0ExMk4gRGl2aW5lIFNwZWFyJzogJzFBRTMnLCAvLyBJbnN0YW50IGNvbmFsIHRhbmsgY2xlYXZlXHJcbiAgICAnQTEyTiBCbGF6aW5nIFNjb3VyZ2UnOiAnMUFFOScsIC8vIE9yYW5nZSBoZWFkIG1hcmtlciBzcGxhc2ggZGFtYWdlXHJcbiAgICAnQTEyTiBQbGFpbnQgT2YgU2V2ZXJpdHknOiAnMUFGMScsIC8vIEFnZ3JhdmF0ZWQgQXNzYXVsdCBzcGxhc2ggZGFtYWdlXHJcbiAgICAnQTEyTiBDb21tdW5pb24nOiAnMUFGQycsIC8vIFRldGhlciBQdWRkbGVzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDb2xsZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmFzc2F1bHQgPSBkYXRhLmFzc2F1bHQgfHwgW107XHJcbiAgICAgICAgZGF0YS5hc3NhdWx0LnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSXQgaXMgYSBmYWlsdXJlIGZvciBhIFNldmVyaXR5IG1hcmtlciB0byBzdGFjayB3aXRoIHRoZSBTb2xpZGFyaXR5IGdyb3VwLlxyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBGYWlsdXJlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFBRjInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuYXNzYXVsdC5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRGlkblxcJ3QgU3ByZWFkIScsXHJcbiAgICAgICAgICAgIGRlOiAnTmljaHQgdmVydGVpbHQhJyxcclxuICAgICAgICAgICAgZnI6ICdOZSBzXFwnZXN0IHBhcyBkaXNwZXJzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5pWj6ZaL44GX44Gq44GL44Gj44GfIScsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh5pyJ5pWj5byAIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDbGVhbnVwJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMjAsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmFzc2F1bHQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsYU1oaWdvLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbGEgTWhpZ28gTWFnaXRlayBSYXknOiAnMjRDRScsIC8vIExpbmUgQW9FLCBMZWdpb24gUHJlZGF0b3IgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gTG9jayBPbic6ICcyMDQ3JywgLy8gSG9taW5nIGNpcmNsZXMsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDEnOiAnMjA0OScsIC8vIEZyb250YWwgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDInOiAnMjA0QicsIC8vIFJlYXIgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDMnOiAnMjA0QycsIC8vIFJlYXIgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBTaG91bGRlciBDYW5ub24nOiAnMjREMCcsIC8vIENpcmNsZSBBb0UsIExlZ2lvbiBBdmVuZ2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENhbm5vbmZpcmUnOiAnMjNFRCcsIC8vIEVudmlyb25tZW50YWwgY2lyY2xlIEFvRSwgcGF0aCB0byBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnMjA1QScsIC8vIENpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBJbnRlZ3JhdGVkIEFldGhlcm9tb2R1bGF0b3InOiAnMjA1QicsIC8vIFJpbmcgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQ2lyY2xlIE9mIERlYXRoJzogJzI0RDQnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgSGV4YWRyb25lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEV4aGF1c3QnOiAnMjREMycsIC8vIExpbmUgQW9FLCBMZWdpb24gQ29sb3NzdXMgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gR3JhbmQgU3dvcmQnOiAnMjREMicsIC8vIENvbmFsIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3Rvcm0gMSc6ICcyMDY2JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIHByZS1pbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDInOiAnMjU4NycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDEnOiAnMjRCNicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmltYXJ5IGVudGl0eSwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIFZlaW4gU3BsaXR0ZXIgMic6ICcyMDZDJywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIGhlbHBlciBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBMaWdodGxlc3MgU3BhcmsnOiAnMjA2QicsIC8vIENvbmFsIEFvRSwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbGEgTWhpZ28gRGVtaW1hZ2lja3MnOiAnMjA1RScsXHJcbiAgICAnQWxhIE1oaWdvIFVubW92aW5nIFRyb2lrYSc6ICcyMDYwJyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAxJzogJzIwNjknLFxyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3b3JkIDInOiAnMjU4OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJdCdzIHBvc3NpYmxlIHBsYXllcnMgbWlnaHQganVzdCB3YW5kZXIgaW50byB0aGUgYmFkIG9uIHRoZSBvdXRzaWRlLFxyXG4gICAgICAvLyBidXQgbm9ybWFsbHkgcGVvcGxlIGdldCBwdXNoZWQgaW50byBpdC5cclxuICAgICAgaWQ6ICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd2VsbCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIERhbWFnZSBEb3duXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQjgnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXIsIE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBGb3IgcmVhc29ucyBub3QgY29tcGxldGVseSB1bmRlcnN0b29kIGF0IHRoZSB0aW1lIHRoaXMgd2FzIG1lcmdlZCxcclxuLy8gYnV0IGxpa2VseSByZWxhdGVkIHRvIHRoZSBmYWN0IHRoYXQgbm8gbmFtZXBsYXRlcyBhcmUgdmlzaWJsZSBkdXJpbmcgdGhlIGVuY291bnRlcixcclxuLy8gYW5kIHRoYXQgbm90aGluZyBpbiB0aGUgZW5jb3VudGVyIGFjdHVhbGx5IGRvZXMgZGFtYWdlLFxyXG4vLyB3ZSBjYW4ndCB1c2UgZGFtYWdlV2FybiBvciBnYWluc0VmZmVjdCBoZWxwZXJzIG9uIHRoZSBCYXJkYW0gZmlnaHQuXHJcbi8vIEluc3RlYWQsIHdlIHVzZSB0aGlzIGhlbHBlciBmdW5jdGlvbiB0byBsb29rIGZvciBmYWlsdXJlIGZsYWdzLlxyXG4vLyBJZiB0aGUgZmxhZyBpcyBwcmVzZW50LGEgZnVsbCB0cmlnZ2VyIG9iamVjdCBpcyByZXR1cm5lZCB0aGF0IGRyb3BzIGluIHNlYW1sZXNzbHkuXHJcbmNvbnN0IGFiaWxpdHlXYXJuID0gKGFyZ3M6IHsgYWJpbGl0eUlkOiBzdHJpbmc7IGlkOiBzdHJpbmcgfSk6IE9vcHN5VHJpZ2dlcjxEYXRhPiA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eSAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIGNvbnN0IHRyaWdnZXI6IE9vcHN5VHJpZ2dlcjxEYXRhPiA9IHtcclxuICAgIGlkOiBhcmdzLmlkLFxyXG4gICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogYXJncy5hYmlsaXR5SWQgfSksXHJcbiAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zdWJzdHIoLTIpID09PSAnMEUnLFxyXG4gICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgIH0sXHJcbiAgfTtcclxuICByZXR1cm4gdHJpZ2dlcjtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5CYXJkYW1zTWV0dGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdCYXJkYW0gRGlydHkgQ2xhdyc6ICcyMUE4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEd1bG8gR3VsbyB0cmFzaFxyXG4gICAgJ0JhcmRhbSBFcGlncmFwaCc6ICcyM0FGJywgLy8gTGluZSBBb0UsIFdhbGwgb2YgQmFyZGFtIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRoZSBEdXNrIFN0YXInOiAnMjE4NycsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFRoZSBEYXduIFN0YXInOiAnMjE4NicsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIENydW1ibGluZyBDcnVzdCc6ICcxRjEzJywgLy8gQ2lyY2xlIEFvRXMsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBSYW0gUnVzaCc6ICcxRUZDJywgLy8gTGluZSBBb0VzLCBTdGVwcGUgWWFtYWEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEx1bGxhYnknOiAnMjRCMicsIC8vIENpcmNsZSBBb0VzLCBTdGVwcGUgU2hlZXAsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEhlYXZlJzogJzFFRjcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFdpZGUgQmxhc3Rlcic6ICcyNEIzJywgLy8gRW5vcm1vdXMgZnJvbnRhbCBjbGVhdmUsIFN0ZXBwZSBDb2V1cmwsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gRG91YmxlIFNtYXNoJzogJzI2QScsIC8vIENpcmNsZSBBb0UsIE1ldHRsaW5nIERoYXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRyYW5zb25pYyBCbGFzdCc6ICcxMjYyJywgLy8gQ2lyY2xlIEFvRSwgU3RlcHBlIEVhZ2xlIHRyYXNoXHJcbiAgICAnQmFyZGFtIFdpbGQgSG9ybic6ICcyMjA4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEtodW4gR3VydmVsIHRyYXNoXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJzogJzI1NzgnLCAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInOiAnMjU3OScsIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMyc6ICcyNTdBJywgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDEnOiAnMjU3QicsIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAyJzogJzI1N0MnLCAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInOiAnMjU3RicsIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBCYXJkYW1cXCdzIFJpbmcnOiAnMjU4MScsIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCc6ICcyNTdEJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQgSW1wYWN0JzogJzI1ODAnLCAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSXJvbiBTcGhlcmUgQXR0YWNrJzogJzE2QjYnLCAvLyBDb250YWN0IGRhbWFnZSwgSXJvbiBTcGhlcmUgdHJhc2gsIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIFRvcm5hZG8nOiAnMjQ3RScsIC8vIENpcmNsZSBBb0UsIEtodW4gU2hhdmFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBQaW5pb24nOiAnMUYxMScsIC8vIExpbmUgQW9FLCBZb2wgRmVhdGhlciwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGZWF0aGVyIFNxdWFsbCc6ICcxRjBFJywgLy8gRGFzaCBhdHRhY2ssIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBVbnRhcmdldGVkJzogJzFGMTInLCAvLyBSb3RhdGluZyBjaXJjbGUgQW9FcywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdCYXJkYW0gQ29uZnVzZWQnOiAnMEInLCAvLyBGYWlsZWQgZ2F6ZSBhdHRhY2ssIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnQmFyZGFtIEZldHRlcnMnOiAnNTZGJywgLy8gRmFpbGluZyB0d28gbWVjaGFuaWNzIGluIGFueSBvbmUgcGhhc2Ugb24gQmFyZGFtLCBzZWNvbmQgYm9zcy5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0JhcmRhbSBHYXJ1bGEgUnVzaCc6ICcxRUY5JywgLy8gTGluZSBBb0UsIEdhcnVsYSwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gRmx1dHRlcmZhbGwgVGFyZ2V0ZWQnOiAnMUYwQycsIC8vIENpcmNsZSBBb0UgaGVhZG1hcmtlciwgWW9sLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIFdpbmdiZWF0JzogJzFGMEYnLCAvLyBDb25hbCBBb0UgaGVhZG1hcmtlciwgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJywgYWJpbGl0eUlkOiAnMjU3OCcgfSksXHJcbiAgICAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInLCBhYmlsaXR5SWQ6ICcyNTc5JyB9KSxcclxuICAgIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMycsIGFiaWxpdHlJZDogJzI1N0EnIH0pLFxyXG4gICAgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDEnLCBhYmlsaXR5SWQ6ICcyNTdCJyB9KSxcclxuICAgIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAyJywgYWJpbGl0eUlkOiAnMjU3QycgfSksXHJcbiAgICAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInLCBhYmlsaXR5SWQ6ICcyNTdGJyB9KSxcclxuICAgIC8vIEdhemUgYXR0YWNrLCBXYXJyaW9yIG9mIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gRW1wdHkgR2F6ZScsIGFiaWxpdHlJZDogJzFGMDQnIH0pLFxyXG4gICAgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtXFwncyBSaW5nJywgYWJpbGl0eUlkOiAnMjU4MScgfSksXHJcbiAgICAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCcsIGFiaWxpdHlJZDogJzI1N0QnIH0pLFxyXG4gICAgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0IEltcGFjdCcsIGFiaWxpdHlJZDogJzI1ODAnIH0pLFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5LdWdhbmVDYXN0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGVua2EgR29ra2VuJzogJzIzMjknLCAvLyBGcm9udGFsIGNvbmUgQW9FLCAgSm9pIEJsYWRlIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBLZW5raSBSZWxlYXNlIFRyYXNoJzogJzIzMzAnLCAvLyBDaGFyaW90IEFvRSwgSm9pIEtpeW9mdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xlYXJvdXQnOiAnMUU5MicsIC8vIEZyb250YWwgY29uZSBBb0UsIFp1aWtvLU1hcnUsIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYS1LaXJpIDEnOiAnMUU5NicsIC8vIEdpYW50IGNpcmNsZSBBb0UsIEhhcmFraXJpIEtvc2hvLCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAyJzogJzI0RjknLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAxJzogJzIzMkQnLCAvLyBMaW5lIEFvRSwgS2FyYWt1cmkgT25taXRzdSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgMTAwMCBCYXJicyc6ICcyMTk4JywgLy8gTGluZSBBb0UsIEpvaSBLb2phIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAyJzogJzFFOTgnLCAvLyBMaW5lIEFvRSwgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBUYXRhbWktR2Flc2hpJzogJzFFOUQnLCAvLyBGbG9vciB0aWxlIGxpbmUgYXR0YWNrLCBFbGtpdGUgT25taXRzdSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDMnOiAnMUVBMCcsIC8vIExpbmUgQW9FLCBFbGl0ZSBPbm1pdHN1LCBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBBdXRvIENyb3NzYm93JzogJzIzMzMnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBLYXJha3VyaSBIYW55YSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJha2lyaSAzJzogJzIzQzknLCAvLyBHaWFudCBDaXJjbGUgQW9FLCBIYXJha2lyaSAgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIElhaS1HaXJpJzogJzFFQTInLCAvLyBDaGFyaW90IEFvRSwgWW9qaW1ibywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBGcmFnaWxpdHknOiAnMUVBQScsIC8vIENoYXJpb3QgQW9FLCBJbm9zaGlrYWNobywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBEcmFnb25maXJlJzogJzFFQUInLCAvLyBMaW5lIEFvRSwgRHJhZ29uIEhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcblxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSXNzZW4nOiAnMUU5NycsIC8vIEluc3RhbnQgZnJvbnRhbCBjbGVhdmUsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xvY2t3b3JrIFJhaXRvbic6ICcxRTlCJywgLy8gTGFyZ2UgbGlnaHRuaW5nIHNwcmVhZCBjaXJjbGVzLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgWnVpa28gTWFydSwgYm9zcyAxXHJcbiAgICAgIGlkOiAnS3VnYW5lIENhc3RsZSBIZWxtIENyYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxRTk0JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxvbmUpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsbGVpbilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoc2V1bChlKSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5LiA5Lq6KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZXlkIMpYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKO2YvOyekCDrp57snYwpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TYWludE1vY2lhbm5lc0FyYm9yZXR1bUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgTXVkc3RyZWFtJzogJzMwRDknLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBJbW1hY3VsYXRlIEFwYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU2lsa2VuIFNwcmF5JzogJzMzODUnLCAvLyBSZWFyIGNvbmUgQW9FLCBXaXRoZXJlZCBCZWxsYWRvbm5hIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBNdWRkeSBQdWRkbGVzJzogJzMwREEnLCAvLyBTbWFsbCB0YXJnZXRlZCBjaXJjbGUgQW9FcywgRG9ycG9ra3VyIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBPZGlvdXMgQWlyJzogJzJFNDknLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNMdWRnZSBCb21iJzogJzJFNEUnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBPZGlvdXMgQXRtb3NwaGVyZSc6ICcyRTUxJywgLy8gQ2hhbm5lbGVkIDMvNCBhcmVuYSBjbGVhdmUsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgQ3JlZXBpbmcgSXZ5JzogJzMxQTUnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBXaXRoZXJlZCBLdWxhayB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUm9ja3NsaWRlJzogJzMxMzQnLCAvLyBMaW5lIEFvRSwgU2lsdCBHb2xlbSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFYXJ0aHF1YWtlIElubmVyJzogJzMxMkUnLCAvLyBDaGFyaW90IEFvRSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFYXJ0aHF1YWtlIE91dGVyJzogJzMxMkYnLCAvLyBEeW5hbW8gQW9FLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVtYmFsbWluZyBFYXJ0aCc6ICczMUE2JywgLy8gTGFyZ2UgQ2hhcmlvdCBBb0UsIE11ZGR5IE1hdGEsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUXVpY2ttaXJlJzogJzMxMzYnLCAvLyBTZXdhZ2Ugc3VyZ2UgYXZvaWRlZCBvbiBwbGF0Zm9ybXMsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBRdWFnbWlyZSBQbGF0Zm9ybXMnOiAnMzEzOScsIC8vIFF1YWdtaXJlIGV4cGxvc2lvbiBvbiBwbGF0Zm9ybXMsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBGZWN1bGVudCBGbG9vZCc6ICczMTNDJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25lIEFvRSwgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIENvcnJ1cHR1cmUnOiAnMzNBMCcsIC8vIE11ZCBTbGltZSBleHBsb3Npb24sIGJvc3MgMy4gKE5vIGV4cGxvc2lvbiBpZiBkb25lIGNvcnJlY3RseS4pXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNlZHVjZWQnOiAnM0RGJywgLy8gR2F6ZSBmYWlsdXJlLCBXaXRoZXJlZCBCZWxsYWRvbm5hIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBQb2xsZW4nOiAnMTMnLCAvLyBTbHVkZ2UgcHVkZGxlcywgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBUcmFuc2ZpZ3VyYXRpb24nOiAnNjQ4JywgLy8gUm9seS1Qb2x5IEFvRSBjaXJjbGUgZmFpbHVyZSwgQkxvb21pbmcgQmlsb2tvIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGZhaWx1cmUsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU3RhYiBXb3VuZCc6ICc0NUQnLCAvLyBBcmVuYSBvdXRlciB3YWxsIGVmZmVjdCwgYm9zcyAyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFRhcHJvb3QnOiAnMkU0QycsIC8vIExhcmdlIG9yYW5nZSBzcHJlYWQgY2lyY2xlcywgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFYXJ0aCBTaGFrZXInOiAnMzEzMScsIC8vIEVhcnRoIFNoYWtlciwgTGFraGFtdSwgYm9zcyAyXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRmF1bHQgV2FycmVuJzogJzJFNEEnLCAvLyBTdGFjayBtYXJrZXIsIE51bGxjaHUsIGJvc3MgMVxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTd2FsbG93c0NvbXBhc3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSXZ5IEZldHRlcnMnOiAnMkMwNCcsIC8vIENpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMSc6ICcyQzA1JywgLy8gVG9ybmFkbyBncm91bmQgQW9FLCBwbGFjZWQgYnkgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFlhbWEtS2FndXJhJzogJzJCOTYnLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmxhbWVzIE9mIEhhdGUnOiAnMkI5OCcsIC8vIEZpcmUgb3JiIGV4cGxvc2lvbnMsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQ29uZmxhZ3JhdGUnOiAnMkI5OScsIC8vIENvbGxpc2lvbiB3aXRoIGZpcmUgb3JiLCBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBVcHdlbGwnOiAnMkMwNicsIC8vIFRhcmdldGVkIGNpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCYWQgQnJlYXRoJzogJzJDMDcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgSmlubWVuanUgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBHcmVhdGVyIFBhbG0gMSc6ICcyQjlEJywgLy8gSGFsZiBhcmVuYSByaWdodCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDInOiAnMkI5RScsIC8vIEhhbGYgYXJlbmEgbGVmdCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVHJpYnV0YXJ5JzogJzJCQTAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmFsIGdyb3VuZCBBb0VzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMic6ICcyQzA2JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIGVudmlyb25tZW50LCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAzJzogJzJDMDcnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmlsb3BsdW1lcyc6ICcyQzc2JywgLy8gRnJvbnRhbCByZWN0YW5nbGUgQW9FLCBEcmFnb24gQmkgRmFuZyB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDEnOiAnMkJBOCcsIC8vIENoYXJpb3QgQW9FLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMic6ICcyQkE5JywgLy8gRHluYW1vIEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDMnOiAnMkJBRScsIC8vIENoYXJpb3QgQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDQnOiAnMkJBRicsIC8vIER5bmFtbyBBb0UsIFNoYWRvdyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBFcXVhbCBPZiBIZWF2ZW4nOiAnMkJCNCcsIC8vIFNtYWxsIGNpcmNsZSBncm91bmQgQW9FcywgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGF0dGFjayBmYWlsdXJlLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmxlZWRpbmcnOiAnMTEyRicsIC8vIFN0ZXBwaW5nIG91dHNpZGUgdGhlIGFyZW5hLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgTWlyYWdlJzogJzJCQTInLCAvLyBQcmV5LWNoYXNpbmcgcHVkZGxlcywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNb3VudGFpbiBGYWxscyc6ICcyQkE1JywgLy8gQ2lyY2xlIHNwcmVhZCBtYXJrZXJzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCc6ICcyQkE3JywgLy8gTGFzZXIgdGV0aGVyLCBRaXRpYW4gRGFzaGVuZyAgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBUaGUgTG9uZyBFbmQgMic6ICcyQkFEJywgLy8gTGFzZXIgVGV0aGVyLCBTaGFkb3dzIE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YW5kaW5nIGluIHRoZSBsYWtlLCBEaWFkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIFNpeCBGdWxtcyBVbmRlcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyMzcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU3RhY2sgbWFya2VyLCBib3NzIDNcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIEZpdmUgRmluZ2VyZWQgUHVuaXNobWVudCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzJCQUInLCAnMkJCMCddLCBzb3VyY2U6IFsnUWl0aWFuIERhc2hlbmcnLCAnU2hhZG93IE9mIFRoZSBTYWdlJ10gfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnR5cGUgPT09ICcyMScsIC8vIFRha2luZyB0aGUgc3RhY2sgc29sbyBpcyAqcHJvYmFibHkqIGEgbWlzdGFrZS5cclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVGVtcGxlT2ZUaGVGaXN0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUZW1wbGUgRmlyZSBCcmVhayc6ICcyMUVEJywgLy8gQ29uYWwgQW9FLCBCbG9vZGdsaWRlciBNb25rIHRyYXNoXHJcbiAgICAnVGVtcGxlIFJhZGlhbCBCbGFzdGVyJzogJzFGRDMnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDFcclxuICAgICdUZW1wbGUgV2lkZSBCbGFzdGVyJzogJzFGRDQnLCAvLyBDb25hbCBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBDcmlwcGxpbmcgQmxvdyc6ICcyMDE2JywgLy8gTGluZSBBb0VzLCBlbnZpcm9ubWVudGFsLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnVGVtcGxlIEJyb2tlbiBFYXJ0aCc6ICcyMzZFJywgLy8gQ2lyY2xlIEFvRSwgU2luZ2hhIHRyYXNoXHJcbiAgICAnVGVtcGxlIFNoZWFyJzogJzFGREQnLCAvLyBEdWFsIGNvbmFsIEFvRSwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIENvdW50ZXIgUGFycnknOiAnMUZFMCcsIC8vIFJldGFsaWF0aW9uIGZvciBpbmNvcnJlY3QgZGlyZWN0aW9uIGFmdGVyIEtpbGxlciBJbnN0aW5jdCwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIFRhcGFzJzogJycsIC8vIFRyYWNraW5nIGNpcmN1bGFyIGdyb3VuZCBBb0VzLCBib3NzIDJcclxuICAgICdUZW1wbGUgSGVsbHNlYWwnOiAnMjAwRicsIC8vIFJlZC9CbHVlIHN5bWJvbCBmYWlsdXJlLCBib3NzIDJcclxuICAgICdUZW1wbGUgUHVyZSBXaWxsJzogJzIwMTcnLCAvLyBDaXJjbGUgQW9FLCBTcGlyaXQgRmxhbWUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdUZW1wbGUgTWVnYWJsYXN0ZXInOiAnMTYzJywgLy8gQ29uYWwgQW9FLCBDb2V1cmwgUHJhbmEgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdUZW1wbGUgV2luZGJ1cm4nOiAnMUZFOCcsIC8vIENpcmNsZSBBb0UsIFR3aXN0ZXIgd2luZCwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIEh1cnJpY2FuZSBLaWNrJzogJzFGRTUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBib3NzIDNcclxuICAgICdUZW1wbGUgU2lsZW50IFJvYXInOiAnMUZFQicsIC8vIEZyb250YWwgbGluZSBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNaWdodHkgQmxvdyc6ICcxRkVBJywgLy8gQ29udGFjdCB3aXRoIGNvZXVybCBoZWFkLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBIZWF0IExpZ2h0bmluZyc6ICcxRkQ3JywgLy8gUHVycGxlIHNwcmVhZCBjaXJjbGVzLCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJ1cm4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIEZhbGxpbmcgUm9jayc6ICczMUEzJywgLy8gRW52aXJvbm1lbnRhbCBsaW5lIEFvRVxyXG4gICAgJ1RoZSBCdXJuIEFldGhlcmlhbCBCbGFzdCc6ICczMjhCJywgLy8gTGluZSBBb0UsIEt1a3Vsa2FuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gTW9sZS1hLXdoYWNrJzogJzMyOEQnLCAvLyBDaXJjbGUgQW9FLCBEZXNlcnQgRGVzbWFuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gSGVhZCBCdXR0JzogJzMyOEUnLCAvLyBTbWFsbCBjb25hbCBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGFyZGZhbGwnOiAnMzE5MScsIC8vIFJvb213aWRlIEFvRSwgTG9TIGZvciBzYWZldHksIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIERpc3NvbmFuY2UnOiAnMzE5MicsIC8vIERvbnV0IEFvRSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ3J5c3RhbGxpbmUgRnJhY3R1cmUnOiAnMzE5NycsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSZXNvbmFudCBGcmVxdWVuY3knOiAnMzE5OCcsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSb3Rvc3dpcGUnOiAnMzI5MScsIC8vIEZyb250YWwgY29uZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBXcmVja2luZyBCYWxsJzogJzMyOTInLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyZWFkbmF1Z2h0IHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2hhdHRlcic6ICczMjk0JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQ2hhcnJlZCBEb2JseW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBBdXRvLUNhbm5vbnMnOiAnMzI5NScsIC8vIExpbmUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2VsZi1EZXRvbmF0ZSc6ICczMjk2JywgLy8gQ2lyY2xlIEFvRSwgQ2hhcnJlZCBEcm9uZSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEZ1bGwgVGhyb3R0bGUnOiAnMkQ3NScsIC8vIExpbmUgQW9FLCBEZWZlY3RpdmUgRHJvbmUsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRocm90dGxlJzogJzJENzYnLCAvLyBMaW5lIEFvRSwgTWluaW5nIERyb25lIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIEFkaXQgRHJpdmVyJzogJzJENzgnLCAvLyBMaW5lIEFvRSwgUm9jayBCaXRlciBhZGRzLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBUcmVtYmxvcic6ICczMjk3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVmVpbGVkIEdpZ2F3b3JtIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRGVzZXJ0IFNwaWNlJzogJzMyOTgnLCAvLyBUaGUgZnJvbnRhbCBjbGVhdmVzIG11c3QgZmxvd1xyXG4gICAgJ1RoZSBCdXJuIFRveGljIFNwcmF5JzogJzMyOUEnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBHaWdhd29ybSBTdGFsa2VyIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gVmVub20gU3ByYXknOiAnMzI5QicsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBXaGl0ZSBEZWF0aCc6ICczMTQzJywgLy8gUmVhY3RpdmUgZHVyaW5nIGludnVsbmVyYWJpbGl0eSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAxJzogJzMxNDUnLCAvLyBTdGFyIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAyJzogJzMxNDYnLCAvLyBMaW5lIEFvRXMgYWZ0ZXIgc3RhcnMsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBDYXV0ZXJpemUnOiAnMzE0OCcsIC8vIExpbmUvU3dvb3AgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGhlIEJ1cm4gQ29sZCBGb2cnOiAnMzE0MicsIC8vIEdyb3dpbmcgY2lyY2xlIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gTGVhZGVuJzogJzQzJywgLy8gUHVkZGxlIGVmZmVjdCwgYm9zcyAyLiAoQWxzbyBpbmZsaWN0cyAxMUYsIFNsdWRnZS4pXHJcbiAgICAnVGhlIEJ1cm4gUHVkZGxlIEZyb3N0Yml0ZSc6ICcxMUQnLCAvLyBJY2UgcHVkZGxlIGVmZmVjdCwgYm9zcyAzLiAoTk9UIHRoZSBjb25hbC1pbmZsaWN0ZWQgb25lLCAxMEMuKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gSGFpbGZpcmUnOiAnMzE5NCcsIC8vIEhlYWQgbWFya2VyIGxpbmUgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBTaGFyZHN0cmlrZSc6ICczMTk1JywgLy8gT3JhbmdlIHNwcmVhZCBoZWFkIG1hcmtlcnMsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIENoaWxsaW5nIEFzcGlyYXRpb24nOiAnMzE0RCcsIC8vIEhlYWQgbWFya2VyIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZyb3N0IEJyZWF0aCc6ICczMTRDJywgLy8gVGFuayBjbGVhdmUsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzFOIC0gRGVsdGFzY2FwZSAxLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjEwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMU4gQnVybic6ICcyM0Q1JywgLy8gRmlyZWJhbGwgZXhwbG9zaW9uIGNpcmNsZSBBb0VzXHJcbiAgICAnTzFOIENsYW1wJzogJzIzRTInLCAvLyBGcm9udGFsIHJlY3RhbmdsZSBrbm9ja2JhY2sgQW9FLCBBbHRlIFJvaXRlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMU4gTGV2aW5ib2x0JzogJzIzREEnLCAvLyBzbWFsbCBzcHJlYWQgY2lyY2xlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8yTiAtIERlbHRhc2NhcGUgMi4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJOIE1haW4gUXVha2UnOiAnMjRBNScsIC8vIE5vbi10ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBGbGVzaHkgTWVtYmVyXHJcbiAgICAnTzJOIEVyb3Npb24nOiAnMjU5MCcsIC8vIFNtYWxsIGNpcmNsZSBBb0VzLCBGbGVzaHkgTWVtYmVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMk4gUGFyYW5vcm1hbCBXYXZlJzogJzI1MEUnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXZSBjb3VsZCB0cnkgdG8gc2VwYXJhdGUgb3V0IHRoZSBtaXN0YWtlIHRoYXQgbGVkIHRvIHRoZSBwbGF5ZXIgYmVpbmcgcGV0cmlmaWVkLlxyXG4gICAgICAvLyBIb3dldmVyLCBpdCdzIE5vcm1hbCBtb2RlLCB3aHkgb3ZlcnRoaW5rIGl0P1xyXG4gICAgICBpZDogJ08yTiBQZXRyaWZpY2F0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIC8vIFRoZSB1c2VyIG1pZ2h0IGdldCBoaXQgYnkgYW5vdGhlciBwZXRyaWZ5aW5nIGFiaWxpdHkgYmVmb3JlIHRoZSBlZmZlY3QgZW5kcy5cclxuICAgICAgLy8gVGhlcmUncyBubyBwb2ludCBpbiBub3RpZnlpbmcgZm9yIHRoYXQuXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI1MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgZGVhbHMgZGFtYWdlIG9ubHkgdG8gbm9uLWZsb2F0aW5nIHRhcmdldHMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzNOIC0gRGVsdGFzY2FwZSAzLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjMwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPM04gU3BlbGxibGFkZSBGaXJlIElJSSc6ICcyNDYwJywgLy8gRG9udXQgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgQmxpenphcmQgSUlJJzogJzI0NjEnLCAvLyBDaXJjbGUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgVGh1bmRlciBJSUknOiAnMjQ2MicsIC8vIExpbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIENyb3NzIFJlYXBlcic6ICcyNDZCJywgLy8gQ2lyY2xlIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gR3VzdGluZyBHb3VnZSc6ICcyNDZDJywgLy8gR3JlZW4gbGluZSBBb0UsIFNvdWwgUmVhcGVyXHJcbiAgICAnTzNOIFN3b3JkIERhbmNlJzogJzI0NzAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBIYWxpY2FybmFzc3VzXHJcbiAgICAnTzNOIFVwbGlmdCc6ICcyNDczJywgLy8gR3JvdW5kIHNwZWFycywgUXVlZW4ncyBXYWx0eiBlZmZlY3QsIEhhbGljYXJuYXNzdXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPM04gVWx0aW11bSc6ICcyNDc3JywgLy8gSW5zdGFudCBraWxsLiBVc2VkIGlmIHRoZSBwbGF5ZXIgZG9lcyBub3QgZXhpdCB0aGUgc2FuZCBtYXplIGZhc3QgZW5vdWdoLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzNOIEhvbHkgQmx1cic6IDI0NjMsIC8vIFNwcmVhZCBjaXJjbGVzLlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPM04gUGhhc2UgVHJhY2tlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWNhcm5hc3N1cycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWthcm5hc3NvcycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICfjg4/jg6rjgqvjg6vjg4rjg4Pjgr3jgrknLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+WTiOWIqeWNoee6s+iLj+aWrycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyICs9IDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHRvIHRyYWNrLCBhbmQgaW4gb3JkZXIgdG8gbWFrZSBpdCBhbGwgY2xlYW4sIGl0J3Mgc2FmZXN0IGp1c3QgdG9cclxuICAgICAgLy8gaW5pdGlhbGl6ZSBpdCBhbGwgdXAgZnJvbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgY29tcGFyaXNvbnMuXHJcbiAgICAgIGlkOiAnTzNOIEluaXRpYWxpemluZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIC8vIEluZGV4aW5nIHBoYXNlcyBhdCAxIHNvIGFzIHRvIG1ha2UgcGhhc2VzIG1hdGNoIHdoYXQgaHVtYW5zIGV4cGVjdC5cclxuICAgICAgICAvLyAxOiBXZSBzdGFydCBoZXJlLlxyXG4gICAgICAgIC8vIDI6IENhdmUgcGhhc2Ugd2l0aCBVcGxpZnRzLlxyXG4gICAgICAgIC8vIDM6IFBvc3QtaW50ZXJtaXNzaW9uLCB3aXRoIGdvb2QgYW5kIGJhZCBmcm9ncy5cclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyID0gMTtcclxuICAgICAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFJpYmJpdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NjYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgRE8gd2FudCB0byBiZSBoaXQgYnkgVG9hZC9SaWJiaXQgaWYgdGhlIG5leHQgY2FzdCBvZiBUaGUgR2FtZVxyXG4gICAgICAgIC8vIGlzIDR4IHRvYWQgcGFuZWxzLlxyXG4gICAgICAgIHJldHVybiAhKGRhdGEucGhhc2VOdW1iZXIgPT09IDMgJiYgZGF0YS5nYW1lQ291bnQgJSAyID09PSAwKSAmJiBtYXRjaGVzLnRhcmdldElkICE9PSAnRTAwMDAwMDAnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHdlIGNvdWxkIGRvIHRvIHRyYWNrIGV4YWN0bHkgaG93IHRoZSBwbGF5ZXIgZmFpbGVkIFRoZSBHYW1lLlxyXG4gICAgICAvLyBXaHkgb3ZlcnRoaW5rIE5vcm1hbCBtb2RlLCBob3dldmVyP1xyXG4gICAgICBpZDogJ08zTiBUaGUgR2FtZScsXHJcbiAgICAgIC8vIEd1ZXNzIHdoYXQgeW91IGp1c3QgbG9zdD9cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2RCcgfSksXHJcbiAgICAgIC8vIElmIHRoZSBwbGF5ZXIgdGFrZXMgbm8gZGFtYWdlLCB0aGV5IGRpZCB0aGUgbWVjaGFuaWMgY29ycmVjdGx5LlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgKz0gMTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPNE4gLSBEZWx0YXNjYXBlIDQuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080TiBCbGl6emFyZCBJSUknOiAnMjRCQycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBFeGRlYXRoXHJcbiAgICAnTzROIEVtcG93ZXJlZCBUaHVuZGVyIElJSSc6ICcyNEMxJywgLy8gVW50ZWxlZ3JhcGhlZCBsYXJnZSBjaXJjbGUgQW9FLCBFeGRlYXRoXHJcbiAgICAnTzROIFpvbWJpZSBCcmVhdGgnOiAnMjRDQicsIC8vIENvbmFsLCB0cmVlIGhlYWQgYWZ0ZXIgRGVjaXNpdmUgQmF0dGxlXHJcbiAgICAnTzROIENsZWFyb3V0JzogJzI0Q0MnLCAvLyBPdmVybGFwcGluZyBjb25lIEFvRXMsIERlYXRobHkgVmluZSAodGVudGFjbGVzIGFsb25nc2lkZSB0cmVlIGhlYWQpXHJcbiAgICAnTzROIEJsYWNrIFNwYXJrJzogJzI0QzknLCAvLyBFeHBsb2RpbmcgQmxhY2sgSG9sZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBFbXBvd2VyZWQgRmlyZSBJSUkgaW5mbGljdHMgdGhlIFB5cmV0aWMgZGVidWZmLCB3aGljaCBkZWFscyBkYW1hZ2UgaWYgdGhlIHBsYXllclxyXG4gICAgLy8gbW92ZXMgb3IgYWN0cyBiZWZvcmUgdGhlIGRlYnVmZiBmYWxscy4gVW5mb3J0dW5hdGVseSBpdCBkb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzXHJcbiAgICAvLyBjdXJyZW50bHkgYSBsb2cgbGluZSBmb3IgdGhpcywgc28gdGhlIG9ubHkgd2F5IHRvIGNoZWNrIGZvciB0aGlzIGlzIHRvIGNvbGxlY3RcclxuICAgIC8vIHRoZSBkZWJ1ZmZzIGFuZCB0aGVuIHdhcm4gaWYgYSBwbGF5ZXIgdGFrZXMgYW4gYWN0aW9uIGR1cmluZyB0aGF0IHRpbWUuIE5vdCB3b3J0aCBpdFxyXG4gICAgLy8gZm9yIE5vcm1hbC5cclxuICAgICdPNE4gU3RhbmRhcmQgRmlyZSc6ICcyNEJBJyxcclxuICAgICdPNE4gQnVzdGVyIFRodW5kZXInOiAnMjRCRScsIC8vIEEgY2xlYXZpbmcgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnQ2xlYW5zZXJzIG1pc3NlZCBEb29tIScsXHJcbiAgICAgICAgICAgIGRlOiAnRG9vbS1SZWluaWd1bmcgdmVyZ2Vzc2VuIScsXHJcbiAgICAgICAgICAgIGZyOiAnTlxcJ2EgcGFzIMOpdMOpIGRpc3NpcMOpKGUpIGR1IEdsYXMgIScsXHJcbiAgICAgICAgICAgIGphOiAn5q2744Gu5a6j5ZGKJyxcclxuICAgICAgICAgICAgY246ICfmsqHop6PmrbvlrqMnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU2hvcnQga25vY2tiYWNrIGZyb20gRXhkZWF0aFxyXG4gICAgICBpZDogJ080TiBWYWN1dW0gV2F2ZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0QjgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBSb29tLXdpZGUgQW9FLCBmcmVlemVzIG5vbi1tb3ZpbmcgdGFyZ2V0c1xyXG4gICAgICBpZDogJ080TiBFbXBvd2VyZWQgQmxpenphcmQnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNEU2JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIE80UyAtIERlbHRhc2NhcGUgNC4wIFNhdmFnZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzRTMiBOZW8gVmFjdXVtIFdhdmUnOiAnMjQxRCcsXHJcbiAgICAnTzRTMiBBY2NlbGVyYXRpb24gQm9tYic6ICcyNDMxJyxcclxuICAgICdPNFMyIEVtcHRpbmVzcyc6ICcyNDIyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPNFMyIERvdWJsZSBMYXNlcic6ICcyNDE1JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEZWNpc2l2ZSBCYXR0bGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyNDA4JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMSBWYWN1dW0gV2F2ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzIzRkUnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQgPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBBbG1hZ2VzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MTcnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNOZW9FeGRlYXRoID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCbGl6emFyZCBJSUknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjNGOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gSWdub3JlIHVuYXZvaWRhYmxlIHJhaWQgYW9lIEJsaXp6YXJkIElJSS5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSkgPT4gIWRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgVGh1bmRlciBJSUknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjNGRCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gT25seSBjb25zaWRlciB0aGlzIGR1cmluZyByYW5kb20gbWVjaGFuaWMgYWZ0ZXIgZGVjaXNpdmUgYmF0dGxlLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIFBldHJpZmllZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyNjInIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIE9uIE5lbywgYmVpbmcgcGV0cmlmaWVkIGlzIGJlY2F1c2UgeW91IGxvb2tlZCBhdCBTaHJpZWssIHNvIHlvdXIgZmF1bHQuXHJcbiAgICAgICAgaWYgKGRhdGEuaXNOZW9FeGRlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgICAgLy8gT24gbm9ybWFsIEV4RGVhdGgsIHRoaXMgaXMgZHVlIHRvIFdoaXRlIEhvbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBGb3JrZWQgTGlnaHRuaW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0MkUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERvdWJsZSBBdHRhY2sgQ29sbGVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzID0gZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcy5wdXNoKG1hdGNoZXMpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERvdWJsZSBBdHRhY2snLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQxQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCBhcnIgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXM7XHJcbiAgICAgICAgaWYgKCFhcnIpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPD0gMilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBIYXJkIHRvIGtub3cgd2hvIHNob3VsZCBiZSBpbiB0aGlzIGFuZCB3aG8gc2hvdWxkbid0LCBidXRcclxuICAgICAgICAvLyBpdCBzaG91bGQgbmV2ZXIgaGl0IDMgcGVvcGxlLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7YXJyWzBdLmFiaWxpdHl9IHggJHthcnIubGVuZ3RofWAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIG1hbnkgYWJpbGl0aWVzIGhlcmVcclxuXHJcbi8vIE83UyAtIFNpZ21hc2NhcGUgMy4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2lnbWFzY2FwZVYzMFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzdTIFNlYXJpbmcgV2luZCc6ICcyNzc3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPN1MgTWlzc2lsZSc6ICcyNzgyJyxcclxuICAgICdPN1MgQ2hhaW4gQ2Fubm9uJzogJzI3OEYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPN1MgU3RvbmVza2luJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyQUI1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy5zb3VyY2UsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBhZGQgUGF0Y2ggd2FybmluZ3MgZm9yIGRvdWJsZS91bmJyb2tlbiB0ZXRoZXJzXHJcbi8vIFRPRE86IEhlbGxvIFdvcmxkIGNvdWxkIGhhdmUgYW55IHdhcm5pbmdzIChzb3JyeSlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgTW90aW9uIDEnOiAnMzMzNCcsIC8vIDMwMCsgZGVncmVlIGNsZWF2ZSB3aXRoIGJhY2sgc2FmZSBhcmVhXHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAxJzogJzMzMjknLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBhZnRlciBzcGxpdFxyXG4gICAgJ08xMlMxIEVmZmljaWVudCBCbGFkZXdvcmsgMic6ICczMzJBJywgLy8gT21lZ2EtTSBcImdldCBvdXRcIiBjZW50ZXJlZCBhb2UgZHVyaW5nIGJsYWRlc1xyXG4gICAgJ08xMlMxIEJleW9uZCBTdHJlbmd0aCc6ICczMzI4JywgLy8gT21lZ2EtTSBcImdldCBpblwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgc2hpZWxkXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDEnOiAnMzMzMCcsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBTdGVlbCAyJzogJzMzMzEnLCAvLyBPbWVnYS1GIFwiZ2V0IGZyb250L2JhY2tcIiBibGFkZXMgcGhhc2VcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgQmxpenphcmQgSUlJJzogJzMzMzInLCAvLyBPbWVnYS1GIGdpYW50IGNyb3NzXHJcbiAgICAnTzEyUzIgRGlmZnVzZSBXYXZlIENhbm5vbic6ICczMzY5JywgLy8gYmFjay9zaWRlcyBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAxJzogJzMzNUEnLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgSHlwZXIgUHVsc2UgMic6ICczMzVCJywgLy8gUm90YXRpbmcgQXJjaGl2ZSBQZXJpcGhlcmFsIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IENvbG9zc2FsIEJsb3cnOiAnMzM1RicsIC8vIEV4cGxvZGluZyBBcmNoaXZlIEFsbCBoYW5kc1xyXG4gICAgJ08xMlMyIExlZnQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzYwJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aWNhbCBMYXNlcic6ICczMzQ3JywgLy8gbWlkZGxlIGxhc2VyIGZyb20gZXllXHJcbiAgICAnTzEyUzEgQWR2YW5jZWQgT3B0aWNhbCBMYXNlcic6ICczMzRBJywgLy8gZ2lhbnQgY2lyY2xlIGNlbnRlcmVkIG9uIGV5ZVxyXG4gICAgJ08xMlMyIFJlYXIgUG93ZXIgVW5pdCBSZWFyIExhc2VycyAxJzogJzMzNjEnLCAvLyBBcmNoaXZlIEFsbCBpbml0aWFsIGxhc2VyXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDInOiAnMzM2MicsIC8vIEFyY2hpdmUgQWxsIHJvdGF0aW5nIGxhc2VyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzMzNycsIC8vIGZpcmUgc3ByZWFkXHJcbiAgICAnTzEyUzIgSHlwZXIgUHVsc2UgVGV0aGVyJzogJzMzNUMnLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIHRldGhlcnNcclxuICAgICdPMTJTMiBXYXZlIENhbm5vbic6ICczMzZCJywgLy8gSW5kZXggQW5kIEFyY2hpdmUgUGVyaXBoZXJhbCBiYWl0ZWQgbGFzZXJzXHJcbiAgICAnTzEyUzIgT3B0aW1pemVkIEZpcmUgSUlJJzogJzMzNzknLCAvLyBBcmNoaXZlIEFsbCBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBTYWdpdHRhcml1cyBBcnJvdyc6ICczMzREJywgLy8gT21lZ2EtTSBiYXJkIGxpbWl0IGJyZWFrXHJcbiAgICAnTzEyUzIgT3ZlcnNhbXBsZWQgV2F2ZSBDYW5ub24nOiAnMzM2NicsIC8vIE1vbml0b3IgdGFuayBidXN0ZXJzXHJcbiAgICAnTzEyUzIgU2F2YWdlIFdhdmUgQ2Fubm9uJzogJzMzNkQnLCAvLyBUYW5rIGJ1c3RlciB3aXRoIHRoZSB2dWxuIGZpcnN0XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIERpc2NoYXJnZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczMzI3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID0gZGF0YS52dWxuIHx8IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA9IGRhdGEudnVsbiB8fCB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgRGFtYWdlJyxcclxuICAgICAgLy8gMzMyRSA9IFBpbGUgUGl0Y2ggc3RhY2tcclxuICAgICAgLy8gMzMzRSA9IEVsZWN0cmljIFNsaWRlIChPbWVnYS1NIHNxdWFyZSAxLTQgZGFzaGVzKVxyXG4gICAgICAvLyAzMzNGID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLUYgdHJpYW5nbGUgMS00IGRhc2hlcylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyczMzJFJywgJzMzM0UnLCAnMzMzRiddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEudnVsbiAmJiBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAod2l0aCB2dWxuKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChtaXQgVmVyd3VuZGJhcmtlaXQpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOiiq+ODgOODoeODvOOCuOS4iuaYhylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5bim5piT5LykKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gQnlha2tvIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUphZGVTdG9hRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBQb3BwaW5nIFVucmVsZW50aW5nIEFuZ3Vpc2ggYnViYmxlc1xyXG4gICAgJ0J5YUV4IEFyYXRhbWEnOiAnMjdGNicsXHJcbiAgICAvLyBTdGVwcGluZyBpbiBncm93aW5nIG9yYlxyXG4gICAgJ0J5YUV4IFZhY3V1bSBDbGF3JzogJzI3RTknLFxyXG4gICAgLy8gTGlnaHRuaW5nIFB1ZGRsZXNcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDEnOiAnMjdFNScsXHJcbiAgICAnQnlhRXggSHVuZGVyZm9sZCBIYXZvYyAyJzogJzI3RTYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0J5YUV4IFN3ZWVwIFRoZSBMZWcnOiAnMjdEQicsXHJcbiAgICAnQnlhRXggRmlyZSBhbmQgTGlnaHRuaW5nJzogJzI3REUnLFxyXG4gICAgJ0J5YUV4IERpc3RhbnQgQ2xhcCc6ICcyN0REJyxcclxuICAgIC8vIE1pZHBoYXNlIGxpbmUgYXR0YWNrXHJcbiAgICAnQnlhRXggSW1wZXJpYWwgR3VhcmQnOiAnMjdGMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBQaW5rIGJ1YmJsZSBjb2xsaXNpb25cclxuICAgICAgaWQ6ICdCeWFFeCBPbWlub3VzIFdpbmQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyN0VDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2J1YmJsZSBjb2xsaXNpb24nLFxyXG4gICAgICAgICAgICBkZTogJ0JsYXNlbiBzaW5kIHp1c2FtbWVuZ2VzdG/Dn2VuJyxcclxuICAgICAgICAgICAgZnI6ICdjb2xsaXNpb24gZGUgYnVsbGVzJyxcclxuICAgICAgICAgICAgamE6ICfooZ3nqoEnLFxyXG4gICAgICAgICAgICBjbjogJ+ebuOaSnicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQIOqyueyzkOyEnCDthLDsp5AnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGlucnl1IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUm95YWxNZW5hZ2VyaWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgQWtoIFJoYWknOiAnMUZBNicsIC8vIFNreSBsYXNlcnMgYWxvbmdzaWRlIEFraCBNb3JuLlxyXG4gICAgJ1NoaW5yeXUgQmxhemluZyBUcmFpbCc6ICcyMjFBJywgLy8gUmVjdGFuZ2xlIEFvRXMsIGludGVybWlzc2lvbiBhZGRzLlxyXG4gICAgJ1NoaW5yeXUgQ29sbGFwc2UnOiAnMjIxOCcsIC8vIENpcmNsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkc1xyXG4gICAgJ1NoaW5yeXUgRHJhZ29uZmlzdCc6ICcyNEYwJywgLy8gR2lhbnQgcHVuY2h5IGNpcmNsZSBpbiB0aGUgY2VudGVyLlxyXG4gICAgJ1NoaW5yeXUgRWFydGggQnJlYXRoJzogJzFGOUQnLCAvLyBDb25hbCBhdHRhY2tzIHRoYXQgYXJlbid0IGFjdHVhbGx5IEVhcnRoIFNoYWtlcnMuXHJcbiAgICAnU2hpbnJ5dSBHeXJlIENoYXJnZSc6ICcxRkE4JywgLy8gR3JlZW4gZGl2ZSBib21iIGF0dGFjay5cclxuICAgICdTaGlucnl1IFNwaWtlc2ljbGUnOiAnMUZBYCcsIC8vIEJsdWUtZ3JlZW4gbGluZSBhdHRhY2tzIGZyb20gYmVoaW5kLlxyXG4gICAgJ1NoaW5yeXUgVGFpbCBTbGFwJzogJzFGOTMnLCAvLyBSZWQgc3F1YXJlcyBpbmRpY2F0aW5nIHRoZSB0YWlsJ3MgbGFuZGluZyBzcG90cy5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgTGV2aW5ib2x0JzogJzFGOUMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSWN5IGZsb29yIGF0dGFjay5cclxuICAgICAgaWQ6ICdTaGlucnl1IERpYW1vbmQgRHVzdCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBUaWRhbCBXYXZlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY4QicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEtub2NrYmFjayBmcm9tIGNlbnRlci5cclxuICAgICAgaWQ6ICdTaGlucnl1IEFlcmlhbCBCbGFzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFGOTAnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3NlciAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTdXNhbm8gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUG9vbE9mVHJpYnV0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N1c0V4IENodXJuaW5nJzogJzIwM0YnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1N1c0V4IFJhc2VuIEthaWt5byc6ICcyMDJFJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBVbHRpbWEgV2VhcG9uIFVsdGltYXRlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWFwb25zUmVmcmFpblVsdGltYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdVV1UgU2VhcmluZyBXaW5kJzogJzJCNUMnLFxyXG4gICAgJ1VXVSBFcnVwdGlvbic6ICcyQjVBJyxcclxuICAgICdVV1UgV2VpZ2h0JzogJzJCNjUnLFxyXG4gICAgJ1VXVSBMYW5kc2xpZGUxJzogJzJCNzAnLFxyXG4gICAgJ1VXVSBMYW5kc2xpZGUyJzogJzJCNzEnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1VXVSBHcmVhdCBXaGlybHdpbmQnOiAnMkI0MScsXHJcbiAgICAnVVdVIFNsaXBzdHJlYW0nOiAnMkI1MycsXHJcbiAgICAnVVdVIFdpY2tlZCBXaGVlbCc6ICcyQjRFJyxcclxuICAgICdVV1UgV2lja2VkIFRvcm5hZG8nOiAnMkI0RicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VXVSBXaW5kYnVybicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdFQicgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMixcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGZWF0aGVybGFuY2UgZXhwbG9zaW9uLiAgSXQgc2VlbXMgbGlrZSB0aGUgcGVyc29uIHdobyBwb3BzIGl0IGlzIHRoZVxyXG4gICAgICAvLyBmaXJzdCBwZXJzb24gbGlzdGVkIGRhbWFnZS13aXNlLCBzbyB0aGV5IGFyZSBsaWtlbHkgdGhlIGN1bHByaXQuXHJcbiAgICAgIGlkOiAnVVdVIEZlYXRoZXJsYW5jZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzJCNDMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuc291cmNlIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzLCBrRmxhZ0luc3RhbnREZWF0aCB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBVQ1UgLSBUaGUgVW5lbmRpbmcgQ29pbCBPZiBCYWhhbXV0IChVbHRpbWF0ZSlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVVuZW5kaW5nQ29pbE9mQmFoYW11dFVsdGltYXRlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVQ1UgTHVuYXIgRHluYW1vJzogJzI2QkMnLFxyXG4gICAgJ1VDVSBJcm9uIENoYXJpb3QnOiAnMjZCQicsXHJcbiAgICAnVUNVIEV4YWZsYXJlJzogJzI2RUYnLFxyXG4gICAgJ1VDVSBXaW5ncyBPZiBTYWx2YXRpb24nOiAnMjZDQScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUd2lzdGVyIERlYXRoJyxcclxuICAgICAgLy8gSW5zdGFudCBkZWF0aCBoYXMgYSBzcGVjaWFsIGZsYWcgdmFsdWUsIGRpZmZlcmVudGlhdGluZ1xyXG4gICAgICAvLyBmcm9tIHRoZSBleHBsb3Npb24gZGFtYWdlIHlvdSB0YWtlIHdoZW4gc29tZWJvZHkgZWxzZVxyXG4gICAgICAvLyBwb3BzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QUInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMsIGZsYWdzOiBrRmxhZ0luc3RhbnREZWF0aCB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdUd2lzdGVyIFBvcCcsXHJcbiAgICAgICAgICAgIGRlOiAnV2lyYmVsc3R1cm0gYmVyw7xocnQnLFxyXG4gICAgICAgICAgICBmcjogJ0FwcGFyaXRpb24gZGVzIHRvcm5hZGVzJyxcclxuICAgICAgICAgICAgamE6ICfjg4TjgqTjgrnjgr/jg7wnLFxyXG4gICAgICAgICAgICBjbjogJ+aXi+mjjicsXHJcbiAgICAgICAgICAgIGtvOiAn7ZqM7Jik66asIOuwn+ydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUaGVybWlvbmljIEJ1cnN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QjknLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUGl6emEgU2xpY2UnLFxyXG4gICAgICAgICAgICBkZTogJ1Bpenphc3TDvGNrJyxcclxuICAgICAgICAgICAgZnI6ICdQYXJ0cyBkZSBwaXp6YScsXHJcbiAgICAgICAgICAgIGphOiAn44K144O844Of44Kq44OL44OD44Kv44OQ44O844K544OIJyxcclxuICAgICAgICAgICAgY246ICflpKnltKnlnLDoo4InLFxyXG4gICAgICAgICAgICBrbzogJ+yepe2MkOyXkCDrp57snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgQ2hhaW4gTGlnaHRuaW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QzgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEl0J3MgaGFyZCB0byBhc3NpZ24gYmxhbWUgZm9yIGxpZ2h0bmluZy4gIFRoZSBkZWJ1ZmZzXHJcbiAgICAgICAgLy8gZ28gb3V0IGFuZCB0aGVuIGV4cGxvZGUgaW4gb3JkZXIsIGJ1dCB0aGUgYXR0YWNrZXIgaXNcclxuICAgICAgICAvLyB0aGUgZHJhZ29uIGFuZCBub3QgdGhlIHBsYXllci5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGl0IGJ5IGxpZ2h0bmluZycsXHJcbiAgICAgICAgICAgIGRlOiAndm9tIEJsaXR6IGdldHJvZmZlbicsXHJcbiAgICAgICAgICAgIGZyOiAnZnJhcHDDqShlKSBwYXIgbGEgZm91ZHJlJyxcclxuICAgICAgICAgICAgamE6ICfjg4HjgqfjgqTjg7Pjg6njgqTjg4jjg4vjg7PjgrAnLFxyXG4gICAgICAgICAgICBjbjogJ+mbt+WFiemTvicsXHJcbiAgICAgICAgICAgIGtvOiAn67KI6rCcIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBCdXJucycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdGQScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgU2x1ZGdlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExRicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA9IGRhdGEuaGFzRG9vbSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIERvb20gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUgaXMgbm8gY2FsbG91dCBmb3IgXCJ5b3UgZm9yZ290IHRvIGNsZWFyIGRvb21cIi4gIFRoZSBsb2dzIGxvb2tcclxuICAgICAgLy8gc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgLy8gICBbMjA6MDI6MzAuNTY0XSAxQTpPa29ub21pIFlha2kgZ2FpbnMgdGhlIGVmZmVjdCBvZiBEb29tIGZyb20gIGZvciA2LjAwIFNlY29uZHMuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM2LjQ0M10gMUU6T2tvbm9taSBZYWtpIGxvc2VzIHRoZSBlZmZlY3Qgb2YgUHJvdGVjdCBmcm9tIFRha28gWWFraS5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBEb29tIGZyb20gLlxyXG4gICAgICAvLyAgIFsyMDowMjozOC41MjVdIDE5Ok9rb25vbWkgWWFraSB3YXMgZGVmZWF0ZWQgYnkgRmlyZWhvcm4uXHJcbiAgICAgIC8vIEluIG90aGVyIHdvcmRzLCBkb29tIGVmZmVjdCBpcyByZW1vdmVkICsvLSBuZXR3b3JrIGxhdGVuY3ksIGJ1dCBjYW4ndFxyXG4gICAgICAvLyB0ZWxsIHVudGlsIGxhdGVyIHRoYXQgaXQgd2FzIGEgZGVhdGguICBBcmd1YWJseSwgdGhpcyBjb3VsZCBoYXZlIGJlZW4gYVxyXG4gICAgICAvLyBjbG9zZS1idXQtc3VjY2Vzc2Z1bCBjbGVhcmluZyBvZiBkb29tIGFzIHdlbGwuICBJdCBsb29rcyB0aGUgc2FtZS5cclxuICAgICAgLy8gU3RyYXRlZ3k6IGlmIHlvdSBoYXZlbid0IGNsZWFyZWQgZG9vbSB3aXRoIDEgc2Vjb25kIHRvIGdvIHRoZW4geW91IHByb2JhYmx5XHJcbiAgICAgIC8vIGRpZWQgdG8gZG9vbS4gIFlvdSBjYW4gZ2V0IG5vbi1mYXRhbGx5IGljZWJhbGxlZCBvciBhdXRvJ2QgaW4gYmV0d2VlbixcclxuICAgICAgLy8gYnV0IHdoYXQgY2FuIHlvdSBkby5cclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0Rvb20gfHwgIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgbGV0IHJlYXNvbjtcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbik7XHJcbiAgICAgICAgaWYgKGR1cmF0aW9uIDwgOSlcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMSc7XHJcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPCAxNClcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMic7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMzJztcclxuICAgICAgICByZXR1cm4geyBuYW1lOiBtYXRjaGVzLnRhcmdldCwgcmVhc29uOiByZWFzb24gfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGhlIENvcGllZCBGYWN0b3J5XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDb3BpZWRGYWN0b3J5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iJzogJzQ4QjQnLFxyXG4gICAgLy8gTWFrZSBzdXJlIGVuZW1pZXMgYXJlIGlnbm9yZWQgb24gdGhlc2VcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iYXJkbWVudCc6ICc0OEI4JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBBc3NhdWx0JzogJzQ4QjYnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzQ4QzUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gU3BpbiAxJzogJzQ4Q0InLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gMic6ICc0OENDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIENlbnRyaWZ1Z2FsIFNwaW4nOiAnNDhDOScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBBaXItVG8tU3VyZmFjZSBFbmVyZ3knOiAnNDhCQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLUNhbGliZXIgTGFzZXInOiAnNDhGQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAxJzogJzQ4QkMnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMic6ICc0OEJEJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDMnOiAnNDhCRScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA0JzogJzQ4QzAnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNSc6ICc0OEMxJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDYnOiAnNDhDMicsXHJcblxyXG4gICAgJ0NvcGllZCBUcmFzaCBFbmVyZ3kgQm9tYic6ICc0OTFEJyxcclxuICAgICdDb3BpZWQgVHJhc2ggRnJvbnRhbCBTb21lcnNhdWx0JzogJzQ5MUInLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBIaWdoLUZyZXF1ZW5jeSBMYXNlcic6ICc0OTFFJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ja2luZyBEaXNjaGFyZ2UnOiAnNDgwQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAxJzogJzQ5QzUnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMic6ICc0OUM2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDMnOiAnNDlDNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA0JzogJzQ4MEYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNSc6ICc0ODEwJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDYnOiAnNDgxMScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAxJzogJzQ4MDInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAyJzogJzQ4MDMnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAzJzogJzQ4MDQnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFRvd2VyZmFsbCc6ICc0ODEzJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDEnOiAnNDgxNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDInOiAnNDgxNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDMnOiAnNDgxOCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgT2lsIFdlbGwnOiAnNDgxQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBFbGVjdHJvbWFnbmV0aWMgUHVsc2UnOiAnNDgxOScsXHJcbiAgICAvLyBUT0RPOiB3aGF0J3MgdGhlIGVsZWN0cmlmaWVkIGZsb29yIHdpdGggY29udmV5b3IgYmVsdHM/XHJcblxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDEnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMic6ICc0OTM4JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAzJzogJzQ5MzknLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDQnOiAnNDkzQScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBMYXNlciBUdXJyZXQnOiAnNDhFNicsXHJcblxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBBcmVhIEJvbWJpbmcnOiAnNDk0MycsXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc0OTQwJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDEnOiAnNDcyOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDInOiAnNDcyOCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDMnOiAnNDcyRicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDQnOiAnNDczMScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDUnOiAnNDcyQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDYnOiAnNDcyRCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDcnOiAnNDczMicsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgSW5jZW5kaWFyeSBCb21iaW5nJzogJzQ3MzknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgR3VpZGVkIE1pc3NpbGUnOiAnNDczNicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBTdXJmYWNlIE1pc3NpbGUnOiAnNDczNCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBMYXNlciBTaWdodCc6ICc0NzNCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEZyYWNrJzogJzQ3NEQnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggQ3J1c2gnOiAnNDhGQycsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBDcnVzaGluZyBXaGVlbCc6ICc0NzRCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggVGhydXN0JzogJzQ4RkMnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTGFzZXIgU3VwcHJlc3Npb24nOiAnNDhFMCcsIC8vIENhbm5vbnNcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAxJzogJzQ5NzQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDInOiAnNDhEQycsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMyc6ICc0OEU0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCA0JzogJzQ4RTAnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTWFyeCBJbXBhY3QnOiAnNDhENCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDEnOiAnNDhFOCcsXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMic6ICc0OEU5JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDEnOiAnNDhBNScsXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDInOiAnNDhBNycsXHJcblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ydC1SYW5nZSBNaXNzaWxlJzogJzQ4MTUnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1MDkzIHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNEZCNSB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDUwRDMgQWVyaWFsIFN1cHBvcnQ6IEJvbWJhcmRtZW50IGdvaW5nIG9mZiBmcm9tIGFkZFxyXG4vLyBUT0RPOiA1MjExIE1hbmV1dmVyOiBWb2x0IEFycmF5IG5vdCBnZXR0aW5nIGludGVycnVwdGVkXHJcbi8vIFRPRE86IDRGRjQvNEZGNSBPbmUgb2YgdGhlc2UgaXMgZmFpbGluZyBjaGVtaWNhbCBjb25mbGFncmF0aW9uXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHdyb25nIHRlbGVwb3J0ZXI/PyBtYXliZSA1MzYzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVB1cHBldHNCdW5rZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMSc6ICc1MDc0JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAyJzogJzUwNzUnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDMnOiAnNTA3NicsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBDb2xsaWRlciBDYW5ub25zJzogJzUwN0UnLCAvLyByb3RhdGluZyByZWQgZ3JvdW5kIGFvZSBwaW53aGVlbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDEnOiAnNTA5MScsIC8vIGNoYXNpbmcgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDInOiAnNTA5MicsIC8vIGNoYXNpbmcgbGFzZXIgY2hhc2luZ1xyXG4gICAgJ1B1cHBldCBBZWdpcyBGbGlnaHQgUGF0aCc6ICc1MDhDJywgLy8gYmx1ZSBsaW5lIGFvZSBmcm9tIGZseWluZyB1bnRhcmdldGFibGUgYWRkc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBSZWZyYWN0aW9uIENhbm5vbnMgMSc6ICc1MDgxJywgLy8gcmVmcmFjdGlvbiBjYW5ub25zIGJldHdlZW4gd2luZ3NcclxuICAgICdQdXBwZXQgQWVnaXMgTGlmZVxcJ3MgTGFzdCBTb25nJzogJzUzQjMnLCAvLyByaW5nIGFvZSB3aXRoIGdhcFxyXG4gICAgJ1B1cHBldCBMaWdodCBMb25nLUJhcnJlbGVkIExhc2VyJzogJzUyMTInLCAvLyBsaW5lIGFvZSBmcm9tIGFkZFxyXG4gICAgJ1B1cHBldCBMaWdodCBTdXJmYWNlIE1pc3NpbGUgSW1wYWN0JzogJzUyMEYnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSW5jZW5kaWFyeSBCb21iaW5nJzogJzRGQjknLCAvLyBmaXJlIHB1ZGRsZSBpbml0aWFsXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNoYXJwIFR1cm4nOiAnNTA2RCcsIC8vIHNoYXJwIHR1cm4gZGFzaFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMSc6ICc0RkIxJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMic6ICc0RkIyJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMyc6ICc0RkIzJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDEnOiAnNTA2RicsIC8vIHJpZ2h0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMic6ICc1MDcwJywgLy8gbGVmdC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBHdWlkZWQgTWlzc2lsZSc6ICc0RkI4JywgLy8gZ3JvdW5kIGFvZSBkdXJpbmcgQXJlYSBCb21iYXJkbWVudFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAxJzogJzRGQzAnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAyJzogJzRGQzEnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNEZGQycsIC8vIGNvbG9yZWQgbWFnaWMgaGFtbWVyLXkgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBSZXZvbHZpbmcgTGFzZXInOiAnNTAwMCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYic6ICc0RkZBJywgLy8gZ2V0dGluZyBoaXQgYnkgYmFsbCBkdXJpbmcgQWN0aXZlIFN1cHByZXNzaXZlIFVuaXRcclxuICAgICdQdXBwZXQgSGVhdnkgUjAxMCBMYXNlcic6ICc0RkYwJywgLy8gbGFzZXIgcG9kXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMzAgSGFtbWVyJzogJzRGRjEnLCAvLyBjaXJjbGUgYW9lIHBvZFxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc1MEIxJywgLy8gbG9uZyBhb2UgaW4gdGhlIGhhbGx3YXkgc2VjdGlvblxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEVuZXJneSBCb21iJzogJzUwQjInLCAvLyBydW5uaW5nIGludG8gYSBmbG9hdGluZyBvcmJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEaXNzZWN0aW9uJzogJzUxQjMnLCAvLyBzcGlubmluZyB2ZXJ0aWNhbCBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERlY2FwaXRhdGlvbic6ICc1MUI0JywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVW50YXJnZXRlZCc6ICc1MUI3JywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDEnOiAnNTFBQScsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDInOiAnNTFDQicsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAxJzogJzU0MUYnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAyJzogJzUxOTgnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDEnOiAnNTQyMCcsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDInOiAnNTE5OScsIC8vIDJQIHRlbGVwb3J0aW5nIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMSc6ICc1NDIxJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDInOiAnNTE5QScsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgR3JvdW5kJzogJzUxQUUnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBjaXJjbGVcclxuICAgIC8vIFRoaXMgaXMuLi4gdG9vIG5vaXN5LlxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMSc6ICc1MUEwJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGp1bXBcclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDInOiAnNTE5RicsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBjbGVhdmVcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMSc6ICc1MDg3JywgLy8gdXBwZXIgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAyJzogJzRGRjcnLCAvLyB1cHBlciBsYXNlciBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDEnOiAnNTA4NicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAyJzogJzRGRjYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMyc6ICc1MDg4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA0JzogJzRGRjgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDUnOiAnNTA4OScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA2JzogJzRGRjknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgSW5jb25ncnVvdXMgU3Bpbic6ICc1MUIyJywgLy8gZmluZCB0aGUgc2FmZSBzcG90IGRvdWJsZSBkYXNoXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdQdXBwZXQgQnVybnMnOiAnMTBCJywgLy8gc3RhbmRpbmcgaW4gbWFueSB2YXJpb3VzIGZpcmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHByZXR0eSBsYXJnZSBhbmQgZ2V0dGluZyBoaXQgYnkgaW5pdGlhbCB3aXRob3V0IGJ1cm5zIHNlZW1zIGZpbmUuXHJcbiAgICAvLyAnUHVwcGV0IExpZ2h0IEhvbWluZyBNaXNzaWxlIEltcGFjdCc6ICc1MjEwJywgLy8gdGFyZ2V0ZWQgZmlyZSBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgSGVhdnkgVW5jb252ZW50aW9uYWwgVm9sdGFnZSc6ICc1MDA0JyxcclxuICAgIC8vIFByZXR0eSBub2lzeS5cclxuICAgICdQdXBwZXQgTWFuZXV2ZXIgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwMDInLCAvLyB0YW5rIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVGFyZ2V0ZWQnOiAnNTFCNicsIC8vIHRhcmdldGVkIHNwcmVhZCBtYXJrZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUUnLCAvLyB0YXJnZXRlZCBzcHJlYWQgcG9kIGxhc2VyIG9uIG5vbi10YW5rXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQW50aS1QZXJzb25uZWwgTGFzZXInOiAnNTA5MCcsIC8vIHRhbmsgYnVzdGVyIG1hcmtlclxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBQcmVjaXNpb24tR3VpZGVkIE1pc3NpbGUnOiAnNEZDNScsXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgVGFuayc6ICc1MUFEJywgLy8gdGFyZ2V0ZWQgcG9kIGxhc2VyIG9uIHRhbmtcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIFNob2NrIEJsYWNrIDI/XHJcbi8vIFRPRE86IFdoaXRlL0JsYWNrIERpc3NvbmFuY2UgZGFtYWdlIGlzIG1heWJlIHdoZW4gZmxhZ3MgZW5kIGluIDAzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRvd2VyQXRQYXJhZGlnbXNCcmVhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMSc6ICc1RUE3JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDInOiAnNjBDOCcsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAxJzogJzVFQTUnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMic6ICc1RUE2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDMnOiAnNjBDNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDQnOiAnNjBDNycsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIEJ1cnN0JzogJzVFRDQnLCAvLyBTcGhlcm9pZCBLbmF2aXNoIEJ1bGxldHMgY29sbGlzaW9uXHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQmFycmFnZSc6ICc1RUFDJywgLy8gU3BoZXJvaWQgbGluZSBhb2VzXHJcbiAgICAnVG93ZXIgSGFuc2VsIFJlcGF5JzogJzVDNzAnLCAvLyBTaGllbGQgZGFtYWdlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEV4cGxvc2lvbic6ICc1QzY3JywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljIEJ1bGxldCBkdXJpbmcgUGFzc2luZyBMYW5jZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBJbXBhY3QnOiAnNUM1QycsIC8vIEJlaW5nIGhpdCBieSBNYWdpY2FsIENvbmZsdWVuY2UgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMSc6ICc1QzZDJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAyJzogJzVDNkQnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDMnOiAnNUM2RScsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgNCc6ICc1QzZGJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIFBhc3NpbmcgTGFuY2UnOiAnNUM2NicsIC8vIFRoZSBQYXNzaW5nIExhbmNlIGNoYXJnZSBpdHNlbGZcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAxJzogJzU1QjMnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAyJzogJzVDNUQnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAzJzogJzVDNUUnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDEnOiAnNUM3MScsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDInOiAnNUM3MicsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBMaWdodGZhc3QgQmxhZGUnOiAnNUJGRScsIC8vIGxhcmdlIHJvb20gY2xlYXZlXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgU3RhbmRhcmQgTGFzZXInOiAnNUJGRicsIC8vIHRyYWNraW5nIGxhc2VyXHJcbiAgICAnVG93ZXIgMlAgV2hpcmxpbmcgQXNzYXVsdCc6ICc1QkZCJywgLy8gbGluZSBhb2UgZnJvbSAyUCBjbG9uZXNcclxuICAgICdUb3dlciAyUCBCYWxhbmNlZCBFZGdlJzogJzVCRkEnLCAvLyBjaXJjdWxhciBhb2Ugb24gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAxJzogJzYwMDYnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAyJzogJzYwMDcnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAzJzogJzYwMDgnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA0JzogJzYwMDknLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA1JzogJzYzMTAnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA2JzogJzYzMTEnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA3JzogJzYzMTInLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA4JzogJzYzMTMnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMSc6ICc2MDBGJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDInOiAnNjAxMCcsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBCbGFjayAxJzogJzYwMTEnLCAvLyBibGFjayBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIHdoaXRlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMSc6ICc2MDFGJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAyJzogJzYwMjEnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDEnOiAnNjAyMCcsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMic6ICc2MDIyJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIFdoaXRlJzogJzYwMEMnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgd2hpdGUgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBCbGFjayc6ICc2MDBEJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIGJsYWNrIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIERpZmZ1c2UgRW5lcmd5JzogJzYwNTYnLCAvLyByb3RhdGluZyBjbG9uZSBidWJibGUgY2xlYXZlc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEJpZyBFeHBsb3Npb24nOiAnNjAyNycsIC8vIG5vdCBraWxsaW5nIGEgcHlsb24gZHVyaW5nIGhhY2tpbmcgcGhhc2VcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBFeHBsb3Npb24nOiAnNjAyNicsIC8vIHB5bG9uIGR1cmluZyBDaGlsZCdzIHBsYXlcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIE1pZGRsZSc6ICc1QzAyJywgLy8gbWlkZGxlIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBTaWRlcyc6ICc1QzA1JywgLy8gc2lkZXMgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDMnOiAnNjA3OCcsIC8vIGdvZXMgd2l0aCA1QzAxXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyA0JzogJzYwNzknLCAvLyBnb2VzIHdpdGggNUMwNFxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIEVuZXJneSBCb21iJzogJzVDMDUnLCAvLyBwaW5rIGJ1YmJsZVxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBSaWdodCc6ICc1QkQ3JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgcmlnaHRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgTGVmdCc6ICc1QkQ2JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgbGVmdFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTGlnaHRlciBOb3RlJzogJzVCREEnLCAvLyBsaWdodGVyIG5vdGUgbW92aW5nIGFvZXNcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZ2ljYWwgSW50ZXJmZXJlbmNlJzogJzVCRDUnLCAvLyBsYXNlcnMgZHVyaW5nIFJoeXRobSBSaW5nc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgU2NhdHRlcmVkIE1hZ2ljJzogJzVCREYnLCAvLyBjaXJjbGUgYW9lcyBmcm9tIFNlZWQgT2YgTWFnaWNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBVbmV2ZW4gRm90dGluZyc6ICc1QkUyJywgLy8gYnVpbGRpbmcgZnJvbSBSZWNyZWF0ZSBTdHJ1Y3R1cmVcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBDcmFzaCc6ICc1QkU1JywgLy8gdHJhaW5zIGZyb20gTWl4ZWQgU2lnbmFsc1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMSc6ICc1QkVEJywgLy8gaGVhdnkgYXJtcyBmcm9udC9iYWNrIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMic6ICc1QkVGJywgLy8gaGVhdnkgYXJtcyBzaWRlcyBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBFbmVyZ3kgU2NhdHRlcmVkIE1hZ2ljJzogJzVCRTgnLCAvLyBvcmJzIGZyb20gUmVkIEdpcmwgYnkgdHJhaW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBQbGFjZSBPZiBQb3dlcic6ICc1QzBEJywgLy8gaW5zdGFkZWF0aCBtaWRkbGUgY2lyY2xlIGJlZm9yZSBibGFjay93aGl0ZSByaW5nc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEFscGhhJzogJzVFQUInLCAvLyBTcHJlYWRcclxuICAgICdUb3dlciBIYW5zZWwgU2VlZCBPZiBNYWdpYyBBbHBoYSc6ICc1QzYxJywgLy8gU3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQmV0YSc6ICc1RUIzJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIE1hbmlwdWxhdGUgRW5lcmd5JzogJzYwMUEnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBEYXJrZXIgTm90ZSc6ICc1QkRDJywgLy8gVGFua2J1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUb3dlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNUVCMSA9IEtuYXZlIEx1bmdlXHJcbiAgICAgIC8vIDVCRjIgPSBIZXIgSW5mbG9yZXNlbmNlIFNob2Nrd2F2ZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNUVCMScsICc1QkYyJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFrYWRhZW1pYUFueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW55ZGVyIEFjcmlkIFN0cmVhbSc6ICc0MzA0JyxcclxuICAgICdBbnlkZXIgV2F0ZXJzcG91dCc6ICc0MzA2JyxcclxuICAgICdBbnlkZXIgUmFnaW5nIFdhdGVycyc6ICc0MzAyJyxcclxuICAgICdBbnlkZXIgVmlvbGVudCBCcmVhY2gnOiAnNDMwNScsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMSc6ICczRTA4JyxcclxuICAgICdBbnlkZXIgVGlkYWwgR3VpbGxvdGluZSAyJzogJzNFMEEnLFxyXG4gICAgJ0FueWRlciBQZWxhZ2ljIENsZWF2ZXIgMSc6ICczRTA5JyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDInOiAnM0UwQicsXHJcbiAgICAnQW55ZGVyIEFxdWF0aWMgTGFuY2UnOiAnM0UwNScsXHJcbiAgICAnQW55ZGVyIFN5cnVwIFNwb3V0JzogJzQzMDgnLFxyXG4gICAgJ0FueWRlciBOZWVkbGUgU3Rvcm0nOiAnNDMwOScsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMSc6ICczRTEwJyxcclxuICAgICdBbnlkZXIgRXh0ZW5zaWJsZSBUZW5kcmlscyAyJzogJzNFMTEnLFxyXG4gICAgJ0FueWRlciBQdXRyaWQgQnJlYXRoJzogJzNFMTInLFxyXG4gICAgJ0FueWRlciBEZXRvbmF0b3InOiAnNDMwRicsXHJcbiAgICAnQW55ZGVyIERvbWluaW9uIFNsYXNoJzogJzQzMEQnLFxyXG4gICAgJ0FueWRlciBRdWFzYXInOiAnNDMwQicsXHJcbiAgICAnQW55ZGVyIERhcmsgQXJyaXZpc21lJzogJzQzMEUnLFxyXG4gICAgJ0FueWRlciBUaHVuZGVyc3Rvcm0nOiAnM0UxQycsXHJcbiAgICAnQW55ZGVyIFdpbmRpbmcgQ3VycmVudCc6ICczRTFGJyxcclxuICAgIC8vIDNFMjAgaXMgYmVpbmcgaGl0IGJ5IHRoZSBncm93aW5nIG9yYnMsIG1heWJlP1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQW1hdXJvdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW1hdXJvdCBCdXJuaW5nIFNreSc6ICczNTRBJyxcclxuICAgICdBbWF1cm90IFdoYWNrJzogJzM1M0MnLFxyXG4gICAgJ0FtYXVyb3QgQWV0aGVyc3Bpa2UnOiAnMzUzQicsXHJcbiAgICAnQW1hdXJvdCBWZW5lbW91cyBCcmVhdGgnOiAnM0NDRScsXHJcbiAgICAnQW1hdXJvdCBDb3NtaWMgU2hyYXBuZWwnOiAnNEQyNicsXHJcbiAgICAnQW1hdXJvdCBFYXJ0aHF1YWtlJzogJzNDQ0QnLFxyXG4gICAgJ0FtYXVyb3QgTWV0ZW9yIFJhaW4nOiAnM0NDNicsXHJcbiAgICAnQW1hdXJvdCBGaW5hbCBTa3knOiAnM0NDQicsXHJcbiAgICAnQW1hdXJvdCBNYWxldm9sZW5jZSc6ICczNTQxJyxcclxuICAgICdBbWF1cm90IFR1cm5hYm91dCc6ICczNTQyJyxcclxuICAgICdBbWF1cm90IFNpY2tseSBJbmZlcm5vJzogJzNERTMnLFxyXG4gICAgJ0FtYXVyb3QgRGlzcXVpZXRpbmcgR2xlYW0nOiAnMzU0NicsXHJcbiAgICAnQW1hdXJvdCBCbGFjayBEZWF0aCc6ICczNTQzJyxcclxuICAgICdBbWF1cm90IEZvcmNlIG9mIExvYXRoaW5nJzogJzM1NDQnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMSc6ICczRTAwJyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDInOiAnM0UwMScsXHJcbiAgICAnQW1hdXJvdCBEZWFkbHkgVGVudGFjbGVzJzogJzM1NDcnLFxyXG4gICAgJ0FtYXVyb3QgTWlzZm9ydHVuZSc6ICczQ0UyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdBbWF1cm90IEFwb2thbHlwc2lzJzogJzNDRDcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQW5hbW5lc2lzQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFBodWFibyBTcGluZSBMYXNoJzogJzREMUEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBBbmVtb25lIEZhbGxpbmcgUm9jayc6ICc0RTM3JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2UgZnJvbSBUcmVuY2ggQW5lbW9uZSBzaG93aW5nIHVwXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBEYWdvbml0ZSBTZXdlciBXYXRlcic6ICc0RDFDJywgLy8gZnJvbnRhbCBjb25hbCBmcm9tIFRyZW5jaCBBbmVtb25lICg/ISlcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFJvY2sgSGFyZCc6ICc0RDIxJywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWW92cmEgVG9ycmVudGlhbCBUb3JtZW50JzogJzREMjEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gTHVtaW5vdXMgUmF5JzogJzRFMjcnLCAvLyBVbmtub3duIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2luc3RlciBCdWJibGUgRXhwbG9zaW9uJzogJzRCNkUnLCAvLyBVbmtub3duIGV4cGxvc2lvbnMgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gUmVmbGVjdGlvbic6ICc0QjZGJywgLy8gVW5rbm93biBjb25hbCBhdHRhY2sgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMSc6ICc0Qjc0JywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBDbGVhcm91dCAyJzogJzRCNkInLCAvLyBVbmtub3duIGZyb250YWwgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNldGJhY2sgMSc6ICc0Qjc1JywgLy8gVW5rbm93biByZWFyIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDInOiAnNUI2QycsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBDbGlvbmlkIEFjcmlkIFN0cmVhbSc6ICc0RDI0JywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgRGl2aW5lciBEcmVhZHN0b3JtJzogJzREMjgnLCAvLyBncm91bmQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIDIwMDAtTWluYSBTd2luZyc6ICc0QjU1JywgLy8gS3lrbG9wcyBnZXQgb3V0IG1lY2hhbmljXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgSGFtbWVyJzogJzRCNUQnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgQmxhZGUnOiAnNEI1RScsIC8vIEt5a2xvcHMgSGFtbWVyL0JsYWRlIGFsdGVybmF0aW5nIHNxdWFyZXNcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBSYWdpbmcgR2xvd2VyJzogJzRCNTYnLCAvLyBLeWtsb3BzIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgRXllIE9mIFRoZSBDeWNsb25lJzogJzRCNTcnLCAvLyBLeWtsb3BzIGRvbnV0XHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBIYXJwb29uZXIgSHlkcm9iYWxsJzogJzREMjYnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBTd2lmdCBTaGlmdCc6ICc0QjgzJywgLy8gUnVrc2hzIERlZW0gdGVsZXBvcnQgTi9TXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBEZXB0aCBHcmlwIFdhdmVicmVha2VyJzogJzMzRDQnLCAvLyBSdWtzaHMgRGVlbSBoYW5kIGF0dGFja3NcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIFJpc2luZyBUaWRlJzogJzRCOEInLCAvLyBSdWtzaHMgRGVlbSBjcm9zcyBhb2VcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIENvbW1hbmQgQ3VycmVudCc6ICc0QjgyJywgLy8gUnVrc2hzIERlZW0gcHJvdGVhbi1pc2ggZ3JvdW5kIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWHpvbWl0IE1hbnRsZSBEcmlsbCc6ICc0RDE5JywgLy8gY2hhcmdlIGF0dGFja1xyXG4gICAgJ0FuYW1uZXNpcyBJbyBPdXNpYSBCYXJyZWxpbmcgU21hc2gnOiAnNEUyNCcsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBXYW5kZXJlclxcJ3MgUHlyZSc6ICc0QjVGJywgLy8gS3lrbG9wcyBzcHJlYWQgYXR0YWNrXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogTWlzc2luZyBHcm93aW5nIHRldGhlcnMgb24gYm9zcyAyLlxyXG4vLyAoTWF5YmUgZ2F0aGVyIHBhcnR5IG1lbWJlciBuYW1lcyBvbiB0aGUgcHJldmlvdXMgVElJSUlNQkVFRUVFRVIgY2FzdCBmb3IgY29tcGFyaXNvbj8pXHJcbi8vIFRPRE86IEZhaWxpbmcgdG8gaW50ZXJydXB0IERvaG5mYXVzdCBGdWF0aCBvbiBXYXRlcmluZyBXaGVlbCBjYXN0cz9cclxuLy8gKDE1Oi4uLi4uLi4uOkRvaG5mYXN0IEZ1YXRoOjNEQUE6V2F0ZXJpbmcgV2hlZWw6Li4uLi4uLi46KFxceXtOYW1lfSk6KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRvaG5NaGVnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEb2huIE1oZWcgR2V5c2VyJzogJzIyNjAnLCAvLyBXYXRlciBlcnVwdGlvbnMsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBIeWRyb2ZhbGwnOiAnMjJCRCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgTGF1Z2hpbmcgTGVhcCc6ICcyMjk0JywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBTd2luZ2UnOiAnMjJDQScsIC8vIEZyb250YWwgY29uZSwgYm9zcyAyXHJcbiAgICAnRG9obiBNaGVnIENhbm9weSc6ICczREIwJywgLy8gRnJvbnRhbCBjb25lLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgUGluZWNvbmUgQm9tYic6ICczREIxJywgLy8gQ2lyY3VsYXIgZ3JvdW5kIEFvRSBtYXJrZXIsIERvaG5mYXVzdCBSb3dhbnMgdGhyb3VnaG91dCBpbnN0YW5jZVxyXG4gICAgJ0RvaG4gTWhlZyBCaWxlIEJvbWJhcmRtZW50JzogJzM0RUUnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAzXHJcbiAgICAnRG9obiBNaGVnIENvcnJvc2l2ZSBCaWxlJzogJzM0RUMnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBGbGFpbGluZyBUZW50YWNsZXMnOiAnMzY4MScsXHJcblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgSW1wIENob2lyJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgVG9hZCBDaG9pcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxQjcnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEZvb2xcXCdzIFR1bWJsZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxODMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogQmVyc2Vya2VyIDJuZC8zcmQgd2lsZCBhbmd1aXNoIHNob3VsZCBiZSBzaGFyZWQgd2l0aCBqdXN0IGEgcm9ja1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUhlcm9lc0dhdW50bGV0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUSEcgQmxhZGVcXCdzIEJlbmlzb24nOiAnNTIyOCcsIC8vIHBsZCBjb25hbFxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBIb2x5JzogJzUyNEInLCAvLyB3aG0gdmVyeSBsYXJnZSBhb2VcclxuICAgICdUSEcgSGlzc2F0c3U6IEdva2EnOiAnNTIzRCcsIC8vIHNhbSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBXaG9sZSBTZWxmJzogJzUyMkQnLCAvLyBtbmsgd2lkZSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBSYW5kZ3JpdGgnOiAnNTIzMicsIC8vIGRyZyB2ZXJ5IGJpZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMSc6ICc1MDYxJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMic6ICc1MDYyJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBDb3dhcmRcXCdzIEN1bm5pbmcnOiAnNEZENycsIC8vIFNwZWN0cmFsIFRoaWVmIENoaWNrZW4gS25pZmUgbGFzZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMSc6ICc0RkQxJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMic6ICc0RkQyJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUmluZyBvZiBEZWF0aCc6ICc1MjM2JywgLy8gZHJnIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBMdW5hciBFY2xpcHNlJzogJzUyMjcnLCAvLyBwbGQgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIEdyYXZpdHknOiAnNTI0OCcsIC8vIGluayBtYWdlIGNpcmN1bGFyXHJcbiAgICAnVEhHIFJhaW4gb2YgTGlnaHQnOiAnNTI0MicsIC8vIGJhcmQgbGFyZ2UgY2lyY3VsZSBhb2VcclxuICAgICdUSEcgRG9vbWluZyBGb3JjZSc6ICc1MjM5JywgLy8gZHJnIGxpbmUgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIERhcmsgSUknOiAnNEY2MScsIC8vIE5lY3JvbWFuY2VyIDEyMCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgQnVyc3QnOiAnNTNCNycsIC8vIE5lY3JvbWFuY2VyIG5lY3JvYnVyc3Qgc21hbGwgem9tYmllIGV4cGxvc2lvblxyXG4gICAgJ1RIRyBQYWluIE1pcmUnOiAnNEZBNCcsIC8vIE5lY3JvbWFuY2VyIHZlcnkgbGFyZ2UgZ3JlZW4gYmxlZWQgcHVkZGxlXHJcbiAgICAnVEhHIERhcmsgRGVsdWdlJzogJzRGNUQnLCAvLyBOZWNyb21hbmNlciBncm91bmQgYW9lXHJcbiAgICAnVEhHIFRla2thIEdvamluJzogJzUyM0UnLCAvLyBzYW0gOTAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAxJzogJzUyMEEnLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDInOiAnNTIwQicsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBXaWxkIFJhZ2UnOiAnNTIwMycsIC8vIEJlcnNlcmtlciBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdUSEcgQmxlZWRpbmcnOiAnODI4JywgLy8gU3RhbmRpbmcgaW4gdGhlIE5lY3JvbWFuY2VyIHB1ZGRsZSBvciBvdXRzaWRlIHRoZSBCZXJzZXJrZXIgYXJlbmFcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ1RIRyBUcnVseSBCZXJzZXJrJzogJzkwNicsIC8vIFN0YW5kaW5nIGluIHRoZSBjcmF0ZXIgdG9vIGxvbmdcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RIRyBBYnNvbHV0ZSBUaHVuZGVyIElWJzogJzUyNDUnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGJsbVxyXG4gICAgJ1RIRyBNb29uZGl2ZXInOiAnNTIzMycsIC8vIGhlYWRtYXJrZXIgYW9lIGZyb20gZHJnXHJcbiAgICAnVEhHIFNwZWN0cmFsIEd1c3QnOiAnNTNDRicsIC8vIFNwZWN0cmFsIFRoaWVmIGhlYWRtYXJrZXIgYW9lXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUSEcgRmFsbGluZyBSb2NrJzogJzUyMDUnLCAvLyBCZXJzZXJrZXIgaGVhZG1hcmtlciBhb2UgdGhhdCBjcmVhdGVzIHJ1YmJsZVxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSBzaGFyZWQuICBPbiBhbGwgdGltZXMgYnV0IHRoZSAybmQgYW5kIDNyZCwgaXQncyBhIHBhcnR5IHNoYXJlLlxyXG4gICAgLy8gVE9ETzogb24gdGhlIDJuZCBhbmQgM3JkIHRpbWUgdGhpcyBzaG91bGQgb25seSBiZSBzaGFyZWQgd2l0aCBhIHJvY2suXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5IHdhcm4gb24gdGFraW5nIG9uZSBvZiB0aGVzZSB3aXRoIGEgNDcyIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgZWZmZWN0XHJcbiAgICAnVEhHIFdpbGQgQW5ndWlzaCc6ICc1MjA5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEhHIFdpbGQgUmFtcGFnZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzUyMDcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgaXMgemVybyBkYW1hZ2UgaWYgeW91IGFyZSBpbiB0aGUgY3JhdGVyLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkhvbG1pbnN0ZXJTd2l0Y2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGh1bWJzY3Jldyc6ICczREM2JyxcclxuICAgICdIb2xtaW5zdGVyIFdvb2RlbiBob3JzZSc6ICczREM3JyxcclxuICAgICdIb2xtaW5zdGVyIExpZ2h0IFNob3QnOiAnM0RDOCcsXHJcbiAgICAnSG9sbWluc3RlciBIZXJldGljXFwncyBGb3JrJzogJzNEQ0UnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSG9seSBXYXRlcic6ICczREQ0JyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDEnOiAnM0RERCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAyJzogJzNEREUnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMyc6ICczRERGJyxcclxuICAgICdIb2xtaW5zdGVyIENhdCBPXFwnIE5pbmUgVGFpbHMnOiAnM0RFMScsXHJcbiAgICAnSG9sbWluc3RlciBSaWdodCBLbm91dCc6ICczREU2JyxcclxuICAgICdIb2xtaW5zdGVyIExlZnQgS25vdXQnOiAnM0RFNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBBZXRoZXJzdXAnOiAnM0RFOScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIEZsYWdlbGxhdGlvbic6ICczREQ2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGFwaGVwaG9iaWEnOiAnNDE4MScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYWxpa2Foc1dlbGwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ01hbGlrYWggRmFsbGluZyBSb2NrJzogJzNDRUEnLFxyXG4gICAgJ01hbGlrYWggV2VsbGJvcmUnOiAnM0NFRCcsXHJcbiAgICAnTWFsaWthaCBHZXlzZXIgRXJ1cHRpb24nOiAnM0NFRScsXHJcbiAgICAnTWFsaWthaCBTd2lmdCBTcGlsbCc6ICczQ0YwJyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDEnOiAnM0NGNScsXHJcbiAgICAnTWFsaWthaCBDcnlzdGFsIE5haWwnOiAnM0NGNycsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDEnOiAnM0NGOScsXHJcbiAgICAnTWFsaWthaCBCcmVha2luZyBXaGVlbCAyJzogJzNDRkEnLFxyXG4gICAgJ01hbGlrYWggSGVyZXRpY1xcJ3MgRm9yayAyJzogJzNFMEUnLFxyXG4gICAgJ01hbGlrYWggRWFydGhzaGFrZSc6ICczRTM5JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogY291bGQgaW5jbHVkZSA1NDg0IE11ZG1hbiBSb2NreSBSb2xsIGFzIGEgc2hhcmVXYXJuLCBidXQgaXQncyBsb3cgZGFtYWdlIGFuZCBjb21tb24uXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0b3lhc1JlbGljdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWF0b3lhIFJlbGljdCBXZXJld29vZCBPdmF0aW9uJzogJzU1MTgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdG95YSBDYXZlIFRhcmFudHVsYSBIYXdrIEFwaXRveGluJzogJzU1MTknLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBTcHJpZ2dhbiBTdG9uZWJlYXJlciBSb21wJzogJzU1MUEnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgU29ubnkgT2YgWmlnZ3kgSml0dGVyaW5nIEdsYXJlJzogJzU1MUMnLCAvLyBsb25nIG5hcnJvdyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIFF1YWdtaXJlJzogJzU0ODEnLCAvLyBNdWRtYW4gYW9lIHB1ZGRsZXNcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAxJzogJzU0OEUnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDInOiAnNTQ4RicsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMyc6ICc1NDkwJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIE11ZCBCdWJibGUnOiAnNTQ4NycsIC8vIHN0YW5kaW5nIGluIG11ZCBwdWRkbGU/XHJcbiAgICAnTWF0b3lhIENhdmUgUHVnaWwgU2NyZXdkcml2ZXInOiAnNTUxRScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBOaXhpZSBHdXJnbGUnOiAnNTk5MicsIC8vIE5peGllIHdhbGwgZmx1c2hcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFB5cm9jbGFzdGljIFNob3QnOiAnNTdFQicsIC8vIHRoZSBsaW5lIGFvZXMgYXMgeW91IHJ1biB0byB0cmFzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgRmxhbiBGbG9vZCc6ICc1NTIzJywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUHlyb2R1Y3QgRWxkdGh1cnMgTWFzaCc6ICc1NTI3JywgLy8gbGluZSBhb2VcclxuICAgICdNYXR5b2EgUHlyb2R1Y3QgRWxkdGh1cnMgU3Bpbic6ICc1NTI4JywgLy8gdmVyeSBsYXJnZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBCYXZhcm9pcyBUaHVuZGVyIElJSSc6ICc1NTI1JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTWFyc2htYWxsb3cgQW5jaWVudCBBZXJvJzogJzU1MjQnLCAvLyB2ZXJ5IGxhcmdlIGxpbmUgZ3JvYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBQdWRkaW5nIEZpcmUgSUknOiAnNTUyMicsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIEhvdCBMYXZhJzogJzU3RTknLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFZvbGNhbmljIERyb3AnOiAnNTdFOCcsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBNZWRpdW0gUmVhcic6ICc1OTFEJywgLy8ga25vY2tiYWNrIGludG8gc2FmZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgTGluZSc6ICc1OTE3JywgLy8gbGluZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIENpcmNsZSc6ICc1OTE4JywgLy8gY2lyY2xlIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgVG8gQSBDcmlzcCc6ICc1OTI1JywgLy8gZ2V0dGluZyB0byBjbG9zZSB0byBib3NzIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFByb3hpZSBCdWZmZXQnOiAnNTkyNicsIC8vIEFlb2xpYW4gQ2F2ZSBTcHJpdGUgbGluZSBhb2UgKGlzIHRoaXMgYSBwdW4/KVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBTZWEgU2hhbnR5JzogJzU5OEMnLCAvLyBOb3QgdGFraW5nIHRoZSBwdWRkbGUgdXAgdG8gdGhlIHRvcD8gRmFpbGluZyBhZGQgZW5yYWdlP1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIENyYWNrJzogJzU5OTAnLCAvLyBOaXhpZSBDcmFzaC1TbWFzaCB0YW5rIHRldGhlcnNcclxuICAgICdNYXRveWEgTml4aWUgU3B1dHRlcic6ICc1OTkzJywgLy8gTml4aWUgc3ByZWFkIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTXRHdWxnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdHdWxnIEltbW9sYXRpb24nOiAnNDFBQScsXHJcbiAgICAnR3VsZyBUYWlsIFNtYXNoJzogJzQxQUInLFxyXG4gICAgJ0d1bGcgSGVhdmVuc2xhc2gnOiAnNDFBOScsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMSc6ICczRDAwJyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAyJzogJzNEMDEnLFxyXG4gICAgJ0d1bGcgSHVycmljYW5lIFdpbmcnOiAnM0QwMycsXHJcbiAgICAnR3VsZyBFYXJ0aCBTaGFrZXInOiAnMzdGNScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWNhdGlvbic6ICc0MUFFJyxcclxuICAgICdHdWxnIEV4ZWdlc2lzJzogJzNEMDcnLFxyXG4gICAgJ0d1bGcgUGVyZmVjdCBDb250cml0aW9uJzogJzNEMEUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmllZCBBZXJvJzogJzQxQUQnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMSc6ICczRDE2JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDInOiAnM0QxOCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAzJzogJzQ2NjknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNCc6ICczRDE5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDUnOiAnM0QyMScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMSc6ICczRDFBJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAyJzogJzNEMUInLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDMnOiAnM0QyMCcsXHJcbiAgICAnR3VsZyBWZW5hIEFtb3Jpcyc6ICczRDI3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdHdWxnIEx1bWVuIEluZmluaXR1bSc6ICc0MUIyJyxcclxuICAgICdHdWxnIFJpZ2h0IFBhbG0nOiAnMzdGOCcsXHJcbiAgICAnR3VsZyBMZWZ0IFBhbG0nOiAnMzdGQScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFdoYXQgdG8gZG8gYWJvdXQgS2FobiBSYWkgNUI1MD9cclxuLy8gSXQgc2VlbXMgaW1wb3NzaWJsZSBmb3IgdGhlIG1hcmtlZCBwZXJzb24gdG8gYXZvaWQgZW50aXJlbHkuXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuUGFnbHRoYW4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1BhZ2x0aGFuIFRlbG92b3VpdnJlIFBsYWd1ZSBTd2lwZSc6ICc2MEZDJywgLy8gZnJvbnRhbCBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMZXNzZXIgVGVsb2RyYWdvbiBFbmd1bGZpbmcgRmxhbWVzJzogJzYwRjUnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgTGlnaHRuaW5nIEJvbHQnOiAnNUM0QycsIC8vIGNpcmN1bGFyIGxpZ2h0bmluZyBhb2UgKG9uIHNlbGYgb3IgcG9zdClcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MicsIC8vIHB1bHNpbmcgc21hbGwgY2lyY3VsYXIgYW9lc1xyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgU3VwZXJjaGFyZ2VkIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MycsIC8vIHB1bHNpbmcgbGFyZ2UgY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBXaWRlIEJsYXN0ZXInOiAnNjBDNScsIC8vIHJlYXIgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2Jyb2JpbnlhayBGYWxsIE9mIE1hbic6ICc2MTQ4JywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb3RlayBSZWFwZXIgTWFnaXRlayBDYW5ub24nOiAnNjEyMScsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gU2hlZXQgb2YgSWNlJzogJzYwRjgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIEZyb3N0IEJyZWF0aCc6ICc2MEY3JywgLy8gdmVyeSBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgU3RhYmxlIENhbm5vbic6ICc1Qzk0JywgLy8gbGFyZ2UgbGluZSBhb2VzXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBDb3JlIDItVG9uemUgTWFnaXRlayBNaXNzaWxlJzogJzVDOTUnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFNreSBBcm1vciBBZXRoZXJzaG90JzogJzVDOUMnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBNYXJrIElJIFRlbG90ZWsgQ29sb3NzdXMgRXhoYXVzdCc6ICc1Qzk5JywgLy8gbGFyZ2UgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIE1pc3NpbGUgRXhwbG9zaXZlIEZvcmNlJzogJzVDOTgnLCAvLyBzbG93IG1vdmluZyBob3Jpem9udGFsIG1pc3NpbGVzXHJcbiAgICAnUGFnbHRoYW4gVGlhbWF0IEZsYW1pc3BoZXJlJzogJzYxMEYnLCAvLyB2ZXJ5IGxvbmcgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBBcm1vcmVkIFRlbG9kcmFnb24gVG9ydG9pc2UgU3RvbXAnOiAnNjE0QicsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZSBmcm9tIHR1cnRsZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gVGh1bmRlcm91cyBCcmVhdGgnOiAnNjE0OScsIC8vIGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBVcGJ1cnN0JzogJzYwNUInLCAvLyBzbWFsbCBhb2VzIGJlZm9yZSBCaWcgQnVyc3RcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIE5haWwgQmlnIEJ1cnN0JzogJzVCNDgnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VzIGZyb20gbmFpbHNcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IFBlcmlnZWFuIEJyZWF0aCc6ICc1QjU5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RScsIC8vIG1lZ2FmbGFyZSBwZXBwZXJvbmlcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSBEaXZlJzogJzVCNTInLCAvLyBtZWdhZmxhcmUgbGluZSBhb2UgYWNyb3NzIHRoZSBhcmVuYVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgRmxhcmUnOiAnNUI0QScsIC8vIGxhcmdlIHB1cnBsZSBzaHJpbmtpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RCcsIC8vIG1lZ2FmbGFyZSBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUWl0YW5hUmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBTdW4gVG9zcyc6ICczQzhBJywgLy8gR3JvdW5kIEFvRSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDEnOiAnM0M4QycsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAxJzogJzNDOEYnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDInOiAnM0M5MCcsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIFJvY2snOiAnM0M5NicsIC8vIFNtYWxsIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgQm91bGRlcic6ICczQzk3JywgLy8gTGFyZ2UgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVG93ZXJmYWxsJzogJzNDOTgnLCAvLyBQaWxsYXIgY29sbGFwc2UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAyJzogJzNDOUUnLCAvLyBTdGF0aW9uYXJ5IHBvaXNvbiBwdWRkbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMSc6ICczQ0EyJywgLy8gRGFuZ2Vyb3VzIG1pZGRsZSBkdXJpbmcgc3ByZWFkIGNpcmNsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAzJzogJzNDQTYnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDQnOiAnM0NBNycsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAyJzogJzNENkQnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBXcmF0aCBvZiB0aGUgUm9ua2EnOiAnM0UyQycsIC8vIFN0YXR1ZSBsaW5lIGF0dGFjayBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnUWl0YW5hIFNpbnNwaXR0ZXInOiAnM0UzNicsIC8vIEdvcmlsbGEgYm91bGRlciB0b3NzIEFvRSBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ1FpdGFuYSBIb3VuZCBvdXQgb2YgSGVhdmVuJzogJzQyQjgnLCAvLyBUZXRoZXIgZXh0ZW5zaW9uIGZhaWx1cmUsIGJvc3MgdGhyZWU7IDQyQjcgaXMgY29ycmVjdCBleGVjdXRpb25cclxuICAgICdRaXRhbmEgUm9ua2FuIEFieXNzJzogJzQzRUInLCAvLyBHcm91bmQgQW9FIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMSc6ICczQzlEJywgLy8gQW9FIGZyb20gdGhlIDAwQUIgcG9pc29uIGhlYWQgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMic6ICczQ0EzJywgLy8gT3ZlcmxhcHBlZCBjaXJjbGVzIGZhaWx1cmUgb24gdGhlIHNwcmVhZCBjaXJjbGVzIHZlcnNpb24gb2YgdGhlIG1lY2hhbmljXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRoZSBHcmFuZCBDb3Ntb3NcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyYW5kQ29zbW9zLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3Ntb3MgSXJvbiBKdXN0aWNlJzogJzQ5MUYnLFxyXG4gICAgJ0Nvc21vcyBTbWl0ZSBPZiBSYWdlJzogJzQ5MjEnLFxyXG5cclxuICAgICdDb3Ntb3MgVHJpYnVsYXRpb24nOiAnNDlBNCcsXHJcbiAgICAnQ29zbW9zIERhcmsgU2hvY2snOiAnNDc2RicsXHJcbiAgICAnQ29zbW9zIFN3ZWVwJzogJzQ3NzAnLFxyXG4gICAgJ0Nvc21vcyBEZWVwIENsZWFuJzogJzQ3NzEnLFxyXG5cclxuICAgICdDb3Ntb3MgU2hhZG93IEJ1cnN0JzogJzQ5MjQnLFxyXG4gICAgJ0Nvc21vcyBCbG9vZHkgQ2FyZXNzJzogJzQ5MjcnLFxyXG4gICAgJ0Nvc21vcyBOZXBlbnRoaWMgUGx1bmdlJzogJzQ5MjgnLFxyXG4gICAgJ0Nvc21vcyBCcmV3aW5nIFN0b3JtJzogJzQ5MjknLFxyXG5cclxuICAgICdDb3Ntb3MgT2RlIFRvIEZhbGxlbiBQZXRhbHMnOiAnNDk1MCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIEdyb3VuZCc6ICc0MjczJyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmUgQnJlYXRoJzogJzQ5MkInLFxyXG4gICAgJ0Nvc21vcyBSb25rYW4gRnJlZXplJzogJzQ5MkUnLFxyXG4gICAgJ0Nvc21vcyBPdmVycG93ZXInOiAnNDkyRCcsXHJcblxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgTGVmdCc6ICc0NzYzJyxcclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIFJpZ2h0JzogJzQ3NjInLFxyXG4gICAgJ0Nvc21vcyBPdGhlcndvcmRseSBIZWF0JzogJzQ3NUMnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBJcmUnOiAnNDc2MScsXHJcbiAgICAnQ29zbW9zIFBsdW1tZXQnOiAnNDc2NycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4gVGV0aGVyJzogJzQ3NUYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29zbW9zIERhcmsgV2VsbCc6ICc0NzZEJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgU3ByZWFkJzogJzQ3MjQnLFxyXG4gICAgJ0Nvc21vcyBCbGFjayBGbGFtZSc6ICc0NzVEJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluJzogJzQ3NjAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVHdpbm5pbmcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1R3aW5uaW5nIEF1dG8gQ2Fubm9ucyc6ICc0M0E5JyxcclxuICAgICdUd2lubmluZyBIZWF2ZSc6ICczREI5JyxcclxuICAgICdUd2lubmluZyAzMiBUb256ZSBTd2lwZSc6ICczREJCJyxcclxuICAgICdUd2lubmluZyBTaWRlc3dpcGUnOiAnM0RCRicsXHJcbiAgICAnVHdpbm5pbmcgV2luZCBTcG91dCc6ICczREJFJyxcclxuICAgICdUd2lubmluZyBTaG9jayc6ICczREYxJyxcclxuICAgICdUd2lubmluZyBMYXNlcmJsYWRlJzogJzNERUMnLFxyXG4gICAgJ1R3aW5uaW5nIFZvcnBhbCBCbGFkZSc6ICczREMyJyxcclxuICAgICdUd2lubmluZyBUaHJvd24gRmxhbWVzJzogJzNEQzMnLFxyXG4gICAgJ1R3aW5uaW5nIE1hZ2l0ZWsgUmF5JzogJzNERjMnLFxyXG4gICAgJ1R3aW5uaW5nIEhpZ2ggR3Jhdml0eSc6ICczREZBJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUd2lubmluZyAxMjggVG9uemUgU3dpcGUnOiAnM0RCQScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogRGVhZCBJcm9uIDVBQjAgKGVhcnRoc2hha2VycywgYnV0IG9ubHkgaWYgeW91IHRha2UgdHdvPylcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjeSBGb3VyZm9sZCc6ICc1QjM0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBQjQnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjI4JywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFBNCcsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFBNScsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFBNicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQTcnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFBOCcsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUE5JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFBRScsIC8vIENoYWluIGRhbWFnZVxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFBQicsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJsb29tcyc6ICc1QUFEJywgLy8gUHVycGxlIGdyb3dpbmcgY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaWdodC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MScsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSc6ICc1NzY1JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzVBJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtIERhaHUgSGVhZCBEb3duJzogJzU3NTYnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NTcnLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBGYWxsaW5nIFJvY2snOiAnNTc1QycsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc2NCcsIC8vIGRvdWJsZSBjaGFyZ2VcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpcHBlciBDbGF3JzogJzU3NUQnLCAvLyBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgVGFpbCBTd2luZyc6ICc1NzVGJywgLy8gdGFpbCBzd2luZyA7KVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFBhd24gT2ZmJzogJzU4MDYnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1ODBEJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAyJzogJzU4MEUnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDMnOiAnNTgwRicsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU3RjMnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU3RjInLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgQ291bnRlcnBsYXknOiAnNTdGNicsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdBOScsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2UgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QUEnLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEnOiAnNTdBNScsIC8vIHBoYW50b20gbGluZSBhb2UgZnJvbSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFZpbGUgV2F2ZSc6ICc1N0IxJywgLy8gcGhhbnRvbSBjb25hbCBhb2VcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTczJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk3MicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NzEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTY4JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTc0JywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAxJzogJzU5QkInLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMic6ICc1OUJEJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAxJzogJzU5QkEnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMic6ICc1OUJDJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBOb3J0aHN3YWluXFwncyBHbG93JzogJzU5QzQnLCAvLyBleHBhbmRpbmcgbGluZXMgd2l0aCBleHBsb3Npb24gaW50ZXJzZWN0aW9uc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlCRicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1OUUwJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMic6ICc1OUUxJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1OUUyJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBQYXduIE9mZic6ICc1OURBJywgLy8gU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2UgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1OUNFJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlciBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTlDQycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXQgZHVyaW5nIFF1ZWVuXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNUE2RScsIC8vIGV4cGxvc2lvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgUG9pc29uIFRyYXAnOiAnNUE2RicsIC8vIHBvaXNvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEhlYXQgU2hvY2snOiAnNTk1RScsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBDb2xkIFNob2NrJzogJzU5NUYnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBNb29uJzogJzI2MicsIC8vIFwiUGV0cmlmaWNhdGlvblwiIGZyb20gQWV0aGVyaWFsIE9yYiBsb29rYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWF0IEJyZWF0aCc6ICc1NzY2JywgLy8gdGFuayBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgV3JhdGggT2YgQm96amEnOiAnNTk3NScsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBdCBsZWFzdCBkdXJpbmcgVGhlIFF1ZWVuLCB0aGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSxcclxuICAgICAgLy8gYW5kIHRoZSBmaXJzdCBleHBsb3Npb24gXCJoaXRzXCIgZXZlcnlvbmUsIGFsdGhvdWdoIHdpdGggXCIxQlwiIGZsYWdzLlxyXG4gICAgICBpZDogJ0RlbHVicnVtIExvdHMgQ2FzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NjVBJywgJzU2NUInLCAnNTdGRCcsICc1N0ZFJywgJzVCODYnLCAnNUI4NycsICc1OUQyJywgJzVEOTMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogRGFodSA1Nzc2IFNwaXQgRmxhbWUgc2hvdWxkIGFsd2F5cyBoaXQgYSBNYXJjaG9zaWFzXHJcbi8vIFRPRE86IGhpdHRpbmcgcGhhbnRvbSB3aXRoIGljZSBzcGlrZXMgd2l0aCBhbnl0aGluZyBidXQgZGlzcGVsP1xyXG4vLyBUT0RPOiBmYWlsaW5nIGljeS9maWVyeSBwb3J0ZW50IChndWFyZCBhbmQgcXVlZW4pXHJcbi8vICAgICAgIGAxODpQeXJldGljIERvVCBUaWNrIG9uICR7bmFtZX0gZm9yICR7ZGFtYWdlfSBkYW1hZ2UuYFxyXG4vLyBUT0RPOiBXaW5kcyBPZiBGYXRlIC8gV2VpZ2h0IE9mIEZvcnR1bmU/XHJcbi8vIFRPRE86IFR1cnJldCdzIFRvdXI/XHJcbi8vIGdlbmVyYWwgdHJhcHM6IGV4cGxvc2lvbjogNUE3MSwgcG9pc29uIHRyYXA6IDVBNzIsIG1pbmk6IDVBNzNcclxuLy8gZHVlbCB0cmFwczogbWluaTogNTdBMSwgaWNlOiA1NzlGLCB0b2FkOiA1N0EwXHJcbi8vIFRPRE86IHRha2luZyBtYW5hIGZsYW1lIHdpdGhvdXQgcmVmbGVjdFxyXG4vLyBUT0RPOiB0YWtpbmcgTWFlbHN0cm9tJ3MgQm9sdCB3aXRob3V0IGxpZ2h0bmluZyBidWZmXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2xpbWVzIEhlbGxpc2ggU2xhc2gnOiAnNTdFQScsIC8vIEJvemphbiBTb2xkaWVyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgVmlzY291cyBSdXB0dXJlJzogJzUwMTYnLCAvLyBGdWxseSBtZXJnZWQgdmlzY291cyBzbGltZSBhb2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEdvbGVtcyBEZW1vbGlzaCc6ICc1ODgwJywgLy8gaW50ZXJydXB0aWJsZSBSdWlucyBHb2xlbSBjYXN0XHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUQxJywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyQScsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQ0InLCAvLyBDaGFpbnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMSc6ICc1Qjk0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDInOiAnNUFCOScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAzJzogJzVBQkEnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNCc6ICc1QUJCJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDUnOiAnNUFCQycsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFDOCcsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQ29tZXQnOiAnNUFENycsIC8vIENsb25lIG1ldGVvciBkcm9wcGluZyBiZWZvcmUgY2hhcmdlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIEZpcmVzdG9ybSc6ICc1QUQ4JywgLy8gQ2xvbmUgY2hhcmdlIGFmdGVyIEJhbGVmdWwgQ29tZXRcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBSb3NlJzogJzVBRDknLCAvLyBDbG9uZSBsaW5lIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFDMScsIC8vIEJsdWUgcmluIGcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQzInLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQzMnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUM0JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQzUnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFDNicsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEFjdCBPZiBNZXJjeSc6ICc1QUNGJywgLy8gY3Jvc3Mtc2hhcGVkIGxpbmUgYW9lc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAxJzogJzU3NzAnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzInLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc2RicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzEnLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUnOiAnNTc3NCcsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc2QycsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhlYWQgRG93bic6ICc1NzY4JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzY5JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmFsbGluZyBSb2NrJzogJzU3NkUnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBIb3QgQ2hhcmdlJzogJzU3NzMnLCAvLyBkb3VibGUgY2hhcmdlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNTc5RScsIC8vIGJvbWJzIGJlaW5nIGNsZWFyZWRcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIFZpY2lvdXMgU3dpcGUnOiAnNTc5NycsIC8vIGNpcmN1bGFyIGFvZSBhcm91bmQgYm9zc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMSc6ICc1NzhGJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZvY3VzZWQgVHJlbW9yIDInOiAnNTc5MScsIC8vIHNxdWFyZSBmbG9vciBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBEZXZvdXInOiAnNTc4OScsIC8vIGNvbmFsIGFvZSBhZnRlciB3aXRoZXJpbmcgY3Vyc2VcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZsYWlsaW5nIFN0cmlrZSAxJzogJzU3OEMnLCAvLyBpbml0aWFsIHJvdGF0aW5nIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDInOiAnNTc4RCcsIC8vIHJvdGF0aW5nIGNsZWF2ZXNcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNTgxOScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNTgxQScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTgxNicsIC8vIE9wdGltYWwgUGxheSBTd29yZCBcImdldCBvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTgxNycsIC8vIE9wdGltYWwgcGxheSBzaGllbGQgXCJnZXQgaW5cIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBDbGVhdmUnOiAnNTgxOCcsIC8vIE9wdGltYWwgUGxheSBjbGVhdmVzIGZvciBzd29yZC9zaGllbGRcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBVbmx1Y2t5IExvdCc6ICc1ODFEJywgLy8gUXVlZW4ncyBLbmlnaHQgb3JiIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIEJ1cm4gMSc6ICc1ODNEJywgLy8gc21hbGwgZmlyZSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAyJzogJzU4M0UnLCAvLyBsYXJnZSBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBQYXduIE9mZic6ICc1ODNBJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzU4NDcnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzU4NDgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzU4NDknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQ291bnRlcnBsYXknOiAnNThGNScsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QjgnLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0I5JywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDEnOiAnNTdCNCcsIC8vIEluaXRpYWwgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDInOiAnNTdCNScsIC8vIExhdGVyIHBoYW50b20gbGluZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMSc6ICc1N0I2JywgLy8gSW5pdGlhbCBwaGFudG9tIGNpcmNsZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMic6ICc1N0I3JywgLy8gTW92aW5nIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gVmlsZSBXYXZlJzogJzU3QkYnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTRDJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk0QicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NEEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTM5JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTREJywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFdoYWNrJzogJzU3RDAnLCAvLyBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMSc6ICc1N0M1JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBEZXZhc3RhdGluZyBCb2x0IDInOiAnNTdDNicsIC8vIGxpZ2h0bmluZyByaW5nc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRWxlY3Ryb2N1dGlvbic6ICc1N0NDJywgLy8gcmFuZG9tIGNpcmNsZSBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBSYXBpZCBCb2x0cyc6ICc1N0MzJywgLy8gZHJvcHBlZCBsaWdodG5pbmcgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgMTExMS1Ub256ZSBTd2luZyc6ICc1N0Q4JywgLy8gdmVyeSBsYXJnZSBcImdldCBvdXRcIiBzd2luZ1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgTW9uayBBdHRhY2snOiAnNTVBNicsIC8vIE1vbmsgYWRkIGF1dG8tYXR0YWNrXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlGNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlFNycsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5RUEnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDEnOiAnNTlFOCcsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIEVuZCAyJzogJzU5RTknLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgT2ZmZW5zaXZlIFN3b3JkJzogJzVBMDInLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU2hpZWxkJzogJzVBMDMnLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCAxJzogJzU5RjInLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDInOiAnNUI4NScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDEnOiAnNTlGMScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCAyJzogJzVCODQnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUGF3biBPZmYnOiAnNUExRCcsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUZGJywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1QTAwJywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1QTAxJywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMSc6ICc1QTI4JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMic6ICc1QTJBJywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMlxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMyc6ICc1QTI5JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIHNlY29uZCBsaW5lc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBIZWF0IFNob2NrJzogJzU5MjcnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTI4JywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlFQicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBHdW5uaGlsZHJcXCdzIEJsYWRlcyc6ICc1QjIyJywgLy8gbm90IGJlaW5nIGluIHRoZSBjaGVzcyBibHVlIHNhZmUgc3F1YXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVW5sdWNreSBMb3QnOiAnNTVCNicsIC8vIGxpZ2h0bmluZyBvcmIgYXR0YWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSBhbmQgXCJoaXRcIiBwZW9wbGUgd2hlbiBsZXZpdGF0aW5nLlxyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IEd1YXJkIExvdHMgQ2FzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1ODI3JywgJzU4MjgnLCAnNUI2QycsICc1QjZEJywgJzVCQjYnLCAnNUJCNycsICc1Qjg4JywgJzVCODknXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR29sZW0gQ29tcGFjdGlvbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTc0NicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IFNsaW1lIFNhbmd1aW5lIEZ1c2lvbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTU0RCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMU4gRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRFRCcsXHJcbiAgICAnRTFOIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEVDJyxcclxuICAgICdFMU4gUHVyZSBCZWFtJzogJzNEOUUnLFxyXG4gICAgJ0UxTiBQYXJhZGlzZSBMb3N0JzogJzNEQTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBGbGFyZSc6ICczRDk3JyxcclxuICAgICdFMU4gUHVyZSBMaWdodCc6ICczREEzJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxTiBGaXJlIElJSSc6ICc0NEVCJyxcclxuICAgICdFMU4gVmljZSBPZiBWYW5pdHknOiAnNDRFNycsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFOIFZpY2UgT2YgQXBhdGh5JzogJzQ0RTgnLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGludGVycnVwdCBNYW5hIEJvb3N0ICgzRDhEKVxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIHBhc3MgaGVhbGVyIGRlYnVmZj9cclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBkb24ndCBraWxsIGEgbWV0ZW9yIGR1cmluZyBmb3VyIG9yYnM/XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVSZXN1cnJlY3Rpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBUaHVuZGVyIElJSSc6ICc0NEY3JyxcclxuICAgICdFMVMgRWRlblxcJ3MgQmxpenphcmQgSUlJJzogJzQ0RjYnLFxyXG4gICAgJ0UxUyBFZGVuXFwncyBSZWdhaW5lZCBCbGl6emFyZCBJSUknOiAnNDRGQScsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDEnOiAnM0Q4MycsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDInOiAnM0Q4NCcsXHJcbiAgICAnRTFTIFBhcmFkaXNlIExvc3QnOiAnM0Q4NycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTFTIEVkZW5cXCdzIEZsYXJlJzogJzNENzMnLFxyXG4gICAgJ0UxUyBQdXJlIExpZ2h0JzogJzNEOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTFTIEZpcmUvVGh1bmRlciBJSUknOiAnNDRGQicsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBTaW5nbGUnOiAnM0Q4MScsXHJcbiAgICAnRTFTIFZpY2UgT2YgVmFuaXR5JzogJzQ0RjEnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxUyBWaWNlIG9mIEFwYXRoeSc6ICc0NEYyJywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZSAodG9wIGxpbmUgZmFpbCwgYm90dG9tIGxpbmUgc3VjY2VzcywgZWZmZWN0IHRoZXJlIHRvbylcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDYxMjM0NTpUaW5pIFBvdXRpbmk6RjoxMDAwMDoxMDAxOTBGOlxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjc4OTBBOlBvdGF0byBDaGlwcHk6MTowOjFDOjgwMDA6XHJcbi8vIGdhaW5zIHRoZSBlZmZlY3Qgb2YgUGV0cmlmaWNhdGlvbiBmcm9tIFZvaWR3YWxrZXIgZm9yIDEwLjAwIFNlY29uZHMuXHJcbi8vIFRPRE86IHB1ZGRsZSBmYWlsdXJlP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZURlc2NlbnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UyTiBEb29tdm9pZCBTbGljZXInOiAnM0UzQycsXHJcbiAgICAnRTJOIERvb212b2lkIEd1aWxsb3RpbmUnOiAnM0UzQicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyTiBOeXgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICczRTNEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0Jvb3BlZCcsXHJcbiAgICAgICAgICAgIGRlOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGZyOiAnTWFsdXMgZGUgZMOpZ8OidHMnLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogJ+uLieyKpCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlXHJcbi8vIFRPRE86IEVtcHR5IEhhdGUgKDNFNTkvM0U1QSkgaGl0cyBldmVyeWJvZHksIHNvIGhhcmQgdG8gdGVsbCBhYm91dCBrbm9ja2JhY2tcclxuLy8gVE9ETzogbWF5YmUgbWFyayBoZWxsIHdpbmQgcGVvcGxlIHdobyBnb3QgY2xpcHBlZCBieSBzdGFjaz9cclxuLy8gVE9ETzogbWlzc2luZyBwdWRkbGVzP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGxpZ2h0L2RhcmsgY2lyY2xlIHN0YWNrXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIFNsaWNlcic6ICczRTUwJyxcclxuICAgICdFM1MgRW1wdHkgUmFnZSc6ICczRTZDJyxcclxuICAgICdFM1MgRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UyUyBEb29tdm9pZCBDbGVhdmVyJzogJzNFNjQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgU2hhZG93ZXllJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU3RvbmUgQ3Vyc2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU4OScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgTnl4JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0U1MScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZUludW5kYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMSc6ICczRkNBJyxcclxuICAgICdFM04gTW9uc3RlciBXYXZlIDInOiAnM0ZFOScsXHJcbiAgICAnRTNOIE1hZWxzdHJvbSc6ICczRkQ5JyxcclxuICAgICdFM04gU3dpcmxpbmcgVHN1bmFtaSc6ICczRkQ1JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFM04gVGVtcG9yYXJ5IEN1cnJlbnQgMSc6ICczRkNFJyxcclxuICAgICdFM04gVGVtcG9yYXJ5IEN1cnJlbnQgMic6ICczRkNEJyxcclxuICAgICdFM04gU3Bpbm5pbmcgRGl2ZSc6ICczRkRCJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UzTiBSaXAgQ3VycmVudCc6ICczRkM3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogU2NvdXJpbmcgVHN1bmFtaSAoM0NFMCkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXRcclxuLy8gVE9ETzogU3dlZXBpbmcgVHN1bmFtaSAoM0ZGNSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YW5rc1xyXG4vLyBUT0RPOiBSaXAgQ3VycmVudCAoM0ZFMCwgM0ZFMSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXQvdGFua3NcclxuLy8gVE9ETzogQm9pbGVkIEFsaXZlICg0MDA2KSBpcyBmYWlsaW5nIHB1ZGRsZXM/Pz9cclxuLy8gVE9ETzogZmFpbGluZyB0byBjbGVhbnNlIFNwbGFzaGluZyBXYXRlcnNcclxuLy8gVE9ETzogZG9lcyBnZXR0aW5nIGhpdCBieSB1bmRlcnNlYSBxdWFrZSBjYXVzZSBhbiBhYmlsaXR5P1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAxJzogJzNGRTUnLFxyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM1MgTWFlbHN0cm9tJzogJzNGRkInLFxyXG4gICAgJ0UzUyBTd2lybGluZyBUc3VuYW1pJzogJzNGRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGRUEnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGRUInLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAzJzogJzNGRUMnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCA0JzogJzNGRUQnLFxyXG4gICAgJ0UzUyBTcGlubmluZyBEaXZlJzogJzNGRkQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNE4gV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQwRUInLFxyXG4gICAgJ0U0TiBFdmlsIEVhcnRoJzogJzQwRUYnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDEnOiAnNDFCNCcsXHJcbiAgICAnRTROIEFmdGVyc2hvY2sgMic6ICc0MEYwJyxcclxuICAgICdFNE4gRXhwbG9zaW9uIDEnOiAnNDBFRCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAyJzogJzQwRjUnLFxyXG4gICAgJ0U0TiBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTROIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDEwMCcsXHJcbiAgICAnRTROIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MEZGJyxcclxuICAgICdFNE4gTWFzc2l2ZSBMYW5kc2xpZGUnOiAnNDBGQycsXHJcbiAgICAnRTROIFNlaXNtaWMgV2F2ZSc6ICc0MEYzJyxcclxuICAgICdFNE4gRmF1bHQgTGluZSc6ICc0MTAxJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBwZW9wbGUgZ2V0IGhpdHRpbmcgYnkgbWFya2VycyB0aGV5IHNob3VsZG4ndFxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFua3MgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlcnMsIG1lZ2FsaXRoc1xyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFyZ2V0IGdldHRpbmcgaGl0IGJ5IHRhbmtidXN0ZXJcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTRTIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MTA4JyxcclxuICAgICdFNFMgRXZpbCBFYXJ0aCc6ICc0MTBDJyxcclxuICAgICdFNFMgQWZ0ZXJzaG9jayAxJzogJzQxQjUnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDInOiAnNDEwRCcsXHJcbiAgICAnRTRTIEV4cGxvc2lvbic6ICc0MTBBJyxcclxuICAgICdFNFMgTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0UyBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMUQnLFxyXG4gICAgJ0U0UyBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDExQycsXHJcbiAgICAnRTRTIE1hc3NpdmUgTGFuZHNsaWRlIDEnOiAnNDExOCcsXHJcbiAgICAnRTRTIE1hc3NpdmUgTGFuZHNsaWRlIDInOiAnNDExOScsXHJcbiAgICAnRTRTIFNlaXNtaWMgV2F2ZSc6ICc0MTEwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDEnOiAnNDEzNScsXHJcbiAgICAnRTRTIER1YWwgRWFydGhlbiBGaXN0cyAyJzogJzQ2ODcnLFxyXG4gICAgJ0U0UyBQbGF0ZSBGcmFjdHVyZSc6ICc0M0VBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDEnOiAnNDNDQScsXHJcbiAgICAnRTRTIEVhcnRoZW4gRmlzdCAyJzogJzQzQzknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZSBDb2xsZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfjgr/jgqTjgr/jg7MnIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn5rOw5Z2mJyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+2DgOydtO2DhCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZhdWx0TGluZVRhcmdldCA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0MTFFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmZhdWx0TGluZVRhcmdldCAhPT0gbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUnVuIE92ZXInLFxyXG4gICAgICAgICAgICBkZTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgw6ljcmFzw6koZSknLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1TiBJbXBhY3QnOiAnNEUzQScsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVOIExpZ2h0bmluZyBCb2x0JzogJzRCOUMnLCAvLyBTdG9ybWNsb3VkIHN0YW5kYXJkIGF0dGFja1xyXG4gICAgJ0U1TiBHYWxsb3AnOiAnNEI5NycsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNU4gU2hvY2sgU3RyaWtlJzogJzRCQTEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVOIFZvbHQgU3RyaWtlJzogJzRDRjInLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVOIEp1ZGdtZW50IEpvbHQnOiAnNEI4RicsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIGEgcGxheWVyIGdldHMgNCsgc3RhY2tzIG9mIG9yYnMuIERvbid0IGJlIGdyZWVkeSFcclxuICAgICAgaWQ6ICdFNU4gU3RhdGljIENvbmRlbnNhdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEhlbHBlciBmb3Igb3JiIHBpY2t1cCBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0U1TiBPcmIgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gT3JiIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChubyBvcmIpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGtlaW4gT3JiKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChwYXMgZCdvcmJlKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fnjonnhKHjgZcpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOayoeWQg+eQgylgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBUYXJnZXQgVHJhY2tpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzID0gZGF0YS5jbG91ZE1hcmtlcnMgfHwgW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVOIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QjlEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDMwLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgbSBvZiBkYXRhLmNsb3VkTWFya2Vycykge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogZGF0YS5jbG91ZE1hcmtlcnNbbV0sXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoY2xvdWRzIHRvbyBjbG9zZSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChXb2xrZW4genUgbmFoZSlgLFxyXG4gICAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChudWFnZXMgdHJvcCBwcm9jaGVzKWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbsui/keOBmeOBjilgLFxyXG4gICAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fkupHph43lj6ApYCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBjbGVhbnVwJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBpcyB0aGVyZSBhIGRpZmZlcmVudCBhYmlsaXR5IGlmIHRoZSBzaGllbGQgZHV0eSBhY3Rpb24gaXNuJ3QgdXNlZCBwcm9wZXJseT9cclxuLy8gVE9ETzogaXMgdGhlcmUgYW4gYWJpbGl0eSBmcm9tIFJhaWRlbiAodGhlIGJpcmQpIGlmIHlvdSBnZXQgZWF0ZW4/XHJcbi8vIFRPRE86IG1heWJlIGNoYWluIGxpZ2h0bmluZyB3YXJuaW5nIGlmIHlvdSBnZXQgaGl0IHdoaWxlIHlvdSBoYXZlIHN5c3RlbSBzaG9jayAoOEI4KVxyXG5cclxuY29uc3Qgbm9PcmIgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBvcmIpJyxcclxuICAgIGRlOiBzdHIgKyAnIChrZWluIE9yYiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkXFwnb3JiZSknLFxyXG4gICAgamE6IHN0ciArICcgKOmbt+eOieeEoeOBlyknLFxyXG4gICAgY246IHN0ciArICcgKOayoeWQg+eQgyknLFxyXG4gICAga286IHN0ciArICcgKOq1rOyKrCDsl4bsnYwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VGdWxtaW5hdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTVTIEltcGFjdCc6ICc0RTNCJywgLy8gU3RyYXRvc3BlYXIgbGFuZGluZyBBb0VcclxuICAgICdFNVMgR2FsbG9wJzogJzRCQjQnLCAvLyBTaWRld2F5cyBhZGQgY2hhcmdlXHJcbiAgICAnRTVTIFNob2NrIFN0cmlrZSc6ICc0QkMxJywgLy8gU21hbGwgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBUd2lzdGVyJzogJzRCQzcnLCAvLyBUd2lzdGVyIHN0ZXBwZWQgbGVhZGVyXHJcbiAgICAnRTVTIFN0ZXBwZWQgTGVhZGVyIERvbnV0JzogJzRCQzgnLCAvLyBEb251dCBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTaG9jayc6ICc0RTNEJywgLy8gSGF0ZWQgb2YgTGV2aW4gU3Rvcm1jbG91ZC1jbGVhbnNhYmxlIGV4cGxvZGluZyBkZWJ1ZmZcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNVMgSnVkZ21lbnQgSm9sdCc6ICc0QkE3JywgLy8gU3RyYXRvc3BlYXIgZXhwbG9zaW9uc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTVTIFZvbHQgU3RyaWtlIERvdWJsZSc6ICc0QkMzJywgLy8gTGFyZ2UgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gICAgJ0U1UyBDcmlwcGxpbmcgQmxvdyc6ICc0QkNBJyxcclxuICAgICdFNVMgQ2hhaW4gTGlnaHRuaW5nIERvdWJsZSc6ICc0QkM1JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEhlbHBlciBmb3Igb3JiIHBpY2t1cCBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0U1UyBPcmIgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPSBkYXRhLmhhc09yYiB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgT3JiIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgVm9sdCBTdHJpa2UgT3JiJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQzMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgRGVhZGx5IERpc2NoYXJnZSBCaWcgS25vY2tiYWNrJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgTGlnaHRuaW5nIEJvbHQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCOScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEhhdmluZyBhIG5vbi1pZGVtcG90ZW50IGNvbmRpdGlvbiBmdW5jdGlvbiBpcyBhIGJpdCA8XzxcclxuICAgICAgICAvLyBPbmx5IGNvbnNpZGVyIGxpZ2h0bmluZyBib2x0IGRhbWFnZSBpZiB5b3UgaGF2ZSBhIGRlYnVmZiB0byBjbGVhci5cclxuICAgICAgICBpZiAoIWRhdGEuaGF0ZWQgfHwgIWRhdGEuaGF0ZWRbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIEhhdGVkIG9mIExldmluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDBEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID0gZGF0YS5oYXRlZCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPSBkYXRhLmNsb3VkTWFya2VycyB8fCBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNVMgVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIGRhdGEuY2xvdWRNYXJrZXJzKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBkYXRhLmNsb3VkTWFya2Vyc1ttXSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChjbG91ZHMgdG9vIGNsb3NlKWAsXHJcbiAgICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKFdvbGtlbiB6dSBuYWhlKWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKG51YWdlcyB0cm9wIHByb2NoZXMpYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zuy6L+R44GZ44GOKWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+S6kemHjeWPoClgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgLy8gU3Rvcm1jbG91ZHMgcmVzb2x2ZSB3ZWxsIGJlZm9yZSB0aGlzLlxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNk4gVGhvcm5zJzogJzRCREEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMSc6ICc0QkREJyxcclxuICAgICdFNk4gRmVyb3N0b3JtIDInOiAnNEJFNScsXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QkUwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMic6ICc0QkU2JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2TiBFeHBsb3Npb24nOiAnNEJFMicsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2TiBIZWF0IEJ1cnN0JzogJzRCRUMnLFxyXG4gICAgJ0U2TiBDb25mbGFnIFN0cmlrZSc6ICc0QkVFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2TiBTcGlrZSBPZiBGbGFtZSc6ICc0QkYwJywgLy8gT3JiIGV4cGxvc2lvbnMgYWZ0ZXIgU3RyaWtlIFNwYXJrXHJcbiAgICAnRTZOIFJhZGlhbnQgUGx1bWUnOiAnNEJGMicsXHJcbiAgICAnRTZOIEVydXB0aW9uJzogJzRCRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2TiBWYWN1dW0gU2xpY2UnOiAnNEJENScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNk4gRG93bmJ1cnN0JzogJzRCREInLCAvLyBCbHVlIGtub2NrYmFjayBjaXJjbGUuIEFjdHVhbCBrbm9ja2JhY2sgaXMgdW5rbm93biBhYmlsaXR5IDRDMjBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gS2lsbHMgbm9uLXRhbmtzIHdobyBnZXQgaGl0IGJ5IGl0LlxyXG4gICAgJ0U2TiBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QkVEJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IFNpbXBsZU9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbi8vIFRPRE86IGNoZWNrIHRldGhlcnMgYmVpbmcgY3V0ICh3aGVuIHRoZXkgc2hvdWxkbid0KVxyXG4vLyBUT0RPOiBjaGVjayBmb3IgY29uY3Vzc2VkIGRlYnVmZlxyXG4vLyBUT0RPOiBjaGVjayBmb3IgdGFraW5nIHRhbmtidXN0ZXIgd2l0aCBsaWdodGhlYWRlZFxyXG4vLyBUT0RPOiBjaGVjayBmb3Igb25lIHBlcnNvbiB0YWtpbmcgbXVsdGlwbGUgU3Rvcm0gT2YgRnVyeSBUZXRoZXJzICg0QzAxLzRDMDgpXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBTaW1wbGVPb3BzeVRyaWdnZXJTZXQgPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIEl0J3MgY29tbW9uIHRvIGp1c3QgaWdub3JlIGZ1dGJvbCBtZWNoYW5pY3MsIHNvIGRvbid0IHdhcm4gb24gU3RyaWtlIFNwYXJrLlxyXG4gICAgLy8gJ1NwaWtlIE9mIEZsYW1lJzogJzRDMTMnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuXHJcbiAgICAnRTZTIFRob3Jucyc6ICc0QkZBJywgLy8gQW9FIG1hcmtlcnMgYWZ0ZXIgRW51bWVyYXRpb25cclxuICAgICdFNlMgRmVyb3N0b3JtIDEnOiAnNEJGRCcsXHJcbiAgICAnRTZTIEZlcm9zdG9ybSAyJzogJzRDMDYnLFxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDEnOiAnNEMwMCcsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLUdhcnVkYVxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDInOiAnNEMwNycsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLVJha3RhcGFrc2FcclxuICAgICdFNlMgRXhwbG9zaW9uJzogJzRDMDMnLCAvLyBBb0UgY2lyY2xlcywgR2FydWRhIG9yYnNcclxuICAgICdFNlMgSGVhdCBCdXJzdCc6ICc0QzFGJyxcclxuICAgICdFNlMgQ29uZmxhZyBTdHJpa2UnOiAnNEMxMCcsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0VcclxuICAgICdFNlMgUmFkaWFudCBQbHVtZSc6ICc0QzE1JyxcclxuICAgICdFNlMgRXJ1cHRpb24nOiAnNEMxNycsXHJcbiAgICAnRTZTIFdpbmQgQ3V0dGVyJzogJzRDMDInLCAvLyBUZXRoZXItY3V0dGluZyBsaW5lIGFvZVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2UyBWYWN1dW0gU2xpY2UnOiAnNEJGNScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNlMgRG93bmJ1cnN0IDEnOiAnNEJGQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoR2FydWRhKS5cclxuICAgICdFNlMgRG93bmJ1cnN0IDInOiAnNEJGQycsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoUmFrdGFwYWtzYSkuXHJcbiAgICAnRTZTIE1ldGVvciBTdHJpa2UnOiAnNEMwRicsIC8vIEZyb250YWwgYXZvaWRhYmxlIHRhbmsgYnVzdGVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFNlMgSGFuZHMgb2YgSGVsbCc6ICc0QzBbQkNdJywgLy8gVGV0aGVyIGNoYXJnZVxyXG4gICAgJ0U2UyBIYW5kcyBvZiBGbGFtZSc6ICc0QzBBJywgLy8gRmlyc3QgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QzBFJywgLy8gU2Vjb25kIFRhbmtidXN0ZXJcclxuICAgICdFNlMgQmxhemUnOiAnNEMxQicsIC8vIEZsYW1lIFRvcm5hZG8gQ2xlYXZlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0U2UyBBaXIgQnVtcCc6ICc0QkY5JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnICh3cm9uZyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoZmFsc2NoZXIgQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKG1hdXZhaXMgYnVmZiknLFxyXG4gICAgamE6IHN0ciArICcgKOS4jemBqeWIh+OBquODkOODlSknLFxyXG4gICAgY246IHN0ciArICcgKEJ1ZmbplJnkuoYpJyxcclxuICAgIGtvOiBzdHIgKyAnICjrsoTtlIQg7YuA66a8KScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IG5vQnVmZiA9IChzdHIpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKG5vIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChrZWluIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZGUgYnVmZiknLFxyXG4gICAgamE6IHN0ciArICcgKOODkOODleeEoeOBlyknLFxyXG4gICAgY246IHN0ciArICcgKOayoeaciUJ1ZmYpJyxcclxuICAgIGtvOiBzdHIgKyAnKOuyhO2UhCDsl4bsnYwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VJY29ub2NsYXNtLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFN04gU3R5Z2lhbiBTd29yZCc6ICc0QzU1JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0VzIGFmdGVyIEZhbHNlIFR3aWxpZ2h0XHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgRG9udXQnOiAnNEM0QycsIC8vIExhcmdlIGRvbnV0IGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICAgICdFN04gU3RyZW5ndGggSW4gTnVtYmVycyAyJzogJzRDNEQnLCAvLyBMYXJnZSBjaXJjbGUgZ3JvdW5kIEFvRXMsIGludGVybWlzc2lvblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3Rha2UnOiAnNEMzMycsIC8vIExhc2VyIHRhbmsgYnVzdGVyLCBvdXRzaWRlIGludGVybWlzc2lvbiBwaGFzZVxyXG4gICAgJ0U1TiBTaWx2ZXIgU2hvdCc6ICc0RTdEJywgLy8gU3ByZWFkIG1hcmtlcnMsIGludGVybWlzc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gQXN0cmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIFVtYnJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0UnLCAnNEM0MCcsICc0QzIyJywgJzRDM0MnLCAnNEU2MyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzVW1icmFsIHx8ICFkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzQXN0cmFsICYmIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gRGFya3NcXCdzIENvdXJzZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEMzRCcsICc0QzIzJywgJzRDNDEnLCAnNEM0MyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzVW1icmFsICYmIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIC8vIFRoaXMgY2FzZSBpcyBwcm9iYWJseSBpbXBvc3NpYmxlLCBhcyB0aGUgZGVidWZmIHRpY2tzIGFmdGVyIGRlYXRoLFxyXG4gICAgICAgIC8vIGJ1dCBsZWF2aW5nIGl0IGhlcmUgaW4gY2FzZSB0aGVyZSdzIHNvbWUgcmV6IG9yIGRpc2Nvbm5lY3QgdGltaW5nXHJcbiAgICAgICAgLy8gdGhhdCBjb3VsZCBsZWFkIHRvIHRoaXMuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIGFuIG9yYiBkdXJpbmcgdG9ybmFkbyBwaGFzZVxyXG4vLyBUT0RPOiBqdW1waW5nIGluIHRoZSB0b3JuYWRvIGRhbWFnZT8/XHJcbi8vIFRPRE86IHRha2luZyBzdW5ncmFjZSg0QzgwKSBvciBtb29uZ3JhY2UoNEM4Mikgd2l0aCB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogc3R5Z2lhbiBzcGVhci9zaWx2ZXIgc3BlYXIgd2l0aCB0aGUgd3JvbmcgZGVidWZmXHJcbi8vIFRPRE86IHRha2luZyBleHBsb3Npb24gZnJvbSB0aGUgd3JvbmcgQ2hpYXJvL1NjdXJvIG9yYlxyXG4vLyBUT0RPOiBoYW5kbGUgNEM4OSBTaWx2ZXIgU3Rha2UgdGFua2J1c3RlciAybmQgaGl0LCBhcyBpdCdzIG9rIHRvIGhhdmUgdHdvIGluLlxyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnICh3cm9uZyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoZmFsc2NoZXIgQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKG1hdXZhaXMgYnVmZiknLFxyXG4gICAgamE6IHN0ciArICcgKOS4jemBqeWIh+OBquODkOODlSknLFxyXG4gICAgY246IHN0ciArICcgKEJ1ZmbplJnkuoYpJyxcclxuICAgIGtvOiBzdHIgKyAnICjrsoTtlIQg7YuA66a8KScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IG5vQnVmZiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkZSBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo44OQ44OV54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5pyJQnVmZiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDsl4bsnYwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNBc3RyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzVW1icmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUljb25vY2xhc21TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U3UyBTaWx2ZXIgU3dvcmQnOiAnNEM4RScsIC8vIGdyb3VuZCBhb2VcclxuICAgICdFN1MgT3ZlcndoZWxtaW5nIEZvcmNlJzogJzRDNzMnLCAvLyBhZGQgcGhhc2UgZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDEnOiAnNEM3MCcsIC8vIGFkZCBnZXQgdW5kZXJcclxuICAgICdFN1MgU3RyZW5ndGggaW4gTnVtYmVycyAyJzogJzRDNzEnLCAvLyBhZGQgZ2V0IG91dFxyXG4gICAgJ0U3UyBQYXBlciBDdXQnOiAnNEM3RCcsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXNcclxuICAgICdFN1MgQnVmZmV0JzogJzRDNzcnLCAvLyB0b3JuYWRvIGdyb3VuZCBhb2VzIGFsc28/P1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U3UyBCZXR3aXh0IFdvcmxkcyc6ICc0QzZCJywgLy8gcHVycGxlIGdyb3VuZCBsaW5lIGFvZXNcclxuICAgICdFN1MgQ3J1c2FkZSc6ICc0QzU4JywgLy8gYmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChzdGFuZGluZyBpbiBpdClcclxuICAgICdFN1MgRXhwbG9zaW9uJzogJzRDNkYnLCAvLyBkaWRuJ3Qga2lsbCBhbiBhZGRcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3UyBTdHlnaWFuIFN0YWtlJzogJzRDMzQnLCAvLyBMYXNlciB0YW5rIGJ1c3RlciAxXHJcbiAgICAnRTdTIFNpbHZlciBTaG90JzogJzRDOTInLCAvLyBTcHJlYWQgbWFya2Vyc1xyXG4gICAgJ0U3UyBTaWx2ZXIgU2NvdXJnZSc6ICc0QzkzJywgLy8gSWNlIG1hcmtlcnNcclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAxJzogJzREMTQnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRTdTIENoaWFybyBTY3VybyBFeHBsb3Npb24gMic6ICc0RDE1JywgLy8gb3JiIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRTdTIEFkdmVudCBPZiBMaWdodCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEM2RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgYmxhbWUgY29ycmVjdD8gZG9lcyB0aGlzIGhhdmUgYSB0YXJnZXQ/XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2MicsICc0QzYzJywgJzRDNjQnLCAnNEM1QicsICc0QzVGJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDNjUnLCAnNEM2NicsICc0QzY3JywgJzRDNUEnLCAnNEM2MCddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzVW1icmFsICYmIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIC8vIFRoaXMgY2FzZSBpcyBwcm9iYWJseSBpbXBvc3NpYmxlLCBhcyB0aGUgZGVidWZmIHRpY2tzIGFmdGVyIGRlYXRoLFxyXG4gICAgICAgIC8vIGJ1dCBsZWF2aW5nIGl0IGhlcmUgaW4gY2FzZSB0aGVyZSdzIHNvbWUgcmV6IG9yIGRpc2Nvbm5lY3QgdGltaW5nXHJcbiAgICAgICAgLy8gdGhhdCBjb3VsZCBsZWFkIHRvIHRoaXMuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBDcnVzYWRlIEtub2NrYmFjaycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNEM3NiBpcyB0aGUga25vY2tiYWNrIGRhbWFnZSwgNEM1OCBpcyB0aGUgZGFtYWdlIGZvciBzdGFuZGluZyBvbiB0aGUgcHVjay5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRDNzYnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VSZWZ1bGdlbmNlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOE4gQml0aW5nIEZyb3N0JzogJzREREInLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBEcml2aW5nIEZyb3N0JzogJzREREMnLCAvLyBSZWFyIGNvbmUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBGcmlnaWQgU3RvbmUnOiAnNEU2NicsIC8vIFNtYWxsIHNwcmVhZCBjaXJjbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0RTAwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNEUwMScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBGcmlnaWQgRXJ1cHRpb24nOiAnNEUwOScsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBJY2ljbGUgSW1wYWN0JzogJzRFMEEnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gQXhlIEtpY2snOiAnNERFMicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIFNjeXRoZSBLaWNrJzogJzRERTMnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QnOiAnNERGRScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QnOiAnNERGRicsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBTaGluaW5nIEFybW9yJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBIZWF2ZW5seSBTdHJpa2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0REQ4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXN0b8OfZW4hJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gRnJvc3QgQXJtb3InLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAncnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgICAga286ICfrr7jrgYTrn6zsp5AhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogcnVzaCBoaXR0aW5nIHRoZSBjcnlzdGFsXHJcbi8vIFRPRE86IGFkZHMgbm90IGJlaW5nIGtpbGxlZFxyXG4vLyBUT0RPOiB0YWtpbmcgdGhlIHJ1c2ggdHdpY2UgKHdoZW4geW91IGhhdmUgZGVidWZmKVxyXG4vLyBUT0RPOiBub3QgaGl0dGluZyB0aGUgZHJhZ29uIGZvdXIgdGltZXMgZHVyaW5nIHd5cm0ncyBsYW1lbnRcclxuLy8gVE9ETzogZGVhdGggcmVhc29ucyBmb3Igbm90IHBpY2tpbmcgdXAgcHVkZGxlXHJcbi8vIFRPRE86IG5vdCBiZWluZyBpbiB0aGUgdG93ZXIgd2hlbiB5b3Ugc2hvdWxkXHJcbi8vIFRPRE86IHBpY2tpbmcgdXAgdG9vIG1hbnkgc3RhY2tzXHJcblxyXG4vLyBOb3RlOiBCYW5pc2ggSUlJICg0REE4KSBhbmQgQmFuaXNoIElpaSBEaXZpZGVkICg0REE5KSBib3RoIGFyZSB0eXBlPTB4MTYgbGluZXMuXHJcbi8vIFRoZSBzYW1lIGlzIHRydWUgZm9yIEJhbmlzaCAoNERBNikgYW5kIEJhbmlzaCBEaXZpZGVkICg0REE3KS5cclxuLy8gSSdtIG5vdCBzdXJlIHRoaXMgbWFrZXMgYW55IHNlbnNlPyBCdXQgY2FuJ3QgdGVsbCBpZiB0aGUgc3ByZWFkIHdhcyBhIG1pc3Rha2Ugb3Igbm90LlxyXG4vLyBNYXliZSB3ZSBjb3VsZCBjaGVjayBmb3IgXCJNYWdpYyBWdWxuZXJhYmlsaXR5IFVwXCI/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2VTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4UyBCaXRpbmcgRnJvc3QnOiAnNEQ2NicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIERyaXZpbmcgRnJvc3QnOiAnNEQ2NycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIEF4ZSBLaWNrJzogJzRENkQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBTY3l0aGUgS2ljayc6ICc0RDZFJywgLy8gRG9udXQgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQXhlIEtpY2snOiAnNERCOScsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIFNjeXRoZSBLaWNrJzogJzREQkEnLCAvLyBEb251dCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgRnJpZ2lkIEVydXB0aW9uJzogJzREOUYnLCAvLyBTbWFsbCBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgRnJpZ2lkIE5lZWRsZSc6ICc0RDlEJywgLy8gOC13YXkgXCJmbG93ZXJcIiBleHBsb3Npb25cclxuICAgICdFOFMgSWNpY2xlIEltcGFjdCc6ICc0REEwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMSc6ICc0REI3JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0IDInOiAnNERDMycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QgMSc6ICc0REI4JywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QgMic6ICc0REM0JywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDEnOiAnNEQ3NScsIC8vIExlZnQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDInOiAnNEQ3NicsIC8vIFJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAzJzogJzRENzcnLCAvLyBLbm9ja2JhY2sgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDEnOiAnNEQ5MCcsIC8vIFJlZmxlY3RlZCBsZWZ0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDInOiAnNERCQicsIC8vIFJlZmxlY3RlZCBsZWZ0IDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDMnOiAnNERDNycsIC8vIFJlZmxlY3RlZCByaWdodCAyXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyA0JzogJzREOTEnLCAvLyBSZWZsZWN0ZWQgcmlnaHQgMVxyXG4gICAgJ0U4UyBUd2luIFN0aWxsbmVzcyAxJzogJzRENjgnLFxyXG4gICAgJ0U4UyBUd2luIFN0aWxsbmVzcyAyJzogJzRENkInLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMSc6ICc0RDY5JyxcclxuICAgICdFOFMgVHdpbiBTaWxlbmNlIDInOiAnNEQ2QScsXHJcbiAgICAnRThTIEFraCBSaGFpJzogJzREOTknLFxyXG4gICAgJ0U4UyBFbWJpdHRlcmVkIERhbmNlIDEnOiAnNEQ3MCcsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMic6ICc0RDcxJyxcclxuICAgICdFOFMgU3BpdGVmdWwgRGFuY2UgMSc6ICc0RDZGJyxcclxuICAgICdFOFMgU3BpdGVmdWwgRGFuY2UgMic6ICc0RDcyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIEJyb2tlbiB0ZXRoZXIuXHJcbiAgICAnRThTIFJlZnVsZ2VudCBGYXRlJzogJzREQTQnLFxyXG4gICAgLy8gU2hhcmVkIG9yYiwgY29ycmVjdCBpcyBCcmlnaHQgUHVsc2UgKDREOTUpXHJcbiAgICAnRThTIEJsaW5kaW5nIFB1bHNlJzogJzREOTYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRThTIFBhdGggb2YgTGlnaHQnOiAnNERBMScsIC8vIFByb3RlYW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThTIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTdHVuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc5NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRThTIFN0b25lc2tpbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEQ4NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlOIFRoZSBBcnQgT2YgRGFya25lc3MgMSc6ICc1MjIzJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAyJzogJzUyMjQnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUFGRicsIC8vIGZyb250YWwgY2xlYXZlIHR1dG9yaWFsIG1lY2hhbmljXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGhhc2VyJzogJzU1RTEnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5TiBCYWQgVmlicmF0aW9ucyc6ICc1NUU2JywgLy8gdGV0aGVyZWQgb3V0c2lkZSBnaWFudCB0cmVlIGdyb3VuZCBhb2VzXHJcbiAgICAnRTlOIEVhcnRoLVNoYXR0ZXJpbmcgUGFydGljbGUgQmVhbSc6ICc1MjI1JywgLy8gbWlzc2luZyB0b3dlcnM/XHJcbiAgICAnRTlOIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNTVEQycsIC8vIFwiZ2V0IG91dFwiIGR1cmluZyBwYW5lbHNcclxuICAgICdFOU4gWmVyby1Gb3JtIFBhcnRpY2xlIEJlYW0gMic6ICc1NURCJywgLy8gQ2xvbmUgbGluZSBhb2VzIHcvIEFudGktQWlyIFBhcnRpY2xlIEJlYW1cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOU4gV2l0aGRyYXcnOiAnNTUzNCcsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlOIEFldGhlcm9zeW50aGVzaXMnOiAnNTUzNScsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAxJzogJzU1RUInLCAvLyB0YW5rIGxhc2VyIHdpdGggbWFya2VyXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogNTYxRCBFdmlsIFNlZWQgaGl0cyBldmVyeW9uZSwgaGFyZCB0byBrbm93IGlmIHRoZXJlJ3MgYSBkb3VibGUgdGFwXHJcbi8vIFRPRE86IGZhbGxpbmcgdGhyb3VnaCBwYW5lbCBqdXN0IGRvZXMgZGFtYWdlIHdpdGggbm8gYWJpbGl0eSBuYW1lLCBsaWtlIGEgZGVhdGggd2FsbFxyXG4vLyBUT0RPOiB3aGF0IGhhcHBlbnMgaWYgeW91IGp1bXAgaW4gc2VlZCB0aG9ybnM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlVW1icmFTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U5UyBCYWQgVmlicmF0aW9ucyc6ICc1NjFDJywgLy8gdGV0aGVyZWQgb3V0c2lkZSBnaWFudCB0cmVlIGdyb3VuZCBhb2VzXHJcbiAgICAnRTlTIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QjAwJywgLy8gYW50aS1haXIgXCJzaWRlc1wiXHJcbiAgICAnRTlTIFdpZGUtQW5nbGUgUGhhc2VyIFVubGltaXRlZCc6ICc1NjBFJywgLy8gd2lkZS1hbmdsZSBcInNpZGVzXCJcclxuICAgICdFOVMgQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1QjAxJywgLy8gd2lkZS1hbmdsZSBcIm91dFwiXHJcbiAgICAnRTlTIFRoZSBTZWNvbmQgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNTYwMScsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBTZWNvbmQgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTYwMicsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgMSc6ICc1QTk1JywgLy8gYm9zcyBsZWZ0LXJpZ2h0IHN1bW1vbi9wYW5lbCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyAyJzogJzVBOTYnLCAvLyBib3NzIGxlZnQtcmlnaHQgc3VtbW9uL3BhbmVsIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIENsb25lIDEnOiAnNTYxRScsIC8vIGNsb25lIGxlZnQtcmlnaHQgc3VtbW9uIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIENsb25lIDInOiAnNTYxRicsIC8vIGNsb25lIGxlZnQtcmlnaHQgc3VtbW9uIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgVGhpcmQgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNTYwMycsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBpbml0aWFsXHJcbiAgICAnRTlTIFRoZSBUaGlyZCBBcnQgT2YgRGFya25lc3MgMic6ICc1NjA0JywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGluaXRpYWxcclxuICAgICdFOVMgQXJ0IE9mIERhcmtuZXNzJzogJzU2MDYnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgZmluYWxcclxuICAgICdFOVMgRnVsbC1QZXJpbWl0ZXIgUGFydGljbGUgQmVhbSc6ICc1NjI5JywgLy8gcGFuZWwgXCJnZXQgaW5cIlxyXG4gICAgJ0U5UyBEYXJrIENoYWlucyc6ICc1RkFDJywgLy8gU2xvdyB0byBicmVhayBwYXJ0bmVyIGNoYWluc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5UyBXaXRoZHJhdyc6ICc1NjFBJywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOVMgQWV0aGVyb3N5bnRoZXNpcyc6ICc1NjFCJywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRTlTIFN0eWdpYW4gVGVuZHJpbHMnOiAnOTUyJywgLy8gc3RhbmRpbmcgaW4gdGhlIGJyYW1ibGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFOVMgSHlwZXItRm9jdXNlZCBQYXJ0aWNsZSBCZWFtJzogJzU1RkQnLCAvLyBBcnQgT2YgRGFya25lc3MgcHJvdGVhblxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTlTIENvbmRlbnNlZCBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNTYxMCcsIC8vIHdpZGUtYW5nbGUgXCJ0YW5rIGxhc2VyXCJcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnRTlTIE11bHRpLVByb25nZWQgUGFydGljbGUgQmVhbSc6ICc1NjAwJywgLy8gQXJ0IE9mIERhcmtuZXNzIFBhcnRuZXIgU3RhY2tcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEFudGktYWlyIFwidGFuayBzcHJlYWRcIi4gIFRoaXMgY2FuIGJlIHN0YWNrZWQgYnkgdHdvIHRhbmtzIGludnVsbmluZy5cclxuICAgICAgLy8gTm90ZTogdGhpcyB3aWxsIHN0aWxsIHNob3cgc29tZXRoaW5nIGZvciBob2xtZ2FuZy9saXZpbmcsIGJ1dFxyXG4gICAgICAvLyBhcmd1YWJseSBhIGhlYWxlciBtaWdodCBuZWVkIHRvIGRvIHNvbWV0aGluZyBhYm91dCB0aGF0LCBzbyBtYXliZVxyXG4gICAgICAvLyBpdCdzIG9rIHRvIHN0aWxsIHNob3cgYXMgYSB3YXJuaW5nPz9cclxuICAgICAgaWQ6ICdFOVMgQ29uZGVuc2VkIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgdHlwZTogJzIyJywgaWQ6ICc1NjE1JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gQW50aS1haXIgXCJvdXRcIi4gIFRoaXMgY2FuIGJlIGludnVsbmVkIGJ5IGEgdGFuayBhbG9uZyB3aXRoIHRoZSBzcHJlYWQgYWJvdmUuXHJcbiAgICAgIGlkOiAnRTlTIEFudGktQWlyIFBoYXNlciBVbmxpbWl0ZWQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1NjEyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwTiBGb3J3YXJkIEltcGxvc2lvbic6ICc1NkI0JywgLy8gaG93bCBib3NzIGltcGxvc2lvblxyXG4gICAgJ0UxME4gRm9yd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjUnLCAvLyBob3dsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhY2t3YXJkIEltcGxvc2lvbic6ICc1NkI3JywgLy8gdGFpbCBib3NzIGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgU2hhZG93IEltcGxvc2lvbic6ICc1NkI4JywgLy8gdGFpbCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAxJzogJzU2RDknLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQmFyYnMgT2YgQWdvbnkgMic6ICc1QjI2JywgLy8gU2hhZG93IFdhcnJpb3IgMyBkb2cgcm9vbSBjbGVhdmVcclxuICAgICdFMTBOIENsb2FrIE9mIFNoYWRvd3MnOiAnNUIxMScsIC8vIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBOIFRocm9uZSBPZiBTaGFkb3cnOiAnNTZDNycsIC8vIHN0YW5kaW5nIHVwIGdldCBvdXRcclxuICAgICdFMTBOIFJpZ2h0IEdpZ2EgU2xhc2gnOiAnNTZBRScsIC8vIGJvc3MgcmlnaHQgZ2lnYSBzbGFzaFxyXG4gICAgJ0UxME4gUmlnaHQgU2hhZG93IFNsYXNoJzogJzU2QUYnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBMZWZ0IEdpZ2EgU2xhc2gnOiAnNTZCMScsIC8vIGJvc3MgbGVmdCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBMZWZ0IFNoYWRvdyBTbGFzaCc6ICc1NkJEJywgLy8gZ2lnYSBzbGFzaCBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxME4gU2hhZG93eSBFcnVwdGlvbic6ICc1NkUxJywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgbWFya2VycyBwYWlyZWQgd2l0aCBiYXJic1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwTiBTaGFkb3dcXCdzIEVkZ2UnOiAnNTZEQicsIC8vIFRhbmtidXN0ZXIgc2luZ2xlIHRhcmdldCBmb2xsb3d1cFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IGhpdHRpbmcgc2hhZG93IG9mIHRoZSBoZXJvIHdpdGggYWJpbGl0aWVzIGNhbiBjYXVzZSB5b3UgdG8gdGFrZSBkYW1hZ2UsIGxpc3QgdGhvc2U/XHJcbi8vICAgICAgIGUuZy4gcGlja2luZyB1cCB5b3VyIGZpcnN0IHBpdGNoIGJvZyBwdWRkbGUgd2lsbCBjYXVzZSB5b3UgdG8gZGllIHRvIHRoZSBkYW1hZ2VcclxuLy8gICAgICAgeW91ciBzaGFkb3cgdGFrZXMgZnJvbSBEZWVwc2hhZG93IE5vdmEgb3IgRGlzdGFudCBTY3JlYW0uXHJcbi8vIFRPRE86IDU3M0IgQmxpZ2h0aW5nIEJsaXR6IGlzc3VlcyBkdXJpbmcgbGltaXQgY3V0IG51bWJlcnNcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VMaXRhbnlTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFNpbmdsZSAxJzogJzU2RjInLCAvLyBzaW5nbGUgdGFpbCB1cCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDInOiAnNTZFRicsIC8vIHNpbmdsZSBob3dsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBRdWFkcnVwbGUgMSc6ICc1NkVGJywgLy8gcXVhZHJ1cGxlIHNldCBvZiBzaGFkb3cgaW1wbG9zaW9uc1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAyJzogJzU2RjInLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAxJzogJzU2RUMnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBTaW5nbGUgMic6ICc1NkVEJywgLy8gR2lnYSBzbGFzaCBzaW5nbGUgZnJvbSBzaGFkb3dcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggQm94IDEnOiAnNTcwOScsIC8vIEdpZ2Egc2xhc2ggYm94IGZyb20gZm91ciBncm91bmQgc2hhZG93c1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMic6ICc1NzBEJywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAxJzogJzU2RUMnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBRdWFkcnVwbGUgMic6ICc1NkU5JywgLy8gcXVhZHJ1cGxlIHNldCBvZiBnaWdhIHNsYXNoIGNsZWF2ZXNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMSc6ICc1QjEzJywgLy8gaW5pdGlhbCBub24tc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwUyBDbG9hayBPZiBTaGFkb3dzIDInOiAnNUIxNCcsIC8vIHNlY29uZCBzcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIFRocm9uZSBPZiBTaGFkb3cnOiAnNTcxNycsIC8vIHN0YW5kaW5nIHVwIGdldCBvdXRcclxuICAgICdFMTBTIFNoYWRvd3kgRXJ1cHRpb24nOiAnNTczOCcsIC8vIGJhaXRlZCBncm91bmQgYW9lIGR1cmluZyBhbXBsaWZpZXJcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTBTIFN3YXRoIE9mIFNpbGVuY2UgMSc6ICc1NzFBJywgLy8gU2hhZG93IGNsb25lIGNsZWF2ZSAodG9vIGNsb3NlKVxyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAyJzogJzVCQkYnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0aW1lZClcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMFMgU2hhZGVmaXJlJzogJzU3MzInLCAvLyBwdXJwbGUgdGFuayB1bWJyYWwgb3Jic1xyXG4gICAgJ0UxMFMgUGl0Y2ggQm9nJzogJzU3MjInLCAvLyBtYXJrZXIgc3ByZWFkIHRoYXQgZHJvcHMgYSBzaGFkb3cgcHVkZGxlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTBTIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NzI1JywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gT3JicycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbWVzaGFkb3cnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdTY2hhdHRlbmZsYW1tZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ0ZsYW1tZSBvbWJyYWxlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn44K344Oj44OJ44Km44OV44Os44Kk44OgJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH0gKHBhcnRpYWwgc3RhY2spYCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTBTIERhbWFnZSBEb3duIEJvc3MnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTaGFja2xlcyBiZWluZyBtZXNzZWQgdXAgYXBwZWFyIHRvIGp1c3QgZ2l2ZSB0aGUgRGFtYWdlIERvd24sIHdpdGggbm90aGluZyBlbHNlLlxyXG4gICAgICAvLyBNZXNzaW5nIHVwIHRvd2VycyBpcyB0aGUgVGhyaWNlLUNvbWUgUnVpbiBlZmZlY3QgKDlFMiksIGJ1dCBhbHNvIERhbWFnZSBEb3duLlxyXG4gICAgICAvLyBUT0RPOiBzb21lIG9mIHRoZXNlIHdpbGwgYmUgZHVwbGljYXRlZCB3aXRoIG90aGVycywgbGlrZSBgRTEwUyBUaHJvbmUgT2YgU2hhZG93YC5cclxuICAgICAgLy8gTWF5YmUgaXQnZCBiZSBuaWNlIHRvIGZpZ3VyZSBvdXQgaG93IHRvIHB1dCB0aGUgZGFtYWdlIG1hcmtlciBvbiB0aGF0P1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NoYWRvd2tlZXBlcicsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVua8O2bmlnJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnUm9pIERlIExcXCdPbWJyZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ+W9seOBrueOiycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RhbWFnZScsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogYCR7bWF0Y2hlcy5lZmZlY3R9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU2hhZG93IFdhcnJpb3IgNCBkb2cgcm9vbSBjbGVhdmVcclxuICAgICAgLy8gVGhpcyBjYW4gYmUgbWl0aWdhdGVkIGJ5IHRoZSB3aG9sZSBncm91cCwgc28gYWRkIGEgZGFtYWdlIGNvbmRpdGlvbi5cclxuICAgICAgaWQ6ICdFMTBTIEJhcmJzIE9mIEFnb255JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzU3MkEnLCAnNUIyNyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VBbmFtb3JwaG9zaXMsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjJFJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2MkMnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEhvbHknOiAnNTYzMCcsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJub3V0JzogJzU2MkYnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMU4gU2hpbmluZyBCbGFkZSc6ICc1NjMxJywgLy8gQmFpdGVkIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBGbGFtZSBCcmlnaHRmaXJlJzogJzU2M0InLCAvLyBSZWQgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFOIEhhbG8gT2YgTGV2aW4gQnJpZ2h0ZmlyZSc6ICc1NjNDJywgLy8gQmx1ZSBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gUmVzb3VuZGluZyBDcmFjayc6ICc1NjREJywgLy8gRGVtaS1HdWt1bWF0eiAyNzAgZGVncmVlIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2NDUnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEZpcmUnOiAnNTY0MycsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJub3V0JzogJzU2NDYnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTExTiBCbGFzdGluZyBab25lJzogJzU2M0UnLCAvLyBQcmlzbWF0aWMgRGVjZXB0aW9uIGNoYXJnZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMU4gQnVybiBNYXJrJzogJzU2NEYnLCAvLyBQb3dkZXIgTWFyayBkZWJ1ZmYgZXhwbG9zaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMU4gQmxhc3RidXJuIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA1NjJEID0gQnVybnQgU3RyaWtlIGZpcmUgZm9sbG93dXAgZHVyaW5nIG1vc3Qgb2YgdGhlIGZpZ2h0XHJcbiAgICAgIC8vIDU2NDQgPSBzYW1lIHRoaW5nLCBidXQgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NjJEJywgJzU2NDQnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIDU2NUEvNTY4RCBTaW5zbW9rZSBCb3VuZCBPZiBGYWl0aCBzaGFyZVxyXG4vLyA1NjVFLzU2OTkgQm93c2hvY2sgaGl0cyB0YXJnZXQgb2YgNTY1RCAodHdpY2UpIGFuZCB0d28gb3RoZXJzXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NTInLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjU0JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2NTYnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSc6ICc1NjU3JywgLy8gQmFpdGVkIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEZpcmUnOiAnNTY4RScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIExpZ2h0bmluZyc6ICc1Njk1JywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgSG9seSc6ICc1NjlEJywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBTaGluaW5nIEJsYWRlIEN5Y2xlJzogJzU2OUUnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgSGFsbyBPZiBGbGFtZSBCcmlnaHRmaXJlJzogJzU2NkQnLCAvLyBSZWQgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIEhhbG8gT2YgTGV2aW4gQnJpZ2h0ZmlyZSc6ICc1NjZDJywgLy8gQmx1ZSBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIEZsYW1lIEJyaWdodCBQdWxzZSc6ICc1NjcxJywgLy8gUmVkIGNhcmQgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIExldmluIEJyaWdodCBQdWxzZSc6ICc1NjcwJywgLy8gQmx1ZSBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFJlc29uYW50IFdpbmRzJzogJzU2ODknLCAvLyBEZW1pLUd1a3VtYXR6IFwiZ2V0IGluXCJcclxuICAgICdFMTFTIFJlc291bmRpbmcgQ3JhY2snOiAnNTY4OCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMVMgSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjdCJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY3QycsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NzknLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEhvbHknOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBTaGluaW5nIEJsYWRlJzogJzU2N0UnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBiYWl0ZWQgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJub3V0JzogJzU2NTUnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMVMgQnVybm91dCBDeWNsZSc6ICc1Njk2JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJsYXN0aW5nIFpvbmUnOiAnNTY3NCcsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsnOiAnNTY2NCcsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuXHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsgQ3ljbGUnOiAnNTY4QycsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2luc21pdGUnOiAnNTY2NycsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkXHJcbiAgICAnRTExUyBTaW5zbWl0ZSBDeWNsZSc6ICc1Njk0JywgLy8gTGlnaHRuaW5nIEVsZW1lbnRhbCBCcmVhayBzcHJlYWQgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTFTIEJ1cm4gTWFyayc6ICc1NkEzJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMSc6ICc1NjYxJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXJcclxuICAgICdFMTFTIFNpbnNpZ2h0IDInOiAnNUJDNycsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMyc6ICc1NkEwJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXIgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0UxMVMgSG9seSBTaW5zaWdodCBHcm91cCBTaGFyZSc6ICc1NjY5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExUyBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU2NTMgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY3QSA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgLy8gNTY4RiA9IHNhbWUgdGhpbmcsIGJ1dCBkdXJpbmcgQ3ljbGUgb2YgRmFpdGhcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2NTMnLCAnNTY3QScsICc1NjhGJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUV0ZXJuaXR5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTJOIEp1ZGdtZW50IEpvbHQgU2luZ2xlJzogJzU4NUYnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIEp1ZGdtZW50IEpvbHQnOiAnNEUzMCcsIC8vIFJhbXVoIGdldCBvdXQgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQgU2luZ2xlJzogJzU4NUMnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0XHJcbiAgICAnRTEyTiBUZW1wb3JhcnkgQ3VycmVudCc6ICc0RTJEJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gQ29uZmxhZyBTdHJpa2UgU2luZ2xlJzogJzU4NUQnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gQ29uZmxhZyBTdHJpa2UnOiAnNEUyRScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0gU2luZ2xlJzogJzU4NUUnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3RcclxuICAgICdFMTJOIEZlcm9zdG9ybSc6ICc0RTJGJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBSYXB0dXJvdXMgUmVhY2ggMSc6ICc1ODc4JywgLy8gSGFpcmN1dFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDInOiAnNTg3NycsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIEJvbWIgRXhwbG9zaW9uJzogJzU4NkQnLCAvLyBTbWFsbCBib21iIGV4cGxvc2lvblxyXG4gICAgJ0UxMk4gVGl0YW5pYyBCb21iIEV4cGxvc2lvbic6ICc1ODZGJywgLy8gTGFyZ2UgYm9tYiBleHBsb3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMk4gRWFydGhzaGFrZXInOiAnNTg4NScsIC8vIEVhcnRoc2hha2VyIG9uIGZpcnN0IHBsYXRmb3JtXHJcbiAgICAnRTEyTiBQcm9taXNlIEZyaWdpZCBTdG9uZSAxJzogJzU4NjcnLCAvLyBTaGl2YSBzcHJlYWQgd2l0aCBzbGlkaW5nXHJcbiAgICAnRTEyTiBQcm9taXNlIEZyaWdpZCBTdG9uZSAyJzogJzU4NjknLCAvLyBTaGl2YSBzcHJlYWQgd2l0aCBSYXB0dXJvdXMgUmVhY2hcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgT3V0cHV0cyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvb3V0cHV0cyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IGFkZCBzZXBhcmF0ZSBkYW1hZ2VXYXJuLWVzcXVlIGljb24gZm9yIGRhbWFnZSBkb3ducz9cclxuLy8gVE9ETzogNThBNiBVbmRlciBUaGUgV2VpZ2h0IC8gNThCMiBDbGFzc2ljYWwgU2N1bHB0dXJlIG1pc3Npbmcgc29tZWJvZHkgaW4gcGFydHkgd2FybmluZz9cclxuLy8gVE9ETzogNThDQSBEYXJrIFdhdGVyIElJSSAvIDU4QzUgU2hlbGwgQ3J1c2hlciBzaG91bGQgaGl0IGV2ZXJ5b25lIGluIHBhcnR5XHJcbi8vIFRPRE86IERhcmsgQWVybyBJSUkgNThENCBzaG91bGQgbm90IGJlIGEgc2hhcmUgZXhjZXB0IG9uIGFkdmFuY2VkIHJlbGF0aXZpdHkgZm9yIGRvdWJsZSBhZXJvLlxyXG4vLyAoZm9yIGdhaW5zIGVmZmVjdCwgc2luZ2xlIGFlcm8gPSB+MjMgc2Vjb25kcywgZG91YmxlIGFlcm8gPSB+MzEgc2Vjb25kcyBkdXJhdGlvbilcclxuXHJcbi8vIER1ZSB0byBjaGFuZ2VzIGludHJvZHVjZWQgaW4gcGF0Y2ggNS4yLCBvdmVyaGVhZCBtYXJrZXJzIG5vdyBoYXZlIGEgcmFuZG9tIG9mZnNldFxyXG4vLyBhZGRlZCB0byB0aGVpciBJRC4gVGhpcyBvZmZzZXQgY3VycmVudGx5IGFwcGVhcnMgdG8gYmUgc2V0IHBlciBpbnN0YW5jZSwgc29cclxuLy8gd2UgY2FuIGRldGVybWluZSB3aGF0IGl0IGlzIGZyb20gdGhlIGZpcnN0IG92ZXJoZWFkIG1hcmtlciB3ZSBzZWUuXHJcbi8vIFRoZSBmaXJzdCAxQiBtYXJrZXIgaW4gdGhlIGVuY291bnRlciBpcyB0aGUgZm9ybWxlc3MgdGFua2J1c3RlciwgSUQgMDA0Ri5cclxuY29uc3QgZmlyc3RIZWFkbWFya2VyID0gcGFyc2VJbnQoJzAwREEnLCAxNik7XHJcbmNvbnN0IGdldEhlYWRtYXJrZXJJZCA9IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgLy8gSWYgd2UgbmFpdmVseSBqdXN0IGNoZWNrICFkYXRhLmRlY09mZnNldCBhbmQgbGVhdmUgaXQsIGl0IGJyZWFrcyBpZiB0aGUgZmlyc3QgbWFya2VyIGlzIDAwREEuXHJcbiAgLy8gKFRoaXMgbWFrZXMgdGhlIG9mZnNldCAwLCBhbmQgITAgaXMgdHJ1ZS4pXHJcbiAgaWYgKHR5cGVvZiBkYXRhLmRlY09mZnNldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBkYXRhLmRlY09mZnNldCA9IHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGZpcnN0SGVhZG1hcmtlcjtcclxuICAvLyBUaGUgbGVhZGluZyB6ZXJvZXMgYXJlIHN0cmlwcGVkIHdoZW4gY29udmVydGluZyBiYWNrIHRvIHN0cmluZywgc28gd2UgcmUtYWRkIHRoZW0gaGVyZS5cclxuICAvLyBGb3J0dW5hdGVseSwgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHJvYnVzdCxcclxuICAvLyBzaW5jZSB3ZSBrbm93IGFsbCB0aGUgSURzIHRoYXQgd2lsbCBiZSBwcmVzZW50IGluIHRoZSBlbmNvdW50ZXIuXHJcbiAgcmV0dXJuIChwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBkYXRhLmRlY09mZnNldCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkucGFkU3RhcnQoNCwgJzAnKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBMZWZ0JzogJzU4QUQnLCAvLyBIYWlyY3V0IHdpdGggbGVmdCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIFJpZ2h0JzogJzU4QUUnLCAvLyBIYWlyY3V0IHdpdGggcmlnaHQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFNDQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgQ29uZmxhZyBTdHJpa2UnOiAnNEU0NScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgRmVyb3N0b3JtJzogJzRFNDYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBKdWRnbWVudCBKb2x0JzogJzRFNDcnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBTaGF0dGVyJzogJzU4OUMnLCAvLyBJY2UgUGlsbGFyIGV4cGxvc2lvbiBpZiB0ZXRoZXIgbm90IGdvdHRlblxyXG4gICAgJ0UxMlMgUHJvbWlzZSBJbXBhY3QnOiAnNThBMScsIC8vIFRpdGFuIGJvbWIgZHJvcFxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQmxpenphcmQgSUlJJzogJzU4RDMnLCAvLyBSZWxhdGl2aXR5IGRvbnV0IG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgQXBvY2FseXBzZSc6ICc1OEU2JywgLy8gTGlnaHQgdXAgY2lyY2xlIGV4cGxvc2lvbnMgKGRhbWFnZSBkb3duKVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIE1hZWxzdHJvbSc6ICc1OERBJywgLy8gQWR2YW5jZWQgUmVsYXRpdml0eSB0cmFmZmljIGxpZ2h0IGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZyaWdpZCBTdG9uZSc6ICc1ODlFJywgLy8gU2hpdmEgc3ByZWFkXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFya2VzdCBEYW5jZSc6ICc0RTMzJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgKyBqdW1wIGJlZm9yZSBrbm9ja2JhY2tcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEN1cnJlbnQnOiAnNThEOCcsIC8vIEJhaXRlZCB0cmFmZmljIGxpZ2h0IGxhc2Vyc1xyXG4gICAgJ0UxMlMgT3JhY2xlIFNwaXJpdCBUYWtlcic6ICc1OEM2JywgLy8gUmFuZG9tIGp1bXAgc3ByZWFkIG1lY2hhbmljIGFmdGVyIFNoZWxsIENydXNoZXJcclxuICAgICdFMTJTIE9yYWNsZSBTb21iZXIgRGFuY2UgMSc6ICc1OEJGJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgZm9yIER1YWwgQXBvY2FseXBzZVxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAyJzogJzU4QzAnLCAvLyBTZWNvbmQgc29tYmVyIGRhbmNlIGp1bXBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBXZWlnaHQgT2YgVGhlIFdvcmxkJzogJzU4QTUnLCAvLyBUaXRhbiBib21iIGJsdWUgbWFya2VyXHJcbiAgICAnRTEyUyBQcm9taXNlIFB1bHNlIE9mIFRoZSBMYW5kJzogJzU4QTMnLCAvLyBUaXRhbiBib21iIHllbGxvdyBtYXJrZXJcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEVydXB0aW9uIDEnOiAnNThDRScsIC8vIEluaXRpYWwgd2FybXVwIHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMic6ICc1OENEJywgLy8gUmVsYXRpdml0eSBzcHJlYWQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBCbGFjayBIYWxvJzogJzU4QzcnLCAvLyBUYW5rYnVzdGVyIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgRG9vbSc6ICc5RDQnLCAvLyBSZWxhdGl2aXR5IHB1bmlzaG1lbnQgZm9yIG11bHRpcGxlIG1pc3Rha2VzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBGb3JjZSBPZiBUaGUgTGFuZCc6ICc1OEE0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEJpZyBjaXJjbGUgZ3JvdW5kIGFvZXMgZHVyaW5nIFNoaXZhIGp1bmN0aW9uLlxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBzaGllbGRlZCB0aHJvdWdoIGFzIGxvbmcgYXMgdGhhdCBwZXJzb24gZG9lc24ndCBzdGFjay5cclxuICAgICAgaWQ6ICdFMTJTIEljaWNsZSBJbXBhY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEU1QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBIZWFkbWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7fSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBpZCA9IGdldEhlYWRtYXJrZXJJZChkYXRhLCBtYXRjaGVzKTtcclxuICAgICAgICBjb25zdCBmaXJzdExhc2VyTWFya2VyID0gJzAwOTEnO1xyXG4gICAgICAgIGNvbnN0IGxhc3RMYXNlck1hcmtlciA9ICcwMDk4JztcclxuICAgICAgICBpZiAoaWQgPj0gZmlyc3RMYXNlck1hcmtlciAmJiBpZCA8PSBsYXN0TGFzZXJNYXJrZXIpIHtcclxuICAgICAgICAgIC8vIGlkcyBhcmUgc2VxdWVudGlhbDogIzEgc3F1YXJlLCAjMiBzcXVhcmUsICMzIHNxdWFyZSwgIzQgc3F1YXJlLCAjMSB0cmlhbmdsZSBldGNcclxuICAgICAgICAgIGNvbnN0IGRlY09mZnNldCA9IHBhcnNlSW50KGlkLCAxNikgLSBwYXJzZUludChmaXJzdExhc2VyTWFya2VyLCAxNik7XHJcblxyXG4gICAgICAgICAgLy8gZGVjT2Zmc2V0IGlzIDAtNywgc28gbWFwIDAtMyB0byAxLTQgYW5kIDQtNyB0byAxLTQuXHJcbiAgICAgICAgICBkYXRhLmxhc2VyTmFtZVRvTnVtID0gZGF0YS5sYXNlck5hbWVUb051bSB8fCB7fTtcclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW1bbWF0Y2hlcy50YXJnZXRdID0gZGVjT2Zmc2V0ICUgNCArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlc2Ugc2N1bHB0dXJlcyBhcmUgYWRkZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBmaWdodCwgc28gd2UgbmVlZCB0byBjaGVjayB3aGVyZSB0aGV5XHJcbiAgICAgIC8vIHVzZSB0aGUgXCJDbGFzc2ljYWwgU2N1bHB0dXJlXCIgYWJpbGl0eSBhbmQgZW5kIHVwIG9uIHRoZSBhcmVuYSBmb3IgcmVhbC5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQ2hpc2VsZWQgU2N1bHB0dXJlIENsYXNzaWNhbCBTY3VscHR1cmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgcnVuIHBlciBwZXJzb24gdGhhdCBnZXRzIGhpdCBieSB0aGUgc2FtZSBzY3VscHR1cmUsIGJ1dCB0aGF0J3MgZmluZS5cclxuICAgICAgICAvLyBSZWNvcmQgdGhlIHkgcG9zaXRpb24gb2YgZWFjaCBzY3VscHR1cmUgc28gd2UgY2FuIHVzZSBpdCBmb3IgYmV0dGVyIHRleHQgbGF0ZXIuXHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1ttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlIHNvdXJjZSBvZiB0aGUgdGV0aGVyIGlzIHRoZSBwbGF5ZXIsIHRoZSB0YXJnZXQgaXMgdGhlIHNjdWxwdHVyZS5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQ2hpc2VsZWQgU2N1bHB0dXJlIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHRhcmdldDogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkID0gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkW21hdGNoZXMuc291cmNlXSA9IG1hdGNoZXMudGFyZ2V0SWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lIENvdW50ZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAxLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50ID0gZGF0YS5ibGFkZU9mRmxhbWVDb3VudCB8fCAwO1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQrKztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaXMgdGhlIENoaXNlbGVkIFNjdWxwdHVyZSBsYXNlciB3aXRoIHRoZSBsaW1pdCBjdXQgZG90cy5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubGFzZXJOYW1lVG9OdW0gfHwgIWRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgfHwgIWRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgcGVyc29uIHdobyBoYXMgdGhpcyBsYXNlciBudW1iZXIgYW5kIGlzIHRldGhlcmVkIHRvIHRoaXMgc3RhdHVlLlxyXG4gICAgICAgIGNvbnN0IG51bWJlciA9IChkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDApICsgMTtcclxuICAgICAgICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKGRhdGEubGFzZXJOYW1lVG9OdW0pO1xyXG4gICAgICAgIGNvbnN0IHdpdGhOdW0gPSBuYW1lcy5maWx0ZXIoKG5hbWUpID0+IGRhdGEubGFzZXJOYW1lVG9OdW1bbmFtZV0gPT09IG51bWJlcik7XHJcbiAgICAgICAgY29uc3Qgb3duZXJzID0gd2l0aE51bS5maWx0ZXIoKG5hbWUpID0+IGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbmFtZV0gPT09IHNvdXJjZUlkKTtcclxuXHJcbiAgICAgICAgLy8gaWYgc29tZSBsb2dpYyBlcnJvciwganVzdCBhYm9ydC5cclxuICAgICAgICBpZiAob3duZXJzLmxlbmd0aCAhPT0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVGhlIG93bmVyIGhpdHRpbmcgdGhlbXNlbHZlcyBpc24ndCBhIG1pc3Rha2UuLi50ZWNobmljYWxseS5cclxuICAgICAgICBpZiAob3duZXJzWzBdID09PSBtYXRjaGVzLnRhcmdldClcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gTm93IHRyeSB0byBmaWd1cmUgb3V0IHdoaWNoIHN0YXR1ZSBpcyB3aGljaC5cclxuICAgICAgICAvLyBQZW9wbGUgY2FuIHB1dCB0aGVzZSB3aGVyZXZlci4gIFRoZXkgY291bGQgZ28gc2lkZXdheXMsIG9yIGRpYWdvbmFsLCBvciB3aGF0ZXZlci5cclxuICAgICAgICAvLyBJdCBzZWVtcyBtb29vb29zdCBwZW9wbGUgcHV0IHRoZXNlIG5vcnRoIC8gc291dGggKG9uIHRoZSBzb3V0aCBlZGdlIG9mIHRoZSBhcmVuYSkuXHJcbiAgICAgICAgLy8gTGV0J3Mgc2F5IGEgbWluaW11bSBvZiAyIHlhbG1zIGFwYXJ0IGluIHRoZSB5IGRpcmVjdGlvbiB0byBjb25zaWRlciB0aGVtIFwibm9ydGgvc291dGhcIi5cclxuICAgICAgICBjb25zdCBtaW5pbXVtWWFsbXNGb3JTdGF0dWVzID0gMjtcclxuXHJcbiAgICAgICAgbGV0IGlzU3RhdHVlUG9zaXRpb25Lbm93biA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc1N0YXR1ZU5vcnRoID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgc2N1bHB0dXJlSWRzID0gT2JqZWN0LmtleXMoZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zKTtcclxuICAgICAgICBpZiAoc2N1bHB0dXJlSWRzLmxlbmd0aCA9PT0gMiAmJiBzY3VscHR1cmVJZHMuaW5jbHVkZXMoc291cmNlSWQpKSB7XHJcbiAgICAgICAgICBjb25zdCBvdGhlcklkID0gc2N1bHB0dXJlSWRzWzBdID09PSBzb3VyY2VJZCA/IHNjdWxwdHVyZUlkc1sxXSA6IHNjdWxwdHVyZUlkc1swXTtcclxuICAgICAgICAgIGNvbnN0IHNvdXJjZVkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbc291cmNlSWRdO1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJZID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW290aGVySWRdO1xyXG4gICAgICAgICAgY29uc3QgeURpZmYgPSBNYXRoLmFicyhzb3VyY2VZIC0gb3RoZXJZKTtcclxuICAgICAgICAgIGlmICh5RGlmZiA+IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMpIHtcclxuICAgICAgICAgICAgaXNTdGF0dWVQb3NpdGlvbktub3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXNTdGF0dWVOb3J0aCA9IHNvdXJjZVkgPCBvdGhlclk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvd25lciA9IG93bmVyc1swXTtcclxuICAgICAgICBjb25zdCBvd25lck5pY2sgPSBkYXRhLlNob3J0TmFtZShvd25lcik7XHJcbiAgICAgICAgbGV0IHRleHQgPSB7XHJcbiAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIKWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmIGlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3J0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3JkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWMl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWMl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg67aB7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmICFpc1N0YXR1ZU5vcnRoKSB7XHJcbiAgICAgICAgICB0ZXh0ID0ge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0gc291dGgpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0gU8O8ZGVuKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZfjga4ke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6rljZfmlrkke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIIOuCqOyqvSlgLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgVHJhY2tlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogWycwMDAxJywgJzAwMzknXSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEucGlsbGFySWRUb093bmVyID0gZGF0YS5waWxsYXJJZFRvT3duZXIgfHwge307XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgTWlzdGFrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdJY2UgUGlsbGFyJywgaWQ6ICc1ODlCJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5waWxsYXJJZFRvT3duZXIpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXMudGFyZ2V0ICE9PSBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBwaWxsYXJPd25lciA9IGRhdGEuU2hvcnROYW1lKGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChkZSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtwaWxsYXJPd25lcn3jgYvjgokpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke3BpbGxhck93bmVyfVwiKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBHYWluIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgLy8gVGhlIEJlYXN0bHkgU2N1bHB0dXJlIGdpdmVzIGEgMyBzZWNvbmQgZGVidWZmLCB0aGUgUmVnYWwgU2N1bHB0dXJlIGdpdmVzIGEgMTRzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPSBkYXRhLmZpcmUgfHwge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBMb3NlIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPSBkYXRhLmZpcmUgfHwge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25JZFRvT3duZXIgPSBkYXRhLnNtYWxsTGlvbklkVG9Pd25lciB8fCB7fTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMgPSBkYXRhLnNtYWxsTGlvbk93bmVycyB8fCBbXTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIFNtYWxsIExpb24gTGlvbnNibGF6ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBGb2xrcyBiYWl0aW5nIHRoZSBiaWcgbGlvbiBzZWNvbmQgY2FuIHRha2UgdGhlIGZpcnN0IHNtYWxsIGxpb24gaGl0LFxyXG4gICAgICAgIC8vIHNvIGl0J3Mgbm90IHN1ZmZpY2llbnQgdG8gY2hlY2sgb25seSB0aGUgb3duZXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLnNtYWxsTGlvbk93bmVycylcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgaWYgKCFvd25lcilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAobWF0Y2hlcy50YXJnZXQgPT09IG93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGFsc28gaGFzIGEgc21hbGwgbGlvbiB0ZXRoZXIsIHRoYXQgaXMgYWx3YXlzIGEgbWlzdGFrZS5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0J3Mgb25seSBhIG1pc3Rha2UgaWYgdGhlIHRhcmdldCBoYXMgYSBmaXJlIGRlYnVmZi5cclxuICAgICAgICBjb25zdCBoYXNTbWFsbExpb24gPSBkYXRhLnNtYWxsTGlvbk93bmVycy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICBpZiAoaGFzU21hbGxMaW9uIHx8IGhhc0ZpcmVEZWJ1ZmYpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgICAgY29uc3QgeCA9IHBhcnNlRmxvYXQobWF0Y2hlcy54KTtcclxuICAgICAgICAgIGNvbnN0IHkgPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgICAgICBsZXQgZGlyT2JqID0gbnVsbDtcclxuICAgICAgICAgIGlmICh5IDwgY2VudGVyWSkge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJORTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyTlc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTRTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyU1c7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogb3duZXIsXHJcbiAgICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZW4nXX0pYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2RlJ119KWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2ZyJ119KWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7b3duZXJOaWNrfeOBi+OCiSwgJHtkaXJPYmpbJ2phJ119KWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2NuJ119YCxcclxuICAgICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7ZGlyT2JqWydrbyddfSlgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBOb3J0aCBCaWcgTGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCh7IG5hbWU6ICdSZWdhbCBTY3VscHR1cmUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgIGlmICh5IDwgY2VudGVyWSlcclxuICAgICAgICAgIGRhdGEubm9ydGhCaWdMaW9uID0gbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmlnIExpb24gS2luZ3NibGF6ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdSZWdhbCBTY3VscHR1cmUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdBYmJpbGQgZWluZXMgZ3Jvw59lbiBMw7Z3ZW4nLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdjcsOpYXRpb24gbMOpb25pbmUgcm95YWxlJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2Q546LJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBzaW5nbGVUYXJnZXQgPSBtYXRjaGVzLnR5cGUgPT09ICcyMSc7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICAvLyBTdWNjZXNzIGlmIG9ubHkgb25lIHBlcnNvbiB0YWtlcyBpdCBhbmQgdGhleSBoYXZlIG5vIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGlmIChzaW5nbGVUYXJnZXQgJiYgIWhhc0ZpcmVEZWJ1ZmYpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHtcclxuICAgICAgICAgIG5vcnRoQmlnTGlvbjoge1xyXG4gICAgICAgICAgICBlbjogJ25vcnRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdOb3JkZW0sIGdyb8OfZXIgTMO2d2UnLFxyXG4gICAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljJcpJyxcclxuICAgICAgICAgICAgY246ICfljJfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAgICBrbzogJ+u2geyqvSDtgbAg7IKs7J6QJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzb3V0aEJpZ0xpb246IHtcclxuICAgICAgICAgICAgZW46ICdzb3V0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICAgIGRlOiAnU8O8ZGVuLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgICAgamE6ICflpKfjg6njgqTjgqrjg7Mo5Y2XKScsXHJcbiAgICAgICAgICAgIGNuOiAn5Y2X5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgICAga286ICfrgqjsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2hhcmVkOiB7XHJcbiAgICAgICAgICAgIGVuOiAnc2hhcmVkJyxcclxuICAgICAgICAgICAgZGU6ICdnZXRlaWx0JyxcclxuICAgICAgICAgICAgamE6ICfph43jga3jgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+mHjeWPoCcsXHJcbiAgICAgICAgICAgIGtvOiAn6rCZ7J20IOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmlyZURlYnVmZjoge1xyXG4gICAgICAgICAgICBlbjogJ2hhZCBmaXJlJyxcclxuICAgICAgICAgICAgZGU6ICdoYXR0ZSBGZXVlcicsXHJcbiAgICAgICAgICAgIGphOiAn54KO5LuY44GNJyxcclxuICAgICAgICAgICAgY246ICfngatEZWJ1ZmYnLFxyXG4gICAgICAgICAgICBrbzogJ+2ZlOyXvCDrlJTrsoTtlIQg67Cb7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFiZWxzID0gW107XHJcbiAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24gPT09IG1hdGNoZXMuc291cmNlSWQpXHJcbiAgICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5ub3J0aEJpZ0xpb25bZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQubm9ydGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LnNvdXRoQmlnTGlvbltkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5zb3V0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbmdsZVRhcmdldClcclxuICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5zaGFyZWRbZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQuc2hhcmVkWydlbiddKTtcclxuICAgICAgICBpZiAoaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5maXJlRGVidWZmW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0LmZpcmVEZWJ1ZmZbJ2VuJ10pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2xhYmVscy5qb2luKCcsICcpfSlgLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1ODlBID0gSWNlIFBpbGxhciAocHJvbWlzZSBzaGl2YSBwaGFzZSlcclxuICAgICAgLy8gNThCNiA9IFBhbG0gT2YgVGVtcGVyYW5jZSAocHJvbWlzZSBzdGF0dWUgaGFuZClcclxuICAgICAgLy8gNThCNyA9IExhc2VyIEV5ZSAocHJvbWlzZSBsaW9uIHBoYXNlKVxyXG4gICAgICAvLyA1OEMxID0gRGFya2VzdCBEYW5jZSAob3JhY2xlIHRhbmsganVtcCArIGtub2NrYmFjayBpbiBiZWdpbm5pbmcgYW5kIHRyaXBsZSBhcG9jKVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTg5QScsICc1OEI2JywgJzU4QjcnLCAnNThDMSddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBPcmFjbGUgU2hhZG93ZXllJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzU4RDInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogd2FybmluZyBmb3IgdGFraW5nIERpYW1vbmQgRmxhc2ggKDVGQTEpIHN0YWNrIG9uIHlvdXIgb3duP1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ2xvdWREZWNrRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAxJzogJzVGQUYnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDInOiAnNUZCMicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMyc6ICc1RkNEJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA0JzogJzVGQ0UnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDUnOiAnNUZDRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNic6ICc1RkY4JywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA3JzogJzYxNTknLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXJ0aWN1bGF0ZWQgQml0IEFldGhlcmlhbCBCdWxsZXQnOiAnNUZBQicsIC8vIGJpdCBsYXNlcnMgZHVyaW5nIGFsbCBwaGFzZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAxJzogJzVGQ0InLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAyJzogJzVGQ0MnLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggQ2xhdyBTd2lwZSBMZWZ0JzogJzVGQzInLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIFJpZ2h0JzogJzVGQzMnLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMSc6ICc1RkQxJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQXVyaSBDeWNsb25lIDInOiAnNUZEMicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZEV4IEFpcnNoaXBcXCdzIEJhbmUgMSc6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRDMnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IFRhbmsgTGFzZXJzJzogJzVGQzgnLCAvLyBjbGVhdmluZyB5ZWxsb3cgbGFzZXJzIG9uIHRvcCB0d28gZW5taXR5XHJcbiAgICAnRGlhbW9uZEV4IEhvbWluZyBMYXNlcic6ICc1RkM0JywgLy8gQWRhbWFudGUgUHVyZ2Ugc3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggRmxvb2QgUmF5JzogJzVGQzcnLCAvLyBcImxpbWl0IGN1dFwiIGNsZWF2ZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZEV4IFZlcnRpY2FsIENsZWF2ZSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUZEMCcgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVjayxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBBcnRzJzogJzVGRTMnLCAvLyBBdXJpIEFydHMgZGFzaGVzXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBJbml0aWFsJzogJzVGRTEnLCAvLyBpbml0aWFsIGNpcmNsZSBvZiBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBDaGFzaW5nJzogJzVGRTInLCAvLyBmb2xsb3d1cCBjaXJjbGVzIGZyb20gRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFldGhlcmlhbCBCdWxsZXQnOiAnNUZENScsIC8vIGJpdCBsYXNlcnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIExlZnQnOiAnNUZEOScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkRBJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMSc6ICc1RkU2JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMic6ICc1RkU3JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZFOCcsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gSG9taW5nIExhc2VyJzogJzVGREInLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kIFdlYXBvbiBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVGRTUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DYXN0cnVtTWFyaW51bUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSc6ICc1QkQzJywgLy8gRW1lcmFsZCBCZWFtIGluaXRpYWwgY29uYWxcclxuICAgICdFbWVyYWxkRXggUGhvdG9uIExhc2VyIDEnOiAnNTU3QicsIC8vIEVtZXJhbGQgQmVhbSBpbnNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAyJzogJzU1N0QnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXkgMSc6ICc1NTdBJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXkgMic6ICc1NTc5JywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkRXggRXhwbG9zaW9uJzogJzU1OTYnLCAvLyBNYWdpdGVrIE1pbmUgZXhwbG9zaW9uXHJcbiAgICAnRW1lcmFsZEV4IFRlcnRpdXMgVGVybWludXMgRXN0IEluaXRpYWwnOiAnNTVDRCcsIC8vIHN3b3JkIGluaXRpYWwgcHVkZGxlc1xyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBFeHBsb3Npb24nOiAnNTVDRScsIC8vIHN3b3JkIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkRXggQWlyYm9ybmUgRXhwbG9zaW9uJzogJzU1QkQnLCAvLyBleGFmbGFyZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDEnOiAnNTVENCcsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNpZGVzY2F0aGUgMic6ICc1NUQ1JywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkRXggU2hvdHMgRmlyZWQnOiAnNTVCNycsIC8vIHJhbmsgYW5kIGZpbGUgc29sZGllcnNcclxuICAgICdFbWVyYWxkRXggU2VjdW5kdXMgVGVybWludXMgRXN0JzogJzU1Q0InLCAvLyBkcm9wcGVkICsgYW5kIHggaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkRXggRXhwaXJlJzogJzU1RDEnLCAvLyBncm91bmQgYW9lIG9uIGJvc3MgXCJnZXQgb3V0XCJcclxuICAgICdFbWVyYWxkRXggQWlyZSBUYW0gU3Rvcm0nOiAnNTVEMCcsIC8vIGV4cGFuZGluZyByZWQgYW5kIGJsYWNrIGdyb3VuZCBhb2VcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGRFeCBEaXZpZGUgRXQgSW1wZXJhJzogJzU1RDknLCAvLyBub24tdGFuayBwcm90ZWFuIHNwcmVhZFxyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDEnOiAnNTVDNCcsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDInOiAnNTVDNScsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDMnOiAnNTVDNicsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDQnOiAnNTVDNycsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DYXN0cnVtTWFyaW51bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXknOiAnNEY5RCcsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDEnOiAnNTUzNCcsIC8vIEVtZXJhbGQgQmVhbSBpbnNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDInOiAnNTUzNicsIC8vIEVtZXJhbGQgQmVhbSBtaWRkbGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUGhvdG9uIExhc2VyIDMnOiAnNTUzOCcsIC8vIEVtZXJhbGQgQmVhbSBvdXRzaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDEnOiAnNTUzMicsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXkgMic6ICc1NTMzJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBNYWduZXRpYyBNaW5lIEV4cGxvc2lvbic6ICc1QjA0JywgLy8gcmVwdWxzaW5nIG1pbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMSc6ICc1NTNGJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDInOiAnNTU0MCcsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAzJzogJzU1NDEnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgNCc6ICc1NTQyJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBCaXQgU3Rvcm0nOiAnNTU0QScsIC8vIFwiZ2V0IGluXCJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBFbWVyYWxkIENydXNoZXInOiAnNTUzQycsIC8vIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQdWxzZSBMYXNlcic6ICc1NTQ4JywgLy8gbGluZSBhb2VcclxuICAgICdFbWVyYWxkIFdlYXBvbiBFbmVyZ3kgQWV0aGVyb3BsYXNtJzogJzU1NTEnLCAvLyBoaXR0aW5nIGEgZ2xvd3kgb3JiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBHcm91bmQnOiAnNTU2RicsIC8vIHBhcnR5IHRhcmdldGVkIGdyb3VuZCBjb25lc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QnOiAnNEIzRScsIC8vIGdyb3VuZCBjaXJjbGUgZHVyaW5nIGFycm93IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2VjdW5kdXMgVGVybWludXMgRXN0JzogJzU1NkEnLCAvLyBYIC8gKyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFRlcnRpdXMgVGVybWludXMgRXN0JzogJzU1NkQnLCAvLyB0cmlwbGUgc3dvcmRzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2hvdHMgRmlyZWQnOiAnNTU1RicsIC8vIGxpbmUgYW9lcyBmcm9tIHNvbGRpZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIFAxJzogJzU1NEUnLCAvLyB0YW5rYnVzdGVyLCBwcm9iYWJseSBjbGVhdmVzLCBwaGFzZSAxXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMic6ICc1NTcwJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFbWVyYWxkIFdlYXBvbiBFbWVyYWxkIENydXNoZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU1M0UnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEdldHRpbmcga25vY2tlZCBpbnRvIGEgd2FsbCBmcm9tIHRoZSBhcnJvdyBoZWFkbWFya2VyLlxyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QgV2FsbCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU1NjMnLCAnNTU2NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIEhhZGVzIEV4XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVNaW5zdHJlbHNCYWxsYWRIYWRlc3NFbGVneSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDInOiAnNDdBQScsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDMnOiAnNDdFNCcsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDQnOiAnNDdFNScsXHJcbiAgICAvLyBFdmVyeWJvZHkgc3RhY2tzIGluIGdvb2QgZmFpdGggZm9yIEJhZCBGYWl0aCwgc28gZG9uJ3QgY2FsbCBpdCBhIG1pc3Rha2UuXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMSc6ICc0N0FEJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAyJzogJzQ3QjAnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDMnOiAnNDdBRScsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggNCc6ICc0N0FGJyxcclxuICAgICdIYWRlc0V4IEJyb2tlbiBGYWl0aCc6ICc0N0IyJyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIFNwZWFyJzogJzQ3QjYnLFxyXG4gICAgJ0hhZGVzRXggTWFnaWMgQ2hha3JhbSc6ICc0N0I1JyxcclxuICAgICdIYWRlc0V4IEZvcmtlZCBMaWdodG5pbmcnOiAnNDdDOScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMSc6ICc0N0YxJyxcclxuICAgICdIYWRlc0V4IERhcmsgQ3VycmVudCAyJzogJzQ3RjInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0hhZGVzRXggQ29tZXQnOiAnNDdCOScsIC8vIG1pc3NlZCB0b3dlclxyXG4gICAgJ0hhZGVzRXggQW5jaWVudCBFcnVwdGlvbic6ICc0N0QzJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAxJzogJzQ3RUMnLFxyXG4gICAgJ0hhZGVzRXggUHVyZ2F0aW9uIDInOiAnNDdFRCcsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3RyZWFtJzogJzQ3RUEnLFxyXG4gICAgJ0hhZGVzRXggRGVhZCBTcGFjZSc6ICc0N0VFJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCBJbml0aWFsJzogJzQ3QTknLFxyXG4gICAgJ0hhZGVzRXggUmF2ZW5vdXMgQXNzYXVsdCc6ICcoPzo0N0E2fDQ3QTcpJyxcclxuICAgICdIYWRlc0V4IERhcmsgRmxhbWUgMSc6ICc0N0M2JyxcclxuICAgICdIYWRlc0V4IERhcmsgRnJlZXplIDEnOiAnNDdDNCcsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAyJzogJzQ3REYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERhcmsgSUkgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnU2hhZG93IG9mIHRoZSBBbmNpZW50cycsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0RhcmsgPSBkYXRhLmhhc0RhcmsgfHwgW107XHJcbiAgICAgICAgZGF0YS5oYXNEYXJrLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERhcmsgSUknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHR5cGU6ICcyMicsIGlkOiAnNDdCQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gRG9uJ3QgYmxhbWUgcGVvcGxlIHdobyBkb24ndCBoYXZlIHRldGhlcnMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzRGFyayAmJiBkYXRhLmhhc0RhcmsuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQm9zcyBUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6IFsnSWdleW9yaG1cXCdzIFNoYWRlJywgJ0xhaGFicmVhXFwncyBTaGFkZSddLCBpZDogJzAwMEUnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbWlzdGFrZToge1xyXG4gICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogJ0Jvc3NlcyBUb28gQ2xvc2UnLFxyXG4gICAgICAgICAgZGU6ICdCb3NzZXMgenUgTmFoZScsXHJcbiAgICAgICAgICBmcjogJ0Jvc3MgdHJvcCBwcm9jaGVzJyxcclxuICAgICAgICAgIGphOiAn44Oc44K56L+R44GZ44GO44KLJyxcclxuICAgICAgICAgIGNuOiAnQk9TU+mdoOWkqui/keS6hicsXHJcbiAgICAgICAgICBrbzogJ+yrhOuTpOydtCDrhIjrrLQg6rCA6rmM7JuAJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERlYXRoIFNocmllaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0N0NCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGgpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbSBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbSBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEhhZGVzIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRHlpbmdHYXNwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMSc6ICc0MTRCJyxcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMic6ICc0MTRDJyxcclxuICAgICdIYWRlcyBEYXJrIEVydXB0aW9uJzogJzQxNTInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMSc6ICc0MTU2JyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3ByZWFkIDInOiAnNDE1NycsXHJcbiAgICAnSGFkZXMgQnJva2VuIEZhaXRoJzogJzQxNEUnLFxyXG4gICAgJ0hhZGVzIEhlbGxib3JuIFlhd3AnOiAnNDE2RicsXHJcbiAgICAnSGFkZXMgUHVyZ2F0aW9uJzogJzQxNzInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTdHJlYW0nOiAnNDE1QycsXHJcbiAgICAnSGFkZXMgQWVybyc6ICc0NTk1JyxcclxuICAgICdIYWRlcyBFY2hvIDEnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgRWNobyAyJzogJzQxNjQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSGFkZXMgTmV0aGVyIEJsYXN0JzogJzQxNjMnLFxyXG4gICAgJ0hhZGVzIFJhdmVub3VzIEFzc2F1bHQnOiAnNDE1OCcsXHJcbiAgICAnSGFkZXMgQW5jaWVudCBEYXJrbmVzcyc6ICc0NTkzJyxcclxuICAgICdIYWRlcyBEdWFsIFN0cmlrZSc6ICc0MTYyJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSW5ub2NlbmNlIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNyb3duT2ZUaGVJbW1hY3VsYXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSW5ub0V4IER1ZWwgRGVzY2VudCc6ICczRUQyJyxcclxuICAgICdJbm5vRXggUmVwcm9iYXRpb24gMSc6ICczRUUwJyxcclxuICAgICdJbm5vRXggUmVwcm9iYXRpb24gMic6ICczRUNDJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDEnOiAnM0VERScsXHJcbiAgICAnSW5ub0V4IFN3b3JkIG9mIENvbmRlbW5hdGlvbiAyJzogJzNFREYnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAxJzogJzNFRDMnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAyJzogJzNFRDQnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAzJzogJzNFRDUnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA0JzogJzNFRDYnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA1JzogJzNFRkInLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA2JzogJzNFRkMnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA3JzogJzNFRkQnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA4JzogJzNFRkUnLFxyXG4gICAgJ0lubm9FeCBIb2x5IFRyaW5pdHknOiAnM0VEQicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMSc6ICczRUQ3JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAyJzogJzNFRDgnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDMnOiAnM0VEOScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNCc6ICczRURBJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA1JzogJzNFRkYnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDYnOiAnM0YwMCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNyc6ICczRjAxJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA4JzogJzNGMDInLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDEnOiAnM0VFNicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMic6ICczRUU3JyxcclxuICAgICdJbm5vRXggR29kIFJheSAzJzogJzNFRTgnLFxyXG4gICAgJ0lubm9FeCBFeHBsb3Npb24nOiAnM0VGMCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIElubm9jZW5jZSBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNyb3duT2ZUaGVJbW1hY3VsYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vIERheWJyZWFrJzogJzNFOUQnLFxyXG4gICAgJ0lubm8gSG9seSBUcmluaXR5JzogJzNFQjMnLFxyXG5cclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDEnOiAnM0VCNicsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAyJzogJzNFQjgnLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMyc6ICczRUNCJyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDQnOiAnM0VCNycsXHJcblxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAxJzogJzNFQjEnLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAyJzogJzNFQjInLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAzJzogJzNFRjknLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSA0JzogJzNFRkEnLFxyXG5cclxuICAgICdJbm5vIEdvZCBSYXkgMSc6ICczRUJEJyxcclxuICAgICdJbm5vIEdvZCBSYXkgMic6ICczRUJFJyxcclxuICAgICdJbm5vIEdvZCBSYXkgMyc6ICczRUJGJyxcclxuICAgICdJbm5vIEdvZCBSYXkgNCc6ICczRUMwJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA1Q0NBLzVDQ0IvNUNDQywgV2F0ZXJzcG91dCA9IDVDRDFcclxuXHJcbi8vIExldmlhdGhhbiBVbnJlYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0xldmlVbiBHcmFuZCBGYWxsJzogJzVDREYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aVVuIEh5ZHJvc2hvdCc6ICc1Q0Q1JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlVbiBEcmVhZHN0b3JtJzogJzVDRDYnLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpVW4gQm9keSBTbGFtJzogJzVDRDInLCAvLyBsZXZpIHNsYW0gdGhhdCB0aWx0cyB0aGUgYm9hdFxyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDEnOiAnNUNEQicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAyJzogJzVDRTMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMyc6ICc1Q0U4JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDQnOiAnNUNFOScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlVbiBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlVbiBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpVW4gQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1Q0QyJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHRha2luZyB0d28gZGlmZmVyZW50IEhpZ2gtUG93ZXJlZCBIb21pbmcgTGFzZXJzICg0QUQ4KVxyXG4vLyBUT0RPOiBjb3VsZCBibGFtZSB0aGUgdGV0aGVyZWQgcGxheWVyIGZvciBXaGl0ZSBBZ29ueSAvIFdoaXRlIEZ1cnkgZmFpbHVyZXM/XHJcblxyXG4vLyBSdWJ5IFdlYXBvbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IEJpdCBNYWdpdGVrIFJheSc6ICc0QUQyJywgLy8gbGluZSBhb2VzIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDEnOiAnNEFEMycsIC8vIGluaXRpYWwgZXhwbG9zaW9uIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRicsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAzJzogJzREMDQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDQnOiAnNEQwNScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNSc6ICc0QUNEJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA2JzogJzRBQ0UnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFVuZGVybWluZSc6ICc0QUQwJywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFJheSc6ICc0QjAyJywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMSc6ICc0QUQ5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyJzogJzRBREEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDMnOiAnNEFERCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNCc6ICc0QURFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA1JzogJzRBREYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDYnOiAnNEFFMCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNyc6ICc0QUUxJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA4JzogJzRBRTInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDknOiAnNEFFMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTAnOiAnNEFFNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTEnOiAnNEFFNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTInOiAnNEFFNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTMnOiAnNEFFNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTQnOiAnNEFFOCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTUnOiAnNEFFOScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTYnOiAnNEFFQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTcnOiAnNEU2QicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTgnOiAnNEU2QycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTknOiAnNEU2RCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjAnOiAnNEU2RScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjEnOiAnNEU2RicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjInOiAnNEU3MCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAxJzogJzRCMDUnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDInOiAnNEIwNicsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMyc6ICc0QjA3JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biA0JzogJzRCMDgnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDUnOiAnNERPRCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggTWV0ZW9yIEJ1cnN0JzogJzRBRjInLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieUV4IEJyYWRhbWFudGUnOiAnNEUzOCcsIC8vIGhlYWRtYXJrZXJzIHdpdGggbGluZSBhb2VzXHJcbiAgICAnUnVieUV4IENvbWV0IEhlYXZ5IEltcGFjdCc6ICc0QUY2JywgLy8gbGV0dGluZyBhIHRhbmsgY29tZXQgbGFuZFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFNwaGVyZSBCdXJzdCc6ICc0QUNCJywgLy8gZXhwbG9kaW5nIHRoZSByZWQgbWluZVxyXG4gICAgJ1J1YnlFeCBMdW5hciBEeW5hbW8nOiAnNEVCMCcsIC8vIFwiZ2V0IGluXCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IElyb24gQ2hhcmlvdCc6ICc0RUIxJywgLy8gXCJnZXQgb3V0XCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IEhlYXJ0IEluIFRoZSBNYWNoaW5lJzogJzRBRkEnLCAvLyBXaGl0ZSBBZ29ueS9GdXJ5IHNrdWxsIGhpdHRpbmcgcGxheWVyc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnUnVieUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIE5lZ2F0aXZlIEF1cmEgbG9va2F3YXkgZmFpbHVyZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieUV4IEhvbWluZyBMYXNlcnMnOiAnNEFENicsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBjdXQgYW5kIHJ1blxyXG4gICAgJ1J1YnlFeCBNZXRlb3IgU3RyZWFtJzogJzRFNjgnLCAvLyBzcHJlYWQgbWFya2VycyBkdXJpbmcgUDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnUnVieUV4IFNjcmVlY2gnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRBRUUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBpbnRvIHdhbGwnLFxyXG4gICAgICAgICAgICBkZTogJ1LDvGNrc3Rvw58gaW4gZGllIFdhbmQnLFxyXG4gICAgICAgICAgICBqYTogJ+WjgeOBuOODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA6Iez5aKZJyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gUnVieSBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNpbmRlckRyaWZ0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdSdWJ5IFJhdmVuc2NsYXcnOiAnNEE5MycsIC8vIGNlbnRlcmVkIGNpcmNsZSBhb2UgZm9yIHJhdmVuc2NsYXdcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDEnOiAnNEE5QScsIC8vIGluaXRpYWwgZXhwbG9zaW9uIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAyJzogJzRCMkUnLCAvLyBmb2xsb3d1cCBoZWxpY29jbGF3IGV4cGxvc2lvbnNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDMnOiAnNEE5NCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDQnOiAnNEE5NScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDUnOiAnNEQwMicsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDYnOiAnNEQwMycsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFJ1YnkgUmF5JzogJzRBQzYnLCAvLyBmcm9udGFsIGxhc2VyXHJcbiAgICAnUnVieSBVbmRlcm1pbmUnOiAnNEE5NycsIC8vIGdyb3VuZCBhb2VzIHVuZGVyIHRoZSByYXZlbnNjbGF3IHBhdGNoZXNcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxJzogJzRFNjknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAyJzogJzRFNkEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAzJzogJzRBQTEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA0JzogJzRBQTInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA1JzogJzRBQTMnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA2JzogJzRBQTQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA3JzogJzRBQTUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA4JzogJzRBQTYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA5JzogJzRBQTcnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxMCc6ICc0QzIxJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMTEnOiAnNEMyQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgQ29tZXQgQnVyc3QnOiAnNEFCNCcsIC8vIG1ldGVvciBleHBsb2RpbmdcclxuICAgICdSdWJ5IEJyYWRhbWFudGUnOiAnNEFCQycsIC8vIGhlYWRtYXJrZXJzIHdpdGggbGluZSBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdSdWJ5IEhvbWluZyBMYXNlcic6ICc0QUM1JywgLy8gc3ByZWFkIG1hcmtlcnMgaW4gUDFcclxuICAgICdSdWJ5IE1ldGVvciBTdHJlYW0nOiAnNEU2NycsIC8vIHNwcmVhZCBtYXJrZXJzIGluIFAyXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gU2hpdmEgVW5yZWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBa2hBZmFoQW1waGl0aGVhdHJlVW5yZWFsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFFeCBJY2ljbGUgSW1wYWN0JzogJzUzN0InLFxyXG4gICAgLy8gXCJnZXQgaW5cIiBhb2VcclxuICAgICdTaGl2YUV4IFdoaXRlb3V0JzogJzUzNzYnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUV4IEdsYWNpZXIgQmFzaCc6ICc1Mzc1JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIDI3MCBkZWdyZWUgYXR0YWNrLlxyXG4gICAgJ1NoaXZhRXggR2xhc3MgRGFuY2UnOiAnNTM3OCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEhhaWxzdG9ybSBzcHJlYWQgbWFya2VyLlxyXG4gICAgJ1NoaXZhRXggSGFpbHN0b3JtJzogJzUzNkYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBMYXNlci4gIFRPRE86IG1heWJlIGJsYW1lIHRoZSBwZXJzb24gaXQncyBvbj8/XHJcbiAgICAnU2hpdmFFeCBBdmFsYW5jaGUnOiAnNTM3OScsXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gUGFydHkgc2hhcmVkIHRhbmsgYnVzdGVyLlxyXG4gICAgJ1NoaXZhRXggSWNlYnJhbmQnOiAnNTM3MycsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhRXggRGVlcCBGcmVlemUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSA1MzdBIG9uIHlvdSwgYnV0IGl0IGhhcyBhbiB1bmtub3duIG5hbWUuXHJcbiAgICAgIC8vIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGUgaW50ZXJtaXNzaW9uIGFsc28gZ2V0cyB0aGlzIGVmZmVjdCwgYnV0IGZvciBhIHNob3J0ZXIgZHVyYXRpb24uXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgPiAyMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYSBXb29kXFwncyBFbWJyYWNlJzogJzNENTAnLFxyXG4gICAgLy8gJ1RpdGFuaWEgRnJvc3QgUnVuZSc6ICczRDRFJyxcclxuICAgICdUaXRhbmlhIEdlbnRsZSBCcmVlemUnOiAnM0Y4MycsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMSc6ICczRDU1JyxcclxuICAgICdUaXRhbmlhIFB1Y2tcXCdzIFJlYnVrZSc6ICczRDU4JyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAyJzogJzNFMDMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDEnOiAnM0Q1RCcsXHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMic6ICczRDVFJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgRGl2aW5hdGlvbiBSdW5lJzogJzNENUInLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuaWFFeCBXb29kXFwncyBFbWJyYWNlJzogJzNEMkYnLFxyXG4gICAgLy8gJ1RpdGFuaWFFeCBGcm9zdCBSdW5lJzogJzNEMkInLFxyXG4gICAgJ1RpdGFuaWFFeCBHZW50bGUgQnJlZXplJzogJzNGODInLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMSc6ICczRDM5JyxcclxuICAgICdUaXRhbmlhRXggUHVja1xcJ3MgUmVidWtlJzogJzNENDMnLFxyXG4gICAgJ1RpdGFuaWFFeCBXYWxsb3AnOiAnM0QzQicsXHJcbiAgICAnVGl0YW5pYUV4IExlYWZzdG9ybSAyJzogJzNENDknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWFFeCBQaGFudG9tIFJ1bmUgMSc6ICczRDRDJyxcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDInOiAnM0Q0RCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIFRPRE86IFRoaXMgY291bGQgbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiB3aXRoIHRoZSB0ZXRoZXI/XHJcbiAgICAnVGl0YW5pYUV4IFRodW5kZXIgUnVuZSc6ICczRDI5JyxcclxuICAgICdUaXRhbmlhRXggRGl2aW5hdGlvbiBSdW5lJzogJzNENEEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaXRhbiBVbnJlYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsVW5yZWFsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhblVuIFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1OEZFJyxcclxuICAgICdUaXRhblVuIEJ1cnN0JzogJzVBREYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTGFuZHNsaWRlJzogJzVBREMnLFxyXG4gICAgJ1RpdGFuVW4gR2FvbGVyIExhbmRzbGlkZSc6ICc1OTAyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gUm9jayBCdXN0ZXInOiAnNThGNicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhblVuIE1vdW50YWluIEJ1c3Rlcic6ICc1OEY3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWVtb3JpYU1pc2VyYUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMSc6ICc0Q0QyJyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDInOiAnNENEMycsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAzJzogJzRDRDQnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgNCc6ICc0Q0Q1JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDUnOiAnNENENicsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMSc6ICc0Q0I1JyxcclxuICAgICdWYXJpc0V4IElnbmlzIEVzdCAyJzogJzRDQzUnLFxyXG4gICAgJ1ZhcmlzRXggVmVudHVzIEVzdCAxJzogJzRDQzcnLFxyXG4gICAgJ1ZhcmlzRXggVmVudHVzIEVzdCAyJzogJzRDQzgnLFxyXG4gICAgJ1ZhcmlzRXggQXNzYXVsdCBDYW5ub24nOiAnNENFNScsXHJcbiAgICAnVmFyaXNFeCBGb3J0aXVzIFJvdGF0aW5nJzogJzRDRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gRG9uJ3QgaGl0IHRoZSBzaGllbGRzIVxyXG4gICAgJ1ZhcmlzRXggUmVwYXknOiAnNENERCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgdGhlIFwicHJvdGVhblwiIGZvcnRpdXMuXHJcbiAgICAnVmFyaXNFeCBGb3J0aXVzIFByb3RlYW4nOiAnNENFNycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdWYXJpc0V4IE1hZ2l0ZWsgQnVyc3QnOiAnNENERicsXHJcbiAgICAnVmFyaXNFeCBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICc0Q0VEJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVmFyaXNFeCBUZXJtaW51cyBFc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0Q0I0JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEYxNi80RjE3KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEYxOC80RjE5LCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RjFBLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IG1pc3NpbmcgYSB0b3dlcj9cclxuXHJcbi8vIE5vdGU6IERlbGliZXJhdGVseSBub3QgaW5jbHVkaW5nIHB5cmV0aWMgZGFtYWdlIGFzIGFuIGVycm9yLlxyXG4vLyBOb3RlOiBJdCBkb2Vzbid0IGFwcGVhciB0aGF0IHRoZXJlJ3MgYW55IHdheSB0byB0ZWxsIHdobyBmYWlsZWQgdGhlIGN1dHNjZW5lLlxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MIFNvbGVtbiBDb25maXRlb3InOiAnNEYyQScsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBJbic6ICc0RjEwJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RjExJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNEInLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBJbic6ICc0RjRDJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgU2hpbmluZyBXYXZlJzogJzRGMjYnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTCBDYXV0ZXJpemUnOiAnNEYyNScsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAxJzogJzRGMUUnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBpbml0aWFsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAyJzogJzRGMUYnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgICAnV09MIEZsYXJlIEJyZWF0aCc6ICc0RjI0JyxcclxuICAgICdXT0wgRGVjaW1hdGlvbic6ICc0RjIzJyxcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTCBEZWVwIEZyZWV6ZSc6ICc0RTYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0wgVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhFJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCByZWFzb246IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRFRjcvNEVGOCh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRFRjkvNEVGQSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEVGQywgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBBYnNvbHV0ZSBIb2x5IHNob3VsZCBiZSBzaGFyZWQ/XHJcbi8vIFRPRE86IGludGVyc2VjdGluZyBicmltc3RvbmVzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTEV4IFNvbGVtbiBDb25maXRlb3InOiAnNEYwQycsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIEluJzogJzRFRjInLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEVGMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNDknLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0xFeCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEEnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IFNoaW5pbmcgV2F2ZSc6ICc0RjA4JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0xFeCBDYXV0ZXJpemUnOiAnNEYwNycsXHJcbiAgICAnV09MRXggQnJpbXN0b25lIEVhcnRoJzogJzRGMDAnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXT0xFeCBEZWVwIEZyZWV6ZSc6ICc0RTYnLCAvLyBmYWlsaW5nIEFic29sdXRlIEJsaXp6YXJkIElJSVxyXG4gICAgJ1dPTEV4IERhbWFnZSBEb3duJzogJzI3NCcsIC8vIGZhaWxpbmcgQWJzb2x1dGUgRmxhc2hcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dPTEV4IEFic29sdXRlIFN0b25lIElJSSc6ICc0RUVCJywgLy8gcHJvdGVhbiB3YXZlIGltYnVlZCBtYWdpY1xyXG4gICAgJ1dPTEV4IEZsYXJlIEJyZWF0aCc6ICc0RjA2JywgLy8gdGV0aGVyIGZyb20gc3VtbW9uZWQgYmFoYW11dHNcclxuICAgICdXT0xFeCBQZXJmZWN0IERlY2ltYXRpb24nOiAnNEYwNScsIC8vIHNtbi93YXIgcGhhc2UgbWFya2VyXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ1dvbEV4IEthdG9uIFNhbiBTaGFyZSc6ICc0RUZFJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEZGJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCByZWFzb246IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRvd2VyJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjA0JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdNaXNzZWQgVG93ZXInLFxyXG4gICAgICAgICAgZGU6ICdUdXJtIHZlcnBhc3N0JyxcclxuICAgICAgICAgIGZyOiAnVG91ciBtYW5xdcOpZScsXHJcbiAgICAgICAgICBqYTogJ+WhlOOCkui4j+OBvuOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+ayoei4qeWhlCcsXHJcbiAgICAgICAgICBrbzogJ+yepe2MkCDsi6TsiJgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRydWUgSGFsbG93ZWQgR3JvdW5kJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjQ0JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZvciBCZXJzZXJrIGFuZCBEZWVwIERhcmtzaWRlXHJcbiAgICAgIGlkOiAnV09MRXggTWlzc2VkIEludGVycnVwdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzUxNTYnLCAnNTE1OCddIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBGSVggbHVtaW5vdXMgYWV0aGVyb3BsYXNtIHdhcm5pbmcgbm90IHdvcmtpbmdcclxuLy8gVE9ETzogRklYIGRvbGwgZGVhdGggbm90IHdvcmtpbmdcclxuLy8gVE9ETzogZmFpbGluZyBoYW5kIG9mIHBhaW4vcGFydGluZyAoY2hlY2sgZm9yIGhpZ2ggZGFtYWdlPylcclxuLy8gVE9ETzogbWFrZSBzdXJlIGV2ZXJ5Ym9keSB0YWtlcyBleGFjdGx5IG9uZSBwcm90ZWFuIChyYXRoZXIgdGhhbiB3YXRjaGluZyBkb3VibGUgaGl0cylcclxuLy8gVE9ETzogdGh1bmRlciBub3QgaGl0dGluZyBleGFjdGx5IDI/XHJcbi8vIFRPRE86IHBlcnNvbiB3aXRoIHdhdGVyL3RodW5kZXIgZGVidWZmIGR5aW5nXHJcbi8vIFRPRE86IGJhZCBuaXNpIHBhc3NcclxuLy8gVE9ETzogZmFpbGVkIGdhdmVsIG1lY2hhbmljXHJcbi8vIFRPRE86IGRvdWJsZSByb2NrZXQgcHVuY2ggbm90IGhpdHRpbmcgZXhhY3RseSAyPyAob3IgdGFua3MpXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHNsdWRnZSBwdWRkbGVzIGJlZm9yZSBoaWRkZW4gbWluZT9cclxuLy8gVE9ETzogaGlkZGVuIG1pbmUgZmFpbHVyZT9cclxuLy8gVE9ETzogZmFpbHVyZXMgb2Ygb3JkYWluZWQgbW90aW9uIC8gc3RpbGxuZXNzXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzZXZlcml0eSAodGV0aGVycylcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNvbGlkYXJpdHkgKHNoYXJlZCBzZW50ZW5jZSlcclxuLy8gVE9ETzogb3JkYWluZWQgY2FwaXRhbCBwdW5pc2htZW50IGhpdHRpbmcgbm9uLXRhbmtzXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRXBpY09mQWxleGFuZGVyVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RFQSBTbHVpY2UnOiAnNDlCMScsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAxJzogJzQ4MjQnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMic6ICc0OUI1JyxcclxuICAgICdURUEgU3BpbiBDcnVzaGVyJzogJzRBNzInLFxyXG4gICAgJ1RFQSBTYWNyYW1lbnQnOiAnNDg1RicsXHJcbiAgICAnVEVBIFJhZGlhbnQgU2FjcmFtZW50JzogJzQ4ODYnLFxyXG4gICAgJ1RFQSBBbG1pZ2h0eSBKdWRnbWVudCc6ICc0ODkwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdURUEgSGF3ayBCbGFzdGVyJzogJzQ4MzAnLFxyXG4gICAgJ1RFQSBDaGFrcmFtJzogJzQ4NTUnLFxyXG4gICAgJ1RFQSBFbnVtZXJhdGlvbic6ICc0ODUwJyxcclxuICAgICdURUEgQXBvY2FseXB0aWMgUmF5JzogJzQ4NEMnLFxyXG4gICAgJ1RFQSBQcm9wZWxsZXIgV2luZCc6ICc0ODMyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDEnOiAnNDlCNicsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMic6ICc0ODI1JyxcclxuICAgICdURUEgRmx1aWQgU3dpbmcnOiAnNDlCMCcsXHJcbiAgICAnVEVBIEZsdWlkIFN0cmlrZSc6ICc0OUI3JyxcclxuICAgICdURUEgSGlkZGVuIE1pbmUnOiAnNDg1MicsXHJcbiAgICAnVEVBIEFscGhhIFN3b3JkJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBGbGFyZXRocm93ZXInOiAnNDg2QicsXHJcbiAgICAnVEVBIENoYXN0ZW5pbmcgSGVhdCc6ICc0QTgwJyxcclxuICAgICdURUEgRGl2aW5lIFNwZWFyJzogJzRBODInLFxyXG4gICAgJ1RFQSBPcmRhaW5lZCBQdW5pc2htZW50JzogJzQ4OTEnLFxyXG4gICAgLy8gT3B0aWNhbCBTcHJlYWRcclxuICAgICdURUEgSW5kaXZpZHVhbCBSZXByb2JhdGlvbic6ICc0ODhDJyxcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAvLyBPcHRpY2FsIFN0YWNrXHJcbiAgICAnVEVBIENvbGxlY3RpdmUgUmVwcm9iYXRpb24nOiAnNDg4RCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBcInRvbyBtdWNoIGx1bWlub3VzIGFldGhlcm9wbGFzbVwiXHJcbiAgICAgIC8vIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgdGFyZ2V0IGV4cGxvZGVzLCBoaXR0aW5nIG5lYXJieSBwZW9wbGVcclxuICAgICAgLy8gYnV0IGFsc28gdGhlbXNlbHZlcy5cclxuICAgICAgaWQ6ICdURUEgRXhoYXVzdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODFGJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2x1bWlub3VzIGFldGhlcm9wbGFzbScsXHJcbiAgICAgICAgICAgIGRlOiAnTHVtaW5pc3plbnRlcyDDhHRoZXJvcGxhc21hJyxcclxuICAgICAgICAgICAgZnI6ICfDiXRow6lyb3BsYXNtYSBsdW1pbmV1eCcsXHJcbiAgICAgICAgICAgIGphOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgICAgY246ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJvcHN5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEyMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGV0aGVyIFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnSmFnZCBEb2xsJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlciA9IGRhdGEuamFnZFRldGhlciB8fCB7fTtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFJlZHVjaWJsZSBDb21wbGV4aXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIHVuZGVmaW5lZCwgd2hpY2ggaXMgZmluZS5cclxuICAgICAgICAgIG5hbWU6IGRhdGEuamFnZFRldGhlciA/IGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdEb2xsIERlYXRoJyxcclxuICAgICAgICAgICAgZGU6ICdQdXBwZSBUb3QnLFxyXG4gICAgICAgICAgICBmcjogJ1BvdXDDqWUgbW9ydGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODieODvOODq+OBjOatu+OCk+OBoCcsXHJcbiAgICAgICAgICAgIGNuOiAn5rWu5aOr5b635q275LqhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIERyYWluYWdlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLnBhcnR5LmlzVGFuayhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA9IGRhdGEuaGFzVGhyb3R0bGUgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA9IGRhdGEuaGFzVGhyb3R0bGUgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGUpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBCYWxsb29uIFBvcHBpbmcuICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdURUEgT3V0YnVyc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IGZpbGUwIGZyb20gJy4vMDAtbWlzYy9idWZmcy5qcyc7XG5pbXBvcnQgZmlsZTEgZnJvbSAnLi8wMC1taXNjL2dlbmVyYWwuanMnO1xuaW1wb3J0IGZpbGUyIGZyb20gJy4vMDAtbWlzYy90ZXN0LmpzJztcbmltcG9ydCBmaWxlMyBmcm9tICcuLzAyLWFyci90cmlhbC9pZnJpdC1ubS50cyc7XG5pbXBvcnQgZmlsZTQgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tbm0udHMnO1xuaW1wb3J0IGZpbGU1IGZyb20gJy4vMDItYXJyL3RyaWFsL2xldmktZXgudHMnO1xuaW1wb3J0IGZpbGU2IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWhtLmpzJztcbmltcG9ydCBmaWxlNyBmcm9tICcuLzAyLWFyci90cmlhbC9zaGl2YS1leC50cyc7XG5pbXBvcnQgZmlsZTggZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4taG0udHMnO1xuaW1wb3J0IGZpbGU5IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLWV4LnRzJztcbmltcG9ydCBmaWxlMTAgZnJvbSAnLi8wMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkuanMnO1xuaW1wb3J0IGZpbGUxMSBmcm9tICcuLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LnRzJztcbmltcG9ydCBmaWxlMTIgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLnRzJztcbmltcG9ydCBmaWxlMTMgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC5qcyc7XG5pbXBvcnQgZmlsZTE0IGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQudHMnO1xuaW1wb3J0IGZpbGUxNSBmcm9tICcuLzAzLWh3L3JhaWQvYTEybi5qcyc7XG5pbXBvcnQgZmlsZTE2IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28udHMnO1xuaW1wb3J0IGZpbGUxNyBmcm9tICcuLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMnO1xuaW1wb3J0IGZpbGUxOCBmcm9tICcuLzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS50cyc7XG5pbXBvcnQgZmlsZTE5IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJztcbmltcG9ydCBmaWxlMjAgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMnO1xuaW1wb3J0IGZpbGUyMSBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJztcbmltcG9ydCBmaWxlMjIgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJztcbmltcG9ydCBmaWxlMjMgZnJvbSAnLi8wNC1zYi9yYWlkL28xbi50cyc7XG5pbXBvcnQgZmlsZTI0IGZyb20gJy4vMDQtc2IvcmFpZC9vMm4udHMnO1xuaW1wb3J0IGZpbGUyNSBmcm9tICcuLzA0LXNiL3JhaWQvbzNuLmpzJztcbmltcG9ydCBmaWxlMjYgZnJvbSAnLi8wNC1zYi9yYWlkL280bi50cyc7XG5pbXBvcnQgZmlsZTI3IGZyb20gJy4vMDQtc2IvcmFpZC9vNHMuanMnO1xuaW1wb3J0IGZpbGUyOCBmcm9tICcuLzA0LXNiL3JhaWQvbzdzLnRzJztcbmltcG9ydCBmaWxlMjkgZnJvbSAnLi8wNC1zYi9yYWlkL28xMnMuanMnO1xuaW1wb3J0IGZpbGUzMCBmcm9tICcuLzA0LXNiL3RyaWFsL2J5YWtrby1leC50cyc7XG5pbXBvcnQgZmlsZTMxIGZyb20gJy4vMDQtc2IvdHJpYWwvc2hpbnJ5dS50cyc7XG5pbXBvcnQgZmlsZTMyIGZyb20gJy4vMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzJztcbmltcG9ydCBmaWxlMzMgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLnRzJztcbmltcG9ydCBmaWxlMzQgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLmpzJztcbmltcG9ydCBmaWxlMzUgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzJztcbmltcG9ydCBmaWxlMzYgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzJztcbmltcG9ydCBmaWxlMzcgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2gudHMnO1xuaW1wb3J0IGZpbGUzOCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMnO1xuaW1wb3J0IGZpbGUzOSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMnO1xuaW1wb3J0IGZpbGU0MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIudHMnO1xuaW1wb3J0IGZpbGU0MSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy50cyc7XG5pbXBvcnQgZmlsZTQyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LnRzJztcbmltcG9ydCBmaWxlNDMgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC50cyc7XG5pbXBvcnQgZmlsZTQ0IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyc7XG5pbXBvcnQgZmlsZTQ1IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMnO1xuaW1wb3J0IGZpbGU0NiBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL210X2d1bGcudHMnO1xuaW1wb3J0IGZpbGU0NyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzJztcbmltcG9ydCBmaWxlNDggZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMnO1xuaW1wb3J0IGZpbGU0OSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MudHMnO1xuaW1wb3J0IGZpbGU1MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzJztcbmltcG9ydCBmaWxlNTEgZnJvbSAnLi8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUudHMnO1xuaW1wb3J0IGZpbGU1MiBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UudHMnO1xuaW1wb3J0IGZpbGU1MyBmcm9tICcuLzA1LXNoYi9yYWlkL2Uxbi50cyc7XG5pbXBvcnQgZmlsZTU0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTFzLnRzJztcbmltcG9ydCBmaWxlNTUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMm4udHMnO1xuaW1wb3J0IGZpbGU1NiBmcm9tICcuLzA1LXNoYi9yYWlkL2Uycy50cyc7XG5pbXBvcnQgZmlsZTU3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTNuLnRzJztcbmltcG9ydCBmaWxlNTggZnJvbSAnLi8wNS1zaGIvcmFpZC9lM3MudHMnO1xuaW1wb3J0IGZpbGU1OSBmcm9tICcuLzA1LXNoYi9yYWlkL2U0bi50cyc7XG5pbXBvcnQgZmlsZTYwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTRzLmpzJztcbmltcG9ydCBmaWxlNjEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNW4uanMnO1xuaW1wb3J0IGZpbGU2MiBmcm9tICcuLzA1LXNoYi9yYWlkL2U1cy5qcyc7XG5pbXBvcnQgZmlsZTYzIGZyb20gJy4vMDUtc2hiL3JhaWQvZTZuLnRzJztcbmltcG9ydCBmaWxlNjQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNnMudHMnO1xuaW1wb3J0IGZpbGU2NSBmcm9tICcuLzA1LXNoYi9yYWlkL2U3bi5qcyc7XG5pbXBvcnQgZmlsZTY2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTdzLnRzJztcbmltcG9ydCBmaWxlNjcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOG4udHMnO1xuaW1wb3J0IGZpbGU2OCBmcm9tICcuLzA1LXNoYi9yYWlkL2U4cy50cyc7XG5pbXBvcnQgZmlsZTY5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTluLnRzJztcbmltcG9ydCBmaWxlNzAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOXMudHMnO1xuaW1wb3J0IGZpbGU3MSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMG4udHMnO1xuaW1wb3J0IGZpbGU3MiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMHMudHMnO1xuaW1wb3J0IGZpbGU3MyBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMW4udHMnO1xuaW1wb3J0IGZpbGU3NCBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMXMudHMnO1xuaW1wb3J0IGZpbGU3NSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMm4udHMnO1xuaW1wb3J0IGZpbGU3NiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMnMuanMnO1xuaW1wb3J0IGZpbGU3NyBmcm9tICcuLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTc4IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlNzkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXgudHMnO1xuaW1wb3J0IGZpbGU4MCBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi50cyc7XG5pbXBvcnQgZmlsZTgxIGZyb20gJy4vMDUtc2hiL3RyaWFsL2hhZGVzLWV4LmpzJztcbmltcG9ydCBmaWxlODIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMudHMnO1xuaW1wb3J0IGZpbGU4MyBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMnO1xuaW1wb3J0IGZpbGU4NCBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMnO1xuaW1wb3J0IGZpbGU4NSBmcm9tICcuLzA1LXNoYi90cmlhbC9sZXZpLXVuLnRzJztcbmltcG9ydCBmaWxlODYgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMnO1xuaW1wb3J0IGZpbGU4NyBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyc7XG5pbXBvcnQgZmlsZTg4IGZyb20gJy4vMDUtc2hiL3RyaWFsL3NoaXZhLXVuLnRzJztcbmltcG9ydCBmaWxlODkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS50cyc7XG5pbXBvcnQgZmlsZTkwIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXgudHMnO1xuaW1wb3J0IGZpbGU5MSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbi11bi50cyc7XG5pbXBvcnQgZmlsZTkyIGZyb20gJy4vMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LnRzJztcbmltcG9ydCBmaWxlOTMgZnJvbSAnLi8wNS1zaGIvdHJpYWwvd29sLnRzJztcbmltcG9ydCBmaWxlOTQgZnJvbSAnLi8wNS1zaGIvdHJpYWwvd29sLWV4LnRzJztcbmltcG9ydCBmaWxlOTUgZnJvbSAnLi8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgeycwMC1taXNjL2J1ZmZzLmpzJzogZmlsZTAsJzAwLW1pc2MvZ2VuZXJhbC5qcyc6IGZpbGUxLCcwMC1taXNjL3Rlc3QuanMnOiBmaWxlMiwnMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzJzogZmlsZTMsJzAyLWFyci90cmlhbC90aXRhbi1ubS50cyc6IGZpbGU0LCcwMi1hcnIvdHJpYWwvbGV2aS1leC50cyc6IGZpbGU1LCcwMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMnOiBmaWxlNiwnMDItYXJyL3RyaWFsL3NoaXZhLWV4LnRzJzogZmlsZTcsJzAyLWFyci90cmlhbC90aXRhbi1obS50cyc6IGZpbGU4LCcwMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMnOiBmaWxlOSwnMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzJzogZmlsZTEwLCcwMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyc6IGZpbGUxMSwnMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS50cyc6IGZpbGUxMiwnMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMnOiBmaWxlMTMsJzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzJzogZmlsZTE0LCcwMy1ody9yYWlkL2ExMm4uanMnOiBmaWxlMTUsJzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLnRzJzogZmlsZTE2LCcwNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLnRzJzogZmlsZTE3LCcwNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUudHMnOiBmaWxlMTgsJzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyc6IGZpbGUxOSwnMDQtc2IvZHVuZ2Vvbi9zd2FsbG93c19jb21wYXNzLnRzJzogZmlsZTIwLCcwNC1zYi9kdW5nZW9uL3RlbXBsZV9vZl90aGVfZmlzdC50cyc6IGZpbGUyMSwnMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyc6IGZpbGUyMiwnMDQtc2IvcmFpZC9vMW4udHMnOiBmaWxlMjMsJzA0LXNiL3JhaWQvbzJuLnRzJzogZmlsZTI0LCcwNC1zYi9yYWlkL28zbi5qcyc6IGZpbGUyNSwnMDQtc2IvcmFpZC9vNG4udHMnOiBmaWxlMjYsJzA0LXNiL3JhaWQvbzRzLmpzJzogZmlsZTI3LCcwNC1zYi9yYWlkL283cy50cyc6IGZpbGUyOCwnMDQtc2IvcmFpZC9vMTJzLmpzJzogZmlsZTI5LCcwNC1zYi90cmlhbC9ieWFra28tZXgudHMnOiBmaWxlMzAsJzA0LXNiL3RyaWFsL3NoaW5yeXUudHMnOiBmaWxlMzEsJzA0LXNiL3RyaWFsL3N1c2Fuby1leC50cyc6IGZpbGUzMiwnMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS50cyc6IGZpbGUzMywnMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyc6IGZpbGUzNCwnMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS50cyc6IGZpbGUzNSwnMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci50cyc6IGZpbGUzNiwnMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLnRzJzogZmlsZTM3LCcwNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLnRzJzogZmlsZTM4LCcwNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LnRzJzogZmlsZTM5LCcwNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLnRzJzogZmlsZTQwLCcwNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcudHMnOiBmaWxlNDEsJzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC50cyc6IGZpbGU0MiwnMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2gudHMnOiBmaWxlNDMsJzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwudHMnOiBmaWxlNDQsJzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LnRzJzogZmlsZTQ1LCcwNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLnRzJzogZmlsZTQ2LCcwNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi50cyc6IGZpbGU0NywnMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLnRzJzogZmlsZTQ4LCcwNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLnRzJzogZmlsZTQ5LCcwNS1zaGIvZHVuZ2Vvbi90d2lubmluZy50cyc6IGZpbGU1MCwnMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLnRzJzogZmlsZTUxLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLnRzJzogZmlsZTUyLCcwNS1zaGIvcmFpZC9lMW4udHMnOiBmaWxlNTMsJzA1LXNoYi9yYWlkL2Uxcy50cyc6IGZpbGU1NCwnMDUtc2hiL3JhaWQvZTJuLnRzJzogZmlsZTU1LCcwNS1zaGIvcmFpZC9lMnMudHMnOiBmaWxlNTYsJzA1LXNoYi9yYWlkL2Uzbi50cyc6IGZpbGU1NywnMDUtc2hiL3JhaWQvZTNzLnRzJzogZmlsZTU4LCcwNS1zaGIvcmFpZC9lNG4udHMnOiBmaWxlNTksJzA1LXNoYi9yYWlkL2U0cy5qcyc6IGZpbGU2MCwnMDUtc2hiL3JhaWQvZTVuLmpzJzogZmlsZTYxLCcwNS1zaGIvcmFpZC9lNXMuanMnOiBmaWxlNjIsJzA1LXNoYi9yYWlkL2U2bi50cyc6IGZpbGU2MywnMDUtc2hiL3JhaWQvZTZzLnRzJzogZmlsZTY0LCcwNS1zaGIvcmFpZC9lN24uanMnOiBmaWxlNjUsJzA1LXNoYi9yYWlkL2U3cy50cyc6IGZpbGU2NiwnMDUtc2hiL3JhaWQvZThuLnRzJzogZmlsZTY3LCcwNS1zaGIvcmFpZC9lOHMudHMnOiBmaWxlNjgsJzA1LXNoYi9yYWlkL2U5bi50cyc6IGZpbGU2OSwnMDUtc2hiL3JhaWQvZTlzLnRzJzogZmlsZTcwLCcwNS1zaGIvcmFpZC9lMTBuLnRzJzogZmlsZTcxLCcwNS1zaGIvcmFpZC9lMTBzLnRzJzogZmlsZTcyLCcwNS1zaGIvcmFpZC9lMTFuLnRzJzogZmlsZTczLCcwNS1zaGIvcmFpZC9lMTFzLnRzJzogZmlsZTc0LCcwNS1zaGIvcmFpZC9lMTJuLnRzJzogZmlsZTc1LCcwNS1zaGIvcmFpZC9lMTJzLmpzJzogZmlsZTc2LCcwNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXgudHMnOiBmaWxlNzcsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi50cyc6IGZpbGU3OCwnMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LnRzJzogZmlsZTc5LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24udHMnOiBmaWxlODAsJzA1LXNoYi90cmlhbC9oYWRlcy1leC5qcyc6IGZpbGU4MSwnMDUtc2hiL3RyaWFsL2hhZGVzLnRzJzogZmlsZTgyLCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LnRzJzogZmlsZTgzLCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLnRzJzogZmlsZTg0LCcwNS1zaGIvdHJpYWwvbGV2aS11bi50cyc6IGZpbGU4NSwnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LnRzJzogZmlsZTg2LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24udHMnOiBmaWxlODcsJzA1LXNoYi90cmlhbC9zaGl2YS11bi50cyc6IGZpbGU4OCwnMDUtc2hiL3RyaWFsL3RpdGFuaWEudHMnOiBmaWxlODksJzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LnRzJzogZmlsZTkwLCcwNS1zaGIvdHJpYWwvdGl0YW4tdW4udHMnOiBmaWxlOTEsJzA1LXNoYi90cmlhbC92YXJpcy1leC50cyc6IGZpbGU5MiwnMDUtc2hiL3RyaWFsL3dvbC50cyc6IGZpbGU5MywnMDUtc2hiL3RyaWFsL3dvbC1leC50cyc6IGZpbGU5NCwnMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci5qcyc6IGZpbGU5NSx9OyJdLCJzb3VyY2VSb290IjoiIn0=