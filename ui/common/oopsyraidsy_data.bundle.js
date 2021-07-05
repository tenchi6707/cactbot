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

const effectCollectSeconds = 2.0; // args: triggerId, netRegex, field, type, ignoreSelf

const missedFunc = args => {
  return {
    // Sure, not all of these are "buffs" per se, but they're all in the buffs file.
    id: 'Buff ' + args.triggerId,
    netRegex: args.netRegex,
    condition: (_evt, data, matches) => {
      const sourceId = matches.sourceId.toUpperCase();
      if (data.party.partyIds.includes(sourceId)) return true;

      if (data.petIdToOwnerId) {
        const ownerId = data.petIdToOwnerId[sourceId];
        if (ownerId && data.party.partyIds.includes(ownerId)) return true;
      }

      return false;
    },
    collectSeconds: args.collectSeconds,
    mistake: (_allEvents, data, allMatches) => {
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
    }
  };
};

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
  missedMitigationBuff({
    id: 'Collective Unconscious',
    effectId: '351',
    collectSeconds: 10
  }), missedMitigationBuff({
    id: 'Passage of Arms',
    effectId: '498',
    ignoreSelf: true,
    collectSeconds: 10
  }), missedMitigationBuff({
    id: 'Divine Veil',
    effectId: '2D7',
    ignoreSelf: true
  }), missedMitigationAbility({
    id: 'Heart Of Light',
    abilityId: '3F20'
  }), missedMitigationAbility({
    id: 'Dark Missionary',
    abilityId: '4057'
  }), missedMitigationAbility({
    id: 'Shake It Off',
    abilityId: '1CDC'
  }), // 3F44 is the correct Quadruple Technical Finish, others are Dinky Technical Finish.
  missedDamageAbility({
    id: 'Technical Finish',
    abilityId: '3F4[1-4]'
  }), missedDamageAbility({
    id: 'Divination',
    abilityId: '40A8'
  }), missedDamageAbility({
    id: 'Brotherhood',
    abilityId: '1CE4'
  }), missedDamageAbility({
    id: 'Battle Litany',
    abilityId: 'DE5'
  }), missedDamageAbility({
    id: 'Embolden',
    abilityId: '1D60'
  }), missedDamageAbility({
    id: 'Battle Voice',
    abilityId: '76',
    ignoreSelf: true
  }), // Too noisy (procs every three seconds, and bards often off doing mechanics).
  // missedDamageBuff({ id: 'Wanderer\'s Minuet', effectId: '8A8', ignoreSelf: true }),
  // missedDamageBuff({ id: 'Mage\'s Ballad', effectId: '8A9', ignoreSelf: true }),
  // missedDamageBuff({ id: 'Army\'s Paeon', effectId: '8AA', ignoreSelf: true }),
  missedMitigationAbility({
    id: 'Troubadour',
    abilityId: '1CED'
  }), missedMitigationAbility({
    id: 'Tactician',
    abilityId: '41F9'
  }), missedMitigationAbility({
    id: 'Shield Samba',
    abilityId: '3E8C'
  }), missedMitigationAbility({
    id: 'Mantra',
    abilityId: '41'
  }), missedDamageAbility({
    id: 'Devotion',
    abilityId: '1D1A'
  }), // Maybe using a healer LB1/LB2 should be an error for the healer. O:)
  // missedHeal({ id: 'Healing Wind', abilityId: 'CE' }),
  // missedHeal({ id: 'Breath of the Earth', abilityId: 'CF' }),
  missedHeal({
    id: 'Medica',
    abilityId: '7C'
  }), missedHeal({
    id: 'Medica II',
    abilityId: '85'
  }), missedHeal({
    id: 'Afflatus Rapture',
    abilityId: '4096'
  }), missedHeal({
    id: 'Temperance',
    abilityId: '751'
  }), missedHeal({
    id: 'Plenary Indulgence',
    abilityId: '1D09'
  }), missedHeal({
    id: 'Pulse of Life',
    abilityId: 'D0'
  }), missedHeal({
    id: 'Succor',
    abilityId: 'BA'
  }), missedHeal({
    id: 'Indomitability',
    abilityId: 'DFF'
  }), missedHeal({
    id: 'Deployment Tactics',
    abilityId: 'E01'
  }), missedHeal({
    id: 'Whispering Dawn',
    abilityId: '323'
  }), missedHeal({
    id: 'Fey Blessing',
    abilityId: '40A0'
  }), missedHeal({
    id: 'Consolation',
    abilityId: '40A3'
  }), missedHeal({
    id: 'Angel\'s Whisper',
    abilityId: '40A6'
  }), missedMitigationAbility({
    id: 'Fey Illumination',
    abilityId: '325'
  }), missedMitigationAbility({
    id: 'Seraphic Illumination',
    abilityId: '40A7'
  }), missedHeal({
    id: 'Angel Feathers',
    abilityId: '1097'
  }), missedHeal({
    id: 'Helios',
    abilityId: 'E10'
  }), missedHeal({
    id: 'Aspected Helios',
    abilityId: 'E11'
  }), missedHeal({
    id: 'Aspected Helios',
    abilityId: '3200'
  }), missedHeal({
    id: 'Celestial Opposition',
    abilityId: '40A9'
  }), missedHeal({
    id: 'Astral Stasis',
    abilityId: '1098'
  }), missedHeal({
    id: 'White Wind',
    abilityId: '2C8E'
  }), missedHeal({
    id: 'Gobskin',
    abilityId: '4780'
  }), // TODO: export all of these missed functions into their own helper
  // and then add this to the Delubrum Reginae files directly.
  missedMitigationAbility({
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
    abilityRegex: '8E0',
    condition: (e, data) => data.IsPlayerId(e.attackerId),
    mistake: e => {
      return {
        type: 'warn',
        blame: e.attackerName,
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
    damageRegex: '35',
    condition: (e, data) => {
      if (e.attackerName !== data.me) return false;
      const strikingDummyNames = ['Striking Dummy', 'Mannequin d\'entraînement', '木人', // Striking Dummy called `木人` in CN as well as JA
      '나무인형' // FIXME: add other languages here
      ];
      return strikingDummyNames.includes(e.targetName);
    },
    mistake: (e, data) => {
      data.bootCount = data.bootCount || 0;
      data.bootCount++;
      const text = e.abilityName + ' (' + data.bootCount + '): ' + e.damageStr;
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
    collectSeconds: 5,
    mistake: (events, data) => {
      // When collectSeconds is specified, events are passed as an array.
      const pokes = events.length; // 1 poke at a time is fine, but more than one inside of
      // collectSeconds is (OBVIOUSLY) a mistake.

      if (pokes <= 1) return;
      const text = {
        en: 'Too many pokes (' + pokes + ')',
        de: 'Zu viele Piekser (' + pokes + ')',
        fr: 'Trop de touches (' + pokes + ')',
        ja: 'いっぱいつついた (' + pokes + ')',
        cn: '戳太多下啦 (' + pokes + ')',
        ko: '너무 많이 찌름 (' + pokes + '번)'
      };
      return {
        type: 'fail',
        blame: data.me,
        text: text
      };
    }
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
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
    damageRegex: '195[AB]',
    condition: (e, data) => data.hasImp[e.targetName],
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
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
    damageRegex: '1956',
    condition: e => {
      // Always hits target, but if correctly resolved will deal 0 damage
      return e.damage > 0;
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
      };
    }
  }, {
    id: 'GubalHm Tornado',
    damageRegex: '195[78]',
    condition: e => {
      // Always hits target, but if correctly resolved will deal 0 damage
      return e.damage > 0;
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: '1AF2',
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
      };
    }
  }, {
    id: 'O2N Earthquake',
    damageRegex: '2515',
    condition: e => {
      // This deals damage only to non-floating targets.
      return e.damage > 0;
    },
    mistake: e => {
      return {
        type: 'warn',
        name: e.targetName,
        text: e.abilityName
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
    abilityRegex: '2466',
    condition: (e, data) => {
      // We DO want to be hit by Toad/Ribbit if the next cast of The Game
      // is 4x toad panels.
      return !(data.phaseNumber === 3 && data.gameCount % 2 === 0) && e.targetId !== 'E0000000';
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
      };
    }
  }, {
    // There's a lot we could do to track exactly how the player failed The Game.
    // Why overthink Normal mode, however?
    id: 'O3N The Game',
    // Guess what you just lost?
    abilityRegex: '246D',
    condition: e => {
      // If the player takes no damage, they did the mechanic correctly.
      return e.damage > 0;
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
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
    deathReason: e => {
      return {
        type: 'fail',
        name: e.target,
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
    id: 'O4N Vacuum Wave',
    // Short knockback from Exdeath
    damageRegex: '24B8',
    deathReason: e => {
      return {
        type: 'fail',
        name: e.targetName,
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
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
    abilityRegex: '2408',
    run: (_e, data) => {
      data.isDecisiveBattleElement = true;
    }
  }, {
    id: 'O4S1 Vacuum Wave',
    abilityRegex: '23FE',
    run: (_e, data) => {
      data.isDecisiveBattleElement = false;
    }
  }, {
    id: 'O4S2 Almagest',
    abilityRegex: '2417',
    run: (_e, data) => {
      data.isNeoExdeath = true;
    }
  }, {
    id: 'O4S2 Blizzard III',
    damageRegex: '23F8',
    condition: (e, data) => {
      // Ignore unavoidable raid aoe Blizzard III.
      return data.IsPlayerId(e.targetId) && !data.isDecisiveBattleElement;
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
      };
    }
  }, {
    id: 'O4S2 Thunder III',
    damageRegex: '23FD',
    condition: (e, data) => {
      // Only consider this during random mechanic after decisive battle.
      return data.IsPlayerId(e.targetId) && data.isDecisiveBattleElement;
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: '242E',
    condition: (e, data) => data.IsPlayerId(e.targetId),
    mistake: (e, data) => {
      const text = e.abilityName + ' => ' + data.ShortName(e.targetName);
      return {
        type: 'fail',
        blame: e.attackerName,
        text: text
      };
    }
  }, {
    id: 'O4S2 Double Attack',
    damageRegex: '241C',
    condition: (e, data) => data.IsPlayerId(e.targetId),
    collectSeconds: 0.5,
    mistake: e => {
      if (e.length <= 2) return; // Hard to know who should be in this and who shouldn't, but
      // it should never hit 3 people.

      return {
        type: 'fail',
        fullText: e[0].abilityName + ' x ' + e.length
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
    abilityRegex: '2AB5',
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: ['332E', '333E', '333F'],
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
    damageRegex: '27EC',
    condition: (e, data) => data.IsPlayerId(e.targetId),
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
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
    damageRegex: '1F8B',
    deathReason: e => {
      return {
        type: 'fail',
        name: e.targetName,
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
    damageRegex: '1F90',
    deathReason: e => {
      return {
        type: 'fail',
        name: e.targetName,
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
      };
    }
  }, {
    // Featherlance explosion.  It seems like the person who pops it is the
    // first person listed damage-wise, so they are likely the culprit.
    id: 'UWU Featherlance',
    damageRegex: '2B43',
    collectSeconds: 0.5,
    suppressSeconds: 5,
    mistake: e => {
      return {
        type: 'fail',
        blame: e[0].targetName,
        text: e[0].attackerName
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
    damageRegex: '26AB',
    condition: (e, data) => {
      // Instant death uses '36' as its flags, differentiating
      // from the explosion damage you take when somebody else
      // pops one.
      return data.IsPlayerId(e.targetId) && e.flags === '36';
    },
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
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
    damageRegex: '26B9',
    condition: (e, data) => data.IsPlayerId(e.targetId),
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
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
    damageRegex: '26C8',
    condition: (e, data) => data.IsPlayerId(e.targetId),
    mistake: e => {
      // It's hard to assign blame for lightning.  The debuffs
      // go out and then explode in order, but the attacker is
      // the dragon and not the player.
      return {
        type: 'warn',
        name: e.targetName,
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
    mistake: e => {
      return {
        type: 'warn',
        blame: e.target,
        text: e.effect
      };
    }
  }, {
    id: 'UCU Sludge',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '11F'
    }),
    mistake: e => {
      return {
        type: 'fail',
        blame: e.target,
        text: e.effect
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
    deathReason: (e, data, matches) => {
      if (!data.hasDoom || !data.hasDoom[matches.target]) return;
      let reason;
      if (e.durationSeconds < 9) reason = matches.effect + ' #1';else if (e.durationSeconds < 14) reason = matches.effect + ' #2';else reason = matches.effect + ' #3';
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
    damageRegex: '5207',
    // This is zero damage if you are in the crater.
    condition: e => e.damage > 0,
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
    damageRegex: ['565A', '565B', '57FD', '57FE', '5B86', '5B87', '59D2', '5D93'],
    condition: e => e.flags.slice(-2) === '03',
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
    damageRegex: ['5827', '5828', '5B6C', '5B6D', '5BB6', '5BB7', '5B88', '5B89'],
    condition: e => e.flags.slice(-2) === '03',
    mistake: (_e, _data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'DelubrumSav Golem Compaction',
    abilityRegex: '5746',
    mistake: (_e, _data, matches) => {
      return {
        type: 'fail',
        fullText: `${matches.source}: ${matches.ability}`
      };
    }
  }, {
    id: 'DelubrumSav Slime Sanguine Fusion',
    abilityRegex: '554D',
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
    damageRegex: '3E3D',
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: {
          en: 'Booped',
          de: e.abilityName,
          fr: 'Malus de dégâts',
          ja: e.abilityName,
          cn: e.abilityName,
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
    damageRegex: '3E51',
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: {
          en: 'Booped',
          de: e.abilityName,
          fr: 'Malus de dégâts',
          ja: e.abilityName,
          cn: '攻击伤害降低',
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
    damageRegex: '411E',
    condition: (e, data) => data.faultLineTarget !== e.targetName,
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: {
          en: 'Run Over',
          de: e.abilityName,
          fr: 'A été écrasé(e)',
          ja: e.abilityName,
          cn: e.abilityName,
          ko: e.abilityName
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
    damageRegex: '4B9A',
    condition: (e, data) => !data.hasOrb[e.targetName],
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: {
          en: e.abilityName + ' (no orb)',
          de: e.abilityName + ' (kein Orb)',
          fr: e.abilityName + '(pas d\'orbe)',
          ja: e.abilityName + '(雷玉無し)',
          cn: e.abilityName + '(没吃球)'
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
    damageRegex: '4B9D',
    suppressSeconds: 30,
    mistake: (e, data) => {
      for (const m of data.cloudMarkers) {
        return {
          type: 'fail',
          blame: data.cloudMarkers[m],
          text: {
            en: e.abilityName + '(clouds too close)',
            de: e.abilityName + '(Wolken zu nahe)',
            fr: e.abilityName + '(nuages trop proches)',
            ja: e.abilityName + '(雲近すぎ)',
            cn: e.abilityName + '(雷云重叠)'
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
    damageRegex: '4BB7',
    condition: (e, data) => !data.hasOrb || !data.hasOrb[e.targetName],
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: noOrb(e.abilityName)
      };
    }
  }, {
    id: 'E5S Volt Strike Orb',
    damageRegex: '4BC3',
    condition: (e, data) => !data.hasOrb || !data.hasOrb[e.targetName],
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: noOrb(e.abilityName)
      };
    }
  }, {
    id: 'E5S Deadly Discharge Big Knockback',
    damageRegex: '4BB2',
    condition: (e, data) => !data.hasOrb || !data.hasOrb[e.targetName],
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: noOrb(e.abilityName)
      };
    }
  }, {
    id: 'E5S Lightning Bolt',
    damageRegex: '4BB9',
    condition: (e, data) => {
      // Having a non-idempotent condition function is a bit <_<
      // Only consider lightning bolt damage if you have a debuff to clear.
      if (!data.hated || !data.hated[e.targetName]) return true;
      delete data.hated[e.targetName];
      return false;
    },
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: '4BBA',
    suppressSeconds: 30,
    mistake: (e, data) => {
      for (const m of data.cloudMarkers) {
        return {
          type: 'fail',
          blame: data.cloudMarkers[m],
          text: {
            en: e.abilityName + '(clouds too close)',
            de: e.abilityName + '(Wolken zu nahe)',
            fr: e.abilityName + '(nuages trop proches)',
            ja: e.abilityName + '(雲近すぎ)',
            cn: e.abilityName + '(雷云重叠)'
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
    damageRegex: ['4C3E', '4C40', '4C22', '4C3C', '4E63'],
    condition: (e, data) => {
      return !data.hasUmbral || !data.hasUmbral[e.targetName];
    },
    mistake: (e, data) => {
      if (data.hasAstral && data.hasAstral[e.targetName]) return {
        type: 'fail',
        blame: e.targetName,
        text: wrongBuff(e.abilityName)
      };
      return {
        type: 'warn',
        blame: e.targetName,
        text: noBuff(e.abilityName)
      };
    }
  }, {
    id: 'E7N Darks\'s Course',
    damageRegex: ['4C3D', '4C23', '4C41', '4C43'],
    condition: (e, data) => {
      return !data.hasAstral || !data.hasAstral[e.targetName];
    },
    mistake: (e, data) => {
      if (data.hasUmbral && data.hasUmbral[e.targetName]) return {
        type: 'fail',
        blame: e.targetName,
        text: wrongBuff(e.abilityName)
      }; // This case is probably impossible, as the debuff ticks after death,
      // but leaving it here in case there's some rez or disconnect timing
      // that could lead to this.

      return {
        type: 'warn',
        blame: e.targetName,
        text: noBuff(e.abilityName)
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
    abilityRegex: '4C6E',
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: ['4C62', '4C63', '4C64', '4C5B', '4C5F'],
    condition: (e, data) => {
      return !data.hasUmbral || !data.hasUmbral[e.targetName];
    },
    mistake: (e, data) => {
      if (data.hasAstral && data.hasAstral[e.targetName]) return {
        type: 'fail',
        blame: e.targetName,
        text: e7s_wrongBuff(e.abilityName)
      };
      return {
        type: 'warn',
        blame: e.targetName,
        text: e7s_noBuff(e.abilityName)
      };
    }
  }, {
    id: 'E7S Darks\'s Course',
    damageRegex: ['4C65', '4C66', '4C67', '4C5A', '4C60'],
    condition: (e, data) => {
      return !data.hasAstral || !data.hasAstral[e.targetName];
    },
    mistake: (e, data) => {
      if (data.hasUmbral && data.hasUmbral[e.targetName]) return {
        type: 'fail',
        blame: e.targetName,
        text: e7s_wrongBuff(e.abilityName)
      }; // This case is probably impossible, as the debuff ticks after death,
      // but leaving it here in case there's some rez or disconnect timing
      // that could lead to this.

      return {
        type: 'warn',
        blame: e.targetName,
        text: e7s_noBuff(e.abilityName)
      };
    }
  }, {
    id: 'E7S Crusade Knockback',
    // 4C76 is the knockback damage, 4C58 is the damage for standing on the puck.
    damageRegex: '4C76',
    deathReason: e => {
      return {
        type: 'fail',
        name: e.targetName,
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
    damageRegex: '4DD8',
    deathReason: e => {
      return {
        type: 'fail',
        name: e.targetName,
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
    abilityRegex: '4D85',
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: '5615',
    condition: e => e.type !== '15' && e.damage > 0,
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
    damageRegex: '5612',
    condition: e => e.damage > 0,
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
    damageRegex: ['572A', '5B27'],
    condition: e => e.damage > 0,
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
    damageRegex: '4E5A',
    condition: e => e.damage > 0,
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
    damageRegex: '58D2',
    condition: e => e.damage > 0,
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
    damageRegex: '47BA',
    condition: (e, data) => {
      // Don't blame people who don't have tethers.
      return e.type !== '15' && data.me in data.hasDark;
    },
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: '47CB',
    condition: e => e.damage > 0,
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
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
    damageRegex: '4CB4',
    suppressSeconds: 1,
    mistake: e => {
      return {
        type: 'warn',
        blame: e.targetName,
        text: e.abilityName
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
    deathReason: (e, _data, matches) => {
      return {
        type: 'fail',
        name: e.target,
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
    deathReason: (e, _data, matches) => {
      return {
        type: 'fail',
        name: e.target,
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
    // Balloon Popping.  It seems like the person who pops it is the
    // first person listed damage-wise, so they are likely the culprit.
    id: 'TEA Outburst',
    damageRegex: '482A',
    collectSeconds: 0.5,
    suppressSeconds: 5,
    mistake: e => {
      return {
        type: 'fail',
        blame: e[0].targetName,
        text: e[0].attackerName
      };
    }
  }, {
    // "too much luminous aetheroplasm"
    // When this happens, the target explodes, hitting nearby people
    // but also themselves.
    id: 'TEA Exhaust',
    damageRegex: '481F',
    condition: e => e.targetName === e.attackerName,
    mistake: e => {
      return {
        type: 'fail',
        blame: e.targetName,
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
    damageRegex: '4821',
    mistake: (e, data) => {
      return {
        type: 'fail',
        // This may be undefined, which is fine.
        name: data.jagdTether ? data.jagdTether[e.attackerId] : undefined,
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
    damageRegex: '4827',
    condition: (e, data) => {
      // TODO: remove this when ngld overlayplugin is the default
      if (!data.party.partyNames.length) return false;
      return data.IsPlayerId(e.targetId) && !data.party.isTank(e.targetName);
    },
    mistake: e => {
      return {
        type: 'fail',
        name: e.targetName,
        text: e.abilityName
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
  }]
});
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/oopsy_manifest.txt

































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.js': buffs,'00-misc/general.js': general,'00-misc/test.js': test,'02-arr/trial/ifrit-nm.js': ifrit_nm,'02-arr/trial/titan-nm.js': titan_nm,'02-arr/trial/levi-ex.js': levi_ex,'02-arr/trial/shiva-hm.js': shiva_hm,'02-arr/trial/shiva-ex.js': shiva_ex,'02-arr/trial/titan-hm.js': titan_hm,'02-arr/trial/titan-ex.js': titan_ex,'03-hw/alliance/weeping_city.js': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.js': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.js': fractal_continuum,'03-hw/dungeon/gubal_library_hard.js': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.js': sohm_al_hard,'03-hw/raid/a12n.js': a12n,'04-sb/dungeon/ala_mhigo.js': ala_mhigo,'04-sb/dungeon/bardams_mettle.js': bardams_mettle,'04-sb/dungeon/kugane_castle.js': kugane_castle,'04-sb/dungeon/st_mocianne_hard.js': st_mocianne_hard,'04-sb/dungeon/swallows_compass.js': swallows_compass,'04-sb/dungeon/temple_of_the_fist.js': temple_of_the_fist,'04-sb/dungeon/the_burn.js': the_burn,'04-sb/raid/o1n.js': o1n,'04-sb/raid/o2n.js': o2n,'04-sb/raid/o3n.js': o3n,'04-sb/raid/o4n.js': o4n,'04-sb/raid/o4s.js': o4s,'04-sb/raid/o7s.js': o7s,'04-sb/raid/o12s.js': o12s,'04-sb/trial/byakko-ex.js': byakko_ex,'04-sb/trial/shinryu.js': shinryu,'04-sb/trial/susano-ex.js': susano_ex,'04-sb/ultimate/ultima_weapon_ultimate.js': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.js': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.js': the_copied_factory,'05-shb/alliance/the_puppets_bunker.js': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.js': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.js': akadaemia_anyder,'05-shb/dungeon/amaurot.js': amaurot,'05-shb/dungeon/anamnesis_anyder.js': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.js': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.js': heroes_gauntlet,'05-shb/dungeon/holminster_switch.js': holminster_switch,'05-shb/dungeon/malikahs_well.js': malikahs_well,'05-shb/dungeon/matoyas_relict.js': matoyas_relict,'05-shb/dungeon/mt_gulg.js': mt_gulg,'05-shb/dungeon/paglthan.js': paglthan,'05-shb/dungeon/qitana_ravel.js': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.js': the_grand_cosmos,'05-shb/dungeon/twinning.js': twinning,'05-shb/eureka/delubrum_reginae.js': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.js': delubrum_reginae_savage,'05-shb/raid/e1n.js': e1n,'05-shb/raid/e1s.js': e1s,'05-shb/raid/e2n.js': e2n,'05-shb/raid/e2s.js': e2s,'05-shb/raid/e3n.js': e3n,'05-shb/raid/e3s.js': e3s,'05-shb/raid/e4n.js': e4n,'05-shb/raid/e4s.js': e4s,'05-shb/raid/e5n.js': e5n,'05-shb/raid/e5s.js': e5s,'05-shb/raid/e6n.js': e6n,'05-shb/raid/e6s.js': e6s,'05-shb/raid/e7n.js': e7n,'05-shb/raid/e7s.js': e7s,'05-shb/raid/e8n.js': e8n,'05-shb/raid/e8s.js': e8s,'05-shb/raid/e9n.js': e9n,'05-shb/raid/e9s.js': e9s,'05-shb/raid/e10n.js': e10n,'05-shb/raid/e10s.js': e10s,'05-shb/raid/e11n.js': e11n,'05-shb/raid/e11s.js': e11s,'05-shb/raid/e12n.js': e12n,'05-shb/raid/e12s.js': e12s,'05-shb/trial/diamond_weapon-ex.js': diamond_weapon_ex,'05-shb/trial/diamond_weapon.js': diamond_weapon,'05-shb/trial/emerald_weapon-ex.js': emerald_weapon_ex,'05-shb/trial/emerald_weapon.js': emerald_weapon,'05-shb/trial/hades-ex.js': hades_ex,'05-shb/trial/hades.js': hades,'05-shb/trial/innocence-ex.js': innocence_ex,'05-shb/trial/innocence.js': innocence,'05-shb/trial/levi-un.js': levi_un,'05-shb/trial/ruby_weapon-ex.js': ruby_weapon_ex,'05-shb/trial/ruby_weapon.js': ruby_weapon,'05-shb/trial/shiva-un.js': shiva_un,'05-shb/trial/titania.js': titania,'05-shb/trial/titania-ex.js': titania_ex,'05-shb/trial/titan-un.js': titan_un,'05-shb/trial/varis-ex.js': varis_ex,'05-shb/trial/wol.js': wol,'05-shb/trial/wol-ex.js': wol_ex,'05-shb/ultimate/the_epic_of_alexander.js': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6WyJhYmlsaXR5Q29sbGVjdFNlY29uZHMiLCJlZmZlY3RDb2xsZWN0U2Vjb25kcyIsIm1pc3NlZEZ1bmMiLCJhcmdzIiwiaWQiLCJ0cmlnZ2VySWQiLCJuZXRSZWdleCIsImNvbmRpdGlvbiIsIl9ldnQiLCJkYXRhIiwibWF0Y2hlcyIsInNvdXJjZUlkIiwidG9VcHBlckNhc2UiLCJwYXJ0eSIsInBhcnR5SWRzIiwiaW5jbHVkZXMiLCJwZXRJZFRvT3duZXJJZCIsIm93bmVySWQiLCJjb2xsZWN0U2Vjb25kcyIsIm1pc3Rha2UiLCJfYWxsRXZlbnRzIiwiYWxsTWF0Y2hlcyIsInBhcnR5TmFtZXMiLCJnb3RCdWZmTWFwIiwibmFtZSIsImZpcnN0TWF0Y2giLCJzb3VyY2VOYW1lIiwic291cmNlIiwicGV0SWQiLCJvd25lck5hbWUiLCJuYW1lRnJvbUlkIiwiY29uc29sZSIsImVycm9yIiwiaWdub3JlU2VsZiIsInRoaW5nTmFtZSIsImZpZWxkIiwidGFyZ2V0IiwibWlzc2VkIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsIngiLCJsZW5ndGgiLCJ0eXBlIiwiYmxhbWUiLCJ0ZXh0IiwiZW4iLCJtYXAiLCJTaG9ydE5hbWUiLCJqb2luIiwiZGUiLCJmciIsImphIiwiY24iLCJrbyIsIm1pc3NlZE1pdGlnYXRpb25CdWZmIiwiZWZmZWN0SWQiLCJKU09OIiwic3RyaW5naWZ5IiwiTmV0UmVnZXhlcyIsIm1pc3NlZERhbWFnZUFiaWxpdHkiLCJhYmlsaXR5SWQiLCJtaXNzZWRIZWFsIiwibWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkiLCJ6b25lSWQiLCJab25lSWQiLCJ0cmlnZ2VycyIsInJ1biIsIl9lIiwiX2RhdGEiLCJsb3N0Rm9vZCIsImluQ29tYmF0IiwiYWJpbGl0eVJlZ2V4IiwiZSIsIklzUGxheWVySWQiLCJhdHRhY2tlcklkIiwiYXR0YWNrZXJOYW1lIiwibGluZSIsIm5ldFJlZ2V4RnIiLCJuZXRSZWdleEphIiwibmV0UmVnZXhDbiIsIm5ldFJlZ2V4S28iLCJtZSIsImZ1bGxUZXh0IiwiZGFtYWdlUmVnZXgiLCJzdHJpa2luZ0R1bW15TmFtZXMiLCJ0YXJnZXROYW1lIiwiYm9vdENvdW50IiwiYWJpbGl0eU5hbWUiLCJkYW1hZ2VTdHIiLCJlZmZlY3QiLCJzdXBwcmVzc1NlY29uZHMiLCJldmVudHMiLCJwb2tlcyIsImRhbWFnZVdhcm4iLCJzaGFyZVdhcm4iLCJkYW1hZ2VGYWlsIiwiZ2FpbnNFZmZlY3RXYXJuIiwiZ2FpbnNFZmZlY3RGYWlsIiwiZGVhdGhSZWFzb24iLCJyZWFzb24iLCJzaGFyZUZhaWwiLCJzZWVuRGlhbW9uZER1c3QiLCJzb2xvV2FybiIsInBhcnNlRmxvYXQiLCJkdXJhdGlvbiIsInpvbWJpZSIsImFiaWxpdHkiLCJzaGllbGQiLCJoYXNJbXAiLCJkYW1hZ2UiLCJhc3NhdWx0IiwicHVzaCIsImRlbGF5U2Vjb25kcyIsImFiaWxpdHlXYXJuIiwiZmxhZ3MiLCJzdWJzdHIiLCJzb2xvRmFpbCIsImNhcHR1cmUiLCJuZXRSZWdleERlIiwicGhhc2VOdW1iZXIiLCJpbml0aWFsaXplZCIsImdhbWVDb3VudCIsInRhcmdldElkIiwiaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQiLCJpc05lb0V4ZGVhdGgiLCJoYXNCZXlvbmREZWF0aCIsInZ1bG4iLCJoYXNEb29tIiwiZHVyYXRpb25TZWNvbmRzIiwic2xpY2UiLCJmYXVsdExpbmVUYXJnZXQiLCJoYXNPcmIiLCJjbG91ZE1hcmtlcnMiLCJtIiwibm9PcmIiLCJzdHIiLCJoYXRlZCIsIndyb25nQnVmZiIsIm5vQnVmZiIsImhhc0FzdHJhbCIsImhhc1VtYnJhbCIsImZpcnN0SGVhZG1hcmtlciIsInBhcnNlSW50IiwiZ2V0SGVhZG1hcmtlcklkIiwiZGVjT2Zmc2V0IiwidG9TdHJpbmciLCJwYWRTdGFydCIsImZpcnN0TGFzZXJNYXJrZXIiLCJsYXN0TGFzZXJNYXJrZXIiLCJsYXNlck5hbWVUb051bSIsInNjdWxwdHVyZVlQb3NpdGlvbnMiLCJ5Iiwic2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQiLCJibGFkZU9mRmxhbWVDb3VudCIsIm51bWJlciIsIm5hbWVzIiwid2l0aE51bSIsIm93bmVycyIsIm1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMiLCJpc1N0YXR1ZVBvc2l0aW9uS25vd24iLCJpc1N0YXR1ZU5vcnRoIiwic2N1bHB0dXJlSWRzIiwib3RoZXJJZCIsInNvdXJjZVkiLCJvdGhlclkiLCJ5RGlmZiIsIk1hdGgiLCJhYnMiLCJvd25lciIsIm93bmVyTmljayIsInBpbGxhcklkVG9Pd25lciIsInBpbGxhck93bmVyIiwiZmlyZSIsInNtYWxsTGlvbklkVG9Pd25lciIsInNtYWxsTGlvbk93bmVycyIsImhhc1NtYWxsTGlvbiIsImhhc0ZpcmVEZWJ1ZmYiLCJjZW50ZXJZIiwiZGlyT2JqIiwiT3V0cHV0cyIsIm5vcnRoQmlnTGlvbiIsInNpbmdsZVRhcmdldCIsIm91dHB1dCIsInNvdXRoQmlnTGlvbiIsInNoYXJlZCIsImZpcmVEZWJ1ZmYiLCJsYWJlbHMiLCJwYXJzZXJMYW5nIiwiaGFzRGFyayIsImphZ2RUZXRoZXIiLCJ1bmRlZmluZWQiLCJpc1RhbmsiLCJoYXNUaHJvdHRsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtDQUdBOztBQUNBLE1BQU1BLHFCQUFxQixHQUFHLEdBQTlC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LGtCQUFNLHFEQUFxRCw2QkFBTSx1Q0FBdUMsZ0JBQU0sOEJBQThCLE9BQU0sdUNBQXVDLGdCQUFNLGdDQUFnQyxTQUFNLHNDQUFzQyxlQUFNLHdDQUF3QyxpQkFBTSxvQ0FBb0MsYUFBTSxxQ0FBcUMsY0FBTSw4QkFBOEIsT0FBTSwrQkFBK0IsUUFBTSxtQ0FBbUMsWUFBTSx1Q0FBdUMsZ0JBQU0sK0JBQStCLFFBQU0sc0NBQXNDLGdCQUFNLDZDQUE2Qyx1QkFBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSxzQ0FBc0MsaUJBQU0sbUNBQW1DLGNBQU0sc0NBQXNDLGlCQUFNLG1DQUFtQyxjQUFNLDZCQUE2QixRQUFNLDBCQUEwQixLQUFNLGlDQUFpQyxZQUFNLDhCQUE4QixTQUFNLDRCQUE0QixPQUFNLG1DQUFtQyxjQUFNLGdDQUFnQyxXQUFNLDZCQUE2QixRQUFNLDRCQUE0QixPQUFNLCtCQUErQixVQUFNLDZCQUE2QixRQUFNLDZCQUE2QixRQUFNLHdCQUF3QixHQUFNLDJCQUEyQixNQUFNLDZDQUE2QyxxQkFBTSxFQUFFLEUiLCJmaWxlIjoidWkvY29tbW9uL29vcHN5cmFpZHN5X2RhdGEuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEFiaWxpdGllcyBzZWVtIGluc3RhbnQuXHJcbmNvbnN0IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyA9IDAuNTtcclxuLy8gT2JzZXJ2YXRpb246IHVwIHRvIH4xLjIgc2Vjb25kcyBmb3IgYSBidWZmIHRvIHJvbGwgdGhyb3VnaCB0aGUgcGFydHkuXHJcbmNvbnN0IGVmZmVjdENvbGxlY3RTZWNvbmRzID0gMi4wO1xyXG5cclxuLy8gYXJnczogdHJpZ2dlcklkLCBuZXRSZWdleCwgZmllbGQsIHR5cGUsIGlnbm9yZVNlbGZcclxuY29uc3QgbWlzc2VkRnVuYyA9IChhcmdzKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIC8vIFN1cmUsIG5vdCBhbGwgb2YgdGhlc2UgYXJlIFwiYnVmZnNcIiBwZXIgc2UsIGJ1dCB0aGV5J3JlIGFsbCBpbiB0aGUgYnVmZnMgZmlsZS5cclxuICAgIGlkOiAnQnVmZiAnICsgYXJncy50cmlnZ2VySWQsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogKF9ldnQsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgY29uc3Qgc291cmNlSWQgPSBtYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIGlmIChkYXRhLnBhcnR5LnBhcnR5SWRzLmluY2x1ZGVzKHNvdXJjZUlkKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChkYXRhLnBldElkVG9Pd25lcklkKSB7XHJcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbc291cmNlSWRdO1xyXG4gICAgICAgIGlmIChvd25lcklkICYmIGRhdGEucGFydHkucGFydHlJZHMuaW5jbHVkZXMob3duZXJJZCkpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzLFxyXG4gICAgbWlzdGFrZTogKF9hbGxFdmVudHMsIGRhdGEsIGFsbE1hdGNoZXMpID0+IHtcclxuICAgICAgY29uc3QgcGFydHlOYW1lcyA9IGRhdGEucGFydHkucGFydHlOYW1lcztcclxuXHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIGRlYWQgcGVvcGxlIHNvbWVob3dcclxuICAgICAgY29uc3QgZ290QnVmZk1hcCA9IHt9O1xyXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgcGFydHlOYW1lcylcclxuICAgICAgICBnb3RCdWZmTWFwW25hbWVdID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCBmaXJzdE1hdGNoID0gYWxsTWF0Y2hlc1swXTtcclxuICAgICAgbGV0IHNvdXJjZU5hbWUgPSBmaXJzdE1hdGNoLnNvdXJjZTtcclxuICAgICAgLy8gQmxhbWUgcGV0IG1pc3Rha2VzIG9uIG93bmVycy5cclxuICAgICAgaWYgKGRhdGEucGV0SWRUb093bmVySWQpIHtcclxuICAgICAgICBjb25zdCBwZXRJZCA9IGZpcnN0TWF0Y2guc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBvd25lcklkID0gZGF0YS5wZXRJZFRvT3duZXJJZFtwZXRJZF07XHJcbiAgICAgICAgaWYgKG93bmVySWQpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmFtZSA9IGRhdGEucGFydHkubmFtZUZyb21JZChvd25lcklkKTtcclxuICAgICAgICAgIGlmIChvd25lck5hbWUpXHJcbiAgICAgICAgICAgIHNvdXJjZU5hbWUgPSBvd25lck5hbWU7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkbid0IGZpbmQgbmFtZSBmb3IgJHtvd25lcklkfSBmcm9tIHBldCAke3BldElkfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFyZ3MuaWdub3JlU2VsZilcclxuICAgICAgICBnb3RCdWZmTWFwW3NvdXJjZU5hbWVdID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHRoaW5nTmFtZSA9IGZpcnN0TWF0Y2hbYXJncy5maWVsZF07XHJcbiAgICAgIGZvciAoY29uc3QgbWF0Y2hlcyBvZiBhbGxNYXRjaGVzKSB7XHJcbiAgICAgICAgLy8gSW4gY2FzZSB5b3UgaGF2ZSBtdWx0aXBsZSBwYXJ0eSBtZW1iZXJzIHdobyBoaXQgdGhlIHNhbWUgY29vbGRvd24gYXQgdGhlIHNhbWVcclxuICAgICAgICAvLyB0aW1lIChsb2w/KSwgdGhlbiBpZ25vcmUgYW55Ym9keSB3aG8gd2Fzbid0IHRoZSBmaXJzdC5cclxuICAgICAgICBpZiAobWF0Y2hlcy5zb3VyY2UgIT09IGZpcnN0TWF0Y2guc291cmNlKVxyXG4gICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWlzc2VkID0gT2JqZWN0LmtleXMoZ290QnVmZk1hcCkuZmlsdGVyKCh4KSA9PiAhZ290QnVmZk1hcFt4XSk7XHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoID09PSAwKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIC8vIFRPRE86IG9vcHN5IGNvdWxkIHJlYWxseSB1c2UgbW91c2VvdmVyIHBvcHVwcyBmb3IgZGV0YWlscy5cclxuICAgICAgLy8gVE9ETzogYWx0ZXJuYXRpdmVseSwgaWYgd2UgaGF2ZSBhIGRlYXRoIHJlcG9ydCwgaXQnZCBiZSBnb29kIHRvXHJcbiAgICAgIC8vIGV4cGxpY2l0bHkgY2FsbCBvdXQgdGhhdCBvdGhlciBwZW9wbGUgZ290IGEgaGVhbCB0aGlzIHBlcnNvbiBkaWRuJ3QuXHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoIDwgNCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiBhcmdzLnR5cGUsXHJcbiAgICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IHRoaW5nTmFtZSArICcgbWlzc2VkICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSxcclxuICAgICAgICAgICAgZGU6IHRoaW5nTmFtZSArICcgdmVyZmVobHQgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpLFxyXG4gICAgICAgICAgICBmcjogdGhpbmdOYW1lICsgJyBtYW5xdcOpKGUpIHN1ciAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyksXHJcbiAgICAgICAgICAgIGphOiAnKCcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSArICcpIOOBjCcgKyB0aGluZ05hbWUgKyAn44KS5Y+X44GR44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgICAgY246IG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJyDmsqHlj5fliLAgJyArIHRoaW5nTmFtZSxcclxuICAgICAgICAgICAga286IHRoaW5nTmFtZSArICcgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJ+yXkOqyjCDsoIHsmqnslYjrkKgnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIC8vIElmIHRoZXJlJ3MgdG9vIG1hbnkgcGVvcGxlLCBqdXN0IGxpc3QgdGhlIG51bWJlciBvZiBwZW9wbGUgbWlzc2VkLlxyXG4gICAgICAvLyBUT0RPOiB3ZSBjb3VsZCBhbHNvIGxpc3QgZXZlcnlib2R5IG9uIHNlcGFyYXRlIGxpbmVzP1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IGFyZ3MudHlwZSxcclxuICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogdGhpbmdOYW1lICsgJyBtaXNzZWQgJyArIG1pc3NlZC5sZW5ndGggKyAnIHBlb3BsZScsXHJcbiAgICAgICAgICBkZTogdGhpbmdOYW1lICsgJyB2ZXJmZWhsdGUgJyArIG1pc3NlZC5sZW5ndGggKyAnIFBlcnNvbmVuJyxcclxuICAgICAgICAgIGZyOiB0aGluZ05hbWUgKyAnIG1hbnF1w6koZSkgc3VyICcgKyBtaXNzZWQubGVuZ3RoICsgJyBwZXJzb25uZXMnLFxyXG4gICAgICAgICAgamE6IG1pc3NlZC5sZW5ndGggKyAn5Lq644GMJyArIHRoaW5nTmFtZSArICfjgpLlj5fjgZHjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgY246ICfmnIknICsgbWlzc2VkLmxlbmd0aCArICfkurrmsqHlj5fliLAgJyArIHRoaW5nTmFtZSxcclxuICAgICAgICAgIGtvOiB0aGluZ05hbWUgKyAnICcgKyBtaXNzZWQubGVuZ3RoICsgJ+uqheyXkOqyjCDsoIHsmqnslYjrkKgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRNaXRpZ2F0aW9uQnVmZiA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmVmZmVjdElkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBlZmZlY3RJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiBhcmdzLmVmZmVjdElkIH0pLFxyXG4gICAgZmllbGQ6ICdlZmZlY3QnLFxyXG4gICAgdHlwZTogJ2hlYWwnLFxyXG4gICAgaWdub3JlU2VsZjogYXJncy5pZ25vcmVTZWxmLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogZWZmZWN0Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWREYW1hZ2VBYmlsaXR5ID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGZpZWxkOiAnYWJpbGl0eScsXHJcbiAgICB0eXBlOiAnZGFtYWdlJyxcclxuICAgIGlnbm9yZVNlbGY6IGFyZ3MuaWdub3JlU2VsZixcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZEhlYWwgPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHlJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgZmllbGQ6ICdhYmlsaXR5JyxcclxuICAgIHR5cGU6ICdoZWFsJyxcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5ID0gbWlzc2VkSGVhbDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRjaEFsbCxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0J1ZmYgUGV0IFRvIE93bmVyIE1hcHBlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCgpLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChtYXRjaGVzLm93bmVySWQgPT09ICcwJylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZGF0YS5wZXRJZFRvT3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWQgfHwge307XHJcbiAgICAgICAgLy8gRml4IGFueSBsb3dlcmNhc2UgaWRzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWRbbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpXSA9IG1hdGNoZXMub3duZXJJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBDbGVhcmVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuY2hhbmdlWm9uZSgpLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIENsZWFyIHRoaXMgaGFzaCBwZXJpb2RpY2FsbHkgc28gaXQgZG9lc24ndCBoYXZlIGZhbHNlIHBvc2l0aXZlcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkID0ge307XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByZWZlciBhYmlsaXRpZXMgdG8gZWZmZWN0cywgYXMgZWZmZWN0cyB0YWtlIGxvbmdlciB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG4gICAgLy8gSG93ZXZlciwgc29tZSB0aGluZ3MgYXJlIG9ubHkgZWZmZWN0cyBhbmQgc28gdGhlcmUgaXMgbm8gY2hvaWNlLlxyXG5cclxuICAgIC8vIEZvciB0aGluZ3MgeW91IGNhbiBzdGVwIGluIG9yIG91dCBvZiwgZ2l2ZSBhIGxvbmdlciB0aW1lcj8gIFRoaXMgaXNuJ3QgcGVyZmVjdC5cclxuICAgIC8vIFRPRE86IGluY2x1ZGUgc29pbCBoZXJlPz9cclxuICAgIG1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdDb2xsZWN0aXZlIFVuY29uc2Npb3VzJywgZWZmZWN0SWQ6ICczNTEnLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnUGFzc2FnZSBvZiBBcm1zJywgZWZmZWN0SWQ6ICc0OTgnLCBpZ25vcmVTZWxmOiB0cnVlLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcblxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0RpdmluZSBWZWlsJywgZWZmZWN0SWQ6ICcyRDcnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdIZWFydCBPZiBMaWdodCcsIGFiaWxpdHlJZDogJzNGMjAnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0RhcmsgTWlzc2lvbmFyeScsIGFiaWxpdHlJZDogJzQwNTcnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NoYWtlIEl0IE9mZicsIGFiaWxpdHlJZDogJzFDREMnIH0pLFxyXG5cclxuICAgIC8vIDNGNDQgaXMgdGhlIGNvcnJlY3QgUXVhZHJ1cGxlIFRlY2huaWNhbCBGaW5pc2gsIG90aGVycyBhcmUgRGlua3kgVGVjaG5pY2FsIEZpbmlzaC5cclxuICAgIG1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ1RlY2huaWNhbCBGaW5pc2gnLCBhYmlsaXR5SWQ6ICczRjRbMS00XScgfSksXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEaXZpbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBOCcgfSksXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCcm90aGVyaG9vZCcsIGFiaWxpdHlJZDogJzFDRTQnIH0pLFxyXG4gICAgbWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIExpdGFueScsIGFiaWxpdHlJZDogJ0RFNScgfSksXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdFbWJvbGRlbicsIGFiaWxpdHlJZDogJzFENjAnIH0pLFxyXG4gICAgbWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIFZvaWNlJywgYWJpbGl0eUlkOiAnNzYnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC8vIFRvbyBub2lzeSAocHJvY3MgZXZlcnkgdGhyZWUgc2Vjb25kcywgYW5kIGJhcmRzIG9mdGVuIG9mZiBkb2luZyBtZWNoYW5pY3MpLlxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnV2FuZGVyZXJcXCdzIE1pbnVldCcsIGVmZmVjdElkOiAnOEE4JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ01hZ2VcXCdzIEJhbGxhZCcsIGVmZmVjdElkOiAnOEE5JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ0FybXlcXCdzIFBhZW9uJywgZWZmZWN0SWQ6ICc4QUEnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUcm91YmFkb3VyJywgYWJpbGl0eUlkOiAnMUNFRCcgfSksXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnVGFjdGljaWFuJywgYWJpbGl0eUlkOiAnNDFGOScgfSksXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hpZWxkIFNhbWJhJywgYWJpbGl0eUlkOiAnM0U4QycgfSksXHJcblxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ01hbnRyYScsIGFiaWxpdHlJZDogJzQxJyB9KSxcclxuXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEZXZvdGlvbicsIGFiaWxpdHlJZDogJzFEMUEnIH0pLFxyXG5cclxuICAgIC8vIE1heWJlIHVzaW5nIGEgaGVhbGVyIExCMS9MQjIgc2hvdWxkIGJlIGFuIGVycm9yIGZvciB0aGUgaGVhbGVyLiBPOilcclxuICAgIC8vIG1pc3NlZEhlYWwoeyBpZDogJ0hlYWxpbmcgV2luZCcsIGFiaWxpdHlJZDogJ0NFJyB9KSxcclxuICAgIC8vIG1pc3NlZEhlYWwoeyBpZDogJ0JyZWF0aCBvZiB0aGUgRWFydGgnLCBhYmlsaXR5SWQ6ICdDRicgfSksXHJcblxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhJywgYWJpbGl0eUlkOiAnN0MnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhIElJJywgYWJpbGl0eUlkOiAnODUnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQWZmbGF0dXMgUmFwdHVyZScsIGFiaWxpdHlJZDogJzQwOTYnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnVGVtcGVyYW5jZScsIGFiaWxpdHlJZDogJzc1MScgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdQbGVuYXJ5IEluZHVsZ2VuY2UnLCBhYmlsaXR5SWQ6ICcxRDA5JyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ1B1bHNlIG9mIExpZmUnLCBhYmlsaXR5SWQ6ICdEMCcgfSksXHJcblxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnU3VjY29yJywgYWJpbGl0eUlkOiAnQkEnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnSW5kb21pdGFiaWxpdHknLCBhYmlsaXR5SWQ6ICdERkYnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnRGVwbG95bWVudCBUYWN0aWNzJywgYWJpbGl0eUlkOiAnRTAxJyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ1doaXNwZXJpbmcgRGF3bicsIGFiaWxpdHlJZDogJzMyMycgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdGZXkgQmxlc3NpbmcnLCBhYmlsaXR5SWQ6ICc0MEEwJyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ0NvbnNvbGF0aW9uJywgYWJpbGl0eUlkOiAnNDBBMycgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdBbmdlbFxcJ3MgV2hpc3BlcicsIGFiaWxpdHlJZDogJzQwQTYnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0ZleSBJbGx1bWluYXRpb24nLCBhYmlsaXR5SWQ6ICczMjUnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NlcmFwaGljIElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzQwQTcnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQW5nZWwgRmVhdGhlcnMnLCBhYmlsaXR5SWQ6ICcxMDk3JyB9KSxcclxuXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTAnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnRTExJyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ0FzcGVjdGVkIEhlbGlvcycsIGFiaWxpdHlJZDogJzMyMDAnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQ2VsZXN0aWFsIE9wcG9zaXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE5JyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ0FzdHJhbCBTdGFzaXMnLCBhYmlsaXR5SWQ6ICcxMDk4JyB9KSxcclxuXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdXaGl0ZSBXaW5kJywgYWJpbGl0eUlkOiAnMkM4RScgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdHb2Jza2luJywgYWJpbGl0eUlkOiAnNDc4MCcgfSksXHJcblxyXG4gICAgLy8gVE9ETzogZXhwb3J0IGFsbCBvZiB0aGVzZSBtaXNzZWQgZnVuY3Rpb25zIGludG8gdGhlaXIgb3duIGhlbHBlclxyXG4gICAgLy8gYW5kIHRoZW4gYWRkIHRoaXMgdG8gdGhlIERlbHVicnVtIFJlZ2luYWUgZmlsZXMgZGlyZWN0bHkuXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTG9zdCBBZXRoZXJzaGllbGQnLCBhYmlsaXR5SWQ6ICc1NzUzJyB9KSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gR2VuZXJhbCBtaXN0YWtlczsgdGhlc2UgYXBwbHkgZXZlcnl3aGVyZS5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRyaWdnZXIgaWQgZm9yIGludGVybmFsbHkgZ2VuZXJhdGVkIGVhcmx5IHB1bGwgd2FybmluZy5cclxuICAgICAgaWQ6ICdHZW5lcmFsIEVhcmx5IFB1bGwnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIEZvb2QgQnVmZicsXHJcbiAgICAgIC8vIFdlbGwgRmVkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFByZXZlbnQgXCJFb3MgbG9zZXMgdGhlIGVmZmVjdCBvZiBXZWxsIEZlZCBmcm9tIENyaXRsbyBNY2dlZVwiXHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXMudGFyZ2V0ID09PSBtYXRjaGVzLnNvdXJjZTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5sb3N0Rm9vZCA9IGRhdGEubG9zdEZvb2QgfHwge307XHJcbiAgICAgICAgLy8gV2VsbCBGZWQgYnVmZiBoYXBwZW5zIHJlcGVhdGVkbHkgd2hlbiBpdCBmYWxscyBvZmYgKFdIWSksXHJcbiAgICAgICAgLy8gc28gc3VwcHJlc3MgbXVsdGlwbGUgb2NjdXJyZW5jZXMuXHJcbiAgICAgICAgaWYgKCFkYXRhLmluQ29tYmF0IHx8IGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2xvc3QgZm9vZCBidWZmJyxcclxuICAgICAgICAgICAgZGU6ICdOYWhydW5nc2J1ZmYgdmVybG9yZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0J1ZmYgbm91cnJpdHVyZSB0ZXJtaW7DqWUnLFxyXG4gICAgICAgICAgICBqYTogJ+mjr+WKueaenOOBjOWkseOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5aSx5Y676aOf54mpQlVGRicsXHJcbiAgICAgICAgICAgIGtvOiAn7J2M7IudIOuyhO2UhCDtlbTsoJwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFdlbGwgRmVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ4JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubG9zdEZvb2QpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFJhYmJpdCBNZWRpdW0nLFxyXG4gICAgICBhYmlsaXR5UmVnZXg6ICc4RTAnLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiBkYXRhLklzUGxheWVySWQoZS5hdHRhY2tlcklkKSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IGUuYXR0YWNrZXJOYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2J1bm55JyxcclxuICAgICAgICAgICAgZGU6ICdIYXNlJyxcclxuICAgICAgICAgICAgZnI6ICdsYXBpbicsXHJcbiAgICAgICAgICAgIGphOiAn44GG44GV44GOJyxcclxuICAgICAgICAgICAgY246ICflhZTlrZAnLFxyXG4gICAgICAgICAgICBrbzogJ+2GoOuBvCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUZXN0IG1pc3Rha2UgdHJpZ2dlcnMuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NaWRkbGVMYU5vc2NlYSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgQm93JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJvdyBjb3VydGVvdXNseSB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdm91cyBpbmNsaW5leiBkZXZhbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+OBiui+nuWEgOOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirmga3mlazlnLDlr7nmnKjkurrooYznpLwuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOqzteyGkO2VmOqyjCDsnbjsgqztlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3B1bGwnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICBmdWxsVGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0JvdycsXHJcbiAgICAgICAgICAgIGRlOiAnQm9nZW4nLFxyXG4gICAgICAgICAgICBmcjogJ1NhbHVlcicsXHJcbiAgICAgICAgICAgIGphOiAn44GK6L6e5YSAJyxcclxuICAgICAgICAgICAgY246ICfpnqDouqwnLFxyXG4gICAgICAgICAgICBrbzogJ+yduOyCrCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgV2lwZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBiaWQgZmFyZXdlbGwgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIGZhaXRlcyB2b3MgYWRpZXV4IGF1IG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavliKXjgozjga7mjKjmi7bjgpLjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5ZCR5pyo5Lq65ZGK5YirLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDsnpHrs4Qg7J247IKs66W8IO2VqeuLiOuLpC4qPycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2lwZScsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIGZ1bGxUZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUGFydHkgV2lwZScsXHJcbiAgICAgICAgICAgIGRlOiAnR3J1cHBlbndpcGUnLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODr+OCpOODlycsXHJcbiAgICAgICAgICAgIGNuOiAn5Zui54GtJyxcclxuICAgICAgICAgICAga286ICftjIzti7Ag7KCE66m4JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBCb290c2hpbmUnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzM1JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmIChlLmF0dGFja2VyTmFtZSAhPT0gZGF0YS5tZSlcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBjb25zdCBzdHJpa2luZ0R1bW15TmFtZXMgPSBbXHJcbiAgICAgICAgICAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgJ01hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCcsXHJcbiAgICAgICAgICAn5pyo5Lq6JywgLy8gU3RyaWtpbmcgRHVtbXkgY2FsbGVkIGDmnKjkurpgIGluIENOIGFzIHdlbGwgYXMgSkFcclxuICAgICAgICAgICfrgpjrrLTsnbjtmJUnLFxyXG4gICAgICAgICAgLy8gRklYTUU6IGFkZCBvdGhlciBsYW5ndWFnZXMgaGVyZVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgcmV0dXJuIHN0cmlraW5nRHVtbXlOYW1lcy5pbmNsdWRlcyhlLnRhcmdldE5hbWUpO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuYm9vdENvdW50ID0gZGF0YS5ib290Q291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCsrO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBlLmFiaWxpdHlOYW1lICsgJyAoJyArIGRhdGEuYm9vdENvdW50ICsgJyk6ICcgKyBlLmRhbWFnZVN0cjtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiB0ZXh0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgTGVhZGVuIEZpc3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNzQ1JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMuc291cmNlID09PSBkYXRhLm1lLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZ29vZCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IE9vcHMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogbWF0Y2hlcy5saW5lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgUG9rZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBwb2tlIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB0b3VjaGV6IGzDqWfDqHJlbWVudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQgZHUgZG9pZ3QuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644KS44Gk44Gk44GE44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKueUqOaJi+aMh+aIs+WQkeacqOS6ui4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsnYQg7L+h7L+hIOywjOumheuLiOuLpC4qPycgfSksXHJcbiAgICAgIGNvbGxlY3RTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoZXZlbnRzLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gV2hlbiBjb2xsZWN0U2Vjb25kcyBpcyBzcGVjaWZpZWQsIGV2ZW50cyBhcmUgcGFzc2VkIGFzIGFuIGFycmF5LlxyXG4gICAgICAgIGNvbnN0IHBva2VzID0gZXZlbnRzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gMSBwb2tlIGF0IGEgdGltZSBpcyBmaW5lLCBidXQgbW9yZSB0aGFuIG9uZSBpbnNpZGUgb2ZcclxuICAgICAgICAvLyBjb2xsZWN0U2Vjb25kcyBpcyAoT0JWSU9VU0xZKSBhIG1pc3Rha2UuXHJcbiAgICAgICAgaWYgKHBva2VzIDw9IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IHtcclxuICAgICAgICAgIGVuOiAnVG9vIG1hbnkgcG9rZXMgKCcgKyBwb2tlcyArICcpJyxcclxuICAgICAgICAgIGRlOiAnWnUgdmllbGUgUGlla3NlciAoJyArIHBva2VzICsgJyknLFxyXG4gICAgICAgICAgZnI6ICdUcm9wIGRlIHRvdWNoZXMgKCcgKyBwb2tlcyArICcpJyxcclxuICAgICAgICAgIGphOiAn44GE44Gj44Gx44GE44Gk44Gk44GE44GfICgnICsgcG9rZXMgKyAnKScsXHJcbiAgICAgICAgICBjbjogJ+aIs+WkquWkmuS4i+WVpiAoJyArIHBva2VzICsgJyknLFxyXG4gICAgICAgICAga286ICfrhIjrrLQg66eO7J20IOywjOumhCAoJyArIHBva2VzICsgJ+uyiCknLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogdGV4dCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIElmcml0IFN0b3J5IE1vZGVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJvd2xPZkVtYmVycyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBSYWRpYW50IFBsdW1lJzogJzJERScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdJZnJpdE5tIEluY2luZXJhdGUnOiAnMUM1JyxcclxuICAgICdJZnJpdE5tIEVydXB0aW9uJzogJzJERCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaXRhbiBTdG9yeSBNb2RlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnM0NEJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbk5tIExhbmRzbGlkZSc6ICcyOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5ObSBSb2NrIEJ1c3Rlcic6ICcyODEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA4MjMvODI0LzgyNSwgV2F0ZXJzcG91dCA9IDgyOVxyXG5cclxuLy8gTGV2aWF0aGFuIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdMZXZpRXggR3JhbmQgRmFsbCc6ICc4MkYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aUV4IEh5ZHJvIFNob3QnOiAnNzQ4JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlFeCBEcmVhZHN0b3JtJzogJzc0OScsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlFeCBCb2R5IFNsYW0nOiAnODJBJywgLy8gbGV2aSBzbGFtIHRoYXQgdGlsdHMgdGhlIGJvYXRcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAxJzogJzg4QScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAyJzogJzg4QicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpRXggU3Bpbm5pbmcgRGl2ZSAzJzogJzgyQycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlFeCBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlFeCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpRXggQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnODJBJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gU2hpdmEgSGFyZFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUhtIEljaWNsZSBJbXBhY3QnOiAnOTkzJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFIbSBHbGFjaWVyIEJhc2gnOiAnOUExJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gS25vY2tiYWNrIHRhbmsgY2xlYXZlLlxyXG4gICAgJ1NoaXZhSG0gSGVhdmVubHkgU3RyaWtlJzogJzlBMCcsXHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUhtIEhhaWxzdG9ybSc6ICc5OTgnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUYW5rYnVzdGVyLiAgVGhpcyBpcyBTaGl2YSBIYXJkIG1vZGUsIG5vdCBTaGl2YSBFeHRyZW1lLiAgUGxlYXNlIVxyXG4gICAgJ1NoaXZhSG0gSWNlYnJhbmQnOiAnOTk2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEaWFtb25kIER1c3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc5OEEnIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zZWVuRGlhbW9uZER1c3QgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUhtIERlZXAgRnJlZXplJyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgOUEzIG9uIHlvdSwgYnV0IGl0IGhhcyB0aGUgdW50cmFuc2xhdGVkIG5hbWVcclxuICAgICAgLy8g6YCP5piO77ya44K344O044Kh77ya5YeN57WQ44Os44Kv44OI77ya44OO44OD44Kv44OQ44OD44Kv55SoLiBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIHNvIG9ubHkgYSBtaXN0YWtlIGFmdGVyIHRoYXQuXHJcbiAgICAgICAgLy8gVW5saWtlIGV4dHJlbWUsIHRoaXMgaGFzIHRoZSBzYW1lIDIwIHNlY29uZCBkdXJhdGlvbiBhcyB0aGUgaW50ZXJtaXNzaW9uLlxyXG4gICAgICAgIHJldHVybiBkYXRhLnNlZW5EaWFtb25kRHVzdDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gU2hpdmEgRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnQkVCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICdCRUMnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUV4IEdsYWNpZXIgQmFzaCc6ICdCRTknLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICdCREYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICdCRTInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBMYXNlci4gIFRPRE86IG1heWJlIGJsYW1lIHRoZSBwZXJzb24gaXQncyBvbj8/XHJcbiAgICAnU2hpdmFFeCBBdmFsYW5jaGUnOiAnQkUwJyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFua2J1c3RlclxyXG4gICAgJ1NoaXZhRXggSWNlYnJhbmQnOiAnQkUxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IEM4QSBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC/jg5Ljg63jgqTjg4Pjgq8uIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIGJ1dCBmb3IgYSBzaG9ydGVyIGR1cmF0aW9uLlxyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pID4gMjA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaXRhbiBIYXJkXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU1MycsXHJcbiAgICAnVGl0YW5IbSBCdXJzdCc6ICc0MUMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTGFuZHNsaWRlJzogJzU1NCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFJvY2sgQnVzdGVyJzogJzU1MCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIE1vdW50YWluIEJ1c3Rlcic6ICcyODMnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbkV4IFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1QkUnLFxyXG4gICAgJ1RpdGFuRXggQnVyc3QnOiAnNUJGJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbkV4IExhbmRzbGlkZSc6ICc1QkInLFxyXG4gICAgJ1RpdGFuRXggR2FvbGVyIExhbmRzbGlkZSc6ICc1QzMnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBSb2NrIEJ1c3Rlcic6ICc1QjcnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBNb3VudGFpbiBCdXN0ZXInOiAnNUI4JyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlZXBpbmdDaXR5T2ZNaGFjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBDcml0aWNhbCBCaXRlJzogJzE4NDgnLCAvLyBTYXJzdWNodXMgY29uZSBhb2VcclxuICAgICdXZWVwaW5nIFJlYWxtIFNoYWtlcic6ICcxODNFJywgLy8gRmlyc3QgRGF1Z2h0ZXIgY2lyY2xlIGFvZVxyXG4gICAgJ1dlZXBpbmcgU2lsa3NjcmVlbic6ICcxODNDJywgLy8gRmlyc3QgRGF1Z2h0ZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtlbiBTcHJheSc6ICcxODI0JywgLy8gQXJhY2huZSBFdmUgcmVhciBjb25hbCBhb2VcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDEnOiAnMTgzNycsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDFcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDInOiAnMTgzNicsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDJcclxuICAgICdXZWVwaW5nIFRyZW1ibG9yIDMnOiAnMTgzNScsIC8vIEFyYWNobmUgRXZlIGRpc2FwcGVhciBjaXJjbGUgYW9lIDNcclxuICAgICdXZWVwaW5nIFNwaWRlciBUaHJlYWQnOiAnMTgzOScsIC8vIEFyYWNobmUgRXZlIHNwaWRlciBsaW5lIGFvZVxyXG4gICAgJ1dlZXBpbmcgRmlyZSBJSSc6ICcxODRFJywgLy8gQmxhY2sgTWFnZSBDb3Jwc2UgY2lyY2xlIGFvZVxyXG4gICAgJ1dlZXBpbmcgTmVjcm9wdXJnZSc6ICcxN0Q3JywgLy8gRm9yZ2FsbCBTaHJpdmVsZWQgVGFsb24gbGluZSBhb2VcclxuICAgICdXZWVwaW5nIFJvdHRlbiBCcmVhdGgnOiAnMTdEMCcsIC8vIEZvcmdhbGwgRGFoYWsgY29uZSBhb2VcclxuICAgICdXZWVwaW5nIE1vdyc6ICcxN0QyJywgLy8gRm9yZ2FsbCBIYWFnZW50aSB1bm1hcmtlZCBjbGVhdmVcclxuICAgICdXZWVwaW5nIERhcmsgRXJ1cHRpb24nOiAnMTdDMycsIC8vIEZvcmdhbGwgcHVkZGxlIG1hcmtlclxyXG4gICAgLy8gMTgwNiBpcyBhbHNvIEZsYXJlIFN0YXIsIGJ1dCBpZiB5b3UgZ2V0IGJ5IDE4MDUgeW91IGFsc28gZ2V0IGhpdCBieSAxODA2P1xyXG4gICAgJ1dlZXBpbmcgRmxhcmUgU3Rhcic6ICcxODA1JywgLy8gT3ptYSBjdWJlIHBoYXNlIGRvbnV0XHJcbiAgICAnV2VlcGluZyBFeGVjcmF0aW9uJzogJzE4MjknLCAvLyBPem1hIHRyaWFuZ2xlIGxhc2VyXHJcbiAgICAnV2VlcGluZyBIYWlyY3V0IDEnOiAnMTgwQicsIC8vIENhbG9maXN0ZXJpIDE4MCBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAyJzogJzE4MEYnLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEVudGFuZ2xlbWVudCc6ICcxODFEJywgLy8gQ2Fsb2Zpc3RlcmkgbGFuZG1pbmUgcHVkZGxlIHByb2NcclxuICAgICdXZWVwaW5nIEV2aWwgQ3VybCc6ICcxODE2JywgLy8gQ2Fsb2Zpc3RlcmkgYXhlXHJcbiAgICAnV2VlcGluZyBFdmlsIFRyZXNzJzogJzE4MTcnLCAvLyBDYWxvZmlzdGVyaSBidWxiXHJcbiAgICAnV2VlcGluZyBEZXB0aCBDaGFyZ2UnOiAnMTgyMCcsIC8vIENhbG9maXN0ZXJpIGNoYXJnZSB0byBlZGdlXHJcbiAgICAnV2VlcGluZyBGZWludCBQYXJ0aWNsZSBCZWFtJzogJzE5MjgnLCAvLyBDYWxvZmlzdGVyaSBza3kgbGFzZXJcclxuICAgICdXZWVwaW5nIEV2aWwgU3dpdGNoJzogJzE4MTUnLCAvLyBDYWxvZmlzdGVyaSBsYXNlcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQXJhY2huZSBXZWInOiAnMTg1RScsIC8vIEFyYWNobmUgRXZlIGhlYWRtYXJrZXIgd2ViIGFvZVxyXG4gICAgJ1dlZXBpbmcgRWFydGggQWV0aGVyJzogJzE4NDEnLCAvLyBBcmFjaG5lIEV2ZSBvcmJzXHJcbiAgICAnV2VlcGluZyBFcGlncmFwaCc6ICcxODUyJywgLy8gSGVhZHN0b25lIHVudGVsZWdyYXBoZWQgbGFzZXIgbGluZSB0YW5rIGF0dGFja1xyXG4gICAgLy8gVGhpcyBpcyB0b28gbm9pc3kuICBCZXR0ZXIgdG8gcG9wIHRoZSBiYWxsb29ucyB0aGFuIHdvcnJ5IGFib3V0IGZyaWVuZHMuXHJcbiAgICAvLyAnV2VlcGluZyBFeHBsb3Npb24nOiAnMTgwNycsIC8vIE96bWFzcGhlcmUgQ3ViZSBvcmIgZXhwbG9zaW9uXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMSc6ICcxODBDJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMVxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDInOiAnMTgxMCcsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDJcclxuICAgICdXZWVwaW5nIEJsb29kaWVkIE5haWwnOiAnMTgxRicsIC8vIENhbG9maXN0ZXJpIGF4ZS9idWxiIGFwcGVhcmluZ1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBBcmFjaG5lIEV2ZSBGcm9uZCBBZmZlYXJkXHJcbiAgICAnV2VlcGluZyBab21iaWZpY2F0aW9uJzogJzE3MycsIC8vIEZvcmdhbGwgdG9vIG1hbnkgem9tYmllIHB1ZGRsZXNcclxuICAgICdXZWVwaW5nIFRvYWQnOiAnMUI3JywgLy8gRm9yZ2FsbCBCcmFuZCBvZiB0aGUgRmFsbGVuIGZhaWx1cmVcclxuICAgICdXZWVwaW5nIERvb20nOiAnMzhFJywgLy8gRm9yZ2FsbCBIYWFnZW50aSBNb3J0YWwgUmF5XHJcbiAgICAnV2VlcGluZyBBc3NpbWlsYXRpb24nOiAnNDJDJywgLy8gT3ptYXNoYWRlIEFzc2ltaWxhdGlvbiBsb29rLWF3YXlcclxuICAgICdXZWVwaW5nIFN0dW4nOiAnOTUnLCAvLyBDYWxvZmlzdGVyaSBQZW5ldHJhdGlvbiBsb29rLWF3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIEdyYWR1YWwgWm9tYmlmaWNhdGlvbiBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQxNScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEZvcmdhbGwgR3JhZHVhbCBab21iaWZpY2F0aW9uIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDE1JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnpvbWJpZSA9IGRhdGEuem9tYmllIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEZvcmdhbGwgTWVnYSBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE3Q0EnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS56b21iaWUgJiYgIWRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBIZWFkc3RvbmUgU2hpZWxkIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTVFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNoaWVsZCA9IGRhdGEuc2hpZWxkIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2hpZWxkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGbGFyaW5nIEVwaWdyYXBoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTg1NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnNoaWVsZCAmJiAhZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBhYmlsaXR5IG5hbWUgaXMgaGVscGZ1bGx5IGNhbGxlZCBcIkF0dGFja1wiIHNvIG5hbWUgaXQgc29tZXRoaW5nIGVsc2UuXHJcbiAgICAgIGlkOiAnV2VlcGluZyBPem1hIFRhbmsgTGFzZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgaWQ6ICcxODMxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGRlOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGZyOiAnVGFuayBMYXNlcicsXHJcbiAgICAgICAgICAgIGphOiAn44K/44Oz44Kv44Os44K244O8JyxcclxuICAgICAgICAgICAgY246ICflnablhYvmv4DlhYknLFxyXG4gICAgICAgICAgICBrbzogJ+2Dsey7pCDroIjsnbTsoIAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIE96bWEgSG9seScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4MkUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnaXN0IHJ1bnRlcmdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgO+8gScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldCwgdGV4dDogZS5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVHcmVhdEd1YmFsTGlicmFyeUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0d1YmFsSG0gVGVycm9yIEV5ZSc6ICc5MzAnLCAvLyBDaXJjbGUgQW9FLCBTcGluZSBCcmVha2VyIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBCYXR0ZXInOiAnMTk4QScsIC8vIENpcmNsZSBBb0UsIHRyYXNoIGJlZm9yZSBib3NzIDFcclxuICAgICdHdWJhbEhtIENvbmRlbW5hdGlvbic6ICczOTAnLCAvLyBDb25hbCBBb0UsIEJpYmxpb3ZvcmUgdHJhc2hcclxuICAgICdHdWJhbEhtIERpc2NvbnRpbnVlIDEnOiAnMTk0MycsIC8vIEZhbGxpbmcgYm9vayBzaGFkb3csIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMic6ICcxOTQwJywgLy8gUnVzaCBBb0UgZnJvbSBlbmRzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIERpc2NvbnRpbnVlIDMnOiAnMTk0MicsIC8vIFJ1c2ggQW9FIGFjcm9zcywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBGcmlnaHRmdWwgUm9hcic6ICcxOTNCJywgLy8gR2V0LU91dCBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMSc6ICcxOTNEJywgLy8gSW5pdGlhbCBlbmQgYm9vayB3YXJuaW5nIEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAyJzogJzE5M0YnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDMnOiAnMTk0MScsIC8vIEluaXRpYWwgc2lkZSBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIERlc29sYXRpb24nOiAnMTk4QycsIC8vIExpbmUgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRG91YmxlIFNtYXNoJzogJzI2QScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmtuZXNzJzogJzNBMCcsIC8vIENvbmFsIEFvRSwgSW5rc3RhaW4gdHJhc2hcclxuICAgICdHdWJhbEhtIEZpcmV3YXRlcic6ICczQkEnLCAvLyBDaXJjbGUgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRWxib3cgRHJvcCc6ICdDQkEnLCAvLyBDb25hbCBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEYXJrJzogJzE5REYnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gU2VhbHMnOiAnMTk0QScsIC8vIFN1bi9Nb29uc2VhbCBmYWlsdXJlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFdhdGVyIElJSSc6ICcxQzY3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgUG9yb2dvIFBlZ2lzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gUmFnaW5nIEF4ZSc6ICcxNzAzJywgLy8gU21hbGwgY29uYWwgQW9FLCBNZWNoYW5vc2Vydml0b3IgdHJhc2hcclxuICAgICdHdWJhbEhtIE1hZ2ljIEhhbW1lcic6ICcxOTkwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQXBhbmRhIG1pbmktYm9zc1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBHcmF2aXR5JzogJzE5NTAnLCAvLyBDaXJjbGUgQW9FIGZyb20gZ3Jhdml0eSBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIFByb3BlcnRpZXMgT2YgTGV2aXRhdGlvbic6ICcxOTRGJywgLy8gQ2lyY2xlIEFvRSBmcm9tIGxldml0YXRpb24gcHVkZGxlcywgYm9zcyAzXHJcbiAgICAnR3ViYWxIbSBDb21ldCc6ICcxOTY5JywgLy8gU21hbGwgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdHdWJhbEhtIEVjbGlwdGljIE1ldGVvcic6ICcxOTVDJywgLy8gTG9TIG1lY2hhbmljLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0d1YmFsSG0gU2VhcmluZyBXaW5kJzogJzE5NDQnLCAvLyBUYW5rIGNsZWF2ZSwgYm9zcyAyXHJcbiAgICAnR3ViYWxIbSBUaHVuZGVyJzogJzE5W0FCXScsIC8vIFNwcmVhZCBtYXJrZXIsIGJvc3MgM1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gRmlyZSBnYXRlIGluIGhhbGx3YXkgdG8gYm9zcyAyLCBtYWduZXQgZmFpbHVyZSBvbiBib3NzIDJcclxuICAgICAgaWQ6ICdHdWJhbEhtIEJ1cm5zJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEwQicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXQsIHRleHQ6IGUuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGFyZ2V0cyB3aXRoIEltcCB3aGVuIFRodW5kZXIgSUlJIHJlc29sdmVzIHJlY2VpdmUgYSB2dWxuZXJhYmlsaXR5IHN0YWNrIGFuZCBicmllZiBzdHVuXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgVGh1bmRlcicsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMTk1W0FCXScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IGRhdGEuaGFzSW1wW2UudGFyZ2V0TmFtZV0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2hvY2tlZCBJbXAnLFxyXG4gICAgICAgICAgICBkZTogJ1NjaG9ja2llcnRlciBJbXAnLFxyXG4gICAgICAgICAgICBqYTogJ+OCq+ODg+ODkeOCkuino+mZpOOBl+OBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5rKz56ul54q25oCB5ZCD5LqG5pq06Zu3JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR3ViYWxIbSBRdWFrZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMTk1NicsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IHtcclxuICAgICAgICAvLyBBbHdheXMgaGl0cyB0YXJnZXQsIGJ1dCBpZiBjb3JyZWN0bHkgcmVzb2x2ZWQgd2lsbCBkZWFsIDAgZGFtYWdlXHJcbiAgICAgICAgcmV0dXJuIGUuZGFtYWdlID4gMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR3ViYWxIbSBUb3JuYWRvJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcxOTVbNzhdJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4ge1xyXG4gICAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgICByZXR1cm4gZS5kYW1hZ2UgPiAwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNvaG1BbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NvaG1BbEhtIERlYWRseSBWYXBvcic6ICcxREM5JywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9Fc1xyXG4gICAgJ1NvaG1BbEhtIERlZXByb290JzogJzFDREEnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBPZGlvdXMgQWlyJzogJzFDREInLCAvLyBDb25hbCBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEdsb3Jpb3VzIEJsYXplJzogJzFDMzMnLCAvLyBDaXJjbGUgQW9FLCBTbWFsbCBTcG9yZSBTYWMsIGJvc3MgMVxyXG4gICAgJ1NvaG1BbEhtIEZvdWwgV2F0ZXJzJzogJzExOEEnLCAvLyBDb25hbCBBb0UsIE1vdW50YWludG9wIE9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGxhaW4gUG91bmQnOiAnMTE4NycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIE1vdW50YWludG9wIEhyb3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQYWxzeW55eGlzJzogJzExNjEnLCAvLyBDb25hbCBBb0UsIE92ZXJncm93biBEaWZmbHVnaWEgdHJhc2hcclxuICAgICdTb2htQWxIbSBTdXJmYWNlIEJyZWFjaCc6ICcxRTgwJywgLy8gQ2lyY2xlIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEZyZXNod2F0ZXIgQ2Fubm9uJzogJzExOUYnLCAvLyBMaW5lIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU21hc2gnOiAnMUMzNScsIC8vIFVudGVsZWdyYXBoZWQgcmVhciBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gVGFpbCBTd2luZyc6ICcxQzM2JywgLy8gVW50ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFJpcHBlciBDbGF3JzogJzFDMzcnLCAvLyBVbnRlbGVncmFwaGVkIGZyb250YWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbmQgU2xhc2gnOiAnMUMzOCcsIC8vIENpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBDaGFyZ2UnOiAnMUMzOScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEhvdCBDaGFyZ2UnOiAnMUMzQScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEZpcmViYWxsJzogJzFDM0InLCAvLyBVbnRlbGVncmFwaGVkIHRhcmdldGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gTGF2YSBGbG93JzogJzFDM0MnLCAvLyBVbnRlbGVncmFwaGVkIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIEhvcm4nOiAnMTUwNycsIC8vIENvbmFsIEFvRSwgQWJhbGF0aGlhbiBDbGF5IEdvbGVtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTGF2YSBCcmVhdGgnOiAnMUM0RCcsIC8vIENvbmFsIEFvRSwgTGF2YSBDcmFiIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUmluZyBvZiBGaXJlJzogJzFDNEMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBWb2xjYW5vIEFuYWxhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMSc6ICcxQzQzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMic6ICcxQzQ0JywgLy8gMjcwLWRlZ3JlZSByZWFyIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMyc6ICcxQzQyJywgLy8gUmluZyBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIFJlYWxtIFNoYWtlcic6ICcxQzQxJywgLy8gQ2lyY2xlIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXYXJucyBpZiBwbGF5ZXJzIHN0ZXAgaW50byB0aGUgbGF2YSBwdWRkbGVzLiBUaGVyZSBpcyB1bmZvcnR1bmF0ZWx5IG5vIGRpcmVjdCBkYW1hZ2UgZXZlbnQuXHJcbiAgICAgIGlkOiAnU29obUFsSG0gQnVybnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsZXhhbmRlclRoZVNvdWxPZlRoZUNyZWF0b3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0ExMk4gU2FjcmFtZW50JzogJzFBRTYnLCAvLyBDcm9zcyBMYXNlcnNcclxuICAgICdBMTJOIEdyYXZpdGF0aW9uYWwgQW5vbWFseSc6ICcxQUVCJywgLy8gR3Jhdml0eSBQdWRkbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBMTJOIERpdmluZSBTcGVhcic6ICcxQUUzJywgLy8gSW5zdGFudCBjb25hbCB0YW5rIGNsZWF2ZVxyXG4gICAgJ0ExMk4gQmxhemluZyBTY291cmdlJzogJzFBRTknLCAvLyBPcmFuZ2UgaGVhZCBtYXJrZXIgc3BsYXNoIGRhbWFnZVxyXG4gICAgJ0ExMk4gUGxhaW50IE9mIFNldmVyaXR5JzogJzFBRjEnLCAvLyBBZ2dyYXZhdGVkIEFzc2F1bHQgc3BsYXNoIGRhbWFnZVxyXG4gICAgJ0ExMk4gQ29tbXVuaW9uJzogJzFBRkMnLCAvLyBUZXRoZXIgUHVkZGxlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ29sbGVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdCA9IGRhdGEuYXNzYXVsdCB8fCBbXTtcclxuICAgICAgICBkYXRhLmFzc2F1bHQucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJdCBpcyBhIGZhaWx1cmUgZm9yIGEgU2V2ZXJpdHkgbWFya2VyIHRvIHN0YWNrIHdpdGggdGhlIFNvbGlkYXJpdHkgZ3JvdXAuXHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IEZhaWx1cmUnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzFBRjInLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5hc3NhdWx0LmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRGlkblxcJ3QgU3ByZWFkIScsXHJcbiAgICAgICAgICAgIGRlOiAnTmljaHQgdmVydGVpbHQhJyxcclxuICAgICAgICAgICAgZnI6ICdOZSBzXFwnZXN0IHBhcyBkaXNwZXJzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5pWj6ZaL44GX44Gq44GL44Gj44GfIScsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh5pyJ5pWj5byAIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDbGVhbnVwJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMjAsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5hc3NhdWx0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsYU1oaWdvLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbGEgTWhpZ28gTWFnaXRlayBSYXknOiAnMjRDRScsIC8vIExpbmUgQW9FLCBMZWdpb24gUHJlZGF0b3IgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gTG9jayBPbic6ICcyMDQ3JywgLy8gSG9taW5nIGNpcmNsZXMsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDEnOiAnMjA0OScsIC8vIEZyb250YWwgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDInOiAnMjA0QicsIC8vIFJlYXIgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBUYWlsIExhc2VyIDMnOiAnMjA0QycsIC8vIFJlYXIgbGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBTaG91bGRlciBDYW5ub24nOiAnMjREMCcsIC8vIENpcmNsZSBBb0UsIExlZ2lvbiBBdmVuZ2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENhbm5vbmZpcmUnOiAnMjNFRCcsIC8vIEVudmlyb25tZW50YWwgY2lyY2xlIEFvRSwgcGF0aCB0byBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnMjA1QScsIC8vIENpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBJbnRlZ3JhdGVkIEFldGhlcm9tb2R1bGF0b3InOiAnMjA1QicsIC8vIFJpbmcgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQ2lyY2xlIE9mIERlYXRoJzogJzI0RDQnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgSGV4YWRyb25lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEV4aGF1c3QnOiAnMjREMycsIC8vIExpbmUgQW9FLCBMZWdpb24gQ29sb3NzdXMgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gR3JhbmQgU3dvcmQnOiAnMjREMicsIC8vIENvbmFsIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3Rvcm0gMSc6ICcyMDY2JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIHByZS1pbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDInOiAnMjU4NycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDEnOiAnMjRCNicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmltYXJ5IGVudGl0eSwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIFZlaW4gU3BsaXR0ZXIgMic6ICcyMDZDJywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIGhlbHBlciBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBMaWdodGxlc3MgU3BhcmsnOiAnMjA2QicsIC8vIENvbmFsIEFvRSwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbGEgTWhpZ28gRGVtaW1hZ2lja3MnOiAnMjA1RScsXHJcbiAgICAnQWxhIE1oaWdvIFVubW92aW5nIFRyb2lrYSc6ICcyMDYwJyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAxJzogJzIwNjknLFxyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3b3JkIDInOiAnMjU4OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJdCdzIHBvc3NpYmxlIHBsYXllcnMgbWlnaHQganVzdCB3YW5kZXIgaW50byB0aGUgYmFkIG9uIHRoZSBvdXRzaWRlLFxyXG4gICAgICAvLyBidXQgbm9ybWFsbHkgcGVvcGxlIGdldCBwdXNoZWQgaW50byBpdC5cclxuICAgICAgaWQ6ICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd2VsbCcsXHJcbiAgICAgIC8vIERhbWFnZSBEb3duXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQjgnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0LCB0ZXh0OiBlLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gQmFyZGFtJ3MgTWV0dGxlXHJcblxyXG5cclxuLy8gRm9yIHJlYXNvbnMgbm90IGNvbXBsZXRlbHkgdW5kZXJzdG9vZCBhdCB0aGUgdGltZSB0aGlzIHdhcyBtZXJnZWQsXHJcbi8vIGJ1dCBsaWtlbHkgcmVsYXRlZCB0byB0aGUgZmFjdCB0aGF0IG5vIG5hbWVwbGF0ZXMgYXJlIHZpc2libGUgZHVyaW5nIHRoZSBlbmNvdW50ZXIsXHJcbi8vIGFuZCB0aGF0IG5vdGhpbmcgaW4gdGhlIGVuY291bnRlciBhY3R1YWxseSBkb2VzIGRhbWFnZSxcclxuLy8gd2UgY2FuJ3QgdXNlIGRhbWFnZVdhcm4gb3IgZ2FpbnNFZmZlY3QgaGVscGVycyBvbiB0aGUgQmFyZGFtIGZpZ2h0LlxyXG4vLyBJbnN0ZWFkLCB3ZSB1c2UgdGhpcyBoZWxwZXIgZnVuY3Rpb24gdG8gbG9vayBmb3IgZmFpbHVyZSBmbGFncy5cclxuLy8gSWYgdGhlIGZsYWcgaXMgcHJlc2VudCxhIGZ1bGwgdHJpZ2dlciBvYmplY3QgaXMgcmV0dXJuZWQgdGhhdCBkcm9wcyBpbiBzZWFtbGVzc2x5LlxyXG5jb25zdCBhYmlsaXR5V2FybiA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmFiaWxpdHlJZClcclxuICAgIGNvbnNvbGUuZXJyb3IoJ01pc3NpbmcgYWJpbGl0eSAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiB7XHJcbiAgICBpZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgY29uZGl0aW9uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnN1YnN0cigtMikgPT09ICcwRScsXHJcbiAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgIH0sXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5CYXJkYW1zTWV0dGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdCYXJkYW0gRGlydHkgQ2xhdyc6ICcyMUE4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEd1bG8gR3VsbyB0cmFzaFxyXG4gICAgJ0JhcmRhbSBFcGlncmFwaCc6ICcyM0FGJywgLy8gTGluZSBBb0UsIFdhbGwgb2YgQmFyZGFtIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRoZSBEdXNrIFN0YXInOiAnMjE4NycsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFRoZSBEYXduIFN0YXInOiAnMjE4NicsIC8vIENpcmNsZSBBb0UsIGVudmlyb25tZW50IGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIENydW1ibGluZyBDcnVzdCc6ICcxRjEzJywgLy8gQ2lyY2xlIEFvRXMsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBSYW0gUnVzaCc6ICcxRUZDJywgLy8gTGluZSBBb0VzLCBTdGVwcGUgWWFtYWEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEx1bGxhYnknOiAnMjRCMicsIC8vIENpcmNsZSBBb0VzLCBTdGVwcGUgU2hlZXAsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEhlYXZlJzogJzFFRjcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFdpZGUgQmxhc3Rlcic6ICcyNEIzJywgLy8gRW5vcm1vdXMgZnJvbnRhbCBjbGVhdmUsIFN0ZXBwZSBDb2V1cmwsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gRG91YmxlIFNtYXNoJzogJzI2QScsIC8vIENpcmNsZSBBb0UsIE1ldHRsaW5nIERoYXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFRyYW5zb25pYyBCbGFzdCc6ICcxMjYyJywgLy8gQ2lyY2xlIEFvRSwgU3RlcHBlIEVhZ2xlIHRyYXNoXHJcbiAgICAnQmFyZGFtIFdpbGQgSG9ybic6ICcyMjA4JywgLy8gRnJvbnRhbCBjbGVhdmUsIEtodW4gR3VydmVsIHRyYXNoXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJzogJzI1NzgnLCAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInOiAnMjU3OScsIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMyc6ICcyNTdBJywgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDEnOiAnMjU3QicsIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAyJzogJzI1N0MnLCAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInOiAnMjU3RicsIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBCYXJkYW1cXCdzIFJpbmcnOiAnMjU4MScsIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCc6ICcyNTdEJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQgSW1wYWN0JzogJzI1ODAnLCAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSXJvbiBTcGhlcmUgQXR0YWNrJzogJzE2QjYnLCAvLyBDb250YWN0IGRhbWFnZSwgSXJvbiBTcGhlcmUgdHJhc2gsIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIFRvcm5hZG8nOiAnMjQ3RScsIC8vIENpcmNsZSBBb0UsIEtodW4gU2hhdmFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBQaW5pb24nOiAnMUYxMScsIC8vIExpbmUgQW9FLCBZb2wgRmVhdGhlciwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGZWF0aGVyIFNxdWFsbCc6ICcxRjBFJywgLy8gRGFzaCBhdHRhY2ssIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBVbnRhcmdldGVkJzogJzFGMTInLCAvLyBSb3RhdGluZyBjaXJjbGUgQW9FcywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCYXJkYW0gR2FydWxhIFJ1c2gnOiAnMUVGOScsIC8vIExpbmUgQW9FLCBHYXJ1bGEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFRhcmdldGVkJzogJzFGMEMnLCAvLyBDaXJjbGUgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaW5nYmVhdCc6ICcxRjBGJywgLy8gQ29uYWwgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnQmFyZGFtIENvbmZ1c2VkJzogJzBCJywgLy8gRmFpbGVkIGdhemUgYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0JhcmRhbSBGZXR0ZXJzJzogJzU2RicsIC8vIEZhaWxpbmcgdHdvIG1lY2hhbmljcyBpbiBhbnkgb25lIHBoYXNlIG9uIEJhcmRhbSwgc2Vjb25kIGJvc3MuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAxJywgYWJpbGl0eUlkOiAnMjU3OCcgfSksXHJcbiAgICAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDInLCBhYmlsaXR5SWQ6ICcyNTc5JyB9KSxcclxuICAgIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMycsIGFiaWxpdHlJZDogJzI1N0EnIH0pLFxyXG4gICAgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDEnLCBhYmlsaXR5SWQ6ICcyNTdCJyB9KSxcclxuICAgIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAyJywgYWJpbGl0eUlkOiAnMjU3QycgfSksXHJcbiAgICAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVGhyb3dpbmcgU3BlYXInLCBhYmlsaXR5SWQ6ICcyNTdGJyB9KSxcclxuICAgIC8vIEdhemUgYXR0YWNrLCBXYXJyaW9yIG9mIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gRW1wdHkgR2F6ZScsIGFiaWxpdHlJZDogJzFGMDQnIH0pLFxyXG4gICAgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtXFwncyBSaW5nJywgYWJpbGl0eUlkOiAnMjU4MScgfSksXHJcbiAgICAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCcsIGFiaWxpdHlJZDogJzI1N0QnIH0pLFxyXG4gICAgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0IEltcGFjdCcsIGFiaWxpdHlJZDogJzI1ODAnIH0pLFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuS3VnYW5lQ2FzdGxlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIFRlbmthIEdva2tlbic6ICcyMzI5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgIEpvaSBCbGFkZSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgS2Vua2kgUmVsZWFzZSBUcmFzaCc6ICcyMzMwJywgLy8gQ2hhcmlvdCBBb0UsIEpvaSBLaXlvZnVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIENsZWFyb3V0JzogJzFFOTInLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBadWlrby1NYXJ1LCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAxJzogJzFFOTYnLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJhLUtpcmkgMic6ICcyNEY5JywgLy8gR2lhbnQgY2lyY2xlIEFvRSwgSGFyYWtpcmkgS29zaG8sIGJvc3MgMVxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMSc6ICcyMzJEJywgLy8gTGluZSBBb0UsIEthcmFrdXJpIE9ubWl0c3UgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIDEwMDAgQmFyYnMnOiAnMjE5OCcsIC8vIExpbmUgQW9FLCBKb2kgS29qYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMic6ICcxRTk4JywgLy8gTGluZSBBb0UsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGF0YW1pLUdhZXNoaSc6ICcxRTlEJywgLy8gRmxvb3IgdGlsZSBsaW5lIGF0dGFjaywgRWxraXRlIE9ubWl0c3UsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAzJzogJzFFQTAnLCAvLyBMaW5lIEFvRSwgRWxpdGUgT25taXRzdSwgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQXV0byBDcm9zc2Jvdyc6ICcyMzMzJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgS2FyYWt1cmkgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYWtpcmkgMyc6ICcyM0M5JywgLy8gR2lhbnQgQ2lyY2xlIEFvRSwgSGFyYWtpcmkgIEhhbnlhIHRyYXNoLCBhZnRlciBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBJYWktR2lyaSc6ICcxRUEyJywgLy8gQ2hhcmlvdCBBb0UsIFlvamltYm8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRnJhZ2lsaXR5JzogJzFFQUEnLCAvLyBDaGFyaW90IEFvRSwgSW5vc2hpa2FjaG8sIGJvc3MgM1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgRHJhZ29uZmlyZSc6ICcxRUFCJywgLy8gTGluZSBBb0UsIERyYWdvbiBIZWFkLCBib3NzIDNcclxuICB9LFxyXG5cclxuICBzaGFyZVdhcm46IHtcclxuICAgICdLdWdhbmUgQ2FzdGxlIElzc2VuJzogJzFFOTcnLCAvLyBJbnN0YW50IGZyb250YWwgY2xlYXZlLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIENsb2Nrd29yayBSYWl0b24nOiAnMUU5QicsIC8vIExhcmdlIGxpZ2h0bmluZyBzcHJlYWQgY2lyY2xlcywgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIFp1aWtvIE1hcnUsIGJvc3MgMVxyXG4gICAgICBpZDogJ0t1Z2FuZSBDYXN0bGUgSGVsbSBDcmFjaycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzFFOTQnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNhaW50TW9jaWFubmVzQXJib3JldHVtSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBNdWRzdHJlYW0nOiAnMzBEOScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEltbWFjdWxhdGUgQXBhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTaWxrZW4gU3ByYXknOiAnMzM4NScsIC8vIFJlYXIgY29uZSBBb0UsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZGR5IFB1ZGRsZXMnOiAnMzBEQScsIC8vIFNtYWxsIHRhcmdldGVkIGNpcmNsZSBBb0VzLCBEb3Jwb2trdXIgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBaXInOiAnMkU0OScsIC8vIEZyb250YWwgY29uZSBBb0UsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU0x1ZGdlIEJvbWInOiAnMkU0RScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBdG1vc3BoZXJlJzogJzJFNTEnLCAvLyBDaGFubmVsZWQgMy80IGFyZW5hIGNsZWF2ZSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDcmVlcGluZyBJdnknOiAnMzFBNScsIC8vIEZyb250YWwgY29uZSBBb0UsIFdpdGhlcmVkIEt1bGFrIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBSb2Nrc2xpZGUnOiAnMzEzNCcsIC8vIExpbmUgQW9FLCBTaWx0IEdvbGVtLCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgSW5uZXInOiAnMzEyRScsIC8vIENoYXJpb3QgQW9FLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgT3V0ZXInOiAnMzEyRicsIC8vIER5bmFtbyBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRW1iYWxtaW5nIEVhcnRoJzogJzMxQTYnLCAvLyBMYXJnZSBDaGFyaW90IEFvRSwgTXVkZHkgTWF0YSwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBRdWlja21pcmUnOiAnMzEzNicsIC8vIFNld2FnZSBzdXJnZSBhdm9pZGVkIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1YWdtaXJlIFBsYXRmb3Jtcyc6ICczMTM5JywgLy8gUXVhZ21pcmUgZXhwbG9zaW9uIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZlY3VsZW50IEZsb29kJzogJzMxM0MnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgQ29ycnVwdHVyZSc6ICczM0EwJywgLy8gTXVkIFNsaW1lIGV4cGxvc2lvbiwgYm9zcyAzLiAoTm8gZXhwbG9zaW9uIGlmIGRvbmUgY29ycmVjdGx5LilcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVGFwcm9vdCc6ICcyRTRDJywgLy8gTGFyZ2Ugb3JhbmdlIHNwcmVhZCBjaXJjbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRoIFNoYWtlcic6ICczMTMxJywgLy8gRWFydGggU2hha2VyLCBMYWtoYW11LCBib3NzIDJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU2VkdWNlZCc6ICczREYnLCAvLyBHYXplIGZhaWx1cmUsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFBvbGxlbic6ICcxMycsIC8vIFNsdWRnZSBwdWRkbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFRyYW5zZmlndXJhdGlvbic6ICc2NDgnLCAvLyBSb2x5LVBvbHkgQW9FIGNpcmNsZSBmYWlsdXJlLCBCTG9vbWluZyBCaWxva28gdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEh5c3RlcmlhJzogJzEyOCcsIC8vIEdhemUgZmFpbHVyZSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTdGFiIFdvdW5kJzogJzQ1RCcsIC8vIEFyZW5hIG91dGVyIHdhbGwgZWZmZWN0LCBib3NzIDJcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBGYXVsdCBXYXJyZW4nOiAnMkU0QScsIC8vIFN0YWNrIG1hcmtlciwgTnVsbGNodSwgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTd2FsbG93c0NvbXBhc3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSXZ5IEZldHRlcnMnOiAnMkMwNCcsIC8vIENpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMSc6ICcyQzA1JywgLy8gVG9ybmFkbyBncm91bmQgQW9FLCBwbGFjZWQgYnkgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFlhbWEtS2FndXJhJzogJzJCOTYnLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmxhbWVzIE9mIEhhdGUnOiAnMkI5OCcsIC8vIEZpcmUgb3JiIGV4cGxvc2lvbnMsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQ29uZmxhZ3JhdGUnOiAnMkI5OScsIC8vIENvbGxpc2lvbiB3aXRoIGZpcmUgb3JiLCBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBVcHdlbGwnOiAnMkMwNicsIC8vIFRhcmdldGVkIGNpcmNsZSBncm91bmQgQW9FLCBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCYWQgQnJlYXRoJzogJzJDMDcnLCAvLyBGcm9udGFsIGNsZWF2ZSwgSmlubWVuanUgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBHcmVhdGVyIFBhbG0gMSc6ICcyQjlEJywgLy8gSGFsZiBhcmVuYSByaWdodCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDInOiAnMkI5RScsIC8vIEhhbGYgYXJlbmEgbGVmdCBjbGVhdmUsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVHJpYnV0YXJ5JzogJzJCQTAnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmFsIGdyb3VuZCBBb0VzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMic6ICcyQzA2JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIGVudmlyb25tZW50LCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAzJzogJzJDMDcnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRmlsb3BsdW1lcyc6ICcyQzc2JywgLy8gRnJvbnRhbCByZWN0YW5nbGUgQW9FLCBEcmFnb24gQmkgRmFuZyB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDEnOiAnMkJBOCcsIC8vIENoYXJpb3QgQW9FLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMic6ICcyQkE5JywgLy8gRHluYW1vIEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDMnOiAnMkJBRScsIC8vIENoYXJpb3QgQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDQnOiAnMkJBRicsIC8vIER5bmFtbyBBb0UsIFNoYWRvdyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBFcXVhbCBPZiBIZWF2ZW4nOiAnMkJCNCcsIC8vIFNtYWxsIGNpcmNsZSBncm91bmQgQW9FcywgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNaXJhZ2UnOiAnMkJBMicsIC8vIFByZXktY2hhc2luZyBwdWRkbGVzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1vdW50YWluIEZhbGxzJzogJzJCQTUnLCAvLyBDaXJjbGUgc3ByZWFkIG1hcmtlcnMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kJzogJzJCQTcnLCAvLyBMYXNlciB0ZXRoZXIsIFFpdGlhbiBEYXNoZW5nICBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCAyJzogJzJCQUQnLCAvLyBMYXNlciBUZXRoZXIsIFNoYWRvd3MgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGF0dGFjayBmYWlsdXJlLCBPdGVuZ3UsIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmxlZWRpbmcnOiAnMTEyRicsIC8vIFN0ZXBwaW5nIG91dHNpZGUgdGhlIGFyZW5hLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YW5kaW5nIGluIHRoZSBsYWtlLCBEaWFkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIFNpeCBGdWxtcyBVbmRlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyMzcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgYm9zcyAzXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBGaXZlIEZpbmdlcmVkIFB1bmlzaG1lbnQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnMkJBQicsICcyQkIwJ10sIHNvdXJjZTogWydRaXRpYW4gRGFzaGVuZycsICdTaGFkb3cgT2YgVGhlIFNhZ2UnXSB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRlbXBsZU9mVGhlRmlzdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEZpcmUgQnJlYWsnOiAnMjFFRCcsIC8vIENvbmFsIEFvRSwgQmxvb2RnbGlkZXIgTW9uayB0cmFzaFxyXG4gICAgJ1RlbXBsZSBSYWRpYWwgQmxhc3Rlcic6ICcxRkQzJywgLy8gQ2lyY2xlIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIFdpZGUgQmxhc3Rlcic6ICcxRkQ0JywgLy8gQ29uYWwgQW9FLCBib3NzIDFcclxuICAgICdUZW1wbGUgQ3JpcHBsaW5nIEJsb3cnOiAnMjAxNicsIC8vIExpbmUgQW9FcywgZW52aXJvbm1lbnRhbCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBCcm9rZW4gRWFydGgnOiAnMjM2RScsIC8vIENpcmNsZSBBb0UsIFNpbmdoYSB0cmFzaFxyXG4gICAgJ1RlbXBsZSBTaGVhcic6ICcxRkREJywgLy8gRHVhbCBjb25hbCBBb0UsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBDb3VudGVyIFBhcnJ5JzogJzFGRTAnLCAvLyBSZXRhbGlhdGlvbiBmb3IgaW5jb3JyZWN0IGRpcmVjdGlvbiBhZnRlciBLaWxsZXIgSW5zdGluY3QsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBUYXBhcyc6ICcnLCAvLyBUcmFja2luZyBjaXJjdWxhciBncm91bmQgQW9FcywgYm9zcyAyXHJcbiAgICAnVGVtcGxlIEhlbGxzZWFsJzogJzIwMEYnLCAvLyBSZWQvQmx1ZSBzeW1ib2wgZmFpbHVyZSwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIFB1cmUgV2lsbCc6ICcyMDE3JywgLy8gQ2lyY2xlIEFvRSwgU3Bpcml0IEZsYW1lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1lZ2FibGFzdGVyJzogJzE2MycsIC8vIENvbmFsIEFvRSwgQ29ldXJsIFByYW5hIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnVGVtcGxlIFdpbmRidXJuJzogJzFGRTgnLCAvLyBDaXJjbGUgQW9FLCBUd2lzdGVyIHdpbmQsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBIdXJyaWNhbmUgS2ljayc6ICcxRkU1JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIFNpbGVudCBSb2FyJzogJzFGRUInLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDNcclxuICAgICdUZW1wbGUgTWlnaHR5IEJsb3cnOiAnMUZFQScsIC8vIENvbnRhY3Qgd2l0aCBjb2V1cmwgaGVhZCwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUZW1wbGUgSGVhdCBMaWdodG5pbmcnOiAnMUZENycsIC8vIFB1cnBsZSBzcHJlYWQgY2lyY2xlcywgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQnVybixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gRmFsbGluZyBSb2NrJzogJzMxQTMnLCAvLyBFbnZpcm9ubWVudGFsIGxpbmUgQW9FXHJcbiAgICAnVGhlIEJ1cm4gQWV0aGVyaWFsIEJsYXN0JzogJzMyOEInLCAvLyBMaW5lIEFvRSwgS3VrdWxrYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBNb2xlLWEtd2hhY2snOiAnMzI4RCcsIC8vIENpcmNsZSBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBIZWFkIEJ1dHQnOiAnMzI4RScsIC8vIFNtYWxsIGNvbmFsIEFvRSwgRGVzZXJ0IERlc21hbiB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkZmFsbCc6ICczMTkxJywgLy8gUm9vbXdpZGUgQW9FLCBMb1MgZm9yIHNhZmV0eSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gRGlzc29uYW5jZSc6ICczMTkyJywgLy8gRG9udXQgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBDcnlzdGFsbGluZSBGcmFjdHVyZSc6ICczMTk3JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJlc29uYW50IEZyZXF1ZW5jeSc6ICczMTk4JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJvdG9zd2lwZSc6ICczMjkxJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgQ2hhcnJlZCBEcmVhZG5hdWdodCB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdyZWNraW5nIEJhbGwnOiAnMzI5MicsIC8vIENpcmNsZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGF0dGVyJzogJzMyOTQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBDaGFycmVkIERvYmx5biB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEF1dG8tQ2Fubm9ucyc6ICczMjk1JywgLy8gTGluZSBBb0UsIENoYXJyZWQgRHJvbmUgdHJhc2hcclxuICAgICdUaGUgQnVybiBTZWxmLURldG9uYXRlJzogJzMyOTYnLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRnVsbCBUaHJvdHRsZSc6ICcyRDc1JywgLy8gTGluZSBBb0UsIERlZmVjdGl2ZSBEcm9uZSwgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gVGhyb3R0bGUnOiAnMkQ3NicsIC8vIExpbmUgQW9FLCBNaW5pbmcgRHJvbmUgYWRkcywgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gQWRpdCBEcml2ZXInOiAnMkQ3OCcsIC8vIExpbmUgQW9FLCBSb2NrIEJpdGVyIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRyZW1ibG9yJzogJzMyOTcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBWZWlsZWQgR2lnYXdvcm0gdHJhc2hcclxuICAgICdUaGUgQnVybiBEZXNlcnQgU3BpY2UnOiAnMzI5OCcsIC8vIFRoZSBmcm9udGFsIGNsZWF2ZXMgbXVzdCBmbG93XHJcbiAgICAnVGhlIEJ1cm4gVG94aWMgU3ByYXknOiAnMzI5QScsIC8vIEZyb250YWwgY29uZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBWZW5vbSBTcHJheSc6ICczMjlCJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgR2lnYXdvcm0gU3RhbGtlciB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdoaXRlIERlYXRoJzogJzMxNDMnLCAvLyBSZWFjdGl2ZSBkdXJpbmcgaW52dWxuZXJhYmlsaXR5LCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDEnOiAnMzE0NScsIC8vIFN0YXIgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDInOiAnMzE0NicsIC8vIExpbmUgQW9FcyBhZnRlciBzdGFycywgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIENhdXRlcml6ZSc6ICczMTQ4JywgLy8gTGluZS9Td29vcCBBb0UsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaGUgQnVybiBDb2xkIEZvZyc6ICczMTQyJywgLy8gR3Jvd2luZyBjaXJjbGUgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaGUgQnVybiBIYWlsZmlyZSc6ICczMTk0JywgLy8gSGVhZCBtYXJrZXIgbGluZSBBb0UsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkc3RyaWtlJzogJzMxOTUnLCAvLyBPcmFuZ2Ugc3ByZWFkIGhlYWQgbWFya2VycywgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ2hpbGxpbmcgQXNwaXJhdGlvbic6ICczMTREJywgLy8gSGVhZCBtYXJrZXIgY2xlYXZlLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRnJvc3QgQnJlYXRoJzogJzMxNEMnLCAvLyBUYW5rIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gTGVhZGVuJzogJzQzJywgLy8gUHVkZGxlIGVmZmVjdCwgYm9zcyAyLiAoQWxzbyBpbmZsaWN0cyAxMUYsIFNsdWRnZS4pXHJcbiAgICAnVGhlIEJ1cm4gUHVkZGxlIEZyb3N0Yml0ZSc6ICcxMUQnLCAvLyBJY2UgcHVkZGxlIGVmZmVjdCwgYm9zcyAzLiAoTk9UIHRoZSBjb25hbC1pbmZsaWN0ZWQgb25lLCAxMEMuKVxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzFOIC0gRGVsdGFzY2FwZSAxLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjEwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMU4gQnVybic6ICcyM0Q1JywgLy8gRmlyZWJhbGwgZXhwbG9zaW9uIGNpcmNsZSBBb0VzXHJcbiAgICAnTzFOIENsYW1wJzogJzIzRTInLCAvLyBGcm9udGFsIHJlY3RhbmdsZSBrbm9ja2JhY2sgQW9FLCBBbHRlIFJvaXRlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMU4gTGV2aW5ib2x0JzogJzIzREEnLCAvLyBzbWFsbCBzcHJlYWQgY2lyY2xlc1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBPMk4gLSBEZWx0YXNjYXBlIDIuMCBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMjAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08yTiBNYWluIFF1YWtlJzogJzI0QTUnLCAvLyBOb24tdGVsZWdyYXBoZWQgY2lyY2xlIEFvRSwgRmxlc2h5IE1lbWJlclxyXG4gICAgJ08yTiBFcm9zaW9uJzogJzI1OTAnLCAvLyBTbWFsbCBjaXJjbGUgQW9FcywgRmxlc2h5IE1lbWJlclxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzJOIFBhcmFub3JtYWwgV2F2ZSc6ICcyNTBFJywgLy8gSW5zdGFudCB0YW5rIGNsZWF2ZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gV2UgY291bGQgdHJ5IHRvIHNlcGFyYXRlIG91dCB0aGUgbWlzdGFrZSB0aGF0IGxlZCB0byB0aGUgcGxheWVyIGJlaW5nIHBldHJpZmllZC5cclxuICAgICAgLy8gSG93ZXZlciwgaXQncyBOb3JtYWwgbW9kZSwgd2h5IG92ZXJ0aGluayBpdD9cclxuICAgICAgaWQ6ICdPMk4gUGV0cmlmaWNhdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyNjInIH0pLFxyXG4gICAgICAvLyBUaGUgdXNlciBtaWdodCBnZXQgaGl0IGJ5IGFub3RoZXIgcGV0cmlmeWluZyBhYmlsaXR5IGJlZm9yZSB0aGUgZWZmZWN0IGVuZHMuXHJcbiAgICAgIC8vIFRoZXJlJ3Mgbm8gcG9pbnQgaW4gbm90aWZ5aW5nIGZvciB0aGF0LlxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEwLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0LCB0ZXh0OiBlLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjUxNScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IHtcclxuICAgICAgICAvLyBUaGlzIGRlYWxzIGRhbWFnZSBvbmx5IHRvIG5vbi1mbG9hdGluZyB0YXJnZXRzLlxyXG4gICAgICAgIHJldHVybiBlLmRhbWFnZSA+IDA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBuYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIE8zTiAtIERlbHRhc2NhcGUgMy4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYzMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzNOIFNwZWxsYmxhZGUgRmlyZSBJSUknOiAnMjQ2MCcsIC8vIERvbnV0IEFvRSwgSGFsaWNhcm5hc3N1c1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIEJsaXp6YXJkIElJSSc6ICcyNDYxJywgLy8gQ2lyY2xlIEFvRSwgSGFsaWNhcm5hc3N1c1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIFRodW5kZXIgSUlJJzogJzI0NjInLCAvLyBMaW5lIEFvRSwgSGFsaWNhcm5hc3N1c1xyXG4gICAgJ08zTiBDcm9zcyBSZWFwZXInOiAnMjQ2QicsIC8vIENpcmNsZSBBb0UsIFNvdWwgUmVhcGVyXHJcbiAgICAnTzNOIEd1c3RpbmcgR291Z2UnOiAnMjQ2QycsIC8vIEdyZWVuIGxpbmUgQW9FLCBTb3VsIFJlYXBlclxyXG4gICAgJ08zTiBTd29yZCBEYW5jZSc6ICcyNDcwJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25lIEFvRSwgSGFsaWNhcm5hc3N1c1xyXG4gICAgJ08zTiBVcGxpZnQnOiAnMjQ3MycsIC8vIEdyb3VuZCBzcGVhcnMsIFF1ZWVuJ3MgV2FsdHogZWZmZWN0LCBIYWxpY2FybmFzc3VzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzNOIFVsdGltdW0nOiAnMjQ3NycsIC8vIEluc3RhbnQga2lsbC4gVXNlZCBpZiB0aGUgcGxheWVyIGRvZXMgbm90IGV4aXQgdGhlIHNhbmQgbWF6ZSBmYXN0IGVub3VnaC5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08zTiBIb2x5IEJsdXInOiAyNDYzLCAvLyBTcHJlYWQgY2lyY2xlcy5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFBoYXNlIFRyYWNrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGlrYXJuYXNzb3MnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzZScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICflk4jliKnljaHnurPoi4/mlq8nLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+2VoOumrOy5tOultOuCmOyGjOyKpCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEucGhhc2VOdW1iZXIgKz0gMTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBsb3QgdG8gdHJhY2ssIGFuZCBpbiBvcmRlciB0byBtYWtlIGl0IGFsbCBjbGVhbiwgaXQncyBzYWZlc3QganVzdCB0b1xyXG4gICAgICAvLyBpbml0aWFsaXplIGl0IGFsbCB1cCBmcm9udCBpbnN0ZWFkIG9mIHRyeWluZyB0byBndWFyZCBhZ2FpbnN0IHVuZGVmaW5lZCBjb21wYXJpc29ucy5cclxuICAgICAgaWQ6ICdPM04gSW5pdGlhbGl6aW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3N1cycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGlrYXJuYXNzb3MnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpY2FybmFzc2UnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICfjg4/jg6rjgqvjg6vjg4rjg4Pjgr3jgrknLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICflk4jliKnljaHnurPoi4/mlq8nLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICftlaDrpqzsubTrpbTrgpjshozsiqQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuZ2FtZUNvdW50ID0gMDtcclxuICAgICAgICAvLyBJbmRleGluZyBwaGFzZXMgYXQgMSBzbyBhcyB0byBtYWtlIHBoYXNlcyBtYXRjaCB3aGF0IGh1bWFucyBleHBlY3QuXHJcbiAgICAgICAgLy8gMTogV2Ugc3RhcnQgaGVyZS5cclxuICAgICAgICAvLyAyOiBDYXZlIHBoYXNlIHdpdGggVXBsaWZ0cy5cclxuICAgICAgICAvLyAzOiBQb3N0LWludGVybWlzc2lvbiwgd2l0aCBnb29kIGFuZCBiYWQgZnJvZ3MuXHJcbiAgICAgICAgZGF0YS5waGFzZU51bWJlciA9IDE7XHJcbiAgICAgICAgZGF0YS5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08zTiBSaWJiaXQnLFxyXG4gICAgICBhYmlsaXR5UmVnZXg6ICcyNDY2JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFdlIERPIHdhbnQgdG8gYmUgaGl0IGJ5IFRvYWQvUmliYml0IGlmIHRoZSBuZXh0IGNhc3Qgb2YgVGhlIEdhbWVcclxuICAgICAgICAvLyBpcyA0eCB0b2FkIHBhbmVscy5cclxuICAgICAgICByZXR1cm4gIShkYXRhLnBoYXNlTnVtYmVyID09PSAzICYmIGRhdGEuZ2FtZUNvdW50ICUgMiA9PT0gMCkgJiYgZS50YXJnZXRJZCAhPT0gJ0UwMDAwMDAwJztcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBsb3Qgd2UgY291bGQgZG8gdG8gdHJhY2sgZXhhY3RseSBob3cgdGhlIHBsYXllciBmYWlsZWQgVGhlIEdhbWUuXHJcbiAgICAgIC8vIFdoeSBvdmVydGhpbmsgTm9ybWFsIG1vZGUsIGhvd2V2ZXI/XHJcbiAgICAgIGlkOiAnTzNOIFRoZSBHYW1lJyxcclxuICAgICAgLy8gR3Vlc3Mgd2hhdCB5b3UganVzdCBsb3N0P1xyXG4gICAgICBhYmlsaXR5UmVnZXg6ICcyNDZEJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4ge1xyXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgdGFrZXMgbm8gZGFtYWdlLCB0aGV5IGRpZCB0aGUgbWVjaGFuaWMgY29ycmVjdGx5LlxyXG4gICAgICAgIHJldHVybiBlLmRhbWFnZSA+IDA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgKz0gMTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIE80TiAtIERlbHRhc2NhcGUgNC4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzROIEJsaXp6YXJkIElJSSc6ICcyNEJDJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEV4ZGVhdGhcclxuICAgICdPNE4gRW1wb3dlcmVkIFRodW5kZXIgSUlJJzogJzI0QzEnLCAvLyBVbnRlbGVncmFwaGVkIGxhcmdlIGNpcmNsZSBBb0UsIEV4ZGVhdGhcclxuICAgICdPNE4gWm9tYmllIEJyZWF0aCc6ICcyNENCJywgLy8gQ29uYWwsIHRyZWUgaGVhZCBhZnRlciBEZWNpc2l2ZSBCYXR0bGVcclxuICAgICdPNE4gQ2xlYXJvdXQnOiAnMjRDQycsIC8vIE92ZXJsYXBwaW5nIGNvbmUgQW9FcywgRGVhdGhseSBWaW5lICh0ZW50YWNsZXMgYWxvbmdzaWRlIHRyZWUgaGVhZClcclxuICAgICdPNE4gQmxhY2sgU3BhcmsnOiAnMjRDOScsIC8vIEV4cGxvZGluZyBCbGFjayBIb2xlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEVtcG93ZXJlZCBGaXJlIElJSSBpbmZsaWN0cyB0aGUgUHlyZXRpYyBkZWJ1ZmYsIHdoaWNoIGRlYWxzIGRhbWFnZSBpZiB0aGUgcGxheWVyXHJcbiAgICAvLyBtb3ZlcyBvciBhY3RzIGJlZm9yZSB0aGUgZGVidWZmIGZhbGxzLiBVbmZvcnR1bmF0ZWx5IGl0IGRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3NcclxuICAgIC8vIGN1cnJlbnRseSBhIGxvZyBsaW5lIGZvciB0aGlzLCBzbyB0aGUgb25seSB3YXkgdG8gY2hlY2sgZm9yIHRoaXMgaXMgdG8gY29sbGVjdFxyXG4gICAgLy8gdGhlIGRlYnVmZnMgYW5kIHRoZW4gd2FybiBpZiBhIHBsYXllciB0YWtlcyBhbiBhY3Rpb24gZHVyaW5nIHRoYXQgdGltZS4gTm90IHdvcnRoIGl0XHJcbiAgICAvLyBmb3IgTm9ybWFsLlxyXG4gICAgJ080TiBTdGFuZGFyZCBGaXJlJzogJzI0QkEnLFxyXG4gICAgJ080TiBCdXN0ZXIgVGh1bmRlcic6ICcyNEJFJywgLy8gQSBjbGVhdmluZyB0YW5rIGJ1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBlLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0NsZWFuc2VycyBtaXNzZWQgRG9vbSEnLFxyXG4gICAgICAgICAgICBkZTogJ0Rvb20tUmVpbmlndW5nIHZlcmdlc3NlbiEnLFxyXG4gICAgICAgICAgICBmcjogJ05cXCdhIHBhcyDDqXTDqSBkaXNzaXDDqShlKSBkdSBHbGFzICEnLFxyXG4gICAgICAgICAgICBqYTogJ+atu+OBruWuo+WRiicsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh6Kej5q275a6jJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzROIFZhY3V1bSBXYXZlJywgLy8gU2hvcnQga25vY2tiYWNrIGZyb20gRXhkZWF0aFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzI0QjgnLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNE4gRW1wb3dlcmVkIEJsaXp6YXJkJywgLy8gUm9vbS13aWRlIEFvRSwgZnJlZXplcyBub24tbW92aW5nIHRhcmdldHNcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzRFNicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXQsIHRleHQ6IGUuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBPNFMgLSBEZWx0YXNjYXBlIDQuMCBTYXZhZ2VcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080UzIgTmVvIFZhY3V1bSBXYXZlJzogJzI0MUQnLFxyXG4gICAgJ080UzIgQWNjZWxlcmF0aW9uIEJvbWInOiAnMjQzMScsXHJcbiAgICAnTzRTMiBFbXB0aW5lc3MnOiAnMjQyMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzRTMiBEb3VibGUgTGFzZXInOiAnMjQxNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRGVjaXNpdmUgQmF0dGxlJyxcclxuICAgICAgYWJpbGl0eVJlZ2V4OiAnMjQwOCcsXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzEgVmFjdXVtIFdhdmUnLFxyXG4gICAgICBhYmlsaXR5UmVnZXg6ICcyM0ZFJyxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50ID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQWxtYWdlc3QnLFxyXG4gICAgICBhYmlsaXR5UmVnZXg6ICcyNDE3JyxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzTmVvRXhkZWF0aCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmxpenphcmQgSUlJJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcyM0Y4JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIElnbm9yZSB1bmF2b2lkYWJsZSByYWlkIGFvZSBCbGl6emFyZCBJSUkuXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSAmJiAhZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBUaHVuZGVyIElJSScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjNGRCcsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgZHVyaW5nIHJhbmRvbSBtZWNoYW5pYyBhZnRlciBkZWNpc2l2ZSBiYXR0bGUuXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSAmJiBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50O1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIFBldHJpZmllZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyNjInIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBPbiBOZW8sIGJlaW5nIHBldHJpZmllZCBpcyBiZWNhdXNlIHlvdSBsb29rZWQgYXQgU2hyaWVrLCBzbyB5b3VyIGZhdWx0LlxyXG4gICAgICAgIGlmIChkYXRhLmlzTmVvRXhkZWF0aClcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICAgIC8vIE9uIG5vcm1hbCBFeERlYXRoLCB0aGlzIGlzIGR1ZSB0byBXaGl0ZSBIb2xlLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRm9ya2VkIExpZ2h0bmluZycsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjQyRScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gZS5hYmlsaXR5TmFtZSArICcgPT4gJyArIGRhdGEuU2hvcnROYW1lKGUudGFyZ2V0TmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS5hdHRhY2tlck5hbWUsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEb3VibGUgQXR0YWNrJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcyNDFDJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpLFxyXG4gICAgICBjb2xsZWN0U2Vjb25kczogMC41LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLmxlbmd0aCA8PSAyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIEhhcmQgdG8ga25vdyB3aG8gc2hvdWxkIGJlIGluIHRoaXMgYW5kIHdobyBzaG91bGRuJ3QsIGJ1dFxyXG4gICAgICAgIC8vIGl0IHNob3VsZCBuZXZlciBoaXQgMyBwZW9wbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBmdWxsVGV4dDogZVswXS5hYmlsaXR5TmFtZSArICcgeCAnICsgZS5sZW5ndGggfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBPN1MgLSBTaWdtYXNjYXBlIDMuMCBTYXZhZ2VcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNpZ21hc2NhcGVWMzBTYXZhZ2UsXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ083UyBNaXNzaWxlJzogJzI3ODInLFxyXG4gICAgJ083UyBDaGFpbiBDYW5ub24nOiAnMjc4RicsXHJcbiAgfSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzdTIFNlYXJpbmcgV2luZCc6ICcyNzc3JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzdTIFN0b25lc2tpbicsXHJcbiAgICAgIGFiaWxpdHlSZWdleDogJzJBQjUnLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogY291bGQgYWRkIFBhdGNoIHdhcm5pbmdzIGZvciBkb3VibGUvdW5icm9rZW4gdGV0aGVyc1xyXG4vLyBUT0RPOiBIZWxsbyBXb3JsZCBjb3VsZCBoYXZlIGFueSB3YXJuaW5ncyAoc29ycnkpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxwaGFzY2FwZVY0MFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIE1vdGlvbiAxJzogJzMzMzQnLCAvLyAzMDArIGRlZ3JlZSBjbGVhdmUgd2l0aCBiYWNrIHNhZmUgYXJlYVxyXG4gICAgJ08xMlMxIEVmZmljaWVudCBCbGFkZXdvcmsgMSc6ICczMzI5JywgLy8gT21lZ2EtTSBcImdldCBvdXRcIiBjZW50ZXJlZCBhb2UgYWZ0ZXIgc3BsaXRcclxuICAgICdPMTJTMSBFZmZpY2llbnQgQmxhZGV3b3JrIDInOiAnMzMyQScsIC8vIE9tZWdhLU0gXCJnZXQgb3V0XCIgY2VudGVyZWQgYW9lIGR1cmluZyBibGFkZXNcclxuICAgICdPMTJTMSBCZXlvbmQgU3RyZW5ndGgnOiAnMzMyOCcsIC8vIE9tZWdhLU0gXCJnZXQgaW5cIiBjZW50ZXJlZCBhb2UgZHVyaW5nIHNoaWVsZFxyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBTdGVlbCAxJzogJzMzMzAnLCAvLyBPbWVnYS1GIFwiZ2V0IGZyb250L2JhY2tcIiBibGFkZXMgcGhhc2VcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgU3RlZWwgMic6ICczMzMxJywgLy8gT21lZ2EtRiBcImdldCBmcm9udC9iYWNrXCIgYmxhZGVzIHBoYXNlXHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIEJsaXp6YXJkIElJSSc6ICczMzMyJywgLy8gT21lZ2EtRiBnaWFudCBjcm9zc1xyXG4gICAgJ08xMlMyIERpZmZ1c2UgV2F2ZSBDYW5ub24nOiAnMzM2OScsIC8vIGJhY2svc2lkZXMgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgSHlwZXIgUHVsc2UgMSc6ICczMzVBJywgLy8gUm90YXRpbmcgQXJjaGl2ZSBQZXJpcGhlcmFsIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IEh5cGVyIFB1bHNlIDInOiAnMzM1QicsIC8vIFJvdGF0aW5nIEFyY2hpdmUgUGVyaXBoZXJhbCBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBDb2xvc3NhbCBCbG93JzogJzMzNUYnLCAvLyBFeHBsb2RpbmcgQXJjaGl2ZSBBbGwgaGFuZHNcclxuICAgICdPMTJTMiBMZWZ0IEFybSBVbml0IENvbG9zc2FsIEJsb3cnOiAnMzM2MCcsIC8vIEV4cGxvZGluZyBBcmNoaXZlIEFsbCBoYW5kc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08xMlMxIE9wdGljYWwgTGFzZXInOiAnMzM0NycsIC8vIG1pZGRsZSBsYXNlciBmcm9tIGV5ZVxyXG4gICAgJ08xMlMxIEFkdmFuY2VkIE9wdGljYWwgTGFzZXInOiAnMzM0QScsIC8vIGdpYW50IGNpcmNsZSBjZW50ZXJlZCBvbiBleWVcclxuICAgICdPMTJTMiBSZWFyIFBvd2VyIFVuaXQgUmVhciBMYXNlcnMgMSc6ICczMzYxJywgLy8gQXJjaGl2ZSBBbGwgaW5pdGlhbCBsYXNlclxyXG4gICAgJ08xMlMyIFJlYXIgUG93ZXIgVW5pdCBSZWFyIExhc2VycyAyJzogJzMzNjInLCAvLyBBcmNoaXZlIEFsbCByb3RhdGluZyBsYXNlclxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIEZpcmUgSUlJJzogJzMzMzcnLCAvLyBmaXJlIHNwcmVhZFxyXG4gICAgJ08xMlMyIEh5cGVyIFB1bHNlIFRldGhlcic6ICczMzVDJywgLy8gSW5kZXggQW5kIEFyY2hpdmUgUGVyaXBoZXJhbCB0ZXRoZXJzXHJcbiAgICAnTzEyUzIgV2F2ZSBDYW5ub24nOiAnMzM2QicsIC8vIEluZGV4IEFuZCBBcmNoaXZlIFBlcmlwaGVyYWwgYmFpdGVkIGxhc2Vyc1xyXG4gICAgJ08xMlMyIE9wdGltaXplZCBGaXJlIElJSSc6ICczMzc5JywgLy8gQXJjaGl2ZSBBbGwgc3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgU2FnaXR0YXJpdXMgQXJyb3cnOiAnMzM0RCcsIC8vIE9tZWdhLU0gYmFyZCBsaW1pdCBicmVha1xyXG4gICAgJ08xMlMyIE92ZXJzYW1wbGVkIFdhdmUgQ2Fubm9uJzogJzMzNjYnLCAvLyBNb25pdG9yIHRhbmsgYnVzdGVyc1xyXG4gICAgJ08xMlMyIFNhdmFnZSBXYXZlIENhbm5vbic6ICczMzZEJywgLy8gVGFuayBidXN0ZXIgd2l0aCB0aGUgdnVsbiBmaXJzdFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBEaXNjaGFyZ2VyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzMyNycgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ3MicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID0gZGF0YS52dWxuIHx8IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnZ1bG4gPSBkYXRhLnZ1bG4gfHwge307XHJcbiAgICAgICAgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IERhbWFnZScsXHJcbiAgICAgIC8vIDMzMkUgPSBQaWxlIFBpdGNoIHN0YWNrXHJcbiAgICAgIC8vIDMzM0UgPSBFbGVjdHJpYyBTbGlkZSAoT21lZ2EtTSBzcXVhcmUgMS00IGRhc2hlcylcclxuICAgICAgLy8gMzMzRiA9IEVsZWN0cmljIFNsaWRlIChPbWVnYS1GIHRyaWFuZ2xlIDEtNCBkYXNoZXMpXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiBbJzMzMkUnLCAnMzMzRScsICczMzNGJ10sXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnZ1bG4gJiYgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh3aXRoIHZ1bG4pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKG1pdCBWZXJ3dW5kYmFya2VpdClgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6KKr44OA44Oh44O844K45LiK5piHKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjluKbmmJPkvKQpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBCeWFra28gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlSmFkZVN0b2FFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIFBvcHBpbmcgVW5yZWxlbnRpbmcgQW5ndWlzaCBidWJibGVzXHJcbiAgICAnQnlhRXggQXJhdGFtYSc6ICcyN0Y2JyxcclxuICAgIC8vIFN0ZXBwaW5nIGluIGdyb3dpbmcgb3JiXHJcbiAgICAnQnlhRXggVmFjdXVtIENsYXcnOiAnMjdFOScsXHJcbiAgICAvLyBMaWdodG5pbmcgUHVkZGxlc1xyXG4gICAgJ0J5YUV4IEh1bmRlcmZvbGQgSGF2b2MgMSc6ICcyN0U1JyxcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDInOiAnMjdFNicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQnlhRXggU3dlZXAgVGhlIExlZyc6ICcyN0RCJyxcclxuICAgICdCeWFFeCBGaXJlIGFuZCBMaWdodG5pbmcnOiAnMjdERScsXHJcbiAgICAnQnlhRXggRGlzdGFudCBDbGFwJzogJzI3REQnLFxyXG4gICAgLy8gTWlkcGhhc2UgbGluZSBhdHRhY2tcclxuICAgICdCeWFFeCBJbXBlcmlhbCBHdWFyZCc6ICcyN0YxJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFBpbmsgYnViYmxlIGNvbGxpc2lvblxyXG4gICAgICBpZDogJ0J5YUV4IE9taW5vdXMgV2luZCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjdFQycsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IGUudGFyZ2V0TmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidWJibGUgY29sbGlzaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdCbGFzZW4gc2luZCB6dXNhbW1lbmdlc3Rvw59lbicsXHJcbiAgICAgICAgICAgIGZyOiAnY29sbGlzaW9uIGRlIGJ1bGxlcycsXHJcbiAgICAgICAgICAgIGphOiAn6KGd56qBJyxcclxuICAgICAgICAgICAgY246ICfnm7jmkp4nLFxyXG4gICAgICAgICAgICBrbzogJ+yepe2MkCDqsrnss5DshJwg7YSw7KeQJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaW5yeXUgTm9ybWFsXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUm95YWxNZW5hZ2VyaWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgQWtoIFJoYWknOiAnMUZBNicsIC8vIFNreSBsYXNlcnMgYWxvbmdzaWRlIEFraCBNb3JuLlxyXG4gICAgJ1NoaW5yeXUgQmxhemluZyBUcmFpbCc6ICcyMjFBJywgLy8gUmVjdGFuZ2xlIEFvRXMsIGludGVybWlzc2lvbiBhZGRzLlxyXG4gICAgJ1NoaW5yeXUgQ29sbGFwc2UnOiAnMjIxOCcsIC8vIENpcmNsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkc1xyXG4gICAgJ1NoaW5yeXUgRHJhZ29uZmlzdCc6ICcyNEYwJywgLy8gR2lhbnQgcHVuY2h5IGNpcmNsZSBpbiB0aGUgY2VudGVyLlxyXG4gICAgJ1NoaW5yeXUgRWFydGggQnJlYXRoJzogJzFGOUQnLCAvLyBDb25hbCBhdHRhY2tzIHRoYXQgYXJlbid0IGFjdHVhbGx5IEVhcnRoIFNoYWtlcnMuXHJcbiAgICAnU2hpbnJ5dSBHeXJlIENoYXJnZSc6ICcxRkE4JywgLy8gR3JlZW4gZGl2ZSBib21iIGF0dGFjay5cclxuICAgICdTaGlucnl1IFNwaWtlc2ljbGUnOiAnMUZBYCcsIC8vIEJsdWUtZ3JlZW4gbGluZSBhdHRhY2tzIGZyb20gYmVoaW5kLlxyXG4gICAgJ1NoaW5yeXUgVGFpbCBTbGFwJzogJzFGOTMnLCAvLyBSZWQgc3F1YXJlcyBpbmRpY2F0aW5nIHRoZSB0YWlsJ3MgbGFuZGluZyBzcG90cy5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgTGV2aW5ib2x0JzogJzFGOUMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSWN5IGZsb29yIGF0dGFjay5cclxuICAgICAgaWQ6ICdTaGlucnl1IERpYW1vbmQgRHVzdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfmu5HjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+a7keiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaW5yeXUgVGlkYWwgV2F2ZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMUY4QicsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBLbm9ja2JhY2sgZnJvbSBjZW50ZXIuXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBBZXJpYWwgQmxhc3QnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzFGOTAnLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzZXIgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBTdXNhbm8gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUG9vbE9mVHJpYnV0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N1c0V4IENodXJuaW5nJzogJzIwM0YnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1N1c0V4IFJhc2VuIEthaWt5byc6ICcyMDJFJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVWx0aW1hIFdlYXBvbiBVbHRpbWF0ZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2VhcG9uc1JlZnJhaW5VbHRpbWF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVVdVIFNlYXJpbmcgV2luZCc6ICcyQjVDJyxcclxuICAgICdVV1UgRXJ1cHRpb24nOiAnMkI1QScsXHJcbiAgICAnVVdVIFdlaWdodCc6ICcyQjY1JyxcclxuICAgICdVV1UgTGFuZHNsaWRlMSc6ICcyQjcwJyxcclxuICAgICdVV1UgTGFuZHNsaWRlMic6ICcyQjcxJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVV1UgR3JlYXQgV2hpcmx3aW5kJzogJzJCNDEnLFxyXG4gICAgJ1VXVSBTbGlwc3RyZWFtJzogJzJCNTMnLFxyXG4gICAgJ1VXVSBXaWNrZWQgV2hlZWwnOiAnMkI0RScsXHJcbiAgICAnVVdVIFdpY2tlZCBUb3JuYWRvJzogJzJCNEYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdVV1UgV2luZGJ1cm4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRUInIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDIsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXQsIHRleHQ6IGUuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGZWF0aGVybGFuY2UgZXhwbG9zaW9uLiAgSXQgc2VlbXMgbGlrZSB0aGUgcGVyc29uIHdobyBwb3BzIGl0IGlzIHRoZVxyXG4gICAgICAvLyBmaXJzdCBwZXJzb24gbGlzdGVkIGRhbWFnZS13aXNlLCBzbyB0aGV5IGFyZSBsaWtlbHkgdGhlIGN1bHByaXQuXHJcbiAgICAgIGlkOiAnVVdVIEZlYXRoZXJsYW5jZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMkI0MycsXHJcbiAgICAgIGNvbGxlY3RTZWNvbmRzOiAwLjUsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBlWzBdLnRhcmdldE5hbWUsIHRleHQ6IGVbMF0uYXR0YWNrZXJOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBVQ1UgLSBUaGUgVW5lbmRpbmcgQ29pbCBPZiBCYWhhbXV0IChVbHRpbWF0ZSlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVVuZW5kaW5nQ29pbE9mQmFoYW11dFVsdGltYXRlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVQ1UgTHVuYXIgRHluYW1vJzogJzI2QkMnLFxyXG4gICAgJ1VDVSBJcm9uIENoYXJpb3QnOiAnMjZCQicsXHJcbiAgICAnVUNVIEV4YWZsYXJlJzogJzI2RUYnLFxyXG4gICAgJ1VDVSBXaW5ncyBPZiBTYWx2YXRpb24nOiAnMjZDQScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUd2lzdGVyIERlYXRoJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcyNkFCJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIEluc3RhbnQgZGVhdGggdXNlcyAnMzYnIGFzIGl0cyBmbGFncywgZGlmZmVyZW50aWF0aW5nXHJcbiAgICAgICAgLy8gZnJvbSB0aGUgZXhwbG9zaW9uIGRhbWFnZSB5b3UgdGFrZSB3aGVuIHNvbWVib2R5IGVsc2VcclxuICAgICAgICAvLyBwb3BzIG9uZS5cclxuICAgICAgICByZXR1cm4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpICYmIGUuZmxhZ3MgPT09ICczNic7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnVHdpc3RlciBQb3AnLFxyXG4gICAgICAgICAgICBkZTogJ1dpcmJlbHN0dXJtIGJlcsO8aHJ0JyxcclxuICAgICAgICAgICAgZnI6ICdBcHBhcml0aW9uIGRlcyB0b3JuYWRlcycsXHJcbiAgICAgICAgICAgIGphOiAn44OE44Kk44K544K/44O8JyxcclxuICAgICAgICAgICAgY246ICfml4vpo44nLFxyXG4gICAgICAgICAgICBrbzogJ+2ajOyYpOumrCDrsJ/snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgVGhlcm1pb25pYyBCdXJzdCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjZCOScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGUudGFyZ2V0TmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQaXp6YSBTbGljZScsXHJcbiAgICAgICAgICAgIGRlOiAnUGl6emFzdMO8Y2snLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnRzIGRlIHBpenphJyxcclxuICAgICAgICAgICAgamE6ICfjgrXjg7zjg5/jgqrjg4vjg4Pjgq/jg5Djg7zjgrnjg4gnLFxyXG4gICAgICAgICAgICBjbjogJ+WkqeW0qeWcsOijgicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQ7JeQIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBDaGFpbiBMaWdodG5pbmcnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzI2QzgnLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiBkYXRhLklzUGxheWVySWQoZS50YXJnZXRJZCksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgLy8gSXQncyBoYXJkIHRvIGFzc2lnbiBibGFtZSBmb3IgbGlnaHRuaW5nLiAgVGhlIGRlYnVmZnNcclxuICAgICAgICAvLyBnbyBvdXQgYW5kIHRoZW4gZXhwbG9kZSBpbiBvcmRlciwgYnV0IHRoZSBhdHRhY2tlciBpc1xyXG4gICAgICAgIC8vIHRoZSBkcmFnb24gYW5kIG5vdCB0aGUgcGxheWVyLlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBuYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGl0IGJ5IGxpZ2h0bmluZycsXHJcbiAgICAgICAgICAgIGRlOiAndm9tIEJsaXR6IGdldHJvZmZlbicsXHJcbiAgICAgICAgICAgIGZyOiAnZnJhcHDDqShlKSBwYXIgbGEgZm91ZHJlJyxcclxuICAgICAgICAgICAgamE6ICfjg4HjgqfjgqTjg7Pjg6njgqTjg4jjg4vjg7PjgrAnLFxyXG4gICAgICAgICAgICBjbjogJ+mbt+WFiemTvicsXHJcbiAgICAgICAgICAgIGtvOiAn67KI6rCcIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBCdXJucycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdGQScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXQsIHRleHQ6IGUuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBTbHVkZ2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFGJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBlLnRhcmdldCwgdGV4dDogZS5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIERvb20gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUgaXMgbm8gY2FsbG91dCBmb3IgXCJ5b3UgZm9yZ290IHRvIGNsZWFyIGRvb21cIi4gIFRoZSBsb2dzIGxvb2tcclxuICAgICAgLy8gc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgLy8gICBbMjA6MDI6MzAuNTY0XSAxQTpPa29ub21pIFlha2kgZ2FpbnMgdGhlIGVmZmVjdCBvZiBEb29tIGZyb20gIGZvciA2LjAwIFNlY29uZHMuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM2LjQ0M10gMUU6T2tvbm9taSBZYWtpIGxvc2VzIHRoZSBlZmZlY3Qgb2YgUHJvdGVjdCBmcm9tIFRha28gWWFraS5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBEb29tIGZyb20gLlxyXG4gICAgICAvLyAgIFsyMDowMjozOC41MjVdIDE5Ok9rb25vbWkgWWFraSB3YXMgZGVmZWF0ZWQgYnkgRmlyZWhvcm4uXHJcbiAgICAgIC8vIEluIG90aGVyIHdvcmRzLCBkb29tIGVmZmVjdCBpcyByZW1vdmVkICsvLSBuZXR3b3JrIGxhdGVuY3ksIGJ1dCBjYW4ndFxyXG4gICAgICAvLyB0ZWxsIHVudGlsIGxhdGVyIHRoYXQgaXQgd2FzIGEgZGVhdGguICBBcmd1YWJseSwgdGhpcyBjb3VsZCBoYXZlIGJlZW4gYVxyXG4gICAgICAvLyBjbG9zZS1idXQtc3VjY2Vzc2Z1bCBjbGVhcmluZyBvZiBkb29tIGFzIHdlbGwuICBJdCBsb29rcyB0aGUgc2FtZS5cclxuICAgICAgLy8gU3RyYXRlZ3k6IGlmIHlvdSBoYXZlbid0IGNsZWFyZWQgZG9vbSB3aXRoIDEgc2Vjb25kIHRvIGdvIHRoZW4geW91IHByb2JhYmx5XHJcbiAgICAgIC8vIGRpZWQgdG8gZG9vbS4gIFlvdSBjYW4gZ2V0IG5vbi1mYXRhbGx5IGljZWJhbGxlZCBvciBhdXRvJ2QgaW4gYmV0d2VlbixcclxuICAgICAgLy8gYnV0IHdoYXQgY2FuIHlvdSBkby5cclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDEsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tIHx8ICFkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGxldCByZWFzb247XHJcbiAgICAgICAgaWYgKGUuZHVyYXRpb25TZWNvbmRzIDwgOSlcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMSc7XHJcbiAgICAgICAgZWxzZSBpZiAoZS5kdXJhdGlvblNlY29uZHMgPCAxNClcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMic7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmVhc29uID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMzJztcclxuICAgICAgICByZXR1cm4geyBuYW1lOiBtYXRjaGVzLnRhcmdldCwgcmVhc29uOiByZWFzb24gfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaGUgQ29waWVkIEZhY3RvcnlcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNvcGllZEZhY3RvcnksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEJvbWInOiAnNDhCNCcsXHJcbiAgICAvLyBNYWtlIHN1cmUgZW5lbWllcyBhcmUgaWdub3JlZCBvbiB0aGVzZVxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEJvbWJhcmRtZW50JzogJzQ4QjgnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IEFzc2F1bHQnOiAnNDhCNicsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNDhDNScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBTaWRlc3RyaWtpbmcgU3BpbiBTcGluIDEnOiAnNDhDQicsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBTaWRlc3RyaWtpbmcgU3BpbiAyJzogJzQ4Q0MnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgQ2VudHJpZnVnYWwgU3Bpbic6ICc0OEM5JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEFpci1Uby1TdXJmYWNlIEVuZXJneSc6ICc0OEJBJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEhpZ2gtQ2FsaWJlciBMYXNlcic6ICc0OEZBJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDEnOiAnNDhCQycsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAyJzogJzQ4QkQnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMyc6ICc0OEJFJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDQnOiAnNDhDMCcsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA1JzogJzQ4QzEnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNic6ICc0OEMyJyxcclxuXHJcbiAgICAnQ29waWVkIFRyYXNoIEVuZXJneSBCb21iJzogJzQ5MUQnLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBGcm9udGFsIFNvbWVyc2F1bHQnOiAnNDkxQicsXHJcbiAgICAnQ29waWVkIFRyYXNoIEhpZ2gtRnJlcXVlbmN5IExhc2VyJzogJzQ5MUUnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFNob2NraW5nIERpc2NoYXJnZSc6ICc0ODBCJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDEnOiAnNDlDNScsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAyJzogJzQ5QzYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMyc6ICc0OUM3JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDQnOiAnNDgwRicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA1JzogJzQ4MTAnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNic6ICc0ODExJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDEnOiAnNDgwMicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDInOiAnNDgwMycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBSaW5nIExhc2VyIDMnOiAnNDgwNCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVG93ZXJmYWxsJzogJzQ4MTMnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMSc6ICc0ODE2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMic6ICc0ODE3JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEZpcmUtUmVpc3RhbmNlIFRlc3QgMyc6ICc0ODE4JyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBPaWwgV2VsbCc6ICc0ODFCJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIEVsZWN0cm9tYWduZXRpYyBQdWxzZSc6ICc0ODE5JyxcclxuICAgIC8vIFRPRE86IHdoYXQncyB0aGUgZWxlY3RyaWZpZWQgZmxvb3Igd2l0aCBjb252ZXlvciBiZWx0cz9cclxuXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAyJzogJzQ5MzgnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDMnOiAnNDkzOScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNCc6ICc0OTNBJyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyA1JzogJzQ5MzcnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIExhc2VyIFR1cnJldCc6ICc0OEU2JyxcclxuXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IEFyZWEgQm9tYmluZyc6ICc0OTQzJyxcclxuICAgICdDb3BpZWQgRmxpZ2h0IFVuaXQgTGlnaHRmYXN0IEJsYWRlJzogJzQ5NDAnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMSc6ICc0NzI5JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMic6ICc0NzI4JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggMyc6ICc0NzJGJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNCc6ICc0NzMxJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNSc6ICc0NzJCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNic6ICc0NzJEJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggU21hc2ggNyc6ICc0NzMyJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBJbmNlbmRpYXJ5IEJvbWJpbmcnOiAnNDczOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBHdWlkZWQgTWlzc2lsZSc6ICc0NzM2JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIFN1cmZhY2UgTWlzc2lsZSc6ICc0NzM0JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIExhc2VyIFNpZ2h0JzogJzQ3M0InLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgRnJhY2snOiAnNDc0RCcsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBDcnVzaCc6ICc0OEZDJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIENydXNoaW5nIFdoZWVsJzogJzQ3NEInLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBUaHJ1c3QnOiAnNDhGQycsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBMYXNlciBTdXBwcmVzc2lvbic6ICc0OEUwJywgLy8gQ2Fubm9uc1xyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDEnOiAnNDk3NCcsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMic6ICc0OERDJyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAzJzogJzQ4RTQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDQnOiAnNDhFMCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBNYXJ4IEltcGFjdCc6ICc0OEQ0JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMSc6ICc0OEU4JyxcclxuICAgICdDb3BpZWQgOVMgVGFuayBEZXN0cnVjdGlvbiAyJzogJzQ4RTknLFxyXG5cclxuICAgICdDb3BpZWQgOVMgU2VyaWFsIFNwaW4gMSc6ICc0OEE1JyxcclxuICAgICdDb3BpZWQgOVMgU2VyaWFsIFNwaW4gMic6ICc0OEE3JyxcclxuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3BpZWQgSG9iYmVzIFNob3J0LVJhbmdlIE1pc3NpbGUnOiAnNDgxNScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiA1MDkzIHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNEZCNSB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDUwRDMgQWVyaWFsIFN1cHBvcnQ6IEJvbWJhcmRtZW50IGdvaW5nIG9mZiBmcm9tIGFkZFxyXG4vLyBUT0RPOiA1MjExIE1hbmV1dmVyOiBWb2x0IEFycmF5IG5vdCBnZXR0aW5nIGludGVycnVwdGVkXHJcbi8vIFRPRE86IDRGRjQvNEZGNSBPbmUgb2YgdGhlc2UgaXMgZmFpbGluZyBjaGVtaWNhbCBjb25mbGFncmF0aW9uXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHdyb25nIHRlbGVwb3J0ZXI/PyBtYXliZSA1MzYzP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVB1cHBldHNCdW5rZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMSc6ICc1MDc0JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAyJzogJzUwNzUnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDMnOiAnNTA3NicsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBDb2xsaWRlciBDYW5ub25zJzogJzUwN0UnLCAvLyByb3RhdGluZyByZWQgZ3JvdW5kIGFvZSBwaW53aGVlbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDEnOiAnNTA5MScsIC8vIGNoYXNpbmcgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDInOiAnNTA5MicsIC8vIGNoYXNpbmcgbGFzZXIgY2hhc2luZ1xyXG4gICAgJ1B1cHBldCBBZWdpcyBGbGlnaHQgUGF0aCc6ICc1MDhDJywgLy8gYmx1ZSBsaW5lIGFvZSBmcm9tIGZseWluZyB1bnRhcmdldGFibGUgYWRkc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBSZWZyYWN0aW9uIENhbm5vbnMgMSc6ICc1MDgxJywgLy8gcmVmcmFjdGlvbiBjYW5ub25zIGJldHdlZW4gd2luZ3NcclxuICAgICdQdXBwZXQgQWVnaXMgTGlmZVxcJ3MgTGFzdCBTb25nJzogJzUzQjMnLCAvLyByaW5nIGFvZSB3aXRoIGdhcFxyXG4gICAgJ1B1cHBldCBMaWdodCBMb25nLUJhcnJlbGVkIExhc2VyJzogJzUyMTInLCAvLyBsaW5lIGFvZSBmcm9tIGFkZFxyXG4gICAgJ1B1cHBldCBMaWdodCBTdXJmYWNlIE1pc3NpbGUgSW1wYWN0JzogJzUyMEYnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSW5jZW5kaWFyeSBCb21iaW5nJzogJzRGQjknLCAvLyBmaXJlIHB1ZGRsZSBpbml0aWFsXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNoYXJwIFR1cm4nOiAnNTA2RCcsIC8vIHNoYXJwIHR1cm4gZGFzaFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMSc6ICc0RkIxJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMic6ICc0RkIyJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMyc6ICc0RkIzJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDEnOiAnNTA2RicsIC8vIHJpZ2h0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMic6ICc1MDcwJywgLy8gbGVmdC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBHdWlkZWQgTWlzc2lsZSc6ICc0RkI4JywgLy8gZ3JvdW5kIGFvZSBkdXJpbmcgQXJlYSBCb21iYXJkbWVudFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAxJzogJzRGQzAnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAyJzogJzRGQzEnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNEZGQycsIC8vIGNvbG9yZWQgbWFnaWMgaGFtbWVyLXkgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBSZXZvbHZpbmcgTGFzZXInOiAnNTAwMCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYic6ICc0RkZBJywgLy8gZ2V0dGluZyBoaXQgYnkgYmFsbCBkdXJpbmcgQWN0aXZlIFN1cHByZXNzaXZlIFVuaXRcclxuICAgICdQdXBwZXQgSGVhdnkgUjAxMCBMYXNlcic6ICc0RkYwJywgLy8gbGFzZXIgcG9kXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMzAgSGFtbWVyJzogJzRGRjEnLCAvLyBjaXJjbGUgYW9lIHBvZFxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc1MEIxJywgLy8gbG9uZyBhb2UgaW4gdGhlIGhhbGx3YXkgc2VjdGlvblxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEVuZXJneSBCb21iJzogJzUwQjInLCAvLyBydW5uaW5nIGludG8gYSBmbG9hdGluZyBvcmJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEaXNzZWN0aW9uJzogJzUxQjMnLCAvLyBzcGlubmluZyB2ZXJ0aWNhbCBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERlY2FwaXRhdGlvbic6ICc1MUI0JywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVW50YXJnZXRlZCc6ICc1MUI3JywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDEnOiAnNTFBQScsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDInOiAnNTFDQicsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAxJzogJzU0MUYnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAyJzogJzUxOTgnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDEnOiAnNTQyMCcsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDInOiAnNTE5OScsIC8vIDJQIHRlbGVwb3J0aW5nIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMSc6ICc1NDIxJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDInOiAnNTE5QScsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgR3JvdW5kJzogJzUxQUUnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBjaXJjbGVcclxuICAgIC8vIFRoaXMgaXMuLi4gdG9vIG5vaXN5LlxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMSc6ICc1MUEwJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGp1bXBcclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDInOiAnNTE5RicsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBjbGVhdmVcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMSc6ICc1MDg3JywgLy8gdXBwZXIgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAyJzogJzRGRjcnLCAvLyB1cHBlciBsYXNlciBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDEnOiAnNTA4NicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAyJzogJzRGRjYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMyc6ICc1MDg4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA0JzogJzRGRjgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDUnOiAnNTA4OScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA2JzogJzRGRjknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgSW5jb25ncnVvdXMgU3Bpbic6ICc1MUIyJywgLy8gZmluZCB0aGUgc2FmZSBzcG90IGRvdWJsZSBkYXNoXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgcHJldHR5IGxhcmdlIGFuZCBnZXR0aW5nIGhpdCBieSBpbml0aWFsIHdpdGhvdXQgYnVybnMgc2VlbXMgZmluZS5cclxuICAgIC8vICdQdXBwZXQgTGlnaHQgSG9taW5nIE1pc3NpbGUgSW1wYWN0JzogJzUyMTAnLCAvLyB0YXJnZXRlZCBmaXJlIGFvZSBmcm9tIE5vIFJlc3RyaWN0aW9uc1xyXG4gICAgJ1B1cHBldCBIZWF2eSBVbmNvbnZlbnRpb25hbCBWb2x0YWdlJzogJzUwMDQnLFxyXG4gICAgLy8gUHJldHR5IG5vaXN5LlxyXG4gICAgJ1B1cHBldCBNYW5ldXZlciBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNTAwMicsIC8vIHRhbmsgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaG5pY2FsIENvbnR1c2lvbiBUYXJnZXRlZCc6ICc1MUI2JywgLy8gdGFyZ2V0ZWQgc3ByZWFkIG1hcmtlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSMDEyIExhc2VyIFRhbmsnOiAnNTFBRScsIC8vIHRhcmdldGVkIHNwcmVhZCBwb2QgbGFzZXIgb24gbm9uLXRhbmtcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBBbnRpLVBlcnNvbm5lbCBMYXNlcic6ICc1MDkwJywgLy8gdGFuayBidXN0ZXIgbWFya2VyXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFByZWNpc2lvbi1HdWlkZWQgTWlzc2lsZSc6ICc0RkM1JyxcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUQnLCAvLyB0YXJnZXRlZCBwb2QgbGFzZXIgb24gdGFua1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnUHVwcGV0IEJ1cm5zJzogJzEwQicsIC8vIHN0YW5kaW5nIGluIG1hbnkgdmFyaW91cyBmaXJlIGFvZXNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBTaG9jayBCbGFjayAyP1xyXG4vLyBUT0RPOiBXaGl0ZS9CbGFjayBEaXNzb25hbmNlIGRhbWFnZSBpcyBtYXliZSB3aGVuIGZsYWdzIGVuZCBpbiAwMz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUb3dlckF0UGFyYWRpZ21zQnJlYWNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDEnOiAnNUVBNycsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IENlbnRlciAyJzogJzYwQzgnLCAvLyBDZW50ZXIgYW9lIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMSc6ICc1RUE1JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDInOiAnNUVBNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAzJzogJzYwQzYnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSA0JzogJzYwQzcnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBCdXJzdCc6ICc1RUQ0JywgLy8gU3BoZXJvaWQgS25hdmlzaCBCdWxsZXRzIGNvbGxpc2lvblxyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEJhcnJhZ2UnOiAnNUVBQycsIC8vIFNwaGVyb2lkIGxpbmUgYW9lc1xyXG4gICAgJ1Rvd2VyIEhhbnNlbCBSZXBheSc6ICc1QzcwJywgLy8gU2hpZWxkIGRhbWFnZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBFeHBsb3Npb24nOiAnNUM2NycsIC8vIEJlaW5nIGhpdCBieSBNYWdpYyBCdWxsZXQgZHVyaW5nIFBhc3NpbmcgTGFuY2VcclxuICAgICdUb3dlciBIYW5zZWwgSW1wYWN0JzogJzVDNUMnLCAvLyBCZWluZyBoaXQgYnkgTWFnaWNhbCBDb25mbHVlbmNlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDEnOiAnNUM2QycsIC8vIER1YWwgY2xlYXZlcyB3aXRob3V0IHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMic6ICc1QzZEJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAzJzogJzVDNkUnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDQnOiAnNUM2RicsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBQYXNzaW5nIExhbmNlJzogJzVDNjYnLCAvLyBUaGUgUGFzc2luZyBMYW5jZSBjaGFyZ2UgaXRzZWxmXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMSc6ICc1NUIzJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMic6ICc1QzVEJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJyZWF0aHRocm91Z2ggMyc6ICc1QzVFJywgLy8gaGFsZiByb29tIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEh1bmdyeSBMYW5jZSAxJzogJzVDNzEnLCAvLyAyeGxhcmdlIGNvbmFsIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEh1bmdyeSBMYW5jZSAyJzogJzVDNzInLCAvLyAyeGxhcmdlIGNvbmFsIGNsZWF2ZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgTGlnaHRmYXN0IEJsYWRlJzogJzVCRkUnLCAvLyBsYXJnZSByb29tIGNsZWF2ZVxyXG4gICAgJ1Rvd2VyIEZsaWdodCBVbml0IFN0YW5kYXJkIExhc2VyJzogJzVCRkYnLCAvLyB0cmFja2luZyBsYXNlclxyXG4gICAgJ1Rvd2VyIDJQIFdoaXJsaW5nIEFzc2F1bHQnOiAnNUJGQicsIC8vIGxpbmUgYW9lIGZyb20gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgMlAgQmFsYW5jZWQgRWRnZSc6ICc1QkZBJywgLy8gY2lyY3VsYXIgYW9lIG9uIDJQIGNsb25lc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMSc6ICc2MDA2JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMic6ICc2MDA3JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgMyc6ICc2MDA4JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNCc6ICc2MDA5JywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNSc6ICc2MzEwJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNic6ICc2MzExJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgNyc6ICc2MzEyJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIEdlbmVyYXRlIEJhcnJpZXIgOCc6ICc2MzEzJywgLy8gYmVpbmcgaGl0IGJ5IGJhcnJpZXJzIGFwcGVhcmluZ1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDEnOiAnNjAwRicsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBXaGl0ZSAyJzogJzYwMTAnLCAvLyB3aGl0ZSBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIGJsYWNrXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgQmxhY2sgMSc6ICc2MDExJywgLy8gYmxhY2sgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiB3aGl0ZVxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IFdoaXRlIDEnOiAnNjAxRicsIC8vIGJlaW5nIGhpdCBieSBhIHdoaXRlIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMic6ICc2MDIxJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBCbGFjayAxJzogJzYwMjAnLCAvLyBiZWluZyBoaXQgYnkgYSBibGFjayBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDInOiAnNjAyMicsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBXaGl0ZSc6ICc2MDBDJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIHdoaXRlIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFdpcGUgQmxhY2snOiAnNjAwRCcsIC8vIG5vdCBsaW5lIG9mIHNpZ2h0aW5nIHRoZSBibGFjayBtZXRlb3JcclxuICAgICdUb3dlciBSZWQgR2lybCBEaWZmdXNlIEVuZXJneSc6ICc2MDU2JywgLy8gcm90YXRpbmcgY2xvbmUgYnViYmxlIGNsZWF2ZXNcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBCaWcgRXhwbG9zaW9uJzogJzYwMjcnLCAvLyBub3Qga2lsbGluZyBhIHB5bG9uIGR1cmluZyBoYWNraW5nIHBoYXNlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUHlsb24gRXhwbG9zaW9uJzogJzYwMjYnLCAvLyBweWxvbiBkdXJpbmcgQ2hpbGQncyBwbGF5XHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBNaWRkbGUnOiAnNUMwMicsIC8vIG1pZGRsZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgU2lkZXMnOiAnNUMwNScsIC8vIHNpZGVzIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyAzJzogJzYwNzgnLCAvLyBnb2VzIHdpdGggNUMwMVxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgNCc6ICc2MDc5JywgLy8gZ29lcyB3aXRoIDVDMDRcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBFbmVyZ3kgQm9tYic6ICc1QzA1JywgLy8gcGluayBidWJibGVcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgUmlnaHQnOiAnNUJENycsIC8vIHJvdGF0aW5nIHdoZWVsIGdvaW5nIHJpZ2h0XHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWRlIE1hZ2ljIExlZnQnOiAnNUJENicsIC8vIHJvdGF0aW5nIHdoZWVsIGdvaW5nIGxlZnRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIExpZ2h0ZXIgTm90ZSc6ICc1QkRBJywgLy8gbGlnaHRlciBub3RlIG1vdmluZyBhb2VzXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWdpY2FsIEludGVyZmVyZW5jZSc6ICc1QkQ1JywgLy8gbGFzZXJzIGR1cmluZyBSaHl0aG0gUmluZ3NcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIFNjYXR0ZXJlZCBNYWdpYyc6ICc1QkRGJywgLy8gY2lyY2xlIGFvZXMgZnJvbSBTZWVkIE9mIE1hZ2ljXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgVW5ldmVuIEZvdHRpbmcnOiAnNUJFMicsIC8vIGJ1aWxkaW5nIGZyb20gUmVjcmVhdGUgU3RydWN0dXJlXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgQ3Jhc2gnOiAnNUJFNScsIC8vIHRyYWlucyBmcm9tIE1peGVkIFNpZ25hbHNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBIZWF2eSBBcm1zIDEnOiAnNUJFRCcsIC8vIGhlYXZ5IGFybXMgZnJvbnQvYmFjayBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBIZWF2eSBBcm1zIDInOiAnNUJFRicsIC8vIGhlYXZ5IGFybXMgc2lkZXMgYXR0YWNrXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgRW5lcmd5IFNjYXR0ZXJlZCBNYWdpYyc6ICc1QkU4JywgLy8gb3JicyBmcm9tIFJlZCBHaXJsIGJ5IHRyYWluXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgUGxhY2UgT2YgUG93ZXInOiAnNUMwRCcsIC8vIGluc3RhZGVhdGggbWlkZGxlIGNpcmNsZSBiZWZvcmUgYmxhY2svd2hpdGUgcmluZ3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEFydGlsbGVyeSBBbHBoYSc6ICc1RUFCJywgLy8gU3ByZWFkXHJcbiAgICAnVG93ZXIgSGFuc2VsIFNlZWQgT2YgTWFnaWMgQWxwaGEnOiAnNUM2MScsIC8vIFNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEJldGEnOiAnNUVCMycsIC8vIFRhbmtidXN0ZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBNYW5pcHVsYXRlIEVuZXJneSc6ICc2MDFBJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgRGFya2VyIE5vdGUnOiAnNUJEQycsIC8vIFRhbmtidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVG93ZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1RUIxID0gS25hdmUgTHVuZ2VcclxuICAgICAgLy8gNUJGMiA9IEhlciBJbmZsb3Jlc2VuY2UgU2hvY2t3YXZlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1RUIxJywgJzVCRjInXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ba2FkYWVtaWFBbnlkZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FueWRlciBBY3JpZCBTdHJlYW0nOiAnNDMwNCcsXHJcbiAgICAnQW55ZGVyIFdhdGVyc3BvdXQnOiAnNDMwNicsXHJcbiAgICAnQW55ZGVyIFJhZ2luZyBXYXRlcnMnOiAnNDMwMicsXHJcbiAgICAnQW55ZGVyIFZpb2xlbnQgQnJlYWNoJzogJzQzMDUnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDEnOiAnM0UwOCcsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMic6ICczRTBBJyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDEnOiAnM0UwOScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAyJzogJzNFMEInLFxyXG4gICAgJ0FueWRlciBBcXVhdGljIExhbmNlJzogJzNFMDUnLFxyXG4gICAgJ0FueWRlciBTeXJ1cCBTcG91dCc6ICc0MzA4JyxcclxuICAgICdBbnlkZXIgTmVlZGxlIFN0b3JtJzogJzQzMDknLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDEnOiAnM0UxMCcsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMic6ICczRTExJyxcclxuICAgICdBbnlkZXIgUHV0cmlkIEJyZWF0aCc6ICczRTEyJyxcclxuICAgICdBbnlkZXIgRGV0b25hdG9yJzogJzQzMEYnLFxyXG4gICAgJ0FueWRlciBEb21pbmlvbiBTbGFzaCc6ICc0MzBEJyxcclxuICAgICdBbnlkZXIgUXVhc2FyJzogJzQzMEInLFxyXG4gICAgJ0FueWRlciBEYXJrIEFycml2aXNtZSc6ICc0MzBFJyxcclxuICAgICdBbnlkZXIgVGh1bmRlcnN0b3JtJzogJzNFMUMnLFxyXG4gICAgJ0FueWRlciBXaW5kaW5nIEN1cnJlbnQnOiAnM0UxRicsXHJcbiAgICAvLyAzRTIwIGlzIGJlaW5nIGhpdCBieSB0aGUgZ3Jvd2luZyBvcmJzLCBtYXliZT9cclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbWF1cm90LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbWF1cm90IEJ1cm5pbmcgU2t5JzogJzM1NEEnLFxyXG4gICAgJ0FtYXVyb3QgV2hhY2snOiAnMzUzQycsXHJcbiAgICAnQW1hdXJvdCBBZXRoZXJzcGlrZSc6ICczNTNCJyxcclxuICAgICdBbWF1cm90IFZlbmVtb3VzIEJyZWF0aCc6ICczQ0NFJyxcclxuICAgICdBbWF1cm90IENvc21pYyBTaHJhcG5lbCc6ICc0RDI2JyxcclxuICAgICdBbWF1cm90IEVhcnRocXVha2UnOiAnM0NDRCcsXHJcbiAgICAnQW1hdXJvdCBNZXRlb3IgUmFpbic6ICczQ0M2JyxcclxuICAgICdBbWF1cm90IEZpbmFsIFNreSc6ICczQ0NCJyxcclxuICAgICdBbWF1cm90IE1hbGV2b2xlbmNlJzogJzM1NDEnLFxyXG4gICAgJ0FtYXVyb3QgVHVybmFib3V0JzogJzM1NDInLFxyXG4gICAgJ0FtYXVyb3QgU2lja2x5IEluZmVybm8nOiAnM0RFMycsXHJcbiAgICAnQW1hdXJvdCBEaXNxdWlldGluZyBHbGVhbSc6ICczNTQ2JyxcclxuICAgICdBbWF1cm90IEJsYWNrIERlYXRoJzogJzM1NDMnLFxyXG4gICAgJ0FtYXVyb3QgRm9yY2Ugb2YgTG9hdGhpbmcnOiAnMzU0NCcsXHJcbiAgICAnQW1hdXJvdCBEYW1uaW5nIFJheSAxJzogJzNFMDAnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMic6ICczRTAxJyxcclxuICAgICdBbWF1cm90IERlYWRseSBUZW50YWNsZXMnOiAnMzU0NycsXHJcbiAgICAnQW1hdXJvdCBNaXNmb3J0dW5lJzogJzNDRTInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0FtYXVyb3QgQXBva2FseXBzaXMnOiAnM0NENycsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQW5hbW5lc2lzQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFBodWFibyBTcGluZSBMYXNoJzogJzREMUEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBBbmVtb25lIEZhbGxpbmcgUm9jayc6ICc0RTM3JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2UgZnJvbSBUcmVuY2ggQW5lbW9uZSBzaG93aW5nIHVwXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBEYWdvbml0ZSBTZXdlciBXYXRlcic6ICc0RDFDJywgLy8gZnJvbnRhbCBjb25hbCBmcm9tIFRyZW5jaCBBbmVtb25lICg/ISlcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFJvY2sgSGFyZCc6ICc0RDIxJywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWW92cmEgVG9ycmVudGlhbCBUb3JtZW50JzogJzREMjEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gTHVtaW5vdXMgUmF5JzogJzRFMjcnLCAvLyBVbmtub3duIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2luc3RlciBCdWJibGUgRXhwbG9zaW9uJzogJzRCNkUnLCAvLyBVbmtub3duIGV4cGxvc2lvbnMgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gUmVmbGVjdGlvbic6ICc0QjZGJywgLy8gVW5rbm93biBjb25hbCBhdHRhY2sgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMSc6ICc0Qjc0JywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBDbGVhcm91dCAyJzogJzRCNkInLCAvLyBVbmtub3duIGZyb250YWwgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNldGJhY2sgMSc6ICc0Qjc1JywgLy8gVW5rbm93biByZWFyIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDInOiAnNUI2QycsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBDbGlvbmlkIEFjcmlkIFN0cmVhbSc6ICc0RDI0JywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgRGl2aW5lciBEcmVhZHN0b3JtJzogJzREMjgnLCAvLyBncm91bmQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIDIwMDAtTWluYSBTd2luZyc6ICc0QjU1JywgLy8gS3lrbG9wcyBnZXQgb3V0IG1lY2hhbmljXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgSGFtbWVyJzogJzRCNUQnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgQmxhZGUnOiAnNEI1RScsIC8vIEt5a2xvcHMgSGFtbWVyL0JsYWRlIGFsdGVybmF0aW5nIHNxdWFyZXNcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBSYWdpbmcgR2xvd2VyJzogJzRCNTYnLCAvLyBLeWtsb3BzIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgRXllIE9mIFRoZSBDeWNsb25lJzogJzRCNTcnLCAvLyBLeWtsb3BzIGRvbnV0XHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBIYXJwb29uZXIgSHlkcm9iYWxsJzogJzREMjYnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBTd2lmdCBTaGlmdCc6ICc0QjgzJywgLy8gUnVrc2hzIERlZW0gdGVsZXBvcnQgTi9TXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBEZXB0aCBHcmlwIFdhdmVicmVha2VyJzogJzMzRDQnLCAvLyBSdWtzaHMgRGVlbSBoYW5kIGF0dGFja3NcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIFJpc2luZyBUaWRlJzogJzRCOEInLCAvLyBSdWtzaHMgRGVlbSBjcm9zcyBhb2VcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIENvbW1hbmQgQ3VycmVudCc6ICc0QjgyJywgLy8gUnVrc2hzIERlZW0gcHJvdGVhbi1pc2ggZ3JvdW5kIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWHpvbWl0IE1hbnRsZSBEcmlsbCc6ICc0RDE5JywgLy8gY2hhcmdlIGF0dGFja1xyXG4gICAgJ0FuYW1uZXNpcyBJbyBPdXNpYSBCYXJyZWxpbmcgU21hc2gnOiAnNEUyNCcsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBXYW5kZXJlclxcJ3MgUHlyZSc6ICc0QjVGJywgLy8gS3lrbG9wcyBzcHJlYWQgYXR0YWNrXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IE1pc3NpbmcgR3Jvd2luZyB0ZXRoZXJzIG9uIGJvc3MgMi5cclxuLy8gKE1heWJlIGdhdGhlciBwYXJ0eSBtZW1iZXIgbmFtZXMgb24gdGhlIHByZXZpb3VzIFRJSUlJTUJFRUVFRUVSIGNhc3QgZm9yIGNvbXBhcmlzb24/KVxyXG4vLyBUT0RPOiBGYWlsaW5nIHRvIGludGVycnVwdCBEb2huZmF1c3QgRnVhdGggb24gV2F0ZXJpbmcgV2hlZWwgY2FzdHM/XHJcbi8vICgxNTouLi4uLi4uLjpEb2huZmFzdCBGdWF0aDozREFBOldhdGVyaW5nIFdoZWVsOi4uLi4uLi4uOihcXHl7TmFtZX0pOilcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Eb2huTWhlZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRG9obiBNaGVnIEdleXNlcic6ICcyMjYwJywgLy8gV2F0ZXIgZXJ1cHRpb25zLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgSHlkcm9mYWxsJzogJzIyQkQnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIExhdWdoaW5nIExlYXAnOiAnMjI5NCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgU3dpbmdlJzogJzIyQ0EnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0RvaG4gTWhlZyBDYW5vcHknOiAnM0RCMCcsIC8vIEZyb250YWwgY29uZSwgRG9obmZhdXN0IFJvd2FucyB0aHJvdWdob3V0IGluc3RhbmNlXHJcbiAgICAnRG9obiBNaGVnIFBpbmVjb25lIEJvbWInOiAnM0RCMScsIC8vIENpcmN1bGFyIGdyb3VuZCBBb0UgbWFya2VyLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgQmlsZSBCb21iYXJkbWVudCc6ICczNEVFJywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBDb3Jyb3NpdmUgQmlsZSc6ICczNEVDJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDNcclxuICAgICdEb2huIE1oZWcgRmxhaWxpbmcgVGVudGFjbGVzJzogJzM2ODEnLFxyXG5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEltcCBDaG9pcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NkUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBUb2FkIENob2lyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFCNycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEZvb2xcXCdzIFR1bWJsZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxODMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogQmVyc2Vya2VyIDJuZC8zcmQgd2lsZCBhbmd1aXNoIHNob3VsZCBiZSBzaGFyZWQgd2l0aCBqdXN0IGEgcm9ja1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUhlcm9lc0dhdW50bGV0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUSEcgQmxhZGVcXCdzIEJlbmlzb24nOiAnNTIyOCcsIC8vIHBsZCBjb25hbFxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBIb2x5JzogJzUyNEInLCAvLyB3aG0gdmVyeSBsYXJnZSBhb2VcclxuICAgICdUSEcgSGlzc2F0c3U6IEdva2EnOiAnNTIzRCcsIC8vIHNhbSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBXaG9sZSBTZWxmJzogJzUyMkQnLCAvLyBtbmsgd2lkZSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBSYW5kZ3JpdGgnOiAnNTIzMicsIC8vIGRyZyB2ZXJ5IGJpZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMSc6ICc1MDYxJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMic6ICc1MDYyJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBDb3dhcmRcXCdzIEN1bm5pbmcnOiAnNEZENycsIC8vIFNwZWN0cmFsIFRoaWVmIENoaWNrZW4gS25pZmUgbGFzZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMSc6ICc0RkQxJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMic6ICc0RkQyJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUmluZyBvZiBEZWF0aCc6ICc1MjM2JywgLy8gZHJnIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBMdW5hciBFY2xpcHNlJzogJzUyMjcnLCAvLyBwbGQgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIEdyYXZpdHknOiAnNTI0OCcsIC8vIGluayBtYWdlIGNpcmN1bGFyXHJcbiAgICAnVEhHIFJhaW4gb2YgTGlnaHQnOiAnNTI0MicsIC8vIGJhcmQgbGFyZ2UgY2lyY3VsZSBhb2VcclxuICAgICdUSEcgRG9vbWluZyBGb3JjZSc6ICc1MjM5JywgLy8gZHJnIGxpbmUgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIERhcmsgSUknOiAnNEY2MScsIC8vIE5lY3JvbWFuY2VyIDEyMCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgQnVyc3QnOiAnNTNCNycsIC8vIE5lY3JvbWFuY2VyIG5lY3JvYnVyc3Qgc21hbGwgem9tYmllIGV4cGxvc2lvblxyXG4gICAgJ1RIRyBQYWluIE1pcmUnOiAnNEZBNCcsIC8vIE5lY3JvbWFuY2VyIHZlcnkgbGFyZ2UgZ3JlZW4gYmxlZWQgcHVkZGxlXHJcbiAgICAnVEhHIERhcmsgRGVsdWdlJzogJzRGNUQnLCAvLyBOZWNyb21hbmNlciBncm91bmQgYW9lXHJcbiAgICAnVEhHIFRla2thIEdvamluJzogJzUyM0UnLCAvLyBzYW0gOTAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAxJzogJzUyMEEnLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDInOiAnNTIwQicsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBXaWxkIFJhZ2UnOiAnNTIwMycsIC8vIEJlcnNlcmtlciBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUSEcgQWJzb2x1dGUgVGh1bmRlciBJVic6ICc1MjQ1JywgLy8gaGVhZG1hcmtlciBhb2UgZnJvbSBibG1cclxuICAgICdUSEcgTW9vbmRpdmVyJzogJzUyMzMnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGRyZ1xyXG4gICAgJ1RIRyBTcGVjdHJhbCBHdXN0JzogJzUzQ0YnLCAvLyBTcGVjdHJhbCBUaGllZiBoZWFkbWFya2VyIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVEhHIEZhbGxpbmcgUm9jayc6ICc1MjA1JywgLy8gQmVyc2Vya2VyIGhlYWRtYXJrZXIgYW9lIHRoYXQgY3JlYXRlcyBydWJibGVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RIRyBCbGVlZGluZyc6ICc4MjgnLCAvLyBTdGFuZGluZyBpbiB0aGUgTmVjcm9tYW5jZXIgcHVkZGxlIG9yIG91dHNpZGUgdGhlIEJlcnNlcmtlciBhcmVuYVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnVEhHIFRydWx5IEJlcnNlcmsnOiAnOTA2JywgLy8gU3RhbmRpbmcgaW4gdGhlIGNyYXRlciB0b28gbG9uZ1xyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSBzaGFyZWQuICBPbiBhbGwgdGltZXMgYnV0IHRoZSAybmQgYW5kIDNyZCwgaXQncyBhIHBhcnR5IHNoYXJlLlxyXG4gICAgLy8gVE9ETzogb24gdGhlIDJuZCBhbmQgM3JkIHRpbWUgdGhpcyBzaG91bGQgb25seSBiZSBzaGFyZWQgd2l0aCBhIHJvY2suXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5IHdhcm4gb24gdGFraW5nIG9uZSBvZiB0aGVzZSB3aXRoIGEgNDcyIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgZWZmZWN0XHJcbiAgICAnVEhHIFdpbGQgQW5ndWlzaCc6ICc1MjA5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEhHIFdpbGQgUmFtcGFnZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNTIwNycsXHJcbiAgICAgIC8vIFRoaXMgaXMgemVybyBkYW1hZ2UgaWYgeW91IGFyZSBpbiB0aGUgY3JhdGVyLlxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiBlLmRhbWFnZSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkhvbG1pbnN0ZXJTd2l0Y2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGh1bWJzY3Jldyc6ICczREM2JyxcclxuICAgICdIb2xtaW5zdGVyIFdvb2RlbiBob3JzZSc6ICczREM3JyxcclxuICAgICdIb2xtaW5zdGVyIExpZ2h0IFNob3QnOiAnM0RDOCcsXHJcbiAgICAnSG9sbWluc3RlciBIZXJldGljXFwncyBGb3JrJzogJzNEQ0UnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSG9seSBXYXRlcic6ICczREQ0JyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDEnOiAnM0RERCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAyJzogJzNEREUnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMyc6ICczRERGJyxcclxuICAgICdIb2xtaW5zdGVyIENhdCBPXFwnIE5pbmUgVGFpbHMnOiAnM0RFMScsXHJcbiAgICAnSG9sbWluc3RlciBSaWdodCBLbm91dCc6ICczREU2JyxcclxuICAgICdIb2xtaW5zdGVyIExlZnQgS25vdXQnOiAnM0RFNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBBZXRoZXJzdXAnOiAnM0RFOScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIEZsYWdlbGxhdGlvbic6ICczREQ2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGFwaGVwaG9iaWEnOiAnNDE4MScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWFsaWthaHNXZWxsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdNYWxpa2FoIEZhbGxpbmcgUm9jayc6ICczQ0VBJyxcclxuICAgICdNYWxpa2FoIFdlbGxib3JlJzogJzNDRUQnLFxyXG4gICAgJ01hbGlrYWggR2V5c2VyIEVydXB0aW9uJzogJzNDRUUnLFxyXG4gICAgJ01hbGlrYWggU3dpZnQgU3BpbGwnOiAnM0NGMCcsXHJcbiAgICAnTWFsaWthaCBCcmVha2luZyBXaGVlbCAxJzogJzNDRjUnLFxyXG4gICAgJ01hbGlrYWggQ3J5c3RhbCBOYWlsJzogJzNDRjcnLFxyXG4gICAgJ01hbGlrYWggSGVyZXRpY1xcJ3MgRm9yayAxJzogJzNDRjknLFxyXG4gICAgJ01hbGlrYWggQnJlYWtpbmcgV2hlZWwgMic6ICczQ0ZBJyxcclxuICAgICdNYWxpa2FoIEhlcmV0aWNcXCdzIEZvcmsgMic6ICczRTBFJyxcclxuICAgICdNYWxpa2FoIEVhcnRoc2hha2UnOiAnM0UzOScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBpbmNsdWRlIDU0ODQgTXVkbWFuIFJvY2t5IFJvbGwgYXMgYSBzaGFyZVdhcm4sIGJ1dCBpdCdzIGxvdyBkYW1hZ2UgYW5kIGNvbW1vbi5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRveWFzUmVsaWN0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdNYXRveWEgUmVsaWN0IFdlcmV3b29kIE92YXRpb24nOiAnNTUxOCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnTWF0b3lhIENhdmUgVGFyYW50dWxhIEhhd2sgQXBpdG94aW4nOiAnNTUxOScsIC8vIGJpZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFNwcmlnZ2FuIFN0b25lYmVhcmVyIFJvbXAnOiAnNTUxQScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBTb25ueSBPZiBaaWdneSBKaXR0ZXJpbmcgR2xhcmUnOiAnNTUxQycsIC8vIGxvbmcgbmFycm93IGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gUXVhZ21pcmUnOiAnNTQ4MScsIC8vIE11ZG1hbiBhb2UgcHVkZGxlc1xyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDEnOiAnNTQ4RScsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMic6ICc1NDhGJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAzJzogJzU0OTAnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gTXVkIEJ1YmJsZSc6ICc1NDg3JywgLy8gc3RhbmRpbmcgaW4gbXVkIHB1ZGRsZT9cclxuICAgICdNYXRveWEgQ2F2ZSBQdWdpbCBTY3Jld2RyaXZlcic6ICc1NTFFJywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIE5peGllIEd1cmdsZSc6ICc1OTkyJywgLy8gTml4aWUgd2FsbCBmbHVzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgUHlyb2NsYXN0aWMgU2hvdCc6ICc1N0VCJywgLy8gdGhlIGxpbmUgYW9lcyBhcyB5b3UgcnVuIHRvIHRyYXNoXHJcbiAgICAnTWF0b3lhIFJlbGljdCBGbGFuIEZsb29kJzogJzU1MjMnLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBQeXJvZHVjdCBFbGR0aHVycyBNYXNoJzogJzU1MjcnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdHlvYSBQeXJvZHVjdCBFbGR0aHVycyBTcGluJzogJzU1MjgnLCAvLyB2ZXJ5IGxhcmdlIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IEJhdmFyb2lzIFRodW5kZXIgSUlJJzogJzU1MjUnLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNYXJzaG1hbGxvdyBBbmNpZW50IEFlcm8nOiAnNTUyNCcsIC8vIHZlcnkgbGFyZ2UgbGluZSBncm9hb2VcclxuICAgICdNYXRveWEgUmVsaWN0IFB1ZGRpbmcgRmlyZSBJSSc6ICc1NTIyJywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgSG90IExhdmEnOiAnNTdFOScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgVm9sY2FuaWMgRHJvcCc6ICc1N0U4JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIE1lZGl1bSBSZWFyJzogJzU5MUQnLCAvLyBrbm9ja2JhY2sgaW50byBzYWZlIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBCYXJiZXF1ZSBMaW5lJzogJzU5MTcnLCAvLyBsaW5lIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgQ2lyY2xlJzogJzU5MTgnLCAvLyBjaXJjbGUgYW9lIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBUbyBBIENyaXNwJzogJzU5MjUnLCAvLyBnZXR0aW5nIHRvIGNsb3NlIHRvIGJvc3MgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUHJveGllIEJ1ZmZldCc6ICc1OTI2JywgLy8gQWVvbGlhbiBDYXZlIFNwcml0ZSBsaW5lIGFvZSAoaXMgdGhpcyBhIHB1bj8pXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIFNlYSBTaGFudHknOiAnNTk4QycsIC8vIE5vdCB0YWtpbmcgdGhlIHB1ZGRsZSB1cCB0byB0aGUgdG9wPyBGYWlsaW5nIGFkZCBlbnJhZ2U/XHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdNYXRveWEgTml4aWUgQ3JhY2snOiAnNTk5MCcsIC8vIE5peGllIENyYXNoLVNtYXNoIHRhbmsgdGV0aGVyc1xyXG4gICAgJ01hdG95YSBOaXhpZSBTcHV0dGVyJzogJzU5OTMnLCAvLyBOaXhpZSBzcHJlYWQgbWFya2VyXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTXRHdWxnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdHdWxnIEltbW9sYXRpb24nOiAnNDFBQScsXHJcbiAgICAnR3VsZyBUYWlsIFNtYXNoJzogJzQxQUInLFxyXG4gICAgJ0d1bGcgSGVhdmVuc2xhc2gnOiAnNDFBOScsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMSc6ICczRDAwJyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAyJzogJzNEMDEnLFxyXG4gICAgJ0d1bGcgSHVycmljYW5lIFdpbmcnOiAnM0QwMycsXHJcbiAgICAnR3VsZyBFYXJ0aCBTaGFrZXInOiAnMzdGNScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWNhdGlvbic6ICc0MUFFJyxcclxuICAgICdHdWxnIEV4ZWdlc2lzJzogJzNEMDcnLFxyXG4gICAgJ0d1bGcgUGVyZmVjdCBDb250cml0aW9uJzogJzNEMEUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmllZCBBZXJvJzogJzQxQUQnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMSc6ICczRDE2JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDInOiAnM0QxOCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAzJzogJzQ2NjknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNCc6ICczRDE5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDUnOiAnM0QyMScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMSc6ICczRDFBJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAyJzogJzNEMUInLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDMnOiAnM0QyMCcsXHJcbiAgICAnR3VsZyBWZW5hIEFtb3Jpcyc6ICczRDI3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdHdWxnIEx1bWVuIEluZmluaXR1bSc6ICc0MUIyJyxcclxuICAgICdHdWxnIFJpZ2h0IFBhbG0nOiAnMzdGOCcsXHJcbiAgICAnR3VsZyBMZWZ0IFBhbG0nOiAnMzdGQScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBXaGF0IHRvIGRvIGFib3V0IEthaG4gUmFpIDVCNTA/XHJcbi8vIEl0IHNlZW1zIGltcG9zc2libGUgZm9yIHRoZSBtYXJrZWQgcGVyc29uIHRvIGF2b2lkIGVudGlyZWx5LlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlBhZ2x0aGFuLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdQYWdsdGhhbiBUZWxvdm91aXZyZSBQbGFndWUgU3dpcGUnOiAnNjBGQycsIC8vIGZyb250YWwgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTGVzc2VyIFRlbG9kcmFnb24gRW5ndWxmaW5nIEZsYW1lcyc6ICc2MEY1JywgLy8gZnJvbnRhbCBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIExpZ2h0bmluZyBCb2x0JzogJzVDNEMnLCAvLyBjaXJjdWxhciBsaWdodG5pbmcgYW9lIChvbiBzZWxmIG9yIHBvc3QpXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBCYWxsIE9mIExldmluIFNob2NrJzogJzVDNTInLCAvLyBwdWxzaW5nIHNtYWxsIGNpcmN1bGFyIGFvZXNcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIFN1cGVyY2hhcmdlZCBCYWxsIE9mIExldmluIFNob2NrJzogJzVDNTMnLCAvLyBwdWxzaW5nIGxhcmdlIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgV2lkZSBCbGFzdGVyJzogJzYwQzUnLCAvLyByZWFyIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9icm9iaW55YWsgRmFsbCBPZiBNYW4nOiAnNjE0OCcsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG90ZWsgUmVhcGVyIE1hZ2l0ZWsgQ2Fubm9uJzogJzYxMjEnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIFNoZWV0IG9mIEljZSc6ICc2MEY4JywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBGcm9zdCBCcmVhdGgnOiAnNjBGNycsIC8vIHZlcnkgbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBDb3JlIFN0YWJsZSBDYW5ub24nOiAnNUM5NCcsIC8vIGxhcmdlIGxpbmUgYW9lc1xyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgQ29yZSAyLVRvbnplIE1hZ2l0ZWsgTWlzc2lsZSc6ICc1Qzk1JywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb3RlayBTa3kgQXJtb3IgQWV0aGVyc2hvdCc6ICc1QzlDJywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gTWFyayBJSSBUZWxvdGVrIENvbG9zc3VzIEV4aGF1c3QnOiAnNUM5OScsIC8vIGxhcmdlIGxpbmUgYW9lXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBNaXNzaWxlIEV4cGxvc2l2ZSBGb3JjZSc6ICc1Qzk4JywgLy8gc2xvdyBtb3ZpbmcgaG9yaXpvbnRhbCBtaXNzaWxlc1xyXG4gICAgJ1BhZ2x0aGFuIFRpYW1hdCBGbGFtaXNwaGVyZSc6ICc2MTBGJywgLy8gdmVyeSBsb25nIGxpbmUgYW9lXHJcbiAgICAnUGFnbHRoYW4gQXJtb3JlZCBUZWxvZHJhZ29uIFRvcnRvaXNlIFN0b21wJzogJzYxNEInLCAvLyBsYXJnZSBjaXJjdWxhciBhb2UgZnJvbSB0dXJ0bGVcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIFRodW5kZXJvdXMgQnJlYXRoJzogJzYxNDknLCAvLyBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIE5haWwgVXBidXJzdCc6ICc2MDVCJywgLy8gc21hbGwgYW9lcyBiZWZvcmUgQmlnIEJ1cnN0XHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBOYWlsIEJpZyBCdXJzdCc6ICc1QjQ4JywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lcyBmcm9tIG5haWxzXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBQZXJpZ2VhbiBCcmVhdGgnOiAnNUI1OScsIC8vIGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlJzogJzVCNEUnLCAvLyBtZWdhZmxhcmUgcGVwcGVyb25pXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUgRGl2ZSc6ICc1QjUyJywgLy8gbWVnYWZsYXJlIGxpbmUgYW9lIGFjcm9zcyB0aGUgYXJlbmFcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIEZsYXJlJzogJzVCNEEnLCAvLyBsYXJnZSBwdXJwbGUgc2hyaW5raW5nIGNpcmNsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlJzogJzVCNEQnLCAvLyBtZWdhZmxhcmUgc3ByZWFkIG1hcmtlcnNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVRaXRhbmFSYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUWl0YW5hIFN1biBUb3NzJzogJzNDOEEnLCAvLyBHcm91bmQgQW9FLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBSb25rYW4gTGlnaHQgMSc6ICczQzhDJywgLy8gU3RhdHVlIGF0dGFjaywgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDEnOiAnM0M4RicsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBMb3phdGxcXCdzIEZ1cnkgMic6ICczQzkwJywgLy8gU2VtaWNpcmNsZSBjbGVhdmUsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgUm9jayc6ICczQzk2JywgLy8gU21hbGwgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgRmFsbGluZyBCb3VsZGVyJzogJzNDOTcnLCAvLyBMYXJnZSBncm91bmQgQW9FLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBUb3dlcmZhbGwnOiAnM0M5OCcsIC8vIFBpbGxhciBjb2xsYXBzZSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVmlwZXIgUG9pc29uIDInOiAnM0M5RScsIC8vIFN0YXRpb25hcnkgcG9pc29uIHB1ZGRsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAxJzogJzNDQTInLCAvLyBEYW5nZXJvdXMgbWlkZGxlIGR1cmluZyBzcHJlYWQgY2lyY2xlcywgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDMnOiAnM0NBNicsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggNCc6ICczQ0E3JywgLy8gRGFuZ2Vyb3VzIHNpZGVzIGR1cmluZyBzdGFjayBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDInOiAnM0Q2RCcsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIFdyYXRoIG9mIHRoZSBSb25rYSc6ICczRTJDJywgLy8gU3RhdHVlIGxpbmUgYXR0YWNrIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdRaXRhbmEgU2luc3BpdHRlcic6ICczRTM2JywgLy8gR29yaWxsYSBib3VsZGVyIHRvc3MgQW9FIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnUWl0YW5hIEhvdW5kIG91dCBvZiBIZWF2ZW4nOiAnNDJCOCcsIC8vIFRldGhlciBleHRlbnNpb24gZmFpbHVyZSwgYm9zcyB0aHJlZTsgNDJCNyBpcyBjb3JyZWN0IGV4ZWN1dGlvblxyXG4gICAgJ1FpdGFuYSBSb25rYW4gQWJ5c3MnOiAnNDNFQicsIC8vIEdyb3VuZCBBb0UgZnJvbSBtaW5pLWJvc3NlcyBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAxJzogJzNDOUQnLCAvLyBBb0UgZnJvbSB0aGUgMDBBQiBwb2lzb24gaGVhZCBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAyJzogJzNDQTMnLCAvLyBPdmVybGFwcGVkIGNpcmNsZXMgZmFpbHVyZSBvbiB0aGUgc3ByZWFkIGNpcmNsZXMgdmVyc2lvbiBvZiB0aGUgbWVjaGFuaWNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRoZSBHcmFuZCBDb3Ntb3NcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyYW5kQ29zbW9zLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3Ntb3MgSXJvbiBKdXN0aWNlJzogJzQ5MUYnLFxyXG4gICAgJ0Nvc21vcyBTbWl0ZSBPZiBSYWdlJzogJzQ5MjEnLFxyXG5cclxuICAgICdDb3Ntb3MgVHJpYnVsYXRpb24nOiAnNDlBNCcsXHJcbiAgICAnQ29zbW9zIERhcmsgU2hvY2snOiAnNDc2RicsXHJcbiAgICAnQ29zbW9zIFN3ZWVwJzogJzQ3NzAnLFxyXG4gICAgJ0Nvc21vcyBEZWVwIENsZWFuJzogJzQ3NzEnLFxyXG5cclxuICAgICdDb3Ntb3MgU2hhZG93IEJ1cnN0JzogJzQ5MjQnLFxyXG4gICAgJ0Nvc21vcyBCbG9vZHkgQ2FyZXNzJzogJzQ5MjcnLFxyXG4gICAgJ0Nvc21vcyBOZXBlbnRoaWMgUGx1bmdlJzogJzQ5MjgnLFxyXG4gICAgJ0Nvc21vcyBCcmV3aW5nIFN0b3JtJzogJzQ5MjknLFxyXG5cclxuICAgICdDb3Ntb3MgT2RlIFRvIEZhbGxlbiBQZXRhbHMnOiAnNDk1MCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIEdyb3VuZCc6ICc0MjczJyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmUgQnJlYXRoJzogJzQ5MkInLFxyXG4gICAgJ0Nvc21vcyBSb25rYW4gRnJlZXplJzogJzQ5MkUnLFxyXG4gICAgJ0Nvc21vcyBPdmVycG93ZXInOiAnNDkyRCcsXHJcblxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgTGVmdCc6ICc0NzYzJyxcclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIFJpZ2h0JzogJzQ3NjInLFxyXG4gICAgJ0Nvc21vcyBPdGhlcndvcmRseSBIZWF0JzogJzQ3NUMnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBJcmUnOiAnNDc2MScsXHJcbiAgICAnQ29zbW9zIFBsdW1tZXQnOiAnNDc2NycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4gVGV0aGVyJzogJzQ3NUYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29zbW9zIERhcmsgV2VsbCc6ICc0NzZEJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgU3ByZWFkJzogJzQ3MjQnLFxyXG4gICAgJ0Nvc21vcyBCbGFjayBGbGFtZSc6ICc0NzVEJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluJzogJzQ3NjAnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVR3aW5uaW5nLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUd2lubmluZyBBdXRvIENhbm5vbnMnOiAnNDNBOScsXHJcbiAgICAnVHdpbm5pbmcgSGVhdmUnOiAnM0RCOScsXHJcbiAgICAnVHdpbm5pbmcgMzIgVG9uemUgU3dpcGUnOiAnM0RCQicsXHJcbiAgICAnVHdpbm5pbmcgU2lkZXN3aXBlJzogJzNEQkYnLFxyXG4gICAgJ1R3aW5uaW5nIFdpbmQgU3BvdXQnOiAnM0RCRScsXHJcbiAgICAnVHdpbm5pbmcgU2hvY2snOiAnM0RGMScsXHJcbiAgICAnVHdpbm5pbmcgTGFzZXJibGFkZSc6ICczREVDJyxcclxuICAgICdUd2lubmluZyBWb3JwYWwgQmxhZGUnOiAnM0RDMicsXHJcbiAgICAnVHdpbm5pbmcgVGhyb3duIEZsYW1lcyc6ICczREMzJyxcclxuICAgICdUd2lubmluZyBNYWdpdGVrIFJheSc6ICczREYzJyxcclxuICAgICdUd2lubmluZyBIaWdoIEdyYXZpdHknOiAnM0RGQScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVHdpbm5pbmcgMTI4IFRvbnplIFN3aXBlJzogJzNEQkEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogRGVhZCBJcm9uIDVBQjAgKGVhcnRoc2hha2VycywgYnV0IG9ubHkgaWYgeW91IHRha2UgdHdvPylcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjeSBGb3VyZm9sZCc6ICc1QjM0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBQjQnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjI4JywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFBNCcsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFBNScsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFBNicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQTcnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFBOCcsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUE5JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFBRScsIC8vIENoYWluIGRhbWFnZVxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFBQicsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJsb29tcyc6ICc1QUFEJywgLy8gUHVycGxlIGdyb3dpbmcgY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaWdodC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MScsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSc6ICc1NzY1JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzVBJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtIERhaHUgSGVhZCBEb3duJzogJzU3NTYnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NTcnLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBGYWxsaW5nIFJvY2snOiAnNTc1QycsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc2NCcsIC8vIGRvdWJsZSBjaGFyZ2VcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpcHBlciBDbGF3JzogJzU3NUQnLCAvLyBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgVGFpbCBTd2luZyc6ICc1NzVGJywgLy8gdGFpbCBzd2luZyA7KVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFBhd24gT2ZmJzogJzU4MDYnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1ODBEJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAyJzogJzU4MEUnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDMnOiAnNTgwRicsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU3RjMnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU3RjInLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgQ291bnRlcnBsYXknOiAnNTdGNicsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdBOScsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2UgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QUEnLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEnOiAnNTdBNScsIC8vIHBoYW50b20gbGluZSBhb2UgZnJvbSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFZpbGUgV2F2ZSc6ICc1N0IxJywgLy8gcGhhbnRvbSBjb25hbCBhb2VcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTczJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk3MicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NzEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTY4JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTc0JywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAxJzogJzU5QkInLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMic6ICc1OUJEJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAxJzogJzU5QkEnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMic6ICc1OUJDJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBOb3J0aHN3YWluXFwncyBHbG93JzogJzU5QzQnLCAvLyBleHBhbmRpbmcgbGluZXMgd2l0aCBleHBsb3Npb24gaW50ZXJzZWN0aW9uc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlCRicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1OUUwJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMic6ICc1OUUxJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1OUUyJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBQYXduIE9mZic6ICc1OURBJywgLy8gU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2UgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1OUNFJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlciBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTlDQycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXQgZHVyaW5nIFF1ZWVuXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNUE2RScsIC8vIGV4cGxvc2lvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgUG9pc29uIFRyYXAnOiAnNUE2RicsIC8vIHBvaXNvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEhlYXQgU2hvY2snOiAnNTk1RScsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBDb2xkIFNob2NrJzogJzU5NUYnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtIERhaHUgSGVhdCBCcmVhdGgnOiAnNTc2NicsIC8vIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIFdyYXRoIE9mIEJvemphJzogJzU5NzUnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIE1vb24nOiAnMjYyJywgLy8gXCJQZXRyaWZpY2F0aW9uXCIgZnJvbSBBZXRoZXJpYWwgT3JiIGxvb2thd2F5XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBdCBsZWFzdCBkdXJpbmcgVGhlIFF1ZWVuLCB0aGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSxcclxuICAgICAgLy8gYW5kIHRoZSBmaXJzdCBleHBsb3Npb24gXCJoaXRzXCIgZXZlcnlvbmUsIGFsdGhvdWdoIHdpdGggXCIxQlwiIGZsYWdzLlxyXG4gICAgICBpZDogJ0RlbHVicnVtIExvdHMgQ2FzdCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiBbJzU2NUEnLCAnNTY1QicsICc1N0ZEJywgJzU3RkUnLCAnNUI4NicsICc1Qjg3JywgJzU5RDInLCAnNUQ5MyddLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiBlLmZsYWdzLnNsaWNlKC0yKSA9PT0gJzAzJyxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBEYWh1IDU3NzYgU3BpdCBGbGFtZSBzaG91bGQgYWx3YXlzIGhpdCBhIE1hcmNob3NpYXNcclxuLy8gVE9ETzogaGl0dGluZyBwaGFudG9tIHdpdGggaWNlIHNwaWtlcyB3aXRoIGFueXRoaW5nIGJ1dCBkaXNwZWw/XHJcbi8vIFRPRE86IGZhaWxpbmcgaWN5L2ZpZXJ5IHBvcnRlbnQgKGd1YXJkIGFuZCBxdWVlbilcclxuLy8gICAgICAgYDE4OlB5cmV0aWMgRG9UIFRpY2sgb24gJHtuYW1lfSBmb3IgJHtkYW1hZ2V9IGRhbWFnZS5gXHJcbi8vIFRPRE86IFdpbmRzIE9mIEZhdGUgLyBXZWlnaHQgT2YgRm9ydHVuZT9cclxuLy8gVE9ETzogVHVycmV0J3MgVG91cj9cclxuLy8gZ2VuZXJhbCB0cmFwczogZXhwbG9zaW9uOiA1QTcxLCBwb2lzb24gdHJhcDogNUE3MiwgbWluaTogNUE3M1xyXG4vLyBkdWVsIHRyYXBzOiBtaW5pOiA1N0ExLCBpY2U6IDU3OUYsIHRvYWQ6IDU3QTBcclxuLy8gVE9ETzogdGFraW5nIG1hbmEgZmxhbWUgd2l0aG91dCByZWZsZWN0XHJcbi8vIFRPRE86IHRha2luZyBNYWVsc3Ryb20ncyBCb2x0IHdpdGhvdXQgbGlnaHRuaW5nIGJ1ZmZcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgSGVsbGlzaCBTbGFzaCc6ICc1N0VBJywgLy8gQm96amFuIFNvbGRpZXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNsaW1lcyBWaXNjb3VzIFJ1cHR1cmUnOiAnNTAxNicsIC8vIEZ1bGx5IG1lcmdlZCB2aXNjb3VzIHNsaW1lIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgR29sZW1zIERlbW9saXNoJzogJzU4ODAnLCAvLyBpbnRlcnJ1cHRpYmxlIFJ1aW5zIEdvbGVtIGNhc3RcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBRDEnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjJBJywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFDQicsIC8vIENoYWluc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAxJzogJzVCOTQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMic6ICc1QUI5JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDMnOiAnNUFCQScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCA0JzogJzVBQkInLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNSc6ICc1QUJDJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUM4JywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBDb21ldCc6ICc1QUQ3JywgLy8gQ2xvbmUgbWV0ZW9yIGRyb3BwaW5nIGJlZm9yZSBjaGFyZ2VzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgRmlyZXN0b3JtJzogJzVBRDgnLCAvLyBDbG9uZSBjaGFyZ2UgYWZ0ZXIgQmFsZWZ1bCBDb21ldFxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFJvc2UnOiAnNUFEOScsIC8vIENsb25lIGxpbmUgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUMxJywgLy8gQmx1ZSByaW4gZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFDMicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFDMycsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQzQnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFDNScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUM2JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQWN0IE9mIE1lcmN5JzogJzVBQ0YnLCAvLyBjcm9zcy1zaGFwZWQgbGluZSBhb2VzXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc3MCcsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MicsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUgMSc6ICc1NzZGJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MScsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSc6ICc1Nzc0JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzZDJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSGVhZCBEb3duJzogJzU3NjgnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NjknLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGYWxsaW5nIFJvY2snOiAnNTc2RScsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc3MycsIC8vIGRvdWJsZSBjaGFyZ2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1NzlFJywgLy8gYm9tYnMgYmVpbmcgY2xlYXJlZFxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgVmljaW91cyBTd2lwZSc6ICc1Nzk3JywgLy8gY2lyY3VsYXIgYW9lIGFyb3VuZCBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGb2N1c2VkIFRyZW1vciAxJzogJzU3OEYnLCAvLyBzcXVhcmUgZmxvb3IgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMic6ICc1NzkxJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIERldm91cic6ICc1Nzg5JywgLy8gY29uYWwgYW9lIGFmdGVyIHdpdGhlcmluZyBjdXJzZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDEnOiAnNTc4QycsIC8vIGluaXRpYWwgcm90YXRpbmcgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGbGFpbGluZyBTdHJpa2UgMic6ICc1NzhEJywgLy8gcm90YXRpbmcgY2xlYXZlc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTd29yZCc6ICc1ODE5JywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgT2ZmZW5zaXZlIFNoaWVsZCc6ICc1ODFBJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1ODE2JywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1ODE3JywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1ODE4JywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFVubHVja3kgTG90JzogJzU4MUQnLCAvLyBRdWVlbidzIEtuaWdodCBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAxJzogJzU4M0QnLCAvLyBzbWFsbCBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBCdXJuIDInOiAnNTgzRScsIC8vIGxhcmdlIGZpcmUgYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFBhd24gT2ZmJzogJzU4M0EnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDEnOiAnNTg0NycsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDFcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDInOiAnNTg0OCcsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDMnOiAnNTg0OScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBzZWNvbmQgbGluZXNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBDb3VudGVycGxheSc6ICc1OEY1JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdCOCcsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QjknLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMSc6ICc1N0I0JywgLy8gSW5pdGlhbCBwaGFudG9tIGxpbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMic6ICc1N0I1JywgLy8gTGF0ZXIgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAxJzogJzU3QjYnLCAvLyBJbml0aWFsIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAyJzogJzU3QjcnLCAvLyBNb3ZpbmcgcGhhbnRvbSBjaXJjbGUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCRicsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NEMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYXNodmFuZSc6ICc1OTRCJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk0QScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5MzknLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NEQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgV2hhY2snOiAnNTdEMCcsIC8vIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRGV2YXN0YXRpbmcgQm9sdCAxJzogJzU3QzUnLCAvLyBsaWdodG5pbmcgcmluZ3NcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMic6ICc1N0M2JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBFbGVjdHJvY3V0aW9uJzogJzU3Q0MnLCAvLyByYW5kb20gY2lyY2xlIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFJhcGlkIEJvbHRzJzogJzU3QzMnLCAvLyBkcm9wcGVkIGxpZ2h0bmluZyBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCAxMTExLVRvbnplIFN3aW5nJzogJzU3RDgnLCAvLyB2ZXJ5IGxhcmdlIFwiZ2V0IG91dFwiIHN3aW5nXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBNb25rIEF0dGFjayc6ICc1NUE2JywgLy8gTW9uayBhZGQgYXV0by1hdHRhY2tcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUY0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUU3JywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlFQScsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUU4JywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDInOiAnNTlFOScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNUEwMicsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNUEwMycsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDEnOiAnNTlGMicsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQgMic6ICc1Qjg1JywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQgMSc6ICc1OUYxJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDInOiAnNUI4NCcsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBQYXduIE9mZic6ICc1QTFEJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5RkYnLCAvLyBPcHRpbWFsIFBsYXkgU3dvcmQgXCJnZXQgb3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzVBMDAnLCAvLyBPcHRpbWFsIHBsYXkgc2hpZWxkIFwiZ2V0IGluXCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgQ2xlYXZlJzogJzVBMDEnLCAvLyBPcHRpbWFsIFBsYXkgY2xlYXZlcyBmb3Igc3dvcmQvc2hpZWxkXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzVBMjgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzVBMkEnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzVBMjknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEhlYXQgU2hvY2snOiAnNTkyNycsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBDb2xkIFNob2NrJzogJzU5MjgnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUVCJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEd1bm5oaWxkclxcJ3MgQmxhZGVzJzogJzVCMjInLCAvLyBub3QgYmVpbmcgaW4gdGhlIGNoZXNzIGJsdWUgc2FmZSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBVbmx1Y2t5IExvdCc6ICc1NUI2JywgLy8gbGlnaHRuaW5nIG9yYiBhdHRhY2tcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5IGFuZCBcImhpdFwiIHBlb3BsZSB3aGVuIGxldml0YXRpbmcuXHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR3VhcmQgTG90cyBDYXN0JyxcclxuICAgICAgZGFtYWdlUmVnZXg6IFsnNTgyNycsICc1ODI4JywgJzVCNkMnLCAnNUI2RCcsICc1QkI2JywgJzVCQjcnLCAnNUI4OCcsICc1Qjg5J10sXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUuZmxhZ3Muc2xpY2UoLTIpID09PSAnMDMnLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEZWx1YnJ1bVNhdiBHb2xlbSBDb21wYWN0aW9uJyxcclxuICAgICAgYWJpbGl0eVJlZ2V4OiAnNTc0NicsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGZ1bGxUZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgU2xpbWUgU2FuZ3VpbmUgRnVzaW9uJyxcclxuICAgICAgYWJpbGl0eVJlZ2V4OiAnNTU0RCcsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGZ1bGxUZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMU4gRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRFRCcsXHJcbiAgICAnRTFOIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEVDJyxcclxuICAgICdFMU4gUHVyZSBCZWFtJzogJzNEOUUnLFxyXG4gICAgJ0UxTiBQYXJhZGlzZSBMb3N0JzogJzNEQTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBGbGFyZSc6ICczRDk3JyxcclxuICAgICdFMU4gUHVyZSBMaWdodCc6ICczREEzJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxTiBGaXJlIElJSSc6ICc0NEVCJyxcclxuICAgICdFMU4gVmljZSBPZiBWYW5pdHknOiAnNDRFNycsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFOIFZpY2UgT2YgQXBhdGh5JzogJzQ0RTgnLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogZmFpbGluZyB0byBpbnRlcnJ1cHQgTWFuYSBCb29zdCAoM0Q4RClcclxuLy8gVE9ETzogZmFpbGluZyB0byBwYXNzIGhlYWxlciBkZWJ1ZmY/XHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UgZG9uJ3Qga2lsbCBhIG1ldGVvciBkdXJpbmcgZm91ciBvcmJzP1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMVMgRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRGNycsXHJcbiAgICAnRTFTIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEY2JyxcclxuICAgICdFMVMgRWRlblxcJ3MgUmVnYWluZWQgQmxpenphcmQgSUlJJzogJzQ0RkEnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAxJzogJzNEODMnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAyJzogJzNEODQnLFxyXG4gICAgJ0UxUyBQYXJhZGlzZSBMb3N0JzogJzNEODcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBGbGFyZSc6ICczRDczJyxcclxuICAgICdFMVMgUHVyZSBMaWdodCc6ICczRDhBJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxUyBGaXJlL1RodW5kZXIgSUlJJzogJzQ0RkInLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gU2luZ2xlJzogJzNEODEnLFxyXG4gICAgJ0UxUyBWaWNlIE9mIFZhbml0eSc6ICc0NEYxJywgLy8gdGFuayBsYXNlcnNcclxuICAgICdFMVMgVmljZSBvZiBBcGF0aHknOiAnNDRGMicsIC8vIGRwcyBwdWRkbGVzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZSAodG9wIGxpbmUgZmFpbCwgYm90dG9tIGxpbmUgc3VjY2VzcywgZWZmZWN0IHRoZXJlIHRvbylcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDYxMjM0NTpUaW5pIFBvdXRpbmk6RjoxMDAwMDoxMDAxOTBGOlxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjc4OTBBOlBvdGF0byBDaGlwcHk6MTowOjFDOjgwMDA6XHJcbi8vIGdhaW5zIHRoZSBlZmZlY3Qgb2YgUGV0cmlmaWNhdGlvbiBmcm9tIFZvaWR3YWxrZXIgZm9yIDEwLjAwIFNlY29uZHMuXHJcbi8vIFRPRE86IHB1ZGRsZSBmYWlsdXJlP1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJOIERvb212b2lkIFNsaWNlcic6ICczRTNDJyxcclxuICAgICdFMk4gRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTNCJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTJOIE55eCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnM0UzRCcsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6IGUuYWJpbGl0eU5hbWUsXHJcbiAgICAgICAgICAgIGZyOiAnTWFsdXMgZGUgZMOpZ8OidHMnLFxyXG4gICAgICAgICAgICBqYTogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgICAgY246IGUuYWJpbGl0eU5hbWUsXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlXHJcbi8vIFRPRE86IEVtcHR5IEhhdGUgKDNFNTkvM0U1QSkgaGl0cyBldmVyeWJvZHksIHNvIGhhcmQgdG8gdGVsbCBhYm91dCBrbm9ja2JhY2tcclxuLy8gVE9ETzogbWF5YmUgbWFyayBoZWxsIHdpbmQgcGVvcGxlIHdobyBnb3QgY2xpcHBlZCBieSBzdGFjaz9cclxuLy8gVE9ETzogbWlzc2luZyBwdWRkbGVzP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGxpZ2h0L2RhcmsgY2lyY2xlIHN0YWNrXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVEZXNjZW50U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMlMgRG9vbXZvaWQgU2xpY2VyJzogJzNFNTAnLFxyXG4gICAgJ0UzUyBFbXB0eSBSYWdlJzogJzNFNkMnLFxyXG4gICAgJ0UzUyBEb29tdm9pZCBHdWlsbG90aW5lJzogJzNFNEYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIENsZWF2ZXInOiAnM0U2NCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyUyBTaGFkb3dleWUnLFxyXG4gICAgICAvLyBTdG9uZSBDdXJzZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTg5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgTnl4JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICczRTUxJyxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IGUudGFyZ2V0TmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBlLmFiaWxpdHlOYW1lLFxyXG4gICAgICAgICAgICBjbjogJ+aUu+WHu+S8pOWus+mZjeS9jicsXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAxJzogJzNGQ0EnLFxyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM04gTWFlbHN0cm9tJzogJzNGRDknLFxyXG4gICAgJ0UzTiBTd2lybGluZyBUc3VuYW1pJzogJzNGRDUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGQ0UnLFxyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGQ0QnLFxyXG4gICAgJ0UzTiBTcGlubmluZyBEaXZlJzogJzNGREInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTNOIFJpcCBDdXJyZW50JzogJzNGQzcnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogU2NvdXJpbmcgVHN1bmFtaSAoM0NFMCkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXRcclxuLy8gVE9ETzogU3dlZXBpbmcgVHN1bmFtaSAoM0ZGNSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YW5rc1xyXG4vLyBUT0RPOiBSaXAgQ3VycmVudCAoM0ZFMCwgM0ZFMSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXQvdGFua3NcclxuLy8gVE9ETzogQm9pbGVkIEFsaXZlICg0MDA2KSBpcyBmYWlsaW5nIHB1ZGRsZXM/Pz9cclxuLy8gVE9ETzogZmFpbGluZyB0byBjbGVhbnNlIFNwbGFzaGluZyBXYXRlcnNcclxuLy8gVE9ETzogZG9lcyBnZXR0aW5nIGhpdCBieSB1bmRlcnNlYSBxdWFrZSBjYXVzZSBhbiBhYmlsaXR5P1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAxJzogJzNGRTUnLFxyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM1MgTWFlbHN0cm9tJzogJzNGRkInLFxyXG4gICAgJ0UzUyBTd2lybGluZyBUc3VuYW1pJzogJzNGRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGRUEnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGRUInLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAzJzogJzNGRUMnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCA0JzogJzNGRUQnLFxyXG4gICAgJ0UzUyBTcGlubmluZyBEaXZlJzogJzNGRkQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTROIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MEVCJyxcclxuICAgICdFNE4gRXZpbCBFYXJ0aCc6ICc0MEVGJyxcclxuICAgICdFNE4gQWZ0ZXJzaG9jayAxJzogJzQxQjQnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDInOiAnNDBGMCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAxJzogJzQwRUQnLFxyXG4gICAgJ0U0TiBFeHBsb3Npb24gMic6ICc0MEY1JyxcclxuICAgICdFNE4gTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0TiBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMDAnLFxyXG4gICAgJ0U0TiBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDBGRicsXHJcbiAgICAnRTROIE1hc3NpdmUgTGFuZHNsaWRlJzogJzQwRkMnLFxyXG4gICAgJ0U0TiBTZWlzbWljIFdhdmUnOiAnNDBGMycsXHJcbiAgICAnRTROIEZhdWx0IExpbmUnOiAnNDEwMScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIHBlb3BsZSBnZXQgaGl0dGluZyBieSBtYXJrZXJzIHRoZXkgc2hvdWxkbid0XHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YW5rcyBnZXR0aW5nIGhpdCBieSB0YW5rYnVzdGVycywgbWVnYWxpdGhzXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YXJnZXQgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlclxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNFMgV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQxMDgnLFxyXG4gICAgJ0U0UyBFdmlsIEVhcnRoJzogJzQxMEMnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDEnOiAnNDFCNScsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMic6ICc0MTBEJyxcclxuICAgICdFNFMgRXhwbG9zaW9uJzogJzQxMEEnLFxyXG4gICAgJ0U0UyBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTRTIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDExRCcsXHJcbiAgICAnRTRTIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MTFDJyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMSc6ICc0MTE4JyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMic6ICc0MTE5JyxcclxuICAgICdFNFMgU2Vpc21pYyBXYXZlJzogJzQxMTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMSc6ICc0MTM1JyxcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDInOiAnNDY4NycsXHJcbiAgICAnRTRTIFBsYXRlIEZyYWN0dXJlJzogJzQzRUEnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMSc6ICc0M0NBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDInOiAnNDNDOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+OCv+OCpOOCv+ODsycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfms7DlnaYnIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn7YOA7J207YOEJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZhdWx0TGluZVRhcmdldCA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNDExRScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IGRhdGEuZmF1bHRMaW5lVGFyZ2V0ICE9PSBlLnRhcmdldE5hbWUsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUnVuIE92ZXInLFxyXG4gICAgICAgICAgICBkZTogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIMOpY3Jhc8OpKGUpJyxcclxuICAgICAgICAgICAgamE6IGUuYWJpbGl0eU5hbWUsXHJcbiAgICAgICAgICAgIGNuOiBlLmFiaWxpdHlOYW1lLFxyXG4gICAgICAgICAgICBrbzogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1TiBJbXBhY3QnOiAnNEUzQScsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVOIExpZ2h0bmluZyBCb2x0JzogJzRCOUMnLCAvLyBTdG9ybWNsb3VkIHN0YW5kYXJkIGF0dGFja1xyXG4gICAgJ0U1TiBHYWxsb3AnOiAnNEI5NycsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNU4gU2hvY2sgU3RyaWtlJzogJzRCQTEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVOIFZvbHQgU3RyaWtlJzogJzRDRjInLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVOIEp1ZGdtZW50IEpvbHQnOiAnNEI4RicsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIGEgcGxheWVyIGdldHMgNCsgc3RhY2tzIG9mIG9yYnMuIERvbid0IGJlIGdyZWVkeSFcclxuICAgICAgaWQ6ICdFNU4gU3RhdGljIENvbmRlbnNhdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNU4gT3JiIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0QjlBJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gIWRhdGEuaGFzT3JiW2UudGFyZ2V0TmFtZV0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBlLmFiaWxpdHlOYW1lICsgJyAobm8gb3JiKScsXHJcbiAgICAgICAgICAgIGRlOiBlLmFiaWxpdHlOYW1lICsgJyAoa2VpbiBPcmIpJyxcclxuICAgICAgICAgICAgZnI6IGUuYWJpbGl0eU5hbWUgKyAnKHBhcyBkXFwnb3JiZSknLFxyXG4gICAgICAgICAgICBqYTogZS5hYmlsaXR5TmFtZSArICco6Zu3546J54Sh44GXKScsXHJcbiAgICAgICAgICAgIGNuOiBlLmFiaWxpdHlOYW1lICsgJyjmsqHlkIPnkIMpJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgVGFyZ2V0IFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPSBkYXRhLmNsb3VkTWFya2VycyB8fCBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNU4gVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0QjlEJyxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAzMCxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IG0gb2YgZGF0YS5jbG91ZE1hcmtlcnMpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgICAgYmxhbWU6IGRhdGEuY2xvdWRNYXJrZXJzW21dLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGUuYWJpbGl0eU5hbWUgKyAnKGNsb3VkcyB0b28gY2xvc2UpJyxcclxuICAgICAgICAgICAgICBkZTogZS5hYmlsaXR5TmFtZSArICcoV29sa2VuIHp1IG5haGUpJyxcclxuICAgICAgICAgICAgICBmcjogZS5hYmlsaXR5TmFtZSArICcobnVhZ2VzIHRyb3AgcHJvY2hlcyknLFxyXG4gICAgICAgICAgICAgIGphOiBlLmFiaWxpdHlOYW1lICsgJyjpm7Lov5HjgZnjgY4pJyxcclxuICAgICAgICAgICAgICBjbjogZS5hYmlsaXR5TmFtZSArICco6Zu35LqR6YeN5Y+gKScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLCAvLyBTdG9ybWNsb3VkcyByZXNvbHZlIHdlbGwgYmVmb3JlIHRoaXMuXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogaXMgdGhlcmUgYSBkaWZmZXJlbnQgYWJpbGl0eSBpZiB0aGUgc2hpZWxkIGR1dHkgYWN0aW9uIGlzbid0IHVzZWQgcHJvcGVybHk/XHJcbi8vIFRPRE86IGlzIHRoZXJlIGFuIGFiaWxpdHkgZnJvbSBSYWlkZW4gKHRoZSBiaXJkKSBpZiB5b3UgZ2V0IGVhdGVuP1xyXG4vLyBUT0RPOiBtYXliZSBjaGFpbiBsaWdodG5pbmcgd2FybmluZyBpZiB5b3UgZ2V0IGhpdCB3aGlsZSB5b3UgaGF2ZSBzeXN0ZW0gc2hvY2sgKDhCOClcclxuXHJcbmNvbnN0IG5vT3JiID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gb3JiKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBPcmIpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZFxcJ29yYmUpJyxcclxuICAgIGphOiBzdHIgKyAnICjpm7fnjonnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHlkIPnkIMpJyxcclxuICAgIGtvOiBzdHIgKyAnICjqtazsiqwg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1UyBJbXBhY3QnOiAnNEUzQicsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVTIEdhbGxvcCc6ICc0QkI0JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1UyBTaG9jayBTdHJpa2UnOiAnNEJDMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgVHdpc3Rlcic6ICc0QkM3JywgLy8gVHdpc3RlciBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBEb251dCc6ICc0QkM4JywgLy8gRG9udXQgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU2hvY2snOiAnNEUzRCcsIC8vIEhhdGVkIG9mIExldmluIFN0b3JtY2xvdWQtY2xlYW5zYWJsZSBleHBsb2RpbmcgZGVidWZmXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVTIEp1ZGdtZW50IEpvbHQnOiAnNEJBNycsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U1UyBWb2x0IFN0cmlrZSBEb3VibGUnOiAnNEJDMycsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgQ3JpcHBsaW5nIEJsb3cnOiAnNEJDQScsXHJcbiAgICAnRTVTIENoYWluIExpZ2h0bmluZyBEb3VibGUnOiAnNEJDNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNVMgT3JiIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0QkI3JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYltlLnRhcmdldE5hbWVdLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogbm9PcmIoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFZvbHQgU3RyaWtlIE9yYicsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEJDMycsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbZS50YXJnZXROYW1lXSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IG5vT3JiKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEZWFkbHkgRGlzY2hhcmdlIEJpZyBLbm9ja2JhY2snLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRCQjInLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW2UudGFyZ2V0TmFtZV0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBub09yYihlLmFiaWxpdHlOYW1lKSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgTGlnaHRuaW5nIEJvbHQnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRCQjknLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gSGF2aW5nIGEgbm9uLWlkZW1wb3RlbnQgY29uZGl0aW9uIGZ1bmN0aW9uIGlzIGEgYml0IDxfPFxyXG4gICAgICAgIC8vIE9ubHkgY29uc2lkZXIgbGlnaHRuaW5nIGJvbHQgZGFtYWdlIGlmIHlvdSBoYXZlIGEgZGVidWZmIHRvIGNsZWFyLlxyXG4gICAgICAgIGlmICghZGF0YS5oYXRlZCB8fCAhZGF0YS5oYXRlZFtlLnRhcmdldE5hbWVdKVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkW2UudGFyZ2V0TmFtZV07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgSGF0ZWQgb2YgTGV2aW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMEQyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID0gZGF0YS5oYXRlZCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzID0gZGF0YS5jbG91ZE1hcmtlcnMgfHwgW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVTIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEJCQScsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIGRhdGEuY2xvdWRNYXJrZXJzKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBkYXRhLmNsb3VkTWFya2Vyc1ttXSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBlLmFiaWxpdHlOYW1lICsgJyhjbG91ZHMgdG9vIGNsb3NlKScsXHJcbiAgICAgICAgICAgICAgZGU6IGUuYWJpbGl0eU5hbWUgKyAnKFdvbGtlbiB6dSBuYWhlKScsXHJcbiAgICAgICAgICAgICAgZnI6IGUuYWJpbGl0eU5hbWUgKyAnKG51YWdlcyB0cm9wIHByb2NoZXMpJyxcclxuICAgICAgICAgICAgICBqYTogZS5hYmlsaXR5TmFtZSArICco6Zuy6L+R44GZ44GOKScsXHJcbiAgICAgICAgICAgICAgY246IGUuYWJpbGl0eU5hbWUgKyAnKOmbt+S6kemHjeWPoCknLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgLy8gU3Rvcm1jbG91ZHMgcmVzb2x2ZSB3ZWxsIGJlZm9yZSB0aGlzLlxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNk4gVGhvcm5zJzogJzRCREEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMSc6ICc0QkREJyxcclxuICAgICdFNk4gRmVyb3N0b3JtIDInOiAnNEJFNScsXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QkUwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMic6ICc0QkU2JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2TiBFeHBsb3Npb24nOiAnNEJFMicsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2TiBIZWF0IEJ1cnN0JzogJzRCRUMnLFxyXG4gICAgJ0U2TiBDb25mbGFnIFN0cmlrZSc6ICc0QkVFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2TiBTcGlrZSBPZiBGbGFtZSc6ICc0QkYwJywgLy8gT3JiIGV4cGxvc2lvbnMgYWZ0ZXIgU3RyaWtlIFNwYXJrXHJcbiAgICAnRTZOIFJhZGlhbnQgUGx1bWUnOiAnNEJGMicsXHJcbiAgICAnRTZOIEVydXB0aW9uJzogJzRCRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2TiBWYWN1dW0gU2xpY2UnOiAnNEJENScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNk4gRG93bmJ1cnN0JzogJzRCREInLCAvLyBCbHVlIGtub2NrYmFjayBjaXJjbGUuIEFjdHVhbCBrbm9ja2JhY2sgaXMgdW5rbm93biBhYmlsaXR5IDRDMjBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gS2lsbHMgbm9uLXRhbmtzIHdobyBnZXQgaGl0IGJ5IGl0LlxyXG4gICAgJ0U2TiBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QkVEJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGNoZWNrIHRldGhlcnMgYmVpbmcgY3V0ICh3aGVuIHRoZXkgc2hvdWxkbid0KVxyXG4vLyBUT0RPOiBjaGVjayBmb3IgY29uY3Vzc2VkIGRlYnVmZlxyXG4vLyBUT0RPOiBjaGVjayBmb3IgdGFraW5nIHRhbmtidXN0ZXIgd2l0aCBsaWdodGhlYWRlZFxyXG4vLyBUT0RPOiBjaGVjayBmb3Igb25lIHBlcnNvbiB0YWtpbmcgbXVsdGlwbGUgU3Rvcm0gT2YgRnVyeSBUZXRoZXJzICg0QzAxLzRDMDgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIEl0J3MgY29tbW9uIHRvIGp1c3QgaWdub3JlIGZ1dGJvbCBtZWNoYW5pY3MsIHNvIGRvbid0IHdhcm4gb24gU3RyaWtlIFNwYXJrLlxyXG4gICAgLy8gJ1NwaWtlIE9mIEZsYW1lJzogJzRDMTMnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuXHJcbiAgICAnRTZTIFRob3Jucyc6ICc0QkZBJywgLy8gQW9FIG1hcmtlcnMgYWZ0ZXIgRW51bWVyYXRpb25cclxuICAgICdFNlMgRmVyb3N0b3JtIDEnOiAnNEJGRCcsXHJcbiAgICAnRTZTIEZlcm9zdG9ybSAyJzogJzRDMDYnLFxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDEnOiAnNEMwMCcsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLUdhcnVkYVxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDInOiAnNEMwNycsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLVJha3RhcGFrc2FcclxuICAgICdFNlMgRXhwbG9zaW9uJzogJzRDMDMnLCAvLyBBb0UgY2lyY2xlcywgR2FydWRhIG9yYnNcclxuICAgICdFNlMgSGVhdCBCdXJzdCc6ICc0QzFGJyxcclxuICAgICdFNlMgQ29uZmxhZyBTdHJpa2UnOiAnNEMxMCcsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0VcclxuICAgICdFNlMgUmFkaWFudCBQbHVtZSc6ICc0QzE1JyxcclxuICAgICdFNlMgRXJ1cHRpb24nOiAnNEMxNycsXHJcbiAgICAnRTZTIFdpbmQgQ3V0dGVyJzogJzRDMDInLCAvLyBUZXRoZXItY3V0dGluZyBsaW5lIGFvZVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2UyBWYWN1dW0gU2xpY2UnOiAnNEJGNScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNlMgRG93bmJ1cnN0IDEnOiAnNEJGQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoR2FydWRhKS5cclxuICAgICdFNlMgRG93bmJ1cnN0IDInOiAnNEJGQycsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoUmFrdGFwYWtzYSkuXHJcbiAgICAnRTZTIE1ldGVvciBTdHJpa2UnOiAnNEMwRicsIC8vIEZyb250YWwgYXZvaWRhYmxlIHRhbmsgYnVzdGVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFNlMgSGFuZHMgb2YgSGVsbCc6ICc0QzBbQkNdJywgLy8gVGV0aGVyIGNoYXJnZVxyXG4gICAgJ0U2UyBIYW5kcyBvZiBGbGFtZSc6ICc0QzBBJywgLy8gRmlyc3QgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QzBFJywgLy8gU2Vjb25kIFRhbmtidXN0ZXJcclxuICAgICdFNlMgQmxhemUnOiAnNEMxQicsIC8vIEZsYW1lIFRvcm5hZG8gQ2xlYXZlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0U2UyBBaXIgQnVtcCc6ICc0QkY5JyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiBbJzRDM0UnLCAnNEM0MCcsICc0QzIyJywgJzRDM0MnLCAnNEU2MyddLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbZS50YXJnZXROYW1lXTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbZS50YXJnZXROYW1lXSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogd3JvbmdCdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBub0J1ZmYoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogWyc0QzNEJywgJzRDMjMnLCAnNEM0MScsICc0QzQzJ10sXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFtlLnRhcmdldE5hbWVdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFtlLnRhcmdldE5hbWVdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiB3cm9uZ0J1ZmYoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogbm9CdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIGFuIG9yYiBkdXJpbmcgdG9ybmFkbyBwaGFzZVxyXG4vLyBUT0RPOiBqdW1waW5nIGluIHRoZSB0b3JuYWRvIGRhbWFnZT8/XHJcbi8vIFRPRE86IHRha2luZyBzdW5ncmFjZSg0QzgwKSBvciBtb29uZ3JhY2UoNEM4Mikgd2l0aCB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogc3R5Z2lhbiBzcGVhci9zaWx2ZXIgc3BlYXIgd2l0aCB0aGUgd3JvbmcgZGVidWZmXHJcbi8vIFRPRE86IHRha2luZyBleHBsb3Npb24gZnJvbSB0aGUgd3JvbmcgQ2hpYXJvL1NjdXJvIG9yYlxyXG4vLyBUT0RPOiBoYW5kbGUgNEM4OSBTaWx2ZXIgU3Rha2UgdGFua2J1c3RlciAybmQgaGl0LCBhcyBpdCdzIG9rIHRvIGhhdmUgdHdvIGluLlxyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUljb25vY2xhc21TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U3UyBTaWx2ZXIgU3dvcmQnOiAnNEM4RScsIC8vIGdyb3VuZCBhb2VcclxuICAgICdFN1MgT3ZlcndoZWxtaW5nIEZvcmNlJzogJzRDNzMnLCAvLyBhZGQgcGhhc2UgZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDEnOiAnNEM3MCcsIC8vIGFkZCBnZXQgdW5kZXJcclxuICAgICdFN1MgU3RyZW5ndGggaW4gTnVtYmVycyAyJzogJzRDNzEnLCAvLyBhZGQgZ2V0IG91dFxyXG4gICAgJ0U3UyBQYXBlciBDdXQnOiAnNEM3RCcsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXNcclxuICAgICdFN1MgQnVmZmV0JzogJzRDNzcnLCAvLyB0b3JuYWRvIGdyb3VuZCBhb2VzIGFsc28/P1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U3UyBCZXR3aXh0IFdvcmxkcyc6ICc0QzZCJywgLy8gcHVycGxlIGdyb3VuZCBsaW5lIGFvZXNcclxuICAgICdFN1MgQ3J1c2FkZSc6ICc0QzU4JywgLy8gYmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChzdGFuZGluZyBpbiBpdClcclxuICAgICdFN1MgRXhwbG9zaW9uJzogJzRDNkYnLCAvLyBkaWRuJ3Qga2lsbCBhbiBhZGRcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3UyBTdHlnaWFuIFN0YWtlJzogJzRDMzQnLCAvLyBMYXNlciB0YW5rIGJ1c3RlciAxXHJcbiAgICAnRTdTIFNpbHZlciBTaG90JzogJzRDOTInLCAvLyBTcHJlYWQgbWFya2Vyc1xyXG4gICAgJ0U3UyBTaWx2ZXIgU2NvdXJnZSc6ICc0QzkzJywgLy8gSWNlIG1hcmtlcnNcclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAxJzogJzREMTQnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRTdTIENoaWFybyBTY3VybyBFeHBsb3Npb24gMic6ICc0RDE1JywgLy8gb3JiIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRTdTIEFkdmVudCBPZiBMaWdodCcsXHJcbiAgICAgIGFiaWxpdHlSZWdleDogJzRDNkUnLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBMaWdodFxcJ3MgQ291cnNlJyxcclxuICAgICAgZGFtYWdlUmVnZXg6IFsnNEM2MicsICc0QzYzJywgJzRDNjQnLCAnNEM1QicsICc0QzVGJ10sXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzVW1icmFsIHx8ICFkYXRhLmhhc1VtYnJhbFtlLnRhcmdldE5hbWVdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFtlLnRhcmdldE5hbWVdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiB3cm9uZ0J1ZmYoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IG5vQnVmZihlLmFiaWxpdHlOYW1lKSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgRGFya3NcXCdzIENvdXJzZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiBbJzRDNjUnLCAnNEM2NicsICc0QzY3JywgJzRDNUEnLCAnNEM2MCddLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc0FzdHJhbCB8fCAhZGF0YS5oYXNBc3RyYWxbZS50YXJnZXROYW1lXTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbZS50YXJnZXROYW1lXSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogd3JvbmdCdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IG5vQnVmZihlLmFiaWxpdHlOYW1lKSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQ3J1c2FkZSBLbm9ja2JhY2snLFxyXG4gICAgICAvLyA0Qzc2IGlzIHRoZSBrbm9ja2JhY2sgZGFtYWdlLCA0QzU4IGlzIHRoZSBkYW1hZ2UgZm9yIHN0YW5kaW5nIG9uIHRoZSBwdWNrLlxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRDNzYnLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4TiBCaXRpbmcgRnJvc3QnOiAnNEREQicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIERyaXZpbmcgRnJvc3QnOiAnNEREQycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIEZyaWdpZCBTdG9uZSc6ICc0RTY2JywgLy8gU21hbGwgc3ByZWFkIGNpcmNsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzRFMDAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0RTAxJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIEZyaWdpZCBFcnVwdGlvbic6ICc0RTA5JywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEljaWNsZSBJbXBhY3QnOiAnNEUwQScsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBBeGUgS2ljayc6ICc0REUyJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOE4gU2N5dGhlIEtpY2snOiAnNERFMycsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOE4gUmVmbGVjdGVkIEJpdGluZyBGcm9zdCc6ICc0REZFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCc6ICc0REZGJywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBIZWF2ZW5seSBTdHJpa2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRERDgnLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXN0b8OfZW4hJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gRnJvc3QgQXJtb3InLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ3J1bnRlcmdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfmu5HjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+a7keiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn66+464GE65+s7KeQIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBydXNoIGhpdHRpbmcgdGhlIGNyeXN0YWxcclxuLy8gVE9ETzogYWRkcyBub3QgYmVpbmcga2lsbGVkXHJcbi8vIFRPRE86IHRha2luZyB0aGUgcnVzaCB0d2ljZSAod2hlbiB5b3UgaGF2ZSBkZWJ1ZmYpXHJcbi8vIFRPRE86IG5vdCBoaXR0aW5nIHRoZSBkcmFnb24gZm91ciB0aW1lcyBkdXJpbmcgd3lybSdzIGxhbWVudFxyXG4vLyBUT0RPOiBkZWF0aCByZWFzb25zIGZvciBub3QgcGlja2luZyB1cCBwdWRkbGVcclxuLy8gVE9ETzogbm90IGJlaW5nIGluIHRoZSB0b3dlciB3aGVuIHlvdSBzaG91bGRcclxuLy8gVE9ETzogcGlja2luZyB1cCB0b28gbWFueSBzdGFja3NcclxuXHJcbi8vIE5vdGU6IEJhbmlzaCBJSUkgKDREQTgpIGFuZCBCYW5pc2ggSWlpIERpdmlkZWQgKDREQTkpIGJvdGggYXJlIHR5cGU9MHgxNiBsaW5lcy5cclxuLy8gVGhlIHNhbWUgaXMgdHJ1ZSBmb3IgQmFuaXNoICg0REE2KSBhbmQgQmFuaXNoIERpdmlkZWQgKDREQTcpLlxyXG4vLyBJJ20gbm90IHN1cmUgdGhpcyBtYWtlcyBhbnkgc2Vuc2U/IEJ1dCBjYW4ndCB0ZWxsIGlmIHRoZSBzcHJlYWQgd2FzIGEgbWlzdGFrZSBvciBub3QuXHJcbi8vIE1heWJlIHdlIGNvdWxkIGNoZWNrIGZvciBcIk1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXBcIj9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThTIEJpdGluZyBGcm9zdCc6ICc0RDY2JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOFMgRHJpdmluZyBGcm9zdCc6ICc0RDY3JywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOFMgQXhlIEtpY2snOiAnNEQ2RCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFNjeXRoZSBLaWNrJzogJzRENkUnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0REI5JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNERCQScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBGcmlnaWQgRXJ1cHRpb24nOiAnNEQ5RicsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBGcmlnaWQgTmVlZGxlJzogJzREOUQnLCAvLyA4LXdheSBcImZsb3dlclwiIGV4cGxvc2lvblxyXG4gICAgJ0U4UyBJY2ljbGUgSW1wYWN0JzogJzREQTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAxJzogJzREQjcnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMic6ICc0REMzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAxJzogJzREQjgnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAyJzogJzREQzQnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG5cclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDc1JywgLy8gTGVmdCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMic6ICc0RDc2JywgLy8gUmlnaHQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDMnOiAnNEQ3NycsIC8vIEtub2NrYmFjayBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDkwJywgLy8gUmVmbGVjdGVkIGxlZnQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMic6ICc0REJCJywgLy8gUmVmbGVjdGVkIGxlZnQgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMyc6ICc0REM3JywgLy8gUmVmbGVjdGVkIHJpZ2h0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDQnOiAnNEQ5MScsIC8vIFJlZmxlY3RlZCByaWdodCAxXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDEnOiAnNEQ2OCcsXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDInOiAnNEQ2QicsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAxJzogJzRENjknLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMic6ICc0RDZBJyxcclxuICAgICdFOFMgQWtoIFJoYWknOiAnNEQ5OScsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMSc6ICc0RDcwJyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAyJzogJzRENzEnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAxJzogJzRENkYnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAyJzogJzRENzInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gQnJva2VuIHRldGhlci5cclxuICAgICdFOFMgUmVmdWxnZW50IEZhdGUnOiAnNERBNCcsXHJcbiAgICAvLyBTaGFyZWQgb3JiLCBjb3JyZWN0IGlzIEJyaWdodCBQdWxzZSAoNEQ5NSlcclxuICAgICdFOFMgQmxpbmRpbmcgUHVsc2UnOiAnNEQ5NicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOFMgUGF0aCBvZiBMaWdodCc6ICc0REExJywgLy8gUHJvdGVhblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOFMgU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIC8vIFN0dW5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRThTIFN0b25lc2tpbicsXHJcbiAgICAgIGFiaWxpdHlSZWdleDogJzREODUnLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlOIFRoZSBBcnQgT2YgRGFya25lc3MgMSc6ICc1MjIzJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAyJzogJzUyMjQnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUFGRicsIC8vIGZyb250YWwgY2xlYXZlIHR1dG9yaWFsIG1lY2hhbmljXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGhhc2VyJzogJzU1RTEnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5TiBCYWQgVmlicmF0aW9ucyc6ICc1NUU2JywgLy8gdGV0aGVyZWQgb3V0c2lkZSBnaWFudCB0cmVlIGdyb3VuZCBhb2VzXHJcbiAgICAnRTlOIEVhcnRoLVNoYXR0ZXJpbmcgUGFydGljbGUgQmVhbSc6ICc1MjI1JywgLy8gbWlzc2luZyB0b3dlcnM/XHJcbiAgICAnRTlOIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNTVEQycsIC8vIFwiZ2V0IG91dFwiIGR1cmluZyBwYW5lbHNcclxuICAgICdFOU4gWmVyby1Gb3JtIFBhcnRpY2xlIEJlYW0gMic6ICc1NURCJywgLy8gQ2xvbmUgbGluZSBhb2VzIHcvIEFudGktQWlyIFBhcnRpY2xlIEJlYW1cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOU4gV2l0aGRyYXcnOiAnNTUzNCcsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlOIEFldGhlcm9zeW50aGVzaXMnOiAnNTUzNScsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAxJzogJzU1RUInLCAvLyB0YW5rIGxhc2VyIHdpdGggbWFya2VyXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiA1NjFEIEV2aWwgU2VlZCBoaXRzIGV2ZXJ5b25lLCBoYXJkIHRvIGtub3cgaWYgdGhlcmUncyBhIGRvdWJsZSB0YXBcclxuLy8gVE9ETzogZmFsbGluZyB0aHJvdWdoIHBhbmVsIGp1c3QgZG9lcyBkYW1hZ2Ugd2l0aCBubyBhYmlsaXR5IG5hbWUsIGxpa2UgYSBkZWF0aCB3YWxsXHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UganVtcCBpbiBzZWVkIHRob3Jucz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlTIEJhZCBWaWJyYXRpb25zJzogJzU2MUMnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQYXJ0aWNsZSBCZWFtJzogJzVCMDAnLCAvLyBhbnRpLWFpciBcInNpZGVzXCJcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQaGFzZXIgVW5saW1pdGVkJzogJzU2MEUnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJzogJzVCMDEnLCAvLyB3aWRlLWFuZ2xlIFwib3V0XCJcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAxJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMic6ICc1NjAyJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzVBOTUnLCAvLyBib3NzIGxlZnQtcmlnaHQgc3VtbW9uL3BhbmVsIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNUE5NicsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMSc6ICc1NjFFJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMic6ICc1NjFGJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBUaGlyZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAzJywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGluaXRpYWxcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDQnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBBcnQgT2YgRGFya25lc3MnOiAnNTYwNicsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBmaW5hbFxyXG4gICAgJ0U5UyBGdWxsLVBlcmltaXRlciBQYXJ0aWNsZSBCZWFtJzogJzU2MjknLCAvLyBwYW5lbCBcImdldCBpblwiXHJcbiAgICAnRTlTIERhcmsgQ2hhaW5zJzogJzVGQUMnLCAvLyBTbG93IHRvIGJyZWFrIHBhcnRuZXIgY2hhaW5zXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTlTIFdpdGhkcmF3JzogJzU2MUEnLCAvLyBTbG93IHRvIGJyZWFrIHNlZWQgY2hhaW4sIGdldCBzdWNrZWQgYmFjayBpbiB5aWtlc1xyXG4gICAgJ0U5UyBBZXRoZXJvc3ludGhlc2lzJzogJzU2MUInLCAvLyBTdGFuZGluZyBvbiBzZWVkcyBkdXJpbmcgZXhwbG9zaW9uIChwb3NzaWJseSB2aWEgV2l0aGRyYXcpXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFOVMgSHlwZXItRm9jdXNlZCBQYXJ0aWNsZSBCZWFtJzogJzU1RkQnLCAvLyBBcnQgT2YgRGFya25lc3MgcHJvdGVhblxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTlTIENvbmRlbnNlZCBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNTYxMCcsIC8vIHdpZGUtYW5nbGUgXCJ0YW5rIGxhc2VyXCJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0U5UyBTdHlnaWFuIFRlbmRyaWxzJzogJzk1MicsIC8vIHN0YW5kaW5nIGluIHRoZSBicmFtYmxlc1xyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdFOVMgTXVsdGktUHJvbmdlZCBQYXJ0aWNsZSBCZWFtJzogJzU2MDAnLCAvLyBBcnQgT2YgRGFya25lc3MgUGFydG5lciBTdGFja1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQW50aS1haXIgXCJ0YW5rIHNwcmVhZFwiLiAgVGhpcyBjYW4gYmUgc3RhY2tlZCBieSB0d28gdGFua3MgaW52dWxuaW5nLlxyXG4gICAgICAvLyBOb3RlOiB0aGlzIHdpbGwgc3RpbGwgc2hvdyBzb21ldGhpbmcgZm9yIGhvbG1nYW5nL2xpdmluZywgYnV0XHJcbiAgICAgIC8vIGFyZ3VhYmx5IGEgaGVhbGVyIG1pZ2h0IG5lZWQgdG8gZG8gc29tZXRoaW5nIGFib3V0IHRoYXQsIHNvIG1heWJlXHJcbiAgICAgIC8vIGl0J3Mgb2sgdG8gc3RpbGwgc2hvdyBhcyBhIHdhcm5pbmc/P1xyXG4gICAgICBpZDogJ0U5UyBDb25kZW5zZWQgQW50aS1BaXIgUGFydGljbGUgQmVhbScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNTYxNScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUudHlwZSAhPT0gJzE1JyAmJiBlLmRhbWFnZSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcIm91dFwiLiAgVGhpcyBjYW4gYmUgaW52dWxuZWQgYnkgYSB0YW5rIGFsb25nIHdpdGggdGhlIHNwcmVhZCBhYm92ZS5cclxuICAgICAgaWQ6ICdFOVMgQW50aS1BaXIgUGhhc2VyIFVubGltaXRlZCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNTYxMicsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUuZGFtYWdlID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBOIEZvcndhcmQgSW1wbG9zaW9uJzogJzU2QjQnLCAvLyBob3dsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBGb3J3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCNScsIC8vIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgSW1wbG9zaW9uJzogJzU2QjcnLCAvLyB0YWlsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjgnLCAvLyB0YWlsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDEnOiAnNTZEOScsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAyJzogJzVCMjYnLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQ2xvYWsgT2YgU2hhZG93cyc6ICc1QjExJywgLy8gbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxME4gVGhyb25lIE9mIFNoYWRvdyc6ICc1NkM3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxME4gUmlnaHQgR2lnYSBTbGFzaCc6ICc1NkFFJywgLy8gYm9zcyByaWdodCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBSaWdodCBTaGFkb3cgU2xhc2gnOiAnNTZBRicsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIExlZnQgR2lnYSBTbGFzaCc6ICc1NkIxJywgLy8gYm9zcyBsZWZ0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIExlZnQgU2hhZG93IFNsYXNoJzogJzU2QkQnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBTaGFkb3d5IEVydXB0aW9uJzogJzU2RTEnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBtYXJrZXJzIHBhaXJlZCB3aXRoIGJhcmJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBOIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NkRCJywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGhpdHRpbmcgc2hhZG93IG9mIHRoZSBoZXJvIHdpdGggYWJpbGl0aWVzIGNhbiBjYXVzZSB5b3UgdG8gdGFrZSBkYW1hZ2UsIGxpc3QgdGhvc2U/XHJcbi8vICAgICAgIGUuZy4gcGlja2luZyB1cCB5b3VyIGZpcnN0IHBpdGNoIGJvZyBwdWRkbGUgd2lsbCBjYXVzZSB5b3UgdG8gZGllIHRvIHRoZSBkYW1hZ2VcclxuLy8gICAgICAgeW91ciBzaGFkb3cgdGFrZXMgZnJvbSBEZWVwc2hhZG93IE5vdmEgb3IgRGlzdGFudCBTY3JlYW0uXHJcbi8vIFRPRE86IDU3M0IgQmxpZ2h0aW5nIEJsaXR6IGlzc3VlcyBkdXJpbmcgbGltaXQgY3V0IG51bWJlcnNcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VMaXRhbnlTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFNpbmdsZSAxJzogJzU2RjInLCAvLyBzaW5nbGUgdGFpbCB1cCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDInOiAnNTZFRicsIC8vIHNpbmdsZSBob3dsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBRdWFkcnVwbGUgMSc6ICc1NkVGJywgLy8gcXVhZHJ1cGxlIHNldCBvZiBzaGFkb3cgaW1wbG9zaW9uc1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAyJzogJzU2RjInLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAxJzogJzU2RUMnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBTaW5nbGUgMic6ICc1NkVEJywgLy8gR2lnYSBzbGFzaCBzaW5nbGUgZnJvbSBzaGFkb3dcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggQm94IDEnOiAnNTcwOScsIC8vIEdpZ2Egc2xhc2ggYm94IGZyb20gZm91ciBncm91bmQgc2hhZG93c1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMic6ICc1NzBEJywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAxJzogJzU2RUMnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBRdWFkcnVwbGUgMic6ICc1NkU5JywgLy8gcXVhZHJ1cGxlIHNldCBvZiBnaWdhIHNsYXNoIGNsZWF2ZXNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMSc6ICc1QjEzJywgLy8gaW5pdGlhbCBub24tc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwUyBDbG9hayBPZiBTaGFkb3dzIDInOiAnNUIxNCcsIC8vIHNlY29uZCBzcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIFRocm9uZSBPZiBTaGFkb3cnOiAnNTcxNycsIC8vIHN0YW5kaW5nIHVwIGdldCBvdXRcclxuICAgICdFMTBTIFNoYWRvd3kgRXJ1cHRpb24nOiAnNTczOCcsIC8vIGJhaXRlZCBncm91bmQgYW9lIGR1cmluZyBhbXBsaWZpZXJcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTBTIFN3YXRoIE9mIFNpbGVuY2UgMSc6ICc1NzFBJywgLy8gU2hhZG93IGNsb25lIGNsZWF2ZSAodG9vIGNsb3NlKVxyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAyJzogJzVCQkYnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0aW1lZClcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMFMgU2hhZGVmaXJlJzogJzU3MzInLCAvLyBwdXJwbGUgdGFuayB1bWJyYWwgb3Jic1xyXG4gICAgJ0UxMFMgUGl0Y2ggQm9nJzogJzU3MjInLCAvLyBtYXJrZXIgc3ByZWFkIHRoYXQgZHJvcHMgYSBzaGFkb3cgcHVkZGxlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTBTIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NzI1JywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gT3JicycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbWVzaGFkb3cnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdTY2hhdHRlbmZsYW1tZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ0ZsYW1tZSBvbWJyYWxlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn44K344Oj44OJ44Km44OV44Os44Kk44OgJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RhbWFnZScsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogYCR7bWF0Y2hlcy5lZmZlY3R9IChwYXJ0aWFsIHN0YWNrKWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEwUyBEYW1hZ2UgRG93biBCb3NzJyxcclxuICAgICAgLy8gU2hhY2tsZXMgYmVpbmcgbWVzc2VkIHVwIGFwcGVhciB0byBqdXN0IGdpdmUgdGhlIERhbWFnZSBEb3duLCB3aXRoIG5vdGhpbmcgZWxzZS5cclxuICAgICAgLy8gTWVzc2luZyB1cCB0b3dlcnMgaXMgdGhlIFRocmljZS1Db21lIFJ1aW4gZWZmZWN0ICg5RTIpLCBidXQgYWxzbyBEYW1hZ2UgRG93bi5cclxuICAgICAgLy8gVE9ETzogc29tZSBvZiB0aGVzZSB3aWxsIGJlIGR1cGxpY2F0ZWQgd2l0aCBvdGhlcnMsIGxpa2UgYEUxMFMgVGhyb25lIE9mIFNoYWRvd2AuXHJcbiAgICAgIC8vIE1heWJlIGl0J2QgYmUgbmljZSB0byBmaWd1cmUgb3V0IGhvdyB0byBwdXQgdGhlIGRhbWFnZSBtYXJrZXIgb24gdGhhdD9cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdTaGFkb3drZWVwZXInLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdTY2hhdHRlbmvDtm5pZycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1JvaSBEZSBMXFwnT21icmUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICflvbHjga7njosnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaGFkb3cgV2FycmlvciA0IGRvZyByb29tIGNsZWF2ZVxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBtaXRpZ2F0ZWQgYnkgdGhlIHdob2xlIGdyb3VwLCBzbyBhZGQgYSBkYW1hZ2UgY29uZGl0aW9uLlxyXG4gICAgICBpZDogJ0UxMFMgQmFyYnMgT2YgQWdvbnknLFxyXG4gICAgICBkYW1hZ2VSZWdleDogWyc1NzJBJywgJzVCMjcnXSxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS5kYW1hZ2UgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3NpcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2MkUnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEZpcmUnOiAnNTYyQycsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjMwJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm5vdXQnOiAnNTYyRicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBTaGluaW5nIEJsYWRlJzogJzU2MzEnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTYzQicsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2M0MnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBSZXNvdW5kaW5nIENyYWNrJzogJzU2NEQnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY0NScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjQzJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY0NicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFOIEJsYXN0aW5nIFpvbmUnOiAnNTYzRScsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJuIE1hcmsnOiAnNTY0RicsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExTiBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1NjJEID0gQnVybnQgU3RyaWtlIGZpcmUgZm9sbG93dXAgZHVyaW5nIG1vc3Qgb2YgdGhlIGZpZ2h0XHJcbiAgICAgIC8vIDU2NDQgPSBzYW1lIHRoaW5nLCBidXQgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NjJEJywgJzU2NDQnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gNTY1QS81NjhEIFNpbnNtb2tlIEJvdW5kIE9mIEZhaXRoIHNoYXJlXHJcbi8vIDU2NUUvNTY5OSBCb3dzaG9jayBoaXRzIHRhcmdldCBvZiA1NjVEICh0d2ljZSkgYW5kIHR3byBvdGhlcnNcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VBbmFtb3JwaG9zaXNTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEZpcmUnOiAnNTY1MicsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2NTQnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEhvbHknOiAnNTY1NicsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBTaGluaW5nIEJsYWRlJzogJzU2NTcnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgRmlyZSc6ICc1NjhFJywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgTGlnaHRuaW5nJzogJzU2OTUnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBIb2x5JzogJzU2OUQnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIFNoaW5pbmcgQmxhZGUgQ3ljbGUnOiAnNTY5RScsIC8vIEJhaXRlZCBleHBsb3Npb24gZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTY2RCcsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2NkMnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBQb3J0YWwgT2YgRmxhbWUgQnJpZ2h0IFB1bHNlJzogJzU2NzEnLCAvLyBSZWQgY2FyZCBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBQb3J0YWwgT2YgTGV2aW4gQnJpZ2h0IFB1bHNlJzogJzU2NzAnLCAvLyBCbHVlIGNhcmQgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUmVzb25hbnQgV2luZHMnOiAnNTY4OScsIC8vIERlbWktR3VrdW1hdHogXCJnZXQgaW5cIlxyXG4gICAgJ0UxMVMgUmVzb3VuZGluZyBDcmFjayc6ICc1Njg4JywgLy8gRGVtaS1HdWt1bWF0eiAyNzAgZGVncmVlIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRTExUyBJbWFnZSBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2N0InLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybm91dCc6ICc1NjdDJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEZpcmUnOiAnNTY3OScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjdCJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIFNoaW5pbmcgQmxhZGUnOiAnNTY3RScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGJhaXRlZCBleHBsb3Npb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFTIEJ1cm5vdXQnOiAnNTY1NScsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExUyBCdXJub3V0IEN5Y2xlJzogJzU2OTYnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMVMgQmxhc3RpbmcgWm9uZSc6ICc1Njc0JywgLy8gUHJpc21hdGljIERlY2VwdGlvbiBjaGFyZ2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTFTIEVsZW1lbnRhbCBCcmVhayc6ICc1NjY0JywgLy8gRWxlbWVudGFsIEJyZWFrIHByb3RlYW5cclxuICAgICdFMTFTIEVsZW1lbnRhbCBCcmVhayBDeWNsZSc6ICc1NjhDJywgLy8gRWxlbWVudGFsIEJyZWFrIHByb3RlYW4gZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBTaW5zbWl0ZSc6ICc1NjY3JywgLy8gTGlnaHRuaW5nIEVsZW1lbnRhbCBCcmVhayBzcHJlYWRcclxuICAgICdFMTFTIFNpbnNtaXRlIEN5Y2xlJzogJzU2OTQnLCAvLyBMaWdodG5pbmcgRWxlbWVudGFsIEJyZWFrIHNwcmVhZCBkdXJpbmcgQ3ljbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMVMgQnVybiBNYXJrJzogJzU2QTMnLCAvLyBQb3dkZXIgTWFyayBkZWJ1ZmYgZXhwbG9zaW9uXHJcbiAgICAnRTExUyBTaW5zaWdodCAxJzogJzU2NjEnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlclxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMic6ICc1QkM3JywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXIgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAnRTExUyBTaW5zaWdodCAzJzogJzU2QTAnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlciBkdXJpbmcgQ3ljbGVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTExUyBIb2x5IFNpbnNpZ2h0IEdyb3VwIFNoYXJlJzogJzU2NjknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTFTIEJsYXN0YnVybiBLbm9ja2VkIE9mZicsXHJcbiAgICAgIC8vIDU2NTMgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY3QSA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgLy8gNTY4RiA9IHNhbWUgdGhpbmcsIGJ1dCBkdXJpbmcgQ3ljbGUgb2YgRmFpdGhcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2NTMnLCAnNTY3QScsICc1NjhGJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlRXRlcm5pdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMk4gSnVkZ21lbnQgSm9sdCBTaW5nbGUnOiAnNTg1RicsIC8vIFJhbXVoIGdldCBvdXQgY2FzdFxyXG4gICAgJ0UxMk4gSnVkZ21lbnQgSm9sdCc6ICc0RTMwJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBUZW1wb3JhcnkgQ3VycmVudCBTaW5nbGUnOiAnNTg1QycsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFMkQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0XHJcbiAgICAnRTEyTiBDb25mbGFnIFN0cmlrZSBTaW5nbGUnOiAnNTg1RCcsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0XHJcbiAgICAnRTEyTiBDb25mbGFnIFN0cmlrZSc6ICc0RTJFJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIEZlcm9zdG9ybSBTaW5nbGUnOiAnNTg1RScsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtJzogJzRFMkYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3RcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAxJzogJzU4NzgnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBSYXB0dXJvdXMgUmVhY2ggMic6ICc1ODc3JywgLy8gSGFpcmN1dFxyXG4gICAgJ0UxMk4gQm9tYiBFeHBsb3Npb24nOiAnNTg2RCcsIC8vIFNtYWxsIGJvbWIgZXhwbG9zaW9uXHJcbiAgICAnRTEyTiBUaXRhbmljIEJvbWIgRXhwbG9zaW9uJzogJzU4NkYnLCAvLyBMYXJnZSBib21iIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyTiBFYXJ0aHNoYWtlcic6ICc1ODg1JywgLy8gRWFydGhzaGFrZXIgb24gZmlyc3QgcGxhdGZvcm1cclxuICAgICdFMTJOIFByb21pc2UgRnJpZ2lkIFN0b25lIDEnOiAnNTg2NycsIC8vIFNoaXZhIHNwcmVhZCB3aXRoIHNsaWRpbmdcclxuICAgICdFMTJOIFByb21pc2UgRnJpZ2lkIFN0b25lIDInOiAnNTg2OScsIC8vIFNoaXZhIHNwcmVhZCB3aXRoIFJhcHR1cm91cyBSZWFjaFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IE91dHB1dHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL291dHB1dHMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGFkZCBzZXBhcmF0ZSBkYW1hZ2VXYXJuLWVzcXVlIGljb24gZm9yIGRhbWFnZSBkb3ducz9cclxuLy8gVE9ETzogNThBNiBVbmRlciBUaGUgV2VpZ2h0IC8gNThCMiBDbGFzc2ljYWwgU2N1bHB0dXJlIG1pc3Npbmcgc29tZWJvZHkgaW4gcGFydHkgd2FybmluZz9cclxuLy8gVE9ETzogNThDQSBEYXJrIFdhdGVyIElJSSAvIDU4QzUgU2hlbGwgQ3J1c2hlciBzaG91bGQgaGl0IGV2ZXJ5b25lIGluIHBhcnR5XHJcbi8vIFRPRE86IERhcmsgQWVybyBJSUkgNThENCBzaG91bGQgbm90IGJlIGEgc2hhcmUgZXhjZXB0IG9uIGFkdmFuY2VkIHJlbGF0aXZpdHkgZm9yIGRvdWJsZSBhZXJvLlxyXG4vLyAoZm9yIGdhaW5zIGVmZmVjdCwgc2luZ2xlIGFlcm8gPSB+MjMgc2Vjb25kcywgZG91YmxlIGFlcm8gPSB+MzEgc2Vjb25kcyBkdXJhdGlvbilcclxuXHJcbi8vIER1ZSB0byBjaGFuZ2VzIGludHJvZHVjZWQgaW4gcGF0Y2ggNS4yLCBvdmVyaGVhZCBtYXJrZXJzIG5vdyBoYXZlIGEgcmFuZG9tIG9mZnNldFxyXG4vLyBhZGRlZCB0byB0aGVpciBJRC4gVGhpcyBvZmZzZXQgY3VycmVudGx5IGFwcGVhcnMgdG8gYmUgc2V0IHBlciBpbnN0YW5jZSwgc29cclxuLy8gd2UgY2FuIGRldGVybWluZSB3aGF0IGl0IGlzIGZyb20gdGhlIGZpcnN0IG92ZXJoZWFkIG1hcmtlciB3ZSBzZWUuXHJcbi8vIFRoZSBmaXJzdCAxQiBtYXJrZXIgaW4gdGhlIGVuY291bnRlciBpcyB0aGUgZm9ybWxlc3MgdGFua2J1c3RlciwgSUQgMDA0Ri5cclxuY29uc3QgZmlyc3RIZWFkbWFya2VyID0gcGFyc2VJbnQoJzAwREEnLCAxNik7XHJcbmNvbnN0IGdldEhlYWRtYXJrZXJJZCA9IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgLy8gSWYgd2UgbmFpdmVseSBqdXN0IGNoZWNrICFkYXRhLmRlY09mZnNldCBhbmQgbGVhdmUgaXQsIGl0IGJyZWFrcyBpZiB0aGUgZmlyc3QgbWFya2VyIGlzIDAwREEuXHJcbiAgLy8gKFRoaXMgbWFrZXMgdGhlIG9mZnNldCAwLCBhbmQgITAgaXMgdHJ1ZS4pXHJcbiAgaWYgKHR5cGVvZiBkYXRhLmRlY09mZnNldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBkYXRhLmRlY09mZnNldCA9IHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGZpcnN0SGVhZG1hcmtlcjtcclxuICAvLyBUaGUgbGVhZGluZyB6ZXJvZXMgYXJlIHN0cmlwcGVkIHdoZW4gY29udmVydGluZyBiYWNrIHRvIHN0cmluZywgc28gd2UgcmUtYWRkIHRoZW0gaGVyZS5cclxuICAvLyBGb3J0dW5hdGVseSwgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHJvYnVzdCxcclxuICAvLyBzaW5jZSB3ZSBrbm93IGFsbCB0aGUgSURzIHRoYXQgd2lsbCBiZSBwcmVzZW50IGluIHRoZSBlbmNvdW50ZXIuXHJcbiAgcmV0dXJuIChwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBkYXRhLmRlY09mZnNldCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkucGFkU3RhcnQoNCwgJzAnKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBMZWZ0JzogJzU4QUQnLCAvLyBIYWlyY3V0IHdpdGggbGVmdCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIFJpZ2h0JzogJzU4QUUnLCAvLyBIYWlyY3V0IHdpdGggcmlnaHQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFNDQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgQ29uZmxhZyBTdHJpa2UnOiAnNEU0NScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgRmVyb3N0b3JtJzogJzRFNDYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBKdWRnbWVudCBKb2x0JzogJzRFNDcnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBTaGF0dGVyJzogJzU4OUMnLCAvLyBJY2UgUGlsbGFyIGV4cGxvc2lvbiBpZiB0ZXRoZXIgbm90IGdvdHRlblxyXG4gICAgJ0UxMlMgUHJvbWlzZSBJbXBhY3QnOiAnNThBMScsIC8vIFRpdGFuIGJvbWIgZHJvcFxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQmxpenphcmQgSUlJJzogJzU4RDMnLCAvLyBSZWxhdGl2aXR5IGRvbnV0IG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgQXBvY2FseXBzZSc6ICc1OEU2JywgLy8gTGlnaHQgdXAgY2lyY2xlIGV4cGxvc2lvbnMgKGRhbWFnZSBkb3duKVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIE1hZWxzdHJvbSc6ICc1OERBJywgLy8gQWR2YW5jZWQgUmVsYXRpdml0eSB0cmFmZmljIGxpZ2h0IGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZyaWdpZCBTdG9uZSc6ICc1ODlFJywgLy8gU2hpdmEgc3ByZWFkXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFya2VzdCBEYW5jZSc6ICc0RTMzJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgKyBqdW1wIGJlZm9yZSBrbm9ja2JhY2tcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEN1cnJlbnQnOiAnNThEOCcsIC8vIEJhaXRlZCB0cmFmZmljIGxpZ2h0IGxhc2Vyc1xyXG4gICAgJ0UxMlMgT3JhY2xlIFNwaXJpdCBUYWtlcic6ICc1OEM2JywgLy8gUmFuZG9tIGp1bXAgc3ByZWFkIG1lY2hhbmljIGFmdGVyIFNoZWxsIENydXNoZXJcclxuICAgICdFMTJTIE9yYWNsZSBTb21iZXIgRGFuY2UgMSc6ICc1OEJGJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgZm9yIER1YWwgQXBvY2FseXBzZVxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAyJzogJzU4QzAnLCAvLyBTZWNvbmQgc29tYmVyIGRhbmNlIGp1bXBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBXZWlnaHQgT2YgVGhlIFdvcmxkJzogJzU4QTUnLCAvLyBUaXRhbiBib21iIGJsdWUgbWFya2VyXHJcbiAgICAnRTEyUyBQcm9taXNlIFB1bHNlIE9mIFRoZSBMYW5kJzogJzU4QTMnLCAvLyBUaXRhbiBib21iIHllbGxvdyBtYXJrZXJcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEVydXB0aW9uIDEnOiAnNThDRScsIC8vIEluaXRpYWwgd2FybXVwIHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMic6ICc1OENEJywgLy8gUmVsYXRpdml0eSBzcHJlYWQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBCbGFjayBIYWxvJzogJzU4QzcnLCAvLyBUYW5rYnVzdGVyIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgRG9vbSc6ICc5RDQnLCAvLyBSZWxhdGl2aXR5IHB1bmlzaG1lbnQgZm9yIG11bHRpcGxlIG1pc3Rha2VzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBGb3JjZSBPZiBUaGUgTGFuZCc6ICc1OEE0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEJpZyBjaXJjbGUgZ3JvdW5kIGFvZXMgZHVyaW5nIFNoaXZhIGp1bmN0aW9uLlxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBzaGllbGRlZCB0aHJvdWdoIGFzIGxvbmcgYXMgdGhhdCBwZXJzb24gZG9lc24ndCBzdGFjay5cclxuICAgICAgaWQ6ICdFMTJTIEljaWNsZSBJbXBhY3QnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRFNUEnLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiBlLmRhbWFnZSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgSGVhZG1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoe30pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gZ2V0SGVhZG1hcmtlcklkKGRhdGEsIG1hdGNoZXMpO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0TGFzZXJNYXJrZXIgPSAnMDA5MSc7XHJcbiAgICAgICAgY29uc3QgbGFzdExhc2VyTWFya2VyID0gJzAwOTgnO1xyXG4gICAgICAgIGlmIChpZCA+PSBmaXJzdExhc2VyTWFya2VyICYmIGlkIDw9IGxhc3RMYXNlck1hcmtlcikge1xyXG4gICAgICAgICAgLy8gaWRzIGFyZSBzZXF1ZW50aWFsOiAjMSBzcXVhcmUsICMyIHNxdWFyZSwgIzMgc3F1YXJlLCAjNCBzcXVhcmUsICMxIHRyaWFuZ2xlIGV0Y1xyXG4gICAgICAgICAgY29uc3QgZGVjT2Zmc2V0ID0gcGFyc2VJbnQoaWQsIDE2KSAtIHBhcnNlSW50KGZpcnN0TGFzZXJNYXJrZXIsIDE2KTtcclxuXHJcbiAgICAgICAgICAvLyBkZWNPZmZzZXQgaXMgMC03LCBzbyBtYXAgMC0zIHRvIDEtNCBhbmQgNC03IHRvIDEtNC5cclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW0gPSBkYXRhLmxhc2VyTmFtZVRvTnVtIHx8IHt9O1xyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bVttYXRjaGVzLnRhcmdldF0gPSBkZWNPZmZzZXQgJSA0ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBzY3VscHR1cmVzIGFyZSBhZGRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpZ2h0LCBzbyB3ZSBuZWVkIHRvIGNoZWNrIHdoZXJlIHRoZXlcclxuICAgICAgLy8gdXNlIHRoZSBcIkNsYXNzaWNhbCBTY3VscHR1cmVcIiBhYmlsaXR5IGFuZCBlbmQgdXAgb24gdGhlIGFyZW5hIGZvciByZWFsLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgQ2xhc3NpY2FsIFNjdWxwdHVyZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgcnVuIHBlciBwZXJzb24gdGhhdCBnZXRzIGhpdCBieSB0aGUgc2FtZSBzY3VscHR1cmUsIGJ1dCB0aGF0J3MgZmluZS5cclxuICAgICAgICAvLyBSZWNvcmQgdGhlIHkgcG9zaXRpb24gb2YgZWFjaCBzY3VscHR1cmUgc28gd2UgY2FuIHVzZSBpdCBmb3IgYmV0dGVyIHRleHQgbGF0ZXIuXHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1ttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlIHNvdXJjZSBvZiB0aGUgdGV0aGVyIGlzIHRoZSBwbGF5ZXIsIHRoZSB0YXJnZXQgaXMgdGhlIHNjdWxwdHVyZS5cclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQ2hpc2VsZWQgU2N1bHB0dXJlIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHRhcmdldDogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZCA9IGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgfHwge307XHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZFttYXRjaGVzLnNvdXJjZV0gPSBtYXRjaGVzLnRhcmdldElkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCbGFkZSBPZiBGbGFtZSBDb3VudGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgPSBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDA7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCsrO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBpcyB0aGUgQ2hpc2VsZWQgU2N1bHB0dXJlIGxhc2VyIHdpdGggdGhlIGxpbWl0IGN1dCBkb3RzLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCbGFkZSBPZiBGbGFtZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyB0eXBlOiAnMjInLCBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubGFzZXJOYW1lVG9OdW0gfHwgIWRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgfHwgIWRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgcGVyc29uIHdobyBoYXMgdGhpcyBsYXNlciBudW1iZXIgYW5kIGlzIHRldGhlcmVkIHRvIHRoaXMgc3RhdHVlLlxyXG4gICAgICAgIGNvbnN0IG51bWJlciA9IChkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDApICsgMTtcclxuICAgICAgICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKGRhdGEubGFzZXJOYW1lVG9OdW0pO1xyXG4gICAgICAgIGNvbnN0IHdpdGhOdW0gPSBuYW1lcy5maWx0ZXIoKG5hbWUpID0+IGRhdGEubGFzZXJOYW1lVG9OdW1bbmFtZV0gPT09IG51bWJlcik7XHJcbiAgICAgICAgY29uc3Qgb3duZXJzID0gd2l0aE51bS5maWx0ZXIoKG5hbWUpID0+IGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbmFtZV0gPT09IHNvdXJjZUlkKTtcclxuXHJcbiAgICAgICAgLy8gaWYgc29tZSBsb2dpYyBlcnJvciwganVzdCBhYm9ydC5cclxuICAgICAgICBpZiAob3duZXJzLmxlbmd0aCAhPT0gMSlcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVGhlIG93bmVyIGhpdHRpbmcgdGhlbXNlbHZlcyBpc24ndCBhIG1pc3Rha2UuLi50ZWNobmljYWxseS5cclxuICAgICAgICBpZiAob3duZXJzWzBdID09PSBtYXRjaGVzLnRhcmdldClcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gTm93IHRyeSB0byBmaWd1cmUgb3V0IHdoaWNoIHN0YXR1ZSBpcyB3aGljaC5cclxuICAgICAgICAvLyBQZW9wbGUgY2FuIHB1dCB0aGVzZSB3aGVyZXZlci4gIFRoZXkgY291bGQgZ28gc2lkZXdheXMsIG9yIGRpYWdvbmFsLCBvciB3aGF0ZXZlci5cclxuICAgICAgICAvLyBJdCBzZWVtcyBtb29vb29zdCBwZW9wbGUgcHV0IHRoZXNlIG5vcnRoIC8gc291dGggKG9uIHRoZSBzb3V0aCBlZGdlIG9mIHRoZSBhcmVuYSkuXHJcbiAgICAgICAgLy8gTGV0J3Mgc2F5IGEgbWluaW11bSBvZiAyIHlhbG1zIGFwYXJ0IGluIHRoZSB5IGRpcmVjdGlvbiB0byBjb25zaWRlciB0aGVtIFwibm9ydGgvc291dGhcIi5cclxuICAgICAgICBjb25zdCBtaW5pbXVtWWFsbXNGb3JTdGF0dWVzID0gMjtcclxuXHJcbiAgICAgICAgbGV0IGlzU3RhdHVlUG9zaXRpb25Lbm93biA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc1N0YXR1ZU5vcnRoID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgc2N1bHB0dXJlSWRzID0gT2JqZWN0LmtleXMoZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zKTtcclxuICAgICAgICBpZiAoc2N1bHB0dXJlSWRzLmxlbmd0aCA9PT0gMiAmJiBzY3VscHR1cmVJZHMuaW5jbHVkZXMoc291cmNlSWQpKSB7XHJcbiAgICAgICAgICBjb25zdCBvdGhlcklkID0gc2N1bHB0dXJlSWRzWzBdID09PSBzb3VyY2VJZCA/IHNjdWxwdHVyZUlkc1sxXSA6IHNjdWxwdHVyZUlkc1swXTtcclxuICAgICAgICAgIGNvbnN0IHNvdXJjZVkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbc291cmNlSWRdO1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJZID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW290aGVySWRdO1xyXG4gICAgICAgICAgY29uc3QgeURpZmYgPSBNYXRoLmFicyhzb3VyY2VZIC0gb3RoZXJZKTtcclxuICAgICAgICAgIGlmICh5RGlmZiA+IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMpIHtcclxuICAgICAgICAgICAgaXNTdGF0dWVQb3NpdGlvbktub3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXNTdGF0dWVOb3J0aCA9IHNvdXJjZVkgPCBvdGhlclk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvd25lciA9IG93bmVyc1swXTtcclxuICAgICAgICBjb25zdCBvd25lck5pY2sgPSBkYXRhLlNob3J0TmFtZShvd25lcik7XHJcbiAgICAgICAgbGV0IHRleHQgPSB7XHJcbiAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIKWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmIGlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3J0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3JkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWMl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWMl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg67aB7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmICFpc1N0YXR1ZU5vcnRoKSB7XHJcbiAgICAgICAgICB0ZXh0ID0ge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0gc291dGgpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0gU8O8ZGVuKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZfjga4ke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6rljZfmlrkke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIIOuCqOyqvSlgLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgVHJhY2tlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogWycwMDAxJywgJzAwMzknXSB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lciA9IGRhdGEucGlsbGFySWRUb093bmVyIHx8IHt9O1xyXG4gICAgICAgIGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBJY2UgUGlsbGFyIE1pc3Rha2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnSWNlIFBpbGxhcicsIGlkOiAnNTg5QicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLnBpbGxhcklkVG9Pd25lcilcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgIT09IGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBwaWxsYXJPd25lciA9IGRhdGEuU2hvcnROYW1lKGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChkZSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtwaWxsYXJPd25lcn3jgYvjgokpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke3BpbGxhck93bmVyfVwiKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBHYWluIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgLy8gVGhlIEJlYXN0bHkgU2N1bHB0dXJlIGdpdmVzIGEgMyBzZWNvbmQgZGVidWZmLCB0aGUgUmVnYWwgU2N1bHB0dXJlIGdpdmVzIGEgMTRzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5maXJlID0gZGF0YS5maXJlIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgTG9zZSBGaXJlIFJlc2lzdGFuY2UgRG93biBJSScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4MzInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmlyZSA9IGRhdGEuZmlyZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0JlYXN0bHkgU2N1bHB0dXJlJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdBYmJpbGQgRWluZXMgTMO2d2VuJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkCcsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25JZFRvT3duZXIgPSBkYXRhLnNtYWxsTGlvbklkVG9Pd25lciB8fCB7fTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMgPSBkYXRhLnNtYWxsTGlvbk93bmVycyB8fCBbXTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIFNtYWxsIExpb24gTGlvbnNibGF6ZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gRm9sa3MgYmFpdGluZyB0aGUgYmlnIGxpb24gc2Vjb25kIGNhbiB0YWtlIHRoZSBmaXJzdCBzbWFsbCBsaW9uIGhpdCxcclxuICAgICAgICAvLyBzbyBpdCdzIG5vdCBzdWZmaWNpZW50IHRvIGNoZWNrIG9ubHkgdGhlIG93bmVyLlxyXG4gICAgICAgIGlmICghZGF0YS5zbWFsbExpb25Pd25lcnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgb3duZXIgPSBkYXRhLnNtYWxsTGlvbklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldO1xyXG4gICAgICAgIGlmICghb3duZXIpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKG1hdGNoZXMudGFyZ2V0ID09PSBvd25lcilcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHRhcmdldCBhbHNvIGhhcyBhIHNtYWxsIGxpb24gdGV0aGVyLCB0aGF0IGlzIGFsd2F5cyBhIG1pc3Rha2UuXHJcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdCdzIG9ubHkgYSBtaXN0YWtlIGlmIHRoZSB0YXJnZXQgaGFzIGEgZmlyZSBkZWJ1ZmYuXHJcbiAgICAgICAgY29uc3QgaGFzU21hbGxMaW9uID0gZGF0YS5zbWFsbExpb25Pd25lcnMuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICAgIGNvbnN0IGhhc0ZpcmVEZWJ1ZmYgPSBkYXRhLmZpcmUgJiYgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XTtcclxuXHJcbiAgICAgICAgaWYgKGhhc1NtYWxsTGlvbiB8fCBoYXNGaXJlRGVidWZmKSB7XHJcbiAgICAgICAgICBjb25zdCBvd25lck5pY2sgPSBkYXRhLlNob3J0TmFtZShvd25lcik7XHJcblxyXG4gICAgICAgICAgY29uc3QgY2VudGVyWSA9IC03NTtcclxuICAgICAgICAgIGNvbnN0IHggPSBwYXJzZUZsb2F0KG1hdGNoZXMueCk7XHJcbiAgICAgICAgICBjb25zdCB5ID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICAgICAgbGV0IGRpck9iaiA9IG51bGw7XHJcbiAgICAgICAgICBpZiAoeSA8IGNlbnRlclkpIHtcclxuICAgICAgICAgICAgaWYgKHggPiAwKVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyTkU7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpck5XO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHggPiAwKVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyU0U7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpclNXO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgICAgYmxhbWU6IG93bmVyLFxyXG4gICAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2VuJ119KWAsXHJcbiAgICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICR7ZGlyT2JqWydkZSddfSlgLFxyXG4gICAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChkZSAke293bmVyTmlja30sICR7ZGlyT2JqWydmciddfSlgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke293bmVyTmlja33jgYvjgoksICR7ZGlyT2JqWydqYSddfSlgLFxyXG4gICAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6oke293bmVyTmlja30sICR7ZGlyT2JqWydjbiddfWAsXHJcbiAgICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke2Rpck9ialsna28nXX0pYCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgTm9ydGggQmlnIExpb24nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hZGRlZENvbWJhdGFudEZ1bGwoeyBuYW1lOiAnUmVnYWwgU2N1bHB0dXJlJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCB5ID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgaWYgKHkgPCBjZW50ZXJZKVxyXG4gICAgICAgICAgZGF0YS5ub3J0aEJpZ0xpb24gPSBtYXRjaGVzLmlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCaWcgTGlvbiBLaW5nc2JsYXplJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ1JlZ2FsIFNjdWxwdHVyZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0FiYmlsZCBlaW5lcyBncm/Dn2VuIEzDtndlbicsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ2Nyw6lhdGlvbiBsw6lvbmluZSByb3lhbGUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZDnjosnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCBzaW5nbGVUYXJnZXQgPSBtYXRjaGVzLnR5cGUgPT09ICcyMSc7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICAvLyBTdWNjZXNzIGlmIG9ubHkgb25lIHBlcnNvbiB0YWtlcyBpdCBhbmQgdGhleSBoYXZlIG5vIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGlmIChzaW5nbGVUYXJnZXQgJiYgIWhhc0ZpcmVEZWJ1ZmYpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHtcclxuICAgICAgICAgIG5vcnRoQmlnTGlvbjoge1xyXG4gICAgICAgICAgICBlbjogJ25vcnRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdOb3JkZW0sIGdyb8OfZXIgTMO2d2UnLFxyXG4gICAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljJcpJyxcclxuICAgICAgICAgICAgY246ICfljJfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAgICBrbzogJ+u2geyqvSDtgbAg7IKs7J6QJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzb3V0aEJpZ0xpb246IHtcclxuICAgICAgICAgICAgZW46ICdzb3V0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICAgIGRlOiAnU8O8ZGVuLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgICAgamE6ICflpKfjg6njgqTjgqrjg7Mo5Y2XKScsXHJcbiAgICAgICAgICAgIGNuOiAn5Y2X5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgICAga286ICfrgqjsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2hhcmVkOiB7XHJcbiAgICAgICAgICAgIGVuOiAnc2hhcmVkJyxcclxuICAgICAgICAgICAgZGU6ICdnZXRlaWx0JyxcclxuICAgICAgICAgICAgamE6ICfph43jga3jgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+mHjeWPoCcsXHJcbiAgICAgICAgICAgIGtvOiAn6rCZ7J20IOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmlyZURlYnVmZjoge1xyXG4gICAgICAgICAgICBlbjogJ2hhZCBmaXJlJyxcclxuICAgICAgICAgICAgZGU6ICdoYXR0ZSBGZXVlcicsXHJcbiAgICAgICAgICAgIGphOiAn54KO5LuY44GNJyxcclxuICAgICAgICAgICAgY246ICfngatEZWJ1ZmYnLFxyXG4gICAgICAgICAgICBrbzogJ+2ZlOyXvCDrlJTrsoTtlIQg67Cb7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFiZWxzID0gW107XHJcbiAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24gPT09IG1hdGNoZXMuc291cmNlSWQpXHJcbiAgICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5ub3J0aEJpZ0xpb25bZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQubm9ydGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LnNvdXRoQmlnTGlvbltkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5zb3V0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbmdsZVRhcmdldClcclxuICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5zaGFyZWRbZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQuc2hhcmVkWydlbiddKTtcclxuICAgICAgICBpZiAoaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIGxhYmVscy5wdXNoKG91dHB1dC5maXJlRGVidWZmW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0LmZpcmVEZWJ1ZmZbJ2VuJ10pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2xhYmVscy5qb2luKCcsICcpfSlgLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgS25vY2tlZCBPZmYnLFxyXG4gICAgICAvLyA1ODlBID0gSWNlIFBpbGxhciAocHJvbWlzZSBzaGl2YSBwaGFzZSlcclxuICAgICAgLy8gNThCNiA9IFBhbG0gT2YgVGVtcGVyYW5jZSAocHJvbWlzZSBzdGF0dWUgaGFuZClcclxuICAgICAgLy8gNThCNyA9IExhc2VyIEV5ZSAocHJvbWlzZSBsaW9uIHBoYXNlKVxyXG4gICAgICAvLyA1OEMxID0gRGFya2VzdCBEYW5jZSAob3JhY2xlIHRhbmsganVtcCArIGtub2NrYmFjayBpbiBiZWdpbm5pbmcgYW5kIHRyaXBsZSBhcG9jKVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTg5QScsICc1OEI2JywgJzU4QjcnLCAnNThDMSddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgT3JhY2xlIFNoYWRvd2V5ZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNThEMicsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUuZGFtYWdlID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHdhcm5pbmcgZm9yIHRha2luZyBEaWFtb25kIEZsYXNoICg1RkExKSBzdGFjayBvbiB5b3VyIG93bj9cclxuXHJcbi8vIERpYW1vbmQgV2VhcG9uIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVja0V4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMSc6ICc1RkFGJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAyJzogJzVGQjInLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDMnOiAnNUZDRCcsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNCc6ICc1RkNFJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA1JzogJzVGQ0YnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDYnOiAnNUZGOCcsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNyc6ICc2MTU5JywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEFydGljdWxhdGVkIEJpdCBBZXRoZXJpYWwgQnVsbGV0JzogJzVGQUInLCAvLyBiaXQgbGFzZXJzIGR1cmluZyBhbGwgcGhhc2VzXHJcbiAgICAnRGlhbW9uZEV4IERpYW1vbmQgU2hyYXBuZWwgMSc6ICc1RkNCJywgLy8gY2hhc2luZyBjaXJjbGVzXHJcbiAgICAnRGlhbW9uZEV4IERpYW1vbmQgU2hyYXBuZWwgMic6ICc1RkNDJywgLy8gY2hhc2luZyBjaXJjbGVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGlhbW9uZEV4IENsYXcgU3dpcGUgTGVmdCc6ICc1RkMyJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kRXggQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkMzJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kRXggQXVyaSBDeWNsb25lIDEnOiAnNUZEMScsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQ3ljbG9uZSAyJzogJzVGRDInLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmRFeCBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZGRScsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZEV4IEFpcnNoaXBcXCdzIEJhbmUgMic6ICc1RkQzJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmRFeCBUYW5rIExhc2Vycyc6ICc1RkM4JywgLy8gY2xlYXZpbmcgeWVsbG93IGxhc2VycyBvbiB0b3AgdHdvIGVubWl0eVxyXG4gICAgJ0RpYW1vbmRFeCBIb21pbmcgTGFzZXInOiAnNUZDNCcsIC8vIEFkYW1hbnRlIFB1cmdlIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGlhbW9uZEV4IEZsb29kIFJheSc6ICc1RkM3JywgLy8gXCJsaW1pdCBjdXRcIiBjbGVhdmVzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0RpYW1vbmRFeCBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkQwJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2ssXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEF1cmkgQXJ0cyc6ICc1RkUzJywgLy8gQXVyaSBBcnRzIGRhc2hlc1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIERpYW1vbmQgU2hyYXBuZWwgSW5pdGlhbCc6ICc1RkUxJywgLy8gaW5pdGlhbCBjaXJjbGUgb2YgRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIERpYW1vbmQgU2hyYXBuZWwgQ2hhc2luZyc6ICc1RkUyJywgLy8gZm9sbG93dXAgY2lyY2xlcyBmcm9tIERpYW1vbmQgU2hyYXBuZWxcclxuICAgICdEaWFtb25kIFdlYXBvbiBBZXRoZXJpYWwgQnVsbGV0JzogJzVGRDUnLCAvLyBiaXQgbGFzZXJzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBMZWZ0JzogJzVGRDknLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIENsYXcgU3dpcGUgUmlnaHQnOiAnNUZEQScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBDeWNsb25lIDEnOiAnNUZFNicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBDeWNsb25lIDInOiAnNUZFNycsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRTgnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFpcnNoaXBcXCdzIEJhbmUgMic6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEhvbWluZyBMYXNlcic6ICc1RkRCJywgLy8gc3ByZWFkIG1hcmtlcnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZCBXZWFwb24gVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUZFNScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW1FeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXknOiAnNUJEMycsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAxJzogJzU1N0InLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMic6ICc1NTdEJywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDEnOiAnNTU3QScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDInOiAnNTU3OScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEV4cGxvc2lvbic6ICc1NTk2JywgLy8gTWFnaXRlayBNaW5lIGV4cGxvc2lvblxyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBJbml0aWFsJzogJzU1Q0QnLCAvLyBzd29yZCBpbml0aWFsIHB1ZGRsZXNcclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgRXhwbG9zaW9uJzogJzU1Q0UnLCAvLyBzd29yZCBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZEV4IEFpcmJvcm5lIEV4cGxvc2lvbic6ICc1NUJEJywgLy8gZXhhZmxhcmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAxJzogJzU1RDQnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDInOiAnNTVENScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNob3RzIEZpcmVkJzogJzU1QjcnLCAvLyByYW5rIGFuZCBmaWxlIHNvbGRpZXJzXHJcbiAgICAnRW1lcmFsZEV4IFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NUNCJywgLy8gZHJvcHBlZCArIGFuZCB4IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZEV4IEV4cGlyZSc6ICc1NUQxJywgLy8gZ3JvdW5kIGFvZSBvbiBib3NzIFwiZ2V0IG91dFwiXHJcbiAgICAnRW1lcmFsZEV4IEFpcmUgVGFtIFN0b3JtJzogJzU1RDAnLCAvLyBleHBhbmRpbmcgcmVkIGFuZCBibGFjayBncm91bmQgYW9lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggRGl2aWRlIEV0IEltcGVyYSc6ICc1NUQ5JywgLy8gbm9uLXRhbmsgcHJvdGVhbiBzcHJlYWRcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAxJzogJzU1QzQnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAyJzogJzU1QzUnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAzJzogJzU1QzYnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCA0JzogJzU1QzcnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNhc3RydW1NYXJpbnVtLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSc6ICc0RjlEJywgLy8gRW1lcmFsZCBCZWFtIGluaXRpYWwgY29uYWxcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMSc6ICc1NTM0JywgLy8gRW1lcmFsZCBCZWFtIGluc2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMic6ICc1NTM2JywgLy8gRW1lcmFsZCBCZWFtIG1pZGRsZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMyc6ICc1NTM4JywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXkgMSc6ICc1NTMyJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAyJzogJzU1MzMnLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIE1hZ25ldGljIE1pbmUgRXhwbG9zaW9uJzogJzVCMDQnLCAvLyByZXB1bHNpbmcgbWluZSBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAxJzogJzU1M0YnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMic6ICc1NTQwJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDMnOiAnNTU0MScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSA0JzogJzU1NDInLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEJpdCBTdG9ybSc6ICc1NTRBJywgLy8gXCJnZXQgaW5cIlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEVtZXJhbGQgQ3J1c2hlcic6ICc1NTNDJywgLy8gYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFB1bHNlIExhc2VyJzogJzU1NDgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEVuZXJneSBBZXRoZXJvcGxhc20nOiAnNTU1MScsIC8vIGhpdHRpbmcgYSBnbG93eSBvcmJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIEdyb3VuZCc6ICc1NTZGJywgLy8gcGFydHkgdGFyZ2V0ZWQgZ3JvdW5kIGNvbmVzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHJpbXVzIFRlcm1pbnVzIEVzdCc6ICc0QjNFJywgLy8gZ3JvdW5kIGNpcmNsZSBkdXJpbmcgYXJyb3cgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTZWN1bmR1cyBUZXJtaW51cyBFc3QnOiAnNTU2QScsIC8vIFggLyArIGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gVGVydGl1cyBUZXJtaW51cyBFc3QnOiAnNTU2RCcsIC8vIHRyaXBsZSBzd29yZHNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaG90cyBGaXJlZCc6ICc1NTVGJywgLy8gbGluZSBhb2VzIGZyb20gc29sZGllcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDEnOiAnNTU0RScsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDFcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIFAyJzogJzU1NzAnLCAvLyB0YW5rYnVzdGVyLCBwcm9iYWJseSBjbGVhdmVzLCBwaGFzZSAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIEVtZXJhbGQgQ3J1c2hlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU1M0UnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBHZXR0aW5nIGtub2NrZWQgaW50byBhIHdhbGwgZnJvbSB0aGUgYXJyb3cgaGVhZG1hcmtlci5cclxuICAgICAgaWQ6ICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0IFdhbGwnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTU2MycsICc1NTY0J10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBIYWRlcyBFeFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTWluc3RyZWxzQmFsbGFkSGFkZXNzRWxlZ3ksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAyJzogJzQ3QUEnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCAzJzogJzQ3RTQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCA0JzogJzQ3RTUnLFxyXG4gICAgLy8gRXZlcnlib2R5IHN0YWNrcyBpbiBnb29kIGZhaXRoIGZvciBCYWQgRmFpdGgsIHNvIGRvbid0IGNhbGwgaXQgYSBtaXN0YWtlLlxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDEnOiAnNDdBRCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMic6ICc0N0IwJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAzJzogJzQ3QUUnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDQnOiAnNDdBRicsXHJcbiAgICAnSGFkZXNFeCBCcm9rZW4gRmFpdGgnOiAnNDdCMicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBTcGVhcic6ICc0N0I2JyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIENoYWtyYW0nOiAnNDdCNScsXHJcbiAgICAnSGFkZXNFeCBGb3JrZWQgTGlnaHRuaW5nJzogJzQ3QzknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDEnOiAnNDdGMScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMic6ICc0N0YyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIYWRlc0V4IENvbWV0JzogJzQ3QjknLCAvLyBtaXNzZWQgdG93ZXJcclxuICAgICdIYWRlc0V4IEFuY2llbnQgRXJ1cHRpb24nOiAnNDdEMycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMSc6ICc0N0VDJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAyJzogJzQ3RUQnLFxyXG4gICAgJ0hhZGVzRXggU2hhZG93IFN0cmVhbSc6ICc0N0VBJyxcclxuICAgICdIYWRlc0V4IERlYWQgU3BhY2UnOiAnNDdFRScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgSW5pdGlhbCc6ICc0N0E5JyxcclxuICAgICdIYWRlc0V4IFJhdmVub3VzIEFzc2F1bHQnOiAnKD86NDdBNnw0N0E3KScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZsYW1lIDEnOiAnNDdDNicsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAxJzogJzQ3QzQnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMic6ICc0N0RGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJIFRldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ1NoYWRvdyBvZiB0aGUgQW5jaWVudHMnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRGFyayA9IGRhdGEuaGFzRGFyayB8fCBbXTtcclxuICAgICAgICBkYXRhLmhhc0RhcmsucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRGFyayBJSScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNDdCQScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAvLyBEb24ndCBibGFtZSBwZW9wbGUgd2hvIGRvbid0IGhhdmUgdGV0aGVycy5cclxuICAgICAgICByZXR1cm4gZS50eXBlICE9PSAnMTUnICYmIGRhdGEubWUgaW4gZGF0YS5oYXNEYXJrO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJvc3MgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiBbJ0lnZXlvcmhtXFwncyBTaGFkZScsICdMYWhhYnJlYVxcJ3MgU2hhZGUnXSwgaWQ6ICcwMDBFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdCb3NzZXMgVG9vIENsb3NlJyxcclxuICAgICAgICAgIGRlOiAnQm9zc2VzIHp1IE5haGUnLFxyXG4gICAgICAgICAgZnI6ICdCb3NzIHRyb3AgcHJvY2hlcycsXHJcbiAgICAgICAgICBqYTogJ+ODnOOCuei/keOBmeOBjuOCiycsXHJcbiAgICAgICAgICBjbjogJ0JPU1PpnaDlpKrov5HkuoYnLFxyXG4gICAgICAgICAga286ICfsq4Trk6TsnbQg64SI66y0IOqwgOq5jOybgCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEZWF0aCBTaHJpZWsnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzQ3Q0InLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiBlLmRhbWFnZSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID0gZGF0YS5oYXNCZXlvbmREZWF0aCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGgpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbSBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA9IGRhdGEuaGFzRG9vbSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEhhZGVzIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRHlpbmdHYXNwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMSc6ICc0MTRCJyxcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMic6ICc0MTRDJyxcclxuICAgICdIYWRlcyBEYXJrIEVydXB0aW9uJzogJzQxNTInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMSc6ICc0MTU2JyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3ByZWFkIDInOiAnNDE1NycsXHJcbiAgICAnSGFkZXMgQnJva2VuIEZhaXRoJzogJzQxNEUnLFxyXG4gICAgJ0hhZGVzIEhlbGxib3JuIFlhd3AnOiAnNDE2RicsXHJcbiAgICAnSGFkZXMgUHVyZ2F0aW9uJzogJzQxNzInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTdHJlYW0nOiAnNDE1QycsXHJcbiAgICAnSGFkZXMgQWVybyc6ICc0NTk1JyxcclxuICAgICdIYWRlcyBFY2hvIDEnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgRWNobyAyJzogJzQxNjQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSGFkZXMgTmV0aGVyIEJsYXN0JzogJzQxNjMnLFxyXG4gICAgJ0hhZGVzIFJhdmVub3VzIEFzc2F1bHQnOiAnNDE1OCcsXHJcbiAgICAnSGFkZXMgQW5jaWVudCBEYXJrbmVzcyc6ICc0NTkzJyxcclxuICAgICdIYWRlcyBEdWFsIFN0cmlrZSc6ICc0MTYyJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIElubm9jZW5jZSBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDcm93bk9mVGhlSW1tYWN1bGF0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm9FeCBEdWVsIERlc2NlbnQnOiAnM0VEMicsXHJcbiAgICAnSW5ub0V4IFJlcHJvYmF0aW9uIDEnOiAnM0VFMCcsXHJcbiAgICAnSW5ub0V4IFJlcHJvYmF0aW9uIDInOiAnM0VDQycsXHJcbiAgICAnSW5ub0V4IFN3b3JkIG9mIENvbmRlbW5hdGlvbiAxJzogJzNFREUnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMic6ICczRURGJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMSc6ICczRUQzJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMic6ICczRUQ0JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgMyc6ICczRUQ1JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNCc6ICczRUQ2JyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNSc6ICczRUZCJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNic6ICczRUZDJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgNyc6ICczRUZEJyxcclxuICAgICdJbm5vRXggRHJlYW0gb2YgdGhlIFJvb2QgOCc6ICczRUZFJyxcclxuICAgICdJbm5vRXggSG9seSBUcmluaXR5JzogJzNFREInLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDEnOiAnM0VENycsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMic6ICczRUQ4JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAzJzogJzNFRDknLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDQnOiAnM0VEQScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNSc6ICczRUZGJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA2JzogJzNGMDAnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDcnOiAnM0YwMScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgOCc6ICczRjAyJyxcclxuICAgICdJbm5vRXggR29kIFJheSAxJzogJzNFRTYnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDInOiAnM0VFNycsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMyc6ICczRUU4JyxcclxuICAgICdJbm5vRXggRXhwbG9zaW9uJzogJzNFRjAnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSW5ub2NlbmNlIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm8gRGF5YnJlYWsnOiAnM0U5RCcsXHJcbiAgICAnSW5ubyBIb2x5IFRyaW5pdHknOiAnM0VCMycsXHJcblxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMSc6ICczRUI2JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDInOiAnM0VCOCcsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAzJzogJzNFQ0InLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gNCc6ICczRUI3JyxcclxuXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDEnOiAnM0VCMScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDInOiAnM0VCMicsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDMnOiAnM0VGOScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDQnOiAnM0VGQScsXHJcblxyXG4gICAgJ0lubm8gR29kIFJheSAxJzogJzNFQkQnLFxyXG4gICAgJ0lubm8gR29kIFJheSAyJzogJzNFQkUnLFxyXG4gICAgJ0lubm8gR29kIFJheSAzJzogJzNFQkYnLFxyXG4gICAgJ0lubm8gR29kIFJheSA0JzogJzNFQzAnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA1Q0NBLzVDQ0IvNUNDQywgV2F0ZXJzcG91dCA9IDVDRDFcclxuXHJcbi8vIExldmlhdGhhbiBVbnJlYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0xldmlVbiBHcmFuZCBGYWxsJzogJzVDREYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aVVuIEh5ZHJvc2hvdCc6ICc1Q0Q1JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlVbiBEcmVhZHN0b3JtJzogJzVDRDYnLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpVW4gQm9keSBTbGFtJzogJzVDRDInLCAvLyBsZXZpIHNsYW0gdGhhdCB0aWx0cyB0aGUgYm9hdFxyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDEnOiAnNUNEQicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAyJzogJzVDRTMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMyc6ICc1Q0U4JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDQnOiAnNUNFOScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlVbiBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlVbiBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpVW4gQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUNEMicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHRha2luZyB0d28gZGlmZmVyZW50IEhpZ2gtUG93ZXJlZCBIb21pbmcgTGFzZXJzICg0QUQ4KVxyXG4vLyBUT0RPOiBjb3VsZCBibGFtZSB0aGUgdGV0aGVyZWQgcGxheWVyIGZvciBXaGl0ZSBBZ29ueSAvIFdoaXRlIEZ1cnkgZmFpbHVyZXM/XHJcblxyXG4vLyBSdWJ5IFdlYXBvbiBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IEJpdCBNYWdpdGVrIFJheSc6ICc0QUQyJywgLy8gbGluZSBhb2VzIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDEnOiAnNEFEMycsIC8vIGluaXRpYWwgZXhwbG9zaW9uIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRicsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAzJzogJzREMDQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDQnOiAnNEQwNScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNSc6ICc0QUNEJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA2JzogJzRBQ0UnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFVuZGVybWluZSc6ICc0QUQwJywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFJheSc6ICc0QjAyJywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMSc6ICc0QUQ5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyJzogJzRBREEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDMnOiAnNEFERCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNCc6ICc0QURFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA1JzogJzRBREYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDYnOiAnNEFFMCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNyc6ICc0QUUxJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA4JzogJzRBRTInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDknOiAnNEFFMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTAnOiAnNEFFNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTEnOiAnNEFFNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTInOiAnNEFFNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTMnOiAnNEFFNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTQnOiAnNEFFOCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTUnOiAnNEFFOScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTYnOiAnNEFFQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTcnOiAnNEU2QicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTgnOiAnNEU2QycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTknOiAnNEU2RCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjAnOiAnNEU2RScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjEnOiAnNEU2RicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjInOiAnNEU3MCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAxJzogJzRCMDUnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDInOiAnNEIwNicsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMyc6ICc0QjA3JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biA0JzogJzRCMDgnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDUnOiAnNERPRCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggTWV0ZW9yIEJ1cnN0JzogJzRBRjInLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieUV4IEJyYWRhbWFudGUnOiAnNEUzOCcsIC8vIGhlYWRtYXJrZXJzIHdpdGggbGluZSBhb2VzXHJcbiAgICAnUnVieUV4IENvbWV0IEhlYXZ5IEltcGFjdCc6ICc0QUY2JywgLy8gbGV0dGluZyBhIHRhbmsgY29tZXQgbGFuZFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFNwaGVyZSBCdXJzdCc6ICc0QUNCJywgLy8gZXhwbG9kaW5nIHRoZSByZWQgbWluZVxyXG4gICAgJ1J1YnlFeCBMdW5hciBEeW5hbW8nOiAnNEVCMCcsIC8vIFwiZ2V0IGluXCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IElyb24gQ2hhcmlvdCc6ICc0RUIxJywgLy8gXCJnZXQgb3V0XCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IEhlYXJ0IEluIFRoZSBNYWNoaW5lJzogJzRBRkEnLCAvLyBXaGl0ZSBBZ29ueS9GdXJ5IHNrdWxsIGhpdHRpbmcgcGxheWVyc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieUV4IEhvbWluZyBMYXNlcnMnOiAnNEFENicsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBjdXQgYW5kIHJ1blxyXG4gICAgJ1J1YnlFeCBNZXRlb3IgU3RyZWFtJzogJzRFNjgnLCAvLyBzcHJlYWQgbWFya2VycyBkdXJpbmcgUDJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ1J1YnlFeCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBOZWdhdGl2ZSBBdXJhIGxvb2thd2F5IGZhaWx1cmVcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnUnVieUV4IFNjcmVlY2gnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QUVFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gUnVieSBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNpbmRlckRyaWZ0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdSdWJ5IFJhdmVuc2NsYXcnOiAnNEE5MycsIC8vIGNlbnRlcmVkIGNpcmNsZSBhb2UgZm9yIHJhdmVuc2NsYXdcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDEnOiAnNEE5QScsIC8vIGluaXRpYWwgZXhwbG9zaW9uIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAyJzogJzRCMkUnLCAvLyBmb2xsb3d1cCBoZWxpY29jbGF3IGV4cGxvc2lvbnNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDMnOiAnNEE5NCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDQnOiAnNEE5NScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDUnOiAnNEQwMicsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDYnOiAnNEQwMycsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5IFJ1YnkgUmF5JzogJzRBQzYnLCAvLyBmcm9udGFsIGxhc2VyXHJcbiAgICAnUnVieSBVbmRlcm1pbmUnOiAnNEE5NycsIC8vIGdyb3VuZCBhb2VzIHVuZGVyIHRoZSByYXZlbnNjbGF3IHBhdGNoZXNcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxJzogJzRFNjknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAyJzogJzRFNkEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAzJzogJzRBQTEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA0JzogJzRBQTInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA1JzogJzRBQTMnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA2JzogJzRBQTQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA3JzogJzRBQTUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA4JzogJzRBQTYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCA5JzogJzRBQTcnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxMCc6ICc0QzIxJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMTEnOiAnNEMyQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgQ29tZXQgQnVyc3QnOiAnNEFCNCcsIC8vIG1ldGVvciBleHBsb2RpbmdcclxuICAgICdSdWJ5IEJyYWRhbWFudGUnOiAnNEFCQycsIC8vIGhlYWRtYXJrZXJzIHdpdGggbGluZSBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdSdWJ5IEhvbWluZyBMYXNlcic6ICc0QUM1JywgLy8gc3ByZWFkIG1hcmtlcnMgaW4gUDFcclxuICAgICdSdWJ5IE1ldGVvciBTdHJlYW0nOiAnNEU2NycsIC8vIHNwcmVhZCBtYXJrZXJzIGluIFAyXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIFVucmVhbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZVVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICc1MzdCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICc1Mzc2JyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnNTM3NScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJzUzNzgnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICc1MzZGJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJzUzNzknLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rIGJ1c3Rlci5cclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJzUzNzMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgNTM3QSBvbiB5b3UsIGJ1dCBpdCBoYXMgYW4gdW5rbm93biBuYW1lLlxyXG4gICAgICAvLyBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuaWEgV29vZFxcJ3MgRW1icmFjZSc6ICczRDUwJyxcclxuICAgIC8vICdUaXRhbmlhIEZyb3N0IFJ1bmUnOiAnM0Q0RScsXHJcbiAgICAnVGl0YW5pYSBHZW50bGUgQnJlZXplJzogJzNGODMnLFxyXG4gICAgJ1RpdGFuaWEgTGVhZnN0b3JtIDEnOiAnM0Q1NScsXHJcbiAgICAnVGl0YW5pYSBQdWNrXFwncyBSZWJ1a2UnOiAnM0Q1OCcsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMic6ICczRTAzJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhIFBoYW50b20gUnVuZSAxJzogJzNENUQnLFxyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDInOiAnM0Q1RScsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbmlhIERpdmluYXRpb24gUnVuZSc6ICczRDVCJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEYW5jaW5nUGxhZ3VlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYUV4IFdvb2RcXCdzIEVtYnJhY2UnOiAnM0QyRicsXHJcbiAgICAvLyAnVGl0YW5pYUV4IEZyb3N0IFJ1bmUnOiAnM0QyQicsXHJcbiAgICAnVGl0YW5pYUV4IEdlbnRsZSBCcmVlemUnOiAnM0Y4MicsXHJcbiAgICAnVGl0YW5pYUV4IExlYWZzdG9ybSAxJzogJzNEMzknLFxyXG4gICAgJ1RpdGFuaWFFeCBQdWNrXFwncyBSZWJ1a2UnOiAnM0Q0MycsXHJcbiAgICAnVGl0YW5pYUV4IFdhbGxvcCc6ICczRDNCJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDInOiAnM0Q0OScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAxJzogJzNENEMnLFxyXG4gICAgJ1RpdGFuaWFFeCBQaGFudG9tIFJ1bmUgMic6ICczRDREJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVE9ETzogVGhpcyBjb3VsZCBtYXliZSBibGFtZSB0aGUgcGVyc29uIHdpdGggdGhlIHRldGhlcj9cclxuICAgICdUaXRhbmlhRXggVGh1bmRlciBSdW5lJzogJzNEMjknLFxyXG4gICAgJ1RpdGFuaWFFeCBEaXZpbmF0aW9uIFJ1bmUnOiAnM0Q0QScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaXRhbiBVbnJlYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsVW5yZWFsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhblVuIFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1OEZFJyxcclxuICAgICdUaXRhblVuIEJ1cnN0JzogJzVBREYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTGFuZHNsaWRlJzogJzVBREMnLFxyXG4gICAgJ1RpdGFuVW4gR2FvbGVyIExhbmRzbGlkZSc6ICc1OTAyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gUm9jayBCdXN0ZXInOiAnNThGNicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhblVuIE1vdW50YWluIEJ1c3Rlcic6ICc1OEY3JyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NZW1vcmlhTWlzZXJhRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAxJzogJzRDRDInLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMic6ICc0Q0QzJyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDMnOiAnNENENCcsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA0JzogJzRDRDUnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgNSc6ICc0Q0Q2JyxcclxuICAgICdWYXJpc0V4IElnbmlzIEVzdCAxJzogJzRDQjUnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDInOiAnNENDNScsXHJcbiAgICAnVmFyaXNFeCBWZW50dXMgRXN0IDEnOiAnNENDNycsXHJcbiAgICAnVmFyaXNFeCBWZW50dXMgRXN0IDInOiAnNENDOCcsXHJcbiAgICAnVmFyaXNFeCBBc3NhdWx0IENhbm5vbic6ICc0Q0U1JyxcclxuICAgICdWYXJpc0V4IEZvcnRpdXMgUm90YXRpbmcnOiAnNENFOScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyBEb24ndCBoaXQgdGhlIHNoaWVsZHMhXHJcbiAgICAnVmFyaXNFeCBSZXBheSc6ICc0Q0REJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gVGhpcyBpcyB0aGUgXCJwcm90ZWFuXCIgZm9ydGl1cy5cclxuICAgICdWYXJpc0V4IEZvcnRpdXMgUHJvdGVhbic6ICc0Q0U3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1ZhcmlzRXggTWFnaXRlayBCdXJzdCc6ICc0Q0RGJyxcclxuICAgICdWYXJpc0V4IEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzRDRUQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdWYXJpc0V4IFRlcm1pbnVzIEVzdCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNENCNCcsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRGMTYvNEYxNyh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRGMTgvNEYxOSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEYxQSwgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGEgdG93ZXI/XHJcblxyXG4vLyBOb3RlOiBEZWxpYmVyYXRlbHkgbm90IGluY2x1ZGluZyBweXJldGljIGRhbWFnZSBhcyBhbiBlcnJvci5cclxuLy8gTm90ZTogSXQgZG9lc24ndCBhcHBlYXIgdGhhdCB0aGVyZSdzIGFueSB3YXkgdG8gdGVsbCB3aG8gZmFpbGVkIHRoZSBjdXRzY2VuZS5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTZWF0T2ZTYWNyaWZpY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTCBTb2xlbW4gQ29uZml0ZW9yJzogJzRGMkEnLCAvLyBncm91bmQgcHVkZGxlc1xyXG4gICAgJ1dPTCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEYxMCcsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEYxMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTCBJbWJ1ZWQgQ29ydXNhbmNlIE91dCc6ICc0RjRCJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QycsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MIFNoaW5pbmcgV2F2ZSc6ICc0RjI2JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0wgQ2F1dGVyaXplJzogJzRGMjUnLFxyXG4gICAgJ1dPTCBCcmltc3RvbmUgRWFydGggMSc6ICc0RjFFJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgaW5pdGlhbFxyXG4gICAgJ1dPTCBCcmltc3RvbmUgRWFydGggMic6ICc0RjFGJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgZ3Jvd2luZ1xyXG4gICAgJ1dPTCBGbGFyZSBCcmVhdGgnOiAnNEYyNCcsXHJcbiAgICAnV09MIERlY2ltYXRpb24nOiAnNEYyMycsXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXT0wgRGVlcCBGcmVlemUnOiAnNEU2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MIFRydWUgV2Fsa2luZyBEZWFkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChlLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogZS50YXJnZXQsIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRFRjcvNEVGOCh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRFRjkvNEVGQSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEVGQywgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBBYnNvbHV0ZSBIb2x5IHNob3VsZCBiZSBzaGFyZWQ/XHJcbi8vIFRPRE86IGludGVyc2VjdGluZyBicmltc3RvbmVzP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTEV4IFNvbGVtbiBDb25maXRlb3InOiAnNEYwQycsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIEluJzogJzRFRjInLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEVGMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNDknLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0xFeCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEEnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IFNoaW5pbmcgV2F2ZSc6ICc0RjA4JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0xFeCBDYXV0ZXJpemUnOiAnNEYwNycsXHJcbiAgICAnV09MRXggQnJpbXN0b25lIEVhcnRoJzogJzRGMDAnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdXT0xFeCBBYnNvbHV0ZSBTdG9uZSBJSUknOiAnNEVFQicsIC8vIHByb3RlYW4gd2F2ZSBpbWJ1ZWQgbWFnaWNcclxuICAgICdXT0xFeCBGbGFyZSBCcmVhdGgnOiAnNEYwNicsIC8vIHRldGhlciBmcm9tIHN1bW1vbmVkIGJhaGFtdXRzXHJcbiAgICAnV09MRXggUGVyZmVjdCBEZWNpbWF0aW9uJzogJzRGMDUnLCAvLyBzbW4vd2FyIHBoYXNlIG1hcmtlclxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV09MRXggRGVlcCBGcmVlemUnOiAnNEU2JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBCbGl6emFyZCBJSUlcclxuICAgICdXT0xFeCBEYW1hZ2UgRG93bic6ICcyNzQnLCAvLyBmYWlsaW5nIEFic29sdXRlIEZsYXNoXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ1dvbEV4IEthdG9uIFNhbiBTaGFyZSc6ICc0RUZFJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEZGJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBlLnRhcmdldCwgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUb3dlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRGMDQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbWlzdGFrZToge1xyXG4gICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgIGVuOiAnTWlzc2VkIFRvd2VyJyxcclxuICAgICAgICAgIGRlOiAnVHVybSB2ZXJwYXNzdCcsXHJcbiAgICAgICAgICBmcjogJ1RvdXIgbWFucXXDqWUnLFxyXG4gICAgICAgICAgamE6ICfloZTjgpLouI/jgb7jgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgY246ICfmsqHouKnloZQnLFxyXG4gICAgICAgICAga286ICfsnqXtjJAg7Iuk7IiYJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIEhhbGxvd2VkIEdyb3VuZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRGNDQnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCByZWFzb246IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gRm9yIEJlcnNlcmsgYW5kIERlZXAgRGFya3NpZGVcclxuICAgICAgaWQ6ICdXT0xFeCBNaXNzZWQgSW50ZXJydXB0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzUxNTYnLCAnNTE1OCddIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCByZWFzb246IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogRklYIGx1bWlub3VzIGFldGhlcm9wbGFzbSB3YXJuaW5nIG5vdCB3b3JraW5nXHJcbi8vIFRPRE86IEZJWCBkb2xsIGRlYXRoIG5vdCB3b3JraW5nXHJcbi8vIFRPRE86IGZhaWxpbmcgaGFuZCBvZiBwYWluL3BhcnRpbmcgKGNoZWNrIGZvciBoaWdoIGRhbWFnZT8pXHJcbi8vIFRPRE86IG1ha2Ugc3VyZSBldmVyeWJvZHkgdGFrZXMgZXhhY3RseSBvbmUgcHJvdGVhbiAocmF0aGVyIHRoYW4gd2F0Y2hpbmcgZG91YmxlIGhpdHMpXHJcbi8vIFRPRE86IHRodW5kZXIgbm90IGhpdHRpbmcgZXhhY3RseSAyP1xyXG4vLyBUT0RPOiBwZXJzb24gd2l0aCB3YXRlci90aHVuZGVyIGRlYnVmZiBkeWluZ1xyXG4vLyBUT0RPOiBiYWQgbmlzaSBwYXNzXHJcbi8vIFRPRE86IGZhaWxlZCBnYXZlbCBtZWNoYW5pY1xyXG4vLyBUT0RPOiBkb3VibGUgcm9ja2V0IHB1bmNoIG5vdCBoaXR0aW5nIGV4YWN0bHkgMj8gKG9yIHRhbmtzKVxyXG4vLyBUT0RPOiBzdGFuZGluZyBpbiBzbHVkZ2UgcHVkZGxlcyBiZWZvcmUgaGlkZGVuIG1pbmU/XHJcbi8vIFRPRE86IGhpZGRlbiBtaW5lIGZhaWx1cmU/XHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIG9yZGFpbmVkIG1vdGlvbiAvIHN0aWxsbmVzc1xyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBwbGFpbnQgb2Ygc2V2ZXJpdHkgKHRldGhlcnMpXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzb2xpZGFyaXR5IChzaGFyZWQgc2VudGVuY2UpXHJcbi8vIFRPRE86IG9yZGFpbmVkIGNhcGl0YWwgcHVuaXNobWVudCBoaXR0aW5nIG5vbi10YW5rc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUVwaWNPZkFsZXhhbmRlclVsdGltYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdURUEgU2x1aWNlJzogJzQ5QjEnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMSc6ICc0ODI0JyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIDInOiAnNDlCNScsXHJcbiAgICAnVEVBIFNwaW4gQ3J1c2hlcic6ICc0QTcyJyxcclxuICAgICdURUEgU2FjcmFtZW50JzogJzQ4NUYnLFxyXG4gICAgJ1RFQSBSYWRpYW50IFNhY3JhbWVudCc6ICc0ODg2JyxcclxuICAgICdURUEgQWxtaWdodHkgSnVkZ21lbnQnOiAnNDg5MCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVEVBIEhhd2sgQmxhc3Rlcic6ICc0ODMwJyxcclxuICAgICdURUEgQ2hha3JhbSc6ICc0ODU1JyxcclxuICAgICdURUEgRW51bWVyYXRpb24nOiAnNDg1MCcsXHJcbiAgICAnVEVBIEFwb2NhbHlwdGljIFJheSc6ICc0ODRDJyxcclxuICAgICdURUEgUHJvcGVsbGVyIFdpbmQnOiAnNDgzMicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIERvdWJsZSAxJzogJzQ5QjYnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDInOiAnNDgyNScsXHJcbiAgICAnVEVBIEZsdWlkIFN3aW5nJzogJzQ5QjAnLFxyXG4gICAgJ1RFQSBGbHVpZCBTdHJpa2UnOiAnNDlCNycsXHJcbiAgICAnVEVBIEhpZGRlbiBNaW5lJzogJzQ4NTInLFxyXG4gICAgJ1RFQSBBbHBoYSBTd29yZCc6ICc0ODZCJyxcclxuICAgICdURUEgRmxhcmV0aHJvd2VyJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBDaGFzdGVuaW5nIEhlYXQnOiAnNEE4MCcsXHJcbiAgICAnVEVBIERpdmluZSBTcGVhcic6ICc0QTgyJyxcclxuICAgICdURUEgT3JkYWluZWQgUHVuaXNobWVudCc6ICc0ODkxJyxcclxuICAgIC8vIE9wdGljYWwgU3ByZWFkXHJcbiAgICAnVEVBIEluZGl2aWR1YWwgUmVwcm9iYXRpb24nOiAnNDg4QycsXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgLy8gT3B0aWNhbCBTdGFja1xyXG4gICAgJ1RFQSBDb2xsZWN0aXZlIFJlcHJvYmF0aW9uJzogJzQ4OEQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQmFsbG9vbiBQb3BwaW5nLiAgSXQgc2VlbXMgbGlrZSB0aGUgcGVyc29uIHdobyBwb3BzIGl0IGlzIHRoZVxyXG4gICAgICAvLyBmaXJzdCBwZXJzb24gbGlzdGVkIGRhbWFnZS13aXNlLCBzbyB0aGV5IGFyZSBsaWtlbHkgdGhlIGN1bHByaXQuXHJcbiAgICAgIGlkOiAnVEVBIE91dGJ1cnN0JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0ODJBJyxcclxuICAgICAgY29sbGVjdFNlY29uZHM6IDAuNSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGVbMF0udGFyZ2V0TmFtZSwgdGV4dDogZVswXS5hdHRhY2tlck5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFwidG9vIG11Y2ggbHVtaW5vdXMgYWV0aGVyb3BsYXNtXCJcclxuICAgICAgLy8gV2hlbiB0aGlzIGhhcHBlbnMsIHRoZSB0YXJnZXQgZXhwbG9kZXMsIGhpdHRpbmcgbmVhcmJ5IHBlb3BsZVxyXG4gICAgICAvLyBidXQgYWxzbyB0aGVtc2VsdmVzLlxyXG4gICAgICBpZDogJ1RFQSBFeGhhdXN0JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0ODFGJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS50YXJnZXROYW1lID09PSBlLmF0dGFja2VyTmFtZSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IGUudGFyZ2V0TmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsdW1pbm91cyBhZXRoZXJvcGxhc20nLFxyXG4gICAgICAgICAgICBkZTogJ0x1bWluaXN6ZW50ZXMgw4R0aGVyb3BsYXNtYScsXHJcbiAgICAgICAgICAgIGZyOiAnw4l0aMOpcm9wbGFzbWEgbHVtaW5ldXgnLFxyXG4gICAgICAgICAgICBqYTogJ+WFieaAp+eIhumbtycsXHJcbiAgICAgICAgICAgIGNuOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIERyb3BzeScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMjEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUZXRoZXIgVHJhY2tpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdKYWdkIERvbGwnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlciA9IGRhdGEuamFnZFRldGhlciB8fCB7fTtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFJlZHVjaWJsZSBDb21wbGV4aXR5JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0ODIxJyxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgLy8gVGhpcyBtYXkgYmUgdW5kZWZpbmVkLCB3aGljaCBpcyBmaW5lLlxyXG4gICAgICAgICAgbmFtZTogZGF0YS5qYWdkVGV0aGVyID8gZGF0YS5qYWdkVGV0aGVyW2UuYXR0YWNrZXJJZF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRG9sbCBEZWF0aCcsXHJcbiAgICAgICAgICAgIGRlOiAnUHVwcGUgVG90JyxcclxuICAgICAgICAgICAgZnI6ICdQb3Vww6llIG1vcnRlJyxcclxuICAgICAgICAgICAgamE6ICfjg4njg7zjg6vjgYzmrbvjgpPjgaAnLFxyXG4gICAgICAgICAgICBjbjogJ+a1ruWjq+W+t+atu+S6oScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBEcmFpbmFnZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNDgyNycsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyB3aGVuIG5nbGQgb3ZlcmxheXBsdWdpbiBpcyB0aGUgZGVmYXVsdFxyXG4gICAgICAgIGlmICghZGF0YS5wYXJ0eS5wYXJ0eU5hbWVzLmxlbmd0aClcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSAmJiAhZGF0YS5wYXJ0eS5pc1RhbmsoZS50YXJnZXROYW1lKTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGUgPSBkYXRhLmhhc1Rocm90dGxlIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlIExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlID0gZGF0YS5oYXNUaHJvdHRsZSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgZmlsZTAgZnJvbSAnLi8wMC1taXNjL2J1ZmZzLmpzJztcbmltcG9ydCBmaWxlMSBmcm9tICcuLzAwLW1pc2MvZ2VuZXJhbC5qcyc7XG5pbXBvcnQgZmlsZTIgZnJvbSAnLi8wMC1taXNjL3Rlc3QuanMnO1xuaW1wb3J0IGZpbGUzIGZyb20gJy4vMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzJztcbmltcG9ydCBmaWxlNCBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyc7XG5pbXBvcnQgZmlsZTUgZnJvbSAnLi8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyc7XG5pbXBvcnQgZmlsZTYgZnJvbSAnLi8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMnO1xuaW1wb3J0IGZpbGU3IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzJztcbmltcG9ydCBmaWxlOCBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1obS5qcyc7XG5pbXBvcnQgZmlsZTkgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tZXguanMnO1xuaW1wb3J0IGZpbGUxMCBmcm9tICcuLzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS5qcyc7XG5pbXBvcnQgZmlsZTExIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9hZXRoZXJvY2hlbWljYWxfcmVzZWFyY2hfZmFjaWxpdHkuanMnO1xuaW1wb3J0IGZpbGUxMiBmcm9tICcuLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0uanMnO1xuaW1wb3J0IGZpbGUxMyBmcm9tICcuLzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLmpzJztcbmltcG9ydCBmaWxlMTQgZnJvbSAnLi8wMy1ody9kdW5nZW9uL3NvaG1fYWxfaGFyZC5qcyc7XG5pbXBvcnQgZmlsZTE1IGZyb20gJy4vMDMtaHcvcmFpZC9hMTJuLmpzJztcbmltcG9ydCBmaWxlMTYgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2FsYV9taGlnby5qcyc7XG5pbXBvcnQgZmlsZTE3IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS5qcyc7XG5pbXBvcnQgZmlsZTE4IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzJztcbmltcG9ydCBmaWxlMTkgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N0X21vY2lhbm5lX2hhcmQuanMnO1xuaW1wb3J0IGZpbGUyMCBmcm9tICcuLzA0LXNiL2R1bmdlb24vc3dhbGxvd3NfY29tcGFzcy5qcyc7XG5pbXBvcnQgZmlsZTIxIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QuanMnO1xuaW1wb3J0IGZpbGUyMiBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGhlX2J1cm4uanMnO1xuaW1wb3J0IGZpbGUyMyBmcm9tICcuLzA0LXNiL3JhaWQvbzFuLmpzJztcbmltcG9ydCBmaWxlMjQgZnJvbSAnLi8wNC1zYi9yYWlkL28ybi5qcyc7XG5pbXBvcnQgZmlsZTI1IGZyb20gJy4vMDQtc2IvcmFpZC9vM24uanMnO1xuaW1wb3J0IGZpbGUyNiBmcm9tICcuLzA0LXNiL3JhaWQvbzRuLmpzJztcbmltcG9ydCBmaWxlMjcgZnJvbSAnLi8wNC1zYi9yYWlkL280cy5qcyc7XG5pbXBvcnQgZmlsZTI4IGZyb20gJy4vMDQtc2IvcmFpZC9vN3MuanMnO1xuaW1wb3J0IGZpbGUyOSBmcm9tICcuLzA0LXNiL3JhaWQvbzEycy5qcyc7XG5pbXBvcnQgZmlsZTMwIGZyb20gJy4vMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzJztcbmltcG9ydCBmaWxlMzEgZnJvbSAnLi8wNC1zYi90cmlhbC9zaGlucnl1LmpzJztcbmltcG9ydCBmaWxlMzIgZnJvbSAnLi8wNC1zYi90cmlhbC9zdXNhbm8tZXguanMnO1xuaW1wb3J0IGZpbGUzMyBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMnO1xuaW1wb3J0IGZpbGUzNCBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUuanMnO1xuaW1wb3J0IGZpbGUzNSBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkuanMnO1xuaW1wb3J0IGZpbGUzNiBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIuanMnO1xuaW1wb3J0IGZpbGUzNyBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC5qcyc7XG5pbXBvcnQgZmlsZTM4IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci5qcyc7XG5pbXBvcnQgZmlsZTM5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW1hdXJvdC5qcyc7XG5pbXBvcnQgZmlsZTQwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci5qcyc7XG5pbXBvcnQgZmlsZTQxIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLmpzJztcbmltcG9ydCBmaWxlNDIgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMnO1xuaW1wb3J0IGZpbGU0MyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLmpzJztcbmltcG9ydCBmaWxlNDQgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLmpzJztcbmltcG9ydCBmaWxlNDUgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC5qcyc7XG5pbXBvcnQgZmlsZTQ2IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy5qcyc7XG5pbXBvcnQgZmlsZTQ3IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4uanMnO1xuaW1wb3J0IGZpbGU0OCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC5qcyc7XG5pbXBvcnQgZmlsZTQ5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy5qcyc7XG5pbXBvcnQgZmlsZTUwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcuanMnO1xuaW1wb3J0IGZpbGU1MSBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyc7XG5pbXBvcnQgZmlsZTUyIGZyb20gJy4vMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS5qcyc7XG5pbXBvcnQgZmlsZTUzIGZyb20gJy4vMDUtc2hiL3JhaWQvZTFuLmpzJztcbmltcG9ydCBmaWxlNTQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMXMuanMnO1xuaW1wb3J0IGZpbGU1NSBmcm9tICcuLzA1LXNoYi9yYWlkL2Uybi5qcyc7XG5pbXBvcnQgZmlsZTU2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTJzLmpzJztcbmltcG9ydCBmaWxlNTcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lM24uanMnO1xuaW1wb3J0IGZpbGU1OCBmcm9tICcuLzA1LXNoYi9yYWlkL2Uzcy5qcyc7XG5pbXBvcnQgZmlsZTU5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTRuLmpzJztcbmltcG9ydCBmaWxlNjAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNHMuanMnO1xuaW1wb3J0IGZpbGU2MSBmcm9tICcuLzA1LXNoYi9yYWlkL2U1bi5qcyc7XG5pbXBvcnQgZmlsZTYyIGZyb20gJy4vMDUtc2hiL3JhaWQvZTVzLmpzJztcbmltcG9ydCBmaWxlNjMgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNm4uanMnO1xuaW1wb3J0IGZpbGU2NCBmcm9tICcuLzA1LXNoYi9yYWlkL2U2cy5qcyc7XG5pbXBvcnQgZmlsZTY1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTduLmpzJztcbmltcG9ydCBmaWxlNjYgZnJvbSAnLi8wNS1zaGIvcmFpZC9lN3MuanMnO1xuaW1wb3J0IGZpbGU2NyBmcm9tICcuLzA1LXNoYi9yYWlkL2U4bi5qcyc7XG5pbXBvcnQgZmlsZTY4IGZyb20gJy4vMDUtc2hiL3JhaWQvZThzLmpzJztcbmltcG9ydCBmaWxlNjkgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOW4uanMnO1xuaW1wb3J0IGZpbGU3MCBmcm9tICcuLzA1LXNoYi9yYWlkL2U5cy5qcyc7XG5pbXBvcnQgZmlsZTcxIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwbi5qcyc7XG5pbXBvcnQgZmlsZTcyIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwcy5qcyc7XG5pbXBvcnQgZmlsZTczIGZyb20gJy4vMDUtc2hiL3JhaWQvZTExbi5qcyc7XG5pbXBvcnQgZmlsZTc0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExcy5qcyc7XG5pbXBvcnQgZmlsZTc1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEybi5qcyc7XG5pbXBvcnQgZmlsZTc2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEycy5qcyc7XG5pbXBvcnQgZmlsZTc3IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LmpzJztcbmltcG9ydCBmaWxlNzggZnJvbSAnLi8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMnO1xuaW1wb3J0IGZpbGU3OSBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC5qcyc7XG5pbXBvcnQgZmlsZTgwIGZyb20gJy4vMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLmpzJztcbmltcG9ydCBmaWxlODEgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMnO1xuaW1wb3J0IGZpbGU4MiBmcm9tICcuLzA1LXNoYi90cmlhbC9oYWRlcy5qcyc7XG5pbXBvcnQgZmlsZTgzIGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC5qcyc7XG5pbXBvcnQgZmlsZTg0IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS5qcyc7XG5pbXBvcnQgZmlsZTg1IGZyb20gJy4vMDUtc2hiL3RyaWFsL2xldmktdW4uanMnO1xuaW1wb3J0IGZpbGU4NiBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi1leC5qcyc7XG5pbXBvcnQgZmlsZTg3IGZyb20gJy4vMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLmpzJztcbmltcG9ydCBmaWxlODggZnJvbSAnLi8wNS1zaGIvdHJpYWwvc2hpdmEtdW4uanMnO1xuaW1wb3J0IGZpbGU4OSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLmpzJztcbmltcG9ydCBmaWxlOTAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC5qcyc7XG5pbXBvcnQgZmlsZTkxIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuLXVuLmpzJztcbmltcG9ydCBmaWxlOTIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdmFyaXMtZXguanMnO1xuaW1wb3J0IGZpbGU5MyBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wuanMnO1xuaW1wb3J0IGZpbGU5NCBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wtZXguanMnO1xuaW1wb3J0IGZpbGU5NSBmcm9tICcuLzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCB7JzAwLW1pc2MvYnVmZnMuanMnOiBmaWxlMCwnMDAtbWlzYy9nZW5lcmFsLmpzJzogZmlsZTEsJzAwLW1pc2MvdGVzdC5qcyc6IGZpbGUyLCcwMi1hcnIvdHJpYWwvaWZyaXQtbm0uanMnOiBmaWxlMywnMDItYXJyL3RyaWFsL3RpdGFuLW5tLmpzJzogZmlsZTQsJzAyLWFyci90cmlhbC9sZXZpLWV4LmpzJzogZmlsZTUsJzAyLWFyci90cmlhbC9zaGl2YS1obS5qcyc6IGZpbGU2LCcwMi1hcnIvdHJpYWwvc2hpdmEtZXguanMnOiBmaWxlNywnMDItYXJyL3RyaWFsL3RpdGFuLWhtLmpzJzogZmlsZTgsJzAyLWFyci90cmlhbC90aXRhbi1leC5qcyc6IGZpbGU5LCcwMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkuanMnOiBmaWxlMTAsJzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzJzogZmlsZTExLCcwMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLmpzJzogZmlsZTEyLCcwMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC5qcyc6IGZpbGUxMywnMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMnOiBmaWxlMTQsJzAzLWh3L3JhaWQvYTEybi5qcyc6IGZpbGUxNSwnMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28uanMnOiBmaWxlMTYsJzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMnOiBmaWxlMTcsJzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS5qcyc6IGZpbGUxOCwnMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLmpzJzogZmlsZTE5LCcwNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMnOiBmaWxlMjAsJzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LmpzJzogZmlsZTIxLCcwNC1zYi9kdW5nZW9uL3RoZV9idXJuLmpzJzogZmlsZTIyLCcwNC1zYi9yYWlkL28xbi5qcyc6IGZpbGUyMywnMDQtc2IvcmFpZC9vMm4uanMnOiBmaWxlMjQsJzA0LXNiL3JhaWQvbzNuLmpzJzogZmlsZTI1LCcwNC1zYi9yYWlkL280bi5qcyc6IGZpbGUyNiwnMDQtc2IvcmFpZC9vNHMuanMnOiBmaWxlMjcsJzA0LXNiL3JhaWQvbzdzLmpzJzogZmlsZTI4LCcwNC1zYi9yYWlkL28xMnMuanMnOiBmaWxlMjksJzA0LXNiL3RyaWFsL2J5YWtrby1leC5qcyc6IGZpbGUzMCwnMDQtc2IvdHJpYWwvc2hpbnJ5dS5qcyc6IGZpbGUzMSwnMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzJzogZmlsZTMyLCcwNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLmpzJzogZmlsZTMzLCcwNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLmpzJzogZmlsZTM0LCcwNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzJzogZmlsZTM1LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLmpzJzogZmlsZTM2LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2guanMnOiBmaWxlMzcsJzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMnOiBmaWxlMzgsJzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QuanMnOiBmaWxlMzksJzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIuanMnOiBmaWxlNDAsJzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyc6IGZpbGU0MSwnMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LmpzJzogZmlsZTQyLCcwNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC5qcyc6IGZpbGU0MywnMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyc6IGZpbGU0NCwnMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QuanMnOiBmaWxlNDUsJzA1LXNoYi9kdW5nZW9uL210X2d1bGcuanMnOiBmaWxlNDYsJzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzJzogZmlsZTQ3LCcwNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwuanMnOiBmaWxlNDgsJzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MuanMnOiBmaWxlNDksJzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzJzogZmlsZTUwLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUuanMnOiBmaWxlNTEsJzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UuanMnOiBmaWxlNTIsJzA1LXNoYi9yYWlkL2Uxbi5qcyc6IGZpbGU1MywnMDUtc2hiL3JhaWQvZTFzLmpzJzogZmlsZTU0LCcwNS1zaGIvcmFpZC9lMm4uanMnOiBmaWxlNTUsJzA1LXNoYi9yYWlkL2Uycy5qcyc6IGZpbGU1NiwnMDUtc2hiL3JhaWQvZTNuLmpzJzogZmlsZTU3LCcwNS1zaGIvcmFpZC9lM3MuanMnOiBmaWxlNTgsJzA1LXNoYi9yYWlkL2U0bi5qcyc6IGZpbGU1OSwnMDUtc2hiL3JhaWQvZTRzLmpzJzogZmlsZTYwLCcwNS1zaGIvcmFpZC9lNW4uanMnOiBmaWxlNjEsJzA1LXNoYi9yYWlkL2U1cy5qcyc6IGZpbGU2MiwnMDUtc2hiL3JhaWQvZTZuLmpzJzogZmlsZTYzLCcwNS1zaGIvcmFpZC9lNnMuanMnOiBmaWxlNjQsJzA1LXNoYi9yYWlkL2U3bi5qcyc6IGZpbGU2NSwnMDUtc2hiL3JhaWQvZTdzLmpzJzogZmlsZTY2LCcwNS1zaGIvcmFpZC9lOG4uanMnOiBmaWxlNjcsJzA1LXNoYi9yYWlkL2U4cy5qcyc6IGZpbGU2OCwnMDUtc2hiL3JhaWQvZTluLmpzJzogZmlsZTY5LCcwNS1zaGIvcmFpZC9lOXMuanMnOiBmaWxlNzAsJzA1LXNoYi9yYWlkL2UxMG4uanMnOiBmaWxlNzEsJzA1LXNoYi9yYWlkL2UxMHMuanMnOiBmaWxlNzIsJzA1LXNoYi9yYWlkL2UxMW4uanMnOiBmaWxlNzMsJzA1LXNoYi9yYWlkL2UxMXMuanMnOiBmaWxlNzQsJzA1LXNoYi9yYWlkL2UxMm4uanMnOiBmaWxlNzUsJzA1LXNoYi9yYWlkL2UxMnMuanMnOiBmaWxlNzYsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyc6IGZpbGU3NywnMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLmpzJzogZmlsZTc4LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXguanMnOiBmaWxlNzksJzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyc6IGZpbGU4MCwnMDUtc2hiL3RyaWFsL2hhZGVzLWV4LmpzJzogZmlsZTgxLCcwNS1zaGIvdHJpYWwvaGFkZXMuanMnOiBmaWxlODIsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMnOiBmaWxlODMsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UuanMnOiBmaWxlODQsJzA1LXNoYi90cmlhbC9sZXZpLXVuLmpzJzogZmlsZTg1LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMnOiBmaWxlODYsJzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi5qcyc6IGZpbGU4NywnMDUtc2hiL3RyaWFsL3NoaXZhLXVuLmpzJzogZmlsZTg4LCcwNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyc6IGZpbGU4OSwnMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXguanMnOiBmaWxlOTAsJzA1LXNoYi90cmlhbC90aXRhbi11bi5qcyc6IGZpbGU5MSwnMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzJzogZmlsZTkyLCcwNS1zaGIvdHJpYWwvd29sLmpzJzogZmlsZTkzLCcwNS1zaGIvdHJpYWwvd29sLWV4LmpzJzogZmlsZTk0LCcwNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzJzogZmlsZTk1LH07Il0sInNvdXJjZVJvb3QiOiIifQ==